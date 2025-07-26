async function loadWasm() {
  const response = await fetch('hello.wasm');
  const bytes = await response.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes);
  // Call the exported function
  const result = instance.exports.add(2, 3);
  document.getElementById('output').textContent = '2 + 3 = ' + result;
}
window.onload = loadWasm;
