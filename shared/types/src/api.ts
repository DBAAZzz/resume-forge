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
