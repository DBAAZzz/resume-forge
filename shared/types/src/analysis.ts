export interface AnalysisItem {
  content: string; // 段落原文
  reason: string; // 原因
}

export type DeepseekModel = 'deepseek-reasoner' | 'deepseek-chat';

export interface ResumeAnalysisRequest {
  content: string; // 简历原文
  targetRole?: string; // 目标岗位
  jobDescription?: string; // 目标岗位 JD
  model?: DeepseekModel;
  encryptedApiKey?: string;
}

export interface ContentHierarchyFormatRequest {
  content: string; // 需要做层次格式化的原文
  model?: DeepseekModel;
  encryptedApiKey?: string;
}

export interface ContentHierarchyFormatResponse {
  content: string; // Markdown 格式化后的内容
}

export interface TagOptimizationRequest {
  text: string;
  reason?: string;
  context?: string;
  model?: DeepseekModel;
  encryptedApiKey?: string;
  candidateCount?: number;
}

export interface TagOptimizationResponse {
  candidates: string[];
}

export const CONTENT_FORMAT_STREAM_TYPE = {
  START: 'start',
  DELTA: 'delta',
  DONE: 'done',
  ERROR: 'error',
} as const;

export type ContentFormatStreamType =
  (typeof CONTENT_FORMAT_STREAM_TYPE)[keyof typeof CONTENT_FORMAT_STREAM_TYPE];

export type ContentFormatStreamEvent =
  | { type: 'start' }
  | { type: 'delta'; value: string }
  | { type: 'done' }
  | { type: 'error'; value: string };

export interface DeepseekPublicKeyResponse {
  publicKey: string;
  algorithm: 'RSA-OAEP';
  hash: 'SHA-256';
}

export interface DeepseekKeyValidationRequest {
  encryptedApiKey: string;
}

export interface DeepseekKeyValidationResponse {
  valid: boolean;
  message: string;
}

export const SSE_TYPE = {
  /** 开始 */
  START: 'start',
  /** 思考 */
  THINKING: 'thinking',
  /** 段落 */
  PARAGRAPH: 'paragraph',
  /** 结果 */
  RESULT: 'result',
  /** 劣势 */
  WEAKNESS: 'weakness',
  /** 评分 */
  SCORE: 'score',
  /** 完成 */
  DONE: 'done',
  /** 错误 */
  ERROR: 'error',
} as const;

export type SSEType = (typeof SSE_TYPE)[keyof typeof SSE_TYPE];

export type SSEEvent =
  | { type: 'start'; value: number }
  | { type: 'thinking'; value: string }
  | { type: 'weakness'; value: AnalysisItem }
  | { type: 'score'; value: number }
  | { type: 'done' }
  | { type: 'error'; value: string };

// Deep Insight Types
export interface TimelineIssue {
  type: 'conflict' | 'gap' | 'overlap';
  description: string;
  severity: 'high' | 'medium' | 'low';
  affectedPeriods: string[];
}

export interface SkillIssue {
  skill: string;
  claimed: string;
  reality: string;
  suggestion: string;
}

export interface MetricSuggestion {
  excerpt: string;
  category: 'performance' | 'scale' | 'impact' | 'efficiency';
  questions: string[];
  exampleMetric: string;
}

export interface JobMatchInsight {
  score: number;
  summary: string;
  matchedRequirements: string[];
  missingRequirements: string[];
  recommendations: string[];
}

export const DEEP_INSIGHT_TYPE = {
  /** 思考过程 */
  THINKING: 'thinking',
  /** 时间线问题 */
  TIMELINE_ISSUE: 'timeline_issue',
  /** 技能一致性问题 */
  SKILL_ISSUE: 'skill_issue',
  /** 指标建议 */
  METRIC_SUGGESTION: 'metric_suggestion',
  /** 岗位匹配度 */
  JOB_MATCH: 'job_match',
  /** 整体建议 */
  OVERALL: 'overall',
  /** 完成 */
  DONE: 'done',
  /** 错误 */
  ERROR: 'error',
} as const;

export type DeepInsightType = (typeof DEEP_INSIGHT_TYPE)[keyof typeof DEEP_INSIGHT_TYPE];

export type DeepInsightEvent =
  | { type: 'thinking'; value: string }
  | { type: 'timeline_issue'; value: TimelineIssue }
  | { type: 'skill_issue'; value: SkillIssue }
  | { type: 'metric_suggestion'; value: MetricSuggestion }
  | { type: 'job_match'; value: JobMatchInsight }
  | { type: 'overall'; value: string }
  | { type: 'done' }
  | { type: 'error'; value: string };
