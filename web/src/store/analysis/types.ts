import type { AnalysisItem, DeepseekModel } from '@resume/types';

export interface Suggestions {
  weakness: AnalysisItem[];
  score: number;
}

export type AnalysisVendor = 'deepseek';

export type AnalysisModel = DeepseekModel;
