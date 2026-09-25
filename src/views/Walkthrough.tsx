// The walkthrough: one node, a few steps, the story's rhythm, inside the panel.
//
// Outside the story a tapped node shows everything at once on the panel.
// This is the other way in: a play button, and the same figures arrive one
// step at a time, each with the canvas focused on what the step is about.
// Every sentence is assembled from the data; nothing here says why a vendor
// was chosen, because the estate has no decision record and the ledger
// would refuse to invent one.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { copy, fill } from '../copy'
import { describePlatform, describeUseCase } from '../model/describe'
import { leavingFor, platformView } from '../app/graph'
import { useLedger } from '../app/store'
import { gbpAbout, type Index } from '../model/ledger'
import type { AllocationRule } from '../model/types'

type CopyMap = Record<string, string>
export interface Focus { nodes: Set<string> }

export const P_STEPS = ['what', 'runs', 'billed', 'stops', 'leaving', 'when'] as const
export const U_STEPS = ['what', 'rides', 'told', 'exit'] as const
/** Which panel sections each step has earned, cumulatively, so the panel discloses as the walk goes. */
export const P_REVEAL: Record<(typeof P_STEPS)[number], string[]> = { what: ['summary'], runs: ['riders'], billed: ['metered'], stops: ['failure'], leaving: ['switching'], when: ['adopted'] }
export const U_REVEAL: Record<(typeof U_STEPS)[number], string[]> = { what: ['summary', 'volume'], rides: ['platforms'], told: ['cost'], exit: ['exit'] }
export function revealFor(isPlatform: boolean, step: number): string[] {
  const steps: readonly string[] = isPlatform ? P_STEPS : U_STEPS
  const map = (isPlatform ? P_REVEAL : U_REVEAL) as Record<string, string[]>
  return steps.slice(0, step + 1).flatMap((k) => map[k] ?? [])
}

export interface WalkthroughProps {
  ix: Index
  rule: AllocationRule
  id: string
  step: number
  onStep: (n: number) => void
  onFocus: (f: Focus | null) => void
  onClose: () => void
}

export function Walkthrough({ ix, rule, id, step, onStep, onFocus, onClose }: WalkthroughProps) {
  const c = copy as unknown as CopyMap
  const ratified = useLedger((s) => s.ratified)
  const setStep = (f: number | ((s: number) => number)) => onStep(typeof f === 'function' ? f(step) : f)
  const isPlatform = ix.platformById.has(id)
  const steps: readonly string[] = isPlatform ? P_STEPS : U_STEPS
  const key = steps[step] ?? steps[0]!

  const values = useMemo<Record<string, string | number>>(() => {
    if (isPlatform) {
      const d = describePlatform(ix, id, rule)
      const v = platformView(ix, id, rule, 60 - ix.platformById.get(id)!.adopted_month)
      return {
        ...d,
        lef: v.lef.toFixed(1),
        loss: Math.round(v.lossMedian).toLocaleString('en-GB'),
        exec: gbpAbout(v.workOfLeaving),
        adopted: v.adoptedMonth,
        ratified,
      }
    }
    const d = describeUseCase(ix, id, rule)
    const u = ix.useCaseById.get(id)!
    const names = u.edges.map((e) => ix.platformById.get(e.platform_id)?.name ?? e.platform_id)
    const leaving = leavingFor(ix, id)
    return { ...d, n_pf: u.edges.length, pf_list: names.join(', '), platform: leaving?.name ?? '', exec: leaving ? gbpAbout(leaving.exec) : '', riders: leaving?.riders ?? 0 }
  }, [ix, id, rule, isPlatform, ratified])

  // What the canvas shows for each step.
  useEffect(() => {
    if (isPlatform) {
      const riders = (ix.ridersOf.get(id) ?? []).map((r) => r.uc.id)
      if (key === 'runs' || key === 'stops') onFocus({ nodes: new Set([id, ...riders]) })
      else onFocus({ nodes: new Set([id]) })
    } else {
      const u = ix.useCaseById.get(id)!
      if (key === 'rides' || key === 'exit' || key === 'told') onFocus({ nodes: new Set([id, ...u.edges.map((e) => e.platform_id)]) })
      else onFocus({ nodes: new Set([id]) })
    }
    return () => onFocus(null)
  }, [ix, id, key, isPlatform, onFocus])

  // The walk sits in the panel, where the play button was, so the panel is
  // one explainer: the step says it, the sections below disclose as it goes.
  // It never floats over the map.
  const boxRef = useRef<HTMLElement | null>(null)
  useEffect(() => { boxRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [step])
  const stem = isPlatform ? `walk_p_${key}` : `walk_u_${key}`
  return (
    <section ref={boxRef} className="walk-inline" aria-label={copy.walk_label} aria-live="polite">
      <div className="walk-top">
        <span className="walk-step">{fill(copy.walk_step, { k: step + 1, n: steps.length })}</span>
        <button type="button" className="tour-skip" onClick={onClose}>{copy.walk_close}</button>
      </div>
      <h3 key={key}>{c[`${stem}_h`]}</h3>
      <p key={`${key}-l`}>{fill(c[stem] ?? '', values)}</p>
      <div className="walk-actions">
        <button className="ctl" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>{copy.story_back}</button>
        {step < steps.length - 1
          ? <button className="cta" onClick={() => setStep((s) => s + 1)}>{copy.story_next}</button>
          : <button className="cta" onClick={onClose}>{copy.walk_close}</button>}
        <div className="walk-dots" aria-hidden="true">{steps.map((st, i) => <span key={st} className={i <= step ? 'on' : ''} />)}</div>
      </div>
    </section>
  )
}

/**
 * A walkthrough's state for any screen with a selected node: which node is
 * being walked, the step, and what the canvas should focus on. The screen
 * offers the play button and renders the card; this keeps the rest.
 */
export function useWalk(selected: string | null) {
  const [walk, setWalk] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [focus, setFocus] = useState<Focus | null>(null)
  const onFocus = useCallback((f: Focus | null) => setFocus(f), [])
  // Choosing another node ends the walk on the old one.
  useEffect(() => { if (walk && walk !== selected) { setWalk(null); setFocus(null) } }, [selected, walk])
  return {
    walk, step, setStep, onFocus,
    focus: walk ? focus : null,
    start: (id: string) => { setWalk(id); setStep(0) },
    stop: () => { setWalk(null); setFocus(null) },
  }
}
