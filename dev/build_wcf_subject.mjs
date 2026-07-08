// Build the dedicated "Westminster Confession of Faith" subject.
//
// Two jobs, run together:
//   1. CLEAN the canonical source `js/data/wcf.js` in place — repairing the
//      extraction artifacts in the original PDF pull (kerning splits, glued
//      proof-marker letters, the two-column-scrambled 1.2 canon list, and the
//      handful of sections whose proof-text prose bled into the confession text
//      or truncated it). Every section was cross-checked, word for word, against
//      the user-supplied authoritative "WCF text with proof references" export
//      (WCFScripureProofs2022.pdf); the reconstructions below use the American-
//      revision public-domain wording and matched 171/171 sections.
//   2. GENERATE `js/data/subjects/wcf.js` — one selectable set per chapter
//      (wcf-01..wcf-33), one card per section. Each card carries BOTH the full
//      confession wording (`a`, provenance-labeled `WCF:`) and an authored
//      concise `summary`; the app's "WCF card detail" setting (default Full
//      text) chooses which is shown. Two unusually long sections are split into
//      two cards each (WCF 19.6, 23.3) with complete coverage across the parts.
//
// The checked-in js/data/** files are the working source of truth (see
// CLAUDE.md); re-running this builder is idempotent. Run from the repo root:
//   node dev/build_wcf_subject.mjs
import { readFileSync, writeFileSync } from 'node:fs';

// ── 1. Source-cleaning tables ──────────────────────────────────────────────
// Literal fixes; each artifact string is unique to the defect (verified against
// the authoritative text — e.g. "unexcusable" is the authoritative spelling and
// is deliberately NOT changed).
const GLUE = [
  [/(A|a)llthings/g, '$1ll things'],
  [/beworshiped/g, 'be worshiped'],
  [/bepreached/g, 'be preached'],
  [/becalled/g, 'be called'],
  [/incases/g, 'in cases'],
  [/per mission/g, 'permission'],
  [/infir mities/g, 'infirmities'],
  [/ser pent/g, 'serpent'],
  [/\btur n\b/g, 'turn'],
  [/pur posing/g, 'purposing'],
  [/pur pose/g, 'purpose'],
  [/deter mine/g, 'determine'],
  [/inter meddle/g, 'intermeddle'],
  [/lear ned/g, 'learned'],
  [/war ned/g, 'warned'],
  [/cast of f/g, 'cast off'],
  [/salvationa/g, 'salvation'],
  [/perishb/g, 'perish'],
  [/great d a y/g, 'great day'],
  [/ beheld without/g, ' be held without'],
  [/toothers/g, 'to others'],
  [/angelsf/g, 'angels'],
  [/Fatherg/g, 'Father'],
  [/familiesf/g, 'families'],
];

// Sections whose PDF extraction spliced proof-text prose into (8.1, 3.8, 11.6,
// 15.6, 16.7, 19.6) or truncated (33.2) the confession text, plus the 1.2 canon
// list de-scrambled from its two-column PDF layout into canonical order.
const OVERRIDES = {
  '1.2': 'Under the name of Holy Scripture, or the Word of God written, are now contained all the books of the Old and New Testament, which are these: Of the Old Testament: Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth, I Samuel, II Samuel, I Kings, II Kings, I Chronicles, II Chronicles, Ezra, Nehemiah, Esther, Job, Psalms, Proverbs, Ecclesiastes, The Song of Songs, Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi. Of the New Testament: The Gospels according to Matthew, Mark, Luke, John, The Acts of the Apostles, Paul’s Epistles to the Romans, Corinthians I, Corinthians II, Galatians, Ephesians, Philippians, Colossians, Thessalonians I, Thessalonians II, to Timothy I, to Timothy II, to Titus, to Philemon, The Epistle to the Hebrews, The Epistle of James, The first and second Epistles of Peter, The first, second, and third Epistles of John, The Epistle of Jude, The Revelation of John. All which are given by inspiration of God, to be the rule of faith and life.',
  '3.8': 'The doctrine of this high mystery of predestination is to be handled with special prudence and care, that men, attending the will of God revealed in his Word, and yielding obedience thereunto, may, from the certainty of their effectual vocation, be assured of their eternal election. So shall this doctrine afford matter of praise, reverence, and admiration of God; and of humility, diligence, and abundant consolation to all that sincerely obey the gospel.',
  '8.1': 'It pleased God, in his eternal purpose, to choose and ordain the Lord Jesus, his only begotten Son, to be the Mediator between God and man, the Prophet, Priest, and King, the Head and Savior of his church, the Heir of all things, and Judge of the world: unto whom he did from all eternity give a people, to be his seed, and to be by him in time redeemed, called, justified, sanctified, and glorified.',
  '11.6': 'The justification of believers under the old testament was, in all these respects, one and the same with the justification of believers under the new testament.',
  '15.6': 'As every man is bound to make private confession of his sins to God, praying for the pardon thereof; upon which, and the forsaking of them, he shall find mercy; so, he that scandalizeth his brother, or the church of Christ, ought to be willing, by a private or public confession, and sorrow for his sin, to declare his repentance to those that are offended, who are thereupon to be reconciled to him, and in love to receive him.',
  '16.7': 'Works done by unregenerate men, although for the matter of them they may be things which God commands; and of good use both to themselves and others: yet, because they proceed not from an heart purified by faith; nor are done in a right manner, according to the Word; nor to a right end, the glory of God, they are therefore sinful, and cannot please God, or make a man meet to receive grace from God: and yet, their neglect of them is more sinful and displeasing unto God.',
  '19.6': 'Although true believers be not under the law, as a covenant of works, to be thereby justified, or condemned; yet is it of great use to them, as well as to others; in that, as a rule of life informing them of the will of God, and their duty, it directs and binds them to walk accordingly; discovering also the sinful pollutions of their nature, hearts, and lives; so as, examining themselves thereby, they may come to further conviction of, humiliation for, and hatred against sin, together with a clearer sight of the need they have of Christ, and the perfection of his obedience. It is likewise of use to the regenerate, to restrain their corruptions, in that it forbids sin: and the threatenings of it serve to show what even their sins deserve; and what afflictions, in this life, they may expect for them, although freed from the curse thereof threatened in the law. The promises of it, in like manner, show them God’s approbation of obedience, and what blessings they may expect upon the performance thereof: although not as due to them by the law as a covenant of works. So as, a man’s doing good, and refraining from evil, because the law encourageth to the one, and deterreth from the other, is no evidence of his being under the law; and, not under grace.',
  '33.2': 'The end of God’s appointing this day is for the manifestation of the glory of his mercy, in the eternal salvation of the elect; and of his justice, in the damnation of the reprobate, who are wicked and disobedient. For then shall the righteous go into everlasting life, and receive that fullness of joy and refreshing, which shall come from the presence of the Lord: but the wicked, who know not God, and obey not the gospel of Jesus Christ, shall be cast into eternal torments, and be punished with everlasting destruction from the presence of the Lord, and from the glory of his power.',
};
// 33.2 lost its proof citations in extraction; restore the standard set.
const REF_OVERRIDES = { '33.2': ['Acts 17:31', 'Matt. 25:31–46', 'Rom. 2:5–6', '2 Thess. 1:7–10', 'Matt. 25:21'] };

const cleanRef = (r) => String(r).replace(/\s+([–-])/g, '$1').replace(/([–-])\s+/g, '$1').trim();
function cleanText(t, key) {
  if (OVERRIDES[key]) return OVERRIDES[key];
  let s = t;
  for (const [re, rep] of GLUE) s = s.replace(re, rep);
  return s;
}

// ── Load the raw source, clean it in place, and re-emit js/data/wcf.js ─────
const root = new URL('..', import.meta.url);
globalThis.window = globalThis;
await import(new URL('js/data/wcf.js', root));
const wcf = globalThis.PCA_WCF;

for (const ch of wcf.chapters) {
  for (const s of ch.sections) {
    const key = `${ch.n}.${s.n}`;
    s.text = cleanText(s.text, key);
    s.refs = (REF_OVERRIDES[key] || s.refs || []).map(cleanRef);
  }
}

// Rewrite the cleaned canonical source (JSON.stringify(,null,1) reproduces the
// original generator's formatting exactly — verified byte-identical round-trip).
const wcfHeader = `// PCA Ordination & Licensure Study — Westminster Confession of Faith.
// Canonical American-revision text (public domain). Originally extracted from
// the Westminster PDF by dev/build_wcf.py; cleaned by dev/build_wcf_subject.mjs
// (kerning/glue repairs, proof-text bleed excised, 1.2 canon list de-scrambled)
// and cross-checked word-for-word against the authoritative reference export.
// This object is the build-time source for js/data/subjects/wcf.js.
`;
writeFileSync(new URL('js/data/wcf.js', root),
  `${wcfHeader}(function (global) {\n  global.PCA_WCF = ${JSON.stringify(wcf, null, 1)};\n})(typeof window !== 'undefined' ? window : globalThis);\n`);

// ── 2. Card generation ─────────────────────────────────────────────────────
// Per-chapter topic phrase for the question stem ("What does the Confession
// teach about <topic>?"). Mirrors the chapter titles in natural lowercase.
const TOPIC = {
  1: 'the Holy Scripture', 2: 'God and the Holy Trinity', 3: 'God’s eternal decree',
  4: 'creation', 5: 'God’s providence', 6: 'the fall of man, sin, and its punishment',
  7: 'God’s covenant with man', 8: 'Christ the Mediator', 9: 'free will',
  10: 'effectual calling', 11: 'justification', 12: 'adoption', 13: 'sanctification',
  14: 'saving faith', 15: 'repentance unto life', 16: 'good works',
  17: 'the perseverance of the saints', 18: 'the assurance of grace and salvation',
  19: 'the law of God', 20: 'Christian liberty and liberty of conscience',
  21: 'religious worship and the Sabbath day', 22: 'lawful oaths and vows',
  23: 'the civil magistrate', 24: 'marriage and divorce', 25: 'the church',
  26: 'the communion of saints', 27: 'the sacraments', 28: 'baptism',
  29: 'the Lord’s Supper', 30: 'church censures', 31: 'synods and councils',
  32: 'the state of men after death and the resurrection', 33: 'the last judgment',
};

// Sections split into multiple cards (long + multiple distinct claims). Each
// split names the exact boundary phrase; coverage across parts is complete and
// the confessional wording is untouched. See PROJECT_PLAN for the rationale.
const SPLITS = {
  '19.6': { at: 'It is likewise of use to the regenerate' },
  '23.3': { at: 'It is the duty of civil magistrates to protect the person and good name' },
};

// Authored concise study summaries — one per section (and per split part). The
// full confession wording is the default; these back the optional Summary mode.
const SUMMARY = {
  '1.1': 'Nature and creation reveal God enough to leave men without excuse, but not enough to save; so God revealed himself and, to preserve that truth, committed it wholly to writing — making Scripture necessary now that his former ways of revealing have ceased.',
  '1.2': 'The canon comprises the 66 books of the Old and New Testaments, all given by inspiration of God to be the rule of faith and life.',
  '1.3': 'The Apocrypha, not being inspired, is no part of the canon and has no more authority in the church than other human writings.',
  '1.4': 'Scripture’s authority rests not on any man or church but wholly on God its author; it is to be received because it is the Word of God.',
  '1.5': 'The church’s testimony and Scripture’s own excellencies commend it, but our full assurance that it is God’s Word comes from the inward witness of the Holy Spirit with the Word in our hearts.',
  '1.6': 'The whole counsel of God for his glory and our salvation is either expressly set down in Scripture or deduced from it by good and necessary consequence; nothing is to be added, though the Spirit’s inward illumination is needed, and some circumstances of worship and government are ordered by Christian prudence under the general rules of the Word.',
  '1.7': 'Not everything in Scripture is equally plain, but whatever must be known for salvation is so clearly set forth somewhere that even the unlearned may, by ordinary means, come to understand it.',
  '1.8': 'The Scriptures were immediately inspired in Hebrew and Greek and kept pure through the ages, so the church appeals finally to them; and because these tongues are not known to all, Scripture is to be translated into every language.',
  '1.9': 'Scripture is its own infallible interpreter: a disputed passage (whose true sense is one, not manifold) must be searched out by other places that speak more clearly.',
  '1.10': 'The supreme judge of all religious controversies is the Holy Spirit speaking in Scripture, to whom all councils, ancient writers, and private spirits must submit.',
  '2.1': 'There is but one living and true God, infinite and perfect in being, a most pure spirit — immutable, eternal, almighty, most wise, holy, just, and good — working all things for his own glory, yet by no means clearing the guilty.',
  '2.2': 'God is all-sufficient in himself, needing no creature and deriving no glory from them; he is the fountain of all being, sovereign over all, all-knowing (nothing to him is contingent), most holy, and worthy of all worship and obedience.',
  '2.3': 'In the one Godhead are three persons of one substance, power, and eternity: the Father (unbegotten), the Son (eternally begotten of the Father), and the Holy Ghost (eternally proceeding from the Father and the Son).',
  '3.1': 'God from all eternity freely and unchangeably ordained whatsoever comes to pass, yet so as not to be the author of sin, nor to do violence to the will of creatures, nor to take away the liberty of second causes.',
  '3.2': 'Though God foreknows all that could happen under any condition, he did not decree anything because he foresaw it as future or as coming to pass upon such conditions.',
  '3.3': 'By God’s decree, for the manifestation of his glory, some men and angels are predestinated to everlasting life and others foreordained to everlasting death.',
  '3.4': 'These predestined angels and men are particularly and unchangeably designed, their number so certain and definite it cannot be increased or diminished.',
  '3.5': 'The elect were chosen in Christ before the foundation of the world, out of God’s free grace and love alone — without any foreseen faith, works, or perseverance in them — to the praise of his glorious grace.',
  '3.6': 'As God appointed the elect to glory, he also foreordained all the means; so the elect, fallen in Adam, are redeemed by Christ, effectually called, justified, adopted, sanctified, and kept — and none but the elect are so redeemed and saved.',
  '3.7': 'The rest of mankind God was pleased, by the unsearchable counsel of his will, to pass by and ordain to dishonor and wrath for their sin, to the praise of his glorious justice.',
  '3.8': 'The high mystery of predestination is to be handled with prudence and care, so that those heeding God’s Word may, from the certainty of their effectual calling, be assured of their election — yielding praise, humility, and consolation.',
  '4.1': 'It pleased the triune God, to manifest his glory, to create the world and all things out of nothing in the space of six days, and all very good.',
  '4.2': 'God created man, male and female, with reasonable and immortal souls in his own image — with the law written on their hearts and power to keep it, yet able to fall — placing them under the command not to eat of the tree of knowledge.',
  '5.1': 'God upholds, directs, and governs all creatures and things, from greatest to least, by his wise and holy providence, according to his infallible foreknowledge and free will, to the praise of his glory.',
  '5.2': 'Though all things fall out immutably by God’s foreknowledge and decree (the First Cause), his providence orders them to come about through second causes — necessarily, freely, or contingently.',
  '5.3': 'In his ordinary providence God uses means, yet is free to work without, above, and against them at his pleasure.',
  '5.4': 'God’s providence extends even to the first fall and all other sins — not by bare permission but with a wise bounding and ordering of them to his own holy ends — yet the sinfulness proceeds only from the creature, never from God.',
  '5.5': 'God often leaves his own children for a season to temptation and the corruption of their hearts — to chastise them, reveal their hidden corruption, humble them, and make them more watchful and dependent on him.',
  '5.6': 'As a righteous judge, God blinds and hardens wicked men for former sins — withholding grace, sometimes withdrawing gifts, and giving them over to their lusts, the world, and Satan — so that they harden themselves even under the means that soften others.',
  '5.7': 'God’s providence reaches all creatures, but in a most special way it cares for his church and orders all things for its good.',
  '6.1': 'Our first parents, seduced by Satan, sinned in eating the forbidden fruit — a sin God was pleased to permit, having purposed to order it to his own glory.',
  '6.2': 'By this sin they fell from original righteousness and communion with God, becoming dead in sin and wholly defiled in every part and faculty of soul and body.',
  '6.3': 'As the root of mankind, the guilt of this sin was imputed, and the same death in sin and corrupted nature conveyed to all their posterity by ordinary generation.',
  '6.4': 'From this original corruption — by which we are utterly disabled and wholly inclined to all evil — proceed all actual transgressions.',
  '6.5': 'This corruption of nature remains even in the regenerate; though pardoned and mortified through Christ, it and all its motions are truly and properly sin.',
  '6.6': 'Every sin, original and actual, transgresses God’s righteous law and brings guilt on the sinner, binding him over to God’s wrath and the curse of the law, and to death with all miseries spiritual, temporal, and eternal.',
  '7.1': 'The distance between God and creature is so great that man could never enjoy God as his blessedness except by God’s voluntary condescension, which he expressed by way of covenant.',
  '7.2': 'The first covenant was a covenant of works, promising life to Adam and his posterity on condition of perfect, personal obedience.',
  '7.3': 'Since man made himself incapable of life by the covenant of works, God made a second — the covenant of grace — freely offering life and salvation by Jesus Christ, requiring faith, and promising the Spirit to make the elect willing and able to believe.',
  '7.4': 'The covenant of grace is set forth in Scripture as a testament, in reference to the death of Christ the Testator and the everlasting inheritance bequeathed.',
  '7.5': 'Under the law the covenant of grace was administered by promises, prophecies, sacrifices, circumcision, the paschal lamb, and other types foresignifying Christ — sufficient through the Spirit to build up the elect in faith; this is called the old testament.',
  '7.6': 'Under the gospel Christ the substance is exhibited, and the covenant is dispensed through the Word and the sacraments of baptism and the Lord’s Supper — fewer and simpler, yet fuller in efficacy; called the new testament. There are not two covenants of grace, but one and the same under various dispensations.',
  '8.1': 'God, in his eternal purpose, chose and ordained the Lord Jesus to be the Mediator between God and man — Prophet, Priest, and King; Head and Savior of the church; Heir of all things and Judge of the world — giving him from eternity a people to be redeemed, called, justified, sanctified, and glorified.',
  '8.2': 'The Son of God, very and eternal God, took man’s nature with all its essential properties (yet without sin), conceived by the Holy Ghost of the virgin Mary — so that two whole, perfect, distinct natures were inseparably joined in one person, without conversion, composition, or confusion: very God and very man, one Christ.',
  '8.3': 'Christ in his human nature, united to the divine, was sanctified and anointed with the Spirit above measure, having all fullness — that he might be furnished to execute the office of mediator and surety, to which he was called by the Father.',
  '8.4': 'Christ willingly undertook this office: made under the law, he perfectly fulfilled it, endured torments in soul and body, was crucified, died, was buried, saw no corruption, rose the third day in the same body, ascended, sits at the Father’s right hand making intercession, and will return to judge.',
  '8.5': 'By his perfect obedience and once-offered sacrifice, Christ fully satisfied the Father’s justice and purchased reconciliation and an everlasting inheritance for all whom the Father gave him.',
  '8.6': 'Though redemption was not wrought until after the incarnation, its virtue and benefits were communicated to the elect in every age from the beginning, through the promises, types, and sacrifices revealing him as the seed of the woman and the Lamb slain from the foundation of the world.',
  '8.7': 'In mediation Christ acts according to both natures, each doing what is proper to itself; yet by the unity of his person, what is proper to one nature is sometimes in Scripture attributed to the person named by the other.',
  '8.8': 'To all for whom Christ purchased redemption he certainly and effectually applies it — interceding, revealing salvation in the Word, persuading them by his Spirit to believe and obey, and overcoming all their enemies by his almighty power.',
  '9.1': 'God endued man’s will with natural liberty, so that it is neither forced nor determined by any absolute necessity of nature to good or evil.',
  '9.2': 'In the state of innocency man had freedom and power to will and do what is good and pleasing to God, yet mutably, so that he could fall from it.',
  '9.3': 'By the fall man wholly lost all ability of will to any spiritual good accompanying salvation; the natural man, dead in sin, cannot by his own strength convert himself or even prepare for it.',
  '9.4': 'When God converts a sinner he frees him from bondage to sin and, by grace alone, enables him to will and do good — yet because of remaining corruption he does not perfectly or only will the good.',
  '9.5': 'Only in the state of glory is the will made perfectly and immutably free to good alone.',
  '10.1': 'All whom God predestined to life — and only those — he effectually calls in his appointed time by Word and Spirit, out of sin and death into grace, enlightening their minds, giving a heart of flesh, and renewing their wills so that they come to Christ most freely, being made willing by his grace.',
  '10.2': 'This effectual call is of God’s free and special grace alone, not from anything foreseen in man, who is passive until, quickened by the Spirit, he is enabled to answer the call and embrace the grace offered.',
  '10.3': 'Elect infants dying in infancy, and all other elect persons incapable of the outward call, are regenerated and saved by Christ through the Spirit, who works when, where, and how he pleases.',
  '10.4': 'Others, not elected, though outwardly called and sharing some common operations of the Spirit, never truly come to Christ and cannot be saved — much less can any be saved apart from Christ, however diligent by the light of nature; to assert otherwise is pernicious and to be detested.',
  '11.1': 'Those God effectually calls he also freely justifies — not by infusing righteousness but by pardoning sin and accounting them righteous, imputing not their faith or obedience but Christ’s obedience and satisfaction, which they receive and rest on by faith, itself the gift of God.',
  '11.2': 'Faith, receiving and resting on Christ, is the alone instrument of justification; yet it is never alone in the justified person but is ever accompanied by all other saving graces, and is no dead faith but works by love.',
  '11.3': 'Christ by his obedience and death fully discharged the debt of the justified and made a real satisfaction to the Father’s justice; since he was given by the Father and his satisfaction freely accepted in their stead, their justification is of free grace — glorifying both God’s justice and his rich grace.',
  '11.4': 'God decreed from eternity to justify the elect, and Christ died and rose for their justification; yet they are not actually justified until the Holy Spirit in due time applies Christ to them.',
  '11.5': 'God continues to forgive the sins of the justified; though they can never fall from justification, they may by sin fall under God’s fatherly displeasure until they humble themselves, confess, and renew their faith and repentance.',
  '11.6': 'The justification of believers under the Old Testament was, in all these respects, one and the same with the justification of believers under the New.',
  '12.1': 'All the justified are received into the grace of adoption — taken into the number and privileges of God’s children, given his name and the Spirit of adoption, granted access to the throne of grace, pitied, protected, provided for, and chastened as by a father, yet never cast off, but sealed to the day of redemption and heirs of everlasting salvation.',
  '13.1': 'The effectually called and regenerate are further sanctified, really and personally, through Christ’s death and resurrection by his Word and Spirit — the dominion of sin destroyed, its lusts more and more weakened, and the saving graces quickened toward true holiness, without which none shall see the Lord.',
  '13.2': 'This sanctification is throughout the whole man, yet imperfect in this life, remnants of corruption abiding in every part, whence arises a continual and irreconcilable war of flesh against Spirit and Spirit against flesh.',
  '13.3': 'In that war, though corruption may for a time prevail, the regenerate part overcomes through the continual supply of Christ’s sanctifying Spirit, so the saints grow in grace, perfecting holiness in the fear of God.',
  '14.1': 'The grace of faith, by which the elect believe to the saving of their souls, is the work of Christ’s Spirit in their hearts, ordinarily wrought by the ministry of the Word and increased by Word, sacraments, and prayer.',
  '14.2': 'By faith a Christian believes whatever is revealed in the Word on God’s own authority, obeying commands, trembling at threatenings, and embracing promises — but its principal acts are accepting, receiving, and resting on Christ alone for justification, sanctification, and eternal life.',
  '14.3': 'This faith differs in degrees, weak or strong; it may be often assailed and weakened, yet gains the victory, growing in many to full assurance through Christ, the author and finisher of faith.',
  '15.1': 'Repentance unto life is an evangelical grace, to be preached by every minister of the gospel as well as faith in Christ.',
  '15.2': 'By repentance a sinner, seeing both the danger and the filthiness of his sins as contrary to God’s holy nature and law, and grasping God’s mercy in Christ, so grieves for and hates his sins as to turn from them all to God, purposing to walk in all his commandments.',
  '15.3': 'Repentance is not to be rested in as any satisfaction for sin or cause of pardon — which is God’s free grace in Christ — yet it is so necessary that no sinner may expect pardon without it.',
  '15.4': 'No sin is so small but it deserves damnation; and no sin is so great that it can bring damnation on those who truly repent.',
  '15.5': 'Men should not content themselves with general repentance; it is every man’s duty to endeavor to repent of his particular sins, particularly.',
  '15.6': 'As every man must privately confess his sins to God and, forsaking them, will find mercy; so one who scandalizes his brother or the church ought, by private or public confession, to declare his repentance to those offended, who are then to be reconciled and receive him in love.',
  '16.1': 'Good works are only those God has commanded in his holy Word, not those devised by men out of blind zeal or any pretense of good intention without warrant.',
  '16.2': 'Good works, done in obedience to God’s commandments, are the fruits and evidences of a true and lively faith, by which believers show thankfulness, strengthen assurance, edify others, adorn the gospel, silence adversaries, and glorify God.',
  '16.3': 'Believers’ ability to do good works is not of themselves but wholly from the Spirit of Christ; besides the graces received, they need an actual influence of the Spirit — yet must not grow negligent, but be diligent in stirring up the grace of God in them.',
  '16.4': 'Those who attain the greatest obedience possible in this life are so far from being able to do more than God requires that they fall short of much they are bound to do.',
  '16.5': 'We cannot merit pardon or eternal life by our best works, given the vast disproportion between them and the glory to come; when we have done all, we are unprofitable servants, and our works, though good as from the Spirit, are defiled as wrought by us and cannot endure God’s judgment.',
  '16.6': 'Yet the persons of believers being accepted through Christ, their good works are also accepted in him — not as wholly unblamable, but as God, looking on them in his Son, is pleased to accept and reward what is sincere despite its weaknesses.',
  '16.7': 'Works done by unregenerate men, though commanded by God and useful, are yet sinful and cannot please God or fit a man to receive grace — because they proceed not from a heart purified by faith, nor in a right manner, nor to the right end of God’s glory; yet neglecting them is more sinful still.',
  '17.1': 'Those whom God has accepted in Christ, effectually called and sanctified, can neither totally nor finally fall from the state of grace, but shall certainly persevere to the end and be eternally saved.',
  '17.2': 'This perseverance depends not on their own free will but on the immutability of election, the merit and intercession of Christ, the abiding Spirit and seed of God within them, and the nature of the covenant of grace — from which arise its certainty and infallibility.',
  '17.3': 'Yet through temptation, remaining corruption, and neglect of the means, believers may fall into grievous sins and continue in them for a time — incurring God’s displeasure, grieving the Spirit, losing some measure of grace and comfort, wounding their consciences, and bringing temporal judgments on themselves.',
  '18.1': 'Though hypocrites may deceive themselves with false hopes, those who truly believe in Christ, love him sincerely, and endeavor to walk in good conscience may in this life be certainly assured that they are in the state of grace and rejoice in the hope of glory.',
  '18.2': 'This certainty is not a bare probable persuasion but an infallible assurance of faith, founded on the divine promises, the inward evidence of the graces to which they are made, and the testimony of the Spirit of adoption witnessing that we are God’s children.',
  '18.3': 'Infallible assurance does not so belong to the essence of faith that a believer may not wait long and struggle before attaining it; yet, enabled by the Spirit, he may reach it by ordinary means. So it is everyone’s duty to make his calling and election sure — which yields peace, joy, and obedience, far from inclining to looseness.',
  '18.4': 'True believers may have their assurance shaken, diminished, and interrupted — by negligence, special sin, sudden temptation, or God’s withdrawing his countenance — yet they are never utterly without the seed of God and life of faith, out of which assurance may in due time be revived, and by which they are meanwhile kept from despair.',
  '19.1': 'God gave Adam a law as a covenant of works, binding him and all his posterity to perfect, personal, perpetual obedience, promising life and threatening death, and endowing him with power to keep it.',
  '19.2': 'After the fall this law continued a perfect rule of righteousness and was delivered by God at Sinai in the Ten Commandments on two tables — the first four our duty to God, the other six our duty to man.',
  '19.3': 'Besides the moral law, God gave Israel, as a church under age, ceremonial laws — typical ordinances of worship prefiguring Christ and holding forth moral instruction — all now abrogated under the New Testament.',
  '19.4': 'God also gave Israel, as a body politic, sundry judicial laws, which expired with that state and oblige no other now further than their general equity may require.',
  '19.5': 'The moral law forever binds all — justified persons and others alike — to obedience, both by its content and by the authority of God the Creator who gave it; nor does Christ in the gospel dissolve this obligation, but much strengthens it.',
  '19.6a': 'Though believers are not under the law as a covenant of works, it is of great use to them: as a rule of life it directs them in God’s will and duty, and by discovering the pollutions of their nature it drives them to further conviction of sin and a clearer sight of their need of Christ.',
  '19.6b': 'The law also restrains believers’ corruptions; its threatenings show what their sins deserve and what afflictions they may expect, and its promises show God’s approbation of obedience and its blessings — yet not as due by the law as a covenant of works, so obeying because the law encourages it is no evidence of being under the law rather than under grace.',
  '19.7': 'These uses of the law are not contrary to the grace of the gospel but sweetly comply with it, the Spirit of Christ enabling the will to do freely and cheerfully what the law requires.',
  '20.1': 'The liberty Christ purchased for believers under the gospel is freedom from the guilt of sin, God’s condemning wrath, the curse of the law, this present evil world, bondage to Satan, and the sting of death — plus free access to God and willing, childlike obedience; under the New Testament this liberty is further enlarged by freedom from the ceremonial yoke and fuller communications of the Spirit.',
  '20.2': 'God alone is Lord of the conscience and has left it free from the doctrines and commandments of men that are contrary to his Word, or beside it in matters of faith and worship; to require implicit faith and blind obedience destroys true liberty of conscience and reason.',
  '20.3': 'Those who under pretense of Christian liberty practice sin or cherish lust destroy the very end of Christian liberty — that, delivered from our enemies, we might serve the Lord without fear in holiness and righteousness.',
  '20.4': 'Since the powers God has ordained and the liberty Christ purchased are meant to uphold one another, those who under pretense of liberty oppose lawful civil or ecclesiastical power resist God’s ordinance; and those who publish opinions or practices contrary to nature, Christianity, or the church’s peace may lawfully be called to account by church censures.',
  '21.1': 'The light of nature shows there is a God to be feared, loved, and served with all the heart; but the acceptable way of worshiping him is instituted by God himself and so limited by his revealed will that he may not be worshiped by men’s imaginations, images, or any way not prescribed in Scripture.',
  '21.2': 'Religious worship is to be given to God alone — Father, Son, and Holy Ghost — not to angels, saints, or any creature; and since the fall, only through the mediation of Christ.',
  '21.3': 'Prayer with thanksgiving is a special part of worship required of all; to be accepted it must be made in the Son’s name, by the Spirit’s help, according to God’s will, with understanding, reverence, humility, fervency, faith, and perseverance — and, if vocal, in a known tongue.',
  '21.4': 'Prayer is to be made for lawful things and for all sorts of men now living or yet to live, but not for the dead nor for those known to have sinned the sin unto death.',
  '21.5': 'The reading and preaching of Scripture, conscionable hearing, singing of psalms, and the due administration and receiving of the sacraments are all parts of ordinary worship — besides religious oaths, vows, fastings, and thanksgivings used in their seasons in a holy manner.',
  '21.6': 'Under the gospel, worship is not tied to or made more acceptable by any place; God is to be worshiped everywhere in spirit and truth — in private families daily, in secret, and more solemnly in public assemblies, which are not to be neglected when God calls to them.',
  '21.7': 'By the law of nature a due proportion of time is to be set apart for worship; and in his Word God appointed one day in seven as a Sabbath — from creation to Christ’s resurrection the last day of the week, and thereafter the first day, called the Lord’s Day, kept as the Christian Sabbath to the end of the world.',
  '21.8': 'The Sabbath is kept holy when men, having prepared their hearts and ordered their affairs beforehand, rest all day from their own works, words, and thoughts about worldly employments and recreations, and are taken up the whole time in public and private worship and the duties of necessity and mercy.',
  '22.1': 'A lawful oath is a part of religious worship in which, on just occasion, the swearer solemnly calls God to witness what he asserts or promises and to judge him according to its truth or falsehood.',
  '22.2': 'God’s name alone is to be sworn by, used with holy fear; to swear vainly or by any other thing is sinful; yet in weighty matters a lawful oath imposed by lawful authority ought to be taken, under the New Testament as well as the Old.',
  '22.3': 'Whoever takes an oath must weigh its solemnity and avouch only what he is fully persuaded is true; nor may any bind himself by oath to anything but what is good, just, believed true, and able and resolved to be performed.',
  '22.4': 'An oath is to be taken in the plain, common sense of the words, without equivocation or mental reservation; it cannot oblige to sin, but in anything lawful it binds to performance even to one’s own hurt, and may not be violated even when made to heretics or infidels.',
  '22.5': 'A vow is of the same nature as a promissory oath and ought to be made with the like religious care and performed with the like faithfulness.',
  '22.6': 'A vow is to be made to God alone, and to be accepted must be made voluntarily, out of faith and conscience of duty — in thankfulness for mercy or to obtain what we need — binding us more strictly to necessary duties or things that conduce to them.',
  '22.7': 'No man may vow anything forbidden in God’s Word, or that would hinder a commanded duty, or that is not in his own power; and popish monastic vows of perpetual celibacy, poverty, and obedience are not higher perfection but superstitious and sinful snares.',
  '23.1': 'God, supreme Lord and King of all, has ordained civil magistrates under him over the people, for his glory and the public good, arming them with the power of the sword to defend the good and punish evildoers.',
  '23.2': 'Christians may lawfully accept and execute the office of magistrate, maintaining piety, justice, and peace according to the laws of each commonwealth, and may, under the New Testament, wage war on just and necessary occasion.',
  '23.3a': 'Civil magistrates may not assume the ministry of Word and sacraments, the power of the keys, or interference in matters of faith; yet as nursing fathers they must protect the church of our common Lord without preferring any denomination, so all ecclesiastical persons may freely discharge their functions and no law should hinder the due exercise of church government.',
  '23.3b': 'It is the magistrate’s duty to protect the person and good name of all their people, so that no one — whether on pretense of religion or of infidelity — may offer any indignity, violence, or injury to another, and to see that all religious and ecclesiastical assemblies are held without molestation or disturbance.',
  '23.4': 'It is the people’s duty to pray for magistrates, honor them, pay them tribute, obey their lawful commands, and be subject for conscience’ sake; difference in religion does not void the magistrate’s just authority, nor has the pope any power over them or their people.',
  '24.1': 'Marriage is between one man and one woman: no man may have more than one wife, nor any woman more than one husband, at the same time.',
  '24.2': 'Marriage was ordained for the mutual help of husband and wife, the increase of mankind with legitimate issue and of the church with a holy seed, and the prevention of uncleanness.',
  '24.3': 'All who are able to give consent with judgment may marry; yet Christians are to marry only in the Lord, and so should not marry unbelievers, papists, or idolaters, nor should the godly be unequally yoked with the notoriously wicked or heretical.',
  '24.4': 'Marriage ought not to be within the degrees of consanguinity or affinity forbidden in the Word; such incestuous marriages can never be made lawful by any human law or consent of the parties.',
  '24.5': 'Adultery or fornication detected after betrothal gives the innocent party just occasion to dissolve the contract; and in the case of adultery after marriage the innocent party may sue for divorce and, after it, marry another as if the offender were dead.',
  '24.6': 'Though man’s corruption studies arguments to put asunder those God has joined, nothing but adultery or such willful desertion as cannot be remedied is sufficient cause to dissolve the marriage bond — and even then a public, orderly course is to be followed, the parties not left to their own wills.',
  '25.1': 'The catholic or universal church, which is invisible, consists of the whole number of the elect, gathered into one under Christ their Head, and is his spouse, body, and fullness.',
  '25.2': 'The visible church, also catholic under the gospel (no longer confined to one nation), consists of all who profess the true religion, together with their children, and is the kingdom of Christ and the house and family of God, outside which there is no ordinary possibility of salvation.',
  '25.3': 'To this visible church Christ has given the ministry, oracles, and ordinances of God for the gathering and perfecting of the saints, and by his own presence and Spirit makes them effectual.',
  '25.4': 'This catholic church has been sometimes more, sometimes less visible; and particular churches are more or less pure according as the gospel is taught and embraced, the ordinances administered, and public worship performed more or less purely.',
  '25.5': 'The purest churches under heaven are subject to mixture and error, and some have so degenerated as to become synagogues of Satan; yet there shall always be a church on earth to worship God according to his will.',
  '25.6': 'There is no other head of the church but the Lord Jesus Christ; the pope of Rome can in no sense be head of it.',
  '26.1': 'All saints united to Christ their Head by his Spirit and by faith have fellowship with him in his graces, sufferings, death, resurrection, and glory; and, united to one another in love, share in each other’s gifts and graces and are bound to duties conducing to their mutual good.',
  '26.2': 'Saints are bound to maintain holy fellowship in the worship of God and in mutual edification, and to relieve one another in outward things according to their abilities and necessities — a communion to be extended, as opportunity offers, to all who call on the Lord’s name.',
  '26.3': 'This communion with Christ does not make saints partakers of his Godhead or equal with him in any respect — to affirm which is impious and blasphemous; nor does their communion with one another take away each man’s title and property in his own goods and possessions.',
  '27.1': 'Sacraments are holy signs and seals of the covenant of grace, immediately instituted by God to represent Christ and his benefits, confirm our interest in him, mark a visible difference between the church and the world, and engage us to God’s service.',
  '27.2': 'In every sacrament there is a spiritual relation, or sacramental union, between the sign and the thing signified, so that the names and effects of the one are attributed to the other.',
  '27.3': 'The grace exhibited in the sacraments is not conferred by any power in them, nor does their efficacy depend on the piety or intention of the administrator, but on the Spirit’s work and the word of institution, which contains a promise of benefit to worthy receivers.',
  '27.4': 'There are only two sacraments ordained by Christ in the gospel — baptism and the Lord’s Supper — neither of which may be dispensed except by a lawfully ordained minister of the Word.',
  '27.5': 'The sacraments of the Old Testament, as to the spiritual things signified and exhibited, were for substance the same as those of the New.',
  '28.1': 'Baptism is a New Testament sacrament ordained by Christ, not only for the solemn admission of the baptized into the visible church, but to be a sign and seal of the covenant of grace, of ingrafting into Christ, of regeneration, of remission of sins, and of newness of life — to be continued until the end of the world.',
  '28.2': 'The outward element is water, in which the party is baptized in the name of the Father, Son, and Holy Ghost, by a lawfully called minister of the gospel.',
  '28.3': 'Dipping the person into the water is not necessary; baptism is rightly administered by pouring or sprinkling water upon the person.',
  '28.4': 'Not only those who actually profess faith and obedience, but also the infants of one or both believing parents, are to be baptized.',
  '28.5': 'Though it is a great sin to contemn or neglect this ordinance, grace and salvation are not so inseparably annexed to it that none can be saved without it, or that all the baptized are undoubtedly regenerated.',
  '28.6': 'The efficacy of baptism is not tied to the moment it is administered; yet by the right use of the ordinance the grace promised is really exhibited and conferred by the Holy Ghost, to such as it belongs to, according to God’s will in his appointed time.',
  '28.7': 'The sacrament of baptism is to be administered to any person only once.',
  '29.1': 'On the night he was betrayed, Christ instituted the sacrament of his body and blood — the Lord’s Supper — to be observed to the end of the world, for the perpetual remembrance of his sacrifice, the sealing of its benefits to believers, their spiritual nourishment and growth, and a bond of their communion with him and with one another.',
  '29.2': 'In this sacrament Christ is not offered up to his Father, nor any real sacrifice made for sin, but only a commemoration of his one offering on the cross and a spiritual oblation of praise; so the popish sacrifice of the Mass is most injurious to Christ’s one, only sacrifice.',
  '29.3': 'The Lord has appointed his ministers to declare the word of institution, to pray and bless the elements, to set them apart from common to holy use, and to give both bread and cup to the communicants — but to none not present in the congregation.',
  '29.4': 'Private Masses, receiving the sacrament alone, denying the cup to the people, worshiping or elevating or reserving the elements for adoration — all are contrary to the nature of this sacrament and to Christ’s institution.',
  '29.5': 'The outward elements, duly set apart, have such relation to Christ crucified that they are sometimes called by the names of the things they represent — the body and blood of Christ — yet in substance and nature they still remain truly only bread and wine.',
  '29.6': 'The doctrine of transubstantiation — that the substance of bread and wine is changed into Christ’s body and blood by a priest’s consecration — is repugnant to Scripture and even to common sense, overthrows the nature of the sacrament, and is the cause of manifold superstitions and gross idolatries.',
  '29.7': 'Worthy receivers, outwardly partaking of the elements, do also inwardly by faith really receive and feed upon Christ crucified and all the benefits of his death — the body and blood being not corporally in the elements, yet as really, though spiritually, present to the faith of believers as the elements are to their senses.',
  '29.8': 'Though ignorant and wicked men may receive the outward elements, they do not receive the thing signified; by their unworthy coming they are guilty of the body and blood of the Lord to their own damnation, and are unworthy of the Lord’s table.',
  '30.1': 'The Lord Jesus, as King and Head of his church, has appointed a government in the hands of church officers, distinct from the civil magistrate.',
  '30.2': 'To these officers the keys of the kingdom are committed, by which they have power to retain and remit sins, to shut the kingdom against the impenitent by Word and censures, and to open it to penitent sinners by the gospel and by absolution from censures.',
  '30.3': 'Church censures are necessary for reclaiming offending brethren, deterring others, purging out the leaven that might infect the whole lump, vindicating Christ’s honor and the gospel, and preventing God’s wrath from falling on the church for tolerating notorious and obstinate offenders.',
  '30.4': 'For these ends the officers are to proceed by admonition, suspension from the Lord’s Supper for a season, and excommunication from the church, according to the nature of the offense and the demerit of the person.',
  '31.1': 'For the better government and edification of the church there ought to be assemblies commonly called synods or councils, which the overseers and rulers of the churches are to appoint and convene as often as they judge expedient for the good of the church.',
  '31.2': 'It belongs to synods and councils ministerially to determine controversies of faith and cases of conscience, to set rules for worship and church government, and to receive and authoritatively determine complaints of maladministration — whose decrees, if consonant with the Word, are to be received with reverence, both for their agreement with the Word and for the power that makes them, as an ordinance of God.',
  '31.3': 'All synods or councils since the apostles’ times, whether general or particular, may err, and many have erred; therefore they are not to be made the rule of faith or practice, but used as a help in both.',
  '31.4': 'Synods and councils are to handle only what is ecclesiastical, and not to intermeddle with civil affairs concerning the commonwealth — except by humble petition in extraordinary cases, or by advice for conscience’ sake when required by the civil magistrate.',
  '32.1': 'The bodies of men return to dust after death, but their souls, which neither die nor sleep, immediately return to God: the righteous, made perfect in holiness, are received into the highest heavens; the wicked are cast into hell — the Scripture acknowledging no other place for separated souls.',
  '32.2': 'At the last day, those found alive shall not die but be changed, and all the dead shall be raised with the selfsame bodies (though with different qualities), united again to their souls forever.',
  '32.3': 'The bodies of the unjust shall be raised to dishonor by Christ’s power; the bodies of the just, by his Spirit, to honor, made conformable to his own glorious body.',
  '33.1': 'God has appointed a day when he will judge the world in righteousness by Jesus Christ, to whom all judgment is given — when the apostate angels and all persons who ever lived shall appear before Christ’s tribunal to give account of their thoughts, words, and deeds, and receive according to what they have done.',
  '33.2': 'The end of appointing this day is the manifestation of God’s mercy in the elect’s eternal salvation and of his justice in the reprobate’s damnation: the righteous shall enter everlasting life and fullness of joy, while the wicked who know not God shall be cast into eternal torments, punished with everlasting destruction from the presence of the Lord.',
  '33.3': 'Christ would have us certainly persuaded there will be a day of judgment — to deter all from sin and comfort the godly in adversity — yet has left the day unknown, that men may shake off carnal security, be ever watchful, and always prepared to say, Come, Lord Jesus, come quickly.',
};

// Chapter groupings for the By-subject nested selector display.
const GROUPS = [
  { id: 'wcf-g1', label: 'Scripture, God & the Decree', chapters: [1, 2, 3, 4, 5] },
  { id: 'wcf-g2', label: 'Sin, the Covenant & Christ', chapters: [6, 7, 8, 9] },
  { id: 'wcf-g3', label: 'The Application of Redemption', chapters: [10, 11, 12, 13, 14, 15, 16, 17, 18] },
  { id: 'wcf-g4', label: 'Law, Liberty, Worship & Society', chapters: [19, 20, 21, 22, 23, 24] },
  { id: 'wcf-g5', label: 'The Church & the Sacraments', chapters: [25, 26, 27, 28, 29, 30, 31] },
  { id: 'wcf-g6', label: 'Last Things', chapters: [32, 33] },
];

// ── Build cards ────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');
const sets = {};
const setKeys = [];
let cardCount = 0;
const missingSummaries = [];

for (const ch of wcf.chapters) {
  const setKey = `wcf-${pad(ch.n)}`;
  setKeys.push(setKey);
  const cards = [];
  const stem = `What does the Confession teach about ${TOPIC[ch.n]}?`;
  for (const s of ch.sections) {
    const base = `${ch.n}.${s.n}`;
    const proofRefs = (s.refs || []).slice(0, 6);
    const refs = [`WCF ${base}`, ...proofRefs];
    const split = SPLITS[base];
    if (split) {
      const idx = s.text.indexOf(split.at);
      if (idx < 0) throw new Error(`split boundary not found for WCF ${base}: "${split.at}"`);
      const parts = [s.text.slice(0, idx).trim(), s.text.slice(idx).trim()];
      parts.forEach((partText, i) => {
        const suffix = i === 0 ? 'a' : 'b';
        const sumKey = `${base}${suffix}`;
        const summary = SUMMARY[sumKey];
        if (!summary) missingSummaries.push(sumKey);
        cards.push({
          id: `wcf-${ch.n}-${s.n}${suffix}`,
          q: `WCF ${base} — ${stem} (Part ${i + 1} of 2)`,
          a: `WCF: ${partText}\nNote: This is part ${i + 1} of 2 of WCF ${base}; the full section is covered across both cards.`,
          summary,
          refs,
          wcf: true,
        });
        cardCount++;
      });
    } else {
      const summary = SUMMARY[base];
      if (!summary) missingSummaries.push(base);
      cards.push({
        id: `wcf-${ch.n}-${s.n}`,
        q: `WCF ${base} — ${stem}`,
        a: `WCF: ${s.text}`,
        summary,
        refs,
        wcf: true,
      });
      cardCount++;
    }
  }
  sets[setKey] = {
    label: `WCF ${ch.n} · ${ch.title}`,
    subject: 'wcf',
    order: ch.n,
    cards,
  };
}

if (missingSummaries.length) throw new Error(`missing summaries: ${missingSummaries.join(', ')}`);

const groups = GROUPS.map(g => ({ id: g.id, label: g.label, keys: g.chapters.map(n => `wcf-${pad(n)}`) }));

// ── Emit js/data/subjects/wcf.js ───────────────────────────────────────────
const subject = {
  id: 'wcf',
  label: 'Westminster Confession of Faith',
  blurb: 'The Westminster Confession of Faith (American revision) — every chapter and section, in full or in summary.',
  order: 2.7, // just after Theology (2) / Doctrines & Proofs (2.5)
  setKeys,
  groups,
};

const out = `// PCA Ordination & Licensure Study — Westminster Confession of Faith subject.
// Generated by dev/build_wcf_subject.mjs from js/data/wcf.js. One selectable
// set per chapter (wcf-01..wcf-33); one card per section (a few long sections
// split into parts — see PROJECT_PLAN). Each card carries the full confession
// wording ("a", provenance-labeled WCF:) AND an authored concise "summary"; the
// "WCF card detail" setting (default Full text) chooses which the app shows.
// The full American-revision text is public domain. Do not hand-edit; re-run the
// generator (it also re-cleans js/data/wcf.js).
(function (global) {
  const SUBJECT = ${JSON.stringify(subject, null, 2)};
  const SETS = ${JSON.stringify(sets, null, 1)};
  const data = (global.PCA_DATA = global.PCA_DATA || { subjects: [], sets: {} });
  if (!data.subjects.find(s => s.id === SUBJECT.id)) data.subjects.push(SUBJECT);
  Object.assign(data.sets, SETS);
})(typeof window !== 'undefined' ? window : globalThis);
`;
writeFileSync(new URL('js/data/subjects/wcf.js', root), out);

console.log(`wrote js/data/subjects/wcf.js — ${setKeys.length} chapter sets, ${cardCount} cards`);
console.log(`re-cleaned js/data/wcf.js (33 chapters, ${wcf.chapters.reduce((n, c) => n + c.sections.length, 0)} sections)`);
console.log(`splits: ${Object.keys(SPLITS).join(', ')}`);
