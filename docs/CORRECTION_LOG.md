# Correction log

Every entry records something found to be wrong, unsupported, or
underspecified. Nothing here is silently edited later. Entries are appended.

Grading: Strong (verified by direct execution against primary data),
Indicative (evidence points this way, not conclusive), Asserted (judgement,
not established).

---

## Formal correction IDs, for lifting into the canonical history

Assigned in the framework's existing convention, against the CURRENT
canonical set at revision "c". These entries concern the prior Experiment 1
sandbox run reported in `result_summary.md` and the specification of the
experiment brief.

**Renumbered 2026-08-20. See DEVIATIONS at the end of this document.** The
first assignment of these IDs (R13 to R16, T-M, T-N) was made against
Canonical Thesis v2.1 and collided with existing claims in v2.1c. Retirements
in v2.1c run to R16 and tensions to T-S, so these continue at R17 and T-T.

### R17  Root cause presented as discovered when it was a label lookup

The prior Experiment 1 run reported identifying checkoutservice as the root
cause by inspecting CPU metrics, and framed the appearance of signal after
that step as a methodological finding. The case used was RCAEval's
`multi-source-data` sample, which sits inside the RE2-OB archive at
`RE2-OB/checkoutservice_cpu/multi-source-data` and whose `traces.csv` is
byte-identical to `RE2-OB/checkoutservice_cpu/1/traces.csv`
(md5 956052e9c07123b4517e37a0b536d9cf, 391,997 spans, inject_time
1705354566 in both). The annotated root cause was encoded in the directory
name throughout. The CPU-metric step recovered a label the dataset already
supplied, so it established nothing about the method's ability to locate a
root cause. The arithmetic in that run is correct; the discovery framing is
withdrawn. [Strong.]

### R18  A headline number taken from a source nobody opened

**This is the one to read.** The prior run's central figures, paymentservice
degrading x4.08 while the true culprit checkoutservice sat at x0.92, were
computed from `tracets_lat.csv`. Those figures reproduce exactly, so the
arithmetic is sound. The file is not. Its semantics are undocumented in
RCAEval, and no tested formula reproduced its values from `traces.csv`:
per-15s-bucket mean, median and p90 span duration were tried, as were span
counts above fixed thresholds from 20 to 100 microseconds and above
quantile thresholds from q90 to q995. The best agreement reached was
r = +0.33 with 12 percent exact match. RCAEval's own pipeline never reads
the file; `read_data` uses `{service}_latency-90`, and that canonical
column was present in the very sample the prior run used. Recomputing the
same case on `latency-90` shows every service between x0.95 and x1.06,
with paymentservice at x1.06 and checkoutservice at x0.99. Nothing
degraded. The x4.08 signal exists only inside the undocumented file.
**This is the same failure mode as the patent citation error recorded at
v1.1c: a number lifted from a source that was never opened at its own
level of detail, then carried forward as established.** The framework's
existing diagnosis applies without modification, that the failure mode was
confidence rather than ignorance. [Strong.]

### R19  A comparative claim true only under an undisclosed restriction

`result_summary.md` states "Node-local symptom severity names paymentservice
(x4.08) as worst" and concludes "Ranking by node-local symptom misidentifies
the source. The graph does not." Across every service present in
`tracets_lat.csv` for that case, shippingservice at x13.85 and traceservice
at x13.27 both exceed paymentservice at x4.08. paymentservice is worst only
after restricting the comparison to the seven services that appear in the
mined graph. The prior script applied that restriction in code; the summary
does not disclose it. Applied to everything observable, the naive
rank-by-worst-symptom control would have named shippingservice. The second
sentence of the conclusion is separately unsupported: the run did not show
the graph locating the root cause, because the root cause was supplied to
it as a seed. [Strong.]

### R20  A showcase case unrepresentative of its own benchmark

Measured across all 90 RE2-OB cases on `latency-90`, the median
largest-degradation-by-any-service is x18.3 and 85 of 90 cases contain at
least one service exceeding x1.5. The case the prior run selected,
`checkoutservice_cpu/1`, peaks at x1.06, placing it among the five weakest
of ninety. It is also one of only 18 hard cases in 90 under the brief's own
A.4 definition, reported without that base rate. A single case selected from
the tail of a distribution and reported without the distribution is an
anecdote, which the prior summary conceded in part ("One fault case is an
anecdote") without noting that the case was also atypical. [Strong.]

### T-T  Transmission probability unbounded above in the specification

Appendix A.2 of the experiment brief defines
`p_transmit = p_base + p_shared * theta` with no upper bound. The required
sensitivity grid includes p_base = 0.75 with Beta(5,2), whose mean theta is
5/7, giving p_transmit = 1.036. That is not a probability. Closed by
clamping to `min(1, p_base + p_shared * theta)`, recorded in
PREREGISTRATION.md section 6.2 rather than patched silently. [Strong.]

### T-U  The ranking statistic contains the control it is compared against

Appendix A.3 scores candidates by `Spearman(predicted, observed)` where the
predicted vector assigns the seed itself probability 1.0, its maximum. Rank
correlation is therefore maximised by candidates that are themselves badly
degraded, which is exactly the naive control's rule. The A.3 statistic
contains the naive control as a dominant term, so comparing the two would
compare a quantity against a component of itself and would return a small
positive result even if the graph contributed nothing. Closed by excluding
the seed's own coordinate from the correlation, at a stated cost in
resolution. See PREREGISTRATION.md section 7. [Strong.]

---
Indicative (evidence points this way, not conclusive), Asserted (judgement,
not established).

---

## C-01 [formal ID: R17] Prior run: the "true root cause" was a label lookup, not a discovery

Status: CONFIRMED. Grade: Strong.

`result_summary.md` presents identifying checkoutservice as the root cause
via CPU metrics as an investigative step ("Only after identifying the true
root from CPU metrics did the signal appear"). The brief repeats this as
failure 2.

The case used was RCAEval's `multi-source-data` sample. That sample sits
inside the RE2-OB archive at
`RE2-OB/checkoutservice_cpu/multi-source-data`, and its `traces.csv` is
byte-identical to `RE2-OB/checkoutservice_cpu/1/traces.csv`
(md5 956052e9c07123b4517e37a0b536d9cf, both files, 391,997 spans,
inject_time 1705354566 in both).

The annotated root cause was therefore available in the directory name the
whole time. Deriving it from CPU metrics recovered a label the dataset
already provides. This does not make the prior arithmetic wrong, but it
removes the discovery framing.

## C-02 [formal ID: R18] Prior run: the headline degradation signal is an undocumented file

Status: CONFIRMED. Grade: Strong.

The prior run computed observed degradation from `tracets_lat.csv`, giving
paymentservice x4.08 and checkoutservice x0.92. Those numbers reproduce
exactly.

`tracets_lat.csv` semantics are not documented in RCAEval, and the values do
not correspond to any obvious latency statistic computed from `traces.csv`.
Tested against per-15s-bucket mean, median and p90 span duration for
`productcatalogservice_GetProduct`, and against counts of spans exceeding
fixed thresholds (20 to 100 us) and quantile thresholds (q90 to q995).
Best correlation achieved was r = +0.33 with 12% exact agreement. No
formula reproduced the series. RCAEval's own pipeline does not read
`tracets_lat.csv` in any single-source baseline; `read_data` instead uses
`{service}_latency-90`.

The canonical per-service latency IS available, including in the sample the
prior run used: `multi-source-data/metrics.csv` contains
`checkoutservice_latency-90` and nine other `_latency-90` columns.

Recomputing the same case on `latency-90`:

```
+-------------------------+-----------+
| SERVICE                 | POST/PRE  |
+-------------------------+-----------+
| paymentservice          |   x1.06   |
| emailservice            |   x1.01   |
| recommendationservice   |   x1.00   |
| checkoutservice   (RC)  |   x0.99   |
| currencyservice         |   x0.96   |
| frontend                |   x0.96   |
| cartservice             |   x0.95   |
+-------------------------+-----------+
```

Nothing degraded. The x4.08 paymentservice signal exists only in
`tracets_lat.csv`. Under the metric RCAEval itself treats as canonical, this
case shows no latency propagation at all.

## C-03 [formal ID: R19] Prior run: "worst symptom names paymentservice" holds only under an undisclosed restriction

Status: CONFIRMED. Grade: Strong.

`result_summary.md` states "Node-local symptom severity names paymentservice
(x4.08) as worst." Across all services present in `tracets_lat.csv` for that
case, the worst are shippingservice x13.85 and traceservice x13.27, both
above paymentservice x4.08.

paymentservice is worst only after restricting to the seven services that
appear in the mined graph. The prior script applied that restriction
(`in_graph`) but the summary does not disclose it. The naive
rank-by-worst-symptom control, applied to everything observable, would have
named shippingservice, not paymentservice.

## C-04 [formal ID: R20] Prior run: the showcase case is unrepresentative

Status: CONFIRMED. Grade: Strong.

Measured on `latency-90` across all 90 RE2-OB cases, the median
largest-degradation-by-any-service is x18.3, and 85 of 90 cases contain at
least one service degrading beyond x1.5. `checkoutservice_cpu/1`, the case
the prior run used, has a maximum of x1.06. It is one of the five weakest
cases out of ninety.

Additionally, 72 of 90 OB cases are "easy" under the brief's own A.4
definition (the annotated root cause IS the worst-degraded service). The
prior run selected one of the 18 hard cases and reported it without noting
the base rate.

## C-05 [resolved: see PREREGISTRATION.md section 5, SCC condensation] Brief, Appendix A.2: the method as specified cannot run on Train Ticket

Status: OPEN, needs a decision before pre-registration. Grade: Strong.

A.2 requires "Evaluate in reverse topological order so each node is drawn
exactly once per simulation." A topological order exists only for an acyclic
graph.

Mined RE2-TT graphs are cyclic. `ts-auth-service_cpu/1` mines to 26 nodes,
55 edges, NOT acyclic, containing the 2-cycles
(ts-travel2-service, ts-seat-service) and (ts-seat-service, ts-travel-service).
`networkx.topological_sort` raises on these graphs.

This is a genuine specification gap, not an implementation detail. It is
logged rather than patched silently.

## C-06 Brief, Step 1: RE2 is not three usable systems for this method

Status: CONFIRMED. Grade: Strong.

The brief says "Use RE2. It has traces, and traces are what the graph is
mined from." RE2-SS (Sock Shop, 90 cases) contains no `traces.csv`,
no `tracets_lat.csv` and no `tracets_err.csv` in any of its 90 case
directories. Verified by file count: 90 case dirs, 0 trace files.

A trace-mined method cannot run on Sock Shop at all. Usable n for the
method under test is 180, not 270.

## C-07 Brief, Step 1: disk estimate is far too high

Status: CONFIRMED, harmless. Grade: Strong.

The brief recommends "Roughly 50GB free disk". RE2 totals 3.92 GiB
compressed (RE2-OB 1.10, RE2-SS 0.22, RE2-TT 2.60) and about 33 GB
uncompressed with logs, 23 GB without. Not a problem, recorded for accuracy.

## C-08 Brief, Appendix A.1 vs the data: trace mining sees only part of the system

Status: CONFIRMED, affects scope. Grade: Strong.

In RE2-OB, `traces.csv` carries exactly 7 distinct `serviceName` values in
all 90 cases: checkoutservice, currencyservice, emailservice,
frontendservice, paymentservice, productcatalogservice,
recommendationservice.

`simple_metrics.csv` carries `latency-90` for 10 services, adding adservice,
cartservice and shippingservice (and naming the frontend `frontend`, not
`frontendservice`).

adservice, cartservice and shippingservice are called by the frontend, but
the callee never emits a span, so the parentSpanID mining in A.1 cannot see
those edges. The mined graph is a 7-node subgraph of a 10-service system,
and this is a property of the instrumentation, not of the mining.

All five OB fault-injection targets fall inside the traced 7, so the
annotated root cause is always a graph node for OB. Verified: rc_in_graph
true in 90 of 90.

## C-09 The OB mined graph carries no case-specific information

Status: CONFIRMED. Grade: Strong.

All 90 RE2-OB cases mine to an identical graph: 7 nodes, 9 edges, acyclic,
shared components (in-degree > 1) exactly {currencyservice,
productcatalogservice}. Node count, edge count and shared-component set are
constant across every case, every fault type and every repetition.

The brief states "The mining is part of the claim." For Online Boutique the
mining returns the same fixed topology 90 times. Whatever the method
achieves on OB, per-case mining contributes nothing beyond a constant
topology that could have been written down once.

### T-V  Monte Carlo seed sensitivity was discovered by accident, not by design

**Logged 2026-08-20.** [Strong.]

The Experiment 1 result carries roughly plus or minus 3 percentage points
of top-1 jitter from Monte Carlo noise alone. The same parameter cell, run
under two different derived seeds, returned 101 and 96 correct of 180, with
15 of 180 node ranks differing by exactly one place.

**That number exists only because two code paths disagreed about a
string.** One runner built its cell identifier as "a2.0_b5.0_pb0.55_ps0.4"
and the other as "a2_b5_pb0.55_ps0.4". Since the per-case seed is derived
by hashing that identifier, the two runs drew different random numbers.
Nothing about this was designed. No replication cell was preregistered, no
seed sweep was specified, and the pre-registration's section 15.1 treats
seeds purely as a reproducibility record rather than as a source of
variance to be measured.

Had the two runners agreed on the string, as they were meant to, the
experiment would have reported 101 of 180 as a point estimate with no
indication that 96 was equally available.

**This is the framework's own failure mode, in the framework's own
experiment.** The Architecture Ledger's central methodological commitment
is distributional discipline: Part IX states that nothing is reported
without its range, its method and its seed, and Appendix B of the
experiment brief restates it as "everything is a distribution, never
report a point estimate without its range". The experiment testing that
framework ran a point-estimate design and recovered its own variance by
luck.

The check that would have caught it is trivial and was not run: execute
one parameter cell under k independent seeds and report the spread. It
costs one extra cell.

**Requirement, binding on future experiments.** Any experiment using Monte
Carlo estimation must preregister a seed-replication cell: the same
parameters under at least three independent seeds, with the spread
reported alongside the point estimate. A result whose seed variance was
never measured is a point estimate presented as if it were stable.

**Family.** This belongs with R18, with the patent citation error, and with
M-01. All four have the same shape: **the check that would have caught it
was not run.** In R18 nobody opened the file the number came from. In the
patent error nobody read the claims. In M-01 nobody compared the byte
count. Here nobody ran the same cell twice. The failure is never a
miscalculation; it is an omitted verification that would have been cheap.

### T-W  A monitoring check that can match itself is not a monitoring check

**Logged 2026-08-21.** [Strong.]

```
Verify process state against an INDEPENDENT signal: file mtime,
output size, exit code, or a written marker. Never against a
pattern that the checking command itself satisfies.
```

**What happened.** Process liveness was checked with
`pgrep -f run_fang_control` and `pgrep -f "curl -sL -C -"`. Both patterns
appear inside the command line of the shell that runs the check, so `pgrep`
matched its own wrapper and reported a running process when none existed.

Two consequences, one worse than the other.

**The wasted hour.** A waiter loop of the form
`while pgrep -f "curl ..."; do sleep 30; done` waited on itself and never
terminated, so the scoring stage it was gating never launched. The download
completed at 11:57 and the scoring had still not started when it was checked
at 12:50. Running it directly took 90 seconds.

**The false reports.** Two status statements to the user asserted that runs
were in progress. Both were wrong. The error was caught only by comparing the
output file's mtime against the wall clock, which is exactly the independent
signal the rule now requires.

**Why this belongs with T-U rather than in a run log.** T-U recorded that the
ranking statistic contained the naive control it was being compared against.
This is the same shape one level up: **an instrument that contains the thing
it is measuring.** In T-U the metric included its own control; here the
detector matched its own detector. Both return a confident answer that is
about the instrument rather than about the world.

**The general form.** Before trusting any check, ask what it would report if
the condition were false. `pgrep -f X` run from a shell whose command line
contains X answers "present" unconditionally, so it cannot report absence and
is not a test. A check that cannot fail is not evidence.

**Cheap fixes, any of which suffices.** Match on the interpreter and script
path together and exclude wrapper shells; compare output mtime or byte count
against a previous reading; write a sentinel on completion and test for the
sentinel; or use the job-control exit code rather than inspecting the process
table at all.

---

## STANDING METHOD RULES

Rules adopted as standing practice, not one-off notes. Each was adopted
because it was violated first.

### M-01  A file retrieved through a representation layer is not the file

**Adopted 2026-08-20.** [Strong.]

```
Any canonical document pulled into this repository must be
byte-exact against the source's reported size, verified by
hash, or it does not count as committed.
```

**What happened here.** The four canonical documents at revision "c" were
first pulled using the Drive `read_file_content` tool. That tool returns a
natural-language *representation* of a document, not its bytes. The pulled
files were short of source by 5,483 to 71,011 bytes:

```
+---------------------------------------------+---------+---------+---------+
| FILE                                        |  SOURCE |  PULLED |   DELTA |
+---------------------------------------------+---------+---------+---------+
| Architecture_Ledger_Research_Paper_v1_1c.md |  136144 |   65133 |  -71011 |
| Part_IX_Mathematics_v3_1c.md                |  128723 |  120418 |   -8305 |
| Canonical_Thesis_v2_1c.md                   |  142078 |  136595 |   -5483 |
| The_Numbers_Explained_v1_1c.md              |   83557 |   84644 |   +1087 |
+---------------------------------------------+---------+---------+---------+
```

The largest discrepancy was not a truncation at all but a wrong file: the
tool result being read had been mislabelled in flight, and what was written
to `Architecture_Ledger_Research_Paper_v1_1c.md` was in fact Canonical
Thesis **v2.1**, the stale document. A size check alone caught it only
because the delta was gross. Note the fourth row: one file came out
*larger* than source, so "short of expected" is not a reliable detector
either.

The bad pull was discarded. The documents were re-fetched with
`download_file_content`, base64-decoded to bytes, and all four now match
the Drive-reported size exactly, with SHA256 recorded in
`docs/canonical/README.md`.

**Why this is a standing rule and not a note.** The same failure occurred
in the session that produced the v1.1c documents themselves, where ASCII
table padding was rebuilt by hand and verified against expectation rather
than against the source bytes. A method that has now failed the same way
twice in two sessions is a method, not an accident.

**Family.** This belongs with R18 and with the patent citation error
corrected at v1.1c and v2.1c. All three have one shape: **a source taken
at one level of detail and carried forward as established.** In R18 it was
a number read from a derived file whose semantics were never checked
against the file that produced it. In the patent error it was a family
described from a summary rather than read at claim level. Here it was a
document read through a representation layer rather than fetched as bytes.

The framework's existing diagnosis applies unchanged: the failure mode is
confidence, not ignorance. What defeats it is not more care but a
mechanical check that does not depend on judgement. Hence a rule with a
pass/fail test in it, rather than an instruction to be careful.

---

## DEVIATIONS

### 2026-08-20  Correction IDs renumbered, first assignment was against a stale canonical set

**What happened.** Formal IDs R13, R14, R15, R16, T-M and T-N were assigned
to the six corrections above on 2026-08-20, on the basis of Canonical Thesis
**v2.1**, whose section 15.1 runs to R12 and whose section 15.5 runs to T-L.

**Why it was wrong.** v2.1 is not the current canonical set. The current set
is at revision "c". In Canonical Thesis **v2.1c** every one of those six IDs
is already taken by a different, existing claim:

```
+-------+--------------------------------------------------------+
| ID    | ALREADY OCCUPIED IN v2.1c BY                           |
+-------+--------------------------------------------------------+
| R13   | practice is telemetry-derived throughout               |
| R14   | ledger entries aggregate to a portfolio position       |
| R15   | E3 only partially occupied / patent family constrains  |
|       | rather than occupies                                   |
| R16   | risk quantification vendors do not scope from a mined  |
|       | dependency graph                                       |
| T-M   | retrieval-assisted reading (with T-M-a, T-M-b, T-M-c)  |
| T-N   | the graph moves under the measurement                  |
| T-O   | Goodhart                                               |
| T-P   | selection effect on H1                                 |
| T-Q   | counterfactual adjudication                            |
| T-R   | source grade / prior art assessed by proxy             |
| T-S   | concentration of the remaining claim                   |
+-------+--------------------------------------------------------+
```

**The renumbering applied:**

```
+---------+---------+----------------------------------------------+
| WAS     | NOW     | CORRECTION                                   |
+---------+---------+----------------------------------------------+
| R13     | R17     | root cause presented as discovered when it   |
|         |         | was a label lookup                           |
| R14     | R18     | headline number taken from a source nobody   |
|         |         | opened                                       |
| R15     | R19     | comparative claim true only under an         |
|         |         | undisclosed restriction                      |
| R16     | R20     | showcase case unrepresentative of its own    |
|         |         | benchmark                                    |
| T-M     | T-T     | transmission probability unbounded above     |
| T-N     | T-U     | ranking statistic contains the control it is |
|         |         | compared against                             |
+---------+---------+----------------------------------------------+
```

**Note on PREREGISTRATION.md.** Section 6.2 of the pre-registration refers to
the clamp correction as "T-M". That document is frozen at commit
b0db614791c597dd7b0e91358bf7079762d4ddeb and is NOT edited to match. The
renumbering is recorded in its own DEVIATIONS section instead. Read "T-M" in
PREREGISTRATION.md section 6.2 as T-T.

**Cause, and it is the familiar one.** The ID range was taken from the most
recent canonical document this session had actually opened, rather than from
the current one. That is the same failure mode recorded at R18 and at v1.1c:
a fact carried forward from a source not checked at its own level of detail.
It is logged rather than quietly fixed. [Strong.]
