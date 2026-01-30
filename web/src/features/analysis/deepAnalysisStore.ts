import { DEEP_INSIGHT_TYPE } from '@resume/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { analyzeDeepInsights } from './api';

import type { TimelineIssue, SkillIssue, MetricSuggestion } from './types';

interface DeepInsights {
  timelineIssues: TimelineIssue[];
  skillIssues: SkillIssue[];
  metricSuggestions: MetricSuggestion[];
  overallSuggestion: string;
}

interface DeepAnalysisState {
  deepInsights: DeepInsights;
  status: 'idle' | 'analyzing' | 'done' | 'error';
  error: string | null;
  thinkingText: string;

  startDeepAnalysis: (content: string) => Promise<void>;
  resetDeepAnalysis: () => void;
}

export const useDeepAnalysisStore = create<DeepAnalysisState>()(
  persist(
    (set, get) => ({
      deepInsights: {
        timelineIssues: [],
        skillIssues: [],
        metricSuggestions: [],
        overallSuggestion: '',
      },
      status: 'idle',
      error: null,
      thinkingText: '',

      startDeepAnalysis: async (content: string) => {
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
            overallSuggestion: '',
          },
        });

        try {
          for await (const event of analyzeDeepInsights(content)) {
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
