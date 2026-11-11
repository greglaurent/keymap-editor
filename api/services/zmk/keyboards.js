const fs = require('fs')
const path = require('path')

const BUNDLED_DIR = path.join(__dirname, '..', '..', '..', 'web', 'keyboard-data')

class LayoutError extends Error {
  constructor (message) {
    super(message)
    this.name = 'LayoutGenerationError'
  }
}

/**
 * Keyboards in a zmk-config repo: one per `config/*.keymap`, named after
 * the file.
 * @param {string} repoPath
 * @returns {string[]}
 */
const listKeyboards = repoPath => fs.readdirSync(path.join(repoPath, 'config'))
  .filter(file => file.endsWith('.keymap'))
  .map(file => path.basename(file, '.keymap'))

/** Path of a keyboard's keymap file. */
const keymapPath = (repoPath, name) => path.join(repoPath, 'config', `${name}.keymap`)

/** Ids of the keyboards bundled with the editor (`corne`, `lily58`, ...). */
const bundledKeyboardIds = bundledDir => fs.readdirSync(bundledDir)
  .map(file => /^(.+)-json-metadata\.[0-9a-f]+\.js$/.exec(file))
  .filter(Boolean)
  .map(match => match[1])

/** Shield and board names from the repo's `build.yaml`. */
function buildTargets (repoPath) {
  const file = path.join(repoPath, 'build.yaml')
  if (!fs.existsSync(file)) return []
  const source = fs.readFileSync(file, 'utf8').replace(/#.*$/gm, '')
  return [...source.matchAll(/\b(?:shield|board):\s*\[?([^\n\]]+)/g)]
    .flatMap(match => match[1].split(','))
    .map(target => target.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
}

/**
 * Which bundled keyboard a keymap is for: the one named like the keymap file,
 * else the longest keyboard id that a `build.yaml` shield or board starts with
 * (`corne_left` -> `corne`).
 */
function matchBundledKeyboard (repoPath, name, bundledDir) {
  const ids = bundledKeyboardIds(bundledDir)
  if (ids.includes(name)) return name
  const matches = buildTargets(repoPath).flatMap(target => (
    ids.filter(id => target === id || target.startsWith(`${id}_`))
  ))
  return matches.sort((a, b) => b.length - a.length)[0]
}

/** Decode a bundled keyboard's metadata (`{ id, name, layouts, sensors }`). */
function loadBundledInfo (id, bundledDir) {
  const file = fs.readdirSync(bundledDir)
    .find(name => name.startsWith(`${id}-json-metadata.`) && name.endsWith('.js'))
  // The bundled data is `JSON.parse('<json>')`; decode the string literal.
  const source = fs.readFileSync(path.join(bundledDir, file), 'utf8')
  const literal = /JSON\.parse\('(.*)'\)/s.exec(source)[1].replace(/\\([\\'])/g, '$1')
  return JSON.parse(literal)
}

/**
 * Layout metadata (`{ layouts, sensors }`) for a keyboard: the repo's own
 * `config/info.json` if it has one, else the bundled metadata for the
 * keyboard the keymap is for.
 * @throws {LayoutError} if no layout can be found
 */
function loadInfo (repoPath, name, bundledDir = BUNDLED_DIR) {
  const infoPath = path.join(repoPath, 'config', 'info.json')
  if (fs.existsSync(infoPath)) return JSON.parse(fs.readFileSync(infoPath, 'utf8'))

  const id = matchBundledKeyboard(repoPath, name, bundledDir)
  if (!id) {
    throw new LayoutError(
      `No layout known for "${name}". Add config/info.json to the repo, or name ` +
      'the keymap after a supported keyboard.'
    )
  }
  return loadBundledInfo(id, bundledDir)
}

module.exports = { LayoutError, keymapPath, listKeyboards, loadInfo }
