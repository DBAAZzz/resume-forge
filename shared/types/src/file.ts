export type FileContentType = 'text' | 'image' | 'unsupported';

export interface ParsedFileContent {
  content: string; // 文本内容或 base64 编码的图像
  type: FileContentType;
  metadata?: {
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    wordCount?: number; // 字数统计
  };
}
