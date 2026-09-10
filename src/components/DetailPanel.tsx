// The detail panel. Spec section 5. One component for every node type, with
// sections shown or hidden by type.

import { useMemo } from 'react'
import { copy } from '../copy'
import type { AllocationRule, Estate } from '../model/types'
import { makeOptionEngine, optionComponent, wCurve, type Index } from '../model/ledger'
import { makeRng } from '../model/rng'
import { platformView, useCaseView, type GLink } from '../app/graph'
import { WKCurve } from './WKCurve'
import { PanelShell } from './PanelShell'

/** The estate is observed at month 60, the end of the view 4 window. */
export const AS_AT_MONTH = 60

export const gbp = (n: number, dp = 0) =>
  'GBP ' + n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp })

const pct = (n: number, dp = 0) => (n * 100).toFixed(dp) + ' percent'

function Row({ l, v }: { l: string; v: string }) {
  return <div className="row"><span className="l">{l}</span><span className="v">{v}</span></div>
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
}

export function DetailPanel(props: DetailPanelProps) {
  const { ix, rule, selectedNodeId, selectedLink } = props
  const isPlatform = selectedNodeId !== null && ix.platformById.has(selectedNodeId)
  const isUseCase = selectedNodeId !== null && ix.useCaseById.has(selectedNodeId)

  const option = useMemo(() => {
    if (!isPlatform || !selectedNodeId) return null
    const p = ix.platformById.get(selectedNodeId)!
    const riders = ix.ridersOf.get(p.id)!.length
    const months = AS_AT_MONTH - p.adopted_month
    // Canon 9.5.5. A fixed seed per node so the figure is stable across opens.
    const w = makeOptionEngine(p, ix.estate.option_model, makeRng(0x0071_0000 ^ hash(p.id)))
    return {
      value: optionComponent(w, p, riders, months),
      curve: wCurve(w, p, riders, months),
    }
  }, [ix, isPlatform, selectedNodeId])

  if (selectedLink) return <LinkPanel {...props} link={selectedLink} />
  if (!selectedNodeId) return null

  if (isPlatform) {
    const v = platformView(ix, selectedNodeId, rule, AS_AT_MONTH - ix.platformById.get(selectedNodeId)!.adopted_month)
    return (
      <PanelShell label="Node detail" collapsed={props.collapsed} onToggle={props.onToggleCollapsed} tabHint={v.name}>
        <h2>{v.name}</h2>
        <div className="kind">{v.category}, {v.kind === 'integration' ? 'integration node' : 'platform'}</div>

        {v.kind === 'integration' && <div className="callout">{copy.integration_note}</div>}

        <section>
          <h3>Metered</h3>
          <Row l="Fixed pool" v={gbp(v.fixedPool) + ' /month'} />
          <Row l="Driver" v={v.driverName} />
          <Row l="Unit cost" v={gbp(v.unitCost, 4)} />
          <Row l="Metered spend" v={gbp(v.meteredSpend) + ' /month'} />
          <div className="note">{v.capacityNote}</div>
        </section>

        <section>
          <h3>Riders and the rule</h3>
          <Row l="Use cases riding" v={String(v.riders)} />
          <Row l="Subdomains" v={String(v.subdomains)} />
          <Row l="Allocated by rule" v={gbp(v.ruleShareTotal) + ' /month'} />
          <Row l="Rule share of reported cost" v={pct(v.c1, 1)} />
          <div className="callout">{copy.fixed_share_warning}</div>
        </section>

        <section>
          <h3>Failure and blast radius</h3>
          <Row l="Loss events per year" v={v.lef.toFixed(2)} />
          <Row l="Direct loss, median" v={gbp(v.lossMedian)} />
          <Row l="Direct loss, P90" v={gbp(v.lossP90)} />
          <Row l="Use cases affected" v={String(v.blastUseCases)} />
          <Row l="Subdomains crossed" v={String(v.blastSubdomains)} />
          <Row l="Volume at risk" v={Math.round(v.blastVolume).toLocaleString('en-GB') + ' /month'} />
        </section>

        <section>
          <h3>Switching cost</h3>
          <div className="note">{copy.switching_split}</div>
          <Row l="Execution component" v={gbp(v.executionComponent)} />
          <div className="note">
            What it costs to actually move: migration effort, dual running, retraining.
          </div>
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
      </PanelShell>
    )
  }

  if (isUseCase) {
    const v = useCaseView(ix, selectedNodeId, rule)
    return (
      <PanelShell label="Node detail" collapsed={props.collapsed} onToggle={props.onToggleCollapsed} tabHint={v.name}>
        <h2>{v.name}</h2>
        <div className="kind">{v.subdomainName}, use case</div>

        <section>
          <h3>Volume</h3>
          <Row l="Business volume" v={v.volume.toLocaleString('en-GB') + ' /month'} />
        </section>

        <section>
          <h3>Cost per unit</h3>
          <Row l="Metered part, exact" v={gbp(v.meteredPerUnit, 3)} />
          <Row l="Under the current rule" v={gbp(v.perUnitCurrent, 3)} />
          <Row l="Range across all rules" v={`${gbp(v.perUnitLow, 3)} to ${gbp(v.perUnitHigh, 3)}`} />
          <div className="callout">
            The spread across allocation rules is the honest number. The metered part is
            observed. The rest is a rule.
          </div>
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

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
