// Runs the Monte Carlo in a Web Worker and hands back the latest result.
//
// The worker is imported with ?worker&inline so it is embedded in the bundle as
// a blob rather than fetched as a separate file. That keeps the single-file
// build genuinely single-file, and keeps the promise in spec section 2 that the
// tool makes no network calls at runtime and works offline from one folder.
//
// That same inlining is what makes the fallback necessary. Opened from a file://
// URL, a browser will refuse to start a module worker from a blob and will log
// nothing at all when it does so. Without a fallback views 3 and 5 sit on a
// spinner forever with a clean console. So the hook pings the worker once on
// startup, and if no answer comes back inside HANDSHAKE_MS it stops asking and
// serves the precomputed frames baked in by npm run generate, snapped to the
// nearest stored rho. The caller is told, through offline and snappedRho, so the
// screen can say the slider is no longer moving a live run.

import { useEffect, useRef, useState } from 'react'
import McWorker from '../worker/mc.worker.ts?worker&inline'
import precomputedRaw from '../../data/precomputed.json?raw'
import type { McRequest, McResult } from '../model/montecarlo'
import { nearestFrame, unpackFrame, type PrecomputedIndex } from '../model/precomputed'
import type { Estate } from '../model/types'

// Imported as text, not as JSON. Importing it as JSON makes the bundler emit
// 145 KB of object literals that every visitor's engine parses on startup, for
// data almost nobody needs. As a string it costs nothing until the worker has
// actually failed, and JSON.parse is then faster than the literal would have
// been. Acceptance check 1 is a 3 second cold start, and the eager form missed it.
let precomputedCache: PrecomputedIndex | null = null
function precomputedIndex(): PrecomputedIndex {
  if (!precomputedCache) precomputedCache = JSON.parse(precomputedRaw) as PrecomputedIndex
  return precomputedCache
}

/** How long to wait for the worker to answer a ping before giving up on it. */
const HANDSHAKE_MS = 2500

/**
 * Results already computed, keyed by the arguments that produced them.
 *
 * Two things ask for the same run: the view on screen, and the tour card, which
 * has to quote a live figure in a sentence. Without this they would each start a
 * worker and each pay for the same 10,000 runs. The simulation is deterministic
 * in its seed, so a result for a given set of arguments is the same result
 * whoever asked for it.
 *
 * Bounded because the dependence slider steps in twentieths and a long session
 * would otherwise keep every run it ever made.
 */
const CACHE_LIMIT = 64
const cache = new Map<string, McResult>()

function cacheKey(estate: Estate, rho: number, runs: number, nu: number, seed: number): string {
  return `${estate.provenance.graph_version}|${rho}|${runs}|${nu}|${seed}`
}

function remember(key: string, result: McResult): void {
  cache.delete(key)
  cache.set(key, result)
  while (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
}

export interface McState {
  result: McResult | null
  running: boolean
  /** Wall time of the last completed run, milliseconds. Zero when offline. */
  elapsedMs: number
  /** True when the worker never started and these figures came off the shelf. */
  offline: boolean
  /** The stored rho the slider snapped to. Null while the worker is alive. */
  snappedRho: number | null
}

export function useMonteCarlo(estate: Estate, rho: number, runs: number, nu = 4, seed = 20260905): McState {
  const worker = useRef<Worker | null>(null)
  const nextId = useRef(0)
  const pending = useRef<number | null>(null)
  // The key the in-flight request was made under, so the answer is filed where
  // the next asker will look for it.
  const pendingKey = useRef('')
  const [workerOk, setWorkerOk] = useState<boolean | null>(null)
  const [state, setState] = useState<McState>({
    result: null, running: true, elapsedMs: 0, offline: false, snappedRho: null,
  })

  useEffect(() => {
    let w: Worker
    try {
      w = new McWorker()
    } catch {
      // Construction itself can throw where workers are disallowed outright.
      setWorkerOk(false)
      return
    }
    worker.current = w
    const timer = setTimeout(() => setWorkerOk((ok) => (ok === null ? false : ok)), HANDSHAKE_MS)
    w.onerror = () => setWorkerOk(false)
    w.onmessage = (ev: MessageEvent<{ pong?: true; requestId?: number; result?: McResult }>) => {
      if (ev.data.pong) { clearTimeout(timer); setWorkerOk(true); return }
      if (ev.data.requestId !== pending.current || !ev.data.result) return
      const result = ev.data.result
      remember(pendingKey.current, result)
      setState({ result, running: false, elapsedMs: result.elapsedMs, offline: false, snappedRho: null })
    }
    w.postMessage({ ping: true })
    return () => { clearTimeout(timer); w.terminate(); worker.current = null }
  }, [])


  useEffect(() => {
    if (workerOk !== true) return
    const w = worker.current
    if (!w) return
    const key = cacheKey(estate, rho, runs, nu, seed)
    const hit = cache.get(key)
    if (hit) {
      setState({ result: hit, running: false, elapsedMs: hit.elapsedMs, offline: false, snappedRho: null })
      return
    }
    setState((s) => ({ ...s, running: true }))
    // Coalesce slider drags: only the last request in a burst is sent.
    const t = setTimeout(() => {
      const id = ++nextId.current
      pending.current = id
      pendingKey.current = key
      const req: McRequest & { requestId: number } = { requestId: id, estate, rho, nu, runs, seed }
      w.postMessage(req)
    }, 90)
    return () => clearTimeout(t)
  }, [workerOk, estate, rho, runs, nu, seed])

  useEffect(() => {
    if (workerOk !== false) return
    // The stored set is chosen by the provenance version rather than by label,
    // so a renamed estate cannot silently pick up the wrong frames.
    const set = precomputedIndex()[estate.provenance.graph_version]
    if (!set) { setState((s) => ({ ...s, running: false })); return }
    const frame = nearestFrame(set, rho)
    setState({
      result: unpackFrame(set, frame),
      running: false,
      elapsedMs: 0,
      offline: true,
      snappedRho: frame.rho,
    })
  }, [workerOk, estate, rho])

  return state
}

/**
 * A figure some screen quotes without running its own worker: the live run
 * at this dependence if one has landed, otherwise the stored frame at the
 * nearest fixed point. Never a placeholder. At the five fixed points the
 * two are the same run, so the story and the prologue agree.
 */
export function resultFor(estate: Estate, rho: number, runs = 10_000, nu = 4, seed = 20260905): McResult | null {
  const hit = cache.get(cacheKey(estate, rho, runs, nu, seed))
  if (hit) return hit
  return storedFrame(estate, rho)
}

/** The stored frame at the fixed point nearest this dependence. */
export function storedFrame(estate: Estate, rho: number): McResult | null {
  const set = precomputedIndex()[estate.provenance.graph_version]
  return set ? unpackFrame(set, nearestFrame(set, rho)) : null
}

/** The stored frames at all five fixed points, in order of dependence. */
export function storedFrames(estate: Estate): McResult[] {
  const set = precomputedIndex()[estate.provenance.graph_version]
  return set ? set.frames.map((f) => unpackFrame(set, f)).sort((a, b) => a.rho - b.rho) : []
}

/**
 * A domain's two bad-month figures at the five fixed points of dependence,
 * read from the stored runs, with the range each spans. The same on every
 * device and on every call, whatever the live runs are doing.
 */
export function fixedPointRange(estate: Estate, subdomain: string): FixedPointRange | null {
  const points = storedFrames(estate).map((f) => {
    const s = f.subdomains.find((x) => x.id === subdomain)
    return s ? { rho: f.rho, sum: s.sumOfP99s, joint: s.jointP99 } : null
  }).filter((x): x is FixedPoint => x !== null)
  if (points.length === 0) return null
  const sums = points.map((x) => x.sum), joints = points.map((x) => x.joint)
  return { points, sumLo: Math.min(...sums), sumHi: Math.max(...sums), jointLo: Math.min(...joints), jointHi: Math.max(...joints) }
}
export interface FixedPoint { rho: number; sum: number; joint: number }
export interface FixedPointRange { points: FixedPoint[]; sumLo: number; sumHi: number; jointLo: number; jointHi: number }
