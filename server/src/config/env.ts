// Environment configuration
// Using getters to ensure env vars are read after dotenv.config()
export const config = {
  deepseek: {
    get apiKey() {
      return process.env.DEEPSEEK_API_KEY;
    },
    get baseUrl() {
      return process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    },
  },
  server: {
    get port() {
      return parseInt(process.env.PORT || '3000', 10);
    },
    get host() {
      return '0.0.0.0';
    },
  },
} as const;
