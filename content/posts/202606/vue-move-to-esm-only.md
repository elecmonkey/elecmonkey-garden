---
title: "Vue.js 迁移到 ESM-only"
date: "2026-06-23"
description: "Move on to ESM only 发布一年半以后，Vue Core 正在迁移到 ESM-only"
tags: ["Vue", "ESM", "前端工具链", "AI Agent"]
author: "Elecmonkey"
---

## Vue #15000

[vuejs/core#15000](https://github.com/vuejs/core/pull/15000) 非常整齐的编号，Vue Core Team Member [posva](https://github.com/posva) 打开了名为 refactor: ESM-only packages 的 PR。Vue.js 即将全量迁移到 ESM-only。

> 有趣的是这老哥的个人主页域名是 [https://esm.dev/](https://esm.dev/) 真的很爱 ESM 了

PR 中列出的 built JS bundles 总体从 16.45 MB 降到 7.85 MB，减少 8.6 MB，降幅 52%。其中 `compiler-vapor` 减少 83%，`shared` 减少 68%，`compiler-core` 减少 64%，`runtime-core` 减少 63%，`reactivity` 减少 58%。首先最直观的效果，就是 `pnpm i` 拉依赖的时候需要下载的体积显著变少了。

> Vue 2 兼容层：`@vue/compat`、`__COMPAT__` flag、以及 compat 相关源码目录也一起被删除了

## Move on to ESM only

2025 年 2 月 5 日，知名大佬 Anthony Fu 在自己的博客发表了名为 [Move on to ESM-only](https://antfu.me/posts/move-on-to-esm-only) 的博客。此后，这篇博客被广泛引用，被用来说服、说明、指引 JavaScript 生态的发展方向。

当时还有一个重要背景，就是 Node.js 24+ 已经原生支持了 `require(esm)`。紧随其后的 2025 年 3 月，Node.js 官方将这一能力 backport 到了 v20 LTS (Node.js v20.19.0+) 并默认开启。

不过，在 Antfu 自己的博客中引用的数据里，2024 年底仍有超过 70% 的包是 CJS-only 的（包括 Flux）。站在一年半以后的今天，高影响 / 活跃 npm 包里，CJS-only 仍然高达 60%。历史生态的惯性仍然巨大。

> Faux ESM（伪 ESM）是指提供了 ESM 入口，但实际实现仍然是 CommonJS 的包。ESM 文件通常只是一个薄包装层（wrapper），负责把导入转发到内部的 CJS 实现，而不是真正的原生 ESM 代码。
> Faux ESM 实际上不具有增强 Tree-shaking 等 ESM 具有的优势。

Node.js 对 `require(esm)` 的支持给生态迁移提供了一条过渡坡道。它降低了 ESM-only 对旧项目的破坏性，让包维护者终于可以不用为了兼容 `require()` 永久维持一份 CJS 构建。

不过，眼下的新发布包 95% 支持 ESM 格式，Rstack 生态的小包也在陆续迁移到仅 ESM 的发布形式。新世界已经基本「ESM-only」了，真正的阻力来自存量的世界 —— 毕竟 Node.js v20 已经是 2023 年的版本了。

## ESM-only 需要删什么

大多数坚持发布「双重包」的大型项目，都不可避免的走进了为了不同格式的 interop 的 edge case 大量写分支、特判逻辑。Vue 如此，因为，move to ESM-only 并不能简单的把 CJS 从构建配置里删除就结束。过去多年积累的“格式差异”已经渗透进构建逻辑、测试逻辑、工具消费方式和隐含假设里。从这个角度讲，ESM-only 给了项目一个机会，把这些隐含假设重新进行梳理，然后删除掉大部分不该继续存在的分支。

## 对用户的影响

对于用 Vite / Rsbuild 这类现代工具写的 Vue 应用，用户侧感知大概率不强。因为我们本来就在 ESM 世界里开发，框架包变得更干净，通常只会让工具链少做一些兼容判断。

但是有直接 `require('vue')`、`require('@vue/compiler-sfc')`，的代码就需要格外的注意了。`require(esm)` 默认可用不等于所有旧代码都 100% 兼容。异步边界、默认导出和命名导出的访问方式、测试框架和各种第三方工具的模块加载策略、tsconfig 的 module/moduleResolution，都可能是出问题的点。

## AI Agent

陈旧生态不易迁移 —— 有过真实软件工程经历的朋友都不会怀疑这一点。又没有人为了升级框架版本给我多发钱，升级了还可能出问题，我为什么要没事儿给自己找事儿？

迁移是一件不需要什么创造性，但需要耐心、上下文和大量时间的工作。这恰好是 AI Agent 很擅长接管的工作。今天，社区面对现代技术栈迁移的心理门槛已经明显下降。以前的开源项目经历一次大型的 breaking change，下游就会有一大批用户永久的停留在了某一个大版本，现在或许有多得多的用户愿意开个 Agent 会话先跑跑看，说不定没什么问题呢？大不了把结果全部丢弃了就好了。

这对开源项目提出了新的期望 —— breaking change 不可怕，如果能勤勤恳恳老老实实的整理出一份 breaking change 列表和风险点，逐一给出迁移或者解决方案，形成 Skills.

Rstack 的一大愿景是成为 AI-native 的工具链，作为一套年轻的工具，其中经历过大版本发布的 [Rspack](https://rspack.rs/), [Rsbuild](https://rsbuild.rs/), [Rspress](https://rspress.rs/) 均提供了迁移大版本的 Skills. 在继续吃掉 webpack 的存量市场之外，这为我们提供了更多关于 Rstack 未来的想象。

- [rspack-v2-upgrade](https://github.com/rstackjs/agent-skills#rspack-v2-upgrade)
- [rsbuild-v2-upgrade](https://github.com/rstackjs/agent-skills#rsbuild-v2-upgrade)
- [rspress-v2-upgrade](https://github.com/rstackjs/agent-skills#rspress-v2-upgrade)
