const requestedInstances = Number(process.env.PM2_INSTANCES ?? '1');
const instances = Number.isFinite(requestedInstances) && requestedInstances > 1 ? requestedInstances : 1;
const execMode = instances > 1 ? 'cluster' : 'fork';

module.exports = {
  apps: [
    {
      name: 'resume-forge-server',
      cwd: __dirname,
      script: 'dist/index.js',
      instances,
      exec_mode: execMode,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production',
        SERVER_HOST: '0.0.0.0',
        SERVER_PORT: '3000',
      },
    },
  ],
};
