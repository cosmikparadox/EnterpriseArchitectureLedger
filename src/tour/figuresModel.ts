// Re-exports, plus the one thing the tour needs that no view exposes.
//
// Kept apart from figures.ts so that file reads as what it is, a list of the
// numbers the sentences quote, rather than a pile of imports.

export { buildIndex, executionComponent, meteredSpend, reportedCost, ruleShare } from '../model/ledger'

import { buildIndex, type Index } from '../model/ledger'
import { withSyntheticRiders } from '../app/graph'
import type { Estate } from '../model/types'

/**
 * The index view 2 is actually looking at: the estate with the fan-in slider's
 * hypothetical riders attached. The tour's step 2 sentence has to quote the
 * same number the panel behind it shows, so it has to build the same estate.
 */
export function withSyntheticRidersIndex(estate: Estate, platformId: string, added: number): Index {
  return buildIndex(withSyntheticRiders(estate, platformId, added))
}
