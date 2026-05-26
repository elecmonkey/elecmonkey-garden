---
title: "给前端框架的“服务端”野心泼冷水：2025年 React 生态两起致命漏洞"
date: "2025-12-05"
description: "还是回家找 Spring Boot 吧。Modern.js 也是 React 全栈框架，但是它很谦虚的说自己的后端只是“BFF层”。"
tags: ["Next.js", "React", "Web 安全", "全栈框架"]
author: "Elecmonkey"
---

## 引言

2025 年 12 月 3 日，React 官方团队发布安全公告：**Critical Security Vulnerability in React Server Components** (CVE-2025-55182)。CVSS 评分直接拉满到了 10.0 —— 这是一个未经身份验证的远程代码执行漏洞（RCE）。

> An unauthenticated attacker could craft a malicious HTTP request to any Server Function endpoint that, when deserialized by React, achieves remote code execution on the server.

攻击者只需构造一个恶意的 HTTP 请求发送到任何 Server Function 端点，就能在服务器上执行任意代码。受影响的不仅是 Next.js，还包括 react-router、waku 等一众拥抱 RSC 的框架。

大伙不得不想起今年上半年 Next.js 发生的另一起事故：**Middleware bypass vulnerability** (CVE-2025-29927)。

## Next.js Middleware 鉴权绕过漏洞

Next.js 的 Middleware 是一个在请求完成之前运行代码的机制，常用于身份验证、重定向等。很多人会在 Middleware 里校验 Cookie。CVE-2025-29927 中披露，Next.js 内部使用了一个未公开的头 `x-middleware-subrequest` 来防止 Middleware 在内部子请求中递归执行。如果攻击者在请求中手动带上这个头，Next.js 就会认为“这个请求已经跑过 Middleware 了”，从而直接跳过 Middleware 的执行，直达页面渲染逻辑。

虽然 Vercel 官方声称部署在 Vercel 平台上的应用因为路由层分离而幸免于难，但那些使用 `output: 'standalone'` 自托管的 Next.js 应用就完全暴露在风险之中了。

## React Server Components 反序列化 远程执行代码漏洞

React Server Components (RSC) 是近年来 React 团队的主要注意力方向，允许客户端调用服务端的函数（Server Actions）。为了实现这一点，React 需要把客户端的参数序列化，发送给服务端，服务端反序列化后执行函数。

问题就出在这个反序列化过程。React 为了支持丰富的数据类型（如 Date, Map, Set, Promise 等），实现了一套复杂的序列化协议。CVE-2025-55182 披露，在处理某些精心构造的 payload 时，React 的反序列化逻辑存在缺陷，导致攻击者可以注入恶意代码并在服务端执行。

## 前端框架，你们怎么都在忙着写服务端代码？

这两起事故极有可能打击到同一批人。我猜这已经不是偶然现象了。

在传统的开发模式中，前端和后端是物理隔离的。前端代码跑在浏览器，后端代码跑在服务器。攻击者再怎么折腾前端代码，也翻不出浏览器的沙箱（除非有 XSS）。但是在过去几年，前端无数的框架都在拼命推销“全栈”概念，我们看到各路前端框架在服务端攻城略地。但Next.js 成为 React 首选框架，Nuxt 也被 Vercel 收购，SvelteKit 和 SolidStart 都“默认包含服务端能力” —— 不用 SvelteKit 甚至找不到一个像样的 Svelte 客户端路由框架。于是我们习惯了上一行代码还在浏览器里下一行跑到了服务器上。这种“混合开发体验”确实极大地提升了开发效率。我们不再需要切换到另一个项目去写 API，不再需要维护两套类型定义，不再需要操心接口文档。**框架希望我们忘记浏览器与服务器的界限，于是我们真的忘了。**

于是代价来了。**代价是安全边界的模糊。**

框架的 Bug 之外，我仍然时常觉得这种忘记十分危险。什么样的逻辑放在服务端，什么样的逻辑放在客户端，这是软件安全的重中之重。**想想学校里某些把答案明文请求到前端去判分的神奇考试系统，想想某些在浏览器端做了哈希以为自己不再存储明文密码的天才开发者**。软件的安全性天生有一部分来自于业务逻辑的安全，如果开发者自己意识不清晰，这部分是框架做的再完善也保护不了的。既然保护不了，就应该想尽办法提醒开发者、让开发者明晃晃的意识到自己写下的每一行代码的运行时与环境，而不是反之刻意模糊这个边界。

当前端写 JS/TS、后端写 Java/Go 的时候，这个界限先天由语言分界，十分明显。不过我也不认为要否定这种全栈框架的潮流。不管界限明显还是不明显，作为开发者，知道写下的每一行代码（或者 AI 生成的每一段代码）运行在什么环境里是基本要求。**如果不能清晰的知道自己的代码在什么环境中运行、在什么时机下运行**，写出来的东西我敢打赌 10000% 会有各种各样的离奇问题，要么没被发现，要么发现了解决不了。

发现漏洞是好事儿，给各大沉迷服务端的前端框架提个醒。问题在 React 和 Next.js 被发现，不一定是别家没有，很有可能是因为 React 的用量最大、最流行。

对于应用开发者来说，不要过度依赖框架的隐式保护，清醒的知道框架对自己的每一行代码做了什么，做好每一层的数据校验，永远是生存的第一法则。

> 参与维护的某 Next.js 系统因为使用 Next 13 逃过一劫。。。