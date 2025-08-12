module.exports = {
  apps: [
    {
      name: 'addautotraining',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=4096',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Health check
      health_check_grace_period: 3000,
      // Auto restart settings
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      // Graceful shutdown
      shutdown_with_message: true,
      // Environment specific settings
      instance_var: 'INSTANCE_ID'
    }
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:username/addautotraining.git',
      path: '/var/www/addautotraining',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',
      'pre-setup': 'sudo apt-get update && sudo apt-get install git nodejs npm mongodb -y'
    },
    
    staging: {
      user: 'deploy',
      host: ['your-staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:username/addautotraining.git',
      path: '/var/www/addautotraining-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging && pm2 save',
      'pre-setup': 'sudo apt-get update && sudo apt-get install git nodejs npm mongodb -y'
    }
  }
};
