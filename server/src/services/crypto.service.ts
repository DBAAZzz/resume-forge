import { constants, createPublicKey, generateKeyPairSync, privateDecrypt } from 'node:crypto';

import { config } from '../config/env.js';

function createEphemeralKeyPair() {
  return generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
}

function createConfiguredKeyPair() {
  const privateKey = config.crypto.deepseekRsaPrivateKey;
  if (!privateKey) {
    return createEphemeralKeyPair();
  }

  const publicKey =
    config.crypto.deepseekRsaPublicKey ||
    createPublicKey(privateKey)
      .export({
        type: 'spki',
        format: 'pem',
      })
      .toString();

  return { privateKey, publicKey };
}

const deepseekKeyPair = createConfiguredKeyPair();

export const getDeepseekPublicKey = (): string => deepseekKeyPair.publicKey;

export const decryptDeepseekApiKey = (encryptedApiKey: string): string => {
  const decrypted = privateDecrypt(
    {
      key: deepseekKeyPair.privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(encryptedApiKey, 'base64')
  );

  return decrypted.toString('utf8').trim();
};
