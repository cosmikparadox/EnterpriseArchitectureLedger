// The one card.
//
// Floating, draggable by its header, resizable by its corner. The header and
// the footer never scroll: the part, the chapter, Back and Next are always in
// the same place. Only the body scrolls, and it is short by design: a line, a
// sentence, one figure, one control if the beat asks for one, and the ledger
// rows earned so far. Longer explanation sits under More detail.

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { copy, fill } from '../copy'
import { useLedger, TOUR_STEPS } from '../app/store'
import { SUBDOMAIN_COLOUR } from '../app/graph'
import { describeLink, describePlatform, describeSubdomain, describeUseCase } from '../model/describe'
import type { Estate } from '../model/types'
import type { Index } from '../model/ledger'
import { BEATS, LAST_BEAT, PART_COUNTS, PART_LABEL_KEY, type Beat, type Row } from './script'
import { useStoryFigures } from './figures'
import { Controls } from './Controls'

type CopyMap = Record<string, string>
const ROW_KEY: Record<Row, { label: keyof typeof copy; value: string }> = {
  metered: { label: 'row_metered', value: 'spend' },
  pool: { label: 'row_pool', value: 'pool' },
  rule_first: { label: 'row_rule_first', value: 'rule_first' },
  sum: { label: 'row_sum', value: 'sum' },
  joint: { label: 'row_joint', value: 'joint' },
  range: { label: 'row_range', value: 'range' },
  exec: { label: 'row_exec', value: 'exec' },
  left: { label: 'row_left', value: 'left' },
  right: { label: 'row_right', value: 'right' },
  moved: { label: 'row_moved', value: 'moved_basis' },
}

export interface StoryCardProps { beat: Beat; n: number; done: boolean; estate: Estate; bestOfBreed: Estate; ix: Index }

export function StoryCard({ beat, n, done, estate, bestOfBreed, ix }: StoryCardProps) {
  const setTourStep = useLedger((s) => s.setTourStep)
  const setView = useLedger((s) => s.setView)
  const rule = useLedger((s) => s.rule)
  const focus = useLedger((s) => s.focus)
  const named = useLedger((s) => s.namedDomains)
  const shapesPhase = useLedger((s) => s.shapesPhase)
  const figures = useStoryFigures(estate, bestOfBreed)
  const c = copy as unknown as CopyMap
  const [more, setMore] = useState(false)
  useEffect(() => { setMore(false) }, [n])
  // On a phone the card is a sheet. Tapping its handle pulls it down to a
  // peek, heading and buttons only, so the picture gets the screen; the
  // next beat opens it again.
  const [peek, setPeek] = useState(false)
  useEffect(() => { setPeek(false) }, [n])

  // ---- drag and resize ----
  const cardRef = useRef<HTMLElement | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const onHeaderDown = (e: React.PointerEvent) => {
    const el = cardRef.current
    if (!el || (e.target as HTMLElement).closest('button')) return
    const start = el.getBoundingClientRect()
    const dx = e.clientX - start.left, dy = e.clientY - start.top
    const parent = el.offsetParent as HTMLElement | null
    const pb = parent?.getBoundingClientRect() ?? { left: 0, top: 0, width: innerWidth, height: innerHeight }
    const move = (ev: PointerEvent) => {
      const x = Math.min(Math.max(0, ev.clientX - dx - pb.left), pb.width - 120)
      const y = Math.min(Math.max(0, ev.clientY - dy - pb.top), pb.height - 60)
      setPos({ x, y })
    }
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  // Publish the card's box so the canvas can keep its nodes clear of it.
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const root = document.documentElement
    const publish = () => { const r = el.getBoundingClientRect(); root.style.setProperty('--tour-card-actual-h', `${Math.ceil(r.height)}px`); root.style.setProperty('--tour-card-actual-w', `${Math.ceil(r.width)}px`); root.dataset.storyCard = `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}` }
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    return () => { ro.disconnect(); root.style.removeProperty('--tour-card-actual-h'); root.style.removeProperty('--tour-card-actual-w'); delete root.dataset.storyCard }
  }, [n, pos])

  const go = (k: number) => { if (k < 0) return; if (k > LAST_BEAT) { setTourStep(null); return } setTourStep(k) }
  const leave = () => { setTourStep(null); setView(1) }

  const stem = beat.stem
  const heading = stem ? c[`b_${stem}_h`] ?? '' : ''
  const line = stem ? fill(c[`b_${stem}`] ?? '', figures) : ''
  const see = stem ? fill(c[`b_${stem}_see`] ?? '', figures) : ''
  const moreText = stem ? c[`b_${stem}_more`] : undefined
  const partKey = PART_LABEL_KEY[beat.part]

  // What the reader tapped, described from the data.
  const focusBlock = useMemo<{ colour?: string; lines: string[] } | null>(() => {
    if (!focus || beat.part !== 1) return null
    if (focus.kind === 'hull') { const v = describeSubdomain(ix, focus.id); return { colour: SUBDOMAIN_COLOUR[focus.id], lines: [copy.desc_sd_what, copy.desc_sd_count, copy.desc_sd_shared].map((t) => fill(t, v)) } }
    if (focus.kind === 'link') { const l = { ucId: focus.ucId, platformId: focus.platformId }; const uc = ix.useCaseById.get(l.ucId); const edge = uc?.edges.find((e) => e.platform_id === l.platformId); const p = ix.platformById.get(l.platformId); if (!uc || !edge || !p) return null; const v = describeLink(ix, { source: uc.id, target: p.id, ucId: uc.id, platformId: p.id, spend: uc.volume_per_month * edge.driver_units_per_volume_unit * p.driver_unit_cost_gbp, units: uc.volume_per_month * edge.driver_units_per_volume_unit, cfp: edge.conditional_failure_prob }); return { colour: SUBDOMAIN_COLOUR[uc.subdomain], lines: [copy.desc_ln_what, copy.desc_ln_flow, copy.desc_ln_risk].map((t) => fill(t, v)) } }
    if (ix.useCaseById.has(focus.id)) { const v = describeUseCase(ix, focus.id, rule); const u = ix.useCaseById.get(focus.id)!; return { colour: SUBDOMAIN_COLOUR[u.subdomain], lines: [copy.desc_uc_what, copy.desc_uc_rides, copy.desc_uc_cost, copy.desc_uc_risk].map((t) => fill(t, v)) } }
    if (ix.platformById.has(focus.id)) { const v = describePlatform(ix, focus.id, rule); return { lines: [copy.desc_pf_what, copy.desc_pf_rides, copy.desc_pf_cost, copy.desc_pf_how, copy.desc_pf_rule].map((t) => fill(t, v)) } }
    return null
  }, [focus, beat.part, ix, rule])

  const rows: ReactNode = beat.rows && beat.rows.length > 0 ? (
    <div className="ledger" data-tour="ledger">
      <div className="ledger-head">{copy.story_ledger_head}</div>
      {beat.rows.map((r) => {
        const spec = ROW_KEY[r]
        const value = r === 'range' ? `GBP ${figures.lo} to GBP ${figures.hi}` : r === 'moved' ? String(figures.moved_basis) : `GBP ${figures[spec.value]}`
        return (
          <div key={r} className="ledger-row">
            <span className="l">{fill(String(copy[spec.label]), figures)}</span>
            <span className="v">{value}</span>
          </div>
        )
      })}
    </div>
  ) : null

  // The closing card. The DOI line always shows; the Medium line is
  // rendered only once the address is real, because a link to the
  // placeholder host would be a dead link on a public site.
  const mediumReady = !copy.tour_medium_url.includes(copy.tour_medium_placeholder_host)

  const style = pos ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : undefined
  return (
    <aside className={peek ? 'story peek' : 'story'} aria-label="The story" ref={cardRef} style={style}>
      <button type="button" className="story-handle" aria-label={peek ? 'Open the card' : 'Lower the card'} aria-expanded={!peek} onClick={() => setPeek((v) => !v)}><span /></button>
      <header className="story-head" onPointerDown={onHeaderDown} title={copy.story_drag}>
        {partKey && <div className="intro-part">{copy[partKey]}</div>}
        <h1 key={`h${n}`}>{heading}</h1>
      </header>
      <div className="story-body">
        {done && <div className="tour-tick" role="status">{copy.ctl_did}</div>}
        <p key={`l${n}`} className="intro-line">{line}</p>
        {see && <p key={`s${n}`} className="intro-see">{see}</p>}
        {beat.control && <Controls control={beat.control} estate={estate} />}
        {beat.control === 'shapes' && (
          <p key={`p${shapesPhase}`} className="intro-see story-phase-line">{fill(c[`shapes_${(['cost', 'risk', 'exit'] as const)[shapesPhase]}`] ?? '', figures)}</p>
        )}
        {moreText && (
          <>
            <button className="tour-more" aria-expanded={more} onClick={() => setMore((v) => !v)}>{copy.story_more}</button>
            {more && <p className="tour-more-body">{fill(moreText, figures)}</p>}
          </>
        )}
        {beat.stem === 'domains' && (
          <div className="intro-legend" data-tour="intro-legend">
            <div className="intro-legend-head">{copy.intro_legend_head}</div>
            {named.length === 0 && <div className="intro-legend-prompt">{copy.intro_legend_prompt}</div>}
            {named.map((id) => {
              const sd = estate.subdomains.find((s) => s.id === id)
              const open = focus?.kind === 'hull' && focus.id === id
              return (
                <div key={id} className={open ? 'intro-entry open' : 'intro-entry'} style={{ borderLeftColor: SUBDOMAIN_COLOUR[id] }}>
                  <button type="button" className="intro-legend-row" aria-expanded={open} onClick={() => useLedger.getState().setFocus(open ? null : { kind: 'hull', id })}>
                    <span className="intro-swatch" style={{ background: SUBDOMAIN_COLOUR[id] }} />
                    <span>{sd?.name ?? id}</span>
                    <span className="intro-legend-n">{estate.use_cases.filter((u) => u.subdomain === id).length}</span>
                    <span className="intro-chevron" aria-hidden="true" />
                  </button>
                  {open && focusBlock && <div className="intro-entry-body">{focusBlock.lines.map((t, i) => <p key={i} className={i === 0 ? 'intro-focus-lead' : ''}>{t}</p>)}</div>}
                </div>
              )
            })}
            {named.length === estate.subdomains.length && <div className="intro-legend-prompt">{fill(copy.intro_legend_done, { n_sub: estate.subdomains.length })}</div>}
          </div>
        )}
        {focusBlock && !(beat.stem === 'domains' && focus?.kind === 'hull') && (
          <div className="intro-focus" style={focusBlock.colour ? { borderLeftColor: focusBlock.colour } : undefined}>
            {focusBlock.lines.map((t, i) => <p key={i} className={i === 0 ? 'intro-focus-lead' : ''}>{t}</p>)}
            <button className="tour-skip" onClick={() => useLedger.getState().setFocus(null)}>{copy.intro_focus_clear}</button>
          </div>
        )}
        {rows}
        {beat.closing && (
          <div className="story-close" data-tour="close">
            <h3>{copy.close_h_what}</h3>
            <p>{copy.close_what}</p>
            <h3>{copy.close_h_not}</h3>
            <p>{copy.close_not}</p>
            <p className="close-caveat">{copy.close_caveat}</p>
            <h3>{copy.close_h_read}</h3>
            <p>
              {mediumReady && (
                <>
                  <a href={copy.tour_medium_url} target="_blank" rel="noreferrer">{copy.close_read_link}</a>{' '}
                </>
              )}
              {fill(copy.close_read, { doi: copy.tour_doi })}
            </p>
            <p className="close-built">{copy.close_built}</p>
          </div>
        )}
      </div>
      <footer className="story-foot">
        <div className="intro-actions">
          <button className="ctl" onClick={() => go(n - 1)} disabled={n <= 0}>{copy.story_back}</button>
          {beat.closing
            ? <button className="cta" onClick={leave}>{copy.story_explore}</button>
            : <button className="cta" onClick={() => go(n + 1)} autoFocus>{copy.story_next}</button>}
          {beat.closing
            ? <button className="tour-skip" onClick={() => go(0)}>{copy.story_restart}</button>
            : <button className="tour-skip" onClick={leave}>{copy.story_skip}</button>}
        </div>
        <div className="intro-beats" aria-hidden="true">
          {PART_COUNTS.map((count, pi) => (
            <span key={pi} className="beat-group">
              {Array.from({ length: count }, (_, i) => {
                const idx = BEATS.findIndex((b) => b.part === pi + 1) + i
                return <span key={i} className={idx <= n ? 'on' : ''} />
              })}
            </span>
          ))}
        </div>
      </footer>
    </aside>
  )
}
export const STORY_TOTAL = TOUR_STEPS
