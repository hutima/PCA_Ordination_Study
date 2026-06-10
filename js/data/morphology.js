(function () {
  const MORPHOLOGY_SETS = {
    "2": {
      label: "Chapter 2 Morphology",
      notes: "Definite article and second-declension masculine endings",
      items: [
        {
          family: "Definite article",
          lemma: "ὁ, ἡ, τό",
          gloss: "the",
          questions: [
            { form: "ὁ", answer: "nominative singular masculine" },
            { form: "τοῦ", answer: "genitive singular masculine/neuter" },
            { form: "τῷ", answer: "dative singular masculine/neuter" },
            { form: "τόν", answer: "accusative singular masculine" },
            { form: "οἱ", answer: "nominative plural masculine" },
            { form: "τῶν", answer: "genitive plural (all genders)" },
            { form: "τοῖς", answer: "dative plural masculine/neuter" },
            { form: "τούς", answer: "accusative plural masculine" },
            { form: "ἡ", answer: "nominative singular feminine" },
            { form: "τῆς", answer: "genitive singular feminine" },
            { form: "τῇ", answer: "dative singular feminine" },
            { form: "τήν", answer: "accusative singular feminine" },
            { form: "αἱ", answer: "nominative plural feminine" },
            { form: "ταῖς", answer: "dative plural feminine" },
            { form: "τάς", answer: "accusative plural feminine" },
            { form: "τό", answer: "nominative/accusative singular neuter" },
            { form: "τά", answer: "nominative/accusative plural neuter" }
          ]
        },
        {
          family: "Second declension masculine",
          lemma: "λόγος",
          gloss: "word, message",
          questions: [
            { form: "λόγος", answer: "nominative singular masculine" },
            { form: "λόγου", answer: "genitive singular masculine" },
            { form: "λόγῳ", answer: "dative singular masculine" },
            { form: "λόγον", answer: "accusative singular masculine" },
            { form: "λόγοι", answer: "nominative plural masculine" },
            { form: "λόγων", answer: "genitive plural masculine" },
            { form: "λόγοις", answer: "dative plural masculine" },
            { form: "λόγους", answer: "accusative plural masculine" }
          ]
        }
      ]
    },
    "3": {
      label: "Chapter 3 Morphology",
      notes: "First-declension feminine and second-declension neuter endings",
      items: [
        {
          family: "First declension feminine (eta pattern)",
          lemma: "φωνή",
          gloss: "voice, sound",
          questions: [
            { form: "φωνή", answer: "nominative singular feminine" },
            { form: "φωνῆς", answer: "genitive singular feminine" },
            { form: "φωνῇ", answer: "dative singular feminine" },
            { form: "φωνήν", answer: "accusative singular feminine" },
            { form: "φωναί", answer: "nominative plural feminine" },
            { form: "φωνῶν", answer: "genitive plural feminine" },
            { form: "φωναῖς", answer: "dative plural feminine" },
            { form: "φωνάς", answer: "accusative plural feminine" }
          ]
        },
        {
          family: "First declension feminine (alpha pattern)",
          lemma: "ἁμαρτία",
          gloss: "sin",
          questions: [
            { form: "ἁμαρτία", answer: "nominative singular feminine" },
            { form: "ἁμαρτίας", answer: "genitive singular feminine" },
            { form: "ἁμαρτίᾳ", answer: "dative singular feminine" },
            { form: "ἁμαρτίαν", answer: "accusative singular feminine" },
            { form: "ἁμαρτίαι", answer: "nominative plural feminine" },
            { form: "ἁμαρτιῶν", answer: "genitive plural feminine" },
            { form: "ἁμαρτίαις", answer: "dative plural feminine" },
            { form: "ἁμαρτίας", answer: "accusative plural feminine" }
          ]
        },
        {
          family: "Second declension neuter",
          lemma: "ἔργον",
          gloss: "work, deed",
          questions: [
            { form: "ἔργον", answer: "nominative/accusative singular neuter" },
            { form: "ἔργου", answer: "genitive singular neuter" },
            { form: "ἔργῳ", answer: "dative singular neuter" },
            { form: "ἔργα", answer: "nominative/accusative plural neuter" },
            { form: "ἔργων", answer: "genitive plural neuter" },
            { form: "ἔργοις", answer: "dative plural neuter" }
          ]
        }
      ]
    }
  };

  function localShuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function stableMorphKey(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .toLowerCase()
      .replace(/^-+|-+$/g, '');
  }

  function pickDistractors(correctAnswer, preferredPool, fallbackPool) {
    const distractors = [];
    const seen = new Set([correctAnswer]);

    const pushFrom = (pool) => {
      for (const item of localShuffle(pool)) {
        if (seen.has(item)) continue;
        seen.add(item);
        distractors.push(item);
        if (distractors.length >= 3) break;
      }
    };

    pushFrom(preferredPool);
    if (distractors.length < 3) pushFrom(fallbackPool);

    return distractors.slice(0, 3);
  }

  function parseParadigmKey(key) {
    const match = String(key).match(/^(.+)::(grammar|morph)::(\d+)$/);
    if (!match) return { baseKey: String(key), type: null, itemIdx: null };
    return { baseKey: match[1], type: match[2], itemIdx: Number(match[3]) };
  }

  function resolveMorphologySelection(key) {
    const selection = parseParadigmKey(key);
    if (selection.type && selection.type !== 'morph') return null;
    const set = MORPHOLOGY_SETS[selection.baseKey];
    if (!set) return null;
    const items = Number.isInteger(selection.itemIdx) ? [set.items[selection.itemIdx]] : set.items;
    return { ...selection, set, items: items.filter(Boolean) };
  }

  function buildMorphologyCardsForKeys(keys) {
    const selected = (keys || []).map(String);
    const selections = selected.map(resolveMorphologySelection).filter(Boolean);
    const allAnswers = [];
    const allForms = [];
    selections.forEach((selection) => {
      selection.items.forEach((item) => {
        item.questions.forEach((q) => {
          allAnswers.push(q.answer);
          allForms.push(q.form);
        });
      });
    });

    const cards = [];
    selections.forEach((selection) => {
      selection.items.forEach((item, relativeItemIdx) => {
        const itemIdx = Number.isInteger(selection.itemIdx) ? selection.itemIdx : relativeItemIdx;
        const itemAnswers = item.questions.map((q) => q.answer);
        const itemForms = item.questions.map((q) => q.form);
        // formToAnswer is consumed by the parsing-feedback form lookup
        // (resolveFormForPickedDims). It needs the canonical parse string
        // (q.parsed when supplied), not the human-friendly q.answer that
        // grammar.js cards use for MC display. Falls back to q.answer when
        // no separate canonical is given — that's already the canonical
        // form for paradigm_morphology auto-generated cards.
        const formToAnswer = {};
        item.questions.forEach((q) => { if (q && q.form) formToAnswer[q.form] = q.parsed || q.answer; });
        item.questions.forEach((q, qIdx) => {
          const distractors = pickDistractors(q.answer, itemAnswers, allAnswers);
          const choices = localShuffle([q.answer, ...distractors]);
          const reverseDistractors = pickDistractors(q.form, itemForms, allForms);
          const reverseChoices = localShuffle([q.form, ...reverseDistractors]);
          cards.push({
            id: `morph-${selection.baseKey}-${itemIdx}-${qIdx}-${stableMorphKey(item.lemma)}-${stableMorphKey(q.form)}-${stableMorphKey(q.answer)}`,
            kind: 'morph',
            required: true,
            sourceKey: String(selection.baseKey),
            sourceLabel: selection.set.label,
            supplemental: !!selection.set.supplemental,
            chapter: Number(selection.baseKey),
            family: item.family,
            lemma: q.lemma || item.lemma,
            gloss: q.gloss || item.gloss,
            lemmaGloss: item.gloss,
            form: q.form,
            prompt: q.prompt || 'Parse this form.',
            // dimensional=false marks cards that aren't parsing drills (e.g.
            // stem-change recall: "what is the aorist of βάλλω?"). The
            // step-by-step renderer detects this and falls back to a simple
            // MC layout instead of trying to decompose a Greek form into
            // parsing dimensions.
            dimensional: q.dimensional !== false,
            context: q.context || '',
            note: q.note || '',
            answer: q.answer,
            // Canonical parse string used by parseAnswerDimensions for the
            // step builder + form lookup. When a grammar.js question's
            // human-friendly answer omits dimensions (e.g.
            // "1st singular ('I am')" with no tense/voice/mood), supply a
            // canonical `parsed:` next to it. Defaults to answer.
            parsedAnswer: q.parsed || q.answer,
            choices,
            reversible: q.reversible !== false,
            reversePrompt: q.reversePrompt || 'Choose the correct Greek form.',
            reverseChoices,
            formToAnswer
          });
        });
      });
    });

    return cards;
  }

  function getMorphologyCountForKey(key) {
    const set = MORPHOLOGY_SETS[String(key)];
    if (!set) return 0;
    return set.items.reduce((sum, item) => sum + item.questions.length, 0);
  }

  window.MORPHOLOGY_SETS = MORPHOLOGY_SETS;
  window.buildMorphologyCardsForKeys = buildMorphologyCardsForKeys;
  window.getMorphologyCountForKey = getMorphologyCountForKey;
})();

