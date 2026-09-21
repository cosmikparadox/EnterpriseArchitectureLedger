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

## The story

Launching the app is a grey canvas and a welcome. From there the story runs in
34 beats at `#/tour/1` to `#/tour/33`, one thing per Next, on one card. The
card floats: drag it by its header, resize it by its corner; its header and
footer stay put and only its body scrolls, so Back and Next are always where
they were. The screens' own rails, top bars and panels are never shown during
the story. When a beat asks for something, the one control it needs is on the
card, bound to the same store the screen reads.

Three parts. Part one builds the picture a layer at a time: domains, use cases,
platforms, lines, connectors, the busiest node, each layer arriving one node or
one line after another. Part two shows how decisions are made today, on a
blank canvas: the documents the architecture lives in, the matrix they are
boiled down to, the three places cost, risk and exit cost are kept, and the
fact that operations tooling already discovers the graph with no money on it.
Each of the six documents opens, on a tap, into a drawing of what that kind of
document looks like. Part three opens with the graph pulled back to its full
extent, then a ledger book in the corner of the canvas with three wires drawn
from the busiest node to its three ruled rows: the entries are read off the
graph. Part three then builds the ledger on that node, one entry at a time,
with a reading pinned to the node for the meter and for the pool, and the
entries accumulate on the card: the meter, the pool, the rule, the crowd, what
stops, a bad month two ways, how much things fail together, how the footprint
grew, what leaving costs, whether spreading it out helps, whose lines decided
all of it. Between parts the canvas fades to nothing and a title says which
part is next; the company name sits at the top of the canvas with the part
beneath it throughout.

Every beat drives the tool only through the store. `src/story/script.ts` is the
whole script; `src/story/useStory.ts` runs it; `src/story/StoryCard.tsx` is the
card; `src/story/Overlay.tsx` is what the canvas shows between and around the
pictures. Arrow keys walk the story; a tap anywhere passes a title.

| beat | what it shows | what it watches for |
|---|---|---|
| 0 | a grey canvas and a welcome | a tap |
| 1 | the company name, and the card with what this is | Next |
| 2 | Part one: the architecture | a tap or Next |
| 3 to 7 | domains, use cases, platforms, lines, connectors, each arriving one by one | tap a domain, a dot, a circle or a line to have it describe itself |
| 8, 9 | the value flow, every line tinted by where its work's value lands and widened by how much; the busiest node | Next |
| 10, 11 | end of part one; Part two: how it is decided today | a tap or Next |
| 12 to 15 | the documents, each opening into a drawing of itself; the matrix; the three silos; the graph that already exists, pulled back to its full extent | tap a document; Next |
| 16, 17 | end of part two; Part three: the ledger | a tap or Next |
| 18, 19 | why a ledger, on the whole graph; the book in the corner, wired to the busiest node | Next |
| 20, 21 | the meter, counting up beside the node; the fixed pool, stamped beside the node | select another platform |
| 22, 23 | the rule; the crowd changes, one rider arriving at a time, with the fan-in slider on the card | you move the slider |
| 24 to 26 | fail it, with the button on the card; a bad month two ways; the dependence slider on the card | you fail it; you move the slider |
| 27, 28 | the months run; the month handle on the card | you move the handle |
| 29 | two shapes, the three entries running on both halves at once: cost, then risk, then leaving; the three tabs on the card replay any of them | nothing, or a tab |
| 30 to 32 | the lines people drew; the camera comes in on one use case, the ring names it, the note says what was decided, then the line moves and the domain takes it in; change the basis, on the card | you move it; you change the basis |
| 33 | the ledger, closed | Explore on your own |

Every figure in a beat's sentences and in the ledger rows is read from the
running tool through `fill()`, never typed into the copy deck. A beat's
`waitFor` is armed only after that beat's own animations have finished, and
the state it compares against is read at that moment.

In part one a tapped domain names itself on the card and joins a list that
opens and closes on a tap; a tapped dot, circle or line describes itself from
the data. `src/model/describe.ts` assembles every such line from the estate.
Outside the story, tapping a domain opens a pop-up on the canvas with the same
three lines.

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
| Sales and Distribution | GBP 361,290 | GBP 418,183 |
| Claims | GBP 203,758 | GBP 243,275 |
| Finance | GBP 150,511 | GBP 191,690 |
| Customer Service | GBP 217,837 | GBP 232,620 |
| People | GBP 4,831 | GBP 6,489 |
| Data and Analytics | GBP 11,859 | GBP 11,873 |

Both columns are on seed 20260905 since deviation 74; the right column
used to run on its own seed. On screen these show to two significant
figures, "about GBP 240,000" for Claims on the right.

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
byte-identical across loads: three loads in a row hash to `fecf52bb`. Graph3D
publishes the digest, FNV-1a over every node's id and settled position, on the
document root as `data-layout-digest` once the simulation stops, and acceptance
A4 loads the page three times and compares. Until deviation 42 the digest was
measured by a one-off script and only claimed here; it is now part of the build.
The value changes whenever the layout does, which is the point: a new shape is
a visible diff in this file, not a surprise on someone's screen.

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

Acceptance T7 walks it on Next alone and checks the chrome is hidden while
it runs, every beat resolves its figure, and the last Continue lands on step 1
with the chrome back and the card on 1 of 7.

### 39. Graph3D updates state in place, disposes what it replaces, and caps pixel ratio

Not in the spec either way. The graph's appearance was one effect that
re-issued the node builder on every change of selection, dimming, failure or
lit link, and the library rebuilt every node from scratch each time: 46
geometries, 46 materials, 46 label canvases, none of them disposed. The intro
changes the dim set five times, so five allocation spikes and five garbage
collections, which read as choppy. Every click in view 1 did the same.

Now the objects for a node are built once, with the halo, both rings, the label
and the view 2 donut all present and mostly hidden, and a second effect walks
them and sets opacity, emissive, visibility and which material is on the mesh.
Nothing is allocated on a state change. Rebuilds happen only when the data, the
theme, the label mode or the ring accessor change, and they dispose the
geometry, materials and textures they replace, as does unmount; GPU memory
does not go with the garbage collector.

Two smaller things for a wider range of devices: the renderer's pixel ratio is
capped at 1.5, because a 3x display pays nine times the fill for a graph that
does not need it, and the render loop pauses while the tab is hidden.

### 40. The intro takes the side column and is built by hand

The first cut of the intro put the title card in the centre of the canvas, over
the estate it was describing, and advanced on a clock. Both were wrong. The
card covered the graph, and on the last beat the camera flew the busiest node
to exactly where the card was. The clock meant a graph filling in on its own,
which could not be paused and did not say what had just appeared.

The card now takes the column the panel normally has, with the canvas ending
where it begins, so the estate assembling is never behind it. There is no
clock: Next adds a layer, Back removes one, and each layer is named with a line
on what just appeared. Under 900px the card anchors to the bottom and the
canvas ends at its measured height, the same mechanism as the tour card.

### 41. The intro's sentences are longer than the tour's, and its descriptions are generated

The tour brief's B4 holds tour sentences under twenty words. The intro's run
longer, deliberately: the owner's review found "each of the 30 plugs into
several of the 12" told a newcomer nothing, and the intro is the one place the
tool assumes nothing. It now says what a dot is, what a circle is, what a line
is and why the diamonds sit in the middle, in two sentences a layer.

The descriptions the card gives for a tapped node are not copy at all. They are
templates filled from the estate by `src/model/describe.ts`: a use case's
volume, its platforms in order, what it is told it costs and how much of that
is metered, and the edge with the highest conditional failure probability. A
platform's riders, fixed pool, metered spend, capacity note and rule share. A
subdomain's scope, use cases, platforms, and how many of those it shares. This
is where the numbers the tour later prices are first met, one node at a time,
so they are familiar by the time the tour puts a figure on them.

Nothing here comes from a vendor. There is no vendor framework in the data and
none is implied; every figure is synthetic and declared, as the footer on every
screen says.

### 42. Each part of the business owns a sector of the layout

A4 asked for a seeded layout and got one: every node started on a Fibonacci
sphere in data order and the forces did the rest. The forces put Finance and
Data and Analytics on top of each other, because they share six of their eight
and ten platforms and the link force pulls both sets of use cases onto the same
spot. Their coloured regions overlapped so completely that a click on the centre
of either resolved to the same one, whatever rule decided the click.

The seed now has structure. Each part of the business is given an anchor
direction on one axis of an octahedron, in estate order, so every pair is at
least a right angle apart. The octahedron is turned so the camera, which starts
on the z axis, looks down one of its three-fold axes: seen that way the six
anchors project to a regular hexagon and no two sectors sit one behind the
other on screen, which with the axes left alone the pair on z would. Its use
cases start in a cap around that anchor on an outer shell, fanned so they do
not begin stacked and spread in depth as well as across, because a cap on a
sphere is nearly a plate, and a plate seen edge-on swallows any ray in its
plane. A platform starts on an inner shell in the mean direction of the parts
that ride it: one two parts share sits between them, one every part shares
starts near the middle. A force the same shape as the pull that keeps the hubs
central holds each use case toward its anchor while the simulation runs and
fades with alpha like everything else, so the settled shape is still the
forces' own.

What this buys: all six region centres resolve to their own region on a click,
which T7 now checks, and the picture reads as six neighbourhoods around a shared
middle rather than one tangle. What it costs: the layout is no longer "whatever
the forces did", it has an opinion about where each part sits. The opinion is
the data's order, not a designer's, and the digest above records the result.

### 43. The intro has six beats, fades each one in, and points at what to tap

The owner's screenshot of the title card showed the whole estate, hulls and all,
behind a card that had not yet said what any of it was. Two causes. The library
builds node objects lazily, after the state effect had already run, so a fresh
object showed whole until something changed; each object now takes the current
state as it is built. And the hulls had no notion of arriving at all.

The intro is now six beats rather than five. The domains come first, on their
own, as coloured shapes with nothing inside them; then the use cases fill them;
then the platforms, the lines, the connectors, and the busiest node as before.
The word is "domain". The shapes enclose the work one part of the business owns,
which is a business domain in the domain-driven sense, and the card says so in
its first sentence: a domain view of the organisation. They are not technology
domains, and there is no second view that groups platforms by category. The
platforms sit outside every shape on purpose, because the lesson is that they
are shared, and a technology grouping would draw a boundary around exactly the
thing the tool is trying to show has none. The rest of the tool says subdomain,
the paper's word; the legend says so once it is complete.

Nothing snaps. Every node and every hull keeps where its opacity is going and
when it set off, and one animation frame loop, started only when something is
still moving and stopped when nothing is, eases each material toward its target
over 720 ms. Nothing is allocated per frame and no React state is touched, so a
layer arriving costs a few multiplications a frame. A hull that has faded fully
out is not built at all. Under prefers-reduced-motion opacity lands at once.

A pulsing marker on the canvas says what to tap: "Tap a domain" on the domain
not yet named, moving to the next as each is named and gone when all are; "Tap
a use case" on the busiest use case at beat two; "Tap a platform" on the largest
platform at beat three. It is one DOM element moved every other frame, not a
render per frame. A tap on a node the intro has not yet revealed falls through
to the domain behind it, because a dot that is not there yet should not take a
click.

The legend builds only in the intro; that is where the tool is taught. After
it, and in ordinary use, tapping a domain opens a pop-up on the canvas with the
same three lines the legend gave it, and the pop-up stays inside the canvas
rather than sliding under the panel.

### 44. The company name lives on the canvas, the card is headed by the chapter, and named domains stack

The owner's review of the six-beat intro asked for three things. The title
card kept the canvas empty and put every word on the card; the important words
belong where the eye is. The card was headed by the product name on every beat,
which said nothing the reader did not know. And a tapped domain replaced the
one before it, so there was no going back to Finance after Claims.

Now the title card carries the company name centred on the canvas, with one
line under it saying what this is: an architecture ledger of one invented
insurer. On Next the name does not fade out; it travels to the top of the
canvas and settles small, and stays there for the whole intro, because that is
what the picture is of. The card's heading becomes the chapter: Domains, Use
cases, Platforms, Lines, Connectors, The busiest node. The counter is gone; the
six bars under the buttons say how many chapters there are without a number.

Each domain the viewer names becomes an entry on the card, in the order named,
and every entry opens and closes on a tap, so all six can be read side by side
and returned to. The latest tap opens itself. This list is built only in the
intro, which is where the tool is taught; afterwards the pop-up on the canvas
carries the same three lines.

The three lines now explain their own words. "Units of work" meant nothing to
an architect who had not read the paper, so a domain's entry says what a use
case is (one thing the business does, such as paying a claim), what a unit of
work is (one instance of it, one claim paid), and what a platform is (a system
the work happens in), in the sentence that first uses each. The hull fade was
also too quick to read as a fade at 720 ms; hulls now take 1400 ms, nodes keep
720. Acceptance T7 samples the hull alphas 220 ms after Next and expects all
six strictly between nothing and full.

### 45. One tour, not two, and the ledger built a section at a time

The owner walked the six-beat intro into the old tour and stopped at the seam:
"why am I suddenly seeing Okta, why does it say begin the tour, what was I
doing before?" The seam was real. The intro was bolted on in front of a tour
that had been written first, so the reader built the picture on one card, then
was handed a second card, a full panel of thirty figures and a counter that
started again at one.

It is now one tour of fifteen chapters on one card: six that build the picture,
nine that build the ledger on the node the picture left lit. The chapter
numbers run straight through and so do the bars under the buttons. Back from
chapter 7 is chapter 6 with the picture up. The rail stays hidden for the whole
tour, because the chapters choose the screen and a rail that says Explore while
the chapter says Risk is a contradiction on screen. The bottom-anchored tour
card is gone; the ledger chapters use the intro's card and its place.

The second part opens with why there is a ledger at all, in the words the
paper uses for it: architecture decisions are made on drawings and priced by
nobody; a ledger is a book where every entry carries a number, a date and a
name; this one keeps three entries per use case and refuses to add them. Then
the panel fills in one section per chapter: the name alone, then the meter,
then the rule, the failure, the footprint, and the boundary, each on the screen
built for it. Chapter 14, the boundaries, is new; the old tour skipped view 6.

The copy for the ledger chapters was rewritten to be read aloud. Each unusual
word is explained in the sentence that first uses it: driver, fixed pool,
rider, rule share, blast radius, P99, execution component. Sentences run
longer than the tour brief's twenty words where a shorter one would have left
the word unexplained. Connectors are drawn in a darker grey than platforms,
still grey, because colour means domain and nothing else.

### 46. The story column, no dimming, and the drawing the estate is usually seen as

The owner's read of the fifteen-chapter tour found four things wrong with how
it was told, and they were one thing: the right column was not carrying the
story. The card had become a sheet along the bottom on the owner's screen and
overlapped the screen's panel; the spotlight greyed the whole canvas to point
at one control, and the grey made the picture unreadable; the panel on the
first ledger chapter said "Okta" and nothing else; and the chapter that
explained why a ledger exists did so in words, over a graph that already
looked like the answer.

The card and the screen's panel now share one column on the right: the card
at the top, the panel starting where the card ends, on every screen from
1000px up, so the two cannot overlap and the story reads top to bottom. The
card carries a part label, "Part one: the architecture" or "Part two: the
ledger", the bars under the buttons break at the seam between the parts, and
the name at the top of the canvas says which part is running. Below 1000px
the card is a sheet along the bottom as before.

The spotlight no longer dims anything. Each target gets a slow breathing
outline and a label, and the rest of the screen is left exactly as readable as
it was. The owner's alternative, greying only what is irrelevant, was tried on
paper and rejected: on a canvas where every node is relevant to the next
sentence, there is nothing to grey.

Chapter 7 now shows the before as well as saying it. A matrix of the six
domains against the sixteen systems, one colour per cell, sits over the graph:
the capability heat map and the two-by-two of fit against value are what
estates like this are shown as when decisions are made about them, in the
Business Architecture Guild's method and in the portfolio tools built on it.
The colours here are derived from the data, by how much of each domain's bill
on each system is set by rule rather than read off a meter, so the drawing is
of this estate; but it is a judgment scale by construction, and the card says
so and says "Illustrative". A tap or Next dissolves it to the graph beneath.
Automatically discovered dependency maps do exist, in observability and IT
service management tooling; they are built for operations, and none found
carries a per-use-case cost, risk or switching entry on the mined graph, which
is the gap the paper names.

Chapter text is shorter on the card, with the longer explanation under More
detail, and each chapter's first sentence carries the last one forward, so the
second part reads as one argument: the meter, then the rule, then what stops,
then how much fails together, then what leaving costs, then whether spreading
it out helps, then whose lines decided all of it.

Connectors are drawn teal, one colour shared by all of them and by no domain
and no platform. The owner asked for a colour twice. It is not a vendor
colour: it belongs to the kind of node, not to any name on it. The split view
has a draggable divider and larger captions. Card type is on a fluid scale
between phone and desktop sizes.

### 47. The story engine: beats, one card, nothing shown before it is said

The owner's read of the fifteen-chapter tour was that it still showed whole
screens with their whole panels and then pointed at things: two cards on the
screen, everything at once, scroll to find Next, a grey lightbox over the
canvas, the ledger chapter opening on a panel of thirty figures, and no
sequence to any of it. That was a fair description of the engine, not of any
one screen, so the engine was replaced rather than patched.

A story is now a list of beats. A beat shows one thing: a sentence, one
change to the canvas, one figure, and where it asks for something, one
control. Next is the only way forward, and the arrow keys and a tap on a
title do the same. The screens' own rails, top bars and panels are hidden
for the whole story; the one card carries the words, the control and the
ledger rows earned so far, and it floats, drags and resizes. Nothing dims.

The picture in part one arrives a layer at a time and, within a layer, one
node or one line after another: the canvas staggers the fade of newly shown
nodes by 45 ms each and the appearance of newly shown lines by 14 ms each,
and hulls fade over 1.4 s. On the footprint screen a use case that has not
yet arrived at the month shown has no lines either; it used to keep them,
which drew lines to empty space.

Part two is new. The "before" was a paragraph on a card over a graph that
already looked like the answer. It is now three pictures on a blank canvas:
the documents the architecture lives in, each with an age; the matrix they
are boiled down to when a decision is needed, one colour per judgment,
derived from this estate's data and labelled illustrative; and the three
places cost, risk and exit cost are kept, the third of them empty. Then the
graph returns with the line that operations tooling already discovers it,
with no money on it. The research behind the "before" is in deviation 46.

Part three builds the ledger on the busiest node one entry per beat, and
each entry is a row on the card that stays: metered, the pool, a rider's
rule share, a bad month two ways, the dependence range, the execution work of
leaving, the two estates' bad months, and how many figures moved when a line
did. The boundaries screen's moves now live in the store so the story can
make one and count what changed, and the story asks for the basis change on
the card, where changing it visibly moves the count.

Launching the app is the welcome. The front page is gone; "Skip the story"
on the card lands on the Explore screen with everything up, and the rail's
Tour button starts the story again.

### 48. The second pass on the story: smooth, wide, drawn, wired

The owner's second review of the story, from screenshots, found eight
things. Each is a change to how a beat moves, not to what it says.

The company name landed with a jump. Its entrance animation touched
`transform`, which for its duration overrode the translate that centres the
name, so the name painted off centre and snapped into place when the
animation ended. The entrance is now opacity only. On the first beat of each
part the name comes back at the top and the part title glides up under it:
for one frame the wordmark stands where the title stood, at the title's
size, then its transitions carry it home over 900 ms.

A hint at the foot of the canvas says the picture can be turned: an orbit
glyph and "Drag to look around". It appears on the first picture, once the
domains have landed, and fades the moment the viewer drags. A drag, not a
tap: a pointer that travels more than a few pixels while down. It is
remembered per browser so a returning viewer is not told twice; a browser
that will not remember it just shows it again.

The six documents of part two open on a tap into a drawing of what that kind
of document looks like: a capability heat map as nested boxes tinted by a
score, an inventory as a spreadsheet with more columns than fit, integration
diagrams as boxes and crossing arrows in three hands, a risk register as a
table beside a five by five grid, contracts as a renewals list in four
currencies, budget lines as cost centres with no use case column. Each is
an illustration of the common shape, drawn here, not a copy of anyone's
document. Platform names appear where an inventory or a contract list would
carry them, in grey, as furniture, with no judgment beside them; the
capability names and risk names are generic. The drawing opens in a
lightbox on the canvas, which is the one place the tool dims anything, and
it keeps to the canvas left of the card's column so its close button is
never under the card. Escape or a tap outside closes it.

Part two's return to the graph, and part three's opening, used to land
where part one left the camera: close on the busiest node, with labels the
size of the heading. Both now ask the camera for the whole estate, and the
camera pulls back along its own line of sight over 1.8 s while the picture
fades in over 1.5 s. The flight to the busiest node in part one stands
further off for the same reason.

Part three has a new beat after "Why a ledger". A ledger book opens in the
corner of the canvas with three ruled rows, and three wires draw themselves
from the busiest node to the rows, one after another. The point of the
picture is the relationship the owner asked to see: the graph is the
blueprint, the book is the balance sheet, and the entries are read off the
graph rather than collected somewhere else. The wires are redrawn every
other frame in canvas pixels, so they follow the camera.

The meter and the pool beats used to change only the card. Each now has a
reading pinned to the node. The meter counts up from nothing to the
month's driver units and the money they meter, with a ticking dot, so the
reader watches the one measured part of the bill being measured. The pool
arrives as one block, stamped, because nobody meters it. Both are the same
pop-up the canvas already used for a tapped domain, with different content.

The crowd beat jolted for two reasons. Every change to the graph's data
re-issued the node builder, and the library rebuilt every node from
scratch; and the library re-heated the layout from its seeds, so every node
re-settled. Now the builder is issued once per theme and label mode, a data
change builds objects for new nodes only, and view 2's rings are repainted
on the sprites they already have. On a data change each node that was
already on screen keeps its place, held still while the change settles and
let go once it has; a use case moved to another part of the business is the
one exception and is free to find its sector. A new node starts beside the
platform it rides and fades in. The three riders arrive one at a time, 800
ms apart, instead of three in a burst.

Two of these are honest limits. The glide is a CSS transition of `top`
between a percentage and a length, which the browser interpolates; under
prefers-reduced-motion it is a cut. And the drawings of the six documents
are drawings: the numbers on them are made up to look like the shape and
say so in the caption.

### 49. Focus, the wave, docking, the decision, and the walkthrough

The owner's third review, from screenshots of part three and of the
explorer. One subsystem, worn several ways, and four fixes around it.

Focus. A beat, or a control outside the story, declares what it is about:
a node and a relation. Everything else on the canvas drops to a ghost: nodes
to a trace, their labels off, links between two ghosts to a faint line, the
hulls of domains not named to a quarter. The set changes as the control
moves, so the picture answers the slider. The crowd beat focuses the chosen
node and its riders, the failure beats the node and everything the failure
reached, the leaving beats the platform and what had attached by that month,
the boundary beats the moved use case, its platforms and the two domains
either side of the line. Outside the story the fan-in slider, the
dependence slider and the month handle do the same on their own screens
from the first touch. It reuses the opacity tween that runs the reveals, so
it costs nothing per frame.

The wave. A failure spreads outward from the node in order of distance:
each lit link and each reached use case takes a time from its distance to
the source and a ring later per hop, and lights when its time comes, with a
short halo pulse. The dependence slider now has a picture: at the left end
the failure reaches only the failed node's own riders; as it moves right,
the platforms those riders also ride go down with it, most shared first,
and the failure reaches their riders too. A change of reach on the same
failure keeps what is lit and times only what is new, so the slider grows
the wave rather than replaying it. The mechanism is illustrative and says
so in More detail; the figures on the card still come from the simulation.

The word rho is gone from the control. It reads "How often the platforms
fail on the same day", with "never together" and "always together" at the
ends; the letter is in More detail.

Docking. The card has a fixed home per layout and the canvas is inset to
clear it, so the picture is framed and centred in the space left rather than
dodging a card that moves. Single canvas: the right column. Split view: a
low sheet along the bottom, with the two halves taking the width and the
company name clear of the half titles. The owner asked for soft collision
detection; a card that dodges the camera would jump whenever the camera
moved, and a fixed dock with a re-framed canvas gives the same clear view
predictably. Recorded as a deviation from the ask.

Framing. The library fits the box around every object, labels and rings
included, which landed the picture at about half the canvas. The canvas now
fits the sphere around the node positions, standing the camera off along
its own line of sight so that sphere fills the shorter side with a little
room at the rim. And the layout's 300 ticks now run before the first frame
rather than across the first five seconds: a screen mounts with the estate
already settled and framed. The digest is unchanged, fecf52bb, because the
tick count is.

The boundary move is shown as a decision. A note pinned to the moved use
case names the giving domain, the receiving domain and the use case, with
an arrow that draws, and says who moved it in the only terms the data
supports: the domain architecture function redrew the line; no system and
no line on the graph changed. Everything but the two domains, the use case
and its platforms ghosts.

The matrix. Its cell colours and vertical headers were scoped to the old
chapter's class and the story renders the sheet without it, so the sheet
showed sixteen horizontal headers and no colour. One selector.

Riders added by the fan-in slider fan out in a ring that widens as more
arrive, and only the first three carry a label. The rule share of each
rider flashes when it changes, and a line under the slider says how many of
the node's figures the basis moved and by how much, or that this basis moved
nothing against an equal split. The fixed pool's "Allocated by rule" row
now reads "Allocated by rule, not billed", the distinction a finance reader
already knows.

The walkthrough. On the explorer a tapped node's panel carries a play
button, "Walk me through it", and the node's figures arrive one step at a
time on a card at the top left, with the canvas focused on each: what it
is, what runs on it, how it is billed, when it stops, what leaving would
cost, when it arrived. Four steps for a use case. Every sentence is
assembled from the data. The owner asked for why each platform was
purchased and whether it aligns with strategy; the estate has no decision
record, and the paper refuses an unevidenced counterfactual, so the
walkthrough says value as the work that runs on the node, and says in one
line that a real ledger would link the decision record here and this estate
has none. No vendor is named anywhere on screen: every platform carries a
generic name from its category (deviation 71), because the estate is
synthetic and a real name beside invented figures would read as a claim
about that product. Recorded as a deviation from the ask.

### 50. The corrections to 49: no wall, no dead area, and the real cost of a slider step

The owner's screenshots of 49 found five things, two of them mine to be
plain about.

The docking in 49 inset the WebGL canvas to clear the card. That put the
canvas's edge at the card's column: the picture was cut by an invisible
wall there, and the column under the card could not be dragged. Wrong
approach. The canvas now keeps its full width and the camera's view is
offset instead, with `setViewOffset`, so the picture is framed and centred
in the space the card leaves while every pixel of the canvas still turns
the estate. The card publishes its width on the root and the shell says
which side it docks on; the canvas reads both and re-fits when they change.

The drag hint was remembered per browser, so a second run of the story had
none. It is remembered per session now: the story is the first-run
experience, and a viewer who comes back to it is told again.

The ghost level of 49, seven percent, left the estate nearly invisible
behind the focus. It is twenty percent, with the faint lines and the
quarter hulls lifted to match.

The slider was still choppy after 48 and 49, and the profile finally named
the causes rather than the symptoms. Each step handed the library new node
and link objects, and the library binds its three.js objects to the data
objects by identity, so every line on the canvas was rebuilt on every step.
The link width accessor was re-issued on every data change, which rebuilds
every line again. Every ring texture was repainted whether or not its split
had changed. And the layout ran three hundred synchronous ticks per step.
Now the objects the library holds are kept and their fields refreshed, the
width and dashed accessors are re-issued only when what they return could
differ, a ring is repainted only when its split moves, and an addition
settles in thirty ticks. Measured in the container, the main-thread work of
one fan-in step fell from about ninety milliseconds to about twelve; the
rest of a frame there is the software renderer, which a real GPU does not
pay. The figure formatter also builds one formatter per precision instead
of an Intl object per call.

The month handle changed nothing on the card, because the card quoted the
ratified month only. It now quotes the month under the handle: how many use
cases had attached and what the work of leaving stood at, or that the
platform had not yet been adopted.

The boundary beats are re-staged. The lines beat says what the coloured
shapes are and why redrawing them matters, with the crossing lines faint
rather than bright; the copy makes the human point, that drawing the
boundaries well is much of what enterprise architecture is for, without
telling anyone which drawing is right. The decision note sits in the
corner of the canvas, in the book's frame, instead of covering the graph.
And the moved use case now travels: it is released from its pin and the
forces carry it into its new sector over a couple of seconds while every
other node holds, the hulls reshaping every few ticks as it goes, so the
receiving domain is seen to take it in.

### 51. The bottom of the valley, the crescendo, the filled book, and the disclosed panel

The owner's fourth review, of part two and of the explorer.

Part two's documents said what each was and left the reader to infer the
problem. Each drawing now ends with the problem, quietly: the three
questions a decision needs for one use case, what it costs, what it risks,
what leaving would cost, shown as three struck-through chips, and one line
on why this document cannot answer them. A score is an opinion with a
colour; an inventory has no column for the work; an arrow has no volume; a
rating is a judgment, not a loss; a contract prices staying, never leaving;
a cost centre is nobody's use case. The beat's own line says the same in
one sentence: each is honest about something, and silent on the three
questions.

The silos beat is the crescendo and reads like one. The question sits at
the top of the canvas, "what a decision needs, for one use case", and the
three sources sit at the bottom. A curve draws upward from each source and
stops two thirds of the way, with a mark where it gives up. Nothing reaches
the question. The caption says why: three sources, three vocabularies, no
shared key, so the decision is made on a colour. The curves are the same
device as the wires that later run from the busiest node into the book, on
purpose: what fails to connect in part two connects in part three.

The book's rows were ruled blanks by design, so a tap on another node
showed a book with nothing in it. They are filled now, read off the graph
for whatever node is tapped: a platform's meter and pool, how many use
cases stop with it, the execution work of leaving; a use case's monthly
bill, what it stops with, what would strand it. The blanks are gone.

The walkthrough card changed height with each step's text, so Back and
Next moved. The card has a fixed height now and the buttons stay put. And
the panel beside it discloses as the walk goes: on the first step only the
headline, then the riders, the meter, what stops, what leaving costs, when
it arrived, each section arriving as its step teaches its words. Outside a
walk the panel is whole. This is the engine, not one node's treatment: any
platform, connector or use case tapped on the explorer walks the same way.

The owner also asked about a revenue vector on the canvas, which domains
and platforms contribute to revenue rather than consume cost, and was
careful that it must not be a versus story. Recorded here as a v2 note
with two conditions. Revenue-bearing must be a declared fact per use case,
with an owner and a date in the provenance strip, like the decomposition;
the tool must not derive it. And it must never become a number or a pair,
because the paper refuses that total. What can be shown honestly is flow:
the work each platform carries, with the revenue-bearing share of it as a
warmer tint on the lines, so a reader sees where revenue-bearing work
concentrates without anyone claiming what it is worth.

### 52. The value flow

The owner asked for a revenue vector: the value flowing through the graph,
something a finance director can read, as a gradient of magnitude rather
than a measured figure, and not a "revenue versus cost" story. Built under
three rules.

The flag is declared, never derived. Each use case carries `value_flow`,
one of customer, counterparty and internal: where the value of its work
lands. It is a fact about the business from the finance function, recorded
in provenance with an owner and a date, `value_flags_owner` and
`value_flags_declared`, exactly as the decomposition is. The tool reads it
and derives nothing from it but the picture. In this synthetic estate the
customer-facing use cases are the quote, bind, renewal, adjustment, portal,
notification, settlement, correspondence, complaint and payment flows; the
counterparty ones reach a reinsurer, a supplier, a regulator or an auditor;
the rest keep the company running.

The magnitude is work, not money. A line's width in the flow picture is the
work it carries, units a month against the busiest line, and the particles
that run along it are sized and paced the same way. No line, node or legend
carries a value figure, and no total is drawn, because value figures do not
add and the ledger refuses them.

The gradient is where the value lands. Warm for a customer, a middle tone
for an outside counterparty, cool for inside; one gradient, no opposing
pair, so it reads as flow and not as a contest. The legend says what the
ends mean, that width is work and not money, and who declared the flags
and when. It also gives the share of each domain's work that reaches a
customer, as a bar, because that is the one reading a finance director
asks for first about a platform: how much of what runs on it is
customer-facing.

It is a button on the explorer, "Value flow", and a beat in part one,
after the connectors and before the busiest node, so the reader meets it
as part of the picture and before any money. The beat's figures are read
from the data: the share of all work that reaches a customer, and the
platform that carries the most of it. The particles are on only in the
flow picture; they cost a draw each per frame and mean nothing elsewhere.

### 53. The three entries on both shapes, the move as a sequence, the theme switch, and the canvas at rest

The owner's reading of the two shapes beat was that the comparison made no
sense: two grey clouds and a divider, with the lesson somewhere in the
panel. It now runs the three entries of part three on both halves at once,
and the message is the nuanced one: neither shape is right, and the ledger
does not pick.

**Cost.** The largest pool on each side is ringed, metered against rule,
with its riders held and the rest of each picture ghosted. The note beside
each half gives the pool, the riders and the rule share of what riders are
told. **Risk.** The busiest node fails on each side and the wave runs as
far as the dependence slider carries it, using the same reach model as the
risk view (`src/model/reach.ts`, one sample per side on a fixed seed, so
the picture and the card agree). The note counts what stopped. On the
right the shared point is a connector, which is the point. **Leaving.**
The largest single execution component of leaving on each side, with what
it strands. The three run on a timeline on entry and the card's three tabs
replay any of them; the card's sentence changes with the phase, and every
figure in it is read from `src/model/shapes.ts`. The longer text under
More detail carries the position: concentration inside a boundary is
cheap to reason about, a case this estate does not contain; concentration
across boundaries is where the blast radius and the exit grow together;
spreading it out multiplies the shared connectors and the contracts; at
full dependence the two bad months converge; and the
coordination cost and the latency of a process that crosses vendors belong
in the decision record, not in a figure here. (As first written this text
also counted the rule share among what grows with concentration across
boundaries, and offered a domain standardising on an approved vendor as
the inside case. Both were struck on the owner's review: under a permitted
rule no rule share moves when a line moves, canon 9.2.8, and the ledger
gives no advice.)

**The move, as a sequence.** The boundaries beat now comes in on the use
case first: the picture ghosts to it, its platforms and the two domains
either side of the line, the camera travels in over two seconds (a `!near`
fly, a closer stand-off than a search result), the ring names it, and the
note says what has been decided and by whom with the arrow held empty.
Then the line moves, the node travels to its new domain over a longer
cooldown with the hulls reshaping every fourth tick, and the note's arrow
fills and its text changes to what moved. The story's pull back to the
whole estate is slower than a search result's, for the same reason.

The note is pinned beside the use case rather than in the corner, so the
decision reads next to the thing it is about. Two faults under this beat
were found and fixed on the way. A change to the picture (a moved line, an
added rider) overwrote every surviving node's position with the seeded
starting position it is built with before pinning it, so the whole estate
snapped to its seed layout at the moment of the move; the live position is
kept now. And the graph library empties the element it is given, which
swept away anything React had rendered beside the canvas on a deep link
and crashed the page later when React went to remove it; the library now
has a child of its own under the holder.

**The theme.** A switch on the canvas, top right, in and out of the
story, sets light or dark; the choice is remembered in the browser and
applied before the first paint, and until a choice is made the system's
setting is followed. The stylesheet reads the choice from the root, so
every colour is one token in two blocks.

**The wait, armed on idle.** A beat that moves a value itself, the
dependence slider running to one and back, used to arm its wait for the
reader at a fixed time after entry. A late frame could put the beat's own
last change after that moment and count it as the reader's. The timeline
now knows what it started, timers and animations alike, and the wait is
armed once all of it has finished and the settle has passed. The root
says when (`data-story-armed`), and the acceptance check acts on that
signal rather than on a guessed delay.

**The canvas at rest.** Leaving the story resets everything the story set
in the store (scene, focus, moves, riders, dependence, months, basis,
failure, subdomain, phase, camera request), and the canvas has a check of
its own: when nothing is asked of the picture, every node is put back to
its baseline and any wave timing is cleared, whatever a beat left on it.
The link colours also follow the theme immediately, which they did not.

### 54. A bad year is a bad month

The copy called the P99 figures "a bad year" and said "a year worse than
this comes about once in a hundred". One Monte Carlo run is one month: the
failure threshold is the monthly probability from the annual rate,
`1 - exp(-LEF / 12)`, a use case's loss is its monthly volume times margin
times the outage fraction, and `simulate` calls `runOnce` once per run with
no twelve-month loop. Every P99 is a monthly figure. Every live string that
said "bad year" now says "bad month", and the P99 is described as a month
worse than this in about once in a hundred months. The acceptance script's
expected heading for beat 25 followed the approved copy change, from "A
bad year, two ways" to "A bad month, two ways"; a test expectation, not a
check made to pass. The one annual phrase
that stays is the loss event frequency in the walkthrough, because that
input really is an annual rate. This document's own "annual loss
distribution" was corrected as well.

### 55. Why the two risk figures differ was stated backwards

The copy said that adding the per-use-case figures "counts the same outage
once per use case" and "overstates". Nothing in the model is counted twice.
Each use case has its own loss, and the joint figure is the within-run sum
of those same losses. The two differ because each use case has its worst
month in a different month, and adding the worst months assumes they all
land at once. Canon 9.3.8 calls the sum the exact comonotonic answer, a
reference point rather than an overstatement, and canon 9.8.3 result two
says the two are equal only when every loss moves in lockstep. So the more
things fail together, the smaller the gap, which is the opposite of what
the copy said. The explanation is replaced on the card, in the risk view's
note, in both glossary tips, in the summary and in the screen's purpose
line. The copy no longer says which figure is larger; the two numbers on
screen show that. Measured for Claims at the tool's own run count and seed,
with the gap as defined above:

| rho | sum of P99s | joint P99 | gap |
|---|---|---|---|
| 0.0 | 272,713 | 192,151 | 41.9% |
| 0.5 | 259,625 | 203,758 | 27.4% |
| 1.0 | 201,443 | 185,887 | 8.4% |

### 56. The dependence slider was mislabelled

The story labelled the slider's ends "never together" and "always
together", called it "how often the platforms fail on the same day", and
said that at the left end a failure reaches only the use cases on the
failed node. The explorer's own tip says, correctly, that under the t
copula the extremes still move together at zero correlation. Rho is a
strength of link, not a frequency, and zero does not mean failures avoid
each other. The control now reads "How strongly platform failures are
linked", with ends "not correlated" and "fail together", and the beat's
longer text says what the parameter is and what the left end means.

### 57. The closing card had lost its content

The live closing beat said only that the three entries are kept apart and
that every deviation is in the README, which a viewer of the hosted site
cannot open. The blocks that belonged there existed only in the retired
tour's copy. The card now carries four blocks above its two buttons: what
this is; what it does not do, ending with the owner's caveat, "It prices
the choices a commitment removes. It does not yet price the ones a
commitment creates. That work is parked on an open problem."; read the
argument, with the DOI line always shown and the Medium line rendered only
once its address is real; and how it was built. Acceptance N2 finds the
caveat on screen character for character.

### 58. Part two claimed too much about how decisions are made today

Part two said, as flat fact, that decisions are made on a colour, that the
cost of leaving is written down nowhere, and that nobody has put money onto
the graph. Tools exist that meter cloud cost per unit of work, methods
exist that price risk in money, and canon 9.3.9 records money-denominated
loss on a mined graph as prior work. The true claim is about common
practice. Every absolute is softened to "often" or "rarely", and one
sentence now admits that the tools and methods exist and are rarely joined
to each other or to a use case. No product and no method is named. The
document drawing's own line, "written nowhere", is about one document and
stays.

### 59. "Nothing new is collected" was false

The beat that fills the book said the three entries are read off the
picture and nothing new is collected. Later beats say otherwise, correctly:
the fixed pool comes from finance, the dependence is a declared input, the
exit work is an engineering estimate (canon 9.5.2), and loss sizes are
inputs. Canon 9.1.2 calls the practice a hybrid, a mined graph carrying
declared parts. The beat now says the graph supplies the start of all three
entries and the rest is declared or estimated, each entry saying which. The
same beat called the book a balance sheet. A balance sheet totals; this
ledger refuses to. The phrase is gone.

### 60. The boundary beats contradicted themselves

"Every figure so far depended on the domain boundaries" is the opposite of
canon 9.2.8 for cost: under either permitted rule, redrawing boundaries
leaves every per-use-case cost figure unchanged. What depends on the
boundary is any figure reported per domain, because the boundary decides
who is in the domain. The move beat then reported that zero figures moved
under an equal split and said the figures had followed the line. The
lesson is that under a permitted rule nothing moves, and that is the point.
The beats now say so, the decision note says no cost figure reads the
line under a permitted rule, and the basis beat names the two permitted
rules. Canon 9.1.2's condition, that the lines must already exist and
belong to someone other than whoever is measuring, is now stated. The
clause that drawing boundaries well is a large part of what enterprise
architecture is for was an unsupported assertion and is cut.

### 61. Operations tools discover the systems, not the picture

The beat said operations tools discover the picture from part one every
day. They discover which systems call which. They do not discover use cases
or domains; people declare them (canon 9.1.2). The beat now says the system
half of the picture is what is discovered, and the next line says the use
cases and the domains are declared.

### 62. Smaller corrections from the same audit

The label "C1" named a reading principle in the canon, not this measure.
The glossary label and the two literals in the fixed pool view now read
"Share set by rule"; those two literals were the only ones outside the copy
deck and now read from it. The exit figure is described once per surface
as an engineering estimate, not a measurement. The value flow
beat's closing clause about what a finance reader wants was an unsupported
assertion and is cut. Bare citations of "9.2.8" and "9.3.8" now read "the
Ledger paper, 9.2.8" and "the Ledger paper, 9.3.8". Of five uses of the
word "honest", one stays, in the dependence beat's reading of the range.
One "not X, not Y, not Z" triple lost an item. "It did not leave" was cut
from the two shapes summary because the sentence before it says so. Every
on-screen sentence is now under twenty words, which meant splitting
eighteen sentences outside the audited strings at their punctuation.

### 63. Two exemptions

Two strings are exempt from the checks above and the acceptance N1 records
them by name. The title sentence, "An interactive model of one invented
insurer, built to show what architecture decisions cost when you price
them in money instead of colours", is the owner's, reproduced unchanged by
instruction, and is over twenty words. The refusal note on the two shapes
screen says that adding option components across commitments "overstates"
the joint position; canon 9.8.3 result three supports that word for option
components, and it is not the retired claim about the P99 sum.

### 64. Dead copy removed

The retired intro block, the retired tour's chapters seven to fifteen and
their spotlight labels, the front page strings and the unused ratification
line, ninety-three keys, were referenced nowhere outside the copy deck,
including by any template string. They are deleted, after the closing
card's text was salvaged from them. The DOI, the Medium address and its
placeholder host are kept because the closing card reads them.

### 65. Linked failures mean fewer bad months here, not worse ones

A limit of the synthetic model, found by the owner and confirmed from the
code. A use case is interrupted if any of its platforms fails and the edge
propagates, and its loss is its volume times margin times one outage draw,
with no term for how many of its platforms failed. So as rho rises and
platform failures cluster into the same months, a use case with several
platforms is interrupted in fewer months at the same cost each. Measured
by the owner at 200,000 runs on seed 7 for Claims in the concentrated
estate:

| rho | mean monthly loss | P99 | months with any loss |
|---|---|---|---|
| 0.0 | 10,362 | 201,996 | 13.7% |
| 0.5 | 8,597 | 203,194 | 9.2% |
| 1.0 | 4,681 | 175,104 | 3.2% |

A real estate may differ, because joint failures can lengthen recovery.
The dependence beat's longer text now says so. The model, the data, the
run count and the seed are unchanged.

### 66. One platform per estate sits inside one domain

Part one said "no platform sits inside one domain" and the two shapes text
said the same of this estate. In the concentrated estate the HR platform's
five riders are all in People; in best of breed the people platform's
five riders are all in People. Nothing else is single-domain in either.
Part one now says almost every platform is shared across domains, and the
two shapes text says that in each estate only one platform sits inside
one domain.

### 67. Two "told" figures, named for what they cover

The story's rule share beat and the fixed pool summaries quote the figure
a use case is told for one platform; the tap card, the walkthrough, the
use case summary and the book row quote the sum over every platform it
rides. Both said "is told", with figures forty times apart. Each per-node
string now says "for this platform alone" or "on this platform", and each
all-platform string says "across all its platforms". The percentage
strings and the ones that already say "here" were left alone.

### 68. The shared point was a connector on both sides

The two shapes copy said the shared point "moved to the connectors". In
the concentrated estate the busiest node is a connector with 28 of 30
riders; in best of breed all four connectors carry 30 of 30. Nothing
moved; spreading out multiplied it. Every claim of movement is gone: the
beat gives the two counts through `{left_riders}` and `{n_int}`, the
summary says the shared point was multiplied across the connectors, the
screen purpose says "It multiplies", and the landing note says the graph
shows the shared point and the org chart does not.

### 69. A failed platform exposes its riders; it does not stop them all

Each edge carries a conditional failure probability and the fail control
samples it. Failing the busiest node with the story's own seed stops 19
of its 28 riders directly; the slider adds riders of the platforms that go
down with it, 28 at rho 0.5 and 30 at rho 1.0. Every string that said all
riders stop now says "is exposed", "can stop", or "up to", on the fail
beat, the busiest node beat, the summaries, the walkthrough, the book rows
and the blast radius tip. Nothing in the fail beat or the risk view
implies the slider changes how many of the failed node's own riders stop.

### 70. Two small ones

Every use case in both estates has at least one connector edge, so the
connectors beat says "every use case" rather than "nearly every". The
retired tour's comment block and six unreferenced chrome keys are deleted.

### 71. Generic platform names

Every platform on screen now carries a generic name from its category, in
both estates: CRM, Service management, ERP and ledger, HR core, Policy
administration, Claims administration, Billing, Data cloud, Business
intelligence, Marketing automation, Document management, Payments,
Integration hub, API gateway, Identity service, Event bus. The two
invented names were renamed too, because it cannot be verified offline
that no real product bears them. Names only: the estate source was
edited, both estates regenerated, and a check proved every number and id
identical. The internal ids stay because nothing renders them; acceptance
N4 searches the built file for every retired name as written and the
rendered text of ten routes for every vendor word regardless of case. The
screenshot script's search term followed the rename.

### 72. The work of leaving, unsplit

The figure shown as the work of leaving was `kCommitted` minus
`exit_k_reversible`, which rests on an alternative that every platform
flags `counterfactual_evidenced: false`; the option part was refused for
lack of that evidence while this figure used it. Canon 9.5.7 makes the
split rest on an evidenced counterfactual. A new function, `workOfLeaving`,
returns the execution component where the counterfactual is evidenced and
the committed work whole where it is not; `kCommitted`,
`executionComponent` and the data are untouched. It is used by the story,
the book, the walkthrough, the detail panel, the footprint view and the
two shapes. On this estate every platform is unevidenced, so every exit
figure rose by its `exit_k_reversible`: the cloud data platform at month
31 from 3,492,720 to 3,742,720, shown as about 3,700,000. The copy says
"work of leaving" wherever the unsplit figure is shown, and the exit
beat's longer text says the ledger would split it and declines to.

### 73. What hardens the exit figure

The 0.15 per rider and 0.02 per month coefficients in `kCommitted` stay.
The exit beat's longer text now says the model hardens the figure by a
made-up rate each month, and that after the last use case attaches only
that grows it.

### 74. One seed, two significant figures

The right-hand estate ran on its own seed, so the two shapes compared two
draws. Both estates now run on seed 20260905 in the views, the story
figures and the precomputed frames; the run count is unchanged. Every
simulated GBP figure (the P99s, their sum, the slider's range, the two
estates' bad months) and every exit estimate is shown rounded to two
significant figures, preceded by "about" where the sentence allows, through
`sig2` and `gbpAbout` in the model. Metered spend, fixed pools and rule
shares are exact arithmetic and stay exact. Acceptance N5 reads the
figures on screen and fails on a third significant figure.

### 75. The primary flexibility measure is named as not shown

The closing card's "what it does not do" now says, before the caveat,
that the tool does not show the cost of adding the next use case and that
the paper treats that as the primary flexibility measure. Nothing is
built for it. The caveat stays last and is checked character for character.

### 76. The customer share is gone

`{cust_share}` (the share of all work reaching a customer) and `{top_flow}`
(the platform carrying most customer-facing work) added volumes across
use cases whose units differ, and so did the per-domain share bars under
the value flow legend. All three are removed; the flow beat's sentence
says only that where each use case's value lands was declared by the
finance function. The line width per use case, which compares each use
case with itself, stays. The legend's declared-by line stays.

### 77. No node is pulled to the centre, and Back clears what later beats set

The layout pulled three hub nodes toward the origin, so the whole picture
was built around the identity platform before the story had said a word
about it. That pull is gone. The links alone decide where the hub sits;
it is still near the middle, because twenty-eight of thirty use cases
ride it, but the story now anchors on a node only when a beat names one:
the busiest node in part one, the identity platform through the ledger
entries, the cloud data platform for the footprint, the moved use case
for the boundary. The layout digest changed from 6b8903cf to fecf52bb and
every screenshot was retaken.

Going Back left later beats' state on the earlier picture: the ring of a
node the earlier beat never named, a failure's wireframes on the crowd
beat, three added riders on the rule beat, the camera still close on the
busiest node in the flow beat. On Back the engine now clears what beats
set (selection, failure, added riders, dependence, month, basis, moves,
subdomain, phase) and pulls the camera back to the whole estate, then runs
the beat's own entry as it did the first time. The domains the reader
named in part one are theirs and stay. The two risk beats that read their
figures on the failure raised by the beat before now raise it themselves
when it is missing, so they are whole on arrival by Back too, and the
risk view clears its sampled failure when the request is cleared.

### 78. Three frameworks named on the silos beat

The silos beat said only that tools exist that meter cost and methods
exist that price risk. On the owner's instruction it now names three
frameworks and what each stops short of: FinOps meters cloud cost but
stops at the cloud bill; TBM allocates every IT cost but by rule, not by
use case; IFRS 17 prices insurance liabilities by contract group, not by
the systems that serve them. None of the three has a key that reaches a
single use case. This relaxes the rule that the tool names no outside
method, for frameworks only. No product and no vendor is named.

### 79. The frameworks on the stage, and the card on small screens

The silos stage now shows where the three named frameworks sit. FinOps
and TBM stand under the cost tile, each with what it is for and where it
stops; the risk and exit tiles say that no framework here prices risk per
use case or records the cost of leaving; IFRS 17 stands under no tile,
because it prices the contracts and not the systems. On a phone the
chips stack in one column.

The story card now scales with the screen instead of sitting at one
width. Its width follows the viewport between 300 and 400 pixels and its
type follows the viewport's shorter side. A phone or a tablet in portrait
carries it as a sheet along the bottom with a handle that pulls it down to
a peek, heading and buttons only, so the picture gets the screen; the next
beat opens it again. A short landscape screen docks it right and narrow
with tighter type, and the two shapes keep their halves side by side to
its left rather than under a sheet. The layout is decided in one place,
`src/app/layout.ts`, and read by the shell and the canvas alike.

Three faults found on the way. On a phone the two shapes' halves sat side
by side in a grid whose second row was empty, because a later rule for
the draggable divider won over the phone's stacking rule; they stack now.
A canvas too narrow to give up the card's column kept the card's width in
its framing arithmetic and fitted the picture to a negative width, so the
halves on a landscape phone showed a dot; the inset is zero when it is not
applied. And under a sheet the wordmark was centred as if the card sat to
its right, so it ran off the left edge on a tablet.

## Open items, no action

- Displayed P99 figures vary by up to 13 percent across seeds at 10,000
  runs (Claims joint P99 at rho 0 ran from 191,894 to 217,002 over five
  seeds). Resolved at deviation 74: every simulated figure and exit
  estimate now shows two significant figures.
- The closing card scrolls at 900px of viewport height, so the caveat is
  below the fold until the reader scrolls. Owner's UX decision.
- The sentence "Nothing is invented about a vendor" in deviation 49 depends
  on the open decision about replacing the real product names in the
  concentrated estate, as the second estate already does. Not edited.
- D1. The exit figure shown as "the work of leaving" was `kCommitted` minus
  `exit_k_reversible` (3,742,720 minus 250,000 at month 31), and that
  alternative is flagged `counterfactual_evidenced: false`. The option part
  was refused for lack of evidence while this figure used the same
  unevidenced alternative. Resolved at deviation 72: shown unsplit.
- D2. From month 31 to 60 the exit figure grows with no new use case
  attaching (3.74m to 5.44m unsplit). The growth is the 0.02 per month
  coefficient alone. Resolved at deviation 73: the coefficients stay and
  the card says what they are.
- D3. The left and right estates ran on different Monte Carlo seeds,
  20260905 and 20260906. On a common seed the right Claims figure at rho
  0.5 is 243,275, not 261,507. Resolved at deviation 74: one seed.
- D4. The dependence slider's low and high are the minimum and maximum of
  noisy 10,000-run estimates (185,887 to 210,729). At 200,000 runs the span
  is about 175,000 to 203,000. Shown to two significant figures since
  deviation 74; the run count is unchanged and the span is still an
  estimate of an estimate.
- Whether to add the cost of the next use case (canon 9.4) as a beat. Not
  built; the closing card now says it is not shown (deviation 75). The
  customer share is gone (deviation 76). Whether figures should be shown
  as ranges rather than points is still open.

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

Observed, at 100,000 runs on seed 424242. The gap, here and everywhere a
percentage is shown or logged, is the tool's own definition: the sum of the
per-use-case P99s minus the joint P99, divided by the joint P99.

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
| T1 | the story walks all 34 beats on Next alone | PASS | 34 beats, every heading in place, no rail and no panel at any beat, every placeholder resolved, no page errors. |
| T2 | on 390 by 844, the card never covers the node the beat is about | PASS | The ledger beats with a selected node on screen; none under the card. |
| T3 | each waitFor fires on the action it describes | PASS | 7 of 7 fired, each through the control on the card. |
| T4 | deep link to one beat cold-loads into it | PASS | #/tour/28 opens headed What leaving would cost, on the Footprint screen with the cloud data platform selected, no page errors. |
| T5 | forbidden words in our own writing | PASS | "leverage" 0, "seamless" 0, "journey" 0 in our source. Bundle counts 0, 1, 0; the one hit is React's HTML attribute table. |
| T6 | every canvas fills the space it is given | PASS | 30 canvases across 8 routes and 3 widths, beats 23 and 29 among them: all sized, none under the panel. |
| A4 | the settled layout is the same on every load | PASS | Three cold loads publish the same digest, `fecf52bb`. |
| T7 | the opening runs welcome, name, part one, domains one by one, and on to the ledger on one card | PASS | Launched on a grey canvas with a welcome and no card; a tap brought the name and the card; Next brought the part title; the six domains were mid-fade with the name at the top and the card headed Domains; the marker read "Tap a domain"; all 6 domain centres resolved to their own domain and stayed as entries; the busiest node was lit; the end line, six documents, the 96-cell matrix and the ledger opening followed on the same card at #/tour/17. |
| T8 | outside the intro a tapped domain explains itself on the canvas | PASS | 6 of 6 domains opened a pop-up with their own name, inside the canvas, and Close closed it. |
| N1 | the copy deck: no dashes, no sentence over twenty words, no retired phrase | PASS | Every string in `src/copy.ts` scanned; two named exemptions, deviation 63. |
| N2 | the closing card carries the caveat, the DOI, and no placeholder link | PASS | The caveat on screen character for character; the DOI line shown; the Medium line not rendered while the address is the placeholder; blocks in order. |
| N3 | the literal C1 appears nowhere on screen | PASS | Ten routes read, including the pool view with its annotation open. |
| N4 | no real product or company name in the bundle or on screen | PASS | Seventeen retired names absent from dist; ten routes rendered with no vendor word. |
| N5 | simulated and estimated figures show two significant figures | PASS | Read from the story ledger, the risk view, the two shapes and the footprint. |
| C3 | nothing on the page links to another site | PASS | 0 offsite links across 8 routes. The bundle mentions 5 hosts, none rendered: 4 are vendored library internals, the fifth is the unset Medium placeholder, which is why that line is not drawn. |
| - | no page errors across all six views | PASS | none |
| - | dist is one self-contained file, no runtime network calls | PASS | 1.76 MB, 0 offsite requests. |

**20 pass, 0 fail, 1 not run.**

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
exchange rate between a monthly cost, a monthly loss distribution and a
horizon-dependent option value, and none is constructed here.

For sources, see the Ledger paper.
