function normalizeSpacing(text) {
  return (text || '')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .trim();
}

function stripGreekAccents(text) {
  return (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Stable identifier derived from the Greek headword:
// strips accents/diacritics so typo-fixes on accents don't orphan progress,
// but substantive changes to the word correctly create a new card.
function stableCardKey(greek) {
  return stripGreekAccents(greek || '')
    .replace(/[\s,·.]+/g, '_')
    .toLowerCase();
}

function buildLegacyStableIdMap() {
  const map = new Map();
  Object.keys(SETS).forEach(rawKey => {
    const set = SETS[rawKey];
    if (!set || !Array.isArray(set.cards)) return;
    set.cards.forEach((card, idx) => {
      const legacyId = `${rawKey}-${stableCardKey(card.g)}`;
      const currentId = `${rawKey}-${idx}-${stableCardKey(card.g)}`;
      const existing = map.get(legacyId) || [];
      existing.push(currentId);
      map.set(legacyId, existing);
    });
  });
  return map;
}


function parseNominalPattern(greek) {
  const text = normalizeSpacing((greek || '').trim());

  let m = text.match(/^(.*?),\s*([^,]+),\s*(ὁ|ἡ|τό)$/u);
  if (m) return { head: m[1].trim(), gen: m[2].trim(), article: m[3], raw: text };

  m = text.match(/^(.*?)\s+([^,]+),\s*(ὁ|ἡ|τό)$/u);
  if (m && /^[-\p{L}]+$/u.test(m[2])) return { head: m[1].trim(), gen: m[2].trim(), article: m[3], raw: text };

  m = text.match(/^(.*?),\s*([^,]+)\s+(ὁ|ἡ|τό)$/u);
  if (m) return { head: m[1].trim(), gen: m[2].trim(), article: m[3], raw: text };

  m = text.match(/^(.*?),\s*(ὁ|ἡ|τό)$/u);
  if (m) return { head: m[1].trim(), gen: '', article: m[2], raw: text };

  return null;
}

function formatGreekHeadword(greek) {
  const trimmed = normalizeSpacing(greek || '');
  if (!trimmed) return '';
  if (/^ὁ, ἡ, τό$/u.test(trimmed)) return trimmed;

  const nominal = parseNominalPattern(trimmed);
  if (nominal) {
    const pieces = [nominal.article + ' ' + nominal.head];
    if (nominal.gen) pieces.push(nominal.gen);
    return pieces.join(', ');
  }

  return trimmed;
}

function transliterateGreek(text) {
  const greekCharRegex = /[\u0370-\u03FF\u1F00-\u1FFF]/u;
  if (!greekCharRegex.test(text || '')) return text || '';

  const lowerMap = {
    'α':'a','β':'b','γ':'g','δ':'d','ε':'e','ζ':'z','η':'ē','θ':'th','ι':'i','κ':'k','λ':'l','μ':'m','ν':'n','ξ':'x',
    'ο':'o','π':'p','ρ':'r','σ':'s','ς':'s','τ':'t','υ':'y','φ':'ph','χ':'ch','ψ':'ps','ω':'ō'
  };

  function transliterateWord(word) {
    const groups = [];
    let current = null;
    for (const ch of word.normalize('NFD')) {
      if (/[\u0370-\u03FF\u1F00-\u1FFF]/u.test(ch)) {
        current = { base: ch, marks: '' };
        groups.push(current);
      } else if (/\p{M}/u.test(ch) && current) {
        current.marks += ch;
      } else {
        current = null;
        groups.push({ literal: ch });
      }
    }

    let out = '';
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (g.literal !== undefined) {
        out += g.literal;
        continue;
      }

      const base = g.base.toLowerCase();
      const rough = g.marks.includes('\u0314');
      const next = groups[i + 1];
      const nextBase = next && next.literal === undefined ? next.base.toLowerCase() : '';
      const nextHasDiaeresis = next && next.literal === undefined ? next.marks.includes('\u0308') : false;
      const pair = base + nextBase;
      const diphthongs = {
        'αι':'ai','ει':'ei','οι':'oi','υι':'yi','αυ':'au','ευ':'eu','ηυ':'ēu','ου':'ou'
      };

      const atWordStart = !groups.slice(0, i).some(item => item.literal === undefined);

      if (diphthongs[pair] && !nextHasDiaeresis) {
        let chunk = diphthongs[pair];
        if (rough && atWordStart) chunk = 'h' + chunk;
        out += chunk;
        i += 1;
        continue;
      }

      if (base === 'ρ' && rough) {
        out += atWordStart ? 'rh' : 'r';
        continue;
      }

      let chunk = lowerMap[base] || base;
      if (rough && atWordStart && /^[aeiouy]/.test(chunk)) chunk = 'h' + chunk;
      out += chunk;
    }
    return out.normalize('NFC');
  }

  return (text || '').split(/(\s+)/).map(token => {
    return greekCharRegex.test(token) ? transliterateWord(token) : token;
  }).join('').replace(/\s+,/g, ',');
}

function detectGender(card) {
  const nominal = parseNominalPattern(card.g || '');
  if (!nominal) return '';
  if (nominal.article === 'ὁ') return 'M';
  if (nominal.article === 'ἡ') return 'F';
  if (nominal.article === 'τό') return 'N';
  return '';
}

function detectDeclension(card) {
  const nominal = parseNominalPattern(card.g || '');
  if (!nominal) return '';

  const genRaw = (nominal.gen || '').replace(/^[-–—]\s*/u, '').trim();

  // No genitive given — treat as indeclinable (Hebrew/Aramaic proper nouns
  // like Ἀβραάμ, ῥαββί, πάσχα listed simply as `word, article`).
  if (!genRaw) return 'indecl.';

  // Strip accents/breathings so regex matches work regardless of diacritic form.
  const gen = stripGreekAccents(genRaw);
  const nom = stripGreekAccents(nominal.head || '');

  // Third declension: gen ends in -ος, -εως (ι-stem), or -ους (σ-stem).
  // Check these first because -ος would otherwise conflict with plain -ος nouns.
  if (/(εως|ους|ος)$/u.test(gen)) return '3rd decl.';

  // Gen ends in -ου: disambiguate between 2nd decl and 1st decl masc.
  if (/ου$/u.test(gen)) {
    // 1st declension masculine: nom ends in -ης or -ας (μαθητής, προφήτης,
    // Ἡρῴδης, Ἡλίας). Note: -ος nouns like ἀδελφός also end with 'ς' so we
    // must exclude them explicitly.
    if (/(ης|ας)$/u.test(nom) && !/ος$/u.test(nom)) return '1st decl.';
    // Otherwise 2nd declension (λόγος, ἔργον, ὁδός, contracted νοῦς).
    return '2nd decl.';
  }

  // Gen is a bare -α (contracted α-stem masculines: Βαρναβᾶς -ᾶ, Σατανᾶς -ᾶ).
  if (/^α$/u.test(gen) && /(ας|ης)$/u.test(nom)) return '1st decl.';

  // Gen ends in -ας or -ης: 1st declension feminine (unless already matched above).
  if (/(ας|ης)$/u.test(gen)) return '1st decl.';

  // Unknown pattern — return empty rather than guess wrong.
  return '';
}

// Hard-coded POS for entries that don't fit any regular pattern
// (irregular adjectives, slash-separated proper nouns, single-form numerals, etc.).
// Keyed by the exact Greek entry as it appears in SETS.
const POS_OVERRIDES = {
  // Adjectives with irregular or three-word headforms
  'μέγας μεγάλη, μέγα':           'Adjective',
  'πολύς πολλή, πολύ':            'Adjective',
  'εὐθύς, -εῖα, -ύ':              'Adjective',
  'μείζων':                        'Adjective',
  'πλείων':                        'Adjective',
  'χεῖρον':                        'Adjective',
  'ἀληθής, -ές':                  'Adjective',
  'ἀσθενής, -ές':                 'Adjective',
  'πᾶς, πᾶσα, πᾶν':               'Adjective',
  'οὐδείς, οὐδεμία, οὐδέν':       'Adjective',
  'μηδείς, μηδεμία, μηδέν':       'Adjective',
  // Proper nouns with slash-variants or irregular paradigms
  'Μαρία / Μαριάμ':               'Noun (F)',
  'Ἰησοῦς':                        'Noun (M, 3rd decl. irreg.)',
  'Ἱεροσόλυμα / Ἰερουσαλήμ':      'Noun',
  // Numerals listed as a single form (rather than with all genders)
  'τρεῖς':                         'Numeral',
  'τέσσαρες':                      'Numeral',
  'ἑκατόν':                        'Numeral',
  // 3rd decl feminine noun used numerically ("a thousand")
  'χιλιάς':                        'Noun (F, 3rd decl.)',
  // Conjunctions the exact-match table misses
  'οὐδέ':                          'Conjunction',
  'μήποτε':                        'Conjunction',
  // True indeclinable particle/interjection of Hebrew origin
  'ἀμήν':                          'Indeclinable',
  // Better taught as an interjection than a generic particle.
  'οὐαί':                          'Interjection'
};

// Splits a preposition headword like "ἐπί+gen." into its bare form and case.
// Returns null for entries without a case tag.
function parsePrepositionCaseTag(greek) {
  const text = normalizeSpacing(greek || '');
  const m = text.match(/^(.+?)\s*\+\s*(gen|dat|acc)\.?$/u);
  if (!m) return null;
  return { bare: m[1].trim(), case: m[2] };
}

// Prepositions in the wordlist that govern more than one case (e.g. ἐπί with
// gen./dat./acc.). Built once by scanning SETS for case-tagged headwords and
// counting the distinct cases seen per bare preposition.
let multiCasePrepositionSet = null;

function getMultiCasePrepositions() {
  if (multiCasePrepositionSet) return multiCasePrepositionSet;
  const casesByPrep = new Map();
  if (typeof SETS !== 'undefined' && SETS) {
    Object.keys(SETS).forEach(rawKey => {
      const set = SETS[rawKey];
      if (!set || !Array.isArray(set.cards)) return;
      set.cards.forEach(card => {
        const parsed = parsePrepositionCaseTag(card && card.g);
        if (!parsed) return;
        if (!casesByPrep.has(parsed.bare)) casesByPrep.set(parsed.bare, new Set());
        casesByPrep.get(parsed.bare).add(parsed.case);
      });
    });
  }
  multiCasePrepositionSet = new Set();
  casesByPrep.forEach((cases, bare) => {
    if (cases.size > 1) multiCasePrepositionSet.add(bare);
  });
  return multiCasePrepositionSet;
}

// True when a card is a preposition headword whose bare form governs more
// than one case across the wordlist.
function isMultiCasePreposition(card) {
  const parsed = parsePrepositionCaseTag(card && card.g);
  if (!parsed) return false;
  return getMultiCasePrepositions().has(parsed.bare);
}

function detectPartOfSpeech(card) {
  const greek = normalizeSpacing(card.g || '');
  const english = normalizeSpacing(card.e || '');
  const lowerEnglish = english.toLowerCase();

  // 1. Per-card explicit override (escape hatch — set `pos` on a card to force a label).
  if (card.pos) return card.pos;

  // 2. Supplemental paradigm breakdowns hold inflected forms rather than
  // lexical headwords. The heuristics below only recognize lemmas, so the
  // result is almost always "[undetermined]" — and even when a guess lands,
  // a single form (e.g. "αὐτή") can validly be more than one part of speech.
  // Suppress the label for these cards so it isn't misleading.
  if (/^W\d+_/.test(String(card.sourceKey || ''))) return '';

  // 2a. Advanced bonus vocab covers ~5k rare lemmas; the heuristics above are
  // tuned for the course wordlist and misclassify too often on this set.
  // Suppress the POS label entirely for advanced cards.
  if (card.advanced || /^ADV\d+$/i.test(String(card.sourceKey || ''))) return '';

  // 3. Hard-coded overrides for entries the heuristics can't classify safely.
  if (POS_OVERRIDES[greek]) return POS_OVERRIDES[greek];

  // 3. Exact-match tables (unchanged content).
  const exactArticle = new Set(['ὁ, ἡ, τό']);
  const exactPronouns = new Set([
    'αὐτός, -ή, -ό','ἀλλήλος, ἀλλήλων','ἄλλος, -η, -ο','ἑαυτοῦ, -ῆς, -οῦ','ἐγώ, ἡμεῖς','ἐκεῖνος, -η, -ο',
    'ἐμαυτοῦ','ἐμός, -ή, -όν','κἀγώ','οὗτος, αὕτη, τοῦτο','ποῖος, -α, -ον','πόσος -η, -ον',
    'σεαυτοῦ','σός, -σή, -σόν','σύ, ὑμεῖς','τοιοῦτος, -αύτη, -οῦτον','τις τι','τίς τί','ὅστις','ὅς, ἥ, ὅ',
    'εἷς μία ἕν'
  ]);
  const exactConjunctions = new Set([
    'καί','ἀλλά','εἰ','ἤ','ὡς','γάρ','δέ','διό','διότι','εἴτε … εἴτε','ἐπεί','μέν','οὖν','τέ … καὶ',
    'οὔτε … οὔτε','καθώς','ὅτι','ὥσπερ','ἵνα','ὅπως','ὅταν','ἐάν','ἄχρι','ὥστε'
  ]);
  const exactParticles = new Set([
    'οὐ, οὐκ, οὐχ','μή','μηδέ','μηκέτι','μήτε','ἄρα','γέ','ἄν','ναί','οὐχί','πλήν','οὐαί','ἰδού'
  ]);
  const exactAdverbs = new Set([
    'πῶς','ποῦ','ἄρτι','ἔτι','ἤδη','νῦν','ὅτε','οὐκέτι','οὔπω','πάλιν','πάντοτε','ποτέ','σήμερον','τότε',
    'ἐγγύς','ἐκεῖ','ἐκεῖθεν','καλῶς','ὁμοίως','ὅπου','οὗ','οὕτως','πόθεν','ὧδε','ἀληθῶς','εὖ','μάλιστα',
    'μᾶλλον','μικρόν','ὀπίσω'
  ]);
  const exactPrepositions = new Set([
    'ἀπό','διά','εἰς','ἐκ','ἐν','ἐνώπιον','ἔξω','ἐπί','ἕως','κατά','μετά','παρά','περί','πρό','πρός','σύν','ὑπέρ','ὑπό',
    'ἔμπροσθεν','ἕνεκα','πέραν','χωρίς'
  ]);
  const exactNumerals = new Set([
    'δύο','τρεῖς, τρία','τέσσαρες, τέσσαρα','πέντε','ἕξ','ἑπτά','ὀκτώ','ἐννέα','δέκα','δώδεκα',
    'πρῶτος, -η, -ον','δεύτερος, -α, -ον','τρίτος, -η, -ον'
  ]);

  if (exactArticle.has(greek) || lowerEnglish.includes('definite article')) return 'Article';
  if (exactPronouns.has(greek)) return 'Pronoun';
  if (exactNumerals.has(greek)) return 'Numeral';
  if (exactConjunctions.has(greek)) return 'Conjunction';
  if (exactParticles.has(greek)) return greek === 'ἰδού' ? 'Interjection' : 'Particle';
  if (exactAdverbs.has(greek)) return 'Adverb';
  // Preposition headwords may carry a case tag like "ἀπό+gen." so split
  // multi-case prepositions can study one case per card.
  const prepBare = greek.replace(/\s*\+\s*(?:gen|dat|acc)\.?\s*$/u, '').trim();
  if (exactPrepositions.has(prepBare)) return 'Preposition';

  // 4. Nominal pattern → Noun. Rely on detectDeclension for '1st decl.' / '2nd decl.' / '3rd decl.' / 'indecl.'.
  const nominal = parseNominalPattern(greek);
  if (nominal) {
    const gender = detectGender(card);
    const decl = detectDeclension(card);
    const meta = [gender, decl].filter(Boolean).join(', ');
    return meta ? `Noun (${meta})` : 'Noun';
  }

  // 5. Verb detection via Greek morphology on the lexical form.
  // Strip accents and anything after a comma, then check canonical verb endings.
  const verbStem = stripGreekAccents(greek.replace(/,.*$/, '').trim());
  if (/(ομαι|μαι|μι|ω)$/u.test(verbStem)) return 'Verb';

  // 6. Verb detection via English gloss as a backup
  // (e.g. the impersonal δεῖ "it is necessary" whose stem doesn't match above).
  const strippedEnglish = lowerEnglish.replace(/^\(\+[^)]+\)\s*/u, '');
  if (/^(i\b|to\s+\w|it is\b)/i.test(strippedEnglish)
      || strippedEnglish.startsWith('behold!')
      || strippedEnglish.startsWith('look!')) return 'Verb';

  // 7. Adjective detection (three-termination and two-termination headwords).
  // Strip accents and allow space or comma before the first termination
  // so both `ἀγαθός -ή, -όν` and `ὅλος, -η, -ον` patterns match.
  const greekNoAcc = stripGreekAccents(greek);
  // Three-termination: head[ ,] -fem, -neut  (e.g., ἀγαθός -η, -ον  or  ὅλος, -η, -ον)
  if (/[,\s]\s*-[\p{L}]+,\s*-[\p{L}]+$/u.test(greekNoAcc)) return 'Adjective';
  // Two-termination: head, -ον  (e.g., αἰώνιος, -ον, ἁμαρτωλός, -ον)
  if (/,\s*-ον$/u.test(greekNoAcc)) return 'Adjective';

  // 8. Default for anything still unclassified.
  return '[undetermined]';
}


Object.assign(window, {
  stableCardKey,
  buildLegacyStableIdMap,
  formatGreekHeadword,
  transliterateGreek,
  detectPartOfSpeech,
  isMultiCasePreposition
});
