const childProcess = require('child_process')
const path = require('path')

const config = require('../config')

const appDir = path.join(__dirname, '..', '..', 'app')
const API_BASE_URL = `http://localhost:${config.PORT}`
const APP_BASE_URL = 'http://localhost:3000'

function init (app) {
  const opts = {
    cwd: appDir,
    env: Object.assign({}, process.env, {
      VITE_API_BASE_URL: API_BASE_URL,
      VITE_APP_BASE_URL: APP_BASE_URL
    })
  }

  childProcess.execFile('npm', ['run', 'dev'], opts, err => {
    console.error(err)
    console.error('Application serving failed')
    process.exit(1)
  })

  app.get('/', (req, res) => res.redirect(APP_BASE_URL))
}

module.exports = init
