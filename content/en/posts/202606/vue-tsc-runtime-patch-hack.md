---
title: "vue-tsc and Volar.js Enter the tsgo Era with an Ungraceful Implementation"
date: "2026-06-21"
description: "Before Node loads tsc.js, vue-tsc temporarily patches the source string of the official TypeScript CLI. What should Vue do in the TypeScript Go era?"
tags: ["Vue", "TypeScript", "Frontend Tooling"]
author: "Elecmonkey"
---

Language services have always been one of the less-discussed parts of toolchains. Vue 2 has 210k stars, Vue 3 has accumulated 54k stars, but vuejs/language-tools has only 6.7k stars. That is already a relatively popular language service. Svelte has 86.7k stars, but sveltejs/language-tools has only 1.4k stars. Astro's old withastro/language-tools repository once had only 337 stars, and was later archived by the official team and moved into the main repository.

Given this huge difference in attention, I actually think it makes sense for language services to live in the main repository. First, for frameworks that invent their own DSLs, language services are critical to the development experience. Second, keeping them in the main repository makes it easier to attract community contributors to discover, fix, and improve this crucial part. After all, compared with a repository with a few hundred stars, people are much more willing to open PRs to one with tens of thousands of stars.

## vue-tsc

Vue projects rely on `vue-tsc` for type checking. It is a tsc implementation that can check `.vue` files, infer component types from Vue SFCs, report type errors, and map those type errors back to the original SFC source.

If you inspect the installed dependencies, the CLI entry of `vue-tsc` is very thin. It is basically a wrapper around Volar.js. Volar was originally built for Vue's language tooling, and was later split out of Vue Language Tools so it could serve other similar embedded languages. The Vue-specific language-service part is fairly unsurprising: it constructs virtual files and maintains mappings in the usual way. The key question is how Volar.js implements tsc-like behavior.

Following the chain leads to `./packages/typescript/lib/quickstart/runTsc.ts` in the [Volar.js repository](https://github.com/volarjs/volar.js), where something **quite shocking** appears.

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

In simple terms, when Node executes `require('typescript/lib/tsc')`, it needs to read `tsc.js` from disk. Volar.js directly replaces `fs.readFileSync` with a custom function and inserts logic that rewrites the source string. By the time Node actually executes the module, what it sees is no longer the original TypeScript CLI.

While tsc is still asleep, Volar swaps out its brain first. Then tsc suddenly understands `.vue`.

## Hack?

The way `vue-tsc` integrates with the TypeScript CLI is, to put it mildly, very bold. No matter how you look at it, this implementation feels upside down. In principle, we should depend on public APIs; even depending on internal APIs is already risky. But depending on the exact source-code string layout is especially startling. From the practical perspective of tooling, however, when TypeScript does not provide sufficient extension points, Volar forcibly pried open a path inside the official `tsc`, allowing `.vue` files to enter the full TypeScript type-checking flow. After the initial shock, it is hard to criticize this severe violation of so-called best practices. If anything, it is a little admirable.

This kind of hack is not rare. [Rslint](https://rslint.rs) clones TypeScript as a submodule and shims out private APIs from the internal AST. [utoopack](https://utoo.land/) forks the Next.js repository and exposes related APIs in order to reuse existing Turbopack capabilities. Yes, Turbopack still does not have its own independent repository; it is currently coupled with Next.js.

## Exploration in the tsgo Era

This explains why `tsgo` makes the problem harder. The current `vue-tsc` relies on shape characteristics of the JavaScript version of TypeScript. Once it becomes native `tsgo`, those patch surfaces basically disappear. You cannot expect to intercept internal functions of a native binary with `fs.readFileSync`, nor can you string-replace its `createProgram` into a proxy version.

The community is still in an early exploratory phase. From what I have seen, the libraries worth referencing are [vue-tsgo](https://github.com/KazariEX/vue-tsgo) and [golar](https://github.com/auvred/golar).

### vue-tsgo

[vue-tsgo](https://github.com/KazariEX/vue-tsgo) is authored by [KazariEX](https://github.com/KazariEX), who is a member of the Vue Core Team and a core contributor to Vue Language Tools. vue-tsgo works by creating a virtual workspace: it generates a complete project that "tsgo understands", where everything is standard `.ts`. It transforms `.vue` files into TS code that can be type checked and fully expresses type information, then lets tsgo check that virtual workspace.

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
        <TR><TD><FONT POINT-SIZE="10" COLOR="#64748b">source SFC</FONT></TD></TR>
      </TABLE>
    >,
    fillcolor="#eef6ff"
  ];

  virtual [
    label=<
      <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8">
        <TR><TD><FONT POINT-SIZE="15"><B>app.vue.ts</B></FONT></TD></TR>
        <TR><TD><FONT POINT-SIZE="10" COLOR="#64748b">virtual file / real TS / cache dir</FONT></TD></TR>
      </TABLE>
    >,
    fillcolor="#f0f9ff"
  ];

  workspace [
    label=<
      <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8">
        <TR><TD><FONT POINT-SIZE="15"><B>Rebuild Virtual Workspace</B></FONT></TD></TR>
        <TR><TD ALIGN="LEFT">all .vue -&gt; .vue.ts</TD></TR>
        <TR><TD ALIGN="LEFT">rewrite tsconfig(paths/types/references)</TD></TR>
        <TR><TD ALIGN="LEFT">symlink node_modules</TD></TR>
      </TABLE>
    >,
    fillcolor="#f8fafc"
  ];

  tsgo [
    label=<
      <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8">
        <TR><TD><FONT POINT-SIZE="15"><B>tsgo --lsp -stdio</B></FONT></TD></TR>
        <TR><TD ALIGN="LEFT">fetch diagnostics via JSON-RPC</TD></TR>
        <TR><TD ALIGN="LEFT">map source positions back to .vue</TD></TR>
        <TR><TD ALIGN="LEFT">print diagnostics at original locations</TD></TR>
      </TABLE>
    >,
    fillcolor="#fff7ed"
  ];

  exit [
    label=<
      <TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8">
        <TR><TD><FONT POINT-SIZE="15"><B>Exit Code</B></FONT></TD></TR>
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

The principle is extremely plain. Obviously, this approach could also be used in today's JavaScript-powered TypeScript era. But the Vue team would rather choose a highly hacky implementation that depends on TypeScript's internal source layout than choose this approach, which shows the trade-offs it brings. vue-tsgo choosing this path has a sense of being forced into it.

### golar

I have been following Golar for a while, though it does not seem to have attracted much community discussion. A few days ago, Evan You mentioned the project on X, which gave it a wave of stars. Remember the earlier mention of [Rslint](https://rslint.rs), which clones TypeScript as a submodule and shims out private APIs from the internal AST? Golar uses a similar technique, and in some ways an even stranger one: it directly performs **string replacement** on TypeScript's Go source code.

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

By forcibly exposing TypeScript-Go's APIs, Golar is able to fully implement features such as type checking and declaration-file generation.

Projects that perform invasive surgery on tsgo itself are not limited to Rslint and Golar. Obviously, if every ecosystem maintains its own copy of tsgo, that is not good for the ecosystem as a whole. Each tool "internally integrating" tsgo also means tools in the ecosystem will have a hard time cooperating with each other. For example, if Golar became Vue's official solution, you would not be able to use Rslint to type check Vue projects, because both Rslint and Golar are compiled binaries.

At this point, the official TypeScript team should probably step in and participate in the discussion.

### Microsoft's Position

See [https://github.com/microsoft/typescript-go/issues/2824](https://github.com/microsoft/typescript-go/issues/2824). The core points are:

1. The official team does not want to dynamically load third-party code into TS Server in the Go implementation. They do not think TypeScript should become the universal plugin host for all kinds of non-TS language and framework extensions. Compared with plugging external language support into the TS compiler, embedding the TS API inside external tool CLIs makes more sense. TypeScript is willing to build higher-level APIs to help the ecosystem create tsc-like CLIs such as vue-tsc and svelte-check. In other words, supporting "building a tsc-like tool that understands `.vue` and `.astro`" is within scope.

2. The official team prefers clients to push static information to tsgo in batches, such as virtual file overlays and module resolution rules, and then let tsgo build the Program at high speed. They do not want tsgo to frequently call back into JavaScript across the IPC boundary during program construction, because the performance cost is much higher than same-process host overrides in the JavaScript version.

3. They are cautious about "injecting types". Andrew initially objected to directions where plugins directly inject types into the TS Program, and later clarified the position: they do not want clients to directly insert themselves into type resolution or construct types through a JS object API. But providing TypeScript syntax through virtual files and letting those virtual files participate in the Program is exactly the direction being discussed.

TypeScript 7.0 has already reached RC, but the blog post says:

> even though 7.0 RC is close to production-ready, we won’t have a stable programmatic API available until at least several months from now with TypeScript 7.1.

So the discussion around ecosystem APIs is still ongoing. We will probably have to watch the React and Solid.js ecosystems enter the tsgo era first. Giving up on building your own DSL does come with rewards.
