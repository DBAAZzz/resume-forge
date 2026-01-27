import Fastify from 'fastify';
import { registerRoutes } from './routes/index.js';

export const buildApp = async () => {
  const app = Fastify({
    logger: true,
  });

  // Register all routes
  await registerRoutes(app);

  return app;
};
