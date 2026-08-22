"""Threshold location, robustness, and the basis control for experiment 1."""
import json
import numpy as np
from scipy.stats import kendalltau
from sim.estate import make_estate, reference_partition
from sim.ledger import unit_cost, variable_share, c_run
from sim.exp1_decomposition import (adversarial_spread, structural_partitions,
                                    FastFixed, KILL)

def spreads_at(fr, seed=20260822, n_sub=5, overlap=0.5, basis="two_stage"):
    est = make_estate(seed=seed, fixed_ratio=fr, overlap=overlap)
    ref = reference_partition(est, n_sub, seed=1)
    if basis == "equal_uc":
        # control: canon 9.10's own convention, equal split across consumers
        sp = structural_partitions(est, n_sub, seed=7); sp["reference"] = ref
        M = np.array([unit_cost(est, p, "equal_uc") for p in sp.values()])
        return dict(cv=float(np.mean(M.std(axis=0)/M.mean(axis=0))),
                    max_abs_dev=float(np.max(np.abs(M - M[0]))))
    adv = adversarial_spread(est, ref, n_sub, seed=99)
    s = np.array([a["spread_frac"] for a in adv])
    sp = structural_partitions(est, n_sub, seed=7); sp["reference"] = ref
    ucs = [unit_cost(est, p, "two_stage") for p in sp.values()]
    taus = [kendalltau(ucs[i], ucs[j]).statistic
            for i in range(len(ucs)) for j in range(i+1, len(ucs))]
    return dict(median=float(np.median(s)), mx=float(s.max()),
                frac_over_1=float((s > 1.0).mean()), tau_min=float(min(taus)))

def bisect(key, target=1.0, lo=0.001, hi=0.95, iters=18):
    for _ in range(iters):
        mid = 0.5*(lo+hi)
        if spreads_at(mid)[key] < target: lo = mid
        else: hi = mid
    return 0.5*(lo+hi)

out = {}
print("=== control: does the cost axis move at all under canon 9.10's own basis? ===")
for fr in (0.35, 0.80):
    c = spreads_at(fr, basis="equal_uc")
    print(f"  phi={fr:.2f}  equal_uc  CV across ALL partitions = {c['cv']:.2e}"
          f"   max abs deviation = {c['max_abs_dev']:.3e}")
    out[f"equal_uc_phi{fr}"] = c

print("\n=== zero-fixed control: pure variable pool ===")
z = spreads_at(0.001)
print(f"  phi=0.001  median spread {z['median']:.4f}  max {z['mx']:.4f}  tau_min {z['tau_min']:.3f}")
out["zero_fixed"] = z

print("\n=== threshold location (two_stage basis) ===")
t_med = bisect("median", 1.0); t_max = bisect("mx", 1.0)
print(f"  phi at which MEDIAN use-case spread reaches 100% : {t_med:.3f}")
print(f"  phi at which WORST  use-case spread reaches 100% : {t_max:.3f}")
out["threshold_median"] = t_med; out["threshold_max"] = t_max

print("\n=== robustness across seeds, overlap, subdomain count (phi=0.35) ===")
rows = []
for seed in (20260822, 7, 101, 2718, 31415):
    r = spreads_at(0.35, seed=seed)
    rows.append(("seed", seed, r)); print(f"  seed={seed:<9} median={r['median']:.3f} max={r['mx']:.3f} tau_min={r['tau_min']:.3f}")
for ov in (0.15, 0.35, 0.65, 0.90):
    r = spreads_at(0.35, overlap=ov)
    rows.append(("overlap", ov, r)); print(f"  overlap={ov:<7} median={r['median']:.3f} max={r['mx']:.3f} tau_min={r['tau_min']:.3f}")
for ns in (3, 5, 8, 12):
    r = spreads_at(0.35, n_sub=ns)
    rows.append(("n_sub", ns, r)); print(f"  n_sub={ns:<9} median={r['median']:.3f} max={r['mx']:.3f} tau_min={r['tau_min']:.3f}")
out["robustness"] = [dict(kind=k, val=v, **r) for k, v, r in rows]

print("\n=== minimum tau observed anywhere in the sweep ===")
tm = min(r["tau_min"] for _, _, r in rows)
print(f"  min Kendall tau across all robustness runs = {tm:.3f}   (K2 threshold 0.50)")
out["tau_min_global"] = tm
json.dump(out, open("sim/out/exp1_thresholds.json","w"), indent=1)
print("\nWROTE sim/out/exp1_thresholds.json")
