# `index.html` structure notes

Navigation map for the root `index.html` (currently ~753 lines). Keep this in
sync when you change the file — see "Maintenance" at the bottom.

Line numbers are approximate (drift a few lines between edits). When in doubt,
grep for the `id` rather than jumping to a line.

---

## Top-level layout

```
1   <!DOCTYPE html> / <head>           ← analytics, meta/PWA, manifest, theme bootstrap
46  <body>
47    <div class="app">                ← main shell (in-flow UI)
48      header, notice, quick-start, settings, deck, modals trigger
196   </div>
198   overlays (modals)                ← siblings of .app, position:fixed
697   <script defer …>                 ← data + entry point
752 </body>
```

The `<div class="app">` shell is everything that scrolls in the page. Every
`<div class="consent-overlay" …>` is a top-level sibling of `.app` and is
shown/hidden by JS — never nest a new overlay inside `.app`.

---

## `<head>` (1–45)

- 5–11   Google Analytics tag
- 12–19  PWA / icon / manifest meta (`?v=N` cache-bust param appears here and on every script/stylesheet)
- 21     `<link rel="stylesheet" href="styles.css?v=N">`
- 22–44  **Pre-paint inline script.** Reads `localStorage` and sets
         `data-theme` / `data-font-family` / `data-text-size` on `<html>`
         before first paint to avoid flash-of-wrong-theme. Don't move this.

> Cache-bust: every asset URL ends in `?v=NNN`. Bump the number on release.
> Same number lives in `sw.js` (`CACHE_NAME` / asset list). Both must agree.

---

## `<div class="app">` (47–196)

In-document order (these all render in the main column):

| Lines    | Element                                   | Notes |
|---------:|-------------------------------------------|-------|
| 49–62    | `<header>`                                | Theme switcher (System/Dark/Light), Greek + English title, `#appSubtitle`, "Koine Greek Study Tool" tag |
| 64–67    | `.notice-row`                             | Disclaimer button + `#appNotice` |
| 69–81    | `.quick-start`                            | Choose session / Start studying / mode strip (`#modeShortcutVocabBtn`, `…MorphBtn`, `…ParsingBtn`, `…ReaderBtn`) / Progress / User guide / `#modeShortcutMemorizationBtn` link to `pages/memorization.html` |
| 83–87    | `<details>` Progress tools                | Export/Import progress buttons (open the transfer modal) |
| 89       | `.ornament`                               | Decorative `✦ · · · ✦` |
| 91–150   | `<details id="advancedSettingsDetails">`  | Wraps **both** font/text-size prefs *and* `#controlsBar` toggles. The controls bar is not a separate section — it lives inside this `<details>`. |
| 110–148  | └ `#controlsBar`                          | Non-parsing toggles: `#shuffleToggle`, `#requiredToggle`, `#hardReviewToggle`, `#stemNotesToggle` ("Stem & declension notes", vocab-mode-only, default ON — handler `toggleStemNotes`, `runtime.stemNotes`; switches off all standard-card stem annotations at once: inline verbal/noun stems, the principal-parts line, the "declines like" hint tag), `#secondAoristCardsToggle` ("Second aorists as cards", vocab-mode-only, default OFF — handler `toggleSecondAoristCards`, `runtime.secondAoristCards`; when ON each second-aorist verb's aorist form joins the vocab deck as its own standalone card (e.g. εἶπον for λέγω, derived from the W4 flip set via `expandSecondAoristCards` in `js/domain/deck/filters.js`, deck-id suffix `::2aor`; placed deterministically about half a chapter-run away from its parent so the unshuffled order doesn't pair them back-to-back); stats are shared with the base card — every progress read/write strips the suffix (`progressCardId`), so reviewing εἶπον records onto λέγω's entry, while archive marks / cycle state / saved deck order stay per-card; changes deck contents, so flipping it rebuilds the deck), `#directionToggle`, `#spacedToggle`, `#unspacedDailyResetToggle`, `#splitSelectionToggle` (hidden in parsing mode — parsing owns its chapter via `#parsingChapterSelect` and never shares with vocab/morph), `#selfCheckToggle` (hidden by default). Then a nested `<details id="parsingOptionsDetails">` ("Parsing options" — hidden outside parsing mode, since these toggles only affect the dimensional walk) groups every parsing-specific toggle (`#aspectStepToggle`, `#tenseStepToggle`, `#voiceStepToggle`, `#moodStepToggle`, `#personStepToggle`, `#numberStepToggle`, `#caseStepToggle`, `#genderStepToggle`, `#optionalFormsToggle` — label "Optional paradigm") so the controls bar stays scannable. Each of the eight parsing-step master toggles is followed by its own nested `<details id="<dim>ValuesFiltersDetails">` ("Exclude <dim> values…") containing per-value sub-toggles with IDs `#dimValueFilter_<dim>_<value>_Toggle` (e.g. `#dimValueFilter_tense_aorist_Toggle`, `#dimValueFilter_case_dative_Toggle`). Handler: `toggleDimValueFilter('<dim>','<value>')`. ON in the UI means **excluded** (the data-model value is `false`); default is OFF for everything (nothing excluded). Aspect collapses `continuous` + `undefined` into one combined UI key `continuousUndefined` (`#dimValueFilter_aspect_continuousUndefined_Toggle`) that flips both underlying values at once. Each value label carries the Duff chapter where it's introduced (e.g. "Aorist (Ch. 6)"). The gender subfilter is a no-op for single-gender lemmas (most nouns) — only multi-gender paradigms (articles, adjectives, pronouns) are pruned. The gender step itself follows the same rule: parsing mode auto-skips it for single-gender lemmas (the form doesn't vary by gender, so asking it tests lemma-memory rather than form-parsing), but still names the gender in the final parse summary. Under the optional-forms toggle is a further nested `<details id="optionalFormsFiltersDetails">` ("Filter optional forms by category…") with seven category sub-toggles (`#optionalFilter_imperative_Toggle`, `…_subjunctive_…`, `…_infinitive_…`, `…_participle_…`, `…_thirdPerson_…`, `…_futureTense_…`, `…_perfectTense_…`). `#excludeKnownMorphsToggle` ("Exclude known morphs (2/2)") sits at the TOP of the controls bar next to `#shuffleToggle` (parsing-mode-only, hidden in other modes) — off by default; on drops any form whose last two parsing attempts were both fully correct under the user's current dim toggles. `#parsingReverseToggle` ("English → Greek (pick the form)") sits next to it (also parsing-mode-only, `handler toggleParsingReverse`, off by default) — on flips parsing from the forward dimensional walk to a reverse MC: the card shows the requested parse (enabled dims only) and offers Greek forms from the focused paradigm to pick from (`renderParsingReverseCard` / `answerParsingReverseChoice`, state in `runtime.parsingReverse` + ephemeral `runtime.parsingReverseState`). `#accentLookalikeToggle` ("Accent/breathing look-alike distractors", `handler toggleAccentLookalikes`, off by default, `runtime.accentLookalikes`) sits next to it but only shows while reverse is on — when enabled it adds a curated accent/breathing twin (relative ἥ vs article ἡ, demonstrative αὕτη vs intensive αὐτή, etc.) as a reverse-drill distractor; the twin table + `accentLookalikesFor` live in `morph_steps.js`. The forward walk's footer now has two buttons: "I don't know" (`skipMorphologyStep`, fails the current step only) and "I give up" (`giveUpMorphologyStep`, fails every remaining dim and jumps to the summary). Reset action grid (`#resetDeckBtn`, `#resetRequiredBtn`, `#resetKnownBtn`, `#clearParsingStatsBtn`, Reshuffle, Reset stats) follows; parsing mode hides `#resetDeckBtn` + `#resetRequiredBtn` and shows both `#resetKnownBtn` (opens `#resetKnownOverlay` to clear a form's per-form `recent` tally back to 0/2 — scoped to either the focused paradigm or all of them; the per-paradigm rolling `attempts` window is kept) and `#clearParsingStatsBtn` ("Clear parsing stats" — parsing-mode-only; wipes `runtime.paradigmStepStats` *entirely* incl. per-paradigm %, the per-mood/tense breakdown, and per-form tallies, and nothing else — vocab/morph/reader stats are untouched, since the global "Reset stats" never wrote paradigm stats). Both are toggled in `main.js` alongside `#resetKnownBtn`. |
| 152      | `#readerView`                             | Empty mount point. Reader mode JS injects content here. |
| 154–157  | `#parsingChapterRow`                      | Parsing-mode-only "Current chapter" dropdown (`#parsingChapterSelect`, chapters 1–20) — drives `runtime.parsingChapter` and therefore the chapter cap for paradigm gating in parsing mode. Hidden outside parsing mode. |
| 159–162  | `#paradigmFocusRowPrimary`                | Focused-paradigm dropdown (`#paradigmFocusSelectPrimary`) — hidden unless in a mode that uses it |
| 159–164  | `#cardArea`                               | **Main flashcard mount.** Contains a placeholder `.empty-state`; JS replaces it. |
| 166–171  | `#navRow`                                 | Prev / `#spacedUndoBtn` / `#navResetBtn` / `#navNextBtn` |
| 173–177  | `#markRow`                                | Mark buttons: Hard (`again`) / Uncertain (`pass`) / Easy |
| 179–182  | `#ffRow`                                  | Fast-forward 1 day / 1 week (debug-ish) |
| 184–194  | `<section class="review-shell">`          | Bottom progress panel: `#reviewPanel` → `#reviewDeckTag`, `#reviewStats`, `#reviewSortRow`, `#reviewList` |

---

## Overlays (198–696) — siblings of `.app`

All use `class="consent-overlay"` + an `aria-hidden` toggle. Most use
`class="consent-modal"` inside. Open/close handlers live in JS.

| Lines    | id                          | Purpose |
|---------:|------------------------------|---------|
| 198–214  | `#transferOverlay`           | Import/export progress (textarea + file picker) |
| 216–424  | `#analyticsOverlay`          | "Progress and study time". Large; contains many `<details class="analytics-collapse" data-collapse-key="…">` sections — achievements, totalVocab, selectedVocab, totalGrammar (incl. `#analyticsParadigmStepStatsBody` — per-paradigm rows that expand to a per-value mood/tense/voice breakdown, chapter-gated, derived live from `forms`), selectedGrammar, etc. Each section has a `…SummaryStatus` element JS updates. |
| 426–471  | `#studySelectorOverlay`      | "Choose session" — deselect buttons, `#sessionsGrid`, `#chaptersGrid`, `#supplementalGrid`, `#advancedGrid` (inside `#advancedSectionShell` `<details>`) |
| 473–597  | `#shortcutsOverlay`          | User guide. **Contains the inline changelog** (`details.user-guide-changelog` → one `details.user-guide-changelog-version` per release). Add new release entries at the top. |
| 599–617  | `#consentOverlay`            | First-run "Before you begin" consent |
| 619–641  | `#resetSpacedOverlay`        | Confirm reset of spaced review. Three actions: "Set all to now" (`confirmResetSpacedTimingOnly`), "Smooth schedule" (`confirmResetSpacedSmooth` — levels a due-date pile-up by pulling cards due >3 study-days out to earlier days so a similar number come due each day; never delays a card, never touches the 0–3-day window), and the danger-row "Reset progress" (`confirmResetSpacedProgress`) |
| 643–657  | `#resetStatsOverlay`         | Confirm reset of stats |
| 659–677  | `#resetUnspacedOverlay`      | Confirm reset of current (unspaced) deck |
| —        | `#resetKnownOverlay`         | Parsing-mode "Reset known" scope picker. Two actions: `confirmResetKnownFocused()` (clears the focused paradigm's per-form tally only) and `confirmResetKnownAll()` (clears every drilled paradigm's). On open, JS fills `#resetKnownFocusedLemma` + the `#resetKnownFocusedBtn` label with the focused lemma, and hides the focused row/button (`#resetKnownFocusedRow`) when nothing is focused. Wired in `js/ui/navigation.js`; `resetKnownMorphs()` now just opens this modal (falls back to a legacy all-paradigms `confirm` if the markup is missing). |
| 679–696  | `#whatsNewV1_5Overlay`       | Version popup. Each release gets a fresh `#whatsNewVX_Y` overlay; the old one is removed once the next release ships. |
| 698–710  | `#refreshAvailableOverlay`   | "A new version is ready" prompt. Shown when the SW registration detects a newly-installed worker in the `waiting` state (i.e. a returning user is running stale assets). "Refresh now" posts `{type:'SKIP_WAITING'}` to the waiting worker; a `controllerchange` listener in `main.js` then reloads the page. Wired up in `js/app/main.js` (the SW registration block) and `sw.js` (the `message` listener). |

When adding a release:
1. Bump `?v=NNN` on every `<link>` and `<script>` URL (and in `sw.js`).
2. Replace the previous `#whatsNewVX_YOverlay` (679–696) with a new one for the current version.
3. Prepend a new `<details class="user-guide-changelog-version" open>` to the changelog inside `#shortcutsOverlay` (480-ish).
4. Older `user-guide-changelog-version` entries lose `open`.

---

## Scripts (698–752)

Load order matters — `main.js` is the only `type="module"` and runs last. All
data files are plain `defer` globals that publish onto `window`.

Groups, in order:

- **Core data (698–702):** `words.js`, `morphology.js`, `lemma_inventory.js`, `supplemental.js`, `grammar.js`
- **Per-week supplementals + paradigms (703–722):** `week_N_supplemental.js`, `week_N_paradigms.js`, plus stem-change flips (`second_aorist_flip.js`, `liquid_future_flip.js`, `w6_aorist_passive_flip.js`, `w6_perfect_active_flip.js`, `w8_mi_verb_principal_parts_flip.js`), `adj_paradigms.js`, `wNo_supplemental.js`, `paradigm_morphology.js`, `stem_change_drills.js`
- **Advanced vocabulary buckets (723–747):** `advanced/advanced_NN.js` (currently 01–25)
- **Reader (748–750):** `reader.js`, `reader_verse_literals.js`, `reader_translations.js`
- **Logic (751):** `pos_logic.js` (intentionally loaded before main)
- **Entry point (752):** `js/app/main.js` — the only ES module

When adding a new week / advanced bucket / supplemental, add the `<script>`
tag in the matching group and keep the `?v=NNN` aligned.

---

## Related files (not in this doc)

- `styles.css` — single ~4.1k-line stylesheet, also `?v=NNN`-busted.
- `sw.js` — service worker. `CACHE_NAME` + precache list must agree with `?v=NNN`.
- `manifest.json` — PWA manifest.
- `pages/memorization.html` — Paradigms page (linked from `.quick-start`). Has its own structure; not covered here.
- `js/`
  - `app/` — entry (`main.js`) and bootstrap
  - `data/` — vocab, morphology, paradigm tables, reader text, plus `supplementals/` and `advanced/`
  - `domain/` — model objects (cards, decks, paradigms)
  - `logic/` — POS / parsing logic
  - `state/` — global state, persistence
  - `ui/` — DOM rendering, modals, overlays
  - `utils/` — shared helpers

---

## Maintenance

**If you edit `index.html` and any of the following change, update this doc in
the same commit:**

- A section in `.app` is added, removed, reordered, or renamed.
- An overlay (`consent-overlay`) is added or removed.
- An `id` that other code refers to is added, removed, or renamed.
- The script load order or grouping changes (new data file, new bucket, etc.).
- The cache-bust scheme (`?v=NNN`) changes.

Line numbers drift — don't chase them obsessively, just keep them in the right
neighborhood. The tables above are the source of truth for *what exists*; line
numbers are a convenience.
