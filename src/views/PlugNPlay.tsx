// Tab 7. The standalone app this demo points towards, not built yet.
// A clean page: what it will be, in two plain sentences, and nothing else.

import { copy } from '../copy'

export function PlugNPlay() {
  return (
    <div className="plug-page">
      <div className="plug-inner">
        <svg className="plug-art" viewBox="0 0 220 64" aria-hidden="true">
          <path className="plug-wire" d="M4 32 H66" />
          <g className="plug-head">
            <rect x="66" y="18" width="34" height="28" rx="6" />
            <path d="M100 25 H114 M100 39 H114" />
          </g>
          <g className="plug-socket">
            <rect x="124" y="14" width="30" height="36" rx="7" />
            <path d="M131 25 H139 M131 39 H139" />
          </g>
          <path className="plug-wire plug-out" d="M154 32 H176" />
          <circle className="plug-node n1" cx="190" cy="20" r="6" />
          <circle className="plug-node n2" cx="204" cy="40" r="5" />
          <circle className="plug-node n3" cx="184" cy="46" r="4" />
          <path className="plug-wire plug-out" d="M176 32 L190 20 M176 32 L204 40 M176 32 L184 46" />
        </svg>
        <div className="plug-eyebrow">{copy.plug_eyebrow}</div>
        <h1 className="plug-title">{copy.plug_title}</h1>
        <p className="plug-line">{copy.plug_line}</p>
        <p className="plug-line">{copy.plug_line2}</p>
        <p className="plug-note">{copy.plug_note}</p>
      </div>
    </div>
  )
}
