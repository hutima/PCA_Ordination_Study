// Builds js/data/subjects/bible_books.js — the "Bible Book Summaries" subject.
//
// Each book is its own selectable set (key "bk-<slug>") so the 12-week
// "By week" selector can assign individual books to the week they are read
// (the syllabus's "Book Outlines / Book Contents" columns are per-book). Each
// book set holds a per-book OVERVIEW card (author, date, theme, outline, Christ
// & significance) followed, for books of 5+ chapters, by chapter-range "Book
// Contents" cards that walk through the book in sections.
//
// The 66 book sets are presented under a single "Bible Book Summaries" subject,
// grouped for display into eight division groups (subject.groups) — Pentateuch,
// OT History, … — so the "By subject" selector nests books under their
// division rather than listing 66 flat rows.
//
// Inputs (dev/data/bible_books/, one pair per division):
//   <n>-<division>.json           — overview cards (id "bk-<slug>")
//   <n>-<division>.sections.json  — chapter-range cards (id "bk-<slug>-<a>-<b>")
//   outline_links.json (optional) — { "bk-<slug>": "https://…" } external
//                                   per-book outline/summary links, appended to
//                                   each overview card as a "Note:" callout.
//
// Re-run: node dev/build_bible_books.mjs
// The generated .js is the working source of truth; edit the JSON inputs (or
// the generated file for small fixes) and re-run, then run the quality gates:
//   node dev/validate.mjs  &&  node dev/audit.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = new URL('./data/bible_books/', import.meta.url);

// Division display groups (subject.groups). Books inside each come from the
// matching input file, in canonical (file) order.
const DIVISIONS = [
  { id: 'bkgrp-pentateuch', label: 'Pentateuch (Genesis–Deuteronomy)',                 file: '1-pentateuch' },
  { id: 'bkgrp-ot-history', label: 'OT History (Joshua–Esther)',                        file: '2-ot-history' },
  { id: 'bkgrp-ot-poetry',  label: 'OT Poetry & Wisdom (Job–Song of Songs)',            file: '3-ot-poetry' },
  { id: 'bkgrp-ot-major',   label: 'Major Prophets (Isaiah–Daniel)',                    file: '4-major-prophets' },
  { id: 'bkgrp-ot-minor',   label: 'Minor Prophets (Hosea–Malachi)',                    file: '5-minor-prophets' },
  { id: 'bkgrp-gospels',    label: 'Gospels & Acts (Matthew–Acts)',                     file: '6-gospels-acts' },
  { id: 'bkgrp-paul',       label: 'Pauline Epistles (Romans–Philemon)',                file: '7-paul' },
  { id: 'bkgrp-general',    label: 'General Epistles & Revelation (Hebrews–Revelation)', file: '8-general' },
];

const SUBJECT = {
  id: 'bible_books',
  label: 'Bible Book Summaries',
  blurb: "Per-book overviews plus chapter-range drills — author, date, theme, outline, and book contents — for the syllabus's weekly Book Outlines and Book Contents work.",
  order: 1.5,
  setKeys: [],   // filled below, in canonical book order
  groups: [],    // [{ id, label, keys: [bk-…] }] — division groups for nested display
};

function readJson(name, fallback) {
  try { return JSON.parse(readFileSync(new URL(name, SRC), 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return fallback; throw e; }
}

// "bk-1-samuel" -> "1 Samuel", "bk-song-of-songs" -> "Song of Songs".
function bookLabel(slug) {
  return slug.replace(/^bk-/, '').split('-')
    .map(p => p === 'of' ? 'of' : (/^\d+$/.test(p) ? p : p[0].toUpperCase() + p.slice(1)))
    .join(' ');
}

// Optional external outline/summary links, appended to overview cards.
const LINKS = readJson('outline_links.json', {});

// Sort a book's chapter-range section cards in ascending start-chapter order.
function sortSections(overviewId, sections) {
  const startCh = (sec) => parseInt(sec.id.slice(overviewId.length + 1), 10) || 0;
  return sections.slice().sort((a, b) => startCh(a) - startCh(b));
}

const SETS = {};
let order = 9;            // continues after Bible Content's eight sub-decks (1–8)
let nOverview = 0, nSection = 0, nLinks = 0;

for (const d of DIVISIONS) {
  const overviews = readJson(`${d.file}.json`, []);
  const sections = readJson(`${d.file}.sections.json`, []);
  // Assign each section to the overview with the longest matching "id-" prefix.
  const byOverview = new Map(overviews.map(o => [o.id, []]));
  for (const sec of sections) {
    let best = null;
    for (const o of overviews) {
      if (sec.id.startsWith(o.id + '-') && (!best || o.id.length > best.id.length)) best = o;
    }
    if (!best) throw new Error(`section ${sec.id} matches no overview`);
    byOverview.get(best.id).push(sec);
  }
  const keys = [];
  for (const o of overviews) {
    const card = { ...o };
    if (LINKS[o.id]) {
      card.a = `${card.a}\n\nNote: For a fuller outline and summary, see [${bookLabel(o.id)} — book overview](${LINKS[o.id]}).`;
      nLinks++;
    }
    const cards = [card, ...sortSections(o.id, byOverview.get(o.id))];
    SETS[o.id] = { label: bookLabel(o.id), subject: SUBJECT.id, order: order++, cards };
    keys.push(o.id);
    nOverview++;
    nSection += cards.length - 1;
  }
  SUBJECT.groups.push({ id: d.id, label: d.label, keys });
  SUBJECT.setKeys.push(...keys);
}

const banner = `// PCA Ordination & Licensure Study — Bible Book Summaries
// Generated by dev/build_bible_books.mjs. One selectable set per book
// (bk-<slug>): a per-book overview card (author, date, theme, outline, Christ &
// significance) followed by chapter-range "Book Contents" cards for books of 5+
// chapters. The 66 book sets are grouped for display into eight division groups
// (subject.groups) and back the 12-week schedule's per-book "Book Outlines /
// Book Contents" reading drills (see js/data/week_plan.js).
`;

const body = `(function (global) {
  const SETS = ${JSON.stringify(SETS, null, 2)};

  const SUBJECT = ${JSON.stringify(SUBJECT, null, 2)};

  const data = (global.PCA_DATA = global.PCA_DATA || { subjects: [], sets: {} });
  Object.assign(data.sets, SETS);
  if (!data.subjects.some(s => s.id === SUBJECT.id)) data.subjects.push(SUBJECT);
})(typeof window !== 'undefined' ? window : globalThis);
`;

const OUT = new URL('../js/data/subjects/bible_books.js', import.meta.url);
writeFileSync(OUT, banner + '\n' + body);
console.log(`Wrote ${nOverview} books (${nOverview} overview + ${nSection} section = ${nOverview + nSection} cards) across ${DIVISIONS.length} division groups; ${nLinks} outline links`);
