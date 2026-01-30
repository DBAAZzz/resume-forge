import { api, uploadFile } from '@/shared/utils/fetch';

import type { ParsedFileContent, SSEEvent, DeepInsightEvent } from './types';

/**
 * Upload a file to parse its content
 * POST /file/parse
 */
export const parseFile = async (file: File): Promise<ParsedFileContent> => {
  return uploadFile<ParsedFileContent>('/file/parse', file);
};

/**
 * Stream analysis results via SSE
 * POST /deepseek/analyze-resume
 */
export const analyzeResumeStream = async function* (content: string): AsyncGenerator<SSEEvent> {
  const response = await api.post('deepseek/analyze-resume', {
    json: { content },
    timeout: false, // disable timeout for streaming
    headers: {
      Accept: 'text/event-stream',
    },
  });

  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep the incomplete line

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data.trim() === '[DONE]') return;

          try {
            const event = JSON.parse(data) as SSEEvent;
            yield event;
          } catch {
            console.warn('Failed to parse SSE event:', data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

/**
 * Deep insights analysis via SSE
 * POST /deepseek/analyze/deep-insights
 */
export const analyzeDeepInsights = async function* (
  content: string
): AsyncGenerator<DeepInsightEvent> {
  const response = await api.post('deepseek/analyze/deep-insights', {
    json: { content },
    timeout: false, // disable timeout for streaming
    headers: {
      Accept: 'text/event-stream',
    },
  });

  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep the incomplete line

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data.trim() === '[DONE]') return;

          try {
            const event = JSON.parse(data) as DeepInsightEvent;
            yield event;
          } catch {
            console.warn('Failed to parse Deep Insight event:', data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};
