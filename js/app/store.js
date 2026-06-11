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

export const state = {
  mode: 'review',          // see modes.js registry for valid ids
  focus: 'due',            // 'due' (default) | 'weak' (low-confidence) | 'order' (unspaced book order) | 'flip' (non-spaced flip deck)
  shuffleOn: true,         // shuffle deck order (persisted)
  flipArchived: new Set(), // card ids retired ("Easy") this flip-deck session
  selected: new Set(),     // selected set keys
  deck: [],                // ordered array of card objects for this session
  pos: 0,
  revealed: false,
  expanded: false,         // review card: is the full answer/quotations open
  quiz: null,              // current card's MCQ: { choices, correctIndex, picked }
  exam: null,              // mock-exam session: { cards, quizzes, pos, done }
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
  try { state.shuffleOn = localStorage.getItem(SHUFFLE_KEY) !== 'off'; } catch (e) {}
}
export function saveShuffle() {
  try { localStorage.setItem(SHUFFLE_KEY, state.shuffleOn ? 'on' : 'off'); } catch (e) {}
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
