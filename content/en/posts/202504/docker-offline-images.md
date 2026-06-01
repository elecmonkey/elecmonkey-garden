---
title: "A Dumb Way to Solve DockerHub Access Problems"
date: "2025-04-11"
description: "The most useful episode of offline import: restricted network environments. It reminds me of installing snap programs on Ubuntu back then, which required a similar method."
tags: ["Docker", "DevOps"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

Sometimes inaccessible DockerHub images really become a roadblock. But for experimental needs on a personal computer, if you only want to download an image, you can solve it with a dumb method. Since restricted network scenarios do not only happen with DockerHub, I use this method quite often.

Of course, to practice this dumb method, we need a server that can access DockerHub.

## The Dumb Method

Pull the required image on a machine that can access DockerHub:

```bash
docker pull mongo:latest
```

Confirm that the image has been pulled successfully:

```bash
docker images | grep mongo
```

Export it with the `docker save` command:

```bash
docker save mongo:latest | gzip > mongo.tar.gz
```

You can also export it directly without compression:

```bash
docker save -o mongo.tar mongo:latest
```

Move the exported image to the local machine:

```bash
scp mongo.tar.gz user@target-machine:/path/to/destination/
```

Import the compressed image:

```bash
gunzip -c mongo.tar.gz | docker load
```

For the uncompressed image:

```bash
docker load -i mongo.tar
```

Verify whether the image was imported successfully:

```bash
docker images | grep mongo
```

## A Somewhat Automated Dumb Method

### Batch Script

When you need to process multiple images at once, you can use a script for batch operations:

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

On the target machine, you can use a similar script to import in batch:

```bash
#!/bin/bash
# 导入目录中的所有镜像
for tarfile in docker-images/*.tar.gz; do
  echo "导入 $tarfile..."
  gunzip -c $tarfile | docker load
done

echo "所有镜像导入完成"
```

### Split Transfer

For very large images, you can consider splitting the transfer:

Split the file on the server:

```bash
docker save huge-image:latest | gzip > huge-image.tar.gz
split -b 1G huge-image.tar.gz huge-image.part-
```

Reassemble and import it on the target machine:

```bash
cat huge-image.part-* > huge-image.tar.gz
gunzip -c huge-image.tar.gz | docker load
```

## Image Signature Verification

When there are absolute security requirements.

Calculate sha256 on the source machine:

```bash
sha256sum mongo.tar.gz > mongo.tar.gz.sha256
```

Verify on the target machine:

```bash
sha256sum -c mongo.tar.gz.sha256
```

But this dumb method is usually for personal development environments, so I guess most people are probably too lazy to verify signatures.
