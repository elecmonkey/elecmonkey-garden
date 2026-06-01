---
title: "How to Force Mermaid, Born for the Browser, to Render on the Server"
date: "2025-04-26"
description: "You will find that many tools pursuing SSR/SSG still ultimately choose browser-side rendering for Mermaid."
tags: ["Server-Side Rendering (SSR)", "Node.js", "Mermaid"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

## Mermaid.js

Mermaid is a diagram generation tool commonly embedded in Markdown documents. A previous article, [Getting Started with Mermaid Diagrams for Technical Documentation](https://elecmonkey.com/blog/mermaid-tutorial), introduced it.

Now more and more frameworks support Markdown-based content management systems, and people building their own CMS basically choose Markdown as the writing format. However, I ran into some problems when configuring SSR for Mermaid diagrams. Mermaid needs DOM API support. Then I very naturally thought of using JSDOM to simulate it, only to find that it still errors.

## Browser Dependencies

Mermaid heavily depends on the browser's CSS and layout capabilities, as well as rendering capabilities. This means simple DOM simulation, such as JSDOM, cannot meet its needs. Mermaid needs a complete browser environment to:

- Lay out element sizes and positions
- Apply CSS styles and animations
- Handle SVG rendering

## mermaid-cli

The official project `mermaid-cli` uses Puppeteer, a headless browser library, to implement Mermaid rendering in a Node.js environment. This is currently the only reliable server-side rendering solution.

```bash
# 安装 mermaid-cli
pnpm install -g @mermaid-js/mermaid-cli

# 使用
mmdc -i input.mmd -o output.svg
```

Puppeteer starts a full Chromium browser to do this. So it is actually still browser-side rendering. If I run the browser on the server side, doesn't that pre-render the thing?

![Mermaid Example](https://images.elecmonkey.com/articles/202504/mermaid-example-lr.svg)

I made a simple Mermaid diagram for testing. According to my local test (Macbook Air M2, rendering to an svg file), using the `mmdc` command from mermaid-cli to render a single chart took an average of 1.017 seconds per command.

This performance means **SSR rendering is impossible**: each render takes about 1 second. Should every request occupy one server core for 1 second? For content sites that pursue Noscript usability, putting mermaid-cli into the build process and rendering every Mermaid diagram when it appears is a fairly reasonable option. But as the site grows, you have to consider **incremental builds**. At present, there does not seem to be (or I do not seem to know of) any mature tool that integrates this, so you may need to configure a complex build process yourself.

For building Markdown, mermaid-cli does provide direct and convenient support.

```bash
# 渲染 Markdown
mmdc -i readme.template.md -o readme.md
```

This converts the following in Markdown:

````markdown
```mermaid
graph
   [....]
```
````

Into:

```markdown
![diagram](./readme-1.svg)
```

And also outputs the attached file. So if you have your own CI/CD server and workflow, you can render the extra incremental Markdown files before each build, then use mermaid-cli's rendering result to run the normal frontend build process.

But for personal projects using GitHub Actions, every build independently pulls the code from the GitHub repository. Every build means re-rendering the Mermaid diagrams of the entire website, which is a bit ridiculous.

## Batch Rendering Optimization

In fact, every time `mmdc` is called, it starts a new headless browser instance. The previous method of pure CLI invocation is indeed easy to code, but it means every diagram render starts and closes a browser, wasting a lot of time on opening and closing the browser. We can write our own script to call the `run` method of the `@mermaid-js/mermaid-cli` package, start the headless browser only once, and then batch render all diagrams.

According to testing (Macbook Air M2, rendering to svg files):

- Rendering 10 diagrams: 1.797 seconds
- Rendering 100 diagrams: 16.362 seconds
- Rendering 200 diagrams: 29.934 seconds

From this, batch rendering performs much better. Even so, using SSR (server-side rendering) is still **unimaginable**, and SSG (static site generation) will also **severely slow down build speed**.

## Conclusion

If you pursue Noscript usability, SSG is possible. It definitely is possible.

Can this SSG really improve client-side loading speed? I will do an experiment when I have time. I feel it should be able to. Although client-side rendering only needs to fetch a small piece of Mermaid code for each diagram, and that code must be smaller than the rendered SVG file, client-side rendering also needs to fetch a Mermaid Runtime JS file and wait for browser rendering.

For the test diagram, still the one at the beginning of this article, after copying it ten times, the Markdown size is 8.3 KB. After rendering, each SVG is 27 KB, an expansion of 32.5 times. If the article data volume is large, you also have to consider server storage cost.

In summary, the conclusion is: **client-side rendering is recommended**.

\- End \-

Official documentation:

- [Mermaid.js](https://mermaid.js.org/)
- [mermaid-cli](https://github.com/mermaid-js/mermaid-cli)
- [Puppeteer](https://pptr.dev/)
