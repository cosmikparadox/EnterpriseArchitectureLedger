import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import type { Estate, AllocationRule, UseCase } from './types'
import { simulate } from './montecarlo'
import { buildIndex, ruleShare, basis, c1, meteredSpend } from './ledger'

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
   * (c) IS NOT MET, and this test records the measured value rather than
   * asserting a criterion that the model cannot satisfy.
   *
   * rho governs the copula on PLATFORM FAILURES. Making those comonotonic does
   * not make the USE-CASE LOSSES comonotonic, and it is the use-case losses
   * that are being summed. Two further random sources survive rho = 1, and
   * neither is under its control:
   *
   *   the per-edge propagation draw, spec section 6's
   *     "Uniform() < conditional_failure_prob"
   *   the per-run outage fraction
   *
   * Each use case is a different random function of the same failure vector, so
   * the summands are not monotone functions of one scalar and canon 9.8.3's
   * comonotonic condition is not reached.
   */
  it('(c) NOT MET on use-case losses: the gap at rho = 1.0 is about 5 percent, not within 2 percent', () => {
    const g = meanGap(byRho.get(1.0)!)
    console.log(`\n  mean gap at rho = 1.0, as specified: ${(g * 100).toFixed(1)}%`)
    expect(g).toBeGreaterThan(0.02)
    expect(g).toBeLessThan(0.10)
  })

  it('(c) holds at the layer rho actually controls: remove the two other random sources and the gap collapses', () => {
    const noProp: Estate = {
      ...estate,
      use_cases: estate.use_cases.map((u) => ({ ...u, edges: u.edges.map((e) => ({ ...e, conditional_failure_prob: 1 })) })),
    }
    // Beta(120, 1) has a standard deviation of about 0.008, so the outage
    // fraction is effectively a constant.
    const pinned: Estate = { ...noProp, outage_fraction_beta: { alpha: 120, beta: 1 } }
    const steps: [string, Estate][] = [
      ['as specified', estate],
      ['conditional failure prob forced to 1', noProp],
      ['  and outage fraction pinned', pinned],
    ]
    console.log('\n  mean gap at rho = 1.0')
    let last = 1
    for (const [name, e] of steps) {
      last = meanGap(gapsAt(1.0, e, 50_000))
      console.log(`  ${name.padEnd(38)}${(last * 100).toFixed(1).padStart(7)}%`)
    }
    // With both extra sources removed, the copula reaches comonotonicity and
    // value-at-risk becomes additive, exactly as canon 9.8.3 says it must.
    expect(last).toBeLessThanOrEqual(0.02)
  })
}, 900_000)
