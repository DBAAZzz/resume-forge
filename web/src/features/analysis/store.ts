import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { analyzeResumeStream, parseFile } from './api';

import type { AnalysisState, Suggestions } from './types';

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      file: null,
      fileName: null,
      parsedContent: null,
      aiSuggestions: null,
      status: 'idle',
      error: null,
      streamText: '',
      thinkingText: '',

      setFile: (file: File) => set({ file, fileName: file.name, error: null }),

      setParsedContent: async () => {
        const { file } = get();
        if (!file) return;

        let content = get().parsedContent;
        set({ status: 'uploading' });
        const parseResult = await parseFile(file);
        content = parseResult.content;
        set({ parsedContent: content, status: 'idle' });
      },

      startAnalysis: async () => {
        const { parsedContent } = get();
        if (!parsedContent) {
          console.error('No parsed content available for analysis');
          return;
        }

        set({
          status: 'analyzing',
          error: null,
          streamText: '',
          thinkingText: '',
          aiSuggestions: null,
        });

        try {
          const content = parsedContent;
          for await (const event of analyzeResumeStream(content)) {
            switch (event.type) {
              case 'start':
                break;
              case 'thinking':
                set((state) => ({ thinkingText: state.thinkingText + event.text }));
                break;
              case 'chunk':
                break;
              case 'result':
                set({
                  status: 'done',
                  aiSuggestions: {
                    good: event.data.good,
                    bad: event.data.bad,
                    score: event.data.score,
                  },
                });
                break;
              case 'error':
                throw new Error(event.message);
            }
          }
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
          streamText: '',
          thinkingText: '',
        }),
      setSuggestions: (suggestions: Suggestions) => set({ aiSuggestions: suggestions }),
    }),
    {
      name: 'analysis-storage',
      partialize: (state) => ({
        fileName: state.fileName,
        parsedContent: state.parsedContent,
        aiSuggestions: state.aiSuggestions,
        status: state.status === 'analyzing' ? 'idle' : state.status,
      }),
    }
  )
);
