// ═══════════════════════════════════════════════════════════════════════
//  GRAMMAR DATA — Elementary New Testament Greek (Wycliffe WYB1513YY)
// ═══════════════════════════════════════════════════════════════════════
//  Consolidated grammar drills covering textbook chapters 1–20 and the
//  eight lecture-week supplements (W1O–W8O). Multiple-choice only.
//  Forms are stored explicitly rather than generated, to keep accents
//  and endings honest.
//
//  Replaces three previous files:
//    js/data/grammar.js         (first-pass)
//    js/data/grammar_extra.js   (second-pass additions)
//    js/data/grammar_focus.js   (third-pass focused drills)
//
//  Card-shape contract (consumed by app.js / pos_logic.js):
//    {
//      id:        string   (regenerated each session)
//      kind:      'morph'  (multiple-choice prompt)
//      required:  true
//      sourceKey: string   ("1"–"20" or "W1O"–"W8O")
//      sourceLabel, chapter, family, lemma, gloss,
//      form, prompt, context, note, answer, choices[]
//    }
//
//  Each `questions[].choices` array is canonical here; the builder
//  shuffles it (and dedupes the answer) before returning.
// ═══════════════════════════════════════════════════════════════════════

(function () {

  // ───────────────────────────────────────────────────────────────────
  //  CHAPTER GRAMMAR — textbook chapters 1 through 20
  // ───────────────────────────────────────────────────────────────────
  const CHAPTER_GRAMMAR = {

    // ─────────────────────────────────────────────────────────────
    "1": {
      label: "Chapter 1 Grammar",
      notes: "Alphabet, breathings, diphthongs, iota subscript",
      items: [
        {
          family: "Alphabet — letter recognition",
          lemma: "Greek alphabet",
          gloss: "letter names",
          questions: [
            { form: "α", prompt: "Which letter is this?", answer: "alpha",
              choices: ["alpha", "lambda", "delta", "eta"] },
            { form: "β", prompt: "Which letter is this?", answer: "beta",
              choices: ["beta", "theta", "delta", "rho"] },
            { form: "γ", prompt: "Which letter is this?", answer: "gamma",
              choices: ["gamma", "tau", "rho", "upsilon"] },
            { form: "δ", prompt: "Which letter is this?", answer: "delta",
              choices: ["delta", "alpha", "lambda", "omega"] },
            { form: "ε", prompt: "Which letter is this?", answer: "epsilon",
              choices: ["epsilon", "eta", "iota", "omicron"] },
            { form: "ζ", prompt: "Which letter is this?", answer: "zeta",
              choices: ["zeta", "xi", "sigma", "psi"] },
            { form: "η", prompt: "Which letter is this?", answer: "eta",
              choices: ["eta", "epsilon", "nu", "iota"] },
            { form: "θ", prompt: "Which letter is this?", answer: "theta",
              choices: ["theta", "omicron", "phi", "beta"] },
            { form: "λ", prompt: "Which letter is this?", answer: "lambda",
              choices: ["lambda", "alpha", "delta", "gamma"] },
            { form: "ξ", prompt: "Which letter is this?", answer: "xi",
              choices: ["xi", "zeta", "psi", "chi"] },
            { form: "π", prompt: "Which letter is this?", answer: "pi",
              choices: ["pi", "tau", "nu", "gamma"] },
            { form: "ρ", prompt: "Which letter is this?", answer: "rho",
              choices: ["rho", "pi", "tau", "phi"] },
            { form: "σ", prompt: "Which letter is this (medial form)?", answer: "sigma",
              choices: ["sigma", "final sigma", "xi", "zeta"] },
            { form: "ς", prompt: "Which letter-form is this?", answer: "final sigma",
              choices: ["final sigma", "sigma", "xi", "psi"],
              note: "Final sigma (ς) is used at the end of a word; medial sigma (σ) elsewhere." },
            { form: "φ", prompt: "Which letter is this?", answer: "phi",
              choices: ["phi", "psi", "theta", "chi"] },
            { form: "χ", prompt: "Which letter is this?", answer: "chi",
              choices: ["chi", "phi", "psi", "kappa"] },
            { form: "ψ", prompt: "Which letter is this?", answer: "psi",
              choices: ["psi", "phi", "xi", "chi"] },
            { form: "ω", prompt: "Which letter is this?", answer: "omega",
              choices: ["omega", "omicron", "upsilon", "eta"] }
          ]
        },
        {
          family: "Breathings",
          lemma: "rough vs smooth",
          gloss: "rough vs smooth breathing",
          questions: [
            { form: "ὁ", prompt: "What does the rough breathing over a vowel indicate?",
              answer: "an initial 'h' sound",
              choices: ["an initial 'h' sound", "no extra sound", "a long vowel", "an accent"],
              note: "Every word starting with a vowel takes either a rough breathing (with an 'h' sound, as in ὁ) or a smooth breathing (no 'h', as in ἀ)." },
            { form: "ἀ", prompt: "What does the smooth breathing over a vowel indicate?",
              answer: "no additional sound",
              choices: ["no additional sound", "an 'h' sound", "an accent", "a long vowel"] },
            { form: "ῥ", prompt: "Which breathing does an initial rho always take?",
              answer: "rough",
              choices: ["rough", "smooth", "either", "neither — rho is a consonant"],
              note: "An initial ρ in Greek always takes the rough breathing." }
          ]
        },
        {
          family: "Diphthongs and iota subscript",
          lemma: "diphthongs",
          gloss: "two vowels in one syllable",
          questions: [
            { form: "αι", prompt: "How is the diphthong αι usually pronounced in the academic system used here?",
              answer: "approximately like 'ai' in 'aisle'",
              choices: ["approximately like 'ai' in 'aisle'", "like 'ay' in 'day'", "like 'ee' in 'see'", "like 'oy' in 'boy'"] },
            { form: "ει", prompt: "How is the diphthong ει usually pronounced in the academic system used here?",
              answer: "approximately like 'ei' in 'eight'",
              choices: ["approximately like 'ei' in 'eight'", "approximately like 'ai' in 'aisle'", "like 'oy' in 'boy'", "like 'oo' in 'food'"] },
            { form: "ου", prompt: "How is the diphthong ου pronounced (academic)?",
              answer: "like 'oo' in 'food'",
              choices: ["like 'oo' in 'food'", "like 'ow' in 'cow'", "like 'oy' in 'boy'", "like 'ee' in 'see'"] },
            { form: "ᾳ ῃ ῳ", prompt: "What is the small ι written under these vowels called?",
              answer: "iota subscript",
              choices: ["iota subscript", "iota adscript", "smooth breathing", "circumflex"],
              note: "Silent in pronunciation but it usually marks the dative singular of long-vowel stems." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "2": {
      label: "Chapter 2 Grammar",
      notes: "Basic sentences — present tense of λύω and -έω verbs, nominative & accusative cases, definite article (formation and special uses)",
      items: [
        {
          family: "2.1 Present Tense of λύω",
          lemma: "λύω",
          gloss: "I untie",
          questions: [
            { form: "λύεις", prompt: "Parse this verb form.",
              answer: "present active indicative, 2nd singular",
              choices: [
                "present active indicative, 1st singular",
                "present active indicative, 2nd singular",
                "present active indicative, 3rd singular",
                "present active indicative, 2nd plural"
              ] },
            { form: "λύομεν", prompt: "Parse this verb form.",
              answer: "present active indicative, 1st plural",
              choices: [
                "present active indicative, 1st plural",
                "present active indicative, 2nd plural",
                "present active indicative, 3rd plural",
                "present active indicative, 1st singular"
              ] },
            { form: "λύουσι(ν)", prompt: "Parse this verb form.",
              answer: "present active indicative, 3rd plural",
              choices: [
                "present active indicative, 3rd plural",
                "present active indicative, 3rd singular",
                "present active indicative, 1st plural",
                "present active indicative, 2nd plural"
              ] },
            { form: "βλέπει",
              prompt: "Parse this verb form.",
              answer: "present active indicative, 3rd singular ('he/she/it sees')",
              choices: [
                "present active indicative, 3rd singular ('he/she/it sees')",
                "present active indicative, 2nd singular",
                "present active indicative, 3rd plural",
                "present active indicative, 1st singular"
              ],
              note: "-ει is the standard 3rd-singular ending on the present active indicative." },
            { form: "ὁ ἄνθρωπος ἀκούει τὸν λόγον.",
              prompt: "Translate.",
              answer: "the man hears the word",
              choices: [
                "the man hears the word",
                "the word hears the man",
                "we hear the word",
                "the men hear the word"
              ],
              note: "ἀκούει is 3rd singular ('he/she/it hears'); ὁ ἄνθρωπος is nom. sg. (subject), τὸν λόγον is acc. sg. (direct object)." }
          ]
        },
        {
          family: "2.2 Present Tense of -έω Verbs (φιλέω)",
          lemma: "φιλέω",
          gloss: "I love (contract verb)",
          questions: [
            { form: "φιλέω → φιλῶ",
              prompt: "Why does the lexical form φιλέω appear in the text as φιλῶ?",
              answer: "the stem-final ε contracts with the personal-ending vowel: ε + ω → ῶ",
              choices: [
                "the stem-final ε contracts with the personal-ending vowel: ε + ω → ῶ",
                "the ε is silent and simply dropped",
                "the ε turns into η before all endings",
                "φιλῶ is a separate verb unrelated to φιλέω"
              ],
              note: "Lexicon shows the uncontracted form (φιλέω); running text always shows the contracted form (φιλῶ)." },
            { form: "φιλεῖ",
              prompt: "Parse this verb form.",
              answer: "present active indicative, 3rd singular ('he/she/it loves')",
              choices: [
                "present active indicative, 3rd singular ('he/she/it loves')",
                "present active indicative, 2nd singular",
                "present active indicative, 3rd plural",
                "present active indicative, 1st singular"
              ],
              note: "ε + ει → ει: φιλέ-ει → φιλεῖ. The circumflex marks the contraction." },
            { form: "ποιοῦμεν",
              prompt: "Parse this contract verb form.",
              answer: "present active indicative, 1st plural ('we do/make')",
              choices: [
                "present active indicative, 1st plural ('we do/make')",
                "present active indicative, 1st singular",
                "present active indicative, 2nd plural",
                "present active indicative, 3rd plural"
              ],
              note: "ποιέ-ομεν → ποιοῦμεν (ε + ο → ου)." },
            { form: "contraction rule",
              prompt: "When an ε-contract verb meets an ending beginning with ε, what is the result?",
              answer: "ε + ε → ει",
              choices: [
                "ε + ε → ει",
                "ε + ε → η",
                "ε + ε → α",
                "ε + ε → ε (no change)"
              ] },
            { form: "ὁ θεὸς φιλεῖ τὸν κόσμον.",
              prompt: "Translate.",
              answer: "God loves the world",
              choices: [
                "God loves the world",
                "the world loves God",
                "we love the world",
                "God will love the world"
              ],
              note: "φιλεῖ is the contracted present 3rd sg. of φιλέω (φιλέ-ει → φιλεῖ)." }
          ]
        },
        {
          family: "2.3 Nominative and Accusative Cases",
          lemma: "case functions",
          gloss: "subject vs direct object",
          questions: [
            { form: "ὁ ἀπόστολος βλέπει τὸν ἄνθρωπον.",
              prompt: "Which word is the subject?",
              answer: "ὁ ἀπόστολος",
              choices: ["ὁ ἀπόστολος", "βλέπει", "τὸν ἄνθρωπον", "the verb supplies it"],
              note: "The nominative case marks the subject. ὁ (nom. sg. masc. article) flags it." },
            { form: "βλέπει τὸν ἄνθρωπον.",
              prompt: "Without an explicit nominative noun, where is the subject?",
              answer: "in the verb ending (3rd singular)",
              choices: ["in the verb ending (3rd singular)", "in τὸν ἄνθρωπον", "the sentence has no subject", "in the article τόν"],
              note: "Greek finite verbs encode person and number, so an explicit pronoun is often omitted unless needed for emphasis, contrast, or clarity." },
            { form: "the direct object",
              prompt: "Which Greek case typically marks the direct object?",
              answer: "accusative",
              choices: ["accusative", "nominative", "genitive", "dative"],
              note: "ὁ ἀπόστολος ἀκούει τὸν λόγον = 'The apostle hears the word' — τὸν λόγον is accusative." },
            { form: "ὁ δοῦλος βλέπει τὸν κύριον.",
              prompt: "Translate.",
              answer: "the slave sees the lord",
              choices: [
                "the slave sees the lord",
                "the lord sees the slave",
                "the slaves see the lord",
                "the slave hears the lord"
              ],
              note: "Case endings tell you who acts (nom. δοῦλος) and who is acted on (acc. κύριον), not word order." }
          ]
        },
        {
          family: "2.4 The Definite Article",
          lemma: "ὁ, ἡ, τό",
          gloss: "the",
          questions: [
            { form: "ὁ", prompt: "Identify this article form.",
              answer: "nominative singular masculine",
              choices: ["nominative singular masculine", "nominative singular feminine", "accusative singular masculine", "genitive singular masculine"] },
            { form: "τόν", prompt: "Identify this article form.",
              answer: "accusative singular masculine",
              choices: ["accusative singular masculine", "nominative singular masculine", "genitive singular masculine", "dative singular masculine"] },
            { form: "οἱ", prompt: "Identify this article form.",
              answer: "nominative plural masculine",
              choices: ["nominative plural masculine", "nominative singular masculine", "dative plural masculine", "accusative plural masculine"] },
            { form: "article function",
              prompt: "Beyond meaning 'the', what does the article tell you about a noun?",
              answer: "its gender, number, and case",
              choices: [
                "its gender, number, and case",
                "only its gender",
                "only its number",
                "its tense and voice"
              ],
              note: "The article is the single most reliable signpost for parsing a noun phrase." },
            { form: "οἱ ἄγγελοι ἀκούουσι τοὺς λόγους.",
              prompt: "Translate.",
              answer: "the angels hear the words",
              choices: [
                "the angels hear the words",
                "the angel hears the words",
                "the words hear the angels",
                "the angels speak the words"
              ],
              note: "οἱ … τούς are masc. pl. articles (nom. and acc.). The article fixes gender, number, and case of each noun." }
          ]
        },
        {
          family: "2.5 Special Uses of the Definite Article",
          lemma: "ὁ θεός, ἡ ἀγάπη",
          gloss: "abstract / generic / proper",
          questions: [
            { form: "ὁ θεός",
              prompt: "Greek often uses the article with a proper name like θεός. How is it rendered into English?",
              answer: "usually as 'God' (without 'the') — Greek uses the article more freely than English",
              choices: [
                "usually as 'God' (without 'the') — Greek uses the article more freely than English",
                "always as 'the god', preserving the article like a common noun",
                "as 'a god', indefinitely — Greek's article never marks a proper concept",
                "the article forces a different word entirely, like θεοτής"
              ],
              note: "ὁ Παῦλος = 'Paul', ὁ Πέτρος = 'Peter' — Greek is happy to article-mark personal names." },
            { form: "ἡ ἀγάπη",
              prompt: "Why does Greek put the article on an abstract noun like ἀγάπη ('love')?",
              answer: "to mark it as a concept — English usually drops the article",
              choices: [
                "to mark it as a concept — English usually drops the article",
                "to make it definite, like English 'the love'",
                "because abstract nouns are always plural in Greek",
                "to mark possession"
              ] },
            { form: "ὁ ἄνθρωπος (generic)",
              prompt: "In a maxim like ὁ ἄνθρωπος ἀδελφὸς ἐστιν, what does ὁ ἄνθρωπος mean?",
              answer: "'a human being / mankind' — generic / categorical use of the article",
              choices: [
                "'a human being / mankind' — generic / categorical use of the article",
                "'the man' — referring to one specific person",
                "'this man' — demonstrative force (ὁ as a near demonstrative)",
                "'his man' — possessive force (ὁ standing in for αὐτοῦ)"
              ],
              note: "Greek often uses the article generically where English would drop it or use 'a'." },
            { form: "anarthrous noun",
              prompt: "When a Greek noun appears WITHOUT the article, what does that typically signal?",
              answer: "indefiniteness ('a / some'), or that the noun is qualitative ('Greek-ness, divinity')",
              choices: [
                "indefiniteness ('a / some'), or that the noun is qualitative ('Greek-ness, divinity')",
                "definiteness — Greek normally drops the article on definite nouns",
                "always 'the' — Greek nouns are definite by default",
                "the noun is a verb, not a noun"
              ],
              note: "Compare: θεὸς ἦν ὁ λόγος = 'the Word was God' (qualitative) vs ὁ θεός = 'God' (the one specific God)." },
            { form: "ὁ θεὸς διδάσκει τὸν ἄνθρωπον.",
              prompt: "Translate.",
              answer: "God teaches the man",
              choices: [
                "God teaches the man",
                "a god teaches a man",
                "the God teaches the man",
                "the man teaches God"
              ],
              note: "Greek uses ὁ on proper-concept nouns (ὁ θεός = 'God'); English drops the article." }
          ]
        }
      ]
    },


    // ─────────────────────────────────────────────────────────────
    "3": {
      label: "Chapter 3 Grammar",
      notes: "Genitive & dative cases (functions & special uses); feminine and neuter nouns; vocative; Ἰησοῦς; introduction to αὐτός",
      items: [
        {
          family: "3.1 The Genitive and Dative Cases",
          lemma: "genitive / dative",
          gloss: "of / to-for-by",
          questions: [
            { form: "genitive", prompt: "Primary function of the genitive?",
              answer: "possession / source ('of')",
              choices: ["possession / source ('of')", "direct object — the thing acted upon", "subject — the doer of the verb's action", "indirect object"] },
            { form: "dative", prompt: "Primary function of the dative?",
              answer: "indirect object / location / means",
              choices: [
                "indirect object / location / means",
                "subject — the doer of the verb's action", "direct object — the thing acted upon", "possession — 'X belongs to Y'"
              ] },
            { form: "ὁ λόγος τοῦ θεοῦ",
              prompt: "Translate this genitive phrase.",
              answer: "'the word of God' — possession / source",
              choices: [
                "'the word of God' — possession / source",
                "'the word, God' — apposition",
                "'God's word is…' — predicate sentence",
                "'word, O God' — direct address"
              ] },
            { form: "λέγω τῷ ἀδελφῷ",
              prompt: "Translate this dative phrase.",
              answer: "'I speak to the brother' — indirect object",
              choices: [
                "'I speak to the brother' — indirect object",
                "'I speak the brother' — direct object",
                "'I speak about the brother' — source / about",
                "'the brother speaks' — subject"
              ] },
            { form: "ὁ λόγος τοῦ θεοῦ.",
              prompt: "Translate.",
              answer: "the word of God",
              choices: [
                "the word of God",
                "the word, O God",
                "God's word is …",
                "God, the word"
              ],
              note: "τοῦ θεοῦ is genitive: possession / source ('of God')." }
          ]
        },
        {
          family: "3.2 Special Uses of the Genitive and Dative",
          lemma: "case functions",
          gloss: "secondary uses",
          questions: [
            { form: "genitive of source",
              prompt: "When a genitive expresses where something COMES FROM, what use is it?",
              answer: "genitive of source / separation ('away from')",
              choices: [
                "genitive of source / separation ('away from')",
                "genitive of possession ('of')",
                "genitive of time ('during')",
                "the indirect-object case (Greek's term for the dative)"
              ],
              note: "Many of the prepositions taught in Ch 4 (ἀπό, ἐκ, παρά) take genitives of source." },
            { form: "the bare dative",
              prompt: "How is the bare dative often used to express HOW something is done?",
              answer: "dative of means / instrument — 'by, with, by means of'",
              choices: [
                "dative of means / instrument — 'by, with, by means of'",
                "as the direct object — the dative takes the role of the accusative",
                "as a vocative of address — 'O thing, by which …!'",
                "as a genitive of possession — the doer is the owner of the means"
              ],
              note: "λόγῳ = 'by a word'; πίστει = 'by faith'." },
            { form: "dative of location",
              prompt: "What special use does the dative have for WHERE something happens?",
              answer: "dative of place / location — 'in, at'",
              choices: [
                "dative of place / location — 'in, at'",
                "always requires the preposition εἰς",
                "always requires the preposition ἀπό",
                "Greek never uses bare dative for location"
              ],
              note: "Often reinforced with ἐν + dat. in NT Greek (introduced in Ch 4)." },
            { form: "ἐν τῇ καρδίᾳ",
              prompt: "Identify the case and function.",
              answer: "dative — location ('in the heart')",
              choices: [
                "dative — location ('in the heart')",
                "genitive — possession ('of the heart')",
                "accusative — direct object ('the heart')",
                "nominative — subject ('the heart [is]')"
              ] },
            { form: "λέγει τῷ ἀδελφῷ.",
              prompt: "Translate.",
              answer: "he speaks to the brother",
              choices: [
                "he speaks to the brother",
                "he speaks the brother",
                "he speaks about the brother",
                "the brother speaks"
              ],
              note: "τῷ ἀδελφῷ is dative — here the indirect object of λέγει ('to the brother')." }
          ]
        },
        {
          family: "3.3 Feminine and Neuter Nouns",
          lemma: "1st-decl fem & 2nd-decl neut",
          gloss: "two new noun patterns",
          questions: [
            { form: "-η nouns",
              prompt: "What gender are 1st-declension nouns ending in -η in the nominative singular (e.g., ἀγάπη, φωνή, ζωή)?",
              answer: "feminine",
              choices: ["feminine", "masculine", "neuter", "common (M+F)"] },
            { form: "-α nouns",
              prompt: "What gender are most 1st-declension nouns ending in -α (e.g., ἁμαρτία, καρδία, οἰκία)?",
              answer: "feminine",
              choices: ["feminine", "neuter", "masculine", "always common gender"] },
            { form: "-ον nouns",
              prompt: "What gender are 2nd-declension nouns ending in -ον (e.g., ἔργον, τέκνον, βιβλίον)?",
              answer: "neuter",
              choices: ["neuter", "masculine", "feminine", "no gender pattern"] },
            { form: "τὰ ἔργα γίνεται",
              prompt: "Why does a neuter plural subject like τὰ ἔργα ('the works') take a SINGULAR verb (γίνεται 'happens')?",
              answer: "neuter plural subjects regularly take a singular verb in Greek",
              choices: [
                "neuter plural subjects regularly take a singular verb in Greek",
                "the verb is a typo for γίνονται",
                "ἔργα is actually singular here",
                "Greek verbs don't agree with subjects"
              ],
              note: "A reliable Greek rule: τὰ τέκνα ἔρχεται 'the children come' (sg. verb)." },
            { form: "ἡ φωνὴ τοῦ ἀγγέλου.",
              prompt: "Translate.",
              answer: "the voice of the angel",
              choices: [
                "the voice of the angel",
                "the angel's voices",
                "the voice, O angel",
                "the angel hears the voice"
              ],
              note: "ἡ φωνή is 1st-decl. feminine in -η; τοῦ ἀγγέλου is 2nd-decl. masc. gen. sg." }
          ]
        },
        {
          family: "3.4 The Vocative",
          lemma: "vocative",
          gloss: "case of direct address",
          questions: [
            { form: "vocative",
              prompt: "Function of the vocative?",
              answer: "direct address — calling out to someone",
              choices: ["direct address — calling out to someone", "subject — the doer of the verb's action", "direct object — the thing acted upon", "possession — 'X belongs to Y'"] },
            { form: "κύριε",
              prompt: "What is the form κύριε?",
              answer: "vocative singular ('Lord!') — from κύριος",
              parsed: "vocative singular masculine",
              choices: [
                "vocative singular ('Lord!') — from κύριος",
                "nominative singular ('the Lord')",
                "dative singular ('to the Lord')",
                "accusative singular ('the Lord' direct object)"
              ],
              note: "Most 2nd-decl masc nouns form vocative singular by replacing -ος with -ε." },
            { form: "vocative vs nominative",
              prompt: "How is the vocative distinguished from the nominative most of the time?",
              answer: "for many nouns the forms are identical — context disambiguates",
              choices: [
                "for many nouns the forms are identical — context disambiguates",
                "vocative always carries a circumflex accent",
                "vocative always lacks the article",
                "vocative is always plural"
              ],
              note: "Plural vocative is always identical to plural nominative." },
            { form: "ἀδελφοί",
              prompt: "Translate this vocative form.",
              answer: "'Brothers!' — direct address (form identical to the nominative plural)",
              parsed: "vocative plural masculine",
              choices: [
                "'Brothers!' — direct address (form identical to the nominative plural)",
                "'of the brothers' — possession",
                "'to the brothers' — indirect object",
                "'the brothers' — direct object"
              ] },
            { form: "κύριε, ἀκούεις τὸν λόγον.",
              prompt: "Translate.",
              answer: "Lord, you hear the word",
              choices: [
                "Lord, you hear the word",
                "the Lord hears the word",
                "O word, you hear the Lord",
                "Lord, hear the word!"
              ],
              note: "κύριε is vocative — direct address. ἀκούεις is the regular 2nd sg. ('you hear'), not a command." }
          ]
        },
        {
          family: "3.5 Ἰησοῦς",
          lemma: "Ἰησοῦς",
          gloss: "Jesus — irregular declension",
          questions: [
            { form: "Ἰησοῦς declension",
              prompt: "Why is Ἰησοῦς irregular?",
              answer: "it is a hellenised Hebrew name (Yeshua), so its cases don't follow the standard 2nd-decl pattern",
              choices: [
                "it is a hellenised Hebrew name (Yeshua), so its cases don't follow the standard 2nd-decl pattern",
                "it is a 3rd-declension consonant-stem noun, declined like σάρξ, σαρκός",
                "it never changes form — indeclinable like Ἀβραάμ or Δαυίδ",
                "it follows the 1st-declension feminine pattern in -ας, like ἡμέρα"
              ] },
            { form: "Ἰησοῦν",
              prompt: "Parse this form of Ἰησοῦς.",
              answer: "accusative singular — direct object 'Jesus'",
              parsed: "accusative singular masculine",
              choices: [
                "accusative singular — direct object 'Jesus'",
                "genitive singular — 'of Jesus'",
                "dative singular — 'to/for Jesus'",
                "vocative singular — 'Jesus!'"
              ] },
            { form: "Ἰησοῦ",
              prompt: "Which case(s) does the form Ἰησοῦ cover?",
              answer: "genitive, dative, and vocative",
              parsed: "genitive/dative/vocative singular masculine",
              choices: [
                "genitive, dative, and vocative",
                "only the genitive",
                "only the dative",
                "only the vocative"
              ],
              note: "Only the nominative (Ἰησοῦς) and accusative (Ἰησοῦν) are visually distinct." },
            { form: "βλέπω τὸν Ἰησοῦν.",
              prompt: "Translate.",
              answer: "I see Jesus",
              choices: [
                "I see Jesus",
                "Jesus sees",
                "Jesus sees me",
                "we see Jesus"
              ],
              note: "Ἰησοῦν is the accusative of Ἰησοῦς — its irregular declension is Ἰησοῦς, Ἰησοῦ (gen./dat./voc.), Ἰησοῦν (acc.)." }
          ]
        },
        {
          family: "3.6 αὐτός — introduction",
          lemma: "αὐτός, -ή, -ό",
          gloss: "he, she, it (3rd-person pronoun)",
          questions: [
            { form: "αὐτός — basic use",
              prompt: "What is the most common, basic use of αὐτός in NT Greek?",
              answer: "as the 3rd-person pronoun ('he, she, it, they') in its oblique cases — gen., dat., acc.",
              choices: [
                "as the 3rd-person pronoun ('he, she, it, they') in its oblique cases — gen., dat., acc.",
                "always as the demonstrative 'this' — αὐτός is just another form of οὗτος",
                "always as a possessive ('my, your, his') — like ἐμός or σός",
                "always as the article 'the' — αὐτός is a third form of the definite article"
              ],
              note: "Deeper uses (emphatic, identifying) are introduced in Ch 9." },
            { form: "αὐτοῦ",
              prompt: "Translate.",
              answer: "'of him / his' — genitive singular masculine",
              choices: [
                "'of him / his' — genitive singular masculine",
                "'to him' — dative singular masculine",
                "'him' — accusative singular masculine",
                "'self' — emphatic nominative"
              ] },
            { form: "αὐτοῖς",
              prompt: "Parse and translate.",
              answer: "dative plural masc./neut. — 'to/for them'",
              choices: [
                "dative plural masc./neut. — 'to/for them'",
                "genitive plural — 'of them'",
                "accusative plural — 'them'",
                "nominative plural — 'they themselves'"
              ] },
            { form: "αὐτός declension",
              prompt: "Which endings does αὐτός take?",
              answer: "standard 2-1-2 (adjective) endings — like καλός, καλή, καλόν",
              choices: [
                "standard 2-1-2 (adjective) endings — like καλός, καλή, καλόν",
                "3rd-declension endings throughout — masc. / fem. / neut. all on a consonant stem",
                "indeclinable — the feminine never changes form across cases",
                "the same forms as the article — αὐτός is essentially a stressed form of ὁ, ἡ, τό"
              ] },
            { form: "βλέπει αὐτόν.",
              prompt: "Translate.",
              answer: "he sees him",
              choices: [
                "he sees him",
                "he sees himself",
                "he sees them",
                "he sees her"
              ],
              note: "αὐτόν is masc. acc. sg. — the 3rd-person pronoun in an oblique case." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "4": {
      label: "Chapter 4 Grammar",
      notes: "Prepositions (basic and multi-case), compound verbs, questions, and negatives",
      items: [
        {
          family: "4.1 Basic Prepositions",
          lemma: "ἐν, εἰς, ἐκ, ἀπό, σύν, πρός",
          gloss: "single-case prepositions",
          questions: [
            { form: "ἐν", prompt: "Which case does ἐν take?", answer: "dative",
              choices: ["nominative", "genitive", "dative", "accusative"],
              note: "ἐν + dative: 'in', 'within', 'among'." },
            { form: "εἰς", prompt: "Which case does εἰς take?", answer: "accusative",
              choices: ["nominative", "genitive", "dative", "accusative"],
              note: "εἰς + accusative: 'into', 'to' — motion or goal." },
            { form: "ἐκ / ἐξ", prompt: "Which case does ἐκ (ἐξ before vowels) take?",
              answer: "genitive",
              choices: ["nominative", "genitive", "dative", "accusative"],
              note: "'out of', 'from'." },
            { form: "ἀπό", prompt: "Which case does ἀπό take?", answer: "genitive",
              choices: ["nominative", "genitive", "dative", "accusative"],
              note: "'from' — separation, source." },
            { form: "σύν", prompt: "Which case does σύν take?", answer: "dative",
              choices: ["nominative", "genitive", "dative", "accusative"],
              note: "'with' (association). Distinguish from μετά + gen. ('with')." },
            { form: "πρός", prompt: "Which case does πρός most commonly take in the NT?",
              answer: "accusative",
              choices: ["nominative", "genitive", "dative", "accusative"],
              note: "'to', 'toward'." },
            { form: "ἀκούω τοὺς λόγους ἐν τῷ ἱερῷ.",
              prompt: "Translate.",
              answer: "I hear the words in the temple",
              choices: [
                "I hear the words in the temple",
                "I hear the temple in the words",
                "I hear words about the temple",
                "I am heard in the temple"
              ],
              note: "ἐν + dative = 'in / within'." }
          ]
        },
        {
          family: "4.2 More Prepositions (multi-case)",
          lemma: "διά, μετά, κατά, ἐπί, παρά, περί, ὑπό, ὑπέρ",
          gloss: "case shifts the meaning",
          questions: [
            { form: "διά + genitive", prompt: "διά + genitive means…",
              answer: "through (means or agency)",
              choices: ["through (means or agency)", "because of, on account of", "with", "into"] },
            { form: "διά + accusative", prompt: "διά + accusative means…",
              answer: "because of, on account of",
              choices: ["because of, on account of", "through (means or agency)", "with", "after"] },
            { form: "μετά + genitive", prompt: "μετά + genitive means…",
              answer: "with (in company with)",
              choices: ["with (in company with)", "after (in time)", "into", "by means of"] },
            { form: "μετά + accusative", prompt: "μετά + accusative means…",
              answer: "after (in time)",
              choices: ["after (in time)", "with (in company with)", "before", "instead of (substitution — like ἀντί + gen.)"] },
            { form: "κατά + accusative", prompt: "κατά + accusative means…",
              answer: "according to",
              choices: ["according to", "down from", "with", "before"],
              note: "κατὰ Μᾶρκον = 'according to Mark'." },
            { form: "κατά + genitive", prompt: "κατά + genitive means…",
              answer: "down from / against",
              choices: ["down from / against", "according to", "with", "into"] },
            { form: "ἐπί + accusative", prompt: "ἐπί + accusative means…",
              answer: "onto, to (motion toward)",
              choices: ["onto, to (motion toward)", "on (location)", "on the basis of", "against"] },
            { form: "ἐπί + genitive", prompt: "ἐπί + genitive means…",
              answer: "on, upon (location)",
              choices: ["on, upon (location)", "onto (motion)", "on the basis of", "after"] },
            { form: "ἐπί + dative", prompt: "ἐπί + dative means…",
              answer: "on the basis of / at",
              choices: ["on the basis of / at", "onto (motion)", "on, upon (location)", "against"] },
            { form: "παρά + genitive", prompt: "παρά + genitive means…",
              answer: "from beside (source, often of a person)",
              choices: ["from beside (source, often of a person)", "alongside (motion toward, as with πρός + acc.)", "beside (static location, as with παρά + dat.)", "instead of (substitution — like ἀντί + gen.)"] },
            { form: "παρά + dative", prompt: "παρά + dative means…",
              answer: "beside, at (with a person)",
              choices: ["beside, at (with a person)", "alongside (motion toward, as with πρός + acc.)", "from beside", "on behalf of"] },
            { form: "περί + genitive", prompt: "περί + genitive means…",
              answer: "concerning, about (topic)",
              choices: ["concerning, about (topic)", "around (location)", "on behalf of", "through"],
              note: "Mnemonic: gen. = 'about the topic'; acc. = 'around the place'." },
            { form: "περί + accusative", prompt: "περί + accusative means…",
              answer: "around, about (location/approx.)",
              choices: ["around, about (location/approx.)", "concerning, about (topic)", "after", "by"] },
            { form: "ἐκβάλλει τὸν δοῦλον διὰ τοῦ λόγου.",
              prompt: "Translate.",
              answer: "he casts out the slave through the word",
              choices: [
                "he casts out the slave through the word",
                "he casts out the slave because of the word",
                "he casts out the word through the slave",
                "the slave is cast out by the word"
              ],
              note: "διά + genitive = 'through' (means / agency)." }
          ]
        },
        {
          family: "4.3 Compound Verbs",
          lemma: "ἐκβάλλω, ἀπολύω, παρακαλέω",
          gloss: "preposition + verb",
          questions: [
            { form: "compound verb",
              prompt: "What is a 'compound verb' in Greek?",
              answer: "a verb formed by prefixing a preposition onto a simple verb stem",
              choices: [
                "a verb formed by prefixing a preposition onto a simple verb stem",
                "a verb with two distinct stems welded together at the boundary",
                "any irregular verb — irregular forms are by definition compound",
                "a verb taking two direct objects, like English 'give X to Y'"
              ],
              note: "ἐκβάλλω = ἐκ ('out') + βάλλω ('I throw') = 'I throw out / drive out'." },
            { form: "ἐκβάλλω",
              prompt: "Analyse this compound verb.",
              answer: "ἐκ ('out of') + βάλλω ('I throw') → 'I drive/throw out'",
              choices: [
                "ἐκ ('out of') + βάλλω ('I throw') → 'I drive/throw out'",
                "ἐκ ('out of') + καλέω ('I call') → 'I call out'",
                "ἐκ ('out of') + λύω ('I untie') → 'I unbind'",
                "a single simplex verb, no prefix"
              ] },
            { form: "ἀπολύω",
              prompt: "Analyse this compound verb.",
              answer: "ἀπό ('away') + λύω ('I untie') → 'I release, dismiss, divorce'",
              choices: [
                "ἀπό ('away') + λύω ('I untie') → 'I release, dismiss, divorce'",
                "ἀπό ('away') + λέγω ('I say') → 'I refuse'",
                "a simplex verb meaning 'I worship'",
                "ἀπό ('away') + λαμβάνω → 'I receive'"
              ] },
            { form: "elision before vowel",
              prompt: "Why is κατοικέω (κατά + οἰκέω) spelt with a single α, not κατά-οἰκέω?",
              answer: "the final vowel of the prefix elides before the initial vowel of the stem (and rough breathing may aspirate the consonant)",
              choices: [
                "the final vowel of the prefix elides before the initial vowel of the stem (and rough breathing may aspirate the consonant)",
                "Greek hates double vowels and drops the second one whenever they meet at a morpheme boundary",
                "κατά always loses its accent when prefixed; only its first consonant survives",
                "the spelling is irregular for every compound and must be memorised case by case"
              ],
              note: "κατά + οἰκέω → κατοικέω; ἀπό + ἔρχομαι → ἀπέρχομαι." },
            { form: "ἀπολύει τοὺς δούλους.",
              prompt: "Translate.",
              answer: "he releases the slaves",
              choices: [
                "he releases the slaves",
                "he unties himself from the slaves",
                "the slaves are released",
                "he leads away the slaves"
              ],
              note: "ἀπολύω = ἀπό ('away from') + λύω ('loose') = 'release, set free, dismiss'." }
          ]
        },
        {
          family: "4.4 Questions",
          lemma: "πῶς, ποῦ, τίς, question mark",
          gloss: "asking questions in Greek",
          questions: [
            { form: "πῶς",
              prompt: "Translate.",
              answer: "'how?'",
              choices: ["'how?'", "'where?'", "'when?'", "'why?'"] },
            { form: "ποῦ",
              prompt: "Translate.",
              answer: "'where?'",
              choices: ["'where?'", "'how?'", "'when?'", "'why?'"],
              note: "Mind the accent: enclitic που = 'somewhere'." },
            { form: "Greek question mark",
              prompt: "What punctuation marks a question in printed Greek?",
              answer: "the semicolon-shaped mark (·;·) — a raised dot/semicolon at sentence end",
              choices: [
                "the semicolon-shaped mark (·;·) — a raised dot/semicolon at sentence end",
                "the English question mark (?)",
                "no punctuation — only word order signals questions",
                "the Greek full stop (·)"
              ] },
            { form: "neutral yes/no question",
              prompt: "How is a neutral yes-or-no question marked (no slant either way)?",
              answer: "by intonation and the question mark",
              choices: [
                "by intonation and the question mark",
                "always with οὐ at the head",
                "always with μή at the head",
                "always with ἆρα at the head"
              ],
              note: "οὐ at the head expects 'yes'; μή at the head expects 'no' — those slanted forms are revisited in Ch 10." },
            { form: "πῶς ἀκούουσι τὸν λόγον;",
              prompt: "Translate.",
              answer: "how do they hear the word?",
              choices: [
                "how do they hear the word?",
                "where do they hear the word?",
                "they hear the word.",
                "why do they hear the word?"
              ],
              note: "πῶς ('how?') opens a content question; the raised dot/semicolon (·;·) closes it." }
          ]
        },
        {
          family: "4.5 Negatives",
          lemma: "οὐ, οὐκ, οὐχ",
          gloss: "'not' in Greek",
          questions: [
            { form: "οὐ / οὐκ / οὐχ",
              prompt: "When do you use each of οὐ, οὐκ, οὐχ?",
              answer: "οὐ + cons.; οὐκ + smooth-breathing vowel; οὐχ + rough-breathing vowel",
              choices: [
                "οὐ + cons.; οὐκ + smooth-breathing vowel; οὐχ + rough-breathing vowel",
                "they are interchangeable — pick any of the three regardless of context",
                "οὐ is the singular form; οὐκ is the plural form (and οὐχ the dual)",
                "οὐχ is used with the article; οὐ / οὐκ only on verbs"
              ],
              note: "οὐ βλέπει / οὐκ ἀκούει / οὐχ ὁρᾷ — pick the form that matches what follows." },
            { form: "οὐ position",
              prompt: "Where does οὐ normally stand in relation to the verb it negates?",
              answer: "immediately before the verb",
              choices: [
                "immediately before the verb",
                "after the verb",
                "at the end of the clause",
                "anywhere — position is free"
              ],
              note: "οὐ λέγω = 'I am not speaking'." },
            { form: "οὐκ ἀκούει",
              prompt: "Translate.",
              answer: "'he/she/it does not hear' — οὐκ before a smooth-breathing vowel (ἀ)",
              choices: [
                "'he/she/it does not hear' — οὐκ before a smooth-breathing vowel (ἀ)",
                "'he hears' — οὐκ is enclitic and means 'truly'",
                "'they do not hear' — οὐκ marks plural",
                "'he was not hearing' — οὐκ marks a former state"
              ] },
            { form: "οὐ βλέπει τὸν Χριστόν.",
              prompt: "Translate.",
              answer: "he does not see Christ",
              choices: [
                "he does not see Christ",
                "Christ does not see him",
                "he sees no one",
                "he is not Christ"
              ],
              note: "οὐ stands immediately before the verb it negates." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "5": {
      label: "Chapter 5 Grammar",
      notes: "Adjectives — formation, attributive/predicative/substantive use; εἰμί and its special uses; πολύς & μέγας; word order",
      items: [
        {
          family: "5.1 Formation of Adjectives",
          lemma: "ἀγαθός, -ή, -όν",
          gloss: "2-1-2 endings",
          questions: [
            { form: "2-1-2 pattern",
              prompt: "Most Greek adjectives follow the '2-1-2' pattern. What does that mean?",
              answer: "masculine = 2nd decl., feminine = 1st decl., neuter = 2nd decl. (e.g., καλός, καλή, καλόν)",
              choices: [
                "masculine = 2nd decl., feminine = 1st decl., neuter = 2nd decl. (e.g., καλός, καλή, καλόν)",
                "masc. = 2nd decl., fem. = 2nd decl., neut. = 1st decl. (one mismatch)",
                "all three genders use the 1st declension (every Greek adjective is feminine-like)",
                "all three genders use the 2nd declension, no feminine pattern"
              ] },
            { form: "agreement",
              prompt: "An adjective agrees with its noun in which categories?",
              answer: "case, gender, and number",
              choices: [
                "case, gender, and number",
                "person, number, and tense",
                "voice, mood, and aspect",
                "only gender and number"
              ] },
            { form: "ἡ καλὴ φωνή",
              prompt: "Why does καλή end in -η here?",
              answer: "to agree with φωνή (nom. sg. fem.)",
              choices: [
                "to agree with φωνή (nom. sg. fem.)",
                "all -η endings are dative",
                "adjectives default to feminine",
                "to mark the predicate position"
              ] },
            { form: "2-2 adjectives",
              prompt: "Some adjectives (like αἰώνιος) have only TWO endings (-ος, -ον). What does that mean?",
              answer: "masc. and fem. share -ος; only neuter is -ον",
              choices: [
                "masc. and fem. share -ος; only neuter is -ον",
                "they have no gender at all",
                "they fix as masculine no matter the noun",
                "they are indeclinable"
              ],
              note: "ζωὴ αἰώνιος = 'eternal life' (αἰώνιος used for fem. ζωή — no separate αἰωνία form)." },
            { form: "ὁ ἀγαθὸς ἄνθρωπος ἀκούει.",
              prompt: "Translate.",
              answer: "the good man hears",
              choices: [
                "the good man hears",
                "the man is good",
                "the good (one) hears",
                "good is the man"
              ],
              note: "ἀγαθός agrees with ἄνθρωπος in case, gender, and number (nom. sg. masc.)." }
          ]
        },
        {
          family: "5.2 Attributive Position",
          lemma: "ἀγαθός in attributive position",
          gloss: "'the good X'",
          questions: [
            { form: "ὁ ἀγαθὸς λόγος",
              prompt: "What position is ἀγαθός in?",
              answer: "attributive (article–adj–noun)",
              choices: [
                "attributive (article–adj–noun)",
                "attributive (article–noun–article–adj)",
                "predicate",
                "substantive"
              ] },
            { form: "ὁ λόγος ὁ ἀγαθός",
              prompt: "What position is ἀγαθός in?",
              answer: "attributive (article–noun–article–adj)",
              choices: [
                "attributive (article–noun–article–adj)",
                "attributive (article–adj–noun)",
                "predicate",
                "substantive"
              ],
              note: "Both attributive patterns mean 'the good word'. The repeated article is the giveaway." },
            { form: "ὁ πιστὸς δοῦλος",
              lemma: "πιστός in attributive position",
              gloss: "'the faithful X'",
              prompt: "How should this attributive phrase be translated?",
              answer: "'the faithful servant'",
              choices: [
                "'the faithful servant'",
                "'the servant is faithful'",
                "'the faithful one'",
                "'O faithful servant!'"
              ],
              note: "Article–adj–noun: attributive. The adjective is inside the article phrase, sharing it with the noun." },
            { form: "ὁ δοῦλος ὁ πιστός.",
              lemma: "πιστός in attributive position",
              gloss: "'the faithful X'",
              prompt: "Translate.",
              answer: "the faithful slave",
              choices: [
                "the faithful slave",
                "the slave is faithful",
                "a faithful slave",
                "the slaves, the faithful ones"
              ],
              note: "Article-noun-article-adjective = attributive (the adj. shares the noun's article phrase)." }
          ]
        },
        {
          family: "5.3 εἰμί — I Am",
          lemma: "εἰμί",
          gloss: "I am",
          questions: [
            { form: "εἰμί", prompt: "Identify this form.", answer: "1st singular ('I am')",
              parsed: "present active indicative first person singular",
              choices: ["1st singular ('I am')", "3rd singular ('he/she/it is')", "1st plural ('we are')", "2nd singular ('you are')"] },
            { form: "ἐστίν", prompt: "Identify this form.", answer: "3rd singular ('he/she/it is')",
              parsed: "present active indicative third person singular",
              choices: ["3rd singular ('he/she/it is')", "2nd singular ('you are')", "3rd plural ('they are')", "1st singular ('I am')"] },
            { form: "εἰσίν", prompt: "Identify this form.", answer: "3rd plural ('they are')",
              parsed: "present active indicative third person plural",
              choices: ["3rd plural ('they are')", "3rd singular ('he/she/it is')", "2nd plural ('you all are')", "1st plural ('we are')"] },
            { form: "εἰμί",
              prompt: "What kind of verb is εἰμί syntactically?",
              answer: "an equative (linking) verb — both sides are nominative",
              choices: [
                "an equative (linking) verb — both sides are nominative",
                "a transitive verb — takes a direct object in the accusative",
                "an action verb — the subject performs an action on something",
                "an impersonal verb"
              ],
              note: "After εἰμί the predicate noun stays in the nominative: ὁ θεὸς ἀγάπη ἐστίν." },
            { form: "ὁ Ἰησοῦς ἐστιν ὁ Χριστός.",
              prompt: "Translate.",
              answer: "Jesus is the Christ",
              choices: [
                "Jesus is the Christ",
                "Jesus is a Christ",
                "Christ is Jesus' (own)",
                "Jesus has the Christ"
              ],
              note: "εἰμί links two nominatives — ὁ Ἰησοῦς (subject) and ὁ Χριστός (predicate nom.)." }
          ]
        },
        {
          family: "5.4 Predicate Position",
          lemma: "ἀγαθός in predicate position",
          gloss: "'X is good'",
          questions: [
            { form: "ὁ λόγος ἀγαθός",
              prompt: "What position is ἀγαθός in, and how do you translate?",
              answer: "predicate — 'the word is good'",
              choices: [
                "predicate — 'the word is good'",
                "attributive — 'the good word'",
                "substantive — 'the good thing'",
                "vocative — 'O good word!'"
              ],
              note: "Predicate position: the adjective lacks its own article. εἰμί is often implied." },
            { form: "ἀγαθὸς ὁ λόγος",
              prompt: "What position is ἀγαθός in?",
              answer: "predicate",
              choices: ["predicate", "attributive (adj–noun)", "attributive (noun–adj)", "substantive"] },
            { form: "πιστὸς ὁ θεός",
              prompt: "How should this be translated?",
              answer: "'God is faithful'",
              choices: [
                "'God is faithful'",
                "'the faithful God'",
                "'a faithful God'",
                "'O faithful God!'"
              ],
              note: "Anarthrous adj. + arthrous noun = predicate. ἐστίν is understood." },
            { form: "ἀγαθὸς ὁ λόγος.",
              prompt: "Translate.",
              answer: "the word is good",
              choices: [
                "the word is good",
                "the good word",
                "good — O word!",
                "the word, the good (one)"
              ],
              note: "Anarthrous adjective + arthrous noun = predicate ('the word IS good'). ἐστίν is understood." }
          ]
        },
        {
          family: "5.5 Adjectives as Nouns (Substantive)",
          lemma: "ὁ ἀγαθός, τὰ ἀγαθά",
          gloss: "article + adjective = noun",
          questions: [
            { form: "ὁ ἀγαθός",
              prompt: "What does this likely mean (no noun expressed)?",
              answer: "'the good [man]' — substantive use",
              choices: [
                "'the good [man]' — substantive use",
                "'the good word'",
                "'good is …' (predicate)",
                "an attributive adjective with the noun lost"
              ] },
            { form: "τὰ ἀγαθά",
              prompt: "What does this typically mean?",
              answer: "'the good things' — neuter pl. substantive",
              choices: [
                "'the good things' — neuter pl. substantive",
                "'the good women' — feminine plural substantive use",
                "'good is the …' — a fragment with the noun omitted",
                "a vocative form — 'O good ones!' in direct address"
              ],
              note: "Neuter plural substantives often refer to abstractions or 'things'." },
            { form: "οἱ πιστοί",
              prompt: "What does this likely mean (no noun expressed)?",
              answer: "'the faithful [people]' — masculine plural substantive",
              choices: [
                "'the faithful [people]' — masculine plural substantive",
                "'the faithful things' — neuter plural substantive",
                "'they are faithful' — predicate",
                "'O faithful ones!' — vocative"
              ],
              note: "Article + adj. with no noun = substantive use; gender and number signal what kind of person/thing." },
            { form: "οἱ πιστοὶ ἀκούουσι τὸν λόγον.",
              prompt: "Translate.",
              answer: "the faithful (people) hear the word",
              choices: [
                "the faithful (people) hear the word",
                "the faithful word hears",
                "the faithful things hear the word",
                "they hear the faithful word"
              ],
              note: "Article + adj. with no noun = substantive: masc. pl. 'the faithful ones / believers'." }
          ]
        },
        {
          family: "5.6 πολύς and μέγας",
          lemma: "πολύς πολλή πολύ / μέγας μεγάλη μέγα",
          gloss: "irregular adjectives — much/great",
          questions: [
            { form: "πολύς, πολλή, πολύ",
              prompt: "Translate and note the unusual feature.",
              answer: "'much, many' — short stem (πολυ-) in nom./acc. sg. masc./neut.; long stem (πολλ-) elsewhere",
              choices: [
                "'much, many' — short stem (πολυ-) in nom./acc. sg. masc./neut.; long stem (πολλ-) elsewhere",
                "'many' — fully regular 2-1-2 adjective like καλός, with no stem alternation",
                "'many' — indeclinable, the same form πολύς for every case and gender",
                "'many' — 3rd-declension endings everywhere, like a σ-stem adjective"
              ],
              note: "Memorise the three short forms: πολύς (nom. sg. m.), πολύ (nom./acc. sg. n.), πολύν (acc. sg. m.). Everything else uses πολλ-." },
            { form: "μέγας, μεγάλη, μέγα",
              prompt: "Translate and note the unusual feature.",
              answer: "'large, great' — short stem (μέγα-) in nom./acc. sg. masc./neut.; long stem (μεγαλ-) elsewhere",
              choices: [
                "'large, great' — short stem (μέγα-) in nom./acc. sg. masc./neut.; long stem (μεγαλ-) elsewhere",
                "'great' — fully regular 2-1-2 like καλός, καλή, καλόν, with no irregular stems",
                "'great' — indeclinable in the singular; uses regular endings only in the plural",
                "'great' — 3rd-declension endings throughout (σ-stem, like ἀληθής, -ές)"
              ],
              note: "Short forms: μέγας (m. nom. sg.), μέγαν (m. acc. sg.), μέγα (n. nom./acc. sg.). All other forms add -αλ-." },
            { form: "πολλὰ τέκνα",
              prompt: "Translate.",
              answer: "'many children' (πολλά agrees with the neuter plural τέκνα)",
              choices: [
                "'many children' (πολλά agrees with the neuter plural τέκνα)",
                "'great children' (πολλά reads as μεγάλα by lexical substitution, like in 5.6.3)",
                "'much, a child' (πολλά standing alone, with no noun to agree with)",
                "'the children are many' (πολλά in predicate position, the verb ἐστιν understood)"
              ] },
            { form: "πολὺς ὄχλος βλέπει τὸν Ἰησοῦν.",
              prompt: "Translate.",
              answer: "a large crowd sees Jesus",
              choices: [
                "a large crowd sees Jesus",
                "many crowds see Jesus",
                "Jesus sees the large crowd",
                "the great Jesus sees the crowd"
              ],
              note: "πολύς (masc. nom. sg.) uses the short stem; agrees with ὄχλος." }
          ]
        },
        {
          family: "5.7 Word Order in Greek Sentences",
          lemma: "Greek word order",
          gloss: "S-V-O is normal but flexible",
          questions: [
            { form: "Greek word order",
              prompt: "How rigid is Greek word order compared to English?",
              answer: "much freer — case endings carry the syntax",
              choices: ["much freer — case endings carry the syntax", "identical to English (SVO)", "always verb-final", "always verb-first"] },
            { form: "default order",
              prompt: "What is the most common, unmarked order of subject, verb and object in NT Greek?",
              answer: "subject – verb – object (SVO), but it varies freely; verb-first is also common",
              choices: [
                "subject – verb – object (SVO), but it varies freely; verb-first is also common",
                "subject – object – verb (SOV) — always",
                "verb – subject – object (VSO) — always",
                "no preferred order — random shuffle in every sentence"
              ] },
            { form: "fronting for emphasis",
              prompt: "When a Greek author moves a noun to the FRONT of its clause, what is the usual effect?",
              answer: "emphasis or topic-marking on that word",
              choices: [
                "emphasis or topic-marking on that word",
                "it is a grammatical error",
                "no change in meaning — order is invisible",
                "the noun's case shifts to nominative"
              ],
              note: "πάντα δι’ αὐτοῦ ἐγένετο = 'ALL things came into being through him' — πάντα fronted for stress." },
            { form: "τὸν θεὸν ἀκούει ὁ ἄνθρωπος.",
              prompt: "Translate, capturing the fronted emphasis.",
              answer: "God — the man hears him",
              choices: [
                "God — the man hears him",
                "the man hears God",
                "God hears the man",
                "the man hears about God"
              ],
              note: "Fronted accusative τὸν θεόν signals emphasis ('it is God that the man hears'). Cases (not order) carry the syntax." }
          ]
        },
        {
          family: "5.8 Special Uses of εἰμί",
          lemma: "εἰμί",
          gloss: "'there is', possession, idioms",
          questions: [
            { form: "εἰμί = 'there is/are'",
              prompt: "What does ἐστίν / εἰσίν typically mean when fronted with no obvious subject?",
              answer: "'there is / there are' — existential use of εἰμί",
              choices: [
                "'there is / there are' — existential use of εἰμί",
                "'he/she/it is' — equative use, with a hidden subject",
                "'he/she/it is going' — εἰμί is suddenly motion-verb",
                "'he/she/it possesses' — εἰμί can mean 'have'"
              ],
              note: "ἔστιν ἄνθρωπος = 'there is a man (who…)'. The accent on ἔστιν is the giveaway for the existential sense." },
            { form: "εἰμί + dative of possession",
              prompt: "How does Greek often express 'X has Y' using εἰμί?",
              answer: "'Y (nom.) is to X (dat.)' — dative of possession",
              choices: [
                "'Y (nom.) is to X (dat.)' — dative of possession",
                "always uses ἔχω directly",
                "uses the genitive of the possessor",
                "uses ὑπό + gen."
              ],
              note: "ἔστιν αὐτῷ τέκνον = 'there is a child to him' = 'he has a child'." },
            { form: "predicate nominative",
              prompt: "After εἰμί, what case is the predicate noun in?",
              answer: "nominative — εἰμί links two nominatives",
              choices: [
                "nominative — εἰμί links two nominatives",
                "accusative — the predicate is a direct object",
                "genitive — the predicate is possessive",
                "dative — the predicate is indirect"
              ],
              note: "ὁ θεὸς ἀγάπη ἐστίν = 'God is love' — both ὁ θεός and ἀγάπη are nominative." },
            { form: "ἐστὶν ἄγγελος ἐν τῷ οἴκῳ.",
              prompt: "Translate.",
              answer: "there is an angel in the house",
              choices: [
                "there is an angel in the house",
                "the angel is the house",
                "the angel has a house",
                "he is an angel in the house"
              ],
              note: "Fronted ἔστιν (with accent) = existential 'there is / there are'." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "6": {
      label: "Chapter 6 Grammar",
      notes: "The tenses — idea, distinguishing forms, meaning, endings, augment, σ-suffix, prefix+suffix combos, and -έω verb tenses",
      items: [
        {
          family: "6.1 The Idea of Tenses",
          lemma: "tense",
          gloss: "time AND aspect",
          questions: [
            { form: "tense encodes",
              prompt: "What does a Greek tense encode, beyond English-style time reference?",
              answer: "aspect (ongoing vs whole) — and, in the indicative, time",
              choices: [
                "aspect (ongoing vs whole) — and, in the indicative, time",
                "only time — Greek tense is identical to English tense",
                "only person and number",
                "only the lexical meaning of the verb"
              ] },
            { form: "five basic indicative tenses",
              prompt: "Which five tense systems are introduced in this chapter for the indicative?",
              answer: "present, imperfect, future, aorist, perfect (the perfect comes properly in Ch 16)",
              choices: [
                "present, imperfect, future, aorist, perfect (the perfect comes properly in Ch 16)",
                "only present and aorist — Greek introduces other tenses much later",
                "only the present and the imperfect — Greek lacks a future or aorist",
                "only the future and the aorist — the present was introduced earlier"
              ] },
            { form: "tense outside the indicative",
              prompt: "When tense appears outside the indicative mood, what does it convey?",
              answer: "aspect only — no time reference",
              choices: [
                "aspect only — no time reference",
                "both aspect and absolute time",
                "voice only",
                "person and number — the tense form encodes who/how many"
              ],
              note: "Outside the indicative, the tense form encodes aspect (ongoing vs. whole), not absolute time. Returns more fully in later chapters." },
            { form: "ἔγραφον τὸν λόγον.",
              prompt: "Translate, capturing the aspect.",
              answer: "I was writing the word (ongoing past)",
              choices: [
                "I was writing the word (ongoing past)",
                "I wrote the word (simple past)",
                "I write the word (ongoing present)",
                "I will write the word (future)"
              ],
              note: "Imperfect = past time + imperfective (ongoing) aspect. Aorist would give the simple-past sense." }
          ]
        },
        {
          family: "6.2 Distinguishing the Tenses",
          lemma: "tense markers",
          gloss: "what to look for first",
          questions: [
            { form: "λύω",
              prompt: "What tense is this (in isolation)?",
              answer: "present (active indicative, 1st sg.)",
              choices: ["present (active indicative, 1st sg.)", "future (active indicative, 1st sg.)", "imperfect (1st sg.)", "aorist active indicative (1st sg., σα-morpheme between stem and ending)"],
              note: "Present and future 1st singular forms differ by the σ: λύω vs λύσω." },
            { form: "λύσω",
              prompt: "What tense is this?",
              answer: "future (active indicative, 1st sg.)",
              choices: ["future (active indicative, 1st sg.)", "present active indicative (1st sg., primary endings, no augment)", "aorist active indicative (1st sg., with augment + σα)", "imperfect (1st sg.)"],
              note: "σ before the personal ending = future (or 1st aorist with augment)." },
            { form: "ἔλυον",
              prompt: "What tense is this?",
              answer: "imperfect active indicative (1st sg. or 3rd pl.)",
              choices: ["imperfect active indicative (1st sg. or 3rd pl.)", "aorist active indicative (1st sg., σα-morpheme between stem and ending)", "present active indicative (1st sg., primary endings, no augment)", "future active indicative (1st sg., σ between stem and primary endings)"],
              note: "ε- augment + present stem + secondary endings = imperfect." },
            { form: "ἔλυσα",
              prompt: "What tense is this?",
              answer: "1st aorist (active indicative, 1st sg.)",
              choices: ["1st aorist (active indicative, 1st sg.)", "imperfect (1st sg.)", "present active indicative (1st sg., primary endings, no augment)", "future active indicative (1st sg., σ between stem and primary endings)"],
              note: "ε- augment + σα + secondary endings = 1st aorist." },
            { form: "ἔλυσα τὸν δοῦλον.",
              prompt: "Translate.",
              answer: "I untied the slave",
              choices: [
                "I untied the slave",
                "I am untying the slave",
                "I will untie the slave",
                "I had untied the slave"
              ],
              note: "Augment ἐ- + stem + σ + α + secondary endings = aorist active 1st sg." }
          ]
        },
        {
          family: "6.3 The Meaning of the Tenses",
          lemma: "aspect of each tense",
          gloss: "ongoing vs whole vs neutral",
          questions: [
            { form: "present aspect",
              prompt: "Which Greek tense is most strongly associated with imperfective aspect (ongoing/process)?",
              answer: "the present (and the imperfect in past time)",
              choices: [
                "the present (and the imperfect in past time)",
                "the aorist",
                "the imperfect alone (never the present)",
                "the future"
              ],
              note: "Imperfective aspect views the action from inside, as in progress." },
            { form: "aorist aspect",
              prompt: "Which Greek tense is most strongly associated with perfective aspect (whole event as a single point)?",
              answer: "the aorist",
              choices: ["the aorist", "the present", "the future", "the imperfect"],
              note: "Perfective aspect views the action from outside as a complete whole — not necessarily 'punctiliar'." },
            { form: "future aspect",
              prompt: "Which Greek tense is aspectually neutral / underdetermined for aspect?",
              answer: "the future",
              choices: ["the future", "the aorist", "the imperfect", "the present"],
              note: "The future locates an event in later time but does not commit to imperfective or perfective viewpoint." },
            { form: "βαπτίζει τὸν λαόν.",
              prompt: "Translate.",
              answer: "he is baptizing the people",
              choices: [
                "he is baptizing the people",
                "he baptized the people",
                "he will baptize the people",
                "the people baptize him"
              ],
              note: "Present indicative carries imperfective aspect: ongoing or characteristic action." }
          ]
        },
        {
          family: "6.4 The Endings",
          lemma: "primary vs secondary endings",
          gloss: "personal endings tell person + number",
          questions: [
            { form: "primary endings",
              prompt: "Which tenses use PRIMARY personal endings (typified by -ω, -εις, -ει, -ομεν, -ετε, -ουσι)?",
              answer: "present and future (non-past indicatives)",
              choices: [
                "present and future (non-past indicatives)",
                "imperfect and aorist (past indicatives)",
                "only the present",
                "all tenses use the same endings"
              ] },
            { form: "secondary endings",
              prompt: "Which tenses use SECONDARY personal endings (typified by -ον, -ες, -ε, -ομεν, -ετε, -ον)?",
              answer: "imperfect and aorist (past indicatives)",
              choices: [
                "imperfect and aorist (past indicatives)",
                "present and future — the primary (non-past) indicative endings",
                "only the future — the future uses its own dedicated set",
                "only the present — every other tense reuses present endings"
              ],
              note: "Secondary endings appear with the augment in past-time indicatives." },
            { form: "ending tells",
              prompt: "What information do the personal endings encode?",
              answer: "person and number",
              choices: [
                "person and number",
                "only tense — person is supplied by context",
                "only mood — person comes from the subject pronoun",
                "only gender — person/number are unmarked"
              ] },
            { form: "λύομεν τοὺς δούλους.",
              prompt: "Translate (mind the personal ending).",
              answer: "we untie the slaves",
              choices: [
                "we untie the slaves",
                "I untie the slaves",
                "they untie the slaves",
                "you (pl.) untie the slaves"
              ],
              note: "-ομεν is 1st plural; the personal ending tells you who acts." }
          ]
        },
        {
          family: "6.5 The ε- Prefix (Augment)",
          lemma: "ε- augment",
          gloss: "past-time marker",
          questions: [
            { form: "ε- augment",
              prompt: "What does the augment ε- mark on a verb?",
              answer: "past time (in the indicative)",
              choices: [
                "past time (in the indicative)",
                "future time",
                "present time",
                "non-indicative mood"
              ],
              note: "Augment + present stem = imperfect; augment + aorist stem = aorist." },
            { form: "augment",
              prompt: "In which moods does the augment (ε-) appear?",
              answer: "indicative only",
              choices: ["indicative only", "in all moods", "in every past form, regardless of mood", "only on compound verbs"],
              note: "The past-time augment is restricted to the indicative." },
            { form: "vowel-initial augment",
              prompt: "What happens when a verb's stem begins with a vowel and would take an augment (e.g., ἀκούω → past)?",
              answer: "the initial vowel LENGTHENS instead of adding an ε- (ἀκούω → ἤκουον / ἤκουσα)",
              choices: [
                "the initial vowel LENGTHENS instead of adding an ε- (ἀκούω → ἤκουον / ἤκουσα)",
                "an ε- is simply prefixed: ἐ-ἀκούω → ἐακούω",
                "the verb takes no augment",
                "the verb adds a different prefix entirely"
              ],
              note: "α → η, ε → η, ο → ω, etc." },
            { form: "ἀπολύω → ἀπ-έ-λυον",
              prompt: "Where does the augment land on a compound verb like ἀπολύω?",
              answer: "after the prepositional prefix and before the verb stem",
              choices: [
                "after the prepositional prefix and before the verb stem",
                "at the very start of the word, before the prefix",
                "at the end of the verb form",
                "compound verbs never receive an augment"
              ],
              note: "ἀπολύω → ἀπέλυον. The prefix loses its final vowel by elision before the augment." },
            { form: "ἐβλέπομεν τὸν Χριστόν.",
              prompt: "Translate.",
              answer: "we were seeing Christ",
              choices: [
                "we were seeing Christ",
                "we see Christ",
                "we have seen Christ",
                "we will see Christ"
              ],
              note: "Augment ἐ- marks past time in the indicative; here imperfect (ongoing past)." }
          ]
        },
        {
          family: "6.6 The σ-Suffix",
          lemma: "σ in future/aorist",
          gloss: "tense-stem marker",
          questions: [
            { form: "σ-marker",
              prompt: "What does a σ between the verb stem and the ending typically signal?",
              answer: "future or 1st aorist (with augment)",
              choices: [
                "future or 1st aorist (with augment)",
                "imperfect",
                "present indicative",
                "nothing — σ is just a stem letter"
              ] },
            { form: "stop + σ combinations",
              prompt: "When a verb stem ends in a stop consonant and meets the σ-suffix, what happens? (e.g., βλέπω → ?-σω)",
              answer: "labial+σ→ψ; palatal+σ→ξ; dental drops before σ",
              choices: [
                "labial+σ→ψ; palatal+σ→ξ; dental drops before σ",
                "no change — the σ is added directly to the stop",
                "the stop drops in every case",
                "the stop and σ both drop"
              ],
              note: "βλέπω → βλέψω; ἄγω → ἄξω; πείθω → πείσω." },
            { form: "γράψω",
              prompt: "Why is the future of γράφω spelled γράψω?",
              answer: "φ (labial stop) + σ → ψ",
              choices: [
                "φ (labial stop) + σ → ψ",
                "the σ replaces the φ entirely",
                "γράψω is an irregular suppletive future",
                "Greek hates the cluster -φσ-, so the σ drops"
              ] },
            { form: "λύσομεν τὸν δοῦλον.",
              prompt: "Translate.",
              answer: "we will untie the slave",
              choices: [
                "we will untie the slave",
                "we untie the slave",
                "we untied the slave",
                "we have untied the slave"
              ],
              note: "σ between stem and ending (no augment, primary endings) = future." }
          ]
        },
        {
          family: "6.7 Dealing with Prefixes and Suffixes",
          lemma: "augment + stem + σ + ending",
          gloss: "parsing the layered verb",
          questions: [
            { form: "parse layers",
              prompt: "In what order are the morphological layers of a Greek past-tense indicative verb?",
              answer: "augment + (compound prefix if any) + verb stem + (σ if applicable) + personal ending",
              choices: [
                "augment + (compound prefix if any) + verb stem + (σ if applicable) + personal ending",
                "personal ending + augment + stem — the layers stack from right to left",
                "no fixed order — Greek allows any arrangement of prefix, stem, and ending",
                "stem + augment + ending — the augment sits between stem and ending"
              ],
              note: "Compound prefix comes BEFORE the augment in surface form, but the augment is conceptually 'inside': ἀπ-έ-λυσα = ἀπό + ε-augment + λυ + σ + α." },
            { form: "ἔλυσα",
              prompt: "Break down ἔλυσα into its morphological layers.",
              answer: "ε- (augment) + λυ- (stem) + σ (1st-aorist marker) + -α (1sg secondary ending)",
              parsed: "first aorist active indicative first person singular",
              choices: [
                "ε- (augment) + λυ- (stem) + σ (1st-aorist marker) + -α (1sg secondary ending)",
                "ε- (augment) + λυσ- (stem) + -α (ending) — without splitting the σ off",
                "ἔ- (lengthened stem) + -λυσα (one fused ending)",
                "no breakdown — ἔλυσα is an irregular suppletive form"
              ] },
            { form: "parsing strategy",
              prompt: "What is the most efficient first question to ask when parsing an unfamiliar Greek verb form?",
              answer: "is there an augment (ε- or vowel-lengthening)? — that tells you it's a past-tense indicative",
              choices: [
                "is there an augment (ε- or vowel-lengthening)? — that tells you it's a past-tense indicative",
                "guess the verb's English meaning first, then worry about tense afterward",
                "look at the personal ending and ignore the stem — endings tell you everything",
                "look at the accent first — the accent always pinpoints tense / mood"
              ] },
            { form: "ἀπέλυσα τὸν δοῦλον.",
              prompt: "Translate.",
              answer: "I released the slave",
              choices: [
                "I released the slave",
                "I release the slave",
                "I will release the slave",
                "I have released the slave"
              ],
              note: "ἀπο- (prefix) + ε- (augment between prefix and stem) + λυ + σα = aorist of ἀπολύω." }
          ]
        },
        {
          family: "6.8 Tenses in the -έω Verbs",
          lemma: "φιλέω, ποιέω, καλέω",
          gloss: "what happens to the ε in other tenses",
          questions: [
            { form: "ε lengthens",
              prompt: "When an -έω verb forms a tense with a CONSONANT suffix (future σ, aorist σ, perfect κ), what happens to the stem-final ε?",
              answer: "it lengthens to η (φιλέω → φιλήσω, ἐφίλησα, πεφίληκα)",
              choices: [
                "it lengthens to η (φιλέω → φιλήσω, ἐφίλησα, πεφίληκα)",
                "it drops out completely (e.g., φιλέω → φιλσω, no contraction)",
                "it stays as ε in every tense (e.g., φιλέσω, ἐφίλεσα)",
                "it turns into ι, like α + ι in some other contracts"
              ],
              note: "This is one of the most reliable patterns of -έω verbs." },
            { form: "φιλήσω",
              prompt: "Parse this verb form.",
              answer: "future active indicative, 1st sg. of φιλέω ('I will love')",
              choices: [
                "future active indicative, 1st sg. of φιλέω ('I will love')",
                "aorist active indicative, 1st sg.",
                "present active indicative, 1st sg.",
                "perfect active indicative, 1st sg."
              ],
              note: "ε → η before σ; future and 1st aorist both lengthen but augment distinguishes them (φιλήσω vs ἐφίλησα)." },
            { form: "ἐποίησεν",
              prompt: "Parse this verb form.",
              answer: "aorist active indicative, 3rd sg. of ποιέω ('he/she/it made/did')",
              choices: [
                "aorist active indicative, 3rd sg. of ποιέω ('he/she/it made/did')",
                "imperfect active indicative, 3rd sg.",
                "future active indicative, 3rd sg.",
                "perfect active indicative, 3rd sg."
              ],
              note: "ε- augment + ποι- + η (lengthened ε) + σ + ε(ν) = ἐποίησεν." },
            { form: "ἐποίησα τὸ ἔργον.",
              prompt: "Translate.",
              answer: "I did the work",
              choices: [
                "I did the work",
                "I am doing the work",
                "I will do the work",
                "I had done the work"
              ],
              note: "ε-contract verbs lengthen ε → η before σ outside the present (ποιε- → ποιησ-): aorist ἐποίησα." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "7": {
      label: "Chapter 7 Grammar",
      notes: "Moods — the idea, imperatives, infinitives, participles (introduction), and participles used as nouns",
      items: [
        {
          family: "7.1 The Idea of Moods",
          lemma: "mood",
          gloss: "the speaker's portrayal of reality",
          questions: [
            { form: "indicative",
              prompt: "What does the indicative mood typically express?",
              answer: "a statement or question of fact",
              choices: ["a statement or question of fact", "a command", "a wish — 'oh, that he might hear!'", "a potential / contingent action"] },
            { form: "imperative",
              prompt: "What does the imperative mood express?",
              answer: "a command or prohibition",
              choices: ["a command or prohibition", "a fact", "a verbal noun", "a verbal adjective"] },
            { form: "subjunctive",
              prompt: "What does the subjunctive mood express?",
              answer: "a contingent / potential action",
              choices: [
                "a contingent / potential action",
                "a plain statement of fact",
                "a direct command, like the imperative",
                "direct address — 'in order, O hearer!'"
              ] },
            { form: "infinitive vs participle",
              prompt: "What's the categorical difference between an infinitive and a participle?",
              answer: "infinitive = verbal NOUN; participle = verbal ADJECTIVE",
              choices: [
                "infinitive = verbal NOUN; participle = verbal ADJECTIVE",
                "infinitive = verbal adjective; participle = verbal noun",
                "they are interchangeable — Koine collapses the two tenses entirely",
                "both are finite verbs"
              ] },
            { form: "θέλω ἀκούειν τὸν λόγον.",
              prompt: "Translate.",
              answer: "I want to hear the word",
              choices: [
                "I want to hear the word",
                "I hear the word",
                "hear the word!",
                "I will hear the word"
              ],
              note: "θέλω (indicative) governs ἀκούειν (infinitive — verbal noun completing the main verb)." }
          ]
        },
        {
          family: "7.2 The Imperative",
          lemma: "imperative",
          gloss: "commands",
          questions: [
            { form: "λῦε",
              prompt: "What mood is this (2nd sg., addressed to one person)?",
              answer: "imperative",
              parsed: "present active imperative second person singular",
              choices: ["imperative", "indicative", "subjunctive", "infinitive"] },
            { form: "λύετε (imperative)",
              prompt: "What does the imperative λύετε mean?",
              answer: "'Untie!' — 2nd-plural imperative ('you all untie!')",
              choices: [
                "'Untie!' — 2nd-plural imperative ('you all untie!')",
                "'You are untying' — present indicative",
                "'I untie' — 1st singular",
                "'to untie' — infinitive"
              ],
              note: "2nd-plural imperative looks identical to 2nd-plural present indicative; context (and absence of subject) tells you which." },
            { form: "μή + imperative",
              prompt: "How does Greek form a NEGATIVE command ('do not untie!')?",
              answer: "μή + the imperative form (Ch 17 will add a second pattern using the subjunctive)",
              choices: [
                "μή + the imperative form (Ch 17 will add a second pattern using the subjunctive)",
                "οὐ + the imperative form",
                "οὐκ + the indicative form",
                "Greek has no negative imperative"
              ],
              note: "Negative commands use μή, not οὐ — οὐ is reserved for the indicative." },
            { form: "λῦε τὸν δοῦλον.",
              prompt: "Translate.",
              answer: "untie the slave!",
              choices: [
                "untie the slave!",
                "you are untying the slave",
                "he unties the slave",
                "to untie the slave"
              ],
              note: "λῦε is 2nd sg. present active imperative — direct command." }
          ]
        },
        {
          family: "7.3 The Infinitive",
          lemma: "infinitive",
          gloss: "verbal noun",
          questions: [
            { form: "λύειν",
              prompt: "What is this form?",
              answer: "present active infinitive",
              choices: ["present active infinitive", "present active indicative, 2nd sg.", "present active imperative, 2nd sg.", "present active indicative, 3rd sg."] },
            { form: "infinitive function",
              prompt: "What's the most basic function of a Greek infinitive?",
              answer: "to complete another verb's idea ('TO do …')",
              choices: [
                "to complete another verb's idea ('TO do …')",
                "to ask a question",
                "to issue a command directly",
                "to negate the main verb"
              ],
              note: "θέλω λύειν = 'I want to loose'. The infinitive complements θέλω." },
            { form: "infinitive endings",
              prompt: "Which of these is a giveaway infinitive ending?",
              answer: "-ειν / -σαι / -ναι (infinitive endings)",
              choices: [
                "-ειν / -σαι / -ναι (infinitive endings)",
                "-ει (singular indicative)",
                "-ε (vocative)",
                "-ος (nominative)"
              ] },
            { form: "δεῖ ἀκούειν τὸν λόγον.",
              prompt: "Translate.",
              answer: "it is necessary to hear the word",
              choices: [
                "it is necessary to hear the word",
                "he must hear the word",
                "he hears the word",
                "hear the word!"
              ],
              note: "δεῖ ('it is necessary') is an impersonal verb that takes a complementary infinitive." }
          ]
        },
        {
          family: "7.4 Participles (Introduction)",
          lemma: "participle",
          gloss: "verbal adjective",
          questions: [
            { form: "participle",
              prompt: "What is the participle grammatically?",
              answer: "a verbal adjective",
              choices: ["a verbal adjective", "a verbal noun", "a finite verb", "an interjection"] },
            { form: "participle agreement",
              prompt: "A participle agrees with the noun it modifies in which categories?",
              answer: "case, gender, and number",
              choices: [
                "case, gender, and number",
                "person, number, and tense",
                "only voice",
                "only number"
              ] },
            { form: "participle has",
              prompt: "What VERB-side information does a participle carry, in addition to its adjective-side agreement?",
              answer: "tense (≈ aspect) and voice",
              choices: [
                "tense (≈ aspect) and voice",
                "only mood",
                "person and number (like a finite verb)",
                "none — it is purely adjectival"
              ],
              note: "Participles are revisited at depth in Ch 14, with the full range of voices in Ch 15." },
            { form: "βλέπω τὸν ἀκούοντα ἄνθρωπον.",
              prompt: "Translate.",
              answer: "I see the man who is hearing",
              choices: [
                "I see the man who is hearing",
                "I see the man — listen!",
                "the man sees, I hear",
                "I hear the seeing man"
              ],
              note: "τὸν ἀκούοντα is acc. sg. masc. of the present active participle, agreeing with ἄνθρωπον." }
          ]
        },
        {
          family: "7.5 Participles as Nouns",
          lemma: "ὁ + participle",
          gloss: "'the one who ___'",
          questions: [
            { form: "ὁ + participle",
              prompt: "When you see article + participle (with no noun), how do you translate?",
              answer: "as a noun-equivalent: 'the one who …' / 'those who …'",
              choices: [
                "as a noun-equivalent: 'the one who …' / 'those who …'",
                "always as an adverbial clause ('while ___')",
                "always as a finite verb",
                "always as an infinitive ('to ___')"
              ] },
            { form: "ὁ λέγων",
              prompt: "Translate.",
              answer: "'the one who says' / 'the one speaking'",
              choices: [
                "'the one who says' / 'the one speaking'",
                "'he says' (finite verb)",
                "'to say' (infinitive)",
                "'say!' (imperative)"
              ] },
            { form: "οἱ πιστεύοντες",
              prompt: "Translate.",
              answer: "'those who believe' / 'the believers'",
              choices: [
                "'those who believe' / 'the believers'",
                "'they believe' (finite verb)",
                "'to believe' (infinitive)",
                "'believe!' (imperative)"
              ],
              note: "Gender + number of the participle tell you what kind of person/thing is being referred to." },
            { form: "ὁ πιστεύων ἔχει ζωήν.",
              prompt: "Translate.",
              answer: "the one who believes has life",
              choices: [
                "the one who believes has life",
                "those who believe have life",
                "he believes and lives",
                "believing, he has life"
              ],
              note: "Article + masc. sg. participle (no noun) = substantive: 'the one who ___s'." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "8": {
      label: "Chapter 8 Grammar",
      notes: "Other patterns of nouns and verbs — deponent verbs; other moods/tenses of εἰμί; nouns of confusing gender",
      items: [
        {
          family: "8.1 Deponent Verbs",
          lemma: "ἔρχομαι, δέχομαι, ἀσπάζομαι",
          gloss: "middle-form, active-meaning verbs",
          questions: [
            { form: "deponent",
              prompt: "What is a deponent verb?",
              answer: "a verb whose lexical (lemma) form ends in -ομαι and which is active in meaning despite its middle-looking form",
              choices: [
                "a verb whose lexical (lemma) form ends in -ομαι and which is active in meaning despite its middle-looking form",
                "a verb that has lost its present-tense forms; the aorist replaces them entirely",
                "a verb that drops the augment in past tenses; the present supplies the only finite forms",
                "a verb that lacks a 3rd-person form; 1st and 2nd person only, in any tense"
              ],
              note: "Lemma test: if the dictionary form ends in -ομαι (not -ω), the verb is deponent." },
            { form: "ἔρχομαι",
              prompt: "Identify this form.",
              answer: "1st singular ('I come / go') — a deponent verb",
              parsed: "present middle/passive indicative first person singular",
              choices: [
                "1st singular ('I come / go') — a deponent verb",
                "1st singular ('I come') with a reflexive sense ('to myself')",
                "3rd singular ('he comes')",
                "infinitive ('to come')"
              ],
              note: "The -ομαι series of endings (introduced fully in Ch 15) here belongs to a verb that is always translated actively. The lemma ends in -ομαι, so it is deponent." },
            { form: "ἔρχεται",
              prompt: "Parse this form.",
              answer: "present indicative, 3rd singular ('he/she/it comes')",
              parsed: "present middle/passive indicative third person singular",
              choices: [
                "present indicative, 3rd singular ('he/she/it comes')",
                "present indicative, 2nd singular ('you come')",
                "present indicative, 3rd plural ('they come')",
                "imperfect indicative, 3rd singular ('he was coming')"
              ],
              note: "The -εται ending belongs to a deponent verb: still translated actively." },
            { form: "δέχομαι vs δέχω",
              prompt: "Which form is the dictionary (lemma) form?",
              answer: "δέχομαι",
              choices: ["δέχομαι", "δέχω", "either is acceptable", "δέξω"],
              note: "δέχομαι is deponent; *δέχω is not a real form." },
            { form: "ἔρχομαι πρὸς τὸν Ἰησοῦν.",
              prompt: "Translate.",
              answer: "I am coming to Jesus",
              choices: [
                "I am coming to Jesus",
                "I am being come to by Jesus",
                "Jesus is coming to me",
                "I will come to Jesus"
              ],
              note: "ἔρχομαι is deponent: -ομαι-style form, active meaning ('I come')." }
          ]
        },
        {
          family: "8.2 Imperfect, Future and Other Moods of εἰμί",
          lemma: "εἰμί",
          gloss: "I was / I will be / etc.",
          questions: [
            { form: "ἤμην",
              prompt: "Identify this form of εἰμί.",
              answer: "imperfect, 1st singular ('I was')",
              parsed: "imperfect active indicative first person singular",
              choices: [
                "imperfect, 1st singular ('I was')",
                "present, 1st singular ('I am')",
                "imperfect, 3rd singular ('he was')",
                "imperfect, 1st plural ('we were')"
              ] },
            { form: "ἦν",
              prompt: "Identify this form of εἰμί.",
              answer: "imperfect, 3rd singular ('he/she/it was')",
              parsed: "imperfect active indicative third person singular",
              choices: [
                "imperfect, 3rd singular ('he/she/it was')",
                "imperfect, 1st singular ('I was')",
                "present, 3rd plural ('they are')",
                "imperfect, 3rd plural ('they were')"
              ],
              note: "ἦν is one of the most common verbs in NT narrative." },
            { form: "ἦσαν",
              prompt: "Identify this form of εἰμί.",
              answer: "imperfect, 3rd plural ('they were')",
              parsed: "imperfect active indicative third person plural",
              choices: [
                "imperfect, 3rd plural ('they were')",
                "imperfect, 3rd singular ('he was')",
                "imperfect, 2nd plural ('you all were')",
                "present, 3rd plural ('they are')"
              ] },
            { form: "ἔσομαι",
              prompt: "Identify this form of εἰμί.",
              answer: "future 1st sg. ('I will be') — εἰμί's future is deponent",
              parsed: "future middle indicative first person singular",
              choices: [
                "future 1st sg. ('I will be') — εἰμί's future is deponent",
                "future active indicative, 3rd singular ('he will be')",
                "present middle indicative, 1st singular ('I am for myself')",
                "imperfect active indicative, 1st singular ('I was', but a different form)"
              ],
              note: "Future of εἰμί uses the -ομαι (deponent-shaped) endings on the stem ἐσ-." },
            { form: "εἰμί other moods",
              prompt: "Which non-indicative forms of εἰμί are covered in this chapter and Ch 7?",
              answer: "imperative, infinitive, and participle (the subjunctive comes in Ch 17)",
              choices: [
                "imperative, infinitive, and participle (the subjunctive comes in Ch 17)",
                "only the imperative — εἰμί lacks the other non-indicative forms",
                "only the infinitive — εἰμί lacks imperative and participle",
                "εἰμί has no non-indicative forms — only indicatives exist"
              ] },
            { form: "ἤμην ἐν τῷ ἱερῷ.",
              prompt: "Translate.",
              answer: "I was in the temple",
              choices: [
                "I was in the temple",
                "I am in the temple",
                "I will be in the temple",
                "I have been in the temple"
              ],
              note: "ἤμην = 1st sg. imperfect of εἰμί ('I was')." }
          ]
        },
        {
          family: "8.3 Nouns of Confusing Gender",
          lemma: "ὁ προφήτης / ἡ ὁδός",
          gloss: "exceptions to the typical patterns",
          questions: [
            { form: "ὁ προφήτης",
              prompt: "What is unusual about ὁ προφήτης?",
              answer: "it is MASCULINE despite the -ης ending that usually flags 1st-declension feminine",
              choices: [
                "it is MASCULINE despite the -ης ending that usually flags 1st-declension feminine",
                "it is neuter despite the masculine article",
                "it is 2nd declension despite the 1st-declension ending",
                "it is indeclinable — the same form οἶδα is used for every person and number"
              ],
              note: "A handful of 1st-decl nouns are masculine: προφήτης, μαθητής, βαπτιστής, νεανίας. The article ὁ is the giveaway." },
            { form: "προφήτου",
              prompt: "Why does the gen. sg. of προφήτης end in -ου instead of the usual feminine -ης?",
              answer: "1st-decl. masculines borrow the 2nd-decl. masc. -ου in the gen. sg.",
              choices: [
                "1st-decl. masculines borrow the 2nd-decl. masc. -ου in the gen. sg.",
                "It's a typo — it should be προφήτης.",
                "All 1st-decl. nouns end in -ου in the gen. sg.",
                "-ου marks the accusative."
              ],
              note: "προφήτης, προφήτου, προφήτῃ, προφήτην." },
            { form: "ἡ ὁδός",
              prompt: "What is unusual about ἡ ὁδός?",
              answer: "it is feminine despite the -ος ending",
              choices: [
                "it is feminine despite the -ος ending",
                "it is masculine despite the article ἡ",
                "it is neuter",
                "it is indeclinable — same form in every case"
              ],
              note: "ἡ ὁδός = 'the road / way'. A few other -ος feminines exist (ἡ νῆσος 'island', ἡ ἔρημος '[the] desert')." },
            { form: "νεανίας",
              prompt: "What is unusual about this 1st-declension masculine?",
              answer: "It keeps α throughout the singular (α-pure pattern).",
              choices: [
                "It keeps α throughout the singular (α-pure pattern).",
                "It is actually neuter, despite appearances.",
                "Its plural endings are 2nd-declension.",
                "It has no genitive singular."
              ],
              note: "νεανίας, νεανίου, νεανίᾳ, νεανίαν — like ἡμέρα but masculine, with the masc. -ου gen." },
            { form: "ἡ ὁδὸς τοῦ Κυρίου.",
              prompt: "Translate.",
              answer: "the way of the Lord",
              choices: [
                "the way of the Lord",
                "the road, O Lord",
                "the Lord's roads",
                "the Lord is on the way"
              ],
              note: "ὁδός looks 2nd-declension masculine (-ος) but is FEMININE — note the feminine article ἡ." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "9": {
      label: "Chapter 9 Grammar",
      notes: "Demonstratives (οὗτος, ἐκεῖνος); third-person pronouns (αὐτός, ἄλλος); 1st/2nd person pronouns with reflexives & possessives; conjunctions (timid words, μέν…δέ, καί)",
      items: [
        {
          family: "9.1 Formation of ἐκεῖνος and οὗτος",
          lemma: "ἐκεῖνος / οὗτος",
          gloss: "that / this",
          questions: [
            { form: "ἐκεῖνος endings",
              prompt: "What endings does ἐκεῖνος use?",
              answer: "standard 2-1-2 (adjective) endings: -ος, -η, -ο (like καλός, καλή, καλόν)",
              choices: [
                "standard 2-1-2 (adjective) endings: -ος, -η, -ο (like καλός, καλή, καλόν)",
                "3rd-declension endings throughout — masc. / fem. / neut. all on a consonant stem",
                "unique endings used by no other word",
                "the same forms as the definite article"
              ],
              note: "ἐκεῖνος is fully regular — stem ἐκεινο- + adjective endings." },
            { form: "οὗτος — two stems",
              prompt: "Why does οὗτος have forms beginning with both ου- and αυ-?",
              answer: "the stem vowel echoes the article: ου- where the article has ο (ὁ, οἱ, τοῦ, τῷ…); αυ- where the article has α (ἡ, αἱ, τῆς, τῇ…)",
              choices: [
                "the stem vowel echoes the article: ου- where the article has ο (ὁ, οἱ, τοῦ, τῷ…); αυ- where the article has α (ἡ, αἱ, τῆς, τῇ…)",
                "ου- forms are singular, αυ- forms are plural — pure number distinction, regardless of gender",
                "ου- is masculine and αυ- is feminine in every case, including the neuter forms",
                "they are random spelling variants with no rule, fixed only by repeated exposure"
              ],
              note: "οὗτος, αὕτη, τοῦτο / τούτου, ταύτης, τούτου …" },
            { form: "οὗτος — τ vs rough breathing",
              prompt: "Which forms of οὗτος start with τ- and which with a rough-breathed vowel?",
              answer: "τ- where the article has τ (τοῦ → τούτου, τήν → ταύτην); rough-breathed vowel where the article has none (ὁ → οὗτος, ἡ → αὕτη, οἱ → οὗτοι, αἱ → αὗται)",
              choices: [
                "τ- where the article has τ (τοῦ → τούτου, τήν → ταύτην); rough-breathed vowel where the article has none (ὁ → οὗτος, ἡ → αὕτη, οἱ → οὗτοι, αἱ → αὗται)",
                "rough-breathed forms are masculine; τ- forms are feminine (with no other pattern)",
                "τ- forms are singular throughout; rough-breathed forms are plural throughout",
                "it is unpredictable — every case must be memorised individually, with no underlying rule"
              ],
              note: "Useful rule of thumb: 'οὗτος follows the article'." },
            { form: "αὕτη vs αὐτή",
              prompt: "Distinguish αὕτη from αὐτή.",
              answer: "αὕτη (rough breathing) = 'this' (nom. sg. fem. of οὗτος); αὐτή (smooth breathing) = 'she / herself / same' (αὐτός)",
              choices: [
                "αὕτη (rough breathing) = 'this' (nom. sg. fem. of οὗτος); αὐτή (smooth breathing) = 'she / herself / same' (αὐτός)",
                "they are alternate spellings of the same word — accent / breathing optional",
                "αὕτη is the 3rd-person pronoun; αὐτή is the demonstrative 'this' (fem. sg.)",
                "αὕτη is the plural form; αὐτή is the singular form (no other distinction)"
              ],
              note: "Tiny breathing mark, very different meanings." },
            { form: "οὗτος ὁ ἀπόστολος",
              prompt: "Why is οὗτος in predicate position even though it is translated attributively?",
              answer: "Greek demonstratives always sit OUTSIDE the article-noun phrase (predicate position), yet are translated attributively ('this apostle')",
              choices: [
                "Greek demonstratives always sit OUTSIDE the article-noun phrase (predicate position), yet are translated attributively ('this apostle')",
                "It is a typo; οὗτος belongs between the article and the noun",
                "It means 'the apostle is this one' — a predicate sentence",
                "Demonstratives normally take attributive position; this is an exception"
              ],
              note: "Allowed: οὗτος ὁ ἀπόστολος / ὁ ἀπόστολος οὗτος. Forbidden: *ὁ οὗτος ἀπόστολος." },
            { form: "ἐκείνη",
              prompt: "Parse this form.",
              answer: "nom. sg. fem. of ἐκεῖνος — 'that (one)'",
              choices: [
                "nom. sg. fem. of ἐκεῖνος — 'that (one)'",
                "nom. sg. masc. of ἐκεῖνος",
                "nom. sg. fem. of οὗτος — 'this'",
                "dat. sg. fem. of the article"
              ],
              note: "ἐκεῖνος is fully regular 2-1-2: ἐκεῖνος, ἐκείνη, ἐκεῖνο." },
            { form: "ἐκεῖνος ὁ ἄνθρωπος",
              prompt: "Translate.",
              answer: "'that man' — ἐκεῖνος in predicate position, rendered attributively",
              choices: [
                "'that man' — ἐκεῖνος in predicate position, rendered attributively",
                "'this man' (near demonstrative)",
                "'the man is that one' (predicate sentence)",
                "'the same man' (αὐτός attributive)"
              ],
              note: "Like οὗτος, ἐκεῖνος always sits outside the article–noun phrase but translates attributively." },
            { form: "ἐκεῖνος vs οὗτος",
              prompt: "What is the contrast between ἐκεῖνος and οὗτος?",
              answer: "ἐκεῖνος = far ('that'); οὗτος = near ('this')",
              choices: [
                "ἐκεῖνος = far ('that'); οὗτος = near ('this')",
                "ἐκεῖνος = near; οὗτος = far",
                "they are interchangeable — Koine collapses the two tenses entirely",
                "ἐκεῖνος is singular; οὗτος is plural"
              ] },
            { form: "τοῦτο vs ἐκεῖνο",
              prompt: "Identify the neuter nominative/accusative singular of each demonstrative.",
              answer: "τοῦτο (this) for οὗτος; ἐκεῖνο (that) for ἐκεῖνος — both end in -ο like the article τό",
              choices: [
                "τοῦτο (this) for οὗτος; ἐκεῖνο (that) for ἐκεῖνος — both end in -ο like the article τό",
                "τοῦτον / ἐκεῖνον — both take -ν",
                "ταῦτα / ἐκεῖνα — these are the singular forms",
                "τοῦτος / ἐκεῖνος — neuter is identical to masculine"
              ] },
            { form: "οὗτος ὁ ἄνθρωπος ἀκούει τὸν λόγον.",
              prompt: "Translate.",
              answer: "this man hears the word",
              choices: [
                "this man hears the word",
                "the man hears this word",
                "that man hears the word",
                "this is the man who hears"
              ],
              note: "οὗτος sits in predicate position (outside article-noun) but translates attributively ('this man')." }
          ]
        },
        {
          family: "9.2 Third-person pronouns — αὐτός & ἄλλος",
          lemma: "αὐτός / ἄλλος",
          gloss: "he-she-it / self / same / other",
          questions: [
            { form: "αὐτός — three uses",
              prompt: "What are the three main uses of αὐτός?",
              answer: "(1) 3rd-person pronoun; (2) emphatic 'self' (predicate); (3) 'the same' (attributive)",
              choices: [
                "(1) 3rd-person pronoun; (2) emphatic 'self' (predicate); (3) 'the same' (attributive)",
                "only as a third-person pronoun — never adjectival",
                "only as the demonstrative 'this'",
                "as a possessive pronoun ('mine, yours, his') and nothing else"
              ] },
            { form: "αὐτὸς ὁ ἀπόστολος",
              prompt: "Translate (predicate position).",
              answer: "'the apostle himself' — αὐτός emphatic / intensive",
              choices: [
                "'the apostle himself' — αὐτός emphatic / intensive",
                "'the same apostle' — αὐτός identifying",
                "'this apostle' — demonstrative",
                "'his apostle' — possessive"
              ],
              note: "Predicate position (outside article-noun) = 'self'." },
            { form: "ὁ αὐτὸς ἀπόστολος",
              prompt: "Translate (attributive position).",
              answer: "'the same apostle' — αὐτός identifying",
              choices: [
                "'the same apostle' — αὐτός identifying",
                "'the apostle himself' — αὐτός emphatic",
                "'this apostle' — demonstrative",
                "'his apostle' — possessive"
              ],
              note: "Inside the article-noun bracket (attributive) = 'same'." },
            { form: "αὐτοῦ",
              prompt: "What is the most common force of αὐτοῦ in NT Greek?",
              answer: "third-person pronoun, gen. sg. masc. — 'of him / his'",
              choices: [
                "third-person pronoun, gen. sg. masc. — 'of him / his'",
                "'self' (emphatic nominative)",
                "'the same' (attributive)",
                "'that one' (far demonstrative)"
              ],
              note: "Oblique cases of αὐτός — gen./dat./acc. — are the normal way to say 'him, of him, to him' etc." },
            { form: "ἄλλος",
              prompt: "What does ἄλλος mean, and what is unusual about it?",
              answer: "'other' / 'another'; its neuter nom./acc. singular is ἄλλο (no -ν), like the article τό",
              choices: [
                "'other' / 'another'; its neuter nom./acc. singular is ἄλλο (no -ν), like the article τό",
                "'self'; takes regular 2-1-2 endings throughout, like αὐτός in shape",
                "'same'; declines exactly like αὐτός, but the meaning shifts in attributive position",
                "'this'; declines like οὗτος, with the τ-/breathing alternation"
              ],
              note: "Compare ἄλλο with English 'other' — the masc./fem. follow 2-1-2 endings normally (ἄλλος, ἄλλη)." },
            { form: "αὐτὴ ἡ ἀδελφή",
              prompt: "Translate (αὐτή in predicate position).",
              answer: "'the sister herself' — emphatic / intensive αὐτός",
              choices: [
                "'the sister herself' — emphatic / intensive αὐτός",
                "'the same sister' — attributive αὐτός",
                "'this sister' — demonstrative",
                "'her sister' — possessive"
              ],
              note: "Outside the article–noun bracket = 'self'." },
            { form: "αὐτός — position rule (emphatic)",
              prompt: "Where must αὐτός sit when it means 'self / himself / etc.'?",
              answer: "in predicate position — OUTSIDE the article–noun phrase",
              choices: [
                "in predicate position — OUTSIDE the article–noun phrase",
                "in attributive position — between article and noun",
                "always immediately after the verb",
                "always sentence-initial"
              ] },
            { form: "αὐτὸς ὁ Ἰησοῦς εἶπεν",
              prompt: "Translate.",
              answer: "'Jesus himself said …' — emphatic αὐτός",
              choices: [
                "'Jesus himself said …' — emphatic αὐτός",
                "'The same Jesus said …' — identifying αὐτός",
                "'This Jesus said …' — demonstrative",
                "'His Jesus said …' — possessive"
              ] },
            { form: "ὁ αὐτὸς κύριος",
              prompt: "Translate (αὐτός in attributive position).",
              answer: "'the same Lord' — identifying αὐτός",
              choices: [
                "'the same Lord' — identifying αὐτός",
                "'the Lord himself' — emphatic αὐτός",
                "'this Lord' — demonstrative",
                "'his Lord' — possessive"
              ] },
            { form: "αὐτός — position rule (identifying)",
              prompt: "Where must αὐτός sit when it means 'the same'?",
              answer: "in attributive position — between the article and the noun",
              choices: [
                "in attributive position — between the article and the noun",
                "in predicate position — outside the article–noun phrase",
                "always sentence-initial",
                "always after the verb"
              ] },
            { form: "αὐτῷ",
              prompt: "What is the most likely force of αὐτῷ?",
              answer: "'to / for him' — dat. sg. masc. of αὐτός",
              choices: [
                "'to / for him' — dat. sg. masc. of αὐτός",
                "'self' — nom. sg. masc.",
                "'of his own' — reflexive",
                "'them' — acc. pl."
              ] },
            { form: "αὐτούς",
              prompt: "Parse and translate.",
              answer: "acc. pl. masc. of αὐτός — 'them' (direct object)",
              choices: [
                "acc. pl. masc. of αὐτός — 'them' (direct object)",
                "gen. pl. masc. — 'of them'",
                "nom. pl. masc. — 'they themselves'",
                "dat. pl. masc. — 'to them'"
              ] },
            { form: "ἄλλο",
              prompt: "Why does ἄλλο not have a final -ν, unlike καλόν?",
              answer: "ἄλλος follows the article pattern: neuter ends in -ο (like τό)",
              choices: [
                "ἄλλος follows the article pattern: neuter ends in -ο (like τό)",
                "it is a typo for ἄλλον",
                "the -ν always drops before a consonant",
                "ἄλλο is dat. sg., not acc. sg."
              ] },
            { form: "οἱ ἄλλοι",
              prompt: "Translate.",
              answer: "'the others' / 'the other ones'",
              choices: [
                "'the others' / 'the other ones'",
                "'each one'",
                "'this one'",
                "'they themselves'"
              ] },
            { form: "αὐτὸς ὁ Ἰησοῦς λέγει.",
              prompt: "Translate.",
              answer: "Jesus himself speaks",
              choices: [
                "Jesus himself speaks",
                "the same Jesus speaks",
                "Jesus speaks to him",
                "he says Jesus"
              ],
              note: "αὐτός in predicate position = emphatic ('-self'); attributive (ὁ αὐτὸς Ἰησοῦς) would mean 'the same Jesus'." }
          ]
        },
        {
          family: "9.3 1st & 2nd person pronouns — reflexives and possessives",
          lemma: "ἐγώ / σύ / ἐμαυτοῦ / ἐμός",
          gloss: "I, you, myself, my",
          questions: [
            { form: "ἐγώ / σύ — emphatic vs enclitic",
              prompt: "Greek 1st/2nd-singular pronouns have two oblique forms. What is the difference?",
              answer: "emphatic forms (ἐμοῦ, σοῦ, …) vs enclitic forms (μου, σου, …) — context decides which",
              choices: [
                "emphatic forms (ἐμοῦ, σοῦ, …) vs enclitic forms (μου, σου, …) — context decides which",
                "the emphatic forms are singular, the enclitic forms plural",
                "they are dialectal variants of the same meaning",
                "the enclitic forms are reflexive, the emphatic forms are not"
              ] },
            { form: "ἡμῶν vs ὑμῶν",
              prompt: "How are 'of us' and 'of you (pl)' distinguished?",
              answer: "ἡμῶν = 'of us' (rough breathing); ὑμῶν = 'of you (pl)' (smooth breathing)",
              choices: [
                "ἡμῶν = 'of us' (rough breathing); ὑμῶν = 'of you (pl)' (smooth breathing)",
                "ἡμῶν = 'of you (pl)'; ὑμῶν = 'of us'",
                "they are interchangeable — Koine collapses the two tenses entirely",
                "ἡμῶν is reflexive, ὑμῶν is plain"
              ],
              note: "Breathing is the only visual difference — high-frequency confusion point." },
            { form: "reflexive — 1st & 2nd sg",
              prompt: "How are the singular reflexive pronouns 'myself' and 'yourself' formed?",
              answer: "ἐμαυτοῦ, -ῆς ('myself') and σεαυτοῦ, -ῆς ('yourself') — personal stem + αὐτο- stem, declined together; no nominative",
              choices: [
                "ἐμαυτοῦ, -ῆς ('myself') and σεαυτοῦ, -ῆς ('yourself') — personal stem + αὐτο- stem, declined together; no nominative",
                "ἐγώ and σύ themselves serve as the reflexive — Greek has no separate reflexive forms",
                "by adding αὐ- as a prefix to the regular pronoun (αὐεγώ, αὐσύ)",
                "by using ὅς as a reflexive marker — the relative doubles as a reflexive"
              ],
              note: "Reflexives lack a nominative — by definition the subject can't 'reflex' onto itself in the nom." },
            { form: "reflexive — 3rd sg / plural",
              prompt: "What is the 3rd-person reflexive ('himself / herself / themselves')?",
              answer: "ἑαυτοῦ, -ῆς, -οῦ — used for 3rd sg AND, in the plural ἑαυτῶν, for all three persons of the plural reflexive",
              choices: [
                "ἑαυτοῦ, -ῆς, -οῦ — used for 3rd sg AND, in the plural ἑαυτῶν, for all three persons of the plural reflexive",
                "αὐτός alone serves as the 3rd-person reflexive — context tells whether reflexive",
                "the relative ὅς doubles as the reflexive when it refers to the subject",
                "there is no 3rd-person reflexive in Koine — periphrasis is required"
              ],
              note: "Koine collapses 1pl/2pl/3pl reflexives into the single form ἑαυτῶν." },
            { form: "possessive adjectives",
              prompt: "What are the 1st/2nd-person possessive adjectives, and how do they differ from the genitive pronoun?",
              answer: "ἐμός / σός / ἡμέτερος / ὑμέτερος — regular 2-1-2 adjectives that agree with the noun",
              choices: [
                "ἐμός / σός / ἡμέτερος / ὑμέτερος — regular 2-1-2 adjectives that agree with the noun",
                "they are identical to the personal pronouns in form and use",
                "they are adverbs, not adjectives",
                "they are unique 3rd-declension forms"
              ],
              note: "ὁ ἐμὸς λόγος ≈ ὁ λόγος μου — both 'my word', but the adjective is more emphatic." },
            { form: "ἐμέ vs με",
              prompt: "Which is the emphatic accusative of 'I / me'?",
              answer: "ἐμέ (accented, with prothetic ε-)",
              choices: [
                "ἐμέ (accented, with prothetic ε-)",
                "με (unaccented enclitic)",
                "both — they are interchangeable in every context",
                "neither — these are 2nd-person forms"
              ],
              note: "Use ἐμέ for emphasis and after prepositions (πρὸς ἐμέ); use the enclitic με when no emphasis is needed." },
            { form: "after prepositions",
              prompt: "Which form follows a preposition: ἐμοῦ / μου?",
              answer: "ἐμοῦ — prepositions take the emphatic form",
              choices: [
                "ἐμοῦ — prepositions take the emphatic form",
                "μου — prepositions take the enclitic",
                "either — there is no rule",
                "neither — prepositions never govern personal pronouns"
              ] },
            { form: "ἐμαυτόν",
              prompt: "Parse and translate.",
              answer: "acc. sg. masc. of ἐμαυτοῦ — 'myself' (1st-sg. reflexive)",
              choices: [
                "acc. sg. masc. of ἐμαυτοῦ — 'myself' (1st-sg. reflexive)",
                "nom. sg. masc. — 'I myself' (emphatic)",
                "gen. sg. — 'of my own'",
                "acc. sg. — 'me' (regular pronoun)"
              ],
              note: "Reflexive: subject and object refer to the same person." },
            { form: "no nominative",
              prompt: "Why do reflexive pronouns lack a nominative form?",
              answer: "a subject can't 'reflex' onto itself in the nominative",
              choices: [
                "a subject can't 'reflex' onto itself in the nominative",
                "Greek reflexives DO have a nominative — it's just rare",
                "The nominative is supplied by ἐγώ / σύ themselves",
                "Reflexives are indeclinable"
              ] },
            { form: "ὁ ἐμὸς λόγος",
              prompt: "Translate.",
              answer: "'my word' — possessive adjective ἐμός in attributive position",
              choices: [
                "'my word' — possessive adjective ἐμός in attributive position",
                "'the word is mine' — predicate sentence",
                "'his own word' — reflexive",
                "'the same word' — αὐτός"
              ] },
            { form: "ἡμέτερος",
              prompt: "Translate and parse 'ἡμέτερος'.",
              answer: "'our' — 1st-person plural possessive adjective, declined like καλός, -ή, -όν",
              choices: [
                "'our' — 1st-person plural possessive adjective, declined like καλός, -ή, -όν",
                "'your (pl.)' — 2nd-person plural possessive",
                "'ourselves' — 1st-person plural reflexive",
                "'of us' — gen. pl. of the personal pronoun"
              ] },
            { form: "ἐγὼ ἀκούω, σὺ δὲ λαλεῖς.",
              prompt: "Translate.",
              answer: "I listen, but you speak",
              choices: [
                "I listen, but you speak",
                "I and you both speak",
                "you listen and I speak",
                "I speak and you listen"
              ],
              note: "Explicit ἐγώ and σύ add emphasis or contrast — Greek verbs already encode person." }
          ]
        },
        {
          family: "9.4 Conjunctions — timid words, μέν…δέ, δέ, καί",
          lemma: "μέν / δέ / καί",
          gloss: "common connectors",
          questions: [
            { form: "timid (postpositive) words",
              prompt: "What does it mean to call a word 'timid' (postpositive)?",
              answer: "it cannot stand first in its clause — it 'hides' in second (or later) position",
              choices: [
                "it cannot stand first in its clause — it 'hides' in second (or later) position",
                "it is a particle of negation — it always negates the verb that follows it",
                "it always carries an enclitic accent — it leans phonetically on the previous word",
                "it must take a rough breathing whenever it starts with a vowel"
              ],
              note: "δέ, γάρ, οὖν, μέν are the classic timid (postpositive) connectors. In English we put them first ('but…', 'for…'); in Greek, never." },
            { form: "δέ — first or second?",
              prompt: "Where does δέ appear in its clause, and how is it translated to English position?",
              answer: "δέ stands second (or later) in Greek, but is translated FIRST in English ('But …' / 'And …')",
              choices: [
                "δέ stands second (or later) in Greek, but is translated FIRST in English ('But …' / 'And …')",
                "δέ stands first in Greek as in English — its position is identical in both languages",
                "δέ always stands at the end of the clause, like a tag particle",
                "δέ may stand anywhere; Greek word order is fully free even for postpositives"
              ] },
            { form: "μέν … δέ",
              prompt: "What pair of ideas does μέν … δέ set up?",
              answer: "a balance: 'on the one hand … on the other hand' / 'X …, but Y …'",
              choices: [
                "a balance: 'on the one hand … on the other hand' / 'X …, but Y …'",
                "a strong adversative: 'not X but rather Y'",
                "a causal pair: 'because X, therefore Y'",
                "a temporal pair: 'when X, then Y'"
              ],
              note: "Both are postpositive: e.g. ὁ μὲν Πέτρος … ὁ δὲ Ἰωάννης …" },
            { form: "δέ alone",
              prompt: "When δέ appears without a preceding μέν, what does it most often signal?",
              answer: "a mild continuation — 'and / but / now'",
              choices: [
                "a mild continuation — 'and / but / now'",
                "always a strong adversative — 'but rather, in fact'",
                "always a causal — 'because'",
                "always an inferential — 'therefore'"
              ],
              note: "Solo δέ is the workhorse connective of NT narrative — often weaker than English 'but'." },
            { form: "καί — connective",
              prompt: "What is the most common use of καί?",
              answer: "as the connective 'and', joining words, phrases, or clauses",
              choices: [
                "as the connective 'and', joining words, phrases, or clauses",
                "as the adversative 'but', equivalent to ἀλλά in force",
                "as the inferential 'therefore', equivalent to οὖν",
                "as the causal 'because', equivalent to γάρ"
              ] },
            { form: "καί — adverbial",
              prompt: "Besides 'and', what does καί commonly mean when it sits BEFORE a single word it highlights?",
              answer: "'also' or 'even' — adverbial / ascensive καί",
              choices: [
                "'also' or 'even' — adverbial / ascensive καί",
                "'but' — adversative καί, where context demands contrast",
                "'or' — disjunctive καί, joining a list of alternatives",
                "'because' — causal καί, introducing a reason"
              ],
              note: "καὶ σύ = 'you too / even you', not 'and you'. Position tells you which sense." },
            { form: "καί vs δέ",
              prompt: "Which is postpositive: καί or δέ?",
              answer: "δέ is postpositive; καί is not",
              choices: [
                "δέ is postpositive; καί is not",
                "both are postpositive",
                "neither is postpositive",
                "καί is postpositive; δέ is not"
              ] },
            { form: "which is NOT postpositive?",
              prompt: "Which of the following words is NOT timid (postpositive)?",
              answer: "καί — it stands first like English 'and'",
              choices: [
                "καί — it stands first like English 'and'",
                "δέ — postpositive, like its English gloss 'but'",
                "γάρ — postpositive, like its English gloss 'for'",
                "οὖν — postpositive, like its English gloss 'therefore'"
              ] },
            { form: "translating timid words",
              prompt: "When you translate a timid (postpositive) Greek connector into English, where does it go?",
              answer: "FIRST in the English clause — even though it was second (or later) in Greek",
              choices: [
                "FIRST in the English clause — even though it was second (or later) in Greek",
                "Wherever it was in Greek — English preserves the Greek order verbatim",
                "Last in the English clause — like sentence-final adverbs",
                "It is dropped entirely — postpositives carry no English-rendering value"
              ],
              note: "ὁ δὲ Ἰησοῦς εἶπεν = 'But Jesus said …', not 'Jesus but said …'." },
            { form: "ὁ μὲν Πέτρος … ὁ δὲ Ἰωάννης …",
              prompt: "Translate the structure.",
              answer: "'Peter …, but John …' (μέν … δέ in balance)",
              choices: [
                "'Peter …, but John …' (μέν … δέ in balance)",
                "'Both Peter and John …'",
                "'Either Peter or John …'",
                "'Peter and John together …'"
              ] },
            { form: "μέν alone",
              prompt: "What does μέν do when it appears WITHOUT a following δέ?",
              answer: "still 'on the one hand' — contrast may be implicit",
              choices: [
                "still 'on the one hand' — contrast may be implicit",
                "becomes the negative particle 'not'",
                "becomes a causal — 'because'",
                "is identical to δέ in solo use"
              ],
              note: "In Koine narrative the implied 'δέ' clause sometimes just doesn't arrive." },
            { form: "δέ — narrative tone",
              prompt: "In NT narrative, which English rendering best captures plain solo δέ?",
              answer: "'and' or 'now' — a soft, transitional connective; reserve 'but' for stronger contrasts",
              choices: [
                "'and' or 'now' — a soft, transitional connective; reserve 'but' for stronger contrasts",
                "always 'but' — a strong adversative, like ἀλλά in force every time",
                "always 'because' — a causal conjunction like γάρ in every context",
                "always 'therefore' — an inferential conjunction like οὖν everywhere"
              ] },
            { form: "καὶ σύ",
              prompt: "How is the καί best translated in καὶ σύ;?",
              answer: "'you also' / 'even you' — ascensive / adverbial καί before a single word",
              choices: [
                "'you also' / 'even you' — ascensive / adverbial καί before a single word",
                "'and you' — straight connective καί, joining clauses or items",
                "'but you' — adversative καί, used like ἀλλά in contrast",
                "'because you' — causal καί, introducing a reason clause"
              ] },
            { form: "ὁ μὲν ἄνθρωπος ἀκούει, ὁ δὲ θεὸς λέγει.",
              prompt: "Translate.",
              answer: "the man hears, but God speaks",
              choices: [
                "the man hears, but God speaks",
                "the man and God speak",
                "the man hears God speaking",
                "neither the man nor God speaks"
              ],
              note: "μέν … δέ pairs two clauses in balance ('on the one hand … on the other')." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "10": {
      label: "Chapter 10 Grammar",
      notes: "Basic complex sentences — relative clauses, leading questions with μή/οὐ, ὅτι for direct & indirect statement, and time expressions by case",
      items: [
        {
          family: "Relative clauses — overview",
          lemma: "relative clause",
          gloss: "subordinate clause modifying a noun",
          questions: [
            { form: "definition",
              prompt: "What is a relative clause?",
              answer: "a subordinate clause that modifies a noun (its antecedent), introduced by a relative pronoun",
              choices: [
                "a subordinate clause that modifies a noun (its antecedent), introduced by a relative pronoun",
                "a main clause that states the central idea of the sentence",
                "any clause introduced by ὅτι",
                "a clause expressing purpose, introduced by ἵνα"
              ],
              note: "E.g. ὁ ἀπόστολος ὃν βλέπω = 'the apostle whom I see' — ὃν βλέπω is the relative clause modifying ἀπόστολος." },
            { form: "antecedent",
              prompt: "What is the 'antecedent' of a relative clause?",
              answer: "the noun (or pronoun) in the main clause that the relative pronoun refers back to",
              choices: [
                "the noun (or pronoun) in the main clause that the relative pronoun refers back to",
                "the verb of the relative clause, since it carries the action",
                "the conjunction introducing the clause — like ὅτι or ἵνα",
                "the subject of the relative clause — usually a noun"
              ] },
            { form: "agreement",
              prompt: "A relative pronoun agrees with its antecedent in which categories?",
              answer: "gender and number",
              choices: [
                "gender and number",
                "case, gender, and number — all three",
                "case and number only",
                "case only"
              ],
              note: "Antecedent fixes gender + number; the relative's own clause fixes its case." },
            { form: "ὁ ἀπόστολος ὃν βλέπω",
              prompt: "Why is the relative pronoun ὅν (accusative) here, even though ἀπόστολος is nominative?",
              answer: "the relative takes its case from its function in the relative clause — here it is the direct object of βλέπω",
              choices: [
                "the relative takes its case from its function in the relative clause — here it is the direct object of βλέπω",
                "the relative always matches its antecedent in case, gender, AND number",
                "ὅν is actually nominative; the -ν ending is a relative-pronoun quirk",
                "Greek relatives are always accusative, regardless of clause role"
              ] },
            { form: "ὁ ἄνθρωπος ὃν βλέπω ἀκούει.",
              prompt: "Translate.",
              answer: "the man whom I see hears",
              choices: [
                "the man whom I see hears",
                "the man who sees me hears",
                "I see the man who hears",
                "the man and I see and hear"
              ],
              note: "ὅν is masc. acc. sg. — the relative's case matches its function (direct object of βλέπω) inside the relative clause." }
          ]
        },
        {
          family: "Relative pronoun — formation of ὅς, ἥ, ὅ",
          lemma: "ὅς, ἥ, ὅ",
          gloss: "who, which, that",
          questions: [
            { form: "ὅς",
              prompt: "Identify this form.",
              answer: "nom. sg. masculine of the relative pronoun ('who / which')",
              choices: [
                "nom. sg. masculine of the relative pronoun ('who / which')",
                "the masculine article ὁ with an accent — accented forms of the article are relatives",
                "nom. sg. feminine of the relative pronoun ('she who')",
                "acc. sg. masculine of the relative pronoun ('whom')"
              ],
              note: "Rough breathing + acute accent distinguishes ὅς from the article ὁ." },
            { form: "ἥ vs ἡ",
              prompt: "How do you tell the relative pronoun ἥ (fem. sg. nom.) from the feminine article ἡ?",
              answer: "the relative ἥ carries an accent; the article ἡ is unaccented (proclitic)",
              choices: [
                "the relative ἥ carries an accent; the article ἡ is unaccented (proclitic)",
                "the breathing — relative is smooth, article is rough",
                "they are identical and only context distinguishes them",
                "the relative is always capitalised"
              ],
              note: "Both have rough breathing. Accent is the diagnostic." },
            { form: "endings",
              prompt: "The relative pronoun ὅς, ἥ, ὅ uses which set of endings?",
              answer: "the standard 2-1-2 (adjective) endings, like καλός, καλή, καλόν",
              choices: [
                "the standard 2-1-2 (adjective) endings, like καλός, καλή, καλόν",
                "the 3rd-declension endings used by πᾶς",
                "a unique set found nowhere else",
                "the same endings as the article (τοῦ, τῇ, τόν...)"
              ],
              note: "Masc./neut. follow the 2nd declension, fem. follows the 1st — all with rough breathing on the stem." },
            { form: "οὗ / ᾧ / ὅν",
              prompt: "Match these three forms (masc. sg.) to their cases.",
              answer: "οὗ = gen., ᾧ = dat., ὅν = acc.",
              choices: [
                "οὗ = gen., ᾧ = dat., ὅν = acc.",
                "οὗ = dat., ᾧ = gen., ὅν = nom.",
                "οὗ = acc., ᾧ = gen., ὅν = dat.",
                "οὗ = nom., ᾧ = acc., ὅν = gen."
              ] },
            { form: "neuter ὅ vs ὅτι",
              prompt: "How is the neuter relative ὅ distinguished from the conjunction ὅτι?",
              answer: "ὅ is one syllable (relative); ὅτι is two syllables (conjunction)",
              choices: [
                "ὅ is one syllable (relative); ὅτι is two syllables (conjunction)",
                "they are interchangeable — Koine collapses the two tenses entirely",
                "ὅ is the conjunction, ὅτι the pronoun",
                "both are relative pronouns in different cases"
              ] },
            { form: "ἡ ἀδελφὴ ἣν φιλῶ.",
              prompt: "Translate.",
              answer: "the sister whom I love",
              choices: [
                "the sister whom I love",
                "the sister who loves me",
                "the love of the sister",
                "my own sister"
              ],
              note: "ἥν is fem. acc. sg. — agrees with ἀδελφή in gender/number (fem. sg.), case from its role (object of φιλῶ)." }
          ]
        },
        {
          family: "Leading questions — μή vs οὐ",
          lemma: "μή / οὐ in questions",
          gloss: "questions that 'slant' toward a yes or no answer",
          questions: [
            { form: "οὐ + question",
              prompt: "A question introduced by οὐ (or οὐχ / οὐκ) expects what answer?",
              answer: "'yes' — the questioner assumes a positive answer",
              choices: [
                "'yes' — the questioner assumes a positive answer",
                "'no' — the questioner assumes a negative answer",
                "neither — it is a neutral question",
                "either, depending on tone"
              ],
              note: "οὐκ ἀκούεις; = 'You hear, don't you?' (expecting 'yes')." },
            { form: "μή + question",
              prompt: "A question introduced by μή expects what answer?",
              answer: "'no' — the questioner expects (or hopes for) a negative answer",
              choices: [
                "'no' — the questioner expects (or hopes for) a negative answer",
                "'yes' — the questioner expects a positive answer",
                "neither — it is a neutral question",
                "always 'yes', regardless of context"
              ],
              note: "μὴ σὺ ἀγαθὸς εἶ; = 'You're not good, are you?' (expecting 'no')." },
            { form: "neutral question",
              prompt: "How is a neutral yes-or-no question (with no slant) marked in Greek?",
              answer: "by intonation and the Greek question mark (·;·) alone, with no introductory particle",
              choices: [
                "by intonation and the Greek question mark (·;·) alone, with no introductory particle",
                "always by ἆρα at the head of the clause",
                "by οὐ at the head, like a leading 'yes' question",
                "by μή at the head, like a leading 'no' question"
              ] },
            { form: "οὐχ οὗτός ἐστιν ὁ υἱός;",
              prompt: "Translate, capturing the slant.",
              answer: "'This is the son, isn't it?' / 'Isn't this the son?' (expecting 'yes')",
              choices: [
                "'This is the son, isn't it?' / 'Isn't this the son?' (expecting 'yes')",
                "'This isn't the son, is it?' (expecting 'no')",
                "'Is this the son?' (neutral)",
                "'This is not the son.' (statement, not a question)"
              ] },
            { form: "οὐκ ἀκούετε;",
              prompt: "Translate, capturing the slant.",
              answer: "'You hear, don't you?' / 'Don't you hear?' (expecting 'yes')",
              choices: [
                "'You hear, don't you?' / 'Don't you hear?' (expecting 'yes')",
                "'You don't hear, do you?' (expecting 'no')",
                "'Do you hear?' (neutral)",
                "'You do not hear.' (statement)"
              ] },
            { form: "οὐ slant — speaker's attitude",
              prompt: "If a speaker uses an οὐ-question, what is their attitude toward the answer?",
              answer: "confident — they expect the answer to be 'yes'",
              choices: [
                "confident — they expect the answer to be 'yes'",
                "tentative or doubtful — they expect 'no'",
                "neutral — they have no expectation",
                "demanding — they want an immediate command response"
              ] },
            { form: "μὴ σὺ εἶ ὁ Χριστός;",
              prompt: "Translate, capturing the slant.",
              answer: "'You are not the Christ, are you?' (expecting 'no')",
              choices: [
                "'You are not the Christ, are you?' (expecting 'no')",
                "'Aren't you the Christ?' (expecting 'yes')",
                "'Are you the Christ?' (neutral)",
                "'You are not the Christ.' (statement)"
              ] },
            { form: "μή slant — speaker's attitude",
              prompt: "If a speaker uses a μή-question, what is their attitude toward the answer?",
              answer: "tentative or doubtful — they suspect / hope the answer is 'no'",
              choices: [
                "tentative or doubtful — they suspect / hope the answer is 'no'",
                "confident that the answer is 'yes'",
                "neutral and open to either answer",
                "demanding an immediate command response"
              ] },
            { form: "μή τι …;",
              prompt: "μή τι (with the indefinite τι) at the head of a question slants it how?",
              answer: "still 'no' — τι softens the tentative force",
              choices: [
                "still 'no' — τι softens the tentative force",
                "'yes' — confident affirmation",
                "neutral — pure information question",
                "command — 'don't do it!'"
              ] },
            { form: "οὐχ οὕτως λέγει ὁ Ἰησοῦς;",
              prompt: "Translate, capturing the slant.",
              answer: "Jesus says this, doesn't he?",
              choices: [
                "Jesus says this, doesn't he?",
                "Jesus doesn't say this, does he?",
                "is this what Jesus says?",
                "Jesus does not say this."
              ],
              note: "οὐ(χ)-question expects 'yes'; μή-question would expect 'no'." }
          ]
        },
        {
          family: "ὅτι — direct and indirect statement",
          lemma: "ὅτι",
          gloss: "that / because",
          questions: [
            { form: "indirect statement",
              prompt: "After verbs of saying, thinking, or knowing, ὅτι + indicative most often introduces…",
              answer: "an indirect statement ('he said that …')",
              choices: [
                "an indirect statement ('he said that …')",
                "a purpose clause ('in order that …')",
                "a result clause ('so that …')",
                "a temporal clause ('when …')"
              ],
              note: "λέγει ὅτι ὁ κύριος ἔρχεται = 'he says that the Lord is coming.'" },
            { form: "tense in indirect statement",
              prompt: "In Greek indirect statement with ὅτι, the verb tense matches…",
              answer: "the tense the original speaker used (Greek keeps the direct-speech tense)",
              choices: [
                "the tense the original speaker used (Greek keeps the direct-speech tense)",
                "the tense of the main verb (backshifted, as in English)",
                "always the aorist, regardless of original",
                "always the present, regardless of original"
              ],
              note: "Greek does NOT backshift like English: εἶπεν ὅτι ἔρχεται = 'he said that he was coming' (lit. 'is coming')." },
            { form: "direct statement (ὅτι recitativum)",
              prompt: "ὅτι is sometimes used to mark direct speech. In that case it is rendered…",
              answer: "left untranslated — it functions like opening quotation marks",
              choices: [
                "left untranslated — it functions like opening quotation marks",
                "as 'because' — direct speech is always causal",
                "as 'so that' — direct speech is always result",
                "as 'whether' — direct speech is always interrogative"
              ],
              note: "λέγει ὅτι· Ἐγώ εἰμι = 'he says, “I am.”'" },
            { form: "indirect vs direct test",
              prompt: "Which clue most reliably marks ὅτι as recitative (direct) rather than introducing indirect statement?",
              answer: "the following words use 1st/2nd person and present-time perspective of the original speaker (often signalled by capitalisation or ·)",
              choices: [
                "the following words use 1st/2nd person and present-time perspective of the original speaker (often signalled by capitalisation or ·)",
                "ὅτι is recitative whenever the main verb is in the present tense, regardless of what follows",
                "ὅτι is recitative whenever followed by an aorist verb in the embedded clause",
                "there is no way to tell — direct and indirect ὅτι are translated identically in English"
              ] },
            { form: "ὅτι (causal)",
              prompt: "A third use of ὅτι, distinct from direct and indirect statement, is…",
              answer: "causal — 'because'",
              choices: ["causal — 'because'", "conditional — 'if'", "concessive — 'although'", "final — 'in order that'"] },
            { form: "λέγει ὅτι Ἐγὼ οὐκ εἰμὶ ὁ Χριστός",
              prompt: "Translate, recognising ὅτι recitative.",
              answer: "'He says, “I am not the Christ.”' — ὅτι is left untranslated (opening quotation marks)",
              choices: [
                "'He says, “I am not the Christ.”' — ὅτι is left untranslated (opening quotation marks)",
                "'He says that I am not the Christ.' — indirect statement",
                "'He says because I am not the Christ.' — causal",
                "'He says in order that I might not be the Christ.' — purpose"
              ],
              note: "Tell-tale: the embedded clause uses 1st-person 'I' — that's the original speaker, not the narrator." },
            { form: "direct vs indirect signal",
              prompt: "Which feature most reliably signals a ὅτι-clause is DIRECT (recitative), not indirect?",
              answer: "the embedded clause keeps the original speaker's pronouns and tense",
              choices: [
                "the embedded clause keeps the original speaker's pronouns and tense",
                "the embedded clause uses ὅτι in second position",
                "the main verb is in the aorist tense",
                "the embedded clause is a question"
              ] },
            { form: "λέγει ὅτι Ἐγώ εἰμι",
              prompt: "Translate.",
              answer: "'He says, “I am.”' — ὅτι recitativum",
              choices: [
                "'He says, “I am.”' — ὅτι recitativum",
                "'He says that I am.' — indirect statement (he says about me)",
                "'He says because I am.' — causal",
                "'He says, “He is.”' — backshifted indirect"
              ] },
            { form: "πιστεύω ὅτι ὁ θεὸς ἀγαθός ἐστιν",
              prompt: "Translate (indirect statement with ὅτι).",
              answer: "'I believe that God is good.'",
              choices: [
                "'I believe that God is good.'",
                "'I believe, because God is good.'",
                "'I believe, in order that God may be good.'",
                "'I believe, “God is good”' (direct quote)"
              ],
              note: "Indirect statement after verbs of knowing / saying / thinking." },
            { form: "εἶπεν ὅτι ἔρχεται",
              prompt: "Translate (indirect statement; mind Greek tense usage).",
              answer: "'He said that he was coming' — Greek keeps the present tense of direct speech; English back-shifts to past",
              choices: [
                "'He said that he was coming' — Greek keeps the present tense of direct speech; English back-shifts to past",
                "'He said that he is coming' — Greek and English match in tense always",
                "'He said because he is coming' — causal",
                "'He says that he came' — Greek backshifts aorist"
              ] },
            { form: "ἀκούω ὅτι ἔρχεται ὁ κύριος.",
              prompt: "Translate.",
              answer: "I hear that the lord is coming",
              choices: [
                "I hear that the lord is coming",
                "I hear, and so the lord comes",
                "I hear because the lord is coming",
                "the lord hears that I am coming"
              ],
              note: "ὅτι + indicative after a verb of perception = indirect statement (English 'that'); ὅτι can also mean 'because'." }
          ]
        },
        {
          family: "Time expressions by case",
          lemma: "accusative / genitive / dative of time",
          gloss: "case marks the kind of time reference",
          questions: [
            { form: "duration",
              prompt: "Which case expresses duration of time ('for how long')?",
              answer: "accusative",
              choices: ["accusative", "genitive", "dative", "nominative"],
              note: "πολλὰς ἡμέρας = 'for many days'." },
            { form: "time within which",
              prompt: "Which case expresses the time within which something happens ('during', 'in the course of')?",
              answer: "genitive",
              choices: ["genitive", "accusative", "dative", "nominative"],
              note: "ἡμέρας = 'by day' / 'during the day'." },
            { form: "point in time",
              prompt: "Which case expresses a point in time ('at when', 'on what day')?",
              answer: "dative",
              choices: ["dative", "accusative", "genitive", "vocative"],
              note: "τῇ ἡμέρᾳ = 'on the day'." },
            { form: "ἡμέραν",
              prompt: "Translate this time expression.",
              answer: "'for a day' — duration",
              choices: [
                "'for a day' — duration",
                "'on a day' — point in time",
                "'within a day' — time within which",
                "'a day is…' — subject"
              ] },
            { form: "τῇ ἡμέρᾳ",
              prompt: "Translate this time expression.",
              answer: "'on the day' — point in time",
              choices: [
                "'on the day' — point in time",
                "'for the day' — duration",
                "'during the day' — time within which",
                "'the day is…' — subject"
              ] },
            { form: "ἡμέρας",
              prompt: "Translate this time expression.",
              answer: "'by day' / 'during the day' — time within which",
              choices: [
                "'by day' / 'during the day' — time within which",
                "'for a day' — duration",
                "'on the day' — point in time",
                "'the day' — subject"
              ] },
            { form: "case summary",
              prompt: "Match the case to the time idea: accusative / genitive / dative.",
              answer: "acc. = duration ('for'); gen. = time within which ('during'); dat. = point ('at / on')",
              choices: [
                "acc. = duration ('for'); gen. = time within which ('during'); dat. = point ('at / on')",
                "acc. = point; gen. = duration; dat. = within which",
                "acc. = within which; gen. = point; dat. = duration",
                "all three cases mean the same thing — case is purely stylistic"
              ] },
            { form: "πολλὰς ἡμέρας",
              prompt: "Translate this time expression.",
              answer: "'for many days' — duration",
              choices: [
                "'for many days' — duration",
                "'on a certain day' — point in time",
                "'within many days' — time within which",
                "'many days are…' — subject"
              ] },
            { form: "ὅλην τὴν ὥραν",
              prompt: "Translate this time expression.",
              answer: "'for the whole hour' / 'all hour long' — duration",
              choices: [
                "'for the whole hour' / 'all hour long' — duration",
                "'at the whole hour' — point in time",
                "'during the whole hour' — time within which",
                "'the whole hour is…' — subject"
              ],
              note: "Whenever the question is 'for how long?', look for the accusative." },
            { form: "ἡμέρας καὶ ὥρας",
              prompt: "Translate this paired time expression.",
              answer: "'by day and by hour' / 'during day and hour' — time within which",
              choices: [
                "'by day and by hour' / 'during day and hour' — time within which",
                "'for a day and an hour' — duration",
                "'on day and hour' — point in time",
                "'the day and hour' — subjects"
              ] },
            { form: "ὥρας καὶ ἡμέρας",
              prompt: "Which case is being used here for time, and why?",
              answer: "genitive — the time within which the action takes place ('during hour and day')",
              choices: [
                "genitive — the time within which the action takes place ('during hour and day')",
                "accusative — duration ('for an hour and a day')",
                "dative — point in time ('at hour and day')",
                "nominative — subject of the verb"
              ] },
            { form: "τῇ ἡμέρᾳ",
              prompt: "Translate this time expression.",
              answer: "'on the day' — point in time",
              choices: [
                "'on the day' — point in time",
                "'for a day' — duration",
                "'throughout the day' — time within which",
                "'with the day' — accompaniment"
              ] },
            { form: "ἐν ἐκείνῃ τῇ ἡμέρᾳ",
              prompt: "Translate.",
              answer: "'on that day' — dative of time (often reinforced by ἐν in Koine)",
              choices: [
                "'on that day' — dative of time (often reinforced by ἐν in Koine)",
                "'for that day' — accusative duration",
                "'during that day' — genitive within which",
                "'with that day' — dative of accompaniment"
              ],
              note: "Koine often adds ἐν + dative to express point in time, alongside the bare dative." },
            { form: "ὅλην τὴν ἡμέραν λαλεῖ.",
              prompt: "Translate.",
              answer: "he speaks all day long",
              choices: [
                "he speaks all day long",
                "on the whole day he speaks",
                "during the whole day he speaks",
                "he speaks of the whole day"
              ],
              note: "Accusative of duration: 'for how long?' — here ὅλην τὴν ἡμέραν." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "11": {
      label: "Chapter 11 Grammar",
      notes: "Special verbs — second aorists; future and aorist of liquid verbs",
      items: [
        {
          family: "11.1 Second Aorists",
          lemma: "εἶπον, ἦλθον, ἔλαβον",
          gloss: "suppletive aorist stems",
          questions: [
            { form: "λέγω",
              prompt: "What is the 2nd aorist of λέγω ('I say')?",
              answer: "εἶπον (1st sg.)",
              choices: ["εἶπον (1st sg.)", "ἔλεξα", "λέλοιπα", "ἔλαβον"],
              note: "λέγω uses a suppletive root ϝεπ-/ειπ- in the aorist." },
            { form: "ἔρχομαι",
              prompt: "What is the 2nd aorist of ἔρχομαι ('I come')?",
              answer: "ἦλθον (1st sg.)",
              choices: ["ἦλθον (1st sg.)", "ἠρχόμην", "ἐλήλυθα", "εἶπον"] },
            { form: "λαμβάνω",
              prompt: "What is the 2nd aorist of λαμβάνω ('I take')?",
              answer: "ἔλαβον (1st sg.)",
              choices: ["ἔλαβον (1st sg.)", "ἐλήμφθην", "εἴληφα", "ἔλεξα"] },
            { form: "2nd aorist endings",
              prompt: "Second-aorist active indicative endings look like which other tense?",
              answer: "imperfect (secondary endings on a different stem)",
              choices: [
                "imperfect (secondary endings on a different stem)",
                "present (primary endings)",
                "1st aorist (σα + secondary endings)",
                "future (with σ + primary endings)"
              ],
              note: "Stem reveals the tense; ending reveals person/number." },
            { form: "1st vs 2nd aorist",
              prompt: "What's the difference in meaning between a 1st and a 2nd aorist?",
              answer: "no difference in meaning — only in form. Some verbs use σα (1st aor.), others use a different stem (2nd aor.).",
              choices: [
                "no difference in meaning — only in form. Some verbs use σα (1st aor.), others use a different stem (2nd aor.).",
                "1st aorist is simple past tense; 2nd aorist marks ongoing past, like the imperfect",
                "1st aorist is for compound verbs; 2nd aorist for simple verbs",
                "2nd aorist is for compound verbs only — bare verbs always use 1st aorist"
              ] },
            { form: "εἶπεν ὁ Ἰησοῦς τὸν λόγον.",
              prompt: "Translate.",
              answer: "Jesus said the word",
              choices: [
                "Jesus said the word",
                "Jesus says the word",
                "Jesus is saying the word",
                "Jesus will say the word"
              ],
              note: "εἶπεν = 2nd aorist of λέγω, 3rd sg. (suppletive root from ἐ-ϝεπ-)." }
          ]
        },
        {
          family: "11.2 Future and Aorist of Liquid Verbs",
          lemma: "μένω, ἀποστέλλω, κρίνω",
          gloss: "stems ending in λ, μ, ν, ρ",
          questions: [
            { form: "liquid stem",
              prompt: "What four consonants define the 'liquid' verb class?",
              answer: "λ, μ, ν, ρ",
              choices: ["λ, μ, ν, ρ", "π, β, φ", "κ, γ, χ", "τ, δ, θ"] },
            { form: "future of μένω",
              prompt: "Why does μένω form its future as μενῶ rather than *μενσω?",
              answer: "Liquid stems drop the σ and contract — the future looks like an ε-contract present.",
              choices: [
                "Liquid stems drop the σ and contract — the future looks like an ε-contract present.",
                "μένω is irregular and has no future.",
                "The future is identical to the present, with no change.",
                "An iota replaces the σ between stem and ending."
              ],
              note: "μενῶ, μενεῖς, μενεῖ, μενοῦμεν, μενεῖτε, μενοῦσι(ν)." },
            { form: "μενῶ",
              prompt: "Parse this form.",
              answer: "future active indicative, 1st sg. of μένω",
              choices: [
                "future active indicative, 1st sg. of μένω",
                "present active indicative, 1st sg. of μένω",
                "imperfect active indicative, 1st sg. of μένω",
                "aorist active indicative, 1st sg. of μένω"
              ],
              note: "Liquid stems drop the future σ and ε-contract; the result mimics a contract present." },
            { form: "ἀποστέλλω → ἀποστελῶ",
              prompt: "What happens to the stem of ἀποστέλλω when forming the future?",
              answer: "the double λλ simplifies and the σ drops with contraction",
              choices: [
                "the double λλ simplifies and the σ drops with contraction",
                "the future keeps the double λλ and adds σ regularly",
                "the verb becomes ἀποστήσω (κ-aorist style)",
                "the stem is unchanged from the present"
              ],
              note: "ἀποστέλλω (pres.) → ἀποστελῶ (fut.). Liquid stems often have a present with extra consonants; the future shows the underlying stem." },
            { form: "liquid present vs future",
              prompt: "How can you tell μένω (present) from μενῶ (future) at a glance?",
              answer: "the accent: circumflex on μενῶ marks the contraction (future); μένω is a plain present.",
              choices: [
                "the accent: circumflex on μενῶ marks the contraction (future); μένω is a plain present.",
                "the breathing changes from smooth to rough in the future tense.",
                "the future adds a σ before the ending (μένσω), like a stop-stem verb.",
                "the future has an ε- augment, just like the imperfect or aorist."
              ],
              note: "Liquid futures look like ε-contract presents — accent is the diagnostic." },
            { form: "aorist of μένω",
              prompt: "What is the aorist of μένω, and how is it formed?",
              answer: "ἔμεινα — augment + stem with vowel-lengthening (ε → ει) + α + secondary endings (NO σ)",
              choices: [
                "ἔμεινα — augment + stem with vowel-lengthening (ε → ει) + α + secondary endings (NO σ)",
                "ἔμενσα — augment + stem + σα + endings (regular 1st aorist)",
                "ἔμεινον — 2nd aorist on a different stem",
                "μενῶ — same as the future"
              ],
              note: "Liquid aorists drop the σ but keep the α and the secondary endings (-α, -ας, -ε, -αμεν, -ατε, -αν)." },
            { form: "ἀπέστειλα",
              prompt: "Parse this verb form.",
              answer: "aorist active indicative, 1st sg. of ἀποστέλλω ('I sent')",
              choices: [
                "aorist active indicative, 1st sg. of ἀποστέλλω ('I sent')",
                "future active indicative, 1st sg.",
                "imperfect active indicative, 1st sg.",
                "perfect active indicative, 1st sg."
              ],
              note: "Liquid aorist: ἀπ- (prefix) + ε- (augment) + στειλ- (raised stem, originally στελ-) + -α (secondary ending)." },
            { form: "ἀπέστειλεν τοὺς μαθητάς.",
              prompt: "Translate.",
              answer: "he sent the disciples",
              choices: [
                "he sent the disciples",
                "he sends the disciples",
                "he will send the disciples",
                "the disciples were sent"
              ],
              note: "ἀπέστειλεν = liquid aorist of ἀποστέλλω (vowel-raised stem στειλ-, no σ, secondary endings)." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "12": {
      label: "Chapter 12 Grammar",
      notes: "Third declension part 1 — the essence; masc/fem consonant stems; neuter consonant stems; adjectives with consonant stems; τις vs τίς",
      items: [
        {
          family: "12.1 The Essence of the 3rd Declension",
          lemma: "3rd declension",
          gloss: "stem ends in a consonant",
          questions: [
            { form: "essence",
              prompt: "What distinguishes a 3rd-declension noun from 1st/2nd-declension nouns?",
              answer: "its stem ends in a consonant (not -α/-η or -ο)",
              choices: [
                "its stem ends in a consonant (not -α/-η or -ο)",
                "it is always masculine",
                "it never takes the article",
                "it has no plural forms"
              ] },
            { form: "general rule",
              prompt: "How do you find the true 3rd-declension stem of a noun?",
              answer: "drop -ος from the genitive singular",
              choices: [
                "drop -ος from the genitive singular",
                "drop -ς from the nominative singular",
                "drop -ι from the dative singular",
                "look it up — there is no rule"
              ],
              note: "That's why the lexicon lists both nom. AND gen. sg.: σάρξ, σαρκός — the gen. shows the real stem σαρκ-." },
            { form: "ending series",
              prompt: "What is the typical 3rd-declension ending series in the singular (any gender)?",
              answer: "nom. = -ς (or zero), gen. = -ος, dat. = -ι, acc. = -α (or -ν after a vowel)",
              choices: [
                "nom. = -ς (or zero), gen. = -ος, dat. = -ι, acc. = -α (or -ν after a vowel)",
                "-ος, -ου, -ῳ, -ον (2nd decl. pattern)",
                "-η, -ης, -ῃ, -ην (1st decl. pattern)",
                "no fixed pattern — every noun is unique"
              ] },
            { form: "ὁ πατὴρ ἀκούει τὸν υἱόν.",
              prompt: "Translate.",
              answer: "the father hears the son",
              choices: [
                "the father hears the son",
                "the son hears the father",
                "the fathers hear the son",
                "the father's son hears"
              ],
              note: "πατήρ, πατρός = 3rd-decl. masc. consonant stem; nom. sg. has zero ending, stem-vowel lengthens." }
          ]
        },
        {
          family: "12.2 Masculine and Feminine Nouns with Consonant Stems",
          lemma: "σάρξ, ἄρχων, ποιμήν",
          gloss: "masc/fem consonant stems",
          questions: [
            { form: "σάρξ, σαρκός",
              prompt: "What stem class is this?",
              answer: "κ-stem (a velar stem)",
              choices: ["κ-stem (a velar stem)", "ν-stem", "ντ-stem", "ματ-stem (neuter)"],
              note: "Nominative σάρξ < σαρκ-ς (velar + σ → ξ). The genitive σαρκός shows the bare stem." },
            { form: "ἄρχων, ἄρχοντος",
              prompt: "What stem class is this?",
              answer: "ντ-stem",
              choices: ["ντ-stem", "ν-stem", "κ-stem", "σ-stem"],
              note: "ντ drops before σ in the nom. sg. (and in the dat. pl.)." },
            { form: "ποιμήν, ποιμένος",
              prompt: "What stem class is this?",
              answer: "ν-stem",
              choices: ["ν-stem", "ντ-stem", "κ-stem", "ματ-stem (neuter)"] },
            { form: "νύξ, νυκτός",
              prompt: "What does the gen. sg. νυκτός tell you about the stem?",
              answer: "the stem is νυκτ- (a dental + κ); ν + κ + τ + σ → ξ in the nom. sg.",
              choices: [
                "the stem is νυκτ- (a dental + κ); ν + κ + τ + σ → ξ in the nom. sg.",
                "the stem is νυξ- and the gen. is suppletive",
                "the stem is νυ- and -κτος is a unique ending",
                "the noun is indeclinable"
              ] },
            { form: "ὁ ἄρχων λέγει τὸν λόγον.",
              prompt: "Translate.",
              answer: "the ruler speaks the word",
              choices: [
                "the ruler speaks the word",
                "the rulers speak the word",
                "the word rules the speaker",
                "the ruler is the word"
              ],
              note: "ἄρχων, ἄρχοντος = ντ-stem; the τ drops before σ in the nom. sg." }
          ]
        },
        {
          family: "12.3 Neuter Nouns with Consonant Stems",
          lemma: "πνεῦμα, σῶμα, ὄνομα",
          gloss: "ματ-stem neuters",
          questions: [
            { form: "πνεῦμα, πνεύματος",
              prompt: "What stem class is this?",
              answer: "ματ-stem (neuter)",
              choices: ["ματ-stem (neuter)", "ν-stem", "κ-stem", "ι-stem"],
              note: "ματ-stem neuters: nom./acc. sg. drops the τ; gen. sg. shows the full stem." },
            { form: "neuter rule (1)",
              prompt: "What rule about neuter nouns carries over from the 2nd declension into the 3rd?",
              answer: "neuter nom. and acc. are ALWAYS identical (singular and plural)",
              choices: [
                "neuter nom. and acc. are ALWAYS identical (singular and plural)",
                "neuters have no plural in the third declension at all",
                "neuters never take the article — that's reserved for masc. and fem.",
                "neuters are always 3rd declension, never 1st or 2nd"
              ] },
            { form: "neuter plural",
              prompt: "What ending characterises the nom./acc. plural of 3rd-declension neuters?",
              answer: "-α (e.g., πνεύματα, σώματα)",
              choices: ["-α (e.g., πνεύματα, σώματα)", "-οι", "-α like 2nd-decl. neuter but stays short", "-ες"],
              note: "Same vowel as the 2nd-decl. neuter pl. (ἔργα), but on a different stem." },
            { form: "τὸ πνεῦμα τοῦ θεοῦ ἔρχεται.",
              prompt: "Translate.",
              answer: "the Spirit of God is coming",
              choices: [
                "the Spirit of God is coming",
                "the Spirit comes to God",
                "God comes by the Spirit",
                "the spirits of God come"
              ],
              note: "πνεῦμα, πνεύματος = ματ-stem neuter; nom./acc. sg. drops the final τ." }
          ]
        },
        {
          family: "12.4 Adjectives with Consonant Stems",
          lemma: "ἀληθής, -ές",
          gloss: "3rd-decl adjectives",
          questions: [
            { form: "3-decl adjective formation",
              prompt: "How does a 3rd-declension adjective like ἀληθής differ from a 2-1-2 adjective like ἀγαθός?",
              answer: "all genders use 3rd-decl. consonant-stem endings; masc. and fem. share forms",
              choices: [
                "all genders use 3rd-decl. consonant-stem endings; masc. and fem. share forms",
                "it never declines — indeclinable, like Hebrew names such as Ἀβραάμ",
                "it uses 1st-decl endings throughout, like a feminine noun",
                "it has no neuter form — masc. and fem. only, like an animate adjective"
              ] },
            { form: "ἀληθής",
              prompt: "Parse this form (paired with a masc. noun like λόγος).",
              answer: "nom. sg. masc. or fem. — 'true'",
              choices: [
                "nom. sg. masc. or fem. — 'true'",
                "gen. sg. — 'of true'",
                "dat. sg. — 'to/for true'",
                "acc. pl. — 'true ones'"
              ] },
            { form: "ἀληθές",
              prompt: "Parse this form.",
              answer: "nom./acc. sg. neuter — 'true'",
              choices: [
                "nom./acc. sg. neuter — 'true'",
                "nom. sg. masc.",
                "vocative sg. masc.",
                "gen. sg."
              ],
              note: "3-1 (=3-3) adjective: masc./fem. = -ής, neuter = -ές. Same -ς/-ς pattern as σ-stem nouns." },
            { form: "ἀληθὴς ὁ λόγος.",
              prompt: "Translate.",
              answer: "the word is true",
              choices: [
                "the word is true",
                "the true word",
                "truly, the word!",
                "the word of truth"
              ],
              note: "ἀληθής (3-decl. σ-stem adj.) in predicate position — εἰμί understood." }
          ]
        },
        {
          family: "12.5 τις and τίς",
          lemma: "τις / τίς",
          gloss: "someone vs who?",
          questions: [
            { form: "τίς",
              prompt: "What does τίς (accent on the ι) mean?",
              answer: "'who? / what?' — interrogative (accent fixed on the first syllable)",
              parsed: "nominative singular masculine/feminine",
              choices: [
                "'who? / what?' — interrogative (accent fixed on the first syllable)",
                "'someone / something' — enclitic indefinite",
                "'a certain one' — adjective",
                "'this' — demonstrative"
              ] },
            { form: "τις",
              prompt: "What does τις (no accent or enclitic) mean?",
              answer: "'someone / something' — enclitic indefinite",
              choices: [
                "'someone / something' — enclitic indefinite",
                "'who? / what?' — interrogative",
                "'this' — demonstrative",
                "'the' — article"
              ],
              note: "ἄνθρωπός τις = 'a certain man'. The enclitic τις leans on the previous word." },
            { form: "τίς vs τις",
              prompt: "What is the SINGLE diagnostic that distinguishes interrogative τίς from indefinite τις?",
              answer: "the accent — τίς keeps a fixed acute on the first syllable; τις is enclitic and usually unaccented",
              choices: [
                "the accent — τίς keeps a fixed acute on the first syllable; τις is enclitic and usually unaccented",
                "their form differs completely — they are unrelated words with no shared declension",
                "they appear in different cases only — τίς is nominative-only, τις is oblique-only",
                "τίς is always plural; τις is always singular — the accent marks number, not function"
              ] },
            { form: "τις declension",
              prompt: "What declension do τίς and τις follow?",
              answer: "3rd declension",
              choices: [
                "3rd declension",
                "1st declension",
                "2nd declension — like a masculine 2nd-decl. noun, with -ος endings",
                "indeclinable — the feminine never changes form across cases"
              ] },
            { form: "ἄνθρωπός τις ἔρχεται.",
              prompt: "Translate.",
              answer: "a certain man is coming",
              choices: [
                "a certain man is coming",
                "who is coming?",
                "the man is coming",
                "some men are coming"
              ],
              note: "Enclitic τις (no accent of its own) = indefinite 'someone, a certain'." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "13": {
      label: "Chapter 13 Grammar",
      notes: "Third declension part 2 — vowel stems; contracting nouns/adjectives; πᾶς; εἷς",
      items: [
        {
          family: "13.1 Vowel Stems",
          lemma: "πόλις, βασιλεύς, ἔθνος",
          gloss: "ι-stems, ευ-stems, σ-stems",
          questions: [
            { form: "πίστις, πίστεως",
              prompt: "What stem class is this common NT noun?",
              answer: "ι-stem (feminine)",
              choices: ["ι-stem (feminine)", "σ-stem (neuter)", "ευ-stem (masc.)", "ντ-stem"],
              note: "πίστις ('faith') is among the most frequent NT ι-stem nouns: πίστις, πίστεως, πίστει, πίστιν." },
            { form: "βασιλεύς, βασιλέως",
              prompt: "What stem class is this?",
              answer: "ευ-stem (masc.)",
              choices: ["ευ-stem (masc.)", "ι-stem", "σ-stem (neuter)", "ντ-stem"] },
            { form: "ἔθνος, ἔθνους",
              prompt: "What stem class is this NT noun?",
              answer: "σ-stem (neuter)",
              choices: ["σ-stem (neuter)", "ντ-stem", "ι-stem", "ευ-stem (masc.)"],
              note: "ἔθνος ('nation, Gentiles') declines just like γένος: ἔθνος, ἔθνους, ἔθνει, ἔθνος; pl. ἔθνη, ἐθνῶν, ἔθνεσι(ν), ἔθνη." },
            { form: "vowel-stem signal",
              prompt: "What ending in the genitive singular is a tell-tale sign of a ι-stem or ευ-stem noun?",
              answer: "-εως (e.g., πόλεως, βασιλέως)",
              choices: [
                "-εως (e.g., πόλεως, βασιλέως)",
                "-ος (e.g., σαρκός)",
                "-ων (e.g., νυκτῶν)",
                "-ι (e.g., πατρί)"
              ] },
            { form: "ἡ πίστις σῴζει τὸν ἄνθρωπον.",
              prompt: "Translate.",
              answer: "faith saves the man",
              choices: [
                "faith saves the man",
                "the man saves the faith",
                "by faith the man saves",
                "the men have faith"
              ],
              note: "πίστις, πίστεως = 3rd-decl. ι-stem feminine." }
          ]
        },
        {
          family: "13.2 Contracting Nouns and Adjectives",
          lemma: "γένος, ἀληθής",
          gloss: "vowel contractions in declension",
          questions: [
            { form: "γένει",
              prompt: "Why does the dative sg. look like this rather than *γένεσ-ι?",
              answer: "Intervocalic σ dropped, then ε + ι → ει",
              choices: [
                "Intervocalic σ dropped, then ε + ι → ει",
                "It's irregular and unrelated to γένος",
                "It's actually a 2nd-declension form",
                "It's a vocative"
              ] },
            { form: "γένους",
              prompt: "Why does the gen. sg. of γένος look like γένους instead of *γένεσος?",
              answer: "the σ drops between two vowels and then ε + ο → ου (contraction)",
              choices: [
                "the σ drops between two vowels and then ε + ο → ου (contraction)",
                "γένους is an irregular form unrelated to γένος",
                "the gen. sg. ending is -ους in 3rd-decl. neuters by rule",
                "γένους is actually a plural"
              ],
              note: "Same intervocalic-σ-drop logic that gave us the -εω verb future endings in Ch 6." },
            { form: "contracting adjective",
              prompt: "Why does the genitive of ἀληθής, -ές appear as ἀληθοῦς instead of *ἀληθέσος?",
              answer: "σ drops between vowels and ε + ο → ου, exactly like the σ-stem nouns",
              choices: [
                "σ drops between vowels and ε + ο → ου, exactly like the σ-stem nouns",
                "the genitive is suppletive and unrelated",
                "the genitive is identical to the nominative",
                "ἀληθής is indeclinable"
              ] },
            { form: "τὸ ἔθνος ἀκούει τὸν λόγον.",
              prompt: "Translate.",
              answer: "the nation hears the word",
              choices: [
                "the nation hears the word",
                "the nations hear the word",
                "the word hears the nation",
                "the nation is heard"
              ],
              note: "ἔθνος, ἔθνους = σ-stem neuter; the σ between vowels drops, and the vowels contract." }
          ]
        },
        {
          family: "13.3 πᾶς (All/Every)",
          lemma: "πᾶς, πᾶσα, πᾶν",
          gloss: "every / all",
          questions: [
            { form: "πᾶς formation",
              prompt: "What declension pattern does πᾶς use?",
              answer: "3-1-3 — masc./neut. 3rd-decl., fem. 1st-decl.",
              choices: [
                "3-1-3 — masc./neut. 3rd-decl., fem. 1st-decl.",
                "fully 2-1-2 like καλός — all three genders use adjective endings",
                "fully 3rd declension throughout",
                "indeclinable — the feminine never changes form across cases"
              ] },
            { form: "πᾶς vs ὁ πᾶς",
              prompt: "How do πᾶς ὁ ἄνθρωπος and ὁ πᾶς ἄνθρωπος typically differ in nuance?",
              answer: "predicate πᾶς = 'every / all' (distributive); attributive ὁ πᾶς = 'the whole' (collective)",
              choices: [
                "predicate πᾶς = 'every / all' (distributive); attributive ὁ πᾶς = 'the whole' (collective)",
                "they are interchangeable — Koine collapses the two tenses entirely",
                "ὁ πᾶς is unattested — only πᾶς ὁ ἄνθρωπος is grammatical",
                "πᾶς is restricted to 'every' (singular); ὁ πᾶς to 'all' (plural)"
              ],
              note: "Bare πᾶς + noun is also common: πᾶς ἄνθρωπος = 'every man'." },
            { form: "πάντα",
              prompt: "Parse this form of πᾶς.",
              answer: "acc. sg. masc. OR nom./acc. pl. neuter",
              choices: [
                "acc. sg. masc. OR nom./acc. pl. neuter",
                "only acc. sg. masc. — '(every / all) thing'",
                "only nom. pl. neuter — 'all things' as subject only",
                "only dat. pl. — 'to / for all', regardless of gender"
              ],
              note: "Context decides. πάντα ποιεῖ = 'he does all things'." },
            { form: "πᾶς ἄνθρωπος ἀκούει τὸν λόγον.",
              prompt: "Translate.",
              answer: "every person hears the word",
              choices: [
                "every person hears the word",
                "all the people hear the word",
                "the whole person hears the word",
                "everyone hears all words"
              ],
              note: "πᾶς + anarthrous noun = 'every'; πᾶς + arthrous noun = 'all the …'." }
          ]
        },
        {
          family: "13.4 εἷς — One",
          lemma: "εἷς, μία, ἕν",
          gloss: "the number 'one'",
          questions: [
            { form: "εἷς formation",
              prompt: "What declension pattern does εἷς use?",
              answer: "3-1-3 — masc./neut. are 3rd-declension (εἷς, ἕν), fem. is 1st-declension (μία)",
              choices: [
                "3-1-3 — masc./neut. are 3rd-declension (εἷς, ἕν), fem. is 1st-declension (μία)",
                "fully 2-1-2 like καλός — all three genders use adjective endings",
                "indeclinable — εἷς never changes form across cases or genders",
                "uses 2nd-decl endings throughout — masc., fem., and neut. share -ος / -ου / -ῳ / -ον"
              ] },
            { form: "εἷς, μία, ἕν",
              prompt: "Translate.",
              answer: "'one' — the cardinal number, declined like an adjective",
              choices: [
                "'one' — the cardinal number, declined like an adjective",
                "'first' — ordinal number",
                "'a, an' — indefinite article (Greek has no indefinite article)",
                "'this' — demonstrative"
              ],
              note: "Singular only (you can't have plural 'ones')." },
            { form: "εἷς vs εἰς",
              prompt: "How do you distinguish εἷς ('one') from εἰς ('into')?",
              answer: "the rough breathing and accent on εἷς; εἰς is unaccented and smooth-breathing",
              choices: [
                "the rough breathing and accent on εἷς; εἰς is unaccented and smooth-breathing",
                "they are the same word — context decides 'one' vs 'into' each time",
                "εἷς is the plural form; εἰς is the singular (an accent-only contrast)",
                "one is a noun, the other a verb — they belong to different word classes"
              ] },
            { form: "εἷς ἐστιν ὁ θεός.",
              prompt: "Translate.",
              answer: "God is one",
              choices: [
                "God is one",
                "one is the god",
                "there is no God",
                "God is alone"
              ],
              note: "εἷς, μία, ἕν = the cardinal 'one' — declined; here masc. nom. sg. as predicate." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "14": {
      label: "Chapter 14 Grammar",
      notes: "Participles — formation, declension, meaning (aspect/voice/relative time), and uses",
      items: [
        {
          family: "14.1 Formation",
          lemma: "participle formation",
          gloss: "stems and markers",
          questions: [
            { form: "present active participle marker",
              prompt: "What is the participial marker for the present ACTIVE participle?",
              answer: "-ντ- (added to the stem before the case ending; e.g., λυ-ο-ντ → λύων, λύοντος)",
              choices: [
                "-ντ- (added to the stem before the case ending; e.g., λυ-ο-ντ → λύων, λύοντος)",
                "-μεν- (the middle/passive participial marker, e.g., λυόμενος)",
                "-θη- (the aorist passive marker, used for participles and finite forms)",
                "no marker — the participle is just the stem with adjective endings glued on"
              ] },
            { form: "present middle/passive participle marker",
              prompt: "What is the participial marker for the present MIDDLE/PASSIVE participle?",
              answer: "-μεν-",
              choices: [
                "-μεν-",
                "-ντ-",
                "-θη-",
                "-σα-"
              ],
              note: "Example: λυ-ο-μεν-ος → λυόμενος, -η, -ον — a regular 2-1-2 adjective." },
            { form: "aorist active participle marker",
              prompt: "What is the participial marker for the AORIST ACTIVE participle (1st aor.)?",
              answer: "-σαντ- (with no augment; e.g., λύ-σαντ → λύσας, λύσαντος)",
              choices: [
                "-σαντ- (with no augment; e.g., λύ-σαντ → λύσας, λύσαντος)",
                "ε- (augment) + -σαντ- — the augment carries past time",
                "-μεν- (the middle/passive participial marker, used regardless of tense)",
                "-θεντ- (the marker used for the aorist active in 1st-aorist verbs)"
              ],
              note: "NO AUGMENT on the participle — the augment is restricted to indicative forms." },
            { form: "ὁ λύων τὸν δοῦλον λέγει.",
              prompt: "Translate.",
              answer: "the one untying the slave is speaking",
              choices: [
                "the one untying the slave is speaking",
                "he unties the slave and speaks",
                "the slave untied speaks",
                "untie the slave! he is speaking"
              ],
              note: "λύων = pres. act. participle, masc. nom. sg.; substantive use ('the one who is …')." }
          ]
        },
        {
          family: "14.2 Declension",
          lemma: "participle declension",
          gloss: "which endings each takes",
          questions: [
            { form: "active masc/neut decl.",
              prompt: "What declension do active and aorist-passive participles use in the masculine and neuter?",
              answer: "3rd declension (on the -ντ- or -θεντ- stem)",
              choices: [
                "3rd declension (on the -ντ- or -θεντ- stem)",
                "2nd declension throughout",
                "1st declension throughout",
                "indeclinable — the feminine never changes form across cases"
              ] },
            { form: "active fem decl.",
              prompt: "What declension do active and aorist-passive participles use in the feminine?",
              answer: "1st declension — using -ουσα / -σασα / -θεῖσα",
              choices: [
                "1st declension — using -ουσα / -σασα / -θεῖσα",
                "3rd declension like the masculine — same -ντ-/-θεντ- stem",
                "2nd declension — like a masculine 2nd-decl. noun, with -ος endings",
                "indeclinable — the feminine never changes form across cases"
              ],
              note: "So active participles are 3-1-3, exactly like πᾶς." },
            { form: "middle/passive decl.",
              prompt: "What declension do middle/passive participles use?",
              answer: "2-1-2 — like any regular 2-1-2 adjective",
              choices: [
                "2-1-2 — like any regular 2-1-2 adjective",
                "3-1-3 like the active",
                "1st declension throughout",
                "3rd declension throughout"
              ],
              note: "The -μεν- marker turns the participle into a regular 2-1-2 adjective." },
            { form: "βλέπομεν τοὺς λύοντας.",
              prompt: "Translate.",
              answer: "we see the ones untying",
              choices: [
                "we see the ones untying",
                "we see the ones who untied",
                "the ones untying see us",
                "we are seen by the untying ones"
              ],
              note: "λύοντας = acc. pl. masc. — present active participle uses 3rd-declension endings on the ντ-stem." }
          ]
        },
        {
          family: "14.3 Meaning",
          lemma: "participle aspect, voice, relative time",
          gloss: "what a participle tense conveys",
          questions: [
            { form: "participle time",
              prompt: "Within a clause, what does a participle's tense primarily encode?",
              answer: "aspect — with relative time",
              choices: [
                "aspect — with relative time",
                "absolute past, present, or future time, just like the indicative",
                "mood",
                "person and number — the tense form encodes who/how many"
              ],
              note: "Present participle = action simultaneous with the main verb; aorist participle = action prior to it." },
            { form: "λύων (when?)",
              prompt: "If the main verb is past, when does the action of a PRESENT participle (e.g., λύων) typically occur?",
              answer: "simultaneously with the main verb ('while untying')",
              choices: [
                "simultaneously with the main verb ('while untying')",
                "before the main verb",
                "after the main verb",
                "always in present time, regardless of main verb"
              ] },
            { form: "λύσας (when?)",
              prompt: "If the main verb is past, when does the action of an AORIST participle (e.g., λύσας) typically occur?",
              answer: "before the main verb ('after untying')",
              choices: [
                "before the main verb ('after untying')",
                "simultaneously with the main verb",
                "after the main verb",
                "always in the present"
              ],
              note: "Aorist participle = prior action; present participle = simultaneous action. The participle's tense is relative, not absolute." },
            { form: "voice in participles",
              prompt: "How is voice signalled on a participle?",
              answer: "by its stem/marker: -ντ- / -μεν- / -θεντ-",
              choices: [
                "by its stem/marker: -ντ- / -μεν- / -θεντ-",
                "by its case ending",
                "by its accent",
                "voice cannot be told from a participle"
              ] },
            { form: "λύσας τὸν δοῦλον, ἀκούει.",
              prompt: "Translate.",
              answer: "after untying the slave, he hears",
              choices: [
                "after untying the slave, he hears",
                "while untying the slave, he hears",
                "before he hears, he unties the slave",
                "untying the slave, he was heard"
              ],
              note: "Aorist participle = action PRIOR to the main verb ('after / having ___ed')." }
          ]
        },
        {
          family: "14.4 Other Uses",
          lemma: "participle in context",
          gloss: "attributive / adverbial / substantive",
          questions: [
            { form: "ὁ λύων ἄνθρωπος",
              prompt: "What is the function of λύων here?",
              answer: "attributive — 'the man who is untying'",
              choices: [
                "attributive — 'the man who is untying'",
                "adverbial (circumstantial) — 'while untying, the man …'",
                "substantive — used as a noun, 'the one untying (the slave)'",
                "predicate — 'the man is untying'"
              ],
              note: "Article–participle–noun = attributive position." },
            { form: "ὁ λύων",
              prompt: "What is the function of λύων here (no noun)?",
              answer: "substantive — 'the one who is untying'",
              choices: [
                "substantive — 'the one who is untying'",
                "attributive — 'the untying [thing]'",
                "adverbial — 'while untying'",
                "predicate"
              ] },
            { form: "λύων τὸν δοῦλον, ἀπῆλθεν.",
              prompt: "What is the function of λύων here?",
              answer: "adverbial (circumstantial) — 'after / while untying the slave, he went away'",
              choices: [
                "adverbial (circumstantial) — 'after / while untying the slave, he went away'",
                "attributive — the participle agrees with and modifies the subject",
                "substantive — used as a noun, 'the one untying (the slave)'",
                "imperative — a command directed at the subject, 'untie the slave!'"
              ],
              note: "An anarthrous participle agreeing with the subject is normally circumstantial." },
            { form: "οἱ πιστεύοντες εἰς τὸν Χριστὸν ἔχουσι ζωήν.",
              prompt: "Translate.",
              answer: "those who believe in Christ have life",
              choices: [
                "those who believe in Christ have life",
                "the believing Christ has life",
                "those who hear Christ believe in life",
                "Christ is believed by the living"
              ],
              note: "Article + plural participle = 'those who ___' (substantive)." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "15": {
      label: "Chapter 15 Grammar",
      notes: "The passive and voices — idea of the passive, all three voices, distinguishing passive tenses, meaning of the passive, passive endings, the middle, and passive deponents",
      items: [
        {
          family: "15.1 The Idea of the Passive",
          lemma: "passive voice",
          gloss: "the subject is acted upon",
          questions: [
            { form: "passive",
              prompt: "What does the passive voice express?",
              answer: "the subject is acted upon",
              choices: [
                "the subject is acted upon",
                "the subject performs the action",
                "the subject acts on itself",
                "no subject is implied"
              ] },
            { form: "active vs passive",
              prompt: "How does 'ὁ κύριος λύει τὸν δοῦλον' differ from 'ὁ δοῦλος λύεται ὑπὸ τοῦ κυρίου'?",
              answer: "active: 'the master unties the slave'; passive: 'the slave is untied by the master'",
              choices: [
                "active: 'the master unties the slave'; passive: 'the slave is untied by the master'",
                "they mean entirely different things — the events described are unrelated",
                "only the passive describes a real event; the active is a hypothetical",
                "they differ in tense, not in voice — the action is the same in both cases"
              ] },
            { form: "why a passive",
              prompt: "Why does Greek (and English) bother with a passive voice?",
              answer: "to bring the patient (the thing affected) to the subject position when that's what the speaker wants to focus on",
              choices: [
                "to bring the patient (the thing affected) to the subject position when that's what the speaker wants to focus on",
                "because the passive can express ideas (like depersonalised action) that the active cannot reach",
                "passive is grammatically required after certain verbs (verbs of motion, perception, etc.)",
                "passive is purely decorative — it adds no syntactic or pragmatic information"
              ] },
            { form: "ὁ δοῦλος λύεται.",
              prompt: "Translate.",
              answer: "the slave is being untied",
              choices: [
                "the slave is being untied",
                "the slave unties himself",
                "the slave unties",
                "the slave was untied"
              ],
              note: "Present middle/passive 3rd sg. — context decides middle vs passive; here passive." }
          ]
        },
        {
          family: "15.2 Voices",
          lemma: "active / middle / passive",
          gloss: "the three voices",
          questions: [
            { form: "active",
              prompt: "What does the active voice express?",
              answer: "the subject performs the action",
              choices: [
                "the subject performs the action",
                "the subject receives the action",
                "the subject acts on / for itself",
                "no agent is implied"
              ] },
            { form: "middle",
              prompt: "What does the middle voice typically express?",
              answer: "the subject acts on or for itself (or with personal involvement)",
              choices: [
                "the subject acts on or for itself (or with personal involvement)",
                "the subject performs the action on someone else",
                "the subject is acted upon by an external agent",
                "the action is impersonal"
              ] },
            { form: "voices count",
              prompt: "How many voices does Greek have?",
              answer: "three — active, middle, passive",
              choices: [
                "three — active, middle, passive",
                "two — active and passive only",
                "four — active, middle, passive, deponent",
                "one — only active"
              ] },
            { form: "ὁ ἄρτος ἐσθίεται ὑπὸ τοῦ λαοῦ.",
              prompt: "Translate.",
              answer: "the bread is eaten by the people",
              choices: [
                "the bread is eaten by the people",
                "the bread eats the people",
                "the people eat for the bread",
                "the people are eaten by the bread"
              ],
              note: "ὑπό + genitive marks the personal agent of a passive verb." }
          ]
        },
        {
          family: "15.3 Distinguishing the (Passive) Tenses",
          lemma: "passive tenses",
          gloss: "spotting passive forms",
          questions: [
            { form: "present/imperfect passive",
              prompt: "In the present and imperfect, what tells you a form is passive (rather than middle)?",
              answer: "nothing in the form — context decides",
              choices: [
                "nothing in the form — context decides",
                "a θη in the middle of the form",
                "an extra σ before the endings",
                "the augment becomes η-, not ε-"
              ] },
            { form: "aorist passive — a simple completed event in the past",
              prompt: "What feature distinguishes the AORIST PASSIVE from the aorist middle and active?",
              answer: "the θη morpheme between the stem and the personal endings (with ACTIVE endings, not middle)",
              choices: [
                "the θη morpheme between the stem and the personal endings (with ACTIVE endings, not middle)",
                "the σα morpheme — the same shape as the 1st aorist active, but with middle endings",
                "the middle endings -μαι, -σαι, -ται on a plain aorist stem",
                "nothing in the form — only the surrounding ὑπό + gen. tells you it is passive"
              ],
              note: "ἐ-λύ-θη-ν. The aorist passive uses ACTIVE-style secondary endings on the θη stem." },
            { form: "future passive",
              prompt: "What feature distinguishes the FUTURE PASSIVE from the future middle?",
              answer: "the θη morpheme plus a σ, then middle/passive endings: -θησ-ομαι, -θησ-ῃ, -θησ-εται…",
              choices: [
                "the θη morpheme plus a σ, then middle/passive endings: -θησ-ομαι, -θησ-ῃ, -θησ-εται…",
                "nothing — future middle and passive use identical endings throughout",
                "the σ alone — future middle drops the σ between vowels",
                "an augment ε- on the future, like a past indicative ε-prefix"
              ] },
            { form: "ἐλύθη ὁ δοῦλος.",
              prompt: "Translate.",
              answer: "the slave was untied",
              choices: [
                "the slave was untied",
                "the slave is being untied",
                "the slave will be untied",
                "the slave was untying"
              ],
              note: "ἐ- + stem + θη + secondary endings = aorist passive." }
          ]
        },
        {
          family: "15.4 The Meaning of the Passive",
          lemma: "agent / instrument",
          gloss: "expressing the doer of a passive verb",
          questions: [
            { form: "agent",
              prompt: "How is the personal agent of a passive verb most often expressed?",
              answer: "ὑπό + genitive",
              choices: ["ὑπό + genitive", "ἐν + dative", "διά + accusative", "πρός + accusative"] },
            { form: "instrument",
              prompt: "How is an IMPERSONAL instrument expressed with a passive verb?",
              answer: "bare dative — or ἐν + dat.",
              choices: [
                "bare dative — or ἐν + dat.",
                "always ὑπό + gen. (the personal-agent construction, even for things)",
                "the bare accusative — Greek's all-purpose adverbial case",
                "διά + acc."
              ],
              note: "Same logic introduced in Ch 4.3 — personal agent vs impersonal instrument." },
            { form: "ἐλύθη ὑπὸ τοῦ ἀποστόλου",
              prompt: "Translate.",
              answer: "'He / she / it was untied BY the apostle' — ὑπό + gen. = personal agent",
              choices: [
                "'He / she / it was untied BY the apostle' — ὑπό + gen. = personal agent",
                "'He / she / it was untied UNDER the apostle' (locative)",
                "'He / she / it untied the apostle' (active)",
                "'He / she / it untied for himself the apostle' (middle)"
              ] },
            { form: "ἐβαπτίσθην ὑπὸ τοῦ ἀποστόλου.",
              prompt: "Translate.",
              answer: "I was baptized by the apostle",
              choices: [
                "I was baptized by the apostle",
                "the apostle was baptized by me",
                "I baptize the apostle",
                "I will baptize the apostle"
              ],
              note: "Aorist passive 1st sg. (-θην) with ὑπό + gen. of personal agent." }
          ]
        },
        {
          family: "15.5 The Passive Endings",
          lemma: "-μαι / -θην",
          gloss: "present/imperf vs aorist endings",
          questions: [
            { form: "present m/p endings",
              prompt: "Which endings does the present middle/passive use?",
              answer: "-μαι, -σαι (→ -ῃ), -ται, -μεθα, -σθε, -νται (primary middle endings)",
              choices: [
                "-μαι, -σαι (→ -ῃ), -ται, -μεθα, -σθε, -νται (primary middle endings)",
                "-ω, -εις, -ει, -ομεν, -ετε, -ουσι (active endings)",
                "-ν, -ς, _, -μεν, -τε, -σαν (secondary active)",
                "-θην, -θης, -θη, -θημεν, -θητε, -θησαν (aorist passive)"
              ] },
            { form: "ἐλύθη",
              prompt: "What signals that this is aorist passive?",
              answer: "the θ + η (θη morpheme) before the personal ending",
              choices: [
                "the θ + η (θη morpheme) before the personal ending",
                "the augment ε- alone, since passives always carry past time",
                "the σ before the ending, like the future or aorist active",
                "the κ before the ending, like the perfect active"
              ],
              note: "ἐ-λύ-θη: augment + stem + θη + ending. Same θη appears in the future passive (-θησ-)." },
            { form: "λυθήσομαι",
              prompt: "Parse the tense and voice.",
              answer: "future passive (1st sg. middle/passive ending)",
              parsed: "future passive indicative first person singular",
              choices: [
                "future passive (1st sg. middle/passive ending)",
                "aorist passive (1st sg.)",
                "future middle (1st sg.)",
                "imperfect middle/passive (1st sg.)"
              ],
              note: "Future passive is built on the aorist passive stem + σ + middle endings." },
            { form: "λυθήσομαι.",
              prompt: "Translate.",
              answer: "I will be untied",
              choices: [
                "I will be untied",
                "I was untied",
                "I am being untied",
                "I have been untied"
              ],
              note: "Stem + θη + σ + primary middle endings = future passive." }
          ]
        },
        {
          family: "15.6 Understanding the Middle",
          lemma: "middle voice",
          gloss: "subject involved in own action",
          questions: [
            { form: "middle force",
              prompt: "What does the middle voice typically add over a plain active?",
              answer: "the subject's PERSONAL INTEREST in the action — acting for, on, or to one's own benefit",
              choices: [
                "the subject's PERSONAL INTEREST in the action — acting for, on, or to one's own benefit",
                "nothing — middle = active in meaning, always",
                "the subject acts on something else, like active",
                "the subject is acted upon, like passive"
              ] },
            { form: "λούω vs λούομαι",
              prompt: "How does the middle λούομαι ('I wash myself / bathe') differ from active λούω ('I wash [someone]')?",
              answer: "middle has the subject act ON ITSELF — reflexive-flavoured",
              choices: [
                "middle has the subject act ON ITSELF — reflexive-flavoured",
                "they mean the same",
                "middle = passive ('I am being washed')",
                "middle has no object — it can only be intransitive"
              ] },
            { form: "middle vs passive",
              prompt: "In present/imperfect forms (e.g., λύεται), how do you tell middle from passive?",
              answer: "by context — the forms are identical; presence of ὑπό + gen. usually signals passive",
              choices: [
                "by context — the forms are identical; presence of ὑπό + gen. usually signals passive",
                "they have different endings in Greek",
                "middle always has an accent on the ultima",
                "passive always has an augment, middle doesn't"
              ] },
            { form: "ἀπολύεται τοὺς δούλους.",
              prompt: "Translate (true middle).",
              answer: "he releases his own slaves",
              choices: [
                "he releases his own slaves",
                "he is released by the slaves",
                "the slaves release him",
                "he releases himself from the slaves"
              ],
              note: "True middle: subject acts on something for his own benefit / in his own interest." }
          ]
        },
        {
          family: "15.7 Passive Deponents",
          lemma: "ἀποκρίνομαι, φοβέομαι",
          gloss: "deponents that use θη forms in the aorist",
          questions: [
            { form: "passive deponent",
              prompt: "What is a 'passive deponent'?",
              answer: "a deponent whose aorist uses θη (passive) forms",
              choices: [
                "a deponent whose aorist uses θη (passive) forms",
                "a verb that has lost its passive forms",
                "any verb with a θ in its stem",
                "any verb that takes a dative object"
              ],
              note: "Translation is still active in English." },
            { form: "ἀπεκρίθη",
              prompt: "Parse this common NT form.",
              answer: "aorist passive indicative, 3rd sg. of ἀποκρίνομαι ('he answered')",
              choices: [
                "aorist passive indicative, 3rd sg. of ἀποκρίνομαι ('he answered')",
                "aorist active indicative, 3rd sg.",
                "imperfect middle/passive indicative, 3rd sg.",
                "future passive indicative, 3rd sg."
              ],
              note: "ἀπο- + ε-augment + κριθ + ending. ἀποκρίνομαι is deponent in form but uses θη-style aorists ('passive deponents')." },
            { form: "ἐφοβήθη",
              prompt: "Parse this form (φοβέομαι).",
              answer: "aorist passive indicative, 3rd sg. of φοβέομαι",
              choices: [
                "aorist passive indicative, 3rd sg. of φοβέομαι",
                "imperfect middle indicative, 3rd sg.",
                "aorist active indicative, 3rd sg.",
                "future passive indicative, 3rd sg."
              ],
              note: "Translated actively ('he feared'); morphologically θη-form (passive deponent)." },
            { form: "ἐγενόμην ἀπόστολος.",
              prompt: "Translate.",
              answer: "I became an apostle",
              choices: [
                "I became an apostle",
                "I make an apostle",
                "I am an apostle",
                "I will become an apostle"
              ],
              note: "γίνομαι ('I become') is a middle-deponent; 2nd-aorist ἐγενόμην is active in meaning." }
          ]
        },
        {
          family: "15.8 Middle Paradigm of λύω — present and imperfect",
          lemma: "λύομαι",
          gloss: "present and imperfect middle/passive paradigm",
          questions: [
            { form: "λύομαι",
              prompt: "Parse this form.",
              answer: "present middle/passive indicative, 1st sg.",
              choices: [
                "present middle/passive indicative, 1st sg.",
                "present middle/passive indicative, 3rd sg.",
                "imperfect middle/passive indicative, 1st sg.",
                "future middle indicative, 1st sg."
              ] },
            { form: "λύῃ",
              prompt: "Parse this form (M/P reading).",
              answer: "present middle/passive indicative, 2nd sg.",
              choices: [
                "present middle/passive indicative, 2nd sg.",
                "present active indicative, 3rd sg.",
                "imperfect middle/passive indicative, 2nd sg.",
                "future middle indicative, 2nd sg."
              ],
              note: "2nd-sg M/P ending -ῃ comes from σαι: λύεσαι → λύῃ." },
            { form: "λύονται",
              prompt: "Parse this form.",
              answer: "present middle/passive indicative, 3rd pl.",
              choices: [
                "present middle/passive indicative, 3rd pl.",
                "present active indicative, 3rd pl.",
                "future middle indicative, 3rd pl.",
                "imperfect middle/passive indicative, 3rd pl."
              ] },
            { form: "ἐλυόμην",
              prompt: "Parse this form.",
              answer: "imperfect middle/passive indicative, 1st sg.",
              choices: [
                "imperfect middle/passive indicative, 1st sg.",
                "present middle/passive indicative, 1st sg.",
                "aorist middle indicative, 1st sg.",
                "imperfect active indicative, 1st sg."
              ],
              note: "augment + present stem + middle/passive secondary endings = imperfect M/P." },
            { form: "ἐλύου",
              prompt: "Parse this form.",
              answer: "imperfect middle/passive indicative, 2nd sg.",
              choices: [
                "imperfect middle/passive indicative, 2nd sg.",
                "imperfect middle/passive indicative, 3rd sg.",
                "present middle/passive indicative, 2nd sg.",
                "aorist middle indicative, 2nd sg."
              ],
              note: "Secondary 2nd-sg M/P -ου comes from -εσο (σ drops, ε + ο → ου)." }
          ]
        },
        {
          family: "15.9 Middle Paradigm of λύω — future and aorist",
          lemma: "λύσομαι / ἐλυσάμην",
          gloss: "future middle and aorist middle paradigm",
          questions: [
            { form: "λύσομαι",
              prompt: "Parse this form.",
              answer: "future middle indicative, 1st sg.",
              choices: [
                "future middle indicative, 1st sg.",
                "future active indicative, 1st sg.",
                "present middle/passive indicative, 1st sg.",
                "aorist middle indicative, 1st sg."
              ],
              note: "λύω stem + σ + middle endings = future middle. (Many active verbs have middle-form futures.)" },
            { form: "λύσεται",
              prompt: "Parse this form.",
              answer: "future middle indicative, 3rd sg.",
              choices: [
                "future middle indicative, 3rd sg.",
                "present middle/passive indicative, 3rd sg.",
                "aorist middle indicative, 3rd sg.",
                "future active indicative, 3rd sg."
              ] },
            { form: "ἐλυσάμην",
              prompt: "Parse this form.",
              answer: "aorist middle indicative, 1st sg.",
              choices: [
                "aorist middle indicative, 1st sg.",
                "imperfect middle/passive indicative, 1st sg.",
                "aorist active indicative, 1st sg.",
                "future middle indicative, 1st sg."
              ],
              note: "ἐ-λυ-σα-μην: augment + stem + σα + 1st-sg middle ending." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "16": {
      label: "Chapter 16 Grammar",
      notes: "The perfect — idea (state from completed action), form (reduplication + κ), more on meaning, and the pluperfect",
      items: [
        {
          family: "16.1 The Idea of the Perfect",
          lemma: "perfect aspect",
          gloss: "completed action, continuing state",
          questions: [
            { form: "perfect aspect (idea)",
              prompt: "What is the basic aspectual idea of the Greek perfect?",
              answer: "a completed action whose result/state persists into the present",
              choices: [
                "a completed action whose result/state persists into the present",
                "a one-off past event with no present relevance (aorist)",
                "an action in progress (present/imperfect)",
                "an action that will happen later (future)"
              ] },
            { form: "perfect vs aorist (idea)",
              prompt: "What is the key contrast between the perfect and the aorist, conceptually?",
              answer: "aorist = the event happened; perfect = the event happened AND the result stands",
              choices: [
                "aorist = the event happened; perfect = the event happened AND the result stands",
                "aorist refers to past events; perfect points to future fulfilment",
                "aorist describes ongoing action; perfect describes a one-off event",
                "they are interchangeable — Koine collapses the two tenses entirely"
              ],
              note: "English 'I have done' often catches the perfect well, but it's not a perfect equivalent." },
            { form: "English perfect translation",
              prompt: "What's a common English rendering of a Greek perfect?",
              answer: "'I have ___' or 'I ___' (present state)",
              choices: [
                "'I have ___' or 'I ___' (present state)",
                "'I am ___ing' — the same form as the English present continuous",
                "'I shall ___' — the same form as the English simple future",
                "'I would have ___ed' — English conditional perfect (counterfactual past)"
              ] },
            { form: "γέγραπται ὁ λόγος.",
              prompt: "Translate.",
              answer: "the word stands written",
              choices: [
                "the word stands written",
                "someone wrote the word",
                "the word will be written",
                "the word is being written"
              ],
              note: "Perfect = completed action with a persisting state. 'It is written / it stands written' is the classic NT formula." }
          ]
        },
        {
          family: "16.2 The Form of the Perfect",
          lemma: "perfect stem formation",
          gloss: "reduplication + κ + α-endings",
          questions: [
            { form: "λέλυκα",
              prompt: "What identifies this as a perfect?",
              answer: "reduplication + κ + α-class endings",
              choices: [
                "reduplication + κ + α-class endings",
                "augment ε- + σ + α",
                "augment ε- + θη",
                "ω-ending + ι-augment"
              ],
              note: "Pattern: consonant + ε + verb stem + κ-α (1st sg.). λύω → λέλυκα." },
            { form: "γέγραπται",
              prompt: "What does γε- at the start signal?",
              answer: "reduplication — this is a perfect form",
              parsed: "perfect middle/passive indicative third person singular",
              choices: ["reduplication — this is a perfect form", "augment — this is an aorist or imperfect", "particle — 'indeed'", "an unrelated prefix"],
              note: "γέγραπται = perfect middle/passive 3rd sg. of γράφω, 'it has been written / it stands written'." },
            { form: "verbs starting with vowels",
              prompt: "How do verbs whose stem begins with a vowel form the perfect?",
              answer: "by lengthening the initial vowel (like an augment)",
              choices: [
                "by lengthening the initial vowel (like an augment)",
                "by doubling the first consonant",
                "by prefixing γε-",
                "they can't form a perfect"
              ],
              note: "ἀκούω → ἀκήκοα (Attic reduplication is the irregular cousin)." },
            { form: "λέλυκα τὸν δοῦλον.",
              prompt: "Translate.",
              answer: "I have untied the slave",
              choices: [
                "I have untied the slave",
                "I untied the slave",
                "I am untying the slave",
                "I had untied the slave"
              ],
              note: "Reduplication (λε-) + stem + κ + α-endings = perfect active." }
          ]
        },
        {
          family: "16.2b Reduplication of stops",
          lemma: "reduplication rules",
          gloss: "what consonants reduplicate as",
          questions: [
            { form: "πιστεύω → πεπίστευκα",
              prompt: "Why does π reduplicate as πε-, not ππε- or φε-?",
              answer: "stops reduplicate as the unaspirated form of the same class: π → πε-, β → βε-, φ → πε-",
              choices: [
                "stops reduplicate as the unaspirated form of the same class: π → πε-, β → βε-, φ → πε-",
                "stops reduplicate by doubling the full consonant: ππε-, ββε-, φφε- across all three labials",
                "stops always reduplicate as plain ε-, with no consonant carried over from the verb stem",
                "stops reduplicate as the aspirated form of the class: π → φε-, κ → χε-, τ → θε-"
              ],
              note: "Labial class (π, β, φ): all reduplicate as πε-." },
            { form: "φιλέω → πεφίληκα",
              prompt: "Why does φ reduplicate as πε- rather than φε-?",
              answer: "aspirates de-aspirate when reduplicated: φ → πε-, χ → κε-, θ → τε-",
              choices: [
                "aspirates de-aspirate when reduplicated: φ → πε-, χ → κε-, θ → τε-",
                "φ reduplicates as φε- — aspiration is preserved",
                "φ is a labial like π/β, so reduplicates randomly",
                "φιλέω is irregular — most aspirates do reduplicate as themselves"
              ],
              note: "Grassmann's law: two aspirates in adjacent syllables are forbidden, so the first dissimilates." },
            { form: "χωρέω → κεχώρηκα",
              prompt: "What is the reduplication of χ?",
              answer: "κε- (velar aspirate de-aspirates: χ → κε-)",
              choices: [
                "κε- (velar aspirate de-aspirates: χ → κε-)",
                "χε- (aspiration is preserved)",
                "χχε- (consonant is doubled)",
                "ἐ- (just the augment, no consonant)"
              ],
              note: "Velar class (κ, γ, χ): all reduplicate as κε-." },
            { form: "θύω → τέθυκα",
              prompt: "What is the reduplication of θ?",
              answer: "τε- (dental aspirate de-aspirates: θ → τε-)",
              choices: [
                "τε- (dental aspirate de-aspirates: θ → τε-)",
                "θε- (aspiration is preserved)",
                "θθε- (consonant is doubled)",
                "ἐ- (just the augment, no consonant)"
              ],
              note: "Dental class (τ, δ, θ): all reduplicate as τε-." },
            { form: "verb stem starts with ρ or two consonants",
              prompt: "How do verbs whose stem starts with ρ, or with two consonants (e.g., γνωρίζω, στρατεύω), form the perfect?",
              answer: "they use a plain ἐ- (like an augment), not consonant reduplication",
              choices: [
                "they use a plain ἐ- (like an augment), not consonant reduplication",
                "they double the consonant cluster in full",
                "they have no perfect — only an aorist substitutes",
                "they always use Attic reduplication (vowel + consonant + vowel)"
              ],
              note: "γνωρίζω → ἐγνώρικα; ζητέω → ἐζήτηκα (initial ζ counts as two consonants)." }
          ]
        },
        {
          family: "16.3 More on the Meaning of the Perfect",
          lemma: "perfect in context",
          gloss: "translation choices",
          questions: [
            { form: "γέγραπται",
              prompt: "Best translation of γέγραπται in 'γέγραπται γάρ'?",
              answer: "'it stands written' / 'it is written'",
              parsed: "perfect middle/passive indicative third person singular",
              choices: [
                "'it stands written' / 'it is written'",
                "'someone wrote' (aorist, simple past — no abiding state)",
                "'they will write' (future indicative, action lying ahead)",
                "'while writing' (present participle, an ongoing action)"
              ] },
            { form: "τετέλεσται",
              prompt: "Best translation in 'τετέλεσται' (John 19:30)?",
              answer: "'it is finished' (the work is done and its results stand)",
              choices: [
                "'it is finished' (the work is done and its results stand)",
                "'he finishes' (present) — ongoing action with no past reference",
                "'he finished' (aorist) — a simple past event with no present relevance",
                "'he will finish' (future) — completion lying in the future, after the speaker"
              ],
              note: "Perfect middle/passive 3rd sg. of τελέω." },
            { form: "perfect with present force",
              prompt: "Why do some perfect-tense verbs (e.g., οἶδα) translate as straight presents?",
              answer: "their resulting state IS the present-time meaning — οἶδα ('I know') = 'I have come to know' = 'I know now'",
              choices: [
                "their resulting state IS the present-time meaning — οἶδα ('I know') = 'I have come to know' = 'I know now'",
                "they are mistranslated and really mean 'I have known' — the perfect always wins out over the present",
                "the perfect always = English present — οἶδα and γέγραπται are no exception",
                "οἶδα is actually a present, not a perfect — its κ + α-endings are just a coincidence"
              ],
              note: "ἕστηκα ('I stand') and οἶδα ('I know') are the classic 'present-meaning' perfects." },
            { form: "πεπίστευκα εἰς αὐτόν.",
              prompt: "Translate.",
              answer: "I have believed in him",
              choices: [
                "I have believed in him",
                "I once believed in him",
                "I will believe in him",
                "I am believing in him"
              ],
              note: "Perfect highlights the abiding state resulting from a past act of believing." }
          ]
        },
        {
          family: "16.4 The Pluperfect",
          lemma: "ἐλελύκειν",
          gloss: "I had untied",
          questions: [
            { form: "ἐλελύκειν",
              prompt: "Parse this verb.",
              answer: "pluperfect active indicative, 1st sg. of λύω",
              choices: [
                "pluperfect active indicative, 1st sg. of λύω",
                "perfect active indicative, 1st sg.",
                "imperfect active indicative, 1st sg.",
                "aorist active indicative, 1st sg."
              ],
              note: "Pluperfect = augment + reduplication + κ + ει + secondary endings. The full set of three time markers is the giveaway." },
            { form: "pluperfect formation",
              prompt: "How is the pluperfect active formed?",
              answer: "augment + reduplication + stem + κει + secondary endings",
              choices: [
                "augment + reduplication + stem + κει + secondary endings",
                "reduplication + stem + κα + primary endings",
                "augment + stem + secondary endings (no reduplication, no κ)",
                "augment + stem + σα + secondary endings"
              ],
              note: "The pluperfect stacks all three past-tense markers (augment + reduplication + κ-extension)." },
            { form: "pluperfect meaning",
              prompt: "What does the pluperfect indicative typically convey?",
              answer: "a past state resulting from an action that was already complete before another past event",
              choices: [
                "a past state resulting from an action that was already complete before another past event",
                "a single completed past event with no further nuance",
                "an ongoing past action",
                "a future state that will be complete by some later moment"
              ],
              note: "English 'I had untied' captures the past-state-before-past-event sense. Rare in the NT (about 85×)." },
            { form: "ἐλελύκει τὸν δοῦλον.",
              prompt: "Translate.",
              answer: "he had untied the slave",
              choices: [
                "he had untied the slave",
                "he has untied the slave",
                "he was untying the slave",
                "he will have untied the slave"
              ],
              note: "Augment + reduplication + stem + κει + secondary endings = pluperfect ('he had ___ed')." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "17": {
      label: "Chapter 17 Grammar",
      notes: "The subjunctive — idea (potential / contingent), formation (long thematic vowel), and uses (purpose, hortatory, prohibition, indefinite)",
      items: [
        {
          family: "17.1 The Idea of the Subjunctive",
          lemma: "subjunctive mood",
          gloss: "contingent, non-factual",
          questions: [
            { form: "subjunctive idea",
              prompt: "What does the subjunctive mood express in general?",
              answer: "a contingent / potential / non-factual action",
              choices: [
                "a contingent / potential / non-factual action",
                "a flat statement of fact, like the indicative",
                "a direct command, like the imperative",
                "direct address (vocative)"
              ] },
            { form: "subjunctive time",
              prompt: "What does the TENSE of a subjunctive verb tell you?",
              answer: "aspect only — no absolute time outside the indicative",
              choices: [
                "aspect only — no absolute time outside the indicative",
                "absolute past, present, or future time, just like the indicative",
                "voice — present subj = active, aorist subj = passive",
                "person and number — the tense form encodes who/how many"
              ] },
            { form: "where it appears",
              prompt: "In what kinds of clauses does the subjunctive most often appear in NT Greek?",
              answer: "subordinate clauses and certain main-clause uses",
              choices: [
                "subordinate clauses and certain main-clause uses",
                "only in subordinate clauses",
                "only in main clauses",
                "only after the article"
              ] },
            { form: "ἵνα ἀκούωσιν τὸν λόγον.",
              prompt: "Translate.",
              answer: "in order that they may hear the word",
              choices: [
                "in order that they may hear the word",
                "because they hear the word",
                "since they will hear the word",
                "they hear the word"
              ],
              note: "ἵνα + subjunctive = purpose ('in order that')." }
          ]
        },
        {
          family: "17.2 The Formation of the Subjunctive",
          lemma: "λύω",
          gloss: "long-vowel theme marker",
          questions: [
            { form: "subjunctive marker",
              prompt: "What morphological feature visually signals the subjunctive?",
              answer: "long thematic vowel (ω/η)",
              choices: [
                "long thematic vowel (ω/η)",
                "the augment ε- (the past-time marker)",
                "reduplication (the perfect-stem marker)",
                "the θη morpheme"
              ],
              note: "λύομεν (ind.) vs λύωμεν (subj.); λύετε (ind.) vs λύητε (subj.)." },
            { form: "λύῃ",
              prompt: "Parse this form.",
              answer: "present active subjunctive, 3rd sg.",
              choices: [
                "present active subjunctive, 3rd sg.",
                "present active indicative, 3rd sg.",
                "present middle/passive indicative, 2nd sg.",
                "aorist active indicative, 3rd sg."
              ],
              note: "Without context, λύῃ could also be 2nd sg. middle/passive subjunctive — but 3rd sg. active is the textbook answer." },
            { form: "λύσωσιν",
              prompt: "Parse this form.",
              answer: "aorist active subjunctive, 3rd pl.",
              choices: [
                "aorist active subjunctive, 3rd pl.",
                "future active indicative, 3rd pl.",
                "present active subjunctive, 3rd pl.",
                "aorist active indicative, 3rd pl."
              ],
              note: "Aorist stem (λυσ-) + long-vowel ending (ωσι) + no augment = aorist subj." },
            { form: "subjunctive vs indicative",
              prompt: "What is the key surface difference between λύομεν (ind.) and λύωμεν (subj.)?",
              answer: "the short connecting vowel ο becomes long ω in the subjunctive",
              choices: [
                "the short connecting vowel ο becomes long ω in the subjunctive",
                "the subjunctive takes an extra augment",
                "the subjunctive uses different person endings",
                "the accent shifts to the ultima in the subjunctive"
              ],
              note: "Long thematic vowel is the diagnostic. The personal ending -μεν is the same in both." },
            { form: "ἐὰν λύσῃ τὸν δοῦλον.",
              prompt: "Translate.",
              answer: "if he should untie the slave",
              choices: [
                "if he should untie the slave",
                "if he untied the slave",
                "if he is untying the slave",
                "since he has untied the slave"
              ],
              note: "ἐάν + subjunctive = 3rd-class (future-more-vivid) protasis." }
          ]
        },
        {
          family: "17.3 The Uses of the Subjunctive",
          lemma: "subjunctive",
          gloss: "main NT uses",
          questions: [
            { form: "ἵνα + subj.",
              prompt: "Subjunctive after ἵνα expresses…",
              answer: "purpose / content ('in order that' / 'that')",
              choices: [
                "purpose / content ('in order that' / 'that')",
                "a simple statement of fact ('in order that he hears')",
                "a wish — 'oh, that he might hear!'",
                "direct address — 'in order, O hearer!'"
              ] },
            { form: "λύσωμεν",
              prompt: "1st-person plural subjunctive in a main clause is the…",
              answer: "hortatory subjunctive ('let us untie!')",
              parsed: "aorist active subjunctive first person plural",
              choices: [
                "hortatory subjunctive ('let us untie!')",
                "deliberative subjunctive ('shall we untie?')",
                "prohibitive subjunctive ('do not untie!')",
                "future indicative ('we will untie')"
              ] },
            { form: "μὴ + aorist subj.",
              prompt: "μή + aorist subjunctive (2nd person) expresses…",
              answer: "a prohibition ('do not …')",
              choices: [
                "a prohibition ('do not …')",
                "a wish ('would that …')",
                "a command to begin ('start …')",
                "a question of doubt"
              ],
              note: "Distinguished from μή + present imperative, which prohibits an ongoing action." },
            { form: "λύσωμεν τοὺς δούλους.",
              prompt: "Translate.",
              answer: "let us untie the slaves!",
              choices: [
                "let us untie the slaves!",
                "we untie the slaves",
                "if we untie the slaves",
                "we will untie the slaves"
              ],
              note: "1st-person plural subjunctive in a main clause = hortatory ('let us …')." }
          ]
        },
        {
          family: "17.3 Uses — Indefinite Constructions",
          lemma: "ὅς ἄν + subjunctive",
          gloss: "general / indefinite relative",
          questions: [
            { form: "ὃς ἂν λύσῃ",
              prompt: "What does ὅς ἄν + subjunctive express?",
              answer: "an indefinite relative — 'whoever unties'",
              choices: [
                "an indefinite relative — 'whoever unties'",
                "a definite relative — 'who unties'",
                "a purpose clause — 'in order that he untie'",
                "a temporal clause — 'whenever he untied'"
              ] },
            { form: "ὅταν",
              prompt: "ὅταν (= ὅτε + ἄν) + subjunctive expresses…",
              answer: "a general or indefinite temporal — 'whenever'",
              choices: [
                "a general or indefinite temporal — 'whenever'",
                "a definite past — 'when (it happened)'",
                "a purpose — 'in order that'",
                "a result — 'so that'"
              ] },
            { form: "particle ἄν",
              prompt: "What does the particle ἄν typically signal when added to a relative or temporal conjunction?",
              answer: "indefiniteness / generality",
              choices: [
                "indefiniteness / generality",
                "negation",
                "interrogation",
                "definite specificity"
              ],
              note: "ὅς + ἄν → 'whoever'; ὅπου + ἄν → 'wherever'; ὅτε + ἄν → ὅταν, 'whenever'." },
            { form: "ἐάν τις",
              prompt: "Translate this indefinite construction.",
              answer: "'if anyone' / 'whoever'",
              choices: [
                "'if anyone' / 'whoever'",
                "'if not'",
                "'because someone'",
                "'whenever it happens'"
              ],
              note: "ἐάν τις + subjunctive = a generalised conditional with an indefinite subject." },
            { form: "ὃς ἂν ἀκούσῃ τὸν λόγον, σωθήσεται.",
              prompt: "Translate.",
              answer: "whoever hears the word will be saved",
              choices: [
                "whoever hears the word will be saved",
                "who hears the word? he will be saved",
                "the one who heard the word was saved",
                "the word is heard by all who are saved"
              ],
              note: "ὅς + ἄν + subjunctive = indefinite relative ('whoever')." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "18": {
      label: "Chapter 18 Grammar",
      notes: "Using verbs — δύναμαι/κάθημαι/κεῖμαι/οἶδα; infinitives in use; 3rd-person imperatives; principal parts; aspect and time",
      items: [
        {
          family: "18.1 δύναμαι, κάθημαι, κεῖμαι and οἶδα",
          lemma: "δύναμαι / οἶδα",
          gloss: "irregular middle/perfect-with-present verbs",
          questions: [
            { form: "δύναμαι",
              prompt: "What does δύναμαι mean, and what is unusual about its form?",
              answer: "'I am able' — middle-form deponent",
              parsed: "present middle/passive indicative first person singular",
              choices: [
                "'I am able' — middle-form deponent",
                "'I give' — active",
                "'I see' — active",
                "'I have' — active"
              ],
              note: "Conjugates with athematic middle/passive endings on a -μι-style stem." },
            { form: "οἶδα",
              prompt: "What is unusual about οἶδα ('I know')?",
              answer: "perfect in form, present in meaning ('I have come to know' = 'I know')",
              parsed: "perfect active indicative first person singular",
              choices: [
                "perfect in form, present in meaning ('I have come to know' = 'I know')",
                "it is an irregular aorist that translates as a present in English idiom",
                "it is a regular present-tense verb formed on the stem οἰδ-/εἰδ-",
                "it is indeclinable — the same form οἶδα is used for every person and number"
              ] },
            { form: "ᾔδειν",
              prompt: "Parse this form of οἶδα.",
              answer: "pluperfect with imperfect force — 'I knew'",
              parsed: "pluperfect active indicative first person singular",
              choices: [
                "pluperfect with imperfect force — 'I knew'",
                "future active indicative, 1st sg. — 'I will know'",
                "present active indicative, 1st sg. — 'I am knowing'",
                "aorist active indicative, 1st sg. — 'I came to know'"
              ],
              note: "Because οἶδα is a present-meaning perfect, its pluperfect form ᾔδειν has imperfect meaning ('I knew')." },
            { form: "κεῖμαι, κάθημαι",
              prompt: "What semantic field do κεῖμαι and κάθημαι share?",
              answer: "stative posture — 'I lie' / 'I sit' (middle-form)",
              choices: [
                "stative posture — 'I lie' / 'I sit' (middle-form)",
                "verbs of motion — 'I run' / 'I walk' (active-form motion verbs)",
                "verbs of speech — 'I say' / 'I shout' (active-form speech verbs)",
                "transitive action verbs — 'I throw' / 'I take' (active-form transitives)"
              ] },
            { form: "οἶδα τὸν θεόν.",
              prompt: "Translate.",
              answer: "I know God",
              choices: [
                "I know God",
                "I have come to know God",
                "I knew God",
                "I will know God"
              ],
              note: "οἶδα is a perfect in form but a present in meaning ('I know')." }
          ]
        },
        {
          family: "18.2 Use of Infinitives",
          lemma: "infinitive constructions",
          gloss: "beyond simple complementation",
          questions: [
            { form: "complementary infinitive",
              prompt: "In θέλω λύειν, what's the role of the infinitive?",
              answer: "complementary — completing the idea of θέλω: 'I want TO LOOSE'",
              choices: [
                "complementary — completing the idea of θέλω: 'I want TO LOOSE'",
                "purpose — 'in order to loose' (an end-goal, with ἵνα implied)",
                "result — 'so as to loose' (a consequence, with ὥστε implied)",
                "imperative — 'loose!' (a direct command in infinitival shape)"
              ] },
            { form: "articular infinitive",
              prompt: "What is an 'articular infinitive'?",
              answer: "an infinitive preceded by the neuter article (τό, τοῦ, τῷ) — letting the infinitive be governed like a noun",
              choices: [
                "an infinitive preceded by the neuter article (τό, τοῦ, τῷ) — letting the infinitive be governed like a noun",
                "an infinitive followed by an article that points to its complement",
                "any infinitive used as a noun (no article needed); Greek infinitives are inherently substantival",
                "an infinitive standing alone as a main verb, replacing the finite indicative"
              ],
              note: "διὰ τὸ λέγειν = 'because of the speaking / because he speaks/spoke'." },
            { form: "ὥστε + infinitive",
              prompt: "ὥστε + infinitive expresses…",
              answer: "result — 'so that, with the result that'",
              choices: [
                "result — 'so that, with the result that'",
                "purpose — 'in order that'",
                "cause — 'because'",
                "concession — 'although'"
              ],
              note: "The subject of an ὥστε-infinitive (if expressed) goes in the accusative." },
            { form: "subject of infinitive",
              prompt: "When an infinitive has its own subject (different from the main verb), what case is the subject in?",
              answer: "accusative — 'accusative subject of the infinitive'",
              choices: [
                "accusative — 'accusative subject of the infinitive'",
                "nominative — same case as a finite verb's subject",
                "dative — like an indirect object",
                "genitive — like possession"
              ],
              note: "ὥστε αὐτὸν λέγειν = 'so that he speaks' — αὐτόν is acc. subject of the infinitive." },
            { form: "θέλω ἀκούειν τὸν λόγον.",
              prompt: "Translate.",
              answer: "I want to hear the word",
              choices: [
                "I want to hear the word",
                "I hear the word in order to want",
                "I want the word to be heard",
                "to want is to hear the word"
              ],
              note: "Complementary infinitive completing θέλω ('I want to ___')." }
          ]
        },
        {
          family: "18.2b Articular infinitive with a preposition",
          lemma: "διά / εἰς / ἐν / μετά / πρό / πρός + τό + infinitive",
          gloss: "infinitive used inside a prepositional phrase",
          questions: [
            { form: "διὰ τό + inf.",
              prompt: "What does διά + τό + infinitive express?",
              answer: "cause — 'because (he/they/etc.) …'",
              choices: [
                "cause — 'because (he/they/etc.) …'",
                "purpose — 'in order that …'",
                "time after — 'after …'",
                "time before — 'before …'"
              ],
              note: "διὰ τὸ μὴ ἔχειν ῥίζαν = 'because it had no root' (Mark 4:6)." },
            { form: "εἰς τό + inf.",
              prompt: "What does εἰς + τό + infinitive most often express?",
              answer: "purpose — 'in order that …'",
              choices: [
                "purpose — 'in order that …'",
                "cause — 'because …'",
                "time when — 'when …'",
                "time after — 'after …'"
              ],
              note: "εἰς τὸ εἶναι αὐτὸν πατέρα = 'in order for him to be a father' (Rom 4:11). Occasionally εἰς τό marks result." },
            { form: "ἐν τῷ + inf.",
              prompt: "What does ἐν + τῷ + infinitive express?",
              answer: "contemporaneous time — 'while / when …'",
              choices: [
                "contemporaneous time — 'while / when …'",
                "cause — 'because …' (the action gives the reason)",
                "purpose — 'in order that …' (the action is the goal)",
                "time after — 'after …' (the action precedes the main verb)"
              ],
              note: "ἐν τῷ σπείρειν αὐτόν = 'while he was sowing' (Mark 4:4). Note dative τῷ — point in time." },
            { form: "μετὰ τό + inf.",
              prompt: "What does μετά + τό + infinitive express?",
              answer: "time after — 'after …'",
              choices: [
                "time after — 'after …'",
                "time before — 'before …'",
                "purpose — 'in order that …'",
                "cause — 'because …'"
              ],
              note: "μετὰ τὸ ἐγερθῆναί με = 'after I have been raised' (Matt 26:32)." },
            { form: "πρὸ τοῦ + inf.",
              prompt: "What does πρό + τοῦ + infinitive express?",
              answer: "time before — 'before …'",
              choices: [
                "time before — 'before …'",
                "time after — 'after …'",
                "cause — 'because …'",
                "purpose — 'in order that …'"
              ],
              note: "πρὸ τοῦ ὑμᾶς αἰτῆσαι αὐτόν = 'before you ask him' (Matt 6:8). Note genitive τοῦ after πρό." },
            { form: "πρὸς τό + inf.",
              prompt: "What does πρός + τό + infinitive most often express?",
              answer: "purpose — 'in order that …' (overlaps with εἰς τό)",
              choices: [
                "purpose — 'in order that …' (overlaps with εἰς τό)",
                "time after — 'after …' (the action precedes the main verb)",
                "time before — 'before …' (the action follows the main verb)",
                "comparison — 'compared to …' (πρός governs comparison generally)"
              ],
              note: "πρὸς τὸ θεαθῆναι αὐτοῖς = 'in order to be seen by them' (Matt 6:1)." },
            { form: "case of subject of articular infinitive",
              prompt: "When διὰ τό + infinitive has its own subject expressed, what case is it in?",
              answer: "accusative — accusative subject of the infinitive",
              choices: [
                "accusative — accusative subject of the infinitive",
                "nominative — same as a finite verb's subject",
                "genitive — to match διά's normal case",
                "dative — to match the article τό in the construction"
              ],
              note: "διὰ τὸ μὴ ἔχειν αὐτοὺς γῆν = 'because they had no soil'. The article τό stays accusative (governed by διά); the subject αὐτούς is also accusative." },
            { form: "διὰ τὸ μὴ εἶναι ῥίζαν",
              prompt: "Translate.",
              answer: "'because there is no root' / 'because it has no root'",
              choices: [
                "'because there is no root' / 'because it has no root'",
                "'in order to have no root' (purpose)",
                "'while there is no root' (time)",
                "'after the root is gone' (time after)"
              ],
              note: "διά + τό + inf. = cause. The bare infinitive can stand alone as the verb." },
            { form: "ἐν τῷ ὑποστρέφειν",
              prompt: "Translate.",
              answer: "'while returning' / 'when (he/they) return(ed)'",
              choices: [
                "'while returning' / 'when (he/they) return(ed)'",
                "'in order to return' (purpose)",
                "'after returning' (time after)",
                "'because of returning' (cause)"
              ],
              note: "ἐν + τῷ + inf. = simultaneous time. Tense gives aspect, not absolute time." }
          ]
        },
        {
          family: "18.3 Third-Person Imperatives",
          lemma: "λυέτω, λυέτωσαν",
          gloss: "'let him untie!'",
          questions: [
            { form: "λυέτω",
              prompt: "Parse this form and translate.",
              answer: "present active imperative, 3rd sg. — 'let him/her untie!'",
              choices: [
                "present active imperative, 3rd sg. — 'let him/her untie!'",
                "present active indicative, 3rd sg. — 'he unties'",
                "imperfect active indicative, 3rd sg.",
                "future active indicative, 3rd sg."
              ],
              note: "Ending -τω is the 3rd-singular imperative marker. English uses 'let him X' to capture this." },
            { form: "λυέτωσαν",
              prompt: "Parse this form and translate.",
              answer: "present active imperative, 3rd pl. — 'let them untie!'",
              choices: [
                "present active imperative, 3rd pl. — 'let them untie!'",
                "present active indicative, 3rd pl.",
                "imperfect active indicative, 3rd pl.",
                "aorist active indicative, 3rd pl."
              ],
              note: "3rd-plural imperative ending -τωσαν." },
            { form: "ἁγιασθήτω",
              prompt: "Identify this famous form (Matt 6:9).",
              answer: "aorist passive imperative, 3rd sg.",
              choices: [
                "aorist passive imperative, 3rd sg.",
                "future passive indicative, 3rd sg.",
                "present passive imperative, 3rd sg.",
                "aorist passive indicative, 3rd sg."
              ],
              note: "Lord's Prayer: ἁγιασθήτω τὸ ὄνομά σου = 'hallowed be Thy name'." },
            { form: "λυέτω τὸν δοῦλον.",
              prompt: "Translate.",
              answer: "let him untie the slave!",
              choices: [
                "let him untie the slave!",
                "he is untying the slave",
                "he was untying the slave",
                "to untie the slave"
              ],
              note: "λυέτω is 3rd-sg. present active imperative — English uses 'let him ___' to capture it." }
          ]
        },
        {
          family: "18.4 Principal Parts",
          lemma: "principal parts of a verb",
          gloss: "the six stems that generate everything",
          questions: [
            { form: "what they are",
              prompt: "What are the SIX principal parts of a Greek verb?",
              answer: "the six tense stems",
              choices: [
                "the six tense stems",
                "the six personal endings",
                "the six cases",
                "the six moods"
              ] },
            { form: "λύω principal parts",
              prompt: "Which list shows the principal parts of λύω?",
              answer: "λύω, λύσω, ἔλυσα, λέλυκα, λέλυμαι, ἐλύθην",
              choices: [
                "λύω, λύσω, ἔλυσα, λέλυκα, λέλυμαι, ἐλύθην",
                "λύω, ἔλυον, λύσω, ἔλυσα (only four)",
                "λύω, ἔλυσα (only two)",
                "λύω alone — Greek has no principal parts system"
              ],
              note: "Knowing these six forms lets you generate every conjugated form λύω can take." },
            { form: "why memorise",
              prompt: "Why are principal parts especially important for irregular verbs?",
              answer: "because irregular verbs have suppletive stems in some tenses",
              choices: [
                "because irregular verbs have suppletive stems in some tenses",
                "they aren't important — irregulars can be guessed",
                "principal parts only matter for regular verbs",
                "they replace the lexicon entirely"
              ],
              note: "λέγω → εἶπον / εἴρηκα / εἴρημαι / ἐρρέθην — totally suppletive." },
            { form: "ἔλαβον τὸν ἄρτον.",
              prompt: "Translate.",
              answer: "I took the bread",
              choices: [
                "I took the bread",
                "I take the bread",
                "I will take the bread",
                "I have taken the bread"
              ],
              note: "ἔλαβον is the 2nd aorist of λαμβάνω — knowing the third principal part of a verb gives you its aorist." }
          ]
        },
        {
          family: "18.5 Aspect and Time in Tenses",
          lemma: "aspect vs absolute time",
          gloss: "when tense IS time vs when tense ISN'T",
          questions: [
            { form: "outside the indicative",
              prompt: "Outside the indicative (subjunctive, imperative, infinitive, participle), what does the choice of tense primarily encode?",
              answer: "aspect, not time",
              choices: [
                "aspect, not time",
                "absolute past, present, or future time, just like the indicative",
                "mood",
                "person and number — the tense form encodes who/how many"
              ],
              note: "Only the indicative consistently anchors time. Elsewhere, present/aorist/perfect is about how the action is portrayed." },
            { form: "command: keep doing X",
              prompt: "Which tense of imperative best matches 'keep on doing X'?",
              answer: "present (imperfective aspect)",
              choices: ["present (imperfective aspect)", "aorist (perfective aspect)", "perfect (stative)", "future indicative"] },
            { form: "command: do X (one decisive act)",
              prompt: "Which tense of imperative typically presents the action as a single whole?",
              answer: "aorist (perfective aspect)",
              choices: ["aorist (perfective aspect)", "present (imperfective aspect)", "perfect (stative)", "future indicative"] },
            { form: "perfect imperative",
              prompt: "A perfect-tense imperative (rare) is best understood as expressing…",
              answer: "a state to be maintained ('stay in this condition')",
              choices: [
                "a state to be maintained ('stay in this condition')",
                "a single past command — issued retroactively in the perfect",
                "a future-time command — perfect imperatives anticipate completion",
                "a generic timeless command — the perfect carries no temporal force"
              ],
              note: "E.g. πεφίμωσο ('be still!', Mark 4:39) — stative force." },
            { form: "μὴ λύε τὸν δοῦλον.",
              prompt: "Translate, capturing the aspect.",
              answer: "stop untying the slave",
              choices: [
                "stop untying the slave",
                "do not (ever) untie the slave",
                "you are not untying the slave",
                "the slave is not being untied"
              ],
              note: "μή + present imperative = prohibition of an ongoing action ('stop ___ing'); μή + aorist subj. = 'do not even begin'." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "19": {
      label: "Chapter 19 Grammar",
      notes: "Extra verbs — -μι verbs (δίδωμι, τίθημι, ἵστημι, ἀφίημι); α-contract and ο-contract verbs",
      items: [
        {
          family: "19.1 -μι Verbs",
          lemma: "δίδωμι, τίθημι, ἵστημι, ἀφίημι",
          gloss: "athematic conjugation",
          questions: [
            { form: "-μι vs -ω",
              prompt: "What's the difference between -μι verbs and -ω verbs in conjugation?",
              answer: "-μι verbs are athematic — no connecting vowel between stem and ending",
              choices: [
                "-μι verbs are athematic — no connecting vowel between stem and ending",
                "-μι verbs have no aorist; -ω verbs do",
                "-μι verbs are passive-only",
                "they conjugate identically — only spelling differs"
              ],
              note: "Result: -μι forms look 'tighter' (no extra vowel before endings) and often have vowel-grade alternations (διδω-/διδο-)." },
            { form: "δίδωμι reduplication",
              prompt: "How does the PRESENT stem of -μι verbs typically begin?",
              answer: "with a reduplication using ι: δι-δω-, τι-θη-, ἵ-στη- (from σι-στη-)",
              choices: [
                "with a reduplication using ι: δι-δω-, τι-θη-, ἵ-στη- (from σι-στη-)",
                "with an augment ε-",
                "with no prefix — they start with the bare stem",
                "with a different prefix in each tense"
              ],
              note: "Reduplication with ι is the present-stem marker of -μι verbs. Other tenses drop it." },
            { form: "δίδωσι(ν)",
              prompt: "Parse this form.",
              answer: "present active indicative, 3rd sg.",
              choices: [
                "present active indicative, 3rd sg.",
                "present active indicative, 1st sg.",
                "present active subjunctive, 3rd sg.",
                "aorist active indicative, 3rd sg."
              ] },
            { form: "δίδωμι vowel grade",
              prompt: "What's distinctive about the singular stem vs the plural stem in the present indicative of δίδωμι?",
              answer: "the singular has the long vowel (διδω-) and the plural has the short vowel (διδο-)",
              choices: [
                "the singular has the long vowel (διδω-) and the plural has the short vowel (διδο-)",
                "the singular has the short vowel and the plural the long vowel",
                "both share the same vowel grade throughout",
                "only the plural has reduplication"
              ],
              note: "δίδωμι, δίδως, δίδωσι(ν) — long vowel; δίδομεν, δίδοτε, διδόασι(ν) — short vowel." },
            { form: "ἔδωκα",
              prompt: "Parse this form (and note the unusual feature).",
              answer: "aorist active 1st sg. of δίδωμι — uses a κ-aorist",
              parsed: "aorist active indicative first person singular",
              choices: [
                "aorist active 1st sg. of δίδωμι — uses a κ-aorist",
                "perfect active indicative, 1st sg.",
                "imperfect active indicative, 1st sg.",
                "future active indicative, 1st sg."
              ],
              note: "δίδωμι (and τίθημι, ἀφίημι) use κ-aorists in the singular: ἔδωκα, ἔθηκα, ἀφῆκα." },
            { form: "δέδωκα",
              prompt: "Parse this form.",
              answer: "perfect active indicative, 1st sg. of δίδωμι",
              choices: [
                "perfect active indicative, 1st sg. of δίδωμι",
                "aorist active indicative, 1st sg.",
                "pluperfect active indicative, 1st sg.",
                "present active indicative, 1st sg."
              ],
              note: "Reduplication δε- + δωκ + α = perfect active. (The present-stem ι-reduplication gives way to the standard ε-reduplication in the perfect.)" },
            { form: "δίδωμι τὸν ἄρτον τῷ τέκνῳ.",
              prompt: "Translate.",
              answer: "I give the bread to the child",
              choices: [
                "I give the bread to the child",
                "I give the child to the bread",
                "the child gives me bread",
                "the child's bread is given"
              ],
              note: "δίδωμι is athematic: personal endings attach directly to the (reduplicated) stem." }
          ]
        },
        {
          family: "19.1b Five diagnostic rules for -μι verbs",
          lemma: "δίδωμι, τίθημι, ἵστημι, δείκνυμι",
          gloss: "the five rules that distinguish -μι verbs from -ω verbs",
          questions: [
            { form: "Rule 1 — present reduplication",
              prompt: "What does Rule 1 say about -μι verbs in the PRESENT?",
              answer: "they reduplicate the initial stem letter and separate the reduplicated consonant with iota",
              choices: [
                "they reduplicate the initial stem letter and separate the reduplicated consonant with iota",
                "they prefix an augment ε- to the stem, carrying past-time force into the present",
                "they use a long thematic vowel ω/η like the subjunctive, marking potential / contingent mood",
                "they add an extra σ before the personal endings, just like the future and 1st aorist"
              ],
              note: "*do → di-d-o → δίδω-; *qe → ti-q-e → τίθε-; *sta → si-st-a → ἵστα-. Only the present and imperfect show this reduplication." },
            { form: "Rule 2 — no connecting vowel",
              prompt: "What does Rule 2 say about how -μι verbs attach their endings?",
              answer: "they do NOT use a connecting (thematic) vowel in the indicative — the personal ending attaches directly to the stem",
              choices: [
                "they do NOT use a connecting (thematic) vowel in the indicative — the personal ending attaches directly to the stem",
                "they always insert ε before the personal ending, replacing the ο/ε alternation seen in -ω verbs",
                "they use ο before active endings and α before middle endings, swapping vowel by voice rather than person",
                "they always insert ι before plural endings, mirroring the present-stem reduplication vowel"
              ],
              note: "Compare λύ-ο-μεν (with ο) vs δί-δο-μεν (no separate connecting vowel — the ο is part of the stem)." },
            { form: "Rule 3 — three sets of personal endings",
              prompt: "What does Rule 3 say about the personal endings of -μι verbs in the PRESENT ACTIVE?",
              answer: "they use three endings different from the -ω conjugation: -μι (1 sg), -σι (3 sg), -ασι (3 pl)",
              choices: [
                "they use three endings different from the -ω conjugation: -μι (1 sg), -σι (3 sg), -ασι (3 pl)",
                "they use exactly the same endings as -ω verbs in every person and number",
                "they use middle/passive endings throughout the active",
                "they have no personal endings at all — only stem alternations"
              ],
              note: "δίδωμι, δίδως, δίδωσι(ν); δίδομεν, δίδοτε, διδόασι(ν). The 2 sg (-ς) and 1 pl/2 pl endings (-μεν/-τε) match -ω verbs." },
            { form: "Rule 4 — stem-vowel ablaut",
              prompt: "What does Rule 4 say about the stem vowel of -μι verbs?",
              answer: "the stem vowel can lengthen, shorten, or drop out (ablaut)",
              choices: [
                "the stem vowel can lengthen, shorten, or drop out (ablaut)",
                "the stem vowel is fixed and never changes across the paradigm",
                "the stem vowel always lengthens in the plural",
                "the stem vowel always shortens in the singular"
              ],
              note: "δίδωμι (long ω, sg.) vs δίδομεν (short ο, pl.). Same alternation in τίθημι/τίθεμεν, ἵστημι/ἵσταμεν." },
            { form: "Rule 5 — κ-aorist",
              prompt: "What does Rule 5 say about the AORIST of most -μι verbs?",
              answer: "most -μι verbs use κα as their tense formative in the aorist (a 'κ-aorist')",
              choices: [
                "most -μι verbs use κα as their tense formative in the aorist (a 'κ-aorist')",
                "they use σα like ordinary 1st aorists, with the σ standing between stem and α",
                "they have no aorist tense at all — the perfect indicative substitutes for past completed action",
                "they always use a 2nd aorist on a different stem, like λέγω → εἶπον in the indicative"
              ],
              note: "ἔδωκα (cf. ἔλυσα), ἔθηκα, ἀφῆκα. The κα is unusual — it looks perfect-ish but the augment + secondary endings give it away as aorist." },
            { form: "διδόασι(ν)",
              prompt: "Which rules explain why the 3rd-pl present-active form is διδόασι(ν) rather than *διδονσι?",
              answer: "Rule 3 (special endings: -ασι in 3 pl) + Rule 4 (short vowel ο in the plural — ablaut)",
              parsed: "present active indicative third person plural",
              choices: [
                "Rule 3 (special endings: -ασι in 3 pl) + Rule 4 (short vowel ο in the plural — ablaut)",
                "Rule 1 (present reduplication only — the iota reduplication explains the ending)",
                "Rule 2 (no connecting vowel — but absence of a thematic vowel applies equally to -ω plurals)",
                "Rule 5 (κ-aorist — but this is a present indicative, so Rule 5 cannot be in play)"
              ],
              note: "-μι plurals show the short-vowel grade of the stem; the 3 pl ending is -ασι, not -ουσι." },
            { form: "ἔδωκα vs δέδωκα",
              prompt: "How do you tell ἔδωκα (aorist) from δέδωκα (perfect)?",
              answer: "ἔδωκα has the augment ἐ-; δέδωκα has the perfect reduplication δε-",
              choices: [
                "ἔδωκα has the augment ἐ-; δέδωκα has the perfect reduplication δε-",
                "the κα ending is unique to one of them — only one of the two forms takes κ before α",
                "they are interchangeable forms — Koine collapses the aorist and perfect of δίδωμι",
                "the aorist has primary endings, the perfect secondary — the prefix is identical in both"
              ],
              note: "Both look κα-shaped, but the prefix decides: ἐ- = aorist, δε- = perfect. The aorist takes secondary endings; the perfect, primary." }
          ]
        },
        {
          family: "19.2 α-Contract and ο-Contract Verbs",
          lemma: "ἀγαπάω, δικαιόω",
          gloss: "the other contract patterns",
          questions: [
            { form: "ἀγαπάω → ἀγαπῶ",
              prompt: "Why does the lexical form ἀγαπάω appear in the text as ἀγαπῶ?",
              answer: "α + ω → ω (with circumflex)",
              choices: [
                "α + ω → ω (with circumflex)",
                "the α drops out before all endings",
                "α changes to ε before the ending",
                "they are different verbs entirely"
              ],
              note: "ἀγαπάω (lexicon) → ἀγαπῶ (running text). Same pattern as -έω verbs but with different vowel rules." },
            { form: "α + ε / α + ει",
              prompt: "What does α + ε (and α + ει) contract to in α-contract verbs?",
              answer: "ᾷ",
              choices: [
                "ᾷ",
                "ει",
                "η",
                "ω"
              ],
              note: "Mnemonic: α 'absorbs' the e/ei into a long α." },
            { form: "δικαιόω → δικαιῶ",
              prompt: "Why does the lexical form δικαιόω appear in the text as δικαιῶ?",
              answer: "ο + ω → ω (the long vowel wins; circumflex marks contraction)",
              choices: [
                "ο + ω → ω (the long vowel wins; circumflex marks contraction)",
                "the ο is silent — it is dropped in writing before the personal ending",
                "ο + ω → οω (no contraction, just kept side by side)",
                "ο changes to ε before the ending, like an ε-contract verb"
              ] },
            { form: "ο + ε / ο + ο",
              prompt: "What does ο + ε (or ο + ο) contract to in ο-contract verbs?",
              answer: "ου",
              choices: [
                "ου",
                "ω",
                "οι",
                "ει"
              ],
              note: "Same logic as ε-contract ε + ο → ου, just from the other side." },
            { form: "α + ο",
              prompt: "What does α + ο contract to?",
              answer: "ω",
              choices: ["ω", "ου", "α (long)", "ει"],
              note: "Example: ἀγαπα-ομεν → ἀγαπῶμεν." },
            { form: "ἀγαπῶμεν τὸν θεόν.",
              prompt: "Translate.",
              answer: "we love God",
              choices: [
                "we love God",
                "God loves us",
                "we are loved by God",
                "we will love God"
              ],
              note: "ἀγαπάομεν → ἀγαπῶμεν (α + ο → ω) — running text always shows the contracted form." }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────────────────────
    "20": {
      label: "Chapter 20 Grammar",
      notes: "Final pieces — conditions (full system); genitive absolute; periphrastics; comparison of adjectives & adverbs; optative",
      items: [
        {
          family: "20.1 Conditions",
          lemma: "εἰ / ἐάν conditional sentences",
          gloss: "the four classes of conditions",
          questions: [
            { form: "1st class condition",
              prompt: "How is a 1st-class condition formed?",
              answer: "εἰ + indicative (protasis) — the speaker treats the protasis as TRUE for the sake of argument",
              choices: [
                "εἰ + indicative (protasis) — the speaker treats the protasis as TRUE for the sake of argument",
                "ἐάν + subjunctive — 'if he should …'",
                "εἰ + past indicative + ἄν in apodosis — contrary to fact",
                "no specific form — only context distinguishes contrary-to-fact from real conditions"
              ],
              note: "εἰ υἱὸς εἶ τοῦ θεοῦ … = 'If you ARE the Son of God …' (assumed true for argument)." },
            { form: "2nd class condition",
              prompt: "How is a 2nd-class (contrary-to-fact) condition formed?",
              answer: "εἰ + secondary-tense INDICATIVE in the protasis, ἄν + secondary-tense indicative in the apodosis",
              choices: [
                "εἰ + secondary-tense INDICATIVE in the protasis, ἄν + secondary-tense indicative in the apodosis",
                "εἰ + subjunctive in the protasis — used for hypothetical past events",
                "ἐάν + subjunctive in the protasis — the standard form for any past condition",
                "no specific form — only context distinguishes contrary-to-fact from real conditions"
              ],
              note: "'If you WERE (but you're not), you WOULD ___': εἰ ἤμην … ἄν ἤμην …" },
            { form: "3rd class condition",
              prompt: "How is a 3rd-class (future-more-vivid / general) condition formed?",
              answer: "ἐάν + subjunctive protasis + future/indicative apodosis",
              choices: [
                "ἐάν + subjunctive protasis + future/indicative apodosis",
                "εἰ + indicative — that's actually the 1st-class condition (assumed true)",
                "εἴθε + optative — that's the 4th-class (future-less-vivid) condition",
                "no specific form — context decides which class of condition it is"
              ],
              note: "'If he should ___, he will ___' / 'Whenever he ___s, he ___s'." },
            { form: "ἐὰν λύσῃ",
              prompt: "What construction is this?",
              answer: "third-class condition (protasis) — 'if he should untie'",
              choices: [
                "third-class condition (protasis) — 'if he should untie'",
                "first-class condition — 'if (and assume true)'",
                "purpose clause",
                "indirect statement"
              ] },
            { form: "εἰ ὁ θεὸς λέγει, ἀκούομεν.",
              prompt: "Translate.",
              answer: "if God speaks, we hear",
              choices: [
                "if God speaks, we hear",
                "if God should speak, we would hear",
                "when God speaks, we will hear",
                "though God spoke, we heard"
              ],
              note: "εἰ + indicative = 1st-class condition: speaker treats the protasis as true for the sake of argument." }
          ]
        },
        {
          family: "20.2 The Genitive Absolute",
          lemma: "noun + participle, both gen.",
          gloss: "detached adverbial clause",
          questions: [
            { form: "genitive absolute",
              prompt: "What is the basic structure of a genitive absolute?",
              answer: "a noun/pronoun + a participle, BOTH in the genitive, grammatically detached from the main clause",
              choices: [
                "a noun/pronoun + a participle, BOTH in the genitive, grammatically detached from the main clause",
                "a noun in the genitive with NO participle — the genitive itself carries the adverbial sense",
                "a participle alone in the genitive — its subject is supplied from the main clause",
                "a finite verb in the genitive — Greek's substitute for a subordinating conjunction"
              ] },
            { form: "λύσαντος τοῦ ἀνθρώπου τὸν δοῦλον, ἀπῆλθον.",
              prompt: "What construction is λύσαντος τοῦ ἀνθρώπου?",
              answer: "genitive absolute",
              choices: [
                "genitive absolute",
                "attributive participle",
                "substantive participle",
                "second aorist indicative"
              ] },
            { form: "gen-abs translation",
              prompt: "How is a genitive absolute typically translated?",
              answer: "as an English adverbial clause: 'when / while / after / since (etc.) X did Y'",
              choices: [
                "as an English adverbial clause: 'when / while / after / since (etc.) X did Y'",
                "as a possessive phrase: 'X's Y'",
                "as a main clause with X and Y as subject and verb",
                "as a relative clause: 'X who does Y'"
              ],
              note: "Choose the adverbial flavour (time, cause, concession…) that fits the context — Greek often leaves it open." },
            { form: "why genitive?",
              prompt: "Why is the case GENITIVE in a 'genitive absolute' (rather than nominative)?",
              answer: "the participle's subject is NOT the main-clause subject",
              choices: [
                "the participle's subject is NOT the main-clause subject",
                "because participles always agree with a genitive",
                "because it expresses possession of the main verb",
                "no real reason — convention only"
              ],
              note: "If the participle's subject IS the main clause's subject, you use a normal circumstantial participle (in the same case), NOT a genitive absolute." },
            { form: "λαλοῦντος τοῦ Ἰησοῦ, ἤκουσαν.",
              prompt: "Translate.",
              answer: "while Jesus was speaking, they heard",
              choices: [
                "while Jesus was speaking, they heard",
                "they heard Jesus speaking",
                "Jesus spoke and they heard",
                "they heard about Jesus speaking"
              ],
              note: "Genitive absolute: noun + participle both in genitive, both detached from the main clause's subject." }
          ]
        },
        {
          family: "20.3 Periphrastics",
          lemma: "εἰμί + participle",
          gloss: "compound tense forms",
          questions: [
            { form: "ἦν διδάσκων",
              prompt: "What construction is this?",
              answer: "periphrastic imperfect ('he was teaching')",
              choices: [
                "periphrastic imperfect ('he was teaching')",
                "imperfect indicative of διδάσκω",
                "aorist participle in apposition",
                "perfect periphrastic"
              ],
              note: "imperfect of εἰμί + present participle = periphrastic imperfect — common in Mark / Luke." },
            { form: "ἐστὶν γεγραμμένον",
              prompt: "What construction is this?",
              answer: "periphrastic perfect ('it has been / is written')",
              choices: [
                "periphrastic perfect ('it has been / is written')",
                "present indicative of γράφω ('he writes' — no perfect force)",
                "perfect indicative of εἰμί ('he has been', as a stand-alone)",
                "aorist passive — a simple completed event in the past"
              ],
              note: "present of εἰμί + perfect participle = periphrastic perfect — frequent for stative passives." },
            { form: "periphrastic logic",
              prompt: "Periphrastic forms combine which two elements?",
              answer: "a form of εἰμί + a participle of the lexical verb",
              choices: [
                "a form of εἰμί + a participle of the lexical verb",
                "an augmented stem + the perfect ending",
                "a relative pronoun + an infinitive",
                "two finite indicative verbs joined by καί"
              ] },
            { form: "why periphrastic",
              prompt: "What does a periphrastic typically emphasise vs the plain finite form?",
              answer: "the aspect (ongoing / stative) of the participle",
              choices: [
                "the aspect (ongoing / stative) of the participle",
                "the time (always future)",
                "the voice (always passive)",
                "nothing — they are stylistic variants only"
              ] },
            { form: "ἦν διδάσκων ὁ Ἰησοῦς ἐν τῷ ἱερῷ.",
              prompt: "Translate.",
              answer: "Jesus was teaching in the temple",
              choices: [
                "Jesus was teaching in the temple",
                "Jesus teaches in the temple",
                "Jesus will teach in the temple",
                "Jesus has taught in the temple"
              ],
              note: "Imperfect of εἰμί + present participle = periphrastic imperfect; the participle carries the lexical verb." }
          ]
        },
        {
          family: "20.4 Comparison and Formation of Adjectives and Adverbs",
          lemma: "-τερος / -τατος / μᾶλλον",
          gloss: "comparative and superlative",
          questions: [
            { form: "comparative suffix",
              prompt: "Which suffix forms a regular comparative adjective ('more X')?",
              answer: "-τερος, -τέρα, -τερον (e.g., νεώτερος 'younger')",
              choices: [
                "-τερος, -τέρα, -τερον (e.g., νεώτερος 'younger')",
                "-τατος, -τάτη, -τατον",
                "-ως",
                "no suffix — comparison uses μᾶλλον alone"
              ] },
            { form: "superlative suffix",
              prompt: "Which suffix forms a regular superlative adjective ('most X')?",
              answer: "-τατος, -τάτη, -τατον (e.g., νεώτατος 'youngest')",
              choices: [
                "-τατος, -τάτη, -τατον (e.g., νεώτατος 'youngest')",
                "-τερος, -τέρα, -τερον",
                "-ως",
                "no suffix — comparison uses μάλιστα alone"
              ] },
            { form: "object of comparison",
              prompt: "How does Greek typically express 'than X' after a comparative?",
              answer: "ἤ + same case, OR a bare genitive of comparison",
              choices: [
                "ἤ + same case, OR a bare genitive of comparison",
                "always ἀπό + gen.",
                "always ἐκ + gen.",
                "Greek has no way to express 'than'"
              ],
              note: "μείζων Ἰωάννου = 'greater than John' (gen. of comparison)." },
            { form: "irregular comparison",
              prompt: "How do common irregular adjectives compare (e.g., μέγας, ἀγαθός)?",
              answer: "with suppletive stems: μέγας → μείζων, μέγιστος; ἀγαθός → κρείσσων, ἄριστος / κράτιστος",
              choices: [
                "with suppletive stems: μέγας → μείζων, μέγιστος; ἀγαθός → κρείσσων, ἄριστος / κράτιστος",
                "with the regular -τερος / -τατος suffixes throughout",
                "they don't compare — only adverbs do",
                "by adding μᾶλλον alone, with no stem change"
              ] },
            { form: "adverb formation",
              prompt: "How is an adverb typically formed from an adjective?",
              answer: "replace the genitive plural -ων ending with -ως (e.g., καλός → καλῶς 'well')",
              choices: [
                "replace the genitive plural -ων ending with -ως (e.g., καλός → καλῶς 'well')",
                "add -τατος to the stem — that's actually the superlative suffix",
                "add the article + the adjective — that gives a substantive, not an adverb",
                "adverbs are unrelated to adjectives in Greek — adverbs have their own stems"
              ] },
            { form: "μείζων ὁ Χριστὸς τοῦ Ἀβραάμ.",
              prompt: "Translate.",
              answer: "Christ is greater than Abraham",
              choices: [
                "Christ is greater than Abraham",
                "Christ is the greatest of Abraham",
                "Abraham is greater than Christ",
                "Christ and Abraham are great"
              ],
              note: "μείζων = irregular comparative of μέγας; τοῦ Ἀβραάμ is genitive of comparison ('than Abraham')." }
          ]
        },
        {
          family: "20.5 The Optative",
          lemma: "optative mood",
          gloss: "wish / potential (rare in NT)",
          questions: [
            { form: "optative use",
              prompt: "What is the most common NT use of the optative?",
              answer: "a wish — especially μὴ γένοιτο ('may it not be!')",
              choices: [
                "a wish — especially μὴ γένοιτο ('may it not be!')",
                "a flat statement of fact, like the indicative",
                "a direct command, like the imperative",
                "a strict logical inference, like a deductive conclusion"
              ],
              note: "Paul uses μὴ γένοιτο 15× in Romans / Galatians for emphatic denial." },
            { form: "optative form marker",
              prompt: "What morphological feature signals the optative?",
              answer: "-ι- (or -οι-, -αι-) before the ending",
              choices: [
                "-ι- (or -οι-, -αι-) before the ending",
                "an -η- (subjunctive marker, replacing the short ε)",
                "the augment ε- (the past-time marker)",
                "reduplication (the perfect-stem marker)"
              ],
              note: "λύοιμι, λύοις, λύοι, λύοιμεν, λύοιτε, λύοιεν — present optative of λύω." },
            { form: "optative rarity",
              prompt: "How common is the optative in the NT compared with classical Greek?",
              answer: "much rarer — only ~67× in the NT, and largely confined to set phrases or Lukan style",
              choices: [
                "much rarer — only ~67× in the NT, and largely confined to set phrases or Lukan style",
                "more common in the NT than the subjunctive, especially in Pauline argument",
                "equally common in both periods — Koine preserves classical frequency",
                "not attested in the NT at all — it disappears entirely in Koine prose"
              ] },
            { form: "μὴ γένοιτο.",
              prompt: "Translate.",
              answer: "may it not be!",
              choices: [
                "may it not be!",
                "it does not happen",
                "it has not happened",
                "it will not happen"
              ],
              note: "Aorist optative of γίνομαι with μή — the most common optative in the NT, used for emphatic denial." }
          ]
        }
      ]
    }
  };

  // ───────────────────────────────────────────────────────────────────
  //  WEEK SUPPLEMENTS — aligned to lecture content (W1O–W8O)
  // ───────────────────────────────────────────────────────────────────
  const WEEK_GRAMMAR = {

    "W2O": {
      label: "Week 2 — Course Supplement Grammar",
      notes: "Master indicative paradigm · moods · imperative · active masc. participles",
      items: [
        {
          family: "Tense identification",
          lemma: "λύω indicative",
          gloss: "present, future, imperfect, aorist",
          questions: [
            { form: "λύσομεν",
              prompt: "Parse this form.",
              answer: "future active indicative, 1st pl.",
              choices: [
                "future active indicative, 1st pl.",
                "present active indicative, 1st pl.",
                "aorist active indicative, 1st pl.",
                "imperfect active indicative, 1st pl."
              ] },
            { form: "ἐλύομεν",
              prompt: "Parse this form.",
              answer: "imperfect active indicative, 1st pl.",
              choices: [
                "imperfect active indicative, 1st pl.",
                "aorist active indicative, 1st pl.",
                "present active indicative, 1st pl.",
                "future active indicative, 1st pl."
              ] },
            { form: "ἐλύσαμεν",
              prompt: "Parse this form.",
              answer: "aorist active indicative, 1st pl.",
              choices: [
                "aorist active indicative, 1st pl.",
                "imperfect active indicative, 1st pl.",
                "future active indicative, 1st pl.",
                "present active indicative, 1st pl."
              ],
              note: "ε- augment + σα + 1st-pl ending -μεν = 1st aorist active." }
          ]
        },
        {
          family: "Mood identification",
          lemma: "moods of λύω",
          gloss: "indicative / imperative / infinitive",
          questions: [
            { form: "λυέτω",
              prompt: "Parse this form.",
              answer: "present active imperative, 3rd sg. ('let him untie')",
              choices: [
                "present active imperative, 3rd sg. ('let him untie')",
                "present active indicative, 3rd sg.",
                "aorist active imperative, 3rd sg.",
                "present active infinitive"
              ] },
            { form: "λῦσον",
              prompt: "Parse this form.",
              answer: "aorist active imperative, 2nd sg.",
              choices: [
                "aorist active imperative, 2nd sg.",
                "present active imperative, 2nd sg.",
                "aorist active indicative, 3rd sg.",
                "future active indicative, 3rd sg."
              ] },
            { form: "λῦσαι",
              prompt: "Parse this form.",
              answer: "aorist active infinitive",
              choices: [
                "aorist active infinitive",
                "present active infinitive",
                "aorist active imperative, 2nd sg.",
                "aorist active indicative, 3rd sg."
              ],
              note: "Aorist active infinitive: stem + σα + -ι (no augment, since infinitives are non-indicative)." }
          ]
        },
        {
          family: "Active masculine participle",
          lemma: "λύων",
          gloss: "present active participle",
          questions: [
            { form: "λύοντος",
              prompt: "Parse this form.",
              answer: "genitive singular masculine/neuter, present active participle",
              choices: [
                "genitive singular masculine/neuter, present active participle",
                "accusative singular masculine, present active participle",
                "nominative plural masculine, present active participle",
                "dative singular feminine, present active participle"
              ] },
            { form: "λύοντες",
              prompt: "Parse this form.",
              answer: "nominative plural masculine, present active participle",
              choices: [
                "nominative plural masculine, present active participle",
                "accusative plural masculine, present active participle",
                "nominative singular masculine, present active participle",
                "dative plural masculine, present active participle"
              ] },
            { form: "λύων",
              prompt: "Parse this form.",
              answer: "nominative singular masculine, present active participle",
              choices: [
                "nominative singular masculine, present active participle",
                "1st sg. present active indicative",
                "nominative plural masculine, present active participle",
                "genitive singular masculine, present active participle"
              ],
              note: "λύων / λύουσα / λῦον — the nom. sg. of the present active participle." }
          ]
        }
      ]
    },

    "W3O": {
      label: "Week 3 — Course Supplement Grammar",
      notes: "Complete εἰμί · demonstrative paradigms · personal pronouns",
      items: [
        {
          family: "Complete εἰμί paradigm",
          lemma: "εἰμί",
          gloss: "present / future / imperfect",
          questions: [
            { form: "ἔσομαι",
              prompt: "Parse this form of εἰμί.",
              answer: "future indicative, 1st sg. ('I will be')",
              parsed: "future middle indicative first person singular",
              choices: [
                "future indicative, 1st sg. ('I will be')",
                "present indicative, 1st sg.",
                "imperfect indicative, 1st sg.",
                "aorist middle indicative, 1st sg."
              ],
              note: "εἰμί has middle-form future endings: ἔσομαι, ἔσῃ, ἔσται, ἐσόμεθα, ἔσεσθε, ἔσονται." },
            { form: "ἔσται",
              prompt: "Parse this form of εἰμί.",
              answer: "future indicative, 3rd sg. ('he/she/it will be')",
              parsed: "future middle indicative third person singular",
              choices: [
                "future indicative, 3rd sg. ('he/she/it will be')",
                "present indicative, 3rd sg.",
                "imperfect indicative, 3rd sg.",
                "future indicative, 3rd pl."
              ] },
            { form: "ἤμεθα",
              prompt: "Parse this form of εἰμί.",
              answer: "imperfect indicative, 1st pl. ('we were')",
              parsed: "imperfect active indicative first person plural",
              choices: [
                "imperfect indicative, 1st pl. ('we were')",
                "present indicative, 1st pl.",
                "imperfect indicative, 2nd pl.",
                "future indicative, 1st pl."
              ],
              note: "ἤμην, ἦς, ἦν, ἤμεθα (or ἦμεν), ἦτε, ἦσαν." }
          ]
        },
        {
          family: "εἰμί non-indicative",
          lemma: "εἰμί",
          gloss: "infinitive and participle",
          questions: [
            { form: "εἶναι",
              prompt: "Parse this form of εἰμί.",
              answer: "present infinitive ('to be')",
              parsed: "present active infinitive",
              choices: ["present infinitive ('to be')", "1st sg. present indicative", "present participle (nom. masc. sg.)", "imperative, 2nd sg."] },
            { form: "ὤν",
              prompt: "Parse this form of εἰμί.",
              answer: "nominative singular masculine, present participle ('being')",
              parsed: "present active participle nominative singular masculine",
              choices: [
                "nominative singular masculine, present participle ('being')",
                "nominative singular feminine, present participle",
                "nominative singular neuter, present participle",
                "1st sg. present indicative"
              ] },
            { form: "οὖσα",
              prompt: "Parse this form of εἰμί.",
              answer: "nominative singular feminine, present participle ('being')",
              parsed: "present active participle nominative singular feminine",
              choices: [
                "nominative singular feminine, present participle ('being')",
                "nominative singular masculine, present participle",
                "nominative plural neuter, present participle",
                "accusative singular feminine, present participle"
              ],
              note: "ὤν / οὖσα / ὄν — masculine / feminine / neuter nom. sg." },
            { form: "ὄντος",
              prompt: "Parse this form of εἰμί.",
              answer: "genitive singular masculine/neuter, present participle",
              parsed: "present active participle genitive singular masculine/neuter",
              choices: [
                "genitive singular masculine/neuter, present participle",
                "nominative singular masculine, present participle",
                "accusative singular masculine, present participle",
                "genitive plural masculine, present participle"
              ],
              note: "εἰμί's participle declines like an active participle (3rd-1st-3rd)." }
          ]
        },
        {
          family: "Near demonstrative paradigm — οὗτος",
          lemma: "οὗτος, αὕτη, τοῦτο",
          gloss: "this",
          questions: [
            { form: "οὗτος",
              prompt: "Parse this form.",
              answer: "nominative singular masculine",
              choices: [
                "nominative singular masculine",
                "nominative singular feminine",
                "nominative plural masculine",
                "accusative singular masculine"
              ] },
            { form: "αὕτη",
              prompt: "Parse this form.",
              answer: "nominative singular feminine ('this')",
              choices: [
                "nominative singular feminine ('this')",
                "nominative singular feminine of αὐτός ('she herself')",
                "nominative plural feminine of οὗτος",
                "dative singular feminine"
              ],
              note: "αὕτη (rough breathing) is the demonstrative; αὐτή (smooth) is αὐτός." },
            { form: "τοῦτο",
              prompt: "Parse this form.",
              answer: "nominative or accusative singular neuter",
              choices: [
                "nominative or accusative singular neuter",
                "nominative singular masculine",
                "genitive singular neuter",
                "nominative plural neuter"
              ] },
            { form: "τούτων",
              prompt: "Parse this form.",
              answer: "genitive plural (all genders)",
              choices: [
                "genitive plural (all genders)",
                "dative plural (all genders)",
                "genitive singular masculine/neuter",
                "accusative plural masculine"
              ] }
          ]
        },
        {
          family: "Far demonstrative paradigm — ἐκεῖνος",
          lemma: "ἐκεῖνος, ἐκείνη, ἐκεῖνο",
          gloss: "that",
          questions: [
            { form: "ἐκεῖνος",
              prompt: "Parse this form.",
              answer: "nominative singular masculine ('that one')",
              choices: [
                "nominative singular masculine ('that one')",
                "nominative singular feminine",
                "nominative plural masculine",
                "accusative singular masculine"
              ] },
            { form: "ἐκείνῃ",
              prompt: "Parse this form.",
              answer: "dative singular feminine",
              choices: [
                "dative singular feminine",
                "nominative singular feminine",
                "dative singular masculine/neuter",
                "dative plural feminine"
              ] },
            { form: "ἐκείνου",
              prompt: "Parse this form.",
              answer: "genitive singular masculine/neuter",
              choices: [
                "genitive singular masculine/neuter",
                "accusative singular masculine",
                "genitive plural masculine",
                "dative singular masculine/neuter"
              ],
              note: "ἐκεῖνος declines just like αὐτός / 2-1-2 adjectives." }
          ]
        },
        {
          family: "First and second personal pronouns",
          lemma: "ἐγώ / σύ",
          gloss: "1st and 2nd person pronoun paradigm",
          questions: [
            { form: "ἐμοῦ",
              prompt: "Parse this form.",
              answer: "genitive singular ('of me') — emphatic 1st sg.",
              parsed: "genitive singular",
              choices: [
                "genitive singular ('of me') — emphatic 1st sg.",
                "dative singular — emphatic 1st sg.",
                "accusative singular — emphatic 1st sg.",
                "genitive plural ('of us')"
              ],
              note: "Emphatic forms: ἐμοῦ / ἐμοί / ἐμέ. Enclitic forms: μου / μοι / με." },
            { form: "ἡμῶν",
              prompt: "Parse this form.",
              answer: "genitive plural ('of us')",
              parsed: "genitive plural",
              choices: [
                "genitive plural ('of us')",
                "genitive plural ('of you all')",
                "dative plural ('to us')",
                "accusative plural ('us')"
              ],
              note: "ἡμῶν (1pl) vs ὑμῶν (2pl) differ only by the breathing/accent — easy to confuse." },
            { form: "ὑμῖν",
              prompt: "Parse this form.",
              answer: "dative plural ('to you all')",
              parsed: "dative plural",
              choices: [
                "dative plural ('to you all')",
                "dative plural ('to us')",
                "genitive plural ('of you all')",
                "nominative plural ('you all')"
              ] },
            { form: "σέ",
              prompt: "Parse this form.",
              answer: "accusative singular ('you') — emphatic 2nd sg.",
              parsed: "accusative singular",
              choices: [
                "accusative singular ('you') — emphatic 2nd sg.",
                "accusative singular — enclitic 2nd sg.",
                "nominative singular 2nd sg.",
                "dative singular 2nd sg."
              ],
              note: "Emphatic σοῦ / σοί / σέ vs enclitic σου / σοι / σε." }
          ]
        }
      ]
    },

    "W4O": {
      label: "Week 4 — Course Supplement Grammar",
      notes: "Relative pronouns · second aorist · liquid futures",
      items: [
        {
          family: "Relative pronoun paradigm — ὅς, ἥ, ὅ",
          lemma: "ὅς, ἥ, ὅ",
          gloss: "who, which",
          questions: [
            { form: "ὅς",
              prompt: "Parse this relative pronoun.",
              answer: "nominative singular masculine",
              choices: [
                "nominative singular masculine",
                "nominative singular feminine",
                "accusative singular masculine",
                "nominative plural masculine"
              ] },
            { form: "ἥν",
              prompt: "Parse this relative pronoun.",
              answer: "accusative singular feminine",
              choices: [
                "accusative singular feminine",
                "nominative singular feminine",
                "accusative singular masculine",
                "genitive singular feminine"
              ],
              note: "Distinguish from the article ἥν (acc. sg. fem. of ἡ) by accent: rel. ἥν (acute) vs the article context." },
            { form: "ᾧ",
              prompt: "Parse this relative pronoun.",
              answer: "dative singular masculine/neuter",
              choices: [
                "dative singular masculine/neuter",
                "dative singular feminine",
                "genitive singular masculine/neuter",
                "dative plural masculine/neuter"
              ] },
            { form: "οὕς",
              prompt: "Parse this relative pronoun.",
              answer: "accusative plural masculine",
              choices: [
                "accusative plural masculine",
                "nominative plural masculine",
                "genitive plural masculine",
                "accusative plural feminine"
              ] },
            { form: "ὧν",
              prompt: "Parse this relative pronoun.",
              answer: "genitive plural (all genders)",
              choices: [
                "genitive plural (all genders)",
                "dative plural (all genders)",
                "genitive singular masculine/neuter",
                "accusative plural masculine"
              ],
              note: "Like the article τῶν, ὧν is identical across all three genders in the genitive plural." }
          ]
        },
        {
          family: "Second aorist paradigm",
          lemma: "λαμβάνω / ἔρχομαι / λέγω",
          gloss: "2nd aorist active indicative across persons",
          questions: [
            { form: "ἦλθον",
              prompt: "Parse this form (in isolation).",
              answer: "aorist active indicative, 1st sg. or 3rd pl. of ἔρχομαι",
              choices: [
                "aorist active indicative, 1st sg. or 3rd pl. of ἔρχομαι",
                "imperfect active indicative, 1st sg. of ἔρχομαι",
                "present active indicative, 1st sg. of ἔρχομαι",
                "future active indicative, 1st sg. of ἔρχομαι"
              ],
              note: "Like ἔλυον, ἦλθον is ambiguous between 1 sg. and 3 pl. without context." },
            { form: "εἶπεν",
              prompt: "Parse this form.",
              answer: "aorist active indicative, 3rd sg. of λέγω ('he said')",
              choices: [
                "aorist active indicative, 3rd sg. of λέγω ('he said')",
                "imperfect active indicative, 3rd sg. of λέγω",
                "present active indicative, 3rd sg. of λέγω",
                "future active indicative, 3rd sg. of λέγω"
              ] },
            { form: "ἔλαβον",
              prompt: "Parse this form (in isolation).",
              answer: "aorist active indicative, 1st sg. or 3rd pl. of λαμβάνω",
              choices: [
                "aorist active indicative, 1st sg. or 3rd pl. of λαμβάνω",
                "imperfect active indicative, 1st sg. of λαμβάνω",
                "present active indicative, 1st sg. of λαμβάνω",
                "future active indicative, 1st sg. of λαμβάνω"
              ],
              note: "λαμβάνω uses the 2nd-aorist stem λαβ-. Imperfect would be ἐλάμβανον (present stem)." },
            { form: "ἐλάβετε",
              prompt: "Parse this form.",
              answer: "aorist active indicative, 2nd pl. of λαμβάνω",
              choices: [
                "aorist active indicative, 2nd pl. of λαμβάνω",
                "imperfect active indicative, 2nd pl. of λαμβάνω",
                "present active indicative, 2nd pl. of λαμβάνω",
                "future active indicative, 2nd pl. of λαμβάνω"
              ],
              note: "2nd-aorist endings are the same as imperfect: -ον, -ες, -ε(ν), -ομεν, -ετε, -ον." },
            { form: "ἦλθες",
              prompt: "Parse this form.",
              answer: "aorist active indicative, 2nd sg. of ἔρχομαι ('you came')",
              choices: [
                "aorist active indicative, 2nd sg. of ἔρχομαι ('you came')",
                "imperfect active indicative, 2nd sg. of ἔρχομαι",
                "present active indicative, 2nd sg. of ἔρχομαι",
                "future active indicative, 2nd sg. of ἔρχομαι"
              ] }
          ]
        },
        {
          family: "Liquid futures",
          lemma: "μένω / ἀποστέλλω",
          gloss: "future without σ",
          questions: [
            { form: "μενοῦμεν",
              prompt: "Parse this form.",
              answer: "future active indicative, 1st pl. of μένω",
              choices: [
                "future active indicative, 1st pl. of μένω",
                "present active indicative, 1st pl. of μένω",
                "aorist active indicative, 1st pl. of μένω",
                "imperfect active indicative, 1st pl. of μένω"
              ],
              note: "Looks like an ε-contract present, but the lemma μένω has no contract vowel — so the contraction signals the future." },
            { form: "ἀποστελοῦσιν",
              prompt: "Parse this form.",
              answer: "future active indicative, 3rd pl. of ἀποστέλλω",
              choices: [
                "future active indicative, 3rd pl. of ἀποστέλλω",
                "present active indicative, 3rd pl. of ἀποστέλλω",
                "aorist active indicative, 3rd pl. of ἀποστέλλω",
                "imperfect active indicative, 3rd pl. of ἀποστέλλω"
              ],
              note: "Present is ἀποστέλλουσι(ν) (double λλ + ουσι); future ἀποστελοῦσι(ν) loses one λ and contracts." },
            { form: "κρινεῖ",
              prompt: "Parse this form.",
              answer: "future active indicative, 3rd sg. of κρίνω ('he will judge')",
              choices: [
                "future active indicative, 3rd sg. of κρίνω ('he will judge')",
                "present active indicative, 3rd sg. of κρίνω ('he judges')",
                "aorist active indicative, 3rd sg. of κρίνω",
                "imperfect active indicative, 3rd sg. of κρίνω"
              ],
              note: "Present κρίνει vs future κρινεῖ — circumflex accent over the ει marks the contracted future." }
          ]
        }
      ]
    },

    "W5O": {
      label: "Week 5 — Course Supplement Grammar",
      notes: "Third declension · participial paradigms · second / third declension review",
      items: [
        {
          family: "Stem class identification",
          lemma: "third declension",
          gloss: "from genitive singular",
          questions: [
            { form: "θέλημα, θελήματος",
              prompt: "What stem class is this?",
              answer: "ματ-stem (neuter)",
              choices: ["ματ-stem (neuter)", "ν-stem", "κ-stem", "σ-stem"] },
            { form: "νύξ, νυκτός",
              prompt: "What stem class is this?",
              answer: "κτ-stem",
              choices: ["κτ-stem", "ν-stem", "σ-stem (neuter)", "ντ-stem"],
              note: "The genitive νυκτός shows the stem νυκτ-. In the nominative singular, τ drops before ς, then κ + ς → ξ." },
            { form: "αἰών, αἰῶνος",
              prompt: "What stem class is this?",
              answer: "ν-stem",
              choices: ["ν-stem", "ντ-stem", "ματ-stem", "κ-stem"] }
          ]
        },
        {
          family: "Participle paradigms — visual cues",
          lemma: "λύων / λυόμενος",
          gloss: "active vs middle/passive",
          questions: [
            { form: "λύων",
              prompt: "Active or middle/passive participle?",
              answer: "active (3rd-decl. masc/neut + 1st-decl. fem.)",
              parsed: "present active participle nominative singular masculine",
              choices: [
                "active (3rd-decl. masc/neut + 1st-decl. fem.)",
                "middle/passive (2-1-2 adjective endings)",
                "passive only",
                "infinitive"
              ] },
            { form: "λυόμενος",
              prompt: "Active or middle/passive participle?",
              answer: "middle/passive (2-1-2 adjective endings)",
              parsed: "present middle/passive participle nominative singular masculine",
              choices: [
                "middle/passive (2-1-2 adjective endings)",
                "active (3rd-decl. masc/neut + 1st-decl. fem.)",
                "active only",
                "infinitive"
              ],
              note: "M/P participles always look like ἀγαθός, -ή, -όν." },
            { form: "λύοντος vs λυομένου",
              prompt: "Which is the genitive singular of the middle/passive participle?",
              answer: "λυομένου",
              choices: [
                "λυομένου",
                "λύοντος",
                "λύσαντος",
                "λυθέντος"
              ],
              note: "Active gen. sg.: λύοντος (3rd-decl. -ντος). M/P gen. sg.: λυομένου (2-1-2, like ἀγαθοῦ)." }
          ]
        }
      ]
    },

    "W6O": {
      label: "Week 6 — Course Supplement Grammar",
      notes: "Passive endings · passive participles · perfect · pluperfect · square of stops",
      items: [
        {
          family: "Passive form parsing",
          lemma: "λύω passive",
          gloss: "θη marker",
          questions: [
            { form: "ἐλύθην",
              prompt: "Parse this form.",
              answer: "aorist passive indicative, 1st sg.",
              choices: [
                "aorist passive indicative, 1st sg.",
                "aorist active indicative, 1st sg.",
                "imperfect active indicative, 1st sg.",
                "perfect passive indicative, 1st sg."
              ],
              note: "augment + stem + θη + secondary active endings." },
            { form: "λυθήσεται",
              prompt: "Parse this form.",
              answer: "future passive indicative, 3rd sg.",
              choices: [
                "future passive indicative, 3rd sg.",
                "aorist passive indicative, 3rd sg.",
                "future middle indicative, 3rd sg.",
                "perfect passive indicative, 3rd sg."
              ],
              note: "θη + σ + middle endings = future passive." },
            { form: "ἐλύθησαν",
              prompt: "Parse this form.",
              answer: "aorist passive indicative, 3rd pl.",
              choices: [
                "aorist passive indicative, 3rd pl.",
                "aorist active indicative, 3rd pl.",
                "imperfect active indicative, 3rd pl.",
                "future passive indicative, 3rd pl."
              ],
              note: "ἐ-λύ-θη-σαν: augment + stem + θη + 3rd-pl. -σαν." }
          ]
        },
        {
          family: "Aorist passive participle",
          lemma: "λυθείς, λυθεῖσα, λυθέν",
          gloss: "having been untied",
          questions: [
            { form: "λυθείς",
              prompt: "Parse this form.",
              answer: "nominative singular masculine, aorist passive participle",
              choices: [
                "nominative singular masculine, aorist passive participle",
                "nominative singular feminine, aorist passive participle",
                "genitive singular masculine, aorist passive participle",
                "nominative plural masculine, aorist passive participle"
              ] },
            { form: "λυθέντος",
              prompt: "Parse this form.",
              answer: "genitive singular masculine/neuter, aorist passive participle",
              choices: [
                "genitive singular masculine/neuter, aorist passive participle",
                "accusative singular masculine, aorist passive participle",
                "dative singular masculine/neuter, aorist passive participle",
                "nominative plural masculine, aorist passive participle"
              ] },
            { form: "λυθεῖσα",
              prompt: "Parse this form.",
              answer: "nominative singular feminine, aorist passive participle",
              choices: [
                "nominative singular feminine, aorist passive participle",
                "nominative singular masculine, aorist passive participle",
                "nominative plural neuter, aorist passive participle",
                "dative singular feminine, aorist passive participle"
              ],
              note: "Aorist passive participle declines 3-1-3: λυθείς / λυθεῖσα / λυθέν." }
          ]
        },
        {
          family: "Perfect and pluperfect identification",
          lemma: "λέλυκα / ἐλελύκειν",
          gloss: "completed action / pluperfect",
          questions: [
            { form: "λέλυκα",
              prompt: "Parse this form.",
              answer: "perfect active indicative, 1st sg.",
              choices: [
                "perfect active indicative, 1st sg.",
                "aorist active indicative, 1st sg.",
                "imperfect active indicative, 1st sg.",
                "pluperfect active indicative, 1st sg."
              ] },
            { form: "ἐλελύκειν",
              prompt: "Parse this form.",
              answer: "pluperfect active indicative, 1st sg.",
              choices: [
                "pluperfect active indicative, 1st sg.",
                "perfect active indicative, 1st sg.",
                "aorist active indicative, 1st sg.",
                "imperfect active indicative, 1st sg."
              ] },
            { form: "λέλυται",
              prompt: "Parse this form.",
              answer: "perfect middle/passive indicative, 3rd sg.",
              choices: [
                "perfect middle/passive indicative, 3rd sg.",
                "perfect active indicative, 3rd sg.",
                "present middle/passive indicative, 3rd sg.",
                "aorist middle indicative, 3rd sg."
              ],
              note: "Reduplication (λε-) + stem (no -κ-) + primary M/P endings. The perfect M/P drops the κ." }
          ]
        }
      ]
    },

    "W7O": {
      label: "Week 7 — Course Supplement Grammar",
      notes: "Subjunctive · indefinite constructions · 3rd-person imperative · aspect",
      items: [
        {
          family: "Long-vowel verb forms",
          lemma: "λύω",
          gloss: "long-vowel marker",
          questions: [
            { form: "λύωμεν",
              prompt: "Parse this form.",
              answer: "present active subjunctive, 1st pl.",
              choices: [
                "present active subjunctive, 1st pl.",
                "present active indicative, 1st pl.",
                "aorist active subjunctive, 1st pl.",
                "imperfect active indicative, 1st pl."
              ],
              note: "ω in place of ο in 1st pl. is the subjunctive marker." },
            { form: "λύσῃ",
              prompt: "Parse this form (active reading).",
              answer: "aorist active subjunctive, 3rd sg.",
              choices: [
                "aorist active subjunctive, 3rd sg.",
                "future active indicative, 3rd sg.",
                "present active subjunctive, 3rd sg.",
                "aorist active indicative, 3rd sg."
              ],
              note: "σ + long-vowel ending = aorist subjunctive (no augment, since augment is indicative-only)." },
            { form: "λύητε",
              prompt: "Parse this form.",
              answer: "present active subjunctive, 2nd pl.",
              choices: [
                "present active subjunctive, 2nd pl.",
                "present active indicative, 2nd pl.",
                "aorist active subjunctive, 2nd pl.",
                "present active imperative, 2nd pl."
              ],
              note: "Indicative λύετε vs subjunctive λύητε — η replaces ε in the 2nd plural." }
          ]
        },
        {
          family: "Indefinite constructions",
          lemma: "ὅς ἄν / ὅταν",
          gloss: "general clauses",
          questions: [
            { form: "ὃς ἂν λύσῃ",
              prompt: "Translate.",
              answer: "'whoever unties / should untie'",
              choices: ["'whoever unties / should untie'", "'who unties'", "'while untying'", "'in order that he untie'"] },
            { form: "ὅταν λύσῃ",
              prompt: "Translate.",
              answer: "'whenever he unties'",
              choices: ["'whenever he unties'", "'when he untied'", "'because he unties'", "'in order that he untie'"] },
            { form: "ὅπου ἂν ᾖ",
              prompt: "Translate.",
              answer: "'wherever he is'",
              choices: ["'wherever he is'", "'where he was'", "'when he is there'", "'because he is there'"],
              note: "Indefinite local clause: ὅπου + ἄν + subjunctive." },
            { form: "ἐάν τις ἀκούσῃ",
              prompt: "Translate.",
              answer: "'if anyone hears' / 'whoever hears'",
              choices: [
                "'if anyone hears' / 'whoever hears'",
                "'if he heard'",
                "'because someone hears'",
                "'so that someone may hear'"
              ],
              note: "ἐάν τις = stock NT phrasing for 'whoever'." }
          ]
        },
        {
          family: "3rd-person imperative",
          lemma: "λυέτω / λυσάτω",
          gloss: "let him / her untie",
          questions: [
            { form: "λυέτω",
              prompt: "Parse this form.",
              answer: "present active imperative, 3rd sg. ('let him untie')",
              choices: [
                "present active imperative, 3rd sg. ('let him untie')",
                "aorist active imperative, 3rd sg.",
                "present active indicative, 3rd sg.",
                "present active subjunctive, 3rd sg."
              ] },
            { form: "λυσάτω",
              prompt: "Parse this form.",
              answer: "aorist active imperative, 3rd sg. ('let him untie')",
              choices: [
                "aorist active imperative, 3rd sg. ('let him untie')",
                "present active imperative, 3rd sg.",
                "aorist active indicative, 3rd sg.",
                "future active indicative, 3rd sg."
              ] },
            { form: "λυέτωσαν",
              prompt: "Parse this form.",
              answer: "present active imperative, 3rd pl. ('let them untie')",
              choices: [
                "present active imperative, 3rd pl. ('let them untie')",
                "aorist active imperative, 3rd pl.",
                "present active indicative, 3rd pl.",
                "present active subjunctive, 3rd pl."
              ],
              note: "3rd-pl. present active imperative: stem + -ετωσαν. English requires a paraphrase: 'let them …'." }
          ]
        },
        {
          family: "Aspect of imperatives",
          lemma: "present vs aorist imperative",
          gloss: "ongoing vs whole-event",
          questions: [
            { form: "πίστευε vs πίστευσον",
              prompt: "Which captures the imperfective ('keep on believing') sense?",
              answer: "πίστευε (present imperative)",
              choices: ["πίστευε (present imperative)", "πίστευσον (aorist imperative)", "both equally", "neither — both are perfective"] },
            { form: "aspect, not time",
              prompt: "In the imperative, what does the choice of present vs aorist primarily encode?",
              answer: "aspect (how the action is portrayed), not time",
              choices: [
                "aspect (how the action is portrayed), not time",
                "absolute time (present time vs past time)",
                "voice (active vs middle)",
                "person (2nd vs 3rd)"
              ],
              note: "All imperatives refer to action that has not yet happened. Tense form signals aspect only." },
            { form: "μή + present vs μή + aorist subj.",
              prompt: "Which combination forbids an ongoing action ('stop doing X') vs which forbids inception ('don't start')?",
              answer: "μή + present imperative = 'stop doing'; μή + aorist subjunctive = 'don't start'",
              choices: [
                "μή + present imperative = 'stop doing'; μή + aorist subjunctive = 'don't start'",
                "Reverse — μή + aorist subjunctive = 'stop doing'; μή + present imperative = 'don't start'",
                "Both work identically.",
                "Both are forbidden in koine Greek."
              ],
              note: "Aspect again: imperfective (present impv.) views the action as ongoing; perfective (aor. subj.) views it as a single whole, hence 'don't start'." }
          ]
        }
      ]
    },

    "W8O": {
      label: "Week 8 — Course Supplement Grammar",
      notes: "-μι present active · -μι other active tenses · -μι middle/passive",
      items: [
        {
          family: "-μι present active",
          lemma: "δίδωμι",
          gloss: "athematic present",
          questions: [
            { form: "δίδομεν",
              prompt: "Parse this form.",
              answer: "present active indicative, 1st pl.",
              choices: [
                "present active indicative, 1st pl.",
                "present active subjunctive, 1st pl.",
                "imperfect active indicative, 1st pl.",
                "aorist active indicative, 1st pl."
              ],
              note: "Note the short-vowel stem (δίδο-) in the plural; long-vowel stem (διδω-) in the singular." },
            { form: "δίδοτε",
              prompt: "Parse this form (in isolation).",
              answer: "ambiguous: present active indicative or imperative, 2nd pl.",
              choices: [
                "ambiguous: present active indicative or imperative, 2nd pl.",
                "present active indicative, 2nd pl. — only",
                "present active imperative, 2nd pl. — only",
                "aorist active indicative, 2nd pl."
              ],
              note: "Same as λύετε / φιλεῖτε in the -ω class — context decides." },
            { form: "δίδωμι",
              prompt: "Parse this form.",
              answer: "present active indicative, 1st sg. ('I give')",
              choices: [
                "present active indicative, 1st sg. ('I give')",
                "present active subjunctive, 1st sg.",
                "imperfect active indicative, 1st sg.",
                "aorist active indicative, 1st sg."
              ],
              note: "The lemma is itself the 1st-singular form: -μι replaces -ω in this class." }
          ]
        },
        {
          family: "-μι other tenses",
          lemma: "δίδωμι",
          gloss: "future / aorist / perfect",
          questions: [
            { form: "δώσει",
              prompt: "Parse this form.",
              answer: "future active indicative, 3rd sg.",
              choices: [
                "future active indicative, 3rd sg.",
                "aorist active subjunctive, 3rd sg.",
                "present active indicative, 3rd sg.",
                "aorist active indicative, 3rd sg."
              ] },
            { form: "ἔδωκεν",
              prompt: "Parse this form.",
              answer: "aorist active indicative, 3rd sg.",
              choices: [
                "aorist active indicative, 3rd sg.",
                "perfect active indicative, 3rd sg.",
                "imperfect active indicative, 3rd sg.",
                "future active indicative, 3rd sg."
              ],
              note: "δίδωμι uses a κ-aorist (ἔδωκα, ἔδωκας, ἔδωκε(ν)…)." },
            { form: "δέδωκεν",
              prompt: "Parse this form.",
              answer: "perfect active indicative, 3rd sg.",
              choices: [
                "perfect active indicative, 3rd sg.",
                "aorist active indicative, 3rd sg.",
                "pluperfect active indicative, 3rd sg.",
                "imperfect active indicative, 3rd sg."
              ],
              note: "Reduplication δε- + δωκ + ε(ν) = perfect active. Common in John ('the Father has given…')." }
          ]
        },
        {
          family: "-μι middle/passive",
          lemma: "δίδομαι",
          gloss: "athematic middle/passive",
          questions: [
            { form: "δίδοται",
              prompt: "Parse this form.",
              answer: "present middle/passive indicative, 3rd sg.",
              choices: [
                "present middle/passive indicative, 3rd sg.",
                "present active indicative, 3rd sg.",
                "perfect middle/passive indicative, 3rd sg.",
                "aorist middle/passive indicative, 3rd sg."
              ] },
            { form: "ἐδίδοτο",
              prompt: "Parse this form.",
              answer: "imperfect middle/passive indicative, 3rd sg.",
              choices: [
                "imperfect middle/passive indicative, 3rd sg.",
                "present middle/passive indicative, 3rd sg.",
                "aorist middle indicative, 3rd sg.",
                "perfect middle/passive indicative, 3rd sg."
              ],
              note: "Augment ἐ- + short-vowel stem διδο- + secondary M/P ending -το." },
            { form: "ἐδόθη",
              prompt: "Parse this form.",
              answer: "aorist passive indicative, 3rd sg. ('it was given')",
              choices: [
                "aorist passive indicative, 3rd sg. ('it was given')",
                "aorist active indicative, 3rd sg.",
                "imperfect middle/passive indicative, 3rd sg.",
                "perfect passive indicative, 3rd sg."
              ],
              note: "δίδωμι's aorist passive uses the regular θη marker on the bare δο- stem." }
          ]
        }
      ]
    }
  };

  // ───────────────────────────────────────────────────────────────────
  //  MERGE → single GRAMMAR_SETS keyed by chapter or W-key
  // ───────────────────────────────────────────────────────────────────
  const GRAMMAR_SETS = {};
  Object.entries(CHAPTER_GRAMMAR).forEach(([key, set]) => { GRAMMAR_SETS[key] = set; });
  Object.entries(WEEK_GRAMMAR).forEach(([key, set]) => { GRAMMAR_SETS[key] = set; });

  function notifyGrammarDataChanged() {
    if (typeof window.dispatchEvent !== 'function' || typeof window.CustomEvent !== 'function') return;
    window.dispatchEvent(new window.CustomEvent('greekSupplementalDataChanged', {
      detail: { kind: 'grammar' }
    }));
  }

  function registerSupplementalGrammarSets(sets, options = {}) {
    if (!sets || typeof sets !== 'object') return;

    Object.entries(sets).forEach(([key, set]) => {
      if (!key || !set) return;
      const rawKey = String(key);
      GRAMMAR_SETS[rawKey] = set;

      if (window.SETS && typeof window.SETS === 'object') {
        window.SETS[rawKey] = {
          ...(window.SETS[rawKey] || {}),
          label: set.label || window.SETS[rawKey]?.label || rawKey,
          type: window.SETS[rawKey]?.type || 'other',
          week: window.SETS[rawKey]?.week ?? null,
          cards: Array.isArray(window.SETS[rawKey]?.cards) ? window.SETS[rawKey].cards : []
        };
      }
    });

    if (!options.silent) notifyGrammarDataChanged();
  }

  if (window.SUPPLEMENTAL_GRAMMAR_SETS && typeof window.SUPPLEMENTAL_GRAMMAR_SETS === 'object') {
    registerSupplementalGrammarSets(window.SUPPLEMENTAL_GRAMMAR_SETS, { silent: true });
  }

  // ───────────────────────────────────────────────────────────────────
  //  HELPERS
  // ───────────────────────────────────────────────────────────────────
  function localShuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function stableGrammarKey(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .toLowerCase()
      .replace(/^-+|-+$/g, '');
  }

  // ───────────────────────────────────────────────────────────────────
  //  PUBLIC BUILDERS
  // ───────────────────────────────────────────────────────────────────
  function parseParadigmKey(key) {
    const match = String(key).match(/^(.+)::(grammar|morph)::(\d+)$/);
    if (!match) return { baseKey: String(key), type: null, itemIdx: null };
    return { baseKey: match[1], type: match[2], itemIdx: Number(match[3]) };
  }

  // Reversibility heuristics — a question can be flipped into "pick the
  // Greek form for this English description" when the displayed form is
  // a Greek string, every choice is non-Greek (parse-style English), and
  // the prompt is a recognition / parsing question (not a meta question
  // like "which case does ἐν take?", which has many correct Greek answers).
  const GREEK_RANGE = /[Ͱ-Ͽἀ-῿]/;
  const RECOGNITION_PROMPT = /^\s*(parse|identify|which letter|which letter-form|what tense|what mood|what case|what voice|what (kind of )?form|what is this form|name (this|the))/i;
  function containsGreek(text) {
    return GREEK_RANGE.test(String(text || ''));
  }
  function isReversibleQuestion(q) {
    if (!q || !q.form || !q.answer) return false;
    if (!containsGreek(q.form)) return false;
    if (containsGreek(q.answer)) return false;
    const choices = Array.isArray(q.choices) ? q.choices : [];
    if (choices.some(containsGreek)) return false;
    return RECOGNITION_PROMPT.test(String(q.prompt || ''));
  }

  function buildGrammarCardsForKeys(keys) {
    const selected = (keys || []).map(String);
    const cards = [];

    // Build a global pool of Greek forms from reversible questions
    // across the selection, used as a fallback when an item is too
    // small to supply three same-paradigm distractors.
    const allReversibleForms = [];
    selected.forEach((key) => {
      const selection = parseParadigmKey(key);
      if (selection.type && selection.type !== 'grammar') return;
      const set = GRAMMAR_SETS[selection.baseKey];
      if (!set) return;
      const items = Number.isInteger(selection.itemIdx) ? [set.items[selection.itemIdx]] : set.items;
      items.forEach((item) => {
        if (!item || !Array.isArray(item.questions)) return;
        item.questions.forEach((q) => {
          if (isReversibleQuestion(q)) allReversibleForms.push(q.form);
        });
      });
    });

    selected.forEach((key) => {
      const selection = parseParadigmKey(key);
      if (selection.type && selection.type !== 'grammar') return;
      const set = GRAMMAR_SETS[selection.baseKey];
      if (!set) return;

      const chapterNum = /^\d+$/.test(selection.baseKey) ? Number(selection.baseKey) : 0;
      const items = Number.isInteger(selection.itemIdx) ? [set.items[selection.itemIdx]] : set.items;

      items.forEach((item, relativeItemIdx) => {
        if (!item) return;
        const itemIdx = Number.isInteger(selection.itemIdx) ? selection.itemIdx : relativeItemIdx;
        const itemReversibleForms = item.questions
          .filter(isReversibleQuestion)
          .map((q) => q.form);
        const formToAnswer = {};
        item.questions.forEach((q) => {
          if (q && q.form && q.answer) formToAnswer[q.form] = q.answer;
        });
        item.questions.forEach((q, qIdx) => {
          const rawChoices = Array.isArray(q.choices) ? q.choices : [];
          const choices = localShuffle(Array.from(new Set([q.answer, ...rawChoices])));

          const reversible = isReversibleQuestion(q);
          let reverseChoices = null;
          if (reversible) {
            const distractors = pickReverseDistractors(q.form, itemReversibleForms, allReversibleForms);
            reverseChoices = localShuffle([q.form, ...distractors]);
          }

          cards.push({
            id: `grammar-${selection.baseKey}-${itemIdx}-${qIdx}-${stableGrammarKey(item.lemma)}-${stableGrammarKey(q.form)}-${stableGrammarKey(q.prompt || 'parse')}-${stableGrammarKey(q.answer)}`,
            kind: 'morph',
            required: true,
            sourceKey: String(selection.baseKey),
            sourceLabel: set.label,
            supplemental: !!set.supplemental,
            chapter: chapterNum,
            family: item.family,
            lemma: item.lemma,
            gloss: item.gloss,
            form: q.form,
            prompt: q.prompt || 'Choose the best answer.',
            context: q.context || '',
            note: q.note || '',
            rationale: q.rationale || '',
            explanations: q.explanations || null,
            answer: q.answer,
            choices,
            reversible,
            reversePrompt: reversible ? 'Choose the correct Greek form.' : '',
            reverseChoices,
            formToAnswer
          });
        });
      });
    });

    return cards;
  }

  function pickReverseDistractors(correctForm, preferredPool, fallbackPool) {
    const distractors = [];
    const seen = new Set([correctForm]);
    const pushFrom = (pool) => {
      for (const item of localShuffle(pool)) {
        if (!item || seen.has(item)) continue;
        seen.add(item);
        distractors.push(item);
        if (distractors.length >= 3) break;
      }
    };
    pushFrom(preferredPool);
    if (distractors.length < 3) pushFrom(fallbackPool);
    return distractors.slice(0, 3);
  }

  function getGrammarCountForKey(key) {
    const set = GRAMMAR_SETS[String(key)];
    if (!set) return 0;
    return set.items.reduce((sum, item) => sum + item.questions.length, 0);
  }

  // ───────────────────────────────────────────────────────────────────
  //  EXPORTS
  //
  //  We expose GRAMMAR_SETS / buildGrammarCardsForKeys / getGrammarCountForKey
  //  as the sole grammar interface. Earlier names (extra / focus / third-pass)
  //  used by the previous three-file layout are no longer needed; app.js was
  //  updated to call only the consolidated names.
  // ───────────────────────────────────────────────────────────────────
  window.GRAMMAR_SETS = GRAMMAR_SETS;
  window.registerSupplementalGrammarSets = registerSupplementalGrammarSets;
  window.buildGrammarCardsForKeys = buildGrammarCardsForKeys;
  window.getGrammarCountForKey = getGrammarCountForKey;

})();
