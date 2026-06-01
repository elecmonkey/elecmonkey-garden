---
title: 'The Unavoidable JavaScript Components in Native JavaScript Toolchains'
date: '2025-11-12'
description: 'Tools that process JavaScript code do not need to be JavaScript programs, but the people processing JavaScript code must be JavaScript programmers.'
tags: ['Rust', 'JavaScript', 'Frontend Tooling', 'Rolldown', 'swc', 'Build Tools', 'React Compiler']
author: 'Elecmonkey'
---

> This article was translated by AI and has not been manually reviewed.

## JavaScript Processing JavaScript

Early frontend build tools were almost all written in JavaScript:
Babel handled syntax downleveling, Webpack handled module bundling, and tools such as ESLint, Terser, and UglifyJS handled static analysis and minification.

This "using JavaScript to build JavaScript" model had its inevitability. To process JavaScript, of course JavaScript programmers understand JavaScript best.

But it also brought an inherent contradiction: performance. Node.js's single-threaded model and the characteristics of an interpreted language make JS feel inadequate for CPU-intensive tasks such as AST parsing and code generation. In fact, we all know that, in principle, **tools that process JS code do not need to be JS**. Any language that can process text can build these tools. It is basically just parsing, turning it into an AST, modifying the AST for a while, and then converting it back.

To solve performance problems, a new wave of toolchains arrived.

## Go and Rust Toolchains

Since esbuild (Go) demonstrated astonishing build speed, the Rust community has also produced a series of "native compiler style" tools such as swc, oxc, and rolldown.

These tools share the following characteristics:

- They use compiled languages such as Go/Rust to achieve high performance.
- They are compatible with the ecosystem, often imitating Babel and Rollup plugin interfaces.

In theory, these tools can completely replace the original JS implementations. But in practice, there is always one problem they cannot avoid: the "JS components" in the build pipeline.

## The Unavoidable "JS Components"

### Vue.js

Take a Vue.js project built with Vite as an example:

Using Rolldown-Vite ([Rolldown-Vite Announces Feature Parity with Vite: Evan You and His Next-Generation Frontend Toolchain
](https://www.elecmonkey.com/blog/rolldown-vite-migration), [Is Rolldown-vite Worth Trying in Production Yet?](https://www.elecmonkey.com/blog/rolldown-vite-production-ready)) allows the underlying bundler to be changed from [Rollup](https://rollupjs.org/) (JS) to [Rolldown](https://rolldown.rs/) (Rust). But you still have to call vite-plugin-vue, right? vite-plugin-vue is written in JS, and the vue-compiler-sfc it uses to compile Vue single-file components is also written in JS. Open Vue's source code and take a look: vue-compiler-sfc even uses Babel internally.

In other words, even if the underlying layer is replaced with Rust, the build chain still returns to the JS world many times. The performance cost of passing an AST back and forth between the Rust world and the JavaScript world is unimaginable. This causes the "extreme speed" of Rust toolchains to be diluted in real engineering by large numbers of JS plugin calls.

### React

React has never had many build steps. JSX transformation is handled by the toolchain. As a "syntax" that is easy to transform and has little compile-time logic, JSX transpilation is easily supported natively by all kinds of tools. Therefore, tools such as esbuild, swc, and rolldown support React very naturally: they only need a built-in JSX transformer. For a while, I felt that React was the biggest beneficiary of native toolchains. With Rolldown-Vite, a React project really can go from source code to production assets entirely through native tools.

On October 7, 2025, React Compiler officially announced its first stable release. React began catching up on the performance gap with Vue caused by its previous lack of "compile-time optimization". React Compiler currently still appears as a Babel plugin. No matter how React Compiler is embedded into the build workflow, for example by embedding a QuickJS instance into swc to avoid installing Babel separately, the logic of this "Compiler" is written in JS. Therefore, there is no way to avoid the time required to run that piece of JS.

### Solid.js & Svelte

There is no need to say much about frameworks with heavy compile-time logic, especially Svelte, which at one point aimed for zero framework runtime. A large amount of logic is completed by the compiler at compile time, and these compilers are all written in JS without exception. This portion of time is difficult to compress during the build process. No matter what language the build tool that calls them is written in, it has to wait honestly.

## Why It Cannot Be Avoided

In the Issue discussion where React Compiler sought cooperation with oxc, Evan You mentioned:

> I strongly suggest re-evaluating the potential performance tax it would incur on the React ecosystem —— Evan You [oxc#10048](https://github.com/oxc-project/oxc/issues/10048)

But in fact, Vue.js also has a large amount of JS compile-time logic, likely no less than React and only more. I remember someone once asked Evan You about his view of the Vue compiler in an interview show. Evan You said that if it migrated to Rust, community participation and the ability for the community to participate would decline significantly. For an open-source project that grew out of the community, taking root in and integrating into the community is of utmost importance. At least for now, the performance burden brought by vue-compiler is far from unacceptable enough to justify abandoning the JS community. In the foreseeable future, vue-compiler and React Compiler will probably both continue to exist in JS form.

There used to be a joke that JavaScript is the only programming language you can use before learning it. You can use it to write webpages, scripts, logic, and complex projects, and only later gradually discover prototypes, prototype chains, closures, Promise and asynchronous programming, iterators and generators, CommonJS and ES Module, etc. The JavaScript world, or the Web world, is far from a perfect world. On the contrary, it is full of historical baggage and compromise. We use a technology born for documents, the Web and browsers, to build large applications. We use existing tools to continuously accumulate the ability to build larger applications and continuously improve the development experience. The JS community created Webpack with JavaScript, Babel with JavaScript, and TypeScript with JavaScript. The fact that TS and JS have long been among the most widely adopted languages in software engineering, with Python's high usage mainly coming from data science and AI, also illustrates this point: the JS community has an astonishingly low barrier to entry, so we have an astonishing community scale and astonishing creativity.

In his talk [Lynx: Native for More](https://www.bilibili.com/video/BV14ieUzQEzW) at React Summit 2025, programmer Xuan Huang said something that left a deep impression on me:

> What makes Web amazing is not just the technology, this about this community that is so wildly creative. —— Xuan Huang

Returning to the question we raised at the beginning: in principle, **tools that process JavaScript code do not need to be JavaScript programs**. But that sentence ignores the most important thing: **the people processing JavaScript code must be JavaScript programmers**. If a tool wants to take root in the JavaScript community, it must allow JavaScript programmers to easily understand, use, and extend it. So stop thinking about how to eliminate JavaScript components from the build process of JavaScript projects. Impossible. Previously, many teams building native toolchains had the ambition to replace everything with native implementations. But our community is precisely this kind of community: full of creativity and diversity, the legendary JavaScript community with one new wheel a day and one new framework every three days.

So are native toolchains still the future?

The latest efforts from the oxc team may offer us some thoughts on the future direction. At ViteConf 2025,
Jim Dummett gave a talk, [JavaScript at the speed of Rust: Oxc](https://www.youtube.com/watch?v=ofQV3xiBgT8). Our only direction is: we must still have better ways. Tear down the wall between native toolchains and JavaScript.
