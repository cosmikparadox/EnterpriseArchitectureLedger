import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import type { Estate, AllocationRule, UseCase } from './types'
import { buildIndex, ruleShare, basis, c1, meteredSpend, runOnce, percentile, failureThresholds } from './ledger'
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
   * ACCEPTANCE 3, as replaced. The spec's original check required a gap of at
   * least 20 percent in at least three of six subdomains at rho = 0.5. That
   * threshold was arbitrary and has been withdrawn by the owner. Canon 9.8.3
   * result two makes a DIRECTIONAL claim, not a magnitude one:
   *
   *   "VaR_q( sum of L_u ) = sum of VaR_q( L_u ) ONLY under comonotonicity."
   *
   * so the testable content is the direction and the comonotonic limit, not any
   * particular size of gap. Three criteria replace it:
   *
   *   (a) at rho = 0.5, the sum of per-use-case P99s exceeds the joint P99 in
   *       all six subdomains
   *   (b) for each subdomain the gap is monotonically non-increasing as rho
   *       steps 0, 0.25, 0.5, 0.75, 1.0, within Monte Carlo noise
   *   (c) at rho = 1.0 the gap is within 2 percent of zero
   */
  const RUNS = 100_000
  const NU = 4
  const RHOS = [0, 0.25, 0.5, 0.75, 1.0]

  /**
   * Monte Carlo noise allowance for criterion (b), as an absolute tolerance on
   * the gap ratio. This is a DECLARED OPERATING CONVENTION, not a derived
   * threshold, in the same sense as canon 9.3.4's one percent censoring rule.
   * A P99 estimated from 100k runs still moves by a fraction of a percent
   * between seeds, and the gap is a ratio of two such estimates.
   */
  const NOISE = 0.02

  const thresholds = failureThresholds(estate.platforms, NU)

  function gapsAt(rho: number) {
    const rng = makeRng(424242)
    const perUc = new Map<string, number[]>(estate.use_cases.map((u) => [u.id, []]))
    const perSub = new Map<string, number[]>(estate.subdomains.map((s) => [s.id, []]))
    for (let i = 0; i < RUNS; i++) {
      const r = runOnce(ix, rho, NU, rng, thresholds)
      for (const [k, v] of r.useCaseLoss) perUc.get(k)!.push(v)
      for (const [k, v] of r.subdomainLoss) perSub.get(k)!.push(v)
    }
    for (const a of perUc.values()) a.sort((x, y) => x - y)
    for (const a of perSub.values()) a.sort((x, y) => x - y)
    return estate.subdomains.map((sd) => {
      const members = estate.use_cases.filter((u) => u.subdomain === sd.id)
      const sumOfP99s = members.reduce((a, u) => a + percentile(perUc.get(u.id)!, 0.99), 0)
      const jointP99 = percentile(perSub.get(sd.id)!, 0.99)
      return { id: sd.id, name: sd.name, sumOfP99s, jointP99, gap: jointP99 === 0 ? 0 : (sumOfP99s - jointP99) / jointP99 }
    })
  }

  const byRho = new Map(RHOS.map((r) => [r, gapsAt(r)]))

  it('reports the observed gaps at every rho', () => {
    const header = ['subdomain'.padEnd(24), ...RHOS.map((r) => `rho ${r.toFixed(2)}`.padStart(10))].join('')
    console.log('\n  ' + header)
    for (let i = 0; i < estate.subdomains.length; i++) {
      const row = RHOS.map((r) => `${(byRho.get(r)![i]!.gap * 100).toFixed(1)}%`.padStart(10)).join('')
      console.log('  ' + estate.subdomains[i]!.name.padEnd(24) + row)
    }
    const at50 = byRho.get(0.5)!
    console.log('\n  at rho = 0.50, GBP figures')
    for (const g of at50) {
      console.log(`  ${g.name.padEnd(24)} sum of P99s ${Math.round(g.sumOfP99s).toLocaleString('en-GB').padStart(10)}   joint P99 ${Math.round(g.jointP99).toLocaleString('en-GB').padStart(10)}   gap ${(g.gap * 100).toFixed(1)}%`)
    }
    expect(byRho.size).toBe(RHOS.length)
  })

  it('(a) at rho = 0.5 the sum of per-use-case P99s exceeds the joint P99, in all six subdomains', () => {
    for (const g of byRho.get(0.5)!) {
      expect(g.sumOfP99s).toBeGreaterThan(g.jointP99)
    }
  })

  it('(b) the gap is monotonically non-increasing in rho, within Monte Carlo noise', () => {
    for (let i = 0; i < estate.subdomains.length; i++) {
      for (let j = 1; j < RHOS.length; j++) {
        const prev = byRho.get(RHOS[j - 1]!)![i]!
        const cur = byRho.get(RHOS[j]!)![i]!
        expect(cur.gap).toBeLessThanOrEqual(prev.gap + NOISE)
      }
    }
  })

  it('(c) at rho = 1.0 the gap is within 2 percent of zero, the comonotonic limit', () => {
    for (const g of byRho.get(1.0)!) {
      expect(Math.abs(g.gap)).toBeLessThanOrEqual(0.02)
    }
  })
}, 600_000)
