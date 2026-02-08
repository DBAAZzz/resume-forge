import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ParseStatus = 'idle' | 'uploading' | 'error';
type FormatStatus = 'idle' | 'formatting' | 'error';

interface AnalysisDocumentState {
  file: File | null;
  fileName: string | null;
  parsedContent: string | null;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  parseStatus: ParseStatus;
  parseError: string | null;
  formatStatus: FormatStatus;
  formatError: string | null;
  formatStreamingContent: string | null;
  setFile: (file: File) => void;
  setParsedContentDraft: (content: string) => void;
  resetDocument: () => void;
}

type PersistedDocumentState = {
  fileName: string | null;
  parsedContent: string | null;
};

export const useAnalysisDocumentStore = create<AnalysisDocumentState>()(
  persist(
    (set) => ({
      file: null,
      fileName: null,
      parsedContent: null,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      parseStatus: 'idle',
      parseError: null,
      formatStatus: 'idle',
      formatError: null,
      formatStreamingContent: null,
      setFile: (file) =>
        set({
          file,
          fileName: file.name,
          parseError: null,
          parseStatus: 'idle',
        }),
      setParsedContentDraft: (content) =>
        set((state) =>
          state.parsedContent === content
            ? state
            : {
                parsedContent: content,
              }
        ),
      resetDocument: () =>
        set({
          file: null,
          fileName: null,
          parsedContent: null,
          hasHydrated: true,
          parseStatus: 'idle',
          parseError: null,
          formatStatus: 'idle',
          formatError: null,
          formatStreamingContent: null,
        }),
    }),
    {
      name: 'analysis-document-storage',
      version: 1,
      migrate: (persistedState) => {
        const state = (persistedState || {}) as Partial<PersistedDocumentState>;
        return {
          fileName: state.fileName ?? null,
          parsedContent: state.parsedContent ?? null,
        };
      },
      partialize: (state) => ({
        fileName: state.fileName,
        parsedContent: state.parsedContent,
      }),
      onRehydrateStorage: (state) => () => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export type { ParseStatus, FormatStatus };
