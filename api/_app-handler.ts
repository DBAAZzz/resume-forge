import type { FastifyInstance } from 'fastify';
import type { IncomingMessage, ServerResponse } from 'node:http';

let appPromise: Promise<FastifyInstance> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const { buildApp } = await import('../server/src/app.js');
      const app = await buildApp();
      await app.ready();
      return app;
    })();
  }

  return appPromise;
}

export default async function appHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await getApp();
    app.server.emit('request', req, res);
  } catch (error) {
    console.error('API bootstrap failed:', error);

    res.statusCode = 500;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    const message = error instanceof Error ? error.message : String(error);
    res.end(JSON.stringify({ error: 'API bootstrap failed', message }));
  }
}
