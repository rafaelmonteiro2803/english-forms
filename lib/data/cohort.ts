import 'server-only';
import { addDays, monthRange, today, weekStart, zonedTime } from '@/lib/dates';
import { assessmentBefore, score1000, SKILLS } from '@/lib/scores';
import type { Supabase } from '@/lib/supabase/server';
import type { Assessment, Student } from '@/types/database';

const DAY = 86400000;

export type CohortRow = {
  student: Student;
  score: number | null;
  delta30: number;
  delta90: number;
  spark: number[];
  attendance: number | null; // done / (done + cancelled), last 90 days
  lessons30: number;
  risk: string | null;
  history: Assessment[];
};

/** Per-student progress for everyone the signed-in user can see (RLS scopes it). */
export async function loadCohort(supabase: Supabase) {
  const since90 = new Date(Date.now() - 90 * DAY).toISOString();
  const [{ data: students, error }, { data: assessments }, { data: lessons }] = await Promise.all([
    supabase.from('students').select('*').order('name'),
    supabase.from('assessments').select('*').order('created_at'),
    supabase.from('lessons').select('student_id, status, starts_at, duration_min').gte('starts_at', since90),
  ]);
  if (error) throw error;

  const rows: CohortRow[] = students.map((student) => {
    const history = (assessments ?? []).filter((a) => a.student_id === student.id);
    const latest = history.at(-1);
    const score = latest ? score1000(latest) : null;
    const delta = (days: number) => (latest ? score1000(latest) - score1000(assessmentBefore(history, days)) : 0);
    const mine = (lessons ?? []).filter((l) => l.student_id === student.id && Date.parse(l.starts_at) <= Date.now());
    const done = mine.filter((l) => l.status === 'done');
    const cancelled = mine.filter((l) => l.status === 'cancelled').length;
    const lastLesson = done.reduce((m, l) => Math.max(m, Date.parse(l.starts_at)), 0);
    const delta90 = delta(90);

    let risk: string | null = null;
    if (student.status === 'active') {
      if (latest && delta90 < 0) risk = 'Declining score';
      else if (latest && history.length > 2 && delta90 === 0) risk = 'No evolution';
      else if (!lastLesson || Date.now() - lastLesson > 21 * DAY) risk = 'No lessons in 3 weeks';
    } else if (latest && delta90 < 0) {
      risk = 'Paused and declining';
    }

    return {
      student,
      score,
      delta30: delta(30),
      delta90,
      spark: history.slice(-5).map((a) => score1000(a)),
      attendance: done.length + cancelled ? Math.round((done.length / (done.length + cancelled)) * 100) : null,
      lessons30: done.filter((l) => Date.parse(l.starts_at) >= Date.now() - 30 * DAY).length,
      risk,
      history,
    };
  });

  const week0 = zonedTime(weekStart(today()), 0).getTime();
  const week1 = zonedTime(addDays(weekStart(today()), 7), 0).getTime();
  const { start: monthStart } = monthRange();
  const doneLessons = (lessons ?? []).filter((l) => l.status === 'done');
  const minutesThisWeek = doneLessons.filter((l) => Date.parse(l.starts_at) >= week0 && Date.parse(l.starts_at) < week1).reduce((s, l) => s + l.duration_min, 0);
  const activeThisMonth = new Set(doneLessons.filter((l) => Date.parse(l.starts_at) >= monthStart.getTime()).map((l) => l.student_id));

  return { rows, minutesThisWeek, activeThisMonth };
}

/** Average of the latest score per skill across the cohort, weakest first. */
export function skillAverages(rows: CohortRow[]) {
  const latest = rows.map((r) => r.history.at(-1)).filter((a): a is Assessment => !!a);
  return SKILLS.map((s) => ({
    ...s,
    avg: latest.length ? Math.round(latest.reduce((sum, a) => sum + a[s.key], 0) / latest.length) : 0,
  })).sort((a, b) => a.avg - b.avg);
}

/** Score at the end of each of the last `n` months (null when no assessment yet). */
export function monthlyScores(history: Assessment[], months: string[]) {
  return months.map((m) => {
    const inMonth = history.filter((a) => a.created_at.slice(0, 7) <= m);
    const last = inMonth.at(-1);
    return last && last.created_at.slice(0, 7) >= addMonthsKey(m, -2) ? score1000(last) : null;
  });
}

const addMonthsKey = (ym: string, n: number) => {
  const [y, m] = ym.split('-').map(Number) as [number, number];
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
};

export const lastMonths = (n: number) => Array.from({ length: n }, (_, i) => addMonthsKey(today().slice(0, 7), i - n + 1));
