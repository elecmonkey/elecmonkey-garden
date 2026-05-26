---
title: '实测 Vite 工程中 React Compiler 对构建时间的影响'
date: '2025-11-13'
description: '引入 React Compiler，Rolldown-Vite with Oxc 构建时间增加 174%；Vite (Rollup) 构建时间增加 40%。'
tags: ['React', 'React Compiler', 'Vite', 'Rolldown']
author: 'Elecmonkey'
---

## 测试场景

一个基于 Vite 的 React 中型后台管理项目，此前已经迁移到 Rolldown-Vite，没有明显的兼容性问题。

- Node.js 24.4.1
- MacBook Air M2

## 测试结果

### Rolldown-Vite + Oxc

| 测试次数 | 第1次 | 第2次 | 第3次 | 第4次 | 第5次 | 平均值 |
|---------|-------|-------|-------|-------|-------|--------|
| **无 React Compiler** | 1.41s | 954ms | 943ms | 847ms | 863ms | **1.00s** |
| **有 React Compiler** | 3.06s | 2.71s | 2.71s | 2.57s | 2.62s | **2.74s** |

**构建时间增加 174%**

### Vite (Rollup)

| 测试次数 | 第1次 | 第2次 | 第3次 | 第4次 | 第5次 | 平均值 |
|---------|-------|-------|-------|-------|-------|--------|
| **无 React Compiler** | 7.34s | 7.02s | 6.87s | 6.51s | 6.63s | **6.87s** |
| **有 React Compiler** | 8.66s | 8.12s | 10.87s | 11.31s | 9.23s | **9.64s** |

**构建时间增加 40%**

### Rolldown-Vite + Swc

另外做一个 swc 负责 JSX 转译的基准：

| 测试次数 | 第1次 | 第2次 | 第3次 | 第4次 | 第5次 | 平均值 |
|---------|-------|-------|-------|-------|-------|--------|
| **无 React Compiler** | 786ms | 824ms | 1.05s | 882ms | 760ms | **860ms** |

## 简单分析

一个“纯” React 项目渲染管线可以被 oxc/rolldown 系工具链完全接管，内部有着统一的 AST 格式。当前 React Compiler 仅以 Babel 插件的形式提供，依赖 Babel AST。所以任何在非 Babel 支撑的构建流程之中加入 React Compiler 的方案，都是增加了一个完全独立的构建流程。`.tsx` 源代码先被 oxc parse 成自己的 AST，然后一通处理，然后变成代码，然后再被 Babel parse 一次，然后 babel-plugin-react-compiler 转换成自己的 IR，然后一通处理再转化回去。

不过 Babel AST 确实是社区既成标准，而从 AST 转换到 React Compiler IR 的逻辑很难想象 React 团队会愿意再写一遍/维护多份。未来看起来有些迷茫。

不过的不过，目前 React Compiler 并不带来数量级的构建时间影响，应该说是可控的。React Compiler 的价值显而易见，稳定之后应该会成为 React 项目的标配。不过目前虽然发布了正式版本，Issue 区泛滥成灾的 Bug 反馈也许提示我们可以继续观望观望。