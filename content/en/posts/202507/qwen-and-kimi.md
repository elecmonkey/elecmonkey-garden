---
title: "Qwen Coder and Kimi K2 Still Seem to Be Missing Something"
date: "2025-07-26"
description: "Perhaps model adaptation is also an important part of the Vibe Coding experience. Maybe domestic model vendors could also work on tooling adaptation for their own models."
tags: ["AI", "Agent", "Vibe Coding"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

## The Hundred-Model War

The field of Vibe Coding used to be more or less controlled by Claude and Gemini. Recently, Kimi K2 and Qwen Coder, both marketed around open weights, have joined the battle one after another, bringing everyone a bit of surprise. Qwen Coder Plus supports a 1M context length, matching Gemini 2.5 Pro. For projects that have reached a certain scale, every company building Agents is trying every possible way to compress and distill useful information, including Cursor indexing aggressively every time a repository is opened, or letting the model summarize by itself when the context is almost full. But if the context is large enough, perhaps it can swallow all code information and "understand software architecture" by reading everything. Brute force really can work miracles. Qwen Coder Plus claims software engineering capability comparable to Claude Sonnet 4. I have not done rigorous experiments, but subjectively it does feel very strong.

The 1M context-length Qwen Coder seems to provide an API only on Alibaba Cloud's official website, with tiered pricing. Above 256K it becomes a bit frighteningly expensive: 0.2 yuan/k tokens. At an exchange rate of 7, that is roughly 28 USD per million tokens. This long-context pricing already goes beyond Gemini 2.5 Pro and Claude Sonnet 4, looking up toward Claude Opus 4. Kimi K2's maximum context length is 128k, which is not outstanding, but its capabilities are okay, and its cost belongs to the quite cheap tier.

## Tool Adaptation

Claude-family models have in fact become the benchmark in the Vibe Coding field. Every company building Agents is trying hard to make its own product work more smoothly with Claude-family models. Cursor, Windsurf, AugmentedCode, Trae, and others spend a lot of effort every day figuring out how to use Claude well. Other models may only receive simple "support" in these IDEs or Agents; after all, everyone uses OpenAI-style APIs. Google released gemini-cli specifically for its own models. Setting aside the rate limits caused by free usage and the server issues, it should be said that it is somewhat better to use than Gemini integrated into various IDEs. Qwen realized this problem, and since gemini-cli happened to be open source, it modified it overnight into qwen-cli. Using qwen3-coder inside qwen-cli is much more comfortable than adding it to Trae.

## The Problem with Kimi K2

I tried putting Kimi K2 into various IDEs and using it inside gemini-cli and qwen-cli, but it easily produced all kinds of strange errors. Sometimes I could feel that the model was quite powerful, but frequent errors seriously affected efficiency. Trae CN has already added Kimi K2 to the product, but for now I am not likely to give up Claude for Kimi K2. So I can only regretfully say that there is no way for me to use Kimi K2 as a primary model.

Maybe one day Kimi officially releases something like kimi-cli. There are quite a few similar open-source implementations anyway, and we should thank claude code for letting everyone see another form of Agent tool. Maybe one day Trae, Tencent's reportedly in-progress CodeBuddy IDE, or even Cursor and others will spend effort adapting to Kimi. For now, because qwen-cli exists, Qwen Coder's experience deserves an extra score beyond model capability.

> October 2025 update: Kimi-cli really was released, haha. It is unusually implemented in Python, so it seems to be self-developed ()

> I tried it for a few hours and burned through fifty yuan of API fees. Not bad.


Attached table: Currently mainstream models that can be used for Vibe Coding. OpenRouter prices and data are selected for comparison, while the official versions of Kimi K2 and Qwen3 Coder Plus are also included.

| **Model Name**               | **Context Length** | **Input Cost** (per million tokens) | **Output Cost** (per million tokens) |
|----------------------------|--------------|------------------------------|------------------------------|
| **Gemini 2.5 Pro**    | 1M        | $1.25                        | $10                          |
| **Gemini 2.5 Flash**  | 1M        | $0.30                    | $2.50                        |
| **Qwen3-Coder-480B**  | 256K         | $0.302                       | $0.302                       |
| **Qwen3-Coder-Plus (Aliyun)**  | 1M           | Tiered pricing 0-32K: \$0.57 32K-128K: \$0.86 128K-256K: \$1.43 256K-1M: \$2.86 | Tiered pricing 0-32K: \$2.29 32K-128K: \$3.43 128K-256K: \$5.71 256K-1M: \$28.57 |
| **Kimi K2 Instruct**  | 64K          | $0.14     | $2.49                        |
| **Kimi K2 (Moonshot)** | 128K         | \$0.14 (cache hit) \$0.56 (cache miss) | $2.24                        |
| **Claude Opus 4**          | 200K         | $15                          | **$75**                      |
| **Claude Sonnet 4**        | 200K         | $3                           | $15                          |
| **Claude Sonnet 3.7**      | 200K         | $3                           | $15                          |
| **Grok 4**                 | 256K         | $3                           | $15                          |
