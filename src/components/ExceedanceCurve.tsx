// Loss exceedance curve. Spec section 4.3: X axis USD loss on a log scale,
// Y axis probability of exceeding, with a movable budget line.
//
// Hand-rolled SVG, no chart library. The curve is the empirical distribution
// straight off the sorted sample, not a fit.

import { useMemo } from 'react'
import type { ExceedancePoint } from '../model/montecarlo'
import { copy } from '../copy'

const W = 300, H = 170, L = 40, R = 8, T = 8, B = 26

export interface ExceedanceCurveProps {
  points: ExceedancePoint[]
  budget: number
  onBudget: (v: number) => void
  label: string
}

const fmtGbp = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}m` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(Math.round(n))

export function ExceedanceCurve({ points, budget, onBudget, label }: ExceedanceCurveProps) {
  const usable = points.filter((p) => p.loss > 0 && p.prob > 0)
  const geom = useMemo(() => {
    if (usable.length < 2) return null
    const lo = Math.log10(Math.max(1, usable[0]!.loss))
    const hi = Math.log10(usable[usable.length - 1]!.loss)
    const span = Math.max(hi - lo, 0.5)
    const x = (v: number) => L + ((Math.log10(Math.max(1, v)) - lo) / span) * (W - L - R)
    // Y is log too, because the interesting part is the tail. The domain is
    // fitted to the sample: most platform failures are rare, so a fixed
    // 100 percent top would squash every curve into the bottom of the frame.
    const pHi = Math.max(...usable.map((u) => u.prob))
    const pLo = Math.min(...usable.map((u) => u.prob))
    const yHi = Math.log10(pHi)
    const yLo = Math.log10(Math.max(1e-5, pLo))
    const ySpan = Math.max(yHi - yLo, 0.5)
    const y = (p: number) => T + ((yHi - Math.log10(Math.max(1e-5, p))) / ySpan) * (H - T - B)
    return { x, y, pHi, pLo }
  }, [usable])

  if (!geom) return <div className="note">{copy.ec_sparse}</div>
  const { x, y } = geom

  const d = usable.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.loss).toFixed(1)},${y(p.prob).toFixed(1)}`).join('')

  // Probability of exceeding the budget line, read off the same sample.
  let atBudget = 0
  for (const p of usable) if (p.loss >= budget) atBudget = Math.max(atBudget, p.prob)

  // Decade gridlines inside the fitted domain.
  const topDecade = Math.ceil(Math.log10(geom.pHi))
  const decades: number[] = []
  for (let k = topDecade; k >= Math.floor(Math.log10(Math.max(1e-5, geom.pLo))); k--) {
    decades.push(Math.pow(10, k))
  }

  return (
    <figure style={{ margin: '6px 0 0' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Loss exceedance curve for ${label}`}>
        {decades.map((p) => (
          <g key={p}>
            <line x1={L} y1={y(p)} x2={W - R} y2={y(p)} stroke="currentColor" strokeOpacity="0.12" />
            <text x={2} y={y(p) + 3} fontSize="8" fill="currentColor" fillOpacity="0.6">
              {p >= 1 ? '100%' : `${(p * 100).toFixed(p < 0.001 ? 2 : p < 0.01 ? 1 : 0)}%`}
            </text>
          </g>
        ))}
        <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" />
        <line x1={x(budget)} y1={T} x2={x(budget)} y2={H - B} stroke="currentColor" strokeOpacity="0.75" strokeDasharray="3 3" />
        <text x={Math.min(x(budget) + 3, W - 54)} y={T + 9} fontSize="8" fill="currentColor" fillOpacity="0.8">
          budget {fmtGbp(budget)}
        </text>
        <text x={L} y={H - 14} fontSize="8" fill="currentColor" fillOpacity="0.6">{fmtGbp(usable[0]!.loss)}</text>
        <text x={W - R - 22} y={H - 14} fontSize="8" fill="currentColor" fillOpacity="0.6">
          {fmtGbp(usable[usable.length - 1]!.loss)}
        </text>
        <text x={L} y={H - 3} fontSize="8" fill="currentColor" fillOpacity="0.6">USD loss, log scale</text>
      </svg>
      <label style={{ display: 'block', fontSize: 11 }}>
        Budget line
        <input
          type="range" min={50_000} max={3_000_000} step={25_000} value={budget}
          onChange={(e) => onBudget(Number(e.target.value))}
          style={{ width: '100%' }}
          aria-label="Move the budget line"
        />
      </label>
      <figcaption style={{ fontSize: 11.5 }}>
        Probability of exceeding USD {budget.toLocaleString('en-GB')}:{' '}
        <strong>{(atBudget * 100).toFixed(atBudget < 0.01 ? 2 : 1)} percent</strong>
      </figcaption>
    </figure>
  )
}
