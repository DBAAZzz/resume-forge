// Relative URL relying on Vite proxy
const API_BASE_URL = '';

export interface AnalysisResponse {
  content: string;
  type: string;
  metadata: Record<string, string>;
}

export interface DeepSeekResponse {
  result: {
    type: 'text';
    content: string;
  };
}

/**
 * Upload a file to parse its content
 * POST /file/parse
 */
export const parseFile = async (file: File): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/file/parse`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to parse file');
  }

  return response.json();
};

/**
 * Send parsed content to DeepSeek for analysis
 * POST /deepseek/complete
 */
export const analyzeContent = async (content: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/deepseek/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: `Please analyze the following resume content and provide:
1. A score out of 100 on the first line.
2. A list of "Strong Points" (good).
3. A list of "Improvements" (bad).

Format the output strictly as JSON with keys: "score" (number), "good" (array of strings), "bad" (array of strings). Do not include any markdown formatting or code blocks around the JSON.

Resume Content:
${content}`,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to analyze content');
  }

  const data: DeepSeekResponse = await response.json();
  return data.result.content;
};
