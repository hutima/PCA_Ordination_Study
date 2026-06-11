#!/usr/bin/env python3
"""Generate js/data/catechisms.js from the public-domain Westminster
catechism PDFs at the repo root (uploaded to main):

  - "Westminster shorter.pdf"                  -> WSC, 107 Q&A
  - "Larger Part 1.pdf" + "Larger part 2.pdf"  -> WLC, 196 Q&A

Layouts differ:
  WSC: each question's Scripture-proof footnotes immediately follow its
       answer and the marker letters restart at "a" per question.
  WLC: footnotes sit at the bottom of each printed page; marker letters run
       continuously across questions and cycle with prime marks (a..z, a'..).
       We therefore split each page into main text vs footnote block, then
       match answer markers to footnotes in global document order.

Footnote letters embedded in answers are stripped only when they match the
next expected footnote letter, so ordinary words (the article "a") survive.
Each footnote is reduced to its leading citation for the refs chips.

Run from the repo root:  python3 dev/build_catechisms.py
Requires: pypdf  (pip install pypdf)
"""
import json
import re
import sys
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    sys.exit("pypdf is required: pip install pypdf")

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "js" / "data" / "catechisms.js"

WSC_PDFS = ["Westminster shorter.pdf"]
WLC_PDFS = ["Larger Part 1.pdf", "Larger part 2.pdf"]

HEADER_RE = re.compile(
    r"^\s*(THE\s+(WESTMINSTER\s+)?(SHORTER|LARGER)\s+CATECHISM\s*\d*|\d+\s*(THE\s+(WESTMINSTER\s+)?(SHORTER|LARGER)\s+CATECHISM)?)\s*$",
    re.IGNORECASE,
)
Q_RE = re.compile(r"^\s*Q\.\s*(\d+)\s*\.\s*(.*)$")
A_RE = re.compile(r"^\s*A\.\s*(.*)$")
# Footnote line: "a Gen. 1:1 ..." (WSC) or "a.  Gen. 1:1. ..." / "a´. ..." (WLC).
PROOF_RE = re.compile(r"^\s*([a-z])([´'’]*)\.?\s+(?=[1-3]?\s?[A-Z])")
CITE_RE = re.compile(
    r"^([1-3]?\s?[A-Z][A-Za-z]+\.?(?:\s+of\s+[A-Z][a-z]+\.?)?\s+\d+(?::\d+)?(?:\s*[-–]\s*\d+)?(?:\s*,\s*\d+)?)"
)


def page_lines(name):
    reader = PdfReader(str(ROOT / name))
    for page in reader.pages:
        text = page.extract_text() or ""
        lines = []
        for raw in text.split("\n"):
            line = raw.strip()
            if not line or HEADER_RE.match(line):
                continue
            lines.append(line)
        yield lines


def tidy(s):
    s = re.sub(r"\s{2,}", " ", s).strip()
    s = re.sub(r"\s+([.,;:?!])", r"\1", s)
    s = re.sub(r",(?=[A-Za-z])", ", ", s)  # restore space lost at line joins
    return s


def first_citation(footnote_text):
    m = CITE_RE.match(footnote_text.strip())
    return tidy(m.group(1)) if m else None


# Candidate answer marker: a single letter (+ optional prime marks) directly
# after punctuation — attached ("ever.b") or space-separated (", a and") —
# followed by whitespace, a closing bracket, or end of text.
def marker_pattern(letter):
    return re.compile(
        r"(?<=[.,;:?!\)\]])(\s*)" + re.escape(letter) + r"[´'’]*(?=[\s)\]]|$)"
    )


def parse_questions(main_lines):
    """Parse Q/A items from a stream of main-text lines (no footnotes)."""
    items = []
    i, n = 0, len(main_lines)
    while i < n:
        qm = Q_RE.match(main_lines[i])
        if not qm:
            i += 1
            continue
        num = int(qm.group(1))
        qtext = [qm.group(2)]
        i += 1
        while i < n and not A_RE.match(main_lines[i]) and not Q_RE.match(main_lines[i]):
            qtext.append(main_lines[i])
            i += 1
        ans = []
        if i < n and A_RE.match(main_lines[i]):
            ans.append(A_RE.match(main_lines[i]).group(1))
            i += 1
        while i < n and not Q_RE.match(main_lines[i]):
            ans.append(main_lines[i])
            i += 1
        items.append({
            "n": num,
            "q": repair_split_words(tidy(join_wrapped(qtext))),
            "a": join_wrapped(ans),
        })
    # de-dup page-break repeats, keep first
    seen = {}
    for it in items:
        seen.setdefault(it["n"], it)
    return [seen[k] for k in sorted(seen)]


def build_wsc():
    """WSC: footnotes follow each answer; letters restart per question."""
    lines = []
    for p in WSC_PDFS:
        for pg in page_lines(p):
            lines.extend(pg)
    items = []
    i, n = 0, len(lines)
    while i < n:
        qm = Q_RE.match(lines[i])
        if not qm:
            i += 1
            continue
        num = int(qm.group(1))
        qtext = [qm.group(2)]
        i += 1
        while i < n and not A_RE.match(lines[i]) and not Q_RE.match(lines[i]):
            qtext.append(lines[i])
            i += 1
        ans = []
        if i < n and A_RE.match(lines[i]):
            ans.append(A_RE.match(lines[i]).group(1))
            i += 1
        while i < n and not Q_RE.match(lines[i]) and not PROOF_RE.match(lines[i]):
            ans.append(lines[i])
            i += 1
        proofs = []
        current = None
        while i < n and not Q_RE.match(lines[i]):
            pm = PROOF_RE.match(lines[i])
            if pm:
                if current is not None:
                    proofs.append(current)
                current = lines[i][pm.end():]
            elif current is not None:
                current += " " + lines[i]
            i += 1
        if current is not None:
            proofs.append(current)

        answer = " ".join(ans)
        for idx in range(len(proofs)):
            letter = chr(ord("a") + idx % 26)
            m = marker_pattern(letter).search(answer)
            if m:
                answer = answer[: m.start()] + (" " if m.group(1) else "") + answer[m.end():]
        refs = []
        for p in proofs:
            c = first_citation(p)
            if c and c not in refs:
                refs.append(c)
        items.append({"n": num, "q": tidy(" ".join(qtext)), "a": tidy(answer), "refs": refs})
    seen = {}
    for it in items:
        seen.setdefault(it["n"], it)
    out = [seen[k] for k in sorted(seen)]
    print(f"WSC: parsed {len(out)} questions ({out[0]['n']}..{out[-1]['n']})")
    return out


# WLC footnote line: "a.  Gen. 1:1. ..." — the period after the letter is
# mandatory, which keeps wrapped verse text ("a Spirit and ...") from being
# mistaken for a new footnote.
WLC_PROOF_RE = re.compile(r"^\s*([a-z])([´'’]*)\.\s+(?=[1-3]?\s?[A-Z])")
TITLE_RE = re.compile(r"THE\s+(WESTMINSTER\s+)?(LARGER|SHORTER)\s+CATECHISM", re.IGNORECASE)
ALPHABET = "abcdefghijklmnopqrstuvwxyz"

# Dictionary for repairing intra-word spaces that pypdf's layout mode inserts
# at kerning gaps ("tender ness", "perfor ming"). A pair is merged only when
# at least one half is not a word but the concatenation (or its stem) is.
try:
    from english_words import get_english_words_set
    _WORDS = get_english_words_set(["web2"], lower=True)
except ImportError:
    _WORDS = set()


def _is_wordish(w):
    w = w.lower().strip("’'")
    if w in _WORDS:
        return True
    for suf in ("s", "ed", "ing", "th", "eth", "est", "ly"):
        if w.endswith(suf):
            stem = w[: -len(suf)]
            if stem in _WORDS or (stem + "e") in _WORDS:
                return True
    return False


# Kerning splits where both halves happen to be real words, verified against
# the printed text ("be long upon the land" etc. are left alone).
SPLIT_OVERRIDES = {
    "inter mission": "intermission", "for mer": "former",
    "tender ness": "tenderness", "cor poral": "corporal", "ear nest": "earnest",
}


def repair_split_words(text):
    for k, v in SPLIT_OVERRIDES.items():
        text = re.sub(r"\b" + k + r"\b", v, text)
    if not _WORDS:
        return text
    tokens = text.split(" ")
    out = []
    i = 0
    while i < len(tokens):
        a, b = tokens[i], tokens[i + 1] if i + 1 < len(tokens) else None
        if (b and re.fullmatch(r"[A-Za-z]+", a) and re.fullmatch(r"[A-Za-z]+[.,;:?!]*", b)):
            b_word = re.match(r"[A-Za-z]+", b).group(0)
            merged = a + b_word
            # Fragment test uses raw membership (lenient stemming would let
            # fragments like "ments" pass); merged test may use stems.
            if ((a.lower() not in _WORDS or b_word.lower() not in _WORDS)
                    and _is_wordish(merged)):
                out.append(merged + b[len(b_word):])
                i += 2
                continue
        out.append(a)
        i += 1
    return " ".join(out)


def join_wrapped(lines):
    """Join wrapped lines into one string, repairing hyphenation breaks."""
    text = ""
    for line in lines:
        l = line.strip()
        if not l:
            continue
        if text.endswith("-"):
            text = text[:-1] + l
        else:
            text += (" " if text else "") + l
    return text


def letter_distance(prev, nxt):
    """Alphabet steps from prev to nxt, wrapping z->a (primes ignored)."""
    return (ALPHABET.index(nxt) - ALPHABET.index(prev)) % 26


def footnote_text_pool(page):
    """All footnote-sized (≤8.5pt) text on a page, whitespace-stripped.

    Used to decide whether a line above the first footnote marker is an
    unmarked continuation of the previous page's footnote (8pt) or main
    catechism/confession text (10pt) — pure text heuristics can't tell them
    apart, but font size can.
    """
    chunks = []
    def visitor(text, cm, tm, font_dict, font_size):
        t = text.strip()
        if t and abs(tm[0]) * (abs(cm[0]) or 1) <= 8.5:
            chunks.append(re.sub(r"\s+", "", t))
    page.extract_text(visitor_text=visitor)
    return "".join(chunks)


def parse_footnote_stream(foot_lines):
    """Parse an ordered stream of (page_no, line) footnote-block lines into
    ordered (page_no, letter, citation) entries.

    A marker-looking line is accepted as a new footnote when its letter is a
    plausible alphabet successor of either neighboring marker (the historic
    alphabet skips letters like j and v, and the lettering may restart at a
    chapter boundary) — a false positive inside quoted verse text breaks both
    neighbor relations and is treated as continuation text instead.
    """
    candidates = []  # (stream_idx, letter)
    stream = [(p, l) for p, l in foot_lines if l.strip()]
    for idx, (page_no, line) in enumerate(stream):
        pm = WLC_PROOF_RE.match(line)
        if pm:
            candidates.append((idx, pm.group(1)))
    accepted = set()
    for k, (idx, letter) in enumerate(candidates):
        prev_ok = k > 0 and 1 <= letter_distance(candidates[k - 1][1], letter) <= 4
        next_ok = k + 1 < len(candidates) and 1 <= letter_distance(letter, candidates[k + 1][1]) <= 4
        if prev_ok or next_ok or len(candidates) == 1:
            accepted.add(idx)
    footnotes = []
    current = None  # [page_no, letter, [lines]]
    for idx, (page_no, line) in enumerate(stream):
        pm = WLC_PROOF_RE.match(line)
        if pm and idx in accepted:
            if current is not None:
                footnotes.append((current[0], current[1], first_citation(join_wrapped(current[2]))))
            current = [page_no, pm.group(1), [line[pm.end():]]]
        elif current is not None:
            current[2].append(line)
    if current is not None:
        footnotes.append((current[0], current[1], first_citation(join_wrapped(current[2]))))
    return footnotes


def find_footnote_split(lines, first_marker, pool):
    """Index where a page's footnote block starts: the first marker line,
    extended upward over footnote-sized continuation lines (verified against
    the page's small-text pool) and the blanks between them."""
    split = first_marker
    for j in range(first_marker - 1, -1, -1):
        s = re.sub(r"\s+", "", lines[j])
        if not s:
            continue
        probe = s[:24] if len(s) >= 24 else s
        if len(probe) >= 8 and probe in pool:
            split = j
        else:
            break
    return split


def wlc_streams():
    """Split each WLC page (layout mode = visual order) into the main Q&A
    lines and the footnote block at the bottom of the page, both tagged with
    the page number.

    The footnote block starts at the first footnote-marker line; when the
    previous page broke off mid-footnote, the block opens with unmarked
    continuation lines, so we extend the split back to the blank separator
    line above the first marker.
    """
    main_lines = []   # (page_no, line)
    foot_lines = []   # (page_no, line)
    page_no = 0
    prev_page_norm = None
    for name in WLC_PDFS:
        reader = PdfReader(str(ROOT / name))
        for page in reader.pages:
            raw = page.extract_text(extraction_mode="layout") or ""
            # The two PDF parts overlap by one printed page — skip a page that
            # repeats the previous one so its questions aren't polluted.
            norm = re.sub(r"\s+", " ", raw).strip()
            if prev_page_norm is not None and norm == prev_page_norm:
                continue
            prev_page_norm = norm
            page_no += 1
            lines = raw.split("\n")
            lines = [l if not TITLE_RE.search(l) else "" for l in lines]
            m = next((i for i, l in enumerate(lines) if WLC_PROOF_RE.match(l)), None)
            if m is None:
                main_lines.extend((page_no, l) for l in lines)
                continue
            split = find_footnote_split(lines, m, footnote_text_pool(page))
            main_lines.extend((page_no, l) for l in lines[:split])
            foot_lines.extend((page_no, l) for l in lines[split:])
    return main_lines, foot_lines


def parse_wlc_questions(main_lines):
    """Parse Q/A items, keeping each answer as page-tagged lines."""
    items = []
    i, n = 0, len(main_lines)
    while i < n:
        qm = Q_RE.match(main_lines[i][1])
        if not qm:
            i += 1
            continue
        num = int(qm.group(1))
        qtext = [qm.group(2)]
        i += 1
        while i < n and not A_RE.match(main_lines[i][1]) and not Q_RE.match(main_lines[i][1]):
            qtext.append(main_lines[i][1])
            i += 1
        alines = []
        if i < n and A_RE.match(main_lines[i][1]):
            alines.append([main_lines[i][0], A_RE.match(main_lines[i][1]).group(1)])
            i += 1
        while i < n and not Q_RE.match(main_lines[i][1]):
            t = main_lines[i][1].strip()
            # skip ALL-CAPS section headings (e.g. WHAT MAN OUGHT TO BELIEVE…)
            if t and not (len(t) > 8 and re.fullmatch(r"[A-Z][A-Z ,;:'’\-]+", t)):
                alines.append([main_lines[i][0], main_lines[i][1]])
            i += 1
        items.append({"n": num, "q": repair_split_words(tidy(join_wrapped(qtext))),
                      "alines": alines, "refs": []})
    seen = {}
    for it in items:
        seen.setdefault(it["n"], it)
    return [seen[k] for k in sorted(seen)]


def build_wlc():
    """WLC: layout-mode page splitting; footnotes matched page-locally.

    In print, a proof footnote always sits on the same page as the marker
    letter it annotates, so matching never has to cross a page boundary and a
    glitch on one page cannot derail the rest of the document.
    """
    main_lines, foot_lines = wlc_streams()
    footnotes = parse_footnote_stream(foot_lines)
    items = parse_wlc_questions(main_lines)

    # Reading-order index of every answer line, grouped by page.
    by_page = {}
    for it in items:
        for ln in it["alines"]:
            by_page.setdefault(ln[0], []).append((it, ln))

    # Match each footnote to its marker on the same page; a footnote block
    # that spilled onto the next pypdf page is caught by the ±1-page fallback.
    # If the marker fused into the preceding word ("forevert."), accept it only
    # when removing the letter restores a dictionary word from a non-word.
    matched = 0
    for page_no, letter, cite in footnotes:
        pat = marker_pattern(letter)
        fused = re.compile(r"([A-Za-z]+)" + re.escape(letter) + r"[´'’]*(?=[.,;:?!])")
        hit = False
        for pg in (page_no, page_no - 1, page_no + 1):
            for it, ln in by_page.get(pg, []):
                m = pat.search(ln[1])
                if m:
                    ln[1] = ln[1][: m.start()] + (" " if m.group(1) else "") + ln[1][m.end():]
                else:
                    fm = fused.search(ln[1])
                    if not (fm and not _is_wordish(fm.group(1) + letter)
                            and _is_wordish(fm.group(1))):
                        continue
                    ln[1] = ln[1][: fm.start()] + fm.group(1) + ln[1][fm.end():]
                if cite and cite not in it["refs"]:
                    it["refs"].append(cite)
                matched += 1
                hit = True
                break
            if hit:
                break

    for it in items:
        a = tidy(join_wrapped(l for _, l in it["alines"]))
        # Scrub any orphan marker letters whose footnote we failed to pair —
        # a standalone b–z after punctuation (spaced or attached) is never
        # legitimate English.
        a = re.sub(r"(?<=[.,;:?!])\s*[b-z][´'’]*(?=[\s)\]]|$)", "", a)
        it["a"] = repair_split_words(tidy(a))
        del it["alines"]
    print(f"WLC: parsed {len(items)} questions ({items[0]['n']}..{items[-1]['n']}); "
          f"{len(footnotes)} footnotes, {matched} matched to answers")
    return items


def main():
    wsc = build_wsc()
    wlc = build_wlc()
    problems = []
    if len(wsc) != 107:
        problems.append(f"WSC expected 107 questions, got {len(wsc)}")
    if len(wlc) != 196:
        problems.append(f"WLC expected 196 questions, got {len(wlc)}")
    for label, items in (("WSC", wsc), ("WLC", wlc)):
        for idx, it in enumerate(items, start=1):
            if it["n"] != idx:
                problems.append(f"{label}: missing/misnumbered Q{idx} (saw {it['n']})")
                break
            if not it["q"] or not it["a"]:
                problems.append(f"{label} Q{it['n']}: empty question or answer")
    if problems:
        for p in problems:
            print("PROBLEM:", p)
        sys.exit(1)

    data = {
        "wsc": {
            "id": "wsc",
            "label": "Westminster Shorter Catechism",
            "short": "WSC",
            "source": "Public-domain text with Scripture proofs (American revision)",
            "items": wsc,
        },
        "wlc": {
            "id": "wlc",
            "label": "Westminster Larger Catechism",
            "short": "WLC",
            "source": "Public-domain text with Scripture proofs (American revision)",
            "items": wlc,
        },
    }
    js = (
        "// PCA Ordination & Licensure Study — Westminster Catechisms (full text).\n"
        "// Generated by dev/build_catechisms.py from the public-domain PDFs at the\n"
        "// repo root. Do not hand-edit; re-run the generator instead.\n"
        "(function (global) {\n"
        "  global.PCA_CATECHISMS = "
        + json.dumps(data, ensure_ascii=False, indent=1)
        + ";\n"
        "})(typeof window !== 'undefined' ? window : globalThis);\n"
    )
    OUT.write_text(js, encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} "
          f"({len(wsc)} WSC + {len(wlc)} WLC questions, {OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
