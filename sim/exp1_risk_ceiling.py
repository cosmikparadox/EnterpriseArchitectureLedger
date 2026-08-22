"""
Experiment 1, risk axis, in the regime where the subdomain ceiling actually
binds. Part IX 9.3.4 sets a refusal at roughly 1 percent bind rate, so the
interesting band is just below it. Above the refusal line the framework
declines to report at all, which is itself the answer.
"""
import json
import numpy as np
from scipy.stats import kendalltau
from sim.estate import make_estate, reference_partition
from sim.ledger import risk_axis
from sim.exp1_decomposition import structural_partitions

est = make_estate(seed=20260822, fixed_ratio=0.35)
ref = reference_partition(est, 5, seed=1)
sp = structural_partitions(est, 5, seed=7)

print("kappa | bind_ref bind_alt | refuse_ref refuse_alt | tau(mean) tau(P99) | CV(mean)")
rows = []
for kappa in (6.0, 2.0, 1.0, 0.5, 0.25, 0.12, 0.06, 0.03):
    a = risk_axis(est, ref, seed=555, n_sims=20000, kappa=kappa)
    b = risk_axis(est, sp["by_owning_team"], seed=555, n_sims=20000, kappa=kappa)
    tm = kendalltau(a["mean"], b["mean"]).statistic
    tp = kendalltau(a["p99"], b["p99"]).statistic
    cv = float(np.mean(np.abs(b["mean"] - a["mean"]) / np.maximum(a["mean"], 1e-9)))
    rows.append(dict(kappa=kappa, bind_ref=float(a["bind_rate"].max()),
                     bind_alt=float(b["bind_rate"].max()),
                     refuse_ref=int(a["refuse"].sum()), refuse_alt=int(b["refuse"].sum()),
                     tau_mean=float(tm), tau_p99=float(tp), cv=cv))
    print("%5.2f | %8.4f %8.4f |   %3d/%d      %3d/%d    |  %6.3f   %6.3f  | %.4f"
          % (kappa, a["bind_rate"].max(), b["bind_rate"].max(),
             a["refuse"].sum(), est.n_uc, b["refuse"].sum(), est.n_uc, tm, tp, cv))

json.dump(rows, open("sim/out/exp1_risk_ceiling.json", "w"), indent=1)
print("\nNOTE: in this construction the ONLY channel by which the declared")
print("partition reaches the risk axis is the subdomain ceiling (9.3.4).")
print("Where the ceiling does not bind, risk invariance is a property of the")
print("construction, not a finding about the framework.")
print("WROTE sim/out/exp1_risk_ceiling.json")
