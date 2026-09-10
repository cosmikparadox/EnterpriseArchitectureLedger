// Runs the Monte Carlo in a Web Worker and hands back the latest result.
//
// The worker is imported with ?worker&inline so it is embedded in the bundle as
// a blob rather than fetched as a separate file. That keeps the single-file
// build genuinely single-file, and keeps the promise in spec section 2 that the
// tool makes no network calls at runtime and works offline from one folder.

import { useEffect, useRef, useState } from 'react'
import McWorker from '../worker/mc.worker.ts?worker&inline'
import type { McRequest, McResult } from '../model/montecarlo'
import type { Estate } from '../model/types'

export interface McState {
  result: McResult | null
  running: boolean
  /** Wall time of the last completed run, milliseconds. */
  elapsedMs: number
}

export function useMonteCarlo(estate: Estate, rho: number, runs: number, nu = 4, seed = 20260905): McState {
  const worker = useRef<Worker | null>(null)
  const nextId = useRef(0)
  const pending = useRef<number | null>(null)
  const [state, setState] = useState<McState>({ result: null, running: true, elapsedMs: 0 })

  useEffect(() => {
    const w = new McWorker()
    worker.current = w
    w.onmessage = (ev: MessageEvent<{ requestId: number; result: McResult }>) => {
      if (ev.data.requestId !== pending.current) return
      setState({ result: ev.data.result, running: false, elapsedMs: ev.data.result.elapsedMs })
    }
    return () => { w.terminate(); worker.current = null }
  }, [])

  useEffect(() => {
    const w = worker.current
    if (!w) return
    setState((s) => ({ ...s, running: true }))
    // Coalesce slider drags: only the last request in a burst is sent.
    const t = setTimeout(() => {
      const id = ++nextId.current
      pending.current = id
      const req: McRequest & { requestId: number } = { requestId: id, estate, rho, nu, runs, seed }
      w.postMessage(req)
    }, 90)
    return () => clearTimeout(t)
  }, [estate, rho, runs, nu, seed])

  return state
}
