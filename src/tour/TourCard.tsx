// The ledger chapters' card, 7 to 15. Brief B2.
//
// It is the same card as the intro's, in the same place, with the same
// buttons and the same row of bars, because the two parts are one tour. What
// differs is the engine underneath: each chapter drives a view through the
// store, waits for the thing it asked for, and keeps a spotlight on it.
//
// An overlay, not a modal: the tool underneath stays live the whole way through,
// and every step asks you to touch it. Next is always enabled. waitFor only adds
// a tick when you have done the thing; it never gates anything, because a tour
// that will not let you past is a tour people close.
//
// The card is right-anchored on wide screens and bottom-anchored otherwise. The
// canvas is inset by the card's footprint rather than drawn underneath it, so a
// node the card is talking about cannot end up behind the card.

import { useEffect, useRef, useState } from 'react'
import { copy, fill } from '../copy'
import { useLedger, TOUR_STEPS, FIRST_LEDGER_CHAPTER } from '../app/store'
import { usePrefersReducedMotion } from '../app/useNarrow'
import { stepFor } from './steps'
import { Timeline } from './animate'
import { useTourFigures } from './figures'
import { Spotlight } from './Spotlight'
import type { Estate } from '../model/types'

export interface TourCardProps {
  concentrated: Estate
  bestOfBreed: Estate
}

type CopyMap = Record<string, string>

/** Room for the last animation frame to land before waitFor starts watching. */
const SETTLE_GRACE_MS = 500

export function TourCard({ concentrated, bestOfBreed }: TourCardProps) {
  const step = useLedger((s) => s.tourStep)
  const setTourStep = useLedger((s) => s.setTourStep)
  const setView = useLedger((s) => s.setView)
  const reduced = usePrefersReducedMotion()
  const [showMore, setShowMore] = useState(false)
  const [done, setDone] = useState(false)

  const figures = useTourFigures(concentrated, bestOfBreed, copy.tour_doi)

  // ---- entering a step, then arming its waitFor once it has settled
  //
  // The two are one effect because the arming depends on the entering. A step
  // that animates a slider must not congratulate the viewer for the slider it
  // is moving itself, so waitFor is armed only after enter()'s own animations
  // have finished, and the state it compares against is read at that moment.
  useEffect(() => {
    if (step === null || step < FIRST_LEDGER_CHAPTER) return
    const def = stepFor(step)
    if (!def) return
    const timeline = new Timeline()
    setShowMore(false)
    setDone(false)
    def.enter({ store: useLedger.getState(), timeline, reduced })

    let unsubscribe: (() => void) | null = null
    // The grace period is not padding. settleMs is when the last animation was
    // asked to finish; the frame that writes its final value lands a tick or two
    // later, and arming on the exact millisecond reads that frame as the viewer
    // moving the slider. Steps 2 and 5 both did, before this was here.
    timeline.after(def.settleMs + SETTLE_GRACE_MS, () => {
      if (!def.waitFor) return
      const entry = { ...useLedger.getState() }
      unsubscribe = useLedger.subscribe((now) => {
        if (def.waitFor!(now, entry)) setDone(true)
      })
    }, reduced)

    return () => { timeline.cancel(); unsubscribe?.() }
  }, [step, reduced])

  // Publish the card's real height, so the layout clears exactly the card and
  // not the ceiling it is allowed to grow to. Cleared on unmount so a finished
  // tour gives the space back.
  const cardRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const root = document.documentElement
    const publish = () => root.style.setProperty('--tour-card-actual-h', `${Math.ceil(el.getBoundingClientRect().height)}px`)
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    return () => { ro.disconnect(); root.style.removeProperty('--tour-card-actual-h') }
  }, [step])

  if (step === null || step < FIRST_LEDGER_CHAPTER) return null
  const def = stepFor(step)
  if (!def) return null

  const c = copy as unknown as CopyMap
  const heading = c[`tour_${step}_layer`] ?? ''
  const doText = c[`tour_${step}_do`]
  const seeText = c[`tour_${step}_see`]
  const costText = c[`tour_${step}_cost`]
  const moreText = c[`tour_${step}_more`]

  const leave = () => { setTourStep(null) }
  // Back from the first ledger chapter returns to the last chapter of the
  // picture; the two parts are one tour.
  const go = (n: number) => {
    if (n < 0) return
    if (n > TOUR_STEPS) { leave(); return }
    setTourStep(n)
  }

  // The Medium line is rendered only once the address is real. A link to the
  // placeholder host would be a dead link on a public site.
  const mediumReady = !copy.tour_medium_url.includes(copy.tour_medium_placeholder_host)

  return (
    <>
    <Spotlight spots={def.spots} />
    <aside className="intro" aria-label="Guided tour" ref={cardRef}>
      <h1 key={`h${step}`}>{def.closing ? copy.tour_15_layer : heading}</h1>
      {done && <div className="tour-tick" role="status">{copy.tour_did_it}</div>}

      {def.closing ? (
        <div className="tour-body">
          <h3>{copy.tour_15_h_what}</h3>
          <p>{copy.tour_15_what}</p>
          <h3>{copy.tour_15_h_not}</h3>
          <p>{copy.tour_15_not}</p>
          <h3>{copy.tour_15_h_read}</h3>
          <p>
            {mediumReady && (
              <>
                <a href={copy.tour_medium_url} target="_blank" rel="noreferrer">
                  {copy.tour_15_read_link}
                </a>{' '}
              </>
            )}
            {fill(copy.tour_15_read, figures)}
          </p>
          <p className="tour-built">{copy.tour_15_built}</p>
          <div className="intro-actions">
            <button className="ctl" onClick={() => go(step - 1)}>{copy.tour_back}</button>
            <button className="cta" onClick={() => { leave(); setView(1) }}>
              {copy.tour_15_explore}
            </button>
            <button className="tour-skip" onClick={() => go(0)}>{copy.tour_15_restart}</button>
          </div>
        </div>
      ) : (
        <div className="tour-body">
          <p key={`d${step}`} className="intro-line">{fill(doText ?? '', figures)}</p>
          <p key={`s${step}`} className="intro-see">{fill(seeText ?? '', figures)}</p>
          {costText && <p className="tour-cost">{fill(costText, figures)}</p>}
          {moreText && (
            <>
              <button
                className="tour-more"
                aria-expanded={showMore}
                onClick={() => setShowMore((v) => !v)}
              >
                {copy.tour_more}
              </button>
              {showMore && <p className="tour-more-body">{fill(moreText, figures)}</p>}
            </>
          )}
          <div className="intro-actions">
            <button className="ctl" onClick={() => go(step - 1)}>{copy.tour_back}</button>
            <button className="cta" onClick={() => go(step + 1)}>{copy.tour_next}</button>
            <button className="tour-skip" onClick={leave}>{copy.tour_skip}</button>
          </div>
        </div>
      )}
      <div className="intro-beats" aria-hidden="true">
        {Array.from({ length: TOUR_STEPS }, (_, i) => i + 1).map((b) => <span key={b} className={b <= step ? 'on' : ''} />)}
      </div>
    </aside>
    </>
  )
}
