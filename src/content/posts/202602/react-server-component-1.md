---
title: "论 React Server Component (RSC) (1) - RSC原理、SSR、局部水合"
date: "2026-02-14"
description: "React Server Component 的原理、RSC 与 SSR、「局部水合」的意义"
tags: ["React", "RSC", "前端架构", "Next.js"]
author: "Elecmonkey"
---

最近，国内扛把子的 React 框架 [Modern.js](https://github.com/web-infra-dev/modern.js) 发布了 [v3 大版本](https://modernjs.dev/zh/community/blog/v3-release-note.html)，正式支持了 React 服务端组件（后续简写为 RSC）。而 React 元框架的事实标准 [Next.js](https://nextjs.org/) 早已全面拥抱 RSC。

应该说，RSC 在前端社区引起的反响是比较**分裂**的。React 团队将其视为一种未来的基于 Web 的 APP 架构，反对者则批评将更多逻辑移动到服务端纯粹是出于 Vercel 公司的商业目的。做为依托 Vercel 的云服务而生、由 Vercel 推出的 Next.js，自然对 RSC 十分积极，默认全面开启 RSC 功能且没有回到纯 SPA 的配置项，如果有必要，需要在所有组件标记 `"use client";`

## Server Components 原理

启用了 RSC 的 React 项目最核心的架构特点是把**组件拆成两类**：Server Components 默认只在服务端执行，Client Components 明确标记 `"use client";`，会被打包到浏览器要运行的 JS Bundle 里。Server Components 可以直接访问数据库、文件系统、私有 API 等服务端能力，但不能使用 `useState/useEffect` 这类只存在于浏览器的运行时；Client Components 相反，负责交互与状态。

在渲染流程上，Server Components 并不会直接生成完整 HTML，而是产出一种可被 React 解释的“组件树序列化结果”（React Flight payload），实际上是一大堆 JSON 数据。浏览器收到这份 payload 后，React 会用它解析出一个完整的组件树，然后只对 Client Components 进行 Hydration。最终的效果是：页面结构与数据在服务端完成，交互只在必要部分（客户端组件！）激活。

这套机制带来两个关键约束：Server Components 可以引入 Client Components，但 Client Components 不能反向 import Server Components；边界由 `"use client";` 明确划分。React 团队通过这种单向依赖保证了数据流动方向，也让客户端 bundle 体积只包含真正需要交互的部分。

## RSC 与 SSR 的关系

RSC (React Server Component) 和 SSR (Server Side Render) 名字里都带了个 Server 服务器，在数据逻辑的意义上部分功能重合，但是技术实现上没有什么直接关系。

### SSR 服务端渲染

目前比较经典的 SSR 架构（不光 React 世界，包括 Nuxt、SvelteKit 之类的）是所谓的 “渐进式应用”，即所有页面在被浏览器第一次请求的时候进行 SSR 渲染，浏览器下载请求的页面的 HTML、下载 JS Bundle、进行水合。一旦 Hydration 完成，此时应用就变为一个完全 SPA 的客户端应用，后续的页面路由、数据获取都由客户端负责。

在这种结构下，SSR 中前端服务器的地位其实是比较憋屈的，它就是一个独立的中间层，没有办法写很多服务器特异的代码，比如数据库查询、读取环境变量之类的事情。因为服务器只是提前的执行一遍客户端组件，然后 `renderToString` 产出 HTML 字符串。那这个提前执行的意义在哪里呢？提升网站 SEO、增强网站 no-script 情景的可用性、减少首屏加载时间。SEO 的作用见仁见智，no-script 情景说实话现代前端很少去考虑，绝大多数情况我们都会默认 JavaScript 可用。至于用户体验能改善多少，这也因素复杂，比如如果前端的服务器层（后简称 Backend for Frontend，BFF层）和后端应用部署在同一台服务器上，那 SSR 就能减少一次数据往返的时间（少请求一次 API）。但是如果应用是渐进式应用，只有首页能享受到这一优势；如果完全不是渐进式应用，所有路由都是 a 标签硬跳转，则会失去很多 SPA 的优势，无缝客户端路由、区域重载等，每个页面都完整的重新加载，说不定用户体验比纯 SPA 还差劲呢。

也就是说，SSR 是一套**为了客户端而生的代码**，在部分情境下（用户第一个打开的页面），提前在服务器上憋屈的、部分的执行一次（大量 Hooks、浏览器 API 是没有办法执行的）。服务器端是客户端的附属品，所有代码以客户端为主（都要在浏览器里运行一次），哪些代码会在服务器运行并不一定、效果也没有保证、出现错误（典中典之 hydration mismatch）**唯客户端**为单一数据来源。

### RSC React 服务端组件

而 RSC 则完全不是这样工作的。启用了 RSC 的 Next.js 项目明确的把代码划分为「在浏览器中运行」的部分和「在服务器上运行」的部分。在服务器上运行的部分可以直接书写 **访问数据库**、**调用私有 API**、**读取服务端环境变量**、**读取服务器文件系统** 等能力，在客户端中运行的部分则可以直接使用浏览器 API —— 就像 SPA 的 React 工程。对于服务端组件，服务端的运行结果是唯一事实来源，这些代码绝对不会被发送到浏览器执行，而是把结果（React Flight payload）发送到浏览器。而客户端组件不会在服务器中提前运行，直接以代码形式被发送到浏览器中执行。

在同样需要一个支持 Node 的环境作为 BFF 层的情况下，启用了 RSC 的 React 工程的架构明显可以更加充分的利用这个 BFF 层的能力，而不是付出巨大成本（从静态资源部署的纯 SPA 走向需要 BFF 的 SSR，部署成本和复杂度应该是要上一个台阶的）却只能捞到又少又憋屈的好处。

### SSR 和 RSC 一起用

那我们应该选 SSR 还是 RSC 呢？ Next.js 16 的默认配置很神奇，两个一块儿启用！其实这两个技术一点也不冲突。RSC 是解决不了 SEO 之类的问题的，因为它还是不输出 HTML 啊！Flight payload 在搜索引擎眼里和我们各种用 JS 获取的花花绿绿的数据有什么区别呢。在启用了 RSC 的项目中，服务端组件当然要在服务端运行，那客户端组件不就是我们原来的那种经典组件吗，我们完全可以把这些客户端组件按传统的 SSR 去布置。

于是乎，当大家打开一个 Next.js 项目的页面的源代码，就可以看到这几个部分。

![rsc-and-ssr](https://images.elecmonkey.com/articles/202602/rsc-and-ssr.png)

在后续的路由中，就不再发生 SSR，但是服务端组件还是要在服务器端执行，Flight payload 直接以网络请求的方式流式响应到浏览器，浏览器拿到 Flight 数据和客户端组件的 JS 代码执行就好。

## RSC 与局部水合

关于 RSC 的诞生，我们还可以从另一个角度思考问题。

Astro 作为一个构建时、服务端优先的框架，提出了“群岛架构”。把完全不需要交互的部分，让它在浏览器端直接以静态 HTML 的方式提供，不进行任何乱七八糟的额外步骤。对需要交互的部分进行水合，让这部分 DOM 激活成为某个框架接管下的 DOM。

RSC 首先是 React 的一部分，基于 React 这一 JavaScript 框架，那肯定不可能变成静态 HTML 在什么地方把客户端 JS 完全扔了。React Flight 一种 React 团队自定义的数据交互协议，必然需要浏览器端的 JS 运行时去解析，但是对于服务端组件，解析出来的数据直接渲染就完事儿了，不需要把函数式组件的那个函数本身在客户端的组件生命周期中再一遍遍的运行，在这些过程中只有客户端组件发生传统的重新执行过程。（服务端组件必须是函数式组件，这些函数代码根本不会被发送到浏览器！）这从架构上讲和 Astro 群岛架构的局部水合的思想不谋而合，是特殊的局部水合 —— 这里不水合只是不执行传统的 client React JS，而非完全没有 JS。

我所说的另一个角度就是在「局部水合」的思想指引下，把服务端已经完成的工作、客户端完全不需要更多逻辑的 DOM 的尽可能少的去执行 JavaScript。对于 Astro 框架来说就是岛屿架构、局部水合，在 React 团队设想的新架构中就是能放服务端执行的逻辑放在服务端执行，客户端不再重新执行服务端组件的函数，而是直接使用其执行的结果。
