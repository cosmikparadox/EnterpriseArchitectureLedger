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
): Cancellable & { done: Promise<void> } {
  if (reduced || ms <= 0) {
    onTick(to)
    return { cancel: () => {}, done: Promise.resolve() }
  }
  let raf = 0
  let cancelled = false
  let finish: () => void = () => undefined
  const done = new Promise<void>((resolve) => { finish = resolve })
  const started = performance.now()
  const frame = (now: number) => {
    if (cancelled) return
    const t = Math.min(1, (now - started) / ms)
    onTick(from + (to - from) * ease(t))
    if (t < 1) raf = requestAnimationFrame(frame)
    else finish()
  }
  raf = requestAnimationFrame(frame)
  return { cancel: () => { cancelled = true; cancelAnimationFrame(raf); finish() }, done }
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
  /** Timers not yet fired and animations not yet finished. */
  private active = 0
  private waiting: { at: number; then: () => void }[] = []

  add(c: Cancellable & { done?: Promise<void> }): void {
    if (this.cancelled) { c.cancel(); return }
    this.parts.push(c)
    if (c.done) { this.active++; c.done.then(() => { this.active--; this.check() }) }
  }

  /** Run something later, unless the step has already been left. */
  after(ms: number, then: () => void, reduced: boolean): void {
    if (reduced) { if (!this.cancelled) then(); return }
    this.active++
    const t = setTimeout(() => { if (!this.cancelled) then(); this.active--; this.check() }, ms)
    this.add({ cancel: () => clearTimeout(t) })
  }

  /**
   * Run something once everything this step started has finished, and not
   * before the given time. A frame that ran late does not move the moment
   * the step starts listening for the reader; it is the step's own work
   * finishing that does.
   */
  whenIdle(notBeforeMs: number, then: () => void, reduced: boolean): void {
    if (reduced) { if (!this.cancelled) then(); return }
    const at = performance.now() + notBeforeMs
    this.waiting.push({ at, then })
    const t = setTimeout(() => this.check(), notBeforeMs)
    this.add({ cancel: () => clearTimeout(t) })
  }

  private check(): void {
    if (this.cancelled || this.active > 0) return
    const now = performance.now()
    const ready = this.waiting.filter((w) => w.at <= now)
    this.waiting = this.waiting.filter((w) => w.at > now)
    for (const w of ready) w.then()
  }

  cancel(): void {
    this.cancelled = true
    for (const p of this.parts) p.cancel()
    this.parts = []
    this.waiting = []
  }
}
