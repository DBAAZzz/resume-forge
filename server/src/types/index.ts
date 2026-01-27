// Shared TypeScript types

export interface AgentRequest {
  prompt: string;
}

export interface DeepseekRequest {
  prompt: string;
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
