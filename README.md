# ElecMonkey Garden

ElecMonkey的个人数字花园，基于 [Next.js](https://nextjs.org) 开发中。

## 技术栈

- **框架**: Next.js 15
- **前端**: React 19
- **样式**: TailwindCSS 4
- **内容管理**: MDX + Markdown
- **代码处理**: React Syntax Highlighter（基于 PrismJS）
- **图表渲染**: Mermaid（客户端渲染）
- **响应式设计**: 针对移动设备和桌面设备优化
- **部署**: PM2 + Nginx

## 设计特点

### 内容渲染

- **Markdown 渲染**: 使用 react-markdown 进行 Markdown 渲染
- **代码语法高亮**: 支持多种编程语言的自动语法高亮
- **图表支持**: 通过 Mermaid 集成支持流程图、时序图、类图等多种图表
- **响应式图片**: 自动优化图片显示效果
- **暗色模式**: 支持明暗主题切换，代码块和图表自动适应主题

### 性能优化

- **客户端组件**: 使用 Next.js 的客户端组件实现复杂交互
- **动态导入**: 使用 dynamic import 减小初始加载体积
- **懒加载**: 对重型组件（如代码高亮和图表）使用懒加载

### 文件组织

- **按月归档**: 博客文章按月份组织，便于管理和访问
- **元数据支持**: 所有内容支持丰富的元数据（标题、日期、标签等）

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

### 不使用 PM2 的部署方法

如果您不想使用 PM2，也可以通过以下方式部署：

#### 方法1：使用 systemd 服务（推荐）

1. 创建 systemd 服务文件:

```bash
sudo nano /etc/systemd/system/elecmonkey-garden.service
```

2. 添加以下内容（根据您的实际路径和用户进行修改）:

```ini
[Unit]
Description=ElecMonkey Garden Next.js App
After=network.target

[Service]
Type=simple
User=<your-username>
WorkingDirectory=/path/to/your/app
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

3. 启用并启动服务:

```bash
sudo systemctl enable elecmonkey-garden
sudo systemctl start elecmonkey-garden
```

4. 查看服务状态:

```bash
sudo systemctl status elecmonkey-garden
sudo journalctl -u elecmonkey-garden
```

#### 方法2：使用 screen 或 tmux（简单方案）

1. 安装 screen 或 tmux:

```bash
# 使用 screen
sudo apt install screen

# 或使用 tmux
sudo apt install tmux
```

2. 创建一个新会话并启动应用:

```bash
# 使用 screen
screen -S garden
cd /path/to/your/app
npm start

# 使用 Ctrl+A 然后按 D 分离会话
```

或

```bash
# 使用 tmux
tmux new -s garden
cd /path/to/your/app
npm start

# 使用 Ctrl+B 然后按 D 分离会话
```

3. 重新连接到会话:

```bash
# screen
screen -r garden

# tmux
tmux attach -t garden
```

#### 方法3：使用 nohup（简易方法）

```bash
cd /path/to/your/app
nohup npm start > app.log 2>&1 &
```

这会在后台运行应用并将输出重定向到 app.log 文件。

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

### Mermaid 图表使用方法

在 Markdown 中使用 Mermaid 图表，只需要创建一个 `mermaid` 代码块：

```markdown
```mermaid
graph TD
    A[开始] --> B{判断}
    B -->|条件1| C[处理1]
    B -->|条件2| D[处理2]
    C --> E[结束]
    D --> E
```

支持的图表类型包括：流程图、时序图、类图、甘特图等。

## 自定义与扩展

### 主题定制

修改 `tailwind.config.js` 文件来自定义主题颜色、字体等。

### 添加新页面

在 `src/app` 目录下创建新目录和 `page.tsx` 文件，遵循 Next.js App Router 的约定。