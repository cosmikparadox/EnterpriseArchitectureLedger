// The tour use case's own figures, kept apart from the hook so the prologue,
// the book, the card and the tests all read them the same way.

import { leavingFor } from '../app/graph'
import { reportedCost, ruleShare, type Index } from '../model/ledger'
import type { McResult } from '../model/montecarlo'
import type { AllocationRule } from '../model/types'
import { LEAVING_PLATFORM_ID, TOUR_UC } from './script'

/**
 * The tour use case's own figures, read from one index and one Monte Carlo
 * result. The prologue's map, the book and the card all quote these, so the
 * same use case shows the same figures wherever it appears.
 */
export function tourUseCaseFigures(ix: Index, rule: AllocationRule, mc: McResult | null) {
  const u = ix.useCaseById.get(TOUR_UC)!
  let reported = 0, byRule = 0
  for (const e of u.edges) { reported += reportedCost(ix, e.platform_id, u.id, rule); byRule += ruleShare(ix, e.platform_id, u.id, rule) }
  const p99 = mc?.useCases.find((x) => x.id === u.id)?.p99 ?? null
  const leaving = leavingFor(ix, u.id, LEAVING_PLATFORM_ID)
  return { name: u.name, platforms: u.edges.length, reported, byRule, metered: reported - byRule, p99, leaving }
}

