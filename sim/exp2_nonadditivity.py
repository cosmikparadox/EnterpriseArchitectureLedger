"""
EXPERIMENT 2: NON-ADDITIVITY.

Part IX 9.8.3 gives three mathematically distinct reasons the ledger cannot be
totalled. They are argued there, not demonstrated. This module makes each bite
numerically on a MINIMAL estate that exhibits that reason and as little else as
possible, so the gap is attributable.

MATERIALITY THRESHOLD, DECLARED BEFORE RUNNING: a gap is material if it exceeds
10 percent of the reference quantity it is a gap against. Chosen because it is
roughly the point at which a decision-support range would change a decision, and
it is held fixed for all three reasons so they are comparable.

SCOPE WALL under Amendment 1 of 22 August 2026. Failure intensities and loss
severities are EXTERNAL INPUTS drawn from fixed distributions. No rate, coupling
strength or intensity is derived from any topological property: not degree, not
fan-in, not edge weight, not any spectral quantity. The graph is used only to say
which use case touches which node. Dependence is imposed by explicit joint draws
and named copulas.

Fixed allocation basis defaults to equal split across consumers, per Amendment 3
and canon 9.10. Where a result depends on the basis, all three are reported.
"""
from __future__ import annotations
import json
import numpy as np
from scipy.stats import kendalltau, t as student_t, norm
from sim.estate import make_estate
from sim.ledger import variable_share, fixed_share, c_run, poisson_gamma_lef

MATERIALITY = 0.10
SEED = 20260822


# ==========================================================================
# REGRESSION GUARD. Canon 9.10 frequency block, re-verified every run.
# ==========================================================================
def regression_9_10():
    post, Z, cred = poisson_gamma_lef(0.18, 0.021, 0.009, 1, 3.5)
    ok = (abs(Z - 0.600) < 5e-4 and abs(post - 0.2434) < 5e-5
          and abs(post - cred) < 1e-12)
    return dict(k=0.021 / 0.009, Z=Z, posterior=post, credibility=cred, pass_=bool(ok))


# ==========================================================================
# REASON ONE, COST. 9.8.3 result one.
#   "The sum of allocated averages is not a total, and only a marginal basis
#    answers a total-shaped question."
# ==========================================================================
def reason_one(fixed_ratio=0.35, coverage=1.0, overlap=0.5, basis="equal_uc",
               seed=SEED, n_uc=24):
    """
    Two total-shaped questions, both of which naive summation gets wrong.

    Q1  "what does the estate cost"   naive = sum of C_run over the LEDGER
    Q2  "what would removing S save"  naive = sum of C_run over S

    Q2 is the one 9.2.6 and 9.8.3 both single out, because removal does not
    release the fixed pool and does not release a shared node that other use
    cases still exercise.
    """
    est = make_estate(seed=seed, fixed_ratio=fixed_ratio, overlap=overlap,
                      n_use_cases=n_uc)
    rng = np.random.default_rng(seed + 1)
    n_led = max(1, int(round(coverage * est.n_uc)))
    ledger = np.sort(rng.choice(est.n_uc, size=n_led, replace=False))

    part = np.zeros(est.n_uc, dtype=int)          # single subdomain: reason 1 only
    tot, var, fix = c_run(est, part, basis)

    # ---- Q1: sum over the ledger vs what the estate actually costs ----------
    naive_estate = float(tot[ledger].sum())
    true_estate = float(est.fixed_cost.sum() + est.var_cost.sum())
    # the weights only sum to one over INSTRUMENTED consumers
    w = variable_share(est)
    weight_mass = float(w[ledger].sum(axis=0).mean())

    # ---- Q2: removal of a set S -------------------------------------------
    S = ledger[: max(1, len(ledger) // 3)]
    naive_removal = float(tot[S].sum())
    # what actually gets released: variable cost at each node in proportion to
    # the driver S contributed, but ONLY the variable pool, and the node's fixed
    # cost only if S was its entire consumer base.
    drv_S = est.driver[S].sum(axis=0)
    drv_all = est.driver.sum(axis=0)
    released_var = float((est.unit_price * drv_S).sum())
    fully_freed = (drv_all > 0) & (np.isclose(drv_S, drv_all))
    released_fix = float(est.fixed_cost[fully_freed].sum())
    true_removal = released_var + released_fix

    return dict(
        fixed_ratio=fixed_ratio, coverage=coverage, overlap=overlap, basis=basis,
        seed=seed, n_ledger=int(n_led),
        q1_naive=naive_estate, q1_true=true_estate,
        q1_gap=naive_estate - true_estate,
        q1_gap_frac=(naive_estate - true_estate) / true_estate,
        mean_weight_mass=weight_mass,
        q2_naive=naive_removal, q2_true=true_removal,
        q2_gap=naive_removal - true_removal,
        q2_gap_frac=(naive_removal - true_removal) / true_removal if true_removal > 0 else np.nan,
        q2_released_fixed=released_fix, q2_released_var=released_var,
    )


# ==========================================================================
# REASON TWO, RISK. 9.8.3 result two.
#   "The sum of the marginal distributions is not the distribution of the sum."
#   Canon G7: comonotonic VaR is EXACTLY additive. Super-additivity needs
#   tail index alpha < 1.
# ==========================================================================
def t_copula_draw(n_sims, k, rho, df, rng):
    """Student-t copula. Tail dependent, per 9.3.8's prohibition on Gaussian."""
    C = np.full((k, k), rho); np.fill_diagonal(C, 1.0)
    L = np.linalg.cholesky(C)
    z = rng.standard_normal((n_sims, k)) @ L.T
    chi = rng.chisquare(df, size=(n_sims, 1))
    tv = z / np.sqrt(chi / df)
    return student_t.cdf(tv, df)


def reason_two(k=8, rho=0.35, df=4, q=0.99, n_sims=400_000, seed=SEED,
               sigma=1.0, comonotonic=False, independent=False):
    """
    Naive:   sum over u of VaR_q(L_u)      (adding the marginals)
    Correct: VaR_q( sum over u of L_u )    (the quantile of the joint sum)
    """
    rng = np.random.default_rng(seed)
    if comonotonic:
        u = np.repeat(rng.random((n_sims, 1)), k, axis=1)   # one uniform, shared
    elif independent:
        u = rng.random((n_sims, k))
    else:
        u = t_copula_draw(n_sims, k, rho, df, rng)
    u = np.clip(u, 1e-12, 1 - 1e-12)
    losses = np.exp(norm.ppf(u) * sigma)                    # lognormal margins
    naive = float(np.sum(np.percentile(losses, q * 100, axis=0)))
    correct = float(np.percentile(losses.sum(axis=1), q * 100))
    return dict(k=k, rho=rho, df=df, q=q, sigma=sigma, seed=seed,
                mode=("comonotonic" if comonotonic else
                      "independent" if independent else "t_copula"),
                naive=naive, correct=correct, gap=naive - correct,
                gap_frac=(naive - correct) / correct)


# ==========================================================================
# REASON THREE, OPTION VALUE. 9.8.3 result three.
#   Convexity:  E[max(A,0)] + E[max(B,0)] >= E[max(A+B,0)]
#   Shared K :  two use cases riding one commitment share one switching
#               decision, so adding their option components counts it twice.
# ==========================================================================
def datar_mathews(K, T=3.0, mu=0.12, r=0.04, med=700_000.0, logsd=0.60,
                  n_sims=2_000_000, seed=20260809, z=None):
    """Canon 9.5.5: OC = E[ max( dV*e^-muT - K*e^-rT , 0 ) ], two rates, inside."""
    if z is None:
        z = np.random.default_rng(seed).standard_normal(n_sims)
    dV = med * np.exp(logsd * z)
    return float(np.mean(np.maximum(dV * np.exp(-mu * T) - K * np.exp(-r * T), 0.0)))


def reason_three_convexity(rho=0.0, n_sims=400_000, seed=SEED, T=3.0,
                           mu=0.12, r=0.04, med=700_000.0, logsd=0.60,
                           K=640_000.0):
    """Two switching payoffs valued separately, then jointly."""
    rng = np.random.default_rng(seed)
    C = np.array([[1.0, rho], [rho, 1.0]])
    z = rng.standard_normal((n_sims, 2)) @ np.linalg.cholesky(C).T
    dV = med * np.exp(logsd * z)
    legs = dV * np.exp(-mu * T) - K * np.exp(-r * T)
    sep = float(np.mean(np.maximum(legs[:, 0], 0)) + np.mean(np.maximum(legs[:, 1], 0)))
    joint = float(np.mean(np.maximum(legs.sum(axis=1), 0)))
    return dict(rho=rho, separate=sep, joint=joint, gap=sep - joint,
                gap_frac=(sep - joint) / joint, seed=seed)


def reason_three_shared_k(m_use_cases, K_rev=180_000.0, K_com=640_000.0,
                          n_sims=2_000_000, seed=20260809):
    """
    Canon 9.10: one platform commitment shared by five use cases. The option
    component is a property of the COMMITMENT. Reporting it once per use case
    counts one escape m times.
    """
    z = np.random.default_rng(seed).standard_normal(n_sims)
    W_rev = datar_mathews(K_rev, z=z)
    W_com = datar_mathews(K_com, z=z)
    oc = W_rev - W_com
    return dict(m=m_use_cases, W_rev=W_rev, W_com=W_com, oc_one=oc,
                naive=m_use_cases * oc, correct=oc,
                gap=(m_use_cases - 1) * oc,
                gap_frac=float(m_use_cases - 1), seed=seed)


# ==========================================================================
# 7.4  THE COPULA OBSTRUCTION: PRICE OF CUTTING THE GRAPH FIRST
# ==========================================================================
def cut_vs_uncut(n_units=5, overlap=0.5, n_sims=200_000, seed=SEED,
                 assumed="gaussian", q=0.99, n_uc=24, rho_cc=0.30):
    """
    UNCUT   one seeded simulation over the whole graph. Node failure intensities
            and severities are EXTERNAL INPUTS. Common-cause conditioning gives
            correlated per-node losses; the joint position is the empirical
            distribution of the simulation output, with no copula fitted.
            This is the route 9.3.8 says the prior art can take and this
            framework cannot.

    CUT     the framework's own route. Take each declared unit's MARGINAL from
            the same simulation, which it can compute correctly, then reassemble
            with an ASSUMED copula, because 9.8.3 result two says the true one
            is unidentifiable from one event per use case.

    The gap is the price of cutting first.
    """
    est = make_estate(seed=seed, overlap=overlap, n_use_cases=n_uc)
    rng = np.random.default_rng(seed + 7)

    # EXTERNAL INPUTS. Not derived from any topological property.
    node_rate = rng.gamma(shape=2.0, scale=0.06, size=est.n_nodes)
    node_sev = np.exp(rng.normal(11.0, 0.8, size=est.n_nodes))

    # units are a declared partition over use cases
    unit = np.arange(est.n_uc) % n_units

    # ---- UNCUT: one joint simulation --------------------------------------
    theta = rng.normal(0.0, np.sqrt(rho_cc), size=(n_sims, 1))
    idio = rng.normal(0.0, np.sqrt(1 - rho_cc), size=(n_sims, est.n_nodes))
    shock = np.exp(theta + idio - 0.5)
    fail = rng.random((n_sims, est.n_nodes)) < node_rate[None, :]
    node_loss = fail * node_sev[None, :] * shock          # per node, per sim

    touch = (est.driver > 0).astype(float)                # graph says WHAT is connected
    share = touch / np.maximum(touch.sum(axis=0), 1)[None, :]
    uc_loss = node_loss @ share.T                         # (n_sims, n_uc)

    unit_loss = np.zeros((n_sims, n_units))
    for g in range(n_units):
        unit_loss[:, g] = uc_loss[:, unit == g].sum(axis=1)

    true_total = unit_loss.sum(axis=1)
    uncut_var = float(np.percentile(true_total, q * 100))
    uncut_mean = float(true_total.mean())

    # ---- CUT then JOIN with an assumed copula ------------------------------
    marg = np.sort(unit_loss, axis=0)                     # correct marginals
    if assumed == "gaussian":
        C = np.full((n_units, n_units), 0.30); np.fill_diagonal(C, 1.0)
        zz = rng.standard_normal((n_sims, n_units)) @ np.linalg.cholesky(C).T
        uu = norm.cdf(zz)
    elif assumed == "t4":
        uu = t_copula_draw(n_sims, n_units, 0.30, 4, rng)
    elif assumed == "independent":
        uu = rng.random((n_sims, n_units))
    elif assumed == "comonotonic":
        uu = np.repeat(rng.random((n_sims, 1)), n_units, axis=1)
    idx = np.clip((uu * n_sims).astype(int), 0, n_sims - 1)
    rejoined = np.take_along_axis(marg, idx, axis=0).sum(axis=1)
    cut_var = float(np.percentile(rejoined, q * 100))
    cut_mean = float(rejoined.mean())

    return dict(n_units=n_units, overlap=overlap, assumed=assumed, q=q, seed=seed,
                uncut_var=uncut_var, cut_var=cut_var,
                var_gap=cut_var - uncut_var,
                var_gap_frac=(cut_var - uncut_var) / uncut_var,
                uncut_mean=uncut_mean, cut_mean=cut_mean,
                mean_gap_frac=(cut_mean - uncut_mean) / uncut_mean)
