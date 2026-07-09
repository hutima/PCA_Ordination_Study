// PCA Ordination & Licensure Study — per-card MCQ overlay: church_history.
// Hand-authored multiple-choice for cards that can't auto-generate one, keyed
// by card id and merged into window.PCA_CARD_QUIZ (consumed by
// js/app/quiz.js cardQuiz()). Kept OUTSIDE the generated subject files so a
// builder re-run never wipes these. Each entry:
//   'card-id': { q?: 'sharper question override', choices: [4], answerIndex }
// Distractors must match the correct answer in length and grammatical shape
// (dev/validate.mjs giveaway check + manual discipline).
(function (global) {
  const Q = {
    'ch-001-what-is-the-value-of-studying-church': {
      q: 'According to the card, what sense does studying church history give believers as they watch the gospel advance despite challenges?',
      choices: ['God’s sovereignty', 'Doctrinal perfection', 'National destiny', 'Personal infallibility'],
      answerIndex: 0
    },
    'ch-002-briefly-trace-the-spread-of-christia': {
      q: 'In the overview table, which era spans A.D. 312–550 and is marked by the great councils from Nicea through Chalcedon?',
      choices: ['The Christian Middle Ages', 'The Roman Christian Empire', 'The Age of Reformation', 'The Church Fathers era'],
      answerIndex: 1
    },
    'ch-003-what-were-the-solas-of-the-reformati': {
      q: 'Which Reformation “sola” teaches that saving grace is received through faith alone, not sacraments or works?',
      choices: ['Sola scriptura', 'Sola gratia', 'Sola fide', 'Solus Christus'],
      answerIndex: 2
    },
    'ch-004-methodist-churches': {
      q: 'Which denomination traces its roots to John and Charles Wesley’s Oxford “Holy Club”?',
      choices: ['Episcopal churches', 'Baptist churches', 'Pentecostal churches', 'Methodist churches'],
      answerIndex: 3
    },
    'ch-005-episcopal-churches': {
      q: 'Which denomination’s first American bishop was Samuel Seabury?',
      choices: ['Episcopal churches', 'Lutheran churches', 'Presbyterian churches', 'Mennonite churches'],
      answerIndex: 0
    },
    'ch-006-baptist-churches': {
      q: 'Which denomination usually traces itself to English Puritans who became convinced of believer’s baptism?',
      choices: ['Methodist churches', 'Baptist churches', 'Episcopal churches', 'Orthodox churches'],
      answerIndex: 1
    },
    'ch-007-presbyterian-churches': {
      q: 'Which denomination traces a line from Geneva to Scotland to Scots-Irish immigrants joined by likeminded Puritans?',
      choices: ['Baptist churches', 'Lutheran churches', 'Presbyterian churches', 'Mennonite churches'],
      answerIndex: 2
    },
    'ch-008-orthodox-churches': {
      q: 'Which communion’s final break with the West came in 1054, over the filioque clause and papal authority?',
      choices: ['Lutheran churches', 'Episcopal churches', 'Baptist churches', 'Orthodox churches'],
      answerIndex: 3
    },
    'ch-009-lutheran-churches': {
      q: 'Which denomination traces itself back to Martin Luther, often through Scandinavian immigration?',
      choices: ['Lutheran churches', 'Methodist churches', 'Pentecostal churches', 'Mennonite churches'],
      answerIndex: 0
    },
    'ch-010-pentecostal-churches': {
      q: 'Which movement traces its origin to a 1902 outbreak of speaking in tongues in Topeka, Kansas, under Parham?',
      choices: ['Methodist churches', 'Pentecostal churches', 'Baptist churches', 'Episcopal churches'],
      answerIndex: 1
    },
    'ch-011-mennonite-churches': {
      q: 'Which denomination, tracing to Menno Simons, practices adult baptism only and rejects oaths and military service?',
      choices: ['Baptist churches', 'Presbyterian churches', 'Mennonite churches', 'Lutheran churches'],
      answerIndex: 2
    },
    'ch-012-development-of-the-canon-of-scriptur': {
      q: 'In what year does Athanasius’ Easter letter first list all 27 books of the New Testament?',
      choices: ['325', '381', '431', '367'],
      answerIndex: 3
    },
    'ch-013-council-of-nicea-325': {
      q: 'Which council, called by Constantine in 325, condemned Arius and produced a creed affirming Christ “of one substance with the Father”?',
      choices: ['The Council of Nicea', 'The Council of Constantinople', 'The Council of Ephesus', 'The Council of Chalcedon'],
      answerIndex: 0
    },
    'ch-014-council-of-constantinople-381': {
      q: 'Which council, called by Theodosius in 381, produced the Nicene Creed recited today and condemned Apollinarianism?',
      choices: ['The Council of Nicea', 'The Council of Constantinople', 'The Council of Ephesus', 'The Council of Chalcedon'],
      answerIndex: 1
    },
    'ch-015-council-of-ephesus-431': {
      q: 'Which council, in 431, condemned Nestorius for dividing Christ into “God the Word” and “Jesus the Man”?',
      choices: ['The Council of Nicea', 'The Council of Constantinople', 'The Council of Ephesus', 'The Council of Chalcedon'],
      answerIndex: 2
    },
    'ch-016-council-of-chalcedon-451': {
      q: 'Which council, in 451, defined Christ as “one person in two natures,” rejecting both Nestorius and Eutyches?',
      choices: ['The Council of Nicea', 'The Council of Constantinople', 'The Council of Ephesus', 'The Council of Chalcedon'],
      answerIndex: 3
    },
    'ch-017-reformation': {
      q: 'Which movement, spanning 1517–1649, was the widespread withdrawal from the Roman Catholic Church over Scripture and salvation?',
      choices: ['The Reformation', 'The Counter-Reformation', 'The Radical Reformation', 'The Enlightenment'],
      answerIndex: 0
    },
    'ch-018-counter-reformation': {
      q: 'Which Roman Catholic response to Protestant claims was spearheaded by the founding of the Jesuits and the decrees of Trent?',
      choices: ['The Reformation', 'The Counter-Reformation', 'The Radical Reformation', 'Vatican I'],
      answerIndex: 1
    },
    'ch-019-belgic-confession': {
      q: 'Which 1561 confession, produced by Guido de Bres for French-speaking Protestants in the Low Countries, distanced Reformed believers from Anabaptist theology?',
      choices: ['The Heidelberg Catechism', 'The Canons of Dordt', 'The Belgic Confession', 'The Westminster Confession'],
      answerIndex: 2
    },
    'ch-020-heidelberg-catechism': {
      q: 'Which 1563 catechism, produced chiefly by Ursinus and Olevianus, aimed to reconcile Lutheran and Reformed views of communion?',
      choices: ['The Belgic Confession', 'The Westminster Shorter Catechism', 'The Canons of Dordt', 'The Heidelberg Catechism'],
      answerIndex: 3
    },
    'ch-021-synod-of-dordt': {
      q: 'Which 1618–19 synod condemned the teachings of Arminius’ followers and produced the five canons underlying TULIP?',
      choices: ['The Synod of Dordt', 'The Westminster Assembly', 'The Council of Trent', 'The Marrow controversy'],
      answerIndex: 0
    },
    'ch-022-westminster-assembly': {
      q: 'Which 1643–49 assembly in London produced the Directory of Worship and the Larger and Shorter Catechisms?',
      choices: ['The Synod of Dordt', 'The Westminster Assembly', 'The Council of Trent', 'The Diet of Worms'],
      answerIndex: 1
    },
    'ch-023-pietism': {
      q: 'Which movement, led by Spener from 1666 until his death in 1705, stressed a personal, born-again experience over doctrinal minutiae?',
      choices: ['Puritanism', 'Fundamentalism', 'Pietism', 'Neo-orthodoxy'],
      answerIndex: 2
    },
    'ch-024-half-way-covenant': {
      q: 'Which 1662 arrangement let children and grandchildren of church members receive partial membership without a conversion experience?',
      choices: ['The Adopting Act', 'The Marrow controversy', 'The Auburn Affirmation', 'The Half-Way Covenant'],
      answerIndex: 3
    },
    'ch-025-compare-the-first-and-second-great-a': {
      q: 'Which Great Awakening was marked by Calvinist theology and a “pure church” model under Edwards and Whitefield?',
      choices: ['The First Great Awakening', 'The Second Great Awakening', 'The Half-Way Covenant era', 'The Old School/New School division'],
      answerIndex: 0
    },
    'ch-026-old-school-new-school': {
      q: 'Which 1837–1869 division within American Presbyterianism pitted Old Calvinists like Hodge against New Haven–influenced revivalists?',
      choices: ['The Auburn Affirmation', 'The Old School/New School division', 'The Marrow controversy', 'The Half-Way Covenant'],
      answerIndex: 1
    },
    'ch-027-auburn-affirmation': {
      q: 'Which January 1924 document was issued by liberal Presbyterian ministers reacting to the General Assembly’s five essential doctrines?',
      choices: ['The Adopting Act', 'The Marrow controversy', 'The Auburn Affirmation', 'The Half-Way Covenant'],
      answerIndex: 2
    },
    'ch-028-babylonian-captivity': {
      q: 'Which period (1305–1378), when seven French popes resided in Avignon, later led to the Great Schism?',
      choices: ['The Great Schism', 'The Counter-Reformation', 'The Radical Reformation', 'The Babylonian Captivity'],
      answerIndex: 3
    },
    'ch-029-humanism': {
      q: 'Which Renaissance movement, exemplified by Erasmus, emphasized “ad fontes” — a return to the original Greek and Latin sources?',
      choices: ['Humanism', 'Scholasticism', 'Pietism', 'Modernism'],
      answerIndex: 0
    },
    'ch-030-radical-reformation': {
      q: 'Which 1520s–30s movement, led by Menno Simons, Conrad Grebel, and Felix Manz, rejected the state church and baptized only adults?',
      choices: ['Pietism', 'The Radical Reformation', 'Puritanism', 'The Counter-Reformation'],
      answerIndex: 1
    },
    'ch-031-pietism': {
      q: 'Which German Lutheran movement’s manifesto was Spener’s “Holy Desires” (1675), stressing being born again and practical piety?',
      choices: ['Puritanism', 'Humanism', 'Pietism', 'Modernism'],
      answerIndex: 2
    },
    'ch-032-puritanism': {
      q: 'Which movement reacted against the Elizabethan Settlement, purging “popish” elements from the Church of England, and called the Westminster Assembly?',
      choices: ['Pietism', 'Humanism', 'The Counter-Reformation', 'Puritanism'],
      answerIndex: 3
    },
    'ch-033-modernism': {
      q: 'Which late-1800s/early-1900s movement, shaped by Fosdick and the Auburn Affirmation, denied scriptural infallibility and embraced higher criticism?',
      choices: ['Modernism', 'Fundamentalism', 'Neo-orthodoxy', 'Natural Theology'],
      answerIndex: 0
    },
    'ch-034-fundamentalism': {
      q: 'Which conservative response to Modernism took its name from a series of volumes titled “The Fundamentals,” including work by Warfield?',
      choices: ['Modernism', 'Fundamentalism', 'Neo-orthodoxy', 'Puritanism'],
      answerIndex: 1
    },
    'ch-035-neo-orthodoxy': {
      q: 'Which post-WWI continental movement, developed by Karl Barth and Emil Brunner, rejected liberal theology’s dogmas while treating Scripture as only subjectively God’s word?',
      choices: ['Modernism', 'Fundamentalism', 'Neo-orthodoxy', 'Natural Theology'],
      answerIndex: 2
    },
    'ch-036-natural-theology': {
      q: 'Which branch of theology, based on reason and ordinary experience rather than Scripture, is distinguished from revealed theology?',
      choices: ['Neo-orthodoxy', 'Modernism', 'Fundamentalism', 'Natural Theology'],
      answerIndex: 3
    },
    'ch-037-knowledge-and-epistemology': {
      q: 'Which type of knowledge, unlike a posteriori knowledge, is independent of experience — e.g., “all bachelors are unmarried”?',
      choices: ['A priori knowledge', 'A posteriori knowledge', 'Revealed knowledge', 'Natural knowledge'],
      answerIndex: 0
    },
    'ch-038-polycarp': {
      q: 'Which apostolic father, a disciple of the Apostle John, was bishop of Smyrna and was martyred around 155?',
      choices: ['Ignatius of Antioch', 'Polycarp', 'Clement of Rome', 'Justin Martyr'],
      answerIndex: 1
    },
    'ch-039-clement-of-rome': {
      q: 'Which apostolic father, bishop of Rome, wrote “I Clement” (c. AD 96) rebuking the Corinthians for removing their leaders?',
      choices: ['Polycarp', 'Ignatius of Antioch', 'Clement of Rome', 'Irenaeus'],
      answerIndex: 2
    },
    'ch-040-ignatius-of-antioch': {
      q: 'Which apostolic father, bishop of Antioch, wrote seven letters on his way to martyrdom upholding threefold church government?',
      choices: ['Polycarp', 'Clement of Rome', 'Justin Martyr', 'Ignatius of Antioch'],
      answerIndex: 3
    },
    'ch-041-justin-martyr': {
      q: 'Which 2nd-century apologist, martyred c. 160 in Rome, argued Christ was the fulfillment of the best of Greek philosophy?',
      choices: ['Justin Martyr', 'Irenaeus', 'Tertullian', 'Clement of Alexandria'],
      answerIndex: 0
    },
    'ch-042-irenaeus': {
      q: 'Which bishop of Lyon wrote “Against Heresies,” a rigorous refutation of Gnosticism, tracing apostolic succession from John through Polycarp?',
      choices: ['Justin Martyr', 'Irenaeus', 'Tertullian', 'Cyprian'],
      answerIndex: 1
    },
    'ch-043-marcion': {
      q: 'Which mid-2nd-century heretic rejected the entire Old Testament and all non-Pauline books, pushing the church toward a fixed New Testament canon?',
      choices: ['Pelagius', 'Arius', 'Marcion', 'Nestorius'],
      answerIndex: 2
    },
    'ch-044-tertullian-the-west': {
      q: 'Which “Father of Latin Theology,” raised in Carthage, was the first major church father to write in Latin instead of Greek?',
      choices: ['Cyprian', 'Clement of Alexandria', 'Augustine', 'Tertullian'],
      answerIndex: 3
    },
    'ch-045-clement-of-alexandria-155-220-the-ea': {
      q: 'Which 2nd–3rd-century theologian founded the School of Alexandria and sought an “intelligent orthodoxy” resisting Gnosticism in Egypt?',
      choices: ['Clement of Alexandria', 'Tertullian', 'Origen', 'Eusebius of Caesarea'],
      answerIndex: 0
    },
    'ch-046-cyprian-200-258-time-of-decian-perse': {
      q: 'Which bishop of Carthage, martyred under Decian persecution, debated how to readmit Christians who had lapsed under persecution?',
      choices: ['Tertullian', 'Cyprian', 'Ambrose of Milan', 'Gregory the Great'],
      answerIndex: 1
    },
    'ch-047-eusebius-of-caesarea-263-c-339': {
      q: 'Which bishop, called the “Father of Church History,” wrote a history of the church to 324 and attended the Council of Nicea?',
      choices: ['Cyprian', 'Chrysostom', 'Eusebius of Caesarea', 'Jerome'],
      answerIndex: 2
    },
    'ch-048-constantine': {
      q: 'Which Roman emperor, converted after the Battle of Milvian Bridge in 312, made Christianity the state religion and called the Council of Nicea?',
      choices: ['Theodosius', 'Diocletian', 'Charlemagne', 'Constantine'],
      answerIndex: 3
    },
    'ch-049-chrysostom': {
      q: 'Which “Golden-Mouthed” bishop of Antioch, later Constantinople, was famous for literal, expository preaching (lectio continua)?',
      choices: ['Chrysostom', 'Ambrose of Milan', 'Gregory the Great', 'Cyril of Alexandria'],
      answerIndex: 0
    },
    'ch-050-jerome': {
      q: 'Which church father translated the entire Old and New Testaments from their original languages into Latin, producing the Vulgate?',
      choices: ['Augustine', 'Jerome', 'Ambrose of Milan', 'Gregory the Great'],
      answerIndex: 1
    },
    'ch-051-pelagius': {
      q: 'Which Scots/Irish monk taught that Adam’s sin was merely a bad example, denying the inevitability of original sin, and was refuted by Augustine?',
      choices: ['Arminius', 'Marcion', 'Pelagius', 'Nestorius'],
      answerIndex: 2
    },
    'ch-052-ambrose-of-milan-340-397': {
      q: 'Which 4th-century bishop of Milan introduced allegorical interpretation and congregational hymn singing, influencing Augustine’s conversion?',
      choices: ['Jerome', 'Gregory the Great', 'Chrysostom', 'Ambrose of Milan'],
      answerIndex: 3
    },
    'ch-053-cyril-of-alexandria-378-444': {
      q: 'Which bishop opposed Nestorius over whether Mary could be called “God-bearer,” a dispute settled at the Council of Ephesus?',
      choices: ['Cyril of Alexandria', 'Athanasius', 'Leo the Great', 'Ambrose of Milan'],
      answerIndex: 0
    },
    'ch-054-augustine': {
      q: 'Which “Father of the Western Church,” bishop of Hippo, battled the Donatists and Pelagius and wrote “City of God”?',
      choices: ['Ambrose of Milan', 'Augustine', 'Jerome', 'Cyprian'],
      answerIndex: 1
    },
    'ch-055-gregory-the-great': {
      q: 'Which pope, the last of the four Latin Fathers, consolidated Western church power and sponsored the evangelization of England?',
      choices: ['Ambrose of Milan', 'Augustine', 'Gregory the Great', 'Leo the Great'],
      answerIndex: 2
    },
    'ch-056-anselm-of-canterbury': {
      q: 'Which “father of scholasticism,” archbishop of Canterbury, wrote “Cur Deus Homo,” developing the satisfaction theory of the atonement?',
      choices: ['Thomas Aquinas', 'Bernard of Clairvaux', 'Peter Abelard', 'Anselm of Canterbury'],
      answerIndex: 3
    },
    'ch-057-bernard-of-clairvaux': {
      q: 'Which reformer of Benedictine monasticism, founder of Clairvaux and champion of the Cistercian order, opposed Peter Abelard?',
      choices: ['Bernard of Clairvaux', 'Anselm of Canterbury', 'Francis of Assisi', 'Thomas Aquinas'],
      answerIndex: 0
    },
    'ch-058-francis-of-assisi': {
      q: 'Which founder of a mendicant order devoted to poverty and simplicity was, in 1224, the first to receive the stigmata?',
      choices: ['Bernard of Clairvaux', 'Francis of Assisi', 'Dominic', 'Anselm of Canterbury'],
      answerIndex: 1
    },
    'ch-059-thomas-aquinas': {
      q: 'Which Dominican theologian’s “Summa Theologica” synthesized Aristotelian philosophy with Christian theology and expounded transubstantiation?',
      choices: ['Anselm of Canterbury', 'Bernard of Clairvaux', 'Thomas Aquinas', 'Bonaventure'],
      answerIndex: 2
    },
    'ch-060-john-wycliffe': {
      q: 'Which “Morning Star of the Reformation,” an Oxford theologian, translated the Latin Bible into English and opposed transubstantiation?',
      choices: ['John Hus', 'William Tyndale', 'John Calvin', 'John Wycliffe'],
      answerIndex: 3
    },
    'ch-061-john-hus': {
      q: 'Which Czech pre-reformer, likeminded with Wycliffe, was burned at the stake in 1415 despite assurances of safe passage from Rome?',
      choices: ['John Hus', 'John Wycliffe', 'William Tyndale', 'Martin Luther'],
      answerIndex: 0
    },
    'ch-062-william-tyndale': {
      q: 'Which “Father of the English Bible” produced the first English translation from the Greek and Hebrew, later martyred in Antwerp?',
      choices: ['John Wycliffe', 'William Tyndale', 'John Hus', 'Martin Luther'],
      answerIndex: 1
    },
    'ch-063-martin-luther': {
      q: 'Which reformer, an Augustinian monk, posted 95 Theses in Wittenberg in 1517 and declared “Here I stand” at Worms?',
      choices: ['Ulrich Zwingli', 'John Calvin', 'Martin Luther', 'Philip Melanchthon'],
      answerIndex: 2
    },
    'ch-064-philip-melanchthon': {
      q: 'Which “Teacher of Germany,” Luther’s chief associate at Wittenberg, authored the Augsburg Confession (1530)?',
      choices: ['Martin Luther', 'Ulrich Zwingli', 'John Calvin', 'Philip Melanchthon'],
      answerIndex: 3
    },
    'ch-065-ulrich-zwingli': {
      q: 'Which Swiss reformer led the Reformation in Zurich and rejected transubstantiation and consubstantiation for a memorialist view of the Supper?',
      choices: ['Ulrich Zwingli', 'Martin Luther', 'John Calvin', 'John Knox'],
      answerIndex: 0
    },
    'ch-066-john-calvin': {
      q: 'Which reformer, based chiefly in Geneva, wrote the “Institutes of the Christian Religion” and became the leading Reformed theologian?',
      choices: ['Ulrich Zwingli', 'John Calvin', 'John Knox', 'Theodore Beza'],
      answerIndex: 1
    },
    'ch-067-john-knox': {
      q: 'Which “Thundering Scot” led the Reformation of the Scottish church, helping draft the Scots Confession (1560) and Book of Discipline?',
      choices: ['Andrew Melville', 'George Wishart', 'John Knox', 'John Calvin'],
      answerIndex: 2
    },
    'ch-068-scottish-covenanters': {
      q: 'Which group signed the 1638 National Covenant, resisting Catholic and Anglican structure in favor of Reformed Presbyterianism?',
      choices: ['The Marrow men', 'The English Puritans', 'The Non-Conformists', 'The Scottish Covenanters'],
      answerIndex: 3
    },
    'ch-069-arminius': {
      q: 'Which Dutch pastor and professor at Leiden taught that election is based on God’s foreknowledge of who would freely choose him?',
      choices: ['Arminius', 'Moise Amyraut', 'Richard Baxter', 'Theodore Beza'],
      answerIndex: 0
    },
    'ch-070-moise-amyraut-and-the-school-of-saum': {
      q: 'Which teacher of the School of Saumur held a “modified” four-point Calvinism that rejected limited atonement while affirming the other points?',
      choices: ['Arminius', 'Moise Amyraut', 'Richard Baxter', 'Theodore Beza'],
      answerIndex: 1
    },
    'ch-071-richard-baxter': {
      q: 'Which English Puritan pastor, author of “The Reformed Pastor,” held an Amyraldian (weak) view of Calvinism?',
      choices: ['Jonathan Edwards', 'George Whitefield', 'Richard Baxter', 'John Wesley'],
      answerIndex: 2
    },
    'ch-072-count-von-zinzendorf': {
      q: 'Which Lutheran Pietist nobleman founded the Moravian Church, building on the history of Jan Hus and hosting refugees at Herrnhut?',
      choices: ['Jakob Spener', 'John Wesley', 'George Whitefield', 'Count von Zinzendorf'],
      answerIndex: 3
    },
    'ch-073-jonathan-edwards': {
      q: 'Which Yale-educated pastor and philosopher preached during the First Great Awakening and wrote “Sinners in the Hands of an Angry God”?',
      choices: ['Jonathan Edwards', 'George Whitefield', 'Charles Finney', 'John Wesley'],
      answerIndex: 0
    },
    'ch-074-george-whitefield': {
      q: 'Which English evangelist of the First Great Awakening, known for outdoor preaching, split with the Wesleys over Reformed doctrine?',
      choices: ['John Wesley', 'George Whitefield', 'Jonathan Edwards', 'Charles Finney'],
      answerIndex: 1
    },
    'ch-075-john-wesley': {
      q: 'Which “Father of Methodism,” co-founder of the Oxford “Holy Club,” described his “heart strangely warmed” at Aldersgate in 1738?',
      choices: ['George Whitefield', 'Charles Wesley', 'John Wesley', 'Count von Zinzendorf'],
      answerIndex: 2
    },
    'ch-076-marrow-controversy': {
      q: 'Which 1717–22 Church of Scotland controversy pitted “Marrow men,” who preached a free gospel offer, against Neonomian opponents?',
      choices: ['The Old School/New School division', 'The Auburn Affirmation', 'The Half-Way Covenant', 'The Marrow controversy'],
      answerIndex: 3
    },
    'ch-077-william-carey': {
      q: 'Which “Father of Modern Missions” led the Baptist Missionary Society and pioneered contextualization and Bible translation in India?',
      choices: ['William Carey', 'George Müller', 'D. L. Moody', 'Charles Finney'],
      answerIndex: 0
    },
    'ch-078-charles-hodge': {
      q: 'Which Princeton professor and American Old School Presbyterian defended historic Calvinism in a three-volume Systematic Theology?',
      choices: ['B. B. Warfield', 'Charles Hodge', 'Archibald Alexander', 'Charles Finney'],
      answerIndex: 1
    },
    'ch-079-charles-finney': {
      q: 'Which chief evangelist of the Second Great Awakening, a New Haven theology proponent, is known for “New Measures” like the anxious bench?',
      choices: ['D. L. Moody', 'Charles Hodge', 'Charles Finney', 'George Whitefield'],
      answerIndex: 2
    },
    'ch-080-george-m-ller': {
      q: 'Which German Brethren figure in Bristol, England, founded orphanages and was known for trusting God to provide without fundraising?',
      choices: ['Charles Spurgeon', 'William Carey', 'D. L. Moody', 'George Müller'],
      answerIndex: 3
    },
    'ch-081-charles-h-spurgeon': {
      q: 'Which hugely popular English Baptist pastor of the Metropolitan Tabernacle was called “The Prince of Preachers”?',
      choices: ['Charles H. Spurgeon', 'George Müller', 'D. L. Moody', 'B. B. Warfield'],
      answerIndex: 0
    },
    'ch-082-b-b-warfield': {
      q: 'Which Princeton professor, a second-generation successor to Hodge, is best known for defending Scripture’s infallibility against higher criticism?',
      choices: ['Charles Hodge', 'B. B. Warfield', 'J. Gresham Machen', 'Charles Finney'],
      answerIndex: 1
    },
    'ch-083-d-l-moody': {
      q: 'Which semi-educated evangelist, teamed with singer Sankey, founded the Moody Bible Institute and led organized urban revival campaigns?',
      choices: ['Charles Finney', 'George Whitefield', 'D. L. Moody', 'Charles Spurgeon'],
      answerIndex: 2
    },
    'ch-084-vatican-i-1869-1870': {
      q: 'Which Roman Catholic council (1869–1870) affirmed papal infallibility when the pope speaks ex cathedra on faith and doctrine?',
      choices: ['Vatican II', 'The Council of Trent', 'The Fourth Lateran Council', 'Vatican I'],
      answerIndex: 3
    },
    'ch-085-vatican-ii-1962-1965': {
      q: 'Which Roman Catholic council (1962–1965) pursued aggiornamento, viewing Protestants as “separated brethren” rather than heretics?',
      choices: ['Vatican II', 'Vatican I', 'The Council of Trent', 'The Council of Chalcedon'],
      answerIndex: 0
    },
    'ch-086-monastic-movements': {
      q: 'Which monk, called the great reformer of Western monasticism, established the threefold vow of celibacy, poverty, and obedience?',
      choices: ['Basil the Great', 'Benedict of Nursia', 'Francis of Assisi', 'Dominic the Preacher'],
      answerIndex: 1
    },
    'ch-087-briefly-trace-the-history-of-presbyt': {
      q: 'Who established the first American presbytery, in Philadelphia, in 1706?',
      choices: ['William Tennent', 'Archibald Alexander', 'Francis Makemie', 'J. Gresham Machen'],
      answerIndex: 2
    },
    'ch-087b-modernism-fundamentalism': {
      q: 'Which 1923 book by J. Gresham Machen argued that liberalism is not a variety of Christianity but a different religion?',
      choices: ['Shall the Fundamentalists Win?', 'The Auburn Affirmation', 'How the Gold Became Dim', 'Christianity and Liberalism'],
      answerIndex: 3
    },
    'ch-088-trace-the-historical-roots-of-the-rp': {
      q: 'Which denomination, formed in 1965 by the merger of the Evangelical Presbyterian Church and the Reformed Presbyterian Church, General Synod, joined the PCA in 1982?',
      choices: ['The RPCES', 'The OPC', 'The Bible Presbyterian Church', 'The PCUS'],
      answerIndex: 0
    },
    'ch-089-when-where-and-why-did-the-pca-begin': {
      q: 'In what year did 260 churches withdraw from the PCUS to form the National Presbyterian Church, later renamed the PCA?',
      choices: ['1936', '1973', '1957', '1982'],
      answerIndex: 1
    },
    'ch-090-what-are-some-distinctives-of-the-pc': {
      q: 'Which book by Morton Smith is cited on the card as a source on PCA distinctives?',
      choices: ['Christianity and Liberalism', 'The Reformed Pastor', 'How the Gold Became Dim', 'City of God'],
      answerIndex: 2
    }
  };
  global.PCA_CARD_QUIZ = Object.assign(global.PCA_CARD_QUIZ || {}, Q);
})(typeof window !== 'undefined' ? window : globalThis);
