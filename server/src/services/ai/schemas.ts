import { z } from 'zod';

/**
 * Schema for a single analysis item (good or bad paragraph)
 */
export const analysisItemSchema = z.object({
  paragraphIndex: z.number().describe('The paragraph index from the input'),
  reason: z.string().describe('Explanation of why this paragraph is good or bad'),
});

/**
 * Schema for LLM resume analysis response
 */
export const resumeAnalysisSchema = z.object({
  good: z
    .array(analysisItemSchema)
    .describe(
      'Paragraphs with good content (specific data, quantified results, concrete examples)'
    ),
  bad: z
    .array(analysisItemSchema)
    .describe('Paragraphs with weak content (vague, lacking data, unclear)'),
  score: z.number().min(0).max(100).optional().describe('Overall resume quality score from 0-100'),
});

export type ResumeAnalysisSchemaType = z.infer<typeof resumeAnalysisSchema>;
