// Repackages dist/index.html into a form the Artifact host accepts: no
// doctype, html, head or body wrapper, with the title first so it falls inside
// the host's 8KB title scan.
import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync('dist/index.html', 'utf8')
const pick = (re: RegExp) => src.match(re)?.[1] ?? ''
const title = pick(/<title>(.*?)<\/title>/s)
const styles = src.match(/<style[^>]*>[\s\S]*?<\/style>/g) ?? []
const scripts = src.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) ?? []
let body = pick(/<body[^>]*>([\s\S]*?)<\/body>/)
body = body.replace(/<script[\s\S]*?<\/script>/g, '').trim()

const out = [
  `<title>${title}</title>`,
  ...styles,
  '<style>html,body{height:100%;margin:0;overflow:hidden}#root{height:100vh}</style>',
  body,
  ...scripts,
].join('\n')

const dest = process.argv[2] ?? 'dist/artifact.html'
writeFileSync(dest, out)
console.log(`${dest}  ${(out.length / 1024 / 1024).toFixed(2)} MB, ${scripts.length} inline script(s), ${styles.length} style block(s)`)
if (!out.slice(0, 8192).includes('<title>')) { console.error('title outside the 8KB window'); process.exitCode = 1 }
if (/<script[^>]*\bsrc=/.test(src)) { console.error('build still references an external script'); process.exitCode = 1 }
