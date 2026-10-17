import { ActionForm } from '@/components/ui/ActionForm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ScreenScroll, TopBar } from '@/components/shell/TopBar';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { MetricTile } from '@/components/ui/MetricTile';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { StatusPill } from '@/components/ui/StatusPill';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { requireRole } from '@/lib/auth';
import { lessonsUsedThisMonth } from '@/lib/data/usage';
import { addDays, today } from '@/lib/dates';
import { fmtDate, fmtMoney } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { param, withParams } from '@/lib/url';
import type { ContractStatus } from '@/types/database';
import { renewContract, setContractStatus } from './actions';
import { EditContractForm } from './EditContractForm';
import { NewContractForm } from './NewContractForm';
import { PlanForm } from './PlanForm';

export const metadata: Metadata = { title: 'Services' };

const PATH = '/management/services';
const FILTERS = [['', 'All'], ['active', 'Active'], ['ending', 'Renewal due'], ['paused', 'Paused']] as const;
const COLS = 'grid-cols-[minmax(170px,1.4fr)_minmax(140px,1.2fr)_minmax(130px,1.3fr)_minmax(110px,1.1fr)_minmax(96px,0.9fr)_104px_170px]';

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ServicesPage({ searchParams }: { searchParams: SP }) {
  const profile = await requireRole('teacher', 'admin');
  const sp = await searchParams;
  const status = FILTERS.some(([k]) => k && k === param(sp.status)) ? (param(sp.status) as ContractStatus) : undefined;
  const studentFilter = param(sp.student);
  const base = { status, student: studentFilter };
  const here = withParams(PATH, base);

  const supabase = await createClient();
  const [{ data: plans }, { data: contracts, error }, { data: students }] = await Promise.all([
    supabase.from('plans').select('*').order('list_price_cents', { ascending: false }),
    supabase.from('contracts').select('*').order('renewal_date'),
    supabase.from('students').select('id, name, company, profile_id, status').order('name'),
  ]);
  if (error) throw error;

  const planById = new Map((plans ?? []).map((p) => [p.id, p]));
  const studentById = new Map((students ?? []).map((s) => [s.id, s]));
  const used = await lessonsUsedThisMonth(supabase, contracts.map((c) => c.id));

  const live = contracts.filter((c) => c.status !== 'paused');
  const mrr = live.reduce((a, c) => a + c.price_cents, 0);
  const lessons = live.reduce((a, c) => a + c.lessons_per_month, 0);
  const usedTotal = live.reduce((a, c) => a + (used.get(c.id) ?? 0), 0);
  const soon = addDays(today(), 30);

  const rows = contracts.filter((c) => (!status || c.status === status) && (!studentFilter || c.student_id === studentFilter));
  const editing = contracts.find((c) => c.id === param(sp.edit));
  const editingPlan = profile.role === 'admin' ? (plans ?? []).find((p) => p.id === param(sp.plan)) : undefined;
  const newPlan = profile.role === 'admin' && param(sp.plan) === 'new';

  return (
    <>
      <TopBar crumb="Management" title="Contracted Services" sub="Plans, monthly lessons and agreed values"
        right={<Link href={withParams(PATH, base, { new: '1' })} scroll={false} className="btn-primary"><Icon name="plus" size={15} />New contract</Link>} />
      <ScreenScroll>
        <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricTile label="Active contracts" value={live.length} unit={`/ ${contracts.length}`} />
          <MetricTile label="Monthly revenue" value={fmtMoney(mrr)} />
          <MetricTile label="Lessons contracted / mo" value={lessons} />
          <MetricTile label="Used this month" value={lessons ? Math.round((usedTotal / lessons) * 100) : 0} unit="%" accent="#2dd4a7" />
        </div>

        <section aria-label="Plan catalog" className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {(plans ?? []).map((p) => {
            const n = live.filter((c) => c.plan_id === p.id).length;
            return (
              <div key={p.id} className="card relative min-w-0 p-3.5">
                <div className="mb-3 h-1 w-6 rounded-sm" style={{ background: p.color }} />
                <h2 className="text-[13px] font-bold text-ink-hi">{p.name}</h2>
                <p className="mb-3 mt-0.5 min-h-7 text-[11px] text-ink-3">{p.description}</p>
                <div className="flex items-baseline justify-between">
                  <span className="mono text-sm font-bold text-ink-hi">
                    {p.billing_type === 'per_lesson' && p.lesson_price_cents != null
                      ? <>{fmtMoney(p.lesson_price_cents)}<span className="text-[10.5px] font-normal text-ink-3">/lesson</span></>
                      : <>{fmtMoney(p.list_price_cents)}<span className="text-[10.5px] font-normal text-ink-3">/mo</span></>}
                  </span>
                  <span className="text-[10.5px] text-ink-3">{p.lessons_per_month} lessons/mo</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10.5px] font-semibold" style={{ color: p.color }}>{n} active</span>
                  {profile.role === 'admin' && (
                    <Link href={withParams(PATH, base, { plan: p.id })} scroll={false} className="text-[10.5px] font-semibold text-ink-3 hover:text-ink" aria-label={`Edit plan ${p.name}`}>Edit</Link>
                  )}
                </div>
              </div>
            );
          })}
          {profile.role === 'admin' && (
            <Link href={withParams(PATH, base, { plan: 'new' })} scroll={false}
              className="flex min-h-[130px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong text-xs font-semibold text-ink-3 hover:text-ink">
              <Icon name="plus" size={16} />New plan
            </Link>
          )}
        </section>

        <section aria-label="Contracts" className="card">
          <div className="card-h flex-wrap">
            <h2 className="card-title"><Icon name="file" size={14} className="text-brand-bright" />Contracts
              {studentFilter && studentById.get(studentFilter) && (
                <Link href={withParams(PATH, { status })} className="pill ml-1 normal-case tracking-normal" aria-label="Clear student filter">
                  {studentById.get(studentFilter)!.name}<Icon name="x" size={11} />
                </Link>
              )}
            </h2>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
              {FILTERS.map(([k, l]) => (
                <Link key={l} href={withParams(PATH, { ...base, status: k || undefined })} aria-current={(status ?? '') === k ? 'true' : undefined}
                  className={`btn-seg ${(status ?? '') === k ? 'btn-seg-on' : ''}`}>{l}</Link>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className={`grid ${COLS} gap-3.5 border-b border-line px-4 py-2 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-3`}>
                <span>Student</span><span>Service</span><span>Lessons this month</span><span>Agreed value</span><span>Renewal</span><span>Status</span><span className="sr-only">Actions</span>
              </div>
              <ul>
                {rows.map((c) => {
                  const s = studentById.get(c.student_id);
                  const p = planById.get(c.plan_id);
                  if (!s || !p) return null;
                  const u = used.get(c.id) ?? 0;
                  // per lesson, so fewer lessons than the plan doesn't read as a discount
                  const listPerLesson = p.list_price_cents / p.lessons_per_month;
                  const disc = listPerLesson ? Math.round((1 - c.price_cents / c.lessons_per_month / listPerLesson) * 100) : 0;
                  const renewalSoon = c.status !== 'paused' && c.renewal_date <= soon;
                  return (
                    <li key={c.id} className={`grid ${COLS} items-center gap-3.5 border-b border-line px-4 py-3 ${c.status === 'paused' ? 'opacity-60' : ''}`}>
                      <Link href={`/management/students?id=${s.id}`} className="flex min-w-0 items-center gap-2.5">
                        <Avatar name={s.name} size={28} />
                        <span className="min-w-0">
                          <span className="block truncate text-[12.5px] font-semibold text-ink-hi">{s.name}</span>
                          <span className="block truncate text-[10.5px] text-ink-3">{s.company}</span>
                        </span>
                      </Link>
                      <span className="flex items-center gap-2 text-xs text-ink"><span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: p.color }} />{p.name}</span>
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1"><ProgressTrack value={u} max={c.lessons_per_month} color={p.color} height={5} glow={false} label={`${s.name} ${p.name} usage`} /></div>
                        <span className={`mono w-10 text-right text-[11.5px] ${u > c.lessons_per_month ? 'text-warning' : 'text-ink-2'}`}>{u}/{c.lessons_per_month}</span>
                      </div>
                      <div>
                        <div className="mono text-[13px] font-bold text-ink-hi">{fmtMoney(c.price_cents)}<span className="text-[10.5px] font-normal text-ink-3">/mo</span></div>
                        {c.billing_type === 'per_lesson' && c.lesson_price_cents != null && (
                          <div className="text-[10.5px] text-ink-2">{fmtMoney(c.lesson_price_cents)}/lesson · projected</div>
                        )}
                        <div className={`text-[10.5px] ${disc > 0 ? 'text-warning' : 'text-ink-3'}`}>{disc > 0 ? `${disc}% below list` : disc < 0 ? `${-disc}% above list` : 'List price'}</div>
                      </div>
                      <span className={`mono text-[11.5px] ${renewalSoon ? 'text-warning' : 'text-ink-2'}`}>{fmtDate(c.renewal_date)}</span>
                      <span className="justify-self-start"><StatusPill status={c.status} /></span>
                      <div className="flex justify-end gap-1.5">
                        {(c.status === 'ending' || renewalSoon) && (
                          <ActionForm action={renewContract}>
                            <input type="hidden" name="id" value={c.id} /><input type="hidden" name="back" value={here} />
                            <SubmitButton className="btn-seg border-warning/40 text-warning" pendingLabel="…" aria-label={`Renew ${p.name} for ${s.name}`}>Renew</SubmitButton>
                          </ActionForm>
                        )}
                        <ActionForm action={setContractStatus}>
                          <input type="hidden" name="id" value={c.id} /><input type="hidden" name="back" value={here} />
                          <input type="hidden" name="status" value={c.status === 'paused' ? 'active' : 'paused'} />
                          <SubmitButton className="btn-seg" pendingLabel="…" aria-label={`${c.status === 'paused' ? 'Resume' : 'Pause'} ${p.name} for ${s.name}`}>
                            {c.status === 'paused' ? 'Resume' : 'Pause'}
                          </SubmitButton>
                        </ActionForm>
                        <Link href={withParams(PATH, base, { edit: c.id })} scroll={false} className="btn-seg px-1.5" aria-label={`Edit ${p.name} for ${s.name}`}><Icon name="edit" size={12} /></Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          {rows.length === 0 && (
            <EmptyState icon="file" title={contracts.length ? 'No contracts match this filter' : 'No contracts yet'}>
              <Link href={withParams(PATH, base, { new: '1' })} scroll={false} className="font-semibold text-brand-bright">Create a contract</Link>
            </EmptyState>
          )}
        </section>
      </ScreenScroll>

      {param(sp.new) === '1' && (
        <NewContractForm
          students={(students ?? []).filter((s) => s.status === 'active' || s.id === studentFilter).map(({ id, name, company }) => ({ id, name, company }))}
          plans={plans ?? []} studentId={studentFilter} today={today()} closeHref={here}
          newPlanHref={profile.role === 'admin' ? withParams(PATH, base, { plan: 'new' }) : undefined} />
      )}
      {editing && planById.get(editing.plan_id) && (
        <EditContractForm contract={editing} plan={planById.get(editing.plan_id)!} studentName={studentById.get(editing.student_id)?.name ?? ''} closeHref={here} />
      )}
      {(editingPlan || newPlan) && <PlanForm plan={editingPlan} inUse={editingPlan ? contracts.filter((c) => c.plan_id === editingPlan.id).length : 0} closeHref={here} />}
    </>
  );
}
