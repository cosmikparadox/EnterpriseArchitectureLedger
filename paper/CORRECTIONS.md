# Corrections

Findings that were withdrawn or changed after they were first written down.
Logged, never silently edited. Each entry states what was claimed, what the
check found, and what replaces it.

---

## C-1  CIRCA below the random floor: WITHDRAWN as written

**Date** 2026-08-21.
**Preregistration** `paper/CIRCA_TUNING_PREREG.md`, commit `9127c37`.
**Scoring code** `src/run_circa_tuned.py`, committed before the run.

### What was claimed

That CIRCA scores 6/180 = 3.3 percent top-1, below a uniform random floor
of 11/180 = 6.1 percent, and that this is a finding about the method as
shipped.

### What the check found

One configuration was preregistered before running: `dk_select_useful=True`,
RCAEval's own documented domain-knowledge column selector, chosen because it
is the only documented alternative in the shipped package and chosen before
seeing what it scores. No sweep and no ground-truth selection.

```
+--------------------+-----------+---------+------------------+
| CONFIGURATION      |  TOP-1    |   RATE  | WILSON 95% CI    |
+--------------------+-----------+---------+------------------+
| CIRCA default      |   6/180   |   3.3%  | [1.5%, 7.1%]     |
| Random floor       |  11/180   |   6.1%  | [3.4%, 10.6%]    |
| CIRCA dk_select    |  76/180   |  42.2%  | [35.2%, 49.5%]   |
+--------------------+-----------+---------+------------------+

paired, tuned against default: b = 73, c = 3
top-3: 102/180 = 56.7% [49.4%, 63.7%]
ran without error on 180/180; produced a usable ranking on 158/180
median columns retained by the selector: 9 (maximum observed 339)
```

**A twelve-fold improvement from one documented flag.** The tuned
configuration clears the random floor with non-overlapping intervals.

### What replaces it

Per the preregistered interpretation table, the finding is **withdrawn as
written**. The replacement claim is narrower and is about packaging rather
than about the method:

> CIRCA's default configuration in RCAEval scores below a random floor
> (3.3 percent against 6.1 percent). Enabling `dk_select_useful`, a
> documented flag that is off by default, raises it to 42.2 percent. The
> defect is that the default configuration is not the working one, which is
> a packaging and documentation issue, **not evidence that the method is
> wrong**.

CIRCA remains below the control (78.9 percent) and below nsigma (72.2) and
BARO (70.6) even when tuned, so the paper's claim that the control beats
every baseline tested survives. It survives with CIRCA at 42.2 percent
rather than 3.3, and the tuned figure is the one that belongs in the
headline table.

### Why this was run

Because it cut against our own result. A finding that survives a good-faith
configuration attempt is worth more than one that does not, and this one did
not survive in its original form. Running it was the point.

### One prediction that held, and did not help

The preregistration predicted, from source, that `select_useful_cols` would
discard every latency column, because it matches on the substring `lat50`
while the canonical columns are named `latency-50` and `latency-90`. That
held: the median retained column count is 9, against 339 at the maximum.
The selector throws away almost everything, including all latency signal,
**and the score improves twelve-fold anyway.** Recorded because it was
predicted in advance and because it is the opposite of what the prediction
implied would happen.
