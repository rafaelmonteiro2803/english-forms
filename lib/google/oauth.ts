import 'server-only';

// Google OAuth 2.0 for the teacher's calendar (separate from Supabase sign-in,
// because we need an offline refresh token with the calendar.events scope).

const SCOPES = ['openid', 'email', 'https://www.googleapis.com/auth/calendar.events'];

export const googleConfigured = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export function authUrl(state: string, redirectUri: string) {
  const q = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

async function tokenRequest(body: Record<string, string>) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, ...body }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Google token request failed (${res.status})`);
  return (await res.json()) as { access_token: string; refresh_token?: string; id_token?: string; scope?: string };
}

export async function exchangeCode(code: string, redirectUri: string) {
  const t = await tokenRequest({ code, redirect_uri: redirectUri, grant_type: 'authorization_code' });
  if (!t.refresh_token) throw new Error('Google did not return a refresh token');
  if (!t.scope?.includes('calendar.events')) throw new Error('Calendar access was not granted');
  return { refreshToken: t.refresh_token, email: emailFromIdToken(t.id_token) };
}

export async function accessToken(refreshToken: string) {
  return (await tokenRequest({ refresh_token: refreshToken, grant_type: 'refresh_token' })).access_token;
}

export async function revoke(refreshToken: string) {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(refreshToken)}`, { method: 'POST' }).catch(() => undefined);
}

/** The id_token comes straight from Google's token endpoint over TLS, so reading its payload is enough here. */
function emailFromIdToken(idToken?: string) {
  const payload = idToken?.split('.')[1];
  if (!payload) return '';
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { email?: string };
  return data.email ?? '';
}
