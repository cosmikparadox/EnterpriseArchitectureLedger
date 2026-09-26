// Audit v0.4, section 13. The checks that hold the story to what it says:
// the copy deck's rules, the tour use case's figures, the dependence range,
// the cost of the next use case, the switching-cost split and the boundary.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import * as copyModule from './copy'
import type { AllocationRule, Estate } from './model/types'
import {
  attachedAt, buildIndex, executionComponent, gbpAbout, meteredSpend, optionComponent, optionEngineFor,
  ruleShare, workOfLeaving,
} from './model/ledger'
import { simulate } from './model/montecarlo'
import { withSyntheticRiders } from './app/graph'
import { fixedPointRange, storedFrame } from './app/stored'
import { tourUseCaseFigures } from './story/tourFigures'
import { IDENTITY_ID, LEAVING_PLATFORM_ID, MOVER_ID, MOVER_TO, TOUR_SUBDOMAIN, TOUR_UC } from './story/script'

const estate: Estate = JSON.parse(readFileSync('data/estate.json', 'utf8'))
const ix = buildIndex(estate)
const rounded = (n: number) => Math.round(n).toLocaleString('en-GB')

describe('1. the copy deck', () => {
  const BANNED = [
    'unsplit', 'Plus an option component', 'split it into', 'too high', 'the extreme case', 'They rarely do',
    'Stops at the cloud bill', 'Risk does not move', 'Three entries on one node', 'tests reading', 'has no owner',
  ]
  const strings: [string, string][] = []
  const walk = (key: string, v: unknown) => {
    if (typeof v === 'string') strings.push([key, v])
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v as Record<string, unknown>)) walk(`${key}.${k}`, x)
  }
  for (const name of ['copy', 'glossary', 'summary'] as const) walk(name, copyModule[name])

  it('has no en or em dash anywhere', () => {
    expect(strings.filter(([, v]) => /[–—]/.test(v)).map(([k]) => k)).toEqual([])
  })
  it('has no sentence over twenty words outside More detail and the owner\'s title sentence', () => {
    const long: string[] = []
    for (const [k, v] of strings) {
      if (k.endsWith('_more') || k === 'copy.b_title_see') continue
      for (const s of v.replace(/(\d)\.(\d)/g, '$1<dot>$2').split(/(?<=[.?!])\s+/)) {
        if (s.trim().split(/\s+/).filter(Boolean).length > 20) long.push(`${k}: ${s.slice(0, 60)}`)
      }
    }
    expect(long).toEqual([])
  })
  it('carries none of the retired phrases', () => {
    const hits = strings.flatMap(([k, v]) => BANNED.filter((b) => v.includes(b)).map((b) => `${k}: ${b}`))
    expect(hits).toEqual([])
  })
})

describe('3. the story figures for the tour use case', () => {
  const frame = storedFrame(estate, 0.5)!
  const f = tourUseCaseFigures(ix, 'equal', frame)

  it('is Claim triage', () => {
    expect(TOUR_UC).toBe('uc_claim_triage')
    expect(f.name).toBe('Claim triage')
  })
  it('entry one is USD 49,444 a month under an equal split, USD 23,795 of it by rule', () => {
    expect(rounded(f.reported)).toBe('49,444')
    expect(rounded(f.byRule)).toBe('23,795')
    expect(f.platforms).toBe(5)
  })
  it('entry two is the tour use case\'s own P99 from the same run', () => {
    expect(f.p99).toBe(frame.useCases.find((u) => u.id === TOUR_UC)!.p99)
    expect(gbpAbout(f.p99!)).toBe('59,000')
  })
  it('entry three is the work of leaving Claims administration today, whole, shared by 6', () => {
    const ca = ix.platformById.get(LEAVING_PLATFORM_ID)!
    expect(f.leaving!.name).toBe('Claims administration')
    expect(f.leaving!.riders).toBe(6)
    expect(f.leaving!.exec).toBe(workOfLeaving(ca, 6, 60 - ca.adopted_month))
    expect(gbpAbout(f.leaving!.exec)).toBe('5,300,000')
  })
})

describe('4. the dependence range comes from the five fixed points', () => {
  it('reads the five stored runs and gives the expected figures', () => {
    const r = fixedPointRange(estate, TOUR_SUBDOMAIN)!
    expect(r.points.map((p) => p.rho)).toEqual([0, 0.25, 0.5, 0.75, 1])
    expect(r.points.map((p) => p.sum)).toEqual([272713, 244913, 259625, 241886, 201443])
    expect(r.points.map((p) => p.joint)).toEqual([192151, 190880, 203758, 210729, 185887])
    expect([gbpAbout(r.sumLo), gbpAbout(r.sumHi)]).toEqual(['200,000', '270,000'])
  })
  it('is identical across repeated calls and call orders', () => {
    const first = fixedPointRange(estate, TOUR_SUBDOMAIN)
    for (const s of estate.subdomains) fixedPointRange(estate, s.id)
    expect(fixedPointRange(estate, TOUR_SUBDOMAIN)).toEqual(first)
    expect(fixedPointRange(estate, TOUR_SUBDOMAIN)).toEqual(first)
  })
})

describe('5. the cost of the next use case', () => {
  const metered = (k: number) => meteredSpend(buildIndex(withSyntheticRiders(estate, IDENTITY_ID, k)), IDENTITY_ID)
  const pool = (k: number) => buildIndex(withSyntheticRiders(estate, IDENTITY_ID, k)).platformById.get(IDENTITY_ID)!.fixed_pool_gbp_month
  it('is the metered increment of one more rider, about USD 86 a month', () => {
    for (let k = 0; k < 3; k++) {
      const mc = metered(k + 1) - metered(k)
      expect(mc).toBeCloseTo(85.8, 1)
      expect(rounded(mc)).toBe('86')
    }
  })
  it('leaves the pool unchanged', () => {
    for (let k = 0; k <= 3; k++) expect(pool(k)).toBe(24000)
  })
})

describe('6. the switching-cost split', () => {
  const ca = ix.platformById.get(LEAVING_PLATFORM_ID)!
  const m31 = 31 - ca.adopted_month
  const option = optionComponent(optionEngineFor(ca, estate.option_model), ca, 6, m31)
  it('Claims administration: adopted month 6, six riders in Claims and Data, at months 6, 8, 11, 18, 26 and 30', () => {
    expect(ca.adopted_month).toBe(6)
    const riders = ix.ridersOf.get(LEAVING_PLATFORM_ID)!
    expect(riders.map((r) => r.uc.adopted_month).sort((a, b) => a - b)).toEqual([6, 8, 11, 18, 26, 30])
    expect(new Set(riders.map((r) => r.uc.subdomain))).toEqual(new Set(['claims', 'data']))
    expect(attachedAt(ix, LEAVING_PLATFORM_ID, 31)).toHaveLength(6)
  })
  it('reads about 3,800,000 whole at month 31 and 5,300,000 at month 60; 3,300,000 of it created, 680,000 the option part, at 31', () => {
    expect(gbpAbout(workOfLeaving(ca, 6, m31))).toBe('3,800,000')
    expect(gbpAbout(workOfLeaving(ca, 6, 60 - ca.adopted_month))).toBe('5,300,000')
    expect(gbpAbout(executionComponent(ca, 6, m31))).toBe('3,300,000')
    expect(gbpAbout(option)).toBe('680,000')
  })
  it('the refusal block quotes both parts, and nothing adds either to the work of leaving', () => {
    for (const file of ['src/components/DetailPanel.tsx', 'src/views/Footprint.tsx']) {
      const src = readFileSync(file, 'utf8')
      expect(src).toContain('copy.sw_created')
      expect(src).toContain('copy.sw_given_up')
      expect(src).toMatch(/executionComponent/)
      expect(src).toMatch(/optionComponent|option\.value/)
      expect(src).not.toMatch(/(workOfLeaving|execution|created)\s*\+|\+\s*(now\.|v\.)?(option|created|executionComponent)\b/)
    }
  })
})

describe('6b. a rider attaches no earlier than its platform', () => {
  it('the Data cloud, adopted at month 17, has none attached at month 16 and six at month 17', () => {
    expect(ix.platformById.get('meridian')!.adopted_month).toBe(17)
    expect(attachedAt(ix, 'meridian', 16)).toHaveLength(0)
    expect(attachedAt(ix, 'meridian', 17)).toHaveLength(6)
  })
})

describe('7. moving Broker quote into Customer Service', () => {
  const moved: Estate = { ...estate, use_cases: estate.use_cases.map((u) => (u.id === MOVER_ID ? { ...u, subdomain: MOVER_TO } : u)) }
  const ixM = buildIndex(moved)
  it('leaves every cost figure unchanged under equal, driver and by volume', () => {
    for (const rule of ['equal', 'driver', 'by_volume'] as AllocationRule[]) {
      for (const p of estate.platforms) for (const r of ix.ridersOf.get(p.id)!) {
        expect(ruleShare(ixM, p.id, r.uc.id, rule)).toBeCloseTo(ruleShare(ix, p.id, r.uc.id, rule), 9)
      }
    }
  })
  it('scales its own P99 by exactly 6/18 on the same seed', () => {
    const args = { rho: 0.5, nu: 4, runs: 2000, seed: 20260905 }
    const before = simulate({ estate, ...args }).useCases.find((u) => u.id === MOVER_ID)!.p99
    const after = simulate({ estate: moved, ...args }).useCases.find((u) => u.id === MOVER_ID)!.p99
    expect(after / before).toBeCloseTo(6 / 18, 9)
  })
})
