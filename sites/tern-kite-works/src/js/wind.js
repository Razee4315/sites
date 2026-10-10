// The site has weather. One wind, shared by everything light enough to notice it.
import { clamp, ease, fine, onFrame } from './env.js'

export const wind = {
  force: 3, // Beaufort number; the dial in the Wind section sets it
  now: 1, // live strength, 1 = a steady force 3, breathing with slow gusts
  gust: 0, // signed push from the pointer (+ blows to the right)
  lift: 0, // px/s of scroll, so kites bob when the page moves
  t: 0,
  pointer: { x: innerWidth / 2, y: innerHeight / 2, vx: 0, vy: 0, seen: false },
}

let last = 0
if (fine) {
  addEventListener(
    'pointermove',
    (e) => {
      const p = wind.pointer
      const now = performance.now()
      const dt = Math.max(8, now - last)
      last = now
      if (p.seen) {
        const vx = (e.clientX - p.x) / dt
        const vy = (e.clientY - p.y) / dt
        p.vx += (vx - p.vx) * 0.35
        p.vy += (vy - p.vy) * 0.35
        // a quick sideways sweep of the pointer is a gust
        wind.gust = clamp(wind.gust + vx * 0.022, -1.6, 1.6)
      }
      p.x = e.clientX
      p.y = e.clientY
      p.seen = true
    },
    { passive: true },
  )
}

onFrame((dt) => {
  wind.t += dt
  const t = wind.t
  const breath = Math.sin(t * 0.37) * 0.5 + Math.sin(t * 0.91 + 1.3) * 0.3 + Math.sin(t * 2.3 + 4) * 0.2
  const target = (wind.force / 3) * (1 + breath * 0.3)
  wind.now += (target - wind.now) * ease(1.6, dt)
  wind.gust *= Math.exp(-dt * 2.4)
  wind.lift *= Math.exp(-dt * 6)
  wind.pointer.vx *= Math.exp(-dt * 8)
  wind.pointer.vy *= Math.exp(-dt * 8)
})

export const BEAUFORT = [
  { name: 'Calm', knots: 'Under 1 knot', say: 'Smoke rises straight up. Stay in. Make tea. Paste something.', fly: [] },
  { name: 'Light air', knots: '1–3 knots', say: "Smoke drifts but flags don't. Zephyr weather, and only Zephyr.", fly: ['zephyr'] },
  { name: 'Light breeze', knots: '4–6 knots', say: "You can feel it on your face. That is all a kite needs to know.", fly: ['zephyr', 'ostro', 'williwaw'] },
  { name: 'Gentle breeze', knots: '7–10 knots', say: 'Leaves in constant motion. Perfect. Cancel something.', fly: ['ostro', 'mistral', 'levanter', 'williwaw'] },
  { name: 'Moderate breeze', knots: '11–16 knots', say: 'Dust and loose paper lift. Hold on to your receipts and let out the Mistral.', fly: ['ostro', 'mistral', 'levanter', 'sirocco', 'williwaw'] },
  { name: 'Fresh breeze', knots: '17–21 knots', say: 'Small trees sway. The box kite wakes up. Wear the gloves.', fly: ['mistral', 'levanter', 'sirocco', 'williwaw'] },
  { name: 'Strong breeze', knots: '22–27 knots', say: 'Umbrellas misbehave. Sirocco and Williwaw only, and mean it.', fly: ['sirocco', 'williwaw'] },
  { name: 'Near gale', knots: '28–33 knots', say: 'Whole trees in motion. No. Even we say no.', fly: [] },
]
