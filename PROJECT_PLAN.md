# PCA Ordination & Licensure Study — Project Plan & Status

> **Resume doc.** This file is the source of truth for the build so work can
> continue in a fresh chat. Update the **Status** and **Next steps** sections
> as phases complete. Latest work: branch
> `claude/fable-orchestration-governance-0kcce8` (Phase 35 — ranked quiz/exam
> results: shared grade scale, Quiz/Mock-exam high-score records, a Best
> scores section in the Progress overlay, celebrations/sounds, export v2).

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

**Removed from the repo in Phase 16/16b to keep it small** (`.gitignore` now
blocks binaries): the original `.doc/.docx` files, the Westminster PDFs, and
the whole `source_materials/` tree including `extracted/*.txt` — the inputs
the `dev/build_*.py` generators read. The generated `js/data/**` files are
checked in and are the working source of truth; to re-run a builder, restore
its inputs from git history first (e.g.
`git show <pre-Phase-16-sha>:"source_materials/extracted/church_history.txt"`).
The four docs map onto the six PCA exam areas:

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
          summary,       // optional, authored plain-text teaser for Review's
                         // progressive disclosure (else derived from `a`)
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

- [x] **Phase 39 — BCO True/False bank expansion (77 → 119).** Release
      `?v=73`/`pca-v73`. 42 net-new hand-authored questions
      (`qz-bcotf-78`…`119`) widen the Mock exam's BCO pool into previously
      uncovered ground: membership transfer/jurisdiction (46), quorums &
      RE-representation formulas (12-1/13-1/13-4/14-2/14-5), commissions vs
      committees (15), congregational meetings & officer-election thresholds
      (24–25), organizing commissions (5-9), assistant vs associate pastors
      (22), candidacy/internship/licensure (18–19), calls & dissolution
      (20/23/13-6), ordination vows & stated differences (21-4/21-5),
      references (41-1), offense classes & instituting process (29/31-2),
      the 32-20 time limit, single-witness corroboration (35-3), appeal-vs-
      complaint standing/exclusivity (42/43), divestiture without censure
      (38-2), restoration (37), and DfW sacraments & marriage (56/58/59).
      Every new item was drafted and then independently blind-reviewed
      (reviewer re-derived each answer without seeing the key; 45/45
      agreement; 3 drafts rejected as duplicates/redundant, 8 reworded to
      kill giveaway absolutes). Bank-wide balance 62T/57F (52.1% True),
      longest same-answer streak 4. `dev/validate.mjs` gains hard gates:
      duplicate normalized-statement detection, refs+note required on every
      id ≥ 78, and a 107-question size floor. Restart ledger:
      `docs/restart/bco-tf-expansion.md`.

- [x] **Phase 38 — Author-card project links (Mounce & Duff).** Release
      `?v=71`/`pca-v71`. The "Contact the author" card's other-projects list
      gains the two Greek grammar study apps — "Greek grammar study tool:
      Mounce" (`hutima.github.io/Mounce_study_tool`) and "Greek grammar study
      tool: Duff" (`hutima.github.io/duff_study_tool`) — matching the existing
      GitHub-Pages link pattern. `index.html` only, plus the release bump.

- [x] **Phase 37 — All sections (random) is a superset sitting (user
      request).** Release `?v=70`/`pca-v70`. The mixed card no longer draws a
      random N from the pooled union (Full was 100 with arbitrary
      composition): `mixedItems()` now draws **each section's own per-length
      count** from that section's remaining questions (`drawSpread` per
      section, then one shuffle) — Full = 100 Bible + 40 Theology + 50 BCO
      = **190**, Medium 95, Quick 50 — so the per-section composition is
      guaranteed and the run is a true superset of the three individual
      sittings. The redundant `LENGTHS[*].mix` arrays are gone; `countFor()`
      derives the mixed target as the sum of the three section counts.
      Ledger semantics unchanged: answers still credit their home section,
      short banks still shrink the run honestly ("only N available").

- [x] **Phase 36 — Contact-the-author footer (ported from Duff).** Release
      `?v=69`/`pca-v69`. A centered "Contact author" footer link at the bottom
      of the app shell (`.app-footer`/`.app-footer-link`, styles ported into
      `css/pca.css`) opens a `#contactAuthorOverlay` consent-modal with the
      Duff study tool's author note — maintainer line, blog + LinkedIn links,
      other-projects list, and the coffee/e-transfer note. The self-referential
      "PCA ordination study" project link was removed (and the Duff-specific
      "prepared for the 2026 Summer Intensive" sentence dropped). Wiring is
      three `showOverlay`/`hideOverlay` listeners in `pca.js` (footer button,
      Close, ✕); backdrop/Escape dismiss comes free via `initOverlayDismiss`.
      `dev/check_sw.mjs` now ignores `mailto:` hrefs when checking that every
      referenced asset is precached.

- [x] **Phase 35 — Ranked quiz/exam results (Best scores).** Release
      `?v=68`/`pca-v68`.
      - **Grade scale** (`js/domain/scoring.js`, named constants, one place to
        change): S≥95 / A≥80 / B≥70 / C≥60 / D≥0; A doubles as
        `EXPECTED_PASS_PCT`, the "expected pass" practice benchmark, always
        shown with `PASS_DISCLAIMER` ("practice benchmark only — presbytery
        standards govern"). **Only auto-graded answers rank** — exam codes
        `c`/`w`; self-graded `e`/`p`/`a` stay a separate tabulation
        (`js/domain/examScore.js`'s `tallyCodes`) and never touch pct/records.
      - **Quiz is now a finite, first-attempt-only scored run**
        (`js/app/quizSession.js`): snapshotted at deck build, so a Flip-deck
        recycle or revisit can't rewrite an already-scored card's result;
        **End quiz now** freezes the tally (later answers still study
        normally but never reopen the run); a complete, non-practice run
        writes one high-score record per subject via `finalize()`
        (idempotent — a results-screen re-render never re-applies it);
        "Review missed" reruns are practice and never record.
      - **High-score records** (`js/app/scoreRecords.js`,
        `localStorage['pca_score_records_v1']`, `{version:1,
        quiz:{[subjectId]:rec}, exam:{[sectionId]:{[variantKey]:rec}}}`,
        defensively parsed/sanitized — malformed entries are dropped, never
        thrown): Mock-exam sittings key on section × `'format:length'` (e.g.
        `mixed:full`, `mcq:quick`), recorded only for a fully-answered,
        non-resumed sitting with ≥1 auto-graded answer. A candidate beats the
        stored record on a higher pct, then a larger total on a pct tie, then
        refreshes the timestamp only on a full tie; incomplete/empty runs
        never record.
      - **Celebrations** (confetti, default on, `pca_celebrate_v1`) and
        **sounds** (default off, `pca_sound_v1`) fire only on an A/S grade
        (`js/app/celebration.js`), honor `prefers-reduced-motion` (a static
        gold accent instead of the canvas burst), and fail silently on a
        flaky device API.
      - **Progress overlay** gained a **Best scores** section (`progress.js`)
        listing every saved Quiz/Mock-exam record, right-aligned pct ·
        correct/total + a small grade badge.
      - **Export/import is version 2** (`{version:2, progress,
        scoreRecords}`); version-1 files (`{progress}` only) still import,
        and a missing/malformed `scoreRecords` section never blocks the
        progress import. Settings' new **Clear best scores…** clears only
        records; **Reset everything…** now also clears them (mock-exam saved
        answers are untouched — they have their own per-section Resets).
      - New modules `js/domain/{scoring,examScore}.js` and
        `js/app/{scoreRecords,scoreUi,quizSession,celebration}.js`, added to
        the `sw.js` PRECACHE; new tests `dev/test_scoring.mjs`,
        `dev/test_quiz_session.mjs`, `dev/test_exam_scoring.mjs`.
- [x] **Phase 34 — Exam navigation + linked overall score (user feedback,
      from phone screenshots).** Release `?v=67`/`pca-v67`.
      - **"‹ Back to sections"** button on every exam question view (safe
        mid-run — the persisted run resumes on return).
      - **Mixed practice replaced by "All sections (random)"**: a random
        `drawSpread` over the union of all three sections' REMAINING
        questions; answers credit each question's home section, so the card's
        score is the three sections' combined ledger ("Overall: N of 960 …").
        Its **↻ Reset all** clears all three sections (explicit confirm).
      - **📊 Results summary** (chooser button, shown once any progress
        exists): overall score + per-section tabulation, viewable any time
        without finishing a run; run-in-progress / complete states marked.
      - Reset → next run redraws + reshuffles from the full bank (verified).
- [x] **Phase 33 — Persistent per-section exam progress (user-requested).**
      Release `?v=66`/`pca-v66`. Exam answers persist per section
      (`pca_exam_progress_v1`) until an explicit **Reset**: each answer is
      recorded by question id with a result code ('c'/'w' auto-graded,
      'e'/'p'/'a' self-graded); new draws exclude answered questions so
      successive runs walk the whole bank to **section completion**; an
      interrupted sitting resumes (the in-flight run's question list is
      persisted; answered ones drop out on rebuild); results screens and the
      section-chooser cards show the **cumulative tabulation** ("N of BANK
      answered · ✓ correct · ~ partial · ✗ incorrect · %"), with a final
      section-complete screen; mixed runs credit answers to each question's
      home section. Reset is per-section (chooser footer + complete screen).
- [x] **Phase 32 — Full-bank exam pools + per-card MCQ coverage (user feedback
      round 2).** Release `?v=65`/`pca-v65`.
      - **Diagnosed "96 of 402 prompts":** the Bible exam pool only admitted
        MCQ-able/short cards, silently excluding all 229 long-form Bible Book
        Summaries cards. Now **every card enters the bank** (long cards as
        written self-graded prompts) — 457 Bible prompts.
      - **`drawSpread()`**: exam draws deal round-robin across sub-decks/books
        (shuffled within and across), so a run samples the whole span instead
        of clumping.
      - **Length control** (Quick 25/10/15, Medium 50/20/25 — the default,
        Full 100/40/50 matching the guide) + **Format control** (Mixed / MCQ-
        only = auto-graded MCQ+T/F), persisted (`pca_exam_length_v1`,
        `pca_exam_format_v1`).
      - **Per-card MCQ overlay** (`js/data/quiz_cards/*` →
        `window.PCA_CARD_QUIZ`, consumed by `cardQuiz()` in `js/app/quiz.js`,
        optional sharper `q` prompt override): **all 1,182 previously
        uncovered cards** got hand-authored MCQs (9 overlay files: bible_books
        OT 141 / NT 88, bible_content 95, bco 91, bco_comprehensive 166,
        theology 187, wcf 173, church_history 91, small_subjects 152 —
        authored by parallel subagents with distractor length/shape matched to
        the correct answer). Every card in the app is now quiz-ready — Quiz
        mode covers whole selections, and the exam's MCQ-only format has deep
        pools. `validate.mjs` hard-fails if a future card lacks an MCQ;
        `dev/mcq_coverage.mjs` prints the worklist.
      - **Banks grown:** BCO True/False 52 → 77 (generated from existing
        cards); new `js/data/quiz/bible_books.js` authored bank (40 whole-book
        MCQs).
- [x] **Phase 31 — Written-exam Mock exam + Quiz focus fixes (user-requested,
      from the C&C committee study guidelines).** Release `?v=64`/`pca-v64`.
      - **Mock exam rebuilt** (`js/app/exam.js`, replaces the fixed 25-question
        MCQ-only session): a section chooser modeled on the committee guide's
        secs 1–3 — **Bible Knowledge** (target 100, mixed MCQ + short-answer,
        pools = Bible Content + Bible Book Summaries; honest "N available of
        the 100-question section" note), **Theology** (written self-graded
        prompts over Theology/WCF/WSC/Doctrines & Proofs; the guide states
        **no fixed count**, so none is fabricated — 20 sampled per run and
        labeled), **BCO** (~50 True/False from the new hand-authored paraphrase
        bank `js/data/quiz/bco_tf.js` → `window.PCA_QUIZ_TF`, 52 items:
        permanent committees, worship elements, courts, constitution, three
        parts of the BCO, discipline, censures), and a **Mixed** 20/10/20
        sampler. Pools draw from the whole card bank independent of the study
        selection. Short/written items: optional type-your-answer box → reveal
        → Incorrect/Partial/Correct self-grade (→ again/pass/easy). Results:
        auto-graded score, self-graded tallies, answered-vs-target, per-deck
        breakdown, missed list; "Finish now" ends early. Exam keys moved from
        `initKeyboard` into the mode's own `onKey`. `validate.mjs` gained a
        `PCA_QUIZ_TF` block (unique ids, boolean answers, long-quotation guard).
      - **Quiz focus fixes:** answers now go through the controller's
        `quizOutcome()` (via ctx) instead of `applyOutcome` directly — so
        **Flip deck works under Quiz** (correct retires for the session, wrong
        recycles to the back, applied on the next move so feedback stays
        visible, no SRS writes per the Review flip convention). Deck meta now
        explains the deck: quiz-question count, due/retired counts, and a
        "X fact-style questions from your Y selected cards" note when the quiz
        deck is smaller than the selection (the old "why only N questions?"
        confusion). Flip retired counts are scoped to the active mode's card
        universe. Mode-specific empty states for no-quiz-ready and
        weak-spots-under-Quiz.
      (user-requested).** Release `?v=61`/`pca-v61`. Replaced the old §1-only
      `theo-wcf` theology sub-deck (26 chapter cards, each quoting only §1 with an
      "open the chip for the rest" note) with a dedicated **Westminster Confession
      of Faith** subject covering every section in full.
      - **Source cleaned + verified (`js/data/wcf.js`).** The original PDF pull had
        real defects: kerning splits (`per mission`, `infir mities`, `tur n`,
        `deter mine`, `inter meddle`, `ser pent`), glued proof-marker letters
        (`angelsf`, `Fatherg`, `familiesf`, `salvationa`, `perishb`), glued words
        (`allthings`×11, `becalled`, `incases`, `beworshiped`, `bepreached`), the
        two-column-scrambled **1.2 canon list**, **six sections with proof-text
        prose spliced into the confession text** (3.8, 8.1, 11.6, 15.6, 16.7,
        19.6 — 8.1's Eph 2 bleed had no inline citation, so an early citation-scan
        missed it), and a **truncated 33.2**. All repaired and **cross-checked
        word-for-word against the user-supplied authoritative "WCF text with proof
        references" export** — 171/171 sections match (the only intentional
        divergence is the de-scrambled 1.2 order). "unexcusable" is the
        authoritative spelling and is kept.
      - **Dedicated subject** `js/data/subjects/wcf.js` (id `wcf`, order 2.7, 33
        chapter sets `wcf-01`…`wcf-33`, **173 cards**), built by
        `dev/build_wcf_subject.mjs` (which also re-cleans `wcf.js` in place —
        idempotent). Each card carries the full section (`a`, `WCF:`-labeled) + an
        **authored concise `summary`** + base ref `WCF <ch>.<sec>` + proof refs +
        `wcf: true`. `subject.groups` = six theological divisions for By-subject.
      - **Sections split (Part D):** only **WCF 19.6** and **23.3** — after the
        proof-text bleed was excised these were the sole sections still >1200
        chars with multiple distinct claims. Each → two cards (`wcf-19-6a`/`b`,
        `wcf-23-3a`/`b`), question labeled "(Part N of 2)", a "part N of 2" note,
        base ref `WCF 19.6`/`23.3` on both, coverage contiguous and complete.
        (The apparent length of 3.8/11.6/15.6/16.7 was proof-text bleed, not real
        length — they stay single cards.)
      - **WCF card detail setting (Part E):** a **normal Settings** row (Full text /
        Summary), default **Full text**, `state.wcfDetail`/`pca_wcf_detail_v1`.
        `resolveCardDetail()` (`answer.js`) resolves WCF cards at render — full =
        the whole section shown directly; summary = the concise paraphrase with a
        "Full WCF text" expander. Only affects `wcf: true` cards; ordinary cards
        that merely cite the WCF are untouched.
      - **Week plan (Part F):** new `confession` column in `WEEK_COLUMNS` +
        per-week `confession` categories in `week_plan.js`; all 33 chapters placed
        once across weeks 2–12 (2:1–2, 3:3–5, 4:6&9, 5:7–8, 6:10–13, 7:14–18,
        8:19–24, 9:25–26&30–31, 10:32–33, 12:27–29). No duplicates.
      - **Browse export/print (Part G):** `js/app/browsePrint.js` — Print/Export →
        selection mode (checkboxes + Select all visible / Clear / Cancel / Print
        selected). Builds a print-only `#browsePrintArea` (hidden on screen, shown
        via `@media print`) and calls `window.print()` (native, no PDF lib, no
        popup). Empty selection → inline warning, no dialog. Reuses
        `renderAnswer`/`renderRefs`/`escapeHtml`; Browse-local state, no SRS
        effect. Exports respect the WCF detail mode.
      - **Print layout + .txt export** (`?v=62`/`pca-v62`, user follow-up): the
        print stylesheet is a compact **white page** — 14pt body, 1in margins,
        forced black-on-white (theme tints/boxes stripped), refs on one
        dot-separated line, long WCF quotations break across pages. Added an
        **Export .txt** button (`buildBrowseTxt`/`downloadTxt`) that downloads the
        same selection as `pca-study-cards.txt` (Markdown flattened, standard
        labels dropped) for self-formatting. Verified in Chromium (9/9: white page
        from dark theme, 14pt, txt content/filename/warning) + the 27/27 behavior
        suite still green.
      - **Cross-browser print + master checkbox** (`?v=63`/`pca-v63`, user-reported:
        Chrome desktop printed a blank page; iOS printed at the wrong font size).
        Root cause: an `@media print` region *inside* the app document — Chrome
        renders a `display:none`→print-shown region blank, and iOS inherited the
        app's `--text-scale`/text-size-adjust. Fix: `openBrowsePrint` now writes the
        cards into a **self-contained hidden iframe** (`#browsePrintFrame`) with its
        own `PRINT_CSS` (14pt, 1in, white, `text-size-adjust:100%`) and prints that
        document — inheriting none of the app CSS. Removed the old `#browsePrintArea`
        + `@media print` block from `css/pca.css`. Also replaced the "Select all
        visible"/"Clear" buttons with a single top **Select / deselect all**
        checkbox (`#browseSelectAllChk`, indeterminate on partial). Verified in
        Chromium 12/12 (master checkbox select/clear/indeterminate; iframe non-blank
        with body + question computed at 14pt / 18.667px on white; .txt still
        downloads; no console errors).
      - Removed `js/data/subjects/theology_wcf.js` + `dev/build_theology_wcf.mjs`;
        added `wcf.js` + `browsePrint.js` to `index.html`/`sw.js`; bumped `?v=61`
        / `pca-v61`. Gates: `validate` 0 problems (1267 cards / 11 subjects, WCF
        173/33), `audit` baseline 8 (no new flags), `check_sw` consistent (52
        precached / 20 modules). Chromium smoke: **27/27** (load, setting default/
        persist, full-vs-summary render, split coverage, week column, full Browse
        export flow, Review/Quiz/Mock regression); print output verified visually.
      - **Known limitation:** the new WCF cards have new ids (`wcf-<ch>-<sec>`), so
        SRS progress on the 26 old `theo-wcf-*` cards does not carry over (the deck
        was fundamentally restructured from per-chapter §1 to per-section full
        coverage).
- [x] **Phase 0 — Import baseline.** Duff app copied into repo, serves cleanly,
      committed. Source docs → `source_materials/`. (commit: Phase 0)
- [x] **Phase 1 — Content model proven on BCO.** `js/data/subjects/bco.js`
      (74 cards, 4 sub-decks, refs extracted, Markdown answers).
      `js/utils/markdown.js` (escape-first MD renderer: lists, blockquotes,
      GFM tables, inline emphasis). `dev/validate.mjs` validator. Verified
      end-to-end parse→card→Markdown→real SRS scheduler. (commit: Phase 1)
- [x] **Phase 2 — Strip Greek + wire subjects + branding.** DONE. Lean rewrite
      (`index.html`, `css/pca.css`, `js/app/pca.js`) reusing `domain/srs/*` +
      `utils/markdown.js`. Study-selector → subject/sub-deck tiles. New
      open-book-and-cross icon + manifest branding. Stripped all dead Greek
      code/data/fonts/pages/sw/docs + the `@font-face` blocks in `styles.css`.
      `js/` now contains only live deps. All `index.html` refs resolve (200).
- [x] **Phase 3 — Self-check review flow end-to-end.** Working on BCO: reveal
      → grade Hard/Uncertain/Easy → SRS schedule → persist → due-first deck +
      review/progress panel. (Landed with Phase 2.)
- [x] **Phase 4 — Rich-answer rendering.** Wired: card back renders Markdown
      answers (lists, GFM tables, Scripture blockquotes) + reference chips,
      styled in `css/pca.css`. (Landed with Phase 2.) Revisit nested lists
      (a./i. sub-points) when authoring Sacraments/Theology in Phase 5.
- [x] **Phase 5 — Author remaining subjects (COMPLETE).** All 6 subjects,
      537 cards. Each subject = a saved,
      reproducible generator in `dev/build_<subject>.py` → `js/data/subjects/
      <id>.js`, wired via a `<script defer>` in `index.html` + added to the
      `sw.js` precache, validated with `node dev/validate.mjs`.
      - [x] Sacraments — `dev/build_sacraments.py`, 27 cards, 3 sub-decks
            (General / Baptism / Lord's Supper). Handles unnumbered wrapped
            Q&A via a reflow pass + the comparison table.
      - [x] Church History & PCA History — `dev/build_church_history.py`, 93
            cards, 6 sub-decks (Overview/Eras/Solas, Denominations, Events,
            Terms, People, PCA History). Glossary prompts ("identify the
            following:") expand to one card per item; section headers stripped.
      - [x] Theology (A–I) — `dev/build_theology.py`, 153 cards, 9 sub-decks
            (A. Bible … I. Last Things). Outline parser: numbered questions,
            lettered/0-padded sub-points, Westminster quotes; J/Sacraments
            excluded (own subject).
      - [x] Bible Content — `dev/build_bible_content.py`, 175 cards, 8 sub-decks
            (Whole Bible; OT/NT People, Passages, Events, Topics). List-prompts
            expand per-item (lettered OR numbered items); prose Q&A kept whole.
      - [x] Hot Topics — `dev/build_hot_topics.py`, 15 cards (12 topics +
            B/C/D reference lists); Creation table merged, plague/day lists
            render. Stops before the Westminster-Assembly appendix.

      **All subjects (537 cards):** Bible Content 175, Theology 153, Church
      History 93, BCO 74, Sacraments 27, Hot Topics 15.
      Generator notes: reflow joins word-wrapped lines, breaking on `?`,
      list markers, headers, table rows; SUBJECT emitted via `json.dumps` to
      avoid JS-quote bugs; trailing standards cites stripped from questions.
- [x] **Phase 6 — MCQ quiz mode (COMPLETE).** Review/Quiz toggle wired
      (`setMode` in `pca.js`). Quiz deck = **hand-authored MCQ bank**
      (`window.PCA_QUIZ`, files in `js/data/quiz/<subject>.js`, ~89 questions
      across all 6 subjects, grounded in the Westminster Standards/BCO) **plus**
      auto-generated MCQs from short-answer review cards (passages etc.).
      Authored questions are filtered by the selected subjects. The quiz bank
      is separate from the generated review data so the build scripts never
      overwrite it; `dev/validate.mjs` checks ids/answerIndex/choices. Picking
      a choice auto-grades into the shared SRS (correct → `easy`, wrong →
      `again`). Keyboard 1–4 picks, space/→ advances. `.quiz-choice` styling in
      `css/pca.css`.
      Quiz contract: `window.PCA_QUIZ = [{ id, subject, q, choices[], answerIndex, refs[] }]`.
- [~] **Phase 7 — Analytics / PWA / polish.** DONE: service worker (`sw.js`)
      with offline precache + **auto-update** (new deploy → page promotes the
      waiting worker → reloads once; registration in `pca.js`). UI fixes:
      overlays now toggle the `.show` class (Choose subjects / Progress modals
      were dead because only `aria-hidden` was toggled); card/reveal/nav
      spacing; Markdown renderer gained lettered-list (`a. b.`) support; BCO
      generator (`dev/build_bco.py`, now reproducible) splits inline `a./b.`
      sub-lists and cleans conversion debris. REMAINING: richer analytics
      (charts/streaks) if desired; icon polish; bump cache on each release.

      **Release ritual:** bump `?v=N` in `index.html` AND `CACHE` in `sw.js`
      together so returning users auto-refresh onto the new version.
- [x] **Phase 17 — Full-width stacked subject selector (Duff-style rows).**
      Releases `?v=28`–`?v=31` / `pca-v28`–`pca-v31`. The selector's two sections (subject tile
      grid + sub-deck grid inside each `<details>`) were replaced by one
      stacked list (`#subjectList` in `index.html`): each subject is a
      full-width collapsible `.subdeck-group` row (label left, "n/m selected ·
      N cards" meta right, gold title when anything is selected); expanding
      reveals one full-width `.subdeck-row` per sub-deck — mirroring the
      Greek app's Week-row layout. A Select all/Deselect all toggle sits on
      the collapsed summary row itself (`?v=29`: moved up from inside the
      expanded body so whole subjects toggle without expanding; its click
      handler `preventDefault()`s so it never opens/closes the group). `.pca-grid`/`.pca-tile`/`.pca-section-label` CSS
      removed; `openSubdeckGroups` open-state persistence unchanged.
      - **BCO ref chips deep-link per chapter:** `refLink()` (`refs.js`) maps
        `BCO <ch>[-<sec>]` to the pcaac.org part page + `#chapter_N` anchor
        (Part 1 Form of Government ch. 1–26, Part 2 Rules of Discipline
        ch. 27–46, Part 3 Directory for Worship ch. 47–63); `BCO Preface …`
        → `/book-of-church-order/preface/`, `BCO Directory for Worship
        Preface` → the Part 3 page. Verified over all 180 distinct BCO refs
        in the card data (all chapters in 1–63).
      - **Quiz/mock-exam freshness audit (no code change needed):** both
        modes build from `quizDeckCards()` at runtime — the authored bank
        (`js/data/quiz/*.js`, 103 questions) plus auto-MCQs generated live
        from the current short-answer cards — so card-content updates (16/16b
        BCO bundles, hand edits) flow through automatically. Confirmed all 14
        BCO sub-decks register, no provenance-labeled (`BCO:` etc.) answers
        leak into auto-generated choices, and quiz ref chips pick up the new
        per-chapter BCO links.
      - **Scripture ref chips link to esv.org** (`?v=30`): `scriptureLink()`
        in `refs.js` normalizes the book to its full ESV name via a 66-book
        abbreviation map (`Rom.`→Romans, `Ps.`→Psalm, `Matt.`→Matthew, etc.),
        normalizes en/em dashes to hyphens, strips `ff.`, and builds
        `https://www.esv.org/<Book>+<ch:vv>/` (e.g. `Matthew+28:19`). esv.org
        403s bots but resolves in a browser. Verified all 73 distinct
        Scripture refs in the card+quiz data produce clean esv.org URLs (zero
        fallbacks); an unrecognized abbreviation still falls back to a
        tolerant biblegateway ESV search.
      - **Inline Scripture links + passage-card teaser fix** (`?v=31`,
        user-reported via the "The ministry" card): the esv.org change above
        only linked the `refs[]` chip row, but most Scripture citations live
        *inside* answer prose (957 distinct, ~1.2k occurrences). Added
        `linkifyScripture()` (`refs.js`) — a book-token regex that wraps every
        in-prose reference in an esv.org `<a class="qa-ref-inline">` — wired
        through the Markdown renderer's new `opts.linkify` hook
        (`renderMarkdown(src, opts)` → `renderInline`) and enabled by
        `renderAnswer` (`answer.js`), so links appear in answers, teasers, and
        Browse. To avoid swallowing the next reference, the inline matcher
        takes only chapter + optional `:verse(-range)` (no bare chapter ranges
        or comma lists). Verified: 1211 inline links across all answers, only
        10 tolerant-search fallbacks (bare "Cor."/"Thess."/"Pet." with the
        number dropped at the source), zero false positives on non-Scripture
        prose. Separately, `summarize()`'s passages-on-a-topic branch now emits
        a **bullet list** of the references (was a "Key passages: a; b; c."
        semicolon line) and `REF_LINE_RE` was broadened (optional trailing
        colon, any parenthetical gloss) so the whole `bc-146…bc-174` family
        teases as a clean linked bullet list. Fixed malformed bodies
        (bc-155 inline-quoted first passage; bc-153 parenthetical wrapped
        across blank lines) and authored explicit summaries for the two
        irregular cards (bc-149 section-grouped, bc-163 `//`-joined refs).
- [x] **Phase 18 — Self-contained question wording (user-reported via the
      Baptism card).** Two Baptism-deck questions only parsed in deck order
      because they referred back to an earlier card: `sac-008` ("Where in
      Scripture are *these terms* used?") and `sac-009` ("How does *the latter
      term* relate to paedo-baptism?"), both leaning on `sac-007`'s sign/seal
      definition. Out of order (Due/Weak/Shuffle decks, Quiz) they were
      unreadable. Rewrote both to name their referents: `sac-008` → "Where in
      Scripture are the terms \"sign\" and \"seal\" used of baptism?",
      `sac-009` → "How does baptism as a sign and seal relate to paedo-baptism
      (infant baptism)?". Hand-edited in the generated `sacraments.js` (the
      sacraments builder has no curation layer); ids unchanged so SRS progress
      survives. Gates clean (`validate` 0 problems, `audit` baseline 8).
- [x] **Phase 19 — iOS text-zoom + reflow ghost-click fixes** (ported from the
      Duff tool, commit `85761d3` and its issue #259). Release `?v=33`/`pca-v33`.
      - **Text size now scales glyphs on iOS.** The size control set `zoom` on
        `<body>` (`html[data-text-size="…"] body { zoom }`), but iOS Safari
        applies zoom to layout boxes without scaling rendered glyphs, so
        Large/X-Large only added whitespace. Replaced with a `--text-scale`
        custom property on `<html>` (1 / 1.12 / 1.25) and wrapped every
        `font-size` in both stylesheets (285 declarations) as
        `calc((…) * var(--text-scale, 1))`; the 4 bare `em` sizes are left
        unwrapped so they scale once via the already-scaled parent instead of
        doubling. `--text-scale` is defined on `<html>`, so it reaches
        `css/pca.css` too.
      - **Reflow ghost-click guard (issue #259).** Changing text size or font
        reflows the page, so on iOS the synthetic ~300 ms ghost click can land
        on a control that slid under the finger. Ported
        `js/utils/clickShield.js` (`shieldClicksBriefly()` + a capture-phase
        `installClickShield()`), installed once at startup and armed at the end
        of `setSize()` and `setFont()` (not `setTheme()` — a color swap doesn't
        reflow). Added to the `sw.js` precache.
      - The commit's toggle-label-wrap / `closeToggleInfoModal()` part does not
        apply here: that `.toggle-label` switch and modal are Duff-only (dead in
        this app). Gates clean (`validate` 0 problems, `audit` baseline 8,
        `check_sw` consistent).
- [x] **Phase 20 — Auto-update banner, 12-week plan, and missing syllabus
      content** (user-requested from the Chapell/Meek source PDF). Releases
      `?v=34` (banner) → `?v=35` (content) → `?v=36` (week filter).
      - **User-triggered update banner** (ported from Duff `3a9ef43`). Replaced
        the auto-`SKIP_WAITING` + reload-at-launch (which freezes iOS standalone
        PWAs) with an "Update available" banner: a new worker now waits, and the
        page only promotes it + reloads inside the user's "Refresh now" tap (or
        a cold start). `registerServiceWorker()` in `pca.js` rewritten with a
        `refreshAccepted` gate; `#updateBanner` markup + `.update-banner` CSS.
        `sw.js` already message-gated, so only its header comment changed.
      - **Missing content authored** (citable only; subjective items flagged):
        - New **Doctrines & Proofs** subject (`doctrines_proofs.js`, 10 cards,
          order 2.5): the five points (TULIP), the ordo salutis, and a gospel/
          evangelism plan — each with Scripture proof texts + WCF/Heidelberg.
        - New **Theology K** sub-deck (`theology_other.js`, `th-k`, 7 cards):
          the Holy Spirit (OT/today/Pentecost), gifts vs. fruit, the
          cessationist/continuationist question, answering Mormon/JW claims.
        - New **Personal Religion & Call** subject (`personal_call.js`, 6 cards,
          order 0.5): biblical office qualifications (1 Tim 3; Titus 1; 1 Pet
          5), inward/outward call, BCO 18–21 process; the genuinely subjective
          prompts gathered into one card flagged `flagged-subjective`.
        - All three hand-authored via a one-shot generator (`gen_decks.mjs`,
          kept in scratch) emitting JSON-escaped `.js` — the `.js` is the
          committed source of truth.
      - **Hot Topics → PCA GA actions.** Each controversy card now carries a
        `Note:` citing the relevant General Assembly action by GA #, year, and
        title (28th GA 2000 Creation; 2nd GA 1974 Holy Spirit pastoral letter;
        45th GA 2017 Women in Ministry; 15th GA 1987 baptism validity; 16th GA
        1988 Paedocommunion; 20th GA 1992 Divorce/Remarriage; 30th GA 2002
        good-faith subscription; etc.), verified by web research. Six
        high-confidence reports link directly to the pcahistory.org PDF.
      - **Markdown links.** `renderInline()` (`markdown.js`) gained
        `[label](https://…)` support (placeholder-protected from the Scripture
        linkify pass) so the GA report links render as `qa-ref-inline` anchors.
      - **12-week study plan / By-week selector** (`js/data/week_plan.js` →
        `window.PCA_WEEKS`). First shipped (`?v=36`) as an inline number-chip
        "Week" row, then redesigned (`?v=38`, user-reported "really ugly") into
        a **By subject / By week** toggle inside the "Choose subjects" modal,
        modeled on the Duff session selector. *By week* renders one collapsible
        group per week: the collapsed row is a Duff-style session card (a
        "Week N" tag, the theme, and a books subtitle — `Genesis–Exodus ·
        Joshua–Ruth`); a Select-all toggles the whole week; expanding lists each
        sub-deck as a subject-tagged topic link plus a "week-assign" caption of
        the non-deck assignments (catechism #s, hot topic, outlines/contents,
        doctrines). Both views share `groupHtml()`/`deckRowHtml()`;
        `state.selectorGroupBy` persists to `pca_selector_group_v1`. The
        throwaway inline-strip state (`state.week`, `pca_week_v1`,
        `renderPlanRow`/`setWeek`/`markSelectionCustom`) was removed. BCO
        sub-decks are assigned to weeks in canonical order (officers → … →
        Directory for Worship) so the weeks never show BCO out of order. Mapping
        notes live in `week_plan.js` (theology letters shifted by one; big decks
        attach to their first week). Gates clean (`validate` 0, `audit` baseline
        8, `check_sw` consistent); 804 cards, 8 subjects.
      - **Still flagged as missing** (not authored — uncitable or out of scope):
        the deeply personal Christian-experience/marriage answers (subjective by
        nature); and verbatim PCA GA report wording (copyright + the proxy
        blocks pcahistory.org fetches). *(The per-book Book Outlines / Book
        Contents drills, formerly listed here, were authored in Phase 21.)*
- [x] **Phase 21 — Bible Book Summaries (per-book outlines + chapter-range
      contents).** Release `?v=43` / `pca-v43`. The syllabus's weekly *Book
      Outlines / Book Contents* columns had no card deck; authored a new **Bible
      Book Summaries** subject (id `bible_books`, order 1.5) covering all 66
      books — **229 cards total**:
      - **66 overview cards** (one per book): Author & date / Genre / Theme /
        Outline / Christ & significance, in a confessional, conservative
        register (Mosaic Pentateuch, single Isaiah, Danielic Daniel, Pauline
        authorship of all 13 incl. the Pastorals, anonymous Hebrews). These are
        the "Book Outlines" drill.
      - **163 chapter-range "Book Contents" cards** for every book of 5+
        chapters, walking the book section by section (e.g. Genesis 1–11,
        12–25, 26–36, 37–50). Coverage is contiguous and complete (chapter 1 →
        last chapter) for each book; books of ≤4 chapters keep just the overview.
        Each book's overview is immediately followed by its section cards in
        chapter order.
      - Grouped into eight division sub-decks (`bk-pentateuch`, `bk-ot-history`,
        `bk-ot-poetry`, `bk-ot-major`, `bk-ot-minor`, `bk-gospels-acts`,
        `bk-paul`, `bk-general`). Every card carries 1–3 esv.org Scripture refs
        and an authored summary; outlines render as bullets (no tables), answers
        stay short so no audit flags.
      - **Reproducible build:** `dev/build_bible_books.mjs` reads
        `dev/data/bible_books/<n>-<div>.json` (overviews) +
        `<n>-<div>.sections.json` (chapter ranges), interleaves overview→sections
        per book, and emits `js/data/subjects/bible_books.js` (the working source
        of truth; JSON inputs committed for re-runs).
      - **Wired into the schedule:** each division deck is added to the first
        week its books are read in `week_plan.js` (Pentateuch + OT History → wk
        2, Major Prophets → wk 4, OT Poetry → wk 5, Gospels & Acts → wk 6, Minor
        Prophets → wk 7, Pauline Epistles → wk 9, General Epistles & Revelation →
        wk 11), so the By-week selector's outline/contents rows are selectable
        decks; the week captions still name the specific books due.
      - Registered like any subject (`<script defer>` in `index.html` after
        `bible_content.js`, `sw.js` precache, `?v=43`/`pca-v43`). Gates clean
        (`validate` 0 problems / 1033 cards / 9 subjects, `audit` baseline 8,
        `check_sw` consistent).
- [x] **Phase 22 — Schedule-aligned By-week selector + per-book decks + GA hot
      topics** (user-requested from the Licensure/Ordination Notebook PDF +
      the Schedule of Assignments screenshot). Release `?v=44`/`pca-v44`.
      - **Per-book Bible sets.** `dev/build_bible_books.mjs` now emits **one set
        per book** (`bk-<slug>`, 66 sets, 229 cards — card ids unchanged so SRS
        progress survives) instead of 8 division decks. The subject keeps all 66
        `setKeys` plus a `groups` array (8 divisions) for nested display. This
        lets the By-week selector assign **individual books** to the week they
        are read (matching the schedule's per-book Book Outlines / Book Contents
        columns); every one of the 66 books is assigned to exactly one week
        (verified), Philemon read with the Prison Epistles in week 11.
      - **Category-structured weeks.** `js/data/week_plan.js` rewritten from a
        flat `sets` list into the schedule's nine columns per week (Book
        Outlines, Book Contents, Bible Content, Doctrines & Proofs, Theology,
        Catechism, History, BCO, Hot Topic) + `personal`/`focus`. The By-week
        selector now expands a week into a **second level of collapsibles, one
        per column** (`WEEK_COLUMNS` in `pca.js`), matching the printed table;
        Catechism + Hot Topic render as note captions, empty columns hide. BCO
        is mapped to the syllabus's Preface/A–J chapter blocks (all 14 decks
        placed in chapter order); Theology/Bible Content/History/Doctrines/
        Catechism realigned to the table; spanning decks (NT Key Passages,
        NT Key Topics, Key People) listed in both their weeks.
      - **Recursive selector.** `groupHtml()`/`renderSelector()` generalized to
        nested sub-groups (`groupLeafKeys()`, a single `[data-keys]` Select-all
        handler, `.subdeck-subgroup` styling, `.week-cat-note` captions). The
        **By-subject** view now nests Bible Book Summaries by division and the
        **BCO by chapter block** (`subject.groups` in `bco.js`) — same deck keys
        as the week view, ordered differently.
      - **New hot topics, official PCA GA sources.** Added
        `ht-016-women-in-office` (women in church office — BCO 7-2/9-7; the 45th
        GA 2017 Ad Interim Committee on Women in Ministry; the BCO 7-3 amendment
        ratified 2024) and `ht-017-christian-nationalism` (the Ad Interim
        Committee erected at the 51st GA 2024, Overture 47; partial report to the
        53rd GA 2026), each linking the official report PDF (pcahistory.org /
        pcaga.org). Surfaced in the most-matching weeks (7 women, 8 Christian
        nationalism) as "see also" hot-topic notes. Hot Topics now 24 cards.
      - **Per-book outline links.** Each book overview card gains a TGC
        commentary link (`dev/data/bible_books/outline_links.json` →
        `thegospelcoalition.org/commentary/<slug>/`, rendered as a `Note:`
        callout). Chosen over GotQuestions for reputability (named Reformed
        scholars).
      - **Selector UX.** By week is now the default (`loadSelectorGroup()`); a
        second **Clear** button added to the modal header.
      - Verified end-to-end in jsdom against the real module (week categories,
        per-book rows, nested subject groups, Select-all, edge weeks 1/7/8/13).
        Gates clean (`validate` 0 problems / 1035 cards / 9 subjects, `audit`
        baseline 8, `check_sw` consistent).
      - **Inline catechism in the week view** (`?v=45`/`pca-v45`): the week's
        Catechism column now expands to the actual WSC Q&A pulled from
        `window.PCA_CATECHISMS` (`weekCatechismHtml()` / `parseCatechismSpec()`
        in `pca.js`, `.cat-qa-*` styles), so the assigned questions read in place
        — no flipping to the Catechisms mode. Ranges + singletons (e.g.
        "WSC 88, 91–98") parse to the explicit question list; open-state persists
        like any selector group. Verified in jsdom (weeks 2/8/12).
      - **Per-view hot-topic cards** (`?v=46`/`pca-v46`, user-requested):
        the nine multi-view hot topics are now split into one card per named
        view (like the Creation set), each grounded in the PCA's own
        documents/GA actions: charismatic gifts (cessationist / continuationist /
        open-but-cautious; 2nd GA 1974, BCO 7-1), the regulative principle
        (regulative vs. normative; WCF 21, BCO 47-1), the Sabbath
        (Puritan/Westminster / Continental / fulfilled-in-Christ; WCF 21.7-8),
        re-baptism (Hodge's broad validity vs. Thornwell's narrow; 15th GA 1987
        *received*, not adopted), theonomy (theonomic vs. general-equity; WCF
        19.4, 7th GA 1979), paedo-communion (paedocommunion vs.
        discerning-the-body; 16th GA 1988 *adopted*), divorce & remarriage
        (no-remarriage / Westminster / constructive-desertion; WCF 24.5-6, 20th
        GA 1992), confessional subscription (strict / good-faith / system /
        loose; 30th GA 2002, BCO 21-4), and fencing the table (open / close /
        closed; BCO 58-4, WLC 173, 21st GA 1993 reaffirmed the wording). +24
        cards (Hot Topics 24 → 48). Inserted after each parent via a deterministic
        text patch (kept in scratch). Three research agents verified the GA
        numbers/years and corrected two nuances (1987 baptism *received* not
        adopted → left to the courts; the 1993 fencing action was a *denied
        overture* reaffirming BCO 58-4). Gates clean (`validate` 0 problems /
        1059 cards, `audit` baseline 8 — the 24 new cards add no flags,
        `check_sw` consistent).
      - **Recent Ad Interim Committee hot topics** (`?v=47`/`pca-v47`,
        user-requested): the major PCA study reports the 1993 Chapell/Meek guide
        predates, added as cards and surfaced as "second hot topics" in the
        most-matching week (`hotTopic.related` in `week_plan.js`): **racism /
        racial reconciliation** (Overture 43 adopted 44th GA 2016; RER report
        46th GA 2018) → wk 8; **human sexuality** (AIC report commended 48th GA
        2021, the Twelve Statements) → wk 5; **domestic abuse & sexual assault**
        (AIC report 49th GA 2022) → wk 5; the **Federal Vision / NPP** report
        (adopted 35th GA 2007, nine declarations) → wk 9; and **Insider
        Movements** ("A Call to Faithful Witness," 40th GA 2012 / 43rd GA 2015)
        → wk 3. +5 cards (Hot Topics 48 → 53), each citing its GA action with an
        official link. **Also corrected `ht-017`:** the Christian Nationalism
        committee was erected by the **52nd GA (2025)**, not the 51st GA (2024) —
        the moderator who appointed its members (Kevin DeYoung) chaired the 52nd
        GA, and the partial report (53rd GA 2026) / final (54th GA 2027) timeline
        fits a 2025 erection. Gates clean (`validate` 0 problems / 1064 cards,
        `audit` baseline 8, `check_sw` consistent).
      - **Catechism & hot topics as selectable decks** (`?v=48`/`pca-v48`,
        user-requested). Two related changes so a week's Catechism and Hot Topic
        columns are real study decks (not the inline Q&A / note captions):
        - **New `shorter_catechism` subject** (`js/data/subjects/catechism_wsc.js`,
          built by `dev/build_catechism_wsc.mjs` from `js/data/catechisms.js`): the
          WSC questions the schedule assigns (WSC 1–39 & 82–98, 56 cards) as
          flashcards, grouped into per-week sub-decks (`wsc-wk<N>`). Appears as its
          own By-subject category; the inline week catechism Q&A
          (`weekCatechismHtml`/`parseCatechismSpec`) was removed.
        - **Hot Topics restructured into one set per topic** (20 sets, same 53
          cards/ids), grouped via `subject.groups` into "Syllabus" and "Recent GA
          committee" topics. Each topic deck = parent overview + per-view cards +
          PCA position.
        - **week_plan** `catechism` and `hotTopic` are now `{ sub?, sets }` deck
          columns; `WEEK_COLUMNS`/`weekBodyHtml` simplified (every column is a deck
          set, so the special note/inline branches and `.week-cat-note`/`.cat-qa`
          CSS are gone). Each week links one or two hot-topic decks via
          `hotTopic.sets` (e.g. wk5 Divorce + Domestic Abuse, wk8 Civil Disobedience
          + Christian Nationalism). Verified in jsdom (week 2/5/9 deck rows,
          Select-all, By-subject catechism + hot-topic groups). Gates clean
          (`validate` 0 problems / 1120 cards / 10 subjects, `audit` baseline 8,
          `check_sw` consistent).
- [x] **Phase 23 — Duff-aligned study-engine settings (user-requested).**
      Release `?v=49`/`pca-v49`. Aligned the deck controls to the Duff study tool
      and tuned the spacing for a 3-month class.
      - **Advanced settings panel.** New `<details>` "Advanced settings" section
        (between the Focus row and Settings) holding three On/Off toggle buttons
        (`.adv-row`/`.adv-toggle` in `css/pca.css`): **Shuffle** (moved out of the
        Focus row — same `#shuffleBtn`/`pca_shuffle_v1`, still parked under "In
        order"), **Spaced repetition**, and **Unspaced daily reset**. The Focus
        row now holds only the four focus buttons.
      - **Spaced-repetition master switch** (`state.spacedOn`, `pca_spaced_v1`,
        default on). Off = **unspaced**: `buildDeck()` ignores the SRS schedule
        (every card is "due"); in Review the deck retires graded cards for the day
        (`unspacedMark`: Hard recycles to the back, Uncertain/Easy retire) and
        `applyOutcome` (srs.js) skips all SRS writes, logging the rep to the
        activity heatmap only. Retirements are day-stamped in `pca_unspaced_v1`.
      - **Unspaced daily reset** (`state.unspacedDailyReset`, `pca_unspaced_reset_v1`,
        default on; toggle disabled while spaced is on). On = a day-stamp older
        than today clears the retired pile on load, re-presenting the whole
        selection each new day; off keeps retirements until a manual reset. An
        "Unspaced deck finished" empty state offers a Restart button.
      - **2-month cadence only.** Confirmed the SRS scheduler already uses Duff's
        *intensive* preset (14-day `SRS_MAX_INTERVAL_DAYS`, identical easy-curve
        multipliers) — the "2-month" logic, appropriate for a 3-month course — so
        the Duff *relaxed* (8-month) cadence and its toggle were intentionally
        **not** imported.
      - **Mode-aware reset.** Replaced the single "Reset progress…" with
        **Reset this selection** (scoped to the chosen sub-decks) + **Reset
        everything…** (`resetSelectionProgress`/`resetAllProgress`); in unspaced
        mode a reset clears the retired pile instead of SRS progress, and the
        selection-reset button relabels accordingly (`updateResetLabels`).
      - **Sans is the default font** (pre-paint script + `pca.js` init fallbacks).
      - **By week is first** in the selector's By-week/By-subject toggle so the
        week-priority default reads clearly (the order was By subject / By week).
      - Gates clean (`validate` 0 problems, `audit` baseline 8, `check_sw`
        consistent — no new precached files).
- [x] **Phase 24 — Three-deck spaced ordering + richer gamification
      (user-requested).** Release `?v=50`/`pca-v50`. Ported the Duff tool's
      session-aware deck ordering and a fuller progress/gamification layer.
      - **Shuffle forced on once.** A one-time migration (`pca_shuffle_migrated_v1`
        in `loadShuffle`) sets Shuffle on for everyone on the first load after this
        release — even users who had turned it off under the old model — then
        respects the saved value, so a later manual toggle-off still sticks.
      - **Three-section spaced deck** (`buildDeck` in `pca.js`, ported from Duff's
        `buildStudyDeck`): `[active, middle, deferred]`. *active* = due-now cards in
        the in-flight rotation, order preserved across rebuilds via
        `state.spacedActiveIds`; *middle* = cards that come due mid-session, parked
        behind active and promoted on the next fresh start; *deferred* = not-yet-due,
        sorted by soonest-due (or shuffled when Shuffle is on — the user asked for
        unseen cards to be shuffled too). A fresh start (`opts.forceShuffle`, a ≥5h
        idle gap via `SESSION_IDLE_RESET_MS`, or no carry-over) collapses everything
        due into a freshly-(re)shuffled active pile. A 30-min near-due backstop
        (`SRS_NEAR_WINDOW_MS`) keeps the deck from going dead. `avoidHeadCollision`
        keeps the just-graded card (`state.lastSeenId`) off the head of the next
        cycle. `advance()` rebuilds when the due set is exhausted (study-ahead into
        deferred only when nothing is due). User-initiated rebuilds pass
        `forceShuffle`; the end-of-pass rebuild resumes (preserves order).
      - **XP + levels.** `applyOutcome` now stamps `firstConfirmedAt` (rolling
        confidence ≥70%) and accrues XP via the existing `computeCardXpAward`
        (again 1 / pass 3 / first easy 10 / later easy 5 / unspaced 1), persisted to
        `pca_xp_v1` (`addXp`/`loadXp` in store; unspaced/flip grading award XP too).
        New `js/app/gamification.js`: a 14-level ladder tailored to ~1.1k cards with
        a PCA register (Inquirer → Catechumen → … → Licentiate → Teaching Elder →
        Doctor of the Church), `computeXpAndLevel`, `computeStreaks` (current +
        longest), `isConfirmed`/`confirmationTotals`, and `computeBadges`.
      - **Progress overlay enriched** (`progress.js`): a level/XP banner (level
        badge, title, flavour, progress bar, "XP to next"), a longest-streak hero
        stat alongside current, and a badges grid (daily, card-count milestones,
        streak tiers, and one completion badge per subject). Existing heatmap,
        mastery bars, forecast, and weak-spots retained. New `.prog-level`/`.badge`
        CSS; hero grid is now responsive (`auto-fit`). `gamification.js` added to the
        `sw.js` precache.
      - Verified gamification math in Node (level thresholds, current/longest
        streaks). Gates clean (`validate` 0, `audit` baseline 8, `check_sw`
        consistent — 48 precached / 17 modules).
- [x] **Phase 25 — Advanced-settings toggle UX + self-healing SW
      (user-reported).** Releases `?v=51`→`?v=53`.
      - **Startup-crash hotfix (`v51`):** v50 added a duplicate
        `export const SESSION_IDLE_RESET_MS` to `js/domain/srs/constants.js` (it
        already existed) — an ESM `SyntaxError` that stopped `pca.js` loading, so
        no buttons worked. Removed the dup. `node --check` parses `.js` as a
        script and missed it; added an ESM-import + DOM-stub smoke test
        (`scratchpad/smoke.mjs`-style) that runs `init()` and catches it.
      - **Self-healing service worker (`v52`):** the old SW only promoted a new
        worker when the page posted `SKIP_WAITING` from the Refresh-now tap, so a
        broken cached build deadlocked (the page that would promote never ran) and
        refresh did nothing. `sw.js` now `skipWaiting()`s on install (+ existing
        `clients.claim()`), so a release self-activates on the browser's own sw.js
        refresh, independent of page JS. `registerServiceWorker` no longer posts
        SKIP_WAITING; it shows the banner when a new worker takes control and
        reloads only on the user's tap (still never auto-reloads — the iOS freeze
        cause).
      - **Duff-style toggle rows (`v53`):** the Advanced-settings toggles were a
        wall of inline description. Replaced with Duff's pattern — a pill
        `.toggle-switch` on the left + a short uppercase `.toggle-text` label + an
        injected circled `.toggle-info` (ⓘ) that opens a describe-modal
        (`#toggleInfoOverlay`) with the toggle's full `title`. `installToggleInfo()`
        injects the (i) and `showToggleInfo()` fills the modal; the (i) stops
        propagation so it never flips the switch. Toggles are now
        `#shuffleToggle`/`#spacedToggle`/`#unspacedResetToggle` buttons wrapping
        `#shuffleBtn`/`#spacedBtn`/`#unspacedResetBtn` switch pills; `setToggle`
        slides the pill + syncs `aria-checked` + dims parked rows (`.is-disabled`).
- [x] **Phase 26 — Catechism-mode progress (user-requested).** Release
      `?v=54`/`pca-v54`. The Catechisms reader (full WSC/WLC flip cards) was
      non-graded; made it self-gradable with its **own** progress, separate from
      the subject decks / week plan.
      - **Grading.** The catechism card now shows Hard/Uncertain/Easy buttons
        (and 1/2/3 keys); grading advances to the next question. Reuses the
        confidence/XP/confirmation engine directly via a new
        `applyCatechismOutcome(id, outcome)` (`srs.js`) that records confidence, a
        confirmation stamp (rolling ≥70%), XP, and the activity rep — but **no**
        SRS `dueAt` scheduling, and **independent of the global spaced/unspaced
        toggle** (the reader is a straight read-through, not a scheduled deck).
      - **Separate namespace.** Progress is keyed `cat:<cat>:<n>` (e.g.
        `cat:wsc:1`), so it lives in the same `pca_progress_v1` store yet never
        mixes with the subject decks (nothing iterating `DATA.subjects` sees it).
        XP/streak/badges still accrue from it.
      - **Surfaced.** The reader's deck-meta shows `WSC · n/107 confirmed` and a
        per-question status badge (`✓ confirmed` / live `%`); the Progress overlay
        gains a **Catechism mastery** section (WSC + WLC confirmed bars) distinct
        from the subject mastery bars. Gates clean (`validate` 0, `audit` baseline
        8, `check_sw` consistent); init + grading verified in Node.
- [x] **Phase 27 — Update prompt as a blocking modal** (ported from the Mounce
      study tool, PR #100). Release `?v=55`/`pca-v55`. The Phase-20 corner
      "Update available" banner sat in the bottom-left and was easy to ignore, so
      users lingered on a stale cached version. Replaced it with a blocking modal
      `#refreshAvailableOverlay` reusing the shared `.consent-overlay`/
      `.consent-modal` styles (`<h2>` + `.consent-copy` + a single
      `quick-btn quick-primary` "Refresh now"). `registerServiceWorker()` in
      `pca.js` now calls `showOverlay('refreshAvailableOverlay')` instead of the
      banner show/hide; the self-activation reload semantics are unchanged
      (no `SKIP_WAITING` — sw.js self-activates and the tap just reloads). Removed
      the bespoke `.update-banner*` CSS (now shared-modal styles) and the
      `#updateBanner` markup + dismiss button. Backdrop/Escape dismiss via
      `initOverlayDismiss()` still applies, consistent with the other modals.
      Gates clean (`validate` 0, `audit` baseline 8, `check_sw` consistent v55).
- [x] **Phase 29 — The 150 Psalms as a Catechisms-mode reader category
      (user-requested).** Release `?v=57`/`pca-v57`. A devotional/study reader —
      not a flashcard deck — added as a fourth category in the Catechisms mode's
      first dropdown (WSC / WLC / BCO / **Psalms**).
      - **Data.** `js/data/psalms_kjv.js` (generated by `dev/build_psalms.mjs`
        from checked-in inputs `dev/data/psalms/{kjv_psalms,summaries,bullets}.json`)
        merges `cats.psalms` into `window.PCA_CATECHISMS` after `catechisms.js`
        loads: `{ id:'psalms', kind:'psalms', items:[{ n, title, q, summary,
        apply[], verses:[{num,text}], refs }] }` — 150 psalms, 2,461 verses.
        **KJV text is public domain**, extracted from
        hutima/Lectio-Memorization `data/kjv/19.json` (itself built from
        aruljohn/Bible-kjv). The 150 summaries (1–2 sentences, genre-aware) and
        the 2–3 practical parishioner-application bullets per psalm (`apply`)
        are original to this app.
      - **Reader** (`js/app/psalms.js`, `createPsalmReader(ctx)`; the catechism
        descriptor in `modes.js` branches on `cat.kind === 'psalms'` and stays a
        thin seam — WSC/WLC/BCO flip-card behavior unchanged). Card layout:
        deck label (`Psalms · Psalm N of 150` + the shared confirmed/% badge) →
        psalm number → a **collapsible summary block** (header doubles as the
        Show/Hide toggle; holds the summary + the `apply` bullets; resets to
        visible on psalm change) → KJV|ESV translation switcher → **Reveal all /
        Hide all** → one **verse-toggle button row per verse** (number always
        visible, text behind a tap, `aria-expanded`, keyboard-activatable) →
        the Hard/Uncertain/Easy row. Grading marks the **whole psalm** through
        `applyCatechismOutcome` under `cat:psalms:<n>` (the deck-meta confirmed
        count and the Progress overlay's Catechism-mastery section pick it up
        automatically); verse reveal/hide never grades. Space/Enter toggles
        reveal-all (unless a button has focus); arrows navigate psalms.
        Re-renders run through `withCardAnchor`.
      - **ESV, never bundled** (ported from the hutima/Lectio-Memorization
        pattern): selecting ESV with no saved token opens `#esvTokenOverlay`
        (the ESV is copyrighted, so the app uses the user's own free Crossway
        token — stored ONLY in localStorage, never committed or logged; the
        version flips to ESV only on an explicit save, so backdrop/Escape/"Use
        King James" all leave KJV active). Fetches ONE psalm per request from
        `api.esv.org/v3/passage/text/` (`Authorization: Token …`, `[n]`
        verse markers parsed to rows), cache-first into
        `pca_esv_psalm_cache_v1` (quota-evict oldest); 401 → token-rejected +
        re-enter/KJV, 429 → rate-limit + KJV, network failure → cached copy if
        any, else a friendly error + KJV. New localStorage keys:
        `pca_psalm_version_v1`, `pca_esv_token_v1`, `pca_esv_psalm_cache_v1`.
      - **Gates extended:** `dev/validate.mjs` now checks the Psalms category
        (150 psalms, 1–150 in order, summaries + apply bullets present, verse
        numbering ascending, 2,461 KJV verses) and scans the psalm modules for
        token-like literals. Validate 0 problems; audit baseline 8; `check_sw`
        consistent (51 precached). Browser QA (Playwright, desktop + 360px):
        41/41 checks — dropdowns, reveal/hide semantics, summary toggle, ESV
        modal / 401 / cache / reload persistence, exactly-one-psalm fetching,
        whole-psalm grading, WSC/WLC/BCO + Review/Browse/Quiz/Mock-exam
        regression, and no horizontal scroll at 360px.
      - **Sticky Reveal/Hide-all controls** (`?v=58`/`pca-v58`, user-requested,
        after the #43 scroll-jump fix): `.psalm-controls` is now
        `position: sticky` — the Reveal all / Hide all row pins to the top of
        the viewport while a long psalm scrolls under it (top respects
        `env(safe-area-inset-top)` for the iOS notch; the row bleeds over the
        card's side padding and repaints `--card-front` under itself so verse
        text never shows through). Verified in Chromium on Psalm 119 at
        desktop + 360px: pinned at 0px while 6–12k px deep, buttons clickable
        while pinned, back in normal flow at page top, no horizontal overflow.
- [x] **Phase 28 — PWA "install to Home Screen" nudge + scrollable modals**
      (ported from the Mounce study tool, PR #107). Release `?v=56`/`pca-v56`.
      New self-contained module `js/app/pwaInstall.js` (imported by `pca.js`,
      which calls `initPwaInstall()` + `maybeScheduleInstallPrompt()` at the end
      of `init()`). Exports `initPwaInstall`, `maybeScheduleInstallPrompt`,
      `triggerInstall`, `openInstallInstructions`, `closeInstallInstructions`,
      `isInstallInstructionsOpen`, `dontShowInstallAgain`, `showInstallPrompt`.
      - **For all non-dismissed phone users, not just new ones** (user-specified
        deviation from the Mounce port). This app has no consent/disclaimer gate
        to hook acceptance onto, so the banner is simply *scheduled on init*
        (~2s) for every phone user who hasn't dismissed it. `tryShowScheduled()`
        re-arms (~2s) while any `.consent-overlay.show` is open so the banner
        lands on a clear screen after the selector/progress/update modal closes.
      - **Persistent top banner** `#pwaInstallHost` (created on demand) modelled
        on the achievement toast (`.level-toast`) but it never auto-hides — only
        Install or ✕ clears it. Download icon, "Get the best experience" copy, an
        Install button, and a ✕. `z-index: 950` sits below the `.consent-overlay`
        modals (1000) so an open how-to/selector covers it.
      - **Phone-only, never-after-dismissal.** `isLikelyPhone()` (iPhone/iPod UA,
        or Android+Mobile UA, or coarse-pointer + min screen edge ≤ 480px); skips
        if `isStandalone()`. The banner ✕ and the modal "Don't show again" both
        persist a **module-local** `localStorage` flag
        (`pca_install_prompt_dismissed_v1`) — deliberately *not* a `store.js`
        export, to avoid the "frozen on update" SW failure mode; app-specific key
        so it never collides with the Duff/Mounce apps sharing a `*.github.io`
        origin. `beforeinstallprompt` is captured (preventDefault + stash);
        `appinstalled` marks dismissed and tears down.
      - **`triggerInstall()`**: fires the captured `.prompt()` on Android/Chromium
        (only an *accepted* outcome marks dismissed); otherwise opens
        `openInstallInstructions()` — a `#installInstructionsOverlay`
        (`.consent-modal install-modal`) with platform-detected numbered steps
        (iOS Safari 4-step, Android Chrome 3-step, generic fallback), a
        `.modal-close-x`, and `.consent-actions install-actions` footer (Got it! /
        Don't show again). Opening the how-to auto-hides the banner. Backdrop/Esc
        dismiss is the existing generic `.consent-overlay` handling (a soft close —
        the banner can return next session); only ✕/"Don't show again" persist the
        flag. A **Settings → "Install app"** button (`#installAppBtn`, hidden when
        standalone or non-phone) is the standing re-install path (analog of
        Mounce's user-guide button).
      - **Scrollable modals** (independent fix): `.consent-modal` gains
        `max-height: calc(100dvh - 32px); overflow-y: auto; overscroll-behavior:
        contain` so tall modals (the install how-to, the selector on small phones)
        scroll within the viewport instead of overflowing off-screen.
      - **CSS** in `styles.css`: `.pwa-install*` banner (mirrors `.level-toast`,
        z-index 950, persistent multi-line body, pill Install button, ✕);
        `.install-steps/.install-step/.install-step-num` (circled number badge —
        white text in light theme since light `--gold` is a dark umber);
        `.consent-actions.install-actions` (left-aligned, side-by-side
        auto-width `.ctrl-btn`); `.modal-close-x`.
      - **Cache-bust:** `pwaInstall.js` added to the `sw.js` precache; `CACHE`
        bumped `pca-v55` → `pca-v56` and all `?v=55` → `?v=56` in `index.html`.
        Gates clean (`validate` 0, `audit` baseline 8, `check_sw` consistent v56 —
        49 precached / 18 runtime modules); ES-module syntax compile-checked and a
        16-assertion DOM-stub smoke of the module's flows passed.
      deeper slimming.** (Same release as 16, `?v=27`.)
      - **BCO comprehensive deck replaced** by the user's
        `pca_bco_comprehensive_quoted_labeled_bundle.zip` (committed to main):
        same 165 cards, but answers explicitly mark quoted BCO wording.
        Adapted on import (one-shot transform): "Direct quotation:" →
        `BCO:` provenance callouts (`BCO` added to `STANDARD_LABELS` and
        `LABEL_STRIP_RE` in `answer.js`, label "Book of Church Order (quoted
        wording)"); redundant "Paraphrase:" prefix dropped; nine
        semicolon-chained answers recast as lists (033 deacon duties, 039
        courts, 043 Session powers, 048 Presbytery powers, 053 GA business,
        066 licensure exams, 079 officer exams, 090 discipline steps as an
        ordered list, 127 dissent/protest/objection).
      - **Semicolon-wall review (user-reported, e.g. the Anselm card):**
        multi-part answers glued with semicolons now render as bullets.
        Church-history glossary cards (Key People etc.) are bulletized
        structurally — `bulletize_def()` in `dev/build_church_history.py`
        keeps the "epithet—dates; role" first line as the intro, makes each
        further source fact a bullet, and splits top-level '; ' chains
        (semicolons inside parens/quotes protected); curated rebuilds for
        ch-003 (solas), ch-012 (canon), ch-063 (Luther), ch-088 (RPCES
        timeline), ch-089 (PCA origin). Sacraments: sac-004 bulletized,
        sac-011 four-views given bold per-view headers (hand-edited in the
        generated file — the sacraments builder has no curation layer).
        Five enumeration teasers became bullet lists (ch-011, ch-087b,
        ht-004, th-098, th-145); compact prose teasers and verbatim WCF
        quotations keep their semicolons. New `SEMICOLON_CHAIN` audit class
        in `dev/audit.mjs` (≥3 top-level semicolons in a plain line; first
        lines, quotes, and provenance-labeled lines exempt) — baseline clean.
      - **Deeper slimming (user-requested):** both BCO bundle zips and the
        whole `source_materials/` tree (extracted `.txt` included) removed.
        The generated `js/data/**` files are now the working source of truth;
        builder inputs are recoverable from git history when a re-run is
        needed.
- [x] **Phase 16 — BCO comprehensive deck + grouped selector + repo slimming.**
      Release `?v=27`/`pca-v27`.
      - **BCO comprehensive sub-decks:** user-supplied bundle
        (`pca_bco_comprehensive_cards_bundle.zip`, generated from the 2025 BCO
        as paraphrase) landed as `js/data/subjects/bco_comprehensive.js` —
        165 cards in 8 sub-decks (orders 7–14 under the existing `bco`
        subject): Foundations; Membership/Mission/Officers; Courts; Vocation &
        Ordination; Discipline; Review/Appeals/Jurisdiction; Directory for
        Worship ×2. Validated + audited clean; wired into `index.html` and the
        `sw.js` precache. (Superseded by the quoted/labeled bundle in 16b.)
      - **Collapsible sub-deck selector:** the selector's flat sub-deck grid
        (22 sets) became one `<details class="subdeck-group">` per subject
        (duff-style outline) with a selected-count summary line; open state
        survives re-renders (`openSubdeckGroups` in `pca.js`). Dropped the
        nested `#subdeckGrid` scrollbox — the modal scrolls as one unit.
      - **Repo slimming:** deleted the four Westminster PDFs (~1.6 MB), the
        four `.doc/.docx` originals (~1.2 MB), and the card bundle zip from
        the working tree; `.gitignore` now blocks `*.pdf/*.doc/*.docx/*.zip`.
        The generated outputs (`js/data/catechisms.js`, `js/data/wcf.js`,
        subject files, `source_materials/extracted/*.txt`) stay committed, so
        the app and every `dev/build_*.py` that reads `extracted/` still run;
        only `dev/build_catechisms.py` / `dev/build_wcf.py` would need the
        PDFs restored to re-run.
- [x] **Phase 15e — Bulleted multi-part teasers.** Release `?v=26`/`pca-v26`.
      Teasers render as Markdown (`renderAnswer(summarize(card))` + `.qa-summary`
      list styles): ~25 multi-part authored summaries rewritten as bullet
      lists (solas, censures, duties, exam areas, attributes, heresies, plan
      of salvation…), and the derived enumeration path now emits intro +
      bullets + an italic "(+N more)" instead of a semicolon chain (a short
      fragment first line joins the bullets rather than posing as an intro).
- [x] **Phase 15d — Enumeration-teaser sweep.** Release `?v=25`/`pca-v25`.
      New `ENUM_FIRST_ONLY` audit class: enumeration questions ("What were
      the solas…?", "List church censures") whose derived teaser expounded
      only the first part. Ten authored enumerating summaries: the five
      solas (ch-003), BCO principles of government, member kinds, elder and
      deacon duties, licentiate/nominee exam areas, censures, Session
      composition+duties (hand-authored governance file), church attributes
      (th-118), Presbyterian-government principles (th-122), and the Acts
      kerygma elements (bc-067).
- [x] **Phase 15c — Stub-answer sweep.** Release `?v=24`/`pca-v24`. New
      `STUB_ANSWER` audit class: answers that are dangling cross-references
      into the source document. Fixed: th-020 days-of-creation ("See chart
      below" → the creation-theories chart, shared from the hot-topics
      builder), th-093 theonomy, th-123 women as officers, th-124
      subscription (all "See below" → real authored answers + summaries);
      ht-003's "a. See above." prefix stripped (`replace_text` op); two
      bible-content fronts whose wrapped parenthetical leaked into the
      answer (bc-050, bc-123) repaired.
- [x] **Phase 15b — Consistent question-card height.** Release `?v=23`/
      `pca-v23`. Unrevealed review/catechism cards share a fixed min-height
      (270px under 640px, 210px above — covers ~95% of fronts; long
      questions still grow) with the tap hint flex-pinned to the bottom, so
      the card and the nav/grade buttons below it stay put while flipping
      through questions. Verified 60/60 phone and 45/45 desktop cards at
      identical heights with a single Next-button position.
- [x] **Phase 15 — Full content audit + selector UX (user-reported).**
      Release `?v=22`/`pca-v22`. A systematic audit (`dev/audit.mjs`) of all
      590 cards against failure classes seen on the phone, fixed via a shared
      curation engine (`dev/curation.py`) imported by the builders:
      - **Selector:** Select all / Clear / Done at bottom + Done at top;
        hover styles gated behind `@media (hover: hover)` so taps on touch
        screens no longer leave a sticky gold "selected-looking" outline.
      - **Licensure-style fronts (Bible Content):** list-prompt items now
        carry their parent prompt ("Discuss briefly the life and significance
        of Abraham…", "Locate by book and chapter: Passover.", "Identify
        passages someone could read about: Atonement."); ids keep the item
        slug. Memory verses re-attached to their parent questions (general
        revelation; law & grace); OT divisions merged into one card; the
        glued Ten-Commandments/NT-law double question split into two cards.
      - **Flattened PDF tables rebuilt by hand:** OT history overview,
        covenant table, four-gospels distinctives, Letters & Life of Paul,
        spread of Christianity (all proper GFM tables → `md-stack` on
        phones); the ordo-salutis junk table stripped.
      - **Compound monsters split:** natures-of-Christ (25k chars → 26
        cards, th-055a–z), Covenant of Grace relations (3 cards), life of
        Christ (outline / parables / miracles), Presbyterianism-in-America
        (timeline + a recovered modernism/fundamentalism card).
      - **Content removed:** a ~20k-char copyrighted essay ("A Brief History
        of Covenant Theology" © R. S. Clark) glued into ch-090, and the
        source author's personal confessional exceptions glued into bc-175.
      - **~60 authored summaries** across all subjects; `summarize()` gained
        a "Key passages:" mode for Scripture-topic cards and "(+N more)"
        instead of trailing "…"; short table-free answers (≤480 chars,
        e.g. memory verses) now render in full on reveal (`directAnswer()`),
        skipping the teaser+expander. BCO compound questions fold their
        glued second question into the front. `validate.mjs` now fails any
        teaser containing "|" or ending in "…". 616 cards total.
- [x] **Phase 14 — Mobile tables + authored summaries (user-reported).**
      Release `?v=21`/`pca-v21`. The truncated "…" review teasers and
      phone-unreadable tables (screenshots from Hot Topics) fixed three ways:
      - **Authored `card.summary`** (already preferred by `summarize()`, never
        used before) for every Hot Topics card plus the two table-only cards
        in Sacraments (`sac-025`) and Church History (`ch-025`). Added via a
        curation layer in the generators (`CURATE` in `build_hot_topics.py`,
        `SUMMARIES` in the other two) — keys are checked against generated ids
        so the build fails loudly if extraction drifts.
      - **Sub-card splits:** the 5-theory Creation table → overview card (table
        kept) + one card per theory + a Literary-Framework-support card;
        Kings of Israel/Judah → two list cards (nine dynasties / Davidic line;
        also fixes a Pekahiah/Pekah date column-slip in the extraction). The
        seven-days table → paired forming/filling lists. Hot Topics is now 22
        cards (590 total).
      - **Responsive tables:** `renderMarkdown()` stamps every cell with its
        column header (`data-th`) and classes 3+-column tables `md-stack`;
        below 640px CSS hides the header row and renders each row as a
        labeled block (Review + Browse). `summarize()` now skips table rows
        when deriving a teaser (header cells joined as a fallback), and
        `validate.mjs` fails any card whose teaser contains raw `|` markup or
        a malformed `summary`.
- [x] **Phase 13 — Duff parity + UX fixes (user-reported).** Release `?v=18`/`pca-v18`.
      - **Flip deck (non-spaced) focus** ported from the Duff tool: a fourth
        Focus option. Hard/Uncertain send the card to the back of the pile,
        Easy retires it for the session (`state.flipArchived`, session-only);
        the SRS schedule is untouched, only the daily-activity log records the
        rep. End of a pass reshuffles the remaining pile; an empty pile shows
        a "Restart the deck" button. Start studying / changing the selection
        resets the pass.
      - **Shuffle toggle** (persisted, `localStorage['pca_shuffle_v1']`, on by
        default) in the focus row: off = book order for due cards and the flip
        deck; disabled while "In order" is the focus.
      - **Grade buttons always visible** in Review (hidden + revealed states),
        and keyboard 1/2/3 grade without revealing first.
      - **No-selection bug fixed**: an empty selection no longer silently
        means "everything" — `effectiveSetKeys()`/`quizDeckCards()` return
        nothing until subjects are chosen.
      - **UI**: mode bar reordered (Review · Browse · Catechisms · Quiz ·
        Mock exam); the "Progress & display" utility section is now
        "Settings".
- [x] **Phase 12 — Text-quality + UX fixes (user-reported).**
      - **Catechism PDF extraction overhaul** (`dev/build_catechisms.py`):
        kerning-split words repaired everywhere (WSC answers/questions had no
        repair at all — "W hat", "Ho w", "miser y", "g race", "bor n"); the
        repair iterates to a fixpoint for 3-way splits ("wo rk s"), prefers
        right-merges for lowercase ambiguity ("communion in g race"), and
        tests halves with lenient stemming so plurals don't false-merge
        ("allthings" ×13 fixed). WLC Q18's interleaved answer line is
        rerouted ("a wise, b and pow-" leak). Fused/space-orphan footnote
        markers stripped with a kerning-fragment guard (never eats "g races",
        "T hou", "gover nor s"); verified-text overrides for undecidable
        collisions ("fora", "cand", "reater"). 1311/1317 footnotes matched.
      - **Word bullet debris → Markdown lists**: `build_bible_content.py`
        converts the "." / "o" bullet artifacts into (nested) `-` lists;
        `markdown.js` renders one level of `  - ` nesting. `build_bco.py`
        peels answer text that ran onto question lines ("…discipline?• …",
        "How quickly must an appeal be filed? Within 30 days…") and splits
        inline "•" runs into list lines.
      - **Sentence-complete summaries** (`answer.js`): derived review
        summaries never cut mid-sentence — whole sentences/list items only
        (294 mid-word truncations → 0), clause-cut fallback only past 420
        chars.
      - **Stable card scrolling**: `withCardAnchor()` in `pca.js` keeps the
        card's top edge fixed across reveal/hide/next re-renders (catechism +
        review/quiz), so collapsing a long answer no longer jumps the page.
      - **MCQ fairness**: qz-ch-8 (Calvin's Institutes) distractors no longer
        carry other authors' names (answer-by-omission); qz-sac-9 phrasing
        normalized.
      - **Unspaced mode**: a third Focus option **In order** reads the whole
        selection straight through in subject/sub-deck order, ignoring the
        SRS schedule (grading still records progress).
      - Release: `?v=14` / `pca-v14`.
- [x] **Phase 11 — BCO paraphrase content + card-quality audit.**
      The BCO is copyrighted: all BCO content is paraphrase, labeled as such
      (sources panel + per-card paraphrase callouts), with chips → pcaac.org.
      - Two hand-authored governance sub-decks (`js/data/subjects/
        bco_governance.js`, 23 cards): courts in practice (Session/Presbytery/
        GA/SJC, review & control, paths to a higher court, organizing
        churches, evangelists, congregational business) and ministry/members/
        worship in practice (good-faith subscription, membership vows,
        reception modes, restoration, without-process, officer-only censures,
        baptism, marriage, DFW constitutional authority incl. BCO 59,
        out-of-bounds labor, deacon assistants). +14 BCO MCQs (qz-bco-17..30).
      - **BCO Key Points (paraphrase)** memorization set (`js/data/
        catechisms_bco.js`, 39 items) added to the Catechisms dropdown;
        non-verbatim sets render a paraphrase callout, refs in a collapsed
        "References" section.
      - Card-quality audit & fixes: `build_bible_content.py` no longer drops
        a list item's first prose line (58 fragment answers → 2 legitimate),
        passage heads split at the ref colon ("Psalm 19:1-4a: …"); the
        flattened Great Awakenings table in church_history became one proper
        comparison-table card (4 garbage cards removed); BCO conversion
        debris stripped; `summarize()` extends bare list-intro first lines
        with following items so review summaries are complete thoughts.
      - Release: `?v=13` / `pca-v13`.
- [x] **Phase 10 — Westminster Standards content (public-domain PDFs).**
      Source: WCF + Larger/Shorter Catechism PDFs uploaded to main (public
      domain; the BCO is copyrighted and is linked, never embedded).
      - `dev/build_catechisms.py` extracts WSC (107) and WLC (196) Q&A with
        Scripture-proof citations from the PDFs. The WLC's page-bottom proof
        apparatus (8pt) is separated from main text (10pt) via a font-size
        text pool; marker letters are matched to footnotes page-locally and
        stripped from answers; kerning-split words repaired by dictionary.
      - **Catechisms study mode** (`modes.js` registry): dropdown to pick
        WSC/WLC + a question dropdown, Q/A flip card (answer renders as a
        labeled standard callout), Scripture proofs in a collapsed section,
        prev/next + keyboard, position persisted (`pca_catechism_v1`).
      - `dev/build_wcf.py` extracts the full WCF (33 chapters, 171 sections,
        578 proof footnotes) → `js/data/wcf.js` (build-time artifact).
      - `dev/build_theology_wcf.mjs` adds a theology sub-deck "Confession
        definitions (WCF)": one card per WCF chapter not explicitly cited
        anywhere in the theology content (26 cards quoting §1 verbatim with
        proof refs), filling confessional gaps with official wording.
      - `dev/validate.mjs` now validates the catechism data (counts,
        numbering, non-empty). Release: `?v=12` / `pca-v12`.
- [x] **Phase 9 — Modular refactor + card simplification + MCQ fairness.**
      - `pca.js` split into focused modules under `js/app/` (store, content,
        quiz, answer, refs, srs, modes, progress); `modes.js` is a registry —
        adding a study mode = one descriptor + one button + sw precache entry.
      - Review card now uses progressive disclosure: reveal shows a short
        summary (authored `card.summary` or derived first line) + reference
        chips; the full answer & quotations sit behind a tap-to-open expander.
      - MCQ fairness: auto-generated distractors are length-balanced;
        `dev/validate.mjs` flags any authored question whose correct option is
        a length outlier (31 found and rewritten — distractors lengthened,
        correct answers untouched).
      - Service-worker auto-update hardened: install precaches with
        `cache: 'reload'` (no stale assets), page-side reload now only fires
        when an existing controller is replaced (no first-visit reload).
        `dev/check_sw.mjs` verifies precache completeness (incl. the ES-module
        import graph) and `?v=N`/CACHE agreement on every release.
      - Headless jsdom harness (external, /tmp) verified 14/14 behavior checks
        before and after the refactor; sw lifecycle stub-tested 7/7.
- [x] **Phase 8 — Study-modes + analytics expansion (app review follow-up).**
      Acting on a full app review. Landed (cache `?v=10` / `pca-v10`):
      - **Browse mode** — non-graded collapsible outline of every card in the
        selection (`<details>` per question). The "summary with expandable
        detail" read-through; no SRS.
      - **Mock exam mode** — finite (25-question) mixed MCQ session across the
        selection with a scored, per-subject results summary; still feeds SRS.
      - **Weak-spots focus** — a Due/Weak toggle on the Review/Quiz deck;
        Weak = studied cards under 60% confidence. Also reachable from a
        "Study weak spots" button in the Progress overlay.
      - **Rich Progress overlay** — hero stats (streak, today, coverage, seen),
        a GitHub-style 17-week activity heatmap, per-subject mastery bars,
        due-forecast, and a weak-spots list. New daily-activity log persisted
        to `localStorage['pca_activity_v1']` (incremented in `applyOutcome`).
      - **Provenance-aware answers** — `renderAnswer()` wraps confessional
        quotes (`WSC:`/`WLC:`/`WCF:`), attributions (`Calvin:`…) and `Note:`
        study notes in labeled callouts so official wording is distinct from a
        gloss. Cards without prefixes render unchanged.
      - **Linked references + official-sources panel** — reference chips
        deep-link to official texts (`refLink()`: BCO→pcahistory, WCF/WLC/WSC
        →opc.org, Scripture→BibleGateway). A "Sources & official texts" panel
        links the official BCO, the Westminster Standards with proof texts, and
        the Chapell/Meek prep guide, and flags that the BCO deck is adapted
        from a third-party 2007 set (paraphrase — verify against current BCO).

## 8. Key facts / conventions

- **Quiz-quality pass (2026-07, post-Phase-16):** all authored MCQs (143 bank
  + 1182 overlay) and the BCO T/F bank (77) were audited and rewritten to
  remove answer tells: authored choices now shuffle at presentation
  (`shuffledAuthored()` in `js/app/quiz.js`, also used by the exam's
  `authoredItem()`); margin-length giveaways, comma/list tells, extreme
  imbalance, and malformed sets are all at 0 and gated by
  `dev/test_quiz_quality.mjs` (allowlist: `dev/quiz_quality_allowlist.mjs`,
  empty; rubric: `docs/quiz-quality-rubric.md`); the T/F bank is 39T/38F,
  streaks ≤4, every false explained, refs complete. Run
  `node dev/audit_quiz_quality.mjs` for the metrics report; keep new quiz
  content within the rubric or the gates will fail.

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

## 9a. Finishing Phase 5 — Bible Content & Hot Topics (precise notes)

Both live in `source_materials/extracted/bible_content_theology.txt` (read with
`encoding='utf-8', errors='ignore'` — it has stray non-UTF-8 bytes). Model the
generators on `dev/build_theology.py` (outline parser) and
`dev/build_church_history.py` (glossary expansion).

- **Bible Content** (doc_2 §I, lines ~9–2560). Numbered questions `N.` (1–16+,
  not 0-padded, low indent) — same shape as theology. Sub-section headers like
  `1 Old Testament: Key People`, `2 …Key Passages`, `3 …Key Events`,
  `4 New Testament: General`, `5 …Key People`, `6 …Key Passages`,
  `7 …Key Topics` → use as sub-decks. Two flavors: prose Q&A (Synoptic Problem,
  gospel features, outline of Christ's life) → one card; and "Discuss/Locate
  the following: …" list-prompts where each person/passage is an item → expand
  per-item like the church-history glossary. Watch the Ten Commandments block
  and the OT/NT book-order lists.
- **Hot Topics** (doc_2 §III, ~8983+). Intro `A.` paragraph, then topics
  `1. Creation`, `2. …`. Contains wide multi-column tables (Creation Theories,
  5 cols, heavily wrapped) — reuse the `normalize_answer` table merge from
  `build_sacraments.py`, or simplify very wide tables to a bulleted list per
  row. Note a trailing B./C./D. reference block (created each day, Ten Plagues,
  Kings of Israel/Judah) — decide whether to include.

After each: add `<script defer>` to `index.html`, add to `sw.js` PRECACHE,
bump `?v=N` + `CACHE` together, run `node dev/validate.mjs`.

## 9. Immediate next steps

The lean app is built and runs (Phases 2–4 core landed). Remaining:

1. **Finish Phase 2 strip:** delete dead Greek files/assets now unused by the
   app. The running app only needs: `index.html`, `css/pca.css`,
   `js/app/pca.js`, `js/utils/markdown.js`, `js/utils/helpers.js`,
   `js/domain/srs/{constants,scheduler,confidence}.js`, `js/data/subjects/*`,
   `styles.css`, `favicon.svg`, `manifest.json`. Safe to remove: old
   `js/app/main.js`, all `js/ui/*`, `js/logic/*`, `js/domain/grammar/*`,
   `js/domain/deck/*`, `js/domain/gamification/*`, `js/state/*`, the Greek
   `js/data/*` (everything except `subjects/`), `js/utils/greekSort.js`,
   `fonts/`, `pages/`, root `*.txt` Greek dumps, `docs/index-structure.md`
   (Greek-specific). Verify `python3 -m http.server` + asset 200s after.
2. **Phase 5 — author remaining subjects** (the big content task): Sacraments,
   Theology (A–J), Bible Content, Church History & PCA History, Hot Topics.
   One `js/data/subjects/<id>.js` per subject following the BCO file as a
   template; add a `<script defer>` tag for each in `index.html`; run
   `node dev/validate.mjs`. Source text in `source_materials/extracted/`.
   Parsers: BCO-style numbered Q&A is easiest; the others are
   question-paragraph format (see §3 line markers for doc_2 sections).
3. **Phase 6 — Quiz (MCQ)** mode: author `quiz` blocks on fact-style cards,
   build an auto-graded MCQ render path in `pca.js` feeding the same SRS, wire
   the currently-stubbed `#modeQuizBtn`.
4. **Phase 7 — PWA + polish:** re-register a fresh service worker with a PCA
   precache list + cache-bust, new icons, offline check; expand the progress
   overlay (charts/streaks) if desired.

### How the running app is wired (quick orientation)
- Entry: `js/app/pca.js` (ES module). State in a module-local `state` object;
  progress persisted to `localStorage['pca_progress_v1']`, selection to
  `['pca_selection_v1']`. Theme/font/size keys: `pca_theme/pca_font/pca_text_size`.
- Card model & data contract: see §4. Add subjects by dropping a data file in
  `js/data/subjects/` and a `<script defer>` tag in `index.html`.
- SRS application: `applyOutcome()` in `pca.js` — `again`→5min,
  `pass`→`getUncertainDelayMs`, `easy`→`getNextEasyIntervalDays`.

## 10. Deferred TODOs (agreed, not yet built)

- ~~Hide-answer toggle~~ — DONE. The card is now tap-to-flip: tapping it (or
  Space/Enter) toggles the answer on/off so you can test recall back and forth.
  The separate "Reveal answer" button was removed.
