# WebAssembly Demo Example

This is a minimal example showing how to load and run a WebAssembly (WASM) module in the browser, for testing WASM integration in the Multiface.js project.

## Contents
- `hello.rs` — Minimal Rust source for WASM
- `index.html` — Loads and runs the WASM module
- `wasm-demo.js` — JavaScript glue code
- `build.sh` — Build script (requires Rust and wasm-pack)

## Build & Run
1. Install [Rust](https://www.rust-lang.org/tools/install) and [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
2. Run `./build.sh` to build the WASM module
3. Open `index.html` in your browser

## Purpose
This is for checking WASM integration only. It does not depend on any Multiface.js SDK code.
