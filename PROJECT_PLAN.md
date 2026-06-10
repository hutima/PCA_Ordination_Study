# PCA Ordination & Licensure Study — Project Plan & Status

> **Resume doc.** This file is the source of truth for the build so work can
> continue in a fresh chat. Update the **Status** and **Next steps** sections
> as phases complete. Work happens on branch `claude/upbeat-edison-dz4in0`.

## 1. Goal

Adapt the **Duff Greek study tool** (a static, offline PWA spaced-repetition
flashcard app) into a **PCA ordination & licensure exam review app**. Keep the
general UI format and the SRS logic; replace the Greek content and machinery
with PCA ordination study material.

## 2. Locked-in decisions (from the user)

1. **Study modes — both:** Self-check recall is primary (read question →
   recall → reveal full answer → self-grade Hard/Uncertain/Easy → feeds SRS).
   Multiple-choice quiz (auto-graded) as a secondary mode for fact-style cards.
2. **Build strategy — strip-and-adapt in place:** Work in this repo. Keep the
   reusable infrastructure (SRS engine, PWA shell, CSS/look, gamification,
   modals/toast/charts, study-selector markup); strip the Greek modules;
   replace the data model and study modes.
3. **Content fidelity — faithful rich rendering:** Preserve lists, comparison
   tables, Scripture-proof blocks, sub-points. Answers stored as Markdown,
   rendered to HTML on the card back. References shown as chips.
4. **App name (proposed default):** "PCA Ordination & Licensure Study".
   Gamification: keep XP/levels/streaks. Deployment: GitHub Pages static PWA.
   (Confirm with user if revisited.)

## 3. Source material (in `source_materials/`)

Original docs + extracted text (`source_materials/extracted/*.txt`). The four
docs map onto the six PCA exam areas:

| Subject area | Source file(s) | Notes |
|---|---|---|
| **Book of Church Order** | `bco_qa.txt` (doc_0) | 74 clean numbered Q&A — cleanest source |
| **Sacraments** | `sacraments.txt` (doc_3) + Theology §J | Q&A, tables, four-views comparisons |
| **Theology** | `bible_content_theology.txt` (doc_2) §A–J | Westminster systematic, sections A. Bible … J. Sacraments |
| **Bible Content** | `bible_content_theology.txt` (doc_2) §I | Whole-Bible facts, OT/NT people/passages/events/topics |
| **Church History & PCA History** | `church_history.txt` (doc_1) + doc_2 §II | Eras table, solas, denominations, PCA origins |
| **Hot Topics** | `bible_content_theology.txt` (doc_2) §III | Contemporary issues |

### Re-extracting the docs (if needed)
- `.docx` are zip archives: unzip → `word/document.xml`, replace `</w:p>`
  with newlines, strip tags. (See the one-off Python used in Phase 1.)
- `.doc` (old binary): `antiword file.doc > out.txt` (install via apt).
- `libreoffice --headless --convert-to txt` did NOT work in this environment.
- Doc index map (copied into `source_materials/extracted/` with readable names):
  doc_0=BCO, doc_1=Church History, doc_2=Bible Content+Theology+History+HotTopics, doc_3=Sacraments.
- Big doc_2 section line markers (in original extraction): Bible Content `I.`@9;
  Theology §A Bible@2761, §B God@3037, §C Humankind@3541, §D Salvation@3820,
  §E Accomplished@4767, §F Applied@5302, §G Christian Life@5746, §H Church@6301,
  §I Last Things@6761, §J Sacraments@7512; Church History `II.`@7546;
  Hot Topics `III.`@8983; Westminster Assembly detail@9839.

## 4. Card / data contract

Subject data files live in `js/data/subjects/<subject>.js`, loaded as plain
`defer` script globals (same pattern as duff's `words.js`). Each registers into
a shared global:

```js
window.PCA_DATA = {
  subjects: [ { id, label, blurb, order, setKeys: [...] }, ... ],
  sets: {
    '<setKey>': {
      label, subject, order,
      cards: [
        {
          id,            // globally unique, e.g. "bco-014"
          q,             // question, plain text
          a,             // answer, Markdown (lists / tables / > Scripture)
          refs: [...],   // standards/Scripture citations -> rendered as chips
          tags: [...],   // optional
          quiz: {        // optional, fact-style cards only (Phase 6)
            choices: [...], answerIndex: N
          }
        }
      ]
    }
  }
};
```

Data files use an IIFE with `globalThis` fallback so they load under Node for
validation too. Validate with: `node dev/validate.mjs`.

## 5. Duff architecture — reuse map

The duff app is ~46k lines, deeply Greek-coupled. Reuse boundary:

**KEEP (content-agnostic, reuse as-is):**
- `js/domain/srs/*` — scheduler.js, confidence.js, constants.js. Pure
  functions. Outcomes `again`/`pass`/`easy` == Hard/Uncertain/Easy. **Core asset.**
- `js/domain/gamification/*` — XP, levels, usage stats.
- `js/utils/*` — helpers, time, storage (NOT greekSort.js).
- `js/ui/toast.js`, `js/ui/modals.js`, `js/ui/charts.js` — generic-ish.
- HTML shell (`index.html`) + `styles.css` — the "general UI format" to keep.
- PWA: `manifest.json`, `sw.js`, `.nojekyll`.

**STRIP (Greek-specific, remove):**
- `js/domain/grammar/*` (morph_steps, paradigm_focus, explanations).
- `js/logic/pos_logic.js`, `js/ui/reader.js`, `js/utils/greekSort.js`.
- All `js/data/*` Greek data: words, morphology, lemma_inventory, grammar,
  supplemental, reader*, concept_examples, parsing_examples, grammar_examples,
  `data/supplementals/*`, `data/advanced/*`.
- The Gentium/Noto Greek webfonts in `fonts/`.
- `pages/memorization.html` (paradigms page).
- Greek reference text dumps at repo root: `Graded Reader for Duff.txt`,
  `eontg_concepts_by_chapter.txt`.

**REWRITE (too Greek-coupled to adapt surgically — rebuild lean, reusing the
KEEP modules + the HTML shell):**
- `js/app/main.js` (2935 lines) — orchestration; modes vocab/morph/parsing/reader.
- `js/ui/render.js` (1716 lines) — card render is mostly morph-step rendering.
- `js/state/persistence.js` (1306 lines) + `runtime.js` (284) +
  `migrations.js` — tied to vocab/grammar/reader stores, directional Greek
  stores, unspaced archives. **Decision:** do NOT reuse wholesale; write a
  clean, small per-card SRS progress store + runtime state instead.
- `js/ui/navigation.js`, `selectors.js`, `analytics.js`, `keyboard.js` —
  reuse patterns/markup where cheap, but expect to rewrite the Greek parts.

> **Architecture decision (important):** "Strip-and-adapt in place" is honored
> by keeping the repo, the SRS engine, the PWA shell, the CSS/look, and the
> gamification — and by adapting the existing `index.html` shell (removing
> Greek controls). The orchestration layer (main/render/persistence) is
> rewritten lean rather than surgically untangled, because the Greek concepts
> (cards have `g`/`e`/morphology/stems; modes are parsing/paradigm/reader)
> permeate it and surgical edits are more error-prone than a focused rewrite
> that drives the same shell and reuses the kept modules.

## 6. Study modes

- **Review (self-check)** — primary. Question shown; "Reveal" flips to the rich
  answer + reference chips; user grades Hard / Uncertain / Easy → SRS
  (`again`/`pass`/`easy`). Reuses the existing mark-row + selfCheck plumbing.
- **Quiz (MCQ)** — toggle, only on cards with a `quiz` block. Auto-graded;
  correct→easy/pass, wrong→again into the same SRS.
- Replace duff's four-button mode strip (Vocab/Morph/Parsing/Reader) with
  **subject selection + a Review/Quiz toggle**.

## 7. Phases & status

- [x] **Phase 0 — Import baseline.** Duff app copied into repo, serves cleanly,
      committed. Source docs → `source_materials/`. (commit: Phase 0)
- [x] **Phase 1 — Content model proven on BCO.** `js/data/subjects/bco.js`
      (74 cards, 4 sub-decks, refs extracted, Markdown answers).
      `js/utils/markdown.js` (escape-first MD renderer: lists, blockquotes,
      GFM tables, inline emphasis). `dev/validate.mjs` validator. Verified
      end-to-end parse→card→Markdown→real SRS scheduler. (commit: Phase 1)
- [ ] **Phase 2 — Strip Greek + wire subjects + branding.** Remove Greek
      modules/data/fonts. Rewrite lean orchestration (main/render) + clean
      per-card SRS persistence. Repurpose study-selector to subject/sub-deck
      pickers. Rebrand (name, title, favicon, remove Greek fonts).
- [ ] **Phase 3 — Self-check review flow end-to-end** on BCO cards with SRS
      (reveal → grade → schedule → due/review panel).
- [ ] **Phase 4 — Rich-answer rendering** wired into the card back (tables,
      Scripture blockquotes, reference chips) + styling.
- [ ] **Phase 5 — Author remaining subjects:** Sacraments, Theology (A–J),
      Bible Content, Church History & PCA History, Hot Topics. One data file
      per subject; run `dev/validate.mjs`.
- [ ] **Phase 6 — MCQ quiz mode** for fact-style cards (author `quiz` blocks,
      render auto-graded choices feeding SRS).
- [ ] **Phase 7 — Analytics / PWA / polish:** trim analytics to per-subject
      mastery/due/confidence; bump `?v=NNN` cache-bust + `sw.js` precache;
      verify offline; update `docs/index-structure.md` + `CLAUDE.md`.

## 8. Key facts / conventions

- **SRS outcomes:** `again` (Hard, ~5min), `pass` (Uncertain), `easy` (Easy).
  Confidence is a rolling last-10 window; "easy" interval stabilizes (capped at
  1 day until 5+ flips AND ≥50% confidence), then grows to a 14-day cap.
- **Data publishing:** duff data files set `window.SETS` / `window.SESSIONS`.
  New PCA data uses `window.PCA_DATA` (see §4).
- **Cache-bust ritual:** every asset URL in `index.html` ends `?v=NNN`; same
  number in `sw.js` (`CACHE_NAME` + precache list). Bump both on release.
  Keep `docs/index-structure.md` in sync with `index.html` (see `CLAUDE.md`).
- **Local serve:** `python3 -m http.server 8137` then open `/`.
- **Validate content:** `node dev/validate.mjs`.

## 9. Immediate next steps (start of Phase 2)

1. Delete the STRIP list (Greek data/modules/fonts/reader/reference dumps).
2. Stand up a clean `runtime` + per-card SRS progress store in
   `js/state/` (localStorage; progress keyed by card id).
3. Rewrite `js/app/main.js` lean: load `PCA_DATA`, build a deck from selected
   subject/sub-decks, render Review cards, wire mark buttons → SRS, persist.
4. Rewrite the card render to show question → reveal → Markdown answer + refs.
5. Repurpose the study-selector overlay grids to subject/sub-deck pickers.
6. Rebrand `index.html` / `manifest.json` (title, name, remove Greek fonts/
   controls), update favicon/icons.
7. Keep `BCO` working end-to-end as the smoke test before authoring more.
