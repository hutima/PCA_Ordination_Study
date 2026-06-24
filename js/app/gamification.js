// Gamification: XP → level, study streaks (current + longest), and earned
// badges. Pure read helpers over the shared store — they write nothing. Adapted
// from the Duff study tool's gamification, tailored to this smaller deck and to
// a PCA ordination/licensure register (level titles trace the path from inquiry
// to ordained office).

import { DATA, state, dayKey } from './store.js';
import { getConfidencePct } from '../domain/srs/confidence.js';

// XP thresholds. Sized for ~1,100 cards: with ~10 XP for a card's first
// confirmation plus a few 5-XP follow-ups, mastering the whole deck lands a
// diligent student near the top of the ladder without making early levels feel
// out of reach.
export const XP_LEVELS = [
  { level: 1,  threshold: 0,     title: 'Inquirer',           flav: 'Asking the first questions' },
  { level: 2,  threshold: 60,    title: 'Catechumen',         flav: 'Learning the catechism' },
  { level: 3,  threshold: 180,   title: 'Communicant',        flav: 'Owning the covenant' },
  { level: 4,  threshold: 400,   title: 'Berean',             flav: 'Searches the Scriptures daily' },
  { level: 5,  threshold: 750,   title: 'Student of Divinity',flav: 'Formally under instruction' },
  { level: 6,  threshold: 1250,  title: 'Exhorter',           flav: 'Beginning to speak' },
  { level: 7,  threshold: 2000,  title: 'Licentiate',         flav: 'Licensed to preach' },
  { level: 8,  threshold: 3000,  title: 'Candidate',          flav: 'Under care, exams in sight' },
  { level: 9,  threshold: 4400,  title: 'Ordinand',           flav: 'Ready for the laying on of hands' },
  { level: 10, threshold: 6200,  title: 'Ruling Elder',       flav: 'Entrusted with oversight' },
  { level: 11, threshold: 8500,  title: 'Teaching Elder',     flav: 'Called to Word and Sacrament' },
  { level: 12, threshold: 11500, title: 'Pastor',             flav: 'Shepherd of the flock' },
  { level: 13, threshold: 15000, title: 'Theologian',         flav: 'Deep in the doctrines of grace' },
  { level: 14, threshold: 20000, title: 'Doctor of the Church',flav: 'A teacher of teachers' },
];

export function computeXpAndLevel(totalXp) {
  const xp = Math.max(0, Number(totalXp) || 0);
  let current = XP_LEVELS[0];
  let next = XP_LEVELS[1] || null;
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].threshold) {
      current = XP_LEVELS[i];
      next = XP_LEVELS[i + 1] || null;
      break;
    }
  }
  const levelProgress = next
    ? (xp - current.threshold) / (next.threshold - current.threshold)
    : 1;
  return { totalXp: xp, currentLevel: current, nextLevel: next, levelProgress: Math.min(1, Math.max(0, levelProgress)) };
}

// Current streak (consecutive days ending today/yesterday) and the longest
// run ever, from the daily-activity log.
export function computeStreaks(activity) {
  const map = activity || {};
  let current = 0;
  const d = new Date();
  if (!map[dayKey(d.getTime())]) d.setDate(d.getDate() - 1); // today may still be 0
  while (map[dayKey(d.getTime())] > 0) { current++; d.setDate(d.getDate() - 1); }

  const keys = Object.keys(map).filter(k => map[k] > 0).sort();
  let longest = 0, run = 0, prev = null;
  for (const key of keys) {
    const day = new Date(key + 'T00:00:00');
    if (prev) {
      const diff = Math.round((day - prev) / 86400000);
      run = diff === 1 ? run + 1 : 1;
    } else run = 1;
    if (run > longest) longest = run;
    prev = day;
  }
  return { current, longest: Math.max(longest, current) };
}

// A card is "confirmed" once it has been recalled with rolling confidence ≥ 70%.
// firstConfirmedAt is the stamp set going forward; for progress that predates it
// we fall back to the live confidence so legacy data still counts.
export function isConfirmed(p) {
  if (!p) return false;
  if (p.firstConfirmedAt) return true;
  if (!p.reps) return false;
  const pct = getConfidencePct(p);
  return pct !== null && pct >= 70;
}

// Total confirmed cards + per-subject confirmed/total tallies (one pass).
export function confirmationTotals() {
  let confirmed = 0, total = 0;
  const bySubject = [];
  for (const subj of DATA.subjects.slice().sort((a, b) => (a.order || 0) - (b.order || 0))) {
    let sc = 0, stot = 0;
    for (const k of subj.setKeys) {
      const set = DATA.sets[k];
      if (!set) continue;
      for (const c of set.cards) {
        stot++; total++;
        if (isConfirmed(state.progress[c.id])) { sc++; confirmed++; }
      }
    }
    bySubject.push({ id: subj.id, label: subj.label, confirmed: sc, total: stot });
  }
  return { confirmed, total, bySubject };
}

// Earned + locked badges, grouped (daily / milestone / streak / subject). Each
// is { id, icon, name, desc, earned, group }.
export function computeBadges({ streaks, todayCount }) {
  const { confirmed, bySubject } = confirmationTotals();
  const badges = [];
  const add = (id, icon, name, desc, earned, group) =>
    badges.push({ id, icon, name, desc, earned: !!earned, group: group || 'milestone' });

  add('daily_first', '★', 'First Card Today', 'Review a card today', todayCount > 0, 'daily');

  add('first_card',  '✦', 'First Light',     'Confirm your first card',  confirmed >= 1);
  add('ten',         '✧', 'Kindled',         'Confirm 10 cards',         confirmed >= 10);
  add('fifty',       '♦', 'Diligent',        'Confirm 50 cards',         confirmed >= 50);
  add('hundred',     '✶', 'Centurion',       'Confirm 100 cards',        confirmed >= 100);
  add('twofifty',    '❁', 'Well Studied',    'Confirm 250 cards',        confirmed >= 250);
  add('fivehundred', '❃', 'Half a Thousand', 'Confirm 500 cards',        confirmed >= 500);

  add('streak_3',  '♨', 'Three-fold Cord', '3-day study streak',  streaks.current >= 3 || streaks.longest >= 3,   'streak');
  add('streak_7',  '☄', 'Weekly Flame',    '7-day study streak',  streaks.current >= 7 || streaks.longest >= 7,   'streak');
  add('streak_14', '⚝', 'Fortnight',       '14-day study streak', streaks.current >= 14 || streaks.longest >= 14, 'streak');
  add('streak_30', '☀', 'Monthly Devotion','30-day study streak', streaks.current >= 30 || streaks.longest >= 30, 'streak');

  // One per subject: confirm every card in it.
  for (const s of bySubject) {
    add(`subj_${s.id}`, '✠', s.label, `Confirm all ${s.total} cards in ${s.label}`,
      s.total > 0 && s.confirmed >= s.total, 'subject');
  }

  return badges;
}
