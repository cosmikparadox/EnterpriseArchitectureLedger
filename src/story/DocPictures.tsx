// What each of part two's six documents looks like, drawn.
//
// Illustrations of the common shapes, not copies of anyone's document: a
// capability heat map is nested boxes tinted by a score, an inventory is a
// spreadsheet with more columns than fit, integration diagrams are boxes and
// crossing arrows in three hands, a risk register is a table beside a five by
// five grid, contracts are a renewals list in several currencies, budget lines
// are cost centres with no use case column. Words on them are labels, kept
// short; the sentence under each is in the copy deck. Platform names appear
// where a real inventory or contract list would carry them, in grey, as
// furniture.

import type { ReactNode } from 'react'
import { copy } from '../copy'
import type { Estate } from '../model/types'

const CAP: [string, string[]][] = [
  ['Distribution', ['Broker management', 'Direct sales', 'Renewals', 'Quote and bind']],
  ['Underwriting', ['Pricing', 'Risk assessment', 'Referrals', 'Binding authority']],
  ['Claims', ['First notice', 'Triage', 'Settlement', 'Recovery']],
  ['Finance', ['Billing', 'Reconciliation', 'Reporting', 'Reinsurance']],
  ['People', ['Hiring', 'Payroll', 'Learning', 'Leavers']],
]
// Scores one to five, laid out so the sheet reads as a heat map. Judgment by
// construction, which is the point of the picture.
const CAP_SCORE = [[4, 2, 3, 1], [3, 3, 2, 4], [2, 1, 3, 2], [4, 3, 4, 2], [3, 4, 2, 3]]
const HEAT = ['', '#e06c75', '#e9955c', '#f2c14e', '#b9cf6a', '#7bc47f']

const RISKS: [string, string, number, number][] = [
  ['R-014', 'Sign-on outage', 4, 5],
  ['R-021', 'Key person dependency', 3, 4],
  ['R-033', 'Licence lapse', 2, 4],
  ['R-047', 'Data platform capacity', 3, 3],
  ['R-052', 'Unsupported version', 4, 2],
  ['R-061', 'Vendor exit', 1, 5],
]
const rating = (l: number, i: number) => (l * i >= 15 ? 'H' : l * i >= 8 ? 'M' : 'L')

const CURRENCIES = ['GBP', 'USD', 'EUR', 'CHF']
const BUDGET: [string, string, number, number][] = [
  ['CC-4100', 'Infrastructure', 1240, 1312],
  ['CC-4120', 'Application support', 860, 902],
  ['CC-4130', 'Licences', 2115, 2098],
  ['CC-4200', 'Data and reporting', 640, 731],
  ['CC-4300', 'Security', 410, 398],
  ['CC-4400', 'Change portfolio', 1875, 2240],
]
const k = (n: number) => `${n.toLocaleString('en-GB')}k`

export function DocPicture({ i, estate }: { i: number; estate: Estate }) {
  const c = copy as unknown as Record<string, string>
  const head = <div className="dp-head"><strong>{c[`doc_${i}`]}</strong><span>{c[`docpic_${i}_tag`]}</span></div>
  const foot = <div className="dp-foot">{c[`docpic_${i}_sub`]}</div>
  let body: ReactNode = null
  if (i === 1) body = (
    <div className="dp-cap">
      {CAP.map(([l1, l2s], ci) => (
        <div key={l1} className="dp-cap-col">
          <div className="dp-cap-l1">{l1}</div>
          {l2s.map((l2, ri) => <div key={l2} className="dp-cap-l2 dp-in" style={{ background: HEAT[CAP_SCORE[ci]![ri]!], animationDelay: `${(ci * 4 + ri) * 45}ms` }}>{l2}</div>)}
        </div>
      ))}
      <div className="dp-cap-key">{[1, 2, 3, 4, 5].map((s) => <span key={s}><i style={{ background: HEAT[s] }} />{s}</span>)}</div>
    </div>
  )
  if (i === 2) body = (
    <div className="dp-sheet">
      <table>
        <thead><tr><th /><th>ID</th><th>Application</th><th>Owner</th><th>Cost centre</th><th>Status</th><th>Reviewed</th><th>Hosting</th><th>Tier</th></tr></thead>
        <tbody>
          {estate.platforms.slice(0, 9).map((p, r) => (
            <tr key={p.id} className="dp-in" style={{ animationDelay: `${r * 40}ms` }}>
              <td className="dp-rn">{r + 1}</td><td>APP-{String(104 + r * 7).padStart(4, '0')}</td><td>{p.name}</td>
              <td><span className="dp-bar" style={{ width: 40 + (r * 13) % 30 }} /></td><td>CC-41{(r * 3) % 4}0</td><td>Active</td>
              <td>{2024 + (r % 3)}-{String(1 + (r * 5) % 12).padStart(2, '0')}</td><td><span className="dp-bar" style={{ width: 30 }} /></td><td>{1 + (r % 3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="dp-more">{c.docpic_2_more}</div>
    </div>
  )
  if (i === 3) body = (
    <div className="dp-diagrams">
      {[0, 1, 2].map((d) => (
        <svg key={d} className="dp-diagram dp-in" style={{ animationDelay: `${d * 160}ms` }} viewBox="0 0 220 150">
          <rect x="8" y="14" width="56" height="28" rx={d === 1 ? 14 : 3} />
          <rect x="150" y="14" width="56" height="28" rx={d === 1 ? 14 : 3} />
          <rect x="80" y="64" width="60" height="28" rx={d === 1 ? 14 : 3} />
          <rect x="8" y="112" width="56" height="28" rx={d === 1 ? 14 : 3} />
          <rect x="150" y="112" width="56" height="28" rx={d === 1 ? 14 : 3} />
          {d === 2 && <line className="dp-bus" x1="10" y1="100" x2="210" y2="100" />}
          <path className="dp-arrow" d="M64 28 L150 28" />
          <path className="dp-arrow" d="M36 42 L110 64" />
          <path className="dp-arrow" d="M178 42 L110 64" />
          <path className="dp-arrow" d="M36 112 L178 42" />
          <path className="dp-arrow" d="M178 112 L36 42" />
          <path className="dp-arrow" d="M110 92 L36 112" />
          <path className="dp-arrow" d="M110 92 L178 112" />
          <text x="36" y="32">CRM</text><text x="178" y="32">Policy</text><text x="110" y="82">Bus</text>
          <text x="36" y="130">Billing</text><text x="178" y="130">Data</text>
          <text className="dp-stamp" x="110" y="146">{['v3 FINAL (2)', 'draft, do not share', 'as-is, 2024'][d]}</text>
        </svg>
      ))}
    </div>
  )
  if (i === 4) body = (
    <div className="dp-risk">
      <table>
        <thead><tr><th>ID</th><th>Risk</th><th>L</th><th>I</th><th>Rating</th><th>Owner</th><th>Review</th></tr></thead>
        <tbody>
          {RISKS.map(([id, name, l, im], r) => (
            <tr key={id} className="dp-in" style={{ animationDelay: `${r * 60}ms` }}>
              <td>{id}</td><td>{name}</td><td>{l}</td><td>{im}</td><td><span className={`dp-pill ${rating(l, im)}`}>{rating(l, im)}</span></td>
              <td><span className="dp-bar" style={{ width: 36 + (r * 11) % 24 }} /></td><td>{['Q1', 'Q2', 'Q3', 'Q4'][r % 4]} {2025 + (r % 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="dp-grid">
        {Array.from({ length: 25 }, (_, n) => {
          const l = 5 - Math.floor(n / 5), im = (n % 5) + 1
          const here = RISKS.filter((x) => x[2] === l && x[3] === im).length
          return <span key={n} className={`dp-cell ${rating(l, im)}`}>{here > 0 && <i />}</span>
        })}
        <span className="dp-axis-x">{c.docpic_4_impact}</span>
        <span className="dp-axis-y">{c.docpic_4_likelihood}</span>
      </div>
    </div>
  )
  if (i === 5) body = (
    <div className="dp-contracts">
      <table>
        <thead><tr><th>Vendor</th><th>Term</th><th>Renewal</th><th>Notice</th><th>Annual</th><th>Auto</th></tr></thead>
        <tbody>
          {estate.platforms.filter((p) => p.type !== 'integration').slice(0, 8).map((p, r) => {
            const soon = r % 3 === 0
            return (
              <tr key={p.id} className={`dp-in${soon ? ' dp-soon' : ''}`} style={{ animationDelay: `${r * 50}ms` }}>
                <td>{p.name}</td><td>{[1, 3, 5][r % 3]} yr</td><td>{soon ? c.docpic_5_soon : `${2026 + (r % 2)}-${String(3 + (r * 4) % 9).padStart(2, '0')}`}</td>
                <td>{[30, 60, 90, 180][r % 4]} d</td><td>{CURRENCIES[r % 4]} {k(120 + ((r * 37) % 900))}</td><td>{r % 2 ? 'Y' : 'N'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
  if (i === 6) body = (
    <div className="dp-budget">
      <table>
        <thead><tr><th>Cost centre</th><th>Line</th><th>Budget</th><th>Actual</th><th>Variance</th></tr></thead>
        <tbody>
          {BUDGET.map(([cc, name, b, a], r) => (
            <tr key={cc} className="dp-in" style={{ animationDelay: `${r * 60}ms` }}>
              <td>{cc}</td><td>{name}</td><td>{k(b)}</td><td>{k(a)}</td><td className={a > b ? 'dp-over' : ''}>{a > b ? '+' : ''}{k(a - b)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="dp-missing dp-in" style={{ animationDelay: '500ms' }}>{c.docpic_6_missing}</div>
    </div>
  )
  return <div className={`dp dp-${i}`}>{head}{body}{foot}</div>
}
