// What sits over the canvas between and around the pictures.
//
// The welcome, the part titles, the end-of-part lines, and part two's three
// pictures of how architecture is decided today: the documents, the matrix,
// the three silos. All of it is DOM, all of it fades on CSS transitions, and
// none of it is drawn over the graph: the canvas is faded out underneath.

import { useMemo } from 'react'
import { copy } from '../copy'
import type { Estate } from '../model/types'
import { c1, type Index } from '../model/ledger'
import type { Beat, Part } from './script'

const PART_TITLE: Record<Part, [string, string]> = {
  0: ['', ''],
  1: [copy.story_part1_title, copy.story_part1_sub],
  2: [copy.story_part2_title, copy.story_part2_sub],
  3: [copy.story_part3_title, copy.story_part3_sub],
}

export function Overlay({ beat, n, estate, ix, onTap }: { beat: Beat; n: number; estate: Estate; ix: Index; onTap: () => void }) {
  const grid = useMemo(() => estate.subdomains.map((sd) => ({
    sd,
    cells: estate.platforms.map((p) => {
      const rides = estate.use_cases.some((u) => u.subdomain === sd.id && u.edges.some((e) => e.platform_id === p.id))
      if (!rides) return 'n'
      const share = c1(ix, p.id)
      return share < 0.45 ? 'g' : share < 0.7 ? 'a' : 'r'
    }),
  })), [estate, ix])

  if (!beat.overlay) return null
  const [t, sub] = PART_TITLE[beat.part]
  const endLine = beat.part === 1 ? [copy.story_end1, copy.story_end1_sub] : [copy.story_end2, copy.story_end2_sub]

  const tappable = beat.overlay === 'welcome' || beat.overlay === 'part' || beat.overlay === 'end'
  return (
    <div className={`overlay overlay-${beat.overlay}${tappable ? ' overlay-tap' : ''}`} key={n} onClick={tappable ? onTap : undefined} role={tappable ? 'button' : undefined}>
      {beat.overlay === 'welcome' && (
        <div className="ov-centre">
          <div className="ov-big ov-in">{copy.story_welcome}</div>
          <div className="ov-sub ov-in d1">{copy.story_welcome_sub}</div>
          <div className="ov-hint ov-in d2">{copy.story_welcome_tap}</div>
        </div>
      )}
      {beat.overlay === 'title' && null}
      {beat.overlay === 'part' && (
        <div className="ov-centre">
          <div className="ov-eyebrow ov-in">{t}</div>
          <div className="ov-big ov-in d1">{sub}</div>
          <div className="ov-hint ov-in d2">{copy.story_continue}</div>
        </div>
      )}
      {beat.overlay === 'end' && (
        <div className="ov-centre">
          <div className="ov-big ov-in">{endLine[0]}</div>
          <div className="ov-sub ov-in d1">{endLine[1]}</div>
          <div className="ov-hint ov-in d2">{copy.story_continue}</div>
        </div>
      )}
      {beat.overlay === 'docs' && (
        <div className="ov-centre ov-docs">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`ov-doc ov-in d${i}`}>
              <strong>{(copy as Record<string, string>)[`doc_${i}`]}</strong>
              <span>{(copy as Record<string, string>)[`doc_${i}_age`]}</span>
            </div>
          ))}
          <div className="ov-note ov-in d6">{copy.docs_note}</div>
        </div>
      )}
      {beat.overlay === 'matrix' && (
        <div className="ov-centre">
          <div className="drawing-sheet ov-in" data-tour="drawing">
            <div className="drawing-head"><strong>{copy.drawing_title}</strong><span>{copy.drawing_sub}</span></div>
            <table>
              <colgroup><col />{estate.platforms.map((p) => <col key={p.id} />)}</colgroup>
              <thead><tr><th />{estate.platforms.map((p) => <th key={p.id}>{p.name}</th>)}</tr></thead>
              <tbody>{grid.map((row) => <tr key={row.sd.id}><th>{row.sd.name}</th>{row.cells.map((cell, i) => <td key={i} className={cell} />)}</tr>)}</tbody>
            </table>
            <div className="drawing-foot">
              <span><span className="sw" style={{ background: '#7bc47f' }} />{copy.drawing_green}</span>
              <span><span className="sw" style={{ background: '#f2c14e' }} />{copy.drawing_amber}</span>
              <span><span className="sw" style={{ background: '#e06c75' }} />{copy.drawing_red}</span>
              <span><span className="sw" style={{ background: 'var(--panel-2)', border: '1px solid var(--line)' }} />{copy.drawing_none}</span>
            </div>
          </div>
        </div>
      )}
      {beat.overlay === 'silos' && (
        <div className="ov-centre ov-silos">
          <div className="ov-silo ov-in"><strong>{copy.silo_cost}</strong><span>{copy.silo_cost_sub}</span></div>
          <div className="ov-silo ov-in d1"><strong>{copy.silo_risk}</strong><span>{copy.silo_risk_sub}</span></div>
          <div className="ov-silo ov-in d2 ov-missing"><strong>{copy.silo_exit}</strong><span>{copy.silo_exit_sub}</span></div>
          <div className="ov-note ov-in d3">{copy.silo_note}</div>
        </div>
      )}
    </div>
  )
}
