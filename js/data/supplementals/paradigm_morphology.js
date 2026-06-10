// Auto-generates parsing-quiz morphology sets from paradigm vocab cards.
// Runs after every W*_<paradigm> vocab set has been registered, then mirrors
// each card as a {form, answer} pair so the supplemental selector exposes a
// "Morphology" sub-quiz alongside the vocab cards.
(function () {
  if (typeof window.registerSupplementalMorphologySet !== 'function') return;

  const PARSING_KEYWORDS = /(?:\bNom\.?\b|\bGen\.?\b|\bDat\.?\b|\bAcc\.?\b|\bVoc\.?\b|\bsg\.?\b|\bpl\.?\b|\bsingular\b|\bplural\b|\bperson\b|\bmasc(?:uline)?\b|\bfem(?:inine)?\b|\bneut(?:er)?\b|\bnominative\b|\bgenitive\b|\bdative\b|\baccusative\b|\bvocative\b|\bPresent\b|\bFuture\b|\bImperfect\b|\bAorist\b|\bPerfect\b|\bPluperfect\b|\bpresent\b|\bfuture\b|\bimperfect\b|\baorist\b|\bperfect\b|\bpluperfect\b|\bactive\b|\bmiddle\b|\bpassive\b|\bindicative\b|\bsubjunctive\b|\bimperative\b|\binfinitive\b|\bparticiple\b|\b1st\b|\b2nd\b|\b3rd\b|\bTime\b|\bPlace\b|\bManner\b|\bReason\b|\bIndefinite construction\b|\bSimple relative\b)/i;

  const TENSE_PREFIX_REGEX = /^(1st Aorist [A-Za-z]+|2nd Aorist [A-Za-z]+|Aorist Passive|Present|Future|Imperfect|Aorist|Perfect|Pluperfect)\s*:\s*/;

  // Lowercases and reorders parsing components so every answer follows the
  // same shape: [qualifier|tense] [voice] [mood] [person] [case] [number] [gender]
  // matching the canonical format used by the chapter morphology sets.
  //
  // No mood/voice defaults here — they're applied at runtime in
  // buildMorphSteps based on the student's chapter scope. Defaulting at
  // canonicalization time would force the Mood step to appear even in
  // early chapters where the student hasn't been introduced to other
  // moods, making "pick indicative" a no-info step.
  function canonicalizePart(text) {
    if (!text) return '';
    let t = String(text).toLowerCase();
    t = t
      .replace(/\b1st\b/g, 'first')
      .replace(/\b2nd\b/g, 'second')
      .replace(/\b3rd\b/g, 'third')
      .replace(/\bsg\./g, 'singular')
      .replace(/\bpl\./g, 'plural')
      .replace(/\bnom\./g, 'nominative')
      .replace(/\bacc\./g, 'accusative')
      .replace(/\bgen\./g, 'genitive')
      .replace(/\bdat\./g, 'dative')
      .replace(/\bvoc\./g, 'vocative')
      .replace(/\bmasc\./g, 'masculine')
      .replace(/\bfem\./g, 'feminine')
      .replace(/\bneut\./g, 'neuter')
      .replace(/,/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const find = (re) => {
      const m = t.match(re);
      return m ? m[0].trim() : '';
    };

    const qualifier = find(/\b(first aorist|second aorist)\b/);
    const tense = find(/\b(present|future|imperfect|aorist|perfect|pluperfect)\b/);
    const voice = find(/\b(middle\/passive|middle or passive|active|middle|passive)\b/);
    const mood = find(/\b(indicative|subjunctive|imperative|infinitive|participle)\b/);
    // Person normalization: prefer explicit "<first|second|third> person".
    // Fall back to the bare ordinal when followed by a number word so the
    // canonical always reads "<N> person <singular|plural>" rather than
    // a bare "<N> <singular|plural>" — keeps the parsed dim available to
    // the step builder.
    let person = find(/\b(first|second|third) person\b/);
    if (!person) {
      const m = t.match(/\b(first|second|third)\b(?=\s+(?:singular|plural)\b)/);
      if (m) person = `${m[1]} person`;
    }
    const number = find(/\b(singular|plural)\b/);
    const casePart = find(/\b(nominative|accusative|genitive|dative|vocative)(?:\/(?:nominative|accusative|genitive|dative|vocative))*\b/);
    const genderPart = find(/\b(masculine|feminine|neuter)(?:\/(?:masculine|feminine|neuter))*\b/);

    const out = [];
    if (qualifier) out.push(qualifier);
    else if (tense) out.push(tense);
    if (voice) out.push(voice);
    if (mood) out.push(mood);
    if (person) out.push(person);
    if (casePart) out.push(casePart);
    if (number) out.push(number);
    if (genderPart) out.push(genderPart);

    const canonical = out.join(' ').trim();
    return canonical || t;
  }

  function canonicalizeAnswer(answer) {
    if (!answer) return '';
    return String(answer)
      .split(/\s*;\s*/)
      .map(canonicalizePart)
      .filter(Boolean)
      .join('; ');
  }

  function extractParsing(eText) {
    if (!eText) return null;
    const text = String(eText).trim();
    if (!text) return null;

    const parens = [...text.matchAll(/\(([^)]+)\)/g)].map((m) => m[1].trim());
    // A parenthetical may bundle parsing with phonology (e.g. "1st sg.;
    // φιλ ε + ω → φιλῶ"). Split on ';' and keep only the parsing chunks.
    const parsingParens = parens
      .flatMap((p) => p.split(';').map((s) => s.trim()))
      .filter((p) => p && PARSING_KEYWORDS.test(p) && !/[→+]/.test(p));

    if (parsingParens.length > 0) {
      const tenseMatch = text.match(TENSE_PREFIX_REGEX);
      const tensePrefix = tenseMatch ? tenseMatch[1] : null;
      const joined = parsingParens.join('; ');
      return tensePrefix ? `${tensePrefix}, ${joined}` : joined;
    }

    if (parens.length === 0 && PARSING_KEYWORDS.test(text)) {
      return text;
    }

    return null;
  }

  function extractLemma(label) {
    const text = String(label || '').trim();
    if (!text) return '';
    const dash = text.match(/^([^—]+?)\s*—/);
    if (dash) return dash[1].trim();
    return text;
  }

  // Strips the parsing parenthetical and any leading tense label so we keep
  // just the case-appropriate English meaning of the form (e.g.
  // "of the beginning" for the genitive of ἀρχή).
  function extractCardGloss(card) {
    if (!card || !card.e) return '';
    let gloss = String(card.e).replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    gloss = gloss
      .replace(/^(Present|Future|Imperfect|Aorist|Perfect|Pluperfect|1st [Aa]orist|2nd [Aa]orist)\s*:\s*/i, '')
      .trim();
    return gloss;
  }

  // Item-level fallback: pick the first card's gloss as the lemma's general
  // meaning, used when a particular question has no per-form gloss.
  function extractLemmaGloss(set) {
    if (!Array.isArray(set.cards)) return '';
    for (const card of set.cards) {
      if (!card || !card.g) continue;
      if (/[→]/.test(String(card.g).trim())) continue;
      const gloss = extractCardGloss(card);
      if (gloss) return gloss;
    }
    return '';
  }

  // Voice/mood defaults inferred from the SET's label (and, for voice,
  // from a deponent-shaped lemma). Without these the auto-canonicalized
  // card answer would say "first person singular" — no tense, voice,
  // mood — and the parsing drill couldn't ask those steps. With them,
  // every card in W1_LUO_PRESENT_ACTIVE (label "λύω — present active
  // indicative") canonicalizes to a full "present active indicative
  // <person> <number>". Only single-mood, single-voice labels seed
  // defaults — sets like "infinitive and participle" or "middle/deponent
  // indicative" with ambiguous labels still rely on per-card text.
  // Per-lemma voice-by-tense table for verbs where the set's label can't
  // safely default voice (multi-tense sets like "εἰμί — present, future,
  // imperfect", where each tense takes a different voice). Each entry
  // maps a Greek tense word to its canonical voice for that lemma.
  // εἰμί is intrinsically active in present/imperfect but deponent middle
  // in the future (ἔσομαι series). Extend this map as similar special
  // cases come up.
  const LEMMA_VOICE_BY_TENSE = {
    'εἰμί': { present: 'active', imperfect: 'active', future: 'middle' }
  };

  function setDefaults(set) {
    const label = String(set && set.label || '').toLowerCase();
    const lemma = String(extractLemma(set && set.label) || '').toLowerCase();
    const moodMatches = label.match(/\b(indicative|subjunctive|imperative|infinitive|participle)\b/g) || [];
    const voiceMatches = label.match(/\b(middle\/passive|middle or passive|active|middle|passive)\b/g) || [];
    const tenseMatches = label.match(/\b(present|future|imperfect|aorist|perfect|pluperfect)\b/g) || [];
    const mood = moodMatches.length === 1 ? moodMatches[0] : '';
    let voice = '';
    if (voiceMatches.length === 1) {
      voice = voiceMatches[0].replace(/middle or passive/, 'middle/passive');
    } else if (voiceMatches.length === 0) {
      // Deponent inference: -ομαι / -μαι lemma endings imply middle/passive
      // voice across the paradigm (Koine deponents are middle in form).
      // Skipped when the label already names a voice — that takes
      // precedence (e.g. ῥύομαι sets may explicitly mark "middle" only).
      if (/ομαι$|μαι$/.test(lemma)) voice = 'middle/passive';
    }
    // Tense default: only when the label names exactly one tense AND
    // doesn't carry a multi-tense marker like "(4 tenses)" or
    // "(present & aorist)". Otherwise per-card "Present:" / "Aorist:"
    // prefixes already provide tense.
    const multiTenseHint = /\(\d+\s+tenses?\)/i.test(label)
      || /&\s+(present|future|imperfect|aorist|perfect|pluperfect)/i.test(label)
      || tenseMatches.length > 1;
    const tense = (tenseMatches.length === 1 && !multiTenseHint) ? tenseMatches[0] : '';
    return { tense, voice, mood };
  }

  // Definite-article forms (all genders/numbers/cases, both acute and
  // grave accent variants). Several noun-paradigm vocab sets list forms
  // with the article prefixed ("ὁ προφήτης", "τοῦ προφήτου", …) so the
  // student recognizes gender at a glance during vocab drill. For
  // parsing-mode the article isn't part of the parsed form — strip it
  // so e.g. "ὁ προφήτης" becomes the single-word "προφήτης" that the
  // morphology generator can keep.
  const ARTICLE_PREFIX_RE = /^(?:ὁ|ἡ|τό|τὸ|οἱ|αἱ|τά|τὰ|τοῦ|τῆς|τῷ|τῇ|τόν|τὸν|τήν|τὴν|τῶν|τοῖς|ταῖς|τούς|τοὺς|τάς|τὰς)\s+/;

  function stripLeadingArticle(form) {
    return form.replace(ARTICLE_PREFIX_RE, '');
  }

  function buildMorphologyForSet(key, set) {
    if (!set || !Array.isArray(set.cards) || set.cards.length === 0) return null;

    const defaults = setDefaults(set);
    const seenForms = new Set();
    const questions = [];
    set.cards.forEach((card) => {
      let form = String(card && card.g ? card.g : '').trim();
      if (!form) return;
      // Stem-pair entries like "βάλλω → ἔβαλον" are study notes, not parseable
      // single forms — skip them so the quiz prompts a real Greek form.
      if (/[→]/.test(form)) return;
      // Strip a leading definite article so "ὁ προφήτης" / "τοῦ προφήτου"
      // collapse to their single-word noun before the multi-word filter.
      // Done BEFORE the seenForms dedup so each declined form registers
      // once under its bare-noun key.
      form = stripLeadingArticle(form);
      // Some paradigm cards list an equally-valid alternate spelling in a
      // trailing "(or …)" parenthetical — Duff gives two forms for εἰμί's
      // 2nd-sg and 1st-pl imperfect ("ἦς (or ἦσθα)", "ἦμεν (or ἤμεθα)").
      // Key parsing on the primary (first) form and drop the alternate so
      // the space/parens don't trip the multi-word filter below — which
      // would otherwise discard the whole form, leaving its parse with no
      // resolvable Greek form (the "your parse → —" bug).
      form = form.replace(/\s*\(\s*or\b[^)]*\)\s*$/i, '').trim();
      // Some cards give two equally-valid spellings separated by a slash —
      // an accented and an enclitic pronoun (ἐμέ / με, ἐμοῦ / μου, ἐμοί /
      // μοι) or a movable-ν verb pair (λύουσιν / λύουσι, ἐστιν / ἐστί). Key
      // parsing on the primary (first) form and drop the alternate, exactly
      // as with the "(or …)" case above. Without this the embedded spaces
      // trip the multi-word filter below and the whole form is discarded,
      // leaving its parse with no resolvable Greek form (the "your parse →
      // —" bug — e.g. picking 1st-person singular on ἡμᾶς couldn't surface
      // ἐμέ because that form had been dropped from the paradigm).
      if (form.includes('/')) form = form.split('/')[0].trim();
      if (!form) return;
      if (seenForms.has(form)) return;
      // Multi-word "forms" — principal-parts cards like
      // "τιθείς, -εῖσα, -έν" or constructions like "ὅς ἄν + subjunctive"
      // can't be parsed as a single inflected word. Skip so they don't
      // generate orphan morph cards (the parsing-deck filter would drop
      // them anyway, but filtering earlier keeps the data cleaner).
      if (/\s/.test(form) || /[+=]/.test(form)) return;
      const rawAnswer = extractParsing(card.e);
      if (!rawAnswer) return;
      // Inject set-level tense/voice/mood defaults when the per-card text
      // doesn't already name them. Detection mirrors canonicalizePart's
      // word lists so "Present participle" already-tagged answers don't
      // get double-tagged.
      //
      // Skip verb defaults entirely for nominal-shaped cards (case/gender
      // markers in the raw text, no person/tense markers). The set's
      // label may legitimately mention a verb mood (e.g.
      // "Indefinite constructions (ἄν + subjunctive)") while individual
      // cards in the set are conjunctions / relative pronouns — those
      // shouldn't inherit subjunctive as their parse.
      let raw = rawAnswer;
      const isNominalCard = /\b(nom\.?|acc\.?|gen\.?|dat\.?|voc\.?|nominative|accusative|genitive|dative|vocative|masc\.?|fem\.?|neut\.?|masculine|feminine|neuter)\b/i.test(raw)
        && !/\b(1st|2nd|3rd|first|second|third)\s+(person|sg\.?|pl\.?|singular|plural)\b/i.test(raw)
        && !/\b(present|future|imperfect|aorist|perfect|pluperfect|indicative|subjunctive|imperative|infinitive|participle|active|middle|passive)\b/i.test(raw);
      if (!isNominalCard) {
        if (defaults.tense && !/\b(present|future|imperfect|aorist|perfect|pluperfect)\b/i.test(raw)) {
          raw = `${defaults.tense} ${raw}`;
        }
        // Per-lemma voice-by-tense fallback. Applied before the set-level
        // voice default so multi-tense sets (e.g. εἰμί present/future/
        // imperfect, each with its own voice) tag each card correctly.
        // Reads tense from the raw text (which now includes any defaulted
        // tense from above) and looks it up against LEMMA_VOICE_BY_TENSE.
        const lemmaKey = extractLemma(set.label) || '';
        const lemmaVoiceMap = LEMMA_VOICE_BY_TENSE[lemmaKey];
        if (lemmaVoiceMap && !/\b(active|middle|passive|middle\/passive)\b/i.test(raw)) {
          const tenseInText = raw.toLowerCase().match(/\b(present|future|imperfect|aorist|perfect|pluperfect)\b/);
          const lemmaVoice = tenseInText ? lemmaVoiceMap[tenseInText[0]] : null;
          if (lemmaVoice) raw = `${lemmaVoice} ${raw}`;
        }
        if (defaults.voice && !/\b(active|middle|passive|middle\/passive)\b/i.test(raw)) {
          raw = `${defaults.voice} ${raw}`;
        }
        if (defaults.mood && !/\b(indicative|subjunctive|imperative|infinitive|participle)\b/i.test(raw)) {
          raw = `${defaults.mood} ${raw}`;
        }
      }
      const answer = canonicalizeAnswer(raw);
      if (!answer) return;
      const gloss = extractCardGloss(card);
      seenForms.add(form);
      questions.push({ form, answer, gloss });
    });

    if (questions.length < 2) return null;
    const distinctAnswers = new Set(questions.map((q) => q.answer));
    if (distinctAnswers.size < 2) return null;

    const lemma = extractLemma(set.label) || key;
    const gloss = extractLemmaGloss(set);
    return {
      label: set.label || key,
      week: set.week ?? null,
      items: [
        {
          family: set.label || key,
          lemma,
          gloss,
          questions
        }
      ]
    };
  }

  function shouldGenerate(key, set) {
    const raw = String(key || '');
    // Limit to weekly paradigm sets (W1_*, W2_*, ...). W*O are general
    // supplemental vocab without paradigm parsing — skip them.
    if (!/^W\d+_/.test(raw)) return false;
    const morphSets = window.MORPHOLOGY_SETS;
    if (morphSets && morphSets[raw]) return false; // already provided
    // Skip non-paradigm teaching sets — "constructions" / "usage" sets
    // contain conjunctions and multi-word patterns rather than declined
    // forms, and shouldn't show up as parsing cards.
    const label = String(set && set.label || '').toLowerCase();
    if (/\b(construction|constructions|usage)\b/.test(label)) return false;
    return true;
  }

  const vocabSets = window.SUPPLEMENTAL_VOCAB_SETS || {};
  Object.keys(vocabSets).forEach((key) => {
    if (!shouldGenerate(key, vocabSets[key])) return;
    const morphSet = buildMorphologyForSet(key, vocabSets[key]);
    if (!morphSet) return;
    window.registerSupplementalMorphologySet(key, morphSet);
  });
})();
