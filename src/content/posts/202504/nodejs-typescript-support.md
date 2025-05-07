---
title: '聊聊 Node.js 原生支持运行 TypeScript 文件'
date: '2025-04-19'
description: 'Node.js 终于原生支持 TypeScript 了。但不是我想象的那种支持。'
tags: ['Node.js', 'TypeScript', 'JavaScript']
author: 'Elecmonkey'
---

## 原生支持

截止今天，Node.js 最新的 LTS 版本是 v22.14.0，最新版本是 v23.11.0。

从 v22.6.0 开始，Node.js 引入了原生"直接运行" TypeScript 代码的功能。

——Node.js 算是姗姗来迟了。Deno 从 2018 年诞生之初就内置了 TypeScript 支持，而 Bun 也在 2022 年发布时就宣称对 TypeScript 有一流支持。相比之下，Node.js 作为影响力最大的 JavaScript 运行时，花了相当长的时间才加入这个行列。

```bash
node main.ts
```

很爽，不是吗？高兴的有点早。

```typescript
enum Status {
  Active = 'active',
  Inactive = 'inactive'
}

console.log(Status.Active);
```

啊，报错了。

```shell
SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]:   x TypeScript enum is not supported in strip-only mode
```

从错误信息可以看出，Node.js 通过 "strip-only" 模式运行 TypeScript 代码。"strip-only mode"，字面意思，就是只剥离类型注解。我们都知道 TypeScript 就是给 JavaScript 添加了 "Type" 嘛。所以如果能通过类型检查，剥离掉类型注解就变成 JavaScript 了，然后再交给 V8 引擎去执行，合理的很。

## TypeScript 编译都做了什么

其实，我们需要理解 TypeScript 编译到 JavaScript 这个过程其实包含三个主要部分：

1. **类型检查**：验证代码中的类型使用是否正确
2. **语法降级**：将现代 ECMAScript 语法和 TypeScript 特有的语法转换为目标环境支持的语法
3. **注解擦除**：移除所有类型注解相关的代码，生成纯 JavaScript

我们用惯了的日常使用的 `tsc` 或 `ts-node` 这样的工具，会完整执行上述三个过程，确保类型安全并生成可运行的 JavaScript 代码。不过呢，类型检查其实做一次就好——**我们开发者知道代码是安全的，这就够了**。并没有每次运行都要 Type Check 的必要。所以 Deno 和 Bun 运行 `.ts` 文件的时候就只是二、三两步。

不过，**Node.js 原生的 TypeScript 支持默认 "strip-only" 模式，只执行了第三步**。

## 会支持，但是有点东西未来再说

当你在 Node.js 中直接运行 TypeScript 文件时，Node.js 默认使用的是 "strip" 模式，即只进行注解擦除。遇到需要语法降级的**装饰器**、**枚举**、**命名空间**等特性，Node.js 就会报错。不过 Node.js 22 已经支持到了 ES2023，应该是不用担心 ES 版本引发的对语法降级的需求。

默认模式之外，官方提供了 `--experimental-transform-types` 标志切换到"转换类型模式"，具体命令如下：

```bash
node --experimental-strip-types --experimental-transform-types main.ts
```

这个标志启用后，Node.js 可以处理以下 TypeScript 特性：
- enum
- namespace
- 传统模块（legacy module）
- 参数属性（parameter properties）

这使得更多的 TypeScript 代码能够直接在 Node.js 中运行。官方明确的说未来会有完整的 TypeScript 支持，不需要命令行标志。所以 transform-types 模式可以看作 Node.js **未来的演进方向**。

不过，即使使用了这个标志，装饰器（Decorators）仍然会被报错。根据 [Node.js 官方文档：Modules: TypeScript](https://nodejs.org/docs/v22.14.0/api/typescript.html)，装饰器不被转换，因为它是 TC39 Stage 3 提案的内容，该提案已进入最终实现和测试阶段，预计将在 ​ECMAScript 2025（ES2025）中正式发布，成为 JavaScript 标准的一部分。

——**爷摆烂了，等 V8 来实现吧**。到时候装饰器就是原生 JavaScript 代码了，不关 TypeScript 的事儿。反正等 Node.js 正式支持 TypeScript 还得更新几个版本，ES 标准你也得跟着更新。我 Node.js 又不是浏览器环境，天天替客户操心，写一堆垃圾判断去兼容 IE6。

类似的问题也会出现在使用其它 TypeScript 特有特性的代码中，尤其是那些依赖 `tsconfig.json` 配置的功能。

## Amaro

众所周知 Deno 是 Node.js 创始人的新项目，它原生支持 TypeScript 的秘诀在于内置了一个 swc 转译工具。Node.js 则自己搞出一个名为 Amaro 的内部 TypeScript 加载器来处理 TypeScript 文件。

与其他 TypeScript 工具不同，Amaro 有一个重要的特点：它不读取 `tsconfig.json` 文件。这意味着在 `tsconfig.json` 中配置的内容（如路径别名、目标 ECMAScript 版本等）对 Amaro 没有影响。这是为了保持功能的轻量级和简单性——还是那个道理，Node.js 的 JavaScript 运行时是确定的，不需要考虑稀奇古怪的版本问题，这给工具选配带来了很大的自由。

Node.js 官方特别提到，`tsconfig.json` "are intentionally unsupported"———**有意不受支持**。

不过，`tsconfig.json` 虽然 Amaro 不读取，但你的 VSCode 编辑器会哇（笑）。

在 [Node.js 官方文档: TypeScript](https://nodejs.org/api/typescript.html#type-stripping) 中，官方建议，如果你要在项目中使用 Node.js 原生 TypeScript 支持，应该：

- 使用 TypeScript 5.8 或更高版本
- 在 `tsconfig.json` 中设置以下选项：
```json
{
  "compilerOptions": {
    "noEmit": true,          // 不生成编译输出文件，仅类型检查
    "target": "esnext",      // 编译目标为最新 ES 标准
    "module": "nodenext",    // 模块系统为 Node.js 的 ESM 标准
    "rewriteRelativeImportExtensions": true, // 强制补全相对路径的扩展名
    "erasableSyntaxOnly": true, // 移除无运行时影响的语法
    "verbatimModuleSyntax": true // 严格区分类型/值的导入导出
  }
}
```

当你启用 `erasableSyntaxOnly` 后，你的 VSCode 编辑器就会告诉你哪些东西可能会报错：

![erasableSyntaxOnly的作用](https://images.elecmonkey.com/articles/202504/ts-in-node.png)

实测，枚举（enum）、命名空间（namespace）、参数属性（parameter properties）会报错，但是唯一真的无法启用的装饰器（decorators）不会报错，interesting，原因暂未深究。

## Node.js 团队想要什么？

Node.js 原生支持 TypeScript 确实是一大进步，但它的实现有明显局限性。但是我们大概能感受到，Node.js 官方对于 TypeScript 支持的目标是"轻量"，而不是完整地取代 TypeScript 工具链。

这种设计思路其实也很合理：Node.js 作为一个 JavaScript 运行时，它的首要任务是高效地执行 JavaScript 代码。对于简单的类型标注和基础语法，当前的"剥离模式"已经足够——未来也会有完整的 TypeScript 语法支持。对于需要完整类型检查和复杂 TypeScript 特性的项目，专业工具链会做得更好。

说到 TypeScript 工具链，官方编译器最近也有大动作。值得关注的是，微软最近启动了 [TypeScript-Go 项目](https://github.com/microsoft/typescript-go)。它被称为「TypeScript 7」——这意味着它将在两个大版本后成为 TS 的正式编译器。

在各种语言努力地从非自托管走向自托管的路上，TypeScript 选择迈出了相反的一步。不过这一切并不是毫无由头的，出于前端开发者们的熟悉，早期的前端工具链基本都是基于 Node.js 的。不过 JavaScript 作为解释型语言天生效率不及编译型语言，这几年也诞生了大量「Rust for JavaScript」、「Go for JavaScript」之类的工具。

我们一如既往地见证前端世界最大的特点——**分散**、**碎片**、**混沌**。或者说**开放**、**包容**、**多元**。