// PCA Ordination & Licensure Study — 12-week study plan.
//
// Models the "Schedule of Assignments" from Chapell & Meek, *Preparing for
// Licensure and Ordination Exams* (Covenant Theological Seminary). Each week of
// the syllabus assigns work across several columns — Book Outlines, Book
// Contents, Bible Content, Doctrines & Proofs, Theology, Catechism, History,
// the BCO, and a "Hot Topic." This file maps each week onto the app's
// sub-decks (`sets`) plus the reading/memory assignments shown as guidance
// (catechism question numbers and the week's hot topic).
//
// Notes on the mapping:
//  - The "Book Outlines / Book Contents" columns are backed by the Bible Book
//    Summaries subject (js/data/subjects/bible_books.js): one card per book
//    (author, date, theme, outline, Christ & significance), grouped into eight
//    division sub-decks (bk-*). Each division deck is attached to the first
//    week its books are read (Pentateuch + OT History → wk 2, Major Prophets →
//    wk 4, OT Poetry → wk 5, Gospels & Acts → wk 6, Minor Prophets → wk 7,
//    Pauline Epistles → wk 9, General Epistles & Revelation → wk 11). The
//    week's `reading.outlines` / `reading.contents` captions still name the
//    specific books due that week.
//  - The app's theology sub-decks merge the syllabus's "A. Introduction" into
//    "A. The Bible," so the lettered theology columns are shifted by one and
//    land on th-a … th-k here.
//  - Some syllabus decks span two weeks (e.g. NT Key Passages, Key People);
//    the whole deck is attached to the first week it appears and the caption
//    notes the continuation.
//  - The BCO column is distributed across the weeks following the app's
//    canonical BCO sub-deck order (officers → courts → discipline → worship →
//    governance → the comprehensive Form of Government → Discipline → Directory
//    for Worship decks), so walking the weeks never shows BCO out of order.
//    It is not aligned to the syllabus's exact A–J chapter-letter blocks,
//    because the app groups the BCO into 14 decks rather than those blocks.
//  - Week 1 is the syllabus's orientation class (no content row); it is used
//    here for the Personal Religion & Call material. Week 13 is the final exam.

(function (global) {
  const WEEKS = [
    {
      week: 1,
      theme: 'Orientation & your call to ministry',
      sets: ['pc-call'],
      reading: {
        focus: 'Read the requirements for licensure and ordination (BCO 18–21); begin reading through the Westminster Confession and Catechisms.',
        hotTopic: null,
        outlines: null,
        contents: null,
        catechism: null,
        doctrines: 'Start memorizing the "Doctrines & Proofs" (the five points, the ordo salutis, and a gospel outline) — have them "down pat."',
      },
    },
    {
      week: 2,
      theme: 'Whole Bible · Doctrine of Scripture & God',
      sets: ['bc-whole', 'bk-pentateuch', 'bk-ot-history', 'th-a', 'theo-wcf', 'ch-overview', 'bco-officers'],
      reading: {
        outlines: 'Genesis–Exodus',
        contents: 'Joshua–Ruth',
        catechism: 'WSC 1–3, 89–90',
        hotTopic: 'Creation',
      },
    },
    {
      week: 3,
      theme: 'God & His world · Church history overview',
      sets: ['th-b', 'ch-denominations', 'bco-courts'],
      reading: {
        outlines: 'Leviticus–Deuteronomy',
        contents: '1 Samuel–2 Chronicles',
        catechism: 'WSC 4–11',
        hotTopic: 'Sabbath / the Lord’s Day',
        bibleContent: 'Old Testament: General (divisions of the OT, outline of OT history) — see the Whole Bible deck.',
      },
    },
    {
      week: 4,
      theme: 'Humankind · the Five Points (TULIP)',
      sets: ['bc-ot-people', 'bk-ot-major', 'th-c', 'dp-tulip', 'ch-events', 'bco-discipline'],
      reading: {
        outlines: 'Isaiah–Jeremiah',
        contents: 'Ezra–Esther',
        catechism: 'WSC 12–19',
        hotTopic: 'Theonomy',
        doctrines: 'TULIP — define each point with two proof texts.',
      },
    },
    {
      week: 5,
      theme: "God's way of salvation",
      sets: ['bc-ot-passages', 'bk-ot-poetry', 'th-d', 'ch-terms', 'bco-worship'],
      reading: {
        outlines: 'Ezekiel–Daniel',
        contents: 'Job–Proverbs',
        catechism: 'WSC 20–28',
        hotTopic: 'Divorce and Remarriage',
      },
    },
    {
      week: 6,
      theme: 'Salvation accomplished · Key People',
      sets: ['bc-ot-events', 'bk-gospels-acts', 'th-e', 'ch-people', 'bco-gov-courts'],
      reading: {
        outlines: 'Matthew–Mark',
        contents: 'Ecclesiastes, Song of Songs, Lamentations',
        catechism: 'WSC 29–36',
        hotTopic: 'Charismatic Gifts',
        history: 'Key People is a large deck the syllabus spreads across weeks 6–10.',
      },
    },
    {
      week: 7,
      theme: 'Salvation applied · the Ordo Salutis',
      sets: ['bc-nt-general', 'bk-ot-minor', 'th-f', 'dp-ordo', 'bco-gov-ministry'],
      reading: {
        outlines: 'Luke–John',
        contents: 'Hosea–Obadiah',
        catechism: 'WSC 85–87',
        hotTopic: 'The Role of Women in the Church',
        doctrines: 'The ordo salutis — name the order and cite proof texts (Rom 8:29–30).',
      },
    },
    {
      week: 8,
      theme: 'The Christian life',
      sets: ['bc-nt-people', 'th-g', 'bco-comp-foundations'],
      reading: {
        outlines: 'Acts',
        contents: 'Jonah–Habakkuk',
        catechism: 'WSC 39, 82–84',
        hotTopic: 'Civil Disobedience',
      },
    },
    {
      week: 9,
      theme: 'The Church · discipline',
      sets: ['bc-nt-passages', 'bk-paul', 'th-h', 'bco-comp-members-officers', 'bco-comp-courts'],
      reading: {
        outlines: 'Romans',
        contents: 'Zephaniah–Malachi',
        catechism: '(no new catechism this week)',
        hotTopic: 'Confessional Subscription',
        bibleContent: 'NT Key Passages spans weeks 9–10 in the syllabus.',
      },
    },
    {
      week: 10,
      theme: 'Last things · the gospel (evangelism)',
      sets: ['th-i', 'dp-gospel', 'bco-comp-vocation', 'bco-comp-discipline'],
      reading: {
        outlines: '1–2 Corinthians, Galatians',
        contents: '1–2 Thessalonians, the Pastoral Epistles',
        catechism: 'WSC 37–38',
        hotTopic: 'The Regulative Principle of Worship',
        doctrines: 'The evangelism plan — explain the gospel with a proof text for each point.',
      },
    },
    {
      week: 11,
      theme: 'The Holy Spirit & apologetics · worship · PCA history',
      sets: ['bc-nt-topics', 'bk-general', 'th-k', 'ch-pca', 'bco-comp-review', 'bco-comp-worship-principles'],
      reading: {
        outlines: 'Ephesians–Colossians',
        contents: 'James, 1–2 Peter',
        catechism: '(no new catechism this week)',
        hotTopic: 'Re-Baptism',
        bibleContent: 'NT Key Topics spans weeks 11–12 in the syllabus.',
      },
    },
    {
      week: 12,
      theme: 'The Sacraments',
      sets: ['sac-general', 'sac-baptism', 'sac-supper', 'bco-comp-sacraments-pastoral'],
      reading: {
        outlines: 'Hebrews, Revelation',
        contents: '1–3 John, Jude',
        catechism: 'WSC 88, 91–98',
        hotTopic: 'Paedo-Communion',
      },
    },
    {
      week: 13,
      theme: 'Final exam',
      sets: [],
      reading: {
        focus: 'Review all preceding weeks; the final draws questions from every week’s study guide.',
        hotTopic: 'Fencing the Lord’s Table',
      },
    },
  ];

  if (typeof global !== 'undefined') global.PCA_WEEKS = WEEKS;
})(typeof globalThis !== 'undefined' ? globalThis : window);
