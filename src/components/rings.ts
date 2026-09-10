// Screen-space donut rings for view 2. Spec section 4.2: each platform node
// becomes a ring drawn around the sphere, split into the metered share (solid)
// and the rule share (hatched).
//
// The hatching matters. Spec section 2 requires that colour is never the only
// carrier of meaning, so the two halves of the ring differ by PATTERN as well
// as tone: metered is solid, rule is hatched. That distinction survives a
// greyscale print and most colour vision deficiencies.

import * as THREE from 'three'

const SIZE = 320

export interface RingSplit {
  /** Fraction of reported cost that is metered. The remainder is the rule. */
  meteredFrac: number
}

function hatchPattern(ctx: CanvasRenderingContext2D, colour: string): CanvasPattern {
  const tile = document.createElement('canvas')
  tile.width = tile.height = 8
  const t = tile.getContext('2d')!
  t.strokeStyle = colour
  t.lineWidth = 2.6
  t.beginPath()
  t.moveTo(-2, 10); t.lineTo(10, -2)
  t.moveTo(2, 14); t.lineTo(14, 2)
  t.stroke()
  return ctx.createPattern(tile, 'repeat')!
}

export function ringTexture(split: RingSplit, dark: boolean): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = SIZE
  const ctx = c.getContext('2d')!
  const cx = SIZE / 2, cy = SIZE / 2
  const rOuter = SIZE * 0.48
  const rInner = SIZE * 0.29

  // High contrast between the two halves, because the split is the lesson.
  const solid = dark ? '#eaeff6' : '#232830'
  const hatchColour = dark ? '#7f97b4' : '#6d7f96'

  const arc = (from: number, to: number, fill: string | CanvasPattern) => {
    ctx.beginPath()
    ctx.arc(cx, cy, rOuter, from, to)
    ctx.arc(cx, cy, rInner, to, from, true)
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
  }

  const start = -Math.PI / 2
  const m = Math.max(0, Math.min(1, split.meteredFrac))
  const mid = start + m * Math.PI * 2

  // Metered: solid.
  if (m > 0.0005) arc(start, mid, solid)
  // Rule: hatched.
  if (m < 0.9995) {
    ctx.save()
    arc(mid, start + Math.PI * 2, hatchPattern(ctx, hatchColour))
    ctx.restore()
    // A faint backing so the hatch reads at small sizes.
    ctx.globalAlpha = 0.3
    arc(mid, start + Math.PI * 2, hatchColour)
    ctx.globalAlpha = 1
  }

  // Outline, so the ring keeps its shape against any background.
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'
  ctx.lineWidth = 2.5
  for (const r of [rInner, rOuter]) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
