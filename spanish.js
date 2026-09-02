'use strict';

/* =========================================================================
   DUTY SHIFT — Spanish vocabulary minigame.
   Reads vocabulary from SPANISH_SETS (spanish-data.js) and cooperates with
   window.Game (game.js) for cash rewards + persistence.
   Exposes window.SpanishModule = { openOverlay, startGuidedSession }.
   ========================================================================= */

const MIXED_SESSION_SIZE = 20;
const GUIDED_SESSION_SIZE = 6;

const ACCENT_KEYS_LOWER = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'];
const ACCENT_KEYS_UPPER = ['Á', 'É', 'Í', 'Ó', 'Ú', 'Ñ', 'Ü'];

function cashForCard(setId) {
  const base = 5 + setId * 2;
  const bonus = window.Game.getLanguageInstituteBonus ? window.Game.getLanguageInstituteBonus() : 0;
  return Math.round(base * (1 + bonus));
}

function stripAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function gradeAnswer(userInput, card) {
  const accepted = [card.es].concat(card.alt || []);
  const userTrim = userInput.trim().replace(/\s+/g, ' ');
  const userLower = userTrim.toLowerCase();
  for (const ans of accepted) {
    if (userLower === ans.toLowerCase()) return { correct: true, accentIssue: false, correctAnswer: ans };
  }
  const userStripped = stripAccents(userLower);
  for (const ans of accepted) {
    if (userStripped === stripAccents(ans.toLowerCase())) {
      return { correct: false, accentIssue: true, correctAnswer: ans };
    }
  }
  return { correct: false, accentIssue: false, correctAnswer: accepted[0] };
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* --------------------------- progress / unlocks --------------------------- */

function getSpanishState() {
  return window.Game.getState().spanish;
}

function getSetProgress(setId) {
  const sp = getSpanishState();
  return sp.sets[setId] || { plays: 0, bestAccuracy: 0, completed: false };
}

function setSetProgress(setId, patch) {
  const sp = getSpanishState();
  const cur = sp.sets[setId] || { plays: 0, bestAccuracy: 0, completed: false };
  sp.sets[setId] = Object.assign(cur, patch);
}

function isSetUnlocked(setId) {
  if (setId === 1) return true;
  return getSetProgress(setId - 1).completed;
}

function countUnlockedSets() {
  let n = 0;
  for (let i = 1; i <= SPANISH_SETS.length; i++) if (isSetUnlocked(i)) n++;
  return n;
}

/* -------------------------------- overlay -------------------------------- */

let content, overlay;
let session = null; // { cards, index, correctCount, cashEarned, guided, setLabel, setId(for stats), onComplete }

function cacheDom() {
  content = document.getElementById('dutyContent');
  overlay = document.getElementById('dutyShiftOverlay');
}

function openOverlay() {
  if (!content) cacheDom();
  overlay.classList.remove('hidden');
  if (!session) renderSetSelect();
}

function closeOverlay() {
  overlay.classList.add('hidden');
  if (session && !session.guided) {
    endSession(true);
  }
}

function renderSetSelect() {
  session = null;
  const unlockedCount = countUnlockedSets();
  let cards = '';
  for (const set of SPANISH_SETS) {
    const unlocked = isSetUnlocked(set.id);
    const prog = getSetProgress(set.id);
    let stat = '';
    if (prog.plays > 0) stat = `<div class="set-stat">Best: ${Math.round(prog.bestAccuracy)}%${prog.completed ? ' ✓' : ''}</div>`;
    cards += `<div class="set-card ${unlocked ? '' : 'locked'}" data-set="${set.id}">
      <div class="set-num">SET ${set.id}${unlocked ? '' : ' 🔒'}</div>
      <div class="set-title">${set.title}</div>
      ${stat}
    </div>`;
  }
  let mixedCard = '';
  if (unlockedCount >= 2) {
    mixedCard = `<div class="set-card mixed" data-set="mixed">
      <div class="set-num">MIXED PRACTICE</div>
      <div class="set-title">Random cards from all ${unlockedCount} unlocked sets</div>
    </div>`;
  }
  content.innerHTML = `
    <div class="duty-header"><h2>Duty Shift</h2></div>
    <p class="panel-note">Type the Spanish word or phrase for each English prompt. Cash is paid per correct answer, in real time — this only works while you're here typing.</p>
    ${mixedCard}
    <div class="set-grid">${cards}</div>
  `;
  content.querySelectorAll('.set-card').forEach(c => {
    c.addEventListener('click', () => {
      const key = c.dataset.set;
      if (key === 'mixed') {
        startSession('mixed', {});
      } else {
        const id = parseInt(key, 10);
        if (isSetUnlocked(id)) startSession(id, {});
      }
    });
  });
}

function buildCardPool(setSpec) {
  if (setSpec === 'mixed') {
    let pool = [];
    for (const set of SPANISH_SETS) {
      if (isSetUnlocked(set.id)) {
        for (const c of set.cards) pool.push({ en: c.en, es: c.es, alt: c.alt, setId: set.id });
      }
    }
    pool = shuffle(pool);
    return pool.slice(0, Math.min(MIXED_SESSION_SIZE, pool.length));
  }
  const set = SPANISH_SETS.find(s => s.id === setSpec);
  return shuffle(set.cards.map(c => ({ en: c.en, es: c.es, alt: c.alt, setId: set.id })));
}

function startSession(setSpec, opts) {
  const guided = !!opts.guided;
  const cards = guided ? SPANISH_SETS[0].cards.slice(0, GUIDED_SESSION_SIZE).map(c => ({ en: c.en, es: c.es, alt: c.alt, setId: 1 }))
                        : buildCardPool(setSpec);
  session = {
    cards,
    index: 0,
    correctCount: 0,
    cashEarned: 0,
    guided,
    setSpec,
    answered: false,
    onComplete: opts.onComplete || null,
  };
  renderCard();
}

function startGuidedSession(onComplete) {
  if (!content) cacheDom();
  overlay.classList.remove('hidden');
  startSession(1, { guided: true, onComplete });
}

function renderCard() {
  const card = session.cards[session.index];
  const total = session.cards.length;
  const guidedNote = session.guided
    ? `<div class="tutorial-note">Guided Duty Shift — type the Spanish translation, then press Enter or Submit. Use the accent buttons below the input if you need special characters.</div>`
    : '';
  content.innerHTML = `
    <div class="duty-header"><h2>Duty Shift</h2><button class="back-link" id="dutyBackBtn">&larr; End Session</button></div>
    ${guidedNote}
    <div class="session-progress">Card ${session.index + 1} / ${total} &nbsp;·&nbsp; Correct: ${session.correctCount} &nbsp;·&nbsp; Earned: ${window.Game.fmtMoney(session.cashEarned)}</div>
    <div class="session-prompt-wrap">
      <div class="session-prompt-label">Translate to Spanish</div>
      <div class="session-prompt">${card.en}</div>
      <input type="text" id="answerInput" class="session-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type your answer…">
      <div class="accent-row" id="accentRow"></div>
      <div class="feedback-box" id="feedbackBox"></div>
    </div>
    <div class="duty-actions">
      <button class="ghost-btn" id="skipBtn">Skip</button>
      <button class="primary-btn" id="submitBtn">Submit</button>
    </div>
  `;
  buildAccentRow();
  document.getElementById('dutyBackBtn').addEventListener('click', () => endSession(true));
  document.getElementById('submitBtn').addEventListener('click', onSubmitOrNext);
  document.getElementById('skipBtn').addEventListener('click', () => {
    if (!session.answered) skipCard(); else advanceCard();
  });
  const input = document.getElementById('answerInput');
  input.focus();
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); onSubmitOrNext(); }
  });
}

function buildAccentRow() {
  const row = document.getElementById('accentRow');
  const all = ACCENT_KEYS_LOWER.concat(ACCENT_KEYS_UPPER);
  row.innerHTML = all.map(ch => `<button type="button" class="accent-key" data-ch="${ch}">${ch}</button>`).join('');
  row.querySelectorAll('.accent-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('answerInput');
      insertAtCursor(input, btn.dataset.ch);
    });
  });
}

function insertAtCursor(input, char) {
  const start = input.selectionStart != null ? input.selectionStart : input.value.length;
  const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
  input.value = input.value.slice(0, start) + char + input.value.slice(end);
  const pos = start + char.length;
  input.focus();
  input.setSelectionRange(pos, pos);
}

function onSubmitOrNext() {
  if (!session.answered) {
    submitAnswer();
  } else {
    advanceCard();
  }
}

function submitAnswer() {
  const input = document.getElementById('answerInput');
  const card = session.cards[session.index];
  const result = gradeAnswer(input.value, card);
  session.answered = true;
  input.disabled = true;

  const fb = document.getElementById('feedbackBox');
  fb.classList.add('show');
  if (result.correct) {
    input.classList.add('correct');
    const cash = cashForCard(card.setId);
    session.correctCount++;
    session.cashEarned += cash;
    window.Game.addCash(cash);
    fb.className = 'feedback-box show correct';
    fb.innerHTML = `✔ Correct! <span class="correct-answer">+${window.Game.fmtMoney(cash)}</span>`;
  } else if (result.accentIssue) {
    input.classList.add('incorrect');
    fb.className = 'feedback-box show accent-issue';
    fb.innerHTML = `Almost — check your accents. Correct: <span class="correct-answer">${result.correctAnswer}</span>`;
  } else {
    input.classList.add('incorrect');
    fb.className = 'feedback-box show incorrect';
    fb.innerHTML = `✘ Not quite. Correct: <span class="correct-answer">${result.correctAnswer}</span>`;
  }
  window.Game.saveState();

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.textContent = (session.index + 1 < session.cards.length) ? 'Next →' : 'Finish';
  document.querySelector('.session-progress').textContent =
    `Card ${session.index + 1} / ${session.cards.length} · Correct: ${session.correctCount} · Earned: ${window.Game.fmtMoney(session.cashEarned)}`;
}

function skipCard() {
  session.answered = true;
  advanceCard();
}

function advanceCard() {
  session.index++;
  if (session.index >= session.cards.length) {
    endSession(false);
  } else {
    session.answered = false;
    renderCard();
  }
}

function endSession(early) {
  const attempted = session.index + (early && session.answered ? 1 : 0);
  const accuracy = attempted > 0 ? (session.correctCount / attempted) * 100 : 0;

  if (!session.guided && typeof session.setSpec === 'number' && session.index >= session.cards.length) {
    setSetProgress(session.setSpec, {
      plays: getSetProgress(session.setSpec).plays + 1,
      bestAccuracy: Math.max(getSetProgress(session.setSpec).bestAccuracy, accuracy),
      completed: true,
    });
  } else if (!session.guided && typeof session.setSpec === 'number') {
    setSetProgress(session.setSpec, {
      plays: getSetProgress(session.setSpec).plays + 1,
      bestAccuracy: Math.max(getSetProgress(session.setSpec).bestAccuracy, accuracy),
    });
  }

  const sp = getSpanishState();
  sp.totalCorrect += session.correctCount;
  sp.totalAttempts += attempted;
  window.Game.saveState();

  const wasGuided = session.guided;
  const onComplete = session.onComplete;

  if (wasGuided) {
    session = null;
    overlay.classList.add('hidden');
    if (onComplete) onComplete();
    return;
  }

  renderSummary(attempted, accuracy);
}

function renderSummary(attempted, accuracy) {
  content.innerHTML = `
    <div class="duty-header"><h2>Shift Complete</h2></div>
    <div class="session-summary">
      <div class="summary-stat-row">
        <div class="summary-stat"><span class="val">${Math.round(accuracy)}%</span><span class="lbl">Accuracy</span></div>
        <div class="summary-stat"><span class="val">${session.correctCount}/${attempted}</span><span class="lbl">Correct</span></div>
        <div class="summary-stat"><span class="val">${window.Game.fmtMoney(session.cashEarned)}</span><span class="lbl">Earned</span></div>
      </div>
      <button class="primary-btn" id="backToSetsBtn">Back to Sets</button>
    </div>
  `;
  session = null;
  document.getElementById('backToSetsBtn').addEventListener('click', renderSetSelect);
}

document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  document.getElementById('dutyCloseBtn').addEventListener('click', closeOverlay);
});

window.SpanishModule = { openOverlay, startGuidedSession };
