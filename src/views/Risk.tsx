// View 3, Risk. Spec section 4.3.
//
// Purpose: show propagation, and show that risk does not add.

import { useEffect, useMemo, useState } from 'react'
import { Graph3D } from '../components/Graph3D'
import { Hint, Term, ViewName } from '../components/Hint'
import { Legend } from '../components/Legend'
import { PanelShell } from '../components/PanelShell'
import { ExceedanceCurve } from '../components/ExceedanceCurve'
import { gbp } from '../components/DetailPanel'
import { buildGraph } from '../app/graph'
import { useMonteCarlo } from '../app/useMonteCarlo'
import { makeRng } from '../model/rng'
import type { Index } from '../model/ledger'
import type { Estate } from '../model/types'
import { copy, fill } from '../copy'
import { useLedger } from '../app/store'
import { usePlatformSelection } from '../app/selection'

export interface RiskProps { estate: Estate; ix: Index; dark: boolean }

interface FailureRun {
  platformId: string
  affected: Set<string>
  litLinks: Set<string>
  subdomains: Set<string>
  volume: number
}

export function Risk({ estate, ix, dark }: RiskProps) {
  const data = useMemo(() => buildGraph(estate, ix), [estate, ix])
  // Shared: the tour drives all four of these, and rho is the same slider as
  // the one on view 5.
  const [selected, setSelected] = usePlatformSelection(estate, 'meridian')
  const rho = useLedger((s) => s.rho)
  const setRho = useLedger((s) => s.setRho)
  const storedSubdomain = useLedger((s) => s.subdomain)
  const setStoredSubdomain = useLedger((s) => s.setSubdomain)
  const subdomain = storedSubdomain ?? estate.subdomains[0]!.id
  const failRequest = useLedger((s) => s.failRequest)
  const requestFail = useLedger((s) => s.failIt)
  const clearFailRequest = useLedger((s) => s.clearFailRequest)
  // Local: nothing outside this view has an opinion about them.
  const [runs, setRuns] = useState(10_000)
  const [budget, setBudget] = useState(500_000)
  const [collapsed, setCollapsed] = useState(false)
  const [failure, setFailure] = useState<FailureRun | null>(null)
  const [phase, setPhase] = useState(0)

  const mc = useMonteCarlo(estate, rho, runs)
  const isPlatform = ix.platformById.has(selected)
  const platform = isPlatform ? ix.platformById.get(selected)! : null

  // ---- "Fail it". The button no longer samples; it raises a request on the
  // store, and this effect answers it. That is what lets a tour step fail a node
  // without reaching into this component, and it is why the request carries a
  // nonce: pressing Fail it twice on the same node has to be two events, because
  // spec section 4.3 asks for a fresh pattern each press.
  useEffect(() => {
    if (!failRequest) return
    const p = ix.platformById.get(failRequest.nodeId)
    if (!p) return
    const rng = makeRng(0xf1a1 ^ (failRequest.nonce * 2654435761))
    const affected = new Set<string>()
    const litLinks = new Set<string>()
    const subdomains = new Set<string>()
    let volume = 0
    for (const r of ix.ridersOf.get(p.id)!) {
      if (rng.next() < r.edge.conditional_failure_prob) {
        affected.add(r.uc.id)
        litLinks.add(`${r.uc.id}>${p.id}`)
        subdomains.add(r.uc.subdomain)
        volume += r.uc.volume_per_month
      }
    }
    setFailure({ platformId: p.id, affected, litLinks, subdomains, volume })
    setPhase(1)
  }, [failRequest, ix])

  // Edges light outward after the node pulses. One hop here, because a use case
  // does not propagate on to another platform in this model.
  useEffect(() => {
    if (phase !== 1) return
    const t = setTimeout(() => setPhase(2), 420)
    return () => clearTimeout(t)
  }, [phase])

  const sub = mc.result?.subdomains.find((s) => s.id === subdomain) ?? null
  const subName = estate.subdomains.find((s) => s.id === subdomain)?.name ?? subdomain
  const platformStats = mc.result?.platforms.find((p) => p.id === selected) ?? null

  // The band the dependence slider spans, in GBP. Spec section 4.3.
  const [band, setBand] = useState<{ lo: number; hi: number } | null>(null)
  useEffect(() => {
    if (!sub) return
    setBand((b) => {
      const lo = b ? Math.min(b.lo, sub.jointP99) : sub.jointP99
      const hi = b ? Math.max(b.hi, sub.jointP99) : sub.jointP99
      return { lo, hi }
    })
  }, [sub])
  useEffect(() => { setBand(null) }, [subdomain, runs])

  return (
    <>
      <div className="topbar">
        <h1>Ledger Explorer</h1>
        <ViewName n={3}>Risk</ViewName>
        <button className="ctl" onClick={() => platform && requestFail(platform.id)} disabled={!platform}>
          Fail it
        </button>
        {failure && <button className="ctl" onClick={() => { setFailure(null); setPhase(0); clearFailRequest() }}>Clear</button>}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
          <Hint tip={copy.dependence_low_tip}><span className="term">{copy.dependence_low}</span></Hint>
          <input
            type="range" min={0} max={1} step={0.05} value={rho}
            onChange={(e) => setRho(Number(e.target.value))}
            aria-label="Dependence between platform failures, rho"
            style={{ width: 130 }}
          />
          <span>{copy.dependence_high}</span>
          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>rho {rho.toFixed(2)}</strong>
        </label>
        <button
          className="ctl"
          disabled={mc.offline}
          onClick={() => setRuns((r) => (r === 10_000 ? 100_000 : 10_000))}
        >
          {(mc.offline ? mc.result?.runs ?? runs : runs).toLocaleString('en-GB')} runs
        </button>
        <span className="sub">{mc.offline ? 'stored' : mc.running ? 'running' : `${mc.elapsedMs} ms`}</span>
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
          failedNodeId={failure ? failure.platformId : null}
          affectedUseCases={phase >= 2 && failure ? failure.affected : undefined}
          litLinks={phase >= 2 && failure ? failure.litLinks : undefined}
          onSelectNode={(id) => { setSelected(id); setFailure(null); setPhase(0); clearFailRequest(); setCollapsed(false) }}
          onSelectLink={() => {}}
          onBackground={() => {}}
        />

        <Legend>
          <div><span className="glyph">O</span> pulsing ring: the node you failed</div>
          <div><span className="glyph">#</span> wireframe: use case interrupted</div>
          <div style={{ marginTop: 4, opacity: 0.85 }}>{copy.copula_note}</div>
        </Legend>

        <PanelShell
          label="Risk"
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          tabHint={platform ? platform.name : 'Risk'}
        >
          <h2>{platform ? platform.name : 'Select a platform'}</h2>
          <div className="kind">{platform?.category ?? ''}</div>

          {mc.offline && mc.snappedRho !== null && (
            <div className="note" role="status">
              {fill(copy.mc_offline, {
                runs: (mc.result?.runs ?? 0).toLocaleString('en-GB'),
                rho: mc.snappedRho.toFixed(2),
              })}
            </div>
          )}

          {failure && (
            <section>
              <h3><Term k="blast_radius">Blast radius</Term>, this run</h3>
              <div className="row"><span className="l"><Term k="conditional_failure">Use cases affected</Term></span><span className="v">{failure.affected.size}</span></div>
              <div className="row"><span className="l">Subdomains crossed</span><span className="v">{failure.subdomains.size}</span></div>
              <div className="row"><span className="l">Volume interrupted</span><span className="v">{failure.volume.toLocaleString('en-GB')} /month</span></div>
              <div className="note">
                Sampled from each edge's conditional failure probability. Press Fail it again
                for a different pattern.
              </div>
            </section>
          )}

          {platformStats && (
            <section>
              <h3>Loss exceedance, {platform?.name}</h3>
              <ExceedanceCurve
                points={platformStats.exceedance}
                budget={budget}
                onBudget={setBudget}
                label={platform?.name ?? ''}
              />
            </section>
          )}

          <section>
            <h3>Does risk add?</h3>
            <select
              className="ctl"
              value={subdomain}
              onChange={(e) => setStoredSubdomain(e.target.value)}
              aria-label="Subdomain for the non-additivity exhibit"
              style={{ width: '100%', marginBottom: 6 }}
            >
              {estate.subdomains.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {sub ? (
              <>
                <div className="row">
                  <span className="l"><Term k="sum_of_p99">Sum of per-use-case P99 losses</Term></span>
                  <span className="v">{gbp(sub.sumOfP99s)}</span>
                </div>
                <div className="row">
                  <span className="l"><Term k="joint_p99">P99 of the subdomain&apos;s joint loss</Term></span>
                  <span className="v">{gbp(sub.jointP99)}</span>
                </div>
                <div className="callout">{copy.view3_nonadd}</div>
                <div className="row">
                  <span className="l">Gap at rho {rho.toFixed(2)}</span>
                  <span className="v">{(sub.gap * 100).toFixed(1)} percent</span>
                </div>
                {band && band.hi > band.lo && (
                  <div className="row">
                    <span className="l">Band spanned by the slider</span>
                    <span className="v">{gbp(band.hi - band.lo)}</span>
                  </div>
                )}
                <div className="note">{copy.no_total}</div>
              </>
            ) : <div className="note">Running.</div>}
          </section>

          {sub && (
            <section>
              <h3>Loss exceedance, {subName} joint</h3>
              <ExceedanceCurve points={sub.exceedance} budget={budget} onBudget={setBudget} label={subName} />
            </section>
          )}
        </PanelShell>
      </div>
    </>
  )
}
