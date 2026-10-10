import gsap from 'gsap'
import { $, $$, reduced } from './util.js'
import images from '../data/images.json'

const PRICE = 240
const NIGHTS = {
  42: { date: 'Sat. 14 November', taken: [1, 2, 4, 5, 8, 10, 11] },
  43: { date: 'Sat. 12 December', taken: [3, 6, 9] },
  44: { date: 'Sat. 16 January', taken: [] },
}
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']

// Twelve plates seen from above. A napkin is somebody else's; a lemon is yours.
export function initReserve() {
  const form = $('.reserve__form')
  if (!form) return
  const rows = [$('.tabletop__row--a', form), $('.tabletop__row--b', form)]
  const img = (id) => `<img src="${import.meta.env.BASE_URL}img/${id}.webp" width="${images[id].w}" height="${images[id].h}" alt="" loading="lazy" draggable="false">`

  const seats = Array.from({ length: 12 }, (_, i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'seat'
    b.dataset.seat = i + 1
    b.innerHTML = `<span class="seat__plate">${img('plate-1')}${img('plate-2')}${img('plate-3')}</span><span class="seat__n">${i + 1}</span>`
    rows[i < 6 ? 0 : 1].append(b)
    return b
  })

  let night = '42'
  let mine = new Set()

  const paint = (b, state) => {
    const n = b.dataset.seat
    b.dataset.state = state
    b.dataset.cursor = state === 'taken' ? 'Taken' : state === 'mine' ? 'Yours' : 'Sit'
    b.setAttribute('aria-pressed', String(state === 'mine'))
    b.setAttribute('aria-disabled', String(state === 'taken'))
    b.setAttribute('aria-label', `Chair ${n}, ${state === 'taken' ? 'taken' : state === 'mine' ? 'yours' : 'free'}`)
  }
  const total = () => {
    const n = mine.size
    $('.js-chairs', form).textContent = n ? `${WORDS[n]} chair${n > 1 ? 's' : ''}` : 'No chairs yet'
    $('.js-price', form).textContent = n ? `€${(n * PRICE).toLocaleString('en')}` : ''
  }
  const lay = (animate) => {
    const taken = NIGHTS[night].taken
    seats.forEach((b, i) => {
      const state = taken.includes(i + 1) ? 'taken' : mine.has(i + 1) ? 'mine' : 'free'
      if (animate && !reduced) gsap.delayedCall(i * 0.035, () => paint(b, state))
      else paint(b, state)
    })
    total()
  }
  $$('.js-left', form).forEach((el) => {
    const left = 12 - NIGHTS[el.dataset.night].taken.length
    el.textContent = left === 12 ? 'All twelve free' : `${left} chairs left`
  })
  lay(false)

  rows.forEach((row) =>
    row.addEventListener('click', (e) => {
      const b = e.target.closest('.seat')
      if (!b) return
      const n = Number(b.dataset.seat)
      const again = (cls) => {
        b.classList.remove(cls)
        void b.offsetWidth
        b.classList.add(cls)
      }
      if (b.dataset.state === 'taken') return again('is-no')
      if (mine.has(n)) mine.delete(n)
      else {
        mine.add(n)
        again('is-pop')
      }
      paint(b, mine.has(n) ? 'mine' : 'free')
      total()
    }),
  )

  $$('input[name="night"]', form).forEach((r) =>
    r.addEventListener('change', () => {
      night = r.value
      mine = new Set()
      lay(true)
    }),
  )

  // validation, quiet until you try to leave something wrong
  const fields = { name: $('#f-name'), email: $('#f-mail') }
  const ok = {
    name: (v) => v.trim().length > 1,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  }
  const check = (key) => {
    const good = ok[key](fields[key].value)
    fields[key].closest('.field').classList.toggle('is-bad', !good)
    fields[key].setAttribute('aria-invalid', String(!good))
    return good
  }
  Object.keys(fields).forEach((k) => {
    fields[k].addEventListener('blur', () => fields[k].value && check(k))
    fields[k].addEventListener('input', () => fields[k].closest('.field').classList.contains('is-bad') && check(k))
  })

  const done = $('.reserve__done', form)
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const good = [check('name'), check('email')].every(Boolean)
    if (!mine.size) {
      $('.js-chairs', form).textContent = 'Pick a plate first'
      if (!reduced) gsap.fromTo('.tabletop', { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)' })
      return
    }
    if (!good) return (fields.name.closest('.field').classList.contains('is-bad') ? fields.name : fields.email).focus()

    const list = [...mine].sort((a, b) => a - b)
    $('.js-done-name', form).textContent = fields.name.value.trim()
    $('.js-done-line', form).textContent = `Nº ${night} — ${NIGHTS[night].date} — chair${list.length > 1 ? 's' : ''} ${list.join(' & ')}`
    form.classList.add('is-done')
    done.hidden = false
    if (!reduced) gsap.fromTo('.placecard', { opacity: 0, y: 40, rotation: -3 }, { opacity: 1, y: 0, rotation: -1.2, duration: 1.1, ease: 'expo.out' })
    $('[data-again]', form).focus({ preventScroll: true })
  })
  $('[data-again]', form).addEventListener('click', () => {
    form.classList.remove('is-done')
    done.hidden = true
    fields.name.focus({ preventScroll: true })
  })
}
