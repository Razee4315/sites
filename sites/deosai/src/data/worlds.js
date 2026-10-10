// The seven worlds, in the order the visitor walks through them.
export const WORLDS = {
  plants: { n: 'I', kicker: 'Plants', title: 'The Turf', lede: 'No trees. Nothing here grows much taller than your boot, and all of it has to finish its year between two snowfalls.' },
  flowers: { n: 'II', kicker: 'Flowers', title: 'The Bloom', lede: 'For a few weeks in July and August the plateau stops being green and tries every other colour instead.' },
  animals: { n: 'III', kicker: 'Animals', title: 'The Residents', lede: 'A bear that was nearly gone, a marmot that is everywhere, and a great many things with wings.' },
  water: { n: 'IV', kicker: 'Lakes & rivers', title: 'The Mirror', lede: 'All that snow has to go somewhere. For a while it stops here, lies flat, and shows the sky to itself.' },
  fish: { n: 'V', kicker: 'Fish', title: 'Under the Mirror', lede: 'Water that was snow last week. Exactly three kinds of fish have worked out how to live in it.' },
  mountains: { n: 'VI', kicker: 'Mountains', title: 'The Rim', lede: 'The plateau is flat. Everything around it is not. Stand at the right edge and the ninth-highest mountain on Earth is the view.' },
  sky: { n: 'VII', kicker: 'Sky', title: 'The Roof', lede: 'At four thousand metres there is less air above you, less dust in it, and no town for it to carry the light of.' },
}
export const ORDER = Object.keys(WORLDS)
