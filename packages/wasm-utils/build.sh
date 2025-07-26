#!/bin/bash
set -e
cd src
rustc --target wasm32-unknown-unknown -O --crate-type=cdylib lib.rs -o ../js/wasm-utils.wasm
cd ..
echo "Built wasm-utils.wasm in js/"
