// JS glue for @multiface.js/wasm-utils
export async function loadWasmUtils() {
  const response = await fetch('wasm-utils.wasm');
  const bytes = await response.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes);
  return instance.exports;
}

// Example usage:
// const wasm = await loadWasmUtils();
// const sum = wasm.add(2, 3);
