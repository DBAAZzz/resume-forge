// Shared TypeScript types

export interface AgentRequest {
  prompt: string;
}

export interface DeepseekRequest {
  prompt: string;
  fileContent?: string; // 可选的文件内容（已解析的文本）
}

export interface TextDelta {
  type: 'text_delta';
  text: string;
}

export interface CompleteResponse {
  result: string;
}

export interface ErrorResponse {
  error: string;
}

// File parsing types
export type FileContentType = 'text' | 'image' | 'unsupported';

export interface ParsedFileContent {
  content: string; // 文本内容或 base64 编码的图像
  type: FileContentType;
  metadata?: {
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    pages?: number; // PDF 页数
    wordCount?: number; // 字数统计
  };
}

export interface FileBuffer {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

// Resume analysis types (段落编号法)
export interface ResumeAnalysisRequest {
  content: string; // 简历原文
}

export interface AnalysisItem {
  content: string; // 段落原文
  reason: string; // 原因
  startIndex: number; // 在原文中的起始位置
  endIndex: number; // 在原文中的结束位置
}

export interface ResumeAnalysisResponse {
  origin: string; // 原文
  good: AnalysisItem[]; // 好的段落
  bad: AnalysisItem[]; // 不好的段落
}

// LLM 返回的原始格式（段落编号）
export interface LLMAnalysisResult {
  good: Array<{ paragraphIndex: number; reason: string }>;
  bad: Array<{ paragraphIndex: number; reason: string }>;
}
