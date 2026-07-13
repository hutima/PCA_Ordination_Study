// PCA Ordination & Licensure Study — controller / entry point.
//
// Thin orchestration over a set of focused modules:
//   store.js     — shared state + persistence (progress, selection, activity)
//   content.js   — content access over window.PCA_DATA
//   quiz.js      — MCQ eligibility + generation
//   answer.js    — provenance rendering + summary derivation
//   refs.js      — reference chips → official-source links
//   modes.js     — study-mode registry (review / quiz / browse / exam)
//   progress.js  — Progress overlay (streak, heatmap, mastery, weak spots)
//   srs.js       — applies an outcome to the SRS scheduler
// See PROJECT_PLAN.md for the full plan and CLAUDE.md for extension points.

import { formatRemainingForTable } from '../domain/srs/scheduler.js';
import { SRS_NEAR_WINDOW_MS, SESSION_IDLE_RESET_MS } from '../domain/srs/constants.js';
import { getConfidencePct, computeCardXpAward } from '../domain/srs/confidence.js';
import { escapeHtml } from '../utils/text.js';
import { installClickShield, shieldClicksBriefly } from '../utils/clickShield.js';
import {
  DATA, state, WEEKS, loadProgress, saveProgress, loadSelection, saveSelection, loadActivity,
  loadShuffle, saveShuffle, loadSelectorGroup, saveSelectorGroup, recordActivity,
  loadSpaced, saveSpaced, loadUnspacedReset, saveUnspacedReset, loadUnspaced, saveUnspaced,
  loadXp, saveXp, addXp, loadWcfDetail, saveWcfDetail,
  loadSound, saveSound, loadCelebrations, saveCelebrations,
} from './store.js';
import {
  effectiveSetKeys, cardsForKeys, shuffle, isWeak,
} from './content.js';
import { buildQuiz, quizDeckCards } from './quiz.js';
import { renderAnswer, summarize, hasMoreThanSummary, directAnswer, resolveCardDetail } from './answer.js';
import { renderRefs } from './refs.js';
import { applyOutcome, applyCatechismOutcome } from './srs.js';
import * as quizSession from './quizSession.js';
import { createModes } from './modes.js';
import { createBrowsePrint } from './browsePrint.js';
import { progressBodyHtml } from './progress.js';
import { initPwaInstall, maybeScheduleInstallPrompt } from './pwaInstall.js';

const $ = (id) => document.getElementById(id);
const escapeText = escapeHtml; // template-literal alias

// ── Deck building (due-first, unspaced book order, or flip deck) ───────
// Sort cards into subject/sub-deck (book) order, stable within a sub-deck.
function bookOrder(cards) {
  const rank = new Map();
  DATA.subjects.slice().sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach(subj => subj.setKeys.forEach(k => rank.set(k, rank.size)));
  const rankOf = (c) => rank.has(c._setKey) ? rank.get(c._setKey) : rank.size;
  return cards.map((c, i) => [c, i])
    .sort((x, y) => rankOf(x[0]) - rankOf(y[0]) || x[1] - y[1])
    .map(x => x[0]);
}
// Sort cards by their next-due timestamp (soonest first), stable on ties. New
// cards (no progress) sort to the front as "due now".
function dueOrder(cards) {
  const at = (c) => { const p = state.progress[c.id]; return p && p.dueAt ? p.dueAt : 0; };
  return cards.map((c, i) => [c, i]).sort((x, y) => at(x[0]) - at(y[0]) || x[1] - y[1]).map(x => x[0]);
}
// Keep the just-graded card from reappearing as the very first card of the next
// cycle: if it lands at the head, swap it into a random later slot.
function avoidHeadCollision(deck) {
  if (!state.lastSeenId || deck.length < 2 || deck[0].id !== state.lastSeenId) return;
  const j = 1 + Math.floor(Math.random() * (deck.length - 1));
  [deck[0], deck[j]] = [deck[j], deck[0]];
}
// Rebuilds the deck (buildDeckCore), then — in Quiz mode — starts a fresh
// scored run over the new deck. Every rebuild (mode entry, Start studying,
// selection change, focus/shuffle/spaced toggles, resets, imports — they all
// call buildDeck) therefore begins a clean run; the previous run's results
// (if still being viewed) are discarded along with it.
function buildDeck(opts = {}) {
  buildDeckCore(opts);
  if (state.mode === 'quiz') quizSession.startRun(state.deck);
}
function buildDeckCore(opts = {}) {
  const now = Date.now();
  let cards = state.mode === 'quiz' ? quizDeckCards() : cardsForKeys(effectiveSetKeys());
  if (state.focus === 'weak') cards = cards.filter(isWeak);
  // Unspaced mode (spaced repetition off): the SRS schedule is ignored, so
  // every card counts as due. The review deck additionally retires graded
  // cards for the day (see unspacedMark) and re-presents them per the
  // daily-reset toggle.
  const isDue = (c) => { if (!state.spacedOn) return true; const p = state.progress[c.id]; return !p || !p.dueAt || p.dueAt <= now; };
  if (!state.spacedOn && state.mode === 'review') {
    cards = cards.filter(c => !state.unspacedDone.has(c.id));
    state.deck = (state.shuffleOn && state.focus !== 'order') ? shuffle(cards) : bookOrder(cards);
    state.dueCount = 0;
    state.pos = 0;
    syncCardState();
    return;
  }
  if (state.focus === 'order') {
    // Unspaced read-through: the whole selection in subject/sub-deck order,
    // ignoring the SRS schedule. Grading still records progress as usual.
    state.deck = bookOrder(cards);
    state.dueCount = cards.filter(isDue).length;
    state.pos = 0;
    syncCardState();
    return;
  }
  if (state.focus === 'flip') {
    // Non-spaced flip deck (from the Duff tool): the whole selection minus
    // cards retired this session. Grading recycles or retires — see mark().
    cards = cards.filter(c => !state.flipArchived.has(c.id));
    state.deck = state.shuffleOn ? shuffle(cards) : bookOrder(cards);
    state.dueCount = 0;
    state.pos = 0;
    syncCardState();
    return;
  }

  // ── Three-section spaced deck (ported from the Duff tool) ──────────────
  //   active   — due-now cards in the in-flight rotation; order is preserved
  //              across rebuilds (`state.spacedActiveIds`) so reviewing one
  //              card doesn't reshuffle the rest of the session.
  //   middle   — cards that became due mid-session (their timer expired or an
  //              "Again" pushed them back); parked behind active so they don't
  //              interrupt the rotation, promoted into active on the next
  //              fresh start.
  //   deferred — not due yet (dueAt in the future). With shuffle on these are
  //              shuffled too (the user asked for unseen cards to be shuffled),
  //              otherwise ordered by soonest-due.
  let due = cards.filter(isDue);
  let deferred = cards.filter(c => !isDue(c));

  // Backstop: if nothing is due but cards come due within 30 minutes, pull them
  // forward so the user never lands on a dead deck.
  if (!due.length && deferred.length) {
    const near = deferred.filter(c => { const p = state.progress[c.id]; return p && p.dueAt && p.dueAt <= now + SRS_NEAR_WINDOW_MS; });
    if (near.length) {
      near.forEach(c => { const p = state.progress[c.id]; p.dueAt = now; p.intervalDays = 0; });
      saveProgress();
      due = cards.filter(isDue);
      deferred = cards.filter(c => !isDue(c));
    }
  }

  const dueIds = new Set(due.map(c => c.id));
  const carried = (state.spacedActiveIds || []).filter(id => dueIds.has(id));
  const idleReset = state.lastStudyAt && (now - state.lastStudyAt > SESSION_IDLE_RESET_MS);
  // Fresh start: collapse everything due into a freshly-ordered active pile.
  const freshStart = opts.forceShuffle || idleReset || carried.length === 0;

  let active, middle;
  if (freshStart) {
    active = state.shuffleOn ? shuffle([...due]) : dueOrder(due);
    middle = [];
  } else {
    // Resume: preserve the in-flight active order from the previous deck;
    // newly-due cards collect in middle.
    const carriedSet = new Set(carried);
    const seen = new Set();
    const fromPrev = [];
    for (const c of state.deck) {
      if (!c || !carriedSet.has(c.id) || seen.has(c.id)) continue;
      const m = due.find(d => d.id === c.id);
      if (m) { fromPrev.push(m); seen.add(c.id); }
    }
    const orphans = carried.filter(id => !seen.has(id)).map(id => due.find(d => d.id === id)).filter(Boolean);
    active = [...fromPrev, ...orphans];
    middle = dueOrder(due.filter(c => !carriedSet.has(c.id)));
  }
  avoidHeadCollision(active);
  state.spacedActiveIds = active.map(c => c.id);
  const orderedDeferred = state.shuffleOn ? shuffle([...deferred]) : dueOrder(deferred);
  state.deck = [...active, ...middle, ...orderedDeferred];
  state.dueCount = active.length + middle.length;
  state.pos = 0;
  syncCardState();
}

// Prepare per-card transient state for the current position.
function syncCardState() {
  state.revealed = false;
  state.quizFlipOutcome = null; // any rebuild/navigation clears a pending flip grade
  const card = state.deck[state.pos];
  state.quiz = (state.mode === 'quiz' && card) ? buildQuiz(card) : null;
}

// ── Render helpers exposed to modes via ctx ────────────────────────────
function setDeckMeta(html) {
  const meta = $('deckMeta');
  if (!meta) return;
  if (html === '') { meta.textContent = ''; return; }
  meta.innerHTML = html;
}
// Retired flip-deck cards that belong to the ACTIVE mode's card universe.
// One flip session spans mode switches (a card retired in Quiz stays retired
// in Review), but each mode's meta only counts its own cards — the quiz deck
// includes authored bank questions the review deck doesn't, and vice versa.
function flipRetiredCount() {
  if (!state.flipArchived.size) return 0;
  const cards = state.mode === 'quiz' ? quizDeckCards() : cardsForKeys(effectiveSetKeys());
  return cards.reduce((n, c) => n + (state.flipArchived.has(c.id) ? 1 : 0), 0);
}
function renderSessionMeta() {
  if (!state.deck.length) { setDeckMeta(''); return; }
  const total = state.deck.length;
  // Quiz: say plainly how many of the selected cards are quiz-ready, plus the
  // focus-specific counts (due / retired), so the deck size is never a mystery.
  if (state.mode === 'quiz') {
    if (quizSession.viewingResults()) { setDeckMeta('Quiz · scored-run results'); return; }
    const selCount = cardsForKeys(effectiveSetKeys()).length;
    const parts = [`<strong>${total}</strong> quiz questions`];
    if (state.focus === 'flip') parts.push(`<strong>${flipRetiredCount()}</strong> retired`);
    else if (state.spacedOn && state.focus === 'due') parts.push(`<strong>${state.dueCount}</strong> due`);
    if (!state.spacedOn) parts.push('unspaced');
    parts.push(`question ${state.pos + 1} of ${total}`);
    const eligible = quizDeckCards().length;
    const note = eligible < selCount
      ? `<br>Quiz has <strong>${eligible}</strong> fact-style questions from your <strong>${selCount}</strong> selected cards — longer self-check cards are covered in Review &amp; Browse.`
      : '';
    setDeckMeta(parts.join(' · ') + note);
    return;
  }
  if (state.focus === 'flip') {
    setDeckMeta(`<strong>${total}</strong> in the pile · <strong>${flipRetiredCount()}</strong> retired · card ${state.pos + 1} of ${total}`);
    return;
  }
  if (!state.spacedOn && state.mode === 'review') {
    setDeckMeta(`<strong>${total}</strong> in the pile · <strong>${state.unspacedDone.size}</strong> retired · card ${state.pos + 1} of ${total} · unspaced`);
    return;
  }
  const due = state.dueCount || 0;
  setDeckMeta(`<strong>${due}</strong> due · <strong>${total}</strong> in session · card ${state.pos + 1} of ${total}`);
}
function emptyState(html) { return `<div class="empty-state"><p>${html}</p></div>`; }
function navRowHtml() {
  return `<div class="nav-row">
      <button class="nav-btn nav-prev" id="prevBtn" type="button">‹ Prev</button>
      <button class="nav-btn nav-next" id="nextBtn" type="button">Next ›</button>
    </div>`;
}
function wireNav() {
  const p = $('prevBtn'); if (p) p.addEventListener('click', () => move(-1));
  const n = $('nextBtn'); if (n) n.addEventListener('click', () => move(1));
}

// Keep the card's top edge visually stable across re-renders that change the
// card's height (reveal/hide, prev/next). Without this, collapsing a long
// answer shrinks the document and the browser clamps the scroll position —
// the page appears to jump. If the card top was on-screen it stays exactly
// where it was; if the user had scrolled deep into a long answer, the next
// render pins the question just below the top of the viewport.
function withCardAnchor(render) {
  const sel = '#cardArea .qa-card';
  const before = document.querySelector(sel);
  if (!before) { render(); return; }
  const prevTop = before.getBoundingClientRect().top;
  render();
  const after = document.querySelector(sel);
  if (!after) return;
  const visible = prevTop >= 0 && prevTop <= window.innerHeight * 0.6;
  const delta = after.getBoundingClientRect().top - (visible ? prevTop : 12);
  if (Math.abs(delta) > 2) window.scrollBy(0, delta);
}

// ── Controller deck operations (used by review mode + keyboard) ────────
function toggleReveal() { state.revealed = !state.revealed; withCardAnchor(renderCard); }
function move(delta) {
  // Quiz + Flip deck: once a card is answered it leaves its slot on the next
  // move — retired for the session if correct, recycled to the back if wrong
  // (the grade is applied here, not on answer, so the feedback stays visible).
  if (state.quizFlipOutcome) { applyQuizFlip(); return; }
  const n = state.deck.length;
  if (!n) return;
  state.pos = (state.pos + delta + n) % n;
  syncCardState();
  withCardAnchor(renderCard);
}
// Quiz grading — the mode-aware counterpart of mark(). (Quiz used to call
// applyOutcome directly from modes.js, which bypassed the flip-deck rules, so
// Flip deck never retired or recycled anything under Quiz.) Under Flip deck no
// SRS is written — the Review flip-deck convention: XP + the activity log
// only. Every other focus applies the usual SRS outcome (which itself falls
// back to XP/activity-only while spaced repetition is off).
function quizOutcome(correct) {
  const card = state.deck[state.pos];
  if (!card) return;
  state.lastSeenId = card.id;
  state.lastStudyAt = Date.now();
  if (state.focus === 'flip') {
    state.quizFlipOutcome = correct ? 'retire' : 'recycle';
    addXp(computeCardXpAward(correct ? 'easy' : 'again', false, false));
    recordActivity();
    return;
  }
  applyOutcome(card, correct ? 'easy' : 'again');
}
function applyQuizFlip() {
  const retire = state.quizFlipOutcome === 'retire';
  state.quizFlipOutcome = null;
  const [card] = state.deck.splice(state.pos, 1);
  if (retire) state.flipArchived.add(card.id);
  else state.deck.push(card);
  if (state.pos >= state.deck.length) {
    // End of a pass — reshuffle what's still in play and start over.
    if (state.shuffleOn) shuffle(state.deck);
    state.pos = 0;
  }
  syncCardState();
  withCardAnchor(renderCard);
}
function mark(outcome) {
  if (!state.deck.length) return;
  state.lastSeenId = state.deck[state.pos] ? state.deck[state.pos].id : null;
  if (state.focus === 'flip' && state.mode === 'review') { flipMark(outcome); return; }
  if (!state.spacedOn && state.mode === 'review') { unspacedMark(outcome); return; }
  applyOutcome(state.deck[state.pos], outcome);
  advance();
}
// Unspaced grading (spaced repetition off): the SRS schedule is untouched and
// only the activity log records the rep. "Hard" recycles the card to the back
// of the pile; "Uncertain"/"Easy" retire it for the day (persisted, day-stamped
// so the daily-reset toggle can re-present it). buildDeck filters retired cards.
function unspacedMark(outcome) {
  const [card] = state.deck.splice(state.pos, 1);
  if (outcome === 'again') {
    state.deck.push(card);
  } else {
    state.unspacedDone.add(card.id);
    saveUnspaced();
  }
  state.lastStudyAt = Date.now();
  addXp(computeCardXpAward(outcome, false, false));
  recordActivity();
  if (state.pos >= state.deck.length) {
    if (state.shuffleOn && state.focus !== 'order') shuffle(state.deck);
    state.pos = 0;
  }
  syncCardState();
  withCardAnchor(renderCard);
}
function resetUnspaced() {
  state.unspacedDone.clear();
  saveUnspaced();
  buildDeck({ forceShuffle: true });
  renderCard();
}
// Flip-deck grading (non-spaced, ported from the Duff tool): Hard/Uncertain
// send the card to the back of the pile, Easy retires it for this session.
// The SRS schedule is untouched; only the daily-activity log records the rep.
function flipMark(outcome) {
  const [card] = state.deck.splice(state.pos, 1);
  if (outcome === 'easy') state.flipArchived.add(card.id);
  else state.deck.push(card);
  state.lastStudyAt = Date.now();
  addXp(computeCardXpAward(outcome, false, false));
  recordActivity();
  if (state.pos >= state.deck.length) {
    // End of a pass — reshuffle what's still in play and start over.
    if (state.shuffleOn) shuffle(state.deck);
    state.pos = 0;
  }
  syncCardState();
  withCardAnchor(renderCard);
}
function resetFlipDeck() {
  state.flipArchived.clear();
  buildDeck({ forceShuffle: true });
  renderCard();
}
// Move to the next card after grading. In spaced mode the user cycles the
// active+middle "due" set; once it's exhausted we rebuild (reviewed cards have
// scheduled forward and drop out; middle promotes into active). When nothing is
// due we walk the deferred deck and rebuild at the very end. Resuming uses the
// preserved active order (no forceShuffle).
function advance() {
  state.lastStudyAt = Date.now();
  const limit = (state.spacedOn && state.dueCount > 0) ? state.dueCount : state.deck.length;
  if (state.pos + 1 >= Math.min(limit, state.deck.length)) buildDeck();
  else { state.pos += 1; syncCardState(); }
  withCardAnchor(renderCard);
}

// ── Quiz scored-run controls (results open only on the user's next action) ─
// The forward nav button in Quiz: once the run is over (complete, or ended
// early — the score is frozen either way) it opens the results screen instead
// of advancing past the last card.
function quizAdvance() {
  if (quizSession.hasRun() && quizSession.isOver() && !quizSession.viewingResults()) {
    quizSession.openResults();
    renderCard();
  } else {
    move(1);
  }
}
// "Take another quiz" from the results screen: a plain forced-shuffle rebuild
// (which itself starts a fresh scored run — see buildDeck above).
function restartQuiz() {
  quizSession.closeResults();
  buildDeck({ forceShuffle: true });
  renderCard();
}
// "Review missed" from the results screen: a practice run over just the
// missed cards — scored, but flagged practice so finalize() never writes a
// high-score record (a short missed-only retry could otherwise beat a
// full-length record).
function startQuizPractice(cards) {
  quizSession.closeResults();
  state.deck = shuffle(cards.slice());
  state.pos = 0;
  syncCardState();
  quizSession.startRun(state.deck, { practice: true });
  renderCard();
}

// ── Browse card export/print (selection mode + native window.print) ────
const browsePrint = createBrowsePrint({
  escapeHtml, renderAnswer, renderRefs, resolveCardDetail, DATA,
  rerenderBrowse: () => renderCard(),
});

// ── Mode registry ──────────────────────────────────────────────────────
const MODES = createModes({
  state, DATA, escapeHtml,
  renderAnswer, summarize, hasMoreThanSummary, directAnswer, renderRefs, resolveCardDetail,
  buildQuiz, applyOutcome, applyCatechismOutcome, getConfidencePct, rerender: renderCard, mark, quizOutcome, move, toggleReveal,
  withCardAnchor, effectiveSetKeys, shuffle,
  emptyState, navRowHtml, wireNav, setDeckMeta, browsePrint,
  quizAdvance, restartQuiz, startQuizPractice,
});

function setMode(modeId) {
  const mode = MODES.byId[modeId];
  if (!mode) return;
  if (modeId !== 'browse') browsePrint.reset(); // leaving Browse ends any export selection
  state.mode = modeId;
  document.querySelectorAll('[data-mode]').forEach(b =>
    b.classList.toggle('active', b.getAttribute('data-mode') === modeId));
  updateFocusVisibility();
  if (mode.start) mode.start();
  else if (mode.usesDeck) buildDeck({ forceShuffle: true });
  renderCard();
}

function updateFocusVisibility() {
  const row = $('focusRow');
  const mode = MODES.byId[state.mode];
  if (row) row.style.display = (mode && mode.focusable) ? '' : 'none';
}
function setFocus(f) {
  state.focus = (f === 'weak' || f === 'order' || f === 'flip') ? f : 'due';
  syncToggleActive('[data-focus]', 'data-focus', state.focus);
  updateAdvancedButtons();
  buildDeck({ forceShuffle: true });
  renderCard();
}
function toggleShuffle() {
  if (state.focus === 'order') return; // parked while In order is the focus
  state.shuffleOn = !state.shuffleOn;
  saveShuffle();
  updateAdvancedButtons();
  buildDeck({ forceShuffle: true });
  renderCard();
}
// Spaced repetition master switch. Off = unspaced: ignore the SRS schedule,
// log reps to the activity heatmap only, and shape the deck by the unspaced
// retire/recycle rules (see unspacedMark) with an optional daily reset.
function toggleSpaced() {
  state.spacedOn = !state.spacedOn;
  saveSpaced();
  updateAdvancedButtons();
  updateResetLabels();
  buildDeck({ forceShuffle: true });
  renderCard();
}
function toggleUnspacedReset() {
  if (state.spacedOn) return; // meaningful only while spaced repetition is off
  state.unspacedDailyReset = !state.unspacedDailyReset;
  saveUnspacedReset();
  updateAdvancedButtons();
}
function toggleSound() {
  state.soundOn = !state.soundOn;
  saveSound();
  updateAdvancedButtons();
}
function toggleCelebrations() {
  state.celebrationsOn = !state.celebrationsOn;
  saveCelebrations();
  updateAdvancedButtons();
}
// Reflect a toggle's state: slide the switch pill, sync aria on the row button,
// and dim/park it when disabled. `btnId` = the `.toggle-label` button, `switchId`
// = its `.toggle-switch` pill. "In order" is by definition unshuffled, so the
// shuffle toggle is parked while it's the focus; the daily-reset toggle is
// meaningful only while spaced repetition is off.
function setToggle(btnId, switchId, on, disabled) {
  const sw = $(switchId);
  if (sw) sw.classList.toggle('on', on);
  const b = $(btnId);
  if (!b) return;
  b.setAttribute('aria-checked', String(on));
  b.classList.toggle('is-disabled', !!disabled);
  b.setAttribute('aria-disabled', String(!!disabled));
}
function updateAdvancedButtons() {
  setToggle('shuffleToggle', 'shuffleBtn', state.shuffleOn, state.focus === 'order');
  setToggle('spacedToggle', 'spacedBtn', state.spacedOn, false);
  setToggle('unspacedResetToggle', 'unspacedResetBtn', state.unspacedDailyReset, state.spacedOn);
  setToggle('soundToggle', 'soundBtn', state.soundOn, false);
  setToggle('celebrateToggle', 'celebrateBtn', state.celebrationsOn, false);
}
// Inject a circled (i) into each Advanced-settings toggle that opens a
// describe-modal with the toggle's full title text — so the row itself stays a
// short label + switch instead of a wall of inline description (ported from the
// Duff tool). The (i) stops propagation so it never flips the switch.
function installToggleInfo() {
  const container = $('advSettings');
  if (!container) return;
  container.querySelectorAll('.toggle-label[title]').forEach(label => {
    if (label.querySelector('.toggle-info')) return;
    const info = document.createElement('span');
    info.className = 'toggle-info';
    info.setAttribute('role', 'button');
    info.setAttribute('tabindex', '0');
    info.setAttribute('aria-label', 'What this setting does');
    info.textContent = 'i';
    const open = (e) => { e.preventDefault(); e.stopPropagation(); showToggleInfo(label); };
    info.addEventListener('click', open);
    info.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(e); });
    label.appendChild(info);
  });
}
function showToggleInfo(label) {
  const textEl = label.querySelector('.toggle-text');
  const t = $('toggleInfoTitle'); if (t) t.textContent = textEl ? textEl.textContent.trim() : 'Setting';
  const body = $('toggleInfoBody'); if (body) body.textContent = label.getAttribute('title') || '';
  showOverlay('toggleInfoOverlay');
}

// ── 12-week study plan (Schedule of Assignments) ───────────────────────
// The week plan is shown inside the selector modal as a "By week" grouping —
// each week is a collapsible card (select-all on its header) that expands to
// one nested collapsible per syllabus column (Book Outlines, Book Contents,
// Bible Content, Doctrines & Proofs, Theology, Catechism, History, BCO, Hot
// Topic), matching the printed schedule. Per-week data lives in
// js/data/week_plan.js; this is the fixed column order + labels.
const WEEK_COLUMNS = [
  { key: 'personal',  label: 'Personal Religion & Call', noun: 'sub-deck' },
  { key: 'outlines',  label: 'Book Outlines',            noun: 'book' },
  { key: 'contents',  label: 'Book Contents',            noun: 'book' },
  { key: 'bible',     label: 'Bible Content',            noun: 'sub-deck' },
  { key: 'doctrines', label: 'Doctrines & Proofs',       noun: 'sub-deck' },
  { key: 'theology',  label: 'Theology',                 noun: 'sub-deck' },
  { key: 'confession', label: 'Westminster Confession',  noun: 'chapter' },
  { key: 'catechism', label: 'Catechism',                noun: 'deck' },
  { key: 'history',   label: 'History',                  noun: 'sub-deck' },
  { key: 'bco',       label: 'Book of Church Order',      noun: 'sub-deck' },
  { key: 'hotTopic',  label: 'Hot Topic',                noun: 'deck' },
];
// Build a week's expanded body: a leading focus note (weeks 1/13), then one
// nested collapsible per populated column (in schedule order). Every column is a
// set of selectable decks (`cat.books` for the per-book columns, `cat.sets`
// otherwise — incl. the per-week catechism sub-deck and its one or two hot-topic
// decks). Returns { body, allKeys } so the week header's "Select all" toggles
// every deck/book the week assigns.
function weekBodyHtml(w) {
  let body = '';
  const allKeys = [];
  if (w.focus) {
    body += `<div class="week-assign"><span class="week-assign-label">This week</span>` +
      `<p class="week-focus">${escapeText(w.focus)}</p></div>`;
  }
  for (const col of WEEK_COLUMNS) {
    const cat = w[col.key];
    if (!cat) continue;
    const keys = (cat.books || cat.sets || []).filter(k => DATA.sets[k]);
    if (!keys.length) continue;
    allKeys.push(...keys);
    body += groupHtml({
      id: `week:${w.week}:${col.key}`,
      title: col.label, subtitle: cat.sub, keys,
      showSubject: true, noun: col.noun, level: 2,
    });
  }
  return { body, allKeys };
}
function setSelectorGroup(mode) {
  state.selectorGroupBy = mode === 'week' ? 'week' : 'subject';
  saveSelectorGroup();
  syncToggleActive('[data-groupby]', 'data-groupby', state.selectorGroupBy);
  renderSelector();
}

// ── Top-level render ───────────────────────────────────────────────────
function renderCard() {
  const area = $('cardArea');
  const mode = MODES.byId[state.mode] || MODES.byId.review;
  if (!mode.usesDeck) {
    mode.render(area);
    $('reviewPanel').classList.remove('show');
    return;
  }
  if (!state.deck.length) {
    let msg;
    if (!state.selected.size) {
      msg = `Choose one or more subjects, then press <strong>Start studying</strong>.`;
    } else if (state.focus === 'flip' && state.flipArchived.size) {
      msg = `Flip deck finished — you've retired all <strong>${flipRetiredCount()}</strong> cards. 🎉<br>
        <button class="quick-btn" id="flipResetBtn" type="button" style="margin-top:12px">↻ Restart the deck</button>`;
    } else if (!state.spacedOn && state.mode === 'review' && state.unspacedDone.size) {
      const note = state.unspacedDailyReset ? ' They come back tomorrow (daily reset is on).' : '';
      msg = `Unspaced deck finished — you've retired all <strong>${state.unspacedDone.size}</strong> cards. 🎉${note}<br>
        <button class="quick-btn" id="unspacedResetBtnInline" type="button" style="margin-top:12px">↻ Restart the deck</button>`;
    } else if (state.focus === 'weak') {
      msg = state.mode === 'quiz'
        ? `No weak quiz-ready cards yet. Weak spots are cards you've already studied and scored under 60% on — grade some cards first (in Quiz or Review), then come back. Switch to <strong>Due first</strong> to quiz the whole selection.`
        : `No weak spots in this selection yet. Weak spots are cards you've studied and scored under 60% on — keep reviewing and they'll collect here. Switch back to <strong>Due first</strong> to keep studying.`;
    } else if (state.mode === 'quiz') {
      const selCount = cardsForKeys(effectiveSetKeys()).length;
      msg = `None of the <strong>${selCount}</strong> cards in this selection are quiz-ready. Quiz works on fact-style cards (short answers, passages, key terms/people) — longer self-check cards are covered in <strong>Review</strong> and <strong>Browse</strong>. Pick more subjects to add quiz questions.`;
    } else {
      msg = `Choose one or more subjects, then press <strong>Start studying</strong>.`;
    }
    area.innerHTML = emptyState(msg);
    const fr = $('flipResetBtn');
    if (fr) fr.addEventListener('click', resetFlipDeck);
    const ur = $('unspacedResetBtnInline');
    if (ur) ur.addEventListener('click', resetUnspaced);
    renderSessionMeta();
    renderReviewPanel();
    return;
  }
  mode.render(area);
  renderSessionMeta();
  renderReviewPanel();
}

// ── Session / progress side panel ──────────────────────────────────────
function renderReviewPanel() {
  const panel = $('reviewPanel');
  if (!state.deck.length) { panel.classList.remove('show'); return; }
  panel.classList.add('show');
  $('reviewStats').innerHTML =
    `Session deck — ${state.deck.filter(c => state.progress[c.id] && state.progress[c.id].reps).length}/${state.deck.length} reviewed`;
  $('reviewList').innerHTML = state.deck.map((c, i) => {
    const p = state.progress[c.id];
    const pct = p ? getConfidencePct(p) : null;
    const due = p && p.dueAt ? formatRemainingForTable(p.dueAt) : 'new';
    const pctTxt = pct == null ? '—' : `${pct}%`;
    const here = i === state.pos ? ' style="color:var(--gold-light)"' : '';
    return `<div class="review-item"${here}>${escapeText(c.q.slice(0, 60))}${c.q.length > 60 ? '…' : ''}
      <span style="float:right; color:var(--muted)">${pctTxt} · ${due}</span></div>`;
  }).join('');
}

// ── Overlays ───────────────────────────────────────────────────────────
function showOverlay(id) { const ov = $(id); ov.classList.add('show'); ov.setAttribute('aria-hidden', 'false'); }
function hideOverlay(id) { const ov = $(id); ov.classList.remove('show'); ov.setAttribute('aria-hidden', 'true'); }

function openProgress() {
  const { html, hasWeak } = progressBodyHtml();
  $('progressBody').innerHTML = html;
  if (hasWeak) {
    const sw = $('studyWeakBtn');
    if (sw) sw.addEventListener('click', () => { hideOverlay('progressOverlay'); setMode('review'); setFocus('weak'); });
  }
  showOverlay('progressOverlay');
}

// ── Subject / sub-deck selector ────────────────────────────────────────
// Tile clicks mutate state.selected live; the selection is applied (saved +
// deck rebuilt) on ANY dismissal — Done, backdrop click, or Escape — so
// clicking off the modal never silently discards the changes. The deck is
// only rebuilt when the selection actually changed, so just peeking at the
// selector doesn't reshuffle the session.
let selectionAtOpen = '';
function selectionFingerprint() { return [...state.selected].sort().join('|'); }
function openSelector() {
  selectionAtOpen = selectionFingerprint();
  renderSelector();
  showOverlay('studySelectorOverlay');
}
function applySelectorChanges() {
  saveSelection();
  if (selectionFingerprint() === selectionAtOpen) return;
  selectionAtOpen = selectionFingerprint();
  state.flipArchived.clear(); // a new selection starts a fresh flip-deck pass
  buildDeck({ forceShuffle: true });
  renderCard();
}
function closeSelector() {
  hideOverlay('studySelectorOverlay');
  applySelectorChanges();
}
const openSubdeckGroups = new Set();
// One sub-deck/book as a selectable full-width row ("topic link"). In views
// that mix subjects (by-week, the BCO chapter groups) we tag the row with its
// subject.
function deckRowHtml(k, showSubject) {
  const set = DATA.sets[k];
  if (!set) return '';
  const on = state.selected.has(k);
  let meta = `${set.cards.length} cards`;
  if (showSubject) {
    const subj = DATA.subjects.find(s => s.setKeys.includes(k));
    if (subj) meta = `${escapeText(subj.label)} · ${meta}`;
  }
  return `<button class="subdeck-row ${on ? 'selected' : ''}" data-set="${k}" type="button">
    <span class="subdeck-row-title">${escapeText(set.label)}</span>
    <span class="subdeck-row-meta">${meta}</span></button>`;
}
// Every loaded set key under a group descriptor — its own rows plus any nested
// sub-groups — for the "Select all" toggle and the selected-count meta.
function groupLeafKeys(desc) {
  const keys = (desc.keys || []).filter(k => DATA.sets[k]);
  for (const g of desc.groups || []) keys.push(...groupLeafKeys(g));
  return keys;
}
// A collapsible group. The summary shows an optional "Week N" tag, a title +
// subtitle, a selected-count meta, and a Select-all toggle; the body holds
// nested sub-groups and/or selectable rows. A group may instead supply a
// ready-made `bodyHtml` (weeks, whose columns interleave groups and notes) with
// `selectAllKeys` naming the keys its Select-all governs. `level: 2` styles a
// nested sub-group (a week column, a Bible division, a BCO chapter block).
function groupHtml(desc) {
  const leaf = desc.selectAllKeys || groupLeafKeys(desc);
  const onCount = leaf.filter(k => state.selected.has(k)).length;
  const allOn = leaf.length > 0 && onCount === leaf.length;
  const total = leaf.reduce((n, k) => n + DATA.sets[k].cards.length, 0);
  const noun = desc.noun || 'sub-deck';
  const meta = !leaf.length ? (desc.emptyMeta || 'reading only')
    : onCount ? `${onCount}/${leaf.length} selected · ${total} cards`
    : `${leaf.length} ${noun}${leaf.length === 1 ? '' : 's'} · ${total} cards`;
  const selBtn = leaf.length
    ? `<button class="subdeck-group-select ${allOn ? 'selected' : ''}" data-keys="${leaf.join(',')}" type="button"
        title="${allOn ? 'Deselect' : 'Select'} all">${allOn ? 'Deselect all' : 'Select all'}</button>`
    : '';
  const titleBlock = desc.tag
    ? `<span class="group-titlewrap"><span class="group-tag">${escapeText(desc.tag)}</span>
        <span class="subdeck-group-title">${escapeText(desc.title)}</span>
        ${desc.subtitle ? `<span class="group-sub">${escapeText(desc.subtitle)}</span>` : ''}</span>`
    : `<span class="group-titlewrap"><span class="subdeck-group-title">${escapeText(desc.title)}</span>
        ${desc.subtitle ? `<span class="group-sub">${escapeText(desc.subtitle)}</span>` : ''}</span>`;
  const body = desc.bodyHtml != null ? desc.bodyHtml
    : (desc.groups || []).map(g => groupHtml(g)).join('')
      + (desc.keys || []).filter(k => DATA.sets[k]).map(k => deckRowHtml(k, desc.showSubject)).join('');
  const cls = `subdeck-group${desc.level === 2 ? ' subdeck-subgroup' : ''}${onCount ? ' has-selected' : ''}`;
  return `<details class="${cls}" data-group="${desc.id}" ${openSubdeckGroups.has(desc.id) ? 'open' : ''}>
    <summary>${titleBlock}<span class="subdeck-group-meta">${meta}</span>${selBtn}</summary>
    <div class="subdeck-rows">${body}</div></details>`;
}
function renderSelector() {
  const list = $('subjectList');
  if (state.selectorGroupBy === 'week') {
    list.innerHTML = WEEKS.map(w => {
      const { body, allKeys } = weekBodyHtml(w);
      return groupHtml({
        id: `week:${w.week}`,
        tag: `Week ${w.week}`,
        title: w.theme || `Week ${w.week}`,
        subtitle: w.books || '',
        bodyHtml: body, selectAllKeys: allKeys, noun: 'deck',
        emptyMeta: w.week === 13 ? 'review only' : 'reading only',
      });
    }).join('');
  } else {
    list.innerHTML = DATA.subjects.slice().sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(subj => {
        // Subjects with display `groups` (Bible Book Summaries by division, the
        // BCO by chapter block) render as nested sub-groups; the rest are flat.
        if (subj.groups && subj.groups.length) {
          const noun = subj.id === 'bible_books' ? 'book' : subj.id === 'wcf' ? 'chapter' : 'sub-deck';
          const groups = subj.groups
            .map(g => ({ id: g.id, title: g.label, keys: g.keys, showSubject: false, noun, level: 2 }))
            .filter(g => groupLeafKeys(g).length);
          return groupHtml({ id: subj.id, title: subj.label, groups, showSubject: false, noun });
        }
        return groupHtml({ id: subj.id, title: subj.label, keys: subj.setKeys.filter(k => DATA.sets[k]), showSubject: false });
      }).join('');
  }
  // Toggle one topic.
  list.querySelectorAll('[data-set]').forEach(btn => btn.addEventListener('click', () => {
    const k = btn.dataset.set;
    state.selected.has(k) ? state.selected.delete(k) : state.selected.add(k);
    renderSelector();
  }));
  // Select / deselect every leaf key under a group (subject, week, division,
  // chapter block, or week column) — one handler for all of them.
  list.querySelectorAll('[data-keys]').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault(); // a click inside <summary> would also toggle the group open/closed
    toggleKeys(btn.dataset.keys.split(',').filter(Boolean));
  }));
  // Persist each group's open/closed state across the re-render on every click.
  list.querySelectorAll('details[data-group]').forEach(d => d.addEventListener('toggle', () => {
    d.open ? openSubdeckGroups.add(d.dataset.group) : openSubdeckGroups.delete(d.dataset.group);
  }));
}
function toggleKeys(keys) {
  const real = keys.filter(k => DATA.sets[k]);
  const allOn = real.length > 0 && real.every(k => state.selected.has(k));
  real.forEach(k => allOn ? state.selected.delete(k) : state.selected.add(k));
  renderSelector();
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
  // The font swap reflows the page; absorb the iOS ghost click so it can't land
  // on whatever control slid under the finger (see js/utils/clickShield.js).
  shieldClicksBriefly();
}
function setSize(s) {
  document.documentElement.setAttribute('data-text-size', s);
  try { localStorage.setItem('pca_text_size', s); } catch (e) {}
  syncToggleActive('[data-size]', 'data-size', s);
  shieldClicksBriefly(); // text-size change reflows the page — guard the ghost click
}
// WCF card detail (Full text / Summary). Full is the default so WCF questions
// contain the full confession section; Summary is the opt-in concise view. The
// change re-renders the current card/outline so WCF cards flip form immediately.
function setWcfDetail(mode) {
  state.wcfDetail = mode === 'summary' ? 'summary' : 'full';
  saveWcfDetail();
  syncToggleActive('[data-wcf-detail]', 'data-wcf-detail', state.wcfDetail);
  renderCard();
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
  a.href = url; a.download = 'pca-study-progress.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data && data.progress && typeof data.progress === 'object') {
        state.progress = data.progress; saveProgress(); buildDeck({ forceShuffle: true }); renderCard();
        alert('Progress imported.');
      } else { alert('Unrecognized progress file.'); }
    } catch (e) { alert('Could not read that file.'); }
  };
  reader.readAsText(file);
}
// Granular, mode-aware reset. In spaced mode a reset clears SRS progress; in
// unspaced mode it clears the retired-cards pile (so cards re-present). "This
// selection" is scoped to the cards in the currently chosen sub-decks; "all"
// wipes everything on the device.
function selectedCardIds() {
  return new Set(cardsForKeys(effectiveSetKeys()).map(c => c.id));
}
function resetSelectionProgress() {
  if (!state.selected.size) { alert('Choose some subjects first.'); return; }
  const what = state.spacedOn ? 'spaced progress' : 'retired (unspaced) cards';
  if (!confirm(`Reset ${what} for the cards in your current selection? This cannot be undone.`)) return;
  const ids = selectedCardIds();
  if (state.spacedOn) {
    ids.forEach(id => { delete state.progress[id]; });
    saveProgress();
  } else {
    ids.forEach(id => state.unspacedDone.delete(id));
    saveUnspaced();
  }
  buildDeck({ forceShuffle: true }); renderCard();
}
function resetAllProgress() {
  if (!confirm('Erase ALL study progress on this device (spaced and unspaced)? This cannot be undone.')) return;
  state.progress = {}; saveProgress();
  state.unspacedDone.clear(); saveUnspaced();
  state.xp = 0; saveXp();
  buildDeck({ forceShuffle: true }); renderCard();
}
// The reset buttons name what they clear so the action matches the active mode.
function updateResetLabels() {
  const sel = $('resetSelectionBtn');
  const all = $('resetAllBtn');
  if (sel) sel.textContent = state.spacedOn ? 'Reset this selection' : 'Reset selection (unspaced)';
  if (all) all.textContent = 'Reset everything…';
}

// ── Wiring ─────────────────────────────────────────────────────────────
function initOverlayDismiss() {
  // Hiding the subject selector by any route must also apply the selection.
  const dismiss = (ov) => {
    ov.classList.remove('show');
    ov.setAttribute('aria-hidden', 'true');
    if (ov.id === 'studySelectorOverlay') applySelectorChanges();
  };
  document.querySelectorAll('.consent-overlay').forEach(ov => {
    ov.addEventListener('click', (e) => {
      if (e.target === ov) dismiss(ov);
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.consent-overlay.show').forEach(dismiss);
  });
}

function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    const tag = e.target && e.target.tagName;
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (document.querySelector('.consent-overlay.show')) return; // a modal is open
    if (state.mode === 'browse') return; // native <details> handles keyboard
    // A mode may handle its own keys (exam pick/reveal/grade/next, catechism
    // prev/next/reveal).
    const activeMode = MODES.byId[state.mode];
    if (activeMode && activeMode.onKey && activeMode.onKey(e)) return;
    // The exam doesn't use the shared deck; unhandled keys must not leak into
    // deck navigation (state.deck still holds the previous mode's deck).
    if (state.mode === 'exam') return;
    if (!state.deck.length) return;
    // Once the scored run's results screen is showing, deck-navigation keys
    // are ignored entirely — its own buttons take focus/Enter natively.
    if (state.mode === 'quiz' && quizSession.viewingResults()) return;
    if (e.key === 'ArrowRight') {
      if (state.mode === 'quiz') { quizAdvance(); return; }
      move(1); return;
    }
    if (e.key === 'ArrowLeft') { move(-1); return; }
    if (state.mode === 'quiz') {
      if (/^[1-9]$/.test(e.key) && state.quiz && state.quiz.picked < 0) {
        const i = Number(e.key) - 1;
        if (i < state.quiz.choices.length) MODES.byId.quiz.answer(i);
      } else if ((e.code === 'Space' || e.key === 'Enter') && state.quiz && state.quiz.picked >= 0) {
        if (/BUTTON|A/.test(tag)) return;
        e.preventDefault(); quizAdvance();
      }
      return;
    }
    if (e.code === 'Space' || e.key === 'Enter') {
      if (/BUTTON|A/.test(tag)) return;
      e.preventDefault(); toggleReveal();
    }
    // Grading works from both the hidden and revealed sides of the card.
    else if (state.mode === 'review' && e.key === '1') mark('again');
    else if (state.mode === 'review' && e.key === '2') mark('pass');
    else if (state.mode === 'review' && e.key === '3') mark('easy');
  });
}

function init() {
  loadProgress();
  loadSelection();
  loadActivity();
  loadShuffle();
  loadSpaced();
  loadUnspacedReset();
  loadUnspaced(); // applies the daily reset using the loaded reset flag
  loadXp();
  loadWcfDetail();
  loadSelectorGroup();
  loadSound();
  loadCelebrations();
  installClickShield();

  document.querySelectorAll('[data-theme-mode]').forEach(b =>
    b.addEventListener('click', () => setTheme(b.getAttribute('data-theme-mode'))));
  document.querySelectorAll('[data-font]').forEach(b =>
    b.addEventListener('click', () => setFont(b.getAttribute('data-font'))));
  document.querySelectorAll('[data-size]').forEach(b =>
    b.addEventListener('click', () => setSize(b.getAttribute('data-size'))));
  document.querySelectorAll('[data-wcf-detail]').forEach(b =>
    b.addEventListener('click', () => setWcfDetail(b.getAttribute('data-wcf-detail'))));
  syncToggleActive('[data-theme-mode]', 'data-theme-mode', localStorage.getItem('pca_theme') || 'system');
  syncToggleActive('[data-font]', 'data-font', localStorage.getItem('pca_font') || 'sans');
  syncToggleActive('[data-size]', 'data-size', localStorage.getItem('pca_text_size') || 'medium');
  syncToggleActive('[data-wcf-detail]', 'data-wcf-detail', state.wcfDetail);

  $('chooseSubjectBtn').addEventListener('click', openSelector);
  $('selectorDoneBtn').addEventListener('click', closeSelector);
  $('selectorDoneTopBtn').addEventListener('click', closeSelector);
  $('selectorAllBtn').addEventListener('click', () => {
    DATA.subjects.forEach(s => s.setKeys.forEach(k => { if (DATA.sets[k]) state.selected.add(k); }));
    renderSelector();
  });
  const clearSelection = () => { state.selected.clear(); renderSelector(); };
  $('selectorClearBtn').addEventListener('click', clearSelection);
  $('selectorClearTopBtn').addEventListener('click', clearSelection);
  document.querySelectorAll('[data-groupby]').forEach(b =>
    b.addEventListener('click', () => setSelectorGroup(b.getAttribute('data-groupby'))));
  syncToggleActive('[data-groupby]', 'data-groupby', state.selectorGroupBy);
  $('startStudyingBtn').addEventListener('click', () => { state.flipArchived.clear(); buildDeck({ forceShuffle: true }); renderCard(); });
  $('progressBtn').addEventListener('click', openProgress);
  $('progressCloseBtn').addEventListener('click', () => hideOverlay('progressOverlay'));

  document.querySelectorAll('[data-mode]').forEach(b =>
    b.addEventListener('click', () => setMode(b.getAttribute('data-mode'))));
  document.querySelectorAll('[data-focus]').forEach(b =>
    b.addEventListener('click', () => setFocus(b.getAttribute('data-focus'))));
  syncToggleActive('[data-focus]', 'data-focus', state.focus);
  $('shuffleToggle').addEventListener('click', toggleShuffle);
  $('spacedToggle').addEventListener('click', toggleSpaced);
  $('unspacedResetToggle').addEventListener('click', toggleUnspacedReset);
  $('soundToggle').addEventListener('click', toggleSound);
  $('celebrateToggle').addEventListener('click', toggleCelebrations);
  installToggleInfo();
  const tic = $('toggleInfoCloseBtn');
  if (tic) tic.addEventListener('click', () => hideOverlay('toggleInfoOverlay'));
  updateAdvancedButtons();
  updateResetLabels();
  updateFocusVisibility();

  $('exportBtn').addEventListener('click', exportProgress);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); });
  $('resetSelectionBtn').addEventListener('click', resetSelectionProgress);
  $('resetAllBtn').addEventListener('click', resetAllProgress);

  initKeyboard();
  initOverlayDismiss();
  buildDeck();
  renderCard();
  registerServiceWorker();

  // PWA "install to Home Screen" nudge: offered to every phone user who hasn't
  // dismissed it (not just new users). The banner is scheduled with a short
  // delay and re-arms while a modal is open so it lands on a clear screen.
  initPwaInstall();
  maybeScheduleInstallPrompt();
}

// Service worker: offline cache + a blocking update prompt.
//
// The worker now activates itself on install (skipWaiting in sw.js), so a new
// release takes over on the browser's own sw.js refresh — it does NOT depend on
// this page running to promote it. That's deliberate: the previous model only
// promoted the new worker when the page posted SKIP_WAITING from the "Refresh
// now" tap, which deadlocked when the cached app JS was broken (the page that
// would do the promoting never ran). With self-activation a bad release
// self-heals on a plain refresh.
//
// We still NEVER reload the page automatically (that froze iOS standalone PWAs).
// When the new worker takes control we surface a blocking modal
// (#refreshAvailableOverlay) — the old corner banner was easy to ignore, so
// users lingered on a stale cached version. The page reloads only inside the
// user's "Refresh now" tap.
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  let shown = false;
  function showUpdatePrompt() {
    if (shown || !$('refreshAvailableOverlay')) return;
    shown = true;
    showOverlay('refreshAvailableOverlay');
  }

  const refreshBtn = document.getElementById('updateRefreshBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', () => window.location.reload());

  // A new worker claiming control fires controllerchange. The very first one on
  // a fresh install (no controller yet at registration) is initial control, not
  // an update — skip the prompt for it; any later one means a new release is
  // live and the page is still on the old assets, so offer a refresh.
  let initialControl = !navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (initialControl) { initialControl = false; return; }
    showUpdatePrompt();
  });

  navigator.serviceWorker.register('sw.js').then((reg) => {
    // A newer worker that installed on a previous visit is ready right away.
    if (reg.waiting && navigator.serviceWorker.controller) showUpdatePrompt();
    reg.addEventListener('updatefound', () => {
      const next = reg.installing;
      if (!next) return;
      next.addEventListener('statechange', () => {
        if (next.state === 'installed' && navigator.serviceWorker.controller) showUpdatePrompt();
      });
    });
    reg.update();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update();
    });
  }).catch(() => {});
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
