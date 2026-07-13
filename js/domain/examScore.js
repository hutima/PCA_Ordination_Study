// Mock-exam answer-code tallying — pure, no DOM/storage. Turns the persisted
// per-question result codes ('c'/'w' auto-graded, 'e'/'p'/'a' self-graded)
// into an auto-graded tally + letter grade, via scoring.js's shared scale.
// Self-graded codes never affect the rank — only 'c'/'w' do.

import { scorePercent, gradeForPercent } from './scoring.js';

// codes: an iterable of single-letter result codes. Unknown codes are ignored
// (forward-compatible with any future code, and tolerant of stale/malformed
// persisted data).
export function tallyCodes(codes) {
  let c = 0, w = 0, e = 0, p = 0, a = 0;
  for (const code of codes) {
    if (code === 'c') c++;
    else if (code === 'w') w++;
    else if (code === 'e') e++;
    else if (code === 'p') p++;
    else if (code === 'a') a++;
    // unknown code: ignored
  }
  const autoAnswered = c + w;
  const autoPct = scorePercent(c, autoAnswered); // null when autoAnswered is 0
  const autoGrade = gradeForPercent(autoPct)?.grade ?? null;
  return {
    autoAnswered,
    autoCorrect: c,
    autoWrong: w,
    selfCorrect: e,
    selfPartial: p,
    selfIncorrect: a,
    answered: c + w + e + p + a,
    autoPct,
    autoGrade,
  };
}
