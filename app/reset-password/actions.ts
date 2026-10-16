'use server';

import { createClient } from '@/lib/supabase/server';
import { redirectWithToast } from '@/lib/http';
import { newPasswordSchema } from '@/lib/validation/auth';
import { formObject, invalid, type FormState } from '@/lib/validation/form';

export async function updatePassword(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse(formObject(fd));
  if (!parsed.success) return invalid(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  redirectWithToast('/', 'Password updated');
}
