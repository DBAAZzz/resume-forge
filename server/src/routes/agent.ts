import type { FastifyInstance } from 'fastify';
import { runAgent } from '../services/agent.service.js';
import type { AgentRequest } from '../types/index.js';

export async function agentRoutes(app: FastifyInstance) {
  app.post<{ Body: AgentRequest }>('/agent', async (request, reply) => {
    const { prompt } = request.body;

    reply.raw.setHeader('Content-Type', 'application/x-ndjson');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    try {
      for await (const message of runAgent({ prompt })) {
        reply.raw.write(JSON.stringify(message) + '\n');
      }
    } catch (err) {
      request.log.error(err);
      reply.raw.write(JSON.stringify({ type: 'error', error: String(err) }) + '\n');
    } finally {
      reply.raw.end();
    }
  });
}
