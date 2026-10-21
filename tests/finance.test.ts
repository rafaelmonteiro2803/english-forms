import { describe, expect, it } from 'vitest';
import { addLesson, addMonthKey, emptyTotals, expectedCents, lessonValueCents, monthsBetween, runsInMonth } from '@/lib/finance';

describe('finance', () => {
  it('values a lesson by its contract', () => {
    expect(lessonValueCents({ billing_type: 'per_lesson', lesson_price_cents: 17000, price_cents: 68000, lessons_per_month: 4 })).toBe(17000);
    expect(lessonValueCents({ billing_type: 'monthly', lesson_price_cents: null, price_cents: 240000, lessons_per_month: 8 })).toBe(30000);
    expect(lessonValueCents({ billing_type: 'monthly', lesson_price_cents: null, price_cents: 100000, lessons_per_month: 3 })).toBe(33333);
  });

  it('knows which months a contract runs in', () => {
    const c = { start_date: '2026-10-17', renewal_date: '2027-01-17', status: 'active' as const };
    expect(runsInMonth(c, '2026-09')).toBe(false);
    expect(runsInMonth(c, '2026-10')).toBe(true);
    expect(runsInMonth(c, '2027-01')).toBe(true);
    expect(runsInMonth(c, '2027-02')).toBe(false);
    expect(runsInMonth({ ...c, status: 'paused' }, '2026-11')).toBe(false);
  });

  it('walks months', () => {
    expect(addMonthKey('2026-11', 2)).toBe('2027-01');
    expect(monthsBetween('2026-11', '2027-02')).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
  });

  it('totals lessons by status', () => {
    const t = emptyTotals();
    addLesson(t, 'done', 17000);
    addLesson(t, 'scheduled', 17000);
    addLesson(t, 'cancelled', 17000);
    expect(t).toMatchObject({ done: 1, doneCents: 17000, scheduled: 1, scheduledCents: 17000, cancelled: 1 });
    expect(expectedCents(t)).toBe(34000);
  });
});
