import type { Metadata } from 'next';
import Link from 'next/link';
import { ScreenScroll, TopBar } from '@/components/shell/TopBar';
import { ActionForm } from '@/components/ui/ActionForm';
import { Avatar } from '@/components/ui/Avatar';
import { GCalMark } from '@/components/ui/Brand';
import { ConfirmButton } from '@/components/ui/ConfirmButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { StatusPill } from '@/components/ui/StatusPill';
import { requireRole } from '@/lib/auth';
import { monthRange } from '@/lib/dates';
import { fmtDate, fmtMoney } from '@/lib/format';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { param } from '@/lib/url';
import { deleteTeacher } from './actions';
import { TeacherForm } from './TeacherForm';

export const metadata: Metadata = { title: 'Teachers' };

const PATH = '/management/teachers';
const COLS = 'grid-cols-[minmax(200px,1.6fr)_80px_90px_110px_110px]';

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function TeachersPage({ searchParams }: { searchParams: SP }) {
  const me = await requireRole('admin');
  const sp = await searchParams;
  const supabase = await createClient();
  const { start } = monthRange();

  const [{ data: teachers, error }, { data: students }, { data: contracts }, { data: lessons }, { data: google }] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'teacher').order('name'),
    supabase.from('students').select('id, name, company, status, teacher_id').order('name'),
    supabase.from('contracts').select('student_id, status, price_cents'),
    supabase.from('lessons').select('teacher_id').eq('status', 'done').gte('starts_at', start.toISOString()),
    // google_accounts is private to each teacher under RLS; admins only need to know who connected
    createAdminClient().from('google_accounts').select('teacher_id, email'),
  ]);
  if (error) throw error;

  const studentsOf = (id: string) => (students ?? []).filter((s) => s.teacher_id === id);
  const runningOf = (id: string) => {
    const ids = new Set(studentsOf(id).map((s) => s.id));
    return (contracts ?? []).filter((c) => ids.has(c.student_id) && c.status !== 'paused');
  };
  const lessonsOf = (id: string) => (lessons ?? []).filter((l) => l.teacher_id === id).length;
  const googleOf = (id: string) => (google ?? []).find((g) => g.teacher_id === id);

  const selected = teachers.find((t) => t.id === param(sp.id)) ?? teachers[0];
  const editing = teachers.find((t) => t.id === param(sp.edit));
  const creating = param(sp.new) === '1';
  const closeHref = selected ? `${PATH}?id=${selected.id}` : PATH;
  const others = teachers.filter((t) => t.id !== selected?.id);

  return (
    <>
      <TopBar crumb="Management" title="Teachers" sub={`${teachers.length} teacher${teachers.length === 1 ? '' : 's'}`}
        right={<Link href={`${PATH}?new=1${selected ? `&id=${selected.id}` : ''}`} scroll={false} className="btn-primary"><Icon name="plus" size={15} />New teacher</Link>} />
      <ScreenScroll>
        {teachers.length === 0 ? (
          <div className="card"><EmptyState icon="users" title="No teachers yet">
            <Link href={`${PATH}?new=1`} scroll={false} className="font-semibold text-brand-bright">Add the first teacher</Link>
          </EmptyState></div>
        ) : (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section aria-label="Teacher list" className="card min-w-0">
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className={`grid ${COLS} gap-3 border-b border-line px-4 py-2 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-3`}>
                    <span>Teacher</span><span>Students</span><span>Contracts</span><span>Lessons / mo</span><span>Calendar</span>
                  </div>
                  <ul>
                    {teachers.map((t) => {
                      const on = t.id === selected?.id;
                      const g = googleOf(t.id);
                      return (
                        <li key={t.id} className={`relative grid ${COLS} items-center gap-3 border-b border-line px-4 py-2.5 last:border-0 hover:bg-white/[0.02] ${on ? 'bg-brand/[0.08] shadow-[inset_2px_0_0_#3b82f6]' : ''}`}>
                          <div className="flex min-w-0 items-center gap-2.5">
                            <Avatar name={t.name || t.email} src={t.avatar_url} size={32} />
                            <div className="min-w-0">
                              <Link href={`${PATH}?id=${t.id}`} scroll={false} aria-current={on ? 'true' : undefined}
                                className="block truncate text-[12.5px] font-semibold text-ink-hi after:absolute after:inset-0">{t.name || t.email}</Link>
                              <div className="truncate text-[10.5px] text-ink-3">{t.email}</div>
                            </div>
                          </div>
                          <span className="mono text-[13px] text-ink-hi">{studentsOf(t.id).length}</span>
                          <span className="mono text-[13px] text-ink-hi">{runningOf(t.id).length}</span>
                          <span className="mono text-[13px] text-ink-hi">{lessonsOf(t.id)}</span>
                          <span className={`flex items-center gap-1.5 text-[11px] ${g ? 'text-positive' : 'text-ink-3'}`}>
                            <span className={g ? '' : 'opacity-40'}><GCalMark size={14} /></span>{g ? 'Connected' : 'Off'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </section>

            {selected && (
              <section aria-label={`${selected.name} details`} className="card lg:sticky lg:top-0">
                <div className="flex items-center gap-3.5 border-b border-line p-[18px]">
                  <Avatar name={selected.name || selected.email} src={selected.avatar_url} size={52} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-bold text-ink-hi">{selected.name || '—'}</h2>
                    <div className="truncate text-xs text-ink-2">{selected.email}</div>
                    <div className="mt-1 text-[10.5px] text-ink-3">Since {fmtDate(selected.created_at.slice(0, 10))}</div>
                  </div>
                  <Link href={`${PATH}?id=${selected.id}&edit=${selected.id}`} scroll={false} className="icon-btn text-ink-2" aria-label={`Edit ${selected.name}`}>
                    <Icon name="edit" size={15} />
                  </Link>
                </div>

                <dl className="grid grid-cols-3 gap-3 border-b border-line p-[18px]">
                  {[['Students', studentsOf(selected.id).length], ['Revenue / mo', fmtMoney(runningOf(selected.id).reduce((s, c) => s + c.price_cents, 0))], ['Lessons / mo', lessonsOf(selected.id)]].map(([k, v]) => (
                    <div key={String(k)}><dt className="text-[10.5px] text-ink-3">{k}</dt><dd className="mono mt-0.5 text-sm font-bold text-ink-hi">{v}</dd></div>
                  ))}
                </dl>

                <div className="border-b border-line p-[18px]">
                  <h3 className="label-caps mb-2.5">Students</h3>
                  <ul className="flex flex-col gap-1">
                    {studentsOf(selected.id).map((s) => (
                      <li key={s.id}>
                        <Link href={`/management/students?id=${s.id}`} className="flex items-center gap-2.5 rounded-[8px] px-1 py-1.5 hover:bg-white/[0.03]">
                          <Avatar name={s.name} size={26} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-ink-hi">{s.name}</span>
                            {s.company && <span className="block truncate text-[10.5px] text-ink-3">{s.company}</span>}
                          </span>
                          <StatusPill status={s.status} />
                        </Link>
                      </li>
                    ))}
                    {studentsOf(selected.id).length === 0 && <li className="text-xs text-ink-3">No students yet.</li>}
                  </ul>
                </div>

                <div className="p-[18px]">
                  {selected.id === me.id ? (
                    <p className="text-[11px] text-ink-3">This is your login.</p>
                  ) : (
                    <ActionForm action={deleteTeacher} className="flex flex-col gap-2.5">
                      <input type="hidden" name="id" value={selected.id} />
                      {studentsOf(selected.id).length > 0 && (
                        others.length ? (
                          <label className="flex flex-col gap-1.5 text-[11px] font-semibold text-ink-2">
                            Move their students and lessons to
                            <select name="transfer_to" className="input text-[12.5px] font-normal">
                              {others.map((o) => <option key={o.id} value={o.id}>{o.name || o.email}</option>)}
                            </select>
                          </label>
                        ) : (
                          <p className="text-[11px] text-warning">Add another teacher first: their students need someone to take over.</p>
                        )
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-ink-3">Deletes the login and the Google Calendar link.</span>
                        <ConfirmButton className="btn-seg border-risk/35 text-risk" pendingLabel="Deleting…"
                          disabled={studentsOf(selected.id).length > 0 && others.length === 0}
                          confirm={`Delete ${selected.name || selected.email}? ${studentsOf(selected.id).length ? 'Their students and lessons move to the teacher you chose. ' : ''}This cannot be undone.`}>
                          Delete teacher
                        </ConfirmButton>
                      </div>
                    </ActionForm>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </ScreenScroll>
      {(creating || editing) && <TeacherForm teacher={editing ? { id: editing.id, name: editing.name, email: editing.email } : undefined} closeHref={closeHref} />}
    </>
  );
}
