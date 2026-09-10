// View 2, Fixed pool. Spec section 4.2.
//
// Purpose: make the meter-versus-rule split visible. There is no figure called
// "true cost" here, because there is none.

import { useMemo, useState } from 'react'
import { Graph3D } from '../components/Graph3D'
import { gbp } from '../components/DetailPanel'
import { buildGraph, withSyntheticRiders, type GNode } from '../app/graph'
import { buildIndex, c1, edgeSpend, meteredSpend, reportedCost, ruleShare } from '../model/ledger'
import type { AllocationRule, Estate } from '../model/types'
import { copy } from '../copy'
import { RuleSelect } from '../components/RuleSelect'
import { PanelShell } from '../components/PanelShell'

export interface FixedPoolProps {
  estate: Estate
  dark: boolean
  rule: AllocationRule
  setRule: (r: AllocationRule) => void
}

export function FixedPool({ estate: base, dark, rule, setRule }: FixedPoolProps) {
  // Identity is the node the spec's ten-second test uses, so it opens selected.
  const [selected, setSelected] = useState<string>('okta')
  const [added, setAdded] = useState(0)
  const [showC1, setShowC1] = useState(true)
  const [showRank, setShowRank] = useState(false)
  const [watched, setWatched] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  const estate = useMemo(() => withSyntheticRiders(base, selected, added), [base, selected, added])
  const ix = useMemo(() => buildIndex(estate), [estate])
  const data = useMemo(() => buildGraph(estate, ix), [estate, ix])

  const isPlatform = ix.platformById.has(selected)
  const riders = isPlatform ? ix.ridersOf.get(selected)! : []
  const platform = isPlatform ? ix.platformById.get(selected)! : null

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
        <span className="sub">Fixed pool</span>
        <RuleSelect rule={rule} setRule={setRule} />
        <button className="ctl" aria-pressed={showC1} onClick={() => setShowC1((v) => !v)}>
          C1 annotation
        </button>
        <button className="ctl" aria-pressed={showRank} onClick={() => setShowRank((v) => !v)}>
          Rank nodes by rule share
        </button>
      </div>

      <div className="graphwrap">
        <Graph3D
          data={data}
          dark={dark}
          showHulls={false}
          labelMode="all"
          selectedId={selected}
          isolatedSubdomain={null}
          flyToId={null}
          nodeRing={nodeRing}
          onSelectNode={(id) => { setSelected(id); setAdded(0); setWatched(null); setCollapsed(false) }}
          onSelectLink={() => {}}
          onBackground={() => {}}
        />

        <div className="legend">
          <div><span className="glyph">O</span> solid arc: metered, a meter reading</div>
          <div><span className="glyph">/</span> hatched arc: rule, an allocation</div>
          <div style={{ marginTop: 4, opacity: 0.85 }}>{copy.view2_hint}</div>
        </div>

        <PanelShell
          label="Fixed pool controls"
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          tabHint={platform ? platform.name : 'Fixed pool'}
        >
          {platform ? (
            <>
              <h2>{platform.name}</h2>
              <div className="kind">{platform.category}</div>

              <section>
                <h3>Fan-in</h3>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Add use cases riding this node: <strong>{added}</strong>
                  <input
                    type="range" min={0} max={24} value={added}
                    onChange={(e) => setAdded(Number(e.target.value))}
                    style={{ width: '100%' }}
                    aria-label="Add synthetic use cases riding this platform"
                  />
                </label>
                <div className="row"><span className="l">Use cases riding</span><span className="v">{riders.length}</span></div>
                <div className="row"><span className="l">Fixed pool</span><span className="v">{gbp(platform.fixed_pool_gbp_month)} /month</span></div>
                <div className="row"><span className="l">Metered spend</span><span className="v">{gbp(meteredSpend(ix, platform.id))} /month</span></div>
                {showC1 && (
                  <div className="row">
                    <span className="l">Rule share of reported cost</span>
                    <span className="v">{(c1(ix, platform.id) * 100).toFixed(1)} percent</span>
                  </div>
                )}
                <div className="callout">{copy.view2_hint}</div>
              </section>

              <section>
                <h3>What each rider is told it costs here</h3>
                <div style={{ maxHeight: 260, overflow: 'auto' }}>
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
                        <span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                          {gbp(metered)} + {gbp(byRule)}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="note">metered + rule. Tap one to read the annotation.</div>
              </section>

              {showC1 && watchedRow && (
                <section>
                  <h3>C1 annotation</h3>
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
                  <div className="note">
                    Ranking within one axis is one of the three things that survives when the
                    total is refused. See the Ledger paper.
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="note">Select a platform or integration node.</div>
          )}
        </PanelShell>
      </div>
    </>
  )
}
