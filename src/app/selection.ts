// Reading the shared selection from a view that can only show some nodes.
//
// selectedId is shared so that walking from view 1 to view 2 keeps the node you
// were looking at. But views 2, 3 and 4 are about platforms, and the shared
// selection can be a use case or nothing at all. Rather than clear the shared
// value, which would lose the use case when you walked back to view 1, each of
// those views reads through this hook and falls back to its own default.

import { useMemo } from 'react'
import { useLedger } from './store'
import type { Estate } from '../model/types'

/**
 * The shared selection if it names a platform of this estate, otherwise the
 * view's own default. Returns the setter unchanged, so selecting in one view
 * still selects everywhere.
 */
export function usePlatformSelection(estate: Estate, fallback: string): [string, (id: string) => void] {
  const selectedId = useLedger((s) => s.selectedId)
  const setSelectedId = useLedger((s) => s.setSelectedId)
  const ids = useMemo(() => new Set(estate.platforms.map((p) => p.id)), [estate])
  const selected = selectedId !== null && ids.has(selectedId) ? selectedId : fallback
  return [selected, setSelectedId]
}
