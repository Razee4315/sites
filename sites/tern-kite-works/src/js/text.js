// Text and picture reveals. Words are wrapped once; everything after that is transform and opacity.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $$, reduced } from './env.js'

// "A kite is" -> <span class="w"><i>A</i></span> <span class="w"><i>kite</i></span> ...
// Inline tags (em) are kept, so italics and colour survive the split.
export function splitWords(el) {
  const out = []
  const walk = (node, parent) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const parts = child.textContent.split(/(\s+)/)
        const frag = document.createDocumentFragment()
        for (const part of parts) {
          if (!part) continue
          if (/^\s+$/.test(part)) {
            frag.append(' ')
            continue
          }
          const w = document.createElement('span')
          w.className = 'w'
          const i = document.createElement('i')
          i.textContent = part
          w.append(i)
          frag.append(w)
          out.push(i)
        }
        parent.replaceChild(frag, child)
      } else if (child.nodeType === 1 && child.tagName !== 'BR') {
        walk(child, child)
      }
    }
  }
  walk(el, el)
  return out
}

export function initText() {
  // headings: words rise out of their own baseline
  $$('[data-split]').forEach((el) => {
    const words = splitWords(el)
    el._words = words
    if (reduced || el.dataset.split === 'intro') return
    gsap.set(words, { yPercent: 118, rotate: 5, transformOrigin: '0% 100%' })
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, rotate: 0, duration: 1.25, ease: 'expo.out', stagger: 0.055 }),
    })
  })

  if (reduced) return

  // paragraphs and small things: a short lift
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.09, overwrite: true }),
  })
  gsap.set('[data-reveal]', { y: 34, opacity: 0 })

  // pictures: a blind is drawn up while the print settles behind it
  $$('[data-mask]').forEach((mask) => {
    const img = mask.querySelector('img')
    const inner = document.createElement('div')
    inner.style.cssText = 'position:absolute;inset:0;overflow:hidden;will-change:transform'
    img.replaceWith(inner)
    inner.append(img)
    gsap.set(inner, { yPercent: 101 })
    gsap.set(img, { yPercent: -101, scale: 1.3 })
    ScrollTrigger.create({
      trigger: mask,
      start: 'top 86%',
      once: true,
      onEnter: () => {
        gsap.to(inner, { yPercent: 0, duration: 1.5, ease: 'expo.inOut' })
        gsap.to(img, { yPercent: 0, duration: 1.5, ease: 'expo.inOut' })
        gsap.to(img, { scale: 1.12, duration: 2.2, ease: 'expo.out', delay: 0.2 })
      },
    })
    // and it keeps drifting a little inside its frame as you pass
    gsap.fromTo(
      img,
      { y: '-4%' },
      { y: '4%', ease: 'none', scrollTrigger: { trigger: mask, start: 'top bottom', end: 'bottom top', scrub: true }, immediateRender: false },
    )
  })

  // loose things: tools on the bench, prints on the page
  $$('[data-par-y]').forEach((el) => {
    const y = Number(el.dataset.parY)
    const r = Number(el.dataset.parR || 0)
    gsap.fromTo(
      el,
      { yPercent: -y, rotation: -r / 2 },
      { yPercent: y, rotation: r / 2, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
    )
  })

  // numbers that count themselves
  $$('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count)
    if (!to) return
    const v = { n: 0 }
    el.textContent = '0'
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(v, { n: to, duration: 1.8, ease: 'expo.out', onUpdate: () => (el.textContent = Math.round(v.n)) }),
    })
  })
}
