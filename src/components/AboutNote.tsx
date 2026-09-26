// About and disclaimers, opened from the footer on every screen. Set like
// the work in progress note: a short panel, plain sentences, one way out.

import { useEffect } from 'react'
import { copy } from '../copy'

const LINES = ['about_1', 'about_2', 'about_3', 'about_4', 'about_5', 'about_6', 'about_7', 'about_8', 'about_9', 'about_data'] as const

export function AboutNote({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])
  return (
    <aside className="about-note" role="dialog" aria-label={copy.about_h}>
      <strong>{copy.about_h}</strong>
      <ul>
        {LINES.map((k) => <li key={k}>{copy[k]}</li>)}
      </ul>
      <div className="wip-actions">
        <button type="button" className="tour-skip" onClick={onClose} autoFocus>{copy.about_close}</button>
      </div>
    </aside>
  )
}
