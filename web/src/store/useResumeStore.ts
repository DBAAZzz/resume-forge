import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ResumeState {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const useResumeStore = create<ResumeState>()(
  devtools((set) => ({
    viewMode: 'grid',
    setViewMode: (mode) => set({ viewMode: mode }),
  }))
);
