---
title: 'Rust bindgen：为 C 头文件生成 Rust 调用绑定'
date: '2025-08-26'
tags: ['Rust', 'bindgen', 'C-CPP']
description: '`bindgen` automatically generates Rust FFI bindings to C and C++ libraries.'
author: 'Elecmonkey'
---

## 基本用法

### 命令行方式

首先安装 bindgen 可执行文件：

```bash
cargo install bindgen-cli
```

然后运行绑定生成：

```bash
bindgen input.h -o bindings.rs
```

其中 `input.h` 是你的 C 头文件，`bindings.rs` 是生成的 Rust 绑定。如果需要传递包含目录或宏定义，可以在命令后加 `--` 及相应 clang 参数（例如 `-I`）。

### 库调用方式（build.rs）

在 `Cargo.toml` 的 `[build-dependencies]` 中加入 bindgen，然后在 `build.rs` 中使用：

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

在 Rust 代码中通过 `include!(concat!(env!("OUT_DIR"), "/bindings.rs"));` 来包含生成的绑定。

## Clang/Libclang 依赖

bindgen 依赖 libclang（Clang 9.0+）

- **Windows**: 使用 `winget install LLVM.LLVM`，设置 `LIBCLANG_PATH` 为 LLVM 安装目录的 bin 路径
- **Linux (Debian/Ubuntu)**: `apt install libclang-dev`
- **macOS**: 使用 Homebrew 安装 llvm

## 复杂 C 类型支持

### 结构体和联合体

- **结构体**: 直接翻译为带 `#[repr(C)]` 的 Rust 结构体
- **联合体**: 如果所有字段都可 Copy，生成原生 union；否则生成 `__BindgenUnionField` 包装

### 枚举处理

```rust
// 生成新类型加关联常量
.newtype_enum("MyEnum")

// 生成真正的 Rust enum（注意越界风险）
.rustified_enum("MyEnum")

// 位标志枚举
.bitfield_enum("MyFlags")
```

### 函数指针

C 中的函数指针类型会转换为 `Option<extern "C" fn(...)>`，支持空指针情况。

### 位域处理

Rust 不原生支持 C 结构体中的位域，bindgen 会生成访问器方法：

```rust
// C: struct { unsigned a:1; unsigned b:1; unsigned c:2; };
let mut bf = unsafe { create_bitfield() }; 
bf.set_a(1);
println!("a={}", bf.a());
bf.set_b(1);
bf.set_c(3);
```

## 构建时自动生成绑定

在 `build.rs` 中动态生成绑定：

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

## FFI 安全性

### unsafe 使用

外部函数和指针操作放在 `unsafe { }` 块中：

```rust
unsafe {
    let result = c_function(ptr);
}
```

### 签名正确性

Rust 无法在编译时验证 FFI 函数签名，必须使用正确的 C 类型（使用 libc 里的 `c_int`、`c_char` 等别名）。

### 内存和所有权

处理指针时明确内存所有权和生命周期：

```rust
// 字符串转换示例
use std::ffi::{CString, CStr};

let c_string = CString::new("Hello").unwrap();
let ptr = c_string.as_ptr();
// 调用 C 函数...
```

### 空指针检查

指针处理为 `Option<fn>` 返回，强迫调用方进行空指针检查。

### 错误处理

把 C 函数的错误表示包装成 Rust 中常用的错误处理枚举 —— `Result` 或 `Option`。