// The summary at the head of every panel.
//
// A headline that says what this screen is showing, with the live figure in it,
// then the same point read two ways. Nothing here is a heading for a section
// of figures; it is the sentence somebody would say across a table before
// pointing at any of them.
//
// Two readings, in the two colours the company page gave its two readers.
// The first is what the figure means on the books, in the CFO's gold; the
// second is how the wiring produces it, in the architects' blue. The labels
// name the lens, not the job title, so either reader can read both.

import { fill, summary } from '../copy'

export interface SummaryProps {
  head: string
  number: string
  mechanism: string
  values: Record<string, string | number>
  /** During the tour the two readings arrive once their words have been taught. */
  headOnly?: boolean
}

export function Summary({ head, number, mechanism, values, headOnly = false }: SummaryProps) {
  return (
    <div className="summary" data-tour="summary">
      <p className="summary-head">{fill(head, values)}</p>
      {!headOnly && (
        <>
          <div className="summary-lenses">
            <div className="summary-lens who-cfo">
              <span className="summary-eyebrow">{summary.eyebrow_number}</span>
              <p>{fill(number, values)}</p>
            </div>
            <div className="summary-lens who-arch">
              <span className="summary-eyebrow">{summary.eyebrow_mechanism}</span>
              <p>{fill(mechanism, values)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
