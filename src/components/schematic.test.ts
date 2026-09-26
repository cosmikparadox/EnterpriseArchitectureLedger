// The flat map drawn like a transit map: the lattice and the lines.
import { describe, it, expect } from 'vitest'
import { snapToGrid, route, routeLength, isOctilinear, Corridors, GRID, type Blocker } from './schematic'

describe('the lattice', () => {
  const xy = new Float32Array([1, 2, 3, -1, 40, 7, 200, 190])
  const cells = new Uint8Array([1, 0, 0, 0])
  const out = snapToGrid(xy, cells, [0, 1, 2, 3])
  const at = (i: number) => [out[i * 2]! / GRID, out[i * 2 + 1]! / GRID]
  it('puts every node on a lattice point', () => {
    for (const v of out) expect(Number.isInteger(v / GRID)).toBe(true)
  })
  it('keeps nodes that start apart near where they were', () => {
    expect(at(2)).toEqual([3, 0])
    expect(at(3)).toEqual([13, 12])
  })
  it('keeps a clear cell between stations, more round a large one', () => {
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      const [a, b] = [at(i), at(j)]
      expect(Math.max(Math.abs(a[0]! - b[0]!), Math.abs(a[1]! - b[1]!))).toBeGreaterThanOrEqual(cells[i]! + cells[j]! + 1)
    }
  })
  it('is deterministic and never moves a fixed node', () => {
    expect(snapToGrid(xy, cells, [0, 1, 2, 3])).toEqual(out)
    const fixed = new Uint8Array([0, 1, 0, 0])
    const again = snapToGrid(new Float32Array([1, 2, 16, 0, 40, 7, 200, 190]), cells, [0, 1, 2, 3], fixed)
    expect([again[2], again[3]]).toEqual([16, 0])
  })
})

describe('the lines', () => {
  it('draws a straight or exactly diagonal line with no bend', () => {
    expect(route([0, 0], [64, 0])).toEqual([0, 0, 64, 0])
    expect(route([0, 0], [32, -32])).toEqual([0, 0, 32, -32])
  })
  it('runs every other line at 0, 45 or 90 degrees, from a to b', () => {
    for (const b of [[48, 16], [-16, 80], [-96, -32], [16, -64]] as [number, number][]) {
      const pts = route([0, 0], b)
      expect(isOctilinear(pts)).toBe(true)
      expect(pts.slice(0, 2)).toEqual([0, 0])
      expect(pts.slice(-2)).toEqual(b)
      expect(routeLength(pts)).toBeLessThanOrEqual(Math.hypot(b[0], b[1]) * 1.5)
    }
  })
  it('bends away from a station in the way', () => {
    const free = route([0, 0], [64, 32])
    // The diagonal at the start passes (32, 32); with a station there the line goes the other way round.
    const blocked = route([0, 0], [64, 32], [[32, 32, 6]] as Blocker[])
    expect(blocked).not.toEqual(free)
    for (let k = 0; k < blocked.length; k += 2) expect(Math.hypot(blocked[k]! - 32, blocked[k + 1]! - 32)).toBeGreaterThan(6)
  })
  it('keeps off a corridor already drawn when it can', () => {
    const corridors = new Corridors()
    const first = route([0, 0], [64, 32], [], 6, corridors)
    const second = route([0, 0], [64, 32], [], 6, corridors)
    expect(second).not.toEqual(first)
    expect(corridors.overlap([0, 0, 64, 0])).toBeGreaterThan(0)
    expect(new Corridors().overlap(first)).toBe(0)
  })
})
