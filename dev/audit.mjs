// Content audit: flag cards matching the failure classes reported from
// real phone use. Run: node dev/audit.mjs [--full]
import { renderMarkdown } from '../js/utils/markdown.js';
import { summarize } from '../js/app/answer.js';
import { readdirSync } from 'node:fs';

const SUBJECT_DIR = new URL('../js/data/subjects/', import.meta.url);
for (const f of readdirSync(SUBJECT_DIR).filter(f => f.endsWith('.js'))) {
  await import(new URL(f, SUBJECT_DIR));
}
const data = globalThis.PCA_DATA;

const flags = {};
function flag(kind, card, detail) {
  (flags[kind] = flags[kind] || []).push({ id: card.id, q: card.q.slice(0, 90), detail });
}

for (const subject of data.subjects) {
  for (const key of subject.setKeys) {
    const set = data.sets[key];
    if (!set) continue;
    for (const c of set.cards) {
      const a = String(c.a || '');
      const q = String(c.q || '');
      const lines = a.split('\n').map(l => l.trim()).filter(Boolean);

      // D: question text continues after its '?' with what looks like the
      // answer itself (references, "//" separators) rather than a directive
      // like "Defend your answer with Scripture proofs."
      const qm = q.lastIndexOf('?');
      const qTail = qm >= 0 ? q.slice(qm + 1).trim() : '';
      if (qTail.length > 2 && (/\/\//.test(qTail) || /\d+:\d+/.test(qTail))) {
        flag('Q_HAS_INLINE_ANSWER', c, qTail.slice(0, 60));
      }

      // A/D: answer contains what looks like a follow-up question line.
      for (const l of lines) {
        const stripped = l.replace(/^[-\d a-z.()*]+\s*/, '');
        if (/\?\s*$/.test(l) && !/^>/.test(l) && l.length > 15 && !/["”’]\s*$/.test(l.replace(/\?+\s*$/, '?'))) {
          flag('QUESTION_IN_ANSWER', c, l.slice(0, 80));
          break;
        }
      }

      // F: pipes that survive into rendered paragraphs = broken table.
      const html = renderMarkdown(a);
      if (/<(p|li|blockquote)[^>]*>[^<]*\|/.test(html)) {
        flag('BROKEN_TABLE', c, (a.match(/^.*\|.*$/m) || [''])[0].slice(0, 70));
      }

      // C: derived teaser still truncates or falls back to header cells.
      const teaser = summarize(c);
      if (!c.summary && /…\s*$/.test(teaser)) flag('TEASER_ELLIPSIS', c, teaser.slice(-60));
      if (!c.summary && / · /.test(teaser)) flag('TEASER_HEADER_FALLBACK', c, teaser.slice(0, 60));

      // Stub answers: a dangling cross-reference ("See chart below") whose
      // referent lives elsewhere in the source document, or the builder's
      // own placeholder. In-card "see below/above" in long answers is fine.
      if ((a.length < 250 && /\bsee\s+(the\s+)?(chart|table|diagram|notes?|below|above)\b/i.test(a))
          || a.includes('(see Scripture references)')) {
        flag('STUB_ANSWER', c, a.slice(0, 80).replace(/\n/g, ' / '));
      }

      // Enumeration questions ("What were the solas…?", "List…") whose
      // derived teaser expounds only the FIRST part: the teaser should name
      // every part. Heuristic: ≥3 top-level items and the teaser never
      // mentions the lead of the last one.
      if (!c.summary && /(what (are|were)|name (the|them)|list |how many|(three|four|five|seven|ten) )/i.test(q)) {
        const items = lines.filter(l => /^(- |\d+\.|[a-z]\.|\*\*)/.test(l) || /^[A-Z][^.!?]{0,45}[-–—:]\s/.test(l));
        if (items.length >= 3) {
          const teaser = summarize(c);
          const last = items[items.length - 1].replace(/^(- |\d+\.|[a-z]\.)\s*/, '');
          const lastLead = (last.match(/^[\w'’]+(\s+[\w'’]+)?/) || [''])[0];
          // A "(+N more)" teaser already enumerates; items that are
          // standards/Scripture quotes are proofs, not enumerated parts.
          const proofLead = /^(WSC|WLC|WCF|[123]?\s?[A-Z][a-z]+\.?\s\d)/.test(last);
          if (lastLead && !proofLead && !/\(\+\d+ more\)_?$/.test(teaser)
              && !teaser.toLowerCase().includes(lastLead.toLowerCase().slice(0, 12))) {
            flag('ENUM_FIRST_ONLY', c, `items=${items.length}, teaser: ${teaser.slice(0, 70)}`);
          }
        }
      }

      // G: semicolon wall — a plain paragraph line chaining 3+ parallel
      // parts with top-level semicolons (outside parens/quotes) should be a
      // list (user-reported from real phone use). The first line is exempt
      // (bio cards open with an "epithet—dates; role" snapshot), as are
      // quoted standards and provenance-labeled lines.
      let firstPlain = true;
      for (const l of lines) {
        if (/^(\||>|[-•*]\s|\d+\.\s|[a-z][.)]\s|#)/.test(l)) continue;
        const isFirst = firstPlain; firstPlain = false;
        if (isFirst || /^(WSC|WLC|WCF|WSA|BCO|Note)\s*:/.test(l) || /^["“]/.test(l)) continue;
        let depth = 0, inq = false, semis = 0;
        for (const ch of l) {
          if (ch === '(') depth++;
          else if (ch === ')') depth = Math.max(0, depth - 1);
          else if (ch === '“') inq = true;
          else if (ch === '”') inq = false;
          else if (ch === '"') inq = !inq;
          else if (ch === ';' && depth === 0 && !inq) semis++;
        }
        if (semis >= 3) { flag('SEMICOLON_CHAIN', c, l.slice(0, 80)); break; }
      }

      // E: question is a fragment, not a prompt.
      if (/^\s*(cf\.|see |e\.g\.|i\.e\.|also |\[|\()/i.test(q) || /^[a-z]/.test(q.trim())) {
        flag('FRAGMENT_QUESTION', c, q.slice(0, 70));
      }

      // B-ish: answers so long they need an authored summary or a split.
      if (!c.summary && a.length > 2500) flag('LONG_NO_SUMMARY', c, `len ${a.length}`);
    }
  }
}

let total = 0;
for (const [kind, items] of Object.entries(flags)) {
  console.log(`\n== ${kind} (${items.length}) ==`);
  total += items.length;
  for (const it of items) console.log(`  ${it.id}\n     q: ${it.q}\n     ${it.detail}`);
}
console.log(`\n${total} flags`);
