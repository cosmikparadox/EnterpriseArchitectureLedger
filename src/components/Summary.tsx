// The summary at the head of every panel.
//
// A headline that says what this screen is showing, with the live figure in it,
// then the same point read two ways. Nothing here is a heading for a section
// of figures; it is the sentence somebody would say across a table before
// pointing at any of them.
//
// The two readings are marked by lens, not by reader. "The number" and "The
// mechanism" name what each line looks at. Who reads which is their business.

import { fill, summary } from '../copy'

export interface SummaryProps {
  head: string
  number: string
  mechanism: string
  values: Record<string, string | number>
}

export function Summary({ head, number, mechanism, values }: SummaryProps) {
  return (
    <div className="summary" data-tour="summary">
      <p className="summary-head">{fill(head, values)}</p>
      <div className="summary-lens">
        <span className="summary-eyebrow">{summary.eyebrow_number}</span>
        <p>{fill(number, values)}</p>
      </div>
      <div className="summary-lens">
        <span className="summary-eyebrow">{summary.eyebrow_mechanism}</span>
        <p>{fill(mechanism, values)}</p>
      </div>
    </div>
  )
}
