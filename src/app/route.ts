// URL hash routing. No history library: the whole grammar is eight shapes and a
// hash change event, and a router would be more code than the thing it routes.
//
// Hash routing rather than path routing because the build is one file that has
// to work from a static host, from a subdirectory, and from disk. A path route
// needs a server that rewrites unknown paths to index.html; a hash route needs
// nothing and survives being opened as file://.
//
//   #/             the landing page
//   #/explore      view 1        #/footprint    view 4
//   #/pool         view 2        #/shapes       view 5
//   #/risk         view 3        #/boundaries   view 6
//   #/plug         view 7        #/paper        view 8
//   #/tour/1 ... #/tour/7        the guided tour
//
// The binding is two way. Changing the hash sets the store; changing the store
// rewrites the hash. Both directions are guarded against echo: neither writes
// when the value it would write is the one already there.

import { useEffect, useRef } from 'react'
import { TOUR_STEPS, useLedger, type View } from './store'

export const VIEW_SLUGS: Record<Exclude<View, 'landing'>, string> = {
  1: 'explore',
  2: 'pool',
  3: 'risk',
  4: 'footprint',
  5: 'shapes',
  6: 'boundaries',
  7: 'plug',
  8: 'paper',
}

const SLUG_TO_VIEW = new Map<string, Exclude<View, 'landing'>>(
  Object.entries(VIEW_SLUGS).map(([n, slug]) => [slug, Number(n) as Exclude<View, 'landing'>]),
)

export interface Route { view: View; tourStep: number | null }

/** Parse a hash. Anything unrecognised lands on the front page. */
export function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '').replace(/\/$/, '')
  // Launching the app is the welcome: beat 0 of the story.
  if (path === '') return { view: 'landing', tourStep: 0 }
  const tour = /^tour\/(\d+)$/.exec(path)
  if (tour) {
    const n = Number(tour[1])
    // Step 0 is the intro: the estate assembling behind the title card.
    if (n >= 0 && n <= TOUR_STEPS) return { view: 'landing', tourStep: n }
    return { view: 'landing', tourStep: null }
  }
  const view = SLUG_TO_VIEW.get(path)
  if (view) return { view, tourStep: null }
  return { view: 'landing', tourStep: null }
}

/** The hash a state should be at. The tour wins, because it owns the view. */
export function hashFor(view: View, tourStep: number | null): string {
  if (tourStep !== null) return tourStep === 0 ? '#/' : `#/tour/${tourStep}`
  if (view === 'landing') return '#/'
  return `#/${VIEW_SLUGS[view]}`
}

export function hrefFor(view: View, tourStep: number | null = null): string {
  return hashFor(view, tourStep)
}

/**
 * Bind the hash to the store, both ways. Mounted once, in App.
 *
 * A tour route does not say which view to show; the step's enter() does that,
 * because the step is the thing that knows. So reading #/tour/3 sets tourStep
 * and leaves view alone for the step to set.
 */
export function useHashRoute(): void {
  const view = useLedger((s) => s.view)
  const tourStep = useLedger((s) => s.tourStep)

  useEffect(() => {
    const apply = () => {
      const r = parseHash(location.hash)
      const s = useLedger.getState()
      if (r.tourStep !== null) {
        if (s.tourStep !== r.tourStep) s.setTourStep(r.tourStep)
      } else {
        if (s.tourStep !== null) s.setTourStep(null)
        if (s.view !== r.view) s.setView(r.view)
      }
      // A hash nobody recognises lands on the front page, and the address bar
      // should say so rather than keep showing a route that does not exist.
      const canonical = hashFor(r.view, r.tourStep)
      if (location.hash !== canonical) history.replaceState(null, '', canonical)
    }
    apply()
    addEventListener('hashchange', apply)
    return () => removeEventListener('hashchange', apply)
  }, [])

  const first = useRef(true)
  useEffect(() => {
    // The first pass is skipped deliberately. On mount this effect's view and
    // tourStep are the store's defaults, captured before the effect above has
    // had a chance to read the address bar, so acting on them would overwrite
    // the hash the page was opened on with #/ and throw away the deep link.
    // apply() has already normalised the hash by the time this runs.
    if (first.current) { first.current = false; return }
    const want = hashFor(view, tourStep)
    // Compare through the parser so #/explore and #explore are not a loop.
    const here = parseHash(location.hash)
    if (hashFor(here.view, here.tourStep) === want) return
    // Assigning the hash pushes an entry, so the browser back button walks the
    // views and the tour steps. The hashchange this raises is absorbed by the
    // guards in the listener above.
    location.hash = want
  }, [view, tourStep])
}
