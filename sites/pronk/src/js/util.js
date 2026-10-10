export const $ = (s, c = document) => c.querySelector(s)
export const $$ = (s, c = document) => [...c.querySelectorAll(s)]
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const rand = (a, b) => a + Math.random() * (b - a)
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
export const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
export const PHONE = '(max-width: 760px)'
export const DESK = '(min-width: 761px)'
// phones, and tablets held upright: text stacks above the picture
export const STACK = '(max-width: 760px), (max-width: 1100px) and (orientation: portrait)'
export const WIDE = '(min-width: 761px) and (orientation: landscape), (min-width: 1101px)'
