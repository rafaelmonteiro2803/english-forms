import 'server-only';
import { zonedParts, zonedTime } from '@/lib/dates';
import { addLesson, addMonthKey, emptyTotals, lessonValueCents, monthOf, monthsBetween, runsInMonth, type MonthTotals } from '@/lib/finance';
import type { Supabase } from '@/lib/supabase/server';
import type { LessonStatus } from '@/types/database';

export type StatementLine = {
  id: string; startsAt: string; durationMin: number; status: LessonStatus; valueCents: number;
  studentId: string; studentName: string; teacherId: string;
  planName: string; planColor: string; billing: 'monthly' | 'per_lesson';
};

/**
 * Lessons and contract projections between two months (inclusive), valued and
 * grouped by month and by teacher. RLS scopes it: teachers see their own.
 */
export async function loadFinance(supabase: Supabase, from: string, to: string, teacherId?: string) {
  const start = zonedTime(`${from}-01`, 0).toISOString();
  const end = zonedTime(`${addMonthKey(to, 1)}-01`, 0).toISOString();

  let lessonsQuery = supabase.from('lessons').select('id, starts_at, duration_min, status, teacher_id, student_id, contract_id')
    .gte('starts_at', start).lt('starts_at', end).order('starts_at');
  if (teacherId) lessonsQuery = lessonsQuery.eq('teacher_id', teacherId);

  const [{ data: lessons, error }, { data: contracts }, { data: students }, { data: plans }] = await Promise.all([
    lessonsQuery,
    supabase.from('contracts').select('*'),
    supabase.from('students').select('id, name, teacher_id'),
    supabase.from('plans').select('id, name, color'),
  ]);
  if (error) throw error;

  const contractById = new Map((contracts ?? []).map((c) => [c.id, c]));
  const studentById = new Map((students ?? []).map((s) => [s.id, s]));
  const planById = new Map((plans ?? []).map((p) => [p.id, p]));
  const months = monthsBetween(from, to);

  const total = new Map(months.map((m) => [m, emptyTotals()]));
  const byTeacher = new Map<string, Map<string, MonthTotals>>();
  const teacherMonth = (tid: string, m: string) => {
    if (!byTeacher.has(tid)) byTeacher.set(tid, new Map(months.map((x) => [x, emptyTotals()])));
    return byTeacher.get(tid)!.get(m)!;
  };

  const lines: StatementLine[] = [];
  for (const l of lessons ?? []) {
    const c = contractById.get(l.contract_id);
    if (!c) continue;
    const m = monthOf(zonedParts(new Date(l.starts_at)).day);
    const value = l.status === 'cancelled' ? 0 : lessonValueCents(c);
    addLesson(total.get(m)!, l.status, value);
    addLesson(teacherMonth(l.teacher_id, m), l.status, value);
    const p = planById.get(c.plan_id);
    lines.push({
      id: l.id, startsAt: l.starts_at, durationMin: l.duration_min, status: l.status, valueCents: value,
      studentId: l.student_id, studentName: studentById.get(l.student_id)?.name ?? '—', teacherId: l.teacher_id,
      planName: p?.name ?? '—', planColor: p?.color ?? '#7a87a1', billing: c.billing_type,
    });
  }

  // what the running contracts project for each month, credited to the student's teacher
  for (const c of contracts ?? []) {
    const tid = studentById.get(c.student_id)?.teacher_id;
    if (!tid || (teacherId && tid !== teacherId)) continue;
    for (const m of months) {
      if (!runsInMonth(c, m)) continue;
      for (const t of [total.get(m)!, teacherMonth(tid, m)]) {
        t.contractedCents += c.price_cents;
        t.contractedLessons += c.lessons_per_month;
      }
    }
  }

  return { months, total, byTeacher, lines };
}
