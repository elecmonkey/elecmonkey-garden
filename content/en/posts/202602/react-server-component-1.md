---
title: "On React Server Component (RSC) (1) - RSC Principles, SSR, and Partial Hydration"
date: "2026-02-14"
description: "With one loud shot from the React team, RSC arrived in frontend development | Server Component principles, RSC and SSR, and the meaning of partial hydration"
tags: ["React", "RSC", "Frontend Architecture", "Next.js", "Server-Side Rendering (SSR)"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

Recently, the leading domestic React framework [Modern.js](https://github.com/web-infra-dev/modern.js) released its major [v3 version](https://modernjs.dev/zh/community/blog/v3-release-note.html), officially supporting React Server Components (abbreviated as RSC below). Meanwhile, the de facto standard React meta-framework, [Next.js](https://nextjs.org/), has long fully embraced RSC.

It should be said that RSC has caused a rather **divided** reaction in the frontend community. The React team sees it as a future web-based app architecture, while opponents criticize the move of more logic to the server as purely serving Vercel's commercial goals. Next.js, born around Vercel's cloud services and launched by Vercel, is naturally very proactive about RSC: it enables RSC by default across the board and provides no configuration option to return to a pure SPA. If necessary, every component must be marked with `"use client";`.

## Server Components Principles

The most central architectural feature of a React project with RSC enabled is that it **splits components into two categories**: Server Components run only on the server by default, while Client Components are explicitly marked with `"use client";` and are bundled into the JS Bundle that runs in the browser. Server Components can directly access server-side capabilities such as databases, file systems, and private APIs, but they cannot use runtime features that only exist in the browser, such as `useState/useEffect`. Client Components are the opposite: they handle interaction and state.

In the rendering flow, Server Components do not directly generate complete HTML. Instead, they produce a kind of "serialized component tree result" that React can interpret, the React Flight payload, which is essentially a large amount of JSON data. After the browser receives this payload, React uses it to parse a complete component tree, and then only hydrates the Client Components. The final effect is: page structure and data are completed on the server, while interaction is activated only where necessary (Client Components!).

This mechanism brings two key constraints: Server Components can introduce Client Components, but Client Components cannot import Server Components in the opposite direction; the boundary is explicitly divided by `"use client";`. Through this one-way dependency, the React team guarantees the direction of data flow and keeps the client bundle containing only the parts that truly need interaction.

## The Relationship Between RSC and SSR

Both RSC (React Server Component) and SSR (Server Side Render) contain the word Server. In terms of data logic, some capabilities overlap, but technically they are not directly related.

### SSR Server Side Rendering

The currently classic SSR architecture (not only in the React world, but also in Nuxt, SvelteKit, and the like) is the so-called "progressive app": when a browser first requests any page, that page is rendered through SSR; the browser downloads the requested page's HTML, downloads the JS Bundle, and performs hydration. Once hydration is complete, the app becomes a full SPA client application, and subsequent page routing and data fetching are handled by the client.

In this structure, the frontend server in SSR is actually in a rather awkward position. It is just an independent middle layer, and it cannot write much server-specific code, such as database queries or reading environment variables. This is because the server merely executes the client components once in advance, then uses `renderToString` to produce an HTML string. So what is the point of this advance execution? Improving website SEO, enhancing usability in no-script scenarios, and reducing first-screen load time. The role of SEO depends on whom you ask. To be honest, modern frontend work rarely considers no-script scenarios; in most cases, we assume JavaScript is available by default. As for how much user experience can improve, many factors are involved. For example, if the frontend server layer (hereafter Backend for Frontend, or BFF layer) and the backend application are deployed on the same server, SSR can reduce one round trip for data (one fewer API request). But if the application is progressive, only the homepage can benefit from this advantage. If it is not progressive at all and all routes are hard navigations through `a` tags, then many SPA advantages are lost, such as seamless client routing and regional reloads. Every page reloads completely, and the user experience might even be worse than a pure SPA.

In other words, SSR is a set of **code born for the client**. In some scenarios (the first page opened by the user), it is executed once on the server in an awkward and partial way in advance (many Hooks and browser APIs cannot be executed). The server side is an appendage of the client. All code is client-first (it all needs to run in the browser once). Which code will run on the server is uncertain, the effect is not guaranteed, and when errors occur (the classic hydration mismatch), **only the client** is the single source of truth.

### RSC React Server Components

RSC works in a completely different way. A Next.js project with RSC enabled clearly divides code into parts that "run in the browser" and parts that "run on the server". The parts that run on the server can directly write capabilities such as **accessing databases**, **calling private APIs**, **reading server-side environment variables**, and **reading the server file system**. The parts that run on the client can directly use browser APIs, just like a React SPA project. For Server Components, the server execution result is the single source of truth. This code is absolutely never sent to the browser for execution; instead, the result (React Flight payload) is sent to the browser. Client Components are not executed early on the server, but are sent directly to the browser as code to execute.

Under the same requirement of having a Node-capable environment as the BFF layer, a React project with RSC enabled can obviously make fuller use of this BFF layer, instead of paying a high cost (going from a pure SPA deployed as static assets to SSR that requires a BFF, with deployment cost and complexity rising a level) while only getting a few awkward benefits.

### Using SSR and RSC Together

So should we choose SSR or RSC? The default configuration of Next.js 16 is quite magical: both are enabled together! In fact, these two technologies do not conflict at all. RSC cannot solve issues such as SEO, because it still does not output HTML! In the eyes of a search engine, what is the difference between a Flight payload and all the colorful data we fetch with JS? In a project with RSC enabled, Server Components of course run on the server. Then aren't Client Components just the classic components we already know? We can absolutely arrange these Client Components using traditional SSR.

Therefore, when you open the source code of a page in a Next.js project, you can see these parts.

![rsc-and-ssr](https://images.elecmonkey.com/articles/202602/rsc-and-ssr.png)

On subsequent routes, SSR no longer occurs, but Server Components still need to execute on the server. The Flight payload is streamed directly to the browser as a network request response, and the browser only needs to execute the Flight data together with the JS code of the Client Components.

## RSC and Partial Hydration

Regarding the birth of RSC, we can also think about the problem from another angle.

Astro, as a build-time, server-first framework, proposed the "Islands Architecture". Parts that need no interaction at all are delivered directly to the browser as static HTML, without any messy extra steps. Parts that need interaction are hydrated, activating that portion of DOM into DOM managed by some framework.

RSC is first of all part of React, based on the JavaScript framework React, so of course it cannot turn into static HTML somewhere and completely throw away client JS. React Flight is a data interaction protocol customized by the React team and necessarily needs a browser-side JS runtime to parse it. But for Server Components, the parsed data is rendered directly and that's it. The function of the function component itself does not need to run again and again in the client-side component lifecycle. During these processes, only Client Components go through the traditional re-execution process. (Server Components must be function components, and these function codes are not sent to the browser at all!) Architecturally, this coincides with the idea of partial hydration in Astro's Islands Architecture. It is a special kind of partial hydration: here, not hydrating means not executing traditional client React JS, not that there is no JS at all.

The other angle I am talking about is, guided by the idea of "partial hydration", to execute as little JavaScript as possible for work the server has already completed and DOM where the client needs no additional logic. For Astro, this is the Islands Architecture and partial hydration. In the new architecture envisioned by the React team, it means putting logic that can run on the server on the server, so the client no longer re-executes Server Component functions and instead directly uses their execution results.
