'use server';

import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { done, formObject, invalid, type FormState } from '@/lib/validation/form';
import { teacherSchema } from '@/lib/validation/teacher';

// Teachers are auth users with role 'teacher'. Creating, renaming or removing
// them touches auth.users, so these actions use the service role after
// checking that the caller is an admin.

const PATH = '/management/teachers';

export async function saveTeacher(_: FormState, fd: FormData): Promise<FormState> {
  await requireRole('admin');
  const raw = formObject(fd);
  const parsed = teacherSchema.safeParse(raw);
  if (!parsed.success) return invalid(parsed.error, raw);
  const { name, email, password } = parsed.data;
  const admin = createAdminClient();
  const fieldError = (field: string, msg: string): FormState => ({ error: 'Please check the highlighted fields.', fieldErrors: { [field]: [msg] }, values: raw });

  if (raw.id) {
    const { data: current } = await admin.from('profiles').select('email, role').eq('id', raw.id).single();
    if (!current || current.role !== 'teacher') return { error: 'Teacher not found.', values: raw };
    const changes: { email?: string; password?: string; email_confirm?: boolean } = {};
    if (email !== current.email) Object.assign(changes, { email, email_confirm: true });
    if (password) changes.password = password;
    if (Object.keys(changes).length) {
      const { error } = await admin.auth.admin.updateUserById(raw.id, changes);
      if (error) return error.message.toLowerCase().includes('already') ? fieldError('email', 'This email is already in use') : { error: error.message, values: raw };
    }
    const { error } = await admin.from('profiles').update({ name, email }).eq('id', raw.id);
    if (error) return { error: 'Could not save the teacher.', values: raw };
    return done(`${PATH}?id=${raw.id}`, `${name} updated`);
  }

  // An existing account with this email (e.g. someone who signed in with Google) is promoted instead.
  const { data: existing } = await admin.from('profiles').select('id, role').eq('email', email).maybeSingle();
  if (existing) {
    if (existing.role !== 'student') return fieldError('email', `This email already belongs to a${existing.role === 'admin' ? 'n admin' : ' teacher'}`);
    const { count } = await admin.from('students').select('id', { count: 'exact', head: true }).eq('profile_id', existing.id);
    if (count) return fieldError('email', 'This email belongs to a student record');
    await admin.from('profiles').update({ role: 'teacher', name }).eq('id', existing.id);
    if (password) await admin.auth.admin.updateUserById(existing.id, { password });
    return done(`${PATH}?id=${existing.id}`, `${name} is now a teacher`);
  }

  if (!password) return fieldError('password', 'Set an initial password');
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } });
  if (error || !data.user) return { error: error?.message ?? 'Could not create the login.', values: raw };
  // the sign-up trigger created the profile as 'student'
  const { error: roleError } = await admin.from('profiles').update({ role: 'teacher', name }).eq('id', data.user.id);
  if (roleError) return { error: 'Login created, but the role could not be set. Try saving again.', values: raw };
  return done(`${PATH}?id=${data.user.id}`, `${name} added`);
}

/**
 * Removes a teacher's login. Their students (with lessons) move to another
 * teacher first, because a student always needs a teacher.
 */
export async function deleteTeacher(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireRole('admin');
  const id = String(fd.get('id'));
  const transferTo = String(fd.get('transfer_to') ?? '');
  const admin = createAdminClient();

  const { data: teacher } = await admin.from('profiles').select('name, role').eq('id', id).single();
  if (!teacher || teacher.role !== 'teacher') return done(PATH, 'Teacher not found', 'error');
  if (id === me.id) return done(PATH, "You can't delete your own login", 'error');

  const { count } = await admin.from('students').select('id', { count: 'exact', head: true }).eq('teacher_id', id);
  if (count) {
    const { data: target } = await admin.from('profiles').select('id, role').eq('id', transferTo).maybeSingle();
    if (!target || target.role !== 'teacher' || target.id === id) {
      return done(`${PATH}?id=${id}`, 'Choose who takes over the students', 'error');
    }
    // students first: the lesson trigger checks that a lesson's teacher teaches the student
    const moved = await admin.from('students').update({ teacher_id: target.id }).eq('teacher_id', id);
    const lessons = await admin.from('lessons').update({ teacher_id: target.id }).eq('teacher_id', id);
    if (moved.error || lessons.error) return done(`${PATH}?id=${id}`, 'Could not move the students', 'error');
  }

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return done(`${PATH}?id=${id}`, 'Could not delete the teacher', 'error');
  return done(PATH, `${teacher.name} deleted${count ? ` · ${count} student${count === 1 ? '' : 's'} moved` : ''}`);
}
