import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import type { Estate, AllocationRule, UseCase } from './types'
import { buildIndex, ruleShare, basis, c1, meteredSpend, runOnce, percentile } from './ledger'
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
   * Canon 9.8.3 result two: "VaR_q( sum of L_u ) = sum of VaR_q( L_u ) ONLY
   * under comonotonicity." Summing per-use-case P99s counts the same shared
   * platform failure many times, so it should EXCEED the P99 of the joint
   * quantity summed within each run.
   */
  const RUNS = 6000
  const RHO = 0.5
  const NU = 4

  function simulate(rho: number) {
    const rng = makeRng(424242)
    const perUc = new Map<string, number[]>(estate.use_cases.map((u) => [u.id, []]))
    const perSub = new Map<string, number[]>(estate.subdomains.map((s) => [s.id, []]))
    for (let i = 0; i < RUNS; i++) {
      const r = runOnce(ix, rho, NU, rng)
      for (const [k, v] of r.useCaseLoss) perUc.get(k)!.push(v)
      for (const [k, v] of r.subdomainLoss) perSub.get(k)!.push(v)
    }
    for (const a of perUc.values()) a.sort((x, y) => x - y)
    for (const a of perSub.values()) a.sort((x, y) => x - y)
    return { perUc, perSub }
  }

  const { perUc, perSub } = simulate(RHO)

  const gaps = estate.subdomains.map((s) => {
    const members = estate.use_cases.filter((u) => u.subdomain === s.id)
    const sumOfP99s = members.reduce((a, u) => a + percentile(perUc.get(u.id)!, 0.99), 0)
    const jointP99 = percentile(perSub.get(s.id)!, 0.99)
    return { id: s.id, name: s.name, sumOfP99s, jointP99, gap: jointP99 === 0 ? Infinity : (sumOfP99s - jointP99) / jointP99 }
  })

  it('sum of per-use-case P99s exceeds the P99 of the joint loss, in every subdomain, at rho = 0.5', () => {
    for (const g of gaps) {
      expect(g.sumOfP99s).toBeGreaterThan(g.jointP99)
    }
  })

  it('the gap is at least 20 percent in at least three of six subdomains (acceptance 3)', () => {
    const over20 = gaps.filter((g) => g.gap >= 0.2)
    // Printed so the report can quote real figures rather than a bare pass.
    for (const g of gaps) {
      console.log(`  ${g.name.padEnd(24)} sum of P99s ${Math.round(g.sumOfP99s).toLocaleString('en-GB').padStart(10)}   joint P99 ${Math.round(g.jointP99).toLocaleString('en-GB').padStart(10)}   gap ${(g.gap * 100).toFixed(1)}%`)
    }
    expect(over20.length).toBeGreaterThanOrEqual(3)
  })

  it('the gap narrows as dependence rises, because comonotonic risks add exactly', () => {
    const hi = simulate(0.98)
    const mean = (gs: number[]) => gs.reduce((a, b) => a + b, 0) / gs.length
    const gapAt = (p: typeof perUc, s: typeof perSub) =>
      mean(estate.subdomains.map((sd) => {
        const members = estate.use_cases.filter((u) => u.subdomain === sd.id)
        const sum = members.reduce((a, u) => a + percentile(p.get(u.id)!, 0.99), 0)
        const joint = percentile(s.get(sd.id)!, 0.99)
        return joint === 0 ? 0 : (sum - joint) / joint
      }))
    expect(gapAt(hi.perUc, hi.perSub)).toBeLessThan(gapAt(perUc, perSub))
  })
})
