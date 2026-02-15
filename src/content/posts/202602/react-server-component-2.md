---
title: "论 React Server Component (RSC) (2) - RSC规则、React组件树与模块依赖图"
date: "2026-02-15"
description: ""
tags: ["React", "RSC", "前端架构", "Next.js"]
author: "Elecmonkey"
---

继续聊聊 RSC。上一篇：[论 React Server Component (RSC) (1) - RSC原理、SSR、局部水合](https://www.elecmonkey.com/blog/react-server-component-1)

## RSC 规则

React 团队总是很喜欢教大家做事的（笑）。在学 React 的时候大家都或多或少被复杂的 Hooks 规则搞烦过。RSC 的规则大致总结如下：

- 服务端组件函数只被执行一次，因此可以执行有副作用的代码。
- 服务端组件不能使用浏览器端 Hooks.
- 服务端组件可以导入服务端组件或客户端组件。
- `"use client";` 的文件中不能再导入服务端组件。
- 整个 App 由一棵组件树构成，有些节点是服务端组件，有些节点是客户端组件。

![RSC Tree](https://images.elecmonkey.com/articles/202602/rsc-tree.png)

> 我从 Modern.js 的文档里借一张图，原图在 [Modern.js v3 Release: Focused on web framework, embracing ecosystem development](https://modernjs.dev/community/blog/v3-release-note)

前两条十分好理解，但是看到这张图估计有人要对后面几条摸不着头脑了。意思服务端组件可以是客户端组件的子组件，客户端组件可以是服务端组件的子组件，但是客户端组件又不能导入服务端组件？其实这两块儿说的是两种不同的导入导出关系构成的两种不同的图 —— 组件树和模块依赖图。

## 前端的图

### 模块依赖图

模块依赖图就是构建工具看到的 import 关系。当然，我使用 Vite 较多，对 Next.js 底层依赖的 Turbopack 不是很熟，不过姑且认为都在做差不多的事情 —— 从一个打包入口出发，按照 ESM 的 import/export 语法去分析，把所有依赖的模块都列出来。

对于服务端入口来讲，其中打包到客户端组件，就形成一个占位符，服务端组件不会去执行这些代码（因为 SSR 执行是另外的事儿），执行结果以 Flight payload 发到客户端，客户端执行自己的客户端代码补齐这些缺失的客户端组件。

对于客户端入口来讲，其中打包到服务端组件…… 其中不能打包到服务端组件！Node.js 环境的代码在浏览器端用不了！最新版本 Next.js (v16.1.6) 实测，`"use client";` 了的组件导入 Server Component 会导致这个服务端组件被强行拿到客户端执行，如果组件中有 node-only 代码就会导致报错。不过如果组件代码恰好在浏览器里阴差阳错执行下来了，并不会有什么错误提示。

> 在测试中我用到了 `node:os` 模块 `os.type()` ，导入客户端组件居然也在客户端执行了…… 似乎是某种神秘的 polyfill。。。 Next.js 框架内部过于高深莫测了。这种级别的错误最后只因为 os.type 的返回结果不一样报了一个 SSR 的 Hydration mismatch。感觉其实可以有更强的报错。

Rspack 还是 Esbuild，Rollup 还是 Rolldown，都要完成模块依赖分析这么一件事。可以认为它们是 JS Runtime (浏览器 or 本地运行时) 之外的 ESM 标准实现。

我看到有些博客说在启用了 RSC 的 Next.js 中（Next.js App Router），很重要的一点是在组件树中“划定 client 边界”，我的理解这个边界其实应该在模块依赖图中划定。

### React 应用组件树

组件树是 React 运行时看到的结构，节点会被标记为 Server 或 Client。它和模块依赖图不一致的地方就在于：**组件树允许出现“Client 作为父、Server 作为子”的形态**，但这个“子”不是由客户端 import 出来的，而是由服务端传进去的。

- 组件树里：Client 节点下面可以有 Server 子节点
- 依赖图里：Client 模块仍然不能 import Server 模块

假设有三个组件，Server 页面把 Server 组件作为 children 交给 Client 外壳：

```tsx
import ClientShell from './ClientShell';
import ServerSidebar from './ServerSidebar';
import ServerContent from './ServerContent';

export default function Page() {
  return (
    <ClientShell>
      <ServerSidebar />
      <ServerContent />
    </ClientShell>
  );
}
```

ClientShell 是客户端组件，它不导入任何服务端组件：

```tsx
"use client";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <header>App</header>
      <main>{children}</main>
    </div>
  );
}
```

ServerSidebar/ServerContent 都是服务端组件，包含数据库/文件读取都可以。  
组件树上看起来是：ClientShell 下面挂了 ServerSidebar 和 ServerContent。  
模块依赖图上却是：Page(服务端) 同时依赖 ClientShell 和 ServerSidebar/ServerContent，客户端入口并没有反向依赖服务端模块。
