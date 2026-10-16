import { z } from 'zod';
import { day, optionalText } from './form';

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

/** Free-form phone ("+55 11 98412-3307") that must contain 10–15 digits. */
const whatsapp = z
  .string({ error: 'WhatsApp is required' })
  .regex(/^\+?[\d\s().-]+$/, { error: 'Use digits, spaces and dashes only' })
  .refine((v) => { const n = v.replace(/\D/g, '').length; return n >= 10 && n <= 15; }, { error: 'Include country and area code' });

const linkedinUrl = z
  .string()
  .transform((v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`))
  .refine((v) => { try { return /(^|\.)linkedin\.com$/i.test(new URL(v).hostname); } catch { return false; } }, { error: 'Use a linkedin.com/in/… address' })
  .optional();

export const studentSchema = z.object({
  name: z.string({ error: 'Name is required' }).min(2, { error: 'Name is required' }).max(120),
  email: z.email({ error: 'Enter a valid email' }).transform((v) => v.toLowerCase()),
  whatsapp,
  company: optionalText(),
  role_title: optionalText(),
  cefr_level: z.enum(CEFR_LEVELS, { error: 'Pick a level' }),
  city: optionalText(),
  start_date: day,
  status: z.enum(['active', 'paused']).default('active'),
  linkedin_url: linkedinUrl,
  notes: optionalText(2000),
});

export type StudentInput = z.infer<typeof studentSchema>;
