---
title: "The Myth of Unification: Starting from unplugin and Vitest Browser Mode"
date: "2026-05-29"
description: "Creating a unified compatibility layer sounds attractive, but if 90% of users choose the same concrete backend, the abstraction may be less meaningful than imagined."
tags: ["Frontend Tooling", "unplugin", "Vitest", "Vite", "Abstraction"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

## Introduction

There has always been a strong impulse in the frontend tooling ecosystem: create a unified compatibility layer, so the same plugin, the same API, and the same mental model can run on top of different underlying tools.

This is of course a very tempting goal. For library authors, writing once and supporting Vite, Webpack, Rollup, Rspack, and esbuild sounds wonderful. For users, not having to rewrite plugin configuration when migrating toolchains also seems to reduce switching costs.

But I increasingly suspect that some "unification layers" merely hide the real problems one layer deeper.

If an abstraction claims to support many backends, but in the end **90% of users choose the same concrete backend**, is that abstraction really unifying the ecosystem, or is it just wrapping an extra shell around the de facto ecosystem?

## unplugin: The Ideal of a Unified Plugin Interface

The goal of `unplugin` is clear: provide a unified way to write plugins, then adapt that to different bundlers and build tools.

Conceptually, this makes a lot of sense. The core logic of many plugins is not strongly tied to one specific bundler, for example:

- Doing include / exclude based on file paths
- Reading source code and applying string transformations
- Injecting virtual modules
- Running some side effects before or after builds
- Exposing similar developer experience across different frameworks

If every tool needs its own plugin implementation, the maintenance cost is obviously high. `unplugin` extracts this repeated work, and it looks like a typical good abstraction.

The problem is that bundler plugin systems are not merely different names for a few lifecycle hooks.

## The Parts That Cannot Be Unified

The truly hard-to-unify parts of different underlying tools are often not whether a hook exists, but the semantic differences behind those hooks:

- Is module resolution timing consistent?
- Are dev server and production build behaviors consistent?
- Does the transform phase have full context?
- Are virtual module caching and invalidation mechanisms consistent?
- How are HMR boundaries expressed?
- Is sourcemap handling consistent?
- How are SSR and browser environments distinguished?
- Are plugin ordering, priority, and concurrency models consistent?

The deeper you go into the details, the less likely these things can be elegantly erased by an adapter.

In the end, a subtle situation appears: the API exposed by the unification layer seems neutral, but its best practices increasingly resemble the dialect of one concrete backend. Other backends are not unusable, but gradually become "best-effort compatibility".

## Vitest Browser Mode: Another Side of Unified Testing Experience

Vitest Browser Mode reminds me of a similar issue.

In terms of goals, it is also trying to unify testing experience: within Vitest's model, tests can run in a real browser environment, using browser APIs, a real DOM, and real rendering capability to validate code.

This is closer to the real user environment than pure Node plus DOM mocks. Especially for component libraries, interaction-heavy UI, and code that depends heavily on Web APIs, the direction of Browser Mode is natural.

But the same problem exists here: when we say "browser testing", what real users often have in mind is not an abstract browser provider, but a concrete backend: Playwright, or more specifically, Chromium.

If the vast majority of users ultimately choose Playwright + Chromium, then what exactly is the "unified browser layer" in Vitest Browser Mode doing? Is it creating a new testing paradigm, or wrapping Playwright inside Vitest's testing model?

## The Cost of Abstraction Layers

Abstraction layers are not free.

At minimum, they introduce these costs:

1. **Conceptual cost**: users need to understand the abstraction layer's own API while also understanding the actual behavior of the underlying tool.
2. **Debugging cost**: when something goes wrong, the error may come from business code, the abstraction layer, the adapter, or the real underlying tool.
3. **Capability loss**: to support multiple backends, the abstraction layer often can only expose the greatest common denominator.
4. **Semantic drift**: the same API name does not mean the semantics are truly the same across backends.
5. **Maintenance cost**: after underlying tools update, adapters must keep chasing behavioral differences.

When an abstraction layer truly brings cross-ecosystem migration ability, these costs may be worthwhile.

But if the vast majority of users do not migrate, or if migration still requires handling a large number of backend differences, then the value of the abstraction becomes questionable.

## When 90% of Users Choose the Same Backend

I think a crude question can be used to judge whether an abstraction is justified:

> If this unification layer were removed tomorrow and we directly targeted the backend actually used by 90% of users, what would be lost?

If the answer is "we would lose a small amount of edge compatibility, but most users would get a more direct, clearer, and easier-to-debug experience", then this unification layer may be over-abstraction.

If the answer is "a large number of users would lose cross-backend reuse ability, and the ecosystem would clearly fragment", then this unification layer has strong reason to exist.

Many times, the problem with a unification layer is not that it cannot work, but that it hides the reality that the ecosystem has already converged on a de facto standard.

## Unification Is Not the Goal

I am not against abstraction, nor am I against compatibility layers.

Good abstractions are certainly valuable. For example, they can:

- Consolidate repetitive boilerplate
- Extract truly stable semantics
- Leave an exit path for ecosystem migration
- Reduce the number of near-identical codebases library authors need to maintain

But "unification" itself is not the goal.

If a unification layer exists merely to prove that it can be compatible with many things, but does not bring clear benefits to mainstream users, then it may become a kind of architectural ritual.

It looks beautiful, neutral, and grand. But when it actually lands, everyone still circles back to the concrete backend.

## Temporary Conclusion

I am increasingly inclined toward a conservative judgment:

> An abstraction layer is meaningful only when users truly need to deal with multiple backends at the same time. If users eventually settle on one backend, the abstraction layer should be very cautious in proving its own value.

Otherwise, so-called unification may simply be repackaging the complexity of one concrete tool.

And after the repackaging, the complexity does not disappear. It merely gets a new name.
