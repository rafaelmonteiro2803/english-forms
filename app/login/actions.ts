'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { safeNext, siteOrigin } from '@/lib/http';
import { emailSchema, signInSchema } from '@/lib/validation/auth';
import { formObject, invalid, type FormState } from '@/lib/validation/form';

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse(formObject(fd));
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: 'Email or password is incorrect.' };
  redirect(safeNext(fd.get('next')));
}

export async function signInWithProvider(fd: FormData) {
  const provider = fd.get('provider') === 'linkedin_oidc' ? 'linkedin_oidc' : 'google';
  const next = safeNext(fd.get('next'));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect('/login?error=provider');
  redirect(data.url);
}

export async function sendPasswordReset(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(formObject(fd));
  if (!parsed.success) return invalid(parsed.error);
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=/reset-password`,
  });
  // same answer whether or not the account exists
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
