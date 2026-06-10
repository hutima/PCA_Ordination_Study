// PCA Ordination & Licensure Study — entry point.
//
// Lean orchestration that reuses the Duff SRS engine (domain/srs/*) and the
// shared visual shell (styles.css), driving a self-check Q&A review flow over
// the window.PCA_DATA content contract. See PROJECT_PLAN.md for the full plan.

import { renderMarkdown } from '../utils/markdown.js';
import { SRS_AGAIN_MS } from '../domain/srs/constants.js';
import {
  setProgressDelay, getUncertainDelayMs, getNextEasyIntervalDays, msFromDays,
  formatRemainingForTable
} from '../domain/srs/scheduler.js';
import { recordConfidenceSample, getConfidencePct } from '../domain/srs/confidence.js';

const PROGRESS_KEY = 'pca_progress_v1';
const SELECTION_KEY = 'pca_selection_v1';

const DATA = (typeof window !== 'undefined' && window.PCA_DATA) || { subjects: [], sets: {} };

// ── State ──────────────────────────────────────────────────────────────
const state = {
  mode: 'review',          // 'review' (self-check) | 'quiz' (multiple choice)
  selected: new Set(),     // selected set keys
  deck: [],                // ordered array of card objects for this session
  pos: 0,
  revealed: false,
  quiz: null,              // current card's MCQ: { choices, correctIndex, picked }
  progress: {},            // cardId -> SRS progress object
};

// ── Persistence ────────────────────────────────────────────────────────
function loadProgress() {
  try { state.progress = JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
  catch (e) { state.progress = {}; }
}
function saveProgress() {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress)); } catch (e) {}
}
function loadSelection() {
  let keys = [];
  try { keys = JSON.parse(localStorage.getItem(SELECTION_KEY)) || []; } catch (e) {}
  state.selected = new Set(keys.filter(k => DATA.sets[k]));
}
function saveSelection() {
  try { localStorage.setItem(SELECTION_KEY, JSON.stringify([...state.selected])); } catch (e) {}
}

function getProgress(cardId) {
  let p = state.progress[cardId];
  if (!p) {
    p = { confidenceHistory: [], intervalDays: 0, dueAt: 0, ease: 2.3, passCount: 0, failCount: 0, reps: 0, lastReviewedAt: 0 };
    state.progress[cardId] = p;
  }
  return p;
}

// ── Content helpers ────────────────────────────────────────────────────
function allSetKeys() {
  const keys = [];
  for (const subj of DATA.subjects) for (const k of subj.setKeys) if (DATA.sets[k]) keys.push(k);
  return keys;
}
function effectiveSetKeys() {
  return state.selected.size ? [...state.selected] : allSetKeys();
}
function cardsForKeys(keys) {
  const out = [];
  for (const k of keys) {
    const set = DATA.sets[k];
    if (!set) continue;
    for (const c of set.cards) out.push({ ...c, _setKey: k, _setLabel: set.label });
  }
  return out;
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Quiz (MCQ) eligibility & generation ────────────────────────────────
// A card is quiz-eligible if it carries an authored `quiz` block, or its
// answer is short enough to be a single multiple-choice option and its
// sub-deck has at least three other short-answer siblings to draw distractors
// from. This covers the fact-style decks (passages, events, term/people IDs,
// whole-Bible facts) and leaves the long-form cards to Review mode.
function isShortAnswer(card) {
  const a = (card.a || '').trim();
  return !!a && !a.includes('\n') && a.length <= 80 && !a.includes('|') && !a.includes('**');
}
function shortSiblings(setKey, exclude) {
  const set = DATA.sets[setKey];
  if (!set) return [];
  const seen = new Set([exclude]);
  const out = [];
  for (const c of set.cards) {
    const a = (c.a || '').trim();
    if (isShortAnswer(c) && !seen.has(a)) { seen.add(a); out.push(a); }
  }
  return out;
}
function quizEligible(card) {
  if (card.quiz && Array.isArray(card.quiz.choices) && card.quiz.choices.length >= 2) return true;
  if (!isShortAnswer(card)) return false;
  return shortSiblings(card._setKey, card.a.trim()).length >= 3;
}
function buildQuiz(card) {
  if (card.quiz && Array.isArray(card.quiz.choices)) {
    return { choices: card.quiz.choices.slice(), correctIndex: card.quiz.answerIndex, picked: -1 };
  }
  const correct = card.a.trim();
  const distractors = shuffle(shortSiblings(card._setKey, correct)).slice(0, 3);
  const choices = shuffle([correct, ...distractors]);
  return { choices, correctIndex: choices.indexOf(correct), picked: -1 };
}

// ── Deck building (due-first) ──────────────────────────────────────────
function subjectLabel(id) {
  const s = DATA.subjects.find(x => x.id === id);
  return s ? s.label : id;
}
// Subjects implied by the current sub-deck selection (null = all subjects).
function selectedSubjectIds() {
  if (!state.selected.size) return null;
  const s = new Set();
  for (const k of state.selected) { const set = DATA.sets[k]; if (set) s.add(set.subject); }
  return s;
}
// Quiz deck = hand-authored MCQs (window.PCA_QUIZ) for the selected subjects,
// plus auto-generated MCQs from short-answer review cards in the selection.
function quizDeckCards() {
  const subj = selectedSubjectIds();
  const bank = (typeof window !== 'undefined' && window.PCA_QUIZ) || [];
  const authored = bank
    .filter(q => !subj || subj.has(q.subject))
    .map(q => ({
      id: q.id, q: q.q, refs: q.refs || [],
      _setKey: 'quiz:' + q.subject, _setLabel: subjectLabel(q.subject),
      quiz: { choices: q.choices, answerIndex: q.answerIndex },
    }));
  const auto = cardsForKeys(effectiveSetKeys()).filter(quizEligible);
  return authored.concat(auto);
}

function buildDeck() {
  const now = Date.now();
  const cards = state.mode === 'quiz' ? quizDeckCards() : cardsForKeys(effectiveSetKeys());
  const due = [];
  const later = [];
  for (const c of cards) {
    const p = state.progress[c.id];
    if (!p || !p.dueAt || p.dueAt <= now) due.push(c);
    else later.push(c);
  }
  shuffle(due);
  later.sort((a, b) => state.progress[a.id].dueAt - state.progress[b.id].dueAt);
  state.deck = due.concat(later);
  state.dueCount = due.length;
  state.pos = 0;
  state.revealed = false;
  syncCardState();
}

// Prepare per-card transient state for the current position.
function syncCardState() {
  state.revealed = false;
  const card = state.deck[state.pos];
  state.quiz = (state.mode === 'quiz' && card) ? buildQuiz(card) : null;
}

function setMode(mode) {
  if (mode !== 'review' && mode !== 'quiz') return;
  state.mode = mode;
  document.querySelectorAll('[data-mode]').forEach(b =>
    b.classList.toggle('active', b.getAttribute('data-mode') === mode));
  buildDeck();
  renderCard();
}

// ── SRS application ────────────────────────────────────────────────────
function applyOutcome(card, outcome) {
  const p = getProgress(card.id);
  const now = Date.now();
  recordConfidenceSample(p, outcome);
  if (outcome === 'again') {
    setProgressDelay(p, SRS_AGAIN_MS, now);
    p.failCount = (p.failCount || 0) + 1;
  } else if (outcome === 'pass') {
    setProgressDelay(p, getUncertainDelayMs(p), now);
    p.passCount = (p.passCount || 0) + 1;
  } else { // easy
    const days = getNextEasyIntervalDays(p);
    p.lastEasyIntervalDays = days;
    setProgressDelay(p, msFromDays(days), now);
    p.passCount = (p.passCount || 0) + 1;
  }
  p.reps = (p.reps || 0) + 1;
  p.lastReviewedAt = now;
  saveProgress();
}

// ── Rendering ──────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
function escapeText(s) {
  const d = document.createElement('div');
  d.textContent = String(s == null ? '' : s);
  return d.innerHTML;
}

function renderDeckMeta() {
  const meta = $('deckMeta');
  if (!state.deck.length) { meta.textContent = ''; return; }
  const total = state.deck.length;
  const due = state.dueCount || 0;
  meta.innerHTML = `<strong>${due}</strong> due · <strong>${total}</strong> in session · card ${state.pos + 1} of ${total}`;
}

function renderCard() {
  const area = $('cardArea');
  if (!state.deck.length) {
    const msg = state.mode === 'quiz'
      ? `No quiz-ready cards in this selection. Quiz mode works on fact-style cards (passages, events, key terms/people). Try <strong>Review</strong>, or pick more subjects.`
      : `Choose one or more subjects, then press <strong>Start studying</strong>.`;
    area.innerHTML = `<div class="empty-state"><p>${msg}</p></div>`;
    renderDeckMeta();
    renderReviewPanel();
    return;
  }
  if (state.mode === 'quiz') renderQuizCard(area, state.deck[state.pos]);
  else renderReviewCard(area, state.deck[state.pos]);
  renderDeckMeta();
  renderReviewPanel();
}

function navRowHtml() {
  return `<div class="nav-row">
      <button class="nav-btn nav-prev" id="prevBtn" type="button">‹ Prev</button>
      <button class="nav-btn" id="nextBtn" type="button">Next ›</button>
    </div>`;
}
function wireNav() {
  $('prevBtn').addEventListener('click', () => move(-1));
  $('nextBtn').addEventListener('click', () => move(1));
}

function renderReviewCard(area, card) {
  const refsHtml = (card.refs && card.refs.length)
    ? `<div class="qa-refs">${card.refs.map(r => `<span class="qa-ref-chip">${escapeText(r)}</span>`).join('')}</div>`
    : '';
  // The card flips like a tap-to-reveal flashcard: tapping it toggles the
  // answer on and off so the user can test recall back and forth.
  const answerBlock = state.revealed
    ? `<div class="qa-divider"></div><div class="qa-answer">${renderMarkdown(card.a)}</div>${refsHtml}
       <div class="qa-reveal-hint qa-tap-hint">Tap card to hide</div>`
    : `<div class="qa-reveal-hint qa-tap-hint">Tap card to reveal answer</div>`;

  const markRow = state.revealed
    ? `<div class="mark-row" style="display:flex">
         <button class="mark-btn mark-again" data-outcome="again" type="button">✗ Hard</button>
         <button class="mark-btn mark-pass" data-outcome="pass" type="button">~ Uncertain</button>
         <button class="mark-btn mark-easy" data-outcome="easy" type="button">✓ Easy</button>
       </div>`
    : '';

  area.innerHTML = `
    <div class="qa-card ${state.revealed ? 'revealed' : ''}" id="qaCard" role="button" tabindex="0" aria-pressed="${state.revealed}">
      <div class="qa-deck-label">${escapeText(card._setLabel)}</div>
      <div class="qa-question">${escapeText(card.q)}</div>
      ${answerBlock}
    </div>
    ${navRowHtml()}
    ${markRow}
  `;

  const qaCard = $('qaCard');
  if (qaCard) {
    qaCard.addEventListener('click', () => {
      if (window.getSelection && String(window.getSelection()).length) return;
      toggleReveal();
    });
  }
  wireNav();
  area.querySelectorAll('.mark-btn').forEach(btn =>
    btn.addEventListener('click', () => mark(btn.dataset.outcome)));
}

function renderQuizCard(area, card) {
  const quiz = state.quiz || (state.quiz = buildQuiz(card));
  const answered = quiz.picked >= 0;
  const refsHtml = (answered && card.refs && card.refs.length)
    ? `<div class="qa-refs">${card.refs.map(r => `<span class="qa-ref-chip">${escapeText(r)}</span>`).join('')}</div>`
    : '';
  const choicesHtml = quiz.choices.map((choice, idx) => {
    let cls = 'quiz-choice';
    if (answered) {
      if (idx === quiz.correctIndex) cls += ' correct';
      else if (idx === quiz.picked) cls += ' wrong';
      else cls += ' dim';
    }
    return `<button class="${cls}" data-choice="${idx}" type="button" ${answered ? 'disabled' : ''}>${escapeText(choice)}</button>`;
  }).join('');
  const feedback = answered
    ? `<div class="quiz-feedback ${quiz.picked === quiz.correctIndex ? 'correct' : 'wrong'}">${quiz.picked === quiz.correctIndex ? '✓ Correct' : '✗ Not quite'}</div>${refsHtml}`
    : '';

  area.innerHTML = `
    <div class="qa-card revealed">
      <div class="qa-deck-label">${escapeText(card._setLabel)} · Quiz</div>
      <div class="qa-question">${escapeText(card.q)}</div>
      <div class="quiz-choices">${choicesHtml}</div>
      ${feedback}
    </div>
    ${navRowHtml()}
  `;
  area.querySelectorAll('.quiz-choice').forEach(btn =>
    btn.addEventListener('click', () => answerQuiz(Number(btn.dataset.choice))));
  wireNav();
}

function answerQuiz(idx) {
  const quiz = state.quiz;
  if (!quiz || quiz.picked >= 0) return;
  quiz.picked = idx;
  const card = state.deck[state.pos];
  applyOutcome(card, idx === quiz.correctIndex ? 'easy' : 'again');
  renderCard();
}

function toggleReveal() { state.revealed = !state.revealed; renderCard(); }
function move(delta) {
  const n = state.deck.length;
  if (!n) return;
  state.pos = (state.pos + delta + n) % n;
  syncCardState();
  renderCard();
}
function mark(outcome) {
  if (!state.deck.length) return;
  const card = state.deck[state.pos];
  applyOutcome(card, outcome);
  advance();
}
// Move to the next card after grading; rebuild at the end to pick up newly-due.
function advance() {
  if (state.pos + 1 >= state.deck.length) {
    buildDeck();
  } else {
    state.pos += 1;
    syncCardState();
  }
  renderCard();
}

// ── Review / progress panel ────────────────────────────────────────────
function renderReviewPanel() {
  const panel = $('reviewPanel');
  if (!state.deck.length) { panel.classList.remove('show'); return; }
  panel.classList.add('show');
  const stats = $('reviewStats');
  const studied = state.deck.filter(c => state.progress[c.id] && state.progress[c.id].reps).length;
  stats.innerHTML = `Session deck — ${studied}/${state.deck.length} reviewed`;
  const list = $('reviewList');
  list.innerHTML = state.deck.map((c, i) => {
    const p = state.progress[c.id];
    const pct = p ? getConfidencePct(p) : null;
    const due = p && p.dueAt ? formatRemainingForTable(p.dueAt) : 'new';
    const pctTxt = pct == null ? '—' : `${pct}%`;
    const here = i === state.pos ? ' style="color:var(--gold-light)"' : '';
    return `<div class="review-item"${here}>${escapeText(c.q.slice(0, 60))}${c.q.length > 60 ? '…' : ''}
      <span style="float:right; color:var(--muted)">${pctTxt} · ${due}</span></div>`;
  }).join('');
}

// ── Overlay helpers (visibility is driven by the `.show` class; aria-hidden
// is kept in sync for assistive tech). ───────────────────────────────────
function showOverlay(id) {
  const ov = $(id);
  ov.classList.add('show');
  ov.setAttribute('aria-hidden', 'false');
}
function hideOverlay(id) {
  const ov = $(id);
  ov.classList.remove('show');
  ov.setAttribute('aria-hidden', 'true');
}

// ── Subject / sub-deck selector ────────────────────────────────────────
function openSelector() {
  renderSelector();
  showOverlay('studySelectorOverlay');
}
function closeSelector() {
  hideOverlay('studySelectorOverlay');
  saveSelection();
  buildDeck();
  renderCard();
}
function renderSelector() {
  const subjGrid = $('subjectGrid');
  subjGrid.innerHTML = DATA.subjects.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).map(subj => {
    const total = subj.setKeys.reduce((n, k) => n + (DATA.sets[k] ? DATA.sets[k].cards.length : 0), 0);
    const allOn = subj.setKeys.every(k => state.selected.has(k));
    return `<button class="pca-tile ${allOn ? 'selected' : ''}" data-subject="${subj.id}" type="button">
      <div class="pca-tile-title">${escapeText(subj.label)}</div>
      <div class="pca-tile-meta">${total} cards</div></button>`;
  }).join('');
  subjGrid.querySelectorAll('[data-subject]').forEach(btn => btn.addEventListener('click', () => {
    const subj = DATA.subjects.find(s => s.id === btn.dataset.subject);
    const allOn = subj.setKeys.every(k => state.selected.has(k));
    subj.setKeys.forEach(k => allOn ? state.selected.delete(k) : state.selected.add(k));
    renderSelector();
  }));

  const subdeckGrid = $('subdeckGrid');
  subdeckGrid.innerHTML = DATA.subjects.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).map(subj =>
    subj.setKeys.filter(k => DATA.sets[k]).map(k => {
      const set = DATA.sets[k];
      const on = state.selected.has(k);
      return `<button class="pca-tile ${on ? 'selected' : ''}" data-set="${k}" type="button">
        <div class="pca-tile-title">${escapeText(set.label)}</div>
        <div class="pca-tile-meta">${set.cards.length} cards</div></button>`;
    }).join('')).join('');
  subdeckGrid.querySelectorAll('[data-set]').forEach(btn => btn.addEventListener('click', () => {
    const k = btn.dataset.set;
    state.selected.has(k) ? state.selected.delete(k) : state.selected.add(k);
    renderSelector();
  }));
}

// ── Progress overlay ───────────────────────────────────────────────────
function openProgress() {
  const body = $('progressBody');
  const rows = DATA.subjects.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).map(subj => {
    let total = 0, seen = 0, sumPct = 0, pctN = 0;
    for (const k of subj.setKeys) {
      const set = DATA.sets[k];
      if (!set) continue;
      for (const c of set.cards) {
        total++;
        const p = state.progress[c.id];
        if (p && p.reps) {
          seen++;
          const pct = getConfidencePct(p);
          if (pct != null) { sumPct += pct; pctN++; }
        }
      }
    }
    const avg = pctN ? Math.round(sumPct / pctN) : 0;
    return `<div class="review-item">${escapeText(subj.label)}
      <span style="float:right; color:var(--muted)">${seen}/${total} seen · ${avg}% conf</span></div>`;
  }).join('');
  body.innerHTML = rows || '<p>No content loaded.</p>';
  showOverlay('progressOverlay');
}

// ── Theme / font / size ────────────────────────────────────────────────
function setTheme(mode) {
  const resolved = mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : mode;
  document.documentElement.setAttribute('data-theme', resolved);
  try { mode === 'system' ? localStorage.removeItem('pca_theme') : localStorage.setItem('pca_theme', mode); } catch (e) {}
  syncToggleActive('[data-theme-mode]', 'data-theme-mode', mode);
}
function setFont(f) {
  document.documentElement.setAttribute('data-font-family', f);
  try { localStorage.setItem('pca_font', f); } catch (e) {}
  syncToggleActive('[data-font]', 'data-font', f);
}
function setSize(s) {
  document.documentElement.setAttribute('data-text-size', s);
  try { localStorage.setItem('pca_text_size', s); } catch (e) {}
  syncToggleActive('[data-size]', 'data-size', s);
}
function syncToggleActive(selector, attr, value) {
  document.querySelectorAll(selector).forEach(b =>
    b.classList.toggle('active', b.getAttribute(attr) === value));
}

// ── Export / import / reset ────────────────────────────────────────────
function exportProgress() {
  const blob = new Blob([JSON.stringify({ version: 1, progress: state.progress }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pca-study-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data && data.progress && typeof data.progress === 'object') {
        state.progress = data.progress;
        saveProgress();
        buildDeck();
        renderCard();
        alert('Progress imported.');
      } else { alert('Unrecognized progress file.'); }
    } catch (e) { alert('Could not read that file.'); }
  };
  reader.readAsText(file);
}
function resetProgress() {
  if (!confirm('Erase all study progress on this device? This cannot be undone.')) return;
  state.progress = {};
  saveProgress();
  buildDeck();
  renderCard();
}

// ── Wiring ─────────────────────────────────────────────────────────────
function initOverlayDismiss() {
  document.querySelectorAll('.consent-overlay').forEach(ov => {
    ov.addEventListener('click', (e) => {
      if (e.target === ov) { ov.classList.remove('show'); ov.setAttribute('aria-hidden', 'true'); }
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.consent-overlay.show').forEach(ov => {
      ov.classList.remove('show'); ov.setAttribute('aria-hidden', 'true');
    });
  });
}

function init() {
  loadProgress();
  loadSelection();

  // Theme buttons
  document.querySelectorAll('[data-theme-mode]').forEach(b =>
    b.addEventListener('click', () => setTheme(b.getAttribute('data-theme-mode'))));
  document.querySelectorAll('[data-font]').forEach(b =>
    b.addEventListener('click', () => setFont(b.getAttribute('data-font'))));
  document.querySelectorAll('[data-size]').forEach(b =>
    b.addEventListener('click', () => setSize(b.getAttribute('data-size'))));
  // Reflect current persisted prefs in the toggle UI.
  syncToggleActive('[data-theme-mode]', 'data-theme-mode', localStorage.getItem('pca_theme') || 'system');
  syncToggleActive('[data-font]', 'data-font', localStorage.getItem('pca_font') || 'serif');
  syncToggleActive('[data-size]', 'data-size', localStorage.getItem('pca_text_size') || 'medium');

  $('chooseSubjectBtn').addEventListener('click', openSelector);
  $('selectorDoneBtn').addEventListener('click', closeSelector);
  $('selectorClearBtn').addEventListener('click', () => { state.selected.clear(); renderSelector(); });
  $('startStudyingBtn').addEventListener('click', () => { buildDeck(); renderCard(); });
  $('progressBtn').addEventListener('click', openProgress);
  $('progressCloseBtn').addEventListener('click', () => hideOverlay('progressOverlay'));

  $('modeReviewBtn').addEventListener('click', () => setMode('review'));
  $('modeQuizBtn').addEventListener('click', () => setMode('quiz'));

  $('exportBtn').addEventListener('click', exportProgress);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); });
  $('resetProgressBtn').addEventListener('click', resetProgress);

  // Keyboard: space/enter = flip the card, 1/2/3 = grade, ←/→ = prev/next.
  document.addEventListener('keydown', (e) => {
    const tag = e.target && e.target.tagName;
    if (/INPUT|TEXTAREA/.test(tag)) return;
    if (document.querySelector('.consent-overlay.show')) return; // a modal is open
    if (!state.deck.length) return;
    if (e.key === 'ArrowRight') { move(1); return; }
    if (e.key === 'ArrowLeft') { move(-1); return; }
    if (state.mode === 'quiz') {
      // 1–4 pick a choice (before answering); space/enter advances after.
      if (/^[1-9]$/.test(e.key) && state.quiz && state.quiz.picked < 0) {
        const i = Number(e.key) - 1;
        if (i < state.quiz.choices.length) answerQuiz(i);
      } else if ((e.code === 'Space' || e.key === 'Enter') && state.quiz && state.quiz.picked >= 0) {
        if (/BUTTON|A/.test(tag)) return;
        e.preventDefault(); move(1);
      }
      return;
    }
    if (e.code === 'Space' || e.key === 'Enter') {
      if (/BUTTON|A/.test(tag)) return; // let a focused control handle it
      e.preventDefault(); toggleReveal();
    }
    else if (state.revealed && e.key === '1') mark('again');
    else if (state.revealed && e.key === '2') mark('pass');
    else if (state.revealed && e.key === '3') mark('easy');
  });

  initOverlayDismiss();
  buildDeck();
  renderCard();
  registerServiceWorker();
}

// Service worker: offline cache + auto-update. When a new worker installs
// (after a deploy that bumped the cache name), promote it immediately and
// reload once so the user is always on the latest version — no manual refresh.
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
  navigator.serviceWorker.register('sw.js').then((reg) => {
    // Promote a worker that's already waiting (e.g. from a prior visit).
    if (reg.waiting && navigator.serviceWorker.controller) reg.waiting.postMessage('SKIP_WAITING');
    reg.addEventListener('updatefound', () => {
      const next = reg.installing;
      if (!next) return;
      next.addEventListener('statechange', () => {
        if (next.state === 'installed' && navigator.serviceWorker.controller) {
          next.postMessage('SKIP_WAITING');
        }
      });
    });
    // Check for a new version on load and whenever the tab regains focus, so a
    // long-open tab still picks up a deploy.
    reg.update();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update();
    });
  }).catch(() => {});
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
