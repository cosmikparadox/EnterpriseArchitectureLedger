// The 3D force-directed graph. Spec section 4.1.
//
// 3d-force-graph drives three.js and d3-force-3d underneath. Subdomain hulls
// are added to its scene directly, because they have to follow the layout as it
// settles.

import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import ForceGraph3D from '3d-force-graph'
import * as THREE from 'three'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'
import SpriteText from 'three-spritetext'
import { CONNECTOR, CONNECTOR_DARK, NEUTRAL, NEUTRAL_DIM, SUBDOMAIN_COLOUR, type GLink, type GNode, type GraphData } from '../app/graph'
import { ringTexture, type RingSplit } from './rings'
import { reportSelectedScreenPos } from '../app/layoutReport'
import { useLedger } from '../app/store'
import { canonicalFrame, cameraBlend, easeInOut, flatten, nodeFold, schedule, toFrame, turnMs, FLAT_FOV, type FlatStats } from './fold'

export type LabelMode = 'all' | 'selected' | 'hubs' | 'none'

/**
 * A node is a hub for labelling purposes once this many use cases ride it.
 * View 5 shows two whole estates at once, where every label would be a smear
 * and no label leaves two abstract blobs that look identical. Naming only the
 * nodes the comparison is about is what makes the difference readable.
 */
const HUB_RIDERS = 8

export interface Graph3DProps {
  data: GraphData
  dark: boolean
  showHulls: boolean
  labelMode: LabelMode
  selectedId: string | null
  isolatedSubdomain: string | null
  flyToId: string | null
  /**
   * Called once the force simulation has come to rest, with the settled
   * positions. The tour waits for this before flying the camera, because a
   * camera aimed at a node that is still moving arrives somewhere else.
   */
  onSettle?: (nodes: { id: string; x: number; y: number; z: number }[]) => void
  /** View 2 only. Returns the metered/rule split to draw around a node. */
  nodeRing?: (n: GNode) => RingSplit | null
  /** View 3. The platform being failed, drawn pulsing. */
  failedNodeId?: string | null
  /** View 3. Use cases the failure reached, drawn as wireframe. */
  affectedUseCases?: Set<string>
  /** View 3. Edges the failure propagated along, keyed "ucId>platformId". */
  litLinks?: Set<string>
  /** View 4. Nodes not yet attached at the current month, drawn faint. */
  dimNodes?: Set<string>
  /**
   * Links touching any of these nodes are not drawn at all. The intro reveals
   * the estate in beats and a line to a node that has not arrived yet would
   * give the node away; dimming alone leaves the lines.
   */
  hideLinksOf?: Set<string>
  /** View 6. Edges that cross a declared boundary, drawn dashed. */
  dashedLinks?: Set<string>
  onSelectNode: (id: string) => void
  onSelectLink: (link: GLink) => void
  onBackground: () => void
  /**
   * A click on a subdomain hull. The library only knows about nodes and links,
   * so a click that hits neither reaches onBackgroundClick, and the hulls are
   * raycast there before the click is called background.
   */
  onSelectHull?: (subdomainId: string) => void
  /**
   * A pulsing marker on the canvas, pointing at one hull or one node, with a
   * few words beside it. The intro uses it to say "tap one of these". The
   * marker is a DOM element moved by hand each frame, not React state, so it
   * follows the camera without a render per frame.
   */
  callout?: { kind: 'hull' | 'node'; id: string; text: string } | null
  /** A small card on the canvas, pinned to one hull or node, with its own content. */
  popover?: { kind: 'hull' | 'node'; id: string; content: ReactNode } | null
  /** Hulls not yet revealed, drawn at nothing. Absent: a hull shows when any of its use cases does. */
  dimHulls?: Set<string>
  /** Set when the viewer asked for less motion: opacity changes land at once. */
  reducedMotion?: boolean
  /** Reveal newly shown nodes and links one after another rather than together. */
  stagger?: boolean
  /**
   * A few words at the foot of the canvas saying it can be turned, shown until
   * the viewer drags. The story shows it once, on the first picture.
   */
  gestureHint?: string | null
  /** A few nodes ringed and pulsing, with a tap hint that fades, until the reader taps one. */
  pokes?: { ids: string[]; text: string } | null
  /** In the story, a tap near a line takes it before a domain does. */
  preferLines?: boolean
  /** The viewer dragged the canvas: the hint has done its job. */
  onGesture?: () => void
  /**
   * A small ledger book pinned to a corner of the canvas, with a line drawn
   * from one node to each of its ruled rows. Part three's opening: the graph
   * is where the entries come from.
   */
  book?: { id: string; title: string; rows: { label: string; value?: string }[]; note: string } | null
  /**
   * Focus. Everything outside the set drops to a ghost: nodes to a trace,
   * their labels off, links between two ghosts to a faint line, hulls not
   * named to a quarter. The one control on the card changes the set, so the
   * picture answers the slider and nothing else competes with it.
   */
  focus?: { nodes: Set<string>; hulls?: Set<string> } | null
  /**
   * A wave. The lit links and affected nodes light in order of their distance
   * from the source rather than all at once, so a failure is seen to spread.
   * A new nonce replays it. `hop` puts a node or a link key on a later ring.
   */
  wave?: { from: string; nonce: number; hop?: Map<string, number> } | null
  /** Boundary-crossing lines drawn faint rather than bright: the story's lines beat. */
  dashedFaint?: boolean
  /** A note in the corner of the canvas, in the book's frame, with its own content. */
  note?: ReactNode | null
  /** A node the note is pinned beside, instead of the corner. */
  noteAt?: string | null
  /**
   * Value flow. Each line is tinted by where its use case's value lands,
   * warm for a customer, cooler for an outside counterparty, cool for
   * inside, and widened by the work it carries; particles run along it.
   * warmth is per use case id, 0 to 1; share is per link key, 0 to 1.
   */
  flow?: { warmth: Map<string, number>; share: Map<string, number> } | null
}

/** Nodes the layout must not push to the rim. Spec section 12: pin the identity
 *  node and the data platform near the centre if the layout drifts them out.
 *  Implemented as a pull toward the origin rather than a hard pin, so the rest
 *  of the physics stays honest. */
/** Hull fill and edge opacity when fully shown. */
const HULL_FILL = 0.085
const HULL_EDGE = 0.3
/** Strength of the pull that keeps each part of the business in its sector. */
const SECTOR_PULL = 0.1
/** What a node outside the focus fades to: a trace, so the shape of the estate stays. */
const GHOST = 0.2
/** The value flow gradient: inside the company, an outside counterparty, a customer. */
const FLOW_COOL = new THREE.Color('#4a7bb5')
const FLOW_WARM = new THREE.Color('#f2a541')
function flowColour(warmth: number): string {
  return '#' + FLOW_COOL.clone().lerp(FLOW_WARM, Math.max(0, Math.min(1, warmth))).getHexString()
}

interface Positioned { x?: number; y?: number; z?: number; vx?: number; vy?: number; vz?: number }

/** Development-only timings, read by the perf probe. */
function perf(k: string, ms: number): void {
  const w = window as unknown as { __perf?: Record<string, number[]> }
  w.__perf ??= {}
  ;(w.__perf[k] ??= []).push(Math.round(ms * 10) / 10)
}

/** FNV-1a over every node's id and settled position, to a hundredth. */
function layoutDigest(nodes: (GNode & Positioned)[]): string {
  let h = 0x811c9dc5
  const text = nodes.map((n) => `${n.id}:${(n.x ?? 0).toFixed(2)},${(n.y ?? 0).toFixed(2)},${(n.z ?? 0).toFixed(2)}`).join(';')
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

// ---- one pinned layout per estate, for the session ----
//
// Audit brief v0.5, 17.2 and 17.3. Each estate is laid out once, from its
// seeds, then turned into its canonical frame and pinned for good. Every
// later mount, on any screen or beat, places the nodes where they were: no
// simulation runs again and no position changes. The flat position of each
// node is derived from the same layout, so the fold is the map folded, not a
// different map.
type P3 = [number, number, number]
interface EstateLayout {
  pos: Map<string, P3>
  sub: Map<string, string | undefined>
  flat: Map<string, [number, number]>
  /** Each part of the business's anchor point, in the canonical frame. */
  anchors: Map<string, P3>
  stats: FlatStats
}
const LAYOUTS = new Map<string, EstateLayout>()
const isSynthetic = (id: string) => id.startsWith('uc_added_')
/** Which estate this is: its node ids, synthetic riders aside. */
function layoutKey(data: GraphData): string {
  const ids = data.nodes.map((n) => n.id).filter((id) => !isSynthetic(id)).sort().join('|')
  let h = 0x811c9dc5
  for (let i = 0; i < ids.length; i++) { h ^= ids.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(16)
}
const f32 = Math.fround
/** The 3D field of view, the library's default. */
const FOV_3D = 50
/**
 * Audit brief v0.5, 17.12, applied per device: once a fold has run at a
 * median frame slower than this, later switches on this page crossfade
 * instead, as they do for a reader who asked for less motion.
 */
const SLOW_FOLD_MS = 34
let slowFolds = false
/** Room for the wordmark at the top of the canvas in the story. */
const STORY_TOP = 60

/** The convex hull of points in the plane, counter-clockwise. */
function hull2d(pts: [number, number][]): [number, number][] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o: [number, number], a: [number, number], b: [number, number]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: [number, number][] = []
  for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, q) <= 0) lower.pop(); lower.push(q) }
  const upper: [number, number][] = []
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]!; while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, q) <= 0) upper.pop(); upper.push(q) }
  return lower.slice(0, -1).concat(upper.slice(0, -1))
}

/**
 * Rings face the camera, always. A ring seen edge-on used to read as a thick
 * slash, and at rest as a dark oval. Set just before the ring is drawn, so
 * it costs nothing when the ring is hidden and allocates nothing.
 */
function billboard(this: THREE.Object3D, _r: THREE.WebGLRenderer, _s: THREE.Scene, cam: THREE.Camera) {
  this.quaternion.copy(cam.quaternion)
  this.updateMatrixWorld()
}

/** Everything built for one node, so state can be set on it without rebuilding. */
interface NodeObjs {
  mesh: THREE.Mesh
  solid: THREE.MeshLambertMaterial
  wire: THREE.MeshBasicMaterial
  halo: THREE.Mesh
  ring: THREE.Mesh
  fail: THREE.Mesh
  label: SpriteText | null
  ringSprite: THREE.Sprite | null
  colour: string
  /** Opacity tween: where it started, where it is going, and when it began. */
  fadeFrom: number
  fadeTo: number
  fadeT0: number
  /** The wave has reached this node. */
  lit?: boolean
  /** The halo pulse the wave gave it ends here. */
  pulseUntil?: number
  /** The split painted on the view 2 ring, so it is repainted only when it changes. */
  ringFrac?: number
}

function disposeMesh(m: THREE.Mesh): void {
  m.geometry.dispose()
  const mat = m.material
  if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
  else mat.dispose()
}

/** GPU resources do not go with the garbage collector. Every texture, geometry
 *  and material made for a node is released here when the node is rebuilt or
 *  the graph unmounts. */
function disposeNode(o: NodeObjs): void {
  o.mesh.geometry.dispose()
  o.solid.dispose()
  o.wire.dispose()
  disposeMesh(o.halo)
  disposeMesh(o.ring)
  disposeMesh(o.fail)
  if (o.label) {
    const lm = o.label.material as THREE.SpriteMaterial
    lm.map?.dispose()
    lm.dispose()
  }
  if (o.ringSprite) {
    o.ringSprite.material.map?.dispose()
    o.ringSprite.material.dispose()
  }
}

export function Graph3D(props: Graph3DProps) {
  const holder = useRef<HTMLDivElement>(null)
  const libEl = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gRef = useRef<any>(null)
  const hullGroup = useRef<THREE.Group | null>(null)
  const fitRef = useRef<((ms: number) => void) | null>(null)
  const propsRef = useRef(props)
  propsRef.current = props
  const dimension = useLedger((s) => s.dimension)
  /** The estate's pinned layout, and this canvas's live copy of it. */
  const lay = useRef<EstateLayout | null>(null)
  const keyRef = useRef('')
  const live3 = useRef(new Map<string, P3>())
  const live2 = useRef(new Map<string, [number, number]>())
  /** Nodes placed or moved since the last settle: their positions are new. */
  const travellers = useRef(new Set<string>())
  const anchorPts = useRef(new Map<string, P3>())
  /** The mode the canvas shows once any fold has finished. */
  const modeRef = useRef<'2d' | '3d'>(useLedger.getState().dimension)
  /** Set while a fold runs; the engine stop it ends with is not a settle. */
  const foldOn = useRef(false)
  const foldStop = useRef(false)
  /** Where the canvas's free area is: the card's column and the wordmark. */
  const view = useRef({ inset: 0, top: 0, apply: () => {} })

  // ---- create once ----
  useEffect(() => {
    const el = holder.current
    const lib = libEl.current
    if (!el || !lib) return
    // The library empties the element it is given. It gets one of its own,
    // under the holder, so the ring, the note, the book and the hint that
    // React renders beside it are not swept away on a deep link or when a
    // theme change rebuilds the nodes.
    const g = ForceGraph3D()(lib)
    gRef.current = g

    // Broad device support. A 3x display pays nine times the fill for a graph
    // that does not need it; 1.5 is where the edge of a sphere stops looking
    // stepped and the cost stops climbing. And a hidden tab renders nothing:
    // the loop is paused until it is looked at again.
    g.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    const onVisibility = () => { document.hidden ? g.pauseAnimation() : g.resumeAnimation() }
    document.addEventListener('visibilitychange', onVisibility)

    g.backgroundColor('rgba(0,0,0,0)')
      .showNavInfo(false)
      .nodeRelSize(4)
      .nodeVal((n: object) => (n as GNode).val)
      // A node not yet revealed by the intro has no hover label and no click.
      .nodeLabel((n: object) => (propsRef.current.dimNodes?.has((n as GNode).id) ? '' : (n as GNode).name))
      .onNodeClick((n: object, ev: MouseEvent) => {
        const id = (n as GNode).id
        // A node the intro has not revealed is not there yet: the click falls
        // through to whatever is behind it, the hull or the background.
        if (propsRef.current.dimNodes?.has(id)) { clickBehind(ev); return }
        propsRef.current.onSelectNode(id)
      })
      .linkLabel((l: object) => {
        const k = l as GLink
        return `${Math.round(k.units).toLocaleString('en-GB')} units, USD ${Math.round(k.spend).toLocaleString('en-GB')}/month`
      })
      .onLinkClick((l: object) => propsRef.current.onSelectLink(l as GLink))
      .onBackgroundClick((ev: MouseEvent) => clickBehind(ev))
      .enableNodeDrag(false)
      // A4. Seeding the starting positions is only half of a reproducible
      // layout. By default the simulation stops after 15 seconds of wall time,
      // so how far it got depends on the frame rate of the machine it ran on and
      // two loads settle differently. Counting ticks instead of milliseconds is
      // what makes the shape the same every time. 300 is where d3's default
      // alpha decay reaches its floor, so nothing is cut short.
      //
      // The ticks run before the first frame rather than across the first
      // five seconds. A screen that mounts with the estate already settled
      // and framed is calm; one that assembles in front of the reader, on
      // every switch of view, read as churn.
      .warmupTicks(300)
      .cooldownTicks(0)
      .cooldownTime(Infinity)

    // No node is pulled to the centre. The identity hub used to be, so the
    // whole picture was built around one platform before the story had said
    // a word about it; the links alone now decide where it sits, and the
    // story anchors on a node only when a beat names one.
    // Hold each part of the business in its sector. The link force pulls the
    // use cases of two parts that share most of their platforms onto the same
    // spot; this pull toward the part's anchor direction is what keeps their
    // coloured regions apart. It is gentle, and it fades with alpha like the
    // rest of the simulation, so the settled shape is still the forces' own.
    g.d3Force('sector', ((alpha: number) => {
      // Anchor points, in whichever frame the layout is in: the seeds' own
      // at first, the canonical frame once the layout is pinned.
      const anchors = anchorPts.current
      for (const n of (g.graphData().nodes as (GNode & Positioned)[])) {
        if (n.kind !== 'use_case' || !n.subdomain) continue
        const a = anchors.get(n.subdomain)
        if (!a) continue
        n.vx = (n.vx ?? 0) + (a[0] - (n.x ?? 0)) * SECTOR_PULL * alpha
        n.vy = (n.vy ?? 0) + (a[1] - (n.y ?? 0)) * SECTOR_PULL * alpha
        n.vz = (n.vz ?? 0) + (a[2] - (n.z ?? 0)) * SECTOR_PULL * alpha
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const charge = g.d3Force('charge') as any
    if (charge?.strength) charge.strength(-140)

    const group = new THREE.Group()
    hullGroup.current = group
    g.scene().add(group)
    // Dev-only seam for the acceptance script: where each hull sits on screen,
    // so a test can click a coloured region the way a viewer would.
    if (import.meta.env.DEV) {
      ;(window as unknown as { __layout?: unknown }).__layout = () => ({
        camera: g.cameraPosition(),
        nodes: (g.graphData().nodes as (GNode & Positioned)[]).map((n) => ({ id: n.id, kind: n.kind, sub: n.subdomain, x: n.x, y: n.y, z: n.z })),
      })
      ;(window as unknown as { __hullAlpha?: unknown }).__hullAlpha = () => Object.fromEntries([...hullAlpha.current].map(([k, a]) => [k, a.cur]))
      // Every node's material state, so a check can tell a canvas at rest
      // from one a story left something on.
      ;(window as unknown as { __nodeState?: unknown }).__nodeState = () =>
        [...objs.current].map(([id, o]) => ({ id, opacity: Math.round(o.solid.opacity * 100) / 100, wire: o.mesh.material === o.wire, visible: o.mesh.visible, lit: !!o.lit, halo: o.halo.visible, ring: o.ring.visible, fail: o.fail.visible, emissive: o.solid.emissiveIntensity }))
      ;(window as unknown as { __nodeScreen?: unknown }).__nodeScreen = () => {
        const el = holder.current
        if (!el) return []
        const box = el.getBoundingClientRect()
        return (g.graphData().nodes as (GNode & Positioned)[]).map((n) => {
          const p = g.graph2ScreenCoords(n.x ?? 0, n.y ?? 0, n.z ?? 0)
          return { id: n.id, x: box.left + p.x, y: box.top + p.y }
        })
      }
      ;(window as unknown as { __hullScreen?: unknown }).__hullScreen = () => {
        const el = holder.current
        if (!el) return []
        const box = el.getBoundingClientRect()
        const cam = g.camera()
        return group.children
          .filter((c): c is THREE.Mesh => (c as THREE.Mesh).isMesh)
          .map((m) => {
            // The mean of the projected vertices is a convex combination of
            // them, so it lies inside the shape the viewer sees, where the
            // box centre of a thin hull need not.
            const pos = m.geometry.getAttribute('position')
            const c = new THREE.Vector3()
            const v = new THREE.Vector3()
            for (let i = 0; i < pos.count; i++) c.add(v.fromBufferAttribute(pos, i).project(cam))
            c.divideScalar(Math.max(1, pos.count))
            return { subdomain: m.userData.subdomain as string, x: box.left + ((c.x + 1) / 2) * box.width, y: box.top + ((1 - c.y) / 2) * box.height }
          })
      }
    }

    let ticks = 0
    let framed = false
    // Every fourth tick: the hulls follow a travelling node closely enough
    // to read as the domain taking it in, without paying for every frame.
    g.onEngineTick(() => { if (++ticks % 4 === 0 && !foldOn.current) rebuildHulls() })
    g.onEngineStop(() => {
      // The stop that ends a fold is not a settle: nothing new was laid out.
      if (foldStop.current) { foldStop.current = false; return }
      // First layout of this estate: turn it into its canonical frame and
      // pin it. Any later settle records what moved and pins it too.
      settleLayout()
      // The settled layout, as a digest on the document root. This is how
      // "the same shape on every load" is checked rather than asserted.
      document.documentElement.dataset.layoutDigest = layoutDigest(g.graphData().nodes as (GNode & Positioned)[])
      rebuildHulls()
      const settled = (g.graphData().nodes as (GNode & Positioned)[])
        .map((n) => ({ id: n.id, x: n.x ?? 0, y: n.y ?? 0, z: n.z ?? 0 }))
      propsRef.current.onSettle?.(settled)
      // Frame the whole estate once, rather than leaving it small in the middle
      // of the canvas. Only on the first settle, so it does not yank the camera
      // back after the user has moved it.
      if (!framed) {
        framed = true
        const ms = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600
        // Unless a beat has already flown to a node, on a deep link.
        if (!cameraTaken.current) fit(ms)
      }
    })

    // The card's column. The canvas stays full width, so the picture can
    // be dragged anywhere and nothing ends at an invisible wall; the camera's
    // view is offset instead, so the picture is centred in the space the
    // card leaves. The card publishes its width on the root; the shell says
    // which side it docks on.
    const inset = () => {
      const root = document.documentElement
      if (root.dataset.storyDock !== 'right') return 0
      const w = parseFloat(getComputedStyle(root).getPropertyValue('--tour-card-actual-w')) || 0
      return w > 0 ? w + 24 : 0
    }
    let insetNow = 0
    const applyOffset = () => {
      const cam = g.camera() as THREE.PerspectiveCamera
      const W = el.clientWidth, H = el.clientHeight
      insetNow = inset()
      // A canvas too narrow to give up the card's column keeps its whole
      // width, and the fit below must not subtract an inset that was never
      // applied, or the picture is framed for a negative width and shrinks
      // to a dot.
      if (!(insetNow > 0 && W > insetNow + 80)) insetNow = 0
      // In the story the wordmark sits at the top of the canvas. The picture
      // is framed below it, so it never covers a node.
      const top = document.documentElement.dataset.storyDock && H > STORY_TOP * 4 ? STORY_TOP : 0
      if (insetNow > 0 || top > 0) cam.setViewOffset(W + insetNow, H + top, insetNow, 0, W, H)
      else cam.clearViewOffset()
      cam.updateProjectionMatrix()
      view.current.inset = insetNow
      view.current.top = top
    }
    view.current.apply = applyOffset
    // Framing. The library fits the box around every object, labels and
    // rings included, which lands the picture at about half the canvas. This
    // fits the sphere around the node positions instead: the layout is
    // centred on the origin, so the camera stands off along its own line of
    // sight far enough for that sphere to fill the shorter side, with a
    // little room for the labels at the rim.
    // Both fixed poses come from the same framing: the fold-ready pose for
    // 3D, on every screen, and the flat pose for 2D. The camera moves there
    // through the one camera mover, so two moves never fight.
    const fit = (ms: number) => {
      if ((g.graphData().nodes as object[]).length === 0) return
      applyOffset()
      const pose = poseFor(modeRef.current)
      if (modeRef.current === '2d') flatDist.current = pose.pos.distanceTo(pose.target)
      document.documentElement.dataset.mapDimension = modeRef.current
      moveCamera(pose, ms)
    }
    fitRef.current = fit
    // Re-frame the estate when the canvas changes size, until the viewer takes
    // the camera. Opening a panel or turning the split narrows the canvas, and
    // without this the graph stays framed for a box that no longer exists and
    // drifts off to one side. Once somebody has orbited, their camera is theirs.
    let userMovedCamera = false
    cameraTaken.current = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = g.controls() as any
    controls?.addEventListener?.('start', () => { userMovedCamera = true })
    // A drag, as opposed to a tap, is what the gesture hint waits for: a
    // pointer that has travelled more than a few pixels while down.
    let downAt: { x: number; y: number } | null = null
    const onDown = (e: PointerEvent) => { downAt = { x: e.clientX, y: e.clientY } }
    const onMove = (e: PointerEvent) => {
      if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 8) return
      downAt = null
      gestureEl.current?.classList.add('gone')
      propsRef.current.onGesture?.()
    }
    const onUp = () => { downAt = null }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)

    let refit: ReturnType<typeof setTimeout> | undefined
    const ro = new ResizeObserver(() => {
      g.width(el.clientWidth)
      g.height(el.clientHeight)
      applyOffset()
      // Only once the layout has settled. Fitting while the simulation is still
      // spreading the nodes frames an estate a fraction of its final size, and
      // the graph ends up zoomed into the middle of itself.
      // The flat map always re-frames to its pose; the 3D one only until the
      // viewer has taken the camera.
      if (modeRef.current === '2d' && framed && !foldOn.current) { clearTimeout(refit); refit = setTimeout(() => { if (!foldOn.current) fit(300) }, 300); return }
      if (userMovedCamera || cameraTaken.current || !framed) return
      clearTimeout(refit)
      refit = setTimeout(() => { if (!userMovedCamera && !cameraTaken.current && framed) fit(300) }, 300)
    })
    ro.observe(el)
    g.width(el.clientWidth).height(el.clientHeight)
    // The card resizing, or the dock changing, moves the free space.
    const mo = new MutationObserver(() => {
      const before = insetNow
      applyOffset()
      if (before !== insetNow && framed && !foldOn.current && (modeRef.current === '2d' || (!userMovedCamera && !cameraTaken.current))) fit(400)
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'data-story-dock'] })

    return () => {
      clearTimeout(refit)
      ro.disconnect()
      mo.disconnect()
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      document.removeEventListener('visibilitychange', onVisibility)
      if (foldRaf.current) cancelAnimationFrame(foldRaf.current)
      if (camRaf.current) cancelAnimationFrame(camRaf.current)
      if (labelRaf.current) cancelAnimationFrame(labelRaf.current)
      for (const o of objs.current.values()) disposeNode(o)
      objs.current.clear()
      g._destructor()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * A click that reached past the nodes: a line if one passes within a few
   * pixels of it, then a hull if one is under it, else the background. The
   * lines are too thin to hit exactly, and a hull behind one would otherwise
   * take every tap meant for it.
   */
  function clickBehind(ev: MouseEvent) {
    // In the story a line wins within nine pixels. In the explorer a tap
    // inside a domain belongs to the domain, and lines outside one are
    // picked within the same reach.
    const hull = hullUnderPointer(ev)
    const line = propsRef.current.preferLines || !hull ? linkNearPointer(ev, 9) : null
    if (line) { propsRef.current.onSelectLink(line); return }
    const hit = hull
    if (hit && propsRef.current.onSelectHull) propsRef.current.onSelectHull(hit)
    else propsRef.current.onBackground()
  }

  function linkNearPointer(ev: MouseEvent, reach: number): GLink | null {
    const g = gRef.current
    const el = holder.current
    if (!g || !el) return null
    const box = el.getBoundingClientRect()
    const px = ev.clientX - box.left, py = ev.clientY - box.top
    const now = performance.now()
    let best: GLink | null = null, bestD = reach
    for (const raw of g.graphData().links as object[]) {
      const l = raw as GLink & { __showAt?: number; source: unknown; target: unknown }
      if ((l.__showAt ?? 0) > now) continue
      const a = l.source as Positioned, b = l.target as Positioned
      if (a?.x === undefined || b?.x === undefined) continue
      const pa = g.graph2ScreenCoords(a.x, a.y ?? 0, a.z ?? 0), pb = g.graph2ScreenCoords(b.x, b.y ?? 0, b.z ?? 0)
      const dx = pb.x - pa.x, dy = pb.y - pa.y, len2 = dx * dx + dy * dy
      if (len2 < 1) continue
      // Nearest point on the segment, kept off the ends so a node's own
      // neighbourhood still belongs to the node.
      const t = Math.min(0.92, Math.max(0.08, ((px - pa.x) * dx + (py - pa.y) * dy) / len2))
      const d = Math.hypot(px - (pa.x + t * dx), py - (pa.y + t * dy))
      if (d < bestD) { bestD = d; best = l }
    }
    return best
  }

  // ---- hulls ----
  // Which hull, if any, is under a pointer event. Only the solid meshes are
  // tested; the wireframe edges would make a hairline the target.
  const raycaster = useRef(new THREE.Raycaster())
  function hullUnderPointer(ev: MouseEvent): string | null {
    const g = gRef.current
    const group = hullGroup.current
    const el = holder.current
    if (!g || !group || !el) return null
    const box = el.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((ev.clientX - box.left) / box.width) * 2 - 1,
      -((ev.clientY - box.top) / box.height) * 2 + 1,
    )
    raycaster.current.setFromCamera(ndc, g.camera())
    const meshes = group.children.filter((c): c is THREE.Mesh => (c as THREE.Mesh).isMesh)
    // Flat, every hull is a single sheet and a chord means nothing: the
    // smallest shape under the pointer wins, as below.
    const hits = modeRef.current === '2d' ? [] : raycaster.current.intersectObjects(meshes, false)
    // Hulls overlap around shared platforms, so the nearest surface is often
    // the edge of a neighbour. The ray enters and leaves each hull it passes
    // through; the one it crosses most deeply is the one the pointer is over.
    const chord = new Map<string, { near: number; far: number }>()
    for (const h of hits) {
      const sub = h.object.userData.subdomain as string
      const c = chord.get(sub)
      if (!c) chord.set(sub, { near: h.distance, far: h.distance })
      else { c.near = Math.min(c.near, h.distance); c.far = Math.max(c.far, h.distance) }
    }
    let best: string | null = null
    let bestLen = -1
    for (const [sub, c] of chord) if (c.far - c.near > bestLen) { bestLen = c.far - c.near; best = sub }
    if (best) return best
    // A thin hull seen edge-on can let the ray through between its faces.
    // The coloured shape the viewer sees is the hull's projection, so a
    // pointer inside that projection is on the hull: the smallest projected
    // shape containing the point wins, so an overlap resolves to the tighter
    // one.
    const cam = g.camera()
    const px = ((ev.clientX - box.left) / box.width) * 2 - 1
    const py = -((ev.clientY - box.top) / box.height) * 2 + 1
    let bestArea = Infinity
    for (const m of meshes) {
      const sub = m.userData.subdomain as string | undefined
      if (!sub || m.userData.edge) continue
      const poly = projectedHull(m, cam)
      if (poly.length < 3 || !pointInConvex(px, py, poly)) continue
      const area = polygonArea(poly)
      if (area < bestArea) { bestArea = area; best = sub }
    }
    return best
  }
  /** The 2D convex outline of a mesh's vertices in normalised device space. */
  function projectedHull(m: THREE.Mesh, cam: THREE.Camera): [number, number][] {
    const pos = m.geometry.getAttribute('position')
    const pts: [number, number][] = []
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).project(cam); if (Number.isFinite(v.x) && Number.isFinite(v.y)) pts.push([v.x, v.y]) }
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1])
    const cross = (o: [number, number], a: [number, number], b: [number, number]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    const lower: [number, number][] = []
    for (const p of pts) { while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) lower.pop(); lower.push(p) }
    const upper: [number, number][] = []
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]!; while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) upper.pop(); upper.push(p) }
    return lower.slice(0, -1).concat(upper.slice(0, -1))
  }
  function pointInConvex(x: number, y: number, poly: [number, number][]): boolean {
    let sign = 0
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i]!, b = poly[(i + 1) % poly.length]!
      const c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])
      if (c === 0) continue
      if (sign === 0) sign = Math.sign(c); else if (Math.sign(c) !== sign) return false
    }
    return true
  }
  function polygonArea(poly: [number, number][]): number {
    let a = 0
    for (let i = 0; i < poly.length; i++) { const p = poly[i]!, q = poly[(i + 1) % poly.length]!; a += p[0] * q[1] - q[0] * p[1] }
    return Math.abs(a) / 2
  }

  /** Put each hull's current alpha on its materials, without rebuilding. */
  function paintHullAlpha() {
    const group = hullGroup.current
    if (!group) return
    let needRebuild = false
    for (const c of group.children) {
      const sub = c.userData.subdomain as string | undefined
      if (!sub) continue
      const a = hullAlpha.current.get(sub)?.cur ?? 1
      const m = (c as THREE.Mesh).material as THREE.Material
      m.opacity = (c.userData.edge ? HULL_EDGE : HULL_FILL) * a
      if (a <= 0) needRebuild = true
    }
    // A hull arriving from nothing has no mesh yet; one rebuild gives it one.
    const missing = [...hullAlpha.current].some(([sub, a]) => a.cur > 0 && !group.children.some((c) => c.userData.subdomain === sub))
    if (needRebuild || missing) rebuildHulls()
  }

  function clearHulls() {
    const group = hullGroup.current
    if (!group) return
    for (const c of [...group.children]) {
      group.remove(c)
      const m = c as THREE.Mesh
      m.geometry?.dispose()
      ;(m.material as THREE.Material)?.dispose()
    }
  }

  /** The hulls to draw: shown, not isolated away, not faded out. */
  function hullWanted(sub: string): number {
    const { isolatedSubdomain } = propsRef.current
    if (isolatedSubdomain && sub !== isolatedSubdomain) return 0
    return hullAlpha.current.get(sub)?.cur ?? 1
  }

  function rebuildHulls() {
    const g = gRef.current
    const group = hullGroup.current
    if (!g || !group) return
    // While a fold runs the hulls are moved in place, never rebuilt.
    if (foldOn.current) return
    clearHulls()
    const { showHulls, isolatedSubdomain } = propsRef.current
    if (!showHulls) return
    if (modeRef.current === '2d') { buildFlatHulls(); return }

    const bySub = new Map<string, THREE.Vector3[]>()
    for (const n of g.graphData().nodes as (GNode & Positioned)[]) {
      if (n.kind !== 'use_case' || !n.subdomain) continue
      if (n.x === undefined || n.y === undefined || n.z === undefined) continue
      const arr = bySub.get(n.subdomain) ?? []
      // A little padding around each point so the hull encloses the spheres
      // rather than passing through their centres.
      const pad = 7
      for (const d of [[pad,0,0],[-pad,0,0],[0,pad,0],[0,-pad,0],[0,0,pad],[0,0,-pad]]) {
        arr.push(new THREE.Vector3(n.x + d[0]!, n.y + d[1]!, n.z + d[2]!))
      }
      bySub.set(n.subdomain, arr)
    }

    for (const [sub, pts] of bySub) {
      if (pts.length < 8) continue
      if (isolatedSubdomain && sub !== isolatedSubdomain) continue
      // A hull that has faded fully out is not built at all: nothing to draw,
      // nothing to hit with a click.
      const alpha = hullAlpha.current.get(sub)?.cur ?? 1
      if (alpha <= 0) continue
      let geom: ConvexGeometry
      try { geom = new ConvexGeometry(pts) } catch { continue }
      // Hulls overlap around shared platforms. Spec section 4.1: do not hide
      // this, the overlap IS the lesson. Additive blending makes the overlap
      // read as denser rather than hiding one hull behind another.
      const mat = new THREE.MeshBasicMaterial({
        color: SUBDOMAIN_COLOUR[sub] ?? NEUTRAL,
        transparent: true,
        opacity: HULL_FILL * alpha,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      const hull = new THREE.Mesh(geom, mat)
      hull.userData.subdomain = sub
      group.add(hull)
      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(geom, 24),
        new THREE.LineBasicMaterial({ color: SUBDOMAIN_COLOUR[sub] ?? NEUTRAL, transparent: true, opacity: HULL_EDGE * alpha }),
      )
      wire.userData.subdomain = sub
      wire.userData.edge = true
      group.add(wire)
    }
  }

  /**
   * The flat domains: a fill and an outline, no inner edges. Each is the
   * convex hull of its use cases' flat spots, padded like the 3D hull, so it
   * covers exactly what the folded 3D hull covered and the swap at the end
   * of a fold is invisible. Each domain sits at its own small depth and
   * render order, and neither fill nor outline writes depth, so overlaps do
   * not flicker. The fills stay additive: the overlap is the lesson.
   */
  function buildFlatHulls() {
    const g = gRef.current
    const group = hullGroup.current
    if (!g || !group) return
    const bySub = new Map<string, [number, number][]>()
    const pad = 7
    for (const n of g.graphData().nodes as (GNode & Positioned)[]) {
      if (n.kind !== 'use_case' || !n.subdomain || n.x === undefined) continue
      const arr = bySub.get(n.subdomain) ?? []
      const x = n.x, y = n.y ?? 0
      arr.push([x + pad, y], [x - pad, y], [x, y + pad], [x, y - pad], [x, y])
      bySub.set(n.subdomain, arr)
    }
    const order = [...bySub.keys()].sort()
    for (const [sub, pts] of bySub) {
      if (pts.length < 8) continue
      const alpha = hullWanted(sub)
      if (alpha <= 0) continue
      const poly = hull2d(pts)
      if (poly.length < 3) continue
      const k = order.indexOf(sub)
      const z = -0.6 - 0.04 * k
      const shape = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x, y)))
      const fill = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({
        color: SUBDOMAIN_COLOUR[sub] ?? NEUTRAL, transparent: true, opacity: HULL_FILL * alpha,
        side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
      }))
      fill.position.z = z
      fill.renderOrder = k
      fill.userData.subdomain = sub
      group.add(fill)
      const outline = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(poly.map(([x, y]) => new THREE.Vector3(x, y, 0))),
        new THREE.LineBasicMaterial({ color: SUBDOMAIN_COLOUR[sub] ?? NEUTRAL, transparent: true, opacity: HULL_EDGE * alpha, depthWrite: false }),
      )
      outline.position.z = z
      outline.renderOrder = k
      outline.userData.subdomain = sub
      outline.userData.edge = true
      group.add(outline)
    }
  }

  // ---- data ----
  //
  // The first data set is laid out from its seeds. Any later one is a change
  // to a picture the viewer is looking at, an added rider or a moved use case,
  // and the library would re-run the whole layout from the seeds again, so
  // every node jolted. Instead each node that was already there keeps its
  // place, held still while the change settles and let go once it has, and a
  // node that is new starts beside the platform it rides and fades in.
  const prevData = useRef<GraphData | null>(null)
  const freshIds = useRef(new Set<string>())
  useEffect(() => {
    const g = gRef.current
    if (!g) return
    const live = g.graphData().nodes as (GNode & Positioned)[]
    const settled = prevData.current !== null && live.some((n) => n.x !== undefined)
    prevData.current = props.data
    freshIds.current = new Set()
    const flat = modeRef.current === '2d'
    if (settled) {
      // The objects the library already holds are kept, for nodes and for
      // links alike, with their fields refreshed. The library binds its
      // three.js objects to the data objects by identity, so a kept object
      // is a node or a line that is not rebuilt: a slider step costs the
      // few nodes that are new, not every geometry on the canvas.
      const before = new Map(live.map((n) => [n.id, n]))
      const liveLinks = g.graphData().links as (GLink & { source?: unknown; target?: unknown })[]
      const beforeLinks = new Map(liveLinks.map((l) => [`${l.ucId}>${l.platformId}`, l]))
      const byId = new Map(props.data.nodes.map((n) => [n.id, n]))
      let k = 0
      let travelling = 0
      const nodes = props.data.nodes.map((n) => {
        const was = before.get(n.id)
        if (was && was.x !== undefined) {
          const movedSub = was.subdomain !== n.subdomain
          // The fresh node carries the seeded starting position every node
          // is built with; the live one keeps where the layout put it, or
          // the whole picture snaps back to its seeds at every change.
          const { x, y, z, vx, vy, vz } = was as Positioned & { vx?: number; vy?: number; vz?: number }
          Object.assign(was, n, { x, y, z, vx, vy, vz })
          // A use case moved to another part of the business is free to
          // travel to its new sector; everything else holds still. On the
          // flat map it travels in the plane.
          if (!movedSub) { was.fx = was.x; was.fy = was.y; was.fz = was.z }
          else { delete was.fx; delete was.fy; if (flat) was.fz = 0; else delete was.fz; travelling++; travellers.current.add(was.id) }
          return was
        }
        const fresh = n as GNode & Positioned
        freshIds.current.add(fresh.id)
        const link = props.data.links.find((l) => l.ucId === fresh.id || l.platformId === fresh.id)
        const anchor = link ? before.get(link.ucId === fresh.id ? link.platformId : link.ucId) : undefined
        // A ring that widens as more arrive, so twenty do not share one spot.
        const angle = k++ * 2.399
        const ring = 14 + 4 * Math.sqrt(k)
        fresh.x = (anchor?.x ?? 0) + Math.cos(angle) * ring
        fresh.y = (anchor?.y ?? 0) + Math.sin(angle) * ring
        fresh.z = flat ? 0 : (anchor?.z ?? 0) + (k % 2 ? 8 : -8)
        if (flat) fresh.fz = 0
        travellers.current.add(fresh.id)
        return fresh
      })
      const links = props.data.links.map((l) => {
        const was = beforeLinks.get(`${l.ucId}>${l.platformId}`)
        if (!was) return l
        was.spend = l.spend; was.units = l.units; was.cfp = l.cfp
        return was
      })
      for (const [id, o] of objs.current) if (!byId.has(id)) { disposeNode(o); objs.current.delete(id) }
      // A move travels: the released node is carried to its sector by the
      // forces over a couple of seconds, the hulls reshaping as it goes. An
      // addition settles before the frame, in a short warm-up.
      if (travelling > 0 && freshIds.current.size === 0) g.warmupTicks(0).cooldownTicks(260)
      // Thirty ticks settle a rider beside its platform; the profile put the
      // eighty this used to run at most of a slider step's cost.
      else g.warmupTicks(30).cooldownTicks(0)
      const t0 = performance.now()
      g.graphData({ nodes, links } as unknown as { nodes: object[]; links: object[] })
      if (import.meta.env.DEV) perf('graphData', performance.now() - t0)
      if (pendingFly.current && flyNow(pendingFly.current)) pendingFly.current = null
      return
    }
    // The first data on this canvas. If this estate has been laid out this
    // session, every node goes where it was, pinned, and nothing is laid out
    // again; a rider the layout never saw starts beside its platform, and a
    // use case moved across a line travels from its old spot.
    const key = layoutKey(props.data)
    keyRef.current = key
    const L = LAYOUTS.get(key) ?? null
    lay.current = L
    travellers.current = new Set()
    const r = props.data.radius
    anchorPts.current = L ? new Map(L.anchors) : new Map([...props.data.anchors].map(([sub, a]) => [sub, [a[0] * r, a[1] * r, a[2] * r] as P3]))
    if (L) {
      live3.current = new Map(L.pos)
      live2.current = new Map(L.flat)
      let free = 0, travelling = 0, k = 0
      for (const n of props.data.nodes as (GNode & Positioned)[]) {
        const p = L.pos.get(n.id), q = L.flat.get(n.id)
        if (p && q) {
          n.x = flat ? q[0] : p[0]; n.y = flat ? q[1] : p[1]; n.z = flat ? 0 : p[2]
          if (L.sub.get(n.id) === n.subdomain) { n.fx = n.x; n.fy = n.y; n.fz = n.z; continue }
          delete n.fx; delete n.fy; if (flat) n.fz = 0; else delete n.fz
          travelling++; travellers.current.add(n.id); continue
        }
        const link = props.data.links.find((l) => l.ucId === n.id)
        const at = link ? L.pos.get(link.platformId) : undefined
        const atFlat = link ? L.flat.get(link.platformId) : undefined
        const angle = k++ * 2.399, ring = 14 + 4 * Math.sqrt(k)
        n.x = (flat ? atFlat?.[0] : at?.[0]) ?? 0; n.y = (flat ? atFlat?.[1] : at?.[1]) ?? 0
        n.x += Math.cos(angle) * ring; n.y += Math.sin(angle) * ring
        n.z = flat ? 0 : (at?.[2] ?? 0) + (k % 2 ? 8 : -8)
        if (flat) n.fz = 0
        free++; travellers.current.add(n.id)
      }
      if (travelling > 0) g.warmupTicks(0).cooldownTicks(260)
      else g.warmupTicks(free ? 30 : 0).cooldownTicks(0)
    } else {
      g.warmupTicks(300).cooldownTicks(0)
    }
    g.graphData(props.data as unknown as { nodes: object[]; links: object[] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data])

  /**
   * After the layout settles. The first time an estate is laid out this
   * session it is turned into its canonical frame, rounded to single
   * precision, its flat map derived, and all of it stored. Every settle then
   * records where new or moved nodes ended up, in 3D and flat, and pins
   * every node where it is.
   */
  function settleLayout() {
    const g = gRef.current
    if (!g) return
    const nodes = g.graphData().nodes as (GNode & Positioned)[]
    const flat = modeRef.current === '2d'
    if (!lay.current) {
      const base = nodes.filter((n) => !isSynthetic(n.id) && n.x !== undefined)
      const frame = canonicalFrame(base.map((n) => ({ id: n.id, kind: n.kind, subdomain: n.subdomain, x: n.x!, y: n.y ?? 0, z: n.z ?? 0, r: n.val })))
      for (const n of nodes) {
        const [x, y, z] = toFrame(frame, n.x ?? 0, n.y ?? 0, n.z ?? 0)
        n.x = f32(x); n.y = f32(y); n.z = f32(z)
      }
      for (const [sub, a] of anchorPts.current) anchorPts.current.set(sub, toFrame(frame, a[0], a[1], a[2]))
      const p3 = new Float32Array(base.length * 3), radii = new Float32Array(base.length)
      base.forEach((n, i) => { p3[i * 3] = n.x!; p3[i * 3 + 1] = n.y!; p3[i * 3 + 2] = n.z!; radii[i] = n.val })
      const { p2, stats } = flatten(p3, radii)
      const L: EstateLayout = { pos: new Map(), sub: new Map(), flat: new Map(), anchors: new Map(anchorPts.current), stats }
      base.forEach((n, i) => {
        L.pos.set(n.id, [n.x!, n.y!, n.z!])
        L.sub.set(n.id, n.subdomain)
        L.flat.set(n.id, [p2[i * 3]!, p2[i * 3 + 1]!])
      })
      LAYOUTS.set(keyRef.current, L)
      lay.current = L
      live3.current = new Map(L.pos)
      live2.current = new Map(L.flat)
      if (flat) for (const n of nodes) { const q = L.flat.get(n.id); if (q) { n.x = q[0]; n.y = q[1]; n.z = 0 } }
    }
    // What moved, or arrived, since the last settle.
    const moved = nodes.filter((n) => travellers.current.has(n.id) || !live3.current.has(n.id) || !live2.current.has(n.id))
    travellers.current = new Set()
    if (moved.length > 0) {
      if (flat) {
        for (const n of moved) {
          const was = live3.current.get(n.id)
          const link = propsRef.current.data.links.find((l) => l.ucId === n.id)
          const depth = was?.[2] ?? (link ? live3.current.get(link.platformId)?.[2] : undefined) ?? 0
          live2.current.set(n.id, [f32(n.x ?? 0), f32(n.y ?? 0)])
          live3.current.set(n.id, [f32(n.x ?? 0), f32(n.y ?? 0), f32(depth)])
        }
      } else {
        for (const n of moved) live3.current.set(n.id, [f32(n.x ?? 0), f32(n.y ?? 0), f32(n.z ?? 0)])
        // Their flat spots: projected, then pulled clear of the nodes
        // already placed, which stay where they are.
        const movedIds = new Set(moved.map((n) => n.id))
        const all = nodes.filter((n) => live3.current.has(n.id))
        const p3 = new Float32Array(all.length * 3), radii = new Float32Array(all.length), fixed = new Uint8Array(all.length)
        all.forEach((n, i) => {
          const m = movedIds.has(n.id)
          const q = live2.current.get(n.id), p = live3.current.get(n.id)!
          p3[i * 3] = m || !q ? p[0] : q[0]; p3[i * 3 + 1] = m || !q ? p[1] : q[1]
          radii[i] = n.val; fixed[i] = m ? 0 : 1
        })
        const { p2 } = flatten(p3, radii, fixed)
        all.forEach((n, i) => { if (movedIds.has(n.id)) live2.current.set(n.id, [p2[i * 3]!, p2[i * 3 + 1]!]) })
      }
    }
    // Pinned for good. Flat, every node lies in the plane.
    for (const n of nodes) {
      if (flat) { const q = live2.current.get(n.id); if (q) { n.x = q[0]; n.y = q[1] } n.z = 0 }
      n.fx = n.x; n.fy = n.y; n.fz = n.z
    }
  }

  // ---- appearance ----
  //
  // Two effects, not one, and the split is the point.
  //
  // The BUILD effect creates every node's objects once: the mesh, both of its
  // materials, the halo, the two rings, the label and the view 2 donut, all of
  // them present and most of them hidden. It runs when the graph data, the
  // theme, the label mode or the ring accessor changes, and it disposes what it
  // replaces.
  //
  // The STATE effect runs on everything else: selection, dimming, a failure,
  // lit links, hidden links. It walks the registry and sets opacity, emissive,
  // visibility and which material is on the mesh. Nothing is allocated.
  //
  // Before the split there was one effect that re-issued nodeThreeObject for
  // every change, and the library rebuilt every node from scratch each time:
  // 46 geometries, 46 materials, 46 label canvases, none of them disposed. The
  // intro changes the dim set five times, so five spikes and five garbage
  // collections, which is what read as choppy. Selection in view 1 did the
  // same on every click.
  const objs = useRef(new Map<string, NodeObjs>())
  const linkShown = useRef(new Set<string>())
  const linkReveal = useRef(0)
  const waveRaf = useRef(0)
  const waveSeen = useRef(0)
  /** When the wave reaches each affected node, by id. */
  const litAt = useRef(new Map<string, number>())
  useEffect(() => () => { if (fadeRaf.current) cancelAnimationFrame(fadeRaf.current); if (waveRaf.current) cancelAnimationFrame(waveRaf.current) }, [])

  useEffect(() => {
    const g = gRef.current
    if (!g) return
    const { dark, labelMode } = props

    for (const o of objs.current.values()) disposeNode(o)
    objs.current.clear()

    g.nodeThreeObject((raw: object) => {
      const n = raw as GNode
      const stale = objs.current.get(n.id)
      if (stale) disposeNode(stale)

      // Domains own the six bright colours; platforms are grey; connectors
      // are one teal shared by all of them, and diamonds, so the two kinds of
      // shared node read apart at a glance. No vendor has a colour: the teal
      // belongs to the kind, not the name.
      const colour = n.kind === 'use_case'
        ? (SUBDOMAIN_COLOUR[n.subdomain ?? ''] ?? NEUTRAL)
        : n.kind === 'integration'
          ? (dark ? CONNECTOR_DARK : CONNECTOR)
          : (dark ? NEUTRAL : NEUTRAL_DIM)
      const r = n.val

      // Shape carries node type independently of colour. Spec section 2.
      //   platform     sphere
      //   integration  octahedron, a distinct silhouette
      //   use case     small sphere
      const geom = n.kind === 'integration'
        ? new THREE.OctahedronGeometry(r * 1.25)
        : new THREE.SphereGeometry(r, 20, 14)
      const solid = new THREE.MeshLambertMaterial({ color: colour, transparent: true, opacity: 1 })
      // Spec section 4.3: affected use cases take a distinct SHAPE STATE, not
      // just a colour. Wireframe is the state, so the change survives greyscale.
      const wire = new THREE.MeshBasicMaterial({ color: colour, wireframe: true })
      const mesh = new THREE.Mesh(geom, solid)
      const group = new THREE.Object3D()
      group.add(mesh)

      // The selected node wears a halo, not just a brighter face. Emissive
      // alone reads as "slightly paler grey" on a grey platform in daylight,
      // and the tour's first step says "the lit one". A back-faced shell
      // renders as a rim of light around the silhouette at any camera angle.
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(r * 1.85, 22, 16),
        new THREE.MeshBasicMaterial({
          color: dark ? '#9ccbf5' : '#1f4e79', transparent: true, opacity: 0.26,
          side: THREE.BackSide, depthWrite: false,
        }),
      )
      halo.visible = false
      group.add(halo)

      // The selection ring, in the accent colour, always facing the camera.
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r * 1.9, r * 0.13, 8, 40),
        new THREE.MeshBasicMaterial({ color: dark ? '#7fb2e5' : '#1f4e79' }),
      )
      ring.visible = false
      ring.onBeforeRender = billboard
      group.add(ring)

      const fail = new THREE.Mesh(
        new THREE.TorusGeometry(r * 2.4, r * 0.16, 8, 44),
        new THREE.MeshBasicMaterial({ color: '#d05a6a' }),
      )
      fail.visible = false
      fail.onBeforeRender = billboard
      group.add(fail)

      // View 2's donut. A sprite, so it always faces the viewer: spec section
      // 4.2 asks for the ring in screen space.
      let ringSprite: THREE.Sprite | null = null
      const split = propsRef.current.nodeRing?.(n) ?? null
      if (split) {
        ringSprite = new THREE.Sprite(new THREE.SpriteMaterial({
          map: ringTexture(split, dark), transparent: true, depthWrite: false,
        }))
        const sz = r * 5.4
        ringSprite.scale.set(sz, sz, 1)
        group.add(ringSprite)
      }

      // The label is built whenever the mode could ever want it, and shown or
      // hidden by state. A canvas per label, once, rather than once per change.
      let label: SpriteText | null = null
      // Riders the fan-in slider adds are named only up to the third; past
      // that they are dots, or twenty labels pile onto one node.
      const unnamed = /^uc_added_(\d+)$/.exec(n.id)
      if (labelMode !== 'none' && !(unnamed && Number(unnamed[1]) > 3)) {
        label = new SpriteText(n.name)
        label.color = dark ? '#e7eaef' : '#20242b'
        // Hub labels are the only text on that screen and they carry the
        // comparison, so they are set larger than on a screen where everything
        // is named.
        label.textHeight = labelMode === 'hubs' ? 6.4 : n.kind === 'use_case' ? 2.8 : 4.2
        label.position.set(0, r + 3.4, 0)
        label.visible = false
        label.userData.base = label.scale.clone()
        // A label never hides what is behind it: its clear margin used to
        // punch pale bars through the domains.
        ;(label.material as THREE.SpriteMaterial).depthWrite = false
        group.add(label)
      }

      // Halo and rings are decoration. Picking tests hidden objects too, and
      // a ring facing the camera would take a tap meant for what lies near.
      for (const d of [halo, ring, fail, ringSprite]) if (d) d.raycast = () => {}
      const o: NodeObjs = { mesh, solid, wire, halo, ring, fail, label, ringSprite, colour, fadeFrom: 1, fadeTo: 1, fadeT0: 0 }
      objs.current.set(n.id, o)
      // The library builds objects lazily, after the state effect has run, so a
      // fresh object takes the current state here or it would show whole until
      // something changed. This is why the title card used to show the estate.
      applyNodeState(n, o, true)
      // A node added to a picture already on screen arrives rather than appears.
      if (freshIds.current.has(n.id)) {
        freshIds.current.delete(n.id)
        o.solid.opacity = 0; o.fadeFrom = 0; o.fadeTo = 0; mesh.visible = false
        applyNodeState(n, o, false)
      }
      return group
    })

    // Fresh objects need the current state put on them.
    applyState()
    // Only the theme and the label mode rebuild every node. A change of data
    // builds objects for the new nodes alone; a change of ring is painted on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.dark, props.labelMode])

  // View 2's rings, repainted in place when the split changes.
  useEffect(() => {
    const g = gRef.current
    if (!g) return
    for (const n of g.graphData().nodes as GNode[]) {
      const o = objs.current.get(n.id)
      if (!o) continue
      const split = props.nodeRing?.(n) ?? null
      if (split && o.ringSprite) {
        if (o.ringFrac !== undefined && Math.abs(o.ringFrac - split.meteredFrac) < 0.002) continue
        o.ringFrac = split.meteredFrac
        const old = o.ringSprite.material.map
        o.ringSprite.material.map = ringTexture(split, props.dark)
        o.ringSprite.material.needsUpdate = true
        old?.dispose()
      } else if (split && !o.ringSprite) {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTexture(split, props.dark), transparent: true, depthWrite: false }))
        const sz = n.val * 5.4
        sprite.scale.set(sz, sz, 1)
        sprite.raycast = () => {}
        o.mesh.parent?.add(sprite)
        o.ringSprite = sprite
        o.ringFrac = split.meteredFrac
      } else if (!split && o.ringSprite) {
        o.mesh.parent?.remove(o.ringSprite)
        o.ringSprite.material.map?.dispose()
        o.ringSprite.material.dispose()
        o.ringSprite = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.nodeRing, props.dark])

  // ---- state, and the fade between states ----
  //
  // Opacity does not jump. Each node and each hull keeps where it is going and
  // when it set off; one animation frame loop, started only when something is
  // still moving and stopped when nothing is, eases every material toward its
  // target. Nothing is allocated per frame and no React state is touched, so
  // a layer of the intro fading in costs a few multiplications a frame.
  const FADE_MS = 720
  /** Hulls are large and few; a slower arrival reads as a fade rather than a blink. */
  const HULL_FADE_MS = 2200
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
  const fadeRaf = useRef(0)
  const hullAlpha = useRef(new Map<string, { cur: number; from: number; to: number; t0: number }>())

  const runFades = () => {
    if (fadeRaf.current) return
    const step = () => {
      fadeRaf.current = 0
      const now = performance.now()
      let moving = false
      for (const o of objs.current.values()) {
        if (o.solid.opacity === o.fadeTo) continue
        const t = Math.min(1, Math.max(0, (now - o.fadeT0) / FADE_MS))
        o.solid.opacity = t >= 1 ? o.fadeTo : o.fadeFrom + (o.fadeTo - o.fadeFrom) * easeOut(t)
        o.mesh.visible = o.solid.opacity > 0
        if (t < 1) moving = true
      }
      for (const a of hullAlpha.current.values()) {
        if (a.cur === a.to) continue
        const t = Math.min(1, (now - a.t0) / HULL_FADE_MS)
        a.cur = t >= 1 ? a.to : a.from + (a.to - a.from) * easeOut(t)
        if (t < 1) moving = true
      }
      paintHullAlpha()
      if (moving) fadeRaf.current = requestAnimationFrame(step)
    }
    fadeRaf.current = requestAnimationFrame(step)
  }

  /** Aim a node's opacity, at once or over the fade, optionally after a delay. */
  const fadeTo = (o: NodeObjs, target: number, instant: boolean, delayMs = 0) => {
    if (o.fadeTo === target && (instant || o.solid.opacity === target)) return
    o.fadeTo = target
    if (instant || propsRef.current.reducedMotion) { o.solid.opacity = target; o.fadeFrom = target; o.mesh.visible = target > 0; return }
    o.mesh.visible = true
    o.fadeFrom = o.solid.opacity
    o.fadeT0 = performance.now() + delayMs
    runFades()
  }
  /** Nodes arriving in this pass, so a layer can come in one by one. */
  const arriving = useRef(0)

  /** What the current props say about one node. Recomputed by applyState. */
  const stateCtx = useRef<{
    neighbours: Set<string>
    dimmed: (n: GNode) => boolean
  }>({ neighbours: new Set(), dimmed: () => false })

  const applyNodeState = (n: GNode, o: NodeObjs, instant: boolean) => {
    const { labelMode, selectedId } = propsRef.current
    const { neighbours, dimmed } = stateCtx.current
    const dim = dimmed(n)
    const isSel = selectedId === n.id
    const isNeighbour = neighbours.has(n.id)
    const f = propsRef.current.focus
    const ghosted = !!f && !f.nodes.has(n.id)
    // A node the wave has not reached yet still stands; it goes to wireframe
    // when the wave arrives, in the loop below.
    const affected = propsRef.current.affectedUseCases?.has(n.id) === true && (litAt.current.get(n.id) ?? 0) <= performance.now()
    const failed = propsRef.current.failedNodeId === n.id

    o.mesh.material = affected ? o.wire : o.solid
    // A node the story has not revealed is not there at all; a node Isolate
    // has dimmed is still there, faintly, because the sharing is the lesson.
    // A layer arriving comes in one node at a time when the scene asks for
    // it: each node in the same pass starts a little after the last.
    const target = propsRef.current.dimNodes?.has(n.id) ? 0 : ghosted ? GHOST : dim ? 0.12 : 1
    const wasHidden = o.fadeTo === 0
    const delay = !instant && wasHidden && target > 0 && propsRef.current.stagger ? Math.min(1400, arriving.current++ * 45) : 0
    fadeTo(o, target, instant, delay)
    o.solid.emissive.set(failed ? '#d05a6a' : isSel ? o.colour : '#000000')
    o.solid.emissiveIntensity = failed ? 0.9 : isSel ? 0.55 : 0
    o.halo.visible = (isSel && !dim) || (o.pulseUntil ?? 0) > performance.now()
    o.ring.visible = isSel
    o.fail.visible = failed
    if (o.ringSprite) o.ringSprite.visible = !dim && !ghosted
    if (o.label) {
      o.label.visible = ghosted ? false :
        labelMode === 'all' ? !dim
        : labelMode === 'selected' ? (isSel || isNeighbour)
        : labelMode === 'hubs' ? (!dim && n.kind !== 'use_case' && (n.riders ?? 0) >= HUB_RIDERS)
        : false
    }
  }

  const applyState = () => {
    const g = gRef.current
    if (!g) return
    const tState = performance.now()
    const { dark, selectedId, isolatedSubdomain, data } = props

    const neighbours = new Set<string>()
    if (selectedId) {
      neighbours.add(selectedId)
      for (const l of data.links) {
        if (l.ucId === selectedId) neighbours.add(l.platformId)
        if (l.platformId === selectedId) neighbours.add(l.ucId)
      }
    }
    const subdomainOf = new Map(data.nodes.map((n) => [n.id, n.subdomain]))
    const isIn = (ucId: string) => subdomainOf.get(ucId) === isolatedSubdomain
    const dimmed = (n: GNode) => {
      if (props.dimNodes?.has(n.id)) return true
      if (!isolatedSubdomain) return false
      // Isolate dims everything outside one subdomain but KEEPS shared
      // platforms lit, because the sharing is the point. Spec section 4.1.
      if (n.kind !== 'use_case') return !data.links.some((l) => l.platformId === n.id && isIn(l.ucId))
      return n.subdomain !== isolatedSubdomain
    }
    stateCtx.current = { neighbours, dimmed }
    arriving.current = 0

    // Nothing asked of the picture: every node goes back to its baseline,
    // whatever a wave, a focus or a story scene left on it. The state
    // functions are meant to arrive there on their own; this is the check
    // that they did, so a canvas after the story looks like one before it.
    const atRest = !props.focus && !props.wave && !props.flow && !props.failedNodeId && !props.affectedUseCases?.size
      && !props.litLinks?.size && !props.dimNodes?.size && !props.dimHulls?.size && !isolatedSubdomain
    if (atRest) {
      litAt.current.clear()
      for (const o of objs.current.values()) { o.lit = false; o.pulseUntil = 0 }
    }
    for (const n of data.nodes) {
      const o = objs.current.get(n.id)
      if (!o) continue
      applyNodeState(n, o, false)
    }

    // A hull whose use cases are all still dimmed has not arrived yet. It
    // fades in with them, from nothing, rather than sitting there whole.
    const subs = new Set(data.nodes.flatMap((n) => (n.kind === 'use_case' && n.subdomain ? [n.subdomain] : [])))
    for (const sub of subs) {
      const arrived = props.dimHulls
        ? !props.dimHulls.has(sub)
        : data.nodes.some((n) => n.kind === 'use_case' && n.subdomain === sub && !dimmed(n))
      const fh = props.focus?.hulls
      const target = !arrived ? 0 : fh && !fh.has(sub) ? 0.35 : 1
      const a = hullAlpha.current.get(sub) ?? { cur: target, from: target, to: target, t0: 0 }
      if (!hullAlpha.current.has(sub)) hullAlpha.current.set(sub, a)
      if (a.to !== target) {
        a.to = target
        if (propsRef.current.reducedMotion) { a.cur = target; a.from = target }
        else { a.from = a.cur; a.t0 = performance.now(); runFades() }
      }
    }

    // Links. The library updates colour and visibility on the existing
    // objects; only a width change rebuilds their geometry, and width only
    // moves when a failure lights a link. When the scene asks, links newly
    // shown arrive one after another over about a second: each gets a time
    // to appear, and the accessor is re-set every frame until the last has.
    const h = props.hideLinksOf
    const hidden = (l: GLink) => !!(h && (h.has(l.ucId) || h.has(l.platformId)))
    const now = performance.now()
    let order = 0
    for (const raw of g.graphData().links as object[]) {
      const l = raw as GLink & { __showAt?: number }
      const key = `${l.ucId}>${l.platformId}`
      if (hidden(l)) { linkShown.current.delete(key); l.__showAt = Infinity; continue }
      if (linkShown.current.has(key)) { l.__showAt = 0; continue }
      linkShown.current.add(key)
      l.__showAt = props.stagger && !propsRef.current.reducedMotion ? now + Math.min(1600, order++ * 14) : 0
    }
    const applyLinkVisibility = () => g.linkVisibility((raw: object) => ((raw as GLink & { __showAt?: number }).__showAt ?? 0) <= performance.now())
    applyLinkVisibility()
    if (linkReveal.current) cancelAnimationFrame(linkReveal.current)
    const lastAt = Math.max(0, ...(g.graphData().links as (GLink & { __showAt?: number })[]).map((l) => (l.__showAt === Infinity ? 0 : l.__showAt ?? 0)))
    if (lastAt > now) {
      const tick = () => { applyLinkVisibility(); if (performance.now() < lastAt + 40) linkReveal.current = requestAnimationFrame(tick); else linkReveal.current = 0 }
      linkReveal.current = requestAnimationFrame(tick)
    }
    // The wave. A new nonce puts a time on every lit link and every affected
    // node: later the further it sits from the source, and a ring later per
    // hop. The colour accessor reads those times, and is re-issued each
    // frame until the last has passed.
    const wave = props.wave
    if (wave && wave.nonce !== waveSeen.current) {
      const fresh = Math.floor(wave.nonce / 1000) !== Math.floor(waveSeen.current / 1000)
      waveSeen.current = wave.nonce
      const nodes = g.graphData().nodes as (GNode & Positioned)[]
      const src = nodes.find((n) => n.id === wave.from)
      const dist = (id: string) => { const n = nodes.find((x) => x.id === id); return src && n ? Math.hypot((n.x ?? 0) - (src.x ?? 0), (n.y ?? 0) - (src.y ?? 0), (n.z ?? 0) - (src.z ?? 0)) : 0 }
      const at = (key: string, id: string) => now + 380 + (wave.hop?.get(key) ?? 0) * 600 + dist(id) * 3.2
      // A fresh failure replays from the source. A change of reach on the
      // same failure keeps what is already lit and times only what is new,
      // so the slider grows the wave rather than restarting it.
      for (const raw of g.graphData().links as object[]) {
        const l = raw as GLink & { __litAt?: number }
        const key = `${l.ucId}>${l.platformId}`
        if (!props.litLinks?.has(key)) { l.__litAt = 0; continue }
        if (!fresh && l.__litAt && l.__litAt <= now) continue
        l.__litAt = at(key, wave.hop?.has(l.platformId) ? l.platformId : l.ucId)
      }
      for (const id of [...litAt.current.keys()]) if (!props.affectedUseCases?.has(id)) { litAt.current.delete(id); const o = objs.current.get(id); if (o) { o.lit = false; o.pulseUntil = 0 } }
      for (const id of props.affectedUseCases ?? []) {
        const had = litAt.current.get(id)
        if (!fresh && had !== undefined && had <= now) continue
        litAt.current.set(id, at(id, id))
        const o = objs.current.get(id)
        if (o) { o.lit = false; o.pulseUntil = 0 }
      }
    } else if (!wave) {
      litAt.current.clear()
      for (const raw of g.graphData().links as object[]) (raw as GLink & { __litAt?: number }).__litAt = 0
    }
    const focus = props.focus
    const linkColour = (raw: object) => {
      const l = raw as GLink & { __litAt?: number }
      const key = `${l.ucId}>${l.platformId}`
      if (props.litLinks?.has(key) && (l.__litAt ?? 0) <= performance.now()) return '#d05a6a'
      if (focus && !(focus.nodes.has(l.ucId) && focus.nodes.has(l.platformId))) return dark ? '#2a2f37' : '#dcdcd8'
      if (props.flow) return flowColour(props.flow.warmth.get(l.ucId) ?? 0)
      if (selectedId && (l.ucId === selectedId || l.platformId === selectedId)) return dark ? '#ffffff' : '#20242b'
      if (isolatedSubdomain && !isIn(l.ucId)) return dark ? '#2a2e35' : '#d5d5d2'
      return dark ? '#7d848e' : '#9aa0a8'
    }
    g.linkColor(linkColour)
    const lastLit = Math.max(0, ...litAt.current.values(), ...(g.graphData().links as (GLink & { __litAt?: number })[]).map((l) => l.__litAt ?? 0))
    if (waveRaf.current) cancelAnimationFrame(waveRaf.current)
    if (lastLit > now) {
      const tick = () => {
        const t = performance.now()
        g.linkColor(linkColour)
        for (const [id, when] of litAt.current) {
          const o = objs.current.get(id)
          const n = data.nodes.find((x) => x.id === id)
          if (!o || !n) continue
          if (!o.lit && when <= t) { o.lit = true; o.pulseUntil = t + 520; applyNodeState(n, o, true) }
          else if (o.lit && o.pulseUntil && o.pulseUntil <= t) { o.pulseUntil = 0; applyNodeState(n, o, true) }
        }
        if (t < lastLit + 600) waveRaf.current = requestAnimationFrame(tick); else waveRaf.current = 0
      }
      waveRaf.current = requestAnimationFrame(tick)
    }
    rebuildHulls()
    if (import.meta.env.DEV) perf('applyState', performance.now() - tState)
  }

  useEffect(() => {
    applyState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedId, props.isolatedSubdomain, props.showHulls, props.dimNodes, props.dimHulls, props.failedNodeId,
      props.affectedUseCases, props.litLinks, props.hideLinksOf, props.focus, props.wave, props.flow, props.dark])

  // Link width and the dashed treatment rebuild link geometry, so they are
  // re-issued only when their own inputs change.
  // Re-issuing either accessor makes the library rebuild every line, so
  // each is re-issued only when what it returns could differ: the widest
  // spend, the set of lit lines, the set of dashed lines, the theme.
  const maxSpend = useMemo(() => Math.max(...props.data.links.map((l) => l.spend), 1), [props.data])
  const litKey = useMemo(() => (props.litLinks ? [...props.litLinks].sort().join() : ''), [props.litLinks])
  const dashedKey = useMemo(() => (props.dashedLinks ? [...props.dashedLinks].sort().join() : null), [props.dashedLinks])
  useEffect(() => {
    const g = gRef.current
    if (!g) return
    g.linkWidth((raw: object) => {
      const l = raw as GLink
      const key = `${l.ucId}>${l.platformId}`
      const flow = propsRef.current.flow
      // In the flow picture the width is the work the line carries, not the spend.
      if (flow) return 0.35 + 3.4 * Math.sqrt(flow.share.get(key) ?? 0)
      const lit = propsRef.current.litLinks?.has(key) === true
      return (lit ? 1.6 : 0) + 0.25 + 2.6 * Math.sqrt(l.spend / maxSpend)
    })
    applyParticles.current()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSpend, litKey, props.flow])
  /**
   * The particles that carry the flow. On only in the flow picture: they
   * cost a draw per particle per frame, and they mean nothing elsewhere. Off
   * while a fold runs.
   */
  const applyParticles = useRef(() => {})
  applyParticles.current = () => {
    const g = gRef.current
    if (!g) return
    const flow = propsRef.current.flow
    if (flow && !foldOn.current) {
      g.linkDirectionalParticles((raw: object) => { const l = raw as GLink; return Math.round(1 + 4 * (flow.share.get(`${l.ucId}>${l.platformId}`) ?? 0)) })
        .linkDirectionalParticleWidth((raw: object) => { const l = raw as GLink; return 1.2 + 1.6 * (flow.share.get(`${l.ucId}>${l.platformId}`) ?? 0) })
        .linkDirectionalParticleSpeed((raw: object) => { const l = raw as GLink; return 0.004 + 0.006 * (flow.share.get(`${l.ucId}>${l.platformId}`) ?? 0) })
        .linkDirectionalParticleColor((raw: object) => flowColour(flow.warmth.get((raw as GLink).ucId) ?? 0))
    } else {
      g.linkDirectionalParticles(0)
    }
  }
  useEffect(() => {
    const g = gRef.current
    if (!g) return
    const { dark } = props
    if (props.dashedLinks) {
      const dashed = props.dashedLinks
      g.linkThreeObject(((raw: object) => {
        const l = raw as GLink
        const isDashed = dashed.has(`${l.ucId}>${l.platformId}`)
        const geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
        const mat = isDashed
          ? new THREE.LineDashedMaterial({
            color: dark ? '#e8c46a' : '#a97c12', dashSize: 3, gapSize: 2.4,
            transparent: true, opacity: props.dashedFaint ? 0.3 : 0.95,
          })
          : new THREE.LineBasicMaterial({
            color: dark ? '#7d848e' : '#9aa0a8', transparent: true, opacity: 0.35,
          })
        return new THREE.Line(geom, mat)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any)
      g.linkPositionUpdate(((obj: THREE.Object3D, coords: { start: Positioned; end: Positioned }) => {
        const line = obj as THREE.Line
        const pos = line.geometry.getAttribute('position') as THREE.BufferAttribute
        pos.setXYZ(0, coords.start.x ?? 0, coords.start.y ?? 0, coords.start.z ?? 0)
        pos.setXYZ(1, coords.end.x ?? 0, coords.end.y ?? 0, coords.end.z ?? 0)
        pos.needsUpdate = true
        line.geometry.computeBoundingSphere()
        line.computeLineDistances()
        return true
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      g.linkThreeObject(null as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      g.linkPositionUpdate(null as any)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashedKey, props.dark, props.dashedFaint])

  // ---- where the selected node is on screen ----
  //
  // Published so the tour's promise that its card never covers the node under
  // discussion can be measured rather than asserted. Sampled on a slow loop
  // rather than per frame, and only while something is selected, because it
  // exists for a check and must not cost anything when nobody is looking.
  useEffect(() => {
    const id = props.selectedId
    if (!id) { reportSelectedScreenPos(null); return }
    let raf = 0
    let frame = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (frame++ % 10 !== 0) return
      const g = gRef.current
      if (!g) return
      const n = (g.graphData().nodes as (GNode & Positioned)[]).find((x) => x.id === id)
      if (!n || n.x === undefined) return
      const holderBox = holder.current?.getBoundingClientRect()
      const p = g.graph2ScreenCoords(n.x, n.y ?? 0, n.z ?? 0)
      // graph2ScreenCoords is relative to the canvas, and the card's rectangle
      // is in viewport space, so the canvas offset has to be added back.
      reportSelectedScreenPos({ x: p.x + (holderBox?.left ?? 0), y: p.y + (holderBox?.top ?? 0) })
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); reportSelectedScreenPos(null) }
  }, [props.selectedId])

  // ---- things pinned to the canvas ----
  //
  // The callout and the pop-up are DOM elements moved every other frame to
  // where their target is on screen. A hull's target is the mean of its use
  // cases, which is what the eye takes for its centre; a node's is the node.
  // Off screen, they hide. No React state is touched per frame.
  const calloutEl = useRef<HTMLDivElement | null>(null)
  const popoverEl = useRef<HTMLDivElement | null>(null)
  const follow = (el: HTMLElement | null, target: { kind: 'hull' | 'node'; id: string } | null | undefined, keepInside = false) => {
    if (!el || !target) return () => undefined
    let raf = 0
    let frame = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (frame++ % 2 !== 0) return
      const g = gRef.current
      if (!g) return
      const nodes = g.graphData().nodes as (GNode & Positioned)[]
      let x = 0, y = 0, z = 0, k = 0
      for (const n of nodes) {
        if (n.x === undefined) continue
        const hit = target.kind === 'node'
          ? (target.id.includes('>') ? target.id.split('>').includes(n.id) : n.id === target.id)
          : (n.kind === 'use_case' && n.subdomain === target.id)
        if (!hit) continue
        x += n.x; y += n.y ?? 0; z += n.z ?? 0; k++
      }
      if (k === 0) { el.hidden = true; return }
      const p = g.graph2ScreenCoords(x / k, y / k, z / k)
      const box = holder.current?.getBoundingClientRect()
      const inside = box ? p.x >= 0 && p.y >= 0 && p.x <= box.width && p.y <= box.height : true
      el.hidden = !inside
      let { x: sx, y: sy } = p
      if (keepInside && box) {
        // The pop-up's body hangs below its anchor, centred on it. Keep the
        // whole of it on the canvas, or it slides under the panel beside it.
        const body = el.firstElementChild as HTMLElement | null
        const w = body?.offsetWidth ?? 0
        const h = body?.offsetHeight ?? 0
        sx = Math.min(Math.max(sx, w / 2 + 8), box.width - w / 2 - 8)
        if (sy + 14 + h > box.height - 8) sy = Math.max(8, sy - h - 28)
      }
      el.style.transform = `translate(${Math.round(sx)}px, ${Math.round(sy)}px)`
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }
  useEffect(() => follow(calloutEl.current, props.callout), [props.callout])
  const noteEl = useRef<HTMLDivElement | null>(null)
  useEffect(() => follow(noteEl.current, props.noteAt ? { kind: 'node', id: props.noteAt } : null, true), [props.noteAt, props.note])
  useEffect(() => follow(popoverEl.current, props.popover, true), [props.popover])
  const pokeEls = useRef<(HTMLDivElement | null)[]>([])
  const pokeKey = props.pokes?.ids.join(',') ?? ''
  useEffect(() => {
    const ids = props.pokes?.ids ?? []
    const stops = ids.map((id, i) => follow(pokeEls.current[i] ?? null, { kind: 'node', id }))
    return () => stops.forEach((f) => f())
  }, [pokeKey])

  // The book's wires: one curve from the node to each ruled row, redrawn
  // every other frame in canvas pixels, so they follow the camera.
  const gestureEl = useRef<HTMLDivElement | null>(null)
  const bookEl = useRef<HTMLDivElement | null>(null)
  const wiresEl = useRef<SVGSVGElement | null>(null)
  useEffect(() => {
    const book = props.book
    const svg = wiresEl.current
    const bx = bookEl.current
    if (!book || !svg || !bx) return
    let raf = 0
    let frame = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (frame++ % 2 !== 0) return
      const g = gRef.current
      const hb = holder.current?.getBoundingClientRect()
      if (!g || !hb) return
      const n = (g.graphData().nodes as (GNode & Positioned)[]).find((x) => x.id === book.id)
      if (!n || n.x === undefined) { svg.style.visibility = 'hidden'; return }
      svg.style.visibility = ''
      const p = g.graph2ScreenCoords(n.x, n.y ?? 0, n.z ?? 0)
      const rows = bx.querySelectorAll<HTMLElement>('.book-row')
      const paths = svg.querySelectorAll<SVGPathElement>('path')
      rows.forEach((row, i) => {
        const r = row.getBoundingClientRect()
        const fromLeft = p.x < r.left - hb.left
        const x2 = (fromLeft ? r.left : r.right) - hb.left
        const y2 = r.top - hb.top + r.height / 2
        const cx = (p.x + x2) / 2
        paths[i]?.setAttribute('d', `M${p.x.toFixed(1)},${p.y.toFixed(1)} C${cx.toFixed(1)},${p.y.toFixed(1)} ${cx.toFixed(1)},${y2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`)
      })
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [props.book])

  // ---- the camera, one mover ----
  //
  // Every camera move goes through here: a fit, a fly to a node, a fold. A
  // new move starts from wherever the camera is, so nothing jumps, and it
  // replaces the one before, so two moves never fight. The library's own
  // tween ended the previous move at its destination before starting the
  // next, which was the lurch on the busiest node. Nothing is allocated per
  // frame.
  interface Pose { pos: THREE.Vector3; target: THREE.Vector3; up: THREE.Vector3; fov: number }
  const camRaf = useRef(0)
  const camFrom = useRef<Pose>({ pos: new THREE.Vector3(), target: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), fov: FOV_3D })
  const camTo = useRef<Pose>({ pos: new THREE.Vector3(), target: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), fov: FOV_3D })
  const camTarget = useRef(new THREE.Vector3())
  const pendingCam = useRef<string | null>(null)

  /** Put the camera at a pose, with the controls agreeing on where it looks. */
  function setCamera(pos: { x: number; y: number; z: number }, target: { x: number; y: number; z: number }, up: { x: number; y: number; z: number }, fov: number, dist?: number) {
    const g = gRef.current
    if (!g) return
    const cam = g.camera() as THREE.PerspectiveCamera
    cam.position.set(pos.x, pos.y, pos.z)
    cam.up.set(up.x, up.y, up.z)
    camTarget.current.set(target.x, target.y, target.z)
    cam.lookAt(camTarget.current)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = g.controls() as any
    controls?.target?.copy?.(camTarget.current)
    if (cam.fov !== fov) cam.fov = fov
    setClip(dist ?? cam.position.distanceTo(camTarget.current))
  }

  /**
   * A narrow field of view stands far off. The near plane follows the
   * distance, so the flat map keeps its depth precision at any zoom.
   */
  function setClip(d: number) {
    const cam = gRef.current?.camera() as THREE.PerspectiveCamera | undefined
    if (!cam) return
    cam.near = Math.max(0.1, d - 800)
    cam.far = d + 30000
    cam.updateProjectionMatrix()
  }

  function currentPose(into: Pose) {
    const g = gRef.current
    const cam = g.camera() as THREE.PerspectiveCamera
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = g.controls() as any
    into.pos.copy(cam.position)
    if (controls?.target) into.target.copy(controls.target); else into.target.set(0, 0, 0)
    into.up.copy(cam.up)
    into.fov = cam.fov
  }

  function setControlsFor(mode: '2d' | '3d', moving: boolean) {
    const g = gRef.current
    if (!g) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = g.controls() as any
    if (!controls) return
    controls.enabled = !moving
    // Flat, the map never rotates: pan and zoom only, and a drag pans.
    controls.noRotate = mode === '2d'
    if (controls.mouseButtons) controls.mouseButtons.LEFT = mode === '2d' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE
  }

  function moveCamera(goal: Pose, ms: number) {
    const g = gRef.current
    if (!g) return
    if (foldOn.current) return
    if (camRaf.current) { cancelAnimationFrame(camRaf.current); camRaf.current = 0 }
    currentPose(camFrom.current)
    camTo.current.pos.copy(goal.pos); camTo.current.target.copy(goal.target); camTo.current.up.copy(goal.up); camTo.current.fov = goal.fov
    const reduced = propsRef.current.reducedMotion || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
    if (ms <= 0 || reduced) {
      setCamera(goal.pos, goal.target, goal.up, goal.fov)
      setControlsFor(modeRef.current, false)
      return
    }
    setControlsFor(modeRef.current, true)
    const t0 = performance.now()
    const a = camFrom.current, b = camTo.current
    const pos = new THREE.Vector3(), target = new THREE.Vector3(), up = new THREE.Vector3()
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / ms)
      const e = easeInOut(t)
      pos.lerpVectors(a.pos, b.pos, e)
      target.lerpVectors(a.target, b.target, e)
      up.lerpVectors(a.up, b.up, e).normalize()
      setCamera(pos, target, up, a.fov + (b.fov - a.fov) * e)
      if (t < 1) camRaf.current = requestAnimationFrame(step)
      else { camRaf.current = 0; setControlsFor(modeRef.current, false); labelScale() }
    }
    camRaf.current = requestAnimationFrame(step)
  }

  /** The canvas's free area, and the full virtual view the offset makes. */
  function freeArea() {
    const el = holder.current
    const W = el?.clientWidth ?? 1, H = el?.clientHeight ?? 1
    const { inset, top } = view.current
    return { freeW: Math.max(40, W - inset), freeH: Math.max(40, H - top), fullH: H + top }
  }

  /** The two fixed poses' framing: half the full view's height at the target, in world units. */
  function framing() {
    const { freeW, freeH, fullH } = freeArea()
    const pts3 = live3.current, pts2 = live2.current
    let radius = 0
    for (const p of pts3.values()) radius = Math.max(radius, Math.hypot(p[0], p[1], p[2]))
    // Fold-ready: the sphere round the layout fits the free area.
    const half3 = Math.tan((FOV_3D * Math.PI) / 360)
    const fovEff = 2 * Math.atan(half3 * Math.min(freeW, freeH) / fullH)
    const d3 = (radius * 1.05 + 12) / Math.sin(fovEff / 2)
    const halfView3 = d3 * half3
    // Flat: the box round the flat map, with room for labels, fits it.
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
    for (const q of pts2.values()) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]) }
    if (!Number.isFinite(x0)) { x0 = y0 = -1; x1 = y1 = 1 }
    const hx = (x1 - x0) / 2 + 14, hy = (y1 - y0) / 2 + 14
    const halfView2 = Math.max(hy / freeH, hx / freeW) * fullH * 1.04
    return { halfView3, halfView2, target2: [(x0 + x1) / 2, (y0 + y1) / 2, 0] as [number, number, number] }
  }

  const blendOut = useRef({ pos: [0, 0, 0], target: [0, 0, 0], up: [0, 1, 0], fov: FOV_3D, dist: 1 })
  const ORIGIN: [number, number, number] = [0, 0, 0]
  function poseFor(mode: '2d' | '3d'): Pose {
    const f = framing()
    const o = blendOut.current
    cameraBlend(mode === '2d' ? 1 : 0, FOV_3D, f.halfView3, f.halfView2, ORIGIN, f.target2, o)
    return { pos: new THREE.Vector3(o.pos[0], o.pos[1], o.pos[2]), target: new THREE.Vector3(o.target[0], o.target[1], o.target[2]), up: new THREE.Vector3(o.up[0], o.up[1], o.up[2]), fov: o.fov }
  }

  // ---- the fold ----
  //
  // Audit brief v0.5, 17.5. To 2D: the camera turns to the fold-ready pose,
  // then depth collapses domain by domain, the shared nodes last, while the
  // camera tilts overhead and narrows its view. To 2D takes about 1.1 s, to
  // 3D about 0.9 s, the same steps backwards without the turn. Every
  // position comes from P3, P2 and one progress value: no simulation runs.
  // A tap mid-fold turns it round where it is.
  const foldRaf = useRef(0)
  const fold = useRef({
    dir: 1 as 1 | -1, tau: 0, total: 1, phase: 'idle' as 'idle' | 'turn' | 'fold', last: 0,
    turnT: 0, turnMs: 1, turnDir: 1 as 1 | -1, labelT0: 0,
    nodes: [] as (GNode & Positioned)[], p3: new Float32Array(0), p2: new Float32Array(0), starts: new Float32Array(0),
    halfView3: 1, halfView2: 1, target2: [0, 0, 0] as [number, number, number], unfoldTarget: [0, 0, 0] as [number, number, number],
    labels: [] as SpriteText[],
    dts: new Float32Array(512), dtCount: 0,
    hulls: [] as { attr: THREE.BufferAttribute; map: Int32Array }[],
    pointNode: new Int32Array(0), pointOff: new Int8Array(0),
  })
  const qFrom = useRef(new THREE.Quaternion())
  const qTo = useRef(new THREE.Quaternion())
  const qNow = useRef(new THREE.Quaternion())
  const turnFrom = useRef({ target: new THREE.Vector3(), dist: 1, fov: FOV_3D })
  const tmpV = useRef(new THREE.Vector3())
  const tmpUp = useRef(new THREE.Vector3())
  const tmpM = useRef(new THREE.Matrix4())
  const PAD = 7
  const OFFSETS = [[PAD, 0, 0], [-PAD, 0, 0], [0, PAD, 0], [0, -PAD, 0], [0, 0, PAD], [0, 0, -PAD]] as const

  /** The 3D hulls as they stand, with every vertex tied to the node and padding it came from. */
  function buildFoldHulls() {
    const g = gRef.current
    const group = hullGroup.current
    const F = fold.current
    if (!g || !group) return
    clearHulls()
    F.hulls = []
    if (!propsRef.current.showHulls) return
    const index = new Map(F.nodes.map((n, i) => [n.id, i]))
    const pointNode: number[] = [], pointOff: number[] = []
    const bySub = new Map<string, THREE.Vector3[]>()
    const keyOf = (x: number, y: number, z: number) => `${f32(x)},${f32(y)},${f32(z)}`
    const lookup = new Map<string, number>()
    for (const n of F.nodes) {
      if (n.kind !== 'use_case' || !n.subdomain) continue
      const arr = bySub.get(n.subdomain) ?? []
      OFFSETS.forEach((o, k) => {
        const v = new THREE.Vector3((n.x ?? 0) + o[0], (n.y ?? 0) + o[1], (n.z ?? 0) + o[2])
        arr.push(v)
        const id = pointNode.length
        pointNode.push(index.get(n.id)!); pointOff.push(k)
        lookup.set(keyOf(v.x, v.y, v.z), id)
      })
      bySub.set(n.subdomain, arr)
    }
    F.pointNode = Int32Array.from(pointNode)
    F.pointOff = Int8Array.from(pointOff)
    const tie = (geom: THREE.BufferGeometry) => {
      const attr = geom.getAttribute('position') as THREE.BufferAttribute
      const map = new Int32Array(attr.count)
      for (let v = 0; v < attr.count; v++) map[v] = lookup.get(keyOf(attr.getX(v), attr.getY(v), attr.getZ(v))) ?? -1
      F.hulls.push({ attr, map })
    }
    for (const [sub, pts] of bySub) {
      if (pts.length < 8) continue
      const alpha = hullWanted(sub)
      if (alpha <= 0) continue
      let geom: ConvexGeometry
      try { geom = new ConvexGeometry(pts) } catch { continue }
      const mat = new THREE.MeshBasicMaterial({ color: SUBDOMAIN_COLOUR[sub] ?? NEUTRAL, transparent: true, opacity: HULL_FILL * alpha, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
      const hull = new THREE.Mesh(geom, mat)
      hull.frustumCulled = false
      hull.userData.subdomain = sub
      group.add(hull)
      tie(geom)
      const edges = new THREE.EdgesGeometry(geom, 24)
      const wire = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: SUBDOMAIN_COLOUR[sub] ?? NEUTRAL, transparent: true, opacity: HULL_EDGE * alpha, depthWrite: false }))
      wire.frustumCulled = false
      wire.userData.subdomain = sub
      wire.userData.edge = true
      group.add(wire)
      tie(edges)
    }
  }

  /** Everything at one moment of the fold, from the progress value alone. */
  function applyFold(tau: number) {
    const F = fold.current
    const { p3, p2, starts, nodes } = F
    for (let i = 0; i < nodes.length; i++) {
      const e = nodeFold(tau, starts[i]!)
      const n = nodes[i]!
      const x = p3[i * 3]! + (p2[i * 3]! - p3[i * 3]!) * e
      const y = p3[i * 3 + 1]! + (p2[i * 3 + 1]! - p3[i * 3 + 1]!) * e
      const z = p3[i * 3 + 2]! * (1 - e)
      n.x = n.fx = x; n.y = n.fy = y; n.z = n.fz = z
    }
    // The hulls ride with their nodes, written in place.
    const pn = F.pointNode, po = F.pointOff
    for (const h of F.hulls) {
      const arr = h.attr.array as Float32Array
      for (let v = 0; v < h.map.length; v++) {
        const pi = h.map[v]!
        if (pi < 0) continue
        const n = nodes[pn[pi]!]!, o = OFFSETS[po[pi]!]!
        arr[v * 3] = (n.x ?? 0) + o[0]; arr[v * 3 + 1] = (n.y ?? 0) + o[1]; arr[v * 3 + 2] = (n.z ?? 0) + o[2]
      }
      h.attr.needsUpdate = true
    }
    // The camera tilts overhead and narrows while backing off.
    const c = easeInOut(Math.min(1, Math.max(0, tau / F.total)))
    const o = blendOut.current
    cameraBlend(c, FOV_3D, F.halfView3, F.halfView2, ORIGIN, F.dir === 1 ? F.target2 : F.unfoldTarget, o)
    setCamera({ x: o.pos[0]!, y: o.pos[1]!, z: o.pos[2]! }, { x: o.target[0]!, y: o.target[1]!, z: o.target[2]! }, { x: o.up[0]!, y: o.up[1]!, z: o.up[2]! }, o.fov, o.dist)
  }

  function setLabelOpacity(a: number) {
    for (const l of fold.current.labels) (l.material as THREE.SpriteMaterial).opacity = a
  }

  /** Flat, labels keep their size on screen whatever the zoom. */
  const labelRaf = useRef(0)
  const labelK = useRef(1)
  const flatDist = useRef(1)
  function labelScale() {
    const g = gRef.current
    if (!g) return
    const cam = g.camera() as THREE.PerspectiveCamera
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = g.controls() as any
    const flatNow = modeRef.current === '2d' && !foldOn.current
    // The flat pose is the reference size; a canvas that mounted flat and
    // flew straight to a node has not framed it yet.
    if (flatNow && flatDist.current <= 1 && live2.current.size > 0) { const p = poseFor('2d'); flatDist.current = p.pos.distanceTo(p.target) }
    const dist = cam.position.distanceTo(controls?.target ?? camTarget.current)
    const k = flatNow ? Math.max(0.05, dist / flatDist.current) : 1
    if (Math.abs(k - labelK.current) < 0.004) return
    if (flatNow) setClip(dist)
    labelK.current = k
    for (const o of objs.current.values()) {
      const l = o.label
      const base = l?.userData.base as THREE.Vector3 | undefined
      if (l && base) l.scale.set(base.x * k, base.y * k, base.z)
    }
  }
  useEffect(() => {
    if (dimension !== '2d') return
    const tick = () => { labelScale(); labelRaf.current = requestAnimationFrame(tick) }
    labelRaf.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(labelRaf.current); labelRaf.current = 0 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimension])

  function prepareFold(to: '2d' | '3d') {
    const g = gRef.current
    const F = fold.current
    const nodes = (g.graphData().nodes as (GNode & Positioned)[]).filter((n) => live3.current.has(n.id) && live2.current.has(n.id))
    F.nodes = nodes
    F.p3 = new Float32Array(nodes.length * 3)
    F.p2 = new Float32Array(nodes.length * 3)
    nodes.forEach((n, i) => {
      const p = live3.current.get(n.id)!, q = live2.current.get(n.id)!
      F.p3[i * 3] = p[0]; F.p3[i * 3 + 1] = p[1]; F.p3[i * 3 + 2] = p[2]
      F.p2[i * 3] = q[0]; F.p2[i * 3 + 1] = q[1]
    })
    const order = propsRef.current.data.anchors ? [...propsRef.current.data.anchors.keys()] : []
    const sch = schedule(nodes, order)
    F.starts = sch.starts
    F.total = sch.total
    view.current.apply()
    const fr = framing()
    F.halfView3 = fr.halfView3
    F.halfView2 = fr.halfView2
    F.target2 = fr.target2
    // Unfolding starts from wherever the reader has panned and zoomed the
    // flat map, so the first frame is the frame they were looking at.
    if (to === '3d') {
      const cam = g.camera() as THREE.PerspectiveCamera
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = (g.controls() as any)?.target ?? camTarget.current
      F.unfoldTarget = [t.x, t.y, 0]
      F.halfView2 = cam.position.distanceTo(t) * Math.tan((cam.fov * Math.PI) / 360)
    } else F.unfoldTarget = fr.target2
    F.labels = [...objs.current.values()].flatMap((o) => (o.label ? [o.label] : []))
    for (const l of F.labels) { const base = l.userData.base as THREE.Vector3 | undefined; if (base) l.scale.copy(base) }
    labelK.current = 1
  }

  /**
   * The engine carries the pinned positions to the objects and the lines
   * each frame while a fold runs. Every node is pinned, so the forces would
   * only be computed to be thrown away: the costly ones are off for the
   * fold and back after it.
   */
  const savedForces = useRef<Record<string, unknown>>({})
  function foldEngine(on: boolean) {
    const g = gRef.current
    if (!g) return
    if (on) {
      for (const k of ['charge', 'center', 'sector']) { savedForces.current[k] = g.d3Force(k); g.d3Force(k, null) }
      g.cooldownTicks(Infinity)
      g.d3ReheatSimulation()
    } else {
      for (const [k, f] of Object.entries(savedForces.current)) if (f) g.d3Force(k, f)
      savedForces.current = {}
      foldStop.current = true
      g.cooldownTicks(0)
    }
  }
  /** The benchmark measures the fold itself, whatever the device. */
  const forceFold = useRef(false)

  function startFold(to: '2d' | '3d') {
    const g = gRef.current
    if (!g || !lay.current) { modeRef.current = to; return }
    const F = fold.current
    // A tap mid-fold turns it round from where it is. Never a queue, never a jump.
    if (foldOn.current) {
      const dir = to === '2d' ? 1 : -1
      if (F.phase === 'turn') F.turnDir = dir
      F.dir = dir
      return
    }
    if (modeRef.current === to) return
    if (camRaf.current) { cancelAnimationFrame(camRaf.current); camRaf.current = 0 }
    const reduced = propsRef.current.reducedMotion || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
    prepareFold(to)
    if (reduced || (slowFolds && !forceFold.current)) { crossfade(to); return }
    foldOn.current = true
    g.enablePointerInteraction(false)
    applyParticles.current()
    setControlsFor(to, true)
    buildFoldHulls()
    // The engine carries the pinned positions to the objects and the lines
    // each frame while the fold runs; every node is pinned, so it lays
    // nothing out.
    foldEngine(true)
    F.dir = to === '2d' ? 1 : -1
    F.tau = to === '2d' ? 0 : F.total
    F.labelT0 = performance.now()
    F.last = performance.now()
    if (to === '2d') {
      // The turn: from wherever the reader left the camera to the
      // fold-ready pose, the shortest way round.
      const cam = g.camera() as THREE.PerspectiveCamera
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = (g.controls() as any)?.target ?? camTarget.current
      turnFrom.current.target.copy(t)
      turnFrom.current.dist = cam.position.distanceTo(t)
      turnFrom.current.fov = cam.fov
      qFrom.current.copy(cam.quaternion)
      const o = blendOut.current
      cameraBlend(0, FOV_3D, F.halfView3, F.halfView2, ORIGIN, F.target2, o)
      tmpV.current.set(o.pos[0]!, o.pos[1]!, o.pos[2]!)
      tmpUp.current.set(o.up[0]!, o.up[1]!, o.up[2]!)
      tmpM.current.lookAt(tmpV.current, camTarget.current.set(0, 0, 0), tmpUp.current)
      qTo.current.setFromRotationMatrix(tmpM.current)
      const angle = qFrom.current.angleTo(qTo.current)
      F.turnMs = turnMs(angle)
      F.turnT = 0
      F.turnDir = 1
      F.phase = 'turn'
    } else F.phase = 'fold'
    foldRaf.current = requestAnimationFrame(foldStep)
  }

  function foldStep(now: number) {
    const t0 = import.meta.env.DEV ? performance.now() : 0
    try { foldFrame(now) } finally { if (import.meta.env.DEV) perf('foldStep', performance.now() - t0) }
  }

  function foldFrame(now: number) {
    const F = fold.current
    const dt = Math.min(64, Math.max(0, now - F.last))
    F.last = now
    if (F.dtCount < F.dts.length && dt > 0) F.dts[F.dtCount++] = dt
    // Labels fade out over the first 120 ms.
    const out = Math.min(1, (now - F.labelT0) / 120)
    setLabelOpacity(1 - out)
    if (F.phase === 'turn') {
      F.turnT = Math.min(F.turnMs, Math.max(0, F.turnT + dt * F.turnDir))
      const e = easeInOut(F.turnT / F.turnMs)
      const o = blendOut.current
      cameraBlend(0, FOV_3D, F.halfView3, F.halfView2, ORIGIN, F.target2, o)
      qNow.current.slerpQuaternions(qFrom.current, qTo.current, e)
      const dist = turnFrom.current.dist + (o.dist - turnFrom.current.dist) * e
      const t = tmpV.current.copy(turnFrom.current.target).multiplyScalar(1 - e)
      const pos = tmpUp.current.set(0, 0, dist).applyQuaternion(qNow.current).add(t)
      const g = gRef.current
      const cam = g.camera() as THREE.PerspectiveCamera
      cam.position.copy(pos)
      cam.quaternion.copy(qNow.current)
      cam.up.set(0, 1, 0).applyQuaternion(qNow.current)
      camTarget.current.copy(t)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(g.controls() as any)?.target?.copy?.(t)
      cam.fov = turnFrom.current.fov + (FOV_3D - turnFrom.current.fov) * e
      cam.updateProjectionMatrix()
      if (F.turnDir === 1 && F.turnT >= F.turnMs) { F.phase = 'fold'; F.tau = 0 }
      else if (F.turnDir === -1 && F.turnT <= 0) { endFold('3d'); return }
      foldRaf.current = requestAnimationFrame(foldStep)
      return
    }
    F.tau = Math.min(F.total, Math.max(0, F.tau + dt * F.dir))
    applyFold(F.tau)
    if (F.dir === 1 && F.tau >= F.total) { endFold('2d'); return }
    if (F.dir === -1 && F.tau <= 0) { endFold('3d'); return }
    foldRaf.current = requestAnimationFrame(foldStep)
  }

  function endFold(to: '2d' | '3d') {
    const g = gRef.current
    const F = fold.current
    // A turn taken back ends where the reader's camera was, not at the pose.
    const unfolded = F.phase === 'fold'
    foldRaf.current = 0
    F.phase = 'idle'
    modeRef.current = to
    foldOn.current = false
    // Every node exactly at its end state: no drift over any number of trips.
    for (let i = 0; i < F.nodes.length; i++) {
      const n = F.nodes[i]!
      const src = to === '2d' ? F.p2 : F.p3
      n.x = n.fx = src[i * 3]!; n.y = n.fy = src[i * 3 + 1]!; n.z = n.fz = to === '2d' ? 0 : src[i * 3 + 2]!
    }
    // One more engine tick carries them to the objects, then it stops; that
    // stop is not a settle.
    foldEngine(false)
    // A device that folds below 30 frames a second crossfades from now on.
    if (F.dtCount > 8) {
      const d = Array.from(F.dts.subarray(0, F.dtCount)).sort((a, b) => a - b)
      if (d[Math.floor(d.length / 2)]! > SLOW_FOLD_MS && !forceFold.current) slowFolds = true
    }
    F.dtCount = 0
    F.hulls = []
    rebuildHulls()
    const pose = poseFor(to)
    if (to === '2d') {
      // Keep the pan and zoom the fold landed on; the flat pose is the reference for label size.
      flatDist.current = pose.pos.distanceTo(pose.target)
    } else if (unfolded) setCamera(pose.pos, pose.target, pose.up, pose.fov)
    setControlsFor(to, false)
    g.enablePointerInteraction(true)
    applyParticles.current()
    // Labels fade back in over 150 ms.
    const t0 = performance.now()
    const fadeIn = () => {
      const a = Math.min(1, (performance.now() - t0) / 150)
      setLabelOpacity(a)
      if (a < 1 && !foldOn.current) requestAnimationFrame(fadeIn)
    }
    requestAnimationFrame(fadeIn)
    labelScale()
    document.documentElement.dataset.mapDimension = to
    // A camera move asked for during the fold runs now.
    const pending = pendingCam.current
    pendingCam.current = null
    if (pending) flyNow(pending)
  }

  /** Reduced motion: no turn and no fold, a 150 ms crossfade between the two end states. */
  function crossfade(to: '2d' | '3d') {
    const lib = libEl.current
    const g = gRef.current
    if (!lib || !g) return
    lib.style.transition = 'opacity 75ms linear'
    lib.style.opacity = '0'
    setTimeout(() => {
      const F = fold.current
      foldOn.current = true
      foldEngine(true)
      F.dir = to === '2d' ? 1 : -1
      applyFold(to === '2d' ? F.total : 0)
      endFold(to)
      const pose = poseFor(to)
      if (to === '2d') flatDist.current = pose.pos.distanceTo(pose.target)
      setCamera(pose.pos, pose.target, pose.up, pose.fov)
      lib.style.opacity = '1'
    }, 75)
  }

  useEffect(() => {
    startFold(dimension)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimension])

  // Development seam for the benchmark and the screenshots: the fold's
  // state, the stored layout, and a way to hold the fold at one progress.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as unknown as { __fold?: unknown }
    const handle = {
      state: () => ({ mode: modeRef.current, active: foldOn.current, phase: fold.current.phase, tau: fold.current.tau, total: fold.current.total, dir: fold.current.dir }),
      stats: () => lay.current?.stats ?? null,
      positions: () => (gRef.current?.graphData().nodes as (GNode & Positioned)[]).map((n) => ({ id: n.id, x: n.x, y: n.y, z: n.z })),
      p3: () => Object.fromEntries(live3.current),
      p2: () => Object.fromEntries(live2.current),
      /** Hold the fold at a progress, 0 standing to 1 flat, for a still. */
      hold: (p: number) => {
        const g = gRef.current
        if (!g || !lay.current) return
        if (foldRaf.current) { cancelAnimationFrame(foldRaf.current); foldRaf.current = 0 }
        if (!foldOn.current) {
          prepareFold('2d')
          foldOn.current = true
          g.enablePointerInteraction(false)
          applyParticles.current()
          buildFoldHulls()
          foldEngine(true)
        }
        fold.current.dir = 1
        fold.current.phase = 'fold'
        fold.current.tau = p * fold.current.total
        setLabelOpacity(p <= 0 ? 1 : 0)
        applyFold(fold.current.tau)
      },
      release: (to: '2d' | '3d') => { if (foldOn.current) endFold(to) },
      forceFold: (on: boolean) => { forceFold.current = on; if (on) slowFolds = false },
      slow: () => slowFolds,
      memory: () => { const info = gRef.current?.renderer().info; return info ? { geometries: info.memory.geometries, textures: info.memory.textures } : null },
    }
    const list = ((w.__fold as unknown[] | undefined) ?? []).filter(Boolean)
    list.push(handle)
    w.__fold = list
    return () => { const l = (w.__fold as unknown[]) ?? []; w.__fold = l.filter((x) => x !== handle) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- search flies the camera. Spec section 4.1 ----
  //
  // flyToId carries a nonce after a '#', because the request is an event and not
  // a value: asking to fly to the node the camera is already pointed at has to
  // move the camera. Without the nonce the effect would not re-run and a second
  // click on the same search result, or a tour step re-entered, would do nothing.
  // A request that arrives before the nodes have positions, on a deep link
  // into a beat that flies, is kept and made once the layout has run.
  const pendingFly = useRef<string | null>(null)
  /** A fly to a node has the camera; a refit for a resize or a dock change waits until the whole estate is asked for again. */
  const cameraTaken = useRef(false)
  const flyNow = (wanted: string): boolean => {
    const g = gRef.current
    if (!g) return false
    // A camera move asked for mid-fold waits for the fold to end.
    if (foldOn.current) { pendingCam.current = wanted; return true }
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    // '*' asks for the whole estate: the camera pulls back along its own line
    // of sight until everything fits, slowly, so the picture widens rather
    // than cuts.
    // In the story the pull back is slower still: it is a scene change, not
    // a search result.
    if (wanted === '*') { cameraTaken.current = false; fitRef.current?.(reduced ? 0 : document.documentElement.dataset.storyDock ? 2600 : 1800); return true }
    // '!near' asks to come in close on the node: the picture around it is
    // ghosted, so the frame is the node, its neighbours and the domain
    // boundary beside it, and the trip takes long enough to be followed.
    const near = wanted.endsWith('!near')
    const id = near ? wanted.slice(0, -'!near'.length) : wanted
    const all = g.graphData().nodes as (GNode & Positioned)[]
    const n = all.find((x) => x.id === id)
    if (!n) return true
    if (n.x === undefined) return false
    // Flat, a fly is a pan and a zoom in the plane. It never rotates.
    if (modeRef.current === '2d') {
      const f = framing()
      const half = f.halfView2 * (near ? 0.55 : 0.7)
      const dist = half / Math.tan((FLAT_FOV * Math.PI) / 360)
      moveCamera({ pos: new THREE.Vector3(n.x, n.y ?? 0, dist), target: new THREE.Vector3(n.x, n.y ?? 0, 0), up: new THREE.Vector3(0, 1, 0), fov: FLAT_FOV }, reduced ? 0 : near ? 1600 : 900)
      cameraTaken.current = true
      return true
    }
    // Stand off by a fraction of the estate's own radius, so the camera frames
    // the node in context instead of ending up inside the graph.
    const extent = Math.max(...all.map((m) => Math.hypot(m.x ?? 0, m.y ?? 0, m.z ?? 0)), 1)
    const d = Math.max(120, extent * (near ? 1.4 : 2.5))
    const r = Math.hypot(n.x, n.y ?? 0, n.z ?? 0) || 1
    // Under prefers-reduced-motion the camera cuts rather than travels. The
    // tour flies to a node at almost every step, and a viewer who has asked for
    // less motion should still arrive there, just without the trip.
    const travelMs = reduced ? 0 : near ? 2200 : 900
    const cam = g.camera() as THREE.PerspectiveCamera
    moveCamera({
      pos: new THREE.Vector3((n.x * (r + d)) / r, ((n.y ?? 0) * (r + d)) / r, ((n.z ?? 0) * (r + d)) / r),
      target: new THREE.Vector3(n.x, n.y ?? 0, n.z ?? 0),
      up: cam.up.clone(),
      fov: FOV_3D,
    }, travelMs)
    cameraTaken.current = true
    return true
  }
  useEffect(() => {
    if (!props.flyToId) return
    const wanted = props.flyToId.split('#')[0]!
    pendingFly.current = flyNow(wanted) ? null : wanted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.flyToId])

  // The inset is set in CSS rather than here, so the tour can pull the canvas
  // clear of its card without this component knowing the tour exists.
  return (
    <div ref={holder} className="graph-holder">
      <div ref={libEl} className="graph-lib" />
      {props.callout && (
        <div ref={calloutEl} className="canvas-callout" hidden aria-hidden="true">
          <span className="canvas-callout-ring" />
          <span className="canvas-callout-text">{props.callout.text}</span>
        </div>
      )}
      {props.popover && (
        <div ref={popoverEl} className="popover" hidden role="dialog">
          <div className="popover-body">{props.popover.content}</div>
        </div>
      )}
      {props.gestureHint && (
        <div ref={gestureEl} className="canvas-gesture" aria-hidden="true">
          <svg className="gesture-orbit" viewBox="0 0 48 48" width="34" height="34">
            <circle cx="24" cy="24" r="8" />
            <path d="M8 20 A17 17 0 0 1 36 12" />
            <path d="M40 28 A17 17 0 0 1 12 36" />
            <path d="M36 6 L36 13 L29 13" />
            <path d="M12 42 L12 35 L19 35" />
          </svg>
          <span>{props.gestureHint}</span>
        </div>
      )}
      {props.pokes && (
        <>
          {props.pokes.ids.map((id, i) => (
            <div key={id} ref={(el) => { pokeEls.current[i] = el }} className={`canvas-poke p${i}`} hidden aria-hidden="true"><span /><i /></div>
          ))}
          {props.pokes.text && <div key={props.pokes.text} className="canvas-poke-hint" aria-hidden="true">{props.pokes.text}</div>}
        </>
      )}
      {props.note && <div ref={noteEl} className={props.noteAt ? 'canvas-book canvas-note canvas-note-at' : 'canvas-book canvas-note'} aria-hidden="true">{props.note}</div>}
      {props.book && (
        <>
          <svg ref={wiresEl} className="canvas-wires" aria-hidden="true">
            {props.book.rows.map((_, i) => <path key={i} className={`wire w${i + 1}`} />)}
          </svg>
          <div ref={bookEl} className="canvas-book" aria-hidden="true">
            <div className="book-title">{props.book.title}</div>
            {props.book.rows.map((r, i) => <div key={i} className={`book-row ov-in d${i + 1}`}><span className="book-n">{i + 1}</span><span className="book-l">{r.label}{r.value && <span className="book-v">{r.value}</span>}</span><span className="book-rule" /></div>)}
            <div className="book-note ov-in d4">{props.book.note}</div>
          </div>
        </>
      )}
    </div>
  )
}
