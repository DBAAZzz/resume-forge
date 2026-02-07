import { SSE_TYPE } from '@resume/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  analyzeResumeStream,
  formatContentHierarchyStream,
  parseFile,
} from '@/modules/analysis/api';
import { CONTENT_FORMAT_STREAM_TYPE } from '@/modules/analysis/types';
import type {
  AnalysisState,
  AnalysisModel,
  AnalysisVendor,
  Suggestions,
} from '@/modules/analysis/types';

const MODEL_OPTIONS_BY_VENDOR: Record<AnalysisVendor, AnalysisModel[]> = {
  deepseek: ['deepseek-reasoner', 'deepseek-chat'],
};

const DEFAULT_TARGET_ROLE = '后端开发';
const DEFAULT_JOB_DESCRIPTION = `【岗位职责】

1. 参与多智能体AI Agent的设计、开发与优化；
2. 负责设计并实现安全、高可靠、高性能、高扩展的前后端系统；
3. 构建Agent评估与优化框架，持续提升智能化水平；
4. 与产品经理及AI算法工程师紧密合作，确保产品开发顺利。

【任职要求】

1. 计算机或相关专业，本科及以上学历，3-5年Al应用工具后端开发经验；
2. 精通Python、Java编程语言，有模型部署、API分发、视频存储等相关经验；
3. 熟悉LangChain、LLamaIndex等Agent开发框架，有实际RAG或LLM项目经验；
4. 优先考虑全栈开发经验，需理解前后端整合；
5. 熟悉分布式计算、边缘计算等技术，支持大规模部署；
6. 有个人开发作品或成果者优先。`;

type PersistedAnalysisState = {
  fileName: string | null;
  parsedContent: string | null;
  targetRole: string;
  jobDescription: string;
  vendor: AnalysisVendor;
  model: AnalysisModel;
  aiSuggestions: Suggestions;
  status: 'idle' | 'done' | 'error';
};

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      file: null,
      fileName: null,
      parsedContent: null,
      formatStreamingContent: null,
      targetRole: DEFAULT_TARGET_ROLE,
      jobDescription: DEFAULT_JOB_DESCRIPTION,
      vendor: 'deepseek',
      model: 'deepseek-reasoner',
      apiKey: '',
      aiSuggestions: {
        score: -1,
        weakness: [],
      },
      status: 'idle',
      isFormatting: false,
      error: null,
      streamText: '',
      thinkingText: '',

      setFile: (file: File) => set({ file, fileName: file.name, error: null }),
      setVendor: (vendor: AnalysisVendor) =>
        set((state) => {
          const availableModels = MODEL_OPTIONS_BY_VENDOR[vendor];
          const nextModel = availableModels.includes(state.model)
            ? state.model
            : availableModels[0];

          return {
            vendor,
            model: nextModel,
          };
        }),
      setModel: (model: AnalysisModel) => set({ model }),
      setApiKey: (apiKey: string) => set({ apiKey }),
      setTargetRole: (targetRole: string) => set({ targetRole }),
      setJobDescription: (jobDescription: string) => set({ jobDescription }),

      setParsedContent: async () => {
        const { file } = get();
        if (!file) return;

        let content = get().parsedContent;
        set({ status: 'uploading' });
        const parseResult = await parseFile(file);
        content = parseResult.content;
        set({ parsedContent: content, status: 'idle' });
      },

      setParsedContentDraft: (content: string) =>
        set((state) =>
          state.parsedContent === content
            ? state
            : {
                parsedContent: content,
              }
        ),

      formatParsedContent: async () => {
        const { parsedContent, model, apiKey, isFormatting } = get();
        if (!parsedContent || isFormatting) return;

        const originalContent = parsedContent;
        set({ isFormatting: true, error: null });

        try {
          set({ formatStreamingContent: '' });

          for await (const event of formatContentHierarchyStream(parsedContent, model, apiKey)) {
            switch (event.type) {
              case CONTENT_FORMAT_STREAM_TYPE.START:
                set({ formatStreamingContent: '' });
                break;
              case CONTENT_FORMAT_STREAM_TYPE.DELTA:
                set((state) => ({
                  formatStreamingContent: (state.formatStreamingContent || '') + event.value,
                }));
                break;
              case CONTENT_FORMAT_STREAM_TYPE.DONE:
                break;
              case CONTENT_FORMAT_STREAM_TYPE.ERROR:
                throw new Error(event.value);
            }
          }

          const finalContent = get().formatStreamingContent?.trim();
          if (!finalContent) {
            throw new Error('格式化失败：未返回有效内容');
          }

          set({
            parsedContent: finalContent,
            formatStreamingContent: null,
            isFormatting: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : '格式化失败';
          set({
            parsedContent: originalContent,
            formatStreamingContent: null,
            isFormatting: false,
            error: message,
          });
          throw error;
        }
      },

      startAnalysis: async () => {
        const { parsedContent, model, apiKey, targetRole, jobDescription } = get();
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
            weakness: [],
          },
        });

        try {
          const content = parsedContent;
          for await (const event of analyzeResumeStream(
            content,
            model,
            apiKey,
            targetRole,
            jobDescription
          )) {
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
          formatStreamingContent: null,
          targetRole: DEFAULT_TARGET_ROLE,
          jobDescription: DEFAULT_JOB_DESCRIPTION,
          aiSuggestions: {
            score: -1,
            weakness: [],
          },
          status: 'idle',
          isFormatting: false,
          error: null,
          streamText: '',
          thinkingText: '',
        }),
      setSuggestions: (suggestions: Suggestions) => set({ aiSuggestions: suggestions }),
    }),
    {
      name: 'analysis-storage',
      version: 1,
      migrate: (persistedState) => {
        const state = (persistedState || {}) as Partial<PersistedAnalysisState>;
        const normalizedTargetRole =
          typeof state.targetRole === 'string' && state.targetRole.trim()
            ? state.targetRole
            : DEFAULT_TARGET_ROLE;
        const normalizedJobDescription =
          typeof state.jobDescription === 'string' && state.jobDescription.trim()
            ? state.jobDescription
            : DEFAULT_JOB_DESCRIPTION;

        return {
          fileName: state.fileName ?? null,
          parsedContent: state.parsedContent ?? null,
          targetRole: normalizedTargetRole,
          jobDescription: normalizedJobDescription,
          vendor: state.vendor ?? 'deepseek',
          model: state.model ?? 'deepseek-reasoner',
          aiSuggestions: state.aiSuggestions ?? {
            score: -1,
            weakness: [],
          },
          status: state.status ?? 'idle',
        };
      },
      partialize: (state) => ({
        fileName: state.fileName,
        parsedContent: state.parsedContent,
        targetRole: state.targetRole,
        jobDescription: state.jobDescription,
        vendor: state.vendor,
        model: state.model,
        aiSuggestions: state.aiSuggestions,
        status: state.status === 'analyzing' ? 'idle' : state.status,
      }),
    }
  )
);
