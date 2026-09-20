// The control surface.
//
// Until now every action in this tool was a useState inside the view that drew
// it. Nothing outside a view could select a node, move a slider or fail a
// platform, which is why there was no way to script a guided tour: the tour
// would have had to reach into six components and press their buttons.
//
// This store holds only the state a tour, a URL, or another view needs to read
// or set. Everything that matters to one view and nobody else stays a useState
// in that view: panel collapse, label mode, search text, the budget line on the
// exceedance curve, the run count, which side of view 5 is showing, the
// boundary moves. Putting those here would make the store the view's state
// rather than the tool's.
//
// One consequence worth naming: selectedId is now shared, so walking from view 1
// to view 2 keeps the node you were looking at. Views that can only show a
// platform fall back to their own default when the shared selection is a use
// case or nothing.

import { create } from 'zustand'
import type { AllocationRule } from '../model/types'

/** 'landing' is the front page at #/. The six views are the six views. */
export type View = 'landing' | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Chapters. 0 is the title card. 1 to 6 build the picture: domains, use cases,
 * platforms, lines, connectors, the busiest node. 7 to 15 build the ledger on
 * that node: why a ledger, what it meters, what it hands out by rule, what
 * happens when it stops, how much things fail together, how the footprint
 * grew, what diversifying does, where the lines are drawn, and a close.
 */
export const TOUR_STEPS = 31
/** The first beat of the third part, where the numbers start. Kept for the router. */
export const FIRST_LEDGER_CHAPTER = 18

/** What the canvas shows during the story. Every field is a layer or a mode. */
export interface Scene {
  /** The canvas faded to nothing. */
  blank: boolean
  /** Which layers of the picture are up. Absent layers are hidden, not dimmed. */
  hulls: boolean
  useCases: boolean
  platforms: boolean
  links: boolean
  connectors: boolean
  /** Reveal one by one rather than all at once. */
  stagger: boolean
  /** Marker on the canvas, if any. */
  callout: { kind: 'hull' | 'node'; id: string; text: string } | null
}

export const SCENE_ALL: Scene = { blank: false, hulls: true, useCases: true, platforms: true, links: true, connectors: true, stagger: false, callout: null }
export const SCENE_NONE: Scene = { blank: false, hulls: false, useCases: false, platforms: false, links: false, connectors: false, stagger: true, callout: null }

/**
 * A request to fail a platform, raised from anywhere. The nonce is what makes
 * pressing Fail it twice on the same node two separate events: view 3 samples a
 * fresh pattern per request, so the payload alone would not change.
 */
export interface FailRequest { nodeId: string; nonce: number }

export interface LedgerState {
  /** Which screen. Mirrored into the URL hash, both ways. */
  view: View
  /** The node under inspection, shared across views. */
  selectedId: string | null
  /** Allocation basis. Canon 9.2.8 default, and the spec's: equal split. */
  rule: AllocationRule
  /** Subdomain hulls in the 3D scene. */
  showHulls: boolean
  /**
   * Ask the camera to travel to a node. Held as 'id#nonce' because it is an
   * event, not a value: asking to fly to the node already under the camera has
   * to move the camera, and a bare id would not re-fire. Pass a bare id to
   * setFlyToId; the nonce is added here.
   */
  flyToId: string | null
  /** Fail a platform in view 3 from outside view 3. */
  failRequest: FailRequest | null
  /** Dependence between platform failures. Shared by views 3 and 5. */
  rho: number
  /** Which subdomain the non-additivity readout is about. */
  subdomain: string | null
  /** Month cursor on the view 4 timeline. */
  cursor: number
  /** Month the platform was ratified as strategic, view 4. */
  ratified: number
  /** Hypothetical extra riders on the view 2 fan-in slider. */
  fanInAdded: number
  /** Which story beat is showing, or null when the story is not running. */
  tourStep: number | null
  /** The canvas during the story. Ignored outside it. */
  scene: Scene
  /** Domains the reader has tapped in part one, in order. */
  namedDomains: string[]
  /** What the reader tapped last: a domain, a node or a line. */
  focus: { kind: 'hull'; id: string } | { kind: 'node'; id: string } | { kind: 'link'; ucId: string; platformId: string } | null
  /** Use cases moved to another domain on the boundaries screen. */
  moves: Record<string, string>

  setView: (v: View) => void
  setSelectedId: (id: string | null) => void
  setRule: (r: AllocationRule) => void
  setShowHulls: (b: boolean) => void
  setFlyToId: (id: string | null) => void
  /** Raise a fail request with a fresh nonce. */
  failIt: (nodeId: string) => void
  clearFailRequest: () => void
  setRho: (r: number) => void
  /** Back to the midpoint the two shapes were first compared at. */
  resetRho: () => void
  setSubdomain: (id: string | null) => void
  setCursor: (m: number) => void
  setRatified: (m: number) => void
  setFanInAdded: (n: number) => void
  setTourStep: (n: number | null) => void
  setScene: (patch: Partial<Scene>) => void
  nameDomain: (id: string) => void
  setFocus: (f: LedgerState['focus']) => void
  setMoves: (m: Record<string, string>) => void
  resetStory: () => void
}

export const DEFAULT_RHO = 0.5

export const useLedger = create<LedgerState>((set) => ({
  view: 'landing',
  selectedId: null,
  rule: 'equal',
  showHulls: true,
  flyToId: null,
  failRequest: null,
  rho: DEFAULT_RHO,
  subdomain: null,
  cursor: 60,
  ratified: 31,
  fanInAdded: 0,
  tourStep: null,
  scene: SCENE_ALL,
  namedDomains: [],
  focus: null,
  moves: {},

  setView: (view) => set({ view }),
  setSelectedId: (selectedId) => set({ selectedId }),
  setRule: (rule) => set({ rule }),
  setShowHulls: (showHulls) => set({ showHulls }),
  setFlyToId: (id) => set((s) => ({
    flyToId: id === null ? null : `${id}#${Number(s.flyToId?.split('#')[1] ?? 0) + 1}`,
  })),
  failIt: (nodeId) => set((s) => ({ failRequest: { nodeId, nonce: (s.failRequest?.nonce ?? 0) + 1 } })),
  clearFailRequest: () => set({ failRequest: null }),
  setRho: (rho) => set({ rho }),
  resetRho: () => set({ rho: DEFAULT_RHO }),
  setSubdomain: (subdomain) => set({ subdomain }),
  setCursor: (cursor) => set({ cursor }),
  setRatified: (ratified) => set({ ratified }),
  setFanInAdded: (fanInAdded) => set({ fanInAdded }),
  setTourStep: (tourStep) => set({ tourStep }),
  setScene: (patch) => set((s) => ({ scene: { ...s.scene, ...patch } })),
  nameDomain: (id) => set((s) => ({ namedDomains: s.namedDomains.includes(id) ? s.namedDomains : [...s.namedDomains, id] })),
  setFocus: (focus) => set({ focus }),
  setMoves: (moves) => set({ moves }),
  resetStory: () => set({ scene: SCENE_ALL, namedDomains: [], focus: null, moves: {}, fanInAdded: 0, rho: DEFAULT_RHO, cursor: 60, ratified: 31, rule: 'equal', failRequest: null, subdomain: null }),
}))
