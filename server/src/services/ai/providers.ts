import { createAnthropic } from '@ai-sdk/anthropic';
import { createDeepSeek } from '@ai-sdk/deepseek';

import { config } from '@/config/env.js';

/**
 * DeepSeek provider using official AI SDK provider
 */
console.log('=== DeepSeek Provider Initialization ===');
console.log('API Key Length:', config.deepseek.apiKey?.length);
console.log('API Key (first 10 chars):', config.deepseek.apiKey?.substring(0, 10));

export const deepseek = createDeepSeek({
  apiKey: config.deepseek.apiKey ?? '',
});

/**
 * Anthropic provider for Claude models
 */
export const anthropic = createAnthropic({
  apiKey: config.anthropic.apiKey ?? '',
});

/**
 * Model identifiers
 */
export const models = {
  deepseek: {
    chat: deepseek('deepseek-chat'),
    reasoner: deepseek('deepseek-reasoner'),
  },
  anthropic: {
    claude: anthropic('claude-sonnet-4-20250514'),
  },
} as const;
