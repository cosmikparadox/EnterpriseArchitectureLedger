// Value animation for the tour's enter() actions.
//
// The tour moves sliders rather than telling you to move them, because a number
// that changes while you are looking at it teaches more than a sentence about a
// number that changes. Everything here is cancellable: leaving a step part way
// through must not leave a slider crawling under the next step's card.
//
// Under prefers-reduced-motion every animation becomes its own end state,
// applied at once. That is the same rule the brief sets for the camera.

export interface Cancellable { cancel: () => void }

/** Ease in and out, so a slider does not start and stop with a jolt. */
function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export function animateValue(
  from: number,
  to: number,
  ms: number,
  onTick: (v: number) => void,
  reduced: boolean,
): Cancellable {
  if (reduced || ms <= 0) {
    onTick(to)
    return { cancel: () => {} }
  }
  let raf = 0
  let cancelled = false
  const started = performance.now()
  const frame = (now: number) => {
    if (cancelled) return
    const t = Math.min(1, (now - started) / ms)
    onTick(from + (to - from) * ease(t))
    if (t < 1) raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
  return { cancel: () => { cancelled = true; cancelAnimationFrame(raf) } }
}

/**
 * Everything one step started, cancellable as one.
 *
 * A step's enter() can set a slider moving, wait, then set another going. If the
 * viewer presses Next half way through, all of it has to stop at once, or the
 * next step opens with the previous step's animation still writing to the store.
 */
export class Timeline {
  private parts: Cancellable[] = []
  private cancelled = false

  add(c: Cancellable): void {
    if (this.cancelled) { c.cancel(); return }
    this.parts.push(c)
  }

  /** Run something later, unless the step has already been left. */
  after(ms: number, then: () => void, reduced: boolean): void {
    if (reduced) { if (!this.cancelled) then(); return }
    const t = setTimeout(() => { if (!this.cancelled) then() }, ms)
    this.add({ cancel: () => clearTimeout(t) })
  }

  cancel(): void {
    this.cancelled = true
    for (const p of this.parts) p.cancel()
    this.parts = []
  }
}
