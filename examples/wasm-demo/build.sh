#!/bin/bash
set -e
# Build hello.rs to WASM using Rust
rustc --target wasm32-unknown-unknown -O --crate-type=cdylib hello.rs -o hello.wasm
