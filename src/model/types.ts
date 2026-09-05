// Data shape for the synthetic estate. Spec section 3.
// Every number in these files is SYNTHETIC. Nothing here is a measurement.
//
// Provenance fields are required by canon 9.8.2, which states that an entry
// missing the graph version or the decomposition owner "is not a ledger entry".
// The spec does not ask for them. They are added rather than omitted.

export type NodeType = 'platform' | 'integration'

export type AllocationRule =
  | 'equal' // canon 9.2.8, permitted, default, b_u(n) = 1 / |consumers(n)|
  | 'driver' // canon 9.2.8, permitted, b_u(n) = w_u(n)
  | 'by_volume' // spec section 6, partition-independent but not on 9.2.8's permitted list
  | 'by_head' // spec section 6, two-stage, PROHIBITED by 9.2.8, shown as a counter-example

export interface Platform {
  id: string
  name: string
  category: string
  type: NodeType
  fixed_pool_gbp_month: number
  driver_name: string
  driver_unit_cost_gbp: number
  capacity_note: string
  failure_lef: number // loss event frequency per year, base rate
  failure_loss_lognormal: { mu: number; sigma: number } // direct loss in GBP
  adopted_month: number // month it landed on the estate, for view 4

  // Switching cost inputs. Canon 9.5.2 decomposition, 9.5.5 valuation engine.
  // K_committed is what it costs to move today; it hardens with riders and
  // tenure. K_reversible is the DECLARED counterfactual. Canon 9.5.7 requires
  // that counterfactual to be evidenced from a dated decision record; a
  // synthetic estate has no decision record, so `counterfactual_evidenced` is
  // false everywhere and canon 9.9 would refuse the option component. The tool
  // computes it anyway, as a teaching artefact, and never renders it outside
  // the element carrying that refusal.
  exit_base_execution_gbp: number
  exit_k_reversible_gbp: number
  counterfactual_evidenced: false
  counterfactual_note: string
  delta_v_median_gbp: number // benefit of being able to switch
  delta_v_log_sd: number
}

export interface UseCaseEdge {
  platform_id: string
  driver_units_per_volume_unit: number
  // Probability the use case is unavailable given the platform is unavailable.
  // Edge property. Spec section 3.4. This is how risk propagates.
  conditional_failure_prob: number
}

export interface UseCase {
  id: string
  name: string
  subdomain: string
  volume_per_month: number
  adopted_month: number
  edges: UseCaseEdge[]
}

export interface Subdomain {
  id: string
  name: string
  scope: string
  headcount: number // used only by the prohibited by_head rule
  margin_per_unit_gbp: number // spec section 6, margin_per_unit(sub). Made up.
}

export interface Provenance {
  // Canon 9.8.2. Required reported fields, not optional.
  graph_version: string
  graph_as_at: string
  decomposition_owner: string
  decomposition_revised: string
  seed: number
  synthetic: true
}

export interface OptionModel {
  // Canon 9.5.5, Datar-Mathews two-rate. Values are synthetic and deliberately
  // NOT those of canon 9.10, per spec section 9 non-goals.
  horizon_years: number
  mu_risk_adjusted: number
  r_risk_free: number
  paths: number
}

export interface Estate {
  label: string
  provenance: Provenance
  option_model: OptionModel
  outage_fraction_beta: { alpha: number; beta: number } // spec section 6, made up
  subdomains: Subdomain[]
  platforms: Platform[]
  use_cases: UseCase[]
}
