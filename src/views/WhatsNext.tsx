// Tab 7, What's next. The page promises nothing: an informal roadmap with no
// dates, four stepping stones drawn like the old plug drawing, a marker on
// the step in hand, and step three drawn as a loop back to one and two. Under
// it, set quietly like a disclaimer, the intent, and a way to get in touch
// that shows only once an address exists.

import { useLayoutEffect, useRef, useState } from 'react'
import { copy } from '../copy'

/**
 * Where "Get in touch" points. Empty until the owner decides on an address;
 * while it is empty the link and its note are not shown. Acceptance check C3
 * allows exactly this link on this tab, and only when it is set.
 */
export const CONTACT_URL = ''

const STEPS = [
  { h: copy.next_s1_h, line: copy.next_s1, tag: copy.next_s1_tag },
  { h: copy.next_s2_h, line: copy.next_s2, tag: copy.next_s2_tag },
  { h: copy.next_s3_h, line: copy.next_s3, tag: copy.next_s3_tag },
  { h: copy.next_s4_h, line: copy.next_s4, tag: copy.next_s4_tag },
]

interface Links { chain: string[]; later: string; loops: string[]; label: { x: number; y: number } | null; w: number; h: number }

export function WhatsNext() {
  const road = useRef<HTMLDivElement>(null)
  const stones = useRef<(HTMLDivElement | null)[]>([])
  const [links, setLinks] = useState<Links | null>(null)

  // The connectors are drawn from where the stones actually sit, so the same
  // drawing reads side by side on a wide screen and stacked on a phone.
  useLayoutEffect(() => {
    const el = road.current
    if (!el) return
    const draw = () => {
      const box = el.getBoundingClientRect()
      const c = stones.current.map((s) => {
        const r = s!.getBoundingClientRect()
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, w: r.width / 2, h: r.height / 2 }
      })
      if (c.length < 4) return
      const [a, b, s3, d] = c as [typeof c[0], typeof c[0], typeof c[0], typeof c[0]]
      const row = Math.abs(a.y - b.y) < 10
      const f = (n: number) => n.toFixed(1)
      if (row) {
        const lift = Math.min(86, (s3.x - a.x) * 0.22)
        setLinks({
          chain: [[a, b], [b, s3]].map(([p, q]) => `M${f(p!.x + p!.w + 6)},${f(p!.y)} L${f(q!.x - q!.w - 6)},${f(q!.y)}`),
          later: `M${f(s3.x + s3.w + 6)},${f(s3.y)} L${f(d.x - d.w - 6)},${f(d.y)}`,
          loops: [
            `M${f(s3.x - 6)},${f(s3.y - s3.h - 4)} C${f(s3.x - 6)},${f(s3.y - s3.h - lift)} ${f(a.x)},${f(a.y - a.h - lift)} ${f(a.x)},${f(a.y - a.h - 6)}`,
            `M${f(s3.x - 16)},${f(s3.y - s3.h - 4)} C${f(s3.x - 16)},${f(s3.y - s3.h - lift * 0.5)} ${f(b.x + 8)},${f(b.y - b.h - lift * 0.5)} ${f(b.x + 8)},${f(b.y - b.h - 6)}`,
          ],
          label: { x: (a.x + s3.x) / 2, y: a.y - a.h - lift * 0.78 - 6 },
          w: box.width, h: box.height,
        })
      } else {
        const reach = Math.min(30, a.x - a.w - 4)
        setLinks({
          chain: [[a, b], [b, s3]].map(([p, q]) => `M${f(p!.x)},${f(p!.y + p!.h + 6)} L${f(q!.x)},${f(q!.y - q!.h - 6)}`),
          later: `M${f(s3.x)},${f(s3.y + s3.h + 6)} L${f(d.x)},${f(d.y - d.h - 6)}`,
          loops: [
            `M${f(s3.x - s3.w - 4)},${f(s3.y + 4)} C${f(s3.x - s3.w - reach)},${f(s3.y + 4)} ${f(a.x - a.w - reach)},${f(a.y)} ${f(a.x - a.w - 6)},${f(a.y)}`,
            `M${f(s3.x - s3.w - 4)},${f(s3.y - 6)} C${f(s3.x - s3.w - reach * 0.55)},${f(s3.y - 6)} ${f(b.x - b.w - reach * 0.55)},${f(b.y + 6)} ${f(b.x - b.w - 6)},${f(b.y + 6)}`,
          ],
          label: null,
          w: box.width, h: box.height,
        })
      }
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="plug-page next-page">
      <div className="plug-inner next-inner">
        <div className="plug-eyebrow">{copy.next_eyebrow}</div>
        <h1 className="plug-title next-title">{copy.next_title}</h1>
        <p className="plug-line next-intro">{copy.next_intro}</p>

        <div className="road" ref={road}>
          {links && (
            <svg className="road-links" width={links.w} height={links.h} aria-hidden="true">
              <defs>
                <marker id="road-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path className="road-arrow-head" d="M0,1 L9,5 L0,9 z" />
                </marker>
              </defs>
              {links.chain.map((d, i) => <path key={`c${i}`} className="road-chain" d={d} />)}
              <path className="road-chain road-later" d={links.later} />
              {links.loops.map((d, i) => <path key={`l${i}`} className="road-loop" d={d} markerEnd="url(#road-arrow)" />)}
              {links.label && <text className="road-loop-label" x={links.label.x} y={links.label.y} textAnchor="middle">{copy.next_loop}</text>}
            </svg>
          )}
          <ol className="road-steps">
            {STEPS.map((st, i) => (
              <li key={i} className={`road-step s${i + 1}`}>
                <div className="road-stone" ref={(r) => { stones.current[i] = r }}>
                  <svg viewBox="0 0 64 44" aria-hidden="true">
                    <rect x="2" y="2" width="60" height="40" rx="13" />
                    <text x="32" y="28" textAnchor="middle">{i + 1}</text>
                  </svg>
                </div>
                <div className="road-text">
                  <span className={`road-here${i === 0 ? '' : ' road-here-none'}`} aria-hidden={i !== 0}>{i === 0 ? copy.next_here : ''}</span>
                  <h3>{st.h}</h3>
                  <p>{st.line}</p>
                  <span className={`road-tag t${i + 1}`}>{st.tag}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="next-nodates">{copy.next_nodates}</p>

        <section className="next-intent" aria-labelledby="next-intent-h">
          <h2 id="next-intent-h">{copy.next_intent_h}</h2>
          <p>{copy.next_intent_1} {copy.next_intent_2}</p>
          <p>{copy.next_intent_3} {copy.next_intent_4}</p>
          <p>{copy.next_intent_5} {copy.next_intent_6}</p>
          {CONTACT_URL && (
            <>
              <a className="next-contact" href={CONTACT_URL} target="_blank" rel="noopener noreferrer">{copy.next_contact}</a>
              <p className="next-contact-note">{copy.next_contact_note}</p>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
