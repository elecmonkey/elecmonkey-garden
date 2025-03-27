module.exports = {
  apps: [
    {
      name: 'elecmonkey-garden',
      cwd: '.',  // 设置工作目录
      script: 'node',  // 使用 pnpm 来运行
      args: '.next/standalone/server.js',  // 运行 start 命令
      instances: 2,               // 使用2个实例(双核服务器)
      exec_mode: 'cluster',       // 使用集群模式
      autorestart: true,
      watch: false,
      max_memory_restart: '768M', // 限制内存使用
      kill_timeout: 5000,         // 优雅退出等待时间
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        PATH: process.env.PATH  // 继承系统 PATH
      }
    }
  ]
};