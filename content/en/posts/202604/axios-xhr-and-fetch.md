---
title: "Some Thoughts on the Axios 202603 Poisoning Incident: CI Best Practices, Supply Chain Security, and Selection Reflections"
date: "2026-04-04"
description: "The second half seems to go off topic... drifting into reflections on choosing network request libraries, from Axios to the Fetch API"
tags: ["Axios", "npm", "pnpm", "Web Security", "CI/CD"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

> Update: The person whose account was stolen reviewed the compromise on GitHub: [https://github.com/axios/axios/issues/10636#issuecomment-4180237789](https://github.com/axios/axios/issues/10636#issuecomment-4180237789)
> In short, it was entirely social engineering.
>
>
> Translation of the original text:
>
> They tailored the whole process to my situation, specifically as follows:
>
> - They contacted me while impersonating the founder of a company, cloning not only the founder's appearance but also the company itself.
> - They then invited me into a real Slack workspace. The workspace used the company's branding, and the name was very convincing. The Slack workspace was designed very carefully. They had dedicated channels for sharing LinkedIn posts. I guess those LinkedIn posts would eventually be posted on the company's real account, but the overall effect was extremely realistic. They even created some fake accounts that I suspect represented members of the company's team and some other open-source software maintainers.
> - They scheduled a meeting with me for communication. The meeting was held on Microsoft Teams. The attendees appeared to be a group of people.
> - The meeting pointed out that something on my system was outdated. I thought it was related to Teams, so I installed the missing component, only to find out that it was a remote access Trojan (RAT).
> - Everything was arranged in an orderly way, looked legitimate, and was handled professionally.

## The Axios Poisoning Incident

On March 31, 2026 UTC, the axios npm package suffered a poisoning incident. The attacker hijacked an account belonging to a maintainer with publishing permission and quietly published two infected versions, `axios@1.14.1` and `axios@0.30.4`. This was an extremely typical supply-chain attack case in the JS ecosystem. From the publication of the poisoned dependency to its removal by npm officials, the whole incident window was about three hours.

The attack method was "dependency poisoning". The attacker did not modify Axios code, but added an npm package disguised as a normal package as a dependency, and then executed malicious code from that package's postinstall script. axios is a package with enormous download volume. According to npm data, the malicious dependency had 276,209 weekly downloads. npm has now removed it and published a placeholder package to avoid greater impact.

Considering axios's position in the JavaScript ecosystem, if anyone upgraded dependencies during the window, or created a new project / installed dependencies for a project without a lockfile, this attack was very likely to steal sensitive information from some developers' local machines. For local machines

The recently popular openclaw also has axios in its dependency chain:

```bash
openclaw
└─ @line/bot-sdk@10.6.0
   └─ axios@1.13.6
```

## CI Environments and Production Environments Must Be Isolated

### Use pnpm

pnpm v10 does not automatically execute dependency postinstall scripts by default. The official recommendation is also to allow build scripts only for whitelisted dependencies, rather than turning them back on globally. If pnpm v10 had been used at the time of the incident, with the default configuration kept, without adding the relevant dependency to the whitelist allowed to execute scripts and without globally allowing build scripts, then the most critical postinstall malicious execution step in this attack would probably have been blocked.

There is no need to repeat pnpm's other benefits: noticeably faster dependency resolution, disk-space savings through symbolic links, and so on.

### Isolate CI and Production Environments

I once participated in maintaining a project where, whenever the code was updated, the production environment was updated by running `git pull` on the production server and then rebuilding with `npm run build`. Of course, this had something to do with missing infrastructure and the network topology in that environment, but doing it this way was indeed quite absurd. That project was still using npm at the time, so the risk in this attack would have been quite high.

### Commit the lockfile to the Git Repository

First, as everyone knows, the version you write in `package.json` is not necessarily the version that gets installed. Because of SemVer, most projects declare dependency versions within a range. A version number starting with `^` means it is fine as long as the major version is the same, while a version number starting with `~` means the first two parts are the same. In other words, if you write `^1.14.0` in `package.json`, dependency tree resolution will install the latest version under `1.*.*`. Second, pinning the version number exactly by avoiding `^` and `~` still does not lock all dependency versions. As in the OpenClaw example above, you do not only have your own dependencies; your dependencies have their dependencies, and your dependencies' dependencies have their dependencies...

These two points explain why lockfiles exist: they record an exact, reproducible dependency tree, rather than a vague range under SemVer. Whether it is npm or pnpm, and I guess yarn as well, the lockfile takes priority when it exists. If the lockfile has already been committed to the Git repository, then when dependencies are installed in CI, unless the lockfile is deliberately deleted, they will not be upgraded to the poisoned versions.

In CI environments, people usually run:

```bash
pnpm i --frozen-lockfile
```

This forcibly requires pnpm not to re-resolve the dependency tree, improving security.

Besides security, here are two more reasons to commit the lockfile to the Git repository:

 - Improve CI speed by saving the time needed to re-resolve the dependency tree
 - Reproduce the same results across different environments and avoid bizarre bugs

Of course, of course, I only want to see one lockfile in a repository. Who understands how I feel when I see `package-lock.json`, `pnpm-lock.yaml`, and `yarn.lock` all in the same repo... (Actually, my reaction was that I should submit another `bun.lock` too x

### Should Dependency Versions Be Pinned in package.json?

Third-party libraries or frameworks that pursue security may pin dependency versions. Personally, I think that for business projects, when lockfiles are used correctly, the benefit of pinning dependency versions is limited. Of course, I do not think there is any obvious downside either. If a project has special security requirements or is extremely sensitive to risk, a more meaningful security option may be to introduce a dependency review mechanism during updates while minimizing the number of third-party dependencies as much as possible.

## Supply-Chain Security and Reflections on Choosing Network Request Libraries

XMLHttpRequest, abbreviated below as XHR, was first introduced as a proprietary API in Internet Explorer 5, opening a new era called AJAX (Asynchronous JavaScript and XML). XHR was later adopted by the W3C standard and became a standard browser feature.

But you can tell from the name that the XHR API design is extremely inelegant. We still do not know how obsessed Microsoft was with `.xml` back then. Callback hell is also part of its "inelegance", although this was not a problem unique to XHR. Because it was standardized early enough, however, browser compatibility is surprisingly good. From another perspective, XHR itself is powerful and complete enough, so what we actually lacked was only a wrapper layer to make our network requests elegant.

> Have a taste.
>
> ```javascript
> function getUser() {
>   const xhr = new XMLHttpRequest();
>
>   xhr.open("GET", "/api/user?id=123", true);
>
>   xhr.onreadystatechange = function () {
>     if (xhr.readyState === 4) {
>       if (xhr.status >= 200 && xhr.status < 300) {
>         const data = JSON.parse(xhr.responseText);
>         console.log("成功:", data);
>       } else {
>         console.error("请求失败:", xhr.status, xhr.statusText);
>       }
>     }
>   };
>
>   xhr.onerror = function () {
>     console.error("网络错误");
>   };
>
>   xhr.send();
> }
> ```

And so Axios appeared. As a lightweight HTTP client library, Axios provides a Promise-based API and supports both browser and Node.js environments. Its design goal is to provide a simpler and easier-to-use interface, while also offering additional features such as request and response interceptors, automatic JSON data transformation, request cancellation, and so on.

In 2015, around the same time as ECMAScript, the Fetch API entered our Web API specifications. More than ten years have passed, and the Fetch API has become standard equipment for modern Web development and one of the most widely supported APIs. On the other hand, in large projects, customization needs are increasing, many of them perhaps due to code style requirements or strange agreements with backend teams. Teams usually build a unified HTTP abstraction layer anyway, so much of the "out-of-the-box value" Axios offered back then has now been partly swallowed by Fetch plus in-house wrappers. Modern large frontend projects often already have an internal unified request layer, with many custom needs such as snake_case <-> camelCase conversion, auth header injection, error normalization, business code handling, and more. In these scenarios, some Axios features become less attractive. Except for a very small number of scenarios where the Fetch API is still not fully capable because of its abstraction level, most of the time we can accumulate the abstraction inside the project or internal tooling projects. Using Axios may instead bring heavier runtime complexity: we are wrapping an already heavy wrapper layer.

Unfortunately, almost all production projects I can access are still using Axios, and some of them were even technical choices I made myself. This is probably the power of historical inertia. I currently have no motivation to migrate them.

As for supply-chain security, reducing one dependency is always helpful for security, right?
