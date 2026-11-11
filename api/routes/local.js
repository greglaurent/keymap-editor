const fs = require('fs')
const { Router } = require('express')

const config = require('../config')
const keyboards = require('../services/zmk/keyboards')
const { generateKeymap, parseKeymap } = require('../services/zmk/keymap-lib')

const repo = config.ZMK_CONFIG_PATH
const listKeyboards = () => keyboards.listKeyboards(repo)
const keymapPath = name => keyboards.keymapPath(repo, name)
const loadInfo = name => keyboards.loadInfo(repo, name)

/** Same choice the editor makes: the layout named by the chosen matrix transform, else the first. */
function preferredLayout (keymap, layouts) {
  const chosen = Object.keys(keymap.chosen || {})
    .reverse()
    .find(key => /zmk,matrix[_-]transform/.test(key))
  const first = Object.keys(layouts)[0]
  return layouts[chosen ? keymap.chosen[chosen].replace(/^&/, '') : null] || layouts[first]
}

const router = Router()
const sendError = (res, error) => {
  console.error(error)
  res.status(500).json({ name: error.name, message: error.message })
}
const requireKnownKeyboard = (req, res, next) => (
  listKeyboards().includes(req.params.name) ? next() : res.sendStatus(404)
)

router.get('/v2/local/keyboards', (req, res) => {
  try {
    res.json(listKeyboards())
  } catch (error) {
    sendError(res, error)
  }
})

router.get('/v2/local/keyboards/:name', requireKnownKeyboard, async (req, res) => {
  try {
    const { name } = req.params
    const info = loadInfo(name)
    const keymap = await parseKeymap(fs.readFileSync(keymapPath(name), 'utf8'))
    res.json({ info, keymap, sensors: info.sensors || [] })
  } catch (error) {
    sendError(res, error)
  }
})

router.put('/v2/local/keyboards/:name/keymap', requireKnownKeyboard, async (req, res) => {
  try {
    const { name } = req.params
    const file = keymapPath(name)
    const { layouts } = loadInfo(name)
    const original = fs.readFileSync(file, 'utf8')
    const layout = preferredLayout(await parseKeymap(original), layouts).layout

    const generated = await generateKeymap(layout, req.body, original)
    fs.writeFileSync(file, generated)
    res.json(await parseKeymap(generated))
  } catch (error) {
    sendError(res, error)
  }
})

module.exports = router
