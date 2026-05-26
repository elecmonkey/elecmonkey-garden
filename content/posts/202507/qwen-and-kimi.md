---
title: "Qwen Coder 与 Kimi K2，好像还缺点什么"
date: "2025-07-26"
description: "也许模型适配也是 Vibe Coding 效果体验的重要一环。也许国内的模型厂都可以顺便做一做自家模型工具适配的问题。"
tags: ["AI", "智能体 (Agent)", "Vibe Coding"]
author: "Elecmonkey"
---

## 百模大战

Vibe Coding 领域之前算是被 Claude 和 Gemini 控制。最近以权重开源为卖点的 Kimi K2 和 Qwen Coder 接连加入战斗，也是给大家带来了一点惊喜。Qwen Coder Plus 是支持到了 1M 上下文长度，和 Gemini 2.5 Pro 看齐。对于上了规模的项目，各家做 Agent 的都在想尽各种办法去压缩蒸馏有效信息，包括 Cursor 每次一打开仓库就使劲 indexing，或者是上下文快满的时候让模型自己 summarize 一下。但是如果上下文足够大，那可能就是能把所有代码信息吞下去，靠读一切去"理解软件架构"——大力就是能出奇迹。 Qwen Coder Plus 号称软件工程能力媲美 Claude Sonnet 4 ——我也没做严谨的实验，但是体感上确实很强。

1M 上下文长度的 Qwen Coder 似乎只有阿里云官网提供 API，采取阶梯收费。256K 以上就贵的有点吓人了，0.2元/k tokens，汇率按7算相当于百万 tokens 大约28美金。这个长上下文的定价已经超乎 Gemini 2.5 Pro & Claude Sonnet 4 之外，可以仰望 Claude Opus 4 了。Kimi K2 的上下文长度最长 128k，并不出众，但是能力还ok，并且费用属于相当便宜的那一档。

## 工具适配

Claude 系列的模型事实上成了 Vibe Coding 领域的标杆，所有做 Agent 的厂子都在努力让自家产品用 Claude 系列的模型用的更顺畅，Cursor、Windsurf、AugmentedCode、Trae 等厂每天花大量的精力去琢磨怎么用好 Claude。但是别的模型在这些 IDE 或者 Agent 里可能支持简单的"支持"——反正大家都用 OpenAI 风格的 API 嘛。谷歌出了 gemini-cli，专门针对自家模型，抛开这个免费使用导致的限速和服务器容易出问题之外，应该说比各个 IDE 里集成的 Gemini 都好用一些。Qwen 意识到了这个问题，正好 gemini-cli 开源了，连夜魔改出了 qwen-cli。在 qwen-cli 里用 qwen3-coder 比添加到 Trae 里用舒服多了。

## Kimi K2 的问题

Kimi K2 我试图把它放在各种 IDE 里用，放在 gemini-cli 和 qwen-cli 里用，但是都很容易出各种奇奇怪怪的错。有时候能感觉模型挺厉害的，但是频繁出错很影响效率。Trae CN 已经在产品里加入了 Kimi K2，但我目前还不太可能为了 Kimi K2 放弃 Claude。所以我只能很遗憾的表示，没有办法把 Kimi K2 当成一个很主力的模型去使用。

也许哪天 Kimi 官方也会出一个 kimi-cli 之类的东西（反正类似的开源实现挺多的，这得感谢 claude code 让大家看见了 Agent 工具的另一种形态），也许哪天 Trae、腾讯据说正在搞得 CodeBuddy IDE，甚至 Cursor 之类的也会花力气去适配 Kimi。目前来说，因为有 qwen-cli，Qwen Coder 的体验还要在模型能力之外再加一层分。

> 2025.10更新：Kimi-cli真发布了哈，罕见的用 Python 实现的，看来是自研（）

> 试了几个小时跑掉了五十块钱的 API，还不错


附表：目前比较主流的能用来 Vibe Coding 的模型，选取 OpenRouter 的价格和数据做个对比，同时加入 Kimi K2 和 Qwen3 Coder Plus 各自的官网版本。

| **模型名称**               | **上下文长度** | **输入费用**（百万token） | **输出费用**（百万token） |
|----------------------------|--------------|------------------------------|------------------------------|
| **Gemini 2.5 Pro**    | 1M        | $1.25                        | $10                          |
| **Gemini 2.5 Flash**  | 1M        | $0.30                    | $2.50                        |
| **Qwen3-Coder-480B**  | 256K         | $0.302                       | $0.302                       |
| **Qwen3-Coder-Plus（Aliyun）**  | 1M           | 阶梯计价 0-32K: \$0.57 32K-128K: \$0.86 128K-256K: \$1.43 256K-1M: \$2.86 | 阶梯计价 0-32K: \$2.29 32K-128K: \$3.43 128K-256K: \$5.71 256K-1M: \$28.57 |
| **Kimi K2 Instruct**  | 64K          | $0.14     | $2.49                        |
| **Kimi K2（Moonshot）** | 128K         | \$0.14 (缓存命中) \$0.56 (缓存未命中) | $2.24                        |
| **Claude Opus 4**          | 200K         | $15                          | **$75**                      |
| **Claude Sonnet 4**        | 200K         | $3                           | $15                          |
| **Claude Sonnet 3.7**      | 200K         | $3                           | $15                          |
| **Grok 4**                 | 256K         | $3                           | $15                          |
