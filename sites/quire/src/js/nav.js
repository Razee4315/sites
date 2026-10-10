import { gsap, ScrollTrigger, $, $$, scrollTo, lockScroll, reduce } from './util.js'

export function initNav() {
  const nav = $('#nav')
  const menu = $('#menu')
  const burger = $('.nav__burger')
  const sheet = $('.menu__sheet')

  // in-page links glide; "Season" lands on the first production rather than on the closed sheet
  const landing = (hash) => {
    if (hash === '#top') return 0
    const el = $(hash)
    if (!el) return null
    if (hash === '#season') return el.offsetTop + innerHeight * 1.78
    if (hash === '#cast' || hash === '#seats' || hash === '#house' || hash === '#workshop') return el
    return el
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a) return
    const to = landing(a.getAttribute('href'))
    if (to == null) return
    e.preventDefault()
    if (menu.classList.contains('is-open')) toggle(false)
    scrollTo(to, { duration: 1.6 })
    history.replaceState(null, '', a.getAttribute('href') === '#top' ? location.pathname : a.getAttribute('href'))
  })

  // hide going down, return going up
  let last = 0
  addEventListener('scroll', () => {
    const y = scrollY
    if (Math.abs(y - last) < 6) return
    nav.classList.toggle('is-away', y > last && y > innerHeight * 0.8 && !menu.classList.contains('is-open'))
    last = y
  }, { passive: true })

  // which section are we in
  const links = $$('.nav__links a')
  links.forEach((a) => {
    const el = $(a.getAttribute('href'))
    if (!el) return
    ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => a.classList.toggle('is-here', self.isActive),
    })
  })

  // phone menu: the sheet folds down from the top edge
  let tl = null
  function toggle(open) {
    burger.setAttribute('aria-expanded', String(open))
    menu.classList.toggle('is-open', open)
    lockScroll(open)
    tl?.kill()
    if (open) {
      menu.hidden = false
      tl = gsap.timeline()
      if (reduce) return tl.fromTo(sheet, { opacity: 0 }, { opacity: 1, duration: 0.2 })
      tl.fromTo(sheet, { rotationX: -92 }, { rotationX: 0, duration: 0.85, ease: 'expo.out' })
        .fromTo($$('.menu__links span', menu), { yPercent: 105 }, { yPercent: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out' }, 0.2)
        .fromTo($$('.menu__links i, .menu__foot', menu), { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.04 }, 0.4)
      $('.menu__links a', menu).focus({ preventScroll: true })
    } else {
      tl = gsap.timeline({ onComplete: () => (menu.hidden = true) })
      tl.to(sheet, reduce ? { opacity: 0, duration: 0.2 } : { rotationX: -92, duration: 0.5, ease: 'power3.in' })
    }
  }
  burger.addEventListener('click', () => toggle(burger.getAttribute('aria-expanded') !== 'true'))
  addEventListener('keydown', (e) => e.key === 'Escape' && menu.classList.contains('is-open') && (toggle(false), burger.focus()))
  matchMedia('(min-width: 861px)').addEventListener('change', (e) => e.matches && menu.classList.contains('is-open') && toggle(false))
}
