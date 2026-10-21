import { NextResponse, type NextRequest } from 'next/server';
import { getProfile } from '@/lib/auth';
import { encrypt, TokenKeyError } from '@/lib/crypto';
import { exchangeCode, GoogleConnectError } from '@/lib/google/oauth';
import { pushPendingLessons, syncTeacher } from '@/lib/google/sync';
import { siteOrigin } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const origin = await siteOrigin();
  const back = (msg: string, tone?: 'error') => {
    const res = NextResponse.redirect(`${origin}/management/calendar?toast=${encodeURIComponent(msg)}${tone ? '&tone=error' : ''}`);
    res.cookies.delete({ name: 'g_oauth_state', path: '/api/google' });
    return res;
  };

  const profile = await getProfile();
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  if (request.nextUrl.searchParams.get('error')) return back('Google connection was cancelled', 'error');
  if (!profile || profile.role !== 'teacher') return back('Only teachers can connect a calendar', 'error');
  if (!code || !state || state !== request.cookies.get('g_oauth_state')?.value) {
    // the state cookie lives on the address that started the flow
    const here = request.nextUrl.host;
    return back(new URL(origin).host !== here
      ? `NEXT_PUBLIC_SITE_URL (${origin}) doesn’t match this site (${here}). Fix it in Vercel and redeploy.`
      : 'The Google connection expired. Please try again.', 'error');
  }

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
  } catch (err) {
    console.error('Google connect failed', err);
    if (err instanceof GoogleConnectError || err instanceof TokenKeyError) return back(err.message, 'error');
    return back('Could not connect Google Calendar. See the server logs for details.', 'error');
  }

  // connected: bring Google's events in and send lessons scheduled before connecting
  try {
    await syncTeacher(profile.id);
    const { pushed } = await pushPendingLessons(profile.id);
    return back(`Google Calendar connected${pushed ? ` · ${pushed} upcoming lesson${pushed === 1 ? '' : 's'} sent` : ''}`);
  } catch (err) {
    console.error('First Google sync failed', err);
    return back('Google Calendar connected, but the first sync failed. Try “Sync now”.', 'error');
  }
}
