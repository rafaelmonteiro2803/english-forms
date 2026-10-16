'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { redirectWithToast } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { assessmentSchema } from '@/lib/validation/assessment';
import { formObject, invalid, type FormState } from '@/lib/validation/form';

export async function saveAssessment(_: FormState, fd: FormData): Promise<FormState> {
  await requireRole('teacher', 'admin');
  const raw = formObject(fd);
  const parsed = assessmentSchema.safeParse(raw);
  if (!parsed.success) return invalid(parsed.error, raw);
  const { lesson_id, ...scores } = parsed.data;
  if (!lesson_id) return { error: 'Missing lesson.', values: raw };

  const supabase = await createClient();
  const { data: lesson } = await supabase.from('lessons').select('student_id, status, starts_at, duration_min').eq('id', lesson_id).single();
  if (!lesson || lesson.student_id !== scores.student_id) return { error: 'Lesson not found.', values: raw };
  if (lesson.status !== 'done') return { error: 'Mark the lesson as done before scoring it.', values: raw };

  const values = { ...scores, notes: scores.notes ?? null, lesson_id };
  const { data: existing } = await supabase.from('assessments').select('id').eq('lesson_id', lesson_id).maybeSingle();
  const { error } = existing
    ? await supabase.from('assessments').update(values).eq('id', existing.id)
    : await supabase.from('assessments').insert({ ...values, created_at: new Date(Date.parse(lesson.starts_at) + lesson.duration_min * 60000).toISOString() });
  if (error) return { error: 'Could not save the assessment.', values: raw };

  revalidatePath('/reports');
  revalidatePath('/dashboard');
  redirectWithToast(`/reports/${lesson_id}`, existing ? 'Assessment updated' : 'Assessment saved');
}
