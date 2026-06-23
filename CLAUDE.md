# Repository notes for Claude

This repo is the **PCA Ordination & Licensure Study** app — a static, offline
spaced-repetition review app adapted from the Duff Greek study tool. Read
**`PROJECT_PLAN.md`** first: it is the source of truth for the plan, decisions,
architecture/reuse map, content contract, phase status, and next steps.

## How to update content (post-Phase-16 cleanup — read this first)

The repo was slimmed in Phase 16/16b: the Westminster PDFs, the `.doc/.docx`
study guides, the BCO bundle zips, and the whole `source_materials/` tree
(including `extracted/*.txt`, which every `dev/build_*.py` reads) are **gone
from the working tree**. `.gitignore` blocks `*.pdf/*.doc/*.docx/*.zip` so
they don't creep back.

That changes the update workflow:

- **The checked-in `js/data/**` files are the working source of truth.** For
  small content fixes (typos, a card's answer/summary, restructuring one
  card), edit the generated file directly and note it in `PROJECT_PLAN.md`.
  The "Do not hand-edit; re-run the generator" headers predate the cleanup.
- **To re-run a builder** (bulk/structural changes via its `CURATE` layer),
  first restore its inputs from git history — they live at any pre-Phase-16
  commit, e.g.:
  `git show 'b9199aa:source_materials/extracted/church_history.txt' > …`
  (same for the Westminster PDFs needed by `dev/build_catechisms.py` /
  `dev/build_wcf.py`). Restore, run `python3 dev/build_<subject>.py`, commit
  the regenerated `js/data/**` output only — do not re-commit the inputs.
- **If you hand-edit a generated file and later re-run its builder, the
  builder will overwrite your edit** — port hand-edits into the builder's
  `CURATE` dict when you do bulk work. Known hand-edits so far are listed in
  PROJECT_PLAN Phase 16b (sacraments sac-004/sac-011; the whole
  `bco_comprehensive.js` one-shot transform).
- **Always finish with the quality gates:** `node dev/validate.mjs` (card
  shape, Markdown render, teaser completeness, MCQ fairness) and
  `node dev/audit.mjs` (phone-use failure classes — questions-in-answers,
  glued answers, flattened tables, mid-thought teasers, semicolon walls).
  The audit baseline is 8 known flags; don't add new ones.

## Orientation

- **Entry point:** `js/app/pca.js` — a thin controller over focused modules in
  `js/app/`: `store.js` (shared state + persistence), `content.js` (data
  access), `quiz.js` (MCQ generation), `answer.js` (provenance rendering +
  summaries), `refs.js` (citation → official-source links), `srs.js` (outcome
  application), `modes.js` (study-mode registry), `progress.js` (analytics
  overlay). Styling: `styles.css` (base tokens) + `css/pca.css`. Progress
  persists to `localStorage['pca_progress_v1']`, selection to
  `['pca_selection_v1']`, daily-activity log to `['pca_activity_v1']`.
- **Adding a study mode:** add a descriptor in `js/app/modes.js`
  (`createModes`), a `<button data-mode="id">` in `index.html`, and any new
  files to the `sw.js` PRECACHE. The controller wires clicks/keyboard/render
  through the registry.
- **Study modes:** Review (self-check; short summary first, full answer &
  quotations behind an expander), Quiz (MCQ), Browse (collapsible outline,
  non-graded), Mock exam (finite scored MCQ session), Catechisms (WSC/WLC
  full text plus a hand-authored BCO-paraphrase set in
  `js/data/catechisms_bco.js`, as flip cards — dropdown per set + per
  question, proofs/references in a collapsed section; position persists to
  `pca_catechism_v1`; a set with `verbatim: false` renders a paraphrase
  callout instead of the confessional one). A Due/Weak/In-order/Flip-deck
  focus toggle shapes the Review/Quiz deck (In order = unspaced read-through
  in book order; Flip deck = non-spaced, ported from Duff: Hard/Uncertain
  recycle to the back of the pile, Easy retires for the session — no SRS
  writes, only the activity log). A persisted Shuffle toggle
  (`pca_shuffle_v1`, default on) controls deck order; it is disabled under
  In order. Review grade buttons show on both hidden and revealed states.
  An empty subject selection means an empty deck — there is no implicit
  "study everything" fallback. Card re-renders run through `withCardAnchor()`
  (pca.js) so reveal/hide/next never jumps the page.
- **12-week study plan (By-week selector):** the "Choose subjects" modal has a
  **By subject / By week** toggle (`#groupBySubjectBtn`/`#groupByWeekBtn`,
  `state.selectorGroupBy`, persisted `pca_selector_group_v1`). In *By week* mode
  `renderSelector()` renders one collapsible group per week (driven by
  `js/data/week_plan.js` → `window.PCA_WEEKS`, the Chapell/Meek "Schedule of
  Assignments"): the collapsed row is a Duff-style session card (a "Week N" tag,
  the week's theme, and a books subtitle); a **Select all** toggles the whole
  week; expanding shows each sub-deck as a topic link (tagged with its subject)
  plus the week's non-deck assignments (catechism #s, hot topic, book
  outlines/contents) in a "week-assign" caption. Both views share `groupHtml()`
  / `deckRowHtml()`. When adding a subject/sub-deck, consider whether it belongs
  in a week's `sets`. BCO sub-decks are assigned to weeks in canonical order.
- **Subjects (9):** Bible Content, **Bible Book Summaries** (66 per-book
  overviews — author/date/theme/outline/Christ — in 8 division sub-decks
  `bk-*`, backing the schedule's Book Outlines / Book Contents drills),
  Theology (incl. `th-k` Holy Spirit & apologetics + `theo-wcf`), Sacraments,
  Church History, BCO (14 sub-decks), Hot Topics (each card cites the relevant
  PCA GA action), **Doctrines & Proofs** (TULIP/ordo/gospel with proof texts),
  and **Personal Religion & Call** (office qualifications + a flagged
  self-examination card). The Bible Book Summaries subject is built by
  `dev/build_bible_books.mjs` from `dev/data/bible_books/*.json` (one file per
  division); the generated `js/data/subjects/bible_books.js` is the working
  source of truth.
- **Answer rendering:** answers are Markdown (`js/utils/markdown.js`,
  escape-first; lists, GFM tables, blockquotes, inline emphasis) and are
  provenance-tagged by `renderAnswer()` (`answer.js`): a line starting
  `WSC:`/`WLC:`/`WCF:`/`WSA:` renders as a labeled standard-quotation
  callout, `BCO:` as "Book of Church Order (quoted wording)" (only very
  short BCO wording cues — see the copyright rule below), `Note:` as a
  study-note callout. Reference chips deep-link to official texts
  (`refLink()` in `refs.js`): BCO → the right pcaac.org part page +
  `#chapter_N` anchor, Scripture → esv.org (`scriptureLink()` normalizes the
  book to its full ESV name). Inline Scripture references inside answer/teaser
  prose are also auto-linked to esv.org by `linkifyScripture()` (`refs.js`),
  applied via the renderer's `opts.linkify` hook (`renderAnswer` passes it) —
  so a citation is tappable wherever it appears, not just in the chip row.
  Review's reveal: short table-free answers
  (≤480 chars) render in full (`directAnswer()`); longer cards show a
  teaser — the authored `card.summary` when present, else derived
  (`summarize()`: skips table rows, renders Scripture-topic cards as a
  bullet list of their passage references, appends "(+N more)" rather than
  truncating — a teaser must never end mid-thought; `validate.mjs` enforces
  this).
  3+-column Markdown tables are emitted with `class="md-stack"` + per-cell
  `data-th` and stack into labeled row-blocks under 640px (`css/pca.css`).
- **Semicolon walls:** multi-part answers chained with semicolons must render
  as lists, not glued paragraphs (`SEMICOLON_CHAIN` class in `dev/audit.mjs`;
  church-history glossary cards are bulletized structurally by
  `bulletize_def()` in their builder). Verbatim standard quotations and
  bio-card "epithet—dates; role" intro lines legitimately keep semicolons.
- **Copyright:** never embed copyrighted text — the BCO (paraphrase only;
  link to pcaac.org) and the R. S. Clark covenant-theology essay that was in
  the church-history source. Multi-word BCO quotations beyond short wording
  cues are not allowed even inside `BCO:` callouts.
- **Content contract:** `js/data/subjects/<id>.js` files register into the
  global `window.PCA_DATA` contract (see PROJECT_PLAN §4). Add a subject by
  dropping a data file there, a `<script defer>` tag in `index.html`, and a
  PRECACHE entry in `sw.js`. The BCO subject spans three files: `bco.js`
  (2007 Q&A deck, orders 1–4), `bco_governance.js` (orders 5–6), and
  `bco_comprehensive.js` (2025 quoted/labeled bundle, 165 cards in 8
  sub-decks, orders 7–14); later files merge `setKeys` into the existing
  subject, so load order in `index.html` matters (`bco.js` first).
- **Standards data (public domain):** `js/data/catechisms.js`
  (`window.PCA_CATECHISMS`, WSC 107 + WLC 196 with proof citations),
  `js/data/wcf.js` (`window.PCA_WCF`, build-time artifact, not loaded by the
  app), `js/data/subjects/theology_wcf.js` (a theology sub-deck quoting WCF
  chapters not otherwise cited). Their builders need the Westminster PDFs
  restored from git history to re-run.
- **SRS engine (reused, content-agnostic):** `js/domain/srs/{constants,
  scheduler,confidence}.js`. Outcomes `again`/`pass`/`easy` =
  Hard/Uncertain/Easy. Do not edit lightly.
- **Subject selector:** sub-decks render as one collapsible
  `<details class="subdeck-group">` per subject (summary shows a selected
  count); open/closed state lives in `openSubdeckGroups` (`pca.js`) so it
  survives the re-render on every tile click. The modal scrolls as one unit —
  don't reintroduce a nested scrollbox.
- **Serve locally:** `python3 -m http.server 8137` then open `/`.

## Maintenance rules

- Keep `PROJECT_PLAN.md` **Status** and **Next steps** current as phases land.
- **Release ritual:** asset URLs in `index.html` carry a `?v=N` cache-bust
  param. On every release bump the `?v=N` in `index.html` **and** `CACHE` in
  `sw.js` together. The new worker then *waits*; the page shows an "Update
  available" banner and only reloads when the user taps "Refresh now" (or
  cold-starts) — never automatically (that froze iOS PWAs). See
  `registerServiceWorker()` in `pca.js`. Verify with `node dev/check_sw.mjs`
  (precache completeness + `?v=N`/CACHE agreement).
- When adding/removing a subject data file, update the `<script defer>` tags
  in `index.html` **and** the `sw.js` PRECACHE, then re-run
  `node dev/validate.mjs` and `node dev/audit.mjs`.
- Content edits go directly into `js/data/**` (small fixes) or through a
  builder's `CURATE` layer with history-restored inputs (bulk work) — see
  "How to update content" at the top.
