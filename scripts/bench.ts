// Drives bench.html in a real browser and prints what it reports.
// Build step 4c: verify with a deterministic seed that 10k runs complete under
// two seconds. Timed in the browser, in an actual Web Worker, not in Node.
import { createServer } from 'vite'
import { launch, chromiumPath } from './browser.ts'

//
// The fold benchmark, audit brief v0.5 section 17.10: ten round trips, 3D to
// 2D to 3D, in headless Chromium, at desktop size and at 390 px, unthrottled
// and at a 4x CPU throttle. The fold needs the whole app, so it drives the
// explorer rather than bench.html. `--fold` runs only the fold benchmark.
import { writeFileSync } from 'node:fs'
import { foldBench } from './bench-fold.ts'

const server = await createServer({ server: { port: 5177 }, logLevel: 'error' })
await server.listen()
const browser = await launch()
const errors: string[] = []
if (!process.argv.includes('--fold')) {
  const page = await browser.newPage()
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('http://localhost:5177/bench.html')
  await page.waitForFunction(
    () => (document.getElementById('out')?.textContent ?? '').includes('DONE'),
    undefined,
    { timeout: 180_000 },
  )
  console.log(await page.locator('#out').textContent())
  await page.close()
}
const fold = await foldBench(browser, 'http://localhost:5177', errors)
console.log(fold.text)
const at = process.argv.find((a) => a.startsWith('--out='))
if (at) writeFileSync(at.slice(6), JSON.stringify(fold.rows, null, 2))
if (errors.length || !fold.pass) { console.error(errors.length ? `page errors: ${errors.join(' | ')}` : 'fold benchmark: a target was missed'); process.exitCode = 1 }
console.log(`\nbrowser: Chromium ${browser.version()} at ${chromiumPath()}`)
await browser.close()
await server.close()
