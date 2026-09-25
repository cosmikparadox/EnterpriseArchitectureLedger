// What sits over the canvas between and around the pictures.
//
// The welcome, the part titles, the end-of-part lines, and part two's three
// pictures of how architecture is decided today: the documents, the matrix,
// the three silos. All of it is DOM, all of it fades on CSS transitions, and
// none of it is drawn over the graph: the canvas is faded out underneath.

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { copy, fill } from '../copy'
import type { Estate } from '../model/types'
import { c1, type Index } from '../model/ledger'
import type { Beat, Part } from './script'
import { DocPicture } from './DocPictures'
import { SUBDOMAIN_COLOUR, useCaseView } from '../app/graph'
import { describeUseCase } from '../model/describe'
import { useLedger } from '../app/store'
import { OPENER_UC } from './script'

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
  // The silos' tiles open the same way, into the methods behind each one.
  const [openSilo, setOpenSilo] = useState<'cost' | 'risk' | 'exit' | null>(null)
  // What the reader has opened on this beat: until each has been, the
  // unopened ones pulse and a hint asks for them.
  const [seen, setSeen] = useState<Set<string>>(new Set())
  useEffect(() => { setOpenDoc(null); setOpenSilo(null); setSeen(new Set()) }, [n])
  const openIt = (key: string) => setSeen((prev) => (prev.has(key) ? prev : new Set(prev).add(key)))
  useEffect(() => {
    if (openDoc === null && openSilo === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpenDoc(null); setOpenSilo(null) } }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [openDoc, openSilo])

  if (!beat.overlay) return null
  const [t, sub] = PART_TITLE[beat.part]
  const endLine = beat.part === 1 ? [copy.story_end1, copy.story_end1_sub] : [copy.story_end2, copy.story_end2_sub]

  const tappable = beat.overlay === 'welcome' || beat.overlay === 'intro' || beat.overlay === 'part' || beat.overlay === 'end'
  const picture = !tappable && beat.overlay !== 'reflect'
  return (
    <div className={`overlay overlay-${beat.overlay}${tappable ? ' overlay-tap' : ''}${picture ? ' overlay-picture' : ''}`} key={beat.overlay === 'flat' ? 'flat' : n} onClick={tappable ? onTap : undefined} role={tappable ? 'button' : undefined}>
      {beat.overlay === 'welcome' && (
        <div className="ov-centre">
          <div className="ov-big ov-in">{copy.story_welcome}</div>
          <div className="ov-sub ov-hook ov-in d1">{copy.story_welcome_sub}</div>
          <div className="ov-ask-q ov-in d2">{copy.story_welcome_ask}</div>
          <div className="ov-note ov-in d3">
            {copy.story_welcome_note_1}<span className="who-word who-arch">{copy.story_welcome_note_bp}</span>{copy.story_welcome_note_2}<span className="who-word who-cfo">{copy.story_welcome_note_bs}</span>{copy.story_welcome_note_3}
          </div>
          <div className="ov-hint ov-in d4">{copy.story_welcome_tap}</div>
        </div>
      )}
      {beat.overlay === 'title' && (
        <Fit><div className="ov-centre ov-title">
          {/* The answer to the company page: the ledger, its three entries
              on one thing the business does, and what it is in one line. */}
          <div className="ov-eyebrow ov-bridge ov-in">{copy.title_bridge}</div>
          <div className="ov-big ov-in d1">{copy.title_big}</div>
          <div className="ov-sub ov-in d1">{copy.tagline}</div>
          <div className="wm-entries">
            <span className="wm-dot ov-in d2" />
            <span className="wm-rows">
              {[copy.what_cost, copy.what_risk, copy.what_exit].map((t, i) => <span key={i} className={`wm-row ov-in d${i + 2}`}><span className="book-n">{i + 1}</span>{t}</span>)}
            </span>
          </div>
        </div></Fit>
      )}
      {beat.overlay === 'intro' && (
        <Fit><div className="ov-centre ov-intro">
          <div className="ov-big ov-in">{copy.intro_h}</div>
          <div className="ov-sub ov-in d1">{copy.intro_sub}</div>
          <div className="ov-people">
            <div className="ov-person who-arch ov-in d2"><strong>{copy.intro_arch}</strong><span>{copy.intro_arch_text}</span></div>
            <div className="ov-person who-cfo ov-in d3"><strong>{copy.intro_cfo}</strong><span>{copy.intro_cfo_text}</span></div>
          </div>
          <div className="ov-gap ov-in d4">{copy.intro_gap}</div>
          <div className="ov-hint ov-in d6">{copy.story_continue}</div>
        </div></Fit>
      )}
      {beat.overlay === 'reflect' && (
        <div className="ov-centre ov-reflect">
          <div className="ov-big ov-in">{copy.reflect_big}</div>
          <div className="ov-sub ov-in d1">{copy.reflect_sub}</div>
          <div className="ov-ask-line ov-in d2">{copy.reflect_ask}</div>
          <div className="ov-reflect-actions ov-in d3">
            <button type="button" className="cta" autoFocus onClick={onTap}>{copy.reflect_go}</button>
            <button type="button" className="ctl" onClick={() => { useLedger.getState().setTourStep(null); useLedger.getState().setView(1) }}>{copy.reflect_leave}</button>
          </div>
          <div className="ov-note ov-in d4">{copy.reflect_note}</div>
        </div>
      )}
      {beat.overlay === 'why' && (
        <Fit><div className="ov-centre ov-why">
          {/* The three places, and under each what that costs the business.
              Then the colour the decision is made on. */}
          <div className="ov-why-row">
            {(['cost', 'risk', 'exit'] as const).map((k, i) => (
              <div key={k} className={`ov-why-col ov-in d${i + 1}`}>
                <div className={`ov-silo${k === 'exit' ? ' ov-missing' : ''}`}><strong>{copy[`why_${k}`]}</strong><span>{copy[`why_${k}_sub`]}</span></div>
                <em className={`ov-why-so ov-in d${i + 4}`}>{copy[`why_${k}_so`]}</em>
              </div>
            ))}
          </div>
          <div className="ov-why-colour ov-in d6">
            <span className="sw" style={{ background: '#7bc47f' }} /><span className="sw" style={{ background: '#f2c14e' }} /><span className="sw" style={{ background: '#e06c75' }} />
            <span>{copy.why_colour}</span>
          </div>
        </div></Fit>
      )}
      {beat.overlay === 'map' && <Fit><MapPicture /></Fit>}
      {beat.overlay === 'flat' && <Fit><FlatMap estate={estate} ix={ix} entries={beat.stem === 'how_graph'} /></Fit>}
      {beat.overlay === 'pain' && (
        <Fit><div className="ov-centre ov-pain">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`ov-pain-tile ov-in d${i}`}>
              <strong>{(copy as Record<string, string>)[`pain_${i}_h`]}</strong>
              <span>{(copy as Record<string, string>)[`pain_${i}`]}</span>
              <em>{(copy as Record<string, string>)[`pain_${i}_who`]}</em>
            </div>
          ))}
        </div></Fit>
      )}
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
          <Fit><div className="ov-centre ov-docs">
            {seen.size < 6 && <div className="ov-tap-hint">{copy.docs_hint}</div>}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <button key={i} type="button" className={`ov-doc ov-in d${i}${openDoc === i ? ' ov-doc-open' : ''}${seen.has(`d${i}`) ? ' ov-seen' : ' ov-unseen'}`} onClick={() => { setOpenDoc(i); openIt(`d${i}`) }} aria-expanded={openDoc === i}>
                <strong>{(copy as Record<string, string>)[`doc_${i}`]}</strong>
                <span>{(copy as Record<string, string>)[`doc_${i}_age`]}</span>
                <em className="ov-doc-open-hint">{copy.docs_open}</em>
              </button>
            ))}
            <div className="ov-note ov-in d6">{copy.docs_note} {copy.docs_tap}</div>
          </div></Fit>
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
        <Fit><div className="ov-centre">
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
        </div></Fit>
      )}
      {beat.overlay === 'silos' && (
        <>
          <Fit><div className="ov-centre">
            {seen.size < 3 && <div className="ov-tap-hint">{copy.silo_tap}</div>}
            {/* The question at the top, the three places at the foot, and a
                curve from each that draws upward and stops short of it.
                Each tile opens into the methods behind it. */}
            <div className="ov-stage">
              <div className="ov-ask ov-in"><div className="ov-ask-head">{copy.silo_ask_head}</div><strong>{copy.silo_ask}</strong></div>
              <svg className="ov-curves" viewBox="0 0 760 90" aria-hidden="true">
                {[127, 380, 633].map((x, i) => {
                  const p0 = [x, 88], p1 = [x, 46], p2 = [380, 46], p3 = [380, 4]
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
                {(['cost', 'risk', 'exit'] as const).map((k, i) => (
                  <button key={k} type="button" className={`ov-silo ov-silo-btn ov-in d${i + 1}${k === 'exit' ? ' ov-missing' : ''}${seen.has(k) ? ' ov-seen' : ' ov-unseen'}`} onClick={() => { setOpenSilo(k); openIt(k) }} aria-expanded={openSilo === k}>
                    <strong>{copy[`silo_${k}`]}</strong><span>{copy[`silo_${k}_sub`]}</span>
                    <em className="ov-doc-open-hint">{copy.silo_open}</em>
                  </button>
                ))}
              </div>
            </div>
            <div className="ov-note ov-in d6">{copy.silo_fail}</div>
          </div></Fit>
          {openSilo !== null && (
            <div className="ov-lightbox" onClick={() => setOpenSilo(null)} role="dialog" aria-label={copy[`silo_${openSilo}`]}>
              <div className="ov-sheet ov-methods" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="popover-close ov-sheet-close" aria-label="Close" onClick={() => setOpenSilo(null)}>×</button>
                <div className="ov-methods-head"><strong>{copy[`silo_${openSilo}`]}</strong><span>{copy[`silo_${openSilo}_sub`]}</span></div>
                <div className="ov-methods-row">
                  {[1, 2, 3].map((m) => {
                    const c = copy as Record<string, string>
                    const key = `m_${openSilo}_${m}`
                    return (
                      <div key={m} className={`ov-frame ov-method d${m}`}>
                        <strong>{c[key]}</strong><span>{c[`${key}_for`]}</span><em>{c[`${key}_stop`]}</em>
                      </div>
                    )
                  })}
                </div>
                <div className="ov-methods-note">{copy.silo_methods_note}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// A drawing and a map, side by side. The drawing is tidy: four boxes, four
// arrows. The map is what traces give: many nodes, lines drawn in one at a
// time. Fixed positions, so the picture is the same on every visit.
const MAP_NODES: [number, number][] = Array.from({ length: 18 }, (_, i) => {
  const a = i * 2.39996, r = 22 + 118 * Math.sqrt((i + 0.5) / 18)
  return [575 + r * Math.cos(a), 160 + r * 0.82 * Math.sin(a)]
})
const MAP_EDGES: [number, number][] = (() => {
  // Each node to its nearest few, hubs to more: the local, uneven wiring
  // that traces show, rather than a tidy tree.
  const seen = new Set<string>(); const out: [number, number][] = []
  MAP_NODES.forEach(([x, y], i) => {
    const near = MAP_NODES.map(([u, v], j) => ({ j, d: (u - x) ** 2 + (v - y) ** 2 })).filter((o) => o.j !== i).sort((a, b) => a.d - b.d)
    for (const { j } of near.slice(0, i % 3 === 0 ? 4 : 2)) {
      const k = i < j ? `${i}-${j}` : `${j}-${i}`
      if (!seen.has(k)) { seen.add(k); out.push([i, j]) }
    }
  })
  return out
})()

function MapPicture() {
  const boxes: [number, number][] = [[50, 70], [210, 70], [50, 200], [210, 200]]
  const arrows: [number, number, number, number][] = [[150, 98, 208, 98], [100, 128, 100, 198], [260, 128, 260, 198], [150, 228, 208, 228]]
  return (
    <div className="ov-centre ov-map">
      <svg className="ov-map-svg" viewBox="0 0 760 320" aria-hidden="true">
        <defs>
          <marker id="ov-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" /></marker>
        </defs>
        <g className="ov-map-drawing">
          {boxes.map(([x, y], i) => <g key={i}><rect x={x} y={y} width={100} height={56} rx={6} /><line x1={x + 18} y1={y + 24} x2={x + 82} y2={y + 24} /><line x1={x + 18} y1={y + 34} x2={x + 62} y2={y + 34} /></g>)}
          {arrows.map(([a, b, c2, d], i) => <line key={i} className="ov-map-arrow" x1={a} y1={b} x2={c2} y2={d} markerEnd="url(#ov-arrow)" />)}
        </g>
        <g className="ov-map-mined">
          {MAP_EDGES.map(([a, b], i) => {
            const p = MAP_NODES[a]!, q = MAP_NODES[b]!
            return <path key={i} d={`M${p[0].toFixed(1)},${p[1].toFixed(1)} L${q[0].toFixed(1)},${q[1].toFixed(1)}`} pathLength={100} style={{ animationDelay: `${1400 + i * 45}ms` }} />
          })}
          {MAP_NODES.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 7 : 4.5} className={i % 3 === 0 ? 'hub' : ''} style={{ animationDelay: `${1200 + i * 40}ms` }} />)}
        </g>
      </svg>
      <div className="ov-map-labels">
        <div className="ov-in d1"><strong>{copy.map_drawing}</strong><span>{copy.map_drawing_sub}</span></div>
        <div className="ov-in d4"><strong>{copy.map_mined}</strong><span>{copy.map_mined_sub}</span></div>
      </div>
    </div>
  )
}

// A picture scales down, never up, to the height the overlay gives it, so
// nothing runs under the wordmark or off the foot of the window. Width is
// left to the picture's own layout; only an overflowing height shrinks it.
function Fit({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement | null>(null)
  const inner = useRef<HTMLDivElement | null>(null)
  const [fit, setFit] = useState<{ k: number; h: number } | null>(null)
  useLayoutEffect(() => {
    const o = outer.current, i = inner.current, box = o?.parentElement
    if (!o || !i || !box) return
    const measure = () => {
      const cs = getComputedStyle(box)
      const room = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      const h = i.offsetHeight
      const k = h > 0 && room > 0 ? Math.min(1, room / h) : 1
      setFit((f) => (f && Math.abs(f.k - k) < 0.005 && Math.abs(f.h - h * k) < 1 ? f : { k, h: h * k }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box); ro.observe(i)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={outer} className="ov-fit" style={fit ? { height: fit.h } : undefined}>
      <div ref={inner} className="ov-fit-inner" style={fit && fit.k < 1 ? { transform: `scale(${fit.k})` } : undefined}>{children}</div>
    </div>
  )
}

// The estate, flat: platforms along the middle, use cases above and below,
// each placed over the platforms it runs on. One use case is lit with its
// path; the rest stays as a trace. The two how beats share one instance
// (the overlay keeps its key), so the map does not reset between them. On
// the second, the map plays the three entries in turn: cost pooling at the
// most shared platform, risk running out along the lines from the platform
// that can stop the use case, and what leaving that platform has to move.
type Phase = -1 | 0 | 1 | 2
function FlatMap({ estate, ix, entries }: { estate: Estate; ix: Index; entries: boolean }) {
  const rule = useLedger((s) => s.rule)
  const W = 760, H = 380, MID = 190
  const layout = useMemo(() => {
    const riders = (id: string) => ix.ridersOf.get(id)?.length ?? 0
    const sorted = [...estate.platforms].sort((a, b) => riders(b.id) - riders(a.id) || a.id.localeCompare(b.id))
    // Busiest in the middle, the rest alternating outwards.
    const order: typeof sorted = []
    sorted.forEach((p, i) => { if (i % 2 === 0) order.push(p); else order.unshift(p) })
    const px = new Map<string, number>()
    order.forEach((p, i) => px.set(p.id, 40 + (i * (W - 80)) / Math.max(1, order.length - 1)))
    const ideal = estate.use_cases.map((u) => ({ u, x: u.edges.reduce((a, e) => a + (px.get(e.platform_id) ?? W / 2), 0) / Math.max(1, u.edges.length) }))
      .sort((a, b) => a.x - b.x || a.u.id.localeCompare(b.u.id))
    const top = ideal.filter((_, i) => i % 2 === 0), bottom = ideal.filter((_, i) => i % 2 === 1)
    const ux = new Map<string, [number, number]>()
    const place = (row: typeof ideal, y: number) => row.forEach((o, i) => ux.set(o.u.id, [30 + (i * (W - 60)) / Math.max(1, row.length - 1), y]))
    place(top, 42); place(bottom, H - 42)
    return { px, ux, riders }
  }, [estate, ix])

  // The entries play one at a time, and the reader sets the pace: Next on
  // the card, or a tap on an entry under the map, plays the next one.
  const flatPhase = useLedger((st) => st.flatPhase)
  const setFlatPhase = useLedger((st) => st.setFlatPhase)
  const phase: Phase = entries ? flatPhase : -1
  const [reached, setReached] = useState(0)
  useEffect(() => { setReached((r) => (entries ? Math.max(r, flatPhase + 1) : 0)) }, [entries, flatPhase])
  const shown = entries ? Math.max(reached, flatPhase + 1) : 0

  const lit = estate.use_cases.find((u) => u.id === OPENER_UC)
  const litP = new Set(lit?.edges.map((e) => e.platform_id) ?? [])
  const uv = lit ? useCaseView(ix, lit.id, rule) : null
  const d = lit ? describeUseCase(ix, lit.id, rule) : null
  const byName = (name: string | undefined) => estate.platforms.find((p) => p.name === name)?.id
  const pathPlatforms = [...litP].sort((a, b) => layout.riders(b) - layout.riders(a))
  const poolAt = pathPlatforms[0]
  const riskAt = byName(d ? String(d.worst) : undefined) ?? pathPlatforms[pathPlatforms.length - 1]
  const exitAt = byName(uv?.strandedBy[0]) ?? riskAt
  const focusAt = phase === 0 ? poolAt : phase === 1 ? riskAt : phase === 2 ? exitAt : undefined
  const ridersOfFocus = new Set((focusAt ? ix.ridersOf.get(focusAt) ?? [] : []).map((r) => r.uc.id))
  const NOTES = ['flat_cost_note', 'flat_risk_note', 'flat_exit_note'] as const
  const note = phase < 0 || !focusAt ? '' : fill(copy[NOTES[phase as 0 | 1 | 2]], { n: ridersOfFocus.size, name: estate.platforms.find((p) => p.id === focusAt)?.name ?? '' })

  // Labels on the lit path take four heights in turn, so neighbours do not
  // collide, and near an edge they hang inwards rather than off the picture.
  const litOrder = [...litP].sort((a, b) => (layout.px.get(a) ?? 0) - (layout.px.get(b) ?? 0))
  const anchor = (x: number) => (x < 110 ? 'start' : x > W - 110 ? 'end' : 'middle')
  const clampX = (x: number) => (x < 110 ? Math.max(4, x - 12) : x > W - 110 ? Math.min(W - 4, x + 12) : x)
  const fx = focusAt ? layout.px.get(focusAt) ?? W / 2 : W / 2
  const kind = phase < 0 ? '' : (['pool', 'risk', 'exit'] as const)[phase as 0 | 1 | 2]

  return (
    <div className={`ov-centre ov-flat${phase >= 0 ? ` phase-${kind}` : ''}`}>
      <svg className="ov-flat-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <g className="ov-flat-lines">
          {estate.use_cases.flatMap((u) => u.edges.map((e) => {
            const [x1, y1] = layout.ux.get(u.id)!, x2 = layout.px.get(e.platform_id) ?? W / 2
            const on = u.id === OPENER_UC
            const cut = phase === 2 && e.platform_id === exitAt
            return <line key={`${u.id}-${e.platform_id}`} x1={x1} y1={y1} x2={x2} y2={MID} className={`${on ? 'on' : ''}${cut ? ' cut' : ''}`} pathLength={on ? 100 : undefined} />
          }))}
        </g>
        {/* The playing entry: lines from the platform in question out to
            every use case riding it, drawn from the platform outwards. */}
        {focusAt && (
          <g key={`fx${phase}`} className={`ov-flat-fx ${kind}`}>
            {[...ridersOfFocus].map((id) => {
              const [x, y] = layout.ux.get(id)!
              return <path key={id} d={`M${fx},${MID} L${x},${y}`} pathLength={100} />
            })}
          </g>
        )}
        {estate.platforms.map((p) => {
          const x = layout.px.get(p.id)!, r = 5 + Math.sqrt(layout.riders(p.id)) * 1.6, on = litP.has(p.id)
          const conn = p.type === 'integration'
          const focus = p.id === focusAt
          const lvl = litOrder.indexOf(p.id) % 4
          const ly = lvl === 0 ? MID - r - 7 : lvl === 1 ? MID + r + 15 : lvl === 2 ? MID - r - 25 : MID + r + 33
          return (
            <g key={p.id} className={`ov-flat-p${on ? ' on' : ''}${conn ? ' conn' : ''}${focus ? ` focus ${kind}` : ''}`}>
              {focus && <circle className="ov-flat-halo" cx={x} cy={MID} r={r + 9} />}
              {/* Leaving: the platform lifts off the map and slides away,
                  its lines let go, and the gap it leaves stays marked. */}
              <g key={focus && kind === 'exit' ? `lift${phase}` : 'still'} className={focus && kind === 'exit' ? 'lift' : undefined}>
                {conn ? <rect x={x - r * 0.8} y={MID - r * 0.8} width={r * 1.6} height={r * 1.6} transform={`rotate(45 ${x} ${MID})`} /> : <circle cx={x} cy={MID} r={r} />}
                {on && <text x={clampX(x)} y={ly} textAnchor={anchor(x)}>{p.name}</text>}
              </g>
            </g>
          )
        })}
        {estate.use_cases.map((u) => {
          const [x, y] = layout.ux.get(u.id)!, on = u.id === OPENER_UC
          const hit = ridersOfFocus.has(u.id)
          return (
            <g key={u.id} className={`ov-flat-u${on ? ' on' : ''}${hit ? ` hit ${kind}` : ''}`}>
              <circle cx={x} cy={y} r={on ? 7 : hit ? 5 : 4} style={{ fill: SUBDOMAIN_COLOUR[u.subdomain] }} />
              {on && <text x={clampX(x)} y={y < MID ? y - 13 : y + 22} textAnchor={anchor(x)}>{u.name}</text>}
            </g>
          )
        })}
      </svg>
      {entries && (
        <div className="ov-flat-note" key={`n${phase}`} aria-live="polite">{note}</div>
      )}
      {entries && d && uv && (
        <div className="ov-flat-entries">
          {[
            [copy.flat_entry_1, fill(copy.book_v_cost_u, { reported: String(d.reported) })],
            [copy.flat_entry_2, fill(copy.book_v_risk_u, { worst: String(d.worst) })],
            [copy.flat_entry_3, fill(copy.book_v_exit_u, { stranded: uv.strandedBy.length > 0 ? uv.strandedBy.join(' or ') : copy.walk_u_none })],
          ].map(([h, v], i) => (
            <button type="button" key={i} className={`ov-flat-entry${i < shown ? ' shown' : ''}${i === phase ? ' active' : ''}`} onClick={() => setFlatPhase(i as 0 | 1 | 2)}>
              <span className="book-n">{i + 1}</span><span><strong>{h}</strong><em>{v}</em></span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
