// The one control a beat asks for, on the card, bound to the store.
//
// Each screen keeps its own full set of controls for free exploration. During
// the story the reader is asked for one thing at a time, and that thing sits
// here, under the sentence that asked for it.

import { copy, fill } from '../copy'
import { useLedger } from '../app/store'
import type { AllocationRule, Estate } from '../model/types'
import { IDENTITY_ID, MOVER_ID, type Control } from './script'

const BASES: { r: AllocationRule; label: string }[] = [
  { r: 'equal', label: 'Equal split' },
  { r: 'driver', label: 'Driver-proportional' },
  { r: 'by_volume', label: 'By volume' },
  { r: 'by_head', label: 'By headcount, prohibited' },
]

export function Controls({ control, estate, figures }: { control: Control; estate: Estate; figures: Record<string, string | number> }) {
  const fanIn = useLedger((s) => s.fanInAdded)
  const setFanIn = useLedger((s) => s.setFanInAdded)
  const rho = useLedger((s) => s.rho)
  const setRho = useLedger((s) => s.setRho)
  const cursor = useLedger((s) => s.cursor)
  const setCursor = useLedger((s) => s.setCursor)
  const rule = useLedger((s) => s.rule)
  const setRule = useLedger((s) => s.setRule)
  const failIt = useLedger((s) => s.failIt)
  const selectedId = useLedger((s) => s.selectedId)
  const moves = useLedger((s) => s.moves)
  const setMoves = useLedger((s) => s.setMoves)
  const shapesPhase = useLedger((s) => s.shapesPhase)
  const setShapesPhase = useLedger((s) => s.setShapesPhase)

  if (control === 'fanin') return (
    <label className="story-ctl" data-tour="fanin">
      <span>{copy.ctl_fanin}: <strong>{fanIn}</strong></span>
      <input type="range" min={0} max={24} value={fanIn} onChange={(e) => setFanIn(Number(e.target.value))} aria-label="Add synthetic use cases riding this platform" />
    </label>
  )
  if (control === 'fail') return (
    <div className="story-ctl" data-tour="fail">
      <button className="cta" onClick={() => failIt(selectedId ?? IDENTITY_ID)}>{copy.ctl_fail}</button>
    </div>
  )
  if (control === 'rho') return (
    <label className="story-ctl" data-tour="rho">
      <span>{copy.ctl_rho}</span>
      <input type="range" min={0} max={1} step={0.05} value={rho} onChange={(e) => setRho(Number(e.target.value))} aria-label="Dependence between platform failures, rho" />
      <span className="story-ctl-ends"><span>{copy.ctl_rho_lo}</span><span>{copy.ctl_rho_hi}</span></span>
    </label>
  )
  if (control === 'month') return (
    <label className="story-ctl" data-tour="month">
      <span>{copy.ctl_month} <strong>{cursor}</strong></span>
      <input type="range" min={0} max={60} step={1} value={cursor} onChange={(e) => setCursor(Number(e.target.value))} aria-label="Month cursor" />
    </label>
  )
  if (control === 'basis') return (
    <label className="story-ctl" data-tour="basis">
      <span>{copy.ctl_basis}</span>
      <select className="ctl" value={rule} onChange={(e) => setRule(e.target.value as AllocationRule)} aria-label="Allocation basis for the fixed pool">
        {BASES.map((b) => <option key={b.r} value={b.r}>{b.label}</option>)}
      </select>
    </label>
  )
  if (control === 'shapes') {
    // The comparison: three entries, one column per shape, and the row in
    // play lit. A tap on a row plays it on the canvas.
    const f = (k: string) => figures[k] ?? ''
    const rows = [
      { label: copy.ctl_shapes_cost, sub: copy.shapes_row_cost, a: fill(copy.shapes_cell_cost, { pool: f('left_pool'), riders: f('left_riders') }), b: fill(copy.shapes_cell_cost, { pool: f('right_pool'), riders: f('right_riders') }) },
      { label: copy.ctl_shapes_risk, sub: fill(copy.shapes_row_risk, { sub: f('sub') }), a: `about USD ${f('left')}`, b: `about USD ${f('right')}` },
      { label: copy.ctl_shapes_exit, sub: copy.shapes_row_exit, a: `about USD ${f('left_exec')}`, b: `about USD ${f('right_exec')}` },
    ]
    return (
      <div className="story-ctl shapes-table" data-tour="shapes" role="tablist">
        <div className="st-head"><span /><span>{copy.shape_left}</span><span>{copy.shape_right}</span></div>
        {rows.map((r, i) => (
          <button key={r.label} type="button" role="tab" className={`st-row${shapesPhase === i ? ' on' : ''}`} aria-selected={shapesPhase === i} onClick={() => setShapesPhase(i as 0 | 1 | 2)}>
            <span className="st-l"><strong>{r.label}</strong><em>{r.sub}</em></span>
            <span className="st-v">{r.a}</span>
            <span className="st-v">{r.b}</span>
          </button>
        ))}
      </div>
    )
  }
  if (control === 'move') {
    const uc = estate.use_cases.find((u) => u.id === MOVER_ID)
    const current = moves[MOVER_ID] ?? uc?.subdomain ?? ''
    return (
      <label className="story-ctl" data-tour="move">
        <span>{copy.ctl_move_to}</span>
        <select className="ctl" value={current} onChange={(e) => setMoves({ ...moves, [MOVER_ID]: e.target.value })} aria-label={`Domain for ${uc?.name ?? ''}`}>
          {estate.subdomains.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>
    )
  }
  return null
}
