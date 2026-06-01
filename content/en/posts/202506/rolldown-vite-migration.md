---
title: "Rolldown-Vite Announces Feature Parity with Vite, Evan You and His Next-Generation Frontend Toolchain"
date: "2025-06-02"
description: "Vite + Rust, a vision for the future of frontend build tools"
tags: ["Vite", "Rolldown", "Build Tools", "Rust", "Frontend Engineering"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

## Rolldown-Vite Officially Released

On May 30, 2025, Vue.js creator Evan You officially announced the release of **Rolldown-Vite** on the VoidZero blog. This is not only an important milestone for Rolldown, but also for Vite. From the very beginning, Rolldown's goal has been to replace esbuild and Rollup inside Vite and become Vite's underlying tool.

As one of today's leaders in frontend developer experience, Vite brought lightning-fast startup and instant hot updates with its native ESM-based dev server. However, in production builds and complex project handling, Vite still has issues that leave many developers, and its author Evan You, unsatisfied.

## Three Small Problems in Vite Engineering

### Rollup Build Speed Bottleneck

The current version of Vite uses different tools at different stages. During development, it uses esbuild, written in Go, for fast dependency pre-bundling and transformation. esbuild's speed is impressive, as its official website says:

> While **esbuild** is busy parsing your JavaScript, **node** is busy parsing your bundler's JavaScript.

This is the performance advantage of native languages. But Evan You has been dissatisfied with missing capabilities in esbuild's bundling, such as output control. During production builds, Vite still chooses Rollup, written in Node.js, for final bundling. Although Rollup has a mature plugin ecosystem and flexible output control, its JavaScript-based nature often becomes a build-speed bottleneck when handling large projects.

### Development and Production Are Inconsistent

Vite uses esbuild in development to quickly process most assets. esbuild is fast enough, and development does not require much from bundling: it only needs to complete transpilation (TypeScript, JSX) and produce code browsers can run. In production, esbuild only performs the initial transformation, and Rollup handles the final bundled output.

This inconsistency can cause the same code to run normally in development but fail after a production build. People usually do not think of this immediately, which may make it a breeding ground for some bugs. In addition, needing to understand and configure both esbuild and Rollup behavior increases the complexity of Vite configuration and worsens this inconsistency.

### Repeated AST Parsing in the Frontend Toolchain

In modern frontend engineering, a project often uses multiple tools to process JavaScript/TypeScript code: ESLint (code style), Babel (transpilation), and various bundlers (bundling, minification, Tree-Shaking). These tools each have their own parser and repeatedly parse the same source code into an AST (Abstract Syntax Tree).

This repeated parsing brings significant performance overhead and unnecessary repeated AST work. Every tool has to parse the code from scratch, then generate target code for the next tool, which is inefficient.

## The Next-Generation Solution

To solve the pain points above, Evan You and his VoidZero team developed Rolldown and Oxc. Replacing Rollup and esbuild in Vite with Rolldown became **Rolldown-Vite**.

### Rolldown: A High-Performance Rust Build Tool

Rolldown is a native build tool written in Rust. From its birth, it was designed to be a direct replacement for Rollup. Compatibility with Rollup's mature plugin system is very important for the community, and it must also have the flexible output control that Evan You values in Rollup. At the same time, Rust's native performance significantly improves build speed.

### Oxc: A Unified JavaScript Language Toolchain

**Oxc** is another core project developed by the VoidZero team. As Rolldown's foundation, it supports the entire build process. It is a complete JavaScript language toolchain implemented in Rust, including a Parser, Linter, Transformer, and more. Oxc provides unified APIs so different tools can share ASTs and avoid repeated parsing. Rolldown-Vite's internal transformation and minification are handled by Oxc.

By combining Rolldown (high-performance bundling) and Oxc (a unified language toolchain), Rolldown-Vite builds a full-process high-performance Rust toolchain from parsing and transformation to bundling. It effectively solves Vite's current problems of slow production builds and repeated AST parsing, and moves toward VoidZero's grand vision: **a unified frontend toolchain based on Vite**.

## Migration Guide

### Installing Rolldown-Vite

The simplest migration method is to use a package alias. In `package.json`:

```json
{
  "dependencies": {
    "vite": "npm:rolldown-vite@latest"
  }
}
```

If you use VitePress or another framework that treats Vite as a peerDependency, you need to override its configuration:

```json
{
  "pnpm": {
    "overrides": {
      "vite": "npm:rolldown-vite@latest"
    }
  }
}
```

### API Migration

Evan You's team's near-term goal is compatibility with Vite's API. They provide compatibility layers for Rollup and Esbuild configuration, so most existing project configurations can continue to work well.

[The Rolldown configuration in the Vite docs](https://cn.vite.dev/guide/rolldown.html) says:

> Rolldown-Vite has a compatibility layer for converting esbuild options into corresponding Oxc or rolldown options.

> That said, we will remove support for esbuild options in the future and encourage you to try the corresponding Oxc or rolldown options.

This is understandable. Current configuration names are things like `rollupOptions` and `esbuildOptions`. At a glance, that is obviously not a long-term solution. Since everything is becoming rolldown, the config names cannot keep the old names forever. If you can tolerate console warnings for now, migration can be smooth.

But using the same `vite.config.ts` does not always produce the same behavior as current Vite. In testing, `manualChunks` reports as unsupported:

```typescript
manualChunks: {
  react: ['react', 'react-dom'],
  antd: ['antd', '@ant-design/icons'],
}
```

You need to use the `advancedChunks` configuration:

```typescript
advancedChunks: {
  groups: [
    {
      name: 'react',
      test: /node_modules[\\/]+react/,
      priority: 100,
    },
    {
      name: 'antd',
      test: /node_modules[\\/]+(@ant-design|antd)/,
      priority: 90,
    },
  ],
}
```

### Plugin Migration

Many ecosystem plugins use Rollup or esbuild configuration APIs. If you have clearly finished migrating `vite.config.ts` but still see console warnings, the issue may be in a plugin.

Vite's core plugins are actively being migrated. Check the GitHub repositories and pay attention to the community; there may be surprises. For example, `@vitejs/plugin-react` can work correctly in Rolldown-Vite directly, but the console will show API migration warnings. Switching to `@vitejs/plugin-react-oxc` makes everything completely ok.
