// Navigation + marking + study-mode toggles.
//
// navigate(dir), markCard(outcome), setStudyMode, setAppProfile and all the
// toggles (shuffle/required/direction/spaced/morph self-check) live here.
// Also reshuffleEligible, fastForward day/week, resetCurrentDeck,
// resetAllStats. Reads/writes runtime state directly; host callbacks cover
// the SRS scheduler, deck builder, study-state primitives, and the
// directional-store helpers that still live in main.js.

import { runtime } from '../state/runtime.js';
import { shuffleArray } from '../utils/helpers.js';
import { SRS_DAY_MS, SRS_CYCLE_ADVANCE_MS } from '../domain/srs/constants.js';
import { expandSessionSets, sortSetKeys } from '../domain/deck/ordering.js';
import {
  sanitizeGamificationState,
  STORAGE_KEY,
  CONSENT_STORAGE_KEY,
  WHATS_NEW_V1_5_STORAGE_KEY,
  THEME_STORAGE_KEY,
  FONT_FAMILY_STORAGE_KEY,
  TEXT_SIZE_STORAGE_KEY
} from '../state/store.js';
import { getStorage } from '../utils/storage.js';
import { shieldClicksBriefly } from '../utils/clickShield.js';
import { renderCard } from './render.js';
import { renderProgress, renderReview } from './progress.js';
import {
  loadDeckFromKeys,
  buildSessions,
  buildChapterSelector,
  buildSupplementalSelector,
  buildAdvancedSelector
} from './selectors.js';

let host = {
  noteStudyInteraction: () => {},
  isMorphologyMode: () => false,
  isParsingMode: () => false,
  isReaderMode: () => false,
  normalizeStudyMode: (m) => m,
  resetMorphAnswerState: () => {},
  ensureDirectionalStores: () => {},
  getDirectionalMarksStore: () => ({}),
  getDirectionalProgressStore: () => ({}),
  syncToggleButtons: () => {},
  syncLayoutVisibility: () => {},
  startNextCycle: () => {},
  getKnownCount: () => 0,
  advanceScheduledCards: () => {},
  buildStudyDeck: () => [],
  captureSpacedUndoSnapshot: () => {},
  applySpacedReview: () => {},
  clearSpacedUndoSnapshot: () => {},
  restoreSpacedUndo: () => {},
  pushUnspacedHistory: () => {},
  restoreUnspacedHistoryStep: () => false,
  clearSavedState: () => {},
  maybeReturnConfirmedDeferredCard: () => {},
  maybePeriodicReshuffle: () => {},
  recordStudyOutcome: () => {},
  applyUnspacedSharedSchedule: () => {},
  getRemainingCards: () => [],
  resetUnspacedCycleState: () => {},
  noteUnspacedArchiveActivity: () => {},
  saveCurrentDeckStateToBank: () => {},
  markActiveDeckRef: () => {},
  saveState: () => {},
  renderReaderModule: () => {},
  getDeckStateKey: () => '',
  getSessions: () => [],
  getSelectedCards: () => [],
  resetMorphStepState: () => {},
  ensureMorphFocusedParadigm: () => {},
  rebuildMorphDeckForStepMode: () => {},
  rebuildParsingCycle: () => {}
};

// When split vocab/grammar selection is on, each mode keeps its own selected
// chapters. These helpers stash/restore that selection as the study mode
// changes. Only 'vocab' and 'morph' participate; 'reader' is left untouched.
function saveModeSelection(mode) {
  if (mode !== 'vocab' && mode !== 'morph' && mode !== 'parsing') return;
  runtime.modeSelections[mode] = {
    selectedKeys: [...runtime.selectedKeys],
    currentSessionId: runtime.currentSession ? runtime.currentSession.id : null
  };
}

// Spaced-repetition is remembered per section (vocab vs grammar). Only those
// two modes carry a setting; grammar (morph) defaults to unspaced, vocab to
// spaced. Parsing/reader don't use the SRS deck, so they're left out.
function spacedDefaultForMode(mode) {
  return mode !== 'morph';
}
function effectiveSpacedForMode(mode) {
  const v = runtime.spacedByMode && runtime.spacedByMode[mode];
  return typeof v === 'boolean' ? v : spacedDefaultForMode(mode);
}

function restoreModeSelection(mode) {
  if (mode !== 'vocab' && mode !== 'morph' && mode !== 'parsing') return;
  const saved = runtime.modeSelections[mode];
  if (!saved) return;
  runtime.selectedKeys = sortSetKeys((saved.selectedKeys || []).map(String));
  runtime.currentSession = saved.currentSessionId
    ? host.getSessions().find(s => s.id === saved.currentSessionId) || null
    : null;
}

export function configureNavigation(deps) {
  host = { ...host, ...deps };
}

export function navigate(dir, options = {}) {
  if (!runtime.deck.length) return;
  host.noteStudyInteraction();

  if (dir < 0) {
    // Spaced vocab hides the Prev button (going back would re-show a card
    // that was just rescheduled and invite double-grading); the keyboard
    // ArrowLeft path must match. Spaced morph keeps cursor-back, mirroring
    // its visible controls.
    if (runtime.spacedRepetition && !host.isMorphologyMode() && !host.isParsingMode()) return;
    // Vocab unspaced: Prev walks back through the history stack. Each
    // Next, mark, and reshuffle pushed a snapshot before mutating, so a
    // Prev press just pops and restores. The label flips between
    // "← Prev" and "↶ Undo" so the user knows when the next pop will
    // roll back a confidence-impacting mark.
    if (!runtime.spacedRepetition && !host.isMorphologyMode() && !host.isParsingMode()) {
      if (host.restoreUnspacedHistoryStep()) return;
      // No history to walk: fall through to plain cursor-back.
    }
    runtime.currentIdx = Math.max(0, runtime.currentIdx - 1);
    host.resetMorphAnswerState();
    renderCard();
    return;
  }

  if (!runtime.spacedRepetition && runtime.currentIdx >= runtime.deck.length) {
    if (host.isMorphologyMode() || host.isParsingMode()) {
      // Morph + parsing both auto-cycle on Next when everything is known.
      if (runtime.unspacedPendingRecycle) {
        host.startNextCycle('remaining');
      } else if (host.getKnownCount() === runtime.originalDeck.length) {
        host.startNextCycle('full');
      } else {
        return;
      }
      host.resetMorphAnswerState();
      renderCard();
      renderReview();
      renderProgress();
      host.saveState();
    } else if (runtime.unspacedMiddleCount > 0) {
      // Vocab unspaced + end-of-round confirmation card: middle has cards
      // waiting. Next dumps middle back into active (shuffled) and starts a
      // fresh round. Push history so Prev can put the deck back in its
      // pre-shuffle order. When middle is empty AND active is empty, the
      // deck is fully archived — Next is a no-op and the user must use
      // Reset.
      host.pushUnspacedHistory('reshuffle');
      reshuffleUnspacedRound(host.getDirectionalMarksStore());
      runtime.isFlipped = false;
      host.resetMorphAnswerState();
      renderCard();
      renderReview();
      renderProgress();
      host.saveState();
    }
    return;
  }

  if (runtime.spacedRepetition && runtime.currentIdx >= runtime.activeDeckCount) {
    // Active section drained. If middle has cards (timers expired during
    // this session OR cards Again'd during this pass), dump them into
    // active and reshuffle — keeps the user moving without burning time.
    // Only when middle is empty too do we fall back to the existing
    // scheduled-advance behaviour, which nudges the next-up deferred cards
    // forward an hour so the deck isn't dead. The last-shown card's id is
    // forwarded as avoidHeadId so the reshuffled deck doesn't put that
    // same card first — especially important now that Again-marked cards
    // land directly in middle without a timer-based cool-off.
    const avoidHeadId = runtime.deck[runtime.currentIdx - 1]
      ? runtime.deck[runtime.currentIdx - 1].id
      : undefined;
    if (runtime.middleDeckCount > 0) {
      runtime.deck = host.buildStudyDeck(runtime.originalDeck, { forceShuffle: true, avoidHeadId });
    } else {
      // Advance the SRS clock so cards within 1 h of due become due-now,
      // then rebuild with forceShuffle so every newly-promoted card lands
      // in active (not middle). Without forceShuffle, any stale entry in
      // spacedActiveIds that happens to coincide with a newly-due card
      // would split the cohort across active and middle, forcing the user
      // to press Next a second time to dump middle in.
      host.advanceScheduledCards(runtime.originalDeck, SRS_CYCLE_ADVANCE_MS);
      runtime.deck = host.buildStudyDeck(runtime.originalDeck, { forceShuffle: true, avoidHeadId });
    }
    runtime.currentIdx = 0;
    host.resetMorphAnswerState();
    renderCard();
    renderReview();
    renderProgress();
    host.saveState();
    return;
  }

  let autoReviewedCardId;
  if (runtime.spacedRepetition && runtime.currentIdx < runtime.activeDeckCount && !options.skipAutoReview && !host.isMorphologyMode() && !host.isParsingMode()) {
    const reviewedCard = runtime.deck[runtime.currentIdx];
    autoReviewedCardId = reviewedCard ? reviewedCard.id : undefined;
    host.captureSpacedUndoSnapshot();
    host.applySpacedReview(reviewedCard, 'again');
    runtime.deck = host.buildStudyDeck(runtime.originalDeck);
  }

  if (runtime.spacedRepetition) {
    if (host.isMorphologyMode() || host.isParsingMode()) {
      if (runtime.morphPendingAdvance) {
        runtime.deck = host.buildStudyDeck(runtime.originalDeck);
        runtime.currentIdx = Math.min(runtime.currentIdx, runtime.activeDeckCount);
      } else if (host.isParsingMode() && runtime.currentIdx + 1 >= runtime.activeDeckCount) {
        // Parsing has no SRS writes, so the standard end-of-cycle "no cards
        // due" splash never resolves on its own — reshuffle immediately
        // when the cursor would step past the last card. Rebuild through the
        // filtered focused pool (not buildStudyDeck on the stale originalDeck)
        // so any form that became 2/2 known mid-session is dropped by the
        // exclude-known-morphs filter. The just-shown card's id is forwarded
        // as avoidHeadId so it doesn't repeat at the head of the new cycle.
        const avoidHeadId = runtime.deck[runtime.currentIdx]
          ? runtime.deck[runtime.currentIdx].id
          : undefined;
        host.rebuildParsingCycle({ avoidHeadId });
      } else {
        runtime.currentIdx = Math.min(runtime.currentIdx + 1, runtime.activeDeckCount);
      }
      host.clearSpacedUndoSnapshot();
    } else if (runtime.activeDeckCount <= 0 && runtime.middleDeckCount > 0) {
      // The auto-'again' above drained the active pile with cards still
      // waiting in middle. Dump them in right away — mirroring markCard —
      // instead of parking on a "no cards due" splash that the user has to
      // press Next through. The just-reviewed card's id is forwarded so the
      // dump doesn't put that same card back on top.
      runtime.deck = host.buildStudyDeck(runtime.originalDeck, { forceShuffle: true, avoidHeadId: autoReviewedCardId });
      runtime.currentIdx = 0;
    } else {
      runtime.currentIdx = Math.min(runtime.currentIdx, runtime.activeDeckCount);
      host.maybeReturnConfirmedDeferredCard();
      host.maybePeriodicReshuffle();
    }
    host.resetMorphAnswerState();
    renderCard();
    renderReview();
    renderProgress();
    host.saveState();
    return;
  }

  if (host.isMorphologyMode() || host.isParsingMode()) {
    const nextIdx = runtime.currentIdx + 1;
    if (nextIdx >= runtime.deck.length) {
      if (host.isParsingMode()) {
        // Parsing: silent auto-reshuffle, no "end of round" splash.
        const avoidHeadId = runtime.deck[runtime.currentIdx]
          ? runtime.deck[runtime.currentIdx].id
          : undefined;
        host.startNextCycle('remaining', { avoidHeadId });
      } else if (host.getKnownCount() === runtime.originalDeck.length) {
        runtime.currentIdx = runtime.deck.length;
        runtime.unspacedPendingRecycle = false;
      } else {
        runtime.currentIdx = runtime.deck.length;
        runtime.unspacedPendingRecycle = true;
      }
    } else {
      runtime.currentIdx = nextIdx;
      runtime.unspacedPendingRecycle = false;
    }
    host.clearSpacedUndoSnapshot();
    host.resetMorphAnswerState();
    renderCard();
    renderReview();
    renderProgress();
    host.saveState();
    return;
  }

  // Vocab unspaced: Next acts as a neutral pass — moves the current card
  // to the back of the active queue and ticks the round counter, but
  // does not record a confidence sample or touch pass/fail/XP. The
  // pre-action state is pushed onto the unspaced history stack so a
  // subsequent Prev can step back through each Next press one by one.
  if (runtime.currentIdx < runtime.activeDeckCount) {
    const currentCard = runtime.deck[runtime.currentIdx];
    host.pushUnspacedHistory('next');
    applyUnspacedMark(currentCard, 'pass', { skipRecording: true });
    host.maybePeriodicReshuffle();
    host.resetMorphAnswerState();
    renderCard();
    renderReview();
    renderProgress();
    host.saveState();
    return;
  }

  // Cursor past the active section (e.g. every card archived via Easy).
  // Park at the end so renderCard shows the done state; the user clicks
  // "↻ Reset" (the morphed Next button) to restart.
  runtime.currentIdx = runtime.deck.length;
  runtime.unspacedPendingRecycle = false;
  host.resetMorphAnswerState();
  renderCard();
}

export function markCard(outcome) {
  // outcome: 'again' | 'pass' | 'easy'
  if (host.isMorphologyMode() || host.isParsingMode()) return;
  host.noteStudyInteraction();
  if ((!runtime.spacedRepetition && runtime.currentIdx >= runtime.deck.length) || (runtime.spacedRepetition && runtime.currentIdx >= runtime.activeDeckCount)) return;
  const currentCard = runtime.deck[runtime.currentIdx];
  if (runtime.spacedRepetition) {
    host.captureSpacedUndoSnapshot();
    host.applySpacedReview(currentCard, outcome);
    runtime.deck = host.buildStudyDeck(runtime.originalDeck);
    if (runtime.activeDeckCount <= 0) {
      // Active drained on this very mark. If middle has waiting cards, dump
      // them in so the user keeps moving rather than landing on the
      // empty-deck state and needing another Next press to recover. Forward
      // the just-marked card's id as avoidHeadId so the dump doesn't put
      // it first (an Again-marked card would otherwise be a likely head).
      if (runtime.middleDeckCount > 0) {
        runtime.deck = host.buildStudyDeck(runtime.originalDeck, { forceShuffle: true, avoidHeadId: currentCard && currentCard.id });
        runtime.currentIdx = 0;
      } else {
        runtime.currentIdx = runtime.activeDeckCount;
      }
      host.resetMorphAnswerState();
      renderCard();
    } else {
      navigate(1, { skipAutoReview: true });
    }
  } else {
    host.pushUnspacedHistory('mark');
    applyUnspacedMark(currentCard, outcome);
    renderCard();
  }
  renderReview();
  renderProgress();
  host.saveState();
}

// Unspaced flip-deck marking. Three sections: [active, middle, archived].
// - Hard ('again') / Uncertain ('pass') → move card to the back of the middle
//   section. It will NOT reappear until the active section drains and the
//   user reshuffles, dumping middle back into active.
// - Easy ('easy') → archive the card (mark 'known'); it stays out until the
//   user clicks Reset or picks a new session.
// All three outcomes still feed recordStudyOutcome so confidence/analytics
// reflect the response. applyUnspacedSharedSchedule keeps the legacy cycle
// bookkeeping in sync for any reader that still consults it.
// `options.skipRecording` makes the call a neutral queue-only nudge: the
// card moves to middle without recording confidence/XP. Used by the Next
// button in vocab unspaced mode.
function applyUnspacedMark(card, outcome, options = {}) {
  if (!card) return;
  const normalizedOutcome = outcome === 'easy' ? 'easy' : outcome === 'pass' ? 'pass' : 'again';
  if (!options.skipRecording) {
    const recordedOutcome = normalizedOutcome === 'easy' ? 'known' : normalizedOutcome === 'pass' ? 'pass' : 'review';
    const reviewedAt = Date.now();
    host.recordStudyOutcome(card.id, recordedOutcome, reviewedAt);
    host.applyUnspacedSharedSchedule(card, normalizedOutcome, reviewedAt);
  }

  const directionalMarks = host.getDirectionalMarksStore();
  const fromIdx = runtime.deck.findIndex(c => c && c.id === card.id);
  if (!runtime.unspacedMiddleIds) runtime.unspacedMiddleIds = new Set();

  if (normalizedOutcome === 'easy') {
    directionalMarks[card.id] = 'known';
    runtime.unspacedMiddleIds.delete(card.id);
    host.noteUnspacedArchiveActivity();
    if (fromIdx >= 0) {
      runtime.deck.splice(fromIdx, 1);
      runtime.deck.push(card);
    }
  } else {
    // Hard / Uncertain: move card into the middle section. Insert at the end
    // of middle (= start of archived), so middle preserves insertion order
    // — earliest-marked cards reshuffle first.
    delete directionalMarks[card.id];
    runtime.unspacedMiddleIds.add(card.id);
    if (fromIdx >= 0) {
      runtime.deck.splice(fromIdx, 1);
      // After splice, find first archived card; insert just before it so the
      // card lands at the tail of middle. If nothing is archived yet, push
      // to the deck tail.
      const splitAt = runtime.deck.findIndex(c => c && directionalMarks[c.id] === 'known');
      const insertAt = splitAt === -1 ? runtime.deck.length : splitAt;
      runtime.deck.splice(insertAt, 0, card);
    }
  }

  runtime.marks = directionalMarks;
  // active = unmarked AND not in middle; middle = unmarked AND in middle.
  runtime.activeDeckCount = runtime.deck.filter(c => directionalMarks[c.id] !== 'known' && !runtime.unspacedMiddleIds.has(c.id)).length;
  runtime.unspacedMiddleCount = runtime.deck.filter(c => directionalMarks[c.id] !== 'known' && runtime.unspacedMiddleIds.has(c.id)).length;
  runtime.unspacedRoundMarks = (Number(runtime.unspacedRoundMarks) || 0) + 1;

  // Round complete = active is empty. Park at deck.length so renderCard
  // shows the "End of round" (middle has cards) or "Session complete"
  // (middle empty) state. The user's next press at deck.length is where
  // the reshuffle (middle → active) actually happens, so they get a beat
  // to pause/reset before the next pass starts.
  if (runtime.activeDeckCount === 0) {
    runtime.currentIdx = runtime.deck.length;
    if (runtime.unspacedMiddleCount === 0) {
      // Everything archived; clear the round counter too so a re-entry into
      // the deck doesn't inherit stale bookkeeping.
      runtime.unspacedRoundSize = 0;
      runtime.unspacedRoundMarks = 0;
    }
  } else {
    // Mid-round: the splice shifted later cards into our slot, so currentIdx
    // already points at the next card. Clamp to the new active count.
    runtime.currentIdx = Math.min(runtime.currentIdx, Math.max(0, runtime.activeDeckCount - 1));
    // Edge case: marking Hard/Uncertain on the very last active position
    // moves the card back to the same slot. Wrap so the learner doesn't see
    // the same card twice in a row.
    const cursorCard = runtime.deck[runtime.currentIdx];
    if (normalizedOutcome !== 'easy' && cursorCard && cursorCard.id === card.id) {
      runtime.currentIdx = 0;
    }
  }

  runtime.unspacedPendingRecycle = false;
  runtime.isFlipped = false;
}

function reshuffleUnspacedRound(directionalMarks) {
  const marks = directionalMarks || host.getDirectionalMarksStore();
  // Reshuffle = end of a round. Middle dumps back into active (everyone
  // unmarked is now eligible again), the combined pile is shuffled, and the
  // round counter resets. Archived cards stay archived.
  runtime.unspacedMiddleIds = new Set();
  runtime.unspacedMiddleCount = 0;
  const active = runtime.deck.filter(c => c && marks[c.id] !== 'known');
  const known = runtime.deck.filter(c => c && marks[c.id] === 'known');
  runtime.deck = [...shuffleArray(active), ...known];
  runtime.activeDeckCount = active.length;
  runtime.currentIdx = 0;
  runtime.unspacedRoundSize = active.length;
  runtime.unspacedRoundMarks = 0;
}

// Seed the round counters whenever we (re)build an unspaced deck, so the very
// first mark doesn't trigger a phantom "round complete" against a stale size.
export function resetUnspacedRoundForActiveDeck() {
  if (runtime.spacedRepetition) {
    runtime.unspacedRoundSize = 0;
    runtime.unspacedRoundMarks = 0;
    return;
  }
  const directionalMarks = host.getDirectionalMarksStore();
  runtime.unspacedRoundSize = runtime.deck.filter(c => c && directionalMarks[c.id] !== 'known').length;
  runtime.unspacedRoundMarks = 0;
}

// Empty-deck "Reset" path: archived all cards, user pressed the Next button
// (which now reads "↻ Reset"). Clears archives + reshuffles, no modal.
export function resetUnspacedDeckNoConfirm() {
  if (runtime.spacedRepetition) return;
  if (!runtime.selectedKeys.length) return;
  host.clearSpacedUndoSnapshot();
  const directionalMarks = host.getDirectionalMarksStore();
  (runtime.originalDeck || []).forEach(card => {
    delete directionalMarks[card.id];
  });
  runtime.marks = directionalMarks;
  host.resetUnspacedCycleState();
  runtime.unspacedPendingRecycle = false;
  runtime.currentIdx = 0;
  runtime.isFlipped = false;
  host.resetMorphAnswerState();
  runtime.deck = host.buildStudyDeck(runtime.originalDeck);
  resetUnspacedRoundForActiveDeck();
  renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}

export function setStudyMode(mode) {
  const nextMode = host.normalizeStudyMode(mode);
  if (runtime.studyMode === nextMode) return;

  const prevMode = runtime.studyMode;
  host.saveCurrentDeckStateToBank();
  // Parsing mode owns its chapter scope via runtime.parsingChapter (the
  // dropdown above the focused paradigm). It must never share selectedKeys
  // with vocab/morph, regardless of splitSelection — otherwise entering
  // parsing would clobber the vocab/morph chapter pick, and leaving would
  // leak the parsing chapter back into them. So we always save/restore
  // around any parsing transition; the regular splitSelection swap handles
  // vocab↔morph as before.
  const parsingTransition = prevMode === 'parsing' || nextMode === 'parsing';
  if (runtime.splitSelection || parsingTransition) {
    // When splitSelection is OFF and we're entering parsing, the current
    // selection is shared by vocab+morph. Stash it under both slots so the
    // user lands back on the right chapter regardless of which mode they
    // return to first.
    if (!runtime.splitSelection && nextMode === 'parsing' && (prevMode === 'vocab' || prevMode === 'morph')) {
      saveModeSelection('vocab');
      saveModeSelection('morph');
    } else {
      saveModeSelection(prevMode);
    }
    restoreModeSelection(nextMode);
  }
  // Swap the spaced-repetition flag to the section we're entering. Save the
  // mode we're leaving back into spacedByMode first (vocab/morph each keep
  // their own), then mirror the destination's value into the live flag so the
  // deck build below and the toggle UI reflect this section's setting.
  if (prevMode === 'vocab' || prevMode === 'morph') {
    runtime.spacedByMode[prevMode] = runtime.spacedRepetition;
  }
  if (nextMode === 'vocab' || nextMode === 'morph') {
    runtime.spacedRepetition = effectiveSpacedForMode(nextMode);
  }
  runtime.studyMode = nextMode;
  // Entering parsing: the dropdown is the source of truth, so overwrite
  // selectedKeys with [parsingChapter] (a chapter-keyed string, which
  // deriveSelectionLevels reads as the max effective chapter). Any stale
  // modeSelections.parsing entry from before this feature is overridden.
  if (nextMode === 'parsing') {
    const chapter = Number.isInteger(runtime.parsingChapter) && runtime.parsingChapter >= 1 && runtime.parsingChapter <= 20
      ? runtime.parsingChapter
      : 20;
    runtime.parsingChapter = chapter;
    runtime.selectedKeys = [String(chapter)];
    runtime.currentSession = null;
  }
  host.clearSpacedUndoSnapshot();
  host.resetMorphAnswerState();
  host.ensureDirectionalStores();
  runtime.marks = host.getDirectionalMarksStore();
  host.syncToggleButtons();

  if (host.isReaderMode()) {
    host.renderReaderModule();
    renderProgress();
    host.saveState();
    return;
  }

  if (!runtime.selectedKeys.length) {
    // Switching into a mode with nothing selected (common when split
    // vocab/grammar selection is on and only one side has chapters): drop the
    // deck we carried over from the mode we just left. Without this the stale
    // deck stays in runtime.deck and its cards leak through — e.g. grammar
    // cards rendering in an empty vocab deck — and the progress/review panels
    // keep summarizing it. saveCurrentDeckStateToBank() ran above, so the
    // previous deck's resume cursor is already banked.
    runtime.deck = [];
    runtime.originalDeck = [];
    runtime.activeDeckRef = null;
    runtime.currentIdx = 0;
    runtime.activeDeckCount = 0;
    host.saveState();
    renderCard();
    renderProgress();
    renderReview();
    return;
  }

  const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
  loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
}

export function setAppProfile(profile) {
  const nextProfile = 'vocab_grammar';
  if (runtime.appProfile === nextProfile) return;

  host.saveCurrentDeckStateToBank();
  runtime.appProfile = nextProfile;
  host.clearSpacedUndoSnapshot();

  host.ensureDirectionalStores();
  runtime.marks = host.getDirectionalMarksStore();
  buildSessions();
  buildChapterSelector();
  buildSupplementalSelector();
  buildAdvancedSelector();
  host.syncToggleButtons();

  if (!runtime.selectedKeys.length) {
    renderCard();
    renderProgress();
    renderReview();
    host.saveState();
    return;
  }

  const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
  loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
}

export function toggleMorphSelfCheck() {
  if (!host.isMorphologyMode()) return;
  runtime.morphSelfCheck = !runtime.morphSelfCheck;
  host.resetMorphAnswerState();
  host.syncToggleButtons();
  renderCard();
  host.saveState();
}

// Step-by-step parsing drill — alternate render path for morph cards that
// Legacy no-op: Parse step-by-step used to be a toggle inside Grammar mode.
// It's now its own top-level study mode (setStudyMode('parsing')); kept as
// a stub so saved/imported state that still references it doesn't error.
export function toggleMorphStepByStep() {
  // Intentionally empty — see setStudyMode('parsing') instead.
}

export function setMorphFocusedParadigm(lemma) {
  if (!host.isParsingMode()) return;
  runtime.morphFocusedParadigm = lemma || null;
  host.resetMorphStepState();
  host.rebuildMorphDeckForStepMode();
  host.syncToggleButtons();
  renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}

export function toggleShuffle() {
  if (host.isReaderMode()) return;
  runtime.shuffled = !runtime.shuffled;
  runtime.flipsSinceReshuffle = 0;
  host.syncToggleButtons();

  if (runtime.spacedRepetition) {
    runtime.deck = host.buildStudyDeck(runtime.originalDeck, { forceShuffle: runtime.shuffled });
    runtime.currentIdx = Math.min(runtime.currentIdx, runtime.activeDeckCount);
  } else {
    // Toggling shuffle (either direction) collapses the middle pile back
    // into active so the deck order matches the partition state. Without
    // this, unspacedMiddleIds keeps cards earmarked as middle even though
    // they're now interleaved with active in runtime.deck, leaving
    // activeDeckCount/unspacedMiddleCount out of sync with what the user sees.
    runtime.unspacedMiddleIds = new Set();
    runtime.unspacedMiddleCount = 0;
    const activeCards = host.getRemainingCards();
    const knownCards = runtime.deck.filter(card => runtime.marks[card.id] === 'known');
    runtime.deck = runtime.shuffled ? [...shuffleArray([...activeCards]), ...knownCards] : [...activeCards, ...knownCards];
    runtime.activeDeckCount = activeCards.length;
    runtime.unspacedRoundSize = activeCards.length;
    runtime.unspacedRoundMarks = 0;

    if (runtime.currentIdx >= activeCards.length) {
      runtime.currentIdx = activeCards.length ? 0 : runtime.deck.length;
    }
  }

  runtime.isFlipped = false;
  renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}

export function toggleRequiredOnly() {
  runtime.requiredOnly = !runtime.requiredOnly;
  host.syncToggleButtons();
  if (!runtime.selectedKeys.length) {
    host.saveState();
    return;
  }
  const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
  loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
}

export function toggleHardVocabReview() {
  runtime.hardVocabReviewMode = !runtime.hardVocabReviewMode;
  host.syncToggleButtons();
  if (!runtime.selectedKeys.length) {
    host.saveState();
    return;
  }
  const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
  loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
}

// Stem & declension notes (inline stems, principal-parts line, "declines
// like" pointer) are render-only annotations on standard vocab cards —
// flipping the toggle re-renders the current card; the deck is untouched.
export function toggleStemNotes() {
  runtime.stemNotes = runtime.stemNotes === false;
  host.syncToggleButtons();
  host.saveState();
  renderCard();
}

// Second aorists as their own cards (e.g. εἶπον alongside λέγω). Unlike
// stem notes this changes the deck's contents, so it rebuilds the deck the
// same way toggleRequiredOnly does.
export function toggleSecondAoristCards() {
  runtime.secondAoristCards = !runtime.secondAoristCards;
  host.syncToggleButtons();
  if (!runtime.selectedKeys.length) {
    host.saveState();
    return;
  }
  const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
  loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
}

export function toggleDirection() {
  runtime.directionToGreek = !runtime.directionToGreek;
  host.clearSpacedUndoSnapshot();
  host.ensureDirectionalStores();
  runtime.marks = host.getDirectionalMarksStore();
  host.resetMorphAnswerState();
  host.syncToggleButtons();
  if (runtime.selectedKeys.length) {
    const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
    loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
    return;
  }
  runtime.isFlipped = false;
  renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}

export function toggleSpacedRepetition() {
  if (host.isReaderMode()) return;
  runtime.spacedRepetition = !runtime.spacedRepetition;
  // Persist this section's choice so vocab and grammar keep diverging.
  if (runtime.studyMode === 'vocab' || runtime.studyMode === 'morph') {
    runtime.spacedByMode[runtime.studyMode] = runtime.spacedRepetition;
  }
  host.clearSpacedUndoSnapshot();
  host.resetUnspacedCycleState();
  host.syncToggleButtons();
  if (!runtime.selectedKeys.length) {
    host.saveState();
    return;
  }
  runtime.deck = host.buildStudyDeck(runtime.originalDeck);
  runtime.currentIdx = 0;
  // spacedRepetition is part of the deck-state-bank key, so the deck now
  // belongs to a different bank entry — refresh the ref before any save.
  host.markActiveDeckRef();
  host.resetMorphAnswerState();
  runtime.isFlipped = false;
  renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}

// Toggle the unspaced "Daily archive reset" preference. When on, the next
// time the app sees the 5 AM-cutoff day key has rolled over from the last
// archive activity it wipes the unspaced 'known' marks. When off,
// Easy-archived cards persist indefinitely until the user resets.
export function toggleUnspacedDailyReset() {
  runtime.unspacedAutoResetEnabled = !runtime.unspacedAutoResetEnabled;
  if (runtime.unspacedAutoResetEnabled) {
    // Re-seed on every opt-in so the auto-clear fires on the *next*
    // 5 AM boundary, never the moment of opt-in. Without this, flipping
    // the toggle off+on across a day rollover would surprise the user
    // by wiping archives the instant they re-enable it.
    host.noteUnspacedArchiveActivity();
  }
  host.syncToggleButtons();
  host.saveState();
}

export function toggleSplitSelection() {
  runtime.splitSelection = !runtime.splitSelection;
  if (runtime.splitSelection) {
    // Seed both modes with the current selection; they diverge from here.
    const snapshot = () => ({
      selectedKeys: [...runtime.selectedKeys],
      currentSessionId: runtime.currentSession ? runtime.currentSession.id : null
    });
    runtime.modeSelections = { vocab: snapshot(), morph: snapshot() };
  } else {
    runtime.modeSelections = {};
  }
  host.syncToggleButtons();
  host.saveState();
}

export function toggleAspectStep() {
  runtime.aspectStep = !runtime.aspectStep;
  // Reset any in-flight step state so the next render rebuilds the walk
  // with the new step set (otherwise the cached state still has the old
  // step list with/without aspect).
  runtime.morphStepState = { cardId: null, steps: [], stepIdx: 0, answers: [], completed: false };
  host.syncToggleButtons();
  renderCard();
  host.saveState();
}

const DIM_TOGGLE_KEYS = new Set(['tense', 'voice', 'mood', 'person', 'number', 'case', 'gender']);

// Toggles the parsing walk's step for one dimension on or off. Off →
// step skipped, dim doesn't count toward stats, omitted from the
// final parse summary, and the form lookup silently auto-fills the
// canonical correct value. Aspect has its own toggle (toggleAspectStep)
// since it predates this generic mechanism.
export function toggleDimStep(dimKey) {
  if (!DIM_TOGGLE_KEYS.has(dimKey)) return;
  if (!runtime.dimToggles || typeof runtime.dimToggles !== 'object') {
    runtime.dimToggles = {};
  }
  runtime.dimToggles[dimKey] = runtime.dimToggles[dimKey] === false;
  runtime.morphStepState = { cardId: null, steps: [], stepIdx: 0, answers: [], completed: false };
  host.syncToggleButtons();
  renderCard();
  host.saveState();
}

// Opt in/out of drilling LEMMA_INVENTORY.optionalFormGroups. Affects the
// parsing card pool (not the fallback form-lookup, which always
// consults extraForms). When the user is in parsing mode and has a
// focused paradigm, the deck has to be reloaded so the newly-included
// (or excluded) optional cards take effect; outside parsing mode the
// flag still flips and persists but nothing visible changes until the
// next parsing session.
export function toggleOptionalForms() {
  runtime.includeOptionalForms = !runtime.includeOptionalForms;
  host.syncToggleButtons();
  if (!runtime.selectedKeys.length) {
    host.saveState();
    return;
  }
  const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
  loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
}

// Drop any card whose last two parsing attempts are both correct (2/2)
// from the parsing deck. The 1/1 "single right answer so far" state is
// intentionally kept in the pool — the user has to demonstrate the form
// twice before parsing mode skips it. Rebuilds the deck immediately so
// the toggle takes effect mid-session; outside parsing mode the flag
// still flips and persists but the deck isn't rebuilt (vocab/grammar
// don't read it).
export function toggleExcludeKnownMorphs() {
  runtime.excludeKnownMorphs = !runtime.excludeKnownMorphs;
  host.syncToggleButtons();
  if (!runtime.selectedKeys.length) {
    host.saveState();
    return;
  }
  const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
  loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
}

// English → Greek parsing direction. Flips parsing between the forward
// dimensional walk and the reverse "pick the form for this parse" MC. Only
// meaningful in parsing mode. Drops any in-flight walk / reverse cache /
// answer feedback so the current card restarts cleanly in the new direction,
// then rebuilds the deck (same focused-paradigm pool, rendered the other way).
export function toggleParsingReverse() {
  if (!host.isParsingMode()) return;
  runtime.parsingReverse = !runtime.parsingReverse;
  host.resetMorphStepState();
  runtime.parsingReverseState = { cardId: null, options: [], correctForm: '' };
  host.resetMorphAnswerState();
  host.syncToggleButtons();
  if (!runtime.selectedKeys.length) {
    host.saveState();
    return;
  }
  const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
  loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
}

// Toggle the curated accent/breathing look-alike distractors in the reverse
// (English → Greek) drill. Off by default. Only the reverse drill reads it, so
// flipping it just drops the cached MC options for the current card and
// re-renders — no deck reload needed.
export function toggleAccentLookalikes() {
  runtime.accentLookalikes = !runtime.accentLookalikes;
  runtime.parsingReverseState = { cardId: null, options: [], correctForm: '' };
  host.resetMorphAnswerState();
  host.syncToggleButtons();
  renderCard();
  host.saveState();
}

// Reset every form's per-form tally to 0/2 — drops the `recent` attempts
// (and the seen count) on a lemma's forms map. Per-paradigm rolling
// %, the completed bucket history, in-progress counters, and the
// cross-paradigm overall are intentionally kept; "Clear parsing stats"
// remains the option for wiping those too. Lets the user re-verify a
// paradigm from scratch without losing the long-term performance record.
// The parsing-mode "Reset known" button replaces vocab/grammar's
// Reset-deck/Reset-required pair (neither applies in parsing: no SRS
// state, no required-vs-supplemental split).
//
// The button opens a modal that scopes the reset: just the currently
// focused paradigm, or every paradigm the user has drilled.
export function resetKnownMorphs() {
  openResetKnownModal();
}

function openResetKnownModal() {
  const overlay = document.getElementById('resetKnownOverlay');
  if (!overlay) {
    // Fall back to the legacy single-confirm (all paradigms) if the modal
    // markup isn't present (e.g. an older cached index.html on a PWA install).
    if (window.confirm('Set every form back to 0/2 attempts? This clears the per-form "known" tally so parsing forms read as unseen again. Per-paradigm % and history are kept.')) {
      performResetKnown('all');
    }
    return;
  }
  // Name the focused paradigm in the copy + on the button so "current
  // paradigm only" is unambiguous. With nothing focused, hide that option
  // and leave only the all-paradigms reset.
  const focused = runtime.morphFocusedParadigm || '';
  const lemmaEl = overlay.querySelector('#resetKnownFocusedLemma');
  if (lemmaEl) lemmaEl.textContent = focused || 'the current paradigm';
  const focusedRow = overlay.querySelector('#resetKnownFocusedRow');
  if (focusedRow) focusedRow.style.display = focused ? '' : 'none';
  const focusedBtn = overlay.querySelector('#resetKnownFocusedBtn');
  if (focusedBtn) {
    focusedBtn.style.display = focused ? '' : 'none';
    focusedBtn.textContent = focused ? `Reset ${focused}` : 'Current paradigm only';
  }
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

export function closeResetKnownModal() {
  const overlay = document.getElementById('resetKnownOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  const anyOtherOpen = document.querySelector('.consent-overlay.show');
  if (!anyOtherOpen) document.body.classList.remove('modal-open');
  shieldClicksBriefly();
}

export function confirmResetKnownFocused() {
  closeResetKnownModal();
  performResetKnown('focused');
}

export function confirmResetKnownAll() {
  closeResetKnownModal();
  performResetKnown('all');
}

// Clear per-form tallies. `scope === 'focused'` clears only the currently
// focused paradigm's forms map; any other value clears every lemma's.
function performResetKnown(scope) {
  const stats = runtime.paradigmStepStats;
  if (stats && stats.byLemma && typeof stats.byLemma === 'object') {
    if (scope === 'focused') {
      const focused = runtime.morphFocusedParadigm;
      const entry = focused && stats.byLemma[focused];
      if (entry && typeof entry === 'object') entry.forms = {};
    } else {
      Object.keys(stats.byLemma).forEach((lemma) => {
        const entry = stats.byLemma[lemma];
        if (entry && typeof entry === 'object') entry.forms = {};
      });
    }
  }
  host.resetMorphAnswerState();
  // Round-trip through loadDeckFromKeys so any 2/2-known forms that the
  // exclude-known-morphs filter dropped at deck-build time come back into
  // scope now that they read as unseen again.
  if (runtime.selectedKeys.length) {
    const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
    loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
  } else {
    renderCard();
    renderProgress();
    renderReview();
  }
  host.saveState();
}

// Wipe the parsing module's stats record completely — everything that
// resetKnownMorphs intentionally keeps. Drops every lemma's rolling attempts
// window and per-form recent tallies (and therefore every per-paradigm % and
// the mood/tense breakdown) back to a fresh empty store. Scoped to parsing
// only: it touches nothing but runtime.paradigmStepStats, so vocab/morphology/
// reader stats, marks, spaced-review scheduling, achievements, and study-time
// history are all left untouched (the global "Reset stats" never wrote paradigm
// stats in the first place, so this is the only way to clear them). Rebuilds
// the deck so any forms the exclude-known-morphs filter had dropped come back
// into scope now that the record is empty.
export function clearParsingStats() {
  if (!window.confirm('Clear ALL parsing stats? This wipes every paradigm\'s accuracy %, the per-mood/tense breakdown, and per-form tallies. Only parsing stats are affected — vocab, morphology, and reader progress are kept. No undo.')) return;
  runtime.paradigmStepStats = { byLemma: {} };
  host.resetMorphAnswerState();
  if (runtime.selectedKeys.length) {
    const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
    loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
  } else {
    renderCard();
    renderProgress();
    renderReview();
  }
  host.saveState();
}

const OPTIONAL_FILTER_KEYS = new Set(['imperative', 'subjunctive', 'infinitive', 'participle', 'thirdPerson', 'futureTense', 'perfectTense']);

// Per-category filter on the optional-form pool. Off → cards whose
// canonical parse contains that category are excluded from the drill
// deck. Filters do nothing when includeOptionalForms is off (no
// optional cards in the pool to filter), and never affect the
// always-on fallback form-lookup. Flipping a filter rebuilds the
// deck so the change shows up immediately, mirroring how
// toggleOptionalForms / toggleRequiredOnly behave.
export function toggleOptionalFormFilter(filterKey) {
  if (!OPTIONAL_FILTER_KEYS.has(filterKey)) return;
  if (!runtime.optionalFormFilters || typeof runtime.optionalFormFilters !== 'object') {
    runtime.optionalFormFilters = {};
  }
  runtime.optionalFormFilters[filterKey] = runtime.optionalFormFilters[filterKey] === false;
  host.syncToggleButtons();
  if (!runtime.selectedKeys.length) {
    host.saveState();
    return;
  }
  const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
  loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
}

// Canonical primary values for each dim's per-value sub-filter. Composite
// values (e.g. 'continuous/undefined', 'middle/passive') and aorist
// qualifiers ('first aorist'/'second aorist') aren't toggled independently
// — they normalize to their primary component(s) for filter matching, so
// disabling 'aorist' excludes both first- and second-aorist cards, and a
// 'middle/passive' card stays in scope as long as 'middle' OR 'passive' is
// enabled. Mirrors the structure of OPTIONAL_FILTER_KEYS but nested per
// dim.
//
// Aspect's continuous + undefined are bundled behind a single
// 'continuousUndefined' UI key (Duff treats the two as a unit — present
// and future forms are aspectually ambiguous between them — so a single
// toggle that flips both halves at once matches the pedagogy).
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

// Maps a UI filter key to the underlying canonical values it controls.
// Most keys map 1:1; aspect's 'continuousUndefined' fans out to both
// 'continuous' and 'undefined' so flipping the UI toggle once excludes
// the whole imperfective/aoristic group together.
function dimFilterUnderlyingValues(dimKey, value) {
  if (dimKey === 'aspect' && value === 'continuousUndefined') {
    return ['continuous', 'undefined'];
  }
  return [value];
}

// Per-value sub-filter under one parsing dim. Flipping a value off both
// excludes cards whose parse resolves to that value (deck-pool) AND prunes
// the value from the walk's MC distractor list (the correct value is
// always kept regardless). Rebuilds the deck the same way
// toggleOptionalFormFilter does so the change takes effect immediately
// in parsing mode; outside parsing mode the rebuild is a no-op for the
// dim filter but still re-syncs the UI.
export function toggleDimValueFilter(dimKey, value) {
  const allowed = DIM_VALUE_FILTER_VALUES[dimKey];
  if (!allowed || !allowed.includes(value)) return;
  if (!runtime.dimValueFilters || typeof runtime.dimValueFilters !== 'object') {
    runtime.dimValueFilters = {};
  }
  if (!runtime.dimValueFilters[dimKey] || typeof runtime.dimValueFilters[dimKey] !== 'object') {
    runtime.dimValueFilters[dimKey] = {};
  }
  const underlying = dimFilterUnderlyingValues(dimKey, value);
  // Determine the new combined state from the first underlying key, then
  // mirror it onto every member of the group so the bundled toggle never
  // splits halfway (e.g. 'continuous' off + 'undefined' on).
  const newState = runtime.dimValueFilters[dimKey][underlying[0]] === false;
  underlying.forEach((u) => {
    runtime.dimValueFilters[dimKey][u] = newState;
  });
  runtime.morphStepState = { cardId: null, steps: [], stepIdx: 0, answers: [], completed: false };
  host.syncToggleButtons();
  if (!runtime.selectedKeys.length) {
    host.saveState();
    return;
  }
  const keysToLoad = runtime.currentSession ? expandSessionSets(runtime.currentSession) : runtime.selectedKeys;
  loadDeckFromKeys(keysToLoad, runtime.currentSession ? runtime.currentSession.id : null);
}

export function reshuffleEligible() {
  if (!runtime.selectedKeys.length) return;

  if (runtime.spacedRepetition) {
    // Shuffle only currently-eligible (due) cards. SRS progress and
    // scheduled-ahead deferrals are left untouched.
    runtime.deck = host.buildStudyDeck(runtime.originalDeck, { forceShuffle: true });
    runtime.currentIdx = runtime.activeDeckCount ? 0 : runtime.currentIdx;
  } else {
    // Non-spaced: shuffle the still-active (not-yet-known) portion only;
    // known cards stay pinned to the end of the cycle. Equivalent to an
    // end-of-round reshuffle — middle dumps back into active first so
    // unspacedMiddleIds stays aligned with the visible deck order.
    runtime.unspacedMiddleIds = new Set();
    runtime.unspacedMiddleCount = 0;
    const activeCards = host.getRemainingCards();
    const knownCards = runtime.deck.filter(card => runtime.marks[card.id] === 'known');
    runtime.deck = [...shuffleArray([...activeCards]), ...knownCards];
    runtime.activeDeckCount = activeCards.length;
    runtime.unspacedRoundSize = activeCards.length;
    runtime.unspacedRoundMarks = 0;
    runtime.currentIdx = activeCards.length ? 0 : runtime.deck.length;
  }

  runtime.isFlipped = false;
  renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}

function fastForwardScheduling(advanceMs) {
  if (!runtime.spacedRepetition || !runtime.originalDeck.length) return;
  host.advanceScheduledCards(runtime.originalDeck, advanceMs);
  runtime.deck = host.buildStudyDeck(runtime.originalDeck);
  runtime.currentIdx = 0;
  runtime.isFlipped = false;
  host.resetMorphAnswerState();
  renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}

export function fastForwardOneDay() {
  fastForwardScheduling(SRS_DAY_MS);
}

export function fastForwardOneWeek() {
  fastForwardScheduling(7 * SRS_DAY_MS);
}

export function resetCurrentDeck() {
  if (!runtime.selectedKeys.length) {
    host.clearSpacedUndoSnapshot();
    host.clearSavedState();
    return;
  }

  if (runtime.spacedRepetition) {
    openResetSpacedModal();
    return;
  }

  openResetUnspacedModal();
}

// Shortcut entry point: opens the same reset modal as `resetCurrentDeck`
// but pre-checks the "Required cards only" scope so the action only touches
// graded vocabulary in the current selection. The user still chooses
// between "Set all to now" and "Reset progress" inside the spaced modal.
export function resetRequiredOnly() {
  if (!runtime.selectedKeys.length) return;
  const overlayId = runtime.spacedRepetition ? 'resetSpacedOverlay' : 'resetUnspacedOverlay';
  if (runtime.spacedRepetition) {
    openResetSpacedModal();
  } else {
    openResetUnspacedModal();
  }
  const overlay = document.getElementById(overlayId);
  const checkbox = overlay && overlay.querySelector('input[type="checkbox"][data-reset-required-only]');
  if (checkbox) checkbox.checked = true;
}

// Returns true when a card should be touched by the reset operation,
// given the "Required cards only" scope toggle in the reset modal.
function shouldResetCard(card, requiredOnly) {
  if (!requiredOnly) return true;
  return !!(card && card.required);
}

// The reset modal targets the *current selection*, not the current deck.
// runtime.originalDeck is already filtered to required-only when the
// study toggle is on, so iterating it would silently skip non-required
// cards on a whole-deck reset. Pull the full selection here and let
// shouldResetCard apply the modal's own scope toggle.
function getResetScopeCards() {
  const allSelected = host.getSelectedCards(runtime.selectedKeys);
  return Array.isArray(allSelected) && allSelected.length ? allSelected : runtime.originalDeck;
}

function performUnspacedDeckReset(requiredOnly) {
  if (!requiredOnly) {
    // Whole-deck reset still clears the saved deck-state for this combo.
    const deckKey = host.getDeckStateKey(runtime.selectedKeys, runtime.requiredOnly, runtime.spacedRepetition);
    delete runtime.deckStates[deckKey];
  }
  const directionalMarks = host.getDirectionalMarksStore();

  getResetScopeCards().forEach(card => {
    if (!shouldResetCard(card, requiredOnly)) return;
    delete directionalMarks[card.id];
  });

  runtime.marks = directionalMarks;
  host.resetUnspacedCycleState();
  runtime.unspacedPendingRecycle = false;
  runtime.currentIdx = 0;
  runtime.isFlipped = false;
  host.resetMorphAnswerState();
  runtime.deck = [];
  runtime.activeDeckCount = 0;
  runtime.deck = host.buildStudyDeck(runtime.originalDeck);
  resetUnspacedRoundForActiveDeck();
  renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}

function performSpacedProgressReset(requiredOnly) {
  if (!requiredOnly) {
    const deckKey = host.getDeckStateKey(runtime.selectedKeys, runtime.requiredOnly, runtime.spacedRepetition);
    delete runtime.deckStates[deckKey];
  }
  const directionalProgress = host.getDirectionalProgressStore();

  getResetScopeCards().forEach(card => {
    if (!shouldResetCard(card, requiredOnly)) return;
    const p = directionalProgress[card.id];
    if (p && typeof p === 'object') {
      p.dueAt = 0;
      p.intervalDays = 0;
      p.streak = 0;
      p.easyStreak = 0;
      p.srsStage = 0;
      p.ease = 2.3;
      p.lastEasyIntervalDays = 0;
      p.confidence = 0;
      p.confidenceHistory = [];
      // The SRS scheduling is gone, so the last spaced outcome can no
      // longer describe a real scheduled state. Leaving it set made the
      // per-word analytics show "lastOutcome: easy" alongside stage 0 /
      // ease 2.30 / no due date.
      delete p.lastSpacedOutcome;
      // seenCount, passCount, failCount, lastReviewedAt intentionally kept
    }
  });

  runtime.marks = host.getDirectionalMarksStore();
  host.resetUnspacedCycleState();
  runtime.currentIdx = 0;
  runtime.isFlipped = false;
  host.resetMorphAnswerState();
  runtime.deck = [];
  runtime.activeDeckCount = 0;
  runtime.deck = host.buildStudyDeck(runtime.originalDeck);
  renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}

function performSpacedTimingReset(requiredOnly) {
  const directionalProgress = host.getDirectionalProgressStore();

  getResetScopeCards().forEach(card => {
    if (!shouldResetCard(card, requiredOnly)) return;
    const p = directionalProgress[card.id];
    if (p && typeof p === 'object') {
      p.dueAt = 0;
      p.intervalDays = 0;
      // streak, easyStreak, srsStage, ease, lastEasyIntervalDays,
      // confidence, confidenceHistory intentionally kept
    }
  });

  runtime.currentIdx = 0;
  runtime.isFlipped = false;
  host.resetMorphAnswerState();
  runtime.deck = host.buildStudyDeck(runtime.originalDeck);
  renderCard();
  renderProgress();
  renderReview();
  host.saveState();
}

// Levels the future due-date pile-up: finishing a deck shortly after a
// timing reset hands most cards the same interval, so they all land on the
// same future day (typically the 14-day cap). This re-spreads the pile so
// roughly the same number of cards come due each day, with two guarantees:
// cards due within the next 3 study-days are never touched (short intervals
// are the stabilization churn — pulling them around would fight the
// scheduler), and no card is ever pushed later than it already is.
// intervalDays is left alone on purpose: it records the interval the card
// *earned*, which seeds the next 'easy' growth — reviewing a few days early
// shouldn't shrink a card's future intervals.
function performSpacedScheduleSmooth(requiredOnly) {
  const directionalProgress = host.getDirectionalProgressStore();
  const now = Date.now();
  const protectedUntil = now + 3 * SRS_DAY_MS;

  const entries = [];
  getResetScopeCards().forEach(card => {
    if (!shouldResetCard(card, requiredOnly)) return;
    const p = directionalProgress[card.id];
    if (p && typeof p === 'object' && Number(p.dueAt) > protectedUntil) entries.push(p);
  });
  if (entries.length < 2) return;
  entries.sort((a, b) => a.dueAt - b.dueAt);

  // Spread across study-days 4..lastDay, where lastDay is the latest
  // currently-scheduled day — smoothing flattens the curve, it never
  // extends it.
  const lastDay = Math.ceil((entries[entries.length - 1].dueAt - now) / SRS_DAY_MS);
  const spreadDays = lastDay - 3;
  if (spreadDays < 2) return;
  entries.forEach((p, i) => {
    const targetDay = 4 + Math.floor((i * spreadDays) / entries.length);
    const targetDueAt = now + targetDay * SRS_DAY_MS;
    if (targetDueAt < p.dueAt) p.dueAt = targetDueAt;
  });

  // Nothing becomes due immediately (earliest target is day 4), so the
  // active deck is unchanged — only the review panel's due times moved.
  renderProgress();
  renderReview();
  host.saveState();
}

// True if the reset-scope toggle in the given modal is checked.
function isResetScopeRequiredOnly(modalId) {
  const overlay = document.getElementById(modalId);
  if (!overlay) return false;
  const checkbox = overlay.querySelector('input[type="checkbox"][data-reset-required-only]');
  return !!(checkbox && checkbox.checked);
}

function openResetSpacedModal() {
  const overlay = document.getElementById('resetSpacedOverlay');
  if (!overlay) {
    // Fall back to legacy confirm if the modal markup isn't present.
    if (window.confirm('Reset spaced-review scheduling for this deck only? This keeps your unspaced marks and pass history.')) {
      host.clearSpacedUndoSnapshot();
      performSpacedProgressReset(false);
    }
    return;
  }
  // Reset the scope toggle to off whenever the modal opens, so the
  // default behaviour ("reset the whole deck") is unambiguous.
  const checkbox = overlay.querySelector('input[type="checkbox"][data-reset-required-only]');
  if (checkbox) checkbox.checked = false;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

export function closeResetSpacedModal() {
  const overlay = document.getElementById('resetSpacedOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  // Match the behavior of the other modal close handlers: only drop
  // modal-open when no other overlay is currently visible.
  const anyOtherOpen = document.querySelector('.consent-overlay.show');
  if (!anyOtherOpen) document.body.classList.remove('modal-open');
  shieldClicksBriefly();
}

export function confirmResetSpacedTimingOnly() {
  const requiredOnly = isResetScopeRequiredOnly('resetSpacedOverlay');
  closeResetSpacedModal();
  if (!runtime.selectedKeys.length || !runtime.spacedRepetition) return;
  host.clearSpacedUndoSnapshot();
  performSpacedTimingReset(requiredOnly);
}

export function confirmResetSpacedProgress() {
  const requiredOnly = isResetScopeRequiredOnly('resetSpacedOverlay');
  closeResetSpacedModal();
  if (!runtime.selectedKeys.length || !runtime.spacedRepetition) return;
  host.clearSpacedUndoSnapshot();
  performSpacedProgressReset(requiredOnly);
}

export function confirmResetSpacedSmooth() {
  const requiredOnly = isResetScopeRequiredOnly('resetSpacedOverlay');
  closeResetSpacedModal();
  if (!runtime.selectedKeys.length || !runtime.spacedRepetition) return;
  host.clearSpacedUndoSnapshot();
  performSpacedScheduleSmooth(requiredOnly);
}

function openResetUnspacedModal() {
  const overlay = document.getElementById('resetUnspacedOverlay');
  if (!overlay) {
    // Fall back to legacy confirm if the modal markup isn't present.
    if (window.confirm('Reset unspaced marks for this deck only? This keeps your spaced-review scheduling and intervals.')) {
      host.clearSpacedUndoSnapshot();
      performUnspacedDeckReset(false);
    }
    return;
  }
  const checkbox = overlay.querySelector('input[type="checkbox"][data-reset-required-only]');
  if (checkbox) checkbox.checked = false;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

export function closeResetUnspacedModal() {
  const overlay = document.getElementById('resetUnspacedOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  const anyOtherOpen = document.querySelector('.consent-overlay.show');
  if (!anyOtherOpen) document.body.classList.remove('modal-open');
  shieldClicksBriefly();
}

export function confirmResetUnspacedMarks() {
  const requiredOnly = isResetScopeRequiredOnly('resetUnspacedOverlay');
  closeResetUnspacedModal();
  if (!runtime.selectedKeys.length || runtime.spacedRepetition) return;
  host.clearSpacedUndoSnapshot();
  performUnspacedDeckReset(requiredOnly);
}

export function openResetStatsModal() {
  const overlay = document.getElementById('resetStatsOverlay');
  if (!overlay) {
    // Fall back to the legacy single-confirm flow if the modal markup
    // isn't present (e.g. during older cached index.html on PWA installs).
    if (window.confirm('Reset all saved study stats, marks, and spaced-review scheduling for both directions?')) {
      performResetStatsKeepSettings();
    }
    return;
  }
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

export function closeResetStatsModal() {
  const overlay = document.getElementById('resetStatsOverlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  const anyOtherOpen = document.querySelector('.consent-overlay.show');
  if (!anyOtherOpen) document.body.classList.remove('modal-open');
  shieldClicksBriefly();
}

export function confirmResetStatsKeepSettings() {
  closeResetStatsModal();
  // Double-confirm: the modal pick is the first step, this native dialog
  // is the second so a misclick doesn't quietly wipe progress.
  const confirmed = window.confirm('Reset all saved study stats, marks, spaced-review scheduling, achievements, and study-time history? Your settings are kept.');
  if (!confirmed) return;
  performResetStatsKeepSettings();
}

export function confirmResetToStart() {
  closeResetStatsModal();
  const confirmed = window.confirm('Wipe ALL data and return to the initial launch state? This clears stats, settings, theme, fonts, profile, and the study-aid disclaimer, then reloads the page.');
  if (!confirmed) return;
  performResetToStart();
}

function performResetStatsKeepSettings() {
  host.clearSpacedUndoSnapshot();

  runtime.globalWordMarks = { g2e: {}, e2g: {}, morph: {} };
  runtime.globalWordProgress = { g2e: {}, e2g: {}, morph: {} };
  runtime.deckStates = {};
  runtime.appUsageStats = {
    totalMs: 0,
    dailyMs: {},
    activeStudyMs: 0,
    activeDailyMs: {},
    lastActiveAt: document.hidden ? 0 : Date.now(),
    lastStudyInteractionAt: 0,
    lastStudyCountedAt: 0,
    firstStudyAt: 0,
    studySessionHistory: [],
    currentStudySession: null
  };
  runtime.appGamification = sanitizeGamificationState({});
  host.ensureDirectionalStores();
  host.resetUnspacedCycleState();
  runtime.marks = host.getDirectionalMarksStore();

  if (runtime.selectedKeys.length) {
    runtime.currentIdx = 0;
    runtime.isFlipped = false;
    runtime.deck = [];
    runtime.activeDeckCount = 0;
    runtime.deck = host.buildStudyDeck(runtime.originalDeck);
    renderCard();
    renderProgress();
    renderReview();
  } else {
    renderReview();
    renderProgress();
  }

  host.saveState();
}

function performResetToStart() {
  const storage = getStorage();
  if (storage) {
    // Every key the app writes — clearing only STORAGE_KEY would leave
    // the disclaimer, theme, font, and "what's new" flags behind, so a
    // reload wouldn't feel like a fresh first launch.
    const keysToWipe = [
      STORAGE_KEY,
      CONSENT_STORAGE_KEY,
      WHATS_NEW_V1_5_STORAGE_KEY,
      THEME_STORAGE_KEY,
      FONT_FAMILY_STORAGE_KEY,
      TEXT_SIZE_STORAGE_KEY,
      // Older save formats restoreState still reads as a migration path.
      'greekFlashcardsStateV17',
      'greekFlashcardsStateV15',
      'greekFlashcardsStateV14',
      'greekFlashcardsStateV12',
      'greekFlashcardsStateV11',
      'greekFlashcardsStateV10'
    ];
    for (const key of keysToWipe) {
      try { storage.removeItem(key); } catch (_err) { /* ignore */ }
    }
  }
  // Reload to rebuild every in-memory store from a clean slate, including
  // the consent gate, theme initializer, and selector lists.
  window.location.reload();
}

// Backward-compatible alias kept in case any cached HTML still calls it.
export const resetAllStats = openResetStatsModal;
