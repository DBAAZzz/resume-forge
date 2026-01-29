export * from '@resume/types';

// Server-only types
export interface FileBuffer {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface LLMAnalysisResult {
  score?: number;
  strength: Array<{ paragraphIndex: number; reason: string }>;
  weakness: Array<{ paragraphIndex: number; reason: string }>;
}
