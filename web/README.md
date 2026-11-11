# Prebuilt editor

This directory is the compiled Keymap Editor web app, taken from the
`pages` branch of the upstream repository (the build that its hosted site
serves). It has the layer, conditional layer, combo, macro and behavior
editors, which the upstream source in `app/` never contained. The full
source was never published, so this is the build, not source.

Local changes to the build (all in `index.html` and the main chunk):

* The API address is empty (same origin) instead of the upstream hosted API.
* The GitHub source is disabled. The Local source is off because it needs
  the upstream's private backend.
* Social metadata and absolute upstream URLs were removed from `index.html`.
* Stale chunks from older builds were not copied.

The File System source (reads and writes `.keymap` files in place) is only
offered by browsers that support `showOpenFilePicker`, i.e. Chromium-based
ones. Other browsers get the Clipboard and Demo sources.
