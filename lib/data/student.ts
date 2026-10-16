import 'server-only';
import type { Supabase } from '@/lib/supabase/server';
import type { Profile } from '@/types/database';

/**
 * Which student a learning screen shows: students see themselves; teachers
 * and admins pick one of the students they can see (?student=).
 */
export async function resolveStudent(supabase: Supabase, profile: Profile, requested?: string) {
  if (profile.role === 'student') {
    const { data } = await supabase.from('students').select('*').eq('profile_id', profile.id).maybeSingle();
    return { student: data, options: [] as { id: string; name: string }[] };
  }
  const { data: options } = await supabase.from('students').select('id, name').order('name');
  const id = options?.find((o) => o.id === requested)?.id ?? options?.[0]?.id;
  if (!id) return { student: null, options: [] };
  const { data } = await supabase.from('students').select('*').eq('id', id).single();
  return { student: data, options: options ?? [] };
}

/** Assessments oldest first. */
export async function assessmentsOf(supabase: Supabase, studentId: string) {
  const { data, error } = await supabase.from('assessments').select('*').eq('student_id', studentId).order('created_at');
  if (error) throw error;
  return data;
}
