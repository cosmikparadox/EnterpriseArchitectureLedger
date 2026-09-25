// The fold's geometry. Audit brief v0.5, section 17.
import { describe, it, expect } from 'vitest'
import { canonicalFrame, cameraBlend, flatten, nodeFold, schedule, toFrame, turnMs, easeInOut, FLAT_FOV, NODE_MS, type FoldNode } from './fold'

// A small deterministic cloud: two domains either side, a shared node between.
function cloud(): FoldNode[] {
  const out: FoldNode[] = []
  let s = 7
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647 - 0.5 }
  for (let i = 0; i < 12; i++) out.push({ id: `s${i}`, kind: 'use_case', subdomain: 'sales', x: 80 + rnd() * 30, y: 10 + rnd() * 60, z: 20 + rnd() * 10, r: 3 })
  for (let i = 0; i < 12; i++) out.push({ id: `c${i}`, kind: 'use_case', subdomain: 'claims', x: -80 + rnd() * 30, y: -30 + rnd() * 60, z: -10 + rnd() * 10, r: 3 })
  out.push({ id: 'p', kind: 'platform', x: 0, y: 0, z: 0, r: 8 })
  return out
}

describe('the canonical frame', () => {
  const nodes = cloud()
  const f = canonicalFrame(nodes)
  const inFrame = nodes.map((n) => toFrame(f, n.x, n.y, n.z))
  it('is orthonormal and right-handed', () => {
    const [a, b, c] = f.axes
    const dot = (u: number[], v: number[]) => u[0]! * v[0]! + u[1]! * v[1]! + u[2]! * v[2]!
    expect(dot(a, a)).toBeCloseTo(1, 9); expect(dot(b, b)).toBeCloseTo(1, 9); expect(dot(a, b)).toBeCloseTo(0, 9)
    const cross = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
    expect(dot(cross, c)).toBeCloseTo(1, 9)
  })
  it('centres the layout on the origin and puts the widest spread on x', () => {
    const mean = [0, 1, 2].map((k) => inFrame.reduce((s, p) => s + p[k]!, 0) / inFrame.length)
    for (const m of mean) expect(Math.abs(m)).toBeLessThan(1e-9)
    const spread = [0, 1, 2].map((k) => inFrame.reduce((s, p) => s + p[k]! ** 2, 0))
    expect(spread[0]).toBeGreaterThan(spread[1]!)
    expect(spread[1]).toBeGreaterThan(spread[2]!)
  })
  it('follows the sign rule: Sales on the left, Claims above the centre', () => {
    const mean = (pre: string, k: number) => { const m = nodes.map((n, i) => (n.id.startsWith(pre) ? inFrame[i]![k]! : null)).filter((x): x is number => x !== null); return m.reduce((a, b) => a + b, 0) / m.length }
    expect(mean('s', 0)).toBeLessThan(0)
    expect(mean('c', 1)).toBeGreaterThan(0)
  })
  it('is the same frame on every call', () => {
    expect(canonicalFrame(cloud())).toEqual(f)
  })
})

describe('the flat map', () => {
  const p3 = new Float32Array([0, 0, 5, 1, 0, -5, 40, 0, 0, 80, 10, 3])
  const radii = new Float32Array([4, 4, 4, 4])
  const { p2, stats } = flatten(p3, radii)
  it('separates nodes that land on each other and leaves the rest near their projected spots', () => {
    expect(Math.hypot(p2[3]! - p2[0]!, p2[4]! - p2[1]!)).toBeGreaterThan(8)
    expect(Math.hypot(p2[9]! - 80, p2[10]! - 10)).toBeLessThan(1)
    expect(p2[2]).toBe(0)
    expect(stats.median).toBeLessThan(0.5)
  })
  it('is deterministic', () => {
    expect(flatten(p3, radii).p2).toEqual(p2)
  })
  it('never moves a fixed node', () => {
    const fixed = new Uint8Array([1, 0, 1, 1])
    const r = flatten(p3, radii, fixed).p2
    expect([r[0], r[1]]).toEqual([0, 0])
  })
})

describe('the schedule', () => {
  const nodes = [{ kind: 'use_case', subdomain: 'b' }, { kind: 'use_case', subdomain: 'a' }, { kind: 'platform' }, { kind: 'integration' }]
  const { starts, total } = schedule(nodes, ['a', 'b'])
  it('folds the domains one after another and the creases last', () => {
    expect(starts[1]).toBeLessThan(starts[0]!)
    expect(starts[2]).toBeGreaterThan(starts[0]!)
    expect(starts[2]).toBe(starts[3])
    expect(total).toBe(starts[2]! + NODE_MS)
  })
  it('lands every node exactly, with no overshoot', () => {
    for (let t = 0; t <= total; t += 7) for (const s of starts) { const e = nodeFold(t, s); expect(e).toBeGreaterThanOrEqual(0); expect(e).toBeLessThanOrEqual(1) }
    for (const s of starts) { expect(nodeFold(total, s)).toBe(1); expect(nodeFold(0, s)).toBe(0) }
    expect(easeInOut(0.5)).toBeCloseTo(0.5, 9)
  })
})

describe('the camera', () => {
  const out = { pos: [0, 0, 0], target: [0, 0, 0], up: [0, 1, 0], fov: 0, dist: 0 }
  it('turns for longer through a bigger angle, never over 450 ms', () => {
    expect(turnMs(0)).toBe(150)
    expect(turnMs(Math.PI)).toBe(450)
    expect(turnMs(4 * Math.PI)).toBe(450)
  })
  it('ends straight down the z axis, y up, at the narrow field of view', () => {
    cameraBlend(1, 50, 200, 150, [0, 0, 0], [5, 6, 0], out)
    expect(out.fov).toBeCloseTo(FLAT_FOV, 9)
    expect(out.pos[0]).toBeCloseTo(5, 9); expect(out.pos[1]).toBeCloseTo(6, 9)
    expect(out.up).toEqual([0, 1, 0])
    expect(out.dist * Math.tan((FLAT_FOV * Math.PI) / 360)).toBeCloseTo(150, 6)
  })
  it('holds the framed size steady while the view narrows', () => {
    let prev = Infinity
    for (let c = 0; c <= 1.0001; c += 0.1) {
      cameraBlend(c, 50, 200, 200, [0, 0, 0], [0, 0, 0], out)
      expect(out.dist * Math.tan((out.fov * Math.PI) / 360)).toBeCloseTo(200, 6)
      expect(out.fov).toBeLessThanOrEqual(prev)
      prev = out.fov
    }
  })
})
