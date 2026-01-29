import { generateText, streamText, Output } from 'ai';

import type { DeepseekRequest, TextDelta, SSEEvent, DeepInsightEvent } from '@/types/index.js';
import { SSE_TYPE, DEEP_INSIGHT_TYPE } from '@/types/index.js';

import { models, resumeAnalysisSchema, deepInsightSchema } from './ai/index.js';

/**
 * 段落信息接口
 */
interface ParagraphInfo {
  index: number;
  content: string;
}

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
      type: SSE_TYPE.ERROR,
      value: '没有找到内容',
    };
    return;
  }

  // 通知前端开始分析
  yield { type: 'start', value: paragraphs.length };

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
        yield { type: SSE_TYPE.THINKING, value: part.text };
      } else if (part.type === 'text-delta') {
        accumulatedJson += part.text;

        // Manual Extraction Logic

        // 1. Determine sections boundaries
        const goodStartMatch = accumulatedJson.match(/"strength":\s*\[/);
        const badStartMatch = accumulatedJson.match(/"weakness":\s*\[/);

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

          // Determine if it is in 'strength' or 'weakness'
          // If we have both arrays started, we decide based on position
          // Assuming 'strength' comes first usually, but checking indices is safer

          let isGood = false;
          let isBad = false;

          if (goodStartIndex !== -1 && (badStartIndex === -1 || itemIndex < badStartIndex)) {
            // Likely in strength
            if (itemIndex > goodStartIndex) isGood = true;
          }

          if (badStartIndex !== -1) {
            if (itemIndex > badStartIndex) isBad = true;
          }

          if (isGood) {
            if (!sentGoodIndices.has(index)) {
              const mapped = mapItem(itemData);
              if (mapped) {
                yield { type: SSE_TYPE.STRENGTH, value: mapped };
                sentGoodIndices.add(index);
              }
            }
          } else if (isBad) {
            if (!sentBadIndices.has(index)) {
              const mapped = mapItem(itemData);
              if (mapped) {
                yield { type: SSE_TYPE.WEAKNESS, value: mapped };
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
            yield { type: SSE_TYPE.SCORE, value: score };
            lastSentScore = score;
          }
        }
      }
    }

    // 最后发送完整结果作为兜底（可选，保持兼容性）
    yield { type: SSE_TYPE.DONE };
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

    yield { type: SSE_TYPE.ERROR, value: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 构建深度洞察分析的 prompt
 */
function buildDeepInsightPrompt(content: string): string {
  return `你是一个专业的简历审计专家，擅长发现逻辑漏洞和挖掘潜在价值。

    请对以下简历进行深度分析：

    ## 任务一：时间线审计
    检查以下问题：
    1. **时间冲突**：教育经历与工作经历是否有时间重叠？（除非是在职研究生/实习生）
    2. **不合理空白**：是否有超过6个月的无法解释的空白期？
    3. **项目时间**：项目时间是否与所在公司的任职时间匹配？

    标注严重程度：
    - high: 明显矛盾（如全日制读研期间有全职工作）
    - medium: 可能有问题（如有空白期但可能合理）
    - low: 轻微疑问

    ## 任务二：技能一致性验证
    交叉验证：
    1. **技能列表** vs **项目实践**：声称精通的技术是否在项目中体现？
    2. **熟练度匹配**：标注为"精通"的技能是否有深度应用？
    3. **技术栈一致性**：前后端技能声明是否与项目描述一致？

    ## 任务三：隐性指标挖掘
    识别以下模式的经历，生成引导性问题：
    - "负责/主导XX" → 问规模、成果、影响
    - "优化/改进XX" → 问前后对比数据
    - "开发/实现XX" → 问用户量、性能指标
    - "带领团队" → 问团队规模、交付成果

    每个建议需包含：
    1. 原文摘录（excerpt）
    2. 分类（category）: performance/scale/impact/efficiency
    3. 3-5个具体问题（questions）
    4. 一个量化示例（exampleMetric）让用户理解什么是好的指标

    ## 简历内容
    ${content}

    请仔细分析并输出结构化结果。`;
}

/**
 * 深度洞察分析（流式）- 时间线审计 + 技能一致性 + 指标挖掘
 */
export async function* analyzeResumeDeepInsights(
  content: string
): AsyncGenerator<DeepInsightEvent> {
  const prompt = buildDeepInsightPrompt(content);

  try {
    const { fullStream } = await streamText({
      model: models.deepseek.reasoner,
      output: Output.object({ schema: deepInsightSchema }),
      prompt,
      system: '你是一个专业的简历审计专家，擅长发现逻辑漏洞和挖掘潜在价值。',
    });

    console.log('✅ Deep Insight Stream created successfully');

    // 追踪已发送的条目，避免重复发送
    const sentTimelineIndices = new Set<number>();
    const sentSkillIndices = new Set<number>();
    const sentMetricIndices = new Set<number>();
    let accumulatedJson = '';
    let overallSent = false;

    // Regex patterns for progressive parsing
    const timelineItemRegex =
      /"type":\s*"(conflict|gap|overlap)",\s*"description":\s*"((?:[^"\\]|\\.)*)",\s*"severity":\s*"(high|medium|low)",\s*"affectedPeriods":\s*\[((?:[^\]\\]|\\.)*)\]/g;
    const skillItemRegex =
      /"skill":\s*"((?:[^"\\]|\\.)*)",\s*"claimed":\s*"((?:[^"\\]|\\.)*)",\s*"reality":\s*"((?:[^"\\]|\\.)*)",\s*"suggestion":\s*"((?:[^"\\]|\\.)*)"/g;
    const metricItemRegex =
      /"excerpt":\s*"((?:[^"\\]|\\.)*)",\s*"category":\s*"(performance|scale|impact|efficiency)",\s*"questions":\s*\[((?:[^\]\\]|\\.)*)\],\s*"exampleMetric":\s*"((?:[^"\\]|\\.)*)"/g;
    const overallRegex = /"overallSuggestion":\s*"((?:[^"\\]|\\.)*)"/;

    for await (const part of fullStream) {
      if (part.type === 'reasoning-delta') {
        // 发送思考过程
        yield { type: DEEP_INSIGHT_TYPE.THINKING, value: part.text };
      } else if (part.type === 'text-delta') {
        accumulatedJson += part.text;

        // Parse timeline issues
        const timelineMatches = [...accumulatedJson.matchAll(timelineItemRegex)];
        for (let i = 0; i < timelineMatches.length; i++) {
          if (!sentTimelineIndices.has(i)) {
            const match = timelineMatches[i];
            try {
              const affectedPeriods = JSON.parse(`[${match[4]}]`);
              yield {
                type: DEEP_INSIGHT_TYPE.TIMELINE_ISSUE,
                value: {
                  type: match[1] as 'conflict' | 'gap' | 'overlap',
                  description: match[2],
                  severity: match[3] as 'high' | 'medium' | 'low',
                  affectedPeriods,
                },
              };
              sentTimelineIndices.add(i);
            } catch {
              // JSON not complete yet, skip
            }
          }
        }

        // Parse skill issues
        const skillMatches = [...accumulatedJson.matchAll(skillItemRegex)];
        for (let i = 0; i < skillMatches.length; i++) {
          if (!sentSkillIndices.has(i)) {
            const match = skillMatches[i];
            yield {
              type: DEEP_INSIGHT_TYPE.SKILL_ISSUE,
              value: {
                skill: match[1],
                claimed: match[2],
                reality: match[3],
                suggestion: match[4],
              },
            };
            sentSkillIndices.add(i);
          }
        }

        // Parse metric suggestions
        const metricMatches = [...accumulatedJson.matchAll(metricItemRegex)];
        for (let i = 0; i < metricMatches.length; i++) {
          if (!sentMetricIndices.has(i)) {
            const match = metricMatches[i];
            try {
              const questions = JSON.parse(`[${match[3]}]`);
              yield {
                type: DEEP_INSIGHT_TYPE.METRIC_SUGGESTION,
                value: {
                  excerpt: match[1],
                  category: match[2] as 'performance' | 'scale' | 'impact' | 'efficiency',
                  questions,
                  exampleMetric: match[4],
                },
              };
              sentMetricIndices.add(i);
            } catch {
              // JSON not complete yet, skip
            }
          }
        }

        // Parse overall suggestion
        if (!overallSent) {
          const overallMatch = accumulatedJson.match(overallRegex);
          if (overallMatch) {
            yield {
              type: DEEP_INSIGHT_TYPE.OVERALL,
              value: overallMatch[1],
            };
            overallSent = true;
          }
        }
      }
    }

    yield { type: DEEP_INSIGHT_TYPE.DONE };
  } catch (error: any) {
    console.error('=== DeepSeek Deep Insight Error ===');
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

    yield {
      type: DEEP_INSIGHT_TYPE.ERROR,
      value: error instanceof Error ? error.message : String(error),
    };
  }
}
