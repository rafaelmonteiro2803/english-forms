import { z } from 'zod';
import { addMonths } from '@/lib/dates';
import { day, id } from './form';

export const TERMS = [3, 6, 12] as const;

export const contractSchema = z
  .object({
    student_id: id,
    plan_id: id,
    lessons_per_month: z.coerce.number({ error: 'Enter a number' }).int().min(1, { error: 'At least 1 lesson' }).max(60),
    price: z.coerce.number({ error: 'Enter a value' }).min(0, { error: 'Cannot be negative' }).max(1_000_000),
    start_date: day,
    term_months: z.coerce.number().refine((n) => (TERMS as readonly number[]).includes(n), { error: 'Pick a term' }),
  })
  .transform(({ price, term_months, ...c }) => ({
    ...c,
    price_cents: Math.round(price * 100),
    renewal_date: addMonths(c.start_date, term_months),
  }));

export type ContractInput = z.infer<typeof contractSchema>;

export const contractUpdateSchema = z
  .object({
    id,
    lessons_per_month: z.coerce.number({ error: 'Enter a number' }).int().min(1, { error: 'At least 1 lesson' }).max(60),
    price: z.coerce.number({ error: 'Enter a value' }).min(0, { error: 'Cannot be negative' }).max(1_000_000),
    renewal_date: day,
    status: z.enum(['active', 'paused', 'ending']),
  })
  .transform(({ price, ...c }) => ({ ...c, price_cents: Math.round(price * 100) }));

export const planSchema = z
  .object({
    name: z.string({ error: 'Name is required' }).min(2, { error: 'Name is required' }).max(60),
    lessons_per_month: z.coerce.number({ error: 'Enter a number' }).int().min(1, { error: 'At least 1 lesson' }).max(60),
    list_price: z.coerce.number({ error: 'Enter a price' }).min(0, { error: 'Cannot be negative' }).max(1_000_000),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: 'Use a hex color like #3b82f6' }),
    description: z.string().max(120).optional(),
  })
  .transform(({ list_price, ...p }) => ({ ...p, list_price_cents: Math.round(list_price * 100), description: p.description ?? null }));
