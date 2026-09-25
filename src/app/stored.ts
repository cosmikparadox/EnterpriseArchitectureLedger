// The stored Monte Carlo runs at the five fixed points of dependence, baked
// in by npm run generate. Read by the worker fallback, and by every figure
// that must be the same on every device: the dependence ranges, and the
// risk entry wherever no live run has landed yet.

import precomputedRaw from '../../data/precomputed.json?raw'
import type { McResult } from '../model/montecarlo'
import { nearestFrame, unpackFrame, type PrecomputedIndex } from '../model/precomputed'
import type { Estate } from '../model/types'

// Imported as text, not as JSON. Importing it as JSON makes the bundler emit
// 145 KB of object literals that every visitor's engine parses on startup, for
// data almost nobody needs. As a string it costs nothing until it is first
// read, and JSON.parse is then faster than the literal would have been.
// Acceptance check 1 is a 3 second cold start, and the eager form missed it.
let precomputedCache: PrecomputedIndex | null = null
export function precomputedIndex(): PrecomputedIndex {
  if (!precomputedCache) precomputedCache = JSON.parse(precomputedRaw) as PrecomputedIndex
  return precomputedCache
}

/** The stored frame at the fixed point nearest this dependence. */
export function storedFrame(estate: Estate, rho: number): McResult | null {
  const set = precomputedIndex()[estate.provenance.graph_version]
  return set ? unpackFrame(set, nearestFrame(set, rho)) : null
}

/** The stored frames at all five fixed points, in order of dependence. */
export function storedFrames(estate: Estate): McResult[] {
  const set = precomputedIndex()[estate.provenance.graph_version]
  return set ? set.frames.map((f) => unpackFrame(set, f)).sort((a, b) => a.rho - b.rho) : []
}

export interface FixedPoint { rho: number; sum: number; joint: number }
export interface FixedPointRange { points: FixedPoint[]; sumLo: number; sumHi: number; jointLo: number; jointHi: number }

/**
 * A domain's two bad-month figures at the five fixed points of dependence,
 * read from the stored runs, with the range each spans. The same on every
 * device and on every call, whatever the live runs are doing.
 */
export function fixedPointRange(estate: Estate, subdomain: string): FixedPointRange | null {
  const points = storedFrames(estate).map((f) => {
    const s = f.subdomains.find((x) => x.id === subdomain)
    return s ? { rho: f.rho, sum: s.sumOfP99s, joint: s.jointP99 } : null
  }).filter((x): x is FixedPoint => x !== null)
  if (points.length === 0) return null
  const sums = points.map((x) => x.sum), joints = points.map((x) => x.joint)
  return { points, sumLo: Math.min(...sums), sumHi: Math.max(...sums), jointLo: Math.min(...joints), jointHi: Math.max(...joints) }
}
