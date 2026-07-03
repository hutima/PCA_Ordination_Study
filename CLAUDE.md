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
  overlay), `gamification.js` (XP→level ladder, current/longest streaks, badges).
  Styling: `styles.css` (base tokens) + `css/pca.css`. Progress
  persists to `localStorage['pca_progress_v1']`, selection to
  `['pca_selection_v1']`, daily-activity log to `['pca_activity_v1']`, XP to
  `['pca_xp_v1']`.
- **Spaced deck ordering (three sections, ported from Duff's `buildStudyDeck`):**
  `buildDeck()` in `pca.js` builds `[active, middle, deferred]`. *active* =
  due-now cards in the in-flight rotation, order preserved across rebuilds via
  `state.spacedActiveIds`; *middle* = cards that fall due mid-session; *deferred*
  = not-yet-due (shuffled when Shuffle is on, else soonest-due first). A fresh
  start (`opts.forceShuffle`, a ≥5h idle gap, or no carry-over) reshuffles all due
  into active; user-initiated rebuilds pass `forceShuffle`, the end-of-pass
  rebuild in `advance()` resumes (preserves order). `avoidHeadCollision` +
  `state.lastSeenId` keep the just-graded card off the next head; a 30-min
  near-due backstop avoids a dead deck. `advance()` rebuilds when the due set is
  exhausted. A one-time `pca_shuffle_migrated_v1` migration forces Shuffle on once.
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
  callout instead of the confessional one. The reader is **self-gradable** —
  Hard/Uncertain/Easy (or 1/2/3) feed `applyCatechismOutcome` (`srs.js`) into a
  separate `cat:<cat>:<n>` progress namespace, independent of the global spaced
  toggle and of the subject decks; the deck-meta shows an `n/total confirmed`
  count and the Progress overlay a "Catechism mastery" section. The mode's
  fourth category is **Psalms** (`js/data/psalms_kjv.js` — KJV, public domain —
  generated by `dev/build_psalms.mjs` from `dev/data/psalms/*.json`): a
  devotional reader, not a flip card — a collapsible summary block (summary +
  practical `apply` bullets), then per-verse reveal/hide button rows with
  Reveal/Hide-all, rendered by `js/app/psalms.js` via the
  `cat.kind === 'psalms'` branch in `modes.js`. Grading marks the whole psalm
  (`cat:psalms:<n>`). An optional ESV view fetches one psalm at a time with the
  user's own ESV API token — **never bundle or commit ESV text or a token**;
  KJV is the offline default. Keys: `pca_psalm_version_v1`, `pca_esv_token_v1`,
  `pca_esv_psalm_cache_v1`). A Due/Weak/In-order/Flip-deck
  focus toggle shapes the Review/Quiz deck (In order = unspaced read-through
  in book order; Flip deck = non-spaced, ported from Duff: Hard/Uncertain
  recycle to the back of the pile, Easy retires for the session — no SRS
  writes, only the activity log). **Advanced settings** (a `<details>` section)
  render as Duff-style rows — a `.toggle-switch` pill + short `.toggle-text`
  label + an injected `.toggle-info` (ⓘ) that opens a describe-modal
  (`#toggleInfoOverlay`, `installToggleInfo`/`showToggleInfo` in `pca.js`) with
  the toggle's full `title`, instead of inline description text — and
  hold three On/Off toggles ported from Duff: a persisted **Shuffle**
  (`pca_shuffle_v1`, default on, disabled under In order) controlling deck order;
  a **Spaced repetition** master switch (`state.spacedOn`/`pca_spaced_v1`,
  default on) — off = *unspaced*: `buildDeck` ignores the SRS schedule, Review
  retires graded cards for the day (`unspacedMark`: Hard recycles, Uncertain/Easy
  retire to the day-stamped `pca_unspaced_v1` pile) and `applyOutcome` logs the
  rep to the activity heatmap only (no SRS writes); and **Unspaced daily reset**
  (`pca_unspaced_reset_v1`, default on, disabled while spaced is on) which clears
  a stale day-stamped pile on load so the selection re-presents each new day. The
  SRS engine uses Duff's *intensive* 2-month cadence (14-day cap) only — the
  8-month relaxed preset/toggle is deliberately not imported. Review grade buttons
  show on both hidden and revealed states.
  An empty subject selection means an empty deck — there is no implicit
  "study everything" fallback. Card re-renders run through `withCardAnchor()`
  (pca.js) so reveal/hide/next never jumps the page.
- **12-week study plan (By-week selector):** the "Choose subjects" modal has a
  **By subject / By week** toggle (`#groupBySubjectBtn`/`#groupByWeekBtn`,
  `state.selectorGroupBy`, persisted `pca_selector_group_v1`). **By week is the
  default** (`loadSelectorGroup()` returns `'week'` unless `'subject'` was
  explicitly saved). In *By week* mode `renderSelector()` renders one collapsible
  per week (driven by `js/data/week_plan.js` → `window.PCA_WEEKS`, the
  Chapell/Meek "Schedule of Assignments"): the collapsed row is a Duff-style
  session card (a "Week N" tag, theme, and books subtitle). Expanding a week
  shows a **second level of collapsibles — one per syllabus column** in the
  printed order (`WEEK_COLUMNS` in `pca.js`): Book Outlines, Book Contents, Bible
  Content, Doctrines & Proofs, Theology, Catechism, History, BCO, Hot Topic.
  Book Outlines/Contents list **individual books** (each Bible book is its own
  set — see below); the other columns list selectable decks. **Every column is a
  set of decks** — Catechism points at the per-week Westminster Shorter Catechism
  sub-deck (`wsc-wk<N>`) and Hot Topic at the week's one or two per-topic Hot
  Topics decks (`ht-<slug>`). An empty column is hidden. A week's per-category and
  per-week **Select all** toggles every deck/book it governs. The week_plan schema
  is category-shaped (`outlines`/`contents`/`bible`/`doctrines`/`theology`/
  `catechism`/`history`/`bco`/`hotTopic`/`personal`/`focus`, each `{ sub?, sets|books }`);
  BCO follows the syllabus's
  Preface/A–J chapter blocks. Decks the syllabus spreads over two weeks (NT Key
  Passages, NT Key Topics, Church History Key People) are listed in both weeks
  (selection de-dupes). `renderSelector()`/`groupHtml()` are now **recursive**
  (a group holds nested sub-groups and/or rows); `groupLeafKeys()` gathers a
  group's keys for its Select-all (a single `[data-keys]` handler).
- **Subjects (10):** Bible Content, **Bible Book Summaries** (66 books / 229
  cards — **one selectable set per book**, `bk-<slug>`: a per-book overview
  — author/date/theme/outline/Christ, with a TGC commentary link — plus
  chapter-range "Book Contents" cards for every book of 5+ chapters, backing the
  schedule's per-book Book Outlines / Book Contents drills; the 66 sets are
  presented under one subject, grouped for display into eight division groups
  via `subject.groups`),
  Theology (incl. `th-k` Holy Spirit & apologetics + `theo-wcf`), Sacraments,
  Church History, BCO (14 sub-decks; `subject.groups` orders them by chapter
  block for the By-subject view, while week_plan groups the same keys by the
  syllabus's A–J blocks),
  **Westminster Shorter Catechism** (`shorter_catechism`, 56 cards — the WSC
  questions the plan assigns, WSC 1–39 & 82–98, as flashcards grouped into
  per-week sub-decks `wsc-wk<N>`; built by `dev/build_catechism_wsc.mjs` from
  `js/data/catechisms.js`. The full WSC+WLC text still lives in the Catechisms
  study mode),
  Hot Topics (53 cards in **one selectable deck per topic** — the parent
  overview + a card per named view + the PCA / confessional position; grouped via
  `subject.groups` into syllabus topics and the post-1993 Ad Interim Committee
  topics the Chapell/Meek guide predates: women in church office, Christian
  nationalism, racism/racial reconciliation, human sexuality, domestic abuse,
  the Federal Vision, and Insider Movements. A week links its one or two hot-topic
  decks via `hotTopic.sets`),
  **Doctrines & Proofs** (TULIP/ordo/gospel with proof texts),
  and **Personal Religion & Call** (office qualifications + a flagged
  self-examination card). The Bible Book Summaries subject is built by
  `dev/build_bible_books.mjs` from `dev/data/bible_books/*.json` (overviews),
  `*.sections.json` (chapter ranges), and `outline_links.json` (per-book TGC
  links), emitting one set per book; the generated
  `js/data/subjects/bible_books.js` is the working source of truth.
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
  Hard/Uncertain/Easy. Do not edit lightly. `confidence.js` also holds
  `computeCardXpAward`; `applyOutcome` (`srs.js`) stamps `firstConfirmedAt`
  (rolling confidence ≥70%) and accrues XP into `pca_xp_v1` — feeding the
  level/streak/badge gamification in `js/app/gamification.js` + the Progress
  overlay.
- **Subject selector:** sub-decks render as one collapsible
  `<details class="subdeck-group">` per subject (summary shows a selected
  count); subjects that define `subject.groups` (Bible Book Summaries by
  division, BCO by chapter block) render a **second level** of
  `<details class="subdeck-subgroup">` inside, nesting their rows. Open/closed
  state lives in `openSubdeckGroups` (`pca.js`), keyed by each group's
  `data-group`, so it survives the re-render on every tile click. The modal
  scrolls as one unit — don't reintroduce a nested scrollbox. The "Choose what
  to study" header carries a **Clear** + Done pair (`#selectorClearTopBtn`,
  `#selectorDoneTopBtn`) mirroring the Select all / Clear / Done row at the
  bottom.
- **Serve locally:** `python3 -m http.server 8137` then open `/`.

## Maintenance rules

- Keep `PROJECT_PLAN.md` **Status** and **Next steps** current as phases land.
- **Release ritual:** asset URLs in `index.html` carry a `?v=N` cache-bust
  param. On every release bump the `?v=N` in `index.html` **and** `CACHE` in
  `sw.js` together. The new worker then *waits*; the page shows a blocking
  "Update available" modal (`#refreshAvailableOverlay`, reusing the shared
  `.consent-overlay`/`.consent-modal` styles) and only reloads when the user
  taps "Refresh now" (or cold-starts) — never automatically (that froze iOS
  PWAs). See `registerServiceWorker()` in `pca.js`. Verify with `node dev/check_sw.mjs`
  (precache completeness + `?v=N`/CACHE agreement).
- When adding/removing a subject data file, update the `<script defer>` tags
  in `index.html` **and** the `sw.js` PRECACHE, then re-run
  `node dev/validate.mjs` and `node dev/audit.mjs`.
- Content edits go directly into `js/data/**` (small fixes) or through a
  builder's `CURATE` layer with history-restored inputs (bulk work) — see
  "How to update content" at the top.
