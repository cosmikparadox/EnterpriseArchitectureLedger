# Ledger Explorer: audit fix brief v0.5, report

Branch `claude/ledger-explorer-3d-ccgaew`. Not deployed, not merged.

The brief was checked against head `3c8c7e7`, which is later than the audited `6798fa3`. Every finding reproduced on that head, so nothing is marked "not reproduced".

Baseline on that head: `npm ci` succeeded, `npx tsc -b` was clean, and `npm test` passed 15 of 15. The canon file `Part_IX_Mathematics_v3_1d.md` was readable in the repository root.

Sections 2 to 13 were done under brief v0.4, whose text is identical, before v0.5 arrived. Section 17 is commit group 9.

## 1. Status

| item | what | status | commit | evidence, before to after |
|---|---|---|---|---|
| 0 | prerequisites, baseline figures | done | | all appendix figures reproduce on `3c8c7e7`; the next use case is 85.795, shown as 86 |
| fix six (7) | product ids renamed, data regenerated, bundle scan extended | fixed | `03fca28` | 14 ids renamed; both built files have 0 hits for every old id and product name (19 words); cost, risk and leaving figures identical; only option components moved |
| fix one (2) | Claim triage carries all three entries | fixed | `82844bc` | book "The ledger, Identity service" becomes "The ledger, Claim triage"; card rows name their objects; close "Three entries for Claim triage"; prologue exit note Claims administration 6 becomes Data cloud 16 |
| fix two (3) | switching-cost split | fixed | `a35ec14` | "unsplit" and "Plus an option component" gone; refusal block shows work created about 3,500,000 and choices given up about 790,000 at month 31, beside the work of leaving about 3,700,000, never added |
| fix three (4) | adding stated as a law | fixed | `43729db` | "too high", "the extreme case", "They rarely do" gone from copy and bundle |
| fix four (5) | dependence beat and risk band from five fixed points | fixed | `43729db` | range reads USD 200,000 to USD 270,000; identical under a 6x CPU throttle (acceptance V2) |
| fix five (6) | next use case | fixed | `2e887b9` | crowd beat: "Each newcomer adds about USD 86 a month"; pool stays 24,000 |
| fix seven (8) | boundaries note | fixed | `b53bbdd` | "Risk does not move" becomes `boundaries_unchanged` |
| fix eight (9) | two-shapes labels | fixed | `b53bbdd` | "Identity service: USD 24,000, 28 riders" and "API gateway: USD 18,000, 30 riders"; exits "Policy administration: about USD 9,000,000" and "Identity service: about USD 7,400,000"; fits at 390 px |
| fix nine (10) | sum across commitments | fixed | `b53bbdd` | sum removed; three largest works of leaving ranked per side; `option_upper_bound` deleted |
| S1 to S14 (11) | smaller wording | fixed | `b53bbdd` | as given, word for word |
| S15 | IFRS 17 card | no change | | as instructed |
| 12 | prose moved into `copy.ts` | fixed | `a087b5c` | 26 strings, listed in section 4 |
| 13 | tests | done | `e1f374a` | 15 audit tests, 12 fold tests; acceptance V1 to V4 |
| 14 | verification, README, screenshots, dist | done | `e1f374a`, group 9 | 42 of 42 tests pass; acceptance as in section 5; README deviations 95 and 96 |
| 17 | 2D and 3D switch with a fold | fixed, with the fallback applied per device | group 9 | see section 8 |

## 2. Appendix, before and after

Seed 20260905, 10,000 runs, rho 0.5, equal split. The "after" column is on the final head.

| figure | before (`3c8c7e7`) | after | on screen now |
|---|---|---|---|
| Identity service: riders / metered / pool | 28 / 8,680.70 / 24,000 | same | card, worked line |
| Quote and bind on identity: reported / rule share | 1,763 / 857 | same | no longer shown in the story |
| Claim triage, reported across 5 platforms | 49,444 | same | entry one |
| Claim triage, metered / by rule | 25,649 / 23,795 | same | entry one |
| Claim triage on identity: reported / rule share | 1,156 / 857 | same | rule and crowd beats |
| Claim triage on identity with 3 riders added | 1,073 | same | crowd beat |
| Next use case on identity, metered increment | 85.795 | same | 86 |
| Claim triage own bad month (P99) | 59,196 | same | about 59,000, entry two |
| Claims: added up / together | 259,625 / 203,758 | same | card |
| Claims best of breed, together | 243,275 | same | about 240,000 |
| Claims added up, five fixed points | 272,713 / 244,913 / 259,625 / 241,886 / 201,443 | same | 200,000 to 270,000 |
| Claims together, five fixed points | 192,151 / 190,880 / 203,758 / 210,729 / 185,887 | same | risk screen band |
| Data cloud: adopted / riders / attached by month 31 | 17 / 16 / 16 | same | |
| Data cloud work of leaving, month 31 | 3,742,720 | same | about 3,700,000 |
| Data cloud work of leaving, month 60 | 5,438,640 | same | about 5,400,000, entry three |
| Data cloud work the commitment created, month 31 | 3,492,720 | same | about 3,500,000 |
| Data cloud choices given up, month 31 | 786,710 | same (Data cloud kept its id) | about 790,000 |
| Identity service work of leaving, month 60 | 6,988,800 | same | |
| Busiest node's pool, concentrated / best of breed | 24,000 (28) / 18,000 (30) | same | relabelled |
| Largest pool, concentrated / best of breed | 96,000 / 44,000 | same | not shown |
| Largest exit at month 60, concentrated / best of breed | 9,028,800 / 7,392,000 | same | named |
| Boundary move, cost figures moved, equal / driver / by volume | 0 / 0 / 0 | same | |
| Boundary move, by headcount: moved / largest | 72 / 1,656 | same | |
| Broker quote own P99, before / after its move | 113,261 / 37,754 | same | reported, O3 |
| Rule share range across nodes | 36 to 97 percent | same | |
| Prologue notes: pool / risk / exit | identity 28 / claims admin 6 / claims admin 6 | identity 28 / claims admin 6 / Data cloud 16 | changed, as intended |

## 3. Option components at month 60, before and after the rename

The option seed hashes the platform id, so every renamed platform moved slightly. Nothing was tuned.

| platform | before | after |
|---|---|---|
| Identity service | 487,965 | 486,529 |
| Data cloud | 804,644 | 804,644 (id kept) |
| Integration hub | 402,908 | 402,908 (id kept) |
| CRM | 505,097 | 504,716 |
| Service management | 193,975 | 192,858 |
| ERP and ledger | 705,862 | 712,808 |
| HR core | 106,710 | 106,222 |
| Policy administration | 1,039,222 | 1,029,968 |
| Claims administration | 697,475 | 695,810 |
| Billing | 338,774 | 339,954 |
| Business intelligence | 81,952 | 81,272 |
| Marketing automation | 95,263 | 95,028 |
| Document management | 200,001 | 201,646 |
| Payments | 183,902 | 182,396 |
| API gateway | 265,076 | 263,238 |
| Event bus | 314,627 | 313,180 |

Tie-breaks that sort by id flipped only in illustrations:

- the flat prologue map's order among nodes with equal riders;
- which extra platforms the reach cartoon takes down at rho 0.25 and 0.75;
- the reach count on identity for seeds 1 and 42.

Every node the story names is unchanged.

## 4. Strings moved from components into `copy.ts`

| file | keys |
|---|---|
| `Footprint.tsx` | `fp_legend_order`, `fp_legend_faint`, `fp_two_charts` (split into two sentences), `fp_ratified` (split into three), `footprint_chart_aria`; "Plus an option component" deleted by fix two |
| `Boundaries.tsx` | `bd_legend_dashed`, `bd_legend_tap`, `bd_pick`, `bd_merge_note`, `bd_whose`, `boundaries_unchanged` |
| `Risk.tsx` | `rk_legend_ring`, `rk_legend_wire`, `rk_sampled`; the band became `risk_band_note`, `risk_band_sum`, `risk_band_joint`, `risk_band_value` |
| `TwoShapes.tsx` | `ts_same` (30 becomes `{n_uc}`), `ts_highest`, `ts_next_two`, `shapes_exit_rank_h`, `shapes_exit_rank_note` |
| `FixedPool.tsx` | `fx_legend_solid`, `fx_legend_hatched`, `fx_told_h`, `fx_rank_note`, `fx_select` |
| `Explore.tsx` | `ex_hulls` |
| `ExceedanceCurve.tsx` | `ec_sparse` |
| `story/figures.ts` | `exit_not_yet`, `exit_now_value` |
| `DetailPanel.tsx` | the use case exit sentence now uses `walk_u_exit`; switching lines use `sw_created`, `sw_given_up` and the glossary label |
| `story/Controls.tsx` | `shapes_cell_risk`, `shapes_cell_exit` |

## 5. Tests and results

Added:

- `src/audit.test.ts`, 15 tests:
  - the copy lint (dashes, twenty words, the 11 banned phrases);
  - the three story figures;
  - the fixed-point range and its stability;
  - the next use case and the unchanged pool;
  - the switching split;
  - the boundary move, with cost unchanged under three bases and the P99 scaled by exactly 6/18.
- `src/components/fold.test.ts`, 12 tests: the frame, the sign rule, the flat pass, the schedule and the camera.
- Acceptance:
  - V1: one use case everywhere;
  - V2: the range under a 6x throttle;
  - V3: all 41 beats in 2D;
  - V4: the switch at 390 px.
  - Check 7 now scans both built files for every old id and product name.
  - N1, N2 and N5 follow the new text.

Results on the final head:

- `npx tsc -b`: clean.
- `npm test`: 42 of 42 pass.
- `npm run acceptance`: see the final run below.
- Bundle scan: 0 hits in `dist/index.html` and `dist/artifact.html` for "unsplit", "Plus an option component", "split it into", "too high", "the extreme case", "They rarely do", and for every old id and product name.

Final acceptance: 29 pass, 0 fail, 1 not run. The one not run is check 2, which needs one real human to complete the tour.

## 6. Deviations from the brief

1. **Order of work.** Brief v0.4, with sections 2 to 13 identical, was done first, then section 17. The commit groups follow section 14. Groups 2 and 3 were separated hunk by hunk, because both touched `copy.ts` and `DetailPanel.tsx`.
2. **The range row.** It uses fix four's wording, "Claims domain: added up across the slider / USD 200,000 to USD 270,000", not fix one's sketch.
3. **The node line under entry one.** It shows from the meter beat, one beat before the pool is introduced, so the entry has its workings from the start.
4. **The boundary line on the close.** It sits with the workings behind the toggle; the three entry lines show alone.
5. **The next use case.** `mc` is read at the current number of added riders. It is 85.79 to 85.80 at every k, shown as 86. The raw value is 85.795, against 85.80 in the appendix.
6. **One walkthrough heading.** `walk_u_exit_h` still reads "What would strand it". The sentence under it now names the platform and never divides its work.
7. **A hardcoded exit note.** `DetailPanel.tsx` had its own leaving sentence built on `strandedBy`. It now uses `walk_u_exit`, and `strandedBy` is removed.
8. **The fold benchmark.** It lives in `scripts/bench.ts --fold` with `scripts/bench-fold.ts`, and drives the explorer through dev seams. The fold needs the whole app, so `bench.html` is unchanged.
9. **Frame-time targets.** They are not met in this container: an idle frame already takes 33 to 67 ms, with software WebGL and no GPU.
   - The fold's own work is 0.1 ms a frame at the median.
   - I shipped the fold, with 17.12 applied per device: if a fold's median frame exceeds 34 ms, later switches on that page crossfade.
   - The numbers need repeating on a real device.
10. **Stories framed below the wordmark.** In the story, both poses frame the picture below the wordmark using the existing view offset: 60 px on top.
11. **Ignored when picking.** Hidden rings and halos are now ignored when picking. The new default pose faced them to the camera, and they took domain taps (T8).
12. **Recording the videos.** The pinned Playwright expects ffmpeg revision 1010; the machine has 1011. The recordings were made with a scratch browsers path pointing at the installed build. `/opt` was not changed.
13. **Outside the story.** The explorer's fixed pool panel still quotes its first rider, Quote and bind (`s2_number_*`). Fix one covers the story only. It could be moved to the tour use case later.

## 7. Owner decisions

- **O1, `close_caveat`.** Proposed: "The paper measures the choices a commitment removes. It does not yet measure the ones a commitment creates. That work is parked on an open problem." Not changed.
- **O2, entry three's name.** Keep "What leaving would cost", or rename it, for example "What changing course would cost".
- **O3, the boundary finding.** A redrawn line moves risk far more than cost:
  - one use case's bad month goes from 113,261 to 37,754;
  - Sales goes from 361,290 to 280,946;
  - Customer Service goes from 217,837 to 246,686;
  - the largest cost move is USD 1,656 a month, under headcount only.

  The story's boundary beats mention only cost. The README records the table. Show it or not.
- **O4, the prologue reshape.** A separate brief.
- **O5.** "Why it matters" and "Three questions, three places" repeat the same three tiles.
- **O6, story length.** 41 pages.
- **O7, the value-flow beat.** It colours every line by a declared judgment, the thing part two criticises.
- **O8, the work-in-progress note.** It promises a public repository for plugging in telemetry.
- **O9, the public repository.**
  - Git history still holds the old product ids.
  - `LEDGER_EXPLORER_SPEC_v0_1.md` names products and was left as written.
- **O10, the IFRS 17 card.** Indicative. Check the standard before publication.
- **O11, the default view.** It ships with 3D as the default everywhere. Making 2D the story's default is a one-line change in `store.ts`.

## 8. Section 17

**What shipped.** The fold, with the fallback applied per device (deviation 9). Under reduced motion, the switch uses a 150 ms crossfade.

**Flat pass.** The median displacement from the projected spot is 0 percent of the median neighbour distance, and the largest is 42 percent. The target was a median under 10 percent.

**Benchmark.** Ten round trips per scenario, headless Chromium in this container:

| scenario | to 2D / to 3D | frame median | idle frame median | fold work median / worst | frames over 33 ms | geometries, textures | heap | 2D pixel-identical | drift | tap mid-fold |
|---|---|---|---|---|---|---|---|---|---|---|
| desktop, unthrottled | 1,023 / 857 ms | 50 ms | 49.9 ms | 0.1 / 3.5 ms | 100% | 79, 46 unchanged | +1.54 MB | yes | 0 | reverses, no jump |
| desktop, 4x | 1,348 / 1,111 ms | 83 ms | 66.7 ms | 0.1 / 25.5 ms | 100% | unchanged | +1.56 MB | yes | 0 | reverses, no jump |
| 390 px, unthrottled | 996 / 811 ms | 33 ms | 33.3 ms | 0.0 / 3.5 ms | 77% | unchanged | +1.59 MB | yes | 0 | reverses, no jump |
| 390 px, 4x | 1,109 / 917 ms | 50 ms | 49.9 ms | 0.1 / 12.9 ms | 100% | unchanged | +1.54 MB | yes | 0 | reverses, no jump |

Every other target is met. The pixel-identical check masks the switch pill: it overlaps the canvas, and 16 of its own pixels antialias differently between entries.

**Recordings:**

- `recordings/v05-fold-roundtrip-desktop.webm`
- `recordings/v05-fold-roundtrip-phone.webm`

**Stills:**

- `screenshots/v05-fold-{000,025,050,075,100}-{desktop,phone}.png`
- `screenshots/v05-switch-story-phone.png`
- `screenshots/v05-part1-*-2d-*.png`
