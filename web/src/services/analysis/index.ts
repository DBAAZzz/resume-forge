import {
  createDeepInsightsStream,
  createFormatHierarchyStream,
  createResumeAnalysisStream,
} from '@/api/ai';
import { requestParsedFile, requestResumeTemplateBlob } from '@/api/file';
import { encryptDeepseekApiKey } from '@/services/security/deepseekApiKey';

import type {
  ContentFormatStreamEvent,
  DeepInsightEvent,
  DeepseekModel,
  ParsedFileContent,
  SSEEvent,
} from '@resume/types';

const parseSSEStream = async function* <T>(
  response: Response,
  parseErrorLabel: string
): AsyncGenerator<T> {
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
          yield JSON.parse(data) as T;
        } catch {
          console.warn(`${parseErrorLabel}:`, data);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

export const parseFile = async (file: File): Promise<ParsedFileContent> => {
  return requestParsedFile(file);
};

export const downloadResumeTemplate = async () => {
  const blob = await requestResumeTemplateBlob();
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

export const analyzeResumeStream = async function* (
  content: string,
  model: DeepseekModel = 'deepseek-reasoner',
  apiKey?: string,
  targetRole?: string,
  jobDescription?: string
): AsyncGenerator<SSEEvent> {
  const encryptedApiKey = await encryptDeepseekApiKey(apiKey);
  const response = await createResumeAnalysisStream({
    content,
    model,
    encryptedApiKey,
    targetRole,
    jobDescription,
  });

  yield* parseSSEStream<SSEEvent>(response, 'Failed to parse SSE event');
};

export const analyzeDeepInsights = async function* (
  content: string,
  model: DeepseekModel = 'deepseek-reasoner',
  apiKey?: string,
  targetRole?: string,
  jobDescription?: string
): AsyncGenerator<DeepInsightEvent> {
  const encryptedApiKey = await encryptDeepseekApiKey(apiKey);
  const response = await createDeepInsightsStream({
    content,
    model,
    encryptedApiKey,
    targetRole,
    jobDescription,
  });

  yield* parseSSEStream<DeepInsightEvent>(response, 'Failed to parse Deep Insight event');
};

export const formatContentHierarchyStream = async function* (
  content: string,
  model: DeepseekModel = 'deepseek-reasoner',
  apiKey?: string
): AsyncGenerator<ContentFormatStreamEvent> {
  const encryptedApiKey = await encryptDeepseekApiKey(apiKey);
  const response = await createFormatHierarchyStream({
    content,
    model,
    encryptedApiKey,
  });

  yield* parseSSEStream<ContentFormatStreamEvent>(response, 'Failed to parse format stream event');
};
