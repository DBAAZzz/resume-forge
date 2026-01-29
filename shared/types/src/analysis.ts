export interface AnalysisItem {
  content: string; // 段落原文
  reason: string; // 原因
  startIndex: number; // 在原文中的起始位置
  endIndex: number; // 在原文中的结束位置
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

export type SSEEvent =
  | { type: 'start'; paragraphCount: number }
  | { type: 'thinking'; text: string }
  | { type: 'chunk'; text: string }
  | { type: 'result'; data: ResumeAnalysisResponse }
  | { type: 'error'; message: string };
