# OUTLINE

**Working title:** A trivial baseline outperforms published RCA methods on
RCAEval RE2

**Status:** outline only. No prose drafted. Every number below is already
measured; nothing new is to be run to write this paper.

**Scope note, binding.** This paper is standalone. It makes no reference to
any framework, thesis or measurement practice, in the framing, the
motivation, the discussion or the acknowledgements. Its contribution is a
benchmark measurement and a set of reproducibility findings, and attaching
it to anything else would dilute both.

---

## 0. Provenance of every number

All figures come from one preregistered run over RCAEval RE2, plus one post
hoc stratification of data collected in that same run. No measurement in
this outline was produced for the paper.

```
+----------------------------------+------------------------------------+
| SOURCE                           | WHAT IT SUPPLIES                   |
+----------------------------------+------------------------------------+
| results/baselines.csv, 180 rows  | All baseline and control scores    |
| results/full_default.csv, 180    | Case metadata, graph shape,        |
|                                  | hard/easy classification           |
| results/hard_subset.csv, 38 rows | Hard-subset stratification (post   |
|                                  | hoc, section 5.3 of the source     |
|                                  | results document)                  |
+----------------------------------+------------------------------------+
```

---

## 1. Abstract

One paragraph, in this order:

1. RCAEval is a public benchmark for root cause analysis in microservice
   systems, shipping 15 reproducible baselines.
2. We evaluate a one-line control on its RE2 suite: rank services by the
   ratio of mean post-injection to mean pre-injection `latency-90`.
3. The control reaches 78.9 percent top-1 and 91.7 percent top-3 over 180
   cases and outperforms every RCAEval baseline we were able to run.
4. On the 38 cases where the control fails, nsigma reaches 55.3 percent
   and BARO 50.0 percent top-1. The benchmark is therefore not uniformly
   easy: it is easy in a specific, characterisable way, and the residue
   is where the published methods do their work.
5. Of five baselines attempted, one produced no output on any case, one
   scored below a random floor at default settings, and one emits at most
   three ranked services.
6. We document three structural properties of RE2 that constrain what it
   can evaluate, including one suite that ships no traces at all.
7. We frame this as corroboration of Fang et al. rather than as a novel
   critique, and we state plainly that the control is not novel.

---

## 2. Introduction

- RCA benchmarks are the standard evidence for method papers in this area.
- Fang et al. (arXiv 2510.04711, FSE 2026) argue existing public benchmarks
  are oversimplified and that rule-based methods rival state of the art.
  **This paper corroborates that claim on a specific benchmark with a
  specific control, and is downstream of it.**
- Contribution, stated narrowly:
  1. A systematic like-for-like comparison of one trivial control against
     five shipped baselines on 180 cases.
  2. Three reproducibility findings against released packages.
  3. Two structural observations about RE2 that bear on what the benchmark
     can discriminate.
- Non-contribution, stated in the introduction rather than buried: the
  control is not new, the observation that benchmarks are easy is not new,
  and no new method is proposed.

---

## 3. Setup

### 3.1 Dataset

- RCAEval RE2, Zenodo record 14590730.
- Six fault types (cpu, delay, disk, loss, mem, socket), five injected
  services per system, three repetitions, 90 cases per system.
- **n = 180, not 270.** RE2-SS (Sock Shop) excluded: 90 case directories,
  zero `traces.csv` and zero `tracets_*.csv`. Verified by file count.
- One directory excluded as a duplicate rather than a case:
  `RE2-OB/checkoutservice_cpu/multi-source-data`, byte-identical to
  `checkoutservice_cpu/1`, md5 956052e9c07123b4517e37a0b536d9cf.

```
+---------+-----+-------+------+------+-----+--------+-------+
| SYSTEM  | cpu | delay | disk | loss | mem | socket | TOTAL |
+---------+-----+-------+------+------+-----+--------+-------+
| RE2-OB  |  15 |    15 |   15 |   15 |  15 |     15 |    90 |
| RE2-TT  |  15 |    15 |   15 |   15 |  15 |     15 |    90 |
+---------+-----+-------+------+------+-----+--------+-------+
```

### 3.2 The control

```
score(s) = mean( s_latency-90 | t >= inject )
         / mean( s_latency-90 | t <  inject )
rank descending; ties take the worst rank in the block
```

- `latency-90` is chosen because RCAEval's own `read_data` drops
  `latency-50` and renames `latency-90` to `latency`, making it the
  harness's canonical per-service latency.
- Injection time from `inject_time.txt`, Unix seconds.
- Tie-breaking is worst-rank, which cannot flatter the control.

### 3.3 Baselines and evaluation protocol

- BARO, nsigma, epsilon-Diagnosis, CIRCA, RCD, all from RCAEval 1.6.0.
- A uniform-random permutation floor, seeded per case.
- One further entry, listed neutrally throughout as **"MC graph
  propagation"**: a Monte Carlo graph-propagation ranking method that
  mines a service graph from trace parent/child span pairs, propagates a
  seeded disruption with a per-edge conditional probability under a
  shared environmental factor, and ranks candidates by rank correlation
  between predicted and observed degradation. It is included as one more
  comparison point. **No provenance, motivation or claim is attached to
  it, and the paper makes no argument that depends on it.**
- Metric-to-service mapping by longest matching service prefix, so
  `ts-order-other-service` is not absorbed by `ts-order-service`. This is
  RCAEval's own `accuracy_service` convention.
- Top-1 and top-3 at service granularity. Wilson 95 percent intervals on
  every rate. No point estimate without its interval.

---

## 4. Result 1: the control outperforms every baseline

**Claim strength: strongest claim in the paper. Direct measurement,
n = 180, complete data, no exclusions beyond section 3.1.**

```
+--------------------+-----------+---------+------------------+-----------+
| METHOD             |  TOP-1    |   RATE  | WILSON 95% CI    | RAN ON    |
+--------------------+-----------+---------+------------------+-----------+
| CONTROL            | 142/180   |  78.9%  | [72.4%, 84.2%]   | 180/180   |
| nsigma             | 130/180   |  72.2%  | [65.3%, 78.2%]   | 180/180   |
| BARO               | 127/180   |  70.6%  | [63.5%, 76.7%]   | 180/180   |
| MC graph propag.   | 101/180   |  56.1%  | [48.8%, 63.2%]   | 180/180   |
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
| CONTROL            | 165/180   |  91.7%  | [86.7%, 94.9%]   |
| BARO               | 163/180   |  90.6%  | [85.4%, 94.0%]   |
| nsigma             | 162/180   |  90.0%  | [84.7%, 93.6%]   |
| MC graph propag.   | 124/180   |  68.9%  | [61.8%, 75.2%]   |
| Random floor       |  30/180   |  16.7%  | [11.9%, 22.8%]   |
| CIRCA              |  30/180   |  16.7%  | [11.9%, 22.8%]   |
| epsilon-Diagnosis  |  27/180   |  15.0%  | [10.5%, 20.9%]   |
| RCD                |   0/180   |   0.0%  | [0.0%, 2.1%]     |
+--------------------+-----------+---------+------------------+
```

Honesty requirement for this section: at top-3 the control's interval
overlaps BARO's and nsigma's substantially. The top-3 result should be
reported as "the control is not distinguishable from the two working
baselines at top-3", not as a win.

### 4.1 The benchmark is easy in a characterisable way, not uniformly easy

**This is the paper's second-strongest claim and the one that keeps it
from being a cheap shot.** Label EXPLORATORY, POST HOC. No p-values.

Define hard as the 38 of 180 cases where some service other than the
annotated root cause degrades more, that is, exactly the cases the control
gets wrong. The control scores 0 of 38 here **by definition, as a
tautology and not a finding**, since hard is defined as where it fails.

```
+--------------------+-----------+---------+------------------+
| TOP-1 ON THE 38 CASES THE CONTROL MISSES                    |
+--------------------+-----------+---------+------------------+
| nsigma             |   21/38   |  55.3%  | [39.7%, 69.9%]   |
| BARO               |   19/38   |  50.0%  | [34.8%, 65.2%]   |
| MC graph propag.   |   12/38   |  31.6%  | [19.1%, 47.5%]   |
| CIRCA              |    2/38   |   5.3%  | [1.5%, 17.3%]    |
| Random floor       |    2/38   |   5.3%  | [1.5%, 17.3%]    |
| epsilon-Diagnosis  |    0/38   |   0.0%  | [0.0%, 9.2%]     |
| RCD                |    0/38   |   0.0%  | [0.0%, 9.2%]     |
| CONTROL            |    0/38   |   0.0%  | tautological     |
+--------------------+-----------+---------+------------------+
```

```
+--------------------+-----------+---------+------------------+
| TOP-3 ON THE SAME 38 CASES                                  |
+--------------------+-----------+---------+------------------+
| BARO               |   31/38   |  81.6%  | [66.6%, 90.8%]   |
| nsigma             |   30/38   |  78.9%  | [63.7%, 88.9%]   |
| MC graph propag.   |   17/38   |  44.7%  | [30.1%, 60.3%]   |
| CIRCA              |   11/38   |  28.9%  | [17.0%, 44.8%]   |
| Random floor       |   10/38   |  26.3%  | [15.0%, 42.0%]   |
| epsilon-Diagnosis  |    6/38   |  15.8%  | [7.4%, 30.4%]    |
+--------------------+-----------+---------+------------------+
```

Composition of the 38: 20 Train Ticket, 18 Online Boutique; by fault type
9 loss, 8 disk, 6 cpu, 6 delay, 5 mem, 4 socket.

**The framing, and it must not slip.** This STRENGTHENS the critique; it
does not rehabilitate the benchmark. The argument to make:

1. RE2 decomposes into a large majority (142 of 180, 78.9 percent) that a
   one-line rule solves, and a minority (38) that it cannot touch.
2. The published methods do real work on that minority: nsigma and BARO
   recover roughly half of it.
3. **So the aggregate leaderboard number is dominated by the easy
   majority, and it is not measuring what the methods are for.** A method
   that is genuinely better on the hard residue can still lose on the
   aggregate to a rule that has no model of anything.
4. The problem is therefore not that the methods are bad. It is that
   **the benchmark's aggregate metric cannot distinguish a method that
   works from a rule that exploits how the cases were constructed.**
5. The recommendation follows directly and should be stated as the
   paper's constructive contribution: **report the hard-subset score
   alongside the aggregate, and publish the control's score as a floor
   any method must clear.**

Do NOT write this as "the baselines are fine after all". They are fine on
the residue and are beaten in aggregate by a rule with no model. Both
halves are the finding.

## 5. Result 2: three reproducibility findings

Framed throughout as findings about **released packages**, never as claims
that the published methods are wrong. See section 7.

### 5.1 RCD does not run against any released causal-learn

- RCAEval 1.6.0 `e2e/rcd.py` calls
  `SkeletonDiscovery.local_skeleton_discovery` on its default path
  (`localized=True`) and passes `labels=` to
  `SkeletonDiscovery.skeleton_discovery` on the alternative path.
- Neither exists in causal-learn 0.1.3.3, 0.1.3.6, 0.1.3.8 or 0.1.4.8.
- Both are present only in the RCD authors' fork. RCAEval requires
  `causal-learn>=0.1.3.3` with no upper bound.
- Outcome over 180 cases: 130 AttributeError, 50 downstream
  `KBinsDiscretizer` NaN error. **Zero ranked output on zero cases.**
- We did not patch RCAEval internals to obtain a number.

### 5.2 CIRCA's DEFAULT configuration scores below a random floor; a documented flag fixes it

**REVISED after a preregistered good-faith check. See
`paper/CORRECTIONS.md` C-1.** The original claim, that CIRCA scores below
random, is withdrawn as written.

```
+--------------------+-----------+---------+------------------+
| CONFIGURATION      |  TOP-1    |   RATE  | WILSON 95% CI    |
+--------------------+-----------+---------+------------------+
| CIRCA default      |   6/180   |   3.3%  | [1.5%, 7.1%]     |
| Random floor       |  11/180   |   6.1%  | [3.4%, 10.6%]    |
| CIRCA dk_select    |  76/180   |  42.2%  | [35.2%, 49.5%]   |
+--------------------+-----------+---------+------------------+
```

- `dk_select_useful=True` is a documented RCAEval flag that is **off by
  default**. Turning it on raises CIRCA twelve-fold and clears the random
  floor with non-overlapping intervals.
- The configuration was preregistered before the run
  (`paper/CIRCA_TUNING_PREREG.md`). One configuration, no sweep, no
  selection by ground-truth score.
- **The claim to make is about packaging, not correctness**: the default
  configuration is not the working one. It is NOT evidence that the method
  is wrong.
- CIRCA at 42.2 percent remains below the control (78.9), nsigma (72.2)
  and BARO (70.6), so claim 2 survives with the tuned figure in the table.
- Two things checked in source and found NOT to be the explanation: the
  hardcoded `dataset="ob"` in `circa.py` is inert because `pc_default`
  never reads it; and `select_useful_cols` matches the substring `lat50`
  while the canonical columns are `latency-50`/`latency-90`, so it discards
  every latency column (median 9 columns retained, maximum 339) and the
  score improves anyway.

### 5.3 epsilon-Diagnosis emits at most three services

- Ranked-service count: median 3, maximum 3, zero in 7 of 180 cases.
- The true root cause appears anywhere in its output in only 27 of 180.
- Its top-1 rate therefore measures coverage as much as accuracy, and
  should not be read as a like-for-like accuracy comparison.

---

## 6. Result 3: three structural properties of RE2

### 6.1 RE2-OB mines an identical graph in all 90 cases

- Graph mined from trace parent/child span pairs: 7 nodes, 9 edges,
  acyclic, in 90 of 90 cases. Shared components (in-degree > 1) are exactly
  {currencyservice, productcatalogservice} in every case.
- Consequence: on half the benchmark, any method that derives structure
  from traces is evaluated against a constant. Structure cannot discriminate
  between cases when it does not vary across them.
- RE2-TT does vary: 26 nodes and 55 edges in 78 cases, 18 and 20 in 11,
  19 and 21 in 1. It is also cyclic in 78 of 90.

### 6.2 ts-auth-service is traced but ungraphable

- Present in `traces.csv` in 90 of 90 RE2-TT cases, roughly 10,000 spans
  per case.
- Every span is either a trace root (null `parentSpanID`) or parented by
  another ts-auth-service span. It has **no cross-service edge**.
- Consequently it is absent from the mined graph in 90 of 90 cases, while
  being the annotated root cause in 18 of them.
- Any method that ranks only graph nodes scores zero on those 18 by
  construction. **A trace-mined method cannot reach 20 percent of
  RE2-TT root causes**, whatever its ranking quality. Metric-based
  methods are unaffected.

### 6.3 RE2-SS ships no traces at all

- 90 case directories, **zero `traces.csv` and zero `tracets_*.csv`**.
  Verified by file count, not inferred from documentation.
- One third of the RE2 suite is therefore unavailable to any trace-based
  method.
- **Frame this as a caution about a citation convention, NOT as an
  accusation about any paper.** A search for published work evaluating a
  trace-based method on RE2 while citing the full suite count did not find
  a specific instance, so no such claim is made. What can be said is
  precise and checkable: **the suite-level count of 270 is not a valid
  denominator for trace-based evaluation on RE2, and work reporting it
  should state the qualification.**
- One verifiable observation about the benchmark's own description, stated
  neutrally and without inferring intent. The RCAEval paper (arXiv
  2412.17015) writes: "RE2 provides multi-source telemetry data, including
  metrics, logs, and traces... Each system generates a substantial volume
  of logs (8.6 to 26.9 million lines), and traces (39.6 to 76.7 million
  traces)", alongside "270 failure cases (90 cases per system)". It does
  not break trace counts down by system. The released `RE2-SS.zip` contains
  no trace files. Whether Sock Shop was intended to be excluded from the
  trace description cannot be determined from the paper, and the paper
  should be given the benefit of that ambiguity. The practical point for
  users stands either way: check the artifact, not the summary.
- RE2-SS remains fully valid for metric-only methods.

### 6.4 A data trap worth documenting

`traces.csv` has a column named `time` holding an `HH:MM` string, not a
Unix timestamp. Comparing it against `inject_time` silently yields nothing
rather than erroring. `startTimeMillis` is the usable field. Worth a short
paragraph because it is the kind of defect that produces quiet wrong
answers.

---

## 7. Threats to validity

**Leads the section, not buried at the end:**

1. **This corroborates Fang et al. rather than contradicting them.** They
   established that public RCA benchmarks are simple enough for rule-based
   methods to rival state of the art. This paper supplies one more
   benchmark, one specific control, and a like-for-like table. Framing it
   as a novel critique would misrepresent the literature.
2. **The control is not novel.** Ranking by symptom severity is the
   obvious baseline and is folklore in the area. RCAEval's own `nsigma` is
   a close relative. The contribution is the systematic comparison and the
   reproducibility findings, not the rule.
3. **Single benchmark, two systems, 180 cases.** No claim is made about RE1,
   RE3, other benchmarks, or production systems.
4. **Default settings only.** Every baseline ran at RCAEval defaults. Tuned
   configurations may score materially higher, particularly CIRCA. This
   cuts against the paper's own findings and must be stated as such.
5. **Environment specificity.** The RCD finding is a claim about released
   causal-learn versions at a point in time, and would be void if a
   compatible release appeared. Version numbers and dates are stated so the
   claim is falsifiable.
6. **Metric-to-service mapping is a choice.** Longest-prefix matching is
   documented; a different mapping could shift baseline scores.
7. **The hard-subset analysis is post hoc** and is labelled as such
   wherever it appears.
8. **The Monte Carlo graph-propagation entry carries roughly plus or
   minus 3 percentage points of top-1 seed jitter**, measured by running
   one parameter cell under two independent seeds (101 and 96 of 180).
   This limitation attaches to THAT row only. The control and the
   RCAEval baselines are deterministic given the data and carry no such
   jitter, so the headline comparison in section 4 is unaffected. Stated
   because a stochastic entry reported without its variability would be
   the same defect this paper documents elsewhere.

---

## 8. Right of reply

Required, as its own section rather than a footnote:

- The failures reported in section 5 are **reproducibility failures against
  released packages**, observed in one environment at one point in time.
  **They are not claims that the published methods are incorrect, nor that
  their published results were not obtained.**
- A method that cannot be run from its released package may still be
  correct as published. The two questions are separate and the paper must
  not conflate them.
- The authors of RCD, CIRCA and epsilon-Diagnosis should be contacted
  before submission and offered right of reply, and any correction or
  configuration they supply should be run and reported, including if it
  overturns a finding here.
- Commit to publishing corrections rather than silently editing.

---

## 9. Reproduction

```
Analysis code           7cc789688b8ae8296b144d9daaded23e4d35a67e
Pre-registration        b0db614791c597dd7b0e91358bf7079762d4ddeb
Secondary runner        3ea7a32e9d4486478a4661e062941a952c4f50b3
Canonical doc snapshot  61cec7f57a256cf99ca89d349ae59cb4a685d7c7

Master seed             20260820
Per-case seeds          SHA256(case_id | cell_id) truncated to 32 bits,
                        recorded per row in the released CSVs

Data                    Zenodo record 14590730 (RE2-OB.zip, RE2-TT.zip)
Environment             Python 3.12.3, RCAEval 1.6.0, numpy 1.26.4,
                        pandas 3.0.5, networkx 3.6.1,
                        causal-learn 0.1.4.8, sfr-pyrca 1.0.1
Note                    RCAEval 1.6.0 hard-imports rcd and torai on
                        Python 3.11; 3.10, 3.12 and 3.14 degrade
                        gracefully. 3.12 used throughout.

Released artefacts      baselines.csv (180), full_default.csv (180),
                        hard_subset.csv (38), circa_tuned.csv (180),
                        fang_control.csv

CAUSAL-LEARN CLAIM LAST VERIFIED   2026-08-21
  Section 5.1 is a claim about released package versions and has a shelf
  life. On 2026-08-21 the latest causal-learn on PyPI was 0.1.4.8
  (uploaded 2026-07-11); no release exists after 2026-08-20. Eleven
  versions were checked by extracting each distribution and reading
  PCUtils/SkeletonDiscovery.py directly: 0.1.3.3, 0.1.3.6, 0.1.3.8,
  0.1.3.9, 0.1.4.0, 0.1.4.2, 0.1.4.4, 0.1.4.5, 0.1.4.6, 0.1.4.7, 0.1.4.8.
  None defines local_skeleton_discovery and none accepts a labels
  argument on skeleton_discovery.

  **REQUIRED BEFORE SUBMISSION: repeat this check and update the date.**
  If a compatible release has appeared, section 5.1 must be rerun and
  rewritten, not merely re-dated.
```

---

## 10. Venue and length

- Target: a short empirical or reproducibility track. The finding is narrow
  and does not need a full-length paper.
- Estimated 6 to 8 pages: setup 1, result 1 at 1.5, reproducibility 1.5,
  structural 1, threats and right of reply 1, reproduction 0.5.
- Every claim carries an evidence grade in the draft, stripped or retained
  at submission depending on venue convention.

---

## 11. Open items before drafting

```
+---+-----------------------------------------------------------------+
| 1 | Contact the three author groups. Right of reply precedes         |
|   | submission, not follows it.                                      |
+---+-----------------------------------------------------------------+
| 2 | CLOSED 2026-08-21. Tuned CIRCA run. Finding 5.2 withdrawn and   |
|   | replaced; see paper/CORRECTIONS.md C-1.                          |
+---+-----------------------------------------------------------------+
| 3 | Confirm whether Fang et al.'s dataset is released. If so, the    |
|   | control should be run on it, which would strengthen the paper    |
|   | considerably or kill it. Also a new measurement.                 |
+---+-----------------------------------------------------------------+
| 4 | CLOSED 2026-08-21, and STANDING. No causal-learn release after   |
|   | 2026-08-20; 11 versions checked. Must be repeated immediately    |
|   | before submission, per section 9.                                |
+---+-----------------------------------------------------------------+
| 5 | Decide licence and data deposit for the released CSVs.           |
+---+-----------------------------------------------------------------+
```
