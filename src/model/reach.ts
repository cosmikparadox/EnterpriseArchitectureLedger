// A failure and how far it reaches.
//
// One sample: which of a platform's riders an outage interrupts, each edge
// by its conditional failure probability. Then the reach at a dependence:
// at the left end of the slider only the failed node's own riders go; as
// it moves right, the platforms those riders also ride go down with it,
// most shared first, and their riders go with them. The reach is the
// picture of what rho means; the figures on the card come from the
// simulation, not from this.

import { makeRng } from './rng'
import type { Index } from './ledger'

export interface Failure {
  platformId: string
  affected: Set<string>
  litLinks: Set<string>
  subdomains: Set<string>
  volume: number
}

export interface Reach {
  affected: Set<string>
  litLinks: Set<string>
  platforms: Set<string>
  hop: Map<string, number>
  subdomains: Set<string>
  volume: number
  reached: number
}

export function sampleFailure(ix: Index, platformId: string, seed: number): Failure | null {
  const p = ix.platformById.get(platformId)
  if (!p) return null
  const rng = makeRng(seed)
  const affected = new Set<string>()
  const litLinks = new Set<string>()
  const subdomains = new Set<string>()
  let volume = 0
  for (const r of ix.ridersOf.get(p.id) ?? []) {
    if (rng.next() < r.edge.conditional_failure_prob) {
      affected.add(r.uc.id)
      litLinks.add(`${r.uc.id}>${p.id}`)
      subdomains.add(r.uc.subdomain)
      volume += r.uc.volume_per_month
    }
  }
  return { platformId: p.id, affected, litLinks, subdomains, volume }
}

export function reachAt(ix: Index, failure: Failure, rho: number, seed: number): Reach {
  const affected = new Set(failure.affected)
  const litLinks = new Set(failure.litLinks)
  const hop = new Map<string, number>()
  const count = new Map<string, number>()
  for (const id of failure.affected) for (const e of ix.useCaseById.get(id)!.edges) if (e.platform_id !== failure.platformId) count.set(e.platform_id, (count.get(e.platform_id) ?? 0) + 1)
  const ranked = [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([id]) => id)
  const also = ranked.slice(0, Math.round(rho * ranked.length))
  const rng = makeRng(seed)
  for (const q of also) {
    hop.set(q, 1)
    for (const id of failure.affected) if (ix.useCaseById.get(id)!.edges.some((e) => e.platform_id === q)) { litLinks.add(`${id}>${q}`); hop.set(`${id}>${q}`, 1) }
    for (const r of ix.ridersOf.get(q) ?? []) {
      if (affected.has(r.uc.id)) continue
      if (rng.next() < r.edge.conditional_failure_prob) { affected.add(r.uc.id); litLinks.add(`${r.uc.id}>${q}`); hop.set(r.uc.id, 2); hop.set(`${r.uc.id}>${q}`, 2) }
    }
  }
  const subdomains = new Set([...affected].map((id) => ix.useCaseById.get(id)!.subdomain))
  const volume = [...affected].reduce((a, id) => a + ix.useCaseById.get(id)!.volume_per_month, 0)
  return { affected, litLinks, platforms: new Set(also), hop, subdomains, volume, reached: affected.size - failure.affected.size }
}
