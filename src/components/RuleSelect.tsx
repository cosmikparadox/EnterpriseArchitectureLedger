// The allocation basis picker, shared by the views that offer one.
//
// Canon 9.2.8 (R23) permits exactly two bases and prohibits a third shape. The
// label under the picker says which is which, ON SCREEN, not only in the README.

import type { AllocationRule } from '../model/types'
import { copy } from '../copy'

const LABEL: Record<AllocationRule, string> = {
  equal: 'Equal split',
  driver: 'Driver-proportional',
  by_volume: 'By volume',
  by_head: 'By headcount',
}

const STATUS: Record<AllocationRule, string> = {
  equal: copy.basis_permitted,
  driver: copy.basis_permitted,
  by_volume: copy.basis_outside_list,
  by_head: copy.basis_prohibited,
}

export function RuleSelect({ rule, setRule }: { rule: AllocationRule; setRule: (r: AllocationRule) => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <select
        className="ctl"
        value={rule}
        onChange={(e) => setRule(e.target.value as AllocationRule)}
        aria-label="Allocation basis for the fixed pool"
      >
        {(Object.keys(LABEL) as AllocationRule[]).map((r) => (
          <option key={r} value={r}>{LABEL[r]}</option>
        ))}
      </select>
      <span
        style={{ fontSize: 10.5, opacity: 0.85, maxWidth: 260 }}
        className={rule === 'by_head' ? 'prohibited' : undefined}
      >
        {STATUS[rule]}
      </span>
    </span>
  )
}
