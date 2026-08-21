# Results: Experiment 1, H4 ranking clause, RCAEval RE2

Author: Abhineet Asthana. Executed by Claude Code, 2026-08-20.
Pre-registration frozen at `b0db614791c597dd7b0e91358bf7079762d4ddeb`.
Analysis code frozen at `7cc789688b8ae8296b144d9daaded23e4d35a67e`.
Canonical set at `61cec7f57a256cf99ca89d349ae59cb4a685d7c7`, revision "c".

Evidence grading: Strong means direct measurement against primary data.
Indicative means the evidence points this way but is not conclusive.
Asserted means judgement, not established.

---

## ABSTRACT

**The result is NULL. The method did not beat the naive control. It
performed significantly worse than it.** [Strong.]

```
McNemar exact, paired top-1, n = 180

  b (graph method correct, naive wrong)  =  12
  c (graph method wrong, naive correct)  =  53

  one-sided p (method greater)  =  1.000000
  two-sided p                   =  0.00000028
  one-sided p (method LESS)     =  0.00000014

  VERDICT: FAIL TO REJECT the null. The method underperformed
           the naive rank-by-worst-symptom control, and the
           underperformance is itself statistically significant.
```

**What was tested.** This tests a **RANKING EXTENSION** introduced in the
experiment brief. It is **NOT canonical H4**. Canonical H4 states
"Propagated loss differs from node-local sum" with kill condition
"Propagated and naive totals agree". That concerns monetary totals.
RCAEval contains no revenue, loss or switching cost data, so **the
canonical H4 kill condition cannot be evaluated here at all**. Neither
this null nor any positive result may be reported as bearing on canonical
H4. See pre-registration section 1.3. [Strong.]

**Prior art.** H4 sits on the RISK AXIS, which Canonical Thesis v2.1c
section 5.4 and Part IX Mathematics v3.1c section 9.3.9 grade as
**OCCUPIED** by a granted patent family with a **12 March 2018 priority
date** (US 10,257,219 and four continuations). That family builds a
discovered dependency graph, propagates a seeded disruption by Monte
Carlo with a per-edge conditional probability, and reports a
dollar-denominated loss exceedance curve. **A positive result here would
have demonstrated computability and comparative ranking performance and
would have established no novelty. The null establishes even less.**
[Strong.]

**Power.** The study was declared UNDERPOWERED in advance, in
pre-registration section 12.5, before any scoring code existed. The
design required the method to solve 26 of 34 winnable hard cases, 76.5
percent, against a published state of the art of 21 percent on hard
benchmarks. A null was preregistered as the likely outcome. It is the
outcome. [Strong.]

---

## 1. Headline numbers

```
+--------------------------------+---------+---------+------------------+
| TOP-1, node level, n = 180     |   COUNT |    RATE | WILSON 95% CI    |
+--------------------------------+---------+---------+------------------+
| NAIVE CONTROL                  | 142/180 |  78.9%  | [72.4%, 84.2%]   |
| Method, PRIMARY S_graph        | 101/180 |  56.1%  | [48.8%, 63.2%]   |
+--------------------------------+---------+---------+------------------+
| TOP-3, node level, n = 180     |   COUNT |    RATE | WILSON 95% CI    |
+--------------------------------+---------+---------+------------------+
| NAIVE CONTROL                  | 165/180 |  91.7%  | [86.7%, 94.9%]   |
| Method, PRIMARY S_graph        | 124/180 |  68.9%  | [61.8%, 75.2%]   |
+--------------------------------+---------+---------+------------------+
```

The confidence intervals do not overlap at top-1 or top-3. [Strong.]

Of the 162 cases where the root cause was reachable at all, the method
ranked it WORSE than the naive control in 53 cases, BETTER in 17, and
EQUAL in 92. [Strong.]

Run integrity: 180 of 180 cases completed, **0 errors**, maximum Monte
Carlo standard error **0.0011**, total runtime 699 seconds. [Strong.]

---

## 2. Scope and exclusions

### 2.1 n = 180, not 270

```
+-----------+--------+--------------------------------------------------+
| DATASET   |  CASES | STATUS                                           |
+-----------+--------+--------------------------------------------------+
| RE2-OB    |     90 | INCLUDED                                         |
| RE2-TT    |     90 | INCLUDED                                         |
| RE2-SS    |      0 | EXCLUDED. Sock Shop contains ZERO trace files.   |
|           |        | Verified by count: 90 case directories, 0        |
|           |        | traces.csv, 0 tracets_*.csv. A trace-mined       |
|           |        | method cannot run on it. Stated limitation,      |
|           |        | not a silent omission.                           |
+-----------+--------+--------------------------------------------------+
| TOTAL     |    180 |                                                  |
+-----------+--------+--------------------------------------------------+
```

One further exclusion: `RE2-OB/checkoutservice_cpu/multi-source-data`,
a byte-identical duplicate of `checkoutservice_cpu/1`
(md5 956052e9c07123b4517e37a0b536d9cf). Not a case. [Strong.]

### 2.2 n by system and fault type

```
+---------+-----+-------+------+------+-----+--------+-------+
| SYSTEM  | cpu | delay | disk | loss | mem | socket | TOTAL |
+---------+-----+-------+------+------+-----+--------+-------+
| RE2-OB  |  15 |    15 |   15 |   15 |  15 |     15 |    90 |
| RE2-TT  |  15 |    15 |   15 |   15 |  15 |     15 |    90 |
+---------+-----+-------+------+------+-----+--------+-------+
| TOTAL   |  30 |    30 |   30 |   30 |  30 |     30 |   180 |
+---------+-----+-------+------+------+-----+--------+-------+
```

---

## 3. The 18 zeros, as a line item

```
+---------------------------------------------------------------+
| RE2-TT cases where the annotated root cause is ABSENT from     |
| the mined graph, and which therefore score ZERO under the      |
| PRIMARY candidate set:                          18 of 180      |
|                                                                |
| All 18 are ts-auth-service.                                    |
+---------------------------------------------------------------+
```

ts-auth-service emits roughly 10,000 spans per case. Every one is either
a trace root (null parent) or parented by another ts-auth-service span,
so it has no cross-service edge and Appendix A.1's mining never adds it
as a node. It is traced in 90 of 90 TT cases and absent from the mined
graph in 90 of 90. [Strong.]

**These 18 zeros are the honest coverage cost of a mined-substrate
method, not a scoring artefact.** What the graph cannot see, the graph
cannot blame. They are reported as a first-class part of the result, and
the naive control scores 14 of those 18 correctly. [Strong.]

---

## 4. Primary result, in full

### 4.1 Component level versus node level, reported separately

```
+--------------------------------+-----------+-----------+
| PRIMARY S_graph, n = 180       | COMPONENT | NODE      |
+--------------------------------+-----------+-----------+
| top-1                          |  101/180  |  101/180  |
| top-3                          |  124/180  |  124/180  |
+--------------------------------+-----------+-----------+
| Cases where the root cause sat inside a multi-node SCC |
| and so could not be resolved internally:      15       |
+--------------------------------------------------------+
```

**No accuracy came from coarser granularity.** Component-level and
node-level top-1 are identical at 101. In the 15 cases where the root
cause sat inside a multi-node component, the worst-rank tie rule pushed
the node rank below the component rank, and none of those 15 was a
top-1 hit at either level. [Strong.]

### 4.2 Primary statistic versus S_full

```
+----------------------------+---------+---------+-------------------------+
| STATISTIC                  |  TOP-1  |  TOP-3  | STATUS                  |
+----------------------------+---------+---------+-------------------------+
| S_graph  (PRIMARY)         | 101/180 | 124/180 | Seed coordinate         |
|                            |  56.1%  |  68.9%  | EXCLUDED. Non-circular. |
|                            |         |         | This is the tested      |
|                            |         |         | statistic.              |
+----------------------------+---------+---------+-------------------------+
| S_full   (SECONDARY)       | 117/180 | 143/180 | CONTAINS THE NAIVE      |
|                            |  65.0%  |  79.4%  | CONTROL. NOT tested     |
|                            |         |         | against it. Reported    |
|                            |         |         | for completeness only.  |
+----------------------------+---------+---------+-------------------------+
```

S_full scores 16 cases higher than S_graph. That gap is the naive control
leaking back into the statistic, which is precisely what the circularity
guard was preregistered to remove. It is not evidence of graph
performance. [Strong.]

### 4.3 Candidate sets

```
+-------------------------------+----------+----------+----------+----------+
|                               | S_graph  | S_graph  | S_full   | S_full   |
| CANDIDATE SET                 | TOP-1    | TOP-3    | TOP-1    | TOP-3    |
+-------------------------------+----------+----------+----------+----------+
| PRIMARY, graph nodes only     | 101/180  | 124/180  | 117/180  | 143/180  |
|                               |  56.1%   |  68.9%   |  65.0%   |  79.4%   |
+-------------------------------+----------+----------+----------+----------+
| SECONDARY, all traced svcs    |  98/180  | 123/180  | 124/180  | 156/180  |
| UPPER BOUND ONLY              |  54.4%   |  68.3%   |  68.9%   |  86.7%   |
+-------------------------------+----------+----------+----------+----------+
```

**CAPTION, required on the secondary row.** The all-traced-services figure
is an UPPER BOUND. Admitting graph-isolated candidates lets the method
fall back to naive-control behaviour exactly where the graph failed,
importing naive performance into the graph method's score. It is never
reported alone.

**A correction to that caption's own reasoning, logged as D-03.** The
described mechanism is real for S_full and NOT real for S_graph. Under
S_graph the seed's coordinate is excluded, so a graph-isolated candidate
has an all-zero predicted vector over the remaining services, its
correlation is undefined, and it ranks last. Measured directly: under the
secondary set, the 18 ts-auth cases score **0 of 18** on S_graph and
**7 of 18** on S_full. The secondary set therefore lowers S_graph
slightly, from 56.1 to 54.4 percent, by adding competitors, and raises
S_full, from 65.0 to 68.9 percent, by the naive fallback. [Strong.]

Neither candidate set beats naive:

```
+-------------------------------+-----+-----+----------------+
| McNEMAR vs NAIVE              |  b  |  c  | one-sided p    |
+-------------------------------+-----+-----+----------------+
| PRIMARY   S_graph             |  12 |  53 |     1.000000   |
| SECONDARY S_graph             |  12 |  56 |     1.000000   |
| SECONDARY S_full (not valid   |  13 |  31 |     0.998171   |
| as a test; shown for record)  |     |     |                |
+-------------------------------+-----+-----+----------------+
```

### 4.4 Decomposition of the 53 losses

```
+---------------------------------------------------+-------+
| c = 53 cases the method lost that naive won       | COUNT |
+---------------------------------------------------+-------+
| Root cause absent from mined graph (ts-auth)      |    14 |
| Root cause in the graph, method still missed      |    39 |
+---------------------------------------------------+-------+
```

**Even discounting every unreachable case, the method lost 39 cases the
naive control won, against 12 it won.** The ts-auth coverage gap is not
the explanation for the null. [Strong.]

---

## 5. Hard versus easy

Classified before scoring, per Appendix A.4, on `latency-90`.

```
+-----------+-----+---------------+---------------+
| SYSTEM    |  n  | EASY          | HARD          |
+-----------+-----+---------------+---------------+
| RE2-OB    |  90 |  72  (80.0%)  |  18  (20.0%)  |
| RE2-TT    |  90 |  70  (77.8%)  |  20  (22.2%)  |
+-----------+-----+---------------+---------------+
| COMBINED  | 180 | 142  (78.9%)  |  38  (21.1%)  |
+-----------+-----+---------------+---------------+
```

```
+-----------+-----+----------------+----------------+------------------+
| SUBSET    |  n  | METHOD TOP-1   | METHOD TOP-3   | WILSON 95% CI    |
|           |     | (node, S_graph)| (node, S_graph)| on TOP-1         |
+-----------+-----+----------------+----------------+------------------+
| HARD      |  38 |  12   (31.6%)  |  17   (44.7%)  | [19.1%, 47.5%]   |
| EASY      | 142 |  89   (62.7%)  | 107   (75.4%)  | [54.5%, 70.2%]   |
+-----------+-----+----------------+----------------+------------------+
```

### 5.1 "Hard" is defined by the control, so the control scores zero on it by arithmetic

**[Strong.]** Appendix A.4 defines a case as hard when some service other
than the annotated root cause degrades more, and the naive control ranks
by exactly that degradation. The two definitions are the same definition.
So:

```
naive top-1 on the hard subset = 0 / 38 = 0.0%
```

**This is a tautology, not a measurement.** It is what "hard" was defined
to mean. It carries no information about the naive control, and it carries
no information about any method compared against it on that subset.

It follows that **any** method whose ranking differs from the naive
control at all will win some hard cases, purely by differing. Scoring
above zero on the hard subset is the arithmetic consequence of not being
the naive control. It is not evidence of anything.

**A previous version of this section stated that "the method does
something on hard cases that the naive control by construction cannot".
That sentence is true and empty, and it is withdrawn.** The words "by
construction" were doing the work of an excuse rather than a
qualification. Logged as D-05.

### 5.2 The comparison to published state of the art is withdrawn

**[Strong.]** A previous version compared the method's 31.6 percent on
the hard subset against the 21 percent top-1 that Fang et al. (arXiv
2510.04711) report as state of the art, and graded the comparison
[Indicative].

The grade did not fix the problem, because the problem is a category
error rather than an uncertainty. Fang et al. measure 21 percent across a
whole benchmark constructed to be hard. The 31.6 percent here is measured
on "the subset of RE2 where one particular rule happens to fail". Those
are different populations selected by different procedures. A rate on one
cannot be transplanted onto the other, in either direction.

**The comparison is withdrawn, not caveated. No claim in this document
rests on it.**

### 5.3 EXPLORATORY, POST HOC: the baselines on the same 38 cases

**This subsection is POST HOC.** Stratifying the baselines to the hard
subset was NOT preregistered. It uses only data already collected under
the frozen analysis code, with no rerun, no retune and no new
measurement, so it is a re-cut of the existing result rather than a new
experiment. It sits after the preregistered result, and **no p-values or
significance claims are attached to anything in it.** Logged as D-05.

The comparison that section 5 previously lacked is the obvious one: how
do the other methods score on the same 38 cases?

```
+--------------------+-----------+---------+------------------+
| TOP-1 ON THE 38 HARD CASES                                  |
+--------------------+-----------+---------+------------------+
| METHOD             |   COUNT   |   RATE  | WILSON 95% CI    |
+--------------------+-----------+---------+------------------+
| nsigma             |   21/38   |  55.3%  | [39.7%, 69.9%]   |
| BARO               |   19/38   |  50.0%  | [34.8%, 65.2%]   |
| METHOD S_graph     |   12/38   |  31.6%  | [19.1%, 47.5%]   |
| CIRCA              |    2/38   |   5.3%  | [1.5%, 17.3%]    |
| RANDOM FLOOR       |    2/38   |   5.3%  | [1.5%, 17.3%]    |
| epsilon-Diagnosis  |    0/38   |   0.0%  | [0.0%, 9.2%]     |
| RCD (did not run)  |    0/38   |   0.0%  | [0.0%, 9.2%]     |
| NAIVE CONTROL      |    0/38   |   0.0%  | [0.0%, 9.2%]     |
|   (zero by definition, see 5.1)                             |
+--------------------+-----------+---------+------------------+
```

```
+--------------------+-----------+---------+------------------+
| TOP-3 ON THE 38 HARD CASES                                  |
+--------------------+-----------+---------+------------------+
| BARO               |   31/38   |  81.6%  | [66.6%, 90.8%]   |
| nsigma             |   30/38   |  78.9%  | [63.7%, 88.9%]   |
| METHOD S_graph     |   17/38   |  44.7%  | [30.1%, 60.3%]   |
| CIRCA              |   11/38   |  28.9%  | [17.0%, 44.8%]   |
| RANDOM FLOOR       |   10/38   |  26.3%  | [15.0%, 42.0%]   |
| epsilon-Diagnosis  |    6/38   |  15.8%  | [7.4%, 30.4%]    |
+--------------------+-----------+---------+------------------+
```

Hard subset composition, for context: 20 Train Ticket and 18 Online
Boutique; by fault type, 9 loss, 8 disk, 6 cpu, 6 delay, 5 mem, 4 socket.

**Against the random floor.** The method scores 12 of 38 where shuffling
scores 2 of 38. The two Wilson intervals do NOT overlap: the method's
lower bound is 19.1 percent and the random floor's upper bound is 17.3
percent. The margin is 1.8 percentage points, which is narrow, and this
is a post hoc cut on 38 cases, so the separation should be treated as
fragile rather than established.

**Against the methods that actually ran.** On the same 38 cases, nsigma
scores 55.3 percent and BARO 50.0 percent against the method's 31.6
percent. At top-3 the gap widens: 81.6 and 78.9 percent against 44.7
percent. **On the hard subset, the subset previously used to present the
method favourably, the method is beaten by both baselines that ran
cleanly on all 180 cases.**

### 5.4 What section 5 licences

```
+---------------------------------------------------------------+
| The method beat the naive control on 12 of 38 hard cases.     |
| That is the arithmetic consequence of differing from the      |
| control on a subset defined as where the control fails.       |
|                                                               |
| It is above the random floor by a narrow, post hoc margin.    |
|                                                               |
| It is well below nsigma and BARO on the same 38 cases.        |
|                                                               |
| It is well below the naive control on the full 180.           |
+---------------------------------------------------------------+
```

**Nothing in section 5 shows the method outperforming anything.** [Strong.]

A method that only works on easy cases has shown nothing. A method that
scores below both working baselines on the hard cases, and below a
one-line rule overall, has also shown nothing about the ranking clause.
[Asserted, this is a judgement.]

---

## 6. Baselines

```
+--------------------+-----------+---------+------------------+-----------+
| METHOD             |  TOP-1    |   RATE  | WILSON 95% CI    | RAN ON    |
+--------------------+-----------+---------+------------------+-----------+
| NAIVE CONTROL      | 142/180   |  78.9%  | [72.4%, 84.2%]   | 180/180   |
| nsigma             | 130/180   |  72.2%  | [65.3%, 78.2%]   | 180/180   |
| BARO               | 127/180   |  70.6%  | [63.5%, 76.7%]   | 180/180   |
| METHOD S_graph     | 101/180   |  56.1%  | [48.8%, 63.2%]   | 180/180   |
| epsilon-Diagnosis  |  11/180   |   6.1%  | [3.4%, 10.6%]    |  27/180   |
| Random floor       |  11/180   |   6.1%  | [3.4%, 10.6%]    | 180/180   |
| CIRCA              |   6/180   |   3.3%  | [1.5%, 7.1%]     | 180/180   |
| RCD                |   0/180   |   0.0%  | [0.0%, 2.1%]     |   0/180   |
+--------------------+-----------+---------+------------------+-----------+
```

```
+--------------------+-----------+---------+------------------+
| METHOD             |  TOP-3    |   RATE  | WILSON 95% CI    |
+--------------------+-----------+---------+------------------+
| NAIVE CONTROL      | 165/180   |  91.7%  | [86.7%, 94.9%]   |
| BARO               | 163/180   |  90.6%  | [85.4%, 94.0%]   |
| nsigma             | 162/180   |  90.0%  | [84.7%, 93.6%]   |
| METHOD S_graph     | 124/180   |  68.9%  | [61.8%, 75.2%]   |
| Random floor       |  30/180   |  16.7%  | [11.9%, 22.8%]   |
| CIRCA              |  30/180   |  16.7%  | [11.9%, 22.8%]   |
| epsilon-Diagnosis  |  27/180   |  15.0%  | [10.5%, 20.9%]   |
| RCD                |   0/180   |   0.0%  | [0.0%, 2.1%]     |
+--------------------+-----------+---------+------------------+
```

Paired McNemar, method against each baseline, one-sided, method greater:

```
+--------------------+-----+-----+-------------+---------------+
| COMPARISON         |  b  |  c  | p one-sided | HOLM-ADJUSTED |
+--------------------+-----+-----+-------------+---------------+
| vs NAIVE (PRIMARY) |  12 |  53 |    1.000000 | not corrected |
+--------------------+-----+-----+-------------+---------------+
| vs nsigma          |  24 |  53 |    0.999731 |      1.000000 |
| vs BARO            |  25 |  51 |    0.999119 |      1.000000 |
| vs epsilon-Diag    |  92 |   2 |   < 1e-6    |      < 1e-6   |
| vs CIRCA           |  98 |   3 |   < 1e-6    |      < 1e-6   |
| vs RCD             | 101 |   0 |   < 1e-6    |      < 1e-6   |
+--------------------+-----+-----+-------------+---------------+
| vs Random floor    |  95 |   5 |   < 1e-6    | not in family |
+--------------------+-----+-----+-------------+---------------+
```

**Three of those five wins are not findings and must not be read as
such.** [Strong.]

- **RCD produced no output on any case.** RCAEval 1.6.0's `e2e/rcd.py`
  calls `SkeletonDiscovery.local_skeleton_discovery` on its default path
  and passes a `labels=` keyword to `skeleton_discovery` on the other.
  Neither exists in causal-learn; checked at 0.1.3.3, 0.1.3.6, 0.1.3.8
  and 0.1.4.8. Both are present only in the RCD authors' fork, which
  RCAEval does not pin. 130 cases failed with the AttributeError, 50 with
  a downstream NaN error. **Beating a baseline that did not run is not a
  result.** RCAEval's internals were not patched to manufacture a number.
  Logged as D-04.
- **epsilon-Diagnosis ranks at most three services** (median 3, maximum
  3, and 0 in seven cases). Its output is structurally incapable of
  ranking beyond top-3, so its low score reflects coverage, not only
  accuracy.
- **CIRCA scored below the random floor** (3.3 percent against 6.1
  percent) under RCAEval's default settings. Reported as measured. No
  attempt was made to tune it, since tuning a baseline after seeing
  results is exactly what pre-registration forbids. [Strong.]

**The finding that matters in this table is not about the method at
all.** The naive rank-by-worst-symptom control beat **every** RCAEval
baseline, including BARO and nsigma, the two that ran cleanly on all 180
cases. Part IX Mathematics v3.1c section 9.11 warned, before this
experiment was designed, that "several widely used benchmarks are simple
enough that trivial rule-based methods match state-of-the-art results, so
choose a hard one". On RE2 a trivial rule does not merely match the
baselines. It beats all of them. [Strong.]

---

## 7. Sensitivity grid

Nine cells, full 180 cases each, 1,620 runs, 0 errors.

```
+--------------------------+--------+--------+--------+-----+-----+----------+
| CELL                     | TOP-1  |  RATE  | TOP-3  |  b  |  c  | p ONE-   |
|                          |        |        |        |     |     | SIDED    |
+--------------------------+--------+--------+--------+-----+-----+----------+
| a1 b1 p_base 0.35        |    103 | 57.2%  |    124 |  12 |  51 |  1.0000  |
| a2 b5 p_base 0.35        |    101 | 56.1%  |    124 |  12 |  53 |  1.0000  |
| a1 b1 p_base 0.75        |    100 | 55.6%  |    123 |  12 |  54 |  1.0000  |
| a5 b2 p_base 0.75        |    100 | 55.6%  |    123 |  12 |  54 |  1.0000  |
| a2 b5 p_base 0.75        |     98 | 54.4%  |    124 |  12 |  56 |  1.0000  |
| a5 b2 p_base 0.35        |     97 | 53.9%  |    123 |  12 |  57 |  1.0000  |
| a1 b1 p_base 0.55        |     96 | 53.3%  |    123 |  12 |  58 |  1.0000  |
| a2 b5 p_base 0.55        |     96 | 53.3%  |    124 |  12 |  58 |  1.0000  |
| a5 b2 p_base 0.55        |     96 | 53.3%  |    124 |  12 |  58 |  1.0000  |
+--------------------------+--------+--------+--------+-----+-----+----------+
| NAIVE CONTROL (fixed)    |    142 | 78.9%  |    165 |     |     |          |
+--------------------------+--------+--------+--------+-----+-----+----------+

  top-1 range: 53.3% to 57.2%. Spread 3.9 percentage points.
  Cells reaching p <= 0.05:                 0 of 9
  Cells beating naive at all (b > c):       0 of 9
  b was exactly 12 in all nine cells.
```

Appendix A.2 required that if top-1 accuracy moves more than a few points
across the grid, the parameter choice rather than the graph is driving the
result, and that this must be the headline. **It does not.** The spread is
3.9 points, and the gap to the naive control is 21.7 to 25.6 points in
every cell. The null is not a parameter artefact. [Strong.]

The four ASSERTED defaults (a=2, b=5, p_base=0.55, p_shared=0.40) remain
unfitted and unjustified. The grid shows the conclusion does not depend on
them, which is a different and weaker claim than the defaults being
correct. [Strong.]

---

## 8. Monte Carlo seed sensitivity, an unplanned finding

The default parameter cell was run twice under different derived seeds,
because the two runners built the cell identifier differently
("a2.0_b5.0_..." against "a2_b5_..."). This produced an accidental
replication.

```
+-------------------------------+---------+
| Same parameters, two seeds    |  TOP-1  |
+-------------------------------+---------+
| seed set A (full_default)     |     101 |
| seed set B (grid)             |      96 |
+-------------------------------+---------+
| Node ranks differed on 15 of 180 cases (8.3%).       |
| Every difference was exactly +/- 1 rank.             |
| Top-1 flips: 1 gained, 6 lost.                       |
+------------------------------------------------------+
```

At n_sim = 200,000 the maximum Monte Carlo standard error is 0.0011,
which is small in absolute terms but sufficient to reorder
near-tied candidates. **Top-1 carries roughly plus or minus 3 percentage
points of seed jitter.** [Strong.]

This does not affect the conclusion: the gap to naive is 22.8 points,
roughly seven times the jitter. It is reported because a point estimate
without its variability is exactly what the framework's distribution rule
forbids, and because it was not anticipated in the pre-registration.
[Strong.]

---

## 9. Every failure, with a cause

79 of 180 cases were top-1 failures for the method.

```
+-------------------------------------------------+-------+
| FAILURE CATEGORY                                | COUNT |
+-------------------------------------------------+-------+
| D. Ranked, but not first                        |    46 |
| A. Root cause absent from the mined graph       |    18 |
|    (all ts-auth-service, scored zero)           |       |
| B. Root cause inside a multi-node SCC, so       |    15 |
|    unresolvable at node level                   |       |
+-------------------------------------------------+-------+
```

**Category A, 18 cases.** Cause established, not guessed: ts-auth-service
has no cross-service parent-child edge in any case, so A.1 mining cannot
place it in the graph. [Strong.]

**Category B, 15 cases.** Cause established: Tarjan condensation merges
services in a cycle into one component, and the preregistered worst-rank
tie rule then assigns every member the worst rank in the block. The
cycles observed are small, chiefly
(ts-travel2-service, ts-seat-service) and
(ts-seat-service, ts-travel-service). This is the cost of the cycle
handling and it was accepted in advance. [Strong.]

**Category D, 46 cases.** Rank distribution:

```
+--------+-------+
| RANK   | CASES |
+--------+-------+
|   2    |    17 |
|   3    |     6 |
|   4    |    12 |
|   5    |     9 |
|  10    |     1 |
|  19    |     1 |
+--------+-------+
```

The naive control got 35 of these 46 right. **[Indicative]** cause: the
graph-consistency score ranks by how well the observed degradation
pattern of OTHER services matches propagation from the candidate. In
Online Boutique the mined graph has only 7 nodes and 9 edges, so many
candidates induce near-identical ancestor sets and the score has little
to separate them. 17 of the 46 are rank 2, consistent with the true cause
being a close second on a statistic with coarse resolution rather than
being badly misplaced.

Per fault type and system:

```
+---------+--------+--------+--------+--------+--------+--------+
| METHOD  |  cpu   | delay  |  disk  |  loss  |  mem   | socket |
| TOP-1   | (n=15) | (n=15) | (n=15) | (n=15) | (n=15) | (n=15) |
+---------+--------+--------+--------+--------+--------+--------+
| RE2-OB  |   10   |   11   |   10   |   12   |   10   |    7   |
| RE2-TT  |    6   |    9   |    5   |    7   |    7   |    7   |
+---------+--------+--------+--------+--------+--------+--------+
| NAIVE   |  cpu   | delay  |  disk  |  loss  |  mem   | socket |
+---------+--------+--------+--------+--------+--------+--------+
| RE2-OB  |   11   |   11   |   13   |   13   |   13   |   11   |
| RE2-TT  |   13   |   13   |    9   |    8   |   12   |   15   |
+---------+--------+--------+--------+--------+--------+--------+
```

By system:

```
+---------+-----+-----------------+-----------------+
| SYSTEM  |  n  | METHOD TOP-1    | NAIVE TOP-1     |
+---------+-----+-----------------+-----------------+
| RE2-OB  |  90 |  60  (66.7%)    |  72  (80.0%)    |
| RE2-TT  |  90 |  41  (45.6%)    |  70  (77.8%)    |
+---------+-----+-----------------+-----------------+
```

The method is markedly worse on Train Ticket, which is the larger, cyclic,
lower-coverage system. It is also, per pre-registration section 2.2, the
only system in RE2 capable of testing the mined-substrate claim at all,
because the Online Boutique graph is a constant. **The method performs
worst exactly where the claim would have to be tested.** [Strong.]

---

## 10. Monotonicity: UNVERIFIED

Part IX Mathematics v3.1c requires a monotonicity check before fault-tree
logic: "Retries, fallbacks, circuit breakers, load shedding and graceful
degradation all break monotonicity."

Retry-shaped probe, fraction of parented spans sharing a
(traceID, parentSpanID, operationName) key:

```
+---------+--------+--------+--------+
| SYSTEM  |  MIN   | MEDIAN |  MAX   |
+---------+--------+--------+--------+
| RE2-OB  | 28.5%  | 30.0%  | 31.2%  |
| RE2-TT  | 23.1%  | 29.8%  | 40.6%  |
+---------+--------+--------+--------+
```

Roughly 30 percent of parented spans carry a retry-shaped signature.
[Strong.]

**VERDICT: the monotonicity precondition is UNVERIFIED and is not
upgraded.** Circuit breakers, fallbacks and graceful degradation leave no
record in these traces: a span never emitted because a breaker was open
cannot be counted. This experiment therefore cannot establish that the
monotone assumption holds, and the propagation model embeds it. Per the
framework's rule that a recorded refusal beats a number nobody should
trust, this is recorded as a refusal. [Strong.]

The probe finding and the verdict are reported together deliberately: a
30 percent retry rate is a reason to doubt monotonicity, not a
measurement of it.

---

## 11. What this result licences, and what it does not

### 11.1 Licensed

- On RE2-OB and RE2-TT, graph propagation with common-cause conditioning,
  scored by a non-circular graph-consistency statistic, **localises
  annotated root causes less accurately than ranking services by worst
  observed latency degradation**. 56.1 percent against 78.9 percent
  top-1, McNemar b=12 c=53, two-sided p = 0.00000028. [Strong.]
- The result is stable across the preregistered nine-cell parameter grid,
  spread 3.9 points, and is not a parameter artefact. [Strong.]
- On this benchmark a trivial rule-based control beats every RCAEval
  baseline tested. [Strong.]
- On the 38 hard cases, post hoc, the method scores below both baselines
  that ran cleanly (31.6 percent against nsigma 55.3 and BARO 50.0), and
  above the random floor by a narrow margin. See section 5.3. [Strong,
  as a measurement; the stratification is post hoc.]

### 11.2 NOT licensed

- **Nothing about canonical H4.** Canonical H4 concerns monetary totals
  and its kill condition cannot be evaluated on RCAEval. This null does
  not kill canonical H4 and a positive would not have supported it.
  [Strong.]
- **Nothing about novelty**, in either direction. The risk axis is
  OCCUPIED by a granted family with March 2018 priority. [Strong.]
- **Nothing about the economic thesis.** No monetary quantity was
  computed at any point. [Strong.]
- **Nothing conclusive about propagation modelling in general.** This
  tests one specification of one model on one benchmark that the
  framework's own Part IX warned was likely too easy. A better
  propagation method may exist. This experiment did not find one and did
  not look for one. [Asserted.]

### 11.3 The honest reading

**[Asserted, and it is a judgement rather than a measurement.]** The most
defensible thing this experiment produced is not the null on the ranking
extension. It is the measurement that a one-line rule scores 78.9 percent
on a benchmark used to evaluate published RCA methods, and beats all of
them. That is a finding about RE2, and it reproduces Fang et al. and
vindicates the warning already written into Part IX section 9.11 before
this experiment began.

The pre-registration predicted this outcome in section 12.5, before any
code existed, on arithmetic alone. The study was underpowered by a factor
of roughly three and a half against published state of the art on hard
cases. It returned the predicted null. The design was not adjusted at any
point to change that.

---

## 12. Deviations encountered during the run

Recorded in full in PREREGISTRATION.md section 16. Summary:

```
+-------+-----------------------------------------------------------+
| D-01  | Correction IDs renumbered (R13-R16 -> R17-R20, T-M/T-N -> |
|       | T-T/T-U) after the first assignment was made against a    |
|       | stale canonical set. Documentation only.                  |
+-------+-----------------------------------------------------------+
| D-02  | Canonical citations refreshed to revision "c". H4 wording  |
|       | verified unchanged; E3 verified OCCUPIED.                 |
+-------+-----------------------------------------------------------+
| D-03  | The frozen runner did not implement the preregistered     |
|       | SECONDARY candidate set. Added in a separate file rather  |
|       | than by editing frozen code. Includes a correction to     |
|       | section 9.2's own reasoning about S_graph.                |
+-------+-----------------------------------------------------------+
| D-04  | RCD is not runnable against any released causal-learn.    |
|       | Reported as such rather than patched around.              |
+-------+-----------------------------------------------------------+
| D-05  | Section 5's hard-case claim WITHDRAWN as a category       |
|       | error. "Naive scores 0% on hard cases" is a tautology,    |
|       | since hard is DEFINED as where naive fails, and the       |
|       | transplant of Fang et al.'s 21% onto this subset          |
|       | compared two different populations. Baselines             |
|       | stratified POST HOC to the same 38 cases to supply the    |
|       | missing comparison. No rerun, no retune, no new           |
|       | measurement, no p-values attached. Section 5.3 carries    |
|       | the EXPLORATORY, POST HOC heading.                        |
+-------+-----------------------------------------------------------+
```

No deviation changed the hypothesis, the metric, the statistical test,
the exclusions, the candidate sets, the tie-breaking, or the power
analysis. [Strong.]

---

## 13. Correction log

Nine corrections and one standing method rule are recorded in
`docs/CORRECTION_LOG.md`, with formal IDs assigned in the framework's
convention against the v2.1c canonical set:

```
+--------+----------------------------------------------------------+
| R17    | Prior run: root cause presented as discovered when it    |
|        | was a label lookup                                       |
| R18    | Prior run: headline number taken from a source nobody    |
|        | opened. The x4.08 figure came from tracets_lat.csv,      |
|        | whose semantics are undocumented and unreproducible.     |
|        | Recomputed on canonical latency-90, that case shows      |
|        | NOTHING degraded (all services x0.95 to x1.06).          |
| R19    | Prior run: comparative claim true only under an          |
|        | undisclosed restriction to the 7 traced services         |
| R20    | Prior run: showcase case unrepresentative, one of the    |
|        | five weakest of ninety and one of 18 hard cases          |
| T-T    | Transmission probability unbounded above in A.2          |
| T-U    | Ranking statistic contains the control it is compared    |
|        | against                                                  |
| M-01   | STANDING RULE. A file retrieved through a representation |
|        | layer is not the file. Byte-exact or it does not count.  |
+--------+----------------------------------------------------------+
```

R18, the patent citation error corrected at v1.1c, and M-01 share one
shape: a source taken at one level of detail and carried forward as
established.

---

## 14. Reproduction

```
Pre-registration      b0db614791c597dd7b0e91358bf7079762d4ddeb
Analysis code         7cc789688b8ae8296b144d9daaded23e4d35a67e
Canonical set         61cec7f57a256cf99ca89d349ae59cb4a685d7c7
Secondary runner      3ea7a32e9d4486478a4661e062941a952c4f50b3

Master seed           20260820
Per-case seeds        SHA256(case_id | cell_id) truncated to 32 bits,
                      recorded per row in the results files

Data                  Zenodo record 14590730, RE2-OB.zip and RE2-TT.zip
Environment           Python 3.12.3, RCAEval 1.6.0, numpy 1.26.4,
                      pandas 3.0.5, networkx 3.6.1, causal-learn 0.1.4.8

Outputs               results/full_default.csv   180 rows, primary
                      results/grid.csv         1,620 rows, nine cells
                      results/secondary.csv      180 rows, upper bound
                      results/baselines.csv      180 rows, six baselines
                      results/grid_summary.csv     9 rows
```

The primary analysis uses deterministic worst-rank tie-breaking, so no
seed affects the ranking rule. Seeds affect only the Monte Carlo
propagation estimates, whose sensitivity is quantified in section 8.
