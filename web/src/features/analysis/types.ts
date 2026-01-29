// Re-export shared types for backward compatibility
export * from '@resume/types';

// Import types needed for local type definitions
import type { AnalysisItem } from '@resume/types';

// Web-only types
export interface Suggestions {
  good: AnalysisItem[];
  bad: AnalysisItem[];
  score: number;
}

export interface AnalysisState {
  file: File | null;
  fileName: string | null;
  parsedContent: string | null;
  aiSuggestions: Suggestions | null;
  status: 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';
  error: string | null;
  thinkingText: string;
  streamText: string;

  // Actions
  setFile: (file: File) => void;
  setParsedContent: () => Promise<void>;
  startAnalysis: () => Promise<void>;
  resetAnalysis: () => void;
  setSuggestions: (suggestions: Suggestions) => void;
}
