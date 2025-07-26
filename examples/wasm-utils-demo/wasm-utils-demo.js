import { loadWasmUtils } from '../../packages/wasm-utils/js/wasm-utils.js';

let wasm;
(async () => {
  wasm = await loadWasmUtils();
})();

window.addNumbers = function() {
  const a = parseInt(document.getElementById('numA').value, 10);
  const b = parseInt(document.getElementById('numB').value, 10);
  const sum = wasm.add(a, b);
  document.getElementById('sumResult').textContent = ` = ${sum}`;
};

window.reverseString = function() {
  const str = document.getElementById('strInput').value;
  // Allocate memory in WASM
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const ptr = wasm.__heap_base || 1024; // crude heap pointer for demo
  const mem = new Uint8Array(wasm.memory.buffer, ptr, bytes.length);
  mem.set(bytes);
  wasm.reverse(ptr, bytes.length);
  const decoder = new TextDecoder();
  const reversed = decoder.decode(new Uint8Array(wasm.memory.buffer, ptr, bytes.length));
  document.getElementById('revResult').textContent = ` = ${reversed}`;
};
