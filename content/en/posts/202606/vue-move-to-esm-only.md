---
title: "Vue.js Is Moving to ESM-only"
date: "2026-06-23"
description: "A year and a half after antfu published Move on to ESM only, Vue Core is moving to ESM-only"
tags: ["Vue", "ESM", "Frontend Tooling", "AI Agent"]
author: "Elecmonkey"
---

## Vue #15000

[vuejs/core#15000](https://github.com/vuejs/core/pull/15000) has a very neat number. Vue Core Team Member [posva](https://github.com/posva) opened a PR named refactor: ESM-only packages. Vue.js is about to fully move to ESM-only.

> Interestingly, his personal homepage domain is [https://esm.dev/](https://esm.dev/). He really does love ESM.

The built JS bundles listed in the PR drop from 16.45 MB to 7.85 MB in total, reducing 8.6 MB, or 52%. `compiler-vapor` drops by 83%, `shared` by 68%, `compiler-core` by 64%, `runtime-core` by 63%, and `reactivity` by 58%. The most immediate effect is that the amount of data downloaded when running `pnpm i` becomes significantly smaller.

> The Vue 2 compatibility layer, including `@vue/compat`, the `__COMPAT__` flag, and the compat-related source directories, is also removed.

## Move on to ESM only

On February 5, 2025, Anthony Fu published a blog post titled [Move on to ESM-only](https://antfu.me/posts/move-on-to-esm-only). Since then, this post has been widely cited to persuade, explain, and guide the direction of the JavaScript ecosystem.

There was another important background at the time: Node.js 24+ already supported `require(esm)` natively. Soon after, in March 2025, Node.js officially backported this capability to v20 LTS (Node.js v20.19.0+) and enabled it by default.

However, according to the data cited in Anthony's own blog post, by the end of 2024, more than 70% of packages were still CJS-only, including Flux. A year and a half later, among high-impact and active npm packages, CJS-only is still as high as 60%. The inertia of the historical ecosystem remains huge.

> Faux ESM refers to packages that provide an ESM entry, but whose actual implementation is still CommonJS. The ESM file is usually just a thin wrapper that forwards imports to the internal CJS implementation, rather than real native ESM code.
> Faux ESM does not actually have the advantages of ESM, such as improved tree-shaking.

Node.js support for `require(esm)` provides a transition slope for the ecosystem migration. It reduces the breakage ESM-only can cause to old projects, allowing package maintainers to finally stop maintaining a CJS build forever just for `require()` compatibility.

At the same time, 95% of newly published packages now support the ESM format, and small packages in the Rstack ecosystem are also gradually moving to ESM-only publishing. The new world is basically already "ESM-only". The real resistance comes from the existing world. After all, Node.js v20 is already a 2023 release.

## What ESM-only Needs to Remove

Most large projects that insist on publishing "dual packages" inevitably end up writing many branches and special cases for interop edge cases across different formats. Vue is no exception. Moving to ESM-only cannot simply end with deleting CJS from the build configuration. Years of accumulated "format differences" have already seeped into build logic, test logic, tool consumption paths, and implicit assumptions. From this perspective, ESM-only gives a project a chance to revisit those implicit assumptions, and then delete most of the branches that should no longer exist.

## Impact on Users

For Vue applications written with modern tools such as Vite / Rsbuild, the user-side impact is probably not strong. We are already developing in the ESM world, and cleaner framework packages usually just mean the tooling has fewer compatibility guesses to make.

But code that directly uses `require('vue')` or `require('@vue/compiler-sfc')` needs extra attention. `require(esm)` being available by default does not mean all old code is 100% compatible. Async boundaries, access patterns for default and named exports, module loading strategies in test frameworks and various third-party tools, and tsconfig's module/moduleResolution settings can all become possible sources of problems.

## AI Agent

Old ecosystems are hard to migrate. Anyone with real software engineering experience will not doubt this. Nobody pays me extra for upgrading a framework version, and the upgrade might even introduce problems. Why should I go looking for trouble for no reason?

Migration is work that does not require much creativity, but does require patience, context, and a lot of time. This is exactly the kind of work AI Agents are good at taking over. Today, the community's psychological barrier to migrating to modern tech stacks has clearly dropped. In the past, when an open-source project went through a major breaking change, a large number of downstream users would permanently stay on a certain major version. Now, perhaps many more users are willing to open an Agent session and try it first. Maybe nothing serious will happen. Worst case, just throw away all the results.

This creates new expectations for open-source projects. Breaking changes are not scary, as long as the project can diligently and honestly organize a list of breaking changes and risk points, provide migration or solution paths one by one, and turn them into Skills.

One of Rstack's major visions is to become an AI-native toolchain. As a young set of tools, [Rspack](https://rspack.rs/), [Rsbuild](https://rsbuild.rs/), and [Rspress](https://rspress.rs/), all of which have gone through major-version releases, have each provided Skills for major-version migration. Beyond continuing to eat into webpack's existing market, this gives us more room to imagine Rstack's future.

- [rspack-v2-upgrade](https://github.com/rstackjs/agent-skills#rspack-v2-upgrade)
- [rsbuild-v2-upgrade](https://github.com/rstackjs/agent-skills#rsbuild-v2-upgrade)
- [rspress-v2-upgrade](https://github.com/rstackjs/agent-skills#rspress-v2-upgrade)
