// The story, one beat per Next.
//
// A beat is: which part it belongs to, a heading, the copy keys for its
// line, its second sentence and its More detail, what it does to the tool when
// it opens (through the store only), what control it puts on the card, which
// rows it adds to the ledger on the card, and what it watches for so it can
// say "you did that". Everything the reader sees at a beat is on the canvas or
// on the one card; the screens' own panels are never shown during the story.

import { DEFAULT_RHO, SCENE_ALL, SCENE_NONE, TOUR_STEPS, type LedgerState, type Scene } from '../app/store'
import { animateValue, type Timeline } from '../tour/animate'

export const IDENTITY_ID = 'okta'
export const DATA_PLATFORM_ID = 'meridian'
export const TOUR_SUBDOMAIN = 'claims'
/** The use case part three moves across a boundary, and where from. */
export const MOVER_ID = 'uc_broker_quote'
export const MOVER_TO = 'service'
/** The use case the opening lights, to show what the ledger reads. */
export const OPENER_UC = 'uc_claim_settle'

export type Part = 0 | 1 | 2 | 3
export type Overlay = 'welcome' | 'intro' | 'title' | 'why' | 'map' | 'flat' | 'pain' | 'reflect' | 'part' | 'end' | 'docs' | 'matrix' | 'silos' | null
export type Control = 'fanin' | 'fail' | 'rho' | 'month' | 'basis' | 'move' | 'shapes' | null
export type Row = 'metered' | 'pool' | 'rule_first' | 'sum' | 'joint' | 'range' | 'exec' | 'left' | 'right' | 'moved'

export interface EnterContext { store: LedgerState; timeline: Timeline; reduced: boolean }

export interface Beat {
  part: Part
  /** Copy key stem: b_<stem>_h, b_<stem>, b_<stem>_see, b_<stem>_more. Empty for overlay-only beats. */
  stem: string
  /** Which screen. 'keep' leaves the current one. */
  view: 1 | 2 | 3 | 4 | 5 | 6 | 'keep'
  /** What sits over the canvas, if anything. */
  overlay: Overlay
  /** The canvas layers. */
  scene: Partial<Scene>
  /** Whether the card is shown. */
  card: boolean
  enter?: (c: EnterContext) => void
  settleMs?: number
  control?: Control
  rows?: Row[]
  waitFor?: (now: LedgerState, at: LedgerState) => boolean
  /** The last beat: the card offers Explore and Start again. */
  closing?: true
}

const PICTURE: Partial<Scene> = { ...SCENE_ALL, blank: false }
const round05 = (v: number) => Math.round(v * 20) / 20

export const BEATS: Beat[] = [
  // ---- part 0: the welcome ----
  { part: 0, stem: '', view: 1, overlay: 'welcome', scene: { ...SCENE_NONE, blank: true }, card: false },
  // What, why, and how in three steps, before part one.
  // The company and the two people the tour is for, then the ledger
  // introduced, with the card saying what it is.
  { part: 0, stem: '', view: 1, overlay: 'intro', scene: { ...SCENE_NONE, blank: true }, card: false },
  { part: 0, stem: 'title', view: 1, overlay: 'title', scene: { ...SCENE_NONE, blank: true }, card: true },
  { part: 0, stem: 'opener_why', view: 1, overlay: 'why', scene: { ...SCENE_NONE, blank: true }, card: true },
  { part: 0, stem: 'how_map', view: 1, overlay: 'map', scene: { ...SCENE_NONE, blank: true }, card: true },
  // The map, flat, with one use case lit: its path is the unit. The 3D
  // picture waits for part one.
  { part: 0, stem: 'how_work', view: 1, overlay: 'flat', scene: { ...SCENE_NONE, blank: true }, card: true },
  // The same path, with the three entries pinned where each one lives.
  { part: 0, stem: 'how_graph', view: 1, overlay: 'flat', scene: { ...SCENE_NONE, blank: true }, card: true,
    enter: ({ store }) => { store.setFlatPhase(0) } },
  // A pause: the whole idea has been said. Continue, or leave for the tool.
  { part: 0, stem: '', view: 1, overlay: 'reflect', scene: { ...SCENE_NONE, blank: true }, card: false },
  { part: 1, stem: '', view: 1, overlay: 'part', scene: { ...SCENE_NONE, blank: true }, card: false },

  // ---- part 1: the architecture ----
  { part: 1, stem: 'domains', view: 1, overlay: null, scene: { ...SCENE_NONE, hulls: true, hint: true, callout: { kind: 'hull', id: '', text: '' } },
    card: true, enter: ({ store }) => { store.setSelectedId(null); store.setShowHulls(true) } },
  { part: 1, stem: 'usecases', view: 1, overlay: null, scene: { ...SCENE_NONE, hulls: true, useCases: true, hint: true, pokes: 'useCases' }, card: true },
  { part: 1, stem: 'platforms', view: 1, overlay: null, scene: { ...SCENE_NONE, hulls: true, useCases: true, platforms: true, hint: true, pokes: 'platforms' }, card: true },
  { part: 1, stem: 'lines', view: 1, overlay: null, scene: { ...SCENE_NONE, hulls: true, useCases: true, platforms: true, links: true }, card: true },
  { part: 1, stem: 'connectors', view: 1, overlay: null, scene: { ...PICTURE, stagger: true }, card: true },
  // The value flow: every line tinted by where its work's value lands and
  // widened by how much work it carries, with the flow running along it.
  { part: 1, stem: 'flow', view: 1, overlay: null, scene: { ...PICTURE, flow: true }, card: true,
    enter: ({ store }) => { store.setSelectedId(null) } },
  { part: 1, stem: 'busiest', view: 1, overlay: null, scene: { ...PICTURE }, card: true,
    enter: ({ store }) => { store.setSelectedId(IDENTITY_ID); store.setFlyToId(IDENTITY_ID) } },
  { part: 1, stem: '', view: 1, overlay: 'end', scene: { ...SCENE_NONE, blank: true }, card: false,
    enter: ({ store }) => { store.setSelectedId(null) } },

  // ---- part 2: how it is decided today ----
  { part: 2, stem: '', view: 1, overlay: 'part', scene: { ...SCENE_NONE, blank: true }, card: false },
  { part: 2, stem: 'docs', view: 1, overlay: 'docs', scene: { ...SCENE_NONE, blank: true }, card: true },
  { part: 2, stem: 'matrix', view: 1, overlay: 'matrix', scene: { ...SCENE_NONE, blank: true }, card: true },
  { part: 2, stem: 'silos', view: 1, overlay: 'silos', scene: { ...SCENE_NONE, blank: true }, card: true },
  // The camera is still where part one left it, close on the busiest node.
  // The graph comes back wide and slowly: the whole picture, not a corner.
  { part: 2, stem: 'graph_today', view: 1, overlay: null, scene: { ...PICTURE, stagger: false }, card: true,
    enter: ({ store }) => { store.setSelectedId(null); store.setFlyToId('*') } },
  // What deciding on a colour costs, and who it lands on.
  { part: 2, stem: 'pain', view: 1, overlay: 'pain', scene: { ...SCENE_NONE, blank: true }, card: true,
    enter: ({ store }) => { store.setSelectedId(null) } },
  { part: 2, stem: '', view: 1, overlay: 'end', scene: { ...SCENE_NONE, blank: true }, card: false },

  // ---- part 3: the ledger ----
  { part: 3, stem: '', view: 1, overlay: 'part', scene: { ...SCENE_NONE, blank: true }, card: false },
  { part: 3, stem: 'why', view: 1, overlay: null, scene: { ...PICTURE }, card: true,
    enter: ({ store }) => { store.setSelectedId(IDENTITY_ID); store.setFlyToId('*') } },
  // The book opens in the corner and three wires run to it from the node:
  // the entries are read off the graph, not collected somewhere else.
  { part: 3, stem: 'mine', view: 1, overlay: null, scene: { ...PICTURE, book: true }, card: true,
    enter: ({ store }) => { store.setSelectedId(IDENTITY_ID) }, settleMs: 2400 },
  { part: 3, stem: 'meter', view: 1, overlay: null, scene: { ...PICTURE, badge: 'meter' }, card: true, rows: ['metered'],
    enter: ({ store }) => { store.setSelectedId(IDENTITY_ID) }, settleMs: 2400,
    waitFor: (now) => now.selectedId !== null && now.selectedId !== IDENTITY_ID },
  { part: 3, stem: 'pool', view: 1, overlay: null, scene: { ...PICTURE, badge: 'pool' }, card: true, rows: ['metered', 'pool'],
    enter: ({ store }) => { store.setSelectedId(IDENTITY_ID) }, settleMs: 1200 },
  { part: 3, stem: 'rule', view: 2, overlay: null, scene: { ...PICTURE, focus: 'riders' }, card: true, rows: ['metered', 'pool', 'rule_first'],
    enter: ({ store }) => { store.setSelectedId(IDENTITY_ID); store.setFanInAdded(0) } },
  { part: 3, stem: 'crowd', view: 2, overlay: null, scene: { ...PICTURE, focus: 'riders' }, card: true, control: 'fanin', rows: ['metered', 'pool', 'rule_first'],
    // One rider at a time, each with room to arrive, rather than three in a
    // burst that re-laid the whole picture.
    enter: ({ store, timeline, reduced }) => {
      store.setSelectedId(IDENTITY_ID); store.setFanInAdded(0)
      for (let i = 1; i <= 3; i++) timeline.after(500 + (i - 1) * 800, () => store.setFanInAdded(i), reduced)
    },
    settleMs: 500 + 1600 + 900,
    waitFor: (now, at) => now.fanInAdded !== at.fanInAdded },
  { part: 3, stem: 'fail', view: 3, overlay: null, scene: { ...PICTURE, focus: 'blast' }, card: true, control: 'fail', rows: ['metered', 'pool', 'rule_first'],
    enter: ({ store, timeline, reduced }) => {
      store.setSelectedId(IDENTITY_ID); store.setSubdomain(TOUR_SUBDOMAIN)
      timeline.after(900, () => store.failIt(IDENTITY_ID), reduced)
    },
    settleMs: 900 + 1200,
    waitFor: (now, at) => now.failRequest !== null && now.failRequest.nonce !== at.failRequest?.nonce },
  // The two figures are read on the failure from the beat before. Reached
  // by Back, that failure has been cleared, so it is raised again here.
  { part: 3, stem: 'together', view: 3, overlay: null, scene: { ...PICTURE, focus: 'blast' }, card: true, rows: ['metered', 'pool', 'rule_first', 'sum', 'joint'],
    enter: ({ store }) => { store.setSelectedId(IDENTITY_ID); store.setSubdomain(TOUR_SUBDOMAIN); if (!store.failRequest) store.failIt(IDENTITY_ID) } },
  { part: 3, stem: 'rho', view: 3, overlay: null, scene: { ...PICTURE, focus: 'blast' }, card: true, control: 'rho', rows: ['metered', 'pool', 'rule_first', 'sum', 'joint', 'range'],
    enter: ({ store, timeline, reduced }) => {
      store.setSelectedId(IDENTITY_ID); store.setSubdomain(TOUR_SUBDOMAIN); store.setRho(0)
      if (!store.failRequest) store.failIt(IDENTITY_ID)
      timeline.after(300, () => {
        timeline.add(animateValue(0, 1, 3000, (v) => store.setRho(round05(v)), reduced))
        timeline.after(3200, () => { timeline.add(animateValue(1, DEFAULT_RHO, 900, (v) => store.setRho(round05(v)), reduced)) }, reduced)
      }, reduced)
    },
    settleMs: 300 + 3200 + 900,
    waitFor: (now, at) => now.rho !== at.rho },
  { part: 3, stem: 'grow', view: 4, overlay: null, scene: { ...PICTURE, focus: 'footprint' }, card: true, rows: ['metered', 'pool', 'rule_first', 'sum', 'joint', 'range'],
    enter: ({ store, timeline, reduced }) => {
      store.setSelectedId(DATA_PLATFORM_ID)
      const marker = store.ratified
      store.setCursor(0)
      timeline.after(400, () => { timeline.add(animateValue(0, marker, 3200, (v) => store.setCursor(Math.round(v)), reduced)) }, reduced)
    },
    settleMs: 400 + 3200 },
  { part: 3, stem: 'exit', view: 4, overlay: null, scene: { ...PICTURE, focus: 'footprint' }, card: true, control: 'month', rows: ['metered', 'pool', 'rule_first', 'sum', 'joint', 'range', 'exec'],
    enter: ({ store }) => { store.setSelectedId(DATA_PLATFORM_ID); store.setCursor(store.ratified) },
    waitFor: (now, at) => now.cursor !== at.cursor },
  // Two shapes, one at a time: the toggle on the canvas switches between
  // them, and the card compares the three entries side by side. The reader
  // steps through cost, risk and leaving with Next or a tap on a row.
  { part: 3, stem: 'diversify', view: 5, overlay: null, scene: { ...PICTURE }, card: true, control: 'shapes',
    enter: ({ store }) => { store.setSubdomain(TOUR_SUBDOMAIN); store.setShapesPhase(0); store.setShapesSide('left') } },
  { part: 3, stem: 'lines_drawn', view: 6, overlay: null, scene: { ...PICTURE, focus: 'lines' }, card: true, rows: ['metered', 'pool', 'rule_first', 'sum', 'joint', 'range', 'exec', 'left', 'right'],
    enter: ({ store }) => { store.setMoves({}); store.setRule('equal'); store.setSelectedId(null) } },
  // The move, in order: the picture ghosts to the use case and its two
  // domains and the camera comes in on it; the ring and the note say what
  // is about to happen; then the line moves and the domain takes it in.
  { part: 3, stem: 'move', view: 6, overlay: null, scene: { ...PICTURE, focus: 'move', callout: { kind: 'node', id: MOVER_ID, text: '' } }, card: true, control: 'move', rows: ['metered', 'pool', 'rule_first', 'sum', 'joint', 'range', 'exec', 'left', 'right', 'moved'],
    enter: ({ store, timeline, reduced }) => {
      store.setRule('equal'); store.setSelectedId(MOVER_ID); store.setFlyToId(`${MOVER_ID}!near`)
      timeline.after(3400, () => store.setMoves({ [MOVER_ID]: MOVER_TO }), reduced)
    },
    settleMs: 3400 + 4500,
    waitFor: (now, at) => JSON.stringify(now.moves) !== JSON.stringify(at.moves) },
  { part: 3, stem: 'basis', view: 6, overlay: null, scene: { ...PICTURE, focus: 'move' }, card: true, control: 'basis', rows: ['metered', 'pool', 'rule_first', 'sum', 'joint', 'range', 'exec', 'left', 'right', 'moved'],
    enter: ({ store }) => { if (Object.keys(store.moves).length === 0) store.setMoves({ [MOVER_ID]: MOVER_TO }) },
    waitFor: (now, at) => now.rule !== at.rule },
  { part: 3, stem: 'close', view: 6, overlay: null, scene: { ...PICTURE }, card: true, closing: true,
    rows: ['metered', 'pool', 'rule_first', 'sum', 'joint', 'range', 'exec', 'left', 'right', 'moved'] },
]

export const LAST_BEAT = BEATS.length - 1
/** Whom each card's step matters to most: the architects, the CFO, or both. */
export const WHO: Record<string, 'arch' | 'cfo' | 'both'> = {
  opener_why: 'both', how_map: 'arch', how_work: 'both', how_graph: 'both',
  domains: 'arch', usecases: 'both', platforms: 'arch', lines: 'arch', connectors: 'arch', flow: 'both', busiest: 'both',
  docs: 'arch', matrix: 'both', silos: 'cfo', graph_today: 'arch', pain: 'both',
  why: 'both', mine: 'arch', meter: 'cfo', pool: 'cfo', rule: 'cfo', crowd: 'cfo',
  fail: 'both', together: 'cfo', rho: 'both', grow: 'arch', exit: 'both', diversify: 'arch',
  lines_drawn: 'arch', move: 'both', basis: 'cfo', close: 'both',
}
if (LAST_BEAT !== TOUR_STEPS) throw new Error(`the router allows ${TOUR_STEPS} beats, the script has ${LAST_BEAT}`)
export const PART_LABEL_KEY: Record<Part, 'part_label_1' | 'part_label_2' | 'part_label_3' | null> = { 0: null, 1: 'part_label_1', 2: 'part_label_2', 3: 'part_label_3' }
export function beatAt(n: number | null): Beat | null { return n === null ? null : BEATS[n] ?? null }
export function partOf(n: number | null): Part { return beatAt(n)?.part ?? 0 }
/** Beats per part, for the progress bars. */
export const PART_COUNTS: number[] = [1, 2, 3].map((p) => BEATS.filter((b) => b.part === p).length)
/** The four chapters, prologue first: where each starts and which beats it holds. */
export const CHAPTERS: { part: Part; start: number; beats: number[] }[] = ([0, 1, 2, 3] as Part[]).map((part) => {
  const beats = BEATS.map((b, i) => (b.part === part ? i : -1)).filter((i) => i >= 0)
  return { part, start: beats[0] ?? 0, beats }
})
/** A beat's name for the navigator: its heading, or what its picture is. */
export function beatLabel(i: number, c: Record<string, string>): string {
  const b = BEATS[i]
  if (!b) return ''
  if (b.stem && c[`b_${b.stem}_h`]) return c[`b_${b.stem}_h`]!
  if (b.stem === 'title') return c.nav_title ?? ''
  return c[`nav_${b.overlay ?? 'part'}`] ?? ''
}
