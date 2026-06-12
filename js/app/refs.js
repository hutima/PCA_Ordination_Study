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

export function refLink(ref) {
  const r = String(ref).trim();
  if (/^WCF\b/i.test(r)) return 'https://www.opc.org/wcf.html';
  if (/^WLC\b/i.test(r)) return 'https://www.opc.org/lc.html';
  if (/^WSC\b/i.test(r)) return 'https://www.opc.org/sc.html';
  if (/^BCO\b/i.test(r)) return bcoLink(r);
  // Scripture: "Book chap:verse" (e.g. Romans 4:11, 1 Cor. 11:23, Matthew 28:19).
  if (/^\d?\s?[A-Za-z][A-Za-z.]*\s+\d+:\d+/.test(r)) {
    return 'https://www.biblegateway.com/passage/?version=ESV&search='
      + encodeURIComponent(r.replace(/ff\.?/gi, '').trim());
  }
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
