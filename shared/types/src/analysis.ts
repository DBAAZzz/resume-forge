export interface AnalysisItem {
  content: string; // 段落原文
  reason: string; // 原因
}

export interface ResumeAnalysisRequest {
  content: string; // 简历原文
}

export interface ResumeAnalysisResponse {
  origin: string; // 原文
  score: number; // 评分
  good: AnalysisItem[]; // 好的段落
  bad: AnalysisItem[]; // 不好的段落
}

export type SSEType =
  | 'start'
  | 'thinking'
  | 'chunk'
  | 'result'
  | 'good_item'
  | 'bad_item'
  | 'score'
  | 'done'
  | 'error';

export type SSEEvent =
  | { type: 'start'; paragraphCount: number }
  | { type: 'thinking'; text: string }
  | { type: 'chunk'; text: string }
  | { type: 'result'; data: ResumeAnalysisResponse }
  | { type: 'good_item'; data: AnalysisItem }
  | { type: 'bad_item'; data: AnalysisItem }
  | { type: 'score'; value: number }
  | { type: 'done' }
  | { type: 'error'; message: string };
