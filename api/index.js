const express = require('express')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const config = require('./config')
const applicationInit = require('./routes/application')
const keyboards = require('./routes/keyboards')

const app = express()

const { origin } = new URL('http://localhost:3000')

app.use(bodyParser.json())
app.use(cors({ origin }))

if (config.ENABLE_DEV_SERVER) {
  applicationInit(app)
}

app.use(morgan('dev'))
app.get('/health', (req, res) => res.sendStatus(200))

app.use(keyboards)

// Without the dev server, serve the built app (npm run build in app/).
const buildDir = path.join(__dirname, '..', 'app', 'build')
if (!config.ENABLE_DEV_SERVER && fs.existsSync(buildDir)) {
  app.use(express.static(buildDir))
}

module.exports = app
