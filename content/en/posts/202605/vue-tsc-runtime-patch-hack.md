---
title: "Reading Source Code | An Inelegant Implementation: vue-tsc and Volar.js"
date: "2026-05-30"
description: "vue-tsc did not rewrite the TypeScript compiler. The truly outrageous part is that before Node loads tsc.js, it temporarily patches the source string of the official TypeScript CLI."
tags: ["Vue", "TypeScript", "vue-tsc", "Volar", "Frontend Tooling"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

## Introduction

As everyone knows, type checking in Vue projects relies on `vue-tsc`: it is a tsc implementation that can check `.vue` files, infer component types from Vue SFCs, report type errors, and locate those type errors back in the SFC source code.

In other words, the most hacky part is not the fact that `.vue` files generate virtual TS code. It is that **vue-tsc directly rewrites the runtime code of tsc.js in order to make the official tsc accept those virtual files**.

This article dissects that most interesting part.

## vue-tsc's Entry Point

The CLI entry of `vue-tsc` is very thin. It simply wraps Volar.js. Volar was originally built for the Vue language toolchain, and was later separated from Vue Language Tools so it could be used more generally.

```json
{
  "bin": {
    "vue-tsc": "./bin/vue-tsc.js"
  }
}
```

`bin/vue-tsc.js` basically has only one line:

```js
require("../index.js").run();
```

The real entry is in `packages/tsc/index.ts`. The core logic is not complicated either:

```ts
import { runTsc } from '@volar/typescript/lib/quickstart/runTsc';
import * as core from '@vue/language-core';

export function run(tscPath = require.resolve('typescript/lib/tsc')) {
  runTsc(
    tscPath,
    ['.vue'],
    (ts, options) => {
      const vueLanguagePlugin = core.createVueLanguagePlugin(...);
      return { languagePlugins: [vueLanguagePlugin] };
    },
  );
}
```

There are three key pieces of information here:

1. By default, it runs the official `typescript/lib/tsc`.
2. The `.vue` extension is passed to Volar.
3. Vue parsing and code generation capabilities come from `@vue/language-core`.

So the CLI layer of `vue-tsc` is not a compiler. It is more like a launcher: it starts the official `tsc`, then stuffs the Vue language plugin into Volar's TypeScript bridge.

The question is: why would the official `tsc` accept `.vue` files?

The answer is: modify it first.

### Step 1: Hijack fs.readFileSync

There is a very important function in `@volar/typescript`: `runTsc`.

It does something that already sounds dangerous: temporarily replacing Node's `fs.readFileSync`.

The rough logic is:

```js
const readFileSync = fs.readFileSync;

fs.readFileSync = (...args) => {
  if (args[0] === tscPath) {
    const tsc = readFileSync(...args);
    return transformTscContent(tsc, ...);
  }
  return readFileSync(...args);
};

try {
  return require(tscPath);
}
finally {
  fs.readFileSync = readFileSync;
  delete require.cache[tscPath];
}
```

When Node executes `require('typescript/lib/tsc')`, it needs to read `tsc.js` from disk underneath.

Normally:

```txt
tsc.js on disk -> Node reads it -> Node compiles and executes it
```

With `vue-tsc`, this chain becomes:

```txt
tsc.js on disk -> Volar intercepts the read -> string replacement patch -> Node compiles and executes the modified tsc.js
```

This is very hacky.

It is not monkey-patching some exported API. It modifies the source string before the module is loaded. By the time Node actually executes this module, what it sees is no longer the original TypeScript CLI.

After loading finishes, Volar restores `fs.readFileSync` and clears `require.cache` along the way.

This operation has a certain beauty of "changing tsc's brain before it wakes up".

### Step 2: Stuff .vue into TypeScript's Extension Lists

Why must `tsc.js` be patched?

Because before TypeScript CLI builds a program, it filters input files according to its internal extension lists.

Native TypeScript recognizes:

```txt
.ts
.tsx
.js
.jsx
.json
...
```

It does not recognize:

```txt
.vue
```

If `.vue` files are filtered out at this stage, no later wrapping of `CompilerHost` will help, because TypeScript will never include them in the program at all.

So Volar performs string replacement on several internal lists in `tsc.js`, for example:

```js
supportedTSExtensions
supportedJSExtensions
allSupportedExtensions
```

The goal is to insert `.vue` into them.

This step solves the problem of "making tsc willing to treat `.vue` as a candidate input".

But that is still not enough.

Even if TypeScript starts accepting `.vue` files, it still does not know how to parse `.vue` content. If SFC source code is handed directly to TypeScript, the result will of course be a pile of syntax errors.

So a third step is needed, and it is the most important one: replacing `createProgram`.

### Step 3: Replace createProgram with a Proxy Function

Inside TypeScript CLI, `createProgram(...)` is ultimately called to build the program.

When Volar patches `tsc.js`, it renames the original function and inserts a new proxy.

The original code roughly looks like this:

```js
function createProgram(...) {
  // TypeScript original implementation
}
```

After patching, it is equivalent to:

```js
var createProgram = require('.../proxyCreateProgram').proxyCreateProgram(
  typescriptObject,
  _createProgram,
  getLanguagePlugins,
);

function _createProgram(...) {
  // TypeScript original implementation
}
```

That is:

- The original `createProgram` is renamed to `_createProgram`.
- The new `createProgram` is a proxy function provided by Volar.
- All later internal `createProgram(...)` calls inside `tsc` enter Volar first.

This cut is very important.

As long as it can intercept `createProgram`, it can obtain the `CompilerHost` used by TypeScript when building the program. `CompilerHost` is exactly the entry point through which TypeScript reads files, resolves modules, and creates `SourceFile`s.

### Step 4: Wrap CompilerHost

After `proxyCreateProgram` receives the call, it copies and wraps `options.host`.

Simplified, it looks roughly like this:

```js
function proxiedCreateProgram(options) {
  const originalHost = options.host;

  options.host = {
    ...originalHost,

    getSourceFile(fileName, ...args) {
      const originalSourceFile = originalHost.getSourceFile(fileName, ...args);

      if (fileName is a Vue file and has service script) {
        return ts.createSourceFile(
          fileName,
          generatedVirtualTsText,
          ...,
          serviceScript.scriptKind,
        );
      }

      return originalSourceFile;
    },

    resolveModuleNames(...) {
      // Support import './Comp.vue'
    },
  };

  return originalCreateProgram(options);
}
```

The real implementation is of course more general. It is not hardcoded for Vue, but based on Volar language plugins.

But the essence is:

> TypeScript thinks it is reading `Comp.vue`, but in reality the host returns a virtual TS/TSX `SourceFile` generated from the Vue SFC.

There is a very subtle point here: the filename can still be `Comp.vue`, but the file content has already become generated code that TypeScript can understand.

To TypeScript, it is simply checking a normal `SourceFile`.

To the user, errors still appear in the `.vue` file.

All the magic in the middle is handled by Volar's language runtime and mapping system.

## Why This Is a Hack

It is hacky on several levels.

First, it is not an official TypeScript plugin API.

Ordinary TypeScript plugins mainly serve tsserver / language service. They cannot modify the CLI's program construction process like this. What `vue-tsc` needs is full CLI type checking, so it must enter TypeScript internals.

Second, it depends on the mutability of JavaScript TypeScript.

Only because `typescript/lib/tsc` is a JS file loaded by Node can Volar intercept source loading through `fs.readFileSync`, then patch internal functions through string replacement.

Third, it depends on TypeScript internal implementation details.

For example, what functions are called, what extension lists are called, and what shape `createProgram` has are not stable public APIs. If TypeScript internals change, the patch may fail.

Fourth, it is not just runtime monkey patching, but pre-load source patching.

Many libraries patch a method on some object, but Volar goes one step further: before Node compiles and executes the module, it directly replaces the module source.

This is certainly fragile, but also effective.

## Conclusion

The most hacky part of `vue-tsc` is not Vue SFC code generation, but how it integrates with TypeScript CLI.

Its core chain is:

```txt
temporarily replace fs.readFileSync
  -> intercept typescript/lib/tsc loading
  -> patch tsc.js source string
  -> inject .vue extension
  -> replace createProgram
  -> wrap CompilerHost
  -> return virtual TS/TSX SourceFile for .vue
  -> decorate diagnostics and map errors back to .vue
```

This is not an official plugin mechanism, but a very bold runtime source rewrite.

From an engineering-aesthetics perspective, it is indeed not "clean" enough.

But from the reality of toolchains, it is also very beautiful: when TypeScript does not provide enough extension points, Volar forcefully pried open a path inside the official `tsc`, allowing `.vue` files to enter the full TypeScript type-checking process.

## Exploration in the tsgo Era

This also explains why `tsgo` makes the problem troublesome.

Current `vue-tsc` depends on several characteristics of JavaScript TypeScript:

- `typescript/lib/tsc` is loaded through Node `require(...)`.
- Source loading can be intercepted through `fs.readFileSync`.
- Internal functions can be modified through string replacement.
- JS objects and hosts can be wrapped at runtime.

If it switches to native `tsgo`, these patch surfaces basically disappear.

You cannot expect to use `fs.readFileSync` to intercept internal functions of a native binary, nor can you use string replacement to turn its `createProgram` into a proxy version.

So if Vue SFC support is to be added to `tsgo` in the future, there are probably only a few paths:

1. `tsgo` provides an official plugin / host API, allowing virtual files and mappings to be injected.
2. Vue/Volar creates a preprocessing layer that first generates TS from `.vue`, then passes it to `tsgo`.
3. `vue-tsc` continues to run JavaScript TypeScript, while `tsgo` temporarily only handles native TS inputs.

From this perspective, `vue-tsc` cannot be migrated simply by "changing the TypeScript backend". Its current core capability is precisely built on the fact that JavaScript `tsc` can be rewritten at runtime.
