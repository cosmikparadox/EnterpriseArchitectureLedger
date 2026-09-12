// View 5, Two shapes. Spec section 4.5.
//
// Purpose: concentration versus best of breed, honestly. The tool never says
// which to pick. It shows both and names what moved.
//
// Every readout is PER SUBDOMAIN and none of them is totalled, per spec hard
// rule D and canon 9.8.3.

import { useMemo, useState } from 'react'
import { Graph3D } from '../components/Graph3D'
import { Hint, Term, ViewName } from '../components/Hint'
import { PanelShell } from '../components/PanelShell'
import { gbp } from '../components/DetailPanel'
import { buildGraph } from '../app/graph'
import { useMonteCarlo } from '../app/useMonteCarlo'
import {
  buildIndex, c1, edgeSpend, executionComponent, kCommitted, reportedCost, ruleShare,
} from '../model/ledger'
import type { AllocationRule, Estate } from '../model/types'
import { copy, fill, summary } from '../copy'
import { Summary } from '../components/Summary'
import { useLedger, DEFAULT_RHO } from '../app/store'
import { RuleSelect } from '../components/RuleSelect'

export interface TwoShapesProps {
  concentrated: Estate
  bestOfBreed: Estate
  dark: boolean
  rule: AllocationRule
  setRule: (r: AllocationRule) => void
}

const AS_AT = 60

interface Shape {
  label: string
  estate: Estate
  ix: ReturnType<typeof buildIndex>
}

function shapeStats(shape: Shape, rule: AllocationRule) {
  const { ix, estate } = shape
  const perSubdomain = estate.subdomains.map((s) => {
    const ucs = estate.use_cases.filter((u) => u.subdomain === s.id)
    let metered = 0, rule_ = 0, reported = 0, volume = 0
    for (const u of ucs) {
      volume += u.volume_per_month
      for (const e of u.edges) {
        const p = ix.platformById.get(e.platform_id)!
        metered += edgeSpend(u, e, p)
        rule_ += ruleShare(ix, p.id, u.id, rule)
        reported += reportedCost(ix, p.id, u.id, rule)
      }
    }
    return {
      id: s.id,
      name: s.name,
      meteredPerUnit: volume === 0 ? 0 : metered / volume,
      ruleProportion: reported === 0 ? 0 : rule_ / reported,
    }
  })

  // Blast radius by monthly volume at risk. Reported, not asserted: which node
  // TYPE leads is a finding about the shape, not something the tool arranges.
  const blast = estate.platforms.map((p) => ({
    p,
    volume: ix.ridersOf.get(p.id)!.reduce((a, r) => a + r.uc.volume_per_month * r.edge.conditional_failure_prob, 0),
  })).sort((a, b) => b.volume - a.volume)

  const exits = estate.platforms.map((p) => {
    const n = ix.ridersOf.get(p.id)!.length
    return { p, exec: executionComponent(p, n, AS_AT - p.adopted_month), k: kCommitted(p, n, AS_AT - p.adopted_month) }
  }).sort((a, b) => b.exec - a.exec)

  const integrationExecSum = exits
    .filter((e) => e.p.type === 'integration')
    .reduce((a, e) => a + e.exec, 0)

  const maxC1 = estate.platforms
    .map((p) => ({ p, v: c1(ix, p.id) }))
    .sort((a, b) => b.v - a.v)[0]!

  return { perSubdomain, blast, exits, integrationExecSum, maxC1 }
}

export function TwoShapes({ concentrated, bestOfBreed, dark, rule, setRule }: TwoShapesProps) {
  const left: Shape = useMemo(() => ({ label: 'Concentrated', estate: concentrated, ix: buildIndex(concentrated) }), [concentrated])
  const right: Shape = useMemo(() => ({ label: 'Best of breed', estate: bestOfBreed, ix: buildIndex(bestOfBreed) }), [bestOfBreed])
  const leftData = useMemo(() => buildGraph(left.estate, left.ix), [left])
  const rightData = useMemo(() => buildGraph(right.estate, right.ix), [right])

  // Shared with view 3. This used to be hard coded at 0.5 with no setter, so
  // the comparison could only ever be read at the midpoint.
  const rho = useLedger((s) => s.rho)
  const setRho = useLedger((s) => s.setRho)
  const resetRho = useLedger((s) => s.resetRho)
  const [collapsed, setCollapsed] = useState(false)
  const [which, setWhich] = useState<'left' | 'right'>('left')
  // Side by side reads better for shape; stacked gives each estate the full
  // width, which is what you want when the labels are what you are comparing.
  const [stacked, setStacked] = useState(false)

  const mcLeft = useMonteCarlo(concentrated, rho, 10_000)
  const mcRight = useMonteCarlo(bestOfBreed, rho, 10_000, 4, 20260906)

  const sl = useMemo(() => shapeStats(left, rule), [left, rule])
  const sr = useMemo(() => shapeStats(right, rule), [right, rule])

  const Row = ({ l, a, b }: { l: string; a: string; b: string }) => (
    <div className="cmp">
      <span className="cl">{l}</span>
      <span className="ca">{a}</span>
      <span className="cb">{b}</span>
    </div>
  )

  /**
   * The one sentence difference between the two pictures. Without it the
   * comparison is two grey clouds that look alike, and the lesson is invisible.
   */
  const headline = (shape: Shape) => {
    const ranked = shape.estate.platforms
      .map((pl) => ({ pl, n: shape.ix.ridersOf.get(pl.id)?.length ?? 0 }))
      .sort((a, b) => b.n - a.n)
    const top = ranked[0]
    const busy = ranked.filter((r) => r.n >= 8).length
    return { topName: top?.pl.name ?? '', topRiders: top?.n ?? 0, busy }
  }
  const hl = { left: headline(left), right: headline(right) }

  const subId = useLedger((s) => s.subdomain) ?? 'claims'
  const subName = concentrated.subdomains.find((s) => s.id === subId)?.name ?? subId

  const p99 = (mc: typeof mcLeft, id: string) =>
    mc.result?.subdomains.find((s) => s.id === id)?.jointP99 ?? null

  return (
    <>
      <div className="topbar">
        <h1>Ledger Explorer</h1>
        <ViewName n={5}>Two shapes</ViewName>
        <RuleSelect rule={rule} setRule={setRule} />
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
          <Hint tip={copy.dependence_low_tip}><span className="term">{copy.dependence_low}</span></Hint>
          <input
            type="range" min={0} max={1} step={0.05} value={rho}
            onChange={(e) => setRho(Number(e.target.value))}
            aria-label="Dependence between platform failures, rho"
            style={{ width: 110 }}
          />
          <span>{copy.dependence_high}</span>
          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>rho {rho.toFixed(2)}</strong>
        </label>
        <button
          className="ctl"
          onClick={resetRho}
          disabled={rho === DEFAULT_RHO}
          title={copy.rho_reset_tip}
        >
          Reset to {DEFAULT_RHO.toFixed(2)}
        </button>
        <span className="sub">10,000 runs</span>
        <button className="ctl" onClick={() => setWhich((w) => (w === 'left' ? 'right' : 'left'))}>
          Show: {which === 'left' ? 'Concentrated' : 'Best of breed'}
        </button>
        <button className="ctl" aria-pressed={stacked} onClick={() => setStacked((v) => !v)}>
          {stacked ? 'Split: stacked' : 'Split: side by side'}
        </button>
      </div>


      <div className={`graphwrap split${stacked ? ' stacked' : ''}${collapsed ? '' : ' panel-open'}`}>
        <div className="half">
          <div className="half-title" data-tour="caption-left">
            Concentrated
            <span className="half-note">
              busiest node {hl.left.topName}, {hl.left.topRiders} use cases ride it
              {' | '}{hl.left.busy} nodes carry eight or more
            </span>
          </div>
          <Graph3D
            data={leftData} dark={dark} showHulls={false} labelMode="hubs"
            selectedId={null} isolatedSubdomain={null} flyToId={null}
            onSelectNode={() => {}} onSelectLink={() => {}} onBackground={() => {}}
          />
        </div>
        <div className="half">
          <div className="half-title" data-tour="caption-right">
            Best of breed
            <span className="half-note">
              busiest node {hl.right.topName}, {hl.right.topRiders} use cases ride it
              {' | '}{hl.right.busy} nodes carry eight or more
            </span>
          </div>
          <Graph3D
            data={rightData} dark={dark} showHulls={false} labelMode="hubs"
            selectedId={null} isolatedSubdomain={null} flyToId={null}
            onSelectNode={() => {}} onSelectLink={() => {}} onBackground={() => {}}
          />
        </div>

        <PanelShell
          label="Two shapes"
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          tabHint="Two shapes"
        >
          <h2>Concentrated against best of breed</h2>
          <div className="kind">Same 30 use cases, wired two ways</div>
          <Summary
            head={summary.s5_head} number={summary.s5_number} mechanism={summary.s5_mechanism}
            values={{
              n_uc: concentrated.use_cases.length,
              left_top: hl.left.topRiders,
              right_top: hl.right.topRiders,
              sub: subName,
              left: p99(mcLeft, subId) === null ? '...' : Math.round(p99(mcLeft, subId)!).toLocaleString('en-GB'),
              right: p99(mcRight, subId) === null ? '...' : Math.round(p99(mcRight, subId)!).toLocaleString('en-GB'),
            }}
          />

          <div className="callout">{copy.view5_land}</div>

          <section>
            <h3>Per-unit metered cost, by subdomain</h3>
            <Row l="" a="concentrated" b="best of breed" />
            {sl.perSubdomain.map((s, i) => (
              <Row key={s.id} l={s.name}
                a={gbp(s.meteredPerUnit, 3)}
                b={gbp(sr.perSubdomain[i]!.meteredPerUnit, 3)} />
            ))}
          </section>

          <section>
            <h3>Rule share of <Term k="reported_cost">reported cost</Term>, by subdomain</h3>
            <Row l="" a="concentrated" b="best of breed" />
            {sl.perSubdomain.map((s, i) => (
              <Row key={s.id} l={s.name}
                a={`${(s.ruleProportion * 100).toFixed(1)}%`}
                b={`${(sr.perSubdomain[i]!.ruleProportion * 100).toFixed(1)}%`} />
            ))}
            <div className="note">
              Highest on a single node: {sl.maxC1.p.name} at {(sl.maxC1.v * 100).toFixed(1)} percent
              on the left, {sr.maxC1.p.name} at {(sr.maxC1.v * 100).toFixed(1)} percent on the right.
            </div>
          </section>

          <section data-tour="p99">
            <h3>Joint P99 loss, by subdomain</h3>
            <Row l="" a="concentrated" b="best of breed" />
            {concentrated.subdomains.map((s) => {
              const a = p99(mcLeft, s.id), b = p99(mcRight, s.id)
              return <Row key={s.id} l={s.name} a={a === null ? '...' : gbp(a)} b={b === null ? '...' : gbp(b)} />
            })}
            <div className="note">{copy.no_total}</div>
            {mcLeft.offline && mcLeft.snappedRho !== null && (
              <div className="note" role="status">
                {fill(copy.mc_offline, {
                  runs: (mcLeft.result?.runs ?? 0).toLocaleString('en-GB'),
                  rho: mcLeft.snappedRho.toFixed(2),
                })}
              </div>
            )}
          </section>

          <section>
            <h3>Largest single blast radius</h3>
            <Row l="node" a={sl.blast[0]!.p.name} b={sr.blast[0]!.p.name} />
            <Row l="type" a={sl.blast[0]!.p.type} b={sr.blast[0]!.p.type} />
            <Row l="volume at risk"
              a={Math.round(sl.blast[0]!.volume).toLocaleString('en-GB')}
              b={Math.round(sr.blast[0]!.volume).toLocaleString('en-GB')} />
            <div className="note">
              Next two on the right: {sr.blast[1]!.p.name} ({sr.blast[1]!.p.type}) and{' '}
              {sr.blast[2]!.p.name} ({sr.blast[2]!.p.type}).
            </div>
          </section>

          <section>
            <h3>Execution component of leaving, largest single</h3>
            <Row l="node" a={sl.exits[0]!.p.name} b={sr.exits[0]!.p.name} />
            <Row l="execution" a={gbp(sl.exits[0]!.exec)} b={gbp(sr.exits[0]!.exec)} />
            <div className="refusal">
              <span className="fig">
                Sum across integration commitments: {gbp(sl.integrationExecSum)} left,{' '}
                {gbp(sr.integrationExecSum)} right
              </span>
              {copy.option_upper_bound}
            </div>
          </section>
        </PanelShell>
      </div>
    </>
  )
}
