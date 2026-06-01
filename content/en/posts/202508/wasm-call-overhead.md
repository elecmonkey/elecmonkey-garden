---
title: "WebAssembly Call Overhead Analysis"
date: "2025-08-26"
tags: ["WebAssembly", "Performance Optimization", "JavaScript", "Rust"]
description: "I hope no magical optimizations interfered with the test; I really do not understand all the compilation mechanisms of Rust and V8 very well."
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

> I hope no magical optimizations interfered with the test; I really do not understand all the compilation mechanisms of Rust and V8 very well.

## Call Overhead Analysis

The simplest addition operation inside WASM.

### Test Environment

- Number of tests: 1,000,000
- Test tool: Chrome 139

### Test Results

| Metric | Value |
| :--- | :--- |
| Total calls | 1,000,000 |
| Total time | 21.50ms |
| Time per call | 21.50 nanoseconds |
| Calls per second | 46,511,628 |
| Overhead per call | 0.0215 microseconds |

## Compute-Intensive Test (Rust vs JavaScript)

Test of recursively calculating the 40th Fibonacci number.

### Test Environment

- Test tool: Chrome 139
- Rust (WASM) executions: 50,000
- JavaScript executions: 5

### Test Results

#### Rust (WASM) Results for 50,000 Executions

- Total time: 6.40ms

#### JavaScript Results for 5 Executions

- Total time: 3549.40ms
