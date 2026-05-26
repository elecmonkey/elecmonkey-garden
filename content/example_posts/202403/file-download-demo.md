---
title: '文件下载功能测试'
date: '2024-03-24'
description: '这篇文章展示了如何在 Markdown 中使用文件下载卡片'
tags: ['Markdown', '文件下载', '技术演示']
---

# 文件下载功能演示

这篇文章演示了如何在 Markdown 中使用文件下载卡片。只需要使用特殊的 `file` 代码块语法，就可以创建美观的文件下载卡片。

## 基本用法

文件下载卡片需要提供以下信息（每行一项）：
1. 文件名（带扩展名）
2. 文件类型（用于显示对应图标）
3. 下载链接
4. 文件描述
5. 文件大小

下面是几个示例：

### PDF 示例

```file
example-document.pdf
pdf
https://example.com/files/example-document.pdf
这是一个演示用的 PDF 文档，展示了文件下载功能
2.3MB
```

### 图片示例

```file
sample-image.png
png
https://example.com/images/sample-image.png
高清示例图片，分辨率为 1920x1080
843KB
```

### 代码示例

```file
project-source.zip
zip
https://github.com/username/repo/archive/refs/heads/main.zip
项目源代码归档，包含完整的源代码和文档
5.7MB
```

### 文档示例

```file
user-manual.docx
word
https://example.com/docs/user-manual.docx
用户手册，包含详细的操作说明和常见问题解答
1.8MB
```

## 支持的文件类型

目前支持的文件类型图标包括：
- pdf - PDF 文档
- image, png, jpg, jpeg, gif, webp - 图片文件  
- zip, rar, 7z, tar, gz - 压缩文件
- doc, docx, word - Word 文档
- xls, xlsx, excel - Excel 表格
- ppt, pptx, powerpoint - PowerPoint 演示文稿
- md, markdown - Markdown 文档
- json - JSON 数据文件
- html - HTML 网页文件
- css - CSS 样式表
- js, ts, jsx, tsx, py, java, c, cpp, go, rust, code - 代码文件
- txt, text - 文本文件
- 其他类型会显示通用文件图标

## 使用说明

1. 文件下载功能通过外部链接实现，文件不存储在本项目中
2. 点击下载按钮将直接跳转到指定的下载链接
3. 如果你需要提供本地文件下载，可以将文件上传到文件托管服务（如 GitHub、Dropbox 等）并使用共享链接 