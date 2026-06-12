// PCA Ordination & Licensure Study — BCO comprehensive supplemental cards.
// Source: user-supplied "quoted/labeled" bundle generated from the 2025 PCA
// Book of Church Order for educational ordination study. Adapted for this app:
// "Direct quotation:" lines became "BCO:" provenance callouts (renderAnswer),
// the redundant "Paraphrase:" prefix is dropped (all non-quoted BCO content
// here is paraphrase by policy), and semicolon-chained multi-part answers are
// recast as lists. Only very short BCO wording cues are quoted; verify exact
// wording against the official BCO (pcaac.org).

(function (global) {
  const SETS = {
  "bco-comp-foundations": {
    "label": "BCO Foundations: Christ, Church Power & the Visible Church",
    "subject": "bco",
    "order": 7,
    "cards": [
      {
        "id": "bco-comp-001",
        "q": "What is the governing theme of the BCO preface?",
        "a": "BCO: “only Lawgiver in Zion.”\nChrist is the only King and Head of the Church. The church’s doctrine, government, discipline, and worship are received from Him by Scripture, not invented by church courts.",
        "refs": [
          "BCO Preface I"
        ],
        "summary": "Christ rules His church by Word and Spirit; all church order is subordinate to Scripture.",
        "tags": [
          "form-government",
          "principles",
          "direct-quote"
        ]
      },
      {
        "id": "bco-comp-002",
        "q": "What does the BCO mean by saying church power is “ministerial and declarative”?",
        "a": "BCO: “ministerial and declarative.”\nChurch courts minister and declare what Christ has revealed in Scripture. They do not create new divine law or bind the conscience apart from the Word.",
        "refs": [
          "BCO Preface II.7",
          "BCO 11-2"
        ],
        "summary": "Church courts apply Scripture; they do not legislate for the conscience.",
        "tags": [
          "principles",
          "courts",
          "direct-quote"
        ]
      },
      {
        "id": "bco-comp-003",
        "q": "Summarize the PCA Constitution.",
        "a": "The PCA Constitution is subordinate to Scripture and consists of the Westminster Confession of Faith, Larger and Shorter Catechisms, and the BCO: Form of Government, Rules of Discipline, and Directory for Worship.",
        "refs": [
          "BCO Preface III"
        ],
        "summary": "Scripture is supreme; the Constitution contains the Standards and BCO.",
        "tags": [
          "constitution",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-004",
        "q": "What five heads summarize Presbyterian church government in BCO 1?",
        "a": "The church, its members, its officers, its courts, and its orders.",
        "refs": [
          "BCO 1-1"
        ],
        "summary": "Five heads: church, members, officers, courts, orders.",
        "tags": [
          "form-government",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-005",
        "q": "How does BCO 1 describe the visible church?",
        "a": "BCO: “visible kingdom of grace.”\nChrist erected the visible church for gathering and perfecting the saints; it is His visible kingdom of grace and is one across all ages.",
        "refs": [
          "BCO 1-2"
        ],
        "summary": "The church is Christ’s visible kingdom of grace, one in all ages.",
        "tags": [
          "church",
          "direct-quote"
        ]
      },
      {
        "id": "bco-comp-006",
        "q": "Who belongs to the visible church catholic?",
        "a": "All persons in every nation who profess faith in the Lord Jesus Christ and promise submission to His laws, together with their children.",
        "refs": [
          "BCO 1-3",
          "BCO 2-1"
        ],
        "summary": "Professing believers and their children.",
        "tags": [
          "membership",
          "church",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-007",
        "q": "What officers administer the church’s powers?",
        "a": "Teaching elders, ruling elders, and deacons administer the church’s powers according to Scripture.",
        "refs": [
          "BCO 1-4",
          "BCO 7-2"
        ],
        "summary": "The ordinary officers are elders and deacons; elders include teaching and ruling elders.",
        "tags": [
          "officers",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-008",
        "q": "Why are Presbyterian courts connectional rather than independent?",
        "a": "Ecclesiastical jurisdiction is a joint power exercised by presbyters in courts. Courts may oversee one or many churches, yet they stand in mutual relation to express the unity of the church.",
        "refs": [
          "BCO 1-5",
          "BCO 11-4"
        ],
        "summary": "Church courts are mutually related organs of one church, not independent tribunals.",
        "tags": [
          "courts",
          "polity",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-009",
        "q": "Is Presbyterian polity essential to the existence of the church?",
        "a": "No. BCO says presbytery is necessary to the perfection of the visible church’s order, but not essential to its existence.",
        "refs": [
          "BCO 1-7"
        ],
        "summary": "Presbyterian order perfects church order but is not of the essence of being a true church.",
        "tags": [
          "polity",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-010",
        "q": "How should the PCA recognize other Christian denominations?",
        "a": "Divisions obscure visible unity but do not destroy it. Churches maintaining Word and Sacraments in fundamental integrity are recognized as true branches of Christ’s church.",
        "refs": [
          "BCO 2-2"
        ],
        "summary": "True branches maintain Word and Sacraments in fundamental integrity.",
        "tags": [
          "ecclesiology",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-011",
        "q": "What is the twofold distinction in ecclesiastical power?",
        "a": "BCO: “power of order.”\nThe power of order is exercised severally by officers in preaching, sacraments, reproof, visitation, and comfort. The power of jurisdiction is exercised jointly in church courts.",
        "refs": [
          "BCO 3-2"
        ],
        "summary": "Order: officer acts severally. Jurisdiction: courts act jointly.",
        "tags": [
          "church-power",
          "direct-quote"
        ]
      },
      {
        "id": "bco-comp-012",
        "q": "What are the church’s sole functions as distinct from the civil commonwealth?",
        "a": "To proclaim, administer, and enforce the law of Christ revealed in Scripture.",
        "refs": [
          "BCO 3-3"
        ],
        "summary": "Proclaim, administer, and enforce Christ’s revealed law.",
        "tags": [
          "church-power",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-013",
        "q": "How does BCO 3 distinguish church power from state power?",
        "a": "Church power is exclusively spiritual; civil power includes force. The church receives its constitution from divine revelation; the state’s constitution is determined by reason and providence.",
        "refs": [
          "BCO 3-4"
        ],
        "summary": "Church: spiritual. State: includes force.",
        "tags": [
          "church-state",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-014",
        "q": "What is a particular church?",
        "a": "A body of professing Christians and their children associated for worship and godly living, according to Scripture, under Christ’s lawful government.",
        "refs": [
          "BCO 4-1"
        ],
        "summary": "A local congregation ordered for worship, godly living, and Christ’s government.",
        "tags": [
          "particular-church",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-015",
        "q": "Where is the jurisdiction of a particular church lodged?",
        "a": "In the Session, consisting of the pastor or pastors, associate pastor(s), and ruling elders.",
        "refs": [
          "BCO 4-3",
          "BCO 12-1"
        ],
        "summary": "Local jurisdiction is lodged in the Session.",
        "tags": [
          "session",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-016",
        "q": "What ordinances does BCO 4 list as established by Christ in His church?",
        "a": "Prayer, singing praise, Scripture reading and preaching, Baptism, the Lord’s Supper, fasting and thanksgiving, catechizing, offerings for mercy and pious uses, discipline, vows, and ordination.",
        "refs": [
          "BCO 4-4"
        ],
        "summary": "BCO 4-4 is the compact map of ordinary church ordinances.",
        "tags": [
          "worship",
          "ordinances",
          "paraphrase"
        ]
      }
    ]
  },
  "bco-comp-members-officers": {
    "label": "BCO Membership, Mission Churches & Officers",
    "subject": "bco",
    "order": 8,
    "cards": [
      {
        "id": "bco-comp-017",
        "q": "What distinguishes a mission church from a particular church?",
        "a": "A mission church is like a particular church in its gathered life, but it has no permanent governing body and is temporarily governed or supervised by Presbytery, a mother Session, an evangelist, or a commission.",
        "refs": [
          "BCO 5-1",
          "BCO 5-3"
        ],
        "summary": "Mission churches lack a permanent governing body and aim toward organization.",
        "tags": [
          "mission-church",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-018",
        "q": "Who ordinarily establishes mission churches?",
        "a": "Presbyteries ordinarily establish mission churches within their bounds, whether on their own initiative, through a Session’s initiative, or in response to a petitioning group.",
        "refs": [
          "BCO 5-2"
        ],
        "summary": "Ordinarily, Presbytery establishes the mission church.",
        "tags": [
          "mission-church",
          "presbytery",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-019",
        "q": "What temporary governments may Presbytery provide for a mission church?",
        "a": "Presbytery may appoint an evangelist, arrange a mother-daughter relationship with a Session, or appoint a commission to serve as temporary Session.",
        "refs": [
          "BCO 5-3"
        ],
        "summary": "Evangelist, mother Session, or temporary-session commission.",
        "tags": [
          "mission-church",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-020",
        "q": "What steps organize a mission church as a particular church?",
        "a": "The temporary government oversees officer nomination and election, the members petition Presbytery, Presbytery appoints an organizing commission, and the commission ordains/installs officers and declares the church organized.",
        "refs": [
          "BCO 5-9"
        ],
        "summary": "Petition, Presbytery approval, organizing commission, officers, covenant, declaration.",
        "tags": [
          "mission-church",
          "particularization",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-021",
        "q": "What are non-communing members?",
        "a": "The baptized children of believers, members by covenant and birthright, entitled to Baptism and to pastoral oversight, instruction, and government of the church.",
        "refs": [
          "BCO 6-1"
        ],
        "summary": "Covenant children are non-communing members.",
        "tags": [
          "membership",
          "children",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-022",
        "q": "What are communing members?",
        "a": "Those who have professed faith in Christ, have been baptized, and have been admitted by the Session to the Lord’s Table.",
        "refs": [
          "BCO 6-2"
        ],
        "summary": "Profession, Baptism, and admission to the Table.",
        "tags": [
          "membership",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-023",
        "q": "Who is entitled to all rights and privileges of the church?",
        "a": "Only those who have professed faith, been baptized, and been admitted by the Session to the Lord’s Table.",
        "refs": [
          "BCO 6-4"
        ],
        "summary": "Communing members have all rights and privileges.",
        "tags": [
          "membership",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-024",
        "q": "What ordinary and perpetual offices does the BCO recognize?",
        "a": "Elders and deacons. Within the eldership are teaching elders and ruling elders.",
        "refs": [
          "BCO 7-2"
        ],
        "summary": "Two classes of ordinary office: elders and deacons.",
        "tags": [
          "officers",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-025",
        "q": "What is the basic difference between elder and deacon?",
        "a": "Elders jointly govern and spiritually oversee the church, including teaching. Deacons serve the physical and spiritual needs of the people and do not exercise rule.",
        "refs": [
          "BCO 7-2",
          "BCO 9-1"
        ],
        "summary": "Elders rule and oversee; deacons serve mercy and practical needs.",
        "tags": [
          "officers",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-026",
        "q": "What titles should not be given to unordained people?",
        "a": "Unordained people should not be referred to by titles of ordained offices such as pastor/elder or deacon.",
        "refs": [
          "BCO 7-3"
        ],
        "summary": "Do not title unordained persons as ordained officers.",
        "tags": [
          "officers",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-027",
        "q": "What qualifications does BCO 8 require of an elder?",
        "a": "An elder should be competent in learning, blameless in life, sound in faith, apt to teach, sober and holy, faithful in chastity and sexual purity, ruling his own house well, and well regarded outside the church.",
        "refs": [
          "BCO 8-2"
        ],
        "summary": "Learning, life, doctrine, teaching aptitude, household, reputation, purity.",
        "tags": [
          "elder",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-028",
        "q": "What are the shared duties of elders?",
        "a": "Elders watch over doctrine and morals, exercise government and discipline, visit and instruct, comfort mourners, guard the children of the church, evangelize, disciple, show hospitality, and pray with and for the people.",
        "refs": [
          "BCO 8-3"
        ],
        "summary": "Elders shepherd doctrine, morals, discipline, visitation, instruction, prayer, and example.",
        "tags": [
          "elder",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-029",
        "q": "What belongs especially to the teaching elder?",
        "a": "In addition to shared elder duties, the teaching elder reads, expounds, and preaches the Word and administers the Sacraments.",
        "refs": [
          "BCO 8-5"
        ],
        "summary": "Teaching elders preach the Word and administer sacraments.",
        "tags": [
          "teaching-elder",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-030",
        "q": "What is the parity of teaching and ruling elders?",
        "a": "Both are elders of one class of office. Ruling elders possess the same authority and eligibility in church courts as teaching elders, though their functions differ.",
        "refs": [
          "BCO 8-10"
        ],
        "summary": "Same office and court authority; different functions.",
        "tags": [
          "elder",
          "parity",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-031",
        "q": "What may a Presbytery commission an evangelist to do?",
        "a": "In mission settings, a teaching elder evangelist may be commissioned to preach, administer sacraments, receive and dismiss mission-church members, train potential officers, and in extraordinary cases examine, ordain, install officers, and organize churches.",
        "refs": [
          "BCO 8-6"
        ],
        "summary": "Evangelists may receive extraordinary delegated powers for mission-church work.",
        "tags": [
          "evangelist",
          "mission-church",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-032",
        "q": "What is the character of the deacon’s office?",
        "a": "BCO: “sympathy and service.”\nIt is an ordinary, perpetual office of sympathy and service, reflecting the communion of saints and mutual help in need.",
        "refs": [
          "BCO 9-1"
        ],
        "summary": "Deacon = sympathy, service, mercy.",
        "tags": [
          "deacon",
          "direct-quote"
        ]
      },
      {
        "id": "bco-comp-033",
        "q": "What are the chief duties of deacons?",
        "a": "Deacons are to:\n- minister to the needy, sick, friendless, and distressed\n- promote liberality\n- collect and distribute gifts\n- care for church property under Session oversight",
        "refs": [
          "BCO 9-2"
        ],
        "summary": "Mercy, liberality, collections, distribution, and property care.",
        "tags": [
          "deacon",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-034",
        "q": "How are deacons organized in a particular church?",
        "a": "As a Board of Deacons, with the pastor as advisory member. The Board elects a chairman and secretary, keeps records, manages funds assigned to it, and submits minutes to the Session.",
        "refs": [
          "BCO 9-4"
        ],
        "summary": "A local diaconate is organized as a Board under Session oversight.",
        "tags": [
          "deacon",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-035",
        "q": "May non-officers assist the deacons?",
        "a": "Yes. The Session may appoint godly men and women to assist the deacons in mercy work; these assistants are not church officers and are not ordained.",
        "refs": [
          "BCO 9-7"
        ],
        "summary": "Deacon assistants may be appointed but are not ordained officers.",
        "tags": [
          "deacon",
          "mercy",
          "paraphrase"
        ]
      }
    ]
  },
  "bco-comp-courts": {
    "label": "BCO Courts: Session, Presbytery, General Assembly & Commissions",
    "subject": "bco",
    "order": 9,
    "cards": [
      {
        "id": "bco-comp-036",
        "q": "Name the regular courts of the PCA.",
        "a": "The Session, the Presbytery, and the General Assembly.",
        "refs": [
          "BCO 10-2"
        ],
        "summary": "Session, Presbytery, General Assembly.",
        "tags": [
          "courts",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-037",
        "q": "What officers must each church court have?",
        "a": "A moderator and clerk. The pastor ordinarily moderates the Session; Presbyteries and General Assembly elect moderators as provided.",
        "refs": [
          "BCO 10-3",
          "BCO 10-4"
        ],
        "summary": "Courts have moderators and clerks.",
        "tags": [
          "courts",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-038",
        "q": "What is the jurisdiction of church courts?",
        "a": "Jurisdiction is moral and spiritual, not civil. It concerns doctrine, order, worship, discipline, and the administration necessary to give effect to those powers.",
        "refs": [
          "BCO 11-1",
          "BCO 11-2"
        ],
        "summary": "Church courts exercise spiritual, not civil, jurisdiction.",
        "tags": [
          "courts",
          "jurisdiction",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-039",
        "q": "How do the three courts differ in sphere?",
        "a": "BCO: “regular gradation.”\n- **Session** governs a single church.\n- **Presbytery** governs what is common to ministers, Sessions, and churches within a district.\n- **General Assembly** governs matters concerning the whole church.",
        "refs": [
          "BCO 11-4"
        ],
        "summary": "Local, regional, whole-church spheres.",
        "tags": [
          "courts",
          "direct-quote"
        ]
      },
      {
        "id": "bco-comp-040",
        "q": "Who composes the Session?",
        "a": "The pastor, any associate pastor(s), and the ruling elders of the church. Assistant pastors may be invited to participate without vote.",
        "refs": [
          "BCO 12-1"
        ],
        "summary": "Pastor/associate pastors plus ruling elders; assistants no vote.",
        "tags": [
          "session",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-041",
        "q": "What is the Session quorum when a church has a pastor?",
        "a": "If there are four or more ruling elders: pastor plus two ruling elders. If fewer than four: pastor plus one ruling elder. A Session may set a larger quorum.",
        "refs": [
          "BCO 12-1"
        ],
        "summary": "With pastor: pastor + two REs if 4+ REs; pastor + one RE if fewer.",
        "tags": [
          "session",
          "quorum",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-042",
        "q": "What is the Session quorum when a church has no pastor?",
        "a": "If there are five or more ruling elders, three constitute a quorum; if fewer than five, two. One ruling elder alone is not a Session but should take spiritual oversight and report matters needing court action.",
        "refs": [
          "BCO 12-1"
        ],
        "summary": "No pastor: 3 if 5+ REs; 2 if fewer; one RE is not a Session.",
        "tags": [
          "session",
          "quorum",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-043",
        "q": "What are some specific powers of the Session?",
        "a": "The Session:\n- receives, dismisses, disciplines, and oversees members\n- examines, ordains, and installs ruling elders and deacons\n- reviews deacon records\n- approves the budget\n- controls worship and church property uses\n- calls congregational meetings\n- appoints representatives to higher courts",
        "refs": [
          "BCO 12-5"
        ],
        "summary": "Membership, discipline, officers, worship, budget, property uses, meetings, representatives.",
        "tags": [
          "session",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-044",
        "q": "How often must the Session meet and keep records?",
        "a": "It must hold stated meetings at least quarterly, open and close meetings with prayer, keep accurate minutes, and submit records annually to Presbytery.",
        "refs": [
          "BCO 12-6",
          "BCO 12-7",
          "BCO 12-9"
        ],
        "summary": "At least quarterly; records annually reviewed by Presbytery.",
        "tags": [
          "session",
          "records",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-045",
        "q": "Who composes a Presbytery?",
        "a": "All teaching elders and churches within its bounds accepted by the Presbytery; when meeting as court, it includes teaching elders and ruling elders elected by Sessions.",
        "refs": [
          "BCO 13-1"
        ],
        "summary": "Regional court of TEs and RE representatives of churches.",
        "tags": [
          "presbytery",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-046",
        "q": "What is the ruling elder representation formula for Presbytery?",
        "a": "Each congregation receives two ruling elder representatives for the first 350 communing members or fraction, plus one additional ruling elder for each additional 500 communicants or fraction.",
        "refs": [
          "BCO 13-1"
        ],
        "summary": "Two REs for first 350; one more per additional 500 or fraction.",
        "tags": [
          "presbytery",
          "representation",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-047",
        "q": "What is the quorum of Presbytery?",
        "a": "Three ministers belonging to the Presbytery and at least three ruling elders. Presbytery may fix a larger quorum.",
        "refs": [
          "BCO 13-4"
        ],
        "summary": "3 TEs + 3 REs minimum.",
        "tags": [
          "presbytery",
          "quorum",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-048",
        "q": "What are core powers of Presbytery?",
        "a": "Presbytery:\n- oversees ministers, candidates, Sessions, and churches\n- examines and receives ministers\n- licenses, ordains, installs, transfers, judges, and removes teaching elders\n- organizes and dissolves churches\n- reviews Session records\n- resolves references, appeals, and complaints\n- promotes mission",
        "refs": [
          "BCO 13-9"
        ],
        "summary": "Presbytery governs what is common to ministers, Sessions, and churches.",
        "tags": [
          "presbytery",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-049",
        "q": "How are ministers transferring from another PCA Presbytery examined?",
        "a": "They are examined on Christian experience, personal character and family management, and their views in theology, sacraments, and church government; they must state any differences with the Standards.",
        "refs": [
          "BCO 13-6"
        ],
        "summary": "Transfer exams include experience, character/family, theology, sacraments, government, and stated differences.",
        "tags": [
          "presbytery",
          "ministers",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-050",
        "q": "What is the General Assembly?",
        "a": "The highest court of the PCA, representing all churches in one body and serving as the bond of union, peace, and correspondence among congregations and courts.",
        "refs": [
          "BCO 14-1"
        ],
        "summary": "The highest court and bond of union among PCA churches.",
        "tags": [
          "general-assembly",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-051",
        "q": "Who composes the General Assembly?",
        "a": "All teaching elders in good standing with their Presbyteries and ruling elders elected by Sessions according to the representation formula.",
        "refs": [
          "BCO 14-2"
        ],
        "summary": "TEs in good standing plus RE commissioners from Sessions.",
        "tags": [
          "general-assembly",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-052",
        "q": "What is the quorum for General Assembly?",
        "a": "One hundred commissioners, half teaching elders and half ruling elders, representing at least one-third of the Presbyteries.",
        "refs": [
          "BCO 14-5"
        ],
        "summary": "100 commissioners: 50 TEs, 50 REs, one-third of Presbyteries.",
        "tags": [
          "general-assembly",
          "quorum",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-053",
        "q": "What kinds of business may General Assembly handle?",
        "a": "- appeals, references, and complaints\n- doctrinal and disciplinary controversies\n- review of Presbytery records\n- measures for church growth\n- erecting, uniting, and dividing Presbyteries\n- superintending agencies\n- suppressing schism\n- correspondence with other churches\n- constitutional amendment proposals",
        "refs": [
          "BCO 14-6"
        ],
        "summary": "GA handles whole-church doctrine, discipline, review, mission, presbyteries, agencies, correspondence, amendments.",
        "tags": [
          "general-assembly",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-054",
        "q": "What force do General Assembly actions have?",
        "a": "Deliverances, resolutions, overtures, and judicial decisions receive due and serious consideration; judicial decisions bind the parties and may be appealed to for principles decided in similar cases.",
        "refs": [
          "BCO 14-7"
        ],
        "summary": "GA actions deserve serious consideration; judicial decisions bind parties.",
        "tags": [
          "general-assembly",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-055",
        "q": "What is the difference between a committee and a commission?",
        "a": "A committee examines, considers, and reports. A commission is authorized to deliberate and conclude the business referred to it.",
        "refs": [
          "BCO 15-1"
        ],
        "summary": "Committee reports; commission acts for the court.",
        "tags": [
          "commissions",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-056",
        "q": "What matters may Presbytery commit to commissions?",
        "a": "Taking testimony in judicial cases, ordaining or installing ministers, visiting disorderly portions of the church, organizing new churches, and other properly referred cases.",
        "refs": [
          "BCO 15-2",
          "BCO 15-3"
        ],
        "summary": "Commissions may act in ordination, installation, testimony, visitation, organization, and judicial matters.",
        "tags": [
          "commissions",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-057",
        "q": "What is the minimum composition of a Presbytery commission?",
        "a": "At least two teaching elders and two ruling elders. Ordination, installation, or judicial commissions require a quorum not less than two teaching elders and two ruling elders.",
        "refs": [
          "BCO 15-2"
        ],
        "summary": "At least 2 TEs + 2 REs; judicial/ordination quorum at least the same.",
        "tags": [
          "commissions",
          "quorum",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-058",
        "q": "What is the Standing Judicial Commission?",
        "a": "A permanent General Assembly commission of twenty-four members, equal numbers of teaching and ruling elders by classes, to which GA commits judicial matters governed by the Rules of Discipline, except annual Presbytery-record review.",
        "refs": [
          "BCO 15-4"
        ],
        "summary": "SJC handles GA judicial cases under BCO 15.",
        "tags": [
          "sjc",
          "general-assembly",
          "paraphrase"
        ]
      }
    ]
  },
  "bco-comp-vocation": {
    "label": "BCO Vocation, Candidates, Licensure, Ordination & Congregational Action",
    "subject": "bco",
    "order": 10,
    "cards": [
      {
        "id": "bco-comp-059",
        "q": "What is ordinary vocation to office?",
        "a": "God’s calling by the Spirit through an inward testimony of conscience, the manifest approbation of God’s people, and the concurring judgment of a lawful church court.",
        "refs": [
          "BCO 16-1"
        ],
        "summary": "Inward call, church recognition, court judgment.",
        "tags": [
          "vocation",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-060",
        "q": "May a man be placed in office without election by the church?",
        "a": "No. Ordinary vocation to office includes election by the body where the officer will serve, with court judgment and ordination/installation as applicable.",
        "refs": [
          "BCO 16-2",
          "BCO 17-1"
        ],
        "summary": "Election and court approval are ordinary parts of calling.",
        "tags": [
          "vocation",
          "election",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-061",
        "q": "What is ordination?",
        "a": "The authoritative admission of a man to church office by prayer and the laying on of hands of a court, following election, examination, and approval.",
        "refs": [
          "BCO 17-1",
          "BCO 17-2"
        ],
        "summary": "Ordination authoritatively admits to office after testing and election/call.",
        "tags": [
          "ordination",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-062",
        "q": "Is ordination repeated when an officer changes work?",
        "a": "No. Ordination is to office and is not repeated; installation places an already ordained officer into a particular charge.",
        "refs": [
          "BCO 17-2",
          "BCO 21",
          "BCO 24"
        ],
        "summary": "Ordination once; installation for a specific charge.",
        "tags": [
          "ordination",
          "installation",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-063",
        "q": "Who may become a candidate for the gospel ministry?",
        "a": "A communing member who believes himself called to preach and submits to Presbytery’s care, guidance, study, and practical training.",
        "refs": [
          "BCO 18-1"
        ],
        "summary": "A candidate is a communing member under Presbytery care for ministry preparation.",
        "tags": [
          "candidates",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-064",
        "q": "What is ordinarily required before a man comes under care as a candidate?",
        "a": "He should be a communicant member for at least six months, receive Session endorsement, apply to Presbytery in time, appear before Presbytery, and be examined on experimental religion and motives.",
        "refs": [
          "BCO 18-2",
          "BCO 18-3"
        ],
        "summary": "Membership, Session endorsement, application, personal appearance, examination.",
        "tags": [
          "candidates",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-065",
        "q": "What is licensure?",
        "a": "Presbytery’s permission for a candidate to preach the gospel regularly in PCA pulpits under its jurisdiction as a probationary step toward ordination.",
        "refs": [
          "BCO 19-1"
        ],
        "summary": "Licensure authorizes regular preaching before ordination.",
        "tags": [
          "licensure",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-066",
        "q": "What examinations are required for licensure?",
        "a": "- Christian experience and inward call\n- theology\n- English Bible\n- the BCO\n- oral examination in the same areas\n- plus a written and delivered sermon",
        "refs": [
          "BCO 19-2"
        ],
        "summary": "Experience/call, theology, Bible, BCO, oral exam, sermon.",
        "tags": [
          "licensure",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-067",
        "q": "What is internship in the BCO?",
        "a": "A period for trial and development of ministerial gifts before ordination. It must be at least one year and should involve the full scope of regular ministerial duties as Presbytery determines.",
        "refs": [
          "BCO 19-7"
        ],
        "summary": "At least one year testing gifts and duties.",
        "tags": [
          "internship",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-068",
        "q": "Who may call a pastor?",
        "a": "A congregation, acting in a properly called congregational meeting, elects a pastor; Presbytery must approve and install the pastoral relationship.",
        "refs": [
          "BCO 20",
          "BCO 21"
        ],
        "summary": "Congregation elects; Presbytery approves and installs.",
        "tags": [
          "pastor",
          "congregation",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-069",
        "q": "What is a pulpit committee/search committee?",
        "a": "The congregation may elect a committee to seek a pastor and recommend a candidate, but the call itself belongs to the congregation and must be approved by Presbytery.",
        "refs": [
          "BCO 20-2",
          "BCO 20-3"
        ],
        "summary": "Search committees recommend; congregations vote; Presbytery approves.",
        "tags": [
          "pastor",
          "search-committee",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-070",
        "q": "What votes are required to elect a pastor?",
        "a": "The congregation votes by ballot. A majority is ordinarily required, unless the congregation has by rule required a larger majority.",
        "refs": [
          "BCO 20-3"
        ],
        "summary": "Pastoral election is by congregational ballot, ordinarily majority.",
        "tags": [
          "pastor",
          "election",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-071",
        "q": "What trials are required for ordination to the gospel ministry?",
        "a": "Presbytery examines Christian experience and call, theology, sacraments, church government, Bible content, church history, PCA history, original languages, and requires sermon and papers as specified.",
        "refs": [
          "BCO 21-4"
        ],
        "summary": "Ordination trials cover experience, doctrine, Bible, sacraments, government, history, languages, sermon/papers.",
        "tags": [
          "ordination",
          "exams",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-072",
        "q": "How does Presbytery evaluate a candidate’s differences with the Westminster Standards?",
        "a": "The candidate states each difference. Presbytery judges whether it is merely semantic, more than semantic but not contrary to fundamentals, or out of accord with a fundamental of the system.",
        "refs": [
          "BCO 21-4.f",
          "BCO 21-4.g"
        ],
        "summary": "The court, not the candidate alone, judges stated differences.",
        "tags": [
          "subscription",
          "ordination",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-073",
        "q": "What are the ordination vows for a teaching elder about Scripture and Standards?",
        "a": "He affirms Scripture as inerrant Word of God, sincerely receives and adopts the Westminster Standards as containing the system of doctrine taught in Scripture, and approves PCA government and discipline.",
        "refs": [
          "BCO 21-5"
        ],
        "summary": "TE vows bind him to Scripture, Westminster Standards, and PCA polity.",
        "tags": [
          "ordination",
          "vows",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-074",
        "q": "What vows does a teaching elder make about ministry conduct?",
        "a": "He promises subjection to his brethren, zeal for gospel truth and church purity/peace, faithful discharge of duties, and pastoral care over the charge if installed.",
        "refs": [
          "BCO 21-5"
        ],
        "summary": "Submission, zeal, faithfulness, and pastoral charge.",
        "tags": [
          "ordination",
          "vows",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-075",
        "q": "What vows does the congregation make to a pastor?",
        "a": "The congregation receives him as pastor, promises to receive the Word with meekness and love, submit to him in the Lord, encourage him, and provide for his temporal support.",
        "refs": [
          "BCO 21-10"
        ],
        "summary": "Receive, heed, submit in the Lord, encourage, and support.",
        "tags": [
          "pastor",
          "vows",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-076",
        "q": "How do pastor, associate pastor, and assistant pastor differ?",
        "a": "A pastor is called by the congregation. An associate pastor is also called by the congregation and is a Session member. An assistant pastor is called by the Session and is not a Session member by that call.",
        "refs": [
          "BCO 22-1",
          "BCO 22-2",
          "BCO 22-3"
        ],
        "summary": "Congregation calls pastor/associate; Session calls assistant.",
        "tags": [
          "pastoral-relations",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-077",
        "q": "Who dissolves a pastoral relationship?",
        "a": "Presbytery dissolves the pastoral relationship, ordinarily after the pastor, congregation, or both seek dissolution and the parties have opportunity to be heard.",
        "refs": [
          "BCO 23"
        ],
        "summary": "Presbytery has the final action on dissolution.",
        "tags": [
          "pastoral-relations",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-078",
        "q": "How are ruling elders and deacons nominated and elected?",
        "a": "The Session gives at least one month’s public notice, receives nominations, examines nominees, presents approved nominees, and the congregation elects by majority vote of those present unless the congregation has set a higher threshold.",
        "refs": [
          "BCO 24-1",
          "BCO 24-3",
          "BCO 24-4"
        ],
        "summary": "Notice, nominations, Session examination, congregational election.",
        "tags": [
          "ruling-elder",
          "deacon",
          "election",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-079",
        "q": "What does the Session examine in ruling elder and deacon nominees?",
        "a": "- Christian experience, especially personal character\n- knowledge of doctrine, government, and discipline\n- the duties of the office\n- willingness to assent to ordination questions",
        "refs": [
          "BCO 24-1"
        ],
        "summary": "Character, doctrine, polity, duties, vows.",
        "tags": [
          "officer-exam",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-080",
        "q": "What vows do ruling elders and deacons make?",
        "a": "They affirm Scripture, receive the Westminster Standards, approve PCA government and discipline, accept office, promise faithful performance, and promise subjection to their brethren in the Lord.",
        "refs": [
          "BCO 24-6"
        ],
        "summary": "RE/deacon vows parallel TE subscription and office faithfulness.",
        "tags": [
          "ordination",
          "vows",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-081",
        "q": "Who may vote in congregational meetings?",
        "a": "Communing members in good and regular standing are entitled to vote in congregational meetings.",
        "refs": [
          "BCO 25-1"
        ],
        "summary": "Communing members vote.",
        "tags": [
          "congregational-meetings",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-082",
        "q": "What notice and business limits apply to congregational meetings?",
        "a": "The Session calls congregational meetings and gives at least one week’s public notice. No business may be transacted except what is stated in the notice.",
        "refs": [
          "BCO 25-2"
        ],
        "summary": "One week notice; business limited to the notice.",
        "tags": [
          "congregational-meetings",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-083",
        "q": "Who owns local church property?",
        "a": "The particular church, through its corporation/trustees or proper representatives, holds sole title to its property; higher courts receive property only by free and voluntary action.",
        "refs": [
          "BCO 25-8"
        ],
        "summary": "Local church owns its property.",
        "tags": [
          "property",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-084",
        "q": "How is the BCO amended?",
        "a": "A majority vote at one General Assembly recommends the amendment, two-thirds of Presbyteries advise and consent, and a subsequent General Assembly approves and enacts by majority vote.",
        "refs": [
          "BCO 26-2"
        ],
        "summary": "GA majority → 2/3 Presbyteries → next GA majority.",
        "tags": [
          "amendment",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-085",
        "q": "How are the Westminster Standards amended?",
        "a": "Three-fourths of a General Assembly recommends, three-fourths of Presbyteries advise and consent, and a subsequent General Assembly approves and enacts by three-fourths vote.",
        "refs": [
          "BCO 26-3"
        ],
        "summary": "3/4 GA → 3/4 Presbyteries → next GA 3/4.",
        "tags": [
          "amendment",
          "standards",
          "paraphrase"
        ]
      }
    ]
  },
  "bco-comp-discipline": {
    "label": "BCO Discipline, Offenses, Censures & Judicial Process",
    "subject": "bco",
    "order": 11,
    "cards": [
      {
        "id": "bco-comp-086",
        "q": "Define discipline in the BCO.",
        "a": "Discipline is church authority given by Christ to instruct, guide, and promote purity and welfare. It includes broad shepherding government and the narrower technical sense of judicial process.",
        "refs": [
          "BCO 27-1"
        ],
        "summary": "Discipline broadly trains and governs; narrowly, it is judicial process.",
        "tags": [
          "discipline",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-087",
        "q": "Who is subject to church discipline?",
        "a": "BCO: “exercise of authority.”\nAll baptized persons, because they are members of the church, are subject to discipline and entitled to its benefits.",
        "refs": [
          "BCO 27-2"
        ],
        "summary": "All baptized members are under discipline.",
        "tags": [
          "discipline",
          "membership",
          "direct-quote"
        ]
      },
      {
        "id": "bco-comp-088",
        "q": "What are the ends of discipline?",
        "a": "The glory of God, the purity of the church, the keeping and reclaiming of disobedient sinners; judicially, it rebukes offenses, removes scandal, vindicates Christ’s honor, edifies the church, and seeks the offender’s spiritual good.",
        "refs": [
          "BCO 27-3"
        ],
        "summary": "Glory of God, purity of church, reclaiming sinners.",
        "tags": [
          "discipline",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-089",
        "q": "What pastoral spirit should govern discipline?",
        "a": "Discipline is for building up, not destruction. It should be exercised under mercy, with pastoral instruction and the aim of restoration.",
        "refs": [
          "BCO 27-4",
          "BCO 36-5"
        ],
        "summary": "Discipline is remedial and pastoral, not merely punitive.",
        "tags": [
          "discipline",
          "pastoral",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-090",
        "q": "What are the ordinary Scriptural steps before court action?",
        "a": "1. Instruction in the Word\n2. private admonition\n3. one or more witnesses if rejected\n4. then the church acting through her court if rejection persists",
        "refs": [
          "BCO 27-5"
        ],
        "summary": "Word, admonition, witnesses, court action.",
        "tags": [
          "discipline",
          "matthew-18",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-091",
        "q": "How should non-communing members be disciplined?",
        "a": "Primarily through parents, with Session oversight, instruction, catechizing, and pastoral care aimed at bringing covenant children to personal faith and orderly discipleship.",
        "refs": [
          "BCO 28-1",
          "BCO 28-3"
        ],
        "summary": "Parents have primary responsibility, with Session oversight.",
        "tags": [
          "discipline",
          "children",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-092",
        "q": "What is an offense?",
        "a": "Anything in doctrine or practice contrary to the Word of God. The BCO distinguishes personal offenses from general offenses and requires careful judgment by the courts.",
        "refs": [
          "BCO 29-1"
        ],
        "summary": "An offense is doctrine or practice contrary to Scripture.",
        "tags": [
          "offenses",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-093",
        "q": "When should courts handle private offenses?",
        "a": "Private offenses should first be addressed by the personal steps of Matthew 18. A court acts when those steps fail or when scandal and church welfare require formal process.",
        "refs": [
          "BCO 29",
          "BCO 31"
        ],
        "summary": "Private offenses ordinarily start privately before court action.",
        "tags": [
          "discipline",
          "offenses",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-094",
        "q": "List the church censures.",
        "a": "Admonition, suspension from the Sacraments, suspension from office, deposition from office, and excommunication.",
        "refs": [
          "BCO 30-1"
        ],
        "summary": "Admonition, suspension, deposition, excommunication.",
        "tags": [
          "censures",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-095",
        "q": "What is admonition?",
        "a": "BCO: “judicial process.”\nA formal reproof by a church court, warning the offender and calling him to repentance.",
        "refs": [
          "BCO 30-2",
          "BCO 36"
        ],
        "summary": "Formal reproof and warning.",
        "tags": [
          "censures",
          "direct-quote"
        ]
      },
      {
        "id": "bco-comp-096",
        "q": "What is suspension?",
        "a": "Temporary exclusion from sacramental privileges, from office, or both, either definite or indefinite as the case requires.",
        "refs": [
          "BCO 30-3",
          "BCO 30-4"
        ],
        "summary": "Temporary exclusion from privilege or office.",
        "tags": [
          "censures",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-097",
        "q": "What are deposition and excommunication?",
        "a": "Deposition removes an officer from office. Excommunication excludes an offender from church communion until repentance and restoration.",
        "refs": [
          "BCO 30-5",
          "BCO 30-6"
        ],
        "summary": "Deposition removes office; excommunication excludes from communion.",
        "tags": [
          "censures",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-098",
        "q": "Who are the parties in a case of process?",
        "a": "The Presbyterian Church in America is the accuser; the accused is the other party. The court appoints a prosecutor when formal process is instituted.",
        "refs": [
          "BCO 31-1",
          "BCO 31-2"
        ],
        "summary": "In process, the church prosecutes; the accused answers.",
        "tags": [
          "process",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-099",
        "q": "What must a court do before formal process?",
        "a": "It must exercise due diligence and discretion to seek satisfactory explanations concerning reports affecting Christian character. If a strong presumption of guilt arises, the court institutes process.",
        "refs": [
          "BCO 31-2"
        ],
        "summary": "Investigate reports; institute process only on strong presumption of guilt.",
        "tags": [
          "process",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-100",
        "q": "What must a charge and specification contain?",
        "a": "A charge states the alleged offense; specifications give the facts, times, places, and circumstances supporting the charge so the accused can answer.",
        "refs": [
          "BCO 32-5"
        ],
        "summary": "Charge = offense; specifications = facts supporting it.",
        "tags": [
          "process",
          "charges",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-101",
        "q": "What rights does the accused have in process?",
        "a": "The accused must receive proper citation and charges, have time to prepare, may object to court members, may be represented as permitted, may present evidence and witnesses, and may appeal adverse judgment.",
        "refs": [
          "BCO 32",
          "BCO 42"
        ],
        "summary": "Notice, preparation, objections, representation, evidence, appeal.",
        "tags": [
          "process",
          "rights",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-102",
        "q": "What happens if an accused person refuses or neglects to appear?",
        "a": "After proper citation, the court may proceed according to the BCO; persistent refusal may itself affect the case and the court’s handling of discipline.",
        "refs": [
          "BCO 32-6",
          "BCO 32-7"
        ],
        "summary": "Proper citation matters; refusal does not necessarily stop process.",
        "tags": [
          "process",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-103",
        "q": "What standard applies to court members in judicial process?",
        "a": "Members should be impartial. Objections may be made to members, and the court must decide whether they should sit in the case.",
        "refs": [
          "BCO 32-14"
        ],
        "summary": "Judicial fairness includes opportunity to object to partial judges.",
        "tags": [
          "process",
          "court-members",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-104",
        "q": "What is process before a Session?",
        "a": "The Session has original jurisdiction over church members. Special rules apply for charges before Sessions and for Presbytery assuming jurisdiction if a Session cannot or will not act properly.",
        "refs": [
          "BCO 33-1",
          "BCO 33-2"
        ],
        "summary": "Session ordinarily tries members of the local church.",
        "tags": [
          "session",
          "process",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-105",
        "q": "Who has original jurisdiction over a teaching elder?",
        "a": "The Presbytery of which the minister is a member, except where the BCO provides otherwise.",
        "refs": [
          "BCO 34-1"
        ],
        "summary": "Presbytery tries its ministers.",
        "tags": [
          "presbytery",
          "process",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-106",
        "q": "How may a minister be suspended during process?",
        "a": "Presbytery may place restrictions on a minister when charges or circumstances require it, following BCO provisions for protection of the church and due process.",
        "refs": [
          "BCO 34"
        ],
        "summary": "Ministerial process belongs to Presbytery and may include temporary restrictions.",
        "tags": [
          "minister",
          "process",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-107",
        "q": "What kinds of evidence may be used?",
        "a": "Witness testimony, records, documents, and other admissible evidence under the Rules of Discipline; evidence must be relevant and handled with fairness.",
        "refs": [
          "BCO 35"
        ],
        "summary": "Evidence must be competent, relevant, and fairly received.",
        "tags": [
          "evidence",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-108",
        "q": "How many witnesses are required to establish a charge?",
        "a": "More than one witness is necessary, though one witness plus corroborating evidence may establish an offense.",
        "refs": [
          "BCO 35-3"
        ],
        "summary": "More than one witness, or one plus corroboration.",
        "tags": [
          "evidence",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-109",
        "q": "What testimony rules protect conscience and truth?",
        "a": "Witnesses are examined under solemn duty to tell the truth, may be cross-examined, and testimony should be recorded as the court requires.",
        "refs": [
          "BCO 35"
        ],
        "summary": "Witnesses testify solemnly and may be examined and cross-examined.",
        "tags": [
          "evidence",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-110",
        "q": "How should censures be inflicted?",
        "a": "With prayer, tenderness, solemnity, and a clear statement of the offense and censure, suited to the nature of the offense and the spiritual good of the offender.",
        "refs": [
          "BCO 36"
        ],
        "summary": "Censures should be solemn, tender, and restorative.",
        "tags": [
          "censures",
          "pastoral",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-111",
        "q": "How may censure be removed?",
        "a": "Upon repentance and satisfactory evidence of it, the court that imposed or currently has jurisdiction may remove censure and restore privileges or office as the BCO allows.",
        "refs": [
          "BCO 37"
        ],
        "summary": "Repentance and court action remove censure.",
        "tags": [
          "restoration",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-112",
        "q": "What are cases without process?",
        "a": "Non-judicial cases such as requests for dismissal, erasure, divestiture without censure, demission, or other matters handled without formal trial when guilt is not being adjudicated.",
        "refs": [
          "BCO 38"
        ],
        "summary": "Some actions affect status without a trial or censure.",
        "tags": [
          "cases-without-process",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-113",
        "q": "What is divestiture without censure?",
        "a": "Removal from office without disciplinary censure, used when a man is no longer qualified or able to serve though not being punished for an offense.",
        "refs": [
          "BCO 38-2",
          "BCO 38-3"
        ],
        "summary": "Office may be removed without censure in non-punitive cases.",
        "tags": [
          "office",
          "cases-without-process",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-114",
        "q": "What is erasure or removal from roll?",
        "a": "A Session may remove names from the roll in specified cases such as prolonged absence or failure to transfer membership, following BCO procedures.",
        "refs": [
          "BCO 38-4",
          "BCO 46-2"
        ],
        "summary": "Some roll removals occur without judicial process.",
        "tags": [
          "membership",
          "cases-without-process",
          "paraphrase"
        ]
      }
    ]
  },
  "bco-comp-review": {
    "label": "BCO Review, Appeals, Complaints & Jurisdiction",
    "subject": "bco",
    "order": 12,
    "cards": [
      {
        "id": "bco-comp-115",
        "q": "What are the main ways lower-court proceedings come before higher courts?",
        "a": "General review and control, references, appeals, complaints, and certain jurisdictional proceedings.",
        "refs": [
          "BCO 39"
        ],
        "summary": "Records, reference, appeal, complaint, jurisdiction.",
        "tags": [
          "higher-courts",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-116",
        "q": "What is general review and control?",
        "a": "A higher court’s ordinary review of the records and proceedings of the lower court next below it, to ensure accurate recording, constitutional regularity, wisdom, equity, and obedience to lawful injunctions.",
        "refs": [
          "BCO 40-1",
          "BCO 40-2"
        ],
        "summary": "Annual record review protects order connectionally.",
        "tags": [
          "review-control",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-117",
        "q": "What may a higher court do if it finds error in lower-court records?",
        "a": "It may note exceptions, require correction, issue injunctions, or use BCO procedures to redress actions contrary to order.",
        "refs": [
          "BCO 40"
        ],
        "summary": "Review can lead to exceptions, corrections, and redress.",
        "tags": [
          "review-control",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-118",
        "q": "What is a reference?",
        "a": "A written request by a lower court to a higher court for advice or other action on a matter pending before the lower court.",
        "refs": [
          "BCO 41-1"
        ],
        "summary": "Reference = lower court asks higher court for advice/action.",
        "tags": [
          "reference",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-119",
        "q": "When is a reference appropriate?",
        "a": "When a lower court needs guidance because of novelty, difficulty, constitutional importance, or consequences beyond its own sphere.",
        "refs": [
          "BCO 41"
        ],
        "summary": "References seek guidance before final disposition.",
        "tags": [
          "reference",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-120",
        "q": "What is an appeal?",
        "a": "The transfer of a judicial case to a higher court after judgment, available to the party against whom the decision was rendered.",
        "refs": [
          "BCO 42-1"
        ],
        "summary": "Appeal = judicial case carried up after judgment.",
        "tags": [
          "appeal",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-121",
        "q": "What are common grounds of appeal?",
        "a": "Irregularity in proceedings, refusal of reasonable indulgence, receiving improper evidence or rejecting proper evidence, hurrying to decision before all testimony, manifest injustice, or mistake/error in judgment.",
        "refs": [
          "BCO 42-3"
        ],
        "summary": "Appeal grounds challenge procedure, evidence, haste, injustice, or error.",
        "tags": [
          "appeal",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-122",
        "q": "How quickly must notice of appeal be filed?",
        "a": "Written notice with supporting reasons must be filed with both lower and higher court clerks within thirty days after the meeting of the court.",
        "refs": [
          "BCO 42-4"
        ],
        "summary": "Appeal deadline: 30 days.",
        "tags": [
          "appeal",
          "deadlines",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-123",
        "q": "What can the higher court do on appeal?",
        "a": "Affirm, reverse, render the decision that should have been rendered, or remand for a new trial.",
        "refs": [
          "BCO 42-9"
        ],
        "summary": "Affirm, reverse, render, or remand.",
        "tags": [
          "appeal",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-124",
        "q": "What is a complaint?",
        "a": "A written representation against some act or decision of a church court, available to a communing member in good standing subject to that court, except as limited by judicial-process rules.",
        "refs": [
          "BCO 43-1"
        ],
        "summary": "Complaint = challenge to a court action or decision.",
        "tags": [
          "complaint",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-125",
        "q": "How quickly must a complaint be filed?",
        "a": "Written notice with supporting reasons must be filed with the clerk of the court complained against within thirty days after the meeting of that court.",
        "refs": [
          "BCO 43-2"
        ],
        "summary": "Complaint deadline: 30 days.",
        "tags": [
          "complaint",
          "deadlines",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-126",
        "q": "How does complaint differ from appeal?",
        "a": "Appeal belongs to a party in a judicial case after judgment. Complaint challenges a court’s act or decision outside an appealable judicial judgment, subject to BCO limits.",
        "refs": [
          "BCO 42-1",
          "BCO 43-1"
        ],
        "summary": "Appeal = judicial party after judgment; complaint = court act/decision.",
        "tags": [
          "appeal",
          "complaint",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-127",
        "q": "What are dissents, protests, and objections?",
        "a": "Ways members of a court record disagreement or objection to an action.\n- **Dissent** records disagreement.\n- **Protest** records disagreement with reasons.\n- **Objection** may be entered to preserve a procedural or substantive objection.",
        "refs": [
          "BCO 45"
        ],
        "summary": "Dissent/protest/objection preserve disagreement in the record.",
        "tags": [
          "courts",
          "dissent",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-128",
        "q": "What does BCO jurisdiction cover after someone is dismissed to another church?",
        "a": "A dismissed member remains under the jurisdiction of the dismissing Session until he forms a regular connection with the receiving church.",
        "refs": [
          "BCO 46-3"
        ],
        "summary": "Jurisdiction continues until the transfer is completed.",
        "tags": [
          "jurisdiction",
          "membership",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-129",
        "q": "What is an associate member?",
        "a": "A believer temporarily residing away from his permanent home who joins a PCA church without ceasing to be a communicant member of the home church; he has privileges except voting and holding office there.",
        "refs": [
          "BCO 46-4"
        ],
        "summary": "Temporary member with privileges except vote/office.",
        "tags": [
          "membership",
          "jurisdiction",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-130",
        "q": "How long is a certificate of dismission valid as testimony of good standing?",
        "a": "Not longer than one year unless earlier presentation is hindered by providential cause; it testifies only to the person’s standing when leaving the bounds.",
        "refs": [
          "BCO 46-7"
        ],
        "summary": "Dismissal certificates generally expire after one year.",
        "tags": [
          "jurisdiction",
          "membership",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-131",
        "q": "What happens when Presbytery dismisses a minister, licentiate, or candidate?",
        "a": "The certificate names the receiving Presbytery, and the person remains under the dismissing Presbytery’s jurisdiction until received by the other.",
        "refs": [
          "BCO 46-6"
        ],
        "summary": "Presbytery jurisdiction continues until reception.",
        "tags": [
          "jurisdiction",
          "presbytery",
          "paraphrase"
        ]
      }
    ]
  },
  "bco-comp-worship-principles": {
    "label": "BCO Directory for Worship: Principles, Lord’s Day & Ordinary Worship",
    "subject": "bco",
    "order": 13,
    "cards": [
      {
        "id": "bco-comp-132",
        "q": "What is the constitutional status of the Directory for Worship?",
        "a": "The Directory is an approved guide to be taken seriously as the mind of the church, but not obligatory in all parts. BCO 56, 57, 58, and 59-3 have full constitutional authority.",
        "refs": [
          "BCO Directory for Worship Preface"
        ],
        "summary": "Directory is a serious guide; 56, 57, 58, and 59-3 are constitutional.",
        "tags": [
          "worship",
          "directory",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-133",
        "q": "What is the source of the principles of public worship?",
        "a": "The Holy Scriptures, the only infallible rule of faith and practice. Worship principles must be derived from the Bible.",
        "refs": [
          "BCO 47-1"
        ],
        "summary": "Worship is governed by Scripture.",
        "tags": [
          "worship",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-134",
        "q": "What are the ordinary elements of public worship?",
        "a": "Prayer, praise, reading Scripture, preaching the Word, sacraments, offerings, confession of faith, fasting/thanksgiving when appointed, and related ordinances under Session oversight.",
        "refs": [
          "BCO 47",
          "BCO 4-4"
        ],
        "summary": "Word, prayer, praise, sacraments, offerings, confession, and appointed occasions.",
        "tags": [
          "worship",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-135",
        "q": "Who has oversight of the time, place, music, and order of worship in a local church?",
        "a": "The Session exercises authority over worship services, the preaching and sacraments, church music, and use of church property.",
        "refs": [
          "BCO 12-5.e",
          "BCO 47"
        ],
        "summary": "The Session oversees local worship.",
        "tags": [
          "worship",
          "session",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-136",
        "q": "How does BCO 48 describe the Lord’s Day?",
        "a": "The Lord’s Day is to be sanctified by public and private worship, works of necessity and mercy, and resting from worldly employments and recreations inconsistent with holy worship.",
        "refs": [
          "BCO 48"
        ],
        "summary": "Lord’s Day: worship, rest, necessity, mercy.",
        "tags": [
          "lord-day",
          "worship",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-137",
        "q": "What general principle governs the ordering of public worship?",
        "a": "Worship should be ordered according to Scripture, for edification, reverence, understanding, and active congregational participation.",
        "refs": [
          "BCO 49"
        ],
        "summary": "Order serves Scriptural worship and edification.",
        "tags": [
          "worship",
          "order",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-138",
        "q": "Who may read Scripture publicly in worship?",
        "a": "The public reading of Scripture is a worship element under church oversight; ordinarily it should be done by those appointed by the Session in good order.",
        "refs": [
          "BCO 50",
          "BCO 12-5.e"
        ],
        "summary": "Scripture reading is an appointed element under Session oversight.",
        "tags": [
          "scripture-reading",
          "worship",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-139",
        "q": "What does the BCO teach about singing?",
        "a": "The congregation should sing psalms and hymns with understanding, reverence, and grace in the heart; the Session oversees the singing in public worship.",
        "refs": [
          "BCO 51",
          "BCO 12-5.e"
        ],
        "summary": "Congregational singing is under Session oversight and should edify.",
        "tags": [
          "singing",
          "worship",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-140",
        "q": "What should public prayer include?",
        "a": "Adoration, confession, thanksgiving, supplication, intercession, and petitions suited to the needs of the church and world, offered through Christ with reverence and faith.",
        "refs": [
          "BCO 52"
        ],
        "summary": "Public prayer includes praise, confession, thanks, petitions, and intercession.",
        "tags": [
          "prayer",
          "worship",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-141",
        "q": "What is the place of preaching in worship?",
        "a": "Preaching is a chief means of grace. The preacher should explain and apply Scripture faithfully, plainly, and pastorally for conversion and edification.",
        "refs": [
          "BCO 53"
        ],
        "summary": "Preaching explains and applies Scripture for conversion and edification.",
        "tags": [
          "preaching",
          "worship",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-142",
        "q": "Who may preach in PCA worship?",
        "a": "The Session must ensure the Word is preached only by men sufficiently qualified under the BCO and Scripture.",
        "refs": [
          "BCO 12-5.e",
          "BCO 53-2"
        ],
        "summary": "Session guards the pulpit.",
        "tags": [
          "preaching",
          "session",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-143",
        "q": "How should offerings be understood in worship?",
        "a": "Offerings are acts of worship and mercy, given for the church’s work, relief of the poor, and other pious uses, not merely administrative fundraising.",
        "refs": [
          "BCO 54",
          "BCO 4-4"
        ],
        "summary": "Offerings are worship and service.",
        "tags": [
          "offerings",
          "worship",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-144",
        "q": "Why does BCO include confessing the faith in worship?",
        "a": "Public confession of the church’s faith strengthens unity, teaches doctrine, and lets the congregation jointly profess the truth it believes.",
        "refs": [
          "BCO 55"
        ],
        "summary": "Confession of faith publicly teaches and unites the church.",
        "tags": [
          "confession",
          "worship",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-145",
        "q": "What principle should govern worship forms not specifically prescribed?",
        "a": "Circumstances of worship should be ordered by Christian prudence according to the general rules of the Word, always serving reverence, edification, and decency.",
        "refs": [
          "BCO 47",
          "WCF 1.6"
        ],
        "summary": "Circumstances must serve Scriptural worship, not human invention.",
        "tags": [
          "worship",
          "circumstances",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-146",
        "q": "What pastoral mistake should be avoided in studying the Directory for Worship?",
        "a": "Treating it either as optional fluff or as mechanical rubrics. It is a serious guide to wise Presbyterian worship; some chapters have full constitutional force.",
        "refs": [
          "BCO Directory for Worship Preface"
        ],
        "summary": "Take the Directory seriously, while noting its constitutional distinctions.",
        "tags": [
          "worship",
          "directory",
          "paraphrase"
        ]
      }
    ]
  },
  "bco-comp-sacraments-pastoral": {
    "label": "BCO Directory for Worship: Sacraments, Marriage & Pastoral Offices",
    "subject": "bco",
    "order": 14,
    "cards": [
      {
        "id": "bco-comp-147",
        "q": "Who may administer Baptism?",
        "a": "A minister of the Word lawfully called to administer the sacraments; Baptism is administered under church authority, ordinarily in the presence of the congregation.",
        "refs": [
          "BCO 56",
          "BCO 8-5"
        ],
        "summary": "Teaching elders administer sacraments.",
        "tags": [
          "baptism",
          "sacraments",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-148",
        "q": "Who should receive Baptism?",
        "a": "Believers not previously baptized, and the infant children of one or both believing parents, according to the covenant promise and PCA doctrine.",
        "refs": [
          "BCO 56",
          "BCO 6-1"
        ],
        "summary": "Baptize professing believers and covenant children.",
        "tags": [
          "baptism",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-149",
        "q": "What questions are asked of parents at an infant Baptism?",
        "a": "In paraphrase: they acknowledge the child’s need of Christ, claim God’s covenant promises, dedicate the child to God, and promise to raise the child in the nurture and admonition of the Lord.",
        "refs": [
          "BCO 56-5"
        ],
        "summary": "Parents profess covenant faith and promise Christian nurture.",
        "tags": [
          "baptism",
          "vows",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-150",
        "q": "What vow does the congregation make at an infant Baptism?",
        "a": "The congregation promises to assist the parents in the Christian nurture of the child.",
        "refs": [
          "BCO 56-5"
        ],
        "summary": "The church shares responsibility for covenant nurture.",
        "tags": [
          "baptism",
          "congregation",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-151",
        "q": "How are persons admitted to sealing ordinances?",
        "a": "By Session examination and admission. Those received into communicant membership make profession of faith and take membership vows before being admitted to the Lord’s Table.",
        "refs": [
          "BCO 57"
        ],
        "summary": "Session admits persons to the sacraments.",
        "tags": [
          "membership",
          "sacraments",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-152",
        "q": "Summarize the five membership vows.",
        "a": "The person acknowledges sin and need of God’s mercy, trusts Christ alone for salvation, resolves by the Spirit to live as a follower of Christ, promises to support the church’s worship and work, and submits to church government and discipline while seeking purity and peace.",
        "refs": [
          "BCO 57-5"
        ],
        "summary": "Sin, Christ, obedience, support, submission/purity/peace.",
        "tags": [
          "membership",
          "vows",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-153",
        "q": "How may members be received?",
        "a": "By profession of faith, reaffirmation of faith, letter of transfer, or other proper Session action according to the person’s baptism and church-standing situation.",
        "refs": [
          "BCO 57"
        ],
        "summary": "Profession, reaffirmation, transfer, and related Session actions.",
        "tags": [
          "membership",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-154",
        "q": "Who should be admitted to the Lord’s Supper?",
        "a": "The ignorant and scandalous are not to be admitted. At the Session’s discretion, the minister may invite either communicants in good standing in evangelical churches who profess the true religion, or those approved by the Session.",
        "refs": [
          "BCO 58",
          "BCO 6-2",
          "BCO 6-4"
        ],
        "summary": "Not the ignorant or scandalous; Session governs the invitation practice.",
        "tags": [
          "lord-supper",
          "membership",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-155",
        "q": "What warnings should attend the Lord’s Supper?",
        "a": "The minister should fence the Table: inviting worthy communicants, warning the ignorant, scandalous, and impenitent not to partake, and directing all to self-examination and faith in Christ.",
        "refs": [
          "BCO 58"
        ],
        "summary": "Fence the Table with invitation, warning, and gospel direction.",
        "tags": [
          "lord-supper",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-156",
        "q": "What does the BCO say about frequency of the Lord’s Supper?",
        "a": "The Session determines frequency, but the sacrament should be administered often enough to serve the congregation’s edification and the church’s doctrine of the means of grace.",
        "refs": [
          "BCO 58",
          "BCO 12-5.e"
        ],
        "summary": "Session determines frequency for edification.",
        "tags": [
          "lord-supper",
          "session",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-157",
        "q": "What is marriage according to BCO 59-3?",
        "a": "Marriage is between one man and one woman, and this provision has full constitutional authority in the PCA.",
        "refs": [
          "BCO 59-3",
          "BCO Directory for Worship Preface"
        ],
        "summary": "BCO 59-3 constitutionally defines marriage as man and woman.",
        "tags": [
          "marriage",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-158",
        "q": "What pastoral cautions govern solemnizing marriage?",
        "a": "The minister should ensure the couple may lawfully marry, instruct them in the nature and duties of marriage, and avoid participating in unions contrary to Scripture and the PCA Constitution.",
        "refs": [
          "BCO 59"
        ],
        "summary": "Marriage requires lawful eligibility and biblical instruction.",
        "tags": [
          "marriage",
          "pastoral",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-159",
        "q": "What is the aim of visitation of the sick?",
        "a": "Pastoral comfort, prayer, Scripture, spiritual counsel, and preparation for suffering or death in faith, repentance, and hope in Christ.",
        "refs": [
          "BCO 60"
        ],
        "summary": "Visit the sick with Word, prayer, comfort, counsel, and hope.",
        "tags": [
          "pastoral-care",
          "sick",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-160",
        "q": "How should the burial of the dead be conducted?",
        "a": "With simplicity, dignity, Scripture, prayer, and Christian hope, avoiding superstition and directing mourners to the resurrection and judgment.",
        "refs": [
          "BCO 61"
        ],
        "summary": "Christian burial is sober, hopeful, and Word-centered.",
        "tags": [
          "burial",
          "pastoral-care",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-161",
        "q": "What are days of fasting and thanksgiving?",
        "a": "Special occasions appointed for solemn humiliation, prayer, and repentance, or for grateful acknowledgment of God’s mercies.",
        "refs": [
          "BCO 62"
        ],
        "summary": "Fasting humbles; thanksgiving gratefully acknowledges mercies.",
        "tags": [
          "fasting",
          "thanksgiving",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-162",
        "q": "Who may appoint days of fasting or thanksgiving?",
        "a": "Church courts may appoint them for their own bounds; civil authorities may appoint public occasions, but the church observes them as acts of religious worship under God.",
        "refs": [
          "BCO 62"
        ],
        "summary": "Courts may appoint church occasions; civil occasions are observed religiously under God.",
        "tags": [
          "fasting",
          "thanksgiving",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-163",
        "q": "What does the BCO teach about Christian life in the home?",
        "a": "The home is a primary sphere of discipleship: worship, instruction, catechizing, prayer, discipline, and godly example should nurture covenant children and households in the faith.",
        "refs": [
          "BCO 63",
          "BCO 28"
        ],
        "summary": "Home discipleship is essential to church discipline and nurture.",
        "tags": [
          "home",
          "discipleship",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-164",
        "q": "Why are BCO 56-58 especially important for ordination study?",
        "a": "They have full constitutional authority and govern Baptism, admission to sealing ordinances, and the Lord’s Supper; candidates should know both the doctrine and the procedural details.",
        "refs": [
          "BCO Directory for Worship Preface",
          "BCO 56",
          "BCO 57",
          "BCO 58"
        ],
        "summary": "Baptism, admission, and the Supper are constitutionally binding chapters.",
        "tags": [
          "sacraments",
          "ordination-study",
          "paraphrase"
        ]
      },
      {
        "id": "bco-comp-165",
        "q": "How do BCO 56-58 connect membership and sacraments?",
        "a": "Baptism marks covenant membership, Session examination admits professing believers to communicant privileges, and the Lord’s Supper is administered to those admitted and not barred by discipline.",
        "refs": [
          "BCO 56",
          "BCO 57",
          "BCO 58",
          "BCO 6"
        ],
        "summary": "Baptism, profession, Session admission, and discipline structure sacramental access.",
        "tags": [
          "sacraments",
          "membership",
          "paraphrase"
        ]
      }
    ]
  }
};

  const data = global.PCA_DATA || (global.PCA_DATA = { subjects: [], sets: {} });
  Object.assign(data.sets, SETS);
  const keys = Object.keys(SETS);
  let subject = data.subjects.find((s) => s.id === 'bco');
  if (!subject) {
    subject = {
      id: 'bco',
      label: 'Book of Church Order',
      blurb: 'PCA government, discipline, and worship polity.',
      order: 2,
      setKeys: []
    };
    data.subjects.push(subject);
  }
  subject.setKeys = Array.from(new Set([...(subject.setKeys || []), ...keys]));
})(typeof globalThis !== 'undefined' ? globalThis : window);
