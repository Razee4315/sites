// Fans the image manifest out to parallel `codex exec` sessions (one session per image, or per edit chain)
// and collects the PNGs into assets-raw/<id>.png  (chains: <id>-1.png, <id>-2.png, ...).
//
//   node tools/generate.mjs                 everything that is missing
//   node tools/generate.mjs bell pour       only these ids (prefix match with a trailing *: sally*)
//   node tools/generate.mjs --force bell    regenerate even if present
//   node tools/generate.mjs --c=20          concurrency (default 16)
import { spawn } from 'node:child_process'
import { mkdirSync, existsSync, readdirSync, copyFileSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import { assets } from './manifest.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW = join(root, 'assets-raw')
const LOGS = join(root, 'tools', 'logs')
const GEN = join(homedir(), '.codex', 'generated_images')
mkdirSync(RAW, { recursive: true })
mkdirSync(LOGS, { recursive: true })

const argv = process.argv.slice(2)
const force = argv.includes('--force')
const conc = Number((argv.find((a) => a.startsWith('--c=')) || '--c=16').slice(4))
const want = argv.filter((a) => !a.startsWith('--'))
const TIMEOUT = 14 * 60 * 1000
const RETRIES = 1

const files = (a) => (a.steps ? a.steps.map((_, i) => `${a.id}-${i + 1}.png`) : [`${a.id}.png`])
const done = (a) => files(a).every((f) => existsSync(join(RAW, f)))
const not = (argv.find((a) => a.startsWith('--not=')) || '--not=').slice(6).split(',').filter(Boolean)
const picked = (a) =>
  !not.includes(a.id) &&
  (!want.length || want.some((w) => (w.endsWith('*') ? a.id.startsWith(w.slice(0, -1)) : a.id === w)))

const queue = assets.filter((a) => picked(a) && (force || !done(a)))
const t00 = Date.now()
const stamp = () => `${String(Math.round((Date.now() - t00) / 1000)).padStart(4)}s`
console.log(`\n  ${queue.length} job(s) · concurrency ${Math.min(conc, queue.length)}\n`)

const HEAD =
  'You are being used purely as an image generator. Shell commands and file tools are broken in this ' +
  'environment: do NOT run any shell command, do NOT read, list or copy any file. Only call the built-in ' +
  'image generation tool (image_gen).\n\n'

const brief = (a) => {
  if (a.steps) {
    return (
      HEAD +
      `Make exactly ${a.steps.length} images, in order, one image_gen call each. STEP 1 is a fresh image. Every later ` +
      'step is an EDIT of the image produced by the step before it (it is already visible in this conversation): ' +
      'keep the framing, camera, composition, silhouette and every unchanged pixel identical, and change only what the ' +
      `step describes. Requested shape for every step: ${a.aspect}. ` +
      (a.alpha ? 'Every output MUST have a genuinely transparent background (real alpha channel). ' : '') +
      '\n\n' +
      a.steps.map((s, i) => `STEP ${i + 1}:\n${s}`).join('\n\n') +
      '\n\nWhen all steps are done reply with only the saved file paths, in order.'
    )
  }
  return (
    HEAD +
    'Call image_gen exactly once with the prompt below, keeping all of its content. ' +
    `Requested shape: ${a.aspect}. ` +
    (a.alpha ? 'The output MUST have a genuinely transparent background (real alpha channel). ' : '') +
    'When it returns, reply with only the saved file path.\n\nPROMPT:\n' +
    a.prompt
  )
}

function attempt(a, n) {
  return new Promise((resolve) => {
    const t0 = Date.now()
    const child = spawn(
      'codex',
      ['exec', '--skip-git-repo-check', '--sandbox', 'read-only', '-c', 'model_reasoning_effort="low"', '--color', 'never', '-'],
      { cwd: root, windowsHide: true },
    )
    let out = ''
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (out += d))
    child.stdin.end(brief(a))
    const timer = setTimeout(() => child.kill(), TIMEOUT)
    child.on('error', (e) => (out += `\nSPAWN ERROR ${e.message}`))
    child.on('close', (code) => {
      clearTimeout(timer)
      writeFileSync(join(LOGS, `${a.id}${n ? `.retry${n}` : ''}.log`), out)
      const secs = Math.round((Date.now() - t0) / 1000)
      const sid = (out.match(/session id:\s*([0-9a-f-]{36})/i) || [])[1]
      const dir = sid && join(GEN, sid)
      if (!dir || !existsSync(dir)) return resolve({ ok: false, why: `exit ${code}, no image dir`, secs })
      const imgs = readdirSync(dir)
        .filter((f) => /\.(png|webp|jpe?g)$/i.test(f))
        .map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs }))
        .sort((x, y) => x.t - y.t)
      const need = files(a)
      if (imgs.length < need.length) return resolve({ ok: false, why: `got ${imgs.length}/${need.length} images`, secs })
      imgs.slice(-need.length).forEach((p, i) => copyFileSync(join(dir, p.f), join(RAW, need[i])))
      resolve({ ok: true, secs, sid })
    })
  })
}

const failed = []
let next = 0
let finished = 0
async function worker() {
  while (next < queue.length) {
    const a = queue[next++]
    let r
    for (let n = 0; n <= RETRIES; n++) {
      r = await attempt(a, n)
      if (r.ok) break
      console.log(`${stamp()}  retry ${a.id.padEnd(18)} ${r.why}`)
    }
    finished++
    const tag = `[${String(finished).padStart(2)}/${queue.length}]`
    if (r.ok) console.log(`${stamp()}  ok    ${a.id.padEnd(18)} ${String(r.secs).padStart(3)}s  ${tag}`)
    else {
      failed.push(a.id)
      console.log(`${stamp()}  FAIL  ${a.id.padEnd(18)} ${r.why}  ${tag}`)
    }
  }
}
await Promise.all(Array.from({ length: Math.min(conc, queue.length) }, worker))
console.log(`\n  done in ${stamp().trim()} · ${queue.length - failed.length} ok · ${failed.length} failed${failed.length ? ': ' + failed.join(' ') : ''}\n`)
