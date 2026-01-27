import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { parseFile } from '@/api/analysis';

interface Suggestions {
  good: string[];
  bad: string[];
  score: number;
}

interface AnalysisState {
  file: File | null; // Note: File objects are not serializable in localStorage. We will handle this gracefully.
  fileName: string | null;
  parsedContent: string | null;
  aiSuggestions: Suggestions | null;
  status: 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';
  error: string | null;

  // Actions
  setFile: (file: File) => void;
  startAnalysis: () => Promise<void>;
  resetAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      file: null,
      fileName: null,
      parsedContent: null,
      aiSuggestions: null,
      status: 'idle',
      error: null,

      setFile: (file: File) => set({ file, fileName: file.name, error: null }),

      startAnalysis: async () => {
        const { file } = get();
        if (!file) return;

        set({ status: 'analyzing', error: null });

        try {
          // 1. Upload and Parse File
          const parseResult = await parseFile(file);
          const content = parseResult.content;

          set({ parsedContent: content });

          // 2. Analyze Content with DeepSeek
          // const analysisJsonC = await analyzeContent(content);

          // Clean possible markdown code blocks usually returned by LLMs
          // const cleanJson = analysisJsonC.replace(/```json\n?|\n?```/g, '').trim();

          // let suggestions: Suggestions;
          // try {
          //   suggestions = JSON.parse(cleanJson);
          // } catch {
          //   console.error('Failed to parse AI response:', cleanJson);
          //   throw new Error('AI returned invalid format');
          // }

          set({
            status: 'done',
            aiSuggestions: {
              good: ['good'],
              bad: ['bad'],
              score: 100,
            },
          });
        } catch (error) {
          console.error('Analysis failed:', error);
          set({
            status: 'error',
            error: error instanceof Error ? error.message : 'Analysis failed',
          });
        }
      },

      resetAnalysis: () =>
        set({
          file: null,
          fileName: null,
          parsedContent: null,
          aiSuggestions: null,
          status: 'idle',
          error: null,
        }),
    }),
    {
      name: 'analysis-storage',
      // We explicitly filter what to persist. We cannot persist the 'file' object (Blob).
      partialize: (state) => ({
        fileName: state.fileName,
        parsedContent: state.parsedContent,
        aiSuggestions: state.aiSuggestions,
        status: state.status === 'analyzing' ? 'idle' : state.status, // Don't persist loading state
      }),
    }
  )
);
