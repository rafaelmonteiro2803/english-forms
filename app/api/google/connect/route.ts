import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getProfile } from '@/lib/auth';
import { authUrl, googleConfigured } from '@/lib/google/oauth';
import { siteOrigin } from '@/lib/http';

/** Starts the Google Calendar consent flow for the signed-in teacher. */
export async function GET() {
  const origin = await siteOrigin();
  const profile = await getProfile();
  if (!profile || profile.role !== 'teacher') return NextResponse.redirect(`${origin}/management/calendar`);
  if (!googleConfigured()) {
    return NextResponse.redirect(`${origin}/management/calendar?toast=${encodeURIComponent('Google Calendar is not configured on this server')}&tone=error`);
  }
  const state = randomBytes(24).toString('base64url');
  const res = NextResponse.redirect(authUrl(state, `${origin}/api/google/callback`));
  res.cookies.set('g_oauth_state', state, { httpOnly: true, secure: origin.startsWith('https'), sameSite: 'lax', maxAge: 600, path: '/api/google' });
  return res;
}
