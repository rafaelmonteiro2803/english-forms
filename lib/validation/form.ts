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
  /** set when a mutation finished: where the form goes next and what to tell the user */
  done?: { path: string; message: string; tone: 'ok' | 'error'; at: number };
};

export function invalid(err: z.ZodError, values?: FormState['values']): FormState {
  return { error: 'Please check the highlighted fields.', fieldErrors: z.flattenError(err).fieldErrors as FormState['fieldErrors'], values };
}

/**
 * Result of a mutation. The submitting form shows `message` as a toast and
 * moves to `path`, or refreshes when already there (see useActionDone).
 */
export function done(path: string, message: string, tone: 'ok' | 'error' = 'ok'): FormState {
  return { done: { path, message, tone, at: Date.now() } };
}

export const id = z.guid({ error: 'Pick an option' });
export const day = z.string({ error: 'Required' }).regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Use a valid date' });
export const optionalText = (max = 120) => z.string().max(max, { error: `Up to ${max} characters` }).optional();
