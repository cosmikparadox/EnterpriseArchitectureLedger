"""
Canonical ledger computations. Part IX v3.1c, Canonical Thesis v2.1c.

L(u) = { C(u), R(u), V(u) }  -- a SET, not a sum (9.1.3).
Nothing in this module totals across use cases; 9.8.3 forbids it and
experiment 2 measures the size of the error that forbidding prevents.

SCOPE WALL: no dynamical process, no spectral method. Risk dependence is
imposed by an explicit common-cause joint draw (9.3.5), which is static.
"""
from __future__ import annotations
import numpy as np
from sim.estate import Estate

# --------------------------------------------------------------------------
# Axis one: cost. Part IX 9.2.
# --------------------------------------------------------------------------

def variable_share(est: Estate) -> np.ndarray:
    """
    w_u(n) = driver_u(n) / sum_v driver_v(n).   Part IX 9.2.2.

    Metered and causal, therefore INDEPENDENT of the declared partition.
    9.2.6: "The variable pool, allocated by a metered causal driver, does not
    suffer this defect; the fixed pool does." This function is the control that
    makes that claim testable.
    """
    tot = est.driver.sum(axis=0)
    w = np.zeros_like(est.driver)
    nz = tot > 0
    w[:, nz] = est.driver[:, nz] / tot[nz]
    return w


def fixed_share(est: Estate, part: np.ndarray, basis: str) -> np.ndarray:
    """
    b_u(n), the DECLARED fixed allocation basis. Part IX 9.2.2, 9.2.6.

    9.8.3 result one notes that sum_u b_u(n) = 1 is "an accounting identity
    produced by the declaration, not a measurement". Every basis here sums to
    one over the consumers of n, so that identity holds by construction.

      equal_uc     equal across all use cases touching n.
                   This is the convention in the canonical worked example at
                   9.10 ("fixed share (declared equal split): 0.20" for a node
                   serving five use cases). PARTITION-INDEPENDENT.
      two_stage    node fixed pool split equally across the SUBDOMAINS touching
                   n, then equally across that subdomain's use cases touching n.
                   The standard two-stage responsibility allocation, and the
                   convention under which Thesis 6.1's claim that boundaries
                   "determine where cost pools are cut" is actually true.
                   PARTITION-DEPENDENT.
      driver_prop  b = w. PARTITION-INDEPENDENT.
    """
    b = np.zeros_like(est.driver)
    touches = est.driver > 0
    for n in range(est.n_nodes):
        cons = np.where(touches[:, n])[0]
        if len(cons) == 0:
            continue
        if basis == "equal_uc":
            b[cons, n] = 1.0 / len(cons)
        elif basis == "driver_prop":
            d = est.driver[cons, n]
            b[cons, n] = d / d.sum()
        elif basis == "two_stage":
            subs = np.unique(part[cons])
            for s in subs:
                members = cons[part[cons] == s]
                b[members, n] = (1.0 / len(subs)) / len(members)
        else:
            raise ValueError(f"unknown fixed basis: {basis}")
    return b


def c_run(est: Estate, part: np.ndarray, basis: str = "two_stage"):
    """
    C_run(u) = sum over n in G_u of [ w_u(n)*V(n) + b_u(n)*F(n) ].  9.2.2.

    Returns (total, variable_part, fixed_part). The fixed part is returned
    separately because 9.2.3 requires it reported separately and 9.2.6 forbids
    it informing an exit decision.
    """
    w = variable_share(est)
    b = fixed_share(est, part, basis)
    var = w @ est.var_cost
    fix = b @ est.fixed_cost
    return var + fix, var, fix


def unit_cost(est: Estate, part: np.ndarray, basis: str = "two_stage") -> np.ndarray:
    """
    Cost per unit of business work. 9.2.7 identity:
      Cost = business volume x architectural coefficient x unit price
    Business volume is partition-invariant, so unit cost and C_run(u) are
    proportional and share their CV and their ranking exactly.
    """
    tot, _, _ = c_run(est, part, basis)
    return tot / est.volume


# --------------------------------------------------------------------------
# Axis two: risk. Part IX 9.3.
# --------------------------------------------------------------------------

def poisson_gamma_lef(prior_mean: float, epv: float, vhm: float,
                      events: float, exposure_years: float):
    """
    Part IX 9.3.2, stated in counts.

      lambda ~ Gamma(alpha, beta),  posterior mean = (alpha + x)/(beta + e)
      Z = e/(e+k),  k = beta = EPV/VHM,  in YEARS.

    Returns (posterior_mean, Z, credibility_route). The two routes must agree
    exactly; 9.3.2 calls that agreement "the check".
    """
    k = epv / vhm
    alpha = prior_mean * k
    beta = k
    post = (alpha + events) / (beta + exposure_years)
    Z = exposure_years / (exposure_years + k)
    cred = Z * (events / exposure_years) + (1.0 - Z) * (alpha / beta)
    return post, Z, cred


def subdomain_ceiling(est: Estate, part: np.ndarray, kappa: float = 6.0,
                      value_per_txn: float = 55.0) -> np.ndarray:
    """
    The subdomain ceiling of 9.3.4, as a per-use-case cap.

    CONSTRUCTION NOTE [Asserted]. 9.3.4 specifies that a ceiling exists, that it
    must be applied as CENSORING rather than truncation, and that a bind rate
    above roughly 1 percent triggers refusal. It does NOT specify how the
    ceiling is set. Setting it proportional to the subdomain's aggregate
    business volume is this module's choice, made because it is the reading
    under which the ceiling is a property of the declared subdomain and
    therefore moves when the decomposition moves. Graded Asserted and reported
    as such; a different rule would change experiment 1's risk-axis numbers.
    """
    cap = np.zeros(est.n_uc)
    for s in np.unique(part):
        members = np.where(part == s)[0]
        cap[members] = kappa * est.volume[members].sum() * value_per_txn
    return cap


def risk_axis(est: Estate, part: np.ndarray, seed: int, n_sims: int = 20000,
              prior_mean: float = 0.18, epv: float = 0.021, vhm: float = 0.009,
              lm_median: float = 278_000.0, lm_s: float = 1.0,
              slef: float = 0.35, slm_frac: float = 0.4,
              common_cause_rho: float = 0.30, kappa: float = 6.0):
    """
    FAIR per 9.3.1:  Loss = LEF * LM,  LM = LM_primary + (SLEF * SLM).
    Frequency per 9.3.2. Ceiling per 9.3.4 as censoring, with the bind rate
    reported. Dependence per 9.3.5 by common-cause conditioning.

    Common-cause conditioning is an EXPLICIT JOINT DRAW over a shared latent
    factor. It is static and is inside the brief's permitted list. The CTMC,
    stochastic Petri net and dynamic fault tree routes named at 9.1.1 and 9.3.6
    are dynamical processes on the graph and are prohibited by brief section 3;
    they are not used and not approximated.
    """
    rng = np.random.default_rng(seed)
    n_uc = est.n_uc

    # local experience scales with exposure; deeper subgraphs see more events
    exposure = 3.5 * np.ones(n_uc)
    events = rng.poisson(prior_mean * exposure * (0.5 + est.volume / est.volume.mean()))
    lef = np.array([poisson_gamma_lef(prior_mean, epv, vhm, events[u], exposure[u])[0]
                    for u in range(n_uc)])

    # per-use-case severity scale rises with the value at stake
    med = lm_median * (est.volume / np.median(est.volume)) ** 0.5

    # ---- common-cause conditioning, 9.3.5 ----------------------------------
    # theta is a shared latent severity factor. P(A and B) = E_theta[P(A|th)P(B|th)]
    # is realised here by drawing theta once per simulation and conditioning
    # every use case's severity on it. Declared, static, no propagation.
    theta = rng.normal(0.0, np.sqrt(common_cause_rho), size=(n_sims, 1))
    idio = rng.normal(0.0, np.sqrt(1.0 - common_cause_rho), size=(n_sims, n_uc))
    z = theta + idio

    counts = rng.poisson(lef[None, :], size=(n_sims, n_uc))
    sev = med[None, :] * np.exp(lm_s * z)
    sec = (rng.random((n_sims, n_uc)) < slef) * sev * slm_frac   # SLEF * SLM
    per_event = sev + sec
    loss = counts * per_event                                     # annual loss

    cap = subdomain_ceiling(est, part, kappa=kappa)
    bind = (loss >= cap[None, :]).mean(axis=0)                    # 9.3.4
    censored = np.minimum(loss, cap[None, :])

    return dict(
        loss_uncensored=loss, loss=censored, cap=cap, bind_rate=bind, lef=lef,
        mean=censored.mean(axis=0),
        p90=np.percentile(censored, 90, axis=0),
        p99=np.percentile(censored, 99, axis=0),
        mean_unc=loss.mean(axis=0),
        p99_unc=np.percentile(loss, 99, axis=0),
        refuse=bind > 0.01,                                       # 9.3.4 rule
        seed=seed,
    )


# --------------------------------------------------------------------------
# Axis three: value. Part IX 9.4, primary instrument.
# --------------------------------------------------------------------------

def marginal_cost_next(est: Estate, seed: int, n_draws: int = 400,
                       overlap: float = 0.5) -> np.ndarray:
    """
    MC(u_new | G) = sum over NEW nodes of C_build(n)
                  + sum over EXISTING nodes of Delta_variable(n).      9.4

    Computed against G. It reads the graph and the meter and never reads the
    declared partition, so it is a partition-invariant control. 9.4 also warns
    that marginals do not sum; nothing here sums them.
    """
    rng = np.random.default_rng(seed)
    out = np.zeros(n_draws)
    deep = np.where(est.tier >= 2)[0]
    shallow = np.where(est.tier < 2)[0]
    for d in range(n_draws):
        n_new = rng.integers(1, 4)
        new_nodes = rng.choice(shallow, size=min(n_new, len(shallow)), replace=False)
        build = est.build_cost[new_nodes].sum()
        k = rng.integers(1, max(2, len(deep)))
        reused = rng.choice(deep, size=k, replace=False)
        extra_driver = np.exp(rng.normal(np.log(np.median(est.driver.sum(axis=0)[deep]) + 1e-9), 0.8))
        delta_var = (est.unit_price[reused] * extra_driver * rng.random(k)).sum()
        out[d] = build + delta_var
    return out


def flexibility(est: Estate, seed: int) -> float:
    """Flexibility(G) proportional to 1 / E[ MC(u_new) ].   9.4."""
    return 1.0 / marginal_cost_next(est, seed).mean()
