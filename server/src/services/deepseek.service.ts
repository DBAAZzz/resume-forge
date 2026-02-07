import { createDeepSeek } from '@ai-sdk/deepseek';
import { generateText, streamText, Output } from 'ai';

import { config } from '../config/env.js';
import { CONTENT_FORMAT_STREAM_TYPE, SSE_TYPE, DEEP_INSIGHT_TYPE } from '../types/index.js';

import { models, resumeAnalysisSchema, deepInsightSchema } from './ai/index.js';

import type {
  DeepseekRequest,
  DeepseekModel,
  TextDelta,
  SSEEvent,
  DeepInsightEvent,
  ContentFormatStreamEvent,
} from '../types/index.js';

/**
 * 段落信息接口
 */
interface ParagraphInfo {
  index: number;
  content: string;
}

interface OptimizeTagCandidatesOptions {
  text: string;
  reason?: string;
  context?: string;
  candidateCount?: number;
  model?: DeepseekModel;
  apiKey?: string;
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

function buildTagOptimizePrompt(
  text: string,
  reason: string,
  context: string,
  candidateCount: number
): string {
  return `你是资深简历优化助手。请基于原句和问题原因，输出更有说服力的改写候选。

原句：
${text}

问题原因：
${reason || '未提供'}

上下文（可用于保持语义一致）：
${context || '未提供'}

要求：
1. 给出 ${candidateCount} 条中文候选句，每条 20-90 字。
2. 保持事实边界，不得虚构成果、数字、团队规模。
3. 优先增强动作、结果、业务价值表达，但不要堆砌形容词。
4. 候选之间要有风格差异（精炼型、结果型、技术型等）。
5. 不要输出解释，不要输出 markdown，不要代码块。

仅返回 JSON，格式如下：
{"candidates":["候选1","候选2","候选3"]}`;
}

function normalizeCandidate(text: string): string {
  return text
    .replace(/^[“"'`]+|[”"'`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractJsonCandidates(raw: string): string[] {
  const cleaned = raw
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  const parseCandidates = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }

    if (
      value &&
      typeof value === 'object' &&
      'candidates' in value &&
      Array.isArray((value as { candidates?: unknown[] }).candidates)
    ) {
      return ((value as { candidates: unknown[] }).candidates || []).filter(
        (item): item is string => typeof item === 'string'
      );
    }

    return [];
  };

  try {
    return parseCandidates(JSON.parse(cleaned));
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return parseCandidates(JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)));
      } catch {
        // continue fallback
      }
    }

    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      try {
        return parseCandidates(JSON.parse(cleaned.slice(firstBracket, lastBracket + 1)));
      } catch {
        // continue fallback
      }
    }
  }

  return cleaned
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*]|\d+[.)、])\s*/, '').trim())
    .filter(Boolean);
}

export async function optimizeTagCandidates({
  text,
  reason,
  context,
  candidateCount = 3,
  model = 'deepseek-chat',
  apiKey,
}: OptimizeTagCandidatesOptions): Promise<string[]> {
  const normalizedText = text.trim();
  if (!normalizedText) {
    return [];
  }

  const normalizedCount = Math.max(2, Math.min(5, Math.floor(candidateCount)));

  const { text: rawText } = await generateText({
    model: resolveDeepseekModel(model, apiKey),
    prompt: buildTagOptimizePrompt(
      normalizedText,
      reason?.trim() || '',
      context?.trim() || '',
      normalizedCount
    ),
    system: '你是一个严谨的中文简历优化助手。',
  });

  const originalNormalized = normalizeCandidate(normalizedText).toLowerCase();
  const deduped = Array.from(
    new Set(
      extractJsonCandidates(rawText)
        .map((item) => normalizeCandidate(item))
        .filter((item) => item.length > 0)
        .filter((item) => item.toLowerCase() !== originalNormalized)
    )
  );

  if (!deduped.length) {
    throw new Error('AI 未生成可用候选，请稍后重试');
  }

  return deduped.slice(0, normalizedCount);
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
    你是一个资深简历评审顾问，请对简历做通用质量审查，只输出“需要改进”的段落（weakness）。

    **重要要求**：
    1. 使用段落编号（如 0, 1, 2...）标识段落。
    2. 仅输出 weakness，不要输出 strength，不要输出其他字段说明。
    3. 每个段落最多命中一次，不要重复。
    4. **跳过无实际意义的段落**：不要评价以下类型的段落，直接忽略：
      - 标题（如"教育背景"、"工作经历"、"个人信息"等）
      - 公司名称、学校名称、职位名称等单独成行的文本
      - 日期、时间段（如"2020年-2023年"）
      - 分隔符、装饰性文本
      - 联系方式（邮箱、电话、地址等）
      只分析有实质描述内容的段落。

    **分析维度**：
    - 内容空泛：描述职责多、结果少，缺少具体动作与产出。
    - 缺少量化：没有关键指标（规模、性能、效率、成本、增长等）。
    - 证据不足：只写“熟悉/精通”，没有项目事实支撑。
    - 逻辑不清：主语不明、前后矛盾、时间或因果关系混乱。
    - 价值不明：看不出业务影响或个人贡献边界。

    **输出约束**：
    - 仅返回 JSON 对象，字段为 weakness 和 score。
    - weakness 内每项包含 paragraphIndex 和 reason。
    - reason 要具体指出问题，不要给模板化空话，不要包含“岗位/JD 匹配度”相关表述。

    以下是带编号的简历段落：
    ${numberedParagraphs}`;
}

function resolveDeepseekModel(model: DeepseekModel = 'deepseek-reasoner', apiKey?: string) {
  const normalizedApiKey = apiKey?.trim();
  if (normalizedApiKey) {
    const deepseekClient = createDeepSeek({ apiKey: normalizedApiKey });
    return model === 'deepseek-chat'
      ? deepseekClient('deepseek-chat')
      : deepseekClient('deepseek-reasoner');
  }

  return model === 'deepseek-chat' ? models.deepseek.chat : models.deepseek.reasoner;
}

function buildHierarchyFormatPrompt(content: string): string {
  return `
    你是简历文本排版助手。请将输入文本整理为层次清晰的 Markdown。

    硬性约束（必须全部满足）：
    1. 绝对不能修改原文的任何字词、数字、标点、大小写、顺序。
    2. 绝对不能新增解释性文本、总结、注释。
    3. 绝对不能删除原文内容。
    4. 只能添加 Markdown 结构符号（标题、列表标记、空行、必要缩进）。
    5. 不允许重排文本行顺序，不允许把两行合并成一行，也不允许把一行拆成多行。

    输出要求：
    - 只输出最终 Markdown 内容。
    - 不要使用代码块包裹，不要输出额外说明。

    以下是待处理原文：
    ${content}
  `;
}

function stripMarkdownStructuralPrefix(line: string): string {
  return line.replace(/^(\s*)(?:#{1,6}\s+|[-*+]\s+|\d+\.\s+)/, '$1');
}

function canonicalizeContent(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .filter((line) => !/^(\s*)([-*_]\s*){3,}\s*$/.test(line))
    .map(stripMarkdownStructuralPrefix)
    .join('\n')
    .trim();
}

function hasPreservedOriginalText(original: string, formatted: string): boolean {
  return canonicalizeContent(original) === canonicalizeContent(formatted);
}

/**
 * 在不改动原文内容的前提下，使用 AI 做 Markdown 层次化格式整理
 */
export async function formatContentHierarchy(
  content: string,
  model: DeepseekModel = 'deepseek-reasoner',
  apiKey?: string
): Promise<string> {
  const normalizedContent = content.replace(/\r\n/g, '\n').trim();
  if (!normalizedContent) {
    return '';
  }

  const { text } = await generateText({
    model: resolveDeepseekModel(model, apiKey),
    prompt: buildHierarchyFormatPrompt(normalizedContent),
    system: '你是一个严格遵循约束的文本结构化助手。',
  });

  const formattedContent = text.replace(/\r\n/g, '\n').trim();
  if (!formattedContent) {
    throw new Error('格式化失败：AI 未返回有效内容');
  }

  if (!hasPreservedOriginalText(normalizedContent, formattedContent)) {
    throw new Error('格式化失败：AI 输出修改了原文内容，请重试');
  }

  return formattedContent;
}

/**
 * 流式层次化格式整理（SSE），前端可增量渲染内容
 */
export async function* formatContentHierarchyStream(
  content: string,
  model: DeepseekModel = 'deepseek-reasoner',
  apiKey?: string
): AsyncGenerator<ContentFormatStreamEvent> {
  const normalizedContent = content.replace(/\r\n/g, '\n').trim();

  yield { type: CONTENT_FORMAT_STREAM_TYPE.START };

  if (!normalizedContent) {
    yield { type: CONTENT_FORMAT_STREAM_TYPE.DONE };
    return;
  }

  try {
    const { textStream } = await streamText({
      model: resolveDeepseekModel(model, apiKey),
      prompt: buildHierarchyFormatPrompt(normalizedContent),
      system: '你是一个严格遵循约束的文本结构化助手。',
    });

    for await (const delta of textStream) {
      if (!delta) continue;
      yield { type: CONTENT_FORMAT_STREAM_TYPE.DELTA, value: delta };
    }

    yield { type: CONTENT_FORMAT_STREAM_TYPE.DONE };
  } catch (error) {
    yield {
      type: CONTENT_FORMAT_STREAM_TYPE.ERROR,
      value: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function validateDeepseekApiKey(
  apiKey: string
): Promise<{ valid: boolean; message: string }> {
  const normalizedApiKey = apiKey.trim();
  if (!normalizedApiKey) {
    return { valid: false, message: 'API Key 不能为空' };
  }

  const baseUrl = config.deepseek.baseUrl.replace(/\/+$/, '');

  try {
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${normalizedApiKey}`,
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      return { valid: true, message: 'API Key 校验通过' };
    }

    let remoteMessage = '';
    try {
      const data = (await response.json()) as { error?: { message?: string } };
      remoteMessage = data.error?.message || '';
    } catch {
      remoteMessage = '';
    }

    if (response.status === 401 || response.status === 403) {
      return { valid: false, message: 'API Key 无效或已过期' };
    }

    return {
      valid: false,
      message: remoteMessage || `校验失败（HTTP ${response.status}）`,
    };
  } catch {
    return { valid: false, message: '无法连接 DeepSeek 服务，请稍后重试' };
  }
}

/**
 * 分析简历内容（SSE 流式版 - 真正的 Progressive JSON Parsing）
 */
export async function* analyzeResumeStructuredStream(
  content: string,
  model: DeepseekModel = 'deepseek-reasoner',
  apiKey?: string
): AsyncGenerator<SSEEvent> {
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
  try {
    const { fullStream } = await streamText({
      model: resolveDeepseekModel(model, apiKey),
      output: Output.object({ schema: resumeAnalysisSchema }),
      prompt,
      system: '你是一个专业的简历分析助手。',
    });

    console.log('✅ Stream created successfully');

    // 追踪已发送的条目，避免重复发送
    const sentWeaknessIndices = new Set<number>();
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
    const weaknessItemRegex = /"paragraphIndex":\s*(\d+),\s*"reason":\s*"((?:[^"\\]|\\.)*)"/g;
    const scoreRegex = /"score":\s*(\d+)/;

    for await (const part of fullStream) {
      if (part.type === 'reasoning-delta') {
        yield { type: SSE_TYPE.THINKING, value: part.text };
      } else if (part.type === 'text-delta') {
        accumulatedJson += part.text;

        // Manual Extraction Logic

        // 1. Find weakness section boundary
        const weaknessStartMatch = accumulatedJson.match(/"weakness":\s*\[/);
        const weaknessStartIndex = weaknessStartMatch
          ? weaknessStartMatch.index! + weaknessStartMatch[0].length
          : -1;

        // Find all items
        const matches = [...accumulatedJson.matchAll(weaknessItemRegex)];

        for (const match of matches) {
          const index = parseInt(match[1], 10);
          const reason = match[2];
          const itemIndex = match.index!;

          const itemData = { paragraphIndex: index, reason };

          // Only emit entries that are already inside weakness array section
          const isWeakness = weaknessStartIndex !== -1 && itemIndex > weaknessStartIndex;
          if (!isWeakness) continue;

          if (!sentWeaknessIndices.has(index)) {
            const mapped = mapItem(itemData);
            if (mapped) {
              yield { type: SSE_TYPE.WEAKNESS, value: mapped };
              sentWeaknessIndices.add(index);
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
function buildDeepInsightPrompt(
  content: string,
  targetRole?: string,
  jobDescription?: string
): string {
  const normalizedRole = targetRole?.trim();
  const normalizedJobDescription = jobDescription?.trim();
  const hasRoleContext = !!normalizedRole;
  const hasJdContext = !!normalizedJobDescription;

  return `你是一个专业的简历审计专家，擅长发现逻辑漏洞和挖掘潜在价值。

    目标岗位：${normalizedRole || '未提供'}
    岗位 JD：
    ${normalizedJobDescription || '未提供'}

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

    ## 任务四：岗位匹配度分析
    请基于目标岗位与 JD 对简历进行匹配度分析，输出 jobMatch 模块：
    1. score：0-100 的岗位匹配度分数
    2. summary：一句话总结当前匹配情况
    3. matchedRequirements：已匹配的岗位要求（3-6条）
    4. missingRequirements：缺失或弱匹配要求（3-6条）
    5. recommendations：可执行改进建议（3-6条）

    ${!hasRoleContext || !hasJdContext ? '若岗位或 JD 信息不完整，请根据已有信息做保守判断并在 summary 中说明不确定性。' : ''}

    ## 简历内容
    ${content}

    请仔细分析并输出结构化结果。`;
}

/**
 * 深度洞察分析（流式）- 时间线审计 + 技能一致性 + 指标挖掘 + 岗位匹配度
 */
export async function* analyzeResumeDeepInsights(
  content: string,
  model: DeepseekModel = 'deepseek-reasoner',
  apiKey?: string,
  targetRole?: string,
  jobDescription?: string
): AsyncGenerator<DeepInsightEvent> {
  const prompt = buildDeepInsightPrompt(content, targetRole, jobDescription);

  try {
    const { fullStream } = await streamText({
      model: resolveDeepseekModel(model, apiKey),
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
    let jobMatchSent = false;
    let overallSent = false;

    // Regex patterns for progressive parsing
    const timelineItemRegex =
      /"type":\s*"(conflict|gap|overlap)",\s*"description":\s*"((?:[^"\\]|\\.)*)",\s*"severity":\s*"(high|medium|low)",\s*"affectedPeriods":\s*\[((?:[^\]\\]|\\.)*)\]/g;
    const skillItemRegex =
      /"skill":\s*"((?:[^"\\]|\\.)*)",\s*"claimed":\s*"((?:[^"\\]|\\.)*)",\s*"reality":\s*"((?:[^"\\]|\\.)*)",\s*"suggestion":\s*"((?:[^"\\]|\\.)*)"/g;
    const metricItemRegex =
      /"excerpt":\s*"((?:[^"\\]|\\.)*)",\s*"category":\s*"(performance|scale|impact|efficiency)",\s*"questions":\s*\[((?:[^\]\\]|\\.)*)\],\s*"exampleMetric":\s*"((?:[^"\\]|\\.)*)"/g;
    const jobMatchRegex =
      /"jobMatch":\s*\{\s*"score":\s*(\d+(?:\.\d+)?),\s*"summary":\s*"((?:[^"\\]|\\.)*)",\s*"matchedRequirements":\s*\[((?:[^\]\\]|\\.)*)\],\s*"missingRequirements":\s*\[((?:[^\]\\]|\\.)*)\],\s*"recommendations":\s*\[((?:[^\]\\]|\\.)*)\]\s*\}/;
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

        // Parse job match insight
        if (!jobMatchSent) {
          const jobMatchMatch = accumulatedJson.match(jobMatchRegex);
          if (jobMatchMatch) {
            try {
              const matchedRequirements = JSON.parse(`[${jobMatchMatch[3]}]`);
              const missingRequirements = JSON.parse(`[${jobMatchMatch[4]}]`);
              const recommendations = JSON.parse(`[${jobMatchMatch[5]}]`);

              yield {
                type: DEEP_INSIGHT_TYPE.JOB_MATCH,
                value: {
                  score: Math.round(parseFloat(jobMatchMatch[1])),
                  summary: jobMatchMatch[2],
                  matchedRequirements,
                  missingRequirements,
                  recommendations,
                },
              };
              jobMatchSent = true;
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

    // Fallback: 如果正则没命中，尝试解析完整 JSON 再补发关键字段
    if ((!jobMatchSent || !overallSent) && accumulatedJson.trim().length > 0) {
      try {
        const parsed = JSON.parse(accumulatedJson) as {
          jobMatch?: {
            score: number;
            summary: string;
            matchedRequirements: string[];
            missingRequirements: string[];
            recommendations: string[];
          };
          overallSuggestion?: string;
        };

        if (!jobMatchSent && parsed.jobMatch) {
          const candidate = parsed.jobMatch;
          if (
            typeof candidate.score === 'number' &&
            typeof candidate.summary === 'string' &&
            Array.isArray(candidate.matchedRequirements) &&
            Array.isArray(candidate.missingRequirements) &&
            Array.isArray(candidate.recommendations)
          ) {
            yield {
              type: DEEP_INSIGHT_TYPE.JOB_MATCH,
              value: {
                score: Math.max(0, Math.min(100, Math.round(candidate.score))),
                summary: candidate.summary,
                matchedRequirements: candidate.matchedRequirements,
                missingRequirements: candidate.missingRequirements,
                recommendations: candidate.recommendations,
              },
            };
          }
        }

        if (!overallSent && typeof parsed.overallSuggestion === 'string') {
          yield {
            type: DEEP_INSIGHT_TYPE.OVERALL,
            value: parsed.overallSuggestion,
          };
        }
      } catch {
        // Ignore fallback parse errors
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
