// The live figures the tour's cost sentences quote.
//
// Brief B4: every "what it costs" sentence carries a GBP figure computed from
// the running tool, never one typed into the copy deck. So this hook reads the
// same store and the same model the views read, and hands back a set of values
// for fill() to drop into the sentence.
//
// Nothing here is rounded for effect. gbp() is the same formatter the panels
// use, so a figure in a tour sentence and the same figure in a panel read the
// same way.

import { useEffect, useMemo, useState } from 'react'
import { useLedger } from '../app/store'
import { useMonteCarlo } from '../app/useMonteCarlo'
import {
  buildIndex, executionComponent, meteredSpend, reportedCost,
  withSyntheticRidersIndex,
} from './figuresModel'
import { DATA_PLATFORM_ID, IDENTITY_ID, TOUR_SUBDOMAIN } from './steps'
import type { Estate } from '../model/types'

export interface TourFigures extends Record<string, string> {
  spend: string
  riders: string
  before: string
  after: string
  sub: string
  sum: string
  joint: string
  lo: string
  hi: string
  exec: string
  left: string
  right: string
  doi: string
}

const PLACEHOLDER = '...'

export function gbp(n: number): string {
  return Math.round(n).toLocaleString('en-GB')
}

export function useTourFigures(
  concentrated: Estate,
  bestOfBreed: Estate,
  doi: string,
): TourFigures {
  const rule = useLedger((s) => s.rule)
  const rho = useLedger((s) => s.rho)
  const ratified = useLedger((s) => s.ratified)
  const subdomain = useLedger((s) => s.subdomain) ?? TOUR_SUBDOMAIN
  const fanInAdded = useLedger((s) => s.fanInAdded)

  const ix = useMemo(() => buildIndex(concentrated), [concentrated])
  const mcLeft = useMonteCarlo(concentrated, rho, 10_000)
  const mcRight = useMonteCarlo(bestOfBreed, rho, 10_000, 4, 20260906)

  const subName = concentrated.subdomains.find((s) => s.id === subdomain)?.name ?? subdomain
  const sub = mcLeft.result?.subdomains.find((s) => s.id === subdomain) ?? null
  const subRight = mcRight.result?.subdomains.find((s) => s.id === subdomain) ?? null

  // Step 4 quotes the range the figure covered while the slider swept. That is
  // an observation of this session, not a stored pair, so it is collected as the
  // results arrive and reset when the subdomain under discussion changes.
  const [band, setBand] = useState<{ lo: number; hi: number } | null>(null)
  useEffect(() => { setBand(null) }, [subdomain])
  const jointHere = sub?.jointP99 ?? null
  useEffect(() => {
    if (jointHere === null) return
    setBand((b) => (b ? { lo: Math.min(b.lo, jointHere), hi: Math.max(b.hi, jointHere) } : { lo: jointHere, hi: jointHere }))
  }, [jointHere])

  // Step 1. What the riders of the identity node are billed through it.
  const spend = meteredSpend(ix, IDENTITY_ID)
  const riders = ix.ridersOf.get(IDENTITY_ID)?.length ?? 0

  // Step 2. One rider's monthly figure with no extra fan-in, and with whatever
  // the slider is currently at.
  const firstRider = ix.ridersOf.get(IDENTITY_ID)?.[0]?.uc.id ?? null
  const before = firstRider ? reportedCost(ix, IDENTITY_ID, firstRider, rule) : 0
  const withAdded = useMemo(
    () => withSyntheticRidersIndex(concentrated, IDENTITY_ID, fanInAdded),
    [concentrated, fanInAdded],
  )
  const after = firstRider ? reportedCost(withAdded, IDENTITY_ID, firstRider, rule) : 0

  // Step 5. Execution work of leaving, at the month the board ratified it. The
  // sentence says "at that month" and means the marker, not wherever the cursor
  // has been dragged to, so the figure is pinned to the marker.
  const dataPlatform = ix.platformById.get(DATA_PLATFORM_ID) ?? null
  const attached = dataPlatform
    ? (ix.ridersOf.get(DATA_PLATFORM_ID) ?? []).filter((r) => r.uc.adopted_month <= ratified).length
    : 0
  const months = dataPlatform ? Math.max(0, ratified - dataPlatform.adopted_month) : 0
  const exec = dataPlatform ? executionComponent(dataPlatform, attached, months) : 0

  return {
    spend: gbp(spend),
    riders: String(riders),
    before: gbp(before),
    after: gbp(after),
    sub: subName,
    sum: sub ? gbp(sub.sumOfP99s) : PLACEHOLDER,
    joint: sub ? gbp(sub.jointP99) : PLACEHOLDER,
    lo: band ? gbp(band.lo) : PLACEHOLDER,
    hi: band ? gbp(band.hi) : PLACEHOLDER,
    exec: gbp(exec),
    left: sub ? gbp(sub.jointP99) : PLACEHOLDER,
    right: subRight ? gbp(subRight.jointP99) : PLACEHOLDER,
    doi,
  }
}
