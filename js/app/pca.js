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
import { getConfidencePct } from '../domain/srs/confidence.js';
import { escapeHtml } from '../utils/text.js';
import {
  DATA, state, loadProgress, saveProgress, loadSelection, saveSelection, loadActivity,
} from './store.js';
import {
  effectiveSetKeys, cardsForKeys, shuffle, isWeak,
} from './content.js';
import { buildQuiz, quizDeckCards } from './quiz.js';
import { renderAnswer, summarize, hasMoreThanSummary } from './answer.js';
import { renderRefs } from './refs.js';
import { applyOutcome } from './srs.js';
import { createModes } from './modes.js';
import { progressBodyHtml } from './progress.js';

const EXAM_SIZE = 25;
const $ = (id) => document.getElementById(id);
const escapeText = escapeHtml; // template-literal alias

// ── Deck building (due-first) ──────────────────────────────────────────
function buildDeck() {
  const now = Date.now();
  let cards = state.mode === 'quiz' ? quizDeckCards() : cardsForKeys(effectiveSetKeys());
  if (state.focus === 'weak') cards = cards.filter(isWeak);
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
  syncCardState();
}

// Prepare per-card transient state for the current position.
function syncCardState() {
  state.revealed = false;
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
function renderSessionMeta() {
  if (!state.deck.length) { setDeckMeta(''); return; }
  const total = state.deck.length;
  const due = state.dueCount || 0;
  setDeckMeta(`<strong>${due}</strong> due · <strong>${total}</strong> in session · card ${state.pos + 1} of ${total}`);
}
function emptyState(html) { return `<div class="empty-state"><p>${html}</p></div>`; }
function navRowHtml() {
  return `<div class="nav-row">
      <button class="nav-btn nav-prev" id="prevBtn" type="button">‹ Prev</button>
      <button class="nav-btn" id="nextBtn" type="button">Next ›</button>
    </div>`;
}
function wireNav() {
  const p = $('prevBtn'); if (p) p.addEventListener('click', () => move(-1));
  const n = $('nextBtn'); if (n) n.addEventListener('click', () => move(1));
}

// ── Controller deck operations (used by review mode + keyboard) ────────
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
  applyOutcome(state.deck[state.pos], outcome);
  advance();
}
// Move to the next card after grading; rebuild at the end to pick up newly-due.
function advance() {
  if (state.pos + 1 >= state.deck.length) buildDeck();
  else { state.pos += 1; syncCardState(); }
  renderCard();
}

// ── Mode registry ──────────────────────────────────────────────────────
const MODES = createModes({
  state, DATA, escapeHtml,
  renderAnswer, summarize, hasMoreThanSummary, renderRefs,
  buildQuiz, applyOutcome, rerender: renderCard, mark, move, toggleReveal,
  effectiveSetKeys, quizDeckCards, shuffle,
  emptyState, navRowHtml, wireNav, setDeckMeta, EXAM_SIZE,
});

function setMode(modeId) {
  const mode = MODES.byId[modeId];
  if (!mode) return;
  state.mode = modeId;
  document.querySelectorAll('[data-mode]').forEach(b =>
    b.classList.toggle('active', b.getAttribute('data-mode') === modeId));
  updateFocusVisibility();
  if (mode.start) mode.start();
  else if (mode.usesDeck) buildDeck();
  renderCard();
}

function updateFocusVisibility() {
  const row = $('focusRow');
  const mode = MODES.byId[state.mode];
  if (row) row.style.display = (mode && mode.focusable) ? '' : 'none';
}
function setFocus(f) {
  state.focus = f === 'weak' ? 'weak' : 'due';
  syncToggleActive('[data-focus]', 'data-focus', state.focus);
  buildDeck();
  renderCard();
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
    if (state.focus === 'weak') {
      msg = `No weak spots in this selection yet. Weak spots are cards you've studied and scored under 60% on — keep reviewing and they'll collect here. Switch back to <strong>Due first</strong> to keep studying.`;
    } else if (state.mode === 'quiz') {
      msg = `No quiz-ready cards in this selection. Quiz mode works on fact-style cards (passages, events, key terms/people). Try <strong>Review</strong>, or pick more subjects.`;
    } else {
      msg = `Choose one or more subjects, then press <strong>Start studying</strong>.`;
    }
    area.innerHTML = emptyState(msg);
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
function openSelector() { renderSelector(); showOverlay('studySelectorOverlay'); }
function closeSelector() { hideOverlay('studySelectorOverlay'); saveSelection(); buildDeck(); renderCard(); }
function renderSelector() {
  const subjGrid = $('subjectGrid');
  const subjects = DATA.subjects.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  subjGrid.innerHTML = subjects.map(subj => {
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
  subdeckGrid.innerHTML = subjects.map(subj =>
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
  a.href = url; a.download = 'pca-study-progress.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data && data.progress && typeof data.progress === 'object') {
        state.progress = data.progress; saveProgress(); buildDeck(); renderCard();
        alert('Progress imported.');
      } else { alert('Unrecognized progress file.'); }
    } catch (e) { alert('Could not read that file.'); }
  };
  reader.readAsText(file);
}
function resetProgress() {
  if (!confirm('Erase all study progress on this device? This cannot be undone.')) return;
  state.progress = {}; saveProgress(); buildDeck(); renderCard();
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

function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    const tag = e.target && e.target.tagName;
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (document.querySelector('.consent-overlay.show')) return; // a modal is open
    if (state.mode === 'browse') return; // native <details> handles keyboard
    // A mode may handle its own keys (e.g. catechism prev/next/reveal).
    const activeMode = MODES.byId[state.mode];
    if (activeMode && activeMode.onKey && activeMode.onKey(e)) return;
    if (state.mode === 'exam') {
      const ex = state.exam;
      if (!ex || ex.done) return;
      const q = ex.quizzes[ex.pos];
      if (/^[1-9]$/.test(e.key) && q.picked < 0) {
        const i = Number(e.key) - 1;
        if (i < q.choices.length) MODES.byId.exam.pick(i);
      } else if ((e.code === 'Space' || e.key === 'Enter' || e.key === 'ArrowRight') && q.picked >= 0) {
        if (/BUTTON|A/.test(tag)) return;
        e.preventDefault(); MODES.byId.exam.next();
      }
      return;
    }
    if (!state.deck.length) return;
    if (e.key === 'ArrowRight') { move(1); return; }
    if (e.key === 'ArrowLeft') { move(-1); return; }
    if (state.mode === 'quiz') {
      if (/^[1-9]$/.test(e.key) && state.quiz && state.quiz.picked < 0) {
        const i = Number(e.key) - 1;
        if (i < state.quiz.choices.length) MODES.byId.quiz.answer(i);
      } else if ((e.code === 'Space' || e.key === 'Enter') && state.quiz && state.quiz.picked >= 0) {
        if (/BUTTON|A/.test(tag)) return;
        e.preventDefault(); move(1);
      }
      return;
    }
    if (e.code === 'Space' || e.key === 'Enter') {
      if (/BUTTON|A/.test(tag)) return;
      e.preventDefault(); toggleReveal();
    }
    else if (state.revealed && e.key === '1') mark('again');
    else if (state.revealed && e.key === '2') mark('pass');
    else if (state.revealed && e.key === '3') mark('easy');
  });
}

function init() {
  loadProgress();
  loadSelection();
  loadActivity();

  document.querySelectorAll('[data-theme-mode]').forEach(b =>
    b.addEventListener('click', () => setTheme(b.getAttribute('data-theme-mode'))));
  document.querySelectorAll('[data-font]').forEach(b =>
    b.addEventListener('click', () => setFont(b.getAttribute('data-font'))));
  document.querySelectorAll('[data-size]').forEach(b =>
    b.addEventListener('click', () => setSize(b.getAttribute('data-size'))));
  syncToggleActive('[data-theme-mode]', 'data-theme-mode', localStorage.getItem('pca_theme') || 'system');
  syncToggleActive('[data-font]', 'data-font', localStorage.getItem('pca_font') || 'serif');
  syncToggleActive('[data-size]', 'data-size', localStorage.getItem('pca_text_size') || 'medium');

  $('chooseSubjectBtn').addEventListener('click', openSelector);
  $('selectorDoneBtn').addEventListener('click', closeSelector);
  $('selectorClearBtn').addEventListener('click', () => { state.selected.clear(); renderSelector(); });
  $('startStudyingBtn').addEventListener('click', () => { buildDeck(); renderCard(); });
  $('progressBtn').addEventListener('click', openProgress);
  $('progressCloseBtn').addEventListener('click', () => hideOverlay('progressOverlay'));

  document.querySelectorAll('[data-mode]').forEach(b =>
    b.addEventListener('click', () => setMode(b.getAttribute('data-mode'))));
  document.querySelectorAll('[data-focus]').forEach(b =>
    b.addEventListener('click', () => setFocus(b.getAttribute('data-focus'))));
  syncToggleActive('[data-focus]', 'data-focus', state.focus);
  updateFocusVisibility();

  $('exportBtn').addEventListener('click', exportProgress);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); });
  $('resetProgressBtn').addEventListener('click', resetProgress);

  initKeyboard();
  initOverlayDismiss();
  buildDeck();
  renderCard();
  registerServiceWorker();
}

// Service worker: offline cache + auto-update. A new worker (after a deploy that
// bumped the cache name) is promoted immediately and the page reloads once so
// the user is always on the latest version — no manual refresh.
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // Only reload when an existing controller is *replaced* (i.e. an update).
  // On first install, clients.claim() also fires controllerchange — reloading
  // then would needlessly restart a first-time visitor's session.
  const hadController = !!navigator.serviceWorker.controller;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || refreshing) return;
    refreshing = true;
    window.location.reload();
  });
  navigator.serviceWorker.register('sw.js').then((reg) => {
    if (reg.waiting && navigator.serviceWorker.controller) reg.waiting.postMessage('SKIP_WAITING');
    reg.addEventListener('updatefound', () => {
      const next = reg.installing;
      if (!next) return;
      next.addEventListener('statechange', () => {
        if (next.state === 'installed' && navigator.serviceWorker.controller) next.postMessage('SKIP_WAITING');
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
