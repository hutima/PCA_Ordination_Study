// Tiny dependency-free Markdown → HTML renderer.
//
// Scoped to what the PCA study answers actually use: paragraphs, ordered and
// unordered lists, blockquotes (Scripture proof blocks), GFM pipe tables,
// and inline **bold** / _italic_ / `code`. No raw HTML passthrough — all
// source text is escaped first, so answer content can never inject markup.
//
// Usage: import { renderMarkdown } from '../utils/markdown.js';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Inline spans run on already-escaped text.
function renderInline(text) {
  let t = text;
  t = t.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, (_, c) => `<strong>${c}</strong>`);
  t = t.replace(/(?:^|(?<=\s))_([^_]+)_(?=\s|$|[.,;:!?])/g, (_, c) => `<em>${c}</em>`);
  return t;
}

const BULLET_RE = /^\s*-\s+(.*)$/;
const ORDERED_RE = /^\s*(\d+)\.\s+(.*)$/;
const LETTERED_RE = /^\s*([a-z])\.\s+(.*)$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/;

function isTableRow(line) {
  return line.includes('|') && line.trim().length > 0;
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map(c => c.trim());
}

export function renderMarkdown(src) {
  if (src == null) return '';
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
  const html = [];
  let i = 0;

  const flushParagraph = (buf) => {
    if (!buf.length) return;
    html.push(`<p>${renderInline(escapeHtml(buf.join(' ')))}</p>`);
    buf.length = 0;
  };

  let paragraph = [];

  while (i < lines.length) {
    const line = lines[i];

    // Blank line → paragraph break.
    if (!line.trim()) {
      flushParagraph(paragraph);
      i++;
      continue;
    }

    // GFM table: a row followed by a |---|---| separator.
    if (isTableRow(line) && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1])) {
      flushParagraph(paragraph);
      const header = splitRow(line);
      i += 2; // skip header + separator
      const rows = [];
      while (i < lines.length && isTableRow(lines[i]) && lines[i].trim()) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      let t = '<table><thead><tr>';
      t += header.map(c => `<th>${renderInline(escapeHtml(c))}</th>`).join('');
      t += '</tr></thead><tbody>';
      for (const r of rows) {
        t += '<tr>' + header.map((_, idx) => `<td>${renderInline(escapeHtml(r[idx] || ''))}</td>`).join('') + '</tr>';
      }
      t += '</tbody></table>';
      html.push(t);
      continue;
    }

    // Blockquote (Scripture proof block): consecutive "> " lines.
    if (QUOTE_RE.test(line)) {
      flushParagraph(paragraph);
      const quote = [];
      while (i < lines.length && QUOTE_RE.test(lines[i])) {
        quote.push(lines[i].match(QUOTE_RE)[1]);
        i++;
      }
      html.push(`<blockquote>${renderInline(escapeHtml(quote.join(' ')))}</blockquote>`);
      continue;
    }

    // Unordered list.
    if (BULLET_RE.test(line)) {
      flushParagraph(paragraph);
      const items = [];
      while (i < lines.length && BULLET_RE.test(lines[i])) {
        items.push(lines[i].match(BULLET_RE)[1]);
        i++;
      }
      html.push('<ul>' + items.map(it => `<li>${renderInline(escapeHtml(it))}</li>`).join('') + '</ul>');
      continue;
    }

    // Ordered list.
    if (ORDERED_RE.test(line)) {
      flushParagraph(paragraph);
      const m0 = line.match(ORDERED_RE);
      const start = Number(m0[1]);
      const items = [];
      while (i < lines.length && ORDERED_RE.test(lines[i])) {
        items.push(lines[i].match(ORDERED_RE)[2]);
        i++;
      }
      const startAttr = start !== 1 ? ` start="${start}"` : '';
      html.push(`<ol${startAttr}>` + items.map(it => `<li>${renderInline(escapeHtml(it))}</li>`).join('') + '</ol>');
      continue;
    }

    // Lettered list (a. b. c.) → <ol type="a"> with the right starting letter.
    if (LETTERED_RE.test(line)) {
      flushParagraph(paragraph);
      const m0 = line.match(LETTERED_RE);
      const start = m0[1].charCodeAt(0) - 96; // 'a' -> 1
      const items = [];
      while (i < lines.length && LETTERED_RE.test(lines[i])) {
        items.push(lines[i].match(LETTERED_RE)[2]);
        i++;
      }
      const startAttr = start !== 1 ? ` start="${start}"` : '';
      html.push(`<ol type="a"${startAttr}>` + items.map(it => `<li>${renderInline(escapeHtml(it))}</li>`).join('') + '</ol>');
      continue;
    }

    // Plain text → accumulate into current paragraph.
    paragraph.push(line.trim());
    i++;
  }
  flushParagraph(paragraph);
  return html.join('\n');
}

export default renderMarkdown;
