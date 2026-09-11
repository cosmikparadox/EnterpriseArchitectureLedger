// The seven steps. Brief B3.
//
// A step is three things: what it does to the tool when it opens, which copy it
// shows, and what it watches for so it can tell you that you did the thing. It
// holds no prose of its own; every sentence comes from the copy deck.
//
// Steps drive the tool only through the store, which is the whole reason Part A
// exists. Nothing here reaches into a view.

import { DEFAULT_RHO, type LedgerState } from '../app/store'
import { animateValue, type Timeline } from './animate'

/** The node the first four steps are about. */
export const IDENTITY_ID = 'okta'
/** The cloud data platform, step 5. */
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
  /** Copy keys. Step 7 is the closing card and has its own shape. */
  closing?: true
}

export const STEPS: TourStep[] = [
  // 1. A platform is a shared node, and use cases plug into it.
  {
    view: 1,
    enter: ({ store }) => {
      store.setView(1)
      store.setShowHulls(true)
      store.setSelectedId(IDENTITY_ID)
      store.setFlyToId(IDENTITY_ID)
    },
    settleMs: 0,
    // Any other platform will do. The point is that they went and looked.
    waitFor: (now) => now.selectedId !== null && now.selectedId !== IDENTITY_ID,
  },

  // 2. Part of every bill is a rule, not a meter.
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
    waitFor: (now, at) => now.rule !== at.rule || now.fanInAdded !== at.fanInAdded,
  },

  // 3. Fan-in is blast radius, and adding risk up overcounts it.
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
    waitFor: (now, at) =>
      now.failRequest !== null &&
      now.failRequest.nonce !== at.failRequest?.nonce &&
      now.failRequest.nodeId !== IDENTITY_ID,
  },

  // 4. How much platforms fail together changes the number, and nothing here
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
    waitFor: (now, at) => now.rho !== at.rho,
  },

  // 5. The footprint arrived before the board did.
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
    waitFor: (now, at) => now.cursor !== at.cursor || now.ratified !== at.ratified,
  },

  // 6. Diversifying moved the concentration.
  {
    view: 5,
    enter: ({ store }) => { store.setView(5) },
    settleMs: 0,
  },

  // 7. The closing card. No view change.
  {
    view: 5,
    enter: () => {},
    settleMs: 0,
    closing: true,
  },
]

/** The dependence slider steps in twentieths, so the animation should too. */
function round05(v: number): number {
  return Math.round(v * 20) / 20
}
