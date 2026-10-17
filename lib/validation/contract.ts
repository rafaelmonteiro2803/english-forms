import { z } from 'zod';
import { addMonths } from '@/lib/dates';
import { day, id } from './form';

export const TERMS = [3, 6, 12] as const;

export const BILLING_TYPES = ['monthly', 'per_lesson'] as const;

const money = z.coerce.number({ error: 'Enter a value' }).min(0, { error: 'Cannot be negative' }).max(1_000_000);
const lessons = z.coerce.number({ error: 'Enter a number' }).int().min(1, { error: 'At least 1 lesson' }).max(60);

/** Billing fields shared by create and edit. Blank amounts arrive as undefined. */
const billing = {
  lessons_per_month: lessons,
  billing_type: z.enum(BILLING_TYPES).default('monthly'),
  price: money.optional(),
  lesson_price: money.optional(),
};

type BillingInput = { lessons_per_month: number; billing_type: 'monthly' | 'per_lesson'; price?: number; lesson_price?: number };

function requireAmount(v: BillingInput, ctx: z.RefinementCtx) {
  if (v.billing_type === 'per_lesson' && v.lesson_price === undefined) ctx.addIssue({ code: 'custom', path: ['lesson_price'], message: 'Enter the price per lesson' });
  if (v.billing_type === 'monthly' && v.price === undefined) ctx.addIssue({ code: 'custom', path: ['price'], message: 'Enter the monthly value' });
}

/**
 * Per lesson: the monthly value is projected as price per lesson × lessons per month.
 * Monthly: a fixed value, no price per lesson.
 */
type BillingColumns = { lessons_per_month: number; billing_type: 'monthly' | 'per_lesson'; lesson_price_cents: number | null; price_cents: number };

export function billingColumns({ lessons_per_month, billing_type, price, lesson_price }: BillingInput): BillingColumns {
  if (billing_type === 'per_lesson') {
    const lesson_price_cents = Math.round((lesson_price ?? 0) * 100);
    return { lessons_per_month, billing_type, lesson_price_cents, price_cents: lesson_price_cents * lessons_per_month };
  }
  return { lessons_per_month, billing_type, lesson_price_cents: null, price_cents: Math.round((price ?? 0) * 100) };
}

export const contractSchema = z
  .object({
    student_id: id,
    plan_id: id,
    ...billing,
    start_date: day,
    term_months: z.coerce.number().refine((n) => (TERMS as readonly number[]).includes(n), { error: 'Pick a term' }),
  })
  .superRefine(requireAmount)
  .transform(({ student_id, plan_id, start_date, term_months, ...b }) => ({
    student_id,
    plan_id,
    start_date,
    renewal_date: addMonths(start_date, term_months),
    ...billingColumns(b),
  }));

export type ContractInput = z.infer<typeof contractSchema>;

export const contractUpdateSchema = z
  .object({
    id,
    ...billing,
    renewal_date: day,
    status: z.enum(['active', 'paused', 'ending']),
  })
  .superRefine(requireAmount)
  .transform(({ id, renewal_date, status, ...b }) => ({ id, renewal_date, status, ...billingColumns(b) }));

export const planSchema = z
  .object({
    name: z.string({ error: 'Name is required' }).min(2, { error: 'Name is required' }).max(60),
    ...billing,
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { error: 'Use a hex color like #3b82f6' }),
    description: z.string().max(120).optional(),
  })
  .superRefine(requireAmount)
  .transform(({ name, color, description, ...b }) => {
    const { price_cents, ...rest } = billingColumns(b);
    return { name, color, description: description ?? null, ...rest, list_price_cents: price_cents };
  });
