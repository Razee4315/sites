import gsap from 'gsap'
import { $, $$, reduced } from './util.js'

// The statement is read by scrolling: each word (and each little cut-out) lights as it reaches the eye line.
export function initManifesto() {
  const el = $('.js-words')
  if (!el || reduced) return

  const wrap = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment()
        n.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return
          if (/^\s+$/.test(tok)) return frag.append(' ')
          const s = document.createElement('span')
          s.className = 'w'
          s.textContent = tok
          frag.append(s)
        })
        n.replaceWith(frag)
      } else if (n.classList?.contains('inl')) n.classList.add('w')
      else wrap(n)
    })
  }
  wrap(el)

  const words = $$('.w', el)
  gsap.to(words, {
    opacity: 1,
    ease: 'none',
    stagger: 0.5,
    duration: 1.4,
    scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: true },
  })
  // the cut-outs turn a little as they pass
  $$('.inl img', el).forEach((img, i) =>
    gsap.fromTo(img, { rotation: i % 2 ? 14 : -14, y: 10 }, { rotation: i % 2 ? -8 : 8, y: -6, ease: 'none', scrollTrigger: { trigger: img, start: 'top 95%', end: 'bottom 20%', scrub: true } }),
  )
}
