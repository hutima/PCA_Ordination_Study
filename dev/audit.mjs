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
