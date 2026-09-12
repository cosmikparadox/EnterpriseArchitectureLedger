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

  rail_tour: 'Tour',

  // View 4, cursor dragged to a month before the node was adopted. The panel
  // keeps its shape; only the figures have nothing to say yet.
  footprint_bill_visible:
    'The bill was visible throughout. The execution component was not shown ' +
    'to anyone.',
  footprint_not_yet:
    'Not adopted yet at this month. Nothing rides on it and there is nothing ' +
    'to leave.',

  rank_tip:
    'Order the nodes by how much of their bill is handed out by rule rather ' +
    'than measured.',

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
    'Drag to turn the graph, then tap one of the small nodes joined to the ' +
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
    'Priced one use case at a time, {sub} comes to GBP {sum}. Priced ' +
    'together, GBP {joint}.',
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
    'The slider is rho under a Student t copula, four degrees of freedom. It ' +
    'is a declared input, not a measurement.',

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
    'Compare the two estates. On each side, find the node that would take the ' +
    'most work down with it.',
  tour_6_see:
    'Splitting the estate into specialists did not remove the shared node, it ' +
    'moved it.',
  tour_6_cost:
    'The same subdomain sits at GBP {left} on one side and GBP {right} on the ' +
    'other.',
  tour_6_more:
    'Both figures are the joint P99 loss for {sub} at the dependence ' +
    'currently set.',

  // The intro, tour step 0. The estate assembles behind the title card in
  // beats, one sentence a beat, every number live. Under twenty words each.
  intro_1:
    '{org} is invented. {n_sub} parts of a business, and {n_uc} things it ' +
    'has to do every month.',
  intro_2:
    '{n_platforms} platforms it bought or built to do them.',
  intro_3:
    'Each of the {n_uc} plugs into several of the {n_platforms}. That is ' +
    'the estate.',
  intro_4:
    'They reach each other through {n_int} more nodes whose only job is ' +
    'connecting.',
  intro_5:
    'Pull it tight and one node carries {top_riders} of the {n_uc}. ' +
    'Everything after this is about that.',
  intro_continue: 'Continue',
  intro_skip: 'Skip the intro',

  // Spotlight labels. One short phrase beside each highlighted element, so
  // the dimmed screen says what the bright part is.
  tour_1_spot_node: 'the lit node',
  tour_2_spot_slider: 'the slider',
  tour_2_spot_list: 'what each rider is told',
  tour_3_spot_fail: 'Fail it',
  tour_3_spot_pair: 'one at a time, or together',
  tour_4_spot_rho: 'how much they fail together',
  tour_4_spot_gap: 'the gap',
  tour_5_spot_month: 'the month handle',
  tour_5_spot_board: 'when the board saw it',
  tour_6_spot_left: 'one shared point',
  tour_6_spot_right: 'four of them',
  tour_6_spot_table: 'a bad year, each side',

  // Closing card.
  tour_7_h_what: 'What this is',
  tour_7_what:
    'An invented insurer and a way of pricing its architecture. Nothing here ' +
    'is a real measurement.',
  tour_7_h_not: 'What it does not do',
  tour_7_not:
    'It will not add your estate up to one number. It cannot say where a ' +
    'boundary belongs, or what leaving would really cost.',
  tour_7_h_read: 'Read the argument',
  // Two lines. The DOI line always shows; the Medium line is gated on the URL
  // being real, so the placeholder is never rendered as a link.
  tour_7_read: 'Archived at DOI {doi}.',
  tour_7_read_link: 'Part 1 of the written argument.',
  tour_7_built:
    'Built with heavy AI assistance, under a written specification and an ' +
    'acceptance suite. Every deviation from the source document is listed in ' +
    'the README.',
  tour_7_explore: 'Explore on your own',
  tour_7_restart: 'Start again',

  // Placeholder. The owner supplies the real address before the site is
  // served, and until then the Medium line is not rendered at all: a link to
  // example.invalid is worse than no link.
  tour_medium_url: 'https://example.invalid/the-architecture-ledger-part-1',
  tour_medium_placeholder_host: 'example.invalid',
  tour_doi: '10.5281/zenodo.21863761',
} as const

/**
 * Plain definitions for the words on screen.
 *
 * Every one of these is a term of art that the tool used without ever saying
 * what it meant. Somebody landing on view 2 cold was reading "fixed pool",
 * "rule share" and "C1 annotation" with nothing to go on.
 *
 * Rules for writing one: no jargon inside the definition, no sentence over
 * twenty words, two sentences at most, and say what it means for the reader
 * rather than how it is computed. These are hover hints, not documentation.
 * The narrated tour is where the argument gets made.
 */
export const glossary = {
  fixed_pool: {
    label: 'Fixed pool',
    tip: 'What this node costs whether anyone uses it or not. Licences, support, the team that runs it.',
  },
  metered_spend: {
    label: 'Metered spend',
    tip: 'The part of the bill that follows actual use. It moves when volume moves.',
  },
  rule_share: {
    label: 'Rule share',
    tip: 'The part of the bill handed out by a rule rather than measured. It moves when other people arrive or leave.',
  },
  reported_cost: {
    label: 'Reported cost',
    tip: 'What a use case is told it costs here. Metered spend plus its share of the fixed pool.',
  },
  c1: {
    label: 'C1',
    tip: 'How much of a bill came from a rule rather than a meter. Higher means less of it was measured.',
  },
  fan_in: {
    label: 'Fan-in',
    tip: 'How many use cases depend on one node. High fan-in means one outage reaches a lot of work.',
  },
  blast_radius: {
    label: 'Blast radius',
    tip: 'The work that stops if this node stops, counted in monthly volume.',
  },
  allocation_basis: {
    label: 'Allocation basis',
    tip: 'The rule that hands out the fixed pool. Change it and everyone\u2019s number moves, though nobody used more.',
  },
  joint_p99: {
    label: 'Joint P99 loss',
    tip: 'A bad year for the whole group taken together. Worse than this in about one year in a hundred.',
  },
  sum_of_p99: {
    label: 'Sum of P99s',
    tip: 'Each use case\u2019s bad year added up. It counts the same outage once per use case, so it overstates.',
  },
  execution_component: {
    label: 'Execution component',
    tip: 'The part of leaving you can price: migration, rewiring, running both for a while.',
  },
  integration_node: {
    label: 'Integration node',
    tip: 'A node whose job is connecting other nodes. Gateways, buses, identity. Drawn as a diamond.',
  },
  subdomain: {
    label: 'Subdomain',
    tip: 'A group of use cases belonging to one part of the business.',
  },
  conditional_failure: {
    label: 'Conditional failure probability',
    tip: 'If this node is down, how likely this use case is down with it.',
  },
  volume: {
    label: 'Volume',
    tip: 'How much work a use case does in a month. Policies, claims, payments, whatever it handles.',
  },
} as const

export type GlossaryKey = keyof typeof glossary

/** One line on what each screen is for, shown on hover over the screen name. */
export const viewPurpose: Record<number, string> = {
  1: 'Turn the estate around. Click any node to see what it costs and what rides on it.',
  2: 'Part of every bill is handed out by a rule. Move the slider and watch a number change that nobody chose.',
  3: 'Break a node and see what stops. Then see why adding the damage up overstates it.',
  4: 'Watch things pile onto one node month by month, and what leaving would have taken by the time anyone decided.',
  5: 'The same thirty use cases wired two ways. Concentration does not go away when you diversify. It moves.',
  6: 'Move a use case into another group and watch the reported numbers move with it.',
}

/**
 * The summary at the head of every panel.
 *
 * Every screen exists to show one thing, and the panel used to open straight
 * into the figures without ever saying what that thing was. These three lines
 * say it: a headline with the live figure in it, then the same point read two
 * ways. "The number" is the reading for somebody who thinks in money and wants
 * to know what it costs and what it exposes. "The mechanism" is the reading for
 * somebody who thinks in structure and wants to know why. Neither is labelled
 * by who it is for; the lens is named, the reader is not.
 *
 * Rules: every figure is live through fill(), never typed here. No sentence
 * over twenty words. No estate wide total anywhere. The option component is
 * named only in the same sentence as the refusal to state it.
 */
export const summary = {
  eyebrow_number: 'The number',
  eyebrow_mechanism: 'The mechanism',

  // View 1, nothing selected.
  s1_head:
    '{n_platforms} shared platforms carry {n_uc} pieces of this business. The ' +
    'busiest, {top}, carries {top_riders} of them.',
  s1_number:
    'Every use case is billed part meter, part rule. Across these nodes the ' +
    'rule part runs from {c1_lo} to {c1_hi} percent.',
  s1_mechanism:
    'Each line into a node is a dependency. The more lines, the more work ' +
    'stops when the node does.',

  // View 1, a platform selected.
  s1n_head:
    '{name} meters GBP {metered} a month and hands out another GBP {pool} ' +
    'by rule.',
  s1n_number:
    '{riders} use cases split that pool. {c1} percent of what they are told ' +
    'it costs was decided by a rule, not read off a meter.',
  s1n_mechanism:
    'If this node stops, {blast_uc} use cases across {blast_sub} subdomains ' +
    'stop with it.',

  // View 1, a use case selected.
  s1u_head:
    '{name} rides {n_edges} shared nodes and is told it costs GBP {reported} ' +
    'a month.',
  s1u_number:
    'GBP {metered} of that is metered. The rest is its share of pools it ' +
    'does not control.',
  s1u_mechanism:
    'Its number moves when neighbours arrive or leave, without it doing ' +
    'anything different.',

  // View 2.
  s2_head:
    'GBP {pool} a month on {name} is shared out by a rule, not a meter.',
  s2_number_idle:
    '{first} is told GBP {base}. Add riders and that figure moves, though ' +
    'it uses nothing more.',
  s2_number_moved:
    'With {added} added, {first} is told GBP {now} instead of GBP {base}. ' +
    'It used nothing more.',
  s2_mechanism:
    'A rule share changes only when the rule or the crowd changes. Leaving ' +
    'this node does not release it.',

  // View 3.
  s3_head_idle:
    '{name} carries {riders} use cases, each with its own odds of going down ' +
    'when it does.',
  s3_head_failed:
    'Fail {name} and {affected} use cases stop, stalling {volume} units of ' +
    'monthly work.',
  s3_number:
    'A bad year for {sub} looks like GBP {sum} priced one use case at a time. ' +
    'Taken together it is GBP {joint}.',
  s3_mechanism:
    'The first figure counts the same outage once per use case. Shared ' +
    'platforms fail together, so adding them up overstates.',

  // View 4.
  s4_head:
    'By month {ratified}, when {name} was ratified, {n} use cases already ' +
    'depended on it.',
  s4_number:
    'Leaving would already have taken about GBP {exec} of execution work, ' +
    'plus an option component the ledger declines to state without an ' +
    'evidenced counterfactual.',
  s4_head_before:
    'At month {ratified} {name} had not arrived yet. It was adopted in month ' +
    '{adopted}.',
  s4_number_before:
    'Nothing had been committed to it, so there was nothing to leave.',
  s4_mechanism:
    'Dependence arrived one adoption at a time. No single decision created ' +
    'it, so no single decision undoes it.',

  // View 5.
  s5_head:
    'Same {n_uc} use cases, wired two ways. The busiest node carries ' +
    '{left_top} on one side and {right_top} on the other.',
  s5_number:
    'A bad year for {sub} runs GBP {left} on one side and GBP {right} on the ' +
    'other, at the dependence currently set.',
  s5_mechanism:
    'Splitting the estate moved the shared point to the connectors. The ' +
    'concentration relocated. It did not leave.',

  // View 6.
  s6_head_none:
    'Nothing has moved yet. The lines on this screen decide who shares ' +
    'which pool.',
  s6_head_moved:
    '{moved} use cases moved. Metered spend did not change.',
  s6_number_stable:
    'Under {basis}, no reported figure moved, because that basis does not ' +
    'read the lines.',
  s6_number_moved:
    'Under {basis}, {changed} reported figures moved by up to GBP {max} a ' +
    'month, with no change in usage.',
  s6_mechanism:
    'A boundary decides who shares which pool. Redrawing it moves money on ' +
    'paper before anything moves in the estate.',
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
