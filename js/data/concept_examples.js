// Concept examples — shared library for conceptual distractors
export const CONCEPT_EXAMPLES = {
  // ── Bare case names (as answers to preposition-case questions etc.)
  "nominative": {
    greek: "ὁ ἄνθρωπος βλέπει.",
    english: "The man sees.",
    why: "The nominative marks the subject. Prepositions don't take the nominative."
  },
  "genitive": {
    greek: "ἡ φωνὴ τοῦ ἀνθρώπου.",
    english: "The voice of the man.",
    why: "The genitive marks possession, source, or separation."
  },
  "dative": {
    greek: "λέγω τῷ ἀνθρώπῳ.",
    english: "I speak to the man.",
    why: "The dative marks the indirect object, location, means, or association."
  },
  "accusative": {
    greek: "βλέπω τὸν ἄνθρωπον.",
    english: "I see the man.",
    why: "The accusative most often marks the direct object and goal of motion."
  },
  "vocative": {
    greek: "κύριε, βοήθει μοι.",
    english: "Lord, help me!",
    why: "The vocative is the case of direct address."
  },

  // ── Case functions (Ch 3)
  "subject": {
    greek: "ὁ ἀπόστολος διδάσκει.",
    english: "The apostle teaches.",
    why: "The subject is marked by the nominative, not this case."
  },
  "subject (and predicate nominative)": {
    greek: "ὁ λόγος ἀληθής ἐστιν.",
    english: "The word is true.",
    why: "The nominative marks both the subject and a predicate noun after εἰμί."
  },
  "direct object": {
    greek: "βλέπω τὸν ἄνθρωπον.",
    english: "I see the man.",
    why: "The direct object is marked by the accusative, not this case."
  },
  "indirect object": {
    greek: "δίδωμι δῶρον τῷ φίλῳ.",
    english: "I give a gift to the friend.",
    why: "The indirect object is marked by the dative, not this case."
  },
  "possession": {
    greek: "ἡ φωνὴ τοῦ ἀνθρώπου.",
    english: "The voice of the man.",
    why: "Possession is marked by the genitive, not this case."
  },
  "direct address": {
    greek: "διδάσκαλε, διδάσκε ἡμᾶς.",
    english: "Teacher, teach us!",
    why: "Direct address is the vocative's job."
  },

  // ── Moods as answers (Ch 7, Ch 10, Ch 17)
  "indicative": {
    greek: "ὁ δοῦλος λύει τὸν δεσμόν.",
    english: "The servant unties the bond.",
    why: "The indicative is the mood of actual assertion — statements and questions of fact."
  },
  "subjunctive": {
    greek: "ἵνα ὁ δοῦλος λύῃ τὸν δεσμόν.",
    english: "so that the servant may untie the bond",
    why: "The subjunctive marks contingent / potential action, often after ἵνα or ἐάν."
  },
  "imperative": {
    greek: "λῦσον τὸν δεσμόν.",
    english: "Untie the bond!",
    why: "The imperative issues commands or prohibitions."
  },
  "infinitive": {
    greek: "θέλω λύειν τὸν δεσμόν.",
    english: "I want to untie the bond.",
    why: "The infinitive is a verbal noun — no person or number."
  },
  "optative": {
    greek: "μὴ γένοιτο.",
    english: "May it not be!",
    why: "The optative expresses a wish or a remote possibility. Rare in NT Greek."
  },

  // ── Adjective / participle position (Ch 5, 14)
  "attributive": {
    greek: "ὁ ἀγαθὸς λόγος",
    english: "the good word",
    why: "Attributive position: the adjective sits inside the article–noun bracket and modifies the noun directly."
  },
  "predicate": {
    greek: "ὁ λόγος ἀγαθός.",
    english: "The word is good.",
    why: "Predicate position: the adjective is outside the article–noun bracket and asserts something about the noun (εἰμί is often implied)."
  },
  "substantive": {
    greek: "οἱ ἀγαθοί",
    english: "the good (people) / the good ones",
    why: "Substantive: adjective (or participle) used alone as a noun."
  },

  // ── Third-declension stem classes (Ch 12–13, W5O)
  "κ-stem (a velar stem)": {
    greek: "σάρξ, σαρκός",
    english: "flesh",
    why: "Velar stem: the stem-final κ (or γ, χ) combines with σ in the nom. sg. to give ξ."
  },
  "κ-stem": {
    greek: "σάρξ, σαρκός",
    english: "flesh",
    why: "Velar stem: κ/γ/χ + σ → ξ in the nominative."
  },
  "κτ-stem": {
    greek: "νύξ, νυκτός",
    english: "night",
    why: "κτ-stem: the genitive shows νυκτ-; in the nominative singular τ drops before ς, then κ + ς → ξ."
  },
  "ν-stem": {
    greek: "ποιμήν, ποιμένος",
    english: "shepherd",
    why: "ν-stem: the stem ends in ν; the dative plural drops it."
  },
  "ντ-stem": {
    greek: "ἄρχων, ἄρχοντος",
    english: "ruler",
    why: "ντ-stem: the ντ drops before σ in the nom. sg. and dat. pl."
  },
  "ματ-stem (neuter)": {
    greek: "πνεῦμα, πνεύματος",
    english: "spirit, breath",
    why: "ματ-stem neuters: nom./acc. sg. drops the final τ; the genitive reveals the full stem."
  },
  "σ-stem (neuter)": {
    greek: "γένος, γένους",
    english: "race, kind",
    why: "σ-stem neuter: intervocalic σ drops and the result contracts (γενε-ος → γένους)."
  },
  "σ-stem": {
    greek: "γένος, γένους",
    english: "race, kind",
    why: "σ-stem: intervocalic σ drops between vowels and the result contracts."
  },
  "ι-stem": {
    greek: "πόλις, πόλεως",
    english: "city",
    why: "ι-stem: distinctive -εως genitive rather than -ος."
  },
  "ευ-stem (masc.)": {
    greek: "βασιλεύς, βασιλέως",
    english: "king",
    why: "ευ-stem masculine: long-vowel genitive -έως like ι-stems."
  },

  // ── Voice meanings (Ch 15)
  "the subject performs the action": {
    greek: "ὁ δοῦλος λύει τὸν δεσμόν.",
    english: "The servant unties the bond.",
    why: "That is the active voice. The subject acts on someone/something else."
  },
  "the subject receives the action": {
    greek: "ὁ δοῦλος λύεται (ὑπὸ τοῦ κυρίου).",
    english: "The servant is untied (by the master).",
    why: "That is the passive voice. The subject is acted upon."
  },
  "the subject acts on / for itself": {
    greek: "λούομαι.",
    english: "I wash myself.",
    why: "That is the middle voice — the subject is involved in the action as agent and beneficiary."
  },
  "the subject acts on itself": {
    greek: "λούομαι.",
    english: "I wash myself.",
    why: "That describes the middle voice, not this one."
  },
  "the subject is acted upon": {
    greek: "ὁ δοῦλος λύεται.",
    english: "The servant is being untied.",
    why: "That describes the passive voice."
  },
  "the subject performs the action on someone else": {
    greek: "ὁ δοῦλος λύει τὸν δεσμόν.",
    english: "The servant unties the bond.",
    why: "That describes the active voice."
  },

  // ── Near/far demonstratives (Ch 9, W3O)
  "near ('this')": {
    greek: "οὗτος ὁ ἀπόστολος",
    english: "this apostle",
    why: "οὗτος is the near demonstrative."
  },
  "far ('that')": {
    greek: "ἐκεῖνος ὁ ἀπόστολος",
    english: "that apostle",
    why: "ἐκεῖνος is the far demonstrative."
  },

  // ── Aspect descriptions (Ch 6, 16)
  "the aorist": {
    greek: "ἔλυσα τὸν δεσμόν.",
    english: "I untied the bond.",
    why: "Aorist aspect views the action from outside as a whole event."
  },
  "the present (and the imperfect in past time)": {
    greek: "λύω τὸν δεσμόν. / ἔλυον τὸν δεσμόν.",
    english: "I am untying the bond. / I was untying the bond.",
    why: "Imperfective aspect views the action from inside, in progress."
  },
  "the perfect": {
    greek: "λέλυκα τὸν δεσμόν.",
    english: "I have untied the bond (and it stays untied).",
    why: "Perfect aspect: completed action with persisting result."
  },

  // ── Square of stops outputs (Ch 15)
  "ξ": {
    greek: "ἄγω → ἄξω",
    english: "I lead → I will lead",
    why: "ξ is the result of velar (κ/γ/χ) + σ."
  },
  "ψ": {
    greek: "πέμπω → πέμψω",
    english: "I send → I will send",
    why: "ψ is the result of labial (π/β/φ) + σ."
  },

  // ── Conditional mood choices (Ch 10)
  "ἵνα + subj.": {
    greek: "ἵνα ὁ δοῦλος λύσῃ τὸν δεσμόν",
    english: "so that the servant may untie the bond",
    why: "ἵνα normally takes the subjunctive."
  },

  // ── -μι vs -ω verb class (Ch 19)
  "-μι verb (athematic)": {
    greek: "δίδωμι, δίδομεν",
    english: "I give, we give",
    why: "-μι verbs attach endings directly to the stem with no thematic vowel."
  },
  "-ω verb (thematic)": {
    greek: "λύω, λύομεν",
    english: "I untie, we untie",
    why: "-ω verbs insert a thematic vowel (ο/ε) between stem and ending."
  },
  "ε-contract verb": {
    greek: "φιλέω → φιλῶ",
    english: "I love",
    why: "ε-contract: stem-final ε contracts with the thematic vowel."
  },
  "α-contract verb": {
    greek: "ἀγαπάω → ἀγαπῶ",
    english: "I love",
    why: "α-contract: stem-final α contracts with the thematic vowel."
  },

  // ── Gender (Ch 3)
  "masculine": {
    greek: "ὁ λόγος",
    english: "the word (masculine)",
    why: "Masculine article ὁ. Most 2nd-decl. -ος nouns are masculine."
  },
  "feminine": {
    greek: "ἡ φωνή",
    english: "the voice (feminine)",
    why: "Feminine article ἡ. 1st-decl. nouns are nearly all feminine."
  },
  "neuter": {
    greek: "τὸ ἔργον",
    english: "the work (neuter)",
    why: "Neuter article τό. 2nd-decl. -ον nouns are neuter."
  },
  "common (M+F)": {
    greek: "ὁ / ἡ παῖς",
    english: "the boy / the girl",
    why: "A few nouns share one form for masculine and feminine, using the article to disambiguate."
  },
  "usually feminine": {
    greek: "ἡ ἀρχή, ἡ καρδία",
    english: "the beginning, the heart",
    why: "1st-declension nouns (with a few exceptions like ὁ νεανίας) are feminine."
  },
  "usually neuter": {
    greek: "τὸ ἔργον, τὸ τέκνον",
    english: "the work, the child",
    why: "Pattern for 2nd-declension -ον endings."
  },
  "no gender pattern": {
    greek: "ὁ ἄρχων vs ἡ ἐλπίς",
    english: "the ruler vs. the hope",
    why: "Applies to 3rd-declension endings, where gender must be learned with the noun — not here."
  },

  // ── Mood functions (Ch 7)
  "a statement or question of fact": {
    greek: "ὁ ἀπόστολος διδάσκει.",
    english: "The apostle teaches.",
    why: "That is the indicative mood's job."
  },
  "a command or prohibition": {
    greek: "λῦσον τὸν δεσμόν. / μὴ λύε.",
    english: "Untie the bond! / Don't be untying!",
    why: "That is the imperative mood (or μή + subjunctive for prohibitions)."
  },
  "a contingent / potential action (often after ἵνα, ἐάν)": {
    greek: "ἵνα λύῃ / ἐὰν λύῃ",
    english: "that he may untie / if he unties",
    why: "That is the subjunctive's role."
  },
  "a verbal noun": {
    greek: "θέλω λύειν.",
    english: "I want to untie.",
    why: "That is the infinitive — acts like a noun but carries tense and voice."
  },
  "a verbal adjective": {
    greek: "ὁ λύων τὸν δεσμόν",
    english: "the one untying the bond",
    why: "That is the participle — acts like an adjective but carries tense and voice."
  },
  "a command": {
    greek: "λῦσον τὸν δεσμόν.",
    english: "Untie the bond!",
    why: "That is the imperative mood."
  },
  "a fact": {
    greek: "ὁ δοῦλος λύει τὸν δεσμόν.",
    english: "The servant unties the bond.",
    why: "Indicative territory — statements and questions of fact."
  },
  "a wish": {
    greek: "μὴ γένοιτο.",
    english: "May it not be!",
    why: "That is the optative's job."
  },
  "a potential / contingent action": {
    greek: "ἐὰν λύῃ",
    english: "if he unties",
    why: "Subjunctive territory."
  },
  "a completed action with present results": {
    greek: "γέγραπται.",
    english: "It has been written / it stands written.",
    why: "That is what the perfect tense conveys."
  },
  "a simple fact": {
    greek: "ὁ λόγος ἀληθής ἐστιν.",
    english: "The word is true.",
    why: "Indicative territory."
  },
  "a finite verb": {
    greek: "λύει, ἔλυσεν, λέλυκεν",
    english: "he unties, he untied, he has untied",
    why: "A finite verb has person and number; infinitives and participles don't."
  },
  "a particle": {
    greek: "μέν, δέ, γάρ, οὖν",
    english: "(untranslated nuance words)",
    why: "Particles are short uninflected words that shade a clause — not what's being parsed here."
  },
  "an interjection": {
    greek: "ἰδού, οὐαί",
    english: "behold, woe",
    why: "Interjections stand apart from the syntax — not this category."
  },

  // ── Preposition meanings (Ch 4)
  "into": {
    greek: "εἰς τὴν οἰκίαν",
    english: "into the house",
    why: "εἰς + accusative expresses motion into."
  },
  "in / within": {
    greek: "ἐν τῇ οἰκίᾳ",
    english: "in the house",
    why: "ἐν + dative expresses location within."
  },
  "out of": {
    greek: "ἐκ τῆς οἰκίας",
    english: "out of the house",
    why: "ἐκ + genitive expresses motion out of."
  },
  "from": {
    greek: "ἀπὸ τοῦ ἀνθρώπου",
    english: "from the man",
    why: "ἀπό + genitive expresses separation."
  },
  "with": {
    greek: "μετὰ τῶν μαθητῶν / σὺν αὐτοῖς",
    english: "with the students / with them",
    why: "μετά + gen. or σύν + dat. expresses association."
  },
  "after": {
    greek: "μετὰ δύο ἡμέρας",
    english: "after two days",
    why: "μετά + accusative expresses time-after."
  },
  "before": {
    greek: "πρὸ τῆς ἡμέρας",
    english: "before the day",
    why: "πρό + genitive expresses time-before."
  },
  "above": {
    greek: "ὑπὲρ τὰς νεφέλας",
    english: "above the clouds",
    why: "ὑπέρ + accusative (rare in NT) can mean above or beyond."
  },
  "above (location)": {
    greek: "ὑπὲρ τὰς νεφέλας",
    english: "above the clouds",
    why: "ὑπέρ + accusative can mean above."
  },
  "under (location)": {
    greek: "ὑπὸ τὸν οὐρανόν",
    english: "under heaven",
    why: "ὑπό + accusative can describe motion/location under."
  },
  "on behalf of": {
    greek: "ὑπὲρ ἡμῶν",
    english: "on our behalf",
    why: "ὑπέρ + genitive expresses 'on behalf of', 'for the sake of'."
  },
  "on behalf of, for the sake of": {
    greek: "ὑπὲρ ἡμῶν",
    english: "on our behalf",
    why: "ὑπέρ + genitive."
  },
  "by (agent of a passive verb)": {
    greek: "ἐλύθη ὑπὸ τοῦ ἀνθρώπου.",
    english: "He was untied by the man.",
    why: "ὑπό + genitive marks the personal agent of a passive verb."
  },
  "by (agent)": {
    greek: "ὑπὸ τοῦ ἀνθρώπου",
    english: "by the man",
    why: "ὑπό + genitive marks the agent of a passive verb."
  },
  "through (means or agency)": {
    greek: "διὰ τοῦ ἀποστόλου",
    english: "through the apostle",
    why: "διά + genitive expresses means/agency."
  },
  "because of, on account of": {
    greek: "διὰ τὴν ἀγάπην",
    english: "because of love",
    why: "διά + accusative expresses cause or reason."
  },
  "down from / against": {
    greek: "κατὰ τοῦ ὄρους / κατ' ἐμοῦ",
    english: "down from the mountain / against me",
    why: "κατά + genitive can mean 'down from' or 'against'."
  },
  "according to / throughout": {
    greek: "κατὰ Μᾶρκον / καθ' ἡμέραν",
    english: "according to Mark / throughout the day",
    why: "κατά + accusative."
  },
  "with (in company with)": {
    greek: "μετὰ τῶν μαθητῶν",
    english: "with the students",
    why: "μετά + genitive (association)."
  },
  "after (in time)": {
    greek: "μετὰ δύο ἡμέρας",
    english: "after two days",
    why: "μετά + accusative (time)."
  },

  // ── Conjunction types (Ch 9)
  "'and' / 'also' (additive)": {
    greek: "ὁ Πέτρος καὶ ὁ Ἰωάννης",
    english: "Peter and John",
    why: "καί is the additive conjunction."
  },
  "'but' (adversative)": {
    greek: "ἐγὼ μὲν βλέπω, σὺ δὲ οὔ.",
    english: "I see, but you do not.",
    why: "δέ or ἀλλά signals contrast."
  },
  "'for' (causal)": {
    greek: "θαυμάζω· γέγραπται γάρ…",
    english: "I marvel, for it is written…",
    why: "γάρ is the explanatory / causal particle (postpositive)."
  },
  "'therefore' (inferential)": {
    greek: "εἶπεν οὖν ὁ Ἰησοῦς…",
    english: "Therefore Jesus said…",
    why: "οὖν is the inferential particle (postpositive)."
  },
  "'for' — strong causal": {
    greek: "γέγραπται γάρ…",
    english: "for it is written…",
    why: "γάρ is causal but relatively light — not always 'strong'."
  },
  "'therefore' — inferential": {
    greek: "εἶπεν οὖν…",
    english: "Therefore he said…",
    why: "οὖν draws an inference."
  },
  "'because' — subordinating": {
    greek: "χαίρω ὅτι ἦλθες.",
    english: "I rejoice because you came.",
    why: "Subordinating causal is ὅτι or διότι — not this one."
  },
  "'but' / 'and' — mild adversative or transitional, postpositive": {
    greek: "ὁ δὲ ἀπόστολος εἶπεν…",
    english: "But the apostle said…",
    why: "δέ is mild — contrast or transition, postpositive."
  },
  "'for' — explanatory / causal, postpositive": {
    greek: "γέγραπται γάρ…",
    english: "for it is written…",
    why: "γάρ gives the reason for what just came before."
  },
  "'therefore' / 'so' — inferential, postpositive": {
    greek: "εἶπεν οὖν…",
    english: "Therefore he said…",
    why: "οὖν draws an inference from what precedes."
  },

  // ── Personal pronouns (Ch 9 and W3O)
  "1st person singular nominative ('I')": {
    greek: "ἐγώ",
    english: "I",
    why: "1st-sg. nominative personal pronoun."
  },
  "1st person plural nominative ('we')": {
    greek: "ἡμεῖς",
    english: "we",
    why: "1st-pl. nominative."
  },
  "2nd person singular nominative ('you')": {
    greek: "σύ",
    english: "you (sg.)",
    why: "2nd-sg. nominative."
  },
  "2nd person plural nominative ('you all')": {
    greek: "ὑμεῖς",
    english: "you (pl.)",
    why: "2nd-pl. nominative."
  },
  "3rd person singular masculine ('he')": {
    greek: "αὐτός",
    english: "he / himself",
    why: "3rd-sg. masc. nominative of αὐτός."
  },
  "3rd person plural nominative ('they')": {
    greek: "αὐτοί",
    english: "they (masc.)",
    why: "3rd-pl. masc. nominative."
  },
  "3rd person plural masculine ('they')": {
    greek: "αὐτοί",
    english: "they (masc.)",
    why: "3rd-pl. masc. nominative."
  },

  // ── Contract-verb outputs (Ch 8)
  "η": {
    greek: "α + ε → α (long), not η here",
    english: "",
    why: "η is the typical ε-contract output only for ε + α/η combinations — not the pairs asked about."
  },
  "ω": {
    greek: "α + ο → ω, or ε + ω → ω",
    english: "",
    why: "ω is the contract output when long-o stays long (e.g. ἀγαπάομεν → ἀγαπῶμεν)."
  },
  "ου": {
    greek: "ε + ο → ου, or ο + ε/ο → ου",
    english: "",
    why: "ου is the standard mid-short contract for ε+ο and for ο-contracts in ο+ε/ο+ο."
  },
  "ει": {
    greek: "ε + ε → ει",
    english: "",
    why: "ει is the contract of ε+ε (and ε+ει)."
  },
  "οι": {
    greek: "",
    english: "",
    why: "οι is not the contraction result for the vowel pairs being tested here."
  },

  // ── Participle grammatical features (Ch 14)
  "tense, voice, and the ability to take an object": {
    greek: "λύοντα τὸν δεσμὸν (participle + accusative object)",
    english: "untying the bond",
    why: "Participles share these features with verbs."
  },
  "case, gender, and number — and it agrees with a noun": {
    greek: "ὁ λύων ἀπόστολος / τοὺς λύοντας ἀποστόλους",
    english: "the untying apostle / the untying apostles (acc.)",
    why: "Participles share these features with adjectives."
  },
  "person and mood": {
    greek: "λύει (3rd person, indicative)",
    english: "he unties",
    why: "Person and mood belong to finite verbs — participles have neither."
  },
  "person and number": {
    greek: "λύομεν (1st person plural)",
    english: "we untie",
    why: "Person belongs to finite verbs, not participles."
  },
  "only gender and number": {
    greek: "ὁ ἀγαθός / οἱ ἀγαθοί",
    english: "the good one / the good ones",
    why: "Participles agree in case too, not just gender and number."
  },
  "only case": {
    greek: "",
    english: "",
    why: "Participles agree with their noun in case, gender, and number — not case alone."
  },
  "mood only": {
    greek: "",
    english: "",
    why: "Mood is a verbal feature, but participles share more than mood with verbs."
  },

  // ── Relative-pronoun agreement (Ch 9, W4O)
  "gender and number (its case is set by its own clause)": {
    greek: "ὁ ἄνθρωπος ὃν εἶδον",
    english: "the man whom I saw",
    why: "Relative takes its case from its own clause (here: acc. direct object of εἶδον)."
  },

  // ── Aorist-passive marker distractors (Ch 15)
  "the augment ε- alone": {
    greek: "ἔλυσα (augment, but not passive)",
    english: "I untied",
    why: "The augment by itself only flags past time in the indicative, not the passive voice."
  },
  "the σ before the ending": {
    greek: "λύσω (future active)",
    english: "I will untie",
    why: "σ marks the future or 1st aorist active — not the aorist passive."
  },
  "the κ before the ending": {
    greek: "λέλυκα (perfect active)",
    english: "I have untied",
    why: "κ is the perfect-active marker."
  },

  // ── Clause-type distractors (Ch 10, 17, W7O, 20)
  "a purpose clause — 'in order that …'": {
    greek: "ἵνα λύσῃ",
    english: "in order that he might untie",
    why: "Purpose is ἵνα (or less often ὅπως) + subjunctive."
  },
  "a result clause — 'so that …'": {
    greek: "ὥστε λυθῆναι",
    english: "so as to be untied",
    why: "Result is ὥστε + indicative (actual result) or + infinitive (natural result)."
  },
  "a temporal clause — 'when …'": {
    greek: "ὅτε ἦλθεν",
    english: "when he came",
    why: "Definite temporal is ὅτε + indicative; indefinite is ὅταν + subjunctive."
  },
  "an indirect statement — 'that …'": {
    greek: "εἶπεν ὅτι ὁ κύριος ἐλήλυθεν.",
    english: "He said that the Lord has come.",
    why: "ὅτι + indicative is the standard NT indirect statement."
  },
  "indirect statement": {
    greek: "εἶπεν ὅτι ὁ κύριος ἐλήλυθεν.",
    english: "He said that the Lord has come.",
    why: "ὅτι + indicative — reporting what was said."
  },
  "result clause": {
    greek: "ὥστε λυθῆναι",
    english: "so as to be untied",
    why: "ὥστε + infinitive (or indicative)."
  },
  "conditional protasis": {
    greek: "εἰ λύει / ἐὰν λύσῃ",
    english: "if he unties / if he should untie",
    why: "The protasis is the 'if' clause — εἰ + indicative (first-class) or ἐάν + subjunctive (third-class)."
  },
  "a definite relative — 'who unties'": {
    greek: "ὁ ἄνθρωπος ὃς λύει",
    english: "the man who unties",
    why: "Plain relative pronoun + indicative — a specific known person/thing."
  },
  "a temporal clause — 'whenever he untied'": {
    greek: "ὁσάκις ἔλυεν",
    english: "as often as he was untying",
    why: "That's a past iterative; the subjunctive here would give general 'whenever' sense in present/future time."
  },
  "a definite past — 'when (it happened)'": {
    greek: "ὅτε ἦλθεν",
    english: "when he came",
    why: "ὅτε + indicative points to a specific past moment, not a general one."
  },
  "a purpose — 'in order that'": {
    greek: "ἵνα λύσῃ",
    english: "in order that he may untie",
    why: "Purpose uses ἵνα + subjunctive — no ἄν."
  },
  "a result — 'so that'": {
    greek: "ὥστε λυθῆναι",
    english: "so as to be untied",
    why: "Result uses ὥστε, not ὅταν."
  },
  "'although'": {
    greek: "καίπερ ὢν υἱός",
    english: "although being a son",
    why: "Concessive 'although' is καίπερ + participle, or εἰ καί + indicative."
  },
  "'when'": {
    greek: "ὅτε ἦλθεν",
    english: "when he came",
    why: "Definite 'when' is ὅτε + indicative — a different word from ὅτι."
  },
  "'unless'": {
    greek: "ἐὰν μή",
    english: "unless",
    why: "'Unless' is ἐὰν μή — subjunctive-based."
  },

  // ── Adjective-position translations (Ch 5)
  "attributive — 'the good word'": {
    greek: "ὁ ἀγαθὸς λόγος",
    english: "the good word",
    why: "Attributive position: article + adjective + noun, or noun + repeated article + adjective."
  },
  "attributive (article–adj–noun)": {
    greek: "ὁ ἀγαθὸς λόγος",
    english: "the good word",
    why: "First attributive pattern."
  },
  "attributive (article–noun–article–adj)": {
    greek: "ὁ λόγος ὁ ἀγαθός",
    english: "the good word",
    why: "Second attributive pattern — repeated article."
  },
  "attributive (adj–noun)": {
    greek: "ἀγαθὸς λόγος",
    english: "a good word (no article)",
    why: "Anarthrous — works for indefinite nouns, but with the article this would flip to predicate."
  },
  "attributive (noun–adj)": {
    greek: "λόγος ἀγαθός",
    english: "a good word",
    why: "Anarthrous noun + adjective — indefinite. With articles, this pattern reads as predicate."
  },
  "substantive — 'the good thing'": {
    greek: "τὸ ἀγαθόν",
    english: "the good thing",
    why: "Substantive use: adjective with article, no noun expressed — neuter sg."
  },
  "substantive — 'the one untying'": {
    greek: "ὁ λύων",
    english: "the one untying",
    why: "Participle with article, no noun expressed — acts as a noun."
  },
  "predicate — 'the word is good'": {
    greek: "ὁ λόγος ἀγαθός.",
    english: "The word is good.",
    why: "Predicate position: adjective outside the article-noun bracket; εἰμί implied."
  },
  "predicate — 'the man is untying'": {
    greek: "ὁ ἄνθρωπος λύων (ἐστίν).",
    english: "The man is untying.",
    why: "Predicate-participle construction — rarer, usually periphrastic instead."
  },
  "vocative — 'O good word!'": {
    greek: "ὦ ἀγαθέ λόγε!",
    english: "O good word!",
    why: "Vocative address — flagged by ὦ or context, not by position."
  },
  "adverbial (circumstantial) — 'while untying, the man …'": {
    greek: "λύων τὸν δεσμόν, ἀπῆλθεν.",
    english: "While untying the bond, he went away.",
    why: "Anarthrous participle agreeing with the subject — describes the circumstance of the main verb."
  },
  "adverbial — 'while untying'": {
    greek: "λύων τὸν δεσμόν…",
    english: "while untying the bond…",
    why: "Anarthrous participle acting as an adverbial modifier."
  },
  "attributive — 'the untying [thing]'": {
    greek: "τὸ λῦον",
    english: "the untying thing",
    why: "Neuter substantive participle — rare for this lemma."
  },
  "attributive — modifying the subject": {
    greek: "ὁ λύων ἄνθρωπος",
    english: "the untying man",
    why: "Attributive participle: article + participle + noun."
  },
  "imperative — 'untie!'": {
    greek: "λῦσον τὸν δεσμόν!",
    english: "Untie the bond!",
    why: "That would be an imperative form — but this is a participle."
  },

  // ── αὐτός uses (W1O)
  "intensive — 'the apostle himself'": {
    greek: "ὁ ἀπόστολος αὐτός",
    english: "the apostle himself",
    why: "αὐτός in predicate position = intensive 'self'."
  },
  "identifier — 'the same apostle'": {
    greek: "ὁ αὐτὸς ἀπόστολος",
    english: "the same apostle",
    why: "αὐτός in attributive position = identifier 'same'."
  },
  "personal — 'he, the apostle'": {
    greek: "αὐτὸς εἶπεν.",
    english: "He said.",
    why: "αὐτός in oblique cases (or standalone in later Greek) functions as a 3rd-person pronoun."
  },
  "demonstrative — 'this apostle'": {
    greek: "οὗτος ὁ ἀπόστολος",
    english: "this apostle",
    why: "Demonstrative is οὗτος / ἐκεῖνος — not αὐτός."
  },
  "predicate — 'the apostle is the same'": {
    greek: "(not the natural reading of ὁ αὐτὸς ἀπόστολος)",
    english: "",
    why: "αὐτός in attributive position = 'same', not a predicate statement."
  },

  // ── Aspect phrasings (Ch 6, 16, 18)
  "a single past event with no present relevance": {
    greek: "ἔλυσα τὸν δεσμόν.",
    english: "I untied the bond.",
    why: "That describes the aorist, not the perfect."
  },
  "an ongoing process": {
    greek: "λύω τὸν δεσμόν. / ἔλυον τὸν δεσμόν.",
    english: "I am untying / I was untying.",
    why: "That describes imperfective aspect (present, imperfect)."
  },
  "a future action": {
    greek: "λύσω τὸν δεσμόν.",
    english: "I will untie the bond.",
    why: "That describes the future tense."
  },
  "the future": {
    greek: "λύσω",
    english: "I will untie",
    why: "The future is tense-focused (time) with mixed aspect — not primarily imperfective."
  },
  "the present": {
    greek: "λύω",
    english: "I untie / I am untying",
    why: "The present is strongly imperfective — listed as part of the correct answer pair here."
  },
  "the imperfect": {
    greek: "ἔλυον",
    english: "I was untying",
    why: "The imperfect is imperfective past — also part of the imperfective family."
  },

  // ── Aspect of imperative (Ch 18)
  "present (imperfective aspect)": {
    greek: "πίστευε.",
    english: "Keep on believing.",
    why: "Present imperative = ongoing / habitual."
  },
  "aorist (perfective aspect)": {
    greek: "πίστευσον.",
    english: "Believe! (one decisive act)",
    why: "Aorist imperative = whole event."
  },
  "perfect (stative)": {
    greek: "πεπίστευκε.",
    english: "He has believed (and remains so).",
    why: "Perfect emphasizes state resulting from prior action — rarely imperatival."
  },
  "future indicative": {
    greek: "πιστεύσει.",
    english: "He will believe.",
    why: "Future indicative, not imperative."
  },

  // ── Periphrastic-construction distractors (Ch 18)
  "imperfect indicative of διδάσκω": {
    greek: "ἐδίδασκε",
    english: "he was teaching",
    why: "That would be a single imperfect form — but ἦν διδάσκων is two words, periphrastic."
  },
  "aorist participle in apposition": {
    greek: "διδάξας, ἀπῆλθεν.",
    english: "After teaching, he went away.",
    why: "That would be an aorist participle, not the imperfect of εἰμί + present participle."
  },
  "perfect periphrastic": {
    greek: "ἐστὶν γεγραμμένον",
    english: "it has been written",
    why: "Perfect periphrastic uses εἰμί + perfect participle, not present."
  },
  "present indicative of γράφω": {
    greek: "γράφει",
    english: "he writes",
    why: "That would be one word; but ἐστὶν γεγραμμένον is two, periphrastic."
  },
  "perfect indicative of εἰμί": {
    greek: "(εἰμί has no perfect)",
    english: "",
    why: "εἰμί lacks a perfect form. Here εἰμί is the auxiliary, not the main verb."
  },
  "aorist passive": {
    greek: "ἐγράφη",
    english: "it was written",
    why: "That's a single word; but ἐστὶν γεγραμμένον is the stative-passive periphrasis."
  },

  // ── ι-stem genitive distractors (Ch 13)
  "It's an alternate spelling — both forms are equally common": {
    greek: "",
    english: "",
    why: "This class of ι-stems (such as πόλις) forms the genitive singular in -εως."
  },
  "It's a typographical variation of -ος": {
    greek: "",
    english: "",
    why: "-εως is a genuine distinct ending, not a typographical variant."
  },
  "It's actually a 1st-declension form": {
    greek: "",
    english: "",
    why: "πόλις is unambiguously 3rd-declension — 1st-declension feminines never show -εως."
  },
  "only as nominative plural": {
    greek: "αἱ πόλεις (nom.) / τὰς πόλεις (acc.)",
    english: "",
    why: "ι-stems collapse nom. pl. and acc. pl. into one form — πόλεις is both."
  },
  "only as accusative plural": {
    greek: "",
    english: "",
    why: "Same form serves as nom. pl. too — not accusative only."
  },
  "only as a vocative": {
    greek: "",
    english: "",
    why: "πόλεις is not vocative — vocative sg. would be πόλι."
  },
  "It's irregular and unrelated to γένος": {
    greek: "",
    english: "",
    why: "γένει is the regular dative sg. of γένος — σ-stem rules explain it fully."
  },
  "It's actually a 2nd-declension form": {
    greek: "",
    english: "",
    why: "γένος is 3rd-declension σ-stem; 2nd-declension datives end in -ῳ, not -ει."
  },
  "It's a vocative": {
    greek: "",
    english: "",
    why: "The vocative of γένος is γένος (nom./voc. identical for neuters)."
  },

  // ── Reduplication distractors (Ch 16)
  "augment ε- + σ + α": {
    greek: "ἔλυσα",
    english: "I untied",
    why: "That's the 1st-aorist active pattern."
  },
  "augment ε- + θη": {
    greek: "ἐλύθη",
    english: "he was untied",
    why: "That's the aorist passive."
  },
  "ω-ending + ι-augment": {
    greek: "",
    english: "",
    why: "That is not how the perfect is formed. Perfects use reduplication, not augment. Indicative past forms use either syllabic augment (often ἐ-) or temporal augment."
  },
  "augment — this is an aorist or imperfect": {
    greek: "ἔλυον / ἔλυσα",
    english: "I was untying / I untied",
    why: "Reduplication (C + ε) is different from augment (ε-). Both produce an initial ε, but reduplication doubles a consonant."
  },
  "particle — 'indeed'": {
    greek: "",
    english: "",
    why: "γε is a particle, but γε- as a prefix on a verb stem is reduplication."
  },
  "an unrelated prefix": {
    greek: "",
    english: "",
    why: "The γε- on a verb stem is specifically perfect-tense reduplication."
  },
  "by doubling the first consonant": {
    greek: "λέλυκα, γέγραφα",
    english: "",
    why: "Reduplication does double the initial consonant — but with the connecting vowel ε, not bare doubling."
  },
  "by prefixing γε-": {
    greek: "",
    english: "",
    why: "γε- isn't a universal prefix — reduplication copies whatever the stem-initial consonant is."
  },
  "they can't form a perfect": {
    greek: "ἀκούω → ἀκήκοα",
    english: "I have heard",
    why: "Verbs starting with vowels lengthen the vowel (vocalic reduplication) instead."
  },

  // ── Square-of-stops extras (Ch 15)
  "ττ": {
    greek: "",
    english: "",
    why: "ττ isn't a contraction of stop + σ — it's an Attic variant of σσ."
  },
  "ζ": {
    greek: "",
    english: "",
    why: "ζ doesn't come from stop + σ combinations — it's an original letter."
  },

  // ── Voice meanings — additional variants (Ch 15, W3O)
  "middle ('I untie for myself') or passive ('I am being untied')": {
    greek: "λύομαι.",
    english: "I untie for myself / I am being untied.",
    why: "In present and imperfect the middle and passive share one form — only context or aorist-passive forms disambiguate."
  },
  "active only ('I untie')": {
    greek: "λύω.",
    english: "I untie.",
    why: "That would be the active — but λύομαι has M/P endings."
  },
  "passive only ('I am being untied')": {
    greek: "",
    english: "",
    why: "In the present and imperfect, middle and passive share the same form; context determines which sense fits."
  },
  "deponent only — no active sense": {
    greek: "ἔρχομαι",
    english: "I come (middle form, active sense)",
    why: "Deponent means middle-only with active meaning — but λύω has a perfectly good active λύω."
  },
  "no agent is implied": {
    greek: "",
    english: "",
    why: "That describes the middle or impersonal, not this voice."
  },
  "the subject is acted upon by an external agent": {
    greek: "ὁ δοῦλος λύεται ὑπὸ τοῦ κυρίου.",
    english: "The servant is untied by the master.",
    why: "That describes the passive."
  },
  "the action is impersonal": {
    greek: "δεῖ, ἔξεστιν",
    english: "it is necessary, it is permitted",
    why: "Impersonal verbs exist in Greek but aren't a voice — they're a handful of specific lemmas."
  },

  // ── ὁ αὐτός vs predicate (W3O)
  "οὗτος is here a relative pronoun": {
    greek: "ὅς, ἥ, ὅ",
    english: "who, which",
    why: "Relative pronouns have a different paradigm (ὅς, ἥ, ὅ) — οὗτος is demonstrative."
  },
  "It's a typo; οὗτος should follow ἀπόστολος": {
    greek: "",
    english: "",
    why: "Demonstrative in predicate position is the rule, not a typo — οὗτος can sit on either side of its noun."
  },
  "Predicate position changes the meaning to 'the apostle is this one'": {
    greek: "",
    english: "",
    why: "With a demonstrative, predicate position is the default attributive reading — meaning doesn't flip."
  },

  // ── ἡμῶν vs ὑμῶν (W3O)
  "ὑμῶν": {
    greek: "ὑμῶν",
    english: "of you (all)",
    why: "ὑμῶν is 2nd person plural genitive — 'of you all'. ἡμῶν is 1st person plural."
  },
  "both — they are interchangeable": {
    greek: "",
    english: "",
    why: "They differ only by one character (rough vs smooth breathing) but mean different persons."
  },
  "neither — both are 3rd person": {
    greek: "",
    english: "",
    why: "Both are 1st/2nd person, not 3rd. 3rd person 'of them' would be αὐτῶν."
  },

  // ── W7O indefinite translations
  "'who unties'": {
    greek: "ὁ λύων / ὃς λύει",
    english: "the one who unties / who unties",
    why: "That would be a definite relative (plain indicative), not an indefinite one (+ ἄν)."
  },
  "'while untying'": {
    greek: "λύων",
    english: "while untying",
    why: "That would be an adverbial participle."
  },
  "'in order that he untie'": {
    greek: "ἵνα λύσῃ",
    english: "in order that he untie",
    why: "That would be a purpose clause with ἵνα."
  },
  "'when he untied'": {
    greek: "ὅτε ἔλυσεν",
    english: "when he untied",
    why: "That's a definite past temporal — ὅτε + aorist indicative."
  },
  "'because he unties'": {
    greek: "ὅτι λύει",
    english: "because he unties",
    why: "That would be a causal clause with ὅτι or διότι."
  }
};
