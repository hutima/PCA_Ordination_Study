// Reference chips → official source links. Maps a citation string to an
// authoritative online text where one exists, so every chip becomes a one-tap
// path to the source.

import { escapeHtml } from '../utils/text.js';

export function refLink(ref) {
  const r = String(ref).trim();
  if (/^WCF\b/i.test(r)) return 'https://www.opc.org/wcf.html';
  if (/^WLC\b/i.test(r)) return 'https://www.opc.org/lc.html';
  if (/^WSC\b/i.test(r)) return 'https://www.opc.org/sc.html';
  if (/^BCO\b/i.test(r)) return 'https://www.pcaac.org/bco/';
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
