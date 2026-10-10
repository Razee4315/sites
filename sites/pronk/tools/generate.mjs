// Drives the Codex CLI as an image generator: one `codex exec` session per manifest entry,
// many sessions in parallel, PNGs copied out of Codex's session folder into assets-raw/.
//
//   node tools/generate.mjs                 everything that is missing
//   node tools/generate.mjs lemon moth      only these ids
//   node tools/generate.mjs --force lemon   regenerate even if present
//   node tools/generate.mjs --c=20          concurrency (default 16)
//   node tools/generate.mjs --family=obj    only one family
//   node tools/generate.mjs --skip=a,b        leave these out
import { spawn } from 'node:child_process'
import { mkdirSync, existsSync, readdirSync, copyFileSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import { images } from './manifest.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW = join(root, 'assets-raw')
const LOGS = join(root, 'tools', 'logs')
const CODEX_OUT = join(homedir(), '.codex', 'generated_images')
mkdirSync(RAW, { recursive: true })
mkdirSync(LOGS, { recursive: true })

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}
const force = args.includes('--force')
const concurrency = Number(flag('c', 16))
const family = flag('family', null)
const skip = (flag('skip', '') || '').split(',').filter(Boolean)
const only = args.filter((a) => !a.startsWith('--'))
const TIMEOUT_MS = 20 * 60 * 1000
const RETRIES = 1

// A chain yields id-1.png, id-2.png ...; a single image yields id.png
const fileFor = (img, step) => (img.chain ? `${img.id}-${step + 1}.png` : `${img.id}.png`)
const stepCount = (img) => (img.chain ? img.chain.length : 1)
const complete = (img) =>
  Array.from({ length: stepCount(img) }, (_, i) => existsSync(join(RAW, fileFor(img, i)))).every(Boolean)

const PREAMBLE =
  'You are being used purely as an image generator. The shell sandbox on this machine is broken: ' +
  'do NOT run shell commands, do NOT read, list, copy or move any file, do NOT try to verify anything. ' +
  'Only call the built-in image generation tool (image_gen).\n\n'

function buildPrompt(img) {
  if (img.chain) {
    const steps = img.chain
      .map((step, i) =>
        i === 0
          ? `STEP 1 — generate a new image (${img.shape}):\n${step}`
          : `STEP ${i + 1} — EDIT the image from step ${i} (it is already in this conversation). ` +
            'Keep the canvas size, framing, camera, composition, the position and drawing of every element, ' +
            'the lighting and the brushwork identical so the two images line up pixel for pixel when stacked. ' +
            `Change ONLY what is described here:\n${step}`,
      )
      .join('\n\n')
    return (
      PREAMBLE +
      `Make exactly ${img.chain.length} images, strictly in order, one image_gen call per step, ` +
      'waiting for each to finish before starting the next.\n\n' +
      steps +
      '\n\nWhen every step is done, reply with only the saved file paths, in order.'
    )
  }
  return (
    PREAMBLE +
    'Call image_gen exactly once with the prompt below, keeping all of its content. ' +
    `Requested shape: ${img.shape}. ` +
    (img.alpha
      ? 'The output MUST have a genuinely transparent background (real alpha channel), not a painted or checkerboard one. '
      : '') +
    'When it returns, reply with only the saved file path.\n\nPROMPT:\n' +
    img.prompt
  )
}

function session(img, attempt) {
  return new Promise((resolve) => {
    const started = Date.now()
    const child = spawn(
      'codex',
      ['exec', '--skip-git-repo-check', '--sandbox', 'read-only', '-c', 'model_reasoning_effort="low"', '--color', 'never', '-'],
      { cwd: root, windowsHide: true, shell: process.platform === 'win32' },
    )
    let log = ''
    child.stdout.on('data', (d) => (log += d))
    child.stderr.on('data', (d) => (log += d))
    child.on('error', (e) => (log += `\nSPAWN ERROR ${e.message}`))
    child.stdin.end(buildPrompt(img))
    const timer = setTimeout(() => child.kill(), TIMEOUT_MS)

    child.on('close', (code) => {
      clearTimeout(timer)
      const secs = Math.round((Date.now() - started) / 1000)
      writeFileSync(join(LOGS, `${img.id}${attempt ? `.retry${attempt}` : ''}.log`), log)
      const sid = (log.match(/session id:\s*([0-9a-f-]{36})/i) || [])[1]
      const dir = sid ? join(CODEX_OUT, sid) : null
      if (!dir || !existsSync(dir)) return resolve({ ok: false, why: `exit ${code}, no session image folder`, secs })

      const found = readdirSync(dir)
        .filter((f) => /\.(png|webp|jpe?g)$/i.test(f))
        .map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs }))
        .sort((a, b) => a.t - b.t)
      const want = stepCount(img)
      if (found.length < want) return resolve({ ok: false, why: `${found.length}/${want} images`, secs })
      // if Codex made extras (a redo), the last N in time order are the final chain
      found.slice(-want).forEach((p, i) => copyFileSync(join(dir, p.f), join(RAW, fileFor(img, i))))
      resolve({ ok: true, secs, sid })
    })
  })
}

async function generate(img) {
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const r = await session(img, attempt)
    if (r.ok) {
      console.log(`ok    ${img.id.padEnd(22)} ${String(r.secs).padStart(4)}s  ${r.sid}`)
      return true
    }
    console.log(`${attempt < RETRIES ? 'retry' : 'FAIL '} ${img.id.padEnd(22)} ${String(r.secs).padStart(4)}s  ${r.why}`)
  }
  return false
}

const queue = images.filter(
  (img) => (only.length ? only.includes(img.id) : true) && (family ? img.family === family : true) && !skip.includes(img.id) && (force || !complete(img)),
)
const skipped = images.length - queue.length
console.log(`${queue.length} to generate, ${skipped} skipped, ${concurrency} at a time\n`)

let cursor = 0
const results = []
await Promise.all(
  Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (cursor < queue.length) {
      const img = queue[cursor++]
      results.push([img.id, await generate(img)])
    }
  }),
)
const failed = results.filter(([, ok]) => !ok).map(([id]) => id)
console.log(`\n${results.length - failed.length} ok, ${failed.length} failed${failed.length ? ': ' + failed.join(' ') : ''}`)
