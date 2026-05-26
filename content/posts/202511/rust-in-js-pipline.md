---
title: '原生 JavaScript 工具链中绕不开的 JavaScript 成份'
date: '2025-11-12'
description: '处理 JavaScript 代码的工具并不需要是 JavaScript 程序，但处理 JavaScript 代码的人必须是 JavaScript 程序员。'
tags: ['Rust', 'JavaScript', '前端工具链', 'Rolldown', 'swc', '构建工具', 'React Compiler']
author: 'Elecmonkey'
---

## JavaScript 处理 JavaScript

早期的前端构建工具几乎都是用 JavaScript 写的：
Babel 负责语法降级，Webpack 负责模块打包，ESLint、Terser、UglifyJS 等工具负责静态分析与压缩。

这种“用 JavaScript 构建 JavaScript”模式有其出现的必然性 —— 要处理 JavaScript，当然是 JavaScript 程序员自己最熟悉 JavaScript。

但它也带来了固有的矛盾——性能。Node.js 单线程模型和解释型语言特性，让 JS 在 CPU 密集型任务（如 AST 解析、代码生成）上显得力不从心。其实我们都知道，从原则上讲，**处理 JS 代码的工具并不需要是 JS**，只要能处理文本的语言都可以构建这些工具——无非就是 parse 一下，变成 AST，然后对着 AST 一通修饰之后转化回去。

为了解决性能问题，新一代的工具链浪潮来了。

## Go 与 Rust 工具链

自从 esbuild（Go） 展现出惊人的构建速度后，Rust 社区也诞生了 swc、oxc、rolldown 等一系列“原生编译器系”工具。

这些工具的共同特点是：

- 基于编译型语言（Go/Rust）实现高性能。
- 对生态兼容，往往模仿 Babel、Rollup 的插件接口。

理论上，这些工具完全可以取代原有的 JS 实现。但实践上，却始终绕不开一个问题——构建流水线中的 “JS 成分”。

## 绕不开的“JS 成分”

### Vue.js

以 Vite 构建的 Vue.js 项目为例：

使用 Rolldown-Vite（[Rolldown-Vite 宣布功能达到 Vite，Evan You 和他的下一代前端工具链
](https://www.elecmonkey.com/blog/rolldown-vite-migration)、[值得开始尝试 Rolldown-vite 了吗](https://www.elecmonkey.com/blog/rolldown-vite-production-ready)），可以让底层打包器可以从 [Rollup](https://rollupjs.org/)（JS）换成 [Rolldown](https://rolldown.rs/)（Rust），但是总得调用 vite-plugin-vue 吧？vite-plugin-vue 是 JS 写的，它要编译 Vue 的单文件组件 vue-compiler-sfc 也是 JS 写的。打开 Vue 的源码看看，vue-compiler-sfc 内部甚至使用了 Babel。

换句话说，即使底层换成了 Rust，构建链路仍然会多次回到 JS 世界。将一棵 AST 在 Rust 世界和 JavaScript 世界之间来回传递的性能损耗是无法想象的。这让 Rust 工具链的“极速”在实际工程中被大量的 JS 插件调用所稀释。

### React

React 一直没有很多的构建步骤，JSX 转换由工具链完成。作为一个很容易转换、没有太多编译时逻辑的“语法”，JSX 转译很容易被各种工具原生支持。因此，像 esbuild、swc、rolldown 这类工具对 React 支持非常自然：只要内置 JSX 转换器即可。我一度感觉 React 是原生工具链的最大受益者 —— 使用 Rolldown-Vite，真的可以做到 React 项目从源码到生产资源全部由原生工具完成。

2025年10月7日，React Compiler 官宣发布第一个正式版本。React 开始追赶自己在缺失“编译时优化”方面和 Vue 拉开的性能差距。React Compiler 目前仍然是以一个 Babel 插件的形式出现的。不管 React Compiler 以如何的形式嵌入构建工作流（例如，swc 中嵌入一个 QuickJS 实例来避免需要单独安装 Babel），这个 "Compiler" 的逻辑是用 JS 编写的，那就怎么都绕不开这一段 JS 运行所需要的时间。

### Solid.js & Svelte

这种重度编译时（甚至 Svelte 一度以0框架运行时为目标）的框架就不用说了，大量逻辑由编译器在编译时完成，这些编译器无一例外都是 JS 写的。这部分时间在构建过程中是难以压缩的，不管是什么语言写的构建工具来调用都得老老实实的等着。

## 为什么绕不开

在 React Compiler 寻求与 oxc 合作的 Issue 讨论区，尤雨溪提到——

> I strongly suggest re-evaluating the potential performance tax it would incur on the React ecosystem —— Evan You [oxc#10048](https://github.com/oxc-project/oxc/issues/10048)

但其实 Vue.js 也有大量的 JS 编译时逻辑，只会比 React 多不会比 React 少。印象中在某个采访节目中也有人曾问过 Evan You 关于 Vue 编译器的看法，Evan You 表示，如果迁移到 Rust，社区的参与度和可参与的能力都会下降很多。对于一个从社区中生长出来的开源项目来说，扎根社区、融入社区是重中之重。至少在当下，vue-compiler 所带来的性能负担还远没有达到不可接受以至于需要放弃 JS 社区的程度。在可以预见将来，vue-compiler 和 React Compiler 估计都还会以 JS 的形态存在。

曾经有个段子，JavaScript 是唯一一门可以先用后学的编程语言。你可以用它写网页、写脚本、写逻辑，写复杂的项目，然后你才会逐步发现原型、原型链，闭包，Promise与异步编程，迭代器与生成器，CommonJS 与 ES Module，etc. JavaScript 世界或者说 Web 世界远不是一个完美的世界——相反，它充满了各种各样的历史遗留问题与妥协产物。我们用一项为了文档而生的技术（Web 与浏览器）来构建大型应用程序，我们用已有的工具不断为我们积累构建更大型应用能力并不断提升开发体验。JS 社区用 JavaScript 创造了 Webpack，用 JavaScript 创造了 Babel，用 JavaScript 创造了 TypeScript。TS 和 JS 长期作为软件工程领域采用率最高的语言（Python 的高使用率主要由数据科学和AI领域带来）也能说明这一点—— JS 社区有着惊人的低门槛，所以我们有着惊人的社区规模与惊人的创造力。

程序员黄玄在 React Summit 2025 中发表的演讲 [Lynx: Native for More](https://www.bilibili.com/video/BV14ieUzQEzW) 有这样一句令我印象深刻的话：

> What makes Web amazing is not just the technology, this about this community that is so wildly creative. —— Xuan Huang

回到我们最开头所说的问题 —— 从原则上讲，**处理 JavaScript 代码的工具并不需要是 JavaScript 程序**。但这句话忽略的最重要的事 —— **处理 JavaScript 代码的人必须是 JavaScript 程序员**。一种工具想扎根在 JavaScript 社区，就必须让 JavaScript 程序员能够轻松地理解、使用、扩展它。所以，不要想着如何在 JavaScript 项目的构建流程中消灭 JavaScript 成分了，impossible。此前许多做原生工具链的团队大有想用原生取代一切的豪情壮志，但是我们的社区就是这样一个充满创造力、充满多样性的社区，传说中一天一个新轮子、三天一个新框架的 JavaScript 社区。

那原生工具链还是未来吗？

oxc 团队最新的努力也许可以为我们提供一点未来方向的思路。在 ViteConf 2025 中，
Jim Dummett 做了演讲 [JavaScript at the speed of Rust: Oxc](https://www.youtube.com/watch?v=ofQV3xiBgT8)。我们唯一的方向便是 —— 我们也一定还有更好的办法 —— 推倒原生工具链与 JavaScript 之间的隔墙。