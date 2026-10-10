import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, reduced, fine } from './util.js'

export function initChrome(ctx) {
  grain()
  nav(ctx)
  if (fine && !reduced) cursor()
  reveals()
  lines()
}

/* a tile of film grain, drawn once */
function grain() {
  const c = document.createElement('canvas')
  c.width = c.height = 220
  const g = c.getContext('2d')
  const d = g.createImageData(220, 220)
  // light and dark specks with a little alpha each: reads as grain without a blend mode
  for (let i = 0; i < d.data.length; i += 4) {
    const light = Math.random() > 0.5
    d.data[i] = d.data[i + 1] = d.data[i + 2] = light ? 255 : 0
    d.data[i + 3] = Math.random() * (light ? 20 : 34)
  }
  g.putImageData(d, 0, 0)
  $('.grain').style.backgroundImage = `url(${c.toDataURL('image/png')})`
}

function nav({ lenis }) {
  const bar = $('.nav')
  const burger = $('.nav__burger')
  const menu = $('.menu')
  const links = $$('.nav__links a')

  // colour follows the section under the bar
  $$('[data-theme]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: () => `top ${bar.offsetHeight / 2}px`,
      end: () => `bottom ${bar.offsetHeight / 2}px`,
      onToggle: (self) => self.isActive && bar.classList.toggle('is-light', sec.dataset.theme === 'light'),
    })
  })

  // tuck away going down, return going up
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      if (bar.classList.contains('menu-open')) return
      bar.classList.toggle('is-away', self.direction === 1 && self.scroll() > 240)
      bar.classList.toggle('is-scrolled', self.scroll() > innerHeight * 0.6)
    },
  })
  bar.addEventListener('focusin', () => bar.classList.remove('is-away'))

  // which section are we in
  const ids = ['#supper', '#inventory', '#house', '#past']
  const ends = { '#supper': '.supper-foot' }
  ids.forEach((id) => {
    const link = links.find((a) => a.getAttribute('href') === id)
    ScrollTrigger.create({
      trigger: id,
      endTrigger: ends[id] || id,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => link.classList.toggle('is-here', self.isActive),
    })
  })

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open)
    bar.classList.toggle('menu-open', open)
    bar.classList.remove('is-away')
    burger.setAttribute('aria-expanded', String(open))
    menu.setAttribute('aria-hidden', String(!open))
    $('.nav__burger-label').textContent = open ? 'Close' : 'Menu'
    if (open) lenis?.stop()
    else lenis?.start()
    document.documentElement.style.overflow = open ? 'hidden' : ''
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'))
  menu.addEventListener('click', (e) => e.target.closest('a') && setMenu(false))
  addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false))
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => e.matches && setMenu(false))
}

/* a lemon-pip cursor with a ring that carries a one-word label over things you can play with */
function cursor() {
  const root = $('.cursor')
  const dot = $('.cursor__dot')
  const ring = $('.cursor__ring')
  const label = $('.cursor__label')
  document.documentElement.classList.add('has-cursor')
  root.classList.add('is-hidden')

  const dx = gsap.quickSetter(dot, 'x', 'px')
  const dy = gsap.quickSetter(dot, 'y', 'px')
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' })
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' })

  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return
    root.classList.remove('is-hidden')
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY)
    const t = e.target.closest?.('[data-cursor]')
    const link = e.target.closest?.('a, button, label, input, [role="slider"]')
    if (t) label.textContent = t.dataset.cursor
    root.classList.toggle('is-label', !!t)
    root.classList.toggle('on-light', e.target.closest?.('[data-theme]')?.dataset.theme === 'light')
    root.classList.toggle('is-link', !t && !!link)
  }, { passive: true })
  addEventListener('pointerdown', () => root.classList.add('is-down'))
  addEventListener('pointerup', () => root.classList.remove('is-down'))
  document.addEventListener('pointerleave', () => root.classList.add('is-hidden'))
  document.documentElement.addEventListener('mouseleave', () => root.classList.add('is-hidden'))
}

/* things that rise into place when they enter the viewport */
function reveals() {
  const groups = [
    ['.reveal', 0],
    ['.step', 0.12],
    ['.rule', 0.07],
    ['.ba-card', 0],
    ['.lot', 0],
  ]
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }),
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  )
  groups.forEach(([sel, stagger]) =>
    $$(sel).forEach((el) => {
      if (stagger) el.style.setProperty('--d', `${[...el.parentElement.children].indexOf(el) * stagger}s`)
      io.observe(el)
    }),
  )
}

/* split .js-lines headings into masked lines, re-split when the width changes */
function lines() {
  if (reduced) return
  const heads = $$('.js-lines')
  heads.forEach((h) => (h.dataset.src = h.innerHTML))

  const split = (h) => {
    h.innerHTML = h.dataset.src
    // wrap every word, keeping <em> and <br>
    const wrap = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment()
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return
            if (/^\s+$/.test(tok)) return frag.append(' ')
            const s = document.createElement('span')
            s.className = 'wd'
            s.style.display = 'inline-block'
            s.textContent = tok
            frag.append(s)
          })
          n.replaceWith(frag)
        } else if (n.nodeName !== 'BR') wrap(n)
      })
    }
    wrap(h)
    const rows = []
    let top = null
    $$('.wd', h).forEach((w) => {
      const t = Math.round(w.getBoundingClientRect().top)
      if (top === null || Math.abs(t - top) > 6) { rows.push([]); top = t }
      rows[rows.length - 1].push(w)
    })
    const html = rows
      .map((row) => {
        const inner = row.map((w) => (w.closest('em') ? `<em>${w.textContent}</em>` : w.textContent)).join(' ').replace(/<\/em> <em>/g, ' ')
        return `<span class="ln"><span class="ln__in">${inner}</span></span>`
      })
      .join('')
    h.innerHTML = html
    return $$('.ln__in', h)
  }

  heads.forEach((h) => {
    let parts = split(h)
    let shown = false
    gsap.set(parts, { yPercent: 112 })
    ScrollTrigger.create({
      trigger: h,
      start: 'top 86%',
      once: true,
      onEnter: () => {
        shown = true
        gsap.to(parts, { yPercent: 0, duration: 1.35, ease: 'expo.out', stagger: 0.1 })
      },
    })
    let w = innerWidth
    addEventListener('resize', () => {
      if (innerWidth === w) return
      w = innerWidth
      parts = split(h)
      gsap.set(parts, { yPercent: shown ? 0 : 112 })
    })
  })
}
