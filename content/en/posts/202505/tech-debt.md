---
title: "Running an Antique Frontend Project on an arm64 Mac, and Ending Up with a Head Full of Thoughts About Technical Debt"
date: "2025-05-19"
description: "Technical debt is not purely a technical problem. It is about CI/CD modernization, organizational governance, and every technologist's open source culture and community participation."
tags: ["macOS", "Node.js", "Technical Debt", "CI/CD", "Open Source"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

> Technical debt is not purely a technical problem. It is about CI/CD modernization, organizational governance, and every technologist's open source culture and community participation.
> -- Said by myself.

## Running x86_64 Node.js

As everyone knows, packages on npm are not necessarily all written in JavaScript. Some packages are released in binary form. But Apple's first Apple Silicon Mac was not released until the end of 2020. Many projects from five years ago are still running, but many packages from five years ago did not provide prebuilt binaries for macOS on the ARM architecture.

Fortunately, Apple provides a compatibility layer called **Rosetta 2**, which allows x86_64 (Intel architecture) programs to run through emulation.

The `arch` command specifies which architecture to run a program under. Start an x64 terminal:

```bash
arch -x86_64 zsh

# 可以通过以下命令确认当前终端架构：
arch
# 应该输出：i386
```

In the x86_64 terminal, you need to install the x86_64 version of Node.js. If you use nvm to manage Node.js versions, you can do this:

```bash
# 先卸载当前的 ARM 版本
nvm uninstall v18

# 安装 x86_64 版本
nvm install v18

# 使用该版本
nvm use v18
```

```bash
# 确认 Node.js 架构
node -p "process.arch"
# 应该输出：x64
```

Install project dependencies in the x86_64 environment:

```bash
npm install abc@x.y.z
```

Finally, if you often need to switch between terminals of different architectures, consider adding an alias in `.zshrc` or `.bashrc`:

```bash
alias x64='arch -x86_64 zsh'
```

Then you only need to type `x64` to quickly switch to an x86_64 terminal.

## Is Technical Debt Unavoidable?

### How the Snowball Starts Rolling

The term **technical debt** has been repeated to death, but it is a vivid metaphor. Debt affects your cash flow if you repay it in the short term; if you keep delaying repayment every day, the interest eventually becomes enormous.

Ideally, whenever the technology stack you depend on is updated, you should promptly follow up and update dependencies. Minor version updates probably will not cause problems, and there should not be too many BREAK CHANGE items. Official projects usually provide migration or replacement instructions. At that point, even maintainers unfamiliar with the project can locate issues through errors caused by BREAK CHANGE and complete the update.

But if a project's dependencies are not updated for a long time, and **five**, **ten**, or **fifty** versions with BREAK CHANGE items have passed, then it becomes impossible to update. The only options left are to rebuild from scratch, or simply lie flat and let it run for as long as it can. Once it finally stops running completely, then you can only **trust the wisdom of future generations**.

So why don't the maintainers update it?

The answer is simple: "upgrading dependencies" is not a **visible task item**. It does not directly produce KPI, does not directly produce reports, and will not be included in a plan. If I do not touch it, it has nothing to do with me. If I upgrade it, not only might BREAK CHANGE require small migrations and create trouble for myself, but even if there is no breaking change, I am still creating risk. If something goes wrong, isn't that my fault? For an individual programmer, "proactively" upgrading or refactoring means taking the risk personally while the benefit does not belong to them. This violates human incentive mechanisms.

### Do Not Wait for Incidents to Trigger Governance

Honestly, technical debt is indeed hard to avoid.

For an organization, whether a team or a company, it is best to have a person in charge who understands technology and also has authority (decision-making or financial power). They can understand that software going online is only the beginning of the software lifecycle, and that software needs continuous evolution and maintenance. When a large amount of technical debt has accumulated, they can secure time and resources, push large-scale refactoring, and solve problems while costs are still controllable.

But this still seems to require an **individual**, at some level, to shoulder the risk and push evolution forward. If no one can use personal willpower to drive this thankless work, then the only remaining path is **waiting for incidents to trigger governance**.

So the termites under the floor keep increasing: invisible in daily life, unmanaged until something happens; once something does happen, a large area collapses. After the collapse, rescue teams naturally come. Yet we all know the cost of rebuilding a dangerous building in advance cannot possibly be higher than the cost of rescue after collapse.

## Cure: "Modern CI/CD"

Technical debt often does not happen because the code was badly written, but because nobody continues paying attention to it after it is written. In this sense, technical debt is **not** a technical problem, but a problem of management capability and organizational governance capability.

If project initiators can consciously use modern CI/CD systems to continuously discover problems and push updates during everyday development, the accumulation speed of technical debt will be greatly reduced, or even smoothed out early. For example, automatic dependency update tools such as **Renovate** and **Dependabot** can automatically detect dependency updates and create PRs, then developers Review + Merge. Unit tests should have coverage; lint, type checking, build failures, and deprecation warnings should not be ignored. If there are no special circumstances, some hard requirements should be introduced to eliminate warnings caused by "violating best practices but still runnable" as much as possible.

Modern CI/CD supports automatic continuous deployment, with Git commits or Git tags releasing versions. This brings another big benefit: even if an upgrade causes problems, you can quickly locate and recover from them, reducing the risk cost of "failed updates" and encouraging more frequent small-step technical iteration.

## Cure: "Community Participation"

Quite a few people write projects with the mindset of "I am learning xx language" or "I am learning xx framework". To them, these things are pure knowledge and work tools, and they are not interested in the "culture" behind them at all.

That is not wrong. Of course they are knowledge and can become courses in schools or training institutions. But they themselves are open source projects, repos on GitHub, and open source projects with community discussion, maintenance, and evolution routes.

The open source community is not a stable API provider; it is a living ecosystem. Whether a module is still maintained, whether it is recommended, whether it has been marked deprecated, and what alternatives exist: these directions are produced through community discussion. This information often appears in forums, README files, Issues, Discussions, and Release Notes, not error messages.

For libraries and tools you commonly use, only by **participating in the community** can you truly use them with ease. Maybe you do not have the energy or desire to file Issues or PRs, but at least you should follow community dynamics, know what kind of people are behind a tool called Node.js, know how the React community thinks about the role of "the server of the frontend", and know what Vue.js core maintainers imagine and expect for future build toolchains. Then perhaps we can understand the open source project's own **personality**. You cannot get that by watching endless Vue courses on Bilibili or memorizing APIs.

## Closing

Architecture, testing, documentation, CI/CD, dependency updates, community culture... these "non-functional" tasks are not directly related to business features and are excluded from our roadmap. But we can probably all vaguely understand that these "non-functional" tasks are exactly the foundation that supports a system's long-term stable operation and sustainable evolution.
