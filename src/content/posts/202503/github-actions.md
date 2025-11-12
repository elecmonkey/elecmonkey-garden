---
title: '前端小项目的 GitHub Actions 配置爬坑记'
date: '2025-03-26'
description: '又名被大模型坑的前端开发者决心拯救自己的CI/CD工作流（bu。'
tags: ['GitHub Actions', 'CICD', 'Next.js', 'DevOps']
author: 'Elecmonkey'
---

自动化的 CI/CD 现在感觉起来已经成了 Web 项目必不可少的的一部分了。主要原因似乎可以算作从代码写好到生产环境的过程越来越复杂了。如果还是代码写好，一堆 `.php` 压缩一下丢到服务器里就跑的时代，估计没有太多人有动力去配置自动化的 CI/CD，也就不会有这一堆花里胡哨的 CI/CD 工具。

这个站点是一个 Next.js 构建的小项目。我还是很自然地让 AI 写了一个 GitHub Actions 的 YAML 配置文件。按我一贯的感觉，这种现在爆火的框架加上最简单的架构逻辑，各路大模型经常能一次性写出所谓「最佳实践」——毕竟它们读过的代码比我多多了。

写出来了，一跑，好像是能用，但是这个流程怎么感觉怪怪的呢？仔细一看，亲爱的 Claude 让我先在 GitHub 的构建服务器上 build 了一遍，跑了测试（但我并没有写任何测试代码，所以测试了个寂寞），然后登录到目标环境服务器重新 `git clone`、`pnpm install`、`pnpm build` 一通操作…… 我感觉我似乎不太理解这波操作。在我的要求下，Claude 老师很快改成了把 GitHub Actions 的编译结果打包，通过 SSH 上传到部署服务器上。跑了一遍，嘿，通的，就没再多管。

后面发现这个 SSH 传文件这一步有的时候慢得吓人。虽说 GitHub Actions 的服务器在美国，但是这编译结果得多大才能一二十分钟跑不完？在 yaml 里加个 `ls -lh` 看看这个包到底有多大，好家伙，一个没有啥内容、只有几个页面和组件的 Next.js 项目，100 多 MB。我突然明白 Claude 为啥要在目标服务器上重新 build 一遍了——有传这一百多 MB 包的时间，目标服务器早把不到 1 MB 的代码仓库 pull 下来，从镜像源把依赖装好了。看来错怪 Claude 老师了……

啊……不过我依然觉得在服务器上完全重新 build 感觉很不优雅，很不爽的同时突然想到，几个静态页面的构建产物为什么会这么大？原来 Next.js 它构建产物不是静态的框架的啊。 Astro 之类的框架给我编译出来纯静态的前端 html+css+javascript，那种直接搞个对象存储部署了为啥还需要一个有 Node 环境的服务器呢。Next.js 的应用是有生产环境依赖的。

好吧，体积被生产环境依赖撑起来了。镜像站哪儿都是，就不拿这堆玩意儿占用宝贵的中美海底电缆了（

遂注释掉在 Actions 的 ubuntu 环境下跑的 `pnpm install --prod --frozen-lockfile`：

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

在 YAML 的远程服务器 SSH 部分加回来再：

```shell
rm -rf /tmp/deploy
tar -xzf /tmp/deploy.tar.gz -C /tmp

rm -rf .next package.json pnpm-lock.yaml
cp -a /tmp/deploy/. ./

echo "在服务器端安装生产依赖..."
pnpm install --prod --frozen-lockfile
```

蒽 看着不错，打出来的 `tar.gz` 只有 20MB ，那就这样了…… 不对啊，不能这样。直觉告诉我我的这些破玩意儿也没有 20MB 大小。那看看 `.next` 目录里到底有些啥：

 - ​缓存/临时文件
```txt
.next/cache/ - 构建缓存
.next/trace
.next/analyze
```

这些东西生产环境也不需要啊！

顺便的顺便，其实任意两次编译出来的结果，并非每个文件都有差异。如果能每次都 diff 出差异来针对性的上传——好的，我们都会想到 `rsync` 。不过这其实有点问题，用压缩包传输就不太好 diff 了。所以究竟是压缩包的那点压缩量更能节省流量还是避免相同文件重复上传更能节省流量？我猜对于"持续集成、持续部署"的项目来说，应该是后者会效果显著一点。

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

通过 `--exclude` 参数排除开发缓存和调试文件，通过 `--delete` 参数可以自动删除服务器目录中多余的文件。

```shell
du -sh deploy/
```
输出：
```txt
275M	deploy/
```

但是 `rsync` 告诉我——
```txt
sent 1,403,633 bytes  received 3,500 bytes  187,617.73 bytes/sec
total size is 5,833,900  speedup is 4.15
```
沃德玛雅。不带生产环境依赖的目录还有275MB，我想知道我最开始带着完整环境几次 Actions 到底传了多大的包。排除掉 `cache` 之类的东西后大小仅仅 5MB ，实际传输增量仅 1MB 多。。。

啊想到自己盯着屏幕等十几分钟 Actions 的过往。。。请本文主角 Claude 老师来总结一下吧：

1. **不要盲目信任模型生成的"最佳实践"**：即使是强大的大模型，它们给出的方案也可能只是一种通用解决方案，而不一定适合你的具体场景。需要理解每一步操作的目的，不要无脑复制粘贴。

2. **了解项目的构建产物特性**：不同前端框架的构建产物差异很大。Next.js 这类同构框架与纯静态框架有本质区别，了解这些特性对优化部署策略至关重要。

3. **合理选择工具链**：`rsync` 这类老牌工具之所以能流行几十年，正是因为它们解决了实际问题且性能优异。在选择工具时，应该关注其核心优势而不是追逐新潮。

4. **持续优化是值得的**：从最初的二十分钟到最后的几十秒，每一步优化都带来了明显的收益。对于需要频繁部署的项目，这种积累的时间节省是巨大的。