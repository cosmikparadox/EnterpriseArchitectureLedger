# Pre-registration: Experiment 1, H4 on RCAEval RE2

Author: Abhineet Asthana. Prepared and executed by Claude Code.
Date of freeze: 2026-08-20.
Framework: The Architecture Ledger, DOI 10.5281/zenodo.21863761.
Canonical references: Canonical Thesis v2.1, Part IX Mathematics v3.1c,
Research Paper v1.1c.

This document is written BEFORE any scoring run. Nothing below may be
changed after the freeze commit. Any change goes in section 14,
DEVIATIONS, with a date and a reason.

Evidence grading follows the framework convention.
Strong means primary documentation or direct measurement against primary
data. Indicative means the evidence points this way but is not conclusive.
Asserted means judgement, not established.

---

## 1. What is being tested, and what is not

### 1.1 The hypothesis as canonically stated

Canonical Thesis v2.1, section on hypotheses, states H4 as:

```
H4   Propagated loss differs from      Kill: Propagated and naive
     node-local sum                          totals agree
```

### 1.2 The hypothesis as stated in the experiment brief

```
H4: Loss propagated across a mined dependency graph differs materially
from the node-local sum, AND graph-based ranking locates root causes
that node-local symptom severity misses.
```

### 1.3 These are not the same hypothesis, and this matters

**[Strong.]** The canonical H4 and its kill condition are about
propagated loss TOTALS against a node-local SUM. That is a comparison of
monetary magnitudes. The brief adds a second clause about root cause
RANKING which does not appear in the canonical statement.

The brief also states, correctly, that RCAEval contains no revenue, loss
or switching cost data, so any monetary quantity would have to be
assumed, and an assumed quantity cannot be falsified.

The consequence is unavoidable and is recorded here rather than
discovered later:

```
+---------------------------------+--------------------------------+
| CANONICAL H4 CLAUSE             | TESTABLE ON RCAEval RE2?       |
+---------------------------------+--------------------------------+
| Propagated loss differs from    | NO. No loss data exists.       |
| node-local sum (the kill        | The kill condition cannot be   |
| condition as written)           | evaluated at all.              |
+---------------------------------+--------------------------------+
| Graph-based ranking locates     | YES. This is what is tested.   |
| root causes that node-local     | It is an extension made in the |
| symptom severity misses         | brief, not canonical H4.       |
+---------------------------------+--------------------------------+
```

**This experiment cannot return the canonical H4 kill.** It tests the
ranking clause only. A positive result must be reported as support for
the ranking clause and must not be reported as confirming H4 as
canonically stated. A null likewise kills only the ranking clause.

### 1.4 Explicitly out of scope

No monetary quantity is computed, reported or implied. The economic
thesis is not under test. If a later reading of these results claims
otherwise, this section is the record that it was ruled out in advance.

---

## 2. Scope honesty, stated verbatim as required

### 2.1 Novelty is not at stake and cannot be established here

H4 sits on the RISK AXIS. Part IX Mathematics v3.1c section 9.3.9,
"Prior art on the risk axis", records the following, read at claim level
from primary sources:

```
"Correlated risk in cybersecurity", one continuation
chain, five grants, priority 12 March 2018:

  15/918,286  ->  US 10,257,219   9 Apr 2019
  16/292,956  ->  US 10,594,723  17 Mar 2020
  16/795,056  ->  US 10,931,705  23 Feb 2021
  17/179,630  ->  US 11,770,401
  18/365,384  ->  US 12,273,367
```

Part IX v3.1c states of that section: "sections 9.3.1 to 9.3.8 are, taken
together, a construction that somebody else already owns". It further
records that the specific propagation construction used in this
experiment, namely "a per-edge conditional probability that a receiving
node is affected given that a providing node has failed, Monte Carlo
propagation over the graph, and termination when statistical variance
falls below a threshold, is recited in the granted claims"
**[Strong, from claim text read directly.]**

Research Paper v1.1c re-grades element E3 from PARTIALLY OCCUPIED to
**OCCUPIED** on the same evidence.

**Therefore: a positive result in this experiment demonstrates
computability and comparative performance. IT DOES NOT ESTABLISH NOVELTY
AND MUST NOT BE PRESENTED AS DOING SO.** **[Strong.]**

### 2.2 Online Boutique cannot test the mined-substrate claim

**[Strong, measured.]** All 90 RE2-OB cases mine to an identical graph:
7 nodes, 9 edges, acyclic, shared components exactly
{currencyservice, productcatalogservice}. Node count, edge count and
shared-component set are constant across every case, every fault type and
every repetition.

For Online Boutique the mined graph is a CONSTANT. Mining it per case and
hand-drawing it once produce the same object. OB therefore cannot
distinguish a mined substrate from a drawn one, and cannot test the
framework's mined-substrate claim.

Train Ticket is the only system in RE2 that can, because its mined graph
varies across cases (three distinct shapes observed: 26 nodes and 55
edges in 78 cases, 18 nodes and 20 edges in 11 cases, 19 nodes and 21
edges in 1 case).

Train Ticket is also the most compromised system in the benchmark: 78 of
90 of its graphs are cyclic, and in 18 of 90 cases the annotated root
cause is absent from the mined graph entirely. **The only system capable
of testing the claim is the one least able to support the method.** This
is stated here in the limitations, not in a footnote.

### 2.3 The framework's own warning applies against this experiment

Part IX Mathematics v3.1c, section 9.11, states verbatim:

> "Ground truth must come from data the model did not generate. Public
> fault-injection benchmarks with labelled propagation exist. One warning
> from that literature: several widely used benchmarks are simple enough
> that trivial rule-based methods match state-of-the-art results, so
> choose a hard one."

**[Strong.]** Measured on RE2, the naive rank-by-worst-symptom control
achieves 78.9 percent top-1 and 91.7 percent top-3. A trivial rule-based
method is at 78.9 percent. That warning has arrived, and it has arrived
against this experiment, on the benchmark this experiment selected.

RE2 is not a hard benchmark by the framework's own standard. Fang et al.
(arXiv 2510.04711, FSE 2026) report state-of-the-art top-1 falling to
0.21 on a benchmark built to be hard. That paper's data was checked for
release and is cited as the harder alternative not used here.

This experiment proceeds on RE2 anyway, because RE2 is what is available
and reproducible. The choice is recorded as a known weakness, not
defended.

---

## 3. Data, and what is excluded

### 3.1 Included

```
+-----------+--------+-------------------------------------------+
| DATASET   | CASES  | BASIS                                     |
+-----------+--------+-------------------------------------------+
| RE2-OB    |     90 | Online Boutique, traced                   |
| RE2-TT    |     90 | Train Ticket, traced                      |
+-----------+--------+-------------------------------------------+
| TOTAL     |    180 |                                           |
+-----------+--------+-------------------------------------------+
```

Source: Zenodo record 14590730, files RE2-OB.zip and RE2-TT.zip,
downloaded 2026-08-20.

### 3.2 Excluded, with reasons fixed now

```
+---------------------------+-------+-----------------------------------+
| EXCLUSION                 | CASES | REASON                            |
+---------------------------+-------+-----------------------------------+
| RE2-SS (Sock Shop)        |    90 | ZERO trace files. Verified by     |
|                           |       | file count: 90 case directories,  |
|                           |       | 0 traces.csv, 0 tracets_*.csv.    |
|                           |       | A trace-mined method cannot run   |
|                           |       | on it. This is a stated           |
|                           |       | limitation, not a silent          |
|                           |       | omission.                         |
+---------------------------+-------+-----------------------------------+
| RE2-OB/checkoutservice_   |     1 | Not a case. Byte-identical        |
| cpu/multi-source-data     |       | duplicate of checkoutservice_     |
|                           |       | cpu/1 (md5 956052e9c07123b4517e   |
|                           |       | 37a0b536d9cf). Including it       |
|                           |       | counts checkoutservice_cpu four   |
|                           |       | times.                            |
+---------------------------+-------+-----------------------------------+
```

**n = 180, not 270.** **[Strong.]**

No other exclusion is permitted after this freeze. In particular, no case
may be dropped after seeing its result. If a case fails to process, it is
recorded as a failure and scored as a miss, and the failure is reported.

### 3.3 The observed degradation signal, fixed now

```
observed(s) = mean( {service}_latency-90 | time >= inject_time )
              / mean( {service}_latency-90 | time <  inject_time )
```

Source file: `simple_metrics.csv`. Column suffix `_latency-90`.

Justification **[Strong]**: RCAEval's own `read_data` drops `latency-50`
and renames `latency-90` to `latency`, making it the canonical
per-service latency in the harness that ships the benchmark.

`tracets_lat.csv` is NOT used. Its semantics are undocumented and could
not be reproduced from `traces.csv` by any tested formula. See correction
R14 in CORRECTION_LOG.md.

Service name mapping, fixed now: the Online Boutique frontend is
`frontendservice` in traces and `frontend` in metrics. These are the same
service and are mapped. No other name differences were found.

`inject_time` is read from `inject_time.txt`, Unix seconds.

---

## 4. Graph mining, per Appendix A.1

Applied exactly as specified, with no additions:

```
span2svc  = map spanID -> serviceName
parentSvc = parentSpanID mapped through span2svc
edges     = group by (parentSvc, serviceName) where parentSvc != serviceName
            count spans as edge weight
direction : caller -> callee
```

Self-loops dropped. Edge weight is call volume. Recorded per case: node
count, edge count, acyclicity, and the set of nodes with in-degree
greater than one.

Implementation note fixed now **[Strong]**: `traces.csv` has a column
named `time` which is a STRING of the form "10:07", not a Unix timestamp.
It is not used. Span timing, where needed, comes from `startTimeMillis`.

---

## 5. Cycles: SCC condensation

**[Strong, measured.]** 78 of 90 RE2-TT cases mine to a cyclic graph.
Appendix A.2 requires evaluation "in reverse topological order", which is
undefined without acyclicity.

Resolution, fixed now: **Tarjan strongly-connected-component
condensation** (`networkx.condensation`). The condensation of any
directed graph is a DAG, so reverse topological order is well defined on
it. Propagation is simulated over components. Every node in a component
shares that component's affected state within a simulation draw.

Applied uniformly to all systems. For an acyclic graph the condensation
is the identity, so RE2-OB is unaffected.

Part IX v3.1c section 9.3.6 records that cycles are a known hard case and
that loopy belief propagation convergence is not guaranteed. Condensation
is chosen because it is exact rather than approximate, at the cost of
resolution inside a component.

### 5.1 MANDATORY separate reporting of component and node hits

A component containing k services cannot be resolved internally. Reporting
a component-level hit as though it were a node-level hit would credit the
method with precision it does not have.

```
COMPONENT-LEVEL HIT   the component containing the annotated root
                      cause is ranked in the top k

NODE-LEVEL HIT        the annotated root cause SERVICE is ranked in
                      the top k after within-component ties are
                      broken by the rule in section 8
```

**Every table in RESULTS.md reports both, in separate columns, always.
A component-level hit is never reported as a node-level hit.** For a
singleton component the two coincide, and the count of singleton versus
multi-node components at the top rank is reported so a reader can see how
much accuracy came from coarser granularity.

---

## 6. Propagation model, per Appendix A.2

```
theta ~ Beta(a, b)                        drawn once per simulation draw
p_transmit = min(1, p_base + p_shared * theta)
affected(X) = OR over callee-components Y of
              [ affected(Y) AND U(0,1) < p_transmit ]
```

Evaluated in reverse topological order over the condensation, so each
component is drawn exactly once per simulation. Seed component is
affected with probability 1.

### 6.1 Free parameters, defaults ASSERTED

```
+-----------+----------+--------------------------------------+
| PARAMETER | DEFAULT  | GRADE                                |
+-----------+----------+--------------------------------------+
| a, b      | 2, 5     | ASSERTED, chosen by judgement        |
| p_base    | 0.55     | ASSERTED, chosen by judgement        |
| p_shared  | 0.40     | ASSERTED, chosen by judgement        |
| n_sim     | 200,000  | ASSERTED                             |
+-----------+----------+--------------------------------------+
```

These four defaults were not fitted to anything. That is a weakness and
is reported as one.

### 6.2 Clamping, a specification gap closed now

**[Strong.]** Appendix A.2 gives `p_transmit = p_base + p_shared * theta`
with no upper bound. In the required sensitivity grid, p_base = 0.75 with
Beta(5,2) has mean theta = 5/7, giving p_transmit = 1.036, which is not a
probability.

Fixed now: `p_transmit = min(1, p_base + p_shared * theta)`. This is a
correction to the brief, logged as T-M, not a silent patch.

### 6.3 Required sensitivity grid

Full experiment re-run at every cell of:

```
p_base in {0.35, 0.55, 0.75}   x   Beta in {(2,5), (1,1), (5,2)}
```

Nine cells. p_shared held at 0.40. If top-1 accuracy moves more than a
few points across the grid, that becomes the headline finding and is
reported as such rather than buried.

---

## 7. The ranking statistic and the circularity guard

### 7.1 The problem, stated precisely

Appendix A.3 scores each candidate by
`Spearman(predicted, observed)` where `predicted` assigns the seed itself
probability 1.0, its highest possible value.

**[Strong, structural.]** Because the seed's own coordinate is the
maximum of the predicted vector, the rank correlation is maximised by
candidates that are themselves badly degraded. "Rank by own degradation"
is precisely the naive control. The A.3 statistic as written therefore
CONTAINS the naive control as a dominant term, and comparing it against
the naive control would be comparing a quantity against a component of
itself. That is circular and would manufacture a small positive result
even if the graph contributed nothing.

### 7.2 The correction, fixed now

**PRIMARY statistic, the graph-consistency score.** For candidate
component c, with N the set of evaluable components:

```
S_graph(c) = Spearman( { predicted_c(x) : x in N \ {c} },
                       { observed(x)    : x in N \ {c} } )
```

**The seed's own coordinate is excluded from the correlation.**

How this decouples the two **[Strong]**: the naive control's entire
information content is the observed degradation of the candidate itself.
That coordinate is removed from S_graph. What remains measures only
whether the pattern of degradation among OTHER services matches what
propagation from c predicts. The naive control's statistic is not a
component of S_graph and cannot contribute to it. The two are then
independent sources of evidence and McNemar's paired test on them is
legitimate.

The cost is stated **[Strong]**: two candidates with identical ancestor
sets become indistinguishable once self is excluded. In the RE2-OB graph
this makes emailservice and paymentservice tie, since both are called
only by checkoutservice. This reduces achievable accuracy. It is accepted
as the price of a non-circular statistic.

**SECONDARY statistic, reported alongside, never alone.**

```
S_full(c) = Spearman over all x in N, seed coordinate included
```

S_full is the A.3 statistic as literally specified. It is reported for
completeness and is labelled in every table as CONTAINING THE NAIVE
CONTROL and therefore NOT a valid basis for the comparison against it.

### 7.3 Aggregation to components

`observed(component)` = maximum of the member services' degradation
ratios. Mean is reported as a sensitivity.

Spearman requires at least 3 points. Any case where `|N \ {c}| < 3` is
recorded and scored as a miss, not dropped.

---

## 8. Ties, fixed now

**Worst-rank (maximum) tie-breaking.** If k candidates share a score, all
k receive the worst rank in that block.

```
If the true root cause ties with 3 others at the top,
its rank is 4, not 1.
```

This is conservative by construction and cannot flatter the method. No
random tie-breaking is used in the primary analysis, so no seed affects
the primary result.

Reported as a secondary figure only: expected accuracy under uniform
random tie-breaking, which credits 1/k. Labelled as optimistic.

The same rule breaks within-component ties for node-level hits: a service
in a top-ranked component of size k receives node rank
(nodes in strictly better components) + k.

---

## 9. Candidate sets

### 9.1 PRIMARY: mined graph nodes only

Candidates are the components of the mined graph. **[Strong.]** In 18 of
90 RE2-TT cases the annotated root cause (ts-auth-service in all 18) is
absent from the mined graph, because every one of its roughly 10,000
spans per case is either a trace root or parented by another
ts-auth-service span, so it has no cross-service edge for A.1 to find.

**Those 18 cases score ZERO. This is not a scoring artefact. It is the
honest coverage cost of a mined-substrate method: what you cannot see,
you cannot blame.**

### 9.2 SECONDARY: all traced services, UPPER BOUND ONLY

Candidates are all services appearing in `traces.csv`, including
graph-isolated ones. A graph-isolated candidate has an empty ancestor set,
so its predicted vector is all zeros outside itself.

**Caption required on every table reporting this figure:**

> This figure is an UPPER BOUND. Admitting graph-isolated candidates lets
> the method fall back to naive-control behaviour exactly where the graph
> failed, importing naive performance into the graph method's score. It is
> never reported alone.

---

## 10. Baselines

```
+---------------------------+------------------------------------------+
| BASELINE                  | SOURCE                                   |
+---------------------------+------------------------------------------+
| Naive rank-by-symptom     | This work, per Appendix A.5. THE         |
|                           | CONTROL THAT DECIDES THE RESULT.         |
| BARO                      | RCAEval 1.6.0                            |
| RCD                       | RCAEval 1.6.0                            |
| CIRCA                     | RCAEval 1.6.0                            |
| epsilon-Diagnosis         | RCAEval 1.6.0 via sfr-pyrca              |
| nsigma                    | RCAEval 1.6.0                            |
| Random                    | Uniform over candidates, for a floor     |
+---------------------------+------------------------------------------+
```

Naive control, per A.5, fixed now:

```
rank services by observed degradation ratio, descending
top-1 = the worst-degraded service
```

RCAEval baselines return ranked METRIC columns. Mapping to service
granularity, fixed now: a metric column maps to a service by its name
prefix; the service rank is the position of that service's first
appearance in the ranked metric list. This is RCAEval's own
`accuracy_service` convention.

---

## 11. Primary metric and statistical test

### 11.1 Metric

Top-1 and top-3 accuracy at locating the annotated root cause SERVICE.
Reported at both component level and node level, always separately.

Confidence intervals: Wilson score interval at 95 percent for every
accuracy figure. No point estimate is reported without its interval,
per the framework's distribution rule.

### 11.2 Test, fixed now

**McNemar's exact test on paired binary top-1 outcomes**, graph method
against the naive control, same 180 cases.

```
b = cases where graph method correct AND naive wrong
c = cases where graph method wrong  AND naive correct

Exact test: b ~ Binomial(b + c, 0.5)
```

```
+----------------------+--------------------------------------------+
| Alpha                | 0.05                                       |
| Direction            | One-sided, graph method GREATER than naive |
| Justification        | H4 predicts a direction                    |
| Also reported        | Two-sided p, and the exact b and c counts  |
| Statistic            | PRIMARY S_graph only. S_full is NOT tested |
|                      | against naive, because it contains it.     |
+----------------------+--------------------------------------------+
```

Success is a DELTA against the naive control. **No absolute accuracy
threshold is preregistered, because an absolute threshold is meaningless
against a 78.9 percent baseline.**

The same test is applied against each of the five RCAEval baselines as
secondary comparisons, reported with the Holm correction across those
five. The naive comparison is primary and is not corrected, being a
single preregistered test.

### 11.3 Hard versus easy split

Classified BEFORE scoring, per Appendix A.4, on `latency-90`:

```
easy = the annotated root cause IS the worst-degraded service
hard = some other service degrades more
```

Already computed and frozen:

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

Accuracy is reported separately for hard and easy. **A method that only
works on easy cases has shown nothing**, and the hard-case figure is
reported with equal prominence to the headline.

Note the identity, fixed now **[Strong]**: under this definition the
naive control is correct on exactly the easy cases and wrong on exactly
the hard ones. Naive top-1 accuracy and the easy rate are the same
number by construction. Any comparison against naive is therefore
entirely decided on the 38 hard cases.

---

## 12. POWER ANALYSIS, computed before running anything

This section was computed from the frozen case classification and the
frozen candidate-set rule, before any propagation code was run.

### 12.1 The overlap

```
+------------------+--------------+----------------+--------+
|                  | RC REACHABLE | RC UNREACHABLE | TOTAL  |
+------------------+--------------+----------------+--------+
| Naive CORRECT    |          128 |             14 |    142 |
| Naive WRONG      |           34 |              4 |     38 |
+------------------+--------------+----------------+--------+
| TOTAL            |          162 |             18 |    180 |
+------------------+--------------+----------------+--------+
```

All 18 unreachable cases are ts-auth-service in RE2-TT.

### 12.2 The structural bounds this creates

**[Strong, arithmetic.]**

```
b has a HARD CEILING of 34
  b counts cases the graph method wins from naive. It can only
  win a case naive gets wrong (38) AND whose root cause it can
  actually name (34 of those 38 are reachable). The other 4 are
  unwinnable by construction.

c has a GUARANTEED FLOOR of 14
  14 cases are naive-correct AND unreachable. The graph method
  scores zero on them by construction under the primary
  candidate set. They are losses before any propagation is
  simulated.
```

The primary test is therefore structurally biased AGAINST the method, by
an amount that has nothing to do with propagation quality.

### 12.3 Minimum detectable effect

McNemar exact, one-sided, alpha 0.05, with c at its floor of 14:

```
+-----+-----+--------+---------------+---------+------------------+
|  b  |  c  | n_disc | p (one-sided) | SIG?    | HARD-REACHABLE   |
|     |     |        |               |         | SOLVED           |
+-----+-----+--------+---------------+---------+------------------+
|  15 |  14 |     29 |        0.5000 |    -    |  15/34 =  44.1%  |
|  20 |  14 |     34 |        0.1958 |    -    |  20/34 =  58.8%  |
|  25 |  14 |     39 |        0.0541 |    -    |  25/34 =  73.5%  |
|  26 |  14 |     40 |        0.0403 |   YES   |  26/34 =  76.5%  |
|  30 |  14 |     44 |        0.0113 |   YES   |  30/34 =  88.2%  |
+-----+-----+--------+---------------+---------+------------------+
```

```
MINIMUM DETECTABLE EFFECT: b >= 26

The graph method must correctly localise 26 of the 34 winnable
hard cases, that is 76.5 percent accuracy on hard cases, to
reach significance at alpha 0.05 one-sided.

Break-even (b > c) alone requires b >= 15, that is 44.1 percent
on hard cases.
```

If the method also loses any reachable case that naive gets right, c
rises above its floor and the bar rises with it:

```
+--------+------------------+--------------------------+
| c      | b REQUIRED       | AS % OF 34 WINNABLE      |
+--------+------------------+--------------------------+
| 14     |               26 |                   76.5%  |
| 17     |               30 |                   88.2%  |
| 19     |               32 |                   94.1%  |
| 24     | UNREACHABLE      | exceeds the ceiling of 34|
+--------+------------------+--------------------------+
```

**At c >= 24, significance becomes arithmetically impossible regardless
of how well the propagation model performs.**

### 12.4 Is that effect plausible?

**[Indicative.]** Fang et al. (arXiv 2510.04711) report state-of-the-art
top-1 accuracy of 0.21 on a benchmark constructed to be hard. Applying
that rate to the 34 winnable cases gives roughly 7 wins:

```
b = 7, c = 14  ->  one-sided p = 0.96
```

Published state-of-the-art performance on hard cases, transplanted here,
would not come close to significance. Required is 76.5 percent on hard
cases against a state-of-the-art figure of 21 percent.

### 12.5 VERDICT: THIS STUDY IS UNDERPOWERED

**[Strong.]** Declared in advance. The design cannot detect an effect of
the size the literature suggests is achievable. It can only return
significance if the method performs roughly three and a half times better
on hard cases than published state of the art.

**Per instruction, the experiment proceeds anyway, labelled underpowered.
The design is NOT adjusted to manufacture power.** No case is added, no
threshold is loosened, no test is swapped for a more permissive one.

The most likely outcome, stated in advance so it cannot be presented as a
discovery, is a null. **[Indicative.]**

### 12.6 Preregistered secondary, clearly labelled

A restricted analysis on the 162 reachable cases only, where c has no
structural floor:

```
n = 162, naive correct 128, naive wrong 34
c =  0  ->  need b >=  5
c =  5  ->  need b >= 13
c = 10  ->  need b >= 20
```

This is better powered but answers a DIFFERENT question: it asks how the
propagation model performs where the graph can see the root cause, having
excluded the cases where mining failed. It is reported as SECONDARY and
is never presented as the headline, because excluding the method's own
coverage failures flatters it.

---

## 13. What counts as success, and what counts as a null

### 13.1 Success

```
Reject the null at alpha 0.05, one-sided, on McNemar's exact test
of PRIMARY S_graph top-1 against the naive control, over all 180
cases, under the PRIMARY candidate set.
```

Reported with b, c, the exact p, and the hard-case and easy-case split.

Even on success, the claim permitted is: graph propagation localises root
causes better than rank-by-worst-symptom on RE2-OB and RE2-TT. Nothing
about novelty (section 2.1), nothing about money (section 1.4), and
nothing about canonical H4's kill condition (section 1.3).

### 13.2 Null

```
Fail to reject at alpha 0.05 one-sided.
```

**A null WILL be published, plainly, as the headline.** It is a real
result. It would show that this benchmark cannot separate graph
propagation from a trivial symptom rule, which given section 2.3 is
itself informative about the benchmark.

### 13.3 The result that is neither

If b > c but p > 0.05, the finding is "directionally positive,
underpowered, not significant". It is reported in exactly those words and
is NOT described as support for H4.

### 13.4 Pre-committed statement if the method loses

If c > b, the finding is that graph propagation performs WORSE than
rank-by-worst-symptom on this benchmark, and that is reported as the
headline without mitigation.

---

## 14. Monotonicity

Part IX v3.1c requires a monotonicity check before fault-tree logic:
"Fault trees require a coherent monotone structure: a component failing
must not make the system more likely to succeed. Retries, fallbacks,
circuit breakers, load shedding and graceful degradation all break
monotonicity."

The propagation model here is Monte Carlo over a graph rather than a
static fault tree, but it embeds the same monotone assumption: a node is
affected only if a callee is affected, and nothing a callee does can help.

**Fixed now.** What will be measured: the rate of repeated
(parentSpanID, operationName) pairs within a trace, as a detectable proxy
for retry behaviour. It will be reported per system.

**Recorded refusal.** Circuit breakers, fallbacks and graceful
degradation are NOT detectable from RE2 traces. A span that was never
emitted because a breaker was open leaves no record. Therefore this
experiment CANNOT establish that the monotone assumption holds. Per the
framework's rule that a recorded refusal beats a number nobody should
trust, the monotonicity precondition is recorded as UNVERIFIED rather
than asserted to be satisfied. **[Strong.]**

---

## 15. Reproducibility

### 15.1 Seeds

```
Master seed                     20260820
Per-case, per-parameter-cell    derived deterministically as
                                SHA256(case_id + "|" + param_cell_id)
                                truncated to 32 bits
```

Every derived seed is written to the results file alongside its case.
The primary analysis uses worst-rank tie-breaking, which is
deterministic, so no seed affects the primary result. Seeds affect only
the Monte Carlo propagation estimates and the optimistic random
tie-breaking secondary.

Monte Carlo standard error is reported for the propagation estimates.

### 15.2 Environment

```
Python                3.12.3
RCAEval               1.6.0
numpy                 1.26.4
pandas                3.0.5
networkx              3.6.1
```

Full freeze in `docs/environment_freeze.txt`.

Python 3.11 is unusable: RCAEval hard-imports rcd and torai on 3.11
instead of degrading gracefully as it does on 3.10, 3.12 and 3.14.

### 15.3 Code freeze

The analysis code is frozen at a commit recorded in section 17, FREEZE
RECORD, before any scoring run. No scoring output produced by uncommitted
code is admissible.

---

## 16. DEVIATIONS

Any departure from this document after the freeze commit is recorded
here with a date and a reason. The document above is never edited to
match what was done.

### D-01  2026-08-20  Correction ID renumbering (documentation only, no method change)

Section 6.2 above logs the p_transmit clamp as tension **T-M**, and section
3.3 points at correction **R14** in CORRECTION_LOG.md. Both IDs were assigned
against Canonical Thesis v2.1, which is not the current canonical set. In
v2.1c both are already occupied by different claims (T-M is retrieval-assisted
reading; R14 is ledger entries aggregate to a portfolio position).

The corrections were renumbered in CORRECTION_LOG.md:

```
+---------+---------+
| WAS     | NOW     |
+---------+---------+
| R13     | R17     |
| R14     | R18     |
| R15     | R19     |
| R16     | R20     |
| T-M     | T-T     |
| T-N     | T-U     |
+---------+---------+
```

**Sections 3.3 and 6.2 above are NOT edited.** This document is frozen at
b0db614791c597dd7b0e91358bf7079762d4ddeb. Read "T-M" in section 6.2 as
**T-T**, and "R14" in section 3.3 as **R18**.

Nothing about the method, the metrics, the test, the exclusions or the power
analysis changes. This deviation is bookkeeping. [Strong.]

### D-02  2026-08-20  Canonical citations refreshed to revision "c"

Sections 1.1, 2.1, 2.2 and 2.3 above cite the canonical documents. The
citations to **Part IX Mathematics v3.1c** and **Research Paper v1.1c** were
already to the current "c" revision and stand unchanged. The citation in
section 1.1 to the H4 statement was taken from **Canonical Thesis v2.1**,
which is superseded by **v2.1c**.

The four current canonical documents have been pulled into the repository at
`docs/canonical/` so that every citation resolves against a fixed local copy.
Commit hash recorded in section 17.

Any citation to the canonical documents from this point is to the "c"
revision.

**Verification performed against the local copies, not against a summary.**

```
+--------------------------------------+-------------------------------+
| CHECKED                              | RESULT                        |
+--------------------------------------+-------------------------------+
| H4 statement and kill condition      | IDENTICAL in v2.1c to what    |
| in Canonical Thesis v2.1c            | section 1.1 records. Section  |
|                                      | 1.1 stands unchanged.         |
+--------------------------------------+-------------------------------+
| Highest retirement ID in v2.1c       | R16. So R17 to R20 are free.  |
+--------------------------------------+-------------------------------+
| Highest tension ID in v2.1c          | T-S. So T-T and T-U are free. |
+--------------------------------------+-------------------------------+
| E3 grading in v2.1c                  | OCCUPIED. Section 2.1 stands. |
+--------------------------------------+-------------------------------+
```

**Section 2.1 is understated, and the stronger form is recorded here.**
Canonical Thesis v2.1c states, at the close of its E3 analysis:

> "The risk axis of this framework is occupied. What the framework does at
> E3 is run an occupied method over a different substrate for a different
> unit of account. That is an integration position, not a residual, and it
> must be described that way."

And on the family itself:

> "It builds a discovered dependency graph, propagates a seeded disruption
> through it by Monte Carlo with a conditional compromise probability on
> each edge, assesses monetary loss at each node, aggregates across assets,
> entities and portfolios, and reports a loss exceedance curve denominated
> in US dollars. Priority runs from March 2018. E3 is re-graded OCCUPIED."

That description is a description of the method under test in this
experiment, minus the monetary layer this experiment explicitly excludes.
The prohibition in section 2.1 therefore binds harder, not softer: a
positive result here demonstrates that an occupied method runs on a
different substrate. **It establishes nothing about novelty.** [Strong.]

Also recorded, from v2.1c: US 12,380,090 and US 11,356,469, cited since
v1.0 and withdrawn at v2.1 as unverifiable, have been read at source, are
granted, and are NOT in the family and NOT relevant. Corrected rather than
withdrawn. Neither is cited anywhere in this experiment. [Strong.]

---

## 17. FREEZE RECORD

```
Pre-registration commit    b0db614791c597dd7b0e91358bf7079762d4ddeb
                           (the commit that first introduced this
                           document; this FREEZE RECORD is written in
                           the immediately following commit, which
                           changes nothing else)

Analysis code commit       7cc789688b8ae8296b144d9daaded23e4d35a67e
                           src/ledger_h4.py and src/run_cases.py.
                           Committed BEFORE any scoring run. No scoring
                           output produced by uncommitted code is
                           admissible.
```

The method is frozen as of b0db614791c5. Everything
above section 16 was fixed before any scoring code existed.

---

## 18. Standing rules observed

- No em-dashes.
- ASCII boxed tables, not markdown pipe tables.
- Every claim graded Strong, Indicative or Asserted.
- If a method disagrees with its own literature, the literature wins.
- Retirements and corrections are logged, never silently edited.
- No HARKing. Hypotheses, metrics, tests, exclusions and the power
  analysis are all fixed in this document before any scoring run.
