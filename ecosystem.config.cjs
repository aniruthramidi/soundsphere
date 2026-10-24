/**
 * SoundSphere PM2 Production Process Manager Configuration
 * Ensures automated restart, memory leak prevention, and structured log rotation.
 */

module.exports = {
  apps: [
    {
      name: 'soundsphere-api',
      script: './server/server.js',
      instances: 1, // Node:sqlite is single-process embedded SQLite
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
        DB_PATH: './server/data/soundsphere.db',
        CORS_ORIGIN: '*'
      },
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    }
  ]
};
