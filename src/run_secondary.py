"""SECONDARY candidate set: all traced services, including graph-isolated ones.

Preregistration section 9.2. UPPER BOUND ONLY. Never reported alone.

Identical to run_cases.py except that every service appearing in traces.csv
is added to the graph as a node before condensation, so graph-isolated
services (ts-auth-service) become rankable candidates.
"""
import argparse, glob, os, sys, time, warnings
warnings.filterwarnings("ignore")
import numpy as np, pandas as pd, networkx as nx

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ledger_h4 import (condense, derive_seed, expected_rank_random, mine_graph,
                       naive_rank, node_rank_from_comp, observed_degradation,
                       score_candidates, worst_rank)

ROOTS = {"OB": "/home/user/data/RE2/RE2-OB", "TT": "/home/user/data/RE2/RE2-TT"}
CELL = {"a": 2.0, "b": 5.0, "p_base": 0.55, "p_shared": 0.40}
CELL_ID = "a2.0_b5.0_pb0.55_ps0.4_SECONDARY"


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("out")
    ap.add_argument("--n-sim", type=int, default=200_000)
    a = ap.parse_args()
    cases = []
    for s, root in ROOTS.items():
        for cd in sorted(glob.glob(f"{root}/*/*")):
            if not os.path.isdir(cd) or os.path.basename(cd) == "multi-source-data":
                continue
            fd = os.path.basename(os.path.dirname(cd)); rc, ft = fd.rsplit("_", 1)
            cases.append(dict(system=s, case_id=f"{s}/{fd}/{os.path.basename(cd)}",
                              case_dir=cd, rc_service=rc, fault_type=ft))
    rows = []
    for i, cse in enumerate(cases):
        rec = dict(cse); rec["cell_id"] = CELL_ID
        seed = derive_seed(cse["case_id"], CELL_ID); rec["seed"] = seed
        rng = np.random.default_rng(seed); t0 = time.time()
        try:
            G, diag = mine_graph(cse["case_dir"])
            t = pd.read_csv(os.path.join(cse["case_dir"], "traces.csv"),
                            usecols=["serviceName"], dtype=str, low_memory=False)
            traced = sorted(t.serviceName.dropna().unique())
            G.add_nodes_from(traced)              # isolated services become candidates
            rec["n_nodes_secondary"] = G.number_of_nodes()
            rec["n_isolated_added"] = len(set(traced) - set(diag["traced_services"])) + \
                sum(1 for s2 in traced if G.degree(s2) == 0)
            observed, inject = observed_degradation(cse["case_dir"])
            rec["rc_in_candidates"] = cse["rc_service"] in G.nodes
            rec["naive_rank"] = naive_rank(observed, cse["rc_service"])
            C, n2c, c2n = condense(G)
            rec["n_components"] = C.number_of_nodes()
            df, mcse = score_candidates(C, c2n, observed, rng, a.n_sim, **CELL)
            rec["max_mcse"] = mcse
            for stat in ("S_graph", "S_full"):
                sc = dict(zip(df.comp, df[stat]))
                if rec["rc_in_candidates"]:
                    tc = n2c[cse["rc_service"]]
                    cr, tie = worst_rank(sc, tc)
                    nr, csize, _ = node_rank_from_comp(sc, c2n, cse["rc_service"])
                else:
                    cr = tie = nr = csize = None
                rec[f"{stat}_comp_rank"] = cr
                rec[f"{stat}_node_rank"] = nr
                rec[f"{stat}_rc_comp_size"] = csize
        except Exception as ex:
            rec["error"] = repr(ex)[:300]
        rec["secs"] = round(time.time() - t0, 2)
        rows.append(rec)
        print(f"{i+1}/{len(cases)} {cse['case_id']} nodes={rec.get('n_nodes_secondary')} "
              f"rc_cand={rec.get('rc_in_candidates')} Sg={rec.get('S_graph_node_rank')} "
              f"Sf={rec.get('S_full_node_rank')} naive={rec.get('naive_rank')}", flush=True)
        pd.DataFrame(rows).to_csv(a.out, index=False)
    print("WROTE", a.out, len(rows))


if __name__ == "__main__":
    main()
