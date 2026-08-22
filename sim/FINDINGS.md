# Internal consistency stress tests: findings

**Run date** 22 August 2026.
**Status** Experiment 1 complete. Experiments 2 and 3 not started.
Experiment 4 blocked. Working document, not canonical, not for publication.

**Reproduce everything** with `python -m sim.exp1_decomposition`,
`python -m sim.exp1_thresholds`, `python -m sim.exp1_risk_ceiling`.
Estate seed 20260822 throughout. Every other seed is named in the code.

---

## 1. KILL CONDITIONS

```
+------+-------------------------------------------+--------------------+
| K1   | adversarial max-min spread on per-use-case | FIRED, CONDITIONAL |
|      | unit cost exceeds 100% of reference        |                    |
+------+-------------------------------------------+--------------------+
| K2   | Kendall tau between structurally motivated | NOT FIRED          |
|      | partitions falls below 0.5                 | anywhere tested    |
+------+-------------------------------------------+--------------------+
| K3   | if either fires ONLY at high fixed-to-     | APPLIES to K1 on   |
|      | variable ratio, that is a scope condition  | the median reading |
+------+-------------------------------------------+--------------------+
```

**K1 fires, but not for the reason the hypothesis assumed.** The sensitivity
is carried entirely by the declared fixed-cost allocation basis, which the
canon leaves unspecified. Under the basis used in the canon's own worked
example the sensitivity is exactly zero. Under a two-stage subdomain basis it
is large. H11 therefore does not have one answer. It has one answer per
allocation convention, and the canon does not choose between them.

**K2 does not fire and this is the more important of the two.** The brief
states that rank stability matters more than value stability. Ranks were
stable in every configuration tested. The lowest Kendall tau observed anywhere,
across seven fixed-cost ratios, five seeds, four overlap settings and four
subdomain counts, was 0.667 against a threshold of 0.50.

---

## 2. RESULTS BY EXPERIMENT

### 2.1 Source retrieval

```
+------------------------------+----------+----------+--------+---------+
| FILE                         | DRIVE    | DECODED  | STATUS | GRADE   |
+------------------------------+----------+----------+--------+---------+
| Part_IX_Mathematics_v3_1c.md |  128,723 |  128,723 | MATCH  | Strong  |
| Canonical_Thesis_v2_1c.md    |  142,078 |  142,078 | MATCH  | Strong  |
+------------------------------+----------+----------+--------+---------+
```

Retrieved with `download_file_content`, base64 decoded, byte count checked
against Drive `fileSize`. Sections read in full: Part IX 9.1, 9.2, 9.3.1 to
9.3.9, 9.4, 9.5, 9.7, 9.8.3 to 9.8.5, 9.10, 9.11.5, 9.14, 9.16; Thesis 6.1
to 6.5.

### 2.2 Ledger implementation self-check

Before any experiment, the implementation was checked against the canonical
worked example at 9.10.

```
+---------------------------------------+-----------+-----------+--------+
| QUANTITY, canon 9.10 frequency block  | CANON     | COMPUTED  | GRADE  |
+---------------------------------------+-----------+-----------+--------+
| k = beta = EPV/VHM, in YEARS          |     2.333 |     2.333 | Strong |
| credibility weight Z                  |     0.600 |     0.600 | Strong |
| posterior mean, Bayesian route        |    0.2434 |    0.2434 | Strong |
| posterior mean, credibility route     |    0.2434 |    0.2434 | Strong |
| the two routes agree exactly          |  required |  to 1e-12 | Strong |
+---------------------------------------+-----------+-----------+--------+
```

9.3.2 calls that exact agreement "the check" and says an implementation
producing two different numbers has a bug. It does not.

Also verified: `sum over u of b_u(n) = 1` over the consumers of every node,
for all three allocation bases, which is the accounting identity 9.8.3 result
one describes as "produced by the declaration, not a measurement".

### 2.3 Experiment 1, the governing result

```
+---------------------------------+------------------------+---------+
| DECLARED FIXED BASIS b_u(n)     | SENSITIVITY TO         | GRADE   |
|                                 | THE PARTITION          |         |
+---------------------------------+------------------------+---------+
| equal split across consumers    | EXACTLY ZERO           | Strong  |
| the basis in canon 9.10         | max abs dev 0.000e+00  |         |
|                                 | CV 3.1e-17, machine eps|         |
+---------------------------------+------------------------+---------+
| driver proportional             | EXACTLY ZERO           | Strong  |
+---------------------------------+------------------------+---------+
| two-stage: subdomain first,     | LARGE. median spread   | Strong  |
| then use case within subdomain  | 0.70 at phi=0.35,      |         |
|                                 | worst use case 2.00    |         |
+---------------------------------+------------------------+---------+
```

The mechanism is visible in the arithmetic. At a node with C consumers, the
two-stage basis gives `b = 1/(subdomains touching n) / (members of this
subdomain touching n)`. A use case alone in its subdomain at a node shared by
eighteen use cases receives `1/2` of that node's fixed pool. The same use case
grouped with the other seventeen receives `1/18`. That is a nine times lever,
available to whoever draws the boundary, and it is largest exactly at the
high fan-in nodes where 9.2.6 already says the cost figure is least
trustworthy.

### 2.4 Experiment 1, K1 by reading

```
+--------------------------------------+-------------------------+--------+
| READING OF "the adversarial spread"  | phi WHERE IT HITS 100%  | GRADE  |
+--------------------------------------+-------------------------+--------+
| WORST use case in the estate         | phi = 0.134             | Strong |
| MEDIAN use case                      | phi = 0.547             | Strong |
+--------------------------------------+-------------------------+--------+
```

The worst-case reading is the one that bounds manipulation, and it fires at
ordinary fixed-cost ratios. At phi = 0.35 at least one use case exceeded 100
percent in every robustness run without exception.

All adversarial figures are LOWER BOUNDS. The search is local hill climbing
with restarts over a space of 5^24 partitions. It is not exhaustive and the
true spread is at least as large as reported.

### 2.5 Experiment 1, K2

```
+---------------------------------------------+---------+---------+
| KENDALL TAU, structurally motivated family  | VALUE   | GRADE   |
+---------------------------------------------+---------+---------+
| lowest pair at phi=0.35                     |  0.754  | Strong  |
|   by_customer_journey vs by_deployment_unit |         |         |
| lowest observed at any phi (0.80)           |  0.623  | Strong  |
| lowest observed ANYWHERE in the whole sweep |  0.667  | Strong  |
| K2 threshold                                |  0.50   |         |
+---------------------------------------------+---------+---------+
```

Values move substantially while ordering barely moves. Perturbing eight of
twenty four use cases across boundaries gives a coefficient of variation of
0.171 and a Kendall tau still at 0.863.

### 2.6 Experiment 1, controls

```
+-------------------------------+-----------------------------+---------+
| CONTROL                       | RESULT                      | GRADE   |
+-------------------------------+-----------------------------+---------+
| variable pool, metered causal | spread 0.002 as phi -> 0,   | Strong  |
| driver                        | tau 1.000. Confirms 9.2.6   |         |
|                               | numerically.                |         |
+-------------------------------+-----------------------------+---------+
| MC(u_new), flexibility        | invariant. 9.4 defines it   | Strong  |
|                               | against G and never reads   |         |
|                               | the partition.              |         |
+-------------------------------+-----------------------------+---------+
| risk, ceiling not binding     | tau 1.000, but this is a    | Strong  |
|                               | CONSTRUCTION ARTEFACT and   | as an   |
|                               | not a finding. See 4.1.     | artefact|
+-------------------------------+-----------------------------+---------+
```

### 2.7 Experiment 1, risk axis in the binding regime

```
+-------+-----------+-----------------+----------+----------+---------+
| kappa | bind rate | entries refused | tau mean | tau P99  | GRADE   |
+-------+-----------+-----------------+----------+----------+---------+
|  6.00 |   0.0024  |      0 of 24    |  1.000   |  1.000   | Strong  |
|  2.00 |   0.0246  |      3 of 24    |  0.986   |  0.993   | Strong  |
|  1.00 |   0.0737  |      7 of 24    |  0.957   |  0.876   | Strong  |
|  0.50 |   0.1626  |     12 of 24    |  0.928   |  0.637   | Strong  |
|  0.25 |   0.2782  |     18 of 24    |  0.826   |  0.492   | Strong  |
|  0.12 |   0.3777  |     23 of 24    |  0.775   |  0.459   | Strong  |
+-------+-----------+-----------------+----------+----------+---------+
```

**Read this as a point in the framework's favour.** By the time decomposition
choice breaks the risk ranking, at kappa = 0.25 where tau on P99 falls to
0.492, the ceiling is binding in 27.8 percent of simulations and canon 9.3.4's
one percent refusal rule has already refused 18 of 24 entries. The refusal
condition fires long before the axis becomes decomposition sensitive. The
framework declines to report exactly where reporting would have been unsafe.

---

## 3. PARAMETER SENSITIVITIES

Where the result holds and where it breaks. All at the two-stage basis, since
under the other two bases there is nothing to sweep.

```
+-------------------------+------------------+------------------+---------+
| SWEPT AT phi = 0.35     | MEDIAN SPREAD    | WORST SPREAD     | TAU MIN |
+-------------------------+------------------+------------------+---------+
| seed 20260822           |      0.703       |      2.002       |  0.754  |
| seed 7                  |      0.726       |      2.093       |  0.884  |
| seed 101                |      1.329       |      2.384       |  0.833  |
| seed 2718               |      0.988       |      4.584       |  0.819  |
| seed 31415              |      0.741       |      3.508       |  0.913  |
+-------------------------+------------------+------------------+---------+
| overlap 0.15            |      0.502       |      1.209       |  0.899  |
| overlap 0.35            |      0.691       |      1.925       |  0.804  |
| overlap 0.65            |      0.983       |      2.550       |  0.819  |
| overlap 0.90            |      0.972       |      4.777       |  0.667  |
+-------------------------+------------------+------------------+---------+
| 3 subdomains            |      0.760       |      4.093       |  0.703  |
| 5 subdomains            |      0.703       |      2.002       |  0.754  |
| 8 subdomains            |      0.802       |      1.780       |  0.739  |
| 12 subdomains           |      0.735       |      1.331       |  0.717  |
+-------------------------+------------------+------------------+---------+
```

Full fixed-ratio sweep:

```
+-------+---------------+--------------+----------------+-------+
| phi   | median spread | worst spread | struct tau min |  CV   |
+-------+---------------+--------------+----------------+-------+
| 0.05  |     0.097     |    0.593     |     0.949      | 0.028 |
| 0.10  |     0.195     |    0.869     |     0.913      | 0.051 |
| 0.20  |     0.394     |    1.363     |     0.848      | 0.092 |
| 0.35  |     0.703     |    2.002     |     0.754      | 0.144 |
| 0.50  |     0.940     |    2.713     |     0.688      | 0.189 |
| 0.65  |     1.156     |    3.541     |     0.645      | 0.230 |
| 0.80  |     1.427     |    4.375     |     0.623      | 0.271 |
+-------+---------------+--------------+----------------+-------+
```

**What makes it worse.** Higher fixed-cost ratio, monotonically. Higher
overlap between use cases, which is the shared-infrastructure case. Fewer
subdomains, which raises the worst-case lever while barely moving the median.

**What makes it go away.** A partition-independent fixed basis, which removes
it exactly rather than reducing it. A low fixed ratio: below phi = 0.134 no
use case in this estate can be moved by 100 percent even adversarially.

**What never breaks.** The ranking. No configuration tested brought Kendall
tau near 0.50.

---

## 4. FAILURES, INCONCLUSIVE RESULTS, AND THINGS THAT CONTRADICTED EXPECTATION

### 4.1 A control that was reported as a finding and should not have been

The first risk-axis run returned Kendall tau of exactly 1.000 at every fixed
ratio, which looks like a strong invariance result. It is not a result at all.
In this construction the subdomain ceiling is the ONLY channel through which
the declared partition reaches the risk axis, and at the default ceiling the
bind rate is 0.24 percent, so the ceiling never operates. The invariance was a
property of my construction, not of the framework. Section 2.7 re-runs it in
the regime where the ceiling actually binds. Recorded here rather than quietly
replaced.

### 4.2 The hypothesis as posed cannot be answered

H11 asks whether the declared decomposition determines the ledger. On the
evidence here the honest answer is that the question is underspecified. The
ledger's sensitivity to the decomposition ranges from exactly zero to a nine
times lever depending on a convention the canon never states. That is not a
finding about decompositions. It is a finding about a gap in the specification.

### 4.3 Expectation contradicted

I expected value instability and rank instability to travel together. They do
not. At phi = 0.80 the coefficient of variation across structural partitions
is 0.271 while Kendall tau is still 0.623. The reason is that the two-stage
lever acts most strongly on high fan-in nodes, which are shared by most use
cases, so it moves most entries in the same direction at once. A common-mode
shift changes levels and leaves order alone.

### 4.4 Not established

Nothing here says anything about real estates. Synthetic graph, my generator,
my cost model, my ceiling rule. The permitted verbs apply: these results are
consistent with the framework's own claims at 9.2.6 and 9.3.4, they fail to
contradict them, and they bound the size of one specific exposure.

---

## 5. DISCREPANCIES BETWEEN THE BRIEF AND THE CANONICAL SOURCES

### D1. Experiment 4 is blocked. The derivation is absent. [Strong]

```
+---------------------------------+-----------------------------------+
| BRIEF SECTION 9.1 DESCRIBES     | SOURCES CONTAIN                   |
+---------------------------------+-----------------------------------+
| a growth option whose underlying| Nothing of the kind. 9.5 values   |
| is DEMAND for use cases not yet | exactly one object:               |
| arrived, volatility from an     |   OC(d) = W(K_rev,T) - W(K_com,T) |
| observed volume series, cost leg|   E[max(dV e^-uT - K e^-rT, 0)]   |
| the metered marginal cost of the| The underlying is dV, the benefit |
| next use case                   | of being able to SWITCH.          |
+---------------------------------+-----------------------------------+
```

Thesis 6.2 names exactly two value instruments and there is no third. Zero
hits across all 270,801 bytes for `growth option`, `demand for use cases`,
`not yet arrived`, `net option value`, `technical potential`. The thirteen
apparent `NOV` hits in Part IX are all substrings of `novelty`, `novel` and
`November`.

Second blocker on the same experiment: Baldwin and Clark equation 10.7 is not
in either source either. They appear in the Thesis only as prior-art citations
for E4. `Design Rules` is not in the working folder and is not otherwise
available in this session, so the brief's transcription of the equation cannot
be checked against the book, and implementing it would mean reporting an
unverified transcription as if it were the published method.

### D2. The brief is wrong that "materially" is unquantified. [Strong]

Brief section 8.2 says the word needs replacing with a number. The canon
already carries the number in three places:

```
9.5.5    "inflated the figure by roughly sixteen percent"
9.14 G2  "Example fell 327k to 281k"
9.10     "GBP 326,782, an overstatement of about 16 percent"
```

This makes experiment 3.2 a stronger test than designed. It becomes a
reproduction that can fail against 326,782 and 281,457, rather than a
measurement with no target.

### D3. The brief contradicts the canon on the cost driver. Source wins. [Strong]

Brief section 5.3 says the variable pool is allocated "in proportion to
observed calls". Canon 9.2.2 refuses that: "Request count is one candidate
driver, not the default. Two use cases making equal numbers of calls can
differ by an order of magnitude if one moves far more data." The generator
therefore carries a payload intensity separate from call count, and the driver
is not proportional to calls. Had it been, one of the channels by which
analyst choice enters would have been missing and experiment 1 would have been
biased optimistic.

### D4. The experiment 1 thresholds are the brief's, not the canon's. [Strong]

9.11.5 records H11 as `NOT YET WRITTEN` and says the comparison metric, the
materiality threshold and the sampling of analysts "are all unspecified".
Kendall tau below 0.5 and a 100 percent spread come from the brief. They were
pre-registered and held without adjustment, but they are not canonical and no
reader should be allowed to think they are.

### D5. A tension inside the canonical mathematics. For a correction ID.

Not fixed in place, per method rule 2.4.

```
Canon 9.10 worked example:
  "fixed share (declared equal split): 0.20" for node P serving five use
  cases. That is 1/5, equal across CONSUMERS, and partition-independent.

Thesis 6.1:
  "the boundaries it draws determine where cost pools are cut, where risk
  propagation is bounded and where option value is located."

Under the basis the worked example actually uses, boundaries do NOT determine
where cost pools are cut. The cost axis is exactly invariant to the
decomposition, to machine precision. The claim in Thesis 6.1 is true only
under a partition-dependent basis, which the canon never specifies and never
demonstrates.
```

This is not an arithmetic error. It is an unstated free parameter underneath a
load-bearing claim, and H11's answer flips completely depending on how it is
set. It is the single most consequential thing found in this run.

### D6. A near miss on the scope wall, recorded for visibility

Canon 9.1.1 and 9.3.6 route the cyclic non-monotone service call graph to a
continuous-time Markov chain, a stochastic Petri net, or a dynamic fault tree.
All three are dynamical processes on the graph and all three are prohibited by
brief section 3. They were not used and not approximated. Canon 9.3.5 and
correction G4 make common-cause conditioning the canonical treatment, which is
a static joint draw over a shared latent factor and sits inside the brief's
permitted list. That route was taken instead. Recorded because the canon does
name prohibited machinery and the choice should be visible rather than silent.

---

## 6. ANYTHING THE DESIGN NEEDED THAT SECTION 3 PROHIBITS

**Nothing.** No experiment so far has required a term modelling interaction
between nodes as a dynamical process, a spectral method, a self-exciting or
mutually-exciting point process, a stability or bifurcation analysis, a
statistical-mechanical formulation, or a path-integral or optimal-control
formulation.

The brief predicted this: "The ledger does not need any of the prohibited
machinery. If your design seems to, the design is wrong." That held for
experiment 1. Experiment 2 result two will need a joint loss position across
use cases, and the canon's own route for it, common-cause conditioning at
9.3.5 plus a tail-dependent copula at 9.3.8, is inside the permitted list.

---

## 7. OPEN QUESTION BLOCKING THE INTERPRETATION OF EXPERIMENT 1

Which fixed-cost allocation basis do real, pre-existing, independently owned
decompositions actually use?

```
+---------------------------------+------------------------------------+
| IF equal split across consumers | K1 is an artefact. The cost axis   |
| or driver proportional          | is exactly decomposition-invariant |
|                                 | and H11 does not bite on cost.     |
+---------------------------------+------------------------------------+
| IF two-stage by subdomain       | K1 is a genuine kill on the        |
|                                 | worst-case reading at any ordinary |
|                                 | fixed-cost ratio.                  |
+---------------------------------+------------------------------------+
```

The canon does not answer this and neither does the brief. It is the one input
that decides whether experiment 1 killed anything.
