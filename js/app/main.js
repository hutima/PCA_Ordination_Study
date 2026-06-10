// ═══════════════════════════════════════════════════════
//  GREEK FLASHCARDS — Modular Entry Point
// ═══════════════════════════════════════════════════════
//
// ┌─ LLM ORIENTATION ─ READ FIRST ──────────────────────────────────────┐
// │                                                                     │
// │ This file (main.js) is the entry point + glue. Most logic lives in  │
// │ modules under js/ui/, js/state/, and js/domain/. For most changes   │
// │ you do NOT need to load this file — load the relevant module(s)     │
// │ and js/state/runtime.js, that's it. See the task-to-files map below.│
// │                                                                     │
// │ STATE                                                               │
// │   All cross-module state lives in js/state/runtime.js as a single   │
// │   mutable `runtime` object. Modules `import { runtime }` and        │
// │   mutate properties directly (runtime.deck = ..., runtime.marks[id] │
// │   = 'known'). main.js does NOT own any module-level state.          │
// │                                                                     │
// │ WIRING                                                              │
// │   This file imports each module, then calls configure*(deps) at the │
// │   top to inject host callbacks the module needs. New host callbacks │
// │   go in the matching configure* block; new modules add their own    │
// │   configure call here. GLOBAL_CLICK_HANDLERS at the bottom is the   │
// │   onclick="..." surface used by index.html — every name there must  │
// │   resolve to either a local function or a named import.             │
// │                                                                     │
// │ MODULE MAP (load these, not this file, for the matching task)       │
// │   js/state/runtime.js       all shared mutable state                │
// │   js/state/persistence.js   save/restore, JSON export/import,       │
// │                             Transfer modal, deck-state bank         │
// │   js/state/store.js         storage keys, gamification sanitize     │
// │   js/state/migrations.js    versioned state migrations              │
// │   js/domain/srs/*           SRS scheduler, confidence, constants    │
// │   js/domain/deck/*          deck ordering + filters (pure)          │
// │   js/domain/gamification/   XP math, levels, usage-stats primitives │
// │   js/domain/grammar/        grammar-support HTML                    │
// │   js/ui/reader.js           Reader tab (drills + verses)            │
// │   js/ui/keyboard.js         keyboard shortcuts                      │
// │   js/ui/toast.js            level-up / badge toast queue            │
// │   js/ui/touchTapBridge.js   iOS synthetic-tap polyfill              │
// │   js/ui/modals.js           disclaimer, what's new, study selector, │
// │                             shortcuts, analytics open/close,        │
// │                             startStudying, isXxxOpen predicates     │
// │   js/ui/charts.js           pure SVG/HTML builders (histogram,      │
// │                             line, heatmap, ring, word stat card)    │
// │   js/ui/progress.js         progress bar + Review panel +           │
// │                             returnSeenCardToDeck                    │
// │   js/ui/render.js           renderCard, flipCard (vocab + grammar)  │
// │   js/ui/selectors.js        Study Selector overlay + load flow      │
// │                             (buildSessions/Chapter/Suppl/Advanced,  │
// │                             toggle/deselect, loadDeckFromKeys)      │
// │   js/ui/navigation.js       navigate, markCard, setStudyMode,       │
// │                             toggles (shuffle/required/direction/    │
// │                             spaced/morphSelfCheck), reshuffle,      │
// │                             fastForward, resetCurrentDeck,          │
// │                             resetAllStats                           │
// │   js/ui/analytics.js        renderAnalyticsOverlay + ~16 helpers,   │
// │                             runtime-bound XP wrappers, celebrate-   │
// │                             on-level-up/badge plumbing              │
// │   js/utils/*                helpers, time, storage, Greek sort      │
// │   js/logic/pos_logic.js     parsing helpers                         │
// │                                                                     │
// │ WHAT STAYS IN main.js (you only need this file for these)           │
// │   - Theme bootstrap (resolve/applyThemeMode, sync*Buttons, init)    │
// │   - Usage tracking (accumulate*, noteStudyInteraction,              │
// │     startUsageTracking, updateUsageMeta)                            │
// │   - Deck primitives: buildStudyDeck, applySpacedReview,             │
// │     getDueCount, getKnownCount, getHighConfidenceCount,             │
// │     getRemainingCards, moveCardToBackOfActivePile, reshuffle*,      │
// │     maybe*, capture/restore SpacedUndoSnapshot,                     │
// │     applyUnspacedSharedSchedule, recordStudyOutcome,                │
// │     advanceScheduledCards, getWordProgress, getDeckAggregateStats   │
// │   - Morphology answer flow (answerMorphologyChoice,                 │
// │     revealMorphologyAnswer, rateMorphologySelfCheck,                │
// │     markMorphologyDontKnow)                                         │
// │   - Mode predicates (isMorphologyMode, isReaderMode,                │
// │     canAccessGrammarUi, getDirectionalMarksStore, etc.)             │
// │   - startNextCycle, resetStudyState, resetUnspacedCycleState        │
// │   - GLOBAL_CLICK_HANDLERS, init at bottom                           │
// │                                                                     │
// │ TASK → MINIMAL FILE SET                                             │
// │   "fix a card-render bug"           render.js + runtime.js          │
// │   "fix an analytics chart"          analytics.js + charts.js +      │
// │                                       runtime.js                    │
// │   "tweak SRS scheduling"            domain/srs/scheduler.js +       │
// │                                       main.js (applySpacedReview,   │
// │                                       buildStudyDeck) + runtime.js  │
// │   "change progress-bar text"        progress.js + runtime.js        │
// │   "add a new toggle"                navigation.js + runtime.js +    │
// │                                       main.js (configureNavigation, │
// │                                       GLOBAL_CLICK_HANDLERS,        │
// │                                       syncToggleButtons) +          │
// │                                       index.html                    │
// │   "add a new onclick handler"       owning module + main.js         │
// │                                       (GLOBAL_CLICK_HANDLERS) +     │
// │                                       index.html                    │
// │   "add a Study Selector section"    selectors.js + runtime.js +     │
// │                                       index.html                    │
// │   "tweak export/import JSON shape"  persistence.js + runtime.js +   │
// │                                       state/migrations.js (if       │
// │                                       schema-breaking)              │
// │   "add a new XP source"             domain/gamification/levels.js + │
// │                                       domain/gamification/xp.js +   │
// │                                       maybe analytics.js            │
// │   "fix a modal close bug"           modals.js                       │
// │   "fix the reader drill flow"       reader.js                       │
// │                                                                     │
// │ WHEN TO LOAD THIS FILE                                              │
// │   - Wiring a brand-new module (you need to add a configure* call)   │
// │   - A bug in one of the deck primitives or morphology answer flow   │
// │   - A bug in the boot sequence (init at bottom of file)             │
// │   - Adding a new onclick handler (GLOBAL_CLICK_HANDLERS)            │
// │   In all other cases, prefer the relevant module(s). main.js is     │
// │   ~1,450 lines; loading it for a small change wastes tokens.        │
// │                                                                     │
// │ DEPLOY                                                              │
// │   Bump CACHE_NAME in sw.js (e.g. v64 → v65) AND every ?v=64 in      │
// │   sw.js + index.html. New js/* files must be added to                │
// │   APP_SHELL_PATHS in sw.js.                                         │
// │                                                                     │
// │ VERIFICATION                                                        │
// │   Strict-import parse catches more than `node --check`:             │
// │     node --input-type=module -e \                                   │
// │       "import('./js/app/main.js').catch(e=>{                        │
// │         console.error(e.message); process.exit(1);})"               │
// │   `document is not defined` is a successful parse (DOM unavailable  │
// │   in Node) — only treat actual SyntaxError / Invalid… as failures.  │
// │                                                                     │
// │ HISTORY                                                             │
// │   See REFACTOR_PLAN.txt for module-by-module rationale, the         │
// │   runtime-sweep methodology, and patterns to follow for future      │
// │   extractions.                                                      │
// └─────────────────────────────────────────────────────────────────────┘

// Utils
import { clamp, isPlainObject, shuffleArray, escapeHtml, cloneForUndo } from '../utils/helpers.js';
import { formatUsageDuration, formatAnalyticsDate, formatAnalyticsDateTime, getUsageDayKey, getUnspacedArchiveDayKey } from '../utils/time.js';
import { getStorage, isLikelyIOS } from '../utils/storage.js';
import { compareGreekAlphabetical } from '../utils/greekSort.js';

// Domain — SRS
import { SRS_DAY_MS, SRS_NEAR_WINDOW_MS, SRS_CYCLE_ADVANCE_MS, SESSION_IDLE_RESET_MS } from '../domain/srs/constants.js';
import { msFromDays, setProgressDelay,
         getSrsEase, getSrsStage, getLastEasyIntervalDays, getNextEasyIntervalDays,
         getEasyDelayMs, getUncertainDelayMs, formatRemainingForTable } from '../domain/srs/scheduler.js';
import { recordConfidenceSample, getConfidencePct, computeCardXpAward } from '../domain/srs/confidence.js';

// Domain — Gamification
import { XP_LEVELS, REVIEW_XP_SCHEDULE } from '../domain/gamification/levels.js';
import {
  sanitizeUsageStats,
  accumulateUsageTime as accumulateUsageTimeForStats,
  accumulateActiveStudyTime as accumulateActiveStudyTimeForStats,
  finalizeStudySession as finalizeStudySessionForStats,
  noteStudyInteraction as noteStudyInteractionForStats,
  getUsageMsForDay,
  getActiveStudyMsForDay
} from '../domain/gamification/usageStats.js';
// xp.js wrappers are exposed by analytics.js (which owns the runtime-bound
// versions). Importing them here keeps existing call sites in main.js working.

// Domain — Deck
import { isChapterKey, isAdvancedKey, sortSetKeys, sourceHint, expandSessionSets } from '../domain/deck/ordering.js';
import { getSelectedVocabCards, getSelectedGrammarCards, getAllVocabKeys, getAllChapterKeys,
         getAllVocabCards, getAllGrammarCards, getChapterVocabCards, expandSecondAoristCards, progressCardId,
         getCardReviewLeft, getCardReviewRight, getCardMetaLine, getCardAuxLine } from '../domain/deck/filters.js';

// Domain — Grammar
import { buildGrammarSupportHtml } from '../domain/grammar/explanations.js';
import { recordParadigmAttempt, inferredFollowupDims, buildInferredStep, structuralImpossibilityReason, paradigmGapReason, lemmaInventoryGapReason, isLemmaFormKnown, parseAnswerDimensions } from '../domain/grammar/morph_steps.js';
import { listAvailableParadigms, listAvailableParadigmsByCategory, getCardsForFocusedParadigm } from '../domain/grammar/paradigm_focus.js';

// UI
import {
  configureReader,
  renderReaderModule,
  advanceReaderDrill,
  selectReaderDrillChoice,
  openReaderTab
} from '../ui/reader.js';
import { installKeyboardShortcuts } from '../ui/keyboard.js';
import { showLevelToast, showBadgeToast } from '../ui/toast.js';
import { installTouchSafeTapBridge } from '../ui/touchTapBridge.js';
import { installClickShield } from '../utils/clickShield.js';
import {
  configureModals,
  updateConsentButtonState,
  openDisclaimerModal,
  closeDisclaimerModal,
  handleConsentAction,
  initializeConsentGate,
  showDisclaimerModal,
  isDisclaimerModalOpen,
  maybeShowWhatsNewV1_5Modal,
  openWhatsNewV1_5Modal,
  closeWhatsNewV1_5Modal,
  isWhatsNewV1_5ModalOpen,
  isTransferModalOpen,
  isStudySelectorOpen,
  openStudySelector,
  closeStudySelector,
  isShortcutsModalOpen,
  openShortcutsModal,
  closeShortcutsModal,
  isAnalyticsModalOpen,
  openAnalyticsOverlay,
  closeAnalyticsOverlay,
  startStudying
} from '../ui/modals.js';
import {
  configureProgress,
  renderProgress,
  renderReview,
  returnSeenCardToDeck,
  setReviewSortMode,
  clearParsingMorph
} from '../ui/progress.js';
import { configureRender, renderCard, flipCard } from '../ui/render.js';
import {
  configureSelectors,
  isSessionFullySelected,
  findExactSessionMatch,
  setActiveSessionButton,
  setActiveSetButtons,
  buildSessions,
  buildChapterSelector,
  buildSupplementalSelector,
  buildAdvancedSelector,
  deselectAllSupplementals,
  deselectAllAdvanced,
  deselectAllChapters,
  deselectAll,
  toggleAdvancedSubGroup,
  loadDeckFromKeys,
  loadSession,
  toggleSession,
  getParadigmBaseKey,
  toggleSet
} from '../ui/selectors.js';
import {
  configureNavigation,
  navigate,
  markCard,
  setStudyMode,
  setAppProfile,
  toggleMorphSelfCheck,
  toggleMorphStepByStep,
  setMorphFocusedParadigm,
  toggleShuffle,
  toggleRequiredOnly,
  toggleHardVocabReview,
  toggleStemNotes,
  toggleSecondAoristCards,
  toggleDirection,
  toggleSpacedRepetition,
  toggleSplitSelection,
  toggleAspectStep,
  toggleDimStep,
  toggleOptionalForms,
  toggleOptionalFormFilter,
  toggleDimValueFilter,
  toggleExcludeKnownMorphs,
  toggleParsingReverse,
  toggleAccentLookalikes,
  toggleUnspacedDailyReset,
  reshuffleEligible,
  fastForwardOneDay,
  fastForwardOneWeek,
  resetCurrentDeck,
  resetRequiredOnly,
  resetKnownMorphs,
  closeResetKnownModal,
  confirmResetKnownFocused,
  confirmResetKnownAll,
  clearParsingStats,
  closeResetSpacedModal,
  confirmResetSpacedTimingOnly,
  confirmResetSpacedProgress,
  confirmResetSpacedSmooth,
  closeResetUnspacedModal,
  confirmResetUnspacedMarks,
  openResetStatsModal,
  closeResetStatsModal,
  confirmResetStatsKeepSettings,
  confirmResetToStart,
  resetAllStats
} from '../ui/navigation.js';
import {
  configureAnalytics,
  migrateLegacyXp,
  computeXpAndLevel,
  computeAchievements,
  syncEarnedAchievementSnapshot,
  maybeCelebrateLevelUp,
  maybeCelebrateAchievements,
  renderAnalyticsOverlay
} from '../ui/analytics.js';
import {
  configurePersistence,
  closeTransferModal,
  handleTransferPrimaryAction,
  handleTransferSecondaryAction,
  exportProgressJson,
  triggerImportProgress,
  getDeckStateKey,
  saveCurrentDeckStateToBank,
  markActiveDeckRef,
  saveState,
  clearSavedState,
  reorderDeckFromIds,
  restoreState,
  buildPersistedStatePayload
} from '../state/persistence.js';
import {
  backfillConfirmedMilestones,
  buildDailyCumulativeSeriesFromMap,
  buildCumulativeConfirmationSeries,
  getCertaintyBucketForCard,
  buildCertaintyBuckets,
  buildConfirmationHistogram,
  buildHistogramSvg,
  buildLineChartSvg,
  buildBarChartSvg,
  buildHeatmapSvg,
  buildCircularProgressSvg,
  buildLevelBarHtml,
  buildTitleLadderHtml,
  buildWordStatCardHtml
} from '../ui/charts.js';

// State
import { runtime } from '../state/runtime.js';
import { STATE_MIGRATIONS, summarizePersistedState, formatPersistedStateSummary } from '../state/migrations.js';
import {
  sanitizeGamificationState,
  STORAGE_KEY,
  CONSENT_STORAGE_KEY,
  WHATS_NEW_V1_5_STORAGE_KEY,
  THEME_STORAGE_KEY,
  FONT_FAMILY_STORAGE_KEY,
  TEXT_SIZE_STORAGE_KEY,
  PROGRESS_EXPORT_FORMAT,
  PROGRESS_EXPORT_VERSION,
  STUDY_IDLE_MS,
  STUDY_SESSION_BREAK_MS,
  MAX_STUDY_SESSION_HISTORY
} from '../state/store.js';

// Wire UI modules with the host helpers they call back into.
// Function declarations are hoisted; getter/setter closures defer reads to
// invocation time, so let-binding values are valid by the time they're called.
configureReader({ noteStudyInteraction, setStudyMode });
configureModals({
  renderAnalyticsOverlay: () => renderAnalyticsOverlay(),
  buildSessions: () => buildSessions(),
  buildChapterSelector: () => buildChapterSelector(),
  buildSupplementalSelector: () => buildSupplementalSelector(),
  buildAdvancedSelector: () => buildAdvancedSelector(),
  getHasAcceptedDisclaimer: () => runtime.hasAcceptedDisclaimer,
  setHasAcceptedDisclaimer: (v) => { runtime.hasAcceptedDisclaimer = v; },
  getDisclaimerModalRequiresAgreement: () => runtime.disclaimerModalRequiresAgreement,
  setDisclaimerModalRequiresAgreement: (v) => { runtime.disclaimerModalRequiresAgreement = v; },
  hasSelectedKeys: () => runtime.selectedKeys.length > 0
});
configureProgress({
  accumulateUsageTime: () => accumulateUsageTime(),
  accumulateActiveStudyTime: () => accumulateActiveStudyTime(),
  updateUsageMeta: () => updateUsageMeta(),
  getKnownCount: () => getKnownCount(),
  getDueCount: (cards) => getDueCount(cards),
  getRemainingCards: () => getRemainingCards(),
  getHighConfidenceCount: () => getHighConfidenceCount(),
  getWordProgress: (id, opts) => getWordProgress(id, opts),
  isMorphologyMode: () => isMorphologyMode(),
  isParsingMode: () => isParsingMode(),
  renderAnalyticsOverlay: () => renderAnalyticsOverlay(),
  moveCardToBackOfActivePile: (card) => moveCardToBackOfActivePile(card),
  buildStudyDeck: (cards, opts) => buildStudyDeck(cards, opts),
  renderCard: () => renderCard(),
  saveState: () => saveState(),
  getEnabledParsingDims: () => getEnabledParsingDims(),
  // Rebuild the parsing deck after a single form's tally is cleared via the
  // review panel's ✕ — needed so a freshly-cleared form re-enters the deck
  // when "skip confident" (exclude-known-morphs) is on. Re-renders + persists.
  rebuildParsingDeck: () => rebuildMorphDeckForStepMode(),
  // Same pool the parsing drill uses for `lemma`: chapter-gated against
  // the user's aggregate selection, and including optional paradigm
  // extensions iff the user has toggled them on. Used by the parsing-
  // review row expansion to list "testable forms" with last-attempt
  // outcomes. Excludes known morphs only when the user has the toggle on;
  // otherwise lists the full focused-paradigm pool so the panel always
  // shows everything in scope (including 2/2-known forms).
  getMorphCardsForLemma: (lemma) => getCardsForFocusedParadigm(
    getAggregateSelectionKeys(),
    lemma,
    {
      includeOptional: !!runtime.includeOptionalForms,
      optionalFilters: runtime.optionalFormFilters,
      dimValueFilters: runtime.dimValueFilters
    }
  )
});
configureRender({
  saveState: () => saveState(),
  syncLayoutVisibility: () => syncLayoutVisibility(),
  noteStudyInteraction: () => noteStudyInteraction(),
  getNearDueCount: () => getNearDueCount(),
  isMorphologyMode: () => isMorphologyMode(),
  isParsingMode: () => isParsingMode(),
  isReverseGrammarActive: () => isReverseGrammarActive(),
  isMorphCard: (card) => isMorphCard(card),
  reverseDisplayActive: (card) => reverseDisplayActive(card),
  startNextCycle: (mode, opts) => startNextCycle(mode, opts),
  resetMorphAnswerState: () => resetMorphAnswerState(),
  maybeReturnKnownCardToActivePile: () => maybeReturnKnownCardToActivePile(),
  formatGreekHeadword: (g) => typeof window !== 'undefined' && typeof window.formatGreekHeadword === 'function' ? window.formatGreekHeadword(g) : (g || '—'),
  transliterateGreek: (s) => typeof window !== 'undefined' && typeof window.transliterateGreek === 'function' ? window.transliterateGreek(s) : s,
  detectPartOfSpeech: (card) => typeof window !== 'undefined' && typeof window.detectPartOfSpeech === 'function' ? window.detectPartOfSpeech(card) : '',
  isMultiCasePreposition: (card) => typeof window !== 'undefined' && typeof window.isMultiCasePreposition === 'function' ? window.isMultiCasePreposition(card) : false,
  getEnabledParsingDims: () => getEnabledParsingDims(),
  // Full focused-paradigm pool for paradigm-gap detection: chapter-gated, but
  // deliberately NOT pruned by exclude-known or per-value dim filters, so the
  // present-values truth reflects the whole paradigm (e.g. ἐγώ/σύ has only
  // 1st/2nd person regardless of which forms the user has mastered/excluded).
  getFocusedParadigmAllCards: () => {
    if (!isParsingMode() || !runtime.morphFocusedParadigm) return [];
    return getCardsForFocusedParadigm(
      getAggregateSelectionKeys(),
      runtime.morphFocusedParadigm,
      {
        includeOptional: !!runtime.includeOptionalForms,
        optionalFilters: runtime.optionalFormFilters
      }
    );
  }
});
configureSelectors({
  getSessions: () => getSessions(),
  getSelectedCards: (keys) => getSelectedCards(keys),
  getDirectionalMarksStore: () => getDirectionalMarksStore(),
  getDirectionalProgressStore: () => getDirectionalProgressStore(),
  resetMorphAnswerState: () => resetMorphAnswerState(),
  getDeckStateKey: (keys, req, spaced) => getDeckStateKey(keys, req, spaced),
  reorderDeckFromIds: (cards, ids) => reorderDeckFromIds(cards, ids),
  buildStudyDeck: (cards, opts) => buildStudyDeck(cards, opts),
  getDueCount: (cards) => getDueCount(cards),
  resetUnspacedCycleState: () => resetUnspacedCycleState(),
  resetStudyState: () => resetStudyState(),
  syncToggleButtons: () => syncToggleButtons(),
  clearSpacedUndoSnapshot: () => clearSpacedUndoSnapshot(),
  saveCurrentDeckStateToBank: () => saveCurrentDeckStateToBank(),
  markActiveDeckRef: () => markActiveDeckRef(),
  saveState: () => saveState(),
  canAccessGrammarUi: () => canAccessGrammarUi(),
  isMorphStepByStepActive: () => isParsingMode(),
  getFocusedParadigmCards: () => {
    if (!isParsingMode()) return null;
    return buildFilteredFocusedParadigmCards();
  }
});
configureNavigation({
  noteStudyInteraction: () => noteStudyInteraction(),
  isMorphologyMode: () => isMorphologyMode(),
  isParsingMode: () => isParsingMode(),
  isReaderMode: () => isReaderMode(),
  normalizeStudyMode: (m) => normalizeStudyMode(m),
  resetMorphAnswerState: () => resetMorphAnswerState(),
  ensureDirectionalStores: () => ensureDirectionalStores(),
  getDirectionalMarksStore: () => getDirectionalMarksStore(),
  getDirectionalProgressStore: () => getDirectionalProgressStore(),
  syncToggleButtons: () => syncToggleButtons(),
  syncLayoutVisibility: () => syncLayoutVisibility(),
  startNextCycle: (mode, opts) => startNextCycle(mode, opts),
  getKnownCount: () => getKnownCount(),
  advanceScheduledCards: (cards, ms) => advanceScheduledCards(cards, ms),
  buildStudyDeck: (cards, opts) => buildStudyDeck(cards, opts),
  captureSpacedUndoSnapshot: () => captureSpacedUndoSnapshot(),
  applySpacedReview: (card, outcome) => applySpacedReview(card, outcome),
  clearSpacedUndoSnapshot: () => clearSpacedUndoSnapshot(),
  restoreSpacedUndo: () => restoreSpacedUndo(),
  pushUnspacedHistory: (type) => pushUnspacedHistory(type),
  restoreUnspacedHistoryStep: () => restoreUnspacedHistoryStep(),
  clearSavedState: () => clearSavedState(),
  maybeReturnConfirmedDeferredCard: () => maybeReturnConfirmedDeferredCard(),
  maybePeriodicReshuffle: () => maybePeriodicReshuffle(),
  recordStudyOutcome: (id, outcome, at) => recordStudyOutcome(id, outcome, at),
  applyUnspacedSharedSchedule: (card, outcome, at) => applyUnspacedSharedSchedule(card, outcome, at),
  getRemainingCards: () => getRemainingCards(),
  resetUnspacedCycleState: () => resetUnspacedCycleState(),
  noteUnspacedArchiveActivity: () => noteUnspacedArchiveActivity(),
  saveCurrentDeckStateToBank: () => saveCurrentDeckStateToBank(),
  markActiveDeckRef: () => markActiveDeckRef(),
  saveState: () => saveState(),
  renderReaderModule: () => renderReaderModule(),
  getDeckStateKey: (keys, req, spaced) => getDeckStateKey(keys, req, spaced),
  getSessions: () => getSessions(),
  getSelectedCards: (keys) => getSelectedCards(keys),
  resetMorphStepState: () => resetMorphStepState(),
  ensureMorphFocusedParadigm: () => ensureMorphFocusedParadigm(),
  rebuildMorphDeckForStepMode: () => rebuildMorphDeckForStepMode(),
  rebuildParsingCycle: (opts) => rebuildParsingCycle(opts)
});
configureAnalytics({
  ensureUsageStats: () => ensureUsageStats(),
  accumulateActiveStudyTime: () => accumulateActiveStudyTime(),
  canAccessGrammarUi: () => canAccessGrammarUi(),
  saveState: () => saveState(),
  getEnabledParsingDims: () => getEnabledParsingDims(),
  // Chapter-gated in-scope forms for a paradigm (same pool the deck + the
  // review panel use), so the analytics breakdown only shows values the
  // student's current chapter scope has unlocked.
  getMorphCardsForLemma: (lemma) => getCardsForFocusedParadigm(
    getAggregateSelectionKeys(),
    lemma,
    {
      includeOptional: !!runtime.includeOptionalForms,
      optionalFilters: runtime.optionalFormFilters,
      dimValueFilters: runtime.dimValueFilters
    }
  )
});
configurePersistence({
  ensureUsageStats: (stats) => ensureUsageStats(stats),
  normalizeStudyMode: (m) => normalizeStudyMode(m),
  ensureDirectionalStores: () => ensureDirectionalStores(),
  getDirectionalMarksStore: () => getDirectionalMarksStore(),
  getStudyStoreKey: () => getStudyStoreKey(),
  accumulateUsageTime: () => accumulateUsageTime(),
  accumulateActiveStudyTime: () => accumulateActiveStudyTime(),
  getSessions: () => getSessions(),
  getSelectedCards: (keys) => getSelectedCards(keys),
  buildStudyDeck: (cards, opts) => buildStudyDeck(cards, opts),
  getDueCount: (cards) => getDueCount(cards),
  resetMorphAnswerState: () => resetMorphAnswerState(),
  resetUnspacedCycleState: () => resetUnspacedCycleState(),
  clearSpacedUndoSnapshot: () => clearSpacedUndoSnapshot(),
  syncToggleButtons: () => syncToggleButtons(),
  syncLayoutVisibility: () => syncLayoutVisibility(),
  getDirectionalProgressStore: () => getDirectionalProgressStore(),
  isReaderMode: () => isReaderMode(),
  renderReaderModule: () => renderReaderModule(),
  maybeAutoResetUnspacedArchives: () => maybeAutoResetUnspacedArchives()
});


function getDirectionKey() {
  return runtime.directionToGreek ? 'e2g' : 'g2e';
}

function getStudyStoreKey() {
  if (runtime.studyMode === 'morph') {
    return runtime.directionToGreek ? 'morph_e2g' : 'morph';
  }
  // Parsing mode is off-the-record (no SRS / no main-stats writes), so it
  // reads its directional store under its own key — keeping it cleanly
  // separated from the grammar-mode mark store.
  if (runtime.studyMode === 'parsing') return 'parsing';
  return getDirectionKey();
}

function isReverseGrammarActive() {
  return runtime.studyMode === 'morph' && runtime.directionToGreek;
}

function reverseDisplayActive(card) {
  return isReverseGrammarActive() && !!card && card.reversible === true;
}

function ensureDirectionalStores() {
  if (!runtime.globalWordMarks || typeof runtime.globalWordMarks !== 'object' || Array.isArray(runtime.globalWordMarks)) runtime.globalWordMarks = {};
  if (!runtime.globalWordProgress || typeof runtime.globalWordProgress !== 'object' || Array.isArray(runtime.globalWordProgress)) runtime.globalWordProgress = {};

  const migrateLegacyBucket = (bucketObj) => {
    const keys = Object.keys(bucketObj || {});
    if (keys.length && !('g2e' in bucketObj) && !('e2g' in bucketObj) && !('morph' in bucketObj)) {
      return { g2e: { ...bucketObj }, e2g: {}, morph: {} };
    }
    return bucketObj;
  };

  runtime.globalWordMarks = migrateLegacyBucket(runtime.globalWordMarks);
  runtime.globalWordProgress = migrateLegacyBucket(runtime.globalWordProgress);

  if (!runtime.globalWordMarks.g2e || typeof runtime.globalWordMarks.g2e !== 'object') runtime.globalWordMarks.g2e = {};
  if (!runtime.globalWordMarks.e2g || typeof runtime.globalWordMarks.e2g !== 'object') runtime.globalWordMarks.e2g = {};
  if (!runtime.globalWordMarks.morph || typeof runtime.globalWordMarks.morph !== 'object') runtime.globalWordMarks.morph = {};
  if (!runtime.globalWordMarks.morph_e2g || typeof runtime.globalWordMarks.morph_e2g !== 'object') runtime.globalWordMarks.morph_e2g = {};
  if (!runtime.globalWordMarks.parsing || typeof runtime.globalWordMarks.parsing !== 'object') runtime.globalWordMarks.parsing = {};
  if (!runtime.globalWordProgress.g2e || typeof runtime.globalWordProgress.g2e !== 'object') runtime.globalWordProgress.g2e = {};
  if (!runtime.globalWordProgress.e2g || typeof runtime.globalWordProgress.e2g !== 'object') runtime.globalWordProgress.e2g = {};
  if (!runtime.globalWordProgress.morph || typeof runtime.globalWordProgress.morph !== 'object') runtime.globalWordProgress.morph = {};
  if (!runtime.globalWordProgress.morph_e2g || typeof runtime.globalWordProgress.morph_e2g !== 'object') runtime.globalWordProgress.morph_e2g = {};
  if (!runtime.globalWordProgress.parsing || typeof runtime.globalWordProgress.parsing !== 'object') runtime.globalWordProgress.parsing = {};
}

function getDirectionalMarksStore() {
  ensureDirectionalStores();
  return runtime.globalWordMarks[getStudyStoreKey()];
}

function getDirectionalProgressStore() {
  ensureDirectionalStores();
  return runtime.globalWordProgress[getStudyStoreKey()];
}


// Fixed 1-in-N chance per flip (not scaled by pool size) to return one
// random known card to the active pile. 50 → ~1 return per 50 flips (2%).
const KNOWN_CARD_RANDOM_RETURN_FLIP_ODDS = 50;


function isMorphologyMode() {
  return runtime.studyMode === 'morph';
}

// Parsing is its own top-level study mode (separate from Grammar). Grammar
// keeps its single-MC parse cards; Parsing always runs the step-by-step
// dimensional walk against the focused paradigm.
function isParsingMode() {
  return runtime.studyMode === 'parsing';
}

// Map of parsing dims the user currently has enabled — used to filter
// per-dim values out of stats/forms reads when the user has toggled the
// corresponding step off. Aspect lives on its own toggle (predates the
// dimToggles bag) so it's surfaced explicitly here. Returned object is
// reused as a plain { dim: bool } lookup; missing keys count as enabled.
function getEnabledParsingDims() {
  const dt = (runtime.dimToggles && typeof runtime.dimToggles === 'object') ? runtime.dimToggles : {};
  return {
    aspect: runtime.aspectStep !== false,
    tense:  dt.tense  !== false,
    voice:  dt.voice  !== false,
    mood:   dt.mood   !== false,
    person: dt.person !== false,
    number: dt.number !== false,
    case:   dt.case   !== false,
    gender: dt.gender !== false
  };
}

function isReaderMode() {
  return runtime.studyMode === 'reader';
}

function isCardStudyMode() {
  return runtime.studyMode === 'vocab' || runtime.studyMode === 'morph' || runtime.studyMode === 'parsing' || runtime.studyMode === 'reader';
}

function isReviewDeckMode() {
  return runtime.studyMode === 'vocab' || runtime.studyMode === 'morph' || runtime.studyMode === 'parsing';
}

function isVocabOnlyProfile() {
  return false;
}

function canAccessGrammarUi() {
  return !isVocabOnlyProfile();
}

function getSessions() {
  return Array.isArray(window.SESSIONS) ? window.SESSIONS : [];
}

function getProfileDescription() {
  return 'Full layout with vocabulary, grammar, reader, and memorization. Time totals stay shared, while progress remains separate by module.';
}

function normalizeStudyMode(mode) {
  if (mode === 'morph' && canAccessGrammarUi()) return 'morph';
  if (mode === 'parsing' && canAccessGrammarUi()) return 'parsing';
  if (mode === 'reader') return 'reader';
  return 'vocab';
}

function isMorphCard(card) {
  return !!card && card.kind === 'morph';
}

function resetMorphAnswerState() {
  runtime.morphAnswerState = { answered: false, revealed: false, selfRated: false, selectedIndex: -1, isCorrect: null };
  runtime.morphPendingAdvance = false;
}

function resetMorphStepState() {
  runtime.morphStepState = { cardId: null, steps: [], stepIdx: 0, answers: [], completed: false };
}

// Pick a default focused paradigm if none chosen, drawn from the current
// selection. Called when toggling step-by-step on; safe to call any time —
// it only writes when the field is currently null and a candidate exists.
function ensureMorphFocusedParadigm() {
  if (runtime.morphFocusedParadigm) return;
  const available = listAvailableParadigms(getAggregateSelectionKeys());
  if (available.length) runtime.morphFocusedParadigm = available[0].lemma;
}

// Selection keys used for chapter-gating paradigm pools. In parsing mode
// the dedicated "Current chapter" dropdown is the single source of truth
// (runtime.parsingChapter), so we synthesize a one-element key array from
// it and ignore vocab/grammar's selectedKeys. Everywhere else we fall
// back to the union across modes so the student's "max effective chapter"
// reflects their highest point in the course.
function getAggregateSelectionKeys() {
  if (isParsingMode()) {
    return [String(getParsingChapter())];
  }
  const union = new Set((runtime.selectedKeys || []).map(String));
  const ms = runtime.modeSelections || {};
  Object.keys(ms).forEach((mode) => {
    if (mode === 'parsing') return; // parsing has its own gating; don't leak it into other modes
    const entry = ms[mode];
    if (entry && Array.isArray(entry.selectedKeys)) {
      entry.selectedKeys.forEach((k) => union.add(String(k)));
    }
  });
  return [...union];
}

// Coerce runtime.parsingChapter to a valid 1..20 integer. Returns 20 as
// the fallback (every Duff chapter in scope).
function getParsingChapter() {
  const n = Number(runtime.parsingChapter);
  if (Number.isFinite(n) && Number.isInteger(n) && n >= 1 && n <= 20) return n;
  return 20;
}

// Parsing mode narrows the deck to the focused paradigm's forms via the
// selectors-host hook; switching the focused paradigm re-runs
// loadDeckFromKeys so the deck rebuilds accordingly.
function rebuildMorphDeckForStepMode() {
  if (!isParsingMode()) return;
  loadDeckFromKeys(runtime.selectedKeys, runtime.currentSession ? runtime.currentSession.id : null);
}

// Handler for the parsing-mode chapter dropdown. Updates runtime.parsingChapter,
// resyncs the deck's gating, and lets the focused-paradigm dropdown pick a
// new default if the previous lemma falls out of scope at the new chapter.
// Handler for the parsing-mode redirect card. The stem-highlighted
// stem-pair cards (e.g. W4_SECOND_AORIST_STEMS — "γινώσκω → ἔγνων") live
// in Vocab mode as a supplemental set; parsing can't walk them
// dimensionally. The card is a one-tap shortcut: switch to vocab mode,
// replace the current vocab selection with just that supplemental set,
// and rebuild the deck.
function goToStemDrillFromParsing(setKey) {
  if (typeof setKey !== 'string' || !setKey) return;
  // The supplemental set must actually be registered — otherwise we'd
  // switch the user into vocab mode with an empty deck for no visible
  // reason. Both SETS (master vocab registry) and the supplemental-vocab
  // registry get the same key when registerSupplementalVocabSet runs.
  const vocabSets = (typeof window !== 'undefined' && window.SUPPLEMENTAL_VOCAB_SETS) || {};
  if (!vocabSets[setKey]) return;
  // setStudyMode handles the parsing→vocab save/restore of modeSelections
  // (parsing's chapter key gets stashed under modeSelections.parsing so
  // it survives the round trip). After the mode flip, loadDeckFromKeys
  // overwrites whatever vocab selection was restored with just the
  // supplemental set the user tapped on.
  setStudyMode('vocab');
  loadDeckFromKeys([setKey], null, { clearUnspacedMarks: true });
}

function setParsingChapter(value) {
  if (!isParsingMode()) return;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 20) return;
  if (n === runtime.parsingChapter) return;
  runtime.parsingChapter = n;
  runtime.selectedKeys = [String(n)];
  runtime.currentSession = null;
  // If the previously-focused paradigm isn't introduced until a later
  // chapter, drop it so ensureMorphFocusedParadigm picks the first
  // in-scope lemma on the next rebuild. Without this, loadDeckFromKeys
  // builds an empty deck once before syncParadigmFocusUi corrects it.
  if (runtime.morphFocusedParadigm) {
    const available = listAvailableParadigms(getAggregateSelectionKeys());
    if (!available.some((p) => p.lemma === runtime.morphFocusedParadigm)) {
      runtime.morphFocusedParadigm = null;
    }
  }
  loadDeckFromKeys(runtime.selectedKeys, null);
}

// Step answer: record dimension correctness locally, advance through the
// steps, write a single attempt to the rolling per-lemma window on
// completion. NO writes to SRS, recordStudyOutcome, or directional marks —
// parsing mode is explicitly off-the-record.
// Dynamically appends ungraded follow-up steps when the student's pick
// implies a parse class richer than the source card supplies (e.g.
// picking mood=indicative on an imperative card means they need to
// commit to a person before we can resolve their picks to a single
// form). Returns the number of steps appended, or 0 if none.
function maybeInjectInferredSteps(state, stepKey, picked) {
  if (!state || !Array.isArray(state.steps)) return 0;
  const existing = new Set(state.steps.map((s) => s.key));
  const needs = inferredFollowupDims(stepKey, picked, existing);
  if (!needs.length) return 0;
  const pools = state.accessiblePools || {};
  const newSteps = needs.map((dk) => buildInferredStep(dk, pools)).filter(Boolean);
  if (!newSteps.length) return 0;
  // Insert right after the current step so the natural dimension order
  // (mood → person → number, etc.) is preserved.
  state.steps.splice(state.stepIdx + 1, 0, ...newSteps);
  state.answers.splice(state.stepIdx + 1, 0, ...new Array(newSteps.length).fill(null));
  return newSteps.length;
}

// When an inferred follow-up step is answered, the trigger step that
// caused its injection should reveal its correctness. Walks backward
// from the just-answered inferred step, decrements the most recent
// pending trigger, and clears the deferred flag when its counter hits
// zero.
function noteInferredAnswerSatisfied(state, answeredIdx) {
  if (!state || !Array.isArray(state.answers)) return;
  for (let i = answeredIdx - 1; i >= 0; i--) {
    const a = state.answers[i];
    if (a && a.deferred && a.triggersInferred > 0) {
      a.triggersInferred -= 1;
      if (a.triggersInferred === 0) {
        delete a.deferred;
        delete a.triggersInferred;
      }
      return;
    }
  }
}

function answerMorphologyStep(choiceIdx) {
  if (!isParsingMode()) return;
  noteStudyInteraction();
  const card = runtime.deck[runtime.currentIdx];
  if (!card || !runtime.morphStepState || runtime.morphStepState.completed) return;
  const state = runtime.morphStepState;
  const step = state.steps[state.stepIdx];
  if (!step) return;
  const picked = step.choices[choiceIdx];
  // Inferred follow-up steps are ungraded — they exist to converge on a
  // single form for feedback, not to score the student. For graded steps
  // we still use `acceptable` (multi-valid like aspect's continuous/
  // undefined composite) with a fallback to `correct`.
  const validSet = Array.isArray(step.acceptable) && step.acceptable.length
    ? new Set(step.acceptable)
    : new Set([step.correct]);
  const isCorrect = step.inferred ? null : validSet.has(picked);
  state.answers[state.stepIdx] = { selectedIdx: choiceIdx, isCorrect };

  const answeredIdx = state.stepIdx;
  const wasInferred = !!step.inferred;

  // Structural impossibility check: once the picks collectively name a
  // non-existent paradigm cell (e.g. future + imperative), there's nothing
  // sensible to ask for the remaining downstream dimensions — the form
  // doesn't exist, so person/number are moot. Stop the walk, record the
  // reason, and let the summary explain why.
  const struct = detectStructuralImpossibility(state);
  if (struct) {
    state.structuralImpossibility = struct;
    state.stepIdx = state.steps.length;
    state.completed = true;
    finalizeMorphStepAttempt(card, state);
    renderCard();
    renderProgress();
    saveState();
    return;
  }

  // Paradigm value gap: the pick names a value the focused paradigm has no
  // forms for (e.g. third person for ἐγώ/σύ). Like a structural impossibility,
  // there's no form to resolve and no point asking the remaining dimensions —
  // cut the walk off and let the summary explain the gap.
  const gap = detectParadigmGap(state, card);
  if (gap) {
    state.paradigmGap = gap;
    state.stepIdx = state.steps.length;
    state.completed = true;
    finalizeMorphStepAttempt(card, state);
    renderCard();
    renderProgress();
    saveState();
    return;
  }

  const injectedCount = maybeInjectInferredSteps(state, step.key, picked);
  if (injectedCount > 0) {
    // Defer this step's correctness reveal until the injected follow-ups
    // are answered, so the student doesn't see "mood wrong" before they
    // commit to the person/number that completes their parse.
    state.answers[answeredIdx].deferred = true;
    state.answers[answeredIdx].triggersInferred = injectedCount;
  }
  state.stepIdx += 1;
  if (wasInferred) noteInferredAnswerSatisfied(state, answeredIdx);

  if (state.stepIdx >= state.steps.length) {
    state.completed = true;
    finalizeMorphStepAttempt(card, state);
  }
  renderCard();
  renderProgress();
  saveState();
}

// Walks the answers collected so far and asks morph_steps whether the
// (tense, mood) combination names a structurally impossible paradigm cell.
// Returns { reason } or null. Ignores ungraded inferred steps (their picks
// still inform the lookup, since e.g. the user might inject person before
// the impossibility surfaces).
function detectStructuralImpossibility(state) {
  if (!state || !Array.isArray(state.steps)) return null;
  const picked = {};
  state.steps.forEach((s, idx) => {
    if (!s) return;
    const ans = state.answers[idx];
    if (!ans || ans.selectedIdx < 0) return;
    picked[s.key] = s.choices[ans.selectedIdx];
  });
  const reason = structuralImpossibilityReason(picked);
  return reason ? { reason } : null;
}

// Walks the graded picks so far and asks morph_steps whether any names a value
// the focused paradigm / lemma structurally lacks. Returns a gap descriptor
// { dim, picked, short, note } or null. Two sources, both conservative:
//   1) Person on a person-bearing nominal paradigm that lacks it — third
//      person on ἐγώ/σύ — derived from the paradigm's own drilled forms
//      (guarded to non-verbs so it can't misfire on undrilled conjugations).
//   2) A tense/voice/mood from the lemma's hand-reviewed negative inventory
//      (lemma_inventory.js) — e.g. the non-existent aorist of εἰμί.
// Ignores ungraded inferred steps.
function detectParadigmGap(state, card) {
  if (!state || !Array.isArray(state.steps)) return null;
  const picked = {};
  state.steps.forEach((s, idx) => {
    if (!s || s.inferred) return;
    const ans = state.answers[idx];
    if (!ans || ans.selectedIdx < 0) return;
    picked[s.key] = s.choices[ans.selectedIdx];
  });
  if (state.paradigmPresentValues) {
    const pGap = paradigmGapReason(picked, state.paradigmPresentValues, card && card.lemma);
    if (pGap) return pGap;
  }
  const inv = (card && card.lemma && typeof window !== 'undefined' && window.LEMMA_INVENTORY)
    ? window.LEMMA_INVENTORY[card.lemma] : null;
  if (inv) {
    const invGap = lemmaInventoryGapReason(picked, inv, card.lemma);
    if (invGap) return invGap;
  }
  return null;
}

// English → Greek parsing answer. choiceIdx === -1 is the "I don't know"
// row (counts as wrong). Grades the picked form against the cached correct
// form, records a paradigm attempt across the enabled dims (the form encodes
// every dimension, so a right pick is all-correct, a wrong pick all-wrong),
// and shows feedback. Advancing is the normal Next button (navigate).
function answerParsingReverseChoice(choiceIdx) {
  if (!isParsingMode() || !runtime.parsingReverse) return;
  noteStudyInteraction();
  const card = runtime.deck[runtime.currentIdx];
  if (!card || runtime.morphAnswerState.answered) return;
  const st = runtime.parsingReverseState;
  if (!st || st.cardId !== card.id || !Array.isArray(st.options)) return;
  const picked = choiceIdx >= 0 ? st.options[choiceIdx] : null;
  const isCorrect = picked != null && picked === st.correctForm;
  runtime.morphAnswerState = {
    answered: true,
    revealed: true,
    selfRated: true,
    selectedIndex: choiceIdx,
    isCorrect
  };
  recordParsingReverseAttempt(card, isCorrect);
  renderCard();
  renderProgress();
  saveState();
}

// Fold a reverse-drill outcome into the per-paradigm stats the same way the
// forward walk does: every enabled dimension the card actually carries gets
// the shared correctness (1 if the right form was picked, else 0), and the
// per-form recent tally updates so the 2/2 "known"/exclude-known machinery
// keeps working across both directions.
function recordParsingReverseAttempt(card, isCorrect) {
  if (!card || !card.lemma) return;
  const dims = parseAnswerDimensions(card.parsedAnswer || card.answer || '');
  const enabled = getEnabledParsingDims();
  const result = {};
  ['tense', 'voice', 'mood', 'person', 'number', 'case', 'gender'].forEach((k) => {
    if (!dims[k]) return;
    if (enabled && enabled[k] === false) return;
    result[k] = isCorrect ? 1 : 0;
  });
  if (!Object.keys(result).length) return;
  if (!runtime.paradigmStepStats || typeof runtime.paradigmStepStats !== 'object') {
    runtime.paradigmStepStats = { byLemma: {} };
  }
  recordParadigmAttempt(runtime.paradigmStepStats, card.lemma, result, { cardId: card.id });
}

function skipMorphologyStep() {
  if (!isParsingMode()) return;
  noteStudyInteraction();
  const card = runtime.deck[runtime.currentIdx];
  if (!card || !runtime.morphStepState || runtime.morphStepState.completed) return;
  const state = runtime.morphStepState;
  const step = state.steps[state.stepIdx];
  if (!step) return;
  const isCorrect = step.inferred ? null : false;
  state.answers[state.stepIdx] = { selectedIdx: -1, isCorrect };
  const answeredIdx = state.stepIdx;
  if (step.inferred) noteInferredAnswerSatisfied(state, answeredIdx);
  state.stepIdx += 1;
  if (state.stepIdx >= state.steps.length) {
    state.completed = true;
    finalizeMorphStepAttempt(card, state);
  }
  renderCard();
  renderProgress();
  saveState();
}

// "I give up" — bail on the whole form, not just the current dimension.
// Every remaining graded step is marked wrong and the walk jumps straight to
// the summary (all sections wrong). Inferred (ungraded) follow-up steps are
// satisfied without scoring so the walk can complete cleanly. Contrast with
// skipMorphologyStep ("I don't know"), which only fails the current step.
function giveUpMorphologyStep() {
  if (!isParsingMode()) return;
  noteStudyInteraction();
  const card = runtime.deck[runtime.currentIdx];
  if (!card || !runtime.morphStepState || runtime.morphStepState.completed) return;
  const state = runtime.morphStepState;
  for (let i = state.stepIdx; i < state.steps.length; i += 1) {
    const step = state.steps[i];
    if (!step) continue;
    state.answers[i] = { selectedIdx: -1, isCorrect: step.inferred ? null : false };
  }
  state.stepIdx = state.steps.length;
  state.completed = true;
  finalizeMorphStepAttempt(card, state);
  renderCard();
  renderProgress();
  saveState();
}

function finalizeMorphStepAttempt(card, state) {
  if (!card || !card.lemma) return;
  const dims = {};
  state.steps.forEach((step, idx) => {
    if (step.inferred) return; // ungraded — don't contribute to per-dim stats
    const ans = state.answers[idx];
    // Steps left unanswered because a structural impossibility ended the
    // walk early aren't graded — the form doesn't exist, so person/number
    // couldn't have been asked.
    if (!ans) return;
    dims[step.key] = ans && ans.isCorrect ? 1 : 0;
  });
  if (!runtime.paradigmStepStats || typeof runtime.paradigmStepStats !== 'object') {
    runtime.paradigmStepStats = { byLemma: {} };
  }
  recordParadigmAttempt(runtime.paradigmStepStats, card.lemma, dims, {
    cardId: card.id
  });
}

function getModeDescription() {
  if (isMorphologyMode()) return 'Grammar Quiz';
  if (isParsingMode()) return 'Step-by-step Parsing';
  if (isReaderMode()) return 'Reader';
  return 'Vocabulary Flashcards';
}

function resolveThemeMode(mode = runtime.themeMode) {
  if (mode === 'light' || mode === 'dark') return mode;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function applyThemeMode(mode = runtime.themeMode, persist = true) {
  runtime.themeMode = mode === 'light' || mode === 'dark' ? mode : 'system';
  const resolved = resolveThemeMode(runtime.themeMode);
  document.documentElement.setAttribute('data-theme', resolved);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', resolved === 'light' ? '#f4efe3' : '#0e0f14');

  const storage = getStorage();
  if (persist && storage) storage.setItem(THEME_STORAGE_KEY, runtime.themeMode);
  syncThemeButtons();
}

function syncThemeButtons() {
  const systemBtn = document.getElementById('themeSystemBtn');
  const darkBtn = document.getElementById('themeDarkBtn');
  const lightBtn = document.getElementById('themeLightBtn');
  if (systemBtn) systemBtn.classList.toggle('active', runtime.themeMode === 'system');
  if (darkBtn) darkBtn.classList.toggle('active', runtime.themeMode === 'dark');
  if (lightBtn) lightBtn.classList.toggle('active', runtime.themeMode === 'light');
}

function setThemeMode(mode) {
  applyThemeMode(mode, true);
}

function initializeThemeMode() {
  const storage = getStorage();
  const savedMode = storage ? storage.getItem(THEME_STORAGE_KEY) : null;
  runtime.themeMode = savedMode === 'light' || savedMode === 'dark' || savedMode === 'system' ? savedMode : 'system';
  applyThemeMode(runtime.themeMode, false);

  if (window.matchMedia) {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (runtime.themeMode === 'system') applyThemeMode('system', false);
    };
    if (typeof media.addEventListener === 'function') media.addEventListener('change', handleChange);
    else if (typeof media.addListener === 'function') media.addListener(handleChange);
  }
}

const FONT_FAMILY_OPTIONS = ['serif', 'sans'];
const TEXT_SIZE_OPTIONS = ['medium', 'large', 'x-large'];

function applyFontFamily(value = runtime.fontFamily, persist = true) {
  runtime.fontFamily = FONT_FAMILY_OPTIONS.includes(value) ? value : 'serif';
  document.documentElement.setAttribute('data-font-family', runtime.fontFamily);
  const storage = getStorage();
  if (persist && storage) storage.setItem(FONT_FAMILY_STORAGE_KEY, runtime.fontFamily);
  syncFontFamilyButtons();
}

function syncFontFamilyButtons() {
  const serifBtn = document.getElementById('fontSerifBtn');
  const sansBtn = document.getElementById('fontSansBtn');
  if (serifBtn) serifBtn.classList.toggle('active', runtime.fontFamily === 'serif');
  if (sansBtn) sansBtn.classList.toggle('active', runtime.fontFamily === 'sans');
}

function setFontFamily(value) {
  applyFontFamily(value, true);
}

function initializeFontFamily() {
  const storage = getStorage();
  const saved = storage ? storage.getItem(FONT_FAMILY_STORAGE_KEY) : null;
  runtime.fontFamily = FONT_FAMILY_OPTIONS.includes(saved) ? saved : 'serif';
  applyFontFamily(runtime.fontFamily, false);
}

function applyTextSize(value = runtime.textSize, persist = true) {
  runtime.textSize = TEXT_SIZE_OPTIONS.includes(value) ? value : 'medium';
  document.documentElement.setAttribute('data-text-size', runtime.textSize);
  const storage = getStorage();
  if (persist && storage) storage.setItem(TEXT_SIZE_STORAGE_KEY, runtime.textSize);
  syncTextSizeButtons();
}

function syncTextSizeButtons() {
  const map = {
    'medium': 'textSizeMediumBtn',
    'large': 'textSizeLargeBtn',
    'x-large': 'textSizeXLargeBtn'
  };
  for (const [size, id] of Object.entries(map)) {
    const btn = document.getElementById(id);
    if (btn) btn.classList.toggle('active', runtime.textSize === size);
  }
}

function setTextSize(value) {
  applyTextSize(value, true);
}

function initializeTextSize() {
  const storage = getStorage();
  const saved = storage ? storage.getItem(TEXT_SIZE_STORAGE_KEY) : null;
  runtime.textSize = TEXT_SIZE_OPTIONS.includes(saved) ? saved : 'medium';
  applyTextSize(runtime.textSize, false);
}

// Populate the parsing-mode chapter dropdown (1..20) and reflect the
// current runtime.parsingChapter. Only relevant in parsing mode — the
// row is hidden elsewhere by syncLayoutVisibility.
function syncParsingChapterUi() {
  const select = document.getElementById('parsingChapterSelect');
  if (!select) return;
  if (!isParsingMode()) return;
  const chapter = getParsingChapter();
  if (!select.options.length) {
    const opts = [];
    for (let ch = 1; ch <= 20; ch++) {
      opts.push(`<option value="${ch}">Chapter ${ch}</option>`);
    }
    select.innerHTML = opts.join('');
  }
  select.value = String(chapter);
}

// Populate the primary focused-paradigm dropdown from the current selection
// when parsing mode is active, and resync runtime.morphFocusedParadigm if
// the current pick is no longer available (e.g. user changed chapters).
function syncParadigmFocusUi() {
  const select = document.getElementById('paradigmFocusSelectPrimary');
  if (!select) return;
  if (!isParsingMode()) return;
  const aggregateKeys = getAggregateSelectionKeys();
  // Stem-recall drills ("Second-aorist stems", "Liquid-stem futures") have no
  // parse dimensions, so they stay in the dropdown as stem-recall links that
  // render a redirect card to the matching flip-card supplemental (see
  // PARSING_INCOMPATIBLE_LEMMAS in render.js). The parseable liquid-future
  // paradigms (μένω, κρίνω) are listed separately under "Verbs · liquid
  // future", so nothing needs hiding or substituting here.
  const PARSING_DROPDOWN_SUBSTITUTIONS = {};
  const isHiddenFromParsing = (lemma) => Object.prototype.hasOwnProperty.call(PARSING_DROPDOWN_SUBSTITUTIONS, lemma);
  const available = listAvailableParadigms(aggregateKeys).filter((p) => !isHiddenFromParsing(p.lemma));
  if (!available.length) {
    select.innerHTML = '<option value="">No paradigms in current selection</option>';
    select.value = '';
    return;
  }
  const currentValue = runtime.morphFocusedParadigm;
  const substitutedCurrent = isHiddenFromParsing(currentValue)
    ? PARSING_DROPDOWN_SUBSTITUTIONS[currentValue]
    : currentValue;
  const stillAvailable = substitutedCurrent && available.some((p) => p.lemma === substitutedCurrent);
  const chosen = stillAvailable ? substitutedCurrent : available[0].lemma;
  if (chosen !== currentValue) {
    runtime.morphFocusedParadigm = chosen;
    rebuildMorphDeckForStepMode();
  }
  // Render with native <optgroup>s — categories like "Verbs · standard
  // ω-pattern" head sections of lemmas, so the user can scan by paradigm
  // type instead of reading a flat alphabetical list.
  const grouped = listAvailableParadigmsByCategory(aggregateKeys)
    .map((g) => ({ category: g.category, lemmas: g.lemmas.filter((p) => !isHiddenFromParsing(p.lemma)) }))
    .filter((g) => g.lemmas.length);
  select.innerHTML = grouped.map((g) => {
    const opts = g.lemmas
      .map((p) => `<option value="${escapeAttr(p.lemma)}">${escapeAttr(p.displayLabel)}</option>`)
      .join('');
    return `<optgroup label="${escapeAttr(g.category)}">${opts}</optgroup>`;
  }).join('');
  select.value = chosen;
}

function escapeAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function syncToggleButtons() {
  const requiredSwitch  = document.getElementById('requiredBtn');
  const shuffleSwitch   = document.getElementById('shuffleBtn');
  const directionSwitch = document.getElementById('directionBtn');
  const spacedSwitch    = document.getElementById('spacedBtn');
  const hardReviewSwitch = document.getElementById('hardReviewBtn');
  const splitSelectionSwitch = document.getElementById('splitSelectionBtn');
  const selfCheckBtn    = document.getElementById('selfCheckBtn');
  const aspectStepSwitch = document.getElementById('aspectStepBtn');
  const DIM_TOGGLE_KEYS = ['tense', 'voice', 'mood', 'person', 'number', 'case', 'gender'];
  const dimStepSwitches = Object.fromEntries(DIM_TOGGLE_KEYS.map(k => [k, document.getElementById(`${k}StepBtn`)]));
  const dimStepToggles = Object.fromEntries(DIM_TOGGLE_KEYS.map(k => [k, document.getElementById(`${k}StepToggle`)]));
  const optionalFormsSwitch = document.getElementById('optionalFormsBtn');
  const optionalFormsToggle = document.getElementById('optionalFormsToggle');
  const OPTIONAL_FILTER_KEYS = ['imperative', 'subjunctive', 'infinitive', 'participle', 'thirdPerson', 'futureTense', 'perfectTense'];
  const optionalFilterSwitches = Object.fromEntries(OPTIONAL_FILTER_KEYS.map(k => [k, document.getElementById(`optionalFilter_${k}_Btn`)]));
  const optionalFilterToggles  = Object.fromEntries(OPTIONAL_FILTER_KEYS.map(k => [k, document.getElementById(`optionalFilter_${k}_Toggle`)]));
  // Per-value sub-filters under each parsing dim. Keys mirror DIM_VALUE_FILTER_VALUES
  // in navigation.js; the IDs are dimValueFilter_<dim>_<value>_Toggle/Btn.
  // Aspect's 'continuousUndefined' is a UI-only key — flipping it sets BOTH
  // dimValueFilters.aspect.continuous and .undefined to the same state.
  const DIM_VALUE_FILTER_VALUES = {
    aspect: ['continuousUndefined', 'completed'],
    tense:  ['present', 'future', 'imperfect', 'aorist', 'perfect', 'pluperfect'],
    voice:  ['active', 'middle', 'passive'],
    mood:   ['indicative', 'subjunctive', 'imperative', 'infinitive', 'participle'],
    person: ['first', 'second', 'third'],
    number: ['singular', 'plural'],
    case:   ['nominative', 'accusative', 'genitive', 'dative', 'vocative'],
    gender: ['masculine', 'feminine', 'neuter']
  };
  // Same UI-key → underlying-canonical-value mapping as
  // dimFilterUnderlyingValues in navigation.js. Kept inline rather than
  // imported so syncToggleButtons doesn't pull in navigation.js's deck
  // rebuild logic just to read a label.
  const dimFilterUnderlying = (dim, value) => (
    (dim === 'aspect' && value === 'continuousUndefined') ? ['continuous', 'undefined'] : [value]
  );
  const dailyResetSwitch = document.getElementById('unspacedDailyResetBtn');
  const shuffleToggle   = document.getElementById('shuffleToggle');
  const requiredToggle  = document.getElementById('requiredToggle');
  const directionToggle = document.getElementById('directionToggle');
  const spacedToggle    = document.getElementById('spacedToggle');
  const hardReviewToggle = document.getElementById('hardReviewToggle');
  const splitSelectionToggle = document.getElementById('splitSelectionToggle');
  const selfCheckToggle = document.getElementById('selfCheckToggle');
  const aspectStepToggle = document.getElementById('aspectStepToggle');
  const dailyResetToggle = document.getElementById('unspacedDailyResetToggle');
  const modeVocabBtn    = document.getElementById('modeVocabBtn');
  const modeMorphBtn    = document.getElementById('modeMorphBtn');
  const modeReaderBtn   = document.getElementById('modeReaderBtn');
  const modeShortcutVocabBtn = document.getElementById('modeShortcutVocabBtn');
  const modeShortcutMorphBtn = document.getElementById('modeShortcutMorphBtn');
  const modeShortcutReaderBtn = document.getElementById('modeShortcutReaderBtn');
  const resetDeckBtn = document.getElementById('resetDeckBtn');

  if (shuffleSwitch)   shuffleSwitch.classList.toggle('on',   !!runtime.shuffled);
  if (requiredSwitch)  requiredSwitch.classList.toggle('on',  !!runtime.requiredOnly);
  if (directionSwitch) directionSwitch.classList.toggle('on', !!runtime.directionToGreek);
  if (spacedSwitch)    spacedSwitch.classList.toggle('on',    !!runtime.spacedRepetition);
  if (hardReviewSwitch) hardReviewSwitch.classList.toggle('on', !!runtime.hardVocabReviewMode);
  const stemNotesSwitch = document.getElementById('stemNotesBtn');
  if (stemNotesSwitch) stemNotesSwitch.classList.toggle('on', runtime.stemNotes !== false);
  const stemNotesToggleEl = document.getElementById('stemNotesToggle');
  if (stemNotesToggleEl) stemNotesToggleEl.setAttribute('aria-checked', runtime.stemNotes !== false ? 'true' : 'false');
  const secondAoristCardsSwitch = document.getElementById('secondAoristCardsBtn');
  if (secondAoristCardsSwitch) secondAoristCardsSwitch.classList.toggle('on', !!runtime.secondAoristCards);
  const secondAoristCardsToggleEl = document.getElementById('secondAoristCardsToggle');
  if (secondAoristCardsToggleEl) secondAoristCardsToggleEl.setAttribute('aria-checked', runtime.secondAoristCards ? 'true' : 'false');
  if (splitSelectionSwitch) splitSelectionSwitch.classList.toggle('on', !!runtime.splitSelection);
  if (selfCheckBtn)    selfCheckBtn.classList.toggle('on',    !!runtime.morphSelfCheck && isMorphologyMode());
  if (aspectStepSwitch) aspectStepSwitch.classList.toggle('on', runtime.aspectStep !== false);
  DIM_TOGGLE_KEYS.forEach(k => {
    const sw = dimStepSwitches[k];
    const on = !runtime.dimToggles || runtime.dimToggles[k] !== false;
    if (sw) sw.classList.toggle('on', on);
  });
  if (optionalFormsSwitch) optionalFormsSwitch.classList.toggle('on', !!runtime.includeOptionalForms);
  OPTIONAL_FILTER_KEYS.forEach((k) => {
    const sw = optionalFilterSwitches[k];
    const on = !runtime.optionalFormFilters || runtime.optionalFormFilters[k] !== false;
    if (sw) sw.classList.toggle('on', on);
  });
  const excludeKnownMorphsSwitch = document.getElementById('excludeKnownMorphsBtn');
  if (excludeKnownMorphsSwitch) excludeKnownMorphsSwitch.classList.toggle('on', !!runtime.excludeKnownMorphs);
  const excludeKnownMorphsToggle = document.getElementById('excludeKnownMorphsToggle');
  if (excludeKnownMorphsToggle) excludeKnownMorphsToggle.setAttribute('aria-checked', runtime.excludeKnownMorphs ? 'true' : 'false');
  const parsingReverseSwitch = document.getElementById('parsingReverseBtn');
  if (parsingReverseSwitch) parsingReverseSwitch.classList.toggle('on', !!runtime.parsingReverse);
  const parsingReverseToggle = document.getElementById('parsingReverseToggle');
  if (parsingReverseToggle) parsingReverseToggle.setAttribute('aria-checked', runtime.parsingReverse ? 'true' : 'false');
  const accentLookalikeSwitch = document.getElementById('accentLookalikeBtn');
  if (accentLookalikeSwitch) accentLookalikeSwitch.classList.toggle('on', !!runtime.accentLookalikes);
  const accentLookalikeToggle = document.getElementById('accentLookalikeToggle');
  if (accentLookalikeToggle) accentLookalikeToggle.setAttribute('aria-checked', runtime.accentLookalikes ? 'true' : 'false');
  // The toggles read as "Exclude X" — ON in the UI means the value is
  // excluded (sub[value] === false in the model). Default is all values
  // included → all toggles OFF in the UI.
  Object.keys(DIM_VALUE_FILTER_VALUES).forEach((dim) => {
    DIM_VALUE_FILTER_VALUES[dim].forEach((value) => {
      const sw = document.getElementById(`dimValueFilter_${dim}_${value}_Btn`);
      const sub = runtime.dimValueFilters && runtime.dimValueFilters[dim];
      const underlying = dimFilterUnderlying(dim, value);
      // For grouped UI keys (aspect's continuousUndefined → continuous +
      // undefined) the toggle reads as ON when EVERY underlying value is
      // excluded; a partial state shouldn't read as "fully excluded".
      const on = !!sub && underlying.every((u) => sub[u] === false);
      if (sw) sw.classList.toggle('on', on);
      const t = document.getElementById(`dimValueFilter_${dim}_${value}_Toggle`);
      if (t) t.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  });
  syncParsingChapterUi();
  syncParadigmFocusUi();
  if (dailyResetSwitch) dailyResetSwitch.classList.toggle('on', !!runtime.unspacedAutoResetEnabled);
  if (shuffleToggle)   shuffleToggle.setAttribute('aria-checked',   runtime.shuffled ? 'true' : 'false');
  if (requiredToggle)  requiredToggle.setAttribute('aria-checked',  runtime.requiredOnly ? 'true' : 'false');
  if (directionToggle) directionToggle.setAttribute('aria-checked', runtime.directionToGreek ? 'true' : 'false');
  if (spacedToggle)    spacedToggle.setAttribute('aria-checked',    runtime.spacedRepetition ? 'true' : 'false');
  if (hardReviewToggle) hardReviewToggle.setAttribute('aria-checked', runtime.hardVocabReviewMode ? 'true' : 'false');
  if (splitSelectionToggle) splitSelectionToggle.setAttribute('aria-checked', runtime.splitSelection ? 'true' : 'false');
  if (selfCheckToggle) selfCheckToggle.setAttribute('aria-checked', (runtime.morphSelfCheck && isMorphologyMode()) ? 'true' : 'false');
  if (aspectStepToggle) aspectStepToggle.setAttribute('aria-checked', runtime.aspectStep !== false ? 'true' : 'false');
  DIM_TOGGLE_KEYS.forEach(k => {
    const t = dimStepToggles[k];
    const on = !runtime.dimToggles || runtime.dimToggles[k] !== false;
    if (t) t.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  if (optionalFormsToggle) optionalFormsToggle.setAttribute('aria-checked', runtime.includeOptionalForms ? 'true' : 'false');
  OPTIONAL_FILTER_KEYS.forEach((k) => {
    const t = optionalFilterToggles[k];
    const on = !runtime.optionalFormFilters || runtime.optionalFormFilters[k] !== false;
    if (t) t.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  if (dailyResetToggle) dailyResetToggle.setAttribute('aria-checked', runtime.unspacedAutoResetEnabled ? 'true' : 'false');

  if (directionToggle) {
    const directionLabel = directionToggle.querySelector('.toggle-text');
    if (directionLabel) {
      directionLabel.textContent = isMorphologyMode()
        ? 'English → Greek'
        : 'Eng → Gk';
    }
  }
  if (modeVocabBtn)    modeVocabBtn.classList.toggle('active', runtime.studyMode === 'vocab');
  if (modeMorphBtn)    modeMorphBtn.classList.toggle('active', runtime.studyMode === 'morph');
  if (modeReaderBtn)   modeReaderBtn.classList.toggle('active', runtime.studyMode === 'reader');
  if (modeShortcutVocabBtn) modeShortcutVocabBtn.classList.toggle('active', runtime.studyMode === 'vocab');
  if (modeShortcutMorphBtn) modeShortcutMorphBtn.classList.toggle('active', runtime.studyMode === 'morph');
  const modeShortcutParsingBtn = document.getElementById('modeShortcutParsingBtn');
  if (modeShortcutParsingBtn) modeShortcutParsingBtn.classList.toggle('active', runtime.studyMode === 'parsing');
  if (modeShortcutReaderBtn) modeShortcutReaderBtn.classList.toggle('active', runtime.studyMode === 'reader');
  syncThemeButtons();
  if (resetDeckBtn) {
    resetDeckBtn.textContent = runtime.spacedRepetition ? 'Reset spaced' : 'Reset unspaced';
    resetDeckBtn.title = runtime.spacedRepetition
      ? 'Choose to set every card due now or fully reset SRS progress for this deck'
      : 'Reset unspaced marks for this deck only';
  }
  // Reset deck/required don't apply in parsing mode (no SRS, no
  // required/supplemental split — parsing's record is the per-form recent
  // attempts). Swap both for a single "Reset known" that drops every
  // form's per-form tally back to 0/2 (per-paradigm history kept).
  const resetRequiredBtn = document.getElementById('resetRequiredBtn');
  const resetKnownBtn = document.getElementById('resetKnownBtn');
  const clearParsingStatsBtn = document.getElementById('clearParsingStatsBtn');
  const parsing = isParsingMode();
  if (resetDeckBtn) resetDeckBtn.style.display = parsing ? 'none' : '';
  if (resetRequiredBtn) resetRequiredBtn.style.display = parsing ? 'none' : '';
  if (resetKnownBtn) resetKnownBtn.style.display = parsing ? '' : 'none';
  // "Clear parsing stats" is parsing-mode-only — it wipes runtime.paradigmStepStats
  // and nothing else, so it's meaningless (and hidden) in vocab/morph/reader.
  if (clearParsingStatsBtn) clearParsingStatsBtn.style.display = parsing ? '' : 'none';

  const subtitle = document.getElementById('appSubtitle');
  if (subtitle) subtitle.textContent = getModeDescription();

  syncLayoutVisibility();
}

function syncLayoutVisibility() {
  const controlsBar = document.getElementById('controlsBar');
  const navRow = document.getElementById('navRow');
  const markRow = document.getElementById('markRow');
  const ffRow = document.getElementById('ffRow');
  const prevBtn = navRow ? navRow.querySelector('.nav-prev') : null;
  const nextBtn = navRow ? navRow.querySelector('.nav-next') : null;
  const undoBtn = document.getElementById('spacedUndoBtn');
  const navResetBtn = document.getElementById('navResetBtn');
  const directionToggle = document.getElementById('directionToggle');
  const requiredToggle = document.getElementById('requiredToggle');
  const hardReviewToggle = document.getElementById('hardReviewToggle');
  const splitSelectionToggle = document.getElementById('splitSelectionToggle');
  const selfCheckToggle = document.getElementById('selfCheckToggle');
  const shuffleToggle = document.getElementById('shuffleToggle');
  const spacedToggle = document.getElementById('spacedToggle');
  const dailyResetToggle = document.getElementById('unspacedDailyResetToggle');
  const modeGroup = document.querySelector('.mode-group[aria-label="Study mode"]');
  const cardArea = document.getElementById('cardArea');
  const reviewShell = document.querySelector('.review-shell');
  const cardMode = isCardStudyMode();
  const reviewDeckMode = isReviewDeckMode();

  if (controlsBar) controlsBar.style.display = 'flex';
  if (cardArea) cardArea.style.display = cardMode ? '' : 'none';
  if (reviewShell) reviewShell.style.display = reviewDeckMode ? '' : 'none';
  if (navRow) navRow.style.display = reviewDeckMode && runtime.selectedKeys.length ? 'flex' : 'none';
  if (markRow) markRow.style.display = reviewDeckMode && runtime.selectedKeys.length && !isMorphologyMode() && !isParsingMode() ? 'flex' : 'none';
  if (ffRow) ffRow.style.display = reviewDeckMode && runtime.selectedKeys.length && runtime.spacedRepetition && !isParsingMode() ? 'flex' : 'none';
  if (directionToggle) directionToggle.style.display = (runtime.studyMode === 'vocab' || runtime.studyMode === 'morph') ? 'flex' : 'none';
  if (requiredToggle) requiredToggle.style.display = runtime.studyMode === 'vocab' ? 'flex' : 'none';
  if (hardReviewToggle) hardReviewToggle.style.display = runtime.studyMode === 'vocab' ? 'flex' : 'none';
  // Stem & declension notes annotate standard vocab cards only.
  const stemNotesToggleVis = document.getElementById('stemNotesToggle');
  if (stemNotesToggleVis) stemNotesToggleVis.style.display = runtime.studyMode === 'vocab' ? 'flex' : 'none';
  // Second-aorists-as-cards expands the vocab deck only.
  const secondAoristCardsToggleVis = document.getElementById('secondAoristCardsToggle');
  if (secondAoristCardsToggleVis) secondAoristCardsToggleVis.style.display = runtime.studyMode === 'vocab' ? 'flex' : 'none';
  // Split vocab/grammar selection only makes sense between vocab and morph;
  // parsing mode owns its chapter via the dedicated dropdown, so hide the
  // toggle there entirely.
  if (splitSelectionToggle) splitSelectionToggle.style.display = (canAccessGrammarUi() && !isParsingMode()) ? 'flex' : 'none';
  if (selfCheckToggle) selfCheckToggle.style.display = (isMorphologyMode() && canAccessGrammarUi()) ? 'flex' : 'none';
  // Parsing options apply only to parsing mode — keep them out of the
  // vocab / grammar / reader Advanced-settings panels where they have no
  // effect and would just clutter the UI.
  const parsingOptionsDetails = document.getElementById('parsingOptionsDetails');
  if (parsingOptionsDetails) parsingOptionsDetails.style.display = isParsingMode() ? '' : 'none';
  const parsingChapterRow = document.getElementById('parsingChapterRow');
  if (parsingChapterRow) parsingChapterRow.style.display = isParsingMode() ? 'flex' : 'none';
  const paradigmFocusRowPrimary = document.getElementById('paradigmFocusRowPrimary');
  if (paradigmFocusRowPrimary) paradigmFocusRowPrimary.style.display = isParsingMode() ? 'flex' : 'none';
  if (shuffleToggle) shuffleToggle.style.display = reviewDeckMode ? 'flex' : 'none';
  // Exclude-known-morphs is a parsing-only filter on the deck pool —
  // promoted from inside Parsing options to a top-level toggle next to
  // Shuffle so it's reachable without expanding the per-dim section.
  const excludeKnownMorphsToggle = document.getElementById('excludeKnownMorphsToggle');
  if (excludeKnownMorphsToggle) excludeKnownMorphsToggle.style.display = isParsingMode() ? 'flex' : 'none';
  const parsingReverseToggle = document.getElementById('parsingReverseToggle');
  if (parsingReverseToggle) parsingReverseToggle.style.display = isParsingMode() ? 'flex' : 'none';
  // Accent/breathing look-alike distractors only do anything in the reverse
  // drill, so the toggle only shows once English → Greek is on.
  const accentLookalikeToggle = document.getElementById('accentLookalikeToggle');
  if (accentLookalikeToggle) accentLookalikeToggle.style.display = (isParsingMode() && runtime.parsingReverse) ? 'flex' : 'none';
  // Spaced repetition writes confidence stats — parsing mode is explicitly
  // off-the-record, so the toggle is irrelevant there and gets hidden.
  if (spacedToggle) spacedToggle.style.display = (reviewDeckMode && !isParsingMode()) ? 'flex' : 'none';
  if (dailyResetToggle) dailyResetToggle.style.display = (reviewDeckMode && !runtime.spacedRepetition && runtime.studyMode === 'vocab') ? 'flex' : 'none';
  if (modeGroup) modeGroup.style.display = canAccessGrammarUi() ? 'inline-flex' : 'none';
  if (!reviewDeckMode) return;
  const unspacedVocab = !runtime.spacedRepetition && !isMorphologyMode();
  const unspacedHistoryTop = unspacedVocab ? getUnspacedHistoryTopType() : null;
  const unspacedHasHistory = !!unspacedHistoryTop;
  if (prevBtn) {
    // Spaced/morph keep their dedicated Undo button (Prev stays hidden).
    // Parsing mode is off-the-record and only supports Skip card → Next,
    // so Prev is hidden there too. In unspaced vocab Prev is always
    // present — a constant anchor in the nav row — and walks the history
    // stack. Label flips to "↶ Undo" when the next pop will roll back a
    // confidence-impacting mark so the user sees the warning at exactly
    // that step. The button is functionally disabled (CSS keeps the
    // Reset-like swatch instead of greying out) when there's nothing to
    // undo or step back.
    const atStart = !runtime.deck.length || runtime.currentIdx <= 0;
    const hidePrev = isMorphologyMode() || isParsingMode() || (runtime.spacedRepetition && !isMorphologyMode());
    prevBtn.style.display = hidePrev ? 'none' : '';
    const prevDisabled = unspacedVocab ? (!unspacedHasHistory && atStart) : atStart;
    prevBtn.disabled = prevDisabled;
    prevBtn.classList.toggle('nav-disabled', prevDisabled);
    if (unspacedVocab) {
      prevBtn.textContent = unspacedHistoryTop === 'mark' ? '↶ Undo' : '← Prev';
    } else {
      prevBtn.textContent = '← Prev';
    }
  }
  if (undoBtn) {
    const morphUndoActive = isMorphologyMode() && runtime.morphAnswerState.answered && !!runtime.spacedUndoSnapshot;
    const vocabUndoActive = runtime.spacedRepetition && !isMorphologyMode() && !!runtime.spacedUndoSnapshot;
    // Unspaced now routes undo through the Prev button, so the separate
    // Undo control only shows for spaced/morph.
    undoBtn.style.display = (morphUndoActive || vocabUndoActive) ? '' : 'none';
  }
  if (navResetBtn) {
    // Unspaced vocab keeps the inline Reset visible at all times so the
    // user has a one-tap escape from the all-archived "Session Confirmed"
    // state without Next having to morph. Parsing mode has nothing to
    // reset (no SRS, no archive — each card is one walk), so the button
    // is hidden there even when unspaced.
    navResetBtn.style.display = unspacedVocab && !isParsingMode() && runtime.selectedKeys.length > 0 ? '' : 'none';
  }
  if (nextBtn) {
    if (isParsingMode()) {
      // Parsing has no SRS/confidence writes. Mid-walk, Next doubles as the
      // "skip this card without recording stats" action (the standalone
      // skip-card button was removed since pressing it had the same effect
      // as advancing here). After the walk completes, stats are already
      // written so the label reverts to plain Next.
      const stepState = runtime.morphStepState;
      const midWalk = !!(stepState && Array.isArray(stepState.steps) && stepState.steps.length > 0 && !stepState.completed);
      nextBtn.textContent = midWalk ? 'Skip card →' : 'Next →';
      nextBtn.classList.remove('spaced-again', 'nav-next-as-reset');
    } else if (isMorphologyMode()) {
      // Grammar has no SRS/confidence writes, so the "Again →" semantic
      // doesn't apply — Next is just "advance to the next card".
      nextBtn.textContent = 'Next →';
      nextBtn.classList.remove('spaced-again', 'nav-next-as-reset');
    } else if (runtime.spacedRepetition) {
      nextBtn.textContent = 'Again →';
      nextBtn.classList.toggle('spaced-again', true);
      nextBtn.classList.remove('nav-next-as-reset');
    } else {
      nextBtn.textContent = 'Next →';
      nextBtn.classList.remove('spaced-again', 'nav-next-as-reset');
    }
  }

}

function ensureUsageStats(stats = runtime.appUsageStats) {
  const safe = sanitizeUsageStats(stats, MAX_STUDY_SESSION_HISTORY);
  if (stats !== safe) runtime.appUsageStats = safe;
  return safe;
}

function accumulateUsageTime(now = Date.now()) {
  const usage = ensureUsageStats();
  return accumulateUsageTimeForStats(usage, now);
}

function accumulateActiveStudyTime(now = Date.now()) {
  const usage = ensureUsageStats();
  return accumulateActiveStudyTimeForStats(usage, STUDY_IDLE_MS, now);
}

function finalizeStudySession(now = Date.now()) {
  const usage = ensureUsageStats();
  finalizeStudySessionForStats(usage, STUDY_IDLE_MS, MAX_STUDY_SESSION_HISTORY, now);
}

function noteStudyInteraction(now = Date.now()) {
  const usage = ensureUsageStats();
  noteStudyInteractionForStats(usage, {
    now,
    documentHidden: document.hidden,
    hasSelectedCards: runtime.selectedKeys.length > 0,
    studyIdleMs: STUDY_IDLE_MS,
    studySessionBreakMs: STUDY_SESSION_BREAK_MS,
    maxStudySessionHistory: MAX_STUDY_SESSION_HISTORY
  });
  // Session-boundary clock for the three-deck flow. Snapshot the previous
  // value into previousStudyActivityAt BEFORE updating lastStudyActivityAt,
  // so buildStudyDeck (called later in the same flip handler) sees the
  // timestamp of the PREVIOUS activity, not the one we just recorded. Any
  // study event (vocab mark, grammar mark, reader interaction) updates
  // both; persistence saves lastStudyActivityAt to gate session-state
  // restore across reloads.
  if (!document.hidden) {
    runtime.previousStudyActivityAt = runtime.lastStudyActivityAt || 0;
    runtime.lastStudyActivityAt = now;
  }
}

function getTodayUsageMs() {
  const usage = ensureUsageStats();
  return getUsageMsForDay(usage, getUsageDayKey());
}

function getTodayActiveStudyMs() {
  const usage = ensureUsageStats();
  return getActiveStudyMsForDay(usage, getUsageDayKey());
}

function updateUsageMeta() {
  const el = document.getElementById('progressMeta');
  if (!el) return;
  const usage = ensureUsageStats();
  el.textContent = `Today ${formatUsageDuration(getTodayActiveStudyMs())} · Study ${formatUsageDuration(usage.activeStudyMs)} · Total ${formatUsageDuration(usage.totalMs)}`;
}

function startUsageTracking() {
  ensureUsageStats();
  if (!document.hidden && !runtime.appUsageStats.lastActiveAt) {
    runtime.appUsageStats.lastActiveAt = Date.now();
  }

  if (!runtime.usageVisibilityBound) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const now = Date.now();
        accumulateUsageTime(now);
        finalizeStudySession(now);
        runtime.appUsageStats.lastActiveAt = 0;
        updateUsageMeta();
        saveState();
      } else {
        runtime.appUsageStats.lastActiveAt = Date.now();
        updateUsageMeta();
        maybeAutoResetUnspacedArchivesAndRefresh();
      }
    });

    window.addEventListener('pagehide', () => {
      const now = Date.now();
      accumulateUsageTime(now);
      finalizeStudySession(now);
      runtime.appUsageStats.lastActiveAt = 0;
      saveState();
    });

    runtime.usageVisibilityBound = true;
  }

  if (!runtime.usageTickHandle) {
    runtime.usageTickHandle = window.setInterval(() => {
      if (document.hidden) return;
      const now = Date.now();
      const delta = accumulateUsageTime(now);
      const activeDelta = accumulateActiveStudyTime(now);
      if (delta > 0 || activeDelta > 0) {
        updateUsageMeta();
        if (isAnalyticsModalOpen()) renderAnalyticsOverlay();
        runtime.usageTickCounter += 1;
        if (runtime.usageTickCounter >= 4) {
          runtime.usageTickCounter = 0;
          saveState();
        }
      }
    }, 15000);
  }
}


// ── Unspaced cycle state helpers (state-coupled) ──

function resetUnspacedCycleState() {
  runtime.unspacedCycleState = {};
  runtime.unspacedDeferredIds = new Set();
  runtime.flipsSinceReshuffle = 0;
  runtime.lastPeriodicReshuffleAt = 0;
}

// Stamp the current archive day so subsequent auto-reset checks know the
// "current batch" started today. Called whenever an archive (Easy mark in
// unspaced vocab) is created.
function noteUnspacedArchiveActivity() {
  runtime.lastUnspacedArchiveDayKey = getUnspacedArchiveDayKey();
}

// Clears all unspaced 'known' marks across g2e and e2g when the local
// archive-day key has rolled past the 5 AM cutoff since the last archive
// activity. Morph marks are untouched. Returns true if anything was
// cleared so callers can rebuild the active deck.
function maybeAutoResetUnspacedArchives() {
  if (!runtime.unspacedAutoResetEnabled) return false;
  const todayKey = getUnspacedArchiveDayKey();
  const lastKey = runtime.lastUnspacedArchiveDayKey || '';
  if (!lastKey) {
    runtime.lastUnspacedArchiveDayKey = todayKey;
    return false;
  }
  if (lastKey === todayKey) return false;

  ensureDirectionalStores();
  let didClear = false;
  ['g2e', 'e2g'].forEach(dirKey => {
    const bucket = runtime.globalWordMarks[dirKey];
    if (!bucket) return;
    Object.keys(bucket).forEach(cardId => {
      if (bucket[cardId] === 'known') {
        delete bucket[cardId];
        didClear = true;
      }
    });
  });
  runtime.lastUnspacedArchiveDayKey = todayKey;
  runtime.marks = getDirectionalMarksStore();
  return didClear;
}

// Wrapper that runs the auto-reset and, if it actually cleared archives,
// rebuilds the active vocab unspaced deck + repaints so the freshly
// restored cards show up immediately.
function maybeAutoResetUnspacedArchivesAndRefresh() {
  const didClear = maybeAutoResetUnspacedArchives();
  if (!didClear) return;
  if (!runtime.selectedKeys.length) return;
  if (runtime.spacedRepetition || isMorphologyMode()) return;
  runtime.deck = buildStudyDeck(runtime.originalDeck);
  runtime.currentIdx = 0;
  runtime.isFlipped = false;
  resetMorphAnswerState();
  renderCard();
  renderProgress();
  renderReview();
  saveState();
}

function getUnspacedCycleEntry(cardId) {
  if (!runtime.unspacedCycleState[cardId] || typeof runtime.unspacedCycleState[cardId] !== 'object') {
    runtime.unspacedCycleState[cardId] = { wrongThisCycle: false, correctCount: 0, lastOutcome: null };
  }
  return runtime.unspacedCycleState[cardId];
}

function applyUnspacedSharedSchedule(card, outcome, _reviewedAt = Date.now()) {
  // Unspaced reviews update only the unspaced cycle bookkeeping. The spaced
  // SRS schedule (progress.dueAt / intervalDays) is intentionally NOT touched
  // here, so flipping into spaced-repetition mode later finds untouched
  // schedules that reflect only previous spaced reviews.
  const cycleEntry = getUnspacedCycleEntry(card.id);
  const normalizedOutcome = outcome === 'easy' ? 'easy' : outcome === 'pass' ? 'pass' : 'again';

  if (normalizedOutcome === 'again') {
    cycleEntry.wrongThisCycle = true;
    cycleEntry.lastOutcome = 'again';
    return;
  }

  cycleEntry.correctCount += 1;
  cycleEntry.lastOutcome = normalizedOutcome;
}

// ── Card selection wrapper (state-coupled) ──

function getSelectedCards(keys) {
  if (isMorphologyMode()) {
    const cards = getSelectedGrammarCards(keys);
    if (isReverseGrammarActive()) {
      return cards.filter(card => card && card.reversible === true);
    }
    return cards;
  }
  // Parsing mode loads the focused paradigm's cards regardless of which
  // call path got us here (selectors.loadDeckFromKeys vs. restoreState).
  // selectors.js layers an extra override on top, but restoreState rebuilds
  // its own deck without that hook — so without this branch a fresh app
  // load in parsing mode would surface vocab cards until the user picks a
  // paradigm.
  if (isParsingMode()) {
    return buildFilteredFocusedParadigmCards();
  }
  const vocabCards = getSelectedVocabCards(keys, false);
  // "Second aorists as cards" (advanced settings, vocab-only, default off):
  // each second-aorist verb's aorist form joins the deck as its own card.
  return (runtime.secondAoristCards && runtime.studyMode === 'vocab')
    ? expandSecondAoristCards(vocabCards)
    : vocabCards;
}

// When the "Exclude known morphs" toggle is on, drop any card that already
// passes the strict 2/2 "known" threshold under the user's current dim
// toggles. When every form in the focused paradigm is known the deck goes
// empty on purpose — renderCard then shows the "paradigm mastered" empty
// state (see js/ui/render.js) instead of silently re-admitting the known
// forms, which is what made the toggle look broken: a fully-mastered
// paradigm kept surfacing its blue 2/2 cards.
function applyExcludeKnownMorphsFilter(cards) {
  if (!Array.isArray(cards) || !cards.length) return cards || [];
  if (!runtime.excludeKnownMorphs) return cards;
  const stats = runtime.paradigmStepStats || {};
  const enabledDims = getEnabledParsingDims();
  return cards.filter((c) => !isLemmaFormKnown(stats, c.lemma, c.id, enabledDims));
}

// The focused paradigm's in-scope, chapter-gated pool with the
// exclude-known-morphs filter applied — the single source of truth for what
// parsing mode should be drilling right now. Used at deck-build time
// (getFocusedParadigmCards / getSelectedCards) and at every parsing cycle
// boundary (rebuildParsingCycle), so a form that crossed the 2/2 "known"
// threshold mid-session drops out the moment the deck is next rebuilt.
function buildFilteredFocusedParadigmCards() {
  ensureMorphFocusedParadigm();
  if (!runtime.morphFocusedParadigm) return [];
  return applyExcludeKnownMorphsFilter(getCardsForFocusedParadigm(
    getAggregateSelectionKeys(),
    runtime.morphFocusedParadigm,
    {
      includeOptional: !!runtime.includeOptionalForms,
      optionalFilters: runtime.optionalFormFilters,
      dimValueFilters: runtime.dimValueFilters
    }
  ));
}

// Rebuild the parsing deck for a fresh cycle. Unlike startNextCycle's generic
// 'remaining' path — which reshuffles the existing originalDeck and never
// re-runs the exclude-known filter — this re-derives the filtered focused
// pool so newly-mastered (2/2) forms are dropped. Honors the shuffle toggle
// and avoidHeadId so the just-shown card doesn't lead the new cycle. When the
// pool is empty (every form mastered), the deck drains and renderCard shows
// the "paradigm mastered" empty state.
function rebuildParsingCycle(options = {}) {
  const pool = buildFilteredFocusedParadigmCards();
  runtime.originalDeck = pool;
  const ordered = runtime.shuffled ? shuffleArray([...pool]) : [...pool];
  avoidHeadCollision(ordered, options.avoidHeadId);
  runtime.deck = ordered;
  runtime.activeDeckCount = ordered.length;
  runtime.currentIdx = ordered.length ? 0 : runtime.deck.length;
  runtime.unspacedPendingRecycle = false;
  resetUnspacedCycleState();
  // Drop the cached step-walk for the card we just left. A reshuffled cycle
  // can land the same card back at the head — most often when the focused
  // paradigm is down to a single in-scope form (e.g. one form left after
  // exclude-known-morphs), since avoidHeadCollision can't displace a head in a
  // <2-card deck. Without this, ensureStepStateForCard reuses the *completed*
  // morphStepState (same cardId) and re-renders the "PARSE COMPLETE" summary,
  // so Next looks dead. Clearing it forces a fresh walk for whatever card now
  // leads the cycle.
  resetMorphStepState();
}


function isSupplementalCard(card) {
  const key = String((card && card.sourceKey) || '');
  const set = key && window.SETS && typeof window.SETS === 'object' ? window.SETS[key] : null;
  return !!(
    card && (
      card.supplemental ||
      (set && (set.supplemental || set.type === 'supplemental')) ||
      /^W\d+O$/.test(key) ||
      /^W\d+_/.test(key)
    )
  );
}

function isAdvancedCard(card) {
  const key = String((card && card.sourceKey) || '');
  const set = key && window.SETS && typeof window.SETS === 'object' ? window.SETS[key] : null;
  return !!(
    card && (
      card.advanced ||
      (set && (set.advanced || set.type === 'advanced')) ||
      isAdvancedKey(key)
    )
  );
}

function advanceScheduledCards(cards = runtime.originalDeck, advanceMs = SRS_CYCLE_ADVANCE_MS) {
  const now = Date.now();
  // A base card and its derived second-aorist card share one progress entry;
  // advance it once, not once per face.
  const advanced = new Set();
  (cards || []).forEach(card => {
    const progressId = progressCardId(card.id);
    if (advanced.has(progressId)) return;
    advanced.add(progressId);
    const progress = getWordProgress(card.id);
    if (progress.dueAt && progress.dueAt > now) {
      progress.dueAt = Math.max(now, progress.dueAt - advanceMs);
      progress.intervalDays = Math.max(0, (progress.dueAt - now) / SRS_DAY_MS);
    }
  });
}

// Read-only callers (deck building, review list, analytics, scheduling
// queries) far outnumber the handful that actually record progress. Only the
// latter pass { persist: true }; everyone else gets a throwaway default object
// and the store is never polluted with no-information entries — which is what
// kept bloating both the in-memory state and the saved payload.
function getWordProgress(cardId, { persist = false } = {}) {
  // Derived second-aorist cards share their base card's progress entry —
  // reviewing εἶπον records onto λέγω's stats (and schedule). Deck mechanics
  // (marks, cycle state, deck order) keep the suffixed id; only this
  // progress-store identity is normalized.
  cardId = progressCardId(cardId);
  const progressStore = getDirectionalProgressStore();
  const existing = progressStore[cardId];
  if (existing && typeof existing === 'object') {
    existing.seenCount = Number.isFinite(existing.seenCount) ? Math.max(0, existing.seenCount) : 0;
    existing.passCount = Number.isFinite(existing.passCount) ? Math.max(0, existing.passCount) : 0;
    existing.failCount = Number.isFinite(existing.failCount) ? Math.max(0, existing.failCount) : 0;
    existing.streak = Number.isFinite(existing.streak) ? Math.max(0, existing.streak) : 0;
    existing.easyStreak = Number.isFinite(existing.easyStreak) ? Math.max(0, existing.easyStreak) : 0;
    existing.srsStage = Number.isFinite(existing.srsStage) ? Math.max(0, Math.floor(existing.srsStage)) : 0;
    existing.ease = clamp(Number.isFinite(existing.ease) ? existing.ease : 2.3, 1.3, 3.0);
    existing.intervalDays = Number.isFinite(existing.intervalDays) ? Math.max(0, existing.intervalDays) : 0;
    existing.lastEasyIntervalDays = Number.isFinite(existing.lastEasyIntervalDays) ? Math.max(0, existing.lastEasyIntervalDays) : 0;
    existing.dueAt = Number.isFinite(existing.dueAt) ? Math.max(0, existing.dueAt) : 0;
    existing.lastReviewedAt = Number.isFinite(existing.lastReviewedAt) ? Math.max(0, existing.lastReviewedAt) : 0;
    existing.firstSeenAt = Number.isFinite(existing.firstSeenAt) ? Math.max(0, existing.firstSeenAt) : 0;
    existing.firstConfirmedAt = Number.isFinite(existing.firstConfirmedAt) ? Math.max(0, existing.firstConfirmedAt) : 0;
    existing.confidence = Number.isFinite(existing.confidence) ? Math.max(0, existing.confidence) : 0;
    existing.confidenceHistory = Array.isArray(existing.confidenceHistory) ? existing.confidenceHistory.filter(value => Number.isFinite(value)).slice(-10) : [];
    return existing;
  }
  const fresh = {
    seenCount: 0,
    passCount: 0,
    failCount: 0,
    streak: 0,
    easyStreak: 0,
    srsStage: 0,
    ease: 2.3,
    intervalDays: 0,
    lastEasyIntervalDays: 0,
    dueAt: 0,
    lastReviewedAt: 0,
    firstSeenAt: 0,
    firstConfirmedAt: 0,
    confidence: 0,
    confidenceHistory: []
  };
  if (persist) progressStore[cardId] = fresh;
  return fresh;
}

function isCardDue(card) {
  if (!runtime.spacedRepetition) return true;
  const progress = getWordProgress(card.id);
  return !progress.dueAt || progress.dueAt <= Date.now();
}

function sortCardsByDue(cards) {
  return [...cards].sort((a, b) => {
    const aDue = getWordProgress(a.id).dueAt || 0;
    const bDue = getWordProgress(b.id).dueAt || 0;
    if (aDue !== bDue) return aDue - bDue;
    return a.id.localeCompare(b.id);
  });
}

function clearSpacedUndoSnapshot() {
  // Clears both the single-level spaced/morph snapshot and the unspaced
  // history stack. The two share the same "the deck context just
  // changed, drop any pending undo" invalidation points (mode toggles,
  // deck rebuilds, resets, selection changes), so collapsing them into
  // one clear keeps every call site honest.
  runtime.spacedUndoSnapshot = null;
  runtime.unspacedHistory = [];
}

// Snapshot of everything markCard / applyUnspacedMark / a reshuffle can
// mutate. Used by both the single-shot spaced/morph undo and the
// multi-step unspaced history stack.
function buildUndoSnapshot(extra = {}) {
  return {
    selectedKeys: cloneForUndo(runtime.selectedKeys),
    currentSessionId: runtime.currentSession ? runtime.currentSession.id : null,
    studyMode: runtime.studyMode,
    directionToGreek: runtime.directionToGreek,
    requiredOnly: runtime.requiredOnly,
    shuffled: runtime.shuffled,
    spacedRepetition: runtime.spacedRepetition,
    currentIdx: runtime.currentIdx,
    activeDeckCount: runtime.activeDeckCount,
    isFlipped: runtime.isFlipped,
    unspacedPendingRecycle: runtime.unspacedPendingRecycle,
    unspacedRoundSize: runtime.unspacedRoundSize,
    unspacedRoundMarks: runtime.unspacedRoundMarks,
    unspacedMiddleIds: Array.from(runtime.unspacedMiddleIds || []),
    unspacedMiddleCount: runtime.unspacedMiddleCount || 0,
    // Three-deck spaced state — captured here so the 2% revival (which can
    // fire between the snapshot and the next user action) doesn't leave
    // stale spacedActiveIds/middleDeckCount lying around after an undo.
    // Without this, the visible card is correct after undo but the next
    // navigation can mis-route end-of-active or treat a card as middle when
    // it should be active.
    spacedActiveIds: Array.isArray(runtime.spacedActiveIds) ? [...runtime.spacedActiveIds] : [],
    middleDeckCount: runtime.middleDeckCount || 0,
    lastStudyActivityAt: runtime.lastStudyActivityAt || 0,
    unspacedCycleState: cloneForUndo(runtime.unspacedCycleState),
    lastUnspacedArchiveDayKey: runtime.lastUnspacedArchiveDayKey,
    morphAnswerState: cloneForUndo(runtime.morphAnswerState),
    morphPendingAdvance: runtime.morphPendingAdvance,
    deck: cloneForUndo(runtime.deck),
    originalDeck: cloneForUndo(runtime.originalDeck),
    marksStore: cloneForUndo(getDirectionalMarksStore()),
    progressStore: cloneForUndo(getDirectionalProgressStore()),
    appUsageStats: cloneForUndo(runtime.appUsageStats),
    appGamification: cloneForUndo(runtime.appGamification),
    ...extra
  };
}

// Restore runtime.* from a previously built snapshot. Returns false if
// the snapshot is incompatible with the current selection/mode (in
// which case the caller should discard it rather than apply).
function applyUndoSnapshot(snapshot) {
  if (!snapshot) return false;
  if (runtime.studyMode !== snapshot.studyMode) return false;
  if (runtime.directionToGreek !== snapshot.directionToGreek) return false;
  if (runtime.requiredOnly !== snapshot.requiredOnly) return false;
  if (runtime.shuffled !== snapshot.shuffled) return false;
  if (runtime.spacedRepetition !== snapshot.spacedRepetition) return false;
  if (JSON.stringify(runtime.selectedKeys) !== JSON.stringify(snapshot.selectedKeys || [])) return false;
  if ((runtime.currentSession ? runtime.currentSession.id : null) !== (snapshot.currentSessionId || null)) return false;

  const marksStore = getDirectionalMarksStore();
  Object.keys(marksStore).forEach(key => delete marksStore[key]);
  Object.assign(marksStore, cloneForUndo(snapshot.marksStore) || {});

  const progressStore = getDirectionalProgressStore();
  Object.keys(progressStore).forEach(key => delete progressStore[key]);
  Object.assign(progressStore, cloneForUndo(snapshot.progressStore) || {});

  runtime.marks = marksStore;
  runtime.originalDeck = cloneForUndo(snapshot.originalDeck) || [];
  runtime.deck = cloneForUndo(snapshot.deck) || [];
  runtime.appUsageStats = ensureUsageStats(cloneForUndo(snapshot.appUsageStats));
  runtime.appGamification = sanitizeGamificationState(cloneForUndo(snapshot.appGamification));
  const restoredLevel = computeXpAndLevel(runtime.appUsageStats).currentLevel.level;
  if (!Number.isFinite(runtime.appGamification.lastCelebratedLevel) || runtime.appGamification.lastCelebratedLevel < 1 || runtime.appGamification.lastCelebratedLevel > restoredLevel) {
    runtime.appGamification.lastCelebratedLevel = restoredLevel;
  }
  // Reshuffle entries park the cursor at deck.length, so clamp to deck.length
  // (inclusive) rather than deck.length - 1.
  const maxIdx = runtime.deck.length;
  runtime.currentIdx = Math.max(0, Math.min(snapshot.currentIdx || 0, maxIdx));
  runtime.activeDeckCount = Math.max(0, snapshot.activeDeckCount || 0);
  runtime.isFlipped = !!snapshot.isFlipped;
  runtime.unspacedPendingRecycle = !!snapshot.unspacedPendingRecycle;
  if (Number.isFinite(snapshot.unspacedRoundSize)) runtime.unspacedRoundSize = snapshot.unspacedRoundSize;
  if (Number.isFinite(snapshot.unspacedRoundMarks)) runtime.unspacedRoundMarks = snapshot.unspacedRoundMarks;
  if (Array.isArray(snapshot.unspacedMiddleIds)) runtime.unspacedMiddleIds = new Set(snapshot.unspacedMiddleIds);
  if (Number.isFinite(snapshot.unspacedMiddleCount)) runtime.unspacedMiddleCount = snapshot.unspacedMiddleCount;
  if (Array.isArray(snapshot.spacedActiveIds)) runtime.spacedActiveIds = [...snapshot.spacedActiveIds];
  if (Number.isFinite(snapshot.middleDeckCount)) runtime.middleDeckCount = snapshot.middleDeckCount;
  if (Number.isFinite(snapshot.lastStudyActivityAt)) runtime.lastStudyActivityAt = snapshot.lastStudyActivityAt;
  if (snapshot.unspacedCycleState) runtime.unspacedCycleState = cloneForUndo(snapshot.unspacedCycleState);
  if (typeof snapshot.lastUnspacedArchiveDayKey === 'string') runtime.lastUnspacedArchiveDayKey = snapshot.lastUnspacedArchiveDayKey;
  if (isMorphologyMode() && snapshot.morphAnswerState) {
    runtime.morphAnswerState = cloneForUndo(snapshot.morphAnswerState);
    runtime.morphPendingAdvance = !!snapshot.morphPendingAdvance;
  } else {
    resetMorphAnswerState();
  }
  return true;
}

function captureSpacedUndoSnapshot() {
  if (!runtime.selectedKeys.length || !runtime.deck[runtime.currentIdx]) {
    runtime.spacedUndoSnapshot = null;
    return;
  }
  if (runtime.spacedRepetition && runtime.currentIdx >= runtime.activeDeckCount) {
    runtime.spacedUndoSnapshot = null;
    return;
  }
  runtime.spacedUndoSnapshot = buildUndoSnapshot();
}

// Capacity cap on the unspaced history stack — full snapshots aren't
// tiny, and the user gets multi-step Prev without keeping every
// breadcrumb from a long session in memory.
const UNSPACED_HISTORY_MAX = 30;

// Push a snapshot tagged with the kind of action it's the inverse of.
// 'mark' entries roll back a confidence-impacting Hard/Uncertain/Easy
// (Prev label shows "↶ Undo"); 'next' entries roll back the neutral
// pass; 'reshuffle' entries roll back the end-of-deck shuffle.
function pushUnspacedHistory(entryType) {
  if (!Array.isArray(runtime.unspacedHistory)) runtime.unspacedHistory = [];
  if (!runtime.selectedKeys.length) return;
  // Reshuffles capture from the end-of-deck parked state, where
  // deck[currentIdx] is undefined; everything else needs a real card.
  if (entryType !== 'reshuffle' && (runtime.currentIdx >= runtime.deck.length || !runtime.deck[runtime.currentIdx])) return;

  const snapshot = buildUndoSnapshot({ entryType });
  runtime.unspacedHistory.push(snapshot);
  if (runtime.unspacedHistory.length > UNSPACED_HISTORY_MAX) {
    runtime.unspacedHistory.splice(0, runtime.unspacedHistory.length - UNSPACED_HISTORY_MAX);
  }
}

function restoreUnspacedHistoryStep() {
  if (!Array.isArray(runtime.unspacedHistory) || !runtime.unspacedHistory.length) return false;
  const snapshot = runtime.unspacedHistory.pop();
  const restored = applyUndoSnapshot(snapshot);
  if (!restored) {
    // Snapshot from a different mode/selection — discard the whole stack
    // rather than leaving incompatible entries to surface later.
    runtime.unspacedHistory = [];
    return false;
  }
  renderCard();
  renderReview();
  renderProgress();
  syncLayoutVisibility();
  saveState();
  return true;
}

function getUnspacedHistoryTopType() {
  if (!Array.isArray(runtime.unspacedHistory) || !runtime.unspacedHistory.length) return null;
  return runtime.unspacedHistory[runtime.unspacedHistory.length - 1].entryType || null;
}

function restoreSpacedUndo() {
  if (!runtime.spacedUndoSnapshot) return;
  const restored = applyUndoSnapshot(runtime.spacedUndoSnapshot);
  if (!restored) return;
  clearSpacedUndoSnapshot();
  renderCard();
  renderReview();
  renderProgress();
  syncLayoutVisibility();
  saveState();
}

// Returns a deck where deck[0] is guaranteed not to equal avoidHeadId — used
// to prevent a card the user just saw at the end of one cycle from appearing
// first in the very next cycle. Mutates the input array in place.
function avoidHeadCollision(deck, avoidHeadId) {
  if (!avoidHeadId || !Array.isArray(deck) || deck.length < 2) return deck;
  if (!deck[0] || deck[0].id !== avoidHeadId) return deck;
  // Pick a random later slot to swap into; the original head moves elsewhere
  // in the deck rather than being deferred to the very end (which would be
  // predictable). With ≥ 2 cards there's always at least one valid swap.
  const swapIdx = 1 + Math.floor(Math.random() * (deck.length - 1));
  [deck[0], deck[swapIdx]] = [deck[swapIdx], deck[0]];
  return deck;
}

function buildStudyDeck(cards, options = {}) {
  if (!runtime.spacedRepetition) {
    // Unspaced flip deck has three sections: [active..., middle..., known...].
    //   active — cards not yet seen this round (the in-flight pile).
    //   middle — cards Hard/Uncertain-marked this round, parked until the
    //            next reshuffle so they don't reappear before the round ends.
    //   known  — Easy-archived cards; stay out until the user resets.
    // Default: every fresh build starts a new round, so middle clears and
    // every unmarked card collapses back into active. Callers that need to
    // preserve mid-round middle membership pass preserveUnspacedRound: true.
    if (options.preserveUnspacedRound !== true) {
      runtime.unspacedMiddleIds = new Set();
    }
    const middleIds = runtime.unspacedMiddleIds || new Set();
    const active = cards.filter(card => runtime.marks[card.id] !== 'known' && !middleIds.has(card.id));
    const middle = cards.filter(card => runtime.marks[card.id] !== 'known' && middleIds.has(card.id));
    const known = cards.filter(card => runtime.marks[card.id] === 'known');
    runtime.activeDeckCount = active.length;
    runtime.unspacedMiddleCount = middle.length;
    const orderedActive = runtime.shuffled ? shuffleArray([...active]) : [...active];
    avoidHeadCollision(orderedActive, options.avoidHeadId);
    if (options.preserveUnspacedRound !== true) {
      runtime.unspacedRoundSize = orderedActive.length;
      runtime.unspacedRoundMarks = 0;
    }
    return [...orderedActive, ...middle, ...known];
  }

  // Three-section spaced deck: [active..., middle..., deferred...].
  //   active  — due-now cards already in the in-flight rotation. Drains as
  //             the user reviews; preserved in order across rebuilds.
  //   middle  — due-now cards that weren't in active when the session
  //             started (their dueAt timer expired mid-session, OR they got
  //             pushed back to due by ✕-return). Doesn't interrupt the
  //             active rotation; only joins active when active drains,
  //             when the user hits the Reshuffle button, on a 2% revival,
  //             or after a ≥ 5 h idle gap.
  //   deferred — dueAt in the future, sorted by dueAt.
  // runtime.spacedActiveIds is the source of truth for who lives in active;
  // it's filtered on every rebuild against the currently-due set, so reviewed
  // cards (now scheduled forward) drop out automatically.
  const forceShuffle = !!options.forceShuffle;
  const shuffleActive = !!options.shuffleActive;
  const now = Date.now();
  let promotedNearCards = false;
  let dueCards = cards.filter(isCardDue);

  // Backstop: if nothing is due but cards are deferred within 30 minutes,
  // promote them to due immediately so the user never hits a dead deck.
  if (!dueCards.length) {
    const nearCards = cards.filter(card => {
      const p = getWordProgress(card.id);
      return p.dueAt && p.dueAt > now && p.dueAt <= now + SRS_NEAR_WINDOW_MS;
    });
    if (nearCards.length) {
      nearCards.forEach(card => {
        const progress = getWordProgress(card.id);
        progress.dueAt = now;
        progress.intervalDays = 0;
      });
      promotedNearCards = true;
      dueCards = cards.filter(isCardDue);
    }
  }

  const deferredCards = cards.filter(card => !isCardDue(card));
  const dueIds = new Set(dueCards.map(c => c.id));

  // Drop any carry-over IDs that aren't due anymore (reviewed cards that
  // got bumped to deferred, or stale IDs from a different deck after a
  // mode/chapter switch).
  const carriedActiveIds = (runtime.spacedActiveIds || []).filter(id => dueIds.has(id));

  // Treat as a fresh start when:
  //  - the caller asked for it (forceShuffle: manual reshuffle, active-drain
  //    dump, or restore path),
  //  - the near-due backstop just fired (no real active to carry forward),
  //  - the last card flip was ≥ 5 h ago (genuine idle gap), or
  //  - there's no carry-over at all (initial build, post-reload, post-reset,
  //    or deck-identity change so no previous active IDs match the new deck).
  // Use the previous-activity snapshot (taken at the start of the current
  // noteStudyInteraction call) so the idle gap reflects time since the
  // PREVIOUS activity, not the one we just recorded a millisecond ago.
  const lastActivityAt = Number(runtime.previousStudyActivityAt) || 0;
  const idleReset = lastActivityAt && (now - lastActivityAt > SESSION_IDLE_RESET_MS);
  // Parsing mode keeps no SRS state, so the carry-over machinery (preserve
  // the previous session's in-flight active order) has nothing meaningful to
  // hold onto — and skipping freshStart would mean a reload restores the
  // previously-shown card order rather than re-shuffling. Always freshStart
  // in parsing mode so each load resamples the deck.
  const freshStart = forceShuffle || promotedNearCards || idleReset || carriedActiveIds.length === 0 || isParsingMode();

  let activeDue;
  let middleDue;
  if (freshStart) {
    // Everything currently due collapses into active; middle clears.
    activeDue = runtime.shuffled ? shuffleArray([...dueCards]) : sortCardsByDue(dueCards);
    avoidHeadCollision(activeDue, options.avoidHeadId);
    middleDue = [];
  } else {
    // Continue session: preserve the in-flight active order from the
    // previous deck where possible; anything else due lives in middle.
    const carriedSet = new Set(carriedActiveIds);
    const seen = new Set();
    const orderedFromPrev = [];
    (runtime.deck || []).forEach(card => {
      if (!card || !carriedSet.has(card.id) || seen.has(card.id)) return;
      const match = dueCards.find(d => d.id === card.id);
      if (match) {
        orderedFromPrev.push(match);
        seen.add(card.id);
      }
    });
    const orphans = carriedActiveIds
      .filter(id => !seen.has(id))
      .map(id => dueCards.find(d => d.id === id))
      .filter(Boolean);
    activeDue = [...orderedFromPrev, ...orphans];
    if (shuffleActive) activeDue = shuffleArray(activeDue);
    middleDue = sortCardsByDue(dueCards.filter(c => !carriedSet.has(c.id)));
  }

  runtime.spacedActiveIds = activeDue.map(c => c.id);
  runtime.activeDeckCount = activeDue.length;
  runtime.middleDeckCount = middleDue.length;
  const orderedDeferred = sortCardsByDue(deferredCards);
  return [...activeDue, ...middleDue, ...orderedDeferred];
}

function recordStudyOutcome(cardId, outcome, reviewedAt = Date.now()) {
  const progress = getWordProgress(cardId, { persist: true });
  const isFirstConfirmation = !progress.firstConfirmedAt;
  const xpAward = computeCardXpAward(outcome, isFirstConfirmation, runtime.spacedRepetition);
  const usage = ensureUsageStats();
  if (usage.cardXpEarned < 0) migrateLegacyXp(usage);
  usage.cardXpEarned = (usage.cardXpEarned || 0) + xpAward;
  progress.seenCount += 1;
  progress.lastReviewedAt = reviewedAt;
  progress.firstSeenAt = progress.firstSeenAt || reviewedAt;
  recordConfidenceSample(progress, outcome);
  if (!progress.firstConfirmedAt) {
    const pct = getConfidencePct(progress);
    if (pct !== null && pct >= 70) progress.firstConfirmedAt = reviewedAt;
  }
  if (outcome === 'easy' || outcome === 'known') {
    progress.passCount += 1;
    progress.firstConfirmedAt = progress.firstConfirmedAt || reviewedAt;
  } else {
    progress.failCount += 1;
  }
  return progress;
}

function seedMinimumUncertainSchedule(cardId, reviewedAt = Date.now()) {
  const progress = getWordProgress(cardId, { persist: true });
  const minimumDelayMs = getUncertainDelayMs(progress);
  const minimumDueAt = reviewedAt + minimumDelayMs;
  if (!progress.dueAt || progress.dueAt < minimumDueAt) {
    setProgressDelay(progress, minimumDelayMs, reviewedAt);
  }
  return progress;
}

function getDeckAggregateStats(cards = runtime.originalDeck) {
  // Shared base/second-aorist progress entries count once, not per face.
  const counted = new Set();
  return (cards || []).reduce((totals, card) => {
    const progressId = progressCardId(card.id);
    if (counted.has(progressId)) return totals;
    counted.add(progressId);
    const progress = getWordProgress(card.id);
    totals.seenCount += progress.seenCount || 0;
    totals.passCount += progress.passCount || 0;
    totals.failCount += progress.failCount || 0;
    return totals;
  }, { seenCount: 0, passCount: 0, failCount: 0 });
}

function applySpacedReview(card, outcome) {
  const now = Date.now();
  const normalizedOutcome = outcome === 'pass' ? 'pass' : outcome === 'easy' ? 'easy' : 'again';
  const progress = recordStudyOutcome(card.id, normalizedOutcome, now);

  if (normalizedOutcome === 'easy') {
    const nextIntervalDays = getNextEasyIntervalDays(progress);
    progress.streak += 1;
    progress.easyStreak = (progress.easyStreak || 0) + 1;
    progress.srsStage = getSrsStage(progress) + 1;
    progress.ease = clamp(getSrsEase(progress) + 0.08, 1.3, 3.0);
    progress.lastEasyIntervalDays = nextIntervalDays;
    progress.firstConfirmedAt = progress.firstConfirmedAt || now;
    setProgressDelay(progress, msFromDays(nextIntervalDays), now);
    getDirectionalMarksStore()[card.id] = 'known';
  } else if (normalizedOutcome === 'pass') {
    progress.streak += 1;
    progress.easyStreak = 0;
    progress.ease = clamp(getSrsEase(progress) - 0.05, 1.3, 3.0);
    progress.lastEasyIntervalDays = Math.max(getLastEasyIntervalDays(progress), progress.intervalDays || 0);
    setProgressDelay(progress, getUncertainDelayMs(progress), now);
    getDirectionalMarksStore()[card.id] = 'unsure';
  } else {
    // 'again' (default for any unknown outcome)
    progress.streak = 0;
    progress.easyStreak = 0;
    progress.srsStage = Math.max(0, getSrsStage(progress) - 1);
    progress.ease = clamp(getSrsEase(progress) - 0.2, 1.3, 3.0);
    progress.lastEasyIntervalDays = Math.max(getLastEasyIntervalDays(progress), progress.intervalDays || 0);
    // No deferred timer: leave dueAt at now so the card stays eligible, and
    // drop its id from spacedActiveIds so buildStudyDeck routes it to the
    // middle pile (due AND not in the carry-over active set). It then
    // resurfaces when active drains and middle dumps in — alongside any
    // cards whose pass/uncertain timer happened to expire during the pass.
    setProgressDelay(progress, 0, now);
    if (Array.isArray(runtime.spacedActiveIds)) {
      runtime.spacedActiveIds = runtime.spacedActiveIds.filter(id => id !== card.id);
    }
    getDirectionalMarksStore()[card.id] = 'unsure';
  }

  progress.lastSpacedOutcome = normalizedOutcome;
  runtime.marks = getDirectionalMarksStore();
}

function getDueCount(cards = runtime.originalDeck) {
  return (cards || []).filter(isCardDue).length;
}

// Count of cards that the end-of-deck "advance 1 h" Next press would
// promote from deferred to due-now. Used by render.js to show the user
// "(N near-due)" in brackets on the spaced session-complete card so
// they know whether pressing Next will actually surface more work.
function getNearDueCount(cards = runtime.originalDeck) {
  const now = Date.now();
  const threshold = now + SRS_CYCLE_ADVANCE_MS;
  return (cards || []).filter(card => {
    const p = getWordProgress(card.id);
    return p.dueAt && p.dueAt > now && p.dueAt <= threshold;
  }).length;
}




function getMorphSpacedOutcome(card, isCorrect) {
  if (!isCorrect) return 'again';
  const progress = getWordProgress(card.id);
  return progress.lastSpacedOutcome === 'again' ? 'pass' : 'easy';
}

function answerMorphologyChoice(choiceIndex) {
  // Multiple-choice answers are only valid in quiz mode; in self-check mode
  // the choices are hidden, so grading against them (e.g. from the 1-4
  // keyboard shortcuts) would silently mark the card against an invisible
  // option.
  if (!isMorphologyMode() || runtime.morphSelfCheck) return;
  const card = runtime.deck[runtime.currentIdx];
  if (!card || runtime.morphAnswerState.answered) return;

  const reversed = reverseDisplayActive(card);
  const choices = reversed ? card.reverseChoices : card.choices;
  if (!Array.isArray(choices)) return;
  // An out-of-range index (a digit key beyond the rendered options) must be
  // ignored, not graded as a wrong answer against `undefined`.
  if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= choices.length) return;
  noteStudyInteraction();

  captureSpacedUndoSnapshot();

  const selected = choices[choiceIndex];
  const correctAnswer = reversed ? card.form : card.answer;
  const isCorrect = selected === correctAnswer;
  runtime.morphAnswerState = {
    answered: true,
    revealed: true,
    selfRated: true,
    selectedIndex: choiceIndex,
    isCorrect
  };

  if (runtime.spacedRepetition) {
    applySpacedReview(card, getMorphSpacedOutcome(card, isCorrect));
    runtime.morphPendingAdvance = true;
  } else {
    const mark = isCorrect ? 'known' : 'unsure';
    const reviewedAt = Date.now();
    recordStudyOutcome(card.id, isCorrect ? 'known' : 'review', reviewedAt);
    applyUnspacedSharedSchedule(card, isCorrect ? 'easy' : 'again', reviewedAt);
    getDirectionalMarksStore()[card.id] = mark;
    runtime.marks = getDirectionalMarksStore();
  }

  renderCard();
  renderProgress();
  renderReview();
  saveState();
}

function revealMorphologyAnswer() {
  if (!isMorphologyMode()) return;
  noteStudyInteraction();
  const card = runtime.deck[runtime.currentIdx];
  if (!card || runtime.morphAnswerState.revealed) return;
  runtime.morphAnswerState = {
    ...runtime.morphAnswerState,
    revealed: true
  };
  renderCard();
}

function rateMorphologySelfCheck(isCorrect) {
  if (!isMorphologyMode()) return;
  noteStudyInteraction();
  const card = runtime.deck[runtime.currentIdx];
  if (!card || !runtime.morphAnswerState.revealed || runtime.morphAnswerState.answered) return;

  captureSpacedUndoSnapshot();

  runtime.morphAnswerState = {
    answered: true,
    revealed: true,
    selfRated: true,
    selectedIndex: -1,
    isCorrect: !!isCorrect
  };

  if (runtime.spacedRepetition) {
    applySpacedReview(card, getMorphSpacedOutcome(card, isCorrect));
    runtime.morphPendingAdvance = true;
  } else {
    const mark = isCorrect ? 'known' : 'unsure';
    const reviewedAt = Date.now();
    recordStudyOutcome(card.id, isCorrect ? 'known' : 'review', reviewedAt);
    applyUnspacedSharedSchedule(card, isCorrect ? 'easy' : 'again', reviewedAt);
    getDirectionalMarksStore()[card.id] = mark;
    runtime.marks = getDirectionalMarksStore();
  }

  renderCard();
  renderProgress();
  renderReview();
  saveState();
}

function markMorphologyDontKnow() {
  if (!isMorphologyMode()) return;
  noteStudyInteraction();
  const card = runtime.deck[runtime.currentIdx];
  if (!card || runtime.morphAnswerState.answered) return;

  captureSpacedUndoSnapshot();

  runtime.morphAnswerState = {
    answered: true,
    revealed: true,
    selfRated: true,
    selectedIndex: -1,
    isCorrect: false
  };

  if (runtime.spacedRepetition) {
    applySpacedReview(card, getMorphSpacedOutcome(card, false));
    runtime.morphPendingAdvance = true;
  } else {
    const reviewedAt = Date.now();
    recordStudyOutcome(card.id, 'review', reviewedAt);
    applyUnspacedSharedSchedule(card, 'again', reviewedAt);
    getDirectionalMarksStore()[card.id] = 'unsure';
    runtime.marks = getDirectionalMarksStore();
  }

  renderCard();
  renderProgress();
  renderReview();
  saveState();
}



function getKnownCount() {
  return runtime.originalDeck.filter(card => runtime.marks[card.id] === 'known').length;
}

function getHighConfidenceCount() {
  return runtime.originalDeck.filter(card => {
    const pct = getConfidencePct(getWordProgress(card.id));
    return pct !== null && pct > 75;
  }).length;
}

function getRemainingCards() {
  if (runtime.spacedRepetition) {
    return runtime.deck.slice(0, runtime.activeDeckCount);
  }
  return runtime.deck.filter(card => runtime.marks[card.id] !== 'known');
}

function moveCardToBackOfActivePile(card) {
  if (!card) return false;
  const directionalMarks = getDirectionalMarksStore();

  const currentCardId = runtime.deck[runtime.currentIdx]?.id || null;
  directionalMarks[card.id] = 'unsure';
  runtime.marks = directionalMarks;

  runtime.deck = runtime.deck.filter(candidate => candidate.id !== card.id);
  const splitAt = runtime.deck.findIndex(candidate => runtime.marks[candidate.id] === 'known');
  const insertAt = splitAt === -1 ? runtime.deck.length : splitAt;
  runtime.deck.splice(insertAt, 0, card);

  runtime.activeDeckCount = runtime.originalDeck.filter(candidate => runtime.marks[candidate.id] !== 'known').length;
  if (currentCardId) {
    const restoredIdx = runtime.deck.findIndex(candidate => candidate.id === currentCardId);
    if (restoredIdx >= 0) runtime.currentIdx = restoredIdx;
  }
  runtime.unspacedPendingRecycle = false;
  return true;
}

// Unspaced flip-deck hourly upcoming-cards reshuffle. Kept on its old
// cadence — the unspaced flow has no middle deck and still benefits from
// occasional order churn during long sessions.
const PERIODIC_RESHUFFLE_MIN_MS = 60 * 60 * 1000;

function maybePeriodicReshuffle() {
  // Spaced mode handles session boundaries inside buildStudyDeck via
  // SESSION_IDLE_RESET_MS, so there's nothing for this hook to do.
  if (runtime.spacedRepetition) return;
  if (!runtime.shuffled) return;
  runtime.flipsSinceReshuffle++;
  const now = Date.now();
  const lastAt = Number(runtime.lastPeriodicReshuffleAt) || 0;
  if (!lastAt) {
    runtime.lastPeriodicReshuffleAt = now;
    return;
  }
  if (now - lastAt < PERIODIC_RESHUFFLE_MIN_MS) return;
  runtime.lastPeriodicReshuffleAt = now;
  runtime.flipsSinceReshuffle = 0;
  reshuffleUpcomingCards();
}

// Per-flip ~1/50 (2%) chance to bring one high-confidence (>75%) deferred
// card back into the active pile. Skipped when shuffle is off or in
// morphology mode. The picked card is forced due, added to spacedActiveIds
// so it lands directly in active (not middle), and the active section is
// reshuffled so the returning card mixes in randomly instead of sitting on
// the back.
function maybeReturnConfirmedDeferredCard() {
  if (!runtime.spacedRepetition || !runtime.shuffled || isMorphologyMode()) return false;
  if (KNOWN_CARD_RANDOM_RETURN_FLIP_ODDS <= 0) return false;
  if (Math.random() >= 1 / KNOWN_CARD_RANDOM_RETURN_FLIP_ODDS) return false;

  const eligible = (runtime.originalDeck || []).filter(card => {
    if (isCardDue(card)) return false;
    const pct = getConfidencePct(getWordProgress(card.id));
    return pct !== null && pct > 75;
  });
  if (!eligible.length) return false;

  const pick = eligible[Math.floor(Math.random() * eligible.length)];
  getWordProgress(pick.id).dueAt = Date.now();
  runtime.spacedActiveIds = [...(runtime.spacedActiveIds || []), pick.id];
  runtime.deck = buildStudyDeck(runtime.originalDeck, { shuffleActive: true });
  return true;
}

function reshuffleUpcomingCards() {
  const start = runtime.currentIdx + 1;
  // In spaced mode keep deferred (not-yet-due) cards in their dueAt order at
  // the tail; only reshuffle the active (due) portion ahead of runtime.currentIdx.
  const end = runtime.spacedRepetition
    ? Math.min(runtime.activeDeckCount, runtime.deck.length)
    : runtime.deck.length;
  if (start >= end) return;
  const upcoming = [];
  const pinned = [];
  for (let i = start; i < end; i++) {
    const id = runtime.deck[i].id;
    if (runtime.marks[id] === 'known' || runtime.unspacedDeferredIds.has(id)) pinned.push(runtime.deck[i]);
    else upcoming.push(runtime.deck[i]);
  }
  if (upcoming.length < 2) return;
  const tail = runtime.deck.slice(end);
  runtime.deck = [...runtime.deck.slice(0, start), ...shuffleArray(upcoming), ...pinned, ...tail];
}

function maybeReturnKnownCardToActivePile() {
  if (runtime.spacedRepetition || isMorphologyMode() || KNOWN_CARD_RANDOM_RETURN_FLIP_ODDS <= 0) return false;
  if (!runtime.originalDeck.length || runtime.currentIdx >= runtime.deck.length) return false;

  const currentCardId = runtime.deck[runtime.currentIdx]?.id || null;
  const knownCards = runtime.originalDeck.filter(card => card.id !== currentCardId && runtime.marks[card.id] === 'known');
  if (!knownCards.length) return false;

  const returnChance = 1 / KNOWN_CARD_RANDOM_RETURN_FLIP_ODDS;
  if (Math.random() >= returnChance) return false;

  const card = knownCards[Math.floor(Math.random() * knownCards.length)];
  return moveCardToBackOfActivePile(card);
}


// Save/restore + JSON export/import + Transfer modal live in js/state/persistence.js

function startNextCycle(mode = 'remaining', options = {}) {
  runtime.unspacedDeferredIds = new Set();
  runtime.flipsSinceReshuffle = 0;
  // A new cycle is a fresh shuffle anchor — reset the hourly timer so the
  // next periodic reshuffle counts from now.
  runtime.lastPeriodicReshuffleAt = Date.now();
  // Parsing mode re-derives its pool from the filtered focused paradigm so
  // the exclude-known-morphs filter re-runs each cycle (the generic
  // 'remaining'/'full' paths below just reshuffle originalDeck and would
  // re-admit a form that became 2/2 known mid-session). saveState below.
  if (isParsingMode()) {
    rebuildParsingCycle(options);
    runtime.unspacedPendingRecycle = false;
    saveState();
    return;
  }
  if (mode === 'full') {
    const directionalMarks = getDirectionalMarksStore();
    (runtime.originalDeck || []).forEach(card => {
      delete directionalMarks[card.id];
    });
    runtime.marks = directionalMarks;
    const fullDeck = runtime.shuffled
      ? shuffleArray([...(runtime.originalDeck || [])])
      : [...(runtime.originalDeck || [])];
    avoidHeadCollision(fullDeck, options.avoidHeadId);
    runtime.deck = fullDeck;
    runtime.currentIdx = fullDeck.length ? 0 : runtime.deck.length;
  } else {
    const remaining = runtime.shuffled
      ? shuffleArray([...getRemainingCards()])
      : [...getRemainingCards()];
    avoidHeadCollision(remaining, options.avoidHeadId);
    const known = (runtime.originalDeck || []).filter(card => runtime.marks[card.id] === 'known');
    runtime.deck = [...remaining, ...known];
    runtime.currentIdx = remaining.length ? 0 : runtime.deck.length;
  }
  resetUnspacedCycleState();
  runtime.unspacedPendingRecycle = false;
  saveState();
}

// Onclick target for the Next button. Defers to navigate(1), which detects
// the "deck fully archived" case in unspaced vocab mode and re-routes the
// press to a no-confirm reset (the button's label morphs to "↻ Reset" via
// syncLayoutVisibility so the affordance matches the behaviour).
function handleNavNext() {
  navigate(1);
}

function resetStudyState() {
  runtime.marks = getDirectionalMarksStore();
  runtime.currentIdx = 0;
  runtime.activeDeckCount = runtime.spacedRepetition ? getDueCount(runtime.originalDeck) : runtime.originalDeck.filter(card => runtime.marks[card.id] !== 'known').length;
  // Fresh deck = fresh piles. The previous deck's active ids must not leak
  // into the next build: selections can share card ids (e.g. adding a
  // chapter keeps the old chapter's ids), and a stale carry-over would split
  // the brand-new deck into a bogus active/middle partition.
  runtime.spacedActiveIds = [];
  resetUnspacedCycleState();
  runtime.unspacedPendingRecycle = false;
  runtime.isFlipped = false;
}

// Study Selector builders + toggle/deselect/load flow live in js/ui/selectors.js
// Reader UI (drills + verses) lives in js/ui/reader.js; configured at module-top above.
// ═══════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════
// renderCard and flipCard live in js/ui/render.js

// ═══════════════════════════════════════════════════════
//  NAVIGATE + MARK
// ═══════════════════════════════════════════════════════
// Navigation, marking, mode/profile setters, toggles and resets live in js/ui/navigation.js
// ═══════════════════════════════════════════════════════
//  PROGRESS + REVIEW
// ═══════════════════════════════════════════════════════
// Progress bar, Review panel, returnSeenCardToDeck live in js/ui/progress.js

// Modal/overlay control (disclaimer, what's new, study selector, shortcuts,
// analytics open/close, startStudying) lives in js/ui/modals.js


// Touch-safe tap bridge for iOS/pointer quirks lives in js/ui/touchTapBridge.js

// Pure SVG/HTML chart builders and series helpers now live in js/ui/charts.js

// Analytics overlay (renderAnalyticsOverlay + all its compute/build helpers,
// plus the celebrate-on-level-up plumbing) lives in js/ui/analytics.js

installKeyboardShortcuts({
  isAnalyticsModalOpen, closeAnalyticsOverlay,
  isStudySelectorOpen, closeStudySelector,
  isShortcutsModalOpen, closeShortcutsModal,
  isWhatsNewV1_5ModalOpen, closeWhatsNewV1_5Modal,
  isDisclaimerModalOpen, isTransferModalOpen, closeTransferModal,
  isReviewDeckMode,
  getSelectedKeys: () => runtime.selectedKeys,
  isMorphologyMode,
  isMorphSelfCheck: () => !!runtime.morphSelfCheck,
  navigate, answerMorphologyChoice, revealMorphologyAnswer, rateMorphologySelfCheck,
  flipCard, markCard
});

// ═══════════════════════════════════════════════════════
//  GLOBAL EXPORTS — needed for HTML onclick handlers
//  Export these BEFORE startup runs, so one later init error does not
//  leave the page rendered-but-unclickable.
// ═══════════════════════════════════════════════════════
const GLOBAL_CLICK_HANDLERS = {
  flipCard, navigate, markCard, handleNavNext, answerMorphologyChoice,
  revealMorphologyAnswer, rateMorphologySelfCheck, markMorphologyDontKnow,
  answerMorphologyStep, skipMorphologyStep, giveUpMorphologyStep, answerParsingReverseChoice,
  returnSeenCardToDeck, clearParsingMorph,
  closeAnalyticsOverlay, closeTransferModal, exportProgressJson,
  closeShortcutsModal, closeStudySelector,
  deselectAllChapters, deselectAllSupplementals, deselectAllAdvanced, deselectAll,
  handleConsentAction, handleTransferPrimaryAction, handleTransferSecondaryAction,
  openShortcutsModal, openStudySelector,
  openAnalyticsOverlay, resetAllStats, resetCurrentDeck, resetRequiredOnly,
  closeResetSpacedModal, confirmResetSpacedTimingOnly, confirmResetSpacedProgress,
  confirmResetSpacedSmooth,
  closeResetUnspacedModal, confirmResetUnspacedMarks,
  openResetStatsModal, closeResetStatsModal,
  confirmResetStatsKeepSettings, confirmResetToStart,
  setReviewSortMode,
  reshuffleEligible,
  fastForwardOneDay, fastForwardOneWeek,
  restoreSpacedUndo, setAppProfile, setStudyMode, setThemeMode, setFontFamily, setTextSize,
  showDisclaimerModal, startStudying, toggleDirection, toggleMorphSelfCheck,
  toggleMorphStepByStep, setMorphFocusedParadigm, setParsingChapter, goToStemDrillFromParsing,
  toggleRequiredOnly, toggleHardVocabReview, toggleStemNotes, toggleSecondAoristCards, toggleShuffle, toggleSpacedRepetition, toggleSplitSelection, toggleAspectStep, toggleDimStep, toggleOptionalForms, toggleOptionalFormFilter, toggleDimValueFilter, toggleExcludeKnownMorphs, toggleParsingReverse, toggleAccentLookalikes, resetKnownMorphs, closeResetKnownModal, confirmResetKnownFocused, confirmResetKnownAll, clearParsingStats, toggleUnspacedDailyReset, triggerImportProgress,
  openReaderTab, selectReaderDrillChoice, advanceReaderDrill,
  closeWhatsNewV1_5Modal
};
if (typeof globalThis !== 'undefined') Object.assign(globalThis, GLOBAL_CLICK_HANDLERS);
if (typeof window !== 'undefined' && window !== globalThis) Object.assign(window, GLOBAL_CLICK_HANDLERS);

initializeThemeMode();
initializeFontFamily();
initializeTextSize();
// Initial build with default state (needed so restoreState can find DOM elements)
buildSessions();
buildChapterSelector();
buildSupplementalSelector();
buildAdvancedSelector();
if (!restoreState()) {
  syncToggleButtons(); // reflect default controls on load
}
// Rebuild after restore: runtime.appProfile may have changed, affecting grammar summary text
buildSessions();
buildChapterSelector();
buildSupplementalSelector();
buildAdvancedSelector();
initializeConsentGate();
if (isReaderMode()) renderReaderModule();

window.addEventListener('greekSupplementalDataChanged', () => {
  buildSessions();
  buildChapterSelector();
  buildSupplementalSelector();
  buildAdvancedSelector();
  if (runtime.selectedKeys.length && runtime.selectedKeys.some(key => window.SETS?.[key]?.type === 'other')) {
    const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
    loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
  }
});

const cardArea = document.getElementById('cardArea');
if (cardArea) {
  cardArea.addEventListener('click', (event) => {
    const target = event.target;
    if (!target || !(target instanceof Element)) return;
    // Parsing-mode stem-recall redirect button uses .empty-state for layout
    // but has its own onclick that switches mode + loads the supplemental
    // deck. Opening the study selector on top of that would be a confusing
    // double-effect, so skip the delegate for it.
    if (target.closest('.parsing-redirect-btn')) return;
    if (target.closest('.empty-state')) openStudySelector();
  });
}

startUsageTracking();
syncLayoutVisibility();
renderProgress();
installTouchSafeTapBridge();
installClickShield();

// Prevent mobile double-tap zoom on interactive controls
function preventDoubleTapZoom(el) {
  let lastTouchEnd = 0;
  el.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) event.preventDefault();
    lastTouchEnd = now;
  }, false);
}

['shuffleToggle','requiredToggle','directionToggle','spacedToggle','splitSelectionToggle','selfCheckToggle','aspectStepToggle','tenseStepToggle','voiceStepToggle','moodStepToggle','personStepToggle','numberStepToggle','caseStepToggle','genderStepToggle','optionalFormsToggle','optionalFilter_imperative_Toggle','optionalFilter_subjunctive_Toggle','optionalFilter_infinitive_Toggle','optionalFilter_participle_Toggle','optionalFilter_thirdPerson_Toggle','optionalFilter_futureTense_Toggle','optionalFilter_perfectTense_Toggle','unspacedDailyResetToggle','modeVocabBtn','modeMorphBtn','modeReaderBtn','modeShortcutVocabBtn','modeShortcutMorphBtn','modeShortcutReaderBtn','themeSystemBtn','themeDarkBtn','themeLightBtn'].forEach(id => {
  const el = document.getElementById(id);
  if (el) preventDoubleTapZoom(el);
});

if ('serviceWorker' in navigator) {
  let pendingWorker = null;
  let reloading = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.acceptRefreshAvailable = function () {
    if (pendingWorker) {
      try { pendingWorker.postMessage({ type: 'SKIP_WAITING' }); } catch (_) {}
    }
  };

  window.dismissRefreshAvailable = function () {
    const overlay = document.getElementById('refreshAvailableOverlay');
    if (overlay) overlay.setAttribute('aria-hidden', 'true');
  };

  function showRefreshOverlay(sw) {
    pendingWorker = sw;
    const overlay = document.getElementById('refreshAvailableOverlay');
    if (overlay) overlay.setAttribute('aria-hidden', 'false');
  }

  function trackUpdates(reg) {
    // The new SW only counts as an update if a controller is already in place
    // (i.e. this isn't the first install on a fresh device).
    if (reg.waiting && navigator.serviceWorker.controller) {
      showRefreshOverlay(reg.waiting);
    }
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      if (!sw) return;
      sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) {
          showRefreshOverlay(sw);
        }
      });
    });
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then(reg => {
        trackUpdates(reg);
        try { reg.update(); } catch (_) {}
        // Re-check whenever the tab regains focus, so a PWA reopened a day
        // later picks up a deploy without needing a hard reload first.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            try { reg.update(); } catch (_) {}
          }
        });
      })
      .catch(() => {});
  });
}
