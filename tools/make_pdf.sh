#!/bin/sh
# Render RESULTS.md to RESULTS.pdf.
# ASCII boxed tables must stay monospace and unwrapped, so fenced code blocks
# are stashed before markdown conversion and restored as <pre> afterwards.
set -e
cd "$(dirname "$0")/.."
.venv312/bin/python tools/md2html.py RESULTS.md scratch/results.html
/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="$PWD/RESULTS.pdf" "file://$PWD/scratch/results.html"
