import gsap from 'gsap'
import { $, $$, reduced } from './util.js'

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

// Twelve places are laid as the fonts and the first paintings arrive.
export function runLoader() {
  return new Promise((resolve) => {
    const el = $('.loader')
    if (!el) return resolve()
    const places = $$('.loader__places li')
    const count = $('.js-loader-n')
    const critical = [...$$('.hero img'), $('.supper__state')].filter(Boolean)
    const total = critical.length + 1
    let loaded = 0
    let shown = 0

    const bump = () => loaded++
    critical.forEach((img) => {
      if (img.complete) return bump()
      img.addEventListener('load', bump, { once: true })
      img.addEventListener('error', bump, { once: true })
    })
    document.fonts.ready.then(bump)
    const bail = setTimeout(() => (loaded = total), 7000)

    const exit = () => {
      clearTimeout(bail)
      if (reduced) {
        el.remove()
        return resolve()
      }
      gsap
        .timeline({ onComplete: () => el.remove() })
        .to('.loader__inner', { y: -40, opacity: 0, duration: 0.6, ease: 'power2.in' })
        .add(resolve, 0.45)
        .to(el, { yPercent: -100, duration: 1.15, ease: 'expo.inOut' }, 0.4)
    }

    count.textContent = ROMAN[0]
    const step = setInterval(() => {
      const target = Math.floor((loaded / total) * 12)
      if (shown < target) {
        places[shown].classList.add('is-set')
        shown++
        count.textContent = ROMAN[shown]
      }
      if (shown >= 12) {
        clearInterval(step)
        setTimeout(exit, 380)
      }
    }, reduced ? 20 : 105)
  })
}
