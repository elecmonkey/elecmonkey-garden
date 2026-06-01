---
title: 'Rust bindgen: Generate Rust Bindings for C Header Files'
date: '2025-08-26'
tags: ['Rust', 'C/C++']
description: '`bindgen` automatically generates Rust FFI bindings to C and C++ libraries.'
author: 'Elecmonkey'
---

> This article was translated by AI and has not been manually reviewed.

## Basic Usage

### Command-Line Usage

First, install the bindgen executable:

```bash
cargo install bindgen-cli
```

Then run binding generation:

```bash
bindgen input.h -o bindings.rs
```

Here, `input.h` is your C header file, and `bindings.rs` is the generated Rust binding. If you need to pass include directories or macro definitions, add `--` followed by the corresponding clang arguments, such as `-I`, after the command.

### Library Usage (build.rs)

Add bindgen to `[build-dependencies]` in `Cargo.toml`, then use it in `build.rs`:

```rust
use std::env;
use std::path::PathBuf;
use bindgen;

fn main() {
    let bindings = bindgen::Builder::default()
        .header("wrapper.h")
        .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
        .generate()
        .expect("无法生成绑定");

    bindings.write_to_file(PathBuf::from(env!("OUT_DIR")).join("bindings.rs"))
        .expect("无法写入绑定文件");
}
```

In Rust code, include the generated bindings with `include!(concat!(env!("OUT_DIR"), "/bindings.rs"));`.

## Clang/Libclang Dependency

bindgen depends on libclang (Clang 9.0+).

- **Windows**: Use `winget install LLVM.LLVM`, and set `LIBCLANG_PATH` to the bin path of the LLVM installation directory
- **Linux (Debian/Ubuntu)**: `apt install libclang-dev`
- **macOS**: Install llvm with Homebrew

## Complex C Type Support

### Structs and Unions

- **Structs**: Directly translated into Rust structs with `#[repr(C)]`
- **Unions**: If all fields are Copy, native union is generated; otherwise, an `__BindgenUnionField` wrapper is generated

### Enum Handling

```rust
// 生成新类型加关联常量
.newtype_enum("MyEnum")

// 生成真正的 Rust enum（注意越界风险）
.rustified_enum("MyEnum")

// 位标志枚举
.bitfield_enum("MyFlags")
```

### Function Pointers

Function pointer types in C are converted to `Option<extern "C" fn(...)>`, supporting null pointer cases.

### Bitfield Handling

Rust does not natively support bitfields in C structs, so bindgen generates accessor methods:

```rust
// C: struct { unsigned a:1; unsigned b:1; unsigned c:2; };
let mut bf = unsafe { create_bitfield() };
bf.set_a(1);
println!("a={}", bf.a());
bf.set_b(1);
bf.set_c(3);
```

## Automatically Generating Bindings at Build Time

Dynamically generate bindings in `build.rs`:

```rust
use std::env;
use std::path::PathBuf;
use bindgen;

fn main() {
    let header = "wrapper.h";
    let bindings = bindgen::Builder::default()
        .header(header)
        .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
        // 可选：指定 clang 参数
        //.clang_args(&["-I/path/to/include"])
        // 可选：只生成需要的符号
        //.allowlist_function("foo_.*")
        //.allowlist_type("MyStruct")
        .generate()
        .expect("无法生成绑定");

    let out_path = PathBuf::from(env::var("OUT_DIR").unwrap()).join("bindings.rs");
    bindings.write_to_file(out_path).expect("写入绑定文件失败");

    // 链接 C 库
    println!("cargo:rustc-link-search=native=/path/to/lib");
    println!("cargo:rustc-link-lib=mylib");
}
```

## FFI Safety

### unsafe Usage

Put external functions and pointer operations inside `unsafe { }` blocks:

```rust
unsafe {
    let result = c_function(ptr);
}
```

### Signature Correctness

Rust cannot verify FFI function signatures at compile time, so you must use the correct C types, such as aliases from libc like `c_int` and `c_char`.

### Memory and Ownership

Clearly handle memory ownership and lifetimes when working with pointers:

```rust
// 字符串转换示例
use std::ffi::{CString, CStr};

let c_string = CString::new("Hello").unwrap();
let ptr = c_string.as_ptr();
// 调用 C 函数...
```

### Null Pointer Checks

Pointers are handled as `Option<fn>` returns, forcing callers to check for null pointers.

### Error Handling

Wrap error representations from C functions into common Rust error-handling enums: `Result` or `Option`.
