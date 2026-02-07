import { getDeepseekPublicKey } from '../services/crypto.service.js';

import type { FastifyInstance } from 'fastify';

export async function cryptoRoutes(app: FastifyInstance) {
  app.get('/crypto/deepseek-public-key', async () => {
    return {
      publicKey: getDeepseekPublicKey(),
      algorithm: 'RSA-OAEP',
      hash: 'SHA-256',
    } as const;
  });
}
