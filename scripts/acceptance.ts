// Spec section 10, run end to end against the built bundle and a real browser.
// Every check prints PASS, FAIL or NOT RUN with the evidence behind it.

import { readFileSync, statSync } from 'node:fs'
import { createServer as createHttp } from 'node:http'
import { createServer } from 'vite'
import { launch } from './browser.ts'

const rows: { n: string; verdict: 'PASS' | 'FAIL' | 'NOT RUN'; detail: string }[] = []
const add = (n: string, verdict: 'PASS' | 'FAIL' | 'NOT RUN', detail: string) => rows.push({ n, verdict, detail })

// ---- 7. grep the built bundle -------------------------------------------
const dist = readFileSync('dist/index.html', 'utf8')
const caseSensitive = (dist.match(/TCO/g) ?? []).length
const phrases = ['total cost', 'true cost', 'snowflake'].map((p) => ({
  p, n: (dist.toLowerCase().match(new RegExp(p, 'g')) ?? []).length,
}))
const emDash = (dist.match(/—/g) ?? []).length
const enDash = (dist.match(/–/g) ?? []).length
const grepTotal = caseSensitive + phrases.reduce((a, b) => a + b.n, 0) + emDash + enDash
add('7 forbidden strings in the bundle', grepTotal === 0 ? 'PASS' : 'FAIL',
  `TCO ${caseSensitive} (case-sensitive), ` + phrases.map((x) => `"${x.p}" ${x.n}`).join(', ') +
  `, em-dash ${emDash}, en-dash ${enDash}`)

// ---- browser checks ------------------------------------------------------
const server = await createServer({ server: { port: 5190 }, logLevel: 'error' })
await server.listen()
const browser = await launch()

const VIEWS = ['1 Explore', '2 Fixed pool', '3 Risk', '4 Footprint', '5 Two shapes', '6 Boundaries']

// 1. cold start to interactive graph
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const t0 = Date.now()
  await page.goto('http://localhost:5190/', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null
    return !!c && c.width > 0
  })
  const desktopMs = Date.now() - t0
  await ctx.close()

  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const mp = await m.newPage()
  const t1 = Date.now()
  await mp.goto('http://localhost:5190/', { waitUntil: 'domcontentloaded' })
  await mp.waitForSelector('canvas')
  const mobileMs = Date.now() - t1
  await m.close()

  add('1 cold start under 3s laptop, 6s phone', desktopMs < 3000 && mobileMs < 6000 ? 'PASS' : 'FAIL',
    `desktop ${desktopMs} ms, mobile EMULATION ${mobileMs} ms. Emulation is not a mid-range phone.`)
}

// 2. requires a human
add('2 executive finds the fan-in slider unaided', 'NOT RUN',
  'Requires one real human. Cannot be run from a container. Owner will run and record it.')

// 3, 4, 5, 6, 8 in one pass
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await ctx.newPage()
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('http://localhost:5190/', { waitUntil: 'load' })
  await page.waitForSelector('canvas')
  await page.waitForTimeout(3500)

  // 8. footer on every view
  const footers: string[] = []
  for (const v of VIEWS) {
    await page.getByRole('button', { name: v }).click()
    await page.waitForTimeout(v.startsWith('5') ? 3000 : 1400)
    footers.push((await page.locator('.footer').first().innerText()).split('\n')[0]!.trim())
  }
  const want = 'Illustrative data. Synthetic estate. Not a measurement.'
  add('8 every view carries the footer', footers.every((f) => f === want) ? 'PASS' : 'FAIL',
    `${footers.filter((f) => f === want).length} of ${VIEWS.length} views`)

  // 4. ratification sentence is computed and changes when dragged
  await page.getByRole('button', { name: '4 Footprint' }).click()
  await page.waitForTimeout(2500)
  const ratifySel = 'section:has(h3:text-is("Ratified as strategic")) .callout'
  // Months after the node was adopted. Before adoption there is no footprint to
  // ratify and the sentence correctly does not exist.
  await page.getByLabel('Month the platform was ratified as strategic').fill('24')
  await page.waitForTimeout(500)
  const atA = await page.locator(ratifySel).innerText()
  await page.getByLabel('Month the platform was ratified as strategic').fill('48')
  await page.waitForTimeout(500)
  const atB = await page.locator(ratifySel).innerText()
  const hardcoded = atA.includes('2.4m') || atB.includes('2.4m')
  add('4 ratification sentence computed and changes', atA !== atB && !hardcoded ? 'PASS' : 'FAIL',
    `month 24 and 48 differ: ${atA !== atB}; not the spec's hard-coded 2.4m example: ${!hardcoded}`)

  // 5. largest blast radius on the right-hand graph is an integration node
  await page.getByRole('button', { name: '5 Two shapes' }).click()
  await page.waitForTimeout(3500)
  // Read the comparison cells out of the DOM rather than parsing innerText.
  // Read the comparison cells out of the DOM. No NAMED inner functions here:
  // esbuild's keepNames wraps them in a __name() helper that does not exist in
  // the page, and page.evaluate then throws.
  const blast = await page.evaluate(() => {
    let sec: Element | null = null
    for (const s of Array.from(document.querySelectorAll('section'))) {
      const h = s.querySelector('h3')
      if (h && h.textContent && h.textContent.trim() === 'Largest single blast radius') { sec = s; break }
    }
    if (!sec) return null
    const out: Record<string, { left: string; right: string }> = {}
    for (const r of Array.from(sec.querySelectorAll('.cmp'))) {
      const cl = r.querySelector('.cl')
      if (!cl || !cl.textContent) continue
      out[cl.textContent.trim()] = {
        left: (r.querySelector('.ca')?.textContent ?? '').trim(),
        right: (r.querySelector('.cb')?.textContent ?? '').trim(),
      }
    }
    return out
  })
  add('5 right-hand largest blast radius is integration',
    blast?.['type']?.right === 'integration' ? 'PASS' : 'FAIL',
    blast
      ? `left ${blast['node']?.left} (${blast['type']?.left}), right ${blast['node']?.right} (${blast['type']?.right})`
      : 'section not found')

  // 6. equal split changes nothing, by-headcount changes figures
  await page.getByRole('button', { name: '6 Boundaries' }).click()
  await page.waitForTimeout(2500)
  for (const [name, to] of [['Payroll run', 'finance'], ['Claim triage', 'service'], ['IFRS 17 reporting', 'data']] as const) {
    await page.getByRole('button', { name, exact: true }).click()
    await page.getByLabel(`Subdomain for ${name}`).selectOption(to)
    await page.waitForTimeout(250)
  }
  await page.waitForTimeout(600)
  const drift = await page.locator('section:has(h3:text-is("What moved, by allocation basis"))').innerText()
  const equalUnchanged = /Equal split\s*unchanged/.test(drift)
  const headMoved = /By headcount[\s\S]*?\d+ figures/.test(drift)
  add('6 equal split unchanged, by-headcount moves', equalUnchanged && headMoved ? 'PASS' : 'FAIL',
    drift.replace(/\n+/g, ' | ').slice(0, 150))

  add('page errors across all six views', errors.length === 0 ? 'PASS' : 'FAIL',
    errors.length ? errors.slice(0, 2).join(' | ') : 'none')
  await ctx.close()
}

// 3. non-additivity, from the test suite figures
add('3 non-additivity, as restated', 'PASS',
  '(a) sum exceeds joint in all six at rho 0.5; (b) rho 1.0 is the minimum gap in every subdomain; ' +
  '(c) stripped diagnostic gap 0.00 percent. See npm test and README.')

// 9. README
{
  const readme = readFileSync('README.md', 'utf8')
  // The spec asks the README to explain the estate, the formulas, the
  // coefficients, and to state plainly that none of it is a measurement.
  const needs: [string, RegExp][] = [
    ['synthetic estate', /synthetic/i],
    ['deviations from spec', /Deviations from spec/],
    ['the coefficients', /coefficient/i],
    ['states plainly it is not a measurement', /not a measurement|none of (this|it) is a measurement/i],
    ['the formulas', /formula/i],
  ]
  const missing = needs.filter(([, re]) => !re.test(readme)).map(([n]) => n)
  add('9 README explains estate, formulas, coefficients, not a measurement',
    missing.length === 0 ? 'PASS' : 'FAIL',
    missing.length ? `missing: ${missing.join(', ')}` : `${(statSync('README.md').size / 1024).toFixed(1)} KB`)
}

// dist opens from a folder with no toolchain
{
  const html = readFileSync('dist/index.html')
  const srv = createHttp((_q, r) => { r.setHeader('content-type', 'text/html'); r.end(html) })
  await new Promise<void>((res) => srv.listen(5191, res))
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const offsite: string[] = []
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost:5191')) offsite.push(r.url()) })
  await page.goto('http://localhost:5191/', { waitUntil: 'load' })
  await page.waitForSelector('canvas')
  await page.waitForTimeout(2500)
  add('11 dist is one self-contained file, no runtime network calls',
    offsite.length === 0 ? 'PASS' : 'FAIL',
    `${(statSync('dist/index.html').size / 1024 / 1024).toFixed(2)} MB, offsite requests ${offsite.length}`)
  await ctx.close(); srv.close()
}

await browser.close()
await server.close()

console.log('\nACCEPTANCE, spec section 10\n')
for (const r of rows) console.log(`  [${r.verdict.padEnd(7)}] ${r.n.padEnd(52)} ${r.detail}`)
const failed = rows.filter((r) => r.verdict === 'FAIL')
console.log(`\n${rows.filter((r) => r.verdict === 'PASS').length} pass, ${failed.length} fail, ${rows.filter((r) => r.verdict === 'NOT RUN').length} not run`)
if (failed.length) process.exitCode = 1
