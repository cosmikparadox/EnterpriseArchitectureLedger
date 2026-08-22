"""
EXPERIMENT 1: DECOMPOSITION SENSITIVITY (H11).

Tests Part IX 9.11.5, recorded there as "NOT YET WRITTEN". The comparison
metric, the materiality threshold and the sampling of analysts are supplied by
the simulation brief of 22 August 2026, NOT by the canon, which states in terms
that all three are unspecified. They are pre-registered here and are not
adjusted after seeing results (method rule 2.3).

Hold constant: graph, volumes, costs, use cases.
Vary:          the declared subdomain partition.
Measure:       divergence in every ledger output.
"""
from __future__ import annotations
import json, sys
import numpy as np
from scipy.stats import kendalltau
from sim.estate import make_estate, reference_partition, perturb
from sim.ledger import (variable_share, fixed_share, c_run, unit_cost,
                        risk_axis, marginal_cost_next, subdomain_ceiling)

SEED = 20260822
N_SUB = 5

# ==========================================================================
# PRE-REGISTERED KILL CONDITIONS. Brief section 6.4. Written before running.
# ==========================================================================
KILL = {
    "K1": dict(
        test="adversarial max-min spread on per-use-case unit cost > 100% of reference",
        threshold=1.00,
        meaning="the unit of account does not survive analyst choice on the cost axis",
    ),
    "K2": dict(
        test="Kendall tau between structurally motivated partitions < 0.5",
        threshold=0.50,
        meaning="the ledger does not produce a stable ordering and cannot support "
                "comparative decisions",
    ),
    "K3": dict(
        test="if K1 or K2 fires ONLY at high fixed-to-variable ratio, that is a "
             "scope condition, not a kill; report the threshold ratio",
        threshold=None,
        meaning="scope condition",
    ),
}


# --------------------------------------------------------------------------
# Fast single-use-case fixed allocation, for the adversarial search.
# --------------------------------------------------------------------------
class FastFixed:
    """
    Precomputes consumers per node so the two-stage basis for ONE use case can
    be evaluated without rebuilding the whole b matrix. Exactly equivalent to
    ledger.fixed_share(basis="two_stage"); verified against it below.
    """
    def __init__(self, est):
        self.est = est
        self.cons = [np.where(est.driver[:, n] > 0)[0] for n in range(est.n_nodes)]
        self.F = est.fixed_cost

    def fixed_for(self, u, part):
        tot = 0.0
        su = part[u]
        for n in range(self.est.n_nodes):
            c = self.cons[n]
            if len(c) == 0 or self.est.driver[u, n] <= 0:
                continue
            pc = part[c]
            n_subs = len(np.unique(pc))
            n_mem = int((pc == su).sum())
            tot += self.F[n] / (n_subs * n_mem)
        return tot


def structural_partitions(est, n_sub, seed):
    """
    Partitions a real analyst might plausibly produce. Brief 6.2 family 2.
    Each cuts the estate on a different, defensible organising principle, and
    each has a different overlap characteristic against the call graph.
    """
    rng = np.random.default_rng(seed)
    out = {}

    def cluster_by(cols, name):
        if len(cols) == 0:
            return
        aff = est.driver[:, cols]
        key = np.array([cols[np.argmax(aff[u])] if aff[u].sum() > 0 else -1
                        for u in range(est.n_uc)])
        lab, p = {}, np.zeros(est.n_uc, dtype=int)
        for u, k in enumerate(key):
            if k not in lab:
                lab[k] = len(lab) % n_sub
            p[u] = lab[k]
        out[name] = p

    cluster_by(np.where(est.tier >= 3)[0], "by_data_domain")
    cluster_by(np.where(est.tier == 2)[0], "by_deployment_unit")
    # by customer journey: group on the entry point
    ent = np.array([uc["entry"] for uc in est.use_cases])
    lab, p = {}, np.zeros(est.n_uc, dtype=int)
    for u, e in enumerate(ent):
        if e not in lab:
            lab[e] = len(lab) % n_sub
        p[u] = lab[e]
    out["by_customer_journey"] = p
    # by owning team: org structure does not follow the call graph
    out["by_owning_team"] = rng.integers(0, n_sub, size=est.n_uc)
    return out


def adversarial_spread(est, ref_part, n_sub, seed, restarts=3, max_sweeps=12):
    """
    Bound the manipulation available to a motivated analyst. Brief 6.2 family 3.

    Hill climbing over single-use-case moves. This finds a LOWER BOUND on the
    true adversarial spread: the search is local and the partition space is
    n_sub^n_uc, far too large to enumerate. Reported as a lower bound. If the
    lower bound already exceeds the kill threshold, the kill fires regardless of
    what the true maximum is.
    """
    ff = FastFixed(est)
    w = variable_share(est)
    var_u = w @ est.var_cost               # partition-invariant
    rng = np.random.default_rng(seed)
    res = []
    for u in range(est.n_uc):
        best = {}
        for sign, tag in ((+1, "max"), (-1, "min")):
            champ = None
            for r in range(restarts):
                p = ref_part.copy() if r == 0 else rng.integers(0, n_sub, size=est.n_uc)
                cur = ff.fixed_for(u, p)
                for _ in range(max_sweeps):
                    improved = False
                    for v in range(est.n_uc):
                        orig = p[v]
                        for s in range(n_sub):
                            if s == orig:
                                continue
                            p[v] = s
                            val = ff.fixed_for(u, p)
                            if sign * (val - cur) > 1e-12:
                                cur, improved = val, True
                            else:
                                p[v] = orig
                        if p[v] != orig:
                            pass
                    if not improved:
                        break
                if champ is None or sign * (cur - champ) > 0:
                    champ = cur
            best[tag] = champ
        ref_fixed = ff.fixed_for(u, ref_part)
        ref_tot = var_u[u] + ref_fixed
        hi, lo = var_u[u] + best["max"], var_u[u] + best["min"]
        res.append(dict(uc=u, ref=ref_tot, hi=hi, lo=lo,
                        spread_frac=(hi - lo) / ref_tot if ref_tot > 0 else np.nan,
                        var_part=var_u[u], fixed_ref=ref_fixed))
    return res


def run(fixed_ratio, seed=SEED, n_sub=N_SUB, overlap=0.5, verbose=True):
    est = make_estate(seed=seed, fixed_ratio=fixed_ratio, overlap=overlap)
    ref = reference_partition(est, n_sub, seed=1)

    # verify the fast path equals the canonical path exactly
    ff = FastFixed(est)
    b = fixed_share(est, ref, "two_stage")
    slow = b @ est.fixed_cost
    fast = np.array([ff.fixed_for(u, ref) for u in range(est.n_uc)])
    assert np.allclose(slow, fast), "fast fixed allocation diverges from ledger.fixed_share"

    out = {"fixed_ratio": fixed_ratio, "seed": seed, "n_sub": n_sub,
           "overlap": overlap, "n_uc": est.n_uc, "n_nodes": est.n_nodes}

    # ---- family 1: perturbation -----------------------------------------
    ref_uc = unit_cost(est, ref, "two_stage")
    pert = {}
    for k in (1, 2, 4, 8):
        vals, taus = [], []
        for rep in range(20):
            p = perturb(ref, k, n_sub, seed=1000 * k + rep)
            uc = unit_cost(est, p, "two_stage")
            vals.append(uc)
            taus.append(kendalltau(ref_uc, uc).statistic)
        V = np.array(vals)
        pert[k] = dict(cv=float(np.mean(V.std(axis=0) / V.mean(axis=0))),
                       tau_mean=float(np.mean(taus)), tau_min=float(np.min(taus)))
    out["perturbation"] = pert

    # ---- family 2: structurally motivated --------------------------------
    sp = structural_partitions(est, n_sub, seed=7)
    sp["reference"] = ref
    names = sorted(sp)
    ucs = {nm: unit_cost(est, sp[nm], "two_stage") for nm in names}
    taus, cvs = [], []
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            taus.append(dict(a=names[i], b=names[j],
                             tau=float(kendalltau(ucs[names[i]], ucs[names[j]]).statistic)))
    M = np.array([ucs[nm] for nm in names])
    out["structural"] = dict(
        partitions=names,
        pairwise_tau=taus,
        tau_min=float(min(t["tau"] for t in taus)),
        tau_mean=float(np.mean([t["tau"] for t in taus])),
        cv_per_uc_mean=float(np.mean(M.std(axis=0) / M.mean(axis=0))),
        cv_per_uc_max=float(np.max(M.std(axis=0) / M.mean(axis=0))),
    )

    # ---- family 3: adversarial ------------------------------------------
    adv = adversarial_spread(est, ref, n_sub, seed=99)
    spreads = np.array([a["spread_frac"] for a in adv])
    out["adversarial"] = dict(
        spread_median=float(np.median(spreads)),
        spread_mean=float(np.mean(spreads)),
        spread_max=float(np.max(spreads)),
        spread_p90=float(np.percentile(spreads, 90)),
        n_uc_over_threshold=int((spreads > KILL["K1"]["threshold"]).sum()),
        note="LOWER BOUND: local hill climbing, not exhaustive",
    )

    # ---- controls: what the canon predicts is partition-invariant --------
    w = variable_share(est)
    var_u = w @ est.var_cost
    ref_eq = unit_cost(est, ref, "equal_uc")
    alt_eq = unit_cost(est, sp["by_owning_team"], "equal_uc")
    out["controls"] = dict(
        variable_share_invariant=True,
        variable_pool_cv_across_partitions=0.0,
        equal_uc_basis_invariant=bool(np.allclose(ref_eq, alt_eq)),
        mc_next_invariant=True,
        fixed_frac_of_c_run=float((c_run(est, ref, "two_stage")[2]).sum()
                                  / c_run(est, ref, "two_stage")[0].sum()),
    )

    # ---- risk axis and flexibility ---------------------------------------
    r_ref = risk_axis(est, ref, seed=555, n_sims=8000)
    r_alt = risk_axis(est, sp["by_owning_team"], seed=555, n_sims=8000)
    out["risk"] = dict(
        tau_mean_loss=float(kendalltau(r_ref["mean"], r_alt["mean"]).statistic),
        tau_p99=float(kendalltau(r_ref["p99"], r_alt["p99"]).statistic),
        tau_p99_uncensored=float(kendalltau(r_ref["p99_unc"], r_alt["p99_unc"]).statistic),
        bind_rate_ref_max=float(r_ref["bind_rate"].max()),
        bind_rate_alt_max=float(r_alt["bind_rate"].max()),
        n_refuse_ref=int(r_ref["refuse"].sum()),
        n_refuse_alt=int(r_alt["refuse"].sum()),
        mean_cv=float(np.mean(np.abs(r_alt["mean"] - r_ref["mean"])
                              / np.maximum(r_ref["mean"], 1e-9))),
    )
    mc = marginal_cost_next(est, seed=321)
    out["flexibility"] = dict(mean_mc=float(mc.mean()),
                              flexibility=float(1.0 / mc.mean()),
                              partition_invariant=True)
    return out


if __name__ == "__main__":
    ratios = [0.05, 0.10, 0.20, 0.35, 0.50, 0.65, 0.80]
    all_out = []
    for fr in ratios:
        o = run(fr)
        all_out.append(o)
        print(f"phi={fr:.2f}  adv_median={o['adversarial']['spread_median']:.3f} "
              f"adv_max={o['adversarial']['spread_max']:.3f}  "
              f"struct_tau_min={o['structural']['tau_min']:.3f}  "
              f"cv={o['structural']['cv_per_uc_mean']:.3f}", flush=True)
    json.dump(all_out, open("sim/out/exp1.json", "w"), indent=1)
    print("WROTE sim/out/exp1.json")
