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
// of the answer (label stripped). The summary always ends on a complete thought:
// prose is cut at sentence boundaries (never mid-sentence), a bare list intro
// ("The Assembly works through:") is extended with whole list items, and only a
// single enormous sentence falls back to a clause cut.
const LIST_MARKER_RE = /^\s*(?:[-•]|\d+\.|[a-z]\.|\*\*[^*]+\*\*\.?)\s*/;
const HARD_MAX = 420;

function stripMarkup(line) {
  return line.replace(LIST_MARKER_RE, '').replace(LABEL_STRIP_RE, '')
    .replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
}

// Split prose into sentences. A boundary is ./!/? (plus closing quotes or
// brackets) followed by whitespace and a capital or opening quote — so
// citations ("Matt. 10:29", "BCO 25-2") and initials ("J. Gresham") never
// split, since what follows them is a digit or they end in a single capital.
function splitSentences(text) {
  const parts = [];
  let last = 0;
  const re = /[.?!]["”’)\]]*(?=\s+["“(]*[A-Z])/g;
  let m;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    const chunk = text.slice(last, end);
    if (/(^|\s)(?:[A-Z]|Mr|Mrs|Dr|St|vs|etc|cf|viz|i\.e|e\.g)\.$/.test(chunk)) continue;
    parts.push(chunk.trim());
    last = end;
  }
  const rest = text.slice(last).trim();
  if (rest) parts.push(rest);
  return parts;
}

// A line that introduces a Scripture quotation in a passages-on-a-topic card,
// e.g. "Romans 3:25:" or "1 Corinthians 15:3-8 (cf. also Acts 4:32-37):".
const REF_LINE_RE = /^(?:[123]\s)?[A-Z][a-zA-Z]+\.?\s\d[\d:,–\- ]*[ab]?(?:\s*\(cf\.[^)]*\))?:$/;

export function summarize(card, max = 240) {
  if (card && typeof card.summary === 'string' && card.summary.trim()) return card.summary.trim();
  const a = String((card && card.a) || '').replace(/\r\n?/g, '\n').trim();
  if (!a) return '';
  const lines = a.split('\n').map(l => l.trim()).filter(Boolean);
  // Table rows can't be teased line-by-line: derive from the prose around the
  // table, or — when the whole answer is a table — from its header cells.
  const prose = lines.filter(l => !l.startsWith('|'));
  // A passages-on-a-topic card (reference headers, each followed by a quote)
  // teases best as the list of references — that IS the recall target.
  const refs = prose.filter(l => REF_LINE_RE.test(l)).map(l => l.replace(/:$/, ''));
  if (refs.length >= 2 && refs.length >= prose.filter(l => !LIST_MARKER_RE.test(l)).length - 1) {
    return `Key passages: ${refs.join('; ')}.`;
  }
  let s = stripMarkup(prose[0] || '');
  if (!s) {
    const header = lines.find(l => l.startsWith('|') && /[^|\s:-]/.test(l)) || '';
    s = header.split('|').map(c => c.trim()).filter(Boolean).join(' · ');
  }
  if ((s.endsWith(':') || s.length < 30) && prose.length > 1) {
    // Bare intro / fragment: append whole following list items; a "(+N more)"
    // marks items that didn't fit, so the teaser still ends on a whole thought.
    const rest = prose.slice(1).map(stripMarkup).filter(Boolean);
    const items = [];
    for (const item of rest) {
      if (items.length && `${s} ${items.join('; ')}; ${item}`.length > max) break;
      items.push(item);
    }
    if (items.length) {
      const left = rest.length - items.length;
      s = `${s} ${items.join('; ')}${left > 0 ? ` (+${left} more)` : ''}`;
    }
  } else if (s.length > max) {
    // Keep whole sentences while they fit; always keep the first.
    let acc = '';
    for (const sent of splitSentences(s)) {
      if (acc && `${acc} ${sent}`.length > max) break;
      acc = acc ? `${acc} ${sent}` : sent;
    }
    s = acc || s;
  }
  if (s.length > HARD_MAX) {
    // One enormous sentence: cut at the last clause break that fits.
    const cut = Math.max(s.lastIndexOf('; ', HARD_MAX), s.lastIndexOf(', ', HARD_MAX));
    s = (cut > 60 ? s.slice(0, cut) : s.slice(0, max).replace(/\s+\S*$/, '')) + ' …';
  }
  return s;
}

// Short, table-free answers don't need progressive disclosure: the review
// card shows them in full on reveal instead of a teaser + expander (memory
// verses especially read wrong as a teaser-summary of themselves).
export function directAnswer(card) {
  if (card && typeof card.summary === 'string' && card.summary.trim()) return false;
  const a = String((card && card.a) || '').trim();
  return a.length > 0 && a.length <= 480 && !a.includes('|');
}

// Does the answer carry more than its summary (lists, tables, quotes, labeled
// callouts, dropped sentences)? Decides whether to offer the "full answer"
// expander.
export function hasMoreThanSummary(card) {
  if (card && typeof card.summary === 'string' && card.summary.trim()) return true;
  const a = String((card && card.a) || '').replace(/\r\n?/g, '\n').trim();
  if (!a) return false;
  const lines = a.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 1 || /[|*>]/.test(a) || LABEL_STRIP_RE.test(lines[0])) return true;
  return summarize(card).length < stripMarkup(lines[0]).length;
}
