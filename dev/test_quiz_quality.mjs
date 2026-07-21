// Structural quality tests for the quiz/exam question banks and the
// presentation-time answer-position shuffle. Pure node, no DOM — follows the
// style of dev/test_quiz_session.mjs. Run: node dev/test_quiz_quality.mjs
//
// These are STRUCTURAL checks only (shape, bounds, uniqueness, and the
// shuffle algorithm's correctness) — they must pass against today's content.
// Statistical bias gates (flagging real position-clustering in the authored
// banks, as dev/audit_quiz_quality.mjs reports on) are a separate, later
// concern and are deliberately not enforced here.
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { shuffledAuthored } from '../js/app/quiz.js';
import { ALLOWLIST } from './quiz_quality_allowlist.mjs';

let sections = 0;
function section(name, fn) {
  fn();
  sections++;
  console.log(`OK  ${name}`);
}

// ── loaders (same pattern as dev/audit_quiz_quality.mjs / dev/validate.mjs:
// each data file assigns/merges a window global, so we dynamic-import every
// file in the directory and read the resulting globals off globalThis) ─────
const QUIZ_DIR = new URL('../js/data/quiz/', import.meta.url);
const QUIZ_CARDS_DIR = new URL('../js/data/quiz_cards/', import.meta.url);

async function loadBank() {
  const files = readdirSync(QUIZ_DIR).filter(f => f.endsWith('.js') && f !== 'bco_tf.js').sort();
  for (const f of files) await import(new URL(f, QUIZ_DIR));
  return globalThis.PCA_QUIZ || [];
}
async function loadOverlay() {
  const files = readdirSync(QUIZ_CARDS_DIR).filter(f => f.endsWith('.js')).sort();
  for (const f of files) await import(new URL(f, QUIZ_CARDS_DIR));
  return Object.entries(globalThis.PCA_CARD_QUIZ || {}).map(([id, v]) => ({ id, ...v }));
}
async function loadTf() {
  await import(new URL('bco_tf.js', QUIZ_DIR));
  return globalThis.PCA_QUIZ_TF || [];
}

function normalizeChoice(s) {
  return String(s).toLowerCase().trim().replace(/[.!?,:;]+$/, '');
}

const bank = await loadBank();
const overlay = await loadOverlay();
const tf = await loadTf();

// ── all quiz data files load ────────────────────────────────────────────
section('all quiz data files load into their expected globals', () => {
  assert.ok(Array.isArray(bank) && bank.length > 0, 'PCA_QUIZ (bank) loaded with entries');
  assert.ok(Array.isArray(overlay) && overlay.length > 0, 'PCA_CARD_QUIZ (overlay) loaded with entries');
  assert.ok(Array.isArray(tf) && tf.length > 0, 'PCA_QUIZ_TF (bco_tf) loaded with entries');
});

// ── per-question shape: answerIndex bounds, choice shape, no duplicates ──
function checkEntries(label, entries) {
  let dupFound = [];
  for (const e of entries) {
    const tag = `${label} ${e.id}`;
    assert.ok(Array.isArray(e.choices) && e.choices.length >= 2, `${tag}: choices is an array of >=2`);
    for (const c of e.choices) {
      assert.equal(typeof c, 'string', `${tag}: choice is a string`);
      assert.ok(c.trim().length > 0, `${tag}: choice is non-empty`);
    }
    assert.equal(typeof e.answerIndex, 'number', `${tag}: answerIndex is a number`);
    assert.ok(Number.isInteger(e.answerIndex), `${tag}: answerIndex is an integer`);
    assert.ok(e.answerIndex >= 0 && e.answerIndex < e.choices.length, `${tag}: answerIndex within bounds`);

    const normalized = e.choices.map(normalizeChoice);
    if (new Set(normalized).size !== normalized.length) dupFound.push(e.id);
  }
  return dupFound;
}

section('bank (js/data/quiz/*.js): every MCQ has valid shape/bounds', () => {
  checkEntries('bank', bank);
});
section('overlay (js/data/quiz_cards/*.js): every MCQ has valid shape/bounds', () => {
  checkEntries('overlay', overlay);
});

// Duplicate normalized choices within a single question is a content smell
// (two options a learner can't tell apart), not a hard structural break —
// per the task, check first and report rather than fail if any exist. As of
// this writing there are none in either bank, so this asserts zero; if a
// future edit introduces one, this test will fail with the offending id(s)
// printed, which is the intended signal to go fix the content (or, if a
// legitimate near-duplicate is intentional, relax this assertion then).
section('no duplicate normalized choices within a question (bank + overlay)', () => {
  const bankDups = checkEntries('bank', bank);
  const overlayDups = checkEntries('overlay', overlay);
  assert.deepEqual(bankDups, [], `bank questions with duplicate choices: ${bankDups.join(', ')}`);
  assert.deepEqual(overlayDups, [], `overlay questions with duplicate choices: ${overlayDups.join(', ')}`);
});

// ── bco_tf: unique ids, boolean answers ─────────────────────────────────
section('bco_tf: ids unique, answer is boolean', () => {
  const ids = tf.map(t => t.id);
  assert.equal(new Set(ids).size, ids.length, 'no duplicate bco_tf ids');
  for (const t of tf) {
    assert.equal(typeof t.answer, 'boolean', `${t.id}: answer is boolean`);
    assert.ok(t.id != null && String(t.id).length > 0, 'id present');
  }
});

// ── shuffledAuthored: the presentation-time shuffle helper ──────────────
const ITER = 4000;

section('shuffledAuthored: correctIndex always points at the correct choice text', () => {
  const choices = ['alpha', 'bravo', 'charlie', 'delta'];
  const answerIndex = 2; // 'charlie'
  for (let i = 0; i < ITER; i++) {
    const { choices: out, correctIndex } = shuffledAuthored(choices, answerIndex);
    assert.equal(out[correctIndex], 'charlie', 'correctIndex resolves to the correct text after shuffle');
  }
});

section('shuffledAuthored: preserves the choice multiset (nothing added/dropped/changed)', () => {
  const choices = ['alpha', 'bravo', 'charlie', 'delta'];
  const sortedOriginal = choices.slice().sort();
  for (let i = 0; i < 200; i++) {
    const { choices: out } = shuffledAuthored(choices, 1);
    assert.deepEqual(out.slice().sort(), sortedOriginal, 'shuffled choices are the same multiset as the input');
  }
});

section('shuffledAuthored: all 4 answer positions occur, and all 24 orderings occur (position coverage)', () => {
  const choices = ['alpha', 'bravo', 'charlie', 'delta'];
  const answerIndex = 0;
  const seenPositions = new Set();
  const seenPermutations = new Set();
  for (let i = 0; i < ITER; i++) {
    const { choices: out, correctIndex } = shuffledAuthored(choices, answerIndex);
    seenPositions.add(correctIndex);
    seenPermutations.add(out.join('|'));
  }
  assert.equal(seenPositions.size, 4, `correct answer should land in all 4 positions over ${ITER} draws, saw ${seenPositions.size}`);
  assert.equal(seenPermutations.size, 24, `all 24 orderings of 4 distinct choices should occur over ${ITER} draws, saw ${seenPermutations.size}`);
});

section('shuffledAuthored: duplicate-text choices — correctIndex still resolves to the right text', () => {
  // Two choices share display text ('same'); the correct one is the SECOND
  // occurrence (index 2). A naive value-based remap (e.g. choices.indexOf on
  // the correct text) would always land on the FIRST 'same' at index 0 —
  // wrong whenever the truly-correct occurrence is a later duplicate. This
  // only proves the text is right (duplicates make the two indistinguishable
  // by text alone) — the identity-tracking test below is the stronger proof.
  const choices = ['same', 'bravo', 'same', 'delta'];
  const answerIndex = 2;
  for (let i = 0; i < 500; i++) {
    const { choices: out, correctIndex } = shuffledAuthored(choices, answerIndex);
    assert.equal(out[correctIndex], 'same');
    assert.deepEqual(out.slice().sort(), choices.slice().sort());
  }
});

section('shuffledAuthored: tracks the correct choice by INDEX/IDENTITY, not by re-finding matching text', () => {
  // Use distinguishable marker objects with duplicate "display" content
  // (mimicking two same-text choices) so identity (===) reveals whether the
  // algorithm followed the original slot or merely re-matched by value.
  const dupA = { tag: 'same', slot: 'first' };
  const dupB = { tag: 'same', slot: 'second' }; // this is the one that's "correct"
  const marked = [dupA, { tag: 'bravo' }, dupB, { tag: 'delta' }];
  const answerIndex = 2; // dupB
  const seenPositions = new Set();
  for (let i = 0; i < ITER; i++) {
    const { choices: out, correctIndex } = shuffledAuthored(marked, answerIndex);
    assert.strictEqual(out[correctIndex], dupB, 'correctIndex must resolve to the exact original object at answerIndex');
    assert.notStrictEqual(out[correctIndex], dupA, 'must not accidentally resolve to the other duplicate-content entry');
    seenPositions.add(correctIndex);
  }
  assert.equal(seenPositions.size, 4, 'the tracked (correct) entry still lands in all 4 positions over many draws');
});

// ── regression gates: lock in the quality levels dev/audit_quiz_quality.mjs
// currently reports (0 marginGiveaway / 0 commaTell / 0 extremeImbalance /
// 0 malformed / 0 duplicateChoices across every bank + overlay file; T/F
// bank 39T/38F, max same-answer streak 4, 0 false-without-note, 0 missing
// refs) so a future content edit can't quietly regress them. There is
// exactly ONE metrics implementation — dev/audit_quiz_quality.mjs — this
// section spawns it with `--json` and asserts against its output rather
// than re-deriving the stats here. Documented exceptions (none currently
// needed) live in dev/quiz_quality_allowlist.mjs. ────────────────────────
const AUDIT_SCRIPT = fileURLToPath(new URL('./audit_quiz_quality.mjs', import.meta.url));
const auditRaw = execFileSync(process.execPath, [AUDIT_SCRIPT, '--json'], { encoding: 'utf8' });
const audit = JSON.parse(auditRaw);

// An id flagged by the audit that isn't in the matching allowlist category
// fails the gate; the allowlist map is `{ id: 'reason' }` so `id in map`
// covers membership.
function assertAllowlisted(label, category, flaggedIds, allowlistMap) {
  const notAllowlisted = flaggedIds.filter(id => !(id in allowlistMap));
  assert.deepEqual(
    notAllowlisted, [],
    `${label}: ${category} id(s) not in dev/quiz_quality_allowlist.mjs: ${notAllowlisted.join(', ')}`
  );
}

// Warn (never fail) on an allowlist entry the audit no longer flags — it's
// stale and should be pruned next time this file is touched, but a stale
// *exception* is not itself a quality regression.
const staleWarnings = [];
function collectStale(category, flaggedIds, allowlistMap) {
  const flaggedSet = new Set(flaggedIds);
  for (const id of Object.keys(allowlistMap)) {
    if (!flaggedSet.has(id)) staleWarnings.push(`${category}: '${id}' is allowlisted but no longer flagged`);
  }
}

// Per-file gate for one MCQ set (banks or overlays): malformed and
// duplicateChoices are hard zeros (never allowlisted — a broken shape or an
// indistinguishable pair of choices is never an acceptable exception);
// marginGiveaway/commaTell/extremeImbalance ids must be allowlist-covered.
function gateMcqFiles(setLabel, filesMetrics) {
  for (const [file, m] of Object.entries(filesMetrics)) {
    const label = `${setLabel}/${file}`;
    assert.equal(
      m.flags.malformed.length, 0,
      `${label}: malformed must be 0, found: ${m.flags.malformed.map(x => x.id).join(', ')}`
    );
    assert.equal(
      m.flags.duplicateChoices.length, 0,
      `${label}: duplicateChoices must be 0, found: ${m.flags.duplicateChoices.join(', ')}`
    );
    assertAllowlisted(label, 'marginGiveaway', m.flags.marginGiveaway, ALLOWLIST.marginGiveaway);
    assertAllowlisted(label, 'commaTell', m.flags.commaTell, ALLOWLIST.commaTell);
    assertAllowlisted(label, 'extremeImbalance', m.flags.extremeImbalance, ALLOWLIST.extremeImbalance);
  }
}

section('quality gate — bank MCQ files (js/data/quiz/*.js): allowlist-clean, 0 malformed/duplicate', () => {
  gateMcqFiles('banks', audit.banks.files);
  // Belt-and-suspenders: the aggregate must be equally clean, since it's
  // built from the same per-file entries.
  assert.equal(audit.banks.overall.flags.malformed.length, 0, 'banks OVERALL malformed is 0');
  assert.equal(audit.banks.overall.flags.duplicateChoices.length, 0, 'banks OVERALL duplicateChoices is 0');
});

section('quality gate — overlay MCQ files (js/data/quiz_cards/*.js): allowlist-clean, 0 malformed/duplicate', () => {
  gateMcqFiles('overlays', audit.overlays.files);
  assert.equal(audit.overlays.overall.flags.malformed.length, 0, 'overlays OVERALL malformed is 0');
  assert.equal(audit.overlays.overall.flags.duplicateChoices.length, 0, 'overlays OVERALL duplicateChoices is 0');
});

// Staleness is checked against the combined bank+overlay OVERALL flags — an
// allowlist entry only counts as "still needed" if some file's flag list
// (rolled up into OVERALL) still contains it.
for (const category of ['marginGiveaway', 'commaTell', 'extremeImbalance']) {
  const flaggedIds = [
    ...audit.banks.overall.flags[category],
    ...audit.overlays.overall.flags[category],
  ];
  collectStale(category, flaggedIds, ALLOWLIST[category]);
}

section('quality gate — T/F bank (js/data/quiz/bco_tf.js): balance, streak, notes, refs, unique ids', () => {
  const tfMetrics = audit.tf;
  const total = tfMetrics.trueCount + tfMetrics.falseCount;
  assert.ok(total > 0, 'T/F bank has entries');

  const truePct = (100 * tfMetrics.trueCount) / total;
  assert.ok(
    truePct >= 45 && truePct <= 55,
    `True ratio must be within 45-55%, got ${truePct.toFixed(1)}% (${tfMetrics.trueCount}T/${tfMetrics.falseCount}F)`
  );

  assert.ok(
    tfMetrics.longestSameAnswerStreak <= 4,
    `longest same-answer streak must be <= 4, got ${tfMetrics.longestSameAnswerStreak}`
  );

  assert.deepEqual(
    tfMetrics.flags.falseMissingNote, [],
    `every False statement needs a non-empty note; missing on: ${tfMetrics.flags.falseMissingNote.join(', ')}`
  );

  assert.deepEqual(
    tfMetrics.flags.missingRefs, [],
    `every T/F entry needs refs; missing on: ${tfMetrics.flags.missingRefs.join(', ')}`
  );

  // ids unique — also covered by the "bco_tf: ids unique" structural test
  // above (using the `tf` array loaded at the top of this file); re-checked
  // here too so this gate section is self-contained.
  const seen = new Set();
  const dupIds = [];
  for (const t of tf) {
    if (seen.has(t.id)) dupIds.push(t.id);
    seen.add(t.id);
  }
  assert.deepEqual(dupIds, [], `T/F ids must be unique, duplicates: ${dupIds.join(', ')}`);
});

console.log(`\n${sections} section(s) passed.`);
if (staleWarnings.length) {
  console.log(`\n${staleWarnings.length} stale allowlist warning(s) (not a failure):`);
  for (const w of staleWarnings) console.log(`WARN  ${w}`);
}
