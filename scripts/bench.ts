// Drives bench.html in a real browser and prints what it reports.
// Build step 4c: verify with a deterministic seed that 10k runs complete under
// two seconds. Timed in the browser, in an actual Web Worker, not in Node.
import { createServer } from 'vite'
import { launch, chromiumPath } from './browser.ts'

const server = await createServer({ server: { port: 5177 }, logLevel: 'error' })
await server.listen()
const browser = await launch()
const page = await browser.newPage()
const errors: string[] = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto('http://localhost:5177/bench.html')
await page.waitForFunction(
  () => (document.getElementById('out')?.textContent ?? '').includes('DONE'),
  undefined,
  { timeout: 180_000 },
)
console.log(await page.locator('#out').textContent())
if (errors.length) { console.error('page errors:', errors); process.exitCode = 1 }
console.log(`\nbrowser: Chromium ${browser.version()} at ${chromiumPath()}`)
await browser.close()
await server.close()
