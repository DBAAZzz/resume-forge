import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_JOB_DESCRIPTION, DEFAULT_TARGET_ROLE, MODEL_OPTIONS_BY_VENDOR } from './constants';

import type { AnalysisModel, AnalysisVendor } from './types';

interface AnalysisConfigState {
  vendor: AnalysisVendor;
  model: AnalysisModel;
  apiKey: string;
  targetRole: string;
  jobDescription: string;
  setVendor: (vendor: AnalysisVendor) => void;
  setModel: (model: AnalysisModel) => void;
  setApiKey: (apiKey: string) => void;
  setTargetRole: (targetRole: string) => void;
  setJobDescription: (jobDescription: string) => void;
  resetTargetContext: () => void;
}

type PersistedConfigState = {
  vendor: AnalysisVendor;
  model: AnalysisModel;
  targetRole: string;
  jobDescription: string;
};

export const useAnalysisConfigStore = create<AnalysisConfigState>()(
  persist(
    (set) => ({
      vendor: 'deepseek',
      model: 'deepseek-reasoner',
      apiKey: '',
      targetRole: DEFAULT_TARGET_ROLE,
      jobDescription: DEFAULT_JOB_DESCRIPTION,
      setVendor: (vendor) =>
        set((state) => {
          const availableModels = MODEL_OPTIONS_BY_VENDOR[vendor];
          const nextModel = availableModels.includes(state.model)
            ? state.model
            : availableModels[0];
          return { vendor, model: nextModel };
        }),
      setModel: (model) => set({ model }),
      setApiKey: (apiKey) => set({ apiKey }),
      setTargetRole: (targetRole) => set({ targetRole }),
      setJobDescription: (jobDescription) => set({ jobDescription }),
      resetTargetContext: () =>
        set({
          targetRole: DEFAULT_TARGET_ROLE,
          jobDescription: DEFAULT_JOB_DESCRIPTION,
        }),
    }),
    {
      // Keep the existing key to preserve persisted vendor/model/target context after refactor.
      name: 'analysis-storage',
      version: 2,
      migrate: (persistedState) => {
        const state = (persistedState || {}) as Partial<PersistedConfigState>;
        const normalizedTargetRole =
          typeof state.targetRole === 'string' && state.targetRole.trim()
            ? state.targetRole
            : DEFAULT_TARGET_ROLE;
        const normalizedJobDescription =
          typeof state.jobDescription === 'string' && state.jobDescription.trim()
            ? state.jobDescription
            : DEFAULT_JOB_DESCRIPTION;

        return {
          vendor: state.vendor ?? 'deepseek',
          model: state.model ?? 'deepseek-reasoner',
          targetRole: normalizedTargetRole,
          jobDescription: normalizedJobDescription,
        };
      },
      partialize: (state) => ({
        vendor: state.vendor,
        model: state.model,
        targetRole: state.targetRole,
        jobDescription: state.jobDescription,
      }),
    }
  )
);
