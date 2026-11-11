const { execFile } = require('child_process')
const path = require('path')

const WEB_DIR = path.join(__dirname, '..', '..', '..', 'web')
const WORKER = path.join(__dirname, 'keymap-worker.cjs')
const TIMEOUT_MS = 30000
const MAX_BUFFER = 64 * 1024 * 1024

/**
 * Run one operation in the sandboxed worker. The worker may only read web/
 * and its own script; it gets no network, no other files and no child
 * processes, so the compiled library it runs cannot touch anything else.
 */
function run (request) {
  const args = [
    '--permission',
    `--allow-fs-read=${WEB_DIR}`,
    `--allow-fs-read=${WORKER}`,
    WORKER,
    WEB_DIR
  ]

  return new Promise((resolve, reject) => {
    const child = execFile(
      process.execPath,
      args,
      { timeout: TIMEOUT_MS, maxBuffer: MAX_BUFFER },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(`keymap worker failed: ${err.message}\n${stderr}`))
        const response = JSON.parse(stdout)
        if (response.error) return reject(new Error(response.error))
        resolve(response.result)
      }
    )
    child.stdin.end(JSON.stringify(request))
  })
}

/** Parse `.keymap` text into the editor's keymap structure. */
const parseKeymap = text => run({ op: 'parse', text })

/**
 * Apply an edited keymap to the original `.keymap` text and return the new
 * text. Parts of the file the editor does not manage are left as they were.
 */
const generateKeymap = (layout, keymap, text) => run({ op: 'generate', layout, keymap, text })

module.exports = { parseKeymap, generateKeymap }
