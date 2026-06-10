const SETS = {
  "1": {
    "label": "Chapter 1",
    "type": "chapter",
    "cards": [
      {
        "g": "Ἀβραάμ, ὁ",
        "e": "Abraham",
        "required": false
      },
      {
        "g": "ἀμήν",
        "e": "amen, truly",
        "required": false
      },
      {
        "g": "Δαυίδ, ὁ",
        "e": "David",
        "required": false
      },
      {
        "g": "ῥαββί, ὁ",
        "e": "rabbi",
        "required": false
      },
      {
        "g": "Ἰακώβ, ὁ",
        "e": "Jacob",
        "required": false
      },
      {
        "g": "Ἰσραήλ, ὁ",
        "e": "Israel",
        "required": false
      },
      {
        "g": "Ἰωσήφ, ὁ",
        "e": "Joseph",
        "required": false
      },
      {
        "g": "καί",
        "e": "and",
        "required": true
      }
    ]
  },
  "2": {
    "label": "Chapter 2",
    "type": "chapter",
    "cards": [
      {
        "g": "ἄγω",
        "e": "I lead, bring",
        "required": true
      },
      {
        "g": "ἀκούω",
        "e": "I hear, listen to",
        "required": true
      },
      {
        "g": "βάλλω",
        "e": "I throw",
        "required": true
      },
      {
        "g": "βλέπω",
        "e": "I see, watch",
        "required": true
      },
      {
        "g": "διδάσκω",
        "e": "I teach",
        "required": true
      },
      {
        "g": "ἔχω",
        "e": "I have, hold",
        "required": true
      },
      {
        "g": "λαμβάνω",
        "e": "I take, receive",
        "required": true
      },
      {
        "g": "λέγω",
        "e": "I say, speak, tell",
        "required": true
      },
      {
        "g": "λύω",
        "e": "I untie",
        "required": true
      },
      {
        "g": "ζητέω",
        "e": "I seek",
        "required": true
      },
      {
        "g": "καλέω",
        "e": "I call",
        "required": true
      },
      {
        "g": "λαλέω",
        "e": "I speak, say",
        "required": true
      },
      {
        "g": "ποιέω",
        "e": "I do, make",
        "required": true
      },
      {
        "g": "τηρέω",
        "e": "I keep",
        "required": true
      },
      {
        "g": "φιλέω",
        "e": "I love, like",
        "required": true
      },
      {
        "g": "ἄγγελος -ου, ὁ",
        "e": "messenger, angel",
        "required": true
      },
      {
        "g": "ἀδελφός -οῦ, ὁ",
        "e": "brother",
        "required": true
      },
      {
        "g": "ἄρτος -ου, ὁ",
        "e": "bread",
        "required": true
      },
      {
        "g": "δοῦλος, -ου, ὁ",
        "e": "slave",
        "required": true
      },
      {
        "g": "θεός -οῦ, ὁ",
        "e": "god, God",
        "required": true
      },
      {
        "g": "κόσμος -ου, ὁ",
        "e": "world",
        "required": true
      },
      {
        "g": "κύριος -ου, ὁ",
        "e": "lord, master, sir",
        "required": true
      },
      {
        "g": "λόγος -ου, ὁ",
        "e": "word, message",
        "required": true
      },
      {
        "g": "νόμος -ου, ὁ",
        "e": "law",
        "required": true
      },
      {
        "g": "οἶκος -ου, ὁ",
        "e": "household, house",
        "required": true
      },
      {
        "g": "οὐρανός -οῦ, ὁ",
        "e": "heaven",
        "required": true
      },
      {
        "g": "ὄχλος -ου, ὁ",
        "e": "crowd",
        "required": true
      },
      {
        "g": "υἱός -οῦ, ὁ",
        "e": "son",
        "required": true
      },
      {
        "g": "Χριστός -οῦ, ὁ",
        "e": "Christ, Messiah",
        "required": true
      },
      {
        "g": "ὁ, ἡ, τό",
        "e": "the (definite article)",
        "required": true
      },
      {
        "g": "ἄνθρωπος -ου, ὁ",
        "e": "human being, person",
        "required": true
      },
      {
        "g": "λαός -οῦ, ὁ",
        "e": "people, nation",
        "required": true
      }
    ]
  },
  "3": {
    "label": "Chapter 3",
    "type": "chapter",
    "cards": [
      {
        "g": "ἀγάπη, -ης, ἡ",
        "e": "love",
        "required": true
      },
      {
        "g": "ἀδελφή, -ῆς, ἡ",
        "e": "sister",
        "required": true
      },
      {
        "g": "ἀρχή, -ῆς, ἡ",
        "e": "beginning",
        "required": false
      },
      {
        "g": "γῆ, γῆς, ἡ",
        "e": "earth, soil, land",
        "required": true
      },
      {
        "g": "ζωή, -ῆς, ἡ",
        "e": "life",
        "required": true
      },
      {
        "g": "φωνή, -ῆς, ἡ",
        "e": "sound, voice",
        "required": true
      },
      {
        "g": "ψυχή, -ῆς, ἡ",
        "e": "soul, self",
        "required": false
      },
      {
        "g": "ἁμαρτία, -ας, ἡ",
        "e": "sin",
        "required": true
      },
      {
        "g": "βασιλεία, -ας, ἡ",
        "e": "reign, kingship, kingdom",
        "required": true
      },
      {
        "g": "ἐκκλησία, -ας, ἡ",
        "e": "assembly (later 'church')",
        "required": true
      },
      {
        "g": "ἡμέρα, -ας, ἡ",
        "e": "day",
        "required": true
      },
      {
        "g": "καρδία, -ας, ἡ",
        "e": "heart",
        "required": true
      },
      {
        "g": "Μαρία / Μαριάμ",
        "e": "Mary",
        "required": false
      },
      {
        "g": "οἰκία, -ας, ἡ",
        "e": "house, household",
        "required": false
      },
      {
        "g": "ὥρα, -ας, ἡ",
        "e": "hour, occasion",
        "required": false
      },
      {
        "g": "δόξα, -ης, ἡ",
        "e": "splendour, glory",
        "required": true
      },
      {
        "g": "θάλασσα, -ης, ἡ",
        "e": "sea, lake",
        "required": true
      },
      {
        "g": "βιβλίον, -ου, τό",
        "e": "book, scroll",
        "required": false
      },
      {
        "g": "δαιμόνιον, -ου, τό",
        "e": "demon",
        "required": false
      },
      {
        "g": "ἔργον, -ου, τό",
        "e": "work, deed",
        "required": true
      },
      {
        "g": "εὐαγγέλιον, -ου, τό",
        "e": "good news, gospel",
        "required": true
      },
      {
        "g": "ἱερόν, -οῦ, τό",
        "e": "temple",
        "required": true
      },
      {
        "g": "πλοῖον, -ου, τό",
        "e": "boat",
        "required": true
      },
      {
        "g": "πρόσωπον, -ου, τό",
        "e": "face",
        "required": true
      },
      {
        "g": "σάββατον, -ου, τό",
        "e": "Sabbath",
        "required": false
      },
      {
        "g": "σημεῖον, -ου, τό",
        "e": "sign, miracle",
        "required": true
      },
      {
        "g": "τέκνον, -ου, τό",
        "e": "child",
        "required": true
      },
      {
        "g": "αὐτός, -ή, -ό",
        "e": "he, she, it, they",
        "required": true
      },
      {
        "g": "Ἰησοῦς",
        "e": "Jesus",
        "required": true
      },
      {
        "g": "Παῦλος -ου, ὁ",
        "e": "Paul",
        "required": true
      },
      {
        "g": "Πέτρος -ου, ὁ",
        "e": "Peter",
        "required": true
      },
      {
        "g": "πιστεύω",
        "e": "(+ dat.) I believe (in), trust, have faith in",
        "required": true
      }
    ]
  },
  "4": {
    "label": "Chapter 4",
    "type": "chapter",
    "cards": [
      {
        "g": "ἀπό+gen.",
        "e": "(away) from",
        "required": true
      },
      {
        "g": "διά+acc.",
        "e": "because of",
        "required": true
      },
      {
        "g": "διά+gen.",
        "e": "through",
        "required": true
      },
      {
        "g": "εἰς+acc.",
        "e": "into",
        "required": true
      },
      {
        "g": "ἐκ+gen.",
        "e": "(out of) from",
        "required": true
      },
      {
        "g": "ἐν+dat.",
        "e": "in",
        "required": true
      },
      {
        "g": "ἐνώπιον+gen.",
        "e": "in front of, in the presence of",
        "required": false
      },
      {
        "g": "ἔξω+gen.",
        "e": "outside",
        "required": false
      },
      {
        "g": "ἐπί+acc.",
        "e": "onto",
        "required": true
      },
      {
        "g": "ἐπί+gen.",
        "e": "on",
        "required": true
      },
      {
        "g": "ἐπί+dat.",
        "e": "on the basis of",
        "required": true
      },
      {
        "g": "ἕως+gen.",
        "e": "until",
        "required": false
      },
      {
        "g": "κατά+acc.",
        "e": "according to",
        "required": true
      },
      {
        "g": "κατά+gen.",
        "e": "against",
        "required": true
      },
      {
        "g": "μετά+acc.",
        "e": "after",
        "required": true
      },
      {
        "g": "μετά+gen.",
        "e": "with",
        "required": true
      },
      {
        "g": "παρά+acc.",
        "e": "alongside",
        "required": true
      },
      {
        "g": "παρά+gen.",
        "e": "from beside",
        "required": true
      },
      {
        "g": "παρά+dat.",
        "e": "beside",
        "required": true
      },
      {
        "g": "περί+acc.",
        "e": "around, approximately",
        "required": true
      },
      {
        "g": "περί+gen.",
        "e": "concerning",
        "required": true
      },
      {
        "g": "πρό+gen.",
        "e": "before",
        "required": false
      },
      {
        "g": "πρός+acc.",
        "e": "to, towards",
        "required": true
      },
      {
        "g": "σύν+dat.",
        "e": "together with",
        "required": false
      },
      {
        "g": "ὑπέρ+acc.",
        "e": "above",
        "required": true
      },
      {
        "g": "ὑπέρ+gen.",
        "e": "on behalf of",
        "required": true
      },
      {
        "g": "ὑπό+acc.",
        "e": "under",
        "required": true
      },
      {
        "g": "ὑπό+gen.",
        "e": "by, at the hands of",
        "required": true
      },
      {
        "g": "ἀναβλέπω",
        "e": "I look up, receive sight",
        "required": false
      },
      {
        "g": "ἀπολύω",
        "e": "I set free, divorce, dismiss",
        "required": true
      },
      {
        "g": "ἐκβάλλω",
        "e": "I drive out, cast out, throw out",
        "required": true
      },
      {
        "g": "ἐπικαλέω",
        "e": "I call upon, name",
        "required": false
      },
      {
        "g": "κατοικέω",
        "e": "I dwell, inhabit, live",
        "required": false
      },
      {
        "g": "παρακαλέω",
        "e": "I exhort, request, comfort, encourage",
        "required": true
      },
      {
        "g": "παραλαμβάνω",
        "e": "I take, receive",
        "required": false
      },
      {
        "g": "περιπατέω",
        "e": "I walk about, live",
        "required": true
      },
      {
        "g": "προσκυνέω",
        "e": "(+dat.) I worship",
        "required": true
      },
      {
        "g": "συνάγω",
        "e": "I gather, bring together",
        "required": true
      },
      {
        "g": "ὑπάγω",
        "e": "I depart",
        "required": true
      },
      {
        "g": "πῶς",
        "e": "how?",
        "required": true
      },
      {
        "g": "ποῦ",
        "e": "where?",
        "required": true
      },
      {
        "g": "οὐ, οὐκ, οὐχ",
        "e": "not",
        "required": true
      }
    ]
  },
  "5": {
    "label": "Chapter 5",
    "type": "chapter",
    "cards": [
      {
        "g": "ἀγαθός -ή, -όν",
        "e": "good",
        "required": true
      },
      {
        "g": "ἀγαπητός -ή, -όν",
        "e": "beloved",
        "required": false
      },
      {
        "g": "ἅγιος -α, -ον",
        "e": "holy",
        "required": true
      },
      {
        "g": "δίκαιος -α, -ον",
        "e": "upright, just",
        "required": false
      },
      {
        "g": "ἕκαστος -η, -ον",
        "e": "each",
        "required": false
      },
      {
        "g": "ἕτερος -α, -ον",
        "e": "another, different / adj. masc.-fem.-neut. endings",
        "required": false
      },
      {
        "g": "ἴδιος -α, -ον",
        "e": "one's own",
        "required": true
      },
      {
        "g": "Ἰουδαῖος -α, -ον",
        "e": "Jewish, a Jew",
        "required": true
      },
      {
        "g": "κακός -ή, -όν",
        "e": "bad",
        "required": false
      },
      {
        "g": "καλός -ή, -όν",
        "e": "beautiful, good",
        "required": true
      },
      {
        "g": "καινός -ή, -όν",
        "e": "new",
        "required": false
      },
      {
        "g": "μακάριος -α, -ον",
        "e": "blessed, happy",
        "required": true
      },
      {
        "g": "μόνος -η, -ον",
        "e": "only, alone",
        "required": true
      },
      {
        "g": "νεκρός -ά, -όν",
        "e": "dead",
        "required": true
      },
      {
        "g": "πιστός -ή, -όν",
        "e": "faithful, believing",
        "required": false
      },
      {
        "g": "πονηρός -ά, -όν",
        "e": "evil, wicked",
        "required": true
      },
      {
        "g": "τυφλός -ή, -όν",
        "e": "blind",
        "required": true
      },
      {
        "g": "μέγας μεγάλη, μέγα",
        "e": "large, great",
        "required": true
      },
      {
        "g": "πολύς πολλή, πολύ",
        "e": "much, many",
        "required": true
      },
      {
        "g": "Γαλιλαία, -ας, ἡ",
        "e": "Galilee",
        "required": false
      },
      {
        "g": "εἰρήνη, -ης, ἡ",
        "e": "peace",
        "required": true
      },
      {
        "g": "κεφαλή, -ῆς, ἡ",
        "e": "head",
        "required": true
      },
      {
        "g": "συναγωγή, -ῆς, ἡ",
        "e": "synagogue",
        "required": true
      },
      {
        "g": "ἀλλά",
        "e": "but",
        "required": true
      },
      {
        "g": "εἰ",
        "e": "if",
        "required": false
      },
      {
        "g": "ἤ",
        "e": "or",
        "required": false
      },
      {
        "g": "ὡς",
        "e": "as, like",
        "required": true
      },
      {
        "g": "καιρός -οῦ, ὁ",
        "e": "time, season",
        "required": false
      },
      {
        "g": "εἰμί",
        "e": "I am",
        "required": true
      },
      {
        "g": "Ἱεροσόλυμα / Ἰερουσαλήμ",
        "e": "Jerusalem",
        "required": true
      },
      {
        "g": "αἰώνιος, -ον",
        "e": "eternal",
        "required": true
      }
    ]
  },
  "6": {
    "label": "Chapter 6",
    "type": "chapter",
    "cards": [
      {
        "g": "ἀνοίγω",
        "e": "I open",
        "required": true
      },
      {
        "g": "ἀποκαλύπτω",
        "e": "I reveal, uncover",
        "required": false
      },
      {
        "g": "βαπτίζω",
        "e": "I baptise, dip",
        "required": true
      },
      {
        "g": "γράφω",
        "e": "I write",
        "required": true
      },
      {
        "g": "διώκω",
        "e": "I persecute, pursue",
        "required": false
      },
      {
        "g": "δοξάζω",
        "e": "I praise, glorify",
        "required": true
      },
      {
        "g": "κηρύσσω",
        "e": "I proclaim, preach",
        "required": true
      },
      {
        "g": "αἰτέω",
        "e": "I ask (for)",
        "required": true
      },
      {
        "g": "κράζω",
        "e": "I cry out",
        "required": true
      },
      {
        "g": "πέμπω",
        "e": "I send",
        "required": true
      },
      {
        "g": "πείθω",
        "e": "I convince, persuade",
        "required": false
      },
      {
        "g": "σῴζω",
        "e": "I save, rescue, heal",
        "required": true
      },
      {
        "g": "ὑπάρχω",
        "e": "I exist, am",
        "required": false
      },
      {
        "g": "εὐλογέω",
        "e": "I speak well of, bless, praise",
        "required": true
      },
      {
        "g": "εὐχαριστέω",
        "e": "I give thanks",
        "required": true
      },
      {
        "g": "οἰκοδομέω",
        "e": "I build (up)",
        "required": true
      },
      {
        "g": "προσέχω",
        "e": "(+dat.) I take heed of, pay attention to",
        "required": true
      },
      {
        "g": "ἄρτι",
        "e": "now, just now",
        "required": false
      },
      {
        "g": "ἔτι",
        "e": "still, yet",
        "required": true
      },
      {
        "g": "ἤδη",
        "e": "already",
        "required": true
      },
      {
        "g": "νῦν",
        "e": "now",
        "required": true
      },
      {
        "g": "ὅτε",
        "e": "when",
        "required": true
      },
      {
        "g": "οὐκέτι",
        "e": "no longer",
        "required": true
      },
      {
        "g": "οὔπω",
        "e": "not yet",
        "required": true
      },
      {
        "g": "πάλιν",
        "e": "back, again",
        "required": true
      },
      {
        "g": "πάντοτε",
        "e": "always",
        "required": false
      },
      {
        "g": "ποτέ",
        "e": "once (at some time)",
        "required": true
      },
      {
        "g": "σήμερον",
        "e": "today",
        "required": false
      },
      {
        "g": "τότε",
        "e": "then",
        "required": true
      },
      {
        "g": "δύο",
        "e": "two",
        "required": true
      },
      {
        "g": "Τιμόθεος -ου, ὁ",
        "e": "Timothy",
        "required": true
      },
      {
        "g": "τόπος -ου, ὁ",
        "e": "place",
        "required": true
      }
    ]
  },
  "7": {
    "label": "Chapter 7",
    "type": "chapter",
    "cards": [
      {
        "g": "δικαιοσύνη, -ης, ἡ",
        "e": "righteousness",
        "required": true
      },
      {
        "g": "ἐντολή, -ῆς, ἡ",
        "e": "commandment",
        "required": true
      },
      {
        "g": "ἐξουσία, -ας, ἡ",
        "e": "authority",
        "required": true
      },
      {
        "g": "παραβολή, -ῆς, ἡ",
        "e": "parable",
        "required": true
      },
      {
        "g": "παρρησία, -ας, ἡ",
        "e": "outspokenness, boldness",
        "required": false
      },
      {
        "g": "χαρά, -ᾶς, ἡ",
        "e": "joy",
        "required": false
      },
      {
        "g": "ἀπόστολος, -ου, ὁ",
        "e": "apostle",
        "required": true
      },
      {
        "g": "θάνατος, -ου, ὁ",
        "e": "death",
        "required": true
      },
      {
        "g": "ὀφθαλμός, -οῦ, ὁ",
        "e": "eye",
        "required": true
      },
      {
        "g": "Φαρισαῖος, -ου, ὁ",
        "e": "Pharisee",
        "required": true
      },
      {
        "g": "θηρίον, -ου, τό",
        "e": "animal, beast",
        "required": true
      },
      {
        "g": "ἱμάτιον, -ου, τό",
        "e": "garment",
        "required": true
      },
      {
        "g": "μνημεῖον, -ου, τό",
        "e": "tomb, monument",
        "required": false
      },
      {
        "g": "πρόβατον, -ου, τό",
        "e": "sheep",
        "required": true
      },
      {
        "g": "μή",
        "e": "not",
        "required": true
      },
      {
        "g": "μηδέ",
        "e": "and not, but not",
        "required": true
      },
      {
        "g": "μηκέτι",
        "e": "no longer",
        "required": false
      },
      {
        "g": "μήτε",
        "e": "and not, nor",
        "required": false
      },
      {
        "g": "ἀκολουθέω",
        "e": "I follow",
        "required": true
      },
      {
        "g": "ἀνάγω",
        "e": "I lead up, restore",
        "required": false
      },
      {
        "g": "δέω",
        "e": "I bind, tie up",
        "required": false
      },
      {
        "g": "δοκέω",
        "e": "I think, seem",
        "required": true
      },
      {
        "g": "ἐλεέω",
        "e": "I have mercy on, pity",
        "required": false
      },
      {
        "g": "θέλω",
        "e": "I wish, want",
        "required": true
      },
      {
        "g": "θεωρέω",
        "e": "I look at",
        "required": true
      },
      {
        "g": "καταργέω",
        "e": "I make ineffective, abolish",
        "required": false
      },
      {
        "g": "μαρτυρέω",
        "e": "I bear witness, testify",
        "required": true
      },
      {
        "g": "μέλλω",
        "e": "I intend, am about (to)",
        "required": true
      },
      {
        "g": "μετανοέω",
        "e": "I repent, change my mind",
        "required": true
      },
      {
        "g": "δεῖ",
        "e": "it is necessary",
        "required": true
      },
      {
        "g": "ἔξεστι",
        "e": "it is permitted",
        "required": false
      },
      {
        "g": "ὀπίσω",
        "e": "behind",
        "required": true
      }
    ]
  },
  "8": {
    "label": "Chapter 8",
    "type": "chapter",
    "cards": [
      {
        "g": "ἔρχομαι",
        "e": "I come, go",
        "required": true
      },
      {
        "g": "ἀπέρχομαι",
        "e": "I depart, go away",
        "required": true
      },
      {
        "g": "διέρχομαι",
        "e": "I cross over",
        "required": false
      },
      {
        "g": "εἰσέρχομαι",
        "e": "I go into, enter",
        "required": true
      },
      {
        "g": "ἐξέρχομαι",
        "e": "I go out, go away",
        "required": true
      },
      {
        "g": "παρέρχομαι",
        "e": "I go by, pass by",
        "required": false
      },
      {
        "g": "προσέρχομαι",
        "e": "I come to, go to, approach",
        "required": true
      },
      {
        "g": "συνέρχομαι",
        "e": "I come together",
        "required": false
      },
      {
        "g": "ἅπτομαι",
        "e": "I touch",
        "required": false
      },
      {
        "g": "ἀρνέομαι",
        "e": "I refuse, deny",
        "required": true
      },
      {
        "g": "ἄρχομαι",
        "e": "I begin",
        "required": true
      },
      {
        "g": "ἀσπάζομαι",
        "e": "I greet",
        "required": false
      },
      {
        "g": "δέχομαι",
        "e": "I receive",
        "required": true
      },
      {
        "g": "ἐργάζομαι",
        "e": "I work",
        "required": true
      },
      {
        "g": "εὐαγγελίζομαι",
        "e": "I proclaim the good news",
        "required": true
      },
      {
        "g": "λογίζομαι",
        "e": "I calculate, consider",
        "required": false
      },
      {
        "g": "προσεύχομαι",
        "e": "I pray",
        "required": true
      },
      {
        "g": "προσκαλέομαι",
        "e": "I summon",
        "required": false
      },
      {
        "g": "ῥύομαι",
        "e": "I rescue",
        "required": true
      },
      {
        "g": "Ἡρῴδης, -ου, ὁ",
        "e": "Herod",
        "required": false
      },
      {
        "g": "Ἰωάννης, -ου, ὁ",
        "e": "John",
        "required": true
      },
      {
        "g": "μαθητής, -οῦ, ὁ",
        "e": "disciple",
        "required": true
      },
      {
        "g": "προφήτης, -ου, ὁ",
        "e": "prophet",
        "required": true
      },
      {
        "g": "στρατιώτης, -ου, ὁ",
        "e": "soldier",
        "required": true
      },
      {
        "g": "ὑπηρέτης, -ου, ὁ",
        "e": "servant",
        "required": false
      },
      {
        "g": "Βαρναβᾶς, -ᾶ, ὁ",
        "e": "Barnabas",
        "required": false
      },
      {
        "g": "Ἰούδας, -α, ὁ",
        "e": "Judah, Judas",
        "required": true
      },
      {
        "g": "Σατανᾶς, -ᾶ, ὁ",
        "e": "Satan",
        "required": false
      },
      {
        "g": "Ἡλίας, -ου, ὁ",
        "e": "Elijah",
        "required": true
      },
      {
        "g": "ἀμνός, -οῦ, ὁ",
        "e": "lamb, sheep",
        "required": true
      },
      {
        "g": "Αἴγυπτος, -ου, ἡ",
        "e": "Egypt",
        "required": false
      },
      {
        "g": "ἔρημος, -ου, ἡ",
        "e": "wilderness, desolate land",
        "required": true
      },
      {
        "g": "ὁδός, -οῦ, ἡ",
        "e": "way, road",
        "required": true
      }
    ]
  },
  "9": {
    "label": "Chapter 9",
    "type": "chapter",
    "cards": [
      {
        "g": "ἀλλήλος, ἀλλήλων",
        "e": "each other, one another",
        "required": true
      },
      {
        "g": "ἄλλος, -η, -ο",
        "e": "other",
        "required": false
      },
      {
        "g": "ἑαυτοῦ, -ῆς, -οῦ",
        "e": "himself, herself, itself (reflexive)",
        "required": true
      },
      {
        "g": "ἐγώ, ἡμεῖς",
        "e": "I, we",
        "required": true
      },
      {
        "g": "ἐκεῖνος, -η, -ο",
        "e": "that",
        "required": true
      },
      {
        "g": "ἐμαυτοῦ",
        "e": "myself",
        "required": false
      },
      {
        "g": "ἐμός, -ή, -όν",
        "e": "my, mine",
        "required": false
      },
      {
        "g": "κἀγώ",
        "e": "and I",
        "required": true
      },
      {
        "g": "ὅλος, -η, -ον",
        "e": "whole, entire",
        "required": true
      },
      {
        "g": "οὗτος, αὕτη, τοῦτο",
        "e": "this",
        "required": true
      },
      {
        "g": "ποῖος, -α, -ον",
        "e": "of what kind?",
        "required": false
      },
      {
        "g": "πόσος -η, -ον",
        "e": "how great, how much?",
        "required": false
      },
      {
        "g": "σεαυτοῦ",
        "e": "yourself",
        "required": true
      },
      {
        "g": "σός, -σή, -σόν",
        "e": "your, yours",
        "required": false
      },
      {
        "g": "σύ, ὑμεῖς",
        "e": "you (sing.), you (pl.)",
        "required": true
      },
      {
        "g": "τοιοῦτος, -αύτη, -οῦτον",
        "e": "of such a kind, such",
        "required": false
      },
      {
        "g": "ἄρα",
        "e": "so",
        "required": false
      },
      {
        "g": "γάρ",
        "e": "for",
        "required": true
      },
      {
        "g": "γέ",
        "e": "indeed",
        "required": false
      },
      {
        "g": "δέ",
        "e": "but",
        "required": true
      },
      {
        "g": "διό",
        "e": "therefore",
        "required": true
      },
      {
        "g": "διότι",
        "e": "because",
        "required": false
      },
      {
        "g": "εἴτε … εἴτε",
        "e": "if … if, whether … or",
        "required": true
      },
      {
        "g": "ἐπεί",
        "e": "since",
        "required": false
      },
      {
        "g": "μέν",
        "e": "on the one hand",
        "required": true
      },
      {
        "g": "μήποτε",
        "e": "never",
        "required": false
      },
      {
        "g": "οὖν",
        "e": "therefore, consequently",
        "required": true
      },
      {
        "g": "τέ … καὶ",
        "e": "both … and",
        "required": true
      },
      {
        "g": "ἀρνίον, -ου, τό",
        "e": "lamb, sheep",
        "required": false
      },
      {
        "g": "δένδρον, -ου, τό",
        "e": "tree",
        "required": false
      },
      {
        "g": "μυστήριον, -ου, τό",
        "e": "mystery, secret",
        "required": false
      },
      {
        "g": "ποτήριον, -ου, τό",
        "e": "cup",
        "required": true
      }
    ]
  },
  "10": {
    "label": "Chapter 10",
    "type": "chapter",
    "cards": [
      {
        "g": "ἀλήθεια, -ας, ἡ",
        "e": "truth",
        "required": true
      },
      {
        "g": "ἀληθινός, -ή, -όν",
        "e": "true, genuine, real",
        "required": false
      },
      {
        "g": "ἐγγύς",
        "e": "near",
        "required": false
      },
      {
        "g": "ἐκεῖ",
        "e": "there (in that place)",
        "required": true
      },
      {
        "g": "ἐκεῖθεν",
        "e": "from there",
        "required": false
      },
      {
        "g": "εὐθύς, -εῖα, -ύ",
        "e": "immediately",
        "required": true
      },
      {
        "g": "καθώς",
        "e": "just as",
        "required": true
      },
      {
        "g": "καλῶς",
        "e": "appropriately, well",
        "required": false
      },
      {
        "g": "ναί",
        "e": "yes, of course",
        "required": false
      },
      {
        "g": "ὅμοιος, -α, -ον",
        "e": "similar, like",
        "required": false
      },
      {
        "g": "ὅσος, -η, -ον",
        "e": "as/how great, as/how much",
        "required": false
      },
      {
        "g": "ὁμοίως",
        "e": "likewise",
        "required": false
      },
      {
        "g": "ὅπου",
        "e": "where",
        "required": true
      },
      {
        "g": "ὅς, ἥ, ὅ",
        "e": "who, which, what (relative pronoun)",
        "required": true
      },
      {
        "g": "ὅτι",
        "e": "that, because (or marks beginning of speech)",
        "required": true
      },
      {
        "g": "οὗ",
        "e": "where",
        "required": false
      },
      {
        "g": "οὐδέ",
        "e": "and not",
        "required": true
      },
      {
        "g": "οὔτε … οὔτε",
        "e": "neither … nor",
        "required": true
      },
      {
        "g": "οὕτως",
        "e": "in this manner, thus",
        "required": true
      },
      {
        "g": "οὐχί",
        "e": "not, no",
        "required": true
      },
      {
        "g": "πλήν",
        "e": "however, yet",
        "required": false
      },
      {
        "g": "πόθεν",
        "e": "from where?",
        "required": false
      },
      {
        "g": "ὧδε",
        "e": "here",
        "required": true
      },
      {
        "g": "ἔμπροσθεν+gen.",
        "e": "in front of",
        "required": true
      },
      {
        "g": "ἕνεκα+gen.",
        "e": "for the sake of",
        "required": false
      },
      {
        "g": "πέραν+gen.",
        "e": "on the other side of",
        "required": false
      },
      {
        "g": "χωρίς+gen.",
        "e": "separate, apart from",
        "required": true
      },
      {
        "g": "Πιλᾶτος, -ου, ὁ",
        "e": "Pilate",
        "required": true
      },
      {
        "g": "ἐγγίζω",
        "e": "I approach, come near",
        "required": false
      },
      {
        "g": "ἡγέομαι",
        "e": "I lead",
        "required": false
      },
      {
        "g": "θαυμάζω",
        "e": "I am amazed",
        "required": true
      },
      {
        "g": "θεραπεύω",
        "e": "I heal",
        "required": true
      },
      {
        "g": "καθεύδω",
        "e": "I sleep",
        "required": true
      }
    ]
  },
  "11": {
    "label": "Chapter 11",
    "type": "chapter",
    "cards": [
      {
        "g": "ἁμαρτάνω",
        "e": "I do wrong, sin",
        "required": false
      },
      {
        "g": "ἀποθνῄσκω",
        "e": "I die",
        "required": true
      },
      {
        "g": "γίνομαι",
        "e": "I become, happen",
        "required": true
      },
      {
        "g": "παραγίνομαι",
        "e": "I arrive, stand by",
        "required": false
      },
      {
        "g": "ἐσθίω",
        "e": "I eat",
        "required": true
      },
      {
        "g": "εὑρίσκω",
        "e": "I find",
        "required": true
      },
      {
        "g": "καταλείπω",
        "e": "I leave (behind)",
        "required": false
      },
      {
        "g": "μανθάνω",
        "e": "I learn",
        "required": false
      },
      {
        "g": "ὁράω",
        "e": "I see",
        "required": true
      },
      {
        "g": "πάσχω",
        "e": "I suffer",
        "required": false
      },
      {
        "g": "πίνω",
        "e": "I drink",
        "required": true
      },
      {
        "g": "πίπτω",
        "e": "I fall (down)",
        "required": true
      },
      {
        "g": "φέρω",
        "e": "I bear, carry",
        "required": true
      },
      {
        "g": "προσφέρω",
        "e": "I bring to, offer",
        "required": false
      },
      {
        "g": "φεύγω",
        "e": "I flee",
        "required": true
      },
      {
        "g": "ἀπαγγέλλω",
        "e": "I report, announce",
        "required": false
      },
      {
        "g": "παραγγέλλω",
        "e": "I order",
        "required": false
      },
      {
        "g": "αἴρω",
        "e": "I take (away), lift up",
        "required": true
      },
      {
        "g": "ἀποκτείνω",
        "e": "I kill",
        "required": false
      },
      {
        "g": "ἀποστέλλω",
        "e": "I send (out)",
        "required": true
      },
      {
        "g": "ἐγείρω",
        "e": "I raise up, wake",
        "required": true
      },
      {
        "g": "κρίνω",
        "e": "I judge, decide",
        "required": true
      },
      {
        "g": "μένω",
        "e": "I remain",
        "required": true
      },
      {
        "g": "ὀφείλω",
        "e": "I owe",
        "required": false
      },
      {
        "g": "σπείρω",
        "e": "I sow",
        "required": false
      },
      {
        "g": "χαίρω",
        "e": "I rejoice",
        "required": true
      },
      {
        "g": "ἀναβαίνω",
        "e": "I go up",
        "required": true
      },
      {
        "g": "καταβαίνω",
        "e": "I go down",
        "required": true
      },
      {
        "g": "γινώσκω",
        "e": "I know",
        "required": true
      },
      {
        "g": "ἀναγινώσκω",
        "e": "I read",
        "required": false
      },
      {
        "g": "ἐπιγινώσκω",
        "e": "I recognize",
        "required": false
      },
      {
        "g": "ἰδού",
        "e": "Look!, Behold!",
        "required": true
      }
    ]
  },
  "12": {
    "label": "Chapter 12",
    "type": "chapter",
    "cards": [
      {
        "g": "ἀνήρ, ἀνδρός, ὁ",
        "e": "man (male), husband",
        "required": false
      },
      {
        "g": "ἀστήρ, ἀστέρος, ὁ",
        "e": "star",
        "required": false
      },
      {
        "g": "σωτήρ, σωτῆρος, ὁ",
        "e": "savior",
        "required": true
      },
      {
        "g": "αἰών, αἰῶνος, ὁ",
        "e": "age (long time)",
        "required": true
      },
      {
        "g": "ἄρχων, ἄρχοντος, ὁ",
        "e": "ruler, leader",
        "required": false
      },
      {
        "g": "Σίμων, Σίμωνος, ὁ",
        "e": "Simon",
        "required": false
      },
      {
        "g": "γυνή, γυναικός, ἡ",
        "e": "woman, wife",
        "required": true
      },
      {
        "g": "ἐλπίς, ἐλπίδος, ἡ",
        "e": "hope",
        "required": true
      },
      {
        "g": "νύξ, νυκτός, ἡ",
        "e": "night",
        "required": false
      },
      {
        "g": "πούς, ποδός, ὁ",
        "e": "foot",
        "required": false
      },
      {
        "g": "σάρξ, σαρκός, ἡ",
        "e": "flesh",
        "required": true
      },
      {
        "g": "χάρις, χάριτος, ἡ",
        "e": "grace",
        "required": true
      },
      {
        "g": "χείρ, χειρός, ἡ",
        "e": "hand",
        "required": true
      },
      {
        "g": "θυγάτηρ, θυγατρός, ἡ",
        "e": "daughter",
        "required": false
      },
      {
        "g": "μήτηρ, μήτρος, ἡ",
        "e": "mother",
        "required": true
      },
      {
        "g": "πατήρ, πατρός, ὁ",
        "e": "father, ancestor",
        "required": true
      },
      {
        "g": "πῦρ, πυρός, τό",
        "e": "fire",
        "required": false
      },
      {
        "g": "ὕδωρ, ὕδατος, τό",
        "e": "water",
        "required": true
      },
      {
        "g": "φῶς, φωτός, τό",
        "e": "light",
        "required": true
      },
      {
        "g": "αἷμα, αἷματος, τό",
        "e": "blood",
        "required": true
      },
      {
        "g": "θέλημα, θελήματος, τό",
        "e": "will",
        "required": false
      },
      {
        "g": "ὄνομα, ὀνόματος, τό",
        "e": "name",
        "required": true
      },
      {
        "g": "πνεῦμα, πνεύματος, τό",
        "e": "spirit, wind",
        "required": true
      },
      {
        "g": "ῥῆμα, ῥήματος, τό",
        "e": "word, saying",
        "required": false
      },
      {
        "g": "στόμα, στόματος, τό",
        "e": "mouth",
        "required": false
      },
      {
        "g": "σῶμα, σώματος, τό",
        "e": "body",
        "required": true
      },
      {
        "g": "μείζων",
        "e": "greater, larger",
        "required": false
      },
      {
        "g": "πλείων",
        "e": "more",
        "required": true
      },
      {
        "g": "τις τι",
        "e": "someone, something (indefinite pronoun)",
        "required": true
      },
      {
        "g": "τίς τί",
        "e": "who?, which?, what? (interrogative pronoun)",
        "required": true
      },
      {
        "g": "ὅστις",
        "e": "who (relative pronoun)",
        "required": false
      },
      {
        "g": "ὥσπερ",
        "e": "just as",
        "required": false
      }
    ]
  },
  "13": {
    "label": "Chapter 13",
    "type": "chapter",
    "cards": [
      {
        "g": "ἔθνος, -ους τό",
        "e": "nation (pl. Gentiles)",
        "required": true
      },
      {
        "g": "ἔλεος, -ους, τό",
        "e": "mercy",
        "required": true
      },
      {
        "g": "ἔτος, -ους, τό",
        "e": "year",
        "required": true
      },
      {
        "g": "μέλος, -ους, τό",
        "e": "member, part, limb",
        "required": false
      },
      {
        "g": "μέρος, -ους, τό",
        "e": "part, share",
        "required": true
      },
      {
        "g": "ὄρος, -ους, τό",
        "e": "mountain, hill",
        "required": true
      },
      {
        "g": "πλῆθος, -ους, τό",
        "e": "multitude, large amount",
        "required": false
      },
      {
        "g": "σκεῦος, -ους, τό",
        "e": "object (pl. property)",
        "required": false
      },
      {
        "g": "σκότος, -ους, τό",
        "e": "darkness",
        "required": false
      },
      {
        "g": "τέλος, -ους, τό",
        "e": "end, goal",
        "required": true
      },
      {
        "g": "ἀρχιερεύς, -έως, ὁ",
        "e": "high priest, chief priest",
        "required": true
      },
      {
        "g": "βασιλεύς, -έως, ὁ",
        "e": "king",
        "required": true
      },
      {
        "g": "γραμματεύς, -έως, ὁ",
        "e": "scribe, clerk",
        "required": true
      },
      {
        "g": "ἱερεύς, -έως, ὁ",
        "e": "priest",
        "required": false
      },
      {
        "g": "ἀνάστασις, -εως, ἡ",
        "e": "resurrection",
        "required": false
      },
      {
        "g": "γνῶσις, -εως, ἡ",
        "e": "knowledge",
        "required": false
      },
      {
        "g": "δύναμις, -εως, ἡ",
        "e": "power, miracle",
        "required": true
      },
      {
        "g": "θλῖψις, -εως, ἡ",
        "e": "suffering, oppression",
        "required": true
      },
      {
        "g": "κρίσις, -εως, ἡ",
        "e": "judgement",
        "required": true
      },
      {
        "g": "παράκλησις, -εως, ἡ",
        "e": "encouragement",
        "required": false
      },
      {
        "g": "πίστις, -εως, ἡ",
        "e": "faith",
        "required": true
      },
      {
        "g": "πόλις, -εως, ἡ",
        "e": "city, town",
        "required": true
      },
      {
        "g": "συνείδησις, -εως, ἡ",
        "e": "conscience",
        "required": false
      },
      {
        "g": "ἀληθής, -ές",
        "e": "true, truthful, genuine",
        "required": true
      },
      {
        "g": "ἀσθενής, -ές",
        "e": "weak, sick",
        "required": true
      },
      {
        "g": "πᾶς, πᾶσα, πᾶν",
        "e": "all, every, whole",
        "required": true
      },
      {
        "g": "ἅπας, -ασα, -αν",
        "e": "all, every",
        "required": false
      },
      {
        "g": "εἷς μία ἕν",
        "e": "one, a single",
        "required": true
      },
      {
        "g": "οὐδείς, οὐδεμία, οὐδέν",
        "e": "no one, nothing",
        "required": true
      },
      {
        "g": "μηδείς, μηδεμία, μηδέν",
        "e": "no one, nothing (with μή)",
        "required": false
      },
      {
        "g": "Μωϋσῆς, -έως, ὁ",
        "e": "Moses",
        "required": true
      },
      {
        "g": "νοῦς, νοῦ, ὁ",
        "e": "mind",
        "required": false
      }
    ]
  },
  "14": {
    "label": "Chapter 14",
    "type": "chapter",
    "cards": [
      {
        "g": "ἁμαρτωλός, -όν",
        "e": "sinner",
        "required": true
      },
      {
        "g": "διδάσκαλος -ου, ὁ",
        "e": "teacher",
        "required": true
      },
      {
        "g": "θρόνος, -ου, ὁ",
        "e": "throne",
        "required": true
      },
      {
        "g": "Ἰάκωβος, -ου, ὁ",
        "e": "James",
        "required": false
      },
      {
        "g": "λίθος, -ου, ὁ",
        "e": "stone",
        "required": true
      },
      {
        "g": "πρεσβύτερος, -α, -ον",
        "e": "old person, elder",
        "required": true
      },
      {
        "g": "ἀμπελών, ἀμπελῶνος, ὁ",
        "e": "vineyard",
        "required": true
      },
      {
        "g": "εἰκών, εἰκόνος, ἡ",
        "e": "image",
        "required": false
      },
      {
        "g": "Ἕλλην, Ἕλληνος, ὁ",
        "e": "Greek",
        "required": false
      },
      {
        "g": "Καῖσαρ, Καίσαρος, ὁ",
        "e": "Caesar",
        "required": true
      },
      {
        "g": "κρίμα, κρίματος, τό",
        "e": "judgement",
        "required": true
      },
      {
        "g": "οὖς, ὠτός, τό",
        "e": "ear",
        "required": true
      },
      {
        "g": "παῖς, παιδός, ὁ",
        "e": "child, servant",
        "required": true
      },
      {
        "g": "παιδίον, -ου, τό",
        "e": "child, infant",
        "required": false
      },
      {
        "g": "σπέρμα, σπέρματος, τό",
        "e": "seed",
        "required": true
      },
      {
        "g": "βρῶμα, -ατος, τό",
        "e": "food",
        "required": true
      },
      {
        "g": "πάσχα, τό",
        "e": "Passover",
        "required": true
      },
      {
        "g": "ἀγοράζω",
        "e": "I buy",
        "required": false
      },
      {
        "g": "βλασφημέω",
        "e": "I blaspheme",
        "required": false
      },
      {
        "g": "διακονέω",
        "e": "I serve",
        "required": true
      },
      {
        "g": "διαλογίζομαι",
        "e": "I consider, argue, discuss",
        "required": false
      },
      {
        "g": "ἐλπίζω",
        "e": "I hope",
        "required": false
      },
      {
        "g": "ἑτοιμάζω",
        "e": "I prepare, make ready",
        "required": true
      },
      {
        "g": "κρατέω",
        "e": "I grasp, arrest",
        "required": true
      },
      {
        "g": "μισέω",
        "e": "I hate",
        "required": true
      },
      {
        "g": "πειράζω",
        "e": "I test, tempt",
        "required": true
      },
      {
        "g": "πράσσω",
        "e": "I do",
        "required": true
      },
      {
        "g": "προφητεύω",
        "e": "I prophesy",
        "required": false
      },
      {
        "g": "σκανδαλίζω",
        "e": "I cause to fall/sin",
        "required": false
      },
      {
        "g": "ὑποτάσσω",
        "e": "I subject",
        "required": true
      },
      {
        "g": "φυλάσσω",
        "e": "I guard",
        "required": false
      },
      {
        "g": "φωνέω",
        "e": "I call (out)",
        "required": true
      },
      {
        "g": "χαρίζομαι",
        "e": "I give freely",
        "required": false
      }
    ]
  },
  "15": {
    "label": "Chapter 15",
    "type": "chapter",
    "cards": [
      {
        "g": "διάβολος, -ου, ὁ",
        "e": "the slanderer, the devil",
        "required": false
      },
      {
        "g": "καρπός, -οῦ, ὁ",
        "e": "fruit",
        "required": true
      },
      {
        "g": "ναός, -οῦ, ὁ",
        "e": "sanctuary, shrine, temple",
        "required": true
      },
      {
        "g": "Φίλιππος, -ου, ὁ",
        "e": "Philip",
        "required": false
      },
      {
        "g": "φόβος, -ου, ὁ",
        "e": "fear",
        "required": true
      },
      {
        "g": "χρόνος, -ου, ὁ",
        "e": "time (period of)",
        "required": true
      },
      {
        "g": "ἀποκρίνομαι",
        "e": "I answer",
        "required": true
      },
      {
        "g": "βούλομαι",
        "e": "I wish",
        "required": true
      },
      {
        "g": "πορεύομαι",
        "e": "I go",
        "required": true
      },
      {
        "g": "ἐκπορεύομαι",
        "e": "I go out",
        "required": false
      },
      {
        "g": "φοβέομαι",
        "e": "I am afraid, fear",
        "required": true
      },
      {
        "g": "ἁγιάζω",
        "e": "I make holy",
        "required": true
      },
      {
        "g": "ἀσθενέω",
        "e": "I am weak, sick",
        "required": true
      },
      {
        "g": "βαστάζω",
        "e": "I take up",
        "required": false
      },
      {
        "g": "γαμέω",
        "e": "I marry",
        "required": true
      },
      {
        "g": "γνωρίζω",
        "e": "I make known",
        "required": false
      },
      {
        "g": "δουλεύω",
        "e": "I am a slave",
        "required": false
      },
      {
        "g": "ἐκχέω",
        "e": "I pour out",
        "required": false
      },
      {
        "g": "ἐνδύω",
        "e": "I dress",
        "required": true
      },
      {
        "g": "ἐπιστρέφω",
        "e": "I turn (back)",
        "required": true
      },
      {
        "g": "ἥκω",
        "e": "I have come, am present",
        "required": false
      },
      {
        "g": "ἰσχύω",
        "e": "I am strong",
        "required": true
      },
      {
        "g": "κελεύω",
        "e": "I command",
        "required": false
      },
      {
        "g": "κλαίω",
        "e": "I weep",
        "required": true
      },
      {
        "g": "κωλύω",
        "e": "I hinder",
        "required": false
      },
      {
        "g": "λυπέω",
        "e": "I grieve, pain",
        "required": false
      },
      {
        "g": "ὀμνύω",
        "e": "I swear, take an oath",
        "required": false
      },
      {
        "g": "περισσεύω",
        "e": "I exceed",
        "required": true
      },
      {
        "g": "τελέω",
        "e": "I finish, complete",
        "required": true
      },
      {
        "g": "ὑποστρέφω",
        "e": "I turn back, return",
        "required": true
      },
      {
        "g": "φαίνω",
        "e": "I shine, appear",
        "required": true
      },
      {
        "g": "φρονέω",
        "e": "I ponder",
        "required": false
      }
    ]
  },
  "16": {
    "label": "Chapter 16",
    "type": "chapter",
    "cards": [
      {
        "g": "ἀκοή, -ῆς, ἡ",
        "e": "fame, report",
        "required": false
      },
      {
        "g": "ἀσθένεια, -ας, ἡ",
        "e": "weakness, disease",
        "required": false
      },
      {
        "g": "διδαχή, -ῆς, ἡ",
        "e": "teaching (act and content)",
        "required": true
      },
      {
        "g": "ἑορτή, -ῆς, ἡ",
        "e": "festival",
        "required": false
      },
      {
        "g": "ἐπιστολή, -ῆς, ἡ",
        "e": "letter (correspondence)",
        "required": false
      },
      {
        "g": "θυσία, -ας, ἡ",
        "e": "offering, sacrifice",
        "required": true
      },
      {
        "g": "κώμη, -ης, ἡ",
        "e": "village",
        "required": true
      },
      {
        "g": "μάχαιρα, -ης, ἡ",
        "e": "sword",
        "required": true
      },
      {
        "g": "νεφέλη, -ης, ἡ",
        "e": "cloud",
        "required": false
      },
      {
        "g": "παρουσία, -ας, ἡ",
        "e": "presence, coming",
        "required": false
      },
      {
        "g": "περιτομή, -ῆς, ἡ",
        "e": "circumcision",
        "required": true
      },
      {
        "g": "πορνεία, -ας, ἡ",
        "e": "sexual immorality",
        "required": false
      },
      {
        "g": "προσευχή, -ῆς, ἡ",
        "e": "prayer",
        "required": true
      },
      {
        "g": "ὑπομονή, -ῆς, ἡ",
        "e": "patience",
        "required": true
      },
      {
        "g": "φυλή, -ῆς, ἡ",
        "e": "tribe, nation",
        "required": true
      },
      {
        "g": "χήρα, -ας, ἡ",
        "e": "widow",
        "required": true
      },
      {
        "g": "χώρα, -ας, ἡ",
        "e": "country(side)",
        "required": true
      },
      {
        "g": "τρεῖς",
        "e": "three",
        "required": true
      },
      {
        "g": "τέσσαρες",
        "e": "four",
        "required": true
      },
      {
        "g": "πέντε",
        "e": "five",
        "required": false
      },
      {
        "g": "ἕξ",
        "e": "six",
        "required": false
      },
      {
        "g": "ἑπτά",
        "e": "seven",
        "required": true
      },
      {
        "g": "ὀκτώ",
        "e": "eight",
        "required": false
      },
      {
        "g": "ἐννέα",
        "e": "nine",
        "required": false
      },
      {
        "g": "δέκα",
        "e": "ten",
        "required": false
      },
      {
        "g": "δώδεκα",
        "e": "twelve",
        "required": true
      },
      {
        "g": "ἑκατόν",
        "e": "one hundred",
        "required": false
      },
      {
        "g": "χιλιάς",
        "e": "one thousand",
        "required": false
      },
      {
        "g": "πρῶτος, -η, -ον",
        "e": "first",
        "required": true
      },
      {
        "g": "δεύτερος, -α, -ον",
        "e": "second",
        "required": true
      },
      {
        "g": "τρίτος, -η, -ον",
        "e": "third",
        "required": true
      },
      {
        "g": "οὐαί",
        "e": "woe",
        "required": true
      }
    ]
  },
  "17": {
    "label": "Chapter 17",
    "type": "chapter",
    "cards": [
      {
        "g": "ἄν",
        "e": "conditional particle",
        "required": true
      },
      {
        "g": "ἄχρι",
        "e": "until",
        "required": false
      },
      {
        "g": "ἵνα",
        "e": "in order that",
        "required": true
      },
      {
        "g": "ὅπως",
        "e": "in order that",
        "required": false
      },
      {
        "g": "ὅταν",
        "e": "whenever",
        "required": false
      },
      {
        "g": "ἐάν",
        "e": "alternative for ἄν",
        "required": true
      },
      {
        "g": "ἀγρός, -οῦ, ὁ",
        "e": "field",
        "required": true
      },
      {
        "g": "ἄνεμος, -ου, ὁ",
        "e": "wind",
        "required": false
      },
      {
        "g": "διάκονος, -ου, ὁ",
        "e": "servant",
        "required": true
      },
      {
        "g": "ἐχθρός, -ή, -όν",
        "e": "enemy",
        "required": true
      },
      {
        "g": "ἥλιος, -ου, ὁ",
        "e": "sun",
        "required": false
      },
      {
        "g": "οἶνος, -ου, ὁ",
        "e": "wine",
        "required": true
      },
      {
        "g": "ἀναιρέω",
        "e": "I take away, kill",
        "required": true
      },
      {
        "g": "κατηγορέω",
        "e": "I accuse",
        "required": false
      },
      {
        "g": "ὁμολογέω",
        "e": "I promise, confess",
        "required": false
      },
      {
        "g": "πτωχός, -ή, -όν",
        "e": "poor",
        "required": true
      },
      {
        "g": "γενεά, -ᾶς, ἡ",
        "e": "family, generation",
        "required": true
      },
      {
        "g": "γλῶσσα, -ης, ἡ",
        "e": "tongue, language",
        "required": true
      },
      {
        "g": "γραφή, -ῆς, ἡ",
        "e": "writing, scripture",
        "required": true
      },
      {
        "g": "διαθήκη, -ης, ἡ",
        "e": "covenant, last will and testament",
        "required": false
      },
      {
        "g": "διακονία, -ας, ἡ",
        "e": "service, ministry",
        "required": false
      },
      {
        "g": "ἐπαγγελία, -ας, ἡ",
        "e": "promise",
        "required": true
      },
      {
        "g": "ἐπιθυμία, -ας, ἡ",
        "e": "desire",
        "required": false
      },
      {
        "g": "θύρα, -ας, ἡ",
        "e": "door",
        "required": false
      },
      {
        "g": "Ἰουδαία, -ας, ἡ",
        "e": "Judea",
        "required": false
      },
      {
        "g": "μαρτυρία, -ας, ἡ",
        "e": "testimony, witness",
        "required": true
      },
      {
        "g": "ὀργή, -ῆς, ἡ",
        "e": "anger, wrath",
        "required": false
      },
      {
        "g": "σοφία, -ας, ἡ",
        "e": "wisdom",
        "required": true
      },
      {
        "g": "σωτηρία, -ας, ἡ",
        "e": "salvation",
        "required": true
      },
      {
        "g": "τιμή, -ῆς, ἡ",
        "e": "price, value, honour",
        "required": false
      },
      {
        "g": "φυλακή, -ῆς, ἡ",
        "e": "watch (guards), prison",
        "required": true
      },
      {
        "g": "χρεία, -ας, ἡ",
        "e": "need",
        "required": false
      }
    ]
  },
  "18": {
    "label": "Chapter 18",
    "type": "chapter",
    "cards": [
      {
        "g": "ἄξιος, -α, -ον",
        "e": "worthy",
        "required": false
      },
      {
        "g": "δεξιός, -ά, -όν",
        "e": "right (hand)",
        "required": true
      },
      {
        "g": "δυνατός, -ή, -όν",
        "e": "powerful, capable, able",
        "required": true
      },
      {
        "g": "ἐλεύθερος, -α, -ον",
        "e": "free",
        "required": false
      },
      {
        "g": "ἔσχατος, -η, -ον",
        "e": "last, least",
        "required": true
      },
      {
        "g": "ἱκανός, -ή, -όν",
        "e": "sufficient",
        "required": true
      },
      {
        "g": "ἰσχυρός, -ά, -όν",
        "e": "strong",
        "required": false
      },
      {
        "g": "λευκός, -ή, -όν",
        "e": "white, bright",
        "required": false
      },
      {
        "g": "λοιπός, -ή, -όν",
        "e": "remaining",
        "required": true
      },
      {
        "g": "μέσος, -η, -ον",
        "e": "middle",
        "required": true
      },
      {
        "g": "νέος, -α, -ον",
        "e": "new, young",
        "required": false
      },
      {
        "g": "ὀλίγος, -η, -ον",
        "e": "small, little (pl. few)",
        "required": false
      },
      {
        "g": "πλούσιος, -α, -ον",
        "e": "rich",
        "required": false
      },
      {
        "g": "πνευματικός, -ή, -όν",
        "e": "spiritual",
        "required": false
      },
      {
        "g": "φίλος, -ή, -όν",
        "e": "loved, friendly, friend",
        "required": true
      },
      {
        "g": "μάρτυς, μάρτυρος, ὁ",
        "e": "witness",
        "required": true
      },
      {
        "g": "μισθός, -οῦ, ὁ",
        "e": "pay, wages",
        "required": true
      },
      {
        "g": "σταυρός, -οῦ, ὁ",
        "e": "cross",
        "required": true
      },
      {
        "g": "αὐξάνω",
        "e": "I grow",
        "required": false
      },
      {
        "g": "καθαρίζω",
        "e": "I make/declare clean",
        "required": false
      },
      {
        "g": "καθίζω",
        "e": "I cause to sit down",
        "required": true
      },
      {
        "g": "δύναμαι",
        "e": "I can, I am able",
        "required": true
      },
      {
        "g": "κάθημαι",
        "e": "I sit (down)",
        "required": true
      },
      {
        "g": "κεῖμαι",
        "e": "I lie, recline",
        "required": false
      },
      {
        "g": "οἶδα",
        "e": "I know",
        "required": true
      },
      {
        "g": "πάρειμι",
        "e": "I am present",
        "required": false
      },
      {
        "g": "ὥστε",
        "e": "with the result that",
        "required": true
      },
      {
        "g": "ἀδικέω",
        "e": "I do wrong",
        "required": true
      },
      {
        "g": "ἀδικία, -ας, ἡ",
        "e": "wrongdoing",
        "required": false
      },
      {
        "g": "καθαρός, -ά, -όν",
        "e": "clean, pure",
        "required": true
      },
      {
        "g": "ἀκάθαρτος, -ον",
        "e": "impure, unclean",
        "required": true
      },
      {
        "g": "ἄπιστος, -ον",
        "e": "unbelieving, faithless",
        "required": false
      }
    ]
  },
  "19": {
    "label": "Chapter 19",
    "type": "chapter",
    "cards": [
      {
        "g": "δίδωμι",
        "e": "I give",
        "required": true
      },
      {
        "g": "ἀποδίδωμι",
        "e": "I give away",
        "required": false
      },
      {
        "g": "παραδίδωμι",
        "e": "I hand over, entrust",
        "required": true
      },
      {
        "g": "ἵστημι",
        "e": "I cause to stand, stand",
        "required": true
      },
      {
        "g": "ἀνίστημι",
        "e": "I raise",
        "required": true
      },
      {
        "g": "παρίστημι",
        "e": "I place beside",
        "required": false
      },
      {
        "g": "τίθημι",
        "e": "I put, place",
        "required": true
      },
      {
        "g": "ἐπιτίθημι",
        "e": "I put, place upon",
        "required": false
      },
      {
        "g": "ἀφίημι",
        "e": "I leave, forgive, dismiss",
        "required": false
      },
      {
        "g": "συνίημι",
        "e": "I understand",
        "required": true
      },
      {
        "g": "ἀπόλλυμι",
        "e": "I ruin, destroy",
        "required": true
      },
      {
        "g": "δείκνυμι",
        "e": "I point out, show",
        "required": false
      },
      {
        "g": "πίμπλημι",
        "e": "I fulfil",
        "required": false
      },
      {
        "g": "φημί",
        "e": "I say",
        "required": false
      },
      {
        "g": "δικαιόω",
        "e": "I justify",
        "required": false
      },
      {
        "g": "πληρόω",
        "e": "I fulfil, fill, complete",
        "required": true
      },
      {
        "g": "σταυρόω",
        "e": "I crucify",
        "required": true
      },
      {
        "g": "τελειόω",
        "e": "I accomplish, complete",
        "required": false
      },
      {
        "g": "φανερόω",
        "e": "I reveal, make known",
        "required": true
      },
      {
        "g": "ἀγαπάω",
        "e": "I love",
        "required": true
      },
      {
        "g": "γεννάω",
        "e": "I bear (beget)",
        "required": true
      },
      {
        "g": "διψάω",
        "e": "I thirst (for)",
        "required": false
      },
      {
        "g": "ἐρωτάω",
        "e": "I ask",
        "required": true
      },
      {
        "g": "ἐπερωτάω",
        "e": "I ask (for)",
        "required": false
      },
      {
        "g": "ζάω",
        "e": "I live",
        "required": true
      },
      {
        "g": "ἰάομαι",
        "e": "I heal",
        "required": false
      },
      {
        "g": "κοπιάω",
        "e": "I labour",
        "required": false
      },
      {
        "g": "νικάω",
        "e": "I overcome",
        "required": false
      },
      {
        "g": "πεινάω",
        "e": "I hunger",
        "required": false
      },
      {
        "g": "πλανάω",
        "e": "I deceive, lead astray",
        "required": true
      },
      {
        "g": "τιμάω",
        "e": "I honour, value",
        "required": true
      },
      {
        "g": "ἐπιτιμάω",
        "e": "I rebuke",
        "required": false
      }
    ]
  },
  "20": {
    "label": "Chapter 20",
    "type": "chapter",
    "cards": [
      {
        "g": "ἀληθῶς",
        "e": "truly",
        "required": false
      },
      {
        "g": "ἐλάχιστος, -η, -ον",
        "e": "smallest, least",
        "required": true
      },
      {
        "g": "εὖ",
        "e": "well",
        "required": false
      },
      {
        "g": "κρείσσων, -ον",
        "e": "better",
        "required": true
      },
      {
        "g": "μάλιστα",
        "e": "most of all",
        "required": false
      },
      {
        "g": "μᾶλλον",
        "e": "more, rather",
        "required": true
      },
      {
        "g": "μικρόν",
        "e": "a little, a short time",
        "required": false
      },
      {
        "g": "μικρός, -ά, -όν",
        "e": "small",
        "required": true
      },
      {
        "g": "χεῖρον",
        "e": "worse",
        "required": false
      },
      {
        "g": "ζῷον, -ου, τό",
        "e": "living thing",
        "required": true
      },
      {
        "g": "θυσιαστήριον, -ου, τό",
        "e": "altar",
        "required": true
      },
      {
        "g": "ποιμήν, ποιμένος, ὁ",
        "e": "shepherd",
        "required": false
      },
      {
        "g": "θεάομαι",
        "e": "I see, look at",
        "required": false
      },
      {
        "g": "καυχάω / καυχάομαι",
        "e": "I boast",
        "required": true
      },
      {
        "g": "μιμνῄσκομαι",
        "e": "I remember",
        "required": true
      },
      {
        "g": "νίπτω",
        "e": "I wash",
        "required": false
      }
    ]
  }
};

const SESSIONS = [
  {
    "id": "wk1t",
    "tag": "Week 1",
    "label": "Chapters 1-3",
    "sets": [
      "1",
      "2",
      "3",
      "W1O",
      "W1_LUO_PRESENT_ACTIVE",
      "W1_PHILEO_PRESENT_ACTIVE",
      "W1_LOGOS_DECLENSION",
      "W1_ARCHE_DECLENSION",
      "W1_ERGON_DECLENSION",
      "W1_HEMERA_DECLENSION",
      "W1_DOXA_DECLENSION",
      "W1_AUTOS_PARADIGM",
      "W1_EIMI_PRESENT",
      "W1_ADJ_PARADIGMS"
    ],
    "special": false,
    "summary": "Alphabet · λύω / φιλέω · article / noun patterns"
  },
  {
    "id": "wk1f",
    "tag": "Week 1",
    "label": "Chapters 4-5",
    "sets": [
      "4",
      "5",
      "W1O",
      "W1_LUO_PRESENT_ACTIVE",
      "W1_PHILEO_PRESENT_ACTIVE",
      "W1_LOGOS_DECLENSION",
      "W1_ARCHE_DECLENSION",
      "W1_ERGON_DECLENSION",
      "W1_HEMERA_DECLENSION",
      "W1_DOXA_DECLENSION",
      "W1_AUTOS_PARADIGM",
      "W1_EIMI_PRESENT",
      "W1_ADJ_PARADIGMS"
    ],
    "special": false,
    "summary": "Cases / adjectives · αὐτός · εἰμί"
  },
  {
    "id": "wk2t",
    "tag": "Week 2",
    "label": "Chapter 6",
    "sets": [
      "6",
      "W2_LUO_INDICATIVE",
      "W2_PHILEO_INDICATIVE",
      "W2_LUO_ACTIVE_IMPERATIVE",
      "W2_LUO_ACTIVE_INFINITIVE",
      "W2_LUO_ACTIVE_PARTICIPLE",
      "W2_PHILEO_ACTIVE_PARTICIPLE"
    ],
    "special": false,
    "summary": "Indicative paradigms · contract indicative"
  },
  {
    "id": "wk2f",
    "tag": "Week 2",
    "label": "Chapter 7",
    "sets": [
      "7",
      "W2_LUO_INDICATIVE",
      "W2_PHILEO_INDICATIVE",
      "W2_LUO_ACTIVE_IMPERATIVE",
      "W2_LUO_ACTIVE_INFINITIVE",
      "W2_LUO_ACTIVE_PARTICIPLE",
      "W2_PHILEO_ACTIVE_PARTICIPLE"
    ],
    "special": false,
    "summary": "Moods · imperative · active participles"
  },
  {
    "id": "wk3t",
    "tag": "Week 3",
    "label": "Chapter 8",
    "sets": [
      "8",
      "W3O",
      "W3_RHUOMAI_INDICATIVE",
      "W3_RHUOMAI_OTHER_MOODS",
      "W3_EIMI_COMPLETE",
      "W3_EIMI_INFINITIVE_PARTICIPLE",
      "W3_EKEINOS",
      "W3_HOUTOS",
      "W3_PERSONAL_PRONOUNS"
    ],
    "special": false,
    "summary": "Middle voice · εἰμί infinitive / participle"
  },
  {
    "id": "wk3f",
    "tag": "Week 3",
    "label": "Chapter 9",
    "sets": [
      "9",
      "W3O",
      "W3_RHUOMAI_INDICATIVE",
      "W3_RHUOMAI_OTHER_MOODS",
      "W3_EIMI_COMPLETE",
      "W3_EIMI_INFINITIVE_PARTICIPLE",
      "W3_EKEINOS",
      "W3_HOUTOS",
      "W3_PERSONAL_PRONOUNS"
    ],
    "special": false,
    "summary": "Demonstratives · personal pronouns"
  },
  {
    "id": "wk4t",
    "tag": "Week 4",
    "label": "Chapters 10-11",
    "sets": [
      "10",
      "11",
      "W4_RELATIVE_PRONOUN",
      "W4_SECOND_AORIST_STEMS",
      "W4_BALLO_SECOND_AORIST",
      "W4_GINOMAI_SECOND_AORIST",
      "W4_LAMBANO_SECOND_AORIST",
      "W4_LEIPO_SECOND_AORIST",
      "W4_FUTURE_LIQUID_STEMS"
    ],
    "special": false,
    "summary": "Relative pronouns · second aorist · liquid futures"
  },
  {
    "id": "mt",
    "tag": "Mid-Term Prep",
    "label": "Chapters 1-11",
    "sets": [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "W1O",
      "W2_LUO_INDICATIVE",
      "W2_PHILEO_INDICATIVE",
      "W2_LUO_ACTIVE_IMPERATIVE",
      "W2_LUO_ACTIVE_INFINITIVE",
      "W2_LUO_ACTIVE_PARTICIPLE",
      "W2_PHILEO_ACTIVE_PARTICIPLE",
      "W3O",
      "W3_RHUOMAI_INDICATIVE",
      "W3_RHUOMAI_OTHER_MOODS",
      "W3_EIMI_COMPLETE",
      "W3_EIMI_INFINITIVE_PARTICIPLE",
      "W3_EKEINOS",
      "W3_HOUTOS",
      "W3_PERSONAL_PRONOUNS",
      "W4_RELATIVE_PRONOUN",
      "W4_SECOND_AORIST_STEMS",
      "W4_BALLO_SECOND_AORIST",
      "W4_GINOMAI_SECOND_AORIST",
      "W4_LAMBANO_SECOND_AORIST",
      "W4_LEIPO_SECOND_AORIST",
      "W4_FUTURE_LIQUID_STEMS"
    ],
    "special": true,
    "summary": "Weeks 1–4 chapters"
  },
  {
    "id": "wk5t",
    "tag": "Week 5",
    "label": "Chapters 12-13",
    "sets": [
      "12",
      "13",
      "W5_SARX",
      "W5_ONOMA",
      "W5_TIS",
      "W5_PLEION",
      "W5_ASTER",
      "W5_POLIS",
      "W5_BASILEUS",
      "W5_PAS"
    ],
    "special": false,
    "summary": "Third declension stems · second / third declension"
  },
  {
    "id": "wk5f",
    "tag": "Week 5",
    "label": "Chapter 14",
    "sets": [
      "14",
      "W5_LUO_PRESENT_ACTIVE_PARTICIPLE",
      "W5_LUO_AORIST_ACTIVE_PARTICIPLE",
      "W5_RHUOMAI_PRESENT_MIDDLE_PARTICIPLE",
      "W5_RHUOMAI_AORIST_MIDDLE_PARTICIPLE"
    ],
    "special": false,
    "summary": "Participial paradigms"
  },
  {
    "id": "wk6t",
    "tag": "Week 6",
    "label": "Chapter 15",
    "sets": [
      "15",
      "W6O",
      "W6_LUO_PASSIVE_INDICATIVE",
      "W6_LUO_PASSIVE_OTHER_MOODS",
      "W6_LUTHEIS_PARTICIPLE"
    ],
    "special": false,
    "summary": "Passive endings · passive moods / participles"
  },
  {
    "id": "wk6f",
    "tag": "Week 6",
    "label": "Chapter 16",
    "sets": [
      "16",
      "W6O",
      "W6_LUO_PERFECT",
      "W6_LUO_PLUPERFECT"
    ],
    "special": false,
    "summary": "Perfect · pluperfect · irregular passive forms"
  },
  {
    "id": "wk7t",
    "tag": "Week 7",
    "label": "Chapter 17",
    "sets": [
      "17",
      "W7O",
      "W7_SUBJUNCTIVE_MOOD"
    ],
    "special": false,
    "summary": "Subjunctive mood · aspect"
  },
  {
    "id": "wk7f",
    "tag": "Week 7",
    "label": "Chapter 18",
    "sets": [
      "18",
      "W7O",
      "W7_INDEFINITE_CONSTRUCTIONS",
      "W7_THIRD_PERSON_IMPERATIVE"
    ],
    "special": false,
    "summary": "Indefinite constructions · 3rd person imperative"
  },
  {
    "id": "wk8t",
    "tag": "Week 8",
    "label": "Chapter 19",
    "sets": [
      "19",
      "W8O",
      "W8_TITHEMI_PRESENT_INDICATIVE",
      "W8_HISTEMI_PRESENT_INDICATIVE",
      "W8_DIDOMI_PRESENT_INDICATIVE",
      "W8_TITHEMI_PRESENT_SUBJUNCTIVE",
      "W8_HISTEMI_PRESENT_SUBJUNCTIVE",
      "W8_DIDOMI_PRESENT_SUBJUNCTIVE",
      "W8_MI_OTHER_ACTIVE_FORMS"
    ],
    "special": false,
    "summary": "-μι present active verbs"
  },
  {
    "id": "wk8f",
    "tag": "Week 8",
    "label": "Chapter 20",
    "sets": [
      "20",
      "W8O",
      "W8_DIDOMI_TENSES",
      "W8_DIDOMAI_PRESENT"
    ],
    "special": false,
    "summary": "-μι other tenses · middle voice"
  },
  {
    "id": "all",
    "tag": "Final Exam Prep",
    "label": "All Chapters 1-20",
    "sets": [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "W1O",
      "W1_LUO_PRESENT_ACTIVE",
      "W1_PHILEO_PRESENT_ACTIVE",
      "W1_LOGOS_DECLENSION",
      "W1_ARCHE_DECLENSION",
      "W1_ERGON_DECLENSION",
      "W1_HEMERA_DECLENSION",
      "W1_DOXA_DECLENSION",
      "W1_AUTOS_PARADIGM",
      "W1_EIMI_PRESENT",
      "W1_ADJ_PARADIGMS",
      "W2_LUO_INDICATIVE",
      "W2_PHILEO_INDICATIVE",
      "W2_LUO_ACTIVE_IMPERATIVE",
      "W2_LUO_ACTIVE_INFINITIVE",
      "W2_LUO_ACTIVE_PARTICIPLE",
      "W2_PHILEO_ACTIVE_PARTICIPLE",
      "W3O",
      "W3_RHUOMAI_INDICATIVE",
      "W3_RHUOMAI_OTHER_MOODS",
      "W3_EIMI_COMPLETE",
      "W3_EIMI_INFINITIVE_PARTICIPLE",
      "W3_EKEINOS",
      "W3_HOUTOS",
      "W3_PERSONAL_PRONOUNS",
      "W4_RELATIVE_PRONOUN",
      "W4_SECOND_AORIST_STEMS",
      "W4_BALLO_SECOND_AORIST",
      "W4_GINOMAI_SECOND_AORIST",
      "W4_LAMBANO_SECOND_AORIST",
      "W4_LEIPO_SECOND_AORIST",
      "W4_FUTURE_LIQUID_STEMS",
      "W5_SARX",
      "W5_ONOMA",
      "W5_TIS",
      "W5_PLEION",
      "W5_ASTER",
      "W5_POLIS",
      "W5_BASILEUS",
      "W5_PAS",
      "W5_LUO_PRESENT_ACTIVE_PARTICIPLE",
      "W5_LUO_AORIST_ACTIVE_PARTICIPLE",
      "W5_RHUOMAI_PRESENT_MIDDLE_PARTICIPLE",
      "W5_RHUOMAI_AORIST_MIDDLE_PARTICIPLE",
      "W6O",
      "W6_LUO_PASSIVE_INDICATIVE",
      "W6_LUO_PASSIVE_OTHER_MOODS",
      "W6_LUTHEIS_PARTICIPLE",
      "W6_LUO_PERFECT",
      "W6_LUO_PLUPERFECT",
      "W7O",
      "W7_SUBJUNCTIVE_MOOD",
      "W7_INDEFINITE_CONSTRUCTIONS",
      "W7_THIRD_PERSON_IMPERATIVE",
      "W8O",
      "W8_TITHEMI_PRESENT_INDICATIVE",
      "W8_HISTEMI_PRESENT_INDICATIVE",
      "W8_DIDOMI_PRESENT_INDICATIVE",
      "W8_TITHEMI_PRESENT_SUBJUNCTIVE",
      "W8_HISTEMI_PRESENT_SUBJUNCTIVE",
      "W8_DIDOMI_PRESENT_SUBJUNCTIVE",
      "W8_MI_OTHER_ACTIVE_FORMS",
      "W8_DIDOMI_TENSES",
      "W8_DIDOMAI_PRESENT"
    ],
    "special": true,
    "summary": "Ch. 1–20"
  }
];

if (!SETS.EXTRA) {
  SETS.EXTRA = {
    label: 'Extra Review',
    type: 'other',
    week: null,
    cards: []
  };
}

window.SETS = SETS;
window.SESSIONS = SESSIONS;
