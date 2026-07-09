// MCQ-coverage worklist: prints every card that has NO possible MCQ (no
// inline quiz block, no PCA_CARD_QUIZ overlay entry, and not auto-generatable
// from short-answer siblings), grouped by subject.
//
//   node dev/mcq_coverage.mjs              — per-subject counts
//   node dev/mcq_coverage.mjs <subjectId>  — that subject's uncovered cards
//                                            (id · set · question · short answer/summary cue)
//
// Used by the quiz_cards/* authoring workflow; the same rule gates
// dev/validate.mjs, which fails while any card is uncovered.
import { readdirSync } from 'node:fs';

const SUBJECT_DIR = new URL('../js/data/subjects/', import.meta.url);
for (const f of readdirSync(SUBJECT_DIR).filter(f => f.endsWith('.js'))) {
  await import(new URL(f, SUBJECT_DIR));
}
const QUIZ_CARDS_DIR = new URL('../js/data/quiz_cards/', import.meta.url);
try {
  for (const f of readdirSync(QUIZ_CARDS_DIR).filter(f => f.endsWith('.js'))) {
    await import(new URL(f, QUIZ_CARDS_DIR));
  }
} catch (e) {}

const data = globalThis.PCA_DATA;
const overlay = globalThis.PCA_CARD_QUIZ || {};
const only = process.argv[2] || null;

function isShort(c) {
  const a = (c.a || '').trim();
  return !!a && !a.includes('\n') && a.length <= 80 && !a.includes('|') && !a.includes('**');
}

let total = 0;
for (const s of data.subjects) {
  const rows = [];
  for (const k of s.setKeys) {
    const set = data.sets[k];
    if (!set) continue;
    const shortSet = new Set(set.cards.filter(isShort).map(c => c.a.trim()));
    for (const c of set.cards) {
      const auto = isShort(c) && (shortSet.size - (shortSet.has(c.a.trim()) ? 1 : 0)) >= 3;
      if ((c.quiz && Array.isArray(c.quiz.choices)) || overlay[c.id] || auto) continue;
      rows.push({ id: c.id, set: k, q: c.q, cue: (c.summary || c.a || '').replace(/\s+/g, ' ').slice(0, 120) });
    }
  }
  total += rows.length;
  if (only && s.id !== only) continue;
  if (!rows.length) { if (only) console.log(`${s.id}: fully covered`); continue; }
  if (!only) { console.log(`${s.id}: ${rows.length} uncovered`); continue; }
  for (const r of rows) console.log(`${r.id}\t${r.set}\t${r.q}\t${r.cue}`);
}
if (!only) console.log(`TOTAL uncovered: ${total}`);
