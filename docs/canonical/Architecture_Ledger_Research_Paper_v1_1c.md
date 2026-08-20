# The Architecture Ledger: A Measurement Practice for Cost, Risk and Flexibility on a Mined Dependency Graph

**Abhineet Asthana**

Independent research, conducted in a personal capacity.

**Version 1.1c. August 2026.**
**Licence: Creative Commons Attribution 4.0 International (CC-BY 4.0).**

---

**Declaration of independence and scope.** This work was conducted entirely on personal time, using public data and public literature. It is vendor-neutral. It draws on no employer systems, no proprietary customer data, and no confidential commercial information, and it is separate from the author's doctoral research. No method described here is claimed as an invention. Where a method is borrowed, its originator is named and its failure conditions are stated.

**Changes at v1.1.** This version retires the framework's principal novelty claim. Element E4, the inverted-sign treatment of real options, was assessed as commercially open at v1.0. That assessment was wrong. The value destroyed by an irreversible commitment is the standard opportunity cost of exercising an option, stated explicitly in Dixit and Pindyck (1994) and priced under switching cost by Kulatilaka and Trigeorgis (1994). E4 is reclassified as OCCUPIED. The related double-counting problem, flagged at v1.0 as the framework's most fragile joint, is resolved by reframing the forfeited option as a decomposition of switching cost rather than as a quantity added alongside it. Hypothesis H6 is rewritten, since its v1.0 form was close to unfalsifiable. The EU Data Act anchor is removed.

**Changes at v1.1b.** Two kinds of change. First, Durst (2007) has now been read at source rather than through a model-assisted summary, and the v1.1a account of it was wrong in a way that mattered. Durst states six barriers to direct valuation, not three, and the section numbers cited at v1.1a were incorrect. Two of the six were not known to this framework at all. Reading also produced two findings that were not sought: Durst explicitly declares flexibility improvements not calculable and carries them qualitatively, which strengthens the non-occupancy verdict at E4, and he states the non-additivity of overlapping value contributions, which is prior art for the aggregation limit now stated at Section 4.5.

Second, four weaknesses that no previous version addressed are stated. The ledger cannot be totalled and a portfolio view is not a supported output (Section 4.5). The unit of account is declared rather than mined, making the practice a hybrid rather than a pure telemetry discipline (Section 4.1). The graph moves under the measurement, so two readings are not strictly comparable (Section 8). The architectural coefficient is exposed to Goodhart's law and no anti-gaming treatment exists (Section 8). A tenth hypothesis is added covering the one barrier the framework cannot answer. A full list of v1.1b changes is at Appendix A.6.

**Changes at v1.1c.** One change, and it is a re-grading rather than a citation repair.

The two patents withdrawn at v1.1 pending verification, US 12,380,090 and US 11,356,469, have now been read at source. Both exist and both are granted. Neither is a BitSight patent and neither is relevant to this framework. The v1.0 citation was not a digit transposition but a wrong citation carried forward unchecked.

More consequentially, the BitSight family that does occupy element E3 has now been read at claim and specification level for the first time rather than described from a summary, and it occupies more than any previous version of this paper recorded. The specification denominates loss in US dollars and produces a loss exceedance curve. The granted claims cover aggregation of losses in a nonlinear sum across assets, entities and portfolios. Element E3 is therefore re-graded from PARTIALLY OCCUPIED to **OCCUPIED**, with a narrow residual stated at Section 3.3.

Two consequences follow elsewhere. Section 3.5 previously supported the integration finding with a statement that risk quantification vendors scope from asset inventories and scenarios rather than from a mined dependency graph. That statement is false as written and is corrected. And Section 4.5, which at v1.1b located one prior-art precedent for the aggregation limit, now records two, the second of which is a granted claim rather than a paragraph of prose. A full list of v1.1c changes is at Appendix A.7.

**Title change at v1.1.** Version 1.0 was deposited as *Enterprise Architecture Economics*. That title names a discipline, and no discipline exists. The work is a measurement practice, and v1.1 claims materially less than v1.0 did, so the title is corrected to *The Architecture Ledger* to match. The subtitle drops the term "forfeited flexibility", which v1.1 retires. Both versions remain published under the same concept identifier. A full list of v1.1 changes is at Appendix A.4.

---

## Abstract

In the consumption era, enterprises rent infrastructure but retain ownership of their architectural arrangement: the specific configuration of dependencies through which business work is executed. That arrangement is economically consequential. It determines the machine resource consumed per unit of business work, it concentrates operational risk, and it forecloses or preserves future options. It is nevertheless absent from the enterprise measurement regime, governed instead by heat maps, maturity models and colour-coded risk registers.

This paper proposes The Architecture Ledger, a standing measurement practice that treats the mined dependency graph as a ledger and pins three distributional quantities to each use case within a named business subdomain: metered cost expressed as a coefficient of business volume, monetary risk expressed as loss distributions, and a flexibility term expressing the option component of the cost of changing a committed arrangement.

The contribution is explicitly one of integration rather than invention, and at v1.1 it is smaller than v1.0 claimed. A structured occupancy analysis across seven framework elements finds five to be occupied or partially occupied by existing commercial and academic work, one to be open in peer-reviewed literature but commercially encroached, and one to be open on present evidence: telemetry-derived volatility as a valuation input. No identified vendor or research group performs the full integration, but that claim is brittle and four named parties could close it by product decision rather than research.

The paper reports a worked demonstration on a single use case, states ten falsifiable hypotheses with explicit kill conditions, and documents a correction history spanning three versions of the formal specification and four versions of this paper. That history is presented as method rather than as achievement: in a field with a documented record of failed quantification attempts, a visible correction sequence is the available evidence that a method exists and that it responds to being wrong.

The practice produces per-use-case entries and, as stated at v1.1b, offers no defensible way to roll them up. That is a real limit on executive-level reporting and it is stated rather than engineered around.

**Keywords:** enterprise architecture, technology economics, quantitative risk, FAIR, real options, dependency graph, FinOps, unit economics, switching costs, model risk, organisational capital

---

## 1. Introduction

### 1.1 The observation

Ask a chief financial officer what the technology function owns and the answer used to include a building full of computers. It had a book value, it depreciated on an agreed schedule, and its replacement was a capital decision recorded by accountants.

That world has been described extensively as a shift from ownership to rental, from capital expenditure to operating expenditure. The description is accurate and it is incomplete. When the infrastructure ceased to be an owned asset, something else became one: the arrangement imposed upon it.

An enterprise does not own the database engine. It owns the decision to place that engine at the centre of forty downstream systems. It does not own the network. It owns the topology wired across it. It does not own the storage layer. It owns the choice to let one dataset become the authoritative source that everything else reads.

This arrangement satisfies the ordinary tests of a capital asset. It is expensive to acquire. It produces value over time. It carries risk. It is costly to change. What it lacks is a line on the balance sheet and an agreed method of valuation.

### 1.2 The precision the argument requires

A loose version of this claim is that architecture drives cost. That formulation is wrong and invites immediate and correct rejection.

Cost decomposes into three terms:

```
Cost = business volume x architectural coefficient x unit price
```

Business volume is determined by demand and belongs to the business. Unit price is set by the vendor and is subject to negotiation but not to design. The middle term, the machine resource consumed per unit of business work completed, is the term architecture determines.

The claim of this paper is therefore narrow: **architecture is a continuously billing determinant of unit cost, not of cost level.** Two enterprises serving identical volumes at identical list prices may differ several-fold in expenditure, and that difference is attributable to arrangement.

This precision is not pedantry. It preserves the separation of accountability that makes the framework usable: business owns the roadmap and therefore volume, while architecture is answerable for conversion efficiency and can be held to it.

**A caution added at v1.1.** The decomposition above is an accounting identity, not an empirical finding. The architectural coefficient is defined as the residual once volume and unit price are removed, so it absorbs every cost movement not attributable to those two terms. This includes movements caused by workload mix, vendor-side performance changes, tenancy effects and measurement error. The identity therefore does not by itself establish that architecture drives the coefficient; it establishes only that whatever drives the coefficient is not volume and not list price. Attributing the coefficient to architecture is an empirical claim requiring the identification work set out at H1, and it should not be smuggled in through the definition. A previous version presented the identity as though it settled the matter.

### 1.3 Why the consumption shift matters

A common misreading is that architecture matters more under consumption pricing than it did under licensing. The reverse is closer to true.

Under core-based or capacity-based licensing, architecture drove cost more directly, because a sizing exercise converted arrangement into a purchase order. Yet its economic signature was invisible, because a single upfront capacity decision absorbed all subsequent architectural drift into slack. Architecture could degrade substantially without the bill moving.

Metering did not increase architecture's economic significance. It made the coefficient legible for the first time, by removing the slack that previously concealed it. The bill is now a continuous instrument reading, and it is discarded.

**Added at v1.1b.** This point now has direct support from the prior art rather than resting on assertion. Durst (2007, section 6.5.4) records data acquisition as one of six barriers to valuing architecture, on the grounds that enterprises rarely operate enterprise-wide reporting for IT and that few or no metrics exist for the architecture itself. That barrier has since been dissolved, not by this framework but by twenty years of instrumentation: metered billing, distributed tracing and OpenTelemetry constitute exactly the enterprise-wide reporting layer whose absence he recorded. The framework is possible now and was not possible in 2007, and the reason is instrumentation rather than insight. That is a positioning claim about timing, and it should not be read as a claim about contribution.

### 1.4 Contribution and structure

This paper contributes:

1. A precise formulation of architecture's economic role as a determinant of unit cost, with its identification limits stated (Section 2).
2. A structured occupancy analysis locating the framework against commercial and academic prior art, element by element, including the retirement of the element previously claimed as the principal novelty (Section 3).
3. An answer, partial and graded, to the standing objection that direct valuation of architecture is not achievable (Section 3.7).
4. A specification of the ledger, its unit of account, its three axes, and the limits of aggregation across them (Section 4).
5. A formal mathematical specification with named borrowed methods and stated failure conditions (Section 5).
6. A worked demonstration with reproducible figures (Section 6).
7. Ten falsifiable hypotheses with explicit kill conditions (Section 7).
8. A documented correction history advanced as method (Section 9).

---

## 2. Problem statement

### 2.1 The translation failure

The recurring failure this framework addresses is one of translation. Architects reason in dependency, coupling and structural risk. Finance functions reason in money, distributions and options. There is no shared object between them, so architectural argument reaches the board as assertion.

The consequence is familiar. Technology cost conversations reduce to a demand for a percentage reduction against a total, applied without knowledge of whether the reduction removes waste or capability. Architecture risk is governed by colour, and a colour cannot be compared against a budget, summed with another colour, or contested with evidence.

### 2.2 Why prior attempts are treated with suspicion

Enterprise architecture has attempted quantification repeatedly over three decades. The attempts are widely remembered as elaborate assessments that were not maintained beyond the engagement that produced them. Any new proposal inherits this suspicion legitimately.

This paper takes the position that the appropriate response is not a more polished result. A polished result with no visible working invites the question of who checked it, and the usual answer is nobody. The response adopted here is to publish the framework's own error history in full (Section 9).

### 2.3 Scope conditions

The framework applies where three conditions hold:

- **Metered consumption.** Cost must be observable at a granularity finer than the application.
- **Emitted telemetry.** The dependency graph must be discoverable from traces, service mesh topology or infrastructure-as-code state rather than drawn by hand.
- **Nameable business subdomains.** There must exist an agreed decomposition of the business into subdomains within which use cases can be located.

Where these do not hold, the framework does not apply and should not be forced.

**A fourth condition added at v1.1b, attached to the third.** The subdomain decomposition must be pre-existing and independently owned. It must not be constructed for the measurement, and it must not be revised by the analyst performing the measurement. Where the decomposition is built by the same party that computes the ledger, the analyst is selecting the boundaries at which cost pools, risk propagation and option value are cut, which is to say the analyst is choosing the answer. This condition is a governance requirement, not a technical one, and it is the direct consequence of the admission at Section 4.1 that the unit of account is declared rather than mined.

**Stated plainly at v1.1:** these three conditions together select for cloud-native, observability-mature estates with an existing domain decomposition. A large share of real enterprise estates are partly legacy, partly on-premise, or un-instrumented at the granularity required. The addressable population is therefore a well-instrumented minority rather than the enterprise population at large. The author has no measured figure for that share and does not assert one. This is a limitation of applicability, not of correctness, but it should be read alongside every adoption claim in this paper.

---

## 3. Related work and occupancy analysis

This section is deliberately extensive. The framework's contribution is integration, so the location of every element in existing work is load-bearing rather than a courtesy.

### 3.1 Method

Seven elements were defined and each was assessed against commercial products, patents and academic literature. Sources were graded Strong (primary documentation, patent claim text, peer-reviewed publication), Indicative (vendor marketing, trade reporting), or Asserted (vendor claims without corroboration). Absence of a capability was inferred from absence of any claim to it and is graded no higher than Indicative.

**A method failure recorded at v1.1.** The v1.0 occupancy analysis searched commercial products and enterprise architecture literature thoroughly, and searched the canonical finance literature inadequately. The E4 error described below was not a failure to find an obscure source. It was a failure to check a claim of novelty against two texts already cited elsewhere in the same paper. Where a framework element is claimed as open, the primary texts of the discipline it borrows from must be read for that specific claim, not cited for a different one.

**A second method failure recorded at v1.1b.** The v1.1a assessment of Durst was produced by a model reading the source and reporting back. It returned a verdict that survived checking, and alongside it a count, a set of section numbers and a fabricated quotation that did not. The quotation was caught at v1.1a. The count and the section numbers were not, because they were plausible and nobody looked. A model-assisted read is a search aid. It is not a reading, and its structural claims about a source, counts, section numbers, ordering, require the same verification as its quotations.

**A third method failure recorded at v1.1c.** The verification of the two doubtful patent numbers was first delegated to an automated research process, which returned a report grading its own findings Strong. Reading the primary patent records afterwards confirmed the substance of that report and showed that the grade had not been earned at the time it was given. A process that reads a source and then grades its own reading is making an unverified claim about its own reliability, and the grade it assigns carries no information beyond its own confidence. The rule adopted is that **any finding arriving through a proxy is graded no higher than Indicative until the primary record has been opened directly**, irrespective of what grade the proxy assigned itself. This is the third instance of one underlying failure, after the fabricated quotation at v1.1a and the wrong barrier count at v1.1b, and it is the first instance in which the proxy was correct and the grading was still wrong.

### 3.2 The seven elements

```
E1  Mined dependency graph used as a ledger
E2  Metered cost per use case per business subdomain
E3  Monetary risk distributions propagated across the graph
E4  Real-options flexibility, inverted sign
E5  Telemetry-derived volatility as a valuation input
E6  Priced epistemic decay
E7  Standing measurement practice with an operating model
```

### 3.3 Occupancy findings

**E1: Mined dependency graph. OCCUPIED.** Agentless discovery and application dependency mapping is a mature category. Occupants include Faddom, Device42, ServiceNow Discovery and Service Mapping, BMC Discovery, Dynatrace, Datadog and the Wiz Security Graph. Ardoq and SAP LeanIX have moved enterprise architecture repositories toward ingested rather than drawn models. **[Strong.]**

Added at v1.1: the capability is not merely occupied by vendors, it is now open infrastructure. The OpenTelemetry Collector ships a service graph connector that builds a service dependency graph directly from trace data, derived from Grafana Tempo's service graph processor and natively supported in Grafana. A mined dependency graph is therefore a commodity input, available without a vendor relationship. This strengthens rather than weakens the framework, since it removes a barrier to the substrate, but it definitively closes any residual claim at E1. **[Strong.]**

**E2: Metered cost per unit of business work. PARTIALLY OCCUPIED.** The FinOps Foundation defines Unit Economics as a named capability covering cost per transaction, per customer and per case resolved. CloudZero computes cost per transaction, customer and feature from metered billing. Celonis computes process cost per instance from object-centric process mining. Activity-based costing, the common ancestor, dates to the 1980s. **[Strong.]**

The residual is narrow and must be stated as such. Conventional unit economics allocates cost using tags, which describe ownership. The framework allocates against an observed dependency graph, which describes causation. Ownership and dependency are different graphs, and a cost increase caused by a refactor in a transitively invoked service appears in the second and not the first. This is an instrumentation claim, not an idea claim.

**Narrowed further at v1.1.** Apptio, now part of IBM, holds US 8,766,981, "System and method for visualizing trace of costs across a graph of financial allocation rules." That patent traces cost across a graph. It is a graph of declared allocation rules rather than a mined dependency graph, so the causal-versus-declared distinction survives, but it is materially closer to the residual than v1.0's tag-versus-graph framing admitted. **[Strong that the patent exists; Indicative on closeness.]** Separately, the combination of a trace-derived service graph (now commodity, per E1) with an existing cloud cost management product is one integration step rather than a research step. Datadog holds both halves. The E2 residual should be read as unoccupied today and one product release from occupied. **[Indicative.]**

**E3: Monetary risk distributions on the graph. OCCUPIED. Re-graded at v1.1c from PARTIALLY OCCUPIED.**

Monetary loss distributions are the core of the cyber risk quantification market: Safe Security, Kovrr, Axio and X-Analytics all produce loss exceedance curves via Monte Carlo simulation. The Open Group FAIR standard provides the decomposition. The KTH probabilistic enterprise architecture school produced P2AMF and securiCAD, performing probabilistic prediction over architecture models, though its native output is a probability and time-to-compromise rather than a currency amount. Ekstedt et al. (2023) provide the group's clearest monetary treatment, explicitly FAIR-derived. **[Strong.]**

**The patent position, read at source at v1.1c.** Previous versions described the BitSight family from a summary and recorded it as constraining rather than occupying. The primary records have now been opened. The family is a single continuation chain titled *Correlated risk in cybersecurity*, and the chain is confirmed from the face of the later records:

```
15/918,286  ->  US 10,257,219   (granted  9 Apr 2019)
16/292,956  ->  US 10,594,723   (granted 17 Mar 2020)
16/795,056  ->  US 10,931,705   (granted 23 Feb 2021)
17/179,630  ->  US 11,770,401
18/365,384  ->  US 12,273,367
```

Read at claim level, the granted independent claims of US 10,257,219 cover generating a dependency graph over assets, dependencies and entities; executing Monte Carlo simulations over that graph; generating a seed event drawn from a probability distribution; propagating disruption through the graph; assessing loss for each asset; and aggregating losses across assets, across entities and across portfolios. Dependent claims cover aggregating those losses in a nonlinear sum, weighting assets by importance to their owning entity, terminating simulation when statistical variance falls below a threshold, and carrying on each edge a conditional probability that the receiving node is compromised given that the providing node is compromised. **[Strong, from claim text read directly.]**

Read at specification level, which no previous version of this paper had done, the family also denominates loss in currency and produces the distributional output this framework treats as its own reporting form. The specification describes a loss exceedance curve expressed as a function of loss in US dollars, produced from the simulation results, and describes its use to judge whether the rate of losses exceeding a stated monetary threshold falls within an acceptable exceedance rate. It further describes deriving mean expected loss and loss exceedance curves as the reported statistics, and identifying assets by observation of network traffic, DNS records, server banners, software versions and inter-business payment data rather than by declaration. **[Strong, from specification text read directly.]**

The consequence is that the combination of a discovered dependency graph, probabilistic propagation over it, monetary loss assessed per node, and a dollar-denominated loss exceedance curve is not merely adjacent to element E3. It is element E3, granted, with a March 2018 priority date. The element is re-graded OCCUPIED and no residual should be claimed for the combination as such.

**Two patent citations corrected at v1.1c.** US 12,380,090 and US 11,356,469 were cited at v1.0 as members of the BitSight family, withdrawn at v1.1 as unconfirmable, and have now been read at source. Both are granted and neither belongs to this family. US 12,380,090, "Managing data risk using automated dependency discovery," builds a dependency graph from read and write logs and outputs a level of risk from a rating of concern and an indication of concern; its claims contain no monetary quantity and no distribution, and its subject is dataset corruption rather than cyber loss. US 11,356,469, "Method and apparatus for estimating monetary impact of cyber attacks," recites data pools, a correlation engine and a monetary impact calculation, with no dependency graph and no distribution. Neither is relevant to this framework and neither should be cited against it. The duplicated appearance of US 11,356,469 in the v1.0 source list was a wrong citation copied twice, not a transposed digit. **[Strong on claim scope and on non-membership of the family. Indicative on assignee: reported assignees are Google LLC and Barracuda Networks respectively, read from a secondary index rather than from the patent front page.]**

**What remains outside the family, stated narrowly.** Three things, and none of them is a claim to the risk axis itself.

First, the graph in the family is outside-in. Its assets are IP addresses, domain names and server systems; its dependencies are hosting providers and software versions; and it is assembled from externally observable signals. It is a map of third-party and infrastructure exposure. It is not a map of internal service-to-service call structure derived from distributed tracing, and it does not resolve to the subgraph exercised by a named business use case.

Second, loss in the family is assessed per asset and weighted by an asset's importance to its owner. The unit of account in this framework is a use case within a named business subdomain, and cost on that unit is expressed as a coefficient of business volume. The family has no cost axis and no unit of business work.

Third, the family has no flexibility axis and no option component.

The honest statement is therefore that the risk axis of this framework is occupied, that the framework's contribution at E3 is reduced to running an occupied method over a different substrate for a different unit of account, and that this is an integration position rather than a residual. A formal freedom-to-operate opinion has not been obtained and is required before any patent filing. Independent non-BitSight prior art also exists in this space, including a probabilistic cyber risk forecasting application propagating loss distributions through a network by Monte Carlo. **[Indicative.]**

**E4: Forfeited option, inverted sign. OCCUPIED. Retired as an open element at v1.1.**

This element was assessed at v1.0 as open commercially and only partially occupied academically, and was presented as the framework's principal novelty. That assessment does not survive contact with the primary real options literature, and it is retired here in full.

Dixit and Pindyck (1994) state directly that a firm making an irreversible investment exercises, or kills, its option to invest, and that the value of the option so destroyed belongs in the investment cost. That is the inverted sign, stated in the canonical text of the discipline the framework borrows from. Kulatilaka and Trigeorgis (1994) already value the general option to switch under a switching cost, and already establish that switching cost breaks additivity of option values and produces hysteresis. In routine option valuation practice, the value eroded by holding rather than committing is carried explicitly as a dividend or convenience yield term. **[Strong.]**

The academic occupants named at v1.0 remain: Baldwin and Clark on modularity as options, Sullivan et al. (2001), Bahsoon and Emmerich (2003) on ArchOptions, and Taudes et al. (2000) in MIS Quarterly. **[Strong.]**

**Durst assessed at v1.1a, read at source at v1.1b.** Durst (2007) addresses value-oriented management of IT architectures including flexibility and was carried at v1.0 and v1.1 as the closest identified prior art to the cost-plus-flexibility combination. **It does not occupy the integration**, and the reading at v1.1b strengthens that verdict rather than merely confirming it.

Durst's architecture model is the IT-Bebauungsplan and IT-Infrastruktur, populated by hand from process documentation and administrative data entry rather than discovered from telemetry. He does not compute cost per unit of business activity, addressing instead operational and procurement cost at the level of architecture measures. He does not express risk as a monetary amount or distribution. Cost, conformity and flexibility are treated as separate instruments rather than combined on a shared unit.

On the flexibility axis specifically, the reading at v1.1b replaces an inference with a statement. Section 6.7.3.9 is titled *Strategische Optionen* and might be expected to occupy the option axis. It does not. It is a qualitative benefit narrative covering competitive advantage, first-mover position, supplier and customer collaboration, and merger and acquisition integration. It contains no volatility, no valuation and no option-pricing method of any kind; "option" is used in the strategic-management sense, not the financial one. More directly, at section 6.7.6.4 Durst states that quality improvements and flexibility improvements are difficult to calculate and to monetise, and that these potentials are therefore carried in the value argument as qualitative advantages. **He declares the flexibility axis out of reach rather than occupying it.** **[Strong on substance, from a source read. Indicative on wording, per the OCR caution below.]**

Durst's own method also confirms the mined-versus-drawn contrast directly. Section 6.7.6 values a target architecture against a current one using benchmarks, experience values, average time savings per project and hourly rates, extrapolated to an annual figure across a planned project count. That is ex-ante planning estimation of a proposed architecture, not measurement of a running estate.

**Source-reading caution added at v1.1b.** The available copy of Durst is a scanned volume with no text layer. All findings above were obtained by optical character recognition using a German-language model. This establishes structure and substance reliably and wording unreliably. The standing rule adopted is therefore: **OCR of a scanned source establishes substance at Strong and wording at Indicative, and nothing is quoted from OCR output.** A quotation appearing on book page 98, attributed by Durst to The Open Group, is a candidate epigraph for this work and is deliberately not reproduced here, because it would need to be checked against The Open Group source directly rather than against Durst and rather than against a character-recognition pass.

The correct statement on E4 is therefore that pricing the flexibility destroyed by a commitment decision is the standard opportunity cost of exercising an option, and the framework applies it rather than originates it. The only residual at E4 is the route to the inputs: computing the two switching-cost settings from a mined graph and metered telemetry rather than from expert declaration. That is an instrumentation claim of the same class as the E2 residual, it is weaker than the E2 residual because the two settings still require a declared counterfactual, and it is graded no higher than Indicative.

The consequence for the framework as a whole is recorded plainly. The element carried as the headline contribution at v1.0 is occupied. What remains is set out at Section 3.5.

**E5: Telemetry-derived volatility as a valuation input. OPEN on present evidence.** Cost and usage volatility is charted by numerous FinOps tools. Volatility as an input to option valuation is standard in finance. The join is not identified in either literature and no prior occupant was found on re-audit. **[Indicative. This is now the framework's only element open on present evidence, and it rests on absence of a found occupant, which is the weakest form of evidence in this analysis. It should not be leaned on the way E4 was.]**

A methodological caution is added at v1.1 and developed at Section 5.5. Volatility estimated from realised cost or usage telemetry is a physical-measure estimate. Feeding it into an option valuation mixes the physical and risk-neutral measures unless the valuation is constructed to accept physical-measure inputs. The Datar-Mathews construction used here does accept them, at the price of the tradeability and no-arbitrage critiques recorded at Section 5.5. This does not close E5, but it means E5 cannot be presented as a clean technical join.

**E6: Priced epistemic decay. OPEN in peer-reviewed literature, encroached commercially.** No peer-reviewed work identified prices the divergence between documented and observed architecture as an uncertainty quantity. The conceptual ancestor is model risk management: supervisory guidance on the consequences of acting on a model that no longer represents reality.

**Encroachment confirmed and strengthened at v1.1.** Firefly ships a drift cost analysis feature that calculates the monthly cost of the infrastructure-as-code-defined state, determines the cost of the actual running configuration, and prices the difference, and separately supports predicting infrastructure costs before deployment. That is drift priced in currency, shipped. **[Strong.]** The remaining distinction is that Firefly prices the cost consequence of drift, whereas the framework treats drift as parameter uncertainty entering a loss distribution. That distinction is real and is defended at Section 5.6, but it is a narrower distinction than v1.0 implied. The claim must be worded as unoccupied in peer-reviewed literature, never as unoccupied.

**E7: Standing measurement practice. PARTIALLY OCCUPIED.** FinOps and cyber risk quantification are both standing practices with operating models. The FinOps Foundation and the TBM Council have published jointly. The integrated practice proposed here is not occupied. **[Strong.]**

### 3.4 Summary of occupancy

```
+----+-------------------------------+----------------------+
| EL | VERDICT (v1.1c)               | PRINCIPAL OCCUPANTS  |
+----+-------------------------------+----------------------+
| E1 | OCCUPIED                      | ADM and observ-      |
|    | (now also commodity via OTel) | ability vendors;     |
|    |                               | OpenTelemetry        |
+----+-------------------------------+----------------------+
| E2 | PARTIALLY OCCUPIED,           | FinOps, CloudZero,   |
|    | residual narrow and fragile   | Celonis, ABC,        |
|    |                               | Apptio US 8,766,981  |
+----+-------------------------------+----------------------+
| E3 | OCCUPIED                      | FAIR, CRQ vendors,   |
|    | RE-GRADED at v1.1c from       | KTH, BitSight        |
|    | PARTIALLY OCCUPIED. Claims    | correlated-risk      |
|    | AND specification read at     | family (5 grants,    |
|    | source. Dollar-denominated    | priority Mar 2018)   |
|    | loss exceedance curve on a    |                      |
|    | discovered dependency graph.  |                      |
+----+-------------------------------+----------------------+
| E4 | OCCUPIED                      | Dixit & Pindyck;     |
|    | RETIRED as open at v1.1       | Kulatilaka &         |
|    | Durst declares this axis      | Trigeorgis;          |
|    | out of reach, does not        | Baldwin & Clark;     |
|    | occupy it (v1.1b, at source)  | Sullivan; Taudes     |
+----+-------------------------------+----------------------+
| E5 | OPEN on present evidence      | None identified      |
+----+-------------------------------+----------------------+
| E6 | OPEN in peer-reviewed lit.,   | Firefly (shipped)    |
|    | commercially encroached       |                      |
+----+-------------------------------+----------------------+
| E7 | PARTIALLY OCCUPIED            | FinOps, TBM, CRQ     |
+----+-------------------------------+----------------------+
```

At v1.0 this table showed three open elements. It now shows one open on present evidence, one open only in peer-reviewed literature and already encroached commercially, and five occupied or partially occupied. The count of occupied-or-partial is unchanged at v1.1c; what changed is that E3 moved from the weaker category to the stronger one, so three of the five are now fully occupied rather than two.

### 3.5 The integration finding, restated

No identified vendor or research group performs the full integration. The market is siloed: graph vendors do not monetise, and cost vendors produce point estimates without risk or optionality.

**The third clause of this sentence is corrected at v1.1c.** Previous versions completed it by asserting that risk quantification vendors scope from asset inventories and scenarios rather than from a mined dependency graph. That is false as a general statement and was written before the BitSight specification had been read. At least one occupant scopes precisely from a discovered dependency graph and reports dollar-denominated loss distributions over it. The surviving and narrower statement is that risk quantification vendors, including those working from a discovered graph, address neither unit cost nor flexibility, and that the graph they discover is a map of external infrastructure and vendor exposure rather than of internal business work.

That finding survives re-audit in its corrected form. It is also brittle, and v1.1 states the brittleness rather than resting on the finding. Four organisations are now positioned to close the gap by product decision rather than research: Datadog, which holds both a mined service graph and a cost management product; Google, which holds foreseeti and the Wiz Security Graph; Celonis, which computes process cost per instance and positions as a digital twin; and, added at v1.1c, BitSight, which already holds the graph and the monetised risk distribution over it and would need to add only a cost axis. The gap between holding the components and shipping the integration is a roadmap decision, not a research programme.

**What the contribution now is.** With E4 retired and E3 re-graded, the framework does not contribute a new valuation method and does not contribute the monetisation of graph-propagated risk. It contributes:

1. A single unit of account (use case within a named business subdomain) against which cost, risk and flexibility are expressed in commensurable terms. Note the qualification at Section 4.1: this unit is declared, not mined.
2. A causal rather than declared allocation substrate for all three (the mined graph), where the graph is of internal business work rather than of external vendor exposure.
3. A decomposition of switching cost that separates deterministic execution cost from the option component, which the switching-cost literature treats as an undifferentiated aggregate (Section 5.5).
4. A distributional discipline in which no quantity is reported without its range, method, seed and assumption reference, and in which refusal is a permitted output.
5. An operating model binding these into a standing practice.

**Whether that clears the bar for integration-as-contribution is a fair question and the honest answer is that it does not yet.** The accepted standard in information systems and software engineering research for an integration contribution is a demonstrated emergent capability plus validation. This paper offers one demonstration on a fictional composite, which establishes computability and nothing further. Until H1 through H10 are tested against real estates, the integration claim is a proposal, not a result. Stated at v1.0 as a contribution; stated at v1.1 as a proposal awaiting test.

**Added at v1.1b.** The list above is a list of properties, and Section 4.5 now establishes that these properties cannot be summed into a portfolio figure. A framework that produces commensurable per-use-case entries and cannot total them is a measurement practice, not a management system. That distinction is stated here rather than left for a reader to discover.

### 3.6 Retired claims

Claims made in earlier drafts of this work and retired on contact with prior art are listed here because their retirement is part of the record. The full log is at Appendix A.1.

R1. A cross-organisational economic signature of architecture. Retired.
R2. That no prior work monetises graph-propagated risk. Retired: RISKEE, cyber-catastrophe models and the BitSight patent family.
R3. Shared language as a differentiator. Retired: Technology Business Management has occupied this since 2012.
R4. That option value is absent from architecture literature. Retired: four independent occupants identified.
R5. Mined substrate as a differentiator. Retired: and at v1.1 the substrate is commodity open infrastructure.
R6. Operating model as a differentiator. Retired.
R7. Above-the-line operational risk as a construct. Retired: Basel operational risk defines it line for line.
R8. Modularity as the existence of alternate graph paths. Retired: that is redundancy; modularity is the cost of cutting.
R9. Architecture as an unqualified cost driver. Retired: narrowed to determinant of unit cost.
R10. **New at v1.1.** That the inverted-sign forfeited option is commercially open. Retired: Dixit and Pindyck (1994) state the option-killing result directly, Kulatilaka and Trigeorgis (1994) price switching under switching cost, and the dividend-yield treatment is routine practice.
R11. **New at v1.1.** That the forfeited option is a quantity distinct from and additive to switching cost. Retired: under the standard industrial-organisation definition (Klemperer 1995; Farrell and Klemperer 2007) switching costs already include the uncertainty and option components, so addition double-counts. Reframed as decomposition at Section 5.5.
R12. **New at v1.1.** That the correction log is the most defensible artefact this work has produced. Retired: process hygiene is not a contribution. See Section 9.3.
R13. **New at v1.1b.** That the framework's practice is telemetry-derived throughout. Retired: the graph is mined, the unit of account sitting on it is declared, and the practice is a hybrid. See Section 4.1.
R14. **New at v1.1b.** That the ledger's per-use-case entries can be aggregated into a portfolio position. Retired: none of the three axes admits summation, and Durst (2007, section 6.7.6.5) states the overlap problem for the cost and benefit axis independently. See Section 4.5.
R15. **New at v1.1c.** That element E3 is only partially occupied and that the patent family constrains rather than occupies it. Retired: the claims and the specification were read at source, the family denominates loss in dollars, reports a loss exceedance curve and aggregates across assets, entities and portfolios, and it does so over a discovered dependency graph. See Section 3.3.
R16. **New at v1.1c.** That risk quantification vendors scope from asset inventories and scenarios rather than from a mined dependency graph. Retired: at least one scopes from a discovered graph, and the sentence supporting the integration finding is corrected at Section 3.5.

### 3.7 The standing objection: Durst's six barriers

Durst (2007) is not only the nearest prior art. He is also the framework's most serious standing objection, because he examined this problem, enumerated why direct valuation of architecture is not achievable, and went indirect. A framework proposing direct measurement owes an answer to each barrier. This section gives one, graded, including two admissions of failure.

**Correction first.** Version 1.1a of this paper stated that Durst identifies three barriers, at sections 6.5.1 to 6.5.3, and named them as distance from value creation, attribution and delayed effects. That is wrong on the count, wrong on the section numbers and wrong on the membership. Reading the source establishes that section 6.5 enumerates **six** barriers, on book page 98, and that delayed effects is 6.5.6 rather than one of the first three. Two of the six were unknown to this framework entirely. **[Strong. Structure and enumeration read directly from source.]**

```
+-------+--------------------------+---------------------------------+
| SECT  | BARRIER                  | FRAMEWORK POSITION              |
+-------+--------------------------+---------------------------------+
| 6.5.1 | Distance from value      | ANSWERED. The unit of account   |
|       | creation                 | is a use case in a named        |
|       |                          | business subdomain and cost is  |
|       |                          | expressed per unit of business  |
|       |                          | volume, so the measurement sits |
|       |                          | on business work rather than    |
|       |                          | on an application inventory.    |
|       |                          | [Indicative until H1.]          |
+-------+--------------------------+---------------------------------+
| 6.5.2 | Measuring the value      | NOT ANSWERED. SIDESTEPPED.      |
|       | contribution itself      | The framework never computes a  |
|       |                          | net value contribution. It      |
|       |                          | reports three quantities and    |
|       |                          | refuses the aggregate. This is  |
|       |                          | the same admission as Section   |
|       |                          | 4.5, seen from the other side.  |
+-------+--------------------------+---------------------------------+
| 6.5.3 | Holism and attribution   | PARTIALLY ANSWERED. The mined   |
|       |                          | graph settles technical         |
|       |                          | attribution causally rather     |
|       |                          | than by declaration. Durst's    |
|       |                          | barrier is wider: organisat-    |
|       |                          | ional change accompanying       |
|       |                          | architectural change, cost and  |
|       |                          | benefit landing in different    |
|       |                          | business units, opportunistic   |
|       |                          | behaviour in assessment, and    |
|       |                          | external confounders such as    |
|       |                          | market growth. None of those    |
|       |                          | four is answered.               |
+-------+--------------------------+---------------------------------+
| 6.5.4 | Data acquisition         | ANSWERED, but not by this       |
|       |                          | framework. Durst records that   |
|       |                          | enterprise-wide IT reporting    |
|       |                          | rarely exists and that few or   |
|       |                          | no architecture metrics do.     |
|       |                          | Metered billing, distributed    |
|       |                          | tracing and OpenTelemetry       |
|       |                          | dissolved that barrier. Credit  |
|       |                          | belongs to instrumentation.     |
+-------+--------------------------+---------------------------------+
| 6.5.5 | Forecasting problem      | PARTIALLY ANSWERED. Durst's     |
|       |                          | point is that project potential |
|       |                          | is unclear because further      |
|       |                          | uses appear later. That is      |
|       |                          | optionality by another name,    |
|       |                          | and pricing flexibility without |
|       |                          | forecasting the payoff is       |
|       |                          | precisely what a real option    |
|       |                          | does. The limit is that         |
|       |                          | telemetry-derived volatility is |
|       |                          | backward-looking, so it assumes |
|       |                          | tomorrow's surprises resemble   |
|       |                          | yesterday's.                    |
+-------+--------------------------+---------------------------------+
| 6.5.6 | Temporal delay           | NOT ANSWERED. See below and     |
|       |                          | hypothesis H10.                 |
+-------+--------------------------+---------------------------------+
```

Two of six answered, one of those by instrumentation rather than by this work, two partial, one sidestepped, one open.

**On 6.5.6, the barrier the framework cannot answer.** Every quantity in the ledger is measured contemporaneously. Cost is this month's bill. Risk is the current loss distribution. The option component is a point-in-time valuation. If the effects of architectural decisions arrive over years, as Durst records, then a monthly reading may be measuring noise around a slow signal, and the practice would not be able to tell the difference from the inside. This interacts with the epistemic decay work at Section 5.6 in an uncomfortable way: re-mining reduces uncertainty about the *current* state, and a current reading, however precise, cannot establish whether last year's decision was good. Hypothesis H10 is added to test this and is capable of returning a kill verdict for the practice as a whole.

**Why Durst's conclusion does not settle the matter, and why that is not a strong defence.** Durst concluded that the value contribution of an architecture cannot simply be calculated in isolation, and moved to an indirect route through metrics, qualitative impact networks and benchmark-based estimation of a target architecture. The framework's response is not that he was wrong. It is that one of his six barriers, data acquisition, has been removed by instrumentation since 2007, and that the framework declines the object he was trying to compute, a single value contribution, in favour of three separately reported quantities that are never summed. That is a narrower ambition, not a solved problem, and a reader should treat the difference between 2007 and now as mostly a difference in available data rather than in method.

---

## 4. The framework

### 4.1 Unit of account

The unit is one **use case within one named business subdomain**, for example processing a product return within returns and reverse logistics.

This narrowness is deliberate and was arrived at by correction. Earlier formulations used the architecture decision as the unit. A decision is not observable and therefore not meterable. A use case exercises a specific, observable subgraph and can be watched.

```
G = (N, E)              the federated dependency graph
u = (use case, business subdomain)
G_u subset of G         the subgraph exercised by u
L(u) = { C(u), R(u), V(u) }   the ledger entry
```

**The unit is declared, not mined. Stated at v1.1b.** This is the sharpest single objection available against the framework and no previous version addressed it.

The framework's stated differentiator is that allocation is causal, derived from observed structure, rather than declared. The graph is indeed mined. The unit sitting on the graph is not. A "named business subdomain" is a hand-built decomposition of the business, produced by people in a workshop, and it is the same class of artefact as the IT-Bebauungsplan this paper criticises Durst for drawing by hand. The framework is therefore a **hybrid**: a mined structure with a declared unit of account laid over it. Earlier versions implied a purity the practice does not have.

There is a partial defence and it should be read as partial. The two artefacts differ in their rate of change. A subdomain decomposition is a business artefact that usually already exists, is owned outside the technology function, and is stable over years. A dependency structure changes weekly and is not reliably known to anyone. Declaring the slow-moving thing and mining the fast-moving thing is a defensible division of labour, and it puts the declaration where it can be scrutinised by its owners rather than buried in a model. But it is a declaration, and the boundaries it draws determine where cost pools are cut, where risk propagation is bounded and where option value is located. Those are consequential choices made by hand.

Two requirements follow. First, the subdomain decomposition is a **logged declared field** with a named owner, on the same footing as the counterfactual at Section 5.5, and is reported alongside every figure computed against it. Second, the scope condition at Section 2.3 forbids the decomposition being constructed or revised by the party performing the measurement.

**Limitation stated at v1.1.** The unit is well defined where a use case exercises a subgraph exclusively. It is weakest exactly where it matters most: shared services. In the demonstration at Section 6, the payments service serves five use cases, and its fixed-cost pool is divided by an admitted arbitrary equal split. Section 5.1 forbids that split from informing an exit decision. The consequence is that the cost figure is least trustworthy for precisely the high-fan-in shared infrastructure where exit and consolidation decisions carry the most money. This is a real limit on decision-usefulness, not a presentational caveat, and no method in this paper resolves it. The variable pool, allocated by a metered causal driver, does not suffer this defect; the fixed pool does.

### 4.2 The unifying object

The three axes are unified by treating architecture as a set of **boundaries**.

Cost pools accumulate at poorly placed boundaries. Risk propagates when boundaries fail. Option value is the ability to cut at a boundary. Lock-in is a boundary that is expensive to cut. Modularity is a boundary that is cheap to cut.

A logged correction applies here: modularity is not the existence of alternate paths through the graph, which is redundancy. It is the cost of cutting. Application programming interfaces are best understood in this framework as contracts that manufacture cut-ability.

**Reframed at v1.1.** The three axes are not three independent additive quantities. Cost and risk are separately measured. Flexibility is not a fourth quantity to be added on top of the cost of change; it is a component inside it, separated out. This distinction is what removes the double-count identified at v1.0 and is specified at Section 5.5.

**Extended at v1.1b.** The axes are commensurable in unit, since all three are expressed in currency against the same use case. They are not commensurable in arithmetic. Currency is a common denomination, not a licence to add. Section 4.5 states what that forbids.

### 4.3 Distributional commitment

Every quantity is a distribution. No point estimate is reported without its range, the method that produced it, the random seed and a reference to the assumption register.

This is not stylistic. Uncertainty is treated as a first-class output because the framework's principal epistemic contribution (Section 5.6) is visible only in the movement of tail statistics.

### 4.4 Refusal as a valid output

Where a quantity cannot be estimated honestly, the specification requires a recorded refusal rather than an estimate. A refusal states what is not known, which is more useful than a number that should not be trusted. Section 5.7 lists the refusal conditions.

### 4.5 Aggregation, and why the ledger cannot be totalled

**Stated at v1.1b. No previous version addressed this and it is the first thing an executive asks for.**

The ledger produces an entry per use case. It does not produce a portfolio position, and no arithmetic in this framework supports one. **A total across use cases is not a supported output.** It is added to the refusal conditions at Section 5.7.

The reason is different on each axis, and each reason is independently sufficient.

```
+-----------+------------------------------------------------+
| AXIS      | WHY IT DOES NOT ADD                            |
+-----------+------------------------------------------------+
| COST      | Use cases share nodes. Summing per-use-case    |
|           | allocations across use cases counts a shared   |
|           | node's cost once per use case that touches     |
|           | it. Worse, the fixed pool is split on a        |
|           | declared basis (Section 4.1), so a total       |
|           | would be part measurement and part convention. |
+-----------+------------------------------------------------+
| RISK      | Losses are correlated and the correlation is   |
|           | in the tail, which is the region the framework |
|           | reports. Adding per-use-case loss figures      |
|           | assumes comonotonicity or independence, and    |
|           | both are wrong in different directions. A      |
|           | joint position requires a tail-dependent       |
|           | copula fitted across use cases, which is a     |
|           | different computation, not a sum.              |
+-----------+------------------------------------------------+
| OPTION    | Option values are not additive. Trigeorgis     |
| COMPONENT | (1993) establishes that real options interact  |
|           | and that the value of a collection is not the  |
|           | sum of individual values. Kulatilaka and       |
|           | Trigeorgis (1994) establish that switching     |
|           | cost itself breaks additivity. Summing option  |
|           | components across use cases is simply an       |
|           | error.                                         |
+-----------+------------------------------------------------+
```

**This limitation has prior art in two places, which is worth stating rather than presenting the admission as insight.**

The first was recorded at v1.1b. Durst (2007, section 6.7.6.5) states that where the effects of two architecture measures overlap, their value contributions cannot simply be added, and proposes cross-settlement between measures to prevent double counting. The problem was identified in this literature in 2007 and a partial mitigation was proposed for it. This framework does not have that mitigation. Durst's treatment addresses overlap on the cost and benefit axis and says nothing about option non-additivity or tail dependence, so the statement here is broader, but the framework should not claim to have noticed something new. **[Strong on substance, from a source read.]**

The second is added at v1.1c and is stronger, because it is a granted claim rather than a paragraph of prose. The BitSight correlated-risk family claims aggregating losses across two or more assets in a **nonlinear sum**, and separately claims aggregation at entity and portfolio level, with the specification noting that aggregated losses may be simple sums or may involve more complex loss models including thresholds and limits. The non-additivity of correlated loss was therefore not merely known in 2018, it was claimed. **[Strong, from claim text read directly.]**

Two distinctions survive and both should be stated rather than assumed. First, the family asserts a method of aggregating and this framework asserts that it will not aggregate; a claim to a nonlinear sum is a claim to an answer, whereas Section 5.7 records a refusal. Second, the family's route to a joint position is a single simulation over the whole graph, which produces the joint distribution directly and never needs a copula. That is a cleaner solution than the one this framework describes, and it is available only because the family owns the whole graph in one model rather than cutting it into declared units first. The framework's aggregation problem is partly self-inflicted by its own unit of account.

**What is legitimate.** The following operations are supported and should be used in place of a total:

- **Ranking.** Use cases can be ordered on any single axis. Ordering does not require additivity.
- **Pairwise comparison.** Two use cases can be compared on a given axis with their distributions shown.
- **Per-axis aggregation, with the method named.** Risk may be aggregated across use cases by a tail-dependent copula fitted for that purpose, and reported as a joint distribution rather than as a sum. Cost may be aggregated on a marginal basis only, that is, the cost that would actually disappear, never on an allocated basis. The option component may not be aggregated at all.
- **Movement over time on a single entry**, subject to the graph-version discipline at Section 8.

**What this costs the framework, stated plainly.** A practice that cannot produce a portfolio figure cannot answer the question an executive audience most often asks, which is what the estate is worth or what the total exposure is. It can tell them which use cases are worst and by how much on a named axis, and it can refuse the total. Some organisations will find that unusable, and that judgement is legitimate rather than a failure of understanding on their part. The honest framing, which is carried as a reading principle in the formal specification, is that **a measurement that cannot be aggregated is still a measurement, but it is not a management system.**

---

## 5. Formal specification

This section summarises the mathematical specification (Part IX v3.1). Every method is borrowed and named.

### 5.1 Cost

Node cost is separated into fixed and variable pools and allocated on different bases. The variable pool is allocated by a causal driver, which must be justified per pool; request count is one candidate, not a default, since data egress frequently dominates.

Two warnings are recorded that earlier versions omitted. First, allocating fixed cost on an arbitrary declared basis produces the classic allocation death spiral: exiting tenants raise unit cost on those remaining, prompting further exit. Fixed allocation must therefore be reported separately and must never inform an exit decision. Second, activity-based costing has a documented maintenance problem in its own literature; Kaplan and Anderson (2004) moved to time-driven ABC for this reason. Mined telemetry addresses this only where the driver is genuinely metered.

Allocated average cost and marginal cost are kept explicitly distinct. Conflating them was a logged error. Added at v1.1b: this distinction is what makes marginal-only the sole supported basis for any cross-use-case cost aggregation, per Section 4.5.

### 5.2 Risk: frequency

Loss event frequency is estimated by Poisson-gamma credibility. Given a Gamma(alpha, beta) prior on the rate and observed counts x over exposure e, the posterior mean is:

```
E[lambda | x] = (alpha + x) / (beta + e)
```

which is exactly equal to the credibility form Z(x/e) + (1-Z)(alpha/beta) with Z = e/(e+k) and k = beta. This exact agreement, a property of the conjugate pair (Jewell 1974; Buhlmann and Gisler 2005), makes the construction self-verifying: two independent derivations must produce identical values.

Note that setting alpha equal to the prior mean multiplied by k, with beta equal to k, is internally consistent, since alpha/beta then returns the prior mean identically. A challenge to this parameterisation was raised on re-audit and does not hold.

Three corrections are recorded. The weight was previously a free parameter set by the analyst, which meant the analyst selected the answer. The estimator was previously mislabelled as Buhlmann-Straub when it was plain Buhlmann; Buhlmann-Straub weights by exposure and must be used where exposure varies across periods. And k carries units of time, so exposure must be expressed in the same unit as the rate; a previous version mixed quarterly counts with annual rates and overstated the weight on local data by approximately fifty percent.

Where no local data exists, frequency scales with exposure as a Poisson offset, proportionally. A previous version applied an estimated exponent drawn from the operational risk literature on scaling external loss *severity*; applying a severity relationship to counts is a category error.

**Citation caution added at v1.1.** v1.0 attributed to Cope and Labbi (2008) the conclusion that scaling through a size proxy is not a sensible technique for incorporating external data. The bibliographic metadata for that source is confirmed exactly, but the attributed conclusion could not be confirmed from the accessible abstract on re-audit, and later literature builds working scaling models. The claim is therefore downgraded to **[Asserted]** pending a check against the source body, and the specification does not depend on it: the prohibition on applying a severity exponent to counts stands on the category error alone, independently of whether the severity relationship itself is sound.

### 5.3 Risk: magnitude and structure

Loss magnitude follows the FAIR decomposition, with the correction that secondary loss is the product of a secondary loss event frequency, a conditional probability, and a secondary loss magnitude. Treating secondary loss as a flat additive term assumes that frequency is unity and overstates loss.

The subdomain value ceiling is applied as explicit censoring rather than hard truncation. Hard truncation destroys the tail statistics the framework reports: once the cap binds near the 99th percentile, that percentile collapses onto the cap. The specification requires reporting the proportion of simulations at the boundary and refuses to report tail statistics where that proportion exceeds approximately one percent.

**Clarified at v1.1:** the one percent figure is a declared operating convention, not a threshold derived from any result. No canonical basis for that specific value exists. It is set where it is because below it the displaced mass is small relative to the sampling error of the percentile estimate itself, and any implementer may set it differently provided the value is declared and held constant across comparisons. A previous version presented it as though derived.

### 5.4 Risk: propagation

Propagation uses common-cause conditioning rather than an independence assumption. A previous version multiplied failure probabilities, assuming independence, while simultaneously insisting on tail dependence in aggregation. This was an internal contradiction and is logged as the most serious inconsistency in the specification's history.

Where failure logic is genuinely monotone, inclusion-exclusion corrects overlap exactly, and binary decision diagrams give exact top-event probabilities with shared components evaluated once (Rauzy 1993; Sinnamon and Andrews).

A monotonicity precondition is imposed that no version before v3.0 checked. Fault tree methods require that a component failure cannot improve system outcome. Retries, fallbacks, circuit breakers, load shedding and graceful degradation all violate this. Where such patterns are present, state-based methods are required: continuous-time Markov chains, stochastic Petri nets or dynamic fault trees.

Regarding cycles, the position after two erroneous versions is that dynamic Bayesian networks handle feedback across time by unrolling into acyclic time slices, but instantaneous mutual dependence remains unrepresentable, and loopy belief propagation is approximate with convergence not guaranteed.

Aggregation across correlated losses uses a tail-dependent copula. The Gaussian copula is prohibited on the grounds of zero tail dependence (Embrechts, McNeil and Straumann 2002). Two folklore claims are corrected: value-at-risk is *exactly* additive under comonotonicity rather than overstated, and super-additivity under heavy tails requires a tail index below one, an infinite-mean regime.

**A prior-art note added at v1.1c.** The edge semantics used here, a conditional probability that a receiving node is affected given that a providing node has failed, together with Monte Carlo propagation from a seeded event and termination on a variance threshold, are all present in the granted claims of the BitSight correlated-risk family. Nothing in this section is originated by this framework, and Section 3.3 records the element as occupied. The methods remain correct; only the novelty position changes.

Percolation was removed entirely rather than caveated. Its results are asymptotic over random-graph ensembles with particular degree distributions, and an enterprise dependency graph is finite, engineered, hub-heavy and tiered. Re-audit confirmed removal as correct rather than over-cautious.

### 5.5 Flexibility

**This section is substantially rewritten at v1.1.** The v1.0 construction was mathematically sound and conceptually mis-framed. The mathematics is retained. The framing, the novelty claim and the legal anchor are replaced.

**What the quantity is not.** It is not a new valuation method. Pricing the option value destroyed by an irreversible commitment is standard: Dixit and Pindyck (1994) state that committing kills the option to invest and that the killed option belongs in the investment cost. Kulatilaka and Trigeorgis (1994) price the switch option under switching cost. Nothing in this section originates that idea.

**It is also not an addition to switching cost.** This was the v1.0 error that mattered most in practice. Under the standard industrial-organisation definition, switching costs are an aggregate that already includes learning costs, transaction costs, contractual and compatibility costs, and costs arising from uncertainty (Klemperer 1995; Farrell and Klemperer 2007). The option value forgone on committing is one of those components. Reporting it alongside a broad switching-cost figure and summing the two counts the same economic quantity twice.

v1.0 escaped this by defining switching cost narrowly as the deterministic one-time execution cost of moving, anchored to the EU Data Act treatment of permitted cloud switching charges. **That anchor is removed at v1.1 and should not be used by anyone.** Two reasons. First, it is a legal artefact rather than an economic definition, and a valuation quantity should not be defined by a regulatory fee schedule. Second, the fee it points to is being eliminated: Data Act Article 29(1) provides that from 12 January 2027 providers of data processing services shall not impose any switching charges on the customer for the switching process, with only reduced cost-covering charges permitted in the interim period. Anchoring a durable quantity to a charge legislated to zero is self-undermining.

**What the quantity is.** It is a decomposition. Broad switching cost is treated as the sum of two parts with different natures, different estimation routes and different decision uses:

```
broad switching cost = execution component + option component
                       (deterministic,       (stochastic,
                        engineering estimate, horizon-dependent,
                        one-time)             valuation estimate)
```

The framework's claim is not that the option component exists, which is known, nor that it can be priced, which is known. It is that the two components can be separated and reported separately, in a setting where the switching-cost literature treats the aggregate as undifferentiated and practitioner estimates report only the execution component. The decision value of the separation is that the two move for different reasons: the execution component responds to engineering work and tooling, the option component responds to horizon, volatility and the value distribution of the foregone alternative. A programme that reduces execution cost while leaving the option component untouched has not bought the flexibility it thinks it has.

**Construction.** The option component is computed as one switching-option model (Kulatilaka 1988; Kulatilaka and Trigeorgis 1994) evaluated at two switching-cost settings with the horizon held constant. The value function is weakly decreasing in switching cost, so the difference has a stable sign. A previous version differenced two option values varying in both strike and horizon, which entangled two effects and was uninterpretable.

Valuation uses Datar-Mathews simulation with **two discount rates**: the uncertain benefit at a risk-adjusted rate and the known switching cost at the risk-free rate, applied to each leg before the exercise decision. This two-rate requirement is confirmed against the published method. A previous version applied a single risk-free factor outside the expectation, which discounts a risky benefit at the risk-free rate and inflated the demonstration figure by approximately sixteen percent.

**The counterfactual and its adjudication rule. Added at v1.1b.** The option component requires a declared counterfactual: the alternative arrangement against which the committed one is valued. The counterfactual has been a mandatory logged field since v1.0, but nothing constrained its content, which meant two analysts declaring different counterfactuals produced different answers with no procedure to settle the disagreement. A logged field that anyone may fill with anything is a disclosure, not a control.

The rule adopted is that **the counterfactual must be an option that was actually on the table at the time of the decision, and it must be evidenced from the decision record.** An architecture decision record, a vendor shortlist, a board paper or a rejected design proposal all qualify. A counterfactual constructed after the fact by the analyst does not, however reasonable it appears, because a plausible alternative invented later can be selected to produce a desired magnitude. Where no such evidence exists in the decision record, the specification refuses the option component rather than accepting a reconstructed alternative. This is a strengthening of the pre-existing refusal condition for a missing counterfactual, and it will bind more often than that condition did, particularly on older commitments where the decision record is thin. That is the intended effect.

**Qualifications, extended at v1.1.**

The method makes no tradeability claim, which is appropriate since architecture arrangements do not trade. That framing is nevertheless contested: real-world probabilities with risk-adjusted discounting do not in general coincide with no-arbitrage valuation, and the approach inherits Borison's (2005) critique of practitioner real-options methods where inputs are subjective.

Added at v1.1: volatility estimated from cost or usage telemetry is a physical-measure estimate. Datar-Mathews is constructed to take physical-measure inputs, which is why it is used here and why the framework can contemplate E5 at all, but this must be stated rather than assumed. Any substitution of a risk-neutral valuation method into this construction without changing the volatility input would mix measures and produce a number with no interpretation. The claim that no volatility input is required was withdrawn at v3.0 as an overclaim: volatility is fully present in the dispersion of the simulated distribution.

The hysteresis caveat (Dixit 1989) is strengthened at v1.1 from a caveat to a refusal condition. With sunk switching costs the optimal policy has an inaction band, so the value function can be flat in switching cost across a range and then move sharply. Consequently a two-point difference is not a gradient, and worse, if the two evaluated settings straddle a band boundary the difference is partly an artefact of where the points were placed. The specification now requires the value function to be evaluated across a range of switching-cost settings and the two reporting points to be shown on that curve, and refuses to report an option component where the two points straddle a discontinuity in the curve. v1.0 recorded this as a caveat and reported the number anyway; that was insufficient.

The separation itself remains the most fragile joint in the framework, notwithstanding the reframing. If the option component cannot be estimated independently of the execution component in practice, the decomposition is arithmetic rather than economic. This is what H6 now tests.

### 5.6 Epistemic decay

Divergence between documented and observed architecture is measured as Jaccard distance on edge sets, dividing the symmetric difference by the union. This is bounded, symmetric and a proven metric (Levandowsky and Winter 1971, who later credited the earlier Marczewski-Steinhaus result). A previous version divided by one set alone, permitting values above unity and producing asymmetric results.

Drift enters as parameter uncertainty, which combines with inherent variability in the exponent of the loss distribution:

```
ln L | m ~ Normal(m, s^2)
       m ~ Normal(m0, tau^2)
--------------------------------
ln L ~ Normal(m0, s^2 + tau^2)
```

Consequently the median is invariant in tau while the mean and upper percentiles both rise, with the tail rising faster. Re-audit confirmed the demonstration figures at Section 6.4 as arithmetically correct.

This corrects two previous errors of opposite kind. Version 1.0 of the specification added a decay term to expected loss, which asserts that a stale map makes incidents larger; this double-counts and misstates the nature of the quantity. Version 2.0 corrected this to variance widening with the mean held constant, which is **also wrong**: the conditional mean is convex in the parameter, so widening genuine parameter uncertainty raises the unconditional mean by Jensen's inequality. Klinker (1997) establishes this in loss reserving, showing the parameter-variance term entering the predictive mean with a positive sign because of the convexity of the exponential, and notes that the sign is paradigm-dependent: a frequentist bias correction subtracts it, a Bayesian predictive mean adds it. This framework predicts future loss and therefore adds.

The mapping from measured drift to parameter uncertainty must be fitted against periods in which re-mining occurred and estimate movement was observed. Asserting a functional form is not permitted; a previous version asserted exponential saturation without fitting.

The framework's earlier citation of SR 11-7 as support for a conservative loading was withdrawn. That guidance cautions against applying conservatism broadly and against add-ons whose effect in complex models is neither obvious nor intuitive, and supports expression of uncertainty as ranges.

**Updated at v1.1.** SR 11-7, issued 4 April 2011, was superseded on 17 April 2026 by SR 26-2, with parallel interagency issuances. Readers and implementers should cite the current guidance. The substantive position taken here is unchanged, but the citation in v1.0 is now stale.

**Distinction from commercial encroachment.** Firefly prices the cost consequence of infrastructure-as-code drift by comparing the cost of the defined state with the cost of the running state. That is a cost delta. The construction here treats drift as parameter uncertainty entering a loss distribution, so its output is a change in the shape of a distribution, principally in the tail, rather than a cost difference. The two are complementary and not the same quantity. The distinction is narrower than v1.0 implied and is stated here so that a reader can judge it directly.

**A limit noted at v1.1b.** Re-mining reduces uncertainty about the current state of the graph. It says nothing about whether a past decision was correct, because the framework holds no historical series of decisions and outcomes against which to check. Reducing epistemic uncertainty about the present is not the same as learning, and Section 3.7 records this as the unanswered part of Durst's temporal delay barrier.

### 5.7 Refusal conditions

```
Drift above threshold              re-mine before computing
Ceiling binds above ~1% of sims    tail statistics unusable
Non-monotone logic, static FT      no propagated number
Cost series rejects random walk    sigma unusable for valuation
No exposure measure                report unweighted, disclose
No declarable counterfactual       no option component
Counterfactual not evidenced       no option component [NEW v1.1b]
  from the decision record
Reporting points straddle a        no option component [NEW v1.1]
  discontinuity in W(K)
Drift mapping never fitted         illustrative only
No causal driver for a cost pool   declare basis as arbitrary
Fixed-pool split is arbitrary      may not inform exit decisions
Total requested across use cases   not a supported output [NEW v1.1b]
Comparison spans graph versions    state which cause is being
                                     attributed, or refuse [NEW v1.1b]
```

---

## 6. Demonstration

### 6.1 Design and limits

The demonstration covers **one use case, in one subdomain, in one fictional mid-size retailer**, constructed from public data. It establishes computability. It establishes nothing about scale, generalisation or adoption, and no claim beyond computability should be drawn from it.

Public sources: Alibaba microservice traces from the 2022 cluster trace release, the Olist Brazilian e-commerce dataset, Cyentia IRIS 2025, NetDiligence claims data, and published cloud list prices.

**Source characterisation corrected at v1.1.** The Alibaba 2022 release documents more than twenty million call graphs among over seventeen thousand microservices, and separately reports detailed runtime metrics for nearly twenty thousand microservices across thirteen days. v1.0 reported the twenty-thousand figure against call graphs, conflating the two counts. The trace carries no failure-propagation ground truth, which is why no propagation claim is drawn from it.

**Source suitability stated at v1.1.** Cyentia IRIS and NetDiligence are cyber incident and claims datasets. Using them for loss magnitude in a framework that addresses architecture-caused loss generally is a stretch of scope, since architecture-caused availability and data-integrity losses are not the same population as cyber breach losses. The demonstration uses them because they are the best public monetary loss distributions available, and the figures should be read as illustrative of the machinery rather than as calibrated for this loss type.

Use case: process a product return. Nodes: API gateway, order service, and a shared payments service also serving four other use cases.

### 6.2 Cost

```
Payments service, GBP 2,400/month
  reserved capacity                       GBP   900
  usage-driven                            GBP 1,500

variable share by GB-seconds driver 0.14 -> GBP  210
fixed share by declared equal split 0.20 -> GBP  180
order service (exclusive)                 GBP  310
API gateway (exclusive)                   GBP  140
                                              ------
median monthly cost                       GBP  840
bootstrapped P10 to P90                   GBP  689 to 1,043
fixed-allocation component, separate      GBP  180
```

The fixed component is reported separately and, per Section 5.1, may not inform an exit decision for the payments service.

### 6.3 Frequency

```
prior mean (industry)          0.18 events/year
k = EPV/VHM = 0.021/0.009 =    2.333 years
alpha = 0.18 x 2.333 = 0.420,  beta = k = 2.333

local: 1 event over 14 quarters = 3.5 years
LEF_local = 1/3.5 = 0.286 events/year

posterior mean = (0.420 + 1)/(2.333 + 3.5) = 0.2434
credibility:  Z = 3.5/(3.5+2.333) = 0.600
              0.600(0.286) + 0.400(0.18) = 0.2434
```

Both derivations agree exactly, which is the specification's internal check. Re-audit reproduced these figures independently.

### 6.4 Magnitude and epistemic widening

```
LM | m ~ Lognormal(m, s^2), median GBP 278,000, s = 1.0

                        median        mean          P99
tau = 0 baseline        278,000     458,345    2,846,852
D = 0.11, tau = 0.22    278,000     469,572    3,009,717
                       unchanged     +2.45%       +5.72%
D = 0.25, tau = 0.50    278,000     519,372    3,746,424
                       unchanged    +13.31%      +31.60%
```

The tail moves at roughly twice the rate of the mean. This asymmetry is the observable signature of epistemic as distinct from aleatory uncertainty, and it is invisible in any single expected-loss figure. Re-audit reproduced all three rows independently.

### 6.5 Option component of switching cost

Reported at v1.0 as the "forfeited option". Relabelled at v1.1 per Section 5.5; the computation is unchanged.

```
one switching-option model, T = 3 held constant
Datar-Mathews, 2,000,000 paths, seed 20260809
mu = 0.12 risk-adjusted, r = 0.04 risk-free
Delta-V lognormal, median GBP 700,000, log-sd 0.60

W(K = 180,000, reversible)              GBP 426,004
W(K = 640,000, committed)               GBP 144,547
option component of switching cost      GBP 281,457

execution component (declared)          GBP 460,000
                (= 640,000 - 180,000)
broad switching cost, decomposed        GBP 741,457
  NOT to be added to any independently
  estimated broad switching-cost figure

monotone decreasing in K over 0 to 1.2M: verified
W(K) evaluated across the full range; both reporting
points lie on a continuous section of the curve

sensitivity, business case x 0.7        GBP 201,381
sensitivity, business case x 1.3        GBP 330,427

counterfactual: standard-interface design, GBP 180,000 exit
```

Under the incorrect single-rate formulation the same inputs yield GBP 326,782, an overstatement of approximately sixteen percent. Re-audit reproduced both figures.

The line marked NOT is the operative discipline. The decomposition replaces a broad switching-cost estimate; it does not supplement one.

**Noted at v1.1b.** The counterfactual above is declared for a fictional composite and therefore has no decision record behind it. Under the adjudication rule added at Section 5.5, a real engagement presenting this counterfactual without evidence from the decision record would receive a refusal rather than a number. The demonstration figure stands as an illustration of the machinery and would not stand as a reported result.

### 6.6 Reproduction

All figures in Section 6 are computed from the stated inputs and seed. The credibility calculation is verifiable by hand. The simulation figures are reproducible from the specification and the seed. An independent re-audit reproduced the credibility, lognormal and option figures.

**No total is computed across the three axes above, and none should be.** See Section 4.5.

---

## 7. Hypotheses and falsification conditions

```
+-----+--------------------------------+--------------------------+
| ID  | HYPOTHESIS                     | FALSIFIED IF             |
+-----+--------------------------------+--------------------------+
| H1  | The architectural coefficient  | Coefficient variation    |
|     | is measurable and varies       | across comparable        |
|     | materially across comparable   | estates is within        |
|     | estates, after workload mix    | measurement error, or    |
|     | and vendor-side effects are    | is fully explained by    |
|     | controlled for                 | mix and vendor effects   |
+-----+--------------------------------+--------------------------+
| H2  | Cost attributed via the graph  | Tag-based and graph-     |
|     | differs materially from cost   | based allocation agree   |
|     | attributed via tags            | within tolerance         |
+-----+--------------------------------+--------------------------+
| H3  | Monetary risk distributions    | Decisions are unchanged  |
|     | change decisions that colour   | when the same situation  |
|     | ratings do not                 | is presented both ways   |
+-----+--------------------------------+--------------------------+
| H4  | Graph-propagated loss differs  | Propagated and naive     |
|     | materially from node-local sum | totals agree             |
+-----+--------------------------------+--------------------------+
| H5  | Measured drift predicts        | Re-mining produces no    |
|     | estimate instability           | systematic estimate      |
|     |                                | movement related to      |
|     |                                | measured drift           |
+-----+--------------------------------+--------------------------+
| H6  | The option component of        | The ratio of option      |
|     | switching cost is a material   | component to execution   |
|     | fraction of the total and      | component is stable      |
|     | varies independently of the    | across commitments, or   |
|     | execution component across     | the option component is  |
|     | commitments                    | immaterial relative to   |
|     | (LEADING KILL RISK)            | estimation error         |
+-----+--------------------------------+--------------------------+
| H7  | Telemetry volatility proxies   | No relationship against  |
|     | value volatility               | an independently         |
|     |                                | observed proxy           |
+-----+--------------------------------+--------------------------+
| H8  | High option-component nodes    | No relationship under a  |
|     | prove costlier to change       | valid identification     |
|     |                                | design                   |
+-----+--------------------------------+--------------------------+
| H9  | The borrowed method stack      | Composition produces     |
|     | composes coherently            | contradictory outputs    |
+-----+--------------------------------+--------------------------+
| H10 | Coefficient movement follows   | Coefficient movement is  |
|     | architectural change within    | uncorrelated with        |
|     | the measurement horizon        | architectural change at  |
|     | [NEW v1.1b]                    | any lag the practice can |
|     | (SECOND KILL RISK)             | observe, meaning the     |
|     |                                | practice measures noise  |
+-----+--------------------------------+--------------------------+
```

### 7.1 On H6, rewritten at v1.1

The v1.0 form of H6 asserted that the forfeited option is distinct from switching cost, falsified if it moves one-for-one with execution cost. That hypothesis was close to unfalsifiable and is retired.

The reason is structural. The quantity is computed as W(K_low) minus W(K_high), so it is by construction a deterministic function of the switching-cost settings. It cannot fail to be related to switching cost. Because the value function is nonlinear in K, the relationship is not literally one-for-one, so the v1.0 hypothesis was technically falsifiable, but only in the way that any nonlinear transform is not the identity. That is a lawyer's escape and not a scientific test.

The rewritten H6 tests something the framework can actually be wrong about: whether separating the two components carries information. If the ratio of option component to execution component turns out to be roughly constant across commitments, then the option component is a fixed multiple of a quantity practitioners already estimate, the decomposition adds nothing, and the flexibility axis should be deleted. If the option component is small relative to estimation error, the same conclusion follows. This is the framework's leading kill risk and the test is now capable of returning that verdict.

**Its weight increases at v1.1c.** With E3 re-graded to occupied, the flexibility axis is the only axis of the three on which the framework asserts anything the prior art does not already do. If H6 returns a kill verdict, the practice reduces to running two occupied methods over a declared unit of account. That is not nothing, but it would not be a contribution.

### 7.2 On H8 and identification

The naive test regresses realised change cost on the option component. It is endogenous by construction: the option component is built from the switching-cost settings, so the relationship holds regardless of the theory's truth.

A valid design requires exogenous variation in commitment (a vendor repricing, a regulatory mandate, an acquisition), a comparison group unaffected by that event, pre-trend evidence, outcomes measured from change records independent of the model, and inputs restricted to ex-ante quantities. The exclusion restriction must be argued explicitly, since a vendor repricing may affect change cost directly rather than only through flexibility. A previous version listed three requirements and declared the problem solved; a list of desirable properties is not an identification strategy.

### 7.3 On H7 and the measure problem

Regressing value volatility on operational volatility is circular where the former is produced by a model taking the latter as input. Standard routes to the volatility of a non-traded asset exist (traded comparable, sector volatility, consolidated-volatility simulation) and each is contested, notably by Borison (2005). The honest position is that the link is estimable with an explicit and contestable proxy whose assumptions are disclosed, and that absent such a proxy it is an assumption rather than a finding.

Added at v1.1: the estimate is in the physical measure and the valuation must be one that accepts physical-measure inputs. See Section 5.5.

### 7.4 On H1 and the selection effect, added at v1.1b

H1 as designed is exposed to a selection effect that would make a null result uninterpretable, and the design must account for it before the test is run.

The scope conditions at Section 2.3 require metered consumption, emitted telemetry and an existing subdomain decomposition. An estate satisfying all three is well instrumented, and estates that are well instrumented are, on any reasonable prior, better run than those that are not. The population in which the architectural coefficient is measurable is therefore plausibly the population in which its variance is smallest. If H1 returns a null, the framework cannot distinguish between two explanations: that coefficient variation is genuinely immaterial, which falsifies the hypothesis, or that variation is material in general and small in the well-run subset where measurement is possible, which does not.

The direction of the bias is against the framework, so a positive H1 result in this population would be strong evidence. A negative result would be weak evidence and must not be reported as a clean falsification. Any H1 design must therefore either obtain variation in instrumentation maturity within the sample, or state explicitly that a null result is uninformative about the wider population. No previous version noted this, and the H1 as stated at v1.0 would have been over-read either way.

---

## 8. Threats to validity

**Novelty.** The element carried as the principal contribution at v1.0 is occupied. What remains is set out at Section 3.5 and is smaller. A reader who encountered v1.0 should treat its novelty claim as withdrawn.

**Absorption.** Methodological absorption by Technology Business Management or FinOps, whose unit economics capability is closer than earlier versions of this work admitted. Product absorption by vendors already holding the graph, the repository and cost fields. The mined graph is now available as commodity open infrastructure, which lowers the barrier for any of them. Added at v1.1c: the absorption list now includes the holder of the E3 patent family, which holds the graph and the monetised risk distribution and lacks only a cost axis.

**Patent position, restated at v1.1c.** Previous versions recorded the BitSight family as a constraint on element E3 and on any future filing. Having read the claims and the specification directly, the correct statement is stronger: the family occupies E3 rather than merely constraining it, and the framework's risk axis runs an occupied method over a different substrate. The practical consequences are that no novelty should be claimed for graph-propagated monetary risk, that a formal freedom-to-operate opinion is required before any filing and has not been obtained, and that the framework's exposure is now concentrated on the flexibility axis and the unit of account rather than spread across three axes. Two patent numbers cited at v1.0 were read at source at v1.1c and are irrelevant to this framework; they are corrected rather than merely withdrawn. See Section 3.3.

**Under-identification of the coefficient.** The central cost identity is a definition. The architectural coefficient is a residual absorbing everything that is not volume or unit price. Attribution of that residual to architecture is an empirical claim tested at H1 and not established by the identity.

**Measure mixing.** Telemetry-derived volatility is a physical-measure estimate. The valuation used accepts such inputs; substituting a risk-neutral method without changing the input would produce an uninterpretable number.

**No portfolio position. [T-M-a, added at v1.1b.]** The ledger cannot be totalled, for three independent reasons set out at Section 4.5. The practice therefore cannot answer the aggregate question an executive audience most commonly asks, and organisations requiring a single exposure or valuation figure should not adopt it. This is a limitation of the practice, not of its presentation. Noted at v1.1c: an occupant of E3 does produce a portfolio-level aggregate, by simulating the whole graph in one model rather than cutting it into declared units first. The framework's inability here is partly a consequence of its own unit of account.

**The unit of account is declared. [T-M-b, added at v1.1b.]** The graph is mined; the business subdomain decomposition laid over it is hand-built. The framework is a hybrid and earlier versions implied a purity it does not have. The declared boundaries determine where cost pools are cut and where propagation is bounded. See Section 4.1 and the fourth scope condition at Section 2.3.

**The graph moves under the measurement. [T-N, added at v1.1b.]** The substrate is re-mined continuously, so two readings taken at different times differ for two reasons simultaneously: the architecture changed, and the map of it changed. The framework has no as-at concept and no frozen-graph concept, which means no two readings are strictly comparable and any time series it produces is confounded at every point. The discipline adopted is that every reported figure carries the graph version it was computed against, and that comparison across graph versions is either accompanied by an explicit statement of which of the two causes is being attributed, or refused. That makes the problem visible. It does not solve it, and a practice whose central promise is measurement over time should be read as having an unresolved problem at its centre.

**Goodhart's law. [T-O, added at v1.1b.]** Once the architectural coefficient becomes a number architects are held to, it stops measuring architecture and starts measuring what architects do to the coefficient. The available levers are not exotic. An analyst can select a different causal driver for a cost pool, place a subdomain boundary so that expensive nodes fall outside the unit, or choose a counterfactual that flatters the option component. The framework has no anti-gaming treatment. The declared-fields discipline is a partial mitigation, since driver, boundary and counterfactual are all logged and therefore contestable, and the adjudication rule at Section 5.5 removes one of the three levers by requiring evidence from the decision record. Visibility is not prevention, and a determined actor with control of the declarations can still choose the answer within a defensible range.

**Selection effect on H1. [T-P, added at v1.1b.]** The estates in which the framework is measurable are plausibly the estates in which coefficient variance is smallest, so H1 could return a null for reasons unrelated to its truth. See Section 7.4.

**Counterfactual adjudication. [T-Q, added at v1.1b.]** The option component depends on a declared counterfactual, and until v1.1b nothing constrained what could be declared. The evidence-from-the-decision-record rule at Section 5.5 now constrains it, at the cost of refusing the option component on older commitments where the decision record is thin. Whether that rule is workable in practice is untested.

**Prior art assessed by proxy. [T-R, added at v1.1a, updated at v1.1b and again at v1.1c.]** The Durst assessment was produced at v1.1a by a model reading the source, and the author had not read it. Sections 6.5, 6.7.3.9 and 6.7.6 have now been read at source and the verdict is unchanged, but the v1.1a account of the barriers was materially wrong and had been carried in a published version. The reading was performed by character recognition on a scanned volume, which establishes substance reliably and wording unreliably, so nothing is quoted. At v1.1c the same exposure was found in the patent citations: two numbers published at v1.0 were never checked against the patent records, and the family that mattered was described from a summary rather than read. The remaining exposure is that other sections of Durst have still not been read, that the specifications of the other four family members have not been read, and that the same proxy-reading method was used on other sources in the reference list without the same follow-up. Cope and Labbi remains the largest such item.

**Concentration of the remaining claim. [T-S, added at v1.1c.]** With E1 commodity, E3 occupied and E4 retired, the framework's exposure is no longer spread across the three axes. Two things now carry the whole position: whether the option-component decomposition carries information (H6), and whether a use case within a declared business subdomain is a better unit of account than the units already in use. If both fail, nothing survives except the operating model, and Section 3.6 already retires the operating model as a differentiator.

**Unsearched adjacency.** Non-English literature beyond German remains unsearched: Dutch, French, Chinese and Japanese. The German finding (Durst 2007) was material and was found late, and although it has now been assessed and does not occupy the integration, the fact that it took a targeted search to surface it is the exposure, not the verdict it returned. The E4 finding at v1.1 was worse: it was in English, canonical, and in a text already cited elsewhere in this paper. The E3 finding at v1.1c was worse still: it was in a patent already cited by number in this paper, and reading its specification took four retrievals. The operating principle adopted is that **unexamined is not unoccupied**, the v1.1 corollary is that **cited is not read**, and the v1.1b corollary is that **summarised is not read**.

**Scope conditions.** The framework requires metered consumption, emitted telemetry and nameable subdomains, which together select for a well-instrumented minority of estates.

**Single demonstration.** One use case, one subdomain, one fictional organisation, with loss data drawn from a cyber population rather than an architecture-failure population. No scaling evidence exists, and the integration claim remains a proposal rather than a validated result.

**Contested foundations.** Five methods are presented in the specification with explicit notice that they are contested in their own literatures: real-world probabilities in Datar-Mathews, size-scaling of external loss data, activity-based costing driver stability, volatility estimation for non-traded assets, and geometric Brownian motion applied to cost series.

**Temporal validity.** Every quantity is measured contemporaneously, and architectural effects arrive with delay. H10 tests whether the practice is measuring signal or noise, and the framework has no answer if it returns a null. See Section 3.7.

**Adoption.** The framework makes no claim that organisations will act on its output. The history of enterprise architecture quantification suggests the base rate is unfavourable.

---

## 9. Correction history as method

### 9.1 The record

```
Framework claims retired on contact with prior art     16
Formal specification, logged errors
  v1.0 fatal errors (F1-F4)                             4
  v2.0 errors corrected at v3.0 (G1-G16)               16
  v3.0 errors corrected at v3.1 (H1-H9)                 9
  total                                                29
Methods removed entirely                                2
This paper, v1.0 to v1.1, corrections (P1-P12)         12
This paper, v1.1a to v1.1b, corrections (S1-S11)       11
This paper, v1.1b to v1.1c, corrections (T1-T8)         8
```

### 9.2 The pattern

The errors share a cause, and it is not mathematical ignorance. In each case a genuine problem was identified, a replacement method was located that sounded authoritative, and it was adopted without verification against its primary source.

Version 1.0 of the specification applied an exchange-option closed form outside its conditions of validity. Version 2.0 replaced it with a method whose published form uses two discount rates and applied one. Version 2.0 corrected an additive risk term to a variance-widening term and asserted mean invariance, which is false for the skewed distributions the framework uses.

The v1.1 error extends the pattern in a way worth naming separately. E4 was not an unverified borrowing. It was a novelty claim asserted without checking the primary literature of the field being borrowed from, in a case where the relevant texts were already in the reference list for other purposes. The failure mode was confidence rather than ignorance, and specifically confidence in a negative: the belief that something was absent, held without having looked in the obvious place.

The v1.1c error is the same shape once more, and this time the obvious place was a patent number printed in this paper's own reference list. The family had been cited since v1.0 and described from a summary. Reading its claims and specification took four retrievals and moved an element from partially occupied to occupied.

**Five failure modes are now logged.**

```
1  Confidence in a METHOD      adopted because it sounded
                               authoritative, unread
2  Confidence in a GAP         claimed absent without
                               looking in the obvious place
3  Absolute claims             "nobody", "never", emerging
                               automatically from narrative
4  Fabricated quotation        fluent, apt, correctly
                               page-numbered, non-existent.
                               Only a source search catches it
5  Structural detail from      a count, a section number, an
   a proxy read                ordering, an assignee, a patent
                               number, taken from a model's
                               summary of a source. Plausible,
                               checkable, unchecked. Caught at
                               v1.1b and again at v1.1c, both
                               times after being published
```

Failure mode 5 is recorded separately from 4 because the response to 4 was insufficient. When the fabricated quotation was caught at v1.1a, the rule adopted was that a quotation is a claim and needs checking. That rule was too narrow. The same proxy read that produced the fabricated quotation also produced a barrier count and a set of section numbers, and those were carried into a published version unchecked because they did not look like quotations. **The correct rule is that everything a proxy read returns about a source is a claim, including its structure.** At v1.1c the class was extended again, to patent numbers and assignees.

Two cautions are logged that are not yet failure modes because neither has yet caused a published error.

The sixth, from v1.1b: character recognition on a scanned source establishes substance at Strong and wording at Indicative. Nothing is quoted from it.

The seventh, from v1.1c: **a research process that grades its own findings Strong is making an unverified claim about its own reading.** Any finding arriving through a proxy is graded no higher than Indicative until the primary record is opened directly, whatever grade the proxy assigned itself. In the v1.1c case the proxy's substance was correct and its grade was still unearned, which is precisely why the rule is about provenance rather than about accuracy.

### 9.3 Why this is published, and what it is not

Enterprise architecture quantification has a documented record of attempts that were not sustained. Against that base rate, a polished result with no visible working is weak evidence, because the natural question is who checked it.

A correction sequence answers a different question: what happens to this framework when it is wrong? The answer is on the record, six times now, with the errors named and the replacements sourced.

**Corrected at v1.1.** Version 1.0 of this paper concluded that the correction log was the most defensible artefact the work had produced. That framing is withdrawn. A correction log is process hygiene, not a contribution, and elevating it to the headline achievement functions as a deflection from the fact that a central claim did not survive. The log is retained as method and as evidence of responsiveness. It is not offered as the result.

Two structural properties were adopted as a consequence of the correction history and are retained. First, retirements are logged rather than silently edited, and superseded versions are left in place rather than withdrawn. Second, constructions that can contradict themselves are preferred to constructions that cannot: the Poisson-gamma credibility model is retained partly because its two derivations must agree exactly, so an implementation error announces itself.

---

## 10. Conclusion

Enterprise architecture is a continuously billing determinant of unit cost, a material risk concentrator, and a foreclosure or preservation of future options. It satisfies the criteria the enterprise measurement regime applies to every other material asset, and it sits outside that regime.

This paper proposes a standing measurement practice that treats the mined dependency graph as a ledger and attaches three distributional quantities to each use case within a named business subdomain. The contribution is integration, and at v1.1c it is narrower than any previous version claimed. Of seven constituent elements, five are occupied or partially occupied, one is open only in peer-reviewed literature and is already encroached commercially, and one is open on present evidence and rests on the absence of a found occupant.

Two elements previously carried as contributions are now occupied. The inverted-sign forfeited option, presented at v1.0 as the principal novelty, is standard opportunity cost stated in the canonical real options literature. And the monetisation of graph-propagated risk, carried through v1.1b as partially occupied and patent-constrained, is occupied outright: a granted family with a 2018 priority date builds a discovered dependency graph, propagates a seeded disruption through it by Monte Carlo, assesses monetary loss per node, aggregates across assets, entities and portfolios, and reports a dollar-denominated loss exceedance curve.

What survives is narrower and should be read as such. A decomposition separating the option component of switching cost from the deterministic execution component, in a setting where the switching-cost literature treats the aggregate as undifferentiated. A unit of account, the use case within a named business subdomain, against which all three axes are expressed. And a substrate that maps internal business work rather than external vendor exposure. Whether the first of those carries decision-relevant information is what H6 tests, and it is now the framework's leading open question by some distance.

Three further limits are stated at v1.1b and none of them is presentational. The ledger produces per-use-case entries and cannot be totalled, so the practice is a measurement discipline rather than a management system. The unit of account it uses is declared by hand rather than derived from telemetry, so the practice is a hybrid rather than the pure instrument earlier versions implied. And every quantity is measured contemporaneously while architectural effects arrive with delay, which Durst identified as a barrier in 2007 and which this framework does not answer; H10 tests whether the practice is measuring signal or noise.

The framework has been demonstrated once, at one node, on a fictional composite, and that demonstration establishes computability and nothing further. Ten hypotheses are stated with explicit kill conditions.

The result claimed here is a proposal with its prior art honestly located, two novelty claims withdrawn, and its aggregation, unit-of-account and temporal limits stated. That is less than v1.0 claimed, less than v1.1a claimed, and less than v1.1b claimed. It is what the evidence supports.

---

## References

*Verification note: v1.0 was prepared without access to citation databases. An independent re-audit at v1.1 verified the majority of the references below against primary or authoritative secondary sources. References marked [NIV] were not independently verified at re-audit and should be checked before onward citation. One attributed conclusion is marked [CONCLUSION UNVERIFIED].*

Bahsoon, R. and Emmerich, W. ArchOptions: a real options-based model for predicting the stability of software architectures. EDSER-5 workshop, ICSE, Portland, Oregon, 2003.

Baldwin, C.Y. and Clark, K.B. *Design Rules, Volume 1: The Power of Modularity.* MIT Press, 2000.

Barndorff-Nielsen, O.E. and Shephard, N. Power and bipower variation with stochastic volatility and jumps. *Journal of Financial Econometrics*, 2004. [NIV]

Borison, A. Real options analysis: where are the emperor's clothes? *Journal of Applied Corporate Finance* 17(2), 2005. [NIV]

Buhlmann, H. and Gisler, A. *A Course in Credibility Theory and its Applications.* Springer, 2005.

Cope, E.W. and Labbi, A. Operational loss scaling by exposure indicators: evidence from the ORX database. *Journal of Operational Risk* 3(4), 25-45, 2008. DOI 10.21314/JOP.2008.051 [Metadata verified exactly. CONCLUSION UNVERIFIED: the conclusion attributed at v1.0 could not be confirmed from the accessible abstract. See Section 5.2.]

Datar, V.T. and Mathews, S.H. European real options: an intuitive algorithm for the Black-Scholes formula. *Journal of Applied Finance* 14(1), 2004. [Two-rate structure verified.]

Dixit, A. Entry and exit decisions under uncertainty. *Journal of Political Economy* 97(3), 620-638, 1989.

Dixit, A. and Pindyck, R. *Investment under Uncertainty.* Princeton University Press, 1994. [Load-bearing at Section 3.3 E4 and Section 5.5: the statement that irreversible investment exercises, or kills, the option to invest, and that the killed option belongs in investment cost.]

Durst, M. *Wertorientiertes Management von IT-Architekturen.* Teubner, Wiesbaden, 2007. Copyright Deutscher Universitaets-Verlag / GWV Fachverlage GmbH. Dissertation, Universitaet Erlangen-Nuernberg, 2007. Print ISBN 978-3-8350-0895-3. DOI 10.1007/978-3-8350-5516-2 [Cited at v1.0 as "Teubner, 2008". The publisher's own record gives Teubner and 2007. Load-bearing at Sections 3.3 E4, 3.7 and 4.5. Sections 6.5, 6.7.3.9 and 6.7.6 read at source at v1.1b via character recognition on a scanned copy: substance Strong, wording Indicative, nothing quoted. Sections 6.5.1 to 6.5.6 enumerate six barriers to direct valuation; 6.7.3.9 treats strategic options qualitatively with no valuation method; 6.7.6.4 declares flexibility improvements not calculable; 6.7.6.5 states that overlapping value contributions cannot simply be added. Remaining sections unread.]

Ekstedt, M., Afzal, Z., Mukherjee, P., Hacks, S. and Lagerstrom, R. Yacraf: yet another cybersecurity risk assessment framework. *International Journal of Information Security* 22(6), 1713-1729, 2023. DOI 10.1007/s10207-023-00713-y [NIV]

Embrechts, P., McNeil, A. and Straumann, D. Correlation and dependence in risk management: properties and pitfalls. In *Risk Management: Value at Risk and Beyond*, Cambridge University Press, 2002, pp. 176-223.

European Union. Regulation (EU) 2023/2854 (Data Act), Article 29. [Cited at v1.1 only to record why the v1.0 anchor was removed.]

Farrell, J. and Klemperer, P. Coordination and lock-in: competition with switching costs and network effects. In *Handbook of Industrial Organization*, Volume 3, 2007.

Federal Reserve Board and Office of the Comptroller of the Currency. Supervisory Guidance on Model Risk Management. SR 11-7, 4 April 2011. Superseded 17 April 2026 by SR 26-2 and parallel interagency issuances; cite the current letter.

Jewell, W.S. Credible means are exact Bayesian for exponential families. *ASTIN Bulletin*, 1974.

Kaplan, R.S. and Anderson, S.R. Time-driven activity-based costing. *Harvard Business Review*, November 2004.

Klemperer, P. Competition when consumers have switching costs: an overview with applications to industrial organization, macroeconomics, and international trade. *Review of Economic Studies* 62(4), 515-539, 1995. DOI 10.2307/2298075 [Load-bearing at Section 5.5: switching costs as an aggregate including learning, transaction and uncertainty components.]

Klinker, F.L. The parameter variance adjustment in lognormal linear models for loss reserves: Bayesian vs frequentist analysis. *CAS Forum*, Winter 1997, 35-54.

Kulatilaka, N. Valuing the flexibility of flexible manufacturing systems. *IEEE Transactions on Engineering Management*, 1988. [NIV]

Kulatilaka, N. and Trigeorgis, L. The general flexibility to switch: real options revisited. *International Journal of Finance* 6(2), 778-798, 1994.

Levandowsky, M. and Winter, D. Distance between sets. *Nature* 234(5323), 34-35, 1971. DOI 10.1038/234034a0

Margrabe, W. The value of an option to exchange one asset for another. *Journal of Finance* 33(1), 177-186, 1978. [NIV]

Open Group. Risk Analysis (O-RA) and Risk Taxonomy (O-RT) Standards. [NIV: current versions not re-checked.]

Rauzy, A. New algorithms for fault trees analysis. *Reliability Engineering and System Safety*, 1993.

Shih, J., Samad-Khan, A.J. and Medapa, P. Is the size of an operational loss related to firm size? *Operational Risk*, January 2000. [NIV]

Sinnamon, R.M. and Andrews, J.D. Improved accuracy in quantitative fault tree analysis. *Quality and Reliability Engineering International.* [NIV: year not established.]

Sullivan, K.J., Griswold, W.G., Cai, Y. and Hallen, B. The structure and value of modularity in software design. *ESEC/FSE*, 2001.

Taudes, A., Feurstein, M. and Mild, A. Options analysis of software platform decisions: a case study. *MIS Quarterly* 24(2), 227-243, 2000. DOI 10.2307/3250937

Trigeorgis, L. Real options and interactions with financial flexibility. *Financial Management* 22(3), 1993. [Load-bearing at Section 4.5: option values interact and are not additive.]

**Patent documents referenced.** Corrected and read at source at v1.1c.

```
BitSight, "Correlated risk in cybersecurity". One
continuation chain, five grants. Claims read at source
for 10,257,219; claims read for 10,594,723, 10,931,705
and 11,770,401; specification read for 10,257,219.
Load-bearing at Sections 3.3 E3, 4.5, 5.4 and 8.

  15/918,286  ->  US 10,257,219   9 Apr 2019
  16/292,956  ->  US 10,594,723  17 Mar 2020
  16/795,056  ->  US 10,931,705  23 Feb 2021
  17/179,630  ->  US 11,770,401
  18/365,384  ->  US 12,273,367

US 8,766,981 (Apptio). Visualizing trace of costs across
a graph of financial allocation rules. Section 3.3 E2.

US 6,862,579. Datar-Mathews method.
```

*Corrected at v1.1c, replacing the v1.1 withdrawal note.* US 12,380,090 and US 11,356,469 were cited at v1.0 as members of the BitSight family and withdrawn at v1.1 as unconfirmable. Both have now been read at source. Both are granted, neither belongs to that family, and neither is relevant to this framework. US 12,380,090, "Managing data risk using automated dependency discovery," builds a dependency graph from read and write logs and outputs a level of risk, with no monetary quantity and no distribution in its claims; its subject is dataset corruption. US 11,356,469, "Method and apparatus for estimating monetary impact of cyber attacks," recites data pools, a correlation engine and a monetary impact calculation, with no graph and no distribution. Reported assignees are Google LLC and Barracuda Networks respectively, read from a secondary index and graded Indicative. The duplicate appearance of 11,356,469 in the v1.0 source list was a wrong citation copied twice.

---

## Appendix A: Correction log

### A.1 Framework claims retired

```
R1  Cross-organisational economic signature of architecture
R2  Nobody monetises graph-propagated risk
      -> RISKEE, cyber-cat models, BitSight family
R3  Shared language as differentiator
      -> TBM since 2012
R4  Option value absent from EA literature
      -> Baldwin & Clark, Sullivan, Taudes, Bahsoon & Emmerich
R5  Mined substrate as differentiator
      -> CSDM, observability vendors, now OpenTelemetry
R6  Operating model as differentiator
      -> FinOps + TBM joint publication
R7  Above-the-line risk as a construct
      -> Basel operational risk
R8  Modularity as alternate graph paths
      -> that is redundancy; modularity is cut cost
R9  Architecture as unqualified cost driver
      -> narrowed to determinant of unit cost
R10 Inverted-sign forfeited option is commercially open [v1.1]
      -> Dixit & Pindyck 1994: irreversible investment
         kills the option to invest, and the killed option
         belongs in investment cost
      -> Kulatilaka & Trigeorgis 1994: switch option under
         switching cost, with hysteresis
      -> dividend/convenience yield treatment is routine
R11 Forfeited option is additive to switching cost [v1.1]
      -> Klemperer 1995, Farrell & Klemperer 2007:
         switching costs already aggregate the option and
         uncertainty components; addition double-counts
      -> reframed as decomposition, Section 5.5
R12 Correction log as the work's most defensible artefact [v1.1]
      -> process hygiene is not a contribution
R13 The practice is telemetry-derived throughout [v1.1b]
      -> the graph is mined, the unit of account on it is
         declared; the practice is a hybrid, Section 4.1
R14 Ledger entries aggregate to a portfolio position [v1.1b]
      -> no axis admits summation, Section 4.5
      -> Durst 2007 s6.7.6.5 states the overlap problem for
         the cost and benefit axis independently
R15 E3 is only partially occupied; the patent family
    constrains rather than occupies it [v1.1c]
      -> claims AND specification read at source
      -> dollar-denominated loss exceedance curve over a
         discovered dependency graph, priority Mar 2018
      -> aggregation across assets, entities and portfolios
         is claimed, including as a nonlinear sum
R16 Risk quantification vendors scope from asset
    inventories and scenarios rather than from a mined
    dependency graph [v1.1c]
      -> at least one scopes from a discovered graph
      -> the surviving statement is that they address
         neither unit cost nor flexibility, Section 3.5
```

### A.2 Specification v1.0 fatal errors

```
F1  Margrabe closed form used with a cash strike added
F2  Forfeited option as difference of two options varying
    in both strike and horizon
F3  Epistemic decay added to expected loss
F4  Falsification regression circular by construction
```

### A.3 Specification v2.0 errors, corrected at v3.0

```
G1  "Drift widens variance, mean unchanged" - false for
    skewed loss; median invariant, mean and tail both rise
G2  Datar-Mathews with one discount rate rather than two
G3  Plain Buhlmann mislabelled Buhlmann-Straub; quarterly
    counts mixed with annual rates
G4  Independent AND rule contradicting tail-dependence
    insistence elsewhere
G5  Hard cap at subdomain value rather than censoring
G6  Severity-scaling exponent applied to frequency
G7  "Comonotonic addition overstates VaR"; missing alpha < 1
    condition on super-additivity
G8  Fault trees applied without a monotonicity check
G9  Cycle retraction over-broad; LBP convergence overstated
G10 Percolation retained with a caveat rather than removed
G11 "No volatility input required" overclaim
G12 SR 11-7 cited as support for what it cautions against
G13 Geometric Brownian motion assumed for cost series
G14 Falsification declared solved by a list of requirements
G15 FAIR secondary loss as flat additive term
G16 Identification problem presented as near-unsolvable
```

### A.4 Paper v1.0 to v1.1

```
P1  E4 reclassified OCCUPIED; novelty claim withdrawn
P2  Double-count resolved by decomposition, not addition
P3  EU Data Act anchor removed (Art. 29(1) zeroes the
    charge from 12 Jan 2027)
P4  H6 rewritten; v1.0 form was near-unfalsifiable
P5  Hysteresis caveat promoted to a refusal condition
P6  Cost identity flagged as a definition, not a finding;
    coefficient is an under-identified residual
P7  Two unverifiable patents withdrawn; two additional
    BitSight family members added; Apptio US 8,766,981
    added to E2
P8  Cope & Labbi attributed conclusion downgraded to
    Asserted pending source-body check
P9  Bahsoon & Emmerich year supplied; SR 11-7 supersession
    recorded; Alibaba microservice counts disambiguated
P10 Correction-log-as-headline framing withdrawn
P11 Scope condition restated as a well-instrumented
    minority of estates
P12 Integration claim restated as a proposal awaiting test
    rather than a contribution
```

### A.5 Paper v1.1 to v1.1a

```
Q1  Durst assessed against four targeted questions.
    Verdict: does NOT occupy the integration. No
    telemetry discovery, no monetary risk, no option
    pricing, axes not combined. Section 3.3 E4.
Q2  Durst's own conclusion recorded as a standing
    OBJECTION as well as a clearance: he found direct
    valuation not achievable and went indirect.
    [SUPERSEDED AT v1.1b. The v1.1a entry stated three
    barriers at sections 6.5.1 to 6.5.3. There are six,
    at 6.5.1 to 6.5.6. See S1.]
Q3  Durst citation reverted to Teubner, 2007, per the
    publisher's record. The v1.1 "correction" was wrong.
Q4  Durst removed from the kill list and from the
    open-exposure list; retained as nearest prior art
    in intent.
Q5  A German quotation surfaced during the assessment
    was checked against the source and found not to be
    present verbatim. Substance retained, wording
    discarded, nothing quoted. Logged because the
    failure mode (a fluent, apt, non-existent quote)
    is the one this framework is least equipped to
    catch by reasoning alone.
```

### A.6 Paper v1.1a to v1.1b

```
S1  Durst read at source. Q2 corrected: SIX barriers at
    sections 6.5.1 to 6.5.6, not three at 6.5.1 to 6.5.3.
    Delayed effects is 6.5.6. Two barriers were unknown
    to this framework: data acquisition (6.5.4) and the
    forecasting problem (6.5.5). New Section 3.7 answers
    each, with two admissions of failure.
S2  Durst 6.7.3.9 "Strategische Optionen" read: qualitative
    strategic-benefit narrative, no valuation method. Durst
    6.7.6.4 read: he declares flexibility improvements not
    calculable and carries them qualitatively. E4
    non-occupancy verdict strengthened from Indicative to
    Strong on substance.
S3  Durst 6.7.6.5 read: overlapping value contributions
    cannot simply be added, with cross-settlement proposed.
    Cited at Section 4.5 as prior art for the aggregation
    limit. The framework does not claim to have noticed
    this first.
S4  A1 ADDED as Section 4.5: the ledger cannot be totalled.
    Non-additivity stated per axis with a distinct reason
    for each. Portfolio total added to refusal conditions.
    Legitimate alternatives named: ranking, pairwise
    comparison, per-axis aggregation with method named.
S5  A2 ADDED at Section 4.1: the unit of account is declared,
    not mined. The practice is a hybrid. Partial defence
    on rate-of-change grounds stated as partial. Fourth
    scope condition added at 2.3 requiring the subdomain
    decomposition to be pre-existing and independently
    owned. R13 logged.
S6  H10 ADDED: coefficient movement follows architectural
    change within the measurement horizon. Kills the
    practice if falsified. Answers nothing in Durst 6.5.6;
    tests it.
S7  Threats to validity extended with T-M-a (no portfolio
    position), T-M-b (declared unit), T-N (graph moves
    under the measurement), T-O (Goodhart), T-P (selection
    effect on H1), T-Q (counterfactual adjudication),
    T-R updated (Durst now read at source).
S8  Counterfactual adjudication rule added at Section 5.5:
    must be an option on the table at decision time,
    evidenced from the decision record. New refusal
    condition. Demonstration counterfactual noted as one
    that would be refused in a real engagement.
S9  Section 7.4 added: H1 selection effect. A null result
    in the measurable population is uninformative about
    the wider one and must not be reported as a clean
    falsification.
S10 Graph-version discipline added: every figure carries
    the graph version it was computed against; comparison
    across versions states which cause is attributed or
    is refused.
S11 Failure mode 5 logged: structural detail taken from a
    proxy read. The v1.1a rule "a quotation is a claim"
    was too narrow. Everything a proxy read returns about
    a source is a claim, including counts, section numbers
    and ordering. Sixth caution added on character
    recognition: substance Strong, wording Indicative,
    nothing quoted.
```

### A.7 Paper v1.1b to v1.1c

```
T1  E3 RE-GRADED from PARTIALLY OCCUPIED to OCCUPIED.
    Section 3.3 rewritten. The BitSight correlated-risk
    family was read at claim level for four grants and at
    specification level for US 10,257,219, rather than
    described from a summary as in every previous version.
    The specification denominates loss in US dollars and
    reports a loss exceedance curve; the claims cover the
    graph, the seeded Monte Carlo, the propagation, the
    per-asset loss assessment and aggregation across
    assets, entities and portfolios. R15 logged.
T2  The continuation chain confirmed from the face of the
    later records and stated in full: 15/918,286 ->
    10,257,219 -> 10,594,723 -> 10,931,705 -> 11,770,401
    -> 12,273,367, priority March 2018.
T3  US 12,380,090 and US 11,356,469 CORRECTED rather than
    withdrawn. Read at source. Both granted, neither in
    the family, neither relevant. 12,380,090 is dataset-
    corruption risk from read/write logs with no money in
    its claims; 11,356,469 is a monetary impact
    calculation with no graph. Assignees Indicative only.
    The v1.0 duplicate listing was a copied wrong
    citation, not a transposed digit.
T4  Section 3.5 CORRECTED. The clause asserting that risk
    quantification vendors scope from asset inventories
    and scenarios rather than from a mined dependency
    graph is false and is replaced. The surviving
    statement is that they address neither unit cost nor
    flexibility, and that their graph maps external
    vendor exposure rather than internal business work.
    R16 logged. Absorption list extended to four parties.
T5  Section 4.5 extended. The aggregation limit now has
    TWO prior-art precedents, not one. The second is a
    granted claim to aggregating losses in a nonlinear
    sum. Two distinctions stated: the family asserts a
    method where this framework records a refusal, and
    the family reaches a joint position by simulating the
    whole graph in one model, which needs no copula. The
    framework's aggregation problem is noted as partly
    self-inflicted by its own unit of account.
T6  Section 5.4 given a prior-art note: per-edge
    conditional probability, seeded Monte Carlo
    propagation and variance-threshold termination are
    all in the granted claims. Methods unchanged; only
    the novelty position changes.
T7  Threats to validity: patent entry rewritten from
    constraint to occupancy; T-S added on concentration
    of the remaining claim; T-R updated a second time;
    T-M-a extended to note that an occupant does produce
    a portfolio aggregate. Section 7.1 notes that H6 now
    carries more weight because the flexibility axis is
    the last axis on which the framework asserts anything
    the prior art does not already do.
T8  Third method failure logged at Section 3.1 and a
    seventh caution at Section 9.2: a research process
    that grades its own findings Strong is making an
    unverified claim about its own reading. Any finding
    arriving through a proxy is graded no higher than
    Indicative until the primary record is opened
    directly, whatever grade the proxy assigned itself.
    Failure mode 5 extended to cover assignees and patent
    numbers.
```

---

## Appendix B: Companion documents

```
Part IX, the mathematics, v3.1b   formal specification
The Numbers Explained, v1.1a      zero-to-100 companion,
                                    no mathematics required
Canonical Thesis v2.1b            complete standalone canon
```

**Status at v1.1c, stated plainly.** The set does not match and should not be circulated as a set.

Canonical Thesis v2.1b and Part IX v3.1b carry the eleven changes introduced at v1.1b. Neither carries the E3 re-grading introduced here. Both should be assumed to repeat the superseded account of the patent position, including the two wrong patent numbers, until they are checked.

The Numbers Explained is still at v1.1a and carries neither set of changes.

Where any companion disagrees with this paper on Durst's barriers, on aggregation, on the unit of account, or on the occupancy of E3, this paper is correct and the companion is stale.

---

*End of paper. Version 1.1c, August 2026. CC-BY 4.0.*
*Versions 1.0, 1.1a and 1.1b remain available and are not withdrawn. Published under the same concept identifier.*
