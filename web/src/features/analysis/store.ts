import { SSE_TYPE } from '@resume/types';
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
      aiSuggestions: {
        score: -1,
        strength: [],
        weakness: [],
      },
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
          aiSuggestions: {
            score: -1,
            strength: [],
            weakness: [],
          },
        });

        try {
          const content = parsedContent;
          for await (const event of analyzeResumeStream(content)) {
            switch (event.type) {
              case SSE_TYPE.START:
                break;
              case SSE_TYPE.THINKING:
                set((state) => ({ thinkingText: state.thinkingText + event.value }));
                break;
              case SSE_TYPE.SCORE: {
                set((state) => ({
                  aiSuggestions: {
                    ...state.aiSuggestions,
                    score: event.value,
                  },
                }));
                break;
              }
              case SSE_TYPE.STRENGTH: {
                set((state) => ({
                  aiSuggestions: {
                    ...state.aiSuggestions,
                    strength: [...state.aiSuggestions.strength, event.value],
                  },
                }));
                break;
              }
              case SSE_TYPE.WEAKNESS: {
                set((state) => ({
                  aiSuggestions: {
                    ...state.aiSuggestions,
                    weakness: [...state.aiSuggestions.weakness, event.value],
                  },
                }));
                break;
              }
              case SSE_TYPE.DONE:
                set({
                  status: 'done',
                });
                break;
              case 'error':
                throw new Error(event.value);
            }
          }
        } catch (error) {
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
          aiSuggestions: {
            score: -1,
            strength: [],
            weakness: [],
          },
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
