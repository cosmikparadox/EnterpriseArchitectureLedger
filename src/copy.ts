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
    'These differ because each use case has its worst month at a different ' +
    'time. Adding them assumes every worst month lands at once.',

  // Rewritten from the spec's version to say what the generated data shows.
  // The spec's draft asserted that no platform exceeds five riders in the best
  // of breed estate; the generator reports Lakehouse at 16 riders and five more
  // platforms above five, so that sentence is not used. What holds is the
  // ranking by volume at risk. Last two sentences are the spec's, unchanged.
  view5_land:
    'In the concentrated estate identity carries the largest blast radius and ' +
    'a business platform is a close second. In best of breed all four ' +
    'integration nodes reach every use case. The three largest blast radii ' +
    'are all integration. The graph shows the shared point. The org chart does not.',

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
  basis_prohibited: 'Prohibited by the Ledger paper, 9.2.8, shown as a counter-example.',
  basis_permitted: 'Permitted basis. Partition-independent.',
  basis_outside_list:
    'Partition-independent, but not one of the two bases the Ledger paper, ' +
    '9.2.8, permits.',

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
    'correlation. That is deliberate. See the Ledger paper, 9.3.8.',

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

  // ---- The story. One beat per Next. ----
  //
  // Written to be read aloud, one idea at a time. A beat has a line and, where
  // it helps, a second sentence. Anything longer goes under More detail. Every
  // figure is live through fill().
  story_welcome: 'Welcome.',
  story_welcome_sub: 'A short walk through one company\'s architecture, and what it costs.',
  story_welcome_tap: 'Tap anywhere to begin',
  story_welcome_skip: 'Skip to the tool',
  story_continue: 'Tap anywhere, or press the right arrow, to continue',
  story_part1_title: 'Part one',
  story_part1_sub: 'The architecture',
  story_part2_title: 'Part two',
  story_part2_sub: 'How it is decided today',
  story_part3_title: 'Part three',
  story_part3_sub: 'The ledger',
  story_end1: 'That is the architecture.',
  story_end1_sub: 'Now, how decisions about it get made.',
  story_end2: 'That is how it is decided today.',
  story_end2_sub: 'Now, the ledger.',
  part_label_1: 'Part one: the architecture',
  part_label_2: 'Part two: how it is decided today',
  part_label_3: 'Part three: the ledger',

  // The opening, after the welcome: what it is, why it matters, and how it
  // works in three steps. Each is one line and one picture.
  tagline: 'What the architecture costs, one decision at a time.',
  b_title_h: 'The Architecture Ledger',
  b_title:
    'An architecture ledger: three numbers for each thing the business does.',
  b_title_see: 'What it costs. What it risks. What leaving would cost.',
  // The owner's sentence, reproduced unchanged by instruction, and exempt
  // from the twenty-word rule. It sits under More detail on the title beat.
  b_title_more:
    'An interactive model of one invented insurer, built to show what ' +
    'architecture decisions cost when you price them in money instead of ' +
    'colours. Everything here is synthetic and says so.',
  what_cost: 'What it costs',
  what_risk: 'What it risks',
  what_exit: 'What leaving would cost',

  b_opener_why_h: 'Why it matters',
  b_opener_why:
    'Today those three live in three places that never meet: a spreadsheet, ' +
    'a risk register, and nowhere. So the decision is made on a colour.',
  b_opener_why_see:
    'Nothing is broken. But a colour cannot say who pays for a shared ' +
    'system, what stops when it does, or what leaving costs.',
  b_opener_why_more:
    'Part two shows each of the three places and where each one stops. Part ' +
    'three prices all three on one shared system.',
  why_cost: 'A spreadsheet',
  why_cost_sub: 'What it costs, by cost centre',
  why_cost_so: 'The bill is split by a rule, not by use.',
  why_risk: 'A risk register',
  why_risk_sub: 'What it risks: high, medium or low',
  why_risk_so: 'One outage reaches work nobody priced.',
  why_exit: 'Nowhere',
  why_exit_sub: 'What leaving would cost',
  why_exit_so: 'The business depends on it before anyone decides.',
  why_colour: 'So the decision is made on a colour.',

  b_how_map_h: 'How: a map, not a drawing',
  b_how_map:
    'An architecture diagram is reviewed and agreed. But it shows a slice, ' +
    'drawn for one purpose, as of one date.',
  b_how_map_see:
    'The systems\' own traces say which calls which, every day. That is a ' +
    'map, and it stays current.',
  b_how_map_more:
    'Operations teams already collect these traces to find outages. The same ' +
    'traces give the map, with no vendor in between. The map has gaps too: ' +
    'work done by hand, or on systems nobody traces, does not appear. The ' +
    'diagram says what was intended. The map says what runs. See the Ledger ' +
    'paper, 9.1.1.',
  map_drawing: 'A drawing',
  map_drawing_sub: 'Agreed, but a slice, as of one date',
  map_mined: 'A map',
  map_mined_sub: 'Read from the traces, every day',

  b_how_work_h: 'How: from systems to work',
  b_how_work:
    'Nobody buys a system for its own sake. Each thing the business does ' +
    'lights up part of the map.',
  b_how_work_see: 'The lit path here is {opener_uc}. That lit part is what the ledger reads.',
  b_how_work_def: 'Use case: one thing the business does, such as settling a claim.',
  b_how_work_def2: 'Unit of work: one run of a use case, one claim settled.',
  b_how_work_more:
    'This is why the ledger reads use cases, not systems. A system on its ' +
    'own has no owner and no margin. A use case has both. See the Ledger ' +
    'paper, 9.1.2.',

  b_how_graph_h: 'How: why a graph',
  b_how_graph:
    'Cost pools where systems are shared. Risk travels along the lines. ' +
    'Leaving strands whatever depends on a system.',
  b_how_graph_see:
    'All three live in the shape of the map. So read them there, one use ' +
    'case at a time, and never add them up.',
  b_how_graph_more:
    'The numbers mark where each entry lives on the path of {opener_uc}. ' +
    'Next opens part one, which builds this map in three dimensions, one ' +
    'layer at a time.',
  flat_entry_1: 'What it costs',
  flat_entry_2: 'What it risks',
  flat_entry_3: 'What leaving would cost',

  // Part one.
  b_domains_h: 'Domains',
  b_domains:
    '{org} has {n_sub} parts to its business. Each coloured shape is one of ' +
    'them, a domain.',
  b_domains_def: 'Domain: the smallest part of the business that can own its own numbers.',
  b_domains_see: 'Tap a domain to name it. Each one you name joins the list below.',
  b_domains_more:
    'A domain is a part of the business and the work it owns: {sub_list}. ' +
    'The shapes are drawn around that work; nothing else is inside them yet. ' +
    'The rule: a domain is the smallest part of the business that can own a ' +
    'use case\'s numbers. It has one owner. Every use case sits in exactly ' +
    'one. It has its own margin and headcount. No platform defines it.',
  b_usecases_h: 'Use cases',
  b_usecases:
    'Between them the domains do {n_uc} things every month, from selling a ' +
    'policy to paying a claim. Each dot is one of those things, a use case.',
  b_usecases_see: 'Tap a dot to see what it does and what it depends on.',
  b_usecases_more:
    'A use case is one thing the business does, such as paying a claim. A ' +
    'unit of work is one instance of it, one claim paid. The dots take the ' +
    'colour of the domain that owns them.',
  b_platforms_h: 'Platforms',
  b_platforms:
    'None of that work happens by hand. It runs on {n_platforms} systems ' +
    'the company bought or built. Each grey circle is one: a platform.',
  b_platforms_def: 'Platform: a system the business bought or built, that use cases run on.',
  b_platforms_see:
    'The bigger the circle, the more use cases depend on it. Notice that ' +
    'almost every platform is shared across domains.',
  b_platforms_more:
    'The platforms are shared. That is the first thing this whole story turns ' +
    'on, and the picture says it before any number does. Tap a circle to see ' +
    'what rides on it.',
  b_lines_h: 'Lines',
  b_lines:
    'Each line joins a use case to a platform it cannot run without. ' +
    '{example_uc} alone needs {example_n}.',
  b_lines_see:
    'A line is a dependency, and a dependency is also a bill. Work flows ' +
    'along it every month and money flows back.',
  b_lines_more:
    'The thicker the line, the more money moves along it. Tap a line to see ' +
    'what it carries and what goes down with it.',
  b_connectors_h: 'Connectors',
  b_connectors:
    'The platforms do not reach each other on their own. {n_int} more nodes ' +
    'exist only to carry logins, calls and messages between them.',
  b_connectors_def: 'Connector: a node that only carries logins, calls and messages between platforms.',
  b_connectors_see:
    'The teal diamonds are those connectors: {int_list}. Every use case ' +
    'passes through them.',
  b_flow_h: 'What flows through it',
  b_flow:
    'Every line carries work, and work carries value. Warm lines carry work ' +
    'that reaches a customer. Cooler lines carry work that reaches a ' +
    'reinsurer, a supplier or a regulator. Cool lines carry the work that ' +
    'keeps the company running. The width is how much.',
  b_flow_see:
    'Not a figure. Where each use case\'s value lands was declared by the ' +
    'finance function.',
  b_flow_more:
    'The flag on each use case is a declared fact about the business. It is ' +
    'recorded with an owner and a date, like the domain boundaries. The tool ' +
    'derives nothing from it but the picture: no revenue figure, no value ' +
    'score. Those do not add, and the ledger refuses them. What the picture ' +
    'does show is where customer-facing work concentrates.',
  b_busiest_h: 'The busiest node',
  b_busiest:
    'Look at what that leaves. {top} is touched by {top_riders} of the {n_uc} ' +
    'use cases. If it stops, most of the business can stop with it.',
  b_busiest_see: 'That is the lit node. Remember it; part three is about it.',

  // Part two: how it is decided today.
  b_docs_h: 'Where the architecture lives',
  b_docs:
    'Today the architecture lives in documents. Each is written by someone, ' +
    'dated, and ageing from the day it is saved.',
  b_docs_see:
    'Six kinds, kept in six places, none the same age. Open one: each is ' +
    'right about something, and silent on the three questions a decision ' +
    'needs.',
  b_docs_more:
    'The method calls the whole collection an architecture repository, and ' +
    'it is only as current as its most recent edit. The picture you just ' +
    'built is not in it; it would have to be drawn.',
  b_matrix_h: 'What decisions are made on',
  b_matrix:
    'When a decision is needed, all of that is often boiled down to one ' +
    'drawing. A matrix, one colour per judgment.',
  b_matrix_see:
    'Someone scores each system for fit and value, and the cell takes the ' +
    'colour. Nothing on it is a price.',
  b_matrix_more:
    'This is the common practice: capability heat maps, and the two-by-two ' +
    'of business value against technical fit. Each is scored one to five by ' +
    'a person. The colours here are derived from this estate\'s data, so the ' +
    'drawing is of Harbourline. But it is judgment by construction, and it ' +
    'is labelled illustrative.',
  b_silos_h: 'Three questions, three places',
  b_silos:
    'What it costs is in a finance spreadsheet, by cost centre. What it risks ' +
    'is in a register, high, medium or low. What leaving would cost is ' +
    'rarely written down at all.',
  // Frameworks are named here by the owner's instruction; products and
  // vendors still are not.
  b_silos_see:
    'FinOps meters cloud cost, but stops at the cloud bill. TBM allocates ' +
    'every IT cost, but by rule, not by use case. IFRS 17 prices insurance ' +
    'liabilities by contract group, not by the systems that serve them. None ' +
    'of the three has a key that reaches a single use case.',
  b_graph_today_h: 'The graph already exists',
  b_graph_today:
    'The system half of that picture is not imaginary. Operations tools ' +
    'discover which systems call which, every day, to find outages.',
  b_graph_today_see:
    'The use cases and the domains are not discovered. People declare them. ' +
    'The graph carries no money. In most estates nobody has joined the ' +
    'spreadsheet, the register and the exit figure to it per use case.',
  b_graph_today_more:
    'That is the gap the Ledger paper names. The graph is mined, the numbers ' +
    'are elsewhere, and the decision is often made on a colour. See the ' +
    'Ledger paper.',

  // The end of part two: what deciding this way costs, and who it lands on.
  // Each tile is a consequence the mathematics shows and part three prices.
  b_pain_h: 'Four blind spots',
  b_pain:
    'Deciding on a colour is not careless. But it leaves four blind spots, ' +
    'and each one lands on someone.',
  b_pain_see: 'Part three puts a figure on each, on one shared platform.',
  b_pain_more:
    'These follow from the mathematics, not from a survey of organisations. ' +
    'In the Ledger paper: the saving at 9.2.4, the risk at 9.8.3, leaving at ' +
    '9.5, the boundary at 9.2.8.',
  pain_1_h: 'A saving that never arrives',
  pain_1: 'Retire a use case and its share of a shared platform stays, spread over the rest.',
  pain_1_who: 'Lands on the CFO',
  pain_2_h: 'Risk that does not add up',
  pain_2: 'Add each team\'s worst month and the total comes out too high. A colour cannot say by how much.',
  pain_2_who: 'Lands on the risk owner',
  pain_3_h: 'Lock-in nobody chose',
  pain_3: 'By the time the board sees a platform as a decision, much of the business already depends on it.',
  pain_3_who: 'Lands on the board',
  pain_4_h: 'The bill follows the boundary',
  pain_4: 'Under some rules, redrawing who owns what moves the bill. The difference goes to whoever draws the line.',
  pain_4_who: 'Lands on the domain leads',

  // Part three: the ledger, on the busiest node.
  b_why_h: 'Why a ledger',
  b_why:
    'A ledger is a book where every entry carries a number, a date and the ' +
    'name of whoever wrote it. This one keeps three entries per use case.',
  b_why_see:
    'What it costs. What it risks. What leaving would cost. Kept apart, ' +
    'because they do not add.',
  b_mine_h: 'The blueprint fills the book',
  b_mine:
    'The graph supplies the start of all three entries for {top}. Who rides ' +
    'it, how much work they send it, what stops when it stops.',
  b_mine_see:
    'The rest is declared or estimated, and each entry says which. We fill ' +
    'all three on {top}, starting with the one that can be measured.',
  b_mine_more:
    'This is the whole idea in one picture. The graph on the left is mined ' +
    'from the systems. The book on the right has one page per use case. The ' +
    'ledger is the wiring between them, and every entry can be traced back ' +
    'along a wire to the graph.',
  b_meter_h: 'Entry one: cost. The meter',
  b_meter:
    'Start with what can be measured. {top} has a meter that ticks with use: ' +
    'every login is counted and billed.',
  b_meter_def: 'Metered: counted as it is used, and billed by the count.',
  b_meter_see:
    'Watch the reading beside the node: the meter is the only part of the ' +
    'bill anyone actually measures.',
  b_meter_more:
    'The meter\'s unit is called the driver, the thing that gets counted. ' +
    'Logins for an identity platform, policy transactions for a policy ' +
    'engine. Tap another grey circle to see its meter.',
  b_pool_h: 'The fixed pool',
  b_pool:
    'The rest of the bill is a fixed pool. Licences and the team who run it, ' +
    'paid whether anyone logs in or not.',
  b_pool_def: 'Fixed pool: the cost that stays the same however much the platform is used.',
  b_pool_see:
    'The block beside the node is the pool. Nobody meters a pool. It has to ' +
    'be shared out.',
  b_rule_h: 'The rule',
  b_rule:
    'The pool is shared among the {riders} use cases riding the platform by ' +
    'a rule somebody chose. The rings show it: solid is metered, hatched is ' +
    'rule.',
  b_rule_def: 'Rule share: the part of a pool a use case is given by a rule, not a meter.',
  b_rule_see:
    '{first} is told GBP {before} a month for this platform alone. Part of ' +
    'that is the rule.',
  b_rule_more:
    'The rule is an equal split, or a split in proportion to use. The riders ' +
    'are the use cases riding the platform; their share of the pool is their ' +
    'rule share.',
  b_crowd_h: 'The crowd changes',
  b_crowd:
    'Watch three more use cases arrive on this node, then add or remove ' +
    'some yourself.',
  b_crowd_see:
    '{first} did nothing different. Its bill on this platform moved from GBP ' +
    '{before} to GBP {after}.',
  b_crowd_more:
    'A rule share changes only when the rule or the crowd changes. Leaving ' +
    'does not release it: the pool stays and is shared among fewer riders. ' +
    'See the Ledger paper, 9.2.6.',
  b_fail_h: 'Entry two: risk. When it stops',
  b_fail:
    'When a shared platform stops, the work riding it is exposed, across ' +
    'teams that never speak. Fail it and watch which use cases go dark.',
  b_fail_see: 'How far that reaches is the blast radius.',
  b_together_h: 'A bad month, two ways',
  b_together:
    'Price a bad month for {sub} one use case at a time and add them up: ' +
    'about GBP {sum}. Price the domain together: about GBP {joint}.',
  b_together_def: 'Bad month: one so bad that a worse one comes about once in a hundred months.',
  b_together_see:
    'Adding assumes every use case has its worst month in the same month. ' +
    'They rarely do. Together is the figure to read.',
  b_together_more:
    'Both are a P99: a month worse than this comes about once in a hundred ' +
    'months. The two would match only if every loss moved in lockstep. See ' +
    'the Ledger paper, 9.8.3.',
  b_rho_h: 'How much they fail together',
  b_rho:
    'Those figures depend on one input this tool does not measure: how ' +
    'strongly platform failures are linked. Move the slider from one end to ' +
    'the other.',
  b_rho_def: 'Dependence: how strongly platforms tend to fail in the same month.',
  b_rho_see: 'Across the range the {sub} figure ran from about GBP {lo} to about GBP {hi}. The honest reading is the range.',
  b_rho_more:
    'The slider is a dependence parameter, rho, from 0 to 1. It runs under a ' +
    'Student t copula with four degrees of freedom. It is a declared input, ' +
    'not a measurement, and the tool says so. At the left end failures are ' +
    'uncorrelated, though the extremes still move together. As the slider ' +
    'moves right, the other platforms those use cases ride go down more ' +
    'often in the same month. In this model a stopped use case costs the ' +
    'same however many of its platforms failed. So linking failures means ' +
    'fewer bad months here, not worse ones. A real estate may differ, ' +
    'because joint failures can lengthen recovery.',
  b_grow_h: 'Entry three: leaving. How the footprint grew',
  b_grow:
    'Now the cloud data platform. Watch the months run: use cases attach to ' +
    'it one at a time, each for a good reason.',
  b_grow_see: 'By month {ratified}, when the board first saw it as a decision, {attached} already depended on it.',
  b_exit_h: 'What leaving would cost',
  b_exit:
    'At that month the work of leaving had already reached about GBP {exec}, ' +
    'unsplit. Migration, rewiring, running two systems for a while.',
  b_exit_def: 'Work of leaving: the engineering work to move every use case off a platform.',
  b_exit_see:
    'Month {cursor}: {attached_now} use cases attached, and the work of ' +
    'leaving stands at {exit_now}. Drag the handle either way. No single ' +
    'decision created it.',
  b_exit_more:
    'That figure is the full work of leaving, an engineering estimate rather ' +
    'than a measurement. The ledger would split it into execution work and ' +
    'the value of the choices given up. It declines to split it without ' +
    'evidence of what the alternative was. See the Ledger paper, 9.5. This ' +
    'model also hardens the figure by a made-up rate each month. After the ' +
    'last use case attaches, only that grows it.',
  b_diversify_h: 'Does spreading it out help?',
  b_diversify:
    'Same {n_uc} use cases, wired two ways. On the left, one platform does ' +
    'most of the work. On the right, specialists. Watch the three entries ' +
    'run on both at once: cost, then risk, then leaving.',
  b_diversify_see:
    'The shared point did not disappear. On the left one connector carries ' +
    '{left_riders} use cases. On the right {n_int} connectors each carry ' +
    'every use case. A bad month for {sub}: about GBP {left} on the left, ' +
    'about GBP {right} on the right.',
  b_diversify_more:
    'Neither shape is right, and the ledger does not pick one. Concentration ' +
    'inside a domain boundary is cheap to reason about. One domain shares ' +
    'the pool, and an outage stays in that domain. In each estate only one ' +
    'platform sits inside one domain. ' +
    'Concentration across boundaries is where the blast radius and the exit ' +
    'grow together, because every domain rides the same node. Spreading it ' +
    'out multiplies the shared connectors and the contracts. It does not ' +
    'remove it. At full dependence the two bad months ' +
    'converge. When platforms fail together it stops mattering how many ' +
    'there are. These three entries do not price the coordination cost of ' +
    'many vendors. Nor the latency of a process that crosses them. Both ' +
    'belong in the decision record, not in a figure here.',
  // The three phases of the comparison, on the card under the control.
  shapes_cost:
    'Cost. One pool of GBP {left_pool} on {left_top}, shared by {left_riders} ' +
    'use cases. On the right the largest pool is GBP {right_pool} on ' +
    '{right_top}, shared by {right_riders}. Rule share of what riders are ' +
    'told: {left_c1} percent on the left, {right_c1} on the right.',
  shapes_risk:
    'Risk. The busiest node fails on each side. Left: {left_aff} use cases ' +
    'stop. Right: {right_aff}, because every use case crosses that connector. ' +
    'A bad month for {sub}: about GBP {left} against about GBP {right}.',
  shapes_exit:
    'Leaving. The largest single exit is about GBP {left_exec} of work, off ' +
    '{left_exit}, on the left. On the right, about GBP {right_exec} off ' +
    '{right_exit}, with more contracts behind it.',
  ctl_shapes_cost: 'Cost',
  ctl_shapes_risk: 'Risk',
  ctl_shapes_exit: 'Leaving',
  shapes_note_cost: 'Pool GBP {pool}, {riders} riders, rule share {c1} percent',
  shapes_note_risk: '{aff} use cases stop',
  shapes_note_exit: 'Largest exit: {name}, about GBP {exec} of work',
  b_lines_drawn_h: 'Whose lines decided all of it',
  b_lines_drawn:
    'The domain figures so far, such as a bad month for {sub}, depend on ' +
    'where the domain lines sit. The graph was mined from the systems. The ' +
    'lines were drawn by people.',
  b_lines_drawn_def: 'Boundary: the line that says which domain owns which use case.',
  b_lines_drawn_see:
    'The faint dashed lines cross a boundary. A redraw touches every figure ' +
    'that reads one, and none of the systems.',
  b_lines_drawn_more:
    'The graph is the same whichever way the lines are drawn. What the lines ' +
    'decide is which figures belong to whom. So the lines must already exist ' +
    'and belong to someone other than whoever is measuring. The ledger ' +
    'records the owner on every entry. A figure that moves when a line moves ' +
    'is the one to trust least.',
  b_move_h: 'Move one use case',
  b_move:
    'Move {mover} out of {mover_from} into another domain, and watch the ' +
    'new domain take it in. Nothing in the estate changes; only the line moved.',
  b_move_see:
    'Under an equal split, {moved_equal} reported cost figures moved. That ' +
    'is the point: a permitted rule does not read the line.',
  decision_head: 'A line redrawn',
  decision_pending:
    '{uc} belongs to {from}. The domain architecture function has decided ' +
    'it belongs to {to}. Watch the line move, and the domain take it in.',
  decision_line:
    'The domain architecture function moved {uc} from {from} to {to}. No ' +
    'system changed and no line on the graph moved. Only the declared ' +
    'boundary did. Under a permitted rule, no cost figure reads it.',
  b_basis_h: 'Change the rule',
  b_basis:
    'Now change the allocation basis to by headcount, which reads the ' +
    'boundary.',
  b_basis_see: 'Under {basis}, {moved_basis} figures moved, by up to GBP {moved_max} a month, with no change in usage.',
  b_basis_more:
    'The figures that move when a line moves are the ones to trust least. ' +
    'The ledger permits two rules, an equal split and a split in proportion ' +
    'to use. Neither reads the boundary. The headcount basis is shown as the ' +
    'counter-example. See the Ledger paper, 9.2.8.',
  b_close_h: 'The ledger, closed',
  b_close:
    'Three entries on one node, kept apart. No total, because they do not ' +
    'add.',
  b_close_see: 'Explore on your own from here. The rail on the left has the six screens.',
  // The closing card's blocks. Text salvaged unchanged from the old tour's
  // last chapter where it existed; the caveat is the owner's sentence, word
  // for word, and is reused elsewhere, so it must stay character-identical.
  close_pitch: 'What the architecture costs, one decision at a time.',
  close_h_what: 'What this is',
  close_what:
    'An invented insurer and a way of pricing its architecture: three ' +
    'entries per use case, kept apart. Nothing here is a real measurement.',
  close_h_not: 'What it does not do',
  close_not:
    'It will not add the estate up to one number. It cannot say where a ' +
    'boundary belongs, or what leaving would really cost. It does not show ' +
    'the cost of adding the next use case. The paper treats that as the ' +
    'primary flexibility measure.',
  close_caveat:
    'It prices the choices a commitment removes. It does not yet price the ' +
    'ones a commitment creates. That work is parked on an open problem.',
  close_h_read: 'Read the argument',
  close_read: 'Archived at DOI {doi}.',
  close_read_link: 'Part 1 of the written argument.',
  close_built:
    'Built with heavy AI assistance, under a written specification and an ' +
    'acceptance suite.',

  story_ledger_head: 'The ledger so far',
  row_metered: 'Metered, a month',
  row_pool: 'Fixed pool, a month',
  row_rule_first: 'Rule share, {first}',
  row_sum: 'Bad month, {sub}, one at a time',
  row_joint: 'Bad month, {sub}, together',
  row_range: 'Dependence range',
  row_exec: 'Leaving, work of leaving at month {ratified}',
  row_left: 'Bad month, {sub}, concentrated',
  row_right: 'Bad month, {sub}, best of breed',
  row_moved: 'Figures moved under {basis}',

  ctl_fanin: 'Add use cases riding this node',
  ctl_fail: 'Fail it',
  ctl_rho: 'How strongly platform failures are linked',
  ctl_rho_lo: 'not correlated',
  ctl_rho_hi: 'fail together',
  ctl_month: 'Month',
  ctl_basis: 'Allocation basis',
  ctl_move_to: 'Move it to',
  ctl_did: 'You did that.',
  story_back: 'Back',
  story_next: 'Next',
  story_skip: 'Skip the story',
  story_explore: 'Explore on your own',
  story_restart: 'Start again',
  story_more: 'More detail',
  story_drag: 'Drag to move',

  // Part two's documents. Illustrative, and labelled so on screen.
  doc_1: 'Capability map',
  doc_1_age: 'last edited 14 months ago',
  doc_2: 'Application inventory',
  doc_2_age: 'a spreadsheet, 412 rows',
  doc_3: 'Integration diagrams',
  doc_3_age: '22 of them, three authors',
  doc_4: 'Risk register',
  doc_4_age: 'high, medium, low',
  doc_5: 'Vendor contracts',
  doc_5_age: 'renewals in four currencies',
  doc_6: 'Budget lines',
  doc_6_age: 'by cost centre, not by use case',
  docs_open: 'Open',
  // The three questions, and what each document cannot say about one use case.
  ask_cost: 'What it costs',
  ask_risk: 'What it risks',
  ask_exit: 'What leaving would cost',
  docpic_gap_head: 'For one use case, it cannot say',
  docpic_1_gap:
    'A score is an opinion with a colour on it. It does not say what one ' +
    'use case costs, what stops when a system does, or what leaving would cost.',
  docpic_2_gap:
    'One row per application. The work that runs on it, and who loses that ' +
    'work when it stops, is not a column.',
  docpic_3_gap:
    'An arrow says something flows. Not how much, not what it costs a ' +
    'month, not what breaks when it stops.',
  docpic_4_gap:
    'High, medium, low is a judgment, not a loss. Nothing here says which ' +
    'use cases an outage reaches, or what a bad month costs a domain.',
  docpic_5_gap:
    'The price of staying, by vendor. The price of leaving, by use case, is ' +
    'written nowhere.',
  docpic_6_gap:
    'Money by cost centre. A use case that rides four platforms appears in ' +
    'none of these rows, so its bill is nobody\'s.',
  docs_tap: 'Tap one to see what it looks like.',
  docpic_1_tag: 'v7, last edited 14 months ago',
  docpic_1_sub:
    'Nested boxes, one colour per box, scored one to five in a workshop. ' +
    'Nothing on it is a price, and nothing on it says which system does what.',
  docpic_2_tag: '412 rows, 31 columns',
  docpic_2_more: '403 more rows, 23 more columns',
  docpic_2_sub:
    'One row per application, one owner per row, and a cost centre. No row ' +
    'says which use cases ride it or what they would lose if it stopped.',
  docpic_3_tag: '22 drawings, three authors',
  docpic_3_sub:
    'Boxes and arrows in three hands, none dated the same, two marked final. ' +
    'The arrows say something flows. They do not say how much, or what it ' +
    'costs.',
  docpic_4_tag: 'reviewed quarterly',
  docpic_4_impact: 'impact',
  docpic_4_likelihood: 'likelihood',
  docpic_4_sub:
    'Each risk is a row and a dot on a five by five grid. Likelihood times ' +
    'impact, high, medium or low. Not a number, not a use case.',
  docpic_5_tag: 'renewals in four currencies',
  docpic_5_soon: 'in 60 days',
  docpic_5_sub:
    'One row per vendor, with the term, the notice period and what it costs a ' +
    'year. Nowhere does it say what leaving would cost, or who would feel it.',
  docpic_6_tag: 'this financial year',
  docpic_6_missing: 'No column names a use case.',
  docpic_6_sub:
    'Money by cost centre, budget against actual. The people who pay for a ' +
    'platform and the people whose work runs on it are on different pages.',
  docs_note: 'Illustrative. Every estate has its own set.',
  silo_cost: 'What it costs',
  silo_cost_sub: 'finance spreadsheet, by cost centre',
  silo_risk: 'What it risks',
  silo_risk_sub: 'risk register, high / medium / low',
  silo_exit: 'What leaving would cost',
  silo_exit_sub: 'rarely recorded',
  silo_note: 'No line joins them. None names a use case.',
  // Where the frameworks sit on the stage. Named by the owner's instruction.
  frames_head: 'Where the frameworks sit',
  frame_finops: 'FinOps',
  frame_finops_for: 'Meters cloud cost per unit of work.',
  frame_finops_stop: 'Stops at the cloud bill.',
  frame_tbm: 'TBM',
  frame_tbm_for: 'Allocates every IT cost to a tower and a service.',
  frame_tbm_stop: 'By rule, not by use case.',
  frame_ifrs: 'IFRS 17',
  frame_ifrs_for: 'Prices insurance liabilities by contract group.',
  frame_ifrs_stop: 'Not by the systems that serve them. No tile here.',
  frames_none_risk: 'No framework here prices risk per use case.',
  frames_none_exit: 'No framework here records the cost of leaving.',
  silo_ask_head: 'What a decision needs, for one use case',
  silo_ask: 'What it costs. What it risks. What leaving would cost.',
  silo_fail:
    'Three sources, three vocabularies, no shared key. None reaches the ' +
    'question in a form a finance director can use, so the colour often ' +
    'decides.',

  // The name on the canvas. Large and centred on the title card; on Next it
  // travels to the top of the canvas and stays there for the intro.
  wordmark_name: 'Harbourline Insurance',
  wordmark_tag: 'An architecture ledger of one invented insurer',
  intro_back: 'Back',
  intro_next: 'Next',
  intro_skip: 'Skip the intro',

  // The legend that builds as coloured regions are tapped.
  intro_legend_head: 'Domains',
  intro_legend_prompt: 'Tap a domain on the canvas to name it. Tap a name here to open or close it.',
  intro_legend_done: 'All {n_sub} named. The rest of the tool calls a domain a subdomain, the paper\'s word.',
  // The pulsing marker on the canvas.
  intro_callout_domain: 'Tap a domain',
  flow_button: 'Value flow',
  theme_dark: 'Dark',
  theme_light: 'Light',
  flow_legend_head: 'Where the work\'s value lands',
  flow_warm: 'reaches a customer',
  flow_mid: 'reaches an outside counterparty',
  flow_cool: 'stays inside the company',
  flow_width: 'width is work a month, not money',
  flow_declared: 'Declared by {owner}, {date}. Not a value figure.',
  canvas_gesture: 'Drag to look around. Scroll or pinch to zoom.',
  book_title: 'The ledger, {name}',
  book_row_1: 'Entry one: what it costs',
  book_row_2: 'Entry two: what it risks',
  book_row_3: 'Entry three: what leaving would cost',
  book_note: 'Three entries per use case. They do not add.',
  // The book's rows, filled for whatever node is tapped.
  book_v_cost_p: 'GBP {metered} metered, GBP {pool} by rule',
  book_v_risk_p: '{riders} use cases can stop with it',
  book_v_exit_p: 'about GBP {exec} of work to leave',
  book_v_cost_u: 'GBP {reported} a month, all platforms',
  book_v_risk_u: 'can stop if {worst} does',
  book_v_exit_u: 'stranded by {stranded}',
  badge_meter_head: '{name}, the meter',
  badge_meter_units: '{units} {driver} a month',
  badge_meter_spend: 'GBP {spend} metered, counted and billed',
  badge_pool_head: '{name}, the fixed pool',
  badge_pool_line: 'GBP {pool} a month, used or not',
  badge_pool_sub: 'To be shared among the {riders} use cases riding it.',
  panel_allocated_label: 'Allocated by rule, not billed',
  basis_moved:
    'Changing the basis to {basis} moved {n} of {riders} figures on this ' +
    'node, the largest by GBP {max} a month. Nothing was used differently.',
  basis_equal: 'This is the default, an equal split. Change the basis above to see which figures move.',
  basis_same: 'Under {basis} every figure on this node is what it was under an equal split.',
  reach_note:
    '{direct} interrupted on the failed node. {reached} more reached through ' +
    'the {platforms} platforms that went down with it at this dependence.',
  // The explorer's walkthrough: one node, six steps, the same rhythm as the story.
  walk_play: 'Walk me through it',
  walk_close: 'Done',
  walk_p_what_h: 'What it is',
  walk_p_what:
    '{name} is a {category}: a {kind} that {riders} use cases across {n_sub} ' +
    'domains run on. On the canvas it is the lit node; the lines into it are ' +
    'the work that depends on it.',
  walk_p_runs_h: 'What runs on it',
  walk_p_runs:
    '{rider_list}. Between them, that is the business value on this node. ' +
    'Not a figure, but a list of things the company does that stop if it does.',
  walk_p_billed_h: 'How it is billed',
  walk_p_billed:
    'Two parts. A meter on {driver}, GBP {metered} a month, counted and ' +
    'billed. And a fixed pool of GBP {pool} a month, licences and the team ' +
    'who run it. That is shared out among the riders by a rule: allocated, ' +
    'not billed.',
  walk_p_stops_h: 'When it stops',
  walk_p_stops:
    'Everything riding it is exposed: {riders} use cases across {n_sub} ' +
    'domains. About {lef} loss events a year, a typical one costing GBP ' +
    '{loss}. The wireframe nodes are the ones an outage reached.',
  walk_p_leaving_h: 'What leaving would cost',
  walk_p_leaving:
    'The work of leaving today is about GBP {exec}: migration, rewiring, ' +
    'running two systems for a while. The ledger would split that into ' +
    'execution work and the value of the choices given up. It declines to ' +
    'split it without a dated decision record, and this estate has none.',
  walk_p_when_h: 'When it arrived',
  walk_p_when:
    'Adopted at month {adopted}, ratified as strategic at month {ratified}. ' +
    'A real ledger would link the decision record here: who chose it, what ' +
    'the alternative was. This estate is synthetic and has no such record, ' +
    'so the ledger says so rather than invent one.',
  walk_u_what_h: 'What it is',
  walk_u_what:
    '{name} is one thing {sub} does, {volume} times a month. It is the lit ' +
    'dot; the lines from it are the systems it runs on.',
  walk_u_rides_h: 'What it rides',
  walk_u_rides:
    'It rides {n_pf} platforms: {pf_list}. Each is shared with other use ' +
    'cases, which is where every figure below comes from.',
  walk_u_told_h: 'What it is told it costs',
  walk_u_told:
    'GBP {reported} a month across all its platforms, of which GBP {metered} ' +
    'was read off a meter. ' +
    'The rest is its share of each platform\'s pool under the current rule. ' +
    'It moves when the rule or the crowd moves, though it did nothing different.',
  walk_u_none: 'no single platform',
  walk_u_exit_h: 'What would strand it',
  walk_u_exit:
    'Leaving {stranded} would strand it outright. That is the dependency ' +
    'the ledger keeps on its page, one line per platform.',
  intro_callout_usecase: 'Tap a use case',
  intro_callout_platform: 'Tap a platform',
  intro_focus_clear: 'Clear',

  // What the card says when a node is tapped. Assembled from data by
  // src/model/describe.ts; no line here names a product on its own.
  desc_sd_what: '{name} covers {scope}.',
  desc_sd_count:
    'It owns {n_uc} use cases, {volume} units of work a month between them. ' +
    'A use case is one thing the business does, such as paying a claim. A ' +
    'unit of work is one instance of it, one claim paid.',
  desc_sd_shared:
    'That work runs on {n_pf} platforms, the systems it happens in, and ' +
    '{n_shared} of them are shared with other domains. That sharing is where ' +
    'the rest of this tool starts.',

  desc_uc_what:
    '{name} is one of the {n_sub_uc} things {sub} does. It handles {volume} ' +
    'units a month.',
  desc_uc_rides:
    'It depends on {n_edges} platforms: {edge_list}. Take any one away and ' +
    'it cannot run.',
  desc_uc_cost:
    'Across all its platforms it is told it costs GBP {reported} a month. ' +
    'GBP {metered} of that is metered. The rest is its share of pools it ' +
    'does not control.',
  desc_uc_risk:
    'Its biggest exposure is {worst}. When that is down, this is down ' +
    '{worst_pct} times in a hundred.',

  desc_ln_what:
    'This line joins {uc} to {platform}. {uc} cannot run without it.',
  desc_ln_flow:
    'Every month about {units} {driver} cross it, and GBP {spend} goes with ' +
    'them. That is the metered part of what {uc} is told it costs here.',
  desc_ln_risk:
    'If {platform} goes down, {uc} goes down with it {pct} times in a hundred.',

  // The drawing the estate is usually seen as, chapter 7. Synthetic, like
  // everything else, and labelled so.
  drawing_title: 'How this estate is usually shown',
  drawing_sub: 'A matrix, one colour per judgment. Illustrative.',
  drawing_green: 'fit',
  drawing_amber: 'watch',
  drawing_red: 'replace',
  drawing_none: 'not used',
  drawing_tap: 'Tap to see what the colours hide',

  // Panel notes that used to be typed into the component.
  panel_exec_note: 'An engineering estimate of the work of leaving, unsplit: migration effort, dual running, retraining.',
  // View 2's annotation, named for what it is rather than by a label the
  // canon uses for a reading principle.
  c1_annotation: 'Share set by rule',
  panel_spread_note:
    'The spread across allocation rules is the number to read. The metered part ' +
    'is observed. The rest is a rule.',
  panel_section_metered: 'What it meters',
  panel_section_riders: 'Who rides it, and the rule',
  panel_section_failure: 'When it stops',
  panel_section_switching: 'What leaving would cost',

  desc_pf_what:
    '{name}, {category}. {riders} use cases across {n_sub} parts of the ' +
    'business depend on it.',
  desc_pf_rides: 'Among them: {rider_list}.',
  desc_pf_how: 'How it is paid for: {capacity}',
  desc_pf_cost:
    'It costs GBP {pool} a month whether anyone uses it or not, plus GBP ' +
    '{metered} a month metered by {driver}.',
  desc_pf_rule:
    '{c1} percent of what its riders are told it costs is set by a rule, not ' +
    'read off a meter.',

  // Closing card.

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
    label: 'Share set by rule',
    tip: 'How much of a bill came from a rule rather than a meter. Higher means less of it was measured.',
  },
  fan_in: {
    label: 'Fan-in',
    tip: 'How many use cases depend on one node. High fan-in means one outage reaches a lot of work.',
  },
  blast_radius: {
    label: 'Blast radius',
    tip: 'The work that can stop if this node stops, counted in monthly volume.',
  },
  allocation_basis: {
    label: 'Allocation basis',
    tip: 'The rule that hands out the fixed pool. Change it and everyone\u2019s number moves, though nobody used more.',
  },
  joint_p99: {
    label: 'Joint P99 loss',
    tip: 'A bad month for the whole group taken together. Worse than this in about one month in a hundred.',
  },
  sum_of_p99: {
    label: 'Sum of P99s',
    tip: 'Each use case\u2019s bad month added up. It assumes every worst month lands at once, which is the extreme case.',
  },
  execution_component: {
    label: 'Work of leaving',
    tip: 'What leaving would take: migration, rewiring, running both for a while. An engineering estimate, not a measurement, shown unsplit.',
  },
  integration_node: {
    label: 'Integration node',
    tip: 'A node whose job is connecting other nodes. Gateways, buses, identity. Drawn as a diamond.',
  },
  subdomain: {
    label: 'Subdomain',
    tip: 'The smallest part of the business that can own a use case\u2019s numbers. One owner, its own margin and headcount, and no platform defines it.',
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
  3: 'Break a node and see what stops. Then see why each bad month added up is not the group\'s bad month.',
  4: 'Watch things pile onto one node month by month, and what leaving would have taken by the time anyone decided.',
  5: 'The same thirty use cases wired two ways. Concentration does not go away when you diversify. It multiplies.',
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
    'can stop when the node does.',

  // View 1, a platform selected.
  s1n_head:
    '{name} meters GBP {metered} a month and hands out another GBP {pool} ' +
    'by rule.',
  s1n_number:
    '{riders} use cases split that pool. {c1} percent of what they are told ' +
    'it costs was decided by a rule, not read off a meter.',
  s1n_mechanism:
    'If this node stops, up to {blast_uc} use cases across {blast_sub} ' +
    'subdomains can stop with it.',

  // View 1, a use case selected.
  s1u_head:
    '{name} rides {n_edges} shared nodes and is told it costs GBP {reported} ' +
    'a month across all of them.',
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
    '{first} is told GBP {base} for this platform alone. Add riders and that ' +
    'figure moves, though it uses nothing more.',
  s2_number_moved:
    'With {added} added, {first} is told GBP {now} for this platform instead ' +
    'of GBP {base}. It used nothing more.',
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
    'A bad month for {sub} looks like about GBP {sum} priced one use case at ' +
    'a time. Taken together it is about GBP {joint}.',
  s3_mechanism:
    'The first figure assumes every use case has its worst month at once. ' +
    'Priced together, the worst months do not all coincide.',

  // View 4.
  s4_head:
    'By month {ratified}, when {name} was ratified, {n} use cases already ' +
    'depended on it.',
  s4_number:
    'Leaving would already have taken about GBP {exec} of work. The ledger ' +
    'declines to split that into execution work and an option component ' +
    'without an evidenced counterfactual.',
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
    'A bad month for {sub} runs about GBP {left} on one side and about GBP ' +
    '{right} on the other. Both are at the dependence currently set.',
  s5_mechanism:
    'Splitting the estate did not remove the shared point. It multiplied it ' +
    'across the connectors.',

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
