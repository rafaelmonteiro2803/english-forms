import { describe, expect, it } from 'vitest';
import { canScheduleLesson } from '@/lib/rules/lesson';

const student = 'student-1';

describe('a lesson requires an active contract', () => {
  it('allows an active contract of the same student', () => {
    expect(canScheduleLesson({ studentId: student, studentStatus: 'active', contract: { student_id: student, status: 'active' } })).toEqual({ ok: true });
  });

  it('allows a contract that is due for renewal (still in force)', () => {
    expect(canScheduleLesson({ studentId: student, studentStatus: 'active', contract: { student_id: student, status: 'ending' } }).ok).toBe(true);
  });

  it('rejects a lesson without a contract', () => {
    expect(canScheduleLesson({ studentId: student, studentStatus: 'active', contract: null }).ok).toBe(false);
  });

  it('rejects a paused contract', () => {
    const r = canScheduleLesson({ studentId: student, studentStatus: 'active', contract: { student_id: student, status: 'paused' } });
    expect(r).toEqual({ ok: false, error: expect.stringContaining('paused') });
  });

  it("rejects another student's contract", () => {
    expect(canScheduleLesson({ studentId: student, studentStatus: 'active', contract: { student_id: 'student-2', status: 'active' } }).ok).toBe(false);
  });

  it('rejects a paused student', () => {
    expect(canScheduleLesson({ studentId: student, studentStatus: 'paused', contract: { student_id: student, status: 'active' } }).ok).toBe(false);
  });
});
