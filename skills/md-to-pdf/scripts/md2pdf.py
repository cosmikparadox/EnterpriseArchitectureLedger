#!/usr/bin/env python3
"""
md2pdf - convert Markdown files into typeset PDFs.

Pipeline:  Markdown --(markdown-it-py)--> HTML --(headless Chromium)--> PDF

Supports GitHub-flavoured Markdown (tables, footnotes, task lists, strikethrough),
YAML front matter, LaTeX math via KaTeX, syntax-highlighted code, an auto-generated
table of contents, a title page, and running headers/footers with page numbers.

Usage:
    md2pdf.py README.md
    md2pdf.py docs/ -o out/ --recursive --toc --title-page
    md2pdf.py "notes/*.md" -o pdfs/ --page-size Letter

See --help for the full option list.
"""

from __future__ import annotations

import argparse
import glob
import html as html_mod
import json
import os
import re
import shutil
import sys
import tempfile
import unicodedata
import urllib.request
from pathlib import Path

# --------------------------------------------------------------------------
# Dependencies
# --------------------------------------------------------------------------

REQUIRED = {
    "markdown_it": "markdown-it-py",
    "mdit_py_plugins": "mdit-py-plugins",
    "linkify_it": "linkify-it-py",
    "pygments": "Pygments",
    "playwright": "playwright",
    "yaml": "PyYAML",
}


def _check_deps() -> None:
    missing = []
    for module, package in REQUIRED.items():
        try:
            __import__(module)
        except ImportError:
            missing.append(package)
    if missing:
        sys.exit(
            "md2pdf: missing dependencies: %s\n"
            "Install them with:\n    pip install %s"
            % (", ".join(missing), " ".join(missing))
        )


_check_deps()

import yaml  # noqa: E402
from markdown_it import MarkdownIt  # noqa: E402
from mdit_py_plugins.anchors import anchors_plugin  # noqa: E402
from mdit_py_plugins.deflist import deflist_plugin  # noqa: E402
from mdit_py_plugins.dollarmath import dollarmath_plugin  # noqa: E402
from mdit_py_plugins.footnote import footnote_plugin  # noqa: E402
from mdit_py_plugins.tasklists import tasklists_plugin  # noqa: E402
from pygments import highlight as _pyg_highlight  # noqa: E402
from pygments.formatters import HtmlFormatter  # noqa: E402
from pygments.lexers import get_lexer_by_name  # noqa: E402
from pygments.util import ClassNotFound  # noqa: E402

ASSETS = Path(__file__).resolve().parent.parent / "assets"
CACHE = Path(os.environ.get("MD2PDF_CACHE", Path.home() / ".cache" / "md2pdf"))

KATEX_VERSION = "0.16.11"
KATEX_CDN = f"https://cdn.jsdelivr.net/npm/katex@{KATEX_VERSION}/dist"


# --------------------------------------------------------------------------
# Chromium discovery
# --------------------------------------------------------------------------

def find_chromium() -> str | None:
    """Locate a Chromium/Chrome binary, preferring an explicit override."""
    override = os.environ.get("MD2PDF_CHROMIUM")
    if override and Path(override).exists():
        return override

    roots = [os.environ.get("PLAYWRIGHT_BROWSERS_PATH"), "/opt/pw-browsers"]
    for root in roots:
        if not root or not Path(root).is_dir():
            continue
        for pattern in ("chromium-*/chrome-linux/chrome", "chromium/chrome-linux/chrome"):
            hits = sorted(Path(root).glob(pattern))
            if hits:
                return str(hits[-1])

    for name in ("chromium", "chromium-browser", "google-chrome", "google-chrome-stable"):
        found = shutil.which(name)
        if found:
            return found
    return None  # fall back to Playwright's own bundled browser


# --------------------------------------------------------------------------
# KaTeX (downloaded once, then cached locally)
# --------------------------------------------------------------------------

def _fetch(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(url, timeout=45) as response:
        dest.write_bytes(response.read())


def ensure_katex(quiet: bool = False) -> Path | None:
    """Make sure KaTeX (js, css, web fonts) is present in the cache directory."""
    root = CACHE / f"katex-{KATEX_VERSION}"
    css = root / "katex.min.css"
    js = root / "katex.min.js"
    auto = root / "auto-render.min.js"

    if css.exists() and js.exists() and auto.exists():
        return root

    if not quiet:
        print(f"  fetching KaTeX {KATEX_VERSION} (one-off, cached in {CACHE})", file=sys.stderr)
    try:
        for name, target in (
            ("katex.min.css", css),
            ("katex.min.js", js),
            ("contrib/auto-render.min.js", auto),
        ):
            _fetch(f"{KATEX_CDN}/{name}", target)

        # The stylesheet references its web fonts relatively; pull those too.
        text = css.read_text(encoding="utf-8")
        fonts = sorted(set(re.findall(r"url\((fonts/[^)]+?\.woff2)\)", text)))
        for font in fonts:
            _fetch(f"{KATEX_CDN}/{font}", root / font)
    except Exception as exc:  # noqa: BLE001 - degrade gracefully, never crash a build
        if not quiet:
            print(f"  warning: could not fetch KaTeX ({exc}); math will render as plain text",
                  file=sys.stderr)
        return None
    return root


# --------------------------------------------------------------------------
# Markdown -> HTML
# --------------------------------------------------------------------------

def _slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_-]+", "-", text) or "section"


def _highlight_code(code: str, lang: str, _attrs) -> str:
    """Return highlighted HTML, or '' to let markdown-it apply default escaping."""
    if not lang:
        return ""
    try:
        lexer = get_lexer_by_name(lang.strip().lower())
    except ClassNotFound:
        return ""
    # markdown-it only accepts the result verbatim when it starts with <pre>; anything
    # else gets wrapped in another <pre><code>, which would nest two code boxes.
    inner = _pyg_highlight(code, lexer, HtmlFormatter(nowrap=True))
    return f'<pre class="highlight"><code>{inner}</code></pre>'


def build_parser() -> MarkdownIt:
    md = (
        MarkdownIt("commonmark", {"html": True, "linkify": True, "typographer": True,
                                  "highlight": _highlight_code})
        .enable(["table", "strikethrough", "linkify"])
        .use(footnote_plugin)
        .use(deflist_plugin)
        .use(tasklists_plugin, enabled=True)
        .use(dollarmath_plugin, allow_space=True, double_inline=True)
        .use(anchors_plugin, max_level=4, slug_func=_slugify, permalink=False)
    )

    # Emit math as KaTeX auto-render delimiters rather than pre-rendered markup.
    # markdown-it-py binds render rules as renderer methods, hence the leading `self`.
    def _inline_math(self, tokens, idx, options, env):
        return '<span class="math-inline">\\(' + html_mod.escape(tokens[idx].content) + "\\)</span>"

    def _block_math(self, tokens, idx, options, env):
        return '<div class="math-block">\\[' + html_mod.escape(tokens[idx].content) + "\\]</div>\n"

    md.add_render_rule("math_inline", _inline_math)
    md.add_render_rule("math_inline_double", _block_math)
    md.add_render_rule("math_block", _block_math)
    md.add_render_rule("math_block_label", _block_math)
    return md


FRONT_MATTER = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.DOTALL)


def split_front_matter(text: str) -> tuple[dict, str]:
    match = FRONT_MATTER.match(text)
    if not match:
        return {}, text
    try:
        data = yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError:
        return {}, text
    if not isinstance(data, dict):
        return {}, text
    return data, text[match.end():]


def extract_headings(md: MarkdownIt, text: str) -> list[tuple[int, str, str]]:
    """Return (level, anchor_id, plain_text) for each heading, in document order."""
    out = []
    tokens = md.parse(text)
    for i, token in enumerate(tokens):
        if token.type != "heading_open":
            continue
        level = int(token.tag[1])
        anchor = token.attrGet("id") or ""
        title = tokens[i + 1].content if i + 1 < len(tokens) else ""
        title = re.sub(r"[*_`~]", "", title).strip()
        if anchor and title:
            out.append((level, anchor, title))
    return out


def render_toc(headings: list[tuple[int, str, str]], min_level: int, max_level: int) -> str:
    items = [h for h in headings if min_level <= h[0] <= max_level]
    if not items:
        return ""

    parts = ['<nav class="toc"><h2>Contents</h2>']
    current = None
    for level, anchor, title in items:
        if current is None:
            parts.append("<ul>")
            current = level
        elif level > current:
            parts.append("<ul>" * (level - current))
            current = level
        elif level < current:
            parts.append("</ul>" * (current - level))
            current = level
        parts.append(
            f'<li class="toc-l{level}"><a href="#{anchor}">{html_mod.escape(title)}</a></li>'
        )
    if current is not None:
        parts.append("</ul>" * (current - min_level + 1))
    parts.append("</nav>")
    return "".join(parts)


def humanise(stem: str) -> str:
    """Turn 'Part_IX_Mathematics_v3_1c' into 'Part IX Mathematics v3.1c'."""
    name = stem.replace("_", " ").replace("-", " ")
    name = re.sub(r"\bv(\d+) (\d+)([a-z]?)\b", r"v\1.\2\3", name)
    return re.sub(r"\s+", " ", name).strip()


def document_title(meta: dict, headings: list, path: Path) -> str:
    for key in ("title", "Title"):
        if meta.get(key):
            return str(meta[key])
    for level, _anchor, text in headings:
        if level == 1:
            return text
    return humanise(path.stem)


# --------------------------------------------------------------------------
# HTML assembly
# --------------------------------------------------------------------------

PAGE_SIZES = {  # width x height in mm
    "A4": (210, 297),
    "A5": (148, 210),
    "A3": (297, 420),
    "Letter": (215.9, 279.4),
    "Legal": (215.9, 355.6),
}


def build_html(body: str, *, title: str, css: str, katex_root: Path | None,
               has_math: bool, toc_html: str, title_page_html: str,
               base_href: str, page_css: str) -> str:
    head = [
        '<meta charset="utf-8">',
        f"<title>{html_mod.escape(title)}</title>",
        f'<base href="{html_mod.escape(base_href)}">',
    ]

    if has_math and katex_root:
        katex_uri = katex_root.as_uri()
        head.append(f'<link rel="stylesheet" href="{katex_uri}/katex.min.css">')
        head.append(f'<script defer src="{katex_uri}/katex.min.js"></script>')
        head.append(f'<script defer src="{katex_uri}/auto-render.min.js"></script>')

    style = f"<style>\n{page_css}\n{HtmlFormatter().get_style_defs('.highlight')}\n{css}\n</style>"

    script = ""
    if has_math and katex_root:
        script = """
<script>
window.__mathReady = false;
window.addEventListener('load', function () {
  try {
    renderMathInElement(document.body, {
      delimiters: [
        {left: '\\\\[', right: '\\\\]', display: true},
        {left: '\\\\(', right: '\\\\)', display: false}
      ],
      throwOnError: false,
      errorColor: '#a33',
      strict: false
    });
  } catch (e) { /* leave the raw TeX visible rather than failing the render */ }
  window.__mathReady = true;
});
</script>"""
    elif has_math:
        script = "<script>window.__mathReady = true;</script>"

    return (
        "<!doctype html>\n<html><head>"
        + "".join(head)
        + style
        + "</head><body>"
        + title_page_html
        + toc_html
        + '<main class="doc">'
        + body
        + "</main>"
        + script
        + "</body></html>"
    )


def build_title_page(title: str, meta: dict) -> str:
    subtitle = meta.get("subtitle") or meta.get("description") or ""
    rows = []
    for label, keys in (
        ("Author", ("author", "authors", "by")),
        ("Version", ("version", "revision")),
        ("Date", ("date", "updated")),
        ("Status", ("status",)),
    ):
        for key in keys:
            if meta.get(key):
                value = meta[key]
                if isinstance(value, (list, tuple)):
                    value = ", ".join(str(v) for v in value)
                rows.append(f"<div><strong>{label}:</strong> {html_mod.escape(str(value))}</div>")
                break

    return (
        '<section class="title-page">'
        f'<div class="doc-title">{html_mod.escape(title)}</div>'
        + (f'<div class="doc-subtitle">{html_mod.escape(str(subtitle))}</div>' if subtitle else "")
        + (f'<div class="doc-meta">{"".join(rows)}</div>' if rows else "")
        + "</section>"
    )


# --------------------------------------------------------------------------
# Conversion
# --------------------------------------------------------------------------

def collect_inputs(patterns: list[str], recursive: bool) -> list[Path]:
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


def convert(page, source: Path, dest: Path, opts, md: MarkdownIt,
            css: str, katex_root: Path | None) -> None:
    raw = source.read_text(encoding="utf-8", errors="replace")
    meta, text = split_front_matter(raw)

    headings = extract_headings(md, text)
    title = opts.title or document_title(meta, headings, source)

    body = md.render(text)
    # linkify renders bare URLs as <a href="X">X</a>; tag them so the print
    # stylesheet does not append the href a second time.
    body = re.sub(r'<a href="([^"]+)">\1</a>', r'<a href="\1" class="bare-url">\1</a>', body)
    has_math = "math-inline" in body or "math-block" in body

    toc_html = render_toc(headings, opts.toc_min_level, opts.toc_depth) if opts.toc else ""
    title_page_html = build_title_page(title, meta) if opts.title_page else ""

    width, height = PAGE_SIZES.get(opts.page_size, PAGE_SIZES["A4"])
    if opts.landscape:
        width, height = height, width

    page_css = f"@page {{ size: {width}mm {height}mm; }}"

    document = build_html(
        body,
        title=title,
        css=css,
        katex_root=katex_root,
        has_math=has_math,
        toc_html=toc_html,
        title_page_html=title_page_html,
        base_href=source.resolve().parent.as_uri() + "/",
        page_css=page_css,
    )

    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False,
                                     dir=source.resolve().parent, encoding="utf-8") as handle:
        handle.write(document)
        tmp_html = Path(handle.name)

    try:
        page.goto(tmp_html.as_uri(), wait_until="load")
        if has_math and katex_root:
            try:
                page.wait_for_function("window.__mathReady === true", timeout=30000)
            except Exception:  # noqa: BLE001 - render anyway rather than lose the document
                pass
        page.emulate_media(media="print")

        header = '<div></div>'
        footer = '<div></div>'
        if not opts.no_page_numbers:
            running = html_mod.escape(opts.header if opts.header is not None else title)
            header = (
                '<div style="font-family:Helvetica,Arial,sans-serif;font-size:7.5pt;color:#8a939b;'
                'width:100%;padding:0 14mm;display:flex;justify-content:flex-end;">'
                f"<span>{running}</span></div>"
            )
            footer = (
                '<div style="font-family:Helvetica,Arial,sans-serif;font-size:8pt;color:#6b757e;'
                'width:100%;padding:0 14mm;text-align:center;">'
                '<span class="pageNumber"></span> of <span class="totalPages"></span></div>'
            )

        dest.parent.mkdir(parents=True, exist_ok=True)
        page.pdf(
            path=str(dest),
            width=f"{width}mm",
            height=f"{height}mm",
            print_background=True,
            display_header_footer=not opts.no_page_numbers,
            header_template=header,
            footer_template=footer,
            margin={
                "top": opts.margin_top,
                "bottom": opts.margin_bottom,
                "left": opts.margin_x,
                "right": opts.margin_x,
            },
            prefer_css_page_size=False,
        )
    finally:
        tmp_html.unlink(missing_ok=True)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="md2pdf",
        description="Convert Markdown files into typeset PDFs.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("inputs", nargs="+", help="Markdown files, directories, or glob patterns")
    parser.add_argument("-o", "--output", default=".",
                        help="output directory for the PDFs (default: current directory)")
    parser.add_argument("-r", "--recursive", action="store_true",
                        help="descend into subdirectories when an input is a directory")
    parser.add_argument("--css", help="extra stylesheet appended after the theme")
    parser.add_argument("--theme", help="replace the built-in theme with this stylesheet")
    parser.add_argument("--toc", action="store_true", help="insert a table of contents")
    parser.add_argument("--toc-depth", type=int, default=3, help="deepest heading in the ToC (default: 3)")
    parser.add_argument("--toc-min-level", type=int, default=2, help="shallowest heading in the ToC (default: 2)")
    parser.add_argument("--title-page", action="store_true", help="prepend a title page")
    parser.add_argument("--title", help="override the document title")
    parser.add_argument("--header", help="running header text (default: the document title)")
    parser.add_argument("--no-page-numbers", action="store_true",
                        help="omit the running header and page-number footer")
    parser.add_argument("--page-size", default="A4", choices=sorted(PAGE_SIZES),
                        help="page size (default: A4)")
    parser.add_argument("--landscape", action="store_true", help="landscape orientation")
    parser.add_argument("--margin-x", default="18mm", help="left/right margin (default: 18mm)")
    parser.add_argument("--margin-top", default="20mm", help="top margin (default: 18mm)")
    parser.add_argument("--margin-bottom", default="16mm", help="bottom margin (default: 16mm)")
    parser.add_argument("--no-math", action="store_true", help="skip KaTeX; leave math as raw TeX")
    parser.add_argument("--manifest", help="write a JSON summary of the conversion to this path")
    parser.add_argument("-q", "--quiet", action="store_true", help="suppress progress output")
    opts = parser.parse_args(argv)

    sources = collect_inputs(opts.inputs, opts.recursive)
    if not sources:
        print("md2pdf: no Markdown files matched", file=sys.stderr)
        return 1

    theme_path = Path(opts.theme) if opts.theme else ASSETS / "default.css"
    if not theme_path.exists():
        print(f"md2pdf: theme not found: {theme_path}", file=sys.stderr)
        return 1
    css = theme_path.read_text(encoding="utf-8")
    if opts.css:
        css += "\n" + Path(opts.css).read_text(encoding="utf-8")

    katex_root = None if opts.no_math else ensure_katex(opts.quiet)

    md = build_parser()
    out_dir = Path(opts.output)
    out_dir.mkdir(parents=True, exist_ok=True)

    from playwright.sync_api import sync_playwright

    results, failures = [], 0
    chromium_path = find_chromium()

    with sync_playwright() as pw:
        launch_kwargs = {"args": ["--no-sandbox", "--font-render-hinting=none"]}
        if chromium_path:
            launch_kwargs["executable_path"] = chromium_path
        browser = pw.chromium.launch(**launch_kwargs)
        page = browser.new_page()
        try:
            for index, source in enumerate(sources, 1):
                dest = out_dir / (source.stem + ".pdf")
                try:
                    convert(page, source, dest, opts, md, css, katex_root)
                    size = dest.stat().st_size
                    results.append({"source": str(source), "pdf": str(dest), "bytes": size})
                    if not opts.quiet:
                        print(f"[{index}/{len(sources)}] {source.name} -> {dest.name} "
                              f"({size / 1024:.0f} KB)")
                except Exception as exc:  # noqa: BLE001 - keep going through a batch
                    failures += 1
                    results.append({"source": str(source), "error": str(exc)})
                    print(f"[{index}/{len(sources)}] {source.name}: FAILED - {exc}", file=sys.stderr)
        finally:
            browser.close()

    if opts.manifest:
        Path(opts.manifest).write_text(json.dumps(results, indent=2), encoding="utf-8")

    if not opts.quiet:
        ok = len(results) - failures
        print(f"\nDone: {ok} converted, {failures} failed -> {out_dir}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
