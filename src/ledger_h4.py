"""
Experiment 1: H4 ranking clause, on RCAEval RE2.

Implements PREREGISTRATION.md exactly. Frozen method, hash b0db614.

WHAT THIS TESTS (preregistration section 1.3): the RANKING EXTENSION
introduced in the experiment brief, NOT canonical H4. Canonical H4
concerns monetary totals and its kill condition cannot be evaluated on
RCAEval, which has no loss data.

Nothing here establishes novelty (preregistration section 2.1).
"""
import hashlib
import os

import numpy as np
import pandas as pd
import networkx as nx
from scipy.stats import spearmanr

MASTER_SEED = 20260820
LAT_SUFFIX = "_latency-90"

# Preregistration section 3.3: the Online Boutique frontend is
# frontendservice in traces and frontend in metrics. Same service.
TRACE_TO_METRIC = {"frontendservice": "frontend"}


def derive_seed(case_id, cell_id):
    """Preregistration 15.1: SHA256(case_id|cell_id) truncated to 32 bits."""
    h = hashlib.sha256(f"{case_id}|{cell_id}".encode()).digest()
    return int.from_bytes(h[:4], "big")


# ---------------------------------------------------------------- A.1 mining
def mine_graph(case_dir):
    """Appendix A.1, applied exactly. Returns (DiGraph, diagnostics).

    traces.csv `time` is a HH:MM string, not a timestamp, and is unused.
    """
    t = pd.read_csv(
        os.path.join(case_dir, "traces.csv"),
        usecols=["spanID", "serviceName", "parentSpanID"],
        dtype=str,
        low_memory=False,
    )
    span2svc = dict(zip(t.spanID, t.serviceName))
    t["parentSvc"] = t.parentSpanID.map(span2svc)
    edges = (
        t.dropna(subset=["parentSvc"])
        .query("parentSvc != serviceName")           # drop self-loops
        .groupby(["parentSvc", "serviceName"])
        .size()
    )
    G = nx.DiGraph()
    for (caller, callee), w in edges.items():
        G.add_edge(caller, callee, calls=int(w))     # direction: caller -> callee
    diag = {
        "n_spans": len(t),
        "traced_services": sorted(t.serviceName.dropna().unique()),
        "n_nodes": G.number_of_nodes(),
        "n_edges": G.number_of_edges(),
        "acyclic": nx.is_directed_acyclic_graph(G) if G.number_of_nodes() else None,
        "shared": sorted([n for n in G if G.in_degree(n) > 1]),
    }
    return G, diag


def retry_rate(case_dir):
    """Preregistration section 14: detectable proxy for retry behaviour.

    Fraction of spans sharing a (traceID, parentSpanID, operationName) key
    with at least one other span. Circuit breakers and fallbacks are NOT
    detectable; monotonicity stays UNVERIFIED.
    """
    t = pd.read_csv(
        os.path.join(case_dir, "traces.csv"),
        usecols=["traceID", "parentSpanID", "operationName"],
        dtype=str,
        low_memory=False,
    ).dropna(subset=["parentSpanID"])
    if not len(t):
        return float("nan")
    dup = t.duplicated(subset=["traceID", "parentSpanID", "operationName"], keep=False)
    return float(dup.mean())


# -------------------------------------------------------- observed signal
def observed_degradation(case_dir):
    """Preregistration 3.3: mean(latency-90 post) / mean(latency-90 pre)."""
    inject = int(open(os.path.join(case_dir, "inject_time.txt")).read().strip())
    sm = pd.read_csv(os.path.join(case_dir, "simple_metrics.csv"))
    pre, post = sm[sm.time < inject], sm[sm.time >= inject]
    out = {}
    for c in [c for c in sm.columns if c.endswith(LAT_SUFFIX)]:
        svc = c[: -len(LAT_SUFFIX)]
        a, b = pre[c].mean(), post[c].mean()
        if a > 1e-12 and np.isfinite(a) and np.isfinite(b):
            out[svc] = b / a
    return out, inject


# ------------------------------------------------- A.2 propagation, condensed
def condense(G):
    """Preregistration section 5: Tarjan SCC condensation.

    Identity for an acyclic graph. Returns (C, node2comp, comp2nodes).
    """
    C = nx.condensation(G)
    node2comp = C.graph["mapping"]
    comp2nodes = {i: sorted(C.nodes[i]["members"]) for i in C.nodes}
    return C, node2comp, comp2nodes


def propagate(C, seed_comp, rng, n_sim, a, b, p_base, p_shared):
    """Appendix A.2 over the condensation.

        theta      ~ Beta(a, b), drawn once per simulation draw
        p_transmit = min(1, p_base + p_shared * theta)      [T-T]
        affected(X) = OR over callee-components Y of
                      [ affected(Y) AND U(0,1) < p_transmit ]

    Reverse topological order, so each component is drawn exactly once
    per simulation draw. Shared components cannot double-count.
    """
    comps = list(C.nodes)
    idx = {c: i for i, c in enumerate(comps)}
    theta = rng.beta(a, b, n_sim)
    p_trans = np.minimum(1.0, p_base + p_shared * theta)

    hit = np.zeros((n_sim, len(comps)), dtype=bool)
    hit[:, idx[seed_comp]] = True

    for x in reversed(list(nx.topological_sort(C))):
        if x == seed_comp:
            continue
        acc = np.zeros(n_sim, dtype=bool)
        for y in C.successors(x):                    # y is a callee component
            acc |= hit[:, idx[y]] & (rng.random(n_sim) < p_trans)
        if acc.any():
            hit[:, idx[x]] = acc
    p = hit.mean(axis=0)
    mcse = np.sqrt(np.maximum(p * (1 - p), 0) / n_sim)
    return {c: float(p[idx[c]]) for c in comps}, float(np.max(mcse))


# ------------------------------------------------------------ A.3 scoring
def score_candidates(C, comp2nodes, observed, rng, n_sim, a, b, p_base, p_shared):
    """Preregistration section 7.

    PRIMARY   S_graph: Spearman EXCLUDING the seed's own coordinate.
    SECONDARY S_full : Spearman including it. Contains the naive control.
    """
    # observed per component = max over member services (7.3)
    obs_comp, obs_comp_mean = {}, {}
    for ci, members in comp2nodes.items():
        vals = [observed[TRACE_TO_METRIC.get(m, m)]
                for m in members if TRACE_TO_METRIC.get(m, m) in observed]
        if vals:
            obs_comp[ci] = max(vals)
            obs_comp_mean[ci] = float(np.mean(vals))

    evaluable = sorted(obs_comp)
    rows = []
    max_mcse = 0.0
    for c in C.nodes:
        pred, mcse = propagate(C, c, rng, n_sim, a, b, p_base, p_shared)
        max_mcse = max(max_mcse, mcse)

        others = [x for x in evaluable if x != c]
        if len(others) >= 3:
            s_graph = spearmanr([pred[x] for x in others],
                                [obs_comp[x] for x in others]).statistic
        else:
            s_graph = np.nan                      # scored as a miss, not dropped

        allx = evaluable
        s_full = (spearmanr([pred[x] for x in allx],
                            [obs_comp[x] for x in allx]).statistic
                  if len(allx) >= 3 else np.nan)

        others_m = [x for x in sorted(obs_comp_mean) if x != c]
        s_graph_mean = (spearmanr([pred[x] for x in others_m],
                                  [obs_comp_mean[x] for x in others_m]).statistic
                        if len(others_m) >= 3 else np.nan)

        rows.append({"comp": c, "S_graph": s_graph, "S_full": s_full,
                     "S_graph_meanagg": s_graph_mean})
    return pd.DataFrame(rows), max_mcse


# ---------------------------------------------------------------- ranking
def worst_rank(scores, target):
    """Preregistration section 8: worst-rank (maximum) tie-breaking.

    All tied candidates receive the worst rank in their block. Conservative
    by construction. Deterministic, so no seed affects the primary result.
    Returns (rank, tie_block_size) or (None, None) if target absent.
    """
    s = {k: v for k, v in scores.items() if v == v}     # drop NaN
    if target not in s:
        return None, None
    tv = s[target]
    better = sum(1 for v in s.values() if v > tv)
    tied = sum(1 for v in s.values() if v == tv)
    return better + tied, tied


def expected_rank_random(scores, target):
    """Secondary, optimistic: credit 1/k under random tie-breaking."""
    s = {k: v for k, v in scores.items() if v == v}
    if target not in s:
        return None
    tv = s[target]
    better = sum(1 for v in s.values() if v > tv)
    tied = sum(1 for v in s.values() if v == tv)
    return better + (tied + 1) / 2.0


def node_rank_from_comp(comp_scores, comp2nodes, rc_service):
    """Preregistration 5.1: node-level rank, distinct from component-level.

    A service in a top-ranked component of size k receives node rank
    (nodes in strictly better components) + k. Same worst-rank rule.
    """
    target = None
    for ci, members in comp2nodes.items():
        if rc_service in members:
            target = ci
    if target is None:
        return None, None, None
    s = {k: v for k, v in comp_scores.items() if v == v}
    if target not in s:
        return None, None, None
    tv = s[target]
    nodes_better = sum(len(comp2nodes[c]) for c, v in s.items() if v > tv)
    nodes_tied = sum(len(comp2nodes[c]) for c, v in s.items() if v == tv)
    return nodes_better + nodes_tied, len(comp2nodes[target]), nodes_tied


# ------------------------------------------------------------- naive control
def naive_rank(observed, rc_service):
    """Appendix A.5: rank services by observed degradation, descending.

    Worst-rank tie-breaking, same as the method under test.
    """
    rc = TRACE_TO_METRIC.get(rc_service, rc_service)
    if rc not in observed:
        return None
    tv = observed[rc]
    better = sum(1 for v in observed.values() if v > tv)
    tied = sum(1 for v in observed.values() if v == tv)
    return better + tied
