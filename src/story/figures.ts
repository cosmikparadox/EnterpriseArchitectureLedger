// Live figures for the story card. Every number a beat quotes comes from
// here, read from the running tool, never typed into the copy deck.

import { useMemo } from 'react'
import { useLedger } from '../app/store'
import { fixedPointRange, storedFrame, useMonteCarlo } from '../app/useMonteCarlo'
import { leavingFor } from '../app/graph'
import { buildIndex, meteredSpend, reportedCost, ruleShare, withSyntheticRidersIndex } from '../tour/figuresModel'
import { gbpAbout, workOfLeaving, type Index } from '../model/ledger'
import { describeEstate } from '../model/describe'
import { shapeEntry, SHAPES_SEED } from '../model/shapes'
import type { AllocationRule, Estate, UseCase } from '../model/types'
import type { McResult } from '../model/montecarlo'
import { DATA_PLATFORM_ID, IDENTITY_ID, MOVER_ID, OPENER_UC, TOUR_SUBDOMAIN, TOUR_UC } from './script'

/** The month handle sits before the platform was adopted: nothing to leave yet. */
const PLACEHOLDER_NOT_YET = 'nothing yet, it had not been adopted'
export const gbp = (n: number) => Math.round(n).toLocaleString('en-GB')
const BASIS: Record<AllocationRule, string> = { equal: 'equal split', driver: 'driver-proportional', by_volume: 'by volume', by_head: 'by headcount' }

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
  const leaving = leavingFor(ix, u.id, DATA_PLATFORM_ID)
  return { name: u.name, platforms: u.edges.length, reported, byRule, metered: reported - byRule, p99, leaving }
}

export function useStoryFigures(concentrated: Estate, bestOfBreed: Estate): Record<string, string | number> {
  const rule = useLedger((s) => s.rule)
  const rho = useLedger((s) => s.rho)
  const ratified = useLedger((s) => s.ratified)
  const cursor = useLedger((s) => s.cursor)
  const subdomain = useLedger((s) => s.subdomain) ?? TOUR_SUBDOMAIN
  const fanInAdded = useLedger((s) => s.fanInAdded)
  const moves = useLedger((s) => s.moves)
  const ix = useMemo(() => buildIndex(concentrated), [concentrated])
  const mcLeft = useMonteCarlo(concentrated, rho, 10_000)
  const mcRight = useMonteCarlo(bestOfBreed, rho, 10_000)
  // The live run if it has landed, the stored frame at the nearest fixed
  // point if not. Never a placeholder.
  const left = mcLeft.result ?? storedFrame(concentrated, rho)
  const right = mcRight.result ?? storedFrame(bestOfBreed, rho)
  const subName = concentrated.subdomains.find((s) => s.id === subdomain)?.name ?? subdomain
  const sub = left?.subdomains.find((s) => s.id === subdomain) ?? null
  const subRight = right?.subdomains.find((s) => s.id === subdomain) ?? null
  const range = useMemo(() => fixedPointRange(concentrated, subdomain), [concentrated, subdomain])

  // Entry one is read on the identity service, for the tour use case.
  const top = ix.platformById.get(IDENTITY_ID)!
  const spend = meteredSpend(ix, IDENTITY_ID)
  const riders = ix.ridersOf.get(IDENTITY_ID) ?? []
  const before = reportedCost(ix, IDENTITY_ID, TOUR_UC, rule)
  const ruleFirst = ruleShare(ix, IDENTITY_ID, TOUR_UC, rule)
  const withAdded = useMemo(() => withSyntheticRidersIndex(concentrated, IDENTITY_ID, fanInAdded), [concentrated, fanInAdded])
  const after = reportedCost(withAdded, IDENTITY_ID, TOUR_UC, rule)
  // The cost of the next use case on this node: what one more rider adds
  // to the metered spend. The pool does not move.
  const withNext = useMemo(() => withSyntheticRidersIndex(concentrated, IDENTITY_ID, fanInAdded + 1), [concentrated, fanInAdded])
  const nextUc = meteredSpend(withNext, IDENTITY_ID) - meteredSpend(withAdded, IDENTITY_ID)
  const uc = tourUseCaseFigures(ix, rule, left)

  const dataPlatform = ix.platformById.get(DATA_PLATFORM_ID) ?? null
  const attached = dataPlatform ? (ix.ridersOf.get(DATA_PLATFORM_ID) ?? []).filter((r) => r.uc.adopted_month <= ratified).length : 0
  const months = dataPlatform ? Math.max(0, ratified - dataPlatform.adopted_month) : 0
  const exec = dataPlatform ? workOfLeaving(dataPlatform, attached, months) : 0
  // The same, at the month under the handle, so the card answers the handle.
  const attachedNow = dataPlatform ? (ix.ridersOf.get(DATA_PLATFORM_ID) ?? []).filter((r) => r.uc.adopted_month <= cursor).length : 0
  const execNow = dataPlatform && cursor >= dataPlatform.adopted_month ? workOfLeaving(dataPlatform, attachedNow, Math.max(0, cursor - dataPlatform.adopted_month)) : 0

  // Boundaries: how many reported figures move under each basis once the
  // moves in the store are applied.
  const drift = useMemo(() => {
    const movedEstate: Estate = { ...concentrated, use_cases: concentrated.use_cases.map((u): UseCase => (moves[u.id] ? { ...u, subdomain: moves[u.id]! } : u)) }
    const ixAfter = buildIndex(movedEstate)
    const count = (r: AllocationRule) => {
      let changed = 0, max = 0
      for (const p of concentrated.platforms) for (const rider of ix.ridersOf.get(p.id) ?? []) {
        const d = Math.abs(ruleShare(ix, p.id, rider.uc.id, r) - ruleShare(ixAfter, p.id, rider.uc.id, r))
        if (d > 1e-6) { changed++; max = Math.max(max, d) }
      }
      return { changed, max }
    }
    return { equal: count('equal'), current: count(rule) }
  }, [concentrated, ix, moves, rule])

  // The two shapes, both sides, at the dependence under the slider.
  const ixRight = useMemo(() => buildIndex(bestOfBreed), [bestOfBreed])
  const shapes = useMemo(() => ({
    l: shapeEntry(concentrated, ix, rho, SHAPES_SEED.left),
    r: shapeEntry(bestOfBreed, ixRight, rho, SHAPES_SEED.right),
  }), [concentrated, ix, bestOfBreed, ixRight, rho])
  const pct = (x: number) => (x * 100).toFixed(0)

  const mover = ix.useCaseById.get(MOVER_ID)
  const est = describeEstate(ix)
  return {
    ...est,
    name: top.name,
    node: top.name,
    riders: riders.length,
    spend: gbp(spend),
    pool: gbp(top.fixed_pool_gbp_month),
    uc: uc.name,
    uc_n_pf: uc.platforms,
    uc_reported: gbp(uc.reported),
    uc_metered: gbp(uc.metered),
    uc_rule: gbp(uc.byRule),
    uc_p99: uc.p99 === null ? '' : gbpAbout(uc.p99),
    platform: uc.leaving?.name ?? '',
    exec_today: uc.leaving ? gbpAbout(uc.leaving.exec) : '',
    dc_riders: uc.leaving?.riders ?? 0,
    mc: gbp(nextUc),
    before: gbp(before),
    after: gbp(after),
    rule_first: gbp(ruleFirst),
    sub: subName,
    sum: sub ? gbpAbout(sub.sumOfP99s) : '',
    joint: sub ? gbpAbout(sub.jointP99) : '',
    sum_lo: range ? gbpAbout(range.sumLo) : '',
    sum_hi: range ? gbpAbout(range.sumHi) : '',
    ratified,
    attached,
    exec: gbpAbout(exec),
    cursor,
    attached_now: attachedNow,
    exit_now: dataPlatform && cursor >= dataPlatform.adopted_month ? `about USD ${gbpAbout(execNow)}` : PLACEHOLDER_NOT_YET,
    left: sub ? gbpAbout(sub.jointP99) : '',
    right: subRight ? gbpAbout(subRight.jointP99) : '',
    left_top: shapes.l.topName, right_top: shapes.r.topName,
    left_pool: gbp(shapes.l.pool), right_pool: gbp(shapes.r.pool),
    left_riders: shapes.l.riders, right_riders: shapes.r.riders,
    left_c1: pct(shapes.l.c1), right_c1: pct(shapes.r.c1),
    left_aff: shapes.l.affected, right_aff: shapes.r.affected,
    left_exit: shapes.l.exitName, right_exit: shapes.r.exitName,
    left_exec: gbpAbout(shapes.l.exec), right_exec: gbpAbout(shapes.r.exec),
    opener_uc: (ix.useCaseById.get(OPENER_UC)?.name ?? '').toLowerCase(),
    mover: mover?.name ?? '',
    mover_from: concentrated.subdomains.find((s) => s.id === mover?.subdomain)?.name ?? '',
    moved_equal: drift.equal.changed,
    basis: BASIS[rule],
    moved_basis: drift.current.changed,
    moved_max: gbp(drift.current.max),
  }
}
