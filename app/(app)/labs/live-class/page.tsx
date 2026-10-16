import type { Metadata } from 'next';
import { PreviewBanner } from '@/components/labs/parts';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { LiveClass } from './LiveClass';

export const metadata: Metadata = { title: 'Live Class' };

export default async function LiveClassPage() {
  const profile = await requireRole();
  const supabase = await createClient();
  // for students, show their teacher's name; otherwise the signed-in teacher
  let teacher = profile.role === 'student' ? 'Your teacher' : profile.name;
  let student = profile.role === 'student' ? profile.name : 'Student';
  if (profile.role === 'student') {
    const { data: s } = await supabase.from('students').select('teacher_id').eq('profile_id', profile.id).maybeSingle();
    const { data: t } = s ? await supabase.from('profiles').select('name').eq('id', s.teacher_id).maybeSingle() : { data: null };
    if (t?.name) teacher = t.name;
  } else {
    const { data: s } = await supabase.from('students').select('name').eq('status', 'active').order('name').limit(1).maybeSingle();
    if (s) student = s.name;
  }
  return <><PreviewBanner /><LiveClass teacher={teacher} student={student} self={profile.role === 'student' ? 'student' : 'teacher'} /></>;
}
