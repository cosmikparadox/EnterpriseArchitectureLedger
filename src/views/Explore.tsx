// View 1, Explore. Spec section 4.1.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Graph3D, type LabelMode } from '../components/Graph3D'
import { Term, ViewName } from '../components/Hint'
import { Legend } from '../components/Legend'
import { DetailPanel } from '../components/DetailPanel'
import { buildGraph, CONNECTOR, SUBDOMAIN_COLOUR, type GLink } from '../app/graph'
import type { AllocationRule, Estate } from '../model/types'
import { gbpAbout, type Index } from '../model/ledger'
import { useLedger } from '../app/store'
import { usePrefersReducedMotion } from '../app/useNarrow'
import { describeSubdomain } from '../model/describe'
import { copy, fill } from '../copy'
import { useLayoutReport } from '../app/layoutReport'
import { firstTime } from '../app/hints'
import { MeterBadge, PoolBadge } from '../story/Badges'
import { Walkthrough, revealFor, type Focus } from './Walkthrough'
import { leavingFor, platformView } from '../app/graph'
import { resultFor } from '../app/useMonteCarlo'
import { IDENTITY_ID, LEAVING_PLATFORM_ID } from '../story/script'
import { reachAt, sampleFailure } from '../model/reach'
import { describeUseCase } from '../model/describe'

const GESTURE_KEY = 'ledger.gesture.seen'
// Remembered for the session only: the story is the first-run experience,
// and a viewer who comes back to it should be told again.
const gestureSeen = () => { try { return sessionStorage.getItem(GESTURE_KEY) === '1' } catch { return false } }
const markGesture = () => { try { sessionStorage.setItem(GESTURE_KEY, '1') } catch { /* private window: the hint simply shows again next time */ } }

export interface ExploreProps {
  estate: Estate
  ix: Index
  rule: AllocationRule
  dark: boolean
}

export function Explore({ estate, ix, rule, dark }: ExploreProps) {
  const data = useMemo(() => buildGraph(estate, ix), [estate, ix])
  // Shared, so the tour and the other views can drive them.
  const showHulls = useLedger((s) => s.showHulls)
  const setShowHulls = useLedger((s) => s.setShowHulls)
  const selectedId = useLedger((s) => s.selectedId)
  const setSelectedId = useLedger((s) => s.setSelectedId)
  const flyTo = useLedger((s) => s.flyToId)
  const setFlyTo = useLedger((s) => s.setFlyToId)
  // Local, because nothing outside this view has an opinion about them.
  const [labelMode, setLabelMode] = useState<LabelMode>('all')
  const [isolated, setIsolated] = useState<string | null>(null)
  const [selectedLink, setSelectedLink] = useState<GLink | null>(null)
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const onSettle = useLayoutReport()
  const reduced = usePrefersReducedMotion()
  // During the story the canvas is driven by the scene in the store: which
  // layers are up, whether anything is arriving one by one, where the marker
  // is. Outside it, everything is up and the scene is ignored.
  const tourStep = useLedger((s) => s.tourStep)
  const scene = useLedger((s) => s.scene)
  const sceneReady = useLedger((s) => s.sceneReady)
  const named = useLedger((s) => s.namedDomains)
  const setFocus = useLedger((s) => s.setFocus)
  const nameDomain = useLedger((s) => s.nameDomain)
  const inStory = tourStep !== null
  const storySets = useMemo(() => {
    const dim = new Set<string>(); const hide = new Set<string>(); const hulls = new Set<string>()
    if (!inStory) return { dim, hide, hulls }
    for (const p of estate.platforms) {
      const isConn = p.type === 'integration'
      if (isConn ? !scene.connectors : !scene.platforms) dim.add(p.id)
      if (isConn ? !scene.connectors : !scene.links) hide.add(p.id)
    }
    for (const u of estate.use_cases) { if (!scene.useCases) dim.add(u.id); if (!scene.links) hide.add(u.id) }
    if (!scene.hulls) for (const sd of estate.subdomains) hulls.add(sd.id)
    return { dim, hide, hulls }
  }, [inStory, scene, estate])
  // The story's rule of focus: a beat that picks a node is about that node,
  // so the picture keeps it and what it touches and everything else steps
  // well back. A use case keeps its platforms; a platform keeps its riders.
  const storyFocus = useMemo(() => {
    if (!inStory || !selectedId) return null
    const nodes = new Set<string>([selectedId])
    const u = ix.useCaseById.get(selectedId)
    if (u) for (const e of u.edges) nodes.add(e.platform_id)
    for (const r of ix.ridersOf.get(selectedId) ?? []) nodes.add(r.uc.id)
    return { nodes }
  }, [inStory, selectedId, ix])
  // A beat with the lines up and nothing picked is about the lines: the
  // names step back so the lines carry it.
  const quietLabels = inStory && !selectedId && scene.links

  // Sequenced beats. A clock steps the picture through its stages; with less
  // motion asked for, it lands on the last stage at once.
  const [seq, setSeq] = useState(0)
  const play = inStory ? scene.play : null
  useEffect(() => {
    setSeq(0)
    if (!play) return
    const marks = play === 'connectors' ? [700, 1500, 3600] : [900, 2800, 5000]
    if (reduced) { setSeq(marks.length); return }
    const ts = marks.map((ms, i) => setTimeout(() => setSeq(i + 1), ms))
    return () => ts.forEach(clearTimeout)
  }, [play, tourStep, reduced])
  // Connectors: the graph dims to the connectors alone; they pop; their
  // lines grow out of them; then everything reached through them lights.
  const conn = useMemo(() => {
    const ids = estate.platforms.filter((p) => p.type === 'integration').map((p) => p.id)
    const riders = new Set(ids.flatMap((id) => (ix.ridersOf.get(id) ?? []).map((r) => r.uc.id)))
    const reached = new Set([...riders].flatMap((u) => ix.useCaseById.get(u)!.edges.map((e) => e.platform_id)))
    return { ids, riders, reached }
  }, [estate, ix])
  // So what: the three readings, one after another, on the whole graph.
  const sowhatWave = useMemo(() => {
    if (play !== 'sowhat') return null
    const f = sampleFailure(ix, 'conduit', 7)
    // No dependence: only what rides the failed node goes, so the picture stays clean.
    return f ? { failure: f, reach: reachAt(ix, f, 0, 0xc0de) } : null
  }, [play, ix])
  const playProps = useMemo(() => {
    if (play === 'connectors') {
      const { ids, riders, reached } = conn
      const nodes = seq >= 3 ? new Set([...ids, ...riders, ...reached]) : seq >= 2 ? new Set([...ids, ...riders]) : new Set(ids)
      return {
        focus: { nodes },
        hide: seq < 2 ? ids : [],
        sprout: seq >= 2 ? ids : null,
        pop: seq >= 1 ? { ids, nonce: tourStep ?? 0 } : null,
      }
    }
    if (play === 'sowhat') {
      const pins: { id: string; text: string; tone: 'cost' | 'risk' | 'exit' }[] = []
      if (seq >= 1) pins.push({ id: IDENTITY_ID, text: copy.pin_cost, tone: 'cost' })
      if (seq >= 2) pins.push({ id: 'conduit', text: copy.pin_risk, tone: 'risk' })
      if (seq >= 3) pins.push({ id: LEAVING_PLATFORM_ID, text: copy.pin_exit, tone: 'exit' })
      const w = seq >= 2 ? sowhatWave : null
      return {
        pins,
        pop: seq >= 1 ? { ids: seq >= 3 ? [LEAVING_PLATFORM_ID] : seq >= 2 ? ['conduit'] : [IDENTITY_ID], nonce: seq } : null,
        failedNodeId: w ? 'conduit' : null,
        affectedUseCases: w ? new Set([...w.reach.affected, ...w.reach.platforms]) : undefined,
        litLinks: w ? w.reach.litLinks : undefined,
        wave: w ? { from: 'conduit', nonce: 7000 + w.reach.platforms.size, hop: w.reach.hop } : null,
      }
    }
    return null
  }, [play, seq, conn, sowhatWave, tourStep])
  const hideSet = useMemo(() => (playProps?.hide?.length ? new Set([...storySets.hide, ...playProps.hide]) : storySets.hide), [playProps, storySets])
  const callout = useMemo(() => {
    if (!inStory || !scene.callout) return null
    if (scene.callout.kind === 'hull' && scene.callout.id === '') {
      const next = estate.subdomains.find((sd) => !named.includes(sd.id))
      return next ? { kind: 'hull' as const, id: next.id, text: copy.intro_callout_domain } : null
    }
    return scene.callout
  }, [inStory, scene.callout, estate, named])
  // Outside the story a tapped domain explains itself in a pop-up on the
  // canvas, with the same lines the story gave it.
  const [hullPop, setHullPop] = useState<string | null>(null)
  // The drag hint shows on the first picture until the viewer has dragged
  // once, on this device. Remembered per viewer, and a browser that will not
  // remember it just shows it again.
  const [dragged, setDragged] = useState(gestureSeen)
  // The walkthrough: a play button on the panel, and the node's figures
  // arrive one step at a time with the canvas focused on each.
  // The value flow picture. On the explorer it is a button; in the story
  // it is a beat. Warmth per use case from the declared flag, share per
  // line from the work it carries against the busiest line.
  const [flowOn, setFlowOn] = useState(false)
  const flow = useMemo(() => {
    if (!(inStory ? scene.flow : flowOn)) return null
    const WARMTH = { customer: 1, counterparty: 0.5, internal: 0 } as const
    const warmth = new Map<string, number>()
    const share = new Map<string, number>()
    const maxVol = Math.max(1, ...estate.use_cases.map((u) => u.volume_per_month))
    for (const u of estate.use_cases) {
      warmth.set(u.id, WARMTH[u.value_flow])
      for (const e of u.edges) share.set(`${u.id}>${e.platform_id}`, u.volume_per_month / maxVol)
    }
    return { warmth, share }
  }, [inStory, scene.flow, flowOn, estate])
  const [walk, setWalk] = useState<string | null>(null)
  const [walkStep, setWalkStep] = useState(0)
  const [walkFocus, setWalkFocus] = useState<Focus | null>(null)
  const reveal = walk ? revealFor(ix.platformById.has(walk), walkStep) : undefined
  const onWalkFocus = useCallback((f: Focus | null) => setWalkFocus(f), [])
  // Any other selection, from anywhere, ends the walk on the old node.
  useEffect(() => { if (walk && selectedId !== walk) setWalk(null) }, [selectedId, walk])
  const gestureHint = inStory && scene.hint && !dragged ? copy.canvas_gesture : null
  // The first time the reader meets dots or spheres, a few of them pulse
  // and a hint says they can be tapped. One tap on that kind retires it,
  // here and on later visits.
  const poked = useLedger((s) => s.poked)
  const setPoked = useLedger((s) => s.setPoked)
  // Whether each kind's hint text is shown this visit: only the first time.
  const pokeText = useRef(new Map<string, boolean>())
  const pokes = useMemo(() => {
    const kind = scene.pokes
    if (!inStory || !kind || poked[kind]) return null
    // Lines are ringed at their middle, written 'use case>platform'.
    const want: Record<typeof kind, string[]> = {
      useCases: ['uc_claim_settle', 'uc_quote_bind', 'uc_payroll'],
      platforms: ['claims_admin', 'erp', 'hcm'],
      connectors: ['identity', 'api_gateway', 'event_bus'],
      lines: ['uc_claim_settle>claims_admin', 'uc_quote_bind>policy_admin', 'uc_payroll>hcm'],
      flow: ['uc_claim_settle>payments', 'uc_reins_settle>erp', 'uc_payroll>hcm'],
    }
    const ok = (id: string) => {
      const [a, b] = id.split('>') as [string, string | undefined]
      return b ? ix.useCaseById.get(a)?.edges.some((e) => e.platform_id === b) === true : ix.useCaseById.has(a) || ix.platformById.has(a)
    }
    const ids = want[kind].filter(ok)
    if (!pokeText.current.has(kind)) pokeText.current.set(kind, firstTime(`poke_${kind}`))
    return ids.length ? { ids, text: pokeText.current.get(kind) ? (copy as Record<string, string>)[`poke_${kind}`] ?? '' : '' } : null
  }, [inStory, scene.pokes, poked, ix])
  // The book's rows are read off the graph for whatever node is tapped: a
  // platform's meter, pool, riders and work of leaving; a use case's bill,
  // its own bad month, and the platform it would be hardest to leave, whose
  // work is shared by its riders and never divided among them.
  const bookRho = useLedger((s) => s.rho)
  const book = useMemo(() => {
    if (!inStory || !scene.book || !selectedId) return null
    const gbpN = (n: number) => Math.round(n).toLocaleString('en-GB')
    let values: [string, string, string] | null = null
    let name = ''
    if (ix.platformById.has(selectedId)) {
      const p = ix.platformById.get(selectedId)!
      const v = platformView(ix, selectedId, rule, 60 - p.adopted_month)
      name = v.name
      values = [
        fill(copy.book_v_cost_p, { metered: gbpN(v.meteredSpend), pool: gbpN(v.fixedPool) }),
        fill(copy.book_v_risk_p, { riders: v.riders }),
        fill(copy.book_v_exit_p, { exec: gbpAbout(v.workOfLeaving) }),
      ]
    } else if (ix.useCaseById.has(selectedId)) {
      const d = describeUseCase(ix, selectedId, rule)
      const p99 = resultFor(estate, bookRho)?.useCases.find((u) => u.id === selectedId)?.p99
      const leaving = leavingFor(ix, selectedId, LEAVING_PLATFORM_ID)
      name = String(d.name)
      values = [
        fill(copy.book_v_cost_u, { reported: String(d.reported) }),
        p99 === undefined ? '' : fill(copy.book_v_risk_u, { p99: gbpAbout(p99) }),
        leaving ? fill(copy.book_v_exit_u, { platform: leaving.name, exec: gbpAbout(leaving.exec), riders: leaving.riders }) : '',
      ]
    } else return null
    return {
      id: selectedId,
      title: fill(copy.book_title, { name }),
      rows: [copy.book_row_1, copy.book_row_2, copy.book_row_3].map((label, i) => ({ label, value: values![i] })),
      note: copy.book_note,
    }
  }, [inStory, scene.book, selectedId, ix, rule, estate, bookRho])
  // The panel is always present outside the story, opening on the estate
  // summary when nothing is picked, so the canvas yields to it whenever it
  // is not collapsed. The story never shows it.
  const panelOpen = !collapsed && !inStory

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return data.nodes.filter((n) => n.name.toLowerCase().includes(q)).slice(0, 8)
  }, [query, data])

  const pick = (id: string) => {
    setSelectedLink(null)
    setSelectedId(id)
    setCollapsed(false)
    setFlyTo(id)
  }

  return (
    <>
      <div className="topbar">
        <h1>Ledger Explorer</h1>
        <ViewName n={1}>Explore</ViewName>

        <div className="search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes"
            aria-label="Search nodes by name"
          />
          {matches.length > 0 && (
            <div className="results" role="listbox">
              {matches.map((m) => (
                <button key={m.id} role="option" aria-selected={false}
                  onClick={() => { pick(m.id); setQuery('') }}>
                  {m.name} <span className="k">{m.kind === 'use_case' ? 'use case' : m.kind}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="ctl" aria-pressed={showHulls} onClick={() => setShowHulls(!showHulls)}>
          Boundaries
        </button>
        <button className="ctl" aria-pressed={flowOn} onClick={() => setFlowOn((v) => !v)}>{copy.flow_button}</button>
        <button className="ctl" onClick={() =>
          setLabelMode((m) => (m === 'none' ? 'selected' : m === 'selected' ? 'all' : 'none'))}>
          Labels: {labelMode}
        </button>
        <select
          className="ctl"
          value={isolated ?? ''}
          onChange={(e) => setIsolated(e.target.value || null)}
          aria-label="Isolate a subdomain"
        >
          <option value="">Isolate: none</option>
          {estate.subdomains.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className={`graphwrap${panelOpen ? ' panel-open' : ''}${inStory && (scene.blank || !sceneReady) ? ' canvas-hidden' : ''}`}>
        <Graph3D
          data={data}
          dark={dark}
          showHulls={showHulls}
          labelMode={labelMode}
          selectedId={selectedId}
          isolatedSubdomain={isolated}
          flyToId={flyTo}
          onSettle={onSettle}
          dimNodes={inStory ? storySets.dim : undefined}
          hideLinksOf={inStory ? hideSet : undefined}
          dimHulls={inStory ? storySets.hulls : undefined}
          callout={callout}
          gestureHint={gestureHint}
          pokes={pokes}
          preferLines={inStory}
          onGesture={() => { markGesture(); setTimeout(() => setDragged(true), 700) }}
          book={book}
          focus={inStory ? playProps?.focus ?? storyFocus : walk ? walkFocus : null}
          quietLabels={quietLabels}
          hideLabels={inStory && !scene.labels}
          layer={inStory ? scene.layer : null}
          sprout={playProps?.sprout ?? null}
          pop={playProps?.pop ?? null}
          pins={playProps?.pins ?? null}
          {...(playProps && 'wave' in playProps ? { failedNodeId: playProps.failedNodeId, affectedUseCases: playProps.affectedUseCases, litLinks: playProps.litLinks, wave: playProps.wave } : {})}
          selectedLink={inStory ? null : selectedLink}
          flow={flow}
          reducedMotion={reduced}
          stagger={inStory && scene.stagger}
          onSelectNode={(id) => {
            if (inStory) { if (ix.useCaseById.has(id)) setPoked('useCases'); else if (ix.platformById.has(id)) { setPoked('platforms'); if (ix.platformById.get(id)?.type === 'integration') setPoked('connectors') } setFocus({ kind: 'node', id }); setSelectedId(id); return }
            setHullPop(null); setSelectedLink(null); setSelectedId(id); setCollapsed(false); if (walk && walk !== id) setWalk(null)
          }}
          onSelectLink={(l) => { if (inStory) { setPoked('lines'); setPoked('flow'); setFocus({ kind: 'link', ucId: l.ucId, platformId: l.platformId }); return } setHullPop(null); setSelectedId(null); setWalk(null); setSelectedLink(l); setCollapsed(false) }}
          // Leaving the node ends its walkthrough too, so the panel and the
          // card never describe two different things.
          onBackground={() => { if (inStory) { setFocus(null); return } setHullPop(null); setSelectedId(null); setSelectedLink(null); setWalk(null) }}
          // A coloured shape is a domain. In the story it names itself on the
          // card; afterwards it explains itself in a pop-up where it was tapped.
          onSelectHull={(sub) => {
            if (inStory) { nameDomain(sub); setFocus({ kind: 'hull', id: sub }); setSelectedId(null); return }
            setHullPop((cur) => (cur === sub ? null : sub))
          }}
          popover={inStory && scene.badge && selectedId ? {
            kind: 'node',
            id: selectedId,
            content: scene.badge === 'meter' ? <MeterBadge ix={ix} id={selectedId} reduced={reduced} /> : <PoolBadge ix={ix} id={selectedId} />,
          } : !inStory && hullPop ? {
            kind: 'hull',
            id: hullPop,
            content: (() => {
              const v = describeSubdomain(ix, hullPop)
              return (
                <>
                  <div className="popover-head">
                    <span className="intro-swatch" style={{ background: SUBDOMAIN_COLOUR[hullPop] }} />
                    <strong>{String(v.name)}</strong>
                    <button type="button" className="popover-close" aria-label="Close" onClick={() => setHullPop(null)}>×</button>
                  </div>
                  {[copy.desc_sd_what, copy.desc_sd_count, copy.desc_sd_shared].map((t) => <p key={t}>{fill(t, v)}</p>)}
                </>
              )
            })(),
          } : null}
        />

        <Legend>
          {flow && (
            <div className="flow-legend">
              <div className="flow-head">{copy.flow_legend_head}</div>
              <div className="flow-bar" />
              <div className="flow-ends"><span>{copy.flow_cool}</span><span>{copy.flow_mid}</span><span>{copy.flow_warm}</span></div>
              <div className="flow-note">{copy.flow_width}</div>
              <div className="flow-note">{fill(copy.flow_declared, { owner: estate.provenance.value_flags_owner, date: estate.provenance.value_flags_declared })}</div>
            </div>
          )}
          <div><span className="glyph">O</span> platform, size is <Term k="fan_in" /></div>
          <div><span className="glyph" style={{ color: CONNECTOR }}>&#9670;</span> <Term k="integration_node" /></div>
          <div><span className="glyph">.</span> use case, coloured by subdomain</div>
          <div style={{ marginTop: 4, opacity: 0.85 }}>{copy.ex_hulls}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
            {estate.subdomains.map((s) => (
              <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: 2,
                  background: SUBDOMAIN_COLOUR[s.id], display: 'inline-block',
                }} />
                <span style={{ fontSize: 10 }}>{s.name}</span>
              </span>
            ))}
          </div>
        </Legend>


        <DetailPanel
          estate={estate}
          ix={ix}
          rule={rule}
          selectedNodeId={selectedId}
          selectedLink={selectedLink}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
          onClose={() => { setSelectedId(null); setSelectedLink(null); setWalk(null) }}
          onSelectNode={pick}
          onPlay={selectedId ? () => { setWalk(selectedId); setWalkStep(0); setFlyTo(selectedId) } : undefined}
          reveal={!inStory && walk === selectedId ? reveal : undefined}
          walk={!inStory && walk && walk === selectedId && (ix.platformById.has(walk) || ix.useCaseById.has(walk))
            ? <Walkthrough ix={ix} rule={rule} id={walk} step={walkStep} onStep={setWalkStep} onFocus={onWalkFocus} onClose={() => setWalk(null)} />
            : undefined}
        />
      </div>
    </>
  )
}
