import 'server-only';
import { headers } from 'next/headers';

/** Public origin of the app, for OAuth redirect URLs. */
export async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

/** Only same-site paths are allowed as post-login destinations. */
export const safeNext = (next: unknown) =>
  typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';
