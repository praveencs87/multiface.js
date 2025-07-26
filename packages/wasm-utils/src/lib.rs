// WASM utility library for Multiface.js
#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[no_mangle]
pub extern "C" fn reverse(ptr: *mut u8, len: usize) {
    unsafe {
        let slice = std::slice::from_raw_parts_mut(ptr, len);
        slice.reverse();
    }
}
