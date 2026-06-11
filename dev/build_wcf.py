#!/usr/bin/env python3
"""Generate js/data/wcf.js from the public-domain Westminster Confession PDF
at the repo root ("WCFScripureProofs2022.pdf", 33 chapters with Scripture
proofs). Same publisher layout as the Larger Catechism: 10pt main text, 8pt
proof footnotes at the bottom of each page, marker letters in the prose.

Run from the repo root:  python3 dev/build_wcf.py
Requires: pypdf  (pip install pypdf)
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_catechisms import (  # noqa: E402
    PdfReader, ROOT, tidy, join_wrapped, repair_split_words, first_citation,
    marker_pattern, WLC_PROOF_RE, _is_wordish,
    footnote_text_pool, find_footnote_split, parse_footnote_stream,
)

PDF = "WCFScripureProofs2022.pdf"
OUT = ROOT / "js" / "data" / "wcf.js"

CHAPTER_RE = re.compile(r"^\s*Chapter\s+(\d+)\s*$")
SECTION_RE = re.compile(r"^\s*(\d+)\s*\.\s+(.*)$")
# Running headers/footers and title-page furniture. Headers may combine the
# chapter and book title with a page number ("CHAPTER 11  THE CONFESSION OF
# FAITH  51"), so any line carrying either all-caps banner is dropped whole.
JUNK_RE = re.compile(r"^\s*(CHAPTER\s+\d+\s*\d*|\d+|The|Confession of\b.*)\s*$")
BANNER_RE = re.compile(r"(THE\s+CONFESSION\s+OF\s+F\s*AITH|CHAPTER\s+\d+)")


def wcf_streams():
    """Split each page (layout mode) into main lines and footnote lines."""
    main_lines = []   # (page_no, line)
    foot_lines = []   # (page_no, line)
    reader = PdfReader(str(ROOT / PDF))
    for page_no, page in enumerate(reader.pages, start=1):
        lines = (page.extract_text(extraction_mode="layout") or "").split("\n")
        lines = ["" if JUNK_RE.match(l) or BANNER_RE.search(l) else l for l in lines]
        m = next((i for i, l in enumerate(lines) if WLC_PROOF_RE.match(l)), None)
        if m is None:
            main_lines.extend((page_no, l) for l in lines)
            continue
        split = find_footnote_split(lines, m, footnote_text_pool(page))
        main_lines.extend((page_no, l) for l in lines[:split])
        foot_lines.extend((page_no, l) for l in lines[split:])
    return main_lines, foot_lines


def parse_chapters(main_lines):
    chapters = []   # {n, title, sections: [{n, lines: [(page,line)], refs: []}]}
    chapter = None
    section = None
    expecting_title = False
    for page_no, raw in main_lines:
        line = raw.rstrip()
        if not line.strip():
            continue
        cm = CHAPTER_RE.match(line)
        if cm:
            chapter = {"n": int(cm.group(1)), "title_lines": [], "sections": []}
            chapters.append(chapter)
            section = None
            expecting_title = True
            continue
        if chapter is None:
            continue
        sm = SECTION_RE.match(line)
        if sm and (expecting_title or section is not None):
            section = {"n": int(sm.group(1)), "alines": [[page_no, sm.group(2)]], "refs": []}
            chapter["sections"].append(section)
            expecting_title = False
            continue
        if expecting_title:
            chapter["title_lines"].append(line.strip())
        elif section is not None:
            section["alines"].append([page_no, line])
    for ch in chapters:
        ch["title"] = repair_split_words(tidy(" ".join(ch["title_lines"])))
        del ch["title_lines"]
    return chapters


def main():
    main_lines, foot_lines = wcf_streams()
    footnotes = parse_footnote_stream(foot_lines)
    chapters = parse_chapters(main_lines)

    # Page-local marker matching, ±1-page fallback, fused-marker recovery —
    # mirrors the Larger Catechism pipeline.
    by_page = {}
    for ch in chapters:
        for sec in ch["sections"]:
            for ln in sec["alines"]:
                by_page.setdefault(ln[0], []).append((sec, ln))
    matched = 0
    for page_no, letter, cite in footnotes:
        pat = marker_pattern(letter)
        fused = re.compile(r"([A-Za-z]+)" + re.escape(letter) + r"[´'’]*(?=[.,;:?!])")
        hit = False
        for pg in (page_no, page_no - 1, page_no + 1):
            for sec, ln in by_page.get(pg, []):
                m = pat.search(ln[1])
                if m:
                    ln[1] = ln[1][: m.start()] + (" " if m.group(1) else "") + ln[1][m.end():]
                else:
                    fm = fused.search(ln[1])
                    if not (fm and not _is_wordish(fm.group(1) + letter)
                            and _is_wordish(fm.group(1))):
                        continue
                    ln[1] = ln[1][: fm.start()] + fm.group(1) + ln[1][fm.end():]
                if cite and cite not in sec["refs"]:
                    sec["refs"].append(cite)
                matched += 1
                hit = True
                break
            if hit:
                break

    total_secs = 0
    for ch in chapters:
        for sec in ch["sections"]:
            total_secs += 1
            t = tidy(join_wrapped(l for _, l in sec["alines"]))
            t = re.sub(r"(?<=[.,;:?!])\s*[b-z][´'’]*(?=[\s)\]]|$)", "", t)
            sec["text"] = repair_split_words(tidy(t))
            del sec["alines"]

    problems = []
    if len(chapters) != 33:
        problems.append(f"expected 33 chapters, got {len(chapters)}")
    for idx, ch in enumerate(chapters, start=1):
        if ch["n"] != idx:
            problems.append(f"chapter numbering breaks at {idx} (saw {ch['n']})")
            break
        if not ch["title"].lower().startswith("of"):
            problems.append(f"chapter {ch['n']}: suspicious title {ch['title']!r}")
        if not ch["sections"]:
            problems.append(f"chapter {ch['n']}: no sections")
        for s_idx, sec in enumerate(ch["sections"], start=1):
            if sec["n"] != s_idx:
                problems.append(f"WCF {ch['n']}: section numbering breaks at {s_idx} (saw {sec['n']})")
                break
            if not sec["text"]:
                problems.append(f"WCF {ch['n']}.{sec['n']}: empty text")
    if problems:
        for p in problems:
            print("PROBLEM:", p)
        sys.exit(1)

    data = {
        "label": "Westminster Confession of Faith",
        "short": "WCF",
        "source": "Public-domain text with Scripture proofs (American revision)",
        "chapters": chapters,
    }
    js = (
        "// PCA Ordination & Licensure Study — Westminster Confession of Faith.\n"
        "// Generated by dev/build_wcf.py from the public-domain PDF at the repo\n"
        "// root. Do not hand-edit; re-run the generator instead.\n"
        "(function (global) {\n"
        "  global.PCA_WCF = "
        + json.dumps(data, ensure_ascii=False, indent=1)
        + ";\n"
        "})(typeof window !== 'undefined' ? window : globalThis);\n"
    )
    OUT.write_text(js, encoding="utf-8")
    print(f"WCF: {len(chapters)} chapters, {total_secs} sections, "
          f"{len(footnotes)} footnotes ({matched} matched)")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
