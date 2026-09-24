// Live figures for the story card. Every number a beat quotes comes from
// here, read from the running tool, never typed into the copy deck.

import { useEffect, useMemo, useState } from 'react'
import { useLedger } from '../app/store'
import { useMonteCarlo } from '../app/useMonteCarlo'
import { buildIndex, meteredSpend, reportedCost, ruleShare, withSyntheticRidersIndex } from '../tour/figuresModel'
import { gbpAbout, workOfLeaving } from '../model/ledger'
import { describeEstate } from '../model/describe'
import { shapeEntry, SHAPES_SEED } from '../model/shapes'
import type { AllocationRule, Estate, UseCase } from '../model/types'
import { DATA_PLATFORM_ID, IDENTITY_ID, MOVER_ID, OPENER_UC, TOUR_SUBDOMAIN } from './script'

const PLACEHOLDER = '...'
/** The month handle sits before the platform was adopted: nothing to leave yet. */
const PLACEHOLDER_NOT_YET = 'nothing yet, it had not been adopted'
export const gbp = (n: number) => Math.round(n).toLocaleString('en-GB')
const BASIS: Record<AllocationRule, string> = { equal: 'equal split', driver: 'driver-proportional', by_volume: 'by volume', by_head: 'by headcount' }

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
  const subName = concentrated.subdomains.find((s) => s.id === subdomain)?.name ?? subdomain
  const sub = mcLeft.result?.subdomains.find((s) => s.id === subdomain) ?? null
  const subRight = mcRight.result?.subdomains.find((s) => s.id === subdomain) ?? null

  const [band, setBand] = useState<{ lo: number; hi: number } | null>(null)
  useEffect(() => { setBand(null) }, [subdomain])
  const jointHere = sub?.jointP99 ?? null
  useEffect(() => {
    if (jointHere === null) return
    setBand((b) => (b ? { lo: Math.min(b.lo, jointHere), hi: Math.max(b.hi, jointHere) } : { lo: jointHere, hi: jointHere }))
  }, [jointHere])

  const top = ix.platformById.get(IDENTITY_ID)!
  const spend = meteredSpend(ix, IDENTITY_ID)
  const riders = ix.ridersOf.get(IDENTITY_ID) ?? []
  const first = riders[0]?.uc ?? null
  const before = first ? reportedCost(ix, IDENTITY_ID, first.id, rule) : 0
  const ruleFirst = first ? ruleShare(ix, IDENTITY_ID, first.id, rule) : 0
  const withAdded = useMemo(() => withSyntheticRidersIndex(concentrated, IDENTITY_ID, fanInAdded), [concentrated, fanInAdded])
  const after = first ? reportedCost(withAdded, IDENTITY_ID, first.id, rule) : 0

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
    riders: riders.length,
    spend: gbp(spend),
    pool: gbp(top.fixed_pool_gbp_month),
    first: first?.name ?? '',
    before: gbp(before),
    after: gbp(after),
    rule_first: gbp(ruleFirst),
    sub: subName,
    sum: sub ? gbpAbout(sub.sumOfP99s) : PLACEHOLDER,
    joint: sub ? gbpAbout(sub.jointP99) : PLACEHOLDER,
    lo: band ? gbpAbout(band.lo) : PLACEHOLDER,
    hi: band ? gbpAbout(band.hi) : PLACEHOLDER,
    ratified,
    attached,
    exec: gbpAbout(exec),
    cursor,
    attached_now: attachedNow,
    exit_now: dataPlatform && cursor >= dataPlatform.adopted_month ? `about GBP ${gbpAbout(execNow)}` : PLACEHOLDER_NOT_YET,
    left: sub ? gbpAbout(sub.jointP99) : PLACEHOLDER,
    right: subRight ? gbpAbout(subRight.jointP99) : PLACEHOLDER,
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
