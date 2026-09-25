// Work in progress, said plainly while the reader explores on their own.
// It folds to a small tab, and the tab stays: the caveat is never gone.

import { useState } from 'react'
import { copy } from '../copy'

const KEY = 'ledger.wip'

export function WipNote() {
  const [folded, setFolded] = useState(() => { try { return localStorage.getItem(KEY) === 'folded' } catch { return false } })
  const [more, setMore] = useState(false)
  const fold = (v: boolean) => { setFolded(v); try { localStorage.setItem(KEY, v ? 'folded' : 'open') } catch { /* storage blocked: it opens again next visit */ } }
  if (folded) return <button type="button" className="wip-tab" onClick={() => fold(false)}>{copy.wip_h}</button>
  return (
    <aside className="wip-note" aria-label={copy.wip_h}>
      <strong>{copy.wip_h}</strong>
      <p>{copy.wip}</p>
      {more && <p>{copy.wip_more}</p>}
      <div className="wip-actions">
        {!more && <button type="button" className="tour-more" onClick={() => setMore(true)}>{copy.wip_open}</button>}
        <button type="button" className="tour-skip" onClick={() => fold(true)}>{copy.wip_hide}</button>
      </div>
    </aside>
  )
}
