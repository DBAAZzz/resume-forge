export * from '@resume/types';

// Server-only types
export interface FileBuffer {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface LLMAnalysisResult {
  score?: number;
  good: Array<{ paragraphIndex: number; reason: string }>;
  bad: Array<{ paragraphIndex: number; reason: string }>;
}
