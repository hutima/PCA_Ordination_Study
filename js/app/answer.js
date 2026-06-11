// Provenance-aware answer rendering + short-summary derivation.
//
// Answers mix three kinds of text that the original study docs ran together:
// verbatim confessional standards, attributed quotations, and the author's own
// study notes. We label them so a reader can tell official wording from a gloss.
// `summarize()` produces the short teaser shown before the full answer is
// expanded (progressive disclosure on the review card).

import { renderMarkdown } from '../utils/markdown.js';
import { escapeHtml } from '../utils/text.js';

const STANDARD_LABELS = {
  WSC: 'Westminster Shorter Catechism', WLC: 'Westminster Larger Catechism',
  WCF: 'Westminster Confession', WSA: 'Westminster Assembly',
};
const ATTRIBUTION_LABELS = {
  Calvin: 'Calvin', Luther: 'Luther', Augustine: 'Augustine',
  Turretin: 'Turretin', Heidelberg: 'Heidelberg Catechism',
};
const PROV_RE = /^\s*([A-Za-z]+)\s*:\s?(.*)$/;
// Leading provenance label stripped when deriving a plain-text summary.
const LABEL_STRIP_RE = /^\s*(WSC|WLC|WCF|WSA|Note|Calvin|Luther|Augustine|Turretin|Heidelberg)\s*:\s*/;

function classifyLine(line) {
  const m = line.match(PROV_RE);
  if (m) {
    const tok = m[1];
    if (STANDARD_LABELS[tok]) return { kind: 'standard', label: STANDARD_LABELS[tok], text: m[2] };
    if (tok === 'Note') return { kind: 'note', label: 'Study note', text: m[2] };
    if (ATTRIBUTION_LABELS[tok]) return { kind: 'attribution', label: ATTRIBUTION_LABELS[tok], text: m[2] };
  }
  return { kind: 'plain', label: null, text: line };
}

// Render a Markdown answer, wrapping standard/attribution/note runs in labeled
// callouts. Cards with no provenance prefixes render exactly as plain Markdown.
export function renderAnswer(md) {
  if (md == null) return '';
  const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
  const segs = [];
  let cur = null;
  for (const line of lines) {
    const c = line.trim()
      ? classifyLine(line)
      : { kind: cur ? cur.kind : 'plain', label: cur ? cur.label : null, text: '' };
    if (cur && cur.kind === c.kind && cur.label === c.label) {
      cur.lines.push(c.text);
    } else {
      cur = { kind: c.kind, label: c.label, lines: [c.text] };
      segs.push(cur);
    }
  }
  return segs.map(seg => {
    const body = renderMarkdown(seg.lines.join('\n'));
    if (seg.kind === 'plain') return body;
    const cls = seg.kind === 'standard' ? 'qa-standard'
      : seg.kind === 'note' ? 'qa-note' : 'qa-attribution';
    const label = seg.kind === 'note'
      ? 'Study note — confirm against the standards'
      : escapeHtml(seg.label);
    return `<div class="qa-callout ${cls}"><div class="qa-prov-label">${label}</div>${body}</div>`;
  }).join('\n');
}

// A short plain-text teaser for the front of progressive disclosure. Prefers an
// authored `card.summary`; otherwise derives one from the first substantive line
// of the answer (label stripped), capped to a tweet-ish length.
export function summarize(card, max = 240) {
  if (card && typeof card.summary === 'string' && card.summary.trim()) return card.summary.trim();
  const a = String((card && card.a) || '').replace(/\r\n?/g, '\n').trim();
  if (!a) return '';
  const first = a.split('\n').map(l => l.trim()).find(Boolean) || '';
  let s = first.replace(LABEL_STRIP_RE, '').replace(/\s+/g, ' ').trim();
  if (s.length > max) s = s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
  return s;
}

// Does the answer carry more than its one-line summary (lists, tables, quotes,
// multiple lines)? Used to decide whether to offer a "full answer" expander.
export function hasMoreThanSummary(card) {
  if (card && typeof card.summary === 'string' && card.summary.trim()) return true;
  const a = String((card && card.a) || '').replace(/\r\n?/g, '\n').trim();
  if (!a) return false;
  const lines = a.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.length > 1 || a.length > 240 || /[|*>]/.test(a);
}
