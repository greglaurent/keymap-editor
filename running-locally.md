# Running Locally

This tool edits the keymap files of a `zmk-config` repo already cloned onto
your computer. Nothing leaves the machine.

## Setup

The Nix flake pins the tools (Node 22, just, git, Docker clients). With
direnv, `direnv allow`; otherwise `nix develop path:.`.

1. Clone a `zmk-config` repo anywhere on your machine.
2. `just setup` creates `.env` from `.env.template`. Set `ZMK_CONFIG_PATH` to
   that repo (default `../zmk-config`, relative to this directory). `PORT`
   defaults to 4710.
3. `just install`

## Run

* `just start`: the editor at `http://localhost:4710`.
* `just dev`: the same, restarting the server when code changes.
* `just up`: the same in Docker (`compose.yaml`), with your zmk-config mounted
  at `/zmk-config`. Set `LOCAL_UID` and `LOCAL_GID` in `.env` to the output of
  `id -u` and `id -g` so saved files stay yours. `just down` stops it and
  `just logs` follows the log.

Pick **Local** as the source. If the page does not look right, make sure no
older server is still running on the port (`ss -ltnp | grep 4710`).

The server listens on loopback only (the container publishes on
`127.0.0.1`), so it is not reachable from the network.

## Using the editor

This is the upstream Keymap Editor, minus its GitHub integration. All of its
pages are there: layers, conditional layers, combos, macros and behaviors. Pick
**Local** as the source, then your keyboard, and use **Save Changes** to write
the keymap back to your zmk-config repo. From there, build and flash the
firmware as usual.

## How the files are used

Inside `<ZMK_CONFIG_PATH>/config/`:

* Each `*.keymap` file is one keyboard, named after the file. The editor parses
  it with its own parser and writes changes back with its own generator.
* The layout comes from `config/info.json` if the repo has one. Otherwise it is
  the bundled layout for the keyboard named like the keymap (`corne.keymap` is
  a Corne), or the one matching a `shield:` or `board:` in `build.yaml`.
  An unsupported keyboard shows the editor's "layout generation failed" dialog.

The parser and generator are the upstream's compiled code in `web/`. The server
runs them in a child process that can read only `web/` and has no network
access (see `api/services/zmk/keymap-lib.js`).
