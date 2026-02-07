import { DEEP_INSIGHT_TYPE } from '@resume/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { analyzeDeepInsights } from '@/modules/analysis/api';
import type {
  AnalysisModel,
  TimelineIssue,
  SkillIssue,
  MetricSuggestion,
  JobMatchInsight,
} from '@/modules/analysis/types';

interface DeepInsights {
  timelineIssues: TimelineIssue[];
  skillIssues: SkillIssue[];
  metricSuggestions: MetricSuggestion[];
  jobMatch: JobMatchInsight | null;
  overallSuggestion: string;
}

interface DeepAnalysisState {
  deepInsights: DeepInsights;
  status: 'idle' | 'analyzing' | 'done' | 'error';
  error: string | null;
  thinkingText: string;

  startDeepAnalysis: (
    content: string,
    model?: AnalysisModel,
    apiKey?: string,
    targetRole?: string,
    jobDescription?: string
  ) => Promise<void>;
  resetDeepAnalysis: () => void;
}

export const useDeepAnalysisStore = create<DeepAnalysisState>()(
  persist(
    (set) => ({
      deepInsights: {
        timelineIssues: [],
        skillIssues: [],
        metricSuggestions: [],
        jobMatch: null,
        overallSuggestion: '',
      },
      status: 'idle',
      error: null,
      thinkingText: '',

      startDeepAnalysis: async (
        content: string,
        model: AnalysisModel = 'deepseek-reasoner',
        apiKey?: string,
        targetRole?: string,
        jobDescription?: string
      ) => {
        if (!content) {
          console.error('No content provided for deep analysis');
          return;
        }

        set({
          status: 'analyzing',
          error: null,
          thinkingText: '',
          deepInsights: {
            timelineIssues: [],
            skillIssues: [],
            metricSuggestions: [],
            jobMatch: null,
            overallSuggestion: '',
          },
        });

        try {
          for await (const event of analyzeDeepInsights(
            content,
            model,
            apiKey,
            targetRole,
            jobDescription
          )) {
            switch (event.type) {
              case DEEP_INSIGHT_TYPE.THINKING:
                set((state) => ({
                  thinkingText: state.thinkingText + event.value,
                }));
                break;

              case DEEP_INSIGHT_TYPE.TIMELINE_ISSUE:
                set((state) => ({
                  deepInsights: {
                    ...state.deepInsights,
                    timelineIssues: [...state.deepInsights.timelineIssues, event.value],
                  },
                }));
                break;

              case DEEP_INSIGHT_TYPE.SKILL_ISSUE:
                set((state) => ({
                  deepInsights: {
                    ...state.deepInsights,
                    skillIssues: [...state.deepInsights.skillIssues, event.value],
                  },
                }));
                break;

              case DEEP_INSIGHT_TYPE.METRIC_SUGGESTION:
                set((state) => ({
                  deepInsights: {
                    ...state.deepInsights,
                    metricSuggestions: [...state.deepInsights.metricSuggestions, event.value],
                  },
                }));
                break;

              case DEEP_INSIGHT_TYPE.JOB_MATCH:
                set((state) => ({
                  deepInsights: {
                    ...state.deepInsights,
                    jobMatch: event.value,
                  },
                }));
                break;

              case DEEP_INSIGHT_TYPE.OVERALL:
                set((state) => ({
                  deepInsights: {
                    ...state.deepInsights,
                    overallSuggestion: event.value,
                  },
                }));
                break;

              case DEEP_INSIGHT_TYPE.DONE:
                set({ status: 'done' });
                break;

              case DEEP_INSIGHT_TYPE.ERROR:
                throw new Error(event.value);
            }
          }
        } catch (error) {
          set({
            status: 'error',
            error: error instanceof Error ? error.message : 'Deep analysis failed',
          });
        }
      },

      resetDeepAnalysis: () =>
        set({
          deepInsights: {
            timelineIssues: [],
            skillIssues: [],
            metricSuggestions: [],
            jobMatch: null,
            overallSuggestion: '',
          },
          status: 'idle',
          error: null,
          thinkingText: '',
        }),
    }),
    {
      name: 'deep-analysis-storage',
      partialize: (state) => ({
        deepInsights: state.deepInsights,
        status: state.status === 'analyzing' ? 'idle' : state.status,
      }),
    }
  )
);
