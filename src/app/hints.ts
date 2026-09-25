// The hint system. A cue has two parts: a pulsing border or ring on the
// thing that can be tapped, shown every visit until it is used, and a line
// of hint text, shown only the first time a reader meets that cue. What has
// been seen is kept in the browser; if storage is blocked, the text simply
// shows again.

const KEY = 'ledger.hints'

function read(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]) } catch { return new Set() }
}

// The answer is fixed for the page's lifetime, so a component rendered
// twice, or a beat visited twice in one sitting, gets the same answer.
const asked = new Map<string, boolean>()

/** True if this browser had not met this cue before this page load; marks it met. */
export function firstTime(id: string): boolean {
  const cached = asked.get(id)
  if (cached !== undefined) return cached
  const seen = read()
  asked.set(id, !seen.has(id))
  if (seen.has(id)) return false
  seen.add(id)
  try { localStorage.setItem(KEY, JSON.stringify([...seen])) } catch { /* blocked: shown again next visit */ }
  return true
}
