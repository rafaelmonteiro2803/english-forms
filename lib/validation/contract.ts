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
