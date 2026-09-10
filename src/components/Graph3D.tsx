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

export type LabelMode = 'all' | 'selected' | 'none'

export interface Graph3DProps {
  data: GraphData
  dark: boolean
  showHulls: boolean
  labelMode: LabelMode
  selectedId: string | null
  isolatedSubdomain: string | null
  flyToId: string | null
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
      // Frame the whole estate once, rather than leaving it small in the middle
      // of the canvas. Only on the first settle, so it does not yank the camera
      // back after the user has moved it.
      if (!framed) { framed = true; g.zoomToFit(600, 70) }
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
      const mat = new THREE.MeshLambertMaterial({
        color: colour,
        transparent: true,
        opacity: dim ? 0.12 : 1,
        emissive: isSel ? new THREE.Color(colour) : new THREE.Color('#000000'),
        emissiveIntensity: isSel ? 0.55 : 0,
      })
      const obj = new THREE.Object3D()
      obj.add(new THREE.Mesh(geom, mat))

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
      return 0.25 + 2.6 * Math.sqrt(l.spend / maxSpend)
    })
    g.linkOpacity(0.3)
    g.linkColor((raw: object) => {
      const l = raw as GLink
      if (selectedId && (l.ucId === selectedId || l.platformId === selectedId)) return dark ? '#ffffff' : '#20242b'
      if (isolatedSubdomain && !isIn(l.ucId)) return dark ? '#2a2e35' : '#d5d5d2'
      return dark ? '#7d848e' : '#9aa0a8'
    })
    rebuildHulls()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.dark, props.labelMode, props.selectedId, props.isolatedSubdomain, props.showHulls, props.data])

  // ---- search flies the camera. Spec section 4.1 ----
  useEffect(() => {
    const g = gRef.current
    if (!g || !props.flyToId) return
    const all = g.graphData().nodes as (GNode & Positioned)[]
    const n = all.find((x) => x.id === props.flyToId)
    if (!n || n.x === undefined) return
    // Stand off by a fraction of the estate's own radius, so the camera frames
    // the node in context instead of ending up inside the graph.
    const extent = Math.max(...all.map((m) => Math.hypot(m.x ?? 0, m.y ?? 0, m.z ?? 0)), 1)
    const d = Math.max(120, extent * 0.85)
    const r = Math.hypot(n.x, n.y ?? 0, n.z ?? 0) || 1
    g.cameraPosition(
      { x: (n.x * (r + d)) / r, y: ((n.y ?? 0) * (r + d)) / r, z: ((n.z ?? 0) * (r + d)) / r },
      { x: n.x, y: n.y ?? 0, z: n.z ?? 0 },
      900,
    )
  }, [props.flyToId])

  return <div ref={holder} style={{ position: 'absolute', inset: 0 }} />
}
