import ky from 'ky';

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
  // In production, use the configured API base URL
  return import.meta.env.VITE_API_BASE_URL || '';
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

/**
 * Type-safe wrapper for common HTTP methods
 */
export const http = {
  get: <T>(url: string, options?: Parameters<typeof api.get>[1]) => api.get(url, options).json<T>(),

  post: <T>(url: string, json?: unknown, options?: Parameters<typeof api.post>[1]) =>
    api.post(url, { json, ...options }).json<T>(),

  put: <T>(url: string, json?: unknown, options?: Parameters<typeof api.put>[1]) =>
    api.put(url, { json, ...options }).json<T>(),

  delete: <T>(url: string, options?: Parameters<typeof api.delete>[1]) =>
    api.delete(url, options).json<T>(),

  patch: <T>(url: string, json?: unknown, options?: Parameters<typeof api.patch>[1]) =>
    api.patch(url, { json, ...options }).json<T>(),
};

/**
 * Upload file with FormData
 */
export const uploadFile = async <T>(url: string, file: File, fieldName = 'file') => {
  const formData = new FormData();
  formData.append(fieldName, file);

  return api.post(url, { body: formData }).json<T>();
};
