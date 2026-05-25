---
title: "Rolldown-Vite 宣布功能达到 Vite，Evan You 和他的下一代前端工具链"
date: "2025-06-02"
description: "Vite + Rust，前端构建工具的未来愿景"
tags: ["Vite", "Rolldown", "构建工具", "Rust", "前端工程化"]
author: "Elecmonkey"
---

## Rolldown-Vite 正式发布

2025年5月30日，Vue.js 作者 Evan You 在 VoidZero 官方博客正式宣布了 **Rolldown-Vite** 的发布。这不仅是 Rolldown 的，也是 Vite 的一个重要里程碑—— Rolldown 从最开始，目标就是取代 Vite 中的 esbuild 和 Rollup，成为 Vite 的底层工具。

作为当前前端开发体验的佼佼者，Vite 凭借其基于原生 ESM 的开发服务器带来了闪电般的启动速度和即时热更新。然而，在生产构建和复杂项目处理上，Vite 仍然有着让很多开发者、让它的作者尤雨溪并不满意的地方。

## Vite 工程的三个小问题

### Rollup 构建速度瓶颈

目前版本的 Vite 在不同阶段使用不同的工具。在开发阶段，利用用 Go 编写的 esbuild 进行快速的依赖预构建和转换。esbuild 的速度令人印象深刻，正如其官网所言：

> While **esbuild** is busy parsing your JavaScript, **node** is busy parsing your bundler's JavaScript.

这是原生语言的性能优势。但尤雨溪对 esbuild 在打包中某些能力（比如产物控制）的缺失感到不满。在生产构建阶段，Vite 仍然选择了 Node.js 编写的 Rollup 进行最终打包。虽然 Rollup 拥有成熟的插件生态和灵活的产物控制能力，但其基于 JavaScript 的特性在处理大型项目时，构建速度往往成为瓶颈。

### 开发环境与生产环境不一致

Vite 在开发环境使用 esbuild 对大多数资源进行快速的处理，esbuild 足够快，而且在开发环境对打包的要求并不高——完成转译（TypeScript、JSX）、浏览器可以执行即可。而在生产环境仅使用 esbuild 完成初步的转换，后续产物则使用 Rollup 进行打包。

这种不一致性可能导致同一份代码在开发环境运行正常，但在生产构建后出现问题。但是大家一般很难想到这这一点——这可能就是某些 bug 的温床。此外，需要同时理解和配置 esbuild 和 Rollup 的行为也增加了 Vite 配置的复杂性，加剧了这种不一致。

### 前端工具链的 AST 重复解析

在现代前端工程中，一个项目往往会使用多种工具来处理 JavaScript/TypeScript 代码：ESLint (代码风格)、Babel (代码转译)、各种 Bundler (打包、压缩、Tree-Shaking)。这些工具各自有自己的解析器，对同一份源代码进行重复的 AST (抽象语法树) 解析。

这种重复解析带来了显著的性能开销和不必要的 AST 反复解析。每一次工具处理都需要从头开始解析代码，然后生成目标代码传递给下一个工具，效率低下。

## 下一代解决方案

正为了解决上述痛点，Evan You 和他的 VoidZero 团队开发了 Rolldown 和 Oxc。使用 Rolldown 替换掉 Vite 中的 Rollup 和 esbuild，成为了 **Rolldown-Vite**。

### Rolldown：高性能的 Rust 构建工具

Rolldown 是一个用 Rust 编写的原生构建工具，从诞生起就旨在成为 Rollup 的直接替代品——兼容 Rollup 成熟的插件系统对于社区非常重要，同时它当然要有尤雨溪看中 Rollup 的灵活的产物控制能力，同时凭借 Rust 的原生性能，显著提升了构建速度。

### Oxc：统一的 JavaScript 语言工具链

**Oxc** 是 VoidZero 团队开发的另一个核心项目，作为 Rolldown 的底层支撑着整个构建流程工作。它是一个完整的 Rust 实现的 JavaScript 语言工具链，包含了 Parser、Linter、Transformer 等。Oxc 提供统一的 API，使得不同的工具可以共享 AST，避免重复解析。Rolldown-Vite 的内部转换和压缩正是由 Oxc 处理。

通过将 Rolldown (高性能打包) 和 Oxc (统一语言工具链) 结合，Rolldown-Vite 构建了一个从解析、转换到打包的全流程高性能 Rust 工具链，有效地解决了当前 Vite 在生产构建速度慢和 AST 重复解析的问题，并朝着**基于 Vite 的统一前端工具链**——VoidZero 这一宏大的愿景迈进。

## 迁移指南

### 安装 Rolldown-Vite

最简单的迁移方式是使用包别名。在 `package.json` 中：

```json
{
  "dependencies": {
    "vite": "npm:rolldown-vite@latest"
  }
}
```

如果使用的是 VitePress 或其他将 Vite 作为 peerDependency 的框架，需要使用 overrides 掉里面的配置：

```json
{
  "pnpm": {
    "overrides": {
      "vite": "npm:rolldown-vite@latest"
    }
  }
}
```

### API 迁移

尤雨溪团队的近期目标是兼容 Vite 的 API，提供了关于 Rollup 和 Esbuild 配置的兼容层，所以大多数原本项目中的配置都能很好的继续使用。

[Vite 文档中的 Rolldown 配置](https://cn.vite.dev/guide/rolldown.html)说：

> Rolldown-Vite 有一个兼容层，用于将 esbuild 的选项转换为相应的 Oxc 或 rolldown 选项。

> 虽说如此，但我们将在未来移除对 esbuild 选项的支持，并鼓励你尝试使用相应的 Oxc 或 rolldown 选项。

这也好理解。现在的配置名字叫 `rollupOptions` `esbuildOptions` 之类的，这一看就不是长久之计嘛，都变成 rolldown 了，配置名字不能老保留旧的。不管可以忍得住控制台的警告的话，目前可以平滑迁移。

但使用相同的 `vite.config.ts` 并非总是和目前的 Vite 有相同的行为，经测试，使用`manualChunks` 提示不受支持：

```typescript
manualChunks: {
  react: ['react', 'react-dom'],
  antd: ['antd', '@ant-design/icons'],
}
```

需要使用 `advancedChunks` 配置：

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
### 插件迁移

很多生态中的插件会使用 Rollup 或者 esbuild 的配置 API。如果你明明已经完成了 `vite.config.ts` 的迁移，但仍然会看到控制台的警告，那么可能就是插件的问题。

Vite 的核心插件已经在积极的迁移中了，去 GitHub 仓库多看看，多关注一下社区，可能有惊喜。比如使用 `@vitejs/plugin-react` 能在 Rolldown-Vite 中直接正确工作，但是控制台会提示 API 迁移。换成 `@vitejs/plugin-react-oxc` 就完全 ok 了。