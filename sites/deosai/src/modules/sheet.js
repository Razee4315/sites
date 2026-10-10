// The specimen sheet: a full-screen paper sheet for one species, with the cut-paper portrait and the real
// photograph stacked on the same stage. One is always the hero and the other waits as a small print behind it;
// pressing either swaps them.
import { gsap, $, $$, img, has, lock, still } from './core.js'
import { icon } from './icons.js'
import { species, byId } from '../data/species.js'
import { WORLDS } from '../data/worlds.js'
import credits from '../data/credits.json'

let root, stage, panel, openId = null, lastFocus = null, mode = 'paper', busy = false

const fact = (ico, label, value) =>
  value ? `<div class="sheet__fact"><dt>${icon(ico)}<span class="mono">${label}</span></dt><dd>${value}</dd></div>` : ''

function creditLine(s) {
  const c = credits[s.id]
  const kind = s.plate ? 'Scientific plate' : 'Photograph'
  const note = s.plate ? 'A nineteenth-century engraving of the species; no openly licensed photograph exists.' : 'It shows the species, not necessarily in Deosai.'
  const photo = c
    ? `<p>${icon('photo')}<span><b>${kind}</b> — ${c.author || 'Unknown author'}, <a href="${c.page}" target="_blank" rel="noopener">${c.licence}</a>, via Wikimedia Commons. ${note}</span></p>`
    : `<p>${icon('photo')}<span><b>No photograph</b> — we could not find an openly licensed photograph of this species good enough to show, so it appears as paper only.</span></p>`
  return `${photo}<p>${icon('scissors')}<span><b>Paper portrait</b> — an illustration generated for this site, checked against photographs of the species. Not a photograph.</span></p>`
}

function stageHTML(s) {
  const photo = has(`ph-${s.id}`)
  return `
    <div class="sheet__stack ${photo ? '' : 'no-photo'}" data-mode="paper">
      ${photo ? `<button class="sheet__print" type="button" data-swap data-cursor="swap" aria-label="Show the photograph of ${s.name}">
        <span class="sheet__print-in">${img(`ph-${s.id}`, { alt: `Photograph of ${s.name}`, sizes: '(min-width: 900px) 40vw, 80vw' })}</span>
        <span class="sheet__stamp mono">${icon('photo')} ${s.plate ? 'Plate' : 'Photograph'}</span>
      </button>` : ''}
      <button class="sheet__cut" type="button" ${photo ? 'data-swap data-cursor="swap"' : 'tabindex="-1"'} aria-label="Show the paper portrait of ${s.name}">
        ${img(`sp-${s.id}`, { alt: `Cut-paper illustration of ${s.name}`, sizes: '(min-width: 900px) 46vw, 86vw' })}
        <span class="sheet__stamp mono">${icon('scissors')} Paper portrait</span>
      </button>
    </div>`
}

function panelHTML(s) {
  const w = WORLDS[s.world]
  return `
    <p class="sheet__kicker mono"><span class="tag tag--accent">${icon(s.world)} ${w.kicker}</span><span>${s.group || ''}</span></p>
    <h2 class="sheet__name display" id="sheet-title">${s.name}</h2>
    <p class="sheet__sci sci">${s.sci}</p>
    ${s.local ? `<p class="sheet__local"><span class="mono">Locally</span> ${s.local}</p>` : ''}
    <p class="sheet__line lede">${s.line}</p>
    <p class="sheet__text body">${s.text}</p>
    <dl class="sheet__facts">
      ${fact('ruler', 'Size', s.size)}
      ${fact('season', 'When', s.when)}
      ${fact('pin', 'Where', s.where)}
      ${fact('status', 'Status', s.status)}
    </dl>
    <div class="sheet__credit">${creditLine(s)}</div>`
}

function build() {
  root = document.createElement('div')
  root.className = 'sheet'
  root.setAttribute('role', 'dialog')
  root.setAttribute('aria-modal', 'true')
  root.setAttribute('aria-labelledby', 'sheet-title')
  root.hidden = true
  root.innerHTML = `
    <div class="sheet__veil" data-close></div>
    <div class="sheet__paper paper">
      <div class="sheet__stage"></div>
      <div class="sheet__panel" data-lenis-prevent><div class="sheet__panel-in"></div></div>
      <div class="sheet__bar">
        <button class="sheet__nav" type="button" data-step="-1" aria-label="Previous species" data-cursor="prev">${icon('arrow', 'flip')}</button>
        <span class="sheet__count mono"></span>
        <button class="sheet__nav" type="button" data-step="1" aria-label="Next species" data-cursor="next">${icon('arrow')}</button>
      </div>
      <button class="sheet__close" type="button" data-close aria-label="Close" data-cursor="close">${icon('close')}</button>
    </div>`
  document.body.appendChild(root)
  stage = $('.sheet__stage', root)
  panel = $('.sheet__panel-in', root)

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return close()
    const step = e.target.closest('[data-step]')
    if (step) return go(Number(step.dataset.step))
    if (e.target.closest('[data-swap]')) swap()
  })
  document.addEventListener('keydown', (e) => {
    if (!openId) return
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowRight') go(1)
    if (e.key === 'ArrowLeft') go(-1)
    if (e.key === 'Tab') trap(e)
  })

  // the stack leans toward the pointer
  if (!still) {
    const rx = gsap.quickTo(stage, '--rx', { duration: 0.9 })
    const ry = gsap.quickTo(stage, '--ry', { duration: 0.9 })
    stage.addEventListener('pointermove', (e) => {
      const b = stage.getBoundingClientRect()
      rx((e.clientX - b.left) / b.width - 0.5)
      ry((e.clientY - b.top) / b.height - 0.5)
    })
    stage.addEventListener('pointerleave', () => { rx(0); ry(0) })
  }
}

function trap(e) {
  const f = $$('button:not([tabindex="-1"]), a[href]', root).filter((n) => n.offsetParent !== null)
  if (!f.length) return
  const first = f[0], last = f[f.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}

function swap() {
  const stack = $('.sheet__stack', stage)
  if (!stack || stack.classList.contains('no-photo')) return
  mode = mode === 'paper' ? 'photo' : 'paper'
  stack.dataset.mode = mode
}

function fill(s, dir = 0) {
  const w = WORLDS[s.world]
  root.dataset.world = s.world
  const list = species.filter((x) => x.world === s.world)
  $('.sheet__count', root).textContent = `${String(list.indexOf(s) + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')} · ${w.title}`
  mode = 'paper'
  const oldStack = $('.sheet__stack', stage)
  stage.insertAdjacentHTML('beforeend', stageHTML(s))
  const stack = stage.lastElementChild
  panel.innerHTML = panelHTML(s)
  $('.sheet__panel', root).scrollTop = 0
  const lines = [...panel.children]
  if (still) { oldStack?.remove(); return }
  if (oldStack) {
    gsap.to(oldStack, { xPercent: -60 * (dir || 1), rotation: -10 * (dir || 1), opacity: 0, duration: 0.5, ease: 'power3.in', onComplete: () => oldStack.remove() })
  }
  gsap.from(stack, { xPercent: 70 * (dir || 0), yPercent: dir ? 0 : 30, rotation: 9 * (dir || 1), opacity: 0, duration: 1.1, delay: oldStack ? 0.22 : 0.25, ease: 'expo.out' })
  gsap.from(lines, { y: 34, opacity: 0, duration: 0.9, stagger: 0.055, delay: oldStack ? 0.2 : 0.38, ease: 'expo.out', clearProps: 'transform,opacity' })
}

function go(step) {
  if (busy) return
  const s = byId[openId]
  const list = species.filter((x) => x.world === s.world)
  const next = list[(list.indexOf(s) + step + list.length) % list.length]
  openId = next.id
  busy = true
  fill(next, step)
  gsap.delayedCall(0.5, () => (busy = false))
}

export function open(id, from) {
  if (!root) build()
  const s = byId[id]
  if (!s || openId) return
  openId = id
  lastFocus = from || document.activeElement
  root.hidden = false
  lock(true)
  stage.innerHTML = ''
  fill(s)
  const paperEl = $('.sheet__paper', root)
  if (still) { gsap.set([paperEl, $('.sheet__veil', root)], { clearProps: 'all' }) }
  else {
    gsap.fromTo($('.sheet__veil', root), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    gsap.fromTo(paperEl, { yPercent: 104, rotation: 2.5 }, { yPercent: 0, rotation: 0, duration: 1, ease: 'expo.out' })
  }
  $('.sheet__close', root).focus({ preventScroll: true })
}

export function close() {
  if (!openId) return
  openId = null
  const done = () => { root.hidden = true; stage.innerHTML = ''; lock(false); lastFocus?.focus?.({ preventScroll: true }) }
  if (still) return done()
  gsap.to($('.sheet__veil', root), { opacity: 0, duration: 0.45, ease: 'power2.in' })
  gsap.to($('.sheet__paper', root), { yPercent: 104, rotation: -2, duration: 0.6, ease: 'power3.in', onComplete: done })
}

// any element with data-species opens its sheet
export function initSheet() {
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-species]')
    if (t) open(t.dataset.species, t)
  })
}
