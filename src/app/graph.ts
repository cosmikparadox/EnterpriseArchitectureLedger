// Turns an estate into the node and link arrays the 3D view draws, plus the
// derived per-node figures the detail panel shows.
//
// Spec hard rule A and trap list section 12: vendors are landscape furniture.
// Platform and integration nodes are GREY. Only use cases and their subdomain
// hulls carry colour, and colour is never the only carrier: node shape and the
// label carry the same information.

import { makeRng } from '../model/rng'
import type { AllocationRule, Estate } from '../model/types'
import {
  buildIndex, edgeSpend, meteredSpend, ruleShare, c1, reportedCost,
  kCommitted, executionComponent, type Index,
} from '../model/ledger'

export type NodeKind = 'platform' | 'integration' | 'use_case'

export interface GNode {
  id: string
  kind: NodeKind
  name: string
  subdomain?: string
  riders?: number
  val: number
  x?: number; y?: number; z?: number
  fx?: number; fy?: number; fz?: number
}

export interface GLink {
  source: string
  target: string
  ucId: string
  platformId: string
  spend: number
  units: number
  cfp: number
}

export interface GraphData { nodes: GNode[]; links: GLink[] }

/** Paul Tol's bright palette. Readable in both themes, and distinguishable by
 *  most common colour vision deficiencies. Subdomains only, never vendors. */
export const SUBDOMAIN_COLOUR: Record<string, string> = {
  sales: '#4477aa',
  claims: '#ee6677',
  finance: '#228833',
  service: '#ccbb44',
  people: '#66ccee',
  data: '#aa3377',
}
export const NEUTRAL = '#8b929c'
export const NEUTRAL_DIM = '#5d636c'

export function buildGraph(estate: Estate, ix: Index): GraphData {
  const nodes: GNode[] = []
  for (const p of estate.platforms) {
    const riders = ix.ridersOf.get(p.id)!.length
    nodes.push({
      id: p.id,
      kind: p.type,
      name: p.name,
      riders,
      // Fan-in drives size, because fan-in is the lesson. Cube root so a node
      // with four times the riders is not four times the radius.
      val: Math.cbrt(riders + 1) * 3.2,
    })
  }
  for (const u of estate.use_cases) {
    nodes.push({ id: u.id, kind: 'use_case', name: u.name, subdomain: u.subdomain, val: 2.1 })
  }
  const links: GLink[] = []
  for (const u of estate.use_cases) {
    for (const e of u.edges) {
      const p = ix.platformById.get(e.platform_id)!
      links.push({
        source: u.id,
        target: e.platform_id,
        ucId: u.id,
        platformId: e.platform_id,
        spend: edgeSpend(u, e, p),
        units: u.volume_per_month * e.driver_units_per_volume_unit,
        cfp: e.conditional_failure_prob,
      })
    }
  }
  seedPositions(nodes)
  return { nodes, links }
}

/** Seed for the layout. Distinct from the estate seed; it decides shape, not data. */
export const LAYOUT_SEED = 0x1ed9e4

/**
 * Give every node a starting position from a seeded generator.
 *
 * The force simulation is deterministic once the starting positions are, so
 * seeding them is what makes the graph settle into the same shape on every load
 * instead of a different one each time. That matters for three things: a tour
 * step can say "the node at the top" and be right, screenshots are comparable
 * between builds, and anyone reading this over someone's shoulder is looking at
 * the same picture.
 *
 * Points are placed on a Fibonacci sphere and then jittered, rather than drawn
 * uniformly at random. A uniform draw clumps, and d3 breaks ties between
 * coincident nodes with Math.random, which would put the non-determinism
 * straight back. The sphere spreads them; the jitter keeps the result from
 * looking like a lattice.
 */
function seedPositions(nodes: GNode[]): void {
  const rng = makeRng(LAYOUT_SEED)
  const n = nodes.length
  const golden = Math.PI * (3 - Math.sqrt(5))
  // Radius scaled to the node count so a small estate is not lost in a big shell.
  const radius = 26 * Math.cbrt(n)
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    const jitter = () => (rng.next() - 0.5) * radius * 0.18
    const node = nodes[i]!
    node.x = Math.cos(theta) * r * radius + jitter()
    node.y = y * radius + jitter()
    node.z = Math.sin(theta) * r * radius + jitter()
  }
}

// ---------------------------------------------------------------------------
// Derived figures for the detail panel
// ---------------------------------------------------------------------------

export interface PlatformView {
  id: string
  name: string
  category: string
  kind: NodeKind
  fixedPool: number
  driverName: string
  unitCost: number
  capacityNote: string
  riders: number
  subdomains: number
  meteredSpend: number
  ruleShareTotal: number
  c1: number
  lef: number
  lossMedian: number
  lossP90: number
  blastUseCases: number
  blastSubdomains: number
  blastVolume: number
  adoptedMonth: number
  kCommitted: number
  executionComponent: number
  counterfactualEvidenced: boolean
  counterfactualNote: string
}

export function platformView(ix: Index, id: string, rule: AllocationRule, monthsSinceAdopted: number): PlatformView {
  const p = ix.platformById.get(id)!
  const riders = ix.ridersOf.get(id)!
  const subs = new Set(riders.map((r) => r.uc.subdomain))
  const { mu, sigma } = p.failure_loss_lognormal
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    kind: p.type,
    fixedPool: p.fixed_pool_gbp_month,
    driverName: p.driver_name,
    unitCost: p.driver_unit_cost_gbp,
    capacityNote: p.capacity_note,
    riders: riders.length,
    subdomains: subs.size,
    meteredSpend: meteredSpend(ix, id),
    ruleShareTotal: riders.reduce((a, r) => a + ruleShare(ix, id, r.uc.id, rule), 0),
    c1: c1(ix, id),
    lef: p.failure_lef,
    // Lognormal: median is exp(mu); P90 is exp(mu + 1.2816 sigma).
    lossMedian: Math.exp(mu),
    lossP90: Math.exp(mu + 1.2815515655446004 * sigma),
    // Blast radius. Expected monthly business volume interrupted, which is what
    // spec section 5.1 asks for and is NOT the same as fan-in.
    blastUseCases: riders.length,
    blastSubdomains: subs.size,
    blastVolume: riders.reduce((a, r) => a + r.uc.volume_per_month * r.edge.conditional_failure_prob, 0),
    adoptedMonth: p.adopted_month,
    kCommitted: kCommitted(p, riders.length, monthsSinceAdopted),
    executionComponent: executionComponent(p, riders.length, monthsSinceAdopted),
    counterfactualEvidenced: p.counterfactual_evidenced,
    counterfactualNote: p.counterfactual_note,
  }
}

export interface UseCaseEdgeView {
  platformId: string
  platformName: string
  driverName: string
  units: number
  spend: number
  cfp: number
  reported: number
}

export interface UseCaseView {
  id: string
  name: string
  subdomain: string
  subdomainName: string
  volume: number
  edges: UseCaseEdgeView[]
  meteredPerUnit: number
  perUnitLow: number
  perUnitHigh: number
  perUnitCurrent: number
  strandedBy: string[]
}

const ALL_RULES: AllocationRule[] = ['equal', 'driver', 'by_volume', 'by_head']

export function useCaseView(ix: Index, id: string, rule: AllocationRule): UseCaseView {
  const u = ix.useCaseById.get(id)!
  const edges: UseCaseEdgeView[] = u.edges.map((e) => {
    const p = ix.platformById.get(e.platform_id)!
    return {
      platformId: p.id,
      platformName: p.name,
      driverName: p.driver_name,
      units: u.volume_per_month * e.driver_units_per_volume_unit,
      spend: edgeSpend(u, e, p),
      cfp: e.conditional_failure_prob,
      reported: reportedCost(ix, p.id, u.id, rule),
    }
  })
  const perUnit = (r: AllocationRule) =>
    u.volume_per_month === 0 ? 0 : u.edges.reduce((a, e) => a + reportedCost(ix, e.platform_id, u.id, r), 0) / u.volume_per_month
  const across = ALL_RULES.map(perUnit)
  const metered = edges.reduce((a, e) => a + e.spend, 0)
  return {
    id: u.id,
    name: u.name,
    subdomain: u.subdomain,
    subdomainName: ix.subdomainById.get(u.subdomain)?.name ?? u.subdomain,
    volume: u.volume_per_month,
    edges,
    meteredPerUnit: u.volume_per_month === 0 ? 0 : metered / u.volume_per_month,
    perUnitLow: Math.min(...across),
    perUnitHigh: Math.max(...across),
    perUnitCurrent: perUnit(rule),
    // Which platform exits would strand this use case. Spec section 5.2.
    strandedBy: u.edges.filter((e) => e.conditional_failure_prob >= 0.9).map((e) => ix.platformById.get(e.platform_id)!.name),
  }
}

export function makeIndex(estate: Estate): Index {
  return buildIndex(estate)
}

// ---------------------------------------------------------------------------
// Synthetic riders, for view 2's fan-in slider
// ---------------------------------------------------------------------------

/**
 * Returns a copy of the estate with `n` extra use cases riding `platformId`.
 *
 * Spec section 4.2: the fan-in slider "adds or removes synthetic use cases
 * riding a selected platform, live. Watch the rule share on every existing use
 * case move." Building a real estate rather than patching the arithmetic means
 * the graph, the rings, C1 and every per-use-case figure all move together and
 * cannot drift out of agreement.
 *
 * The added use cases are spread round-robin across the existing subdomains, so
 * that the prohibited by-headcount basis has something to bite on. Their volume
 * and driver intensity are the median of the node's existing riders, so they
 * look like more of the same rather than like outliers.
 */
export function withSyntheticRiders(estate: Estate, platformId: string, n: number): Estate {
  if (n <= 0) return estate
  const existing = estate.use_cases
    .map((u) => ({ u, e: u.edges.find((x) => x.platform_id === platformId) }))
    .filter((r): r is { u: typeof r.u; e: NonNullable<typeof r.e> } => r.e !== undefined)
  if (existing.length === 0) return estate

  const median = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b)
    return s.length % 2 ? s[(s.length - 1) / 2]! : (s[s.length / 2 - 1]! + s[s.length / 2]!) / 2
  }
  const vol = median(existing.map((r) => r.u.volume_per_month))
  const units = median(existing.map((r) => r.e.driver_units_per_volume_unit))
  const cfp = median(existing.map((r) => r.e.conditional_failure_prob))
  const subs = estate.subdomains.map((s) => s.id)

  const added = Array.from({ length: n }, (_, i) => ({
    id: `uc_added_${i + 1}`,
    name: `Added use case ${i + 1}`,
    subdomain: subs[i % subs.length]!,
    volume_per_month: Math.round(vol),
    adopted_month: 60,
    edges: [{
      platform_id: platformId,
      driver_units_per_volume_unit: units,
      conditional_failure_prob: cfp,
    }],
  }))
  return { ...estate, use_cases: [...estate.use_cases, ...added] }
}
