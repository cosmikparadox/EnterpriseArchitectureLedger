// Precomputed Monte Carlo frames, baked in at build time by npm run generate.
//
// Why this exists: opened as a file:// URL the browser refuses to start a module
// Web Worker from a blob, and it does so silently, with nothing logged. Views 3
// and 5 then wait for a result that never arrives. Spec section 2 promises the
// folder opens and works, so the tool carries a small set of stored runs and
// falls back to them when the worker does not answer.
//
// The frames are stored packed rather than as McResult objects because the full
// object is 196 KB of JSON per frame and ten frames would dominate the bundle.
// Packing drops the repeated keys, rounds every USD figure to the dollar, and
// replaces each exceedance probability with its index into the fixed grid the
// curve is sampled on. That is 14.9 KB per frame instead of 196 KB.
//
// The use case exceedance curves are dropped entirely. No view reads them; the
// use case entries keep their percentiles so a subdomain's sum of P99s is still
// present and the non-additivity gap still holds.

import type { EntityStats, McResult, SubdomainStats } from './montecarlo'

/** Must match the point count in montecarlo.ts exceedance(). */
export const EXCEEDANCE_POINTS = 140

export const PRECOMPUTED_RHOS = [0, 0.25, 0.5, 0.75, 1] as const
export const PRECOMPUTED_RUNS = 10_000

/** [mean, p50, p90, p99, probIndices, losses] */
export type PackedEntity = [number, number, number, number, number[], number[]]
/** [mean, p50, p90, p99, interruptProb] */
export type PackedUseCase = [number, number, number, number, number]
/** PackedEntity with the sum of member P99s appended. */
export type PackedSubdomain = [...PackedEntity, number]

export interface PackedFrame {
  rho: number
  p: PackedEntity[]
  u: PackedUseCase[]
  s: PackedSubdomain[]
}

export interface PrecomputedSet {
  runs: number
  nu: number
  seed: number
  /** Ids in frame order, so the frames themselves carry no strings. */
  platformIds: string[]
  useCaseIds: string[]
  subdomainIds: string[]
  frames: PackedFrame[]
}

/** Keyed by estate provenance.graph_version. */
export type PrecomputedIndex = Record<string, PrecomputedSet>

function probGrid(): number[] {
  const out: number[] = []
  for (let k = 0; k < EXCEEDANCE_POINTS; k++) out.push(Math.pow(10, -4 * (k / (EXCEEDANCE_POINTS - 1))))
  return out
}

export function packEntity(e: EntityStats): PackedEntity {
  const grid = probGrid()
  const idx: number[] = []
  const loss: number[] = []
  for (const pt of e.exceedance) {
    let best = 0
    let bestDist = Infinity
    for (let k = 0; k < grid.length; k++) {
      const d = Math.abs(grid[k]! - pt.prob)
      if (d < bestDist) { bestDist = d; best = k }
    }
    idx.push(best)
    loss.push(Math.round(pt.loss))
  }
  return [Math.round(e.mean), Math.round(e.p50), Math.round(e.p90), Math.round(e.p99), idx, loss]
}

export function packFrame(r: McResult): PackedFrame {
  return {
    rho: r.rho,
    p: r.platforms.map(packEntity),
    u: r.useCases.map((u) => [
      Math.round(u.mean), Math.round(u.p50), Math.round(u.p90), Math.round(u.p99),
      Math.round(u.interruptProb * 1e6) / 1e6,
    ] as PackedUseCase),
    s: r.subdomains.map((s) => [...packEntity(s), Math.round(s.sumOfP99s)] as PackedSubdomain),
  }
}

function unpackEntity(id: string, e: PackedEntity, grid: number[]): EntityStats {
  const [mean, p50, p90, p99, idx, loss] = e
  const exceedance = idx.map((k, i) => ({ loss: loss[i]!, prob: grid[k]! }))
  return { id, mean, p50, p90, p99, exceedance }
}

/**
 * Rebuild an McResult from a stored frame. elapsedMs is 0 because nothing ran.
 * Callers must label the result as stored rather than measured.
 */
export function unpackFrame(set: PrecomputedSet, frame: PackedFrame): McResult {
  const grid = probGrid()
  const subdomains: SubdomainStats[] = frame.s.map((s, i) => {
    const base = unpackEntity(set.subdomainIds[i]!, s.slice(0, 6) as PackedEntity, grid)
    const sumOfP99s = s[6]
    const jointP99 = base.p99
    return { ...base, jointP99, sumOfP99s, gap: jointP99 === 0 ? 0 : (sumOfP99s - jointP99) / jointP99 }
  })
  return {
    runs: set.runs,
    rho: frame.rho,
    nu: set.nu,
    seed: set.seed,
    elapsedMs: 0,
    platforms: frame.p.map((p, i) => unpackEntity(set.platformIds[i]!, p, grid)),
    useCases: frame.u.map((u, i) => ({
      id: set.useCaseIds[i]!,
      mean: u[0], p50: u[1], p90: u[2], p99: u[3],
      exceedance: [],
      interruptProb: u[4],
    })),
    subdomains,
  }
}

/** The stored rho closest to the one asked for. */
export function nearestFrame(set: PrecomputedSet, rho: number): PackedFrame {
  let best = set.frames[0]!
  for (const f of set.frames) if (Math.abs(f.rho - rho) < Math.abs(best.rho - rho)) best = f
  return best
}
