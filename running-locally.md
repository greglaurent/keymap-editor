# Running Locally

This tool edits the keymap files of a `zmk-config` repo already cloned onto
your computer. Nothing leaves the machine.

## Setup

The Nix flake pins the tools (Node 22, just, git, Docker clients). With
direnv, `direnv allow`; otherwise `nix develop path:.`.

1. Clone a `zmk-config`\* repo anywhere on your machine.
2. `just setup` creates `.env` from `.env.template`. Set `ZMK_CONFIG_PATH` to
   that repo (default `../zmk-config`, relative to this directory). `PORT`
   defaults to 8080.
3. `just install`

## Run

* `just dev`: API plus React dev server. Open `http://localhost:3000`.
* `just start`: build the app and serve it from the API at
  `http://localhost:8080`, without Docker.
* `just up`: the same in Docker (`compose.yaml`), with your zmk-config mounted
  at `/zmk-config`. Set `LOCAL_UID` and `LOCAL_GID` in `.env` to the output of
  `id -u` and `id -g` so saved files stay yours. `just down` stops it and
  `just logs` follows the log.

The server listens on loopback only (the container publishes on
`127.0.0.1`), so it is not reachable from the network.

\**The editor works using metadata files that describe the layout and keymap of
the keyboard. This is based on JSON files used by QMK and Keyboard Layout Editor
with some customization to generated human readable code as well.*

## Using the editor

Your keyboard is loaded automatically. Click on the top-left corner of a key to
change its bind behaviour, or in the middle to change the bind parameter.

See also: [demo video](keymap-editor-demo.mov)

Click the _Save Local_ button to save the modified keymap back to your
zmk-config repo. From here you can build and flash the firmware as usual.
