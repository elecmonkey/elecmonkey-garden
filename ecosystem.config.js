module.exports = {
  apps: [
    {
      name: 'elecmonkey-garden',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 2,               // 使用2个实例(双核服务器)
      exec_mode: 'cluster',       // 使用集群模式
      autorestart: true,
      watch: false,
      max_memory_restart: '768M', // 限制内存使用
      kill_timeout: 5000,         // 优雅退出等待时间
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};