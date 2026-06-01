---
title: "Talking About Node.js Native Support for Running TypeScript Files"
date: "2025-04-19"
description: "Node.js finally supports TypeScript natively. But not in the way I imagined."
tags: ["Node.js", "TypeScript", "JavaScript"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

## Native Support

As of today, the latest LTS version of Node.js is v22.14.0, and the latest version is v23.11.0.

Starting from v22.6.0, Node.js introduced native support for "directly running" TypeScript code.

Node.js is quite late to the party. Deno had built-in TypeScript support from its birth in 2018, and Bun also claimed first-class TypeScript support when it was released in 2022. By comparison, Node.js, as the most influential JavaScript runtime, took quite a long time to join this group.

```bash
node main.ts
```

Nice, right? Maybe do not celebrate too early.

```typescript
enum Status {
  Active = 'active',
  Inactive = 'inactive'
}

console.log(Status.Active);
```

Ah, it errors.

```shell
SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]:   x TypeScript enum is not supported in strip-only mode
```

From the error message, we can see that Node.js runs TypeScript code in "strip-only" mode. "strip-only mode" literally means only stripping type annotations. We all know TypeScript adds "Type" to JavaScript. So if the code can pass type checking, stripping away type annotations turns it into JavaScript, which can then be handed to the V8 engine for execution. Very reasonable.

## What TypeScript Compilation Does

Actually, we need to understand that compiling TypeScript to JavaScript includes three main parts:

1. **Type checking**: verifies whether types are used correctly in code
2. **Syntax lowering**: converts modern ECMAScript syntax and TypeScript-specific syntax into syntax supported by the target environment
3. **Annotation erasure**: removes all type-annotation-related code and generates pure JavaScript

Tools we use daily, such as `tsc` or `ts-node`, perform all three processes to ensure type safety and generate runnable JavaScript code. However, type checking only needs to be done once. **We developers know the code is safe, and that is enough**. There is no need to Type Check every time it runs. So when Deno and Bun run `.ts` files, they only perform steps two and three.

However, **Node.js native TypeScript support defaults to "strip-only" mode and only performs the third step**.

## It Will Support More, But Some Things Are Left for the Future

When you directly run a TypeScript file in Node.js, Node.js uses "strip" mode by default, meaning it only erases annotations. When it encounters features that require syntax lowering, such as **decorators**, **enums**, and **namespaces**, Node.js errors. But Node.js 22 already supports up to ES2023, so there should be no need to worry about ES-version-related syntax lowering.

Outside the default mode, the official team provides the `--experimental-transform-types` flag to switch to "transform types mode". The specific command is:

```bash
node --experimental-strip-types --experimental-transform-types main.ts
```

After this flag is enabled, Node.js can handle the following TypeScript features:

- enum
- namespace
- legacy module
- parameter properties

This allows more TypeScript code to run directly in Node.js. The official team has clearly said that full TypeScript support will come in the future without command-line flags. So transform-types mode can be seen as Node.js's **future evolution direction**.

However, even with this flag, decorators still error. According to the [Node.js official docs: Modules: TypeScript](https://nodejs.org/docs/v22.14.0/api/typescript.html), decorators are not transformed because they are part of a TC39 Stage 3 proposal. That proposal has entered the final implementation and testing stage and is expected to be officially released in ECMAScript 2025 (ES2025), becoming part of the JavaScript standard.

In other words: **we give up, let V8 implement it**. By then decorators will be native JavaScript code and have nothing to do with TypeScript. Anyway, Node.js will need several more versions before officially supporting TypeScript, and the ES standard will also need to be updated along the way. Node.js is not a browser environment; it does not need to worry about customers every day and write a pile of garbage checks to support IE6.

Similar issues also appear in code using other TypeScript-specific features, especially features that rely on `tsconfig.json` configuration.

## Amaro

As everyone knows, Deno is the new project from Node.js's creator. Its secret to native TypeScript support is a built-in swc transpiler. Node.js created its own internal TypeScript loader named Amaro to handle TypeScript files.

Unlike other TypeScript tools, Amaro has an important characteristic: it does not read `tsconfig.json`. This means configurations in `tsconfig.json`, such as path aliases and target ECMAScript version, have no effect on Amaro. This is to keep the feature lightweight and simple. The reason is the same: Node.js's JavaScript runtime is definite and does not need to consider strange version problems, which gives great freedom in tool selection.

The Node.js official docs specifically mention that `tsconfig.json` files "are intentionally unsupported" -- **intentionally unsupported**.

But although Amaro does not read `tsconfig.json`, your VSCode editor will, haha.

In the [Node.js official docs: TypeScript](https://nodejs.org/api/typescript.html#type-stripping), the official recommendation is that if you want to use Node.js native TypeScript support in a project, you should:

- Use TypeScript 5.8 or later
- Set the following options in `tsconfig.json`:

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

After you enable `erasableSyntaxOnly`, your VSCode editor will tell you which things may error:

![Effect of erasableSyntaxOnly](https://images.elecmonkey.com/articles/202504/ts-in-node.png)

In actual testing, enum, namespace, and parameter properties error, but decorators, the only thing that truly cannot be enabled, do not error. Interesting. I have not dug into the reason yet.

## What Does the Node.js Team Want?

Node.js native TypeScript support is indeed a big step forward, but its implementation has obvious limitations. Still, we can roughly feel that Node.js official support for TypeScript aims to be "lightweight", not to fully replace the TypeScript toolchain.

This design is actually reasonable. As a JavaScript runtime, Node.js's primary task is to execute JavaScript code efficiently. For simple type annotations and basic syntax, the current "strip mode" is already enough, and full TypeScript syntax support will arrive in the future. For projects that need complete type checking and complex TypeScript features, professional toolchains will do better.

Speaking of the TypeScript toolchain, the official compiler has also made major moves recently. One thing worth watching is Microsoft's recent launch of the [TypeScript-Go project](https://github.com/microsoft/typescript-go). It is called "TypeScript 7", which means it will become TS's official compiler after two major versions.

On the road where various languages try to move from non-self-hosting to self-hosting, TypeScript has taken the opposite step. But this is not without reason. Because frontend developers were familiar with it, early frontend toolchains were basically based on Node.js. However, JavaScript, as an interpreted language, is naturally less efficient than compiled languages. In recent years, a large number of tools like "Rust for JavaScript" and "Go for JavaScript" have emerged.

As always, we are witnessing the biggest characteristics of the frontend world: **dispersion**, **fragmentation**, and **chaos**. Or, to put it another way: **openness**, **inclusiveness**, and **diversity**.
