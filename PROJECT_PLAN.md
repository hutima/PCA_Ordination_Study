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

Extracted text lives in `source_materials/extracted/*.txt` — that is what the
`dev/build_*.py` generators read. The original `.doc/.docx` files and the
Westminster PDFs were removed from the repo in Phase 16 to keep it small
(`.gitignore` now blocks binaries); restore them locally only if you need to
re-extract or re-run `dev/build_catechisms.py` / `dev/build_wcf.py`. The four
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
- [x] **Phase 16 — BCO comprehensive deck + grouped selector + repo slimming.**
      Release `?v=27`/`pca-v27`.
      - **BCO comprehensive sub-decks:** user-supplied bundle
        (`pca_bco_comprehensive_cards_bundle.zip`, generated from the 2025 BCO
        as paraphrase) landed as `js/data/subjects/bco_comprehensive.js` —
        165 cards in 8 sub-decks (orders 7–14 under the existing `bco`
        subject): Foundations; Membership/Mission/Officers; Courts; Vocation &
        Ordination; Discipline; Review/Appeals/Jurisdiction; Directory for
        Worship ×2. Validated + audited clean; wired into `index.html` and the
        `sw.js` precache.
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
