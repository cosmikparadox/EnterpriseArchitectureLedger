// Live readings pinned to a node on the canvas during part three.
//
// The meter counts up from nothing to the month's driver units and the money
// they meter, so the reader watches the one part of the bill that is measured
// being measured. The pool arrives as one block, stamped, because nobody
// meters it. Both are pop-ups on the canvas, moved by Graph3D each frame; the
// numbers come from the index, never from the copy deck.

import { useEffect, useState } from 'react'
import { copy, fill } from '../copy'
import { meteredSpend, type Index } from '../model/ledger'
import { animateValue } from '../tour/animate'

const gbp = (n: number) => Math.round(n).toLocaleString('en-GB')

export function MeterBadge({ ix, id, reduced }: { ix: Index; id: string; reduced: boolean }) {
  const p = ix.platformById.get(id)
  const riders = ix.ridersOf.get(id) ?? []
  const units = riders.reduce((a, r) => a + r.uc.volume_per_month * r.edge.driver_units_per_volume_unit, 0)
  const spend = meteredSpend(ix, id)
  const [t, setT] = useState(reduced ? 1 : 0)
  useEffect(() => {
    setT(reduced ? 1 : 0)
    const a = animateValue(0, 1, 2200, setT, reduced)
    return () => a.cancel()
  }, [id, reduced])
  if (!p) return null
  const v = { name: p.name, driver: p.driver_name, units: gbp(units * t), spend: gbp(spend * t) }
  return (
    <div className="badge badge-meter" data-tour="badge">
      <div className="badge-head">{fill(copy.badge_meter_head, v)}</div>
      <div className="badge-big"><span className="badge-tick" /> {fill(copy.badge_meter_units, v)}</div>
      <div className="badge-line">{fill(copy.badge_meter_spend, v)}</div>
    </div>
  )
}

export function PoolBadge({ ix, id }: { ix: Index; id: string }) {
  const p = ix.platformById.get(id)
  const riders = ix.ridersOf.get(id) ?? []
  if (!p) return null
  const v = { name: p.name, pool: gbp(p.fixed_pool_gbp_month), riders: riders.length }
  return (
    <div className="badge badge-pool" data-tour="badge">
      <div className="badge-head">{fill(copy.badge_pool_head, v)}</div>
      <div className="badge-big badge-stamp">{fill(copy.badge_pool_line, v)}</div>
      <div className="badge-line">{fill(copy.badge_pool_sub, v)}</div>
    </div>
  )
}
