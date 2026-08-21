# Pre-registration: epsilon-Diagnosis output-cap check

Written and committed BEFORE the run. Date 2026-08-21.

## Why this runs

The paper reports epsilon-Diagnosis at 11/180 = 6.1 percent top-1, level
with a random floor, and attributes the low score partly to it emitting "at
most three services" (median 3, maximum 3, zero in 7 of 180). That
observation is currently framed as a property of the method.

CIRCA's low score turned out to be a configuration default rather than a
method failure. The same scrutiny is owed to epsilon-Diagnosis before any
claim about it is published.

## What the source audit found

**1. The three-service cap is a LIBRARY DEFAULT, not a property of the
method. [Strong, read at source.]**

`pyrca/analyzers/epsilon_diagnosis.py`:

```
class EpsilonDiagnosisConfig(BaseConfig):
    :param root_cause_top_k: The maximum number of root causes in the results.

    alpha: float = 0.05
    bootstrap_time: int = 200
    root_cause_top_k: int = 3
```

and in `find_root_causes`:

```
root_cause_nodes = sorted(root_cause_nodes, key=...)[: self.config.root_cause_top_k]
```

**RCAEval never sets `root_cause_top_k`.** Verified by grep across the whole
package: the name appears nowhere in RCAEval. The wrapper constructs
`EpsilonDiagnosis.config_class(alpha=alpha)` and inherits pyrca's default of
3. The cap is documented as a limit on *reported results*, not as a modelling
parameter.

**2. RCAEval makes the significance test STRICTER than the library default.
[Strong, read at source.]** `alpha = float(os.getenv("E_ALPHA", 0.01))`
against pyrca's default of 0.05. The threshold is
`np.quantile(normal_correlations, q=1 - alpha)`, so a smaller alpha raises
the bar and admits fewer columns. RCAEval's 0.01 is five times stricter than
pyrca's default.

**3. No hardcoded dataset or system assumption.** Unlike `circa.py`, which
passes a hardcoded `dataset="ob"` into `pc_default` (inert, since it is never
read), `e_diagnosis` passes the caller's `dataset` through to `preprocess`
correctly.

**4. `dk_select_useful` is available and defaults to False**, exactly as in
CIRCA.

**5. No column-name matching defect in the wrapper itself.** The `lat50`
substring bug lives in `select_useful_cols`, which `e_diagnosis` only reaches
when `dk_select_useful=True`. At the default it is not involved.

## The configuration under test, fixed now

**One change. `root_cause_top_k` set to the number of candidate columns, so
the ranking is not truncated.** Everything else is held identical to
RCAEval's wrapper: `alpha = 0.01`, `dk_select_useful = False`, same
preprocessing, same intersect and length-trim logic.

```
model = EpsilonDiagnosis(config=EpsilonDiagnosis.config_class(
            alpha=0.01,
            root_cause_top_k=<number of candidate columns>))
```

**Why this change and not another.** The cap is a *reporting* limit, not a
model parameter. Truncating a ranking to three entries before computing a
ranking metric measures the truncation rather than the method. Removing it
changes no modelling decision, no threshold and no preprocessing.

**Explicitly NOT changed, and why.** `alpha` is left at RCAEval's 0.01 even
though it is stricter than pyrca's 0.05 and a looser value would likely admit
more candidates. Changing two things at once would be a sweep, and picking
the better of two alphas after seeing scores is the failure mode this paper
documents. One change, chosen for a stated structural reason, before seeing
any score.

## Prediction, recorded in advance

**Top-1 should be LARGELY UNCHANGED.** The top-ranked service is determined
by the highest-scoring column, and truncation at 3 does not alter which
column ranks first. The same argument applies to top-3 at service
granularity whenever at least three of the surviving columns map to distinct
services.

**The cap should matter mainly for coverage.** Specifically for the 7 of 180
cases that yielded zero rankable services, and for whether the true root
cause appears anywhere in the ranking at all, currently 27 of 180.

This prediction is written down so that whatever the run returns cannot be
presented as a discovery afterwards. If top-1 moves materially, the
prediction was wrong and that is reported.

## Metric and reporting

Top-1 and top-3 at service granularity, same longest-prefix mapping, same
180 cases, same exclusions as the main run. Wilson 95 percent intervals.
Reported against both the default-configuration score and the random floor.

## Interpretation, fixed in advance

```
+--------------------------------------+----------------------------------+
| OUTCOME                              | CONSEQUENCE                      |
+--------------------------------------+----------------------------------+
| Uncapped score materially above the  | Finding 5.3 WITHDRAWN as written |
| random floor                         | and replaced with the uncapped   |
|                                      | score. Logged as C-2.            |
+--------------------------------------+----------------------------------+
| Uncapped score still at or near the  | Finding 5.3 STANDS, but the      |
| random floor                         | "at most three services" clause  |
|                                      | is REMOVED regardless, because   |
|                                      | the audit already established it |
|                                      | is a library default and not a   |
|                                      | property of the method.          |
+--------------------------------------+----------------------------------+
| Errors or no ranking                 | Reported as a further            |
|                                      | reproducibility finding.         |
+--------------------------------------+----------------------------------+
```

**Note that the second row still costs the paper a claim.** The audit alone
falsifies the "at most three services" framing whatever the score does.

Result reported whichever way it falls.
