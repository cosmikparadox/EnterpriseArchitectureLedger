# md-to-pdf

A Claude Code plugin (and standalone script) that turns Markdown into typeset PDFs,
one file or a whole folder at a time.

```
Markdown --(markdown-it-py)--> HTML --(headless Chromium)--> PDF
```

## What it handles

- GitHub-flavoured Markdown: tables, footnotes, task lists, strikethrough, definition lists
- LaTeX math, rendered with KaTeX (`$inline$` and `$$display$$`)
- Syntax-highlighted code blocks
- YAML front matter, feeding an optional cover page
- Auto-generated table of contents
- Running headers and `n of m` page-number footers
- A print stylesheet tuned for long-form documents, replaceable or extendable

## Install

```bash
pip install -r skills/md-to-pdf/scripts/requirements.txt
python -m playwright install chromium   # skip if Chromium is already installed
```

## Use

```bash
python skills/md-to-pdf/scripts/md2pdf.py README.md
python skills/md-to-pdf/scripts/md2pdf.py docs/ -r -o pdfs/
python skills/md-to-pdf/scripts/md2pdf.py thesis.md -o out/ --title-page --toc
```

`--help` lists every option. See [`skills/md-to-pdf/SKILL.md`](skills/md-to-pdf/SKILL.md)
for the full reference.

## Use as a Claude Code plugin

The repository is a plugin: `.claude-plugin/plugin.json` plus the skill in `skills/`.
Installed or checked out, Claude picks up the `md-to-pdf` skill and will use it when
you ask for a Markdown file to be turned into a PDF.

## Markdown in Google Drive

[`skills/md-to-pdf/scripts/drive_md2pdf.gs`](skills/md-to-pdf/scripts/drive_md2pdf.gs)
is a Google Apps Script that converts every `.md` in one Drive folder into PDFs in
another, entirely inside Google — nothing is downloaded or re-uploaded, so there is no
file-size ceiling. Setup instructions are in the file header. It is idempotent and
resumable: re-run it and it skips what already exists.

For the highest fidelity — real KaTeX math and syntax highlighting — convert locally
with `md2pdf.py` instead and upload the PDFs.

## Layout

```
.claude-plugin/plugin.json          plugin manifest
skills/md-to-pdf/
  SKILL.md                          skill definition and reference
  assets/default.css                print stylesheet
  scripts/md2pdf.py                 the converter
  scripts/drive_md2pdf.gs           in-Drive bulk conversion
  scripts/requirements.txt          Python dependencies
```
