import { runAgent } from '../services/agent.service.js';
import { setStreamHeaders } from '../utils/response.utils.js';

import type { AgentRequest } from '../types/index.js';
import type { FastifyInstance } from 'fastify';

export async function agentRoutes(app: FastifyInstance) {
  app.post<{ Body: AgentRequest }>('/agent', async (request, reply) => {
    const { prompt } = request.body;

    setStreamHeaders(reply, 'ndjson');

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
