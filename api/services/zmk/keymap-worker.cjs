/**
 * Runs the editor's own keymap parser and generator (the compiled shared
 * library in web/) for the server. See keymap-lib.js, which starts this
 * file as a child process under Node's permission model: it can read web/
 * and nothing else (no other files, no network, no child processes), and it
 * talks to the server only through stdin and stdout.
 *
 * Request (one JSON document on stdin):
 *   { op: 'parse', text }
 *   { op: 'generate', layout, keymap, text }
 * Response (one JSON document on stdout): { result } or { error }.
 *
 * Coupled to the vendored build in web/: the webpack module ids below and the
 * grammar patch must be updated if web/ is replaced with a different build.
 */
const fs = require('fs')
const path = require('path')
const { pathToFileURL } = require('url')

const WEB_DIR = process.argv[2]
const PARSE_MODULE = 33295
const GENERATE_MODULE = 83858
const FS_MODULE = 66317
const PATH_MODULE = 99918

const modules = {}

function loadChunk (file) {
  const grammar = path.join(WEB_DIR, fs.readdirSync(WEB_DIR).find(name => name.endsWith('.wasm') &&
    fs.statSync(path.join(WEB_DIR, name)).size < 50000))
  const text = fs.readFileSync(path.join(WEB_DIR, file), 'utf8')
    .replace('t.g.window?t(34886):"//../data/tree-sitter-devicetree.wasm"', JSON.stringify(grammar))
    // The runtime's locateFile only passes http(s) URLs through; ours are file URLs.
    .replace('e.startsWith("http")?e:t+e', 'e.startsWith("http")||e.startsWith("file:")?e:t+e')
  const self = { webpackChunkapp: { push: ([, chunkModules]) => Object.assign(modules, chunkModules) } }
  new Function('self', text)(self)
}

const cache = {}
const overrides = { [FS_MODULE]: fs, [PATH_MODULE]: path }

function webpackRequire (id) {
  if (id in overrides) return overrides[id]
  if (cache[id]) return cache[id].exports
  if (!modules[id]) throw new Error(`missing webpack module ${id}`)
  const module = (cache[id] = { exports: {} })
  modules[id].call(module.exports, module, module.exports, webpackRequire)
  return module.exports
}
webpackRequire.n = m => {
  const getter = m && m.__esModule ? () => m.default : () => m
  webpackRequire.d(getter, { a: getter })
  return getter
}
webpackRequire.d = (target, definition) => {
  for (const key in definition) {
    if (!Object.prototype.hasOwnProperty.call(target, key)) {
      Object.defineProperty(target, key, { enumerable: true, get: definition[key] })
    }
  }
}
webpackRequire.r = target => Object.defineProperty(target, '__esModule', { value: true })
// Module decorators webpack injects for CommonJS packages in the bundle.
webpackRequire.nmd = module => {
  module.paths = []
  if (!module.children) module.children = []
  return module
}
webpackRequire.o = (object, key) => Object.prototype.hasOwnProperty.call(object, key)
webpackRequire.g = globalThis
webpackRequire.p = webpackRequire.b = pathToFileURL(WEB_DIR + '/').href

async function handle ({ op, text, layout, keymap }) {
  if (op === 'parse') return webpackRequire(PARSE_MODULE)(text)
  if (op === 'generate') return webpackRequire(GENERATE_MODULE)(layout, keymap, text)
  throw new Error(`unknown operation: ${op}`)
}

async function main () {
  const files = fs.readdirSync(WEB_DIR)
  for (const prefix of ['vendors.', 'shared.', '24.']) {
    loadChunk(files.find(name => name.startsWith(prefix) && name.endsWith('.js')))
  }

  let input = ''
  for await (const chunk of process.stdin) input += chunk

  let response
  try {
    response = { result: await handle(JSON.parse(input)) }
  } catch (error) {
    response = { error: String((error && error.stack) || error) }
  }
  // Exit only once stdout has flushed; a large keymap would be cut off otherwise.
  process.stdout.write(JSON.stringify(response), () => process.exit(0))
}

main().catch(error => {
  process.stderr.write(String((error && error.stack) || error))
  process.exit(1)
})
