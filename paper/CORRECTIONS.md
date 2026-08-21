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

---

## C-2  epsilon-Diagnosis "emits at most three services": WITHDRAWN as a property of the method

**Date** 2026-08-21.
**Preregistration** `paper/EDIAG_TUNING_PREREG.md`, commit `9d60431`.
**Scoring code** `src/run_ediag_uncapped.py`, commit `ddf1bed`, before the run.

### What was claimed

That epsilon-Diagnosis "ranks at most 3 services (median 3, max 3, zero in 7
cases), so its score reflects coverage, not only accuracy", framed as a
property of the method.

### What the source audit found

**The cap is a library default, not the method.** [Strong, read at source.]

`pyrca/analyzers/epsilon_diagnosis.py`:

```
:param root_cause_top_k: The maximum number of root causes in the results.
root_cause_top_k: int = 3
...
root_cause_nodes = sorted(...)[: self.config.root_cause_top_k]
```

**RCAEval never sets it.** The name does not appear anywhere in the RCAEval
package; the wrapper builds `config_class(alpha=alpha)` and inherits pyrca's
3. The parameter is documented as a limit on *reported results*, not as a
modelling choice.

Two further audit findings, neither of which explains the score:

- RCAEval sets `alpha = 0.01` against pyrca's default `0.05`, making the
  significance test five times stricter than the library default. Left
  unchanged in this check by design, one variable at a time. Now open item 8.
- No hardcoded dataset (unlike `circa.py`) and no column-name matching defect
  in the wrapper itself.

### What the run found

One preregistered change: `root_cause_top_k` set to the candidate column
count, so the ranking is not truncated. Everything else identical.

```
+--------------------+-----------+---------+------------------+---------+
| CONFIGURATION      |  TOP-1    |   RATE  | WILSON 95% CI    |  TOP-3  |
+--------------------+-----------+---------+------------------+---------+
| e-Diag default     |  11/180   |   6.1%  | [3.4%, 10.6%]    |  15.0%  |
| e-Diag UNCAPPED    |  11/180   |   6.1%  | [3.4%, 10.6%]    |  17.8%  |
| Random floor       |  11/180   |   6.1%  | [3.4%, 10.6%]    |  16.7%  |
+--------------------+-----------+---------+------------------+---------+

paired top-1: b = 0, c = 0. The two configurations are IDENTICAL
              case by case at top-1.
paired top-3: b = 5, c = 0.

services ranked: median 3 -> median 16 (max 28)
columns ranked : median 3 -> median 104 (max 225)
root cause found anywhere: 27/180 -> 178/180
cases yielding zero rankable services: 7 -> 0
```

### What replaces it

Per the preregistered interpretation table, second row, **the score stands
and the framing is withdrawn.**

> epsilon-Diagnosis scores 6.1 percent top-1, level with a uniform random
> floor, and 17.8 percent top-3 against the floor's 16.7 percent. Removing
> the output cap does not change top-1 on a single case. **The earlier claim
> that it "emits at most three services" described a pyrca library default
> that RCAEval leaves unset, not a property of the method, and is
> withdrawn.** Uncapped it ranks a median of 16 services drawn from 104
> metric columns, and locates the true root cause somewhere in its ranking
> in 178 of 180 cases rather than 27.

The finding is now cleaner and narrower: the method's ranking is close to
uninformative on this benchmark at top-1, and that is not an artefact of a
truncated output.

### The prediction held

The preregistration predicted, before the run, that top-1 would be largely
unchanged because truncation at 3 cannot alter which candidate ranks first,
and that the effect would fall on coverage. **Top-1 was not merely similar
but identical on all 180 cases, and coverage moved from 27 to 178.** The
prediction is recorded as having held, which is the only reason this outcome
is not presentable as a discovery.

### Difference from C-1

C-1 changed a score twelvefold and forced a claim to be rewritten. C-2
changes no score at all and still costs a claim. **"We audited it and the
number did not move" is a result**, and the reason the audit was worth doing
is that the clause it removed was wrong regardless of the number.
