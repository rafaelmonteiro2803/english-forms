import { z } from 'zod';

/** FormData → plain object; blank strings become undefined so optional fields stay optional. */
export function formObject(fd: FormData): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  fd.forEach((v, k) => {
    if (typeof v !== 'string' || k.startsWith('$ACTION')) return;
    const t = v.trim();
    out[k] = t === '' ? undefined : t;
  });
  return out;
}

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /** what the user typed, so the form can show it again (React resets forms after an action) */
  values?: Record<string, string | undefined>;
  ok?: boolean;
};

export function invalid(err: z.ZodError, values?: FormState['values']): FormState {
  return { error: 'Please check the highlighted fields.', fieldErrors: z.flattenError(err).fieldErrors as FormState['fieldErrors'], values };
}

export const id = z.guid({ error: 'Pick an option' });
export const day = z.string({ error: 'Required' }).regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Use a valid date' });
export const optionalText = (max = 120) => z.string().max(max, { error: `Up to ${max} characters` }).optional();
