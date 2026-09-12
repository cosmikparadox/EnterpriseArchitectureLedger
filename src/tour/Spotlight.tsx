// The spotlight under the tour card.
//
// Dims everything except the parts a step is about, and puts a short label
// beside each bright part so the dimmed screen says what it is pointing at. A
// step names its targets by data-tour attribute; step 1 also asks for the
// selected node, whose screen position the graph already publishes.
//
// It is an SVG with a mask rather than a stack of box shadows, so any number
// of holes cost the same and the labels sit in the same coordinate space as the
// holes they belong to. pointer-events is none throughout: the tool stays live
// under the dimming, which is the whole premise of the tour.

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface Spot {
  /** CSS selector for the element to keep bright. */
  selector?: string
  /** Keep the selected graph node bright, by its published screen position. */
  node?: true
  /** A few words beside the hole. */
  label?: string
}

interface Hole { x: number; y: number; w: number; h: number; r: number; label?: string; circle?: boolean }

const PAD = 8
const NODE_R = 44

function measure(spots: Spot[]): Hole[] {
  const out: Hole[] = []
  for (const s of spots) {
    if (s.node) {
      const pos = document.documentElement.dataset.selectedScreen
      if (!pos) continue
      const [x, y] = pos.split(',').map(Number) as [number, number]
      out.push({ x: x - NODE_R, y: y - NODE_R, w: NODE_R * 2, h: NODE_R * 2, r: NODE_R, label: s.label, circle: true })
      continue
    }
    if (!s.selector) continue
    const el = document.querySelector(s.selector)
    if (!el) continue
    const b = el.getBoundingClientRect()
    if (b.width === 0 || b.height === 0) continue
    out.push({ x: b.left - PAD, y: b.top - PAD, w: b.width + PAD * 2, h: b.height + PAD * 2, r: 8, label: s.label })
  }
  return out
}

export function Spotlight({ spots }: { spots: Spot[] }) {
  const [holes, setHoles] = useState<Hole[]>([])
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    let raf = 0
    let frame = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      // Every sixth frame. Targets move when panels open, sliders animate and
      // the camera flies, but none of that needs 60 measurements a second.
      if (frame++ % 6 !== 0) return
      setHoles(measure(spots))
      setSize({ w: window.innerWidth, h: window.innerHeight })
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [spots])

  if (spots.length === 0) return null

  return createPortal(
    <svg className="spotlight" width={size.w} height={size.h} aria-hidden="true">
      <defs>
        <mask id="spotlight-mask">
          <rect x={0} y={0} width={size.w} height={size.h} fill="white" />
          {holes.map((h, i) => h.circle
            ? <circle key={i} cx={h.x + h.r} cy={h.y + h.r} r={h.r} fill="black" />
            : <rect key={i} x={h.x} y={h.y} width={h.w} height={h.h} rx={h.r} fill="black" />)}
        </mask>
      </defs>
      <rect x={0} y={0} width={size.w} height={size.h} className="spotlight-dim" mask="url(#spotlight-mask)" />
      {holes.map((h, i) => h.circle
        ? <circle key={`o${i}`} cx={h.x + h.r} cy={h.y + h.r} r={h.r} className="spotlight-edge" />
        : <rect key={`o${i}`} x={h.x} y={h.y} width={h.w} height={h.h} rx={h.r} className="spotlight-edge" />)}
      {holes.map((h, i) => h.label && (
        <g key={`l${i}`} className="spotlight-label" transform={`translate(${h.x}, ${Math.max(14, h.y - 8)})`}>
          <text>{h.label}</text>
        </g>
      ))}
    </svg>,
    document.body,
  )
}
