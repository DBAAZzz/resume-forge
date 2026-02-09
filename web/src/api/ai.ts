import { api, http } from '@/utils/fetch';

import type { DeepseekModel, TagOptimizationResponse } from '@resume/types';

interface OptimizeTagCandidatesApiParams {
  text: string;
  reason?: string;
  context?: string;
  candidateCount?: number;
  model?: DeepseekModel;
  encryptedApiKey?: string;
}

interface AnalyzeResumeStreamRequest {
  content: string;
  model?: DeepseekModel;
  encryptedApiKey?: string;
  targetRole?: string;
  jobDescription?: string;
}

interface DeepInsightsStreamRequest {
  content: string;
  model?: DeepseekModel;
  encryptedApiKey?: string;
  targetRole?: string;
  jobDescription?: string;
}

interface FormatHierarchyStreamRequest {
  content: string;
  model?: DeepseekModel;
  encryptedApiKey?: string;
}

export const requestTagCandidates = async (
  params: OptimizeTagCandidatesApiParams
): Promise<TagOptimizationResponse> => {
  return http.post<TagOptimizationResponse>('deepseek/optimize-tag-candidates', {
    ...params,
    candidateCount: params.candidateCount ?? 3,
  });
};

export const createResumeAnalysisStream = async (
  params: AnalyzeResumeStreamRequest
): Promise<Response> => {
  return api.post('deepseek/analyze-resume', {
    json: params,
    timeout: false,
    retry: 0,
    headers: {
      Accept: 'text/event-stream',
    },
  });
};

export const createDeepInsightsStream = async (
  params: DeepInsightsStreamRequest
): Promise<Response> => {
  return api.post('deepseek/analyze/deep-insights', {
    json: params,
    timeout: false,
    retry: 0,
    headers: {
      Accept: 'text/event-stream',
    },
  });
};

export const createFormatHierarchyStream = async (
  params: FormatHierarchyStreamRequest
): Promise<Response> => {
  return api.post('deepseek/format/hierarchy/stream', {
    json: params,
    timeout: false,
    retry: 0,
    headers: {
      Accept: 'text/event-stream',
    },
  });
};
