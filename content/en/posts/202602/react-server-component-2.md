---
title: "On React Server Component (RSC) (2) - RSC Rules, React Component Trees, and Module Dependency Graphs"
date: "2026-02-15"
description: "With one loud shot from the React team, RSC arrived in frontend development | Continuing RSC: rules, architecture, and JavaScript modules"
tags: ["React", "RSC", "Frontend Architecture", "Next.js"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

Let's continue talking about RSC. Previous article: [On React Server Component (RSC) (1) - RSC Principles, SSR, and Partial Hydration](https://www.elecmonkey.com/blog/react-server-component-1)

## RSC Rules

The React team always seems to enjoy teaching everyone how to do things (laughs). When learning React, everyone has more or less been annoyed by the complicated Rules of Hooks. The rules of RSC can roughly be summarized as follows:

- Server Component functions are executed only once, so they can execute code with side effects.
- Server Components cannot use browser-side Hooks.
- Server Components can import Server Components or Client Components.
- Files with `"use client";` cannot import Server Components.
- The entire App consists of a component tree; some nodes are Server Components, and some nodes are Client Components.

![RSC Tree](https://images.elecmonkey.com/articles/202602/rsc-tree.png)

> I borrowed an image from the Modern.js documentation. The original is in [Modern.js v3 Release: Focused on web framework, embracing ecosystem development](https://modernjs.dev/community/blog/v3-release-note)

The first two are very easy to understand, but after seeing this image, some people may be confused by the later points. Does it mean a Server Component can be a child component of a Client Component, and a Client Component can be a child component of a Server Component, but a Client Component still cannot import a Server Component? Actually, these two statements are talking about two different kinds of graphs formed by two different import/export relationships: the component tree and the module dependency graph.

## Frontend Graphs

### Module Dependency Graph

The module dependency graph is the import relationship seen by the build tool. Of course, I use Vite more often and am not very familiar with Turbopack, which Next.js depends on under the hood, but for now we can assume they are doing roughly the same thing: starting from a bundling entry, they analyze according to ESM import/export syntax and list all dependent modules.

For a server entry, when it bundles to a Client Component, that becomes a placeholder. Server Components do not execute this code (because SSR execution is another matter). The execution result is sent to the client as a Flight payload, and the client executes its own client code to fill in these missing Client Components.

For a client entry, when it bundles to a Server Component... it cannot bundle to a Server Component! Code for the Node.js environment cannot be used in the browser! In the latest tested version of Next.js (v16.1.6), importing a Server Component from a component with `"use client";` causes that Server Component to be forcibly run on the client. If the component contains node-only code, it will error. But if the component code just happens to run in the browser by coincidence, there will be no error prompt.

> In my test, I used the `node:os` module's `os.type()`, and after importing it into a Client Component, it actually ran on the client... It seems to be some mysterious polyfill... The internals of the Next.js framework are too deep and inscrutable. In the end, an error at this level only produced an SSR Hydration mismatch because the return value of os.type was different. I feel there could actually be a stronger error.

Whether it is Rspack or Esbuild, Rollup or Rolldown, they all have to complete module dependency analysis. You can think of them as ESM standard implementations outside the JS Runtime (browser or local runtime).

I have seen some blogs say that in Next.js with RSC enabled (Next.js App Router), a very important point is to "draw the client boundary" in the component tree. My understanding is that this boundary should actually be drawn in the module dependency graph.

### React Application Component Tree

The component tree is the structure seen by the React runtime, where nodes are marked as Server or Client. The place where it differs from the module dependency graph is that **the component tree allows the form "Client as parent, Server as child"**, but this "child" is not imported by the client. It is passed in by the server.

- In the component tree: a Client node can have Server child nodes
- In the dependency graph: a Client module still cannot import a Server module

Suppose there are three components. The Server page passes Server Components as children to a Client shell:

```tsx
import ClientShell from './ClientShell';
import ServerSidebar from './ServerSidebar';
import ServerContent from './ServerContent';

export default function Page() {
  return (
    <ClientShell>
      <ServerSidebar />
      <ServerContent />
    </ClientShell>
  );
}
```

ClientShell is a Client Component, and it does not import any Server Components:

```tsx
"use client";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <header>App</header>
      <main>{children}</main>
    </div>
  );
}
```

ServerSidebar/ServerContent are both Server Components, and they can include database/file reads.
Viewed from the component tree: ServerSidebar and ServerContent are mounted under ClientShell.
But viewed from the module dependency graph: Page (server) depends on ClientShell and ServerSidebar/ServerContent at the same time, while the client entry does not depend back on server modules.
