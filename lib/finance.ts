import type { Contract, LessonStatus } from '@/types/database';

// Money model:
// - each lesson is worth its contract's price per lesson; for monthly
//   contracts that is the monthly value split over the lessons per month;
// - done lessons are realized, scheduled lessons are expected, cancelled are worth nothing;
// - a contract also "projects" its monthly value for every month it runs.

type Billing = Pick<Contract, 'billing_type' | 'lesson_price_cents' | 'price_cents' | 'lessons_per_month'>;

export function lessonValueCents(c: Billing): number {
  if (c.billing_type === 'per_lesson') return c.lesson_price_cents ?? 0;
  return c.lessons_per_month > 0 ? Math.round(c.price_cents / c.lessons_per_month) : 0;
}

/** "YYYY-MM" of a local day "YYYY-MM-DD". */
export const monthOf = (day: string) => day.slice(0, 7);

export function addMonthKey(month: string, n: number) {
  const [y, m] = month.split('-').map(Number) as [number, number];
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
}

/** Months from `from` to `to`, inclusive ("YYYY-MM"). */
export function monthsBetween(from: string, to: string) {
  const out: string[] = [];
  for (let m = from; m <= to; m = addMonthKey(m, 1)) out.push(m);
  return out;
}

/** A contract projects its value in a month when it runs during that month and isn't paused. */
export function runsInMonth(c: Pick<Contract, 'start_date' | 'renewal_date' | 'status'>, month: string) {
  if (c.status === 'paused') return false;
  const first = `${month}-01`;
  const next = `${addMonthKey(month, 1)}-01`;
  return c.start_date < next && c.renewal_date > first;
}

export type MonthTotals = {
  done: number; doneCents: number;
  scheduled: number; scheduledCents: number;
  cancelled: number;
  contractedLessons: number; contractedCents: number;
};

export const emptyTotals = (): MonthTotals => ({ done: 0, doneCents: 0, scheduled: 0, scheduledCents: 0, cancelled: 0, contractedLessons: 0, contractedCents: 0 });

/** Adds one lesson (already valued) to a month's totals. */
export function addLesson(t: MonthTotals, status: LessonStatus, valueCents: number) {
  if (status === 'done') { t.done++; t.doneCents += valueCents; }
  else if (status === 'scheduled') { t.scheduled++; t.scheduledCents += valueCents; }
  else t.cancelled++;
}

/** Realized + still scheduled: what the month is on track to bill. */
export const expectedCents = (t: MonthTotals) => t.doneCents + t.scheduledCents;
