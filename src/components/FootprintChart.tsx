// The footprint chart. Spec section 4.4, on a month 0 to 60 axis.
//
// Hand-rolled SVG. The two lines the spec names are "what the bill showed" and
// "what it committed you to". They are distinguished by DASH PATTERN as well as
// tone, so the pair survives greyscale, per spec section 2.

export interface Series {
  label: string
  values: (number | null)[]
  dashed?: boolean
  faint?: boolean
}

export interface FootprintChartProps {
  months: number[]
  series: Series[]
  cursor: number
  ratified: number
  onCursor: (m: number) => void
  height?: number
  /** Only the lower chart of a stacked pair carries the scrubber. */
  showScrubber?: boolean
  /** Axis unit, printed on the y axis so the two stacked charts cannot be
   *  mistaken for one another. */
  unit?: string
}

const L = 46, R = 10, T = 10, B = 24

const fmt = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}m` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(Math.round(n))

export function FootprintChart({ months, series, cursor, ratified, onCursor, height = 190, showScrubber = true, unit }: FootprintChartProps) {
  const W = 320
  const H = height
  const all = series.flatMap((s) => s.values.filter((v): v is number => v !== null))
  const max = Math.max(...all, 1)
  const x = (m: number) => L + (m / Math.max(1, months[months.length - 1]!)) * (W - L - R)
  const y = (v: number) => T + (1 - v / max) * (H - T - B)

  const path = (s: Series) => {
    let d = ''
    let pen = false
    s.values.forEach((v, i) => {
      if (v === null) { pen = false; return }
      d += `${pen ? 'L' : 'M'}${x(months[i]!).toFixed(1)},${y(v).toFixed(1)}`
      pen = true
    })
    return d
  }

  return (
    <figure style={{ margin: '4px 0 0' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label="Metered spend, per-rider rule share and the execution component of leaving, over 60 months">
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={L} y1={y(max * f)} x2={W - R} y2={y(max * f)} stroke="currentColor" strokeOpacity="0.12" />
            <text x={2} y={y(max * f) + 3} fontSize="8" fill="currentColor" fillOpacity="0.6">{fmt(max * f)}</text>
          </g>
        ))}

        {/* Ratification marker. Spec section 4.4. */}
        <line x1={x(ratified)} y1={T} x2={x(ratified)} y2={H - B} stroke="currentColor" strokeOpacity="0.55" strokeDasharray="4 3" />
        <text x={Math.min(x(ratified) + 3, W - 78)} y={T + 8} fontSize="8" fill="currentColor" fillOpacity="0.8">
          ratified as strategic
        </text>

        {/* Cursor */}
        <line x1={x(cursor)} y1={T} x2={x(cursor)} y2={H - B} stroke="currentColor" strokeOpacity="0.9" />

        {series.map((s) => (
          <path
            key={s.label}
            d={path(s)}
            fill="none"
            stroke="currentColor"
            strokeWidth={s.faint ? 1 : 1.7}
            strokeOpacity={s.faint ? 0.45 : 0.95}
            strokeDasharray={s.dashed ? '5 3' : undefined}
          />
        ))}

        <text x={L} y={H - 4} fontSize="8" fill="currentColor" fillOpacity="0.6">month 0</text>
        {unit && <text x={L + 44} y={H - 4} fontSize="8" fill="currentColor" fillOpacity="0.6">{unit}</text>}
        <text x={W - R - 34} y={H - 4} fontSize="8" fill="currentColor" fillOpacity="0.6">month 60</text>
      </svg>

      {showScrubber && (
        <label style={{ display: 'block', fontSize: 11 }}>
          Month <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{cursor}</strong>
          <input
            type="range" min={0} max={60} step={1} value={cursor}
            onChange={(e) => onCursor(Number(e.target.value))}
            style={{ width: '100%' }}
            aria-label="Time scrubber, month 0 to 60"
          />
        </label>
      )}

      <figcaption style={{ fontSize: 10.5, opacity: 0.85 }}>
        {series.map((s) => (
          <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 10 }}>
            <svg width="18" height="6" aria-hidden="true">
              <line x1="0" y1="3" x2="18" y2="3" stroke="currentColor"
                strokeWidth={s.faint ? 1 : 1.7} strokeOpacity={s.faint ? 0.45 : 0.95}
                strokeDasharray={s.dashed ? '5 3' : undefined} />
            </svg>
            {s.label}
          </span>
        ))}
      </figcaption>
    </figure>
  )
}
