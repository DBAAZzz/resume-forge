import OpenAI from 'openai';
import { config } from '../config/env.js';
import type { DeepseekRequest, TextDelta } from '../types/index.js';

// Streaming version
export async function* runDeepseekAgent(request: DeepseekRequest): AsyncGenerator<TextDelta> {
  const client = new OpenAI({
    baseURL: config.deepseek.baseUrl,
    apiKey: config.deepseek.apiKey,
  });

  try {
    const stream = await client.chat.completions.create({
      messages: [{ role: 'user', content: request.prompt }],
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

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: 'user', content: request.prompt }],
      model: 'deepseek-chat',
      stream: false,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error running Deepseek agent (complete):', error);
    throw error;
  }
}
