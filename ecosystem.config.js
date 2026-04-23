// PM2 Ecosystem Configuration
// Fiyat Takip Platformu - Production

module.exports = {
  apps: [
    {
      name: "fiyattakip",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/var/www/fiyattakip",
      instances: "max", // CPU çekirdeği sayısı kadar instance
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_file: ".env.production",
      error_file: "/var/log/fiyattakip/error.log",
      out_file: "/var/log/fiyattakip/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // Graceful restart
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
