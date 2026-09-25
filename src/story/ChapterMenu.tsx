// The chapter menu.
//
// Closed, three lines. Opened, the lines fold into a sphere, a platform,
// and a line runs down from it with a dot for each chapter, coloured like
// the use cases, each with its name sliding out beside it. The last stop is
// the explorer, for a reader who wants to skip the chapters. It is kept
// quiet: small, in a corner, and gone again as soon as a choice is made.

import { useEffect, useRef, useState } from 'react'
import { copy } from '../copy'
import { useLedger } from '../app/store'
import { SUBDOMAIN_COLOUR } from '../app/graph'
import { CHAPTERS, partOf } from './script'

const DOTS = [SUBDOMAIN_COLOUR.sales, SUBDOMAIN_COLOUR.claims, SUBDOMAIN_COLOUR.finance, SUBDOMAIN_COLOUR.people]

export function ChapterMenu({ n }: { n: number }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement | null>(null)
  const setTourStep = useLedger((s) => s.setTourStep)
  const setView = useLedger((s) => s.setView)
  const here = partOf(n)

  useEffect(() => { setOpen(false) }, [n])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) } }
    const onDown = (e: PointerEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false) }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', onDown, true)
    return () => { window.removeEventListener('keydown', onKey, true); window.removeEventListener('pointerdown', onDown, true) }
  }, [open])

  const items = [
    ...CHAPTERS.map((ch, i) => ({ key: `c${ch.part}`, label: (copy as Record<string, string>)[`chapter_${ch.part}`] ?? '', colour: DOTS[i] ?? 'var(--accent)', current: ch.part === here, go: () => setTourStep(ch.start) })),
    { key: 'x', label: copy.chapter_explorer, sub: copy.chapter_explorer_sub, colour: '', current: false, go: () => { setTourStep(null); setView(1) } },
  ]

  return (
    <div ref={root} className={`chapter-menu${open ? ' open' : ''}`}>
      <button type="button" className="cm-button" aria-label={copy.nav_menu} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <line className="cm-l1" x1="4" y1="7" x2="20" y2="7" />
          <line className="cm-l2" x1="4" y1="12" x2="20" y2="12" />
          <line className="cm-l3" x1="4" y1="17" x2="20" y2="17" />
          <circle className="cm-sphere" cx="12" cy="12" r="5.5" />
        </svg>
      </button>
      {open && (
        <nav className="cm-list" aria-label={copy.nav_menu}>
          <span className="cm-stem" style={{ height: `${items.length * 40 - 14}px` }} />
          {items.map((it, i) => (
            <button
              key={it.key} type="button" className={`cm-item${it.current ? ' current' : ''}${it.colour ? '' : ' cm-explorer'}`}
              style={{ animationDelay: `${160 + i * 70}ms` }}
              onClick={() => { setOpen(false); it.go() }}
            >
              <span className="cm-dot" style={it.colour ? { background: it.colour } : undefined} />
              <span className="cm-label">{it.label}{'sub' in it && it.sub ? <em>{it.sub}</em> : null}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
