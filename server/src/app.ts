import multipart from '@fastify/multipart';
import Fastify from 'fastify';

import { config } from './config/env.js';
import { registerRoutes } from './routes/index.js';

const matchesOriginPattern = (requestOrigin: string, pattern: string): boolean => {
  if (!pattern) return false;
  if (pattern === '*') return true;
  if (pattern === requestOrigin) return true;

  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(requestOrigin);
  } catch {
    return false;
  }

  // Pattern: https://*.vercel.app (scheme + wildcard host)
  const schemeWildcard = pattern.match(/^([a-z]+):\/\/\*\.([^/:]+)(?::(\d+))?$/i);
  if (schemeWildcard) {
    const expectedProtocol = `${schemeWildcard[1].toLowerCase()}:`;
    const expectedRootHost = schemeWildcard[2].toLowerCase();
    const expectedPort = schemeWildcard[3];

    const protocolMatches = parsedOrigin.protocol.toLowerCase() === expectedProtocol;
    const hostMatches = parsedOrigin.hostname.toLowerCase().endsWith(`.${expectedRootHost}`);
    const portMatches = !expectedPort || parsedOrigin.port === expectedPort;
    return protocolMatches && hostMatches && portMatches;
  }

  // Pattern: *.vercel.app (host-only wildcard)
  const hostWildcard = pattern.match(/^\*\.([^/:]+)$/i);
  if (hostWildcard) {
    const expectedRootHost = hostWildcard[1].toLowerCase();
    return parsedOrigin.hostname.toLowerCase().endsWith(`.${expectedRootHost}`);
  }

  return false;
};

const isOriginAllowed = (requestOrigin: string, allowedOrigins: string[]): boolean => {
  for (const pattern of allowedOrigins) {
    if (matchesOriginPattern(requestOrigin, pattern)) {
      return true;
    }
  }
  return false;
};

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
      !requestOrigin || allowAllOrigins || isOriginAllowed(requestOrigin, allowedOrigins);

    if (!isAllowedOrigin) {
      reply.code(403);
      return reply.send({ error: 'Origin not allowed by CORS policy' });
    }

    if (requestOrigin) {
      reply.raw.setHeader('Access-Control-Allow-Origin', requestOrigin);
      reply.raw.setHeader('Vary', 'Origin');
    } else if (allowAllOrigins) {
      reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    }

    if (allowCredentials) {
      reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    const requestHeaders = request.headers['access-control-request-headers'];
    reply.raw.setHeader(
      'Access-Control-Allow-Headers',
      typeof requestHeaders === 'string'
        ? requestHeaders
        : 'Content-Type, Authorization, X-Requested-With'
    );
    reply.raw.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    reply.raw.setHeader('Access-Control-Max-Age', String(config.cors.maxAge));

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
