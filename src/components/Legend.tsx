// The legend, in one place so every view's behaves the same.
//
// Below 720px the legend used to be display: none. That removed the key to the
// glyphs from exactly the screens where the glyphs are hardest to read, so on
// narrow viewports it is now a strip you can open rather than nothing at all.
// It opens upward from the bottom left and defaults to closed, because the
// canvas is the point and a legend covering a third of it is worse than a
// legend you have to ask for.

import { useEffect, useState, type ReactNode } from 'react'
import { useNarrow } from '../app/useNarrow'

export function Legend({ children }: { children: ReactNode }) {
  const narrow = useNarrow()
  const [open, setOpen] = useState(!narrow)
  // Rotating a phone should not leave a desktop-width legend collapsed, or a
  // phone-width one covering the graph.
  useEffect(() => { setOpen(!narrow) }, [narrow])

  return (
    <div className={`legend${open ? ' open' : ''}`}>
      <button
        className="legend-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Legend
      </button>
      <div className="legend-body" hidden={!open}>{children}</div>
    </div>
  )
}
