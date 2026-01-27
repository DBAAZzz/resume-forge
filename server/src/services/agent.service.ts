import { query, Options } from '@anthropic-ai/claude-agent-sdk';

import type { AgentRequest } from '../types/index.js';

export async function* runAgent(request: AgentRequest) {
  const options: Options = {
    permissionMode: 'dontAsk',
  };

  try {
    const q = query({
      prompt: request.prompt,
      options,
    });

    for await (const message of q) {
      yield message;
    }
  } catch (error) {
    console.error('Error running agent:', error);
    throw error;
  }
}
