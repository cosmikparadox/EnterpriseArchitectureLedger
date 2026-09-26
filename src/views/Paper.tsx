// Tab 8. The canonical thesis, read in place.
//
// The PDF travels inside the build and pdf.js draws it, so the page works
// offline like the rest of the explorer. Pages are drawn as they come near
// the view, crisp at the screen's pixel ratio, with a text layer on top so
// a passage can be selected and copied. On a dark canvas the pages can be
// shown light on dark. The one link off the site is the archive, for the
// companion documents.

import { useCallback, useEffect, useRef, useState } from 'react'
import { GlobalWorkerOptions, getDocument, TextLayer, type PDFDocumentProxy } from 'pdfjs-dist'
import workerSource from 'pdfjs-dist/build/pdf.worker.min.mjs?raw'
import thesis from '../assets/Canonical_Thesis_v2_1d.pdf?inline'
import { copy } from '../copy'

/** The archive's concept record: it always resolves to the latest version. */
export const ZENODO_URL = 'https://doi.org/10.5281/zenodo.21863760'

// The parser runs off the main thread in a classic worker made from its own
// source. A module worker from a blob will not start where the page has no
// origin of its own, opened from disk or in a sandboxed frame, and says
// nothing when it fails; a classic worker starts in both. The source is an ES
// module only for its one closing export, which a classic script cannot
// carry and the worker does not need: it wires itself to its port on load.
let workerReady = false
function ensureWorker() {
  if (workerReady) return
  const classic = workerSource.replace(/export\s*\{[^}]*\};?\s*$/, '')
  const url = URL.createObjectURL(new Blob([classic], { type: 'text/javascript' }))
  GlobalWorkerOptions.workerPort = new Worker(url)
  workerReady = true
}

/**
 * The PDF's bytes. The build carries them as a base64 data address, decoded
 * here with no request at all; the dev server serves the file instead.
 */
async function bytesOf(src: string): Promise<Uint8Array> {
  const m = /^data:[^,]*;base64,/.exec(src)
  if (!m) return new Uint8Array(await (await fetch(src)).arrayBuffer())
  const bin = atob(src.slice(m[0].length))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

const ZOOMS = [0.6, 0.75, 0.9, 1, 1.15, 1.35, 1.6, 2]

export function Paper({ dark }: { dark: boolean }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [failed, setFailed] = useState(false)
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [darkPages, setDarkPages] = useState(true)
  const [width, setWidth] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const sizes = useRef<{ w: number; h: number }[]>([])

  useEffect(() => {
    let live = true
    let loaded: PDFDocumentProxy | null = null
    try {
      ensureWorker()
      bytesOf(thesis).then((data) => getDocument({ data }).promise).then(async (d) => {
        loaded = d
        const first = await d.getPage(1)
        const v = first.getViewport({ scale: 1 })
        sizes.current = Array.from({ length: d.numPages }, () => ({ w: v.width, h: v.height }))
        if (live) setDoc(d); else void d.destroy()
      }, () => { if (live) setFailed(true) })
    } catch { setFailed(true) }
    // A worker that never answers fails without a word; after a while, say so.
    const giveUp = window.setTimeout(() => { if (live && !loaded) setFailed(true) }, 12000)
    return () => { live = false; clearTimeout(giveUp); if (loaded) void loaded.destroy() }
  }, [])

  // The page column follows the room it has.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const base = Math.min(860, Math.max(240, width - 48))
  const pageW = Math.round(base * zoom)

  // Which page is in view, for the counter.
  const onScroll = useCallback(() => {
    const el = scroller.current
    if (!el) return
    const mid = el.scrollTop + el.clientHeight * 0.35
    const kids = el.querySelectorAll<HTMLElement>('.paper-page')
    let n = 1
    kids.forEach((k, i) => { if (k.offsetTop <= mid) n = i + 1 })
    setPage(n)
  }, [])

  const goTo = (n: number) => {
    const el = scroller.current
    const k = el?.querySelectorAll<HTMLElement>('.paper-page')[n - 1]
    if (el && k) el.scrollTo({ top: k.offsetTop - 16, behavior: 'smooth' })
  }
  const zoomBy = (d: number) => {
    const i = ZOOMS.findIndex((z) => z >= zoom - 1e-6)
    const next = ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, (i < 0 ? ZOOMS.length - 1 : i) + d))]!
    setZoom(next)
  }
  const total = doc?.numPages ?? 0

  return (
    <div className={`paper-page-wrap${dark && darkPages ? ' paper-dark' : ''}`}>
      <header className="paper-head">
        <div className="paper-titles">
          <div className="paper-eyebrow">{copy.paper_eyebrow}</div>
          <h1 className="paper-title">{copy.paper_title}</h1>
          <p className="paper-sub">{copy.paper_sub}</p>
        </div>
        <div className="paper-tools" role="toolbar" aria-label={copy.paper_title}>
          <button type="button" onClick={() => goTo(Math.max(1, page - 1))} disabled={!doc || page <= 1} aria-label={copy.paper_prev} title={copy.paper_prev}>&#8249;</button>
          <span className="paper-count" aria-live="polite">{doc ? copy.paper_page.replace('{n}', String(page)).replace('{total}', String(total)) : copy.paper_loading}</span>
          <button type="button" onClick={() => goTo(Math.min(total, page + 1))} disabled={!doc || page >= total} aria-label={copy.paper_next} title={copy.paper_next}>&#8250;</button>
          <span className="paper-sep" aria-hidden="true" />
          <button type="button" onClick={() => zoomBy(-1)} disabled={zoom <= ZOOMS[0]!} aria-label={copy.paper_zoom_out} title={copy.paper_zoom_out}>&minus;</button>
          <button type="button" className="paper-fit" onClick={() => setZoom(1)} aria-pressed={zoom === 1} title={copy.paper_fit}>{Math.round(zoom * 100)}%</button>
          <button type="button" onClick={() => zoomBy(1)} disabled={zoom >= ZOOMS[ZOOMS.length - 1]!} aria-label={copy.paper_zoom_in} title={copy.paper_zoom_in}>+</button>
          {dark && (
            <>
              <span className="paper-sep" aria-hidden="true" />
              <button type="button" className="paper-shade" onClick={() => setDarkPages((v) => !v)} title={copy.paper_pages_hint}>{darkPages ? copy.paper_pages_light : copy.paper_pages_dark}</button>
            </>
          )}
        </div>
      </header>
      <div className="paper-scroll" ref={scroller} onScroll={onScroll} tabIndex={0} aria-label={copy.paper_title}>
        {failed && <p className="paper-failed">{copy.paper_failed}</p>}
        {!doc && !failed && <div className="paper-loading" aria-hidden="true"><span /><span /><span /></div>}
        {doc && sizes.current.map((sz, i) => (
          <PaperPage key={i} doc={doc} n={i + 1} width={pageW} ratio={sz.h / sz.w} root={scroller} />
        ))}
        <footer className="paper-foot">
          <p>{copy.paper_more}</p>
          <a href={ZENODO_URL} target="_blank" rel="noopener noreferrer">{copy.paper_link} <span aria-hidden="true">&#8599;</span></a>
        </footer>
      </div>
    </div>
  )
}

/** One page: a placeholder of the right size, drawn when it nears the view. */
function PaperPage({ doc, n, width, ratio, root }: { doc: PDFDocumentProxy; n: number; width: number; ratio: number; root: React.RefObject<HTMLDivElement> }) {
  const box = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(n <= 2)
  useEffect(() => {
    const el = box.current
    if (!el || near) return
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) setNear(true) }, { root: root.current, rootMargin: '900px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [near, root])

  useEffect(() => {
    const el = box.current
    if (!el || !near || width <= 0) return
    let cancelled = false
    let task: { cancel: () => void } | null = null
    let text: TextLayer | null = null
    void doc.getPage(n).then((pg) => {
      if (cancelled) return
      const scale = width / pg.getViewport({ scale: 1 }).width
      const vp = pg.getViewport({ scale })
      const dpr = Math.min(3, window.devicePixelRatio || 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(vp.width * dpr)
      canvas.height = Math.floor(vp.height * dpr)
      canvas.className = 'paper-canvas'
      const layer = document.createElement('div')
      layer.className = 'textLayer'
      el.style.setProperty('--scale-factor', String(scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const r = pg.render({ canvasContext: ctx, viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined })
      task = r
      r.promise.then(() => {
        if (cancelled) return
        el.replaceChildren(canvas, layer)
        text = new TextLayer({ textContentSource: pg.streamTextContent(), container: layer, viewport: vp })
        void text.render().catch(() => {})
      }, () => {})
    })
    return () => { cancelled = true; task?.cancel(); text?.cancel() }
  }, [doc, n, width, near])

  return <div className="paper-page" ref={box} style={{ width, height: Math.round(width * ratio) }} data-page={n} />
}
