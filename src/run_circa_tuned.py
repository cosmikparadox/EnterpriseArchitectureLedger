"""CIRCA with dk_select_useful=True. Per paper/CIRCA_TUNING_PREREG.md.

One preregistered configuration. No sweep, no ground-truth selection.
"""
import glob, os, sys, time, warnings
warnings.filterwarnings("ignore")
import numpy as np, pandas as pd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ledger_h4 import TRACE_TO_METRIC
from run_baselines import metric_to_service, service_ranks, rank_of, ROOTS

def main():
    from RCAEval.e2e import circa
    cases = []
    for s, root in ROOTS.items():
        for cd in sorted(glob.glob(f"{root}/*/*")):
            if not os.path.isdir(cd) or os.path.basename(cd) == "multi-source-data":
                continue
            fd = os.path.basename(os.path.dirname(cd)); rc, ft = fd.rsplit("_", 1)
            cases.append(dict(system=s, case_id=f"{s}/{fd}/{os.path.basename(cd)}",
                              case_dir=cd, rc_service=rc, fault_type=ft))
    rows = []
    for i, c in enumerate(cases):
        rec = dict(c)
        inject = int(open(f"{c['case_dir']}/inject_time.txt").read().strip())
        sm = pd.read_csv(f"{c['case_dir']}/simple_metrics.csv")
        services = sorted({col[:-len("_latency-90")] for col in sm.columns
                           if col.endswith("_latency-90")})
        t0 = time.time()
        try:
            res = circa(sm.copy(), inject_time=inject,
                        dataset="online-boutique" if c["system"] == "OB" else "train-ticket",
                        dk_select_useful=True)          # <- the preregistered change
            ranks = res.get("ranks") or []
            if ranks and isinstance(ranks[0], (list, tuple)):
                ranks = [r[0] for r in ranks]
            sr = service_ranks([str(x) for x in ranks], services)
            rec["CIRCA_tuned_rank"] = rank_of(sr, c["rc_service"])
            rec["CIRCA_tuned_nsvc"] = len(sr)
            rec["n_cols_used"] = len(res.get("node_names") or [])
        except Exception as ex:
            rec["CIRCA_tuned_rank"] = None
            rec["CIRCA_tuned_err"] = repr(ex)[:200]
        rec["secs"] = round(time.time() - t0, 2)
        rows.append(rec)
        print(f"{i+1}/{len(cases)} {c['case_id']} rank={rec.get('CIRCA_tuned_rank')} "
              f"nsvc={rec.get('CIRCA_tuned_nsvc')} cols={rec.get('n_cols_used')}", flush=True)
        pd.DataFrame(rows).to_csv("results/circa_tuned.csv", index=False)
    print("WROTE results/circa_tuned.csv", len(rows))

if __name__ == "__main__":
    main()
