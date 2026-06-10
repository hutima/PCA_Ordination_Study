// Analytics overlay: hero summary, level/XP, heatmap, achievements, chapter
// grid, personal records, stubborn-card lists, vocab/grammar progress
// sections, and the celebrate-on-level-up / earned-badge plumbing.
//
// All cumulative state (XP, gamification, expanded chapter/word) lives in
// runtime.* so we read/write it directly. Functions that need host helpers
// (ensureUsageStats, the SRS scheduler primitives, the filters that take
// runtime-mode into account) get them via configureAnalytics.

import { runtime } from '../state/runtime.js';
import { escapeHtml } from '../utils/helpers.js';
import {
  formatUsageDuration,
  formatAnalyticsDate,
  formatAnalyticsDateTime,
  getUsageDayKey
} from '../utils/time.js';
import { getConfidencePct } from '../domain/srs/confidence.js';
import {
  getSelectedVocabCards,
  getSelectedGrammarCards,
  getAllChapterKeys,
  getAllVocabCards,
  getAllGrammarCards,
  getChapterVocabCards,
  getChapterGrammarCards
} from '../domain/deck/filters.js';
import {
  migrateLegacyXp as migrateLegacyXpPure,
  computeXpAndLevel as computeXpAndLevelPure,
  computeStudyStreaks,
  computeTodayStats,
  computeAchievements as computeAchievementsPure,
  getRegressionProjection
} from '../domain/gamification/xp.js';
import {
  getAllLemmaStats,
  createValueBreakdownAcc,
  accumulateValueBreakdown,
  finalizeValueBreakdown,
  summarizeLemmaValueBreakdown
} from '../domain/grammar/morph_steps.js';
import {
  buildDailyCumulativeSeriesFromMap,
  buildCumulativeConfirmationSeries,
  buildConfirmationHistogram,
  buildHistogramSvg,
  buildConfidenceSummaryBox,
  buildLineChartSvg,
  buildHeatmapSvg,
  buildCircularProgressSvg,
  buildLevelBarHtml,
  buildTitleLadderHtml,
  buildWordStatCardHtml,
  buildDimValueBarsHtml
} from './charts.js';
import { showLevelToast, showBadgeToast } from './toast.js';

let host = {
  ensureUsageStats: () => runtime.appUsageStats,
  accumulateActiveStudyTime: () => {},
  canAccessGrammarUi: () => true,
  saveState: () => {},
  getEnabledParsingDims: () => null,
  getMorphCardsForLemma: () => []
};

export function configureAnalytics(deps) {
  host = { ...host, ...deps };
}

// ── Analytics-page-local vocab view state (direction + scope) ─────────
// Independent of the study deck's runtime.directionToGreek / requiredOnly so
// flipping the analytics view does not rebuild the deck the user is studying.
function getAnalyticsVocabDirection() {
  return runtime.analyticsVocabDirection === 'e2g' ? 'e2g' : 'g2e';
}
function isAnalyticsVocabRequiredOnly() {
  return runtime.analyticsVocabScope !== 'all';
}
function getAnalyticsVocabProgressStore() {
  return runtime.globalWordProgress[getAnalyticsVocabDirection()] || {};
}
function getAnalyticsVocabMarksStore() {
  return runtime.globalWordMarks[getAnalyticsVocabDirection()] || {};
}

// ── Pure wrappers around xp.js that bind runtime stores ────────────────

export function migrateLegacyXp(usage) {
  return migrateLegacyXpPure(usage, runtime.globalWordProgress);
}

export function computeXpAndLevel(usage) {
  return computeXpAndLevelPure(usage, runtime.globalWordProgress);
}

export function computeAchievements(usage, courseData, streaks, sessionCount, todayStats = null) {
  return computeAchievementsPure(usage, courseData, streaks, sessionCount, todayStats, runtime.globalWordMarks);
}

function renderAnalyticsSection(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!config || !config.total) { el.innerHTML = `<div class="analytics-section"><div class="analytics-empty">Select a study set to see this chart.</div></div>`; return; }
  const metrics = config.metrics || [];
  // hideHead skips the H3/subtitle row when the surrounding wrapper (e.g. a
  // collapsible <summary>) already provides those, so we don't double-print.
  const head = config.hideHead ? '' : `<div class="analytics-section-head"><div><h3>${escapeHtml(config.title || 'Analytics')}</h3><p>${escapeHtml(config.subtitle || '')}</p></div></div>`;
  el.innerHTML = `
    <section class="analytics-section">
      ${head}
      <div class="analytics-chart-card"><div class="analytics-chart-title">${escapeHtml(config.barTitle)}</div>${config.barSvg}</div>
      <div class="analytics-metrics-grid">${metrics.map(metric => `
          <div class="analytics-metric-card">
            <div class="analytics-metric-label">${escapeHtml(metric.label)}</div>
            <div class="analytics-metric-value">${escapeHtml(metric.value)}</div>
            ${metric.note ? `<div class="analytics-metric-note">${escapeHtml(metric.note)}</div>` : ''}
          </div>
        `).join('')}</div>
      <div class="analytics-chart-card"><div class="analytics-chart-title">${escapeHtml(config.lineTitle)}</div>${config.lineSvg}</div>
    </section>
  `;
}

function buildGamificationSnapshot() {
  const usage = host.ensureUsageStats();
  const sessionHistory = [...usage.studySessionHistory];
  if (usage.currentStudySession && usage.currentStudySession.startedAt) {
    sessionHistory.push({
      startedAt: usage.currentStudySession.startedAt,
      endedAt: usage.lastStudyCountedAt || Date.now(),
      durationMs: usage.currentStudySession.durationMs || 0,
      interactionCount: usage.currentStudySession.interactionCount || 0
    });
  }
  const streaks = computeStudyStreaks(usage.activeDailyMs);
  const courseData = computeCourseWideData();
  const g2eProgressStore = runtime.globalWordProgress.g2e || {};
  const e2gProgressStore = runtime.globalWordProgress.e2g || {};
  const morphProgressStore = runtime.globalWordProgress.morph || {};
  const mergedProgressStore = {};
  [g2eProgressStore, e2gProgressStore, morphProgressStore].forEach(store => {
    Object.entries(store).forEach(([cardId, entry]) => {
      const existing = mergedProgressStore[cardId] || {};
      mergedProgressStore[cardId] = {
        ...existing,
        ...entry,
        lastReviewedAt: Math.max(Number(existing.lastReviewedAt) || 0, Number(entry?.lastReviewedAt) || 0),
        firstConfirmedAt: Math.max(Number(existing.firstConfirmedAt) || 0, Number(entry?.firstConfirmedAt) || 0)
      };
    });
  });
  const allCourseCards = [...courseData.allVocabCards, ...courseData.allGrammarCards];
  const mergedMarks = { ...(runtime.globalWordMarks.g2e || {}), ...(runtime.globalWordMarks.e2g || {}), ...(runtime.globalWordMarks.morph || {}) };
  const todayStats = computeTodayStats(usage.activeDailyMs, allCourseCards, mergedMarks, mergedProgressStore);
  const achievements = computeAchievements(usage, courseData, streaks, sessionHistory.length, todayStats);
  return { usage, sessionHistory, streaks, courseData, todayStats, achievements };
}

export function syncEarnedAchievementSnapshot() {
  const snapshot = buildGamificationSnapshot();
  runtime.appGamification.lastEarnedAchievementIds = snapshot.achievements.filter(a => a.earned).map(a => a.id);
  runtime.appGamification.lastCelebratedBadgeDay = getUsageDayKey();
  return snapshot;
}

export function maybeCelebrateLevelUp() {
  const usage = host.ensureUsageStats();
  const xpData = computeXpAndLevel(usage);
  const currentLevel = xpData.currentLevel?.level || 1;
  const previousLevel = Number.isFinite(runtime.appGamification.lastCelebratedLevel) && runtime.appGamification.lastCelebratedLevel >= 1
    ? runtime.appGamification.lastCelebratedLevel
    : currentLevel;

  if (currentLevel < previousLevel) {
    runtime.appGamification.lastCelebratedLevel = currentLevel;
    return;
  }

  if (currentLevel > previousLevel) {
    showLevelToast(xpData.currentLevel, xpData.totalXp);
  }

  runtime.appGamification.lastCelebratedLevel = currentLevel;
}

export function maybeCelebrateAchievements() {
  const todayKey = getUsageDayKey();
  if (runtime.appGamification.lastCelebratedBadgeDay && runtime.appGamification.lastCelebratedBadgeDay !== todayKey) {
    runtime.appGamification.lastEarnedAchievementIds = (runtime.appGamification.lastEarnedAchievementIds || []).filter(id => id !== 'daily_first_card');
  }

  const snapshot = buildGamificationSnapshot();
  const earnedAchievements = snapshot.achievements.filter(a => a.earned);
  const priorEarnedIds = new Set(Array.isArray(runtime.appGamification.lastEarnedAchievementIds) ? runtime.appGamification.lastEarnedAchievementIds : []);
  const newlyEarned = earnedAchievements.filter(a => !priorEarnedIds.has(a.id));

  newlyEarned.forEach(showBadgeToast);
  runtime.appGamification.lastEarnedAchievementIds = earnedAchievements.map(a => a.id);
  runtime.appGamification.lastCelebratedBadgeDay = todayKey;
}

// Course-wide card lists are deterministic per page load (the data scripts
// never change after startup), but building them re-walks every set and
// re-shuffles every quiz's choice list. maybeCelebrateAchievements runs on
// every saveState (i.e. on every interaction), so build the lists once and
// reuse them.
let courseCardCache = null;
function getCourseCards() {
  if (!courseCardCache) {
    courseCardCache = {
      allVocab: getAllVocabCards(false),
      reqVocab: getAllVocabCards(true),
      allGrammar: getAllGrammarCards()
    };
  }
  return courseCardCache;
}

function computeCourseWideData() {
  const { allVocab, reqVocab, allGrammar } = getCourseCards();

  // Use g2e marks/progress as the canonical direction for course completion;
  // grammar uses the morph store regardless of which mode is currently active.
  const g2eMarks = runtime.globalWordMarks.g2e || {};
  const morphMarks = runtime.globalWordMarks.morph || {};
  const g2eProgress = runtime.globalWordProgress.g2e || {};
  const morphProgress = runtime.globalWordProgress.morph || {};

  const isEffectivelyConfirmed = (card, marksMap, store) => {
    if (marksMap[card.id] === 'known') return true;
    const pct = getConfidencePct(store?.[card.id]);
    return pct !== null && pct >= 70;
  };
  const allVocabConfirmed = allVocab.filter(c => isEffectivelyConfirmed(c, g2eMarks, g2eProgress)).length;
  const reqVocabConfirmed = reqVocab.filter(c => isEffectivelyConfirmed(c, g2eMarks, g2eProgress)).length;
  const allGrammarConfirmed = allGrammar.filter(c => isEffectivelyConfirmed(c, morphMarks, morphProgress)).length;

  return {
    allVocabTotal: allVocab.length,
    allVocabConfirmed,
    allVocabCards: allVocab,
    reqVocabTotal: reqVocab.length,
    reqVocabConfirmed,
    reqVocabCards: reqVocab,
    allGrammarTotal: allGrammar.length,
    allGrammarConfirmed,
    allGrammarCards: allGrammar
  };
}

// Chapter map percentage = average rolling confidence across the chapter's
// cards. Unseen cards count as 0% so an untouched chapter reads as 0%
// instead of disappearing into "no data". The manual "marked known" override
// is intentionally ignored — the % is purely the recall signal so it can't
// be inflated by a toggle. `confirmed` still surfaces marks for the
// tooltip / chapter-detail headline alongside the average.
function computeChapterMastery(progressStore, marksStore, requiredOnly = false) {
  const marksMap = marksStore || runtime.globalWordMarks.g2e || {};
  const store = progressStore || runtime.globalWordProgress.g2e || {};
  return getAllChapterKeys().map(chKey => {
    const cards = getChapterVocabCards(chKey, !!requiredOnly);
    const total = cards.length;
    let sum = 0;
    let confirmed = 0;
    cards.forEach(card => {
      const pct = getConfidencePct(store?.[card.id]);
      sum += (pct !== null) ? pct : 0;
      if (marksMap[card.id] === 'known' || (pct !== null && pct >= 70)) confirmed++;
    });
    const avgPct = total ? sum / total : 0;
    return { chapterKey: chKey, total, confirmed, pct: avgPct / 100, avgPct };
  });
}

function buildChapterGridHtml(mastery) {
  if (!mastery.length) return '';
  const expandedKey = runtime.analyticsExpandedChapter || '';
  // Match the vocab/grammar histogram: five 20%-wide bands plus Unseen.
  // pct is the share of the chapter's required vocab that's confirmed.
  const bandClassFor = (pct) => {
    if (pct <= 0) return 'tile-band-unseen';
    if (pct < 0.20) return 'tile-band-b0';
    if (pct < 0.40) return 'tile-band-b20';
    if (pct < 0.60) return 'tile-band-b40';
    if (pct < 0.80) return 'tile-band-b60';
    return 'tile-band-b80';
  };
  const tile = (row) => {
    const pctRound = Math.round(row.pct * 100);
    const label = `Ch. ${row.chapterKey}: ${pctRound}% avg confidence · ${row.confirmed} / ${row.total} confirmed — tap for word stats`;
    let className = `chapter-tile ${bandClassFor(row.pct)}`;
    if (String(row.chapterKey) === expandedKey) className += ' chapter-tile-active';
    return `<button type="button" class="${className}" data-chapter="${escapeHtml(String(row.chapterKey))}" title="${escapeHtml(label)}" aria-expanded="${String(row.chapterKey) === expandedKey ? 'true' : 'false'}"><span class="chapter-tile-num">${escapeHtml(row.chapterKey)}</span><span class="chapter-tile-pct">${pctRound}%</span></button>`;
  };
  return `
    <div class="analytics-chart-card chapter-grid-card">
      <div class="analytics-chart-title">Chapter map</div>
      <div class="chapter-grid">${mastery.map(tile).join('')}</div>
      <div class="stacked-legend">
        <span class="stacked-legend-item"><span class="stacked-legend-dot stacked-seg-b80"></span>80–100%</span>
        <span class="stacked-legend-item"><span class="stacked-legend-dot stacked-seg-b60"></span>60–80%</span>
        <span class="stacked-legend-item"><span class="stacked-legend-dot stacked-seg-b40"></span>40–60%</span>
        <span class="stacked-legend-item"><span class="stacked-legend-dot stacked-seg-b20"></span>20–40%</span>
        <span class="stacked-legend-item"><span class="stacked-legend-dot stacked-seg-b0"></span>0–20%</span>
        <span class="stacked-legend-item"><span class="stacked-legend-dot stacked-seg-unseen"></span>Unstarted</span>
      </div>
      <div class="chapter-detail-panel${expandedKey ? ' open' : ''}" id="chapterDetailPanel">${expandedKey ? buildChapterDetailHtml(expandedKey) : ''}</div>
    </div>
  `;
}

// ── Per-chapter word breakdown (shown when a chapter tile is tapped) ──
// Reads the analytics-page direction + scope so the per-word percentages
// match the chapter map above. Sorted weakest → strongest so it doubles as
// a "what to drill next" list.
function buildChapterDetailHtml(chapterKey) {
  if (!chapterKey) return '';
  const requiredOnly = isAnalyticsVocabRequiredOnly();
  const cards = getChapterVocabCards(String(chapterKey), requiredOnly);
  if (!cards.length) return `<div class="analytics-empty">No ${requiredOnly ? 'required ' : ''}vocabulary for Ch. ${escapeHtml(String(chapterKey))} yet.</div>`;
  const marksMap = getAnalyticsVocabMarksStore();
  const store = getAnalyticsVocabProgressStore();
  const required = cards.filter(c => c.required).length;
  const headwordOf = (card) => typeof window !== 'undefined' && typeof window.formatGreekHeadword === 'function'
    ? window.formatGreekHeadword(card.g)
    : (card.g || '—');

  // Each row reflects the rolling last-10-flips confidence (getConfidencePct),
  // independent of any "marked known" override — the user wants real signal,
  // not the manual toggle. The "isConfirmed" tally below still counts known
  // marks because that headline is about course-completion, not recall.
  const rowFor = (card) => {
    const progress = store[card.id];
    const isKnownMark = marksMap[card.id] === 'known';
    const rawPct = getConfidencePct(progress);
    const seen = !!(progress?.seenCount) || !!progress?.lastReviewedAt;
    let bandClass;
    let bandLabel;
    let pctText;
    let sortPct;
    if (rawPct === null && !seen) {
      bandClass = 'stacked-seg-unseen'; bandLabel = 'Unseen'; pctText = '—'; sortPct = -1;
    } else {
      const pct = rawPct ?? 0;
      sortPct = pct;
      pctText = `${pct}%`;
      if (pct >= 80)      bandClass = 'stacked-seg-b80';
      else if (pct >= 60) bandClass = 'stacked-seg-b60';
      else if (pct >= 40) bandClass = 'stacked-seg-b40';
      else if (pct >= 20) bandClass = 'stacked-seg-b20';
      else                bandClass = 'stacked-seg-b0';
    }
    return {
      card, bandClass, bandLabel, pctText, sortPct,
      isConfirmed: isKnownMark || (rawPct !== null && rawPct >= 70)
    };
  };
  const rows = cards.map(rowFor);
  const sortMode = runtime.analyticsChapterSort === 'alphabetical' ? 'alphabetical' : 'confidence';
  if (sortMode === 'alphabetical') {
    rows.sort((a, b) => (a.card.g || '').localeCompare(b.card.g || ''));
  } else {
    rows.sort((a, b) => {
      if (a.sortPct !== b.sortPct) return a.sortPct - b.sortPct;
      return (a.card.g || '').localeCompare(b.card.g || '');
    });
  }
  const confirmedCount = rows.filter(r => r.isConfirmed).length;
  // Headline matches the chapter tile: average rolling confidence across the
  // chapter, with unseen cards at 0%. The marked-known toggle is intentionally
  // not counted here — % is purely the recall signal.
  let sumPct = 0;
  rows.forEach(r => {
    sumPct += r.sortPct === -1 ? 0 : r.sortPct;
  });
  const headlinePct = cards.length ? Math.round(sumPct / cards.length) : 0;

  const rowHtml = rows.map(r => {
    const expanded = runtime.analyticsExpandedWord === r.card.id;
    const cardHtml = expanded ? buildWordStatCardHtml(r.card, store[r.card.id], marksMap[r.card.id] === 'known') : '';
    return `
      <li class="chapter-detail-row${expanded ? ' chapter-detail-row-active' : ''}"
          role="button"
          tabindex="0"
          aria-expanded="${expanded ? 'true' : 'false'}"
          data-word-id="${escapeHtml(String(r.card.id))}">
        <span class="chapter-detail-dot ${r.bandClass}" aria-hidden="true"></span>
        <span class="chapter-detail-word">${headwordOf(r.card)}</span>
        <span class="chapter-detail-gloss">${escapeHtml(r.card.e || '')}</span>
        <span class="chapter-detail-pct">${escapeHtml(r.pctText)}</span>
      </li>
      ${expanded ? `<li class="chapter-detail-statcard-row" aria-hidden="false">${cardHtml}</li>` : ''}
    `;
  }).join('');

  const sortBtn = (mode, label) => {
    const active = sortMode === mode;
    return `<button type="button" class="ctrl-btn chapter-detail-sort-btn${active ? ' active-toggle' : ''}" data-chapter-sort="${mode}" aria-pressed="${active ? 'true' : 'false'}">${escapeHtml(label)}</button>`;
  };
  return `
    <div class="chapter-detail-head">
      <div class="chapter-detail-title">Ch. ${escapeHtml(String(chapterKey))} — ${headlinePct}% avg confidence <span class="chapter-detail-meta">${confirmedCount} / ${cards.length} confirmed${required ? ` · ${required} required` : ''}</span></div>
      <div class="chapter-detail-controls">
        <div class="chapter-detail-sort" role="group" aria-label="Sort words">
          ${sortBtn('confidence', 'Confidence')}
          ${sortBtn('alphabetical', 'A–Ω')}
        </div>
        <button type="button" class="chapter-detail-close" data-chapter-close="1" aria-label="Close chapter details">×</button>
      </div>
    </div>
    <ol class="chapter-detail-list">${rowHtml}</ol>
  `;
}

function renderChapterDetailPanel() {
  const panel = document.getElementById('chapterDetailPanel');
  if (!panel) return;
  if (!runtime.analyticsExpandedChapter) {
    panel.innerHTML = '';
    panel.classList.remove('open');
    runtime.analyticsExpandedWord = null;
    return;
  }
  panel.innerHTML = buildChapterDetailHtml(runtime.analyticsExpandedChapter);
  panel.classList.add('open');
}

function setupChapterGridInteractivity(rootEl) {
  if (!rootEl || rootEl.dataset.chapterClickBound === '1') return;
  rootEl.dataset.chapterClickBound = '1';

  const handleWordRowToggle = (row) => {
    const wordId = row.dataset.wordId || '';
    if (!wordId) return;
    // The panel innerHTML is fully replaced on re-render, which destroys the
    // inner <ol> and resets its scrollTop. Capture the tapped row's position
    // within the scrollable list, then after re-render, adjust scrollTop so
    // the same row stays visually fixed — otherwise the list jumps back to
    // the top each time a word is opened or closed.
    const list = row.closest('.chapter-detail-list');
    const prevScrollTop = list ? list.scrollTop : 0;
    const prevRowTop = list ? row.offsetTop : 0;

    runtime.analyticsExpandedWord = runtime.analyticsExpandedWord === wordId ? null : wordId;
    renderChapterDetailPanel();

    const newList = document.querySelector('#chapterDetailPanel .chapter-detail-list');
    if (!newList) return;
    const newRow = newList.querySelector(`.chapter-detail-row[data-word-id="${CSS.escape(wordId)}"]`);
    newList.scrollTop = newRow
      ? prevScrollTop + (newRow.offsetTop - prevRowTop)
      : prevScrollTop;
  };

  rootEl.addEventListener('click', (event) => {
    const closeBtn = event.target.closest('[data-chapter-close]');
    if (closeBtn) {
      runtime.analyticsExpandedChapter = null;
      runtime.analyticsExpandedWord = null;
      rootEl.querySelectorAll('.chapter-tile').forEach(t => {
        t.classList.remove('chapter-tile-active');
        t.setAttribute('aria-expanded', 'false');
      });
      renderChapterDetailPanel();
      return;
    }
    const sortToggle = event.target.closest('[data-chapter-sort]');
    if (sortToggle && rootEl.contains(sortToggle)) {
      const nextMode = sortToggle.dataset.chapterSort === 'alphabetical' ? 'alphabetical' : 'confidence';
      if (runtime.analyticsChapterSort !== nextMode) {
        runtime.analyticsChapterSort = nextMode;
        renderChapterDetailPanel();
      }
      return;
    }
    const wordRow = event.target.closest('.chapter-detail-row[data-word-id]');
    if (wordRow && rootEl.contains(wordRow)) {
      handleWordRowToggle(wordRow);
      return;
    }
    const tile = event.target.closest('.chapter-tile');
    if (!tile || !rootEl.contains(tile)) return;
    const key = tile.dataset.chapter || '';
    if (!key) return;
    const nextKey = runtime.analyticsExpandedChapter === key ? null : key;
    if (nextKey !== runtime.analyticsExpandedChapter) runtime.analyticsExpandedWord = null;
    runtime.analyticsExpandedChapter = nextKey;
    rootEl.querySelectorAll('.chapter-tile').forEach(t => {
      const active = t.dataset.chapter === runtime.analyticsExpandedChapter;
      t.classList.toggle('chapter-tile-active', active);
      t.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
    renderChapterDetailPanel();
  });

  rootEl.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const wordRow = event.target.closest('.chapter-detail-row[data-word-id]');
    if (!wordRow || !rootEl.contains(wordRow)) return;
    event.preventDefault();
    handleWordRowToggle(wordRow);
  });
}

// ── Grammar chapter mastery ──────────────────────────────────────────
// Mirrors computeChapterMastery (used by the vocab chapter map) but reads
// from the morph progress/marks stores. The result feeds a chapter-tile
// grid; tapping a tile expands a panel that breaks the chapter down by
// concept (card.family). Chapter % = average of concept averages, where
// each concept's average is the mean rolling confidence across its cards
// (unseen = 0%, marked-known ignored). The "average of averages" structure
// prevents a concept with many cards from drowning out smaller concepts.
function computeGrammarChapterMastery() {
  const marksMap = runtime.globalWordMarks.morph || {};
  const store = runtime.globalWordProgress.morph || {};
  return getAllChapterKeys().map(chKey => {
    const cards = getChapterGrammarCards(chKey);
    const total = cards.length;

    const byFamily = new Map();
    let confirmed = 0;
    cards.forEach(card => {
      const family = card.family || 'Other';
      if (!byFamily.has(family)) byFamily.set(family, []);
      byFamily.get(family).push(card);
      const pct = getConfidencePct(store[card.id]);
      if (marksMap[card.id] === 'known' || (pct !== null && pct >= 70)) confirmed++;
    });

    const conceptAvgs = [];
    byFamily.forEach(familyCards => {
      let sum = 0;
      familyCards.forEach(card => {
        const pct = getConfidencePct(store[card.id]);
        sum += (pct !== null) ? pct : 0;
      });
      conceptAvgs.push(sum / familyCards.length);
    });

    const chapterAvg = conceptAvgs.length
      ? conceptAvgs.reduce((s, v) => s + v, 0) / conceptAvgs.length
      : 0;

    return { chapterKey: chKey, total, confirmed, pct: chapterAvg / 100, avgPct: chapterAvg, conceptCount: conceptAvgs.length };
  });
}

function computeGrammarChapterConcepts(chapterKey) {
  const marksMap = runtime.globalWordMarks.morph || {};
  const store = runtime.globalWordProgress.morph || {};
  const cards = getChapterGrammarCards(chapterKey);
  if (!cards.length) return [];

  const byFamily = new Map();
  cards.forEach(card => {
    const family = card.family || 'Other';
    if (!byFamily.has(family)) byFamily.set(family, []);
    byFamily.get(family).push(card);
  });

  const concepts = [];
  byFamily.forEach((familyCards, family) => {
    let seen = 0;
    let confirmed = 0;
    let misses = 0;
    let pctSum = 0;
    let pctCount = 0;
    // Concept avg confidence (matches chapter avg's per-concept term):
    // unseen = 0%, otherwise rolling last-10-flips. Marked-known is
    // ignored — the % is purely the recall signal.
    let confidenceSum = 0;
    familyCards.forEach(card => {
      const p = store[card.id];
      const pct = getConfidencePct(p);
      const wasSeen = !!(p?.seenCount) || !!p?.lastReviewedAt;
      if (wasSeen) seen++;
      misses += Number(p?.failCount) || 0;
      if (pct !== null) { pctSum += pct; pctCount++; }
      if (marksMap[card.id] === 'known' || (pct !== null && pct >= 70)) confirmed++;
      confidenceSum += (pct !== null) ? pct : 0;
    });
    const total = familyCards.length;
    const avgPct = pctCount ? Math.round(pctSum / pctCount) : null;
    // Keep unrounded so the chapter detail's "average of concept averages"
    // matches the chapter tile's avg-of-avgs to the nearest percent; the
    // row display rounds at the last moment.
    const conceptAvg = total ? confidenceSum / total : 0;
    let status;
    if (seen === 0) status = 'unseen';
    else if (confirmed >= total) status = 'strong';
    else if ((avgPct ?? 0) >= 50) status = 'shaky';
    else status = 'weak';
    concepts.push({ family, total, confirmed, seen, misses, avgPct, conceptAvg, status, cards: familyCards });
  });
  return concepts;
}

const GRAMMAR_CONCEPT_STATUS_META = {
  weak:   { dot: 'stacked-seg-b0',     label: 'Needs work' },
  shaky:  { dot: 'stacked-seg-b40',    label: 'Shaky' },
  strong: { dot: 'stacked-seg-b80',    label: 'Solid' },
  unseen: { dot: 'stacked-seg-unseen', label: 'Not started' }
};

function buildGrammarChapterGridHtml(mastery) {
  if (!mastery.length) {
    return `<div class="analytics-chart-card"><div class="analytics-chart-title">Grammar mastery by chapter</div><div class="analytics-empty">No grammar drills are available yet.</div></div>`;
  }
  const expandedKey = runtime.analyticsGrammarExpandedChapter || '';

  const bandClassFor = (pct, hasCards) => {
    if (!hasCards) return 'tile-band-unseen';
    if (pct <= 0) return 'tile-band-unseen';
    if (pct < 0.20) return 'tile-band-b0';
    if (pct < 0.40) return 'tile-band-b20';
    if (pct < 0.60) return 'tile-band-b40';
    if (pct < 0.80) return 'tile-band-b60';
    return 'tile-band-b80';
  };

  const tile = (row) => {
    const pctRound = row.total ? Math.round(row.pct * 100) : 0;
    const label = row.total
      ? `Ch. ${row.chapterKey}: ${pctRound}% avg confidence · ${row.confirmed} / ${row.total} confirmed — tap for concept breakdown`
      : `Ch. ${row.chapterKey}: no grammar drills yet`;
    let className = `chapter-tile ${bandClassFor(row.pct, row.total > 0)}`;
    if (!row.total) className += ' chapter-tile-empty';
    if (String(row.chapterKey) === expandedKey) className += ' chapter-tile-active';
    const pctText = row.total ? `${pctRound}%` : '—';
    return `<button type="button" class="${className}" data-grammar-chapter="${escapeHtml(String(row.chapterKey))}" title="${escapeHtml(label)}" aria-expanded="${String(row.chapterKey) === expandedKey ? 'true' : 'false'}"${row.total ? '' : ' disabled'}><span class="chapter-tile-num">${escapeHtml(row.chapterKey)}</span><span class="chapter-tile-pct">${escapeHtml(pctText)}</span></button>`;
  };

  return `
    <div class="analytics-chart-card chapter-grid-card">
      <div class="analytics-chart-title">Grammar mastery by chapter</div>
      <div class="chapter-grid">${mastery.map(tile).join('')}</div>
      <div class="stacked-legend">
        <span class="stacked-legend-item"><span class="stacked-legend-dot stacked-seg-b80"></span>80–100%</span>
        <span class="stacked-legend-item"><span class="stacked-legend-dot stacked-seg-b60"></span>60–80%</span>
        <span class="stacked-legend-item"><span class="stacked-legend-dot stacked-seg-b40"></span>40–60%</span>
        <span class="stacked-legend-item"><span class="stacked-legend-dot stacked-seg-b20"></span>20–40%</span>
        <span class="stacked-legend-item"><span class="stacked-legend-dot stacked-seg-b0"></span>0–20%</span>
        <span class="stacked-legend-item"><span class="stacked-legend-dot stacked-seg-unseen"></span>Unstarted</span>
      </div>
      <div class="chapter-detail-panel${expandedKey ? ' open' : ''}" id="grammarChapterDetailPanel">${expandedKey ? buildGrammarChapterDetailHtml(expandedKey) : ''}</div>
    </div>
  `;
}

function buildGrammarChapterDetailHtml(chapterKey) {
  if (!chapterKey) return '';
  const concepts = computeGrammarChapterConcepts(chapterKey);
  if (!concepts.length) {
    return `<div class="analytics-empty">No grammar concepts for Ch. ${escapeHtml(String(chapterKey))} yet.</div>`;
  }
  const sortMode = runtime.analyticsGrammarConceptSort === 'alphabetical' ? 'alphabetical' : 'confidence';
  const statusRank = { weak: 0, shaky: 1, unseen: 2, strong: 3 };
  const sorted = concepts.slice();
  if (sortMode === 'alphabetical') {
    sorted.sort((a, b) => a.family.localeCompare(b.family));
  } else {
    sorted.sort((a, b) => {
      if (statusRank[a.status] !== statusRank[b.status]) return statusRank[a.status] - statusRank[b.status];
      const ap = a.avgPct ?? -1;
      const bp = b.avgPct ?? -1;
      if (ap !== bp) return ap - bp;
      return a.family.localeCompare(b.family);
    });
  }

  const totalCards = concepts.reduce((sum, c) => sum + c.total, 0);
  const confirmedCards = concepts.reduce((sum, c) => sum + c.confirmed, 0);
  // Headline matches the tile: average of concept averages.
  const conceptAvgSum = concepts.reduce((sum, c) => sum + (c.conceptAvg || 0), 0);
  const headlinePct = concepts.length ? Math.round(conceptAvgSum / concepts.length) : 0;

  const expandedFamily = runtime.analyticsGrammarExpandedConcept || '';

  const conceptRow = (c) => {
    const meta = GRAMMAR_CONCEPT_STATUS_META[c.status];
    // Display the concept-wide average (marked-known = 100, unseen = 0) so the
    // row's % is the same number that contributes to the chapter avg headline.
    // `c.avgPct` (average of seen cards only) feeds status + sort ordering.
    const pctText = c.status === 'unseen' ? '—' : `${Math.round(c.conceptAvg)}%`;
    const detail = c.status === 'unseen'
      ? `${c.total} card${c.total === 1 ? '' : 's'} · not started`
      : `${c.confirmed}/${c.total} confirmed · ${c.misses} miss${c.misses === 1 ? '' : 'es'}`;
    const expanded = c.family === expandedFamily;
    const cardsHtml = expanded ? buildGrammarConceptCardsHtml(c.cards) : '';
    return `
      <li class="chapter-detail-row grammar-concept-row${expanded ? ' chapter-detail-row-active' : ''}"
          role="button"
          tabindex="0"
          aria-expanded="${expanded ? 'true' : 'false'}"
          data-grammar-concept="${escapeHtml(c.family)}">
        <span class="chapter-detail-dot ${meta.dot}" aria-hidden="true" title="${escapeHtml(meta.label)}"></span>
        <span class="grammar-review-concept">${escapeHtml(c.family)}</span>
        <span class="grammar-review-detail">${escapeHtml(detail)}</span>
        <span class="chapter-detail-pct">${escapeHtml(pctText)}</span>
      </li>
      ${expanded ? `<li class="chapter-detail-statcard-row grammar-concept-expansion-row" aria-hidden="false">${cardsHtml}</li>` : ''}`;
  };

  const sortBtn = (mode, label) => {
    const active = sortMode === mode;
    return `<button type="button" class="ctrl-btn chapter-detail-sort-btn${active ? ' active-toggle' : ''}" data-grammar-concept-sort="${mode}" aria-pressed="${active ? 'true' : 'false'}">${escapeHtml(label)}</button>`;
  };

  return `
    <div class="chapter-detail-head">
      <div class="chapter-detail-title">Ch. ${escapeHtml(String(chapterKey))} — ${headlinePct}% avg confidence <span class="chapter-detail-meta">${confirmedCards} / ${totalCards} confirmed · ${concepts.length} concept${concepts.length === 1 ? '' : 's'}</span></div>
      <div class="chapter-detail-controls">
        <div class="chapter-detail-sort" role="group" aria-label="Sort concepts">
          ${sortBtn('confidence', 'Status')}
          ${sortBtn('alphabetical', 'A–Z')}
        </div>
        <button type="button" class="chapter-detail-close" data-grammar-chapter-close="1" aria-label="Close chapter details">×</button>
      </div>
    </div>
    <ol class="chapter-detail-list">${sorted.map(conceptRow).join('')}</ol>
  `;
}

// ── Per-concept card breakdown (shown when a concept row is tapped) ──
// Mirrors the vocab chapter-detail row format: each card row shows the
// form + parsed answer + rolling confidence and can be tapped to reveal
// the full card stat card (pass/fail counts, SRS stage, etc.).
function buildGrammarConceptCardsHtml(cards) {
  if (!cards || !cards.length) return '<div class="analytics-empty">No cards in this concept.</div>';
  const marksMap = runtime.globalWordMarks.morph || {};
  const store = runtime.globalWordProgress.morph || {};
  const expandedCardId = runtime.analyticsGrammarExpandedCard || '';

  const rowFor = (card) => {
    const progress = store[card.id];
    const isKnownMark = marksMap[card.id] === 'known';
    const rawPct = getConfidencePct(progress);
    const seen = !!(progress?.seenCount) || !!progress?.lastReviewedAt;
    let bandClass;
    let pctText;
    let sortPct;
    if (rawPct === null && !seen) {
      bandClass = 'stacked-seg-unseen'; pctText = '—'; sortPct = -1;
    } else {
      const pct = rawPct ?? 0;
      sortPct = pct;
      pctText = `${pct}%`;
      if (pct >= 80)      bandClass = 'stacked-seg-b80';
      else if (pct >= 60) bandClass = 'stacked-seg-b60';
      else if (pct >= 40) bandClass = 'stacked-seg-b40';
      else if (pct >= 20) bandClass = 'stacked-seg-b20';
      else                bandClass = 'stacked-seg-b0';
    }
    return { card, bandClass, pctText, sortPct, isKnownMark };
  };
  const rows = cards.map(rowFor);
  rows.sort((a, b) => {
    if (a.sortPct !== b.sortPct) return a.sortPct - b.sortPct;
    return (a.card.form || '').localeCompare(b.card.form || '');
  });

  return `
    <ol class="grammar-concept-card-list">
      ${rows.map(r => {
        const expanded = String(r.card.id) === expandedCardId;
        const cardHtml = expanded
          ? buildWordStatCardHtml(r.card, store[r.card.id], r.isKnownMark)
          : '';
        return `
          <li class="chapter-detail-row grammar-card-row${expanded ? ' chapter-detail-row-active' : ''}"
              role="button"
              tabindex="0"
              aria-expanded="${expanded ? 'true' : 'false'}"
              data-grammar-card-id="${escapeHtml(String(r.card.id))}">
            <span class="chapter-detail-dot ${r.bandClass}" aria-hidden="true"></span>
            <span class="grammar-card-form">${escapeHtml(r.card.form || r.card.lemma || '—')}</span>
            <span class="grammar-card-answer">${escapeHtml(r.card.answer || r.card.gloss || '')}</span>
            <span class="chapter-detail-pct">${escapeHtml(r.pctText)}</span>
          </li>
          ${expanded ? `<li class="chapter-detail-statcard-row" aria-hidden="false">${cardHtml}</li>` : ''}
        `;
      }).join('')}
    </ol>
  `;
}

function renderGrammarChapterDetailPanel() {
  const panel = document.getElementById('grammarChapterDetailPanel');
  if (!panel) return;
  if (!runtime.analyticsGrammarExpandedChapter) {
    panel.innerHTML = '';
    panel.classList.remove('open');
    return;
  }
  panel.innerHTML = buildGrammarChapterDetailHtml(runtime.analyticsGrammarExpandedChapter);
  panel.classList.add('open');
}

function renderGrammarReviewSection() {
  const el = document.getElementById('analyticsGrammarReview');
  if (!el) return;
  if (!host.canAccessGrammarUi()) { el.innerHTML = ''; return; }
  el.innerHTML = buildGrammarChapterGridHtml(computeGrammarChapterMastery());
  setupGrammarReviewInteractivity(el);
}

// A "weakest: <value> <pct>%" pointer for a collapsed row — the headline
// pct can read healthy while one mood/tense lags, so this surfaces the worst
// seen value up front. Dot colour tracks the same 5-band gradient as the bars.
function weakestValueTagHtml(weakest) {
  if (!weakest) return '';
  const band = weakest.pct < 20 ? 'stacked-seg-b0'
    : weakest.pct < 40 ? 'stacked-seg-b20'
    : weakest.pct < 60 ? 'stacked-seg-b40'
    : weakest.pct < 80 ? 'stacked-seg-b60'
    : 'stacked-seg-b80';
  return `<span class="paradigm-stat-weakest"><span class="paradigm-stat-weakest-dot ${band}"></span>weakest: ${escapeHtml(weakest.label)} ${weakest.pct}%</span>`;
}

// Render the per-paradigm drill stats. Doesn't touch any other stat surface —
// this is a separate, opt-in record. Each row is tappable: tapping expands the
// per-value (mood / tense / voice …) proficiency breakdown for that paradigm,
// so weakness in a specific value shows instead of averaging into one bar. The
// "All paradigms" row aggregates the breakdown across every drilled paradigm.
function renderParadigmStepStatsSection() {
  const body = document.getElementById('analyticsParadigmStepStatsBody');
  const status = document.getElementById('analyticsParadigmStepStatsStatus');
  if (!body) return;
  const stats = runtime.paradigmStepStats || {};
  const enabledDims = host.getEnabledParsingDims();
  const drilled = getAllLemmaStats(stats, enabledDims);
  if (!drilled.length) {
    body.innerHTML = `<p class="analytics-empty">Turn on “Parse step-by-step” in Grammar mode and complete a parse to start seeing per-paradigm accuracy here.</p>`;
    if (status) status.textContent = 'No drill attempts yet. Tap a row to break a paradigm down by mood, tense, and voice.';
    return;
  }

  const expandedKey = runtime.analyticsParadigmExpanded;

  // Build each paradigm's breakdown from its in-scope forms (up to two recent
  // attempts per form), folding the same pool into the cross-paradigm
  // accumulator so the "All paradigms" row matches the per-lemma rows. The
  // headline % is now this per-form tally — not a capped rolling window — so
  // it covers every form, consistent with the bars.
  const overallAcc = createValueBreakdownAcc();
  const rows = drilled.map((s) => {
    const cards = host.getMorphCardsForLemma(s.lemma) || [];
    accumulateValueBreakdown(overallAcc, stats, s.lemma, cards, enabledDims);
    return { lemma: s.lemma, breakdown: summarizeLemmaValueBreakdown(stats, s.lemma, cards, enabledDims) };
  });
  // Worst-first: lowest per-form accuracy on top; paradigms with nothing seen
  // yet (no recent attempts) sink to the bottom.
  rows.sort((a, b) => {
    const pa = a.breakdown.totals.pct, pb = b.breakdown.totals.pct;
    if (pa == null && pb == null) return 0;
    if (pa == null) return 1;
    if (pb == null) return -1;
    return pa - pb;
  });

  const lemmaRows = rows.map(({ lemma, breakdown }) => {
    const { groups, weakest, totals } = breakdown;
    const isExpanded = expandedKey === lemma;
    const breakdownHtml = isExpanded ? buildDimValueBarsHtml(groups) : '';
    return `
      <div class="paradigm-stat-row${isExpanded ? ' paradigm-stat-row-active' : ''}"
           role="button"
           tabindex="0"
           aria-expanded="${isExpanded ? 'true' : 'false'}"
           data-paradigm-row="${escapeHtml(lemma)}">
        <div class="paradigm-stat-header">
          <span class="paradigm-stat-lemma">${escapeHtml(lemma)}</span>
          <span class="paradigm-stat-pct">${totals.pct == null ? '—' : `${totals.pct}%`} · ${totals.seen}/${totals.scope} forms</span>
        </div>
        ${weakest ? `<div class="paradigm-stat-weakline">${weakestValueTagHtml(weakest)}</div>` : ''}
        ${isExpanded ? `<div class="paradigm-stat-chart">${breakdownHtml}</div>` : ''}
      </div>`;
  }).join('');

  // Overall row (rendered on top): cross-paradigm per-form headline + merged
  // breakdown, so the single worst value across everything is the pointer.
  const { groups: overallGroups, weakest: overallWeakest, totals: overallTotals } = finalizeValueBreakdown(overallAcc);
  const overallExpanded = expandedKey === '__overall';
  const paradigmCount = rows.length;
  const overallRow = `
    <div class="paradigm-stat-row paradigm-stat-row-overall${overallExpanded ? ' paradigm-stat-row-active' : ''}"
         role="button"
         tabindex="0"
         aria-expanded="${overallExpanded ? 'true' : 'false'}"
         data-paradigm-row="__overall">
      <div class="paradigm-stat-header">
        <span class="paradigm-stat-lemma paradigm-stat-lemma-overall">All paradigms</span>
        <span class="paradigm-stat-pct">${overallTotals.pct == null ? '—' : `${overallTotals.pct}%`} · ${overallTotals.seen}/${overallTotals.scope} forms across ${paradigmCount} paradigm${paradigmCount === 1 ? '' : 's'}</span>
      </div>
      ${overallWeakest ? `<div class="paradigm-stat-weakline">${weakestValueTagHtml(overallWeakest)}</div>` : ''}
      ${overallExpanded ? `<div class="paradigm-stat-chart">${buildDimValueBarsHtml(overallGroups, { caption: 'Recent accuracy per value, across every paradigm · seen / in scope' })}</div>` : ''}
    </div>`;

  body.innerHTML = `<div class="paradigm-stat-list">${overallRow}${lemmaRows}</div>`;
  setupParadigmStepStatsInteractivity(body);
  if (status) status.textContent = `${paradigmCount} paradigm${paradigmCount === 1 ? '' : 's'} drilled · tap a row for the mood / tense breakdown.`;
}

function setupParadigmStepStatsInteractivity(rootEl) {
  if (!rootEl || rootEl.dataset.paradigmStatsBound === '1') return;
  rootEl.dataset.paradigmStatsBound = '1';
  const toggle = (key) => {
    if (!key) return;
    runtime.analyticsParadigmExpanded = runtime.analyticsParadigmExpanded === key ? null : key;
    renderParadigmStepStatsSection();
  };
  rootEl.addEventListener('click', (event) => {
    const row = event.target.closest('[data-paradigm-row]');
    if (!row || !rootEl.contains(row)) return;
    toggle(row.dataset.paradigmRow || '');
  });
  rootEl.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const row = event.target.closest('[data-paradigm-row]');
    if (!row || !rootEl.contains(row)) return;
    event.preventDefault();
    toggle(row.dataset.paradigmRow || '');
  });
}

function setupGrammarReviewInteractivity(rootEl) {
  if (!rootEl || rootEl.dataset.grammarReviewBound === '1') return;
  rootEl.dataset.grammarReviewBound = '1';

  // Tap a concept row → expand its card list. Mirrors the chapter-detail
  // word-row scroll preservation: the panel re-renders in place, so we
  // capture scroll offset against the tapped row's position before the
  // re-render and restore it afterwards.
  const handleConceptToggle = (row) => {
    const family = row.dataset.grammarConcept || '';
    if (!family) return;
    const list = row.closest('.chapter-detail-list');
    const prevScrollTop = list ? list.scrollTop : 0;
    const prevRowTop = list ? row.offsetTop : 0;

    runtime.analyticsGrammarExpandedConcept = runtime.analyticsGrammarExpandedConcept === family ? null : family;
    runtime.analyticsGrammarExpandedCard = null;
    renderGrammarChapterDetailPanel();

    const newList = document.querySelector('#grammarChapterDetailPanel .chapter-detail-list');
    if (!newList) return;
    const newRow = newList.querySelector(`[data-grammar-concept="${CSS.escape(family)}"]`);
    newList.scrollTop = newRow
      ? prevScrollTop + (newRow.offsetTop - prevRowTop)
      : prevScrollTop;
  };

  const handleCardToggle = (row) => {
    const cardId = row.dataset.grammarCardId || '';
    if (!cardId) return;
    const list = row.closest('.grammar-concept-card-list');
    const prevScrollTop = list ? list.scrollTop : 0;
    const prevRowTop = list ? row.offsetTop : 0;

    runtime.analyticsGrammarExpandedCard = runtime.analyticsGrammarExpandedCard === cardId ? null : cardId;
    renderGrammarChapterDetailPanel();

    const newList = document.querySelector('#grammarChapterDetailPanel .grammar-concept-card-list');
    if (!newList) return;
    const newRow = newList.querySelector(`[data-grammar-card-id="${CSS.escape(cardId)}"]`);
    newList.scrollTop = newRow
      ? prevScrollTop + (newRow.offsetTop - prevRowTop)
      : prevScrollTop;
  };

  rootEl.addEventListener('click', (event) => {
    const closeBtn = event.target.closest('[data-grammar-chapter-close]');
    if (closeBtn && rootEl.contains(closeBtn)) {
      runtime.analyticsGrammarExpandedChapter = null;
      runtime.analyticsGrammarExpandedConcept = null;
      runtime.analyticsGrammarExpandedCard = null;
      rootEl.querySelectorAll('.chapter-tile').forEach(t => {
        t.classList.remove('chapter-tile-active');
        t.setAttribute('aria-expanded', 'false');
      });
      renderGrammarChapterDetailPanel();
      return;
    }
    const sortToggle = event.target.closest('[data-grammar-concept-sort]');
    if (sortToggle && rootEl.contains(sortToggle)) {
      const nextMode = sortToggle.dataset.grammarConceptSort === 'alphabetical' ? 'alphabetical' : 'confidence';
      if (runtime.analyticsGrammarConceptSort !== nextMode) {
        runtime.analyticsGrammarConceptSort = nextMode;
        renderGrammarChapterDetailPanel();
      }
      return;
    }
    const cardRow = event.target.closest('.grammar-card-row[data-grammar-card-id]');
    if (cardRow && rootEl.contains(cardRow)) {
      handleCardToggle(cardRow);
      return;
    }
    const conceptRow = event.target.closest('.grammar-concept-row[data-grammar-concept]');
    if (conceptRow && rootEl.contains(conceptRow)) {
      handleConceptToggle(conceptRow);
      return;
    }
    const tile = event.target.closest('[data-grammar-chapter]');
    if (!tile || !rootEl.contains(tile)) return;
    const key = tile.dataset.grammarChapter || '';
    if (!key) return;
    const nextKey = runtime.analyticsGrammarExpandedChapter === key ? null : key;
    if (nextKey !== runtime.analyticsGrammarExpandedChapter) {
      runtime.analyticsGrammarExpandedConcept = null;
      runtime.analyticsGrammarExpandedCard = null;
    }
    runtime.analyticsGrammarExpandedChapter = nextKey;
    rootEl.querySelectorAll('.chapter-tile').forEach(t => {
      const active = t.dataset.grammarChapter === runtime.analyticsGrammarExpandedChapter;
      t.classList.toggle('chapter-tile-active', active);
      t.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
    renderGrammarChapterDetailPanel();
  });

  rootEl.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const cardRow = event.target.closest('.grammar-card-row[data-grammar-card-id]');
    if (cardRow && rootEl.contains(cardRow)) {
      event.preventDefault();
      handleCardToggle(cardRow);
      return;
    }
    const conceptRow = event.target.closest('.grammar-concept-row[data-grammar-concept]');
    if (conceptRow && rootEl.contains(conceptRow)) {
      event.preventDefault();
      handleConceptToggle(conceptRow);
    }
  });
}

function computePersonalRecords(usage, sessionHistory, streaks, courseData) {
  const longestSessionMs = sessionHistory.reduce((max, s) => Math.max(max, s.durationMs || 0), 0);

  // Best day = day with most cards first-confirmed.
  const byDay = {};
  const mergeFirstConfirmed = (store) => {
    Object.values(store || {}).forEach(entry => {
      const ts = Number(entry?.firstConfirmedAt) || 0;
      if (!ts) return;
      const key = getUsageDayKey(ts);
      byDay[key] = (byDay[key] || 0) + 1;
    });
  };
  mergeFirstConfirmed(runtime.globalWordProgress.g2e);
  mergeFirstConfirmed(runtime.globalWordProgress.e2g);
  mergeFirstConfirmed(runtime.globalWordProgress.morph);
  let bestDayCount = 0;
  let bestDayKey = '';
  Object.entries(byDay).forEach(([key, count]) => {
    if (count > bestDayCount) { bestDayCount = count; bestDayKey = key; }
  });

  const totalConfirmed = courseData.allVocabConfirmed + (host.canAccessGrammarUi() ? courseData.allGrammarConfirmed : 0);
  return {
    longestSessionMs,
    bestStreak: streaks.longest || 0,
    bestDayCount,
    bestDayKey,
    totalConfirmed
  };
}

function buildRecordsHtml(records) {
  const items = [
    { label: 'Longest session',  value: records.longestSessionMs ? formatUsageDuration(records.longestSessionMs) : '—', note: 'Active study, single sitting' },
    { label: 'Best day',          value: records.bestDayCount ? `${records.bestDayCount} cards` : '—', note: records.bestDayKey ? `On ${formatAnalyticsDate(new Date(records.bestDayKey + 'T00:00:00').getTime())}` : 'First confirmations in a single day' },
    { label: 'Best streak',       value: records.bestStreak ? `${records.bestStreak} day${records.bestStreak === 1 ? '' : 's'}` : '—', note: 'Longest consecutive run' },
    { label: 'Cards confirmed',   value: records.totalConfirmed.toLocaleString(), note: 'Course-wide, all directions' }
  ];
  return `
    <div class="analytics-chart-card records-card">
      <div class="analytics-chart-title">Personal records</div>
      <div class="records-grid">${items.map(it => `
        <div class="records-cell">
          <div class="records-value">${escapeHtml(it.value)}</div>
          <div class="records-label">${escapeHtml(it.label)}</div>
          <div class="records-note">${escapeHtml(it.note)}</div>
        </div>
      `).join('')}</div>
    </div>
  `;
}

function computeStubbornCards(cards, progressStore) {
  return (cards || [])
    .map(card => {
      const p = progressStore?.[card.id];
      if (!p) return null;
      const fails = Number(p.failCount) || 0;
      const passes = Number(p.passCount) || 0;
      const total = passes + fails;
      // Need at least 3 guesses before a card counts as stubborn — a single
      // missed flip isn't a pattern yet.
      if (total < 3) return null;
      // Smoothed confidence with a 1-pass / 0-fail pseudocount: (1+passes)/(1+total).
      // Stops low-sample cards (e.g. 1/5 = 20%) from sorting above
      // longer-history cards with a similar streak; the same value drives the
      // 50% cutoff so the two stay consistent.
      const smoothed = (passes + 1) / (total + 1);
      if (smoothed > 0.5) return null;
      const confidence = getConfidencePct(p);
      // Rolling last-10-flips confidence: once a card climbs above 50% the
      // user is no longer stuck on it, so it doesn't belong on a "stubborn"
      // list even if its lifetime smoothed score is still low.
      if (confidence !== null && confidence > 50) return null;
      const seen = Number(p.seenCount) || 0;
      const failRate = fails / total;
      return { card, fails, passes, seen, failRate, confidence, smoothed };
    })
    .filter(Boolean)
    .sort((a, b) => (a.smoothed - b.smoothed) || (b.fails - a.fails));
}

function buildStubbornListHtml(rows, kind) {
  if (!rows.length) return '';
  const renderRow = (row) => {
    const card = row.card;
    const headword = kind === 'grammar'
      ? `${card.form || card.lemma || '—'}${card.lemma && card.form && card.form !== card.lemma ? ` <span class="stubborn-lemma">(${escapeHtml(card.lemma)})</span>` : ''}`
      : escapeHtml(card.g || '—');
    const gloss = kind === 'grammar' ? (card.answer || card.gloss || '') : (card.e || '');
    return `
      <li class="stubborn-row">
        <div class="stubborn-word">${headword}</div>
        <div class="stubborn-gloss">${escapeHtml(gloss)}</div>
        <div class="stubborn-stats">${row.fails} miss${row.fails === 1 ? '' : 'es'} · ${Math.round(row.failRate * 100)}% miss rate · ${row.seen} flips</div>
      </li>
    `;
  };
  const title = kind === 'grammar' ? 'Most stubborn grammar' : 'Most stubborn vocabulary';
  const subtitle = kind === 'grammar'
    ? 'Grammar drills you\'ve missed most in this selection — worth a focused pass.'
    : 'Words you\'ve missed most in this selection — worth a focused pass.';
  return `
    <div class="analytics-chart-card stubborn-card">
      <div class="analytics-chart-title">${escapeHtml(title)}</div>
      <div class="stubborn-subtitle">${escapeHtml(subtitle)}</div>
      <ol class="stubborn-list">${rows.map(renderRow).join('')}</ol>
    </div>
  `;
}

function computeAtRiskCount(cards, progressStore) {
  return computeSlippingCards(cards, progressStore, Infinity).length;
}

// Cards that have been confirmed at least once but whose rolling
// confidence has dropped under 70% — these are the "slipping" entries.
// Sorted weakest-first so the top of the list is what to drill next.
// Filters out cards with fewer than 4 successful passes so a card that
// just barely confirmed once and then dipped doesn't dominate the list.
function computeSlippingCards(cards, progressStore, limit = 8) {
  if (!cards?.length) return [];
  const now = Date.now();
  const slipping = [];
  cards.forEach(card => {
    const p = progressStore?.[card.id];
    if (!p) return;
    if (!p.dueAt || !p.firstConfirmedAt) return;
    if (p.dueAt > now) return;
    if ((Number(p.passCount) || 0) <= 3) return;
    const pct = getConfidencePct(p);
    if (pct === null || pct < 70) slipping.push({ card, progress: p, confidence: pct });
  });
  return slipping
    .sort((a, b) => (a.confidence ?? 0) - (b.confidence ?? 0))
    .slice(0, limit);
}

// "Most improved": rolling confidence buffer (capped at last 10 samples by
// recordConfidenceSample) split into the last 5 vs the prior 5. Requires
// 10 samples so we always compare apples-to-apples; cards with shorter
// histories don't qualify. Filtered to cards whose *prior* 5-flip average
// was below the 70% "confirmed" threshold — a card that's been sitting at
// 90% confidence isn't "improving", it was already strong.
function computeMostImprovedCards(cards, progressStore, limit = 50) {
  if (!cards?.length) return [];
  const improved = [];
  cards.forEach(card => {
    const p = progressStore?.[card.id];
    if (!p) return;
    const hist = Array.isArray(p.confidenceHistory)
      ? p.confidenceHistory.filter(v => Number.isFinite(v))
      : [];
    if (hist.length < 10) return;
    const older = hist.slice(-10, -5);
    const recent = hist.slice(-5);
    const olderAvg = older.reduce((s, v) => s + v, 0) / older.length;
    const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
    const delta = recentAvg - olderAvg;
    if (delta < 0.15) return; // at least ~15% bump to surface
    if (olderAvg >= 0.7) return; // prior period was already strong; not "improving"
    const passes = Number(p.passCount) || 0;
    const fails = Number(p.failCount) || 0;
    improved.push({ card, delta, recentAvg, olderAvg, passes, fails, total: passes + fails });
  });
  return improved.sort((a, b) => b.delta - a.delta).slice(0, limit);
}

// ── Grammar concept aggregates for stubborn / improved lists ──────────
// Per the analytics structure: vocab lists drill down to individual words,
// but grammar lists pivot to concept (card.family) totals. A learner who
// keeps missing four cards of "Future indicative active" cares more about
// "review that concept" than four near-identical rows.
function computeStubbornGrammarConcepts(cards, progressStore) {
  const byFamily = new Map();
  (cards || []).forEach(card => {
    const family = card.family || 'Other';
    if (!byFamily.has(family)) byFamily.set(family, []);
    byFamily.get(family).push(card);
  });
  const rows = [];
  byFamily.forEach((familyCards, family) => {
    let fails = 0;
    let passes = 0;
    let seen = 0;
    familyCards.forEach(card => {
      const p = progressStore?.[card.id];
      if (!p) return;
      fails += Number(p.failCount) || 0;
      passes += Number(p.passCount) || 0;
      seen += Number(p.seenCount) || 0;
    });
    const total = passes + fails;
    if (total < 3) return;
    // Same 1-pseudopass smoothing the per-card list uses, applied to the
    // aggregate counts so a concept with one bad card and many good ones
    // doesn't sort above a uniformly weak concept.
    const smoothed = (passes + 1) / (total + 1);
    if (smoothed > 0.5) return;
    const failRate = fails / total;
    rows.push({ family, fails, passes, seen, total, failRate, smoothed, totalCards: familyCards.length });
  });
  return rows.sort((a, b) => (a.smoothed - b.smoothed) || (b.fails - a.fails));
}

function computeMostImprovedGrammarConcepts(cards, progressStore, limit = 50) {
  const byFamily = new Map();
  (cards || []).forEach(card => {
    const family = card.family || 'Other';
    if (!byFamily.has(family)) byFamily.set(family, []);
    byFamily.get(family).push(card);
  });
  const rows = [];
  byFamily.forEach((familyCards, family) => {
    let totalDelta = 0;
    let totalOlder = 0;
    let totalRecent = 0;
    let qualifying = 0;
    familyCards.forEach(card => {
      const p = progressStore?.[card.id];
      if (!p) return;
      const hist = Array.isArray(p.confidenceHistory)
        ? p.confidenceHistory.filter(v => Number.isFinite(v))
        : [];
      if (hist.length < 10) return;
      const older = hist.slice(-10, -5);
      const recent = hist.slice(-5);
      const olderAvg = older.reduce((s, v) => s + v, 0) / older.length;
      const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
      totalDelta += (recentAvg - olderAvg);
      totalOlder += olderAvg;
      totalRecent += recentAvg;
      qualifying++;
    });
    if (!qualifying) return;
    const avgDelta = totalDelta / qualifying;
    const avgOlder = totalOlder / qualifying;
    const avgRecent = totalRecent / qualifying;
    if (avgDelta < 0.15) return;
    if (avgOlder >= 0.7) return;
    rows.push({ family, avgDelta, avgOlder, avgRecent, qualifying, totalCards: familyCards.length });
  });
  return rows.sort((a, b) => b.avgDelta - a.avgDelta).slice(0, limit);
}

// ── Word-list row + collapsible builders ──────────────────────────────
// Shared by slipping / stubborn / most-improved lists inside the Total &
// Selected progress collapses. `primaryDisplay` is the right-most stat
// (a percent, a delta, a fails-count …). For vocab, rows are tappable —
// tapping expands a per-word stat card below the row, matching the chapter
// map interaction model. Grammar lists pivot to concept aggregates
// elsewhere; the grammar branch here only feeds the slipping list, which
// stays per-card and isn't tappable.
function renderCardListRow(item, kind, primaryDisplay, opts = {}) {
  const { progressStore, marksStore, listKey } = opts;
  const card = item.card;
  const headword = kind === 'grammar'
    ? `${escapeHtml(card.form || card.lemma || '—')}${card.lemma && card.form && card.form !== card.lemma ? ` <span class="stubborn-lemma">(${escapeHtml(card.lemma)})</span>` : ''}`
    : (typeof window !== 'undefined' && typeof window.formatGreekHeadword === 'function'
        ? window.formatGreekHeadword(card.g)
        : escapeHtml(card.g || '—'));
  const gloss = kind === 'grammar' ? (card.answer || card.gloss || '') : (card.e || '');

  const tappable = kind === 'vocab' && listKey && progressStore;
  const kindClass = kind === 'grammar' ? ' analytics-word-list-row-grammar' : '';
  if (!tappable) {
    return `
      <li class="analytics-word-list-row${kindClass}">
        <span class="analytics-word-list-headword">${headword}</span>
        <span class="analytics-word-list-gloss">${escapeHtml(gloss)}</span>
        <span class="analytics-word-list-pct">${escapeHtml(primaryDisplay)}</span>
      </li>
    `;
  }

  const expandedId = (runtime.analyticsExpandedListWords || {})[listKey] || '';
  const isExpanded = expandedId === card.id;
  const statCardHtml = isExpanded
    ? `<li class="analytics-word-list-statcard-row" aria-hidden="false">${buildWordStatCardHtml(card, progressStore?.[card.id], marksStore?.[card.id] === 'known')}</li>`
    : '';
  return `
    <li class="analytics-word-list-row analytics-word-list-row-tappable${kindClass}${isExpanded ? ' analytics-word-list-row-active' : ''}"
        role="button"
        tabindex="0"
        aria-expanded="${isExpanded ? 'true' : 'false'}"
        data-list-word-id="${escapeHtml(String(card.id))}"
        data-list-key="${escapeHtml(listKey)}">
      <span class="analytics-word-list-headword">${headword}</span>
      <span class="analytics-word-list-gloss">${escapeHtml(gloss)}</span>
      <span class="analytics-word-list-pct">${escapeHtml(primaryDisplay)}</span>
    </li>
    ${statCardHtml}
  `;
}

function buildSlippingCollapseHtml(slipping, kind, collapseKey, opts = {}) {
  if (!slipping.length) return '';
  return `
    <details class="analytics-collapse analytics-sub-collapse" data-collapse-key="${escapeHtml(collapseKey)}">
      <summary class="analytics-collapse-summary">
        <span class="analytics-collapse-caret" aria-hidden="true">▾</span>
        <div class="analytics-collapse-title-wrap">
          <h4>Slipping list <span class="analytics-collapse-meta">${slipping.length}</span></h4>
        </div>
      </summary>
      <div class="analytics-collapse-body">
        <ol class="analytics-word-list analytics-word-list-scrollable">
          ${slipping.map(s => renderCardListRow(s, kind, s.confidence != null ? `${s.confidence}%` : '—', { ...opts, listKey: collapseKey })).join('')}
        </ol>
      </div>
    </details>
  `;
}

function buildStubbornCollapseHtml(rows, kind, collapseKey, opts = {}) {
  if (!rows.length) return '';
  const heading = 'Most stubborn vocabulary';
  const statFor = (r) => {
    const missesPart = `${r.fails} miss${r.fails === 1 ? '' : 'es'}`;
    const confPart = r.confidence != null ? `${r.confidence}% conf` : '— conf';
    return `${missesPart} · ${confPart}`;
  };
  return `
    <details class="analytics-collapse analytics-sub-collapse" data-collapse-key="${escapeHtml(collapseKey)}">
      <summary class="analytics-collapse-summary">
        <span class="analytics-collapse-caret" aria-hidden="true">▾</span>
        <div class="analytics-collapse-title-wrap">
          <h4>${escapeHtml(heading)} <span class="analytics-collapse-meta">${rows.length}</span></h4>
        </div>
      </summary>
      <div class="analytics-collapse-body">
        <ol class="analytics-word-list analytics-word-list-scrollable">
          ${rows.map(r => renderCardListRow(r, kind, statFor(r), { ...opts, listKey: collapseKey })).join('')}
        </ol>
      </div>
    </details>
  `;
}

function buildImprovedCollapseHtml(improved, kind, collapseKey, opts = {}) {
  if (!improved.length) return '';
  const title = 'Most improved words';
  const statFor = (i) => `+${Math.round(i.delta * 100)}% · ${i.total} guess${i.total === 1 ? '' : 'es'}`;
  return `
    <details class="analytics-collapse analytics-sub-collapse" data-collapse-key="${escapeHtml(collapseKey)}">
      <summary class="analytics-collapse-summary">
        <span class="analytics-collapse-caret" aria-hidden="true">▾</span>
        <div class="analytics-collapse-title-wrap">
          <h4>${escapeHtml(title)} <span class="analytics-collapse-meta">${improved.length}</span></h4>
        </div>
      </summary>
      <div class="analytics-collapse-body">
        <ol class="analytics-word-list analytics-word-list-scrollable">
          ${improved.map(i => renderCardListRow(i, kind, statFor(i), { ...opts, listKey: collapseKey })).join('')}
        </ol>
      </div>
    </details>
  `;
}

// Grammar variants: stubborn / improved aggregate per-concept (card.family).
// Each row reports concept-level totals — no individual card drilldown here;
// the chapter-mastery grid handles per-card detail.
function buildStubbornConceptCollapseHtml(concepts, collapseKey) {
  if (!concepts.length) return '';
  const renderRow = (c) => {
    const failRate = c.total ? Math.round(c.failRate * 100) : 0;
    const stat = `${c.fails} miss${c.fails === 1 ? '' : 'es'} · ${failRate}% miss rate`;
    const sub = `${c.totalCards} card${c.totalCards === 1 ? '' : 's'} · ${c.passes + c.fails} flip${c.passes + c.fails === 1 ? '' : 's'}`;
    return `
      <li class="analytics-word-list-row analytics-word-list-row-grammar">
        <span class="analytics-word-list-headword">${escapeHtml(c.family)}</span>
        <span class="analytics-word-list-gloss">${escapeHtml(sub)}</span>
        <span class="analytics-word-list-pct">${escapeHtml(stat)}</span>
      </li>
    `;
  };
  return `
    <details class="analytics-collapse analytics-sub-collapse" data-collapse-key="${escapeHtml(collapseKey)}">
      <summary class="analytics-collapse-summary">
        <span class="analytics-collapse-caret" aria-hidden="true">▾</span>
        <div class="analytics-collapse-title-wrap">
          <h4>Most stubborn grammar concepts <span class="analytics-collapse-meta">${concepts.length}</span></h4>
        </div>
      </summary>
      <div class="analytics-collapse-body">
        <ol class="analytics-word-list analytics-word-list-scrollable">
          ${concepts.map(renderRow).join('')}
        </ol>
      </div>
    </details>
  `;
}

function buildImprovedConceptCollapseHtml(concepts, collapseKey) {
  if (!concepts.length) return '';
  const renderRow = (c) => {
    const stat = `+${Math.round(c.avgDelta * 100)}% · ${c.qualifying} card${c.qualifying === 1 ? '' : 's'}`;
    const sub = `${c.totalCards} card${c.totalCards === 1 ? '' : 's'} · prior ${Math.round(c.avgOlder * 100)}%`;
    return `
      <li class="analytics-word-list-row analytics-word-list-row-grammar">
        <span class="analytics-word-list-headword">${escapeHtml(c.family)}</span>
        <span class="analytics-word-list-gloss">${escapeHtml(sub)}</span>
        <span class="analytics-word-list-pct">${escapeHtml(stat)}</span>
      </li>
    `;
  };
  return `
    <details class="analytics-collapse analytics-sub-collapse" data-collapse-key="${escapeHtml(collapseKey)}">
      <summary class="analytics-collapse-summary">
        <span class="analytics-collapse-caret" aria-hidden="true">▾</span>
        <div class="analytics-collapse-title-wrap">
          <h4>Most improved grammar concepts <span class="analytics-collapse-meta">${concepts.length}</span></h4>
        </div>
      </summary>
      <div class="analytics-collapse-body">
        <ol class="analytics-word-list analytics-word-list-scrollable">
          ${concepts.map(renderRow).join('')}
        </ol>
      </div>
    </details>
  `;
}

// Builds the inner content of a "Vocabulary/Grammar progress" collapse:
// slipping count + collapsible list, cumulative line chart, projected
// finish, stubborn collapsible, and a most-improved collapsible. Vocab
// stubborn / improved are per-card (each row tappable for word stats);
// grammar stubborn / improved pivot to concept (card.family) aggregates
// so the user sees "Future indicative active" once instead of four
// near-identical rows. The per-band histogram is intentionally NOT repeated
// here — it already lives at the top of each Total/Selected section.
function buildProgressInnerHtml(opts) {
  const { cards, progressStore, marksStore, kind, scopeKey, emptyMessage } = opts;
  if (!cards || !cards.length) {
    return `<div class="analytics-empty">${escapeHtml(emptyMessage || 'No data for this view yet.')}</div>`;
  }
  const series = buildCumulativeConfirmationSeries(cards, marksStore, progressStore);
  const projection = getRegressionProjection(series.series, series.currentConfirmed, series.total);
  const slipping = computeSlippingCards(cards, progressStore);

  const projectedValue = series.currentConfirmed >= series.total && series.total
    ? 'Complete'
    : (projection ? formatAnalyticsDate(projection.projectedTs) : '—');
  const projectedNote = projection
    ? `${projection.cardsPerDay.toFixed(2)} ${kind === 'grammar' ? 'items' : 'words'}/day regression`
    : 'Needs more recent progress data';

  const rowOpts = { progressStore, marksStore };
  let stubbornHtml;
  let improvedHtml;
  if (kind === 'grammar') {
    const stubbornConcepts = computeStubbornGrammarConcepts(cards, progressStore);
    const improvedConcepts = computeMostImprovedGrammarConcepts(cards, progressStore);
    stubbornHtml = buildStubbornConceptCollapseHtml(stubbornConcepts, `${scopeKey}Stubborn`);
    improvedHtml = buildImprovedConceptCollapseHtml(improvedConcepts, `${scopeKey}Improved`);
  } else {
    const stubborn = computeStubbornCards(cards, progressStore);
    const improved = computeMostImprovedCards(cards, progressStore);
    stubbornHtml = buildStubbornCollapseHtml(stubborn, kind, `${scopeKey}Stubborn`, rowOpts);
    improvedHtml = buildImprovedCollapseHtml(improved, kind, `${scopeKey}Improved`, rowOpts);
  }

  return `
    <div class="analytics-metric-card analytics-progress-metric">
      <div class="analytics-metric-label">Slipping now</div>
      <div class="analytics-metric-value">${slipping.length}</div>
      <div class="analytics-metric-note">Confirmed 4+ times but rolling accuracy now &lt; 70%</div>
    </div>
    ${buildSlippingCollapseHtml(slipping, kind, `${scopeKey}SlippingList`, rowOpts)}
    <div class="analytics-chart-card">
      <div class="analytics-chart-title">Cumulative confirmed fraction</div>
      ${series.series.length
        ? buildLineChartSvg(series.series, { title: 'Cumulative confirmation', percent: true, maxValue: 1 })
        : '<div class="analytics-empty">No confirmation history yet for this view.</div>'}
    </div>
    <div class="analytics-metric-card analytics-progress-metric">
      <div class="analytics-metric-label">Projected finish</div>
      <div class="analytics-metric-value">${escapeHtml(projectedValue)}</div>
      <div class="analytics-metric-note">${escapeHtml(projectedNote)}</div>
    </div>
    ${stubbornHtml}
    ${improvedHtml}
  `;
}

export function renderAnalyticsOverlay() {
  const overlay = document.getElementById('analyticsOverlay');
  if (!overlay) return;
  host.accumulateActiveStudyTime();
  const usage = host.ensureUsageStats();
  const usageSeries = buildDailyCumulativeSeriesFromMap(usage.activeDailyMs, usage.firstStudyAt || 0);
  const sessionHistory = [...usage.studySessionHistory];
  if (usage.currentStudySession && usage.currentStudySession.startedAt) sessionHistory.push({ startedAt: usage.currentStudySession.startedAt, endedAt: usage.lastStudyCountedAt || Date.now(), durationMs: usage.currentStudySession.durationMs || 0, interactionCount: usage.currentStudySession.interactionCount || 0 });
  const latestSession = sessionHistory[sessionHistory.length - 1] || null;

  // ── Per-direction progress stores. Analytics needs to read vocab progress
  //    from the g2e/e2g store and grammar progress from the morph store
  //    regardless of the current studyMode, otherwise getWordProgress()
  //    (which is keyed on the active mode) reports every off-mode card as
  //    "Unseen". The analytics page has its own direction + scope toggles
  //    (runtime.analyticsVocabDirection / runtime.analyticsVocabScope) so
  //    flipping the view never disturbs the study deck. ──
  const g2eProgressStore = runtime.globalWordProgress.g2e || {};
  const e2gProgressStore = runtime.globalWordProgress.e2g || {};
  const morphProgressStore = runtime.globalWordProgress.morph || {};
  const analyticsDirection = getAnalyticsVocabDirection();
  const analyticsRequiredOnly = isAnalyticsVocabRequiredOnly();
  const vocabProgressStore = getAnalyticsVocabProgressStore();
  const vocabMarks = getAnalyticsVocabMarksStore();

  // ── Vocab & Grammar data (used by both gamification and section renders) ──
  const vocabCards = runtime.selectedKeys.length ? getSelectedVocabCards(runtime.selectedKeys, analyticsRequiredOnly) : [];
  const vocabProgress = buildCumulativeConfirmationSeries(vocabCards, vocabMarks, vocabProgressStore);
  const vocabProjection = getRegressionProjection(vocabProgress.series, vocabProgress.currentConfirmed, vocabProgress.total);
  const vocabBuckets = buildConfirmationHistogram(vocabCards, vocabProgressStore);
  const grammarCards = host.canAccessGrammarUi() && runtime.selectedKeys.length ? getSelectedGrammarCards(runtime.selectedKeys) : [];
  const grammarMarks = runtime.globalWordMarks.morph;
  const grammarProgress = buildCumulativeConfirmationSeries(grammarCards, grammarMarks, morphProgressStore);
  const grammarProjection = getRegressionProjection(grammarProgress.series, grammarProgress.currentConfirmed, grammarProgress.total);
  const grammarBuckets = buildConfirmationHistogram(grammarCards, morphProgressStore);

  // ── Course-wide data (selection-independent, represents full course) ──
  const courseData = computeCourseWideData();

  // ── Gamification computations (all course-wide) ──
  const streaks = computeStudyStreaks(usage.activeDailyMs);
  const xpData = computeXpAndLevel(usage);
  const mergedProgressStore = {};
  [g2eProgressStore, e2gProgressStore, morphProgressStore].forEach(store => {
    Object.entries(store).forEach(([cardId, entry]) => {
      const existing = mergedProgressStore[cardId] || {};
      mergedProgressStore[cardId] = {
        ...existing,
        ...entry,
        lastReviewedAt: Math.max(Number(existing.lastReviewedAt) || 0, Number(entry?.lastReviewedAt) || 0),
        firstConfirmedAt: Math.max(Number(existing.firstConfirmedAt) || 0, Number(entry?.firstConfirmedAt) || 0)
      };
    });
  });
  const allCourseCards = [...courseData.allVocabCards, ...courseData.allGrammarCards];
  const mergedMarks = { ...(runtime.globalWordMarks.g2e || {}), ...(runtime.globalWordMarks.e2g || {}), ...(runtime.globalWordMarks.morph || {}) };
  const todayStats = computeTodayStats(usage.activeDailyMs, allCourseCards, mergedMarks, mergedProgressStore);
  const achievements = computeAchievements(usage, courseData, streaks, sessionHistory.length, todayStats);
  const dailyAwards = achievements.filter(a => a.group === 'daily');
  const milestones = achievements.filter(a => a.group !== 'chapter' && a.group !== 'daily');
  const chapterAwards = achievements.filter(a => a.group === 'chapter');
  const earnedDaily = dailyAwards.filter(a => a.earned).length;
  const earnedMilestones = milestones.filter(a => a.earned).length;
  const earnedChapters = chapterAwards.filter(a => a.earned).length;

  // ── Hero section ──
  const heroEl = document.getElementById('analyticsHero');
  if (heroEl) {
    const streakLabel = streaks.current === 1 ? '1 day' : `${streaks.current} days`;
    const streakFlame = streaks.current >= 7 ? '\u{1F525}' : streaks.current >= 3 ? '♨️' : '✧';
    const todayGoalFraction = Math.min(1, todayStats.todayMs / (15 * 60 * 1000)); // 15-min daily goal
    heroEl.innerHTML = `
      <div class="hero-grid">
        <div class="hero-card hero-streak">
          <div class="hero-icon">${streakFlame}</div>
          <div class="hero-big">${streakLabel}</div>
          <div class="hero-sub">Current streak${streaks.longest > streaks.current ? ` · Best: ${streaks.longest}d` : ''}</div>
        </div>
        <div class="hero-card hero-level">
          <div class="hero-rank-badge">Lv. ${xpData.currentLevel.level}</div>
          <div class="hero-big">${escapeHtml(xpData.currentLevel.title)}</div>
          <div class="hero-sub">${xpData.totalXp.toLocaleString()} XP${xpData.currentLevel.flav ? ' · ' + escapeHtml(xpData.currentLevel.flav) : ''}</div>
          ${buildLevelBarHtml(xpData)}
        </div>
        <div class="hero-card hero-today">
          ${buildCircularProgressSvg(todayGoalFraction, 'Today progress', formatUsageDuration(todayStats.todayMs))}
          <div class="hero-today-stats">
            <span>${todayStats.reviewedToday} reviewed</span>
            <span>${todayStats.newToday} new</span>
          </div>
        </div>
      </div>
    `;
  }

  // ── Title ladder ──
  const titlesEl = document.getElementById('analyticsTitles');
  if (titlesEl) {
    titlesEl.innerHTML = buildTitleLadderHtml(xpData);
  }

  // ── Vocab view toggle bar (direction + scope) ──
  renderVocabViewToggles();

  // ── Direction + scope labels reused across the vocab sections ──
  const dirLabel = analyticsDirection === 'e2g' ? 'English → Greek' : 'Greek → English';
  const scopeLabel = analyticsRequiredOnly ? 'Required only' : 'All vocab';
  const isConfirmedFor = (store, marks) => (card) => {
    if (marks[card.id] === 'known') return true;
    const pct = getConfidencePct(store[card.id]);
    return pct !== null && pct >= 70;
  };

  // ── Total Vocabulary: top histogram, chapter map, progress inner ──
  const allCourseVocab = getAllVocabCards(false);
  const reqCourseVocab = getAllVocabCards(true);
  const totalVocabCards = analyticsRequiredOnly ? reqCourseVocab : allCourseVocab;
  const totalVocabConfirmed = totalVocabCards.filter(isConfirmedFor(vocabProgressStore, vocabMarks)).length;

  const totalVocabBarEl = document.getElementById('analyticsTotalVocabBar');
  if (totalVocabBarEl) {
    const buckets = buildConfirmationHistogram(totalVocabCards, vocabProgressStore);
    const totalVocabSeries = buildCumulativeConfirmationSeries(totalVocabCards, vocabMarks, vocabProgressStore);
    totalVocabBarEl.innerHTML = `
      <div class="analytics-chart-card">
        <div class="analytics-chart-title">${totalVocabConfirmed} / ${totalVocabCards.length} confirmed · ${escapeHtml(scopeLabel)} · ${escapeHtml(dirLabel)}</div>
        ${buildHistogramSvg(buckets, { title: 'Course vocabulary confirmation' })}
        ${buildConfidenceSummaryBox({ currentConfirmed: totalVocabConfirmed, total: totalVocabCards.length, weeklyPct: totalVocabSeries.weeklyPct })}
      </div>
    `;
  }
  const totalVocabStatusEl = document.getElementById('analyticsTotalVocabSummaryStatus');
  if (totalVocabStatusEl) {
    totalVocabStatusEl.textContent = `${totalVocabConfirmed} / ${totalVocabCards.length} confirmed · ${dirLabel} · ${scopeLabel}`;
  }

  // Chapter mastery grid lives inside Total Vocab > Chapter map collapse
  const chapterGridEl = document.getElementById('analyticsChapterGrid');
  if (chapterGridEl) {
    const mastery = computeChapterMastery(vocabProgressStore, vocabMarks, analyticsRequiredOnly);
    if (mastery.length) {
      if (runtime.analyticsExpandedChapter && !mastery.some(m => String(m.chapterKey) === runtime.analyticsExpandedChapter)) {
        runtime.analyticsExpandedChapter = null;
        runtime.analyticsExpandedWord = null;
      }
      chapterGridEl.innerHTML = buildChapterGridHtml(mastery);
      setupChapterGridInteractivity(chapterGridEl);
    } else {
      chapterGridEl.innerHTML = '';
      runtime.analyticsExpandedChapter = null;
      runtime.analyticsExpandedWord = null;
    }
  }

  const totalVocabProgressBody = document.getElementById('analyticsTotalVocabProgressBody');
  if (totalVocabProgressBody) {
    totalVocabProgressBody.innerHTML = buildProgressInnerHtml({
      cards: totalVocabCards,
      progressStore: vocabProgressStore,
      marksStore: vocabMarks,
      kind: 'vocab',
      scopeKey: 'totalVocab',
    });
  }
  const totalVocabProgressStatus = document.getElementById('analyticsTotalVocabProgressStatus');
  if (totalVocabProgressStatus) {
    totalVocabProgressStatus.textContent = `${totalVocabConfirmed} / ${totalVocabCards.length} confirmed · ${dirLabel}`;
  }

  // ── Selected Vocabulary: bar + progress inner, both collapsed by default ──
  const selectedVocabBarEl = document.getElementById('analyticsSelectedVocabBar');
  const selectedVocabBody = document.getElementById('analyticsSelectedVocabProgressBody');
  const selectedVocabSummary = document.getElementById('analyticsSelectedVocabSummaryStatus');
  const selectedVocabProgressStatus = document.getElementById('analyticsSelectedVocabProgressStatus');
  if (vocabCards.length) {
    if (selectedVocabBarEl) {
      const buckets = buildConfirmationHistogram(vocabCards, vocabProgressStore);
      selectedVocabBarEl.innerHTML = `
        <div class="analytics-chart-card">
          <div class="analytics-chart-title">Selected sets — ${vocabProgress.currentConfirmed} / ${vocabProgress.total || 0} confirmed (${escapeHtml(dirLabel)})</div>
          ${buildHistogramSvg(buckets, { title: 'Selected vocabulary confirmation' })}
          ${buildConfidenceSummaryBox({ currentConfirmed: vocabProgress.currentConfirmed, total: vocabProgress.total, weeklyPct: vocabProgress.weeklyPct })}
        </div>
      `;
    }
    if (selectedVocabBody) {
      selectedVocabBody.innerHTML = buildProgressInnerHtml({
        cards: vocabCards,
        progressStore: vocabProgressStore,
        marksStore: vocabMarks,
        kind: 'vocab',
        scopeKey: 'selectedVocab',
      });
    }
    if (selectedVocabSummary) {
      selectedVocabSummary.textContent = `${vocabProgress.currentConfirmed} / ${vocabProgress.total || 0} confirmed · ${dirLabel} · ${runtime.selectedKeys.length} set${runtime.selectedKeys.length === 1 ? '' : 's'}`;
    }
    if (selectedVocabProgressStatus) {
      selectedVocabProgressStatus.textContent = `${vocabProgress.currentConfirmed} / ${vocabProgress.total || 0} confirmed · ${scopeLabel}`;
    }
  } else {
    const emptyMsg = '<div class="analytics-empty">Choose a session or chapter on the home screen to populate this view.</div>';
    if (selectedVocabBarEl) selectedVocabBarEl.innerHTML = emptyMsg;
    if (selectedVocabBody) selectedVocabBody.innerHTML = emptyMsg;
    if (selectedVocabSummary) selectedVocabSummary.textContent = 'Pick a session or chapter on the home screen to populate.';
    if (selectedVocabProgressStatus) selectedVocabProgressStatus.textContent = '';
  }

  // ── Total Grammar: top histogram, chapter mastery, progress inner ──
  const showGrammar = host.canAccessGrammarUi();
  const totalGrammarCards = showGrammar ? courseData.allGrammarCards : [];
  const totalGrammarBarEl = document.getElementById('analyticsTotalGrammarBar');
  if (totalGrammarBarEl) {
    if (!showGrammar || !totalGrammarCards.length) {
      totalGrammarBarEl.innerHTML = '';
    } else {
      const buckets = buildConfirmationHistogram(totalGrammarCards, morphProgressStore);
      const totalGrammarSeries = buildCumulativeConfirmationSeries(totalGrammarCards, grammarMarks, morphProgressStore);
      totalGrammarBarEl.innerHTML = `
        <div class="analytics-chart-card">
          <div class="analytics-chart-title">${courseData.allGrammarConfirmed} / ${courseData.allGrammarTotal} confirmed</div>
          ${buildHistogramSvg(buckets, { title: 'Course grammar confirmation' })}
          ${buildConfidenceSummaryBox({ currentConfirmed: courseData.allGrammarConfirmed, total: courseData.allGrammarTotal, weeklyPct: totalGrammarSeries.weeklyPct })}
        </div>
      `;
    }
  }
  // Grammar review (chapter mastery grid) renders into #analyticsGrammarReview
  // which lives inside the Total Grammar > Chapter mastery collapse.
  renderGrammarReviewSection();
  renderParadigmStepStatsSection();
  const totalGrammarBody = document.getElementById('analyticsTotalGrammarProgressBody');
  if (totalGrammarBody) {
    totalGrammarBody.innerHTML = buildProgressInnerHtml({
      cards: totalGrammarCards,
      progressStore: morphProgressStore,
      marksStore: grammarMarks,
      kind: 'grammar',
      scopeKey: 'totalGrammar',
      emptyMessage: showGrammar ? 'No grammar drills available yet.' : 'Grammar is not available in this profile.'
    });
  }
  const totalGrammarStatusEl = document.getElementById('analyticsTotalGrammarSummaryStatus');
  if (totalGrammarStatusEl) {
    totalGrammarStatusEl.textContent = showGrammar
      ? `${courseData.allGrammarConfirmed} / ${courseData.allGrammarTotal} confirmed`
      : 'Grammar not available in this profile.';
  }
  const totalGrammarProgressStatus = document.getElementById('analyticsTotalGrammarProgressStatus');
  if (totalGrammarProgressStatus) {
    totalGrammarProgressStatus.textContent = showGrammar
      ? `${courseData.allGrammarConfirmed} / ${courseData.allGrammarTotal} confirmed`
      : '';
  }

  // ── Selected Grammar: bar + progress inner, all collapsed by default ──
  const selectedGrammarBarEl = document.getElementById('analyticsSelectedGrammarBar');
  const selectedGrammarBody = document.getElementById('analyticsSelectedGrammarProgressBody');
  const selectedGrammarSummary = document.getElementById('analyticsSelectedGrammarSummaryStatus');
  const selectedGrammarProgressStatus = document.getElementById('analyticsSelectedGrammarProgressStatus');
  if (showGrammar && grammarCards.length) {
    if (selectedGrammarBarEl) {
      const buckets = buildConfirmationHistogram(grammarCards, morphProgressStore);
      selectedGrammarBarEl.innerHTML = `
        <div class="analytics-chart-card">
          <div class="analytics-chart-title">Selected sets — ${grammarProgress.currentConfirmed} / ${grammarProgress.total || 0} confirmed</div>
          ${buildHistogramSvg(buckets, { title: 'Selected grammar confirmation' })}
          ${buildConfidenceSummaryBox({ currentConfirmed: grammarProgress.currentConfirmed, total: grammarProgress.total, weeklyPct: grammarProgress.weeklyPct })}
        </div>
      `;
    }
    if (selectedGrammarBody) {
      selectedGrammarBody.innerHTML = buildProgressInnerHtml({
        cards: grammarCards,
        progressStore: morphProgressStore,
        marksStore: grammarMarks,
        kind: 'grammar',
        scopeKey: 'selectedGrammar',
      });
    }
    if (selectedGrammarSummary) {
      selectedGrammarSummary.textContent = `${grammarProgress.currentConfirmed} / ${grammarProgress.total || 0} confirmed · ${runtime.selectedKeys.length} set${runtime.selectedKeys.length === 1 ? '' : 's'}`;
    }
    if (selectedGrammarProgressStatus) {
      selectedGrammarProgressStatus.textContent = `${grammarProgress.currentConfirmed} / ${grammarProgress.total || 0} confirmed`;
    }
  } else {
    const emptyMsg = showGrammar
      ? '<div class="analytics-empty">Choose a session or chapter on the home screen to populate this view.</div>'
      : '';
    if (selectedGrammarBarEl) selectedGrammarBarEl.innerHTML = emptyMsg;
    if (selectedGrammarBody) selectedGrammarBody.innerHTML = emptyMsg;
    if (selectedGrammarSummary) {
      selectedGrammarSummary.textContent = showGrammar
        ? 'Pick a session or chapter on the home screen to populate.'
        : 'Grammar not available in this profile.';
    }
    if (selectedGrammarProgressStatus) selectedGrammarProgressStatus.textContent = '';
  }

  // ── Study activity (records, heatmap, time metrics, cumulative chart) ──
  const recordsEl = document.getElementById('analyticsRecords');
  if (recordsEl) {
    const records = computePersonalRecords(usage, sessionHistory, streaks, courseData);
    recordsEl.innerHTML = buildRecordsHtml(records);
  }
  const heatmapEl = document.getElementById('analyticsHeatmap');
  if (heatmapEl) {
    const hasData = Object.keys(usage.activeDailyMs || {}).some(k => usage.activeDailyMs[k] > 0);
    heatmapEl.innerHTML = hasData
      ? `<div class="analytics-chart-card heatmap-card">
           <div class="analytics-chart-title">Study activity</div>
           ${buildHeatmapSvg(usage.activeDailyMs)}
           <div class="heatmap-legend">
             <span class="heatmap-legend-label">Less</span>
             <span class="heatmap-swatch" style="background:rgba(255,255,255,0.05)"></span>
             <span class="heatmap-swatch" style="background:rgba(201,168,76,0.25)"></span>
             <span class="heatmap-swatch" style="background:rgba(201,168,76,0.50)"></span>
             <span class="heatmap-swatch" style="background:rgba(201,168,76,0.75)"></span>
             <span class="heatmap-swatch" style="background:rgba(201,168,76,0.90)"></span>
             <span class="heatmap-legend-label">More</span>
           </div>
         </div>`
      : '';
  }
  const overallMetricsEl = document.getElementById('analyticsOverallMetrics');
  const overallChartEl = document.getElementById('analyticsTimeChart');
  const sessionEl = document.getElementById('analyticsSessionSummary');
  // Total card-views: sum of seenCount across every directional progress
  // store (g2e + e2g + morph). This is the raw "how many flips have I done
  // across the whole course" stat that used to live in the per-deck
  // progress frame.
  let totalCardViews = 0;
  ['g2e', 'e2g', 'morph'].forEach(direction => {
    const store = (runtime.globalWordProgress && runtime.globalWordProgress[direction]) || {};
    Object.values(store).forEach(entry => {
      if (entry && Number.isFinite(entry.seenCount)) totalCardViews += entry.seenCount;
    });
  });
  if (overallMetricsEl) overallMetricsEl.innerHTML = `
      <div class="analytics-metric-card"><div class="analytics-metric-label">Active study time</div><div class="analytics-metric-value">${escapeHtml(formatUsageDuration(usage.activeStudyMs))}</div><div class="analytics-metric-note">Stricter interaction-based timer</div></div>
      <div class="analytics-metric-card"><div class="analytics-metric-label">Foreground time</div><div class="analytics-metric-value">${escapeHtml(formatUsageDuration(usage.totalMs))}</div><div class="analytics-metric-note">App visible on screen</div></div>
      <div class="analytics-metric-card"><div class="analytics-metric-label">Card-views logged</div><div class="analytics-metric-value">${totalCardViews.toLocaleString()}</div><div class="analytics-metric-note">Across every direction and mode</div></div>
      <div class="analytics-metric-card"><div class="analytics-metric-label">Study sessions logged</div><div class="analytics-metric-value">${sessionHistory.length}</div><div class="analytics-metric-note">${latestSession ? `Latest ${formatAnalyticsDateTime(latestSession.startedAt)}` : 'No completed sessions yet'}</div></div>
      <div class="analytics-metric-card"><div class="analytics-metric-label">Average session length</div><div class="analytics-metric-value">${escapeHtml(formatUsageDuration(sessionHistory.length ? sessionHistory.reduce((sum, entry) => sum + (entry.durationMs || 0), 0) / sessionHistory.length : 0))}</div><div class="analytics-metric-note">Across saved study sessions</div></div>`;
  if (overallChartEl) overallChartEl.innerHTML = usageSeries.length ? buildLineChartSvg(usageSeries, { title: 'Cumulative active study time' }) : `<div class="analytics-empty">Start studying and this cumulative time chart will wake up.</div>`;
  if (sessionEl) sessionEl.textContent = latestSession ? `Latest session: ${formatAnalyticsDateTime(latestSession.startedAt)} → ${formatAnalyticsDateTime(latestSession.endedAt)} · ${formatUsageDuration(latestSession.durationMs)} · ${latestSession.interactionCount || 0} study actions` : 'No study session history yet.';
  const studyActivityStatus = document.getElementById('analyticsStudyActivitySummaryStatus');
  if (studyActivityStatus) {
    const totalActive = formatUsageDuration(usage.activeStudyMs);
    studyActivityStatus.textContent = `${totalActive} active · ${sessionHistory.length} session${sessionHistory.length === 1 ? '' : 's'}`;
  }

  // ── Achievements (sub-collapsibles for daily / milestones / chapters) ──
  const achieveEl = document.getElementById('analyticsAchievements');
  if (achieveEl) {
    const badgeGrid = (group, extraClass = '') => `
      <div class="achieve-grid ${extraClass}">${group.map(a => `
        <div class="achieve-badge ${a.earned ? 'earned' : 'locked'}" title="${escapeHtml(a.desc)}">
          <div class="achieve-icon">${a.icon}</div>
          <div class="achieve-name">${escapeHtml(a.name)}</div>
        </div>
      `).join('')}</div>
    `;
    const subSection = (key, label, group, gridClass = '') => {
      if (!group.length) return '';
      const earnedCount = group.filter(a => a.earned).length;
      return `
        <details class="analytics-collapse analytics-sub-collapse" data-collapse-key="${escapeHtml(key)}">
          <summary class="analytics-collapse-summary">
            <span class="analytics-collapse-caret" aria-hidden="true">▾</span>
            <div class="analytics-collapse-title-wrap">
              <h4>${escapeHtml(label)} <span class="achieve-counter">${earnedCount} / ${group.length}</span></h4>
            </div>
          </summary>
          <div class="analytics-collapse-body">${badgeGrid(group, gridClass)}</div>
        </details>
      `;
    };
    achieveEl.innerHTML = `
      <div class="analytics-chart-card achieve-card">
        ${subSection('achievementsDaily', 'Daily', dailyAwards)}
        ${subSection('achievementsMilestones', 'Milestones', milestones)}
        ${subSection('achievementsChapters', 'Chapters', chapterAwards, 'achieve-grid-chapters')}
      </div>
    `;
  }

  // ── Top-level Achievements + Titles summary status text ──
  const totalEarned = achievements.filter(a => a.earned).length;
  const achievementsStatusEl = document.getElementById('analyticsAchievementsSummaryStatus');
  if (achievementsStatusEl) {
    achievementsStatusEl.textContent = `${totalEarned} / ${achievements.length} badges earned`;
  }
  const titlesStatusEl = document.getElementById('analyticsTitlesSummaryStatus');
  if (titlesStatusEl) {
    titlesStatusEl.textContent = `Lv. ${xpData.currentLevel.level} — ${xpData.currentLevel.title} · ${xpData.totalXp.toLocaleString()} XP`;
  }

  // ── Apply persisted collapse state to every <details> and wire handlers ──
  applyAnalyticsCollapsedState(overlay);
  setupAnalyticsCollapseHandlers(overlay);
  setupAnalyticsListRowInteractivity(overlay);
}

// Single delegated handler for the tappable rows inside the stubborn /
// improved / slipping lists. Toggles the per-list expanded word ID, then
// rerenders the overlay while preserving overlay + inner-list scroll
// positions so the user doesn't lose their place when opening a stat card.
function setupAnalyticsListRowInteractivity(rootEl) {
  if (!rootEl || rootEl.dataset.listRowBound === '1') return;
  rootEl.dataset.listRowBound = '1';

  const toggle = (row) => {
    const wordId = row.dataset.listWordId || '';
    const listKey = row.dataset.listKey || '';
    if (!wordId || !listKey) return;

    const list = row.closest('.analytics-word-list');
    const prevListScroll = list ? list.scrollTop : 0;
    const prevRowTop = list ? row.offsetTop : 0;
    const overlayScroll = rootEl.scrollTop;

    if (!runtime.analyticsExpandedListWords || typeof runtime.analyticsExpandedListWords !== 'object') {
      runtime.analyticsExpandedListWords = {};
    }
    const current = runtime.analyticsExpandedListWords[listKey] || '';
    runtime.analyticsExpandedListWords[listKey] = current === wordId ? '' : wordId;

    renderAnalyticsOverlay();

    rootEl.scrollTop = overlayScroll;
    // Find the freshly-rendered list with the same listKey and align scroll.
    const newRow = rootEl.querySelector(`.analytics-word-list-row-tappable[data-list-key="${CSS.escape(listKey)}"][data-list-word-id="${CSS.escape(wordId)}"]`);
    const newList = newRow ? newRow.closest('.analytics-word-list') : null;
    if (newList) {
      newList.scrollTop = newRow
        ? prevListScroll + (newRow.offsetTop - prevRowTop)
        : prevListScroll;
    }
  };

  rootEl.addEventListener('click', (event) => {
    const row = event.target.closest('.analytics-word-list-row-tappable');
    if (row && rootEl.contains(row)) toggle(row);
  });
  rootEl.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const row = event.target.closest('.analytics-word-list-row-tappable');
    if (!row || !rootEl.contains(row)) return;
    event.preventDefault();
    toggle(row);
  });
}

// ── Vocab view toggle bar (direction + scope) ──────────────────────────
// Renders into #analyticsVocabViewBar and binds click handlers once. Toggle
// changes write runtime state, persist, and re-render the analytics overlay.
function renderVocabViewToggles() {
  const bar = document.getElementById('analyticsVocabViewBar');
  if (!bar) return;
  const dir = getAnalyticsVocabDirection();
  const requiredOnly = isAnalyticsVocabRequiredOnly();
  const dirBtn = (value, label) => {
    const active = dir === value;
    return `<button type="button" class="ctrl-btn chapter-detail-sort-btn${active ? ' active-toggle' : ''}" data-analytics-vocab-direction="${value}" aria-pressed="${active ? 'true' : 'false'}">${escapeHtml(label)}</button>`;
  };
  const scopeBtn = (value, label) => {
    const active = (requiredOnly && value === 'required') || (!requiredOnly && value === 'all');
    return `<button type="button" class="ctrl-btn chapter-detail-sort-btn${active ? ' active-toggle' : ''}" data-analytics-vocab-scope="${value}" aria-pressed="${active ? 'true' : 'false'}">${escapeHtml(label)}</button>`;
  };
  bar.innerHTML = `
    <div class="analytics-view-toggle">
      <span class="analytics-view-toggle-label">Direction</span>
      <div class="analytics-view-toggle-group" role="group" aria-label="Vocabulary direction">
        ${dirBtn('g2e', 'Greek → English')}
        ${dirBtn('e2g', 'English → Greek')}
      </div>
    </div>
    <div class="analytics-view-toggle">
      <span class="analytics-view-toggle-label">Scope</span>
      <div class="analytics-view-toggle-group" role="group" aria-label="Vocabulary scope">
        ${scopeBtn('required', 'Required only')}
        ${scopeBtn('all', 'All vocab')}
      </div>
    </div>
  `;
  if (bar.dataset.vocabViewBound === '1') return;
  bar.dataset.vocabViewBound = '1';
  bar.addEventListener('click', (event) => {
    const dirTarget = event.target.closest('[data-analytics-vocab-direction]');
    if (dirTarget && bar.contains(dirTarget)) {
      const next = dirTarget.dataset.analyticsVocabDirection === 'e2g' ? 'e2g' : 'g2e';
      if (runtime.analyticsVocabDirection === next) return;
      runtime.analyticsVocabDirection = next;
      // A different store may not have the currently-expanded word at all;
      // clear it so we don't paint a phantom row on the next render.
      runtime.analyticsExpandedWord = null;
      host.saveState();
      renderAnalyticsOverlay();
      return;
    }
    const scopeTarget = event.target.closest('[data-analytics-vocab-scope]');
    if (scopeTarget && bar.contains(scopeTarget)) {
      const next = scopeTarget.dataset.analyticsVocabScope === 'all' ? 'all' : 'required';
      if (runtime.analyticsVocabScope === next) return;
      runtime.analyticsVocabScope = next;
      // Switching scope can shrink a chapter to zero cards; an expanded row
      // referencing a non-required card would render as a phantom otherwise.
      runtime.analyticsExpandedWord = null;
      host.saveState();
      renderAnalyticsOverlay();
    }
  });
}

// ── Collapse-state plumbing ────────────────────────────────────────────
// Mirrors runtime.analyticsCollapsed onto the open/closed attribute of every
// <details data-collapse-key="..."> inside the analytics overlay. Native
// <details> toggles bubble a `toggle` event which we listen for once via
// delegation; each toggle persists state through host.saveState.
function applyAnalyticsCollapsedState(rootEl) {
  if (!rootEl) return;
  const collapsed = runtime.analyticsCollapsed || {};
  rootEl.querySelectorAll('details[data-collapse-key]').forEach(node => {
    const key = node.dataset.collapseKey;
    // Default to open when the runtime flag is missing — new keys added later
    // shouldn't hide content just because old saves don't list them.
    const shouldBeOpen = collapsed[key] !== true;
    if (node.open !== shouldBeOpen) node.open = shouldBeOpen;
  });
}

function setupAnalyticsCollapseHandlers(rootEl) {
  if (!rootEl || rootEl.dataset.collapseHandlersBound === '1') return;
  rootEl.dataset.collapseHandlersBound = '1';
  // <details> bubbles `toggle` only if we listen in the capture phase, since
  // the event does not bubble by default in some browsers.
  rootEl.addEventListener('toggle', (event) => {
    const node = event.target;
    if (!(node instanceof HTMLDetailsElement)) return;
    const key = node.dataset.collapseKey;
    if (!key) return;
    if (!runtime.analyticsCollapsed || typeof runtime.analyticsCollapsed !== 'object') {
      runtime.analyticsCollapsed = {};
    }
    runtime.analyticsCollapsed[key] = !node.open;
    host.saveState();
  }, true);
}
