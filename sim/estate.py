"""
Synthetic estate generator for the Architecture Ledger consistency tests.

Every construction here follows Part IX v3.1c and Canonical Thesis v2.1c.
Section references in comments point at the canonical source, not at the brief.

SCOPE WALL (brief section 3). This module contains no dynamical process on
the graph, no spectral method, no point process, no stability analysis, no
statistical mechanics, no path integral. Graph use is static traversal and
reachability only. Volume series are drawn independently; where correlation
is required it is imposed by an explicit joint draw and labelled as such.
"""
from __future__ import annotations
from dataclasses import dataclass, field
import numpy as np

# --------------------------------------------------------------------------
# Objects. Part IX 9.1.1 (graph), 9.1.2 (unit of account).
# --------------------------------------------------------------------------

@dataclass
class Estate:
    n_nodes: int
    tier: np.ndarray               # tier index per node, 0 = edge .. T-1 = store
    edges: list                    # (i, j) directed, i depends on j. STATIC.
    unit_price: np.ndarray         # per driver unit, per node
    fixed_cost: np.ndarray         # F(n), Part IX 9.2.1
    var_cost: np.ndarray           # V(n), Part IX 9.2.1
    build_cost: np.ndarray         # C_build(n), for MC at 9.4
    use_cases: list                # list of dict: entry, nodes, calls, driver, volume
    reach: list                    # G_u as a frozenset of node ids, 9.1.2
    driver: np.ndarray             # driver_u(n), shape (n_uc, n_nodes), 9.2.2
    calls: np.ndarray              # call counts, shape (n_uc, n_nodes)
    volume: np.ndarray             # business volume per use case (txns/month)
    vol_series: np.ndarray         # telemetry volume series, (n_nodes, T)
    seed: int
    params: dict = field(default_factory=dict)

    @property
    def n_uc(self) -> int:
        return len(self.use_cases)

    def consumers(self, n: int) -> np.ndarray:
        """Every use case whose subgraph contains node n."""
        return np.where(self.driver[:, n] > 0)[0]

    def fan_in(self) -> np.ndarray:
        """Number of use cases touching each node. 9.2.6 shared-node limit."""
        return (self.driver > 0).sum(axis=0)


def make_estate(
    seed: int,
    n_tiers: int = 4,
    tier_sizes=(14, 10, 5, 4),
    n_use_cases: int = 24,
    overlap: float = 0.5,          # 0 = near-disjoint, 1 = heavily shared
    fixed_ratio: float = 0.35,     # phi = F/(F+V) per node, swept in exp 1
    intensity_sigma: float = 0.9,  # log-sd of payload intensity, see 9.2.2
    hot_path_alpha: float = 1.6,   # long tail on call volume
    series_len: int = 90,
    vol_sigma: float = 0.25,
) -> Estate:
    """
    Build one estate. All randomness is drawn from `seed` (method rule 2.6).

    Realism requirements from the brief section 5.2 are parameterised:
      - high fan-in shared infrastructure   -> deep tiers are few and shared
      - long tails                          -> Pareto call multipliers
      - varying overlap between use cases   -> `overlap`
      - varying fixed-to-variable ratio     -> `fixed_ratio`
    """
    rng = np.random.default_rng(seed)
    tier_sizes = tuple(tier_sizes)[:n_tiers]
    n_nodes = int(sum(tier_sizes))
    tier = np.concatenate([np.full(s, t) for t, s in enumerate(tier_sizes)])
    starts = np.cumsum((0,) + tier_sizes)

    # ---- edges: tier t may call tier t+1 and t+2. Static, acyclic by tier. ----
    edges = []
    for t in range(n_tiers - 1):
        src = range(starts[t], starts[t + 1])
        for i in src:
            for dt in (1, 2):
                if t + dt >= n_tiers:
                    continue
                lo, hi = starts[t + dt], starts[t + dt + 1]
                cand = np.arange(lo, hi)
                # deeper tiers are smaller, so fan-in concentrates there
                k = max(1, int(rng.integers(1, max(2, len(cand) // 2 + 1))))
                for j in rng.choice(cand, size=min(k, len(cand)), replace=False):
                    edges.append((i, int(j)))
    edges = sorted(set(edges))
    adj = [[] for _ in range(n_nodes)]
    for i, j in edges:
        adj[i].append(j)

    # ---- use cases: entry at tier 0, reachable subgraph is G_u (9.1.2) ----
    entries = rng.choice(np.arange(starts[0], starts[1]), size=n_use_cases,
                         replace=n_use_cases > tier_sizes[0])
    use_cases, reach = [], []
    calls = np.zeros((n_use_cases, n_nodes))
    for u, e in enumerate(entries):
        # Reachability with a per-use-case edge mask. `overlap` controls how
        # much of the shared substrate each use case actually exercises.
        seen, stack = set(), [(int(e), 1.0)]
        while stack:
            n, mult = stack.pop()
            if n in seen:
                calls[u, n] += mult
                continue
            seen.add(n)
            calls[u, n] += mult
            for m in adj[n]:
                # deep shared nodes are entered with probability rising in overlap
                p = overlap if tier[m] >= 2 else 0.85
                if rng.random() < p:
                    fanout = 1.0 + rng.pareto(hot_path_alpha)
                    stack.append((m, mult * fanout))
        reach.append(frozenset(seen))
        use_cases.append({"id": u, "entry": int(e)})

    # ---- driver quantity, Part IX 9.2.2 -------------------------------------
    # DISCREPANCY D3: the brief says allocate "in proportion to observed calls".
    # 9.2.2 refuses that as a default: "Request count is one candidate driver,
    # not the default. Two use cases making equal numbers of calls can differ by
    # an order of magnitude if one moves far more data." So the driver carries a
    # separate payload intensity and is NOT proportional to calls.
    intensity = np.exp(rng.normal(0.0, intensity_sigma, size=(n_use_cases, n_nodes)))
    driver = calls * intensity
    driver[calls == 0] = 0.0

    # ---- business volume per use case, long tailed --------------------------
    volume = np.exp(rng.normal(9.0, 1.1, size=n_use_cases))

    # ---- node costs. 9.2.1 separate the pools -------------------------------
    unit_price = np.exp(rng.normal(1.0, 0.5, size=n_nodes))
    total_driver = driver.sum(axis=0)
    var_cost = unit_price * total_driver                      # V(n), metered

    # F(n) is the declared pool. Its per-node shape is drawn, then the whole
    # pool is scaled so the ESTATE ratio F/(F+V) equals `fixed_ratio` exactly.
    # Exactness matters because experiment 1 sweeps this quantity and reports a
    # threshold against it; an approximate ratio would blur the threshold.
    shape = np.exp(rng.normal(0.0, 0.6, size=n_nodes))
    shape = shape * np.maximum(var_cost, np.median(var_cost[var_cost > 0]) * 0.2)
    target_F = var_cost.sum() * fixed_ratio / (1.0 - fixed_ratio)
    fixed_cost = shape * (target_F / shape.sum())             # F(n), declared
    build_cost = np.exp(rng.normal(9.5, 0.7, size=n_nodes))   # C_build(n), 9.4

    # ---- telemetry volume series, brief 5.4 ---------------------------------
    # INDEPENDENT series by construction. No dynamical coupling between nodes
    # (scope wall). Correlation, where an experiment needs it, is imposed later
    # by an explicit joint draw and declared at the point of use.
    base = np.maximum(total_driver, 1.0)
    vol_series = base[:, None] * np.exp(
        rng.normal(0.0, vol_sigma, size=(n_nodes, series_len))
        - 0.5 * vol_sigma ** 2
    )

    return Estate(
        n_nodes=n_nodes, tier=tier, edges=edges, unit_price=unit_price,
        fixed_cost=fixed_cost, var_cost=var_cost, build_cost=build_cost,
        use_cases=use_cases, reach=reach, driver=driver, calls=calls,
        volume=volume, vol_series=vol_series, seed=seed,
        params=dict(n_tiers=n_tiers, tier_sizes=tier_sizes,
                    n_use_cases=n_use_cases, overlap=overlap,
                    fixed_ratio=fixed_ratio, intensity_sigma=intensity_sigma,
                    hot_path_alpha=hot_path_alpha, series_len=series_len,
                    vol_sigma=vol_sigma),
    )


# --------------------------------------------------------------------------
# Declared partitions. Part IX 9.1.2: the subdomain is DECLARED, not mined.
# --------------------------------------------------------------------------

def reference_partition(est: Estate, n_sub: int, seed: int) -> np.ndarray:
    """A plausible pre-existing decomposition, by dominant deep-tier affinity."""
    rng = np.random.default_rng(seed)
    deep = np.where(est.tier >= 2)[0]
    if len(deep) == 0:
        return rng.integers(0, n_sub, size=est.n_uc)
    aff = est.driver[:, deep]
    key = np.array([deep[np.argmax(aff[u])] if aff[u].sum() > 0 else -1
                    for u in range(est.n_uc)])
    labels, part = {}, np.zeros(est.n_uc, dtype=int)
    for u, k in enumerate(key):
        if k not in labels:
            labels[k] = len(labels) % n_sub
        part[u] = labels[k]
    return part


def perturb(part: np.ndarray, k: int, n_sub: int, seed: int) -> np.ndarray:
    """Move exactly k use cases across boundaries. Local sensitivity family."""
    rng = np.random.default_rng(seed)
    p = part.copy()
    idx = rng.choice(len(p), size=min(k, len(p)), replace=False)
    for i in idx:
        alt = [s for s in range(n_sub) if s != p[i]]
        p[i] = rng.choice(alt)
    return p
