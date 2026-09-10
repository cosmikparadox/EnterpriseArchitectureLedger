// Monte Carlo aggregation. Spec section 4.3 and the trap list in section 12:
// "Do not fake the Monte Carlo with a closed form. Run it."
//
// This module holds no DOM references so it can run inside a Web Worker and
// also be timed directly from Node.

import type { Estate } from './types'
import { buildIndex, failureThresholds, runOnce, type SimOptions } from './ledger'
import { makeRng } from './rng'

export interface McRequest {
  estate: Estate
  rho: number
  /** Student-t degrees of freedom. Canon 9.3.8 requires a tail-dependent family. */
  nu: number
  runs: number
  seed: number
  /** Use case ids for a bespoke joint exceedance curve. Spec section 4.3. */
  selection?: string[]
  /** Diagnostic only, never set from the interface. See SimOptions. */
  options?: SimOptions
}

export interface ExceedancePoint { loss: number; prob: number }

export interface EntityStats {
  id: string
  mean: number
  p50: number
  p90: number
  p99: number
  exceedance: ExceedancePoint[]
}

export interface SubdomainStats extends EntityStats {
  /** P99 of the within-run sum. Canon 9.8.3: legitimate, it is one joint draw. */
  jointP99: number
  /** Sum of per-use-case P99s. The illegitimate sum the exhibit exists to show. */
  sumOfP99s: number
  gap: number
}

export interface McResult {
  runs: number
  rho: number
  nu: number
  seed: number
  elapsedMs: number
  platforms: EntityStats[]
  useCases: (EntityStats & { interruptProb: number })[]
  subdomains: SubdomainStats[]
  selection?: EntityStats & { sumOfP99s: number; gap: number }
}

/**
 * Loss exceedance curve. Spec section 4.3: X axis GBP loss on a log scale,
 * Y axis probability of exceeding. Points are taken directly off the sorted
 * sample so the curve is the empirical distribution and not a fit.
 */
function exceedance(sortedAsc: Float64Array, points = 140): ExceedancePoint[] {
  const n = sortedAsc.length
  if (n === 0) return []
  const out: ExceedancePoint[] = []
  let lastLoss = -1
  for (let k = 0; k < points; k++) {
    // Log-spaced in exceedance probability, so the tail is well resolved.
    const prob = Math.pow(10, -4 * (k / (points - 1)))
    const idx = Math.min(n - 1, Math.max(0, Math.floor((1 - prob) * n)))
    const loss = sortedAsc[idx]!
    if (loss <= 0) continue
    if (loss === lastLoss) continue
    lastLoss = loss
    out.push({ loss, prob })
  }
  // Ascending in loss, descending in probability, which is how an exceedance
  // curve is read left to right.
  return out
}

function statsOf(id: string, sortedAsc: Float64Array, sum: number): EntityStats {
  const n = sortedAsc.length
  const pc = (q: number) => {
    const i = Math.min(n - 1, Math.max(0, Math.ceil(q * n) - 1))
    return sortedAsc[i]!
  }
  return { id, mean: n === 0 ? 0 : sum / n, p50: pc(0.5), p90: pc(0.9), p99: pc(0.99), exceedance: exceedance(sortedAsc) }
}

export function simulate(req: McRequest): McResult {
  const started = Date.now()
  const { estate, rho, nu, runs, seed, selection, options } = req
  const ix = buildIndex(estate)
  const thresholds = failureThresholds(estate.platforms, nu)
  const rng = makeRng(seed)

  const pIds = estate.platforms.map((p) => p.id)
  const uIds = estate.use_cases.map((u) => u.id)
  const sIds = estate.subdomains.map((s) => s.id)

  const pLoss = new Map(pIds.map((id) => [id, new Float64Array(runs)]))
  const uLoss = new Map(uIds.map((id) => [id, new Float64Array(runs)]))
  const sLoss = new Map(sIds.map((id) => [id, new Float64Array(runs)]))
  const selLoss = selection && selection.length > 0 ? new Float64Array(runs) : null
  const selSet = new Set(selection ?? [])

  const pSum = new Map(pIds.map((id) => [id, 0]))
  const uSum = new Map(uIds.map((id) => [id, 0]))
  const sSum = new Map(sIds.map((id) => [id, 0]))
  const uHits = new Map(uIds.map((id) => [id, 0]))
  let selSum = 0

  for (let i = 0; i < runs; i++) {
    const r = runOnce(ix, rho, nu, rng, thresholds, options)
    for (const [k, v] of r.platformLoss) { pLoss.get(k)![i] = v; pSum.set(k, pSum.get(k)! + v) }
    let sel = 0
    for (const [k, v] of r.useCaseLoss) {
      uLoss.get(k)![i] = v
      uSum.set(k, uSum.get(k)! + v)
      if (v > 0) uHits.set(k, uHits.get(k)! + 1)
      if (selSet.has(k)) sel += v
    }
    for (const [k, v] of r.subdomainLoss) { sLoss.get(k)![i] = v; sSum.set(k, sSum.get(k)! + v) }
    if (selLoss) { selLoss[i] = sel; selSum += sel }
  }

  for (const a of pLoss.values()) a.sort()
  for (const a of uLoss.values()) a.sort()
  for (const a of sLoss.values()) a.sort()
  if (selLoss) selLoss.sort()

  const useCases = uIds.map((id) => ({
    ...statsOf(id, uLoss.get(id)!, uSum.get(id)!),
    interruptProb: uHits.get(id)! / runs,
  }))
  const p99ByUc = new Map(useCases.map((u) => [u.id, u.p99]))

  const subdomains: SubdomainStats[] = sIds.map((id) => {
    const base = statsOf(id, sLoss.get(id)!, sSum.get(id)!)
    const members = estate.use_cases.filter((u) => u.subdomain === id)
    const sumOfP99s = members.reduce((a, u) => a + (p99ByUc.get(u.id) ?? 0), 0)
    const jointP99 = base.p99
    return { ...base, jointP99, sumOfP99s, gap: jointP99 === 0 ? 0 : (sumOfP99s - jointP99) / jointP99 }
  })

  const result: McResult = {
    runs, rho, nu, seed,
    elapsedMs: Date.now() - started,
    platforms: pIds.map((id) => statsOf(id, pLoss.get(id)!, pSum.get(id)!)),
    useCases,
    subdomains,
  }

  if (selLoss && selection) {
    const base = statsOf('selection', selLoss, selSum)
    const sumOfP99s = selection.reduce((a, id) => a + (p99ByUc.get(id) ?? 0), 0)
    result.selection = { ...base, sumOfP99s, gap: base.p99 === 0 ? 0 : (sumOfP99s - base.p99) / base.p99 }
  }
  return result
}
