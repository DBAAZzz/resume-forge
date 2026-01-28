export interface AnalysisItem {
  content: string;
  reason: string;
  startIndex: number;
  endIndex: number;
}

export interface AnalysisResponse {
  content: string;
  type: string;
  metadata: Record<string, string>;
}

export interface ResumeAnalysisResponse {
  origin: string;
  score: number;
  good: AnalysisItem[];
  bad: AnalysisItem[];
}

export type SSEEvent =
  | { type: 'start'; paragraphCount: number }
  | { type: 'thinking'; text: string }
  | { type: 'chunk'; text: string }
  | { type: 'result'; data: ResumeAnalysisResponse }
  | { type: 'error'; message: string };

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
