import { encryptDeepseekApiKey } from '@/services/security/deepseekApiKey';
import { api, uploadFile } from '@/shared/utils/fetch';

import type {
  AnalysisModel,
  ParsedFileContent,
  SSEEvent,
  DeepInsightEvent,
  ContentFormatStreamEvent,
} from './types';

/**
 * Upload a file to parse its content
 * POST /file/parse
 */
export const parseFile = async (file: File): Promise<ParsedFileContent> => {
  return uploadFile<ParsedFileContent>('/file/parse', file);
};

/**
 * Download resume markdown template
 * GET /file/template/resume
 */
export const downloadResumeTemplate = async () => {
  const response = await api.get('file/template/resume');
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = 'resume-template.md';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

/**
 * Stream analysis results via SSE
 * POST /deepseek/analyze-resume
 */
export const analyzeResumeStream = async function* (
  content: string,
  model: AnalysisModel = 'deepseek-reasoner',
  apiKey?: string,
  targetRole?: string,
  jobDescription?: string
): AsyncGenerator<SSEEvent> {
  const encryptedApiKey = await encryptDeepseekApiKey(apiKey);

  const response = await api.post('deepseek/analyze-resume', {
    json: { content, model, encryptedApiKey, targetRole, jobDescription },
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
  content: string,
  model: AnalysisModel = 'deepseek-reasoner',
  apiKey?: string,
  targetRole?: string,
  jobDescription?: string
): AsyncGenerator<DeepInsightEvent> {
  const encryptedApiKey = await encryptDeepseekApiKey(apiKey);

  const response = await api.post('deepseek/analyze/deep-insights', {
    json: { content, model, encryptedApiKey, targetRole, jobDescription },
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

/**
 * Stream formatted markdown content
 * POST /deepseek/format/hierarchy/stream
 */
export const formatContentHierarchyStream = async function* (
  content: string,
  model: AnalysisModel = 'deepseek-reasoner',
  apiKey?: string
): AsyncGenerator<ContentFormatStreamEvent> {
  const encryptedApiKey = await encryptDeepseekApiKey(apiKey);

  const response = await api.post('deepseek/format/hierarchy/stream', {
    json: { content, model, encryptedApiKey },
    timeout: false,
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
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        const data = line.slice(6);
        if (data.trim() === '[DONE]') return;

        try {
          const event = JSON.parse(data) as ContentFormatStreamEvent;
          yield event;
        } catch {
          console.warn('Failed to parse format stream event:', data);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};
