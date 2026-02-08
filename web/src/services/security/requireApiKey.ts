const MISSING_DEEPSEEK_API_KEY_MESSAGE = '请先在模型配置中填写 DeepSeek API Key';

export const requireDeepseekApiKey = (plainApiKey: string | null | undefined): string => {
  const normalizedApiKey = plainApiKey?.trim();
  if (!normalizedApiKey) {
    throw new Error(MISSING_DEEPSEEK_API_KEY_MESSAGE);
  }
  return normalizedApiKey;
};

export { MISSING_DEEPSEEK_API_KEY_MESSAGE };
