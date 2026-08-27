#!/usr/bin/env python3
"""
md2pdf_compact.py - convert Markdown to PDFs roughly 4-10x smaller than the
Chromium pipeline, by using the PDF base-14 fonts, which are never embedded.

`md2pdf.py` renders through headless Chromium, which always embeds a subset of
every font it uses. That costs a flat ~90 KB per document and cannot be undone
afterwards: the subsets are Identity-H CID fonts, so stripping the font program
leaves the text unmappable.

This renderer lays the text out directly with PyMuPDF using Times, Helvetica and
Courier. Embedded font bytes: zero. Fenced code keeps Courier, so ASCII tables
and diagrams hold their alignment.

Use it when file size is the binding constraint - transport through a size-capped
channel, email attachments, bulk archives. Use md2pdf.py when you want the full
CSS pipeline: syntax highlighting, KaTeX math, real tables, a cover page.

Usage:
    md2pdf_compact.py README.md
    md2pdf_compact.py docs/ -r -o out/
"""

from __future__ import annotations

import argparse
import glob
import re
import sys
from pathlib import Path

try:
    import pymupdf
except ImportError:
    sys.exit("md2pdf_compact: missing dependency PyMuPDF\nInstall with:\n    pip install pymupdf")

# Base-14 aliases. PyMuPDF does not embed these.
BODY, BOLD, MONO = "tiro", "hebo", "cour"

HEADING_SIZES = {1: 17.0, 2: 13.5, 3: 11.5}


def wrap(text: str, font: str, size: float, width: float) -> list[str]:
    lines, current = [], ""
    for word in text.split():
        candidate = (current + " " + word).strip()
        if pymupdf.get_text_length(candidate, font, size) <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [""]


def strip_inline(text: str) -> str:
    """Drop inline emphasis markers; this renderer draws a single weight per run."""
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"`(.+?)`", r"\1", text)
    return re.sub(r"(?<!\*)\*([^*]+?)\*(?!\*)", r"\1", text)


def render(markdown: str, dest: Path, opts) -> int:
    page_w, page_h = pymupdf.paper_size(opts.page_size)
    left, right = opts.margin_x, page_w - opts.margin_x
    doc = pymupdf.open()
    page, y = None, 0.0

    def new_page():
        nonlocal page, y
        page = doc.new_page(width=page_w, height=page_h)
        y = opts.margin_top

    def need(height: float):
        if page is None or y + height > page_h - opts.margin_bottom:
            new_page()

    new_page()
    in_fence, fence = False, []

    for raw in markdown.split("\n"):
        if raw.startswith("```"):
            if in_fence:
                for line in fence:
                    need(opts.mono_leading)
                    page.insert_text((left + 6, y + opts.mono_size * 0.92), line,
                                     fontname=MONO, fontsize=opts.mono_size)
                    y += opts.mono_leading
                y += 6
                fence, in_fence = [], False
            else:
                in_fence = True
            continue

        if in_fence:
            fence.append(raw.rstrip())
            continue

        line = raw.rstrip()

        heading = re.match(r"^(#{1,6})\s+(.*)", line)
        if heading:
            level = len(heading.group(1))
            size = HEADING_SIZES.get(level, opts.body_size)
            need(size * 2.2)
            y += size * 0.7
            for part in wrap(re.sub(r"[*`]", "", heading.group(2)), BOLD, size, right - left):
                need(size * 1.25)
                page.insert_text((left, y + size), part, fontname=BOLD, fontsize=size)
                y += size * 1.25
            y += size * 0.35
            continue

        if line.strip() == "---":
            need(14)
            page.draw_line((left, y + 5), (right, y + 5), color=(0.8, 0.83, 0.86), width=0.6)
            y += 13
            continue

        if not line.strip():
            y += 5
            continue

        bullet = re.match(r"^\s*[-*]\s+(.*)", line)
        indent = left + 14 if bullet else left
        text = strip_inline(bullet.group(1) if bullet else line)

        for i, part in enumerate(wrap(text, BODY, opts.body_size, right - indent)):
            need(opts.body_leading)
            if bullet and i == 0:
                page.insert_text((left + 4, y + opts.body_size), "•",
                                 fontname=BODY, fontsize=opts.body_size)
            page.insert_text((indent, y + opts.body_size), part,
                             fontname=BODY, fontsize=opts.body_size)
            y += opts.body_leading
        y += 3

    if not opts.no_page_numbers:
        total = doc.page_count
        for i, pg in enumerate(doc):
            pg.insert_text((page_w / 2 - 16, page_h - 28), f"{i + 1} of {total}",
                           fontname="helv", fontsize=8, color=(0.42, 0.46, 0.49))

    dest.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(dest), garbage=4, deflate=True, clean=True, use_objstms=1)
    return doc.page_count


def collect(patterns: list[str], recursive: bool) -> list[Path]:
    found: list[Path] = []
    for pattern in patterns:
        path = Path(pattern)
        if path.is_dir():
            globber = path.rglob if recursive else path.glob
            found.extend(sorted(p for p in globber("*.md") if p.is_file()))
            found.extend(sorted(p for p in globber("*.markdown") if p.is_file()))
        elif path.is_file():
            found.append(path)
        else:
            found.extend(sorted(Path(p) for p in glob.glob(pattern, recursive=recursive)
                                if Path(p).is_file()))
    seen, unique = set(), []
    for path in found:
        key = path.resolve()
        if key not in seen:
            seen.add(key)
            unique.append(path)
    return unique


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="md2pdf_compact",
        description="Convert Markdown to small PDFs using non-embedded base-14 fonts.")
    parser.add_argument("inputs", nargs="+")
    parser.add_argument("-o", "--output", default=".")
    parser.add_argument("-r", "--recursive", action="store_true")
    parser.add_argument("--page-size", default="a4", help="a4, letter, legal ... (default: a4)")
    parser.add_argument("--body-size", type=float, default=10.0)
    parser.add_argument("--body-leading", type=float, default=13.2)
    parser.add_argument("--mono-size", type=float, default=7.6)
    parser.add_argument("--mono-leading", type=float, default=9.6)
    parser.add_argument("--margin-x", type=float, default=54.0, help="points (default: 54 = 19mm)")
    parser.add_argument("--margin-top", type=float, default=54.0)
    parser.add_argument("--margin-bottom", type=float, default=50.0)
    parser.add_argument("--no-page-numbers", action="store_true")
    parser.add_argument("-q", "--quiet", action="store_true")
    opts = parser.parse_args(argv)

    sources = collect(opts.inputs, opts.recursive)
    if not sources:
        print("md2pdf_compact: no Markdown files matched", file=sys.stderr)
        return 1

    out_dir = Path(opts.output)
    failures = 0
    for index, source in enumerate(sources, 1):
        dest = out_dir / (source.stem + ".pdf")
        try:
            pages = render(source.read_text(encoding="utf-8", errors="replace"), dest, opts)
            if not opts.quiet:
                print(f"[{index}/{len(sources)}] {source.name} -> {dest.name} "
                      f"({pages} pages, {dest.stat().st_size / 1024:.0f} KB)")
        except Exception as exc:  # noqa: BLE001 - keep going through a batch
            failures += 1
            print(f"[{index}/{len(sources)}] {source.name}: FAILED - {exc}", file=sys.stderr)

    if not opts.quiet:
        print(f"\nDone: {len(sources) - failures} converted, {failures} failed -> {out_dir}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
