module.exports = {
  apps: [
    {
      name: 'StentricRanked',
      script: 'index.js',
      watch: true,
      ignore_watch: ['node_modules'],
      instances: 1,
      autorestart: true,
      max_memory_restart: '100G',
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
