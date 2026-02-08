import { CONTENT_FORMAT_STREAM_TYPE, SSE_TYPE } from '@resume/types';

import { analyzeResumeStream, formatContentHierarchyStream, parseFile } from '@/services/analysis';

import { createEmptySuggestions } from './constants';
import { useAnalysisConfigStore } from './useAnalysisConfigStore';
import { useAnalysisDocumentStore } from './useAnalysisDocumentStore';
import { useBasicAnalysisStore } from './useBasicAnalysisStore';
import { useDeepAnalysisStore } from './useDeepAnalysisStore';

export const parseSelectedFile = async (): Promise<void> => {
  const { file } = useAnalysisDocumentStore.getState();
  if (!file) return;

  useAnalysisDocumentStore.setState({
    parseStatus: 'uploading',
    parseError: null,
  });

  try {
    const parseResult = await parseFile(file);
    useAnalysisDocumentStore.setState({
      parsedContent: parseResult.content,
      parseStatus: 'idle',
      parseError: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '简历解析失败';
    useAnalysisDocumentStore.setState({
      parseStatus: 'error',
      parseError: message,
    });
    throw error;
  }
};

export const formatParsedContent = async (): Promise<void> => {
  const { parsedContent, formatStatus } = useAnalysisDocumentStore.getState();
  if (!parsedContent || formatStatus === 'formatting') return;

  const { model, apiKey } = useAnalysisConfigStore.getState();
  const originalContent = parsedContent;

  useAnalysisDocumentStore.setState({
    formatStatus: 'formatting',
    formatError: null,
    formatStreamingContent: '',
  });

  try {
    for await (const event of formatContentHierarchyStream(parsedContent, model, apiKey)) {
      switch (event.type) {
        case CONTENT_FORMAT_STREAM_TYPE.START:
          useAnalysisDocumentStore.setState({ formatStreamingContent: '' });
          break;
        case CONTENT_FORMAT_STREAM_TYPE.DELTA:
          useAnalysisDocumentStore.setState((state) => ({
            formatStreamingContent: (state.formatStreamingContent || '') + event.value,
          }));
          break;
        case CONTENT_FORMAT_STREAM_TYPE.DONE:
          break;
        case CONTENT_FORMAT_STREAM_TYPE.ERROR:
          throw new Error(event.value);
      }
    }

    const finalContent = useAnalysisDocumentStore.getState().formatStreamingContent?.trim();
    if (!finalContent) {
      throw new Error('格式化失败：未返回有效内容');
    }

    useAnalysisDocumentStore.setState({
      parsedContent: finalContent,
      formatStreamingContent: null,
      formatStatus: 'idle',
      formatError: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '格式化失败';
    useAnalysisDocumentStore.setState({
      parsedContent: originalContent,
      formatStreamingContent: null,
      formatStatus: 'error',
      formatError: message,
    });
    throw error;
  }
};

export const startBasicAnalysis = async (): Promise<void> => {
  const { parsedContent } = useAnalysisDocumentStore.getState();
  if (!parsedContent) return;

  const { model, apiKey, targetRole, jobDescription } = useAnalysisConfigStore.getState();

  useBasicAnalysisStore.setState({
    status: 'analyzing',
    error: null,
    thinkingText: '',
    aiSuggestions: createEmptySuggestions(),
  });

  try {
    for await (const event of analyzeResumeStream(
      parsedContent,
      model,
      apiKey,
      targetRole,
      jobDescription
    )) {
      switch (event.type) {
        case SSE_TYPE.START:
          break;
        case SSE_TYPE.THINKING:
          useBasicAnalysisStore.setState((state) => ({
            thinkingText: state.thinkingText + event.value,
          }));
          break;
        case SSE_TYPE.SCORE:
          useBasicAnalysisStore.setState((state) => ({
            aiSuggestions: {
              ...state.aiSuggestions,
              score: event.value,
            },
          }));
          break;
        case SSE_TYPE.WEAKNESS:
          useBasicAnalysisStore.setState((state) => ({
            aiSuggestions: {
              ...state.aiSuggestions,
              weakness: [...state.aiSuggestions.weakness, event.value],
            },
          }));
          break;
        case SSE_TYPE.DONE:
          useBasicAnalysisStore.setState({ status: 'done' });
          break;
        case 'error':
          throw new Error(event.value);
      }
    }

    if (useBasicAnalysisStore.getState().status === 'analyzing') {
      useBasicAnalysisStore.setState({ status: 'done' });
    }
  } catch (error) {
    useBasicAnalysisStore.setState({
      status: 'error',
      error: error instanceof Error ? error.message : 'Analysis failed',
    });
  }
};

export const startDeepAnalysisWorkflow = async (): Promise<void> => {
  const { parsedContent } = useAnalysisDocumentStore.getState();
  if (!parsedContent) return;

  const { model, apiKey, targetRole, jobDescription } = useAnalysisConfigStore.getState();
  const { startDeepAnalysis } = useDeepAnalysisStore.getState();

  await startDeepAnalysis(parsedContent, model, apiKey, targetRole, jobDescription);
};

export const resetAnalysisWorkflow = (): void => {
  useAnalysisDocumentStore.getState().resetDocument();
  useBasicAnalysisStore.getState().resetBasicAnalysis();
  useAnalysisConfigStore.getState().resetTargetContext();
};
