// Everything below the stage that is not its own module: reveals, photographs, the workshop steps,
// the silhouettes and the footer.
import { gsap, ScrollTrigger, SplitText, $, $$, pad2, reduce, img, fontsReady } from './util.js'
import { people, productions } from './data.js'
import { buildScene, loadScene } from './stage.js'
import { glyphMetrics, widthOf, setLine, sheetSVG } from './cutout.js'

export function initSections() {
  buildPeople()
  reveals()
  photos()
  counts()
  making()
  footer()
}

function buildPeople() {
  $('#people').innerHTML = people
    .map((p) => {
      const m = img(p.img)
      return `<li class="who" tabindex="0" data-rise>
        <div class="who__mat"><img src="${m.src}" width="${m.w}" height="${m.h}" loading="lazy" decoding="async" alt="Cut-paper silhouette of ${p.name}, in profile"></div>
        <h3 class="who__name">${p.name}</h3>
        <p class="label who__role">${p.role}</p>
        <p class="who__line">${p.line}</p>
      </li>`
    })
    .join('')
}

function reveals() {
  if (reduce) return

  // small things rise as they arrive; neighbours arriving together are staggered
  gsap.set('[data-rise]', { opacity: 0, y: 26 })
  ScrollTrigger.batch('[data-rise]', {
    start: 'top 90%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out', overwrite: true }),
  })

  // long serif statements: line by line from behind a mask
  fontsReady().then(() => {
    for (const el of $$('[data-lines]')) {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'sl',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 112,
            duration: 1.15,
            stagger: 0.085,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 84%', once: true },
          }),
      })
    }

    // stencil headings: every letter tips up into place
    for (const el of $$('[data-chars]')) {
      const split = SplitText.create(el, { type: 'lines,chars', mask: 'lines', linesClass: 'sl' })
      gsap.from(split.chars, {
        yPercent: 112,
        rotation: 7,
        transformOrigin: '0% 100%',
        duration: 1.1,
        stagger: { amount: 0.38 },
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      })
    }
    ScrollTrigger.refresh()
  })

  // loose objects on the bench drift at their own speed
  for (const el of $$('[data-drift]')) {
    gsap.fromTo(el, { y: -Number(el.dataset.drift) }, { y: Number(el.dataset.drift), ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
  }
  for (const el of $$('.step__obj')) {
    gsap.fromTo(el, { y: 70, rotation: -5 }, { y: -70, rotation: 5, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
  }
}

// photographs: a sheet of paper slides off, and the picture drifts inside its window
function photos() {
  for (const fig of $$('[data-photo]')) {
    const box = $('.photo', fig)
    const pic = $('img', box)
    if (reduce) continue
    const cover = document.createElement('i')
    cover.className = 'photo__cover'
    box.append(cover)
    gsap.to(cover, { yPercent: -101, duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: box, start: 'top 82%', once: true } })
    gsap.fromTo(pic, { yPercent: -13.5 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } })
    gsap.from($('.cap', fig), { opacity: 0, y: 12, duration: 0.9, scrollTrigger: { trigger: box, start: 'bottom 96%', once: true } })
  }
}

function counts() {
  for (const el of $$('[data-count]')) {
    const end = Number(el.dataset.count)
    if (reduce) continue
    const o = { v: 0 }
    el.textContent = '0'
    gsap.to(o, {
      v: end,
      duration: 1.6,
      ease: 'power2.out',
      snap: { v: 1 },
      onUpdate: () => (el.textContent = o.v),
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    })
  }
}

// the workshop: four photographs of the same sheet, pixel-aligned, cross-faded as the steps go by
function making() {
  const frames = $$('#make-frame img')
  const steps = $$('#steps .step')
  const n = $('#make-n')
  const set = (i) => {
    frames.forEach((f, k) => f.classList.toggle('is-on', k <= i))
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i))
    n.textContent = pad2(i + 1)
  }
  set(0)
  steps.forEach((step, i) => {
    ScrollTrigger.create({ trigger: step, start: 'top 58%', end: 'bottom 58%', onToggle: (self) => self.isActive && set(i) })
  })
  gsap.to('#make-bar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 58%', end: 'bottom 58%', scrub: 0.3 } })
}

function footer() {
  const form = $('#news')
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const input = $('#n-mail')
    const ok = /^\S+@\S+\.\S+$/.test(input.value.trim())
    $('#news-msg').textContent = ok ? 'Noted. (This house is imaginary, so nothing was sent.)' : 'That does not look like an address.'
    if (ok) input.value = ''
    else input.focus()
  })
  footMark()
}

// The wordmark once more, the full width of the page, cut through to the last scene of the season:
// the page opened on a paper night and closes on a paper morning.
function footMark() {
  const mark = $('#foot-mark')
  const sceneBox = $('#foot-scene')
  const prod = productions.find((p) => p.id === 'vx')
  const wideStage = {
    ...prod,
    layers: {
      far: { minw: '104cqw', b: '2cqh' },
      flown: { w: '62cqw', top: '-8cqh', x: '6cqw' },
      'wing-l': { h: '150cqh', show: '20cqw' },
      'wing-r': { h: '150cqh', show: '18cqw' },
      hero: { h: '62cqh', x: '37%', b: '4cqh' },
      front: { minw: '104cqw', b: '-58cqh' },
    },
  }
  const scene = buildScene(wideStage, { fixed: true })
  sceneBox.append(scene)

  function build() {
    const w = mark.clientWidth
    if (w < 120) return
    const gut = parseFloat(getComputedStyle(sceneBox).left) || 16
    const { cap } = glyphMetrics()
    const fs = (w - gut * 2 - 4) / widthOf('QUIRE')
    const pad = fs * 0.05
    const h = Math.round(cap * fs + pad + fs * 0.17) // room underneath for the tail of the Q
    mark.style.setProperty('--mh', `${h}px`)
    $('#foot-sheet').innerHTML = sheetSVG({ k: 'f', w, h, fs, rows: [setLine('QUIRE', gut + 2, pad + cap * fs, fs)] })
  }
  fontsReady().then(() => {
    build()
    ScrollTrigger.refresh()
  })
  let lastW = innerWidth
  addEventListener('resize', () => {
    if (innerWidth === lastW) return
    lastW = innerWidth
    build()
  })

  ScrollTrigger.create({ trigger: mark, start: 'top 250%', once: true, onEnter: () => loadScene(scene) })
  ScrollTrigger.create({ trigger: mark, start: 'top bottom', end: 'bottom top', onToggle: (self) => scene.classList.toggle('is-live', self.isActive) })
  if (reduce) return
  // each sheet drifts by its depth as the footer scrolls into view
  const depth = { back: 0.25, far: 0.6, flown: 1.6, 'wing-l': 1.1, 'wing-r': 1.1, hero: 1.4, front: 2 }
  for (const ly of $$('.ly', scene)) {
    const d = depth[ly.dataset.kind]
    gsap.fromTo(ly.firstElementChild, { yPercent: d * 5, x: -d * 14 }, { yPercent: 0, x: d * 6, ease: 'none', scrollTrigger: { trigger: mark, start: 'top bottom', end: 'bottom bottom', scrub: 0.5 } })
  }
}
