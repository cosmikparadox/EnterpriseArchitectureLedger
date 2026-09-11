// Shared collapsible side panel. On desktop it sits on the right and collapses
// to a vertical tab; on narrow viewports it is a bottom sheet and collapses to a
// small bar, per spec section 2.
//
// Every view uses this, so the panel behaves the same way everywhere.
//
// The sheet opens at 40 percent of the screen rather than 62. At 62 the graph
// was a strip above a wall of text, which inverts what the tool is for. The
// handle drags it to 62 when the reading matters more than the picture, and
// snaps to whichever of the two it is nearer when let go.

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNarrow } from '../app/useNarrow'

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
    <aside className="panel" aria-label={label} style={narrow ? { height: `${pct}%` } : undefined}>
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
      {children}
    </aside>
  )
}
