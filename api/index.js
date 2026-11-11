const express = require('express')
const path = require('path')
const morgan = require('morgan')

const local = require('./routes/local')

const webDir = path.join(__dirname, '..', 'web')

const app = express()

app.use(express.json({ limit: '50mb' }))

app.use(morgan('dev'))
app.get('/health', (req, res) => res.sendStatus(200))

app.use(local)

// The UI is the prebuilt editor in web/ (see web/README.md). The app reports
// usage events to its API; nothing leaves this computer, so just accept them.
app.post('/v2/events*', (req, res) => res.sendStatus(204))

app.use(express.static(webDir))

module.exports = app
