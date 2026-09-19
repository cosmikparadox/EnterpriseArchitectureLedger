// Shell. Persistent left rail on desktop, bottom tab strip on narrow
// viewports. Spec section 4.
//
// The footer is on EVERY screen, spec hard rule E. The provenance strip beside
// it carries the graph version and the decomposition owner, which canon 9.8.2
// makes required fields: an entry missing either is not a ledger entry.

import { useEffect, useMemo, useState } from 'react'
import estateJson from '../../data/estate.json'
import bestOfBreedJson from '../../data/estate_bestofbreed.json'
import type { AllocationRule, Estate } from '../model/types'
import { buildIndex } from '../model/ledger'
import { copy } from '../copy'
import { useLedger, FIRST_LEDGER_CHAPTER, type View } from './store'
import { useHashRoute } from './route'
import { Explore } from '../views/Explore'
import { FixedPool } from '../views/FixedPool'
import { Risk } from '../views/Risk'
import { Footprint } from '../views/Footprint'
import { TwoShapes } from '../views/TwoShapes'
import { Boundaries } from '../views/Boundaries'
import { Landing } from '../views/Landing'
import { TourCard } from '../tour/TourCard'

const estate = estateJson as unknown as Estate
const bestOfBreed = bestOfBreedJson as unknown as Estate

const BASIS_LABEL: Record<AllocationRule, string> = {
  equal: 'equal split',
  driver: 'driver-proportional',
  by_volume: 'by volume',
  by_head: 'by headcount, prohibited by 9.2.8',
}

const VIEWS = [
  { n: 1, t: 'Explore', ready: true },
  { n: 2, t: 'Fixed pool', ready: true },
  { n: 3, t: 'Risk', ready: true },
  { n: 4, t: 'Footprint', ready: true },
  { n: 5, t: 'Two shapes', ready: true },
  { n: 6, t: 'Boundaries', ready: true },
]

function useDark(): boolean {
  const [dark, setDark] = useState(() =>
    typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const on = () => setDark(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return dark
}

// A development-only handle on the store.
//
// Acceptance T3 has to perform each step's asked-for action by script, and two
// of those actions, selecting a node and failing a node, exist only as clicks on
// a WebGL canvas with no addressable target. Rather than guess at pixels, the
// check drives the same actions the canvas would. Guarded by import.meta.env.DEV
// so it is a test seam in the dev server and not a global in the shipped file.
if (import.meta.env.DEV) {
  ;(window as unknown as { __ledger?: unknown }).__ledger = useLedger
}

export function App() {
  useHashRoute()
  const view = useLedger((s) => s.view)
  const setView = useLedger((s) => s.setView)
  // Canon 9.2.8 default, and the spec's default: equal split.
  const rule = useLedger((s) => s.rule)
  const setRule = useLedger((s) => s.setRule)
  const dark = useDark()
  const ix = useMemo(() => buildIndex(estate), [])
  const p = estate.provenance

  // The front page is the four things the brief lists and nothing else, so the
  // view rail is not on it. The two buttons are the way in.
  const onLanding = view === 'landing'
  const tourStep = useLedger((s) => s.tourStep)
  const setTourStep = useLedger((s) => s.setTourStep)
  // Steps 1 to 7 each pick their view in enter(). Step 0 has no enter(); it
  // runs inside view 1, so it has to be put there, and a deep link to #/tour/0
  // arrives with the view still on the front page.
  useEffect(() => {
    if (tourStep !== null && tourStep < FIRST_LEDGER_CHAPTER && view !== 1) setView(1)
  }, [tourStep, view, setView])
  const classes = ['app']
  if (onLanding) classes.push('landing-mode')
  // One tour, one card, one place. Chapters 0 to 6 hide every control: the
  // picture is being built and there is nothing to press. Chapters 7 to 15
  // bring the screen's own controls back, because each asks for one of them,
  // and keep the rail hidden, because the chapters choose the screen.
  if (tourStep !== null) classes.push('intro-open')
  if (tourStep !== null && tourStep >= FIRST_LEDGER_CHAPTER) classes.push('tour-open')

  return (
    <div className={classes.join(' ')}>
      {!onLanding && (
      <nav className="rail" aria-label="Views">
        <div className="rail-mark">Ledger</div>
        {VIEWS.map((v) => (
          <button
            key={v.n}
            aria-current={view === v.n}
            disabled={!v.ready}
            onClick={() => setView(v.n as View)}
            title={v.ready ? v.t : v.t + ' is not built yet'}
          >
            <span className="n">{v.n}</span>
            <span className="t">{v.t}</span>
          </button>
        ))}
        {/* The tour was reachable only from the front page, which meant once you
            had started exploring there was no way back to it. */}
        <button
          className="rail-tour"
          onClick={() => setTourStep(0)}
          // aria-pressed, not aria-current. aria-current marks the current item
          // in a set, and the set here is the six views: marking the tour that
          // way says two rail items are the current view at once, which is both
          // wrong for a screen reader and ambiguous for anything querying which
          // view is showing.
          aria-pressed={tourStep !== null}
        >
          <span className="n" aria-hidden="true">&#9654;</span>
          <span className="t">{copy.rail_tour}</span>
        </button>
      </nav>
      )}

      <main className="main">
        {view === 'landing' && <Landing />}
        {view === 1 && <Explore estate={estate} ix={ix} rule={rule} dark={dark} />}
        {view === 2 && <FixedPool estate={estate} dark={dark} rule={rule} setRule={setRule} />}
        {view === 3 && <Risk estate={estate} ix={ix} dark={dark} />}
        {view === 4 && <Footprint estate={estate} ix={ix} dark={dark} />}
        {view === 5 && <TwoShapes concentrated={estate} bestOfBreed={bestOfBreed} dark={dark} rule={rule} setRule={setRule} />}
        {view === 6 && <Boundaries estate={estate} dark={dark} rule={rule} setRule={setRule} />}
        {tourStep !== null && (
          <div className={`wordmark${tourStep > 0 ? ' wordmark-top' : ''}`} aria-hidden="true">
            <div className="wordmark-name">{copy.wordmark_name}</div>
            <div className="wordmark-tag">{tourStep === 0 ? copy.wordmark_tag : tourStep < FIRST_LEDGER_CHAPTER ? copy.wordmark_tag_one : copy.wordmark_tag_two}</div>
          </div>
        )}
        {tourStep !== null && tourStep >= FIRST_LEDGER_CHAPTER && <TourCard concentrated={estate} bestOfBreed={bestOfBreed} />}
      </main>

      <footer className="footer">
        <span>{copy.footer}</span>
        <span className="prov">
          graph {p.graph_version}, as at {p.graph_as_at} | decomposition owned by {p.decomposition_owner},
          revised {p.decomposition_revised} | basis: {BASIS_LABEL[rule]} | seed {p.seed}
        </span>
      </footer>
    </div>
  )
}
