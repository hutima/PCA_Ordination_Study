// PCA Ordination & Licensure Study — quiz quality audit (read-only report).
//
// Surveys every hand-authored MCQ/T-F question bank for statistical "tells"
// that let a guesser beat the content without knowing the answer (answer
// position skew, correct-choice length giveaways, comma tells, duplicate
// choices, malformed shapes) plus True/False-specific bank health (True/False
// balance, giveaway absolute words, missing notes/refs, same-answer streaks).
//
// This is a REPORT, not a gate: it never rewrites content, always exits 0,
// and a later test script is expected to consume its --json output (or its
// exit code, if a gate is added on top later) to fail a build. Run:
//   node dev/audit_quiz_quality.mjs            (human-readable report)
//   node dev/audit_quiz_quality.mjs --json      (machine-readable summary)
//
// Loader pattern reused from dev/validate.mjs: each data file is a browser
// global (`window.PCA_QUIZ = ...`, `window.PCA_CARD_QUIZ = ...`), so we
// dynamic-`import()` every file in the relevant js/data/ directory and read
// the resulting globals off `globalThis` — no bundler, no bespoke parser.
import { readdirSync } from 'node:fs';

const JSON_MODE = process.argv.includes('--json');

// ── directories (mirrors dev/validate.mjs) ─────────────────────────────
const QUIZ_DIR = new URL('../js/data/quiz/', import.meta.url);
const QUIZ_CARDS_DIR = new URL('../js/data/quiz_cards/', import.meta.url);

// ── small stats helpers ─────────────────────────────────────────────────
function mean(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}
function median(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function round(n, d = 1) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}
function pct(n, total) {
  return total ? round((100 * n) / total, 1) : 0;
}
function strLen(s) {
  return typeof s === 'string' ? s.length : 0;
}
function normalizeChoice(s) {
  return String(s).toLowerCase().trim().replace(/[.!?,:;]+$/, '');
}
function commaParts(s) {
  return String(s).split(',').length;
}

// ── per-question analyzers ──────────────────────────────────────────────
// Malformed shape check: choices must be an array of exactly 4 non-empty
// strings, answerIndex must be a valid index into it. Malformed questions are
// counted/listed but excluded from the length/position/comma stats below
// (there is nothing coherent to measure once the shape itself is broken).
function malformedReasons(choices, answerIndex) {
  const reasons = [];
  if (!Array.isArray(choices)) {
    reasons.push('choices is not an array');
    return reasons;
  }
  if (choices.length !== 4) reasons.push(`choices count is ${choices.length}, expected 4`);
  choices.forEach((c, i) => {
    if (typeof c !== 'string' || !c.trim()) reasons.push(`choice[${i}] is empty/non-string`);
  });
  if (typeof answerIndex !== 'number' || !Number.isInteger(answerIndex) ||
      answerIndex < 0 || answerIndex >= choices.length) {
    reasons.push(`answerIndex ${answerIndex} out of bounds`);
  }
  return reasons;
}

// Margin giveaway: correct choice is >=1.2x every distractor's length AND at
// least 12 chars longer than the longest distractor. Both a relative (ratio)
// and an absolute (char-count) bar must be cleared, so a short question where
// everything is short-ish doesn't get flagged off a trivial ratio.
function isMarginGiveaway(correctLen, distractorLens) {
  if (!distractorLens.length) return false;
  const maxDistractor = Math.max(...distractorLens);
  const ratioOk = distractorLens.every(d => correctLen >= 1.2 * d);
  return ratioOk && (correctLen - maxDistractor) >= 12;
}

// Comma tell: the correct choice is the only option with a comma at all, OR
// the only option with 3+ comma-separated parts (commaParts >= 3), while no
// distractor reaches that same threshold.
function isCommaTell(correctChoice, distractorChoices) {
  const correctHasComma = correctChoice.includes(',');
  const distractorsHaveComma = distractorChoices.some(d => d.includes(','));
  const onlyCommaOwner = correctHasComma && !distractorsHaveComma;

  const correctParts = commaParts(correctChoice);
  const distractorMaxParts = distractorChoices.length
    ? Math.max(...distractorChoices.map(commaParts)) : 1;
  const onlyThreePartOwner = correctParts >= 3 && distractorMaxParts < 3;

  return onlyCommaOwner || onlyThreePartOwner;
}

function analyzeMcqSet(entries) {
  const m = {
    count: entries.length,
    answerIndexDist: { 0: 0, 1: 0, 2: 0, 3: 0, other: 0 },
    correctLen: { mean: 0, median: 0 },
    distractorLen: { mean: 0, median: 0 },
    pctCorrectLongest: 0,
    pctMarginGiveaway: 0,
    pctCommaTell: 0,
    pctExtremeImbalance: 0,
    pctDuplicateChoices: 0,
    flags: {
      longest: [],
      marginGiveaway: [],
      commaTell: [],
      extremeImbalance: [],
      duplicateChoices: [],
      malformed: [], // [{id, reasons}]
    },
  };
  const correctLens = [];
  const distractorLens = [];
  let wellFormed = 0;

  for (const e of entries) {
    const { id, choices, answerIndex } = e;
    const reasons = malformedReasons(choices, answerIndex);
    if (reasons.length) {
      m.flags.malformed.push({ id, reasons });
      continue;
    }
    wellFormed++;
    if (answerIndex >= 0 && answerIndex <= 3) m.answerIndexDist[answerIndex]++;
    else m.answerIndexDist.other++;

    const lens = choices.map(strLen);
    const correctLen = lens[answerIndex];
    const dLens = lens.filter((_, i) => i !== answerIndex);
    correctLens.push(correctLen);
    distractorLens.push(...dLens);

    if (correctLen >= Math.max(...dLens)) m.flags.longest.push(id);
    if (isMarginGiveaway(correctLen, dLens)) m.flags.marginGiveaway.push(id);

    const correctChoice = choices[answerIndex];
    const distractorChoices = choices.filter((_, i) => i !== answerIndex);
    if (isCommaTell(correctChoice, distractorChoices)) m.flags.commaTell.push(id);

    const maxLen = Math.max(...lens);
    const minLen = Math.min(...lens);
    if (minLen > 0 && maxLen / minLen > 3) m.flags.extremeImbalance.push(id);

    const normalized = choices.map(normalizeChoice);
    if (new Set(normalized).size !== normalized.length) m.flags.duplicateChoices.push(id);
  }

  m.correctLen = { mean: round(mean(correctLens), 1), median: round(median(correctLens), 1) };
  m.distractorLen = { mean: round(mean(distractorLens), 1), median: round(median(distractorLens), 1) };
  m.pctCorrectLongest = pct(m.flags.longest.length, wellFormed);
  m.pctMarginGiveaway = pct(m.flags.marginGiveaway.length, wellFormed);
  m.pctCommaTell = pct(m.flags.commaTell.length, wellFormed);
  m.pctExtremeImbalance = pct(m.flags.extremeImbalance.length, wellFormed);
  m.pctDuplicateChoices = pct(m.flags.duplicateChoices.length, wellFormed);
  m.wellFormedCount = wellFormed;
  return m;
}

// ── loaders ──────────────────────────────────────────────────────────────
// Bank files (js/data/quiz/*.js EXCEPT bco_tf.js): each file replaces
// `global.PCA_QUIZ` with the prior array concatenated with its own entries,
// so a file's own contribution is whatever got appended since the previous
// snapshot (entries are only ever appended, never reordered/removed).
async function loadBankFiles() {
  const files = readdirSync(QUIZ_DIR).filter(f => f.endsWith('.js') && f !== 'bco_tf.js').sort();
  const perFile = {};
  let prevLen = 0;
  for (const f of files) {
    await import(new URL(f, QUIZ_DIR));
    const arr = globalThis.PCA_QUIZ || [];
    perFile[f] = arr.slice(prevLen);
    prevLen = arr.length;
  }
  return { perFile, all: (globalThis.PCA_QUIZ || []).slice() };
}

// Overlay files (js/data/quiz_cards/*.js): each file does
// `global.PCA_CARD_QUIZ = Object.assign(global.PCA_CARD_QUIZ || {}, Q)`, a
// key merge (never a delete). A file's own contribution is whichever keys
// are new in the merged map right after that file's import — captured with
// the value at that moment, so a later file overwriting the same id (should
// not normally happen — ids are card ids, file-scoped by subject) doesn't
// retroactively corrupt this file's own recorded contribution.
async function loadOverlayFiles() {
  const files = readdirSync(QUIZ_CARDS_DIR).filter(f => f.endsWith('.js')).sort();
  const perFile = {};
  let prevKeys = new Set();
  for (const f of files) {
    await import(new URL(f, QUIZ_CARDS_DIR));
    const merged = globalThis.PCA_CARD_QUIZ || {};
    const newKeys = Object.keys(merged).filter(k => !prevKeys.has(k));
    perFile[f] = newKeys.map(k => ({ id: k, ...merged[k] }));
    prevKeys = new Set(Object.keys(merged));
  }
  const all = Object.entries(globalThis.PCA_CARD_QUIZ || {}).map(([id, v]) => ({ id, ...v }));
  return { perFile, all };
}

// T/F bank (js/data/quiz/bco_tf.js only): loaded on its own so it never mixes
// with the MCQ bank files above.
async function loadTfBank() {
  await import(new URL('bco_tf.js', QUIZ_DIR));
  return globalThis.PCA_QUIZ_TF || [];
}

// ── T/F analysis ─────────────────────────────────────────────────────────
// BCO chapter "block" grouping: the chapter number before the dash in the
// first ref (e.g. 'BCO 10-2' -> '10'), 'Preface' for BCO Preface, else
// 'other'/'none'. Loose on purpose — good enough for a rough section split,
// skipped entirely if a statement has no usable ref.
function chapterBlock(refs) {
  const r = Array.isArray(refs) ? refs[0] : undefined;
  if (!r) return null;
  if (/preface/i.test(r)) return 'Preface';
  const m = /BCO\s+(\d+)/i.exec(r);
  return m ? m[1] : 'other';
}

const GIVEAWAY_WORDS = ['always', 'never', 'only', 'all', 'none', 'every'];
const ABSURD_TOKENS = ['pope', 'papal', 'dance', 'fine', 'prison', 'king', 'lottery'];

function analyzeTf(entries) {
  const m = {
    count: entries.length,
    trueCount: 0,
    falseCount: 0,
    ratio: null,
    bySection: {}, // { block: {true, false} }
    longestSameAnswerStreak: 0,
    flags: {
      giveawayAbsolutes: [], // [{id, words, answer}]
      falseMissingNote: [],  // [id]
      missingRefs: [],       // [id]
      absurdCandidates: [],  // [{id, tokens}]
    },
  };

  let streak = 0, lastAnswer = null, maxStreak = 0;
  for (const e of entries) {
    const { id, q, answer, refs, note } = e;
    if (answer === true) m.trueCount++;
    else if (answer === false) m.falseCount++;

    const block = chapterBlock(refs);
    if (block) {
      m.bySection[block] = m.bySection[block] || { true: 0, false: 0 };
      m.bySection[block][answer ? 'true' : 'false']++;
    }

    if (answer === lastAnswer) { streak++; } else { streak = 1; lastAnswer = answer; }
    if (streak > maxStreak) maxStreak = streak;

    const text = String(q || '');
    const matchedWords = GIVEAWAY_WORDS.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(text));
    if (matchedWords.length) {
      m.flags.giveawayAbsolutes.push({ id, words: matchedWords, answer });
    }

    if (answer === false && (!note || !String(note).trim())) {
      m.flags.falseMissingNote.push(id);
    }

    if (!Array.isArray(refs) || refs.length === 0) {
      m.flags.missingRefs.push(id);
    }

    const matchedTokens = ABSURD_TOKENS.filter(t => new RegExp(`\\b${t}\\b`, 'i').test(text));
    if (matchedTokens.length) {
      m.flags.absurdCandidates.push({ id, tokens: matchedTokens });
    }
  }

  m.longestSameAnswerStreak = maxStreak;
  m.ratio = m.falseCount ? round(m.trueCount / m.falseCount, 2) : null;
  return m;
}

// ── run ──────────────────────────────────────────────────────────────────
const { perFile: bankPerFile, all: bankAll } = await loadBankFiles();
const { perFile: overlayPerFile, all: overlayAll } = await loadOverlayFiles();
const tfAll = await loadTfBank();

const bankFileMetrics = {};
for (const [f, entries] of Object.entries(bankPerFile)) bankFileMetrics[f] = analyzeMcqSet(entries);
const bankOverall = analyzeMcqSet(bankAll);

const overlayFileMetrics = {};
for (const [f, entries] of Object.entries(overlayPerFile)) overlayFileMetrics[f] = analyzeMcqSet(entries);
const overlayOverall = analyzeMcqSet(overlayAll);

const tfMetrics = analyzeTf(tfAll);

const summary = {
  generatedAt: new Date().toISOString(),
  banks: { files: bankFileMetrics, overall: bankOverall },
  overlays: { files: overlayFileMetrics, overall: overlayOverall },
  tf: tfMetrics,
};

// ── report rendering ─────────────────────────────────────────────────────
function fmtDist(dist) {
  return `0:${dist[0]} 1:${dist[1]} 2:${dist[2]} 3:${dist[3]}${dist.other ? ` other:${dist.other}` : ''}`;
}
function idList(arr, max = 12) {
  if (!arr.length) return '(none)';
  const shown = arr.slice(0, max).join(', ');
  return arr.length > max ? `${shown}, … (+${arr.length - max} more)` : shown;
}
function mcqLine(label, m) {
  const lines = [];
  lines.push(`  ${label.padEnd(28)} n=${String(m.count).padStart(4)}  malformed=${m.flags.malformed.length}`);
  lines.push(`    answerIndex dist: ${fmtDist(m.answerIndexDist)}`);
  lines.push(`    correct len  mean/median: ${m.correctLen.mean}/${m.correctLen.median}   ` +
             `distractor len mean/median: ${m.distractorLen.mean}/${m.distractorLen.median}`);
  lines.push(`    correct=longest: ${m.pctCorrectLongest}%   margin giveaway: ${m.pctMarginGiveaway}%   ` +
             `comma tell: ${m.pctCommaTell}%   extreme imbalance: ${m.pctExtremeImbalance}%   ` +
             `dup choices: ${m.pctDuplicateChoices}%`);
  return lines.join('\n');
}
function mcqFlagDetail(label, m) {
  const lines = [`  -- ${label}: flagged ids --`];
  lines.push(`  longest:            ${idList(m.flags.longest)}`);
  lines.push(`  marginGiveaway:     ${idList(m.flags.marginGiveaway)}`);
  lines.push(`  commaTell:          ${idList(m.flags.commaTell)}`);
  lines.push(`  extremeImbalance:   ${idList(m.flags.extremeImbalance)}`);
  lines.push(`  duplicateChoices:   ${idList(m.flags.duplicateChoices)}`);
  if (m.flags.malformed.length) {
    lines.push(`  malformed:          ${m.flags.malformed.map(x => `${x.id} (${x.reasons.join('; ')})`).join(' | ')}`);
  } else {
    lines.push('  malformed:          (none)');
  }
  return lines.join('\n');
}

if (JSON_MODE) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log('PCA quiz quality audit (read-only — report only, never rewrites content)\n');

  console.log('=== Hand-authored MCQ banks (js/data/quiz/*.js, excl. bco_tf.js) ===');
  for (const [f, m] of Object.entries(bankFileMetrics)) console.log(mcqLine(f, m));
  console.log(mcqLine('OVERALL (banks)', bankOverall));
  console.log('\n' + mcqFlagDetail('OVERALL banks', bankOverall));

  console.log('\n=== Per-card MCQ overlays (js/data/quiz_cards/*.js) ===');
  for (const [f, m] of Object.entries(overlayFileMetrics)) console.log(mcqLine(f, m));
  console.log(mcqLine('OVERALL (overlays)', overlayOverall));
  console.log('\n' + mcqFlagDetail('OVERALL overlays', overlayOverall));

  console.log('\n=== True/False bank (js/data/quiz/bco_tf.js -> PCA_QUIZ_TF) ===');
  console.log(`  n=${tfMetrics.count}   True=${tfMetrics.trueCount}  False=${tfMetrics.falseCount}  ` +
              `ratio(T:F)=${tfMetrics.ratio ?? 'n/a'}   longest same-answer streak=${tfMetrics.longestSameAnswerStreak}`);
  console.log('  by BCO chapter block (true/false):');
  const blocks = Object.keys(tfMetrics.bySection).sort((a, b) => {
    const na = Number(a), nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return String(a).localeCompare(String(b));
  });
  for (const b of blocks) {
    const s = tfMetrics.bySection[b];
    console.log(`    ${String(b).padEnd(10)} true=${s.true} false=${s.false}`);
  }
  console.log(`  giveaway absolutes (${tfMetrics.flags.giveawayAbsolutes.length}): ` +
    idList(tfMetrics.flags.giveawayAbsolutes.map(x => `${x.id}[${x.words.join('/')}]=${x.answer}`), 15));
  console.log(`  false-with-no-note (${tfMetrics.flags.falseMissingNote.length}): ` +
    idList(tfMetrics.flags.falseMissingNote, 15));
  console.log(`  missing refs (${tfMetrics.flags.missingRefs.length}): ` +
    idList(tfMetrics.flags.missingRefs, 15));
  console.log(`  absurd-token candidates for review (${tfMetrics.flags.absurdCandidates.length}): ` +
    idList(tfMetrics.flags.absurdCandidates.map(x => `${x.id}[${x.tokens.join('/')}]`), 15));

  console.log('\n(report only — exits 0 regardless of findings; run with --json for machine-readable output)');
}

process.exit(0);
