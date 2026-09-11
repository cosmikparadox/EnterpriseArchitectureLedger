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
of freedom, declared on screen. The rho slider itself is unchanged; one of its
endpoint labels had to change, for the reason given below.

One consequence is worth stating because it changes what an endpoint means.
Spec section 6 reads "rho = 0 independent, rho = 1 comonotonic", which is true
of a Gaussian copula. Under a Student-t copula the platforms share a single
chi-square denominator, and that shared term is precisely the tail dependence
canon 9.3.8 asks for. At rho = 0 the platforms are therefore UNCORRELATED but
NOT INDEPENDENT: they still fail together in the tail more often than chance.
The slider's low endpoint was relabelled because of this, and now reads
"platforms fail without correlation". See deviation 13. The tool does not claim
independence anywhere.

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

### 11. Acceptance check 3 replaced

Recorded at the owner's direction. The spec's 20 percent threshold was arbitrary
and is withdrawn, on the reason that the canon makes a directional claim and not
a magnitude claim. The replacement criteria and the observed results, including
the one criterion that is not met, are set out in full under "Acceptance check
3, replaced" below.

### 12. Acceptance check 3(c) restated

The first replacement criterion required the gap to close to within 2 percent of
zero at rho = 1.0. It does not; it closes to 5.4 percent. The criterion was
wrong rather than the model: it applied a comonotonicity condition to platform
failures, which is what rho controls, when the canon applies that condition to
the losses being summed. Restated at the owner's direction as a minimum across
the rho sweep plus a stripped diagnostic run, both of which hold, the second one
exactly. Set out in full under "Acceptance check 3, replaced".

### 13. The rho slider's low endpoint is relabelled

Spec section 4.3 labels the endpoints "platforms fail on their own" to
"platforms fail together". Because deviation 1 replaced the Gaussian copula with
a Student-t, the low endpoint no longer means independence, and the original
wording asserted something false. It now reads "platforms fail without
correlation", with a tooltip: "Under the t copula the extremes still move
together even at zero correlation. That is deliberate. See 9.3.8."

### 14. Secondary loss is not modelled

Canon 9.3.1 corrects the FAIR loss magnitude to `LM = LM_primary + (SLEF * SLM)`,
where the secondary loss event frequency is a conditional probability that the
knock-on happens at all. The spec's section 6 risk model carries only a primary
direct loss per platform and a business-interruption loss per use case. No
secondary term is modelled.

**Scope note.** The secondary term is absent, and the loss figures this tool
reports are therefore UNDERSTATED relative to the structure canon 9.3.1
specifies. This is a simplification of the canon rather than a contradiction of
it. It will not be modelled: the exhibit view 3 exists to show is the
non-additivity of correlated losses, and a secondary term would scale the
figures without changing that result.

### 15. three.js is r185, not the pinned r160

The build plan pinned three.js 0.160. 3d-force-graph 1.73.4 depends on
`three: ">=0.118 <1"` and npm resolved a nested copy at 0.185.1 alongside it, so
two copies of three were live in one page: objects built against r160 were being
rendered by r185's renderer, which calls `Matrix4.determinantAffine`, a method
r160 does not have. Every frame threw.

Resolved by moving the project to three 0.185.1 and @types/three 0.185.0 so
there is exactly one copy, with `resolve.dedupe: ['three']` in the Vite config as
a guard against it recurring. This is a deviation from the pinned version in
PLAN.md rather than from the spec, which names three.js without a version.

### 16. The build is a single file

Spec section 2 asks for "One index.html plus assets". The production build
inlines all JavaScript and CSS into `dist/index.html` via vite-plugin-singlefile,
so there are no separate assets at all. This is a stricter reading of the same
requirement: the file opens from a folder with no toolchain, and it has been
verified in a browser to make zero network requests at runtime.

### 17. The subdomain ceiling and its censoring rule do not apply

Canon 9.3.4 requires a subdomain valuation ceiling to be treated as explicit
censoring, with the mass at the boundary reported, and canon 9.9 refuses the
tail statistics where that cap binds in more than about one percent of
simulations. This tool applies no ceiling, so nothing is censored and the rule
has nothing to bind on. The censoring rate that canon 9.8.2 lists as a required
reported field is therefore reported as not applicable rather than as zero.

### 18. The two footprint lines are two charts, not two lines on one axis

Spec section 4.4 asks for a chart showing "what the bill showed" against "what
it committed you to" as two lines on the same time axis. Those two quantities
are not commensurable. Metered spend and the rule share are GBP PER MONTH; the
execution component of leaving is a ONE-OFF GBP figure, and on this estate it is
roughly a hundred times larger. Drawn on one y axis the monthly pair flattens
onto the baseline and reads as zero, and the drawing implies the two figures can
be compared.

They are drawn as two charts stacked on a SHARED TIME AXIS, sharing the
ratification marker and the scrubber, each labelled with its own unit. The
spec's two labels are kept verbatim. The lesson is unchanged and the chart no
longer implies a comparison the units do not support.

### 19. View 4 plots the execution component, not the exit cost

Spec section 4.4's third readout is "Exit cost: execution + option". Canon 9.5.7
and 9.9 refuse the option component without an evidenced counterfactual, and the
owner's constraint is that it never renders as a bare number anywhere. A chart
line of execution plus option would render it, and a screenshot of that line
would carry the figure away from its refusal.

The chart therefore plots the EXECUTION component alone, labelled as such. The
option component appears only inside the refusal block in the panel, together
with its W(K) curve. The ratification sentence quotes the execution component as
its only hard figure and states the other half in words: "plus an option
component the ledger would refuse to state without an evidenced counterfactual".

### 20. View 5's expectations are reported, not asserted, and two of them do not hold

Spec section 4.5 predicts what the side-by-side readouts will show. Three of its
five predictions hold on the generated estates and two do not. The view reports
what the data says rather than the prediction.

**Holds.** Rule share of reported cost is higher on the concentrated side in
five of six subdomains, and it is spread across more nodes on the best of breed
side. The highest single-node figure falls from 97.1 percent (Salesforce
Marketing Cloud) to 83.5 percent (Customer portal).

**Holds.** The largest blast radius on the best of breed side is an integration
node, which is acceptance check 5.

**Does not hold: "left cheaper, usually" on per-unit metered cost.** The
concentrated side is cheaper in three of six subdomains and dearer in three.
Data and Analytics is dearer on the concentrated side by a factor of eight.

This table does not move with rho. Metered spend is a cost figure and the
dependence slider changes only the loss distribution, so there is no snapshot to
date here.

| per-unit metered cost | concentrated | best of breed |
|---|---|---|
| Sales and Distribution | GBP 1.073 | GBP 1.166 |
| Claims | GBP 1.459 | GBP 1.585 |
| Finance | GBP 2.374 | GBP 2.150 |
| Customer Service | GBP 0.898 | GBP 0.874 |
| People | GBP 1.210 | GBP 1.770 |
| Data and Analytics | GBP 8.392 | GBP 0.998 |

**Does not hold: "left fatter tail" on joint P99 loss.** The best of breed side
has the HIGHER joint P99 in all six subdomains, at rho = 0.5.

This table is a snapshot at rho = 0.5. Since views 3 and 5 now share one
dependence slider, view 5 can be read at any rho and these figures are the
values at the midpoint, not fixed properties of the two estates.

| joint P99 loss, at rho = 0.5 | concentrated | best of breed |
|---|---|---|
| Sales and Distribution | GBP 361,290 | GBP 418,024 |
| Claims | GBP 203,758 | GBP 261,507 |
| Finance | GBP 150,511 | GBP 197,060 |
| Customer Service | GBP 217,837 | GBP 241,969 |
| People | GBP 4,831 | GBP 6,740 |
| Data and Analytics | GBP 11,859 | GBP 12,391 |

The mechanism is visible in the graph. In the best of breed estate every use
case routes through all four integration nodes at a high conditional failure
probability, so more use cases are interrupted by the same event and the joint
tail is heavier. Diversifying the platforms did not thin the tail; it moved the
thing that drives the tail into the integration layer, which is the view's
lesson stated more sharply than the spec expected. Nothing was tuned to produce
this.

### 21. View 6 moves use cases by selection, and does not split subdomains

Spec section 4.6 asks the user to "drag use cases from one subdomain hull to
another, or merge two subdomains, or split one".

Dragging a node between overlapping translucent hulls in a 3D scene is
imprecise with a mouse and worse with a thumb, and the hulls overlap by design.
A use case is therefore selected, by tapping it in the graph or picking it from
the list, and reassigned from a menu. The effect on the decomposition is
identical.

Merge is provided. Split is NOT, and the reason is in the spec itself: splitting
a subdomain needs a rule for which use cases go which way, and any rule the tool
supplied would amount to the tool proposing a placement. Section 4.6 says
plainly, "Do NOT imply that some boundary placement is correct. There is no
correct placement in this tool." A split can be performed by moving the
individual use cases, which leaves the choice with the person making it.

### 22. Views 3 and 5 fall back to stored runs when the browser blocks the worker

Spec section 2 asks for a folder that opens and works with no toolchain, and the
same section asks for the Monte Carlo to run in a Web Worker. The two do not
hold together. Opened as a `file://` URL, browsers refuse to start a module
worker from a blob, and they do it silently: nothing is thrown, nothing is
logged, and views 3 and 5 sit on a spinner forever with a clean console. Views
1, 2, 4 and 6 are unaffected because they do no Monte Carlo.

`npm run generate` therefore bakes ten runs into the bundle: both estates at
rho = 0, 0.25, 0.5, 0.75 and 1.0, at 10,000 runs, on the same seeds the live
call sites use (20260905 for view 3 and the left panel of view 5, 20260906 for
the right panel). `useMonteCarlo` pings the worker once on startup and, if no
answer comes back inside 2.5 seconds, serves the stored frame nearest the
slider's rho and says so on screen. The ping matters: a 100,000 run request
takes seconds, and without a handshake a slow run would be indistinguishable
from a worker that was never allowed to start.

What is lost offline, and is stated on screen: the figures are 10,000 runs at
one of five rho values rather than a live run at the exact slider position, and
the 100,000 run button is disabled.

The frames are stored packed, not as result objects. Written out in full they
are 196 KB each. Dropping the repeated keys, rounding each GBP figure to the
pound, replacing each exceedance probability with its index into the fixed
sampling grid, and dropping the use case exceedance curves (no view reads them;
the percentiles that feed the non-additivity gap are kept) brings a frame to
14.9 KB. Ten frames are 145 KB of data and the bundle grew by 147 KB, inside the
200 KB budget the owner set, so all five rho points were kept.

The data is imported as text and parsed on first use rather than imported as
JSON. Imported as JSON the bundler emits 145 KB of object literals that every
visitor parses at startup for data almost nobody needs, and acceptance check 1
went from passing to 3,247 ms against a 3,000 ms limit. Parsed lazily it is
2,401 ms.

### 23. One function owns the option engine seed

Spec section 6 does not say where the Monte Carlo seed for the option component
comes from. View 1 and view 4 both show an option component for the same
platform, and each seeded its own generator from a different expression of the
platform id: `DetailPanel` hashed the id, `Footprint` used the id's length times
a constant. The figure is a Monte Carlo estimate under canon 9.5.5 and not a
closed form, so the two screens quoted different numbers for the same node.

`optionEngineFor` in `src/model/ledger.ts` is now the only way to build the
engine and call sites do not pass a generator. `npm test` reproduces what each
call site does and asserts the two agree exactly for every platform, and asserts
that the old per-call-site seeds did in fact disagree, so the test would fail if
the seeding were quietly reintroduced.

### 24. One Graph3D shared across views was proposed and not built

The tour brief asked for a single Graph3D instance kept mounted across views 1,
2, 3, 4 and 6, so the camera does not jump when the tour walks between them. It
is not built, by agreement with the owner, and the alternative in the same brief
was built instead: the force layout is seeded, so every view settles into the
same shape and a walk between views lands on a graph that looks the same even
though it is a different instance.

The reason is what sharing would cost. Each of those five views drives the scene
differently: view 2 supplies a ring accessor per node, view 3 supplies a failed
node, a lit link set and a dim set, view 4 dims by adoption month, view 6 recolours
by boundary move. Shared, all of those become props on one instance whose
lifetime matches no view, so every view has to remember to clear the props it
does not use and the next view has to trust that it did. View 5 is the part that
makes it worse: it mounts two more graphs alongside the shared one, so the saving
is three instances rather than six, for the cost of a scene whose state belongs
to nobody.

What is lost is real and worth naming: switching views still rebuilds the scene,
so the camera returns to the framed default rather than staying where it was.

### 25. The force simulation is stopped by tick count, not by elapsed time

Not in the spec either way. `3d-force-graph` stops the simulation after 15
seconds of wall time by default, which means how far it settled depends on the
frame rate of the machine it ran on, and two loads of the same estate produce
two different shapes. Seeding the starting positions, which is what A4 asked
for, fixes half of it and leaves the other half moving.

The cooldown is now 300 ticks with no time limit, 300 being where d3's default
alpha decay reaches its floor. With both halves fixed the settled layout is
byte-identical across loads: three loads in a row hash to `e79b104d`. The digest
is published on the document root after the graph comes to rest, which is how
that is checked.

## Acceptance check 3, replaced

The spec's acceptance 3 required a gap of at least 20 percent between the two
P99 figures for at least three of six subdomains at rho = 0.5. The first build
met it, but by the smallest possible margin: exactly three subdomains cleared
the line and the third cleared it by a hair, on a figure that moves with the
seed and the run count.

The threshold has been withdrawn by the owner and replaced, on the reasoning
that canon 9.8.3 result two makes a DIRECTIONAL claim and not a magnitude one:

> VaR_q( sum of L_u ) = sum of VaR_q( L_u ) ONLY under comonotonicity.

Nothing in the canon licenses any particular size of gap. The replacement is:

```
(a) at rho = 0.5, the sum of per-use-case P99s exceeds the joint
    P99 in all six subdomains
(b) for each subdomain the gap is monotonically non-increasing as
    rho steps 0, 0.25, 0.5, 0.75, 1.0, within Monte Carlo noise
    at 100k runs
(c) at rho = 1.0 the gap is within 2 percent of zero
```

Observed, at 100,000 runs on seed 424242:

| subdomain | rho 0.00 | rho 0.25 | rho 0.50 | rho 0.75 | rho 1.00 |
|---|---|---|---|---|---|
| Sales and Distribution | 25.6% | 22.1% | 18.6% | 15.7% | 6.7% |
| Claims | 37.1% | 30.6% | 25.3% | 17.0% | 7.3% |
| Finance | 23.7% | 20.7% | 19.4% | 14.1% | 7.4% |
| Customer Service | 21.9% | 17.8% | 15.9% | 11.2% | 2.0% |
| People | 21.9% | 19.4% | 17.8% | 12.3% | 6.3% |
| Data and Analytics | 14.1% | 13.1% | 10.6% | 7.8% | 2.8% |

And in GBP at rho = 0.5:

| subdomain | sum of per-use-case P99s | P99 of joint loss | gap |
|---|---|---|---|
| Sales and Distribution | 432,795 | 364,891 | 18.6% |
| Claims | 253,165 | 202,097 | 25.3% |
| Finance | 179,889 | 150,607 | 19.4% |
| Customer Service | 247,809 | 213,805 | 15.9% |
| People | 5,677 | 4,821 | 17.8% |
| Data and Analytics | 12,027 | 10,870 | 10.6% |

**(a) holds.** The sum exceeds the joint in all six subdomains.

**(b) holds.** Every subdomain declines monotonically across all five steps,
with no step needing the noise allowance at all. The allowance is declared at
0.02 absolute on the gap ratio, as an operating convention rather than a derived
threshold, in the sense canon 9.3.4 uses for its one percent censoring rule.

**(c) as originally written was not met, and has been restated.** At rho = 1.0
the mean gap is 5.4 percent, not 2 percent.

The reason is that the original criterion applied a comonotonicity condition to
PLATFORM FAILURES, which is what rho controls, whereas canon 9.8.3 applies that
condition to THE LOSSES BEING SUMMED. Those are not the same object. Each use
case is a different random function of the same failure vector, so comonotonic
platform failures do not produce comonotonic use-case losses. Two random sources
survive rho = 1 and neither is under rho's control: the per-edge propagation
draw that spec section 6 specifies as `Uniform() < conditional_failure_prob`,
and the loss magnitude.

The restated criterion is:

```
(i)  the gap is at its minimum across the rho sweep, for
     every subdomain
(ii) with edge conditional failure fixed at 1 and loss
     magnitude fixed at its median, the gap is within
     2 percent of zero
```

**(i) holds.** rho = 1.0 is the minimum for all six subdomains, by a wide
margin: the next-lowest column, rho = 0.75, is roughly double it everywhere.

**(ii) holds, exactly.** The stripped run at rho = 1.0, over 50,000 runs, with
edge conditional failure fixed at 1 and every loss magnitude fixed at its median
(the platform direct loss at exp(mu), the outage fraction at the median of its
Beta):

| subdomain | sum of per-use-case P99s | P99 of joint loss | gap |
|---|---|---|---|
| Sales and Distribution | 246,732 | 246,732 | 0.00% |
| Claims | 148,330 | 148,330 | 0.00% |
| Finance | 111,343 | 111,343 | 0.00% |
| Customer Service | 137,248 | 137,248 | 0.00% |
| People | 3,671 | 3,671 | 0.00% |
| Data and Analytics | 6,921 | 6,921 | 0.00% |

Not approximately zero. Zero. Once the losses being summed are genuinely
comonotonic, the quantile of the sum equals the sum of the quantiles to the last
digit, which is canon 9.8.3 result two and canon 9.3.8's exact-additivity
statement for comonotonic risks, reproduced from the simulation rather than
assumed.

**This stripped run is a diagnostic.** It exists to show that the machinery is
correct and that the residual gap in the shipped model comes from the two
sources named above rather than from an error. It is not reachable from the
interface, and no figure from it appears on screen. The switch that produces it
is `SimOptions.fixedMagnitudes` in `src/model/ledger.ts`.

Nothing has been tuned at any point in this exercise.

## Acceptance, spec section 10

Run with `npm run acceptance`, against the built bundle and a real browser.

| # | check | result | evidence |
|---|---|---|---|
| 1 | cold start under 3s laptop, 6s phone | PASS | desktop 2,151 ms; mobile emulation 919 ms. Emulation is not a mid-range phone. |
| 2 | executive finds the fan-in slider unaided | NOT RUN | Needs one real human. Cannot be run from a container. |
| 3 | non-additivity exhibit | PASS | As restated. (a), (b) and (c) all hold; (c) exactly. |
| 4 | ratification sentence computed, changes when dragged | PASS | Months 24 and 48 differ, and it is not the spec's hard-coded 2.4m example. |
| 5 | largest blast radius on the right-hand graph is integration | PASS | Okta, integration. |
| 6 | equal split changes nothing, by-headcount changes figures | PASS | Equal split, driver-proportional and by volume all unchanged; by headcount moved 95 figures by up to GBP 3,497. |
| 7 | forbidden strings in the bundle | PASS | TCO 0 case-sensitive, "total cost" 0, "true cost" 0, "Snowflake" 0, em-dash 0, en-dash 0. |
| 8 | every view carries the footer | PASS | 6 of 6. |
| 9 | README explains the estate, formulas, coefficients, and is not a measurement | PASS | 26.7 KB. |
| - | no page errors across all six views | PASS | none |
| - | dist is one self-contained file, no runtime network calls | PASS | 1.59 MB, 0 offsite requests. |

**10 pass, 0 fail, 1 not run.**

On check 7: a case-INSENSITIVE grep for "TCO" hits the bundle 81 times, every one
of them inside an ordinary identifier such as `currentColor`, `getComponent`,
`OrbitControls` and `outputColorSpace`. TCO is an acronym and is checked
case-sensitively; the prose phrases are checked case-insensitively. The grep
that passes was not selected after the fact: both counts are printed.

On check 1: the mobile figure is Chromium emulation at a 390 by 844 viewport,
which is not a mid-range phone and is faster than one. It is labelled as
emulation wherever it appears.

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

## Performance

The Monte Carlo runs in a Web Worker so the 3D view keeps its frame rate.
Measured in Chromium 141 in an actual worker, on seed 20260905, with the
concentrated estate:

| runs | wall ms | worker ms |
|---|---|---|
| 10,000 | 237 | 232 |
| 10,000 | 248 | 245 |
| 10,000 | 240 | 236 |
| 100,000 | 2,598 | 2,595 |

Two runs at the same seed produce identical subdomain P99s. `npm run bench`
reproduces this.

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
