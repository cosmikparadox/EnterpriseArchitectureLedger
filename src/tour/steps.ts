// The ledger chapters, 7 to 15. Brief B3, extended.
//
// A step is three things: what it does to the tool when it opens, which copy it
// shows, and what it watches for so it can tell you that you did the thing. It
// holds no prose of its own; every sentence comes from the copy deck.
//
// Steps drive the tool only through the store, which is the whole reason Part A
// exists. Nothing here reaches into a view.

import { DEFAULT_RHO, type LedgerState } from '../app/store'
import { animateValue, type Timeline } from './animate'
import { copy } from '../copy'
import type { Spot } from './Spotlight'

/** The node the ledger chapters are about. */
export const IDENTITY_ID = 'okta'
/** The cloud data platform, chapter 12. */
export const DATA_PLATFORM_ID = 'meridian'
/** The subdomain whose non-additivity pair the tour reads. */
export const TOUR_SUBDOMAIN = 'claims'

export interface EnterContext {
  store: LedgerState
  timeline: Timeline
  /** True when the viewer has asked for less motion: cut, do not travel. */
  reduced: boolean
}

export interface TourStep {
  /** Which view the step belongs on. */
  view: Exclude<LedgerState['view'], 'landing'>
  /** Store actions run when the step opens. */
  enter: (c: EnterContext) => void
  /**
   * How long enter()'s own animations take, in milliseconds.
   *
   * waitFor is armed only after this has elapsed, and the state it compares
   * against is read at that moment. Without it a step that animates a slider
   * would congratulate the viewer for the slider the step itself was moving:
   * step 4 sweeps rho from 0 to 1 and back, so every value in between would
   * have read as "they moved it".
   */
  settleMs: number
  /**
   * True once the viewer has done the thing the step asked for. Compared against
   * the state as it was when the step settled, so "changed" means changed by
   * them, not by enter().
   */
  waitFor?: (now: LedgerState, atEntry: LedgerState) => boolean
  /**
   * What stays bright while everything else dims. Named by data-tour attribute
   * on the element, or the selected node by its published screen position.
   */
  spots: Spot[]
  /** Copy keys. Step 7 is the closing card and has its own shape. */
  closing?: true
}

/**
 * Which sections of the node panel a chapter has earned. The panel used to
 * open whole on the first ledger chapter, thirty figures at once, none of them
 * introduced. Now chapter 7 shows the name and the summary, chapter 8 adds the
 * meter, and the rest is met one chapter at a time on the screens built for
 * it. Outside the tour, everything shows.
 */
export type PanelSection = 'metered' | 'riders' | 'failure' | 'switching'
export function panelSectionsAt(step: number | null): PanelSection[] | 'all' {
  if (step === null) return 'all'
  if (step <= 7) return []
  if (step === 8) return ['metered']
  return 'all'
}

/** Chapter number to step definition. Chapters 0 to 6 are the intro and have none. */
export function stepFor(chapter: number): TourStep | undefined {
  return STEPS[chapter - 7]
}

export const STEPS: TourStep[] = [
  // 7. Why a ledger. The picture is complete and the drawing it is usually
  //    seen as sits over it. Nothing is selected; the panel stays closed.
  {
    view: 1,
    enter: ({ store }) => {
      store.setView(1)
      store.setShowHulls(true)
      store.setSelectedId(null)
    },
    settleMs: 0,
    spots: [{ selector: '[data-tour="drawing"] .drawing-sheet', label: copy.tour_7_spot_drawing }],
  },

  // 8. What it meters. The busiest node is selected and flown to; the panel
  //    opens on the meter and nothing else yet.
  {
    view: 1,
    enter: ({ store }) => {
      store.setView(1)
      store.setSelectedId(IDENTITY_ID)
      store.setFlyToId(IDENTITY_ID)
    },
    settleMs: 0,
    spots: [{ node: true, label: copy.tour_7_spot_node }, { selector: '[data-tour="metered"]', label: copy.tour_8_spot_meter }],
    // Any other platform will do. The point is that they went and looked.
    waitFor: (now) => now.selectedId !== null && now.selectedId !== IDENTITY_ID,
  },

  // 9. Part of every bill is a rule, not a meter.
  {
    view: 2,
    enter: ({ store, timeline, reduced }) => {
      store.setView(2)
      store.setSelectedId(IDENTITY_ID)
      store.setFanInAdded(0)
      timeline.after(350, () => {
        timeline.add(animateValue(0, 3, 1500, (v) => store.setFanInAdded(Math.round(v)), reduced))
      }, reduced)
    },
    settleMs: 350 + 1500,
    spots: [
      { selector: '[data-tour="fanin"]', label: copy.tour_9_spot_slider },
      { selector: '[data-tour="riders"]', label: copy.tour_9_spot_list },
    ],
    waitFor: (now, at) => now.rule !== at.rule || now.fanInAdded !== at.fanInAdded,
  },

  // 10. Fan-in is blast radius, and adding risk up overcounts it.
  {
    view: 3,
    enter: ({ store, timeline, reduced }) => {
      store.setView(3)
      store.setSelectedId(IDENTITY_ID)
      store.failIt(IDENTITY_ID)
      // The non-additivity pair only means anything once the failure has been
      // watched, so the subdomain is set after it has played.
      timeline.after(2000, () => store.setSubdomain(TOUR_SUBDOMAIN), reduced)
    },
    settleMs: 2000,
    spots: [
      { selector: '[data-tour="fail"]', label: copy.tour_10_spot_fail },
      { selector: '[data-tour="nonadd"]', label: copy.tour_10_spot_pair },
    ],
    waitFor: (now, at) =>
      now.failRequest !== null &&
      now.failRequest.nonce !== at.failRequest?.nonce &&
      now.failRequest.nodeId !== IDENTITY_ID,
  },

  // 11. How much platforms fail together changes the number, and nothing here
  //    knows how much they do.
  {
    view: 3,
    enter: ({ store, timeline, reduced }) => {
      store.setView(3)
      store.setSubdomain(TOUR_SUBDOMAIN)
      store.setRho(0)
      timeline.after(300, () => {
        timeline.add(animateValue(0, 1, 3000, (v) => store.setRho(round05(v)), reduced))
        timeline.after(3200, () => {
          timeline.add(animateValue(1, DEFAULT_RHO, 900, (v) => store.setRho(round05(v)), reduced))
        }, reduced)
      }, reduced)
    },
    settleMs: 300 + 3200 + 900,
    spots: [
      { selector: '[data-tour="rho"]', label: copy.tour_11_spot_rho },
      { selector: '[data-tour="gap"]', label: copy.tour_11_spot_gap },
    ],
    waitFor: (now, at) => now.rho !== at.rho,
  },

  // 12. The footprint arrived before the board did.
  {
    view: 4,
    enter: ({ store, timeline, reduced }) => {
      store.setView(4)
      store.setSelectedId(DATA_PLATFORM_ID)
      // The ratification month is left alone. It is the month the board
      // ratified the node, not the month the node arrived, and the gap between
      // the two is the whole step. Setting it to the adoption month would close
      // that gap and the step would be showing nothing.
      const marker = store.ratified
      store.setCursor(0)
      timeline.after(350, () => {
        timeline.add(animateValue(0, marker, 3000, (v) => store.setCursor(Math.round(v)), reduced))
      }, reduced)
    },
    settleMs: 350 + 3000,
    spots: [
      { selector: '[data-tour="month"]', label: copy.tour_12_spot_month },
      { selector: '[data-tour="ratify"]', label: copy.tour_12_spot_board },
    ],
    waitFor: (now, at) => now.cursor !== at.cursor || now.ratified !== at.ratified,
  },

  // 13. Diversifying moved the concentration.
  {
    view: 5,
    enter: ({ store }) => { store.setView(5) },
    settleMs: 0,
    spots: [
      { selector: '[data-tour="caption-left"]', label: copy.tour_13_spot_left },
      { selector: '[data-tour="caption-right"]', label: copy.tour_13_spot_right },
      { selector: '[data-tour="p99"]', label: copy.tour_13_spot_table },
    ],
  },

  // 14. The boundaries are drawn by people. Redraw them and watch what moves.
  {
    view: 6,
    enter: ({ store }) => { store.setView(6) },
    settleMs: 0,
    spots: [{ selector: '[data-tour="basis"]', label: copy.tour_14_spot_basis }],
    waitFor: (now, at) => now.rule !== at.rule,
  },

  // 15. The close. No view change.
  {
    view: 6,
    enter: () => {},
    settleMs: 0,
    spots: [],
    closing: true,
  },
]

/** The dependence slider steps in twentieths, so the animation should too. */
function round05(v: number): number {
  return Math.round(v * 20) / 20
}
