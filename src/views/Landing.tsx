// The front page at #/. Spec of its own, from the tour brief B1.
//
// Four things in order and nothing else: title, one sentence, two buttons, the
// footer that every screen carries under spec hard rule E. No hero figure, no
// gradient, no feature grid, no logo. It has to fit one phone screen without
// scrolling, which is the constraint that keeps everything else off it.

import { copy } from '../copy'
import { useLedger } from '../app/store'

export function Landing() {
  const setView = useLedger((s) => s.setView)
  const setTourStep = useLedger((s) => s.setTourStep)

  return (
    <div className="landing">
      <div className="landing-body">
        <h1>{copy.landing_title}</h1>
        <p>{copy.landing_sentence}</p>
        <div className="landing-actions">
          <button className="cta" onClick={() => setTourStep(0)}>
            {copy.landing_start}
          </button>
          <button className="cta secondary" onClick={() => setView(1)}>
            {copy.landing_explore}
          </button>
        </div>
      </div>
    </div>
  )
}
