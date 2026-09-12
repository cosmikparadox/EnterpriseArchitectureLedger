// Sentences about one node, built from the data rather than written by hand.
//
// The intro lets you tap a dot, a circle or a coloured region and asks the card
// to say what it is. There is no prose about individual nodes anywhere in the
// estate, and there should not be: vendor names are landscape furniture here,
// grey and without adjectives, and a hand written line about a product would be
// the one place that rule slipped. So every description is assembled from what
// the data already says: what a use case handles, what it rides on, what it is
// told it costs, which dependency would take it down. Change the estate and the
// descriptions change with it.
//
// These return the values for fill(); the sentences live in the copy deck.

import type { AllocationRule } from './types'
import { c1, edgeSpend, meteredSpend, reportedCost, type Index } from './ledger'

const gbp = (n: number) => Math.round(n).toLocaleString('en-GB')
const num = (n: number) => Math.round(n).toLocaleString('en-GB')

/** "a, b and c", or "a, b, c and 4 more" past the cap. */
function list(names: string[], cap = 4): string {
  // "and 1 more" hides one name to save nothing; only cut when it saves two.
  if (names.length <= cap + 1) {
    if (names.length <= 1) return names[0] ?? ''
    return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]
  }
  return names.slice(0, cap).join(', ') + ' and ' + (names.length - cap) + ' more'
}

export function describeUseCase(ix: Index, id: string, rule: AllocationRule): Record<string, string | number> {
  const u = ix.useCaseById.get(id)!
  const sub = ix.estate.subdomains.find((s) => s.id === u.subdomain)
  const siblings = ix.estate.use_cases.filter((x) => x.subdomain === u.subdomain).length
  const platformsOf = u.edges.map((e) => ix.platformById.get(e.platform_id)!)
  const reported = u.edges.reduce((a, e) => a + reportedCost(ix, e.platform_id, u.id, rule), 0)
  const metered = u.edges.reduce((a, e) => a + edgeSpend(u, e, ix.platformById.get(e.platform_id)!), 0)
  const worst = u.edges.reduce((a, e) => (e.conditional_failure_prob > a.conditional_failure_prob ? e : a), u.edges[0]!)
  return {
    name: u.name,
    sub: sub?.name ?? u.subdomain,
    n_sub_uc: siblings,
    volume: num(u.volume_per_month),
    n_edges: u.edges.length,
    edge_list: list(platformsOf.map((p) => p.name)),
    reported: gbp(reported),
    metered: gbp(metered),
    worst: ix.platformById.get(worst.platform_id)?.name ?? worst.platform_id,
    worst_pct: Math.round(worst.conditional_failure_prob * 100),
  }
}

export function describePlatform(ix: Index, id: string, rule: AllocationRule): Record<string, string | number> {
  const p = ix.platformById.get(id)!
  const riders = ix.ridersOf.get(id) ?? []
  const subs = new Set(riders.map((r) => r.uc.subdomain))
  const byVolume = [...riders].sort((a, b) => b.uc.volume_per_month - a.uc.volume_per_month)
  const shareOfRiders = riders.length === 0 ? 0 : c1(ix, id) * 100
  return {
    name: p.name,
    category: p.category,
    kind: p.type === 'integration' ? 'connector' : 'platform',
    riders: riders.length,
    n_sub: subs.size,
    rider_list: list(byVolume.map((r) => r.uc.name)),
    pool: gbp(p.fixed_pool_gbp_month),
    metered: gbp(meteredSpend(ix, id)),
    driver: p.driver_name,
    c1: Math.round(shareOfRiders),
    capacity: p.capacity_note,
    _rule: rule,
  }
}

export function describeSubdomain(ix: Index, id: string): Record<string, string | number> {
  const s = ix.estate.subdomains.find((x) => x.id === id)!
  const ucs = ix.estate.use_cases.filter((u) => u.subdomain === id)
  const platforms = new Set(ucs.flatMap((u) => u.edges.map((e) => e.platform_id)))
  const shared = [...platforms].filter((pid) =>
    (ix.ridersOf.get(pid) ?? []).some((r) => r.uc.subdomain !== id)).length
  return {
    name: s.name,
    scope: s.scope,
    n_uc: ucs.length,
    volume: num(ucs.reduce((a, u) => a + u.volume_per_month, 0)),
    n_pf: platforms.size,
    n_shared: shared,
    uc_list: list(ucs.map((u) => u.name), 5),
  }
}

/** Values the intro's own sentences need, all from the estate. */
export function describeEstate(ix: Index): Record<string, string | number> {
  const e = ix.estate
  const platforms = e.platforms.filter((p) => p.type !== 'integration')
  const connectors = e.platforms.filter((p) => p.type === 'integration')
  const ridersOf = (pid: string) => ix.ridersOf.get(pid)?.length ?? 0
  const top = e.platforms.reduce((a, p) => (ridersOf(p.id) > ridersOf(a.id) ? p : a), e.platforms[0]!)
  const busiestUc = e.use_cases.reduce((a, u) => (u.edges.length > a.edges.length ? u : a), e.use_cases[0]!)
  return {
    org: e.label.split(',')[0]!,
    n_sub: e.subdomains.length,
    sub_list: list(e.subdomains.map((s) => s.name), 6),
    n_uc: e.use_cases.length,
    n_platforms: platforms.length,
    n_int: connectors.length,
    int_list: list(connectors.map((p) => p.name), 4),
    example_uc: busiestUc.name,
    example_n: busiestUc.edges.length,
    example_list: list(busiestUc.edges.map((x) => ix.platformById.get(x.platform_id)?.name ?? x.platform_id), 5),
    top: top.name,
    top_riders: ridersOf(top.id),
  }
}
