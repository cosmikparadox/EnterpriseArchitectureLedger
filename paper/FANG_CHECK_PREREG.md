# Pre-registration: the control on the Fang et al. benchmark

Written and committed BEFORE any scoring code touches this data.
Date 2026-08-21.

**This is a gating check. It can end the paper. That is why it runs first
and why the kill condition is a number written down before any result is
seen.**

## 1. The dataset

```
Paper     Fang, Zhang, Yang, Wu, Xu, Wang, Wang, Wang, Lu, He.
          "Rethinking the Evaluation of Microservice RCA with a
          Fault Propagation-Aware Benchmark". arXiv 2510.04711.
          Accepted FSE 2026.

Data      Zenodo DOI 10.5281/zenodo.17105974
          Published 2025-09-12, CC-BY-4.0, open, no login.
          rcabench-absolute_anomaly.tar.gz     13.445 GB
          rcabench-fse-26.zip                   0.001 GB  (code)
          rcabench-platform-feat-fse26.zip      0.001 GB  (code)

Project   operationspai.github.io/revisiting-rca-evaluation/
```

**Obtainable: YES.** Confirmed by fetching the Zenodo API record and by a
byte-range probe of the tarball that listed real datapack directories.

## 2. Structure, established before writing scoring code

From the platform source (`rcabench-platform-feat-fse26.zip`,
`src/rcabench_platform/v2/graphs/sdg/build_/rcabench.py`) and from a 60 MB
byte-range probe of the tarball.

The tarball is a flat collection of datapacks. Each is one fault case:

```
{system}-{service}-{faulttype}-{hash}/
    env.json                            time ranges
    injection.json                      injection spec
    conclusion.parquet
    normal_traces.parquet               pre-injection
    abnormal_traces.parquet             post-injection
    normal_metrics.parquet              pre-injection
    abnormal_metrics.parquet            post-injection
    normal_metrics_histogram.parquet
    abnormal_metrics_histogram.parquet
    normal_metrics_sum.parquet
    abnormal_metrics_sum.parquet
    normal_logs.parquet
    abnormal_logs.parquet
```

Observed datapack names include `ts5-ts-order-service-stress-svfvxk`,
`ts2-ts-consign-service-stress-b7twdg`,
`ts1-ts-inside-payment-service-stress-lp6wwg`.

**The data is already split into normal and abnormal.** No comparison
against an injection timestamp is required: the pre and post windows are
separate files. Trace columns include `service_name` and `duration`
(cast to Float64 by the platform's own loader).

## 3. The control, and the one adaptation, declared now

The control on RE2 was:

```
score(s) = mean( {s}_latency-90 | post ) / mean( {s}_latency-90 | pre )
```

**`latency-90` does not exist in this dataset.** Its metrics are
OpenTelemetry-style (`jvm.system.cpu.load_1m` and similar), not RCAEval's
`{service}_latency-90`. A literal transplant is impossible.

**The adaptation, fixed now.** The control is computed on per-service span
duration from the trace files, which is the same construct (worst latency
degradation, post over pre) on the latency measure this dataset actually
carries:

```
PRIMARY
  score(s) = p90( duration | abnormal_traces, service_name = s )
           / p90( duration | normal_traces,   service_name = s )
  rank descending, worst-rank tie-breaking

SECONDARY, reported alongside, never alone
  the same with mean() in place of p90()
```

p90 is primary because RE2's `latency-90` is a 90th percentile, so p90 is
the closer analogue. Both are reported so the choice cannot be made after
seeing which scores better.

**This adaptation is a threat to validity and is reported as one.** A
difference in result between the two benchmarks may reflect the change of
latency measure rather than a change of benchmark difficulty. The mean
variant is reported precisely so a reader can see how much the choice
moves the number.

## 4. Ground truth

The root cause service is taken from `injection.json` where it names a
service, and otherwise parsed from the datapack directory name, which
encodes `{system}-{service}-{faulttype}-{hash}`. Whichever source is used
is recorded per case in the output. If the two disagree on any case, the
disagreement count is reported and `injection.json` wins.

Scoring is at SERVICE granularity, matching the RE2 evaluation. The
paper's hierarchical code-level labels are NOT used; only the service
level is scored. This is a narrowing and is reported as one.

## 5. Metric

Top-1 and top-3 accuracy at service granularity. Wilson 95 percent
intervals on every rate. No point estimate without its interval.

## 6. Exclusions, fixed now

```
+-----------------------------------------+---------------------------+
| CONDITION                               | ACTION                    |
+-----------------------------------------+---------------------------+
| Datapack lacks normal_traces.parquet or | EXCLUDE, counted and      |
| abnormal_traces.parquet                 | reported                  |
+-----------------------------------------+---------------------------+
| Root cause service absent from the      | INCLUDE, scored as a MISS.|
| traced services in that case            | Never dropped.            |
+-----------------------------------------+---------------------------+
| Fewer than 2 traced services with       | EXCLUDE, counted and      |
| duration data in either window          | reported                  |
+-----------------------------------------+---------------------------+
| Datapack lacking a `.finished` marker   | EXCLUDE, counted and      |
|                                         | reported                  |
+-----------------------------------------+---------------------------+
```

No exclusion may be added after seeing a result. Every excluded case is
counted and the count appears in the report. If exclusions exceed 20
percent of datapacks, the whole check is reported as unreliable regardless
of the score.

## 7. THE KILL NUMBER, written before any result is seen

The control scores **78.9 percent top-1 on RE2** (142/180).

```
+--------------------------------+------------------------------------+
| CONTROL TOP-1 ON FANG ET AL.   | VERDICT FOR THE PAPER              |
+--------------------------------+------------------------------------+
| >= 50 percent                  | STRONGER. The claim generalises    |
|                                | beyond RE2 to a benchmark built    |
|                                | to be hard. This becomes a         |
|                                | headline result, not a check.      |
+--------------------------------+------------------------------------+
| 25 to 50 percent                | INTACT BUT NARROWED. The control   |
|                                | degrades on a harder benchmark,    |
|                                | which is what a harder benchmark   |
|                                | is for. The RE2 finding stands as  |
|                                | a finding about RE2. Report both.  |
+--------------------------------+------------------------------------+
| < 25 percent                   | WEAKER, POSSIBLY DEAD. Fang et al. |
|                                | have already built the benchmark   |
|                                | that fixes the problem we document.|
|                                | Our contribution shrinks to a      |
|                                | reproducibility note on RCAEval,   |
|                                | and the paper must be reframed or  |
|                                | abandoned. THIS IS THE KILL.       |
+--------------------------------+------------------------------------+
```

**25 percent is the kill threshold.** It is chosen as roughly the SOTA
top-1 that Fang et al. themselves report on their benchmark (0.21). A
trivial control that cannot beat published state of the art on a hard
benchmark is not evidence that trivial controls rival state of the art.

## 8. Commitment

The result is reported whichever way it falls, in the outline and in any
paper drawn from it. **A collapse is reported in the abstract, not buried
in a limitations section.** If the control scores below 25 percent, the
outline is rewritten to say the paper is weakened or dead, in those words,
before anything else is drafted.

## 9. Reproducibility

```
Master seed        20260820 (the control is deterministic; the seed
                   affects nothing in this check and is recorded only
                   for the tie-breaking audit trail)
Tie-breaking       worst-rank, deterministic
Code               committed and hashed BEFORE the run, hash recorded
                   in section 10 below
```

## 10. FREEZE RECORD

```
Pre-registration commit   recorded on commit, see git log for this file
Scoring code commit       PENDING, recorded before the run
```
