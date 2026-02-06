import multipart from '@fastify/multipart';
import Fastify from 'fastify';

import { registerRoutes } from './routes/index.js';

export const buildApp = async () => {
  const app = Fastify({
    logger: true,
  });

  // Register multipart plugin for file uploads
  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    },
  });

  // Register all routes
  await registerRoutes(app);
  await app.register(
    async (apiApp) => {
      await registerRoutes(apiApp);
    },
    { prefix: '/api' }
  );

  return app;
};
