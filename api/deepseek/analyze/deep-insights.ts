import appHandler from '../../_app-handler.js';

import type { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return appHandler(req, res);
}
