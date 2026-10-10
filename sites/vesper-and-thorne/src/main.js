// Vesper & Thorne, bellfounders. An invented foundry; a design study.
import './styles/fonts.css'
import '@fontsource-variable/newsreader/opsz.css'
import '@fontsource-variable/newsreader/opsz-italic.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'

import './styles/base.css'
import './styles/chrome.css'
import './styles/hero.css'
import './styles/fire.css'
import './styles/voice.css'
import './styles/world.css'

import { ScrollTrigger, startScroll, env } from './lib/core.js'
import { initReveals } from './lib/reveal.js'
import { initGate, initNav, initCursor, initMagnets } from './sections/chrome.js'
import { initHero } from './sections/hero.js'
import { initPour, initAges, initVoice } from './sections/foundry.js'
import { initRing } from './sections/ring.js'
import { initVista, initWorks, initCast, initDrift, initCommission, initFoot } from './sections/world.js'

document.documentElement.classList.add('js')
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

async function boot() {
  startScroll()
  const entered = initGate()
  // type must be in before anything is measured or split into lines
  await document.fonts.ready
  await Promise.all(
    ['400 1em "VT Display"', 'italic 400 1em "VT Display"', '1em "Newsreader Variable"', '1em "IBM Plex Mono"'].map((f) =>
      document.fonts.load(f, 'Aa 0123').catch(() => {}),
    ),
  )

  initNav()
  const enterHero = initHero()
  initReveals()
  initPour()
  initAges()
  initVoice()
  initRing()
  initVista()
  initWorks()
  initCast()
  initDrift()
  initCommission()
  initFoot()
  initCursor()
  initMagnets()

  ScrollTrigger.refresh()
  window.addEventListener('load', () => ScrollTrigger.refresh())

  const how = await entered
  enterHero(how)

  // deep links, once the gate is out of the way
  if (location.hash.length > 1 && (how.instant || env.reduce)) {
    const el = document.querySelector(location.hash)
    if (el) requestAnimationFrame(() => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY))
  }
}
boot()
