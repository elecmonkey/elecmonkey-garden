# ElecMonkey Garden

ElecMonkey的个人数字花园，基于 [Next.js](https://nextjs.org) 开发中。

## 技术栈

- **框架**: Next.js 15
- **前端**: React 19
- **样式**: TailwindCSS 4
- **内容管理**: MDX + Markdown
- **语法高亮**: React Syntax Highlighter + Rehype

## 本地开发

1. 克隆项目并安装依赖:

```bash
git clone <仓库地址>
cd <项目文件夹>
npm install
# 或
yarn install
# 或
pnpm install
```

2. 启动开发服务器:

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 项目编译

要为生产环境编译项目，运行以下命令：

```bash
pnpm build
```

编译完成后，可以运行生产环境服务器：

```bash
pnpm start
```

## 服务端部署

### Linux 服务器部署（使用 PM2）

1. 确保服务器上已安装 Node.js (推荐 v20+), pnpm 和 pm2

2. 克隆代码并安装依赖:

```bash
git clone <仓库地址> /path/to/your/app
cd /path/to/your/app
pnpm install
```

3. 构建应用:

```bash
pnpm build
```

4. 使用 PM2 启动服务:

```bash
pm2 start npm --name "elecmonkey-garden" -- start
```

5. 设置开机自启:

```bash
pm2 startup
pm2 save
```

6. 查看运行状态:

```bash
pm2 status
pm2 logs elecmonkey-garden
```

7. 更新部署:

```bash
cd /path/to/your/app
git pull
pnpm install
pnpm build
pm2 restart elecmonkey-garden
```

### PM2 配置文件

使用以下命令启动：

```bash
pm2 start ecosystem.config.js
```

### Nginx 反向代理配置

通常建议在前端配置 Nginx 作为反向代理：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 环境变量配置

使用环境变量进行配置。创建 `.env.local` 文件并设置以下变量：

```
# 站点 URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# 分析工具 (可选)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

对于生产环境，可以在 PM2 的配置文件中设置环境变量。

## 内容管理

博客文章存储在 `src/content/posts` 目录中，使用 Markdown 格式。每篇文章需要包含以下前置元数据：

```md
---
title: '文章标题'
date: 'YYYY-MM-DD'
description: '文章简短描述'
tags: ['标签1', '标签2']
---

文章内容...
```

## 自定义与扩展

### 主题定制

修改 `tailwind.config.js` 文件来自定义主题颜色、字体等。

### 添加新页面

在 `src/app` 目录下创建新目录和 `page.tsx` 文件，遵循 Next.js App Router 的约定。

## 许可证

MIT