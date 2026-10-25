---
title: "Goodbye, ORM"
date: "2026-10-26"
description: "AI agents have changed the cost of producing large amounts of quality code, shifting the trade-offs we make in software engineering."
tags: ["ORM", "SQL", "Prisma", "sqlx", "AI Agent", "Database"]
author: "Elecmonkey"
og: 'orm-sql-ai-agent.og.jpg'
---

> This article was machine-translated from Chinese and has not been manually reviewed.

## The Strengths and Compromises of ORMs

Over the past few years, especially before AI agents became widespread, whenever I built a backend that interacted with a database, adding an ORM to the stack was a given. I would hesitate over which one to choose, but never question whether I needed one at all.

The main reason, I think, is that I am a frontend developer. I am unfamiliar with databases and SQL; even putting together basic CRUD by hand takes some effort. Using an ORM to work with a database feels much like using any other third-party library once I have figured out its API, which makes it far less intimidating. I also have no idea whether the complex SQL I write myself might contain vulnerabilities, race conditions, or other problems. Surely an ORM has to account for common issues like SQL injection, at least. Of course, race conditions and consistency risks inherent in the business logic are still my responsibility.

Looking back, I think I mainly get three benefits from an ORM:

- It saves me from writing SQL, which I am not good at.
- It provides a typed interface, integrating database operations into the backend programming language.
- It offers a perspective on database operations that fits the web application development model and feels more like working with data.

ORMs undoubtedly reduce the SQL expertise I need, which is another way of saying they reduce my cognitive load. Typed interfaces also matter a great deal for a good backend development experience. A typed data access API naturally leads to the third point. I find that feeling hard to describe, but here is an analogy: using an ORM to work with a database in backend code feels somewhat like using TanStack Query to manage server state in frontend code.

## Agents Writing SQL

### Agents Are Better at Writing SQL Than Calling ORM APIs

The widespread adoption of AI agents has changed many things. When I started a project in the summer of 2025, Vue was the frontend technology most of my teammates had heard of. I spent a long time debating whether to choose React, which I personally preferred and felt had a richer ecosystem with fewer pitfalls.

> In the pre-LLM era, Vue represented simplicity and ease of learning. It was intuitive for people who had only learned HTML, CSS, and JavaScript. As someone familiar with the entire build pipeline, I naturally see React as more purely “JavaScript”: I can clearly understand that the code I write is what will run in the browser, or at least easily picture what that code will look like. But for someone without that background, who simply memorizes React or Vue conventions as “how you are supposed to write things,” Vue is obviously more intuitive. Perhaps because of Evan You, Vue is even more widespread among Chinese-speaking developers.

Less than a year and a half later, I feel like I barely see discussions about Vue versus React anymore. Agents choose Next.js or Vite + React without hesitation, and large numbers of developers coming to frontend development from other fields accept that choice outright. React is popular, easy for AI to write, and well represented in its training data. This is one obvious effect AI has on the open-source community: the strong get stronger, and popular libraries become even more popular.

Now look at SQL versus ORMs. SQL has a long history and is highly standardized. Even with their dialect differences, MySQL and PostgreSQL are popular enough that models are surprisingly good at writing SQL for them. Almost every common backend language has two or three ORM options, some of which also ~~love (just kidding)~~ breaking changes. ~~[Prisma ORM 6 -> 7 Upgrade Notes: Thoughts on the Prisma Team's Approach to Upgrades](https://www.elecmonkey.com/en/blog/update-prisma-6-to-7)~~ Admittedly, agents can now look up documentation on their own, dig through node_modules, and consult documentation and SKILLs shipped with packages, which addresses these problems on the surface. Still, I suspect none of that comes as naturally to AI as writing the SQL already present in its training data.

The spread of agents takes away the first benefit I listed above.

### The Rise of Typed SQL Runners

Prisma ORM used to be one of my most frequently used ORMs in the TypeScript ecosystem, and Drizzle is another well-known tool. Their type information largely comes from **my declaring what I want to query, or the structure of what I am querying, in the way they expect**, allowing them to infer types from those declarations.

With the recent release of TypeScript 7.1 Beta, Content Mapper is finally available to try, and some enthusiastic tool builders have already put together Content Mappers that infer types from SQL.

Both approaches essentially try to produce a typed result by simulating the database's own behavior as closely as possible. Neither guarantees that the types are safe. And in TypeScript, type information is not part of the runtime in the first place.

> Bun's creator, Jarred Sumner, seems to be exploring ways to make TypeScript types part of the runtime, using AOT compilation to let TypeScript help improve execution performance.
>
> A memorable exchange:
> ![Jiahan says that is BunScript, not TypeScript](https://images.elecmonkey.com/articles/202610/jiahan-says-that-is-bunscript.webp)
> Jiahan Chen: That's BunScript, not TypeScript!
> > A further update: Jarred Sumner later posted that he had abandoned the idea of letting type assertions affect runtime behavior. For now, the main direction seems to be reporting runtime errors when types do not match.

SQLx in the Rust ecosystem offers a different approach to type safety from traditional ORMs. You write SQL directly in your code, where it is still just a string. At compile time, during macro expansion, SQLx connects to an actual database and uses its query analysis capabilities to obtain type information for the SQL parameters and returned columns. It then generates Rust code with static type constraints. Rather than trying to **simulate database logic**, SQLx **delegates that work to a real database server**, which can clearly provide more accurate type information.

> This does not mean backend developers need to connect to a live database every time they compile. SQLx supports caching query analysis results ahead of time and committing that cache to Git. Database schemas generally should not change very frequently.

SQLx's approach clearly brings us closer to a single source of truth. For the goal of obtaining a typed interface, I think it is a better solution. ORMs could also consider using this approach to obtain types for their escape-hatch APIs that allow raw SQL, rather than just letting users assert whatever types they want.

### A Database Is Not an Excel Spreadsheet

Videos about databases by the Bilibili creator [原子能](https://space.bilibili.com/162183), ~~the creator with the greatest respect for MySQL on the entire internet,~~ have left quite an impression on me. One of his central arguments is that a lot of backend logic should actually move down into the database, and that PostgreSQL can even handle most backend logic.

In my own projects, I can confidently say that I have wasted a tremendous amount of what relational databases offer. I have been using databases like spreadsheets. My limited knowledge of databases and SQL has kept my use of them at that level, even though I know they are capable of much more.

I think this is the downside of the more “data-oriented” perspective I mentioned earlier. It has already become apparent during my own project migrations. While rewriting the backends of many personal projects with Rust + Axum + SQLx, I have repeatedly encountered the same situation: the original code used an ORM to load a lot of data into memory, processed it in backend application code, and finally produced the result the API needed to return to the frontend. Expressing the same logic directly in SQL lets me get the final result straight from the database. That clearly improves backend performance and reduces resource use, and it may even benefit the database itself, since it previously had to return so much data.

Some of these cases may well come down to my unfamiliarity with advanced ORM APIs. Still, I think it is fair to say that the abstraction an ORM provides is less expressive than SQL. Using SQL directly lets us make fuller use of the database's own capabilities and decide, based on the actual situation, whether a computation belongs in the backend or the database.

## Problems Solved and Problems That Remain

After the discussion above, it should be clear why I am pessimistic about the future of ORMs. In the AI coding era, their main advantages either no longer apply or have equivalents, sometimes better ones, when writing SQL directly. Meanwhile, their main disadvantages can be avoided precisely by writing SQL directly.

But not every problem has been solved. Two things used to worry me most in code: copied **regular expressions** I could not understand at all, and copied **long SQL queries** I could not understand at all. AI is powerful at coding and reviewing code, but that does not mean it will always produce safe, well-written SQL. Safety still requires review by someone with the knowledge we needed in the pre-LLM era. I do not think AI introduced this problem: CRUD programmers with no understanding of database fundamentals could cause disasters before, too. Today's AI agents may likewise need human knowledge to give humans confidence. Besides, many unsafe operations stem from bugs inherent in business logic or are closely tied to it. That is not something an agent can solve.

## Reconsidering Software Engineering Trade-offs

When AI significantly reduces the cost of using lower-level capabilities directly, abstractions introduced mainly to simplify development, without offering enough value of their own, deserve another look.

Recently, plenty of people on X have been proclaiming that React and frontend frameworks are obsolete, pointing to how easily AI can build web apps with plain HTML, JavaScript, and CSS. Setting aside whether they are willing to spend several times as much on tokens, I find it hard to imagine AI managing hundreds of thousands of lines of chaotic JavaScript without making far more mistakes than it would in an orderly monorepo built around modern frontend practices. Besides, the client-side cost of adopting frameworks like React is currently almost imperceptible. For cases with particularly demanding rendering performance requirements, Svelte, Solid.js, and the forthcoming Vue Vapor Mode may all be alternatives that AI handles just as well and that are just as straightforward to work with.

So why are ORMs different? I think React's role in frontend development is actually similar to SQL's role in databases. They abstract low-level execution into declarative relationships. Understanding those relationships is much easier than understanding complex low-level execution, for both humans and large language models. The new abstraction an ORM adds on top of SQL seems to offer limited originality. It is more like an interpreter: when I speak only Chinese, an interpreter bridges the gap between me and English speakers. But once I can speak English myself, hiring an interpreter only limits my ability to use some of the language's subtler expressions.
