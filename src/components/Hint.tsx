// Hover explanations.
//
// The tool was using terms of art with nothing to go on: somebody landing on
// view 2 cold reads "fixed pool", "rule share" and "C1 annotation" and has no
// way in. These give a one line answer on hover, without putting a paragraph on
// every screen. The narrated tour is where the argument gets made; this is only
// so the words mean something in the meantime.
//
// Rendered through a portal on the body rather than inside the element it
// describes, because most of these sit in a panel with overflow: auto, which
// would clip a tooltip positioned inside it.
//
// Hover and keyboard focus both open it, and Escape closes it, so it is not a
// mouse-only affordance.

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { glossary, viewPurpose, type GlossaryKey } from '../copy'

interface Pos { left: number; top: number; below: boolean }

const WIDTH = 230
const GAP = 8

export interface HintProps {
  tip: string
  children: ReactNode
  /** Inline-block by default; block where the trigger is a whole row. */
  block?: boolean
}

export function Hint({ tip, children, block }: HintProps) {
  const holder = useRef<HTMLSpanElement | null>(null)
  const [pos, setPos] = useState<Pos | null>(null)
  const id = useId()

  const open = useCallback(() => {
    const el = holder.current
    if (!el) return
    const r = el.getBoundingClientRect()
    // Above the trigger by default. Flip below when there is not room, which is
    // what happens for anything in the top bar.
    const below = r.top < 130
    const left = Math.min(
      Math.max(GAP, r.left + r.width / 2 - WIDTH / 2),
      Math.max(GAP, window.innerWidth - WIDTH - GAP),
    )
    setPos({ left, top: below ? r.bottom + GAP : r.top - GAP, below })
  }, [])

  const close = useCallback(() => setPos(null), [])

  useEffect(() => {
    if (!pos) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    addEventListener('keydown', onKey)
    // A tooltip anchored to a rectangle that has moved is worse than no tooltip.
    addEventListener('scroll', close, true)
    addEventListener('resize', close)
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('scroll', close, true)
      removeEventListener('resize', close)
    }
  }, [pos, close])

  return (
    <>
      <span
        ref={holder}
        className={block ? 'hint hint-block' : 'hint'}
        onMouseEnter={open}
        onMouseLeave={close}
        onFocusCapture={open}
        onBlurCapture={close}
        aria-describedby={pos ? id : undefined}
      >
        {children}
      </span>
      {pos && createPortal(
        <span
          id={id}
          role="tooltip"
          className="tip"
          style={{
            left: pos.left,
            top: pos.top,
            width: WIDTH,
            transform: pos.below ? undefined : 'translateY(-100%)',
          }}
        >
          {tip}
        </span>,
        document.body,
      )}
    </>
  )
}

/**
 * A word from the glossary, marked as explainable and carrying its definition.
 * Pass children to label it differently from the glossary's own wording, for
 * places where the screen already says it another way.
 */
export function Term({ k, children }: { k: GlossaryKey; children?: ReactNode }) {
  const g = glossary[k]
  return (
    <Hint tip={g.tip}>
      <span className="term" tabIndex={0}>{children ?? g.label}</span>
    </Hint>
  )
}

/**
 * The screen's name in the top bar, carrying a line on what the screen is for.
 * That line is the first thing somebody landing cold needs, and it is the one
 * place on every screen where it fits without taking room from the graph.
 */
export function ViewName({ n, children }: { n: number; children: ReactNode }) {
  return (
    <Hint tip={viewPurpose[n] ?? ''}>
      <span className="sub term" tabIndex={0}>{children}</span>
    </Hint>
  )
}
