// Confidence tracking and per-card XP award calculation — no state access

export function getConfidenceSample(outcome) {
  const normalized = String(outcome || '').toLowerCase();
  if (normalized === 'easy' || normalized === 'known') return 1;
  if (normalized === 'pass' || normalized === 'uncertain' || normalized === 'unsure') return 0.5;
  return 0;
}

export function recordConfidenceSample(progress, outcome) {
  const history = Array.isArray(progress.confidenceHistory) ? [...progress.confidenceHistory] : [];
  history.push(getConfidenceSample(outcome));
  progress.confidenceHistory = history.slice(-10);
  const avg = progress.confidenceHistory.length
    ? progress.confidenceHistory.reduce((sum, value) => sum + value, 0) / progress.confidenceHistory.length
    : 0;
  progress.confidence = avg * 5;
}

export function getConfidencePct(progress) {
  const history = Array.isArray(progress?.confidenceHistory) ? progress.confidenceHistory.filter(value => Number.isFinite(value)) : [];
  if (history.length) {
    const avg = history.reduce((sum, value) => sum + value, 0) / history.length;
    return Math.round(avg * 100);
  }
  const passCount = progress?.passCount || 0;
  const failCount = progress?.failCount || 0;
  const responseCount = passCount + failCount;
  return responseCount ? Math.round((passCount / responseCount) * 100) : null;
}

// Per-review XP awards:
//   again/review  -> 1 XP
//   pass/uncertain -> 3 XP
//   easy/known (spaced, first confirmation) -> 10 XP
//   easy/known (spaced, subsequent)         ->  5 XP
//   easy/known (unspaced)                   ->  1 XP
export function computeCardXpAward(outcome, isFirstConfirmation, isSpaced) {
  const norm = String(outcome || '').toLowerCase();
  if (norm === 'easy' || norm === 'known') {
    if (!isSpaced) return 1;
    return isFirstConfirmation ? 10 : 5;
  }
  if (norm === 'pass' || norm === 'uncertain' || norm === 'unsure') return 3;
  return 1;
}
