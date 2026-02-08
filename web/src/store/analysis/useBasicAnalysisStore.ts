import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createEmptySuggestions } from './constants';

import type { Suggestions } from './types';

type BasicAnalysisStatus = 'idle' | 'analyzing' | 'done' | 'error';

interface BasicAnalysisState {
  aiSuggestions: Suggestions;
  thinkingText: string;
  status: BasicAnalysisStatus;
  error: string | null;
  setSuggestions: (suggestions: Suggestions) => void;
  resetBasicAnalysis: () => void;
}

type PersistedBasicAnalysisState = {
  aiSuggestions: Suggestions;
  status: BasicAnalysisStatus;
};

export const useBasicAnalysisStore = create<BasicAnalysisState>()(
  persist(
    (set) => ({
      aiSuggestions: createEmptySuggestions(),
      thinkingText: '',
      status: 'idle',
      error: null,
      setSuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
      resetBasicAnalysis: () =>
        set({
          aiSuggestions: createEmptySuggestions(),
          thinkingText: '',
          status: 'idle',
          error: null,
        }),
    }),
    {
      name: 'analysis-basic-storage',
      version: 1,
      migrate: (persistedState) => {
        const state = (persistedState || {}) as Partial<PersistedBasicAnalysisState>;
        return {
          aiSuggestions: state.aiSuggestions ?? createEmptySuggestions(),
          status: state.status === 'analyzing' ? 'idle' : (state.status ?? 'idle'),
        };
      },
      partialize: (state) => ({
        aiSuggestions: state.aiSuggestions,
        status: state.status === 'analyzing' ? 'idle' : state.status,
      }),
    }
  )
);

export type { BasicAnalysisStatus };
