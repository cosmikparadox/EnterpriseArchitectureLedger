// Seeded generator. Spec section 7.
// Emits data/estate.json and data/estate_bestofbreed.json, prints a realism
// report, and FAILS THE BUILD if the checks in spec section 3.5 do not hold.
//
// Every number produced here is synthetic. Nothing is a measurement.

import { writeFileSync, mkdirSync } from 'node:fs'
import { makeRng, band, type Rng } from '../src/model/rng.ts'
import type { Estate, Platform, UseCase, UseCaseEdge, Subdomain } from '../src/model/types.ts'
import { PLATFORMS, SUBDOMAINS, USE_CASES, type PlatformSpec, type UseCaseSpec } from './estate-source.ts'
import { simulate } from '../src/model/montecarlo.ts'
import { packFrame, PRECOMPUTED_RHOS, PRECOMPUTED_RUNS, type PrecomputedIndex } from '../src/model/precomputed.ts'

const SEED = 20260905

// Canon 9.8.2 requires these on every entry. Declared, not derived.
const PROVENANCE = {
  graph_version: '2026-09-05-a',
  graph_as_at: '2026-09-05',
  decomposition_owner: 'Harbourline domain architecture function (synthetic)',
  decomposition_revised: '2026-02',
  value_flags_owner: 'Harbourline finance function (synthetic)',
  value_flags_declared: '2026-03',
  seed: SEED,
  synthetic: true as const,
}

// Canon 9.5.5 Datar-Mathews inputs. Deliberately NOT the values used in canon
// 9.10: spec section 9 forbids reproducing any canonical worked example.
const OPTION_MODEL = {
  horizon_years: 4,
  mu_risk_adjusted: 0.11,
  r_risk_free: 0.035,
  paths: 40000,
}

// Fraction of a month's volume lost when a use case is interrupted. Drawn per
// run so the loss is a distribution rather than a point. Made up.
const OUTAGE_FRACTION_BETA = { alpha: 2, beta: 14 }

type Shape = 'concentrated' | 'bestofbreed'

/**
 * Suites that hold their own session and transaction state. Where one of these
 * is the system of record for a use case, an identity outage blocks new sign-in
 * but does not stop work already inside the suite.
 */
const SESSION_HOLDING_SUITES = new Set(['policycenter', 'claimcenter', 'sap_s4', 'workday', 'servicenow', 'billingcenter', 'salesforce', 'opentext'])

/**
 * Conditional failure probability bands by role. Spec section 3.4 makes this an
 * edge property: the probability the use case is unavailable GIVEN that the
 * platform is unavailable.
 *
 * Identity is treated differently in the two shapes, and the difference is
 * architectural rather than cosmetic. In the concentrated estate a small number
 * of suites mediate most work and carry their own sessions, so identity gates
 * sign-in rather than in-flight transactions. In the best of breed estate every
 * hop crosses a service boundary and re-presents a token, so identity becomes a
 * hard dependency on every use case. That is the same mechanism the view 5
 * lesson is about: the concentration did not go away, it moved.
 */
function cfpBand(platformId: string, isPrimary: boolean, shape: Shape, primaryId: string): [number, number] {
  if (isPrimary) return [0.9, 1.0]
  switch (platformId) {
    case 'okta':
      if (shape === 'bestofbreed') return [0.94, 1.0]
      return SESSION_HOLDING_SUITES.has(primaryId) ? [0.45, 0.7] : [0.9, 1.0]
    case 'apigee': return [0.6, 0.85]
    case 'conduit': return [0.4, 0.7]
    case 'kafka': return [0.25, 0.55] // buffered, asynchronous
    case 'meridian': case 'lakehouse': return [0.2, 0.45] // feeds, mostly async
    case 'powerbi': return [0.15, 0.4]
    default: return [0.5, 0.8]
  }
}

function buildEdges(rng: Rng, uc: UseCaseSpec, specById: Map<string, PlatformSpec>, shape: Shape): UseCaseEdge[] {
  const primaryId = uc.platforms[0]!
  return uc.platforms.map((pid, i) => {
    const spec = specById.get(pid)
    if (!spec) throw new Error(`use case ${uc.id} references unknown platform ${pid}`)
    const [clo, chi] = cfpBand(pid, i === 0, shape, primaryId)
    return {
      platform_id: pid,
      driver_units_per_volume_unit: band(rng, spec.units_band[0], spec.units_band[1], 3),
      conditional_failure_prob: band(rng, clo, chi, 3),
    }
  })
}

function toPlatform(s: PlatformSpec): Platform {
  return {
    id: s.id, name: s.name, category: s.category, type: s.type,
    fixed_pool_gbp_month: s.fixed_pool_gbp_month,
    driver_name: s.driver_name,
    driver_unit_cost_gbp: s.driver_unit_cost_gbp,
    capacity_note: s.capacity_note,
    failure_lef: s.failure_lef,
    // Lognormal parameters for the direct loss in GBP. mu is the log of the
    // median, which is how the median is set directly.
    failure_loss_lognormal: { mu: Math.log(s.loss_median_gbp), sigma: s.loss_log_sd },
    adopted_month: s.adopted_month,
    exit_base_execution_gbp: s.exit_base_execution_gbp,
    exit_k_reversible_gbp: s.exit_k_reversible_gbp,
    counterfactual_evidenced: false,
    counterfactual_note: s.counterfactual_note,
    delta_v_median_gbp: s.delta_v_median_gbp,
    delta_v_log_sd: s.delta_v_log_sd,
  }
}

function toSubdomain(s: (typeof SUBDOMAINS)[number]): Subdomain {
  return { id: s.id, name: s.name, scope: s.scope, headcount: s.headcount, margin_per_unit_gbp: s.margin_per_unit_gbp }
}

// ---------------------------------------------------------------------------
// The best of breed variant. Spec section 4.5: same use cases, re-wired onto
// more platforms, with a THICK integration layer. Twelve platforms, each
// carrying few use cases, and every use case routed through all four
// integration nodes. That routing is what relocates the concentration.
// ---------------------------------------------------------------------------

const BOB_PLATFORMS: PlatformSpec[] = [
  { id: 'policy_pl', name: 'Personal lines policy', category: 'Policy administration', type: 'platform', fixed_pool_gbp_month: 38000, driver_name: 'policy transactions', driver_unit_cost_gbp: 0.5, capacity_note: 'Sized to personal lines renewal peak.', failure_lef: 0.24, loss_median_gbp: 240000, loss_log_sd: 1.15, adopted_month: 2, exit_base_execution_gbp: 610000, exit_k_reversible_gbp: 250000, counterfactual_note: 'A rating engine kept separable from policy records.', delta_v_median_gbp: 700000, delta_v_log_sd: 0.6, units_band: [0.8, 1.4] },
  { id: 'policy_cl', name: 'Commercial lines policy', category: 'Policy administration', type: 'platform', fixed_pool_gbp_month: 34000, driver_name: 'policy transactions', driver_unit_cost_gbp: 0.62, capacity_note: 'Sized to broker submission peaks.', failure_lef: 0.23, loss_median_gbp: 215000, loss_log_sd: 1.15, adopted_month: 10, exit_base_execution_gbp: 540000, exit_k_reversible_gbp: 225000, counterfactual_note: 'A submission service behind a portable contract.', delta_v_median_gbp: 620000, delta_v_log_sd: 0.6, units_band: [0.8, 1.4] },
  { id: 'crm_core', name: 'CRM core', category: 'CRM', type: 'platform', fixed_pool_gbp_month: 24000, driver_name: 'API calls', driver_unit_cost_gbp: 0.018, capacity_note: 'Licensed seats plus metered calls.', failure_lef: 0.38, loss_median_gbp: 110000, loss_log_sd: 1.0, adopted_month: 4, exit_base_execution_gbp: 290000, exit_k_reversible_gbp: 120000, counterfactual_note: 'A contact store behind a standard interface.', delta_v_median_gbp: 430000, delta_v_log_sd: 0.52, units_band: [4, 9] },
  { id: 'portal_cx', name: 'Customer portal', category: 'Digital channel', type: 'platform', fixed_pool_gbp_month: 21000, driver_name: 'sessions', driver_unit_cost_gbp: 0.012, capacity_note: 'Front-end hosting with metered sessions.', failure_lef: 0.36, loss_median_gbp: 95000, loss_log_sd: 0.95, adopted_month: 20, exit_base_execution_gbp: 210000, exit_k_reversible_gbp: 90000, counterfactual_note: 'A rendered front end over portable APIs.', delta_v_median_gbp: 300000, delta_v_log_sd: 0.5, units_band: [3, 8] },
  { id: 'claims_core', name: 'Claims core', category: 'Claims', type: 'platform', fixed_pool_gbp_month: 44000, driver_name: 'claim transactions', driver_unit_cost_gbp: 0.85, capacity_note: 'Sized to surge events.', failure_lef: 0.26, loss_median_gbp: 260000, loss_log_sd: 1.15, adopted_month: 6, exit_base_execution_gbp: 620000, exit_k_reversible_gbp: 260000, counterfactual_note: 'A claims core with the document path external.', delta_v_median_gbp: 700000, delta_v_log_sd: 0.58, units_band: [0.9, 1.6] },
  { id: 'workflow_svc', name: 'Workflow service', category: 'ITSM', type: 'platform', fixed_pool_gbp_month: 16000, driver_name: 'tickets', driver_unit_cost_gbp: 1.0, capacity_note: 'Subscription floor plus per-ticket processing.', failure_lef: 0.28, loss_median_gbp: 58000, loss_log_sd: 0.9, adopted_month: 9, exit_base_execution_gbp: 160000, exit_k_reversible_gbp: 68000, counterfactual_note: 'A workflow engine behind a service abstraction.', delta_v_median_gbp: 220000, delta_v_log_sd: 0.48, units_band: [0.15, 0.5] },
  { id: 'doc_store', name: 'Document store', category: 'Document management', type: 'platform', fixed_pool_gbp_month: 17000, driver_name: 'documents', driver_unit_cost_gbp: 0.038, capacity_note: 'Retention storage plus per-document handling.', failure_lef: 0.18, loss_median_gbp: 62000, loss_log_sd: 0.95, adopted_month: 3, exit_base_execution_gbp: 230000, exit_k_reversible_gbp: 96000, counterfactual_note: 'A content store behind a document interface.', delta_v_median_gbp: 260000, delta_v_log_sd: 0.48, units_band: [0.8, 2.5] },
  { id: 'billing_core', name: 'Billing core', category: 'Billing', type: 'platform', fixed_pool_gbp_month: 26000, driver_name: 'billing transactions', driver_unit_cost_gbp: 0.26, capacity_note: 'Baseline capacity for collection runs.', failure_lef: 0.22, loss_median_gbp: 140000, loss_log_sd: 1.0, adopted_month: 6, exit_base_execution_gbp: 380000, exit_k_reversible_gbp: 160000, counterfactual_note: 'A collections service over a payments abstraction.', delta_v_median_gbp: 400000, delta_v_log_sd: 0.52, units_band: [0.6, 1.5] },
  { id: 'pay_orch', name: 'Payment orchestration', category: 'Payments', type: 'platform', fixed_pool_gbp_month: 8000, driver_name: 'payment transactions', driver_unit_cost_gbp: 0.13, capacity_note: 'Orchestration across two acquirers.', failure_lef: 0.15, loss_median_gbp: 88000, loss_log_sd: 1.0, adopted_month: 11, exit_base_execution_gbp: 120000, exit_k_reversible_gbp: 52000, counterfactual_note: 'Two acquirers behind one routing contract.', delta_v_median_gbp: 190000, delta_v_log_sd: 0.55, units_band: [0.5, 1.2] },
  { id: 'ledger_fin', name: 'Finance ledger', category: 'ERP and general ledger', type: 'platform', fixed_pool_gbp_month: 36000, driver_name: 'postings', driver_unit_cost_gbp: 0.32, capacity_note: 'Reserved capacity sized to period close.', failure_lef: 0.17, loss_median_gbp: 205000, loss_log_sd: 1.2, adopted_month: 0, exit_base_execution_gbp: 700000, exit_k_reversible_gbp: 300000, counterfactual_note: 'A ledger kept behind a posting interface.', delta_v_median_gbp: 760000, delta_v_log_sd: 0.6, units_band: [2, 7] },
  { id: 'people_core', name: 'People core', category: 'HCM', type: 'platform', fixed_pool_gbp_month: 13000, driver_name: 'seats', driver_unit_cost_gbp: 6.0, capacity_note: 'Per-seat subscription.', failure_lef: 0.2, loss_median_gbp: 38000, loss_log_sd: 0.85, adopted_month: 13, exit_base_execution_gbp: 170000, exit_k_reversible_gbp: 72000, counterfactual_note: 'A payroll and records split evaluated at selection.', delta_v_median_gbp: 165000, delta_v_log_sd: 0.46, units_band: [0.02, 0.12] },
  { id: 'lakehouse', name: 'Lakehouse', category: 'Cloud data platform', type: 'platform', fixed_pool_gbp_month: 33000, driver_name: 'credits', driver_unit_cost_gbp: 0.8, capacity_note: 'Committed tier plus metered compute.', failure_lef: 0.3, loss_median_gbp: 120000, loss_log_sd: 1.1, adopted_month: 17, exit_base_execution_gbp: 350000, exit_k_reversible_gbp: 130000, counterfactual_note: 'An open table format on object storage.', delta_v_median_gbp: 520000, delta_v_log_sd: 0.66, units_band: [0.2, 0.9] },
]

const INTEGRATION_IDS = ['conduit', 'apigee', 'okta', 'kafka']

/** Maps a concentrated-estate platform onto its best of breed replacement. */
function bobMap(pid: string, ucId: string): string | null {
  if (INTEGRATION_IDS.includes(pid)) return null // added separately, to every use case
  switch (pid) {
    case 'policycenter':
      return ['uc_broker_quote', 'uc_broker_portal', 'uc_pricing_refresh'].includes(ucId) ? 'policy_cl' : 'policy_pl'
    case 'salesforce':
      return ['uc_self_service', 'uc_broker_portal'].includes(ucId) ? 'portal_cx' : 'crm_core'
    case 'marketingcloud': return 'crm_core'
    case 'claimcenter': return 'claims_core'
    case 'servicenow': return 'workflow_svc'
    case 'opentext': return 'doc_store'
    case 'billingcenter': return 'billing_core'
    case 'adyen': return 'pay_orch'
    case 'sap_s4': return 'ledger_fin'
    case 'workday': return 'people_core'
    case 'meridian': case 'powerbi': return 'lakehouse'
    default: throw new Error(`no best of breed mapping for ${pid}`)
  }
}

function buildBobUseCases(rng: Rng, specById: Map<string, PlatformSpec>): UseCase[] {
  return USE_CASES.map((uc) => {
    const mapped: string[] = []
    for (const pid of uc.platforms) {
      const t = bobMap(pid, uc.id)
      if (t && !mapped.includes(t)) mapped.push(t)
    }
    // Thick integration layer: every use case now routes through all four.
    for (const i of INTEGRATION_IDS) if (!mapped.includes(i)) mapped.push(i)
    const spec: UseCaseSpec = { ...uc, platforms: mapped }
    return {
      id: uc.id, name: uc.name, subdomain: uc.subdomain,
      volume_per_month: uc.volume_per_month, adopted_month: uc.adopted_month,
      value_flow: uc.value_flow,
      edges: buildEdges(rng, spec, specById, 'bestofbreed'),
    }
  })
}

// ---------------------------------------------------------------------------
// Realism report and checks. Spec section 7 requires the report on run and
// requires the build to fail when a check fails.
// ---------------------------------------------------------------------------

interface Check { name: string; pass: boolean; detail: string }

function gbp(n: number): string {
  return 'GBP ' + Math.round(n).toLocaleString('en-GB')
}

function report(estate: Estate, opts: { requireIdentityMaxFanIn: boolean }): Check[] {
  const { platforms, use_cases, subdomains } = estate
  const byId = new Map(platforms.map((p) => [p.id, p]))
  const subById = new Map(subdomains.map((s) => [s.id, s]))

  const riders = new Map<string, UseCase[]>()
  for (const p of platforms) riders.set(p.id, [])
  let edgeCount = 0
  for (const uc of use_cases) {
    for (const e of uc.edges) {
      edgeCount++
      riders.get(e.platform_id)?.push(uc)
    }
  }

  const fanIn = platforms.map((p) => ({ p, n: riders.get(p.id)!.length }))
  const meanFanIn = fanIn.reduce((a, b) => a + b.n, 0) / fanIn.length
  const maxFanIn = [...fanIn].sort((a, b) => b.n - a.n)[0]!

  // Metered spend and C1 per platform. Spec section 6.
  const meteredSpend = new Map<string, number>()
  for (const p of platforms) meteredSpend.set(p.id, 0)
  for (const uc of use_cases) {
    for (const e of uc.edges) {
      const p = byId.get(e.platform_id)!
      const spend = uc.volume_per_month * e.driver_units_per_volume_unit * p.driver_unit_cost_gbp
      meteredSpend.set(p.id, meteredSpend.get(p.id)! + spend)
    }
  }

  // Volume at risk per platform: expected monthly business volume interrupted
  // if that node is unavailable. This is the blast radius measure spec section
  // 5.1 asks for ("volume at risk"), and it is NOT the same as fan-in.
  const volAtRisk = new Map<string, number>()
  for (const p of platforms) volAtRisk.set(p.id, 0)
  for (const uc of use_cases) {
    for (const e of uc.edges) {
      volAtRisk.set(e.platform_id, volAtRisk.get(e.platform_id)! + uc.volume_per_month * e.conditional_failure_prob)
    }
  }
  const volRanked = [...volAtRisk.entries()].sort((a, b) => b[1] - a[1])
  const topVol = volRanked[0]!

  // Use cases crossing three or more subdomain boundaries via shared platforms.
  // Integration nodes are EXCLUDED from the path. They connect nearly
  // everything by construction, so counting them would report every use case as
  // a crosser and the check would pass on any wiring at all.
  const crossers = use_cases.filter((uc) => {
    const others = new Set<string>()
    for (const e of uc.edges) {
      if (byId.get(e.platform_id)!.type === 'integration') continue
      for (const r of riders.get(e.platform_id)!) {
        if (r.subdomain !== uc.subdomain) others.add(r.subdomain)
      }
    }
    return others.size >= 3
  })

  const islandUcs = use_cases.filter((uc) => uc.edges.length === 0)
  const islandPlatforms = platforms.filter((p) => riders.get(p.id)!.length === 0)
  const ucsWithoutIntegration = use_cases.filter(
    (uc) => !uc.edges.some((e) => byId.get(e.platform_id)!.type === 'integration'),
  )

  const dataPlatformId = byId.has('meridian') ? 'meridian' : 'lakehouse'
  const dataRiders = riders.get(dataPlatformId)!
  const dataSubs = new Set(dataRiders.map((u) => u.subdomain))
  const dataFromAnalytics = dataRiders.filter((u) => u.subdomain === 'data').length
  const analyticsTotal = use_cases.filter((u) => u.subdomain === 'data').length

  const claimsRequired = ['claimcenter', 'servicenow', 'salesforce', 'opentext', 'adyen', 'kafka']
  const claimsPlatforms = new Set(
    use_cases.filter((u) => u.subdomain === 'claims').flatMap((u) => u.edges.map((e) => e.platform_id)),
  )
  const claimsMissing = claimsRequired.filter((r) => !claimsPlatforms.has(r))

  // ---- print ----
  console.log(`\n=== REALISM REPORT: ${estate.label} ===`)
  console.log(`seed ${estate.provenance.seed}   graph version ${estate.provenance.graph_version}`)
  console.log(`decomposition owner ${estate.provenance.decomposition_owner}, revised ${estate.provenance.decomposition_revised}`)
  console.log(`\nnodes by type`)
  console.log(`  platform      ${platforms.filter((p) => p.type === 'platform').length}`)
  console.log(`  integration   ${platforms.filter((p) => p.type === 'integration').length}`)
  console.log(`  use_case      ${use_cases.length}`)
  console.log(`  total nodes   ${platforms.length + use_cases.length}`)
  console.log(`  edges         ${edgeCount}`)
  console.log(`\nfan-in`)
  console.log(`  mean fan-in per platform   ${meanFanIn.toFixed(2)}`)
  console.log(`  max fan-in                 ${maxFanIn.p.name} (${maxFanIn.p.id}), ${maxFanIn.n} use cases`)
  console.log(`\nfan-in and cost split per node`)
  console.log(`  ${'node'.padEnd(26)}${'type'.padEnd(13)}${'riders'.padStart(7)}${'subs'.padStart(6)}${'metered/mo'.padStart(14)}${'fixed/mo'.padStart(12)}${'C1'.padStart(7)}${'vol at risk'.padStart(13)}`)
  for (const { p, n } of [...fanIn].sort((a, b) => b.n - a.n)) {
    const ms = meteredSpend.get(p.id)!
    const c1 = p.fixed_pool_gbp_month / (p.fixed_pool_gbp_month + ms)
    const subs = new Set(riders.get(p.id)!.map((u) => u.subdomain)).size
    console.log(
      `  ${p.name.padEnd(26)}${p.type.padEnd(13)}${String(n).padStart(7)}${String(subs).padStart(6)}` +
      `${gbp(ms).padStart(14)}${gbp(p.fixed_pool_gbp_month).padStart(12)}${c1.toFixed(3).padStart(7)}` +
      `${Math.round(volAtRisk.get(p.id)!).toLocaleString('en-GB').padStart(13)}`,
    )
  }
  // Reported rather than asserted. Which node type leads is a finding about the
  // shape of the estate, not a property the generator is entitled to arrange.
  console.log(`\nblast radius, top three by monthly volume at risk`)
  for (const [pid, v] of volRanked.slice(0, 3)) {
    const p = byId.get(pid)!
    console.log(`  ${p.name.padEnd(26)}${p.type.padEnd(13)}${Math.round(v).toLocaleString('en-GB').padStart(12)} units/month`)
  }
  console.log(`\nboundary crossing`)
  console.log(`  use cases reaching 3+ other subdomains via shared platforms (integration nodes excluded from the path): ${crossers.length}`)
  console.log(`\nsubdomains`)
  for (const s of subdomains) {
    const n = use_cases.filter((u) => u.subdomain === s.id).length
    console.log(`  ${s.name.padEnd(24)}${String(n).padStart(3)} use cases, headcount ${s.headcount}, margin/unit ${gbp(s.margin_per_unit_gbp)}`)
  }
  void subById

  const checks: Check[] = [
    { name: 'no island use cases', pass: islandUcs.length === 0, detail: `${islandUcs.length} use cases with no edges` },
    { name: 'no island platforms', pass: islandPlatforms.length === 0, detail: `${islandPlatforms.length} platforms with no riders: ${islandPlatforms.map((p) => p.id).join(', ') || 'none'}` },
    { name: 'every use case touches an integration node', pass: ucsWithoutIntegration.length === 0, detail: `${ucsWithoutIntegration.length} without: ${ucsWithoutIntegration.map((u) => u.id).join(', ') || 'none'}` },
    { name: 'use cases crossing 3+ subdomains >= 4', pass: crossers.length >= 4, detail: `${crossers.length} found` },
    { name: 'cloud data platform: HIGH fan-in from Data and Analytics', pass: dataFromAnalytics === analyticsTotal, detail: `${dataFromAnalytics} of ${analyticsTotal} analytics use cases` },
    { name: 'cloud data platform: fan-in from every subdomain', pass: dataSubs.size === subdomains.length, detail: `${dataSubs.size} of ${subdomains.length} subdomains feed it` },
  ]
  if (opts.requireIdentityMaxFanIn) {
    checks.push({
      name: 'max fan-in is identity or the cloud data platform',
      pass: maxFanIn.p.id === 'okta' || maxFanIn.p.id === dataPlatformId,
      detail: `max fan-in is ${maxFanIn.p.id}`,
    })
    checks.push({
      name: 'identity has fan-in from nearly everything (>= 90 percent)',
      pass: riders.get('okta')!.length >= Math.ceil(use_cases.length * 0.9),
      detail: `${riders.get('okta')!.length} of ${use_cases.length} use cases`,
    })
    checks.push({
      name: 'Claims rides ClaimCenter, ServiceNow, Salesforce, OpenText, Adyen, Kafka',
      pass: claimsMissing.length === 0,
      detail: claimsMissing.length ? `missing: ${claimsMissing.join(', ')}` : 'all six present',
    })
  } else {
    checks.push({
      name: 'largest blast radius by volume at risk is an integration node',
      pass: byId.get(topVol[0])!.type === 'integration',
      detail: `${byId.get(topVol[0])!.id} is ${byId.get(topVol[0])!.type}`,
    })
    checks.push({
      name: 'twelve platforms in the best of breed estate',
      pass: platforms.filter((p) => p.type === 'platform').length === 12,
      detail: `${platforms.filter((p) => p.type === 'platform').length} platforms`,
    })
  }

  console.log(`\nchecks`)
  for (const c of checks) {
    console.log(`  [${c.pass ? 'PASS' : 'FAIL'}] ${c.name.padEnd(60)} ${c.detail}`)
  }
  return checks
}

// ---------------------------------------------------------------------------

function main(): void {
  const specById = new Map(PLATFORMS.map((p) => [p.id, p]))
  const bobSpecById = new Map<string, PlatformSpec>([
    ...BOB_PLATFORMS.map((p) => [p.id, p] as const),
    ...PLATFORMS.filter((p) => INTEGRATION_IDS.includes(p.id)).map((p) => [p.id, p] as const),
  ])

  const rngA = makeRng(SEED)
  const concentrated: Estate = {
    label: 'Harbourline Insurance, concentrated',
    provenance: PROVENANCE,
    option_model: OPTION_MODEL,
    outage_fraction_beta: OUTAGE_FRACTION_BETA,
    subdomains: SUBDOMAINS.map(toSubdomain),
    platforms: PLATFORMS.map(toPlatform),
    use_cases: USE_CASES.map((uc) => ({
      id: uc.id, name: uc.name, subdomain: uc.subdomain,
      volume_per_month: uc.volume_per_month, adopted_month: uc.adopted_month,
      value_flow: uc.value_flow,
      edges: buildEdges(rngA, uc, specById, 'concentrated'),
    })),
  }

  const rngB = makeRng(SEED + 1)
  const bestOfBreed: Estate = {
    label: 'Harbourline Insurance, best of breed',
    provenance: { ...PROVENANCE, graph_version: '2026-09-05-b' },
    option_model: OPTION_MODEL,
    outage_fraction_beta: OUTAGE_FRACTION_BETA,
    subdomains: SUBDOMAINS.map(toSubdomain),
    platforms: [
      ...BOB_PLATFORMS.map(toPlatform),
      ...PLATFORMS.filter((p) => INTEGRATION_IDS.includes(p.id)).map(toPlatform),
    ],
    use_cases: buildBobUseCases(rngB, bobSpecById),
  }

  const checksA = report(concentrated, { requireIdentityMaxFanIn: true })
  const checksB = report(bestOfBreed, { requireIdentityMaxFanIn: false })

  mkdirSync('data', { recursive: true })
  writeFileSync('data/estate.json', JSON.stringify(concentrated, null, 2) + '\n')
  writeFileSync('data/estate_bestofbreed.json', JSON.stringify(bestOfBreed, null, 2) + '\n')
  console.log(`\nwrote data/estate.json and data/estate_bestofbreed.json`)

  writePrecomputed(concentrated, bestOfBreed)

  const failed = [...checksA, ...checksB].filter((c) => !c.pass)
  if (failed.length > 0) {
    console.error(`\nGENERATOR FAILED: ${failed.length} realism check(s) did not hold.`)
    for (const f of failed) console.error(`  - ${f.name}: ${f.detail}`)
    process.exit(1)
  }
  console.log(`all realism checks passed\n`)
}

/**
 * Bake a small set of Monte Carlo runs into the bundle.
 *
 * Opened from a file:// URL the browser blocks the inline module worker without
 * logging anything, so views 3 and 5 would wait forever. These frames let the
 * dependence slider still move offline, snapping to the nearest stored rho.
 *
 * Both estates run on the one seed the live call sites use, so the offline
 * numbers are the same numbers the worker would have produced, not a
 * different draw, and the two shapes are compared on a common draw.
 */
function writePrecomputed(concentrated: Estate, bestOfBreed: Estate): void {
  const index: PrecomputedIndex = {}
  for (const [estate, seed] of [[concentrated, SEED], [bestOfBreed, SEED]] as const) {
    const frames = PRECOMPUTED_RHOS.map((rho) => {
      const r = simulate({ estate, rho, nu: 4, runs: PRECOMPUTED_RUNS, seed })
      process.stdout.write(`  precomputed ${estate.provenance.graph_version} rho ${rho} in ${r.elapsedMs} ms\n`)
      return packFrame(r)
    })
    index[estate.provenance.graph_version] = {
      runs: PRECOMPUTED_RUNS,
      nu: 4,
      seed,
      platformIds: estate.platforms.map((p) => p.id),
      useCaseIds: estate.use_cases.map((u) => u.id),
      subdomainIds: estate.subdomains.map((s) => s.id),
      frames,
    }
  }
  const json = JSON.stringify(index)
  writeFileSync('data/precomputed.json', json + '\n')
  console.log(`wrote data/precomputed.json, ${(json.length / 1024).toFixed(1)} KB`)
}

main()
