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

  return (
    <div className="app">
      <nav className="rail" aria-label="Views">
        <div className="rail-mark">Ledger</div>
        {VIEWS.map((v) => (
          <button
            key={v.n}
            aria-current={view === v.n || (v.n === 1 && view === 'landing')}
            disabled={!v.ready}
            onClick={() => setView(v.n as View)}
            title={v.ready ? v.t : v.t + ' is not built yet'}
          >
            <span className="n">{v.n}</span>
            <span className="t">{v.t}</span>
          </button>
        ))}
      </nav>

      <main className="main">
        {/* The landing page is Part B. Until it lands, #/ shows view 1. */}
        {(view === 1 || view === 'landing') && <Explore estate={estate} ix={ix} rule={rule} dark={dark} />}
        {view === 2 && <FixedPool estate={estate} dark={dark} rule={rule} setRule={setRule} />}
        {view === 3 && <Risk estate={estate} ix={ix} dark={dark} />}
        {view === 4 && <Footprint estate={estate} ix={ix} dark={dark} />}
        {view === 5 && <TwoShapes concentrated={estate} bestOfBreed={bestOfBreed} dark={dark} rule={rule} setRule={setRule} />}
        {view === 6 && <Boundaries estate={estate} dark={dark} rule={rule} setRule={setRule} />}
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
