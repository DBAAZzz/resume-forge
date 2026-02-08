import multipart from '@fastify/multipart';
import Fastify from 'fastify';

import { config } from './config/env.js';
import { registerRoutes } from './routes/index.js';

export const buildApp = async () => {
  const allowedOrigins = config.cors.origins;
  const allowAllOrigins = allowedOrigins.includes('*');
  const allowCredentials = config.cors.credentials;

  const app = Fastify({
    logger: {
      level: config.server.logLevel,
    },
    trustProxy: config.server.trustProxy,
  });

  app.addHook('onRequest', async (request, reply) => {
    const requestOrigin = request.headers.origin;
    const isAllowedOrigin =
      !requestOrigin || allowAllOrigins || allowedOrigins.includes(requestOrigin);

    if (!isAllowedOrigin) {
      reply.code(403);
      return reply.send({ error: 'Origin not allowed by CORS policy' });
    }

    if (requestOrigin) {
      reply.header('Access-Control-Allow-Origin', requestOrigin);
      reply.header('Vary', 'Origin');
    } else if (allowAllOrigins) {
      reply.header('Access-Control-Allow-Origin', '*');
    }

    if (allowCredentials) {
      reply.header('Access-Control-Allow-Credentials', 'true');
    }

    const requestHeaders = request.headers['access-control-request-headers'];
    reply.header(
      'Access-Control-Allow-Headers',
      typeof requestHeaders === 'string'
        ? requestHeaders
        : 'Content-Type, Authorization, X-Requested-With'
    );
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    reply.header('Access-Control-Max-Age', String(config.cors.maxAge));

    if (request.method === 'OPTIONS') {
      reply.code(204);
      return reply.send();
    }

    return undefined;
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
