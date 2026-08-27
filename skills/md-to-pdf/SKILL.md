---
name: md-to-pdf
description: Convert Markdown files into typeset PDFs, singly or in bulk. Use when the user wants a .md turned into a PDF, asks to "export/render/print markdown to PDF", needs a PDF of a README, spec, report, thesis, or research paper, or wants a folder of Markdown converted. Also covers converting Markdown held in Google Drive.
---

# Markdown to PDF

Converts Markdown to PDF via `markdown-it-py` (GitHub-flavoured Markdown) rendered
through headless Chromium. Handles tables, footnotes, task lists, definition lists,
YAML front matter, LaTeX math (KaTeX), syntax-highlighted code, an auto-generated
table of contents, a title page, and running headers with page numbers.

## Setup

Once per machine:

```bash
pip install -r <skill-dir>/scripts/requirements.txt
python -m playwright install chromium   # skip if Chromium is already present
```

The script finds a browser automatically. Override with `MD2PDF_CHROMIUM=/path/to/chrome`
if needed. KaTeX is downloaded on first use with math and cached under `~/.cache/md2pdf`.

## Usage

```bash
# one file into the current directory
python scripts/md2pdf.py README.md

# a whole folder, recursively, into ./pdfs
python scripts/md2pdf.py docs/ -r -o pdfs/

# a long document with a cover page and contents
python scripts/md2pdf.py thesis.md -o out/ --title-page --toc

# glob, US paper, custom stylesheet
python scripts/md2pdf.py "notes/*.md" -o out/ --page-size Letter --css house-style.css
```

Each input produces `<name>.pdf` in the output directory. A batch keeps going when a
single file fails; the exit code is non-zero if any did. `--manifest out.json` records
what was produced.

### Options worth knowing

| Option | Effect |
|---|---|
| `--toc` / `--toc-depth N` / `--toc-min-level N` | Insert a table of contents |
| `--title-page` | Cover page built from YAML front matter |
| `--title` / `--header` | Override the document title / running header |
| `--no-page-numbers` | Drop the running header and page-number footer |
| `--page-size` / `--landscape` | A4 (default), A5, A3, Letter, Legal |
| `--margin-x` / `--margin-top` / `--margin-bottom` | Page margins |
| `--theme` / `--css` | Replace or extend the stylesheet |
| `--no-math` | Leave `$...$` as literal text |

### Front matter

`title`, `subtitle`, `author`, `version`, `date`, and `status` feed the cover page and
the running header. Without front matter the title falls back to the first `#` heading,
then to the filename.

## Styling

`assets/default.css` is a print stylesheet tuned for long documents. Copy it and pass
`--theme mine.css` to replace it wholesale, or `--css extra.css` to layer overrides on
top. Page size and margins come from the CLI, not the stylesheet — do not set `@page`
margins in a theme, as they override the CLI values.

## Markdown in Google Drive

Two routes, depending on where the work should happen.

**Convert inside Drive (no download).** `scripts/drive_md2pdf.gs` is a Google Apps
Script that converts every `.md` in one Drive folder and writes the PDFs to another,
entirely server-side. Setup instructions are in the file header. It is idempotent and
resumable, so re-running it after the six-minute execution limit picks up where it
stopped. Use this for bulk conversion — no file-size ceiling.

**Convert locally (higher fidelity).** Download the Markdown, run `md2pdf.py`, upload
the PDFs. This is the route that renders LaTeX math and syntax highlighting properly.

Note for agents working through a Drive connector: PDFs must be uploaded as base64 in
a tool argument, which is impractical beyond very small files. Prefer the Apps Script
for bulk work rather than attempting to shuttle PDF bytes through tool calls.
