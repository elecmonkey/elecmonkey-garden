---
title: "Technical Layering or Feature Cohesion: What Kind of Separation of Concerns Should Modern Frontend Have?"
date: "2025-07-17"
description: "If I say Tailwind CSS is just writing inline-style, can you refute it? Can you?"
tags: ["Frontend Architecture", "Separation of Concerns (SoC)", "Tailwind CSS", "Vue", "React", "Frontend Engineering"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

## From "Separation by Technology" to "Logical Cohesion"

Is writing Tailwind CSS not just writing inline-style? At first glance, this question feels quite reasonable.

```html
<div class="bg-red-500 text-white p-4">
  <h1 class="text-2xl font-bold">Hello, world!</h1>
</div>
```

and

```html
<div style="background-color: red; color: white; padding: 16px;">
  <h1 style="font-size: 24px; font-weight: bold;">Hello, world!</h1>
</div>
```

Are they really that different, except that one is shorter and the other is longer?

inline-style has long been deeply regarded as a bad practice. Our frontend predecessors spent great effort creating the habit of starting with three files: `index.html`, `index.css`, and `index.js`. Traditional Web development followed the "three separations": HTML for structure, CSS for styles, and JavaScript for behavior. This **separation by technology** was clear and straightforward in the era of static web pages, with everyone doing their own job.

Tailwind CSS writes styles directly into the class attribute, close to the structure, which in some sense does return to the old path of inline-style. However, today's frontend community approaches separation of concerns very differently from the PHP era. In an age without the concept of componentization, to avoid overly long page code, people naturally thought of extracting JavaScript and CSS from HTML, because `link` and `script` tags inherently provided this ability to separate them. At that time, HTML had no componentization solution at all.

But today, when frontend frameworks that follow componentization principles are widely used and browsers also have native Web Components, we rarely see a long, monolithic page anymore. Instead, we assemble components like building blocks. Each component should not take on too much or too mixed responsibility; otherwise, it should be further split downward.

At this point, writing styles and logic directly into components actually improves development efficiency and maintainability. Traditional CSS and JavaScript separation scatters styles and logic across different files, forcing developers to switch frequently between HTML and CSS files when modifying component styles. When written together, developers can see all styles and logic of a component at a glance, reducing mental overhead. It also avoids CSS style pollution, thanks to the toolchain.

The React function components, Vue Single File Components, Svelte Single File Components, and Solid.js function components we are familiar with all work this way. Now everyone generally considers this style of writing natural.

> Tailwind CSS certainly also has technical advantages over inline-style. It can use toolchain optimizations, such as tree-shaking, to reduce the size of the final output. The way the CSSOM tree is built also allows class-name styles to be cached by the browser, improving performance.
>
> In addition, inline-style cannot do media queries, pseudo-classes, theme switching, or use the CSS cascade mechanism, while Tailwind CSS can do all of these.
>
> Tailwind CSS is a very "modern frontend" tool.

**This shift reflects the evolution of frontend development from "separation by technology" toward "logical cohesion."**

## The Evolution of Vue and React

The evolution of the Vue framework went through the same shift in thinking. In the Vue 2 Options API era, code was usually organized like this:

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

This style is also "logic scattered, technology grouped." As components grow in size, when you need to modify a feature, you often need to jump back and forth among data, methods, and computed, which creates a heavy mental burden.

Of course, one could also say that sufficiently fine-grained componentization can keep logic highly cohesive inside a component and prevent a single component from becoming too long. But in Vue, a new component means a new file. Compared with React, where extracting a function is enough, Vue components are "heavier," and people are less inclined to split out more components. In this sense, Vue is more prone than React to single-component bloat.

> Side note: If you really like React function components, there is something called Vue Vine that you may enjoy.
>
> Project address: [https://github.com/vue-vine/vue-vine](https://github.com/vue-vine/vue-vine)
>
> VueConf 2025 talk: [https://vue-vine-ppt-2025.vercel.app/](https://vue-vine-ppt-2025.vercel.app/)

Vue 3's Composition API and setup syntax sugar brought a complete change:

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

Now related logic is grouped together, rather than grouping things that are technically all "members," all "methods," or all "lifecycle" items. The core idea behind this change is somewhat similar to Tailwind CSS: concerns are grouped by feature and logic, rather than scattered across multiple technical layers.

The motivation for this evolution comes from the pain of maintaining real projects. Imagine taking over a project from several years ago: a Vue Single File Component with thousands of lines of code, dozens of variables defined in data, dozens of methods in methods, and a template full of messy nested DOM. When you need to modify a feature, you have to jump back and forth among these three parts, trying to understand their relationships.

These projects are even worse if they lack documentation. The code is the only documentation, but the way the code is organized makes it difficult to understand. At that point you realize that traditional "technical separation" may look clear, but in actual maintenance it increases cognitive burden.

Good architecture should have one core metric: **the system can withstand evolving requirements**, rather than becoming increasingly difficult to maintain as complexity expands. This has become an important criterion for choosing architecture patterns and separation-of-concerns strategies.

Interestingly, React's evolutionary path is almost identical to Vue's. From Class Component to Function Component + Hooks, it is also a process of moving from technical separation to logical cohesion.

In the Class Component era, state was defined in the constructor, lifecycle handling was scattered across lifecycle methods, and logic reuse depended on heavy HOCs or Mixins. Function Component + Hooks allow us to group related logic together and achieve elegant logic reuse through Custom Hook.

This evolution reflects a shared trend across the entire frontend ecosystem: moving from "clarity" toward "evolvability." We are no longer satisfied with code that merely looks tidy. We want code that can adapt to change and support long-term iteration and maintenance.

## What About Project Structure?

At the project level, the most popular way to organize frontend code today is still separation of concerns "by technology."

```dir
src/
├── pages/
├── services/
├── stores/
├── types/
└── utils/
```

This structure looks neat, but when you need to modify a feature, you often need to work across multiple folders. For example, to modify user authentication, you may need to change `pages/Login.vue`, `services/authService.ts`, `stores/authStore.ts`, and `types/auth.ts` at the same time.

Is it possible that, just as **HTML, CSS, JavaScript separation** shifted toward **feature cohesion**, and Vue SFC's internal split among **methods, data, and computed properties** shifted toward **logical cohesion**, we can also stop following a strongly Java-flavored technology-stack layer separation at the project level?

I think the currently popular **monorepo** approach in the community is a coarse-grained form of "feature cohesion." When the amount of code inside each `package` is limited, it can then be organized internally using traditional separation by technology.

## Collaboration Issues Caused by Rising Complexity

Modern frontend projects are growing larger and larger. Development is rarely a one-person solo act anymore; it is more often team collaboration.

A project structure separated by feature logic is naturally suited to collaboration, because different developers can work relatively independently on different feature modules, reducing the likelihood of code conflicts. Logical cohesion inside components also lowers the barrier for new members to understand the code, because related logic is all in one place.

The goal of this evolution is clear: **long-term evolvability**, **local replaceability**, and **team collaboration**. We want every part of the system to evolve relatively independently, so replacing a feature does not affect the whole system, and new members can get started quickly when they join the team.

> Local replaceability. For example, if a project needs to add a new feature now, with technical separation, every separated part is difficult to modify in isolation. Components, methods, data, and computed properties are interrelated; HTML, CSS, and JavaScript affect each other. The separation has not achieved the purpose of separation.

## What Kind of SoC Does Modern Frontend Need?

Traditional architecture is the accumulated experience of predecessors, and of course it is a major reference point for our architectural decisions. But we still need to think more about what problem each architecture was originally created to solve. After all, all software keeps evolving, and the only standard for whether an architecture is good or bad is whether it can adapt to future changes.
