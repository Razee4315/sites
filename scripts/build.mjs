// Builds every site in sites/ into dist/<name>/, adds the designer credit to each, and puts the gallery at dist/.
// Sites with a package.json are Vite projects; sites without one are plain HTML and are copied over unchanged.
// BASE_PATH is the URL prefix the whole thing is served from ("/" locally, "/<repo>/" on GitHub Pages).
// Pass site names as arguments to build only those: node scripts/build.mjs pronk quire
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const base = `/${process.env.BASE_PATH ?? ''}/`.replace(/\/+/g, '/')
const credit = readFileSync(join(root, 'shared', 'credit.html'), 'utf8')

const all = readdirSync(join(root, 'sites'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
const only = process.argv.slice(2)
const unknown = only.filter((name) => !all.includes(name))
if (unknown.length) throw new Error(`no such site: ${unknown.join(', ')}`)

if (!only.length) rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })

for (const name of only.length ? only : all) {
  const cwd = join(root, 'sites', name)
  const run = (cmd) => execSync(cmd, { cwd, stdio: 'inherit' })
  console.log(`\n── ${name}`)
  if (existsSync(join(cwd, 'package.json'))) {
    if (!existsSync(join(cwd, 'node_modules'))) run('npm ci')
    run(`npx vite build --base=${base}${name}/ --outDir="${join(dist, name)}" --emptyOutDir`)
  } else {
    // A plain HTML site with relative paths: copied as it is, minus its README.
    rmSync(join(dist, name), { recursive: true, force: true })
    cpSync(cwd, join(dist, name), { recursive: true, filter: (src) => !/README\.md$|[\\/]readme([\\/]|$)/.test(src) })
  }

  const page = join(dist, name, 'index.html')
  const html = readFileSync(page, 'utf8')
  if (!html.includes('</body>')) throw new Error(`${name}/index.html has no </body> to put the credit before`)
  writeFileSync(page, html.replace('</body>', () => `${credit}</body>`))
}

cpSync(join(root, 'gallery'), dist, { recursive: true })
console.log(`\nBuilt ${only.length || all.length} site(s) and the gallery into dist/ (base ${base})`)
