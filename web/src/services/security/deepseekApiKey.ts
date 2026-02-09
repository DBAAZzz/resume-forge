import { http } from '@/utils/fetch';

import type {
  DeepseekPublicKeyResponse,
  DeepseekKeyValidationRequest,
  DeepseekKeyValidationResponse,
} from '@resume/types';

const pemToArrayBuffer = (pem: string): ArrayBuffer => {
  const b64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s+/g, '');

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const importServerPublicKey = async (): Promise<CryptoKey> => {
  if (!window.crypto?.subtle) {
    throw new Error('当前浏览器不支持 Web Crypto，无法加密 API Key');
  }

  const keyPayload = await http.get<DeepseekPublicKeyResponse>('crypto/deepseek-public-key');
  const spki = pemToArrayBuffer(keyPayload.publicKey);

  return window.crypto.subtle.importKey(
    'spki',
    spki,
    { name: keyPayload.algorithm, hash: keyPayload.hash },
    false,
    ['encrypt']
  );
};

export const encryptDeepseekApiKey = async (
  plainApiKey: string | null | undefined
): Promise<string | undefined> => {
  const normalizedApiKey = plainApiKey?.trim();
  if (!normalizedApiKey) {
    return undefined;
  }

  const publicKey = await importServerPublicKey();
  const encoded = new TextEncoder().encode(normalizedApiKey);
  const encrypted = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, encoded);

  return arrayBufferToBase64(encrypted);
};

export const validateDeepseekApiKey = async (
  plainApiKey: string | null | undefined
): Promise<DeepseekKeyValidationResponse> => {
  const encryptedApiKey = await encryptDeepseekApiKey(plainApiKey);
  if (!encryptedApiKey) {
    return { valid: false, message: '请输入 API Key' };
  }

  const payload: DeepseekKeyValidationRequest = { encryptedApiKey };
  return http.post<DeepseekKeyValidationResponse>('deepseek/validate-key', payload);
};
