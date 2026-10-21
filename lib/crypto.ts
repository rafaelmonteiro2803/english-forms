import 'server-only';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// AES-256-GCM for secrets at rest (Google refresh tokens).
// Stored as "v1:" + base64(iv | auth tag | ciphertext).

export class TokenKeyError extends Error {}

function key() {
  const k = Buffer.from(process.env.GOOGLE_TOKEN_KEY ?? '', 'base64');
  if (k.length !== 32) throw new TokenKeyError('GOOGLE_TOKEN_KEY is missing or not 32 bytes (create one with: openssl rand -base64 32)');
  return k;
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return 'v1:' + Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
}

export function decrypt(stored: string): string {
  if (!stored.startsWith('v1:')) throw new Error('Unknown secret format');
  const raw = Buffer.from(stored.slice(3), 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key(), raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8');
}
