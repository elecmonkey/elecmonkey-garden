---
title: "Vite+ 的意义？Evan You 和他的“统一前端工具链”"
date: "2026-03-29"
description: "“统一” \"Unified\" 是一个和 JavaScript 生态格格不入的词。"
tags: ["Vite+", "Vite", "Rolldown", "oxc", "oxlint", "oxfmt"]
author: "Elecmonkey"
---

## 引言

记得在一年前的一个访谈视频中，Evan You 曾表示 Vite+ 将会是 VoidZero 公司的一款商业产品。不过最终在发布时（[Announcing Vite+ Alpha](https://voidzero.dev/posts/announcing-vite-plus-alpha)），Vite+ 还是以 MIT 许可证开源了。

## Vite+ 简介


## Vite+ 有门槛

### 能升级到 Vite 8 吗

首先，Vite+ 生态建立在 Oxc/Rolldown stack 的基础之上，所以 Vite 版本必须是 Vite 8 (Rolldown)。对于存量项目来说，是否能使用 Vite+ 取决于项目能否平滑的升级到 Vite 8 和周边工具链能否平滑的被 Oxlint/Oxfmt 等替换掉。

按我的经验，如果项目本身是旧版本的 Vite，升级到 Vite 8 应该是压力不大的，除非是在配置中定向的使用了某些 rollup 的行为（rolldown 应该大多是兼容的，只是确实要手动迁移一下）。一个使用官方脚手架创建的 Vite 项目、仅配置了社区常见的插件（vite-plugin-vue，tailwindCSS）之类的，升级到 Vite 8 应该是非常顺利的。

如果项目本身是 webpack 的（包括 vue-cli 和 create-react-app），那迁移到 Vite 就比较痛苦了。很多基于 webpack 的前端项目使用的模块化标准都是 CommonJS，Vite 向来是以 ESM 生态为主的打包器。这类老项目中内部模块化往往使用的就是 CommonJS，依赖的较为老旧的第三方库通常也是 CommonJS 分发。我试图迁移过两个规模不小的 webpack 项目到 Vite，都是在遇到大面积报错之后打了退堂鼓。

> 最后这两个项目都迁移到了基于 [Rspack](https://rspack.rs/) 的 [Rsbuild](https://rsbuild.rs/)。那边的生态对 Webpack 的兼容确实做的极好。

### Linter 和 Formatter 的迁移

首先很令我苦恼的是我还没见过一个在认真使用 eslint 和 prettier 的旧项目。项目中有安装，然后有 `npm run lint` 之类的命令，然后一运行几千个 error。这种情况我只能把 eslint 直接删了…… 我十分理解配置项目的同学都是怀着崇高的理想去配置的 linter，比如统一的缩进、统一的引号分号风格、不能有未使用的导入、不能有未改变过的 let 变量…… 可惜那个时代没有 AI Agent，然后团队也没有配置自动的 CI 检查。代码风格变成全凭自觉的情况，eslint 就纯粹变成一个摆设了。

目前（截止本文发布） oxlint 还不成熟，官方文档的推荐实践仍然是安装一个 `eslint-plugin-oxlint` 插件，禁用掉 oxlint 已经支持的规则，然后在 lint 的时候同时运行 eslint 和 oxlint。对于已经使用 flat config 的项目，oxlint 提供了 `@oxlint/migrate` 可以把 eslint 的配置文件自动迁移到 oxlint，不过项目从 eslint 8 升级到 9，从传统的 `.eslintrc` 升级到 `eslint.config.m(j|t)s` 的过程也需要折腾一番。

相比之下，oxfmt 对 prettier 的兼容性会好很多。oxfmt 兼容 prettier 绝大多数的内置行为，以及支持了常见的插件需求，比如 import 导入排序、TailwindCSS 类名排序、`package.json` 排序等。不过 oxfmt 官宣不考虑支持 prettier 插件，所以使用了一些能力未被 oxc 内建的 prettier 插件的用户就完全无法迁移了。

![Vite+'s Compatibility](https://images.elecmonkey.com/articles/202603/viteplus-compatibility.png)

[https://oxc.rs/compatibility.html](https://oxc.rs/compatibility.html) 有一个对框架 DSL 的兼容性矩阵，可以说截至目前情况并不乐观。另外，不支持第三方插件，就意味着未来新的框架、新的 DSL 能否支持，全看 oxc 团队的开发计划。某种意义上这不符合 Vite 生态的底色。例如最近有个作者在搞一个叫 Ripple 的框架，这个 meta-framework 更是家家户户都能搞一些自己的写法，这些 DSL 五花八门的涌现，用 oxc 可能意味着放弃了某些选型的权利。

## 什么样的业务场景会需要 Vite+

### 快入门 vs. 选型权

当然，Vite+ 作为一个工具，自然是限制不了用户自己不去运行 `vp check` 而是 `vp run lint` 运行自己的 npm script，也限制不了 ci 侧继续用 eslint 和 prettier 去做检查。只是这样一个割裂、不优雅的局面，似乎并不符合 Vite+ 的初衷。

Vite+ 提供了 Node.js 版本管理，我可以不再去配置 `nvm` 了；`vp` 代理了包管理器，我也不用去手动输入 `pnpm` 了。Vite+ 提供了 pre-commit 的检查，取代了项目里配置的 `husky`。

但是需求是多样的，生产环境或者 CI 环境可能是复杂的。如我上面所讲限缩了我对社区解决方案的选择权，Vite+ 本身也限制了我对工具链的选择意愿。从这个角度说，对于熟悉这些工具、熟悉社区生态的前端开发者来说，Vite+ 未见得会让人喜欢，它不带来什么新功能，也没有非侵入式、渐进选择的机会，在前端社区内部，Vite+ 的选用意愿极有可能是有限的。

### 新人友好 / Agent 友好

Vite+ 虽然限缩了选择，但是也提供了一套完整的、opinionated 的前端生态选型。对于新入门的前端学习者来说，如果一开始不在费力的搭建项目，而是一行命令就可以完成项目的搭建，带有完整的生产工具链配置，应该说是可以极大的减小前端的学习门槛。

如果未来 AI 的知识库能够学习到 Vite+ 并愿意使用，或者是有意识的去安装 Vite+ 的 llms.txt / 相关 skills，应该是极大的降低了 AI 在搭建项目过程中犯错的机会。

> 让 AI 自己去创项目，没看到过哪个 AI 会主动的给自己配置一大堆约束和规则的……

对于不太熟悉前端的后端开发者，Vite+ 的统一工具链可能会降低 Vibe Coding 解决前端需求的门槛。不过对于一些什么都不了解，需要全套 Vibe Coding 的非技术人员来讲，Vite+ 提供的解决方案可能并不能带给他们什么印象 —— 他们更需要 Next.js/Nuxt + Supabase 这种一站式的解决方案。