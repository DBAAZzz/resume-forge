import {
  runDeepseekAgent,
  runDeepseekAgentComplete,
  analyzeResumeStructured,
} from '../services/deepseek.service.js';
import {
  extractPromptFromFields,
  parseMultipartFile,
  validateTextFileType,
} from '../utils/file.utils.js';

import type { DeepseekRequest, ResumeAnalysisRequest } from '../types/index.js';
import type { FastifyInstance } from 'fastify';

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

  // Complete (non-streaming) endpoint - 支持文本 prompt 或文件上传
  app.post('/deepseek/complete', async (request, reply) => {
    const contentType = request.headers['content-type'] || '';

    try {
      let prompt: string;
      let fileContent: string | undefined;

      // 检查是否是文件上传请求
      if (contentType.includes('multipart/form-data')) {
        // 处理文件上传
        const data = await request.file();

        if (!data) {
          reply.code(400);
          return { error: 'No file uploaded' };
        }

        // 使用工具函数提取 prompt
        prompt = extractPromptFromFields(data.fields, '请分析这个文件');

        // 使用工具函数解析文件
        const parsedFile = await parseMultipartFile(data);

        // 验证文件类型
        try {
          validateTextFileType(parsedFile);
        } catch (error) {
          reply.code(400);
          return { error: error instanceof Error ? error.message : String(error) };
        }

        console.log('文件内容为', parsedFile.content);

        fileContent = parsedFile.content;
      } else {
        // 处理普通 JSON 请求
        const body = request.body as DeepseekRequest;
        prompt = body.prompt;
        fileContent = body.fileContent;
      }

      const result = await runDeepseekAgentComplete({ prompt, fileContent });
      return { result };
    } catch (err) {
      request.log.error(err);
      reply.code(500);
      return { error: String(err) };
    }
  });

  // Resume analysis endpoint - 分析简历并返回结构化 JSON
  app.post<{ Body: ResumeAnalysisRequest }>('/deepseek/analyze-resume', async (request, reply) => {
    const { content } = request.body;

    if (!content || typeof content !== 'string') {
      reply.code(400);
      return { error: 'Missing or invalid content field' };
    }

    try {
      const result = await analyzeResumeStructured(content);
      return result;
    } catch (err) {
      request.log.error(err);
      reply.code(500);
      return { error: err instanceof Error ? err.message : String(err) };
    }
  });
}
