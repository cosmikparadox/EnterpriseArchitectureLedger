// View 2, Fixed pool. Spec section 4.2.
//
// Purpose: make the meter-versus-rule split visible. There is no figure called
// "true cost" here, because there is none.

import { useMemo, useState } from 'react'
import { Graph3D } from '../components/Graph3D'
import { Hint, Term, ViewName } from '../components/Hint'
import { Legend } from '../components/Legend'
import { gbp } from '../components/DetailPanel'
import { buildGraph, withSyntheticRiders, type GNode } from '../app/graph'
import { buildIndex, c1, edgeSpend, meteredSpend, reportedCost, ruleShare } from '../model/ledger'
import type { AllocationRule, Estate } from '../model/types'
import { copy, fill, glossary, summary } from '../copy'
import { Summary } from '../components/Summary'
import { useLedger } from '../app/store'
import { usePlatformSelection } from '../app/selection'
import { RuleSelect } from '../components/RuleSelect'
import { PanelShell } from '../components/PanelShell'
import { Walkthrough, useWalk } from './Walkthrough'

export interface FixedPoolProps {
  estate: Estate
  dark: boolean
  rule: AllocationRule
  setRule: (r: AllocationRule) => void
}

export function FixedPool({ estate: base, dark, rule, setRule }: FixedPoolProps) {
  // Identity is the node the spec's ten-second test uses, so it opens selected
  // when nothing else is selected.
  const [selected, setSelected] = usePlatformSelection(base, 'identity')
  const added = useLedger((s) => s.fanInAdded)
  const setAdded = useLedger((s) => s.setFanInAdded)
  const [showC1, setShowC1] = useState(true)
  const [showRank, setShowRank] = useState(false)
  const [watched, setWatched] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  // Focus: while the fan-in slider is the thing being moved, the picture is
  // the chosen node and its riders and nothing else. The story asks for it
  // on its beats; outside the story the first touch of the slider asks.
  const tourStep = useLedger((s) => s.tourStep)
  const sceneFocus = useLedger((s) => s.scene.focus)
  const [focusing, setFocusing] = useState(false)
  const inStory = tourStep !== null
  const w = useWalk(selected)

  const estate = useMemo(() => withSyntheticRiders(base, selected, added), [base, selected, added])
  const ix = useMemo(() => buildIndex(estate), [estate])
  // The estate as it stands with nothing added, for the summary's before figure.
  const ixBase = useMemo(() => buildIndex(base), [base])
  const data = useMemo(() => buildGraph(estate, ix), [estate, ix])

  const isPlatform = ix.platformById.has(selected)
  const riders = isPlatform ? ix.ridersOf.get(selected)! : []
  const platform = isPlatform ? ix.platformById.get(selected)! : null
  const focus = useMemo(() => {
    const on = inStory ? sceneFocus === 'riders' : focusing
    if (!on || !isPlatform) return null
    return { nodes: new Set([selected, ...riders.map((r) => r.uc.id)]) }
  }, [inStory, sceneFocus, focusing, isPlatform, selected, riders])
  // What the basis moved on this node, against the default equal split.
  const basisMoved = useMemo(() => {
    if (!platform) return null
    let n = 0, max = 0
    for (const r of riders) {
      const d = Math.abs(ruleShare(ix, platform.id, r.uc.id, rule) - ruleShare(ix, platform.id, r.uc.id, 'equal'))
      if (d > 0.5) { n++; max = Math.max(max, d) }
    }
    return { n, max }
  }, [platform, riders, ix, rule])
  const basisName = rule === 'equal' ? 'equal split' : rule === 'driver' ? 'driver-proportional' : rule === 'by_volume' ? 'by volume' : 'by headcount'

  // The ring split per node: metered share solid, rule share hatched.
  const nodeRing = useMemo(() => (n: GNode) => {
    if (n.kind === 'use_case') return null
    const p = ix.platformById.get(n.id)
    if (!p) return null
    const metered = meteredSpend(ix, n.id)
    const total = metered + p.fixed_pool_gbp_month
    return { meteredFrac: total === 0 ? 1 : metered / total }
  }, [ix])

  const ranked = useMemo(() =>
    estate.platforms
      .map((p) => ({ p, c1: c1(ix, p.id), riders: ix.ridersOf.get(p.id)!.length }))
      .sort((a, b) => b.c1 - a.c1),
    [estate, ix])

  const watchedRow = useMemo(() => {
    if (!platform || !watched) return null
    const r = riders.find((x) => x.uc.id === watched)
    if (!r) return null
    const reported = reportedCost(ix, platform.id, r.uc.id, rule)
    const byRule = ruleShare(ix, platform.id, r.uc.id, rule)
    return { name: r.uc.name, reported, byRule, share: reported === 0 ? 0 : byRule / reported }
  }, [platform, watched, riders, ix, rule])

  return (
    <>
      <div className="topbar">
        <h1>Ledger Explorer</h1>
        <ViewName n={2}>Fixed pool</ViewName>
        <RuleSelect rule={rule} setRule={setRule} />
        <Hint tip={glossary.c1.tip}>
          <button className="ctl" aria-pressed={showC1} onClick={() => setShowC1((v) => !v)}>
            {copy.c1_annotation}
          </button>
        </Hint>
        <Hint tip={copy.rank_tip}>
          <button className="ctl" aria-pressed={showRank} onClick={() => setShowRank((v) => !v)}>
            Rank nodes by rule share
          </button>
        </Hint>
      </div>

      <div className={`graphwrap${collapsed ? '' : ' panel-open'}`}>
        <Graph3D
          data={data}
          dark={dark}
          showHulls={false}
          labelMode="all"
          selectedId={selected}
          isolatedSubdomain={null}
          flyToId={null}
          nodeRing={nodeRing}
          focus={w.focus ?? focus}
          // A rider tapped in the panel lights on the canvas: its line to
          // this platform, and a ring with its name.
          litLinks={watched && platform ? new Set([`${watched}>${platform.id}`]) : undefined}
          callout={!inStory && watched ? { kind: 'node', id: watched, text: ix.useCaseById.get(watched)?.name ?? '' } : null}
          onSelectNode={(id) => { setSelected(id); setAdded(0); setWatched(null); setCollapsed(false); setFocusing(false) }}
          onSelectLink={() => {}}
          onBackground={() => {}}
        />

        <Legend>
          <div><span className="glyph">O</span> {copy.fx_legend_solid}</div>
          <div><span className="glyph">/</span> {copy.fx_legend_hatched}</div>
          <div style={{ marginTop: 4, opacity: 0.85 }}>{copy.view2_hint}</div>
        </Legend>

        <PanelShell
          label="Fixed pool controls"
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          tabHint={platform ? platform.name : 'Fixed pool'}
        >
          {platform ? (
            <>
              <h2>{platform.name}</h2>
              {!inStory && <button className="ctl play" onClick={() => { setWatched(null); w.start(platform.id) }}>{copy.walk_play}</button>}
              <div className="kind">{platform.category}</div>
              {(() => {
                const first = ixBase.ridersOf.get(platform.id)?.[0]?.uc
                const baseFig = first ? reportedCost(ixBase, platform.id, first.id, rule) : 0
                const nowFig = first ? reportedCost(ix, platform.id, first.id, rule) : 0
                return (
                  <Summary
                    head={summary.s2_head}
                    number={added > 0 ? summary.s2_number_moved : summary.s2_number_idle}
                    mechanism={summary.s2_mechanism}
                    values={{
                      name: platform.name,
                      pool: Math.round(platform.fixed_pool_gbp_month).toLocaleString('en-GB'),
                      first: first?.name ?? '',
                      base: Math.round(baseFig).toLocaleString('en-GB'),
                      now: Math.round(nowFig).toLocaleString('en-GB'),
                      added,
                    }}
                  />
                )
              })()}

              <section>
                <h3><Term k="fan_in" /></h3>
                <label style={{ display: 'block', marginBottom: 4 }} data-tour="fanin">
                  Add use cases riding this node: <strong>{added}</strong>
                  <input
                    type="range" min={0} max={24} value={added}
                    onChange={(e) => { setAdded(Number(e.target.value)); setFocusing(true) }}
                    style={{ width: '100%' }}
                    aria-label="Add synthetic use cases riding this platform"
                  />
                </label>
                <div className="callout" key={rule}>
                  {rule === 'equal' ? copy.basis_equal
                    : basisMoved && basisMoved.n > 0 ? fill(copy.basis_moved, { basis: basisName, n: basisMoved.n, riders: riders.length, max: Math.round(basisMoved.max).toLocaleString('en-GB') })
                    : fill(copy.basis_same, { basis: basisName })}
                </div>
                <div className="row"><span className="l">Use cases riding</span><span className="v">{riders.length}</span></div>
                <div className="row"><span className="l"><Term k="fixed_pool" /></span><span className="v">{gbp(platform.fixed_pool_gbp_month)} /month</span></div>
                <div className="row"><span className="l"><Term k="metered_spend" /></span><span className="v">{gbp(meteredSpend(ix, platform.id))} /month</span></div>
                {showC1 && (
                  <div className="row">
                    <span className="l"><Term k="c1">Rule share of reported cost</Term></span>
                    <span className="v">{(c1(ix, platform.id) * 100).toFixed(1)} percent</span>
                  </div>
                )}
                <div className="callout">{copy.view2_hint}</div>
              </section>

              <section data-tour="riders">
                <h3>{copy.fx_told_h}</h3>
                <div>
                  {riders.map((r) => {
                    const byRule = ruleShare(ix, platform.id, r.uc.id, rule)
                    const metered = edgeSpend(r.uc, r.edge, platform)
                    return (
                      <button
                        key={r.uc.id}
                        onClick={() => setWatched(r.uc.id)}
                        aria-pressed={watched === r.uc.id}
                        className="ctl"
                        style={{
                          display: 'flex', justifyContent: 'space-between', width: '100%',
                          textAlign: 'left', marginBottom: 3, gap: 8,
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.uc.name}</span>
                        <span className="flash" key={Math.round(byRule)} style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                          {gbp(metered)} + {gbp(byRule)}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="note">metered + rule. Tap one to read the annotation.</div>
              </section>

              {watchedRow && (
                <section>
                  <h3>{copy.c1_annotation}</h3>
                  <div className="callout">
                    Of the {gbp(watchedRow.reported)} this use case is told it costs here,{' '}
                    {gbp(watchedRow.byRule)} ({(watchedRow.share * 100).toFixed(0)} percent) is
                    allocated by rule, not observed.
                  </div>
                  <div className="note">{copy.fixed_share_warning}</div>
                </section>
              )}

              {showRank && (
                <section>
                  <h3>Ranked by rule share</h3>
                  {ranked.map((r) => (
                    <div className="row" key={r.p.id}>
                      <span className="l">{r.p.name}</span>
                      <span className="v">{(r.c1 * 100).toFixed(1)} percent</span>
                    </div>
                  ))}
                  <div className="note">{copy.fx_rank_note}</div>
                </section>
              )}
            </>
          ) : (
            <div className="note">{copy.fx_select}</div>
          )}
        </PanelShell>
        {!inStory && w.walk && ix.platformById.has(w.walk) && (
          <Walkthrough ix={ix} rule={rule} id={w.walk} step={w.step} onStep={w.setStep} onFocus={w.onFocus} onClose={w.stop} />
        )}
      </div>
    </>
  )
}
