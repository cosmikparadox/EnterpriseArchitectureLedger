# LEDGER EXPLORER, build plan v1

Sources: spec v0.1 (committed, 28,156 bytes, verified), Part IX v3.1d (on disk,
gitignored, cited by section number only, 133,110 bytes, verified against the
Drive figure before any code was written). Canon wins on every formula conflict;
each one is logged in README under "Deviations from spec".

## Stack, pinned
Node 20 LTS. Vite 5 + React 18 + TypeScript strict. 3d-force-graph 1.73 over
three.js 0.160 (per your step 3; fall back to @react-three/fiber only if View 2
screen-space rings or View 6 hull-drag prove infeasible, and say why). No
recharts: hand-rolled SVG for the exceedance and W(K) curves. Vitest for units.
Monte Carlo in a Web Worker, seeded xoshiro128**, no closed form.

## Canon overrides going in before any component
1. 9.3.8 forbids the Gaussian copula spec section 6 asks for. Student-t,
   nu = 4, declared on screen. rho slider unchanged.
2. 9.2.8 (R23) permits equal split and driver-proportional only, and prohibits
   any two-stage basis. Spec's "by headcount" is two-stage, so it ships as a
   labelled counter-example, which is what View 6 exists to show. Its on-screen
   label in View 6 reads "prohibited by 9.2.8, shown as a counter-example", not
   only in the README. Adding driver-proportional as the fourth rule so the
   permitted set is representable.
3. 9.5.5 Datar-Mathews two-rate replaces spec section 6's tenure x fan-in
   multiplier. W(K) curve per 9.5.4. Option component never renders outside the
   element carrying the 9.5.7 refusal text. View 4 ratification sentence quotes
   execution cost as the only hard number.
4. 9.8.2 requires graph version and decomposition owner on every entry. Adding a
   provenance strip; without it these are not ledger entries.
5. 9.8.3 result three: option components across commitments are an upper bound,
   never a total. View 5 labels it so.

## C1
9.2.6 makes a defensibility claim, not a directional one. It does not settle the
direction, so per your instruction the spec formula ships and view2_hint stays
"its number moved anyway", no direction claimed. One paragraph in README, which
quotes 9.2.6 verbatim under its section heading so the reader can check the
reading without opening the canon.

## Order, commit after each
a  scripts/generate.ts, seeded, realism report, failing checks. Run it, show you
   the report, stop.
b  src/model/ledger.ts, every formula carrying both section numbers. Vitest:
   three rules sum to the fixed pool; equal split partition-independent;
   sum-of-P99s vs within-run P99 gap at rho = 0.5.
c  Worker Monte Carlo, 10k runs under 2s on a fixed seed, timed and reported.
d  View 1 only, desktop and Chrome mobile emulation, before any other view.
e  Views 2 to 6 in order, screenshots to ./screenshots each.
f  Acceptance section 10, every check run and pasted. Note: check 2 needs a real
   human and check 1's phone half needs a phone; I have neither and will mark
   both accordingly rather than claim a pass.

Prose lives only in src/copy.ts. dist/ committed. Branch
claude/ledger-explorer-3d-ccgaew.
