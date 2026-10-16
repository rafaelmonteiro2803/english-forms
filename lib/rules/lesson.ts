import type { ContractStatus, StudentStatus } from '@/types/database';

// Mirrors the database trigger in supabase/migrations/*_lesson_rules.sql so the
// form can explain the problem before the insert is rejected.

export const SCHEDULABLE: readonly ContractStatus[] = ['active', 'ending'];

export const isSchedulable = (status: ContractStatus) => SCHEDULABLE.includes(status);

type Check = { ok: true } | { ok: false; error: string };

export function canScheduleLesson(input: {
  studentId: string;
  studentStatus: StudentStatus;
  contract: { student_id: string; status: ContractStatus } | null;
}): Check {
  const { studentId, studentStatus, contract } = input;
  if (studentStatus !== 'active') return { ok: false, error: 'This student is paused. Reactivate them before scheduling.' };
  if (!contract) return { ok: false, error: 'Pick an active service for this lesson.' };
  if (contract.student_id !== studentId) return { ok: false, error: 'This service belongs to another student.' };
  if (!isSchedulable(contract.status)) return { ok: false, error: 'This service is paused. Resume it or pick another one.' };
  return { ok: true };
}
