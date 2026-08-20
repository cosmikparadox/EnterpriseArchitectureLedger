# The Architecture Ledger
## The Canonical Thesis, v2.1c

**Abhineet Asthana. August 2026. CC-BY 4.0.**
**Independent research conducted in a personal capacity. Vendor-neutral.**

---

## How to read this document

This is the complete canonical reference. It supersedes v2.1b and every earlier version, and it is standalone: nothing outside it is required to understand the framework.

**Name change at v2.1.** Earlier versions carried the title *Enterprise Architecture Economics* and described a "standing discipline". Both overclaimed. "Economics" names a discipline and no discipline exists. The title is now *The Architecture Ledger* and the thing proposed is a **standing measurement practice**. Research paper v1.0 was deposited under the old title; v1.1 carries the new one under the same concept identifier.

**What changed at v2.1b.** Durst (2007) has been read at source rather than through a model-assisted summary, and the v2.1a account of him was wrong in a way that had already been published: he states **six** barriers to direct valuation, not three, and the section numbers cited were incorrect. Reading also returned two findings that were not sought and that both help. Separately, four weaknesses that no previous version addressed are now stated: the ledger cannot be totalled, the unit of account is declared rather than mined, the graph moves under the measurement, and the coefficient is exposed to Goodhart's law. Full record at 15.7.

**What changed at v2.1c.** One thing, and it costs the framework an element.

Element E3 has been carried since v1.0 as partially occupied and patent-encircled, on the basis of a family described from a summary rather than read. The claims of four members have now been read directly, and the specification of the earliest, US 10,257,219, has been read in full. **The family occupies E3 rather than constraining it.** It builds a discovered dependency graph, propagates a seeded disruption through it by Monte Carlo with a conditional compromise probability on each edge, assesses monetary loss at each node, aggregates across assets, entities and portfolios, and reports a **loss exceedance curve denominated in US dollars**. Priority runs from March 2018. E3 is re-graded **OCCUPIED**. R15 logged.

Two consequences follow. The sentence supporting the integration finding at 5.10, that risk vendors scope from asset inventories rather than a mined graph, is false and is removed. R16 logged. And the aggregation limit at 6.10 now has two prior-art precedents rather than one, the second being a granted claim to aggregating losses in a nonlinear sum.

Separately, US 12,380,090 and US 11,356,469, withdrawn at v2.1 as unverifiable, have been read at source. Both are granted. Neither is in the family and neither is relevant. They are corrected rather than left withdrawn. Full record at 15.8.

Six conventions.

**Evidence is graded at every load-bearing claim.** *Strong* means primary documentation, patent claim text, or peer-reviewed publication. *Indicative* means vendor marketing, trade reporting, or reasoning from absence. *Asserted* means claimed without corroboration, including by this author.

**Retirements are logged, never silently edited.** Section 15 carries the full record across all versions. A claim that dies stays visible.

**Nothing here is invented.** Every method is borrowed and named, with its owner and its failure conditions. The contribution is assembly.

**Unexamined is not unoccupied.** Where a search has not been performed, that is recorded as exposure rather than treated as absence.

**Cited is not read.** New at v2.1. A source in the reference list has not been checked for every claim it might bear on. The v2.0 error described at 15.5 was a claim of novelty contradicted by two books already cited in the same document for other purposes. The v2.1c error at 15.8 was worse in the same way: a patent cited by number since v1.0, never opened.

**Summarised is not read.** New at v2.1b. A model-assisted read of a source is a search aid, not a reading. Everything it returns about a source is a claim requiring verification, including counts, section numbers and ordering, not only quotations. Extended at v2.1c to a seventh caution: a research process that grades its own findings Strong is making an unverified claim about its own reading.

**Companion documents:**

```
Research paper                v1.1c   formal publication
Part IX, the mathematics      v3.1b   formal specification
The Numbers Explained         v1.1a   zero-to-100, no maths required
```

**Note at v2.1c.** This document and research paper v1.1c now carry the E3 re-grading. Part IX v3.1b carries the eleven v1.1b changes but not the E3 re-grading, and should be assumed to repeat the superseded patent account including the two wrong numbers until it is checked. The Numbers Explained is at v1.1a and carries neither change set. Where any companion disagrees with this document, this document is correct. **The set does not match and must not be circulated as a set.**

---

## 1. The thesis in one paragraph

In the consumption era an enterprise rents its infrastructure but continues to own its architectural arrangement: the specific configuration of dependencies through which business work is executed. That arrangement is organizational capital. It determines the machine resource consumed per unit of business work, it concentrates operational risk, and it forecloses or preserves future options. It is economically real, continuously billing, and absent from the enterprise measurement regime. The Architecture Ledger proposes a standing measurement practice that treats the mined dependency graph as a ledger, pinning three distributional quantities to each use case within a named business subdomain: metered cost expressed as a coefficient, monetary risk expressed as loss distributions, and a flexibility term expressing the option component of the cost of changing a committed arrangement. The contribution is integration, not invention, and at v2.1 it is a proposal awaiting test rather than an established contribution. At v2.1b one further limit is stated in the thesis itself rather than buried: the entries do not add up, so this is a measurement practice and not a management system. At v2.1c a second is added: two of the three axes are occupied by others, so the practice is a different substrate and a different unit of account carrying methods that already exist.

---

## 2. The problem statement

### 2.1 What changed

The last fifteen years have been described as a shift from owning to renting, from capital expenditure to operating expenditure. That description is accurate and it is half the story.

When infrastructure ceased to be an owned asset, something else became one. The enterprise does not own the database engine; it owns the decision to place it at the centre of forty downstream systems. It does not own the network; it owns the topology wired across it. It does not own storage; it owns the choice to let one dataset become the authority everything reads from.

The asymmetry is the point. **An enterprise owns almost none of the components and nearly all of the consequential decisions about how they fit.**

### 2.2 The precision the claim requires

A loose version of this thesis says architecture drives cost. That is wrong and invites correct rejection.

```
Cost = business volume x architectural coefficient x unit price
              |                    |                     |
        business owns      architecture owns        vendor owns
```

**The canonical claim is therefore: architecture is a continuously billing determinant of unit cost, not of cost level.**

This precision does three things. It explains why the practice meters rather than sizes, since the coefficient is observable but not knowable in advance. It preserves the accountability separation in which business owns roadmaps and volume while architecture answers for conversion efficiency. And it makes the claim survivable in front of a finance function, because architecture is being held to something it controls.

**Grade corrected at v2.1: [Asserted, pending H1].** v2.0 graded this Strong. That was wrong, and the reason is structural rather than evidential. The decomposition is an accounting identity. The coefficient is defined as the residual once volume and unit price are removed, so it necessarily absorbs workload mix, vendor-side performance changes, tenancy effects and measurement error alongside anything architecture does. The identity establishes only that the coefficient is not volume and not list price. Attributing the residual to architecture is an empirical claim, it is what H1 tests, and it has not been tested. A definition cannot be graded Strong.

**A second problem with the coefficient, added at v2.1b.** Even granting the attribution, a contemporaneous coefficient reading may not carry the signal it is assumed to carry. Architectural effects arrive with delay, which Durst recorded as a barrier in 2007 and which this framework does not answer. H10 tests whether coefficient movement follows architectural change at any lag the practice can observe. If it does not, the practice is measuring noise. See 5.12 and 10.

### 2.3 Why metering made this visible

Under core-based or capacity licensing, architecture drove cost more directly, because a sizing exercise converted arrangement into a purchase order. Yet the signature was invisible, because one upfront capacity decision absorbed all subsequent drift into slack. Architecture could degrade substantially without the bill moving.

**Metering did not increase architecture's economic significance. It removed the slack that concealed it. [Strong.]** The bill is now a continuous instrument reading and it is discarded.

**Independent support recorded at v2.1b.** This is no longer only this framework's assertion. Durst (2007, section 6.5.4) records data acquisition as one of six barriers to valuing architecture, on the grounds that enterprises rarely operate enterprise-wide reporting for IT and that few or no metrics exist for the architecture itself. Metered billing, distributed tracing and OpenTelemetry are exactly that missing reporting layer. **The framework is possible now and was not possible in 2007, and the reason is instrumentation rather than insight.** That is a claim about timing, not about contribution, and it must not be presented as the latter. **[Strong on substance, from a source read.]**

**A qualification added at v2.1c.** The timing argument is weaker than it looks, because somebody else acted on the same instrumentation earlier. The BitSight family's priority date is March 2018 and its specification identifies assets and dependencies from observed network traffic, DNS records, server banners and software versions. The window between the instrumentation becoming available and someone monetising risk over a discovered graph was not eight years. It was closed by 2018. See 5.4.

### 2.4 The anomaly

Executives require that every material asset and every material cost-and-risk driver be measured and financially justified: plant, inventory, headcount, brand, working capital. **[Strong.]**

Architecture satisfies the criteria that regime applies. It is a determinant of unit cost **[Asserted, pending H1]**, a material risk concentrator **[Strong]**, and for a digital enterprise a material value driver **[Indicative; digital-core evidence is directional and largely self-reported]**.

It sits outside the regime. Where governed at all, it is governed qualitatively through heat maps, maturity models and colour-coded registers: the precise condition FAIR was created to end.

### 2.5 Why the question stays unasked

The orphaned-question hypothesis. The question falls between functions. Finance lacks the structural model. Architecture lacks the monetary apparatus. FinOps owns the meter but not the graph. Risk owns the loss model but scopes from asset inventories rather than dependency. Each function can see part of the object and none owns it. **[Indicative.]**

**A competing explanation, promoted at v2.1b.** The question may also stay unasked because a competent researcher asked it, enumerated six reasons why it could not be answered directly, and went indirect. Durst 2007 is that researcher. The orphaned-question hypothesis and the it-was-tried-and-found-hard hypothesis are not mutually exclusive, and this framework should not lean on the first while a documented instance of the second sits in its own reference list. See 5.12.

**A third explanation, and the hypothesis narrows again at v2.1c.** The clause above about risk scoping from asset inventories rather than dependency is not true of every occupant. One of them built exactly the dependency-scoped monetary risk model this framework describes, patented it, and shipped it into the insurance and portfolio market rather than into the enterprise architecture conversation. The question was not orphaned on the risk axis. It was answered, for a different buyer. What remains genuinely orphaned is the join to unit cost and to flexibility. **[Strong that the model exists; Indicative that the buyer explains the absence.]**

### 2.6 The honest alternatives

**It has been tried and it failed.** Enterprise architecture has attempted quantification for three decades and the attempts are largely remembered as assessments that died with the engagement. **[Strong.]** Addressed at section 14.

**It is not worth the cost.** The measurement may cost more than the decisions it improves. Unresolved; the demonstration establishes computability, not economic return.

**Directionality suffices.** A significant practitioner position holds that order-of-magnitude judgement is enough and that quantification adds false precision. This is a live and serious objection, not a straw man.

**It produces no total.** Added at v2.1b. An executive who asks for the portfolio position cannot be given one, for the reasons at 6.10. An organisation that requires a single exposure or valuation figure should not adopt this practice, and that is a legitimate judgement rather than a failure to understand it.

**Somebody already does two thirds of it.** Added at v2.1c. The graph is commodity open infrastructure and the monetary risk model over it is granted patent. A reader entitled to ask what is left will find one untested decomposition and one declared unit of account. See section 8.

---

## 3. The core reframe: architecture as organizational capital

### 3.1 The asset class already has a name

Organizational capital is an established category in economics: the accumulated, firm-specific, non-tradeable arrangements that make a firm productive beyond the sum of its inputs. Architecture is organizational capital that happens to bill monthly. **[Indicative.]**

### 3.2 Boundaries as the unifying object

```
Cost pools accumulate at badly placed boundaries
Risk propagates when boundaries fail
Option value is the ability to cut at a boundary
Lock-in is a boundary that is expensive to cut
Modularity is a boundary that is cheap to cut
```

**Logged correction.** Modularity is not the existence of alternate paths through the graph. That is redundancy. Modularity is the cost of cutting. Application programming interfaces are best understood here as contracts that manufacture cut-ability.

**Clarified at v2.1.** The three axes are not three independent additive quantities. Cost and risk are separately measured. Flexibility is not a fourth quantity added on top of the cost of change; it is a component inside it, separated out. See 6.5.

**Extended at v2.1b.** The axes share a denomination and do not share an arithmetic. All three are expressed in currency against the same unit, which makes them comparable. Currency is a common denomination, not a licence to add, and 6.10 states what that forbids.

**Who draws the boundaries, stated at v2.1b.** The boundaries in the list above are of two kinds and previous versions did not distinguish them. Dependency boundaries are mined from telemetry. Subdomain boundaries are drawn by hand. The second kind determines where the first kind is cut for measurement purposes. See 6.1.

### 3.3 The blueprint parallel, done honestly

A building's blueprint is not the building. The parallel is useful for explaining that arrangement is distinct from components, and it breaks in one important place: a blueprint is static and an architecture is continuously executing and continuously billing. Use it to open a conversation and abandon it before it does analytical work.

### 3.4 On the word "ledger"

Recorded at v2.1 so that it is not discovered by a hostile reader first. In accounting, a ledger has double entry, it balances and it reconciles. This has none of those properties. It is a register: a per-unit record of three quantities with no balancing relation between them. The word is retained because the connotation of a standing, per-unit, continuously maintained record is correct and useful. The imprecision is acknowledged rather than defended.

**Sharpened at v2.1b.** The imprecision is larger than v2.1 admitted. A ledger also totals, and this one cannot, for three independent reasons set out at 6.10. A hostile reader who notices that a thing called a ledger produces no balance has found a real defect and not a naming quibble. The word is still retained, for the reason above, and the defect is now stated in the same breath as the name.

---

## 4. Scope: what this is and is not

```
+---------------------------------+---------------------------------+
| IT IS                           | IT IS NOT                       |
+---------------------------------+---------------------------------+
| A measurement practice          | A discipline                    |
| A standing function             | A one-off assessment            |
| Vendor-neutral method           | A product                       |
| An integration of borrowed      | An invention                    |
|   methods                       |                                 |
| A translation layer to finance  | A replacement for architecture  |
|                                 |   judgement                     |
| Retrospective and current-state | A roadmap owner                 |
| A proposal awaiting test        | A validated contribution        |
| A hybrid: mined graph,          | A pure telemetry-derived        |
|   declared unit [v2.1b]         |   practice [v2.1b]              |
| Per-unit measurement            | A management system with a      |
|   [v2.1b]                       |   portfolio roll-up [v2.1b]     |
| A different substrate and unit  | An originator of the cost or    |
|   carrying existing methods     |   the risk method               |
|   [v2.1c]                       |   [v2.1c]                       |
+---------------------------------+---------------------------------+
```

**Scope conditions.** The framework requires metered consumption at a granularity finer than the application, telemetry sufficient to mine the graph, and an agreed decomposition into business subdomains.

**A fourth condition added at v2.1b, attached to the third.** The subdomain decomposition must be **pre-existing and independently owned**. It must not be constructed for the measurement, and it must not be revised by the party performing the measurement. Where the same party draws the boundaries and computes the figures, that party is choosing where cost pools are cut, where risk propagation is bounded and where option value is located, which is to say choosing the answer. This is a governance condition rather than a technical one, and it follows directly from the admission at 6.1 that the unit of account is declared. **[Asserted, reasoned.]**

**Stated plainly at v2.1:** those three conditions together select for cloud-native, observability-mature estates with an existing domain decomposition. A large share of real enterprise estates are partly legacy, partly on-premise, or un-instrumented at the granularity required. The addressable population is a well-instrumented minority, not the enterprise population at large. No measured figure for that share is claimed. **[Asserted, reasoned.]**

**And a consequence for H1, noted at v2.1b.** That minority is not a random sample. Estates satisfying all four conditions are well instrumented, and well-instrumented estates are on any reasonable prior better run. The population in which the coefficient is measurable is plausibly the population in which its variance is smallest. See 10.3.

---

## 5. The honest lineage: prior art and occupancy

This section is the longest in the document. The contribution is integration, so the location of every element in existing work is load-bearing.

**Method failure recorded at v2.1.** The v2.0 sweep searched commercial products and enterprise architecture literature thoroughly and searched the canonical finance literature inadequately. The E4 error at 5.5 was not a failure to find an obscure source. It was a failure to check a claim of novelty against two texts already cited elsewhere in this document. Where an element is claimed as open, the primary texts of the discipline it borrows from must be read **for that specific claim**.

**A second method failure recorded at v2.1b.** The v2.1a assessment of Durst was produced by a model reading the source and reporting back. Its verdict survived checking. Its barrier count, section numbers and one quotation did not. The quotation was caught at v2.1a because quotations were already treated as claims. The count and section numbers were not caught, because they did not look like quotations, and they were published. **A model-assisted read makes structural claims about a source, and those need checking exactly like quoted wording.**

**A third method failure recorded at v2.1c, and it is the same failure applied to a different document class.** The BitSight family had been cited by number since v1.0 and described in prose in every version. The description was accurate as far as it went and it went only as far as the summary that produced it. Nobody opened the patent. When the claims and the specification were finally read, the element moved from partially occupied to occupied and two of the cited numbers turned out to belong to unrelated patents.

Two rules follow. **A patent cited by number is a source, and the same standard applies to it as to a book: cited is not read.** And **a research process that returns findings graded Strong is grading its own reading**, which is not a grade at all. The patent verification here was first delegated to an automated research pass that graded itself Strong; the substance survived direct reading and the grade had not been earned when it was given. Any finding arriving through a proxy is **Indicative** until the primary record is opened, whatever the proxy said about itself.

### 5.1 The seven elements

```
E1  Mined dependency graph used as a ledger
E2  Metered cost per use case per business subdomain
E3  Monetary risk distributions propagated across the graph
E4  Real-options flexibility, inverted sign
E5  Telemetry-derived volatility as a valuation input
E6  Priced epistemic decay
E7  Standing measurement practice with an operating model
```

### 5.2 E1: the mined graph. OCCUPIED.

Agentless discovery and application dependency mapping is a mature commercial category.

```
+---------------------+-----------------------------------------+
| OCCUPANT            | WHAT IT DOES                            |
+---------------------+-----------------------------------------+
| Mugato              | Agentless discovery, service dependency |
|                     | mapping, clusters services into         |
|                     | business services, attaches monthly     |
|                     | cost. Explicitly bridges observability  |
|                     | and enterprise architecture.            |
| Faddom, Device42,   | Agentless discovery and dependency      |
| ScienceLogic,       | mapping                                 |
| Virtana             |                                         |
| ServiceNow          | Discovery, Service Mapping, CSDM        |
| BMC Discovery       | ADDM                                    |
| Dynatrace           | Smartscape topology, Davis              |
| Datadog             | Service Map plus Cloud Cost Management  |
| Wiz                 | Security Graph, blast-radius reasoning  |
| Ardoq, SAP LeanIX   | EA repositories moving to ingested      |
|                     | rather than drawn models                |
| foreseeti/securiCAD | Architecture-model attack simulation,   |
| (acquired by Google | probability and time-to-compromise      |
| 2022)               | rather than currency                    |
| BitSight [v2.1c]    | Discovers assets, entities and          |
|                     | dependencies from network traffic, DNS  |
|                     | records, server banners, software       |
|                     | versions and inter-business payment     |
|                     | data. Outside-in, not internal call     |
|                     | structure. See 5.4.                     |
| OpenTelemetry       | Service graph connector builds a        |
| Collector [v2.1]    | service dependency graph directly from  |
|                     | trace data. Derived from Grafana Tempo. |
|                     | Open infrastructure, no vendor needed.  |
+---------------------+-----------------------------------------+
```

**[Strong.]** This element is not a differentiator and must never be presented as one. The v2.1 addition matters: the substrate is now commodity and free, which removes an adoption barrier and definitively closes any residual claim here.

**Note on Mugato specifically.** Its marketing claims 52 patents; the Danish-language predecessor site breaks this down as the aggregate of individual team members' lifetime career patents from prior employers, not product IP. No Mugato-assigned patent was located. A related claim regarding the origin of the Excel pivot table is false; the pivot table originates with Pito Salas at Lotus. **[Strong.]** Mugato is best understood as a potential data source rather than a competitor, since it does nothing on E3 through E6.

### 5.3 E2: metered cost per unit of business work. PARTIALLY OCCUPIED.

The FinOps Foundation defines Unit Economics as a named capability with a working group and published guidance, covering cost per transaction, per customer, per case resolved, per service request, per workload, per GB stored and per token. Its own documentation states that unit costs expose underutilised services and prompt architecture changes, and that rising costs are not always negative if proportionally more value is delivered. **[Strong.]**

That second sentence is, almost verbatim, the conversation this framework proposes as its selling point. It is published FinOps marketing.

```
+---------------------+-----------------------------------------+
| OCCUPANT            | UNIT OF DENOMINATION                    |
+---------------------+-----------------------------------------+
| CloudZero           | Cost per transaction, customer, feature |
|                     | from metered billing; allocates without |
|                     | requiring tags                          |
| Celonis             | Process cost per instance, object-      |
|                     | centric process mining, positions as    |
|                     | digital twin of operations              |
| Apptio Cloudability,| Cost per business unit, product, team   |
| Vantage, Finout,    |                                         |
| Amnic, Kubecost     |                                         |
| vFunction           | Dollarised technical debt               |
| Activity-based      | The common ancestor, 1980s              |
| costing             |                                         |
+---------------------+-----------------------------------------+
```

**The residual, stated narrowly.** Conventional unit economics allocates by **tags**, which describe ownership. This framework allocates against an **observed dependency graph**, which describes causation. A cost increase caused by a refactor inside a transitively invoked service appears in the second and not the first, because no tag in the estate contains that fact.

**Narrowed further at v2.1, two ways.**

First, Apptio (now IBM) holds US 8,766,981, "System and method for visualizing trace of costs across a graph of financial allocation rules." That patent traces cost across a graph. It is a graph of **declared allocation rules** rather than a mined dependency graph, so the causal-versus-declared distinction survives, but it is materially closer than v2.0's tag-versus-graph framing admitted. **[Strong that it exists; Indicative on closeness.]**

Second, with trace-derived service graphs now commodity (5.2), combining one with an existing cloud cost product is an integration step, not a research step. Datadog holds both halves today.

**Read the E2 residual as unoccupied now and one product release from occupied. [Indicative.]**

**Narrowed a third way at v2.1b.** The causal-versus-declared distinction is real at the level of the dependency graph and is not clean at the level of the unit. The subdomain within which the graph is cut is declared, exactly as an allocation rule is declared. The framework's substrate is more causal than a tag hierarchy. Its unit of account is not. See 6.1.

**Its importance rises at v2.1c.** With E3 occupied, E2 and the flexibility axis are what the framework has. The E2 residual was already described above as narrow, fragile and one product release from occupied. That description now has to carry a share of the whole position rather than being one qualification among several.

### 5.4 E3: monetary risk on the graph. OCCUPIED. Re-graded at v2.1c.

```
+---------------------+-----------------------------------------+
| OCCUPANT            | WHAT IT PRODUCES                        |
+---------------------+-----------------------------------------+
| BitSight            | THE OCCUPANT. Discovered dependency     |
| "Correlated risk in | graph, seeded Monte Carlo propagation,  |
| cybersecurity"      | per-node monetary loss, aggregation     |
| family, 5 grants,   | across assets, entities and portfolios, |
| priority Mar 2018   | DOLLAR-DENOMINATED LOSS EXCEEDANCE      |
|                     | CURVE. Claims and specification read at |
|                     | source at v2.1c. See below.             |
| Safe Security       | FAIR-aligned monetary loss; acquired    |
| (SAFE One)          | RiskLens                                |
| Kovrr               | Monte Carlo loss exceedance curves      |
| Axio, X-Analytics,  | Monetary cyber risk                     |
| CyberSaint          |                                         |
| CyberCube,          | Cyber-catastrophe insurance models      |
| Moody's RMS         |                                         |
| Open Group FAIR     | The decomposition standard              |
| KTH school          | P2AMF, extended influence diagrams,     |
| (Johnson,           | fault-tree EA availability. Native      |
| Lagerstrom,         | output is probability and time-to-      |
| Ekstedt)            | compromise, not currency                |
| Ekstedt et al. 2023 | Yacraf: explicitly FAIR-derived,        |
| (Yacraf)            | monetary, the group's clearest money    |
|                     | treatment                               |
+---------------------+-----------------------------------------+
```

**[Strong.]**

**The re-grading, and why it is not a citation repair.** Every version from v1.0 to v2.1b described the BitSight family from a summary and recorded it as a **constraint** on E3: something to cite and to obtain a freedom-to-operate opinion against, but not something that had done the thing. That was wrong, and the error was one of not looking rather than of reasoning.

The chain is confirmed from the face of the later records.

```
15/918,286  ->  US 10,257,219    granted  9 Apr 2019
16/292,956  ->  US 10,594,723    granted 17 Mar 2020
16/795,056  ->  US 10,931,705    granted 23 Feb 2021
17/179,630  ->  US 11,770,401
18/365,384  ->  US 12,273,367
```

Read at claim level:

```
INDEPENDENT CLAIMS COVER
  generating a dependency graph over assets,
    dependencies and entities
  executing Monte Carlo simulations over that graph
  generating a seed event drawn from a probability
    distribution
  propagating disruption through the graph
  assessing loss for each asset
  aggregating losses across assets, across entities
    and across portfolios

DEPENDENT CLAIMS COVER
  aggregating losses in a NONLINEAR SUM
  weighting each asset by its importance to the
    entity that owns it
  terminating simulation when statistical variance
    falls below a threshold
  a CONDITIONAL PROBABILITY ON EACH EDGE that the
    receiving node is compromised given that the
    providing node is compromised
```

**[Strong, from claim text read directly.]**

Read at specification level, which no previous version had done, and which is where the decisive fact sits. The specification describes a **loss exceedance curve expressed as a function of loss in US dollars**, produced from the simulation results, and describes using it to judge whether the rate of losses exceeding a stated monetary threshold falls within an acceptable exceedance rate. It names mean expected loss and loss exceedance curves as the reported statistics. It identifies assets and dependencies by observation of network traffic, DNS records, server banners, software versions and inter-business payment data, rather than by declaration. **[Strong, from specification text read directly.]**

**The consequence.** The combination of a discovered dependency graph, probabilistic propagation over it, monetary loss assessed per node, and a dollar-denominated loss exceedance curve is not adjacent to E3. It is E3, granted, with a March 2018 priority date. **No novelty may be claimed for graph-propagated monetary risk in any form.** R15 logged.

**What is outside the family, stated narrowly. None of it is a claim to the risk axis.**

```
GRAPH KIND     Theirs is OUTSIDE-IN: IP addresses, domain
               names, server systems as assets; hosting
               providers and software versions as
               dependencies; assembled from externally
               observable signals. A map of third-party and
               infrastructure exposure.
               Ours is INTERNAL: service-to-service call
               structure from distributed tracing, resolved
               to the subgraph a named business use case
               exercises.

UNIT           Theirs assesses loss PER ASSET, weighted by
               importance to the owning entity.
               Ours is a use case within a named business
               subdomain, with cost expressed as a
               coefficient of business volume.

MISSING AXES   The family has no cost axis, no unit of
               business work, and no flexibility axis.
```

**The honest statement.** The risk axis of this framework is occupied. What the framework does at E3 is run an occupied method over a different substrate for a different unit of account. That is an integration position, not a residual, and it must be described that way.

**The two corrected citations.** US 12,380,090 and US 11,356,469 were cited at v1.0 as members of this family, withdrawn at v2.1 as unconfirmable, and read at source at v2.1c.

```
US 12,380,090  "Managing data risk using automated
               dependency discovery". Claim 1 read.
               Dependency graph built from read and write
               logs; output is a level of risk derived
               from a rating of concern and an indication
               of concern. NO monetary quantity and NO
               distribution in the claims. Subject is
               DATASET CORRUPTION, not cyber loss.
               Reported assignee Google LLC. [Indicative:
               read from a secondary index, not the
               patent front page.]

US 11,356,469  "Method and apparatus for estimating
               monetary impact of cyber attacks". Claim 1
               read. Data pools, correlation engine,
               monetary impact calculation. NO graph. NO
               distribution.
               Reported assignee Barracuda Networks.
               [Indicative, same caution.]
```

Neither is relevant to this framework and neither should be cited against it. The duplicate appearance of 11,356,469 in the v1.0 source list was a wrong citation copied twice, not a transposed digit. **[Strong on claim scope and on non-membership.]**

Independent non-BitSight prior art also exists in this space, including a probabilistic cyber risk forecasting application propagating loss distributions through a network by Monte Carlo. **[Indicative.]**

**A formal freedom-to-operate opinion has not been obtained and is required before any patent filing.** For publication the constraint is lower, but the family must now be cited as the occupant rather than as an encirclement.

**What is no longer claimed as thin.** Previous versions asserted that the specific combination of FAIR distributions propagated across a mined dependency graph is not a shipping commercial capability, and that CRQ vendors scope from asset inventories and control posture rather than from a discovered dependency graph. That assertion is retired. R16 logged. See 5.10.

### 5.5 E4: the inverted-sign option. OCCUPIED. Retired as open at v2.1.

**v2.0 assessed this as open commercially and made it the framework's headline. That assessment does not survive contact with the primary real options literature and is retired here in full.**

Dixit and Pindyck (1994) state directly that a firm making an irreversible investment exercises, or **kills**, its option to invest, and that the value of the option so destroyed belongs in the investment cost. That is the inverted sign, in the canonical text of the field this element borrows from. Kulatilaka and Trigeorgis (1994) already value the general option to switch under a switching cost, and already establish that switching cost breaks additivity of option values and produces hysteresis. In routine option valuation practice the value eroded by committing rather than waiting is carried explicitly as a dividend or convenience yield term. **[Strong.]**

The academic occupants named at v2.0 remain:

```
Baldwin and Clark      modularity as options
Sullivan et al. 2001   structure and value of modularity
Bahsoon and Emmerich   ArchOptions (2003, EDSER-5 at ICSE)
Taudes et al. 2000     MIS Quarterly, software platform options
Ullrich 2013           architecture flexibility valuation
Durst 2007             Wertorientiertes Management von
                       IT-Architekturen. Teubner, Wiesbaden.
                       READ AT SOURCE at v2.1b. Does NOT
                       occupy the integration, and explicitly
                       DECLINES the flexibility axis. See below.
```

**[Strong for the four named above.]**

**Durst, read at source at v2.1b.** Carried through v2.0 and v2.1 as the closest identified prior art and as an open exposure because it had not been read. Assessed by proxy at v2.1a. Sections 6.5, 6.7.3.9 and 6.7.6 have now been read directly.

```
UNIT OF ACCOUNT  Applications, business processes and
                 divisions. Cost and flexibility NOT on a
                 shared unit.
STRUCTURE        IT-Bebauungsplan and IT-Infrastruktur,
                 populated BY HAND from process
                 documentation and admin data entry.
                 Nothing propagates.
COST             Operational and procurement cost at
                 architecture-measure level, estimated from
                 benchmarks, experience values and average
                 per-project savings, extrapolated to an
                 annual figure. EX-ANTE PLANNING ESTIMATE
                 of a target architecture, not measurement
                 of a running estate. [v2.1b, at source]
RISK             Qualitative only. No monetary amount,
                 no distribution.
FLEXIBILITY      Section 6.7.3.9 "Strategische Optionen" is
                 a QUALITATIVE BENEFIT NARRATIVE: competitive
                 advantage, first-mover position, supplier
                 and customer collaboration, M&A integration.
                 No volatility, no valuation, no option
                 pricing of any kind. "Option" is used in
                 the strategic-management sense.
                 At 6.7.6.4 he states that quality and
                 FLEXIBILITY improvements are difficult to
                 calculate and monetise, and are therefore
                 carried as QUALITATIVE advantages.
                 HE DECLARES THIS AXIS OUT OF REACH RATHER
                 THAN OCCUPYING IT. [v2.1b, at source]
COMBINED?        No. Separate instruments.
NON-ADDITIVITY   At 6.7.6.5 he states that where two
                 measures overlap in effect their value
                 contributions cannot simply be added, and
                 proposes cross-settlement. PRIOR ART for
                 the aggregation limit at 6.10.
                 [v2.1b, at source]
```

**Verdict: Durst does not occupy the integration, and the flexibility finding strengthens rather than merely confirms that verdict.** He remains the nearest prior art *in intent*, since he is explicitly attempting value-oriented management of IT architecture, and he stays off the kill list at section 12.

**Grade at v2.1b: [Strong on substance. Indicative on wording.]** The available copy is a scanned volume with no text layer, and all findings were obtained by optical character recognition using a German-language model. That establishes structure and substance reliably and wording unreliably. **Nothing is quoted from it.** A quotation on book page 98, which Durst attributes to The Open Group, would make a good epigraph for this work and is deliberately not reproduced, because it would have to be checked against The Open Group source directly rather than against Durst and rather than against a character-recognition pass.

**And he supplies a standing objection, which matters more than the clearance.** That objection is now answered barrier by barrier at 5.12, including two admissions of failure.

**What remains at E4.** Not the idea and not the sign. Only the route to the inputs: computing the two switching-cost settings from a mined graph and metered telemetry rather than from expert declaration. That is an instrumentation claim of the same class as the E2 residual, it is weaker than the E2 residual because the two settings still require a declared counterfactual, and it is graded no higher than **[Indicative]**.

### 5.6 E5: telemetry-derived volatility as a valuation input. OPEN on present evidence.

Cost and usage volatility is charted by numerous FinOps tools. Volatility as an input to option valuation is standard finance. The join is not identified in either literature and no prior occupant was found on re-audit. **[Indicative.]**

**Warning attached at v2.1.** This is now the only element open on present evidence, and that status rests on **absence of a found occupant**, which is the weakest form of evidence in this analysis. It is precisely the position E4 occupied before re-audit, and precisely the position E3 occupied before its patents were opened at v2.1c. It must not become the new headline by default.

A methodological caution also applies. Volatility estimated from cost or usage telemetry is a **physical-measure** estimate. The Datar-Mathews engine used here is built to accept physical-measure inputs, which is why the join is contemplable at all, but this must be stated rather than assumed. Substituting a risk-neutral valuation method while retaining a telemetry-derived sigma would mix measures and produce an uninterpretable number.

**One further limit, added at v2.1b.** Telemetry-derived volatility is estimated from history. Durst's forecasting barrier (6.5.5) is that architectural potential is unclear precisely because uses appear that nobody foresaw. A backward-looking volatility estimate answers that only under the assumption that tomorrow's surprises resemble yesterday's in dispersion if not in kind. That assumption is defensible and it is an assumption. See 5.12.

### 5.7 E6: priced epistemic decay. OPEN in peer-reviewed literature, commercially encroached.

No peer-reviewed work identified prices the divergence between documented and observed architecture as an uncertainty quantity.

**Encroachment confirmed and strengthened at v2.1.** Firefly ships a drift cost analysis feature that calculates the monthly cost of the infrastructure-as-code-defined state, determines the cost of the actual running configuration, and prices the difference, and separately supports predicting infrastructure costs before deployment. **[Strong, from product documentation.]**

The remaining distinction is that Firefly prices the **cost consequence** of drift, whereas this framework treats drift as **parameter uncertainty entering a loss distribution**, so its output is a change in the shape of a distribution, principally in the tail. The distinction is real and narrower than v2.0 implied.

**The conceptual ancestor** is model risk management: supervisory guidance on the consequences of acting on a model that no longer represents reality. Note that SR 11-7 (4 April 2011) was superseded on 17 April 2026 by SR 26-2 with parallel interagency issuances; cite the current letter. **[Strong.]**

**[Indicative. The claim must always be worded as unoccupied in peer-reviewed literature, never as unoccupied.]**

**What re-mining does not buy, stated at v2.1b.** Reducing drift reduces uncertainty about the **current** state of the graph. It says nothing about whether a past decision was good, because the framework holds no series of decisions matched to outcomes. Reducing epistemic uncertainty about the present is not learning. This is the unanswered part of Durst's temporal delay barrier and it is why H10 exists.

### 5.8 E7: standing measurement practice. PARTIALLY OCCUPIED.

FinOps and cyber risk quantification are both standing practices with published operating models, and the FinOps Foundation and TBM Council have published jointly. The integrated practice proposed here is not occupied. **[Strong.]**

### 5.9 Occupancy summary

```
+----+---------------------------+----------------------------+
| EL | VERDICT (v2.1c)           | PRINCIPAL OCCUPANTS        |
+----+---------------------------+----------------------------+
| E1 | OCCUPIED, now also        | ADM and observability      |
|    | commodity via OpenTelem.  | vendors, Mugato, Datadog   |
| E2 | PARTIALLY OCCUPIED,       | FinOps unit economics,     |
|    | residual narrow, fragile, | CloudZero, Celonis, ABC,   |
|    | and declared at the unit  | Apptio US 8,766,981        |
| E3 | OCCUPIED [RE-GRADED       | BitSight correlated-risk   |
|    | v2.1c from PARTIALLY      | family: 5 grants, priority |
|    | OCCUPIED]. Claims AND     | Mar 2018. Also FAIR, Safe, |
|    | specification read at     | Kovrr, KTH, Yacraf         |
|    | source. Dollar loss       |                            |
|    | exceedance curve over a   |                            |
|    | discovered graph.         |                            |
| E4 | OCCUPIED                  | Dixit & Pindyck 1994;      |
|    | RETIRED as open at v2.1.  | Kulatilaka & Trigeorgis;   |
|    | Durst DECLINES this axis  | Baldwin & Clark; Sullivan; |
|    | rather than occupying it  | Taudes                     |
| E5 | OPEN on present evidence  | None identified            |
|    | (weakest evidence type)   |                            |
| E6 | OPEN in peer-reviewed lit,| Firefly (shipped)          |
|    | commercially encroached   |                            |
| E7 | PARTIALLY OCCUPIED        | FinOps, TBM, CRQ           |
+----+---------------------------+----------------------------+
```

At v2.0 this table showed three open elements. It now shows one open on present evidence, one open only in peer-reviewed literature and already encroached, and five occupied or partially occupied. The count did not change at v2.1c. What changed is the composition: **three of the five are now fully occupied rather than two**, and the one that moved is one of the framework's three axes.

### 5.10 The integration finding

**No identified vendor or research group performs the full integration.** That finding survived re-audit and it survives v2.1c. **[Strong for the sweep performed.]**

**Its supporting argument does not survive intact, and that is corrected here.** Previous versions defended the finding by describing a siloed market: graph vendors do not monetise, cost vendors produce point estimates with no risk and no optionality, and risk vendors scope from inventories and scenarios rather than a mined graph. The third clause is false. At least one risk occupant scopes precisely from a discovered dependency graph and reports dollar-denominated loss distributions over it. R16 logged.

**The corrected statement:** graph vendors do not monetise; cost vendors produce point estimates with no risk and no optionality; and risk vendors, **including those working from a discovered graph**, address neither unit cost nor flexibility, and the graph they discover maps external infrastructure and vendor exposure rather than internal business work.

That is a narrower defence of the same finding, and it should be read as narrower.

**Whether integration clears the bar for a contribution is a fair question and the honest answer is that it does not yet.** The accepted standard in information systems and software engineering research for an integration contribution is a demonstrated emergent capability **plus validation**. This work offers one demonstration on a fictional composite, establishing computability and nothing further. Until H1 through H10 are tested against real estates, the integration claim is a proposal, not a result.

**A structural point added at v2.1b.** An integration is normally defended on the grounds that the whole does something the parts cannot. This one produces three commensurable quantities against one unit and then declines to combine them, per 6.10. That is a weaker form of integration than the word usually implies, and the defence has to be that commensurability and comparability are themselves useful, not that a new aggregate quantity has been created. No new aggregate quantity has been created.

**And a sharper version of the same point at v2.1c.** An integration of methods that all belong to other people, producing quantities that are then not combined, is defensible only if the unit of account and the substrate are themselves doing work. Those are now the two things carrying the framework, and neither has been tested. See section 8 and T-S.

### 5.11 Absorption risk

```
1. Datadog     Already holds the mined service graph AND
               Cloud Cost Management in one platform.
               Nearest to the whole thing.
2. BitSight    NEW AT v2.1c and arguably now first equal.
               Holds the discovered graph and the granted,
               shipped, dollar-denominated risk model over
               it. Needs only a cost axis. Currently sells
               to insurers and portfolio managers rather
               than to enterprise architecture, which is
               a go-to-market gap rather than a
               capability gap.
3. Google      Holds foreseeti (architecture-model attack
               simulation) and the Wiz Security Graph.
               Has the graph and a probabilistic engine.
4. Celonis     Computes process cost per instance and
               positions as a digital twin. Dark horse.
```

Secondary: CloudZero could acquire depth on E3; Safe or Kovrr could acquire depth on E2. SAP's Signavio and LeanIX pairing remains a watch item. Software engineering intelligence platforms (Jellyfish, Faros, DX, Swarmia) are a watch item on convergence from the delivery side.

**[Indicative.]** The gap between holding the components and shipping the integration is a roadmap decision, not a research programme.

### 5.12 Durst's six barriers: the standing objection, answered

**New at v2.1b.** Durst is not only the nearest prior art. He is the framework's most serious standing objection, because he examined this problem, enumerated why direct valuation of architecture is not achievable, and went indirect. A framework proposing direct measurement owes an answer to each barrier. This section gives one, graded, including two admissions of failure.

**Correction first.** Version 2.1a of this document stated that Durst identifies three barriers at sections 6.5.1 to 6.5.3, naming them distance from value creation, attribution and delayed effects. That is wrong on the count, wrong on the section numbers and wrong on the membership. Section 6.5 enumerates **six** barriers, listed on book page 98, and delayed effects is 6.5.6 rather than one of the first three. Two of the six were unknown to this framework entirely. **[Strong. Structure and enumeration read directly from source.]**

```
+-------+--------------------------+---------------------------------+
| SECT  | BARRIER                  | FRAMEWORK POSITION              |
+-------+--------------------------+---------------------------------+
| 6.5.1 | Distance from value      | ANSWERED. The unit of account   |
|       | creation                 | is a use case in a named        |
|       |                          | business subdomain and cost is  |
|       |                          | per unit of business volume, so |
|       |                          | the measurement sits on         |
|       |                          | business work rather than on an |
|       |                          | application inventory.          |
|       |                          | [Indicative until H1.]          |
+-------+--------------------------+---------------------------------+
| 6.5.2 | Measuring the value      | NOT ANSWERED. SIDESTEPPED.      |
|       | contribution itself      | The framework never computes a  |
|       |                          | net value contribution. It      |
|       |                          | reports three quantities and    |
|       |                          | refuses the aggregate. Same     |
|       |                          | admission as 6.10, seen from    |
|       |                          | the other side.                 |
+-------+--------------------------+---------------------------------+
| 6.5.3 | Holism and attribution   | PARTIALLY ANSWERED. The mined   |
|       |                          | graph settles TECHNICAL         |
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
|       |                          | four is answered. v2.1a treated |
|       |                          | this barrier as answerable      |
|       |                          | from existing material. It is   |
|       |                          | not.                            |
+-------+--------------------------+---------------------------------+
| 6.5.4 | Data acquisition         | ANSWERED, but not by this       |
|       |                          | framework. Metered billing,     |
|       |                          | distributed tracing and         |
|       |                          | OpenTelemetry are the           |
|       |                          | enterprise-wide reporting layer |
|       |                          | whose absence he recorded.      |
|       |                          | Credit belongs to               |
|       |                          | instrumentation, not insight.   |
|       |                          | And somebody acted on it in     |
|       |                          | 2018, not in 2026. [v2.1c]      |
+-------+--------------------------+---------------------------------+
| 6.5.5 | Forecasting problem      | PARTIALLY ANSWERED. His point   |
|       |                          | is that project potential is    |
|       |                          | unclear because further uses    |
|       |                          | appear later. That is           |
|       |                          | optionality by another name,    |
|       |                          | and pricing flexibility without |
|       |                          | forecasting the payoff is what  |
|       |                          | a real option is for. Limit:    |
|       |                          | telemetry volatility is         |
|       |                          | backward-looking. UNKNOWN TO    |
|       |                          | THIS FRAMEWORK BEFORE v2.1b.    |
+-------+--------------------------+---------------------------------+
| 6.5.6 | Temporal delay           | NOT ANSWERED. H10 tests it and  |
|       |                          | can return a kill.              |
+-------+--------------------------+---------------------------------+
```

Two of six answered, one of those by instrumentation rather than by this work, two partial, one sidestepped, one open.

**On 6.5.6, the barrier the framework cannot answer.** Every quantity in the ledger is measured contemporaneously. Cost is this month's bill. Risk is the current loss distribution. The option component is a point-in-time valuation. If architectural effects arrive over years, a monthly reading may be measuring noise around a slow signal, and the practice could not tell the difference from the inside. It interacts badly with the drift work: re-mining sharpens the picture of the present, and no picture of the present establishes whether last year's decision was right. H10 is the test.

**Why Durst's conclusion does not settle the matter, and why that is a weak defence.** He concluded that the value contribution of an architecture cannot simply be calculated in isolation and moved to an indirect route through metrics, qualitative impact networks and benchmark-based estimation of a target architecture. The response here is not that he was wrong. It is that one of his six barriers has been removed by instrumentation since 2007, and that this framework declines the object he was computing, a single value contribution, in favour of three quantities that are never summed. **That is a narrower ambition, not a solved problem.** A reader should treat the difference between 2007 and now as mostly a difference in available data.

---

## 6. The framework

### 6.1 The ledger and the unit of account

```
G = (N, E)                    federated dependency graph
u = (use case, business subdomain)
G_u subset of G               subgraph exercised by u
L(u) = { C(u), R(u), V(u) }   the ledger entry
```

The unit is **one use case within one named business subdomain**. Processing a product return, within returns and reverse logistics.

**Logged correction.** Earlier formulations used the architecture decision as the unit. A decision is not observable and therefore not meterable. A use case exercises a specific observable subgraph and can be watched.

**The unit is declared, not mined. Stated at v2.1b.** This is the sharpest single objection available against the framework and no previous version addressed it.

The stated differentiator is that allocation is causal, derived from observed structure, rather than declared. The graph is indeed mined. The unit sitting on it is not. A named business subdomain is a hand-built decomposition of the business, produced by people in a workshop, and it is the same class of artefact as the IT-Bebauungsplan this document criticises Durst for drawing by hand. **The practice is a hybrid: a mined structure with a declared unit of account laid over it.** Earlier versions implied a purity it does not have. R13 logged.

The partial defence, and it must be read as partial. The two artefacts differ in rate of change. A subdomain decomposition usually already exists, is owned outside the technology function, and is stable over years. A dependency structure changes weekly and is not reliably known to anyone. **Declaring the slow-moving thing and mining the fast-moving thing is a defensible division of labour**, and it puts the declaration where its owners can be held to it rather than burying it in a model. But it is a declaration, and the boundaries it draws determine where cost pools are cut, where risk propagation is bounded and where option value is located.

Two requirements follow. The subdomain decomposition becomes a **logged declared field** with a named owner, on the same footing as the counterfactual at 6.4, reported alongside every figure computed against it. And the fourth scope condition at section 4 forbids the measuring party from constructing or revising it.

**Its status rises at v2.1c.** With E3 occupied, the unit of account is no longer one qualification among many. It is one of the two things the framework has left, and it is the weaker documented of the two, because kill condition 8 records that no hypothesis currently tests whether it is doing the work. See section 8 and T-S.

**Limit stated at v2.1.** The unit is clean where the subgraph is exclusive to the use case. It is weakest at shared nodes. In the demonstration the payments service serves five use cases and its fixed-cost pool is divided by an admitted arbitrary equal split, which 6.2 forbids from informing an exit decision. The consequence is that the cost figure is least trustworthy for exactly the high-fan-in shared infrastructure where exit and consolidation decisions carry the most money. This is a real limit on decision-usefulness and no method in this framework resolves it. The variable pool, allocated by a metered causal driver, does not suffer this defect; the fixed pool does.

### 6.2 Three axes

**Cost.** Node cost split into fixed and variable pools, allocated on different bases. The variable pool by a causal driver justified per pool; request count is one candidate, not a default, since egress frequently dominates. Fixed allocation reported separately and never permitted to inform an exit decision, because arbitrary fixed allocation produces the classic death spiral. Allocated average cost and marginal cost kept explicitly distinct, which at v2.1b is also what makes marginal-only the sole supported basis for any cross-use-case cost aggregation (6.10).

**Risk.** FAIR structure with loss event frequency times loss magnitude, where secondary loss is the product of a conditional frequency and a magnitude rather than a flat addition. Frequency estimated by Poisson-gamma credibility. Propagated with common-cause conditioning. Aggregated with a tail-dependent copula. Ceilinged by explicit censoring rather than truncation.

*Note added at v2.1c: every structural feature named in that paragraph, other than the credibility estimator and the censoring rule, appears in granted claims held by another party (5.4). The methods are unaffected. The novelty position is.*

**Value.** Primary instrument is the marginal cost of the next use case, from metered billing against the graph. Secondary instrument, where the future use case does not yet exist, is the option component of switching cost.

**Preference order stated at v2.1.** The primary instrument is metered, requires no valuation model and inherits no contested foundation. Where marginal cost is computable, compute it and do not reach for the secondary instrument at all. v2.0 treated the secondary instrument as the headline; that ordering is reversed.

### 6.3 Distributions, never points

```
{ P10, P50, mean, P90, P99, method, seed,
  censoring rate, W(K) curve where the option
  component is reported, graph version [v2.1b],
  subdomain decomposition owner [v2.1b],
  assumption register reference }
```

The mean is included because 6.6 shows it moves under epistemic widening. The censoring rate is included because a binding ceiling silently destroys tail statistics. The W(K) curve is added at v2.1 for the reason at 6.4. The graph version and the decomposition owner are added at v2.1b for the reasons at T-N and 6.1.

### 6.4 The value axis

The option component is computed as **one** switching-option model evaluated at two switching-cost settings with the horizon held constant. Valued by Datar-Mathews simulation with **two discount rates**: the uncertain benefit at a risk-adjusted rate, the known switching cost at the risk-free rate, applied to each leg before the exercise decision.

Three qualifications. The method makes no tradeability claim, which suits a non-traded asset. That framing is contested, since real-world probabilities with risk-adjusted discounting do not coincide with no-arbitrage valuation (Borison 2005). And volatility is not eliminated; it lives in the dispersion of the simulated distribution.

**Hysteresis, promoted from caveat to refusal at v2.1.** With sunk switching costs the optimal policy has an inaction band (Dixit 1989), so value can be flat in switching cost over a range and then move sharply. v2.0 recorded this and reported the number anyway. That is insufficient: if the two evaluated settings straddle a band boundary, the difference is partly an artefact of where the points were placed. The value function must now be evaluated across the full plausible range, both reporting points shown on that curve, and the figure refused where the points straddle a discontinuity.

**The declared counterfactual is a mandatory logged field.** The option component is a comparison, and an undeclared comparison is the free parameter that produces whatever answer was wanted.

**And at v2.1b it acquires an adjudication rule.** A logged field that anyone may fill with anything is a disclosure, not a control. Two analysts declaring different counterfactuals produce different answers and nothing settles it.

```
ADJUDICATION RULE [NEW v2.1b]
  The counterfactual must be an option that was ACTUALLY
  ON THE TABLE at the time of the decision, and it must
  be EVIDENCED FROM THE DECISION RECORD: an architecture
  decision record, a vendor shortlist, a board paper, a
  rejected design proposal.

  A counterfactual constructed after the fact by the
  analyst does not qualify, however reasonable it looks,
  because a plausible alternative invented later can be
  selected to produce a desired magnitude.

  Where no such evidence exists, REFUSE the option
  component. Do not accept a reconstructed alternative.
```

This will bind more often than the previous condition did, particularly on older commitments where the decision record is thin. That is the intended effect. It also removes one of the three Goodhart levers at T-O.

### 6.5 Switching cost: decomposition, not addition

**Rewritten at v2.1. This resolves what v2.0 called the leading kill risk.**

v2.0 defined switching cost narrowly as the deterministic one-time execution cost of moving, anchored to the EU Data Act treatment of permitted cloud switching charges, and reported the forfeited option alongside it.

**That anchor is removed and must not be used.** It is a legal artefact rather than an economic definition, and the charge it pointed to is being eliminated: Data Act Article 29(1) provides that from 12 January 2027 providers of data processing services shall not impose any switching charges on the customer for the switching process. **[Strong, from the regulation text.]** Anchoring a durable valuation quantity to a charge legislated to zero is self-undermining.

The substantive problem was worse. Under the standard industrial-organisation definition (Klemperer 1995; Farrell and Klemperer 2007), switching costs are an aggregate already including learning costs, transaction costs, contractual and compatibility costs, and costs arising from uncertainty. The option value forgone is one of those components. Reporting it alongside a broad switching-cost figure and summing counts the same quantity twice.

**The replacement is a decomposition:**

```
broad switching cost = execution component + option component

  execution component   deterministic, one-time, engineering
                        estimate, independent of uncertainty
  option component      stochastic, horizon-dependent,
                        valuation estimate, depends on
                        volatility and horizon
```

The framework does not claim the option component exists, which is known, nor that it can be priced, which is known. It claims the two can be **separated and reported separately**, where the switching-cost literature treats the aggregate as undifferentiated and practitioner estimates report only the execution component.

The decision value of the separation is that the two move for different reasons. Execution cost responds to tooling, abstraction and migration automation. The option component responds to horizon, volatility and the value distribution of the foregone alternative. A programme that reduces execution cost while leaving the option component untouched has not bought the flexibility its business case claims.

```
OPERATIVE RULE
  The decomposition REPLACES a broad switching-cost
  estimate. It never supplements one.
  Never report: broad switching cost + option component.
```

**The fragility does not disappear; it changes shape.** See H6 at section 10.

**A note on Durst, added at v2.1b.** He does not occupy this and he does not contest it. At 6.7.6.4 he declares flexibility improvements not calculable and carries them qualitatively. The framework is attempting the thing he set aside. That is a legitimate position and it is not a strong one, because setting something aside for being hard is not the same as being wrong about it being hard. H6 remains the test.

**Its weight at v2.1c.** This is the only axis on which the framework asserts anything the prior art does not already do. E1 is commodity, E2 is one product release from occupied, E3 is granted to somebody else, E4 is canonical finance. If H6 returns a kill, what remains is a unit of account and an operating model, and 15.1 already retires the operating model as a differentiator. **H6 is no longer the leading kill risk among several. It is close to the whole test.**

### 6.6 Epistemic decay

Drift measured as Jaccard distance on edge sets, symmetric difference over union: bounded, symmetric, a proven metric (Levandowsky and Winter 1971; simpler proof Kosub 2019).

```
ln L | m ~ Normal(m, s^2),  m ~ Normal(m0, tau^2)
  -> ln L ~ Normal(m0, s^2 + tau^2)

Median unchanged by tau
Mean rises with tau
P99 rises with tau, faster
```

**Two corrections of opposite kind are recorded here.** Version 1.0 added a decay term to expected loss, asserting that a stale map makes incidents larger. Version 2.0 corrected this to variance widening with the mean held constant, which is **also false**: the conditional mean is convex in the parameter, so widening genuine parameter uncertainty raises the unconditional mean by Jensen's inequality. Klinker (1997) establishes this in loss reserving and notes the sign is paradigm-dependent.

The mapping from measured drift to parameter uncertainty must be **fitted** against periods where re-mining occurred and estimate movement was observed. Asserting a functional form is not permitted.

### 6.7 The volatility problem, stated honestly

```
+---------------------------+--------------------------------+
| ROUTE TO NON-TRADED       | STATUS                         |
| ASSET VOLATILITY          |                                |
+---------------------------+--------------------------------+
| Traded twin security      | Standard; a genuine twin       |
|                           | rarely exists for architecture |
| Sector equity volatility  | Available, crude               |
| Consolidated-volatility   | Widely used, criticised as     |
| simulation (MAD)          | circular (Borison 2005)        |
| Independently observed    | Best, rarely available         |
| value variance            |                                |
+---------------------------+--------------------------------+
```

**Honest position:** estimable with an explicit contestable proxy whose assumptions are disclosed. Absent one, it is an assumption with defensible provenance, not a tested finding, and must be labelled as such. The physical-measure caution at 5.6 applies, as does the backward-looking caution added there at v2.1b.

### 6.8 Method selection

```
+------------------------+----------------------------------+
| SUBGRAPH / SITUATION   | METHOD                           |
+------------------------+----------------------------------+
| Acyclic, monotone      | Fault tree with BDD, or          |
|                        | influence diagram                |
| Non-monotone (retries, | CTMC, stochastic Petri net,      |
| circuit breakers,      | dynamic fault tree.              |
| fallbacks)             | NOT a static fault tree.         |
| Cyclic, feedback over  | Dynamic Bayesian network         |
| time                   | (unrolled, acyclic per slice)    |
| Instantaneous mutual   | Not representable by DBN.        |
| dependence             | State-based methods required.    |
| Aggregation across     | Tail-dependent copula.           |
| correlated nodes       | Gaussian prohibited.             |
+------------------------+----------------------------------+

REMOVED: percolation. Asymptotic random-graph assumptions do
not hold on finite engineered estates. Removal confirmed
correct rather than over-cautious on re-audit at v2.1.
```

**The monotonicity precondition is load-bearing.** Fault trees require that a component failure cannot improve system outcome. A circuit breaker opening is a component failing that makes the system survive. Check which world the estate is in before choosing the tool; the mathematics produces a confident number either way.

**Prior-art note added at v2.1c.** Per-edge conditional compromise probability, seeded Monte Carlo propagation and termination on a variance threshold are all recited in granted claims (5.4). The selection logic above, which chooses a method by the topology and the monotonicity of the subgraph, is not. That distinction is thin and it is the accurate one.

### 6.9 Refusal conditions

```
Drift above threshold              re-mine before computing
Ceiling binds above ~1% of sims    tail statistics unusable
                                     (declared convention, not derived)
Non-monotone logic, static FT      no propagated number
Cost series rejects random walk    sigma unusable for valuation
No exposure measure                report unweighted, disclose
No declarable counterfactual       no option component
Counterfactual not evidenced       no option component [v2.1b]
  from the decision record
Reporting points straddle a        no option component [v2.1]
  discontinuity in W(K)
Marginal cost is computable        use 6.2 primary, not 6.4
  from metered data [v2.1]
Drift mapping never fitted         illustrative only
No causal driver for a cost pool   declare basis as arbitrary
Fixed-pool share at a shared node  may not inform an exit or
  [v2.1]                             consolidation decision
Total requested across use cases   NOT A SUPPORTED OUTPUT [v2.1b]
Comparison spans graph versions    state which of the two causes
  [v2.1b]                            is attributed, or refuse
Subdomain decomposition built or   refuse the engagement;
  revised by the measuring party     scope condition 4 [v2.1b]
```

**A recorded refusal is a valid ledger entry.**

### 6.10 Aggregation, and why the ledger cannot be totalled

**New at v2.1b. No previous version addressed this and it is the first thing an executive asks for.**

The ledger produces an entry per use case. It does not produce a portfolio position, and no arithmetic in this framework supports one. **A total across use cases is not a supported output.** R14 logged.

The reason differs by axis, and each reason is independently sufficient.

```
+-----------+------------------------------------------------+
| AXIS      | WHY IT DOES NOT ADD                            |
+-----------+------------------------------------------------+
| COST      | Use cases share nodes. Summing per-use-case    |
|           | allocations counts a shared node once per use  |
|           | case that touches it. And the fixed pool is    |
|           | split on a declared basis (6.1), so a total    |
|           | would be part measurement, part convention.    |
+-----------+------------------------------------------------+
| RISK      | Losses are correlated and the correlation sits |
|           | in the tail, which is the region reported.     |
|           | Adding per-use-case figures assumes            |
|           | comonotonicity or independence, and both are   |
|           | wrong in different directions. A joint         |
|           | position needs a tail-dependent copula fitted  |
|           | across use cases. That is a different          |
|           | computation, not a sum.                        |
+-----------+------------------------------------------------+
| OPTION    | Option values are not additive. Trigeorgis     |
| COMPONENT | (1993): real options interact and the value of |
|           | a collection is not the sum of the individual  |
|           | values. Kulatilaka and Trigeorgis (1994):      |
|           | switching cost itself breaks additivity.       |
|           | Summing option components is simply an error.  |
+-----------+------------------------------------------------+
```

**This limitation has prior art in two places and the framework does not claim to have noticed it first.**

**First, recorded at v2.1b.** Durst (2007, section 6.7.6.5) states that where the effects of two architecture measures overlap their value contributions cannot simply be added, and proposes cross-settlement between measures to prevent double counting. The problem was identified in this literature in 2007, with a partial mitigation this framework does not have. His treatment covers overlap on the cost and benefit axis and says nothing about option non-additivity or tail dependence, so the statement here is broader. It is not new. **[Strong on substance, from a source read.]**

**Second, added at v2.1c, and stronger because it is a granted claim rather than prose.** The BitSight family claims aggregating losses across two or more assets in a **nonlinear sum**, and separately claims aggregation at entity and at portfolio level. The specification notes that aggregated losses may be simple sums or may involve more complex loss models including thresholds and limits. Non-additivity of correlated loss was not merely known by 2018. It was claimed. **[Strong, from claim text read directly.]**

**Two distinctions survive, and both cut against the framework rather than for it.**

```
1  They assert a METHOD of aggregating.
   This framework asserts a REFUSAL.
   A claim to a nonlinear sum is a claim to an answer.

2  They reach a joint position by simulating the WHOLE
   GRAPH IN ONE MODEL, which produces the joint
   distribution directly and needs no copula at all.
   That is a cleaner solution than the one described
   here, and it is available to them precisely because
   they do not cut the graph into declared units first.
   THE FRAMEWORK'S AGGREGATION PROBLEM IS PARTLY
   SELF-INFLICTED BY ITS OWN UNIT OF ACCOUNT.
```

**What is legitimate instead of a total:**

```
Ranking               Order use cases on a SINGLE axis.
                      Ordering needs no additivity.
Pairwise comparison   Two use cases on one axis, with
                      distributions shown.
Per-axis aggregation, RISK: tail-dependent copula fitted
method named          for the purpose, reported as a
                      joint distribution, never a sum.
                      COST: marginal basis only, that is,
                      cost that would actually
                      disappear. Never allocated.
                      OPTION COMPONENT: no aggregation.
Movement over time    Single entry only, subject to the
                      graph-version discipline at T-N.
```

**What this costs, stated plainly.** A practice that cannot produce a portfolio figure cannot answer the question executive audiences ask most often. It can say which use cases are worst, on a named axis, by how much, with the uncertainty shown, and it can refuse the total. Some organisations will find that unusable, and that is a legitimate judgement.

**The honest framing, carried as a reading principle in Part IX:**

```
A measurement that cannot be aggregated is still a
measurement, but it is not a management system.
```

---

## 7. The operating model

The practice is standing, not project-based. Four functions.

**Mine.** Continuous discovery of the graph from traces, mesh and infrastructure-as-code. Drift measured every cycle. Every graph state is versioned, because at v2.1b every reported figure must carry the version it was computed against (T-N).

**Price.** Cost, risk and flexibility computed per use case per subdomain, as distributions, on a fixed cadence. Never totalled (6.10).

**Record.** Economic decision records capturing the counterfactual and its evidence in the decision record, the subdomain decomposition and its owner, the assumption register, the method, the seed, the graph version and the refusals.

**Contest.** A standing adversarial review that attempts to falsify the current figures, with retirements logged rather than edited.

The fourth function is the one that distinguishes this from an assessment. It is also, at v2.1, v2.1b and again at v2.1c, the function that produced the largest single corrections in the framework's history, which is the strongest available argument for it. See 15.5, 15.7 and 15.8.

**A limit on the fourth function, recorded at v2.1b and widened at v2.1c.** Contest catches what reasoning can catch. It did not catch a fabricated quotation, which required a source search. It did not catch a wrong barrier count, which required reading the source. And it did not catch an occupied element, which required reading a patent that had been sitting in the reference list since v1.0. **Adversarial review over a description of a source is review of the description.** Where a source is load-bearing, it has to be opened. Three of the framework's largest corrections were invisible to reasoning and visible immediately on reading.

---

## 8. What is genuinely left

Against the full absorption map, the honest inventory at v2.1c:

```
1. Telemetry-derived      OPEN on present evidence, and only
   volatility             on absence of a found occupant.
                          Weakest evidence type in this
                          document. Do not lead with it. It is
                          the position E4 held before it fell
                          and E3 held before its patents were
                          opened.

2. Priced epistemic       OPEN in peer-reviewed literature.
   decay                  Commercially encroached by Firefly.

3. The switching-cost     Not a new quantity. A separation of
   decomposition          an aggregate the literature treats
                          as undifferentiated. Untested.
                          H6 can kill it.

4. The unit of account    A use case within a named business
   [v2.1c]                subdomain, with all three axes
                          expressed against it. Declared, not
                          mined (6.1). No hypothesis currently
                          tests whether it is doing the work;
                          kill condition 8 records that gap.
```

**Plus the substrate:** an internal, telemetry-mined service graph resolved to business use cases, rather than an outside-in map of vendor and infrastructure exposure. That distinction is what separates the framework's risk axis from the granted family at 5.4, and it is a distinction of scope rather than of method.

The claim is integration and application. **Never invention.** And at v2.1, integration is a proposal awaiting test rather than a demonstrated contribution.

**What the fusion is not, added at v2.1b.** It is not a new aggregate quantity. The three axes are placed on one unit and are then reported separately and never combined, because they cannot be (6.10). The defensible claim is commensurability and comparability on a common unit. The indefensible claim, which no version has made explicitly but which the word "fusion" invites, is that something new is computed by putting them together. Nothing new is computed.

**And the position stated flatly at v2.1c.** Two of the three axes carry methods that belong to other parties, one of them under granted claims. The framework's remaining assertions are that the option decomposition carries information, and that this unit of account and this substrate are better than the ones already in use. Both are testable. Neither has been tested. That is the whole of it, and it should be said in that order to anyone who asks.

---

## 9. Evidence base

```
+--------------------------------+-----------------------------+
| CLAIM                          | GRADE (v2.1c)               |
+--------------------------------+-----------------------------+
| Architecture determines unit   | Asserted, pending H1.       |
| cost                           | Downgraded from Strong: the |
|                                | identity is a definition    |
| Architecture concentrates risk | Strong                      |
| Architecture is a value driver | Indicative, self-reported   |
| The quantities are computable  | Strong, but at ONE node on  |
|                                | a fictional composite       |
| The quantities can be totalled | RETIRED. They cannot. 6.10  |
| [v2.1b]                        |                             |
| The unit of account is derived | RETIRED. It is declared.    |
| from telemetry [v2.1b]         | The practice is a hybrid    |
| Coefficient movement tracks    | Asserted, pending H10.      |
| architectural change [v2.1b]   | Durst 6.5.6 says it may not |
| The framework scales           | Asserted. No evidence.      |
| The integration is unoccupied  | Strong for the sweep        |
|                                | performed; exposure remains |
| The integration is a           | Asserted. Does not yet meet |
| contribution                   | the field's standard        |
| E4 open commercially           | RETIRED. Occupied.          |
| E3 only partially occupied;    | RETIRED at v2.1c. OCCUPIED. |
| the patent family constrains   | Claims and specification    |
| rather than occupies [v2.1c]   | read at source. R15.        |
| Risk vendors do not scope from | RETIRED at v2.1c. At least  |
| a mined graph [v2.1c]          | one does. R16.              |
| The unit of account is doing   | Asserted. UNTESTED. No      |
| the work [v2.1c]               | hypothesis covers it.       |
|                                | Kill condition 8.           |
| Durst does not occupy the      | Strong on substance         |
| integration [v2.1b]            | (source read); Indicative   |
|                                | on wording (OCR)            |
| E5 open                        | Indicative, absence-based   |
| E6 open in peer-reviewed lit   | Indicative                  |
| Organisations will adopt it    | Asserted. Base rate is bad. |
+--------------------------------+-----------------------------+
```

### 9.1 The demonstration

One use case, one subdomain, one **fictional** mid-size retailer built from public data: Alibaba microservice traces, the Olist e-commerce dataset, Cyentia IRIS 2025, NetDiligence, and published cloud list prices.

It establishes **computability**. It establishes nothing about scale, generalisation, or economic return.

**Source characterisation corrected at v2.1.** The Alibaba 2022 release documents more than twenty million call graphs among **over seventeen thousand** microservices, and separately reports runtime metrics for **nearly twenty thousand** microservices across thirteen days. v2.0 reported the twenty-thousand figure against call graphs, conflating two different counts. The trace carries **no failure-propagation ground truth**, which is why no propagation claim is drawn from it.

**Source suitability stated at v2.1.** Cyentia IRIS and NetDiligence are cyber incident and claims datasets. Using them for loss magnitude in a framework addressing architecture-caused loss generally is a stretch of scope, since architecture-caused availability and data-integrity losses are not the same population as cyber breach losses. They are used because they are the best public monetary loss distributions available. Read the figures as illustrative of the machinery, not as calibrated for this loss type.

Headline figures, reproducible from the specification and seed, all independently reproduced on re-audit:

```
Cost, median monthly                        GBP     840
Loss event frequency, credibility-weighted        0.243 /year
Loss magnitude, median                      GBP 278,000
Loss magnitude, mean                        GBP 458,345
Loss magnitude, P99                         GBP 2,846,852
At 11% drift: median flat, mean +2.45%, P99 +5.72%
Option component of switching cost          GBP 281,457
Execution component (declared)              GBP 460,000
Broad switching cost, decomposed            GBP 741,457
```

The last line replaces a broad switching-cost estimate. It is never added to one. **No total across the three axes is computed and none should be (6.10).**

**One further note at v2.1b.** The counterfactual behind the option figure is declared for a fictional composite and has no decision record behind it. Under the adjudication rule at 6.4, a real engagement presenting that counterfactual would receive a refusal rather than a number. The figure illustrates the machinery. It would not stand as a reported result.

---

## 10. Load-bearing hypotheses

```
+-----+--------------------------------+--------------------------+
| ID  | HYPOTHESIS                     | FALSIFIED IF             |
+-----+--------------------------------+--------------------------+
| H1  | The coefficient is measurable  | Variation across         |
|     | and varies materially across   | comparable estates is    |
|     | comparable estates, after mix  | within measurement error |
|     | and vendor effects controlled  | or explained by mix      |
| H2  | Graph attribution differs from | Tag-based and graph-     |
|     | tag attribution                | based agree in tolerance |
| H3  | Monetary distributions change  | Decisions unchanged when |
|     | decisions that colours do not  | presented both ways      |
| H4  | Propagated loss differs from   | Propagated and naive     |
|     | node-local sum                 | totals agree             |
| H5  | Measured drift predicts        | Re-mining produces no    |
|     | estimate instability           | systematic movement      |
|     |                                | related to drift         |
| H6  | The option component is a      | The ratio of option to   |
|     | material fraction of switching | execution component is   |
|     | cost and varies independently  | stable across            |
|     | of the execution component     | commitments, OR the      |
|     | across commitments             | option component is      |
|     | LEADING KILL RISK, and at      | immaterial vs its own    |
|     | v2.1c close to the whole test  | estimation error         |
| H7  | Telemetry volatility proxies   | No relationship against  |
|     | value volatility               | an independent proxy     |
| H8  | High option-component nodes    | No relationship under a  |
|     | prove costlier to change       | valid identification     |
|     |                                | design                   |
| H9  | The borrowed stack composes    | Composition produces     |
|     |                                | contradictory outputs    |
| H10 | Coefficient movement follows   | Coefficient movement is  |
|     | architectural change within    | uncorrelated with        |
|     | the measurement horizon        | architectural change at  |
|     | SECOND KILL RISK [v2.1b]       | ANY lag the practice can |
|     |                                | observe, meaning the     |
|     |                                | practice measures noise  |
+-----+--------------------------------+--------------------------+
```

**A gap in this table, recorded at v2.1c and not closed.** Section 8 now lists the unit of account as one of the framework's two remaining assertions, and no hypothesis above tests it. Kill condition 8 states the test in words: if two competent analysts drawing different subdomain boundaries over the same estate produce materially different ledgers, the practice measures the decomposition rather than the architecture. That belongs in this table as H11 and it is not written yet, because writing a hypothesis is a design task rather than an editorial one and it should not be done hastily to fill a row.

### 10.1 On H6, rewritten at v2.1

The v2.0 form asserted that the forfeited option is distinct from switching cost, falsified if it moves one-for-one with execution cost. That was close to unfalsifiable and is retired.

The quantity is computed as W(K_low) minus W(K_high), so it is by construction a deterministic function of the switching-cost settings. It cannot fail to be related to switching cost. The value function is nonlinear in K, so the relationship is not literally one-for-one, which made the old hypothesis technically falsifiable in the way any nonlinear transform is not the identity. That is a lawyer's escape, not a test.

The rewritten H6 tests whether the **separation carries information**. If the ratio of option component to execution component is roughly constant across commitments, the option component is a fixed multiple of a quantity practitioners already estimate, the decomposition adds nothing, and the flexibility axis should be deleted in favour of the metered marginal-cost instrument at 6.2. If the option component is small relative to its own estimation error, the same conclusion follows.

This remains the leading kill risk. The difference is that the test can now return the kill.

**And at v2.1c the stakes rise.** When H6 was written, a falsification would have removed one axis from a framework with three. With E3 occupied, a falsification removes the only axis on which the framework asserts something the prior art does not already do. H6 should be run first, before any further documentation work, and section 12.1 orders it accordingly.

### 10.2 On H8

The naive test regresses realised change cost on the option component. It is endogenous by construction, since the option component is built from the switching-cost settings.

A valid design requires exogenous variation in commitment, a comparison group unaffected by that event, pre-trend evidence, outcomes from change records measured independently of the model, and ex-ante-only inputs. **The exclusion restriction must be argued**, since a vendor repricing may affect change cost directly rather than only through flexibility.

Version 2.0 of the specification listed three requirements and declared this solved. A list of desirable properties is not an identification strategy.

### 10.3 On H1 and the selection effect, added at v2.1b

H1 as designed is exposed to a selection effect that would make a null result uninterpretable, and the design must account for it before the test is run.

The scope conditions at section 4 require metered consumption, emitted telemetry, an existing subdomain decomposition and independent ownership of that decomposition. An estate satisfying all four is well instrumented, and well-instrumented estates are on any reasonable prior better run. **The population in which the coefficient is measurable is plausibly the population in which its variance is smallest.**

If H1 returns a null, the framework cannot distinguish two explanations: that coefficient variation is genuinely immaterial, which falsifies the hypothesis, or that variation is material in general and small in the well-run subset where measurement is possible, which does not.

The bias runs against the framework, so a positive H1 result in this population would be strong evidence. A negative result would be weak evidence and must not be reported as a clean falsification. Any H1 design must either obtain variation in instrumentation maturity within the sample, or state explicitly that a null is uninformative about the wider population.

### 10.4 On H10, added at v2.1b

H10 exists because Durst's temporal delay barrier (5.12) is unanswered and the framework should not carry an unanswered objection without a test attached to it.

The hypothesis is deliberately weak in the framework's favour and still capable of killing it. It does not require that coefficient movement track architectural change contemporaneously, nor at a specified lag. It requires only that some observable lag exists. Falsification requires no relationship at **any** lag the practice can observe, which would mean the coefficient carries no architectural signal on the timescales the practice operates on, and the whole measurement is noise.

Two design cautions. The architectural change series must be constructed independently of the coefficient, from change records or graph diffs, not from cost movements. And the graph-version problem at T-N bites hardest here, because the lag structure is exactly what a moving map confounds.

---

## 11. The honest ledger: open tensions

```
T-A   ABSORPTION. Methodology absorption by TBM or FinOps,
      whose unit economics is closer than earlier versions
      admitted. Product absorption by Datadog, BitSight,
      Google or Celonis. The mined graph is now commodity
      open infrastructure, which lowers the barrier for all
      four. BitSight added at v2.1c and is arguably first
      equal with Datadog: it holds the graph AND the
      monetised risk model and needs only a cost axis.

T-B   PATENT, RESTATED AT v2.1c. Previous versions recorded
      the BitSight family as a constraint on E3. Having read
      the claims and the specification directly, the correct
      statement is that the family OCCUPIES E3. The risk
      axis of this framework runs an occupied method over a
      different substrate for a different unit of account.
      Consequences: no novelty may be claimed for
      graph-propagated monetary risk; an FTO opinion is
      required before any filing and has not been obtained;
      and the framework's exposure is now concentrated on
      the flexibility axis and the unit of account rather
      than spread across three axes. Two v1.0 citations
      were read at source and are irrelevant to this work;
      they are CORRECTED rather than merely withdrawn.

T-C   MEASUREMENT COST. The practice may cost more than the
      decisions it improves. Unresolved.

T-D   DIRECTIONALITY OBJECTION. A serious practitioner
      position holds order-of-magnitude judgement suffices
      and quantification adds false precision.

T-E   THE DECOMPOSITION. Reframed at v2.1. The double-count
      is resolved by splitting rather than adding, but
      whether the split carries information is untested.
      H6 can return no. At v2.1c this is close to the
      whole test rather than one test among several.

T-F   CONTESTED FOUNDATIONS. Five borrowed methods are
      contested in their own literatures: real-world
      probabilities in Datar-Mathews, size-scaling of
      external loss data, ABC driver stability, non-traded
      asset volatility, GBM for cost series.

T-G   UNSEARCHED ADJACENCY. Dutch, French, Chinese and
      Japanese literature unsearched. The German finding
      (Durst 2007) was material and found late, and
      although now read and cleared, the fact that
      a targeted search was needed is the exposure. The E4
      finding at v2.1 was worse: English, canonical, and
      already in this document's own reference list. The
      E3 finding at v2.1c was worse still: a patent cited
      by number in this document since v1.0, whose
      specification took four retrievals to read.
      Principles: unexamined is not unoccupied;
      cited is not read; summarised is not read.

T-H   SINGLE DEMONSTRATION. One node, fictional composite,
      loss data drawn from a cyber rather than an
      architecture-failure population.

T-I   UNDER-IDENTIFIED COEFFICIENT. [v2.1]
      The cost identity is a definition. The coefficient is
      a residual absorbing mix, vendor performance, tenancy
      and measurement error. Attribution to architecture is
      an empirical claim, not an algebraic one. H1 tests it.

T-J   MEASURE MIXING. [v2.1]
      Telemetry-derived volatility is a physical-measure
      estimate. Only valuation methods built to accept such
      inputs may be used. Substituting a risk-neutral method
      without changing the input produces nothing meaningful.

T-K   SHARED-NODE ALLOCATION. [v2.1]
      The fixed-pool share at high-fan-in nodes is arbitrary,
      and those are exactly the nodes where consolidation and
      exit decisions are made. The framework is least
      trustworthy where the money is largest.

T-L   NOVELTY GRADE COLLAPSE. [v2.1, worsened v2.1c]
      One element remains open on present evidence, resting
      on absence of a found occupant. That is the same
      evidentiary position E4 held before it fell, and the
      same position E3 held before its patents were opened.
      Twice now, an element resting on absence of a found
      occupant has fallen when somebody finally looked.

T-M   RETRIEVAL-ASSISTED READING. [v2.1a]
      The Durst assessment was produced by a model reading
      the PDF, not by the author. It returned a fluent,
      apposite, correctly-page-numbered German quotation
      that does not exist in the text. The substance
      survived checking; the wording did not. Corollary:
      a quotation is a claim and needs checking like any
      other. SEE T-M-c: that corollary was too narrow.

T-M-a NO PORTFOLIO POSITION. [v2.1b, extended v2.1c]
      The ledger cannot be totalled, for three independent
      reasons (6.10). The practice cannot answer the
      aggregate question executives most often ask.
      Organisations requiring a single exposure or
      valuation figure should not adopt it. A limitation
      of the practice, not of its presentation.
      EXTENDED: an occupant of E3 DOES produce a
      portfolio-level aggregate, by simulating the whole
      graph in one model rather than cutting it into
      declared units first. The inability here is partly
      a consequence of this framework's own unit of
      account, not an inherent property of the problem.
      (Label preserved to match research paper v1.1c.)

T-M-b THE UNIT OF ACCOUNT IS DECLARED. [v2.1b]
      The graph is mined; the subdomain decomposition laid
      over it is hand-built, and it is the same class of
      artefact this document criticises Durst's
      IT-Bebauungsplan for being. The practice is a hybrid.
      Declared boundaries determine where cost pools are
      cut and where propagation is bounded. See 6.1 and
      scope condition 4.
      (Label preserved to match research paper v1.1c.)

T-M-c STRUCTURAL DETAIL FROM A PROXY READ. [v2.1b,
      extended v2.1c]
      The response to T-M was too narrow. The same
      model-assisted read that produced the fabricated
      quotation also produced a barrier count of three and
      a section range of 6.5.1 to 6.5.3. Both were wrong,
      both were published at v2.1a, and neither was caught,
      because neither looked like a quotation. EVERYTHING
      a proxy read returns about a source is a claim,
      including counts, section numbers and ordering.
      EXTENDED at v2.1c to ASSIGNEES and PATENT NUMBERS,
      two of which were wrong and published from v1.0.

T-N   THE GRAPH MOVES UNDER THE MEASUREMENT. [v2.1b]
      Continuous re-mining means two readings differ for
      two reasons at once: the architecture changed, and
      the map changed. There is no as-at concept and no
      frozen-graph concept, so no two readings are strictly
      comparable and every time series the practice
      produces is confounded at every point.
      DISCIPLINE: every reported figure carries the graph
      version it was computed against; comparison across
      graph versions either states which of the two causes
      is being attributed, or is refused.
      That makes the problem visible. It does not solve it,
      and a practice whose central promise is measurement
      over time has an unresolved problem at its centre.
      It also bites hardest on H10, whose whole subject is
      lag structure.

T-O   GOODHART. [v2.1b]
      Once the architectural coefficient is a number
      architects are held to, it stops measuring
      architecture and starts measuring what architects do
      to the coefficient. The levers are not exotic:
        - select a different causal driver for a cost pool
        - place a subdomain boundary so that expensive
          nodes fall outside the unit
        - choose a counterfactual that flatters the
          option component
      No anti-gaming treatment exists. The declared-fields
      discipline is a PARTIAL mitigation, because driver,
      boundary and counterfactual are all logged and
      therefore contestable, and the adjudication rule at
      6.4 removes the third lever. VISIBILITY IS NOT
      PREVENTION. An actor controlling the declarations can
      still choose the answer within a defensible range.

T-P   SELECTION EFFECT ON H1. [v2.1b]
      Estates meeting all four scope conditions are already
      well instrumented and probably well run, so
      coefficient variance may be smallest exactly where it
      is measurable. H1 could be falsified for the wrong
      reason and a null would be uninterpretable. The
      design must account for it. See 10.3.

T-Q   COUNTERFACTUAL ADJUDICATION. [v2.1b]
      The option component depends on a declared
      counterfactual and until v2.1b nothing constrained
      what could be declared. The evidence-from-the-
      decision-record rule at 6.4 now constrains it, at the
      cost of refusing the option component on older
      commitments where the record is thin. Whether that
      rule is workable in practice is untested.

T-R   SOURCE GRADE. [v2.1a, updated v2.1b and v2.1c]
      The Durst assessment was produced at v2.1a by a model
      and the author had not read the source. Sections 6.5,
      6.7.3.9 and 6.7.6 have now been read at source; the
      verdict is unchanged and the barrier account was
      materially wrong and had been published. Reading was
      by character recognition on a scanned volume:
      substance Strong, wording Indicative, nothing quoted.
      AT v2.1c the same exposure was found in the patent
      citations, and one further rule follows: a research
      process that grades its own findings Strong is making
      an unverified claim about its own reading. Any
      finding arriving through a proxy is INDICATIVE until
      the primary record is opened, whatever grade the
      proxy assigned itself.
      REMAINING EXPOSURE: the rest of Durst is unread; the
      specifications of the other four family members are
      unread; and the same proxy-reading method was used on
      other sources in the reference list without the same
      follow-up. Cope and Labbi is the largest such item.

T-S   CONCENTRATION OF THE REMAINING CLAIM. [NEW v2.1c]
      With E1 commodity, E3 occupied and E4 retired, the
      framework's exposure is no longer spread across three
      axes. Two things carry the whole position: whether
      the option-component decomposition carries
      information (H6), and whether this unit of account
      and this substrate are better than the ones already
      in use (untested, no hypothesis, kill condition 8).
      If both fail, what survives is the operating model,
      and R6 already retires the operating model as a
      differentiator. This is a structural exposure rather
      than an evidential one: the framework has fewer
      independent legs than it did, so a single
      falsification now propagates further than it would
      have at v2.0.
```

---

## 12. What would kill it

```
1. H6 falsified: the decomposition carries no information.
   The value axis reduces to the metered marginal-cost
   instrument. At v2.0 this left FinOps with a risk overlay.
   At v2.1c it leaves FinOps with a risk overlay that
   somebody else has patented, which is materially worse.
   [Upgraded v2.1c.]

2. H10 falsified: coefficient movement bears no relation to
   architectural change at any observable lag. The practice
   is measuring noise and no axis survives, because the same
   temporal problem applies to risk and to the option
   component. This is the more serious of the two kills.
   [NEW v2.1b]

3. A single vendor ships the full integration. Datadog and
   BitSight are the likeliest, from opposite directions:
   Datadog adds risk to a graph and a cost product,
   BitSight adds cost to a graph and a risk product. The
   unoccupied claim dies immediately, and the barrier is
   lower than at v2.0 because the graph substrate is
   commodity. [Extended v2.1c.]

4. Unsearched-language prior art contains the fusion.
   (Durst 2007 removed from this list at v2.1a: assessed,
   and read at source at v2.1b. Does not occupy the
   integration.)

5. Measurement cost exceeds decision improvement in the
   first real estate. The practice is uneconomic.

6. E6 pricing proves unfittable: no estate can produce the
   drift-to-uncertainty mapping empirically.

7. E5 turns out to be occupied. The framework would then
   have no element open on present evidence at all, and
   the contribution would rest entirely on the unit of
   account and the substrate.
   [v2.1. This is not hypothetical; it is what happened
   to E4, and at v2.1c it is what happened to E3.]

8. The declared unit proves to be doing the work. If two
   competent analysts drawing different subdomain
   boundaries over the same estate produce materially
   different ledgers, the practice measures the
   decomposition rather than the architecture. No
   hypothesis currently tests this and one should be
   added as H11. [NEW v2.1b. Priority raised at v2.1c,
   because the unit of account is now one of only two
   remaining assertions. See 10 and T-S.]
```

### 12.1 Validation plan

```
Step 1   Obtain dated priority. DONE at v1.0. Publish v1.1
         as a new version under the same concept DOI, with
         v1.0 left in place rather than withdrawn.
Step 2   Durst sections 6.5, 6.7.3.9 and 6.7.6 read at
         source. DONE at v2.1b. Verdict unchanged; barrier
         account corrected from three to six.
         RESIDUAL: the rest of the volume is unread.
Step 3   Verify or permanently drop US 12,380,090 and
         US 11,356,469. DONE at v2.1c. Both read at
         source. Both irrelevant. Corrected, not dropped.
         The BitSight family read at claim level (four
         grants) and specification level (10,257,219).
         E3 re-graded OCCUPIED.
         RESIDUAL: four specifications unread; legal
         status, maintenance fees and terminal
         disclaimers unchecked on all five.
Step 4   Quote-check the Cope and Labbi conclusion against
         the source body. [v2.1. Now the largest
         outstanding proxy-read exposure.]
Step 5   Bring Part IX to v3.1c and The Numbers Explained
         to v1.1c so the canonical set is consistent.
         BLOCKING for any external sharing.
         [Renumbered and reissued at v2.1c: Part IX
         reached v3.1b but predates the E3 re-grading,
         and The Numbers Explained is still at v1.1a and
         now needs both change sets.]
Step 6   RUN H6. Moved ahead of everything discretionary
         at v2.1c. It is close to the whole test, and no
         further documentation work changes what it
         returns. Design it against whatever commitments
         can actually be reached: public migration case
         studies, published exit costs, a synthetic
         estate. An untestable H6 leaves the framework
         with no route to being checked by anyone.
Step 7   Write H11: does the declared subdomain
         decomposition determine the ledger? Two analysts,
         one estate, independent boundaries, compare.
         [NEW v2.1c. Kill condition 8 has been recorded
         since v2.1b with no test attached.]
Step 8   Publish article 1 and harvest adversarial response.
Step 9   Build propagation on the borrowed stack against
         public labelled failure benchmarks. Warning: some
         benchmarks are trivial enough that rule-based
         methods match state of the art; choose a hard one.
Step 10  Design H10 with an independently constructed
         architectural change series. Second kill risk.
Step 11  Run H8 under a real identification design against
         ground truth the model did not generate.
Step 12  Non-English literature sweep.
Step 13  Freedom-to-operate opinion on the BitSight family
         before any filing. Now more likely to be needed
         and more likely to come back unfavourable.
```

---

## 13. Scope walls

```
DO NOT   claim invention of any method
DO NOT   claim the framework predicts
DO NOT   claim any element is unoccupied without naming the
           search that was performed
DO NOT   claim an element is open without checking the
           PRIMARY texts of the field it borrows from,
           including sources already in this reference list
           [v2.1]
DO NOT   treat a patent cited by number as read. Open the
           claims AND the specification. [NEW v2.1c]
DO NOT   accept a grade a research process assigned to its
           own findings. Indicative until the primary
           record is opened. [NEW v2.1c]
DO NOT   treat a model's summary of a source as a reading.
           Counts, section numbers, ordering, assignees and
           patent numbers are claims. [v2.1b, extended v2.1c]
DO NOT   quote from character-recognition output. Substance
           Strong, wording Indicative. [v2.1b]
DO NOT   use absolute forms: never, nobody, no one
DO NOT   present E1, E2, E3, E4 or E7 as differentiating
DO NOT   claim novelty for graph-propagated monetary risk
           in any form. It is granted to another party.
           [NEW v2.1c]
DO NOT   state that risk quantification vendors do not
           scope from a mined dependency graph. At least
           one does. [NEW v2.1c]
DO NOT   lead with E5 merely because it is what is left
           [v2.1]
DO NOT   add the option component to a broad switching-cost
           figure. Decompose, never sum. [v2.1]
DO NOT   anchor switching cost to the EU Data Act [v2.1]
DO NOT   total the ledger across use cases, on any axis or
           across axes. Rank, compare, or refuse. [v2.1b]
DO NOT   describe the practice as telemetry-derived without
           stating that the unit of account is declared.
           [v2.1b]
DO NOT   compare two readings taken against different graph
           versions without stating which cause is being
           attributed. [v2.1b]
DO NOT   accept a counterfactual that is not evidenced from
           the decision record. [v2.1b]
DO NOT   draw on employer systems, customer data or any
           confidential commercial information
DO NOT   conflate this with the author's doctoral research
DO NOT   quote the option component as a gradient
DO NOT   report the option component where the two K points
           straddle a discontinuity in W(K) [v2.1]
DO NOT   report tail statistics where the ceiling binds
DO NOT   present the correction log as the contribution
           [v2.1]
```

**On absolute claims.** These emerge automatically when constructing a compelling narrative and must be subjected to the same adversarial scrutiny as any external source, including when they originate with a drafting assistant rather than the author. Sixteen have now been caught and retired. The pattern is reliable enough to be treated as a standing hazard.

---

## 14. The correction history as method

### 14.1 The record

```
Framework claims retired on contact with prior art     16
Specification, logged errors
  v1.0 fatal errors (F1-F4)                             4
  v2.0 errors corrected at v3.0 (G1-G16)               16
  v3.0 errors corrected at v3.1 (H1-H9)                 9
  total                                                29
Canonical thesis v2.0 to v2.1 (S11-S22)                12
Canonical thesis v2.1a to v2.1b (S27-S37)              11
Canonical thesis v2.1b to v2.1c (S38-S45)               8
Methods removed entirely                                2
```

### 14.2 The pattern

The errors share a cause, and it is not mathematical ignorance. In each case a genuine problem was identified, a replacement was located that **sounded authoritative**, and it was adopted without verification against its primary source.

**The v2.1 error extends the pattern in a way worth naming separately.** E4 was not an unverified borrowing. It was a novelty claim asserted without checking the primary literature of the field being borrowed from, in a case where the relevant texts were already in the reference list for other purposes.

**The v2.1c error is the same shape a third time, and the obvious place was a patent number printed in this document's own reference list.** The family had been cited since v1.0 and described from a summary in every version since. Opening it took four retrievals and moved an element from partially occupied to occupied.

**Five failure modes are now logged.**

```
1  Confidence in a METHOD    it sounded right, so it was used
2  Confidence in a GAP       it looked absent, so it was claimed
3  Absolute claims           "nobody", "never", emerging
                             automatically from narrative
4  Fabricated quotation      fluent, apt, correctly
                             page-numbered, non-existent.
                             Only a source search catches it
5  Structural detail from    a count, a section number, an
   a proxy read              ordering, AN ASSIGNEE, A PATENT
                             NUMBER, taken from a model's
                             summary. Plausible, checkable,
                             unchecked. Caught at v2.1b AFTER
                             publication at v2.1a, and again
                             at v2.1c after publication from
                             v1.0
```

**Failure mode 5 is recorded separately from 4 because the response to 4 was insufficient.** When the fabricated quotation was caught, the rule adopted was that a quotation is a claim and needs checking. That rule was too narrow. The same proxy read produced a barrier count and a section range, and those went through unchecked because they did not look like quotations. **Everything a proxy read returns about a source is a claim, including its structure.** At v2.1c the class was widened again, to patent numbers and assignees.

Two cautions are logged that are not yet failure modes, because neither has caused a published error.

**Sixth, from v2.1b:** character recognition on a scanned source establishes substance at Strong and wording at Indicative. Nothing is quoted from it.

**Seventh, from v2.1c: a research process that grades its own findings Strong is making an unverified claim about its own reading.** Any finding arriving through a proxy is Indicative until the primary record is opened, whatever grade the proxy assigned itself. In the v2.1c case the proxy's substance was correct and its grade was still unearned, which is why the rule is about provenance rather than about accuracy.

```
v1.0, v2.0   confidence in a METHOD
v2.1         confidence in a GAP
v2.1b        confidence in a SUMMARY
v2.1c        confidence in a CITATION
```

The third and fourth resemble the second. In every case there is nothing to check against unless you go and look, and in every case the thing that felt like knowledge was a report about knowledge.

**The failure mode was confidence, not ignorance.** That is the more dangerous of the two, because ignorance is visible to the person holding it.

### 14.3 Why this is published, and what it is not

Enterprise architecture quantification has a documented record of attempts that did not survive the engagement that produced them. Against that base rate, a polished result with no visible working is weak evidence, because the natural question is who checked it and the usual answer is nobody.

A correction sequence answers a better question: what happens to this framework when it is wrong? The answer is on the record, six times, errors named and replacements sourced.

**Withdrawn at v2.1.** v2.0 closed by stating that the correction log was the most defensible artefact the work had produced. That framing is retired. A correction log is process hygiene, not a contribution, and elevating it to the headline functions as a deflection from the fact that a central claim did not survive. The log is retained as method and as evidence of responsiveness. It is not offered as the result.

Two structural consequences are retained. Retirements are logged rather than silently edited, and superseded versions are left in place rather than withdrawn. And constructions that **can contradict themselves** are preferred: the Poisson-gamma credibility model is retained partly because its Bayesian and credibility derivations must agree exactly, so an implementation error announces itself.

**A third consequence added at v2.1b and reinforced at v2.1c.** Where a source is load-bearing, the source is opened. Not searched, not summarised, not asked about, not cited by number. Opened. The v2.1a error cost a published version carrying a wrong account of the framework's most important predecessor. The v2.1c error cost four published versions carrying a wrong occupancy verdict on one of the framework's three axes. Neither was catchable by reasoning.

---

## 15. Supersession record

### 15.1 Framework claims retired

```
R1  Cross-organisational economic signature of architecture
R2  Nobody monetises graph-propagated risk
      -> RISKEE, cyber-catastrophe models, BitSight family
R3  Shared language as differentiator
      -> TBM has occupied this since 2012
R4  Option value absent from EA literature
      -> Baldwin & Clark, Sullivan, Taudes, Bahsoon & Emmerich
R5  Mined substrate as differentiator
      -> CSDM, observability vendors, now OpenTelemetry
R6  Operating model as differentiator
      -> FinOps and TBM Council joint publication
R7  Above-the-line risk as a construct
      -> Basel operational risk defines it line for line
R8  Modularity as alternate graph paths
      -> that is redundancy; modularity is cut cost
R9  Architecture as unqualified cost driver
      -> narrowed to determinant of UNIT cost
R10 Inverted-sign forfeited option is commercially open [v2.1]
      -> Dixit & Pindyck 1994: irreversible investment kills
         the option to invest, and the killed option belongs
         in investment cost
      -> Kulatilaka & Trigeorgis 1994: switch option under
         switching cost, with hysteresis
      -> dividend/convenience yield treatment is routine
R11 Forfeited option is additive to switching cost [v2.1]
      -> Klemperer 1995; Farrell & Klemperer 2007: switching
         costs already aggregate the option and uncertainty
         components. Addition double-counts.
      -> reframed as decomposition, 6.5
R12 Correction log as the work's most defensible artefact [v2.1]
      -> process hygiene is not a contribution
R13 The practice is telemetry-derived throughout [v2.1b]
      -> the graph is mined, the unit of account laid on it
         is declared. The practice is a hybrid. See 6.1.
R14 Ledger entries aggregate to a portfolio position [v2.1b]
      -> no axis admits summation, for three different
         reasons. See 6.10.
      -> Durst 2007 s6.7.6.5 states the overlap problem for
         the cost and benefit axis independently, with
         cross-settlement proposed. Not a new observation.
      -> BitSight claims a NONLINEAR SUM across assets,
         entities and portfolios. Not new in 2018 either.
         [extended v2.1c]
R15 E3 is only partially occupied; the patent family
    constrains rather than occupies it [v2.1c]
      -> claims read for four grants, specification read
         for US 10,257,219
      -> DOLLAR-DENOMINATED LOSS EXCEEDANCE CURVE over a
         DISCOVERED DEPENDENCY GRAPH, priority March 2018
      -> per-edge conditional compromise probability,
         seeded Monte Carlo propagation, per-asset loss,
         aggregation across assets, entities, portfolios
      -> see 5.4
R16 Risk quantification vendors scope from asset
    inventories, scenarios and control posture rather
    than from a mined dependency graph [v2.1c]
      -> at least one scopes from a discovered graph
      -> surviving statement: they address neither unit
         cost nor flexibility, and their graph maps
         external vendor exposure rather than internal
         business work. See 5.10.
```

### 15.2 Specification v1.0 fatal errors

```
F1  Margrabe closed form used with a cash strike added
F2  Forfeited option as difference of two options varying
    in both strike and horizon
F3  Epistemic decay added to expected loss
F4  Falsification regression circular by construction
```

### 15.3 Specification v2.0 errors, corrected at v3.0

```
G1  "Mean unchanged under widening" false for skewed loss
G2  Datar-Mathews with one discount rate rather than two
G3  Plain Buhlmann mislabelled Buhlmann-Straub; quarterly
    counts mixed with annual rates
G4  Independent AND rule contradicting tail dependence
G5  Hard cap rather than explicit censoring
G6  Severity-scaling exponent applied to frequency
G7  Comonotonic VaR misdescribed; alpha < 1 condition omitted
G8  Fault trees applied without a monotonicity check
G9  Cycle retraction over-broad; LBP convergence overstated
G10 Percolation retained rather than removed
G11 "No volatility input required" overclaim
G12 SR 11-7 cited as support for what it cautions against
G13 GBM assumed for cost series without a stationarity gate
G14 Falsification declared solved by a list
G15 FAIR secondary loss as a flat additive term
G16 Identification problem presented as near-unsolvable
```

### 15.4 Specification v3.0 errors, corrected at v3.1

```
H1  Forfeited option presented as an original instrument
H2  FO reported alongside broad switching cost (double-count)
H3  Narrow K anchored to the EU Data Act switching charge
H4  Hysteresis recorded as a caveat; number reported anyway
H5  H6 near-unfalsifiable by construction
H6  1% censoring threshold presented as derived
H7  Cope & Labbi conclusion asserted as established
H8  Cost identity implied to establish the architecture claim
H9  Shared-node fixed allocation treated as a caveat
```

### 15.5 Canonical thesis, v2.0 to v2.1

```
S11 TITLE. Enterprise Architecture Economics ->
    The Architecture Ledger. "Standing discipline" ->
    "standing measurement practice". Both overclaimed.
S12 E4 reclassified OCCUPIED. Headline novelty withdrawn.
    Dixit & Pindyck 1994 and Kulatilaka & Trigeorgis 1994
    were already in this document's reference list.
S13 Double-count resolved by decomposition, not addition.
    EU Data Act anchor removed (Art. 29(1) zeroes the
    charge from 12 Jan 2027).
S14 H6 rewritten. The v2.0 form was near-unfalsifiable.
S15 Cost identity downgraded from Strong to Asserted.
    It is a definition; the coefficient is a residual.
S16 Value axis preference order reversed: metered marginal
    cost is primary, the option component is the reserve.
S17 Hysteresis promoted from caveat to refusal condition.
    W(K) curve now a required reported field.
S18 Patent family corrected: two withdrawn as unverifiable,
    two added, Apptio US 8,766,981 added to E2.
    [The two withdrawn were READ AT SOURCE at v2.1c and
    are irrelevant, not merely unverifiable. See S39.]
S19 OpenTelemetry service graph connector added to E1.
    The substrate is commodity, not merely occupied.
S20 Firefly encroachment on E6 strengthened from partial
    to shipped, with the remaining distinction stated.
S21 Correction-log-as-headline framing withdrawn (R12).
    Integration restated as a proposal awaiting test.
S22 Four new tensions: T-I under-identified coefficient,
    T-J measure mixing, T-K shared-node allocation,
    T-L novelty grade collapse.
```

### 15.6 Canonical thesis, v2.1 to v2.1a

```
S23 DURST ASSESSED. Does not occupy the integration.
    No telemetry discovery, no monetary risk, no
    option pricing, axes not combined. Removed from
    the kill list and from open exposures. Retained
    as nearest prior art in intent.
S24 DURST'S BARRIERS ARGUMENT recorded as a standing
    objection this framework must answer: he found
    direct valuation not achievable and went indirect.
    [SUPERSEDED AT v2.1b. The v2.1a entry stated THREE
    barriers at sections 6.5.1 to 6.5.3. There are SIX,
    at 6.5.1 to 6.5.6. See S27.]
S25 Citation reverted to Teubner, 2007. Springer's own
    record gives that publisher and year; the v2.1
    "correction" was wrong. T-M added.
S26 A German quotation surfaced during the assessment
    was checked against the source and found NOT
    present verbatim. Substance retained, wording
    discarded. Logged as a distinct failure mode.
```

### 15.7 Canonical thesis, v2.1a to v2.1b

```
S27 DURST READ AT SOURCE. S24 corrected: SIX barriers at
    sections 6.5.1 to 6.5.6, not three at 6.5.1 to 6.5.3.
    Delayed effects is 6.5.6. Two barriers were unknown
    to this framework: data acquisition (6.5.4) and the
    forecasting problem (6.5.5). New section 5.12 answers
    each, graded, with two admissions of failure: 6.5.2
    is sidestepped and 6.5.6 is open.
S28 DURST 6.7.3.9 read: "Strategische Optionen" is a
    qualitative benefit narrative with no valuation
    method. DURST 6.7.6.4 read: he states flexibility
    improvements are not calculable and carries them
    qualitatively. HE DECLINES THE AXIS RATHER THAN
    OCCUPYING IT. E4 non-occupancy strengthened from
    Indicative to Strong on substance.
S29 DURST 6.7.6.5 read: overlapping value contributions
    cannot simply be added; cross-settlement proposed.
    Cited at 6.10 as prior art for the aggregation limit.
S30 DURST 6.7.6 read: he values a TARGET architecture from
    benchmarks and average per-project savings,
    extrapolated annually. Ex-ante planning estimate, not
    measurement of a running estate. Confirms the
    mined-versus-drawn contrast at source.
S31 AGGREGATION LIMIT ADDED as 6.10. The ledger cannot be
    totalled. Non-additivity stated per axis with a
    distinct reason for each. Portfolio total added to
    refusal conditions and to scope walls. Legitimate
    alternatives named. R14 logged. Section 3.4 on the
    word "ledger" sharpened accordingly.
S32 UNIT OF ACCOUNT ADMISSION added at 6.1. The unit is
    declared, not mined; the practice is a hybrid. Partial
    defence on rate-of-change grounds stated AS partial.
    Fourth scope condition added at section 4 requiring
    the decomposition to be pre-existing and independently
    owned. R13 logged. E2 narrowed a third way at 5.3.
S33 H10 ADDED: coefficient movement follows architectural
    change within the measurement horizon. Second kill
    risk. Design cautions at 10.4.
S34 SIX NEW TENSIONS: T-M-a no portfolio position,
    T-M-b declared unit of account, T-M-c structural
    detail from a proxy read, T-N graph moves under the
    measurement, T-O Goodhart, T-P selection effect on H1,
    T-Q counterfactual adjudication. T-R updated.
    (T-M-a and T-M-b are labelled awkwardly because T-M
    was already taken; the labels are preserved to match
    the research paper rather than renumbered.)
S35 COUNTERFACTUAL ADJUDICATION RULE added at 6.4: must be
    an option on the table at decision time, evidenced
    from the decision record. New refusal condition. The
    demonstration's own counterfactual noted at 9.1 as one
    that would be refused in a real engagement.
S36 GRAPH VERSION and SUBDOMAIN DECOMPOSITION OWNER added
    as required reported fields at 6.3. Comparison across
    graph versions must state which cause is attributed
    or be refused.
S37 FAILURE MODE 5 logged at 14.2: structural detail from
    a proxy read. The v2.1a rule "a quotation is a claim"
    was too narrow. Sixth caution added on character
    recognition. New convention: SUMMARISED IS NOT READ.
    New kill condition 8: the declared unit may be doing
    the work, and no hypothesis currently tests it.
```

### 15.8 Canonical thesis, v2.1b to v2.1c

```
S38 E3 RE-GRADED from PARTIALLY OCCUPIED AND PATENT-
    ENCIRCLED to OCCUPIED. Section 5.4 rewritten. The
    BitSight correlated-risk family was read at CLAIM
    level for four grants and at SPECIFICATION level for
    US 10,257,219, rather than described from a summary
    as in every version since v1.0. The decisive fact is
    in the specification, not the claims: a LOSS
    EXCEEDANCE CURVE DENOMINATED IN US DOLLARS produced
    from the simulation results, with a worked threshold
    example. Priority March 2018. R15 logged.
S39 US 12,380,090 and US 11,356,469 CORRECTED rather than
    left withdrawn. Both read at source. Both granted,
    neither in the family, neither relevant. 12,380,090
    is dataset-corruption risk from read/write logs with
    no money in its claims; 11,356,469 is a monetary
    impact calculation with no graph. Assignees reported
    as Google LLC and Barracuda Networks, Indicative
    only, read from a secondary index. The v1.0 duplicate
    listing was a copied wrong citation, not a
    transposed digit. Supersedes S18.
S40 SECTION 5.10 CORRECTED. The clause asserting that risk
    vendors scope from asset inventories and scenarios
    rather than from a mined dependency graph is false.
    At least one scopes from a discovered graph. The
    surviving statement is that they address neither unit
    cost nor flexibility, and that their graph maps
    external vendor exposure rather than internal
    business work. R16 logged. Absorption list at 5.11
    extended to four parties, BitSight added at first
    equal with Datadog.
S41 SECTION 6.10 EXTENDED. The aggregation limit now has
    TWO prior-art precedents. The second is a granted
    claim to aggregating losses in a NONLINEAR SUM across
    assets, entities and portfolios. Two distinctions
    stated, both cutting against the framework: they
    assert a method where this framework records a
    refusal, and they reach a joint position by
    simulating the whole graph in one model, needing no
    copula, which is available to them because they do
    not cut the graph into declared units first. The
    aggregation problem is partly self-inflicted by this
    framework's own unit of account.
S42 T-S ADDED: concentration of the remaining claim. With
    E1 commodity, E3 occupied and E4 retired, two things
    carry the whole position: H6, and whether the unit of
    account and substrate are better than what is in use.
    T-B rewritten from constraint to occupancy. T-A, T-G,
    T-L, T-M-a, T-M-c and T-R all updated. Kill condition
    1 upgraded, 3 extended, 7 rewritten.
S43 SECTION 8 REWRITTEN. The unit of account added as a
    fourth item in the inventory of what is left, and the
    internal-versus-outside-in substrate named as the
    distinction that separates this risk axis from the
    granted family. Closing position stated flatly: two
    of three axes carry other parties' methods, and the
    remaining assertions are H6 and the unit of account.
S44 VALIDATION PLAN REORDERED at 12.1. Step 3 (patent
    verification) marked DONE with residuals named. RUN
    H6 promoted ahead of all discretionary work, because
    it is close to the whole test and no further
    documentation changes what it returns. New step:
    write H11 for the declared-unit question, which has
    been a kill condition since v2.1b with no test
    attached. A gap note added at section 10.
S45 THIRD METHOD FAILURE logged at section 5, and a
    SEVENTH CAUTION at 14.2: a research process that
    grades its own findings Strong is making an
    unverified claim about its own reading. Any finding
    arriving through a proxy is INDICATIVE until the
    primary record is opened, whatever grade the proxy
    assigned itself. Failure mode 5 widened to assignees
    and patent numbers. Two new scope walls: do not treat
    a patent cited by number as read, and do not accept a
    self-assigned grade. New convention line: CITED IS
    NOT READ now explicitly covers patents.
```

---

## 16. Closing statement

Enterprise architecture is a continuously billing determinant of unit cost, a material risk concentrator, and a foreclosure or preservation of future options. It satisfies the criteria the enterprise measurement regime applies to other material assets, and it sits outside that regime.

This thesis proposes a standing measurement practice to close that gap, assembled entirely from methods owned by others: actuarial credibility, reliability engineering, real options, activity-based costing, the FAIR standard, applied econometrics.

Of seven constituent elements, five are occupied or partially occupied, one is open only in peer-reviewed literature and is already encroached commercially, and one is open on present evidence and rests on the absence of a found occupant.

**Two elements once carried as contributions are now occupied, and both fell the same way.** The inverted-sign forfeited option, the headline at v2.0, is the standard opportunity cost of exercising an option, stated in the canonical real options literature that was already in this document's reference list. And the monetisation of graph-propagated risk, carried through v2.1b as partially occupied and patent-encircled, is occupied outright by a granted family with a March 2018 priority date that was also already in this document's reference list, cited by number and never opened. In both cases the correction required reading rather than reasoning.

What survives is narrower and should be read as such. A decomposition separating the option component of switching cost from the deterministic execution component, in a setting where the switching-cost literature treats the aggregate as undifferentiated. A unit of account, the use case within a named business subdomain, against which all three axes are expressed. And a substrate that maps internal business work rather than external vendor exposure. The first is what H6 tests. The second has no test written for it and should have one.

Three further limits are stated at v2.1b and none is presentational. The entries do not add up, so this is a measurement practice and not a management system. The unit of account is drawn by hand, so this is a hybrid and not a telemetry-derived instrument. And every quantity is contemporaneous while architectural effects arrive with delay, which Durst identified as a barrier in 2007 and which this framework does not answer.

The nearest predecessor turns out to help more than he hurts. He does not occupy the integration, he explicitly declines the flexibility axis as not calculable, and one of his six barriers has been dissolved by twenty years of instrumentation. He also stated the non-additivity problem in 2007 with a mitigation this framework lacks, and he identified two obstacles this framework did not know it had. The instrumentation that dissolved his fourth barrier was acted on by somebody else in 2018, which is worth holding alongside any argument about timing.

No identified party performs the integration. Whether that integration constitutes a contribution is not yet established, because the accepted standard requires demonstrated capability plus validation and this work has one demonstration on a fictional composite.

That is the claim. It is smaller than the claim at v2.1b, which was smaller than at v2.1a, which was smaller than at v2.0, which was smaller than the claim this work began with, because sixteen framework claims and twenty-nine specification errors have been retired in getting here.

The result is a proposal with its prior art honestly located, two central novelty claims withdrawn, and its aggregation, unit-of-account and temporal limits stated. That is less than v2.1b said. It is what the evidence supports.

---

*End of canonical thesis v2.1c. Supersedes v2.1b, v2.1a, v2.1, v2.0 and all earlier versions.*
*Pending owner ratification.*
