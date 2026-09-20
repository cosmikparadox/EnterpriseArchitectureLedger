// The story engine.
//
// One hook, mounted once in App. It watches the beat number in the store and,
// on each change, puts the tool in that beat's state: the screen, the canvas
// scene, the overlay, whatever enter() asks for, and a waitFor armed once the
// beat's own animations have settled. Everything goes through the store, so
// nothing here reaches into a view.

import { useEffect, useRef, useState } from 'react'
import { useLedger } from '../app/store'
import { usePrefersReducedMotion } from '../app/useNarrow'
import { Timeline } from '../tour/animate'
import { BEATS, beatAt, type Beat } from './script'

const SETTLE_GRACE_MS = 500

export interface StoryState {
  beat: Beat | null
  n: number | null
  done: boolean
  /** True while the previous beat's canvas is fading out and this one's is fading in. */
  crossing: boolean
}

export function useStory(): StoryState {
  const n = useLedger((s) => s.tourStep)
  const reduced = usePrefersReducedMotion()
  const [done, setDone] = useState(false)
  const [crossing, setCrossing] = useState(false)
  const prev = useRef<number | null>(null)

  useEffect(() => {
    const beat = beatAt(n)
    if (n === null || !beat) { prev.current = null; return }
    const store = useLedger.getState()
    const entering = prev.current === null
    if (entering) store.resetStory()
    prev.current = n
    setDone(false)
    const timeline = new Timeline()

    // Order matters. The screen first, so its canvas exists; then the scene,
    // which the canvas reads; then the beat's own actions.
    if (beat.view !== 'keep' && store.view !== beat.view) store.setView(beat.view)
    store.setScene({ callout: null, hint: false, badge: null, book: false, focus: null, flow: false, ...beat.scene })
    beat.enter?.({ store: useLedger.getState(), timeline, reduced })

    // A change of screen or of the whole canvas gets a short crossing, so the
    // next picture arrives after the last has gone rather than on top of it.
    setCrossing(true)
    timeline.after(reduced ? 0 : 60, () => setCrossing(false), reduced)

    let unsubscribe: (() => void) | null = null
    timeline.after((beat.settleMs ?? 0) + SETTLE_GRACE_MS, () => {
      if (!beat.waitFor) return
      const at = { ...useLedger.getState() }
      unsubscribe = useLedger.subscribe((now) => { if (beat.waitFor!(now, at)) setDone(true) })
    }, reduced)
    return () => { timeline.cancel(); unsubscribe?.() }
  }, [n, reduced])

  // Arrow keys and Enter walk the story, so the beats without a card, the
  // part titles and the end lines, can be passed without hunting for a button.
  useEffect(() => {
    if (n === null) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); useLedger.getState().setTourStep(Math.min(BEATS.length - 1, n + 1)) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); useLedger.getState().setTourStep(Math.max(0, n - 1)) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [n])

  return { beat: beatAt(n), n, done, crossing }
}

export const STORY_LENGTH = BEATS.length
