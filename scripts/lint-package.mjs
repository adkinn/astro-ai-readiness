import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'))

const failures = []

function check(name, fn) {
  try {
    fn()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    failures.push(`${name}: ${message}`)
  }
}

check('package-lock root metadata matches package.json', () => {
  assert.equal(lock.name, pkg.name)
  assert.equal(lock.version, pkg.version)
  assert.equal(lock.packages[''].name, pkg.name)
  assert.equal(lock.packages[''].version, pkg.version)
})

check('Node engine matches Astro 6 floor', () => {
  assert.equal(pkg.engines.node, '>=22.12.0')
})

check('lint and test scripts are real commands', () => {
  assert.ok(!pkg.scripts.lint.includes('exit 1'))
  assert.ok(!pkg.scripts.test.includes('exit 1'))
  assert.ok(pkg.scripts.test.includes('node --test'))
})

check('exports point at build artifacts', () => {
  for (const exportConfig of Object.values(pkg.exports)) {
    for (const path of Object.values(exportConfig)) {
      assert.ok(
        existsSync(path),
        `${path} is exported but does not exist; run npm run build`
      )
    }
  }
})

check('tsup entries include every output module wired in src/index.ts', () => {
  const index = readFileSync('src/index.ts', 'utf8')
  const tsup = readFileSync('tsup.config.ts', 'utf8')
  const outputImports = [...index.matchAll(/\.\/outputs\/([a-z-]+)\.js/g)]
    .map((match) => match[1])

  for (const name of outputImports) {
    assert.ok(
      tsup.includes(`'outputs/${name}'`),
      `missing tsup entry for outputs/${name}`
    )
  }
})

if (failures.length > 0) {
  console.error('Package lint failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Package lint passed')
