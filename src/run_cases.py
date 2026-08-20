"""Run the frozen method over a set of RE2 cases. Per PREREGISTRATION.md.

Usage:
  run_cases.py OUT.csv --limit N            ten-case sample (Gate 3)
  run_cases.py OUT.csv                      full run
  run_cases.py OUT.csv --grid               full sensitivity grid (A.2/6.3)
"""
import argparse
import glob
import os
import sys
import time

import numpy as np
import pandas as pd
import networkx as nx

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ledger_h4 import (MASTER_SEED, TRACE_TO_METRIC, condense, derive_seed,
                       expected_rank_random, mine_graph, naive_rank,
                       node_rank_from_comp, observed_degradation,
                       retry_rate, score_candidates, worst_rank)

ROOTS = {"OB": "/home/user/data/RE2/RE2-OB", "TT": "/home/user/data/RE2/RE2-TT"}
DEFAULT_CELL = {"a": 2.0, "b": 5.0, "p_base": 0.55, "p_shared": 0.40}
GRID = [{"a": a, "b": b, "p_base": pb, "p_shared": 0.40}
        for pb in (0.35, 0.55, 0.75) for (a, b) in ((2, 5), (1, 1), (5, 2))]


def enumerate_cases():
    """Preregistration 3.2: exclusions fixed. multi-source-data is a
    byte-identical duplicate and is NOT a case. RE2-SS has no traces."""
    cases = []
    for sysname, root in ROOTS.items():
        for cd in sorted(glob.glob(f"{root}/*/*")):
            if not os.path.isdir(cd):
                continue
            run = os.path.basename(cd)
            if run == "multi-source-data":
                continue
            fault_dir = os.path.basename(os.path.dirname(cd))
            rc, ft = fault_dir.rsplit("_", 1)
            cases.append({"system": sysname, "case_id": f"{sysname}/{fault_dir}/{run}",
                          "case_dir": cd, "rc_service": rc, "fault_type": ft})
    return cases


def run_case(case, cell, cell_id, n_sim):
    rec = dict(case)
    rec.update({f"param_{k}": v for k, v in cell.items()})
    rec["cell_id"] = cell_id
    rec["n_sim"] = n_sim
    seed = derive_seed(case["case_id"], cell_id)
    rec["seed"] = seed
    rng = np.random.default_rng(seed)
    t0 = time.time()
    try:
        G, diag = mine_graph(case["case_dir"])
        rec.update({k: (v if not isinstance(v, list) else "|".join(v))
                    for k, v in diag.items()})
        observed, inject = observed_degradation(case["case_dir"])
        rec["inject_time"] = inject
        rec["n_observed_services"] = len(observed)

        rc = case["rc_service"]
        rec["rc_in_graph"] = rc in G.nodes
        rec["naive_rank"] = naive_rank(observed, rc)

        if G.number_of_nodes() == 0:
            rec["error"] = "empty graph"
            return rec

        C, node2comp, comp2nodes = condense(G)
        rec["n_components"] = C.number_of_nodes()
        rec["condensation_nontrivial"] = int(sum(1 for m in comp2nodes.values() if len(m) > 1))

        df, mcse = score_candidates(C, comp2nodes, observed, rng, n_sim, **cell)
        rec["max_mcse"] = mcse

        for stat in ("S_graph", "S_full", "S_graph_meanagg"):
            sc = dict(zip(df.comp, df[stat]))
            if rec["rc_in_graph"]:
                tc = node2comp[rc]
                cr, tie = worst_rank(sc, tc)
                nr, csize, ntied = node_rank_from_comp(sc, comp2nodes, rc)
                er = expected_rank_random(sc, tc)
            else:
                cr = tie = nr = csize = ntied = er = None
            rec[f"{stat}_comp_rank"] = cr
            rec[f"{stat}_comp_tie"] = tie
            rec[f"{stat}_node_rank"] = nr
            rec[f"{stat}_rc_comp_size"] = csize
            rec[f"{stat}_nodes_tied"] = ntied
            rec[f"{stat}_exp_rank_random"] = er
    except Exception as ex:
        rec["error"] = repr(ex)[:300]
    rec["secs"] = round(time.time() - t0, 2)
    return rec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--grid", action="store_true")
    ap.add_argument("--n-sim", type=int, default=200_000)
    ap.add_argument("--retry-probe", action="store_true")
    a = ap.parse_args()

    cases = enumerate_cases()
    if a.limit:
        # deterministic stratified sample: alternate systems, spread faults
        rng = np.random.default_rng(MASTER_SEED)
        idx = rng.permutation(len(cases))[: a.limit]
        cases = [cases[i] for i in sorted(idx)]
    cells = GRID if a.grid else [DEFAULT_CELL]

    rows = []
    for cell in cells:
        cid = f"a{cell['a']}_b{cell['b']}_pb{cell['p_base']}_ps{cell['p_shared']}"
        for i, c in enumerate(cases):
            r = run_case(c, cell, cid, a.n_sim)
            if a.retry_probe:
                try:
                    r["retry_rate"] = retry_rate(c["case_dir"])
                except Exception:
                    r["retry_rate"] = float("nan")
            rows.append(r)
            print(f"[{cid}] {i+1}/{len(cases)} {c['case_id']} "
                  f"nodes={r.get('n_nodes')} comps={r.get('n_components')} "
                  f"acyc={r.get('acyclic')} rc_in_G={r.get('rc_in_graph')} "
                  f"Sg_node_rank={r.get('S_graph_node_rank')} "
                  f"naive={r.get('naive_rank')} {r.get('secs')}s"
                  + (f" ERR={r['error']}" if r.get("error") else ""), flush=True)
            pd.DataFrame(rows).to_csv(a.out, index=False)
    print("WROTE", a.out, len(rows))


if __name__ == "__main__":
    main()
