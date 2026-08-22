"""Top-level runner for experiment 2. Reproduces every reported number."""
import json
import numpy as np
from sim.exp2_nonadditivity import (MATERIALITY, SEED, regression_9_10, reason_one,
                                    reason_two, reason_three_convexity,
                                    reason_three_shared_k, datar_mathews, cut_vs_uncut)

out = {"materiality": MATERIALITY, "seed": SEED}
print("MATERIALITY THRESHOLD declared before running: %.0f%%\n" % (MATERIALITY*100))

r = regression_9_10(); out["regression_9_10"] = r
print("REGRESSION 9.10: k=%.3f Z=%.3f post=%.4f cred=%.4f  PASS=%s\n"
      % (r["k"], r["Z"], r["posterior"], r["credibility"], r["pass_"]))

# ---------------- REASON ONE ----------------
print("=== REASON ONE, COST ===")
print("Q1 estate-cost question, sweeping instrumentation coverage (equal_uc basis)")
r1cov = [reason_one(coverage=c) for c in (0.10,0.25,0.50,0.75,0.90,1.00)]
for x in r1cov:
    print("  coverage %.2f  naive %8.0f  true %8.0f  gap %+8.0f  %+7.2f%%  mean weight mass %.3f"
          % (x["coverage"], x["q1_naive"], x["q1_true"], x["q1_gap"], 100*x["q1_gap_frac"], x["mean_weight_mass"]))
print("\nQ2 removal question, sweeping fixed ratio (coverage 1.0)")
r1fix = [reason_one(fixed_ratio=f) for f in (0.00,0.05,0.20,0.35,0.50,0.65,0.80)]
for x in r1fix:
    print("  phi %.2f  naive %8.0f  true %8.0f  gap %+8.0f  %+7.1f%%   (released fixed %.0f)"
          % (x["fixed_ratio"], x["q2_naive"], x["q2_true"], x["q2_gap"], 100*x["q2_gap_frac"], x["q2_released_fixed"]))
print("\nQ2 by overlap, and by allocation basis (phi=0.35)")
r1ov = [reason_one(overlap=o) for o in (0.10,0.30,0.50,0.70,0.90)]
for x in r1ov: print("  overlap %.2f  gap %+7.1f%%" % (x["overlap"], 100*x["q2_gap_frac"]))
r1bas = [reason_one(basis=b) for b in ("equal_uc","driver_prop","two_stage")]
for x in r1bas: print("  basis %-12s Q2 gap %+7.1f%%   Q1 gap %+7.2f%%" % (x["basis"], 100*x["q2_gap_frac"], 100*x["q1_gap_frac"]))
out["r1"] = dict(coverage=r1cov, fixed=r1fix, overlap=r1ov, basis=r1bas)

# ---------------- REASON TWO ----------------
print("\n=== REASON TWO, RISK ===")
NS = 400_000
print("controls first")
c_como = reason_two(n_sims=NS, comonotonic=True)
c_ind  = reason_two(n_sims=NS, independent=True)
print("  comonotonic (canon G7 says EXACTLY additive)  gap %+.6f%%" % (100*c_como["gap_frac"]))
print("  independent                                   gap %+.2f%%" % (100*c_ind["gap_frac"]))
r2rho = [reason_two(rho=r_, n_sims=NS) for r_ in (0.0,0.2,0.4,0.6,0.8,0.95)]
print("\nby correlation (k=8, df=4, q=0.99)")
for x in r2rho: print("  rho %.2f  naive %9.2f  correct %9.2f  gap %+7.2f%%" % (x["rho"], x["naive"], x["correct"], 100*x["gap_frac"]))
r2df = [reason_two(df=d, n_sims=NS) for d in (2,3,4,8,30)]
print("\nby tail dependence, t degrees of freedom (rho=0.35)")
for x in r2df: print("  df %2d  gap %+7.2f%%" % (x["df"], 100*x["gap_frac"]))
r2k = [reason_two(k=kk, n_sims=NS) for kk in (2,4,8,16,32)]
print("\nby number of use cases summed")
for x in r2k: print("  k %2d  gap %+7.2f%%" % (x["k"], 100*x["gap_frac"]))
r2q = [reason_two(q=qq, n_sims=NS) for qq in (0.50,0.90,0.95,0.99,0.995)]
print("\nby quantile")
for x in r2q: print("  q %.3f  gap %+7.2f%%" % (x["q"], 100*x["gap_frac"]))
out["r2"] = dict(comonotonic=c_como, independent=c_ind, rho=r2rho, df=r2df, k=r2k, q=r2q)

# ---------------- REASON THREE ----------------
print("\n=== REASON THREE, OPTION VALUE ===")
print("reproduce canon 9.10 option block first, 2,000,000 sims seed 20260809")
W_rev = datar_mathews(180_000.0); W_com = datar_mathews(640_000.0)
print("  W(K=180k) = %.0f   canon 426,004" % W_rev)
print("  W(K=640k) = %.0f   canon 144,547" % W_com)
print("  OC        = %.0f   canon 281,457" % (W_rev - W_com))
out["canon_9_10_option"] = dict(W_rev=W_rev, W_com=W_com, oc=W_rev-W_com,
                                canon_W_rev=426004, canon_W_com=144547, canon_oc=281457)
print("\n3a convexity, two options valued separately vs jointly")
r3c = [reason_three_convexity(rho=rr, n_sims=400_000) for rr in (-0.9,-0.5,0.0,0.5,0.9,0.99)]
for x in r3c: print("  rho %+.2f  separate %9.0f  joint %9.0f  gap %+7.2f%%" % (x["rho"], x["separate"], x["joint"], 100*x["gap_frac"]))
print("\n3a control: deep in the money, legs never take opposite signs -> equality")
ctrl = reason_three_convexity(rho=0.0, n_sims=400_000, K=1000.0)
print("  K=1k  separate %.0f  joint %.0f  gap %+.4f%%" % (ctrl["separate"], ctrl["joint"], 100*ctrl["gap_frac"]))
print("\n3b shared K, one commitment ridden by m use cases")
r3s = [reason_three_shared_k(m) for m in (1,2,3,5,8)]
for x in r3s: print("  m %d  naive %10.0f  correct %10.0f  gap %+10.0f  %+7.0f%%" % (x["m"], x["naive"], x["correct"], x["gap"], 100*x["gap_frac"]))
out["r3"] = dict(convexity=r3c, control=ctrl, shared_k=r3s)

# ---------------- 7.4 CUT VS UNCUT ----------------
print("\n=== 7.4 PRICE OF CUTTING THE GRAPH FIRST ===")
NS2 = 200_000
r4u = [cut_vs_uncut(n_units=n, n_sims=NS2) for n in (2,3,5,8,12)]
print("by number of declared units (Gaussian assumed copula, q=0.99)")
for x in r4u: print("  units %2d  uncut VaR %10.0f  cut VaR %10.0f  gap %+7.2f%%" % (x["n_units"], x["uncut_var"], x["cut_var"], 100*x["var_gap_frac"]))
r4o = [cut_vs_uncut(overlap=o, n_sims=NS2) for o in (0.10,0.30,0.50,0.70,0.90)]
print("\nby use-case overlap")
for x in r4o: print("  overlap %.2f  gap %+7.2f%%" % (x["overlap"], 100*x["var_gap_frac"]))
r4a = [cut_vs_uncut(assumed=a, n_sims=NS2) for a in ("independent","gaussian","t4","comonotonic")]
print("\nby ASSUMED copula family (the choice the framework must make blind)")
for x in r4a: print("  assumed %-13s cut VaR %10.0f  gap %+7.2f%%" % (x["assumed"], x["cut_var"], 100*x["var_gap_frac"]))
out["r4"] = dict(units=r4u, overlap=r4o, assumed=r4a)

json.dump(out, open("sim/out/exp2.json","w"), indent=1, default=float)
print("\nWROTE sim/out/exp2.json")
