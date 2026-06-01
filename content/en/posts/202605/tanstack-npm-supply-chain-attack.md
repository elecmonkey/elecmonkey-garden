---
title: "A Review of the TanStack npm Package Poisoning via CI Cache"
date: "2026-05-12"
description: "Isolation between different trust levels failed in an unexpected place. Supply-chain security in the frontend ecosystem still has a long way to go."
tags: ["npm", "pnpm", "Web Security", "CI/CD", "Supply Chain Security"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

## Incident Overview

On May 11, 2026 UTC, a large number of poisoned `@tanstack/*` packages were published to npm: 42 packages, 84 malicious versions, lasting for about six minutes. The incident affected almost all core packages in the TanStack ecosystem, including `@tanstack/react-query`, `@tanstack/router`, and `@tanstack/table`.

In 2024, the core Rspack package was poisoned because a maintainer token with publishing permission was stolen. In 2025, a batch of well-known packages such as chalk and debug were poisoned; the investigation concluded that a maintainer mistakenly authorized an npm account 2FA reset and then had the account stolen through phishing. In March 2026, because I had not updated this blog for a long time, this was even just two posts before my current one, [Some Thoughts on the Axios 202603 Poisoning Incident: CI Best Practices, Supply Chain Security, and Selection Reflections](https://www.elecmonkey.com/blog/axios-xhr-and-fetch), the author's PC was infected with malware through social engineering, or in plain words, he was tricked into installing it.

The biggest difference in this incident seems to be that **the attacker did not steal any npm token**. These malicious versions were "legitimately" published to npm by TanStack's own official CI release pipeline. Trusted Publishing, GitHub OIDC, and SLSA provenance all looked valid from npm's server side. This is not a problem that can be solved by continuing to strengthen npm's security model alone. The measures repeatedly emphasized in the npm ecosystem over the past two years, such as replacing manual tokens with Trusted Publishing and verifying provenance, all strengthen the security model on the npm registry side. In the face of this attack, they all failed.

## Attack Chain Review

This section is basically a translated summary of [Snyk: TanStack npm Packages Hit by Mini Shai-Hulud](https://snyk.io/blog/tanstack-npm-packages-compromised/).

### Step 1: fork PR + `pull_request_target`

The attacker forked `TanStack/router`, renamed the fork to something that looked like another project, `zblgg/configuration`, reducing the chance of being noticed, then submitted malicious code and opened a PR.

This PR triggered the `pull_request_target` workflow in `bundle-size.yml`. The problem here was fatal: `pull_request_target` runs in the **target repository context**, with the main repository's permissions and cache scope. This workflow then checked out the PR code and ran `pnpm install` and build, which meant it ran code from the attacker's fork with the main repository's privileges.

### Step 2: Poisoning the pnpm store in GitHub Actions cache

pnpm has a global content-addressable store, and CI usually caches this store to speed up installs. After the attacker's code ran in the PR workflow, it wrote malicious content into the pnpm store and made it match the cache key that would later be used by the official release workflow. At the end of the PR workflow, the post-step of `actions/cache` saved this poisoned store.

### Step 3: Fake cleanup, cache retained

The attacker then force-pushed the PR back to a state close to `main`, closed it, and deleted the branch. On the surface, the PR was gone, the diff was gone, and the branch was gone. But in reality, the poisoned cache was quietly lying inside GitHub Actions cache.

### Step 4: Official release workflow restores the poisoned cache

Later, maintainers merged a normal PR into `main`, triggering `release.yml`. This workflow was trusted, came from the main repository, and had the OIDC permission required by npm Trusted Publishing. But when it restored the cache, what it got was the malicious pnpm store written earlier by the PR workflow.

### Step 5: Extracting the OIDC token from runner memory and publishing directly

After the malicious code executed inside the trusted release runner, it did not go through the normal publish step, which was even skipped because tests failed. Instead, it located the `Runner.Worker` process, read Linux `/proc/.../mem`, extracted the OIDC token directly from memory, and sent POST requests to `registry.npmjs.org` to publish malicious packages.

In the end, 84 malicious versions across 42 packages were published. When users ran `npm install`, `pnpm install`, or `yarn install`, lifecycle scripts triggered the payload, stealing `.env`, GitHub tokens, npm tokens, CI/CD secrets, cloud credentials, and attempting lateral movement.

## Some Thoughts

If we say TanStack itself made a security mistake in this attack, it was that in its GitHub Actions configuration, **CI cache was reused across trust boundaries**. The attacker poisoned cache in a PR workflow that **should have been low-trust**, and that cache could then be restored and executed in a higher-trust release workflow. This incident will first of all alert the developer community to similar issues, and all behaviors related to "running CI for PRs" are being reexamined.

![Rsbuild updates its GitHub Actions workflow yaml file](https://images.elecmonkey.com/articles/202605/rsbuild-actions-update.png)

> I watched Rstack projects delete a whole bunch of workflow files with my own eyes...

For many projects, community PR CI has already changed from automatic execution to manual triggering after maintainer review.

The open-source community is the frontline of defending against npm supply-chain attacks. Each of us is part of the community and also receives contributions from the community. This structure is inherently fragile from a security perspective. GitHub Actions, as infrastructure heavily relied on by the open-source community, naturally needs to think more about security and use its official position to promote mandatory security measures or recommended best practices.

Secondly, community projects can check whether they have similar cache reuse across different trust levels. Or, going one step further, besides cache, are there other attack surfaces that are equally hidden?

> My brain is not working well. I have not thought of any yet...

On the consumption side, valuable projects can also pause slightly in their update strategy. For example, every time they update minor versions, they do not update all the way to the latest immediately, but only update to versions that have been released for more than three days. This introduces almost no meaningful lag, since most business projects update dependencies far less frequently than this. In recent npm poisoning incidents, the community and security researchers responded very quickly, and the npm security team also cooperated immediately to delete tarballs. So "waiting a little" is a very good security strategy.

Taking `taze`, the `package.json` version update tool I use most often, as an example, it provides this parameter:

```bash
taze --maturity-period 3
```

In addition, pnpm also has a cooling-off configuration, applying this "cooling" from the package manager side. In `pnpm-workspace.yaml`:

```yaml
minimumReleaseAge: 1440
```

For internal packages, emergency security fixes, and similar scenarios, pnpm also provides exclusions:

```yaml
minimumReleaseAge: 1440
minimumReleaseAgeExclude:
  - "@your-scope/*"
```

In pnpm v11, this configuration is already enabled by default as `1440`, one day. This is also a patch that pnpm has applied to the frontend supply chain from its own ecological position.

## References

- [TanStack official incident postmortem](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem)
- [Snyk: TanStack npm Packages Hit by Mini Shai-Hulud](https://snyk.io/blog/tanstack-npm-packages-compromised/)

> Three days earlier I had just submitted my first PR to the TanStack ecosystem. As a long-time TanStack Query user, I hope the TanStack ecosystem goes smoothly...
