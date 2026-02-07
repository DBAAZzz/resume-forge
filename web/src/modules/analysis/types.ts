export * from '@resume/types';

// Import types needed for local type definitions
import type { AnalysisItem, DeepseekModel } from '@resume/types';

// Web-only types
export interface Suggestions {
  weakness: AnalysisItem[];
  score: number;
}

export type AnalysisVendor = 'deepseek';

export type AnalysisModel = DeepseekModel;

export interface AnalysisState {
  file: File | null;
  fileName: string | null;
  parsedContent: string | null;
  formatStreamingContent: string | null;
  targetRole: string;
  jobDescription: string;
  vendor: AnalysisVendor;
  model: AnalysisModel;
  apiKey: string;
  aiSuggestions: Suggestions;
  status: 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';
  isFormatting: boolean;
  error: string | null;
  thinkingText: string;
  streamText: string;

  setFile: (file: File) => void;
  setVendor: (vendor: AnalysisVendor) => void;
  setModel: (model: AnalysisModel) => void;
  setApiKey: (apiKey: string) => void;
  setTargetRole: (targetRole: string) => void;
  setJobDescription: (jobDescription: string) => void;
  setParsedContent: () => Promise<void>;
  setParsedContentDraft: (content: string) => void;
  formatParsedContent: () => Promise<void>;
  startAnalysis: () => Promise<void>;
  resetAnalysis: () => void;
  setSuggestions: (suggestions: Suggestions) => void;
}
