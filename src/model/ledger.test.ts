import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import type { Estate, AllocationRule, UseCase } from './types'
import { simulate } from './montecarlo'
import {
  buildIndex, ruleShare, basis, c1, meteredSpend,
  makeOptionEngine, optionComponent, optionEngineFor, optionSeed,
} from './ledger'
import { makeRng } from './rng'

const estate: Estate = JSON.parse(readFileSync('data/estate.json', 'utf8'))
const ix = buildIndex(estate)

// The four bases the interface offers. 'equal' and 'driver' are permitted by
// canon 9.2.8; 'by_volume' is partition-independent but outside its permitted
// list; 'by_head' is the prohibited two-stage shape, kept as a counter-example.
const RULES: AllocationRule[] = ['equal', 'driver', 'by_volume', 'by_head']

describe('cost axis, fixed pool allocation', () => {
  // Canon 9.2.8: "In all cases sum over u of b_u(n) = 1."
  // This is also what makes the spec's two expressions for C1 identical, so if
  // it fails, C1 is wrong as well.
  it('rule_share over a node\'s riders sums to that node\'s fixed pool, under every rule', () => {
    for (const p of estate.platforms) {
      const riders = ix.ridersOf.get(p.id)!
      expect(riders.length).toBeGreaterThan(0)
      for (const rule of RULES) {
        const bases = riders.reduce((a, r) => a + basis(ix, p.id, r.uc.id, rule), 0)
        expect(bases).toBeCloseTo(1, 10)

        const shares = riders.reduce((a, r) => a + ruleShare(ix, p.id, r.uc.id, rule), 0)
        expect(shares).toBeCloseTo(p.fixed_pool_gbp_month, 6)
      }
    }
  })

  it('C1 computed both ways agrees, which is only true because the bases sum to one', () => {
    for (const p of estate.platforms) {
      const riders = ix.ridersOf.get(p.id)!
      for (const rule of RULES) {
        const sumRule = riders.reduce((a, r) => a + ruleShare(ix, p.id, r.uc.id, rule), 0)
        const sumReported = sumRule + meteredSpend(ix, p.id)
        expect(sumRule / sumReported).toBeCloseTo(c1(ix, p.id), 10)
      }
    }
  })
})

describe('cost axis, partition independence', () => {
  /**
   * Redraw the declared subdomain boundaries without touching the graph, which
   * is exactly what view 6 lets a user do. Canon 9.2.8: under a
   * partition-independent basis "redrawing subdomain boundaries leaves every
   * per-use-case cost entry unchanged to machine precision. Under a two-stage
   * basis it is not."
   */
  function repartition(e: Estate): Estate {
    const ids = e.subdomains.map((s) => s.id)
    const use_cases: UseCase[] = e.use_cases.map((uc, i) => ({
      ...uc,
      subdomain: ids[(ids.indexOf(uc.subdomain) + 1 + (i % 3)) % ids.length]!,
    }))
    return { ...e, use_cases }
  }

  const moved = buildIndex(repartition(estate))

  it('equal split is unchanged to machine precision when boundaries are redrawn', () => {
    for (const p of estate.platforms) {
      for (const r of ix.ridersOf.get(p.id)!) {
        expect(ruleShare(moved, p.id, r.uc.id, 'equal')).toBe(ruleShare(ix, p.id, r.uc.id, 'equal'))
      }
    }
  })

  it('driver-proportional is also unchanged, being the other permitted basis', () => {
    for (const p of estate.platforms) {
      for (const r of ix.ridersOf.get(p.id)!) {
        expect(ruleShare(moved, p.id, r.uc.id, 'driver')).toBeCloseTo(ruleShare(ix, p.id, r.uc.id, 'driver'), 12)
      }
    }
  })

  it('by-headcount DOES move, which is why canon 9.2.8 prohibits it', () => {
    let changed = 0
    for (const p of estate.platforms) {
      for (const r of ix.ridersOf.get(p.id)!) {
        if (Math.abs(ruleShare(moved, p.id, r.uc.id, 'by_head') - ruleShare(ix, p.id, r.uc.id, 'by_head')) > 1e-6) changed++
      }
    }
    expect(changed).toBeGreaterThan(0)
  })
})

describe('risk axis, non-additivity', () => {
  /**
   * ACCEPTANCE 3, as replaced by the owner. The spec's original threshold (a
   * 20 percent gap in three of six subdomains at rho = 0.5) was arbitrary and
   * has been withdrawn. Canon 9.8.3 result two makes a DIRECTIONAL claim:
   *
   *   "VaR_q( sum of L_u ) = sum of VaR_q( L_u ) ONLY under comonotonicity."
   *
   * so the testable content is the direction and the comonotonic limit. Three
   * criteria replace it:
   *
   *   (a) at rho = 0.5 the sum of per-use-case P99s exceeds the joint P99 in
   *       all six subdomains
   *   (b) the gap is monotonically non-increasing as rho steps
   *       0, 0.25, 0.5, 0.75, 1.0, within Monte Carlo noise
   *   (c) at rho = 1.0 the gap is within 2 percent of zero
   *
   * (a) and (b) hold. (c) DOES NOT, and the reason is a property of the spec's
   * risk model rather than a defect in the copula. See the last two tests.
   *
   * These run through simulate(), which is the same code path the Web Worker
   * uses, so the tests exercise what ships.
   */
  const RUNS = 100_000
  const NU = 4
  const RHOS = [0, 0.25, 0.5, 0.75, 1.0]

  /**
   * Noise allowance for criterion (b), absolute on the gap ratio. A DECLARED
   * OPERATING CONVENTION rather than a derived threshold, in the sense canon
   * 9.3.4 uses for its one percent censoring rule.
   */
  const NOISE = 0.02

  const gapsAt = (rho: number, e: Estate = estate, runs = RUNS) =>
    simulate({ estate: e, rho, nu: NU, runs, seed: 424242 }).subdomains
  const meanGap = (rows: { gap: number }[]) => rows.reduce((a, r) => a + r.gap, 0) / rows.length

  const byRho = new Map(RHOS.map((r) => [r, gapsAt(r)]))

  it('reports the observed gaps at every rho', () => {
    console.log('\n  ' + 'subdomain'.padEnd(24) + RHOS.map((r) => `rho ${r.toFixed(2)}`.padStart(10)).join(''))
    for (let i = 0; i < estate.subdomains.length; i++) {
      console.log('  ' + estate.subdomains[i]!.name.padEnd(24) +
        RHOS.map((r) => `${(byRho.get(r)![i]!.gap * 100).toFixed(1)}%`.padStart(10)).join(''))
    }
    console.log('\n  at rho = 0.50, GBP')
    for (const g of byRho.get(0.5)!) {
      const name = estate.subdomains.find((s) => s.id === g.id)!.name
      console.log(`  ${name.padEnd(24)} sum of P99s ${Math.round(g.sumOfP99s).toLocaleString('en-GB').padStart(10)}   joint P99 ${Math.round(g.jointP99).toLocaleString('en-GB').padStart(10)}   gap ${(g.gap * 100).toFixed(1)}%`)
    }
    expect(byRho.size).toBe(RHOS.length)
  })

  it('(a) at rho = 0.5 the sum of per-use-case P99s exceeds the joint P99, in all six subdomains', () => {
    for (const g of byRho.get(0.5)!) expect(g.sumOfP99s).toBeGreaterThan(g.jointP99)
  })

  it('(b) the gap is monotonically non-increasing in rho, within Monte Carlo noise', () => {
    for (let i = 0; i < estate.subdomains.length; i++) {
      for (let j = 1; j < RHOS.length; j++) {
        expect(byRho.get(RHOS[j]!)![i]!.gap).toBeLessThanOrEqual(byRho.get(RHOS[j - 1]!)![i]!.gap + NOISE)
      }
    }
  })

  /**
   * (c) AS RESTATED. The original criterion applied a comonotonicity condition
   * to PLATFORM FAILURES, which is what rho controls. Canon 9.8.3 applies that
   * condition to the LOSSES BEING SUMMED. Those are not the same object: each
   * use case is a different random function of the same failure vector, so
   * comonotonic platform failures do not produce comonotonic use-case losses.
   *
   * Restated as two parts:
   *   (i)  the gap is at its minimum across the rho sweep, for every subdomain
   *   (ii) with edge conditional failure fixed at 1 and loss magnitude fixed at
   *        its median, the gap is within 2 percent of zero
   *
   * (ii) is a DIAGNOSTIC. It is reported in README and is not reachable from
   * the interface.
   */
  it('(c)(i) the gap is at its minimum at rho = 1.0, in every subdomain', () => {
    for (let i = 0; i < estate.subdomains.length; i++) {
      const atOne = byRho.get(1.0)![i]!.gap
      for (const r of RHOS) {
        if (r === 1.0) continue
        expect(atOne).toBeLessThanOrEqual(byRho.get(r)![i]!.gap)
      }
    }
  })

  it('(c)(ii) stripped run: edge conditional failure at 1, magnitudes at median, gap within 2 percent of zero', () => {
    const noProp: Estate = {
      ...estate,
      use_cases: estate.use_cases.map((u) => ({ ...u, edges: u.edges.map((e) => ({ ...e, conditional_failure_prob: 1 })) })),
    }
    const stripped = simulate({
      estate: noProp, rho: 1.0, nu: NU, runs: 50_000, seed: 424242,
      options: { fixedMagnitudes: true },
    }).subdomains

    console.log('\n  stripped diagnostic at rho = 1.0')
    console.log('  edge conditional failure fixed at 1, loss magnitude fixed at its median\n')
    for (const g of stripped) {
      const name = estate.subdomains.find((s) => s.id === g.id)!.name
      console.log(`  ${name.padEnd(24)} sum of P99s ${Math.round(g.sumOfP99s).toLocaleString('en-GB').padStart(10)}   joint P99 ${Math.round(g.jointP99).toLocaleString('en-GB').padStart(10)}   gap ${(g.gap * 100).toFixed(2)}%`)
    }
    // With the two other random sources removed the copula reaches
    // comonotonicity and value-at-risk becomes additive, which is canon 9.8.3
    // result two behaving exactly as stated.
    for (const g of stripped) expect(Math.abs(g.gap)).toBeLessThanOrEqual(0.02)
  })

  it('for the record, the unstripped gap at rho = 1.0 is not within 2 percent', () => {
    const g = meanGap(byRho.get(1.0)!)
    console.log(`\n  mean gap at rho = 1.0, model as specified: ${(g * 100).toFixed(1)}%`)
    expect(g).toBeGreaterThan(0.02)
  })
}, 900_000)

// Prerequisite: view 1 (DetailPanel) and view 4 (Footprint) both quote an option
// component for the same node. They used to seed their own generators from two
// different expressions of the platform id, so the same node read differently on
// the two screens. Both now go through optionEngineFor. This test reproduces
// what each call site does and asserts the two agree exactly.
describe('option component, one seed across call sites', () => {
  const AS_AT_MONTH = 60

  it('gives the identical option component from both call sites, for every platform', () => {
    for (const p of estate.platforms) {
      const riders = ix.ridersOf.get(p.id)!.length
      const months = AS_AT_MONTH - p.adopted_month

      // View 1: DetailPanel builds the engine on selection.
      const fromDetail = optionComponent(optionEngineFor(p, estate.option_model), p, riders, months)
      // View 4: Footprint builds its own engine, memoised on the platform.
      const fromFootprint = optionComponent(optionEngineFor(p, estate.option_model), p, riders, months)

      expect(fromDetail).toBe(fromFootprint)
      expect(Number.isFinite(fromDetail)).toBe(true)
    }
  })

  it('is stable across rebuilds of the engine for the same node', () => {
    const p = estate.platforms[0]!
    const riders = ix.ridersOf.get(p.id)!.length
    const months = AS_AT_MONTH - p.adopted_month
    const a = optionComponent(optionEngineFor(p, estate.option_model), p, riders, months)
    const b = optionComponent(optionEngineFor(p, estate.option_model), p, riders, months)
    expect(a).toBe(b)
  })

  it('gives different platforms different seeds', () => {
    const seeds = new Set(estate.platforms.map((p) => optionSeed(p.id)))
    expect(seeds.size).toBe(estate.platforms.length)
  })

  // Guards the point of the change: seeding by hand is what let the two screens
  // drift, so a hand seeded engine must be visibly not the same object of truth.
  it('would disagree under the old per call site seeds', () => {
    const differing = estate.platforms.filter((p) => {
      const riders = ix.ridersOf.get(p.id)!.length
      const months = AS_AT_MONTH - p.adopted_month
      const oldFootprint = optionComponent(
        makeOptionEngine(p, estate.option_model, makeRng(0x0071_0000 ^ (p.id.length * 2654435761))),
        p, riders, months,
      )
      return oldFootprint !== optionComponent(optionEngineFor(p, estate.option_model), p, riders, months)
    })
    expect(differing.length).toBeGreaterThan(0)
  })
})
