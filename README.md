# Ledger Explorer

An interactive 3D teaching tool for The Architecture Ledger. It exists so that a
practising architect and an executive who has never seen a dependency graph can
look at the same screen and take away five ideas:

1. A platform is a shared node. Use cases plug into it.
2. Part of every shared node's cost is a rule, not a meter reading.
3. Risk travels along edges. Fan-in is blast radius.
4. Platforms grow by accretion. Exit cost accrues silently.
5. Diversifying vendors relocates concentration, it does not remove it.

## None of this is a measurement

Every number in this tool is synthetic. The estate is invented. The
coefficients were chosen to make the picture move in the right direction, not
because they are right. Nothing here is drawn from the canonical Architecture
Ledger documents, nothing here changes any formula in them, and nothing here
reproduces the worked example at canon 9.10.

Named systems are landscape furniture. No evaluative statement is made about
any of them, and no vendor is coloured, ranked or scored.

There is no estate figure anywhere in this tool. Canon 9.8.3 gives three
separate reasons why the ledger cannot be totalled, one per axis, and the tool
declines the total rather than approximating it.

## How to run

Requires Node 20 or later.

```
npm install
npm run generate     # rebuild data/*.json from the seed, with the realism report
npm run test         # unit tests
npm run dev          # development server
npm run build        # static build into dist/
```

`dist/` is committed, so the folder opens in a browser with no toolchain.

## The synthetic estate

Harbourline Insurance, an invented mid-size UK general insurer of roughly 4,000
staff writing personal and commercial lines through direct and broker channels.

Two estates are generated from seed 20260905:

| | concentrated | best of breed |
|---|---|---|
| platforms | 12 | 12 |
| integration nodes | 4 | 4 |
| use cases | 30 | 30 |
| edges | 136 | 193 |

Both carry the same 30 use cases across the same six declared business
subdomains. The best of breed estate re-wires them onto more specialised
platforms and routes every use case through all four integration nodes.

The subdomain boundaries are DECLARED. The generator does not derive them from
the graph, which is the point of view 6 and is canon 9.1.2: a mined substrate
carrying a hand-drawn boundary.

## Deviations from spec

The spec (section 0) says that where a formula conflicts with the canon, the
canon wins and the conflict is recorded here rather than resolved silently.
Each entry names the spec section and the canon section.

### 1. Gaussian copula replaced with Student-t

Spec section 6 specifies "a Gaussian copula with a single correlation parameter
rho". Canon 9.3.8 states plainly: "Do not use a Gaussian copula. It has zero
tail dependence (Embrechts, McNeil and Straumann 2002), meaning it assumes
things stop moving together exactly where you need them to. Use a Student-t or
another tail-dependent family and declare it."

The canon wins. Dependence is drawn from a Student-t copula with four degrees
of freedom, declared on screen. The rho slider and its plain-English endpoints
are unchanged.

### 2. The by-headcount allocation rule is prohibited, and ships as a counter-example

Spec section 4.2 offers three allocation rules: equal split, by volume, and by
headcount (subdomain size). Canon 9.2.8, added at v3.1d and logged as R23,
permits only two bases and prohibits a third shape:

```
Permitted:
  equal split across all consumers of node n
  b_u(n) = 1 / |consumers(n)|          [default, matches 9.10]
  driver-proportional
  b_u(n) = w_u(n)

Prohibited:
  any TWO-STAGE basis that allocates first to a subdomain
  and then within it.
```

By-headcount allocates to a subdomain and then within it. It is exactly the
prohibited shape. But spec section 4.6 and acceptance check 6 both require it
to be demonstrable, because showing that it moves when boundaries are redrawn
is the entire lesson of view 6.

Resolution: it ships, and it carries the label "Prohibited by 9.2.8, shown as a
counter-example" on screen in view 6, not only here.

Separately, the spec's by-volume rule uses business volume rather than the
node's driver units. That is partition-independent, so it satisfies the rule
9.2.8 states as a MUST, but it is not one of the two bases 9.2.8 lists as
permitted. It is labelled as such. A fourth rule, driver-proportional, has been
added so that the permitted set is actually representable in the interface.

### 3. Option component: Datar-Mathews replaces the multiplier, and a refusal is carried with it

Spec section 6 computes the option component as
`base_option(p) * tenure_factor(p) * fanin_factor(p)`. That is a monotone
multiplier, not a valuation.

Canon 9.5.3 defines the quantity as `OC(d) = W(K_reversible, T) - W(K_committed, T)`,
one switching-option model evaluated at two switching-cost settings with the
horizon held constant, and canon 9.5.5 specifies the engine as the two-rate
Datar-Mathews form with the discounting inside the max.

The canon wins. The tool implements that engine. The spec's intended behaviour
survives: K_committed hardens with riders and tenure, W is weakly decreasing in
K, so the option component rises as the commitment hardens. That direction is
now derived rather than asserted.

Canon 9.5.7 then adds a precondition the tool cannot meet. K_reversible may be
set only from an alternative evidenced by a dated artefact from the decision
record, cited by identifier. A synthetic estate has no decision record, so
canon 9.9 would refuse the option component outright.

Resolution, at the owner's direction: the number is computed and never renders
as a bare figure. Wherever it appears it sits inside the same visual element as
the refusal text, so that a screenshot cannot separate them. The view 4
ratification sentence quotes the execution component as its only hard number.

### 4. Provenance fields added, which the spec does not ask for

Canon 9.8.2 makes the graph version and the subdomain decomposition owner
required reported fields and states: "An entry missing either is not a ledger
entry." The spec's data shape in section 3 carries neither. Both estates now
carry graph version, as-at date, decomposition owner, decomposition revision
date, seed, and the allocation basis in force, and the interface shows them.

### 5. Summed option components are labelled an upper bound

Spec section 4.5 asks for the sum of integration commitments to be shown
"alongside with the caveat that it does not add cleanly". Canon 9.8.3 result
three is sharper than a caveat: by convexity,
`E[max(A,0)] + E[max(B,0)] >= E[max(A+B,0)]`, so a sum of separately valued
switching options exceeds the joint position and the gap widens as correlation
falls. The sum is therefore reported as an upper bound, which is what the
inequality licenses, rather than as a figure with a warning attached.

### 6. The spec's blast-radius expectation for the concentrated estate is not asserted

Spec section 4.5 states that the largest single blast radius is "left: a
platform. right: the integration node." Spec section 3.5 separately requires
identity to have fan-in from nearly everything in the same estate. Both refer
to `data/estate.json` and they cannot both hold: identity riding 28 of 30 use
cases dominates by construction.

An earlier revision of this generator resolved that by widening the policy
suite onto five more use cases until a platform led. That was a contrivance and
it has been reverted. The generator now reports the top three blast radii per
estate by node type and asserts nothing about which type leads. Identity
leading in both shapes is a finding about the estate, not a defect in it.

Acceptance check 5 constrains only the right-hand graph and is unaffected. It
passes: in the best of breed estate the three largest blast radii are all
integration nodes.

### 7. Counts differ slightly from the spec's approximations

Spec section 3.2 says "about 14" platforms and lists 16; all 16 are used. Spec
section 2 says "roughly 45 nodes, 120 edges"; the concentrated estate has 46
nodes and 136 edges, the best of breed estate 46 nodes and 193 edges. Spec
section 4.5 says the best of breed estate has twelve platforms; it has exactly
twelve, plus the four integration nodes.

### 8. The boundary-crossing check excludes integration nodes

Spec section 3.5 requires at least four use cases to cross three or more
subdomain boundaries "via shared platforms". Counting integration nodes in that
path makes the answer 30 of 30 on any wiring at all, because identity and the
iPaaS touch nearly everything by construction, and the check stops testing
anything. Integration nodes are excluded from the path. The result is 27 of 30,
against a required minimum of 4.

### 9. Power BI driver quantity corrected

The first generator gave Power BI a driver band of 0.5 to 3 report renders per
analytical output, which produced GBP 106 of metered spend a month against a
GBP 11,000 fixed pool. Renders are not one-for-one with published outputs; a
refreshed model or report is viewed tens to hundreds of times a month. The band
is now 40 to 260. The unit cost is unchanged. This was corrected for realism,
not to move the C1 figure.

### 10. Node 22 rather than Node 20

The build was specified against Node 20 LTS. The container provides Node
v22.22.2 and no version manager, and Node 20 could not be obtained. Node 22 is
also LTS and is supported by Vite 5. The project is built and tested on Node
22. `package.json` declares `>=20`.

## The C1 question

The spec's C1 formula is

```
C1(p) = sum rule_share(p, riders) / sum reported_cost(riders, p)
      = fixed_pool(p) / (fixed_pool(p) + metered_spend(p))
```

As fan-in rises, more riders bring more metered spend, the denominator grows
while the fixed pool does not, and C1 falls. The question put to this build was
whether canon 9.2.6 says the opposite, or is talking about a per-rider
quantity.

It says neither. Here is 9.2.6 in full:

> ### 9.2.6 The shared-node limit
>
> The variable pool at a shared node is allocated on a metered causal driver and is defensible. The fixed pool at a shared node is allocated on a declared basis and is not.
>
> ```
> Shared node P serving k use cases:
>   variable share    metered, causal, defensible
>   fixed share       declared, arbitrary, NOT defensible
>                     for any decision about leaving P
> ```
>
> **Plain English:** the more use cases lean on a node, the less the fixed part of its cost figure means, and high-fan-in shared nodes are exactly where consolidation and exit decisions get made. The framework produces its least trustworthy cost number at the point where the largest cost decisions happen.
>
> This is a real limit and nothing in this document resolves it. It is recorded rather than hedged. The variable coefficient remains usable at shared nodes; the total does not.
>
> **Extended at v3.1b.** For any question of the form "what would we save by removing this set of use cases", the allocated average is the wrong instrument regardless of how good the driver is, because removal does not release the fixed pool and does not release the shared node. Only a **marginal** basis answers a removal question, and marginal costs do not sum to the total either. See 9.8.3.
>
> **A note on asset weighting, added at v3.1c.** The granted family at 9.3.9 weights each asset by its importance to the entity that owns it, assessed by traffic share, revenue proportion or a user-defined metric. **[Strong, from claim and specification text.]** That is a declared importance weight applied to a node, and it is a weaker construct than the metered causal driver above, because it does not attach to a unit of business work. The distinction is real and it is the clearest place in this document where the cost axis does something the prior art does not. It is also the distinction most exposed to the objection at 9.1.2, since the unit of business work is bounded by a declared subdomain.

The section makes a claim about DEFENSIBILITY, not about magnitude or
direction. Its table marks the fixed share "declared, arbitrary, NOT
defensible" at any fan-in; the share is already indefensible when k is 1, so
nothing about it rises. The plain-English line, "the more use cases lean on a
node, the less the fixed part of its cost figure means", is about how much the
number can be trusted and about where the consequential decisions get made. It
is not a statement that the number gets bigger.

Read as the per-rider quantity the block is indexed as ("Shared node P serving
k use cases"), equal split gives `b_u(n) = 1 / k`, which falls as k rises. That
is the same direction as the spec's formula, not the opposite one.

So 9.2.6 does not contradict the spec, and it makes no directional claim with
which it could. Under the instruction given for this case, the spec formula
ships unchanged and the view 2 hint claims only that the number moves:

> Drag the fan-in slider. This use case did nothing different. Its number moved
> anyway.

One point in the spec's favour is worth recording. Canon 9.2.8 requires that
`sum over u of b_u(n) = 1`. That constraint is exactly what makes the spec's
two expressions for C1 algebraically identical, so the spec's formula is
internally consistent with the canon's basis rule even though the spec predates
it.

## Modelling assumptions

These are choices, not findings. They are recorded so a reader can disagree
with them.

**Identity is a harder dependency in the federated estate than in the
concentrated one.** The conditional failure probability on an identity edge is
0.45 to 0.7 in the concentrated estate where the use case's system of record is
a suite that holds its own session, and 0.9 to 1.0 otherwise; in the best of
breed estate it is 0.94 to 1.0 everywhere. The reasoning is that a small number
of large suites carry their own session and transaction state, so an identity
outage gates new sign-in rather than work already in flight, whereas in a
federated estate every hop crosses a service boundary and re-presents a token.

No acceptance check depends on this assumption. Acceptance 5 holds without it:
in the best of breed estate the API gateway alone reaches 276,530 units of
monthly volume at risk against the largest platform's 170,211, and the
gateway's band is the same in both shapes. Acceptance 3 is evaluated by the
Monte Carlo and is reported when that lands.

**The outage fraction is drawn per run** from a Beta(2, 14), mean about 0.125,
rather than being a constant as spec section 6 writes it. Canon's first reading
rule is that nothing here is a single number.

**Margin per unit and headcount per subdomain are invented.** They exist to
give the risk axis a monetary scale and to give the prohibited by-headcount
rule something to be prohibited about.

## What survives, and what does not

Canon 9.8.4 lists what remains usable once the total is refused: ranking within
one axis, pairwise comparison within one axis, and per-axis aggregation by a
named method. This tool does the first two and refuses the rest. There is no
exchange rate between a monthly cost, an annual loss distribution and a
horizon-dependent option value, and none is constructed here.

For sources, see the Ledger paper.
