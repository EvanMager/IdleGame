'use strict';

/* =========================================================================
   MODERN BASE COMMANDER — core game engine
   Plain JS, no build step. Owns: grid state, buildings, resource-chain
   simulation, save/load + offline catch-up, tutorial, and all base-view UI.
   Exposes `window.Game` with a small surface spanish.js hooks into.
   ========================================================================= */

const GRID_SIZE = 20;
const START_UNLOCKED_SIZE = 6;
const SCALING = 1.15;
const EXPAND_BASE_COST = 150;
const EXPAND_SCALING = 1.045;
const COMMAND_CENTER_BONUS = 0.10; // +10% global output per Command Center at 100 morale
const LANGUAGE_INSTITUTE_BONUS = 0.15; // +15% Duty Shift cash-per-card per Institute, scaled by its throttle
const SPOILS_PER_LEVEL = 1.5; // $/min tribute per cleared campaign level, scaled by level number
const FIELD_HOSPITAL_REGEN_BONUS = 0.5; // +50% Army HP regen rate per Hospital, scaled by its throttle
const WAR_COLLEGE_XP_BONUS = 0.25; // +25% Army XP gain per College, scaled by its throttle
const STARTING_CASH = 4000;
const MAX_OFFLINE_SECONDS = 24 * 60 * 60;
const OFFLINE_STEP_MIN = 1; // simulate offline time in 1-minute steps
const LIVE_TICK_MS = 1000;
const SAVE_KEY = 'mbc_save_v1';
const AUTOSAVE_EVERY_TICKS = 5;

const RESOURCE_ORDER = ['power', 'personnel', 'fuel', 'trainedPersonnel', 'logistics', 'morale', 'intel', 'money'];

const RESOURCE_META = {
  power: { label: 'Power' },
  personnel: { label: 'Personnel' },
  fuel: { label: 'Fuel' },
  intel: { label: 'Intel' },
  trainedPersonnel: { label: 'Trained Personnel' },
  logistics: { label: 'Logistics' },
  money: { label: 'Money' },
};

const BUILDING_TYPES = {
  solar_array: {
    id: 'solar_array', name: 'Solar Array', tier: 1, size: 1, baseCost: 400,
    inputs: {}, outputs: { power: 5, money: 2 }, moraleOutput: 0,
    blurb: 'Raw power generation. No inputs required. Sells surplus capacity back to the grid for a small trickle of cash.',
  },
  wind_farm: {
    id: 'wind_farm', name: 'Wind Farm', tier: 1, size: 1, baseCost: 250,
    inputs: {}, outputs: { power: 2, money: 1 }, moraleOutput: 0,
    blurb: 'Raw power generation. Cheaper than a Solar Array but less efficient per building — a budget top-up, not a scaling play. Sells a little surplus power too.',
  },
  recruit_barracks: {
    id: 'recruit_barracks', name: 'Recruit Barracks', tier: 1, size: 1, baseCost: 400,
    inputs: { power: 1 }, outputs: { personnel: 3, money: 2 }, moraleOutput: 0,
    blurb: 'Recruits new Personnel. Needs Power. Also draws a small recruiting stipend.',
  },
  fuel_depot: {
    id: 'fuel_depot', name: 'Fuel Depot', tier: 1, size: 1, baseCost: 450,
    inputs: { power: 1 }, outputs: { fuel: 4, money: 2 }, moraleOutput: 0,
    blurb: 'Pumps Fuel. Needs Power. Sells surplus fuel for a small trickle of cash.',
  },
  aux_fuel_cache: {
    id: 'aux_fuel_cache', name: 'Auxiliary Fuel Cache', tier: 1, size: 1, baseCost: 300,
    inputs: { power: 1 }, outputs: { fuel: 2, money: 1 }, moraleOutput: 0,
    blurb: 'Pumps Fuel. Needs Power. Cheaper than a Fuel Depot but less efficient per building. Sells a little surplus fuel too.',
  },
  motor_pool: {
    id: 'motor_pool', name: 'Motor Pool', tier: 2, size: 1, baseCost: 1000,
    inputs: { fuel: 3, personnel: 2 }, outputs: { logistics: 4 }, moraleOutput: 0,
    blurb: 'Converts Fuel + Personnel into Logistics.',
  },
  training_ground: {
    id: 'training_ground', name: 'Training Ground', tier: 2, size: 1, baseCost: 1100,
    inputs: { personnel: 3, power: 2 }, outputs: { trainedPersonnel: 2 }, moraleOutput: 2,
    blurb: 'Converts Personnel into Trained Personnel. Boosts Morale.',
  },
  mess_hall: {
    id: 'mess_hall', name: 'Mess Hall / PX', tier: 2, size: 1, baseCost: 750,
    inputs: { personnel: 2, fuel: 1 }, outputs: {}, moraleOutput: 3,
    blurb: 'Feeds the base. Boosts Morale, no material output.',
  },
  language_institute: {
    id: 'language_institute', name: 'Language Institute', tier: 2, size: 1, baseCost: 2200,
    inputs: { trainedPersonnel: 2 }, outputs: {}, moraleOutput: 0,
    specialEffect: `+${Math.round(LANGUAGE_INSTITUTE_BONUS * 100)}% Duty Shift $/card`,
    blurb: 'Trains translators. Raises Duty Shift cash-per-card, scaled by how well-supplied it is.',
  },
  refinery: {
    id: 'refinery', name: 'Refinery', tier: 2, size: 1, baseCost: 1300,
    inputs: { power: 3, fuel: 4 }, outputs: { logistics: 5 }, moraleOutput: 0,
    blurb: 'Converts Power + Fuel into Logistics. An alternate path that skips Personnel entirely.',
  },
  recon_station: {
    id: 'recon_station', name: 'Recon Station', tier: 2, size: 1, baseCost: 1600,
    inputs: { power: 2 }, outputs: { intel: 1 }, moraleOutput: 0,
    blurb: 'Gathers Intel directly from Power — a slow trickle, but the only Intel source that doesn’t require an Airfield first.',
  },
  field_hospital: {
    id: 'field_hospital', name: 'Field Hospital', tier: 2, size: 1, baseCost: 1800,
    inputs: { trainedPersonnel: 1 }, outputs: {}, moraleOutput: 0,
    specialEffect: `+${Math.round(FIELD_HOSPITAL_REGEN_BONUS * 100)}% Army HP regen`,
    blurb: 'Speeds up how fast wounded Army units recover HP between deployments, scaled by how well-supplied it is.',
  },
  war_college: {
    id: 'war_college', name: 'War College', tier: 2, size: 1, baseCost: 2200,
    inputs: { trainedPersonnel: 2 }, outputs: {}, moraleOutput: 0,
    specialEffect: `+${Math.round(WAR_COLLEGE_XP_BONUS * 100)}% Army XP gain`,
    blurb: 'Sharpens combat doctrine. Boosts XP earned by Army units in battle, scaled by how well-supplied it is.',
  },
  airfield: {
    id: 'airfield', name: 'Airfield', tier: 3, size: 2, baseCost: 3800,
    inputs: { fuel: 4, trainedPersonnel: 3, logistics: 3 }, outputs: { money: 40, intel: 2 }, moraleOutput: 0,
    blurb: 'Revenue building. Needs Fuel + Trained Personnel + Logistics.',
  },
  command_center: {
    id: 'command_center', name: 'Command Center', tier: 3, size: 2, baseCost: 6500,
    inputs: { intel: 2, trainedPersonnel: 2 }, outputs: { money: 60 }, moraleOutput: 0,
    blurb: 'Revenue building. Needs Intel + Trained Personnel. Grants a base-wide output bonus that scales with Morale.',
  },
  black_market: {
    id: 'black_market', name: 'Black Market', tier: 3, size: 2, baseCost: 3200,
    inputs: { fuel: 5, logistics: 4 }, outputs: { money: 55 }, moraleOutput: 0,
    blurb: 'Revenue building. Needs Fuel + Logistics. The cheapest cash-out path — skips Trained Personnel and Intel entirely.',
  },
  intel_brokerage: {
    id: 'intel_brokerage', name: 'Intel Brokerage', tier: 3, size: 2, baseCost: 4400,
    inputs: { intel: 3, trainedPersonnel: 2 }, outputs: { money: 65 }, moraleOutput: 0,
    blurb: 'Revenue building. Needs Intel + Trained Personnel — competes directly with Command Center for both.',
  },
  contractor_hq: {
    id: 'contractor_hq', name: 'Contractor HQ', tier: 3, size: 2, baseCost: 5000,
    inputs: { trainedPersonnel: 3, logistics: 5 }, outputs: { money: 70 }, moraleOutput: 0,
    blurb: 'Revenue building. Needs Trained Personnel + Logistics — draws on both major intermediate pools at once.',
  },
  arms_export_terminal: {
    id: 'arms_export_terminal', name: 'Arms Export Terminal', tier: 3, size: 2, baseCost: 4800,
    inputs: { fuel: 6, trainedPersonnel: 2 }, outputs: { money: 72 }, moraleOutput: 0,
    blurb: 'Revenue building. Needs Fuel + Trained Personnel. High yield, fuel-hungry.',
  },
  cyber_ops_center: {
    id: 'cyber_ops_center', name: 'Cyber Operations Center', tier: 3, size: 2, baseCost: 5600,
    inputs: { intel: 4, power: 5 }, outputs: { money: 85 }, moraleOutput: 0,
    blurb: 'Revenue building. Needs Intel + Power — the only revenue building that draws on Power directly.',
  },
  salvage_yard: {
    id: 'salvage_yard', name: 'Salvage Yard', tier: 3, size: 2, baseCost: 2800,
    inputs: { logistics: 6 }, outputs: { money: 45 }, moraleOutput: 0,
    blurb: 'Revenue building. Needs only Logistics — the cheapest, simplest way into Tier 3.',
  },
};

const BUILD_ORDER = [
  'solar_array', 'wind_farm', 'recruit_barracks', 'fuel_depot', 'aux_fuel_cache',
  'motor_pool', 'training_ground', 'mess_hall', 'language_institute', 'refinery', 'recon_station', 'field_hospital', 'war_college',
  'airfield', 'command_center', 'black_market', 'intel_brokerage', 'contractor_hq', 'arms_export_terminal', 'cyber_ops_center', 'salvage_yard',
];

// Precompute resource -> [producer types] / [consumer types], once.
const BUILDING_PRODUCERS = {};
const BUILDING_CONSUMERS = {};
for (const type of BUILD_ORDER) {
  const def = BUILDING_TYPES[type];
  for (const res in def.outputs) {
    (BUILDING_PRODUCERS[res] = BUILDING_PRODUCERS[res] || []).push(type);
  }
  if (def.moraleOutput) {
    (BUILDING_PRODUCERS['morale'] = BUILDING_PRODUCERS['morale'] || []).push(type);
  }
  for (const res in def.inputs) {
    (BUILDING_CONSUMERS[res] = BUILDING_CONSUMERS[res] || []).push(type);
  }
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function fmt(n) {
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return (Math.round(n * 10) / 10).toString();
}
function fmtMoney(n) { return '$' + Math.floor(n).toLocaleString(); }
function fmtRate(n) {
  const sign = n > 0.005 ? '+' : (n < -0.005 ? '' : '');
  return sign + (Math.round(n * 10) / 10) + '/min';
}

/* ------------------------------- STATE ---------------------------------- */

let state = null;

function freshState() {
  const start = Math.floor((GRID_SIZE - START_UNLOCKED_SIZE) / 2);
  const grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const inStart = x >= start && x < start + START_UNLOCKED_SIZE && y >= start && y < start + START_UNLOCKED_SIZE;
      row.push(inStart ? 1 : 0);
    }
    grid.push(row);
  }
  return {
    version: 1,
    grid,
    unlockedCount: START_UNLOCKED_SIZE * START_UNLOCKED_SIZE,
    buildings: [], // {id, type, x, y}
    nextBuildingId: 1,
    resources: { power: 0, personnel: 0, fuel: 0, trainedPersonnel: 0, logistics: 0, intel: 0, morale: 0, money: STARTING_CASH },
    lastSaved: Date.now(),
    tutorial: { step: 0, done: false },
    spanish: { sets: {}, totalCorrect: 0, totalAttempts: 0 },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.grid || !parsed.resources) return null;
    return parsed;
  } catch (e) {
    console.warn('Failed to load save', e);
    return null;
  }
}

function saveState() {
  state.lastSaved = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save', e);
  }
}

/* ---------------------------- SIMULATION --------------------------------- */

// dtMin: elapsed time for this step, in minutes (building rates are per-minute).
// Returns a summary of {produced, consumed} per resource for UI / offline report.
//
// Two-phase design, required for correctness: a building can depend on inputs
// from different points in the resource DAG (e.g. Training Ground needs both
// Power, resolved immediately, and Personnel, resolved one step later). If a
// building's throttle were memoized the first time any one of its inputs is
// touched, it could lock in a value computed before a slower-resolving input's
// true scarcity is known. So: Phase 1 walks resources in topological order and
// only resolves per-resource scarcity ratios (never a building's overall
// throttle). Phase 2 then computes each building's final throttle — the min
// ratio across ALL of its inputs — only once every ratio is known, and applies
// it uniformly to that building's production and consumption.
function simulateTick(st, dtMin) {
  const counts = {};
  for (const b of st.buildings) counts[b.type] = (counts[b.type] || 0) + 1;

  const morale = st.resources.morale;
  const ccCount = counts['command_center'] || 0;
  const multiplier = 1 + ccCount * COMMAND_CENTER_BONUS * (morale / 100);

  const ratio = {}; // resource -> 0..1 scarcity ratio (1 = fully supplied)
  const producerThrottleCache = {}; // building type -> throttle, valid ONLY for computing another resource's supply within phase 1

  function getProducerThrottle(type) {
    if (producerThrottleCache[type] !== undefined) return producerThrottleCache[type];
    const def = BUILDING_TYPES[type];
    let t = 1;
    for (const res in def.inputs) {
      const r = ratio[res] !== undefined ? ratio[res] : 1;
      if (r < t) t = r;
    }
    producerThrottleCache[type] = t;
    return t;
  }

  // Phase 1: resolve ratio[res] for every material resource, in dependency order.
  for (const res of RESOURCE_ORDER) {
    if (res === 'morale') continue; // nothing consumes morale; handled in phase 2
    let prod = 0;
    for (const type of (BUILDING_PRODUCERS[res] || [])) {
      const n = counts[type] || 0;
      if (!n) continue;
      const rate = BUILDING_TYPES[type].outputs[res];
      if (!rate) continue;
      prod += n * rate * dtMin * getProducerThrottle(type) * multiplier;
    }
    let nominalDemand = 0;
    for (const type of (BUILDING_CONSUMERS[res] || [])) {
      const n = counts[type] || 0;
      if (!n) continue;
      nominalDemand += n * BUILDING_TYPES[type].inputs[res] * dtMin;
    }
    const available = st.resources[res] + prod;
    ratio[res] = nominalDemand > 0 ? Math.min(1, available / nominalDemand) : 1;
  }

  // Phase 2: every ratio is now final, so each building's true throttle (min
  // across ALL its inputs) can be computed once, correctly, in any order.
  const finalThrottle = {};
  for (const type of BUILD_ORDER) {
    const def = BUILDING_TYPES[type];
    let t = 1;
    for (const res in def.inputs) {
      const r = ratio[res] !== undefined ? ratio[res] : 1;
      if (r < t) t = r;
    }
    finalThrottle[type] = t;
  }

  const producedTotals = {};
  const consumedTotals = {};

  for (const res of RESOURCE_ORDER) {
    if (res === 'morale') {
      let prod = 0;
      for (const type of (BUILDING_PRODUCERS['morale'] || [])) {
        const n = counts[type] || 0;
        if (!n) continue;
        prod += n * BUILDING_TYPES[type].moraleOutput * dtMin * finalThrottle[type] * multiplier;
      }
      producedTotals.morale = prod;
      st.resources.morale = clamp(st.resources.morale + prod, 0, 100);
      continue;
    }

    let prod = 0;
    for (const type of (BUILDING_PRODUCERS[res] || [])) {
      const n = counts[type] || 0;
      if (!n) continue;
      const rate = BUILDING_TYPES[type].outputs[res];
      if (!rate) continue;
      prod += n * rate * dtMin * finalThrottle[type] * multiplier;
    }
    if (res === 'money' && st.army && st.army.levelsWon) {
      // "Spoils of war": each cleared campaign level pays a small ongoing tribute, scaled by
      // level number. Lives in the core tick (not a separate interval) so it accrues correctly
      // during offline catch-up too, exactly like every other income source.
      let spoils = 0;
      for (const idStr in st.army.levelsWon) {
        if (st.army.levelsWon[idStr]) spoils += Number(idStr) * SPOILS_PER_LEVEL;
      }
      prod += spoils * dtMin;
    }
    let cons = 0;
    for (const type of (BUILDING_CONSUMERS[res] || [])) {
      const n = counts[type] || 0;
      if (!n) continue;
      cons += n * BUILDING_TYPES[type].inputs[res] * dtMin * finalThrottle[type];
    }
    producedTotals[res] = prod;
    consumedTotals[res] = cons;
    st.resources[res] = Math.max(0, st.resources[res] + prod - cons);
  }

  st._lastThrottle = finalThrottle;
  st._lastMultiplier = multiplier;
  return { produced: producedTotals, consumed: consumedTotals };
}

function countByType(type) {
  let n = 0;
  for (const b of state.buildings) if (b.type === type) n++;
  return n;
}

function getBuildingCost(type) {
  const def = BUILDING_TYPES[type];
  const owned = countByType(type);
  return Math.round(def.baseCost * Math.pow(SCALING, owned));
}

function getExpandCost() {
  const extra = state.unlockedCount - START_UNLOCKED_SIZE * START_UNLOCKED_SIZE;
  return Math.round(EXPAND_BASE_COST * Math.pow(EXPAND_SCALING, extra));
}

function getLanguageInstituteBonus() {
  const n = countByType('language_institute');
  if (n === 0) return 0;
  const throttle = (state._lastThrottle && state._lastThrottle.language_institute !== undefined) ? state._lastThrottle.language_institute : 1;
  return n * LANGUAGE_INSTITUTE_BONUS * throttle;
}

/* ----------------------------- GRID HELPERS ------------------------------ */

function inBounds(x, y) { return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE; }
function isUnlocked(x, y) { return inBounds(x, y) && state.grid[y][x] === 1; }

// Map of "x,y" -> building, covering every occupied cell (including secondary cells of 2x2s).
function buildOccupancyMap() {
  const map = {};
  for (const b of state.buildings) {
    const def = BUILDING_TYPES[b.type];
    for (let dy = 0; dy < def.size; dy++) {
      for (let dx = 0; dx < def.size; dx++) {
        map[(b.x + dx) + ',' + (b.y + dy)] = b;
      }
    }
  }
  return map;
}

function canPlaceAt(type, x, y) {
  const def = BUILDING_TYPES[type];
  const occ = buildOccupancyMap();
  for (let dy = 0; dy < def.size; dy++) {
    for (let dx = 0; dx < def.size; dx++) {
      const tx = x + dx, ty = y + dy;
      if (!isUnlocked(tx, ty)) return false;
      if (occ[tx + ',' + ty]) return false;
    }
  }
  return true;
}

function isExpandable(x, y) {
  if (!inBounds(x, y) || state.grid[y][x] === 1) return false;
  const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
  return neighbors.some(([nx, ny]) => isUnlocked(nx, ny));
}

/* ------------------------------- UI STATE -------------------------------- */

let selectedBuildType = null; // when in "placing" mode
let expandMode = false;
let selectedTile = null; // {x,y} for info panel
let tickCounter = 0;
let liveTimer = null;

const el = {};
function cacheEls() {
  el.cashValue = document.getElementById('cashValue');
  el.resourceBar = document.getElementById('resourceBar');
  el.buildingList = document.getElementById('buildingList');
  el.expandModeBtn = document.getElementById('expandModeBtn');
  el.expandInfo = document.getElementById('expandInfo');
  el.grid = document.getElementById('grid');
  el.selectedInfo = document.getElementById('selectedInfo');
  el.toast = document.getElementById('toast');
  el.dutyShiftBtn = document.getElementById('dutyShiftBtn');
  el.helpBtn = document.getElementById('helpBtn');
  el.resetBtn = document.getElementById('resetBtn');
  el.welcomeBackOverlay = document.getElementById('welcomeBackOverlay');
  el.welcomeBackText = document.getElementById('welcomeBackText');
  el.welcomeBackCloseBtn = document.getElementById('welcomeBackCloseBtn');
}

let toastTimer = null;
function showToast(msg, kind) {
  el.toast.textContent = msg;
  el.toast.className = 'toast' + (kind ? ' ' + kind : '');
  el.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.add('hidden'), 2600);
}

/* ------------------------------ RENDERING -------------------------------- */

const tileEls = []; // [y][x] -> element

function buildGridDom() {
  el.grid.innerHTML = '';
  for (let y = 0; y < GRID_SIZE; y++) {
    tileEls.push([]);
    for (let x = 0; x < GRID_SIZE; x++) {
      const div = document.createElement('div');
      div.className = 'tile';
      div.dataset.x = x;
      div.dataset.y = y;
      div.addEventListener('click', () => onTileClick(x, y));
      el.grid.appendChild(div);
      tileEls[y].push(div);
    }
  }
}

function renderGrid() {
  const occ = buildOccupancyMap();
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const div = tileEls[y][x];
      const b = occ[x + ',' + y];
      let cls = 'tile';
      div.textContent = '';
      if (b) {
        const def = BUILDING_TYPES[b.type];
        const isOrigin = b.x === x && b.y === y;
        cls += ' building b-' + b.type + (isOrigin ? ' origin' : ' secondary') + ' tier' + def.tier;
        const throttle = (state._lastThrottle && state._lastThrottle[b.type] !== undefined) ? state._lastThrottle[b.type] : 1;
        if (throttle < 0.999) cls += ' throttled';
        if (isOrigin) div.textContent = shortCode(b.type);
      } else if (state.grid[y][x] === 1) {
        cls += ' unlocked empty';
        if (selectedBuildType) {
          cls += canPlaceAt(selectedBuildType, x, y) ? ' buildable-target' : ' buildable-invalid';
        }
      } else {
        cls += ' locked';
        if (expandMode && isExpandable(x, y)) cls += ' expandable';
      }
      div.className = cls;
    }
  }
}

function shortCode(type) {
  return {
    solar_array: 'SOL', wind_farm: 'WND', recruit_barracks: 'BAR', fuel_depot: 'FUE', aux_fuel_cache: 'AUX',
    motor_pool: 'MTR', training_ground: 'TRN', mess_hall: 'PX', language_institute: 'LNG',
    refinery: 'REF', recon_station: 'RCN', field_hospital: 'HSP', war_college: 'WAR',
    airfield: 'AIR', command_center: 'CMD',
    black_market: 'BLK', intel_brokerage: 'INT', contractor_hq: 'PMC', arms_export_terminal: 'EXP',
    cyber_ops_center: 'CYB', salvage_yard: 'SLV',
  }[type] || '?';
}

function renderResourceBar() {
  el.cashValue.textContent = fmtMoney(state.resources.money);
  const rate = state._lastRateReport || {};
  let html = '';
  const order = ['power', 'personnel', 'fuel', 'trainedPersonnel', 'logistics', 'intel'];
  for (const res of order) {
    const val = state.resources[res] || 0;
    const r = rate[res] || 0;
    const rc = r > 0.05 ? 'pos' : (r < -0.05 ? 'neg' : 'zero');
    html += `<div class="res-pill">
      <span class="res-name">${RESOURCE_META[res].label}</span>
      <span class="res-value">${fmt(val)}</span>
      <span class="res-rate ${rc}">${fmtRate(r)}</span>
    </div>`;
  }
  html += `<div class="res-pill morale-pill">
    <span class="res-name">Morale</span>
    <span class="res-value">${Math.round(state.resources.morale)}/100</span>
    <div class="morale-bar-track"><div class="morale-bar-fill" style="width:${state.resources.morale}%"></div></div>
  </div>`;
  el.resourceBar.innerHTML = html;
}

function currentTutorialTargetBuilding() {
  if (!state || state.tutorial.done) return null;
  const step = TUTORIAL_STEPS[state.tutorial.step];
  return step && step.requireBuilding ? step.requireBuilding : null;
}

function renderBuildPanel() {
  let html = '';
  const tutorialTarget = currentTutorialTargetBuilding();
  for (const type of BUILD_ORDER) {
    const def = BUILDING_TYPES[type];
    const cost = getBuildingCost(type);
    const affordable = state.resources.money >= cost;
    const owned = countByType(type);
    let cls = 'build-card tier' + def.tier;
    if (selectedBuildType === type) cls += ' selected';
    if (!affordable) cls += ' unaffordable';
    if (tutorialTarget === type) cls += ' tutorial-target';
    const ioParts = [];
    for (const r in def.inputs) ioParts.push(`<span class="in">-${def.inputs[r]} ${RESOURCE_META[r].label}/min</span>`);
    for (const r in def.outputs) ioParts.push(`<span class="out">+${def.outputs[r]} ${RESOURCE_META[r].label}/min</span>`);
    if (def.moraleOutput) ioParts.push(`<span class="out">+${def.moraleOutput} Morale/min</span>`);
    if (def.specialEffect) ioParts.push(`<span class="out">${def.specialEffect}</span>`);
    html += `<div class="${cls}" data-type="${type}">
      <div class="build-card-head">
        <span class="build-card-name">${def.name}</span>
        <span class="build-card-cost">${fmtMoney(cost)}</span>
      </div>
      <div class="build-card-io">${ioParts.join(' &nbsp;·&nbsp; ')}</div>
      <div class="build-card-size">Tier ${def.tier} &middot; ${def.size}×${def.size} tile${def.size > 1 ? 's' : ''} &middot; owned: ${owned}</div>
    </div>`;
  }
  el.buildingList.innerHTML = html;
  el.buildingList.querySelectorAll('.build-card').forEach(card => {
    card.addEventListener('click', () => onBuildCardClick(card.dataset.type));
  });
}

function renderExpandInfo() {
  const cost = getExpandCost();
  el.expandInfo.textContent = expandMode
    ? `Click a highlighted tile to unlock it for ${fmtMoney(cost)}.`
    : `Next tile costs ${fmtMoney(cost)}. Unlocked: ${state.unlockedCount}/${GRID_SIZE * GRID_SIZE} tiles.`;
  el.expandModeBtn.classList.toggle('active', expandMode);
}

function renderInfoPanel() {
  if (!selectedTile) {
    el.selectedInfo.innerHTML = 'Select a tile or building on the grid to inspect it.';
    return;
  }
  const { x, y } = selectedTile;
  const occ = buildOccupancyMap();
  const b = occ[x + ',' + y];
  if (b) {
    const def = BUILDING_TYPES[b.type];
    const throttle = (state._lastThrottle && state._lastThrottle[b.type] !== undefined) ? state._lastThrottle[b.type] : 1;
    const pct = Math.round(throttle * 100);
    let fillCls = 'throttle-fill';
    if (throttle < 0.4) fillCls += ' low'; else if (throttle < 0.85) fillCls += ' mid';
    const owned = countByType(b.type);
    const sellRefund = Math.round(0.5 * Math.round(def.baseCost * Math.pow(SCALING, Math.max(0, owned - 1))));
    let rows = '';
    for (const r in def.inputs) {
      rows += `<div class="info-row"><span>${RESOURCE_META[r].label} in</span><span>${(def.inputs[r] * throttle).toFixed(1)} / ${def.inputs[r]} per min</span></div>`;
    }
    for (const r in def.outputs) {
      const mult = state._lastMultiplier || 1;
      rows += `<div class="info-row"><span>${RESOURCE_META[r].label} out</span><span>${(def.outputs[r] * throttle * mult).toFixed(1)} / ${def.outputs[r]} per min</span></div>`;
    }
    if (def.moraleOutput) rows += `<div class="info-row"><span>Morale out</span><span>${(def.moraleOutput * throttle).toFixed(1)} / ${def.moraleOutput} per min</span></div>`;
    if (def.specialEffect) rows += `<div class="info-row"><span>Effect</span><span>${def.specialEffect} (${pct}% active)</span></div>`;
    el.selectedInfo.innerHTML = `
      <div class="info-title">${def.name}</div>
      <div class="info-tier">Tier ${def.tier} &middot; ${def.blurb}</div>
      <div class="info-throttle">
        <div class="info-row"><span>Running at</span><span>${pct}%</span></div>
        <div class="throttle-track"><div class="${fillCls}" style="width:${pct}%"></div></div>
      </div>
      ${rows}
      <button class="sell-btn" id="sellBtn">Sell for ${fmtMoney(sellRefund)}</button>
    `;
    document.getElementById('sellBtn').addEventListener('click', () => sellBuilding(b));
  } else if (state.grid[y][x] === 1) {
    el.selectedInfo.innerHTML = `<div class="info-title">Empty Tile</div><div class="info-tier">(${x}, ${y}) &middot; unlocked</div><div class="panel-note">Select a building from the Construction panel, then click this tile to place it.</div>`;
  } else {
    const cost = getExpandCost();
    el.selectedInfo.innerHTML = `<div class="info-title">Unclaimed Land</div><div class="info-tier">(${x}, ${y}) &middot; locked</div><div class="panel-note">Use "Expand Land" (${fmtMoney(cost)}) to unlock territory adjacent to your base.</div>`;
  }
}

function renderAll() {
  renderResourceBar();
  renderBuildPanel();
  renderExpandInfo();
  renderGrid();
  renderInfoPanel();
}

/* ------------------------------ INTERACTION ------------------------------ */

function onBuildCardClick(type) {
  if (selectedBuildType === type) {
    selectedBuildType = null;
  } else {
    selectedBuildType = type;
    expandMode = false;
  }
  renderBuildPanel();
  renderExpandInfo();
  renderGrid();
}

function onTileClick(x, y) {
  if (selectedBuildType) {
    tryPlaceBuilding(selectedBuildType, x, y);
    return;
  }
  if (expandMode) {
    tryExpand(x, y);
    return;
  }
  selectedTile = { x, y };
  renderInfoPanel();
}

function tryPlaceBuilding(type, x, y) {
  const def = BUILDING_TYPES[type];
  if (!canPlaceAt(type, x, y)) {
    showToast('Cannot place there — tile locked or occupied.', 'error');
    return;
  }
  const cost = getBuildingCost(type);
  if (state.resources.money < cost) {
    showToast(`Not enough cash. Need ${fmtMoney(cost)}.`, 'error');
    return;
  }
  state.resources.money -= cost;
  const building = { id: state.nextBuildingId++, type, x, y };
  state.buildings.push(building);
  selectedBuildType = null;
  selectedTile = { x, y };
  simulateTick(state, 0); // refresh throttle snapshot immediately
  saveState();
  renderAll();
  showToast(`${def.name} constructed.`, 'success');
  onBuildingPlaced(type);
}

function sellBuilding(building) {
  const def = BUILDING_TYPES[building.type];
  const owned = countByType(building.type);
  const refund = Math.round(0.5 * Math.round(def.baseCost * Math.pow(SCALING, Math.max(0, owned - 1))));
  state.buildings = state.buildings.filter(b => b.id !== building.id);
  state.resources.money += refund;
  selectedTile = null;
  simulateTick(state, 0);
  saveState();
  renderAll();
  showToast(`Sold ${def.name} for ${fmtMoney(refund)}.`, 'success');
}

function tryExpand(x, y) {
  if (!isExpandable(x, y)) return;
  const cost = getExpandCost();
  if (state.resources.money < cost) {
    showToast(`Not enough cash to expand. Need ${fmtMoney(cost)}.`, 'error');
    return;
  }
  state.resources.money -= cost;
  state.grid[y][x] = 1;
  state.unlockedCount++;
  saveState();
  renderAll();
  showToast('Territory expanded.', 'success');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    selectedBuildType = null;
    expandMode = false;
    renderBuildPanel();
    renderExpandInfo();
    renderGrid();
  }
});

/* --------------------------------- LOOP ----------------------------------- */

function liveTick() {
  simulateTick(state, LIVE_TICK_MS / 60000);
  computeRateReport();
  renderResourceBar();
  renderGrid();
  if (selectedTile) renderInfoPanel();
  tickCounter++;
  if (tickCounter % AUTOSAVE_EVERY_TICKS === 0) saveState();
}

function computeRateReport() {
  // Sample instantaneous per-minute net rates by running a tiny probe tick without mutating real state.
  const probe = JSON.parse(JSON.stringify({ buildings: state.buildings, resources: state.resources, army: state.army }));
  const before = { ...probe.resources };
  simulateTick(probe, 1 / 60); // 1 second worth
  const after = probe.resources;
  const rate = {};
  for (const res of RESOURCE_ORDER) {
    rate[res] = ((after[res] - before[res]) || 0) * 60; // back to per-minute
  }
  state._lastRateReport = rate;
}

function startLiveLoop() {
  if (liveTimer) clearInterval(liveTimer);
  liveTimer = setInterval(liveTick, LIVE_TICK_MS);
}

function applyOfflineProgress() {
  const now = Date.now();
  let elapsedSec = Math.max(0, (now - (state.lastSaved || now)) / 1000);
  const capped = Math.min(elapsedSec, MAX_OFFLINE_SECONDS);
  if (capped < 30) return null; // not worth reporting

  const before = { ...state.resources };
  const totalMin = capped / 60;
  let stepsLeft = totalMin;
  while (stepsLeft > 0) {
    const step = Math.min(OFFLINE_STEP_MIN, stepsLeft);
    simulateTick(state, step);
    stepsLeft -= step;
  }
  const after = state.resources;
  const moneyGained = after.money - before.money;
  return { elapsedSec: capped, moneyGained, before, after };
}

function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  const s = Math.floor(sec % 60);
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/* ------------------------------- TUTORIAL --------------------------------- */

const TUTORIAL_STEPS = [
  {
    text: `<b>Welcome, Commander.</b><br><br>Your base runs on a supply chain: raw resources feed conversion buildings, which feed revenue buildings. Nothing here fights — this is pure logistics and economy.<br><br>Let's get your first building up.`,
  },
  {
    text: `Step 1 — place a <b>Solar Array</b> on the grid. It produces Power with no inputs of its own. Click it in the Construction panel, then click any empty (highlighted) tile.`,
    requireBuilding: 'solar_array',
  },
  {
    text: `Power is flowing in. Now place a <b>Recruit Barracks</b>. Watch closely: Barracks <i>consume</i> Power to produce Personnel — its output is only as good as the Power your Solar Array actually supplies.`,
    requireBuilding: 'recruit_barracks',
  },
  {
    text: `<b>This is the core mechanic.</b> Every building past Tier 1 depends on other buildings' output. If you buy a building whose inputs aren't being supplied yet, it throttles down instead of stopping — check its "Running at %" in the Details panel. Overbuild consumers before their supply chain exists, and you waste cash. Balance production and consumption as you expand.`,
  },
  {
    text: `One more skill: <b>Duty Shift</b>. Separately from the base, you can type Spanish vocabulary for direct cash — but only while you're actively playing. Let's try a short shift now.`,
    action: 'startGuidedDuty',
  },
];

function initTutorial() {
  if (state.tutorial.done) return;
  renderTutorialStep();
  document.getElementById('tutorialOverlay').classList.remove('hidden');
}

function renderTutorialStep() {
  const step = TUTORIAL_STEPS[state.tutorial.step];
  if (!step) { finishTutorial(); return; }
  document.getElementById('tutorialText').innerHTML = step.text;
  const nextBtn = document.getElementById('tutorialNextBtn');
  if (step.requireBuilding) {
    nextBtn.disabled = true;
    nextBtn.textContent = 'Place it to continue';
  } else if (step.action === 'startGuidedDuty') {
    nextBtn.textContent = 'Start Duty Shift';
  } else {
    nextBtn.disabled = false;
    nextBtn.textContent = 'Next';
  }
  renderBuildPanel();
}

function onBuildingPlaced(type) {
  if (state.tutorial.done) return;
  const step = TUTORIAL_STEPS[state.tutorial.step];
  if (step && step.requireBuilding === type) {
    const nextBtn = document.getElementById('tutorialNextBtn');
    nextBtn.disabled = false;
    nextBtn.textContent = 'Next';
  }
}

function advanceTutorial() {
  const step = TUTORIAL_STEPS[state.tutorial.step];
  if (step && step.action === 'startGuidedDuty') {
    document.getElementById('tutorialOverlay').classList.add('hidden');
    if (window.SpanishModule) {
      window.SpanishModule.startGuidedSession(() => {
        state.tutorial.step++;
        finishTutorial();
      });
    } else {
      state.tutorial.step++;
      finishTutorial();
    }
    return;
  }
  state.tutorial.step++;
  saveState();
  if (state.tutorial.step >= TUTORIAL_STEPS.length) {
    finishTutorial();
  } else {
    renderTutorialStep();
  }
}

function finishTutorial() {
  state.tutorial.done = true;
  document.getElementById('tutorialOverlay').classList.add('hidden');
  saveState();
  renderBuildPanel();
}

function restartTutorial() {
  state.tutorial = { step: 0, done: false };
  saveState();
  initTutorial();
}

/* --------------------------------- INIT ------------------------------------ */

function init() {
  cacheEls();
  state = loadState();
  let isNewGame = false;
  if (!state) {
    state = freshState();
    isNewGame = true;
  } else {
    // backfill fields for forward-compat with older saves
    if (!state.spanish) state.spanish = { sets: {}, totalCorrect: 0, totalAttempts: 0 };
    if (!state.tutorial) state.tutorial = { step: 0, done: false };
  }
  if (window.ArmyModule) window.ArmyModule.ensureState(state);

  buildGridDom();

  let offlineReport = null;
  if (!isNewGame) {
    offlineReport = applyOfflineProgress();
  }

  simulateTick(state, 0);
  computeRateReport();
  renderAll();
  saveState();
  startLiveLoop();

  el.expandModeBtn.addEventListener('click', () => {
    expandMode = !expandMode;
    selectedBuildType = null;
    renderBuildPanel();
    renderExpandInfo();
    renderGrid();
  });

  el.helpBtn.addEventListener('click', restartTutorial);

  el.resetBtn.addEventListener('click', () => {
    document.getElementById('resetConfirmOverlay').classList.remove('hidden');
  });
  document.getElementById('resetCancelBtn').addEventListener('click', () => {
    document.getElementById('resetConfirmOverlay').classList.add('hidden');
  });
  document.getElementById('resetConfirmBtn').addEventListener('click', () => {
    // Reload fires beforeunload first, which would otherwise call saveState() and
    // immediately re-write the save we're about to delete. Unregister it first.
    window.removeEventListener('beforeunload', saveState);
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  });

  el.dutyShiftBtn.addEventListener('click', () => {
    if (window.SpanishModule) window.SpanishModule.openOverlay();
  });

  document.getElementById('tutorialNextBtn').addEventListener('click', advanceTutorial);
  document.getElementById('tutorialSkipBtn').addEventListener('click', finishTutorial);

  if (offlineReport) {
    el.welcomeBackText.innerHTML = `
      <p>You were away for <b>${formatDuration(offlineReport.elapsedSec)}</b>.</p>
      <p>Your base kept running: <b>${fmtMoney(offlineReport.moneyGained)}</b> earned while you were gone.</p>
    `;
    el.welcomeBackOverlay.classList.remove('hidden');
    el.welcomeBackCloseBtn.addEventListener('click', () => {
      el.welcomeBackOverlay.classList.add('hidden');
      if (!state.tutorial.done) initTutorial();
    }, { once: true });
  } else if (!state.tutorial.done) {
    initTutorial();
  }

  window.addEventListener('beforeunload', saveState);
}

document.addEventListener('DOMContentLoaded', init);

/* ------------------------------ PUBLIC API -------------------------------- */

window.Game = {
  getState: () => state,
  saveState,
  addCash: (amount) => {
    state.resources.money += amount;
    renderResourceBar();
    el.cashValue && (el.cashValue.textContent = fmtMoney(state.resources.money));
  },
  fmtMoney,
  getLanguageInstituteBonus,
};
