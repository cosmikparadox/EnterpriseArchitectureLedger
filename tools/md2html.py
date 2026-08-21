import re, sys, markdown, html as ihtml

src = open(sys.argv[1]).read()
out = sys.argv[2]

# Protect fenced code blocks: they carry the ASCII boxed tables and must stay
# monospace and unwrapped.
blocks = []
def stash(m):
    blocks.append(m.group(1))
    return f"\n@@CODEBLOCK{len(blocks)-1}@@\n"
src = re.sub(r"```\n?(.*?)```", stash, src, flags=re.S)

body = markdown.markdown(src, extensions=["tables", "sane_lists"])

def restore(m):
    code = blocks[int(m.group(1))]
    return f'<pre class="ascii">{ihtml.escape(code.rstrip())}</pre>'
body = re.sub(r"<p>@@CODEBLOCK(\d+)@@</p>", restore, body)
body = re.sub(r"@@CODEBLOCK(\d+)@@", restore, body)

CSS = """
@page { size: A4; margin: 16mm 14mm 18mm 14mm;
        @bottom-center { content: counter(page); } }
* { box-sizing: border-box; }
body { font-family: Georgia,'Times New Roman',serif; font-size: 10.2pt;
       line-height: 1.45; color: #111; margin: 0; }
h1 { font-size: 19pt; margin: 0 0 4pt; line-height: 1.2;
     border-bottom: 2.5px solid #111; padding-bottom: 6pt; }
h2 { font-size: 13.5pt; margin: 20pt 0 6pt; padding-bottom: 3pt;
     border-bottom: 1px solid #bbb; page-break-after: avoid; }
h3 { font-size: 11.4pt; margin: 13pt 0 4pt; page-break-after: avoid; }
p { margin: 0 0 7pt; text-align: justify; }
ul,ol { margin: 0 0 8pt; padding-left: 17pt; }
li { margin-bottom: 3pt; }
strong { font-weight: 700; }
hr { border: none; border-top: 1px solid #ccc; margin: 15pt 0; }
code { font-family: 'DejaVu Sans Mono',Menlo,Consolas,monospace;
       font-size: 8.6pt; background: #f2f2f2; padding: 0.5pt 2.5pt;
       border-radius: 2px; }
pre.ascii { font-family: 'DejaVu Sans Mono',Menlo,Consolas,monospace;
       font-size: 7.9pt; line-height: 1.28; white-space: pre;
       background: #f7f7f7; border: 1px solid #ddd; border-left: 3px solid #555;
       padding: 7pt 9pt; margin: 8pt 0 10pt; overflow: visible;
       page-break-inside: avoid; }
blockquote { margin: 8pt 0 8pt 6pt; padding: 4pt 0 4pt 11pt;
       border-left: 3px solid #999; color: #333; font-style: italic; }
h1+p, h2+p { margin-top: 2pt; }
</style>"""

doc = f"""<!doctype html><html><head><meta charset="utf-8">
<title>Experiment 1 Results</title><style>{CSS}</head><body>
{body}
</body></html>"""
open(out, "w").write(doc)
print("wrote", out, len(doc), "bytes,", len(blocks), "code blocks preserved")
