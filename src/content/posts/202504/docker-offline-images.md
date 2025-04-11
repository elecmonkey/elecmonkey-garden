---
title: "解决无法访问 DockerHub 问题的笨办法一则"
date: "2025-04-11"
description: "离线导入最有用的一集：网络受限环境。让我想起来当年在 Ubuntu 安装 snap 程序也得用类似的办法。"
tags: ["Docker", "DockerHub"]
author: "Elecmonkey"
---

DockerHub 镜像无法访问有时候真的就成了拦路虎。不过对于个人电脑上实验性的需求来说，如果只是想下载一个镜像，完全可以通过笨办法解决。鉴于网络受限的场景不止出现在 DockerHub，这个办法我还挺常用。

当然，践行这个笨办法，我们需要有一台可以访问 DockerHub 的服务器。

## 笨办法

在能够访问 DockerHub 的机器上拉取所需镜像：
```bash
docker pull mongo:latest
```

确认镜像已经成功拉取：
```bash
docker images | grep mongo
```

使用 `docker save` 命令导出：

```bash
docker save mongo:latest | gzip > mongo.tar.gz
```

也可以不压缩直接导出：
```bash
docker save -o mongo.tar mongo:latest
```

把导出的镜像弄到本地来：
```bash
scp mongo.tar.gz user@target-machine:/path/to/destination/
```

导入压缩的镜像：
```bash
gunzip -c mongo.tar.gz | docker load
```

未压缩的镜像：
```bash
docker load -i mongo.tar
```

验证镜像是否已成功导入：
```bash
docker images | grep mongo
```

## 一定程度自动化的笨办法

### 批处理脚本

对于需要同时处理多个镜像的情况，可以使用脚本批量操作：

```bash
#!/bin/bash
# 需要导出的镜像列表
IMAGES=(
  "nginx:1.21"
  "mongo:5.0"
  "redis:6.2"
  "node:16-alpine"
)

# 创建存储目录
mkdir -p docker-images

# 批量导出
for img in "${IMAGES[@]}"; do
  # 替换冒号为下划线，方便文件命名
  filename=$(echo $img | tr ':' '_')
  echo "导出 $img 到 docker-images/${filename}.tar.gz"
  docker pull $img
  docker save $img | gzip > docker-images/${filename}.tar.gz
done

echo "所有镜像已导出到 docker-images/ 目录"
```

在目标机器上，可以使用类似的脚本批量导入：

```bash
#!/bin/bash
# 导入目录中的所有镜像
for tarfile in docker-images/*.tar.gz; do
  echo "导入 $tarfile..."
  gunzip -c $tarfile | docker load
done

echo "所有镜像导入完成"
```

### 分片传输

对于非常大的镜像，可以考虑分片传输：

在服务器上分割文件：
```bash
docker save huge-image:latest | gzip > huge-image.tar.gz
split -b 1G huge-image.tar.gz huge-image.part-
```

在目标机器上重组并导入：
```bash
cat huge-image.part-* > huge-image.tar.gz
gunzip -c huge-image.tar.gz | docker load
```

## 镜像签名验证

当对安全性有绝对的要求的时候。

在源机器上计算 sha256 ：
```bash
sha256sum mongo.tar.gz > mongo.tar.gz.sha256
```
在目标机器上验证：
```bash
sha256sum -c mongo.tar.gz.sha256
```

不过这个笨办法应该一般都是个人开发环境用，估计大部分人应该是懒得验证签名的。