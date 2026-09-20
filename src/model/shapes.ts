// The two shapes, read the same way on both sides.
//
// Three entries per shape: the largest pool and its rule share (cost), the
// busiest node failing at the dependence under the slider (risk), and the
// largest execution component of leaving (exit). The story shows the three
// on both halves at once and the card quotes them, so they are computed
// here, once, and read by both.

import { c1, meteredSpend, workOfLeaving, type Index } from './ledger'
import { reachAt, sampleFailure, type Failure, type Reach } from './reach'
import type { Estate } from '../model/types'

/** The month the comparison is read at. */
export const SHAPES_AS_AT = 60
/** One failure per side, fixed, so the picture and the card agree. */
export const SHAPES_SEED = { left: 0x5eed, right: 0x5eef }

export interface ShapeEntry {
  topId: string
  topName: string
  riders: number
  pool: number
  metered: number
  c1: number
  failure: Failure | null
  reach: Reach | null
  affected: number
  exitId: string
  exitName: string
  exec: number
  exitRiders: string[]
}

export function shapeEntry(estate: Estate, ix: Index, rho: number, seed: number): ShapeEntry {
  const ranked = estate.platforms
    .map((p) => ({ p, n: ix.ridersOf.get(p.id)?.length ?? 0 }))
    .sort((a, b) => b.n - a.n || a.p.id.localeCompare(b.p.id))
  const top = ranked[0]!.p
  const failure = sampleFailure(ix, top.id, seed)
  const reach = failure ? reachAt(ix, failure, rho, seed ^ 0xc0de) : null
  const exits = estate.platforms
    .map((p) => { const n = ix.ridersOf.get(p.id)?.length ?? 0; return { p, exec: workOfLeaving(p, n, SHAPES_AS_AT - p.adopted_month) } })
    .sort((a, b) => b.exec - a.exec || a.p.id.localeCompare(b.p.id))
  const exit = exits[0]!
  return {
    topId: top.id,
    topName: top.name,
    riders: ranked[0]!.n,
    pool: top.fixed_pool_gbp_month,
    metered: meteredSpend(ix, top.id),
    c1: c1(ix, top.id),
    failure,
    reach,
    affected: reach ? reach.affected.size : 0,
    exitId: exit.p.id,
    exitName: exit.p.name,
    exec: exit.exec,
    exitRiders: (ix.ridersOf.get(exit.p.id) ?? []).map((r) => r.uc.id),
  }
}
