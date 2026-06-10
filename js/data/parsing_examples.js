// Parsing examples — shared library keyed by parsing label
export const PARSING_EXAMPLES = {
  // ── λύω indicative ────────────────────────────────────
  "present active indicative, first singular": {
    greek: "ἐγὼ τὸν δεσμὸν λύω.",
    english: "I untie the bond.",
    why: "Primary ending -ω on the present stem. No augment, no σ."
  },
  "present active indicative, second singular": {
    greek: "σὺ τὸν δεσμὸν λύεις.",
    english: "You untie the bond.",
    why: "Primary ending -εις. Short thematic vowel."
  },
  "present active indicative, third singular": {
    greek: "ὁ δοῦλος τὸν δεσμὸν λύει.",
    english: "The servant unties the bond.",
    why: "Primary ending -ει. No augment."
  },
  "present active indicative, first plural": {
    greek: "ἡμεῖς τὸν δεσμὸν λύομεν.",
    english: "We untie the bond.",
    why: "Primary ending -ομεν. Short thematic vowel ο."
  },
  "present active indicative, second plural": {
    greek: "ὑμεῖς τὸν δεσμὸν λύετε.",
    english: "You (all) untie the bond.",
    why: "Primary ending -ετε. Identical in form to the 2nd-plural imperative."
  },
  "present active indicative, third plural": {
    greek: "οἱ δοῦλοι τὸν δεσμὸν λύουσι(ν).",
    english: "The servants untie the bond.",
    why: "Primary ending -ουσι(ν) with movable nu."
  },
  "future active indicative, first singular": {
    greek: "ἐγὼ τὸν δεσμὸν λύσω.",
    english: "I will untie the bond.",
    why: "Tense marker σ between stem and ending; no augment."
  },
  "future active indicative, second singular": {
    greek: "σὺ τὸν δεσμὸν λύσεις.",
    english: "You will untie the bond.",
    why: "σ tense marker + primary ending."
  },
  "future active indicative, third singular": {
    greek: "ὁ δοῦλος τὸν δεσμὸν λύσει.",
    english: "The servant will untie the bond.",
    why: "σ tense marker + primary ending -ει."
  },
  "future active indicative, first plural": {
    greek: "ἡμεῖς τὸν δεσμὸν λύσομεν.",
    english: "We will untie the bond.",
    why: "σ tense marker + primary ending -ομεν."
  },
  "future active indicative, second plural": {
    greek: "ὑμεῖς τὸν δεσμὸν λύσετε.",
    english: "You (all) will untie the bond.",
    why: "σ tense marker + primary ending -ετε."
  },
  "future active indicative, third plural": {
    greek: "οἱ δοῦλοι τὸν δεσμὸν λύσουσι(ν).",
    english: "The servants will untie the bond.",
    why: "σ tense marker + primary ending -ουσι(ν)."
  },
  "imperfect active indicative, first singular": {
    greek: "ἐγὼ τὸν δεσμὸν ἔλυον.",
    english: "I was untying the bond.",
    why: "Augment ἐ- + present stem + secondary ending -ον. Imperfective past."
  },
  "imperfect active indicative, second singular": {
    greek: "σὺ τὸν δεσμὸν ἔλυες.",
    english: "You were untying the bond.",
    why: "Augment ἐ- + present stem + secondary ending -ες."
  },
  "imperfect active indicative, third singular": {
    greek: "ὁ δοῦλος τὸν δεσμὸν ἔλυε(ν).",
    english: "The servant was untying the bond.",
    why: "Augment ἐ- + present stem + secondary ending -ε(ν)."
  },
  "imperfect active indicative, first plural": {
    greek: "ἡμεῖς τὸν δεσμὸν ἐλύομεν.",
    english: "We were untying the bond.",
    why: "Augment ἐ- + present stem + secondary ending -ομεν."
  },
  "imperfect active indicative, second plural": {
    greek: "ὑμεῖς τὸν δεσμὸν ἐλύετε.",
    english: "You (all) were untying the bond.",
    why: "Augment ἐ- + present stem + secondary ending -ετε."
  },
  "imperfect active indicative, third plural": {
    greek: "οἱ δοῦλοι τὸν δεσμὸν ἔλυον.",
    english: "The servants were untying the bond.",
    why: "Augment ἐ- + present stem + secondary ending -ον. Identical to 1st sg."
  },
  "imperfect active indicative, first singular or third plural": {
    greek: "ἔλυον — ἐγὼ ἔλυον / αὐτοὶ ἔλυον.",
    english: "I was untying / they were untying.",
    why: "Imperfect -ον is ambiguous between 1st sg. and 3rd pl. in the active."
  },
  "aorist active indicative, first singular": {
    greek: "ἐγὼ τὸν δεσμὸν ἔλυσα.",
    english: "I untied the bond.",
    why: "Augment ἐ- + stem + σα + secondary ending. Perfective past — one complete action."
  },
  "aorist active indicative, second singular": {
    greek: "σὺ τὸν δεσμὸν ἔλυσας.",
    english: "You untied the bond.",
    why: "Augment + σα + secondary ending -ς."
  },
  "aorist active indicative, third singular": {
    greek: "ὁ δοῦλος τὸν δεσμὸν ἔλυσε(ν).",
    english: "The servant untied the bond.",
    why: "Augment + σ + ε(ν). First-aorist third singular takes ε, not α."
  },
  "aorist active indicative, first plural": {
    greek: "ἡμεῖς τὸν δεσμὸν ἐλύσαμεν.",
    english: "We untied the bond.",
    why: "Augment + σα + secondary ending -μεν."
  },
  "aorist active indicative, second plural": {
    greek: "ὑμεῖς τὸν δεσμὸν ἐλύσατε.",
    english: "You (all) untied the bond.",
    why: "Augment + σα + secondary ending -τε."
  },
  "aorist active indicative, third plural": {
    greek: "οἱ δοῦλοι τὸν δεσμὸν ἔλυσαν.",
    english: "The servants untied the bond.",
    why: "Augment + σα + secondary ending -ν."
  },
  "perfect active indicative, first singular": {
    greek: "ἐγὼ τὸν δεσμὸν λέλυκα.",
    english: "I have untied the bond (and it remains untied).",
    why: "Reduplication (λε-) + κ + α-class endings. Completed action with lasting result."
  },
  "perfect active indicative, third singular": {
    greek: "ὁ δοῦλος τὸν δεσμὸν λέλυκε(ν).",
    english: "The servant has untied the bond.",
    why: "Reduplication + κ + ε(ν)."
  },
  "perfect active indicative, first plural": {
    greek: "ἡμεῖς τὸν δεσμὸν λελύκαμεν.",
    english: "We have untied the bond.",
    why: "Reduplication + κ + α-class ending -μεν."
  },
  "perfect active indicative, third plural": {
    greek: "οἱ δοῦλοι τὸν δεσμὸν λελύκασι(ν).",
    english: "The servants have untied the bond.",
    why: "Reduplication + κ + α-class ending -σι(ν)."
  },
  "pluperfect active indicative, first singular": {
    greek: "ἐγὼ τὸν δεσμὸν ἐλελύκειν.",
    english: "I had untied the bond.",
    why: "Augment + reduplication + κ + ει + secondary ending. Three time-markers = pluperfect."
  },

  // ── middle / passive indicative ───────────────────────
  "present middle/passive indicative, first singular": {
    greek: "ἐγὼ λύομαι.",
    english: "I untie for myself / I am being untied.",
    why: "Primary M/P ending -ομαι. Present and imperfect share one form for middle and passive."
  },
  "present middle/passive indicative, second singular": {
    greek: "σὺ λύῃ.",
    english: "You untie for yourself / you are being untied.",
    why: "Primary M/P ending -ῃ (from -εσαι with σ-drop)."
  },
  "present middle/passive indicative, third singular": {
    greek: "ὁ δοῦλος λύεται.",
    english: "The servant unties for himself / is being untied.",
    why: "Primary M/P ending -εται."
  },
  "present middle/passive indicative, first plural": {
    greek: "ἡμεῖς λυόμεθα.",
    english: "We untie for ourselves / we are being untied.",
    why: "Primary M/P ending -όμεθα."
  },
  "present middle/passive indicative, second plural": {
    greek: "ὑμεῖς λύεσθε.",
    english: "You (all) untie for yourselves / are being untied.",
    why: "Primary M/P ending -εσθε."
  },
  "present middle/passive indicative, third plural": {
    greek: "οἱ δοῦλοι λύονται.",
    english: "The servants untie for themselves / are being untied.",
    why: "Primary M/P ending -ονται."
  },
  "imperfect middle/passive indicative, first plural": {
    greek: "ἡμεῖς ἐλυόμεθα.",
    english: "We were untying for ourselves / were being untied.",
    why: "Augment ἐ- + stem + secondary M/P ending -όμεθα."
  },
  "aorist passive indicative, first singular": {
    greek: "ἐγὼ ἐλύθην ὑπὸ τοῦ ἀνθρώπου.",
    english: "I was untied by the man.",
    why: "Augment + stem + θη + secondary active-style endings. The θη marker is the passive sign."
  },
  "aorist passive indicative, third singular": {
    greek: "ὁ δοῦλος ἐλύθη.",
    english: "The servant was untied.",
    why: "Augment + stem + θη. The 3rd sg. has no overt ending."
  },
  "future passive indicative, first singular": {
    greek: "ἐγὼ λυθήσομαι.",
    english: "I will be untied.",
    why: "Built on the aorist passive stem (-θη-) + σ + M/P ending."
  },
  "future passive indicative, third singular": {
    greek: "ὁ δοῦλος λυθήσεται.",
    english: "The servant will be untied.",
    why: "Aorist passive stem + σ + M/P ending -εται."
  },
  "future middle indicative, first singular": {
    greek: "ἐγὼ λύσομαι.",
    english: "I will untie for myself.",
    why: "σ tense marker + primary M/P ending -ομαι. Distinct from future passive (no θη)."
  },
  "future middle indicative, third singular": {
    greek: "ὁ δοῦλος λύσεται.",
    english: "The servant will untie for himself.",
    why: "σ tense marker + primary M/P ending -εται."
  },
  "perfect middle/passive indicative, third singular": {
    greek: "γέγραπται.",
    english: "It has been written / it stands written.",
    why: "Reduplication + stem + primary M/P ending (no κ, no thematic vowel)."
  },

  // ── subjunctive ───────────────────────────────────────
  "present active subjunctive, first singular": {
    greek: "ἵνα λύω.",
    english: "that I may untie",
    why: "Long thematic vowel ω replaces short ο/ε. Same spelling as present indicative 1st sg. in the active."
  },
  "present active subjunctive, second singular": {
    greek: "ἵνα λύῃς.",
    english: "that you may untie",
    why: "Long thematic vowel: ῃ in place of ει."
  },
  "present active subjunctive, third singular": {
    greek: "ἵνα λύῃ.",
    english: "that he may untie",
    why: "Long thematic vowel ῃ. Can also be 2nd sg. M/P subjunctive without context."
  },
  "present active subjunctive, first plural": {
    greek: "ἵνα λύωμεν.",
    english: "that we may untie",
    why: "Long thematic vowel ω in place of ο (compare indicative λύομεν)."
  },
  "present active subjunctive, second plural": {
    greek: "ἵνα λύητε.",
    english: "that you (all) may untie",
    why: "Long thematic vowel η in place of ε (compare indicative λύετε)."
  },
  "present active subjunctive, third plural": {
    greek: "ἵνα λύωσι(ν).",
    english: "that they may untie",
    why: "Long thematic vowel ω (compare indicative λύουσι(ν))."
  },
  "aorist active subjunctive, first singular": {
    greek: "ἵνα λύσω.",
    english: "that I may untie",
    why: "Aorist stem (σ) + long-vowel subjunctive ending. No augment — augment is indicative only."
  },
  "aorist active subjunctive, third singular": {
    greek: "ἵνα λύσῃ.",
    english: "that he may untie",
    why: "σ + long-vowel ending ῃ. No augment."
  },
  "aorist active subjunctive, first plural": {
    greek: "λύσωμεν.",
    english: "Let us untie! (hortatory)",
    why: "σ + long thematic ω. No augment. 1st pl. in a main clause is hortatory."
  },

  // ── imperative ────────────────────────────────────────
  "present active imperative, second singular": {
    greek: "λῦε τὸν δεσμόν.",
    english: "Keep untying the bond.",
    why: "Bare stem + short vowel ε. Present imperative → ongoing or habitual action."
  },
  "present active imperative, third singular": {
    greek: "λυέτω ὁ δοῦλος τὸν δεσμόν.",
    english: "Let the servant keep untying the bond.",
    why: "Ending -έτω. Present aspect = ongoing."
  },
  "present active imperative, second plural": {
    greek: "λύετε τὸν δεσμόν.",
    english: "Keep untying the bond.",
    why: "Ending -ετε. Identical in form to the 2nd-plural indicative."
  },
  "present active imperative, third plural": {
    greek: "λυέτωσαν τὸν δεσμόν.",
    english: "Let them keep untying the bond.",
    why: "Ending -έτωσαν."
  },
  "aorist active imperative, second singular": {
    greek: "λῦσον τὸν δεσμόν.",
    english: "Untie the bond! (one decisive act)",
    why: "Aorist stem + -σον. No augment. Aorist aspect = whole event."
  },
  "aorist active imperative, third singular": {
    greek: "λυσάτω ὁ δοῦλος τὸν δεσμόν.",
    english: "Let the servant untie the bond (once).",
    why: "Ending -σάτω. Aorist aspect."
  },
  "aorist passive imperative, second singular": {
    greek: "λύθητι.",
    english: "Be untied!",
    why: "Aorist passive stem (θη) + imperative ending -τι."
  },

  // ── infinitive ────────────────────────────────────────
  "present infinitive": {
    greek: "καλόν ἐστιν εἶναι πιστόν.",
    english: "It is good to be faithful.",
    why: "Verbal noun — no person/number, only tense and voice."
  },
  "present active infinitive": {
    greek: "θέλω λύειν τὸν δεσμόν.",
    english: "I want to untie the bond.",
    why: "Ending -ειν. Verbal noun functioning as object of θέλω."
  },
  "aorist passive infinitive": {
    greek: "οὐ δύναται λυθῆναι.",
    english: "He is unable to be untied.",
    why: "Aorist passive stem + -ναι."
  },

  // ── participles ───────────────────────────────────────
  "nominative singular masculine, present active participle": {
    greek: "ὁ ἀνὴρ λύων τὸν δεσμὸν χαίρει.",
    english: "The man, while untying the bond, rejoices.",
    why: "Ending -ων (3rd decl.). Agrees with a masculine subject."
  },
  "nominative singular feminine, present active participle": {
    greek: "ἡ γυνὴ λύουσα χαίρει.",
    english: "The woman, while untying, rejoices.",
    why: "Ending -ουσα (1st decl.)."
  },
  "nominative/accusative singular neuter, present active participle": {
    greek: "τὸ τέκνον λῦον παίζει.",
    english: "The child, while loosening, plays.",
    why: "Ending -ον (3rd decl.). Nom. and acc. neuter always share one form."
  },
  "genitive singular masculine/neuter, present active participle": {
    greek: "ἀκούω τὴν φωνὴν τοῦ λύοντος.",
    english: "I hear the voice of the one untying.",
    why: "Ending -οντος. Masc. and neut. share this form in the genitive."
  },
  "dative singular masculine/neuter, present active participle": {
    greek: "λέγω τῷ λύοντι.",
    english: "I speak to the one untying.",
    why: "Ending -οντι."
  },
  "accusative singular masculine, present active participle": {
    greek: "βλέπω τὸν λύοντα.",
    english: "I see the one untying.",
    why: "Ending -οντα (3rd decl., masc. acc. sg.)."
  },
  "nominative plural masculine, present active participle": {
    greek: "οἱ λύοντες χαίρουσιν.",
    english: "The ones untying rejoice.",
    why: "Ending -οντες."
  },
  "accusative plural masculine, present active participle": {
    greek: "βλέπω τοὺς λύοντας.",
    english: "I see the ones untying.",
    why: "Ending -οντας."
  },
  "nominative singular masculine, aorist passive participle": {
    greek: "λυθεὶς ὁ δοῦλος ἀπῆλθεν.",
    english: "After being untied, the servant went away.",
    why: "Ending -θείς — aorist passive stem + participial endings."
  },
  "nominative singular feminine, aorist passive participle": {
    greek: "λυθεῖσα ἡ γυνὴ ἀπῆλθεν.",
    english: "After being untied, the woman went away.",
    why: "Ending -θεῖσα (1st decl. feminine)."
  },
  "nominative/accusative singular neuter, aorist passive participle": {
    greek: "λυθέν τὸ τέκνον ἀπῆλθεν.",
    english: "After being untied, the child went away.",
    why: "Ending -θέν. Neuter nom./acc. singular."
  },
  "genitive singular masculine/neuter, aorist passive participle": {
    greek: "ἡ φωνὴ τοῦ λυθέντος δούλου.",
    english: "The voice of the servant who was untied.",
    why: "Ending -θέντος."
  },
  "dative singular masculine/neuter, aorist passive participle": {
    greek: "λέγω τῷ λυθέντι.",
    english: "I speak to the one who was untied.",
    why: "Ending -θέντι."
  },
  "accusative singular masculine, aorist passive participle": {
    greek: "βλέπω τὸν λυθέντα.",
    english: "I see the one who was untied.",
    why: "Ending -θέντα."
  },
  "nominative plural masculine, aorist passive participle": {
    greek: "οἱ λυθέντες ἀπῆλθον.",
    english: "The ones who were untied went away.",
    why: "Ending -θέντες."
  },
  "nominative singular masculine, present middle/passive participle": {
    greek: "ὁ λυόμενος χαίρει.",
    english: "The one being untied rejoices.",
    why: "Ending -όμενος. Looks like a 2-1-2 adjective (like ἀγαθός)."
  },
  "genitive singular masculine/neuter, present middle/passive participle": {
    greek: "ἡ φωνὴ τοῦ λυομένου.",
    english: "The voice of the one being untied.",
    why: "Ending -ομένου."
  },
  "dative singular masculine/neuter, present middle/passive participle": {
    greek: "λέγω τῷ λυομένῳ.",
    english: "I speak to the one being untied.",
    why: "Ending -ομένῳ."
  },
  "accusative singular masculine, present middle/passive participle": {
    greek: "βλέπω τὸν λυόμενον.",
    english: "I see the one being untied.",
    why: "Ending -όμενον."
  },
  "nominative singular masculine, present participle": {
    greek: "ὁ ἀνὴρ ὢν σοφὸς διδάσκει.",
    english: "The man, being wise, teaches.",
    why: "ὤν — the participle of εἰμί, masc. nom. sg."
  },
  "nominative singular feminine, present participle": {
    greek: "ἡ γυνὴ οὖσα σοφὴ διδάσκει.",
    english: "The woman, being wise, teaches.",
    why: "οὖσα — participle of εἰμί, fem. nom. sg."
  },
  "nominative/accusative singular neuter, present participle": {
    greek: "τὸ ὂν ἀληθές ἐστιν.",
    english: "That which exists is real.",
    why: "ὄν — participle of εἰμί, neut. nom./acc. sg."
  },

  // ── article & pronoun forms ────────────────────────────
  "nominative singular masculine": {
    greek: "ὁ ἄνθρωπος βλέπει.",
    english: "The man sees.",
    why: "Subject-marking case, masculine, one."
  },
  "genitive singular masculine": {
    greek: "ἡ φωνὴ τοῦ ἀνθρώπου.",
    english: "The voice of the man.",
    why: "Possession / source."
  },
  "genitive singular masculine/neuter": {
    greek: "ἡ φωνὴ τοῦ λόγου.",
    english: "The sound of the word.",
    why: "Masc. and neut. share one form in the genitive singular."
  },
  "dative singular masculine": {
    greek: "δίδωμι δῶρον τῷ ἀνθρώπῳ.",
    english: "I give a gift to the man.",
    why: "Indirect object / means / location."
  },
  "dative singular masculine/neuter": {
    greek: "δίδωμι δῶρον τῷ φίλῳ.",
    english: "I give a gift to the friend.",
    why: "Masc. and neut. share one form in the dative singular."
  },
  "accusative singular masculine": {
    greek: "βλέπω τὸν ἄνθρωπον.",
    english: "I see the man.",
    why: "Direct-object case, masculine, one."
  },
  "nominative plural masculine": {
    greek: "οἱ ἄνθρωποι βλέπουσι(ν).",
    english: "The men see.",
    why: "Subject-marking case, masculine, more than one."
  },
  "genitive plural (all genders)": {
    greek: "ἡ φωνὴ τῶν μαθητῶν.",
    english: "The voice of the students.",
    why: "The genitive plural is identical across all three genders."
  },
  "genitive plural masculine": {
    greek: "ἡ φωνὴ τῶν ἀνθρώπων.",
    english: "The voice of the men.",
    why: "Genitive plural is identical across all three genders — it doesn't distinguish."
  },
  "dative plural masculine/neuter": {
    greek: "λέγω τοῖς ἀνθρώποις.",
    english: "I speak to the men.",
    why: "Ending -οις for masc./neut. dative plural."
  },
  "accusative plural masculine": {
    greek: "βλέπω τοὺς ἀνθρώπους.",
    english: "I see the men.",
    why: "Ending -ους for masc. acc. plural."
  },
  "nominative singular feminine": {
    greek: "ἡ φωνὴ ἀκούεται.",
    english: "The voice is heard.",
    why: "Subject-marking case, feminine, one."
  },
  "genitive singular feminine": {
    greek: "ὁ λόγος τῆς ἀγάπης.",
    english: "The word of love.",
    why: "Possession / source, feminine."
  },
  "dative singular feminine": {
    greek: "λέγω τῇ μητρί.",
    english: "I speak to the mother.",
    why: "Indirect object, feminine."
  },
  "accusative singular feminine": {
    greek: "βλέπω τὴν οἰκίαν.",
    english: "I see the house.",
    why: "Direct-object case, feminine, one."
  },
  "nominative plural feminine": {
    greek: "αἱ φωναὶ ἀκούονται.",
    english: "The voices are heard.",
    why: "Subject-marking case, feminine, more than one."
  },
  "dative plural feminine": {
    greek: "λέγω ταῖς γυναιξίν.",
    english: "I speak to the women.",
    why: "Ending -αις for feminine dative plural."
  },
  "accusative plural feminine": {
    greek: "βλέπω τὰς οἰκίας.",
    english: "I see the houses.",
    why: "Ending -ας for feminine acc. plural."
  },
  "nominative/accusative singular neuter": {
    greek: "τὸ τέκνον παίζει. / βλέπω τὸ τέκνον.",
    english: "The child plays. / I see the child.",
    why: "Neuter nom. and acc. singular always share one form."
  },
  "nominative/accusative plural neuter": {
    greek: "τὰ τέκνα παίζει. / βλέπω τὰ τέκνα.",
    english: "The children play. / I see the children.",
    why: "Neuter nom. and acc. plural always share one form. Neut. pl. subjects often take a singular verb."
  },

  // ── tense-only labels (Ch 6 tense-id distractors like "imperfect (1st sg.)")
  "present first singular": {
    greek: "ἐγὼ λύω.",
    english: "I untie.",
    why: "Present-tense 1st sg. — no augment, no σ."
  },
  "future first singular": {
    greek: "ἐγὼ λύσω.",
    english: "I will untie.",
    why: "σ tense marker — no augment."
  },
  "imperfect first singular": {
    greek: "ἐγὼ ἔλυον.",
    english: "I was untying.",
    why: "Augment ἐ- + present stem + secondary ending."
  },
  "aorist first singular": {
    greek: "ἐγὼ ἔλυσα.",
    english: "I untied.",
    why: "Augment + σα (1st aorist) or different stem (2nd aorist)."
  },
  "perfect first singular": {
    greek: "ἐγὼ λέλυκα.",
    english: "I have untied.",
    why: "Reduplication + κ + α-class ending."
  },
  "aorist subjunctive, first singular": {
    greek: "ἵνα λύσω.",
    english: "that I may untie",
    why: "σ + long ω. No augment (augment is indicative-only)."
  },

  // ── ambiguous 1sg/3pl imperfects & aorists
  "aorist active indicative, first singular or third plural": {
    greek: "ἦλθον — ἐγὼ ἦλθον / αὐτοὶ ἦλθον.",
    english: "I came / they came.",
    why: "2nd-aorist -ον ending is ambiguous between 1st sg. and 3rd pl."
  },

  // ── εἰμί non-3sg and related
  "first singular i am": {
    greek: "ἐγὼ μαθητής εἰμι.",
    english: "I am a student.",
    why: "1st sg. of εἰμί."
  },
  "third singular he/she/it is": {
    greek: "ὁ λόγος καλός ἐστι(ν).",
    english: "The word is good.",
    why: "3rd sg. of εἰμί."
  },
  "first plural we are": {
    greek: "ἡμεῖς μαθηταί ἐσμεν.",
    english: "We are students.",
    why: "1st pl. of εἰμί."
  },
  "second singular you are": {
    greek: "σὺ μαθητὴς εἶ.",
    english: "You are a student.",
    why: "2nd sg. of εἰμί."
  },
  "second plural you all are": {
    greek: "ὑμεῖς μαθηταί ἐστε.",
    english: "You (all) are students.",
    why: "2nd pl. of εἰμί."
  },
  "third plural they are": {
    greek: "οἱ μαθηταὶ καλοί εἰσι(ν).",
    english: "The students are good.",
    why: "3rd pl. of εἰμί."
  }
};
