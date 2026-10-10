// A bell, synthesised. Seven sine partials, each with its own level and its own decay, plus a short
// burst of filtered noise for the clapper. "As cast" detunes the partials and splits each into a
// beating doublet, which is exactly what an untuned bell does.
//
// All sound is opt-in: nothing is created until enable() is called from a user gesture.

export const PARTIALS = [
  { key: 'hum', ratio: 0.25, cast: 0.2622, amp: 0.34, decay: 1.0 },
  { key: 'prime', ratio: 0.5, cast: 0.4785, amp: 0.5, decay: 0.6 },
  { key: 'tierce', ratio: 0.6, cast: 0.6228, amp: 0.42, decay: 0.46 },
  { key: 'quint', ratio: 0.75, cast: 0.7715, amp: 0.2, decay: 0.32 },
  { key: 'nominal', ratio: 1.0, cast: 1.0, amp: 0.55, decay: 0.36 },
  { key: 'superquint', ratio: 1.5, cast: 1.538, amp: 0.2, decay: 0.2 },
  { key: 'octave', ratio: 2.0, cast: 2.106, amp: 0.11, decay: 0.12 },
]

const listeners = new Set()
let ctx = null
let master = null
let wet = null
let noiseBuf = null
let on = false

function build() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return false
  ctx = new AC()
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -16
  comp.knee.value = 18
  comp.ratio.value = 5
  comp.attack.value = 0.004
  comp.release.value = 0.3
  master = ctx.createGain()
  master.gain.value = 0
  master.connect(comp).connect(ctx.destination)

  // a small stone room: decaying stereo noise as the impulse response
  const len = Math.floor(ctx.sampleRate * 2.6)
  const ir = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
  }
  const conv = ctx.createConvolver()
  conv.buffer = ir
  wet = ctx.createGain()
  wet.gain.value = 0.2
  wet.connect(conv).connect(master)

  noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate)
  const n = noiseBuf.getChannelData(0)
  for (let i = 0; i < n.length; i++) n[i] = (Math.random() * 2 - 1) * (1 - i / n.length)
  return true
}

export const audio = {
  get on() {
    return on
  },
  get supported() {
    return !!(window.AudioContext || window.webkitAudioContext)
  },
  async enable() {
    if (!ctx && !build()) return false
    // never wait on resume(): on a machine with no audio device that promise can stay pending for ever,
    // and the page must not hang behind it
    if (ctx.state !== 'running') ctx.resume().catch(() => {})
    on = true
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.04)
    listeners.forEach((f) => f({ type: 'state', on }))
    return true
  },
  disable() {
    on = false
    if (ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.08)
    }
    listeners.forEach((f) => f({ type: 'state', on }))
  },
  toggle() {
    return on ? (this.disable(), false) : this.enable()
  },
  subscribe(f) {
    listeners.add(f)
    return () => listeners.delete(f)
  },
  now() {
    return ctx ? ctx.currentTime : 0
  },

  /**
   * Strike a bell.
   * @param {number} note   strike note in Hz (the pitch you hear); the nominal is an octave above it
   * @param {object} o      size: seconds the hum takes to die; gain 0..1; tuned: false = as cast;
   *                        only: array of partial keys to sound; when: AudioContext time; pan -1..1
   * @returns {number} how long the note lasts, in seconds (also reported when sound is off, for the UI)
   */
  strike(note, o = {}) {
    const { size = 7, gain = 0.5, tuned = true, only = null, when = 0, pan = 0 } = o
    const dur = size
    listeners.forEach((f) => f({ type: 'strike', note, dur, gain, delay: when && ctx ? Math.max(0, when - ctx.currentTime) : 0 }))
    if (!on || !ctx) return dur
    const t = Math.max(ctx.currentTime + 0.005, when || 0)
    const nominal = note * 2
    const out = ctx.createGain()
    out.gain.value = gain
    let node = out
    if (pan && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner()
      p.pan.value = pan
      out.connect(p)
      node = p
    }
    node.connect(master)
    node.connect(wet)

    let longest = 0
    for (const p of PARTIALS) {
      if (only && !only.includes(p.key)) continue
      const f = nominal * (tuned ? p.ratio : p.cast)
      if (f > 14000) continue
      const d = Math.max(0.25, size * p.decay)
      longest = Math.max(longest, d)
      const voices = tuned ? [0] : [0, 0.0045] // the doublet that makes an untuned bell warble
      for (const off of voices) {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = f * (1 + off)
        const a = (p.amp * (only ? 1.15 : 1)) / voices.length
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(a, t + 0.004)
        g.gain.exponentialRampToValueAtTime(a * 0.42, t + d * 0.14)
        g.gain.exponentialRampToValueAtTime(0.0001, t + d)
        osc.connect(g).connect(out)
        osc.start(t)
        osc.stop(t + d + 0.05)
      }
    }
    if (!only) {
      const src = ctx.createBufferSource()
      src.buffer = noiseBuf
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = Math.min(9000, nominal * 2.4)
      bp.Q.value = 0.9
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.5, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
      src.connect(bp).connect(g).connect(out)
      src.start(t)
    }
    setTimeout(() => out.disconnect(), (t - ctx.currentTime + longest + 3.2) * 1000)
    return dur
  },
}

// equal temperament, A4 = 440
const NAMES = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, Bb: 1, B: 2 }
export const hz = (name, octave) => 440 * Math.pow(2, (NAMES[name] + (octave - 4) * 12) / 12)
