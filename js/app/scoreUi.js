// Shared HTML string builders for score/grade display — pure string building,
// no DOM APIs. Imported by both the Quiz results and Mock-exam results
// renderers so the two screens can't drift apart.

import { escapeHtml } from '../utils/text.js';
import { EXPECTED_PASS_PCT, PASS_DISCLAIMER } from '../domain/scoring.js';

// '' when there's no grade to show; else a badge span whose *text content* is
// the letter (grade is communicated in text, not colour alone).
export function gradeBadgeHtml(score) {
  if (!score || score.grade == null) return '';
  const letter = String(score.grade);
  return `<span class="grade-badge grade-${escapeHtml(letter.toLowerCase())}" aria-hidden="false">${escapeHtml(letter)}</span>`;
}

// Muted "Best: NN% (c/t)" line for a prior record, or '' if invalid.
function scorePrevHtml(previous) {
  if (!previous || typeof previous.pct !== 'number' || !Number.isFinite(previous.pct)) return '';
  const correct = Number.isFinite(previous.correct) ? previous.correct : '?';
  const total = Number.isFinite(previous.total) ? previous.total : '?';
  return `<div class="score-prev">Best: ${escapeHtml(String(previous.pct))}% (${escapeHtml(String(correct))}/${escapeHtml(String(total))})</div>`;
}

// A self-contained result hero: grade badge, percent, ratio line, new-record
// or best-so-far line, grade label, and any extra notes. `ratioLine` and each
// `subLines` entry are caller-escaped (they may carry <strong> etc.).
export function scoreHeroHtml({ score, ratioLine, subLines = [], isNewRecord = false, previous = null }) {
  const badge = gradeBadgeHtml(score);
  const pctHtml = score && typeof score.pct === 'number' && Number.isFinite(score.pct)
    ? `<span class="score-pct">${escapeHtml(String(score.pct))}%</span>`
    : '';
  const ratioHtml = ratioLine ? `<div class="score-ratio">${ratioLine}</div>` : '';
  const recordHtml = isNewRecord
    ? '<span class="new-record-badge">★ New high score</span>'
    : scorePrevHtml(previous);
  const labelHtml = score && score.grade != null && score.label
    ? `<div class="score-grade-label">${escapeHtml(score.grade)} — ${escapeHtml(score.label)}</div>`
    : '';
  const notesHtml = subLines.map(line => `<div class="score-note">${line}</div>`).join('');
  return `<div class="score-hero" role="status" aria-live="polite">${badge}${pctHtml}${ratioHtml}${recordHtml}${labelHtml}${notesHtml}</div>`;
}

// The standard "expected passing range" note, plain text (caller escapes).
export function expectedPassNote() {
  return `Expected passing range begins at ${EXPECTED_PASS_PCT}%. ${PASS_DISCLAIMER}`;
}
