// The copy deck. Spec section 8: every on-screen sentence longer than a label
// lives here. Components hold no prose.
//
// Typography, spec hard rule F: no em-dashes and no en-dashes in any UI string.
// Spec hard rule G: the tool cites nothing. Where a source is needed, the text
// reads "see the Ledger paper" and stops.

export const copy = {
  // Spec hard rule E. Every screen carries this.
  footer: 'Illustrative data. Synthetic estate. Not a measurement.',

  // ---- the front page, tour brief B1. Title and sentence are the owner's,
  // reproduced unchanged.
  landing_title: 'The Architecture Ledger',
  landing_sentence:
    'An interactive model of one invented insurer, built to show what ' +
    'architecture decisions cost when you price them in money instead of ' +
    'colours.',
  landing_start: 'Start the tour',
  landing_explore: 'Just explore',

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

  // -------------------------------------------------------------------------
  // The guided tour. Brief B3 and B4.
  //
  // Three sentences a step, in a fixed order and never labelled: what to do,
  // what you are looking at, what it costs. Every cost sentence carries a GBP
  // figure filled in from the running tool through fill(), never a number typed
  // in here. Each sentence is under twenty words.
  //
  // The do and see sentences use no jargon. "Fan-in", "copula", "P99" and
  // "comonotonic" appear only in the optional more line, which is closed until
  // somebody asks for it.
  //
  // Step 7 is not three sentences. It is the closing card, and the brief sets
  // its shape: four blocks and two buttons.
  // -------------------------------------------------------------------------

  // Card chrome.
  tour_counter: '{n} of {total}',
  tour_back: 'Back',
  tour_next: 'Next',
  tour_skip: 'Skip tour',
  tour_more: 'More detail',
  tour_did_it: 'You did that.',

  tour_1_do:
    'Drag to turn the graph, then click one of the small nodes joined to the ' +
    'lit one.',
  tour_1_see:
    'Everything joined to the lit node needs that node working before it can ' +
    'do anything.',
  tour_1_cost:
    'The work plugged into this one node is billed GBP {spend} a month.',
  tour_1_more:
    'Fan-in is how many use cases ride one node. This one carries {riders}.',

  tour_2_do:
    'Watch three use cases arrive on this node, then move the slider yourself.',
  tour_2_see:
    'The use case you were reading did nothing different, and its number ' +
    'moved anyway.',
  tour_2_cost:
    'Its monthly figure went from GBP {before} to GBP {after} with its own ' +
    'usage flat.',
  tour_2_more:
    'The part that moved is the rule share, allocated on a declared basis. ' +
    'See 9.2.8.',

  tour_3_do:
    'Press Fail it on a different node and watch which use cases go dark.',
  tour_3_see:
    'One node stopping takes work out across several teams at the same time.',
  tour_3_cost:
    'Priced one use case at a time {sub} comes to GBP {sum}, together GBP ' +
    '{joint}.',
  tour_3_more:
    'The first figure sums the per use case P99s. The second is the P99 of ' +
    'the joint loss. See 9.8.3.',

  tour_4_do:
    'Move the dependence slider yourself, from one end to the other and back.',
  tour_4_see:
    'How often platforms fail together changes the answer, and nothing here ' +
    'measures that.',
  tour_4_cost:
    'Across the full range the {sub} figure ran from GBP {lo} to GBP {hi}.',
  tour_4_more:
    'The slider is rho under a Student t copula at four degrees of freedom. ' +
    'Nothing here measures it.',

  tour_5_do:
    'Drag the month handle back and forth across the marked month.',
  tour_5_see:
    'By the time this node reached the board, the estate was already built ' +
    'on it.',
  tour_5_cost:
    'At that month the execution work of leaving had already reached about ' +
    'GBP {exec}.',
  tour_5_more:
    'Riders attach in adoption order. The marker is the month the board ' +
    'ratified the node.',

  tour_6_do:
    'Compare the two estates, and look at the largest single node on each side.',
  tour_6_see:
    'Splitting the estate into specialists did not remove the shared node, it ' +
    'moved it.',
  tour_6_cost:
    'The same subdomain sits at GBP {left} on one side and GBP {right} on the ' +
    'other.',
  tour_6_more:
    'Both figures are the joint P99 loss for {sub} at the dependence ' +
    'currently set.',

  // Closing card.
  tour_7_h_what: 'What this is',
  tour_7_what:
    'A synthetic estate and a way of measuring it. It is not a product and ' +
    'not a measurement.',
  tour_7_h_not: 'What it does not do',
  tour_7_not:
    'It will not add your estate up to one number. It cannot say where a ' +
    'boundary belongs, or what leaving would really cost.',
  tour_7_h_read: 'Read the argument',
  tour_7_read: 'Part 1 of the written argument. Archived at DOI {doi}.',
  tour_7_built:
    'Built with heavy AI assistance, under a written specification and an ' +
    'acceptance suite. Every deviation from the source document is listed in ' +
    'the README.',
  tour_7_explore: 'Explore on your own',
  tour_7_restart: 'Start again',

  // Placeholder. The owner supplies the real address before the site is served.
  tour_medium_url: 'https://example.invalid/the-architecture-ledger-part-1',
  tour_doi: '10.5281/zenodo.21863761',
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
