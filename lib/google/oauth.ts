import 'server-only';

// Google OAuth 2.0 for the teacher's calendar (separate from Supabase sign-in,
// because we need an offline refresh token with the calendar.events scope).

const SCOPES = ['openid', 'email', 'https://www.googleapis.com/auth/calendar.events'];

/** A connection problem with a message the teacher can act on. */
export class GoogleConnectError extends Error {}

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
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; error_description?: string };
    console.error('Google token request failed', res.status, body);
    if (body.error === 'redirect_uri_mismatch') throw new GoogleConnectError('Google rejected the return address. Check the redirect URI in Google Cloud and NEXT_PUBLIC_SITE_URL.');
    if (body.error === 'invalid_client') throw new GoogleConnectError('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is wrong.');
    throw new Error(`Google token request failed (${res.status} ${body.error ?? ''})`);
  }
  return (await res.json()) as { access_token: string; refresh_token?: string; id_token?: string; scope?: string };
}

export async function exchangeCode(code: string, redirectUri: string) {
  const t = await tokenRequest({ code, redirect_uri: redirectUri, grant_type: 'authorization_code' });
  if (!t.scope?.includes('calendar.events')) throw new GoogleConnectError('Calendar access was not granted. On Google’s screen, tick the Google Calendar permission and try again.');
  if (!t.refresh_token) throw new GoogleConnectError('Google did not grant offline access. Remove English Forms at myaccount.google.com/permissions and connect again.');
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
