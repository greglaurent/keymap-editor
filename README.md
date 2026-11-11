# Keymap Editor

A browser app (plus Node.js server) to edit ZMK keymaps. This is a private fork
kept for personal use. It isn't a substitute for understanding ZMK, so read
ZMK's documentation to make full use of it.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./screenshots/editor-screenshot-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./screenshots/editor-screenshot-light.png">
  <img alt="Screenshot of the Keymap Editor showing a graphical layout of a keyboard with a loaded keymap." src="./screenshots/editor-screenshot-light.png">
</picture>

## Features

This is the upstream Keymap Editor's prebuilt web app (in `web/`) without its
GitHub integration, served by a small local server that reads and writes the
`.keymap` files of a zmk-config repo on this computer:

* Layers, conditional layers, combos, macros and behaviors
* Rotary encoder (sensor) bindings
* Layouts for the keyboards ZMK supports
* Dark and light themes

## Usage

This runs only on your own machine and edits a local zmk-config repo. See
[running-locally.md](running-locally.md) for setup. In short:

1. `direnv allow` (or `nix develop path:.`) for the pinned tools.
2. `just setup`, then set `ZMK_CONFIG_PATH` in `.env`.
3. `just start` (or `just dev`, which restarts on code changes), or `just up`
   for Docker. Open `http://localhost:4710`. The port is `PORT` in `.env`.

Firmware builds are out of scope: commit the saved files and build and flash
with your usual ZMK setup.

## License

The code in this repo is available under the MIT license. The collection of ZMK
keycodes is taken from the ZMK documentation, also under the MIT license.
