import { z } from 'zod';

/**
 * Schema for a single analysis item (strength or weakness paragraph)
 */
export const analysisItemSchema = z.object({
  paragraphIndex: z.number().describe('The paragraph index from the input'),
  reason: z.string().describe('Explanation of why this paragraph is strength or weakness'),
});

/**
 * Schema for LLM resume analysis response
 */
export const resumeAnalysisSchema = z.object({
  strength: z
    .array(analysisItemSchema)
    .describe(
      'Paragraphs with strength content (specific data, quantified results, concrete examples)'
    ),
  weakness: z
    .array(analysisItemSchema)
    .describe('Paragraphs with weak content (vague, lacking data, unclear)'),
  score: z.number().min(0).max(100).optional().describe('Overall resume quality score from 0-100'),
});

export type ResumeAnalysisSchemaType = z.infer<typeof resumeAnalysisSchema>;

/**
 * Schema for timeline issue detection
 */
export const timelineIssueSchema = z.object({
  type: z
    .enum(['conflict', 'gap', 'overlap'])
    .describe('Type of timeline issue: conflict, gap, or overlap'),
  description: z.string().describe('Detailed description of the timeline issue'),
  severity: z.enum(['high', 'medium', 'low']).describe('Severity level of the issue'),
  affectedPeriods: z
    .array(z.string())
    .describe('Related time periods that have issues (e.g., "2020-2022 研究生", "2021 全职工作")'),
});

/**
 * Schema for skill consistency issue
 */
export const skillIssueSchema = z.object({
  skill: z.string().describe('The skill in question'),
  claimed: z.string().describe('What the resume claims about this skill'),
  reality: z.string().describe('What the actual project experience shows'),
  suggestion: z.string().describe('Suggestion for how to fix this inconsistency'),
});

/**
 * Schema for metric suggestion
 */
export const metricSuggestionSchema = z.object({
  excerpt: z.string().describe('The excerpt from resume that can be quantified'),
  category: z
    .enum(['performance', 'scale', 'impact', 'efficiency'])
    .describe('Category of the metric'),
  questions: z
    .array(z.string())
    .describe('Guiding questions to help user quantify their achievement (3-5 questions)'),
  exampleMetric: z
    .string()
    .describe('An example of what a good quantified version would look like'),
});

/**
 * Schema for deep resume insights (logic audit + metric mining)
 */
export const deepInsightSchema = z.object({
  timelineIssues: z
    .array(timelineIssueSchema)
    .describe('Timeline conflicts, gaps, or overlaps detected in the resume'),
  skillIssues: z
    .array(skillIssueSchema)
    .describe('Skill consistency issues between claims and actual project experience'),
  metricSuggestions: z
    .array(metricSuggestionSchema)
    .describe('Suggestions for quantifying achievements that lack metrics'),
  overallSuggestion: z.string().describe('Overall suggestion for improving the resume'),
});

export type DeepInsightSchemaType = z.infer<typeof deepInsightSchema>;
