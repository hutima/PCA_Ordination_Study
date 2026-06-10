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

// ── Quiz bank (window.PCA_QUIZ) ────────────────────────────────────────
const QUIZ_DIR = new URL('../js/data/quiz/', import.meta.url);
let quizFiles = [];
try { quizFiles = readdirSync(QUIZ_DIR).filter(f => f.endsWith('.js')); } catch (e) {}
for (const f of quizFiles) await import(new URL(f, QUIZ_DIR));

const bank = globalThis.PCA_QUIZ || [];
const subjectIds = new Set(data.subjects.map(s => s.id));
let quizProblems = 0;
const bySubject = {};
for (const q of bank) {
  bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
  if (!q.id || seenIds.has(q.id)) { console.error(`FAIL quiz: missing/duplicate id ${q.id}`); quizProblems++; }
  seenIds.add(q.id);
  if (!subjectIds.has(q.subject)) { console.error(`FAIL ${q.id}: unknown subject ${q.subject}`); quizProblems++; }
  if (!q.q || !q.q.trim()) { console.error(`FAIL ${q.id}: empty question`); quizProblems++; }
  if (!Array.isArray(q.choices) || q.choices.length < 2) { console.error(`FAIL ${q.id}: needs >=2 choices`); quizProblems++; }
  if (new Set(q.choices).size !== q.choices.length) { console.error(`FAIL ${q.id}: duplicate choices`); quizProblems++; }
  if (typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex >= (q.choices?.length || 0)) { console.error(`FAIL ${q.id}: bad answerIndex`); quizProblems++; }
}
console.log('\nQuiz bank:');
for (const id of [...subjectIds]) if (bySubject[id]) console.log(`  ${id.padEnd(14)} ${String(bySubject[id]).padStart(3)} questions`);
console.log(`${bank.length} authored quiz questions, ${quizProblems} problem(s)`);

process.exit(problems + quizProblems ? 1 : 0);
