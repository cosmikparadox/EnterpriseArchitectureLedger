"""Run the five RCAEval baselines plus a random floor. Preregistration s10.

Metric columns are mapped to services by name prefix; a service's rank is
the position of its first appearance in the ranked metric list. That is
RCAEval's own accuracy_service convention.
"""
import argparse, glob, os, sys, time, warnings
warnings.filterwarnings("ignore")
import numpy as np, pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ledger_h4 import MASTER_SEED, TRACE_TO_METRIC, derive_seed

ROOTS = {"OB": "/home/user/data/RE2/RE2-OB", "TT": "/home/user/data/RE2/RE2-TT"}
SUFFIXES = ("_cpu","_mem","_diskio","_socket","_latency-50","_latency-90",
            "_error","_workload","_latency")


def metric_to_service(col, services):
    """Longest matching service prefix wins, so ts-order-other-service is
    not swallowed by ts-order-service."""
    best = None
    for s in services:
        if col == s or col.startswith(s + "_"):
            if best is None or len(s) > len(best):
                best = s
    if best:
        return best
    for suf in SUFFIXES:
        if col.endswith(suf):
            return col[: -len(suf)]
    return None


def service_ranks(ranked_cols, services):
    out = []
    for c in ranked_cols:
        s = metric_to_service(c, services)
        if s and s in services and s not in out:
            out.append(s)
    return out


def rank_of(ranks, rc):
    rc = TRACE_TO_METRIC.get(rc, rc)
    return ranks.index(rc) + 1 if rc in ranks else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out"); ap.add_argument("--limit", type=int, default=None)
    a = ap.parse_args()
    from RCAEval.e2e import baro, nsigma, e_diagnosis, circa, rcd

    # RCD is attempted and recorded. It is NOT runnable against any released
    # causal-learn: RCAEval's rcd.py calls SkeletonDiscovery.local_skeleton_
    # discovery and passes labels= to skeleton_discovery, neither of which
    # exists in causal-learn 0.1.1.7 through 0.1.4.8. Both are present only in
    # the RCD authors' fork. The failure is reported, not patched around.
    METHODS = {"BARO": baro, "nsigma": nsigma, "e_diagnosis": e_diagnosis,
               "CIRCA": circa, "RCD": rcd}

    cases = []
    for sysname, root in ROOTS.items():
        for cd in sorted(glob.glob(f"{root}/*/*")):
            if not os.path.isdir(cd) or os.path.basename(cd) == "multi-source-data":
                continue
            fd = os.path.basename(os.path.dirname(cd))
            rc, ft = fd.rsplit("_", 1)
            cases.append(dict(system=sysname, case_id=f"{sysname}/{fd}/{os.path.basename(cd)}",
                              case_dir=cd, rc_service=rc, fault_type=ft))
    if a.limit:
        cases = cases[: a.limit]

    rows = []
    for i, c in enumerate(cases):
        rec = dict(c)
        inject = int(open(f"{c['case_dir']}/inject_time.txt").read().strip())
        sm = pd.read_csv(f"{c['case_dir']}/simple_metrics.csv")
        services = sorted({col[: -len("_latency-90")] for col in sm.columns
                           if col.endswith("_latency-90")})
        rec["n_services"] = len(services)

        # naive control, Appendix A.5, worst-rank tie-breaking
        pre, post = sm[sm.time < inject], sm[sm.time >= inject]
        obs = {}
        for col in [x for x in sm.columns if x.endswith("_latency-90")]:
            s = col[: -len("_latency-90")]
            m0, m1 = pre[col].mean(), post[col].mean()
            if m0 > 1e-12 and np.isfinite(m0) and np.isfinite(m1):
                obs[s] = m1 / m0
        rcm = TRACE_TO_METRIC.get(c["rc_service"], c["rc_service"])
        if rcm in obs:
            tv = obs[rcm]
            rec["naive_rank"] = (sum(1 for v in obs.values() if v > tv)
                                 + sum(1 for v in obs.values() if v == tv))
        else:
            rec["naive_rank"] = None

        # random floor
        rng = np.random.default_rng(derive_seed(c["case_id"], "random"))
        perm = list(rng.permutation(services))
        rec["Random_rank"] = rank_of(perm, c["rc_service"])

        for name, fn in METHODS.items():
            t0 = time.time()
            try:
                res = fn(sm.copy(), inject_time=inject, dataset="online-boutique"
                         if c["system"] == "OB" else "train-ticket")
                ranks = res.get("ranks") or []
                if ranks and isinstance(ranks[0], (list, tuple)):
                    ranks = [r[0] for r in ranks]
                sr = service_ranks([str(x) for x in ranks], services)
                rec[f"{name}_rank"] = rank_of(sr, c["rc_service"])
                rec[f"{name}_nsvc"] = len(sr)
            except Exception as ex:
                rec[f"{name}_rank"] = None
                rec[f"{name}_err"] = repr(ex)[:150]
            rec[f"{name}_secs"] = round(time.time() - t0, 2)
        rows.append(rec)
        print(f"{i+1}/{len(cases)} {c['case_id']} " +
              " ".join(f"{m}={rec.get(m+'_rank')}" for m in METHODS) +
              f" naive={rec['naive_rank']}", flush=True)
        pd.DataFrame(rows).to_csv(a.out, index=False)
    print("WROTE", a.out, len(rows))


if __name__ == "__main__":
    main()
