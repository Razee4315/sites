// A bell, synthesised. Nothing is sampled: each strike is a stack of sine partials at the ratios a
// tuned English bell actually has (hum, prime, tierce, quint, nominal and the upper partials),
// each with its own level and decay, a little beating between doubled partials, a short metallic
// transient, and a tower-sized reverb made from decaying noise.

//            ratio   level  decay (× the bell's base ring time)
const PARTIALS = [
  [0.5, 0.62, 1.0], // hum
  [1.0, 0.7, 0.72], // prime
  [1.1892, 0.82, 0.56], // tierce (minor third)
  [1.4983, 0.34, 0.42], // quint
  [2.0, 1.0, 0.36], // nominal
  [2.514, 0.3, 0.24],
  [3.01, 0.34, 0.19], // superquint
  [4.166, 0.2, 0.12], // octave nominal
  [5.433, 0.12, 0.08],
  [6.8, 0.07, 0.055],
]

let ctx = null
let master = null
let wet = null
let tap = null
let voices = 0

function impulse(seconds, decay) {
  const rate = ctx.sampleRate
  const len = Math.floor(rate * seconds)
  const buf = ctx.createBuffer(2, len, rate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    let lp = 0
    for (let i = 0; i < len; i++) {
      const t = i / len
      // darker as it decays, like stone
      lp += (Math.random() * 2 - 1 - lp) * (0.55 - 0.4 * t)
      d[i] = lp * Math.pow(1 - t, decay)
    }
  }
  return buf
}

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
  comp.connect(ctx.destination)

  master = ctx.createGain()
  master.gain.value = 0
  master.connect(comp)
  tap = ctx.createAnalyser()
  tap.fftSize = 8192
  master.connect(tap)

  const verb = ctx.createConvolver()
  verb.buffer = impulse(3.4, 2.6)
  wet = ctx.createGain()
  wet.gain.value = 0.34
  wet.connect(verb)
  verb.connect(master)
  return true
}

export const audio = {
  on: false,
  listeners: new Set(),

  get ready() {
    return !!ctx
  },

  async enable() {
    if (!ctx && !build()) return false
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {}
    }
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.05)
    this.on = true
    this.listeners.forEach((f) => f(true))
    return true
  },

  disable() {
    if (ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.08)
    }
    this.on = false
    this.listeners.forEach((f) => f(false))
  },

  toggle() {
    return this.on ? (this.disable(), false) : this.enable()
  },

  /** freq is the bell's prime (the note it is named for); vel 0..1 */
  strike(freq, vel = 1, { ring = 1, bright = 1, lite = false } = {}) {
    if (!this.on || !ctx || voices > 220) return
    const t = ctx.currentTime + 0.005
    // bigger, lower bells ring longer
    const base = Math.min(24, Math.max(3, 15 * Math.pow(370 / freq, 0.75))) * ring
    const v = Math.max(0.05, Math.min(1, vel))
    const out = ctx.createGain()
    out.gain.value = 0.16 * v
    out.connect(master)
    out.connect(wet)

    const top = ctx.sampleRate * 0.45
    PARTIALS.forEach(([r, level, d], i) => {
      const f = freq * r
      if (f > top || (lite && i > 6)) return
      // soft strikes excite the upper partials less
      const lv = level * (i > 4 ? Math.pow(v, 0.8) * bright : 1)
      const dur = Math.max(0.25, base * d)
      const n = i < 3 && !lite ? 2 : 1 // the long low partials are doubled a fraction of a hertz apart, so they beat
      for (let k = 0; k < n; k++) {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.frequency.value = f + (k ? 0.35 + i * 0.22 : 0)
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(lv / n, t + 0.004 + (i === 0 ? 0.03 : 0))
        g.gain.exponentialRampToValueAtTime(0.001, t + dur)
        o.connect(g).connect(out)
        o.start(t)
        o.stop(t + dur + 0.05)
        voices++
        o.onended = () => {
          voices--
          g.disconnect()
        }
      }
    })

    // the clapper: a few milliseconds of band-passed noise
    const len = Math.floor(ctx.sampleRate * 0.05)
    const nb = ctx.createBuffer(1, len, ctx.sampleRate)
    const nd = nb.getChannelData(0)
    for (let i = 0; i < len; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
    const ns = ctx.createBufferSource()
    ns.buffer = nb
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = Math.min(9000, freq * 7)
    bp.Q.value = 0.8
    const ng = ctx.createGain()
    ng.gain.value = 1.6 * v
    ns.connect(bp).connect(ng).connect(out)
    ns.start(t)
    setTimeout(() => out.disconnect(), (base + 0.5) * 1000)
  },

  /** what is sounding right now: overall level and the loudest frequencies (used to test the synth) */
  probe(count = 6) {
    if (!tap) return null
    const time = new Float32Array(tap.fftSize)
    tap.getFloatTimeDomainData(time)
    const rms = Math.sqrt(time.reduce((a, v) => a + v * v, 0) / time.length)
    const bins = new Float32Array(tap.frequencyBinCount)
    tap.getFloatFrequencyData(bins)
    const hz = ctx.sampleRate / tap.fftSize
    const peaks = []
    for (let i = 2; i < bins.length - 2; i++) {
      if (bins[i] > -70 && bins[i] > bins[i - 1] && bins[i] >= bins[i + 1] && bins[i] > bins[i - 2] && bins[i] > bins[i + 2]) peaks.push([Math.round(i * hz), Math.round(bins[i])])
    }
    return { rms: +rms.toFixed(4), peaks: peaks.sort((a, b) => b[1] - a[1]).slice(0, count) }
  },

  /** one partial on its own, for the tuning section */
  tone(freq, seconds = 3.6) {
    if (!this.on || !ctx) return
    const t = ctx.currentTime + 0.005
    const out = ctx.createGain()
    out.gain.value = 0.2
    out.connect(master)
    out.connect(wet)
    for (let k = 0; k < 2; k++) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = freq + k * 0.6
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.5, t + 0.008)
      g.gain.exponentialRampToValueAtTime(0.0004, t + seconds)
      o.connect(g).connect(out)
      o.start(t)
      o.stop(t + seconds + 0.05)
    }
    setTimeout(() => out.disconnect(), (seconds + 0.5) * 1000)
  },
}
