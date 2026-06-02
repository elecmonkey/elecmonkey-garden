---
title: "Bun Team: PR #30412 - Rewrite Bun in Rust / #30683 - Remove .zig source files"
date: "2026-05-15"
description: "Community: PR #30702 - Revert \"Rewrite Bun in Rust\" / #30706 - Clarify that bun now is slop"
tags: ["Bun", "Rust", "Zig", "AI", "Frontend Tooling"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

## Big News

Bun's author Jarred Sumner successfully gave us some big news. The Zig-to-Rust migration that previously still looked like "an experiment" has now been merged into the main branch via PR [#30412 Rewrite Bun in Rust](https://github.com/oven-sh/bun/pull/30412). It changed 2,188 files in one go, added more than one million lines, and deleted 4,024 lines.

Uh, when I saw this PR get merged, I no longer really wanted to make a technical evaluation... As of writing, this PR has received 628 thumbs-up and 423 thumbs-down on GitHub. Of course I was surprised for a while when I saw it merged, but I was not surprised by Bun's official direction. From non-technical factors, you could say this has been **a long time coming**.

I originally thought the most aggressive thing the author could do, even at the extreme, would be to merge the Rust code in one shot, let Rust and Zig coexist in releases for the next few months or longer, maintain both, and replace things gradually. At noon I was still asking others: with the same people and funding, what happens to iteration when maintaining two versions? Then came the unexpected within the unexpected: Jarred opened PR [#30683 Remove .zig source files; rename $zig macros to $rust](https://github.com/oven-sh/bun/pull/30683)...

That PR is still open, but, uh, after seeing it, I went back and gave the original PR a thumbs-down...

## My View

I do not know much about Zig as a language or community, and I do have some affection for the Rust community. In that sense, I do not seem to have any inherent hostility toward Bun choosing Rust in the future. But Bun did this **far too hastily**. A few days ago it was still "an experiment" and "this code will probably all be thrown away". A few days later it was merged into main, and now they also want to remove all the Zig code... As a **community project** (I admit the project has strong personal factors, and I also know Bun has now been acquired by Anthropic), I feel that with **no roadmap**, **no discussion**, and with 1.8k PRs still open, acting so hastily really gives me a feeling of not being respected. This is just expressing a feeling; do not attack me or ask what it has to do with me. I can consider myself part of the community.

What happens to all the existing issues and PRs that were based on Zig implementation details? What happens to the more than one thousand open PRs? Will they be rebased one by one, rewritten one by one, or closed in bulk and restarted? For a fast-moving open-source project, the author certainly has the right to choose direction, but such an unstructured and arbitrary large migration will undoubtedly disrupt all the context accumulated by community contributors.

Regarding this action itself, **my current feelings are indeed conflicted and lean negative**.

> A side note: I also have conflicted and complex feelings about Vibe Coding itself... But considering that without Coding Agents I am now basically useless, my attitude toward AI Coding is definitely positive. My understanding of "Vibe" may be closer to a wish-making, laissez-faire feeling. From this perspective, I dislike the Zig community's extremely conservative attitude toward AI, and I also strongly dislike the AI myth of an overnight port.
>
> > A side note to the side note: at least I am still handcrafting my blog!!!

## "A Long Time Coming"

As the "only seedling" of the Zig community, tentatively speaking, Zig and Bun have long had drastically different community styles. How many technical factors are actually involved here is hard for me to say.

At the end of last year, Zig packed up and left GitHub. Its author Andrew Kelley wrote a very emotionally worded announcement, though it seems to have later been revised a lot. Of course there were practical considerations behind the migration, mainly GitHub Actions scheduling issues (**vibe-scheduling**, the community's meme-making ability is endless), but Andrew Kelley's wording made me worry that he had been carried away by his somewhat politicized attitude. Bun, on the other side, was acquired by Anthropic. As everyone knows, Anthropic often appears a little more political than other tech companies... I know this sounds a bit forced, but please interpret it weakly: the ideologies on the two sides seem slightly incompatible.

Specifically regarding attitudes toward AI, the Zig community's attitude is **extremely unfriendly**. The term vibe-scheduling mocks GitHub's bugs, and you can also think of it as mocking Vibe Coding. The Zig project itself bans AI-generated PRs, code, issues, and comments. But Anthropic, which acquired Bun, is the author of Claude Code... The Bun team has tweeted multiple times saying they improved Zig's performance several times over, but could not merge it upstream because it was written with an LLM... When phrased like that, with a bit of mockery and a bit of in-your-face provocation, it already feels somewhat personal.

One side thinks the other is a Slopfarm, "Take your slop elsewhere". The other side thinks the first side is a group of fanatical "handwriting sect" believers, AI denialism. So I have always felt that Bun would one day turn in another direction. If the Bun team had released a roadmap, gradually replaced parts with Rust, maintained both in parallel for a transition period, and done a rewrite like TypeScript, I think that would have been completely acceptable. It would even have been within my expectations, and I would have been happy and supportive.

## Bun and the Future of Software Infrastructure

### Feature Coverage

First, Bun is not an ordinary library. It is infrastructure that combines a JavaScript runtime, package manager, testing tool, bundler, and more. Can its behavioral compatibility, platform differences, edge cases, and ecosystem dependencies really be fully covered by "the test suite passes"? Bun will probably face massive skepticism for a while. As someone who has recommended and introduced Bun to many classmates, I still hope it can withstand this skepticism with actual performance.

### Memory Safety

As everyone knows, Bun's early memory leak issues were somewhat famous. So even today, for production server workloads, people basically still use Node.js, and perhaps some use Deno. Bun is mainly used to run or accelerate JavaScript-written toolchains, or to execute code in Edge Runtime. These environments usually start a process, use it, and throw it away. There is no long-lived process, so memory leaks are relatively less of a problem. Let it leak; after execution ends, the OS takes everything away. But one can imagine that Bun officially wants to solve this problem. This is one of the intuitive reasons why I think **Bun might one day migrate to Rust**, and also why I **might support a smooth transition to Rust**.

However, the narrative that "migrating to Rust solves memory safety problems" is not inherently guaranteed. Rust's safety is built on the constraints of safe Rust. At this moment, the Bun project contains a huge amount of `unsafe`, FFI, manual memory management, cross-language ABI, JSC bindings, and all kinds of code that bypass abstractions for performance. The protection Rust's compiler can provide will be discounted. Of course, as a low-level language toolchain, many capabilities cannot be implemented without `unsafe`. What matters later is whether these unsafe parts can be compressed into a sufficiently small, clear, and auditable scope. I wonder whether Claude Code follows the Rust community's good tradition of writing special comments for unsafe blocks.

### When AI Agents Start Touching Our System-Level Infrastructure

I am willing to admit that this may be an important historical moment: AI Agents starting to make major changes to system-level and language-level infrastructure, and Jarred appearing at this moment as a "madman" to witness history. But for now, I am still unwilling to see it as a "victory" for Coding Agents. Although it has been merged, Jarred's claim that this is a large experiment remains true. **The experimental subjects are runtimes being used by real users.**
