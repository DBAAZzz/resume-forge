import OpenAI from 'openai';

import { config } from '@/config/env.js';
import type {
  DeepseekRequest,
  TextDelta,
  ResumeAnalysisResponse,
  LLMAnalysisResult,
  AnalysisItem,
} from '@/types/index.js';

/**
 * 构建包含文件内容的完整 prompt
 */
function buildPromptWithFile(request: DeepseekRequest): string {
  if (!request.fileContent) {
    return request.prompt;
  }

  return `以下是上传的文件内容：
    ---
    ${request.fileContent}
    ---
    用户问题：${request.prompt}`;
}

// Streaming version
export async function* runDeepseekAgent(request: DeepseekRequest): AsyncGenerator<TextDelta> {
  const client = new OpenAI({
    baseURL: config.deepseek.baseUrl,
    apiKey: config.deepseek.apiKey,
  });

  const fullPrompt = buildPromptWithFile(request);

  try {
    const stream = await client.chat.completions.create({
      messages: [{ role: 'user', content: fullPrompt }],
      model: 'deepseek-chat',
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield { type: 'text_delta', text: content };
      }
    }
  } catch (error) {
    console.error('Error running Deepseek agent:', error);
    throw error;
  }
}

// Non-streaming version
export async function runDeepseekAgentComplete(request: DeepseekRequest): Promise<string> {
  const client = new OpenAI({
    baseURL: config.deepseek.baseUrl,
    apiKey: config.deepseek.apiKey,
  });

  const fullPrompt = buildPromptWithFile(request);

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: 'user', content: fullPrompt }],
      model: 'deepseek-chat',
      stream: false,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error running Deepseek agent (complete):', error);
    throw error;
  }
}

/**
 * 段落信息接口
 */
interface ParagraphInfo {
  index: number;
  content: string;
  startIndex: number;
  endIndex: number;
}

/**
 * 将原文按段落分割并编号
 * 按双换行或单换行分割，过滤空段落
 */
function splitIntoParagraphs(content: string): ParagraphInfo[] {
  const paragraphs: ParagraphInfo[] = [];
  // 按双换行或单换行分割
  const parts = content.split(/\n{1,2}/);

  let currentIndex = 0;
  let paragraphIndex = 0;

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.length > 0) {
      // 查找该段落在原文中的实际位置
      const startIndex = content.indexOf(part, currentIndex);
      const endIndex = startIndex + part.length;

      paragraphs.push({
        index: paragraphIndex,
        content: trimmed,
        startIndex,
        endIndex,
      });
      paragraphIndex++;
      currentIndex = endIndex;
    }
  }

  return paragraphs;
}

/**
 * 构建带段落编号的 prompt
 */
function buildAnalysisPrompt(paragraphs: ParagraphInfo[]): string {
  const numberedParagraphs = paragraphs.map((p) => `[段落${p.index}] ${p.content}`).join('\n\n');

  return `请分析以下简历内容，找出写得好的段落和写得不好的段落。

**重要要求**：
1. 使用段落编号（如 0, 1, 2...）来标识段落
2. 每个段落只分析一次，不要重复
3. 必须返回有效的 JSON 格式

**分析维度**：
- 好的段落（good）：有具体数据、量化结果、真实案例、清晰的技能描述、突出的成就
- 不好的段落（bad）：空泛模糊、缺少数据支撑、表述含糊、夸大其词、无关紧要的信息

请以 JSON 格式返回，结构如下：
{
  "good": [
    { "paragraphIndex": 0, "reason": "说明为什么好" }
  ],
  "bad": [
    { "paragraphIndex": 2, "reason": "说明为什么不好" }
  ]
}

以下是带编号的简历段落：

${numberedParagraphs}`;
}

/**
 * 分析简历内容（使用段落编号法 + JSON mode）
 */
export async function analyzeResumeStructured(content: string): Promise<ResumeAnalysisResponse> {
  const client = new OpenAI({
    baseURL: config.deepseek.baseUrl,
    apiKey: config.deepseek.apiKey,
  });

  // 1. 分割段落
  const paragraphs = splitIntoParagraphs(content);

  if (paragraphs.length === 0) {
    return {
      origin: content,
      good: [],
      bad: [],
    };
  }

  // 2. 构建 prompt
  const prompt = buildAnalysisPrompt(paragraphs);

  // 3. 调用 API（启用 JSON mode）
  const response = await client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'deepseek-chat',
    stream: false,
    response_format: { type: 'json_object' },
  });

  const rawResult = response.choices[0]?.message?.content || '{}';

  // 4. 解析 LLM 返回的 JSON
  let llmResult: LLMAnalysisResult;
  try {
    llmResult = JSON.parse(rawResult);
  } catch {
    console.error('Failed to parse LLM response:', rawResult);
    throw new Error('AI returned invalid JSON format');
  }

  // 5. 映射段落编号到实际内容和位置
  const mapToAnalysisItem = (item: {
    paragraphIndex: number;
    reason: string;
  }): AnalysisItem | null => {
    const paragraph = paragraphs.find((p) => p.index === item.paragraphIndex);
    if (!paragraph) {
      console.warn(`Paragraph index ${item.paragraphIndex} not found`);
      return null;
    }
    return {
      content: paragraph.content,
      reason: item.reason,
      startIndex: paragraph.startIndex,
      endIndex: paragraph.endIndex,
    };
  };

  const good: AnalysisItem[] = (llmResult.good || [])
    .map(mapToAnalysisItem)
    .filter((item): item is AnalysisItem => item !== null);

  const bad: AnalysisItem[] = (llmResult.bad || [])
    .map(mapToAnalysisItem)
    .filter((item): item is AnalysisItem => item !== null);

  return {
    origin: content,
    good,
    bad,
  };
}
