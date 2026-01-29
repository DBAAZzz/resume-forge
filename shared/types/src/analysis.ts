export interface AnalysisItem {
  content: string; // 段落原文
  reason: string; // 原因
}

export interface ResumeAnalysisRequest {
  content: string; // 简历原文
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
  /** 优势 */
  STRENGTH: 'strength',
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
  | { type: 'strength'; value: AnalysisItem }
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

export const DEEP_INSIGHT_TYPE = {
  /** 思考过程 */
  THINKING: 'thinking',
  /** 时间线问题 */
  TIMELINE_ISSUE: 'timeline_issue',
  /** 技能一致性问题 */
  SKILL_ISSUE: 'skill_issue',
  /** 指标建议 */
  METRIC_SUGGESTION: 'metric_suggestion',
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
  | { type: 'overall'; value: string }
  | { type: 'done' }
  | { type: 'error'; value: string };
