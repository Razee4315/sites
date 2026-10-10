// Seats: pick a night, pick sheets, get a ticket. Nothing leaves the page.
import { gsap, ScrollTrigger, $, $$, reduce, scrollTo } from './util.js'
import { productions, nights, PRICE } from './data.js'

const byId = Object.fromEntries(productions.map((p) => [p.id, p]))
const fmtDay = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const fmtDow = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' })
const fmtLong = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const words = ['No', 'One', 'Two', 'Three', 'Four']
const MAX = 4

// which sheets are already gone on a given night: fixed by the date, so it never changes between visits
function gone(night) {
  let s = [...night.date].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7)
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
  const want = night.tag === 'First night' ? 17 : night.tag?.startsWith('Last') ? 21 : 6 + Math.floor(rnd() * 9)
  const set = new Set()
  while (set.size < want) set.add(1 + Math.floor(rnd() * 24))
  return set
}

export function initSeats() {
  const section = $('#seats')
  const list = $('#nights')
  const plan = $('#plan')
  const sum = $('#book-sum')
  const form = $('#book')
  const stub = $('#stub')
  let night = nights[0]
  let taken = gone(night)
  const mine = new Set()

  list.innerHTML = nights
    .map((n, i) => {
      const p = byId[n.p]
      const d = new Date(`${n.date}T00:00:00Z`)
      return `<button class="night" type="button" role="radio" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}" style="--nb:${p.theme.bg === '#161312' ? '#2a211c' : p.theme.bg};--no:${p.theme.ink};--na:${p.theme.accent}">
        <span class="night__date">${fmtDay.format(d)}<small>${fmtDow.format(d)} · ${n.time}</small></span>
        <span class="night__what"><span class="night__opera">${p.title.join(' ')}</span><span class="night__tag">${n.tag || p.english}</span></span>
        <span class="night__left"><b>${24 - gone(n).size}</b>left</span>
      </button>`
    })
    .join('')
  const rows = $$('.night', list)

  plan.innerHTML = Array.from({ length: 24 }, (_, i) => `<button class="sheet" type="button" data-n="${i + 1}" aria-pressed="false">${i + 1}</button>`).join('')
  const seats = $$('.sheet', plan)

  function paint() {
    const p = byId[night.p]
    section.style.setProperty('--pc', p.theme.accent)
    section.style.setProperty('--pb', p.theme.bg === '#161312' ? '#2a211c' : p.theme.bg)
    section.style.setProperty('--po', p.theme.ink)
    seats.forEach((b) => {
      const n = Number(b.dataset.n)
      const isGone = taken.has(n)
      b.disabled = isGone
      b.setAttribute('aria-pressed', String(mine.has(n)))
      b.setAttribute('aria-label', `Sheet ${n}${isGone ? ', gone' : mine.has(n) ? ', yours' : ', free'}`)
    })
    const k = mine.size
    sum.innerHTML = k
      ? `<b>${words[k]} sheet${k > 1 ? 's' : ''}</b> for ${p.title.join(' ')}, ${fmtDay.format(new Date(`${night.date}T00:00:00Z`))} — €${k * PRICE} at the door.`
      : 'No sheets chosen yet. Up to four.'
  }

  function choose(i, { focus = false, flutter = true } = {}) {
    night = nights[i]
    taken = gone(night)
    mine.clear()
    rows.forEach((r, k) => {
      r.setAttribute('aria-checked', String(k === i))
      r.tabIndex = k === i ? 0 : -1
    })
    if (focus) rows[i].focus()
    paint()
    // the plan re-deals itself
    if (flutter && !reduce) deal({ y: 10, opacity: 0 }, { duration: 0.5, stagger: 0.012 })
  }

  // deal the sheets out. CSS transitions on the seats are switched off while GSAP is moving them.
  function deal(from, opts) {
    plan.classList.add('is-dealing')
    return gsap.fromTo(seats, from, {
      y: 0,
      opacity: 1,
      rotation: 0,
      ease: 'power3.out',
      overwrite: true,
      clearProps: 'transform,opacity',
      onComplete: () => plan.classList.remove('is-dealing'),
      ...opts,
    })
  }

  rows.forEach((r, i) => {
    r.addEventListener('click', () => choose(i))
    r.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
      if (!d) return
      e.preventDefault()
      choose((i + d + rows.length) % rows.length, { focus: true })
    })
  })

  plan.addEventListener('click', (e) => {
    const b = e.target.closest('.sheet')
    if (!b || b.disabled) return
    const n = Number(b.dataset.n)
    if (mine.has(n)) mine.delete(n)
    else if (mine.size < MAX) mine.add(n)
    else {
      sum.textContent = 'Four sheets is the most we can hold for one name.'
      if (!reduce) gsap.fromTo(b, { x: -5 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)', clearProps: 'transform' })
      return
    }
    paint()
  })

  // a production's "Take a sheet" button preselects its first night
  document.addEventListener('quire:pick', (e) => {
    const i = nights.findIndex((n) => n.p === e.detail)
    if (i >= 0) choose(i, { flutter: false })
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const name = $('#f-name')
    const mail = $('#f-mail')
    const errs = {
      name: name.value.trim().length < 2 ? 'We need a name to write on the envelope.' : '',
      mail: /^\S+@\S+\.\S+$/.test(mail.value.trim()) ? '' : 'That does not look like an address.',
    }
    $('#e-name').textContent = errs.name
    $('#e-mail').textContent = errs.mail
    name.setAttribute('aria-invalid', String(!!errs.name))
    mail.setAttribute('aria-invalid', String(!!errs.mail))
    if (!mine.size) {
      sum.textContent = 'Choose at least one sheet first.'
      if (!reduce) gsap.fromTo(plan, { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.3)' })
      return
    }
    if (errs.name) return name.focus()
    if (errs.mail) return mail.focus()

    const p = byId[night.p]
    $('#t-opera').textContent = p.title.join(' ')
    $('#t-when').textContent = `${fmtLong.format(new Date(`${night.date}T00:00:00Z`))}, ${night.time}`
    $('#t-name').textContent = name.value.trim()
    $('#t-seats').textContent = [...mine].sort((a, b) => a - b).join(' · ')
    stub.hidden = false
    const ticket = $('#ticket')
    if (!reduce) {
      gsap.fromTo(ticket, { yPercent: -104 }, { yPercent: 0, duration: 1.5, ease: 'steps(14)' })
      gsap.fromTo($$('.stub__note, #stub-again'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, delay: 1.3 })
    }
    scrollTo(stub, { offset: -innerHeight * 0.18, duration: 1.1 })
    ticket.focus({ preventScroll: true })
  })

  $('#stub-again').addEventListener('click', () => {
    stub.hidden = true
    mine.clear()
    paint()
    scrollTo($('.seats__nights'), { offset: -100, duration: 1 })
    rows.find((r) => r.getAttribute('aria-checked') === 'true')?.focus({ preventScroll: true })
  })

  paint()
  if (!reduce) {
    gsap.from(rows, { opacity: 0, x: -20, duration: 0.8, stagger: 0.04, scrollTrigger: { trigger: list, start: 'top 82%', once: true } })
    gsap.set(seats, { opacity: 0 })
    ScrollTrigger.create({ trigger: plan, start: 'top 85%', once: true, onEnter: () => deal({ opacity: 0, y: 18, rotation: -6 }, { duration: 0.7, stagger: 0.018 }) })
  }
}
