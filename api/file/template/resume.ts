import { readFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const templatePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../server/src/template/resume-template.md'
);

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method && req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const content = await readFile(templatePath);
    res.statusCode = 200;
    res.setHeader('content-type', 'text/markdown; charset=utf-8');
    res.setHeader('content-disposition', 'attachment; filename="resume-template.md"');
    res.end(content);
  } catch (error) {
    console.error('Failed to read resume template:', error);

    res.statusCode = 500;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    const message = error instanceof Error ? error.message : String(error);
    res.end(JSON.stringify({ error: 'Failed to load resume template', message }));
  }
}
