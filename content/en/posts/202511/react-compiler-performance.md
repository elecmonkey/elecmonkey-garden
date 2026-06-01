---
title: 'Testing the Impact of React Compiler on Build Time in a Vite Project'
date: '2025-11-13'
description: 'After introducing React Compiler, Rolldown-Vite with Oxc build time increased by 174%; Vite (Rollup) build time increased by 40%.'
tags: ['React', 'React Compiler', 'Vite', 'Rolldown']
author: 'Elecmonkey'
---

> This article was translated by AI and has not been manually reviewed.

## Test Scenario

A medium-sized React admin project based on Vite. It had already been migrated to Rolldown-Vite before, with no obvious compatibility issues.

- Node.js 24.4.1
- MacBook Air M2

## Test Results

### Rolldown-Vite + Oxc

| Test Run | 1st | 2nd | 3rd | 4th | 5th | Average |
|---------|-------|-------|-------|-------|-------|--------|
| **Without React Compiler** | 1.41s | 954ms | 943ms | 847ms | 863ms | **1.00s** |
| **With React Compiler** | 3.06s | 2.71s | 2.71s | 2.57s | 2.62s | **2.74s** |

**Build time increased by 174%**

### Vite (Rollup)

| Test Run | 1st | 2nd | 3rd | 4th | 5th | Average |
|---------|-------|-------|-------|-------|-------|--------|
| **Without React Compiler** | 7.34s | 7.02s | 6.87s | 6.51s | 6.63s | **6.87s** |
| **With React Compiler** | 8.66s | 8.12s | 10.87s | 11.31s | 9.23s | **9.64s** |

**Build time increased by 40%**

### Rolldown-Vite + Swc

One additional benchmark where swc handles JSX transpilation:

| Test Run | 1st | 2nd | 3rd | 4th | 5th | Average |
|---------|-------|-------|-------|-------|-------|--------|
| **Without React Compiler** | 786ms | 824ms | 1.05s | 882ms | 760ms | **860ms** |

## Brief Analysis

The rendering pipeline of a "pure" React project can be completely taken over by toolchains such as oxc/rolldown, with a unified internal AST format. Currently, React Compiler is provided only as a Babel plugin and depends on Babel AST. Therefore, any solution that adds React Compiler to a build process not backed by Babel introduces a completely independent build process. `.tsx` source code is first parsed by oxc into its own AST, processed for a while, turned back into code, then parsed again by Babel, transformed by babel-plugin-react-compiler into its own IR, processed for another while, and converted back.

That said, Babel AST is indeed an established community standard, and it is hard to imagine that the React team would be willing to rewrite or maintain multiple versions of the logic for converting from AST to React Compiler IR. The future looks somewhat hazy.

But then again, for now React Compiler does not bring an order-of-magnitude impact on build time. It should be considered controllable. The value of React Compiler is obvious, and after it stabilizes it should become standard for React projects. However, although it has already released a stable version, the flood of bug reports in the Issue section may suggest that we can continue to wait and see.
