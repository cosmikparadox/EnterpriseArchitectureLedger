// One place that decides what "narrow" means, so the CSS breakpoint and the
// components that have to behave differently below it cannot drift apart.

import { useEffect, useState } from 'react'

/** Matches the 720px breakpoint in styles.css. Change both together. */
export const NARROW_QUERY = '(max-width: 720px)'

export function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(
    () => typeof matchMedia === 'function' && matchMedia(NARROW_QUERY).matches,
  )
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mq = matchMedia(NARROW_QUERY)
    const on = () => setNarrow(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return narrow
}

/** True when the viewer has asked for less motion. Honoured by the tour. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}
