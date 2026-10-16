import { NextResponse, type NextRequest } from 'next/server';
import { getProfile } from '@/lib/auth';
import { encrypt } from '@/lib/crypto';
import { exchangeCode } from '@/lib/google/oauth';
import { syncTeacher } from '@/lib/google/sync';
import { siteOrigin } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const origin = await siteOrigin();
  const back = (msg: string, tone?: 'error') =>
    NextResponse.redirect(`${origin}/management/calendar?toast=${encodeURIComponent(msg)}${tone ? '&tone=error' : ''}`);

  const profile = await getProfile();
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  if (!profile || profile.role !== 'teacher') return back('Only teachers can connect a calendar', 'error');
  if (!code || !state || state !== request.cookies.get('g_oauth_state')?.value) return back('Google connection was cancelled', 'error');

  try {
    const { refreshToken, email } = await exchangeCode(code, `${origin}/api/google/callback`);
    const supabase = await createClient();
    const { error } = await supabase.from('google_accounts').upsert({
      teacher_id: profile.id,
      email: email || profile.email,
      refresh_token: encrypt(refreshToken),
      sync_token: null,
    });
    if (error) throw error;
    await syncTeacher(profile.id);
  } catch (err) {
    console.error('Google connect failed', err);
    return back('Could not connect Google Calendar', 'error');
  }
  const res = back('Google Calendar connected');
  res.cookies.delete({ name: 'g_oauth_state', path: '/api/google' });
  return res;
}
