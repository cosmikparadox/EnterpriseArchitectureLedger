// The W(K) curve. Canon 9.5.4 REQUIRES it: "Evaluate W(K) across the full
// plausible range of K, not only at the two reporting points. Plot the curve.
// Show where both points sit on it." Canon 9.8.2 lists it as a required
// reported field, and states that an option component without the curve behind
// it is not checkable.
//
// Hand-rolled SVG. No chart library.

import type { WCurve } from '../model/ledger'

const W = 286, H = 96, PADL = 4, PADR = 4, PADT = 8, PADB = 16

export function WKCurve({ curve }: { curve: WCurve }) {
  const { points, kReversible, kCommitted, monotone } = curve
  if (points.length < 2) return null
  const kMax = points[points.length - 1]!.k || 1
  const wMax = Math.max(...points.map((p) => p.w), 1)

  const x = (k: number) => PADL + (k / kMax) * (W - PADL - PADR)
  const y = (w: number) => PADT + (1 - w / wMax) * (H - PADT - PADB)

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.k).toFixed(1)},${y(p.w).toFixed(1)}`).join('')
  const wAt = (k: number) => {
    let best = points[0]!
    for (const p of points) if (Math.abs(p.k - k) < Math.abs(best.k - k)) best = p
    return best.w
  }

  return (
    <figure style={{ margin: '8px 0 0' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label="Option value W plotted against switching cost K, with the reversible and committed points marked">
        <line x1={PADL} y1={y(0)} x2={W - PADR} y2={y(0)} stroke="currentColor" strokeOpacity="0.25" />
        <path d={d} fill="none" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.85" />
        {([['reversible', kReversible], ['committed', kCommitted]] as const).map(([label, k]) => (
          <g key={label}>
            <line x1={x(k)} y1={PADT} x2={x(k)} y2={y(0)} stroke="currentColor" strokeOpacity="0.4" strokeDasharray="2 2" />
            <circle cx={x(k)} cy={y(wAt(k))} r="3" fill="currentColor" />
            <text x={Math.min(x(k), W - 60)} y={H - 4} fontSize="8" fill="currentColor" fillOpacity="0.7">{label}</text>
          </g>
        ))}
      </svg>
      <figcaption style={{ fontSize: 10.5, opacity: 0.75 }}>
        W(K) across the full range of K, with both reporting points on it.
        {monotone
          ? ' The curve is monotone between them, so the difference is a property of the decision.'
          : ' The curve is NOT monotone between them. Canon 9.5.4 refuses the option component here.'}
      </figcaption>
    </figure>
  )
}
