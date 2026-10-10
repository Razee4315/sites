import '@fontsource-variable/big-shoulders-stencil/opsz.css'
import '@fontsource-variable/bodoni-moda/opsz.css'
import '@fontsource-variable/bodoni-moda/opsz-italic.css'
import '@fontsource-variable/instrument-sans/wdth.css'
import '@fontsource-variable/instrument-sans/wdth-italic.css'
import './styles/base.css'
import './styles/theatre.css'
import './styles/sections.css'
import './styles/seats.css'

import { initScroll, hydrate, ScrollTrigger } from './js/util.js'
import { initTheatre } from './js/theatre.js'
import { initNav } from './js/nav.js'
import { initSections } from './js/sections.js'
import { initAnatomy } from './js/anatomy.js'
import { initCast } from './js/cast.js'
import { initSeats } from './js/seats.js'

// Arriving with a #hash (or mid-page after a reload) skips the opening and goes straight there.
const deep = location.hash.length > 1 && location.hash !== '#top'
if (!deep) {
  history.scrollRestoration = 'manual'
  scrollTo(0, 0)
}

initScroll()
hydrate()
const theatre = initTheatre()
initNav()
initAnatomy()
initCast()
initSeats()
initSections()

theatre.start({ instant: deep }).then(() => {
  ScrollTrigger.refresh()
  if (deep) document.querySelector(location.hash)?.scrollIntoView()
})

// late-loading images change section heights; keep the scroll maths honest
addEventListener('load', () => ScrollTrigger.refresh())
