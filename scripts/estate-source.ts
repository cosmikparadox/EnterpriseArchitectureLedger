// Hand-authored shape of the synthetic estate. Spec section 3.
// Harbourline Insurance is invented. A mid-size UK general insurer, roughly
// 4,000 staff, personal and commercial lines, direct and broker channels.
//
// Vendor names are landscape furniture. Spec hard rule A: no adjectives, no
// evaluative statement, no logos, no vendor colours. Hard rule B: the cloud
// data platform is invented and is not named after any real product.
//
// The generator fills driver units and conditional failure probabilities from
// the seed, inside the bands declared here. The wiring itself is authored so
// that the realism checks in spec section 3.5 are satisfiable by construction
// rather than by chance.

export interface PlatformSpec {
  id: string
  name: string
  category: string
  type: 'platform' | 'integration'
  fixed_pool_gbp_month: number
  driver_name: string
  driver_unit_cost_gbp: number
  capacity_note: string
  failure_lef: number
  loss_median_gbp: number
  loss_log_sd: number
  adopted_month: number
  exit_base_execution_gbp: number
  exit_k_reversible_gbp: number
  counterfactual_note: string
  delta_v_median_gbp: number
  delta_v_log_sd: number
  units_band: [number, number]
}

export const PLATFORMS: PlatformSpec[] = [
  { id: 'crm', name: 'CRM', category: 'CRM', type: 'platform',
    fixed_pool_gbp_month: 41000, driver_name: 'API calls', driver_unit_cost_gbp: 0.02,
    capacity_note: 'Licensed seats plus metered platform calls.',
    failure_lef: 0.42, loss_median_gbp: 180000, loss_log_sd: 1.10, adopted_month: 4,
    exit_base_execution_gbp: 520000, exit_k_reversible_gbp: 190000,
    counterfactual_note: 'A standard-interface CRM layer costed at adoption.',
    delta_v_median_gbp: 900000, delta_v_log_sd: 0.55, units_band: [4, 9] },

  { id: 'itsm', name: 'Service management', category: 'ITSM', type: 'platform',
    fixed_pool_gbp_month: 22000, driver_name: 'tickets', driver_unit_cost_gbp: 1.10,
    capacity_note: 'Subscription floor plus per-ticket processing.',
    failure_lef: 0.30, loss_median_gbp: 74000, loss_log_sd: 0.95, adopted_month: 9,
    exit_base_execution_gbp: 240000, exit_k_reversible_gbp: 95000,
    counterfactual_note: 'A workflow engine behind a service abstraction.',
    delta_v_median_gbp: 380000, delta_v_log_sd: 0.50, units_band: [0.15, 0.5] },

  { id: 'erp', name: 'ERP and ledger', category: 'ERP and general ledger', type: 'platform',
    fixed_pool_gbp_month: 58000, driver_name: 'postings', driver_unit_cost_gbp: 0.35,
    capacity_note: 'Reserved capacity sized to period close.',
    failure_lef: 0.18, loss_median_gbp: 410000, loss_log_sd: 1.25, adopted_month: 0,
    exit_base_execution_gbp: 1450000, exit_k_reversible_gbp: 640000,
    counterfactual_note: 'A ledger kept behind a posting interface.',
    delta_v_median_gbp: 1600000, delta_v_log_sd: 0.62, units_band: [2, 7] },

  { id: 'hcm', name: 'HR core', category: 'HCM', type: 'platform',
    fixed_pool_gbp_month: 19000, driver_name: 'seats', driver_unit_cost_gbp: 6.5,
    capacity_note: 'Per-seat subscription, weak coupling to volume.',
    failure_lef: 0.22, loss_median_gbp: 52000, loss_log_sd: 0.85, adopted_month: 13,
    exit_base_execution_gbp: 310000, exit_k_reversible_gbp: 130000,
    counterfactual_note: 'A payroll and records split evaluated at selection.',
    delta_v_median_gbp: 300000, delta_v_log_sd: 0.48, units_band: [0.02, 0.12] },

  { id: 'policy_admin', name: 'Policy administration', category: 'Policy administration', type: 'platform',
    fixed_pool_gbp_month: 96000, driver_name: 'policy transactions', driver_unit_cost_gbp: 0.55,
    capacity_note: 'Sized to peak renewal cycle, not to average load.',
    failure_lef: 0.26, loss_median_gbp: 620000, loss_log_sd: 1.30, adopted_month: 2,
    exit_base_execution_gbp: 1900000, exit_k_reversible_gbp: 760000,
    counterfactual_note: 'A rating engine kept separable from policy records.',
    delta_v_median_gbp: 2100000, delta_v_log_sd: 0.66, units_band: [0.8, 1.4] },

  { id: 'claims_admin', name: 'Claims administration', category: 'Claims', type: 'platform',
    fixed_pool_gbp_month: 74000, driver_name: 'claim transactions', driver_unit_cost_gbp: 0.9,
    capacity_note: 'Sized to surge events rather than steady state.',
    failure_lef: 0.28, loss_median_gbp: 480000, loss_log_sd: 1.20, adopted_month: 6,
    exit_base_execution_gbp: 1350000, exit_k_reversible_gbp: 540000,
    counterfactual_note: 'A claims core with the document path kept external.',
    delta_v_median_gbp: 1500000, delta_v_log_sd: 0.60, units_band: [0.9, 1.6] },

  { id: 'billing', name: 'Billing', category: 'Billing', type: 'platform',
    fixed_pool_gbp_month: 47000, driver_name: 'billing transactions', driver_unit_cost_gbp: 0.28,
    capacity_note: 'Baseline capacity held for monthly collection runs.',
    failure_lef: 0.24, loss_median_gbp: 260000, loss_log_sd: 1.05, adopted_month: 6,
    exit_base_execution_gbp: 780000, exit_k_reversible_gbp: 320000,
    counterfactual_note: 'A collections service behind a payments abstraction.',
    delta_v_median_gbp: 820000, delta_v_log_sd: 0.54, units_band: [0.6, 1.5] },

  { id: 'meridian', name: 'Data cloud', category: 'Cloud data platform', type: 'platform',
    fixed_pool_gbp_month: 63000, driver_name: 'credits', driver_unit_cost_gbp: 0.85,
    capacity_note: 'Committed spend tier plus metered compute credits.',
    failure_lef: 0.34, loss_median_gbp: 210000, loss_log_sd: 1.15, adopted_month: 17,
    exit_base_execution_gbp: 860000, exit_k_reversible_gbp: 250000,
    counterfactual_note: 'An open table format on object storage, evaluated at selection.',
    delta_v_median_gbp: 1250000, delta_v_log_sd: 0.70, units_band: [0.2, 0.9] },

  { id: 'bi', name: 'Business intelligence', category: 'Business intelligence', type: 'platform',
    fixed_pool_gbp_month: 11000, driver_name: 'report renders', driver_unit_cost_gbp: 0.05,
    capacity_note: 'Capacity reservation plus per-render cost.',
    failure_lef: 0.20, loss_median_gbp: 38000, loss_log_sd: 0.80, adopted_month: 19,
    exit_base_execution_gbp: 150000, exit_k_reversible_gbp: 62000,
    counterfactual_note: 'A semantic layer kept independent of the reporting tool.',
    delta_v_median_gbp: 190000, delta_v_log_sd: 0.45, units_band: [40, 260] },

  { id: 'marketing', name: 'Marketing automation', category: 'Marketing automation', type: 'platform',
    fixed_pool_gbp_month: 14000, driver_name: 'messages', driver_unit_cost_gbp: 0.006,
    capacity_note: 'Contracted send volume with overage pricing.',
    failure_lef: 0.26, loss_median_gbp: 44000, loss_log_sd: 0.90, adopted_month: 22,
    exit_base_execution_gbp: 195000, exit_k_reversible_gbp: 84000,
    counterfactual_note: 'A campaign service fed from the data platform.',
    delta_v_median_gbp: 230000, delta_v_log_sd: 0.52, units_band: [1.5, 5] },

  { id: 'doc_mgmt', name: 'Document management', category: 'Document management', type: 'platform',
    fixed_pool_gbp_month: 26000, driver_name: 'documents', driver_unit_cost_gbp: 0.04,
    capacity_note: 'Retention storage floor plus per-document handling.',
    failure_lef: 0.19, loss_median_gbp: 96000, loss_log_sd: 1.00, adopted_month: 3,
    exit_base_execution_gbp: 430000, exit_k_reversible_gbp: 165000,
    counterfactual_note: 'A content store addressed through a document interface.',
    delta_v_median_gbp: 470000, delta_v_log_sd: 0.50, units_band: [0.8, 2.5] },

  { id: 'payments', name: 'Payments', category: 'Payments', type: 'platform',
    fixed_pool_gbp_month: 9000, driver_name: 'payment transactions', driver_unit_cost_gbp: 0.14,
    capacity_note: 'Scheme access fees plus per-transaction pricing.',
    failure_lef: 0.16, loss_median_gbp: 145000, loss_log_sd: 1.05, adopted_month: 11,
    exit_base_execution_gbp: 210000, exit_k_reversible_gbp: 78000,
    counterfactual_note: 'A payment orchestration layer over two acquirers.',
    delta_v_median_gbp: 340000, delta_v_log_sd: 0.58, units_band: [0.5, 1.2] },

  { id: 'conduit', name: 'Integration hub', category: 'Integration platform', type: 'integration',
    fixed_pool_gbp_month: 31000, driver_name: 'integration messages', driver_unit_cost_gbp: 0.004,
    capacity_note: 'Runtime tier plus metered message throughput.',
    failure_lef: 0.38, loss_median_gbp: 165000, loss_log_sd: 1.10, adopted_month: 8,
    exit_base_execution_gbp: 590000, exit_k_reversible_gbp: 175000,
    counterfactual_note: 'Point-to-point contracts kept in the owning services.',
    delta_v_median_gbp: 700000, delta_v_log_sd: 0.64, units_band: [6, 20] },

  { id: 'api_gateway', name: 'API gateway', category: 'API gateway', type: 'integration',
    fixed_pool_gbp_month: 18000, driver_name: 'API calls', driver_unit_cost_gbp: 0.0022,
    capacity_note: 'Environment floor plus metered call volume.',
    failure_lef: 0.32, loss_median_gbp: 190000, loss_log_sd: 1.15, adopted_month: 7,
    exit_base_execution_gbp: 380000, exit_k_reversible_gbp: 120000,
    counterfactual_note: 'Gateway policy expressed in a portable configuration.',
    delta_v_median_gbp: 480000, delta_v_log_sd: 0.60, units_band: [9, 18] },

  { id: 'identity', name: 'Identity service', category: 'Identity', type: 'integration',
    fixed_pool_gbp_month: 24000, driver_name: 'authentications', driver_unit_cost_gbp: 0.009,
    capacity_note: 'Per-identity subscription with metered authentication.',
    failure_lef: 0.29, loss_median_gbp: 320000, loss_log_sd: 1.35, adopted_month: 5,
    exit_base_execution_gbp: 640000, exit_k_reversible_gbp: 165000,
    counterfactual_note: 'Standards-based federation with no proprietary claims.',
    delta_v_median_gbp: 780000, delta_v_log_sd: 0.68, units_band: [1.5, 3.2] },

  { id: 'event_bus', name: 'Event bus', category: 'Event bus', type: 'integration',
    fixed_pool_gbp_month: 21000, driver_name: 'events', driver_unit_cost_gbp: 0.0016,
    capacity_note: 'Cluster floor plus metered throughput and retention.',
    failure_lef: 0.27, loss_median_gbp: 130000, loss_log_sd: 1.05, adopted_month: 14,
    exit_base_execution_gbp: 460000, exit_k_reversible_gbp: 140000,
    counterfactual_note: 'An open protocol broker run on existing infrastructure.',
    delta_v_median_gbp: 560000, delta_v_log_sd: 0.62, units_band: [8, 26] },
]

export interface SubdomainSpec {
  id: string
  name: string
  scope: string
  headcount: number
  margin_per_unit_gbp: number
}

// Six declared business subdomains. Spec section 3.3: these are DECLARED. The
// generator does not derive them from the graph. That is the point, and it is
// also canon 9.1.2, which records the boundary as the hand-built half of a
// hybrid whose other half is mined.
export const SUBDOMAINS: SubdomainSpec[] = [
  { id: 'sales', name: 'Sales and Distribution', scope: 'quote, bind, broker portal, renewal', headcount: 780, margin_per_unit_gbp: 18 },
  { id: 'claims', name: 'Claims', scope: 'FNOL, triage, settlement, fraud referral', headcount: 1150, margin_per_unit_gbp: 26 },
  { id: 'finance', name: 'Finance', scope: 'GL close, reinsurance settlement, IFRS 17', headcount: 340, margin_per_unit_gbp: 140 },
  { id: 'service', name: 'Customer Service', scope: 'contact centre, self-service, complaints', headcount: 900, margin_per_unit_gbp: 6 },
  { id: 'people', name: 'People', scope: 'onboarding, payroll, learning', headcount: 210, margin_per_unit_gbp: 4 },
  { id: 'data', name: 'Pricing and reporting', scope: 'pricing model refresh, regulatory reports', headcount: 220, margin_per_unit_gbp: 95 },
]

export interface UseCaseSpec {
  id: string
  name: string
  subdomain: string
  volume_per_month: number
  adopted_month: number
  // First entry is the primary system of record for this use case and carries
  // the highest conditional failure probability.
  platforms: string[]
  // Where the value of this work lands: with a customer, with an outside
  // counterparty (a reinsurer, a supplier, a regulator), or inside the
  // company. A declared fact from the finance function, like the domain
  // boundaries, recorded in provenance with an owner and a date. Never a
  // figure: the tool derives nothing from it but the picture.
  value_flow: 'customer' | 'counterparty' | 'internal'
}

export const USE_CASES: UseCaseSpec[] = [
  // Sales and Distribution
  { id: 'uc_quote_bind', name: 'Quote and bind (direct)', subdomain: 'sales', volume_per_month: 48000, adopted_month: 4, platforms: ['policy_admin', 'crm', 'api_gateway', 'identity', 'meridian'], value_flow: 'customer' },
  { id: 'uc_broker_quote', name: 'Broker quote submission', subdomain: 'sales', volume_per_month: 31000, adopted_month: 10, platforms: ['policy_admin', 'conduit', 'api_gateway', 'identity', 'meridian'], value_flow: 'customer' },
  { id: 'uc_renewal', name: 'Renewal invitation', subdomain: 'sales', volume_per_month: 22000, adopted_month: 15, platforms: ['policy_admin', 'marketing', 'event_bus', 'identity', 'meridian'], value_flow: 'customer' },
  { id: 'uc_mta', name: 'Mid-term adjustment', subdomain: 'sales', volume_per_month: 14500, adopted_month: 12, platforms: ['policy_admin', 'billing', 'api_gateway', 'identity'], value_flow: 'customer' },
  { id: 'uc_broker_portal', name: 'Broker portal servicing', subdomain: 'sales', volume_per_month: 9800, adopted_month: 21, platforms: ['crm', 'policy_admin', 'conduit', 'identity', 'doc_mgmt'], value_flow: 'customer' },

  // Claims. Spec 3.5 requires this subdomain to ride claims administration,
  // service management, CRM, document management, payments and the event bus.
  { id: 'uc_fnol', name: 'First notification of loss', subdomain: 'claims', volume_per_month: 12400, adopted_month: 6, platforms: ['claims_admin', 'crm', 'event_bus', 'identity', 'api_gateway'], value_flow: 'customer' },
  { id: 'uc_claim_triage', name: 'Claim triage', subdomain: 'claims', volume_per_month: 11800, adopted_month: 18, platforms: ['claims_admin', 'itsm', 'meridian', 'identity', 'event_bus'], value_flow: 'internal' },
  { id: 'uc_claim_settle', name: 'Claim settlement', subdomain: 'claims', volume_per_month: 7600, adopted_month: 11, platforms: ['claims_admin', 'payments', 'billing', 'identity', 'doc_mgmt'], value_flow: 'customer' },
  { id: 'uc_fraud_referral', name: 'Fraud referral', subdomain: 'claims', volume_per_month: 1450, adopted_month: 26, platforms: ['claims_admin', 'meridian', 'itsm', 'identity', 'event_bus'], value_flow: 'internal' },
  { id: 'uc_claim_docs', name: 'Claim document handling', subdomain: 'claims', volume_per_month: 18900, adopted_month: 8, platforms: ['doc_mgmt', 'claims_admin', 'conduit', 'identity'], value_flow: 'customer' },

  // Finance
  { id: 'uc_gl_close', name: 'General ledger close', subdomain: 'finance', volume_per_month: 620, adopted_month: 1, platforms: ['erp', 'meridian', 'conduit', 'identity'], value_flow: 'internal' },
  { id: 'uc_reins_settle', name: 'Reinsurance settlement', subdomain: 'finance', volume_per_month: 310, adopted_month: 16, platforms: ['erp', 'billing', 'conduit', 'identity', 'meridian'], value_flow: 'counterparty' },
  { id: 'uc_ifrs17', name: 'IFRS 17 reporting', subdomain: 'finance', volume_per_month: 240, adopted_month: 29, platforms: ['erp', 'meridian', 'bi', 'identity'], value_flow: 'counterparty' },
  { id: 'uc_premium_recon', name: 'Premium reconciliation', subdomain: 'finance', volume_per_month: 4200, adopted_month: 13, platforms: ['billing', 'erp', 'payments', 'identity', 'event_bus'], value_flow: 'counterparty' },
  { id: 'uc_supplier_pay', name: 'Supplier payment run', subdomain: 'finance', volume_per_month: 1900, adopted_month: 5, platforms: ['erp', 'payments', 'conduit', 'identity'], value_flow: 'counterparty' },

  // Customer Service
  { id: 'uc_contact_centre', name: 'Contact centre handling', subdomain: 'service', volume_per_month: 64000, adopted_month: 4, platforms: ['crm', 'itsm', 'api_gateway', 'identity', 'policy_admin'], value_flow: 'customer' },
  { id: 'uc_self_service', name: 'Self-service portal', subdomain: 'service', volume_per_month: 88000, adopted_month: 20, platforms: ['crm', 'api_gateway', 'identity', 'policy_admin', 'billing'], value_flow: 'customer' },
  { id: 'uc_complaints', name: 'Complaints handling', subdomain: 'service', volume_per_month: 3400, adopted_month: 9, platforms: ['itsm', 'crm', 'doc_mgmt', 'identity', 'meridian'], value_flow: 'customer' },
  { id: 'uc_cust_docs', name: 'Customer correspondence', subdomain: 'service', volume_per_month: 41000, adopted_month: 3, platforms: ['doc_mgmt', 'crm', 'conduit', 'identity'], value_flow: 'customer' },
  { id: 'uc_payment_query', name: 'Payment query', subdomain: 'service', volume_per_month: 12700, adopted_month: 14, platforms: ['billing', 'payments', 'crm', 'identity', 'api_gateway'], value_flow: 'customer' },

  // People
  { id: 'uc_onboarding', name: 'Employee onboarding', subdomain: 'people', volume_per_month: 260, adopted_month: 13, platforms: ['hcm', 'identity', 'itsm', 'conduit'], value_flow: 'internal' },
  { id: 'uc_payroll', name: 'Payroll run', subdomain: 'people', volume_per_month: 4000, adopted_month: 13, platforms: ['hcm', 'erp', 'identity', 'conduit'], value_flow: 'internal' },
  { id: 'uc_learning', name: 'Learning and compliance', subdomain: 'people', volume_per_month: 3800, adopted_month: 24, platforms: ['hcm', 'identity', 'meridian'], value_flow: 'internal' },
  { id: 'uc_leaver', name: 'Leaver process', subdomain: 'people', volume_per_month: 190, adopted_month: 13, platforms: ['hcm', 'identity', 'itsm', 'conduit'], value_flow: 'internal' },
  { id: 'uc_people_report', name: 'People reporting', subdomain: 'people', volume_per_month: 140, adopted_month: 27, platforms: ['hcm', 'meridian', 'bi', 'conduit'], value_flow: 'internal' },

  // Data and Analytics. Spec 3.5 requires HIGH fan-in to the cloud data
  // platform from this subdomain.
  { id: 'uc_pricing_refresh', name: 'Pricing model refresh', subdomain: 'data', volume_per_month: 45, adopted_month: 19, platforms: ['meridian', 'policy_admin', 'bi', 'identity', 'conduit'], value_flow: 'internal' },
  { id: 'uc_reg_report', name: 'Regulatory reporting', subdomain: 'data', volume_per_month: 26, adopted_month: 23, platforms: ['meridian', 'erp', 'bi', 'conduit'], value_flow: 'counterparty' },
  { id: 'uc_mi_dashboards', name: 'Management dashboards', subdomain: 'data', volume_per_month: 320, adopted_month: 21, platforms: ['meridian', 'bi', 'identity', 'event_bus'], value_flow: 'internal' },
  { id: 'uc_cust_analytics', name: 'Customer analytics', subdomain: 'data', volume_per_month: 180, adopted_month: 25, platforms: ['meridian', 'crm', 'bi', 'identity', 'marketing'], value_flow: 'internal' },
  { id: 'uc_claims_analytics', name: 'Claims analytics', subdomain: 'data', volume_per_month: 95, adopted_month: 30, platforms: ['meridian', 'claims_admin', 'bi', 'identity', 'event_bus'], value_flow: 'internal' },
]
