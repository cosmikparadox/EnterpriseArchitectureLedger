// View 6, Boundaries. Spec section 4.6.
//
// Purpose: show that the boundaries are declared, and show what depends on
// them. The tool never implies that any placement is correct, and it never
// shows cost accumulating at a boundary. That claim was retired.

import { useMemo, useState } from 'react'
import { Graph3D } from '../components/Graph3D'
import { Term, ViewName } from '../components/Hint'
import { Legend } from '../components/Legend'
import { PanelShell } from '../components/PanelShell'
import { gbp } from '../components/DetailPanel'
import { buildGraph } from '../app/graph'
import { buildIndex, ruleShare } from '../model/ledger'
import type { AllocationRule, Estate, UseCase } from '../model/types'
import { copy, summary } from '../copy'
import { Summary } from '../components/Summary'
import { useLedger } from '../app/store'
import { RuleSelect } from '../components/RuleSelect'
import { SUBDOMAIN_COLOUR } from '../app/graph'
import { MOVER_ID, MOVER_TO } from '../story/script'
import { fill } from '../copy'

export interface BoundariesProps {
  estate: Estate
  dark: boolean
  rule: AllocationRule
  setRule: (r: AllocationRule) => void
}

export function Boundaries({ estate: base, dark, rule, setRule }: BoundariesProps) {
  // The redrawn decomposition. The GRAPH is untouched by any of this.
  // The moves live in the store, so the story can make one and read what changed.
  const moved = useLedger((s) => s.moves)
  const setMovesStore = useLedger((s) => s.setMoves)
  const setMoved = (f: Record<string, string> | ((m: Record<string, string>) => Record<string, string>)) =>
    setMovesStore(typeof f === 'function' ? f(useLedger.getState().moves) : f)
  const picked = useLedger((s) => s.selectedId)
  const setPicked = useLedger((s) => s.setSelectedId)
  const [collapsed, setCollapsed] = useState(false)
  const tourStep = useLedger((s) => s.tourStep)
  const sceneFocus = useLedger((s) => s.scene.focus)
  const flyToId = useLedger((s) => s.flyToId)
  const inStory = tourStep !== null

  const estate: Estate = useMemo(() => ({
    ...base,
    use_cases: base.use_cases.map((u): UseCase =>
      moved[u.id] ? { ...u, subdomain: moved[u.id]! } : u),
  }), [base, moved])

  const ixBefore = useMemo(() => buildIndex(base), [base])
  const ixAfter = useMemo(() => buildIndex(estate), [estate])
  const data = useMemo(() => buildGraph(estate, ixAfter), [estate, ixAfter])

  // An edge crosses a declared boundary when the node it reaches is ridden from
  // more than one subdomain. Redrawing the lines changes which edges those are.
  const crossing = useMemo(() => {
    const out = new Set<string>()
    for (const p of estate.platforms) {
      const rs = ixAfter.ridersOf.get(p.id)!
      const subs = new Set(rs.map((r) => r.uc.subdomain))
      if (subs.size < 2) continue
      for (const r of rs) out.add(`${r.uc.id}>${p.id}`)
    }
    return out
  }, [estate, ixAfter])

  const crossingBefore = useMemo(() => {
    let n = 0
    for (const p of base.platforms) {
      const rs = ixBefore.ridersOf.get(p.id)!
      if (new Set(rs.map((r) => r.uc.subdomain)).size >= 2) n += rs.length
    }
    return n
  }, [base, ixBefore])

  // What moved and what did not, per allocation basis. Canon 9.2.8 (R23).
  const drift = useMemo(() => {
    const rules: AllocationRule[] = ['equal', 'driver', 'by_volume', 'by_head']
    return rules.map((r) => {
      let changed = 0, maxDelta = 0
      for (const p of base.platforms) {
        for (const rider of ixBefore.ridersOf.get(p.id)!) {
          const a = ruleShare(ixBefore, p.id, rider.uc.id, r)
          const b = ruleShare(ixAfter, p.id, rider.uc.id, r)
          const d = Math.abs(a - b)
          if (d > 1e-6) { changed++; maxDelta = Math.max(maxDelta, d) }
        }
      }
      return { rule: r, changed, maxDelta }
    })
  }, [base, ixBefore, ixAfter])

  const merge = (from: string, into: string) => {
    if (from === into) return
    setMoved((m) => {
      const next = { ...m }
      for (const u of estate.use_cases) if (u.subdomain === from) next[u.id] = into
      return next
    })
  }

  const moves = Object.keys(moved).length
  const pickedUc = picked ? estate.use_cases.find((u) => u.id === picked) ?? null : null

  // The story's move, as a decision. The picture is the use case that moved,
  // the platforms it rides, and the two domains either side of the line;
  // the dashed lines shown are its own. A note pinned to it says what was
  // decided and by whom, in the only terms the data supports.
  const storyMove = inStory && sceneFocus === 'move'
  const mover = base.use_cases.find((u) => u.id === MOVER_ID) ?? null
  const moverTo = moved[MOVER_ID] ?? null
  const focus = useMemo(() => {
    if (!storyMove || !mover) return null
    const nodes = new Set<string>([mover.id, ...mover.edges.map((e) => e.platform_id)])
    const hulls = new Set<string>([mover.subdomain, moverTo ?? mover.subdomain])
    return { nodes, hulls }
  }, [storyMove, mover, moverTo])
  const dashed = useMemo(() => storyMove && mover ? new Set([...crossing].filter((k) => k.startsWith(`${mover.id}>`))) : crossing, [storyMove, mover, crossing])
  const subName = (id: string) => base.subdomains.find((s) => s.id === id)?.name ?? id
  // The note says what has been decided before the line moves, and what
  // moved after; the arrow fills when the move is made. The ring on the
  // canvas names the use case the decision is about.
  const pending = !moverTo || moverTo === mover?.subdomain
  const to = pending ? MOVER_TO : moverTo!
  const decision = storyMove && mover ? (
      <div className="decision">
        <div className="decision-head">{copy.decision_head}</div>
        <div className="decision-row">
          <span className="sw" style={{ background: SUBDOMAIN_COLOUR[mover.subdomain] }} />{subName(mover.subdomain)}
          <span className={pending ? 'decision-arrow pending' : 'decision-arrow'} />
          <span className="sw" style={{ background: SUBDOMAIN_COLOUR[to] }} />{subName(to)}
        </div>
        <div className="decision-uc">{mover.name}</div>
        <div className="decision-line">{fill(pending ? copy.decision_pending : copy.decision_line, { uc: mover.name, from: subName(mover.subdomain), to: subName(to) })}</div>
      </div>
    ) : null
  const callout = storyMove && mover ? { kind: 'node' as const, id: mover.id, text: mover.name } : null

  return (
    <>
      <div className="topbar">
        <h1>Ledger Explorer</h1>
        <ViewName n={6}>Boundaries</ViewName>
        <span data-tour="basis"><RuleSelect rule={rule} setRule={setRule} /></span>
        <button className="ctl" onClick={() => { setMoved({}); setPicked(null) }} disabled={moves === 0}>
          Reset boundaries
        </button>
        <span className="sub">{moves} use case{moves === 1 ? '' : 's'} moved</span>
      </div>

      <div className={`graphwrap${collapsed ? '' : ' panel-open'}`}>
        <Graph3D
          data={data}
          dark={dark}
          showHulls
          labelMode="selected"
          selectedId={picked}
          isolatedSubdomain={null}
          flyToId={inStory ? flyToId : null}
          dashedLinks={dashed}
          dashedFaint={inStory}
          focus={focus}
          callout={callout}
          note={decision}
          noteAt={storyMove && mover ? mover.id : null}
          onSelectNode={(id) => { if (ixAfter.useCaseById.has(id)) { setPicked(id); setCollapsed(false) } }}
          onSelectLink={() => {}}
          onBackground={() => {}}
        />

        <Legend>
          <div>Dashed edges cross a declared boundary.</div>
          <div style={{ marginTop: 4, opacity: 0.85 }}>Tap a use case to move it.</div>
        </Legend>

        <PanelShell
          label="Boundaries"
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          tabHint="Boundaries"
        >
          <h2>Redraw the lines</h2>
          {(() => {
            const movedN = Object.keys(moved).length
            const d = drift.find((x) => x.rule === rule)
            const basis = rule === 'equal' ? 'equal split' : rule === 'driver' ? 'driver-proportional'
              : rule === 'by_volume' ? 'by volume' : 'by headcount'
            return (
              <Summary
                head={movedN === 0 ? summary.s6_head_none : summary.s6_head_moved}
                number={d && d.changed > 0 ? summary.s6_number_moved : summary.s6_number_stable}
                mechanism={summary.s6_mechanism}
                values={{
                  moved: movedN,
                  basis,
                  changed: d?.changed ?? 0,
                  max: Math.round(d?.maxDelta ?? 0).toLocaleString('en-GB'),
                }}
              />
            )
          })()}
          <div className="callout">{copy.view6_top}</div>

          <section>
            <h3>Move a use case</h3>
            {pickedUc ? (
              <>
                <div className="row"><span className="l">{pickedUc.name}</span><span className="v" /></div>
                <select
                  className="ctl"
                  style={{ width: '100%' }}
                  value={pickedUc.subdomain}
                  onChange={(e) => setMoved((m) => ({ ...m, [pickedUc.id]: e.target.value }))}
                  aria-label={`Subdomain for ${pickedUc.name}`}
                >
                  {estate.subdomains.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </>
            ) : (
              <div className="note">Tap a use case in the graph, or pick one below.</div>
            )}
            <div style={{ maxHeight: 150, overflow: 'auto', marginTop: 6 }}>
              {estate.use_cases.map((u) => (
                <button key={u.id} className="ctl" aria-pressed={picked === u.id}
                  onClick={() => setPicked(u.id)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 2 }}>
                  {u.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3>Merge two subdomains</h3>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
              <select className="ctl" id="merge-from" aria-label="Subdomain to merge from" defaultValue={base.subdomains[4]!.id}>
                {base.subdomains.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <span style={{ fontSize: 11 }}>into</span>
              <select className="ctl" id="merge-into" aria-label="Subdomain to merge into" defaultValue={base.subdomains[2]!.id}>
                {base.subdomains.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button className="ctl" onClick={() => {
                const a = (document.getElementById('merge-from') as HTMLSelectElement | null)?.value
                const b = (document.getElementById('merge-into') as HTMLSelectElement | null)?.value
                if (a && b) merge(a, b)
              }}>Merge</button>
            </div>
            <div className="note">
              Merging moves every use case out of one declared subdomain into another. The
              graph is untouched.
            </div>
          </section>

          <section>
            <h3>What changed</h3>
            <div className="row">
              <span className="l">Boundary-crossing edges</span>
              <span className="v">{crossingBefore} to {crossing.size}</span>
            </div>
            <div className="note">
              Whose decision becomes whose dependency changes with the lines.
            </div>
          </section>

          <section>
            <h3>What moved, by <Term k="allocation_basis">allocation basis</Term></h3>
            {drift.map((d) => (
              <div className="row" key={d.rule}>
                <span className="l">
                  {d.rule === 'equal' ? 'Equal split' : d.rule === 'driver' ? 'Driver-proportional'
                    : d.rule === 'by_volume' ? 'By volume' : 'By headcount'}
                  {d.rule === 'by_head' && <span className="prohibited"> prohibited</span>}
                </span>
                <span className="v">
                  {d.changed === 0 ? 'unchanged' : `${d.changed} figures, up to ${gbp(d.maxDelta)}`}
                </span>
              </div>
            ))}
            <div className="callout">
              Equal split and driver-proportional do not move, because canon 9.2.8 makes the
              fixed basis partition-independent. By headcount does move, which is why it is
              prohibited. {copy.basis_prohibited}
            </div>
          </section>

          <section>
            <h3>What did not change</h3>
            <div className="note">
              The graph. Edges do not move. Risk does not move. Metered spend does not move.
              Only figures that read the declared decomposition move, and those are the ones
              to trust least.
            </div>
          </section>
        </PanelShell>
      </div>
    </>
  )
}
