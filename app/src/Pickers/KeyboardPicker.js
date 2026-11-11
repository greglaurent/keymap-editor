import { useEffect } from 'react'
import PropTypes from 'prop-types'

import { loadLayout } from '../layout.js'
import { loadKeymap } from '../keymap.js'

/**
 * Loads the layout and keymap from the local zmk-config repo on mount and
 * reports them to the parent. Renders nothing.
 */
function KeyboardPicker({ onSelect }) {
  useEffect(() => {
    ;(async function () {
      const [layout, keymap] = await Promise.all([loadLayout(), loadKeymap()])
      keymap.layer_names = keymap.layer_names || keymap.layers.map((_, i) => `Layer ${i}`)
      onSelect({ layout, keymap })
    })()
  }, [onSelect])

  return null
}

KeyboardPicker.propTypes = {
  onSelect: PropTypes.func.isRequired
}

export default KeyboardPicker
