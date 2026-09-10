// Renders the app in a real browser and captures desktop and mobile emulation
// shots into ./screenshots. Build step 4d and 4e.
import { mkdirSync } from 'node:fs'
import { createServer } from 'vite'
import { launch } from './browser.ts'
import type { Browser, Page } from '@playwright/test'

const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 390, height: 844 } // a common phone viewport

const only = process.argv[2] ?? ''

interface Shot { name: string; view: number; act?: (p: Page) => Promise<void> }

const SHOTS: Shot[] = [
  { name: '01-explore', view: 1 },
  {
    name: '01-explore-node', view: 1,
    act: async (p) => {
      await p.getByLabel('Search nodes by name').fill('Okta')
      await p.getByRole('option').first().click()
      await p.waitForTimeout(1400)
    },
  },
  {
    name: '01-explore-isolate', view: 1,
    act: async (p) => {
      await p.getByLabel('Isolate a subdomain').selectOption('claims')
      await p.waitForTimeout(900)
    },
  },
  {
    name: '02-fixed-pool', view: 2,
    act: async (p) => {
      await p.getByRole('button', { name: '2 Fixed pool' }).click()
      await p.waitForTimeout(3200)
    },
  },
  {
    name: '02-fixed-pool-fanin', view: 2,
    act: async (p) => {
      await p.getByRole('button', { name: '2 Fixed pool' }).click()
      await p.waitForTimeout(3000)
      // The spec's ten second test: pick a rider, then drag the fan-in slider
      // and watch its number move although it did nothing different.
      await p.getByRole('button', { name: /Quote and bind/ }).first().click()
      await p.getByLabel('Add synthetic use cases riding this platform').fill('16')
      await p.waitForTimeout(1500)
    },
  },
  {
    name: '03-risk', view: 3,
    act: async (p) => {
      await p.getByRole('button', { name: '3 Risk' }).click()
      await p.waitForTimeout(4200)
    },
  },
  {
    name: '03-risk-failed', view: 3,
    act: async (p) => {
      await p.getByRole('button', { name: '3 Risk' }).click()
      await p.waitForTimeout(4000)
      await p.getByRole('button', { name: 'Fail it', exact: true }).click()
      await p.waitForTimeout(1600)
    },
  },
  {
    name: '04-footprint', view: 4,
    act: async (p) => {
      await p.getByRole('button', { name: '4 Footprint' }).click()
      await p.waitForTimeout(4000)
    },
  },
  {
    name: '04-footprint-early', view: 4,
    act: async (p) => {
      await p.getByRole('button', { name: '4 Footprint' }).click()
      await p.waitForTimeout(3800)
      await p.getByLabel('Time scrubber, month 0 to 60').fill('31')
      await p.waitForTimeout(1000)
    },
  },
  {
    name: '02-fixed-pool-collapsed', view: 2,
    act: async (p) => {
      await p.getByRole('button', { name: '2 Fixed pool' }).click()
      await p.waitForTimeout(3000)
      await p.getByRole('button', { name: /^Collapse / }).click()
      await p.waitForTimeout(700)
    },
  },
  {
    name: '02-fixed-pool-prohibited', view: 2,
    act: async (p) => {
      await p.getByRole('button', { name: '2 Fixed pool' }).click()
      await p.waitForTimeout(3000)
      await p.getByLabel('Allocation basis for the fixed pool').selectOption('by_head')
      await p.waitForTimeout(800)
    },
  },
]

async function capture(browser: Browser, shot: Shot, size: { width: number; height: number }, suffix: string, dark: boolean) {
  const ctx = await browser.newContext({
    viewport: size,
    deviceScaleFactor: 2,
    isMobile: suffix === 'mobile',
    hasTouch: suffix === 'mobile',
    colorScheme: dark ? 'dark' : 'light',
  })
  const page = await ctx.newPage()
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  await page.goto('http://localhost:5178/', { waitUntil: 'load' })
  await page.waitForSelector('canvas', { timeout: 30_000 })
  // Let the force layout settle so the shot is not of a tangle.
  await page.waitForTimeout(3500)
  if (shot.act) await shot.act(page)
  await page.waitForTimeout(600)

  const file = `screenshots/${shot.name}-${suffix}-${dark ? 'dark' : 'light'}.png`
  await page.screenshot({ path: file })
  console.log(`  ${file}${errors.length ? '   PAGE ERRORS: ' + errors.slice(0, 3).join(' | ') : ''}`)
  await ctx.close()
  return errors
}

const server = await createServer({ server: { port: 5178 }, logLevel: 'error' })
await server.listen()
mkdirSync('screenshots', { recursive: true })
const browser = await launch()

const all: string[] = []
for (const shot of SHOTS) {
  if (only && !shot.name.includes(only)) continue
  all.push(...await capture(browser, shot, DESKTOP, 'desktop', false))
  all.push(...await capture(browser, shot, MOBILE, 'mobile', false))
}
// One dark-theme pair, to prove the theme actually follows the system.
if (!only) {
  all.push(...await capture(browser, SHOTS[0]!, DESKTOP, 'desktop', true))
  all.push(...await capture(browser, SHOTS[0]!, MOBILE, 'mobile', true))
}

await browser.close()
await server.close()
if (all.length) { console.error('\nPAGE ERRORS:\n' + [...new Set(all)].join('\n')); process.exitCode = 1 }
else console.log('\nno page errors')
