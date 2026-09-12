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

## How to deploy

See DEPLOY.md. Three routes, all of them uploading one file. The only thing that
matters is that it is served over http or https rather than opened from disk.

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

## The guided tour

Seven steps, at `#/tour/1` to `#/tour/7`, with an intro before them at
`#/tour/0`. The tool stays live underneath the whole way: every step asks you
to touch something, and Next is never disabled.
Where a step asks for an action, a tick appears once you have done it, and that
is all the tick does. Nobody is held at a step.

Each step drives the tool only through the store. Nothing in `src/tour/` reaches
into a view, which is the reason the store exists at all.

| step | view | what it does when it opens | what it watches for |
|---|---|---|---|
| 0 | Explore | the title card over an empty canvas; the estate assembles in five beats behind it | nothing; Continue and Skip |
| 1 | Explore | flies to the identity node, selects it, hulls on | you select a different platform |
| 2 | Fixed pool | selects identity, then animates three riders on over 1.5s | you change the basis or the slider |
| 3 | Risk | fails identity, waits 2s, then sets the subdomain | you fail a different node |
| 4 | Risk | sweeps dependence 0 to 1 and back to 0.5 | you move the dependence slider |
| 5 | Footprint | selects the cloud data platform, runs the month cursor from 0 up to the ratification marker | you move either month control |
| 6 | Two shapes | nothing; both estates are already on screen | nothing |
| 7 | closing card | nothing | nothing |

Every GBP figure in a tour sentence is read from the running tool through
`fill()`, never typed into the copy deck. The dependence range in step 4 is the
range the figure actually covered while the slider swept, collected as the
results arrived, not a stored pair.

A step's `waitFor` is armed only after that step's own animations have finished,
and the state it compares against is read at that moment. Otherwise step 4 would
congratulate you for the slider it is moving itself.

Step 5 does not move the ratification marker. The marker is the month the board
ratified the node, month 31; the node was adopted in month 17. The fourteen
months between the two are the whole step, and an earlier version of it set the
marker to the adoption month, which closed the gap and left the step showing
nothing. The execution figure the card quotes is pinned to the marker, not to
wherever the cursor has been dragged, because the sentence says "at that month"
and means the marker.

The intro is step 0. "Start the tour" opens view 1 with the rail, top bar and
panel faded out and the whole estate dimmed to nothing behind the title card.
Five beats follow, each a sentence with a live figure: the business and its use
cases light up, coloured by subdomain with the hulls on; then the platforms;
then the lines between them; then the connector nodes; then the camera flies
to the busiest node and its halo lights. The card dissolves, the chrome fades
in, and step 1 begins on the same graph, which has been there throughout. It
runs on view 1's own Graph3D, so nothing is laid out twice. Beats advance on
their own every 3.4 seconds; Continue and Skip are always there; under reduced
motion there is no clock and the estate is shown whole with the last sentence.

Each step dims everything except the parts it is about and puts a short label
beside each bright part, so the dimmed screen says what it is pointing at. A
step names its targets by `data-tour` attribute; step 1 asks for the selected
node instead, whose screen position the graph already publishes. The spotlight
is an SVG mask under the card with `pointer-events: none` throughout, so the
tool stays live under the dimming, which is the premise of the tour.

Under `prefers-reduced-motion` the camera cuts instead of travelling and every
animated value is applied at once.

## Reading the words on screen

Every term of art on a screen is marked with a dotted underline and gives a one
line definition on hover or keyboard focus. They live in `glossary` in
`src/copy.ts` under the same rules as the rest of the deck: no jargon inside a
definition, no sentence over twenty words, two sentences at most, and say what
it means for the reader rather than how it is computed.

The screen's name in the top bar carries a line on what that screen is for, from
`viewPurpose`. That is the first thing somebody landing cold needs, and the top
bar is the one place on every screen where it fits without taking room from the
graph.

These are hover hints, not documentation, and they are not the tour. The tour
makes the argument; this is so the words mean something to somebody who opened
the tool without one.

## The summary at the head of every panel

Every screen exists to show one thing, and the panel used to open straight into
the figures without saying what that thing was. It now opens with three lines:
a headline with the live figure in it, then the same point read two ways.

"The number" is the reading for somebody who thinks in money and wants to know
what it costs and what it exposes. "The mechanism" is the reading for somebody
who thinks in structure and wants to know why. Neither is labelled by who it is
for. The lens is named; the reader is not.

The deck is `summary` in `src/copy.ts`. Every figure in it is live through
`fill()`, never typed into the deck. No sentence is over twenty words. There is
no estate wide total anywhere in it, and the option component is named only in
the same sentence as the refusal to state it, which is the rule for that figure
everywhere else in the tool.

View 1 now has a panel with nothing selected, carrying the estate read at a
glance: counts and a range, never a total.

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

### 26. The tour quotes the execution component and not the option component

Spec section 6 treats the two parts of a switching cost together. The tour card
is a small overlay with three sentences on it and no room for the refusal text
that the option component has to travel with, so step 5 quotes the execution
work of leaving and stops there. This is the same call already recorded for the
view 4 ratification sentence, applied to the tour: the option component appears
only in the detail panel, inside the same element as the sentence refusing to
state it without an evidenced counterfactual, so no screenshot can separate them.

### 27. The tour has a development-only handle on the store

Acceptance T3 has to perform each step's asked-for action by script. Two of
those actions, selecting a node and failing a node, exist in the interface only
as a click on a WebGL canvas with no addressable target, and guessing at pixel
coordinates would make the check a test of the layout rather than of the step.

So `window.__ledger` exposes the store, guarded by `import.meta.env.DEV`. It is
present in the development server the acceptance suite runs against and absent
from `dist/index.html`. Checked: grepping the built bundle for `__ledger` returns
nothing.

### 28. Acceptance check 7's word list is split in two

Check 7 greps the built bundle. Three of the words the tour brief adds cannot be
checked that way: `seamless` is an HTML attribute name and appears once inside
React's attribute table, in a space-separated list of identifiers. Failing the
build on that would be failing it on a word nobody wrote.

`leverage`, `seamless` and `journey` are therefore counted in our own source,
and both counts are printed, the same way check 7 already prints the
case-sensitive and case-insensitive counts for TCO so that the passing grep is
not the one chosen after the fact. `infonomics` stays in the bundle grep, where
it belongs: that one is about what the file must not contain, not about writing.

### 29. Acceptance check 1 is measured against the built file

Spec section 10 asks for a cold start under three seconds and does not say
against what. It had been measured against the Vite development server, which
transforms every module on first request. That is slower than the product and
noisier than it: on a busy build machine the same bundle measured 3,092 ms in
one run and 1,424 to 1,569 ms across six runs when nothing else was going on.

It is now measured against `dist/index.html`, served over http, which is the
file people load. Three runs are taken and the slowest counts. The development
server figure is still measured and printed beside it, so the basis of the
verdict was not chosen after the fact.

### 30. The detail panel takes layout space rather than covering the graph

The panel was absolutely positioned over the canvas, so on every screen with a
panel open about a third of the estate sat behind it and the picture could never
be seen whole. Above the phone breakpoint the canvas now ends where the panel
begins, and the graph re-frames itself into the space it actually has.

Below 720px the panel is still a bottom sheet that overlays, because it is
draggable there and resizing a WebGL canvas on every frame of a drag costs more
than the pixels it returns. The sheet collapses to a tab instead.

### 31. The graph re-frames on resize, until the viewer takes the camera

Framing happened once, on the first settle. Opening a panel or turning the split
then left the graph framed for a box that no longer existed, drifting off to one
side. It now re-frames when the canvas changes size, with two conditions: the
force simulation must have settled already, and nobody must have orbited yet.

The first condition is not caution. Fitting while the simulation is still
spreading the nodes frames an estate a fraction of its final size, and the graph
ends up zoomed deep into the middle of itself. That is what the first attempt
did. The second condition is the rule that once somebody has moved the camera,
the camera is theirs.

### 32. View 5 names its hub nodes and states its own headline

View 5 drew both estates with `labelMode="none"`, which left two grey clouds
that looked alike, with nothing on screen saying what to compare. A reader could
not tell whether they were looking at a comparison or a bug.

Three changes. A `hubs` label mode names any node carrying eight or more use
cases, so the difference is readable without naming all forty-six. Each half
carries its own headline, computed rather than written: the busiest node, how
many use cases ride it, and how many nodes carry eight or more. And a line under
the top bar says what to compare before anything else is read.

The split also turns: side by side for shape, stacked when the node names are
the thing being compared and each estate wants the full width.

### 33. One value describes the chrome the canvas must not draw under

Deviation 30 gave the detail panel its own space by insetting the canvas, and
the tour card did the same thing separately. Both were written for a screen with
one graph on it, and view 5 has two: the inset meant for a single canvas was
applied to each half, so with the tour open the right hand estate collapsed to
nothing and the panel sat on top of what was left.

`--chrome-right` and `--chrome-bottom` now say how much of each edge is taken,
in one place, and the two layouts consume the same value differently. A single
graph is positioned absolutely and takes it as an inset. The split view is a
grid and takes it as padding, with each half resetting the value to zero so it
fills what is left rather than insetting again inside an area that already
accounts for it. The panel takes the bottom value too, so a bottom anchored tour
card does not cut it off mid sentence.

The tour card only takes a column of its own above 1400px, where there is room
for two graphs, the panel and the card. Below that it anchors to the bottom, as
it already did on a phone.

### 34. The tour is reachable from every screen

It could only be started from the front page, so once somebody had begun
exploring there was no way back to it. There is now a Tour control at the foot
of the view rail.

It carries `aria-pressed`, not `aria-current`. `aria-current` marks the current
item in a set, and the set in that rail is the six views; marking the tour that
way announced two rail items as the current view at once. The acceptance suite
found it, as a query for the current view that matched two elements.

### 35. The layout clears the tour card's measured height, not its ceiling

Below 1400px the tour card anchors to the bottom, and the canvas and panel end
where it begins. They were ending where it was *allowed* to begin: the layout
reserved `--tour-card-h`, which is the card's maximum height at 46 percent of
the window, rather than the height it actually had. On a tall window a card
three lines high left a dead band the height of half a screen between the graph
and the card.

The card now measures itself and publishes `--tour-card-actual-h` as it
renders, the same way the bottom sheet publishes its height. The layout clears
that, falling back to the ceiling only until the first measurement lands. The
ceiling stays as the cap on how tall the card may grow; it is no longer what
anything else is laid out against.

### 36. Acceptance T6 measures whether the canvas fills its space

Three layout regressions in a row reached the owner by screenshot: a panel
covering the graph, a split half collapsed to nothing, and a dead band half a
screen deep between the graph and the tour card. Nothing failed, because
nothing measured whether the canvas actually filled the space it was given. T2
checks that the card never covers a node; T1 checks the tour walks; neither
looks at the canvas itself.

T6 does. For every canvas, on eight routes, at three widths: it must be at least
260px on each side, it must end where the panel begins rather than run under
it, and where the tour card is anchored to the bottom the canvas must end within
2px of the card's top edge.

### 37. View 4 keeps its panel when the cursor is before adoption

The panel body was gated on the node existing at the cursor month. Drag the
month cursor below the adoption month and the whole body unmounted, the
scrubber being dragged included, and the dim set flipped from everything to
nothing, which read as the graph glitching. The tour's step 5 made this easy
to hit: it animates the cursor upward from month 0, and the natural next move
is to drag it back.

`at()` still returns null before adoption so the charted lines start where the
node does, but the panel reads through a zero state that never unmounts. The
controls, the charts and the dimming are continuous across adoption; the
figures say "not adopted yet" instead of disappearing, and the option block
appears only once there is something to hold an option on.

### 38. The tour opens with an intro at step 0

The tour brief's B1 sends "Start the tour" to `#/tour/1`. It now goes to
`#/tour/0`, an intro in which the estate assembles behind the title card before
step 1 begins. Requested by the owner after the first walk through.

Two things were needed to do it without a second layout. The intro runs inside
view 1 on view 1's own Graph3D, driven by the existing `dimNodes` prop and a
new `hideLinksOf` prop that keeps a line from giving away a node that has not
arrived yet; dimming alone leaves the lines. And the store gained nothing: step
0 is `tourStep === 0`, which App reads to hide the chrome and the tour card
reads to render nothing. The relaunch control in the rail also starts at 0,
since the intro is the opening of the tour, and it is one press to skip.

Acceptance T7 walks it on Continue alone and checks the chrome is hidden while
it runs, every beat resolves its figure, and the last Continue lands on step 1
with the chrome back and the card on 1 of 7.

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
| 1 | cold start under 3s laptop, 6s phone | PASS | Built file: desktop 1,536 / 1,392 / 1,424 ms, worst 1,536. Mobile emulation 1,278 ms. Dev server printed for comparison and not the basis. |
| 2 | one human completes the tour unaided and can say the five ideas back | NOT RUN | Needs one real human. Cannot be run from a container. Replaces the spec's check 2, per the tour brief B5. |
| 3 | non-additivity exhibit | PASS | As restated. (a), (b) and (c) all hold; (c) exactly. |
| 4 | ratification sentence computed, changes when dragged | PASS | Months 24 and 48 differ, and it is not the spec's hard-coded 2.4m example. |
| 5 | largest blast radius on the right-hand graph is integration | PASS | Okta, integration, on both sides. |
| 6 | equal split changes nothing, by-headcount changes figures | PASS | Equal split, driver-proportional and by volume all unchanged; by headcount moved 95 figures. |
| 7 | forbidden strings in the bundle | PASS | TCO 0 case-sensitive; "total cost" 0, "true cost" 0, "snowflake" 0, "infonomics" 0; em-dash 0, en-dash 0. |
| 8 | every view carries the footer | PASS | 6 of 6. |
| 9 | README explains the estate, formulas, coefficients, and is not a measurement | PASS | 47.5 KB. |
| T1 | tour walks steps 1 to 7 on Next alone | PASS | 7 cards, every placeholder resolved, no page errors. |
| T2 | on 390 by 844, the card never covers the node the step is about | PASS | 5 steps have a selected node on screen; none of the five is under the card. Steps 6 and 7 select nothing. |
| T3 | each waitFor fires on the action it describes | PASS | 5 of 5 fired. Step 6 has no waitFor by design. |
| T4 | deep link to one step cold-loads into it | PASS | #/tour/5 opens on step 5, view Footprint, Meridian Data Cloud selected, no page errors. |
| T5 | forbidden words in our own writing | PASS | "leverage" 0, "seamless" 0, "journey" 0 in our source. Bundle counts 0, 1, 0; the one hit is React's HTML attribute table. |
| T6 | every canvas fills the space it is given | PASS | 30 canvases across 8 routes and 3 widths: all sized, none under the panel, none short of the card. |
| T7 | the intro assembles the estate and hands over to step 1 | PASS | Started at #/tour/0 with chrome hidden; five beats resolved; ended at #/tour/1 with chrome back and the card on 1 of 7. |
| C3 | nothing on the page links to another site | PASS | 0 offsite links across 8 routes. The bundle mentions 5 hosts, none rendered: 4 are vendored library internals, the fifth is the unset Medium placeholder, which is why that line is not drawn. |
| - | no page errors across all six views | PASS | none |
| - | dist is one self-contained file, no runtime network calls | PASS | 1.76 MB, 0 offsite requests. |

**18 pass, 0 fail, 1 not run.**

On check 7: a case-INSENSITIVE grep for "TCO" hits the bundle 81 times, every one
of them inside an ordinary identifier such as `currentColor`, `getComponent`,
`OrbitControls` and `outputColorSpace`. TCO is an acronym and is checked
case-sensitively; the prose phrases are checked case-insensitively. The grep
that passes was not selected after the fact: both counts are printed.

On check 1: the figure is measured against the built file, because that is what
people load. The development server is measured too and printed beside it, but
the verdict does not rest on it: it transforms every module on first request, so
it is both slower than the product and noisier, and a number that moves with how
busy the build machine is measures the machine. Three desktop runs are taken and
the slowest counts. Both numbers are printed so the basis was not chosen after
the fact.

The mobile figure is Chromium emulation at a 390 by 844 viewport, which is not a
mid-range phone and is faster than one. It is labelled as emulation wherever it
appears.

On T2: the check does not reason about where the card is. The canvas is inset by
the card's footprint, so a node cannot be rendered under the card at all, and
the check measures the selected node's actual screen position against the card's
actual rectangle to confirm it. Five of the seven steps have a selected node on
screen; steps 6 and 7 do not select anything.

On T3: a step's waitFor is armed half a second after its own animations were
asked to finish, not on the millisecond. The frame that writes an animation's
final value lands a tick or two after its deadline, and arming on the exact
millisecond read that frame as the viewer moving the slider. Steps 2 and 5 both
failed that way before the grace period was added, which is what the check is
for.

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

Results are cached in memory by the arguments that produced them, because two
things now ask for the same run: the view on screen, and the tour card, which
has to quote a live figure in a sentence. Without the cache each would start its
own worker and each would pay for the same 10,000 runs. The simulation is
deterministic in its seed, so a result is the same result whoever asked for it.
The cache holds 64 entries, which is more than the dependence slider's twenty
stops across both estates.

The bundle is 1.85 MB, about 520 KB gzipped. 147 KB of that is the stored runs
described in deviation 22, imported as text and parsed only if the worker fails.
Cold start on a 1440 by 900 desktop viewport is about 2.6 seconds, against the
3 second limit in acceptance check 1.

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
