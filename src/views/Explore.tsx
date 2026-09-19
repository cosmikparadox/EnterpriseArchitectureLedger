// View 1, Explore. Spec section 4.1.

import { useMemo, useState } from 'react'
import { Graph3D, type LabelMode } from '../components/Graph3D'
import { Term, ViewName } from '../components/Hint'
import { Legend } from '../components/Legend'
import { DetailPanel } from '../components/DetailPanel'
import { buildGraph, SUBDOMAIN_COLOUR, type GLink } from '../app/graph'
import type { AllocationRule, Estate } from '../model/types'
import type { Index } from '../model/ledger'
import { useLedger } from '../app/store'
import { IntroCard, useIntro } from '../tour/Intro'
import { usePrefersReducedMotion } from '../app/useNarrow'
import { describeSubdomain } from '../model/describe'
import { copy, fill } from '../copy'
import { useLayoutReport } from '../app/layoutReport'

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
  // The panel is always present now, opening on the estate summary when
  // nothing is picked, so the canvas yields to it whenever it is not collapsed.
  const panelOpen = !collapsed
  const onSettle = useLayoutReport()
  const reduced = usePrefersReducedMotion()
  const intro = useIntro(estate, ix)
  // Outside the intro a tapped domain explains itself in a pop-up on the
  // canvas, with the same lines the intro's legend gave it.
  const [hullPop, setHullPop] = useState<string | null>(null)

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

      <div className={`graphwrap${panelOpen ? ' panel-open' : ''}`}>
        <Graph3D
          data={data}
          dark={dark}
          showHulls={showHulls}
          labelMode={labelMode}
          selectedId={selectedId}
          isolatedSubdomain={isolated}
          flyToId={flyTo}
          onSettle={onSettle}
          dimNodes={intro.active ? intro.dimNodes : undefined}
          hideLinksOf={intro.active ? intro.hideLinksOf : undefined}
          dimHulls={intro.active ? intro.dimHulls : undefined}
          callout={intro.active ? intro.callout : null}
          reducedMotion={reduced}
          onSelectNode={(id) => {
            if (intro.active) { intro.tapNode(id); return }
            setHullPop(null); setSelectedLink(null); setSelectedId(id); setCollapsed(false)
          }}
          onSelectLink={(l) => { if (intro.active) return; setSelectedId(null); setSelectedLink(l); setCollapsed(false) }}
          onBackground={() => { if (intro.active) { intro.clearFocus(); return } setHullPop(null); setSelectedId(null); setSelectedLink(null) }}
          // A coloured shape is a domain. In the intro it names itself on the
          // card; afterwards it explains itself in a pop-up where it was tapped.
          onSelectHull={(sub) => {
            if (intro.active) { intro.tapSub(sub); return }
            setHullPop((cur) => (cur === sub ? null : sub))
          }}
          popover={!intro.active && hullPop ? {
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
          <div><span className="glyph">O</span> platform, size is <Term k="fan_in" /></div>
          <div><span className="glyph">&#9670;</span> <Term k="integration_node" /></div>
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

        {intro.active && (
          <div className={`wordmark${intro.beat > 0 ? ' wordmark-top' : ''}${intro.leaving ? ' wordmark-leaving' : ''}`} aria-hidden="true">
            <div className="wordmark-name">{copy.wordmark_name}</div>
            <div className="wordmark-tag">{copy.wordmark_tag}</div>
          </div>
        )}
        {intro.active && <IntroCard intro={intro} estate={estate} ix={ix} />}

        <DetailPanel
          estate={estate}
          ix={ix}
          rule={rule}
          selectedNodeId={selectedId}
          selectedLink={selectedLink}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
          onClose={() => { setSelectedId(null); setSelectedLink(null) }}
          onSelectNode={pick}
        />
      </div>
    </>
  )
}
