import type { FastifyInstance } from 'fastify';
import { runDeepseekAgent, runDeepseekAgentComplete } from '../services/deepseek.service.js';
import type { DeepseekRequest } from '../types/index.js';

export async function deepseekRoutes(app: FastifyInstance) {
  // Streaming endpoint
  app.post<{ Body: DeepseekRequest }>('/deepseek', async (request, reply) => {
    const { prompt } = request.body;

    reply.raw.setHeader('Content-Type', 'application/x-ndjson');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    try {
      for await (const message of runDeepseekAgent({ prompt })) {
        reply.raw.write(JSON.stringify(message) + '\n');
      }
    } catch (err) {
      request.log.error(err);
      reply.raw.write(JSON.stringify({ type: 'error', error: String(err) }) + '\n');
    } finally {
      reply.raw.end();
    }
  });

  // Complete (non-streaming) endpoint
  app.post<{ Body: DeepseekRequest }>('/deepseek/complete', async (request, reply) => {
    const { prompt } = request.body;

    try {
      const result = await runDeepseekAgentComplete({ prompt });
      return { result };
    } catch (err) {
      request.log.error(err);
      reply.code(500);
      return { error: String(err) };
    }
  });
}
