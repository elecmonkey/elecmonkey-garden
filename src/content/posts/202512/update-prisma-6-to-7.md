---
title: 'Prisma ORM 6 -> 7 升级实录，闲聊 Prisma 团队升级理念'
date: '2025-12-03'
description: ''
tags: ['Prisma ORM', 'node_modules']
author: 'Elecmonkey'
---

## 升级过程

1. 升级依赖包 ：   
   - 将 `prisma` 和 `@prisma/client` 更新至 ^7.0.1 。

2. 开启 ESM 支持 ：
   - 在 `package.json` 中添加 `"type": "module"` 。
   - 更新 `tsconfig.json` 的 `compilerOptions.target` 为 `ES2023` ，以兼容顶级 await 和现代模块特性。

3. 迁移 Prisma 配置 ：
   - 新增 `prisma.config.ts` 文件，用于集中管理 Prisma CLI 配置（如 schema 路径、迁移目录等）。
   - 修改 `prisma/schema.prisma` ：
     - 将 generator client 的 provider 从 `prisma-client-js` 更新为 `prisma-client` 。
     - 指定 output 路径为 `../src/generated/prisma/client` ，将生成的 Client 代码纳入源代码管理。
     - 移除了 datasource 块中的 url 字段（连接串现通过代码或环境变量直接传递）。

4. 修复导入路径 ：   
   - 更新了所有引用 Prisma 类型的文件，将其指向新的 Client 生成路径。

## Moving away from Rust

Prisma 6 -> 7 最显著的变化是从 Rust 迁移到了 Node.js，打包后不再附带二进制文件，极其明显的缩小了构建产物体积。另外，在某些特殊的运行环境中（边缘、非 Node 环境……），非 JS 成分总是会带来各种各样的麻烦。

腾讯云 EdgeOne 在部署项目时对包体积有 125MB 的限制。以我自己的某 Next.js 应用为例，升级之前：

```bash
npx edgeone pages build
du -h -d 1
```

```bash
751M    ./node_modules
155M    ./.next
135M    ./.edgeone
292K    ./src
```

最终的部署体积达到了 135MB。我没有空白的demo项目有多大，但是我这个项目真的并不复杂，简单的登录功能加若干 CRUD。所以我当时怎么办呢？用了 Prisma 官方提供的 HTTP 中转 —— Prisma Accelerator，**通过 Proxy 可以把构建产物缩减至59MB**。中转服务器最近可选的节点是 Tokyo，我的数据库服务器在某云上海机房，Edgeone 按理来说会选择较近节点，终端用户在也在中国内地，于是乎，每次连接都要经历——

```mermaid
flowchart LR
    U[终端用户<br />（内地）]
        --> E[边缘节点<br />（就近）]
        --> A[Prisma Accelerator<br />（Tokyo）]
        --> DB[数据库<br />（上海）]
        --> A2[Prisma Accelerator<br />（Tokyo）]
        --> E2[边缘节点<br />（就近）]
        --> U2[终端用户<br />（内地）]
```

延迟极其抽象。但是并不想自己再维护服务器自部署 Next.js 应用，于是只能将就之。

升级到 Prisma 7 后，在不使用 Prisma Accelerator、使用 Node.js 运行 `pg`、`@prisma/adapter-pg` 的情况下再次 build：

```bash
npx edgeone pages build
du -h -d 1
```

```bash
697M    ./node_modules
234M    ./.next
 61M    ./.edgeone
580K    ./src
```

终于摆脱这个代理层了。我没有实验这个 trade-off 到底 off 掉了多少性能，但是因为满足了我的需求我感到十分满意（笑

## Where the generated files place?

Prisma 6 会在 `node_modules` 目录下生成 Prisma Client 代码。升级到 7 后，代码默认被生成到用户的代码仓库中而非 `node_modules`.

团队在博客中所述的升级动机可以总结如下：

- 文件监听不便（Watch、HMR 通常不监控 node_modules）
- 生成代码与 app 代码不在一起，带来很多“黑盒感”
- CI 等场景中 node_modules 不稳定，经常被缓存/忽略，更容易导致 “it works on my machine”

对我（开发者）来说变化就是我把 Prisma Client 代码提交到了 Git 仓库。这固然有带来不一致的风险，但是如果有多人协作开发的情况，通过 precommit script 和 ci bot 等工具可以确保大家遵守规范 —— eslint 在哪儿检查它就在哪儿检查。当然之当然，提到 eslint，这个 Prisma Client 应该还是要配置一下被 linter ignore 掉比较好。

对了，还有一个直观的结果，ci/cd 部署时可以不重复构建 Prisma Client 代码，对减少部署时间有轻微的作用。

## 社区与决策

目前看来，本次升级在社区反响也是比较积极的。在为什么抛弃 Rust 这件事上，团队还有一个解释就是使用 Rust 不利于社区发起贡献。JavaScript 社区广泛的存在这个问题。能考虑到这一点，决策团队看起来是相当考虑社区参与的问题的。

这种看起来的“逆向迁移”（大家通常都是 JS 迁移到 TS，Node.js 迁移到 Rust 这样。）让我想起了另一个例子 —— Svelte 4 版本，创始人带领团队从 TypeScipt 迁移回了 JavaScript。那场迁移奠定了今天 Svelte 代码库使用 JSDoc 来检查类型的事实，但是翻阅当年 GitHub 上的种种讨论，可以说是“褒贬不一”。作者提出的 “TS 库大家按住函数名追踪到的是类型定义，JS 库可以直接看到源代码” 固然有道理，可是 TypeScript 仍然如此流行，大家并非不知道这些问题。不过说起来 JSDoc 仍然利用 TypeScript 提供的能力进行类型检查，也算是以一种不一样的方式 “部分使用” 了 TypeScript 吧。很多人并不想支持这项决策，但也没有人能说这项大动干戈的决策错误 —— Svelte 仍在茁壮成长。