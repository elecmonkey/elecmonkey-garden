---
title: "写在 Astro v6 beta：Astro 让真正的“网站”拥抱现代前端生态"
date: "2026-01-30"
description: "史上最恨 JavaScript 的前端框架，最有意义的架构试验场"
tags: ["Astro", "服务端渲染 (SSR)", "静态站点生成 (SSG)", "群岛架构", "Vite"]
author: "Elecmonkey"
---

## 组件化不必然需要 JavaScript

现代前端，几乎所有主流框架都提供的一个核心价值是“组件化”。React/Vue 等框架让我们能把 UI 拆成一个个组件，然后在浏览器中统一运行这套组件逻辑——创建虚拟 DOM，对比，更新视图。但别忘了，这些框架最初为了解决的问题并不是组件化，而是状态与视图的管理问题。

组件化确实起源于客户端 JavaScript 框架（React/Vue），Web 标准也跟进了 Web Components 规范，但 Web Components 仍然高度依赖在客户端执行 JavaScript 才能提供交互逻辑。不过很显然，组件化这个开发范式本身，和渲染方式并没有一毛钱的关系。

那么问题来了：如何为静态的或者传统的服务端优先的网站也引入组件化的能力呢？React 和 Vue 都有 SSR 能力，但很多网站并不需要这么厚重的客户端运行时。于是，我们有了 **Astro**。

Astro 默认产出静态 HTML，并只在必要时加载 JS。它从不同的视角出发：**把组件化放在服务端优先的上下文里，让 JavaScript 仅在必要时才运行**。在 Astro 为我们所描绘的世界中，理想情况大多数页面默认不发送任何 JS，交互组件按需开启 JS。这样的策略对于博客、文档、官网、展示类网站尤为适合，让页面首屏加载更快、指标更好。

## 群岛架构：局部水合

Astro 最关键的一个理念是 **群岛架构（Islands Architecture）**，这带来了局部水合。

首先回顾 React 与 Vue 的 SSR 与水合 (Hydration)。传统的单页应用（SPA）会对整个页面的组件树在客户端进行 Hydration，整个页面的客户端状态初始化。而在许多内容驱动的页面中，例如博客文章、文档页面，这些内容几乎不需要在浏览器端运行交互逻辑。把这样一整个页面带上重量级的运行时只为了使用框架的一些构建时能力（e.g. 组件化）毫无必要。

很显然对于一个 Next.js 写成的博客来说，让 React 水合一遍文章区域是没有任何意义的。

Astro 的群岛架构：

- 整页通过静态 HTML 呈现
- 只有那些需要交互的组件（"小岛"）才在浏览器端被 Hydrate
- 不同框架（React、Vue、Svelte、Solid 等）的小岛可以在同一页面共存

比如，文章部分全是静态 HTML；只有点赞按钮、评论表单等需要 JS 的部分才单独加载运行时。这种局部水合模式显著减少了首屏 JS 大小，而不牺牲组件化开发体验。局部水合让我们可以在同一个页面中使用不同的 UI 框架，React / Vue / Svelte / Solid 都可以在同一个页面中共存。

> 也许可以换一种理解，Astro 把传统全栈应用框架中的“构建时”部分抽离出来单独提供而不捆绑自家的客户端库 —— 这些东西本来就和客户端不强相关。

## Meta-Framework 去掉前端

### SSR 与按需渲染

Astro 既支持静态站点生成（SSG），也支持 **SSR**（Astro 官方把这叫按需渲染）。Astro 的 SSR 和传统的 SSR 没有什么太大区别，也在努力的支持更多的 Serverless 环境。

> This refactor enables Astro to:
> 
> - Run against real runtimes – Development can execute inside the same runtime as production.
> - Support more platforms – Cloudflare Workers today, with a foundation that supports additional runtimes in the future.

——[https://astro.build/blog/astro-6-beta/](https://astro.build/blog/astro-6-beta/)

不过，在默认输出静态 HTML 之后，不需要也不能再进行水合激活，静态 HTML 已经是最终产物了。

### Server Actions 与后端能力

刚刚说 Astro 把传统全栈应用框架中的“构建时”部分抽离出来单独提供，其实“服务端”部分 Astro 也做了完整的提供，SSR、Server Actions 一应俱全，按需使用。

Astro 的 Server Actions 与后端能力和其它全栈框架的几乎一样，提供了写后端 RESTful API 端点的方式与 rpc 风格的前后端交互。当然，要发请求 Astro 也不得不引入 client JavaScript 了，但是单纯发个请求验证一下结果，还是比完整的处理 UI 视图的 JavaScript 少太多太多。

**API 端点**：将 `.js` 或 `.ts` 文件添加到 `/pages` 目录，导出 HTTP 方法函数（如 `GET`、`POST` 等）。在静态模式下，端点在构建时生成静态文件；在 SSR 模式下，端点变成实时服务器端点。

**Actions 系统**（Astro 4.15+）：提供类型安全的后端函数定义和调用。Actions 使用 Zod 自动校验输入，生成类型安全的客户端调用函数，无需手动 `fetch()`。Actions 还支持通过 HTML 表单提交（零 JavaScript），提供完整的表单验证和错误处理能力，这对于渐进增强的 Web 应用非常友好。

## 充分利用现有 JS 生态

### 对 Vite 环境 API 的利用

Astro 6 的最重大的变更是完全重新设计的开发服务器，通过内部重构使用 Vite 的 **Environment API**，缩小了开发环境与生产环境的差距。过去，本地开发中正常运行的代码，部署后可能表现不同。特定平台的功能往往无法在部署前测试，Astro 甚至需要为“开发”和“生产”维护不同的代码路径，增加了边缘情况 bug 的风险。

通过利用 Vite 的 Environment API，Astro 现在可以在与生产环境相同的运行时中运行开发服务器——相同的 JavaScript 引擎、相同的全局变量、相同的平台 API。这个改变让 Astro 6 在所有运行时（包括非 Node.js 环境）上都更加稳定可靠。

### 对 Vite 构建能力的利用

除了 Environment API，Astro 还全面利用了 Vite 的种种能力，按需模块编译与 HMR、丰富的插件生态、开箱即用的 tree-shaking 等构建优化。

Astro 的构建流程深度集成 Vite —— 在构建的第一阶段，Astro 模块就是 Vite 构建过程中的 JavaScript 模块，由 Astro 的插件解析。在 Vite 构建完成后 Astro 再执行自己的构建逻辑生成 HTML。对于真正的“网站” —— 门户网站、新闻网站、博客网站，而非利用 Web 能力打造的 App，通过 Astro 也能享受到丰富的现代前端生态。

### 对现代前端框架的利用

Astro 的群岛架构允许在同一个项目中混用多种框架，每个需要交互组件可以选择最适合的框架。从这个意义可以说，AStro 才是那个生态最丰富的框架（笑）。不过笑完必须说，体感上 Astro 官网应该不会希望鼓励这种页面中嵌一堆框架的行为，群岛架构可以大大减轻水合的任务量，但是并不能改变 JS Bundle 的大小。每嵌入一种框架就是需要在本地下载这个框架的 runtime，这是没得说的事情。