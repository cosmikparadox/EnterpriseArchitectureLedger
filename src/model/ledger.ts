// All formulas for Ledger Explorer, in one file, per spec section 6 and
// deliverable list section 11.
//
// Every function below carries two references: the spec label it implements,
// and the canon section it follows. Where the two disagree the canon wins and
// the disagreement is recorded in README under "Deviations from spec".
//
// THE COEFFICIENTS ARE MADE UP. They exist to make the picture move in the
// right direction, not to be right. Nothing computed here is a measurement.

import type {
  AllocationRule, Estate, Platform, Subdomain, UseCase, UseCaseEdge, OptionModel,
} from './types'
import { normal, type Rng } from './rng'

// ---------------------------------------------------------------------------
// Indexing
// ---------------------------------------------------------------------------

export interface Rider {
  uc: UseCase
  edge: UseCaseEdge
}

export interface Index {
  estate: Estate
  platformById: Map<string, Platform>
  subdomainById: Map<string, Subdomain>
  useCaseById: Map<string, UseCase>
  /** Consumers of each node. Canon 9.2.8 defines b_u(n) over consumers(n). */
  ridersOf: Map<string, Rider[]>
}

export function buildIndex(estate: Estate): Index {
  const platformById = new Map(estate.platforms.map((p) => [p.id, p]))
  const subdomainById = new Map(estate.subdomains.map((s) => [s.id, s]))
  const useCaseById = new Map(estate.use_cases.map((u) => [u.id, u]))
  const ridersOf = new Map<string, Rider[]>()
  for (const p of estate.platforms) ridersOf.set(p.id, [])
  for (const uc of estate.use_cases) {
    for (const edge of uc.edges) {
      const list = ridersOf.get(edge.platform_id)
      if (!list) throw new Error(`use case ${uc.id} rides unknown platform ${edge.platform_id}`)
      list.push({ uc, edge })
    }
  }
  return { estate, platformById, subdomainById, useCaseById, ridersOf }
}

// ---------------------------------------------------------------------------
// Axis one: cost
// ---------------------------------------------------------------------------

/**
 * edge_spend(uc, p) = volume(uc) * units_per_volume(uc,p) * unit_cost(p)
 * Spec section 6. Canon 9.2.2: this is the variable pool allocated on a
 * metered causal driver, which is the defensible half of the cost figure.
 */
export function edgeSpend(uc: UseCase, edge: UseCaseEdge, p: Platform): number {
  return uc.volume_per_month * edge.driver_units_per_volume_unit * p.driver_unit_cost_gbp
}

/** driver_u(n): the use case's demand on the node, in driver units. Canon 9.2.2. */
export function driverUnits(uc: UseCase, edge: UseCaseEdge): number {
  return uc.volume_per_month * edge.driver_units_per_volume_unit
}

/**
 * metered_spend(p) = sum over riders of edge_spend
 * Spec section 6, and spec section 5.1 notes this one DOES add "because it is
 * one meter".
 *
 * Canon 9.2.2 qualifies that: the weight w_u(n) is a share only if the
 * denominator runs over EVERY consumer of n. In this synthetic estate the
 * generator emits all consumers, so the sum is complete and the spec's claim
 * holds here. On a real mined graph, where the ledger normally holds a subset
 * of consumers, it would not. See README.
 */
export function meteredSpend(ix: Index, platformId: string, riders?: Rider[]): number {
  const p = ix.platformById.get(platformId)!
  const rs = riders ?? ix.ridersOf.get(platformId)!
  return rs.reduce((acc, r) => acc + edgeSpend(r.uc, r.edge, p), 0)
}

/**
 * b_u(n), the fixed allocation basis. Canon 9.2.8 (added v3.1d, R23) is the
 * authority here and it constrains the choice:
 *
 *   Permitted:   equal split      b_u(n) = 1 / |consumers(n)|   [default]
 *                driver-proportional  b_u(n) = w_u(n)
 *   Prohibited:  any TWO-STAGE basis that allocates first to a subdomain and
 *                then within it.
 *   In all cases sum over u of b_u(n) = 1.
 *
 * The spec (section 4.2, section 6) offers three rules. 'equal' is the canon's
 * default. 'by_volume' is partition-independent, so it satisfies the MUST, but
 * it is not one of the two bases 9.2.8 lists as permitted. 'by_head' allocates
 * on subdomain size and is exactly the prohibited two-stage shape; it ships
 * only because spec section 4.6 and acceptance 6 require it to be demonstrable,
 * and it is labelled as prohibited on screen. 'driver' is added here so the
 * permitted set is representable at all.
 */
export function basis(ix: Index, platformId: string, ucId: string, rule: AllocationRule, riders?: Rider[]): number {
  const rs = riders ?? ix.ridersOf.get(platformId)!
  if (rs.length === 0) return 0
  const mine = rs.find((r) => r.uc.id === ucId)
  if (!mine) return 0

  switch (rule) {
    // Canon 9.2.8 permitted, default, matches the worked example at 9.10.
    case 'equal':
      return 1 / rs.length

    // Canon 9.2.8 permitted: b_u(n) = w_u(n), the same causal driver used for
    // the variable pool.
    case 'driver': {
      const total = rs.reduce((a, r) => a + driverUnits(r.uc, r.edge), 0)
      return total === 0 ? 1 / rs.length : driverUnits(mine.uc, mine.edge) / total
    }

    // Spec section 6. Partition-independent, but business volume is not the
    // node's driver, so this is not the canon's driver-proportional basis.
    case 'by_volume': {
      const total = rs.reduce((a, r) => a + r.uc.volume_per_month, 0)
      return total === 0 ? 1 / rs.length : mine.uc.volume_per_month / total
    }

    // Spec section 6. PROHIBITED by canon 9.2.8: it reaches the numbers through
    // the declared subdomain decomposition, which is the one thing 9.2.8 exists
    // to keep out of the cost axis. Kept as a counter-example for view 6.
    case 'by_head': {
      const sizeOf = (u: UseCase) => ix.subdomainById.get(u.subdomain)?.headcount ?? 0
      const total = rs.reduce((a, r) => a + sizeOf(r.uc), 0)
      return total === 0 ? 1 / rs.length : sizeOf(mine.uc) / total
    }
  }
}

/**
 * rule_share(p, uc) = b_u(p) * fixed_pool(p)
 * Spec section 6. Canon 9.2.6: this is the declared, arbitrary half of the cost
 * figure and it must not inform a decision about leaving the node.
 */
export function ruleShare(ix: Index, platformId: string, ucId: string, rule: AllocationRule, riders?: Rider[]): number {
  const p = ix.platformById.get(platformId)!
  return basis(ix, platformId, ucId, rule, riders) * p.fixed_pool_gbp_month
}

/**
 * reported_cost(uc, p) = edge_spend(uc,p) + rule_share(p,uc)
 * Spec section 6. Canon 9.2.2's C_run(u) term for a single node.
 */
export function reportedCost(ix: Index, platformId: string, ucId: string, rule: AllocationRule, riders?: Rider[]): number {
  const p = ix.platformById.get(platformId)!
  const rs = riders ?? ix.ridersOf.get(platformId)!
  const mine = rs.find((r) => r.uc.id === ucId)
  if (!mine) return 0
  return edgeSpend(mine.uc, mine.edge, p) + ruleShare(ix, platformId, ucId, rule, rs)
}

/**
 * C1(p) = sum rule_share(p, riders) / sum reported_cost(riders, p)
 *       = fixed_pool(p) / (fixed_pool(p) + metered_spend(p))
 *
 * Spec section 6. The two expressions are identical exactly because canon 9.2.8
 * requires sum over u of b_u(n) = 1.
 *
 * On direction: canon 9.2.6 makes a claim about DEFENSIBILITY, not magnitude,
 * so it neither contradicts nor confirms which way this moves as fan-in rises.
 * No directional claim is made anywhere in the interface. See README.
 */
export function c1(ix: Index, platformId: string, riders?: Rider[]): number {
  const p = ix.platformById.get(platformId)!
  const ms = meteredSpend(ix, platformId, riders)
  const denom = p.fixed_pool_gbp_month + ms
  return denom === 0 ? 0 : p.fixed_pool_gbp_month / denom
}

/**
 * cost_per_unit(uc) = sum over p of reported_cost(uc,p) / volume(uc)
 * Spec section 6 and section 5.2 require this shown as a RANGE across rules,
 * because the spread across rules is the honest number. Canon 9.8.1 calls the
 * same construction method spread: if two defensible methods disagree, publish
 * the gap rather than hiding behind whichever you chose.
 */
export function costPerUnit(ix: Index, ucId: string, rule: AllocationRule): number {
  const uc = ix.useCaseById.get(ucId)!
  if (uc.volume_per_month === 0) return 0
  let total = 0
  for (const edge of uc.edges) total += reportedCost(ix, edge.platform_id, ucId, rule)
  return total / uc.volume_per_month
}

export interface CostRange { metered: number; low: number; high: number; current: number }

export function costPerUnitRange(ix: Index, ucId: string, rule: AllocationRule): CostRange {
  const uc = ix.useCaseById.get(ucId)!
  const rules: AllocationRule[] = ['equal', 'driver', 'by_volume', 'by_head']
  const values = rules.map((r) => costPerUnit(ix, ucId, r))
  let metered = 0
  for (const edge of uc.edges) {
    metered += edgeSpend(uc, edge, ix.platformById.get(edge.platform_id)!)
  }
  return {
    metered: uc.volume_per_month === 0 ? 0 : metered / uc.volume_per_month,
    low: Math.min(...values),
    high: Math.max(...values),
    current: costPerUnit(ix, ucId, rule),
  }
}

// ---------------------------------------------------------------------------
// Switching cost. Canon 9.5.
// ---------------------------------------------------------------------------

/**
 * K_committed: what it costs to move today. Spec section 6 grows the exit
 * figure with riders; canon 9.5.3 makes K a property of the commitment. Both
 * are satisfied by hardening K as the footprint accretes.
 *
 * Coefficients 0.15 per rider and 0.02 per month are the spec's and are made up.
 */
export function kCommitted(p: Platform, nRiders: number, monthsSinceAdopted: number): number {
  return p.exit_base_execution_gbp * (1 + 0.15 * nRiders) * (1 + 0.02 * monthsSinceAdopted)
}

/**
 * Execution component of switching cost. Canon 9.5.2 and the worked example at
 * 9.10, where the execution component is the difference between the committed
 * and reversible switching costs. Deterministic, one-time, an engineering
 * estimate that does not depend on uncertainty.
 */
export function executionComponent(p: Platform, nRiders: number, monthsSinceAdopted: number): number {
  return Math.max(0, kCommitted(p, nRiders, monthsSinceAdopted) - p.exit_k_reversible_gbp)
}

/**
 * W(K), the switching-option value. Canon 9.5.5, the published Datar-Mathews
 * method with TWO rates applied to the two legs BEFORE the max is taken:
 *
 *   W(K) = E[ max( Delta_V * e^(-mu*T) - K * e^(-r*T), 0 ) ]
 *
 * The uncertain benefit is discounted at the risk-adjusted rate because it is
 * risky; the switching cost at the risk-free rate because it is a known amount.
 * The discounting happens inside the max, on each leg separately. Canon 9.5.5:
 * "That placement is the whole correction."
 *
 * Canon 9.5.6: this makes no tradeability claim. Real-world probabilities with
 * risk-adjusted discounting is not a no-arbitrage valuation and the result is
 * not a market value.
 *
 * Samples are drawn once and reused across K so that W(K) is a smooth curve in
 * K rather than a scatter of independently simulated points. Canon 9.5.3 needs
 * a stable sign for the difference, and 9.5.4 needs the curve.
 */
export function makeOptionEngine(p: Platform, model: OptionModel, rng: Rng): (k: number) => number {
  const { horizon_years: T, mu_risk_adjusted: mu, r_risk_free: r, paths } = model
  const logMedian = Math.log(p.delta_v_median_gbp)
  const benefitDiscount = Math.exp(-mu * T)
  const costDiscount = Math.exp(-r * T)
  const legs = new Float64Array(paths)
  for (let i = 0; i < paths; i++) {
    const dv = Math.exp(logMedian + p.delta_v_log_sd * normal(rng))
    legs[i] = dv * benefitDiscount
  }
  legs.sort()
  // Suffix sums let W(K) be evaluated in O(log n) per K, which matters because
  // the W(K) curve required by canon 9.5.4 needs many evaluations.
  const suffix = new Float64Array(paths + 1)
  for (let i = paths - 1; i >= 0; i--) suffix[i] = suffix[i + 1]! + legs[i]!
  return (k: number): number => {
    const strike = k * costDiscount
    // first index with legs[i] > strike
    let lo = 0, hi = paths
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (legs[mid]! > strike) hi = mid
      else lo = mid + 1
    }
    const count = paths - lo
    if (count === 0) return 0
    return (suffix[lo]! - strike * count) / paths
  }
}

/**
 * OC(d) = W(K_reversible, T) - W(K_committed, T)
 * Canon 9.5.3: one model, two switching-cost settings, horizon held constant.
 * W is weakly decreasing in K, so the difference has a stable sign, and it
 * therefore RISES as the commitment hardens.
 *
 * Canon 9.5.7 and 9.9: K_reversible may be set only from an alternative
 * evidenced by a dated artefact in the decision record. A synthetic estate has
 * none, so `counterfactual_evidenced` is false on every platform and a real
 * ledger would refuse this number. It is computed here as a teaching artefact
 * and never rendered outside the element carrying that refusal.
 */
export function optionComponent(w: (k: number) => number, p: Platform, nRiders: number, monthsSinceAdopted: number): number {
  return Math.max(0, w(p.exit_k_reversible_gbp) - w(kCommitted(p, nRiders, monthsSinceAdopted)))
}

/**
 * The W(K) curve required by canon 9.5.4. Reporting an option component without
 * it is not checkable, and canon 9.8.2 lists the curve as a required field.
 * Canon 9.5.4 also requires a REFUSAL where the two reporting points straddle a
 * discontinuity or a flat-then-sharp transition; `monotone` reports whether the
 * curve is well behaved between them.
 */
export interface WCurve { points: { k: number; w: number }[]; kReversible: number; kCommitted: number; monotone: boolean }

export function wCurve(w: (k: number) => number, p: Platform, nRiders: number, monthsSinceAdopted: number, steps = 60): WCurve {
  const kc = kCommitted(p, nRiders, monthsSinceAdopted)
  const kMax = Math.max(kc, p.exit_k_reversible_gbp) * 1.35
  const points: { k: number; w: number }[] = []
  for (let i = 0; i <= steps; i++) {
    const k = (kMax * i) / steps
    points.push({ k, w: w(k) })
  }
  let monotone = true
  for (let i = 1; i < points.length; i++) {
    if (points[i]!.w > points[i - 1]!.w + 1e-6) monotone = false
  }
  return { points, kReversible: p.exit_k_reversible_gbp, kCommitted: kc, monotone }
}

// ---------------------------------------------------------------------------
// Axis two: risk. Canon 9.3.
// ---------------------------------------------------------------------------

/** Regularized incomplete beta, continued fraction. Needed for the t CDF. */
function betacf(a: number, b: number, x: number): number {
  const FPMIN = 1e-300, EPS = 3e-12
  const qab = a + b, qap = a + 1, qam = a - 1
  let c = 1
  let d = 1 - (qab * x) / qap
  if (Math.abs(d) < FPMIN) d = FPMIN
  d = 1 / d
  let h = d
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    h *= d * c
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < EPS) break
  }
  return h
}

function lgamma(z: number): number {
  const g = [676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7]
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z)
  z -= 1
  let x = 0.99999999999980993
  for (let i = 0; i < g.length; i++) x += g[i]! / (z + i + 1)
  const t = z + g.length - 0.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
}

function betai(a: number, b: number, x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x))
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b
}

/** Student-t CDF. Used to map correlated t variates onto uniforms. */
export function studentTCdf(x: number, nu: number): number {
  const p = 0.5 * betai(nu / 2, 0.5, nu / (nu + x * x))
  return x > 0 ? 1 - p : p
}

/** Inverse Student-t CDF by bisection. Computed once per platform, never in a run. */
export function studentTQuantile(prob: number, nu: number): number {
  if (prob <= 0) return -Infinity
  if (prob >= 1) return Infinity
  let lo = -60, hi = 60
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (studentTCdf(mid, nu) < prob) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/**
 * Per-platform t thresholds for the monthly failure probability.
 *
 * Comparing U = tCdf(t) against p is identical to comparing t against
 * tQuantile(p), because the CDF is strictly increasing. Doing it the second way
 * moves the incomplete beta out of the Monte Carlo loop, where it would
 * otherwise be evaluated once per platform per run.
 *
 * Monthly failure probability from an annual rate, spec section 6:
 *   fails ~ Bernoulli(1 - exp(-LEF/12))
 */
export function failureThresholds(platforms: Platform[], nu: number): Float64Array {
  const out = new Float64Array(platforms.length)
  platforms.forEach((p, i) => {
    out[i] = studentTQuantile(1 - Math.exp(-p.failure_lef / 12), nu)
  })
  return out
}

/**
 * Draw one set of platform failure indicators under a Student-t copula.
 *
 * Spec section 6 asks for a GAUSSIAN copula. Canon 9.3.8 forbids it: "Do not
 * use a Gaussian copula. It has zero tail dependence ... Use a Student-t or
 * another tail-dependent family and declare it." The canon wins.
 *
 * Equicorrelation is built as z_i = sqrt(rho)*w + sqrt(1-rho)*e_i, then divided
 * by sqrt(chi2_nu / nu) with the chi-square SHARED across platforms. That
 * shared denominator is the tail dependence, and it is why rho = 0 here is
 * uncorrelated but NOT independent, unlike the Gaussian case the spec assumed.
 * Recorded in README.
 */
export function drawFailures(thresholds: Float64Array, rho: number, nu: number, rng: Rng, out: boolean[]): boolean[] {
  const w = normal(rng)
  const a = Math.sqrt(Math.max(0, Math.min(1, rho)))
  const b = Math.sqrt(1 - a * a)
  let chi = 0
  for (let i = 0; i < nu; i++) { const n = normal(rng); chi += n * n }
  const scale = Math.sqrt(nu / chi)
  for (let i = 0; i < thresholds.length; i++) {
    out[i] = (a * w + b * normal(rng)) * scale < thresholds[i]!
  }
  return out
}

/**
 * Median of Beta(a, b), by bisection on the regularized incomplete beta.
 * Used only by the stripped diagnostic run, which fixes loss magnitude at its
 * median so that the only randomness left is the copula factor.
 */
export function betaMedian(a: number, b: number): number {
  let lo = 0, hi = 1
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (betai(a, b, mid) < 0.5) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** Beta(a,b) for SMALL integer shapes, via sums of exponentials. O(a + b) per
 * draw, which is fine for the estate's Beta(2, 14) and would not be for large
 * shape parameters. */
function betaDraw(a: number, b: number, rng: Rng): number {
  let x = 0, y = 0
  for (let i = 0; i < a; i++) x -= Math.log(1 - rng.next())
  for (let i = 0; i < b; i++) y -= Math.log(1 - rng.next())
  return x / (x + y)
}

/**
 * Diagnostic switches. Not reachable from the interface: these exist so the
 * README can isolate WHICH random source holds the non-additivity gap open at
 * rho = 1.0. See "Acceptance check 3, replaced" in README.
 */
export interface SimOptions {
  /**
   * Fix every loss magnitude at its median: the platform direct loss at
   * exp(mu), and the outage fraction at the median of its Beta. The remaining
   * randomness is then the copula factor and the per-edge propagation draw.
   */
  fixedMagnitudes?: boolean
}

export interface RunResult {
  /** Direct loss per platform, GBP. Canon 9.3.1 LM_primary only; see README. */
  platformLoss: Map<string, number>
  /** Business interruption loss per use case, GBP. */
  useCaseLoss: Map<string, number>
  /** Within-run sum per subdomain. Canon 9.8.3 makes this the LEGITIMATE sum. */
  subdomainLoss: Map<string, number>
}

/**
 * One Monte Carlo run. Spec section 6.
 *
 * The within-run summation into a subdomain figure is legitimate: it is one
 * draw of a joint quantity. What is NOT legitimate, and what the view 3 exhibit
 * exists to show, is adding per-use-case P99s together. Canon 9.8.3 result two:
 * "VaR_q( sum of L_u ) = sum of VaR_q( L_u ) ONLY under comonotonicity."
 */
export function runOnce(ix: Index, rho: number, nu: number, rng: Rng, thresholds?: Float64Array, opts?: SimOptions): RunResult {
  const { platforms, use_cases, outage_fraction_beta } = ix.estate
  const fixed = opts?.fixedMagnitudes === true
  const th = thresholds ?? failureThresholds(platforms, nu)
  const failed = drawFailures(th, rho, nu, rng, new Array<boolean>(platforms.length))
  const failedById = new Map<string, boolean>()
  const platformLoss = new Map<string, number>()
  platforms.forEach((p, i) => {
    const f = failed[i]!
    failedById.set(p.id, f)
    // Drawn only when the platform actually failed, so the random stream is not
    // advanced by nodes that did not fail. exp(mu) is the lognormal's median, so
    // the fixed branch is fixing magnitude at the median.
    platformLoss.set(p.id, !f ? 0
      : fixed ? Math.exp(p.failure_loss_lognormal.mu)
      : Math.exp(p.failure_loss_lognormal.mu + p.failure_loss_lognormal.sigma * normal(rng)))
  })

  const outage = fixed
    ? betaMedian(outage_fraction_beta.alpha, outage_fraction_beta.beta)
    : betaDraw(outage_fraction_beta.alpha, outage_fraction_beta.beta, rng)
  const useCaseLoss = new Map<string, number>()
  const subdomainLoss = new Map<string, number>()
  for (const s of ix.estate.subdomains) subdomainLoss.set(s.id, 0)

  for (const uc of use_cases) {
    // Interrupted if any platform on its edges failed AND the edge propagated.
    // Canon 9.3.5: the common-cause structure lives in the copula above, so the
    // per-edge draw here is conditional propagation, not a second dependence
    // assumption.
    let interrupted = false
    for (const e of uc.edges) {
      if (failedById.get(e.platform_id) && rng.next() < e.conditional_failure_prob) { interrupted = true; break }
    }
    const margin = ix.subdomainById.get(uc.subdomain)?.margin_per_unit_gbp ?? 0
    const loss = interrupted ? uc.volume_per_month * margin * outage : 0
    useCaseLoss.set(uc.id, loss)
    subdomainLoss.set(uc.subdomain, (subdomainLoss.get(uc.subdomain) ?? 0) + loss)
  }
  return { platformLoss, useCaseLoss, subdomainLoss }
}

/** Percentile of an ascending-sorted array, nearest-rank. */
export function percentile(sortedAsc: number[], q: number): number {
  if (sortedAsc.length === 0) return 0
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.ceil(q * sortedAsc.length) - 1))
  return sortedAsc[idx]!
}
