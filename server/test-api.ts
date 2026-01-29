import 'dotenv/config';
import { streamText, generateText, Output } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';

const testSchema = z.object({
  good: z.array(
    z.object({
      paragraphIndex: z.number(),
      reason: z.string(),
    })
  ),
  bad: z.array(
    z.object({
      paragraphIndex: z.number(),
      reason: z.string(),
    })
  ),
  score: z.number().optional(),
});

async function testReasonerWithStructuredOutput() {
  console.log('\n=== Test 1: deepseek-reasoner + Structured Output ===');
  const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY ?? '',
  });

  try {
    const { partialOutputStream } = await streamText({
      model: deepseek('deepseek-reasoner'),
      output: Output.object({ schema: testSchema }),
      prompt: '分析这段简历：[段落0] 我有5年开发经验',
      system: '你是一个专业的简历分析助手。',
    });

    console.log('Stream created...');
    for await (const partial of partialOutputStream) {
      console.log('Partial:', JSON.stringify(partial, null, 2));
    }
    console.log('✅ Success!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.url) console.error('URL:', error.url);
    if (error.cause) console.error('Cause:', error.cause);
  }
}

async function testChatWithStructuredOutput() {
  console.log('\n=== Test 2: deepseek-chat + Structured Output ===');
  const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY ?? '',
  });

  try {
    const { partialOutputStream } = await streamText({
      model: deepseek('deepseek-chat'),
      output: Output.object({ schema: testSchema }),
      prompt: '分析这段简历：[段落0] 我有5年开发经验',
      system: '你是一个专业的简历分析助手。',
    });

    console.log('Stream created...');
    for await (const partial of partialOutputStream) {
      console.log('Partial:', JSON.stringify(partial, null, 2));
    }
    console.log('✅ Success!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.url) console.error('URL:', error.url);
  }
}

async function testReasonerPlainText() {
  console.log('\n=== Test 3: deepseek-reasoner + Plain Text (no structured output) ===');
  const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY ?? '',
  });

  try {
    const { text } = await generateText({
      model: deepseek('deepseek-reasoner'),
      prompt: 'Say hi',
    });

    console.log('Response:', text);
    console.log('✅ Success!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.url) console.error('URL:', error.url);
  }
}

// Run all tests
(async () => {
  await testReasonerWithStructuredOutput();
  await testChatWithStructuredOutput();
  await testReasonerPlainText();
})();
