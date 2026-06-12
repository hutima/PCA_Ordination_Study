// Reference chips → official source links. Maps a citation string to an
// authoritative online text where one exists, so every chip becomes a one-tap
// path to the source.

import { escapeHtml } from '../utils/text.js';

// pcaac.org serves the BCO as three part pages with #chapter_N anchors:
// Part 1 The Form of Government (ch. 1–26), Part 2 The Rules of Discipline
// (ch. 27–46), Part 3 The Directory for the Worship of God (ch. 47–63).
const BCO_BASE = 'https://www.pcaac.org/book-of-church-order/';
function bcoLink(r) {
  const m = /^BCO\s+(\d+)/i.exec(r);
  if (m) {
    const ch = Number(m[1]);
    const part = ch >= 1 && ch <= 26 ? 'part-1-the-form-of-government'
      : ch <= 46 ? 'part-2-the-rules-of-discipline'
      : ch <= 63 ? 'part-3-the-directory-for-the-worship-of-god'
      : null;
    if (part) return `${BCO_BASE}${part}/#chapter_${ch}`;
  }
  if (/directory for worship/i.test(r)) return `${BCO_BASE}part-3-the-directory-for-the-worship-of-god/`;
  if (/preface/i.test(r)) return `${BCO_BASE}preface/`;
  return BCO_BASE;
}

// Scripture book abbreviations → full ESV names. esv.org serves any passage at
// /<reference>/ with '+' for spaces (e.g. https://www.esv.org/Matthew+1/); it
// 403s bots but resolves fine in a browser. Normalizing the book to its full
// name keeps the URL unambiguous regardless of how a card abbreviates it.
const BOOK_NAMES = {
  gen: 'Genesis', genesis: 'Genesis', ex: 'Exodus', exod: 'Exodus', exodus: 'Exodus',
  lev: 'Leviticus', leviticus: 'Leviticus', num: 'Numbers', numbers: 'Numbers',
  deut: 'Deuteronomy', deuteronomy: 'Deuteronomy', josh: 'Joshua', joshua: 'Joshua',
  judg: 'Judges', judges: 'Judges', ruth: 'Ruth',
  '1sam': '1 Samuel', '1samuel': '1 Samuel', '2sam': '2 Samuel', '2samuel': '2 Samuel',
  '1kgs': '1 Kings', '1kings': '1 Kings', '2kgs': '2 Kings', '2kings': '2 Kings',
  '1chr': '1 Chronicles', '1chron': '1 Chronicles', '1chronicles': '1 Chronicles',
  '2chr': '2 Chronicles', '2chron': '2 Chronicles', '2chronicles': '2 Chronicles',
  ezra: 'Ezra', neh: 'Nehemiah', nehemiah: 'Nehemiah', esth: 'Esther', esther: 'Esther',
  job: 'Job', ps: 'Psalm', psa: 'Psalm', psalm: 'Psalm', psalms: 'Psalm', pss: 'Psalm',
  prov: 'Proverbs', proverbs: 'Proverbs', eccl: 'Ecclesiastes', ecclesiastes: 'Ecclesiastes',
  song: 'Song of Solomon', isa: 'Isaiah', isaiah: 'Isaiah', jer: 'Jeremiah', jeremiah: 'Jeremiah',
  lam: 'Lamentations', lamentations: 'Lamentations', ezek: 'Ezekiel', ezekiel: 'Ezekiel',
  dan: 'Daniel', daniel: 'Daniel', hos: 'Hosea', hosea: 'Hosea', joel: 'Joel', amos: 'Amos',
  obad: 'Obadiah', obadiah: 'Obadiah', jonah: 'Jonah', mic: 'Micah', micah: 'Micah',
  nah: 'Nahum', nahum: 'Nahum', hab: 'Habakkuk', habakkuk: 'Habakkuk',
  zeph: 'Zephaniah', zephaniah: 'Zephaniah', hag: 'Haggai', haggai: 'Haggai',
  zech: 'Zechariah', zechariah: 'Zechariah', mal: 'Malachi', malachi: 'Malachi',
  matt: 'Matthew', mt: 'Matthew', matthew: 'Matthew', mark: 'Mark', mk: 'Mark',
  luke: 'Luke', lk: 'Luke', john: 'John', jn: 'John', acts: 'Acts',
  rom: 'Romans', romans: 'Romans', '1cor': '1 Corinthians', '1corinthians': '1 Corinthians',
  '2cor': '2 Corinthians', '2corinthians': '2 Corinthians', gal: 'Galatians', galatians: 'Galatians',
  eph: 'Ephesians', ephesians: 'Ephesians', phil: 'Philippians', philippians: 'Philippians',
  col: 'Colossians', colossians: 'Colossians',
  '1thess': '1 Thessalonians', '1thessalonians': '1 Thessalonians',
  '2thess': '2 Thessalonians', '2thessalonians': '2 Thessalonians',
  '1tim': '1 Timothy', '1timothy': '1 Timothy', '2tim': '2 Timothy', '2timothy': '2 Timothy',
  titus: 'Titus', phlm: 'Philemon', philem: 'Philemon', philemon: 'Philemon',
  heb: 'Hebrews', hebrews: 'Hebrews', jas: 'James', james: 'James',
  '1pet': '1 Peter', '1peter': '1 Peter', '2pet': '2 Peter', '2peter': '2 Peter',
  '1john': '1 John', '2john': '2 John', '3john': '3 John', jude: 'Jude',
  rev: 'Revelation', revelation: 'Revelation',
};

function scriptureLink(r) {
  // Drop trailing "ff."/following markers; normalize en/em dashes to hyphens.
  const ref = r.replace(/\s*ff\.?/gi, '').replace(/[–—]/g, '-').trim();
  const m = /^(\d?\s?[A-Za-z][A-Za-z.]*)\s+(\d+:.+)$/.exec(ref);
  if (!m) return null;
  const book = BOOK_NAMES[m[1].replace(/[.\s]/g, '').toLowerCase()];
  if (book) {
    return 'https://www.esv.org/' + (book + ' ' + m[2].trim()).replace(/ /g, '+') + '/';
  }
  // Unrecognized abbreviation: fall back to a tolerant ESV search.
  return 'https://www.biblegateway.com/passage/?version=ESV&search=' + encodeURIComponent(ref);
}

export function refLink(ref) {
  const r = String(ref).trim();
  if (/^WCF\b/i.test(r)) return 'https://www.opc.org/wcf.html';
  if (/^WLC\b/i.test(r)) return 'https://www.opc.org/lc.html';
  if (/^WSC\b/i.test(r)) return 'https://www.opc.org/sc.html';
  if (/^BCO\b/i.test(r)) return bcoLink(r);
  // Scripture: "Book chap:verse" (e.g. Romans 4:11, 1 Cor. 11:23, Matthew 28:19).
  if (/^\d?\s?[A-Za-z][A-Za-z.]*\s+\d+:\d+/.test(r)) return scriptureLink(r);
  return null;
}

export function renderRefs(refs) {
  if (!refs || !refs.length) return '';
  const chips = refs.map(r => {
    const url = refLink(r);
    const txt = escapeHtml(r);
    return url
      ? `<a class="qa-ref-chip" href="${url}" target="_blank" rel="noopener noreferrer">${txt}</a>`
      : `<span class="qa-ref-chip">${txt}</span>`;
  }).join('');
  return `<div class="qa-refs">${chips}</div>`;
}
