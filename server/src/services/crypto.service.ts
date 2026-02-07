import { constants, generateKeyPairSync, privateDecrypt } from 'node:crypto';

const deepseekKeyPair = generateKeyPairSync('rsa', {
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
