'use strict';

/* =========================================================================
   CAMPAIGN — Army roster, capacity/equipment upgrades, and a level-based
   combat campaign. Reads/writes state.army inside the same save object
   game.js owns (window.Game.getState()/saveState()), and reuses game.js's
   global helpers (clamp, RESOURCE_META, fmtMoney) since classic <script>
   tags share one top-level scope.
   Exposes window.ArmyModule = { ensureState } for game.js's init() hook.
   ========================================================================= */

const BASE_INFANTRY_CAP = 3;
const ARMORY_SCALE = 1.20;
const UPGRADE_SCALE = 1.15;
const RECRUIT_SCALE = 1.15;
const REGEN_INTERVAL_MS = 3000;
const REGEN_RATE = 0.005; // fraction of max HP healed per regen tick

const UNIT_DEFS = {
  infantry: { label: 'Infantry', icon: '🪖', base: { hp: 50, atk: 8, def: 4 }, cost: { money: 300, trainedPersonnel: 5 } },
  armor: { label: 'Armor', icon: '🛡️', base: { hp: 150, atk: 20, def: 15 }, cost: { money: 1200, trainedPersonnel: 8, logistics: 15 } },
  air: { label: 'Air', icon: '✈️', base: { hp: 70, atk: 25, def: 6 }, cost: { money: 1800, trainedPersonnel: 6, fuel: 20, intel: 5 } },
};

const UPGRADE_DEFS = {
  armySize: { label: 'Army Size', effect: '+1 Infantry capacity', cost: { money: 200, trainedPersonnel: 3 }, scale: UPGRADE_SCALE },
  motorDepot: { label: 'Motor Depot', effect: '+1 Armor capacity', firstLabel: 'Unlock Motor Depot', cost: { money: 800, logistics: 10 }, scale: UPGRADE_SCALE },
  hangar: { label: 'Hangar', effect: '+1 Air capacity', firstLabel: 'Unlock Hangar', cost: { money: 1500, fuel: 20, intel: 5 }, scale: UPGRADE_SCALE },
  armory: { label: 'Armory', effect: '+1 equipment slot, every unit', cost: { money: 600, logistics: 10 }, scale: ARMORY_SCALE },
};

const EQUIP_TIERS = [
  { tier: 1, label: 'Kit I', cost: { money: 250, logistics: 5 }, hpBonus: 15, defBonus: 3 },
  { tier: 2, label: 'Kit II', cost: { money: 700, logistics: 12 }, hpBonus: 35, defBonus: 7 },
  { tier: 3, label: 'Kit III', cost: { money: 1600, logistics: 25 }, hpBonus: 70, defBonus: 14 },
];

const NAME_POOLS = {
  infantry: ['Reyes', 'Chen', 'Okafor', 'Novak', 'Silva', 'Patel', 'Kowalski', 'Diallo', 'Torres', 'Kim', 'Haddad', 'Larsen', 'Mbeki', 'Ivanov', 'Costa'],
  armor: ['Sentinel', 'Warhorse', 'Juggernaut', 'Vanguard', 'Bulwark', 'Titan', 'Ironclad', 'Behemoth'],
  air: ['Falcon', 'Raptor', 'Talon', 'Kestrel', 'Phantom', 'Valkyrie', 'Osprey', 'Condor'],
};

const CAMPAIGN_LEVELS = [
  { id: 1, name: 'Border Skirmish', enemyPower: 35, favoredType: null, xpReward: 30, moneyReward: 200 },
  { id: 2, name: 'Smuggler Convoy', enemyPower: 75, favoredType: null, xpReward: 45, moneyReward: 350 },
  { id: 3, name: 'Insurgent Outpost', enemyPower: 130, favoredType: null, xpReward: 65, moneyReward: 500 },
  { id: 4, name: 'Armed Checkpoint', enemyPower: 200, favoredType: null, xpReward: 90, moneyReward: 700 },
  { id: 5, name: 'Militia Stronghold', enemyPower: 300, favoredType: null, xpReward: 120, moneyReward: 950 },
  { id: 6, name: 'Armored Column', enemyPower: 430, favoredType: 'armor', xpReward: 160, moneyReward: 1250 },
  { id: 7, name: 'Urban Assault', enemyPower: 580, favoredType: null, xpReward: 210, moneyReward: 1600 },
  { id: 8, name: 'Enemy Airfield Raid', enemyPower: 760, favoredType: 'air', xpReward: 270, moneyReward: 2000 },
  { id: 9, name: 'Coastal Defense Line', enemyPower: 970, favoredType: null, xpReward: 340, moneyReward: 2450 },
  { id: 10, name: 'Mountain Pass Ambush', enemyPower: 1220, favoredType: null, xpReward: 420, moneyReward: 2950 },
  { id: 11, name: 'Enemy HQ Perimeter', enemyPower: 1520, favoredType: 'armor', xpReward: 510, moneyReward: 3500 },
  { id: 12, name: 'Air Superiority Wing', enemyPower: 1880, favoredType: 'air', xpReward: 610, moneyReward: 4100 },
  { id: 13, name: 'Fortified Compound', enemyPower: 2300, favoredType: null, xpReward: 720, moneyReward: 4750 },
  { id: 14, name: 'Combined Arms Offensive', enemyPower: 2800, favoredType: null, xpReward: 850, moneyReward: 5500 },
  { id: 15, name: 'Enemy Capital', enemyPower: 3400, favoredType: null, xpReward: 1000, moneyReward: 6500 },
];

const TYPE_ICON = { infantry: '🪖', armor: '🛡️', air: '✈️' };

/* ------------------------------- STATE ----------------------------------- */

function ensureState(state) {
  if (!state.army) {
    state.army = {
      units: [],
      nextUnitId: 1,
      recruitedCount: { infantry: 0, armor: 0, air: 0 },
      upgrades: { armySize: 0, motorDepot: 0, hangar: 0, armory: 0 },
      levelsWon: {},
      stats: { battlesFought: 0, battlesWon: 0, totalKia: 0, totalXpEarned: 0, highestLevelCleared: 0 },
    };
  }
  return state.army;
}

function costToString(cost) {
  return Object.entries(cost)
    .map(([r, v]) => (r === 'money' ? window.Game.fmtMoney(v) : `${v} ${RESOURCE_META[r].label}`))
    .join(' + ');
}

function canAfford(state, cost) {
  for (const r in cost) if ((state.resources[r] || 0) < cost[r]) return false;
  return true;
}

function payCost(state, cost) {
  for (const r in cost) state.resources[r] -= cost[r];
}

/* ---------------------------- UNIT STATS ---------------------------------- */

function effMaxHp(unit) { return unit.base.hp + unit.equip.reduce((s, e) => s + e.hpBonus, 0); }
function effAtk(unit) { return unit.base.atk; }
function effDef(unit) { return unit.base.def + unit.equip.reduce((s, e) => s + e.defBonus, 0); }

function xpToNext(level) { return Math.round(20 * Math.pow(level, 1.4)); }

function grantXp(unit, amount) {
  unit.xp += amount;
  let leveledUp = false;
  while (unit.xp >= xpToNext(unit.level)) {
    unit.xp -= xpToNext(unit.level);
    unit.level++;
    unit.base.hp = Math.round(unit.base.hp * 1.10);
    unit.base.atk = Math.round(unit.base.atk * 1.08);
    unit.base.def = Math.round(unit.base.def * 1.08);
    unit.hp = effMaxHp(unit);
    leveledUp = true;
  }
  return leveledUp;
}

/* --------------------------- CAPACITY / RECRUIT ---------------------------- */

function getCapacity(state, type) {
  const army = ensureState(state);
  if (type === 'infantry') return BASE_INFANTRY_CAP + army.upgrades.armySize;
  if (type === 'armor') return army.upgrades.motorDepot;
  if (type === 'air') return army.upgrades.hangar;
  return 0;
}

function livingCountByType(state, type) {
  return ensureState(state).units.filter((u) => u.alive && u.type === type).length;
}

function getRecruitCost(state, type) {
  const army = ensureState(state);
  const def = UNIT_DEFS[type];
  const scale = Math.pow(RECRUIT_SCALE, army.recruitedCount[type] || 0);
  const cost = {};
  for (const r in def.cost) cost[r] = Math.round(def.cost[r] * scale);
  return cost;
}

function makeUnit(type, army) {
  const pool = NAME_POOLS[type];
  const n = army.nextUnitId++;
  const namePart = pool[n % pool.length];
  const name = type === 'infantry' ? `Pvt. ${namePart}` : type === 'armor' ? `${namePart} #${n}` : `${namePart} Squadron #${n}`;
  const base = { ...UNIT_DEFS[type].base };
  return { id: n, type, name, level: 1, xp: 0, base, equip: [], hp: base.hp, alive: true };
}

function recruitUnit(type) {
  const state = window.Game.getState();
  const army = ensureState(state);
  const cap = getCapacity(state, type);
  if (livingCountByType(state, type) >= cap) {
    showArmyToast(cap === 0 ? 'Locked — buy the unlock upgrade below first.' : 'At capacity — buy an upgrade first.', 'error');
    return;
  }
  const cost = getRecruitCost(state, type);
  if (!canAfford(state, cost)) {
    showArmyToast('Not enough resources to recruit.', 'error');
    return;
  }
  payCost(state, cost);
  army.recruitedCount[type] = (army.recruitedCount[type] || 0) + 1;
  const unit = makeUnit(type, army);
  army.units.push(unit);
  window.Game.saveState();
  renderArmyTab();
  showArmyToast(`${unit.name} recruited.`, 'success');
}

/* -------------------------------- UPGRADES --------------------------------- */

function getUpgradeCost(state, key) {
  const army = ensureState(state);
  const def = UPGRADE_DEFS[key];
  const scale = Math.pow(def.scale, army.upgrades[key] || 0);
  const cost = {};
  for (const r in def.cost) cost[r] = Math.round(def.cost[r] * scale);
  return cost;
}

function buyUpgrade(key) {
  const state = window.Game.getState();
  const army = ensureState(state);
  const cost = getUpgradeCost(state, key);
  if (!canAfford(state, cost)) {
    showArmyToast('Not enough resources.', 'error');
    return;
  }
  payCost(state, cost);
  army.upgrades[key] = (army.upgrades[key] || 0) + 1;
  window.Game.saveState();
  renderArmyTab();
  showArmyToast('Upgrade purchased.', 'success');
}

/* -------------------------------- EQUIPMENT --------------------------------- */

let equipPickerUnitId = null;

function openEquipPicker(unitId) {
  equipPickerUnitId = unitId;
  renderArmyTab();
}

function equipUnit(unitId, tierIndex) {
  const state = window.Game.getState();
  const army = ensureState(state);
  const unit = army.units.find((u) => u.id === unitId);
  if (!unit) return;
  const slotCap = army.upgrades.armory || 0;
  if (unit.equip.length >= slotCap) {
    showArmyToast('No open equipment slots — buy an Armory upgrade.', 'error');
    return;
  }
  const tier = EQUIP_TIERS[tierIndex];
  if (!canAfford(state, tier.cost)) {
    showArmyToast('Not enough resources.', 'error');
    return;
  }
  payCost(state, tier.cost);
  unit.equip.push({ tier: tier.tier, hpBonus: tier.hpBonus, defBonus: tier.defBonus });
  unit.hp += tier.hpBonus; // raising max HP shouldn't make a unit look freshly wounded
  window.Game.saveState();
  equipPickerUnitId = null;
  renderArmyTab();
  showArmyToast(`${tier.label} equipped on ${unit.name}.`, 'success');
}

/* --------------------------------- COMBAT ------------------------------------ */

function unitPower(unit, level) {
  const fav = level.favoredType && level.favoredType === unit.type ? 1.3 : 1;
  return (effAtk(unit) + effDef(unit) * 0.6 + effMaxHp(unit) * 0.08) * fav;
}

function isLevelUnlocked(state, levelId) {
  if (levelId === 1) return true;
  const army = ensureState(state);
  return !!army.levelsWon[levelId - 1];
}

function resolveBattle(state, levelId) {
  const level = CAMPAIGN_LEVELS.find((l) => l.id === levelId);
  const army = ensureState(state);
  const living = army.units.filter((u) => u.alive);
  if (living.length === 0) return { noArmy: true };

  let armyPower = 0;
  for (const u of living) armyPower += unitPower(u, level);
  const ratio = armyPower / level.enemyPower;
  const victory = ratio >= 1;
  // Victories chip away at HP (a bigger power margin means a cleaner win); defeats scale
  // up fast enough to guarantee real casualties once you're badly overmatched — deploying
  // into a fight you have no business winning should be able to wipe your squad, the same
  // way overbuying a Tier 3 building before its supply chain exists wastes your investment.
  const severity = victory
    ? clamp(0.15 - (ratio - 1) * 0.1, 0.05, 0.3)
    : clamp(0.6 + (1 - ratio) * 1.2, 0.6, 2.2);

  const xpPool = victory ? level.xpReward : Math.round(level.xpReward * 0.25);
  const events = [];
  let kiaCount = 0;
  let xpEarned = 0;
  for (const u of living) {
    const variance = 0.6 + Math.random() * 0.8;
    const dmg = Math.max(1, Math.round(effMaxHp(u) * severity * variance));
    u.hp = Math.max(0, u.hp - dmg);
    if (u.hp <= 0) {
      u.alive = false;
      kiaCount++;
      events.push({ name: u.name, type: u.type, kind: 'kia', dmg });
    } else {
      const xpGain = Math.round(xpPool / living.length);
      const leveledUp = grantXp(u, xpGain);
      xpEarned += xpGain;
      events.push({ name: u.name, type: u.type, kind: 'hit', dmg, hpLeft: u.hp, maxHp: effMaxHp(u), xpGain, leveledUp });
    }
  }
  army.units = army.units.filter((u) => u.alive);

  const result = {
    levelId, levelName: level.name, victory,
    armyPower: Math.round(armyPower), enemyPower: level.enemyPower,
    events, kiaCount, moneyReward: victory ? level.moneyReward : 0,
  };

  if (victory) {
    army.levelsWon[levelId] = true;
    window.Game.addCash(level.moneyReward);
    army.stats.highestLevelCleared = Math.max(army.stats.highestLevelCleared || 0, levelId);
  }
  army.stats.battlesFought++;
  if (victory) army.stats.battlesWon++;
  army.stats.totalKia += kiaCount;
  army.stats.totalXpEarned += xpEarned;

  window.Game.saveState();
  return result;
}

/* --------------------------------- REGEN -------------------------------------- */

function regenTick() {
  const state = window.Game && window.Game.getState();
  if (!state) return;
  const army = ensureState(state);
  let changed = false;
  for (const u of army.units) {
    if (!u.alive) continue;
    const max = effMaxHp(u);
    if (u.hp < max) {
      u.hp = Math.min(max, u.hp + Math.max(1, Math.round(max * REGEN_RATE)));
      changed = true;
    }
  }
  if (changed && overlayOpen && currentTab === 'army') renderArmyTab();
}
setInterval(regenTick, REGEN_INTERVAL_MS);

/* --------------------------------- RENDER: ARMY -------------------------------- */

function renderUnitCard(unit, state) {
  const max = effMaxHp(unit);
  const hpPct = Math.round((unit.hp / max) * 100);
  const xpNeed = xpToNext(unit.level);
  const xpPct = Math.round((unit.xp / xpNeed) * 100);
  const army = ensureState(state);
  const slotCap = army.upgrades.armory || 0;
  let slotsHtml = '';
  if (slotCap === 0) {
    slotsHtml = '<span class="no-slots">No equip slots — buy Armory</span>';
  } else {
    for (let i = 0; i < slotCap; i++) {
      const item = unit.equip[i];
      slotsHtml += item
        ? `<div class="equip-slot filled tier${item.tier}" title="+${item.hpBonus} HP / +${item.defBonus} DEF">K${item.tier}</div>`
        : `<div class="equip-slot empty" data-unit="${unit.id}" title="Buy equipment">+</div>`;
    }
  }
  return `<div class="unit-card type-${unit.type} ${hpPct < 30 ? 'low-hp' : ''}">
    <div class="unit-card-head">
      <span class="unit-icon">${TYPE_ICON[unit.type]}</span>
      <span class="unit-name">${unit.name}</span>
      <span class="unit-level">Lv ${unit.level}</span>
    </div>
    <div class="unit-bar-row">
      <span class="unit-bar-label">HP</span>
      <div class="unit-bar-track"><div class="unit-bar-fill hp" style="width:${hpPct}%"></div></div>
      <span class="unit-bar-value">${unit.hp}/${max}</span>
    </div>
    <div class="unit-bar-row">
      <span class="unit-bar-label">XP</span>
      <div class="unit-bar-track"><div class="unit-bar-fill xp" style="width:${xpPct}%"></div></div>
      <span class="unit-bar-value">${unit.xp}/${xpNeed}</span>
    </div>
    <div class="unit-stats-row">ATK ${effAtk(unit)} &middot; DEF ${effDef(unit)}</div>
    <div class="equip-slots-row">${slotsHtml}</div>
  </div>`;
}

function renderArmyTab() {
  const state = window.Game.getState();
  const army = ensureState(state);
  const content = document.getElementById('campaignContent');

  const cap = { infantry: getCapacity(state, 'infantry'), armor: getCapacity(state, 'armor'), air: getCapacity(state, 'air') };
  const living = { infantry: livingCountByType(state, 'infantry'), armor: livingCountByType(state, 'armor'), air: livingCountByType(state, 'air') };

  const recruitCardHtml = (type) => {
    const cost = getRecruitCost(state, type);
    const atCap = living[type] >= cap[type];
    const affordable = canAfford(state, cost);
    return `<div class="recruit-card ${(atCap || !affordable) ? 'disabled' : ''}" data-recruit="${type}">
      <div class="recruit-name">${TYPE_ICON[type]} ${UNIT_DEFS[type].label}</div>
      <div class="recruit-cap">${living[type]} / ${cap[type]}</div>
      <div class="recruit-cost">${cap[type] === 0 ? 'Locked — unlock below' : costToString(cost)}</div>
    </div>`;
  };

  const upgradeCardHtml = (key) => {
    const def = UPGRADE_DEFS[key];
    const owned = army.upgrades[key] || 0;
    const cost = getUpgradeCost(state, key);
    const affordable = canAfford(state, cost);
    const label = owned === 0 && def.firstLabel ? def.firstLabel : def.label;
    return `<div class="upgrade-card ${!affordable ? 'disabled' : ''}" data-upgrade="${key}">
      <div class="upgrade-name">${label}</div>
      <div class="upgrade-effect">${def.effect} &middot; owned: ${owned}</div>
      <div class="upgrade-cost">${costToString(cost)}</div>
    </div>`;
  };

  const statsHtml = `<div class="army-stats-row">
    <div class="stat-chip"><span class="v">${army.stats.battlesWon}/${army.stats.battlesFought}</span><span class="l">Battles Won</span></div>
    <div class="stat-chip"><span class="v">${army.stats.totalKia}</span><span class="l">Total KIA</span></div>
    <div class="stat-chip"><span class="v">${army.stats.totalXpEarned}</span><span class="l">Total XP</span></div>
    <div class="stat-chip"><span class="v">${army.stats.highestLevelCleared}</span><span class="l">Highest Level</span></div>
  </div>`;

  const rosterHtml = army.units.length
    ? army.units.map((u) => renderUnitCard(u, state)).join('')
    : '<div class="panel-note">No units recruited yet. Recruit Infantry above to start your roster.</div>';

  let pickerHtml = '';
  if (equipPickerUnitId != null) {
    const unit = army.units.find((u) => u.id === equipPickerUnitId);
    if (unit) {
      const optionsHtml = EQUIP_TIERS.map((t, i) => {
        const affordable = canAfford(state, t.cost);
        return `<div class="equip-option ${!affordable ? 'disabled' : ''}" data-tier="${i}">
          <div class="eq-opt-name">${t.label}</div>
          <div class="eq-opt-bonus">+${t.hpBonus} HP / +${t.defBonus} DEF</div>
          <div class="eq-opt-cost">${costToString(t.cost)}</div>
        </div>`;
      }).join('');
      pickerHtml = `<div class="equip-picker">
        <div class="equip-picker-title">Equip ${unit.name} — choose a kit</div>
        <div class="equip-picker-options">${optionsHtml}</div>
        <button class="ghost-btn" id="equipPickerCancel">Cancel</button>
      </div>`;
    } else {
      equipPickerUnitId = null;
    }
  }

  content.innerHTML = `
    ${statsHtml}
    <h3 class="campaign-section-title">Recruit</h3>
    <div class="recruit-row">${['infantry', 'armor', 'air'].map(recruitCardHtml).join('')}</div>
    <h3 class="campaign-section-title">Upgrades</h3>
    <div class="upgrade-row">${['armySize', 'motorDepot', 'hangar', 'armory'].map(upgradeCardHtml).join('')}</div>
    <h3 class="campaign-section-title">Roster</h3>
    <div class="roster-grid">${rosterHtml}</div>
    ${pickerHtml}
  `;

  // Listeners attach even to visually-disabled cards: recruitUnit/buyUpgrade/equipUnit
  // already validate capacity/affordability themselves and surface a toast explaining
  // why, so a blocked click should never go silent.
  content.querySelectorAll('.recruit-card').forEach((el) => el.addEventListener('click', () => recruitUnit(el.dataset.recruit)));
  content.querySelectorAll('.upgrade-card').forEach((el) => el.addEventListener('click', () => buyUpgrade(el.dataset.upgrade)));
  content.querySelectorAll('.equip-slot.empty').forEach((el) => el.addEventListener('click', () => openEquipPicker(parseInt(el.dataset.unit, 10))));
  content.querySelectorAll('.equip-option').forEach((el) => el.addEventListener('click', () => equipUnit(equipPickerUnitId, parseInt(el.dataset.tier, 10))));
  const cancelBtn = document.getElementById('equipPickerCancel');
  if (cancelBtn) cancelBtn.addEventListener('click', () => { equipPickerUnitId = null; renderArmyTab(); });
}

/* -------------------------------- RENDER: LEVELS -------------------------------- */

function renderLevelsTab() {
  const state = window.Game.getState();
  const army = ensureState(state);
  const content = document.getElementById('campaignContent');

  const cards = CAMPAIGN_LEVELS.map((level) => {
    const unlocked = isLevelUnlocked(state, level.id);
    const won = !!army.levelsWon[level.id];
    const favIcon = level.favoredType ? TYPE_ICON[level.favoredType] : '';
    return `<div class="level-card ${unlocked ? '' : 'locked'} ${won ? 'won' : ''}" data-level="${level.id}">
      <div class="level-num">LEVEL ${level.id}${unlocked ? '' : ' 🔒'}</div>
      <div class="level-name">${level.name}</div>
      <div class="level-power">Enemy Power: ${level.enemyPower}${favIcon ? ' ' + favIcon : ''}</div>
      <div class="level-reward">Reward: ${window.Game.fmtMoney(level.moneyReward)} + ${level.xpReward} XP</div>
      ${won ? '<div class="level-won-badge">✓ Cleared</div>' : ''}
    </div>`;
  }).join('');

  content.innerHTML = `
    <p class="panel-note">Your entire living roster deploys automatically. A level's favored unit type gets a combat bonus there — diversify your army to match.</p>
    <div class="level-grid">${cards}</div>
  `;
  content.querySelectorAll('.level-card:not(.locked)').forEach((el) => el.addEventListener('click', () => startBattle(parseInt(el.dataset.level, 10))));
}

function startBattle(levelId) {
  const state = window.Game.getState();
  const army = ensureState(state);
  if (army.units.filter((u) => u.alive).length === 0) {
    showArmyToast('You have no living units — recruit some in the Army tab first.', 'error');
    return;
  }
  const content = document.getElementById('campaignContent');
  content.innerHTML = `<div class="battle-anim">
    <div class="battle-anim-text" id="battleAnimText">Approaching objective…</div>
    <div class="battle-anim-bar"><div class="battle-anim-fill"></div></div>
  </div>`;
  const phases = ['Approaching objective…', 'Making contact…', 'Engaging hostiles…', 'Assessing outcome…'];
  let i = 0;
  const textEl = document.getElementById('battleAnimText');
  const phaseTimer = setInterval(() => {
    i++;
    if (i < phases.length && textEl) textEl.textContent = phases[i];
  }, 450);
  setTimeout(() => {
    clearInterval(phaseTimer);
    const result = resolveBattle(state, levelId);
    renderBattleResult(result);
  }, 1900);
}

function renderBattleResult(result) {
  const content = document.getElementById('campaignContent');
  if (result.noArmy) { renderLevelsTab(); return; }

  const bannerCls = result.victory ? 'victory' : 'defeat';
  const eventsHtml = result.events.map((e, idx) => {
    const icon = TYPE_ICON[e.type];
    const line = e.kind === 'kia'
      ? `<span class="battle-log-kia">${icon} ${e.name} — KIA (${e.dmg} dmg)</span>`
      : `<span class="battle-log-hit">${icon} ${e.name} — took ${e.dmg} dmg (${e.hpLeft}/${e.maxHp} HP)${e.xpGain ? ` +${e.xpGain} XP` : ''}${e.leveledUp ? ' <b>LEVEL UP!</b>' : ''}</span>`;
    return `<div class="battle-log-row" style="animation-delay:${idx * 90}ms">${line}</div>`;
  }).join('');

  content.innerHTML = `
    <div class="battle-result ${bannerCls}">
      <div class="battle-banner">${result.victory ? 'VICTORY' : 'DEFEAT'}</div>
      <div class="battle-summary">${result.levelName} &middot; Your Power ${result.armyPower} vs Enemy Power ${result.enemyPower}</div>
      ${result.victory
        ? `<div class="battle-rewards">+${window.Game.fmtMoney(result.moneyReward)} earned</div>`
        : '<div class="battle-rewards defeat-note">No reward — regroup and try again.</div>'}
      <div class="battle-log">${eventsHtml}</div>
      <button class="primary-btn" id="battleContinueBtn">Continue</button>
    </div>
  `;
  document.getElementById('battleContinueBtn').addEventListener('click', renderLevelsTab);
}

/* ----------------------------- OVERLAY / TABS ------------------------------------ */

let currentTab = 'army';
let overlayOpen = false;
let armyToastTimer = null;

function showArmyToast(msg, kind) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast' + (kind ? ' ' + kind : '');
  toast.classList.remove('hidden');
  clearTimeout(armyToastTimer);
  armyToastTimer = setTimeout(() => toast.classList.add('hidden'), 2600);
}

function switchTab(tab) {
  currentTab = tab;
  equipPickerUnitId = null;
  document.getElementById('tabArmyBtn').classList.toggle('active', tab === 'army');
  document.getElementById('tabLevelsBtn').classList.toggle('active', tab === 'levels');
  if (tab === 'army') renderArmyTab(); else renderLevelsTab();
}

function openCampaignOverlay() {
  document.getElementById('campaignOverlay').classList.remove('hidden');
  overlayOpen = true;
  switchTab(currentTab);
}

function closeCampaignOverlay() {
  document.getElementById('campaignOverlay').classList.add('hidden');
  overlayOpen = false;
  equipPickerUnitId = null;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('campaignBtn').addEventListener('click', openCampaignOverlay);
  document.getElementById('campaignCloseBtn').addEventListener('click', closeCampaignOverlay);
  document.getElementById('tabArmyBtn').addEventListener('click', () => switchTab('army'));
  document.getElementById('tabLevelsBtn').addEventListener('click', () => switchTab('levels'));
});

window.ArmyModule = { ensureState };
