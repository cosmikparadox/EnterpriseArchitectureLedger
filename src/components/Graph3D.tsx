// The 3D force-directed graph. Spec section 4.1.
//
// 3d-force-graph drives three.js and d3-force-3d underneath. Subdomain hulls
// are added to its scene directly, because they have to follow the layout as it
// settles.

import { useEffect, useRef } from 'react'
import ForceGraph3D from '3d-force-graph'
import * as THREE from 'three'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js'
import SpriteText from 'three-spritetext'
import { NEUTRAL, NEUTRAL_DIM, SUBDOMAIN_COLOUR, type GLink, type GNode, type GraphData } from '../app/graph'
import { ringTexture, type RingSplit } from './rings'
import { reportSelectedScreenPos } from '../app/layoutReport'

export type LabelMode = 'all' | 'selected' | 'none'

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
  /** View 6. Edges that cross a declared boundary, drawn dashed. */
  dashedLinks?: Set<string>
  onSelectNode: (id: string) => void
  onSelectLink: (link: GLink) => void
  onBackground: () => void
}

/** Nodes the layout must not push to the rim. Spec section 12: pin the identity
 *  node and the data platform near the centre if the layout drifts them out.
 *  Implemented as a pull toward the origin rather than a hard pin, so the rest
 *  of the physics stays honest. */
const HUBS = new Set(['okta', 'meridian', 'lakehouse'])

interface Positioned { x?: number; y?: number; z?: number; vx?: number; vy?: number; vz?: number }

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

    g.backgroundColor('rgba(0,0,0,0)')
      .showNavInfo(false)
      .nodeRelSize(4)
      .nodeVal((n: object) => (n as GNode).val)
      .nodeLabel((n: object) => (n as GNode).name)
      .linkLabel((l: object) => {
        const k = l as GLink
        return `${Math.round(k.units).toLocaleString('en-GB')} units, GBP ${Math.round(k.spend).toLocaleString('en-GB')}/month`
      })
      .onNodeClick((n: object) => propsRef.current.onSelectNode((n as GNode).id))
      .onLinkClick((l: object) => propsRef.current.onSelectLink(l as GLink))
      .onBackgroundClick(() => propsRef.current.onBackground())
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const charge = g.d3Force('charge') as any
    if (charge?.strength) charge.strength(-140)

    const group = new THREE.Group()
    hullGroup.current = group
    g.scene().add(group)

    let ticks = 0
    let framed = false
    g.onEngineTick(() => { if (++ticks % 8 === 0) rebuildHulls() })
    g.onEngineStop(() => {
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

    const ro = new ResizeObserver(() => {
      g.width(el.clientWidth)
      g.height(el.clientHeight)
    })
    ro.observe(el)
    g.width(el.clientWidth).height(el.clientHeight)

    return () => { ro.disconnect(); g._destructor() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- hulls ----
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
      let geom: ConvexGeometry
      try { geom = new ConvexGeometry(pts) } catch { continue }
      // Hulls overlap around shared platforms. Spec section 4.1: do not hide
      // this, the overlap IS the lesson. Additive blending makes the overlap
      // read as denser rather than hiding one hull behind another.
      const mat = new THREE.MeshBasicMaterial({
        color: SUBDOMAIN_COLOUR[sub] ?? NEUTRAL,
        transparent: true,
        opacity: 0.085,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      group.add(new THREE.Mesh(geom, mat))
      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(geom, 24),
        new THREE.LineBasicMaterial({ color: SUBDOMAIN_COLOUR[sub] ?? NEUTRAL, transparent: true, opacity: 0.3 }),
      )
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

  // ---- appearance, re-applied when any display state changes ----
  useEffect(() => {
    const g = gRef.current
    if (!g) return
    const { dark, labelMode, selectedId, isolatedSubdomain, data } = props

    const neighbours = new Set<string>()
    if (selectedId) {
      neighbours.add(selectedId)
      for (const l of data.links) {
        if (l.ucId === selectedId) neighbours.add(l.platformId)
        if (l.platformId === selectedId) neighbours.add(l.ucId)
      }
    }

    const dimmed = (n: GNode) => {
      if (props.dimNodes?.has(n.id)) return true
      if (!isolatedSubdomain) return false
      // Isolate dims everything outside one subdomain but KEEPS shared
      // platforms lit, because the sharing is the point. Spec section 4.1.
      if (n.kind !== 'use_case') return !data.links.some((l) => l.platformId === n.id && isIn(l.ucId))
      return n.subdomain !== isolatedSubdomain
    }
    const isIn = (ucId: string) => data.nodes.find((n) => n.id === ucId)?.subdomain === isolatedSubdomain

    const maxSpend = Math.max(...data.links.map((l) => l.spend), 1)

    g.nodeThreeObject((raw: object) => {
      const n = raw as GNode
      const dim = dimmed(n)
      const isSel = selectedId === n.id
      const isNeighbour = neighbours.has(n.id)
      const colour = n.kind === 'use_case'
        ? (SUBDOMAIN_COLOUR[n.subdomain ?? ''] ?? NEUTRAL)
        : (dark ? NEUTRAL : NEUTRAL_DIM)

      // Shape carries node type independently of colour. Spec section 2.
      //   platform     sphere
      //   integration  octahedron, a distinct silhouette
      //   use case     small sphere
      const r = n.val
      const geom = n.kind === 'integration'
        ? new THREE.OctahedronGeometry(r * 1.25)
        : new THREE.SphereGeometry(r, 20, 14)
      // Spec section 4.3: affected use cases take a distinct SHAPE STATE, not
      // just a colour. Wireframe is the state, so the change survives greyscale.
      const affected = props.affectedUseCases?.has(n.id) === true
      const failed = props.failedNodeId === n.id
      const mat = affected
        ? new THREE.MeshBasicMaterial({ color: colour, wireframe: true })
        : new THREE.MeshLambertMaterial({
          color: colour,
          transparent: true,
          opacity: dim ? 0.12 : 1,
          emissive: failed ? new THREE.Color('#d05a6a') : isSel ? new THREE.Color(colour) : new THREE.Color('#000000'),
          emissiveIntensity: failed ? 0.9 : isSel ? 0.55 : 0,
        })
      const obj = new THREE.Object3D()
      obj.add(new THREE.Mesh(geom, mat))

      // The selected node wears a halo, not just a brighter face. Emissive
      // alone reads as "slightly paler grey" on a grey platform in daylight,
      // and the tour's first step says "the lit one", so the lit one has to be
      // obvious from across the room. A back-faced shell renders as a rim of
      // light around the silhouette at any camera angle.
      if (isSel && !dim) {
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(r * 1.85, 22, 16),
          new THREE.MeshBasicMaterial({
            color: dark ? '#9ccbf5' : '#1f4e79',
            transparent: true,
            opacity: 0.26,
            side: THREE.BackSide,
            depthWrite: false,
          }),
        )
        obj.add(halo)
      }

      // View 2's donut. A sprite, so it always faces the viewer: spec section
      // 4.2 asks for the ring in screen space.
      const split = props.nodeRing?.(n) ?? null
      if (split && !dim) {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
          map: ringTexture(split, dark), transparent: true, depthWrite: false,
        }))
        const s = r * 5.4
        sprite.scale.set(s, s, 1)
        obj.add(sprite)
      }

      if (failed) {
        const halo = new THREE.Mesh(
          new THREE.TorusGeometry(r * 2.4, r * 0.16, 8, 44),
          new THREE.MeshBasicMaterial({ color: '#d05a6a' }),
        )
        halo.rotation.x = Math.PI / 2
        obj.add(halo)
      }

      if (isSel) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(r * 1.9, r * 0.13, 8, 40),
          new THREE.MeshBasicMaterial({ color: dark ? '#ffffff' : '#111111' }),
        )
        obj.add(ring)
      }

      const wantLabel =
        labelMode === 'all' ? !dim
        : labelMode === 'selected' ? (isSel || isNeighbour)
        : false
      if (wantLabel) {
        const t = new SpriteText(n.name)
        t.color = dark ? '#e7eaef' : '#20242b'
        t.textHeight = n.kind === 'use_case' ? 2.8 : 4.2
        t.position.set(0, r + 3.4, 0)
        obj.add(t)
      }
      return obj
    })

    g.linkWidth((raw: object) => {
      const l = raw as GLink
      const lit = props.litLinks?.has(`${l.ucId}>${l.platformId}`) === true
      return (lit ? 1.6 : 0) + 0.25 + 2.6 * Math.sqrt(l.spend / maxSpend)
    })
    g.linkOpacity(0.3)

    // Spec section 4.6: boundary-crossing edges are rendered distinctly, dashed.
    // The library has no dash accessor, so the links are drawn as custom
    // three.js lines with a dashed material. Dash pattern rather than colour, so
    // the distinction is not carried by colour alone.
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
    g.linkColor((raw: object) => {
      const l = raw as GLink
      if (props.litLinks?.has(`${l.ucId}>${l.platformId}`)) return '#d05a6a'
      if (selectedId && (l.ucId === selectedId || l.platformId === selectedId)) return dark ? '#ffffff' : '#20242b'
      if (isolatedSubdomain && !isIn(l.ucId)) return dark ? '#2a2e35' : '#d5d5d2'
      return dark ? '#7d848e' : '#9aa0a8'
    })
    rebuildHulls()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.dark, props.labelMode, props.selectedId, props.isolatedSubdomain, props.showHulls, props.data,
      props.nodeRing, props.failedNodeId, props.affectedUseCases, props.litLinks, props.dimNodes,
      props.dashedLinks])

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
  return <div ref={holder} className="graph-holder" />
}
