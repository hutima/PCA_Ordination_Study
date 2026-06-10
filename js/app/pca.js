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
  selected: new Set(),     // selected set keys
  deck: [],                // ordered array of card objects for this session
  pos: 0,
  revealed: false,
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

// ── Deck building (due-first) ──────────────────────────────────────────
function buildDeck() {
  const now = Date.now();
  const cards = cardsForKeys(effectiveSetKeys());
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
    area.innerHTML = `<div class="empty-state"><p>Choose one or more subjects, then press <strong>Start studying</strong>.</p></div>`;
    renderDeckMeta();
    return;
  }
  const card = state.deck[state.pos];
  const refsHtml = (card.refs && card.refs.length)
    ? `<div class="qa-refs">${card.refs.map(r => `<span class="qa-ref-chip">${escapeText(r)}</span>`).join('')}</div>`
    : '';
  const answerBlock = state.revealed
    ? `<div class="qa-divider"></div><div class="qa-answer">${renderMarkdown(card.a)}</div>${refsHtml}`
    : `<div class="qa-reveal-hint">Recall the answer, then reveal.</div>`;

  const revealRow = state.revealed
    ? ''
    : `<div class="reveal-row"><button class="quick-btn quick-primary" id="revealBtn" type="button">Reveal answer</button></div>`;

  const markRow = state.revealed
    ? `<div class="mark-row" style="display:flex">
         <button class="mark-btn mark-again" data-outcome="again" type="button">✗ Hard</button>
         <button class="mark-btn mark-pass" data-outcome="pass" type="button">~ Uncertain</button>
         <button class="mark-btn mark-easy" data-outcome="easy" type="button">✓ Easy</button>
       </div>`
    : '';

  area.innerHTML = `
    <div class="qa-card">
      <div class="qa-deck-label">${escapeText(card._setLabel)}</div>
      <div class="qa-question">${escapeText(card.q)}</div>
      ${answerBlock}
    </div>
    ${revealRow}
    <div class="nav-row">
      <button class="nav-btn nav-prev" id="prevBtn" type="button">‹ Prev</button>
      <button class="nav-btn" id="nextBtn" type="button">Next ›</button>
    </div>
    ${markRow}
  `;

  const revealBtn = $('revealBtn');
  if (revealBtn) revealBtn.addEventListener('click', reveal);
  $('prevBtn').addEventListener('click', () => move(-1));
  $('nextBtn').addEventListener('click', () => move(1));
  area.querySelectorAll('.mark-btn').forEach(btn =>
    btn.addEventListener('click', () => mark(btn.dataset.outcome)));

  renderDeckMeta();
  renderReviewPanel();
}

function reveal() { state.revealed = true; renderCard(); }
function move(delta) {
  const n = state.deck.length;
  if (!n) return;
  state.pos = (state.pos + delta + n) % n;
  state.revealed = false;
  renderCard();
}
function mark(outcome) {
  if (!state.deck.length) return;
  const card = state.deck[state.pos];
  applyOutcome(card, outcome);
  // Advance to the next card; if at end, rebuild to pick up newly-due ones.
  if (state.pos + 1 >= state.deck.length) {
    buildDeck();
  } else {
    state.pos += 1;
    state.revealed = false;
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

// ── Subject / sub-deck selector ────────────────────────────────────────
function openSelector() {
  renderSelector();
  $('studySelectorOverlay').setAttribute('aria-hidden', 'false');
}
function closeSelector() {
  $('studySelectorOverlay').setAttribute('aria-hidden', 'true');
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
  $('progressOverlay').setAttribute('aria-hidden', 'false');
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
      if (e.target === ov) ov.setAttribute('aria-hidden', 'true');
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
  $('progressCloseBtn').addEventListener('click', () => $('progressOverlay').setAttribute('aria-hidden', 'true'));

  $('modeQuizBtn').addEventListener('click', () =>
    alert('Multiple-choice Quiz mode is coming in a later phase. For now, use Review (self-check).'));

  $('exportBtn').addEventListener('click', exportProgress);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); });
  $('resetProgressBtn').addEventListener('click', resetProgress);

  // Keyboard: space = reveal, 1/2/3 = grade.
  document.addEventListener('keydown', (e) => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (!state.deck.length) return;
    if (e.code === 'Space') { e.preventDefault(); state.revealed ? null : reveal(); }
    else if (state.revealed && e.key === '1') mark('again');
    else if (state.revealed && e.key === '2') mark('pass');
    else if (state.revealed && e.key === '3') mark('easy');
    else if (e.key === 'ArrowRight') move(1);
    else if (e.key === 'ArrowLeft') move(-1);
  });

  initOverlayDismiss();
  buildDeck();
  renderCard();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
