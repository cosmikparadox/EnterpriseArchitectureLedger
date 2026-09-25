// The fold benchmark. Audit brief v0.5, section 17.10.
//
// Drives the explorer through the development seams (__ledger, __fold): the
// switch is set through the store exactly as the button sets it, and every
// frame's timestamp and the fold's progress are recorded in the page.
import type { Browser, Page } from '@playwright/test'

export interface FoldRow {
  scenario: string
  toFlatMs: number[]
  toDeepMs: number[]
  medianFrameMs: number
  over33Pct: number
  over20: number
  frames: number
  geometries: [number, number]
  textures: [number, number]
  heapGrowthMb: number
  pixelIdentical: boolean
  drift: number
  reversal: { ok: boolean; maxStep: number; maxTauStep: number; flips: number }
  /** The same scene with nothing moving: what this machine renders at anyway. */
  idleFrameMs: number
  /** The fold's own work per frame, positions, hulls and camera, median and worst. */
  foldWorkMs: [number, number]
}

async function idleFrames(page: Page, n: number): Promise<number[]> {
  return page.evaluate((count) => new Promise<number[]>((resolve) => {
    const t: number[] = []
    const loop = (x: number) => { t.push(x); if (t.length > count) resolve(t.slice(1).map((v, i) => v - t[i]!)); else requestAnimationFrame(loop) }
    requestAnimationFrame(loop)
  }), n)
}

const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)]! : 0 }

async function waitMode(page: Page, mode: '2d' | '3d', timeout = 15000): Promise<void> {
  await page.waitForFunction((m) => { const f = (window as any).__fold?.[0]?.state(); return f && !f.active && f.mode === m }, mode, { timeout })
}

/** Set the switch and time it in the page, from the request to the fold's end. */
async function toggle(page: Page, mode: '2d' | '3d'): Promise<number> {
  const ms = await page.evaluate((m) => new Promise<number>((resolve) => {
    const t0 = performance.now()
    ;(window as any).__ledger.getState().setDimension(m)
    const check = () => { const f = (window as any).__fold[0].state(); if (!f.active && f.mode === m) resolve(performance.now() - t0); else requestAnimationFrame(check) }
    requestAnimationFrame(check)
  }), mode)
  await waitMode(page, mode)
  return ms
}

export async function foldBench(browser: Browser, base: string, errors: string[]): Promise<{ rows: FoldRow[]; text: string; pass: boolean }> {
  const rows: FoldRow[] = []
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    for (const throttle of [1, 4]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: 'light' })
      // tsx keeps function names with a helper the page does not have.
      await ctx.addInitScript('window.__name = (f) => f')
      const page = await ctx.newPage()
      page.on('pageerror', (e) => errors.push(String(e)))
      const cdp = await ctx.newCDPSession(page)
      await page.goto(`${base}/#/explore`, { waitUntil: 'load' })
      await page.waitForFunction(() => (window as any).__fold?.[0]?.stats(), undefined, { timeout: 20000 })
      await page.waitForTimeout(2500)
      await page.locator('.wip-note .tour-skip').click({ timeout: 1500 }).catch(() => {})
      await page.waitForTimeout(400)
      // The fold itself is measured here, not the crossfade a slow device would switch to.
      await page.evaluate(() => (window as any).__fold[0].forceFold(true))
      if (throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle })
      // One frame recorder for the whole run.
      await page.evaluate(() => {
        const rec = { on: false, t: [] as number[], tau: [] as number[], max: [] as number[] }
        ;(window as any).__rec = rec
        let prev: { x: number; y: number; z: number }[] | null = null
        const loop = (t: number) => {
          if (rec.on) {
            rec.t.push(t)
            const f = (window as any).__fold[0]
            const s = f.state()
            rec.tau.push(s.phase === 'turn' ? -1 : s.tau)
            const pos = f.positions() as { x: number; y: number; z: number }[]
            let m = 0
            if (prev) for (let i = 0; i < pos.length; i++) { const a = pos[i]!, b = prev[i]; if (b) m = Math.max(m, Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)) }
            rec.max.push(m)
            prev = pos
          } else prev = null
          requestAnimationFrame(loop)
        }
        requestAnimationFrame(loop)
      })
      const idle = await idleFrames(page, 60)
      await page.evaluate(() => { const p = (window as any).__perf; if (p) p.foldStep = [] })
      await cdp.send('HeapProfiler.collectGarbage')
      const heap0 = (await cdp.send('Runtime.getHeapUsage')).usedSize
      const mem0 = await page.evaluate(() => (window as any).__fold[0].memory())
      const toFlat: number[] = [], toDeep: number[] = [], frames: number[] = []
      let first2d: Buffer | null = null, last2d: Buffer | null = null
      // The map only: the switch pill overlaps the canvas and its own antialiasing varies.
      const shot = async () => page.locator('.graph-holder').first().screenshot({ mask: [page.locator('.canvas-switches')] })
      for (let trip = 0; trip < 10; trip++) {
        await page.evaluate(() => { const r = (window as any).__rec; r.on = true; r.t = []; r.tau = []; r.max = [] })
        toFlat.push(await toggle(page, '2d'))
        const d1 = await page.evaluate(() => { const r = (window as any).__rec; r.on = false; return r.t.slice(1).map((t: number, i: number) => t - r.t[i]) })
        frames.push(...d1)
        await page.waitForTimeout(throttle > 1 ? 1500 : 800)
        if (trip === 0) first2d = await shot()
        if (trip === 9) last2d = await shot()
        await page.evaluate(() => { const r = (window as any).__rec; r.on = true; r.t = []; r.tau = []; r.max = [] })
        toDeep.push(await toggle(page, '3d'))
        const d2 = await page.evaluate(() => { const r = (window as any).__rec; r.on = false; return r.t.slice(1).map((t: number, i: number) => t - r.t[i]) })
        frames.push(...d2)
        await page.waitForTimeout(300)
      }
      await page.waitForTimeout(600)
      await cdp.send('HeapProfiler.collectGarbage')
      const heap1 = (await cdp.send('Runtime.getHeapUsage')).usedSize
      const mem1 = await page.evaluate(() => (window as any).__fold[0].memory())
      // After twenty toggles, every node is back exactly on its 3D spot.
      const drift = await page.evaluate(() => {
        const f = (window as any).__fold[0]
        const p3 = f.p3() as Record<string, [number, number, number]>
        let m = 0
        for (const n of f.positions() as { id: string; x: number; y: number; z: number }[]) { const p = p3[n.id]; if (p) m = Math.max(m, Math.abs(n.x - p[0]), Math.abs(n.y - p[1]), Math.abs(n.z - p[2])) }
        return m
      })
      // A tap mid-fold turns it round from where it is.
      await page.evaluate(() => { const r = (window as any).__rec; r.on = true; r.t = []; r.tau = []; r.max = [] })
      await page.evaluate(() => new Promise<void>((resolve) => {
        ;(window as any).__ledger.getState().setDimension('2d')
        const t0 = performance.now()
        const wait = () => { const s = (window as any).__fold[0].state(); if (s.phase === 'fold' && s.tau > 300) { (window as any).__ledger.getState().setDimension('3d'); resolve() } else if (performance.now() - t0 > 5000) resolve(); else requestAnimationFrame(wait) }
        requestAnimationFrame(wait)
      }))
      await waitMode(page, '3d')
      const rv = await page.evaluate(() => { const r = (window as any).__rec; r.on = false; return { tau: r.tau as number[], max: r.max as number[] } })
      const taus = rv.tau.filter((x) => x >= 0)
      let flips = 0, maxTauStep = 0
      for (let i = 2; i < taus.length; i++) {
        const a = taus[i - 1]! - taus[i - 2]!, b = taus[i]! - taus[i - 1]!
        if (a > 0 && b < 0) flips++
        maxTauStep = Math.max(maxTauStep, Math.abs(b))
      }
      const maxStep = Math.max(0, ...rv.max)
      const work = await page.evaluate(() => ((window as any).__perf?.foldStep ?? []) as number[])
      const flatFrames = frames.filter((x) => x > 0)
      rows.push({
        scenario: `${w === 390 ? '390 px' : 'desktop'}, ${throttle === 1 ? 'unthrottled' : '4x throttle'}`,
        toFlatMs: toFlat.map(Math.round), toDeepMs: toDeep.map(Math.round),
        medianFrameMs: Math.round(median(flatFrames) * 10) / 10,
        over33Pct: Math.round((flatFrames.filter((x) => x > 33).length / Math.max(1, flatFrames.length)) * 1000) / 10,
        over20: flatFrames.filter((x) => x > 20).length,
        frames: flatFrames.length,
        geometries: [mem0?.geometries ?? -1, mem1?.geometries ?? -1],
        textures: [mem0?.textures ?? -1, mem1?.textures ?? -1],
        heapGrowthMb: Math.round(((heap1 - heap0) / 1048576) * 100) / 100,
        pixelIdentical: !!first2d && !!last2d && first2d.equals(last2d),
        drift,
        // No jump: progress never steps more than a clamped frame, the
        // direction turns once, and no node moves further in one frame
        // than the fold moves it anyway.
        reversal: { ok: flips === 1 && maxTauStep <= 64 && maxStep < 40, maxStep: Math.round(maxStep * 10) / 10, maxTauStep: Math.round(maxTauStep), flips },
        idleFrameMs: Math.round(median(idle) * 10) / 10,
        foldWorkMs: [Math.round(median(work) * 100) / 100, Math.round(Math.max(0, ...work) * 100) / 100],
      })
      await ctx.close()
    }
  }
  const lines = ['', 'FOLD BENCHMARK, 10 round trips per scenario', '']
  let pass = true
  for (const r of rows) {
    const throttled = r.scenario.includes('4x')
    const desktopFree = r.scenario === 'desktop, unthrottled'
    const okFrame = !throttled || (r.medianFrameMs <= 16.7 && r.over33Pct <= 5)
    const okDesk = !desktopFree || r.over20 === 0
    const okMem = r.geometries[0] === r.geometries[1] && r.textures[0] === r.textures[1] && r.heapGrowthMb < 2
    const ok = okFrame && okDesk && okMem && r.pixelIdentical && r.drift === 0 && r.reversal.ok
    if (!ok) pass = false
    lines.push(`${r.scenario}: to 2D median ${median(r.toFlatMs)} ms, to 3D median ${median(r.toDeepMs)} ms; frame median ${r.medianFrameMs} ms over ${r.frames} frames, over 33 ms ${r.over33Pct} percent, over 20 ms ${r.over20}; idle frame median ${r.idleFrameMs} ms; fold work median ${r.foldWorkMs[0]} ms, worst ${r.foldWorkMs[1]} ms; geometries ${r.geometries.join(' to ')}, textures ${r.textures.join(' to ')}, heap ${r.heapGrowthMb} MB; 2D pixel-identical ${r.pixelIdentical}; drift ${r.drift}; reversal ${JSON.stringify(r.reversal)}; ${ok ? 'PASS' : 'MISS'}`)
  }
  return { rows, text: lines.join('\n'), pass }
}
