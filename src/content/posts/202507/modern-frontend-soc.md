---
title: "技术分层or功能聚合，现代前端应当有怎样的关注点分离"
date: "2025-07-17"
description: "我说 Tailwind CSS 不就是在写 inline-style，你能反驳吗？你能反驳吗？"
tags: ["前端架构", "关注点分离 (SoC)", "Tailwind CSS", "Vue", "React"]
author: "Elecmonkey"
---

## “按技术分离” 到 “逻辑聚合”

写 Tailwind CSS 不就是写 inline-style 吗？这个问题看一眼，感觉很有道理啊。

```html
<div class="bg-red-500 text-white p-4">
  <h1 class="text-2xl font-bold">Hello, world!</h1>
</div>
```
和

```html
<div style="background-color: red; color: white; padding: 16px;">
  <h1 style="font-size: 24px; font-weight: bold;">Hello, world!</h1>
</div>
```

真的区别很大吗？除了一个短一个长。

inline-style 已经被根深蒂固的被认为是一种不良实践，我们的前端前辈们可是花了很大的力气才创建了上手就创建三个文件 `index.html`、`index.css`、`index.js` 的习惯啊。传统的 Web 开发遵循着“三分离”——HTML 负责结构，CSS 负责样式，JavaScript 负责行为。这种**按技术的分离**在静态网页时代清晰明了，大家各司其职。

Tailwind CSS 将样式紧贴结构写入 class 属性，确实某种意义上是回到了 inline-style 的老路。不过，当下前端社区的关注点分离方法已经和 php 时代截然不同。在那个没有组件化概念的时代，为了避免页面代码过程，大家理所当然的想到了把 JavaScript 和 CSS 从 HTML 里拆分出去——因为 `link` 和 `script` 标签天生给我们提供了这样分离的能力，当时的 HTML 还没有任何的组件化方案。

不过，在普遍使用遵循组件化原则的前端框架、浏览器原生也有了 Web Components 的今天，我们已经很少再见到一个冗长的页面，而是像搭积木一样，把组件拼在一起，每个组件都不应该承担过多过杂的内容，否则应该继续向下拆分。

此时，把样式和逻辑直接写进组件中的这种做法反而提高了开发效率和可维护性。传统的 CSS、JavaScript 分离导致样式和逻辑分散在不同文件中，开发者在修改组件样式时需要在 HTML 和 CSS 文件之间频繁切换。写在一起，开发者可以一眼看出一个组件的所有样式与逻辑，减少了心智负担。（同时也避免了 CSS 的样式污染问题——这有工具链的功劳）

我们熟悉的 React 函数组件、Vue 单文件组件、Svelte 单文件组件、Solid.js 函数组件，都是这样的。现在大家已经普遍认为这样的写法是理所应当的了。

> Tailwind CSS 比起 inline-style 当然也有技术上的好处。它可以利用工具链的优化能力，例如 tree-shaking，可以减小最终产物的大小。CSSOM 树的构建方式也使得类名样式可以被浏览器缓存，从而提高性能。
> 
> 此外，inline-style 无法做媒体查询、无法做伪类、无法做主题切换、无法利用 CSS 层叠机制，而 Tailwind CSS 都可以。
>
> Tailwind CSS 是一种相当“现代前端”的工具。

**这种转变，体现了前端开发从“按技术分离”向“逻辑聚合”的演进。**

## Vue 与 React 的演进

Vue 框架的演进历程同样经历了这种思维转变。在 Vue 2 的 Options API 时代，通常这样组织代码：

```vue
<template>
  <!-- 模板 -->
</template>

<script>
export default {
  data() {
    return {
      // 所有数据
    }
  },
  methods: {
    // 所有方法
  },
  computed: {
    // 所有计算属性
  }
}
</script>
```

这种写法也是“逻辑分散、技术聚合”。随着组件大小的膨胀，当你要修改一个功能时，往往需要在 data、methods、computed 之间反复跳转，心智负担很重。

当然也可以说，做好足够精细粒度的组件化，让组件内逻辑高度聚合、避免单个组件过长，就可以避免这种问题。但是 Vue 的新组件就意味着新文件，比起 React 提取一个函数就ok，Vue 的组件更“重”、大家更不倾向于划分更多组件，从这个意义上，Vue 比 React 更容易单个组件膨胀。

> 题外话：如果你很喜欢 React 的函数组件，有一种叫做 Vue Vine 的东西你可能会喜欢。
> 
> 项目地址：[https://github.com/vue-vine/vue-vine](https://github.com/vue-vine/vue-vine)
> 
> VueConf 2025 演讲：[https://vue-vine-ppt-2025.vercel.app/](https://vue-vine-ppt-2025.vercel.app/)

Vue 3 的 Composition API 与 setup 语法糖带来了彻底的改变：

```vue
<script setup>
// 用户相关逻辑
const { user, login, logout } = useAuth()

// 购物车相关逻辑  
const { items, addItem, removeItem } = useCart()

// 主题相关逻辑
const { theme, toggleTheme } = useTheme()
</script>
```

现在，相关的逻辑被聚合在一起，而不是说技术上都是“成员”、都是“方法”、都是“生命周期”的东西聚合在一起。这种变化的核心思想和 Tailwind CSS 有点类似：关注点按功能、逻辑聚合，而不是分散在多个技术层面。

这种演进的动机来自于实际项目维护的痛苦。想象一下，你接手了一个几年前的项目，一个 Vue 单文件组件上千行代码，data 里定义了几十个变量，methods 里有几十个方法，template 乱七八糟的 DOM 一通嵌套。当你需要修改一个功能时，你需要在这三个部分之间反复跳转，试图理解它们之间的关系。

这些项目如果还缺少文档的话就更糟糕了，代码就是唯一的文档，而代码的组织方式又让人难以理解。这时候你会发现，传统的“技术分离”虽然看起来清晰，但在实际维护中却增加了认知负担。

好的架构应该有一个核心指标：**系统能够承受演进需求**，而非随着复杂度膨胀越来越难以维护。这成为了选择架构模式和关注点分离策略的重要标准。

有趣的是，React 的演进路径和 Vue 几乎如出一辙。从 Class Component 到 Function Component + Hooks，也是一个从技术分离到逻辑聚合的过程。

在 Class Component 时代，状态定义在构造器中，生命周期处理分散在各个生命周期方法里，逻辑复用依赖笨重的 HOC 或 Mixin。而 Function Component + Hooks 让我们可以将相关逻辑聚合在一起，通过 Custom Hook 实现优雅的逻辑复用。

这种演进反映了整个前端生态的共同趋势：从"清晰"走向"可演进"。我们不再满足于代码看起来整洁，而是希望代码能够适应变化，支持长期的迭代和维护。

## 那项目结构呢？

在项目层面，目前前端最流行的代码组织方式仍然是“按技术”关注点分离。

```dir
src/
├── pages/
├── services/
├── stores/
├── types/
└── utils/
```

这种结构看起来很整洁，但当你要修改一个功能时，往往需要跨多个文件夹操作。比如要修改用户认证功能，你可能需要同时修改 `pages/Login.vue`、`services/authService.ts`、`stores/authStore.ts` 和 `types/auth.ts`。

有没有一种可能，我们可以像**HTML、CSS、JavaScript 三分**转向**功能聚合**、Vue SFC 组件内部**方法、数据、计算属性分开写**转向**逻辑聚合**那样，在项目层次上也不再遵循 Java 味儿浓厚的技术栈层分离？

我觉得，目前社区流行的 **monorepo** 方案，就是一种粒度比较粗的“功能聚合”。每个 `package` 内部的代码量有限时，就可以按传统的按技术分离去组织代码了。

## 复杂度提升带来的协作问题

现代前端项目规模越来越大，开发很少再是一个人的独角戏，更多的是团队协作。

按功能逻辑分离的项目结构天然适合多人协作，因为不同的开发者可以相对独立地在不同的功能模块上工作，减少代码冲突的可能性。组件内部的逻辑聚合也降低了新成员理解代码的门槛，因为相关的逻辑都在一个地方。

这种演进的目标很明确：**长期可演进**、**局部可替换**、**团队可协作**。我们希望系统的每个部分都能相对独立地演进，当需要替换某个功能时不会牵一发而动全身，当新成员加入团队时能够快速上手。

> 局部可替换。比如说项目现在要加一个新功能，按技术分离，每一个分离的部分都难以单独修改。组件、方法、数据、计算属性相互关联，HTML、CSS、JavaScript 相互影响。分离没有起到分离的作用。

## 现代前端需要怎样的 SoC

传统架构是前人的经验总结，当然是我们架构决策主要的参考点。不过还是要多想一想，每一种架构的诞生当初是为了解决什么问题。毕竟，所有的软件都在向前演进，架构好坏的唯一标准是它是否能够适应未来变化。