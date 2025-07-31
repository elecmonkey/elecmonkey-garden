---
title: "Vite 分包预加载优化：首屏延迟与后续交互的平衡"
date: "2025-08-01"
description: "利用 Vite 的 import.meta.glob 实现模块 prefetch 逻辑。"
tags: ["Vite", "性能优化", "Vue", "React", "Solid.js", "Qwik"]
author: "Elecmonkey"
---

## 背景：为什么会卡？

现代前端 JavaScript Bundle 的体积不断膨胀，为了优化首屏加载性能，常会使用代码分割策略。每当有一个路由页面被拆分为动态 import 导入的模块，Vite 就会自动将其拆分成独立的 chunk 文件，只有当用户访问到该页面时才加载。

这在大型项目中几乎是必然必要的——功能复杂的应用不可能把所有代码打在入口的 JS Bundle 里让用户等着慢慢下载。

```typescript
lazy(() => import('./pages/XXXPage.tsx'))
```

但是如果你的应用不大，碰巧服务器延迟又很高，就有可能出现首屏没快多少，每次切换 router 跳转时页面就会有明显卡顿——因为被 split 出去的 JS Bundle 就是在第一次被访问到的时候才下载的呀！

## 解决思路：预加载所有页面模块

解决策略非常直接：

在首屏渲染完成后，后台空闲时自动拉取其余页面的 JS chunk。

这样用户虽然第一次不会访问这些页面，但 JS 提前缓存了，下次跳转时就不会卡。

### Vite 的 import.meta.glob

Vite 提供了一个极其实用的语法糖：

```typescript
const modules = import.meta.glob('./pages/*.tsx')
```

这段代码的含义是：
- Vite 在构建时记录所有 `./pages/` 下的 `.tsx` 文件路径；
- 每个路径对应一个懒加载函数（返回 `import()`）；

### 利用 import.meta.glob 收集模块

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

### 在主页调用

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

## import.meta.glob 的匹配时机

构建后没有 `.tsx` 文件了，那 `import.meta.glob('./pages/*.tsx')` 还能匹配到什么？

`import.meta.glob` 是 Vite 提供的 API，很显然它不是最终在运行时运行的函数，而是在构建阶段解析并生成模块映射表，写死在构建产物的代码中。

编译后的效果类似如下：

```javascript
const modules = {
  './pages/HomePage.tsx': () => import('./assets/HomePage.hash1234.js'),
  './pages/AboutPage.tsx': () => import('./assets/AboutPage.hash5678.js'),
}
```

我们执行对应的函数就把模块 import 进来了，import 了浏览器当然要下载对应的文件。当然，动态 `import()` 需要浏览器支持，**IE 11 之类的就不要想了**。这也是为什么 `import.meta.glob` 不支持动态传参（如变量路径）的原因。

## Qwik 哲学

假如，假如项目非常非常大，不巧的是我们又对性能非常敏感。主页直接拉所有 lazy 了的模块感觉有点吃力，还有没有更好的策略呢？

Qwik 作为一个极致拆包的框架，必然要在 prefetch 策略上狠下功夫——首屏时间不能以牺牲后面所有每一步的交互为代价，对吧？进入视口 prefetch、鼠标 hover prefetch…… 反正 Vite 把能力提供到了，后面一切逻辑都可以自己发挥创造了！