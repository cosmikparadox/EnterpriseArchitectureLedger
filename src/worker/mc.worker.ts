// Web Worker wrapper. Spec section 2: the Monte Carlo runs in a worker so the
// 3D view keeps its frame rate while 10,000 or 100,000 runs are in flight.
// The worker holds all the arithmetic and none of the interface.

import { simulate, type McRequest, type McResult } from '../model/montecarlo'

self.onmessage = (ev: MessageEvent<McRequest & { requestId: number }>) => {
  const { requestId, ...req } = ev.data
  const result: McResult = simulate(req)
  ;(self as unknown as Worker).postMessage({ requestId, result })
}
