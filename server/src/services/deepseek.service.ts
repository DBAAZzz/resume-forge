import { generateText, streamText, Output } from 'ai';

import type { DeepseekRequest, TextDelta, SSEEvent } from '@/types/index.js';

import { models, resumeAnalysisSchema } from './ai/index.js';

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
  const fullPrompt = buildPromptWithFile(request);

  try {
    const { textStream } = await streamText({
      model: models.deepseek.chat,
      prompt: fullPrompt,
    });

    for await (const textPart of textStream) {
      yield { type: 'text_delta', text: textPart };
    }
  } catch (error) {
    console.error('Error running Deepseek agent:', error);
    throw error;
  }
}

// Non-streaming version
export async function runDeepseekAgentComplete(request: DeepseekRequest): Promise<string> {
  const fullPrompt = buildPromptWithFile(request);

  try {
    const { text } = await generateText({
      model: models.deepseek.chat,
      prompt: fullPrompt,
    });

    return text;
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

  return `
    请分析以下简历内容，找出写得好的段落和写得不好的段落。
    **重要要求**：
    1. 使用段落编号（如 0, 1, 2...）来标识段落
    2. 每个段落只分析一次，不要重复
    3. **跳过无实际意义的段落**：不要评价以下类型的段落，直接忽略它们：
      - 标题（如"教育背景"、"工作经历"、"个人信息"等）
      - 公司名称、学校名称、职位名称等单独成行的文本
      - 日期、时间段（如"2020年-2023年"）
      - 分隔符、装饰性文本
      - 联系方式（邮箱、电话、地址等）
      只分析有实质描述内容的段落

    **分析维度**：
    - 好的段落（good）：有具体数据、量化结果、真实案例、清晰的技能描述、突出的成就
    - 不好的段落（bad）：空泛模糊、缺少数据支撑、表述含糊、夸大其词、无关紧要的信息

    以下是带编号的简历段落：
    ${numberedParagraphs}`;
}

/**
 * 分析简历内容（SSE 流式版 - 真正的 Progressive JSON Parsing）
 */
export async function* analyzeResumeStructuredStream(content: string): AsyncGenerator<SSEEvent> {
  // 1. 分割段落
  const paragraphs = splitIntoParagraphs(content);

  if (paragraphs.length === 0) {
    yield {
      type: 'result',
      data: { origin: content, score: 0, good: [], bad: [] },
    };
    return;
  }

  // 通知前端开始分析
  yield { type: 'start', paragraphCount: paragraphs.length };

  // 2. 构建 prompt
  const prompt = buildAnalysisPrompt(paragraphs);

  // 3. 调用 API（流式结构化输出）
  // 使用 deepseek-reasoner 模型以获得更好的推理能力
  try {
    const { fullStream } = await streamText({
      model: models.deepseek.reasoner,
      output: Output.object({ schema: resumeAnalysisSchema }),
      prompt,
      system: '你是一个专业的简历分析助手。',
    });

    console.log('✅ Stream created successfully');

    // 追踪已发送的条目，避免重复发送
    const sentGoodIndices = new Set<number>();
    const sentBadIndices = new Set<number>();
    let accumulatedJson = '';
    let lastSentScore: number | undefined;

    // 辅助函数：映射段落索引到内容
    const mapItem = (item: { paragraphIndex: number; reason: string }) => {
      const p = paragraphs.find((p) => p.index === item.paragraphIndex);
      if (!p) return null;
      return {
        content: p.content,
        reason: item.reason,
      };
    };

    // Regex patterns
    const goodItemRegex = /"paragraphIndex":\s*(\d+),\s*"reason":\s*"((?:[^"\\]|\\.)*)"/g;
    const scoreRegex = /"score":\s*(\d+)/;

    for await (const part of fullStream) {
      if (part.type === 'reasoning-delta') {
        yield { type: 'thinking', text: part.text };
      } else if (part.type === 'text-delta') {
        accumulatedJson += part.text;

        // Manual Extraction Logic

        // 1. Determine sections boundaries
        const goodStartMatch = accumulatedJson.match(/"good":\s*\[/);
        const badStartMatch = accumulatedJson.match(/"bad":\s*\[/);

        const goodStartIndex = goodStartMatch
          ? goodStartMatch.index! + goodStartMatch[0].length
          : -1;
        const badStartIndex = badStartMatch ? badStartMatch.index! + badStartMatch[0].length : -1;

        // Find all items
        const matches = [...accumulatedJson.matchAll(goodItemRegex)];

        for (const match of matches) {
          const index = parseInt(match[1], 10);
          const reason = match[2];
          const itemIndex = match.index!;

          const itemData = { paragraphIndex: index, reason };

          // Determine if it is in 'good' or 'bad'
          // If we have both arrays started, we decide based on position
          // Assuming 'good' comes first usually, but checking indices is safer

          let isGood = false;
          let isBad = false;

          if (goodStartIndex !== -1 && (badStartIndex === -1 || itemIndex < badStartIndex)) {
            // Likely in good
            if (itemIndex > goodStartIndex) isGood = true;
          }

          if (badStartIndex !== -1) {
            if (itemIndex > badStartIndex) isBad = true;
          }

          if (isGood) {
            if (!sentGoodIndices.has(index)) {
              const mapped = mapItem(itemData);
              if (mapped) {
                yield { type: 'good_item', data: mapped };
                sentGoodIndices.add(index);
              }
            }
          } else if (isBad) {
            if (!sentBadIndices.has(index)) {
              const mapped = mapItem(itemData);
              if (mapped) {
                yield { type: 'bad_item', data: mapped };
                sentBadIndices.add(index);
              }
            }
          }
        }

        // Check Score
        const scoreMatch = accumulatedJson.match(scoreRegex);
        if (scoreMatch) {
          const score = parseInt(scoreMatch[1], 10);
          if (score !== lastSentScore) {
            yield { type: 'score', value: score };
            lastSentScore = score;
          }
        }
      }
    }

    // 最后发送完整结果作为兜底（可选，保持兼容性）
    yield { type: 'done' };
  } catch (error: any) {
    console.error('=== DeepSeek API Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    if (error.url) console.error('Request URL:', error.url);
    if (error.statusCode) console.error('Status Code:', error.statusCode);
    if (error.responseHeaders) console.error('Response Headers:', error.responseHeaders);
    if (error.responseBody) console.error('Response Body:', error.responseBody);
    if (error.cause) {
      console.error('Error Cause:', error.cause);
      if (error.cause.url) console.error('Cause URL:', error.cause.url);
    }
    console.error('Full error object:', JSON.stringify(error, null, 2));
    console.error('Error stack:', error.stack);

    yield { type: 'error', message: error instanceof Error ? error.message : String(error) };
  }
}
