// A settled-layout report, for checking that the layout is reproducible.
//
// A4 seeds the force simulation so the graph settles into the same shape on
// every load. That claim needs something to check it against, and a screenshot
// will not do: the camera framing animates and the renderer antialiases, so two
// identical layouts produce two different images.
//
// So the settled positions are hashed and written to a data attribute on the
// document root. It is the same thing the graph already drew, in a form a test
// or a person can read, and it is derived state rather than a hook left open
// for scripts to reach into.

import { useCallback } from 'react'

/** FNV-1a over the settled positions, rounded to the nearest tenth of a unit. */
export function layoutDigest(nodes: { id: string; x: number; y: number; z: number }[]): string {
  const text = nodes
    .map((n) => `${n.id}:${Math.round(n.x * 10)},${Math.round(n.y * 10)},${Math.round(n.z * 10)}`)
    .sort()
    .join('|')
  let h = 2166136261
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0).toString(16).padStart(8, '0')
}

export function useLayoutReport(): (nodes: { id: string; x: number; y: number; z: number }[]) => void {
  return useCallback((nodes) => {
    document.documentElement.dataset.layout = layoutDigest(nodes)
  }, [])
}

/**
 * Where the selected node currently is on screen, in viewport pixels, published
 * the same way and for the same reason.
 *
 * The tour promises that the card never covers the node a step is talking about.
 * The canvas is inset by the card's footprint so that holds by construction, but
 * a promise nothing checks is a promise that quietly stops being true, and this
 * is what acceptance T2 measures against the card's own rectangle.
 */
export function reportSelectedScreenPos(pos: { x: number; y: number } | null): void {
  const root = document.documentElement
  if (!pos) { delete root.dataset.selectedScreen; return }
  root.dataset.selectedScreen = `${Math.round(pos.x)},${Math.round(pos.y)}`
}
