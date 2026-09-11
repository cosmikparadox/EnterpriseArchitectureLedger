// The copy deck. Spec section 8: every on-screen sentence longer than a label
// lives here. Components hold no prose.
//
// Typography, spec hard rule F: no em-dashes and no en-dashes in any UI string.
// Spec hard rule G: the tool cites nothing. Where a source is needed, the text
// reads "see the Ledger paper" and stops.

export const copy = {
  // Spec hard rule E. Every screen carries this.
  footer: 'Illustrative data. Synthetic estate. Not a measurement.',

  intro:
    'A platform is a shared node. Use cases plug into it. Part of what each ' +
    'use case is told it costs is a rule, not a meter reading. Risk travels ' +
    'along the edges. Nobody is shown the exit cost until they need it.',

  // No claim about direction. Canon 9.2.6 is a statement about how defensible
  // the fixed share is, not about which way it moves, so the hint says only
  // that the number moves.
  view2_hint:
    'Drag the fan-in slider. This use case did nothing different. Its number ' +
    'moved anyway.',

  view3_nonadd:
    'These differ because the use cases share platforms. Adding them counts ' +
    'the same failure many times.',

  view4_ratify:
    'By the time this platform reached the board, {n_uc} use cases in {n_sub} ' +
    'subdomains already depended on it and the execution component of leaving ' +
    'had reached roughly GBP {exec}. The board ratified a footprint.',

  // Rewritten from the spec's version to say what the generated data shows.
  // The spec's draft asserted that no platform exceeds five riders in the best
  // of breed estate; the generator reports Lakehouse at 16 riders and five more
  // platforms above five, so that sentence is not used. What holds is the
  // ranking by volume at risk. Last two sentences are the spec's, unchanged.
  view5_land:
    'In the concentrated estate identity carries the largest blast radius and ' +
    'a business platform is a close second. In best of breed all four ' +
    'integration nodes reach every use case, and the three largest blast radii ' +
    'are all integration. The graph shows where it went. The org chart does not.',

  view6_top:
    'The graph is mined. The boundaries are drawn by people. Redraw them and ' +
    'watch which numbers move. The ones that move are the ones you should ' +
    'trust least.',

  option_tip:
    'When you first adopted this, you could still have picked something else ' +
    'cheaply. Every use case you attached made that harder. This number is the ' +
    'price of the choices you no longer have.',

  // Canon 9.5.7 and 9.9. The counterfactual is declared, not evidenced from a
  // dated decision record, because a synthetic estate has no decision record.
  // A real ledger would decline to state this number. It never renders outside
  // the element carrying this text.
  option_refusal:
    'The counterfactual behind this figure is declared, not evidenced. A real ' +
    'ledger would refuse to state it. It is shown here to make the shape of ' +
    'the quantity visible, and for no other purpose.',

  // Canon 9.5.2. The decomposition replaces a broad switching-cost estimate.
  // It is never added to one.
  switching_split:
    'Switching cost splits into two parts that move for different reasons. ' +
    'This is one number divided in two, not two numbers added together.',

  // Canon 9.2.8 (R23). Shown on screen in view 6, not only in the README.
  basis_prohibited: 'Prohibited by 9.2.8, shown as a counter-example.',
  basis_permitted: 'Permitted basis. Partition-independent.',
  basis_outside_list:
    'Partition-independent, but not one of the two bases 9.2.8 permits.',

  // Canon 9.3.8 forbids the Gaussian copula the spec asked for.
  copula_note:
    'Dependence is drawn from a Student-t copula with four degrees of freedom. ' +
    'A Gaussian copula has no tail dependence, so it assumes platforms stop ' +
    'failing together exactly where it matters most.',

  // Canon 9.8.3 and spec hard rule D. There is no estate figure.
  no_total:
    'There is no estate figure here. The three axes do not add, and the ' +
    'entries do not add across use cases. See the Ledger paper.',

  // Canon 9.8.3 result three. Option components across commitments overstate,
  // so the sum is reported as an upper bound and never as a position.
  option_upper_bound:
    'Adding option components across commitments overstates the joint ' +
    'position. This is an upper bound, not a total.',

  integration_note:
    'This node exists because the estate is diversified. Its fan-in is the ' +
    'concentration that diversification created.',

  // Canon 9.2.6. Shown where a fixed share could be mistaken for a decision input.
  fixed_share_warning:
    'This share is allocated by a declared rule. It must not inform a decision ' +
    'to leave this node, because leaving does not release it.',

  // The low endpoint says "without correlation" rather than "on their own",
  // because under a Student-t copula rho = 0 is uncorrelated but not
  // independent. Claiming independence here would be false.
  dependence_low: 'platforms fail without correlation',
  dependence_high: 'platforms fail together',
  dependence_low_tip:
    'Under the t copula the extremes still move together even at zero ' +
    'correlation. That is deliberate. See 9.3.8.',

  // View 5 now shares the dependence slider with view 3, so the comparison can
  // be read at any rho. 0.5 is the midpoint the two shapes were first compared
  // at and the one the README tables are dated to, which is the only claim the
  // button makes for it.
  rho_reset_tip:
    'Back to the midpoint. The comparison in the notes is written at this ' +
    'value, and nothing else makes it special.',

  // Shown when the inline worker never starts. Opened as a file:// URL the
  // browser blocks it and logs nothing, so the screen has to say so itself.
  mc_offline:
    'This browser blocked the background run, which is what happens when the ' +
    'page is opened straight off disk. The figures below are a stored run of ' +
    '{runs} at rho {rho}, the nearest stored point. Serve the folder over ' +
    'http to move the slider freely.',
} as const

export type CopyKey = keyof typeof copy

/**
 * Fill {name} placeholders in a copy string. Keeping the sentence whole in the
 * deck, rather than splicing prose around a number in a component, is what
 * spec section 8 asks for.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m))
}
