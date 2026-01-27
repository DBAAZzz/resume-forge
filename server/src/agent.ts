import { query, Options } from '@anthropic-ai/claude-agent-sdk';

export interface AgentRequest {
  prompt: string;
}

export async function* runAgent(request: AgentRequest) {
  const options: Options = {
    // Minimal options for now
    // You might want to configure permissionMode to 'bypassPermissions' or 'dontAsk'
    // if this is a backend service where you trust the input or want autonomous execution.
    // For safety, we'll stick to default or 'plan' if interactive.
    // But since it's an API, 'interactive' is hard.
    // Let's assume 'dontAsk' for now but this might fail if it tries to do something dangerous.
    permissionMode: 'dontAsk',
    // Actually the SDK might be designed for CLI mostly.
    // We will stream the output.
  };

  try {
    const q = query({
      prompt: request.prompt,
      options,
    });

    console.log('q', q);

    for await (const message of q) {
      yield message;
    }
  } catch (error) {
    console.error('Error running agent:', error);
    throw error;
  }
}
