import 'dotenv/config';
import { buildApp } from './app.js';
import { config } from './config/env.js';

const start = async () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  try {
    app = await buildApp();
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }

  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    app.log.info({ signal }, 'Shutting down server');
    try {
      await app.close();
      app.log.info('Server shutdown complete');
      process.exit(0);
    } catch (error) {
      app.log.error({ err: error }, 'Error while shutting down server');
      process.exit(1);
    }
  };

  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('unhandledRejection', (reason) => {
    app.log.error({ err: reason }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (error) => {
    app.log.error({ err: error }, 'Uncaught exception');
    void shutdown('SIGTERM');
  });

  try {
    await app.listen({
      port: config.server.port,
      host: config.server.host,
    });
    app.log.info(`Server listening on http://${config.server.host}:${config.server.port}`);
  } catch (err) {
    app.log.error({ err }, 'Failed to start server');
    process.exit(1);
  }
};

void start();
