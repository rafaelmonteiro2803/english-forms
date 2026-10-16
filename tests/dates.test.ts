import { describe, expect, it } from 'vitest';
import { addMonths, monthRange, weekStart, zonedParts, zonedTime } from '@/lib/dates';

// APP_TZ defaults to America/Sao_Paulo (UTC−3, no daylight saving since 2019)
describe('dates', () => {
  it('converts local wall time to an instant and back', () => {
    const d = zonedTime('2026-10-16', 15 * 60 + 30);
    expect(d.toISOString()).toBe('2026-10-16T18:30:00.000Z');
    expect(zonedParts(d)).toMatchObject({ day: '2026-10-16', minutes: 930, weekday: 4 });
  });

  it('finds the Monday of a week', () => {
    expect(weekStart('2026-10-16')).toBe('2026-10-12');
    expect(weekStart('2026-10-12')).toBe('2026-10-12');
    expect(weekStart('2026-10-18')).toBe('2026-10-12');
  });

  it('computes month boundaries in local time', () => {
    const { start, end } = monthRange('2026-10-16');
    expect(start.toISOString()).toBe('2026-10-01T03:00:00.000Z');
    expect(end.toISOString()).toBe('2026-11-01T03:00:00.000Z');
  });

  it('adds months', () => {
    expect(addMonths('2026-10-19', 3)).toBe('2027-01-19');
  });
});
