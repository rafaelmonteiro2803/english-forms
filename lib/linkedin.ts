import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

// LinkedIn's public OpenID Connect API returns name, photo and email only.
// Headline, role, company and the public profile URL need LinkedIn partner
// approval, so those stay editable fields on the student record. Extend this
// function when that access is granted.

export type LinkedInSync = { ok: true; message: string } | { ok: false; message: string };

/** Copies name and photo from the user's LinkedIn sign-in onto their profile and student record. */
export async function syncLinkedIn(userId: string): Promise<LinkedInSync> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) return { ok: false, message: 'User not found.' };

  const identity = data.user.identities?.find((i) => i.provider === 'linkedin_oidc');
  if (!identity) return { ok: false, message: 'This student has not connected LinkedIn yet.' };

  const info = identity.identity_data ?? {};
  const picture = typeof info.picture === 'string' ? info.picture : null;
  const name = typeof info.name === 'string' ? info.name : null;

  await admin.from('profiles').update({ ...(picture && { avatar_url: picture }), ...(name && { name }) }).eq('id', userId);
  await admin.from('students').update({ linkedin_synced_at: new Date().toISOString() }).eq('profile_id', userId);
  return { ok: true, message: 'Profile synced from LinkedIn' };
}
