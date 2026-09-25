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
 * Beats. 0 is the welcome, 1 the company. 2 to 6 open the story: what the
 * ledger is, why it matters, how it works in three steps, and a pause to continue or leave.
 * Part one builds the picture,
 * part two shows how it is decided today, part three builds the ledger on
 * the busiest node and closes. The last beat is 40; script.ts holds them.
 */
export const TOUR_STEPS = 40
/** The first beat of the third part, where the numbers start. Kept for the router. */
export const FIRST_LEDGER_CHAPTER = 25

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
  /** The drag hint at the foot of the canvas, until the viewer has dragged once. */
  hint: boolean
  /** A live reading pinned to the selected node: its meter, or its fixed pool. */
  badge: 'meter' | 'pool' | null
  /** The ledger book in the corner, wired to the selected node. */
  book: boolean
  /** What the beat's control is about; everything else on the canvas ghosts. */
  focus: 'riders' | 'blast' | 'footprint' | 'lines' | 'move' | null
  /** The value flow picture: lines tinted by where their work's value lands. */
  flow: boolean
  /** Rings on a few nodes of one kind, and a tap hint, until the reader has tapped one. */
  pokes: 'useCases' | 'platforms' | null
}

export const SCENE_ALL: Scene = { blank: false, hulls: true, useCases: true, platforms: true, links: true, connectors: true, stagger: false, callout: null, hint: false, badge: null, book: false, focus: null, flow: false, pokes: null }
export const SCENE_NONE: Scene = { blank: false, hulls: false, useCases: false, platforms: false, links: false, connectors: false, stagger: true, callout: null, hint: false, badge: null, book: false, focus: null, flow: false, pokes: null }

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
  /** The two shapes beat: which entry is being compared, cost, risk or leaving. */
  shapesPhase: 0 | 1 | 2
  /** The third how beat: which entry is playing on the flat map. Next steps it on. */
  flatPhase: 0 | 1 | 2
  /** What the reader has already tapped once, kept across visits, so a hint is shown only until it is needed no more. */
  poked: { useCases: boolean; platforms: boolean }
  /** Dark or light, chosen by the viewer; 'auto' follows the system. */
  theme: 'auto' | 'light' | 'dark'

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
  /** False from the moment a beat is asked for until its scene has been set, so the canvas is not drawn whole for one frame first. */
  sceneReady: boolean
  setScene: (patch: Partial<Scene>) => void
  nameDomain: (id: string) => void
  setFocus: (f: LedgerState['focus']) => void
  setMoves: (m: Record<string, string>) => void
  setShapesPhase: (p: 0 | 1 | 2) => void
  setFlatPhase: (p: 0 | 1 | 2) => void
  setPoked: (kind: 'useCases' | 'platforms') => void
  setTheme: (t: 'auto' | 'light' | 'dark') => void
  resetStory: () => void
  /** Going back a beat: what later beats set is cleared, so the earlier beat shows what it showed the first time. */
  resetBeat: () => void
}

const THEME_KEY = 'ledger.theme'
function readPoked(): { useCases: boolean; platforms: boolean } {
  try {
    const v = JSON.parse(localStorage.getItem('ledger.poked') ?? '{}') as Partial<{ useCases: boolean; platforms: boolean }>
    return { useCases: v.useCases === true, platforms: v.platforms === true }
  } catch { return { useCases: false, platforms: false } }
}
function readTheme(): 'auto' | 'light' | 'dark' {
  try { const t = localStorage.getItem(THEME_KEY); return t === 'light' || t === 'dark' ? t : 'auto' } catch { return 'auto' }
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
  sceneReady: true,
  namedDomains: [],
  focus: null,
  moves: {},
  shapesPhase: 0,
  flatPhase: 0,
  poked: readPoked(),
  theme: readTheme(),

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
  setTourStep: (tourStep) => set((s) => ({ tourStep, sceneReady: tourStep === null ? true : s.tourStep !== null })),
  setScene: (patch) => set((s) => ({ scene: { ...s.scene, ...patch }, sceneReady: true })),
  nameDomain: (id) => set((s) => ({ namedDomains: s.namedDomains.includes(id) ? s.namedDomains : [...s.namedDomains, id] })),
  setFocus: (focus) => set({ focus }),
  setMoves: (moves) => set({ moves }),
  setShapesPhase: (shapesPhase) => set({ shapesPhase }),
  setFlatPhase: (flatPhase) => set({ flatPhase }),
  setPoked: (kind) => set((st) => {
    if (st.poked[kind]) return {}
    const poked = { ...st.poked, [kind]: true }
    try { localStorage.setItem('ledger.poked', JSON.stringify(poked)) } catch { /* storage blocked: the hint simply returns next visit */ }
    return { poked }
  }),
  setTheme: (theme) => { try { localStorage.setItem(THEME_KEY, theme) } catch { /* a browser that will not remember it just asks again */ } set({ theme }) },
  resetStory: () => set({ scene: SCENE_ALL, namedDomains: [], focus: null, moves: {}, fanInAdded: 0, rho: DEFAULT_RHO, cursor: 60, ratified: 31, rule: 'equal', failRequest: null, subdomain: null, shapesPhase: 0, flyToId: null }),
  // The domains the reader named in part one are theirs and stay.
  resetBeat: () => set({ selectedId: null, focus: null, moves: {}, fanInAdded: 0, rho: DEFAULT_RHO, cursor: 60, ratified: 31, rule: 'equal', failRequest: null, subdomain: null, shapesPhase: 0 }),
}))
