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

// ── True/False bank (window.PCA_QUIZ_TF — Mock exam BCO section) ───────
// Statements must be paraphrase (the BCO is copyrighted): flag anything that
// looks like a long verbatim quotation (quotation marks around 8+ words).
const tfBank = globalThis.PCA_QUIZ_TF || [];
let tfProblems = 0;
for (const t of tfBank) {
  if (!t.id || seenIds.has(t.id)) { console.error(`FAIL tf: missing/duplicate id ${t.id}`); tfProblems++; }
  seenIds.add(t.id);
  if (!t.q || !t.q.trim()) { console.error(`FAIL ${t.id}: empty statement`); tfProblems++; }
  if (typeof t.answer !== 'boolean') { console.error(`FAIL ${t.id}: answer must be boolean`); tfProblems++; }
  const quoted = /["“”']([^"“”']{40,})["“”']/.exec(t.q || '');
  if (quoted && quoted[1].split(/\s+/).length >= 8) { console.error(`FAIL ${t.id}: long quotation — BCO must be paraphrased`); tfProblems++; }
}
console.log(`${tfBank.length} authored True/False questions, ${tfProblems} problem(s)`);

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

// ── Psalms (the KJV reader category in the Catechisms mode) ────────────
// KJV only may be bundled (public domain). ESV text must never be committed
// (it is fetched at runtime through the user's own API token), and no
// token-like secret may appear in the app source.
let psalmProblems = 0;
try {
  await import(new URL('../js/data/psalms_kjv.js', import.meta.url));
  const p = (globalThis.PCA_CATECHISMS || {}).psalms;
  if (!p) { console.error('FAIL psalms: category not registered'); psalmProblems++; }
  else {
    if (p.kind !== 'psalms') { console.error('FAIL psalms: kind must be "psalms"'); psalmProblems++; }
    if (p.items.length !== 150) { console.error(`FAIL psalms: expected 150, got ${p.items.length}`); psalmProblems++; }
    let verses = 0;
    p.items.forEach((it, i) => {
      if (it.n !== i + 1) { console.error(`FAIL psalms: numbering breaks at ${i + 1}`); psalmProblems++; }
      if (!it.summary || !String(it.summary).trim()) { console.error(`FAIL Psalm ${it.n}: missing summary`); psalmProblems++; }
      if (!Array.isArray(it.apply) || !it.apply.length || it.apply.some(b => !b || !String(b).trim())) { console.error(`FAIL Psalm ${it.n}: missing application bullets`); psalmProblems++; }
      if (!Array.isArray(it.verses) || !it.verses.length) { console.error(`FAIL Psalm ${it.n}: no verses`); psalmProblems++; return; }
      it.verses.forEach((v, j) => {
        if (v.num !== j + 1) { console.error(`FAIL Psalm ${it.n}: verse numbering breaks at ${j + 1}`); psalmProblems++; }
        if (!v.text || !v.text.trim()) { console.error(`FAIL Psalm ${it.n}:${v.num}: empty verse`); psalmProblems++; }
      });
      verses += it.verses.length;
    });
    if (p.items.length === 150 && verses !== 2461) { console.error(`FAIL psalms: expected 2461 KJV verses, got ${verses}`); psalmProblems++; }
    console.log(`\nPsalms: ${p.items.length} psalms, ${verses} KJV verses, ${psalmProblems} problem(s)`);
  }
  // No bundled ESV / no committed token: the psalm modules must not contain a
  // token-like literal, and the only api.esv.org reference is the runtime URL.
  const { readFileSync } = await import('node:fs');
  for (const f of ['../js/data/psalms_kjv.js', '../js/app/psalms.js']) {
    let src = '';
    try { src = readFileSync(new URL(f, import.meta.url), 'utf8'); } catch (e) { continue; }
    if (/['"`][a-f0-9]{32,}['"`]/i.test(src)) { console.error(`FAIL ${f}: token-like hex literal committed`); psalmProblems++; }
    if (/Authorization:\s*['"`]Token\s+[A-Za-z0-9]/.test(src)) { console.error(`FAIL ${f}: hard-coded Authorization token`); psalmProblems++; }
  }
} catch (e) {
  console.log('\nPsalms: data file not present (js/data/psalms_kjv.js)');
}

process.exit(problems + quizProblems + tfProblems + catProblems + psalmProblems ? 1 : 0);
