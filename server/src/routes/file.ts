import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { parseMultipartFile } from '../utils/file.utils.js';

import type { FastifyInstance } from 'fastify';

export async function fileRoutes(app: FastifyInstance) {
  /**
   * GET /file/template/resume
   * 下载 Markdown 简历模板文件
   */
  app.get('/file/template/resume', async (request, reply) => {
    try {
      const templatePath = path.resolve(process.cwd(), 'src/template/resume-template.md');
      const content = await readFile(templatePath);

      reply.header('Content-Type', 'text/markdown; charset=utf-8');
      reply.header('Content-Disposition', 'attachment; filename="resume-template.md"');
      return reply.send(content);
    } catch (err) {
      request.log.error(err);
      reply.code(500);
      return { error: err instanceof Error ? err.message : String(err) };
    }
  });

  /**
   * POST /file/parse
   * 解析上传的文件，返回文本内容
   * 不做任何文本修改，仅提取原始内容
   */
  app.post('/file/parse', async (request, reply) => {
    try {
      const data = await request.file();

      if (!data) {
        reply.code(400);
        return { error: 'No file uploaded' };
      }

      const parsedFile = await parseMultipartFile(data);

      return {
        content: parsedFile.content,
        type: parsedFile.type,
        metadata: parsedFile.metadata,
      };
    } catch (err) {
      request.log.error(err);
      reply.code(500);
      return { error: err instanceof Error ? err.message : String(err) };
    }
  });
}
