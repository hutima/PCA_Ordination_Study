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
import { installClickShield, shieldClicksBriefly } from '../utils/clickShield.js';
import {
  DATA, state, WEEKS, loadProgress, saveProgress, loadSelection, saveSelection, loadActivity,
  loadShuffle, saveShuffle, loadSelectorGroup, saveSelectorGroup, recordActivity,
} from './store.js';
import {
  effectiveSetKeys, cardsForKeys, shuffle, isWeak,
} from './content.js';
import { buildQuiz, quizDeckCards } from './quiz.js';
import { renderAnswer, summarize, hasMoreThanSummary, directAnswer } from './answer.js';
import { renderRefs } from './refs.js';
import { applyOutcome } from './srs.js';
import { createModes } from './modes.js';
import { progressBodyHtml } from './progress.js';

const EXAM_SIZE = 25;
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
function buildDeck() {
  const now = Date.now();
  let cards = state.mode === 'quiz' ? quizDeckCards() : cardsForKeys(effectiveSetKeys());
  if (state.focus === 'weak') cards = cards.filter(isWeak);
  const isDue = (c) => { const p = state.progress[c.id]; return !p || !p.dueAt || p.dueAt <= now; };
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
  const due = [];
  const later = [];
  for (const c of cards) (isDue(c) ? due : later).push(c);
  const dueOrdered = state.shuffleOn ? shuffle(due) : bookOrder(due);
  later.sort((a, b) => state.progress[a.id].dueAt - state.progress[b.id].dueAt);
  state.deck = dueOrdered.concat(later);
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
  if (state.focus === 'flip') {
    setDeckMeta(`<strong>${total}</strong> in the pile · <strong>${state.flipArchived.size}</strong> retired · card ${state.pos + 1} of ${total}`);
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
  const n = state.deck.length;
  if (!n) return;
  state.pos = (state.pos + delta + n) % n;
  syncCardState();
  withCardAnchor(renderCard);
}
function mark(outcome) {
  if (!state.deck.length) return;
  if (state.focus === 'flip' && state.mode === 'review') { flipMark(outcome); return; }
  applyOutcome(state.deck[state.pos], outcome);
  advance();
}
// Flip-deck grading (non-spaced, ported from the Duff tool): Hard/Uncertain
// send the card to the back of the pile, Easy retires it for this session.
// The SRS schedule is untouched; only the daily-activity log records the rep.
function flipMark(outcome) {
  const [card] = state.deck.splice(state.pos, 1);
  if (outcome === 'easy') state.flipArchived.add(card.id);
  else state.deck.push(card);
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
  buildDeck();
  renderCard();
}
// Move to the next card after grading; rebuild at the end to pick up newly-due.
function advance() {
  if (state.pos + 1 >= state.deck.length) buildDeck();
  else { state.pos += 1; syncCardState(); }
  withCardAnchor(renderCard);
}

// ── Mode registry ──────────────────────────────────────────────────────
const MODES = createModes({
  state, DATA, escapeHtml,
  renderAnswer, summarize, hasMoreThanSummary, directAnswer, renderRefs,
  buildQuiz, applyOutcome, rerender: renderCard, mark, move, toggleReveal,
  withCardAnchor, effectiveSetKeys, quizDeckCards, shuffle,
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
  state.focus = (f === 'weak' || f === 'order' || f === 'flip') ? f : 'due';
  syncToggleActive('[data-focus]', 'data-focus', state.focus);
  updateShuffleButton();
  buildDeck();
  renderCard();
}
function toggleShuffle() {
  state.shuffleOn = !state.shuffleOn;
  saveShuffle();
  updateShuffleButton();
  buildDeck();
  renderCard();
}
// "In order" is by definition unshuffled — the toggle is parked while it's on.
function updateShuffleButton() {
  const b = $('shuffleBtn');
  if (!b) return;
  b.classList.toggle('active', state.shuffleOn);
  b.disabled = state.focus === 'order';
  b.setAttribute('aria-pressed', String(state.shuffleOn));
}

// ── 12-week study plan (Schedule of Assignments) ───────────────────────
// The week plan is shown inside the selector modal as a "By week" grouping —
// each week is a collapsible card (select-all on the header) that expands to
// its sub-decks as individual topic links, plus the week's reading/memory
// assignments. See renderWeekGroups().
//
// Build the small "Also this week" caption for a week (the non-deck items:
// catechism numbers, hot topic, book outlines/contents, doctrines).
function weekReadingHtml(w) {
  const r = w.reading || {};
  const items = [];
  if (r.catechism) items.push(`<strong>Catechism:</strong> ${escapeText(r.catechism)}`);
  if (r.outlines) items.push(`<strong>Book outlines:</strong> ${escapeText(r.outlines)}`);
  if (r.contents) items.push(`<strong>Book contents:</strong> ${escapeText(r.contents)}`);
  if (r.doctrines) items.push(`<strong>Doctrines &amp; proofs:</strong> ${escapeText(r.doctrines)}`);
  if (r.bibleContent) items.push(`<strong>Bible content:</strong> ${escapeText(r.bibleContent)}`);
  if (r.history) items.push(`<strong>History:</strong> ${escapeText(r.history)}`);
  if (r.hotTopic) items.push(`<strong>Hot topic:</strong> ${escapeText(r.hotTopic)}`);
  if (r.focus) items.push(escapeText(r.focus));
  if (!items.length) return '';
  return `<div class="week-assign"><span class="week-assign-label">Also this week (reading &amp; memory)</span>` +
    `<ul class="week-assign-list"><li>${items.join('</li><li>')}</li></ul></div>`;
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
      msg = `Flip deck finished — you've retired all <strong>${state.flipArchived.size}</strong> cards. 🎉<br>
        <button class="quick-btn" id="flipResetBtn" type="button" style="margin-top:12px">↻ Restart the deck</button>`;
    } else if (state.focus === 'weak') {
      msg = `No weak spots in this selection yet. Weak spots are cards you've studied and scored under 60% on — keep reviewing and they'll collect here. Switch back to <strong>Due first</strong> to keep studying.`;
    } else if (state.mode === 'quiz') {
      msg = `No quiz-ready cards in this selection. Quiz mode works on fact-style cards (passages, events, key terms/people). Try <strong>Review</strong>, or pick more subjects.`;
    } else {
      msg = `Choose one or more subjects, then press <strong>Start studying</strong>.`;
    }
    area.innerHTML = emptyState(msg);
    const fr = $('flipResetBtn');
    if (fr) fr.addEventListener('click', resetFlipDeck);
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
  buildDeck();
  renderCard();
}
function closeSelector() {
  hideOverlay('studySelectorOverlay');
  applySelectorChanges();
}
const openSubdeckGroups = new Set();
// One sub-deck as a selectable full-width row ("topic link"). In the by-week
// view we also tag each topic with its subject, since a week mixes subjects.
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
// A collapsible group (subject or week): summary with title, a select/deselect-
// all toggle, and a card-count; the expanded body holds the topic rows. Weeks
// pass a `tag` ("Week N") + `subtitle` (the books it covers) so the collapsed
// row reads like a Duff session card.
function groupHtml({ id, tag, title, subtitle, keys, selAttr, selVal, showSubject, extraBody }) {
  const real = keys.filter(k => DATA.sets[k]);
  const total = real.reduce((n, k) => n + DATA.sets[k].cards.length, 0);
  const onCount = real.filter(k => state.selected.has(k)).length;
  const allOn = real.length > 0 && onCount === real.length;
  const meta = !real.length ? 'reading only'
    : onCount ? `${onCount}/${real.length} selected · ${total} cards`
    : `${real.length} sub-deck${real.length === 1 ? '' : 's'} · ${total} cards`;
  const selBtn = real.length
    ? `<button class="subdeck-group-select ${allOn ? 'selected' : ''}" ${selAttr}="${selVal}" type="button"
        title="${allOn ? 'Deselect' : 'Select'} all">${allOn ? 'Deselect all' : 'Select all'}</button>`
    : '';
  const titleBlock = tag
    ? `<span class="group-titlewrap"><span class="group-tag">${escapeText(tag)}</span>
        <span class="subdeck-group-title">${escapeText(title)}</span>
        ${subtitle ? `<span class="group-sub">${escapeText(subtitle)}</span>` : ''}</span>`
    : `<span class="subdeck-group-title">${escapeText(title)}</span>`;
  return `<details class="subdeck-group ${onCount ? 'has-selected' : ''}" data-group="${id}" ${openSubdeckGroups.has(id) ? 'open' : ''}>
    <summary>${titleBlock}<span class="subdeck-group-meta">${meta}</span>${selBtn}</summary>
    <div class="subdeck-rows">${extraBody || ''}${real.map(k => deckRowHtml(k, showSubject)).join('')}</div></details>`;
}
// Subtitle for a week card: the books it covers (outlines · contents).
function weekChaptersSubtitle(w) {
  const r = w.reading || {};
  return [r.outlines, r.contents].filter(Boolean).join(' · ');
}
function renderSelector() {
  const list = $('subjectList');
  if (state.selectorGroupBy === 'week') {
    list.innerHTML = WEEKS.map(w => groupHtml({
      id: `week:${w.week}`,
      tag: `Week ${w.week}`,
      title: w.theme || `Week ${w.week}`,
      subtitle: weekChaptersSubtitle(w),
      keys: w.sets,
      selAttr: 'data-week-select', selVal: String(w.week),
      showSubject: true,
      extraBody: weekReadingHtml(w),
    })).join('');
  } else {
    list.innerHTML = DATA.subjects.slice().sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(subj => groupHtml({
        id: subj.id,
        title: subj.label,
        keys: subj.setKeys.filter(k => DATA.sets[k]),
        selAttr: 'data-subject', selVal: subj.id,
        showSubject: false,
      })).join('');
  }
  // Toggle one topic.
  list.querySelectorAll('[data-set]').forEach(btn => btn.addEventListener('click', () => {
    const k = btn.dataset.set;
    state.selected.has(k) ? state.selected.delete(k) : state.selected.add(k);
    renderSelector();
  }));
  // Select / deselect a whole subject.
  list.querySelectorAll('[data-subject]').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault(); // a click inside <summary> would also toggle the group open/closed
    const subj = DATA.subjects.find(s => s.id === btn.dataset.subject);
    toggleKeys(subj.setKeys.filter(k => DATA.sets[k]));
  }));
  // Select / deselect a whole week.
  list.querySelectorAll('[data-week-select]').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    const w = WEEKS.find(x => String(x.week) === btn.dataset.weekSelect);
    if (w) toggleKeys(w.sets.filter(k => DATA.sets[k]));
  }));
  list.querySelectorAll('details[data-group]').forEach(d => d.addEventListener('toggle', () => {
    d.open ? openSubdeckGroups.add(d.dataset.group) : openSubdeckGroups.delete(d.dataset.group);
  }));
}
function toggleKeys(keys) {
  const allOn = keys.length > 0 && keys.every(k => state.selected.has(k));
  keys.forEach(k => allOn ? state.selected.delete(k) : state.selected.add(k));
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
  loadSelectorGroup();
  installClickShield();

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
  $('selectorDoneTopBtn').addEventListener('click', closeSelector);
  $('selectorAllBtn').addEventListener('click', () => {
    DATA.subjects.forEach(s => s.setKeys.forEach(k => { if (DATA.sets[k]) state.selected.add(k); }));
    renderSelector();
  });
  $('selectorClearBtn').addEventListener('click', () => { state.selected.clear(); renderSelector(); });
  document.querySelectorAll('[data-groupby]').forEach(b =>
    b.addEventListener('click', () => setSelectorGroup(b.getAttribute('data-groupby'))));
  syncToggleActive('[data-groupby]', 'data-groupby', state.selectorGroupBy);
  $('startStudyingBtn').addEventListener('click', () => { state.flipArchived.clear(); buildDeck(); renderCard(); });
  $('progressBtn').addEventListener('click', openProgress);
  $('progressCloseBtn').addEventListener('click', () => hideOverlay('progressOverlay'));

  document.querySelectorAll('[data-mode]').forEach(b =>
    b.addEventListener('click', () => setMode(b.getAttribute('data-mode'))));
  document.querySelectorAll('[data-focus]').forEach(b =>
    b.addEventListener('click', () => setFocus(b.getAttribute('data-focus'))));
  syncToggleActive('[data-focus]', 'data-focus', state.focus);
  $('shuffleBtn').addEventListener('click', toggleShuffle);
  updateShuffleButton();
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

// Service worker: offline cache + user-triggered update. When a new worker
// (after a deploy that bumped the cache name) finishes installing, it stays in
// the "waiting" state and we surface an "Update available" banner instead of
// promoting it automatically. The old code auto-posted SKIP_WAITING and reloaded
// at launch, which freezes iOS standalone PWAs; now the reload only happens
// inside the user's "Refresh now" tap (or the next cold start). Ported from the
// Duff study tool (commit 3a9ef43).
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  let refreshAccepted = false;
  let reloading = false;
  let pendingWorker = null;

  // Only reload once the user has accepted the update — never automatically.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshAccepted || reloading) return;
    reloading = true;
    window.location.reload();
  });

  const banner = document.getElementById('updateBanner');
  function showUpdateBanner(worker) {
    pendingWorker = worker || pendingWorker;
    if (!banner) return;
    banner.classList.add('show');
    banner.setAttribute('aria-hidden', 'false');
  }
  function hideUpdateBanner() {
    if (!banner) return;
    banner.classList.remove('show');
    banner.setAttribute('aria-hidden', 'true');
  }
  function acceptUpdate() {
    refreshAccepted = true;
    hideUpdateBanner();
    const worker = pendingWorker || (navigator.serviceWorker.controller && navigator.serviceWorker.controller);
    try { if (worker) worker.postMessage('SKIP_WAITING'); } catch (_) {}
    // Fallback in case controllerchange never fires (e.g. no waiting worker yet).
    setTimeout(() => {
      if (!reloading) { reloading = true; window.location.reload(); }
    }, 1500);
  }

  const refreshBtn = document.getElementById('updateRefreshBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', acceptUpdate);
  const dismissBtn = document.getElementById('updateDismissBtn');
  if (dismissBtn) dismissBtn.addEventListener('click', hideUpdateBanner);

  navigator.serviceWorker.register('sw.js').then((reg) => {
    // A worker already waiting (alongside an active controller) means an update
    // was installed on a previous visit — offer it immediately.
    if (reg.waiting && navigator.serviceWorker.controller) showUpdateBanner(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const next = reg.installing;
      if (!next) return;
      next.addEventListener('statechange', () => {
        if (next.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner(next);
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
