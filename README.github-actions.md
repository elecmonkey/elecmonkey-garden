# GitHub Actions 自动部署配置

本项目使用 GitHub Actions 自动部署到服务器，使用 pnpm 和 PM2 进行构建和进程管理。

## 工作流程说明

当代码推送到 `main` 分支或手动触发工作流时，GitHub Actions 会：

1. 在云端环境中构建项目
2. 通过 SSH 连接到服务器
3. 在服务器上拉取最新代码
4. 使用 pnpm 安装依赖并构建项目
5. 使用 PM2 重启应用

## 必要的 Secrets 配置

需要在 GitHub 仓库的 Settings -> Secrets and variables -> Actions 中配置以下密钥：

| 名称 | 说明 | 示例 |
|-----|------|------|
| `SSH_HOST` | 服务器 IP 地址或域名 | `123.456.789.0` 或 `example.com` |
| `SSH_PORT` | SSH 端口 | `22` |
| `SSH_USERNAME` | SSH 用户名 | `deploy` |
| `SSH_PRIVATE_KEY` | SSH 私钥 | 整个私钥内容，包括开头和结尾 |
| `REMOTE_TARGET_DIR` | 服务器上项目目录的绝对路径 | `/var/www/elecmonkey-garden` |

## 设置步骤

1. **生成 SSH 密钥对**（如果没有）：
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy"
   ```

2. **添加公钥到服务器**：
   ```bash
   # 复制公钥内容
   cat ~/.ssh/id_ed25519.pub
   
   # 在服务器上，将公钥添加到 authorized_keys
   echo "复制的公钥内容" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **在 GitHub 中添加私钥和其他 Secrets**：
   - 进入仓库 Settings -> Secrets and variables -> Actions
   - 添加上述表格中列出的所有密钥

4. **准备服务器环境**：
   ```bash
   # 安装 pnpm
   curl -fsSL https://get.pnpm.io/install.sh | sh -

   # 安装 PM2
   npm install -g pm2
   
   # 初始化项目目录
   mkdir -p /var/www/elecmonkey-garden
   cd /var/www/elecmonkey-garden
   git clone https://github.com/elecmonkey/elecmonkey-garden.git .
   ```

5. **测试配置**：
   - 手动触发工作流：在仓库的 Actions 选项卡中，选择 "部署到服务器" 工作流，点击 "Run workflow"

## 故障排除

- **部署失败**：检查 GitHub Actions 日志以查看详细的错误信息
- **连接问题**：确保防火墙允许从外部 IP 地址访问 SSH 端口
- **权限问题**：确保 SSH 用户有权限访问和修改项目目录
- **回滚部署**：如果需要回滚，可以使用备份的 `.next` 目录恢复应用
  ```bash
  # 列出可用备份
  ls -l ~/backups
  
  # 恢复备份
  cp -r ~/backups/.next_YYYYMMDD_HHMMSS /var/www/elecmonkey-garden/.next
  ``` 