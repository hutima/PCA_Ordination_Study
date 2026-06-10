// Pure XP / level / streaks / achievements math.
//
// These functions never touch the DOM and never mutate module-level state in
// main.js. Stores that span directions (globalWordProgress, globalWordMarks)
// are passed in by the caller because they live in the host's runtime state.

import { XP_LEVELS, REVIEW_XP_SCHEDULE } from './levels.js';
import { getUsageDayKey } from '../../utils/time.js';
import { getAllChapterKeys, getChapterVocabCards } from '../deck/filters.js';

export function migrateLegacyXp(usage, globalWordProgress) {
  let legacyCardXp = 0;
  ['g2e', 'e2g', 'morph'].forEach(bucket => {
    const store = globalWordProgress?.[bucket];
    if (!store || typeof store !== 'object') return;
    const keys = Object.keys(store);
    for (let k = 0; k < keys.length; k++) {
      const entry = store[keys[k]];
      if (!entry || typeof entry !== 'object') continue;
      const seen = Math.max(0, entry.seenCount || 0);
      for (let i = 0; i < seen; i++) {
        legacyCardXp += i < REVIEW_XP_SCHEDULE.length ? REVIEW_XP_SCHEDULE[i] : 1;
      }
    }
  });
  usage.cardXpEarned = legacyCardXp;
}

export function computeTotalXp(usage, globalWordProgress) {
  if (usage.cardXpEarned < 0) migrateLegacyXp(usage, globalWordProgress);
  const cardXp = Math.max(0, usage.cardXpEarned || 0);
  const timeXp = Math.floor((usage.activeStudyMs || 0) / (60 * 1000)) * 2;
  return cardXp + timeXp;
}

export function computeStudyStreaks(activeDailyMs) {
  const map = activeDailyMs || {};
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let current = 0;
  let cursor = new Date(today);
  // Allow today to have 0 — streak is still alive if yesterday had activity
  if (!map[getUsageDayKey(cursor.getTime())]) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (map[getUsageDayKey(cursor.getTime())] > 0) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  // Longest streak
  const keys = Object.keys(map).filter(k => map[k] > 0).sort();
  let longest = 0; let run = 0; let prev = null;
  for (const key of keys) {
    const d = new Date(key + 'T00:00:00');
    if (prev) {
      const diff = Math.round((d - prev) / (24 * 60 * 60 * 1000));
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = d;
  }
  return { current, longest };
}

export function computeXpAndLevel(usage, globalWordProgress) {
  const totalXp = computeTotalXp(usage, globalWordProgress);
  let currentLevel = XP_LEVELS[0];
  let nextLevel = XP_LEVELS[1] || null;
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_LEVELS[i].threshold) {
      currentLevel = XP_LEVELS[i];
      nextLevel = XP_LEVELS[i + 1] || null;
      break;
    }
  }
  const levelProgress = nextLevel
    ? (totalXp - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)
    : 1;
  return { totalXp, currentLevel, nextLevel, levelProgress: Math.min(1, Math.max(0, levelProgress)) };
}

export function computeTodayStats(activeDailyMs, cards, marksStore, progressStore) {
  const todayKey = getUsageDayKey();
  const todayMs = (activeDailyMs || {})[todayKey] || 0;
  let reviewedToday = 0;
  let newToday = 0;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayTs = todayStart.getTime();

  const sourceEntries = progressStore && typeof progressStore === 'object'
    ? Object.entries(progressStore)
    : [];

  if (sourceEntries.length) {
    sourceEntries.forEach(([cardId, p]) => {
      if (!p) return;
      if (p.lastReviewedAt && p.lastReviewedAt >= todayTs) {
        reviewedToday++;
      }
      if (p.firstConfirmedAt && p.firstConfirmedAt >= todayTs) {
        newToday++;
      }
    });
  } else {
    (cards || []).forEach(card => {
      const p = progressStore?.[card.id];
      if (!p) return;
      if (p.lastReviewedAt && p.lastReviewedAt >= todayTs) reviewedToday++;
      if (p.firstConfirmedAt && p.firstConfirmedAt >= todayTs) newToday++;
    });
  }

  const firstCardTodayEarned = reviewedToday > 0 || newToday > 0;
  return { todayMs, reviewedToday, newToday, firstCardTodayEarned };
}

export function computeAchievements(usage, courseData, streaks, sessionCount, todayStats, globalWordMarks) {
  const earned = [];
  const check = (id, icon, name, desc, condition, group) => {
    earned.push({ id, icon, name, desc, earned: !!condition, group: group || 'milestone' });
  };

  const totalConfirmed = courseData.allVocabConfirmed + courseData.allGrammarConfirmed;
  const reviewedToday = Number(todayStats?.reviewedToday) || 0;
  const newToday = Number(todayStats?.newToday) || 0;
  const firstCardTodayEarned = !!todayStats?.firstCardTodayEarned;

  // ── Daily ──
  check('daily_first_card', '★', 'First Card Today', 'Review your first card today', firstCardTodayEarned || reviewedToday > 0 || newToday > 0, 'daily');

  // ── Card milestones ──
  check('first_card',    '✦', 'First Light',     'Confirm your first card',            totalConfirmed >= 1);
  check('ten_cards',     '★', 'Kindled',         'Confirm 10 cards',                   totalConfirmed >= 10);
  check('fifty_cards',   '♢', 'Diligent',        'Confirm 50 cards',                   totalConfirmed >= 50);
  check('hundred_cards', '✶', 'Centurion',       'Confirm 100 cards',                  totalConfirmed >= 100);
  check('twofifty',      '❁', 'Quarter-master',  'Confirm 250 cards',                  totalConfirmed >= 250);
  check('five_hundred',  '❃', 'Half a Thousand', 'Confirm 500 cards',                  totalConfirmed >= 500);

  // ── Streaks ──
  check('streak_3',      '♨', 'Three-fold Cord', '3-day study streak',                 streaks.current >= 3 || streaks.longest >= 3);
  check('streak_7',      '☄', 'Weekly Flame',    '7-day study streak',                 streaks.current >= 7 || streaks.longest >= 7);
  check('streak_14',     '⚝', 'Fortnight',       '14-day study streak',                streaks.current >= 14 || streaks.longest >= 14);
  check('streak_30',     '☀', 'Monthly Devotion','30-day study streak',                streaks.current >= 30 || streaks.longest >= 30);

  // ── Time & sessions ──
  check('hour_one',      '⌛', 'First Hour',      'Reach 1 hour of active study',       (usage.activeStudyMs || 0) >= 60 * 60 * 1000);
  check('hour_five',     '⏳', 'Five Hours',      'Reach 5 hours of active study',      (usage.activeStudyMs || 0) >= 5 * 60 * 60 * 1000);
  check('hour_ten',      '⌖', 'Ten Hours',       'Reach 10 hours of active study',     (usage.activeStudyMs || 0) >= 10 * 60 * 60 * 1000);
  check('sessions_10',   '⚒', 'Seasoned',        'Log 10 study sessions',              sessionCount >= 10);
  check('sessions_50',   '⚔', 'Veteran',         'Log 50 study sessions',              sessionCount >= 50);

  // ── Completion awards (course-wide, persist across selection) ──
  check('req_vocab',     '♕', 'Required Lexicon','Confirm all required vocabulary',     courseData.reqVocabConfirmed >= courseData.reqVocabTotal && courseData.reqVocabTotal > 0);
  check('all_vocab',     '♛', 'Full Lexicon',    'Confirm every vocabulary card',       courseData.allVocabConfirmed >= courseData.allVocabTotal && courseData.allVocabTotal > 0);
  check('all_grammar',   '♔', 'Grammar Master',  'Confirm all grammar cards',           courseData.allGrammarConfirmed >= courseData.allGrammarTotal && courseData.allGrammarTotal > 0);

  // ── Per-chapter awards (vocab, persist regardless of selection) ──
  // courseData.allVocabCards already holds every vocab card, so derive each
  // chapter's cards from it instead of rebuilding the card list per chapter
  // (computeAchievements runs on every saveState via the celebration check).
  const allVocabCards = Array.isArray(courseData.allVocabCards) ? courseData.allVocabCards : null;
  const chapterKeys = getAllChapterKeys();
  chapterKeys.forEach(chKey => {
    const chNum = Number(chKey);
    const chCards = allVocabCards
      ? allVocabCards.filter(card => card.sourceKey === String(chKey))
      : getChapterVocabCards(chKey, false);
    if (!chCards.length) return;
    // Check g2e marks (the primary direction)
    const g2eMarks = globalWordMarks?.g2e || {};
    const confirmed = chCards.filter(c => g2eMarks[c.id] === 'known').length;
    check(
      `ch_${chNum}`,
      '✠',
      `Ch. ${chNum}`,
      `Confirm all Ch. ${chNum} vocabulary (${chCards.length} cards)`,
      confirmed >= chCards.length,
      'chapter'
    );
  });

  return earned;
}

// Linear regression on the trailing 28 days of the cumulative-confirmation
// series. Returns null if there's no positive slope or the projection is in
// the past — the call site treats null as "no ETA available".
export function getRegressionProjection(series, currentCount, totalCount) {
  if (!Array.isArray(series) || series.length < 2 || !totalCount || currentCount >= totalCount) return null;
  const recent = series.slice(-28);
  if (recent.length < 2) return null;
  const x0 = recent[0].ts;
  const points = recent.map(point => ({ x: (point.ts - x0) / (24 * 60 * 60 * 1000), y: point.count }));
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + (p.x * p.y), 0);
  const sumXX = points.reduce((sum, p) => sum + (p.x * p.x), 0);
  const denom = (n * sumXX) - (sumX * sumX);
  if (!denom) return null;
  const slope = ((n * sumXY) - (sumX * sumY)) / denom;
  const intercept = (sumY - (slope * sumX)) / n;
  if (!(slope > 0.01)) return null;
  const projectedX = (totalCount - intercept) / slope;
  if (!Number.isFinite(projectedX)) return null;
  const projectedTs = x0 + (projectedX * 24 * 60 * 60 * 1000);
  return projectedTs >= Date.now() ? { cardsPerDay: slope, projectedTs } : null;
}
