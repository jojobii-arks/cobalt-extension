# cobalt-extension

- A chrome extension for [@wukko/cobalt](https://github.com/wukko/cobalt)
  - Not supported by current cobalt fork atm. Use a fork I made that enables CORS [`@jojobii-arks/cobalt-epic-style`](https://github.com/jojobii-arks/cobalt-epic-style)
- Vite + React + TypeScript + TailwindCSS/DaisyUI
- Meant as a proof of concept. Will elaborate on eventually.

## Preview

![msedge_rQHE8P9p2M](https://user-images.githubusercontent.com/78003700/228158721-748d145c-720a-400a-b1cd-beb5071f7338.gif)

## To-Do

- Image Picker.

## Development

- Run `pnpm watch` to build on filechange.
- Import built extension from `./dist` into Chrome via `chrome://extensions/` URL or for Edge `edge://extensions/`
