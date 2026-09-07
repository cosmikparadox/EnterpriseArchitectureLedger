// Shared browser launcher.
//
// The image ships Chromium build 1194 at PLAYWRIGHT_BROWSERS_PATH, but the
// pinned @playwright/test 1.49.1 expects build 1148. Per the environment's
// guidance we do NOT run `playwright install`; we point executablePath at the
// browser that is already here.
import { existsSync } from 'node:fs'
import { chromium, type Browser } from '@playwright/test'

const CANDIDATES = [
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
]

export function chromiumPath(): string {
  const found = CANDIDATES.find((p) => existsSync(p))
  if (!found) throw new Error(`no preinstalled Chromium found in:\n  ${CANDIDATES.join('\n  ')}`)
  return found
}

export function launch(): Promise<Browser> {
  return chromium.launch({ executablePath: chromiumPath(), args: ['--no-sandbox'] })
}
