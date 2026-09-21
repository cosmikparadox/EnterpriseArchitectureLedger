// What sits over the canvas between and around the pictures.
//
// The welcome, the part titles, the end-of-part lines, and part two's three
// pictures of how architecture is decided today: the documents, the matrix,
// the three silos. All of it is DOM, all of it fades on CSS transitions, and
// none of it is drawn over the graph: the canvas is faded out underneath.

import { useEffect, useMemo, useState } from 'react'
import { copy } from '../copy'
import type { Estate } from '../model/types'
import { c1, type Index } from '../model/ledger'
import type { Beat, Part } from './script'
import { DocPicture } from './DocPictures'

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

  // Part two's documents open one at a time into a drawing of what each
  // looks like. Escape or a tap outside closes it.
  const [openDoc, setOpenDoc] = useState<number | null>(null)
  useEffect(() => { setOpenDoc(null) }, [n])
  useEffect(() => {
    if (openDoc === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpenDoc(null) } }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [openDoc])

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
        <>
          <div className="ov-centre ov-docs">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <button key={i} type="button" className={`ov-doc ov-in d${i}${openDoc === i ? ' ov-doc-open' : ''}`} onClick={() => setOpenDoc(i)} aria-expanded={openDoc === i}>
                <strong>{(copy as Record<string, string>)[`doc_${i}`]}</strong>
                <span>{(copy as Record<string, string>)[`doc_${i}_age`]}</span>
                <em className="ov-doc-open-hint">{copy.docs_open}</em>
              </button>
            ))}
            <div className="ov-note ov-in d6">{copy.docs_note} {copy.docs_tap}</div>
          </div>
          {openDoc !== null && (
            <div className="ov-lightbox" onClick={() => setOpenDoc(null)} role="dialog" aria-label="Document">
              <div className="ov-sheet" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="popover-close ov-sheet-close" aria-label="Close" onClick={() => setOpenDoc(null)}>×</button>
                <DocPicture i={openDoc} estate={estate} />
              </div>
            </div>
          )}
        </>
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
        <div className="ov-centre">
          {/* The question at the top, the three sources at the bottom, and a
              curve from each that draws upward and stops short. Nothing
              reaches the question: that is the picture. */}
          <div className="ov-stage">
            <div className="ov-ask ov-in"><div className="ov-ask-head">{copy.silo_ask_head}</div><strong>{copy.silo_ask}</strong></div>
            <svg className="ov-curves" viewBox="0 0 760 420" aria-hidden="true">
              {[127, 380, 633].map((x, i) => {
                // Cubic from the source's top to just under the question; the
                // dot marks where the curve gives up, at two thirds of the way.
                const p0 = [x, 300], p1 = [x, 200], p2 = [380, 200], p3 = [380, 96]
                const t = 0.66, u = 1 - t
                const px = u * u * u * p0[0]! + 3 * u * u * t * p1[0]! + 3 * u * t * t * p2[0]! + t * t * t * p3[0]!
                const py = u * u * u * p0[1]! + 3 * u * u * t * p1[1]! + 3 * u * t * t * p2[1]! + t * t * t * p3[1]!
                return (
                  <g key={x} className={`ov-curve c${i + 1}`}>
                    <path d={`M${p0[0]},${p0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`} pathLength={100} />
                    <circle cx={px} cy={py} r={4} />
                  </g>
                )
              })}
            </svg>
            <div className="ov-silos-row">
              <div className="ov-silo ov-in d1"><strong>{copy.silo_cost}</strong><span>{copy.silo_cost_sub}</span></div>
              <div className="ov-silo ov-in d2"><strong>{copy.silo_risk}</strong><span>{copy.silo_risk_sub}</span></div>
              <div className="ov-silo ov-in d3 ov-missing"><strong>{copy.silo_exit}</strong><span>{copy.silo_exit_sub}</span></div>
            </div>
          </div>
          {/* Where the frameworks sit. Two under the cost tile, each with
              what it is for and where it stops; one that sits under no
              tile, because it prices the contracts and not the systems. */}
          <div className="ov-frames ov-in d4" aria-label={copy.frames_head}>
            <div className="ov-frames-head">{copy.frames_head}</div>
            <div className="ov-frames-row">
              <div className="ov-frame-col">
                <div className="ov-frame"><strong>{copy.frame_finops}</strong><span>{copy.frame_finops_for}</span><em>{copy.frame_finops_stop}</em></div>
                <div className="ov-frame"><strong>{copy.frame_tbm}</strong><span>{copy.frame_tbm_for}</span><em>{copy.frame_tbm_stop}</em></div>
              </div>
              <div className="ov-frame-col ov-frame-none"><span>{copy.frames_none_risk}</span></div>
              <div className="ov-frame-col ov-frame-none"><span>{copy.frames_none_exit}</span></div>
            </div>
            <div className="ov-frame ov-frame-loose"><strong>{copy.frame_ifrs}</strong><span>{copy.frame_ifrs_for}</span><em>{copy.frame_ifrs_stop}</em></div>
          </div>
          <div className="ov-note ov-in d6">{copy.silo_fail}</div>
        </div>
      )}
    </div>
  )
}
