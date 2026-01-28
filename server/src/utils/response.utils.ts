import type { FastifyReply } from 'fastify';

export type StreamContentType = 'ndjson' | 'sse';

/** 设置流式响应头 */
export function setStreamHeaders(reply: FastifyReply, type: StreamContentType = 'ndjson') {
  const contentType = type === 'sse' ? 'text/event-stream' : 'application/x-ndjson';
  reply.raw.setHeader('Content-Type', contentType);
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
}
