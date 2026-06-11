#!/usr/bin/env python3
"""Build js/data/subjects/sacraments.js from the extracted Sacraments source.

The source is unnumbered Q&A (question lines + answer prose/lists/tables, no
explicit numbering and word-wrapped). Strategy: reflow wrapped physical lines
into logical lines (breaking after '?', on list markers, headers, and table
rows), then classify each logical line as section header / question / title-card
/ standards-citation / answer content, and assemble cards.

Run: python3 dev/build_sacraments.py
"""
import re, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'source_materials/extracted/sacraments.txt')
OUT = os.path.join(ROOT, 'js/data/subjects/sacraments.js')

INTERROG = (r'What|Why|How|Who|Whom|Where|When|Which|Whose|Does|Do|Did|Is|Are|'
            r'Was|Of|Can|Could|Would|Should|Will|Distinguish|Explain|Defend|'
            r'Name|List|Describe|Give|Unless|Identify|In what|Has|Have')
INTERROG_RE = re.compile(r'^(?:' + INTERROG + r')\b')
LIST_RE = re.compile(r'^(\d+\.|[a-z]\.|[-•◦▪‹<]|i{1,3}\.|iv\.|v\.)\s')
ALLCAPS_RE = re.compile(r"^[A-Z][A-Z'’ .]{2,}$")
LABEL_RE = re.compile(r'^[A-Z][a-zA-Z]{1,9}:')   # Note: Calvin: WSC: Luther:
TABLE_RE = re.compile(r'^\|')
TITLE_CARD_RE = re.compile(r'^(Four Views|Administration of|Administrating)\b')
STANDARDS_ONLY_RE = re.compile(r"^\(?(?:W(?:CF|LC|SC)\s*[\dIVXLC.\-,; ]+)+\)?\.?$", re.I)

DIRECTIVE_RE = re.compile(r'^(Explain|Defend|Distinguish|Describe|Identify|Give|Would|Unless)\b')

def starts_new(text):
    return bool(LIST_RE.match(text) or ALLCAPS_RE.match(text) or LABEL_RE.match(text)
                or INTERROG_RE.match(text) or TABLE_RE.match(text) or TITLE_CARD_RE.match(text))

def reflow(raw_lines):
    """Return list of logical-line strings, joining word-wrapped physical
    lines while keeping questions, list items, headers, and table rows apart."""
    logical = []
    buf = ''
    def flush():
        nonlocal buf
        if buf.strip():
            logical.append(re.sub(r'\s+', ' ', buf).strip())
        buf = ''
    for raw in raw_lines:
        s = raw.strip()
        if not s:
            flush(); continue
        if not buf:
            buf = s
            continue
        b = buf.rstrip()
        ends_q = b.endswith('?')
        # a completed question: contains '?', closes a sentence, and the next
        # line isn't a directive continuation (Explain/Defend/…)
        completed_q = ('?' in b) and b.endswith(('.', ';', ':')) and not DIRECTIVE_RE.match(s)
        is_title = bool(TITLE_CARD_RE.match(b))
        if ends_q or completed_q or is_title or starts_new(s):
            flush(); buf = s
        else:
            buf += ' ' + s
    flush()
    return logical

def merge_directive_continuations(logical):
    """Merge a directive line (Explain…/Defend…/Distinguish…) into the
    preceding question line so multi-sentence prompts stay together."""
    out = []
    for line in logical:
        if out and out[-1].rstrip().endswith('?') and \
           re.match(r'^(Explain|Defend|Distinguish|Describe|Identify|Give|Would|How)\b', line) and \
           line.rstrip().endswith('.') and len(line) < 90:
            out[-1] = out[-1] + ' ' + line
        else:
            out.append(line)
    return out

def is_question(line):
    return bool(INTERROG_RE.match(line)) and ('?' in line or line.rstrip().endswith(':'))

REF_RE = re.compile(r'W(?:CF|LC|SC)\s*[\dIVXLC]+(?:[.:]\d+)?(?:[-–]\d+)?(?:,\s*\d+[-–]?\d*)*')
SCRIP_RE = re.compile(r'\b(?:1|2|3)?\s?[A-Z][a-z]+\.?\s\d+:\d+(?:[-–]\d+)?(?:ff)?')
def extract_refs(text):
    refs = []
    for m in REF_RE.findall(text):
        r = re.sub(r'\s+', ' ', m).strip().rstrip(',.')
        if r and r not in refs:
            refs.append(r)
    return refs

def normalize_answer(lines):
    """lines: list of logical-line strings for an answer. Emit Markdown."""
    out = []
    i = 0
    while i < len(lines):
        s = lines[i]
        # table run
        if TABLE_RE.match(s):
            rows = []
            while i < len(lines) and TABLE_RE.match(lines[i]):
                cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                rows.append(cells)
                i += 1
            if rows:
                width = max(len(r) for r in rows)
                rows = [r + [''] * (width - len(r)) for r in rows]
                # merge word-wrap continuation rows (empty first cell) into the
                # previous row, cell by cell, so multi-line cells read cleanly
                merged = []
                for r in rows:
                    if merged and not r[0].strip() and any(c.strip() for c in r[1:]):
                        for ci in range(1, width):
                            if r[ci].strip():
                                merged[-1][ci] = (merged[-1][ci] + ' ' + r[ci]).strip()
                    else:
                        merged.append(list(r))
                rows = merged
                out.append('| ' + ' | '.join(rows[0]) + ' |')
                out.append('|' + '|'.join(['---'] * width) + '|')
                for r in rows[1:]:
                    out.append('| ' + ' | '.join(r) + ' |')
                out.append('')
            continue
        # bullets: • ◦ ▪ ‹ < → "- "
        m = re.match(r'^[•◦▪‹<]\s*(.*)$', s)
        if m:
            out.append('- ' + m.group(1)); i += 1; continue
        out.append(s); i += 1
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(out)).strip()

def slugify(q, n):
    base = re.sub(r'[^a-z0-9]+', '-', q.lower()).strip('-')[:40].rstrip('-')
    return f'sac-{n:03d}-{base}' if base else f'sac-{n:03d}'

SECTIONS = [
    ('sac-general', 'Sacraments — General', 1),
    ('sac-baptism', 'Baptism', 2),
    ('sac-supper', "The Lord's Supper", 3),
]

# Authored short summaries (the teaser shown before the "Full answer"
# expander) for cards whose answer is a table — a teaser derived line-by-line
# from table markup is unreadable. Keyed by generated card id.
SUMMARIES = {
    'sac-004-does-anything-really-happen-in-a-sacrame':
        ("Yes — by faith the sacraments are a means of grace: the Spirit nourishes "
         "the believer, strengthens faith, and gives assurance. More than a memorial, "
         "yet not by any power in the elements or the administrator's piety — only by "
         "the working of the Holy Ghost and the blessing of Christ who instituted them."),
    'sac-013-would-you-under-any-circumstances-baptiz':
        ("Yes — there is no prohibition, since the command is to wash with water in "
         "the triune name, not a method. But sprinkling is preferred and immersion "
         "unusual and improper, given the washing/sprinkling imagery of the OT "
         "purification rituals (Heb 9:10, 19-22; cf. 1 Cor 6:9-11)."),
    'sac-025-how-do-the-sacraments-agree-how-are-they':
        ("- Agree — God is the author, Christ the spiritual benefit; sign and "
         "seal of the same covenant, by a minister of the gospel, until Christ "
         "returns\n"
         "- Differ — water vs bread and wine; once vs often; "
         "ingrafting/regeneration vs spiritual nourishment and growth in Christ"),
}

def main():
    raw = open(SRC, encoding='utf-8').read().split('\n')
    logical = merge_directive_continuations(reflow(raw))

    sets = {k: {"label": l, "subject": "sacraments", "order": o, "cards": []}
            for k, l, o in SECTIONS}
    section = 'sac-general'
    cards = []
    cur = None  # (qtext, [answer lines])

    def close():
        nonlocal cur
        if cur:
            cards.append((section, cur[0], cur[1]))
        cur = None

    for line in logical:
        if line.startswith('Study Questions'):
            continue
        if line.startswith('Sacraments (W'):  # opening section ref
            continue
        if ALLCAPS_RE.match(line):
            close()
            up = line.upper()
            if up.startswith('BAPTISM'):
                section = 'sac-baptism'
            elif "LORD'S SUPPER" in up or 'LORD' in up and 'SUPPER' in up:
                section = 'sac-supper'
            continue
        if is_question(line) or TITLE_CARD_RE.match(line):
            close()
            cur = (line, [])
            continue
        if cur is None:
            continue
        if STANDARDS_ONLY_RE.match(line):
            # standalone citation → keep in answer too (context), refs picked up later
            cur[1].append(line); continue
        cur[1].append(line)
    close()

    n = 0
    seen = set()
    for sec, q, ans_lines in cards:
        n += 1
        a = normalize_answer(ans_lines)
        if not a.strip():
            # question with no answer captured — skip (likely a stray)
            continue
        cid = slugify(q, n)
        while cid in seen:
            cid += 'x'
        seen.add(cid)
        refs = extract_refs(q + ' ' + ' '.join(ans_lines))
        # strip a trailing standards citation from the displayed question
        qd = re.sub(r'\s+W(?:CF|LC|SC)\s*[\dIVXLC][\dIVXLC.:,\-– ]*$', '', q).rstrip()
        card = {"id": cid, "q": qd, "a": a, "refs": refs}
        if cid in SUMMARIES:
            card["summary"] = SUMMARIES[cid]
        sets[sec]['cards'].append(card)

    missing = set(SUMMARIES) - seen
    if missing:
        raise SystemExit(f'summary keys no longer match any card: {sorted(missing)}')

    # drop empty sets
    order = [k for k, _, _ in SECTIONS if sets[k]['cards']]
    sets = {k: sets[k] for k in order}

    header = ("// PCA Ordination & Licensure Study — Sacraments\n"
              "// Generated by dev/build_sacraments.py from\n"
              "// source_materials/extracted/sacraments.txt. Do not hand-edit.\n")
    js = header + "\n(function (global) {\n"
    js += "  const SETS = " + json.dumps(sets, ensure_ascii=False, indent=2) + ";\n\n"
    SUBJECT = {
        "id": "sacraments",
        "label": "Sacraments",
        "blurb": "Baptism and the Lord's Supper — signs, seals, and the views.",
        "order": 3,
        "setKeys": order,
    }
    js += "  const SUBJECT = " + json.dumps(SUBJECT, ensure_ascii=False) + ";\n\n"
    js += ("  const data = (global.PCA_DATA = global.PCA_DATA || { subjects: [], sets: {} });\n"
           "  Object.assign(data.sets, SETS);\n"
           "  if (!data.subjects.some(s => s.id === SUBJECT.id)) data.subjects.push(SUBJECT);\n"
           "})(typeof window !== 'undefined' ? window : globalThis);\n")
    open(OUT, 'w', encoding='utf-8').write(js)
    total = sum(len(s['cards']) for s in sets.values())
    print(f"wrote {OUT}: {total} cards in {len(sets)} sub-decks")
    for k in order:
        print(f"  {k}: {len(sets[k]['cards'])} cards")

if __name__ == '__main__':
    main()
