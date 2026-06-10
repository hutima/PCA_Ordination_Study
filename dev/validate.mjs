// Content validator for PCA study data. Loads every subject data file, checks
// card shape, and renders each answer through the Markdown module to catch
// malformed content. Run: node dev/validate.mjs
import { readdirSync } from 'node:fs';
import { renderMarkdown } from '../js/utils/markdown.js';

const SUBJECT_DIR = new URL('../js/data/subjects/', import.meta.url);
const files = readdirSync(SUBJECT_DIR).filter(f => f.endsWith('.js'));

for (const f of files) {
  await import(new URL(f, SUBJECT_DIR));
}

const data = globalThis.PCA_DATA;
if (!data) {
  console.error('FAIL: no PCA_DATA registered');
  process.exit(1);
}

let cardCount = 0;
let problems = 0;
const seenIds = new Set();

for (const subject of data.subjects) {
  let subjectCards = 0;
  for (const key of subject.setKeys) {
    const set = data.sets[key];
    if (!set) { console.error(`FAIL ${subject.id}: missing set ${key}`); problems++; continue; }
    for (const c of set.cards) {
      cardCount++; subjectCards++;
      if (!c.id) { console.error(`FAIL ${key}: card with no id`); problems++; }
      if (seenIds.has(c.id)) { console.error(`FAIL: duplicate id ${c.id}`); problems++; }
      seenIds.add(c.id);
      if (!c.q || !c.q.trim()) { console.error(`FAIL ${c.id}: empty question`); problems++; }
      if (!c.a || !c.a.trim()) { console.error(`FAIL ${c.id}: empty answer`); problems++; }
      try { renderMarkdown(c.a); } catch (e) { console.error(`FAIL ${c.id}: render error ${e.message}`); problems++; }
      if (c.quiz) {
        if (!Array.isArray(c.quiz.choices) || c.quiz.choices.length < 2) { console.error(`FAIL ${c.id}: quiz needs >=2 choices`); problems++; }
        if (typeof c.quiz.answerIndex !== 'number' || c.quiz.answerIndex < 0 || c.quiz.answerIndex >= (c.quiz.choices?.length || 0)) { console.error(`FAIL ${c.id}: bad quiz answerIndex`); problems++; }
      }
    }
  }
  console.log(`  ${subject.id.padEnd(14)} ${String(subjectCards).padStart(4)} cards  (${subject.setKeys.length} sets)`);
}

console.log(`\n${cardCount} cards across ${data.subjects.length} subjects, ${problems} problem(s)`);
process.exit(problems ? 1 : 0);
