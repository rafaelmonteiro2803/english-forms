import type { Metadata } from 'next';
import Link from 'next/link';
import { ScreenScroll, TopBar } from '@/components/shell/TopBar';
import { Avatar } from '@/components/ui/Avatar';
import { LinkedInMark } from '@/components/ui/Brand';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { requireRole } from '@/lib/auth';
import { lessonsUsedThisMonth } from '@/lib/data/usage';
import { today } from '@/lib/dates';
import { firstName } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { param, withParams } from '@/lib/url';
import { StudentDetail } from './StudentDetail';
import { StudentForm } from './StudentForm';

export const metadata: Metadata = { title: 'Students' };

const PATH = '/management/students';
const FILTERS = [['', 'All'], ['active', 'Active'], ['paused', 'Paused']] as const;
const COLS = 'grid-cols-[minmax(180px,1.6fr)_minmax(140px,1.3fr)_56px_minmax(110px,1fr)_74px_32px]';

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function StudentsPage({ searchParams }: { searchParams: SP }) {
  const profile = await requireRole('teacher', 'admin');
  const sp = await searchParams;
  const q = param(sp.q)?.trim() ?? '';
  const status = param(sp.status) === 'active' || param(sp.status) === 'paused' ? (param(sp.status) as 'active' | 'paused') : undefined;
  const base = { q: q || undefined, status };

  const supabase = await createClient();
  let query = supabase.from('students').select('*').order('name');
  if (status) query = query.eq('status', status);
  if (q) {
    const term = q.replace(/[,()%*\\]/g, ' ');
    query = query.or(`name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%`);
  }
  const [{ data: students, error }, { data: plans }, { count: total }, { count: active }] = await Promise.all([
    query,
    supabase.from('plans').select('*'),
    supabase.from('students').select('id', { count: 'exact', head: true }),
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);
  if (error) throw error;

  const selected = students.find((s) => s.id === param(sp.id)) ?? students[0];
  const planById = new Map((plans ?? []).map((p) => [p.id, p]));

  const [{ data: contracts }, { data: avatars }, { data: upcoming }] = await Promise.all([
    supabase.from('contracts').select('*').in('student_id', students.map((s) => s.id)).order('start_date'),
    supabase.from('profiles').select('id, avatar_url').in('id', students.map((s) => s.profile_id).filter((x): x is string => !!x)),
    selected
      ? supabase.from('lessons').select('id, starts_at, contract_id').eq('student_id', selected.id).eq('status', 'scheduled')
          .gte('starts_at', new Date().toISOString()).order('starts_at').limit(3)
      : Promise.resolve({ data: [] }),
  ]);
  const avatarOf = new Map((avatars ?? []).map((a) => [a.id, a.avatar_url]));
  const selectedContracts = (contracts ?? []).filter((c) => c.student_id === selected?.id);
  const used = await lessonsUsedThisMonth(supabase, selectedContracts.map((c) => c.id));
  const contractPlan = new Map((contracts ?? []).map((c) => [c.id, planById.get(c.plan_id)!]));

  const editing = param(sp.edit) ? students.find((s) => s.id === param(sp.edit)) : undefined;
  const creating = param(sp.new) === '1';
  const closeHref = withParams(PATH, { ...base, id: selected?.id });
  const teachers = profile.role === 'admin' && creating
    ? (await supabase.from('profiles').select('id, name').eq('role', 'teacher').order('name')).data ?? []
    : undefined;

  return (
    <>
      <TopBar crumb="Management" title="Students" sub={`${total ?? 0} enrolled · ${active ?? 0} active`}
        right={<Link href={withParams(PATH, { ...base, id: selected?.id }, { new: '1' })} scroll={false} className="btn-primary"><Icon name="plus" size={15} />New student</Link>} />
      <ScreenScroll>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section aria-label="Student list" className="card min-w-0">
            <div className="card-h flex-wrap">
              <form role="search" className="relative max-w-[300px] flex-1" action={PATH}>
                {status && <input type="hidden" name="status" value={status} />}
                <label htmlFor="student-search" className="sr-only">Search students</label>
                <Icon name="search" size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3" />
                <input id="student-search" name="q" defaultValue={q} placeholder="Search name, company, email" className="input h-8 pl-8 text-[12.5px]" />
              </form>
              <div className="flex gap-1.5" role="group" aria-label="Filter by status">
                {FILTERS.map(([k, l]) => (
                  <Link key={l} href={withParams(PATH, { ...base, status: k || undefined })} aria-current={(status ?? '') === k ? 'true' : undefined}
                    className={`btn-seg ${(status ?? '') === k ? 'btn-seg-on' : ''}`}>{l}</Link>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[680px]">
                <div className={`grid ${COLS} gap-3 border-b border-line px-4 py-2 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-3`}>
                  <span>Student</span><span>Company · Role</span><span>Level</span><span>Services</span><span>LinkedIn</span><span className="sr-only">WhatsApp</span>
                </div>
                <ul>
                  {students.map((st) => {
                    const on = st.id === selected?.id;
                    return (
                      <li key={st.id} className={`relative grid ${COLS} items-center gap-3 border-b border-line px-4 py-2.5 hover:bg-white/[0.02] ${on ? 'bg-brand/[0.08] shadow-[inset_2px_0_0_#3b82f6]' : ''}`}>
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar name={st.name} src={st.profile_id ? avatarOf.get(st.profile_id) : null} size={32} status={st.status === 'active' ? 'live' : 'away'} />
                          <div className="min-w-0">
                            <Link href={withParams(PATH, { ...base, id: st.id })} scroll={false} aria-current={on ? 'true' : undefined}
                              className="block truncate text-[12.5px] font-semibold text-ink-hi after:absolute after:inset-0">{st.name}</Link>
                            <div className="truncate text-[10.5px] text-ink-3">{st.email}</div>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs text-ink">{st.company ?? '—'}</div>
                          <div className="truncate text-[10.5px] text-ink-3">{st.role_title ?? ''}</div>
                        </div>
                        <span className="pill justify-self-start px-2 py-px text-[10px]">{st.cefr_level}</span>
                        <div className="flex flex-wrap gap-1">
                          {(contracts ?? []).filter((c) => c.student_id === st.id).map((c) => {
                            const p = planById.get(c.plan_id);
                            if (!p) return null;
                            return (
                              <span key={c.id} title={p.name} className={`rounded-[5px] border px-1.5 py-px text-[10px] font-semibold ${c.status === 'paused' ? 'opacity-50' : ''}`}
                                style={{ color: p.color, background: p.color + '1a', borderColor: p.color + '40' }}>{p.name.split(' ')[0]}</span>
                            );
                          })}
                        </div>
                        <span className="flex items-center gap-1.5 text-[11px] text-ink-2">
                          <span className={st.linkedin_url ? '' : 'opacity-35'}><LinkedInMark size={16} /></span>
                          {st.linkedin_synced_at ? 'Synced' : st.linkedin_url ? 'Linked' : 'Off'}
                        </span>
                        <span className="relative z-10"><WhatsAppButton phone={st.whatsapp} message={`Hi ${firstName(st.name)}, `} small /></span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            {students.length === 0 && (
              <EmptyState icon="users" title={q || status ? 'No students match this search' : 'No students yet'}>
                {q || status ? <Link href={PATH} className="font-semibold text-brand-bright">Clear filters</Link>
                  : <Link href={`${PATH}?new=1`} scroll={false} className="font-semibold text-brand-bright">Add your first student</Link>}
              </EmptyState>
            )}
          </section>

          {selected && (
            <StudentDetail
              student={selected}
              avatarUrl={selected.profile_id ? avatarOf.get(selected.profile_id) ?? null : null}
              contracts={selectedContracts.map((c) => ({ ...c, plan: planById.get(c.plan_id)!, used: used.get(c.id) ?? 0 }))}
              upcoming={(upcoming ?? []).map((l) => ({ id: l.id, starts_at: l.starts_at, plan: contractPlan.get(l.contract_id)! })).filter((l) => l.plan)}
              editHref={withParams(PATH, { ...base, id: selected.id }, { edit: selected.id })}
            />
          )}
        </div>
      </ScreenScroll>
      {(creating || editing) && <StudentForm student={editing} closeHref={closeHref} today={today()} teachers={teachers} />}
    </>
  );
}
