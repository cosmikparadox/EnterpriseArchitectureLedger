// The fold between the 3D map and the flat one. Audit brief v0.5, section 17.
//
// Pure geometry, no three.js and no DOM, so it is tested on its own:
//
//   canonicalFrame  one frame per estate, from the pinned 3D layout: origin at
//                   the centroid, axes from a principal component analysis,
//                   signs fixed by a written rule so every load agrees.
//   flatten         the flat map is the 3D map projected onto that frame's
//                   x and y, with only the overlaps pulled apart.
//   schedule        when each node starts to fold: the domains one after
//                   another, like panels, and the shared nodes, the creases,
//                   last.
//   cameraBlend     the camera between the two fixed poses: it tilts to
//                   overhead and narrows its field of view while backing off,
//                   so the framed size holds and perspective drains away.

/** A node as the fold sees it. */
export interface FoldNode { id: string; kind: 'platform' | 'integration' | 'use_case'; subdomain?: string; x: number; y: number; z: number; r: number }

/** A right-handed frame: rows are the unit axes, in world coordinates. */
export interface Frame { origin: [number, number, number]; axes: [[number, number, number], [number, number, number], [number, number, number]] }

/**
 * The sign rule, recorded in the README: Sales and Distribution's centroid
 * has negative x, so Sales sits on the left; Claims' centroid has positive y,
 * so Claims sits above the centre. z is x cross y.
 */
export const SIGN_RULE = { left: 'sales', up: 'claims' } as const

/** Eigen-decomposition of a symmetric 3 by 3 matrix by Jacobi rotations. Deterministic. */
function eigSym3(m: number[][]): { values: number[]; vectors: number[][] } {
  const a = m.map((r) => r.slice())
  const v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  for (let sweep = 0; sweep < 50; sweep++) {
    const off = Math.abs(a[0]![1]!) + Math.abs(a[0]![2]!) + Math.abs(a[1]![2]!)
    if (off < 1e-12) break
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]] as const) {
      const apq = a[p]![q]!
      if (Math.abs(apq) < 1e-15) continue
      const theta = (a[q]![q]! - a[p]![p]!) / (2 * apq)
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
      const c = 1 / Math.sqrt(t * t + 1), s = t * c
      for (let k = 0; k < 3; k++) {
        const akp = a[k]![p]!, akq = a[k]![q]!
        a[k]![p] = c * akp - s * akq; a[k]![q] = s * akp + c * akq
      }
      for (let k = 0; k < 3; k++) {
        const apk = a[p]![k]!, aqk = a[q]![k]!
        a[p]![k] = c * apk - s * aqk; a[q]![k] = s * apk + c * aqk
      }
      for (let k = 0; k < 3; k++) {
        const vkp = v[k]![p]!, vkq = v[k]![q]!
        v[k]![p] = c * vkp - s * vkq; v[k]![q] = s * vkp + c * vkq
      }
    }
  }
  // Columns of v are the eigenvectors.
  return { values: [a[0]![0]!, a[1]![1]!, a[2]![2]!], vectors: [0, 1, 2].map((j) => [v[0]![j]!, v[1]![j]!, v[2]![j]!]) }
}

const cross = (a: number[], b: number[]): [number, number, number] => [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!]
const dot = (a: number[], b: number[]) => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!

export function canonicalFrame(nodes: FoldNode[]): Frame {
  const n = Math.max(1, nodes.length)
  const c: [number, number, number] = [0, 0, 0]
  for (const p of nodes) { c[0] += p.x / n; c[1] += p.y / n; c[2] += p.z / n }
  const cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (const p of nodes) {
    const d = [p.x - c[0], p.y - c[1], p.z - c[2]]
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cov[i]![j] = cov[i]![j]! + (d[i]! * d[j]!) / n
  }
  const { values, vectors } = eigSym3(cov)
  const order = [0, 1, 2].sort((i, j) => values[j]! - values[i]! || i - j)
  let e1 = vectors[order[0]!]!, e2 = vectors[order[1]!]!
  const centroidOf = (sub: string) => {
    const m = nodes.filter((p) => p.kind === 'use_case' && p.subdomain === sub)
    if (m.length === 0) return null
    return [m.reduce((a, p) => a + p.x, 0) / m.length - c[0], m.reduce((a, p) => a + p.y, 0) / m.length - c[1], m.reduce((a, p) => a + p.z, 0) / m.length - c[2]]
  }
  const left = centroidOf(SIGN_RULE.left), up = centroidOf(SIGN_RULE.up)
  if (left && dot(left, e1) > 0) e1 = e1.map((x) => -x)
  if (up && dot(up, e2) < 0) e2 = e2.map((x) => -x)
  const e3 = cross(e1, e2)
  return { origin: c, axes: [[e1[0]!, e1[1]!, e1[2]!], [e2[0]!, e2[1]!, e2[2]!], e3] }
}

/** A world point in the frame. */
export function toFrame(f: Frame, x: number, y: number, z: number): [number, number, number] {
  const d = [x - f.origin[0], y - f.origin[1], z - f.origin[2]]
  return [dot(f.axes[0], d), dot(f.axes[1], d), dot(f.axes[2], d)]
}

/** Clearance added to each node's radius for its label, in world units. */
export const LABEL_CLEARANCE = 2.5
/** Ticks of the separation pass. Fixed, so the result is the same on every load. */
export const FLATTEN_TICKS = 160

export interface FlatStats {
  /** Median displacement from the projected spot, as a share of the median nearest-neighbour distance. */
  median: number
  /** The largest displacement, on the same scale. */
  max: number
  nearest: number
}

/**
 * The flat map. Each node's projected x and y, then a short pass that only
 * pulls apart nodes landing on top of each other: a collision sized to the
 * radius plus label clearance, and a strong pull back to the projected spot.
 * `fixed` marks nodes that must not move, for a node added later.
 */
export function flatten(p3: Float32Array, radii: Float32Array, fixed?: Uint8Array): { p2: Float32Array; stats: FlatStats } {
  const n = radii.length
  const px = new Float64Array(n), py = new Float64Array(n)
  const tx = new Float64Array(n), ty = new Float64Array(n)
  for (let i = 0; i < n; i++) { px[i] = tx[i] = p3[i * 3]!; py[i] = ty[i] = p3[i * 3 + 1]! }
  for (let tick = 0; tick < FLATTEN_TICKS; tick++) {
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      let dx = px[j]! - px[i]!, dy = py[j]! - py[i]!
      let d = Math.hypot(dx, dy)
      const min = radii[i]! + radii[j]! + 2 * LABEL_CLEARANCE
      if (d >= min) continue
      if (d < 1e-6) { const a = (i * 7 + j * 13) * 0.61803; dx = Math.cos(a); dy = Math.sin(a); d = 1 }
      const push = (min - d) * 0.5
      const ux = dx / d, uy = dy / d
      const fi = fixed?.[i] ? 0 : 1, fj = fixed?.[j] ? 0 : 1
      const share = fi + fj
      if (share === 0) continue
      px[i] = px[i]! - (ux * push * 2 * fi) / share; py[i] = py[i]! - (uy * push * 2 * fi) / share
      px[j] = px[j]! + (ux * push * 2 * fj) / share; py[j] = py[j]! + (uy * push * 2 * fj) / share
    }
    for (let i = 0; i < n; i++) { if (fixed?.[i]) continue; px[i] = px[i]! + (tx[i]! - px[i]!) * 0.12; py[i] = py[i]! + (ty[i]! - py[i]!) * 0.12 }
  }
  const p2 = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) { p2[i * 3] = px[i]!; p2[i * 3 + 1] = py[i]!; p2[i * 3 + 2] = 0 }
  // How far the pass moved anything, against how far apart neighbours are.
  const nn: number[] = []
  for (let i = 0; i < n; i++) {
    let best = Infinity
    for (let j = 0; j < n; j++) if (j !== i) best = Math.min(best, Math.hypot(tx[j]! - tx[i]!, ty[j]! - ty[i]!))
    if (Number.isFinite(best)) nn.push(best)
  }
  const med = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)]! : 0 }
  const nearest = med(nn) || 1
  const disp = Array.from({ length: n }, (_, i) => Math.hypot(px[i]! - tx[i]!, py[i]! - ty[i]!) / nearest)
  return { p2, stats: { median: med(disp), max: Math.max(0, ...disp), nearest } }
}

/** One domain starts this long after the one before. */
export const PANEL_MS = 40
/** Each node's own fold takes this long. */
export const NODE_MS = 420
/** The shared nodes start this long after the last domain. */
export const CREASE_GAP_MS = 80

/**
 * When each node starts to fold, in milliseconds after the fold begins, and
 * how long the whole fold takes. The domains go in a fixed order; the shared
 * platforms and connectors start last and land last. Unfolding runs the same
 * schedule backwards, so the creases lift first.
 */
export function schedule(nodes: { kind: string; subdomain?: string }[], domainOrder: string[]): { starts: Float32Array; total: number } {
  const starts = new Float32Array(nodes.length)
  const lastDomain = Math.max(0, domainOrder.length - 1)
  const crease = lastDomain * PANEL_MS + CREASE_GAP_MS
  nodes.forEach((n, i) => {
    if (n.kind === 'use_case') {
      const k = domainOrder.indexOf(n.subdomain ?? '')
      starts[i] = (k < 0 ? lastDomain : k) * PANEL_MS
    } else starts[i] = crease
  })
  return { starts, total: crease + NODE_MS }
}

/** Ease in and out, no overshoot: paper does not bounce. */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** A node's fold, 0 standing to 1 flat, at a moment on the schedule. */
export function nodeFold(tau: number, start: number): number {
  return easeInOut(Math.min(1, Math.max(0, (tau - start) / NODE_MS)))
}

/** The turn to the fold-ready pose: longer for a bigger angle, never over 450 ms. */
export function turnMs(angleRad: number): number {
  return Math.min(450, 150 + 300 * (Math.abs(angleRad) / Math.PI))
}

export const FOLD_READY_TILT = (35 * Math.PI) / 180
export const FLAT_FOV = 4

/**
 * The camera between the fold-ready pose (c = 0) and the flat one (c = 1).
 * `halfView3` is the half-height the fold-ready pose shows at its target and
 * `halfView2` the flat pose's. The field of view narrows geometrically while
 * the camera backs off, so the framed size moves smoothly from one to the
 * other and perspective drains away. Writes into `out` to allocate nothing.
 */
export function cameraBlend(
  c: number, fov3: number, halfView3: number, halfView2: number,
  target3: [number, number, number], target2: [number, number, number],
  out: { pos: number[]; target: number[]; up: number[]; fov: number; dist: number },
): void {
  const fov = Math.exp(Math.log(fov3) * (1 - c) + Math.log(FLAT_FOV) * c)
  const half = halfView3 + (halfView2 - halfView3) * c
  const dist = half / Math.tan((fov * Math.PI) / 360)
  const tilt = FOLD_READY_TILT * (1 - c)
  for (let k = 0; k < 3; k++) out.target[k] = target3[k]! + (target2[k]! - target3[k]!) * c
  out.pos[0] = out.target[0]!
  out.pos[1] = out.target[1]! - dist * Math.sin(tilt)
  out.pos[2] = out.target[2]! + dist * Math.cos(tilt)
  out.up[0] = 0; out.up[1] = Math.cos(tilt); out.up[2] = Math.sin(tilt)
  out.fov = fov
  out.dist = dist
}
