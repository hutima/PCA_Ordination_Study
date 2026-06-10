// Reader translation drills — short Greek -> English MCQs per chapter,
// plus literal translations for selected Textus Receptus verses already
// shown in the reader. Greek -> English only, since the course emphasises
// reading rather than active production.
//
// Difficulty levels:
//   1 = English-like word order, short sentence
//   2 = mild Greek reordering (verb-first, fronted phrase)
//   3 = Greek-style word order: object/genitive fronted, postpositives,
//       embedded modifiers, or a participle / subordinate clause
//
// Vocabulary in each sentence is restricted to words and grammar
// introduced through that chapter of Duff. Each sentence includes a
// short note explaining the construction or a common pitfall.

(function () {
  const READER_TRANSLATION_SETS = {
    2: {
      sentences: [
        {
          g: 'ὁ ἀδελφὸς ἀκούει.',
          level: 1,
          en: 'The brother hears.',
          choices: [
            'The brother hears.',
            'The brothers hear.',
            'The brother heard.',
            'The brother speaks.'
          ],
          note: 'Plain SV: nominative subject (ὁ ἀδελφός) + 3rd-sg PAI verb. The verb already encodes its own person.'
        },
        {
          g: 'ὁ θεὸς λέγει.',
          level: 1,
          en: 'God speaks.',
          choices: [
            'God speaks.',
            'God hears.',
            'God spoke.',
            'A god speaks.'
          ],
          note: 'ὁ θεός — article + nominative is normal even for proper-feeling nouns. λέγει is 3rd-sg PAI.'
        },
        {
          g: 'ὁ δοῦλος βλέπει τὸν κύριον.',
          level: 1,
          en: 'The slave sees the master.',
          choices: [
            'The slave sees the master.',
            'The master sees the slave.',
            'The slave hears the master.',
            'The slaves see the master.'
          ],
          note: 'Subject (ὁ δοῦλος, nom.) + verb (3rd-sg PAI) + object (τὸν κύριον, acc.). Standard SVO.'
        },
        {
          g: 'οὐ διδάσκει ὁ ἀδελφὸς τὸν δοῦλον.',
          level: 2,
          en: 'The brother does not teach the slave.',
          choices: [
            'The brother does not teach the slave.',
            'The slave does not teach the brother.',
            'The brother teaches the slave.',
            'The brother does not call the slave.'
          ],
          note: 'Verb-first order is normal Greek. οὐ negates the indicative; case endings (-ος / -ον) — not position — mark subject and object.'
        },
        {
          g: 'ἔχει ὁ θεὸς τὸν λόγον.',
          level: 2,
          en: 'God has the word.',
          choices: [
            'God has the word.',
            'The word has God.',
            'A god holds the word.',
            'God will have the word.'
          ],
          note: 'V-S-O order. Endings (-ος nom., -ον acc.) determine roles, not position.'
        },
        {
          g: 'τὸν Χριστὸν καλεῖ κύριον ὁ ὄχλος.',
          level: 2,
          en: 'The crowd calls Christ "Lord".',
          choices: [
            'The crowd calls Christ "Lord".',
            'The Lord calls the crowd Christ.',
            'Christ calls the crowd "Lord".',
            'The crowd calls "Lord Christ".'
          ],
          note: 'καλέω + double accusative ("call X Y"). Object (τὸν Χριστόν) fronted; subject (ὁ ὄχλος, nom.) follows the verb. καλεῖ = καλέ-ει contracted.'
        },
        {
          g: 'τὸν λόγον ἀκούουσιν οἱ ἄνθρωποι.',
          level: 3,
          en: 'The people hear the word.',
          choices: [
            'The people hear the word.',
            'The word hears the people.',
            'The people speak the word.',
            'The man hears the words.'
          ],
          note: 'Object phrase fronted (τὸν λόγον). Verb (ἀκούουσι, 3rd-pl PAI; movable nu). Subject (οἱ ἄνθρωποι, nom. pl.) at the end.'
        },
        {
          g: 'τὸν Χριστὸν φιλοῦσιν οἱ ἀδελφοί.',
          level: 3,
          en: 'The brothers love Christ.',
          choices: [
            'The brothers love Christ.',
            'Christ loves the brothers.',
            'Christ loves the brother.',
            'The brothers seek Christ.'
          ],
          note: 'Object fronted (τὸν Χριστόν). φιλέω contracts: φιλέ-ουσι → φιλοῦσι. Subject (οἱ ἀδελφοί, nom. pl.) at the end.'
        },
        {
          g: 'τὸν λόγον τοῦ θεοῦ τηροῦσιν οἱ δοῦλοι.',
          level: 3,
          en: 'The slaves keep the word of God.',
          choices: [
            'The slaves keep the word of God.',
            'God keeps the word of the slaves.',
            'The slaves speak the word of God.',
            'God\'s word keeps the slaves.'
          ],
          note: 'Object phrase + genitive modifier fronted (τὸν λόγον τοῦ θεοῦ); verb (τηροῦσι = τηρέ-ουσι contracted) + subject (οἱ δοῦλοι) at the end.'
        },
        {
          g: 'ὁ ἄγγελος βάλλει τὸν ἄρτον.',
          level: 1,
          en: 'The angel throws the bread.',
          choices: [
            'The angel throws the bread.',
            'The bread throws the angel.',
            'The angels throw the bread.',
            'The angel throws the loaves.'
          ],
          note: 'SVO. ὁ ἄγγελος (nom.) + 3rd-sg PAI + τὸν ἄρτον (acc.). Singular endings (-ος / -ον) distinguish subject and object.'
        },
        {
          g: 'ὁ υἱὸς ζητεῖ τὸν ἀδελφόν.',
          level: 1,
          en: 'The son seeks the brother.',
          choices: [
            'The son seeks the brother.',
            'The brother seeks the son.',
            'The son sees the brother.',
            'The sons seek the brother.'
          ],
          note: 'ζητεῖ = ζητέ-ει contracted (ε + ει → ει). Subject ὁ υἱός, object τὸν ἀδελφόν.'
        },
        {
          g: 'φιλεῖ ὁ θεὸς τὸν κόσμον.',
          level: 2,
          en: 'God loves the world.',
          choices: [
            'God loves the world.',
            'The world loves God.',
            'A god loves a world.',
            'God loves the people.'
          ],
          note: 'V-S-O order. φιλεῖ (3rd-sg PAI of φιλέω, ε + ει → ει contraction). Endings — not position — fix the subject (ὁ θεός, nom.) and object (τὸν κόσμον, acc.).'
        },
        {
          g: 'διδάσκει ὁ Χριστὸς τὸν λαόν.',
          level: 2,
          en: 'Christ teaches the people.',
          choices: [
            'Christ teaches the people.',
            'The people teach Christ.',
            'Christ teaches a people.',
            'Christ taught the people.'
          ],
          note: 'Verb-first VSO. ὁ Χριστός (nom.) + τὸν λαόν (acc.). λαός is masc. 2nd-decl. like λόγος.'
        },
        {
          g: 'τὸν ἄρτον τοῦ κυρίου λαμβάνει ὁ δοῦλος.',
          level: 3,
          en: 'The slave takes the master\'s bread.',
          choices: [
            'The slave takes the master\'s bread.',
            'The master takes the slave\'s bread.',
            'The slave gives bread to the master.',
            'The slave\'s master takes bread.'
          ],
          note: 'Object phrase with genitive modifier (τὸν ἄρτον τοῦ κυρίου) is fronted; verb + subject (ὁ δοῦλος) follow. Endings carry the case roles regardless of position.'
        },
        {
          g: 'οὐ φιλεῖ ὁ κόσμος τὸν Χριστόν.',
          level: 3,
          en: 'The world does not love Christ.',
          choices: [
            'The world does not love Christ.',
            'Christ does not love the world.',
            'The world loves Christ.',
            'Christ is not loved by the world.'
          ],
          note: 'οὐ before consonant negates the indicative. Word order V-S-O; cases (-ος / -όν) — not position — fix who loves whom.'
        }
      ]
    },

    3: {
      sentences: [
        {
          g: 'ὁ Ἰησοῦς ἀκούει τὴν φωνήν.',
          level: 1,
          en: 'Jesus hears the voice.',
          choices: [
            'Jesus hears the voice.',
            'The voice hears Jesus.',
            'Jesus speaks the voice.',
            'Jesus heard the voice.'
          ],
          note: 'SVO. ὁ Ἰησοῦς is nominative (subject); τὴν φωνήν is accusative (direct object). 1st-decl fem noun (-η).'
        },
        {
          g: 'ὁ Πέτρος βλέπει τὸ τέκνον.',
          level: 1,
          en: 'Peter sees the child.',
          choices: [
            'Peter sees the child.',
            'The child sees Peter.',
            'Peter sees the children.',
            'Peter calls the child.'
          ],
          note: 'Neuter 2-decl noun: τὸ τέκνον (nom. or acc., same form). Context (object of βλέπει) makes it accusative.'
        },
        {
          g: 'ὁ Παῦλος πιστεύει τῷ Ἰησοῦ.',
          level: 1,
          en: 'Paul believes Jesus.',
          choices: [
            'Paul believes Jesus.',
            'Jesus believes Paul.',
            'Paul speaks to Jesus.',
            'Paul does not believe Jesus.'
          ],
          note: 'πιστεύω governs the dative: τῷ Ἰησοῦ ("[in / to] Jesus"). English renders this as a direct object.'
        },
        {
          g: 'βλέπει αὐτὸν ὁ ἄγγελος.',
          level: 2,
          en: 'The angel sees him.',
          choices: [
            'The angel sees him.',
            'He sees the angel.',
            'The angels see him.',
            'The angel hears him.'
          ],
          note: 'V-O-S. αὐτόν (acc. sg. masc.) is the object pronoun ("him"). Subject (ὁ ἄγγελος) at the end.'
        },
        {
          g: 'τὸ εὐαγγέλιον λέγει αὐτοῖς ὁ Παῦλος.',
          level: 2,
          en: 'Paul speaks the gospel to them.',
          choices: [
            'Paul speaks the gospel to them.',
            'They speak the gospel to Paul.',
            'Paul hears the gospel from them.',
            'Paul speaks them the gospels.'
          ],
          note: 'Object fronted (τὸ εὐαγγέλιον, neut. acc.). αὐτοῖς is dative pl. masc. ("to them"), the indirect object.'
        },
        {
          g: 'ὁ Πέτρος καλεῖ τὴν ἀδελφὴν αὐτοῦ.',
          level: 2,
          en: 'Peter calls his sister.',
          choices: [
            'Peter calls his sister.',
            'His sister calls Peter.',
            'Peter calls the sisters.',
            'Peter calls her sister.'
          ],
          note: 'αὐτοῦ (gen. sg. masc., "his") attaches to τὴν ἀδελφήν as a possessive. Article + noun + αὐτοῦ is one of the regular ways to express possession.'
        },
        {
          g: 'τὴν φωνὴν τοῦ Ἰησοῦ ἀκούει ὁ ὄχλος.',
          level: 3,
          en: 'The crowd hears the voice of Jesus.',
          choices: [
            'The crowd hears the voice of Jesus.',
            'Jesus hears the voice of the crowd.',
            'The voice of the crowd hears Jesus.',
            'The crowd speaks Jesus\' voice.'
          ],
          note: 'Object phrase + genitive modifier fronted (τὴν φωνὴν τοῦ Ἰησοῦ). Verb + subject (ὁ ὄχλος) at the end.'
        },
        {
          g: 'τὰ τέκνα τῆς ἀδελφῆς πιστεύει τῷ θεῷ.',
          level: 3,
          en: 'The sister\'s children believe God.',
          choices: [
            'The sister\'s children believe God.',
            'God believes the sister\'s children.',
            'The children of God believe the sister.',
            'The sister\'s children see God.'
          ],
          note: 'Neuter-plural subject (τὰ τέκνα) takes a singular verb in Koine — a regular pattern. πιστεύω + dative.'
        },
        {
          g: 'τὸν λόγον τοῦ θεοῦ διδάσκει αὐτοὺς ὁ Παῦλος.',
          level: 3,
          en: 'Paul teaches them the word of God.',
          choices: [
            'Paul teaches them the word of God.',
            'They teach Paul the word of God.',
            'Paul learns from them the word of God.',
            'God\'s word teaches Paul.'
          ],
          note: 'Object phrase + genitive modifier fronted (τὸν λόγον τοῦ θεοῦ). αὐτούς is acc. pl. masc. ("them"). Subject (ὁ Παῦλος) at the end.'
        },
        {
          g: 'ἡ καρδία αὐτοῦ ἀκούει τὸν λόγον.',
          level: 1,
          en: 'His heart hears the word.',
          choices: [
            'His heart hears the word.',
            'He hears the word with his heart.',
            'The word hears his heart.',
            'His heart speaks the word.'
          ],
          note: 'ἡ καρδία (1st-decl. fem. -ια). αὐτοῦ (gen. sg. masc.) attaches to καρδία as a possessive ("his").'
        },
        {
          g: 'τὸ τέκνον φιλεῖ τὴν ἀδελφήν.',
          level: 1,
          en: 'The child loves the sister.',
          choices: [
            'The child loves the sister.',
            'The sister loves the child.',
            'The children love the sister.',
            'The child calls the sister.'
          ],
          note: 'Neut. 2nd-decl. subject τὸ τέκνον (nom./acc. same form; here nom. since it is the subject). τὴν ἀδελφήν is acc. fem. (1st-decl. -η).'
        },
        {
          g: 'τῷ Παύλῳ λέγει ὁ Πέτρος.',
          level: 2,
          en: 'Peter speaks to Paul.',
          choices: [
            'Peter speaks to Paul.',
            'Paul speaks to Peter.',
            'Peter calls Paul.',
            'Paul listens to Peter.'
          ],
          note: 'Dative of indirect object fronted (τῷ Παύλῳ). λέγω + dat. of person addressed = "speak to X". Subject (ὁ Πέτρος) at the end.'
        },
        {
          g: 'ἔχει ὁ ἄγγελος τὴν δόξαν τοῦ θεοῦ.',
          level: 2,
          en: 'The angel has the glory of God.',
          choices: [
            'The angel has the glory of God.',
            'God has the angel\'s glory.',
            'The angel\'s glory has God.',
            'The angel of glory has God.'
          ],
          note: 'V-S-O with embedded genitive. δόξα is 1st-decl. fem. (-α impure → gen. sg. -ης). τοῦ θεοῦ modifies τὴν δόξαν.'
        },
        {
          g: 'τὰ ἔργα τοῦ θεοῦ βλέπει ὁ λαός.',
          level: 3,
          en: 'The people see the works of God.',
          choices: [
            'The people see the works of God.',
            'God\'s people see the work.',
            'The works of God see the people.',
            'God sees the works of the people.'
          ],
          note: 'Object phrase + gen. modifier fronted (τὰ ἔργα τοῦ θεοῦ, neut. acc. pl.). Subject ὁ λαός (nom. sg.) at the end. Verb is sg.'
        },
        {
          g: 'τὴν φωνὴν τοῦ Ἰησοῦ ἀκούει τὰ τέκνα.',
          level: 3,
          en: 'The children hear the voice of Jesus.',
          choices: [
            'The children hear the voice of Jesus.',
            'Jesus hears the children\'s voice.',
            'The voice of the children hears Jesus.',
            'The child hears Jesus speak.'
          ],
          note: 'Neuter-plural subject τὰ τέκνα regularly takes a singular verb (ἀκούει) in Greek. Object phrase + gen. modifier fronted.'
        }
      ]
    },

    4: {
      sentences: [
        {
          g: 'ὁ Παῦλος λαλεῖ ἐν τῷ ἱερῷ.',
          level: 1,
          en: 'Paul speaks in the temple.',
          choices: [
            'Paul speaks in the temple.',
            'The temple speaks of Paul.',
            'Paul speaks of the temple.',
            'Paul speaks to the temple.'
          ],
          note: 'ἐν + dative (τῷ ἱερῷ) marks location.'
        },
        {
          g: 'ὁ Ἰησοῦς ὑπάγει εἰς τὸν οἶκον.',
          level: 1,
          en: 'Jesus goes into the house.',
          choices: [
            'Jesus goes into the house.',
            'Jesus comes from the house.',
            'Jesus goes to the temple.',
            'Jesus is in the house.'
          ],
          note: 'εἰς + accusative for motion into. Compare ἐν + dat. (location) and ἐκ + gen. (motion out).'
        },
        {
          g: 'οἱ ἄνθρωποι περιπατοῦσιν περὶ τὸ πλοῖον.',
          level: 1,
          en: 'The people walk around the boat.',
          choices: [
            'The people walk around the boat.',
            'The people walk in the boat.',
            'The people swim around the boat.',
            'The boat goes around the people.'
          ],
          note: 'περί + accusative = "around" (location/extent). With genitive it means "concerning". περιπατέω: contracted from περιπατέ-ουσι.'
        },
        {
          g: 'ἐκβάλλει τὰ τέκνα ἀπὸ τοῦ ἱεροῦ ὁ Παῦλος.',
          level: 2,
          en: 'Paul casts the children out from the temple.',
          choices: [
            'Paul casts the children out from the temple.',
            'The children cast Paul from the temple.',
            'Paul throws the temple at the children.',
            'Paul brings the children into the temple.'
          ],
          note: 'ἀπό + genitive = "away from"; the verb (3rd-sg, ἐκβάλλει) is fronted; the subject (ὁ Παῦλος) closes the sentence.'
        },
        {
          g: 'πρὸς τὸν Ἰησοῦν συνάγει ὁ Πέτρος τὸν ὄχλον.',
          level: 2,
          en: 'Peter gathers the crowd to Jesus.',
          choices: [
            'Peter gathers the crowd to Jesus.',
            'Jesus gathers Peter and the crowd.',
            'The crowd gathers to Jesus and Peter.',
            'Peter gathers Jesus to the crowd.'
          ],
          note: 'πρός + accusative = "to / toward"; prepositional phrase fronted to emphasize the destination.'
        },
        {
          g: 'ἐκ τοῦ οὐρανοῦ ἀκούει τὴν φωνὴν ὁ Πέτρος.',
          level: 2,
          en: 'Peter hears the voice from heaven.',
          choices: [
            'Peter hears the voice from heaven.',
            'Peter calls a voice from heaven.',
            'Peter goes from heaven hearing.',
            'A voice in heaven hears Peter.'
          ],
          note: 'ἐκ + gen. = "out of, from"; prepositional phrase fronted to emphasize source. Subject (ὁ Πέτρος) at the end.'
        },
        {
          g: 'διὰ τὸν Χριστὸν ὑπάγουσιν εἰς τὸν οἶκον τοῦ θεοῦ.',
          level: 3,
          en: 'Because of Christ they go into the house of God.',
          choices: [
            'Because of Christ they go into the house of God.',
            'Through the house of Christ they go to God.',
            'Because of Christ God goes into the house.',
            'Through Christ they go away from the house of God.'
          ],
          note: 'διά + accusative = "because of" (διά + genitive would be "through"); εἰς + accusative = "into".'
        },
        {
          g: 'ὑπὲρ τῶν ἀδελφῶν προσκυνεῖ ὁ Πέτρος τῷ θεῷ ἐν τῷ οἴκῳ.',
          level: 3,
          en: 'On behalf of the brothers Peter worships God in the house.',
          choices: [
            'On behalf of the brothers Peter worships God in the house.',
            'Above the brothers Peter worships in God\'s house.',
            'Peter worships the brothers on behalf of God.',
            'Peter brings the brothers to worship God.'
          ],
          note: 'ὑπέρ + gen. = "on behalf of" (with acc. it means "above"). προσκυνέω takes a dative complement (τῷ θεῷ).'
        },
        {
          g: 'μετὰ τῶν τέκνων αὐτοῦ ὑπάγει ὁ Παῦλος κατὰ τὸν οἶκον.',
          level: 3,
          en: 'With his children Paul goes through the house.',
          choices: [
            'With his children Paul goes through the house.',
            'After his children Paul goes against the house.',
            'Paul goes with the house of his children.',
            'After the children Paul goes into the house.'
          ],
          note: 'Two-case prepositions on display: μετά + gen. = "with"; κατά + acc. = "throughout / along". Compare μετά + acc. = "after" and κατά + gen. = "down from / against".'
        },
        {
          g: 'ὁ Ἰησοῦς περιπατεῖ ἐν τῷ ἱερῷ.',
          level: 1,
          en: 'Jesus walks in the temple.',
          choices: [
            'Jesus walks in the temple.',
            'Jesus walks to the temple.',
            'Jesus walks out of the temple.',
            'Jesus enters the temple.'
          ],
          note: 'ἐν + dative for static location. περιπατεῖ contracted from περιπατέ-ει.'
        },
        {
          g: 'λαμβάνει τὸν ἄρτον ἀπὸ τοῦ ἀδελφοῦ.',
          level: 1,
          en: 'He takes the bread from the brother.',
          choices: [
            'He takes the bread from the brother.',
            'The brother takes the bread from him.',
            'He gives the bread to the brother.',
            'He takes a brother\'s bread.'
          ],
          note: 'ἀπό + gen. = "(away) from". Subject is implicit in the 3rd-sg verb ending.'
        },
        {
          g: 'εἰς τὸν οἶκον ὑπάγει ὁ Πέτρος.',
          level: 2,
          en: 'Peter goes into the house.',
          choices: [
            'Peter goes into the house.',
            'Peter leaves the house.',
            'The house goes to Peter.',
            'Peter is in the house.'
          ],
          note: 'Prepositional phrase fronted (εἰς + acc. = "into"). Verb-final-ish word order: V + S after the fronted phrase.'
        },
        {
          g: 'συνάγει ὁ Χριστὸς τὸν λαὸν πρὸς τὸ ἱερόν.',
          level: 2,
          en: 'Christ gathers the people to the temple.',
          choices: [
            'Christ gathers the people to the temple.',
            'The people gather Christ to the temple.',
            'Christ leads the people from the temple.',
            'The temple gathers Christ\'s people.'
          ],
          note: 'πρός + acc. = "to / toward". συνάγει is a compound verb (σύν + ἄγω) — the prefix is fixed and does not require a separate σύν phrase.'
        },
        {
          g: 'διὰ τὸν λόγον τοῦ θεοῦ προσκυνοῦσιν αὐτῷ.',
          level: 3,
          en: 'Because of the word of God they worship him.',
          choices: [
            'Because of the word of God they worship him.',
            'Through the word of God he worships them.',
            'They worship God\'s word.',
            'They worship him about the word of God.'
          ],
          note: 'διά + acc. = causal ("because of"); contrast διά + gen. = "through". προσκυνέω + dative of person worshipped (αὐτῷ).'
        },
        {
          g: 'ἐκ τοῦ οἴκου ἐκβάλλει τὰ τέκνα ὁ ἄνθρωπος.',
          level: 3,
          en: 'The man casts the children out of the house.',
          choices: [
            'The man casts the children out of the house.',
            'The children cast the man out of the house.',
            'The man cast the children into the house.',
            'The man\'s children leave the house.'
          ],
          note: 'ἐκ + gen. = "out of". Object phrase precedes the subject. ἐκβάλλω is a compound (ἐκ + βάλλω); the prefix already carries the "out" sense.'
        }
      ]
    },

    5: {
      sentences: [
        {
          g: 'ἅγιος ὁ θεός.',
          level: 1,
          en: 'God is holy.',
          choices: [
            'God is holy.',
            'The holy God.',
            'God\'s holiness.',
            'God is the Holy One.'
          ],
          note: 'Predicate position: ἅγιος is anarthrous and stands outside the article-noun bracket (ὁ θεός). εἰμί is implied.'
        },
        {
          g: 'ὁ νόμος καλός ἐστιν.',
          level: 1,
          en: 'The law is good.',
          choices: [
            'The law is good.',
            'The good law.',
            'A law is good.',
            'The law is the good [thing].'
          ],
          note: 'Predicate position with ἐστιν explicit. καλός has no article, so it predicates rather than modifies.'
        },
        {
          g: 'ὁ ἀγαθὸς ἄγγελος ὑπάγει.',
          level: 1,
          en: 'The good angel departs.',
          choices: [
            'The good angel departs.',
            'The angel departs to the good [one].',
            'The angel is good and departs.',
            'The angels go to the good [one].'
          ],
          note: 'Article–adjective–noun (ὁ ἀγαθὸς ἄγγελος) = first attributive position. ἀγαθός sits inside the bracket and modifies ἄγγελος.'
        },
        {
          g: 'ὁ ἄνθρωπος ὁ ἅγιος ἀκούει τὸν λόγον.',
          level: 2,
          en: 'The holy person hears the word.',
          choices: [
            'The holy person hears the word.',
            'The person hears the holy word.',
            'A holy man hears a word.',
            'The man hears, holy is the word.'
          ],
          note: 'Second attributive position: article–noun–article–adjective (ὁ ἄνθρωπος ὁ ἅγιος). Equivalent in meaning to first attributive.'
        },
        {
          g: 'πολλοὶ ἄγγελοι λαλοῦσιν εἰρήνην.',
          level: 2,
          en: 'Many angels speak peace.',
          choices: [
            'Many angels speak peace.',
            'Many speak about peace and angels.',
            'Many people speak to angels of peace.',
            'The angel speaks much peace.'
          ],
          note: 'πολλοί agrees with ἄγγελοι (nom. pl. masc.) — fronted as the subject. λαλοῦσι (contracted from λαλέ-ουσι); εἰρήνην is acc. (direct object).'
        },
        {
          g: 'ὁ Χριστὸς κύριός ἐστιν τοῦ νόμου.',
          level: 2,
          en: 'Christ is lord of the law.',
          choices: [
            'Christ is lord of the law.',
            'The law is lord of Christ.',
            'Christ\'s law is lord.',
            'Christ is the lord, and so is the law.'
          ],
          note: 'Predicate noun κύριος (no article) is between subject ὁ Χριστός and the verb ἐστιν. Genitive τοῦ νόμου modifies κύριος.'
        },
        {
          g: 'ἅγιοι οἱ λόγοι τοῦ θεοῦ.',
          level: 3,
          en: 'The words of God are holy.',
          choices: [
            'The words of God are holy.',
            'The holy words of God.',
            'The holy [ones] are God\'s words.',
            'The words of the holy God.'
          ],
          note: 'Predicate adjective fronted (ἅγιοι, masc. nom. pl., agreeing with οἱ λόγοι). εἰμί implied. Genitive τοῦ θεοῦ inside the article-noun bracket.'
        },
        {
          g: 'τὸ καλὸν ποιοῦσιν οἱ ἀγαθοί.',
          level: 3,
          en: 'The good [people] do the good [thing].',
          choices: [
            'The good [people] do the good [thing].',
            'The good [people] are good.',
            'Good people do good people.',
            'The good [thing] is for good [people].'
          ],
          note: 'Two substantival adjectives in one sentence: τὸ καλόν ("the good thing", neut.) and οἱ ἀγαθοί ("the good [people]", masc. pl.). Article + adjective alone.'
        },
        {
          g: 'ὁ υἱὸς αὐτοῦ ὡς ἄγγελός ἐστιν.',
          level: 3,
          en: 'His son is like an angel.',
          choices: [
            'His son is like an angel.',
            'The angel\'s son is like him.',
            'His son is the angel.',
            'The angel is his son.'
          ],
          note: 'ὡς + nominative ("like") in a comparative construction. ἄγγελος is anarthrous predicate ("an angel").'
        },
        {
          g: 'μακάριος ὁ ἄνθρωπος.',
          level: 1,
          en: 'The man is blessed.',
          choices: [
            'The man is blessed.',
            'The blessed man.',
            'Blessing for the man.',
            'The man blesses.'
          ],
          note: 'Predicate position: anarthrous adjective μακάριος stands outside the article-noun bracket (ὁ ἄνθρωπος). εἰμί is implied.'
        },
        {
          g: 'ὁ ἀδελφὸς ὁ ἀγαθὸς ἀκούει τὴν φωνήν.',
          level: 1,
          en: 'The good brother hears the voice.',
          choices: [
            'The good brother hears the voice.',
            'The brother hears the good voice.',
            'The brother is good and hears.',
            'The brother of the good [one] hears.'
          ],
          note: 'Second attributive position: article-noun-article-adjective (ὁ ἀδελφὸς ὁ ἀγαθός). The adjective sits inside its own article-bracket.'
        },
        {
          g: 'μέγας ὁ θεὸς καὶ ἅγιος.',
          level: 2,
          en: 'God is great and holy.',
          choices: [
            'God is great and holy.',
            'The great and holy God.',
            'God is greater than the holy [one].',
            'God is the great holy [one].'
          ],
          note: 'Two predicate adjectives (μέγας, ἅγιος) joined by καί, with εἰμί implied. μέγας is the irregular adj. that uses 3rd-decl. patterns in some forms.'
        },
        {
          g: 'τυφλοὶ οἱ ὄχλοι, ἀλλὰ ὁ Χριστὸς βλέπει αὐτούς.',
          level: 2,
          en: 'The crowds are blind, but Christ sees them.',
          choices: [
            'The crowds are blind, but Christ sees them.',
            'The blind crowds see Christ.',
            'Christ is blind, but the crowds see him.',
            'Although Christ sees them, the crowds are blind.'
          ],
          note: 'Predicate adj. fronted (τυφλοί, masc. nom. pl.) with εἰμί implied. ἀλλά introduces a strong contrast. αὐτούς (acc. pl. masc.) refers back to οἱ ὄχλοι.'
        },
        {
          g: 'τὸν λόγον τὸν ἅγιον ἀκούει ὁ λαός.',
          level: 3,
          en: 'The people hear the holy word.',
          choices: [
            'The people hear the holy word.',
            'The holy people hear the word.',
            'The word, holy, hears the people.',
            'The word hears the holy people.'
          ],
          note: 'Object phrase fronted with second attributive adj. (τὸν λόγον τὸν ἅγιον). Subject (ὁ λαός) at the end.'
        },
        {
          g: 'ὡς ἄγγελοι οἱ υἱοὶ τοῦ θεοῦ.',
          level: 3,
          en: 'The sons of God are like angels.',
          choices: [
            'The sons of God are like angels.',
            'God\'s angels are like sons.',
            'The sons of God\'s angels.',
            'The angels are sons of God.'
          ],
          note: 'ὡς + nom. ("like / as") in a comparative construction; εἰμί is implied. Predicate noun (ἄγγελοι) is anarthrous.'
        }
      ]
    },

    6: {
      sentences: [
        {
          g: 'ἐκήρυξεν ὁ Παῦλος τὸ εὐαγγέλιον.',
          level: 1,
          en: 'Paul proclaimed the gospel.',
          choices: [
            'Paul proclaimed the gospel.',
            'Paul proclaims the gospel.',
            'Paul will proclaim the gospel.',
            'The gospel proclaimed Paul.'
          ],
          note: 'ἐ-κήρυξ-εν: augment ε- + 1st-aor. marker σα (κηρυκ + σα → κηρυξα) + 3rd-sg secondary -ε(ν) = past perfective.'
        },
        {
          g: 'ἤκουσα τὴν φωνὴν τοῦ κυρίου.',
          level: 1,
          en: 'I heard the voice of the Lord.',
          choices: [
            'I heard the voice of the Lord.',
            'I hear the voice of the Lord.',
            'I will hear the voice of the Lord.',
            'You heard the voice of the Lord.'
          ],
          note: '1st-aor. 1st-sg of ἀκούω: initial vowel α augmented to η (lengthening); σα marker still visible.'
        },
        {
          g: 'ὁ Πέτρος ἔπεμψεν τὸν Τιμόθεον πρὸς τὸν Παῦλον.',
          level: 1,
          en: 'Peter sent Timothy to Paul.',
          choices: [
            'Peter sent Timothy to Paul.',
            'Timothy sent Peter to Paul.',
            'Paul sent Timothy to Peter.',
            'Peter will send Timothy to Paul.'
          ],
          note: '1st-aor. of πέμπω: ἔ-πεμψ-εν (ε augment + π+σ→ψ + 3rd-sg -ε(ν)).'
        },
        {
          g: 'γράψει ὁ Παῦλος λόγους περὶ τοῦ νόμου.',
          level: 2,
          en: 'Paul will write words about the law.',
          choices: [
            'Paul will write words about the law.',
            'Paul writes words about the law.',
            'Paul wrote words about the law.',
            'The law writes about Paul\'s words.'
          ],
          note: 'γράψει = γράφ-σ-ει (labial + σ → ψ); the σ before the primary ending marks the future. περί + gen. = "concerning".'
        },
        {
          g: 'τότε ἐβαπτίσαμεν τὰ τέκνα ἐν τῇ θαλάσσῃ.',
          level: 2,
          en: 'Then we baptized the children in the sea.',
          choices: [
            'Then we baptized the children in the sea.',
            'Then we baptize the children in the sea.',
            'Then we will baptize the children in the sea.',
            'Then they baptized the children in the sea.'
          ],
          note: 'ἐ-βαπτι-σα-μεν: augment + 1st-aor. σα + 1st-pl secondary -μεν.'
        },
        {
          g: 'ἤδη εὐλογοῦσιν τὸν θεὸν οἱ ἄνθρωποι.',
          level: 2,
          en: 'The people are already blessing God.',
          choices: [
            'The people are already blessing God.',
            'The people will bless God already.',
            'God already blesses the people.',
            'God\'s people bless [him] now.'
          ],
          note: 'ἤδη ("already") + present indicative. εὐλογέω contracts: εὐλογέ-ουσι → εὐλογοῦσι.'
        },
        {
          g: 'τότε ἐδιδάσκετε τοὺς ἀνθρώπους ἐν τῇ συναγωγῇ.',
          level: 3,
          en: 'Then you (pl.) were teaching the people in the synagogue.',
          choices: [
            'Then you (pl.) were teaching the people in the synagogue.',
            'Then you (pl.) taught the people in the synagogue.',
            'You (pl.) teach the people in the synagogue then.',
            'Then the people taught you in the synagogue.'
          ],
          note: 'ἐ-διδάσκ-ετε: augment ε- + present stem + secondary -ετε = imperfect (ongoing past). Aorist would be ἐδιδάξατε.'
        },
        {
          g: 'τὰ τέκνα τῶν ἀδελφῶν δοξάσει ὁ θεὸς νῦν.',
          level: 3,
          en: 'God will now glorify the children of the brothers.',
          choices: [
            'God will now glorify the children of the brothers.',
            'God now glorifies the brothers\' children.',
            'God glorified the children of the brothers now.',
            'The children of the brothers will glorify God now.'
          ],
          note: 'Object phrase with embedded genitive (τὰ τέκνα τῶν ἀδελφῶν) is fronted; future verb (δοξάσει = δοξάζ-σ-ει) and subject follow.'
        },
        {
          g: 'οὐκέτι ἔγραφεν ὁ Παῦλος, ἤδη γὰρ ἐκήρυξεν τὸ εὐαγγέλιον.',
          level: 3,
          en: 'Paul was no longer writing, for he had already proclaimed the gospel.',
          choices: [
            'Paul was no longer writing, for he had already proclaimed the gospel.',
            'Paul was not writing, but he proclaimed the gospel already.',
            'Paul will no longer write, for he proclaims the gospel.',
            'Paul does not write, for he already proclaimed the gospel.'
          ],
          note: 'Imperfect ἔ-γραφ-εν (augment + present stem + secondary -ε(ν)) + 1st-aor. ἐκήρυξεν. γάρ ("for") postpositive.'
        },
        {
          g: 'ὁ ἄγγελος ἤκουσε τὴν φωνήν.',
          level: 1,
          en: 'The angel heard the voice.',
          choices: [
            'The angel heard the voice.',
            'The angel hears the voice.',
            'The angel will hear the voice.',
            'The angels heard the voice.'
          ],
          note: '1st-aor. of ἀκούω: initial α augmented to η; σα marker visible (ἤ-κου-σ-ε). 3rd-sg ending -ε.'
        },
        {
          g: 'γράψει ὁ Παῦλος τὸν λόγον.',
          level: 1,
          en: 'Paul will write the word.',
          choices: [
            'Paul will write the word.',
            'Paul wrote the word.',
            'Paul writes the word.',
            'The word writes Paul.'
          ],
          note: 'Future of γράφω: γράφ-σ-ει → γράψει (φ + σ → ψ). σ before primary endings is the future marker.'
        },
        {
          g: 'ἐκήρυσσε ὁ Χριστὸς τὸ εὐαγγέλιον τῷ λαῷ.',
          level: 2,
          en: 'Christ was proclaiming the gospel to the people.',
          choices: [
            'Christ was proclaiming the gospel to the people.',
            'Christ proclaimed the gospel to the people.',
            'Christ will proclaim the gospel to the people.',
            'The people were proclaiming the gospel of Christ.'
          ],
          note: 'Imperfect ἐ-κήρυσσ-ε: augment + present stem κηρυσσ- + secondary -ε. Imperfect = ongoing/repeated past action.'
        },
        {
          g: 'τότε ἔπεμψεν ὁ θεὸς τὸν υἱὸν αὐτοῦ.',
          level: 2,
          en: 'Then God sent his son.',
          choices: [
            'Then God sent his son.',
            'Now God sends his son.',
            'Then God\'s son sent [him].',
            'God will then send his son.'
          ],
          note: '1st-aor. ἔ-πεμψ-ε(ν) (π + σ → ψ). Time adverb τότε pairs naturally with past tense.'
        },
        {
          g: 'ἔτι κράξει ὁ τυφλὸς πρὸς τὸν Ἰησοῦν.',
          level: 3,
          en: 'The blind man will still cry out to Jesus.',
          choices: [
            'The blind man will still cry out to Jesus.',
            'The blind man still cries out to Jesus.',
            'The blind man cried out to Jesus.',
            'Jesus will still cry out to the blind man.'
          ],
          note: 'Future of κράζω: κράξει (κ + σ → ξ). ἔτι ("still, yet") modifies the future verb. πρός + acc. = "to / toward".'
        },
        {
          g: 'ὅτε ἔπεμπεν ὁ θεὸς τοὺς ἀγγέλους, ἐδόξαζον αὐτὸν οἱ ἄνθρωποι.',
          level: 3,
          en: 'When God was sending the angels, the people were glorifying him.',
          choices: [
            'When God was sending the angels, the people were glorifying him.',
            'When God sent the angels, the people glorified him.',
            'When God sends his angels, the people glorify him.',
            'The angels of God sent the people who glorified him.'
          ],
          note: 'Two imperfects in parallel (ἔπεμπεν, ἐδόξαζον): both ongoing past actions. ὅτε ("when") + indicative for a definite past time.'
        }
      ]
    },

    7: {
      sentences: [
        {
          g: 'ὁ ἀπόστολος ἔλαβεν τὸ ἱμάτιον.',
          level: 1,
          en: 'The apostle took the garment.',
          choices: [
            'The apostle took the garment.',
            'The apostle takes the garment.',
            'The garment took the apostle.',
            'The apostle will take the garment.'
          ],
          note: 'ἔλαβεν = 2nd-aor. of λαμβάνω: augment ε- + altered stem λαβ- + 3rd-sg secondary -ε(ν), no σα marker.'
        },
        {
          g: 'θέλω ἀκούειν τὸν λόγον.',
          level: 1,
          en: 'I want to hear the word.',
          choices: [
            'I want to hear the word.',
            'I hear the word.',
            'I will hear the word.',
            'You want to hear the word.'
          ],
          note: 'θέλω + complementary infinitive (ἀκούειν, present active infinitive) = "I want to V".'
        },
        {
          g: 'οἱ Φαρισαῖοι ἔβαλον τὸν ἀπόστολον ἐκ τοῦ ἱεροῦ.',
          level: 1,
          en: 'The Pharisees threw the apostle out of the temple.',
          choices: [
            'The Pharisees threw the apostle out of the temple.',
            'The apostle threw the Pharisees out of the temple.',
            'The Pharisees throw the apostle from the temple.',
            'The apostles threw the Pharisee from the temple.'
          ],
          note: 'ἔβαλον = 2nd-aor. of βάλλω (stem βαλ-, no σα). 3rd-pl secondary -ον.'
        },
        {
          g: 'οὐκ ἔχει ὁ ἀπόστολος ἐξουσίαν ἐν τῷ ἱερῷ.',
          level: 2,
          en: 'The apostle does not have authority in the temple.',
          choices: [
            'The apostle does not have authority in the temple.',
            'The apostle does not seek authority in the temple.',
            'The apostle has authority in the temple.',
            'The apostles do not have authority in the temple.'
          ],
          note: 'οὐκ negates the indicative (becomes οὐχ before rough breathing).'
        },
        {
          g: 'οἱ Φαρισαῖοι θέλουσιν τηρεῖν τὸν νόμον.',
          level: 2,
          en: 'The Pharisees want to keep the law.',
          choices: [
            'The Pharisees want to keep the law.',
            'The Pharisees keep the law.',
            'The Pharisees want the law to keep.',
            'The Pharisees do not want to keep the law.'
          ],
          note: 'Verb of wishing (θέλουσι, 3rd-pl) + complementary infinitive (τηρεῖν, contracted from τηρέ-ειν).'
        },
        {
          g: 'ὁ ἀπόστολος δοκεῖ τηρεῖν τὰς ἐντολάς.',
          level: 2,
          en: 'The apostle seems to keep the commandments.',
          choices: [
            'The apostle seems to keep the commandments.',
            'The apostle keeps the commandments seemingly.',
            'The apostles seem to keep the commandment.',
            'The commandments seem to keep the apostle.'
          ],
          note: 'δοκέω + complementary infinitive (τηρεῖν) = "seems to V". τὰς ἐντολάς is acc. pl. fem.'
        },
        {
          g: 'μέλλει ὁ θεὸς πέμπειν τοὺς ἀγγέλους εἰς τὸν κόσμον.',
          level: 3,
          en: 'God is about to send the angels into the world.',
          choices: [
            'God is about to send the angels into the world.',
            'God sends the angels of the world.',
            'God sent the angels into the world.',
            'The angels are about to send God into the world.'
          ],
          note: 'μέλλω + infinitive = "be about to V". πέμπειν is the present active infinitive.'
        },
        {
          g: 'ἔχομεν ἐξουσίαν ἐκβάλλειν τὰ θηρία ἐκ τοῦ τόπου.',
          level: 3,
          en: 'We have authority to cast the beasts out of the place.',
          choices: [
            'We have authority to cast the beasts out of the place.',
            'The beasts cast out our authority from the place.',
            'We have authority over the beasts of the place.',
            'We have the place to cast out the beasts of authority.'
          ],
          note: 'ἐξουσίαν + complementary infinitive ("authority to V"). ἐκ + gen. = "out of, from". θηρία is neut. acc. pl.'
        },
        {
          g: 'οὔπω εἶδον οἱ ἄνθρωποι τὸν θάνατον, ἀλλὰ μέλλουσιν ἀκούειν περὶ αὐτοῦ.',
          level: 3,
          en: 'The people had not yet seen death, but they are about to hear about it.',
          choices: [
            'The people had not yet seen death, but they are about to hear about it.',
            'The people had not heard about death, but they will see it.',
            'The people saw death, but did not hear about it.',
            'Death was not yet seen by the people, who will hear it.'
          ],
          note: 'οὔπω = "not yet". 2nd-aor. εἶδον (suppletive root for "see"). ἀλλά + μέλλω + inf.'
        },
        {
          g: 'θέλει ὁ ἀπόστολος μαρτυρεῖν περὶ τοῦ Ἰησοῦ.',
          level: 1,
          en: 'The apostle wants to bear witness about Jesus.',
          choices: [
            'The apostle wants to bear witness about Jesus.',
            'The apostle bears witness about Jesus.',
            'The apostle will bear witness about Jesus.',
            'Jesus wants to bear witness about the apostle.'
          ],
          note: 'θέλει + complementary infinitive (μαρτυρεῖν, contracted from μαρτυρέ-ειν) = "wants to V". περί + gen. = "concerning, about".'
        },
        {
          g: 'ὁ Φαρισαῖος θεωρεῖ τὰ πρόβατα.',
          level: 1,
          en: 'The Pharisee looks at the sheep.',
          choices: [
            'The Pharisee looks at the sheep.',
            'The sheep look at the Pharisee.',
            'The Pharisees look at the sheep.',
            'The Pharisee teaches the sheep.'
          ],
          note: 'θεωρεῖ contracts from θεωρέ-ει. πρόβατον (neut. 2nd-decl., ch 7 vocab); plural form τὰ πρόβατα.'
        },
        {
          g: 'δεῖ ἡμᾶς μετανοεῖν.',
          level: 2,
          en: 'It is necessary for us to repent.',
          choices: [
            'It is necessary for us to repent.',
            'We are necessary in order to repent.',
            'We repent because it is necessary.',
            'It is necessary to repent for them.'
          ],
          note: 'Impersonal δεῖ + acc. (ἡμᾶς) + inf. (μετανοεῖν) = "it is necessary for X to V". Standard infinitive-with-accusative-subject pattern.'
        },
        {
          g: 'μὴ ἀκολουθεῖτε τοῖς πονηροῖς.',
          level: 2,
          en: 'Do not follow the evil [people].',
          choices: [
            'Do not follow the evil [people].',
            'You do not follow the evil [people].',
            'The evil [people] do not follow you.',
            'You will not follow the evil [people].'
          ],
          note: 'μή + present imperative 2nd-pl = prohibition ("stop / don\'t keep V-ing"). ἀκολουθέω + dative complement (τοῖς πονηροῖς, substantival adj. "the evil [ones]").'
        },
        {
          g: 'οἱ ὀφθαλμοὶ τοῦ τυφλοῦ οὔπω βλέπουσιν τὸν θάνατον.',
          level: 3,
          en: 'The eyes of the blind man do not yet see death.',
          choices: [
            'The eyes of the blind man do not yet see death.',
            'The blind man\'s eyes have already seen death.',
            'Death does not yet see the blind man\'s eyes.',
            'The blind man does not see his eyes in death.'
          ],
          note: 'Subject phrase with embedded genitive (οἱ ὀφθαλμοὶ τοῦ τυφλοῦ). οὔπω = "not yet". τὸν θάνατον (acc. sg. masc.) is the direct object.'
        },
        {
          g: 'μέλλει ὁ ἀπόστολος καλεῖν τὸν λαὸν εἰς τὴν δικαιοσύνην.',
          level: 3,
          en: 'The apostle is about to call the people to righteousness.',
          choices: [
            'The apostle is about to call the people to righteousness.',
            'The apostle calls the people away from righteousness.',
            'The people are about to call the apostle to righteousness.',
            'The righteous apostle called the people.'
          ],
          note: 'μέλλω + inf. (καλεῖν) = "be about to V". εἰς + acc. with abstract noun (δικαιοσύνη) = "into / toward [a state of]".'
        }
      ]
    },

    8: {
      sentences: [
        {
          g: 'ὁ μαθητὴς ἔρχεται πρὸς τὸν Ἰησοῦν.',
          level: 1,
          en: 'The disciple comes to Jesus.',
          choices: [
            'The disciple comes to Jesus.',
            'Jesus comes to the disciple.',
            'The disciple takes Jesus.',
            'The disciple was coming to Jesus.'
          ],
          note: 'ἔρχομαι is middle/deponent: middle endings, active meaning. πρός + acc. = "to / toward".'
        },
        {
          g: 'ὁ Ἰωάννης ἀκολουθεῖ τῷ Ἰησοῦ.',
          level: 1,
          en: 'John follows Jesus.',
          choices: [
            'John follows Jesus.',
            'Jesus follows John.',
            'John leads Jesus.',
            'John believes Jesus.'
          ],
          note: 'ἀκολουθέω + dative complement (τῷ Ἰησοῦ). Contracted: ἀκολουθέ-ει → ἀκολουθεῖ.'
        },
        {
          g: 'ὁ προφήτης δέχεται τὸν λόγον τοῦ θεοῦ.',
          level: 1,
          en: 'The prophet receives the word of God.',
          choices: [
            'The prophet receives the word of God.',
            'God\'s word receives the prophet.',
            'The prophet sends the word of God.',
            'The prophet does not receive the word.'
          ],
          note: 'δέχομαι is middle/deponent. The prophet is nominative; the word is accusative; God is genitive (modifier).'
        },
        {
          g: 'οἱ μαθηταὶ προσεύχονται τῷ θεῷ.',
          level: 2,
          en: 'The disciples pray to God.',
          choices: [
            'The disciples pray to God.',
            'God prays for the disciples.',
            'The disciple prays to God.',
            'The disciples will pray to God.'
          ],
          note: 'προσεύχομαι is deponent. 3rd-pl mid./pass. ending -ονται. Dative of indirect object: τῷ θεῷ.'
        },
        {
          g: 'ἐν τῇ ἐρήμῳ ἐργάζεται ὁ μαθητής.',
          level: 2,
          en: 'In the wilderness the disciple works.',
          choices: [
            'In the wilderness the disciple works.',
            'The disciple in the wilderness teaches.',
            'In the wilderness the disciples work.',
            'The wilderness works upon the disciple.'
          ],
          note: 'ἔρημος is fem. 2nd-decl. (so ἐν τῇ ἐρήμῳ). ἐργάζεται is 3rd-sg mid./pass. (deponent).'
        },
        {
          g: 'ὁ Ἰησοῦς ἐργάζεται ἐν τῷ ἱερῷ.',
          level: 2,
          en: 'Jesus works in the temple.',
          choices: [
            'Jesus works in the temple.',
            'The temple works through Jesus.',
            'Jesus is in the temple working.',
            'Jesus does not work in the temple.'
          ],
          note: 'ἐργάζομαι (deponent). ἐν + dative for location. Word order is mildly Greek (verb-first).'
        },
        {
          g: 'εὐαγγελίζονται οἱ ἀπόστολοι τοῖς προφήταις.',
          level: 3,
          en: 'The apostles preach the good news to the prophets.',
          choices: [
            'The apostles preach the good news to the prophets.',
            'The prophets preach the good news to the apostles.',
            'The apostles are preached the good news by the prophets.',
            'The prophets receive the good news from the apostles.'
          ],
          note: 'Verb-first (3rd-pl mid./pass., deponent). τοῖς προφήταις is dative pl. (1st-decl masc.).'
        },
        {
          g: 'οἱ μαθηταὶ ἀρνοῦνται τοὺς προφήτας, ἀλλὰ προσέρχονται τῷ Ἰωάννῃ.',
          level: 3,
          en: 'The disciples deny the prophets, but they come to John.',
          choices: [
            'The disciples deny the prophets, but they come to John.',
            'The disciples answer the prophets and come to John.',
            'The prophets deny the disciples and approach John.',
            'The disciples come to the prophets, but deny John.'
          ],
          note: 'Two deponents: ἀρνέομαι ("deny", + acc.) and προσέρχομαι ("approach", + dat.).'
        },
        {
          g: 'ὁ Ἰησοῦς εἰσέρχεται εἰς τὴν συναγωγὴν καὶ διδάσκει τοὺς μαθητὰς αὐτοῦ.',
          level: 3,
          en: 'Jesus enters into the synagogue and teaches his disciples.',
          choices: [
            'Jesus enters into the synagogue and teaches his disciples.',
            'Jesus enters with his disciples into the synagogue.',
            'Jesus, in the synagogue, hears his disciples\' teaching.',
            'Jesus and his disciples enter into the synagogue.'
          ],
          note: 'Compound deponent εἰσέρχομαι (εἰς + ἔρχομαι) + parallel active διδάσκει. αὐτοῦ ("his", gen. sg. masc.) attaches to τοὺς μαθητάς.'
        },
        {
          g: 'ὁ μαθητὴς ἄρχεται λαλεῖν.',
          level: 1,
          en: 'The disciple begins to speak.',
          choices: [
            'The disciple begins to speak.',
            'The disciple is speaking.',
            'The disciple ceases to speak.',
            'The disciples begin to speak.'
          ],
          note: 'ἄρχομαι (deponent, mid./pass. form, active sense "begin") + complementary infinitive (λαλεῖν, contracted).'
        },
        {
          g: 'ὁ προφήτης ἀρνεῖται τὸν θάνατον.',
          level: 1,
          en: 'The prophet denies death.',
          choices: [
            'The prophet denies death.',
            'The prophet does not deny death.',
            'Death denies the prophet.',
            'The prophet renounces life.'
          ],
          note: 'ἀρνέομαι (deponent + acc. object) = "deny". 1st-decl. masc. προφήτης (gen. sg. -ου).'
        },
        {
          g: 'ὁ Ἰωάννης βαπτίζει ἐν τῇ ἐρήμῳ.',
          level: 2,
          en: 'John baptizes in the wilderness.',
          choices: [
            'John baptizes in the wilderness.',
            'John was baptizing in the wilderness.',
            'The wilderness baptizes John.',
            'John baptizes the wilderness.'
          ],
          note: 'Ἰωάννης: 1st-decl. masc. (gen. sg. -ου). ἔρημος is fem. 2nd-decl. (so dat. sg. τῇ ἐρήμῳ).'
        },
        {
          g: 'δέχεται ὁ Παῦλος τοὺς μαθητὰς εἰς τὸν οἶκον.',
          level: 2,
          en: 'Paul welcomes the disciples into the house.',
          choices: [
            'Paul welcomes the disciples into the house.',
            'The disciples welcome Paul into the house.',
            'Paul sends the disciples out of the house.',
            'Paul\'s disciples welcome him in the house.'
          ],
          note: 'δέχομαι (deponent) + acc. of person received. εἰς + acc. for motion. 1st-decl. masc. acc. pl. -άς (μαθητάς).'
        },
        {
          g: 'οἱ προφῆται προσέρχονται τῷ Ἰησοῦ καὶ προσεύχονται περὶ τοῦ λαοῦ.',
          level: 3,
          en: 'The prophets come to Jesus and pray concerning the people.',
          choices: [
            'The prophets come to Jesus and pray concerning the people.',
            'Jesus comes to the prophets, who pray for the people.',
            'The prophets come to the people and pray for Jesus.',
            'The prophets approach the people in prayer with Jesus.'
          ],
          note: 'Two coordinated deponents: προσέρχομαι (+ dat.) and προσεύχομαι. περί + gen. = "concerning". Note 1st-decl. masc. forms throughout.'
        },
        {
          g: 'ὅτε εἰσέρχεται ὁ Χριστὸς εἰς τὴν συναγωγήν, ἐργάζεται σημεῖα μεγάλα.',
          level: 3,
          en: 'When Christ enters into the synagogue, he works great signs.',
          choices: [
            'When Christ enters into the synagogue, he works great signs.',
            'When Christ goes out of the synagogue, he works great signs.',
            'When Christ works great signs, he enters the synagogue.',
            'Christ\'s great signs work in the synagogue.'
          ],
          note: 'Compound deponent εἰσέρχομαι (εἰς + ἔρχομαι). ἐργάζομαι + acc. of result. μεγάλα is neut. acc. pl. of μέγας (irregular adj.).'
        }
      ]
    },

    9: {
      sentences: [
        {
          g: 'ἐγώ εἰμι ὁ ἄρτος τῆς ζωῆς.',
          level: 1,
          en: 'I am the bread of life.',
          choices: [
            'I am the bread of life.',
            'The bread of life is for me.',
            'He is the bread of my life.',
            'I have the bread of life.'
          ],
          note: 'Iconic ἐγώ εἰμί + predicate noun (ὁ ἄρτος, nom. with art.) + genitive (τῆς ζωῆς).'
        },
        {
          g: 'οὗτός ἐστιν ὁ προφήτης.',
          level: 1,
          en: 'This [man] is the prophet.',
          choices: [
            'This [man] is the prophet.',
            'He is this prophet.',
            'The prophet is this [man].',
            'These are the prophets.'
          ],
          note: 'Demonstrative οὗτος ("this"). Predicate noun ὁ προφήτης (nom. with article).'
        },
        {
          g: 'σὺ εἶ ὁ προφήτης ἡμῶν.',
          level: 1,
          en: 'You are our prophet.',
          choices: [
            'You are our prophet.',
            'Our prophet is you.',
            'You are with our prophet.',
            'I am your prophet.'
          ],
          note: 'Explicit σύ for emphasis. εἶ = 2nd-sg of εἰμί. Possessive ἡμῶν ("our", gen. of ἡμεῖς) attaches to ὁ προφήτης.'
        },
        {
          g: 'οὗτός ἐστιν ὁ υἱὸς τοῦ θεοῦ.',
          level: 2,
          en: 'This [man] is the Son of God.',
          choices: [
            'This [man] is the Son of God.',
            'He is this Son of God.',
            'The Son of this God is here.',
            'This is the God of the Son.'
          ],
          note: 'Demonstrative οὗτος in predicate position to ὁ υἱός — both nominative across a linking εἰμί.'
        },
        {
          g: 'ἐκεῖνος γὰρ καλεῖ τοὺς δούλους αὐτοῦ.',
          level: 2,
          en: 'For that one calls his slaves.',
          choices: [
            'For that one calls his slaves.',
            'For that one\'s slaves call him.',
            'That one is the slave of him.',
            'He calls those slaves.'
          ],
          note: 'ἐκεῖνος (far demonstrative). γάρ postpositive ("for"). αὐτοῦ ("his", gen. sg. masc.) attaches to τοὺς δούλους.'
        },
        {
          g: 'κἀγὼ καὶ ὁ ἀδελφὸς ὑμῶν δεχόμεθα τοὺς προφήτας.',
          level: 2,
          en: 'I (also) and your brother receive the prophets.',
          choices: [
            'I (also) and your brother receive the prophets.',
            'The prophets receive me and your brother.',
            'You receive me and your brother through the prophets.',
            'And I receive your brother and the prophets.'
          ],
          note: 'κἀγώ = καὶ + ἐγώ ("and I"). ὑμῶν ("your", gen. of ὑμεῖς). 1st-pl mid. δεχόμεθα ("we receive").'
        },
        {
          g: 'βλέπομεν αὐτὸν ἡμεῖς, ὑμεῖς δὲ οὐ πιστεύετε αὐτῷ.',
          level: 3,
          en: 'We (emphatic) see him, but you (pl., emphatic) do not believe him.',
          choices: [
            'We (emphatic) see him, but you (pl., emphatic) do not believe him.',
            'We do not see him, but you believe in him.',
            'He sees us, but he does not believe in you.',
            'We see him; he does not believe in you.'
          ],
          note: 'Explicit ἡμεῖς / ὑμεῖς signal contrast (the verb already encodes person); δέ is postpositive ("but"). πιστεύω + dative.'
        },
        {
          g: 'ὁ ἄνθρωπος ὃς ἀκούει τὸν λόγον δέχεται αὐτόν.',
          level: 3,
          en: 'The man who hears the word receives it.',
          choices: [
            'The man who hears the word receives it.',
            'The man hears the word that receives him.',
            'The word that the man hears receives him.',
            'The man who receives the word does not hear it.'
          ],
          note: 'Relative pronoun ὅς (nom. sg. masc.) introduces a defining clause. αὐτόν (acc. sg. masc.) refers back to τὸν λόγον.'
        },
        {
          g: 'ἐκείνη ἡ ἡμέρα οὐκ ἔστιν ἡ ἡμέρα τῆς εἰρήνης· εἴτε γὰρ οὗτοι εἴτε ἐκεῖνοι, οὐ προσέχουσιν τῷ θεῷ.',
          level: 3,
          en: 'That day is not the day of peace; for whether these [people] or those, they do not pay attention to God.',
          choices: [
            'That day is not the day of peace; for whether these [people] or those, they do not pay attention to God.',
            'That day is the day of peace; for these and those pay attention to God.',
            'These or those people belong to that day of peace.',
            'The day of God\'s peace pays attention to these and those.'
          ],
          note: 'ἐκείνη (fem.) and οὗτοι/ἐκεῖνοι (masc. pl. demonstratives). εἴτε … εἴτε ("whether … or"). προσέχω + dative.'
        },
        {
          g: 'οὗτος γάρ ἐστιν ὁ ἀπόστολος ἡμῶν.',
          level: 1,
          en: 'For this [man] is our apostle.',
          choices: [
            'For this [man] is our apostle.',
            'This is our apostle\'s reason.',
            'He is the apostle for us.',
            'This apostle is ours.'
          ],
          note: 'γάρ ("for") is postpositive — never first. οὗτος (near demonstrative) and the predicate noun ὁ ἀπόστολος are both nominative across the linking ἐστίν.'
        },
        {
          g: 'ἐκείνη ἡ ἡμέρα ἀγαθή ἐστιν.',
          level: 1,
          en: 'That day is good.',
          choices: [
            'That day is good.',
            'This day is good.',
            'The day is that good [thing].',
            'The good day is that [day].'
          ],
          note: 'ἐκεῖνος in attributive position with article (ἐκείνη ἡ ἡμέρα). Predicate adj. ἀγαθή agrees with ἡμέρα.'
        },
        {
          g: 'ἐγὼ μὲν βαπτίζω τὸν λαόν, αὐτὸς δὲ διδάσκει τοὺς ἀδελφούς.',
          level: 2,
          en: 'I, on the one hand, baptize the people, but he, on the other, teaches the brothers.',
          choices: [
            'I, on the one hand, baptize the people, but he, on the other, teaches the brothers.',
            'I baptize the brothers, but the people teach him.',
            'He baptizes me, and I teach the people.',
            'I and he baptize and teach the brothers.'
          ],
          note: 'μέν … δέ pair ("on the one hand … on the other"); both are postpositive. Explicit ἐγώ / αὐτός marks contrast — the verb already encoded the person.'
        },
        {
          g: 'διὸ καλοῦμεν ἑαυτοὺς δούλους τοῦ θεοῦ.',
          level: 2,
          en: 'Therefore we call ourselves servants of God.',
          choices: [
            'Therefore we call ourselves servants of God.',
            'Therefore the servants of God call us.',
            'We call ourselves God\'s reason for the servants.',
            'We are called by God\'s servants.'
          ],
          note: 'διό = "therefore" (begins its clause, unlike οὖν). καλέω + double accusative ("call X Y"). ἑαυτούς is the 3rd-pers. reflexive pronoun used here for 1st-pl, common in Koine.'
        },
        {
          g: 'ὁ ἄνθρωπος ὅλον τὸν κόσμον φιλεῖ, αὐτὸς δὲ τὸν θεὸν οὐ φιλεῖ.',
          level: 3,
          en: 'The man loves the whole world, but he himself does not love God.',
          choices: [
            'The man loves the whole world, but he himself does not love God.',
            'The whole world loves the man, but God himself does not love him.',
            'The man loves the world, although he loves himself and God.',
            'Although he loves God, the man does not love himself.'
          ],
          note: 'ὅλον τὸν κόσμον = predicate-position ὅλος ("the whole world"). αὐτός in nom. is the intensive ("he himself"); δέ postpositive marks the contrast.'
        },
        {
          g: 'οὐ μόνον τοῦτο λέγομεν, ἀλλὰ καὶ ἐκεῖνο πιστεύομεν.',
          level: 3,
          en: 'Not only do we say this, but we also believe that.',
          choices: [
            'Not only do we say this, but we also believe that.',
            'We say neither this nor that, and we do not believe.',
            'We say this only because we believe that.',
            'Believing that, we say this.'
          ],
          note: 'οὐ μόνον … ἀλλὰ καί = "not only … but also". τοῦτο (neut. acc. sg. of οὗτος) and ἐκεῖνο (neut. acc. sg. of ἐκεῖνος) — paired demonstratives.'
        }
      ]
    },

    10: {
      sentences: [
        {
          g: 'ὁ ἄνθρωπος ὃς ἀκούει τὸν λόγον πιστεύει.',
          level: 1,
          en: 'The man who hears the word believes.',
          choices: [
            'The man who hears the word believes.',
            'The man hears the word that believes.',
            'The word that the man hears believes.',
            'The man who believes hears the word.'
          ],
          note: 'ὅς (nom. sg. masc.) is the relative pronoun; it agrees with its antecedent ὁ ἄνθρωπος in gender/number, and its case (nom.) comes from being the subject of ἀκούει inside the relative clause.'
        },
        {
          g: 'ταῦτά ἐστιν τὰ ἔργα ἃ ποιεῖ ὁ Ἰησοῦς.',
          level: 1,
          en: 'These are the works which Jesus does.',
          choices: [
            'These are the works which Jesus does.',
            'These works do Jesus.',
            'Jesus does these works.',
            'These are Jesus\' work.'
          ],
          note: 'ταῦτα = neut. nom. pl. of οὗτος. Relative ἅ (neut. acc. pl.) — object of ποιεῖ inside the rel. clause; antecedent τὰ ἔργα.'
        },
        {
          g: 'βλέπω τὸν ἄγγελον ὃν πέμπει ὁ θεός.',
          level: 1,
          en: 'I see the angel whom God sends.',
          choices: [
            'I see the angel whom God sends.',
            'God sees the angel whom I send.',
            'I send the angel; God sees [him].',
            'I see God\'s angel and send [him].'
          ],
          note: 'Relative ὅν (acc. sg. masc.): agrees with antecedent τὸν ἄγγελον in gender/number, and is acc. because it is the object of πέμπει inside the rel. clause.'
        },
        {
          g: 'ὁ Παῦλος λέγει ὑμῖν ὅτι αὐτός ἐστιν ὁ κύριος.',
          level: 2,
          en: 'Paul tells you that he is the Lord.',
          choices: [
            'Paul tells you that he is the Lord.',
            'Paul tells the Lord about you.',
            'He tells you that Paul is the Lord.',
            'You tell Paul that he is the Lord.'
          ],
          note: 'ὅτι after a verb of saying introduces the indirect statement; the embedded clause stays in its own indicative.'
        },
        {
          g: 'ἐθαύμασαν οἱ μαθηταί, καθὼς ὁ Ἰησοῦς ἐθεράπευσεν αὐτόν.',
          level: 2,
          en: 'The disciples marveled, just as Jesus healed him.',
          choices: [
            'The disciples marveled, just as Jesus healed him.',
            'The disciples marveled because Jesus healed him.',
            'The disciples marveled in the way that Jesus healed him.',
            'The disciples healed him just as Jesus marveled.'
          ],
          note: 'καθώς = "just as / as". 1st-aor. ἐθαύμασαν, ἐθεράπευσεν (both σα-aorists).'
        },
        {
          g: 'εἰ ἀκούει ὁ ἀδελφός, πιστεύει.',
          level: 2,
          en: 'If the brother hears, he believes.',
          choices: [
            'If the brother hears, he believes.',
            'When the brother hears, he believed.',
            'The brother hears that he believes.',
            'Although the brother hears, he does not believe.'
          ],
          note: 'εἰ + indicative (ἀκούει) = simple condition (1st-class). The apodosis is also in the indicative.'
        },
        {
          g: 'ἐστὶν ἡ ἡμέρα ἐν ᾗ ὁ κύριος ἔρχεται.',
          level: 3,
          en: 'It is the day on which the Lord comes.',
          choices: [
            'It is the day on which the Lord comes.',
            'It is the Lord\'s day on which he comes.',
            'On the day the Lord comes is.',
            'The day comes on the Lord.'
          ],
          note: 'ᾗ = dat. sg. fem. of the relative pronoun, in the dative because ἐν "in" governs the dative. Antecedent ἡ ἡμέρα is fem. sg.'
        },
        {
          g: 'ὁ ἄνθρωπος οὗ τοὺς λόγους ἤκουσας διδάσκει ἡμᾶς.',
          level: 3,
          en: 'The man whose words you heard teaches us.',
          choices: [
            'The man whose words you heard teaches us.',
            'The man teaches us whose words you heard.',
            'We heard the man\'s words that he taught us.',
            'The man heard your words and teaches us.'
          ],
          note: 'οὗ = gen. sg. masc. of relative ὅς ("whose"). Inside the rel. clause it modifies τοὺς λόγους. Main verb (διδάσκει) comes after the embedded clause.'
        },
        {
          g: 'οὕτως ἐθεράπευσεν ὁ Ἰησοῦς τοὺς τυφλούς, ὥστε ἐθαύμασαν οἱ μαθηταί.',
          level: 3,
          en: 'Jesus healed the blind in this way, so that the disciples marveled.',
          choices: [
            'Jesus healed the blind in this way, so that the disciples marveled.',
            'Just as Jesus healed the blind, the disciples marveled.',
            'Jesus healed the blind because the disciples marveled.',
            'Jesus healed the blind in the way that the disciples marveled.'
          ],
          note: 'οὕτως … ὥστε ("in such a way … that") = result clause. ὥστε + indicative shows actual result. τοὺς τυφλούς is substantival adj. ("the blind [people]").'
        },
        {
          g: 'ὧδέ ἐστιν ὁ τόπος ὅπου ἦν ὁ Ἰησοῦς.',
          level: 1,
          en: 'Here is the place where Jesus was.',
          choices: [
            'Here is the place where Jesus was.',
            'Here Jesus is in the place.',
            'Where Jesus was is here.',
            'The place was here, where Jesus is.'
          ],
          note: 'ὧδε ("here") + ὅπου ("where") — local adverbs forming a deictic + relative pair. ἦν is the 3rd-sg imperfect of εἰμί.'
        },
        {
          g: 'οὕτως ἐδίδαξεν ὁ θεὸς τὸν λαόν.',
          level: 1,
          en: 'Thus God taught the people.',
          choices: [
            'Thus God taught the people.',
            'God did not teach the people thus.',
            'God teaches the people in this way.',
            'The people thus taught God.'
          ],
          note: 'οὕτως ("thus, in this manner") fronted. 1st-aor. ἐ-δίδαξ-εν (augment + stem διδακ- + σ → ξ + 3rd-sg secondary -ε(ν)).'
        },
        {
          g: 'ὅτι πιστεύεις, σώσει σε ὁ κύριος.',
          level: 2,
          en: 'Because you believe, the Lord will save you.',
          choices: [
            'Because you believe, the Lord will save you.',
            'The Lord will save you that you may believe.',
            'Because the Lord believes, you will be saved.',
            'If the Lord saves you, you believe.'
          ],
          note: 'ὅτι in causal sense ("because"). σε (acc. sg., enclitic — the unaccented form of σύ in oblique cases). σώσει = future of σῴζω.'
        },
        {
          g: 'ἐκεῖ συνάγονται οἱ μαθηταὶ καθὼς ἐλάλησεν αὐτοῖς ὁ Ἰησοῦς.',
          level: 2,
          en: 'There the disciples gather, just as Jesus spoke to them.',
          choices: [
            'There the disciples gather, just as Jesus spoke to them.',
            'There Jesus gathers them just as the disciples spoke.',
            'The disciples gather there, although Jesus did not speak to them.',
            'Jesus speaks to the disciples to gather there.'
          ],
          note: 'ἐκεῖ ("there") fronted; συνάγονται is mid./pass. (passive sense "are gathered" or middle "gather themselves"). καθώς ("just as") introduces a comparison clause.'
        },
        {
          g: 'οὐχὶ οὗτός ἐστιν ὁ ἄνθρωπος ὃν ἐζητοῦμεν;',
          level: 3,
          en: 'Is not this the man whom we were seeking?',
          choices: [
            'Is not this the man whom we were seeking?',
            'This is not the man for whom we were seeking.',
            'Is this man not seeking us?',
            'We were seeking a man who is not this [one].'
          ],
          note: 'οὐχί is the strong / interrogative form of οὐ; the question expects "yes". Relative ὅν (acc. sg. masc.) — agrees in gender/number with antecedent ὁ ἄνθρωπος, case from being object inside the rel. clause.'
        },
        {
          g: 'οὔτε ἐζήτησαν αὐτὸν οἱ Ἰουδαῖοι, οὔτε ἐπίστευσαν εἰς τὸν Χριστόν.',
          level: 3,
          en: 'Neither did the Jews seek him, nor did they believe in Christ.',
          choices: [
            'Neither did the Jews seek him, nor did they believe in Christ.',
            'The Jews sought him and believed in Christ.',
            'The Jews neither saw him nor knew Christ.',
            'Whether or not the Jews sought him, they believed in Christ.'
          ],
          note: 'οὔτε … οὔτε ("neither … nor") for paired negation. Two 1st-aor. ind. verbs in parallel: ἐζήτησαν, ἐπίστευσαν. πιστεύω + εἰς + acc. = "believe in".'
        }
      ]
    },

    11: {
      sentences: [
        {
          g: 'ὁ θεὸς ἀπέστειλεν τὸν υἱὸν αὐτοῦ εἰς τὸν κόσμον.',
          level: 1,
          en: 'God sent his son into the world.',
          choices: [
            'God sent his son into the world.',
            'The son of God sent the world.',
            'God will send his son into the world.',
            'His son sends God into the world.'
          ],
          note: 'ἀπέστειλεν: aor. of ἀποστέλλω. Liquid stem (-στελ-) drops the σ in the aorist and shows the stem-vowel change.'
        },
        {
          g: 'ὁ Ἰησοῦς εἶπεν τοῖς μαθηταῖς.',
          level: 1,
          en: 'Jesus spoke to the disciples.',
          choices: [
            'Jesus spoke to the disciples.',
            'Jesus speaks to the disciples.',
            'The disciples spoke to Jesus.',
            'Jesus will speak to the disciples.'
          ],
          note: 'εἶπεν: 2nd-aor. of λέγω (suppletive root εἰπ-). Dative of indirect object: τοῖς μαθηταῖς.'
        },
        {
          g: 'ἤγαγον τὸν τυφλὸν πρὸς τὸν Ἰησοῦν.',
          level: 1,
          en: 'They led the blind man to Jesus.',
          choices: [
            'They led the blind man to Jesus.',
            'They lead the blind man to Jesus.',
            'They will lead the blind man to Jesus.',
            'The blind man led them to Jesus.'
          ],
          note: '2nd-aor. of ἄγω: ἤγαγον. The aor. stem is reduplicated (ἀγ → ηγαγ-). 3rd-pl ending -ον.'
        },
        {
          g: 'οἱ μαθηταὶ ἔμενον ἐν τῷ οἴκῳ.',
          level: 2,
          en: 'The disciples were remaining in the house.',
          choices: [
            'The disciples were remaining in the house.',
            'The disciples remained in the house.',
            'The disciples remain in the house.',
            'The disciples will remain in the house.'
          ],
          note: 'ἔμενον = imperfect of μένω (augment ε- + present stem μεν- + secondary -ον). Imperfect = ongoing or repeated past action.'
        },
        {
          g: 'τὸν ἄρτον ἐσθίει ὁ Πέτρος καὶ πίνει τὸ ποτήριον.',
          level: 2,
          en: 'Peter eats the bread and drinks the cup.',
          choices: [
            'Peter eats the bread and drinks the cup.',
            'Peter drinks the bread and eats the cup.',
            'The bread eats Peter and drinks the cup.',
            'Peter ate the bread and drank the cup.'
          ],
          note: 'Both verbs are present; the aorist of ἐσθίω is suppletive (ἔφαγον). Object phrases fronted before each verb.'
        },
        {
          g: 'τότε ἀπῆλθον οἱ ἀπόστολοι εἰς τὸν τόπον ἐκεῖνον.',
          level: 2,
          en: 'Then the apostles went away to that place.',
          choices: [
            'Then the apostles went away to that place.',
            'The apostles always go away to that place.',
            'Then the apostles came to that place.',
            'Then the apostles went into the place.'
          ],
          note: 'ἀπῆλθον: 2nd-aor. of ἀπέρχομαι (deponent in present, but its 2nd-aor. ἀπῆλθον takes active endings — typical of suppletive roots). ἐκεῖνος in attributive position.'
        },
        {
          g: 'ὅτε ἦλθεν ὁ κύριος ἐν τῷ ἱερῷ, εἶδον αὐτὸν οἱ Φαρισαῖοι.',
          level: 3,
          en: 'When the Lord came in the temple, the Pharisees saw him.',
          choices: [
            'When the Lord came in the temple, the Pharisees saw him.',
            'When the Pharisees came in the temple, they saw the Lord.',
            'Then the Lord saw the Pharisees in the temple.',
            'Whenever the Lord goes to the temple, the Pharisees see him.'
          ],
          note: 'Two suppletive 2nd aorists: ἦλθεν (ἔρχομαι, root ἐλθ-) and εἶδον (ὁράω, root ἰδ-).'
        },
        {
          g: 'ἔβαλον τοὺς ἄρτους εἰς τὸν οἶκον, καὶ ἔφαγον οἱ μαθηταί.',
          level: 3,
          en: 'They threw the loaves into the house, and the disciples ate.',
          choices: [
            'They threw the loaves into the house, and the disciples ate.',
            'They will throw the loaves into the house, and the disciples will eat.',
            'They threw and ate the loaves of the disciples in the house.',
            'The disciples threw the loaves and ate in the house.'
          ],
          note: 'Two 2nd-aorists in sequence: ἔβαλον (βάλλω) and ἔφαγον (suppletive — ἐσθίω → ἔφαγον).'
        },
        {
          g: 'ὅτε εἶπεν ταῦτα ὁ Ἰησοῦς, ἀπῆλθον οἱ Ἰουδαῖοι, οὐκ ἐπίστευσαν γὰρ αὐτῷ.',
          level: 3,
          en: 'When Jesus said these things, the Jews went away, for they did not believe him.',
          choices: [
            'When Jesus said these things, the Jews went away, for they did not believe him.',
            'Jesus said these things, and the Jews went away believing him.',
            'When the Jews said these things, Jesus went away.',
            'Jesus said: the Jews went away because they believed.'
          ],
          note: 'Three aorists in sequence (εἶπεν, ἀπῆλθον, ἐπίστευσαν). γάρ postpositive ("for"). πιστεύω + dative.'
        },
        {
          g: 'ἔγνω ὁ Ἰησοῦς τὰς καρδίας αὐτῶν.',
          level: 1,
          en: 'Jesus knew their hearts.',
          choices: [
            'Jesus knew their hearts.',
            'Jesus knows their hearts.',
            'Their hearts knew Jesus.',
            'Jesus will know their hearts.'
          ],
          note: 'ἔγνω: athematic 2nd-aor. of γινώσκω (root γνω-). αὐτῶν (gen. pl.) = "their".'
        },
        {
          g: 'οἱ μαθηταὶ ἤνεγκαν τὸν ἄρτον.',
          level: 1,
          en: 'The disciples brought the bread.',
          choices: [
            'The disciples brought the bread.',
            'The disciples bring the bread.',
            'The bread brought the disciples.',
            'The disciples were bringing the bread.'
          ],
          note: 'ἤνεγκαν: aor. of φέρω (suppletive root ἐνεγκ-). 3rd-pl 1st-aor. ending -αν.'
        },
        {
          g: 'ἔπεσον ἐπὶ τὴν γῆν, ὅτε ἤκουσαν τὴν φωνήν.',
          level: 2,
          en: 'They fell on the ground when they heard the voice.',
          choices: [
            'They fell on the ground when they heard the voice.',
            'They heard the voice falling on the ground.',
            'When they fell, they heard a voice on the ground.',
            'On the ground a voice fell, which they heard.'
          ],
          note: 'ἔπεσον: 2nd-aor. of πίπτω (root πεσ-, no σα). ὅτε ("when") + indicative for definite past time.'
        },
        {
          g: 'ὁ Πέτρος ἐγείρει τὸ τέκνον ἀπὸ τοῦ θανάτου.',
          level: 2,
          en: 'Peter raises the child from death.',
          choices: [
            'Peter raises the child from death.',
            'Peter rises from the child\'s death.',
            'The child raises Peter from death.',
            'Peter awakens at the child\'s death.'
          ],
          note: 'ἐγείρω = "raise up, wake up". Liquid stem (-ρ-) with present-style ending. ἀπό + gen. = "(away) from".'
        },
        {
          g: 'ἀπέκτειναν τοὺς προφήτας οἱ Ἰουδαῖοι, καὶ ὁ ὄχλος ἔφυγεν εἰς τὴν ἔρημον.',
          level: 3,
          en: 'The Jews killed the prophets, and the crowd fled into the wilderness.',
          choices: [
            'The Jews killed the prophets, and the crowd fled into the wilderness.',
            'The prophets killed the Jews, and the crowd fled into the wilderness.',
            'The Jews killed the crowd, and the prophets fled into the wilderness.',
            'The Jews and the crowd killed the prophets in the wilderness.'
          ],
          note: 'ἀπέκτειναν: liquid aor. of ἀποκτείνω (no σ; stem-vowel change). ἔφυγεν: 2nd-aor. 3rd-sg of φεύγω, with neuter-style sg. agreement on the collective subject ὁ ὄχλος.'
        },
        {
          g: 'ὁ Ἰησοῦς κατέβη πρὸς τὴν θάλασσαν καὶ εὗρεν τοὺς ἀδελφοὺς αὐτοῦ ἐκεῖ.',
          level: 3,
          en: 'Jesus went down to the sea and found his brothers there.',
          choices: [
            'Jesus went down to the sea and found his brothers there.',
            'Jesus came up from the sea to his brothers there.',
            'Jesus\' brothers found him at the sea there.',
            'Jesus went down and his brothers found him there.'
          ],
          note: 'Two 2nd aorists: κατέβη (καταβαίνω, athematic root βη-) and εὗρεν (εὑρίσκω, root εὑρ-). πρός + acc. = "to / toward".'
        }
      ]
    },

    12: {
      sentences: [
        {
          g: 'ὁ πατὴρ φιλεῖ τὸν υἱόν.',
          level: 1,
          en: 'The father loves the son.',
          choices: [
            'The father loves the son.',
            'The son loves the father.',
            'The father sees the son.',
            'The fathers love the sons.'
          ],
          note: 'πατήρ is 3rd-decl. (nom. sg. πατήρ, acc. sg. πατέρα). φιλεῖ contracts from φιλέ-ει.'
        },
        {
          g: 'ἡ μήτηρ ἀκούει τὰ τέκνα.',
          level: 1,
          en: 'The mother hears the children.',
          choices: [
            'The mother hears the children.',
            'The children hear the mother.',
            'The mother sees the children.',
            'The mothers hear the children.'
          ],
          note: 'μήτηρ: 3rd-decl. like πατήρ (nom. sg. μήτηρ, gen. sg. μητρός).'
        },
        {
          g: 'τὸ φῶς ἐστιν ἐν τῷ ἱερῷ.',
          level: 1,
          en: 'The light is in the temple.',
          choices: [
            'The light is in the temple.',
            'The temple is in the light.',
            'There is light in the temple.',
            'The light of the temple is.'
          ],
          note: 'φῶς is 3rd-decl. neut. (nom./acc. sg. φῶς, gen. φωτός). ἐν + dat. for location.'
        },
        {
          g: 'ἡ γυνὴ λαμβάνει τὸν ἄρτον ἀπὸ τῆς χειρὸς αὐτοῦ.',
          level: 2,
          en: 'The woman takes the bread from his hand.',
          choices: [
            'The woman takes the bread from his hand.',
            'The woman gives the bread to his hand.',
            'The bread takes the woman from his hand.',
            'The hand of the woman takes his bread.'
          ],
          note: 'γυνή / γυναικός = 3rd-decl. fem.; χείρ / χειρός = 3rd-decl. fem. (gen. sg. ending -ος).'
        },
        {
          g: 'τίς ἐστιν ὁ υἱὸς τοῦ ἀνθρώπου;',
          level: 2,
          en: 'Who is the Son of Man?',
          choices: [
            'Who is the Son of Man?',
            'Whose son is the man?',
            'What is the son of the man?',
            'Someone is the man\'s son.'
          ],
          note: 'Interrogative τίς ("who?") — always accented. Distinguish from indefinite τις (enclitic, no accent).'
        },
        {
          g: 'ἔδωκεν ὁ πατὴρ ἄρτον τινὰ τῷ τέκνῳ.',
          level: 2,
          en: 'The father gave a certain bread to the child.',
          choices: [
            'The father gave a certain bread to the child.',
            'The father gave the child to the bread.',
            'A certain father gave bread to the child.',
            'The child gave bread to the father.'
          ],
          note: 'Indefinite τινά (acc. sg., enclitic, attaches to ἄρτον) = "a certain / some". ἔδωκεν here as a recognized aorist; full -μι system comes in ch 19.'
        },
        {
          g: 'ἐν τῇ νυκτὶ ἐγένετο φωνή.',
          level: 3,
          en: 'In the night a voice came.',
          choices: [
            'In the night a voice came.',
            'The voice came in the night.',
            'There was no voice in the night.',
            'The night had a voice.'
          ],
          note: 'ἐγένετο: 2nd aor. of γίνομαι ("become / happen"); often translated "there was / it came to pass". νύξ → dat. sg. νυκτί. (νύξ is a stop-stem 3rd-decl. fem., acceptable here as part of common 3rd-decl. recognition.)'
        },
        {
          g: 'τῇ μητρὶ τῶν τέκνων ἤνεγκαν τὰ ἱμάτια οἱ ἀπόστολοι.',
          level: 3,
          en: 'The apostles brought the garments to the children\'s mother.',
          choices: [
            'The apostles brought the garments to the children\'s mother.',
            'The children\'s mother brought the garments to the apostles.',
            'The apostles\' mother brought the children\'s garments.',
            'The mother brought the apostles\' children garments.'
          ],
          note: 'Dative phrase fronted (τῇ μητρὶ τῶν τέκνων). ἤνεγκαν: aor. of φέρω (suppletive root ἐνεγκ-). Subject (οἱ ἀπόστολοι) at the end.'
        },
        {
          g: 'ὁ Ἰησοῦς διὰ τοῦ πνεύματος ἐργάζεται καὶ τὴν χάριν τοῦ θεοῦ φέρει τοῖς ἀνθρώποις.',
          level: 3,
          en: 'Jesus works through the Spirit and brings God\'s grace to people.',
          choices: [
            'Jesus works through the Spirit and brings God\'s grace to people.',
            'Through Jesus the Spirit works God\'s grace for people.',
            'Jesus brings the Spirit and works God\'s grace for people.',
            'By the grace of God Jesus works for the Spirit\'s people.'
          ],
          note: 'Two 3rd-decl. -ματ- nouns (πνεῦμα, χάρις). διά + gen. = "through, by means of". Coordinated finite verbs (ἐργάζεται, φέρει).'
        },
        {
          g: 'ὁ πατὴρ ἔδωκεν τὸν ἄρτον τῷ υἱῷ αὐτοῦ.',
          level: 1,
          en: 'The father gave the bread to his son.',
          choices: [
            'The father gave the bread to his son.',
            'The son gave the bread to his father.',
            'The father gives bread to his son.',
            'The son\'s bread was given to his father.'
          ],
          note: 'πατήρ: 3rd-decl. (gen. sg. πατρός). ἔδωκεν: aor. of δίδωμι (recognizable; full -μι system in ch 19).'
        },
        {
          g: 'βλέπω τὸ φῶς ἐν τῇ νυκτί.',
          level: 1,
          en: 'I see the light in the night.',
          choices: [
            'I see the light in the night.',
            'The light sees me at night.',
            'I see the night light.',
            'The light is in the night.'
          ],
          note: 'φῶς: 3rd-decl. neut. (gen. φωτός). νύξ / νυκτός: 3rd-decl. fem. stop-stem (κ + σ → ξ in nom.).'
        },
        {
          g: 'ἡ ἐλπὶς ἡμῶν ἐστιν ὁ Χριστός.',
          level: 2,
          en: 'Our hope is Christ.',
          choices: [
            'Our hope is Christ.',
            'Christ is for our hope.',
            'Christ has our hope.',
            'Hope is Christ for us.'
          ],
          note: 'ἐλπίς / ἐλπίδος: 3rd-decl. fem. stop-stem (δ + σ → drops, leaving -ς). Predicate noun ὁ Χριστός is nominative.'
        },
        {
          g: 'ἡ μήτηρ ἤγαγεν τὸ τέκνον τῷ πατρί.',
          level: 2,
          en: 'The mother brought the child to the father.',
          choices: [
            'The mother brought the child to the father.',
            'The father brought the child to the mother.',
            'The child brought the mother to the father.',
            'The mother brings the child to the father.'
          ],
          note: 'μήτηρ / μητρός and πατήρ / πατρός: "family" 3rd-decl. irregulars. ἤγαγεν: 2nd-aor. of ἄγω (reduplicated). Dat. of indirect object: τῷ πατρί.'
        },
        {
          g: 'διὰ τοῦ αἵματος αὐτοῦ ἔχομεν χάριν.',
          level: 3,
          en: 'Through his blood we have grace.',
          choices: [
            'Through his blood we have grace.',
            'His grace has our blood.',
            'We have his blood through grace.',
            'By means of grace his blood is ours.'
          ],
          note: 'αἷμα / αἵματος: 3rd-decl. neut. -ματ- type. χάρις / χάριτος: 3rd-decl. fem. -ιτ- type (acc. sg. χάριν, with the ν re-attached). διά + gen. = "through, by means of".'
        },
        {
          g: 'τὸ πνεῦμα τοῦ θεοῦ φέρει χάριν τῇ καρδίᾳ τοῦ ἀνθρώπου.',
          level: 3,
          en: 'The Spirit of God brings grace to the heart of the man.',
          choices: [
            'The Spirit of God brings grace to the heart of the man.',
            'The man\'s heart brings grace to God\'s spirit.',
            'By the Spirit of God grace is brought from the heart of man.',
            'The grace of God\'s spirit brings the man\'s heart.'
          ],
          note: 'πνεῦμα (-ματ- 3rd-decl. neut.) and χάρις / χάριτος (3rd-decl. fem., dental-stem). Stacked genitives: τοῦ πνεύματος → τοῦ θεοῦ → τοῦ ἀνθρώπου.'
        }
      ]
    },

    13: {
      sentences: [
        {
          g: 'πᾶς ὁ λαὸς ἤκουσεν τὰ ῥήματα τοῦ προφήτου.',
          level: 1,
          en: 'All the people heard the words of the prophet.',
          choices: [
            'All the people heard the words of the prophet.',
            'The whole people heard one word of the prophet.',
            'Every word of the prophet heard the people.',
            'The people heard everything from the prophet.'
          ],
          note: 'πᾶς + article + noun = "all the / the whole"; without article = "every". (ῥήματα is from ch 12 -ματ- vocab.)'
        },
        {
          g: 'τὸ πνεῦμα τοῦ θεοῦ ἐστιν ἐν αὐτῷ.',
          level: 1,
          en: 'The Spirit of God is in him.',
          choices: [
            'The Spirit of God is in him.',
            'God\'s spirit is upon him.',
            'God is in his spirit.',
            'The spirit and God are in him.'
          ],
          note: 'πνεῦμα (-ματ- type 3rd-decl. neut.) — repeated to reinforce. Genitive τοῦ θεοῦ + locative ἐν phrase.'
        },
        {
          g: 'τὸ ὄνομα τοῦ βασιλέως μέγα ἐστίν.',
          level: 1,
          en: 'The name of the king is great.',
          choices: [
            'The name of the king is great.',
            'The king\'s great name is.',
            'A great king\'s name is.',
            'The great name is king.'
          ],
          note: 'ὄνομα: -ματ- type. βασιλεύς: 3rd-decl. -εύς (gen. βασιλέως). μέγα is predicate (no article), ἐστίν supplied.'
        },
        {
          g: 'εἷς γάρ ἐστιν ὁ θεὸς καὶ εἷς ὁ κύριος.',
          level: 2,
          en: 'For God is one, and the Lord is one.',
          choices: [
            'For God is one, and the Lord is one.',
            'For one God is the Lord and one is the Lord.',
            'God and the Lord are first.',
            'There is no God; one is the Lord.'
          ],
          note: 'εἷς = "one" (masc. nom. sg.); γάρ ("for") is postpositive — never first in its clause.'
        },
        {
          g: 'οὐδεὶς ἔχει τοιαύτην πίστιν ἐν τῷ Ἰσραήλ.',
          level: 2,
          en: 'No one has such faith in Israel.',
          choices: [
            'No one has such faith in Israel.',
            'Anyone has such faith in Israel.',
            'No one has faith in this Israel.',
            'Such faith is not in Israel.'
          ],
          note: 'οὐδείς (compound of οὐδέ + εἷς) = "no one". πίστις: 3rd-decl. fem. -ι type (acc. sg. πίστιν, gen. πίστεως). τοιαύτην ("such") is fem. acc. sg.'
        },
        {
          g: 'πάντα τὰ ἔθνη πιστεύσει εἰς τὸ ὄνομα αὐτοῦ.',
          level: 2,
          en: 'All the nations will believe in his name.',
          choices: [
            'All the nations will believe in his name.',
            'All the nations believe in his name.',
            'Every nation will believe his name.',
            'In all the nations he will believe.'
          ],
          note: 'πᾶς + article in neuter plural (πάντα τὰ ἔθνη) = "all the nations". ἔθνος: 3rd-decl. neut. -ος / -ους type.'
        },
        {
          g: 'ὁ βασιλεὺς εἶπεν τοῖς γραμματεῦσιν ὅτι ἐν τῇ πόλει ἐστὶν χάρις.',
          level: 3,
          en: 'The king told the scribes that there is grace in the city.',
          choices: [
            'The king told the scribes that there is grace in the city.',
            'The scribes told the king that the city has grace.',
            'The king saw the scribes in the city of grace.',
            'The scribes are kings; in the city is grace.'
          ],
          note: 'Several new 3rd-decl. forms: βασιλεύς / βασιλέως, γραμματεύς / dat. pl. γραμματεῦσιν, πόλις / πόλει (-ι declension), χάρις (3rd-decl. -ιτ stem).'
        },
        {
          g: 'ὁ ἀρχιερεὺς ἤνεγκεν τὸ θέλημα τοῦ θεοῦ τῷ ὄχλῳ διὰ τοῦ ῥήματος τοῦ ἀποστόλου.',
          level: 3,
          en: 'The high priest brought the will of God to the crowd through the word of the apostle.',
          choices: [
            'The high priest brought the will of God to the crowd through the word of the apostle.',
            'God\'s will brought the high priest to the apostle through the crowd.',
            'The crowd of the apostle brought God\'s word to the high priest.',
            'Through the high priest God brought his will to the apostle\'s crowd.'
          ],
          note: 'ἀρχιερεύς: 3rd-decl. -εύς. θέλημα, ῥῆμα: -ματ- type (ch 12). ἤνεγκεν: aor. of φέρω. διά + gen. = "through, by means of".'
        },
        {
          g: 'πᾶν τὸ ἔθνος ἐθαύμασεν περὶ τῶν ἔργων τῆς δυνάμεως τοῦ κυρίου.',
          level: 3,
          en: 'The whole nation marveled concerning the works of the Lord\'s power.',
          choices: [
            'The whole nation marveled concerning the works of the Lord\'s power.',
            'The whole nation of works marveled at the Lord\'s power.',
            'All the nations\' powerful works concerning the Lord marveled.',
            'The Lord\'s powerful work caused all the nations to marvel.'
          ],
          note: 'ἔθνος: 3rd-decl. neut. -ος / -ους. πᾶν agrees in gender. δύναμις: -ι / -εως. Stacked genitives drill: τῶν ἔργων → τῆς δυνάμεως → τοῦ κυρίου.'
        },
        {
          g: 'πᾶσα ἡ πόλις ἤκουσεν τὸ εὐαγγέλιον.',
          level: 1,
          en: 'The whole city heard the gospel.',
          choices: [
            'The whole city heard the gospel.',
            'Every city heard the gospel.',
            'The city\'s gospel heard everything.',
            'All the cities heard the gospel.'
          ],
          note: 'πᾶς + article + noun = "the whole" (predicate position with article); πᾶς without article = "every". πόλις: 3rd-decl. -ι type fem.'
        },
        {
          g: 'ὁ βασιλεὺς ἀκούει τὴν φωνὴν τοῦ ἀρχιερέως.',
          level: 1,
          en: 'The king hears the voice of the high priest.',
          choices: [
            'The king hears the voice of the high priest.',
            'The high priest hears the voice of the king.',
            'The king\'s voice is heard by the high priest.',
            'The voice of the king hears the high priest.'
          ],
          note: 'βασιλεύς / βασιλέως and ἀρχιερεύς / ἀρχιερέως: 3rd-decl. -εύς type. Vowel-stem genitive in -εως.'
        },
        {
          g: 'οὐδεὶς εἶδεν τὸν θεόν.',
          level: 2,
          en: 'No one has seen God.',
          choices: [
            'No one has seen God.',
            'Anyone has seen God.',
            'No one was seen by God.',
            'He has not seen God\'s no-one.'
          ],
          note: 'οὐδείς (compound of οὐδέ + εἷς) declines like εἷς: gen. οὐδενός, dat. οὐδενί. εἶδεν: 2nd-aor. (suppletive) of ὁράω.'
        },
        {
          g: 'πᾶν ἔθνος ἐλήλυθεν εἰς τὴν πόλιν.',
          level: 2,
          en: 'Every nation has come into the city.',
          choices: [
            'Every nation has come into the city.',
            'The whole nation came into the city.',
            'The nation came to every city.',
            'All nations will come into the city.'
          ],
          note: 'πᾶς without article = "every" (here πᾶν, neut. nom. sg., agrees with ἔθνος). ἔθνος: 3rd-decl. neut. -ος / -ους type. ἐλήλυθεν: perfect of ἔρχομαι (formally ch 16; recognizable).'
        },
        {
          g: 'ἓν σῶμα ἔχομεν, καὶ τὸ αὐτὸ πνεῦμα δίδωσιν ἡμῖν τὴν δύναμιν.',
          level: 3,
          en: 'We have one body, and the same Spirit gives us the power.',
          choices: [
            'We have one body, and the same Spirit gives us the power.',
            'We have one Spirit, and the body gives us the same power.',
            'The same body has one power, and the Spirit gives us [it].',
            'One body and one spirit give us the same power.'
          ],
          note: 'ἕν: neut. nom./acc. sg. of εἷς ("one"). τὸ αὐτό in attributive position = "the same". δύναμις: 3rd-decl. -ι type, acc. sg. δύναμιν.'
        },
        {
          g: 'πάντες οἱ βασιλεῖς ἤκουσαν τοῦ ῥήματος τοῦ προφήτου, καὶ τρεῖς ἐπίστευσαν εἰς τὸν θεόν.',
          level: 3,
          en: 'All the kings heard the saying of the prophet, and three believed in God.',
          choices: [
            'All the kings heard the saying of the prophet, and three believed in God.',
            'Three of the kings spoke to God in faith.',
            'All the kings spoke to the prophet about God.',
            'The prophet heard the saying of all three kings and believed.'
          ],
          note: 'πάντες (masc. nom. pl. of πᾶς, irregular 3rd-decl.). βασιλεύς: 3rd-decl. -εύς. ἀκούω here takes the genitive (τοῦ ῥήματος) — the more classical pattern for hearing a person/voice. τρεῖς is m./f. nom.'
        }
      ]
    },

    14: {
      sentences: [
        {
          g: 'ὁ λέγων τὸ εὐαγγέλιον ἐστὶν ὁ ἀπόστολος.',
          level: 1,
          en: 'The one speaking the gospel is the apostle.',
          choices: [
            'The one speaking the gospel is the apostle.',
            'The apostle is speaking the gospel.',
            'The gospel is being spoken by the apostle.',
            'The apostle was speaking the gospel.'
          ],
          note: 'ὁ λέγων: present active participle used substantivally — "the one who speaks". Article + participle (no noun) makes a noun phrase.'
        },
        {
          g: 'οἱ ἀκούοντες τὸν λόγον σῴζονται.',
          level: 1,
          en: 'Those hearing the word are saved.',
          choices: [
            'Those hearing the word are saved.',
            'Those who hear the word save [others].',
            'They save those who hear the word.',
            'The hearer of the word saves [himself].'
          ],
          note: 'οἱ ἀκούοντες: substantival pres. act. ptcp. (masc. nom. pl.). σῴζονται: pres. mid./pass. ("are saved").'
        },
        {
          g: 'ὁ πιστεύων εἰς ἐμὲ ἔχει ζωήν.',
          level: 1,
          en: 'The one believing in me has life.',
          choices: [
            'The one believing in me has life.',
            'I believe in him; he has life.',
            'Whoever has life believes in me.',
            'The believer has my life.'
          ],
          note: 'ὁ πιστεύων: substantival ptcp., "the one who believes". πιστεύω + εἰς + acc. = "believe in".'
        },
        {
          g: 'ὁ Ἰησοῦς, βλέπων τὸν ὄχλον, διδάσκει αὐτούς.',
          level: 2,
          en: 'Jesus, seeing the crowd, teaches them.',
          choices: [
            'Jesus, seeing the crowd, teaches them.',
            'Jesus sees the crowd; they teach him.',
            'Jesus, having seen the crowd, taught them.',
            'The crowd, seeing Jesus, teaches him.'
          ],
          note: 'Anarthrous participle (βλέπων) agreeing with the subject = circumstantial / adverbial use ("while seeing", "since he sees"). Present participle ⇒ same time as the main verb.'
        },
        {
          g: 'ἀκούσαντες τὸν λόγον ἐπίστευσαν.',
          level: 2,
          en: 'Having heard the word, they believed.',
          choices: [
            'Having heard the word, they believed.',
            'They were hearing the word and believed.',
            'They heard the word; they did not believe.',
            'Those who hear the word believe.'
          ],
          note: 'ἀκούσαντες: aor. act. ptcp. (masc. nom. pl.). Aorist participle ⇒ time prior to main verb ("having heard ... they then believed").'
        },
        {
          g: 'ὁ διδάσκαλος ὁ διδάσκων ἐν τῷ ἀμπελῶνι ὑπάγει εἰς τὴν πόλιν.',
          level: 2,
          en: 'The teacher who teaches in the vineyard goes into the city.',
          choices: [
            'The teacher who teaches in the vineyard goes into the city.',
            'The teacher teaches the city in the vineyard.',
            'The teacher of the vineyard teaches in the city.',
            'The teaching teacher of the vineyard is in the city.'
          ],
          note: 'Article-noun-article-participle (second attributive position): ὁ διδάσκαλος ὁ διδάσκων = "the teacher who teaches".'
        },
        {
          g: 'λέγοντος τοῦ Ἰησοῦ ταῦτα, οἱ μαθηταὶ ἤκουον αὐτοῦ.',
          level: 3,
          en: 'While Jesus was saying these things, the disciples were listening to him.',
          choices: [
            'While Jesus was saying these things, the disciples were listening to him.',
            'While the disciples were saying these things, Jesus was listening to them.',
            'After Jesus said these things, the disciples spoke to him.',
            'Jesus, the disciples speaking these things, listened to him.'
          ],
          note: 'Genitive absolute: a participle (λέγοντος) plus its own subject (τοῦ Ἰησοῦ), both in the genitive, syntactically detached from the main clause.'
        },
        {
          g: 'ἐλθὼν εἰς τὸν οἶκον, εὗρεν τοὺς μαθητὰς ἐσθίοντας τὸν ἄρτον.',
          level: 3,
          en: 'Having come into the house, he found the disciples eating the bread.',
          choices: [
            'Having come into the house, he found the disciples eating the bread.',
            'When he came into the house, the disciples were eating with him.',
            'Coming into the house, the disciples found the bread.',
            'He came and ate the bread in the disciples\' house.'
          ],
          note: 'Two participles: ἐλθών (aor. ptcp., "having come") modifying the subject; ἐσθίοντας (pres. ptcp., acc. pl.) modifying the object τοὺς μαθητάς.'
        },
        {
          g: 'ὄντων τῶν μαθητῶν ἐν τῷ πλοίῳ, ἐγένετο φωνὴ μεγάλη ἐν τῇ θαλάσσῃ.',
          level: 3,
          en: 'While the disciples were in the boat, a great voice came on the sea.',
          choices: [
            'While the disciples were in the boat, a great voice came on the sea.',
            'While there was a great voice at sea, the disciples were in a boat.',
            'In the disciples\' boat there was a sea-voice.',
            'The disciples in the boat made a great voice at sea.'
          ],
          note: 'Genitive absolute with the participle of εἰμί: ὄντων τῶν μαθητῶν = "while the disciples were". ἐγένετο = 2nd-aor. middle of γίνομαι.'
        },
        {
          g: 'ἡ γυνὴ ἡ πιστεύουσα σώζεται.',
          level: 1,
          en: 'The woman who believes is saved.',
          choices: [
            'The woman who believes is saved.',
            'The woman, believing, will save [him].',
            'The believing woman saves [her].',
            'The woman who saves is believing.'
          ],
          note: 'Attributive participle (ἡ πιστεύουσα, fem. nom. sg.) in second attributive position with article-noun-article-ptcp. σώζεται is pres. mid./pass. (passive sense).'
        },
        {
          g: 'ὁ μένων ἐν τῷ φωτὶ βλέπει.',
          level: 1,
          en: 'The one remaining in the light sees.',
          choices: [
            'The one remaining in the light sees.',
            'Whoever sees the light remains.',
            'The light remains seeing him.',
            'He sees the one who remains in the light.'
          ],
          note: 'ὁ μένων: substantival pres. act. ptcp., masc. nom. sg. ("the one who remains"). φωτί is dat. sg. of φῶς (3rd-decl. neut.).'
        },
        {
          g: 'ἐλθόντες εἰς τὸν οἶκον εὗρον τὸν Ἰησοῦν.',
          level: 2,
          en: 'Having come into the house, they found Jesus.',
          choices: [
            'Having come into the house, they found Jesus.',
            'Coming into the house, Jesus found them.',
            'While they came into the house, Jesus was found.',
            'Jesus came into the house and found them.'
          ],
          note: 'ἐλθόντες: 2nd-aor. ptcp. (masc. nom. pl., suppletive root ἐλθ-) — antecedent action: "having come". Main verb εὗρον is 2nd-aor. of εὑρίσκω.'
        },
        {
          g: 'ὁ Πέτρος ἀκούσας τὴν φωνὴν τοῦ κυρίου ἐθαύμασεν.',
          level: 2,
          en: 'Peter, having heard the voice of the Lord, marveled.',
          choices: [
            'Peter, having heard the voice of the Lord, marveled.',
            'Peter heard the marvelous voice of the Lord.',
            'Peter, while hearing the voice, marveled at the Lord.',
            'The Lord marveled at Peter who heard his voice.'
          ],
          note: 'Adverbial aor. ptcp. (ἀκούσας, masc. nom. sg.) modifying the subject. Aorist ⇒ prior action: "having heard, [then] marveled".'
        },
        {
          g: 'διδάσκοντος τοῦ Ἰησοῦ ἐν τῷ ἱερῷ, οἱ Φαρισαῖοι προσῆλθον αὐτῷ.',
          level: 3,
          en: 'While Jesus was teaching in the temple, the Pharisees came to him.',
          choices: [
            'While Jesus was teaching in the temple, the Pharisees came to him.',
            'While the Pharisees were teaching, Jesus came to the temple.',
            'After Jesus taught in the temple, the Pharisees came to him.',
            'Jesus, teaching the Pharisees, came into the temple.'
          ],
          note: 'Genitive absolute: a participle (διδάσκοντος, gen. sg. masc.) plus its own subject (τοῦ Ἰησοῦ), both gen., syntactically detached from the main clause.'
        },
        {
          g: 'οἱ ἀκούσαντες τὸν λόγον καὶ τηρήσαντες αὐτὸν εἰσελεύσονται εἰς τὴν βασιλείαν.',
          level: 3,
          en: 'Those who have heard the word and have kept it will enter into the kingdom.',
          choices: [
            'Those who have heard the word and have kept it will enter into the kingdom.',
            'Those who hear and keep the word are entering the kingdom.',
            'Those who hear the word will enter the kingdom and keep it.',
            'The kingdom hears and keeps those who enter it.'
          ],
          note: 'Two coordinated substantival aor. participles (οἱ ἀκούσαντες … τηρήσαντες). Aspect: aorist = perfective; the main verb is future indicative.'
        }
      ]
    },

    15: {
      sentences: [
        {
          g: 'ὁ λόγος ἐλαλήθη ὑπὸ τοῦ προφήτου.',
          level: 1,
          en: 'The word was spoken by the prophet.',
          choices: [
            'The word was spoken by the prophet.',
            'The prophet spoke the word.',
            'The word will be spoken by the prophet.',
            'The prophet\'s word is spoken.'
          ],
          note: 'Aorist passive: stem + θη + secondary endings (-ν / – / -σαν). ὑπό + genitive marks the personal agent.'
        },
        {
          g: 'οἱ μαθηταὶ ἐδιδάσκοντο ἐν τῷ ἱερῷ.',
          level: 1,
          en: 'The disciples were being taught in the temple.',
          choices: [
            'The disciples were being taught in the temple.',
            'The disciples taught in the temple.',
            'The disciples are being taught in the temple.',
            'The temple taught the disciples.'
          ],
          note: 'ἐ-διδάσκ-οντο: imperfect mid./pass. (here passive). 3rd-pl mid./pass. ending -οντο.'
        },
        {
          g: 'ἀπεκρίθη ὁ Ἰησοῦς τοῖς μαθηταῖς αὐτοῦ.',
          level: 1,
          en: 'Jesus answered his disciples.',
          choices: [
            'Jesus answered his disciples.',
            'The disciples answered Jesus.',
            'Jesus was answering his disciples.',
            'The disciple answered Jesus.'
          ],
          note: 'ἀπεκρίθη: aor. mid./pass. in form, active in meaning ("answered"). Dative τοῖς μαθηταῖς for the addressee.'
        },
        {
          g: 'ἐβαπτίσθησαν οἱ μαθηταὶ ἐν τῇ θαλάσσῃ.',
          level: 2,
          en: 'The disciples were baptized in the sea.',
          choices: [
            'The disciples were baptized in the sea.',
            'The disciples baptized themselves in the sea.',
            'The sea baptized the disciples.',
            'The disciples will be baptized in the sea.'
          ],
          note: 'ἐ-βαπτι-σ-θη-σαν: augment + stem + σ + θη + 3rd-pl. secondary -σαν.'
        },
        {
          g: 'σωθήσεσθε διὰ τῆς πίστεως.',
          level: 2,
          en: 'You will be saved through faith.',
          choices: [
            'You will be saved through faith.',
            'You are saved through faith.',
            'You were saved through faith.',
            'You will save through faith.'
          ],
          note: 'σωθήσεσθε: future passive 2nd-pl of σῴζω. Future passive built on θη + future-mid. endings (-θησομαι).'
        },
        {
          g: 'οἱ ἀσθενεῖς ἐθεραπεύθησαν ὑπὸ τοῦ Ἰησοῦ.',
          level: 2,
          en: 'The sick were healed by Jesus.',
          choices: [
            'The sick were healed by Jesus.',
            'Jesus healed the sick.',
            'The sick will be healed by Jesus.',
            'The sick healed Jesus.'
          ],
          note: 'οἱ ἀσθενεῖς (substantival adj., "the sick"); ἐθεραπεύθησαν 3rd-pl aor. pass.; ὑπό + gen. = personal agent.'
        },
        {
          g: 'διὰ τοῦ Χριστοῦ σῴζονται οἱ ἁμαρτωλοί.',
          level: 3,
          en: 'Through Christ the sinners are saved.',
          choices: [
            'Through Christ the sinners are saved.',
            'Through the sinners Christ is saved.',
            'Because of Christ the sinners save themselves.',
            'By Christ the sinners were saved.'
          ],
          note: 'σῴζονται: present mid./pass. 3rd pl. (-ονται). διά + genitive = "through, by means of"; διά + accusative would be "because of".'
        },
        {
          g: 'ἠγέρθη ὁ κύριος ἐκ νεκρῶν, καὶ ἐφανερώθη τοῖς μαθηταῖς αὐτοῦ.',
          level: 3,
          en: 'The Lord was raised from [the] dead and was made manifest to his disciples.',
          choices: [
            'The Lord was raised from [the] dead and was made manifest to his disciples.',
            'The Lord raised the dead and revealed himself to the disciples.',
            'The dead Lord was raised by the disciples and revealed himself.',
            'The Lord made his disciples rise and appear from the dead.'
          ],
          note: 'Two aor. passives in series: ἠγέρθη (ἐγείρω), ἐφανερώθη (φανερόω). νεκρῶν is gen. pl. of substantive adj. ("[the] dead").'
        },
        {
          g: 'ὑπὸ τοῦ θεοῦ ἐπέμφθη εἰς τὸν κόσμον ὁ ἀπόστολος, ἀλλὰ ὁ κόσμος οὐκ ἐδέξατο αὐτόν.',
          level: 3,
          en: 'The apostle was sent into the world by God, but the world did not receive him.',
          choices: [
            'The apostle was sent into the world by God, but the world did not receive him.',
            'God sent the apostle, and the world received him.',
            'The apostle sent the world to God, who did not receive him.',
            'The world\'s apostle was sent by God, who received him not.'
          ],
          note: 'ἐπέμφθη: aor. pass. of πέμπω (-π + θ → -φθ). ὑπό + gen. = personal agent. Contrast with active aor. ἐδέξατο in the second clause.'
        },
        {
          g: 'ὁ ἄρτος πέμπεται τοῖς ἀσθενέσιν.',
          level: 1,
          en: 'The bread is sent to the sick.',
          choices: [
            'The bread is sent to the sick.',
            'The sick send the bread.',
            'The bread will be sent to the sick.',
            'The bread sends [itself] to the sick.'
          ],
          note: 'πέμπεται: pres. mid./pass. 3rd-sg of πέμπω (passive sense here). τοῖς ἀσθενέσιν is dat. pl. of substantival adj. ἀσθενής (3rd-decl. -ης / -ες).'
        },
        {
          g: 'ἐσώθημεν ὑπὸ τοῦ θεοῦ.',
          level: 1,
          en: 'We were saved by God.',
          choices: [
            'We were saved by God.',
            'God was saved by us.',
            'We will be saved by God.',
            'We are being saved by God.'
          ],
          note: 'Aor. pass. 1st-pl: ἐ-σώ-θη-μεν (augment + stem σω- + θη + secondary -μεν). ὑπό + gen. = personal agent.'
        },
        {
          g: 'ὁ θάνατος καταργηθήσεται διὰ τοῦ Χριστοῦ.',
          level: 2,
          en: 'Death will be abolished through Christ.',
          choices: [
            'Death will be abolished through Christ.',
            'Christ abolished death.',
            'Death abolishes Christ.',
            'Through Christ death abolishes [itself].'
          ],
          note: 'Future passive 3rd-sg: stem + θη + future-mid. endings (καταργ-η-θή-σεται). διά + gen. = "through".'
        },
        {
          g: 'οἱ ἀδελφοὶ ἐκλήθησαν ὑπὸ τοῦ θεοῦ εἰς τὴν εἰρήνην.',
          level: 2,
          en: 'The brothers were called by God into peace.',
          choices: [
            'The brothers were called by God into peace.',
            'God called the brothers from peace.',
            'The brothers called God into peace.',
            'The brothers were calling on God for peace.'
          ],
          note: 'ἐκλήθησαν: aor. pass. 3rd-pl of καλέω (ε + θ → η, then θη + secondary -σαν). ὑπό + gen. = personal agent.'
        },
        {
          g: 'διὰ τῆς πίστεως ἁγιαζόμεθα, καὶ ἐν τῇ ἀγάπῃ τηρούμεθα.',
          level: 3,
          en: 'Through faith we are made holy, and in love we are kept.',
          choices: [
            'Through faith we are made holy, and in love we are kept.',
            'Through faith we make others holy, and we keep love.',
            'Faith makes us holy and love keeps itself in us.',
            'By faith we are kept holy through love.'
          ],
          note: 'Two pres. mid./pass. 1st-pl forms (passive sense): ἁγιαζόμεθα (ch 15 vocab), τηρούμεθα (contracted from τηρεό-μεθα). διά + gen. = "through"; ἐν + dat. = "in".'
        },
        {
          g: 'ἀπεκρίθη ὁ Ἰησοῦς, καὶ ἐπορεύθη πρὸς τὸν πατέρα τὸν πέμψαντα αὐτόν.',
          level: 3,
          en: 'Jesus answered, and went to the Father who sent him.',
          choices: [
            'Jesus answered, and went to the Father who sent him.',
            'Jesus answered the Father who sent him to go.',
            'The Father sent Jesus, who answered and went.',
            'Jesus went to answer the Father, who sent him.'
          ],
          note: 'Two θη-form deponents: ἀπεκρίθη ("answered") and ἐπορεύθη ("went") — passive in form, active in meaning. Substantival aor. ptcp. τὸν πέμψαντα ("the one who sent").'
        }
      ]
    },

    16: {
      sentences: [
        {
          g: 'γέγραπται ἐν τῷ νόμῳ.',
          level: 1,
          en: 'It has been written in the law.',
          choices: [
            'It has been written in the law.',
            'It is being written in the law.',
            'It will be written in the law.',
            'It was being written in the law.'
          ],
          note: 'γέγραπται: perfect mid./pass. 3rd sg. of γράφω. Reduplication γέ- + perfect stem; the perfect signals a present standing result of a past act.'
        },
        {
          g: 'πεπίστευκα εἰς τὸν Χριστόν.',
          level: 1,
          en: 'I have believed in Christ.',
          choices: [
            'I have believed in Christ.',
            'I believe in Christ.',
            'I believed in Christ.',
            'I will believe in Christ.'
          ],
          note: 'πεπίστευκα: perfect act. 1st-sg of πιστεύω. Reduplication πε- + κ + α-class. Perfect = present standing result of a past act of believing.'
        },
        {
          g: 'ὁ Ἰησοῦς ἐλήλυθεν εἰς τὸν κόσμον.',
          level: 1,
          en: 'Jesus has come into the world.',
          choices: [
            'Jesus has come into the world.',
            'Jesus comes into the world.',
            'Jesus came into the world.',
            'Jesus will come into the world.'
          ],
          note: 'ἐλήλυθεν: perfect of ἔρχομαι (suppletive — perfect built on root ἐλυθ-/ἐληλυθ-). 3rd-sg perfect.'
        },
        {
          g: 'λέλυκα τὰ ἔργα τοῦ πονηροῦ.',
          level: 2,
          en: 'I have undone the works of the evil one.',
          choices: [
            'I have undone the works of the evil one.',
            'I am undoing the works of the evil one.',
            'I will undo the works of the evil one.',
            'The evil one\'s works have undone me.'
          ],
          note: 'λέλυκα: perfect active 1st sg. of λύω — reduplication λε- + κ + α-class endings. τοῦ πονηροῦ = substantive adj. ("of the evil one").'
        },
        {
          g: 'τετήρηκας τὸν λόγον μου.',
          level: 2,
          en: 'You have kept my word.',
          choices: [
            'You have kept my word.',
            'You kept my word.',
            'You keep my word.',
            'You will keep my word.'
          ],
          note: 'τετήρηκας: perfect act. 2nd-sg of τηρέω. Reduplication τε-, lengthened stem (τηρη-), κ, α-class endings.'
        },
        {
          g: 'ὁ νόμος γέγραπται ἐπὶ τὰς καρδίας ἡμῶν.',
          level: 2,
          en: 'The law has been written on our hearts.',
          choices: [
            'The law has been written on our hearts.',
            'The law writes upon our hearts.',
            'Our hearts have written the law.',
            'The law was written on our hearts.'
          ],
          note: 'γέγραπται: perfect mid./pass. ἐπί + acc. = "upon" (with motion toward / location seen as a target). The perfect = standing inscription, not a one-time event.'
        },
        {
          g: 'ἑωράκαμεν τὴν δόξαν αὐτοῦ.',
          level: 3,
          en: 'We have seen his glory.',
          choices: [
            'We have seen his glory.',
            'We see his glory.',
            'His glory has seen us.',
            'We saw his glory.'
          ],
          note: 'ἑωράκαμεν: irregular perfect active 1st pl. of ὁράω. Compare aorist εἴδομεν — same lexeme, different aspect: perfect = "have seen and now retain the seeing".'
        },
        {
          g: 'πεφανέρωται ἡμῖν ἡ ἀλήθεια διὰ τοῦ ἀποστόλου τοῦ ἀπεσταλμένου.',
          level: 3,
          en: 'The truth has been revealed to us through the apostle who has been sent.',
          choices: [
            'The truth has been revealed to us through the apostle who has been sent.',
            'The apostle revealed our truth through being sent.',
            'Sending the apostle revealed our truth.',
            'The truth has been sent to us through the apostle\'s revelation.'
          ],
          note: 'Two perfect mid./pass. forms: πεφανέρωται (3rd-sg of φανερόω) and ἀπεσταλμένου (perf. mid./pass. ptcp., gen. sg., of ἀποστέλλω).'
        },
        {
          g: 'πεπιστεύκαμεν καὶ ἐγνώκαμεν ὅτι ἐλήλυθεν ὁ υἱὸς τοῦ θεοῦ καὶ δέδωκεν ἡμῖν τὴν χάριν.',
          level: 3,
          en: 'We have believed and have known that the Son of God has come and has given us the grace.',
          choices: [
            'We have believed and have known that the Son of God has come and has given us the grace.',
            'We believed; we knew the Son had come and was giving us grace.',
            'We believe and know that the Son of God comes and gives us grace.',
            'Believing and knowing, we received grace from the Son of God.'
          ],
          note: 'Four perfects: πεπιστεύκαμεν, ἐγνώκαμεν (γινώσκω, irregular), ἐλήλυθεν (ἔρχομαι), δέδωκεν (δίδωμι). Each emphasizes the abiding result.'
        },
        {
          g: 'δεδόξακα τὸν θεὸν ἐν τῷ ἱερῷ.',
          level: 1,
          en: 'I have glorified God in the temple.',
          choices: [
            'I have glorified God in the temple.',
            'I am glorifying God in the temple.',
            'I will glorify God in the temple.',
            'I glorified God in the temple.'
          ],
          note: 'δεδόξακα: perfect act. 1st-sg of δοξάζω. Reduplication δε- + κ-suffix + α-class endings (δε-δόξα-κ-α). The perfect signals an abiding result of the act of glorifying.'
        },
        {
          g: 'ὁ διδάσκαλος μεμένηκεν ἐν τῇ συναγωγῇ.',
          level: 1,
          en: 'The teacher has remained in the synagogue.',
          choices: [
            'The teacher has remained in the synagogue.',
            'The teacher remained in the synagogue.',
            'The teacher remains in the synagogue.',
            'The teacher will remain in the synagogue.'
          ],
          note: 'μεμένηκεν: perfect act. 3rd-sg of μένω (consonant-initial → reduplication με-; lengthened stem μενη-; κ + α-class).'
        },
        {
          g: 'πεφίλημαι ὑπὸ τοῦ πατρός.',
          level: 2,
          en: 'I have been loved by the Father.',
          choices: [
            'I have been loved by the Father.',
            'I love the Father.',
            'The Father will be loved by me.',
            'I am loved by the Father.'
          ],
          note: 'πεφίλημαι: perfect mid./pass. 1st-sg of φιλέω (passive sense). Reduplication πε- (smooth-breathing on the consonant: φ → π) + lengthened stem + primary mid. ending. ὑπό + gen. = personal agent.'
        },
        {
          g: 'ἑώρακας τὸν πατέρα μου.',
          level: 2,
          en: 'You have seen my Father.',
          choices: [
            'You have seen my Father.',
            'You see my Father.',
            'You will see my Father.',
            'My Father has seen you.'
          ],
          note: 'ἑώρακας: irregular perfect 2nd-sg of ὁράω. Reduplication takes the form ἑω-, the stem is -ορα-/-ορακ-. Compare aorist εἶδες (suppletive root ἰδ-).'
        },
        {
          g: 'τετηρήκαμεν τὰς ἐντολὰς αὐτοῦ, καὶ ἐν τῇ ἀγάπῃ αὐτοῦ μεμενήκαμεν.',
          level: 3,
          en: 'We have kept his commandments, and we have remained in his love.',
          choices: [
            'We have kept his commandments, and we have remained in his love.',
            'We keep his commandments, and we remain in his love.',
            'We will keep his commandments and remain in his love.',
            'His commandments have been kept, and his love remains.'
          ],
          note: 'Two perfects: τετηρήκαμεν (τηρέω, with reduplication τε- and lengthened stem τηρη-) and μεμενήκαμεν (μένω). Both signal a present standing result.'
        },
        {
          g: 'γέγραπται γὰρ ὅτι ἀπέσταλκεν ὁ θεὸς τὸν υἱὸν αὐτοῦ εἰς τὸν κόσμον.',
          level: 3,
          en: 'For it has been written that God has sent his son into the world.',
          choices: [
            'For it has been written that God has sent his son into the world.',
            'For it is written, the son sent God into the world.',
            'God\'s son has written that he was sent into the world.',
            'For he writes that God sent his son into the world.'
          ],
          note: 'γέγραπται (perfect mid./pass. of γράφω) — recurring NT formula. ἀπέσταλκεν: perfect act. of ἀποστέλλω (liquid; reduplication + κ + α-class).'
        }
      ]
    },

    17: {
      sentences: [
        {
          g: 'ἦλθον ἵνα ζωὴν ἔχωσιν.',
          level: 1,
          en: 'I came in order that they might have life.',
          choices: [
            'I came in order that they might have life.',
            'I will come in order that they have life.',
            'They came so that I might have life.',
            'I am coming because they have life.'
          ],
          note: 'ἵνα + subjunctive (ἔχωσι, pres. act. subj. 3rd pl.) = standard purpose clause. Long thematic vowel ω is the subjunctive marker.'
        },
        {
          g: 'προσευχώμεθα ἵνα δοξάζωμεν τὸν θεόν.',
          level: 1,
          en: 'Let us pray that we may glorify God.',
          choices: [
            'Let us pray that we may glorify God.',
            'We pray and glorify God.',
            'We will pray to glorify God.',
            'They pray that we glorify God.'
          ],
          note: 'Two subjunctives: hortatory προσευχώμεθα ("let us pray", 1st-pl mid. subj.) + ἵνα + δοξάζωμεν (1st-pl pres. act. subj.).'
        },
        {
          g: 'ἀγαπῶμεν ἀλλήλους.',
          level: 1,
          en: 'Let us love one another.',
          choices: [
            'Let us love one another.',
            'We love one another.',
            'We will love one another.',
            'They love one another.'
          ],
          note: 'Hortatory subjunctive: 1st-pl pres. subj. of ἀγαπάω (contracted from ἀγαπά-ωμεν), meaning "let us …".'
        },
        {
          g: 'ἐὰν πιστεύσωμεν εἰς αὐτόν, σωθησόμεθα.',
          level: 2,
          en: 'If we believe in him, we will be saved.',
          choices: [
            'If we believe in him, we will be saved.',
            'If we believed in him, we were saved.',
            'If we save him, we will believe.',
            'Although we believe in him, we are not saved.'
          ],
          note: 'ἐάν + aor. subj. (πιστεύσωμεν) is the future-more-vivid conditional; the apodosis is a future-passive indicative (σωθησόμεθα).'
        },
        {
          g: 'μὴ φοβηθῆτε τοὺς ἐχθροὺς ὑμῶν.',
          level: 2,
          en: 'Do not fear your enemies.',
          choices: [
            'Do not fear your enemies.',
            'Do not let your enemies fear you.',
            'You will not fear your enemies.',
            'Your enemies do not fear you.'
          ],
          note: 'Prohibition: μή + aor. subj. (φοβηθῆτε, 2nd-pl). Aspect-perfective prohibition: "don\'t (start to) fear".'
        },
        {
          g: 'οὐ μὴ ἀπολέσῃ ὁ θεὸς τοὺς ἁγίους αὐτοῦ.',
          level: 2,
          en: 'God will certainly not destroy his saints.',
          choices: [
            'God will certainly not destroy his saints.',
            'God will surely destroy his saints.',
            'God did not destroy his saints.',
            'May God not destroy his saints.'
          ],
          note: 'οὐ μή + aor. subj. = emphatic negation. ἀπολέσῃ: aor. act. subj. 3rd-sg (ἀπόλλυμι, glossed in vocab as ἀναιρέω-class action verb).'
        },
        {
          g: 'ὅταν ἔλθῃ ὁ υἱὸς τοῦ ἀνθρώπου ἐν τῇ δόξῃ αὐτοῦ, εὑρήσει τὴν πίστιν;',
          level: 3,
          en: 'When the Son of Man comes in his glory, will he find faith?',
          choices: [
            'When the Son of Man comes in his glory, will he find faith?',
            'When the Son of Man came in his glory, he found faith.',
            'Whenever the Son of Man comes, he loses his glory.',
            'The Son of Man will come and find his glory in faith.'
          ],
          note: 'ὅταν (= ὅτε + ἄν) + aor. subj. (ἔλθῃ) for an indefinite future temporal clause; main verb is future indicative.'
        },
        {
          g: 'ἐάν τις τηρῇ τὸν λόγον μου, ὁ πατὴρ ἀγαπήσει αὐτόν, καὶ πρὸς αὐτὸν ἐλευσόμεθα.',
          level: 3,
          en: 'If anyone keeps my word, the Father will love him, and we will come to him.',
          choices: [
            'If anyone keeps my word, the Father will love him, and we will come to him.',
            'If the Father loves anyone, he keeps my word and comes to him.',
            'Whoever keeps my word loves the Father and comes.',
            'If we come to him, the Father will love anyone who keeps my word.'
          ],
          note: 'ἐάν + pres. subj. (τηρῇ) for general/iterative condition; future indicatives in apodosis (ἀγαπήσει, ἐλευσόμεθα — fut. of ἔρχομαι is suppletive ἐλεύσομαι).'
        },
        {
          g: 'ἵνα μὴ κρινώμεθα ὑπὸ τοῦ θεοῦ, μετανοῶμεν καὶ τηρῶμεν τὰς ἐντολὰς αὐτοῦ.',
          level: 3,
          en: 'In order that we may not be judged by God, let us repent and keep his commandments.',
          choices: [
            'In order that we may not be judged by God, let us repent and keep his commandments.',
            'God will not judge us if we repent and keep his commandments.',
            'Let us repent and keep his commandments, for God does not judge us.',
            'God\'s judgment of us makes us repent and keep his commandments.'
          ],
          note: 'Negative purpose ἵνα μή + pres. mid./pass. subj. (κρινώμεθα). Hortatory subj. with two contract verbs: μετανοῶμεν, τηρῶμεν.'
        },
        {
          g: 'ἐάν τις ἀκούῃ τὸν λόγον, σωθήσεται.',
          level: 1,
          en: 'If anyone hears the word, he will be saved.',
          choices: [
            'If anyone hears the word, he will be saved.',
            'Whoever was saved heard the word.',
            'If someone heard the word, he was saved.',
            'Although anyone hears the word, he will be saved.'
          ],
          note: 'ἐάν + pres. subj. (ἀκούῃ) for a future-more-vivid / general condition. Apodosis in future indicative (σωθήσεται, fut. pass. of σῴζω).'
        },
        {
          g: 'ἔρχομαι ἵνα δοξάσω τὸν θεόν.',
          level: 1,
          en: 'I am coming in order that I may glorify God.',
          choices: [
            'I am coming in order that I may glorify God.',
            'I came so that I glorified God.',
            'I will come because I glorified God.',
            'I am glorifying God when I come.'
          ],
          note: 'ἵνα + aor. subj. (δοξάσω, 1st-sg) = standard purpose clause. Aorist subj. ⇒ perfective aspect, not past time.'
        },
        {
          g: 'μὴ κρίνωμεν ἀλλήλους.',
          level: 2,
          en: 'Let us not judge one another.',
          choices: [
            'Let us not judge one another.',
            'We do not judge one another.',
            'Do not judge us.',
            'We will not judge one another.'
          ],
          note: 'Negative hortatory: μή + 1st-pl pres. subj. (κρίνωμεν). ἀλλήλους is the reciprocal pronoun (acc. pl. masc., "one another").'
        },
        {
          g: 'ὅταν ἁμαρτάνωσιν, ὁ πατὴρ ἐλεεῖ αὐτούς.',
          level: 2,
          en: 'Whenever they sin, the Father has mercy on them.',
          choices: [
            'Whenever they sin, the Father has mercy on them.',
            'When they sinned, the Father had mercy on them.',
            'If they sin, the Father will have mercy on them.',
            'The Father has mercy, although they sin.'
          ],
          note: 'ὅταν (= ὅτε + ἄν) + pres. subj. (ἁμαρτάνωσιν) for an indefinite/iterative time clause. Apodosis is present indicative — habitual. ἐλεέω + acc. of person = "have mercy on".'
        },
        {
          g: 'οὐ μὴ εἰσέλθῃ εἰς τὴν βασιλείαν τοῦ θεοῦ ὁ μὴ φιλῶν τὸν ἀδελφὸν αὐτοῦ.',
          level: 3,
          en: 'The one who does not love his brother will certainly not enter into the kingdom of God.',
          choices: [
            'The one who does not love his brother will certainly not enter into the kingdom of God.',
            'Whoever loves his brother will certainly enter into God\'s kingdom.',
            'The one who does not love his brother does not enter the kingdom.',
            'He will not love his brother in the kingdom of God.'
          ],
          note: 'οὐ μή + aor. subj. (εἰσέλθῃ) = strongest possible negation. Substantival adverbial ptcp. ὁ μὴ φιλῶν ("the one not loving") with μή instead of οὐ — expected with non-indicative / indefinite forms.'
        },
        {
          g: 'δοξάζωμεν τὸν θεόν, ἵνα γνωσθῇ ἐν ἡμῖν, καὶ ἵνα ὁ κόσμος πιστεύσῃ.',
          level: 3,
          en: 'Let us glorify God, in order that he may be known in us, and in order that the world may believe.',
          choices: [
            'Let us glorify God, in order that he may be known in us, and in order that the world may believe.',
            'We glorify God because he is known in us and the world believes.',
            'Let God be known and the world believe through our glorifying.',
            'We will glorify God so that he knows us and the world believes.'
          ],
          note: 'Hortatory δοξάζωμεν (1st-pl pres. subj. of δοξάζω). Two ἵνα + subj. purpose clauses: γνωσθῇ (aor. pass. subj. of γινώσκω) and πιστεύσῃ (aor. act. subj.).'
        }
      ]
    },

    18: {
      sentences: [
        {
          g: 'ἀκούσατε τὸν λόγον τοῦ θεοῦ.',
          level: 1,
          en: 'Hear (pl.) the word of God.',
          choices: [
            'Hear (pl.) the word of God.',
            'They hear the word of God.',
            'We have heard the word of God.',
            'He hears the word of God.'
          ],
          note: '1st-aor. act. imperative 2nd pl.: aor. stem + σα + -τε. No augment (augment is indicative-only).'
        },
        {
          g: 'ἔγειρε τὸν παῖδα.',
          level: 1,
          en: 'Raise (sg.) the child.',
          choices: [
            'Raise (sg.) the child.',
            'You raise the child.',
            'Let him raise the child.',
            'Get up, child.'
          ],
          note: 'Pres. act. imperative 2nd-sg: bare stem ending in -ε. Imperative inflects only in 2nd / 3rd person.'
        },
        {
          g: 'οἴδαμεν ὅτι ἀληθής ἐστιν ὁ λόγος αὐτοῦ.',
          level: 1,
          en: 'We know that his word is true.',
          choices: [
            'We know that his word is true.',
            'We say that his word is true.',
            'His word is, we know, the truth.',
            'He knows that our word is true.'
          ],
          note: 'οἶδα is a perfect-formed verb with present meaning ("I know"). 1st-pl οἴδαμεν. ὅτι + indicative for indirect statement.'
        },
        {
          g: 'θέλομεν εἶναι μετὰ τοῦ Χριστοῦ.',
          level: 2,
          en: 'We want to be with Christ.',
          choices: [
            'We want to be with Christ.',
            'We want Christ to be with us.',
            'We are with Christ.',
            'We are willing for Christ.'
          ],
          note: 'εἶναι = present active infinitive of εἰμί ("to be"). μετά + genitive = "with (in company with)".'
        },
        {
          g: 'καλόν ἐστιν μένειν ἐν τῷ οἴκῳ.',
          level: 2,
          en: 'It is good to remain in the house.',
          choices: [
            'It is good to remain in the house.',
            'It is good for the house to remain.',
            'The good thing remains in the house.',
            'Remaining in the house is the good [man].'
          ],
          note: 'Adjective + impersonal ἐστίν + complementary infinitive: καλόν ἐστιν + inf. ("it is good to V").'
        },
        {
          g: 'διὰ τὸ ἀκούειν τὸν λόγον ἐπίστευσαν.',
          level: 2,
          en: 'Because of hearing the word, they believed.',
          choices: [
            'Because of hearing the word, they believed.',
            'Through the hearing of the word they believed.',
            'They heard and believed the word\'s reason.',
            'In hearing the word they will believe.'
          ],
          note: 'διά + acc. + articular infinitive (τὸ ἀκούειν) = causal ("because of V-ing"). Note τὸν λόγον is the object inside the inf. clause.'
        },
        {
          g: 'πιστεύετε εἰς τὸν θεόν, καὶ εἰς ἐμὲ πιστεύετε.',
          level: 3,
          en: 'Believe in God, and believe in me.',
          choices: [
            'Believe in God, and believe in me.',
            'You believe in God, and you believe in me.',
            'Believe me about God, and believe me about myself.',
            'He believes in God; believe in me.'
          ],
          note: 'πιστεύετε is ambiguous in form between 2nd-pl pres. ind. ("you believe") and pres. imperative ("believe!"). Context (parallel with the second clause\'s force) favours imperative.'
        },
        {
          g: 'ἐν τῷ προσεύχεσθαι αὐτοὺς ἐγένετο φωνὴ ἐκ τοῦ οὐρανοῦ.',
          level: 3,
          en: 'While they were praying, a voice came from heaven.',
          choices: [
            'While they were praying, a voice came from heaven.',
            'They prayed concerning the voice that came from heaven.',
            'They were praying, and a voice will come from heaven.',
            'In praying, they caused a voice from heaven.'
          ],
          note: 'ἐν τῷ + inf. (προσεύχεσθαι, pres. mid. inf.) for contemporaneous time ("while V-ing"). The acc. αὐτούς is the subject of the inf.'
        },
        {
          g: 'εἶπεν τοῖς μαθηταῖς τοῦ ἀκολουθεῖν αὐτῷ καὶ τηρεῖν τὰς ἐντολὰς τοῦ πατρός.',
          level: 3,
          en: 'He told the disciples to follow him and to keep the commandments of the Father.',
          choices: [
            'He told the disciples to follow him and to keep the commandments of the Father.',
            'He told the disciples that they were following him and keeping the Father\'s commandments.',
            'The disciples spoke about following him and keeping the Father\'s commandments.',
            'He spoke the Father\'s commandments to the disciples who followed him.'
          ],
          note: 'τοῦ + inf. (here used after a verb of commanding) for purpose / indirect command. Two infinitives coordinated: τοῦ ἀκολουθεῖν … (καὶ) τηρεῖν.'
        },
        {
          g: 'δύναται ὁ θεὸς σῶσαι τὸν λαὸν αὐτοῦ.',
          level: 1,
          en: 'God is able to save his people.',
          choices: [
            'God is able to save his people.',
            'God will save his people.',
            'His people are able to save God.',
            'God saves his people.'
          ],
          note: 'δύναμαι (deponent + complementary inf.) = "be able to V". σῶσαι: aor. act. inf. of σῴζω.'
        },
        {
          g: 'οἶδα ὅτι ὁ κύριος ἀκούει μου.',
          level: 1,
          en: 'I know that the Lord hears me.',
          choices: [
            'I know that the Lord hears me.',
            'The Lord knows that I hear him.',
            'I know to hear the Lord.',
            'I knew that the Lord heard me.'
          ],
          note: 'οἶδα: perfect-formed verb with present meaning ("I know"). ὅτι + indicative for indirect statement. ἀκούω + gen. of person.'
        },
        {
          g: 'πορεύου εἰς τὴν πόλιν καὶ κήρυσσε τὸ εὐαγγέλιον.',
          level: 2,
          en: 'Go into the city and preach the gospel.',
          choices: [
            'Go into the city and preach the gospel.',
            'He goes into the city and preaches the gospel.',
            'Going into the city, he preached the gospel.',
            'Let us go into the city and preach the gospel.'
          ],
          note: 'Two pres. imperatives: πορεύου (mid. 2nd-sg of πορεύομαι) and κήρυσσε (act. 2nd-sg of κηρύσσω). Imperatives are 2nd or 3rd person only.'
        },
        {
          g: 'ἀξιόν ἐστιν τὸν δοῦλον λαμβάνειν τὸν μισθὸν αὐτοῦ.',
          level: 2,
          en: 'It is worthy for the slave to receive his wages.',
          choices: [
            'It is worthy for the slave to receive his wages.',
            'It is worthy for the slave to give his wages.',
            'The slave\'s worthy wage is given.',
            'The wages are worthy of the slave\'s receiving.'
          ],
          note: 'Adj. + ἐστίν + acc. + inf.: τὸν δοῦλον is the acc. "subject" of the inf. λαμβάνειν. Standard infinitive-with-accusative-subject pattern.'
        },
        {
          g: 'διὰ τὸ μὴ εἶναι ἱκανὸν ἑαυτόν, οὐκ ἦλθεν πρὸς τὸν Ἰησοῦν.',
          level: 3,
          en: 'Because he was not sufficient himself, he did not come to Jesus.',
          choices: [
            'Because he was not sufficient himself, he did not come to Jesus.',
            'He came to Jesus, not because he was sufficient.',
            'Although he was sufficient, he did not come to Jesus himself.',
            'Jesus did not come to him, for he was sufficient.'
          ],
          note: 'διά + acc. + articular inf. (τὸ … εἶναι) = causal ("because of being"). Negative μή with the inf. (not οὐ). Acc. ἑαυτόν is the subject of εἶναι; ἱκανόν is the predicate complement.'
        },
        {
          g: 'ὥστε καθήμενοι ἐν τῷ μέσῳ τοῦ ὄχλου, ἤκουον τοὺς λόγους τοῦ διδασκάλου.',
          level: 3,
          en: 'So that, sitting in the midst of the crowd, they were hearing the words of the teacher.',
          choices: [
            'So that, sitting in the midst of the crowd, they were hearing the words of the teacher.',
            'Therefore the teacher\'s words sat in the midst of the hearing crowd.',
            'Although they sat in the midst of the crowd, they did not hear the teacher.',
            'The teacher sat in the midst of the crowd and heard their words.'
          ],
          note: 'ὥστε + indicative shows actual result (here imperfect ἤκουον). καθήμενοι: pres. mid./pass. ptcp. of κάθημαι ("sit") modifying the unstated subject. Articular μέσῳ + gen. = "midst of".'
        }
      ]
    },

    19: {
      sentences: [
        {
          g: 'δίδωμι ὑμῖν εἰρήνην.',
          level: 1,
          en: 'I give peace to you.',
          choices: [
            'I give peace to you.',
            'I receive peace from you.',
            'You give me peace.',
            'Give peace to me.'
          ],
          note: 'δίδωμι is athematic (-μι) — stem alternates: long διδω- in the singular, short διδο- in the plural. ὑμῖν is the dative of indirect object.'
        },
        {
          g: 'τίθημι τὴν χεῖρα ἐπὶ τὰ τέκνα.',
          level: 1,
          en: 'I lay my hand on the children.',
          choices: [
            'I lay my hand on the children.',
            'I take my hand from the children.',
            'I have laid my hand on the children.',
            'My hand is on the children.'
          ],
          note: 'τίθημι: -μι verb ("place / lay"). Long stem τιθη- in sg., short τιθε- in pl. ἐπί + acc. = "onto".'
        },
        {
          g: 'ἵστησιν τὰ τέκνα ἐν μέσῳ τοῦ ὄχλου.',
          level: 1,
          en: 'He sets the children in the midst of the crowd.',
          choices: [
            'He sets the children in the midst of the crowd.',
            'He stands the children up against the crowd.',
            'The children stand in the midst of the crowd.',
            'He set the children in the midst of the crowd.'
          ],
          note: 'ἵστημι (transitive sense): "I cause to stand / set up". 3rd-sg ἵστησιν has movable nu. ἐν μέσῳ + gen. = "in [the] midst of".'
        },
        {
          g: 'ἀγαπᾷ ὁ θεὸς τοὺς ἁμαρτωλούς.',
          level: 2,
          en: 'God loves the sinners.',
          choices: [
            'God loves the sinners.',
            'The sinners love God.',
            'God will love the sinners.',
            'God loved the sinners.'
          ],
          note: 'ἀγαπᾷ = α-contract: ἀγαπά-ει contracts to ἀγαπᾷ (3rd-sg pres. act.). The iota subscript is what survives of the -ει.'
        },
        {
          g: 'τότε παρέδωκεν αὐτοῖς ὁ διδάσκαλος τὰς ἐντολάς.',
          level: 2,
          en: 'Then the teacher delivered the commandments to them.',
          choices: [
            'Then the teacher delivered the commandments to them.',
            'The teacher then will deliver the commandments to them.',
            'Then the commandments delivered the teacher.',
            'The teacher then receives commandments from them.'
          ],
          note: 'παρέδωκεν: aor. 3rd-sg of παραδίδωμι (compound of παρά + -δίδωμι). κ-aorist (like ἔδωκα) — typical of -μι verbs.'
        },
        {
          g: 'μενοῦμεν ἐν τῇ ἀγάπῃ τοῦ πατρός.',
          level: 2,
          en: 'We will remain in the love of the Father.',
          choices: [
            'We will remain in the love of the Father.',
            'We remain in the love of the Father.',
            'We remained in the love of the Father.',
            'We have remained in the love of the Father.'
          ],
          note: 'μενοῦμεν: liquid future of μένω (no σ; circumflex on the contracted ending μεν-ε-ομεν → μενοῦμεν). Distinguish from pres. μένομεν.'
        },
        {
          g: 'ὁ Χριστὸς ἀνέστη ἐκ νεκρῶν, καὶ ἔδωκεν ζωὴν τοῖς ἀνθρώποις.',
          level: 3,
          en: 'Christ rose from the dead and gave life to people.',
          choices: [
            'Christ rose from the dead and gave life to people.',
            'Christ stood up the people from the dead.',
            'Christ will rise from the dead and give life.',
            'From the dead, the people gave life to Christ.'
          ],
          note: 'Two -μι aorists: ἀνέστη (athematic 2nd-aor. of ἀνίστημι, "rise") and ἔδωκεν (κ-aor. of δίδωμι). νεκρῶν is gen. pl. of the substantive adj. νεκροί ("the dead").'
        },
        {
          g: 'ἐδίδου αὐτοῖς ὁ ἀπόστολος ἐξουσίαν θεραπεύειν τοὺς ἀσθενεῖς.',
          level: 3,
          en: 'The apostle was giving them authority to heal the sick.',
          choices: [
            'The apostle was giving them authority to heal the sick.',
            'The apostle gave them authority over the sick.',
            'They were giving the apostle authority to heal the sick.',
            'The apostle\'s authority healed the sick.'
          ],
          note: 'ἐδίδου: imperfect 3rd-sg of δίδωμι (short stem διδο-). ἐξουσίαν + complementary inf. (θεραπεύειν, pres. act. inf.).'
        },
        {
          g: 'οὐδεὶς ἐλήλυθεν πρὸς τὸν πατέρα εἰ μὴ διὰ τοῦ υἱοῦ ὃν ἀπέστειλεν.',
          level: 3,
          en: 'No one has come to the Father except through the Son whom he sent.',
          choices: [
            'No one has come to the Father except through the Son whom he sent.',
            'No one comes to the Father except by means of the sending of the Son.',
            'The Father has sent no one to himself except through the Son.',
            'The Son alone has come to the Father, having been sent.'
          ],
          note: 'εἰ μή = "except". ἐλήλυθεν: perfect of ἔρχομαι (suppletive). ἀπέστειλεν: liquid aor. of ἀποστέλλω (no σ; stem-vowel change).'
        },
        {
          g: 'ὁ κύριος δίδωσιν ζωὴν τοῖς ἀνθρώποις.',
          level: 1,
          en: 'The Lord gives life to people.',
          choices: [
            'The Lord gives life to people.',
            'The Lord will give life to people.',
            'People give life to the Lord.',
            'The Lord gave life to people.'
          ],
          note: 'δίδωσιν: pres. act. 3rd-sg of δίδωμι (athematic; long stem διδω-). Dat. of indirect object: τοῖς ἀνθρώποις.'
        },
        {
          g: 'ὁ διδάσκαλος ἀφίησιν τὰς ἁμαρτίας ἡμῶν.',
          level: 1,
          en: 'The teacher forgives our sins.',
          choices: [
            'The teacher forgives our sins.',
            'The teacher gives us our sins.',
            'Our sins forgive the teacher.',
            'The teacher forgave our sins.'
          ],
          note: 'ἀφίησιν: pres. 3rd-sg of ἀφίημι (compound of ἀπό + -ίημι); senses include "let go, forgive, leave". -μι verb with athematic endings.'
        },
        {
          g: 'τότε ἔδωκεν αὐτοῖς ὁ θεὸς ἐξουσίαν τέκνα γενέσθαι.',
          level: 2,
          en: 'Then God gave them authority to become children.',
          choices: [
            'Then God gave them authority to become children.',
            'Then God\'s children received authority from him.',
            'Then God gave them children with authority.',
            'Then God\'s authority became children to them.'
          ],
          note: 'ἔδωκεν: κ-aor. of δίδωμι. ἐξουσίαν + complementary inf. (γενέσθαι, 2nd-aor. mid. inf. of γίνομαι). τέκνα is predicate nom. (after γενέσθαι, "to become children").'
        },
        {
          g: 'ὁ ἀπόστολος ἀπέστειλεν τὸν μαθητὴν εἰς τὴν πόλιν.',
          level: 2,
          en: 'The apostle sent the disciple into the city.',
          choices: [
            'The apostle sent the disciple into the city.',
            'The apostle will send the disciple into the city.',
            'The disciple sent the apostle into the city.',
            'The apostle was sending the disciple into the city.'
          ],
          note: 'ἀπέστειλεν: liquid aor. of ἀποστέλλω (no σ; stem-vowel change ε → ει). Compound verb (ἀπό + στέλλω).'
        },
        {
          g: 'ἀπόλλυται ὁ ἁμαρτωλός, εἰ μὴ μετανοεῖ καὶ ἐπιστρέφει πρὸς τὸν θεόν.',
          level: 3,
          en: 'The sinner is destroyed, unless he repents and turns back to God.',
          choices: [
            'The sinner is destroyed, unless he repents and turns back to God.',
            'The sinner repents and turns to God in order not to be destroyed.',
            'If the sinner does not repent, God will destroy him.',
            'The sinner is destroyed, although he repents and turns to God.'
          ],
          note: 'ἀπόλλυται: pres. mid./pass. of ἀπόλλυμι (-μι verb, passive sense "is destroyed"). εἰ μή = "unless / except". Two coordinated indicatives in the εἰ-clause.'
        },
        {
          g: 'ἐτίθεσαν οἱ μαθηταὶ τοὺς ἀσθενεῖς ἐπὶ τὰς ὁδούς, ἵνα ἀνίστῃ αὐτοὺς ὁ Ἰησοῦς.',
          level: 3,
          en: 'The disciples were placing the sick on the roads, so that Jesus might raise them up.',
          choices: [
            'The disciples were placing the sick on the roads, so that Jesus might raise them up.',
            'The disciples placed the sick, who were raised up by Jesus on the roads.',
            'Jesus placed the sick on the roads to raise the disciples.',
            'The disciples set out, so that the sick might raise Jesus on the roads.'
          ],
          note: 'ἐτίθεσαν: imperfect 3rd-pl of τίθημι (short stem τιθε- + secondary -σαν). ἵνα + pres. subj. ἀνίστῃ (3rd-sg of ἀνίστημι) = purpose, imperfective aspect.'
        }
      ]
    },

    20: {
      sentences: [
        {
          g: 'πλείων ὁ προφήτης τοῦ λαοῦ.',
          level: 1,
          en: 'The prophet is greater than the people.',
          choices: [
            'The prophet is greater than the people.',
            'The prophet of the people is great.',
            'The prophet is the greatest of the people.',
            'The people are greater than the prophet.'
          ],
          note: 'Comparative adj. (πλείων, "more / greater") + genitive of comparison: "greater than X". Predicate position; εἰμί is implied.'
        },
        {
          g: 'εἷς ὁ θεός, μία ἡ πίστις.',
          level: 1,
          en: 'There is one God, one faith.',
          choices: [
            'There is one God, one faith.',
            'God is the first; faith is the first.',
            'One God has one faith.',
            'God is one and faith is one.'
          ],
          note: 'εἷς (masc.) and μία (fem.) — two forms of the irregular numeral "one". Predicate position with εἰμί implied.'
        },
        {
          g: 'εἴ τις θέλει εἶναι πρῶτος, ἔσται διάκονος πάντων.',
          level: 1,
          en: 'If anyone wants to be first, he will be servant of all.',
          choices: [
            'If anyone wants to be first, he will be servant of all.',
            'Whoever is first wants to serve everyone.',
            'If someone serves all, he will want to be first.',
            'If anyone is a servant, he wants to be first.'
          ],
          note: 'τις (indefinite, enclitic = "anyone"). πρῶτος = ordinal "first". Future ἔσται. Genitive of comparison πάντων ("of all").'
        },
        {
          g: 'οὐδεὶς πλείων τοῦ διδασκάλου αὐτοῦ ἐστιν.',
          level: 2,
          en: 'No one is greater than his teacher.',
          choices: [
            'No one is greater than his teacher.',
            'Everyone is greater than his teacher.',
            'His teacher is no one\'s greater.',
            'He has no greater teacher.'
          ],
          note: 'οὐδείς = "no one"; same genitive of comparison construction. πλείων ("more / greater") with τοῦ διδασκάλου (gen. of comparison).'
        },
        {
          g: 'ἐὰν αἰτῇς τι παρὰ τοῦ πατρός, δώσει σοι.',
          level: 2,
          en: 'If you ask anything from the Father, he will give [it] to you.',
          choices: [
            'If you ask anything from the Father, he will give [it] to you.',
            'If anything is asked of the Father, you give to him.',
            'If you ask, the Father will give the thing.',
            'Whoever asks the Father will not give to you.'
          ],
          note: 'τι (indef. enclitic, neut. acc., unaccented) — distinguish from interrogative τί (always accented). δώσει: future of δίδωμι.'
        },
        {
          g: 'ἑαυτὸν οὐ δοξάζει ἀλλὰ τὸν πέμψαντα αὐτόν.',
          level: 2,
          en: 'He glorifies not himself but the one having sent him.',
          choices: [
            'He glorifies not himself but the one having sent him.',
            'The one who sent him does not glorify himself.',
            'He sent himself, not the one glorifying him.',
            'He sent himself in order to be glorified.'
          ],
          note: 'ἑαυτόν: reflexive pronoun (acc., 3rd-pers.). Aor. ptcp. τὸν πέμψαντα is substantival ("the one who sent").'
        },
        {
          g: 'ὁ διάκονος ὁ καλὸς τὴν χεῖρα αὐτοῦ τίθησιν ἐπὶ τὰ πρόβατα.',
          level: 3,
          en: 'The good servant lays his hand on the sheep.',
          choices: [
            'The good servant lays his hand on the sheep.',
            'The servant is good, and his hand is on the sheep.',
            'The good sheep give their hands to the servant.',
            'The servant places his good hand on the sheep.'
          ],
          note: 'διάκονος (ch 17). τίθησιν: -μι verb 3rd-sg (ch 19). ἐπί + acc. = "onto". Article-noun-article-adj is the second attributive position.'
        },
        {
          g: 'εἰ ἦτε ἐκ τοῦ κόσμου, ὁ κόσμος ἂν ἐφίλει τὸ ἴδιον.',
          level: 3,
          en: 'If you were of the world, the world would love its own.',
          choices: [
            'If you were of the world, the world would love its own.',
            'If you are of the world, the world loves its own.',
            'When you were of the world, the world loved you.',
            'Although you are of the world, the world does not love its own.'
          ],
          note: 'Contrary-to-fact (2nd-class) condition: εἰ + impf. ind. (ἦτε), apodosis with ἄν + impf. ind. (ἐφίλει). τὸ ἴδιον = substantival adjective ("its own [thing]").'
        },
        {
          g: 'ὁ πλείων ἐν ὑμῖν γενέσθω ὡς ὁ μικρός, καὶ ὁ διάκονος μᾶλλον τιμάτω αὐτόν.',
          level: 3,
          en: 'Let the greater among you become as the small [one], and let the servant rather honor him.',
          choices: [
            'Let the greater among you become as the small [one], and let the servant rather honor him.',
            'The greater among you becomes the smallest who serves and honors.',
            'Whoever is greater serves the smallest and honors him more.',
            'The leader and servant become greater than the small one.'
          ],
          note: 'γενέσθω: 3rd-sg aor. mid. imperative of γίνομαι ("let him become"). Two comparatives substantivally (ὁ πλείων, ὁ μικρός). μᾶλλον = "rather, more". τιμάτω: 3rd-sg pres. act. imperative of τιμάω ("let him honor").'
        },
        {
          g: 'δύο ἀδελφοὺς ἔχει ὁ διδάσκαλος.',
          level: 1,
          en: 'The teacher has two brothers.',
          choices: [
            'The teacher has two brothers.',
            'Two brothers have the teacher.',
            'The teachers have two brothers.',
            'The teacher had two brothers.'
          ],
          note: 'δύο is indeclinable across most cases. Object phrase fronted; subject (ὁ διδάσκαλος) follows the verb.'
        },
        {
          g: 'οἱ δώδεκα ἀκολουθοῦσιν τῷ Ἰησοῦ.',
          level: 1,
          en: 'The twelve follow Jesus.',
          choices: [
            'The twelve follow Jesus.',
            'Twelve follow Jesus.',
            'Jesus follows the twelve.',
            'The twelve followed Jesus.'
          ],
          note: 'δώδεκα is indeclinable. Article + numeral ("the twelve") = definite group. ἀκολουθέω + dative.'
        },
        {
          g: 'ἑαυτὸν οὐ δύναται σῶσαι ὁ ἁμαρτωλός.',
          level: 2,
          en: 'The sinner cannot save himself.',
          choices: [
            'The sinner cannot save himself.',
            'The sinner cannot be saved by himself.',
            'He cannot save the sinner himself.',
            'The sinner saves only himself.'
          ],
          note: 'Reflexive ἑαυτόν fronted. δύναμαι + complementary inf. (σῶσαι, aor. act. inf.). Negation οὐ before δύναται.'
        },
        {
          g: 'εἰ ἦν ὧδε ὁ κύριος, οὐκ ἂν ἀπέθανεν ὁ ἀδελφός μου.',
          level: 2,
          en: 'If the Lord were here, my brother would not have died.',
          choices: [
            'If the Lord were here, my brother would not have died.',
            'If the Lord is here, my brother does not die.',
            'When the Lord came here, my brother did not die.',
            'Although the Lord is here, my brother died.'
          ],
          note: 'Contrary-to-fact (2nd-class) conditional: εἰ + impf./aor. ind. (ἦν), apodosis with ἄν + aor. ind. (ἀπέθανεν). Iconic Lazarus-type construction.'
        },
        {
          g: 'ὁ ἐλάχιστος ἐν τῇ βασιλείᾳ μείζων ἐστὶν τοῦ Ἰωάννου.',
          level: 3,
          en: 'The least one in the kingdom is greater than John.',
          choices: [
            'The least one in the kingdom is greater than John.',
            'John is the least in the kingdom and greater.',
            'The greatest in the kingdom is least, like John.',
            'The least and greatest in the kingdom is John.'
          ],
          note: 'Substantival ἐλάχιστος ("the least one", superlative of μικρός) and comparative μείζων ("greater"). Genitive of comparison: τοῦ Ἰωάννου ("than John").'
        },
        {
          g: 'μᾶλλον γὰρ ἀγαπᾷ ὁ πατὴρ τὸν υἱὸν τὸν μικρὸν ἢ τοὺς λοιπούς.',
          level: 3,
          en: 'For the father loves the small son more than the rest.',
          choices: [
            'For the father loves the small son more than the rest.',
            'For the small son loves the father more than the rest.',
            'The father, like the rest, loves the small son.',
            'The father loves more the rest than the small son.'
          ],
          note: 'μᾶλλον ("more, rather") + ἤ ("than") for explicit comparison. Article-noun-article-adj second attributive (τὸν υἱὸν τὸν μικρόν). γάρ postpositive.'
        }
      ]
    }
  };

  // ── Literal English translations for selected Textus Receptus verses ──
  // Keyed by the same `r` field used in READER_CHAPTERS. Only a subset
  // of verses get a translation MCQ — the iconic, short, or
  // high-instructional-value ones.
  const READER_VERSE_TRANSLATIONS = {
    'Mk 1:1': {
      en: '[The] beginning of the gospel of Jesus Christ, Son of God.',
      choices: [
        '[The] beginning of the gospel of Jesus Christ, Son of God.',
        'Jesus Christ, [the] Son of God, began the gospel.',
        'The gospel of Jesus Christ is the beginning of God\'s Son.',
        '[The] beginning of the gospel — God\'s Son — is Jesus Christ.'
      ],
      note: 'No verb — a verbless headline. Successive genitives: τοῦ εὐαγγελίου modifies Ἀρχή; Ἰησοῦ Χριστοῦ modifies τοῦ εὐαγγελίου; Υἱοῦ τοῦ Θεοῦ stands in apposition to Ἰησοῦ Χριστοῦ.'
    },
    'Jn 5:41': {
      en: 'I do not receive glory from people.',
      choices: [
        'I do not receive glory from people.',
        'Glory does not come to me from people.',
        'I do not give glory to people.',
        'I receive no glory; people [glorify] me.'
      ],
      note: 'παρά + gen. = "from (alongside)". Object δόξαν fronted before the verb for emphasis.'
    },
    'Lk 6:5': {
      en: 'And he was saying to them, "Lord is the Son of Man — also of the Sabbath."',
      choices: [
        'And he was saying to them, "Lord is the Son of Man — also of the Sabbath."',
        'And he said to them that the Lord of the Sabbath is the Son of Man.',
        'And he said, "The Son of Man is on the Sabbath of the Lord."',
        'And he was saying that the Sabbath is the Lord of the Son of Man.'
      ],
      note: 'TR construction: Κύριος predicate (no article) is fronted; ὁ Υἱὸς τοῦ ἀνθρώπου is the subject; the genitive τοῦ σαββάτου attaches as a further complement to Κύριος.'
    },
    'Jn 1:1': {
      en: 'In [the] beginning was the Word, and the Word was with God, and the Word was God.',
      choices: [
        'In [the] beginning was the Word, and the Word was with God, and the Word was God.',
        'The beginning of the Word is God, and God is with the Word.',
        'In the beginning the Word was God, and God was with him.',
        '[The] beginning was God, and the Word was with God.'
      ],
      note: 'Three clauses, all linking with ἦν (3rd sg. imperfect of εἰμί). In the third, anarthrous θεός is predicate, ὁ λόγος is subject (Colwell-style word order).'
    },
    'Mk 3:15': {
      en: '...and to have authority to heal the diseases, and to cast out the demons.',
      choices: [
        '...and to have authority to heal the diseases, and to cast out the demons.',
        '...and to have demons cast out the authority of the diseases.',
        '...and the authority of demons heals the diseases.',
        '...and the diseases had authority to cast out the demons.'
      ],
      note: 'Two complementary infinitives under one ἔχειν ἐξουσίαν: θεραπεύειν τὰς νόσους and ἐκβάλλειν τὰ δαιμόνια.'
    },
    'Jn 1:11': {
      en: 'He came to his own [things / people], and his own did not receive him.',
      choices: [
        'He came to his own [things / people], and his own did not receive him.',
        'He came to his own things, but he did not receive his own.',
        'His own came to him, and he did not receive his own.',
        'He went to his own; his own ones brought him in.'
      ],
      note: 'τὰ ἴδια (neut. pl.) and οἱ ἴδιοι (masc. pl.) — substantival adjectives; the shift from neuter to masculine narrows from "his own things / domain" to "his own people".'
    },
    'Mt 11:14': {
      en: 'And if you are willing to accept [it], he is Elijah, the one about to come.',
      choices: [
        'And if you are willing to accept [it], he is Elijah, the one about to come.',
        'If you wish to accept Elijah, he is about to come.',
        'And if you accept that he is Elijah, he comes to you.',
        'Are you willing to accept Elijah? He is the one who came.'
      ],
      note: 'εἰ + indicative = simple condition. ὁ μέλλων ἔρχεσθαι = articular present participle ("the one about to …") + complementary infinitive.'
    },
    'Jn 6:47': {
      en: 'Truly, truly, I say to you, the one believing in me has eternal life.',
      choices: [
        'Truly, truly, I say to you, the one believing in me has eternal life.',
        'Truly I say to you, you have life by believing in me.',
        'Truly truly I say to you, you who believe in me have eternal life.',
        'I say truly to you, the believer has the eternal life of me.'
      ],
      note: 'ὁ πιστεύων εἰς ἐμέ: articular present participle, substantival, with prepositional phrase ("the one who believes in me"). ζωὴν αἰώνιον: adjective in attributive position.'
    },
    'Jn 6:48': {
      en: 'I am the bread of life.',
      choices: [
        'I am the bread of life.',
        'The bread of life is for me.',
        'I have the bread of life.',
        'Life is bread for me.'
      ],
      note: 'Iconic ἐγώ εἰμί + predicate noun (ὁ ἄρτος) + descriptive genitive (τῆς ζωῆς).'
    },
    'Mk 13:31': {
      en: 'Heaven and earth will pass away, but my words will certainly not pass away.',
      choices: [
        'Heaven and earth will pass away, but my words will certainly not pass away.',
        'Heaven and earth pass away, but my words pass through.',
        'Heaven and earth shall pass beside, and my words shall pass beside.',
        'Heaven and earth will pass away with my words; they will not pass.'
      ],
      note: 'οὐ μή + future / aorist subjunctive = emphatic negation ("certainly not"). δέ ("but") is postpositive.'
    },
    'Mt 14:4': {
      en: 'For John was saying to him, "It is not lawful for you to have her."',
      choices: [
        'For John was saying to him, "It is not lawful for you to have her."',
        'For John told him, "She is not allowed to have you."',
        'John used to say to him that he should have her.',
        'For John was saying to him, "You are allowed to have her."'
      ],
      note: 'ἔλεγεν: imperfect ("was saying / used to say"). Impersonal ἔξεστιν + dative-of-reference (σοι) + complementary infinitive (ἔχειν).'
    },
    'Jn 4:26': {
      en: 'Jesus says to her, "I am [he], the one speaking to you."',
      choices: [
        'Jesus says to her, "I am [he], the one speaking to you."',
        'Jesus told her, "I was the one who spoke to you."',
        'Jesus says to her, "I speak to the one who is."',
        'Jesus says to her, "Speak to me; I am here."'
      ],
      note: 'Historical present (λέγει). ὁ λαλῶν σοι: articular present participle in apposition with the implied predicate of Ἐγώ εἰμι.'
    },
    'Jn 8:50': {
      en: 'But I do not seek my [own] glory; there is one who seeks and judges.',
      choices: [
        'But I do not seek my [own] glory; there is one who seeks and judges.',
        'I do not seek glory; the seeker is the judge.',
        'I seek my own glory; there is one who judges.',
        'My glory does not seek; one judges and seeks.'
      ],
      note: 'Emphatic ἐγώ. δέ postpositive. τὴν δόξαν μου: possessive μου attached to the noun phrase. ὁ ζητῶν καὶ κρίνων: two participles sharing one article.'
    },
    'Lk 21:33': {
      en: 'Heaven and earth will pass away, but my words will certainly not pass away.',
      choices: [
        'Heaven and earth will pass away, but my words will certainly not pass away.',
        'Heaven and earth shall pass aside, and my words shall pass aside.',
        'Heaven and earth pass away with my words; they will not pass.',
        'Heaven and earth, but not my words, will pass away.'
      ],
      note: 'Same construction as Mk 13:31. Note the οὐ μή + the future / subj. emphatic negation.'
    },
    'Php 4:4': {
      en: 'Rejoice in [the] Lord always; again I will say, rejoice.',
      choices: [
        'Rejoice in [the] Lord always; again I will say, rejoice.',
        'Rejoice in the Lord; I will not say it again — rejoice.',
        'You rejoice in the Lord at all times; I say it again, rejoice.',
        'Rejoice in the Lord; once more I have said, rejoice.'
      ],
      note: 'Χαίρετε is 2nd-pl. present imperative. πάντοτε = "always". ἐρῶ is the future of λέγω ("I will say").'
    },
    '1Th 5:16': {
      en: 'Rejoice always.',
      choices: [
        'Rejoice always.',
        'Always you rejoice.',
        'You will rejoice always.',
        'Rejoicing always [is good].'
      ],
      note: 'Two-word imperative clause: present imperative + adverb. The present aspect signals continuous / habitual action.'
    },
    '1Th 5:25': {
      en: 'Brothers, pray concerning us.',
      choices: [
        'Brothers, pray concerning us.',
        'Brothers, we pray concerning you.',
        'Brothers, you pray and we will too.',
        'Brothers concerning us pray.'
      ],
      note: 'Vocative Ἀδελφοί + present mid./pass. imperative προσεύχεσθε + περί + gen.'
    }
  };

  // Best-effort attachment to existing READER_CHAPTERS so the renderer
  // can find translations on each verse via verse.literal lookup. Both
  // the curated MCQ-style entries (READER_VERSE_TRANSLATIONS, kept for
  // backward compatibility) and the comprehensive plain-string map
  // (READER_VERSE_LITERALS) are merged here. The renderer treats string
  // values as a literal-translation tap-to-reveal payload.
  function attachToReaderChapters() {
    if (!Array.isArray(window.READER_CHAPTERS)) return;
    const literalsMap = (window.READER_VERSE_LITERALS && typeof window.READER_VERSE_LITERALS === 'object')
      ? window.READER_VERSE_LITERALS
      : {};
    window.READER_CHAPTERS.forEach((ch) => {
      if (!ch || !Array.isArray(ch.verses)) return;
      ch.verses.forEach((verse) => {
        if (!verse || verse.literal) return;
        const ref = verse.r;
        if (!ref) return;
        const curated = READER_VERSE_TRANSLATIONS[ref];
        if (curated) {
          verse.literal = curated;
          return;
        }
        const plain = literalsMap[ref];
        if (plain) {
          verse.literal = plain;
        }
      });
    });
  }

  window.READER_TRANSLATION_SETS = READER_TRANSLATION_SETS;
  window.READER_VERSE_TRANSLATIONS = READER_VERSE_TRANSLATIONS;
  attachToReaderChapters();
  // Re-run after the literals data file loads, in case load order differs.
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', attachToReaderChapters);
  }
})();
