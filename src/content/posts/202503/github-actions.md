---
title: '前端小项目的 GitHub Actions 配置爬坑记'
date: '2024-03-26'
description: '对大模型太不信任导致的惨剧❌ 一个前端开发者与 GitHub Actions 斗智斗勇的故事✅'
tags: ['GitHub Actions', 'CI/CD', 'Next.js', 'DevOps', '运维', '前端工程化']
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

蒽 看着不错，打出来的 `tar.gz` 只有 20MB 左右大小了。就这样吧先。