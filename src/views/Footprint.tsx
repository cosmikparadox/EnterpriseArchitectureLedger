// View 4, Footprint. Spec section 4.4.
//
// Purpose: show accretion, and show the exit cost that accrues while nobody is
// looking at it.
//
// Canon 9.5.2, 9.5.7 and 9.9, and the owner's two constraints. The chart and
// the ratification sentence quote the work of leaving, an engineering
// estimate, as their only hard figure. The two parts that would replace it,
// the work the commitment created and the choices given up, appear solely
// inside the refusal block. Neither is ever added to the work of leaving.

import { useMemo, useState } from 'react'
import { Graph3D } from '../components/Graph3D'
import { Term, ViewName } from '../components/Hint'
import { Legend } from '../components/Legend'
import { PanelShell } from '../components/PanelShell'
import { Walkthrough, useWalk } from './Walkthrough'
import { FootprintChart, type Series } from '../components/FootprintChart'
import { WKCurve } from '../components/WKCurve'
import { gbp } from '../components/DetailPanel'
import { buildGraph } from '../app/graph'
import { executionComponent, gbpAbout, kCommitted, optionComponent, optionEngineFor, wCurve, workOfLeaving, type Index } from '../model/ledger'
import type { Estate } from '../model/types'
import { copy, fill, glossary, summary } from '../copy'
import { Summary } from '../components/Summary'
import { useLedger } from '../app/store'
import { usePlatformSelection } from '../app/selection'

export interface FootprintProps { estate: Estate; ix: Index; dark: boolean }

const MONTHS = Array.from({ length: 61 }, (_, i) => i)

export function Footprint({ estate, ix, dark }: FootprintProps) {
  const data = useMemo(() => buildGraph(estate, ix), [estate, ix])
  // Spec section 4.4: default the cloud data platform.
  const [selected, setSelected] = usePlatformSelection(estate, 'meridian')
  const cursor = useLedger((s) => s.cursor)
  const setCursor = useLedger((s) => s.setCursor)
  const ratified = useLedger((s) => s.ratified)
  const setRatified = useLedger((s) => s.setRatified)
  const [collapsed, setCollapsed] = useState(false)
  const tourStep = useLedger((s) => s.tourStep)
  const sceneFocus = useLedger((s) => s.scene.focus)
  const [focusing, setFocusing] = useState(false)
  const inStory = tourStep !== null
  const w = useWalk(selected)
  const walkRule = useLedger((s) => s.rule)

  const platform = ix.platformById.get(selected) ?? null
  const riders = platform ? ix.ridersOf.get(platform.id)! : []

  const engine = useMemo(() => {
    if (!platform) return null
    return optionEngineFor(platform, estate.option_model)
  }, [platform, estate.option_model])

  /** Everything about the node at a given month. Riders attach in adoption order. */
  const at = useMemo(() => (m: number) => {
    if (!platform) return null
    if (m < platform.adopted_month) return null
    const attached = riders.filter((r) => r.uc.adopted_month <= m)
    const n = attached.length
    const metered = attached.reduce((a, r) =>
      a + r.uc.volume_per_month * r.edge.driver_units_per_volume_unit * platform.driver_unit_cost_gbp, 0)
    const months = m - platform.adopted_month
    return {
      adopted: true,
      n,
      subdomains: new Set(attached.map((r) => r.uc.subdomain)).size,
      metered,
      // Mean per-rider rule share. Exact under equal split, and the mean under
      // any basis, because canon 9.2.8 requires the shares to sum to the pool.
      perRider: n === 0 ? 0 : platform.fixed_pool_gbp_month / n,
      execution: workOfLeaving(platform, n, months),
      created: executionComponent(platform, n, months),
      option: engine ? optionComponent(engine, platform, n, months) : 0,
      k: kCommitted(platform, n, months),
      months,
      attachedIds: new Set(attached.map((r) => r.uc.id)),
    }
  }, [platform, riders, engine])

  // Two charts on one time axis, not two lines on one y axis.
  //
  // Spec section 4.4 asks for both lines on the same chart. They are not
  // commensurable: metered spend and the rule share are USD PER MONTH, while
  // the execution component is a ONE-OFF USD figure roughly a hundred times
  // larger. Plotting them together flattens the monthly pair onto the axis and
  // implies the two can be compared. They share the time axis and the
  // ratification marker instead, and each carries its unit. Recorded as a
  // deviation.
  const monthly: Series[] = useMemo(() => {
    if (!platform) return []
    const rows = MONTHS.map(at)
    return [
      { label: 'what the bill showed, metered spend', values: rows.map((r) => r?.metered ?? null) },
      { label: 'rule share per rider', values: rows.map((r) => r?.perRider ?? null), faint: true },
    ]
  }, [platform, at])

  const oneOff: Series[] = useMemo(() => {
    if (!platform) return []
    const rows = MONTHS.map(at)
    return [
      { label: 'what it committed you to, the work of leaving', values: rows.map((r) => r?.execution ?? null), dashed: true },
    ]
  }, [platform, at])

  // Before the node was adopted there is nothing on it, but the panel must not
  // vanish: the cursor the viewer is dragging lives in it. Dragging to month 5
  // used to unmount the scrubber under the finger and flip the dim set from
  // everything to nothing, which read as a glitch. A zero state keeps the
  // controls, the charts and the dimming continuous across adoption.
  const EMPTY = useMemo(() => ({
    adopted: false, n: 0, subdomains: 0, metered: 0, perRider: 0, execution: 0, created: 0,
    option: 0, k: 0, months: 0, attachedIds: new Set<string>(),
  }), [])
  const now = at(cursor) ?? EMPTY
  const atRatified = at(ratified) ?? EMPTY
  const dimNodes = useMemo(() => {
    const out = new Set<string>()
    for (const u of estate.use_cases) if (!now.attachedIds.has(u.id) && u.adopted_month > cursor) out.add(u.id)
    return out
  }, [now, estate, cursor])
  // While the month handle is the thing being moved, the picture is this
  // platform and what has attached to it so far, and nothing else.
  const focus = useMemo(() => {
    const on = inStory ? sceneFocus === 'footprint' : focusing
    if (!on || !platform) return null
    return { nodes: new Set([platform.id, ...now.attachedIds]) }
  }, [inStory, sceneFocus, focusing, platform, now])

  return (
    <>
      <div className="topbar">
        <h1>Ledger Explorer</h1>
        <ViewName n={4}>Footprint</ViewName>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
          Ratified as strategic at month
          <input
            type="range" min={0} max={60} step={1} value={ratified}
            onChange={(e) => setRatified(Number(e.target.value))}
            style={{ width: 120 }}
            aria-label="Month the platform was ratified as strategic"
          />
          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{ratified}</strong>
        </label>
      </div>

      <div className={`graphwrap${collapsed ? '' : ' panel-open'}`}>
        <Graph3D
          data={data}
          dark={dark}
          showHulls={false}
          labelMode="selected"
          selectedId={selected}
          isolatedSubdomain={null}
          flyToId={null}
          dimNodes={dimNodes}
          hideLinksOf={dimNodes}
          focus={w.focus ?? focus}
          onSelectNode={(id) => { if (ix.platformById.has(id)) { setSelected(id); setCollapsed(false); setFocusing(false) } }}
          onSelectLink={() => {}}
          onBackground={() => {}}
        />

        <Legend>
          <div>Use cases attach in the order they were adopted.</div>
          <div style={{ marginTop: 4, opacity: 0.85 }}>
            Faint nodes have not arrived yet at month {cursor}.
          </div>
        </Legend>

        <PanelShell
          label="Footprint"
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          tabHint={platform?.name ?? 'Footprint'}
        >
          <h2>{platform?.name ?? 'Select a platform'}</h2>
          {!inStory && platform && <button className="ctl play" onClick={() => w.start(platform.id)}>{copy.walk_play}</button>}
          <div className="kind">{platform?.category ?? ''}</div>
          {platform && (
            <Summary
              head={atRatified.adopted ? summary.s4_head : summary.s4_head_before}
              number={atRatified.adopted ? summary.s4_number : summary.s4_number_before}
              mechanism={summary.s4_mechanism}
              values={{
                name: platform.name,
                ratified,
                adopted: platform.adopted_month,
                n: atRatified.n,
                exec: gbpAbout(atRatified.execution),
              }}
            />
          )}

          {platform && (
            <>
              <section>
                <h3>Over 60 months</h3>
                <FootprintChart
                  months={MONTHS} series={monthly} cursor={cursor} ratified={ratified}
                  onCursor={setCursor} height={150} showScrubber={false} unit="USD per month"
                />
                <FootprintChart
                  months={MONTHS} series={oneOff} cursor={cursor} ratified={ratified}
                  onCursor={(m) => { setCursor(m); setFocusing(true) }} height={150} unit="USD, one off" scrubberTour="month"
                />
                <div className="note">
                  Two charts, one time axis. The monthly bill and the cost of leaving are not
                  the same kind of number and do not share a scale.
                </div>
              </section>

              <section>
                <h3>At month {cursor}</h3>
                <div className="row"><span className="l">Use cases attached</span><span className="v">{now.n}</span></div>
                <div className="row"><span className="l">Subdomains</span><span className="v">{now.subdomains}</span></div>
                <div className="row"><span className="l">Metered spend</span><span className="v">{gbp(now.metered)} /month</span></div>
                <div className="row"><span className="l">Rule share per rider</span><span className="v">{gbp(now.perRider)} /month</span></div>
                <div className="row"><span className="l"><Term k="work_of_leaving">{glossary.work_of_leaving.label}</Term></span><span className="v">about USD {gbpAbout(now.execution)}</span></div>
                {now.adopted && <div className="note">{copy.panel_exec_note}</div>}
                {now.adopted && <div className="note">{copy.footprint_no_add}</div>}
                <div className="note">
                  {now.adopted ? copy.footprint_bill_visible : copy.footprint_not_yet}
                </div>
              </section>

              {atRatified.adopted && (
                <section data-tour="ratify">
                  <h3>Ratified as strategic</h3>
                  <div className="callout">
                    By the time this platform reached the board, {atRatified.n} use cases in{' '}
                    {atRatified.subdomains} subdomains already depended on it and the work
                    of leaving had reached about USD {gbpAbout(atRatified.execution)}. The
                    board ratified a footprint.
                  </div>
                </section>
              )}

              {now.adopted && (
              <section>
                <h3>{copy.panel_section_switching}</h3>
                {/* Canon 9.5.2, 9.5.7 and 9.9. The two parts that would replace
                    the estimate appear only here, inside the same element as
                    the refusal, so a screenshot cannot separate the figures
                    from the refusal. Neither is added to the work of leaving. */}
                <div className="refusal">
                  <div className="note">{copy.switching_replace}</div>
                  <span className="fig">{fill(copy.sw_created, { v: gbpAbout(now.created) })}</span>
                  <span className="fig">{fill(copy.sw_given_up, { v: gbpAbout(now.option) })}</span>
                  <div className="note" style={{ marginTop: 6 }}>{copy.option_tip}</div>
                  <div className="note">{copy.switching_split}</div>
                  {copy.option_refusal}
                  {engine && (
                    <WKCurve curve={wCurve(engine, platform, now.n, now.months)} />
                  )}
                </div>
              </section>
              )}
            </>
          )}
        </PanelShell>
        {!inStory && w.walk && (ix.platformById.has(w.walk) || ix.useCaseById.has(w.walk)) && (
          <Walkthrough ix={ix} rule={walkRule} id={w.walk} step={w.step} onStep={w.setStep} onFocus={w.onFocus} onClose={w.stop} />
        )}
      </div>
    </>
  )
}
