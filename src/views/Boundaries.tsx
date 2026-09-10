// View 6, Boundaries. Spec section 4.6.
//
// Purpose: show that the boundaries are declared, and show what depends on
// them. The tool never implies that any placement is correct, and it never
// shows cost accumulating at a boundary. That claim was retired.

import { useMemo, useState } from 'react'
import { Graph3D } from '../components/Graph3D'
import { PanelShell } from '../components/PanelShell'
import { gbp } from '../components/DetailPanel'
import { buildGraph } from '../app/graph'
import { buildIndex, ruleShare } from '../model/ledger'
import type { AllocationRule, Estate, UseCase } from '../model/types'
import { copy } from '../copy'
import { RuleSelect } from '../components/RuleSelect'

export interface BoundariesProps {
  estate: Estate
  dark: boolean
  rule: AllocationRule
  setRule: (r: AllocationRule) => void
}

export function Boundaries({ estate: base, dark, rule, setRule }: BoundariesProps) {
  // The redrawn decomposition. The GRAPH is untouched by any of this.
  const [moved, setMoved] = useState<Record<string, string>>({})
  const [picked, setPicked] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

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

  return (
    <>
      <div className="topbar">
        <h1>Ledger Explorer</h1>
        <span className="sub">Boundaries</span>
        <RuleSelect rule={rule} setRule={setRule} />
        <button className="ctl" onClick={() => { setMoved({}); setPicked(null) }} disabled={moves === 0}>
          Reset boundaries
        </button>
        <span className="sub">{moves} use case{moves === 1 ? '' : 's'} moved</span>
      </div>

      <div className="graphwrap">
        <Graph3D
          data={data}
          dark={dark}
          showHulls
          labelMode="selected"
          selectedId={picked}
          isolatedSubdomain={null}
          flyToId={null}
          dashedLinks={crossing}
          onSelectNode={(id) => { if (ixAfter.useCaseById.has(id)) { setPicked(id); setCollapsed(false) } }}
          onSelectLink={() => {}}
          onBackground={() => {}}
        />

        <div className="legend">
          <div>Dashed edges cross a declared boundary.</div>
          <div style={{ marginTop: 4, opacity: 0.85 }}>Tap a use case to move it.</div>
        </div>

        <PanelShell
          label="Boundaries"
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          tabHint="Boundaries"
        >
          <h2>Redraw the lines</h2>
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
            <h3>What moved, by allocation basis</h3>
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
