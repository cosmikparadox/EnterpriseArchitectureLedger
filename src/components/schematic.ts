// The flat map drawn like a transit map. Pure geometry, tested on its own.
//
//   snapToGrid  each node moves to the nearest free point of a square grid,
//               the busiest first, keeping clear of what is already placed,
//               so the map keeps its shape but sits on a regular lattice.
//   route       each line runs horizontally, vertically or at 45 degrees,
//               with one rounded bend, in whichever of four shapes keeps
//               furthest from the other stations and off the lines already
//               drawn, so lines leave a busy station in different directions.

/** The lattice spacing, in world units. */
export const GRID = 16

/** How far apart stations must stand, and where their names run. */
export interface SnapOptions {
  /** Free cells required between two stations, beyond their own clearance. Default 1: neighbours may touch corners. */
  gap?: number
  /**
   * Per node, how many cells its name runs up and to the right at 45
   * degrees; 0 for none. A station is kept off another's name, and its own
   * name off other stations, where a spot within a few rings allows it.
   */
  labelRun?: Uint8Array
}

/**
 * Snap flat positions to the lattice. `xy` holds x and y per node; `cells`
 * is each node's clearance in cells (0 for a small station, 1 for a large
 * interchange); `order` is the placing order. A node marked in `fixed` keeps
 * the lattice point it already has. Returns snapped x and y per node.
 */
export function snapToGrid(xy: Float32Array, cells: Uint8Array, order: number[], fixed?: Uint8Array, grid = GRID, opts: SnapOptions = {}): Float32Array {
  const n = cells.length
  const gap = opts.gap ?? 1
  const runs = opts.labelRun
  const out = new Float32Array(n * 2)
  const placed: { cx: number; cy: number; r: number; run: number }[] = []
  const free = (cx: number, cy: number, r: number) => placed.every((p) => Math.max(Math.abs(cx - p.cx), Math.abs(cy - p.cy)) >= r + p.r + gap)
  // Clear of names: no placed station on this one's name, and this one not
  // on any placed station's name.
  const clearOfNames = (cx: number, cy: number, r: number, run: number) => {
    for (const p of placed) {
      for (let k = 1; k <= run; k++) if (Math.max(Math.abs(cx + k - p.cx), Math.abs(cy + k - p.cy)) <= p.r) return false
      for (let k = 1; k <= p.run; k++) if (Math.max(Math.abs(p.cx + k - cx), Math.abs(p.cy + k - cy)) <= r) return false
    }
    return true
  }
  if (fixed) for (let i = 0; i < n; i++) if (fixed[i]) {
    const cx = Math.round(xy[i * 2]! / grid), cy = Math.round(xy[i * 2 + 1]! / grid)
    placed.push({ cx, cy, r: cells[i]!, run: runs?.[i] ?? 0 })
    out[i * 2] = cx * grid; out[i * 2 + 1] = cy * grid
  }
  for (const i of order) {
    if (fixed?.[i]) continue
    const tx = xy[i * 2]! / grid, ty = xy[i * 2 + 1]! / grid
    const r = cells[i]!, run = runs?.[i] ?? 0
    let best: [number, number] | null = null, bestRing = -1
    let tidy: [number, number] | null = null
    for (let ring = 0; ring < 60 && !(tidy || (best && ring > bestRing + 3)); ring++) {
      const x0 = Math.round(tx), y0 = Math.round(ty)
      const cand: [number, number, number][] = []
      for (let dx = -ring; dx <= ring; dx++) for (let dy = -ring; dy <= ring; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue
        const cx = x0 + dx, cy = y0 + dy
        cand.push([cx, cy, Math.hypot(cx - tx, cy - ty)])
      }
      cand.sort((a, b) => a[2] - b[2] || a[0] - b[0] || a[1] - b[1])
      for (const [cx, cy] of cand) {
        if (!free(cx, cy, r)) continue
        if (!best) { best = [cx, cy]; bestRing = ring }
        if (!runs || clearOfNames(cx, cy, r, run)) { tidy = [cx, cy]; break }
      }
    }
    const [cx, cy] = tidy ?? best ?? [Math.round(tx), Math.round(ty)]
    placed.push({ cx, cy, r, run })
    out[i * 2] = cx * grid; out[i * 2 + 1] = cy * grid
  }
  return out
}

/** A station to keep clear of: x, y and radius. */
export type Blocker = [number, number, number]

function clearance(pts: number[], blockers: Blocker[], a: [number, number], b: [number, number]): number {
  let worst = Infinity
  for (const [x, y, r] of blockers) {
    if ((Math.abs(x - a[0]) < 1e-6 && Math.abs(y - a[1]) < 1e-6) || (Math.abs(x - b[0]) < 1e-6 && Math.abs(y - b[1]) < 1e-6)) continue
    for (let k = 0; k + 3 < pts.length; k += 2) {
      const x1 = pts[k]!, y1 = pts[k + 1]!, x2 = pts[k + 2]!, y2 = pts[k + 3]!
      const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy
      const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2))
      worst = Math.min(worst, Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)) - r)
    }
  }
  return worst
}

/**
 * The corridors already drawn, so a new line can avoid running on top of
 * one. Each straight run is kept by its direction and the line it lies on.
 */
export class Corridors {
  private runs = new Map<string, [number, number][]>()
  private static key(x1: number, y1: number, x2: number, y2: number): [string, number, number] | null {
    const dx = x2 - x1, dy = y2 - y1
    if (Math.hypot(dx, dy) < 1e-6) return null
    const q = (v: number) => Math.round(v * 4) / 4
    if (Math.abs(dy) < 1e-6) return [`h${q(y1)}`, Math.min(x1, x2), Math.max(x1, x2)]
    if (Math.abs(dx) < 1e-6) return [`v${q(x1)}`, Math.min(y1, y2), Math.max(y1, y2)]
    if (Math.sign(dx) === Math.sign(dy)) return [`d${q(y1 - x1)}`, Math.min(x1, x2), Math.max(x1, x2)]
    return [`a${q(y1 + x1)}`, Math.min(x1, x2), Math.max(x1, x2)]
  }
  /** How far a polyline runs along corridors already drawn. */
  overlap(pts: number[]): number {
    let total = 0
    for (let k = 0; k + 3 < pts.length; k += 2) {
      const key = Corridors.key(pts[k]!, pts[k + 1]!, pts[k + 2]!, pts[k + 3]!)
      if (!key) continue
      const scale = key[0][0] === 'd' || key[0][0] === 'a' ? Math.SQRT2 : 1
      for (const [lo, hi] of this.runs.get(key[0]) ?? []) total += Math.max(0, Math.min(hi, key[2]) - Math.max(lo, key[1])) * scale
    }
    return total
  }
  add(pts: number[]) {
    for (let k = 0; k + 3 < pts.length; k += 2) {
      const key = Corridors.key(pts[k]!, pts[k + 1]!, pts[k + 2]!, pts[k + 3]!)
      if (!key) continue
      const list = this.runs.get(key[0]) ?? []
      list.push([key[1], key[2]])
      this.runs.set(key[0], list)
    }
  }
}

/**
 * An octilinear route from a to b, as flat x, y pairs. One bend at most,
 * rounded with a short curve; a line that is already straight or exactly
 * diagonal has none. Four shapes are tried: the diagonal at either end, or
 * a square corner either way round. The route keeps clear of the stations
 * in `blockers` and, given `corridors`, of lines already drawn, and is then
 * added to them. Among equals the diagonal at a wins, then at b.
 */
export function route(a: [number, number], b: [number, number], blockers: Blocker[] = [], corner = 6, corridors?: Corridors): number[] {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const adx = Math.abs(dx), ady = Math.abs(dy)
  const m = Math.min(adx, ady)
  if (m < 1e-6 || Math.abs(adx - ady) < 1e-6) {
    const pts = [a[0], a[1], b[0], b[1]]
    corridors?.add(pts)
    return pts
  }
  const sx = Math.sign(dx), sy = Math.sign(dy)
  const bends: [number, number][] = [
    [a[0] + sx * m, a[1] + sy * m],
    [b[0] - sx * m, b[1] - sy * m],
    [b[0], a[1]],
    [a[0], b[1]],
  ]
  const shortest = Math.max(adx, ady) + (Math.SQRT2 - 1) * m
  let best = 0, bestScore = -Infinity
  bends.forEach((bend, i) => {
    const pts = [a[0], a[1], bend[0], bend[1], b[0], b[1]]
    const c = clearance(pts, blockers, a, b)
    const extra = routeLength(pts) - shortest
    const score = (c < 0 ? 3 * c : Math.min(c, 6)) - 0.08 * extra - (corridors ? 0.3 * corridors.overlap(pts) : 0)
    if (score > bestScore + 0.5) { best = i; bestScore = score }
  })
  const bend = bends[best]!
  corridors?.add([a[0], a[1], bend[0], bend[1], b[0], b[1]])
  return roundCorner(a, bend, b, corner)
}

function roundCorner(a: [number, number], bend: [number, number], b: [number, number], radius: number): number[] {
  const l1 = Math.hypot(bend[0] - a[0], bend[1] - a[1]), l2 = Math.hypot(b[0] - bend[0], b[1] - bend[1])
  const r = Math.min(radius, l1 / 2, l2 / 2)
  if (r < 0.5) return [a[0], a[1], bend[0], bend[1], b[0], b[1]]
  const u1 = [(bend[0] - a[0]) / l1, (bend[1] - a[1]) / l1], u2 = [(b[0] - bend[0]) / l2, (b[1] - bend[1]) / l2]
  const p1 = [bend[0] - u1[0]! * r, bend[1] - u1[1]! * r], p2 = [bend[0] + u2[0]! * r, bend[1] + u2[1]! * r]
  const out = [a[0], a[1], p1[0]!, p1[1]!]
  for (let k = 1; k < 5; k++) {
    const t = k / 5, s = 1 - t
    out.push(s * s * p1[0]! + 2 * s * t * bend[0] + t * t * p2[0]!, s * s * p1[1]! + 2 * s * t * bend[1] + t * t * p2[1]!)
  }
  out.push(p2[0]!, p2[1]!, b[0], b[1])
  return out
}

/** A route's length, for drawing it on. */
export function routeLength(pts: number[]): number {
  let len = 0
  for (let k = 0; k + 3 < pts.length; k += 2) len += Math.hypot(pts[k + 2]! - pts[k]!, pts[k + 3]! - pts[k + 1]!)
  return len
}

/** Is every segment of a route horizontal, vertical or at 45 degrees? Corners aside. */
export function isOctilinear(pts: number[], tolerance = 1e-3): boolean {
  const segs: [number, number][] = []
  for (let k = 0; k + 3 < pts.length; k += 2) segs.push([pts[k + 2]! - pts[k]!, pts[k + 3]! - pts[k + 1]!])
  // The first and last segments carry the route; the rest are the rounded corner.
  for (const [dx, dy] of [segs[0]!, segs[segs.length - 1]!]) {
    const ax = Math.abs(dx), ay = Math.abs(dy)
    if (!(ax < tolerance || ay < tolerance || Math.abs(ax - ay) < tolerance * Math.max(1, ax))) return false
  }
  return true
}
