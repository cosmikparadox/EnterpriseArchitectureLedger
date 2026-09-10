// Shared collapsible side panel. On desktop it sits on the right and collapses
// to a vertical tab; on narrow viewports it slides up from the bottom and
// collapses to a small bar, per spec section 2.
//
// Every view uses this, so the panel behaves the same way everywhere.

import type { ReactNode } from 'react'

export interface PanelShellProps {
  label: string
  collapsed: boolean
  onToggle: () => void
  /** Shown on the collapsed tab, so it is clear what reopening would give you. */
  tabHint?: string
  children: ReactNode
}

export function PanelShell({ label, collapsed, onToggle, tabHint, children }: PanelShellProps) {
  if (collapsed) {
    return (
      <button className="panel-tab" onClick={onToggle} aria-expanded={false} aria-label={`Open ${label}`}>
        {tabHint ?? label}
      </button>
    )
  }
  return (
    <aside className="panel" aria-label={label}>
      <button className="close" onClick={onToggle} aria-expanded={true} aria-label={`Collapse ${label}`}>
        x
      </button>
      {children}
    </aside>
  )
}
