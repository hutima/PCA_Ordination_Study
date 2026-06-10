// Deck ordering and set key helpers
import { CHAPTER_TO_WEEK } from '../../data/setMeta.js';

function getSets() {
  return window.SETS && typeof window.SETS === 'object' ? window.SETS : {};
}

export function isChapterKey(key) {
  return /^\d+$/.test(String(key));
}

export function isAdvancedKey(key) {
  return /^ADV\d+$/i.test(String(key || ''));
}

export function sortSetKeys(keys) {
  function score(key) {
    const raw = String(key);
    if (/^\d+$/.test(raw)) return Number(raw);
    const m = raw.match(/^W(\d+)O$/);
    if (m) return 100 + Number(m[1]);
    const supplemental = raw.match(/^W(\d+)_/);
    if (supplemental) return 200 + Number(supplemental[1]);
    const adv = raw.match(/^ADV(\d+)$/i);
    if (adv) return 1000 + Number(adv[1]);
    return 999;
  }
  return [...keys].sort((a, b) => {
    const diff = score(a) - score(b);
    return diff || String(a).localeCompare(String(b));
  });
}

export function displaySetShortLabel(key) {
  const raw = String(key);
  if (/^\d+$/.test(raw)) return `Ch. ${raw}`;
  const sets = getSets();
  return sets[raw]?.label || raw;
}

export function sourceHint(key) {
  const raw = String(key);
  if (/^\d+$/.test(raw)) return `Ch. ${raw}`;
  const sets = getSets();
  return sets[raw]?.label || raw;
}

export function getWeekForKey(key) {
  const raw = String(key);
  if (isChapterKey(raw)) return CHAPTER_TO_WEEK[Number(raw)] || null;
  const sets = getSets();
  return sets[raw]?.week || null;
}

export function getChapterForKey(key) {
  const raw = String(key);
  return isChapterKey(raw) ? Number(raw) : null;
}

export function getOtherKeysForWeeks(weeks) {
  const weekSet = new Set((weeks || []).map(Number).filter(Boolean));
  const sets = getSets();
  return Object.keys(sets).filter(key => {
    const set = sets[key];
    return set && (set.type === 'other' || set.type === 'supplemental' || set.supplemental) && weekSet.has(Number(set.week));
  });
}

function isOddSupplementalKey(key) {
  return /^W\d+O$/.test(String(key));
}

export function expandSessionSets(session) {
  const rawSets = (session?.sets || []).map(String);
  const chapters = rawSets.filter(isChapterKey);
  // Special sessions (Mid-Term, Final Exam Prep) also pull in the per-week
  // odd supplemental vocab listed in the session, but never the paradigm
  // breakdown sets — those are opt-in via the supplemental selector.
  const oddSupplementals = session?.special
    ? rawSets.filter(isOddSupplementalKey)
    : [];
  return sortSetKeys([...new Set([...chapters, ...oddSupplementals])]);
}
