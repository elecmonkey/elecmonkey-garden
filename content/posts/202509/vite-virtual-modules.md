---
title: "Vite 插件机制中的虚拟模块 (Virtual Modules)"
date: "2025-09-30"
description: "VuePress，Vitepress，Slidev…… 如何更灵活地利用 Vite 的 SSR/SSG 能力构建一个站点生成器？"
tags: ["Vite", "Rollup", "构建工具", "前端工程化", "虚拟模块"]
author: "Elecmonkey"
---

虚拟模块（Virtual Module）是一种在构建工具中动态生成的模块，它并不对应文件系统中的实际文件，而是在编译阶段由插件生成、在运行时像普通 ESM 模块一样被导入使用。Vite 官方文档指出，虚拟模块允许开发者通过正常的 ESM `import` 语法向源码注入编译时信息。通常以 `virtual:` 为前缀命名（最好再加上插件名命名空间以避免冲突），例如 `virtual:my-module`。

## 在插件中创建虚拟模块

要在 Vite 插件中实现虚拟模块，需要使用两个主要钩子：`resolveId` 和 `load`。通常做法是：定义一个虚拟模块标识（例如 `const virtualId = 'virtual:foo'`），在 `resolveId(id)` 钩子中如果 `id === virtualId`，则返回带前缀的内部 ID（如 `'\0' + virtualId`），表示该插件负责处理此导入；然后在 `load(id)` 钩子中检查是否为带前缀的内部 ID，如果匹配则返回模块内容（字符串形式的代码）。例如：

```js
// vite-plugin-foo.js（插件示例）
export default function fooPlugin() {
  const virtualId = 'virtual:foo'
  const resolvedVirtualId = '\0' + virtualId
  return {
    name: 'vite-plugin-foo',
    resolveId(id) {
      if (id === virtualId) {
        return resolvedVirtualId  // 捕获虚拟模块 ID
      }
    },
    load(id) {
      if (id === resolvedVirtualId) {
        // 返回虚拟模块的导出内容
        return 'export const msg = "Hello from virtual module";'
      }
    }
  }
}
```

注意返回的 `resolvedVirtualId` 带有 `\0` 前缀，这是 Rollup/Vite 处理虚拟模块的惯例，可以阻止其他解析（如文件系统查找或别名）干扰该 ID。

## 示例：定义、导入及生命周期

下面通过示例演示如何定义、导入和使用虚拟模块。假设在项目中创建一个插件 `virtual-sum-plugin.js`，动态生成一个计算数组之和的模块：

```js
// virtual-sum-plugin.js
export default function sumPlugin() {
  const virtualSumId = 'virtual:sum'
  const resolvedId = '\0' + virtualSumId
  return {
    name: 'vite-plugin-virtual-sum',
    resolveId(id) {
      if (id === virtualSumId) {
        return resolvedId
      }
    },
    load(id) {
      if (id === resolvedId) {
        // 虚拟模块导出的内容：一个求和函数
        return 'export default function sum(arr, i = 0) { return i >= arr.length ? 0 : arr[i] + sum(arr, i + 1); }'
      }
    }
  }
}
```

在 `vite.config.js` 中引入并使用该插件：

```js
import sumPlugin from './virtual-sum-plugin.js'
export default {
  plugins: [
    sumPlugin()
  ]
}
```

此时，在应用代码中就可以直接导入该虚拟模块并使用：

```js
import sum from 'virtual:sum'
console.log(sum([1, 3, 5, 7, 9]))  // 输出 25
```

如上所示，构建期间该模块并不来自文件系统，而是由插件的 `load` 钩子返回的字符串生成。开发模式下，每次导入此模块时会调用插件的 `load` 钩子来获取内容。在生产构建时，Rollup 打包器也会执行相同的钩子逻辑。

## TypeScript 类型问题

在 TypeScript 项目中，引入虚拟需要在全局声明文件中添加类型定义。

例如：

```ts
declare module 'virtual:*' {
  const content: any
  export default content
}
```

可以让 TS 接受任意以 `virtual:` 开头的导入。

## HMR 更新

在开发服务器运行时，虚拟模块同样支持 HMR。若虚拟模块生成的内容依赖外部数据（如 JSON 文件等），可以在插件中实现 `handleHotUpdate` 钩子来手动更新模块内容。

虚拟模块内容变化时，需要使用 `handleHotUpdate` 钩子手动触发模块更新，否则 Vite 默认不会自动刷新此类模块。在该钩子中可调用 `moduleGraph.invalidateModule()` 或将对应模块返回，促使客户端进行热重载。

## 那么，虚拟模块可以用来？

- **注入编译时/运行时变量：** 例如，通过插件生成特定环境变量模块，将其作为常量导入应用。社区插件 *vite-plugin-env-import* 即演示了如何使用 `virtual:env` 和 `virtual:env:public` 等虚拟模块，将 `.env` 中的变量作为静态字符串导出。这样，在代码中可以直接 `import { VITE_API } from 'virtual:env:public'` 等方式获取环境配置，而无需手动管理 `import.meta.env`。

- **动态配置与路由生成：** 可以利用虚拟模块根据文件结构或配置动态生成代码。比如通过插件扫描某个目录，生成路由配置或某些常量文件，然后在运行时通过 `import virtual:...` 使用。这避免了手动维护配置。

然后就可以参考我的 description 了——

**Vue 模块、路由都可以动态生成**，现代前端框架和 Vue 又提供了 SSR/SSG 能力，那我们完全可以以一种更像“写前端”的方式（而非“写编译器”的感觉，不断的和代码生成打交道）去构建自己的站点生成器。

顺便，很喜欢这两个优雅的项目。

[VitePress](https://vitepress.dev/) - Vite & Vue Powered Static Site Generator

[Slidev](https://sli.dev/) - Presentation Slides for Developers