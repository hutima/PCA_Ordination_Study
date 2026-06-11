// Content validator for PCA study data. Loads every subject data file, checks
// card shape, and renders each answer through the Markdown module to catch
// malformed content. Run: node dev/validate.mjs
import { readdirSync } from 'node:fs';
import { renderMarkdown } from '../js/utils/markdown.js';
import { summarize } from '../js/app/answer.js';

// ── MCQ fairness: the correct option must not give itself away by length ──
// Flags a question when the correct choice is the unique longest (or shortest)
// AND is a clear outlier vs the other choices, by both ratio and absolute gap.
// Length-balanced choices are the goal so a guesser can't pick by shape alone.
function medianLen(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function choiceGiveaway(choices, answerIndex) {
  if (!Array.isArray(choices) || choices.length < 3) return null;
  const lens = choices.map(c => String(c).length);
  const correct = lens[answerIndex];
  const others = lens.filter((_, i) => i !== answerIndex);
  const med = medianLen(others);
  const maxOther = Math.max(...others);
  const minOther = Math.min(...others);
  const uniqueMax = correct === Math.max(...lens) && lens.filter(l => l === correct).length === 1;
  const uniqueMin = correct === Math.min(...lens) && lens.filter(l => l === correct).length === 1;
  if (uniqueMax && correct > med * 1.6 && correct - maxOther >= 12) {
    return `correct option is the longest by a wide margin (${correct} vs others ≤${maxOther}, median ${med})`;
  }
  if (uniqueMin && correct < med * 0.6 && minOther - correct >= 8) {
    return `correct option is the shortest by a wide margin (${correct} vs others ≥${minOther}, median ${med})`;
  }
  return null;
}

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
      if (c.summary != null && (typeof c.summary !== 'string' || !c.summary.trim())) { console.error(`FAIL ${c.id}: summary must be a non-empty string`); problems++; }
      // The review-card teaser (authored or derived) must never show raw table
      // markup or trail off mid-thought — fix the card or author a summary.
      const teaser = summarize(c);
      if (teaser.includes('|')) { console.error(`FAIL ${c.id}: teaser contains raw table markup`); problems++; }
      if (/…\s*$/.test(teaser)) { console.error(`FAIL ${c.id}: teaser ends mid-thought (…)`); problems++; }
      if (c.quiz) {
        if (!Array.isArray(c.quiz.choices) || c.quiz.choices.length < 2) { console.error(`FAIL ${c.id}: quiz needs >=2 choices`); problems++; }
        if (typeof c.quiz.answerIndex !== 'number' || c.quiz.answerIndex < 0 || c.quiz.answerIndex >= (c.quiz.choices?.length || 0)) { console.error(`FAIL ${c.id}: bad quiz answerIndex`); problems++; }
        const g = choiceGiveaway(c.quiz.choices, c.quiz.answerIndex);
        if (g) { console.error(`FAIL ${c.id}: ${g}`); problems++; }
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
  const g = choiceGiveaway(q.choices, q.answerIndex);
  if (g) { console.error(`FAIL ${q.id}: ${g}`); quizProblems++; }
}
console.log('\nQuiz bank:');
for (const id of [...subjectIds]) if (bySubject[id]) console.log(`  ${id.padEnd(14)} ${String(bySubject[id]).padStart(3)} questions`);
console.log(`${bank.length} authored quiz questions, ${quizProblems} problem(s)`);

// ── Catechisms (window.PCA_CATECHISMS) ─────────────────────────────────
let catProblems = 0;
try {
  await import(new URL('../js/data/catechisms.js', import.meta.url));
  const cats = globalThis.PCA_CATECHISMS || {};
  const expected = { wsc: 107, wlc: 196 };
  for (const [id, n] of Object.entries(expected)) {
    const c = cats[id];
    if (!c) { console.error(`FAIL catechisms: missing ${id}`); catProblems++; continue; }
    if (c.items.length !== n) { console.error(`FAIL ${id}: expected ${n} questions, got ${c.items.length}`); catProblems++; }
    c.items.forEach((it, i) => {
      if (it.n !== i + 1) { console.error(`FAIL ${id}: numbering breaks at ${i + 1}`); catProblems++; }
      if (!it.q || !it.a) { console.error(`FAIL ${id} Q${it.n}: empty q/a`); catProblems++; }
      if (!Array.isArray(it.refs)) { console.error(`FAIL ${id} Q${it.n}: refs not an array`); catProblems++; }
    });
  }
  console.log(`\nCatechisms: WSC ${cats.wsc?.items.length ?? 0} + WLC ${cats.wlc?.items.length ?? 0} questions, ${catProblems} problem(s)`);
} catch (e) {
  console.log('\nCatechisms: data file not present (js/data/catechisms.js)');
}

process.exit(problems + quizProblems + catProblems ? 1 : 0);
