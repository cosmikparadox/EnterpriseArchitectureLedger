// The 3D force-directed graph. Spec section 4.1.
//
// 3d-force-graph drives three.js and d3-force-3d underneath. Subdomain hulls
// are added to its scene directly, because they have to follow the layout as it
// settles.

import { useEffect, useRef, type ReactNode } from 'react'
import ForceGraph3D from '3d-force-graph'
import * as THREE from 'three'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'
import SpriteText from 'three-spritetext'
import { NEUTRAL, NEUTRAL_DIM, SUBDOMAIN_COLOUR, type GLink, type GNode, type GraphData } from '../app/graph'
import { ringTexture, type RingSplit } from './rings'
import { reportSelectedScreenPos } from '../app/layoutReport'

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
}

/** Nodes the layout must not push to the rim. Spec section 12: pin the identity
 *  node and the data platform near the centre if the layout drifts them out.
 *  Implemented as a pull toward the origin rather than a hard pin, so the rest
 *  of the physics stays honest. */
const HUBS = new Set(['okta', 'meridian', 'lakehouse'])
/** Hull fill and edge opacity when fully shown. */
const HULL_FILL = 0.085
const HULL_EDGE = 0.3
/** Strength of the pull that keeps each part of the business in its sector. */
const SECTOR_PULL = 0.1

interface Positioned { x?: number; y?: number; z?: number; vx?: number; vy?: number; vz?: number }

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gRef = useRef<any>(null)
  const hullGroup = useRef<THREE.Group | null>(null)
  const propsRef = useRef(props)
  propsRef.current = props

  // ---- create once ----
  useEffect(() => {
    const el = holder.current
    if (!el) return
    const g = ForceGraph3D()(el)
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
        return `${Math.round(k.units).toLocaleString('en-GB')} units, GBP ${Math.round(k.spend).toLocaleString('en-GB')}/month`
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
      .cooldownTicks(300)
      .cooldownTime(Infinity)

    // Pull the hubs toward the centre so fan-in stays visible.
    g.d3Force('hub', ((alpha: number) => {
      for (const n of (g.graphData().nodes as (GNode & Positioned)[])) {
        if (!HUBS.has(n.id)) continue
        n.vx = (n.vx ?? 0) - (n.x ?? 0) * 0.12 * alpha
        n.vy = (n.vy ?? 0) - (n.y ?? 0) * 0.12 * alpha
        n.vz = (n.vz ?? 0) - (n.z ?? 0) * 0.12 * alpha
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any)
    // Hold each part of the business in its sector. The link force pulls the
    // use cases of two parts that share most of their platforms onto the same
    // spot; this pull toward the part's anchor direction is what keeps their
    // coloured regions apart. It is gentle, and it fades with alpha like the
    // rest of the simulation, so the settled shape is still the forces' own.
    g.d3Force('sector', ((alpha: number) => {
      const { anchors, radius: sectorRadius } = propsRef.current.data
      for (const n of (g.graphData().nodes as (GNode & Positioned)[])) {
        if (n.kind !== 'use_case' || !n.subdomain) continue
        const a = anchors.get(n.subdomain)
        if (!a) continue
        n.vx = (n.vx ?? 0) + (a[0] * sectorRadius - (n.x ?? 0)) * SECTOR_PULL * alpha
        n.vy = (n.vy ?? 0) + (a[1] * sectorRadius - (n.y ?? 0)) * SECTOR_PULL * alpha
        n.vz = (n.vz ?? 0) + (a[2] * sectorRadius - (n.z ?? 0)) * SECTOR_PULL * alpha
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
            m.geometry.computeBoundingBox()
            const c = m.geometry.boundingBox!.getCenter(new THREE.Vector3()).project(cam)
            return { subdomain: m.userData.subdomain as string, x: box.left + ((c.x + 1) / 2) * box.width, y: box.top + ((1 - c.y) / 2) * box.height }
          })
      }
    }

    let ticks = 0
    let framed = false
    g.onEngineTick(() => { if (++ticks % 8 === 0) rebuildHulls() })
    g.onEngineStop(() => {
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
        g.zoomToFit(ms, 70)
      }
    })

    // Re-frame the estate when the canvas changes size, until the viewer takes
    // the camera. Opening a panel or turning the split narrows the canvas, and
    // without this the graph stays framed for a box that no longer exists and
    // drifts off to one side. Once somebody has orbited, their camera is theirs.
    let userMovedCamera = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = g.controls() as any
    controls?.addEventListener?.('start', () => { userMovedCamera = true })

    let refit: ReturnType<typeof setTimeout> | undefined
    const ro = new ResizeObserver(() => {
      g.width(el.clientWidth)
      g.height(el.clientHeight)
      // Only once the layout has settled. Fitting while the simulation is still
      // spreading the nodes frames an estate a fraction of its final size, and
      // the graph ends up zoomed into the middle of itself.
      if (userMovedCamera || !framed) return
      clearTimeout(refit)
      refit = setTimeout(() => { if (!userMovedCamera && framed) g.zoomToFit(300, 70) }, 300)
    })
    ro.observe(el)
    g.width(el.clientWidth).height(el.clientHeight)

    return () => {
      clearTimeout(refit)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      for (const o of objs.current.values()) disposeNode(o)
      objs.current.clear()
      g._destructor()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** A click that reached past the nodes: a hull if one is under it, else the background. */
  function clickBehind(ev: MouseEvent) {
    const hit = hullUnderPointer(ev)
    if (hit && propsRef.current.onSelectHull) propsRef.current.onSelectHull(hit)
    else propsRef.current.onBackground()
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
    const hits = raycaster.current.intersectObjects(meshes, false)
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
    return best
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

  function rebuildHulls() {
    const g = gRef.current
    const group = hullGroup.current
    if (!g || !group) return
    for (const c of [...group.children]) {
      group.remove(c)
      const m = c as THREE.Mesh
      m.geometry?.dispose()
      ;(m.material as THREE.Material)?.dispose()
    }
    const { showHulls, isolatedSubdomain } = propsRef.current
    if (!showHulls) return

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

  // ---- data ----
  useEffect(() => {
    const g = gRef.current
    if (!g) return
    g.graphData(props.data as unknown as { nodes: object[]; links: object[] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data])

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
  useEffect(() => () => { if (fadeRaf.current) cancelAnimationFrame(fadeRaf.current) }, [])

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

      const colour = n.kind === 'use_case'
        ? (SUBDOMAIN_COLOUR[n.subdomain ?? ''] ?? NEUTRAL)
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

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r * 1.9, r * 0.13, 8, 40),
        new THREE.MeshBasicMaterial({ color: dark ? '#ffffff' : '#111111' }),
      )
      ring.visible = false
      group.add(ring)

      const fail = new THREE.Mesh(
        new THREE.TorusGeometry(r * 2.4, r * 0.16, 8, 44),
        new THREE.MeshBasicMaterial({ color: '#d05a6a' }),
      )
      fail.rotation.x = Math.PI / 2
      fail.visible = false
      group.add(fail)

      // View 2's donut. A sprite, so it always faces the viewer: spec section
      // 4.2 asks for the ring in screen space.
      let ringSprite: THREE.Sprite | null = null
      const split = props.nodeRing?.(n) ?? null
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
      if (labelMode !== 'none') {
        label = new SpriteText(n.name)
        label.color = dark ? '#e7eaef' : '#20242b'
        // Hub labels are the only text on that screen and they carry the
        // comparison, so they are set larger than on a screen where everything
        // is named.
        label.textHeight = labelMode === 'hubs' ? 6.4 : n.kind === 'use_case' ? 2.8 : 4.2
        label.position.set(0, r + 3.4, 0)
        label.visible = false
        group.add(label)
      }

      const o: NodeObjs = { mesh, solid, wire, halo, ring, fail, label, ringSprite, colour, fadeFrom: 1, fadeTo: 1, fadeT0: 0 }
      objs.current.set(n.id, o)
      // The library builds objects lazily, after the state effect has run, so a
      // fresh object takes the current state here or it would show whole until
      // something changed. This is why the title card used to show the estate.
      applyNodeState(n, o, true)
      return group
    })

    // Fresh objects need the current state put on them.
    applyState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data, props.dark, props.labelMode, props.nodeRing])

  // ---- state, and the fade between states ----
  //
  // Opacity does not jump. Each node and each hull keeps where it is going and
  // when it set off; one animation frame loop, started only when something is
  // still moving and stopped when nothing is, eases every material toward its
  // target. Nothing is allocated per frame and no React state is touched, so
  // a layer of the intro fading in costs a few multiplications a frame.
  const FADE_MS = 720
  /** Hulls are large and few; a slower arrival reads as a fade rather than a blink. */
  const HULL_FADE_MS = 1400
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
        const t = Math.min(1, (now - o.fadeT0) / FADE_MS)
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

  /** Aim a node's opacity, at once or over the fade. */
  const fadeTo = (o: NodeObjs, target: number, instant: boolean) => {
    if (o.fadeTo === target && (instant || o.solid.opacity === target)) return
    o.fadeTo = target
    if (instant || propsRef.current.reducedMotion) { o.solid.opacity = target; o.fadeFrom = target; o.mesh.visible = target > 0; return }
    o.mesh.visible = true
    o.fadeFrom = o.solid.opacity
    o.fadeT0 = performance.now()
    runFades()
  }

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
    const affected = propsRef.current.affectedUseCases?.has(n.id) === true
    const failed = propsRef.current.failedNodeId === n.id

    o.mesh.material = affected ? o.wire : o.solid
    // A node the intro has not revealed is not there at all; a node Isolate
    // has dimmed is still there, faintly, because the sharing is the lesson.
    fadeTo(o, propsRef.current.dimNodes?.has(n.id) ? 0 : dim ? 0.12 : 1, instant)
    o.solid.emissive.set(failed ? '#d05a6a' : isSel ? o.colour : '#000000')
    o.solid.emissiveIntensity = failed ? 0.9 : isSel ? 0.55 : 0
    o.halo.visible = isSel && !dim
    o.ring.visible = isSel
    o.fail.visible = failed
    if (o.ringSprite) o.ringSprite.visible = !dim
    if (o.label) {
      o.label.visible =
        labelMode === 'all' ? !dim
        : labelMode === 'selected' ? (isSel || isNeighbour)
        : labelMode === 'hubs' ? (!dim && n.kind !== 'use_case' && (n.riders ?? 0) >= HUB_RIDERS)
        : false
    }
  }

  const applyState = () => {
    const g = gRef.current
    if (!g) return
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
      const target = arrived ? 1 : 0
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
    // moves when a failure lights a link.
    g.linkVisibility((raw: object) => {
      const l = raw as GLink
      const h = props.hideLinksOf
      return !(h && (h.has(l.ucId) || h.has(l.platformId)))
    })
    g.linkColor((raw: object) => {
      const l = raw as GLink
      if (props.litLinks?.has(`${l.ucId}>${l.platformId}`)) return '#d05a6a'
      if (selectedId && (l.ucId === selectedId || l.platformId === selectedId)) return dark ? '#ffffff' : '#20242b'
      if (isolatedSubdomain && !isIn(l.ucId)) return dark ? '#2a2e35' : '#d5d5d2'
      return dark ? '#7d848e' : '#9aa0a8'
    })
    rebuildHulls()
  }

  useEffect(() => {
    applyState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectedId, props.isolatedSubdomain, props.showHulls, props.dimNodes, props.dimHulls, props.failedNodeId,
      props.affectedUseCases, props.litLinks, props.hideLinksOf])

  // Link width and the dashed treatment rebuild link geometry, so they are
  // re-issued only when their own inputs change.
  useEffect(() => {
    const g = gRef.current
    if (!g) return
    const { dark, data } = props
    const maxSpend = Math.max(...data.links.map((l) => l.spend), 1)
    g.linkWidth((raw: object) => {
      const l = raw as GLink
      const lit = props.litLinks?.has(`${l.ucId}>${l.platformId}`) === true
      return (lit ? 1.6 : 0) + 0.25 + 2.6 * Math.sqrt(l.spend / maxSpend)
    })
    if (props.dashedLinks) {
      const dashed = props.dashedLinks
      g.linkThreeObject(((raw: object) => {
        const l = raw as GLink
        const isDashed = dashed.has(`${l.ucId}>${l.platformId}`)
        const geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
        const mat = isDashed
          ? new THREE.LineDashedMaterial({
            color: dark ? '#e8c46a' : '#a97c12', dashSize: 3, gapSize: 2.4,
            transparent: true, opacity: 0.95,
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
  }, [props.data, props.dark, props.litLinks, props.dashedLinks])

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
        const hit = target.kind === 'node' ? n.id === target.id : (n.kind === 'use_case' && n.subdomain === target.id)
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
  useEffect(() => follow(popoverEl.current, props.popover, true), [props.popover])

  // ---- search flies the camera. Spec section 4.1 ----
  //
  // flyToId carries a nonce after a '#', because the request is an event and not
  // a value: asking to fly to the node the camera is already pointed at has to
  // move the camera. Without the nonce the effect would not re-run and a second
  // click on the same search result, or a tour step re-entered, would do nothing.
  useEffect(() => {
    const g = gRef.current
    if (!g || !props.flyToId) return
    const wanted = props.flyToId.split('#')[0]!
    const all = g.graphData().nodes as (GNode & Positioned)[]
    const n = all.find((x) => x.id === wanted)
    if (!n || n.x === undefined) return
    // Stand off by a fraction of the estate's own radius, so the camera frames
    // the node in context instead of ending up inside the graph.
    const extent = Math.max(...all.map((m) => Math.hypot(m.x ?? 0, m.y ?? 0, m.z ?? 0)), 1)
    const d = Math.max(120, extent * 0.85)
    const r = Math.hypot(n.x, n.y ?? 0, n.z ?? 0) || 1
    // Under prefers-reduced-motion the camera cuts rather than travels. The
    // tour flies to a node at almost every step, and a viewer who has asked for
    // less motion should still arrive there, just without the trip.
    const travelMs = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900
    g.cameraPosition(
      { x: (n.x * (r + d)) / r, y: ((n.y ?? 0) * (r + d)) / r, z: ((n.z ?? 0) * (r + d)) / r },
      { x: n.x, y: n.y ?? 0, z: n.z ?? 0 },
      travelMs,
    )
  }, [props.flyToId])

  // The inset is set in CSS rather than here, so the tour can pull the canvas
  // clear of its card without this component knowing the tour exists.
  return (
    <div ref={holder} className="graph-holder">
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
    </div>
  )
}
