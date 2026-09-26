// Recomputes the audit brief's appendix figures with the app's own model code.
// Nodes and use cases are found by display name, so the same script runs
// before and after the id rename. Prints one line per figure.

import { readFileSync } from 'node:fs'
import {
  attachedAt, attachMonth, buildIndex, c1, executionComponent, kCommitted, meteredSpend, optionComponent, optionEngineFor,
  reportedCost, ruleShare, workOfLeaving, type Index,
} from '../src/model/ledger'
import { simulate } from '../src/model/montecarlo'
import { withSyntheticRiders } from '../src/app/graph'
import { shapeEntry, SHAPES_SEED } from '../src/model/shapes'
import { unpackFrame, type PrecomputedSet } from '../src/model/precomputed'
import type { AllocationRule, Estate } from '../src/model/types'

const left = JSON.parse(readFileSync('data/estate.json', 'utf8')) as Estate
const right = JSON.parse(readFileSync('data/estate_bestofbreed.json', 'utf8')) as Estate
const preAll = JSON.parse(readFileSync('data/precomputed.json', 'utf8')) as Record<string, PrecomputedSet>
const ix = buildIndex(left)
const ixR = buildIndex(right)
const P = (e: Estate, name: string) => e.platforms.find((p) => p.name === name)!
const U = (e: Estate, name: string) => e.use_cases.find((u) => u.name === name)!
const out: [string, string][] = []
const put = (k: string, v: unknown) => out.push([k, typeof v === 'number' ? (Math.round(v * 100) / 100).toString() : String(v)])

const idn = P(left, 'Identity service')
const dc = P(left, 'Data cloud')
const triage = U(left, 'Claim triage')
const qb = U(left, 'Quote and bind (direct)')
const riders = (i: Index, id: string) => i.ridersOf.get(id)?.length ?? 0
put('Identity service: riders / metered / pool', `${riders(ix, idn.id)} / ${meteredSpend(ix, idn.id).toFixed(2)} / ${idn.fixed_pool_gbp_month}`)
put('Quote and bind on identity: reported / rule share', `${reportedCost(ix, idn.id, qb.id, 'equal').toFixed(0)} / ${ruleShare(ix, idn.id, qb.id, 'equal').toFixed(0)}`)
const across = (i: Index, ucId: string, rule: AllocationRule) => {
  const u = i.useCaseById.get(ucId)!
  let rep = 0, rul = 0
  for (const e of u.edges) { rep += reportedCost(i, e.platform_id, ucId, rule); rul += ruleShare(i, e.platform_id, ucId, rule) }
  return { rep, rul, met: rep - rul, n: u.edges.length }
}
const t = across(ix, triage.id, 'equal')
put('Claim triage: reported across platforms', `${t.rep.toFixed(0)} across ${t.n}`)
put('Claim triage: metered / by rule', `${t.met.toFixed(0)} / ${t.rul.toFixed(0)}`)
put('Claim triage on identity: reported / rule share', `${reportedCost(ix, idn.id, triage.id, 'equal').toFixed(0)} / ${ruleShare(ix, idn.id, triage.id, 'equal').toFixed(0)}`)
const ix3 = buildIndex(withSyntheticRiders(left, idn.id, 3))
put('Claim triage on identity with 3 riders added', reportedCost(ix3, idn.id, triage.id, 'equal').toFixed(0))
const met = (k: number) => meteredSpend(buildIndex(withSyntheticRiders(left, idn.id, k)), idn.id)
put('Next use case on identity, metered increment', `${(met(1) - met(0)).toFixed(2)} (${[0, 1, 2, 3].map((k) => met(k).toFixed(2)).join(', ')})`)
put('Identity pool with 0 and 3 riders added', `${buildIndex(withSyntheticRiders(left, idn.id, 0)).platformById.get(idn.id)!.fixed_pool_gbp_month} / ${buildIndex(withSyntheticRiders(left, idn.id, 3)).platformById.get(idn.id)!.fixed_pool_gbp_month}`)

const mc = simulate({ estate: left, rho: 0.5, nu: 4, runs: 10_000, seed: 20260905 })
const mcR = simulate({ estate: right, rho: 0.5, nu: 4, runs: 10_000, seed: 20260905 })
const claims = mc.subdomains.find((s) => s.id === 'claims')!
put('Claim triage own bad month (P99)', mc.useCases.find((u) => u.id === triage.id)!.p99.toFixed(0))
put('Claims: added up / together', `${claims.sumOfP99s.toFixed(0)} / ${claims.jointP99.toFixed(0)}`)
put('Claims best of breed: together', mcR.subdomains.find((s) => s.id === claims.id)!.jointP99.toFixed(0))
const preL = preAll[left.provenance.graph_version]!
const frames = preL.frames.map((f) => unpackFrame(preL, f))
const fc = frames.map((f) => ({ rho: f.rho, s: f.subdomains.find((s) => s.id === claims.id)! }))
put('Claims added up, five fixed points', fc.map((x) => `${x.rho}:${x.s.sumOfP99s.toFixed(0)}`).join(' '))
put('Claims together, five fixed points', fc.map((x) => `${x.rho}:${x.s.jointP99.toFixed(0)}`).join(' '))
put('Stored frame rho 0.5 equals live: added / together', `${fc[2]!.s.sumOfP99s.toFixed(0)} / ${fc[2]!.s.jointP99.toFixed(0)}`)

// Entry three's platform: Claims administration since v0.6. A rider counts
// from the later of its adoption and the platform's.
const leave = P(left, 'Claims administration')
const lvRiders = ix.ridersOf.get(leave.id) ?? []
put('Claims administration: adopted / riders / attached by month 31', `${leave.adopted_month} / ${lvRiders.length} / ${attachedAt(ix, leave.id, 31).length}`)
put('Claims administration: attach months', lvRiders.map((r) => attachMonth(r, leave)).sort((a, b) => a - b).join(' '))
const m31 = 31 - leave.adopted_month, m60 = 60 - leave.adopted_month
const nL = lvRiders.length
put('Claims administration work of leaving, month 31', workOfLeaving(leave, nL, m31).toFixed(0))
put('Claims administration work of leaving, month 60', workOfLeaving(leave, nL, m60).toFixed(0))
put('Claims administration reversible alternative', leave.exit_k_reversible_gbp)
put('Claims administration work the commitment created, month 31', executionComponent(leave, nL, m31).toFixed(0))
const opt = (p: typeof leave, n: number, m: number) => optionComponent(optionEngineFor(p, left.option_model), p, n, m)
put('Claims administration choices given up, month 31', opt(leave, nL, m31).toFixed(0))
put('Claims administration K committed month 31', kCommitted(leave, nL, m31).toFixed(0))
put('Data cloud: adopted / attached at month 16 / at month 17', `${dc.adopted_month} / ${attachedAt(ix, dc.id, 16).length} / ${attachedAt(ix, dc.id, 17).length}`)
put('Identity service work of leaving, month 60', workOfLeaving(idn, riders(ix, idn.id), 60 - idn.adopted_month).toFixed(0))
put('Identity service choices given up, month 60', opt(idn, riders(ix, idn.id), 60 - idn.adopted_month).toFixed(0))
for (const p of left.platforms) put(`option component month 60: ${p.name}`, opt(p, riders(ix, p.id), Math.max(0, 60 - p.adopted_month)).toFixed(0))

const sl = shapeEntry(left, ix, 0.5, SHAPES_SEED.left), sr = shapeEntry(right, ixR, 0.5, SHAPES_SEED.right)
put("Busiest node's pool: concentrated / best of breed", `${sl.topName} ${sl.pool} (${sl.riders}) / ${sr.topName} ${sr.pool} (${sr.riders})`)
const largestPool = (e: Estate, i: Index) => e.platforms.map((p) => ({ p, n: riders(i, p.id) })).sort((a, b) => b.p.fixed_pool_gbp_month - a.p.fixed_pool_gbp_month)[0]!
const lp = largestPool(left, ix), rp = largestPool(right, ixR)
put('Largest pool: concentrated / best of breed', `${lp.p.name} ${lp.p.fixed_pool_gbp_month} (${lp.n}) / ${rp.p.name} ${rp.p.fixed_pool_gbp_month} (${rp.n})`)
put('Largest exit, month 60: concentrated / best of breed', `${sl.exitName} ${sl.exec.toFixed(0)} / ${sr.exitName} ${sr.exec.toFixed(0)}`)

const bq = U(left, 'Broker quote submission')
const moved: Estate = { ...left, use_cases: left.use_cases.map((u) => (u.id === bq.id ? { ...u, subdomain: 'service' } : u)) }
const ixM = buildIndex(moved)
for (const rule of ['equal', 'driver', 'by_volume', 'by_head'] as AllocationRule[]) {
  let n = 0, max = 0
  for (const p of left.platforms) for (const r of ix.ridersOf.get(p.id) ?? []) {
    const d = Math.abs(ruleShare(ix, p.id, r.uc.id, rule) - ruleShare(ixM, p.id, r.uc.id, rule))
    if (d > 1e-6) { n++; max = Math.max(max, d) }
  }
  put(`Boundary move, ${rule}: moved / largest`, `${n} / ${max.toFixed(0)}`)
}
const mcM = simulate({ estate: moved, rho: 0.5, nu: 4, runs: 10_000, seed: 20260905 })
put('Broker quote own P99 before / after its move', `${mc.useCases.find((u) => u.id === bq.id)!.p99.toFixed(0)} / ${mcM.useCases.find((u) => u.id === bq.id)!.p99.toFixed(0)}`)
for (const sd of ['sales', 'service', 'claims']) put(`Boundary move, ${sd} together before / after`, `${mc.subdomains.find((s) => s.id === sd)!.jointP99.toFixed(0)} / ${mcM.subdomains.find((s) => s.id === sd)!.jointP99.toFixed(0)}`)
const c1s = left.platforms.map((p) => c1(ix, p.id))
put('Rule share range across nodes', `${(Math.min(...c1s) * 100).toFixed(0)} to ${(Math.max(...c1s) * 100).toFixed(0)} percent`)

for (const [k, v] of out) console.log(`${k.padEnd(56)} ${v}`)
