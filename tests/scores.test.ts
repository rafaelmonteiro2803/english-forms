import { describe, expect, it } from 'vitest';
import { assessmentBefore, examEquivalents, levelFor, monthlyTrend, monthsTo, nextLevel, project } from '@/lib/scores';

describe('scores', () => {
  it('maps scores to CEFR levels', () => {
    expect(levelFor(820)).toBe('B2');
    expect(levelFor(880)).toBe('C1');
    expect(levelFor(100)).toBe('A1');
    expect(nextLevel('B2')).toEqual({ level: 'C1', min: 880 });
    expect(nextLevel('C2').level).toBe('C2');
  });

  it('interpolates exam equivalents', () => {
    const [toefl, ielts, toeic] = examEquivalents(880);
    expect(toefl).toMatchObject({ value: 95 });
    expect(ielts).toMatchObject({ value: 7 });
    expect(toeic).toMatchObject({ value: 945 });
    expect(examEquivalents(800)[1]!.value).toBe(6.5);
  });

  it('fits a monthly trend and projects it', () => {
    const history = [0, 1, 2, 3].map((m) => ({ overall: 70 + m, created_at: new Date(Date.UTC(2026, m, 15)).toISOString() }));
    const slope = monthlyTrend(history);
    expect(slope).toBeGreaterThan(9);
    expect(slope).toBeLessThan(11);
    expect(project(730, slope, 6)).toBeGreaterThan(780);
    expect(monthsTo(730, 880, slope)).toBe(15);
    expect(monthsTo(730, 880, -1)).toBeNull();
    expect(monthsTo(900, 880, 0)).toBe(0);
  });

  it('finds the assessment from N days ago', () => {
    const h = [1, 2, 3].map((m) => ({ id: m, created_at: new Date(Date.UTC(2026, m, 1)).toISOString() }));
    expect(assessmentBefore(h, 40, Date.UTC(2026, 3, 15))!.id).toBe(2);
    expect(assessmentBefore(h, 400, Date.UTC(2026, 3, 15))!.id).toBe(1);
  });
});
