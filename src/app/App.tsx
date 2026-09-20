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
import { useLedger, type View } from './store'
import { useHashRoute } from './route'
import { Explore } from '../views/Explore'
import { FixedPool } from '../views/FixedPool'
import { Risk } from '../views/Risk'
import { Footprint } from '../views/Footprint'
import { TwoShapes } from '../views/TwoShapes'
import { Boundaries } from '../views/Boundaries'
import { StoryCard } from '../story/StoryCard'
import { Overlay } from '../story/Overlay'
import { useStory } from '../story/useStory'

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
  const story = useStory()
  // A deep link into the story arrives with the view still on the front
  // page; the beat's own view is set by the engine, but until it has, view 1
  // is the canvas everything is drawn on.
  useEffect(() => {
    if (tourStep !== null && view === 'landing') setView(1)
    if (tourStep === null && view === 'landing') setView(1)
  }, [tourStep, view, setView])
  const classes = ['app']
  if (onLanding) classes.push('landing-mode')
  // During the story every control the screens own is hidden: the rail, the
  // top bars, the panels. The one card carries the story and, when a beat
  // asks for it, the one control.
  if (tourStep !== null) classes.push('intro-open', 'story-open')

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
        {view === 1 && <Explore estate={estate} ix={ix} rule={rule} dark={dark} />}
        {view === 2 && <FixedPool estate={estate} dark={dark} rule={rule} setRule={setRule} />}
        {view === 3 && <Risk estate={estate} ix={ix} dark={dark} />}
        {view === 4 && <Footprint estate={estate} ix={ix} dark={dark} />}
        {view === 5 && <TwoShapes concentrated={estate} bestOfBreed={bestOfBreed} dark={dark} rule={rule} setRule={setRule} />}
        {view === 6 && <Boundaries estate={estate} dark={dark} rule={rule} setRule={setRule} />}
        {story.beat && story.n !== null && (
          <>
            {/* The company name: absent on the welcome, centred on the title
                beat, then small at the top with the part beneath it. Hidden
                while a part title or an end line has the canvas. */}
            {story.n > 0 && (
              <div className={`wordmark${story.n > 1 ? ' wordmark-top' : ''}${story.beat.overlay === 'part' || story.beat.overlay === 'end' ? ' wordmark-leaving' : ''}`} aria-hidden="true">
                <div className="wordmark-name">{copy.wordmark_name}</div>
                <div className="wordmark-tag">{story.n === 1 ? copy.wordmark_tag : story.beat.part === 1 ? copy.part_label_1 : story.beat.part === 2 ? copy.part_label_2 : copy.part_label_3}</div>
              </div>
            )}
            <Overlay beat={story.beat} n={story.n} estate={estate} ix={ix} onTap={() => setTourStep(Math.min(31, (story.n ?? 0) + 1))} />
            {story.beat.card && <StoryCard beat={story.beat} n={story.n} done={story.done} estate={estate} bestOfBreed={bestOfBreed} ix={ix} />}
          </>
        )}
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
