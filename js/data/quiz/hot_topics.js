// PCA Ordination & Licensure Study — hand-authored Quiz bank: Hot Topics.
// Reflects PCA/Westminster confessional positions on contested questions.
(function (global) {
  const Q = [
    { id: 'qz-ht-1', subject: 'hot_topics', refs: ['WCF 21.1'],
      q: 'The Regulative Principle of Worship teaches that acceptable worship is limited to:',
      choices: ['whatever is not expressly forbidden', 'what God has appointed in His Word', 'whatever the congregation finds edifying', 'the traditions of the church'], answerIndex: 1 },
    { id: 'qz-ht-2', subject: 'hot_topics', refs: ['WCF 21.7-8'],
      q: 'The Confession teaches that the Sabbath, under the New Testament, is to be observed on:',
      choices: ['the seventh day (Saturday)', 'the first day of the week (the Lord’s Day)', 'no fixed day', 'any feast day appointed by the church'], answerIndex: 1 },
    { id: 'qz-ht-3', subject: 'hot_topics', refs: ['BCO 7-2'],
      q: 'In the PCA, the ordained offices of elder and deacon are open to:',
      choices: ['all communing members', 'men and women equally', 'qualified men', 'teaching elders only'], answerIndex: 2 },
    { id: 'qz-ht-4', subject: 'hot_topics', refs: ['WCF 19.4'],
      q: 'Theonomy is the view that the civil magistrate is obligated to enforce the Old Testament judicial laws. The Confession instead teaches those judicial laws:',
      choices: ['remain fully and perpetually binding on all nations', 'expired, obliging no further than their general equity requires', 'were never actually given by God to Israel', 'apply only within the visible church today'], answerIndex: 1 },
    { id: 'qz-ht-5', subject: 'hot_topics',
      q: 'The PCA’s position on paedo-communion (admitting young covenant children to the Supper before a profession of faith) is that it is:',
      choices: ['positively required of all baptized covenant children', 'not permitted; admission follows a credible profession of faith', 'left entirely to the discretion of the parents', 'practiced at the discretion of the local deacons'], answerIndex: 1 },
    { id: 'qz-ht-6', subject: 'hot_topics', refs: ['WCF 24.5'],
      q: 'The Confession permits divorce on the grounds of:',
      choices: ['ongoing personal incompatibility', 'adultery or willful, irremediable desertion', 'any cause that the civil law happens to allow', 'no cause whatsoever, in any circumstance'], answerIndex: 1 },
    { id: 'qz-ht-7', subject: 'hot_topics',
      q: 'The PCA affirms that Adam and Eve were:',
      choices: ['literary symbols of humanity', 'real, historical persons specially created by God', 'the product of evolution from earlier hominids', 'a later Hebrew legend'], answerIndex: 1 },
    { id: 'qz-ht-8', subject: 'hot_topics', refs: ['WCF 1.1'],
      q: 'Regarding the continuation of revelatory gifts, the Confession teaches that God’s "former ways of revealing His will unto His people" are now:',
      choices: ['ceased', 'increasing', 'restricted to apostles', 'available through dreams'], answerIndex: 0 },
    { id: 'qz-ht-9', subject: 'hot_topics',
      q: 'PCA candidates take a form of "good faith" subscription to the Standards, which means a candidate must:',
      choices: ['affirm every single word of them without any exception', 'state any differences with the Standards, which the presbytery then judges', 'sign the Standards privately without any examination', 'reject the Confession as merely advisory and optional'], answerIndex: 1 },
    { id: 'qz-ht-10', subject: 'hot_topics', refs: ['WCF 19'],
      q: 'Concerning the law of God, the Confession teaches that the moral law continues to bind, while the ceremonial laws are:',
      choices: ['still required', 'abrogated under the New Testament', 'enforced by the magistrate', 'optional for Gentiles'], answerIndex: 1 },
    { id: 'qz-ht-11', subject: 'hot_topics', refs: ['Eph 4:4-6'],
      q: 'A person validly baptized in the name of the Triune God in a gospel-believing church who later seeks "re-baptism" should be:',
      choices: ['re-baptized properly by full immersion', 'taught the meaning of the one baptism and not re-baptized', 're-baptized, but only later as an adult', 'referred to another Christian denomination'], answerIndex: 1 },
    { id: 'qz-ht-12', subject: 'hot_topics',
      q: 'Which is a recognized view of the days of creation discussed within the PCA?',
      choices: ['The framework (literary) view', 'The pantheist eternal-universe view', 'The open-theist view of the future', 'The annihilationist view of hell'], answerIndex: 0 },
  ];
  const bank = (global.PCA_QUIZ = global.PCA_QUIZ || []);
  for (const x of Q) bank.push(x);
})(typeof window !== 'undefined' ? window : globalThis);
