---
title: "论如何逼着为浏览器而生的 Mermaid 在服务器端渲染"
date: "2025-04-26"
description: "你会发现很多力求 SSR/SSG 的工具，Mermaid 最终还是选择了浏览器端渲染。"
tags: ["服务端渲染 (SSR)", "Node.js", "Mermaid"]
author: "Elecmonkey"
---

## Mermaid.js

Mermaid 是一个常用于嵌入 Markdown 文档的图表生成工具，前面有一篇文章 [技术文档必备之 Mermaid 图表制作入门](https://elecmonkey.com/blog/mermaid-tutorial) 介绍过它。

现在越来越多的框架支持基于 Markdown 的内容管理系统，大家手搓 CMS 也基本会选择 Markdown 作为写作格式。不过，在配置 Mermaid 图表的 SSR 的时候遇到了一些问题，Mermaid 需要 DOM API 支持。然后我非常顺畅的想到搞个 JSDOM 模拟一下，结果发现依然报错。

## 浏览器依赖

Mermaid 高度依赖浏览器的 CSS 和布局能力、渲染能力，这使得简单的 DOM 模拟（如 JSDOM）无法满足需求。Mermaid 需要完整的浏览器环境来：

- 布局元素尺寸和位置
- 应用 CSS 样式和动画
- 处理 SVG 渲染

## mermaid-cli

官方提供了 `mermaid-cli` 项目，它使用 Puppeteer（一个无头浏览器库）来实现 Node.js 环境下的 Mermaid 渲染。这是目前唯一可靠的服务器端渲染方案。

```bash
# 安装 mermaid-cli
pnpm install -g @mermaid-js/mermaid-cli

# 使用
mmdc -i input.mmd -o output.svg
```
Puppeteer 启动了一个完整 Chromium 浏览器去做这件事。所以其实还是只能浏览器端渲染——我把浏览器放在服务器端跑一跑，不就把这玩意儿预渲染出来了吗？

![Mermaid Example](https://images.elecmonkey.com/articles/202504/mermaid-example-lr.svg)

搞了一个简单的 Mermaid 图做测试，经过我的本地测试（Macbook Air M2，渲染成 svg 文件），使用 mermaid-cli 的 `mmdc` 命令渲染单个图表，平均每条命令用时: 1.017 秒。

这个性能表现意味着**不可能 SSR 渲染**：每次渲染需要约 1 秒，每一个访问都占用服务器某个核心 1 秒吗？对于追求 Noscript 可用性的内容网站来说，把 mermaid-cli 搞进构建流程，每个 mermaid 图表在出现的时候就渲染出来是一个还算合理的选项。不过随着网站体积的增大，就得考虑**增量构建**的问题。目前似乎没有（我似乎不知道有）什么成熟的工具可以集成这一点，可能需要自己对工程做复杂的构建流程配置。

对于构建 Markdown，mermaid-cli 倒是提供了直接很方便的支持。
```bash
# 渲染 Markdown
mmdc -i readme.template.md -o readme.md
```

这会把 Markdown 中的

````markdown
```mermaid
graph
   [....]
```
````

转换成
```markdown
![diagram](./readme-1.svg)
```

同时附上输出的文件。这样如果有自己的 CI/CD 服务器和工作流，可以在每次构建前对多出的增量 Markdown 文件进行渲染，然后再用 mermaid-cli 的渲染结果去执行正常的前端构建流程。

不过对于用 GitHub Actions 的个人项目来说，每次从 GitHub 仓库独立拉取代码去构建，每次构建就意味着重新渲染整个网站的 Mermaid 图表，这就有点离谱了。

## 批量渲染优化

其实每次调用 `mmdc` 都会启动一个新的无头浏览器实例。前面的纯调用cli的渲染法，确实写代码很轻松，但等于每张图的渲染都是启动浏览器又关掉，这中间大量的时间浪费在开关浏览器上了。我们可以自己写个脚本，去调用 `@mermaid-js/mermaid-cli` 包的 `run` 方法，只启动一次无头浏览器，然后批量渲染所有图表。

经过测试（Macbook Air M2，渲染成 svg 文件）：

- 渲染 10 张图表：1.797 秒
- 渲染 100 张图表：16.362 秒
- 渲染 200 张图表：29.934 秒

这样看来，批量渲染的性能表现要好得多。不过即便如此，采用 SSR（服务端渲染）**仍然是不可想象的**，SSG（静态站点生成）也会**严重拖慢构建速度**。

## 结论

追求 Noscript 可用性，可以 SSG，可以肯定是可以的。

这 SSG 真能提高用户端的加载速度吗？等我有空了做个实验。感觉应该是能的，虽然客户端渲染在图表上只需要拉一小段 Mermaid 代码，这段代码的体积肯定小于渲染后的 SVG 文件，但是客户端渲染还需要拉一个 Mermaid 的 Runtime JS 文件 + 等待浏览器渲染。

用来测试的图表（还是本文开头那个图），复制十遍后 Markdown 大小 8.3 KB，渲染后 SVG 每张大小 27 KB，体积膨胀 32.5 倍。文章数据量比较大的话，还得考虑一下服务器储存价格的问题。


综上，结论就是**建议客户端渲染**。

\- 完 \-

官方文档：
- [Mermaid.js](https://mermaid.js.org/)
- [mermaid-cli](https://github.com/mermaid-js/mermaid-cli)
- [Puppeteer](https://pptr.dev/)
