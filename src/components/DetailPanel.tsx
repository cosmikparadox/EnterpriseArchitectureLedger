// The detail panel. Spec section 5. One component for every node type, with
// sections shown or hidden by type.

import { useMemo } from 'react'
import { copy, summary, type GlossaryKey } from '../copy'
import { Summary } from './Summary'
import { Term } from './Hint'
import type { AllocationRule, Estate } from '../model/types'
import { c1, edgeSpend, optionComponent, optionEngineFor, reportedCost, wCurve, type Index } from '../model/ledger'
import { platformView, useCaseView, type GLink } from '../app/graph'
import { WKCurve } from './WKCurve'
import { PanelShell } from './PanelShell'

/** The estate is observed at month 60, the end of the view 4 window. */
export const AS_AT_MONTH = 60

// One formatter per precision. toLocaleString builds an Intl object on every
// call, and a slider step formats a few hundred figures.
const FORMATS = new Map<number, Intl.NumberFormat>()
export const gbp = (n: number, dp = 0) => {
  let f = FORMATS.get(dp)
  if (!f) { f = new Intl.NumberFormat('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp }); FORMATS.set(dp, f) }
  return 'GBP ' + f.format(n)
}

const pct = (n: number, dp = 0) => (n * 100).toFixed(dp) + ' percent'

/** A label and a figure. Pass k to make the label an explainable term. */
function Row({ l, v, k }: { l: string; v: string; k?: GlossaryKey }) {
  return (
    <div className="row">
      <span className="l">{k ? <Term k={k}>{l}</Term> : l}</span>
      <span className="v">{v}</span>
    </div>
  )
}

export interface DetailPanelProps {
  estate: Estate
  ix: Index
  rule: AllocationRule
  selectedNodeId: string | null
  selectedLink: GLink | null
  collapsed: boolean
  onToggleCollapsed: () => void
  onClose: () => void
  onSelectNode: (id: string) => void
  /** Start the walkthrough of the selected node, when there is one. */
  onPlay?: () => void
}

export function DetailPanel(props: DetailPanelProps) {
  const { ix, rule, selectedNodeId, selectedLink } = props
  // Outside the story the panel shows everything; the story never shows it.
  const tourStep: number | null = null
  const revealed = 'all' as const
  const show = (_k: 'metered' | 'riders' | 'failure' | 'switching') => true
  const isPlatform = selectedNodeId !== null && ix.platformById.has(selectedNodeId)
  const isUseCase = selectedNodeId !== null && ix.useCaseById.has(selectedNodeId)

  const option = useMemo(() => {
    if (!isPlatform || !selectedNodeId) return null
    const p = ix.platformById.get(selectedNodeId)!
    const riders = ix.ridersOf.get(p.id)!.length
    const months = AS_AT_MONTH - p.adopted_month
    // Canon 9.5.5. optionEngineFor owns the seed, so view 1 and view 4 quote the
    // same figure for the same node.
    const w = optionEngineFor(p, ix.estate.option_model)
    return {
      value: optionComponent(w, p, riders, months),
      curve: wCurve(w, p, riders, months),
    }
  }, [ix, isPlatform, selectedNodeId])

  if (selectedLink) return <LinkPanel {...props} link={selectedLink} />

  // Nothing selected: the panel still opens, with the estate read at a glance
  // and no figures. Counts and a range, never a total: canon 9.8.3 forbids
  // one and the summary deck says so on every screen.
  if (!selectedNodeId) {
    const platforms = ix.estate.platforms
    const ridersOf = (id: string) => ix.ridersOf.get(id)?.length ?? 0
    const top = platforms.reduce((a, p) => (ridersOf(p.id) > ridersOf(a.id) ? p : a), platforms[0]!)
    const c1s = platforms.map((p) => c1(ix, p.id) * 100)
    return (
      <PanelShell label="Estate" collapsed={props.collapsed} onToggle={props.onToggleCollapsed} tabHint="Estate">
        <h2>{ix.estate.label}</h2>
        <div className="kind">{platforms.length} platforms, {ix.estate.use_cases.length} use cases</div>
        <Summary
          head={summary.s1_head} number={summary.s1_number} mechanism={summary.s1_mechanism}
          values={{
            n_platforms: platforms.length,
            n_uc: ix.estate.use_cases.length,
            top: top.name,
            top_riders: ridersOf(top.id),
            c1_lo: Math.min(...c1s).toFixed(0),
            c1_hi: Math.max(...c1s).toFixed(0),
          }}
        />
        <div className="note">{copy.intro}</div>
      </PanelShell>
    )
  }

  if (isPlatform) {
    const v = platformView(ix, selectedNodeId, rule, AS_AT_MONTH - ix.platformById.get(selectedNodeId)!.adopted_month)
    return (
      <PanelShell label="Node detail" collapsed={props.collapsed} onToggle={props.onToggleCollapsed} tabHint={v.name}>
        <h2>{v.name}</h2>
        <div className="kind">{v.category}, {v.kind === 'integration' ? 'integration node' : 'platform'}</div>
        {props.onPlay && <button className="ctl play" onClick={props.onPlay}>{copy.walk_play}</button>}
        {/* Chapter 7 shows the name alone; chapter 8 adds the headline once
            "meters" has been taught; the two readings follow the chapters
            that teach their words. */}
        {tourStep !== 7 && (
        <Summary
          head={summary.s1n_head} number={summary.s1n_number} mechanism={summary.s1n_mechanism}
          headOnly={tourStep === 8}
          values={{
            name: v.name,
            metered: Math.round(v.meteredSpend).toLocaleString('en-GB'),
            pool: Math.round(v.fixedPool).toLocaleString('en-GB'),
            riders: v.riders,
            c1: (v.c1 * 100).toFixed(0),
            blast_uc: v.blastUseCases,
            blast_sub: v.blastSubdomains,
          }}
        />
        )}

        {v.kind === 'integration' && revealed === 'all' && <div className="callout">{copy.integration_note}</div>}

        {show('metered') && (
        <section data-tour="metered">
          <h3>{copy.panel_section_metered}</h3>
          <Row k="fixed_pool" l="Fixed pool" v={gbp(v.fixedPool) + ' /month'} />
          <Row l="Driver" v={v.driverName} />
          <Row l="Unit cost" v={gbp(v.unitCost, 4)} />
          <Row k="metered_spend" l="Metered spend" v={gbp(v.meteredSpend) + ' /month'} />
          <div className="note">{v.capacityNote}</div>
        </section>
        )}

        {show('riders') && (
        <section>
          <h3>{copy.panel_section_riders}</h3>
          <Row k="fan_in" l="Use cases riding" v={String(v.riders)} />
          <Row k="subdomain" l="Subdomains" v={String(v.subdomains)} />
          <Row k="rule_share" l={copy.panel_allocated_label} v={gbp(v.ruleShareTotal) + ' /month'} />
          <Row k="c1" l="Rule share of reported cost" v={pct(v.c1, 1)} />
          <div className="callout">{copy.fixed_share_warning}</div>
        </section>
        )}

        {show('failure') && (
        <section>
          <h3>{copy.panel_section_failure}</h3>
          <Row l="Loss events per year" v={v.lef.toFixed(2)} />
          <Row l="Direct loss, median" v={gbp(v.lossMedian)} />
          <Row l="Direct loss, P90" v={gbp(v.lossP90)} />
          <Row l="Use cases affected" v={String(v.blastUseCases)} />
          <Row l="Subdomains crossed" v={String(v.blastSubdomains)} />
          <Row k="blast_radius" l="Volume at risk" v={Math.round(v.blastVolume).toLocaleString('en-GB') + ' /month'} />
        </section>
        )}

        {show('switching') && (
        <section>
          <h3>{copy.panel_section_switching}</h3>
          <div className="note">{copy.switching_split}</div>
          <Row k="execution_component" l="Execution component" v={gbp(v.executionComponent)} />
          <div className="note">{copy.panel_exec_note}</div>
          {option && (
            // Canon 9.5.7 and 9.9. The option component NEVER renders outside
            // this element. The figure and the refusal are one block, so a
            // screenshot cannot separate them.
            <div className="refusal">
              <span className="fig">Option component {gbp(option.value)}</span>
              {copy.option_refusal}
              <div className="note" style={{ marginTop: 6 }}>{copy.option_tip}</div>
              <WKCurve curve={option.curve} />
            </div>
          )}
          <Row l="Adopted" v={'month ' + v.adoptedMonth} />
        </section>
        )}
      </PanelShell>
    )
  }

  if (isUseCase) {
    const v = useCaseView(ix, selectedNodeId, rule)
    return (
      <PanelShell label="Node detail" collapsed={props.collapsed} onToggle={props.onToggleCollapsed} tabHint={v.name}>
        <h2>{v.name}</h2>
        <div className="kind">{v.subdomainName}, use case</div>
        {props.onPlay && <button className="ctl play" onClick={props.onPlay}>{copy.walk_play}</button>}
        <Summary
          head={summary.s1u_head} number={summary.s1u_number} mechanism={summary.s1u_mechanism}
          values={{
            name: v.name,
            n_edges: v.edges.length,
            reported: Math.round(v.edges.reduce((a, e) => a + reportedCost(ix, e.platformId, v.id, rule), 0)).toLocaleString('en-GB'),
            metered: Math.round(v.edges.reduce((a, e) => {
              const u = ix.useCaseById.get(v.id)!
              const edge = u.edges.find((x) => x.platform_id === e.platformId)!
              return a + edgeSpend(u, edge, ix.platformById.get(e.platformId)!)
            }, 0)).toLocaleString('en-GB'),
          }}
        />

        <section>
          <h3>Volume</h3>
          <Row k="volume" l="Business volume" v={v.volume.toLocaleString('en-GB') + ' /month'} />
        </section>

        <section>
          <h3>Cost per unit</h3>
          <Row l="Metered part, exact" v={gbp(v.meteredPerUnit, 3)} />
          <Row l="Under the current rule" v={gbp(v.perUnitCurrent, 3)} />
          <Row l="Range across all rules" v={`${gbp(v.perUnitLow, 3)} to ${gbp(v.perUnitHigh, 3)}`} />
          <div className="callout">{copy.panel_spread_note}</div>
        </section>

        <section>
          <h3>Platforms depended on</h3>
          {v.edges.map((e) => (
            <div className="row" key={e.platformId}>
              <span className="l">
                <button
                  className="ctl"
                  style={{ padding: '1px 6px', marginRight: 4 }}
                  onClick={() => props.onSelectNode(e.platformId)}
                >{e.platformName}</button>
              </span>
              <span className="v">{gbp(e.spend)} /month</span>
            </div>
          ))}
        </section>

        <section>
          <h3>Exit</h3>
          <div className="note">
            {v.strandedBy.length > 0
              ? 'Leaving any of these would strand this use case: ' + v.strandedBy.join(', ') + '.'
              : 'No single platform exit would strand this use case outright.'}
          </div>
        </section>
      </PanelShell>
    )
  }
  return null
}

function LinkPanel({ ix, link, collapsed, onToggleCollapsed, onSelectNode }: DetailPanelProps & { link: GLink }) {
  const p = ix.platformById.get(link.platformId)!
  const u = ix.useCaseById.get(link.ucId)!
  return (
    <PanelShell label="Edge detail" collapsed={collapsed} onToggle={onToggleCollapsed} tabHint={u.name}>
      <h2>{u.name}</h2>
      <div className="kind">edge to {p.name}</div>
      <section>
        <h3>Metered</h3>
        <Row l="Driver" v={p.driver_name} />
        <Row l="Units per volume unit" v={(link.units / Math.max(1, u.volume_per_month)).toFixed(3)} />
        <Row l="Units per month" v={Math.round(link.units).toLocaleString('en-GB')} />
        <Row l="Spend on this edge" v={gbp(link.spend) + ' /month'} />
      </section>
      <section>
        <h3>Propagation</h3>
        <Row l="Conditional failure probability" v={link.cfp.toFixed(3)} />
        <div className="note">
          The probability this use case is unavailable given that {p.name} is unavailable.
        </div>
      </section>
      <section>
        <h3>Open</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="ctl" onClick={() => onSelectNode(u.id)}>{u.name}</button>
          <button className="ctl" onClick={() => onSelectNode(p.id)}>{p.name}</button>
        </div>
      </section>
    </PanelShell>
  )
}
