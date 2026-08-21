# Pre-registration: CIRCA good-faith configuration check

Written and committed BEFORE the tuned run. Date 2026-08-21.

## Why this runs

The paper reports CIRCA at 6/180 = 3.3 percent top-1, below a uniform
random floor of 11/180 = 6.1 percent, at RCAEval defaults. That finding is
vulnerable to the obvious reviewer objection that CIRCA was misconfigured.
A finding that survives a good-faith configuration attempt is stronger than
one that does not, and this check cuts AGAINST our own reported result,
which is the direction worth testing.

## What was checked before choosing a configuration

Two candidate explanations for the low score were inspected in source
before running anything.

**1. The hardcoded dataset argument. NOT a misconfiguration.**
`RCAEval/e2e/circa.py` calls `pc_default(pc_input, dataset="ob")` with
`"ob"` hardcoded regardless of the `dataset` kwarg the caller passes. This
looks like a bug that would penalise Train Ticket. It is inert:
`pc_default(data, show_progress=False, with_bg=False, **kwargs)` accepts
`dataset` into `**kwargs` and never reads it. Nothing downstream branches
on it. No configuration change is available here. [Strong, read at source.]

**2. `dk_select_useful`, the only real knob.** CIRCA reads
`kwargs.get("dk_select_useful", False)`. This is RCAEval's own
domain-knowledge column selector and is the documented alternative
preprocessing path. It is the configuration under test.

## The configuration under test, fixed now

```
circa(data, inject_time=inject_time, dataset=<system>,
      dk_select_useful=True)
```

**One configuration. Not a sweep.** Chosen because it is the only
documented alternative in the shipped package, and chosen BEFORE seeing
what it scores.

**Explicitly forbidden, because it is the failure mode this paper is
about:** selecting a configuration by its ground-truth score. No sweep, no
best-of, no post hoc selection. If this one configuration scores worse
than the default, that is the reported result.

## What is already known to be wrong with the selector

`RCAEval/io/time_series.py:select_useful_cols` keeps a column if it is
time, or ends with `_cpu` or `_mem` with standard deviation above 1, or
contains the substring **`lat50`**.

The canonical per-service latency columns in RE2 are named
`{service}_latency-50` and `{service}_latency-90`. Neither contains the
substring `lat50`. RCAEval's own `read_data` additionally drops
`latency-50` and renames `latency-90` to `latency`.

**Consequence, predicted in advance:** `dk_select_useful=True` will select
CPU and memory columns only and will drop every latency column. This is
recorded now so that whatever the run returns cannot be presented as a
discovery afterwards. [Strong, read at source.]

## Metric and reporting

- Top-1 and top-3 at service granularity, same mapping as the main run
  (longest matching service prefix), same 180 cases, same exclusions.
- Wilson 95 percent intervals.
- Reported against both the default-configuration CIRCA score and the
  random floor.

## Interpretation, fixed in advance

```
+--------------------------------------+----------------------------------+
| OUTCOME                              | CONSEQUENCE FOR THE PAPER        |
+--------------------------------------+----------------------------------+
| Tuned CIRCA still at or below the    | Finding 5.2 STANDS and is        |
| random floor                         | strengthened. Report both        |
|                                      | configurations.                  |
+--------------------------------------+----------------------------------+
| Tuned CIRCA materially above the     | Finding 5.2 is WITHDRAWN as      |
| random floor                         | written and replaced with the    |
|                                      | tuned score. The default-config  |
|                                      | score is reported as a           |
|                                      | packaging or documentation       |
|                                      | issue, not a method failure.     |
+--------------------------------------+----------------------------------+
| Tuned CIRCA errors or returns no     | Reported as a third              |
| ranking                              | reproducibility finding, not as  |
|                                      | a score.                         |
+--------------------------------------+----------------------------------+
```

Committed before the run. Result reported whichever way it falls.
