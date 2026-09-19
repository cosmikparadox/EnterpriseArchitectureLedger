// The drawing the estate is usually seen as. Chapter 7.
//
// A matrix of domains against systems, one colour per cell, is how an estate
// like this is shown when decisions are made about it: a system is rated for
// fit and value and the matrix takes the colour. Here the colour is derived
// from the data so the drawing is of this estate and not a stock image, but it
// is a judgment scale by construction, and the card says so. Tap it, or press
// Next, and it dissolves to the graph beneath, which is what the colours hide.

import { useMemo } from 'react'
import { copy } from '../copy'
import type { Estate } from '../model/types'
import { c1, type Index } from '../model/ledger'

export function Drawing({ estate, ix, away, onTap }: { estate: Estate; ix: Index; away: boolean; onTap: () => void }) {
  // One colour per (domain, system) cell. Green, amber, red by how much of
  // what the domain is told the system costs comes from a rule rather than a
  // meter: the higher the share, the less of the bill is measured. A synthetic
  // judgment, which is the point: the drawing is judgment, the graph is not.
  const grid = useMemo(() => {
    const platforms = estate.platforms
    return estate.subdomains.map((sd) => ({
      sd,
      cells: platforms.map((p) => {
        const rides = estate.use_cases.some((u) => u.subdomain === sd.id && u.edges.some((e) => e.platform_id === p.id))
        if (!rides) return 'n'
        const share = c1(ix, p.id)
        return share < 0.45 ? 'g' : share < 0.7 ? 'a' : 'r'
      }),
    }))
  }, [estate, ix])
  return (
    <div className={away ? 'drawing away' : 'drawing'} data-tour="drawing" onClick={onTap} role="button" aria-label={copy.drawing_tap}>
      <div className="drawing-sheet">
        <div className="drawing-head">
          <strong>{copy.drawing_title}</strong>
          <span>{copy.drawing_sub}</span>
        </div>
        <table>
          <colgroup><col />{estate.platforms.map((p) => <col key={p.id} />)}</colgroup>
          <thead>
            <tr>
              <th />
              {estate.platforms.map((p) => <th key={p.id}>{p.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {grid.map((row) => (
              <tr key={row.sd.id}>
                <th>{row.sd.name}</th>
                {row.cells.map((c, i) => <td key={i} className={c} />)}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="drawing-foot">
          <span><span className="sw" style={{ background: '#7bc47f' }} />{copy.drawing_green}</span>
          <span><span className="sw" style={{ background: '#f2c14e' }} />{copy.drawing_amber}</span>
          <span><span className="sw" style={{ background: '#e06c75' }} />{copy.drawing_red}</span>
          <span><span className="sw" style={{ background: 'var(--panel-2)', border: '1px solid var(--line)' }} />{copy.drawing_none}</span>
          <span className="drawing-tap">{copy.drawing_tap}</span>
        </div>
      </div>
    </div>
  )
}
