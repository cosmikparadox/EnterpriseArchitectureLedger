// Shell. Persistent left rail on desktop, bottom tab strip on narrow
// viewports. Spec section 4.
//
// The footer is on EVERY screen, spec hard rule E. The provenance strip beside
// it carries the graph version and the decomposition owner, which canon 9.8.2
// makes required fields: an entry missing either is not a ledger entry.

import { useEffect, useMemo, useState } from 'react'
import estateJson from '../../data/estate.json'
import type { AllocationRule, Estate } from '../model/types'
import { buildIndex } from '../model/ledger'
import { copy } from '../copy'
import { Explore } from '../views/Explore'
import { FixedPool } from '../views/FixedPool'
import { Risk } from '../views/Risk'

const estate = estateJson as unknown as Estate

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
  { n: 4, t: 'Footprint', ready: false },
  { n: 5, t: 'Two shapes', ready: false },
  { n: 6, t: 'Boundaries', ready: false },
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
  const [view, setView] = useState(1)
  const dark = useDark()
  const ix = useMemo(() => buildIndex(estate), [])
  // Canon 9.2.8 default, and the spec's default: equal split.
  const [rule, setRule] = useState<AllocationRule>('equal')
  const p = estate.provenance

  return (
    <div className="app">
      <nav className="rail" aria-label="Views">
        <div className="rail-mark">Ledger</div>
        {VIEWS.map((v) => (
          <button
            key={v.n}
            aria-current={view === v.n}
            disabled={!v.ready}
            onClick={() => setView(v.n)}
            title={v.ready ? v.t : v.t + ' is not built yet'}
          >
            <span className="n">{v.n}</span>
            <span className="t">{v.t}</span>
          </button>
        ))}
      </nav>

      <main className="main">
        {view === 1 && <Explore estate={estate} ix={ix} rule={rule} dark={dark} />}
        {view === 2 && <FixedPool estate={estate} dark={dark} rule={rule} setRule={setRule} />}
        {view === 3 && <Risk estate={estate} ix={ix} dark={dark} />}
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
