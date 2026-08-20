# RE2 real schema, as measured

Everything here was read off the downloaded files, not from documentation.
Source: Zenodo record 14590730, files RE2-OB.zip, RE2-SS.zip, RE2-TT.zip.
Downloaded 2026-08-20. RCAEval 1.6.0, Python 3.12.3.

Grade: Strong throughout (direct measurement), except where marked.

## 1. Case layout

```
RE2-<SYS>/<rootcause-service>_<faulttype>/<run>/
```

`<run>` is 1, 2 or 3. The annotated root cause and the fault type are
encoded ONLY in the parent directory name. There is no label file, no
manifest, and no ground-truth column anywhere inside a case.

Fault types, all three systems: cpu, delay, disk, loss, mem, socket.
Five injected services per system, six fault types, three repetitions,
giving 90 cases per system.

One extra directory exists and is NOT a case:
`RE2-OB/checkoutservice_cpu/multi-source-data`. Its traces.csv is
byte-identical to `RE2-OB/checkoutservice_cpu/1/traces.csv`
(md5 956052e9c07123b4517e37a0b536d9cf). It must be excluded or
checkoutservice_cpu is counted four times. A naive `*/*` glob picks it up.

## 2. Files per case, measured

```
+----------------------------+--------+--------+--------+
| FILE                       | RE2-OB | RE2-SS | RE2-TT |
+----------------------------+--------+--------+--------+
| inject_time.txt            |  yes   |  yes   |  yes   |
| metrics.csv                |  yes   |  yes   |  yes   |
| simple_metrics.csv         |  yes   |  yes   |  yes   |
| logs.csv                   |  yes   |  yes   |  yes   |
| logts.csv                  |  yes   |  yes   |  yes   |
| cluster_info.json          |  yes   |  yes   |  yes   |
| metrics_postprocess.log    |  yes   |  yes   |  yes   |
| pod-node-1.csv             |  yes   |  yes   |  yes   |
| pod-node-2.csv             |  yes   |  yes   |  yes   |
| traces.csv                 |  yes   |   NO   |  yes   |
| tracets_lat.csv            |  yes   |   NO   |  yes   |
| tracets_err.csv            |  yes   |   NO   |  yes   |
+----------------------------+--------+--------+--------+
```

Sock Shop: 90 case directories, 0 trace files of any kind. Counted, not
assumed.

## 3. Ground truth and injection time

Annotated root cause: the directory name prefix, e.g. `checkoutservice`
in `checkoutservice_cpu`. It is a SERVICE name, never a metric or a pod.

Fault injection time: `inject_time.txt`, a single Unix timestamp in
SECONDS, e.g. `1705400377`. Verified inside the observation window for
180 of 180 traced cases.

The injection sits at the midpoint of a roughly 24 minute window. For
`checkoutservice_cpu/1`: 720 metric rows before, 721 after.

## 4. traces.csv

Columns, identical in RE2-OB and RE2-TT:

```
time, traceID, spanID, serviceName, methodName, operationName,
startTimeMillis, startTime, duration, statusCode, parentSpanID
```

Traps found:

- `time` is a STRING of the form "10:07" (HH:MM). It is NOT a Unix
  timestamp. Comparing it against inject_time silently produces nothing.
  Use `startTimeMillis` (milliseconds) or `startTime` (microseconds).
- `duration` is microseconds.
- `statusCode` is 0.0 for essentially every span in the case inspected,
  and NaN elsewhere. It is not a usable error signal. Grade: Indicative,
  checked on one case in depth.
- `parentSpanID` is null for trace roots. A small fraction of non-null
  parents do not resolve to any span in the same file. Median unresolved
  fraction is 2e-5, but the maximum observed in RE2-TT is 0.61.

Row counts (spans per case):

```
+---------+-----------+-----------+-----------+
| SYSTEM  |    MIN    |  MEDIAN   |    MAX    |
+---------+-----------+-----------+-----------+
| RE2-OB  |   199,960 |   398,605 |   412,741 |
| RE2-TT  |   122,969 |   777,995 | 1,535,674 |
+---------+-----------+-----------+-----------+
```

## 5. Metrics

`simple_metrics.csv`: 1 second resolution, ~1441 rows per case. Curated
per-service columns with suffixes:
cpu, mem, diskio, socket, latency-50, latency-90, error, workload.

`metrics.csv`: the full set, 417 columns for RE2-OB. Prometheus and Istio
names such as `{service}_istio-latency-90`,
`{service}_container-cpu-usage-seconds-total`, plus node-level metrics.

RCAEval's own `read_data` drops `latency-50` and renames `latency-90` to
`latency`. `{service}_latency-90` is therefore the canonical per-service
latency, and it is what this experiment uses as the observed signal.

`tracets_lat.csv` and `tracets_err.csv` are 15 second resolution, 97 rows,
keyed `{service}_{Operation}`. The semantics of `tracets_lat.csv` are not
documented and could not be reproduced from `traces.csv` by any tested
formula. It is NOT used here. See correction log C-02.

## 6. Service name coverage, the important part

Service names differ between traces and metrics, and neither covers the
whole system.

RE2-OB, all 90 cases identical:

```
+----------------------------------+-------+
| traced serviceName values        |     7 |
| services with latency-90 metric  |    10 |
+----------------------------------+-------+
```

Traced: checkoutservice, currencyservice, emailservice, frontendservice,
paymentservice, productcatalogservice, recommendationservice.

Metric-only, never traced: adservice, cartservice, shippingservice.
The frontend is `frontendservice` in traces and `frontend` in metrics.
A name map is required.

RE2-TT: 27 traced services, 28 services with latency-90 (81 cases) or
22 (9 cases).

## 7. Mined graph, per Appendix A.1

Mining rule applied exactly as specified: map spanID to serviceName, map
parentSpanID through it, group by (parentSvc, serviceName), drop
self-calls, weight by span count.

```
+---------+-------+-------+---------+------------------+
| SYSTEM  | NODES | EDGES | ACYCLIC | CASES            |
+---------+-------+-------+---------+------------------+
| RE2-OB  |     7 |     9 |   yes   | 90 of 90         |
| RE2-TT  |    26 |    55 |    NO   | 78 of 90         |
| RE2-TT  |    18 |    20 |   yes   | 11 of 90         |
| RE2-TT  |    19 |    21 |   yes   |  1 of 90         |
+---------+-------+-------+---------+------------------+
```

RE2-OB mines an IDENTICAL graph in all 90 cases. Shared components
(in-degree > 1) are exactly {currencyservice, productcatalogservice} in
every case. The full OB edge list, call counts from checkoutservice_cpu/1:

```
        frontendservice -> productcatalogservice     84,412
        frontendservice -> currencyservice           52,421
        frontendservice -> recommendationservice     12,929
  recommendationservice -> productcatalogservice     12,929
        checkoutservice -> currencyservice            2,323
        checkoutservice -> productcatalogservice      1,655
        checkoutservice -> emailservice                 669
        checkoutservice -> paymentservice               669
        frontendservice -> checkoutservice              669
```

RE2-TT graphs are cyclic in 78 of 90 cases. Observed 2-cycles include
(ts-travel2-service, ts-seat-service) and
(ts-seat-service, ts-travel-service).

## 8. Root cause reachability, a hard ceiling

```
+---------+---------------------------+
| SYSTEM  | RC PRESENT IN MINED GRAPH |
+---------+---------------------------+
| RE2-OB  |          90 / 90          |
| RE2-TT  |          72 / 90          |
+---------+---------------------------+
```

All 18 RE2-TT failures are ts-auth-service. It emits about 10,000 spans
per case but every one is either a trace root (null parent) or parented by
another ts-auth-service span. It therefore has no cross-service edge and
A.1's mining never adds it as a node. It is traced in 90 of 90 cases and
absent from the graph in 90 of 90 cases.

If the candidate set is restricted to mined graph nodes, those 18 cases
score zero by construction.

## 9. Hard versus easy, per Appendix A.4

Computed on `latency-90`, mean of post-injection over mean of
pre-injection, per service. Easy means the annotated root cause IS the
worst-degraded service.

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

This reproduces Fang et al. (arXiv 2510.04711) on this benchmark: most
public benchmark cases are the easy kind.

Consequence, and it is the single most important number in this document:
the naive rank-by-worst-symptom control scores

```
+-----------+--------+--------+
| SYSTEM    | TOP-1  | TOP-3  |
+-----------+--------+--------+
| RE2-OB    | 80.0%  | 93.3%  |
| RE2-TT    | 77.8%  | 90.0%  |
| COMBINED  | 78.9%  | 91.7%  |
+-----------+--------+--------+
```

That is the bar H4 has to clear.
