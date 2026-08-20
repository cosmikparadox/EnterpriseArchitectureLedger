# Correction log

Every entry records something found to be wrong, unsupported, or
underspecified. Nothing here is silently edited later. Entries are appended.

Grading: Strong (verified by direct execution against primary data),
Indicative (evidence points this way, not conclusive), Asserted (judgement,
not established).

---

## C-01 Prior run: the "true root cause" was a label lookup, not a discovery

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

## C-02 Prior run: the headline degradation signal is an undocumented file

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

## C-03 Prior run: "worst symptom names paymentservice" holds only under an undisclosed restriction

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

## C-04 Prior run: the showcase case is unrepresentative

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

## C-05 Brief, Appendix A.2: the method as specified cannot run on Train Ticket

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
