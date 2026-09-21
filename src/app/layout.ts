// Where the story card sits, decided once for the shell and the canvas.
//
// A phone in portrait, and a tablet in portrait, carry the card as a sheet
// along the bottom. A short landscape screen (a phone on its side) has no
// room for a sheet under two graphs, so the card docks right and narrow
// there too. Everything else docks right.

export const SHEET_QUERY = '(max-width: 720px), ((max-width: 1024px) and (orientation: portrait))'
export const SHORT_QUERY = '(max-height: 520px)'

export function isSheet(): boolean {
  return typeof matchMedia === 'function' && matchMedia(SHEET_QUERY).matches
}
export function isShort(): boolean {
  return typeof matchMedia === 'function' && matchMedia(SHORT_QUERY).matches
}
