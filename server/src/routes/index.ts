import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.js';
import { agentRoutes } from './agent.js';
import { deepseekRoutes } from './deepseek.js';

export async function registerRoutes(app: FastifyInstance) {
  await healthRoutes(app);
  await agentRoutes(app);
  await deepseekRoutes(app);
}
