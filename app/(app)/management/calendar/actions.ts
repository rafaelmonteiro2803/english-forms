'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { zonedTime } from '@/lib/dates';
import { revoke } from '@/lib/google/oauth';
import { pushLesson, syncTeacher, type PushResult } from '@/lib/google/sync';
import { decrypt } from '@/lib/crypto';
import { redirectWithToast } from '@/lib/http';
import { canScheduleLesson } from '@/lib/rules/lesson';
import { createClient } from '@/lib/supabase/server';
import { formObject, invalid, type FormState } from '@/lib/validation/form';
import { lessonSchema } from '@/lib/validation/lesson';

const PATH = '/management/calendar';
const back = (fd: FormData) => {
  const b = String(fd.get('back') ?? '');
  return b.startsWith(PATH) ? b : PATH;
};
const syncNote = (r: PushResult) => (r === 'failed' ? ' · Google sync failed, will retry on next sync' : r === 'synced' ? ' · synced to Google Calendar' : '');

export async function saveLesson(_: FormState, fd: FormData): Promise<FormState> {
  await requireRole('teacher', 'admin');
  const raw = formObject(fd);
  const parsed = lessonSchema.safeParse(raw);
  if (!parsed.success) return invalid(parsed.error, raw);
  const l = parsed.data;

  const supabase = await createClient();
  const [{ data: student }, { data: contract }] = await Promise.all([
    supabase.from('students').select('id, status, teacher_id').eq('id', l.student_id).single(),
    supabase.from('contracts').select('id, student_id, status').eq('id', l.contract_id).maybeSingle(),
  ]);
  if (!student) return { error: 'Student not found.', values: raw };

  const rule = canScheduleLesson({ studentId: student.id, studentStatus: student.status, contract });
  if (!rule.ok) return { error: rule.error, fieldErrors: { contract_id: [rule.error] }, values: raw };

  const values = {
    student_id: l.student_id,
    contract_id: l.contract_id,
    starts_at: zonedTime(l.day, l.start_min).toISOString(),
    duration_min: l.duration_min,
  };

  let lessonId = raw.id;
  if (lessonId) {
    const { error } = await supabase.from('lessons').update(values).eq('id', lessonId).eq('status', 'scheduled');
    if (error) return { error: error.code === 'P0001' ? error.message : 'Could not save the lesson.', values: raw };
  } else {
    const { data, error } = await supabase
      .from('lessons')
      .insert({ ...values, teacher_id: student.teacher_id, google_event_id: l.google_event_id ?? null })
      .select('id')
      .single();
    if (error) return { error: error.code === 'P0001' ? error.message : 'Could not create the lesson.', values: raw };
    lessonId = data.id;
    if (l.google_event_id) await supabase.from('google_unlinked_events').delete().eq('google_event_id', l.google_event_id);
  }

  const pushed = await pushLesson(lessonId);
  revalidatePath(PATH);
  const verb = raw.id ? 'Lesson updated' : l.google_event_id ? 'Event linked to student and service' : 'Lesson created';
  redirectWithToast(back(fd), verb + syncNote(pushed), pushed === 'failed' ? 'error' : 'ok');
}

export async function setLessonStatus(fd: FormData) {
  await requireRole('teacher', 'admin');
  const id = String(fd.get('id'));
  const status = fd.get('status') === 'done' ? 'done' : fd.get('status') === 'cancelled' ? 'cancelled' : 'scheduled';
  const supabase = await createClient();
  const { error } = await supabase.from('lessons').update({ status }).eq('id', id);
  if (error) redirectWithToast(back(fd), 'Could not update the lesson', 'error');
  const pushed = status === 'cancelled' ? await pushLesson(id) : 'skipped';
  revalidatePath(PATH);
  const msg = status === 'cancelled' ? 'Lesson cancelled' + (pushed === 'synced' ? ' · removed from Google Calendar' : '') : status === 'done' ? 'Lesson marked as done' : 'Lesson restored';
  redirectWithToast(back(fd), msg, pushed === 'failed' ? 'error' : 'ok');
}

export async function syncGoogleNow(fd: FormData) {
  const profile = await requireRole('teacher');
  let changed: number | null = null;
  try {
    changed = await syncTeacher(profile.id);
  } catch (err) {
    console.error('Google sync failed', err);
  }
  revalidatePath(PATH);
  if (changed === null) redirectWithToast(back(fd), 'Google sync failed. Try reconnecting.', 'error');
  redirectWithToast(back(fd), changed ? `Google Calendar synced · ${changed} change${changed === 1 ? '' : 's'}` : 'Google Calendar synced');
}

export async function setAddMeet(fd: FormData) {
  const profile = await requireRole('teacher');
  const supabase = await createClient();
  await supabase.from('google_accounts').update({ add_meet: fd.get('add_meet') === 'true' }).eq('teacher_id', profile.id);
  revalidatePath(PATH);
  redirectWithToast(back(fd), fd.get('add_meet') === 'true' ? 'New lessons get a Google Meet link' : 'Google Meet links turned off');
}

export async function disconnectGoogle(fd: FormData) {
  const profile = await requireRole('teacher');
  const supabase = await createClient();
  const { data } = await supabase.from('google_accounts').select('refresh_token').eq('teacher_id', profile.id).maybeSingle();
  if (data) await revoke(decrypt(data.refresh_token)).catch(() => undefined);
  await supabase.from('google_unlinked_events').delete().eq('teacher_id', profile.id);
  await supabase.from('google_accounts').delete().eq('teacher_id', profile.id);
  revalidatePath(PATH);
  redirectWithToast(back(fd), 'Google Calendar disconnected');
}

export async function ignoreGoogleEvent(fd: FormData) {
  await requireRole('teacher');
  const supabase = await createClient();
  await supabase.from('google_unlinked_events').delete().eq('google_event_id', String(fd.get('google_event_id')));
  revalidatePath(PATH);
  redirectWithToast(back(fd), 'Event ignored');
}
