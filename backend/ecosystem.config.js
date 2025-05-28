module.exports = {
  apps: [{
    name: 'rsi-admin-portal-api',
    script: 'uvicorn',
    args: 'app.main:app --host 0.0.0.0 --port 8000 --workers 2',
    interpreter: 'python',
    cwd: './backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      ENVIRONMENT: 'prod',
      CONNECTION_FILE: 'connection.json',
      USE_WINDOWS_AUTH: 'true',
      DOMAIN: 'RSI',
      PYTHONPATH: '.'
    },
    env_development: {
      NODE_ENV: 'development',
      ENVIRONMENT: 'dev',
      CONNECTION_FILE: 'connection.json',
      USE_WINDOWS_AUTH: 'true',
      DOMAIN: 'RSI',
      PYTHONPATH: '.'
    },
    log_file: './logs/pm2.log',
    out_file: './logs/pm2-out.log',
    error_file: './logs/pm2-error.log',
    time: true
  }]
};