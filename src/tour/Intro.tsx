// The intro, tour step 0.
//
// "Start the tour" does not open a tool with a card on it. It opens the title
// card on an empty canvas, and the estate assembles behind the card in beats:
// the business and its use cases, then the platforms, then the lines between
// them, then the connectors, then the camera goes to the one node most of the
// business rides on. The card then dissolves and the working interface fades
// in around the same graph, which has been there the whole time.
//
// It runs inside view 1, on view 1's own Graph3D, so nothing is laid out
// twice. What this file owns is which nodes are lit at each beat and the words
// for the beat. There is no clock: the viewer builds the estate a layer at a
// time on Next, and can go Back, because a graph filling in on its own was not
// self explaining and could not be paused. Under prefers-reduced-motion the
// estate is shown whole with the last beat's words.

import { useEffect, useMemo, useRef, useState } from 'react'
import { copy, fill } from '../copy'
import { useLedger } from '../app/store'
import { usePrefersReducedMotion } from '../app/useNarrow'
import { SUBDOMAIN_COLOUR } from '../app/graph'
import { describeEstate, describePlatform, describeSubdomain, describeUseCase } from '../model/describe'
import type { Estate } from '../model/types'
import type { Index } from '../model/ledger'

/** How long the card takes to dissolve before the tour proper begins. */
const DISSOLVE_MS = 700
const LAST_BEAT = 5

export interface IntroState {
  active: boolean
  beat: number
  /** Nodes not yet revealed at this beat. */
  dimNodes: Set<string>
  /** Nodes whose lines are not drawn yet at this beat. */
  hideLinksOf: Set<string>
  leaving: boolean
  advance: () => void
  back: () => void
  skip: () => void
  /** A tapped coloured region, by subdomain id. Node focus is the store's selection. */
  focusSub: string | null
  /** Regions tapped so far, in order. The legend builds from this. */
  named: string[]
  tapSub: (id: string) => void
  tapNode: (id: string) => void
  clearFocus: () => void
}

export function useIntro(estate: Estate, ix: Index): IntroState {
  const tourStep = useLedger((s) => s.tourStep)
  const setTourStep = useLedger((s) => s.setTourStep)
  const setSelectedId = useLedger((s) => s.setSelectedId)
  const setFlyToId = useLedger((s) => s.setFlyToId)
  const setShowHulls = useLedger((s) => s.setShowHulls)
  const reduced = usePrefersReducedMotion()
  const active = tourStep === 0
  const [beat, setBeat] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [focusSub, setFocusSub] = useState<string | null>(null)
  const [named, setNamed] = useState<string[]>([])

  const ids = useMemo(() => {
    const useCases = estate.use_cases.map((u) => u.id)
    const platforms = estate.platforms.filter((p) => p.type !== 'integration').map((p) => p.id)
    const integration = estate.platforms.filter((p) => p.type === 'integration').map((p) => p.id)
    const ridersOf = (id: string) => ix.ridersOf.get(id)?.length ?? 0
    const top = estate.platforms.reduce((a, p) => (ridersOf(p.id) > ridersOf(a.id) ? p : a), estate.platforms[0]!)
    return { useCases, platforms, integration, top }
  }, [estate, ix])

  // Reset on entry. Under reduced motion the whole estate is shown at once and
  // the card carries the last sentence; the beats are for the eye, and this
  // viewer asked for less of that.
  useEffect(() => {
    if (!active) return
    setLeaving(false)
    setBeat(reduced ? LAST_BEAT : 0)
    setFocusSub(null)
    setNamed([])
    setSelectedId(null)
    setShowHulls(true)
  }, [active, reduced, setSelectedId, setShowHulls])

  // The last beat aims the camera at the busiest node and lights it.
  useEffect(() => {
    if (!active || beat < LAST_BEAT) return
    setSelectedId(ids.top.id)
    setFlyToId(ids.top.id)
  }, [active, beat, ids.top.id, setSelectedId, setFlyToId])

  // Leaving: the card dissolves, then step 1 takes over. Step 1's own enter()
  // selects and flies to the same node, so the handover is invisible.
  useEffect(() => {
    if (!active || !leaving) return
    const t = setTimeout(() => setTourStep(1), reduced ? 0 : DISSOLVE_MS)
    return () => clearTimeout(t)
  }, [active, leaving, reduced, setTourStep])

  const { dimNodes, hideLinksOf } = useMemo(() => {
    const dim = new Set<string>()
    const hide = new Set<string>()
    if (!active) return { dimNodes: dim, hideLinksOf: hide }
    if (beat < 1) for (const id of ids.useCases) dim.add(id)
    if (beat < 2) for (const id of ids.platforms) dim.add(id)
    if (beat < 4) for (const id of ids.integration) dim.add(id)
    // Lines arrive at beat 3, one beat after the platforms, so the platforms
    // are seen on their own first. Connector lines wait for the connectors.
    if (beat < 3) { for (const id of ids.useCases) hide.add(id); for (const id of ids.platforms) hide.add(id) }
    if (beat < 4) for (const id of ids.integration) hide.add(id)
    return { dimNodes: dim, hideLinksOf: hide }
  }, [active, beat, ids])

  const advance = () => {
    if (beat >= LAST_BEAT) setLeaving(true)
    else setBeat((b) => b + 1)
  }
  const back = () => setBeat((b) => Math.max(0, b - 1))
  const skip = () => setLeaving(true)
  // A region and a node are not both in focus: tapping one lets go of the other.
  const tapSub = (id: string) => { setSelectedId(null); setFocusSub(id); setNamed((n) => (n.includes(id) ? n : [...n, id])) }
  const tapNode = (id: string) => { setFocusSub(null); setSelectedId(id) }
  const clearFocus = () => { setFocusSub(null); setSelectedId(null) }

  return { active, beat, dimNodes, hideLinksOf, leaving, advance, back, skip, focusSub, named, tapSub, tapNode, clearFocus }
}

export function IntroCard({ intro, estate, ix }: { intro: IntroState; estate: Estate; ix: Index }) {
  const { beat, leaving, advance, back, skip, focusSub, named, clearFocus } = intro
  const selectedId = useLedger((s) => s.selectedId)
  const rule = useLedger((s) => s.rule)
  const estateValues = useMemo(() => describeEstate(ix), [ix])

  // What the card says about the thing under focus, assembled from the data.
  // A selected node wins over a tapped region: the last beat selects the
  // busiest node on its own, and that is what the card should then be about.
  const focus = useMemo(() => {
    if (selectedId && ix.useCaseById.has(selectedId)) {
      const v = describeUseCase(ix, selectedId, rule)
      const u = ix.useCaseById.get(selectedId)!
      return { colour: SUBDOMAIN_COLOUR[u.subdomain], lines: [copy.desc_uc_what, copy.desc_uc_rides, copy.desc_uc_cost, copy.desc_uc_risk].map((t) => fill(t, v)) }
    }
    if (selectedId && ix.platformById.has(selectedId)) {
      const v = describePlatform(ix, selectedId, rule)
      return { colour: undefined, lines: [copy.desc_pf_what, copy.desc_pf_rides, copy.desc_pf_cost, copy.desc_pf_how, copy.desc_pf_rule].map((t) => fill(t, v)) }
    }
    if (focusSub) {
      const v = describeSubdomain(ix, focusSub)
      return { colour: SUBDOMAIN_COLOUR[focusSub], lines: [copy.desc_sd_what, copy.desc_sd_count, copy.desc_sd_shared].map((t) => fill(t, v)) }
    }
    return null
  }, [focusSub, selectedId, ix, rule])
  // Publish the card's real height so the canvas ends where the card begins
  // when it is anchored to the bottom, the same way the tour card does.
  const cardRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const root = document.documentElement
    const publish = () => root.style.setProperty('--tour-card-actual-h', `${Math.ceil(el.getBoundingClientRect().height)}px`)
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    return () => { ro.disconnect(); root.style.removeProperty('--tour-card-actual-h') }
  }, [beat])
  const values = estateValues
  const lines = [copy.intro_1, copy.intro_2, copy.intro_3, copy.intro_4, copy.intro_5]
  const layers = [copy.intro_1_layer, copy.intro_2_layer, copy.intro_3_layer, copy.intro_4_layer, copy.intro_5_layer]
  const sees = [copy.intro_1_see, copy.intro_2_see, copy.intro_3_see, copy.intro_4_see, copy.intro_5_see]
  const line = beat === 0 ? copy.landing_sentence : fill(lines[beat - 1]!, values)
  const subById = new Map(estate.subdomains.map((s) => [s.id, s]))

  return (
    <aside className={leaving ? 'intro intro-leaving' : 'intro'} aria-label="Introduction" ref={cardRef}>
      <h1>{copy.landing_title}</h1>
      {beat > 0 && (
        <div className="intro-layer">{beat} of {LAST_BEAT}, {layers[beat - 1]}</div>
      )}
      <p key={`l${beat}`} className="intro-line">{line}</p>
      {beat > 0 && <p key={`s${beat}`} className="intro-see">{fill(sees[beat - 1]!, values)}</p>}

      {beat >= 1 && (
        <div className="intro-legend" data-tour="intro-legend">
          <div className="intro-legend-head">{copy.intro_legend_head}</div>
          {named.length === 0 && <div className="intro-legend-prompt">{copy.intro_legend_prompt}</div>}
          {named.map((id) => (
            <div key={id} className="intro-legend-row">
              <span className="intro-swatch" style={{ background: SUBDOMAIN_COLOUR[id] }} />
              <span>{subById.get(id)?.name ?? id}</span>
              <span className="intro-legend-n">{estate.use_cases.filter((u) => u.subdomain === id).length}</span>
            </div>
          ))}
          {named.length === estate.subdomains.length && (
            <div className="intro-legend-prompt">{fill(copy.intro_legend_done, { n_sub: estate.subdomains.length })}</div>
          )}
        </div>
      )}

      {focus && (
        <div className="intro-focus" style={focus.colour ? { borderLeftColor: focus.colour } : undefined}>
          {focus.lines.map((t, i) => <p key={i} className={i === 0 ? 'intro-focus-lead' : ''}>{t}</p>)}
          <button className="tour-skip" onClick={clearFocus}>{copy.intro_focus_clear}</button>
        </div>
      )}
      <div className="intro-actions">
        <button className="ctl" onClick={back} disabled={beat === 0}>{copy.intro_back}</button>
        <button className="cta" onClick={advance} autoFocus>
          {beat >= LAST_BEAT ? copy.intro_begin : copy.intro_next}
        </button>
        <button className="tour-skip" onClick={skip}>{copy.intro_skip}</button>
      </div>
      <div className="intro-beats" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((b) => <span key={b} className={b <= beat ? 'on' : ''} />)}
      </div>
    </aside>
  )
}
