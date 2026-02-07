import { decryptDeepseekApiKey } from '../services/crypto.service.js';
import {
  runDeepseekAgent,
  runDeepseekAgentComplete,
  analyzeResumeStructuredStream,
  analyzeResumeDeepInsights,
  formatContentHierarchy,
  formatContentHierarchyStream,
  optimizeTagCandidates,
  validateDeepseekApiKey,
} from '../services/deepseek.service.js';
import {
  extractPromptFromFields,
  parseMultipartFile,
  validateTextFileType,
} from '../utils/file.utils.js';
import { setStreamHeaders } from '../utils/response.utils.js';

import type {
  DeepseekRequest,
  ResumeAnalysisRequest,
  TagOptimizationRequest,
  TagOptimizationResponse,
  DeepseekKeyValidationRequest,
  ContentHierarchyFormatRequest,
} from '../types/index.js';
import type { FastifyInstance } from 'fastify';

export async function deepseekRoutes(app: FastifyInstance) {
  // Streaming endpoint
  app.post<{ Body: DeepseekRequest }>('/deepseek', async (request, reply) => {
    const { prompt } = request.body;

    setStreamHeaders(reply, 'ndjson');

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

  // Validate API Key endpoint - 校验 DeepSeek Key 是否有效
  app.post<{ Body: DeepseekKeyValidationRequest }>(
    '/deepseek/validate-key',
    async (request, reply) => {
      const { encryptedApiKey } = request.body;

      if (!encryptedApiKey || typeof encryptedApiKey !== 'string') {
        reply.code(400);
        return { error: 'Missing or invalid encryptedApiKey field' };
      }

      let apiKey: string;
      try {
        apiKey = decryptDeepseekApiKey(encryptedApiKey);
      } catch {
        reply.code(400);
        return { error: 'Invalid encryptedApiKey' };
      }

      const result = await validateDeepseekApiKey(apiKey);
      return result;
    }
  );

  app.post<{ Body: TagOptimizationRequest; Reply: TagOptimizationResponse | { error: string } }>(
    '/deepseek/optimize-tag-candidates',
    async (request, reply) => {
      const { text, reason, context, model, encryptedApiKey, candidateCount } = request.body;

      if (!text || typeof text !== 'string') {
        reply.code(400);
        return { error: 'Missing or invalid text field' };
      }

      let apiKey: string | undefined;
      if (encryptedApiKey) {
        try {
          apiKey = decryptDeepseekApiKey(encryptedApiKey);
        } catch {
          reply.code(400);
          return { error: 'Invalid encryptedApiKey' };
        }
      }

      try {
        const candidates = await optimizeTagCandidates({
          text,
          reason,
          context,
          candidateCount,
          model,
          apiKey,
        });
        return { candidates };
      } catch (err) {
        request.log.error(err);
        reply.code(500);
        return { error: err instanceof Error ? err.message : String(err) };
      }
    }
  );

  // Content formatting endpoint - 对解析后的文本做层次化排版，不修改原文内容
  app.post<{ Body: ContentHierarchyFormatRequest }>(
    '/deepseek/format/hierarchy',
    async (request, reply) => {
      const { content, model, encryptedApiKey } = request.body;

      if (!content || typeof content !== 'string') {
        reply.code(400);
        return { error: 'Missing or invalid content field' };
      }

      let apiKey: string | undefined;
      if (encryptedApiKey) {
        try {
          apiKey = decryptDeepseekApiKey(encryptedApiKey);
        } catch {
          reply.code(400);
          return { error: 'Invalid encryptedApiKey' };
        }
      }

      try {
        const formattedContent = await formatContentHierarchy(content, model, apiKey);
        return { content: formattedContent };
      } catch (err) {
        request.log.error(err);
        reply.code(500);
        return { error: err instanceof Error ? err.message : String(err) };
      }
    }
  );

  // Content formatting streaming endpoint - 对解析后的文本做层次化排版（SSE 流式）
  app.post<{ Body: ContentHierarchyFormatRequest }>(
    '/deepseek/format/hierarchy/stream',
    async (request, reply) => {
      const { content, model, encryptedApiKey } = request.body;

      if (!content || typeof content !== 'string') {
        reply.code(400);
        return { error: 'Missing or invalid content field' };
      }

      let apiKey: string | undefined;
      if (encryptedApiKey) {
        try {
          apiKey = decryptDeepseekApiKey(encryptedApiKey);
        } catch {
          reply.code(400);
          return { error: 'Invalid encryptedApiKey' };
        }
      }

      setStreamHeaders(reply, 'sse');

      try {
        for await (const event of formatContentHierarchyStream(content, model, apiKey)) {
          reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
        }
        reply.raw.write('data: [DONE]\n\n');
      } catch (err) {
        request.log.error(err);
        reply.raw.write(
          `data: ${JSON.stringify({
            type: 'error',
            value: err instanceof Error ? err.message : String(err),
          })}\n\n`
        );
      } finally {
        reply.raw.end();
      }
    }
  );

  // Resume analysis endpoint - 分析简历并返回结构化 JSON (Streaming SSE)
  app.post<{ Body: ResumeAnalysisRequest }>('/deepseek/analyze-resume', async (request, reply) => {
    const { content, model, encryptedApiKey } = request.body;

    if (!content || typeof content !== 'string') {
      reply.code(400);
      return { error: 'Missing or invalid content field' };
    }

    let apiKey: string | undefined;
    if (encryptedApiKey) {
      try {
        apiKey = decryptDeepseekApiKey(encryptedApiKey);
      } catch {
        reply.code(400);
        return { error: 'Invalid encryptedApiKey' };
      }
    }

    setStreamHeaders(reply, 'sse');

    try {
      for await (const event of analyzeResumeStructuredStream(content, model, apiKey)) {
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
      }
      reply.raw.write('data: [DONE]\n\n');
    } catch (err) {
      request.log.error(err);
      // 如果头部已经发送，就发送一个错误事件
      reply.raw.write(
        `data: ${JSON.stringify({
          type: 'error',
          message: err instanceof Error ? err.message : String(err),
        })}\n\n`
      );
    } finally {
      reply.raw.end();
    }
  });

  // Deep insights analysis endpoint - 深度洞察分析（时间线审计 + 技能一致性 + 指标挖掘）(Streaming SSE)
  app.post<{ Body: ResumeAnalysisRequest }>(
    '/deepseek/analyze/deep-insights',
    async (request, reply) => {
      const { content, model, encryptedApiKey, targetRole, jobDescription } = request.body;

      if (!content || typeof content !== 'string') {
        reply.code(400);
        return { error: 'Missing or invalid content field' };
      }

      let apiKey: string | undefined;
      if (encryptedApiKey) {
        try {
          apiKey = decryptDeepseekApiKey(encryptedApiKey);
        } catch {
          reply.code(400);
          return { error: 'Invalid encryptedApiKey' };
        }
      }

      setStreamHeaders(reply, 'sse');

      try {
        for await (const event of analyzeResumeDeepInsights(
          content,
          model,
          apiKey,
          targetRole,
          jobDescription
        )) {
          reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
        }
        reply.raw.write('data: [DONE]\n\n');
      } catch (err) {
        request.log.error(err);
        // 如果头部已经发送，就发送一个错误事件
        reply.raw.write(
          `data: ${JSON.stringify({
            type: 'error',
            message: err instanceof Error ? err.message : String(err),
          })}\n\n`
        );
      } finally {
        reply.raw.end();
      }
    }
  );
}
