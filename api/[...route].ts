import type { IncomingMessage, ServerResponse } from 'node:http';
import appHandler from './_app-handler.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  return appHandler(req, res);
}
