# Keymap Editor - Web Application

This is a single page application currently written in React to integrate with
the Keymap Editor API.

It handles keyboard selection and rendering of parsed keymap data into a visual
editor. This application is _aware_ of some of the particulars of ZMK, but it
receives key bindings already parsed into a tree of values and parameters.

## Building

The easiest way to use this is locally, served up via the API itself (in the
repo root, run `npm run dev` and open `http://localhost:8080` in your browser).

Configuration is provided via environment variables, set automatically by
`npm run dev` in the repo root (see [config module](./src/config.js)).

Variable                    | Description
----------------------------|-------------
`VITE_API_BASE_URL`    | URL of the backend API.
`VITE_APP_BASE_URL`    | URL of _this_ app.
