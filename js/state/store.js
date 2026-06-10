// Central state store — single source of truth for all mutable app state
import { isPlainObject } from '../utils/helpers.js';

// ── Persistence keys ──
export const STORAGE_KEY = 'greekFlashcardsStateV18';
export const CONSENT_STORAGE_KEY = 'greekFlashcardsConsentV1';
export const WHATS_NEW_V1_5_STORAGE_KEY = 'greekFlashcardsWhatsNewV1_5Seen';
export const THEME_STORAGE_KEY = 'greekFlashcardsThemeMode';
export const FONT_FAMILY_STORAGE_KEY = 'greekFlashcardsFontFamily';
export const TEXT_SIZE_STORAGE_KEY = 'greekFlashcardsTextSize';
export const PROGRESS_EXPORT_FORMAT = 'greek-flashcards-progress-export';
export const PROGRESS_EXPORT_VERSION = 2;
export const STUDY_IDLE_MS = 90 * 1000;
export const STUDY_SESSION_BREAK_MS = 30 * 60 * 1000;
export const MAX_STUDY_SESSION_HISTORY = 500;
// The deck-state bank stores a full card-id ordering per selection combo and
// would otherwise grow without bound (every distinct chapter selection adds an
// entry). It is only a resume convenience, so it is capped to the most
// recently used selections to keep the persisted save small.
export const MAX_DECK_STATE_ENTRIES = 16;
// JSON exports are for transferring stats/history between devices; card-shuffle
// resume position isn't worth its weight (~30 KB per entry) in a backup, so
// trim to a much smaller set than the live localStorage cap.
export const EXPORT_MAX_DECK_STATE_ENTRIES = 4;

// ── Analytics overlay collapse defaults ───────────────────────────────
// Canonical set of collapse keys, with their default-closed (true) or
// default-open (false) value. Renames + compaction in migrations.js
// reference this list so the saved JSON never carries defunct keys, and
// runtime.js seeds its analyticsCollapsed from a clone of these defaults.
export const ANALYTICS_COLLAPSED_DEFAULTS = {
  // Top-level
  totalVocab: false,
  selectedVocab: true,
  totalGrammar: false,
  selectedGrammar: true,
  studyActivity: true,
  achievements: true,
  titles: true,
  // Total Vocabulary sub-sections
  totalVocabChapterMap: true,
  totalVocabProgress: true,
  totalVocabSlippingList: true,
  totalVocabStubborn: true,
  totalVocabImproved: true,
  // Selected Vocabulary sub-sections
  selectedVocabBar: false,
  selectedVocabProgress: true,
  selectedVocabSlippingList: true,
  selectedVocabStubborn: true,
  selectedVocabImproved: true,
  // Total Grammar sub-sections
  totalGrammarChapterMap: true,
  totalGrammarProgress: true,
  totalGrammarStubborn: true,
  totalGrammarImproved: true,
  paradigmStepStats: true,
  // Selected Grammar sub-sections
  selectedGrammarBar: false,
  selectedGrammarProgress: true,
  selectedGrammarStubborn: true,
  selectedGrammarImproved: true,
  // Achievements sub-collapsibles
  achievementsDaily: true,
  achievementsMilestones: true,
  achievementsChapters: true
};

// ── Mutable state ──
// Exported as a single object so modules can read/write by reference.
export const S = {
  appUsageStats: {
    totalMs: 0, dailyMs: {}, activeStudyMs: 0, activeDailyMs: {},
    lastActiveAt: 0, lastStudyInteractionAt: 0, lastStudyCountedAt: 0,
    firstStudyAt: 0, studySessionHistory: [], currentStudySession: null
  },
  appProfile: 'vocab_only',
  appGamification: { lastCelebratedLevel: null, lastCelebratedBadgeDay: null, lastEarnedAchievementIds: [] },
  hasAcceptedDisclaimer: false,
  disclaimerModalRequiresAgreement: false,
  transferModalMode: '',
  themeMode: 'system',
  transferPrimaryAction: null,
  transferSecondaryAction: null,
  usageTickHandle: null,
  usageVisibilityBound: false,
  usageTickCounter: 0,
  studyMode: 'vocab',
  levelToastHideTimer: null,
  levelToastRemoveTimer: null,
  toastQueue: [],
  toastActive: false,
  morphSelfCheck: false,
  morphAnswerState: { answered: false, revealed: false, selfRated: false, selectedIndex: -1, isCorrect: null },
  morphPendingAdvance: false,
  morphStepByStep: false,
  morphFocusedParadigm: null,
  morphStepState: { cardId: null, steps: [], stepIdx: 0, answers: [], completed: false },
  paradigmStepStats: { byLemma: {} },
  aspectStep: true,
  dimToggles: { tense: true, voice: true, mood: true, person: true, number: true, case: true, gender: true },

  // Deck / study state
  deckStates: {},
  globalWordMarks: {},
  globalWordProgress: {},
  currentSession: null,
  selectedKeys: [],
  deck: [],
  originalDeck: [],
  currentIdx: 0,
  isFlipped: false,
  shuffled: true,
  requiredOnly: false,
  directionToGreek: false,
  spacedRepetition: true,
  activeDeckCount: 0,
  unspacedPendingRecycle: false,
  unspacedCycleState: {},
  unspacedRoundSize: 0,
  unspacedRoundMarks: 0,
  spacedUndoSnapshot: null,
  marks: {}
};

// ── Direction / store helpers ──

export function getDirectionKey() {
  return S.directionToGreek ? 'e2g' : 'g2e';
}

export function getStudyStoreKey() {
  return S.studyMode === 'morph' ? 'morph' : getDirectionKey();
}

export function ensureDirectionalStores() {
  if (!S.globalWordMarks || typeof S.globalWordMarks !== 'object' || Array.isArray(S.globalWordMarks)) S.globalWordMarks = {};
  if (!S.globalWordProgress || typeof S.globalWordProgress !== 'object' || Array.isArray(S.globalWordProgress)) S.globalWordProgress = {};

  const migrateLegacyBucket = (bucketObj) => {
    const keys = Object.keys(bucketObj || {});
    if (keys.length && !('g2e' in bucketObj) && !('e2g' in bucketObj) && !('morph' in bucketObj)) {
      return { g2e: { ...bucketObj }, e2g: {}, morph: {} };
    }
    return bucketObj;
  };

  S.globalWordMarks = migrateLegacyBucket(S.globalWordMarks);
  S.globalWordProgress = migrateLegacyBucket(S.globalWordProgress);

  if (!S.globalWordMarks.g2e || typeof S.globalWordMarks.g2e !== 'object') S.globalWordMarks.g2e = {};
  if (!S.globalWordMarks.e2g || typeof S.globalWordMarks.e2g !== 'object') S.globalWordMarks.e2g = {};
  if (!S.globalWordMarks.morph || typeof S.globalWordMarks.morph !== 'object') S.globalWordMarks.morph = {};
  if (!S.globalWordProgress.g2e || typeof S.globalWordProgress.g2e !== 'object') S.globalWordProgress.g2e = {};
  if (!S.globalWordProgress.e2g || typeof S.globalWordProgress.e2g !== 'object') S.globalWordProgress.e2g = {};
  if (!S.globalWordProgress.morph || typeof S.globalWordProgress.morph !== 'object') S.globalWordProgress.morph = {};
}

export function getDirectionalMarksStore() {
  ensureDirectionalStores();
  return S.globalWordMarks[getStudyStoreKey()];
}

export function getDirectionalProgressStore() {
  ensureDirectionalStores();
  return S.globalWordProgress[getStudyStoreKey()];
}

// ── Mode helpers ──

export function isMorphologyMode() {
  return S.studyMode === 'morph';
}

export function isVocabOnlyProfile() {
  return S.appProfile === 'vocab_only';
}

export function canAccessGrammarUi() {
  return S.appProfile === 'vocab_grammar';
}

export function getProfileDescription() {
  return S.appProfile === 'vocab_only' ? 'Vocabulary only' : 'Vocabulary + Grammar';
}

export function getModeDescription() {
  return S.studyMode === 'morph' ? 'Grammar' : 'Vocabulary';
}

export function resetMorphAnswerState() {
  S.morphAnswerState = { answered: false, revealed: false, selfRated: false, selectedIndex: -1, isCorrect: null };
}

// ── Sanitize gamification state ──

export function sanitizeGamificationState(candidate) {
  if (!isPlainObject(candidate)) return { lastCelebratedLevel: null, lastCelebratedBadgeDay: null, lastEarnedAchievementIds: [] };
  return {
    lastCelebratedLevel: Number.isFinite(candidate.lastCelebratedLevel) ? candidate.lastCelebratedLevel : null,
    lastCelebratedBadgeDay: typeof candidate.lastCelebratedBadgeDay === 'string' ? candidate.lastCelebratedBadgeDay : null,
    lastEarnedAchievementIds: Array.isArray(candidate.lastEarnedAchievementIds) ? candidate.lastEarnedAchievementIds : []
  };
}
