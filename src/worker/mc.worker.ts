// Web Worker wrapper. Spec section 2: the Monte Carlo runs in a worker so the
// 3D view keeps its frame rate while 10,000 or 100,000 runs are in flight.
// The worker holds all the arithmetic and none of the interface.

import { simulate, type McRequest, type McResult } from '../model/montecarlo'

type Incoming = (McRequest & { requestId: number }) | { ping: true }

self.onmessage = (ev: MessageEvent<Incoming>) => {
  // Liveness handshake. The hook sends a ping on startup and treats silence as
  // a blocked worker. Answering here, before any simulation, is what tells a
  // slow run apart from a worker that was never allowed to start.
  if ('ping' in ev.data) {
    ;(self as unknown as Worker).postMessage({ pong: true })
    return
  }
  const { requestId, ...req } = ev.data
  const result: McResult = simulate(req)
  ;(self as unknown as Worker).postMessage({ requestId, result })
}
