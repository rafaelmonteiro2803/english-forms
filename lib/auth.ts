import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { homeFor } from '@/components/shell/nav';
import { createClient } from '@/lib/supabase/server';
import type { Profile, UserRole } from '@/types/database';

/** The signed-in user's profile, or null. Cached per request. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', auth.user.id).single();
  return data;
});

/** Use in pages and actions: redirects to /login (or home) when access is not allowed. */
export async function requireRole(...roles: UserRole[]): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect('/login');
  if (roles.length && !roles.includes(profile.role)) redirect(homeFor(profile.role));
  return profile;
}

export const isStaff = (p: Pick<Profile, 'role'>) => p.role === 'admin' || p.role === 'teacher';
