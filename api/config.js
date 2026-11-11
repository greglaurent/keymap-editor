const path = require('path')
const process = require('process')

// Load .env from the working directory if present (built into Node 22).
try {
  process.loadEnvFile()
} catch (err) {
  if (err.code !== 'ENOENT') throw err
}

const PORT = process.env.PORT || 8080
// Loopback only by default; the Docker image sets 0.0.0.0 (compose publishes
// the port on this computer only).
const HOST = process.env.HOST || '127.0.0.1'
const ENABLE_DEV_SERVER = process.env.ENABLE_DEV_SERVER
// Local zmk-config repo to read and write. Relative paths resolve against the
// directory the server is started from.
const ZMK_CONFIG_PATH = path.resolve(process.env.ZMK_CONFIG_PATH || '../zmk-config')

module.exports = {
  PORT,
  HOST,
  ENABLE_DEV_SERVER,
  ZMK_CONFIG_PATH
}
