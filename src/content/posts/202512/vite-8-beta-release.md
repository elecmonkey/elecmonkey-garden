---
title: 'Vite 8.0 Beta Release，Vite 默认实装 Rolldown'
date: '2025-12-04'
description: '恭喜 Rolldown-vite 合入 Vite 主仓库'
tags: ['Vite', 'Rolldown']
author: 'Elecmonkey'
---

[feat!: the epic `rolldown-vite` merge](https://github.com/vitejs/vite/pull/21189)

从 Rolldown-vite 7.x 迁移没有遇到任何阻碍，更改版本号后直接 `pnpm i` 即可。

来来来，来一道面试八股文：Vite 底层由什么工具实现依赖预构建和生产环境打包？

趁着 Vite 8 还是 beta，珍惜最后的可以回答 esbuild + rollup 的时光吧（