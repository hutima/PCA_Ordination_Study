// Progress bar + Review panel rendering, plus the "return seen card to deck"
// affordance from the review list. Reads runtime state directly and calls
// back into main.js for the deck helpers that mutate runtime.deck /
// runtime.currentIdx via buildStudyDeck and the unspaced-pile manipulations.

import { runtime } from '../state/runtime.js';
import { compareGreekAlphabetical } from '../utils/greekSort.js';
import { getConfidencePct } from '../domain/srs/confidence.js';
import { formatRemainingForTable, getSrsStage } from '../domain/srs/scheduler.js';
import { getCardReviewLeft, getCardReviewRight, getCardMetaLine } from '../domain/deck/filters.js';
import { isAnalyticsModalOpen } from './modals.js';
import {
  getAllLemmaStats,
  getLemmaFormStatus,
  clearLemmaFormRecent,
  isLemmaFormKnown,
  createValueBreakdownAcc,
  accumulateValueBreakdown,
  finalizeValueBreakdown,
  summarizeLemmaValueBreakdown
} from '../domain/grammar/morph_steps.js';
import { buildDimValueBarsHtml } from './charts.js';

let host = {
  accumulateUsageTime: () => {},
  accumulateActiveStudyTime: () => {},
  updateUsageMeta: () => {},
  getKnownCount: () => 0,
  getDueCount: () => 0,
  getRemainingCards: () => [],
  getHighConfidenceCount: () => 0,
  getWordProgress: () => ({}),
  getMorphCardsForLemma: () => [],
  isMorphologyMode: () => false,
  isParsingMode: () => false,
  renderAnalyticsOverlay: () => {},
  moveCardToBackOfActivePile: () => {},
  buildStudyDeck: () => [],
  renderCard: () => {},
  saveState: () => {},
  getEnabledParsingDims: () => null,
  rebuildParsingDeck: () => {}
};

export function configureProgress(deps) {
  host = { ...host, ...deps };
}

export function renderProgress() {
  if (!document.hidden) {
    host.accumulateUsageTime();
    host.accumulateActiveStudyTime();
  }
  const total = runtime.originalDeck.length || runtime.deck.length;
  const confirmed = host.getKnownCount();
  const remaining = Math.max(total - confirmed, 0);
  const progressPercentEl = document.getElementById('progressPercent');
  host.updateUsageMeta();

  if (runtime.spacedRepetition) {
    const dueCount = host.getDueCount(runtime.originalDeck);
    const nextCard = dueCount && runtime.currentIdx < dueCount ? runtime.currentIdx + 1 : dueCount;
    const progressTextEl = document.getElementById('progressText');
    if (progressTextEl) progressTextEl.textContent = total
      ? `${nextCard} / ${dueCount} due · Confirmed ${confirmed} · Scheduled ${Math.max(total - dueCount, 0)}`
      : '0 / 0';
    const pct = total ? Math.round(((total - dueCount) / total) * 100) : 0;
    const progressFillEl = document.getElementById('progressFill');
    if (progressFillEl) progressFillEl.style.width = pct + '%';
    if (progressPercentEl) progressPercentEl.textContent = `${pct}%`;
    if (isAnalyticsModalOpen()) host.renderAnalyticsOverlay();
    return;
  }

  const cycleSize = host.isMorphologyMode() ? total : (host.getRemainingCards().length || total);
  const nextCard = total && runtime.currentIdx < runtime.deck.length ? Math.min(runtime.currentIdx + 1, cycleSize) : total;
  const progressTextEl2 = document.getElementById('progressText');
  if (progressTextEl2) progressTextEl2.textContent = total
    ? `${nextCard} / ${cycleSize} · Confirmed ${confirmed} · Remaining ${remaining}${host.isMorphologyMode() ? ' · Grammar' : ''}`
    : '0 / 0';
  const pct = total ? Math.round((confirmed / total) * 100) : 0;
  const progressFillEl2 = document.getElementById('progressFill');
  if (progressFillEl2) progressFillEl2.style.width = pct + '%';
  if (progressPercentEl) progressPercentEl.textContent = `${pct}%`;
  if (isAnalyticsModalOpen()) host.renderAnalyticsOverlay();
}

export function renderReview() {
  const panel = document.getElementById('reviewPanel');
  if (!panel) return;
  panel.classList.add('show');

  // Parsing mode has no card-level confidence stats (no SRS / no main-stats
  // writes), so the standard "due now / high / low / unseen" buckets would
  // all read 0 + "unseen". Render a per-paradigm rolling-window summary
  // instead — same paradigmStepStats that the analytics tile uses, scoped
  // to the lemmas the user has actually parsed.
  if (host.isParsingMode && host.isParsingMode()) {
    renderParsingReviewPanel();
    return;
  }

  // Bucket the deck by confidence. A card is "high" when its confidence
  // reads above 75% (matches getHighConfidenceCount); anything else falls
  // into "low" — including untouched cards, so the row-2 totals sum to
  // runtime.originalDeck.length.
  let highCount = 0;
  let lowCount = 0;
  runtime.originalDeck.forEach(card => {
    const progress = host.getWordProgress(card.id);
    const pct = getConfidencePct(progress);
    if (pct !== null && pct > 75) highCount += 1;
    else lowCount += 1;
  });
  // Three-section deck breakdown reflecting buildStudyDeck's partitioning:
  //   inDeck     — active section (the in-flight rotation the user is on)
  //   sessionDue — active + middle (everything still eligible this session)
  //   later      — deferred (spaced) / archived (unspaced)
  // Row 1 surfaces all three so the learner sees both the immediate queue
  // and the pending dump-in pile separately. Counts derive from the live
  // partition state so they stay in sync with runtime.deck mid-session.
  const inDeckCount = runtime.activeDeckCount;
  const middleCount = runtime.spacedRepetition
    ? (runtime.middleDeckCount || 0)
    : (runtime.unspacedMiddleCount || 0);
  const sessionDueCount = inDeckCount + middleCount;
  const totalCount = runtime.originalDeck.length;
  const laterCount = runtime.spacedRepetition
    ? Math.max(totalCount - sessionDueCount, 0)
    : host.getKnownCount();
  const sessionDueLabel = runtime.spacedRepetition ? 'Due now' : 'Unconfirmed';
  const laterLabel = runtime.spacedRepetition ? 'Due later' : 'Archived';

  const deckTagEl = document.getElementById('reviewDeckTag');
  if (deckTagEl) {
    deckTagEl.textContent = host.isMorphologyMode()
      ? 'Grammar deck'
      : (runtime.requiredOnly ? 'Required-only deck' : 'Full deck');
  }

  document.getElementById('reviewStats').innerHTML = `
      <div class="review-stats-row">
        <span class="stat-deck">▦ In deck: ${inDeckCount}</span>
        <span class="stat-deck">● ${sessionDueLabel}: ${sessionDueCount}</span>
        <span class="stat-total">⌛ ${laterLabel}: ${laterCount}</span>
      </div>
      <div class="review-stats-row">
        <span class="stat-known">✓ High confidence: ${highCount}</span>
        <span class="stat-unsure">○ Low confidence: ${lowCount}</span>
      </div>`;

  const sortMode = runtime.reviewSortMode === 'confidence' ? 'confidence' : 'alphabetical';
  const sortRowEl = document.getElementById('reviewSortRow');
  if (sortRowEl) {
    const btn = (mode, label) => {
      const active = sortMode === mode;
      return `<button type="button" class="ctrl-btn chapter-detail-sort-btn${active ? ' active-toggle' : ''}" onclick="setReviewSortMode('${mode}')" aria-pressed="${active ? 'true' : 'false'}">${label}</button>`;
    };
    sortRowEl.innerHTML = `
      <span class="review-sort-label">Sort</span>
      <div class="review-sort-group" role="group" aria-label="Sort cards">
        ${btn('alphabetical', 'A–Ω')}
        ${btn('confidence', 'Confidence')}
      </div>`;
  }

  let listHtml = '';
  const visibleRows = runtime.originalDeck
    .map((card, idx) => ({ card, idx }))
    .filter(({ card }) => {
      const status = runtime.marks[card.id];
      const progress = host.getWordProgress(card.id);
      return status || progress.seenCount;
    });

  if (sortMode === 'confidence') {
    // Raw confidence pct from getConfidencePct (no smoothing) so the lowest
    // recall rises to the top of the drill list. Null (unseen) is treated as
    // -1 so it sorts above 0% — unseen cards are typically the most urgent
    // signal of "haven't touched this yet". Ties break alphabetically.
    visibleRows.sort((a, b) => {
      const pa = getConfidencePct(host.getWordProgress(a.card.id));
      const pb = getConfidencePct(host.getWordProgress(b.card.id));
      const va = pa === null ? -1 : pa;
      const vb = pb === null ? -1 : pb;
      if (va !== vb) return va - vb;
      return compareGreekAlphabetical(a.card, b.card);
    });
  } else {
    visibleRows.sort((a, b) => compareGreekAlphabetical(a.card, b.card));
  }

  visibleRows.forEach(({ card }) => {
      const status = runtime.marks[card.id];
      const progress = host.getWordProgress(card.id);
      const confidencePct = getConfidencePct(progress);
      const confidenceMeta = confidencePct === null ? 'confidence —' : `confidence ${confidencePct}%`;
      const srsMeta = runtime.spacedRepetition
        ? `<span style="display:block;color:var(--muted);font-size:12px">${progress.dueAt && progress.dueAt > Date.now() ? `due in ${formatRemainingForTable(progress.dueAt)}` : 'due now'} · seen ×${progress.seenCount || 0} · ${confidenceMeta}</span>`
        : (progress.seenCount || progress.passCount || progress.failCount)
          ? `<span style="display:block;color:var(--muted);font-size:12px">seen ×${progress.seenCount || 0} · ${confidenceMeta}</span>`
          : '';
      const returnBtn = `<button class="return-btn" title="Return this card to circulation now" onclick="returnSeenCardToDeck('${encodeURIComponent(card.id)}')">✕</button>`;
      listHtml += `<div class="review-item">
        <span class="rg">${getCardReviewLeft(card)}${srsMeta}</span>
        <span class="re">${getCardReviewRight(card)}<span style="display:block;color:var(--muted);font-size:12px">${getCardMetaLine(card)}</span></span>
        <span class="rb ${status || 'unsure'}">${status === 'known' ? '✓' : '○'}</span>
        ${returnBtn}
      </div>`;
    });
  document.getElementById('reviewList').innerHTML = listHtml || '<span style="color:var(--muted);font-size:14px;font-style:italic">Mark cards as you study to track your progress in this direction.</span>';
}

function escapeHtmlSmall(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// A compact "weakest: <value> <pct>%" pointer for a collapsed paradigm row.
// The headline pct can read healthy while one mood/tense lags, so this calls
// out the worst seen value. Dot colour tracks the shared 5-band gradient.
function parsingWeakestTagHtml(weakest) {
  if (!weakest) return '';
  const band = weakest.pct < 20 ? 'stacked-seg-b0'
    : weakest.pct < 40 ? 'stacked-seg-b20'
    : weakest.pct < 60 ? 'stacked-seg-b40'
    : weakest.pct < 80 ? 'stacked-seg-b60'
    : 'stacked-seg-b80';
  return `<span class="parsing-review-weakest"><span class="parsing-review-weakest-dot ${band}"></span>weakest: ${escapeHtmlSmall(weakest.label)} ${weakest.pct}%</span>`;
}

// Replacement for renderReview when in parsing mode. The standard
// confidence/seen/unseen breakdown doesn't apply (parsing has no SRS or
// main-stats writes); instead we surface the per-lemma rolling-window
// stats from runtime.paradigmStepStats — same data the analytics tile
// uses — so the bottom panel becomes "here's how each paradigm I've
// drilled is going."
//
// Each row is tappable: tapping expands an inline performance bar chart
// (10 disjoint 20-attempt buckets + an in-progress trailing column).
// The "All paradigms" row at the top aggregates across every drilled
// paradigm. Expansion state is tracked separately from the analytics
// tile (runtime.parsingReviewExpanded) so opening a row here doesn't
// auto-open the same row inside the analytics overlay.
function renderParsingReviewPanel() {
  const deckTagEl = document.getElementById('reviewDeckTag');
  if (deckTagEl) deckTagEl.textContent = 'Paradigm parsing';

  const focused = runtime.morphFocusedParadigm || '';
  const stats = runtime.paradigmStepStats || {};
  const enabledDims = host.getEnabledParsingDims();
  const allStats = getAllLemmaStats(stats, enabledDims);

  // Each drilled paradigm's breakdown comes from its in-scope forms (up to two
  // recent attempts per form, chapter-gated), folded into the cross-paradigm
  // accumulator so the "All paradigms" row matches the per-lemma rows. The
  // headline % is this per-form tally — every form, not a capped rolling
  // window — consistent with the bars.
  const overallAcc = createValueBreakdownAcc();
  const lemmaBreakdowns = new Map();
  allStats.forEach((s) => {
    const cards = host.getMorphCardsForLemma(s.lemma) || [];
    accumulateValueBreakdown(overallAcc, stats, s.lemma, cards, enabledDims);
    lemmaBreakdowns.set(s.lemma, summarizeLemmaValueBreakdown(stats, s.lemma, cards, enabledDims));
  });
  const pctOf = (lemma) => {
    const b = lemmaBreakdowns.get(lemma);
    return b && b.totals ? b.totals.pct : null;
  };

  // Focused paradigm pinned on top; the rest worst-first by per-form accuracy
  // (paradigms with nothing seen yet sink to the bottom).
  const focusedEntry = allStats.find((s) => s.lemma === focused);
  const otherEntries = allStats.filter((s) => s.lemma !== focused);
  otherEntries.sort((a, b) => {
    const pa = pctOf(a.lemma), pb = pctOf(b.lemma);
    if (pa == null && pb == null) return 0;
    if (pa == null) return 1;
    if (pb == null) return -1;
    return pa - pb;
  });
  const ordered = focusedEntry ? [focusedEntry, ...otherEntries] : otherEntries;

  const drilledCount = ordered.length;
  document.getElementById('reviewStats').innerHTML = `
      <div class="review-stats-row">
        <span class="stat-deck">▦ Paradigms drilled: ${drilledCount}</span>
        <span class="stat-total">· Tap any row to break it down by mood, tense, and voice</span>
      </div>`;

  const sortRowEl = document.getElementById('reviewSortRow');
  if (sortRowEl) sortRowEl.innerHTML = '';

  const expandedKey = runtime.parsingReviewExpanded;

  // Overall row (always rendered, even when no paradigms have been drilled,
  // so the user can see the empty state). When ordered is empty, only the
  // overall row + empty hint appear.
  const { groups: overallGroups, weakest: overallWeakest, totals: overallTotals } = finalizeValueBreakdown(overallAcc);
  const overallPct = overallTotals.pct;
  const overallPctClass = overallPct == null ? 'parsing-review-pct-mid'
    : overallPct >= 80 ? 'parsing-review-pct-high'
    : overallPct >= 50 ? 'parsing-review-pct-mid'
    : 'parsing-review-pct-low';
  const overallExpanded = expandedKey === '__overall';
  const overallRow = `
    <div class="parsing-review-row parsing-review-row-overall${overallExpanded ? ' parsing-review-row-active' : ''}"
         role="button"
         tabindex="0"
         aria-expanded="${overallExpanded ? 'true' : 'false'}"
         data-parsing-row="__overall">
      <div class="parsing-review-header">
        <span class="parsing-review-lemma parsing-review-lemma-overall">All paradigms</span>
        <span class="parsing-review-pct ${overallPctClass}">${overallPct == null ? '—' : `${overallPct}%`}</span>
        <span class="parsing-review-attempts">${overallTotals.seen}/${overallTotals.scope} forms · ${drilledCount} paradigm${drilledCount === 1 ? '' : 's'}</span>
      </div>
      ${overallWeakest ? `<div class="parsing-review-weakline">${parsingWeakestTagHtml(overallWeakest)}</div>` : ''}
      ${overallExpanded ? `<div class="parsing-review-chart">${buildDimValueBarsHtml(overallGroups, { caption: 'Recent accuracy per value, across every paradigm · seen / in scope' })}</div>` : ''}
    </div>`;

  if (!ordered.length) {
    document.getElementById('reviewList').innerHTML = `
      <div class="parsing-review-list">${overallRow}</div>
      <span style="color:var(--muted);font-size:14px;font-style:italic">Complete a parse to start seeing per-paradigm accuracy here.</span>`;
    bindParsingReviewInteractivity();
    return;
  }

  const lemmaRows = ordered.map((s) => {
    const { groups, weakest, totals } = lemmaBreakdowns.get(s.lemma)
      || { groups: [], weakest: null, totals: { pct: null, seen: 0, scope: 0 } };
    const pct = totals.pct;
    const pctClass = pct == null ? 'parsing-review-pct-mid'
      : pct >= 80 ? 'parsing-review-pct-high' : pct >= 50 ? 'parsing-review-pct-mid' : 'parsing-review-pct-low';
    const focusBadge = s.lemma === focused
      ? '<span class="parsing-review-focused-badge">FOCUSED</span>'
      : '';
    const isExpanded = expandedKey === s.lemma;
    const breakdownHtml = isExpanded ? buildDimValueBarsHtml(groups) : '';
    // Keep the full per-form list (every in-scope morph, colour-dotted by its
    // recent status) below the breakdown on expand.
    const formsHtml = isExpanded ? buildLemmaTestableFormsHtml(s.lemma) : '';
    return `
      <div class="parsing-review-row${isExpanded ? ' parsing-review-row-active' : ''}"
           role="button"
           tabindex="0"
           aria-expanded="${isExpanded ? 'true' : 'false'}"
           data-parsing-row="${escapeHtmlSmall(s.lemma)}">
        <div class="parsing-review-header">
          <span class="parsing-review-lemma">${escapeHtmlSmall(s.lemma)}</span>
          ${focusBadge}
          <span class="parsing-review-pct ${pctClass}">${pct == null ? '—' : `${pct}%`}</span>
          <span class="parsing-review-attempts">${totals.seen}/${totals.scope} forms</span>
        </div>
        ${weakest ? `<div class="parsing-review-weakline">${parsingWeakestTagHtml(weakest)}</div>` : ''}
        ${isExpanded ? `<div class="parsing-review-chart">${breakdownHtml}</div>${formsHtml}` : ''}
      </div>`;
  }).join('');

  document.getElementById('reviewList').innerHTML =
    `<div class="parsing-review-list">${overallRow}${lemmaRows}</div>`;
  bindParsingReviewInteractivity();
}

function bindParsingReviewInteractivity() {
  const list = document.querySelector('#reviewList .parsing-review-list');
  if (!list || list.dataset.parsingRowsBound === '1') return;
  list.dataset.parsingRowsBound = '1';
  const toggle = (key) => {
    if (!key) return;
    runtime.parsingReviewExpanded = runtime.parsingReviewExpanded === key ? null : key;
    renderParsingReviewPanel();
  };
  list.addEventListener('click', (event) => {
    // Inner per-form rows are non-interactive so a click on one shouldn't
    // collapse the parent paradigm row.
    if (event.target.closest('.parsing-review-form-row')) return;
    const row = event.target.closest('[data-parsing-row]');
    if (!row || !list.contains(row)) return;
    toggle(row.dataset.parsingRow || '');
  });
  list.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const row = event.target.closest('[data-parsing-row]');
    if (!row || !list.contains(row)) return;
    event.preventDefault();
    toggle(row.dataset.parsingRow || '');
  });
}

// Compact parse-string formatter for the testable-forms list, where the
// column is narrow and the canonical long-form ("present active indicative
// first person singular") truncates with ellipsis on a phone. Maps every
// canonical token to its short form (pres / act / ind / 1sg / nom / masc /
// …) so the full parse fits in the column unabbreviated. Multi-word
// person+number tokens collapse first ("first person singular" → "1sg")
// before the single-word substitutions so they don't get half-replaced.
const PARSE_PHRASE_ABBREVS = [
  ['first person singular', '1sg'],
  ['second person singular', '2sg'],
  ['third person singular', '3sg'],
  ['first person plural', '1pl'],
  ['second person plural', '2pl'],
  ['third person plural', '3pl'],
  ['first person', '1'],
  ['second person', '2'],
  ['third person', '3'],
  ['second aorist', '2aor'],
  ['first aorist', '1aor'],
  ['middle/passive', 'm/p'],
  ['middle or passive', 'm/p']
];
const PARSE_WORD_ABBREVS = {
  present: 'pres', future: 'fut', imperfect: 'impf',
  aorist: 'aor', perfect: 'pf', pluperfect: 'plpf',
  active: 'act', middle: 'mid', passive: 'pass',
  indicative: 'ind', subjunctive: 'subj', imperative: 'impv',
  infinitive: 'inf', participle: 'ptcp',
  singular: 'sg', plural: 'pl',
  nominative: 'nom', accusative: 'acc', genitive: 'gen', dative: 'dat', vocative: 'voc',
  masculine: 'masc', feminine: 'fem', neuter: 'neut'
};
function abbreviateParse(text) {
  if (!text) return '';
  let out = String(text);
  for (const [from, to] of PARSE_PHRASE_ABBREVS) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), to);
  }
  for (const [from, to] of Object.entries(PARSE_WORD_ABBREVS)) {
    out = out.replace(new RegExp(`\\b${from}\\b`, 'gi'), to);
  }
  return out;
}

// Lists every form currently in scope for `lemma` (chapter-gated, and
// including optional-extension forms iff the user has the toggle on)
// under the expanded paradigm row. Each form is dotted with its last-
// attempt outcome so the panel reads as "here's what I can drill for
// εἰμί, and here's how I did the last time I saw each one." The pool
// matches getCardsForFocusedParadigm exactly — same dedup/supersession,
// same chapter cap — so the user's mental model of the deck aligns with
// what's shown.
function buildLemmaTestableFormsHtml(lemma) {
  const cards = host.getMorphCardsForLemma(lemma) || [];
  if (!cards.length) {
    return `<div class="parsing-review-forms parsing-review-forms-empty">No forms in scope for this paradigm at your current chapter selection.</div>`;
  }
  // Pass the card objects, not bare form strings: the comparator derives its
  // sort key from card.kind/card.form, so a plain string degrades to an empty
  // key and the whole sort becomes a no-op.
  const sorted = cards.slice().sort(compareGreekAlphabetical);
  const stats = runtime.paradigmStepStats || {};
  const enabledDims = host.getEnabledParsingDims();
  const counts = { known: 0, right: 0, wrong: 0, uncertain: 0, unseen: 0 };
  const rows = sorted.map((card) => {
    const status = getLemmaFormStatus(stats, lemma, card.id, enabledDims);
    counts[status] += 1;
    const dotClass = status === 'known' ? 'parsing-review-form-dot-known'
      : status === 'right' ? 'parsing-review-form-dot-right'
      : status === 'wrong' ? 'parsing-review-form-dot-wrong'
      : status === 'uncertain' ? 'parsing-review-form-dot-uncertain'
      : 'parsing-review-form-dot-unseen';
    const statusLabel = status === 'known' ? 'both recent attempts correct'
      : status === 'right' ? 'recent attempt correct'
      : status === 'wrong' ? 'recent attempts all wrong'
      : status === 'uncertain' ? '1 of last 2 attempts correct'
      : 'not yet attempted';
    const parseFull = card.parsedAnswer || card.answer || '';
    const parseShort = abbreviateParse(parseFull);
    // A ✕ that drops this form's recent tally so it re-enters the deck under
    // "skip confident" (exclude-known-morphs). Unseen forms have no tally to
    // clear, so they get an invisible placeholder that keeps the grid column
    // aligned without offering a no-op button.
    const clearBtn = status === 'unseen'
      ? '<span class="parsing-review-form-clear placeholder" aria-hidden="true">✕</span>'
      : `<button type="button" class="parsing-review-form-clear" title="Clear this form's recent tally so it re-enters the deck" aria-label="Clear recent tally for ${escapeHtmlSmall(card.form || '')}" onclick="clearParsingMorph('${encodeURIComponent(lemma)}','${encodeURIComponent(card.id)}')">✕</button>`;
    return `
      <li class="parsing-review-form-row">
        <span class="parsing-review-form-dot ${dotClass}" title="${escapeHtmlSmall(statusLabel)}" aria-label="${escapeHtmlSmall(statusLabel)}"></span>
        <span class="parsing-review-form-greek">${escapeHtmlSmall(card.form || '')}</span>
        <span class="parsing-review-form-parse" title="${escapeHtmlSmall(parseFull)}">${escapeHtmlSmall(parseShort)}</span>
        ${clearBtn}
      </li>`;
  }).join('');
  const summary = `${counts.known} known · ${counts.right} correct · ${counts.uncertain} uncertain · ${counts.wrong} missed · ${counts.unseen} unseen`;
  return `
    <div class="parsing-review-forms">
      <div class="parsing-review-forms-header">
        <span class="parsing-review-forms-title">Testable forms (${sorted.length})</span>
        <span class="parsing-review-forms-summary">${escapeHtmlSmall(summary)}</span>
      </div>
      <ul class="parsing-review-forms-list">${rows}</ul>
    </div>`;
}

// ✕ handler for a single testable form. Drops that form's recent tally so it
// reads as 'unseen' again (its per-paradigm rolling %, buckets, and the
// overall aggregate are left intact — same scoping as resetKnownMorphs but
// for one form). A full deck rebuild is only needed when the form was
// actually being excluded by "skip confident" (exclude-known-morphs on AND
// the form was 2/2 known): clearing it re-admits it to the deck. For any
// other form the membership doesn't change, so we just refresh the review
// panel + persist — rebuilding would needlessly reset the user's deck cursor.
export function clearParsingMorph(encodedLemma, encodedCardId) {
  const lemma = decodeURIComponent(encodedLemma);
  const cardId = decodeURIComponent(encodedCardId);
  const stats = runtime.paradigmStepStats;
  const wasExcluded = !!runtime.excludeKnownMorphs
    && isLemmaFormKnown(stats, lemma, cardId, host.getEnabledParsingDims());
  if (!clearLemmaFormRecent(stats, lemma, cardId)) return;
  if (wasExcluded) {
    host.rebuildParsingDeck();
    return;
  }
  renderReview();
  host.saveState();
}

// Sort-mode toggle for the per-deck progress list. Lives in runtime only —
// the user's pick resets to 'alphabetical' on reload, matching how the
// analytics chapter sort behaves.
export function setReviewSortMode(mode) {
  const next = mode === 'confidence' ? 'confidence' : 'alphabetical';
  if (runtime.reviewSortMode === next) return;
  runtime.reviewSortMode = next;
  renderReview();
}

// Return a previously-known card to the active deck. Flips its mark back to
// 'unsure', clears its due timer, and rebuilds the deck so the card lands at
// the back (per buildStudyDeck's newly-eligible logic).
export function returnSeenCardToDeck(encodedId) {
  const cardId = decodeURIComponent(encodedId);
  const card = runtime.originalDeck.find(c => c.id === cardId);
  if (!card) return;

  host.moveCardToBackOfActivePile(card);

  // Writes scheduling fields, so the entry must be persisted into the store.
  const progress = host.getWordProgress(cardId, { persist: true });
  progress.dueAt = Date.now();
  progress.intervalDays = 0;
  progress.streak = 0;
  progress.easyStreak = 0;
  progress.srsStage = Math.max(0, getSrsStage(progress) - 1);

  if (runtime.spacedRepetition) {
    runtime.deck = host.buildStudyDeck(runtime.originalDeck);
    const dueIdx = runtime.deck.findIndex(c => c.id === cardId);
    if (dueIdx >= 0 && dueIdx < runtime.activeDeckCount) {
      runtime.currentIdx = dueIdx;
      runtime.isFlipped = false;
    } else if (runtime.activeDeckCount > 0) {
      runtime.currentIdx = Math.min(runtime.currentIdx, runtime.activeDeckCount - 1);
    }
  } else {
    const returnedIdx = runtime.deck.findIndex(c => c.id === cardId);
    runtime.currentIdx = returnedIdx >= 0 ? returnedIdx : Math.min(runtime.currentIdx, Math.max(runtime.deck.length - 1, 0));
    runtime.isFlipped = false;
  }

  host.renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}
