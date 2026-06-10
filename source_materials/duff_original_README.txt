Elementary NT Greek — Flashcards (PWA)
=====================================

A static, offline-capable progressive web app for studying Koine Greek
alongside Duff's *Elements of New Testament Greek* (Wycliffe WYB1513YY
lecture beats). Hosted on GitHub Pages; works at a domain root or under
a project subpath.


FEATURE SET
-----------

Study modes (top-level mode strip)
- Vocab — Greek ↔ English flashcards with optional direction reversal.
- Grammar — multiple-choice parsing / morphology / concept questions
  with inline wrong-answer explanations and an optional "self-check"
  mode that reveals the answer without grading.
- Parsing — dimensional walk through every paradigm form (article,
  nouns, pronouns, adjectives, verbs by tense/voice/mood, μι-verbs,
  participles, etc.) one dimension at a time: aspect → tense → voice →
  mood → person → number → case → gender. Distractors are gated to
  plausible values for the form so wrong answers are instructive.
  Walks every form once before any repeats per paradigm. After each
  card a parse-comparison summary shows your guess vs. the correct
  parse and, on misses, lists the forms in that paradigm that would
  have matched what you picked. Per-card Pass skips a form without
  recording stats.
- Reader — NT verses sequenced so each chapter is readable after
  finishing the corresponding Duff chapter (Textus Receptus text),
  plus a per-chapter Translation drills section built from cumulative
  vocab. Tap any verse to reveal a literal English line.
- Paradigms (Memorization) — separate page (`pages/memorization.html`)
  with full paradigm reference tables. Toolbar can hide Greek,
  English, or notes for self-testing.

Session / set selectors
- Preset Sessions — weekly study days (wk1t, wk1f, wk2t, …),
  Mid-Term Prep (Ch 1–11), and Final Exam Prep (Ch 1–20). Sessions
  expand to chapters plus the per-week odd supplements (W1O–W8O);
  paradigm breakdown sets are opt-in via the supplemental selector.
- Manual chapter selection — toggle individual chapters 1–20.
- Supplemental selector — grouped by week and expandable into the
  per-week odd supplement (W1O–W8O), "all of set X" button, paradigm
  rows (Morphology / Grammar items), and the per-week stem-flip drills
  (2nd-aorist Ch 11, aorist passive Ch 14, perfect active Ch 15,
  μι-verb principal parts Ch 18) with stem-diff highlighting.
  A "Deselect all supplementals" control clears every supplemental
  selection while leaving chapter selections intact. Multiple
  supplementals from any combination of weeks can be active at once.
- Advanced vocabulary section — rare NT lemmas grouped into buckets of
  200 (`advanced_01`…`advanced_25`) for post-coursework review.

Deck controls (Advanced review settings)
- Shuffle, Required-only, Direction (Gk → En / En → Gk),
  Spaced review (SRS), Self-check (grammar mode only).
- Hard review — drill only vocab you've missed more than 10 times and
  that is still under 40% confidence.
- Unspaced daily reset — auto-clear archived (Easy) cards once a day
  around 5 AM local time, so the flip deck reappears fresh.
- Split selection — keep separate chapter selections for vocab and
  grammar modes (Parsing always owns its chapter independently via its
  own dropdown and never shares with vocab/grammar).
- Font family (Serif / Sans) — Serif uses bundled Gentium Plus
  (covers Greek + Latin); Sans uses bundled Noto Sans. Both are
  served from the PWA so they work offline.
- Text size (Medium / Large / X-Large).
- Reshuffle eligible cards, reset the current deck, reset required
  flags, or reset all stats from the advanced-settings panel.

Parsing options (Parsing mode only)
- Per-dimension master toggles for aspect, tense, voice, mood, person,
  number, case, gender. Turning a dimension off skips it silently,
  excludes it from stats, and omits it from the parse summary.
- Per-value exclude sub-filters under each dimension (e.g. exclude
  aorist tense, exclude dative case, exclude continuous/undefined
  aspect as a single composite). ON in the UI means excluded. Each
  value label carries the Duff chapter where it's introduced.
- Voice step is chapter-gated to Ch 15+, with earlier presentation for
  deponent verbs.
- Gender step is auto-skipped for single-gender lemmas (most nouns)
  but the gender is still named in the final parse summary.
- Optional paradigm extensions — opt-in toggle that adds subjunctive,
  non-present infinitives, middle imperatives, full participle
  declensions, paradigm gaps, etc. Further filterable by seven
  categories (imperative, subjunctive, infinitive, participle,
  third-person, future tense, perfect tense).
- Parsing chapter dropdown — Ch 1–20 picker that drives paradigm
  chapter-gating for the parsing deck.

Spaced repetition (three-deck flow)
- Per-card SRS scheduler with ease-based intervals and a confidence
  signal. Cards live in one of three lanes:
  - Active — currently due, in the main rotation.
  - Middle — cards you just got wrong slide here briefly before
    rejoining active, instead of all returning at once.
  - Deferred — scheduled for a future day.
  Due-only counts drive the visible deck length when spaced review is
  on, and the bottom panel shows Cards left matching this layout.
  An undo affordance restores the last spaced action; it's robust
  across mode switches and session persists up to ~5h of inactivity.
- Unspaced flip-deck has a matching middle-deck round so a full pass
  has a clearer shape. End-of-section card calls out how many cards
  are near-due (spaced) or still unconfirmed (unspaced).

Progress tracking
- Marks per direction (known / uncertain / again) persist across
  sessions and survive deck reshuffles.
- Analytics overlay (Progress and study time): hero summary, course
  completion, daily heatmap, achievements, time ledger (active study
  time, session history, foreground totals), per-chapter vocab and
  grammar breakdowns split into Total vs. Selected sections,
  Grammar concepts to review report, tappable Chapter map with
  per-word stats, and Most-stubborn / Most-improved lists.
- Per-paradigm parsing stats — Total Grammar includes a
  "Paradigm parsing (step-by-step)" panel with rolling per-paradigm,
  per-dimension accuracy from your last 20 attempts. Each row taps
  open an inline bar chart of buckets of 20 attempts (up to the last
  10 buckets = 200 parses); an "All paradigms" row aggregates the
  same view across every paradigm you've drilled. These are
  off-the-record drill stats and don't feed SRS or main confidence.
- Gamification: levels, titles, and usage stats fed by the analytics
  module.

Progress portability
- Export progress to a JSON file (download or copy from textarea).
- Import progress from text or a chosen JSON file. Schema-versioned
  with forward-compatible migrations in `js/state/migrations.js`.

App shell
- Theme switcher (System / Dark / Light) with first-paint inline
  theme + font + text-size bootstrap to avoid flashes.
- In-app User guide with full changelog (per-version `<details>`).
- Per-release "What's new" popup on first visit after an update.
- Keyboard shortcuts (while studying):
  - Flip: Space / Enter
  - Navigate: ←/→ or ↑/↓
  - Mark: 1 Hard, 2 Uncertain, 3 Easy (also R = Hard, K = Easy)
  - Grammar / Parsing options: 1–4 picks an answer
- Disclaimer / consent modal ("unofficial student-made AI study aid").
- Service-worker caching with a versioned `CACHE_NAME` and per-asset
  `?v=` query strings so deployments invalidate cleanly.
- Google Analytics 4 page-visit tag for basic usage volume. No card
  content, progress, or personal data is sent.


REPOSITORY LAYOUT
-----------------
- index.html, styles.css, manifest.json, sw.js, favicon.svg, icons/
- fonts/                        — bundled Gentium Plus + Noto Sans
                                  (Latin / Greek subsets, woff2)
- pages/memorization.html       — Paradigms reference page
- docs/index-structure.md       — navigation map for index.html
- js/app/main.js                — entry point (ES module)
- js/data/                      — vocab, morphology, grammar, reader,
                                  reader translations + literals,
                                  parsing / concept / grammar examples,
                                  lemma inventory, set metadata
- js/data/advanced/             — `advanced_01.js` … `advanced_25.js`
                                  (rare NT lemma buckets of 200)
- js/data/supplementals/        — per-week paradigm files, W3O/W6O/W7O
                                  /W8O supplements, adjective paradigms,
                                  stem-flip drills (`second_aorist_flip`,
                                  `w6_aorist_passive_flip`,
                                  `w6_perfect_active_flip`,
                                  `w8_mi_verb_principal_parts_flip`,
                                  `stem_change_drills`),
                                  `paradigm_morphology`
- js/logic/pos_logic.js         — parsing helpers
- js/utils/                     — helpers, time, storage, Greek sort,
                                  click shield, touch/tap bridge
- js/domain/srs/                — SRS constants, scheduler, confidence
- js/domain/deck/               — ordering, filters
- js/domain/grammar/            — explanations, morph_steps,
                                  paradigm_focus
- js/domain/gamification/       — levels, usage stats, xp
- js/state/                     — store, runtime, persistence,
                                  migrations
- js/ui/                        — render, modals, selectors, reader,
                                  analytics, charts, navigation,
                                  progress, keyboard, toast


DEPLOYMENT
----------
1. Push to the branch configured for GitHub Pages.
2. Wait for the Pages deploy to finish.
3. Open the published URL once online so the service worker caches
   the new app shell.

When any cached file changes, bump a single shared version number:
- the `vNN` suffix in `CACHE_NAME` (e.g. `…-pwa-v193-github-pages`),
- every `?v=NN` query string in `sw.js` and `index.html`.

The simplest way is a search-and-replace from the previous version to
the next across both files (e.g. `v193` → `v194`). The service worker
uses `caches.match(req, { ignoreSearch: true })` so bare ES module
imports still resolve to the versioned precache entries.

Without those bumps the service worker will keep serving the old
cached assets after redeploy.

When shipping a new release, also: replace the previous
`#whatsNewVX_YOverlay` in `index.html` with one for the new version,
and prepend a new `<details class="user-guide-changelog-version" open>`
to the changelog inside `#shortcutsOverlay`. See
`docs/index-structure.md` for the file map.


KNOWN BEHAVIOR
--------------
- Vocabulary progress is keyed by stable card IDs and survives most
  upgrades.
- Grammar / morphology IDs depend on item ordering within a chapter;
  large content reorderings are handled by versioned migrations
  (`STATE_MIGRATIONS`) that drop orphaned entries cleanly.
- Per-paradigm parsing stats are off-the-record drill metrics and
  intentionally separate from vocab/grammar SRS and confidence.
- This is an unofficial student-built study aid. Verify against
  course content and official materials before relying on anything
  it says.
