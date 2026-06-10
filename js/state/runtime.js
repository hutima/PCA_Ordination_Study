// The application's mutable runtime state — every binding that used to live
// as a top-level `let` in main.js. Modules that need read or write access
// import this object directly and operate on its properties. Mutations on
// object/array properties propagate because there's a single shared
// reference; reassignments to primitive fields (e.g. `runtime.studyMode =
// 'morph'`) work because callers always go through this object.
//
// Initial values match what main.js used to declare. Anything that needs to
// be reset later (resetAllStats, restoreState) reassigns runtime.foo just
// like main.js used to reassign the bare `foo`.

import { ANALYTICS_COLLAPSED_DEFAULTS } from './store.js';

export const runtime = {
  // ── Usage / gamification ────────────────────────────────────────────
  appUsageStats: {
    totalMs: 0,
    dailyMs: {},
    activeStudyMs: 0,
    activeDailyMs: {},
    lastActiveAt: 0,
    lastStudyInteractionAt: 0,
    lastStudyCountedAt: 0,
    firstStudyAt: 0,
    studySessionHistory: [],
    currentStudySession: null
  },
  appProfile: 'vocab_grammar',
  appGamification: { lastCelebratedLevel: null, lastCelebratedBadgeDay: null, lastEarnedAchievementIds: [] },
  usageTickHandle: null,
  usageVisibilityBound: false,
  usageTickCounter: 0,
  analyticsExpandedChapter: null,
  analyticsExpandedWord: null,
  analyticsChapterSort: 'confidence', // 'confidence' | 'alphabetical'
  analyticsGrammarExpandedChapter: null,
  analyticsGrammarExpandedConcept: null,
  analyticsGrammarExpandedCard: null,
  analyticsGrammarConceptSort: 'confidence', // 'confidence' | 'alphabetical'
  // Inline-expansion state for the paradigm parsing rows on the analytics
  // tile vs the in-study parsing review panel. Tracked separately so opening
  // a row in analytics doesn't auto-open the same row at the bottom of the
  // study screen. Value is a lemma string, or '__overall' for the
  // all-paradigms summary row, or null when nothing is expanded.
  analyticsParadigmExpanded: null,
  parsingReviewExpanded: null,
  // Sort order of the per-deck progress card list. Defaults to alphabetical
  // because that's the predictable "find a word" lookup; confidence flips it
  // to lowest-raw-pct-first for the "what should I drill next" view.
  reviewSortMode: 'alphabetical', // 'alphabetical' | 'confidence'
  // Word IDs currently expanded inside the stubborn / improved / slipping
  // lists. Keyed by the list's collapseKey so each list tracks its own
  // expansion independently — opening a row in "Most stubborn" doesn't
  // close one in "Slipping list".
  analyticsExpandedListWords: {},
  // Analytics-page-local vocab view (separate from the study deck's
  // directionToGreek / requiredOnly so analyzing one direction doesn't force
  // a deck rebuild).
  analyticsVocabDirection: 'g2e',     // 'g2e' | 'e2g'
  analyticsVocabScope: 'required',    // 'required' | 'all'
  // Per-section open/closed state for the analytics overlay's collapsibles.
  // Defaults live in ANALYTICS_COLLAPSED_DEFAULTS (store.js) so migrations
  // and compaction can share the canonical key list.
  analyticsCollapsed: { ...ANALYTICS_COLLAPSED_DEFAULTS },

  // ── Modal / disclaimer / transfer / theme ───────────────────────────
  hasAcceptedDisclaimer: false,
  disclaimerModalRequiresAgreement: false,
  transferModalMode: '',
  transferPrimaryAction: null,
  transferSecondaryAction: null,
  themeMode: 'system',
  fontFamily: 'serif',  // 'serif' | 'sans'
  textSize: 'medium',   // 'small' | 'medium' | 'large' | 'x-large'

  // ── Study mode / morphology answer state ────────────────────────────
  studyMode: 'vocab',
  morphSelfCheck: false,
  morphAnswerState: { answered: false, revealed: false, selfRated: false, selectedIndex: -1, isCorrect: null },
  morphPendingAdvance: false,

  // ── Step-by-step paradigm drill (off by default, no SRS/main-stats writes)
  // morphStepByStep: gates the alternate render + deck filter in grammar mode.
  // morphFocusedParadigm: lemma string the user is drilling (default = first
  // paradigm in selection). morphStepState: ephemeral per-card walk progress.
  // paradigmStepStats: { byLemma: { lemma: { attempts: [{ at, dims }] } } }
  // — sliding window capped at 20 attempts per lemma (see morph_steps.js).
  morphStepByStep: false,
  morphFocusedParadigm: null,
  // Parsing mode owns its chapter scope via this field — driven by the
  // dedicated chapter dropdown above the focused paradigm. Replaces the
  // shared `selectedKeys`-based gating used by vocab/grammar so picking
  // chapters in those modes never widens or narrows the parsing pool.
  // Default 20 = the last Duff chapter (every paradigm in scope).
  parsingChapter: 20,
  morphStepState: { cardId: null, steps: [], stepIdx: 0, answers: [], completed: false },
  // English → Greek parsing direction. When on, parsing mode flips: instead
  // of walking a Greek form's parse one dimension at a time, the card shows
  // the requested parse (the chapter-gated dimensions the user has enabled)
  // and offers a multiple-choice of Greek forms from the same focused
  // paradigm — the student picks the form that matches. Off by default;
  // the forward dimensional walk stays the parsing baseline.
  parsingReverse: false,
  // Ephemeral per-card cache for the reverse drill so the MC options stay
  // stable across re-renders of the same card (answer feedback re-renders
  // the card). Rebuilt whenever the focused card changes. Not persisted.
  parsingReverseState: { cardId: null, options: [], correctForm: '' },
  // Reverse-drill option: include curated accent/breathing look-alike forms
  // (e.g. relative ἥ vs article ἡ) as distractors so the student has to read
  // the accent/breathing, not just the letters. Off by default.
  accentLookalikes: false,
  paradigmStepStats: { byLemma: {} },
  // Whether the parsing walk asks an explicit Aspect step before Tense.
  // Aspect is derivable from tense (present/future → continuous/undefined,
  // aorist → undefined, etc.), so for students who don't want to drill the
  // composite-vs-single distinction it can be turned off. Default on.
  aspectStep: true,
  // Stem & declension notes on standard vocab cards: the inline verbal /
  // third-declension stem after the headword, the bracketed principal-parts
  // line under a verb, and the "declines like σάρξ" hint-line pointer.
  // Render-only; default on.
  stemNotes: true,
  // Second aorists as their own cards: when on, every standard chapter-vocab
  // verb with a recorded second aorist (the W4 flip set) also contributes a
  // standalone card for the aorist form itself (e.g. εἶπον "I said" alongside
  // λέγω). Changes deck contents, so flipping it rebuilds the deck. Default
  // off — the aorist normally rides along as the principal-parts line.
  secondAoristCards: false,
  // Per-dimension toggles for the parsing walk. Each key controls whether
  // that dim's step is asked. Default-on; off → step skipped, dim doesn't
  // contribute to stats, omitted from the final parse summary, and the
  // form lookup silently auto-fills the canonical correct value.
  dimToggles: { tense: true, voice: true, mood: true, person: true, number: true, case: true, gender: true },
  // Per-value sub-filters under each dim. A `false` excludes cards whose
  // canonical parse for that dim resolves to that value AND prunes the
  // value out of the walk's MC distractor pool. Composites are matched
  // componentwise (e.g. 'continuous/undefined' passes if either
  // 'continuous' or 'undefined' is enabled; 'first aorist' / 'second
  // aorist' normalize to 'aorist'). The correct value is always kept in
  // the walk's choices regardless of the filter, so a step never becomes
  // unanswerable. Only exposes the primary canonical values per dim —
  // aorist qualifiers and slash-composites are derived, not toggled
  // independently.
  dimValueFilters: {
    aspect: { continuous: true, undefined: true, completed: true },
    tense:  { present: true, future: true, imperfect: true, aorist: true, perfect: true, pluperfect: true },
    voice:  { active: true, middle: true, passive: true },
    mood:   { indicative: true, subjunctive: true, imperative: true, infinitive: true, participle: true },
    person: { first: true, second: true, third: true },
    number: { singular: true, plural: true },
    case:   { nominative: true, accusative: true, genitive: true, dative: true, vocative: true },
    gender: { masculine: true, feminine: true, neuter: true }
  },
  // Opt-in to drilling morphologically real paradigm forms that Duff
  // doesn't drill (e.g. εἰμί's future middle infinitive ἔσεσθαι and
  // future middle participle ἐσόμενος series). Sourced from
  // LEMMA_INVENTORY[lemma].optionalFormGroups and chapter-gated by each
  // group's own `chapter` value. Default off so the standard
  // Duff-aligned deck is the baseline; opting in expands the parsing
  // pool with extension paradigms. The fallback form-lookup (extraForms)
  // is always consulted regardless of this toggle.
  includeOptionalForms: false,
  // When on, parsing mode filters out any form whose last 2 attempts are
  // both correct (the strict 2/2 "known" threshold — 1/1 stays in the
  // deck so the user still verifies it). Default off so the full
  // focused-paradigm pool is the baseline.
  excludeKnownMorphs: false,
  // Per-category sub-filters on the optional-form drill pool. Each key
  // defaults to true (the category is INCLUDED); flipping a key to false
  // excludes any optional-form card whose canonical parse mentions the
  // category. Only consulted when includeOptionalForms is on; never
  // affects the always-on fallback form-lookup. Useful when the full
  // optional set is too big and the student wants to drill, say, all
  // optional forms EXCEPT 3rd-person imperatives.
  optionalFormFilters: {
    imperative: true,
    subjunctive: true,
    infinitive: true,
    participle: true,
    thirdPerson: true,
    futureTense: true,
    perfectTense: true
  },

  // ── Persisted directional stores (rebuilt from localStorage) ────────
  deckStates: {},
  globalWordMarks: {},
  globalWordProgress: {},

  // ── Current study session + deck cursor ─────────────────────────────
  currentSession: null,
  selectedKeys: [],
  splitSelection: false,    // separate chapter selections for vocab vs grammar
  modeSelections: {},       // { vocab: {selectedKeys, currentSessionId}, morph: {...} }
  deck: [],
  originalDeck: [],
  // Identity of the deck currently in `deck` — which deck-state-bank entry it
  // belongs to. Set whenever a deck is freshly built; consulted by
  // saveCurrentDeckStateToBank so the in-flight deck is always filed under its
  // own key even when callers have already mutated studyMode / direction /
  // selectedKeys ahead of the rebuild.
  activeDeckRef: null,      // { key, selectedKeys, currentSessionId }
  currentIdx: 0,
  isFlipped: false,
  shuffled: true,           // shuffle on by default
  requiredOnly: true,
  directionToGreek: false,  // false = Greek→English, true = English→Greek
  // Live spaced-repetition flag for the *current* study mode. Mirrors the
  // matching entry in `spacedByMode` — kept in sync on every mode switch and
  // toggle so the wide existing read-base (deck banks, nav, stats) needs no
  // change. Vocab and grammar each remember their own setting.
  spacedRepetition: true,
  // Per-section spaced-repetition preference. Grammar (morph) defaults to
  // unspaced — its drills are short reference checks, not a confidence-graded
  // SRS deck — while vocab stays spaced. setStudyMode swaps the active value
  // into `spacedRepetition`; toggleSpacedRepetition writes back here.
  spacedByMode: { vocab: true, morph: false },
  hardVocabReviewMode: false, // restrict vocab deck to cards missed >10× and still under 40% confidence
  activeDeckCount: 0,
  // Cards in the "middle deck" — currently due but not yet seen this session.
  // Builds up as deferred cards' timers expire mid-session; gets dumped into
  // active when the active section drains, on manual reshuffle, on 2% revival,
  // or after a 5-hour idle. In-memory only (not persisted, recomputed each
  // build).
  middleDeckCount: 0,
  // IDs that should land in the active section on the next buildStudyDeck.
  // Drains as those cards are reviewed; replenishes when middle dumps in
  // (active-empties / manual reshuffle / 2% revival / 5 h idle). Persisted
  // through reload only when lastStudyActivityAt is within the 5 h window
  // (see persistence.js), and banked per deck in deckStates so a mode/toggle
  // round-trip within the window resumes each deck's own active pile.
  spacedActiveIds: [],
  // Timestamp (ms) of the most recent study activity in any mode (vocab,
  // grammar, or reader — anything that fires noteStudyInteraction).
  // Persisted, so the timer survives reload. persistence.js gates restore
  // of session state (spacedActiveIds, unspacedMiddleIds) on
  // (now - lastStudyActivityAt) <= SESSION_IDLE_RESET_MS.
  lastStudyActivityAt: 0,
  // Snapshot of lastStudyActivityAt taken at the start of each
  // noteStudyInteraction, before the field is bumped to "now". Used by
  // buildStudyDeck's in-session idle check so it sees the timestamp of the
  // previous activity instead of the one we just recorded. In-memory.
  previousStudyActivityAt: 0,
  unspacedPendingRecycle: false,
  unspacedCycleState: {},
  unspacedDeferredIds: new Set(), // 'pass' and 'again' cards excluded from current pass; reappear in next cycle
  // Cards Hard/Uncertain-marked in the current unspaced round, awaiting the
  // next reshuffle. Sits between active and archived in the deck layout.
  // Persisted (as an array) gated on the 5 h session window — a reload or a
  // mode/toggle round-trip within the window resumes the round; past it,
  // everything unmarked collapses back into active and a fresh round starts.
  // Also banked per deck in deckStates alongside spacedActiveIds.
  unspacedMiddleIds: new Set(),
  unspacedMiddleCount: 0,
  // Round bookkeeping for the unspaced flip-deck flow. A "round" is one pass
  // through the active deck — Hard/Uncertain bump the card to the back of the
  // active queue (it'll reappear in the same round); Easy archives it. When
  // every card present at the start of the round has been marked, the
  // remaining (non-archived) cards reshuffle for the next round.
  unspacedRoundSize: 0,
  unspacedRoundMarks: 0,
  // 5 AM-cutoff day key recorded the last time an unspaced archive (Easy
  // mark) was active. When the current day key drifts past this and
  // unspacedAutoResetEnabled is on, the daily auto-clear wipes all
  // unspaced 'known' marks across both vocab directions.
  lastUnspacedArchiveDayKey: '',
  // Off by default: Easy-archived cards persist across sessions and chapter
  // changes until the user explicitly resets, or until they opt in to the
  // 5 AM daily reset via the deck control toggle.
  unspacedAutoResetEnabled: false,
  flipsSinceReshuffle: 0,         // forward navigations since last periodic reshuffle (legacy; see lastPeriodicReshuffleAt)
  lastPeriodicReshuffleAt: 0,     // timestamp (ms) of the last periodic reshuffle; throttled to ≥ 1 hour
  spacedUndoSnapshot: null,
  // History stack of pre-action snapshots for vocab unspaced. Each Next
  // press, Hard/Uncertain/Easy mark, and end-of-deck reshuffle pushes one
  // entry; Prev pops the top and restores it. Entries are tagged 'next',
  // 'mark', or 'reshuffle' so the Prev button label can switch to "Undo"
  // when the next pop would roll back a confidence-impacting mark.
  // Capped at runtime; not persisted (session-only).
  unspacedHistory: [],

  // ── Per-direction mark store for the active study mode ──────────────
  marks: {}
};
