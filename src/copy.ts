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
    'value of the choices you no longer have.',

  // Canon 9.5.7 and 9.9. The counterfactual is declared, not evidenced from a
  // dated decision record, because a synthetic estate has no decision record.
  // A real ledger would decline to state this number. It never renders outside
  // the element carrying this text.
  option_refusal:
    'The alternative behind these two figures is declared, not evidenced. A ' +
    'real ledger would refuse to state them. They are shown only to make the ' +
    'shape of the split visible.',

  // Canon 9.5.2. The decomposition replaces a broad switching-cost estimate.
  // It is never added to one.
  switching_split:
    'Switching cost splits into two parts that move for different reasons. ' +
    'This is one number divided in two, not two numbers added together.',
  // Screen prose moved out of the components, audit v0.4 section 12.
  fp_legend_order: 'Use cases attach in the order they were adopted, never before the platform itself.',
  fp_legend_faint: 'Faint nodes have not arrived yet at month {cursor}.',
  fp_two_charts: 'Two charts, one time axis. The monthly bill and the cost of leaving are different kinds of number. They do not share a scale.',
  fp_ratified:
    'By the time this platform reached the board, {n} use cases in ' +
    '{subdomains} subdomains already depended on it. The work of leaving had ' +
    'reached about USD {exec}. The board ratified a footprint.',
  bd_legend_dashed: 'Dashed edges cross a declared boundary.',
  bd_legend_tap: 'Tap a use case to move it.',
  bd_pick: 'Tap a use case in the graph, or pick one below.',
  bd_merge_note: 'Merging moves every use case out of one declared subdomain into another. The graph is untouched.',
  bd_whose: 'Whose decision becomes whose dependency changes with the lines.',
  rk_legend_ring: 'pulsing ring: the node you failed',
  rk_legend_wire: 'wireframe: use case interrupted',
  rk_sampled: 'Sampled from each edge\'s conditional failure probability. Press Fail it again for a different pattern.',
  ts_same: 'Same {n_uc} use cases, wired two ways',
  ts_highest: 'Highest on a single node: {left} at {left_pct} percent on the left, {right} at {right_pct} percent on the right.',
  ts_next_two: 'Next two on the right: {a} ({a_type}) and {b} ({b_type}).',
  fx_legend_solid: 'solid arc: metered, a meter reading',
  fx_legend_hatched: 'hatched arc: rule, an allocation',
  fx_told_h: 'What each rider is told it costs here',
  fx_rank_note: 'Ranking within one axis is one of the three things that survives when the total is refused. See the Ledger paper.',
  fx_select: 'Select a platform or integration node.',
  ex_hulls: 'Hulls overlap where platforms are shared. The overlap is the point.',
  ec_sparse: 'Not enough loss events at this setting to draw a curve.',
  exit_not_yet: 'nothing yet, it had not been adopted',
  exit_now_value: 'about USD {exec}',
  footprint_chart_aria: 'Metered spend, per-rider rule share and the work of leaving, over 60 months',
  sw_created: 'Work the commitment created: about USD {v}',
  sw_given_up: 'Choices given up: about USD {v}',
  switching_replace: 'The ledger would replace that estimate with two parts, if the alternative were on record:',
  footprint_no_add: 'The ledger adds nothing to this figure. Its two parts need the alternative on record.',

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
  // Tab 7: the standalone app, not built yet. Said plainly.
  rail_plug: "Plug 'n' Play",
  rail_paper: 'Read the paper',
  plug_eyebrow: 'Moving beyond theory',
  plug_title: 'Coming soon',
  plug_line: 'A standalone app you plug your own telemetry into.',
  plug_line2: 'It maps your estate from what your systems actually do, and helps you weigh cost, risk and exit.',
  plug_note: "Same ledger, your real numbers instead of Harbourline's.",
  paper_eyebrow: 'The canonical thesis, v2.1d',
  paper_title: 'The Architecture Ledger',
  paper_sub: 'The complete reference this explorer is built from.',
  paper_page: 'Page {n} of {total}',
  paper_prev: 'Previous page',
  paper_next: 'Next page',
  paper_zoom_out: 'Smaller',
  paper_zoom_in: 'Larger',
  paper_fit: 'Fit width',
  paper_pages_dark: 'Dark pages',
  paper_pages_light: 'Paper pages',
  paper_pages_hint: 'Show the pages light on dark, or as printed',
  paper_loading: 'Opening the paper',
  paper_failed: 'The paper would not open in this browser. It is on Zenodo, linked below.',
  paper_more: 'For a deeper dive, the research paper, the mathematics and a plain English companion are there too.',
  paper_link: 'Find the supplemental documents on Zenodo',
  plug_help_h: 'Where I need help',
  plug_help_1: 'Right now all of this runs on an invented insurer. That was fine for building it. It is not proof.',
  plug_help_2: 'The next step is putting it in front of real companies, with their own systems, and seeing if it holds.',
  plug_help_3: 'So I am looking for people who will test it, not just read it. Architects, finance teams, anyone who has had to defend a number about their systems.',
  plug_help_4: 'Different industries and sizes help most. And if it does not track, I want to hear that too.',

  // View 4, cursor dragged to a month before the node was adopted. The panel
  // keeps its shape; only the figures have nothing to say yet.
  footprint_bill_visible:
    'The bill was visible throughout. The work of leaving was not shown to ' +
    'anyone.',
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
  story_welcome_sub: 'Architecture decisions cost money and carry risk. We still mostly measure them in colours.',
  story_welcome_ask: 'Can we measure them in dollars instead?',
  // The owner's sentence. The two coloured words take the architects' and
  // the CFO's colours; the words between are split so they can be styled.
  story_welcome_note_1: 'Let\'s try it on a fictional organisation, with the architecture ledger. It is an early idea I am exploring, to bridge the ',
  story_welcome_note_bp: 'blueprint',
  story_welcome_note_2: ' and the ',
  story_welcome_note_bs: 'balance sheet',
  story_welcome_note_3: '.',
  // The company, before the title: who works on the estate and what each
  // asks of it. The two roles keep their colours on every card after this.
  intro_h: 'Introducing Harbourline Insurance',
  intro_sub: 'A fictional insurer, much like many firms today.',
  intro_arch: 'The architects',
  intro_arch_text: 'Look after a growing estate of systems, and the choices that shape it.',
  intro_cfo: 'The CFO',
  intro_cfo_text: 'Asks what the estate costs to run, what an outage would cost the business, and what changing course would cost.',
  intro_gap: 'Same estate. Rarely a shared number for it.',
  who_arch: 'Architects',
  who_cfo: 'CFO',
  story_welcome_tap: 'Tap anywhere to begin',
  story_welcome_skip: 'Skip to the tool',
  story_continue: 'Tap anywhere, or press the right arrow, to continue',
  story_part1_title: 'Part one',
  story_part1_sub: 'The architecture',
  story_part2_title: 'Part two',
  story_part2_sub: 'How it is measured today',
  story_part3_title: 'Part three',
  story_part3_sub: 'The ledger',
  story_end1: 'That is the architecture.',
  story_end1_sub: 'Now, how decisions about it get made.',
  story_end2: 'That is how it is measured today.',
  story_end2_sub: 'Now, the ledger.',
  // The chapter navigator and the menu.
  // Work in progress: said plainly in the explorer and on the closing card.
  wip_h: 'Work in progress',
  wip: 'This is a thesis, not a finding. Every figure here comes from an invented company.',
  wip_more:
    'The next step is testing it on real telemetry, which takes an ' +
    'organisation willing to try. Curious domain and technology leaders are ' +
    'welcome to use it to stress-test the idea. A public repository for ' +
    'plugging in your own telemetry and building this view is on the roadmap.',
  wip_open: 'Read more',
  wip_hide: 'Hide',
  chapter_0: 'Prologue',
  chapter_1: 'The architecture',
  chapter_2: 'How it is measured today',
  chapter_3: 'The ledger',
  chapter_explorer: 'Explorer',
  chapter_explorer_sub: 'skip the chapters',
  nav_menu: 'Chapters',
  nav_page: 'page {k} of {n}',
  nav_welcome: 'Welcome',
  nav_intro: 'Harbourline Insurance',
  nav_title: 'The architecture ledger',
  nav_reflect: 'A pause',
  nav_part: 'Chapter opening',
  nav_end: 'Chapter close',
  part_label_1: 'Part one: the architecture',
  part_label_2: 'Part two: how it is measured today',
  part_label_3: 'Part three: the ledger',

  // The opening, after the welcome: what it is, why it matters, and how it
  // works in three steps. Each is one line and one picture.
  tagline: 'What the architecture costs, one decision at a time.',
  b_title_h: 'The architecture ledger',
  title_bridge: 'So how might both see the same estate the same way?',
  title_big: 'Introducing the architecture ledger',
  b_title:
    'A proposed framework: three numbers for each thing the business does, ' +
    'kept side by side and never added up.',
  // The owner's sentence, reproduced unchanged by instruction, and exempt
  // from the twenty-word rule. It sits under More detail on the title beat.
  // The owner's sentence, reworded at their instruction so it names the
  // app, not the ledger, as the model; exempt from the twenty-word rule.
  b_title_see:
    'This app is an interactive model of one invented insurer, built to show ' +
    'what architecture decisions cost when you measure them in dollars instead ' +
    'of colours. Everything here is synthetic and says so.',
  what_cost: 'What it costs',
  what_risk: 'What it risks',
  what_exit: 'What leaving would cost',

  b_opener_why_h: 'Why it matters',
  b_opener_why:
    'None of the three is new. Cost, risk and the cost of leaving can each ' +
    'be estimated with methods that already exist.',
  b_opener_why_see:
    'But they tend to live in different places, owned by different people, ' +
    'in different units. So decisions often fall back on a colour.',
  b_opener_why_more:
    'FinOps meters technology spend, TBM allocates IT cost by rule, and risk ' +
    'methods estimate losses that arrive together. The Ledger paper claims ' +
    'none of these methods as its own. As a thesis, it proposes reading all ' +
    'three on one unit: a single use case on the shared map. ' +
    'See the Ledger paper, 9.16.',
  why_cost: 'A spreadsheet',
  why_cost_sub: 'What it costs, by cost centre',
  why_cost_so: 'Shared costs are often split by a rule, not by use.',
  why_risk: 'A risk register',
  why_risk_sub: 'What it risks: high, medium or low',
  why_risk_so: 'An outage can reach work that no one measured.',
  why_exit: 'Rarely written down',
  why_exit_sub: 'What leaving would cost',
  why_exit_so: 'Dependence can grow before anyone decides.',
  why_colour: 'So decisions often fall back on a colour.',

  b_how_map_h: 'How: a map, not a drawing',
  b_how_map:
    'An architecture diagram is reviewed and agreed. But it shows a slice, ' +
    'drawn for one purpose, as of one date.',
  b_how_map_see:
    'The systems\' own traces say which calls which, every day. That is a ' +
    'map, as current as its last reading.',
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
    'This is why the ledger reads use cases, not systems. A system has an ' +
    'owner but no margin. A use case sits in a domain that has both. See the ' +
    'Ledger paper, 9.1.2.',

  b_how_graph_h: 'How: why a graph',
  b_how_graph:
    'Cost pools where systems are shared. Risk travels along the lines. ' +
    'Leaving strands whatever depends on a system.',
  b_how_graph_see:
    'Press Next, or tap an entry under the map, to play each one in turn. ' +
    'Part three measures all three properly, and never adds them up.',
  b_how_graph_more:
    'The map plays each entry on the path of {opener_uc}. After the third, ' +
    'Next moves on to a short pause. Part one then builds this map in three ' +
    'dimensions, one layer at a time.',
  flat_cost_note: 'Cost pools at {name}: {n} use cases share its fixed costs, split by a rule.',
  flat_risk_note: 'Risk travels from {name}: if it stops, the {n} use cases on it can stop too.',
  flat_exit_note: 'Leaving {name} strands work: all {n} use cases on it must move first.',
  flat_entry_1: 'What it costs',
  flat_entry_2: 'What it risks',
  flat_entry_3: 'What leaving would cost',

  // A pause after the opening: the whole idea has been said. Go on into the
  // full tour, or leave for the tool.
  reflect_big: 'That is the whole idea.',
  reflect_sub: 'Each thing the business does gets three figures. They start from the map and are never added up.',
  reflect_ask: 'If this sounds like a problem you have seen, the full tour walks through it in three parts.',
  reflect_go: 'Continue the tour',
  reflect_leave: 'Leave the tour',
  reflect_note: 'The tour stays one tap away, on the rail.',

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
    'the company bought or built. Each grey sphere is one: a platform.',
  b_platforms_def: 'Platform: a system the business bought or built, that use cases run on.',
  b_platforms_see:
    'The bigger the sphere, the more use cases depend on it. Almost every ' +
    'platform is shared across domains. Tap a sphere to see what rides on it.',
  b_platforms_more:
    'The platforms are shared. That is the first thing this whole story turns ' +
    'on, and the picture says it before any number does.',
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
    'that reaches a customer. Mid-tone lines carry work that reaches a ' +
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
  b_busiest_see: 'That is the lit node. Part three comes back to it.',

  // Part two: how it is measured today.
  b_docs_h: 'Where the architecture lives',
  b_docs:
    'Today the architecture lives in documents. Each is written by someone, ' +
    'dated, and ageing from the day it is saved.',
  b_docs_see:
    'Six kinds, kept in six places, none the same age. Open one: each is ' +
    'right about something, and says little about the three questions a ' +
    'decision needs.',
  b_docs_more:
    'TOGAF calls the whole collection an architecture repository, and ' +
    'it is only as current as its most recent edit. The picture you just ' +
    'built is not in it; it would have to be drawn.',
  b_matrix_h: 'What decisions are made on',
  b_matrix:
    'When a decision is needed, all of that is often boiled down to one ' +
    'drawing. A matrix, one colour per judgment.',
  b_matrix_see:
    'Someone scores each system for fit and value, and the cell takes the ' +
    'colour. Nothing on it is a measurement.',
  b_matrix_more:
    'This is the common practice: capability heat maps, and the two-by-two ' +
    'of business value against technical fit. Each is scored one to five by ' +
    'a person. Here the colours are set from each system\'s share of fixed ' +
    'cost, so the drawing is of Harbourline. Part three shows why that share ' +
    'must never decide a replacement. The drawing is labelled illustrative.',
  b_silos_h: 'Three questions, three places',
  b_silos:
    'What it costs is in a finance spreadsheet, by cost centre. What it risks ' +
    'is in a register, high, medium or low. What leaving would cost is ' +
    'rarely written down at all.',
  // Methods and standards are named here by the owner's instruction;
  // products and vendors still are not. Each is checked against the canon.
  b_silos_see: 'Methods exist for all three. Tap a tile to see them, and where each one stops.',
  b_silos_more:
    'FinOps, TBM and IFRS 17 on cost. FAIR and correlated-failure models on ' +
    'risk. Switching-cost economics and real options on leaving. The Ledger ' +
    'paper builds on several of them and claims none as its own. See 9.3.1, ' +
    '9.3.9 and 9.5.',
  b_graph_today_h: 'The graph already exists',
  b_graph_today:
    'The system half of that picture is not imaginary. Operations tools ' +
    'discover which systems call which, every day, to find outages.',
  b_graph_today_see:
    'Which systems a use case touches is discovered. What counts as a use ' +
    'case, and which domain owns it, is declared. The graph carries no ' +
    'money. In most estates nobody has joined the spreadsheet, the register ' +
    'and the exit figure to it per use case.',
  b_graph_today_more:
    'That is the gap the Ledger paper names. The graph is mined, the numbers ' +
    'are elsewhere, and the decision is often made on a colour. See the ' +
    'Ledger paper.',

  // The end of part two: what deciding this way costs, and who it lands on.
  // Each tile is a consequence the mathematics shows and part three measures.
  b_pain_h: 'Four blind spots',
  b_pain:
    'Deciding on a colour is not careless. But it leaves four blind spots, ' +
    'and each one lands on someone.',
  b_pain_see: 'Part three puts a figure on each, on one shared platform.',
  b_pain_more:
    'These follow from the mathematics, not from a survey of organisations. ' +
    'In the Ledger paper: the saving at 9.2.6, the risk at 9.8.3, leaving at ' +
    '9.5, the boundary at 9.2.8.',
  pain_1_h: 'A saving that never arrives',
  pain_1: 'Retire a use case and its share of a shared platform stays, spread over the rest.',
  pain_1_who: 'Lands on the CFO',
  pain_2_h: 'Risk that does not add up',
  pain_2: 'Each team\'s worst month, added up, differs from the group\'s worst month. A colour cannot say which way, or by how much.',
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
    'The graph supplies the start of all three entries for {uc}. Which ' +
    'systems it rides, how much work it sends them, what stops it.',
  b_mine_see:
    'The rest is declared or estimated, and each entry says which. We fill ' +
    'its three entries in turn, starting with what can be measured.',
  b_mine_more:
    'This is the whole idea in one picture. The graph on the left is mined ' +
    'from the systems. The book on the right has one page per use case; this ' +
    'one is {uc}. The ledger is the wiring between them, and every entry can ' +
    'be traced back along a wire to the graph.',
  b_meter_h: 'Entry one: cost. The meter',
  b_meter:
    'Start with what can be measured. {uc} rides {node}, a shared service ' +
    'with a meter: every login is counted and billed.',
  b_meter_def: 'Metered: counted as it is used, and billed by the count.',
  b_meter_see:
    'Watch the reading beside the node: the meter is the only part of the ' +
    'bill anyone actually measures.',
  b_meter_more:
    'The meter\'s unit is called the driver, the thing that gets counted. ' +
    'Logins for an identity platform, policy transactions for a policy ' +
    'engine. Tap another node to see its meter. A real ledger would show ' +
    'each cost as a range over months of readings. This invented estate has ' +
    'one month, so it shows one figure. See the Ledger paper, 9.2.5.',
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
    'The pool is shared among the {riders} use cases riding it, by a rule ' +
    'somebody chose. The rings show it: solid is metered, hatched is rule.',
  b_rule_def: 'Rule share: the part of a pool a use case is given by a rule, not a meter.',
  b_rule_see:
    '{uc} is told USD {before} a month for this node alone. USD {rule_first} ' +
    'of that is the rule.',
  b_rule_more:
    'The rule is an equal split, or a split in proportion to use. The riders ' +
    'are the use cases riding the platform; their share of the pool is their ' +
    'rule share.',
  b_crowd_h: 'The crowd changes',
  b_crowd:
    'Watch three more use cases arrive on this node, then add or remove ' +
    'some yourself.',
  b_crowd_see:
    '{uc} did nothing different. Its bill on this node moved from USD ' +
    '{before} to USD {after}.',
  b_crowd_after: 'Each newcomer adds about USD {mc} a month in metered use here, and nothing to the pool.',
  b_crowd_more:
    'A rule share changes only when the rule or the crowd changes. Leaving ' +
    'does not release it: the pool stays and is shared among fewer riders. ' +
    'See the Ledger paper, 9.2.6. The cost of adding the next use case is ' +
    'that increment, not an allocated share. The paper treats it as the ' +
    'primary flexibility measure. See the Ledger paper, 9.2.4 and 9.4.',
  b_fail_h: 'Entry two: risk. When it stops',
  b_fail:
    'When a shared node stops, the work riding it is exposed, across ' +
    'teams that never speak. Fail it and watch which use cases go dark.',
  b_fail_see: 'How far that reaches is the blast radius.',
  b_together_h: 'A bad month, two ways',
  b_together:
    'Measure a bad month for {sub} one use case at a time and add them up: ' +
    'about USD {sum}. Measure the domain together: about USD {joint}.',
  b_together_def: 'Bad month: one so bad that a worse one comes about once in a hundred months. It counts margin lost from stopped work.',
  b_together_see:
    'Adding assumes every use case has its worst month in the same month. ' +
    'Here they do not, so adding comes out higher. Together is the figure ' +
    'to read.',
  b_together_more:
    'Both are a P99: a month worse than this comes about once in a hundred ' +
    'months. The two would match only if every loss moved in lockstep. See ' +
    'the Ledger paper, 9.8.3. With very heavy tails, adding can even come ' +
    'out lower. See the Ledger paper, 9.3.8.',
  b_rho_h: 'How much they fail together',
  b_rho:
    'Those two figures rest on one input this tool does not measure: how ' +
    'strongly platform failures are linked. Move the slider from one end to ' +
    'the other.',
  b_rho_def: 'Dependence: how strongly platforms tend to fail in the same month.',
  b_rho_see:
    'The together figure barely moves until failures are almost fully ' +
    'linked. The added-up figure falls from about USD {sum_hi} to about USD ' +
    '{sum_lo}, closing the gap.',
  b_rho_more:
    'The slider is a dependence parameter, rho, from 0 to 1. It runs under a ' +
    'Student t copula with four degrees of freedom. It is a declared input, ' +
    'not a measurement. At the left end failures are uncorrelated, though ' +
    'the extremes still move together. As it moves right, worst months ' +
    'start to coincide, so adding comes closer to right. At the right end ' +
    'the two figures nearly meet. In this model a stopped use case costs the ' +
    'same however many of its platforms failed. So linked failures mean ' +
    'fewer loss months, and the together figure falls slightly at the far ' +
    'right. A real estate may differ, because joint failures can lengthen ' +
    'recovery. The figures come from fixed runs of 10,000 months each. ' +
    'Differences under about 6 percent are simulation noise. The picture ' +
    'shows the idea, not a simulated month.',
  b_grow_h: 'Entry three: leaving. How the footprint grew',
  b_grow:
    'Now {leave}, which {uc} also rides. Watch the months ' +
    'run: use cases attach one at a time, each for a good reason.',
  b_grow_see: 'By month {ratified}, when the board first saw it as a decision, {attached} already depended on it.',
  b_exit_h: 'What leaving would cost',
  b_exit:
    'At that month the work of leaving had already reached about USD {exec}. ' +
    'Migration, rewiring, running two systems for a while.',
  b_exit_def: 'Work of leaving: the engineering work to move every use case off a platform.',
  b_exit_see:
    'Month {cursor}: {attached_now} use cases attached, and the work of ' +
    'leaving stands at {exit_now}. Drag the handle either way. No single ' +
    'decision created it.',
  b_exit_more:
    'That figure is an engineering estimate of the work to leave today, not ' +
    'a measurement. It belongs to the platform and is never divided among ' +
    'the use cases riding it. The ledger would report two figures in its ' +
    'place. One is how much of this work the commitment created, measured ' +
    'against the alternative on the table at the time. The other is the ' +
    'value of the choices it gave up. Both need that alternative on record, ' +
    'dated. This estate has none, so the ledger reports neither. See the ' +
    'Ledger paper, 9.5.2 and 9.5.7. This model also hardens the figure by a ' +
    'made-up rate each month. After the last use case attaches, only that ' +
    'grows it. The same figure cuts both ways. For a platform that earns its ' +
    'footprint, it makes the case for ratifying it. For one that grew by ' +
    'lock-in, it prices the lock-in.',
  b_exit_after: 'Accretion is not the fault. Ratifying it without this figure is.',
  b_diversify_h: 'Does spreading it out help?',
  b_diversify:
    'Same {n_uc} use cases, wired two ways: concentrated on a few shared ' +
    'platforms, or spread across best of breed specialists.',
  // Shown under the comparison, where the reader has just read the figures.
  b_diversify_after: 'Spreading out moves the shared point. It does not remove it.',
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
    'there are. These three entries do not measure the coordination cost of ' +
    'many vendors. Nor the latency of a process that crosses them. Both ' +
    'belong in the decision record, not in a figure here.',
  // The comparison on the card, and the two shapes' names.
  shape_left: 'Concentrated',
  shape_right: 'Best of breed',
  shapes_row_cost: 'busiest node\'s pool',
  shapes_row_risk: 'a bad month for {sub}',
  shapes_row_exit: 'largest single exit, month 60',
  shapes_cell_cost: '{name}: USD {pool}, {riders} riders',
  shapes_cell_risk: 'about USD {v}',
  shapes_cell_exit: '{name}: about USD {exec}',
  // The two shapes panel: the three largest works of leaving on each side,
  // ranked. Never summed: each belongs to its own platform.
  shapes_exit_rank_h: 'Work of leaving, the three largest',
  shapes_exit_rank_note: 'A ranking, not a sum. Each figure belongs to its own platform.',
  // Boundaries: what a redrawn line leaves alone, and what it moves.
  boundaries_unchanged:
    'The graph does not move, and neither do its edges or metered spend. ' +
    'Risk does: a domain\'s bad month adds up whoever is inside the line. ' +
    'In this model a moved use case also takes its new domain\'s margin. ' +
    'Cost figures move only under a basis that reads the line. Those are ' +
    'the figures to trust least.',
  ctl_shapes_cost: 'Cost',
  ctl_shapes_risk: 'Risk',
  ctl_shapes_exit: 'Leaving',
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
  b_basis_see: 'Under {basis}, {moved_basis} figures moved, by up to USD {moved_max} a month, with no change in usage.',
  b_basis_more:
    'The figures that move when a line moves are the ones to trust least. ' +
    'The ledger permits two rules, an equal split and a split in proportion ' +
    'to use. Neither reads the boundary. The headcount basis is shown as the ' +
    'counter-example. See the Ledger paper, 9.2.8.',
  b_close_h: 'The ledger, closed',
  b_close: 'Three entries for {uc}, kept apart. No total, because they do not add.',
  b_close_see: 'Explore on your own from here. The rail on the left has the six screens.',
  // The closing card's blocks. Text salvaged unchanged from the old tour's
  // last chapter where it existed; the caveat is the owner's sentence, word
  // for word, and is reused elsewhere, so it must stay character-identical.
  close_pitch: 'What the architecture costs, one decision at a time.',
  close_h_what: 'What this is',
  close_what:
    'An invented insurer and a way of measuring its architecture: three ' +
    'entries per use case, kept apart. Nothing here is a real measurement.',
  close_h_not: 'What it does not do',
  close_not:
    'It will not add the estate up to one number. It cannot say where a ' +
    'boundary belongs, or what leaving would really cost. It shows the cost ' +
    'of the next use case on one node only. The paper treats that as the ' +
    'primary flexibility measure.',
  close_caveat:
    'It prices the choices a commitment removes. It does not yet price the ' +
    'ones a commitment creates. That work is parked on an open problem.',
  close_h_wip: 'Work in progress',
  close_h_read: 'Read the argument',
  close_read: 'Archived at DOI {doi}.',
  close_read_link: 'Part 1 of the written argument.',
  close_built:
    'Built with heavy AI assistance, under a written specification and an ' +
    'acceptance suite.',

  // The card's page for the tour use case. Each line names its object:
  // an entry, a node, the use case or a domain.
  story_ledger_head: 'The ledger, {uc}',
  row_e1: 'Entry one, cost',
  row_e1_v: 'USD {uc_reported} a month across {uc_n_pf} platforms, USD {uc_rule} of it by rule',
  row_e1_node: '{node}',
  row_e1_node_v: 'metered USD {spend} a month, fixed pool USD {pool} a month',
  row_e1_rule: '{uc}',
  row_e1_rule_v: 'rule share on {node} USD {rule_first}',
  row_e1_next: '{node}',
  row_e1_next_v: 'the next use case adds USD {mc} a month',
  row_e2: 'Entry two, risk',
  row_e2_v: 'its own bad month, about USD {uc_p99}',
  row_e2_sum: '{sub} domain',
  row_e2_sum_v: 'added up USD {sum}, together USD {joint}',
  row_e2_range: '{sub} domain: added up across the slider',
  row_e2_range_v: 'USD {sum_lo} to USD {sum_hi}',
  row_e2_shapes: '{sub} domain',
  row_e2_shapes_v: 'together: concentrated USD {left}, best of breed USD {right}',
  row_e3: 'Entry three, leaving',
  row_e3_v: 'rides {platform}: about USD {exec_today} to leave today, shared by {dc_riders}',
  row_e3_board: '{platform}',
  row_e3_board_v: 'about USD {exec} when the board first saw it, month {ratified}',
  row_moved: 'Boundary',
  row_moved_v: 'figures moved under {basis}: {moved_basis}',
  story_workings_show: 'Show workings',
  story_workings_hide: 'Hide workings',

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
  docs_hint: 'Tap each document to open it',
  docpic_1_tag: 'v7, last edited 14 months ago',
  docpic_1_sub:
    'Nested boxes, one colour per box, scored one to five in a workshop. ' +
    'Nothing on it is a measurement, and nothing on it says which system does what.',
  docpic_2_tag: '412 rows, 31 columns',
  docpic_2_more: '403 more rows, 23 more columns',
  docpic_2_sub:
    'One row per application, one owner per row, and a cost centre. No row ' +
    'says which use cases ride it or what they would lose if it stopped.',
  docpic_3_tag: '22 drawings, three authors',
  docpic_3_sub:
    'The same systems, drawn by three people. One routes everything through ' +
    'the bus, one has no bus, and one adds a system the others leave out.',
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
  silo_exit_sub: 'rarely recorded as a figure',
  silo_tap: 'Tap each tile to see the methods behind it',
  silo_open: 'Methods',
  silo_methods_note: 'Each is sound on its own terms. None is keyed to a single use case.',
  // Three methods under each tile: what each is for, and where it stops.
  m_cost_1: 'FinOps', m_cost_1_for: 'Meters technology spend per unit of work: cloud, SaaS, data centre.', m_cost_1_stop: 'Keyed to accounts and tags, not use cases.',
  m_cost_2: 'TBM', m_cost_2_for: 'Allocates every IT cost to a tower and a service.', m_cost_2_stop: 'By rule, not by use case.',
  m_cost_3: 'IFRS 17', m_cost_3_for: 'For an insurer, allocates directly attributable costs, IT included, to groups of contracts.', m_cost_3_stop: 'By a systematic rule, not by use case.',
  m_risk_1: 'FAIR', m_risk_1_for: 'Estimates a loss as how often it happens times how much it costs.', m_risk_1_stop: 'Per scenario or asset, not per use case.',
  m_risk_2: 'Correlated-failure models', m_risk_2_for: 'Simulate an outage spreading across a dependency graph.', m_risk_2_stop: 'Per asset, weighted by importance, not per use case.',
  m_risk_3: 'The risk register', m_risk_3_for: 'Rates each risk high, medium or low.', m_risk_3_stop: 'A judgment, not a measurement.',
  m_exit_1: 'Switching-cost economics', m_exit_1_for: 'Counts what moving costs: learning, contracts, compatibility.', m_exit_1_stop: 'Studied per market, rarely recorded per use case.',
  m_exit_2: 'Real options', m_exit_2_for: 'Values the freedom to switch later.', m_exit_2_stop: 'Rarely applied to architecture, and its inputs are contested.',
  m_exit_3: 'Engineering estimates', m_exit_3_for: 'Size the work of a migration when one is planned.', m_exit_3_stop: 'Made once, for one move, then filed.',
  silo_ask_head: 'What a decision needs, for one use case',
  silo_ask: 'What it costs. What it risks. What leaving would cost.',
  silo_fail:
    'Each method is sound on its own terms. None is keyed to a single use ' +
    'case, so decisions often fall back on a colour.',

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
  dim_group: 'Map view',
  dim_2d: '2D',
  dim_3d: '3D',
  dim_2d_label: 'Flat map',
  dim_3d_label: '3D map',
  theme_dark: 'Dark',
  theme_light: 'Light',
  flow_legend_head: 'Where the work\'s value lands',
  flow_warm: 'reaches a customer',
  flow_mid: 'reaches an outside counterparty',
  flow_cool: 'stays inside the company',
  flow_width: 'width is work a month, not money',
  flow_declared: 'Declared by {owner}, {date}. Not a value figure.',
  canvas_gesture: 'Drag to look around. Scroll or pinch to zoom.',
  poke_useCases: 'Tap a dot to see what it does',
  poke_platforms: 'Tap a sphere to see what rides on it',
  poke_lines: 'Tap a line to see what it carries',
  poke_connectors: 'Tap a diamond to see what passes through it',
  poke_flow: 'Tap a line to see where its value lands',
  hint_rows: 'Tap a row to see it on the map',
  hint_toggle: 'Switch between the two shapes',
  hint_entries: 'Tap an entry to play it',
  book_title: 'The ledger, {name}',
  book_row_1: 'Entry one: what it costs',
  book_row_2: 'Entry two: what it risks',
  book_row_3: 'Entry three: what leaving would cost',
  book_note: 'Three entries per use case. They do not add.',
  // The book's rows, filled for whatever node is tapped.
  book_v_cost_p: 'USD {metered} metered, USD {pool} by rule',
  book_v_risk_p: '{riders} use cases can stop with it',
  book_v_exit_p: 'about USD {exec} of work to leave',
  book_v_cost_u: 'USD {reported} a month, all platforms',
  book_v_risk_u: 'about USD {p99} in a bad month',
  book_v_exit_u: '{platform}: about USD {exec} to leave, shared by {riders}',
  badge_meter_head: '{name}, the meter',
  badge_meter_units: '{units} {driver} a month',
  badge_meter_spend: 'USD {spend} metered, counted and billed',
  badge_pool_head: '{name}, the fixed pool',
  badge_pool_line: 'USD {pool} a month, used or not',
  badge_pool_sub: 'To be shared among the {riders} use cases riding it.',
  panel_allocated_label: 'Allocated by rule, not billed',
  basis_moved:
    'Changing the basis to {basis} moved {n} of {riders} figures on this ' +
    'node, the largest by USD {max} a month. Nothing was used differently.',
  basis_equal: 'This is the default, an equal split. Change the basis above to see which figures move.',
  basis_same: 'Under {basis} every figure on this node is what it was under an equal split.',
  reach_note:
    'The picture also takes down the {platforms} platforms these use cases ' +
    'share most, reaching {reached} more. An illustration of dependence, not ' +
    'a simulated month.',
  risk_band_note: 'Across the slider, from the stored runs at rho 0, 0.25, 0.5, 0.75 and 1.',
  risk_band_sum: 'Added up, across the slider',
  risk_band_joint: 'Together, across the slider',
  risk_band_value: 'about USD {lo} to USD {hi}',
  // The explorer's walkthrough: one node, six steps, the same rhythm as the story.
  walk_play: 'Walk me through it',
  walk_label: 'Walkthrough',
  recentre: 'Recentre',
  recentre_hint: 'Bring the whole map back into view',
  panel_resize: 'Resize the panel',
  panel_resize_hint: 'Drag to widen or narrow the panel. Double-click to reset.',
  walk_step: 'Step {k} of {n}',
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
    'Two parts. A meter on {driver}, USD {metered} a month, counted and ' +
    'billed. And a fixed pool of USD {pool} a month, licences and the team ' +
    'who run it. That is shared out among the riders by a rule: allocated, ' +
    'not billed.',
  walk_p_stops_h: 'When it stops',
  walk_p_stops:
    'Everything riding it is exposed: {riders} use cases across {n_sub} ' +
    'domains. About {lef} loss events a year, a typical one costing USD ' +
    '{loss} in direct damage. That direct loss is not in any bad-month ' +
    'figure, which counts only margin lost from stopped work. The wireframe ' +
    'nodes are the ones an outage reached.',
  walk_p_leaving_h: 'What leaving would cost',
  walk_p_leaving:
    'The work of leaving today is about USD {exec}: migration, rewiring, ' +
    'running two systems for a while. It belongs to the platform, not to any ' +
    'one use case. The ledger would replace it with two figures: work the ' +
    'commitment created, and choices it gave up. Both need the alternative ' +
    'on record, dated, and this estate has none.',
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
    'USD {reported} a month across all its platforms, of which USD {metered} ' +
    'was read off a meter. ' +
    'The rest is its share of each platform\'s pool under the current rule. ' +
    'It moves when the rule or the crowd moves, though it did nothing different.',
  walk_u_exit_h: 'What would strand it',
  walk_u_exit:
    'Leaving any of its {n_pf} platforms would strand it. The largest to ' +
    'leave is {platform}: about USD {exec} of work, shared by {riders} use ' +
    'cases.',
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
    'Across all its platforms it is told it costs USD {reported} a month. ' +
    'USD {metered} of that is metered. The rest is its share of pools it ' +
    'does not control.',
  desc_uc_risk:
    'Its biggest exposure is {worst}. When that is down, this is down ' +
    '{worst_pct} times in a hundred.',

  desc_ln_what:
    'This line joins {uc} to {platform}. {uc} cannot run without it.',
  desc_ln_flow:
    'Every month about {units} {driver} cross it, and USD {spend} goes with ' +
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
  panel_exec_note: 'An engineering estimate of the work of leaving today: migration effort, dual running, retraining.',
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
    'It costs USD {pool} a month whether anyone uses it or not, plus USD ' +
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
    tip: 'Each use case\u2019s bad month, added up, as if every worst month landed at once. A reference point, not a ceiling.',
  },
  work_of_leaving: {
    label: 'Work of leaving',
    tip: 'What leaving would take today: migration, rewiring, running both for a while. An engineering estimate, not a measurement.',
  },
  execution_component: {
    label: 'Work the commitment created',
    tip: 'The work of leaving minus what leaving the alternative would have cost. Needs that alternative on record.',
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
  // The two readings under each headline: the books, in the CFO's gold, and
  // the wiring, in the architects' blue.
  eyebrow_number: 'On the books',
  eyebrow_mechanism: 'In the wiring',

  // View 1, nothing selected.
  s1_head:
    '{n_platforms} shared platforms carry {n_uc} pieces of this business. The ' +
    'busiest, {top}, carries {top_riders} of them.',
  s1_number:
    'Every use case is charged part meter, part rule. Across these nodes the ' +
    'rule part runs from {c1_lo} to {c1_hi} percent.',
  s1_mechanism:
    'Each line into a node is a dependency. The more lines, the more work ' +
    'can stop when the node does.',

  // View 1, a platform selected.
  s1n_head:
    '{name} meters USD {metered} a month and hands out another USD {pool} ' +
    'by rule.',
  s1n_number:
    '{riders} use cases split that pool. {c1} percent of what they are told ' +
    'it costs was decided by a rule, not read off a meter.',
  s1n_mechanism:
    'If this node stops, up to {blast_uc} use cases across {blast_sub} ' +
    'subdomains can stop with it.',

  // View 1, a use case selected.
  s1u_head:
    '{name} rides {n_edges} shared nodes and is told it costs USD {reported} ' +
    'a month across all of them.',
  s1u_number:
    'USD {metered} of that is metered. The rest is its share of pools it ' +
    'does not control.',
  s1u_mechanism:
    'Its number moves when neighbours arrive or leave, without it doing ' +
    'anything different.',

  // View 2.
  s2_head:
    'USD {pool} a month on {name} is shared out by a rule, not a meter.',
  s2_number_idle:
    '{first} is told USD {base} for this platform alone. Add riders and that ' +
    'figure moves, though it uses nothing more.',
  s2_number_moved:
    'With {added} added, {first} is told USD {now} for this platform instead ' +
    'of USD {base}. It used nothing more.',
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
    'A bad month for {sub} looks like about USD {sum} measured one use case at ' +
    'a time. Taken together it is about USD {joint}.',
  s3_mechanism:
    'The first figure assumes every use case has its worst month at once. ' +
    'Measured together, the worst months do not all coincide.',

  // View 4.
  s4_head:
    'By month {ratified}, when {name} was ratified, {n} use cases already ' +
    'depended on it.',
  s4_number:
    'Leaving would already have taken about USD {exec} of work. Its two ' +
    'parts, work created and choices given up, need the alternative on record.',
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
    'A bad month for {sub} runs about USD {left} on one side and about USD ' +
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
    'Under {basis}, {changed} reported figures moved by up to USD {max} a ' +
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
