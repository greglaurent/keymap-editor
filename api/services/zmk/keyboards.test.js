const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')

const { listKeyboards, loadInfo } = require('./keyboards')

const REAL_BUNDLED_DIR = path.join(__dirname, '..', '..', '..', 'web', 'keyboard-data')

/** A throwaway zmk-config repo and bundled-metadata directory. */
function fixture ({ keymaps = [], buildYaml, info, bundled = [] }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'keyboards-'))
  const repo = path.join(root, 'repo')
  const bundledDir = path.join(root, 'bundled')
  fs.mkdirSync(path.join(repo, 'config'), { recursive: true })
  fs.mkdirSync(bundledDir)
  for (const name of keymaps) fs.writeFileSync(path.join(repo, 'config', `${name}.keymap`), '')
  if (buildYaml) fs.writeFileSync(path.join(repo, 'build.yaml'), buildYaml)
  if (info) fs.writeFileSync(path.join(repo, 'config', 'info.json'), JSON.stringify(info))
  for (const id of bundled) {
    const json = JSON.stringify({ id, layouts: { default_transform: { layout: [] } }, sensors: [] })
    fs.writeFileSync(
      path.join(bundledDir, `${id}-json-metadata.0123456789abcdef0123.js`),
      `(self.x=[]).push([[1],{2:function(l){l.exports=JSON.parse('${json}')}}])`
    )
  }
  return { repo, bundledDir }
}

test('listKeyboards returns one name per keymap file', () => {
  const { repo } = fixture({ keymaps: ['corne', 'lily58'] })
  fs.writeFileSync(path.join(repo, 'config', 'west.yml'), '')

  assert.deepEqual(listKeyboards(repo).sort(), ['corne', 'lily58'])
})

test('a keymap named after a bundled keyboard uses that keyboard', () => {
  const { repo, bundledDir } = fixture({ keymaps: ['lily58'], bundled: ['corne', 'lily58'] })

  assert.equal(loadInfo(repo, 'lily58', bundledDir).id, 'lily58')
})

test('build.yaml shields map an oddly named keymap to the longest matching keyboard', () => {
  const { repo, bundledDir } = fixture({
    keymaps: ['mine'],
    buildYaml: 'include:\n  - board: nice_nano_v2\n    shield: splitkb_aurora_corne_left\n',
    bundled: ['corne', 'splitkb_aurora_corne']
  })

  assert.equal(loadInfo(repo, 'mine', bundledDir).id, 'splitkb_aurora_corne')
})

test('build.yaml array and list forms are understood', () => {
  const { repo, bundledDir } = fixture({
    keymaps: ['mine'],
    buildYaml: '# comment shield: corne_left\nshield: [ "sofle_left", "sofle_right" ]\n',
    bundled: ['corne', 'sofle']
  })

  assert.equal(loadInfo(repo, 'mine', bundledDir).id, 'sofle')
})

test('a repo info.json takes precedence over bundled metadata', () => {
  const custom = { id: 'custom', layouts: {} }
  const { repo, bundledDir } = fixture({ keymaps: ['corne'], info: custom, bundled: ['corne'] })

  assert.equal(loadInfo(repo, 'corne', bundledDir).id, 'custom')
})

test('an unknown keyboard raises a LayoutGenerationError the editor can show', () => {
  const { repo, bundledDir } = fixture({ keymaps: ['mystery'], bundled: ['corne'] })

  assert.throws(() => loadInfo(repo, 'mystery', bundledDir), { name: 'LayoutGenerationError' })
})

test('every keyboard bundled with the editor decodes and has layout keys', () => {
  const ids = fs.readdirSync(REAL_BUNDLED_DIR)
    .map(file => /^(.+)-json-metadata\.[0-9a-f]+\.js$/.exec(file))
    .filter(Boolean)
    .map(match => match[1])
  assert.ok(ids.length > 50)

  for (const id of ids) {
    const { repo } = fixture({ keymaps: [id] })
    const info = loadInfo(repo, id, REAL_BUNDLED_DIR)

    const [first] = Object.values(info.layouts)
    assert.ok(first.layout.length > 0, `${id} has no layout keys`)
  }
})
