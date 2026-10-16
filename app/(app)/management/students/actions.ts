'use server';

import { requireRole } from '@/lib/auth';
import { syncLinkedIn } from '@/lib/linkedin';
import { createClient } from '@/lib/supabase/server';
import { done, formObject, invalid, type FormState } from '@/lib/validation/form';
import { studentSchema } from '@/lib/validation/student';

const PATH = '/management/students';
const isGuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);

export async function saveStudent(_: FormState, fd: FormData): Promise<FormState> {
  const profile = await requireRole('teacher', 'admin');
  const raw = formObject(fd);
  const parsed = studentSchema.safeParse(raw);
  if (!parsed.success) return invalid(parsed.error, raw);

  const values = {
    ...parsed.data,
    // optional fields that were cleared must become null, not stay as they were
    company: parsed.data.company ?? null,
    role_title: parsed.data.role_title ?? null,
    city: parsed.data.city ?? null,
    linkedin_url: parsed.data.linkedin_url ?? null,
    notes: parsed.data.notes ?? null,
  };
  const supabase = await createClient();
  const id = raw.id;

  const result = id
    ? await supabase.from('students').update(values).eq('id', id).select('id').single()
    : await supabase
        .from('students')
        .insert({ ...values, teacher_id: profile.role === 'admin' && isGuid(raw.teacher_id) ? raw.teacher_id : profile.id })
        .select('id')
        .single();

  if (result.error) {
    if (result.error.code === '23505') return { error: 'Please check the highlighted fields.', fieldErrors: { email: ['A student with this email already exists'] }, values: raw };
    return { error: 'Could not save the student. Please try again.', values: raw };
  }
  return done(`${PATH}?id=${result.data.id}`, id ? `${values.name} updated` : `${values.name} added`);
}

export async function setStudentStatus(_: FormState, fd: FormData): Promise<FormState> {
  await requireRole('teacher', 'admin');
  const id = String(fd.get('id'));
  const status = fd.get('status') === 'paused' ? 'paused' : 'active';
  const supabase = await createClient();
  const { error } = await supabase.from('students').update({ status }).eq('id', id);
  if (error) return done(`${PATH}?id=${id}`, 'Could not update the student', 'error');
  return done(`${PATH}?id=${id}`, status === 'paused' ? 'Student paused' : 'Student reactivated');
}

export async function syncStudentLinkedIn(_: FormState, fd: FormData): Promise<FormState> {
  await requireRole('teacher', 'admin');
  const id = String(fd.get('id'));
  const supabase = await createClient();
  // RLS makes sure the teacher can see this student before we use the service role
  const { data: student } = await supabase.from('students').select('profile_id').eq('id', id).single();
  const result = student?.profile_id
    ? await syncLinkedIn(student.profile_id)
    : { ok: false, message: 'This student has not signed in yet.' };
  return done(`${PATH}?id=${id}`, result.message, result.ok ? 'ok' : 'error');
}
