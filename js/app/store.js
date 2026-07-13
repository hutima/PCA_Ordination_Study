// Shared application state + persistence.
//
// `state` is a module singleton imported by every other app module, so they
// all read and mutate the same object. Persistence is split by concern:
// progress (per-card SRS), selection (chosen sub-decks), and a daily-activity
// log that drives the streak + heatmap.

export const DATA = (typeof window !== 'undefined' && window.PCA_DATA) || { subjects: [], sets: {} };

export const PROGRESS_KEY = 'pca_progress_v1';
export const SELECTION_KEY = 'pca_selection_v1';
export const ACTIVITY_KEY = 'pca_activity_v1';
export const SHUFFLE_KEY = 'pca_shuffle_v1';
export const SHUFFLE_MIGRATED_KEY = 'pca_shuffle_migrated_v1';
export const SELECTOR_GROUP_KEY = 'pca_selector_group_v1';
export const SPACED_KEY = 'pca_spaced_v1';
export const UNSPACED_RESET_KEY = 'pca_unspaced_reset_v1';
export const UNSPACED_KEY = 'pca_unspaced_v1';
export const XP_KEY = 'pca_xp_v1';
export const WCF_DETAIL_KEY = 'pca_wcf_detail_v1';
export const SOUND_KEY = 'pca_sound_v1';
export const CELEBRATE_KEY = 'pca_celebrate_v1';

// The official 12-week study plan (Chapell/Meek "Schedule of Assignments").
export const WEEKS = (typeof window !== 'undefined' && window.PCA_WEEKS) || [];

export const state = {
  mode: 'review',          // see modes.js registry for valid ids
  focus: 'due',            // 'due' (default) | 'weak' (low-confidence) | 'order' (unspaced book order) | 'flip' (non-spaced flip deck)
  selectorGroupBy: 'week', // selector modal grouping: 'subject' | 'week' (defaults to week)
  shuffleOn: true,         // shuffle deck order (persisted)
  spacedOn: true,          // spaced-repetition master switch (persisted); off = unspaced
  wcfDetail: 'full',       // WCF card detail: 'full' (default) shows the full confession text, 'summary' a concise paraphrase (persisted)
  soundOn: false,          // sound effects (persisted, default off)
  celebrationsOn: true,    // result celebrations (persisted, default on)
  unspacedDailyReset: true,// re-present the unspaced deck each new day (persisted)
  unspacedDone: new Set(), // card ids retired in the current unspaced run (persisted, day-stamped)
  flipArchived: new Set(), // card ids retired ("Easy") this flip-deck session
  selected: new Set(),     // selected set keys
  deck: [],                // ordered array of card objects for this session
  spacedActiveIds: [],     // in-flight "active" pile ids (spaced session continuity)
  lastStudyAt: 0,          // ms of the last grade — drives the idle-gap fresh start
  lastSeenId: null,        // last graded card id — avoid showing it first next cycle
  xp: 0,                   // accumulated experience points (persisted)
  pos: 0,
  revealed: false,
  expanded: false,         // review card: is the full answer/quotations open
  quiz: null,              // current card's MCQ: { choices, correctIndex, picked }
  quizFlipOutcome: null,   // quiz + flip deck: pending 'retire'|'recycle', applied on the next move
  exam: null,              // mock-exam session: { section, items, pos, done, available }
  dueCount: 0,
  progress: {},            // cardId -> SRS progress object
  activity: {},            // 'YYYY-MM-DD' -> number of reviews that day
};

// ── Persistence ────────────────────────────────────────────────────────
export function loadProgress() {
  try { state.progress = JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
  catch (e) { state.progress = {}; }
}
export function saveProgress() {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress)); } catch (e) {}
}
export function loadSelection() {
  let keys = [];
  try { keys = JSON.parse(localStorage.getItem(SELECTION_KEY)) || []; } catch (e) {}
  state.selected = new Set(keys.filter(k => DATA.sets[k]));
}
export function saveSelection() {
  try { localStorage.setItem(SELECTION_KEY, JSON.stringify([...state.selected])); } catch (e) {}
}
export function loadShuffle() {
  try {
    // One-time migration (shipped with the three-deck spaced ordering): on the
    // first load after this release, force shuffle ON for everyone so the new
    // due-now/unseen shuffling takes effect — even for users who had turned it
    // off under the old model. After that, the saved value is respected, so a
    // manual toggle-off sticks.
    if (localStorage.getItem(SHUFFLE_MIGRATED_KEY) !== '1') {
      state.shuffleOn = true;
      localStorage.setItem(SHUFFLE_KEY, 'on');
      localStorage.setItem(SHUFFLE_MIGRATED_KEY, '1');
      return;
    }
    state.shuffleOn = localStorage.getItem(SHUFFLE_KEY) !== 'off';
  } catch (e) {}
}
export function saveShuffle() {
  try { localStorage.setItem(SHUFFLE_KEY, state.shuffleOn ? 'on' : 'off'); } catch (e) {}
}
export function loadXp() {
  try { state.xp = Math.max(0, Number(localStorage.getItem(XP_KEY)) || 0); } catch (e) { state.xp = 0; }
}
export function saveXp() {
  try { localStorage.setItem(XP_KEY, String(state.xp)); } catch (e) {}
}
export function addXp(n) {
  const amt = Number(n) || 0;
  if (amt <= 0) return;
  state.xp = (state.xp || 0) + amt;
  saveXp();
}
export function loadSpaced() {
  // Default ON; only an explicit saved 'off' disables spaced repetition.
  try { state.spacedOn = localStorage.getItem(SPACED_KEY) !== 'off'; } catch (e) {}
}
export function saveSpaced() {
  try { localStorage.setItem(SPACED_KEY, state.spacedOn ? 'on' : 'off'); } catch (e) {}
}
// WCF card detail. Default 'full' (the user wants WCF questions to contain the
// full confession section); only an explicit saved 'summary' switches to the
// concise view.
export function loadWcfDetail() {
  try { state.wcfDetail = localStorage.getItem(WCF_DETAIL_KEY) === 'summary' ? 'summary' : 'full'; }
  catch (e) { state.wcfDetail = 'full'; }
}
export function saveWcfDetail() {
  try { localStorage.setItem(WCF_DETAIL_KEY, state.wcfDetail === 'summary' ? 'summary' : 'full'); } catch (e) {}
}
export function loadSound() {
  // Default OFF; only an explicit saved 'on' enables sound effects.
  try { state.soundOn = localStorage.getItem(SOUND_KEY) === 'on'; } catch (e) {}
}
export function saveSound() {
  try { localStorage.setItem(SOUND_KEY, state.soundOn ? 'on' : 'off'); } catch (e) {}
}
export function loadCelebrations() {
  // Default ON; only an explicit saved 'off' disables result celebrations.
  try { state.celebrationsOn = localStorage.getItem(CELEBRATE_KEY) !== 'off'; } catch (e) {}
}
export function saveCelebrations() {
  try { localStorage.setItem(CELEBRATE_KEY, state.celebrationsOn ? 'on' : 'off'); } catch (e) {}
}
export function loadUnspacedReset() {
  // Default ON; only an explicit saved 'off' keeps retired cards across days.
  try { state.unspacedDailyReset = localStorage.getItem(UNSPACED_RESET_KEY) !== 'off'; } catch (e) {}
}
export function saveUnspacedReset() {
  try { localStorage.setItem(UNSPACED_RESET_KEY, state.unspacedDailyReset ? 'on' : 'off'); } catch (e) {}
}
// Unspaced retirements are stamped with the day they were earned. With the
// daily-reset toggle on, a stamp older than today is cleared so the whole
// selection re-presents each new day; off, retirements persist until reset.
export function loadUnspaced() {
  let stored = { day: '', done: [] };
  try { stored = JSON.parse(localStorage.getItem(UNSPACED_KEY)) || stored; } catch (e) {}
  const today = dayKey(Date.now());
  if (state.unspacedDailyReset && stored.day !== today) state.unspacedDone = new Set();
  else state.unspacedDone = new Set(Array.isArray(stored.done) ? stored.done : []);
}
export function saveUnspaced() {
  try {
    localStorage.setItem(UNSPACED_KEY, JSON.stringify({ day: dayKey(Date.now()), done: [...state.unspacedDone] }));
  } catch (e) {}
}
export function loadSelectorGroup() {
  // Default to the by-week view; only an explicit saved 'subject' overrides it.
  try { state.selectorGroupBy = localStorage.getItem(SELECTOR_GROUP_KEY) === 'subject' ? 'subject' : 'week'; }
  catch (e) { state.selectorGroupBy = 'week'; }
}
export function saveSelectorGroup() {
  try { localStorage.setItem(SELECTOR_GROUP_KEY, state.selectorGroupBy); } catch (e) {}
}
export function loadActivity() {
  try { state.activity = JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || {}; }
  catch (e) { state.activity = {}; }
}
export function saveActivity() {
  try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(state.activity)); } catch (e) {}
}

// ── Daily-activity log (streak + heatmap) ──────────────────────────────
export function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function recordActivity() {
  const k = dayKey(Date.now());
  state.activity[k] = (state.activity[k] || 0) + 1;
  saveActivity();
}
// Consecutive days with at least one review, counting back from today. A day
// with no reviews yet today does not break a streak earned through yesterday.
export function currentStreak() {
  let streak = 0;
  const d = new Date();
  for (let i = 0; ; i++) {
    if (state.activity[dayKey(d.getTime())]) { streak++; d.setDate(d.getDate() - 1); }
    else if (i === 0) { d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

export function getProgress(cardId) {
  let p = state.progress[cardId];
  if (!p) {
    p = { confidenceHistory: [], intervalDays: 0, dueAt: 0, ease: 2.3, passCount: 0, failCount: 0, reps: 0, lastReviewedAt: 0 };
    state.progress[cardId] = p;
  }
  return p;
}
