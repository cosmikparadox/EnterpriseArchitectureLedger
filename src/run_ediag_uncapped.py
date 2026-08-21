"""epsilon-Diagnosis with the output cap removed. Per paper/EDIAG_TUNING_PREREG.md.

Replicates RCAEval's e_diagnosis wrapper exactly, changing ONE thing:
root_cause_top_k is set to the number of candidate columns instead of
inheriting pyrca's default of 3. alpha stays at RCAEval's 0.01.
"""
import glob, os, sys, time, warnings
warnings.filterwarnings("ignore")
import numpy as np, pandas as pd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from run_baselines import service_ranks, rank_of, ROOTS
from RCAEval.io.time_series import preprocess


def ediag_uncapped(data, inject_time, dataset):
    """RCAEval's e_diagnosis, verbatim, except root_cause_top_k."""
    from pyrca.analyzers.epsilon_diagnosis import EpsilonDiagnosis

    alpha = float(os.getenv("E_ALPHA", 0.01))          # unchanged
    normal_df = data[data["time"] < inject_time]
    anomal_df = data[data["time"] >= inject_time]
    normal_df = preprocess(data=normal_df, dataset=dataset, dk_select_useful=False)
    anomal_df = preprocess(data=anomal_df, dataset=dataset, dk_select_useful=False)
    intersects = [x for x in normal_df.columns if x in anomal_df.columns]
    normal_df, anomal_df = normal_df[intersects], anomal_df[intersects]
    m = min(normal_df.shape[0], anomal_df.shape[0])
    normal_df, anomal_df = normal_df.tail(m), anomal_df.head(m)

    # THE ONE CHANGE: do not truncate the ranking to 3
    model = EpsilonDiagnosis(config=EpsilonDiagnosis.config_class(
        alpha=alpha, root_cause_top_k=max(1, len(intersects))))
    model.train(normal_df)
    res = model.find_root_causes(anomal_df)
    ranks = res.to_dict()["root_cause_nodes"]
    ranks = [x[0] for x in sorted(ranks, key=lambda x: x[1], reverse=True)]
    return ranks, len(intersects)


def main():
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
            ranks, ncols = ediag_uncapped(
                sm.copy(), inject,
                "online-boutique" if c["system"] == "OB" else "train-ticket")
            sr = service_ranks([str(x) for x in ranks], services)
            rec["ediag_unc_rank"] = rank_of(sr, c["rc_service"])
            rec["ediag_unc_nsvc"] = len(sr)
            rec["ediag_unc_ncols_ranked"] = len(ranks)
            rec["n_candidate_cols"] = ncols
        except Exception as ex:
            rec["ediag_unc_rank"] = None
            rec["ediag_unc_err"] = repr(ex)[:200]
        rec["secs"] = round(time.time() - t0, 2)
        rows.append(rec)
        print(f"{i+1}/{len(cases)} {c['case_id']} rank={rec.get('ediag_unc_rank')} "
              f"nsvc={rec.get('ediag_unc_nsvc')} cols_ranked={rec.get('ediag_unc_ncols_ranked')}",
              flush=True)
        pd.DataFrame(rows).to_csv("results/ediag_uncapped.csv", index=False)
    print("WROTE results/ediag_uncapped.csv", len(rows))


if __name__ == "__main__":
    main()
