import { agentRoutes } from './agent.js';
import { deepseekRoutes } from './deepseek.js';
import { fileRoutes } from './file.js';
import { healthRoutes } from './health.js';

import type { FastifyInstance } from 'fastify';

export async function registerRoutes(app: FastifyInstance) {
  await healthRoutes(app);
  await agentRoutes(app);
  await deepseekRoutes(app);
  await fileRoutes(app);
}
