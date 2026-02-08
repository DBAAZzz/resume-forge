import 'dotenv/config';

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 65535) {
    return parsed;
  }
  return fallback;
}

function parseInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isNaN(parsed) && parsed >= 0) {
    return parsed;
  }
  return fallback;
}

function parseCsv(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  const parsed = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
}

function parsePem(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  return normalized.replace(/\\n/g, '\n');
}

export const config = {
  deepseek: {
    get apiKey() {
      return process.env.DEEPSEEK_API_KEY;
    },
    get baseUrl() {
      return process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
    },
  },
  anthropic: {
    get apiKey() {
      return process.env.ANTHROPIC_API_KEY;
    },
  },
  cors: {
    get origins() {
      return parseCsv(process.env.CORS_ORIGIN, ['*']);
    },
    get credentials() {
      return parseBoolean(process.env.CORS_CREDENTIALS, false);
    },
    get maxAge() {
      return parseInteger(process.env.CORS_MAX_AGE, 86400);
    },
  },
  crypto: {
    get deepseekRsaPrivateKey() {
      return parsePem(process.env.DEEPSEEK_RSA_PRIVATE_KEY);
    },
    get deepseekRsaPublicKey() {
      return parsePem(process.env.DEEPSEEK_RSA_PUBLIC_KEY);
    },
  },
  server: {
    get port() {
      return parsePort(process.env.SERVER_PORT ?? process.env.PORT, 3000);
    },
    get host() {
      return process.env.SERVER_HOST || '0.0.0.0';
    },
    get trustProxy() {
      return parseBoolean(process.env.TRUST_PROXY, false);
    },
    get logLevel() {
      return process.env.LOG_LEVEL || 'info';
    },
  },
} as const;
