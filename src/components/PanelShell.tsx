// Shared collapsible side panel. On desktop it sits on the right and collapses
// to a vertical tab; on narrow viewports it is a bottom sheet and collapses to a
// small bar, per spec section 2.
//
// Every view uses this, so the panel behaves the same way everywhere.
//
// On a wide screen the panel's left edge is a grip: drag it, or use the
// arrow keys on it, to make the panel wider or narrower. The canvas ends
// where the panel begins, so the map re-frames to the room it has, and the
// panel's content reflows: two columns of sections once it is wide enough,
// charts across both. The width is remembered in this browser only.
//
// The sheet opens at 40 percent of the screen rather than 62. At 62 the graph
// was a strip above a wall of text, which inverts what the tool is for. The
// handle drags it to 62 when the reading matters more than the picture, and
// snaps to whichever of the two it is nearer when let go.

import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNarrow } from '../app/useNarrow'
import { copy } from '../copy'

/**
 * The panel's pinned footer, for anything that must stay in reach while the
 * body scrolls: the walkthrough's Back and Next. Empty, it takes no room.
 */
export const PanelFootContext = createContext<HTMLElement | null>(null)

export interface PanelShellProps {
  label: string
  collapsed: boolean
  onToggle: () => void
  /** Shown on the collapsed tab, so it is clear what reopening would give you. */
  tabHint?: string
  children: ReactNode
}

const SHORT = 40
const TALL = 62
/** Desktop panel widths, in pixels. */
export const PANEL_DEFAULT = 360
const PANEL_MIN = 300
const WIDTH_KEY = 'ledger.panelWidth'
const panelMax = () => Math.max(PANEL_MIN, Math.min(820, Math.round(window.innerWidth * 0.6)))
const clampWidth = (w: number) => Math.round(Math.min(panelMax(), Math.max(PANEL_MIN, w)))
function readWidth(): number {
  try { const v = Number(localStorage.getItem(WIDTH_KEY)); return Number.isFinite(v) && v > 0 ? clampWidth(v) : PANEL_DEFAULT } catch { return PANEL_DEFAULT }
}
/** The panel's width, on the root, for everything that sits beside it: the canvas, the switches. */
function publishWidth(w: number | null): void {
  const root = document.documentElement
  if (w === null) root.style.removeProperty('--panel-w'); else root.style.setProperty('--panel-w', `${w}px`)
}

/**
 * Publish the sheet's height as a custom property on the root, so anything that
 * has to sit clear of the sheet, the legend and the tour card, can follow it
 * without being told. Collapsed reports the height of the reopen bar.
 */
function publishSheetHeight(narrow: boolean, collapsed: boolean, pct: number): void {
  const root = document.documentElement
  if (!narrow) { root.style.removeProperty('--sheet-height'); return }
  root.style.setProperty('--sheet-height', collapsed ? '34px' : `${pct}%`)
}

export function PanelShell({ label, collapsed, onToggle, tabHint, children }: PanelShellProps) {
  const narrow = useNarrow()
  const [pct, setPct] = useState(SHORT)
  const dragging = useRef(false)
  const [width, setWidth] = useState(readWidth)
  const [foot, setFoot] = useState<HTMLDivElement | null>(null)
  const [resizing, setResizing] = useState(false)
  useEffect(() => {
    publishWidth(narrow || collapsed ? null : width)
    return () => publishWidth(null)
  }, [narrow, collapsed, width])
  // A window made narrower must not leave the panel wider than it allows.
  useEffect(() => {
    const onResize = () => setWidth((w) => clampWidth(w))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const keep = (w: number) => { try { localStorage.setItem(WIDTH_KEY, String(w)) } catch { /* not remembered; the width still holds for this visit */ } }
  const onGripDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    const right = (el.parentElement?.getBoundingClientRect().right ?? window.innerWidth)
    setResizing(true)
    let last = width
    const move = (ev: PointerEvent) => { last = clampWidth(right - ev.clientX); setWidth(last) }
    const up = () => {
      el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up)
      setResizing(false); keep(last)
    }
    el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up)
  }
  const onGripKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 80 : 24
    let next: number | null = null
    if (e.key === 'ArrowLeft') next = width + step
    else if (e.key === 'ArrowRight') next = width - step
    else if (e.key === 'Home') next = PANEL_DEFAULT
    if (next === null) return
    e.preventDefault()
    const w = clampWidth(next)
    setWidth(w); keep(w)
  }

  useEffect(() => {
    publishSheetHeight(narrow, collapsed, pct)
    return () => { document.documentElement.style.removeProperty('--sheet-height') }
  }, [narrow, collapsed, pct])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return
    // Measured against the sheet's containing block, not the window. The sheet
    // lives inside the graph area, which is shorter than the screen by the top
    // bar, the tab strip and the footer, and a percentage set here resolves
    // against that box. Using the window would make the drag outrun the finger.
    const box = (e.currentTarget.offsetParent as HTMLElement | null)?.getBoundingClientRect()
    const top = box?.top ?? 0
    const h = box?.height || window.innerHeight || 1
    const next = ((top + h - e.clientY) / h) * 100
    setPct(Math.min(TALL, Math.max(SHORT, next)))
  }, [])

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    setPct((p) => (p - SHORT < TALL - p ? SHORT : TALL))
  }, [])

  if (collapsed) {
    return (
      <button className="panel-tab" onClick={onToggle} aria-expanded={false} aria-label={`Open ${label}`}>
        {tabHint ?? label}
      </button>
    )
  }
  return (
    <aside className={resizing ? 'panel resizing' : 'panel'} aria-label={label} style={narrow ? { height: `${pct}%` } : { width }}>
      {!narrow && (
        <div
          className="panel-grip" role="separator" aria-orientation="vertical" tabIndex={0}
          aria-label={copy.panel_resize} title={copy.panel_resize_hint}
          aria-valuemin={PANEL_MIN} aria-valuemax={panelMax()} aria-valuenow={width}
          onPointerDown={onGripDown} onKeyDown={onGripKey}
          onDoubleClick={() => { setWidth(PANEL_DEFAULT); keep(PANEL_DEFAULT) }}
        ><span /></div>
      )}
      <button
        className="sheet-handle"
        aria-label={`Resize ${label}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        // Tap and keyboard both toggle between the two heights, so the sheet is
        // reachable without a drag.
        onClick={() => { if (!dragging.current) setPct((p) => (p === SHORT ? TALL : SHORT)) }}
      />
      <button className="close" onClick={onToggle} aria-expanded={true} aria-label={`Collapse ${label}`}>
        x
      </button>
      <PanelFootContext.Provider value={foot}>
        <div className="panel-body">{children}</div>
      </PanelFootContext.Provider>
      <div className="panel-foot" ref={setFoot} />
    </aside>
  )
}
