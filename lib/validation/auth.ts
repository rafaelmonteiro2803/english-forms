import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email({ error: 'Enter a valid email' }),
  password: z.string({ error: 'Enter your password' }).min(1, { error: 'Enter your password' }),
});

export const emailSchema = z.object({ email: z.email({ error: 'Enter a valid email' }) });

export const newPasswordSchema = z
  .object({
    password: z.string({ error: 'Enter a password' }).min(8, { error: 'Use at least 8 characters' }),
    confirm: z.string({ error: 'Repeat the password' }),
  })
  .refine((v) => v.password === v.confirm, { error: 'Passwords do not match', path: ['confirm'] });
