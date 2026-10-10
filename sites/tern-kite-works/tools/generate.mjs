// Fans the manifest out to parallel `codex exec` sessions, one session per asset, and files the PNGs under the asset id.
//   node tools/generate.mjs                 everything that is missing
//   node tools/generate.mjs ostro cloud-a   only these ids
//   --c=20   concurrency      --force   regenerate even if present
import { spawn } from 'node:child_process'
import { mkdirSync, existsSync, readdirSync, copyFileSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import { assets } from './manifest.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW = join(root, 'assets-raw')
const LOGS = join(root, 'tools', 'logs')
const GENERATED = join(homedir(), '.codex', 'generated_images')
mkdirSync(RAW, { recursive: true })
mkdirSync(LOGS, { recursive: true })

const argv = process.argv.slice(2)
const flag = (name, fallback) => (argv.find((a) => a.startsWith(`--${name}=`)) || `--${name}=${fallback}`).split('=')[1]
const force = argv.includes('--force')
const concurrency = Number(flag('c', 16))
const only = argv.filter((a) => !a.startsWith('--'))
const TIMEOUT = 15 * 60 * 1000

const count = (a) => a.steps?.length || 1
const fileFor = (a, i) => join(RAW, a.steps ? `${a.id}-${i + 1}.png` : `${a.id}.png`)
const complete = (a) => Array.from({ length: count(a) }, (_, i) => fileFor(a, i)).every(existsSync)

const unknown = only.filter((id) => !assets.some((a) => a.id === id))
if (unknown.length) throw new Error(`unknown id(s): ${unknown.join(', ')}`)

const queue = assets.filter((a) => (only.length ? only.includes(a.id) : true) && (force || !complete(a)))
const stamp = () => new Date().toTimeString().slice(0, 8)
console.log(`${stamp()}  ${queue.length} session(s) to run, ${concurrency} at a time`)

const RULES =
  'You are being used purely as an image generator. The shell and all file tools are broken in this environment: ' +
  'do NOT run any shell command and do NOT read, list, copy or move any file. The only tool you may call is the ' +
  'built-in image generation tool (image_gen).\n\n'

function brief(a) {
  if (a.steps) {
    return (
      RULES +
      `Produce exactly ${a.steps.length} images, in order, with one image_gen call each. STEP 1 is a fresh image. ` +
      'Every later step is an EDIT of the image made in the step before it (it is already in this conversation), ' +
      'so the results stay pixel-registered. Pass each prompt through in full, do not shorten it.\n\n' +
      a.steps.map((s, i) => `STEP ${i + 1} (shape: ${s.aspect}):\n${s.prompt}`).join('\n\n') +
      '\n\nWhen every step is done, reply with only the saved file paths, in order.'
    )
  }
  return (
    RULES +
    'Call image_gen exactly once with the prompt below. Pass it through in full, do not shorten or reinterpret it. ' +
    `Shape: ${a.aspect}. ` +
    (a.alpha ? 'The result MUST have a genuinely transparent background (real alpha channel). ' : '') +
    'When it returns, reply with only the saved file path.\n\nPROMPT:\n' +
    a.prompt
  )
}

function session(a) {
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
    child.on('error', (e) => (out += `\nSPAWN ERROR ${e.message}`))
    child.stdin.on('error', () => {})
    child.stdin.end(brief(a))
    const timer = setTimeout(() => child.kill(), TIMEOUT)

    child.on('close', (code) => {
      clearTimeout(timer)
      writeFileSync(join(LOGS, `${a.id}.log`), out)
      const secs = Math.round((Date.now() - t0) / 1000)
      const fail = (why) => {
        console.log(`${stamp()}  FAIL  ${a.id.padEnd(14)} ${secs}s  ${why}`)
        resolve(false)
      }
      const sid = (out.match(/session id:\s*([0-9a-f-]{36})/i) || [])[1]
      if (!sid) return fail(`no session id (exit ${code})`)
      const dir = join(GENERATED, sid)
      if (!existsSync(dir)) return fail('session made no images')
      const made = readdirSync(dir)
        .filter((f) => /\.(png|webp|jpe?g)$/i.test(f))
        .map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs }))
        .sort((x, y) => x.t - y.t)
      if (made.length < count(a)) return fail(`${made.length}/${count(a)} images`)
      made.slice(-count(a)).forEach((m, i) => copyFileSync(join(dir, m.f), fileFor(a, i)))
      console.log(`${stamp()}  ok    ${a.id.padEnd(14)} ${secs}s  ${count(a)} image(s)`)
      resolve(true)
    })
  })
}

let next = 0
let failed = 0
await Promise.all(
  Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (next < queue.length) if (!(await session(queue[next++]))) failed++
  }),
)
console.log(`${stamp()}  done: ${queue.length - failed} ok, ${failed} failed`)
