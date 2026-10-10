// Sends every prompt in the manifest to its own `codex exec` session and collects the PNGs.
// usage: node tools/generate.mjs [--force] [--c=16] [--not=id,id] [id ...]     (no ids = everything still missing)
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
const ids = argv.filter((a) => !a.startsWith('--'))
const TIMEOUT = 14 * 60 * 1000
const TRIES = 2

const names = (a) => (a.steps ? a.steps.map((_, i) => `${a.id}-${i + 1}.png`) : [`${a.id}.png`])
const done = (a) => names(a).every((n) => existsSync(join(RAW, n)))

const unknown = ids.filter((id) => !assets.some((a) => a.id === id))
if (unknown.length) console.log(`unknown id(s): ${unknown.join(', ')}`)
const not = ((argv.find((a) => a.startsWith('--not=')) || '').slice(6) || '').split(',')
const queue = assets.filter((a) => (ids.length ? ids.includes(a.id) : true) && !not.includes(a.id) && (force || !done(a)))
console.log(`${queue.length} job(s), ${conc} at a time`)

const HEAD =
  'You are being used purely as an image generator. Shell commands and file tools are broken in this environment: ' +
  'do NOT run any shell command, do NOT read, list or copy any file. Only call the built-in image generation tool ' +
  '(image_gen).\n\n'

const wrap = (a) => {
  if (a.steps)
    return (
      HEAD +
      `Make exactly ${a.steps.length} images, in order, with one image_gen call each. STEP 1 is a new image. Every later ` +
      'step is an EDIT of the image from STEP 1 (it is visible in this conversation): keep the framing, the subject outline ' +
      'and every unchanged pixel registered so the results line up exactly when stacked.\n\n' +
      a.steps.map((s, i) => `STEP ${i + 1} (${a.aspect}):\n${s}`).join('\n\n') +
      '\n\nWhen all steps are done, reply with only the saved file paths, in order.'
    )
  return (
    HEAD +
    `Call image_gen exactly once with the prompt below, keeping all of its content. Requested shape: ${a.aspect}. ` +
    (a.alpha ? 'The output MUST have a genuinely transparent background (real alpha channel). ' : '') +
    'When it returns, reply with only the saved file path.\n\nPROMPT:\n' +
    a.prompt
  )
}

function attempt(a, n) {
  return new Promise((resolve) => {
    const child = spawn(
      'codex',
      ['exec', '--skip-git-repo-check', '--sandbox', 'read-only', '-c', 'model_reasoning_effort="low"', '--color', 'never', '-'],
      { cwd: root, windowsHide: true, shell: process.platform === 'win32' },
    )
    let out = ''
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (out += d))
    child.stdin.end(wrap(a))
    const timer = setTimeout(() => child.kill(), TIMEOUT)
    child.on('error', (e) => (out += `\nSPAWN ERROR ${e.message}`))
    child.on('close', (code) => {
      clearTimeout(timer)
      writeFileSync(join(LOGS, `${a.id}${n ? `.try${n + 1}` : ''}.log`), out)
      const sid = (out.match(/session id:\s*([0-9a-f-]{36})/i) || [])[1]
      const dir = sid && join(GEN, sid)
      if (!dir || !existsSync(dir)) return resolve(`exit ${code}, no image folder`)
      const imgs = readdirSync(dir)
        .filter((f) => /\.(png|webp|jpe?g)$/i.test(f))
        .map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs }))
        .sort((x, y) => x.t - y.t)
      const want = names(a)
      if (imgs.length < want.length) return resolve(`got ${imgs.length}/${want.length} images`)
      // an edit chain can leave retries behind; the last N files in time order are the kept ones
      imgs.slice(-want.length).forEach((p, i) => copyFileSync(join(dir, p.f), join(RAW, want[i])))
      resolve(null)
    })
  })
}

const tally = { ok: [], fail: [] }
async function run(a) {
  const t0 = Date.now()
  let err
  for (let n = 0; n < TRIES; n++) {
    err = await attempt(a, n)
    if (!err) break
  }
  const secs = String(Math.round((Date.now() - t0) / 1000)).padStart(4)
  tally[err ? 'fail' : 'ok'].push(a.id)
  console.log(`${err ? 'FAIL' : 'ok  '} ${secs}s  ${a.id}${err ? `  (${err})` : ''}   [${tally.ok.length + tally.fail.length}/${queue.length}]`)
}

let next = 0
await Promise.all(
  Array.from({ length: Math.min(conc, queue.length) }, async () => {
    while (next < queue.length) await run(queue[next++])
  }),
)
console.log(`\nDONE  ok ${tally.ok.length}  fail ${tally.fail.length}${tally.fail.length ? `  -> ${tally.fail.join(' ')}` : ''}`)
