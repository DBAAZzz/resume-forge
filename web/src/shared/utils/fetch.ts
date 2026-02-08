import ky from 'ky';

let hasWarnedMissingApiBaseUrl = false;

/**
 * Get API base URL from environment variables
 * In development with Vite proxy, use empty string to proxy through Vite dev server
 * In production, use the configured API base URL
 */
const getApiBaseUrl = () => {
  // In development, Vite proxy handles the routing, so we use empty prefix
  if (import.meta.env.DEV) {
    return '';
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (baseUrl) {
    return baseUrl;
  }

  if (!hasWarnedMissingApiBaseUrl) {
    console.warn(
      '[API] VITE_API_BASE_URL is not set in production. Requests will use relative paths and likely fail.'
    );
    hasWarnedMissingApiBaseUrl = true;
  }

  return '';
};

export const api = ky.create({
  prefixUrl: getApiBaseUrl(),
  timeout: 30000, // 30 seconds
  retry: {
    limit: 2,
    methods: ['get', 'post'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      () => {
        // Add any global headers here if needed in the future
        // Example: request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        // Handle global response logic
        if (!response.ok) {
          const error = (await response.json().catch(() => ({ error: 'Unknown error' }))) as {
            error: string;
          };
          throw new Error(error.error || `Request failed with status ${response.status}`);
        }
        return response;
      },
    ],
  },
});

const normalizeApiPath = (url: string) => (url.startsWith('/') ? url.slice(1) : url);

/**
 * Type-safe wrapper for common HTTP methods
 */
export const http = {
  get: <T>(url: string, options?: Parameters<typeof api.get>[1]) =>
    api.get(normalizeApiPath(url), options).json<T>(),

  post: <T>(url: string, json?: unknown, options?: Parameters<typeof api.post>[1]) =>
    api.post(normalizeApiPath(url), { json, ...options }).json<T>(),

  put: <T>(url: string, json?: unknown, options?: Parameters<typeof api.put>[1]) =>
    api.put(normalizeApiPath(url), { json, ...options }).json<T>(),

  delete: <T>(url: string, options?: Parameters<typeof api.delete>[1]) =>
    api.delete(normalizeApiPath(url), options).json<T>(),

  patch: <T>(url: string, json?: unknown, options?: Parameters<typeof api.patch>[1]) =>
    api.patch(normalizeApiPath(url), { json, ...options }).json<T>(),
};

/**
 * Upload file with FormData
 */
export const uploadFile = async <T>(url: string, file: File, fieldName = 'file') => {
  const formData = new FormData();
  formData.append(fieldName, file);

  return api.post(normalizeApiPath(url), { body: formData }).json<T>();
};
