# The Architecture Ledger: Formal Specification
## Part IX, the mathematics, v3.1c

**Companion to *The Architecture Ledger* (research paper v1.1c) and Canonical Thesis v2.1c.**
**The Numbers Explained is at v1.1a and does NOT yet carry these changes. It is stale as at this revision.**
Abhineet Asthana. August 2026. CC-BY 4.0.

> **v3.1c revises v3.1b in seven places and adds no new mathematics of its own invention.** Version 3.1b stated the aggregation limit, the declared status of the unit of account, and the answer to Durst's six barriers, and that work stands. What v3.1b did not carry is the consequence of reading the BitSight correlated-risk patent family at source. Every structural feature of section 9.3.5 and much of 9.3.8 appears in granted claims with a March 2018 priority date, and the aggregation limit at 9.8.3 has a second prior-art precedent that is a claim rather than a paragraph of prose. **No mathematics changes. The novelty position changes, and 9.16 is rewritten to say so.** Seven corrections are logged at 9.18 as S27 to S33.
>
> **One thing checked and found clean.** v3.1b was suspected of carrying the two wrong patent numbers published in the paper and thesis from v1.0. It does not. Part IX has never cited a patent number. The change below is additive rather than a repair, and that is recorded so the next reader does not re-check it.

---

## How to read this part

Every formula is followed by a line in plain English. Read only those lines and you still have the framework.

Ten rules hold throughout.

**Nothing here is a single number.** Every quantity is a distribution.

**Nothing here is invented.** Every method is borrowed and named, with its owner and its failure conditions in section 9.13.

**Where a quantity cannot be estimated honestly, the correct output is a refusal.** Section 9.9 says when.

**Where a method disagrees with its own literature, the literature wins.** This document has now been wrong three times by ignoring that rule.

**A method that cannot be checked against something outside itself does not belong here.** Two of the constructions below are self-verifying, meaning an independent derivation reproduces the same number. That property is worth more than elegance.

**A claim that something is absent must be checked against the primary literature of the field it is absent from.** The v3.0 error was not an unverified borrowing. It was a claim of novelty asserted without opening two books already in the reference list. Citing a source for one purpose is not reading it.

**New at v3.1c: a patent is a source and the same rule applies to it.** The framework cited a patent family by number from v1.0 and described it from a summary in every version thereafter. Reading the claims and the specification moved an element from partially occupied to occupied. **Cited is not read** covers patents, and a patent has two halves that must both be opened: the claims say what is owned, the specification says what was actually built.

**A quotation is a claim, and it needs checking exactly like any other.** During the assessment of Durst (2007), a model reading the source PDF returned a fluent, apposite, correctly-page-numbered German quotation that is not present verbatim in the text. The substance survived checking; the wording did not. Reasoning cannot catch this failure mode: a fabricated quotation is indistinguishable from a real one by inspection, and only a search of the source settles it.

**A structural detail is a claim too.** A count, a section number, an ordering, an assignee, a patent number. Reading a summary of a source, or a model's account of it, is not reading the source. Durst was described in three prior documents as identifying three barriers to direct valuation. Direct reading of the source establishes six. That error was published at v1.1a and v2.1a. In order learned: *unexamined is not unoccupied*, *cited is not read*, *summarised is not read*.

**Reading principle C1. A measurement that cannot be aggregated is still a measurement, but it is not a management system.** Section 9.8.3 establishes that the three axes do not sum, each for a different reason. That does not invalidate the per-use-case entry. It does mean this document specifies an instrument and not a control system, and any claim that the ledger yields an estate-level position is outside what the mathematics supports.

**Reading principle C2, new at v3.1c. A correct method carries no novelty by itself.** Sections 9.3.5, 9.3.8 and 9.5 are, as mathematics, unaffected by anything found at v3.1c. As positions in a field they are not. Where a construction below is also recited in a granted claim, that is stated at the point of use, because a reader who takes the mathematics as evidence of originality will be wrong and this document should not let them be.

**Sixth caution on sources.** Durst (2007) was read from a scanned volume with no text layer, via German optical character recognition. OCR establishes substance at **Strong** and wording at **Indicative**. Nothing anywhere in this framework is quoted from it.

**Seventh caution on sources, new at v3.1c.** A research process that returns findings graded Strong is grading its own reading, which is not a grade. Any finding arriving through a proxy is **Indicative** until the primary record is opened directly, whatever the proxy said about itself. In the v3.1c case the proxy's substance was correct and its grade was still unearned, which is why the rule attaches to provenance rather than to accuracy.

---

## 9.1 Notation and objects

### 9.1.1 The graph

```
G = (N, E)
```

**Plain English:** the architecture is a graph G of nodes N (services, stores, queues, third parties) and edges E (i depends on j).

A federation of per-domain subgraphs with different structural properties:

```
+----------------+-------------------+--------------------------+
| SUBGRAPH       | STRUCTURE         | METHOD IT ADMITS         |
+----------------+-------------------+--------------------------+
| G_data         | Acyclic, monotone | Fault tree with BDD,     |
| (lineage)      |                   | influence diagram        |
+----------------+-------------------+--------------------------+
| G_delivery     | Acyclic, monotone | Same                     |
| (CI/CD)        |                   |                          |
+----------------+-------------------+--------------------------+
| G_service      | Cyclic, often     | CTMC, stochastic Petri   |
| (call graph)   | NON-monotone      | net, or dynamic fault    |
|                | (retries,         | tree. NOT a static fault |
|                | fallbacks,        | tree. See 9.3.5.         |
|                | circuit breakers) |                          |
+----------------+-------------------+--------------------------+
```

The third row is from v3.0 and it matters. Earlier versions assumed fault-tree logic applied everywhere.

**Provenance note added at v3.1.** G is now obtainable without a vendor relationship. The OpenTelemetry Collector ships a service graph connector that builds a service dependency graph directly from trace data, derived from Grafana Tempo's service graph processor. This is good for implementation and fatal for any claim that the mined substrate is a differentiator. It is not one, and section 9.16 does not imply otherwise.

**What kind of graph this is, added at v3.1c.** G here is a graph of **internal service-to-service call structure**, resolved to the subgraph a named business use case exercises. That is a specific choice and it is now the load-bearing one, because a granted patent family builds a different graph over the same mathematics: assets are IP addresses, domain names and server systems, dependencies are hosting providers and software versions, and the whole thing is assembled from externally observable signals. **[Strong, from the specification of US 10,257,219, read at source.]** Both are dependency graphs and the methods below apply to either. The distinction between them is one of scope rather than of technique, and it is what separates this framework's risk axis from prior art. See 9.3.9.

**Graph version.** G is not a fixed object. It is re-mined, and it moves between minings. Every quantity computed below is computed against one mining and inherits its as-at date.

```
G[v]   the graph as mined at version v, with an as-at timestamp

Every ledger entry carries the v it was computed on.
Two entries computed on different v are NOT comparable
without re-mining both to a common version.
```

**Plain English:** the picture the numbers are built on changes underneath them, so every number has to say which picture it came from, and you cannot subtract two numbers taken from different pictures. This is a required reported field at 9.8.2 and a refusal condition at 9.9.

### 9.1.2 The unit of account

```
u in U, where u = (use case, business subdomain)
G_u subset of G[v], the subgraph exercised by u
```

**Plain English:** everything is computed per use case inside a named business subdomain. The use case lights up part of the graph, and that lit part is what you cost, risk and value. G_u comes from mined traces, mesh topology and infrastructure-as-code state, not from a drawing.

**Limit stated at v3.1.** The unit is clean where G_u is exclusive to u. It is weakest at shared nodes, which is where the money is. See 9.2.6.

**The unit is DECLARED, not mined. Stated at v3.1b, and this is a correction of standing.**

G_u is mined. The business subdomain is not. It is a decomposition drawn by a person, in a meeting, and it is exactly the kind of hand-built artefact this framework criticises in prior work. The practice is therefore a **hybrid**: a mined substrate carrying a declared boundary.

```
MINED       G, G_u, drivers, exposure, volatility, drift
DECLARED    the subdomain boundary, the fixed-cost
            allocation basis, the counterfactual
```

**The partial defence, stated AS partial.** The subdomain decomposition changes at a rate far slower than the graph does. A boundary drawn once and revised annually contributes almost nothing to period-to-period movement in the coefficient, which is the quantity the falsification tests act on. That makes the declared component tolerable for movement-based claims. It does not make the boundary objective, it does not survive a revision of the decomposition, and it does not license any level claim, only a movement claim. This is a defence of one use of the number, not of the number.

**Fourth scope condition.**

```
The subdomain decomposition must be PRE-EXISTING and
INDEPENDENTLY OWNED: built and maintained by a party
other than the one taking the measurement, with its
owner recorded as a reported field.

Where the measuring party builds or revises the
decomposition, the refusal at 9.9 applies.
```

**Plain English:** if the person doing the measuring also gets to draw the boundaries, they can draw whatever answer they want. The boundaries have to already exist and belong to someone else.

Logged as retired claim **R13**: the claim that the unit of account is derived from observation is withdrawn.

**Its standing rises at v3.1c.** The unit of account is no longer one qualification among several. With the propagation and aggregation mathematics below now known to sit inside granted claims, the unit of account and the graph kind at 9.1.1 are two of the three things this framework has that the prior art does not, the third being the decomposition at 9.5.2. None of the three is tested. Section 9.16 states the position and 9.11.5 records the missing hypothesis.

### 9.1.3 The ledger entry

```
L(u) = { C(u), R(u), V(u) }
```

**Plain English:** three numbers, per use case, each a distribution.

**It is a set, not a sum.** The braces are load-bearing. The three axes are not commensurable and are not added to each other, and the entries across use cases are not added to each other either. Section 9.8.3 gives the three separate reasons and section 9.8.4 gives what is offered instead. Logged as retired claim **R14**: the claim that the ledger yields a portfolio position is withdrawn.

---

## 9.2 Axis one: cost

### 9.2.1 Separate the pools

```
cost_meter(n) = F(n) + V(n)
```

**Plain English:** split each node's bill into what you pay regardless of traffic and what scales with usage, then allocate them differently, because they behave differently.

### 9.2.2 Allocate the variable pool on a causal driver

```
            driver_u(n)
w_u(n) = ---------------------------
          sum over v of driver_v(n)
```

**Plain English:** of all the demand hitting this node, what share came from this use case?

```
+---------------------------+-------------------------------+
| COST POOL                 | DEFENSIBLE DRIVER             |
+---------------------------+-------------------------------+
| Compute                   | vCPU-seconds, GB-seconds      |
| Storage                   | GB-months                     |
| Egress                    | GB transferred                |
| Per-request services      | Request count                 |
| Licences, reservations,   | Declared basis. State it.     |
| baseline capacity         | There is no causal driver.    |
+---------------------------+-------------------------------+
```

Request count is one candidate driver, not the default. Two use cases making equal numbers of calls can differ by an order of magnitude if one moves far more data.

```
C_run(u) = sum over n in G_u of [ w_u(n) * V(n) + b_u(n) * F(n) ]
```

**Note on the denominator.** The weight w_u(n) is a share only if the denominator runs over **every** consumer of n, instrumented or not. Where the ledger holds a subset of the consumers, which is the normal case, the weights do not sum to one and C_run(u) is neither a total nor a share of a total. This is the mechanism behind the cost result at 9.8.3.

### 9.2.3 Two warnings the earlier versions omitted

**The allocation death spiral.** Fixed cost spread over a declared basis rises per unit as use cases leave. If teams respond to a high allocated cost by moving off the platform, the remaining tenants absorb the same fixed pool across a smaller base, their unit cost rises, and they leave too. **[Strong. Standard result in the activity-based costing literature.]**

The mitigation is to report the fixed allocation separately from the variable coefficient, and never to let a decision to exit be made on a number containing an arbitrary fixed share.

**Activity-based costing has a known cost problem of its own.** Kaplan, who built ABC, moved to time-driven ABC (Kaplan and Anderson, Harvard Business Review, November 2004) precisely because survey-derived driver weights are expensive to maintain, subjective and unstable. Mined telemetry is a partial answer, since the driver is observed rather than surveyed, but only where the driver is genuinely metered. Where it is not, this framework inherits ABC's problem in full.

### 9.2.4 Average is not marginal

```
C_run(u)    = allocated average cost, for the ledger
MC(u_new)   = incremental cost, for flexibility (section 9.4)
```

**Plain English:** the ledger records what a use case costs today. Flexibility asks what the next one would add. Do not let one stand for the other.

### 9.2.5 Cost is a distribution

```
C_run(u) ~ Bootstrap( { C_run(u)_t : t in observation window } )
```

### 9.2.6 The shared-node limit

The variable pool at a shared node is allocated on a metered causal driver and is defensible. The fixed pool at a shared node is allocated on a declared basis and is not.

```
Shared node P serving k use cases:
  variable share    metered, causal, defensible
  fixed share       declared, arbitrary, NOT defensible
                    for any decision about leaving P
```

**Plain English:** the more use cases lean on a node, the less the fixed part of its cost figure means, and high-fan-in shared nodes are exactly where consolidation and exit decisions get made. The framework produces its least trustworthy cost number at the point where the largest cost decisions happen.

This is a real limit and nothing in this document resolves it. It is recorded rather than hedged. The variable coefficient remains usable at shared nodes; the total does not.

**Extended at v3.1b.** For any question of the form "what would we save by removing this set of use cases", the allocated average is the wrong instrument regardless of how good the driver is, because removal does not release the fixed pool and does not release the shared node. Only a **marginal** basis answers a removal question, and marginal costs do not sum to the total either. See 9.8.3.

**A note on asset weighting, added at v3.1c.** The granted family at 9.3.9 weights each asset by its importance to the entity that owns it, assessed by traffic share, revenue proportion or a user-defined metric. **[Strong, from claim and specification text.]** That is a declared importance weight applied to a node, and it is a weaker construct than the metered causal driver above, because it does not attach to a unit of business work. The distinction is real and it is the clearest place in this document where the cost axis does something the prior art does not. It is also the distinction most exposed to the objection at 9.1.2, since the unit of business work is bounded by a declared subdomain.

### 9.2.7 The cost identity is a definition, not a finding

```
Cost = business volume x architectural coefficient x unit price
```

The coefficient is defined as the residual once volume and unit price are removed. It therefore absorbs workload mix, vendor-side performance changes, tenancy effects and measurement error along with anything architecture does. The identity establishes only that the coefficient is not volume and not list price. Attributing it to architecture is an empirical claim requiring the identification work at 9.11, and it must not be smuggled in through the algebra. Hypothesis H10 at 9.11.2 is the test that carries this burden.

---

## 9.3 Axis two: risk

### 9.3.1 The FAIR structure, corrected

```
Loss(n) = LEF(n) * LM(n)

LM = LM_primary + ( SLEF * SLM )
```

**Plain English:** how often something bad happens, times what it costs. The cost has two parts: the direct hit, and the knock-on effect, which only lands some of the time.

**Corrected at v3.0.** Earlier versions wrote LM = LM_primary + LM_secondary, treating the knock-on as a flat additive amount. In the FAIR standard, secondary loss is itself the product of a **secondary loss event frequency**, which is a conditional probability that the knock-on occurs at all, and a **secondary loss magnitude**. Writing it as a flat addition assumes SLEF equals 1 and overstates the total. Note SLEF is a probability, not an annual rate; multiplying it by LEF again would double-count.

### 9.3.2 Frequency estimation: Poisson-gamma credibility

Loss events are counts, so the model is stated directly as counts.

```
Prior:      lambda ~ Gamma(alpha, beta)
Observed:   x events over exposure e
Posterior:  lambda | x ~ Gamma(alpha + x, beta + e)

                      alpha + x
    E[lambda | x] = -------------
                      beta + e
```

**Plain English:** you begin with an industry belief about how often this fails, you observe your own experience, and the posterior blends them. More local exposure moves the answer toward your own experience.

This is exactly equivalent to a credibility weighting, which is what makes it self-checking:

```
    E[lambda | x] = Z * (x / e) + (1 - Z) * (alpha / beta)

                        e
    where  Z = -------------   and  k = beta = EPV / VHM
                      e + k
```

**Plain English:** the same answer written two ways. The Bayesian posterior and the credibility formula agree exactly, not approximately. If your implementation produces two different numbers, it has a bug.

That exact agreement is a property of the Poisson-gamma pair, known as exact credibility (Jewell 1974; Buhlmann and Gisler 2005). Buhlmann credibility is the linear case of this model rather than a separate technique.

**Parameterisation, confirmed at v3.1.** Setting alpha equal to the prior mean multiplied by k, with beta equal to k, is internally consistent: alpha/beta then returns the prior mean identically. An external challenge that this parameterisation contradicts itself was raised on re-audit and does not hold. Recorded because a reader may raise it again.

**Units are load-bearing.** k has units of **time**, because k = beta and beta is the prior's exposure scale. Therefore e must be in the **same units**, and if frequencies are annual, exposure is in **years**. Fourteen quarters is 3.5 years, not 14.

**Where exposure varies across periods**, which is normal for a growing system, use Buhlmann-Straub properly with exposure weights per period rather than plain Buhlmann. Plain Buhlmann is the special case of constant exposure, and using it when exposure has grown will overweight the periods where you had the least at stake.

**Small-sample honesty.** With one event observed, the plug-in estimates of EPV and VHM are extremely noisy, and the empirical VHM estimator can come out negative, which forces Z to zero. Report the credibility weight with its own uncertainty, or state plainly that the variance components were assumed rather than estimated.

**Noted at v3.1c.** This is the one construction in the risk axis with no counterpart in the prior art at 9.3.9. The granted family draws seed events from a hazard model derived from empirical observation, theoretical models or a combination, and does not describe blending a local rate with an industry prior under a credibility weight. That is a narrow distinction and it is stated narrowly. **[Indicative: absence of a claim to it, which is the weakest evidence type in this framework.]**

### 9.3.3 Frequency scaling where there is no local data

For counts, exposure enters a Poisson model directly as an offset:

```
    lambda_u = lambda_org * ( exposure_u / exposure_org )
```

**Plain English:** if your use case handles two percent of the transactions, start from two percent of the event rate. Proportional, with no free exponent.

The reason is a category error in earlier versions: v2.0 scaled frequency by an exponent taken from the operational-risk literature on scaling external loss **severity**. A severity relationship does not transfer to counts.

**Citation status corrected at v3.1.** v3.0 supported this with the claim that Cope and Labbi (2008, Journal of Operational Risk 3(4), DOI 10.21314/JOP.2008.051) concluded that scaling through a size proxy is not a sensible technique for incorporating external data. The bibliographic metadata is confirmed exactly. The attributed **conclusion** could not be confirmed from the accessible abstract on re-audit, and later literature builds working scaling models. That attribution remains **[Asserted]** pending a check against the source body, which is an open action and has not been done. **At v3.1c it is the largest remaining proxy-read exposure in the framework**, and the only load-bearing citation still standing on a summary.

This does not weaken the rule. The prohibition on applying a severity exponent to counts rests on the category error alone and stands whether or not the severity relationship itself is sound. Shih, Samad-Khan and Medapa (2000), that firm size explains only a small proportion of variability in operational loss severity, is retained as **[Indicative, not re-verified]**.

### 9.3.4 The subdomain ceiling, as censoring not truncation

Chopping a distribution at a cap removes tail mass, lowers the mean, and destroys the statistic the framework reports: once the cap binds near the 99th percentile, P99 collapses onto the cap and stops estimating anything.

Treat it as explicit censoring:

```
Report:  the censored distribution
         P( Loss >= cap ), the mass sitting at the boundary
         the uncensored P99 alongside the censored one
```

**Plain English:** say how often the ceiling was hit and by how much, rather than silently pretending losses stop there. A cap that binds five percent of the time is telling you the subdomain valuation is wrong, or the model is.

**Rule:** if the cap binds in more than roughly one percent of simulations, the reported tail statistics are not usable and the refusal in section 9.9 applies.

One percent is a **declared operating convention, not a derived threshold**. No canonical basis for that specific value exists. It sits where it does because below it the displaced mass is small relative to the sampling error of the percentile estimate itself. An implementer may set it differently provided the value is declared and held constant across comparisons.

### 9.3.5 Propagation, with the independence contradiction removed

Use an explicit common-cause structure:

```
    P(A and B) = E_theta [ P(A | theta) * P(B | theta) ]
```

**Plain English:** two things fail together more often than chance because they share something. Condition on the shared thing, multiply inside, then average over how bad the shared thing gets. Independence is the special case where the shared thing does not exist, and in an enterprise estate it always exists.

Where the failure logic is genuinely a monotone AND/OR structure, inclusion-exclusion still corrects overlap exactly:

```
P(A1 or ... or Ak) = sum P(Ai) - sum P(Ai and Aj)
                     + sum P(Ai and Aj and Al) - ...
```

and a **Binary Decision Diagram** gives the exact top-event probability with shared components evaluated once, rather than the rare-event approximation (Rauzy 1993; Sinnamon and Andrews).

**But check monotonicity first.** Fault trees require a coherent monotone structure: a component failing must not make the system more likely to succeed. Retries, fallbacks, circuit breakers, load shedding and graceful degradation all break monotonicity. A circuit breaker opening is a component "failing" that makes the system survive.

```
If G_u contains retry, fallback, circuit-breaker or
degradation logic, a static fault tree does not
represent it. Use a CTMC, a stochastic Petri net
or a dynamic fault tree.
```

**Plain English:** the maths assumes breaking things only makes things worse. Modern resilience patterns are built on breaking things deliberately to make things better. Check which world you are in before choosing the tool.

**Prior-art note, added at v3.1c, per reading principle C2.** The propagation construction most commonly used in practice over a dependency graph, namely a seed event drawn from a probability distribution, a conditional probability on each edge that a receiving node is affected given that a providing node has failed, Monte Carlo propagation over the graph, and termination when statistical variance falls below a threshold, is recited in the granted claims at 9.3.9. **[Strong, from claim text read directly.]** Nothing in this section is originated here. What is not in those claims is the **selection logic**: the requirement to test monotonicity before choosing a tool, and the mapping from subgraph structure to admissible method at 9.1.1 and 9.3.6. That is a thin distinction and it is the accurate one.

### 9.3.6 Cycles

A dynamic Bayesian network handles **feedback across time** by unrolling into time slices, but the within-slice graph must still be acyclic, so a genuine **instantaneous** mutual dependence is still not representable. Modelling a tight synchronous request-response cycle forces an artificially fine time slice.

Loopy belief propagation is approximate and its convergence is **not** guaranteed. It can oscillate or converge to wrong marginals.

The better-established tools for genuine feedback:

```
+----------------------------+-------------------------------+
| Continuous-time Markov     | Exact for state-based repair  |
| chain                      | and failure dynamics          |
+----------------------------+-------------------------------+
| Stochastic Petri net /     | Handles concurrency,          |
| GSPN                       | contention, queueing          |
+----------------------------+-------------------------------+
| Dynamic fault tree         | Sequence-dependent failure,   |
|                            | spares, functional dependency |
+----------------------------+-------------------------------+
```

**Added at v3.1c.** The prior art at 9.3.9 handles transitive and circular dependency relationships by probabilistic propagation with a stopping rule rather than by an explicit cycle-handling formalism, which is a legitimate engineering answer and a different one from the above. Neither approach is originated here.

### 9.3.7 Percolation: removed

Percolation results are asymptotic, assuming the number of nodes goes to infinity over a random-graph ensemble with a particular degree distribution. An enterprise dependency graph is finite, engineered, hub-heavy and tiered. There is no sharp threshold at finite size, and none of the ensemble assumptions hold.

It is removed as a quantitative method. It may be used as a labelled qualitative analogy and never as a source of a number. Independent re-audit at v3.1 confirmed removal as correct rather than over-cautious.

### 9.3.8 Aggregating correlated losses

```
F(x1, ..., xk) = C( F1(x1), ..., Fk(xk) )
```

Sklar's theorem, with C unique for continuous margins.

**Do not use a Gaussian copula.** It has zero tail dependence (Embrechts, McNeil and Straumann 2002), meaning it assumes things stop moving together exactly where you need them to. Use a Student-t or another tail-dependent family and declare it.

For comonotonic risks, value-at-risk is **exactly additive**: the quantile of the sum equals the sum of the quantiles. Adding VaR gives the exact comonotonic answer, which serves as a reference point, not an overstatement.

For regularly varying tails with tail index alpha > 1, meaning a finite mean, VaR is sub-additive far enough into the tail. Super-additivity requires alpha < 1, an infinite-mean regime. State the condition or the warning is folklore. Both claims re-verified at v3.1.

**What this section is and is not, clarified at v3.1b.** This section is the correct method for combining risks. It is not a licence to combine them. Fitting C across use cases requires joint loss observations across those use cases, and an enterprise that has seen one loss event per use case has no basis on which to fit a dependence structure at all. The method exists; the data usually does not. See 9.8.3.

**And a route round the obstruction that this framework cannot take, added at v3.1c.** The prior art at 9.3.9 reaches a joint position without a copula at all, by simulating the whole graph in one model: a single seeded propagation produces correlated per-node losses directly, and the joint distribution is the empirical distribution of the simulation output. **[Strong, from specification text.]** That is a cleaner solution than the one described above, and it is available because the graph is not cut into declared units before the losses are assessed. This framework cuts first, by 9.1.2, and then needs a copula to put the pieces back together. **The copula unidentifiability at 9.8.3 result two is therefore partly a consequence of the unit of account rather than a property of the problem.** Stated because the alternative exists and a reader will find it.

### 9.3.9 Prior art on the risk axis, new at v3.1c

This section exists because sections 9.3.1 to 9.3.8 are, taken together, a construction that somebody else already owns, and a specification that does not say so is misleading by omission.

```
"Correlated risk in cybersecurity", one continuation
chain, five grants, priority 12 March 2018:

  15/918,286  ->  US 10,257,219    9 Apr 2019
  16/292,956  ->  US 10,594,723   17 Mar 2020
  16/795,056  ->  US 10,931,705   23 Feb 2021
  17/179,630  ->  US 11,770,401
  18/365,384  ->  US 12,273,367

Chain confirmed from the face of the later records.
Claims read for four grants. Specification read in
full for US 10,257,219.
```

**In the granted claims:**

```
generating a dependency graph over assets,
  dependencies and entities
executing Monte Carlo simulations over that graph
generating a seed event drawn from a probability
  distribution
propagating disruption through the graph
assessing loss for each asset
aggregating losses across assets, across entities
  and across portfolios
aggregating losses in a NONLINEAR SUM
weighting each asset by importance to its owning entity
terminating simulation when statistical variance falls
  below a threshold
a CONDITIONAL PROBABILITY ON EACH EDGE that the
  receiving node is compromised given that the
  providing node is compromised
```

**[Strong, from claim text read directly.]**

**In the specification, which is where the decisive fact sits:**

```
a LOSS EXCEEDANCE CURVE expressed as a function of loss
  in US DOLLARS, produced from the simulation results
its use to judge whether the rate of losses exceeding a
  stated monetary threshold falls within an acceptable
  exceedance rate
mean expected loss and loss exceedance curves named as
  the reported statistics
aggregated losses described as simple sums OR as more
  complex loss models including thresholds and limits
assets and dependencies identified from network traffic,
  DNS records, server banners, software versions and
  inter-business payment data
```

**[Strong, from specification text read directly.]**

**The consequence for this document, stated flatly.** The risk axis specified in 9.3 is a correct implementation of a construction that is granted to another party. No novelty attaches to any of it. What remains outside the claims is the graph kind at 9.1.1, internal call structure rather than outside-in infrastructure exposure; the unit of account at 9.1.2, a use case within a business subdomain rather than an asset weighted by importance; and, thinly, the credibility estimator at 9.3.2 and the method-selection logic at 9.3.5. **A freedom-to-operate opinion has not been obtained and is required before any filing.**

**How this was missed for four published versions.** The family was cited by number from v1.0 and described from a summary in every version. Nobody opened it. Reading the claims and the specification took four retrievals. Recorded here rather than only in the correction log, because the failure is methodological and this document's preamble is where methodological rules live.

---

## 9.4 Flexibility, primary instrument: marginal cost of the next use case

```
MC(u_new | G) = C(G union G_u_new) - C(G)
```

```
MC(u_new) = sum over new nodes of C_build(n)
          + sum over existing nodes of Delta_variable(n)
```

**Plain English:** build cost for what does not exist, plus the *additional* variable cost on what does. The second term is an increment, not an allocated share.

```
Flexibility(G) proportional to 1 / E[ MC(u_new) ]
```

Prior art stated plainly: cost of the next variant from a shared asset base is standard software product line economics; marginal cost from metered billing is standard FinOps. The residual is the instrumentation, not the idea.

**This remains the primary instrument.** It is metered, it requires no valuation model, and it inherits no contested foundation. Where MC can be computed, compute it and do not reach for section 9.5.

**Its standing at v3.1c.** With the risk axis occupied per 9.3.9, this instrument and the decomposition at 9.5.2 carry the flexibility axis between them, and this one is the sounder of the two because it is metered. Any presentation of the framework that leads with 9.5 rather than 9.4 is leading with the weaker instrument, and 9.9 already refuses 9.5 wherever 9.4 is computable.

**Marginals do not sum either.** MC is defined against a specific existing G. The sum of marginal costs computed one at a time against the same base is not the cost of adding all of them, because each addition changes the base for the next. Order matters and the shortfall is the shared infrastructure each subsequent use case no longer has to build.

---

## 9.5 Flexibility, secondary instrument: the option component of switching cost

Called the forfeited option through v3.0. Renamed, reframed, and stripped of its novelty claim at v3.1. The mathematics below is unchanged and was independently reproduced on re-audit.

Used only where the future use case does not exist yet, so there is nothing to meter.

### 9.5.1 What this is not

**It is not a new instrument.** Dixit and Pindyck (1994) state that a firm making an irreversible investment exercises, or kills, its option to invest, and that the value of the killed option belongs in the investment cost. That is the inverted sign, in the canonical text of the field this section borrows from. Kulatilaka and Trigeorgis (1994) already value the general option to switch under a switching cost and already establish that switching cost breaks additivity and produces hysteresis. In routine option valuation the value eroded by committing rather than waiting is carried as a dividend or convenience yield term.

v3.0 presented the inverted sign as original. It is textbook. **[Strong.]**

**It is not an addition to switching cost.** Under the standard industrial-organisation definition, switching costs are an aggregate that already includes learning costs, transaction costs, contractual and compatibility costs, and costs arising from uncertainty (Klemperer 1995; Farrell and Klemperer 2007). The option value forgone on committing is one of those components. Reporting it alongside a broad switching-cost figure and summing the two counts the same economic quantity twice.

### 9.5.2 What this is: a decomposition

```
broad switching cost = execution component + option component

  execution component    deterministic, one-time,
                         engineering estimate,
                         does not depend on uncertainty

  option component       stochastic, horizon-dependent,
                         valuation estimate,
                         depends on volatility and horizon
```

**Plain English:** economists already say switching cost includes the value of the freedom you give up. Nobody separates the two parts. This does. You are not adding a number to switching cost, you are splitting the one number into two that move for different reasons.

The decision value of the split is that the two respond to different interventions. The execution component falls when you invest in tooling, abstraction layers and migration automation. The option component falls when the horizon shortens, when volatility drops, or when the value distribution of the foregone alternative narrows. A programme that halves execution cost while leaving the option component untouched has not bought the flexibility its business case claims.

**The operative discipline, stated as a rule:**

```
The decomposition REPLACES a broad switching-cost estimate.
It does not supplement one. Never report
  broad switching cost + option component.
```

**This is now the framework's only unoccupied assertion of method, noted at v3.1c.** E1 is commodity, the risk axis is granted to another party, the inverted sign is textbook, and the marginal-cost instrument at 9.4 is standard FinOps. The split above is the one thing in this document that nobody else is doing, and H6 at 9.11.1 is the test of whether it carries information. **If H6 returns a kill, this document specifies a correct assembly of other people's methods over a declared unit of account and nothing more.**

### 9.5.3 The construction

```
OC(d) = W(K_reversible, T) - W(K_committed, T)
```

where W is **one** switching-option model (Kulatilaka 1988; Kulatilaka and Trigeorgis 1994) evaluated at two switching-cost settings, with the horizon **held constant**.

**Plain English:** build one model of the freedom to switch, then turn the switching-cost dial from what it would have been to what the decision made it. The change in value is the option component the decision consumed.

This is legitimate because W is weakly decreasing in K, so the difference has a stable sign. **Verified numerically in 9.10.**

Option values interact and do not add (Trigeorgis 1993), so summing per-node or per-use-case option components overstates, and the overstatement grows as correlation falls. This is stated formally at 9.8.3 and is not a caveat: it is a prohibition.

### 9.5.4 Hysteresis, a refusal condition

With sunk switching costs the optimal policy has an inaction band (Dixit 1989). The value function can therefore be flat in K over a range and then move sharply.

v3.0 recorded this as a caveat and reported the number anyway. That is insufficient. If the two evaluated settings straddle a band boundary, the difference is partly an artefact of where the two points were placed rather than a property of the decision.

```
REQUIRED:
  Evaluate W(K) across the full plausible range of K,
  not only at the two reporting points.
  Plot the curve. Show where both points sit on it.

REFUSE if:
  the two reporting points straddle a discontinuity
  or a flat-then-sharp transition in W(K).
```

**Plain English:** before you quote the difference between two points, look at the whole line between them. If it has a cliff in the middle, the difference is telling you where you put your pins, not what the decision cost.

The number remains a difference at two declared points and must never be read as a gradient or a marginal quantity.

### 9.5.5 The valuation engine

The published Datar-Mathews method uses **two** rates, applied to the two legs **before** the max is taken:

```
    OC = E[ max( Delta_V * e^(-mu*T) - K * e^(-r*T), 0 ) ]
```

**Plain English, term by term:**

- Delta_V * e^(-mu*T): the uncertain benefit of being able to switch, brought back to today at the **risk-adjusted** rate mu, because it is risky.
- K * e^(-r*T): the switching cost, brought back at the **risk-free** rate r, because it is a known amount.
- max(..., 0): where switching would lose money you simply do not switch, so the payoff is zero.
- The discounting happens **inside** the max, on each leg separately. That placement is the whole correction.

v2.0 pulled a single risk-free factor outside the whole expectation, discounting a risky benefit at the risk-free rate. In the worked example that inflated the figure by roughly sixteen percent. The two-rate structure was independently confirmed against the published method at v3.1.

### 9.5.6 What this engine does and does not claim

**It makes no tradeability claim.** Architecture arrangements do not trade and cannot be replicated, so no closed form derived from a replicating portfolio applies. Simulation with real-world probabilities avoids asserting a market value.

**But that framing is contested and should be flagged as such.** Using real-world probabilities with risk-adjusted discounting does not in general coincide with no-arbitrage valuation, and it inherits Borison's (2005) critique of practitioner real-options methods: where inputs are subjective rather than market-calibrated, the resulting number is not a market value and should not be called one. **[Contested, not settled. Say so in any publication.]**

**It does not remove volatility.** There is no explicit sigma parameter, but volatility is fully present in the dispersion of the simulated Delta_V distribution, and the answer is exactly as sensitive to that dispersion as any option model is to sigma. The estimation problem moved; it did not disappear.

**Measure consistency.** Volatility estimated from cost or usage telemetry (section 9.6) is a **physical-measure** estimate. Datar-Mathews is constructed to accept physical-measure inputs with risk-adjusted discounting, which is why it is the engine used here and why section 9.6 is usable at all. This must be stated rather than assumed.

```
WARNING: substituting a risk-neutral valuation method
into this construction while continuing to feed it a
telemetry-derived sigma mixes the physical and
risk-neutral measures and produces a number with no
interpretation.
```

### 9.5.7 The declared counterfactual, with an adjudication rule

The option component is a comparison, so every figure is relative to an architecture that did not happen. Declared, that is rigour. Hidden, it is the free parameter that makes the number meaningless. Declared but invented, it is worse than hidden, because it looks like rigour.

**Formal precondition.**

```
K_reversible may be set ONLY from an alternative that
satisfies all three:

  (i)   it was ON THE TABLE at decision time, as an
        option the decision-maker could have chosen;
  (ii)  it is EVIDENCED FROM THE DECISION RECORD, by
        an architecture decision record, an evaluated
        option in a business case, a rejected vendor
        proposal, a board or design-authority paper;
  (iii) the evidencing artefact is dated at or before
        the decision and is cited by identifier in the
        ledger entry.

A reconstruction, a later idea, or an analyst's
counterfactual constructed for the purpose FAILS (ii)
and the option component is not computed.
```

**Plain English:** you can only compare against a road you could actually have taken, and you have to be able to point at the piece of paper where somebody wrote it down at the time. If the only place the alternative exists is in the analysis, there is no number.

**Why the rule is this strict.** OC is monotone in K_reversible. An unconstrained counterfactual therefore sets the answer directly, and any desired option component can be produced by choosing a sufficiently frictionless alternative. The evidencing requirement is the only thing standing between the construction and a free parameter. This is a refusal condition at 9.9, not a reporting preference.

### 9.5.8 The remaining fragility, restated

The v3.0 text anchored the narrow definition of K to the EU Data Act treatment of permitted cloud switching charges. **That anchor is removed and should not be used by anyone.** It is a legal artefact rather than an economic definition, and the fee it pointed to is legislated to zero from 12 January 2027 under Data Act Article 29(1). Anchoring a durable quantity to a charge legislated to zero is self-undermining. **[Strong, from the regulation text.]**

The fragility does not go away with the reframing. It changes shape:

```
v3.0 question:  is FO distinct from K?
                (near-unanswerable, since FO is built from K)

v3.1 question:  does splitting K into two components
                carry information?
                (answerable, and can return no)
```

If the ratio of option component to execution component turns out to be roughly constant across commitments, then the option component is a fixed multiple of a quantity practitioners already estimate, the split adds nothing, and this entire section should be deleted in favour of section 9.4. If the option component is small relative to its own estimation error, the same conclusion follows.

This is hypothesis H6. It was the framework's leading kill risk through v3.1a. At v3.1b it became the **second** most serious, because H10 at 9.11.2 takes down all three axes rather than one section. **At v3.1c that ordering is worth restating rather than revising: H10 remains the more total kill, but H6 now decides whether anything in this document is unoccupied at all.** The two questions are different and both are live.

---

## 9.6 Volatility, where it is still needed

### 9.6.1 The estimator

```
                 stdev( ln( C_t / C_{t-1} ) )
  sigma_cost = ------------------------------
                      sqrt(Delta_t)
```

with Delta_t the period length **as a fraction of a year**. Verified: dividing by sqrt(Delta_t) is algebraically identical to multiplying by sqrt(periods per year).

**De-jump first.** Pricing changes, reserved-instance purchases and re-platforming are structural breaks, not volatility, and they inflate sigma. Use bipower variation, threshold or truncated realised variance, or median realised volatility, and disclose which.

**A graph change is a structural break too.** A re-mining that materially changes G_u breaks the series that sigma is estimated from, in exactly the way a repricing does. De-jump on graph version boundaries as well as on billing events, or the volatility estimate absorbs the framework's own measurement activity.

### 9.6.2 The random-walk gate

The estimator above assumes the log-cost series is a random walk. Cloud cost is driven by usage, which is frequently **mean-reverting and seasonal**. If the true process reverts, dispersion is capped at long horizons and a random-walk sigma **overstates** long-run uncertainty, inflating every option value computed from it.

```
Run a unit-root test before using sigma.
If the random walk is rejected in favour of
mean reversion, an Ornstein-Uhlenbeck process
is the correct model and the option values
computed here are biased high.
```

Also: log returns are undefined as cost approaches zero. Impose an explicit floor or use a different transform, and say which.

### 9.6.3 Ratio volatility, as a consistency check only

```
sigma^2 = sigma_A^2 + sigma_B^2 - 2*rho*sigma_A*sigma_B
```

Correct as the volatility of the ratio of two lognormal assets. As rho approaches 1 with similar volatilities, sigma approaches zero and switching freedom becomes worthless, which is the right intuition. Retained as a check, never as an input to a closed form.

### 9.6.4 The identification problem

Regressing the volatility of value on the volatility of operational activity is circular where the former is produced by a model taking the latter as input.

The real-options literature has standard routes to the volatility of a non-traded asset:

```
+---------------------------+--------------------------------+
| ROUTE                     | STATUS                         |
+---------------------------+--------------------------------+
| Traded twin security or   | Standard, but a genuine twin   |
| comparable                | rarely exists for architecture |
+---------------------------+--------------------------------+
| Sector or industry        | Available, crude, ignores      |
| equity volatility         | idiosyncratic structure        |
+---------------------------+--------------------------------+
| Consolidated-volatility   | Widely used, and criticised    |
| Monte Carlo (MAD)         | by Borison (2005) as circular  |
+---------------------------+--------------------------------+
| Independently observed    | Best, rarely available         |
| value variance            |                                |
+---------------------------+--------------------------------+
```

**Honest position:** the link is estimable with an explicit, contestable proxy whose assumptions must be disclosed, not unknowable. It is an assumption with a defensible provenance rather than a tested finding, and it must be labelled as such.

This is the framework's only element with no identified prior occupant, and that status rests on absence of a found occupant, which is the weakest evidence in the whole analysis. It is precisely the position section 9.5 occupied before re-audit at v3.1, **and precisely the position section 9.3 occupied before its patents were opened at v3.1c**. Twice now, an element resting on absence of a found occupant has fallen when somebody looked. Treat this one accordingly and do not build a novelty claim on it.

---

## 9.7 Epistemic decay: what drift actually does

### 9.7.1 The history, because it is instructive

Version 1.0 **added** a decay term to expected loss. Wrong: that asserts a bad map makes disasters bigger.

Version 2.0 corrected this to "drift widens the distribution and leaves the mean unchanged." **Also wrong**, and wrong in a subtler way that survived a full audit.

The claim is true only if the conditional mean is a linear function of the uncertain parameter. Loss distributions are right-skewed and the conditional mean is **convex** in the parameter, so by Jensen's inequality, widening genuine parameter uncertainty **raises** the unconditional mean. For a lognormal, E[X] = exp(m + sigma^2/2): extra parameter variance enters the exponent and lifts the mean directly.

This is established in loss reserving. Klinker (1997, CAS Forum, Winter, pp. 35-54) shows the parameter-variance term entering the predictive mean with a **positive** sign because of the convex shape of the exponential, and notes the sign depends on the paradigm: a frequentist bias correction of a fixed target subtracts it, while the Bayesian predictive mean of a future loss adds it. This framework predicts future loss, so it adds. Confirmed against the source at v3.1.

### 9.7.2 The correct statement

```
    ln L | m ~ Normal( m, s^2 )
           m ~ Normal( m0, tau^2 )
    ----------------------------------
    ln L ~ Normal( m0, s^2 + tau^2 )
```

**Plain English:** your uncertainty about the world and your uncertainty about your own estimate add together in the exponent. That single line gives every result below.

```
    Median = exp( m0 )                        unchanged by tau
    Mean   = exp( m0 + (s^2 + tau^2)/2 )      RISES with tau
    P99    = exp( m0 + z99 * sqrt(s^2+tau^2) ) RISES, faster
```

**Plain English:** a stale map does not move the typical case, because the median does not care how uncertain your parameter is. It does move your average and it moves your tail, and it moves the tail hardest.

All three rows of the worked example at 9.10 were independently reproduced at v3.1.

The variance decomposition still holds and is still worth reporting separately:

```
Var( L ) = E[ Var( L | m ) ] + Var( E[ L | m ] )
                ^                      ^
        world's randomness        our ignorance
          (irreducible)      (reducible by re-mining)
```

### 9.7.3 Measuring drift

```
         | E_described  symmetric-difference  E_observed |
  D(t) = -------------------------------------------------
              | E_described  union  E_observed |
```

**Plain English:** of all dependencies appearing in either picture, what fraction appear in only one?

Dividing by the **union** gives the Jaccard distance, bounded in [0,1], symmetric, and a proven metric satisfying the triangle inequality (Levandowsky and Winter 1971, Nature 234, DOI 10.1038/234034a0; simpler proof in Kosub 2019, Pattern Recognition Letters 120, DOI 10.1016/j.patrec.2018.12.007). Version 1.0 divided by one set alone, which could exceed 1 and was asymmetric.

Verified at v3.1. Note that Levandowsky and Winter later credited the earlier Marczewski-Steinhaus result; cite accordingly if precision on priority matters.

### 9.7.4 The mapping from drift to parameter uncertainty

```
    tau = g( D(t) ),  with g FITTED, not asserted
```

**Plain English:** you have to earn the link between "my map is eleven percent wrong" and "my parameter uncertainty is this wide." Fit it against periods where you re-mined and saw how much your estimates moved. If you have not done that, the mapping is an assumption and the resulting numbers are illustrative only.

**The shape of drift itself must also be fitted.** Version 1.0 asserted exponential saturation because it looked reasonable. Architecture erosion is driven by discrete change and deployment events, and discovery sweeps reset it, which is a saw-tooth rather than a smooth curve. Model it per change event or fit it from the observed symmetric difference over time.

### 9.7.5 On conservative loadings

If you want to report a figure deliberately above the expected value, that is a **separate, declared decision** with a name in actuarial practice, a margin for adverse deviation. It must be stated separately with its size given.

**And do not cite model risk guidance as cover for it.** v2.0 did. The guidance warns that institutions should be careful applying conservatism broadly or claiming conservative add-ons for model risk, because the impact in complex models may not be obvious or intuitive, and that an adjustment which looks conservative may not be if the distribution is misspecified. It supports expressing model uncertainty as ranges, which is what 9.7.2 does.

SR 11-7, issued 4 April 2011, was superseded on 17 April 2026 by SR 26-2, with parallel interagency issuances. Cite the current letter. **[Strong.]** The substantive position is unchanged.

### 9.7.6 Distinction from commercial drift pricing

Firefly ships a drift cost analysis feature that calculates the monthly cost of the infrastructure-as-code-defined state, determines the cost of the actual running configuration, and prices the difference, and separately supports predicting infrastructure costs before deployment. **[Strong, from product documentation.]**

That is a **cost delta**. This section produces a **change in the shape of a loss distribution**, principally in the tail. The two are complementary, not the same quantity. The distinction is narrower than earlier versions implied and is stated here so a reader can judge it rather than take it on assertion.

---

## 9.8 Uncertainty as output, and the limits of aggregation

```
Var_total = Var_aleatory + Var_epistemic
```

Reported separately, because they have different remedies. You cannot reduce the first. You reduce the second by re-mining the graph.

### 9.8.1 Method spread

```
S = | R_method1 - R_method2 |
```

If two defensible methods disagree, publish the gap rather than hiding behind whichever you chose.

### 9.8.2 Reporting standard

```
{ P10, P50, mean, P90, P99, method, seed,
  censoring rate, W(K) curve where 9.5 is used,
  graph version v and its as-at date,
  subdomain decomposition owner and revision date,
  counterfactual identifier per 9.5.7,
  assumption register reference }
```

The W(K) curve is required per 9.5.4. A reported option component without the curve behind it is not checkable.

**Graph version and decomposition owner are required, not optional.** They are the two fields that let a reader establish whether two entries are comparable at all, and whether the fourth scope condition at 9.1.2 was met. An entry missing either is not a ledger entry.

### 9.8.3 The ledger cannot be totalled

This is the section where Part IX earns its keep, because the paper and the thesis assert non-additivity and this document has to show why. There is no single reason. There are three, one per axis, and they fail differently. A framework with one reason could look for one fix. Three separate failures is a structural result.

**Result one, cost. The sum of allocated averages is not a total, and only a marginal basis answers a total-shaped question.**

```
Given ledger entries over U_ledger, a SUBSET of all
consumers of the shared nodes:

  sum over u in U_ledger of w_u(n)  <  1  generally

so sum over u of C_run(u) is neither the estate
cost nor a share of it. It is a sum over an
incomplete partition.

And where U_ledger IS complete, the fixed term
sum over u of b_u(n) * F(n) = F(n) is recovered only
because b was declared to sum to one. That is an
accounting identity produced by the declaration, not
a measurement.

For any removal or consolidation question:

  C(G) - C(G minus union of G_u over S)
    is NOT sum over u in S of C_run(u)

  and sum over u in S of MC(u)
    is NOT the cost released by removing S,
    because each MC is computed against a base that
    the other removals change.
```

**Plain English:** if you add up what every use case is charged, you get a number that depends on how many use cases you happened to instrument and on a split somebody declared. It is not what the estate costs and it is not what you would save. The only cost question that survives is a marginal one, asked about a specific change, one at a time.

**Result two, risk. The sum of the marginal distributions is not the distribution of the sum, and the object that would fix it is usually unidentifiable.**

```
By Sklar, the joint is F(x1,...,xk) = C(F1,...,Fk),
and the aggregate loss distribution depends on C.

  VaR_q( sum of L_u ) = sum of VaR_q( L_u )
    ONLY under comonotonicity.

Otherwise aggregation is a DIFFERENT COMPUTATION:
fit a tail-dependent C across use cases, then
simulate the joint. It is not an addition and no
amount of care with the margins substitutes for it.

The obstruction: fitting C requires JOINT loss
observations across use cases. An estate with one
observed event per use case has zero information
about the dependence structure. The credibility
machinery at 9.3.2 borrows strength for MARGINS
from an industry prior. There is no equivalent
industry prior for the copula between two named
internal use cases.
```

**Plain English:** two risks added together are not two risks added together. You need to know how they move as a pair, and knowing that needs times when they both went wrong, which almost nobody has. So the method exists and the data does not.

**Qualified at v3.1c.** This obstruction is real for a framework that cuts the graph into declared units and then tries to reassemble them. It is not a property of the underlying problem. A single seeded simulation over the uncut graph produces the joint distribution directly and never fits a copula at all, which is what the prior art at 9.3.9 does. The result above should therefore be read as: *given the unit of account at 9.1.2, risk does not aggregate.* Change the unit of account and the obstruction changes with it. That is a less flattering framing than v3.1b carried and it is the correct one.

**Result three, option value. Option values interact, and the interaction is not a correction term you can bound.**

```
Trigeorgis (1993): the value of a collection of real
options is not the sum of their standalone values.

The mechanism is convexity. For payoffs A and B,

  E[max(A,0)] + E[max(B,0)]  >=  E[max(A+B,0)]

with equality only when A and B never take opposite
signs. So a sum of separately valued switching
options EXCEEDS the value of the joint position, and
the gap widens as correlation falls.

Worse for this construction specifically: OC is a
difference of one W evaluated at two K settings, and
K is a property of a COMMITMENT, not of a use case.
Two use cases riding the same commitment share the
same K. Their option components are then two views
of one switching decision, and adding them counts
that decision twice.
```

**Plain English:** freedoms overlap. Being able to leave a vendor is one freedom even if six use cases benefit from it, and adding up six separate valuations of the same escape counts the same escape six times.

**Grading.** Result one is **[Strong]**, it is arithmetic on the definitions in 9.2.2. Result two is **[Strong]** as mathematics, Sklar and the comonotonic VaR condition, **[Indicative]** as an empirical claim about data availability, and **[Strong]** on the qualification added at v3.1c, since the alternative construction is documented in a granted specification. Result three is **[Strong]** on Trigeorgis, and **[Strong]** on the shared-K argument, which follows from the construction at 9.5.3.

### 9.8.4 What is offered instead

Refusing a total is not refusing to be useful. Three things survive.

```
+---------------------------+--------------------------------+
| SURVIVES                  | CONDITION                      |
+---------------------------+--------------------------------+
| RANKING within one axis   | Same graph version. Same       |
|                           | decomposition. Ordinal only.   |
|                           | "Which use case carries the    |
|                           | most tail risk" is answerable. |
+---------------------------+--------------------------------+
| PAIRWISE COMPARISON       | Same graph version. Report the |
| within one axis           | difference with both entries'  |
|                           | distributions, not point       |
|                           | estimates.                     |
+---------------------------+--------------------------------+
| PER-AXIS AGGREGATION by a | Cost: marginal basis only, one |
| NAMED METHOD, declared    | change at a time.              |
|                           | Risk: fitted tail-dependent    |
|                           | copula, family declared, only  |
|                           | where joint observations exist.|
|                           | Option: ONE joint valuation of |
|                           | ONE switching decision under a |
|                           | shared K. Never a sum.         |
+---------------------------+--------------------------------+
```

What does not survive is a single number for the estate, and any cross-axis total. There is no exchange rate between a monthly cost, an annual loss distribution and a horizon-dependent option value, and no attempt to construct one appears anywhere in this framework.

### 9.8.5 Prior art on the aggregation limit

**Two precedents, not one. The second was added at v3.1c and it is the stronger.**

**First.** Durst (2007, *Wertorientiertes Management von IT-Architekturen*, Teubner, Wiesbaden) states at section 6.7.6.5 that overlapping value contributions cannot simply be added, and proposes a cross-settlement between them. **[Strong on substance, Indicative on wording. Read from a scanned source via OCR. Not quoted.]**

**Second.** The granted family at 9.3.9 claims aggregating losses across two or more assets in a **nonlinear sum**, and separately claims aggregation at entity and at portfolio level, with the specification noting that aggregated losses may be simple sums or may involve more complex loss models including thresholds and limits. **[Strong, from claim text read directly.]**

Non-additivity of correlated loss was therefore not merely observed in the literature in 2007. It was claimed as a method in 2018.

**Two distinctions survive and both cut against this framework.**

```
1  They claim a METHOD of aggregating.
   This document specifies a REFUSAL.
   A nonlinear sum is an answer; 9.9 is a decline.

2  Their nonlinear sum is a loss model with thresholds
   and limits, which is an insurance-style construct
   rather than a copula. So the SPECIFIC obstruction at
   9.8.3 result two, copula unidentifiability, is not
   anticipated. What is anticipated is the prior
   observation that correlated losses do not add
   linearly, and the practical route round it.
```

This framework did not notice non-additivity first and must not claim to have. What 9.8.3 adds is the separation into three distinct mechanisms and the statement of what each one blocks. That is a narrower contribution than an original observation, and at v3.1c it is narrower still, because one of the three mechanisms is now known to be a consequence of this framework's own unit of account rather than of the problem.

---

## 9.9 When to refuse

```
+-------------------------------------+------------------------+
| CONDITION                           | ACTION                 |
+-------------------------------------+------------------------+
| Drift above threshold               | Re-mine first          |
+-------------------------------------+------------------------+
| Subdomain ceiling binds in more     | Tail statistics not    |
| than ~1% of simulations             | usable. Refuse or      |
| (declared convention, not derived)  | revalue the subdomain  |
+-------------------------------------+------------------------+
| Failure logic is non-monotone and   | Do not report a        |
| only a static fault tree is         | propagated number      |
| available                           |                        |
+-------------------------------------+------------------------+
| Log-cost series rejects the random  | Do not use sigma for   |
| walk in favour of mean reversion    | option valuation       |
+-------------------------------------+------------------------+
| No exposure measure, so credibility | Report the org figure  |
| weight is unestimable               | unweighted, and say so |
+-------------------------------------+------------------------+
| Counterfactual not evidenced from   | Do not compute the     |
| the decision record per 9.5.7       | option component       |
+-------------------------------------+------------------------+
| The two K reporting points straddle | Do not report the      |
| a discontinuity or flat-then-sharp  | option component       |
| transition in W(K)                  |                        |
+-------------------------------------+------------------------+
| MC(u_new) is computable from        | Use 9.4. Do not reach  |
| metered data                        | for 9.5 at all         |
+-------------------------------------+------------------------+
| g(D) never fitted                   | Drift effect is        |
|                                     | illustrative only      |
+-------------------------------------+------------------------+
| No causal driver for a cost pool    | Declare the basis as   |
|                                     | arbitrary              |
+-------------------------------------+------------------------+
| Fixed-pool share at a shared node   | May not inform an exit |
|                                     | or consolidation call  |
+-------------------------------------+------------------------+
| Portfolio or estate total requested | Refuse the total.      |
| [per 9.8.3]                         | Offer ranking,         |
|                                     | pairwise comparison,   |
|                                     | or a named per-axis    |
|                                     | method per 9.8.4       |
+-------------------------------------+------------------------+
| Comparison spans graph versions     | Do not report the      |
| [per 9.1.1]                         | difference. Re-mine    |
|                                     | both sides to a common |
|                                     | as-at version, or      |
|                                     | declare the comparison |
|                                     | void                   |
+-------------------------------------+------------------------+
| Subdomain decomposition built or    | Fourth scope condition |
| revised by the measuring party      | fails. Do not publish  |
| [per 9.1.2]                         | a coefficient          |
+-------------------------------------+------------------------+
| NOVELTY ASSERTED FOR ANY            | Refuse the assertion.  |
| CONSTRUCTION IN 9.3                 | The risk axis is       |
| [NEW v3.1c, per 9.3.9]              | occupied by a granted  |
|                                     | family. State the      |
|                                     | graph kind and the     |
|                                     | unit of account as the |
|                                     | distinctions instead   |
+-------------------------------------+------------------------+
```

**A recorded refusal is a valid ledger entry.**

---

## 9.10 The worked example

Use case u = "process a product return." Nodes: API gateway (A), order service (B), shared payments service (P) serving four other use cases. Graph version v = 2026-08-09-a. Subdomain decomposition owned by the retail domain architecture function, last revised 2026-02.

**Cost.**

```
Node P: fixed (reserved capacity)     GBP   900/month
        variable (GB-seconds)         GBP 1,500/month

variable share (GB-seconds driver):   0.14
fixed share (declared equal split):   0.20

P attributable = (0.14 * 1,500) + (0.20 * 900) = GBP 390
Plus A (GBP 140) and B (GBP 310), exclusive to u

C_run(u) P50 = GBP 840/month
Bootstrapped over 90 days: P10 GBP 689, P90 GBP 1,043
Fixed-allocation component reported separately: GBP 180
```

Per 9.2.6, the GBP 180 fixed share at P may not inform a decision to leave P. Per 9.8.3, this GBP 840 may not be added to the entries for the four other use cases riding P, and the sum of all five would not be what P plus A plus B costs.

**Frequency.**

```
Industry prior: lambda ~ Gamma(alpha, beta), prior mean 0.18/yr
  k = beta = EPV/VHM = 0.021/0.009 = 2.333 YEARS
  alpha = 0.18 * 2.333 = 0.420

Local data: 1 event over 14 quarters = 3.5 YEARS
  LEF_local = 1/3.5 = 0.286/yr

Posterior mean = (0.420 + 1) / (2.333 + 3.5) = 1.4194/5.833 = 0.2434/yr
Credibility:  Z = 3.5/(3.5+2.333) = 0.600
              0.600 * 0.286 + 0.400 * 0.18 = 0.2434/yr

Both routes agree exactly. That agreement is the check.
```

Reproduced independently at v3.1. Compare with v2.0, which used n = 14 against annual rates and got Z = 0.857 and LEF = 0.274. The unit error overstated the weight on local data by nearly half.

Note per 9.8.3 result two: one observed event supports a margin and supports nothing at all about the dependence between this use case and any other.

**Magnitude and the drift effect.**

```
LM | m ~ Lognormal(m, s^2), median GBP 278,000, s = 1.0
Baseline (tau = 0, perfect knowledge of the parameter):

  median   GBP   278,000
  mean     GBP   458,345
  P99      GBP 2,846,852

Graph last mined 71 days ago. Measured Jaccard drift D = 0.11.
Fitted mapping g gives tau = 0.22.

  median   GBP   278,000    unchanged
  mean     GBP   469,572    +2.45%
  P99      GBP 3,009,717    +5.72%

At D = 0.25, tau = 0.50:
  median   GBP   278,000    unchanged
  mean     GBP   519,372    +13.31%
  P99      GBP 3,746,424    +31.60%
```

All three rows reproduced independently at v3.1.

**Plain English:** the stale map leaves the typical return exactly where it was, nudges your average exposure up two and a half percent, and pushes your bad-day number up nearly six. The tail moves twice as fast as the mean, which is the signature of epistemic uncertainty and the reason a single expected-loss figure hides it.

**Option component of switching cost.**

```
One switching-option model, horizon T = 3 held constant.
Datar-Mathews, 2,000,000 simulated futures, seed 20260809.

mu = 0.12 (risk-adjusted), r = 0.04 (risk-free)
Benefit Delta_V: lognormal, median GBP 700k, log-sd 0.60

  W(K = GBP 180k, reversible)  = GBP 426,004
  W(K = GBP 640k, committed)   = GBP 144,547
  option component             = GBP 281,457

  execution component (declared) = GBP 460,000
    ( = 640,000 - 180,000 )

  broad switching cost, DECOMPOSED = GBP 741,457
    This REPLACES a broad switching-cost estimate.
    It is NOT added to one.

Monotone decreasing in K across GBP 0 to 1.2M: verified.
W(K) evaluated across the full range per 9.5.4; both
reporting points lie on a continuous section of the curve.

Counterfactual: standard-interface design at GBP 180k exit
cost, evidenced from ADR-2024-118, an option evaluated and
rejected at the original platform selection. Satisfies
9.5.7 (i), (ii) and (iii).
```

Under the incorrect single-rate v2.0 formula the same inputs give GBP 326,782, an overstatement of about 16 percent. Both figures reproduced independently at v3.1.

The commitment priced here is a platform commitment shared by this use case and the four others riding P. GBP 281,457 is the option component of **that one commitment**, viewed from this use case. It is not a per-use-case quantity to be multiplied by five, and reporting it five times would count one escape five times per 9.8.3 result three.

**Sensitivity.**

```
Business case x 0.7 -> option component approx GBP 201,381
Business case x 1.3 -> option component approx GBP 330,427

Reported: P50 GBP 281k, range GBP 201k to GBP 330k
Method: Datar-Mathews two-rate, seed 20260809
Curve: W(K) over GBP 0 to 1.2M, continuous at both points
Graph version: 2026-08-09-a
Decomposition owner: retail domain architecture function
```

**Reading the example at v3.1c.** Of the four blocks above, the cost block and the option block are the two that carry anything the prior art does not do, and the option block is the one whose value is untested. The frequency and magnitude blocks are a correct FAIR implementation with an actuarial frequency estimator, computed over a graph. That combination is granted to another party per 9.3.9. The worked example is a demonstration of computability, which is what it always claimed to be, and it is not evidence of originality on the risk axis.

---

## 9.11 The falsification test

```
Delta_cost_change(n) = gamma0 + gamma1 * OC(n) + controls + error
```

Version 1.0 did not notice this was circular. Version 2.0 listed three fixes and called it solved. **It is not solved by a list.** Controls reduce omitted-variable bias; they do not identify a causal effect when commitment is chosen rather than assigned.

A design that would work:

```
Difference-in-differences around an exogenous repricing event

  Treatment: components affected by a vendor price change
             or regulatory mandate not chosen by the team
  Control:   comparable never-affected components
  Outcome:   realised cost of change from change records,
             measured independently of the model
  Required:  pre-trend test showing the two groups moved
             in parallel before the event
```

**And the exclusion restriction must be argued, not assumed.** A vendor repricing plausibly affects the cost of change **directly**, not only through the option component, which would violate exclusion and invalidate the design. An acquisition may correlate with unobserved architectural quality. Name the threat and address it, or the test proves nothing.

**Build OC from ex-ante inputs only**, excluding any realised or estimated cost of change, or the regressor contains the outcome.

Ground truth must come from data the model did not generate. Public fault-injection benchmarks with labelled propagation exist. One warning from that literature: several widely used benchmarks are simple enough that trivial rule-based methods match state-of-the-art results, so choose a hard one.

### 9.11.1 H6

The v3.0 form of H6 asked whether the forfeited option is distinct from switching cost. That was close to unfalsifiable, because the quantity is computed as W(K_low) minus W(K_high) and is therefore a deterministic function of the switching-cost settings. It cannot fail to be related to switching cost. The value function is nonlinear in K, so the relationship is not literally one-for-one, which made the old hypothesis technically falsifiable in the way that any nonlinear transform is not the identity. That is a lawyer's escape, not a test.

The replacement:

```
H6
  The option component of switching cost is a material
  fraction of the total and varies independently of the
  execution component across commitments.

FALSIFIED IF
  the ratio of option component to execution component is
  stable across commitments (the split carries no
  information), OR the option component is immaterial
  relative to its own estimation error.

CONSEQUENCE IF FALSIFIED
  Delete section 9.5. Flexibility is then measured by
  section 9.4 alone, which is metered and needs no
  valuation model.

CONSEQUENCE RESTATED AT v3.1c
  With the risk axis occupied per 9.3.9, deleting 9.5
  leaves NO construction in this document that is not
  either commodity, standard practice, or granted to
  another party. The framework would then consist of a
  unit of account and a graph kind, neither of which has
  a test attached to it. See 9.11.5.
```

**Priority.** H6 should be designed and run before further documentation work. No revision of these documents changes what it returns, and it now decides whether anything specified here is unoccupied.

### 9.11.2 H10, and the more serious kill risk

Section 9.2.7 concedes that the architectural coefficient is a residual absorbing workload mix, vendor-side performance change, tenancy effects and measurement error alongside anything architecture does. H10 is the test that the residual has anything to do with architecture at all.

```
H10
  Within the measurement horizon, movement in the
  architectural coefficient FOLLOWS architectural change.

TEST
  Build an architectural change series X(t) INDEPENDENTLY
  of the coefficient: from change records, deployment
  events, or graph diffs between minings.
  Estimate cross-correlation of Delta(coefficient) with
  X(t) at lags 0 .. L, with L bounded by the measurement
  horizon.

FALSIFIED IF
  uncorrelated at EVERY observable lag.

CONSEQUENCE IF FALSIFIED
  The coefficient is noise with respect to architecture.
  All three axes fall together, because all three are
  computed on the same mined graph and the same declared
  unit. This is not a section deletion. It is the end of
  the practice.
```

**Design caution one, and it is the one that kills the test if ignored.** X(t) must never be built from cost movements, from the coefficient, or from anything downstream of the meter. A change series derived from billing data will correlate with the coefficient by construction and the test will pass while establishing nothing. Change records and graph diffs are the admissible sources.

**Design caution two, graph version.** The confound bites hardest exactly on lag estimation. The coefficient is computed against G[v], and v changes at re-mining. If re-mining is triggered by, or clustered with, architectural change, then the coefficient moves at the moment of change for a measurement reason rather than an economic one, and the estimated lag is an artefact of the mining schedule. Mitigation: hold the mining schedule independent of the change calendar, record v with every observation, and report the test with graph-version boundaries marked.

**Why H10 outranks H6, and why that ordering does not settle priority.** H10 falsified removes the object all three axes are attached to; H6 falsified removes one section. H10 is therefore the more total kill. But H6 decides whether the framework asserts anything unoccupied at all, and H6 is the cheaper of the two to run, because it needs a set of commitments with declared switching costs rather than a longitudinal estate with an independent change series. **Run H6 first on cost grounds, not on importance grounds, and say which reason is operating.**

### 9.11.3 Selection effect on H1

H1 is tested only on estates that meet the scope conditions at 9.1.2, which now include a pre-existing, independently owned subdomain decomposition and telemetry good enough to mine a graph. Estates meeting those conditions are, by construction, already well instrumented and already architecturally governed.

```
A POSITIVE result in that population does not
generalise to estates that do not meet the conditions.

A NULL result in that population is UNINTERPRETABLE:
it cannot be distinguished from a ceiling effect in a
population with little headroom left.
```

**Plain English:** the only places you can run the test are the places least likely to show a difference, so a flat result tells you nothing and a good result tells you nothing about anywhere else. This is a limit on what the falsification programme can establish and it is not fixable by sample size.

### 9.11.4 Durst's six barriers, in mathematical terms

Durst (2007) sets out six barriers to direct valuation of IT architecture at sections 6.5.1 to 6.5.6, and concludes that direct calculation is not achievable, going indirect at 6.7.6. **[Strong on substance from direct reading of the source; Indicative on wording; read via OCR and not quoted.]** Two prior versions of this framework's documents stated three barriers. There are six. Part IX carried no count, so this is an addition rather than a correction, but the same error could have landed here.

The framework's position, barrier by barrier, with the mathematics that carries it:

```
+---------+--------------------------+---------------------+
| BARRIER | FRAMEWORK POSITION       | WHERE               |
+---------+--------------------------+---------------------+
| 6.5.1   | ANSWERED. The unit of    | 9.1.2, 9.2.2        |
| distance| account IS a use case in |                     |
| from    | a business subdomain and |                     |
| value   | the driver is metered    |                     |
| creation| business activity, so    |                     |
|         | the quantity attaches to |                     |
|         | business volume by       |                     |
|         | construction, not by     |                     |
|         | inference across a gap.  |                     |
+---------+--------------------------+---------------------+
| 6.5.2   | SIDESTEPPED. ADMISSION   | none                |
| measur- | OF FAILURE. The ledger   |                     |
| ing the | measures cost, monetary  |                     |
| value   | risk and forgone option  |                     |
| contri- | value. None of the three |                     |
| bution  | is a value contribution. |                     |
|         | The framework changed    |                     |
|         | the question rather than |                     |
|         | answering his.           |                     |
+---------+--------------------------+---------------------+
| 6.5.3   | PARTIAL. Causal driver   | 9.2.2, 9.2.6, 9.8.3 |
| holism, | allocation is defensible |                     |
| attrib- | for the variable pool    |                     |
| ution   | and NOT for the fixed    |                     |
|         | pool. And 9.8.3 shows    |                     |
|         | the parts do not         |                     |
|         | reassemble into a whole, |                     |
|         | which is his point       |                     |
|         | restated in our own      |                     |
|         | mathematics against us.  |                     |
+---------+--------------------------+---------------------+
| 6.5.4   | ANSWERED, BUT BY         | 9.1.1               |
| data    | INSTRUMENTATION, NOT BY  |                     |
| acquis- | THIS FRAMEWORK. Distri-  |                     |
| ition   | buted tracing and IaC    |                     |
|         | state made the data      |                     |
|         | cheap. Nothing here      |                     |
|         | earns credit for that.   |                     |
|         | And somebody else acted  |                     |
|         | on it in 2018. [v3.1c]   |                     |
+---------+--------------------------+---------------------+
| 6.5.5   | PARTIAL. The framework   | 9.7, 9.8, 9.9,      |
| fore-   | outputs distributions    | 9.6.4               |
| casting | rather than point        |                     |
| problem | forecasts and refuses    |                     |
|         | where estimation fails.  |                     |
|         | But the option component |                     |
|         | still needs a forward    |                     |
|         | value distribution that  |                     |
|         | is estimated, not        |                     |
|         | observed, and 9.6.4 says |                     |
|         | so plainly.              |                     |
+---------+--------------------------+---------------------+
| 6.5.6   | UNANSWERED. ADMISSION    | H10 only, and it    |
| tempor- | OF FAILURE. Every        | does not close it   |
| al      | quantity here is         |                     |
| delay   | measured contempor-      |                     |
|         | aneously. H10 is the     |                     |
|         | only lag-aware construct |                     |
|         | and it tests lags WITHIN |                     |
|         | a measurement horizon    |                     |
|         | shorter than the delays  |                     |
|         | Durst describes.         |                     |
+---------+--------------------------+---------------------+
```

Two of six are open admissions of failure. That is the honest count and it belongs in the register rather than in a footnote.

**One finding in Durst's favour and against occupancy.** At 6.7.3.9 his treatment of strategic options is a qualitative benefit narrative with no volatility, no valuation and no option pricing, and at 6.7.6.4 he states that flexibility improvements are difficult to calculate and monetise and carries them qualitatively. He **declines** the flexibility axis rather than occupying it. **[Strong on substance, Indicative on wording, not quoted.]** That supports the non-occupancy finding for section 9.5 and does not support any claim of originality for the mathematics in it, which remains Kulatilaka's and Trigeorgis's.

### 9.11.5 The missing hypothesis, new at v3.1c

Sections 9.1.1 and 9.1.2 now carry two of the framework's three remaining assertions: that an internal call-structure graph is a better substrate than an outside-in exposure graph, and that a use case within a declared business subdomain is a better unit of account than an importance-weighted asset. Neither has a hypothesis attached to it. Ten hypotheses exist and none tests either.

```
H11, NOT YET WRITTEN

  Sketch: does the declared subdomain decomposition
  determine the ledger? Two competent analysts, one
  estate, independently drawn boundaries, same graph
  version. Compare the resulting entries on each axis.

  FALSIFIED IF the entries differ materially, in which
  case the practice measures the decomposition rather
  than the architecture.

  Status: a sketch, not a design. The comparison metric,
  the materiality threshold and the sampling of analysts
  are all unspecified, and writing it properly is a
  design task rather than an editorial one. It is
  recorded here unwritten rather than written badly.
```

This is a gap in the falsification programme and it is stated as one. A framework whose two load-bearing assertions have no test is not falsifiable in the places it now most needs to be.

---

## 9.12 What is contested, listed separately

```
+---------------------------+--------------------------------+
| ITEM                      | THE CONTEST                    |
+---------------------------+--------------------------------+
| Real-world probabilities  | Borison (2005): not a market   |
| in Datar-Mathews          | value if inputs are subjective |
+---------------------------+--------------------------------+
| Size-scaling of external  | Shih et al. (2000): size       |
| loss data                 | explains little. Cope & Labbi  |
|                           | attribution [Asserted],        |
|                           | see 9.3.3                      |
+---------------------------+--------------------------------+
| Activity-based costing    | Kaplan's own move to TDABC;    |
|                           | driver weights unstable        |
+---------------------------+--------------------------------+
| Volatility of a non-      | MAD approach criticised as     |
| traded asset              | circular                       |
+---------------------------+--------------------------------+
| GBM for a cost series     | Likely mean-reverting; test it |
+---------------------------+--------------------------------+
| Narrow vs broad switching | Klemperer 1995: the broad      |
| cost                      | definition already contains    |
|                           | the option component. Handled  |
|                           | by decomposition, see 9.5.2    |
+---------------------------+--------------------------------+
| Whether a non-aggregable  | Open. C1 says it is a          |
| measure is management-    | measurement and not a          |
| useful [v3.1b]            | management system. A reader    |
|                           | may reasonably hold that a     |
|                           | measure no executive can total |
|                           | will not be adopted, and no    |
|                           | evidence here refutes that.    |
+---------------------------+--------------------------------+
| Declared subdomain        | Open. The rate-of-change       |
| boundary [v3.1b]          | defence at 9.1.2 is partial    |
|                           | and licenses movement claims   |
|                           | only, not level claims.        |
+---------------------------+--------------------------------+
| Whether an internal call  | Open, and now load-bearing.    |
| graph is a better         | The prior art at 9.3.9 uses    |
| substrate than an         | an outside-in graph and        |
| outside-in exposure       | reaches a portfolio position   |
| graph [NEW v3.1c]         | this framework cannot. No      |
|                           | evidence either way. See       |
|                           | 9.11.5.                        |
+---------------------------+--------------------------------+
```

---

## 9.13 The method register

```
+--------------------+-------------------+---------------------+
| METHOD             | BORROWED FROM     | FAILS WHEN          |
+--------------------+-------------------+---------------------+
| Cost pool          | Activity-based    | Driver not causal;  |
| separation         | costing, FinOps   | death spiral on     |
|                    |                   | fixed allocation    |
+--------------------+-------------------+---------------------+
| LEF x LM, with     | FAIR (Open Group  | SLEF treated as 1   |
| secondary = SLEF   | O-RA / O-RT)      |                     |
| x SLM              |                   |                     |
+--------------------+-------------------+---------------------+
| Poisson-gamma      | Bayesian          | Variance components |
| credibility        | credibility;      | unestimable at tiny |
| (exact credibility)| Jewell 1974;      | samples; units      |
|                    | Buhlmann & Gisler | mismatched          |
+--------------------+-------------------+---------------------+
| Buhlmann-Straub    | Actuarial         | Used with period    |
| with exposure      | credibility       | counts instead of   |
|                    |                   | exposure            |
+--------------------+-------------------+---------------------+
| Poisson exposure   | Count regression  | Applied to severity |
| offset (frequency) |                   |                     |
+--------------------+-------------------+---------------------+
| Common-cause       | Reliability,      | Shared factor       |
| conditioning       | operational risk  | unidentified        |
+--------------------+-------------------+---------------------+
| SEEDED MONTE CARLO | US 10,257,219 and | Presented as        |
| PROPAGATION OVER A | continuations,    | original. It is     |
| DEPENDENCY GRAPH,  | priority Mar 2018 | granted. 9.3.9      |
| per-edge condit-   | [PRIOR ART,       |                     |
| ional probability, | v3.1c]            |                     |
| variance-threshold |                   |                     |
| termination        |                   |                     |
+--------------------+-------------------+---------------------+
| DOLLAR-DENOMINATED | Same family,      | Presented as        |
| LOSS EXCEEDANCE    | specification     | original. It is in  |
| CURVE OVER A       | [PRIOR ART,       | the specification.  |
| DISCOVERED GRAPH   | v3.1c]            | 9.3.9               |
+--------------------+-------------------+---------------------+
| Fault tree + BDD,  | Rauzy 1993;       | Structure NOT       |
| inclusion-exclusion| Sinnamon & Andrews| monotone            |
+--------------------+-------------------+---------------------+
| CTMC, stochastic   | Reliability       | State space         |
| Petri net, dynamic | engineering       | explosion           |
| fault tree         |                   |                     |
+--------------------+-------------------+---------------------+
| Influence diagrams | KTH probabilistic | Structure unknown   |
|                    | EA school         | or unstable         |
+--------------------+-------------------+---------------------+
| Tail-dependent     | Embrechts, McNeil | Gaussian choice     |
| copula             | & Straumann 2002  | zeroes tail dep.    |
+--------------------+-------------------+---------------------+
| Copula-based       | Sklar; standard   | No joint loss       |
| PORTFOLIO          | risk aggregation  | observations, so    |
| aggregation        |                   | C is unidentifiable.|
|                    |                   | Then do not         |
|                    |                   | aggregate. 9.8.3    |
+--------------------+-------------------+---------------------+
| NONLINEAR SUM      | Same family,      | Claimed as a novel  |
| AGGREGATION ACROSS | claims            | limitation. The     |
| ASSETS, ENTITIES   | [PRIOR ART,       | non-additivity was  |
| AND PORTFOLIOS     | v3.1c]            | claimed in 2018.    |
|                    |                   | 9.8.5               |
+--------------------+-------------------+---------------------+
| Option interaction | Trigeorgis 1993   | Option values       |
| and non-additivity |                   | summed. Convexity   |
|                    |                   | means the sum       |
|                    |                   | exceeds the joint   |
|                    |                   | value. 9.8.3        |
+--------------------+-------------------+---------------------+
| Option-killing by  | Dixit & Pindyck   | Presented as        |
| irreversible       | 1994              | original.           |
| commitment         |                   | It is textbook.     |
+--------------------+-------------------+---------------------+
| Switching option   | Kulatilaka 1988;  | Hysteresis makes    |
|                    | Kulatilaka &      | the comparative     |
|                    | Trigeorgis 1994   | static non-smooth;  |
|                    |                   | points straddle a   |
|                    |                   | band boundary       |
+--------------------+-------------------+---------------------+
| Switching cost as  | Klemperer 1995;   | Components summed   |
| an aggregate to be | Farrell &         | rather than split.  |
| split              | Klemperer 2007    | That double-counts. |
+--------------------+-------------------+---------------------+
| Datar-Mathews,     | Datar & Mathews   | Single discount     |
| two-rate           | 2004              | rate; subjective    |
|                    |                   | inputs (Borison);   |
|                    |                   | measures mixed      |
+--------------------+-------------------+---------------------+
| Normal-normal      | Standard Bayesian | g(D) not fitted     |
| parameter          | conjugacy;        |                     |
| uncertainty        | Klinker 1997      |                     |
+--------------------+-------------------+---------------------+
| Jaccard distance   | Levandowsky &     | Edge sets not       |
|                    | Winter 1971;      | comparable          |
|                    | Kosub 2019        |                     |
+--------------------+-------------------+---------------------+
| Realised volatility| Barndorff-Nielsen | Series mean-        |
| with jump-robust   | & Shephard 2004   | reverting; graph    |
| estimators         |                   | version breaks not  |
|                    |                   | treated as jumps    |
+--------------------+-------------------+---------------------+
| Difference-in-     | Applied           | Exclusion           |
| differences        | econometrics      | restriction fails   |
+--------------------+-------------------+---------------------+
| Cross-correlation  | Time series       | Change series built |
| at lag             |                   | from cost data;     |
|                    |                   | mining schedule     |
|                    |                   | clustered with      |
|                    |                   | change. 9.11.2      |
+--------------------+-------------------+---------------------+
| Non-additivity of  | Durst 2007        | Claimed as an       |
| overlapping value  | s.6.7.6.5         | original observat-  |
| contributions      | [PRIOR ART]       | ion. It is not.     |
|                    |                   | 9.8.5               |
+--------------------+-------------------+---------------------+
| Bootstrap          | Standard          | Too little history  |
+--------------------+-------------------+---------------------+

REMOVED AT v3.0: Percolation (asymptotic assumptions do not
                 hold on finite engineered graphs)
```

**Count at v3.1c: three entries in this register are prior art the framework had been treating as its own assembly.** Durst on non-additivity, added at v3.1b, and the two patent entries added here. In every case the correction came from opening a source rather than from reasoning about one.

---

## 9.14 Correction log, v2.0 to v3.0

```
+----+----------------------------+-------------------------+
| ID | v2.0 ERROR                 | v3.0 REPLACEMENT        |
+----+----------------------------+-------------------------+
| G1 | "Drift widens variance     | FALSE for skewed loss.  |
|    | but leaves the mean        | Median is invariant;    |
|    | unchanged"                 | mean and tail both rise |
|    |                            | (Jensen; Klinker 1997)  |
+----+----------------------------+-------------------------+
| G2 | Datar-Mathews with ONE     | Two rates, applied to   |
|    | risk-free discount outside | each leg INSIDE the max.|
|    | the max                    | Example fell 327k to    |
|    |                            | 281k                    |
+----+----------------------------+-------------------------+
| G3 | Plain Buhlmann mislabelled | Poisson-gamma stated    |
|    | Buhlmann-Straub; n in      | directly; exposure in   |
|    | quarters vs annual rates   | YEARS; B-S with true    |
|    |                            | exposure. Z 0.857->0.600|
+----+----------------------------+-------------------------+
| G4 | Independent AND rule while | Common-cause            |
|    | insisting on tail          | conditioning. The two   |
|    | dependence elsewhere       | positions contradicted  |
+----+----------------------------+-------------------------+
| G5 | Hard cap at subdomain VaR  | Explicit censoring;     |
|    |                            | report binding rate;    |
|    |                            | refuse above ~1%        |
+----+----------------------------+-------------------------+
| G6 | Severity-style scaling     | Poisson exposure offset |
|    | exponent applied to        | for counts              |
|    | frequency                  |                         |
+----+----------------------------+-------------------------+
| G7 | "Comonotonic addition      | Comonotonic VaR is      |
|    | overstates VaR"; heavy     | EXACTLY additive.       |
|    | tails break sub-additivity | Super-additivity needs  |
|    |                            | tail index alpha < 1    |
+----+----------------------------+-------------------------+
| G8 | Fault trees assumed to     | Monotonicity check      |
|    | apply to service graphs    | required. CTMC/SPN/DFT  |
+----+----------------------------+-------------------------+
| G9 | Cycle retraction too broad;| DBNs handle feedback    |
|    | LBP "usually convergent"   | over time, NOT          |
|    |                            | instantaneous cycles    |
+----+----------------------------+-------------------------+
|G10 | Percolation retained with  | REMOVED as a            |
|    | a caveat                   | quantitative method     |
+----+----------------------------+-------------------------+
|G11 | "No volatility input       | Overclaim. Volatility   |
|    | required"                  | lives in the simulated  |
|    |                            | dispersion              |
+----+----------------------------+-------------------------+
|G12 | SR 11-7 cited as grounding | It warns AGAINST opaque |
|    | for the decay term         | conservative add-ons    |
+----+----------------------------+-------------------------+
|G13 | GBM assumed for cost series| Unit-root gate added    |
+----+----------------------------+-------------------------+
|G14 | Falsification "fixed" by a | Concrete DiD design;    |
|    | list of three requirements | exclusion argued        |
+----+----------------------------+-------------------------+
|G15 | FAIR secondary loss as a   | Secondary = SLEF x SLM  |
|    | flat additive term         |                         |
+----+----------------------------+-------------------------+
|G16 | Identification problem     | Twin security, sector   |
|    | presented as near-         | volatility, MAD, each   |
|    | unsolvable                 | with its critique       |
+----+----------------------------+-------------------------+
```

---

## 9.15 Correction log, v3.0 to v3.1

```
+----+----------------------------+-------------------------+
| ID | v3.0 ERROR                 | v3.1 REPLACEMENT        |
+----+----------------------------+-------------------------+
| H1 | Forfeited option presented | OCCUPIED. Dixit &       |
|    | as an original instrument  | Pindyck 1994 state the  |
|    | with an open "inverted     | option-killing result   |
|    | sign"                      | directly. Novelty claim |
|    |                            | withdrawn. 9.5.1        |
+----+----------------------------+-------------------------+
| H2 | FO reported alongside a    | Reframed as a DECOM-    |
|    | broad switching-cost       | POSITION of switching   |
|    | figure, which double-counts| cost. Never summed with |
|    | (Klemperer 1995)           | a broad figure. 9.5.2   |
+----+----------------------------+-------------------------+
| H3 | Narrow K anchored to the   | Anchor REMOVED. Data    |
|    | EU Data Act switching      | Act Art. 29(1) zeroes   |
|    | charge                     | the charge from 12 Jan  |
|    |                            | 2027. 9.5.8             |
+----+----------------------------+-------------------------+
| H4 | Hysteresis recorded as a   | Promoted to a REFUSAL   |
|    | caveat; number reported    | condition. W(K) curve   |
|    | anyway                     | now required. 9.5.4     |
+----+----------------------------+-------------------------+
| H5 | H6 asked whether FO is     | Rewritten to ask        |
|    | distinct from K. Near-     | whether the split       |
|    | unfalsifiable by           | carries information.    |
|    | construction               | Can return a kill.9.11.1|
+----+----------------------------+-------------------------+
| H6 | 1% censoring threshold     | Declared as an          |
|    | presented as derived       | operating convention.   |
|    |                            | 9.3.4                   |
+----+----------------------------+-------------------------+
| H7 | Cope & Labbi conclusion    | Downgraded to           |
|    | asserted as established    | [Asserted] pending a    |
|    |                            | source-body check. The  |
|    |                            | rule stands regardless. |
|    |                            | 9.3.3                   |
+----+----------------------------+-------------------------+
| H8 | Cost identity implied to   | Flagged as a definition.|
|    | establish that architecture| Coefficient is an       |
|    | drives the coefficient     | under-identified        |
|    |                            | residual. 9.2.7         |
+----+----------------------------+-------------------------+
| H9 | Shared-node fixed          | Stated as a structural  |
|    | allocation treated as a    | limit at the point of   |
|    | reporting caveat           | largest decisions.9.2.6 |
+----+----------------------------+-------------------------+
```

**Survived from v3.0 unchanged and independently re-verified at v3.1:** the Poisson-gamma exact-credibility construction and its worked figures; the lognormal parameter-uncertainty result and all three drift rows; the comonotonic-VaR and tail-index conditions; the Gaussian copula prohibition; the monotonicity precondition on fault trees; the Jaccard metric; the percolation removal; the two-rate Datar-Mathews structure and both worked figures; the unit-root gate; the distributional philosophy; the refusal principle; the declared counterfactual as a required field.

---

## 9.16 What the mathematics claims

**It claims** that these quantities are computable from data an enterprise already emits, with honest ranges, demonstrated at one node, one use case, one subdomain.

**It does not claim** that the numbers predict, that the framework scales, or that any organisation will act on the output.

**It does not claim that the quantities combine.** The ledger is a set of per-use-case measurements that cannot be totalled, for three separate reasons set out at 9.8.3, and reading principle C1 states the consequence: this is an instrument, not a management system. Any executive-level roll-up presented as an output of this framework is outside what the mathematics supports. **Qualified at v3.1c:** one of those three reasons, the copula obstruction, is a consequence of the unit of account rather than of the problem, since an uncut single-graph simulation reaches a joint position without a copula. The refusal stands for this framework. It is not a general result.

**It claims novelty for no method above.** Every formula belongs to someone else. **And at v3.1c the assembly is smaller than v3.1b implied.** The mined substrate is commodity. The inverted-sign option is textbook. The non-additivity of overlapping value contributions was stated by Durst in 2007 and claimed as a nonlinear sum in 2018. And the entire risk axis, seeded Monte Carlo propagation over a dependency graph with per-edge conditional probabilities producing a dollar-denominated loss exceedance curve, is granted to another party with a March 2018 priority date.

**What is left, stated exactly.**

```
1  The unit of account: a use case within a named
   business subdomain, with all three axes expressed
   against it. DECLARED, not mined (9.1.2). No test.

2  The graph kind: internal service-to-service call
   structure rather than outside-in infrastructure and
   vendor exposure (9.1.1). No test.

3  The switching-cost decomposition at 9.5.2. H6 tests
   it and H6 can return a kill.

4  Telemetry-derived volatility as a valuation input
   (9.6.4), open only on absence of a found occupant,
   which is the evidence type that has now failed twice.
```

Items 1 and 2 have no hypothesis attached to them, which 9.11.5 records as a gap. Item 3 has a test that has not been run. Item 4 rests on the weakest evidence in the document. **That is the whole of the residual and it should be presented in that order.**

**And it now carries its own evidence about how the assembly should be judged.** Version 1.0 had four fatal errors. Version 2.0 fixed those and introduced three more, every one caused by adopting a replacement that sounded authoritative without checking it against its primary source. Version 3.0 fixed those and carried a different kind of error: not an unverified borrowing but an unverified **absence**, a claim that something was missing from a literature, made without opening two books already sitting in the reference list. Version 3.1a carried a fifth kind: a structural detail, a count of barriers, taken from a summary of a source rather than the source. Version 3.1b carried a sixth: an occupancy verdict on an entire axis, taken from a summary of a patent family cited by number since v1.0 and never opened.

The failure mode was consistent across all five rounds and it was not ignorance of the mathematics. It was confidence. At v1.0 and v2.0, confidence in a method. At v3.0, confidence in a gap. At v3.1a, confidence in a proxy read. At v3.1b, confidence in a citation.

That is worth publishing precisely because it is unflattering. It is not, however, the contribution. A correction log is process hygiene, and treating it as the achievement would be a way of not saying that two central claims did not survive.

---

## 9.17 Correction log, v3.1a to v3.1b

```
+-----+---------------------------+--------------------------+
| ID  | v3.1a POSITION            | v3.1b REPLACEMENT        |
+-----+---------------------------+--------------------------+
| S12 | Five reading rules, none  | Reading principle C1     |
|     | addressing aggregation    | added: a measurement     |
|     |                           | that cannot be           |
|     |                           | aggregated is still a    |
|     |                           | measurement, but it is   |
|     |                           | not a management system. |
|     |                           | Preamble.                |
+-----+---------------------------+--------------------------+
| S13 | Failure modes stopped at  | Failure mode 5 added:    |
|     | the fabricated quotation. | structural detail from a |
|     | "A quotation is a claim"  | proxy read. A count, a   |
|     | was too narrow            | section number, an       |
|     |                           | ordering. New convention |
|     |                           | SUMMARISED IS NOT READ.  |
|     |                           | Preamble, 9.16.          |
+-----+---------------------------+--------------------------+
| S14 | No source-medium grading  | OCR caution: substance   |
|     | rule for OCR              | Strong, wording          |
|     |                           | Indicative, nothing      |
|     |                           | quoted. Preamble.        |
+-----+---------------------------+--------------------------+
| S15 | Unit of account presented | DECLARED, not mined. The |
|     | as an artefact of the     | practice is a HYBRID.    |
|     | mined graph               | Rate-of-change defence   |
|     |                           | stated AS partial and    |
|     |                           | licensing movement       |
|     |                           | claims only. FOURTH      |
|     |                           | SCOPE CONDITION added:   |
|     |                           | decomposition must be    |
|     |                           | pre-existing and         |
|     |                           | independently owned.     |
|     |                           | R13 logged. 9.1.2.       |
+-----+---------------------------+--------------------------+
| S16 | Graph treated as a fixed  | Graph VERSION introduced.|
|     | object                    | Every entry carries v.   |
|     |                           | Cross-version comparison |
|     |                           | is a refusal. 9.1.1,     |
|     |                           | 9.8.2, 9.9.              |
+-----+---------------------------+--------------------------+
| S17 | L(u) braces not explained | The ledger entry is a    |
|     |                           | SET, not a sum. R14      |
|     |                           | logged. 9.1.3.           |
+-----+---------------------------+--------------------------+
| S18 | w_u(n) presented as a     | It is a share only if    |
|     | share without stating the | the denominator runs     |
|     | completeness condition    | over EVERY consumer.     |
|     |                           | Normally it does not.    |
|     |                           | 9.2.2, feeding 9.8.3.    |
+-----+---------------------------+--------------------------+
| S19 | Shared-node limit stated  | Extended: only a         |
|     | for reporting             | MARGINAL basis answers   |
|     |                           | a removal question, and  |
|     |                           | marginals do not sum     |
|     |                           | either. 9.2.6, 9.4.      |
+-----+---------------------------+--------------------------+
| S20 | Non-additivity appeared   | STATED MATHEMATICALLY,   |
|     | as a one-line caveat at   | three separate results   |
|     | 9.5.3 and nowhere else    | with three separate      |
|     |                           | mechanisms: incomplete   |
|     |                           | allocation base, copula  |
|     |                           | unidentifiability,       |
|     |                           | option convexity and     |
|     |                           | shared K. What is        |
|     |                           | offered instead is       |
|     |                           | specified. NEW 9.8.3,    |
|     |                           | 9.8.4.                   |
+-----+---------------------------+--------------------------+
| S21 | No prior art on the       | Durst 6.7.6.5 states     |
|     | aggregation limit         | overlapping contribut-   |
|     |                           | ions cannot simply be    |
|     |                           | added and proposes       |
|     |                           | cross-settlement. We did |
|     |                           | not notice it first.     |
|     |                           | NEW 9.8.5, 9.13.         |
+-----+---------------------------+--------------------------+
| S22 | Reporting standard had no | Graph version, decomp-   |
|     | provenance fields         | osition owner and        |
|     |                           | counterfactual identif-  |
|     |                           | ier become REQUIRED.     |
|     |                           | 9.8.2.                   |
+-----+---------------------------+--------------------------+
| S23 | Counterfactual required   | ADJUDICATION RULE: the   |
|     | to be declared, with no   | alternative must have    |
|     | test of admissibility     | been on the table at     |
|     |                           | decision time AND        |
|     |                           | evidenced from the       |
|     |                           | decision record by a     |
|     |                           | dated, cited artefact.   |
|     |                           | Otherwise refuse. 9.5.7, |
|     |                           | 9.9.                     |
+-----+---------------------------+--------------------------+
| S24 | Nine hypotheses. H6 the   | TEN. H10 added: coeff-   |
|     | only kill risk            | icient movement follows  |
|     |                           | architectural change     |
|     |                           | within the horizon.      |
|     |                           | Falsified if uncorrel-   |
|     |                           | ated at any observable   |
|     |                           | lag. SECOND AND MORE     |
|     |                           | SERIOUS KILL RISK: it    |
|     |                           | takes all three axes.    |
|     |                           | Two design cautions      |
|     |                           | stated. NEW 9.11.2.      |
+-----+---------------------------+--------------------------+
| S25 | No treatment of who can   | Selection effect on H1:  |
|     | be measured               | a null in the measurable |
|     |                           | population is UNINTER-   |
|     |                           | PRETABLE. NEW 9.11.3.    |
+-----+---------------------------+--------------------------+
| S26 | Durst's barriers absent   | SIX barriers answered    |
|     | from this document. Two   | one by one with the      |
|     | companion documents had   | mathematics that carries |
|     | published THREE           | each, including TWO      |
|     |                           | admissions of failure:   |
|     |                           | 6.5.2 sidestepped, 6.5.6 |
|     |                           | unanswered. 6.5.4        |
|     |                           | answered by INSTRUMENT-  |
|     |                           | ATION, not by the        |
|     |                           | framework. NEW 9.11.4.   |
+-----+---------------------------+--------------------------+
```

---

## 9.18 Correction log, v3.1b to v3.1c

```
+-----+---------------------------+--------------------------+
| ID  | v3.1b POSITION            | v3.1c REPLACEMENT        |
+-----+---------------------------+--------------------------+
| S27 | The risk axis carried no  | NEW 9.3.9. The granted   |
|     | prior-art statement. The  | family read at CLAIM     |
|     | patent family was known   | level for four grants    |
|     | to the framework and      | and at SPECIFICATION     |
|     | described from a summary  | level for US 10,257,219. |
|     | in companion documents.   | Chain, claim content and |
|     |                           | specification content    |
|     |                           | stated. The construction |
|     |                           | in 9.3 is granted to     |
|     |                           | another party, priority  |
|     |                           | March 2018. NO           |
|     |                           | MATHEMATICS CHANGES.     |
+-----+---------------------------+--------------------------+
| S28 | 9.3.5 and 9.3.6 stated    | Prior-art notes added at |
|     | propagation methods with  | both, per reading        |
|     | no occupancy position     | principle C2. What is    |
|     |                           | NOT in the claims is     |
|     |                           | named: the monotonicity  |
|     |                           | precondition and the     |
|     |                           | structure-to-method      |
|     |                           | selection logic. Stated  |
|     |                           | as thin.                 |
+-----+---------------------------+--------------------------+
| S29 | 9.8.3 result two treated  | QUALIFIED. The copula    |
|     | copula unidentifiability  | obstruction follows from |
|     | as a property of the      | cutting the graph into   |
|     | problem                   | declared units first. An |
|     |                           | uncut single-graph       |
|     |                           | simulation reaches the   |
|     |                           | joint directly and needs |
|     |                           | no copula, which is what |
|     |                           | the prior art does. The  |
|     |                           | obstruction is partly a  |
|     |                           | consequence of 9.1.2.    |
|     |                           | Also 9.3.8, 9.16.        |
+-----+---------------------------+--------------------------+
| S30 | 9.8.5 carried ONE prior-  | TWO. The second is a     |
|     | art precedent, Durst      | granted claim to a       |
|     | 6.7.6.5                   | NONLINEAR SUM across     |
|     |                           | assets, entities and     |
|     |                           | portfolios. Two          |
|     |                           | distinctions stated,     |
|     |                           | both against this        |
|     |                           | framework. Their         |
|     |                           | nonlinear sum is a       |
|     |                           | limits-and-thresholds    |
|     |                           | loss model, so the       |
|     |                           | SPECIFIC copula          |
|     |                           | obstruction is not       |
|     |                           | anticipated.             |
+-----+---------------------------+--------------------------+
| S31 | 9.13 method register did  | THREE prior-art entries  |
|     | not carry the patent      | added or marked: seeded  |
|     | family                    | Monte Carlo propagation  |
|     |                           | with per-edge condit-    |
|     |                           | ional probability; the   |
|     |                           | dollar loss exceedance   |
|     |                           | curve; the nonlinear sum |
|     |                           | aggregation. Count line  |
|     |                           | added: three register    |
|     |                           | entries are prior art    |
|     |                           | the framework had been   |
|     |                           | treating as its own      |
|     |                           | assembly.                |
+-----+---------------------------+--------------------------+
| S32 | 9.16 listed what is left  | REWRITTEN. Four items,   |
|     | as three items with the   | ordered, with test       |
|     | risk axis implicitly      | status on each. The unit |
|     | included in the assembly  | of account and the graph |
|     |                           | kind are now two of the  |
|     |                           | four and NEITHER HAS A   |
|     |                           | HYPOTHESIS. New 9.11.5   |
|     |                           | records H11 as a sketch  |
|     |                           | rather than writing it   |
|     |                           | badly. New refusal at    |
|     |                           | 9.9 forbidding a novelty |
|     |                           | assertion on 9.3. New    |
|     |                           | contested entry at 9.12  |
|     |                           | on graph kind. 9.5.2 and |
|     |                           | 9.11.1 restate the       |
|     |                           | consequence if H6 fails. |
+-----+---------------------------+--------------------------+
| S33 | Preamble carried nine     | TEN rules. Reading       |
|     | rules, six source         | principle C2 added: a    |
|     | cautions                  | correct method carries   |
|     |                           | no novelty by itself.    |
|     |                           | CITED IS NOT READ        |
|     |                           | extended explicitly to   |
|     |                           | PATENTS, with both       |
|     |                           | halves named: claims say |
|     |                           | what is owned, the       |
|     |                           | specification says what  |
|     |                           | was built. SEVENTH       |
|     |                           | CAUTION added: a         |
|     |                           | research process that    |
|     |                           | grades its own findings  |
|     |                           | Strong is making an      |
|     |                           | unverified claim about   |
|     |                           | its own reading;         |
|     |                           | Indicative until the     |
|     |                           | primary record is        |
|     |                           | opened. Failure mode 5   |
|     |                           | extended to assignees    |
|     |                           | and patent numbers.      |
+-----+---------------------------+--------------------------+
```

**Checked and clean.** v3.1b was suspected of carrying US 12,380,090 and US 11,356,469, the two wrong numbers published in the paper and thesis from v1.0. It did not. Part IX has never cited a patent number, so there was nothing to repair here and the change above is purely additive. Recorded so that this is not re-checked.

**Counts as at v3.1c.** Hypotheses: ten written, H1 to H10, plus H11 sketched and unwritten at 9.11.5. Retired claims: sixteen framework-wide, with R15 (E3 partially occupied) and R16 (risk vendors do not scope from a mined graph) added in the companion documents at this revision. Refusal conditions: fourteen. Failure modes: five. Source cautions: seven. Reading principles: two. Scope conditions: four.

**Unchanged and not re-audited at v3.1c:** all settled mathematics, specifically epistemic decay and the three drift rows, the two-rate Datar-Mathews structure and both worked figures, Poisson-gamma exact credibility and its worked figures, the Buhlmann-Straub exposure rule, the monotonicity precondition, the Gaussian copula prohibition, the Jaccard metric, the percolation removal, the unit-root gate and the comonotonic-VaR conditions. These stand as at v3.1a and were not re-derived. **Nothing in v3.1c touches a formula.**

**Verification status of this file, stated plainly.** No byte-level verification against a local copy was performed on upload. The file was emitted once, directly to storage. A size check was made against expectation and nothing further. Any reader relying on completeness should confirm the closing line below is present.

*End of Part IX v3.1c. Revises v3.1b at the preamble, 9.1.1, 9.1.2, 9.2.6, 9.3.2, 9.3.3, 9.3.5, 9.3.6, 9.3.8, 9.4, 9.5.2, 9.5.8, 9.6.4, 9.8.3, 9.8.5, 9.9, 9.10, 9.11.1, 9.11.2, 9.12, 9.13 and 9.16, and adds 9.3.9, 9.11.5 and 9.18. All other sections stand as at v3.1b, and no formula anywhere in this document changes.*
