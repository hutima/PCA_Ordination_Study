// Greek sorting helpers
// Uses global functions from pos_logic.js: normalizeSpacing, stripGreekAccents,
// formatGreekHeadword, detectPartOfSpeech

export function stripInitialNominalArticle(text) {
  const formatted = normalizeSpacing(text || '');
  return formatted.replace(/^(ὁ|ἡ|τό)\s+/u, '').trim();
}

export function isMorphCard(card) {
  return !!(card && card.kind === 'morph');
}

export function getGreekAlphabetSortKey(card) {
  if (isMorphCard(card)) return stripGreekAccents(normalizeSpacing(card.form || '')).replace(/ς/g, 'σ').toLowerCase();
  const pos = detectPartOfSpeech(card);
  const headword = formatGreekHeadword(card.g);
  const sortable = /^Noun\b/.test(pos) ? stripInitialNominalArticle(headword) : headword;
  return stripGreekAccents(normalizeSpacing(sortable || '')).replace(/ς/g, 'σ').toLowerCase();
}

export function compareGreekAlphabetical(a, b) {
  const order = { 'α':1,'β':2,'γ':3,'δ':4,'ε':5,'ζ':6,'η':7,'θ':8,'ι':9,'κ':10,'λ':11,'μ':12,'ν':13,'ξ':14,'ο':15,'π':16,'ρ':17,'σ':18,'τ':19,'υ':20,'φ':21,'χ':22,'ψ':23,'ω':24 };
  const aKey = getGreekAlphabetSortKey(a);
  const bKey = getGreekAlphabetSortKey(b);
  const len = Math.max(aKey.length, bKey.length);
  for (let i = 0; i < len; i++) {
    const aCh = aKey[i] || '';
    const bCh = bKey[i] || '';
    if (aCh === bCh) continue;
    const aRank = order[aCh] || (aCh ? (200 + aCh.codePointAt(0)) : 0);
    const bRank = order[bCh] || (bCh ? (200 + bCh.codePointAt(0)) : 0);
    if (aRank !== bRank) return aRank - bRank;
  }
  return aKey.localeCompare(bKey, 'el');
}
