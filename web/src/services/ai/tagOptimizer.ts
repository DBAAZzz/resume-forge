import { requestTagCandidates } from '@/api/ai';
import { encryptDeepseekApiKey } from '@/services/security/deepseekApiKey';

import type { DeepseekModel } from '@resume/types';

interface OptimizeTagCandidatesParams {
  text: string;
  reason?: string;
  context?: string;
  candidateCount?: number;
  model?: DeepseekModel;
  apiKey?: string;
}

export const optimizeTagCandidates = async ({
  text,
  reason,
  context,
  candidateCount = 3,
  model,
  apiKey,
}: OptimizeTagCandidatesParams): Promise<string[]> => {
  const encryptedApiKey = await encryptDeepseekApiKey(apiKey);

  const response = await requestTagCandidates({
    text,
    reason,
    context,
    candidateCount,
    model,
    encryptedApiKey,
  });

  return response.candidates ?? [];
};
