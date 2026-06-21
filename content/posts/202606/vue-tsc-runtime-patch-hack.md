---
title: "vue-tsc 与 Volar.js，带着不优雅的实现进入 tsgo 时代"
date: "2026-06-21"
description: "vue-tsc 在 Node 加载 tsc.js 之前，把官方 TypeScript CLI 的源码字符串临时 patch 掉，那 TypeScript Go 时代 Vue 准备怎么办呢？"
tags: ["Vue", "TypeScript", "前端工具链"]
author: "Elecmonkey"
---

语言服务一直是工具链里关注度比较低的一块儿内容。Vue 2 有 210k stars，Vue 3 也积累了 54k stars，但是 vuejs/language-tools 只有 6.7k stars. 这已经是星比较多的语言服务了，Svelte 有 86.7k star 但是 sveltejs/language-tools 只有 1.4k star. Astro 曾经的 withastro/language-tools 只有 337 stars，然后被官方 archive 了挪到了主仓里去。

基于这个关注度差异巨大的现实，我是觉得其实语言服务放到主仓是很合理的。一来对于这些自己发明 DSL 的框架，语言服务对于开发体验至关重要。二来放进主仓更容易吸引一些社区贡献者去发现、解决这个至关重要的部分的问题或者做出改进 —— 毕竟比起几百星的仓库，大家还是更愿意给几十k stars 的仓库提 PR。

## vue-tsc

Vue 项目的类型检查依靠 `vue-tsc`：它是一个可以检查 `.vue` 文件的 tsc 实现，可以从 Vue SFC 推导组件类型、报类型错误，并把类型错误定位回 SFC 源码中。

看看拉下来的依赖，`vue-tsc` 的 CLI 入口非常薄，简单的包了一层 Volar.js. Volar 最早就是为了 Vue 语言工具链打造出的，后来从 Vue Language Tools 里拆分出来，让它可以服务其它类似的嵌入式语言。关于 Vue 具体的语言服务部分平平无奇（指没有什么想象不到的地方），常规的构造虚拟文件做映射这样。关键是 Volar.js 是怎么实现的仿 tsc 行为。

顺着链路追一追，追到 [Volar.js 的仓库](https://github.com/volarjs/volar.js) 里的 `./packages/typescript/lib/quickstart/runTsc.ts`，**震撼人心的事情**出现了。

```ts
(fs as any).readFileSync = (...args: any[]) => {
		if (args[0] === tscPath) {
			let tsc = (readFileSync as any)(...args) as string;
			try {
				return transformTscContent(
					tsc,
					proxyApiPath,
					extraSupportedExtensions,
					extraExtensionsToRemove,
					__filename,
					typescriptObject,
				);
			}
			catch {
				// Support the tsc shim used in Typescript v5.7 and up
				const requireRegex = /module\.exports\s*=\s*require\((?:"|')(?<path>\.\/\w+\.js)(?:"|')\)/;
				const requirePath = requireRegex.exec(tsc)?.groups?.path;
				if (requirePath) {
					tsc = readFileSync(path.join(path.dirname(tscPath), requirePath), 'utf8');
					return transformTscContent(
						tsc,
						proxyApiPath,
						extraSupportedExtensions,
						extraExtensionsToRemove,
						__filename,
						typescriptObject,
					);
				}
				else {
					throw new Error('Failed to locate tsc module path from shim');
				}
			}
		}
		return (readFileSync as any)(...args);
	};
```

简单的说，Node 执行 `require('typescript/lib/tsc')` 的时候，底层需要从磁盘读取 `tsc.js`。Volar.js 直接把读取文件的 `fs.readFileSync` 改成了自定义的函数，在其中插入了修改源码字符串的逻辑。等 Node 真正执行这个模块时，它看到的已经不是原始 TypeScript CLI 了。

趁 tsc 还没醒，先给它换个脑子了属于是。然后 tsc 就认识 `.vue` 了。

## hack？

`vue-tsc` 接入 TypeScript CLI 的方式不得不说非常大胆。这种实现方式怎么看都是倒反天罡的。按理来说我们应当依赖的是公开 API，依赖内部 API 都是一件有风险的事情。但是这个依赖源代码字符串布局，实在是让人看的有点震撼。但从工具链现实来说，在 TypeScript 没有提供足够扩展点的情况下，Volar 硬是在官方 `tsc` 里撬开了一条路，让 `.vue` 文件进入了完整的 TypeScript 类型检查流程。震撼之余我们似乎也没有办法对这种严重破坏所谓最佳实践的工具实现产生批评的感情，甚至还有一点佩服。

这种 hack 式的利用其实并不少见。[Rslint](https://rslint.rs) 将 TypeScript 作为 submodule 克隆到仓库里，把内部 AST 的非公开 API shim 出来；[utoopack](https://utoo.land/) 为了利用 Turbopack 现有能力，自己 fork 了一版 Next.js 的仓库并在其中暴露相关 API。（是的，Turbopack 没有自己独立的仓库，和 Next.js 目前还是一个耦合的状态）

## tsgo 时代的探索

这也解释了为什么 `tsgo` 会让这个问题变得麻烦。现有 `vue-tsc` 依赖的是 JavaScript 版 TypeScript 的形态特性，如果换成 native `tsgo`，这些 patch 面基本不存在。你不能指望用 `fs.readFileSync` 去拦截一个 native binary 的内部函数，也不能用字符串替换把它的 `createProgram` 改成代理版本。

目前社区也是处于前期探索的阶段。目前有参考价值的库据我观察有 [vue-tsgo](https://github.com/KazariEX/vue-tsgo) 和 [golar](https://github.com/auvred/golar).

### vue-tsgo

[vue-tsgo](https://github.com/KazariEX/vue-tsgo) 的作者是 [山吹色御守](https://github.com/KazariEX)，他本人是 Vue Core Team 的一员，也是 Vue Language Tools 的核心贡献者。vue-tsgo 采用虚拟工作区的方式工作，生成全套的 “tsgo认识的” 的项目，它们都是标准的 `.ts` —— 把 `.vue` 转换成能被类型检查、充分体现类型信息的 TS 代码，然后由 tsgo 来检查这个虚拟工作区。

```viz
digraph VueTsgoFlow {
  graph [
    rankdir=TB,
    nodesep=0.65,
    ranksep=0.85,
    pad=0.35,
    bgcolor="transparent"
  ];

  node [
    shape=box,
    style="rounded,filled",
    color="#8aa0bf",
    fillcolor="#f8fbff",
    penwidth=1.4,
    fontname="Helvetica",
    fontsize=12,
    margin="0.10,0.08"
  ];

  edge [
    color="#6b7f9f",
    fontname="Helvetica",
    fontsize=11,
    arrowsize=0.75,
    penwidth=1.25
  ];

  app [
    label=<
      <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8">
        <TR><TD><FONT POINT-SIZE="15"><B>app.vue</B></FONT></TD></TR>
        <TR><TD><FONT POINT-SIZE="10" COLOR="#64748b">源 SFC</FONT></TD></TR>
      </TABLE>
    >,
    fillcolor="#eef6ff"
  ];

  virtual [
    label=<
      <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8">
        <TR><TD><FONT POINT-SIZE="15"><B>app.vue.ts</B></FONT></TD></TR>
        <TR><TD><FONT POINT-SIZE="10" COLOR="#64748b">虚拟文件 / 真 TS / 缓存目录</FONT></TD></TR>
      </TABLE>
    >,
    fillcolor="#f0f9ff"
  ];

  workspace [
    label=<
      <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8">
        <TR><TD><FONT POINT-SIZE="15"><B>重建虚拟工作区</B></FONT></TD></TR>
        <TR><TD ALIGN="LEFT">所有 .vue -&gt; .vue.ts</TD></TR>
        <TR><TD ALIGN="LEFT">重写 tsconfig(paths/types/references)</TD></TR>
        <TR><TD ALIGN="LEFT">符号链接 node_modules</TD></TR>
      </TABLE>
    >,
    fillcolor="#f8fafc"
  ];

  tsgo [
    label=<
      <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8">
        <TR><TD><FONT POINT-SIZE="15"><B>tsgo --lsp -stdio</B></FONT></TD></TR>
        <TR><TD ALIGN="LEFT">JSON-RPC 拉每个文件的诊断</TD></TR>
        <TR><TD ALIGN="LEFT">source map 反映射回 .vue 源位置</TD></TR>
        <TR><TD ALIGN="LEFT">按原始源码位置输出</TD></TR>
      </TABLE>
    >,
    fillcolor="#fff7ed"
  ];

  exit [
    label=<
      <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8">
        <TR><TD><FONT POINT-SIZE="15"><B>退出码</B></FONT></TD></TR>
        <TR><TD><FONT POINT-SIZE="13">0 / 1</FONT></TD></TR>
      </TABLE>
    >,
    fillcolor="#f0fdf4"
  ];

  { rank=same; app; virtual; workspace; }
  { rank=same; exit; tsgo; }

  app -> virtual [label="codegen", constraint=false];
  virtual -> workspace [label="generate()", constraint=false];
  workspace -> tsgo [label="check()"];
  exit -> tsgo [style=invis, weight=100];
  tsgo -> exit [constraint=false];
}
```

这个原理十分朴实无华，很显然，现在的 JavaScript-powered TypeScript 时代也能使用这种方式。但很显然，Vue 团队宁愿选择一种十分 hack、依赖 TypeScript 内部源码布局的实现方式也没有选择这一种，足见其带来的弊端，vue-tsgo 选择这一条路，有种「不得已而为之」之感。

### golar

Golar 我关注有一段时间了，社区似乎也没有什么讨论度。前几日，尤雨溪在 X 上提到了这个项目，也是让它涨了一波星。还记得前面提到 [Rslint](https://rslint.rs) 将 TypeScript 作为 submodule 克隆到仓库里，把内部 AST 的非公开 API shim 出来吗？Golar 使用了差不多的手法，甚至手法更离奇，直接对 TypeScript 的 Go 源码进行了**字符串替换**。

```ts
export async function uninternal(
	directories: string[],   // [typescript-go/cmd, typescript-go/internal]
	from: string,            // 'github.com/microsoft/typescript-go/internal'
	to: string,              // 'github.com/microsoft/typescript-go/pkg'
) {
	const entries = (
		await Promise.all(
			directories.map((dir) =>
				fs.readdir(dir, { recursive: true, withFileTypes: true }),
			),
		)
	).flat()

	const goFiles = entries
		.filter((e) => e.isFile() && e.name.endsWith('.go'))
		.map((e) => path.join(e.parentPath, e.name))

	await Promise.all(
		goFiles.map(async (p) => {
			const content = await fs.readFile(p, 'utf8')
			await fs.writeFile(p, content.replaceAll(from, to))
		}),
	)
}
```

通过强行暴露出 TypeScript-Go 的 API，Golar 得以完整的实现类型检查、声明文件生成等功能。

直接对 tsgo 本身伤筋动骨的项目远不止 Rslint 和 Golar。很显然，如果每家每户都维护一份自己的 tsgo，这对整个生态不是一件好事，各自 “内部集成” tsgo 也意味着生态中的工具之间很难相互配合。举个例子，假如 Golar 成为 Vue 的官方解决方案，你就无法用 Rslint 对 Vue 项目进行类型检查，因为 Rslint 和 Golar 都是编译好的二进制文件。

事情到这里，TypeScript 官方也应该来下场参与讨论了。

### 微软的态度

参考 [https://github.com/microsoft/typescript-go/issues/2824](https://github.com/microsoft/typescript-go/issues/2824)，核心观点：

1. 官方不想在 Go 实现中动态加载第三方代码进 TS Server。官方不认为 TypeScript 应该成为各种非 TS 语言/框架扩展的总插件宿主 —— 相比把外部语言支持 plug into TS compiler，更合理的是在外部工具 CLI 中 embed TS API。TS 愿意做更高层 API，帮助生态构建 vue-tsc / svelte-check 这类 tsc-like CLI。也就是说，支持“构建一个能理解 .vue、.astro 的 tsc-like 工具”是目标内的。

2. 官方倾向于“客户端批量推送静态信息”给 tsgo，例如 virtual file overlays、module resolution rules 等，然后让 tsgo 高速构建 Program。他们不希望 tsgo 在构建过程中频繁跨 IPC 回调 JS，因为性能成本比 JS 版同进程 host override 高很多。

3. 对“注入类型”的态度比较谨慎。Andrew 一开始反对“插件直接往 TS Program 里注入类型”这类方向，后来澄清：不希望 client 直接插入 type resolution 或用 JS object API 造类型；但通过虚拟文件提供 TypeScript syntax，让这些虚拟文件参与 Program，是他们正在讨论的方向。

TypeScript 7.0 目前已经 RC，但是在博客中提到：

> even though 7.0 RC is close to production-ready, we won’t have a stable programmatic API available until at least several months from now with TypeScript 7.1.

所以关于生态 API 的讨论仍在进行中，我们大约得看着 React 和 Solid.js 生态先行迈入 tsgo 时代 —— 放弃了构建自己的 DSL 是会有回报的。
