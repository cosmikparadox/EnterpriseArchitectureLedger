// View 1, Explore. Spec section 4.1.

import { useCallback, useMemo, useState } from 'react'
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
import { MeterBadge, PoolBadge } from '../story/Badges'
import { Walkthrough, revealFor, type Focus } from './Walkthrough'
import { platformView, useCaseView } from '../app/graph'
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
  const gestureHint = inStory && scene.hint && !dragged ? copy.canvas_gesture : null
  // The book's rows are read off the graph for whatever node is tapped: a
  // platform's meter, pool, riders and execution work; a use case's bill,
  // what it stops with, and what strands it.
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
      const uv = useCaseView(ix, selectedId, rule)
      name = String(d.name)
      values = [
        fill(copy.book_v_cost_u, { reported: String(d.reported) }),
        fill(copy.book_v_risk_u, { worst: String(d.worst) }),
        fill(copy.book_v_exit_u, { stranded: uv.strandedBy.length > 0 ? uv.strandedBy.join(' or ') : copy.walk_u_none }),
      ]
    } else return null
    return {
      id: selectedId,
      title: fill(copy.book_title, { name }),
      rows: [copy.book_row_1, copy.book_row_2, copy.book_row_3].map((label, i) => ({ label, value: values![i] })),
      note: copy.book_note,
    }
  }, [inStory, scene.book, selectedId, ix, rule])
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
          hideLinksOf={inStory ? storySets.hide : undefined}
          dimHulls={inStory ? storySets.hulls : undefined}
          callout={callout}
          gestureHint={gestureHint}
          onGesture={() => { markGesture(); setTimeout(() => setDragged(true), 700) }}
          book={book}
          focus={!inStory && walk ? walkFocus : null}
          flow={flow}
          reducedMotion={reduced}
          stagger={inStory && scene.stagger}
          onSelectNode={(id) => {
            if (inStory) { setFocus({ kind: 'node', id }); setSelectedId(id); return }
            setHullPop(null); setSelectedLink(null); setSelectedId(id); setCollapsed(false); if (walk && walk !== id) setWalk(null)
          }}
          onSelectLink={(l) => { if (inStory) { setFocus({ kind: 'link', ucId: l.ucId, platformId: l.platformId }); return } setHullPop(null); setSelectedId(null); setSelectedLink(l); setCollapsed(false) }}
          onBackground={() => { if (inStory) { setFocus(null); return } setHullPop(null); setSelectedId(null); setSelectedLink(null) }}
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
          <div style={{ marginTop: 4, opacity: 0.85 }}>
            Hulls overlap where platforms are shared. The overlap is the point.
          </div>
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
        />
        {!inStory && walk && (ix.platformById.has(walk) || ix.useCaseById.has(walk)) && (
          <Walkthrough ix={ix} rule={rule} id={walk} step={walkStep} onStep={setWalkStep} onFocus={onWalkFocus} onClose={() => setWalk(null)} />
        )}
      </div>
    </>
  )
}
