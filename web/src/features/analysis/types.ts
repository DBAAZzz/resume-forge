export * from '@resume/types';

// Import types needed for local type definitions
import type { AnalysisItem } from '@resume/types';

// Web-only types
export interface Suggestions {
  strength: AnalysisItem[];
  weakness: AnalysisItem[];
  score: number;
}

export interface AnalysisState {
  file: File | null;
  fileName: string | null;
  parsedContent: string | null;
  aiSuggestions: Suggestions;
  status: 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';
  error: string | null;
  thinkingText: string;
  streamText: string;

  setFile: (file: File) => void;
  setParsedContent: () => Promise<void>;
  startAnalysis: () => Promise<void>;
  resetAnalysis: () => void;
  setSuggestions: (suggestions: Suggestions) => void;
}
