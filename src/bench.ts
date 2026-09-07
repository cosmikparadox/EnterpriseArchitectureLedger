// Timing harness for the Web Worker Monte Carlo, spec section 2 and build step
// 4c. Not part of the shipped app: bench.html is not an entry in the production
// build, so nothing here reaches dist/.
import estate from '../data/estate.json'
import type { McResult } from './model/montecarlo'

const out = document.getElementById('out')!
const worker = new Worker(new URL('./worker/mc.worker.ts', import.meta.url), { type: 'module' })

const lines: string[] = []
function log(s: string) { lines.push(s); out.textContent = lines.join('\n') }

function run(runs: number, rho: number, seed: number): Promise<McResult & { wallMs: number }> {
  return new Promise((resolve) => {
    const t0 = performance.now()
    const requestId = Math.random()
    const onMsg = (ev: MessageEvent) => {
      if (ev.data.requestId !== requestId) return
      worker.removeEventListener('message', onMsg)
      resolve({ ...ev.data.result, wallMs: performance.now() - t0 })
    }
    worker.addEventListener('message', onMsg)
    worker.postMessage({ requestId, estate, rho, nu: 4, runs, seed })
  })
}

async function main() {
  log('Web Worker Monte Carlo, deterministic seed 20260905')
  log('')

  // Determinism: the same seed must give the same answer twice.
  const a = await run(10_000, 0.5, 20260905)
  const b = await run(10_000, 0.5, 20260905)
  const same = JSON.stringify(a.subdomains.map((s) => s.p99)) === JSON.stringify(b.subdomains.map((s) => s.p99))
  log(`determinism, two runs at the same seed agree: ${same ? 'yes' : 'NO'}`)
  log('')

  log('runs      rho    wall ms   worker ms   under 2s')
  for (const runs of [10_000, 10_000, 10_000, 100_000]) {
    const r = await run(runs, 0.5, 20260905)
    const ok = runs === 10_000 ? (r.wallMs < 2000 ? 'PASS' : 'FAIL') : '-'
    log(`${String(runs).padStart(7)}   ${r.rho.toFixed(2)}   ${r.wallMs.toFixed(0).padStart(7)}   ${String(r.elapsedMs).padStart(9)}   ${ok}`)
  }
  log('')
  const r = await run(10_000, 0.5, 20260905)
  log('subdomain gaps at rho = 0.5, from the worker')
  for (const s of r.subdomains) {
    log(`  ${s.id.padEnd(10)} joint P99 ${Math.round(s.jointP99).toLocaleString('en-GB').padStart(9)}   sum of P99s ${Math.round(s.sumOfP99s).toLocaleString('en-GB').padStart(9)}   gap ${(s.gap * 100).toFixed(1)}%`)
  }
  log('')
  log('DONE')
}
main()
