// PCA Ordination & Licensure Study — per-card MCQ overlay: bible_content.
// Hand-authored multiple-choice for cards that can't auto-generate one, keyed
// by card id and merged into window.PCA_CARD_QUIZ (consumed by
// js/app/quiz.js cardQuiz()). Kept OUTSIDE the generated subject files so a
// builder re-run never wipes these. Each entry:
//   'card-id': { q?: 'sharper question override', choices: [4], answerIndex }
// Distractors must match the correct answer in length and grammatical shape
// (dev/validate.mjs giveaway check + manual discipline).
(function (global) {
  const Q = {
    'bc-001-have-you-read-the-entire-bible': {
      q: 'What is the expected answer when asked whether you have read the entire Bible?',
      choices: ['Yes, I have read the entire Bible.', 'No, only the New Testament so far.', 'No, only the Old Testament so far.', 'No, only parts of the Bible so far.'],
      answerIndex: 0
    },
    'bc-002-where-in-the-old-testament-would-y': {
      q: 'Where in the Old Testament are the Ten Commandments recorded (two references)?',
      choices: ['Exodus 12 and Leviticus 16', 'Exodus 20 and Deuteronomy 5', 'Genesis 15 and Genesis 17', 'Deuteronomy 6 and Joshua 24'],
      answerIndex: 1
    },
    'bc-002b-law-summarized-in-the-nt': {
      q: 'Where in the New Testament is the law summarized as loving God and neighbor (two references)?',
      choices: ['Mark 10 and John 14', 'Romans 8 and Galatians 5', 'Matthew 22 and Luke 10', 'Acts 15 and James 2'],
      answerIndex: 2
    },
    'bc-003-revelation-of-god-in-nature': {
      q: 'Which two passages speak of the revelation of God in nature?',
      choices: ['Psalm 8 and Romans 5', 'Psalm 119 and Romans 12', 'Psalm 29 and Romans 8', 'Psalm 19 and Romans 1'],
      answerIndex: 3
    },
    'bc-006-ot-divisions': {
      q: "In the OT's three-fold division (History, Poetry, Prophecy), how many books make up Poetry?",
      choices: ['Five books: Job through Song of Songs.', 'Twelve books: Joshua through Esther.', 'Seventeen books: Major and Minor Prophets.', 'Five books: Genesis through Deuteronomy.'],
      answerIndex: 0
    },
    'bc-009-give-a-general-outline-of-old-test': {
      q: 'What is the traditional early date for the Exodus, anchoring the OT outline?',
      choices: ['722 B.C., the fall of Samaria.', '1446 B.C., based on 1 Kings 6:1.', '586 B.C., the fall of Jerusalem.', '538 B.C., the return under Cyrus.'],
      answerIndex: 1
    },
    'bc-010-give-a-general-outline-of-old-test': {
      q: 'Which covenant of grace was sealed with the sign of circumcision?',
      choices: ['The Noahic covenant, in Genesis 9.', 'The Mosaic covenant, in Exodus 24.', 'The Abrahamic covenant, in Genesis 17.', 'The Davidic covenant, in 2 Samuel 7.'],
      answerIndex: 2
    },
    'bc-011-adam': {
      q: 'Which of these is true of Adam, according to Genesis 1-5?',
      choices: ["This person received God's covenant of life, promising life for obedience.", 'God called this person out of Ur, promising land, offspring, and blessing.', 'This person was sold into slavery by jealous brothers after two dreams.', 'This person led Israel out of Egyptian slavery through the Red Sea.'],
      answerIndex: 0
    },
    'bc-012-abraham': {
      q: 'Which of these is true of Abraham, according to Genesis 12-25?',
      choices: ["This person led Israel's conquest of Canaan after Moses died.", 'This person left Ur at God’s call to receive the promised land.', 'This person defeated the Midianites with just three hundred men.', 'This person anointed both Saul and David as kings of Israel.'],
      answerIndex: 1
    },
    'bc-013-joseph': {
      q: 'Which of these is true of Joseph, according to Genesis 37-50?',
      choices: ['This person was the only woman to serve as a judge over Israel.', 'This Moabite widow became King David’s great-grandmother.', 'This person was sold into slavery by jealous brothers after two dreams.', 'This king built the Jerusalem temple and was famed for wisdom.'],
      answerIndex: 2
    },
    'bc-014-moses': {
      q: 'Which of these is true of Moses, according to Exodus through Deuteronomy?',
      choices: ["This king's harsh rule caused the ten northern tribes to secede.", 'This prophet received a double portion of Elijah’s spirit.', "This king found the Book of the Law and renewed Judah's covenant.", 'This person led Israel out of Egyptian slavery through the Red Sea.'],
      answerIndex: 3
    },
    'bc-015-deborah': {
      q: 'Which of these is true of Deborah, according to Judges 4-5?',
      choices: ['This person was the only woman to serve as a judge over Israel.', 'This person anointed both Saul and David as kings of Israel.', 'This person was anointed king in secret while tending sheep.', 'This prophet wept over Jerusalem and foretold the New Covenant.'],
      answerIndex: 0
    },
    'bc-016-ruth': {
      q: 'Which of these is true of Ruth, according to the book that bears her name?',
      choices: ['This king trusted the Lord when Sennacherib besieged Jerusalem.', 'This Moabite widow became King David’s great-grandmother.', "This prophet's book, the OT's last, predicts Elijah's coming.", 'This exile was carried to Babylon by Nebuchadnezzar in 605 B.C.'],
      answerIndex: 1
    },
    'bc-017-joshua': {
      q: 'Which of these is true of Joshua, according to the book that bears his name?',
      choices: ['This king set up golden calves at Dan and Bethel for Israel to worship.', 'This person anointed both Saul and David as kings of Israel.', "This person led Israel's conquest of Canaan after Moses died.", 'This prophet was exiled to Babylon with King Jehoiachin in 597 B.C.'],
      answerIndex: 2
    },
    'bc-018-gideon': {
      q: 'Which of these is true of Gideon, according to Judges 6-9?',
      choices: ["This king found the Book of the Law and renewed Judah's covenant.", "This cupbearer to Artaxerxes returned to rebuild Jerusalem's walls.", "This prophet defeated Baal's prophets in a contest on Mount Carmel.", 'This person defeated the Midianites with just three hundred men.'],
      answerIndex: 3
    },
    'bc-019-samuel': {
      q: 'Which of these is true of Samuel, according to 1 Samuel?',
      choices: ['This person anointed both Saul and David as kings of Israel.', "This king's harsh rule caused the ten northern tribes to secede.", 'This person was anointed king in secret while tending sheep.', 'This king built the Jerusalem temple and was famed for wisdom.'],
      answerIndex: 0
    },
    'bc-020-david': {
      q: 'Which of these is true of David, according to 1 Samuel through 1 Kings?',
      choices: ["This prophet's book, the OT's last, predicts Elijah's coming.", 'This person was anointed king in secret while tending sheep.', 'This king trusted the Lord when Sennacherib besieged Jerusalem.', 'This exile was carried to Babylon by Nebuchadnezzar in 605 B.C.'],
      answerIndex: 1
    },
    'bc-021-solomon': {
      q: 'Which of these is true of Solomon, according to 1 Kings 1-11?',
      choices: ["This person led Israel's conquest of Canaan after Moses died.", 'This prophet wept over Jerusalem and foretold the New Covenant.', 'This king built the Jerusalem temple and was famed for wisdom.', 'This king set up golden calves at Dan and Bethel for Israel to worship.'],
      answerIndex: 2
    },
    'bc-022-rehoboam': {
      q: 'Which of these is true of Rehoboam, according to 1 Kings 12-14?',
      choices: ['This person was sold into slavery by jealous brothers after two dreams.', 'This prophet received a double portion of Elijah’s spirit.', 'This person was the only woman to serve as a judge over Israel.', "This king's harsh rule caused the ten northern tribes to secede."],
      answerIndex: 3
    },
    'bc-023-jeroboam-son-of-nebat': {
      q: 'Which of these is true of Jeroboam son of Nebat, according to 1 Kings 11-14?',
      choices: ['This king set up golden calves at Dan and Bethel for Israel to worship.', 'This king trusted the Lord when Sennacherib besieged Jerusalem.', 'This prophet was exiled to Babylon with King Jehoiachin in 597 B.C.', "This cupbearer to Artaxerxes returned to rebuild Jerusalem's walls."],
      answerIndex: 0
    },
    'bc-024-elijah': {
      q: 'Which of these is true of Elijah, according to 1 Kings 17-19?',
      choices: ['God called this person out of Ur, promising land, offspring, and blessing.', "This prophet defeated Baal's prophets in a contest on Mount Carmel.", 'This person led Israel out of Egyptian slavery through the Red Sea.', "This king found the Book of the Law and renewed Judah's covenant."],
      answerIndex: 1
    },
    'bc-025-elisha': {
      q: 'Which of these is true of Elisha, according to 1 & 2 Kings?',
      choices: ['This person anointed both Saul and David as kings of Israel.', 'This person was the only woman to serve as a judge over Israel.', 'This prophet received a double portion of Elijah’s spirit.', 'This exile was carried to Babylon by Nebuchadnezzar in 605 B.C.'],
      answerIndex: 2
    },
    'bc-026-hezekiah': {
      q: 'Which of these is true of Hezekiah, according to 2 Kings 18-20?',
      choices: ['This Moabite widow became King David’s great-grandmother.', "This king's harsh rule caused the ten northern tribes to secede.", 'This person defeated the Midianites with just three hundred men.', 'This king trusted the Lord when Sennacherib besieged Jerusalem.'],
      answerIndex: 3
    },
    'bc-027-josiah': {
      q: 'Which of these is true of Josiah, according to 2 Kings 22-23?',
      choices: ["This king found the Book of the Law and renewed Judah's covenant.", 'This person was anointed king in secret while tending sheep.', 'This prophet wept over Jerusalem and foretold the New Covenant.', "This prophet's book, the OT's last, predicts Elijah's coming."],
      answerIndex: 0
    },
    'bc-028-jeremiah': {
      q: 'Which of these is true of Jeremiah, the prophet from Anathoth?',
      choices: ['This king built the Jerusalem temple and was famed for wisdom.', 'This prophet wept over Jerusalem and foretold the New Covenant.', 'This king set up golden calves at Dan and Bethel for Israel to worship.', "This cupbearer to Artaxerxes returned to rebuild Jerusalem's walls."],
      answerIndex: 1
    },
    'bc-029-ezekiel': {
      q: 'Which of these is true of Ezekiel, exiled with King Jehoiachin?',
      choices: ["This person led Israel's conquest of Canaan after Moses died.", 'This person was sold into slavery by jealous brothers after two dreams.', 'This prophet was exiled to Babylon with King Jehoiachin in 597 B.C.', 'This king trusted the Lord when Sennacherib besieged Jerusalem.'],
      answerIndex: 2
    },
    'bc-030-daniel': {
      q: 'Which of these is true of Daniel, carried off under Nebuchadnezzar?',
      choices: ['This prophet received a double portion of Elijah’s spirit.', 'This person was the only woman to serve as a judge over Israel.', "This prophet defeated Baal's prophets in a contest on Mount Carmel.", 'This exile was carried to Babylon by Nebuchadnezzar in 605 B.C.'],
      answerIndex: 3
    },
    'bc-031-nehemiah': {
      q: 'Which of these is true of Nehemiah, cupbearer to Artaxerxes?',
      choices: ["This cupbearer to Artaxerxes returned to rebuild Jerusalem's walls.", 'This person anointed both Saul and David as kings of Israel.', "This king's harsh rule caused the ten northern tribes to secede.", 'This king built the Jerusalem temple and was famed for wisdom.'],
      answerIndex: 0
    },
    'bc-032-malachi': {
      q: 'Which of these is true of Malachi, the last book of the OT?',
      choices: ['This person was anointed king in secret while tending sheep.', "This prophet's book closes the OT and predicts Elijah's coming.", 'This Moabite widow became King David’s great-grandmother.', "This king found the Book of the Law and renewed Judah's covenant."],
      answerIndex: 1
    },
    'bc-039-i-will-pour-out-my-spirit': {
      q: "Where is the prophecy 'I will pour out my Spirit on all people' found?",
      choices: ['Joel 2:28, later quoted by Peter at Pentecost.', 'Isaiah 44:3, a promise poured on Jacob’s descendants.', 'Ezekiel 36:27, the promise of a new heart and spirit.', 'Zechariah 12:10, a promise of grace and supplication.'],
      answerIndex: 0
    },
    'bc-043-the-messianic-psalms': {
      q: "Which Messianic Psalm is quoted in Hebrews 1 as 'You are my Son, today I have begotten you'?",
      choices: ['Psalm 22', 'Psalm 2', 'Psalm 45', 'Psalm 110'],
      answerIndex: 1
    },
    'bc-048-promise-to-abraham': {
      q: "In what book and chapter is God's promise to Abraham (land, offspring, blessing) first recorded?",
      choices: ['Genesis 12, when Abraham was called from Haran.', 'Genesis 15, in the covenant-cutting ceremony.', 'Genesis 17, at the giving of circumcision.', 'Genesis 22, at the binding sacrifice of Isaac.'],
      answerIndex: 0
    },
    'bc-052-the-exodus': {
      q: 'What is the traditional early date for the Exodus, based on 1 Kings 6:1?',
      choices: ['1406 B.C., the year Israel entered Canaan.', '1446 B.C., 480 years before Solomon’s 4th year.', '1290 B.C., a commonly proposed late date.', '1050 B.C., the year Saul became king over Israel.'],
      answerIndex: 1
    },
    'bc-054-the-anointing-of-david': {
      q: "Where is David's private anointing by Samuel recorded, before his kingship?",
      choices: ['2 Samuel 2, when Judah made him king at Hebron.', '1 Samuel 9, when Samuel anointed Saul as king.', '1 Samuel 16, while he was still tending sheep.', '2 Samuel 5, when all Israel anointed him king.'],
      answerIndex: 2
    },
    'bc-058-division-of-kingdom': {
      q: 'In what book and chapter is the division of the kingdom under Rehoboam recorded?',
      choices: ["1 Kings 8, at the temple's dedication.", "2 Kings 17, at Israel's fall to Assyria.", "2 Kings 25, at Judah's fall to Babylon.", '1 Kings 12, dated to roughly 930 B.C.'],
      answerIndex: 3
    },
    'bc-059-the-exile': {
      q: 'In what year did Assyria carry the northern kingdom of Israel into exile?',
      choices: ["722 B.C., Israel's fall recorded in 2 Kings 17.", "586 B.C., Judah's fall recorded in 2 Kings 25.", '605 B.C., the first Babylonian deportation.', '538 B.C., the year Cyrus allowed the return.'],
      answerIndex: 0
    },
    'bc-060-the-return-from-exile': {
      q: "In what year did the first Jewish exiles return to Judah under Cyrus's decree?",
      choices: ['586 B.C., the year Jerusalem fell to Babylon.', '538 B.C., with the temple finished by 515 B.C.', "445 B.C., the year Nehemiah rebuilt the walls.", '722 B.C., the year Samaria fell to Assyria.'],
      answerIndex: 1
    },
    'bc-061-which-are-the-prison-epistles': {
      q: "Which group of letters did Paul write during his imprisonment in Rome?",
      choices: ['The four Prison Epistles: Ephesians, Philippians, Colossians, Philemon.', 'The three Pastoral Epistles: 1 Timothy, 2 Timothy, and Titus.', 'The four Catholic Epistles: Hebrews, James, 1 Peter, 2 Peter.', 'The two earliest letters: 1 Thessalonians and 2 Thessalonians.'],
      answerIndex: 0
    },
    'bc-062-which-are-the-pastoral-epistles': {
      q: "Which letters are known as the 'Pastoral Epistles'?",
      choices: ['Ephesians, Philippians, and Colossians — Prison letters.', '1 Timothy, 2 Timothy, and Titus — the Pastorals.', 'Hebrews, James, 1 Peter, and Jude — General letters.', '1 & 2 Thessalonians and Galatians — early letters.'],
      answerIndex: 1
    },
    'bc-063-which-are-the-catholic-or-general': {
      q: "Which group of letters is called the 'Catholic' or 'General' Epistles?",
      choices: ['Ephesians, Philippians, Colossians, Philemon — Prison letters.', '1 Timothy, 2 Timothy, and Titus — the Pastoral letters.', 'Hebrews, James, 1 & 2 Peter, and Jude — addressed broadly.', 'Romans, 1 & 2 Corinthians, and Galatians — Paul’s major letters.'],
      answerIndex: 2
    },
    'bc-064-what-are-the-distinctive-features': {
      q: "Which gospel is distinguished by its 'I AM' statements and realized eschatology?",
      choices: ['Mark, emphasizing Jesus as the suffering servant.', 'Luke, emphasizing Jesus’ ministry to the outcasts.', 'Matthew, emphasizing fulfillment of OT prophecy.', 'John, emphasizing eternal life beginning now in the present.'],
      answerIndex: 3
    },
    'bc-065-what-is-the-synoptic-problem': {
      q: "What does the 'Synoptic Problem' refer to?",
      choices: ['The literary relationship among Matthew, Mark, and Luke.', 'The chronological order of Paul’s first, second, and third missionary journeys.', 'The dating of the Old Testament prophetic books.', 'The authorship debate over the book of Hebrews.'],
      answerIndex: 0
    },
    'bc-066-outline-the-life-of-christ': {
      q: "In what year did Jesus' three-year public ministry begin, per the traditional chronology?",
      choices: ['A.D. 30, the year of his crucifixion.', 'A.D. 26, marked by his baptism by John.', '6 B.C., the year of his birth in Bethlehem.', 'A.D. 33, the year of the day of Pentecost.'],
      answerIndex: 1
    },
    'bc-066b-three-parables': {
      q: 'Which parable teaches that four different soils represent four responses to the kingdom message?',
      choices: ['The Parable of the Sower, in Matthew 13.', 'The Parable of the Weeds, in Matthew 13.', 'The Parable of the Lost Sheep, in Luke 15.', 'The Parable of the Prodigal Son, in Luke 15.'],
      answerIndex: 2
    },
    'bc-066c-three-miracles': {
      q: "Which miracle involved a two-stage healing that foreshadowed the disciples' gradual spiritual sight?",
      choices: ['The blind man healed at Bethsaida, in Mark 8.', 'The healing of the paralytic, in Matthew 9.', 'The raising of Lazarus from death, in John 11.', 'The healing of the man born blind, in John 9.'],
      answerIndex: 3
    },
    'bc-067-what-are-the-basic-elements-found': {
      q: 'What is the common conclusion drawn in the sermons recorded in Acts?',
      choices: ['Everyone who hears must repent and be baptized.', 'Everyone must first be circumcised under the Law.', 'Everyone must first make a temple sacrifice.', 'Everyone must join the Nazirite vow community.'],
      answerIndex: 0
    },
    'bc-068-relate-the-writing-of-the-pauline': {
      q: "During which period of Paul's life were the Prison Epistles written?",
      choices: ['His conversion and the start of his ministry (A.D. 33).', 'His first imprisonment in Caesarea and Rome (57-62).', 'His first missionary journey through Galatia (46-48).', 'His fourth journey and second imprisonment (62-68).'],
      answerIndex: 1
    },
    'bc-069-law-and-grace': {
      q: 'Which verse teaches that believers "are not under law, but under grace"?',
      choices: ['Galatians 3:11, "the righteous will live by faith."', '1 Corinthians 15:56, "the power of sin is the law."', 'Romans 6:14, "you are not under law but under grace."', 'Hebrews 7:19, "the law made nothing perfect."'],
      answerIndex: 2
    },
    'bc-071-herod-the-great': {
      q: 'Which of these is true of Herod the Great, at Christ’s birth?',
      choices: ['This ruler ordered the slaughter of infants in Bethlehem.', 'This tetrarch had John the Baptist beheaded over his marriage.', 'This group stressed strict Torah observance and extra hedge-laws.', 'This group, aligned with the temple, denied the resurrection.'],
      answerIndex: 0
    },
    'bc-072-herod-antipas': {
      q: "Which of these is true of Herod Antipas, 'the Tetrarch'?",
      choices: ['This former persecutor became the apostle to the Gentiles.', 'This tetrarch had John the Baptist beheaded over his marriage.', "This deacon became the church's first martyr, stoned for his testimony.", 'This centurion was among the first Gentile converts, through Peter.'],
      answerIndex: 1
    },
    'bc-073-pharisees': {
      q: 'Which of these is true of the Pharisees?',
      choices: ['This "son of encouragement" traveled with Paul on his first journey.', 'This group of twelve was chosen to witness Christ’s ministry.', 'This group stressed strict Torah observance and extra hedge-laws.', 'This group, aligned with the temple, denied the resurrection.'],
      answerIndex: 2
    },
    'bc-074-sadducees': {
      q: 'Which of these is true of the Sadducees?',
      choices: ['This apostle confessed Jesus as the Messiah at Caesarea Philippi.', 'This "true son in the faith" pastored the church at Ephesus.', 'This skeptic became a leader in Jerusalem after seeing the risen Christ.', 'This temple-aligned group denied the resurrection of the dead.'],
      answerIndex: 3
    },
    'bc-075-the-apostles-name-them': {
      q: 'Which of these is true of the twelve Apostles?',
      choices: ['This group of twelve was chosen to witness Christ’s ministry.', 'This centurion was among the first Gentile converts, through Peter.', "This deacon became the church's first martyr, stoned for his testimony.", 'This ruler ordered the slaughter of infants in Bethlehem.'],
      answerIndex: 0
    },
    'bc-076-peter': {
      q: 'Which of these is true of Peter?',
      choices: ['This group stressed strict Torah observance and extra hedge-laws.', 'This apostle confessed Jesus as the Messiah at Caesarea Philippi.', 'This "son of encouragement" traveled with Paul on his first journey.', 'This former persecutor became the apostle to the Gentiles.'],
      answerIndex: 1
    },
    'bc-077-cornelius': {
      q: 'Which of these is true of Cornelius?',
      choices: ['This tetrarch had John the Baptist beheaded over his marriage.', 'This skeptic became a leader in Jerusalem after seeing the risen Christ.', 'This centurion became one of the first Gentile converts through Peter.', 'This "true son in the faith" pastored the church at Ephesus.'],
      answerIndex: 2
    },
    'bc-078-barnabas': {
      q: 'Which of these is true of Barnabas?',
      choices: ["This deacon became the church's first martyr, stoned for his testimony.", 'This group of twelve was chosen to witness Christ’s ministry.', 'This ruler ordered the slaughter of infants in Bethlehem.', 'This "son of encouragement" traveled with Paul on his first journey.'],
      answerIndex: 3
    },
    'bc-079-stephen': {
      q: 'Which of these is true of Stephen?',
      choices: ["This deacon became the church's first martyr, stoned for his testimony.", 'This former persecutor became the apostle to the Gentiles.', 'This group, aligned with the temple, denied the resurrection.', 'This "true son in the faith" pastored the church at Ephesus.'],
      answerIndex: 0
    },
    'bc-080-paul': {
      q: 'Which of these is true of Paul?',
      choices: ['This centurion was among the first Gentile converts, through Peter.', 'This former persecutor became the apostle to the Gentiles.', 'This tetrarch had John the Baptist beheaded over his marriage.', 'This skeptic became a leader in Jerusalem after seeing the risen Christ.'],
      answerIndex: 1
    },
    'bc-081-timothy': {
      q: 'Which of these is true of Timothy?',
      choices: ['This apostle confessed Jesus as the Messiah at Caesarea Philippi.', 'This group stressed strict Torah observance and extra hedge-laws.', 'This "true son in the faith" pastored the church at Ephesus.', 'This ruler ordered the slaughter of infants in Bethlehem.'],
      answerIndex: 2
    },
    'bc-082-james': {
      q: 'Which of these is true of James, the brother of Jesus?',
      choices: ['This "son of encouragement" traveled with Paul on his first journey.', 'This centurion was among the first Gentile converts, through Peter.', "This deacon became the church's first martyr, stoned for his testimony.", 'This skeptic became a leader in Jerusalem after seeing the risen Christ.'],
      answerIndex: 3
    },
    'bc-103-jesus-described-and-prophesied-in': {
      q: 'Where does Jesus rebuke the disciples on the Emmaus road for not seeing him foretold in the OT Scriptures?',
      choices: ['Luke 24:25-27, on the road to Emmaus.', 'John 5:39, 46, in his dispute with the Jews.', 'Matthew 2, in the visit of the wise men.', 'Acts 8, in Philip and the Ethiopian eunuch.'],
      answerIndex: 0
    },
    'bc-105-seven-i-am-statements-in-john': {
      q: 'In which chapter of John does Jesus say, "I am the Good Shepherd"?',
      choices: ['John 15, "I am the True Vine."', 'John 10, "I am the Good Shepherd."', 'John 6, "I am the Bread of Life."', 'John 8, "I am the Light of the World."'],
      answerIndex: 1
    },
    'bc-116-the-sermons-of-acts': {
      q: "Where is Peter's sermon at Pentecost recorded?",
      choices: ['Acts 4, Peter before the Sanhedrin.', 'Acts 17, Paul before the Areopagus.', "Acts 2, Peter's sermon at Pentecost.", 'Acts 26, Paul before Agrippa.'],
      answerIndex: 2
    },
    'bc-121-missionary-journeys': {
      q: "Where is Paul's first missionary journey recorded?",
      choices: ['Acts 16-18, the second missionary journey.', 'Acts 18-21, the third missionary journey.', "Acts 9, Paul's conversion account.", 'Acts 13-14, the first missionary journey.'],
      answerIndex: 3
    },
    'bc-146-atonement': {
      q: 'Which verse says Christ was "presented as a sacrifice of atonement, through faith in his blood"?',
      choices: ['Romans 3:25, presented as a sacrifice of atonement.', 'Hebrews 2:17, a merciful and faithful high priest.', '1 John 2:2, the atoning sacrifice for the world.', 'Romans 5:11, receiving reconciliation through Christ.'],
      answerIndex: 0
    },
    'bc-147-repentance': {
      q: "Which verse records Peter's call, 'Repent and be baptized, every one of you'?",
      choices: ["Mark 1:15, at the start of Jesus' ministry.", "Acts 2:38, in Peter's sermon at Pentecost.", '2 Corinthians 7:10, on godly sorrow.', 'Luke 24:47, in the Great Commission.'],
      answerIndex: 1
    },
    'bc-148-deity-of-christ': {
      q: 'Which verse records Jesus saying, "before Abraham was born, I am"?',
      choices: ['John 1:14 — "the Word became flesh, and dwelt among us."', 'Hebrews 1:3 — "the exact representation of his being."', 'John 8:58 — "before Abraham was born, I am."', 'John 20:28 — Thomas’s "My Lord and my God."'],
      answerIndex: 2
    },
    'bc-149-resurrection-his-and-ours': {
      q: "Which verse addresses believers' future resurrection, rather than Christ's own?",
      choices: ['Matthew 28:6, "He is not here; he has risen."', 'Acts 2:32, "God has raised this Jesus to life."', '1 Corinthians 15:4, "raised on the third day."', 'Romans 6:5, on union with Christ in resurrection.'],
      answerIndex: 3
    },
    'bc-150-return-of-christ': {
      q: 'Which passage describes the Lord descending with a trumpet call to gather believers?',
      choices: ['1 Thessalonians 4:16-18, the Lord descending with a trumpet call.', 'Matthew 26:63-64, Jesus before the high priest at his trial.', "Acts 17:30-31, Paul's address to the Areopagus in Athens.", "Revelation 20:7-10, Satan's release at the millennium's end."],
      answerIndex: 0
    },
    'bc-151-speaking-in-tongues': {
      q: 'Which passage regulates tongues in worship, limiting it to two or three speakers with an interpreter?',
      choices: ['Acts 2:1-13, tongues poured out at Pentecost.', "1 Corinthians 14, Paul's rules for tongues in worship.", "Acts 10:44-46, tongues at Cornelius's household.", "Acts 19:1-7, tongues among John's former disciples."],
      answerIndex: 1
    },
    'bc-152-spiritual-gifts': {
      q: 'Which passage lists spiritual gifts given for building up the body?',
      choices: ['Galatians 5:22-25, the fruit of the Spirit.', '1 Timothy 3:1-12, qualifications for officers.', 'Romans 12:3-8, gifts within the body of Christ.', 'Titus 1:5-9, qualifications for elders.'],
      answerIndex: 2
    },
    'bc-153-civil-government': {
      q: 'Which passage teaches submission to civil authority as instituted by God?',
      choices: ['Matthew 22:15-17, "render to Caesar what is Caesar’s."', 'Titus 3:1-2, on being obedient and ready for good work.', '1 Peter 2:13-17, on honoring everyone and the king.', 'Romans 13:1-7, on submission to governing authorities.'],
      answerIndex: 3
    },
    'bc-154-work': {
      q: 'Which passage teaches, "If a man will not work, he shall not eat"?',
      choices: ['2 Thessalonians 3:6-15, on idleness in the church.', "Ephesians 4:28, on working with one's hands.", "1 Timothy 5:8, on providing for one's own family.", '1 Thessalonians 4:11-12, on living a quiet life.'],
      answerIndex: 0
    },
    'bc-155-the-ministry': {
      q: 'Which passage describes believers as entrusted with "the ministry of reconciliation"?',
      choices: ['Matthew 28:18-20, the Great Commission to make disciples.', "2 Corinthians 5:17-21, Christ's ambassadors of reconciliation.", '1 Peter 5:1-4, the charge to elders to shepherd the flock.', '1 Timothy 3:1-12, qualifications for elders and deacons.'],
      answerIndex: 1
    },
    'bc-156-the-church': {
      q: 'Which verse records Jesus saying, "I will build my church, and the gates of Hades will not overcome it"?',
      choices: ["Acts 2:42-47, the early church's shared fellowship.", 'Ephesians 4:11-16, the church built up in love.', "Matthew 16:18, Christ's promise to build his church.", '1 Peter 2:9-10, the church as a chosen, royal priesthood.'],
      answerIndex: 2
    },
    'bc-157-qualifications-for-church-officers': {
      q: 'Which passage gives qualifications for both elders and deacons together?',
      choices: ['Titus 1:5-9, qualifications for elders alone.', '1 Peter 5:1-4, the charge to shepherd the flock.', 'Acts 6:1-6, the choosing of the first deacons.', '1 Timothy 3:1-12, covering both elders and deacons.'],
      answerIndex: 3
    },
    'bc-158-biblical-discipline': {
      q: 'Which passage lays out the step-by-step procedure for confronting a sinning brother?',
      choices: ['Matthew 18:15-17, the procedure for church discipline.', '1 Corinthians 5:1-13, the call to expel an unrepentant man.', '2 Corinthians 2:5-11, the call to restore a repentant man.', 'Titus 3:10, the instruction to warn a divisive person.'],
      answerIndex: 0
    },
    'bc-159-women-in-the-church': {
      q: 'Which passage instructs that a woman should "learn in quietness and full submission"?',
      choices: ['1 Corinthians 14:33b-35, on women remaining silent.', '1 Timothy 2:11-15, on women learning in submission.', 'Romans 16:1, commending Phoebe as a servant of the church.', 'Titus 2:3-5, instructions for older and younger women.'],
      answerIndex: 1
    },
    'bc-160-giving': {
      q: 'Which passage tells of a poor widow who gave two small copper coins?',
      choices: ['2 Corinthians 9:6-11, on sowing generously.', 'Matthew 6:19-24, on storing treasure in heaven.', "Luke 21:1-4, the widow's offering at the temple.", '1 Timothy 6:17-19, on the rich being generous.'],
      answerIndex: 2
    },
    'bc-161-money': {
      q: 'Which verse teaches that "the love of money is a root of all kinds of evil"?',
      choices: ['Matthew 6:24, on the impossibility of serving two masters.', 'Hebrews 13:5, on being content and free from love of money.', 'Luke 16:13, on no servant being able to serve two masters.', '1 Timothy 6:10, on the love of money and its many griefs.'],
      answerIndex: 3
    },
    'bc-162-marriage': {
      q: "Which passage depicts marriage as a picture of Christ's relationship to the church?",
      choices: ['Ephesians 5:21-33, husband and wife as Christ and the church.', '1 Corinthians 7:1-16, instructions on marriage and celibacy.', "1 Corinthians 7:39-40, on a widow's freedom to remarry.", 'Hebrews 13:4, on marriage being honored by all.'],
      answerIndex: 0
    },
    'bc-163-divorce': {
      q: "Which passage contains the 'Pauline exception,' allowing divorce when an unbeliever deserts a believer?",
      choices: ["Matthew 19:3-12, Jesus' teaching on divorce and remarriage.", '1 Corinthians 7:12-16, the Pauline exception for desertion.', "Mark 10:11-12, Jesus' teaching to the disciples in private.", 'Luke 16:18, a brief statement against divorce and remarriage.'],
      answerIndex: 1
    },
    'bc-164-family': {
      q: 'Which passage says an elder must "manage his own family well" to qualify for office?',
      choices: ['Ephesians 5:22-6:4, instructions to husbands and children.', "1 Timothy 5:8, on providing for one's own relatives.", '1 Timothy 3:4-5, on an elder managing his household.', "Matthew 12:46-50, on Jesus' true spiritual family."],
      answerIndex: 2
    },
    'bc-165-heaven-and-hell': {
      q: 'Which parable ends, "they will go away to eternal punishment, but the righteous to eternal life"?',
      choices: ['The Rich Man and Lazarus, Luke 16:19-31.', 'The judgment seat of Christ, 2 Corinthians 5:10.', 'The day of the Lord, 2 Thessalonians 1:6-10.', 'The Sheep and the Goats, Matthew 25:31-46.'],
      answerIndex: 3
    },
    'bc-166-reconciliation-among-believers': {
      q: 'Which passage instructs, "leave your gift there in front of the altar... first go and be reconciled"?',
      choices: ['Matthew 5:21-26, on reconciling before worship.', 'Ephesians 4:32, on being kind and forgiving.', 'Colossians 3:13-14, on bearing with one another.', 'John 13:34-35, on the new command to love.'],
      answerIndex: 0
    },
    'bc-167-suffering': {
      q: 'Which passage describes suffering as the discipline of a loving Father?',
      choices: ['James 1:2-4, trials producing perseverance.', 'Hebrews 12:7-11, suffering as fatherly discipline.', "1 Peter 4:1-2, arming oneself with Christ's attitude.", 'Philippians 1:29-30, granted to suffer for Christ.'],
      answerIndex: 1
    },
    'bc-168-resurrection-of-the-body': {
      q: 'Which passage explains that the resurrection body will bear the image of the heavenly man, not the earthly?',
      choices: ['Romans 8:11, the Spirit giving life to mortal bodies.', '2 Corinthians 5:1-5, longing for a heavenly dwelling.', '1 Corinthians 15:35-49, the nature of the resurrection body.', '1 Thessalonians 4:13-17, the hope of the dead in Christ.'],
      answerIndex: 2
    },
    'bc-169-infant-baptism': {
      q: 'Which verse says, "The promise is for you and your children and for all who are far off"?',
      choices: ['Acts 16:13-15, Lydia and her household baptized.', '1 Corinthians 7:14, on children being holy.', 'Colossians 2:9-12, circumcision made without hands.', "Acts 2:38-39, Peter's promise at Pentecost."],
      answerIndex: 3
    },
    'bc-170-predestination': {
      q: 'Which passage teaches, "those God foreknew he also predestined... he also glorified"?',
      choices: ['Romans 8:28-30, the golden chain from calling to glory.', 'Ephesians 1:3-5, 11, chosen before the world’s creation.', '1 Peter 1:1-2, chosen through the Spirit’s sanctifying work.', 'John 15:16, "you did not choose me, but I chose you."'],
      answerIndex: 0
    },
    'bc-171-unity-of-the-church-and-gifts': {
      q: 'Which passage records Jesus praying "that all of them may be one, Father, just as you are in me"?',
      choices: ['1 Corinthians 12-13, gifts within one body, bound by love.', "John 17:20-23, Jesus' prayer for the church's unity.", 'Ephesians 4:1-16, keeping the unity of the Spirit.', 'Colossians 3:13-14, love binding virtues together.'],
      answerIndex: 1
    },
    'bc-172-christian-sabbath': {
      q: 'Which verse records the church gathering "on the first day of the week... to break bread"?',
      choices: ['John 20:19, Jesus appearing to the disciples.', '1 Corinthians 16:2, setting aside a weekly offering.', 'Acts 20:7, the church breaking bread at Troas.', 'Matthew 28:1, the women visiting the tomb.'],
      answerIndex: 2
    },
    'bc-173-ordering-of-christian-worship': {
      q: 'Which passage concludes, "everything should be done in a fitting and orderly way"?',
      choices: ['1 Corinthians 11, on head coverings in worship.', '1 Timothy 2, on prayer and conduct in worship.', 'Ephesians 5:19-20, on singing and giving thanks.', '1 Corinthians 14:26-40, on order in worship.'],
      answerIndex: 3
    },
    'bc-174-christian-liberty': {
      q: 'Which verse says believers "were called to be free" but must not use freedom to indulge the sinful nature?',
      choices: ['Galatians 5:13, on freedom used to serve one another.', 'Romans 14, on accepting those with weak faith.', '1 Corinthians 8-11, on Christian freedom over idol meat.', '1 Peter 2:16, on living as free servants of God.'],
      answerIndex: 0
    },
    'bc-175-significance-of-the-death-of-chris': {
      q: 'Which verse teaches that the Son of Man "came... to give his life as a ransom for many"?',
      choices: ["Romans 3:21-26, on Christ's death as justification.", "Mark 10:45, Christ's death described as a ransom for many.", "Colossians 1:19-20, on Christ's death as reconciliation.", "Hebrews 9:11-14, on Christ's death as eternal redemption."],
      answerIndex: 1
    }
  };
  global.PCA_CARD_QUIZ = Object.assign(global.PCA_CARD_QUIZ || {}, Q);
})(typeof window !== 'undefined' ? window : globalThis);
