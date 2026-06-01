---
title: 'Pitfalls in Configuring GitHub Actions for a Small Frontend Project'
date: '2025-03-26'
description: 'Also known as: a frontend developer misled by large models decides to save their own CI/CD workflow (nope).'
tags: ['GitHub Actions', 'CI/CD', 'Next.js', 'DevOps']
author: 'Elecmonkey'
---

> This article was translated by AI and has not been manually reviewed.

Automated CI/CD now feels like an indispensable part of Web projects. The main reason seems to be that the process from writing code to production has become increasingly complex. If we were still in the era where you wrote some code, zipped a bunch of `.php` files, threw them onto a server, and it ran, probably not many people would be motivated to configure automated CI/CD, and there would not be this pile of fancy CI/CD tools.

This site is a small project built with Next.js. I naturally asked AI to write a GitHub Actions YAML configuration file. Based on my usual feeling, for a currently popular framework plus the simplest architecture logic, all kinds of large models can often write out so-called "best practices" in one shot. After all, they have read far more code than I have.

It wrote one. I ran it. It seemed usable, but the workflow felt strange. Looking carefully, dear Claude had me first build once on GitHub's build server, run tests (but I had not written any test code, so the tests tested nothing), then log in to the target environment server and run `git clone`, `pnpm install`, `pnpm build` again... I felt I did not quite understand this operation. At my request, Teacher Claude quickly changed it to package the compiled result from GitHub Actions and upload it to the deployment server through SSH. I ran it once, and hey, it worked, so I did not pay much more attention.

Later I found that the SSH file transfer step was sometimes terrifyingly slow. Although GitHub Actions servers are in the US, how large could this build output be that it cannot finish in ten or twenty minutes? I added an `ls -lh` in the yaml to see how large the package was. Good grief: a Next.js project with almost no content, only a few pages and components, was over 100 MB. I suddenly understood why Claude wanted to rebuild on the target server. In the time it takes to transfer this 100+ MB package, the target server could already pull the sub-1 MB code repository and install dependencies from a mirror source. It seems I wrongly blamed Teacher Claude...

Ah... but I still feel that completely rebuilding on the server is inelegant and uncomfortable. Then I suddenly thought: why are the build artifacts of a few static pages so large? It turns out Next.js's build output is not that of a static framework. Frameworks like Astro compile pure static frontend html+css+javascript for me. If I can directly deploy to object storage, why would I need a server with a Node environment? Next.js applications have production dependencies.

Fine, the size is inflated by production dependencies. Mirror sites are everywhere, so let us not use precious trans-Pacific bandwidth for this pile of stuff.

So I commented out `pnpm install --prod --frozen-lockfile` running in the Actions ubuntu environment:

```shell
# 创建包含必要文件的部署目录
mkdir -p deploy

# 复制 Next.js 构建产物
cp -r .next deploy/

# 复制必要的文件
cp package.json pnpm-lock.yaml deploy/

# 复制其他必要的静态文件和配置
if [ -d "public" ]; then
cp -r public deploy/
fi

# 这样好吗？注释掉吧！这样好吗？注释掉吧！这样好吗？注释掉吧！
# cd deploy
# pnpm install --prod --frozen-lockfile
# cd ..
tar -czf deploy.tar.gz deploy

ls -lh deploy.tar.gz
```

Then I added it back in the remote server SSH part of the YAML:

```shell
rm -rf /tmp/deploy
tar -xzf /tmp/deploy.tar.gz -C /tmp

rm -rf .next package.json pnpm-lock.yaml
cp -a /tmp/deploy/. ./

echo "在服务器端安装生产依赖..."
pnpm install --prod --frozen-lockfile
```

Hmm, looks good. The resulting `tar.gz` was only 20 MB, so that should be it... Wait, no, it cannot be like this. My intuition told me these little things should not be 20 MB. So I looked at what was inside the `.next` directory:

- Cache/temporary files

```txt
.next/cache/ - 构建缓存
.next/trace
.next/analyze
```

These things are not needed in production!

By the way, the results of any two compilations are not different in every file. If each time we could diff the changes and upload only what changed, well, we all think of `rsync`. But there is actually a small problem: compressed package transfer is not very diff-friendly. So which saves more traffic: the compression ratio from a package, or avoiding duplicate uploads of unchanged files? I guess for "continuous integration, continuous deployment" projects, the latter should be much more effective.

```shell
if rsync -avz --delete \
  --exclude='.next/cache/' \
  --exclude='.next/trace' \
  --exclude='.next/analyze' \
  -e "ssh -i ~/.ssh/id_rsa -o StrictHostKeyChecking=no" \
  ./deploy/ ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }}:/tmp/deploy/; then
  echo "✅ 文件传输成功！"
else
  echo "❌ 文件传输失败，退出代码: $?"
  exit 1
fi
```

Use `--exclude` to exclude development caches and debug files, and `--delete` to automatically delete extra files in the server directory.

```shell
du -sh deploy/
```

Output:

```txt
275M	deploy/
```

But `rsync` told me:

```txt
sent 1,403,633 bytes  received 3,500 bytes  187,617.73 bytes/sec
total size is 5,833,900  speedup is 4.15
```

Oh my god. The directory without production dependencies was still 275 MB. I want to know how large the package was when I initially transferred the complete environment several times in Actions. After excluding things like `cache`, the size was only 5 MB, and the actual transferred increment was only a bit over 1 MB...

Ah, thinking back to the past when I stared at the screen waiting for Actions for over ten minutes... Let Teacher Claude, the protagonist of this article, summarize:

1. **Do not blindly trust "best practices" generated by models**: even powerful large models may provide only a generic solution, not necessarily one suitable for your specific scenario. You need to understand the purpose of every step and not copy-paste mindlessly.

2. **Understand the characteristics of your project's build artifacts**: different frontend frameworks produce very different build outputs. Isomorphic frameworks like Next.js are fundamentally different from pure static frameworks, and understanding these characteristics is crucial for optimizing deployment strategy.

3. **Choose the toolchain reasonably**: old tools like `rsync` have been popular for decades precisely because they solve real problems and perform well. When choosing tools, focus on their core advantages rather than chasing trends.

4. **Continuous optimization is worthwhile**: from the initial twenty minutes to the final dozens of seconds, every optimization brought obvious gains. For projects that need frequent deployment, this accumulated time saving is huge.
