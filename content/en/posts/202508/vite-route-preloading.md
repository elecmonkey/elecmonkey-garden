---
title: "Vite Chunk Preloading Optimization: Balancing First-Screen Latency and Later Interactions"
date: "2025-08-01"
description: "Use Vite's import.meta.glob to implement module prefetch logic."
tags: ["Vite", "Performance Optimization", "Vue", "React", "Solid.js", "Qwik"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

## Background: Why Does It Stutter?

Modern frontend JavaScript Bundles keep growing in size. To optimize first-screen loading performance, code splitting is often used. Whenever a route page is split into a module imported through dynamic import, Vite automatically splits it into a separate chunk file, which is only loaded when the user visits that page.

This is almost inevitably necessary in large projects. A complex application cannot put all code into the entry JS Bundle and make users wait while it slowly downloads.

```typescript
lazy(() => import('./pages/XXXPage.tsx'))
```

But if your application is not large and the server latency happens to be high, the first screen may not become much faster, while every router navigation visibly stutters. That is because the split-out JS Bundle is only downloaded the first time it is accessed.

## Solution: Preload All Page Modules

The strategy is very straightforward:

After the first screen has finished rendering, automatically fetch the remaining pages' JS chunks in the background during idle time.

This way, although users do not visit these pages initially, the JS is cached in advance, so the next navigation will not stutter.

### Vite's import.meta.glob

Vite provides an extremely practical syntax sugar:

```typescript
const modules = import.meta.glob('./pages/*.tsx')
```

This code means:
- Vite records the paths of all `.tsx` files under `./pages/` at build time;
- Each path corresponds to a lazy-loading function that returns `import()`;

### Collecting Modules with import.meta.glob

```typescript
// 收集所有页面组件
const modules = import.meta.glob('./pages/*Page.tsx');

export function preloadAllPages(exceptFile: string = '') {
  for (const path in modules) {
    if (exceptFile && path.endsWith(exceptFile)) continue;
    // 给主页一个排除自己的机会

    modules[path]().then(() => {
      console.log(`预加载成功: ${path}`);
    }).catch((error) => {
      console.warn(`预加载失败: ${path}`, error);
    });
  }
}
```

### Calling It on the Home Page

```typescript
import { preloadAllPages } from './routes-preload';
import { onMount } from 'solid-js'; // 用 Solid.js 举个例子

const App: Component = () => {
  onMount(() => {
    setTimeout(() => {
      preloadAllPages('MainPage.tsx'); // 首屏页面，不需要重复加载
    }, 500); // 页面稳定后延迟触发
  });

  return (
    // 路由组件...
  );
};
```

## When import.meta.glob Matches

After the build, there are no `.tsx` files anymore. So what can `import.meta.glob('./pages/*.tsx')` still match?

`import.meta.glob` is an API provided by Vite. Obviously, it is not a function that runs at final runtime. Instead, it is parsed at build time and generates a module mapping table that is hardcoded into the built output.

The compiled result looks roughly like this:

```javascript
const modules = {
  './pages/HomePage.tsx': () => import('./assets/HomePage.hash1234.js'),
  './pages/AboutPage.tsx': () => import('./assets/AboutPage.hash5678.js'),
}
```

When we execute the corresponding function, the module is imported; once imported, the browser naturally downloads the corresponding file. Of course, dynamic `import()` requires browser support, so **do not even think about IE 11 and the like**. This is also why `import.meta.glob` does not support dynamic parameters, such as variable paths.

## Qwik Philosophy

Suppose, just suppose, the project is very, very large, and unfortunately we are also extremely sensitive to performance. Pulling all lazy modules directly from the home page feels a bit heavy. Is there a better strategy?

As a framework that takes chunk splitting to the extreme, Qwik must put serious effort into prefetch strategies. First-screen time cannot come at the cost of sacrificing every later interaction, right? Prefetch when entering the viewport, prefetch on mouse hover... In any case, Vite has provided the capability, and all later logic can be created freely.
