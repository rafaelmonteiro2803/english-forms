import { ActionForm } from '@/components/ui/ActionForm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ScreenScroll, TopBar } from '@/components/shell/TopBar';
import { Icon } from '@/components/ui/Icon';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { requireRole } from '@/lib/auth';
import { lessonsUsedThisMonth } from '@/lib/data/usage';
import { addDays, isDay, weekStart, zonedParts, zonedTime } from '@/lib/dates';
import { fmtClock, fmtDayTime } from '@/lib/format';
import { googleConfigured } from '@/lib/google/oauth';
import { isSchedulable } from '@/lib/rules/lesson';
import { createClient } from '@/lib/supabase/server';
import { param, withParams } from '@/lib/url';
import { DAY_END_MIN, DAY_START_MIN } from '@/lib/validation/lesson';
import { ignoreGoogleEvent } from './actions';
import { GoogleCard } from './GoogleCard';
import { LessonDetails } from './LessonDetails';
import { LessonForm, type ContractOption } from './LessonForm';

export const metadata: Metadata = { title: 'Calendar' };

const PATH = '/management/calendar';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ROW = 50; // px per hour
const HOURS = Array.from({ length: (DAY_END_MIN - DAY_START_MIN) / 60 }, (_, i) => DAY_START_MIN / 60 + i);
const topOf = (min: number) => ((min - DAY_START_MIN) / 60) * ROW;

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function CalendarPage({ searchParams }: { searchParams: SP }) {
  const profile = await requireRole('teacher', 'admin');
  const sp = await searchParams;
  const now = zonedParts(new Date());
  const thisWeek = weekStart(now.day);
  const week = isDay(param(sp.week)) ? weekStart(param(sp.week)!) : thisWeek;
  const hide = (param(sp.hide) ?? '').split(',').filter(Boolean);
  const base = { week: week === thisWeek ? undefined : week, hide: hide.join(',') || undefined };
  const here = withParams(PATH, base);
  const days = DAYS.map((_, i) => addDays(week, i));

  const supabase = await createClient();
  const from = zonedTime(week, 0).toISOString();
  const to = zonedTime(addDays(week, 7), 0).toISOString();
  const [{ data: lessons, error }, { data: students }, { data: contracts }, { data: plans }, { data: account }, { data: unlinked }] = await Promise.all([
    supabase.from('lessons').select('*').neq('status', 'cancelled').gte('starts_at', from).lt('starts_at', to).order('starts_at'),
    supabase.from('students').select('id, name, company, role_title, whatsapp, status').order('name'),
    supabase.from('contracts').select('*'),
    supabase.from('plans').select('*').order('list_price_cents', { ascending: false }),
    profile.role === 'teacher'
      ? supabase.from('google_accounts').select('email, add_meet, last_synced_at').eq('teacher_id', profile.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('google_unlinked_events').select('*').gte('ends_at', new Date(Date.now() - 7 * 86400000).toISOString()).order('starts_at'),
  ]);
  if (error) throw error;

  const studentById = new Map((students ?? []).map((s) => [s.id, s]));
  const contractById = new Map((contracts ?? []).map((c) => [c.id, c]));
  const planById = new Map((plans ?? []).map((p) => [p.id, p]));
  const planOfLesson = (contractId: string) => planById.get(contractById.get(contractId)?.plan_id ?? '');
  const used = await lessonsUsedThisMonth(supabase, (contracts ?? []).map((c) => c.id));

  const visible = lessons.filter((l) => !hide.includes(contractById.get(l.contract_id)?.plan_id ?? ''));
  const weekUnlinked = (unlinked ?? []).filter((u) => u.starts_at >= from && u.starts_at < to);
  const label = `${new Date(week + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} – ${new Date(days[6] + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;

  // modals
  const openLesson = lessons.find((l) => l.id === param(sp.lesson));
  const editLesson = lessons.find((l) => l.id === param(sp.edit) && l.status === 'scheduled');
  const linkEvent = (unlinked ?? []).find((u) => u.google_event_id === param(sp.link));
  const creating = param(sp.new) === '1' || !!linkEvent || !!editLesson;
  let lessonForm: React.ReactNode = null;
  if (creating) {
    const activeStudents = (students ?? []).filter((s) => s.status === 'active' || s.id === editLesson?.student_id);
    const contractsByStudent: Record<string, ContractOption[]> = {};
    for (const c of contracts ?? []) {
      if (!isSchedulable(c.status) && c.id !== editLesson?.contract_id) continue;
      const p = planById.get(c.plan_id);
      if (!p) continue;
      (contractsByStudent[c.student_id] ??= []).push({ id: c.id, planName: p.name, color: p.color, left: Math.max(0, c.lessons_per_month - (used.get(c.id) ?? 0)) });
    }
    const startOf = (iso: string) => zonedParts(new Date(iso));
    const initial = editLesson
      ? { id: editLesson.id, student_id: editLesson.student_id, contract_id: editLesson.contract_id, day: startOf(editLesson.starts_at).day, start_min: startOf(editLesson.starts_at).minutes, duration_min: editLesson.duration_min }
      : linkEvent
        ? { day: startOf(linkEvent.starts_at).day, start_min: startOf(linkEvent.starts_at).minutes, duration_min: Math.round((Date.parse(linkEvent.ends_at) - Date.parse(linkEvent.starts_at)) / 60000) }
        : {
            student_id: param(sp.student),
            day: isDay(param(sp.day)) ? param(sp.day)! : week === thisWeek ? now.day : week,
            start_min: Number(param(sp.start)) || 15 * 60,
            duration_min: 60,
          };
    lessonForm = (
      <LessonForm students={activeStudents.map(({ id, name, company }) => ({ id, name, company }))} contractsByStudent={contractsByStudent}
        initial={initial} link={linkEvent ? { google_event_id: linkEvent.google_event_id, summary: linkEvent.summary } : undefined}
        googleEmail={account?.email} addMeet={account?.add_meet} closeHref={here} />
    );
  }

  return (
    <>
      <TopBar crumb="Management" title="Calendar" sub={account ? `Google Calendar · ${account.email}` : 'Week view'}
        right={<>
          <Link href={withParams(PATH, base, { week: addDays(week, -7) })} className="icon-btn text-ink-2" aria-label="Previous week"><Icon name="chevL" size={16} /></Link>
          <span className="mono min-w-[150px] text-center text-xs text-ink-hi" aria-live="polite">{label}</span>
          <Link href={withParams(PATH, base, { week: addDays(week, 7) })} className="icon-btn text-ink-2" aria-label="Next week"><Icon name="chevR" size={16} /></Link>
          <Link href={withParams(PATH, { ...base, week: undefined })} className="btn-ghost">Today</Link>
          <Link href={withParams(PATH, base, { new: '1' })} scroll={false} className="btn-primary"><Icon name="plus" size={15} />New lesson</Link>
        </>} />
      <ScreenScroll>
        <div className="grid items-start gap-4 xl:grid-cols-[256px_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            {profile.role === 'teacher' && <GoogleCard account={account} back={here} configured={googleConfigured()} />}

            {(unlinked ?? []).length > 0 && (
              <section aria-label="Needs linking" className="card border-warning/30 p-4">
                <h2 className="label-caps mb-2.5 flex items-center gap-2 text-warning"><Icon name="alert" size={13} />Needs linking</h2>
                <p className="mb-2.5 text-[11.5px] leading-snug text-ink-2">Created directly in Google. Link a student and active service to count it as a lesson.</p>
                <ul className="flex flex-col gap-2">
                  {(unlinked ?? []).map((u) => (
                    <li key={u.google_event_id} className="flex items-stretch gap-1.5">
                      <Link href={withParams(PATH, { ...base, week: weekStart(zonedParts(new Date(u.starts_at)).day) }, { link: u.google_event_id })} scroll={false}
                        className="min-w-0 flex-1 rounded-[8px] border border-dashed border-warning/45 bg-input px-3 py-2 hover:bg-hover">
                        <span className="block truncate text-xs font-semibold text-ink-hi">{u.summary}</span>
                        <span className="mono mt-0.5 block text-[10.5px] text-ink-3">{fmtDayTime(u.starts_at)}</span>
                      </Link>
                      <ActionForm action={ignoreGoogleEvent}>
                        <input type="hidden" name="google_event_id" value={u.google_event_id} /><input type="hidden" name="back" value={here} />
                        <SubmitButton className="icon-btn h-full w-8 text-ink-3" pendingLabel="…" aria-label={`Ignore ${u.summary}`} title="Not a lesson"><Icon name="x" size={13} /></SubmitButton>
                      </ActionForm>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-label="Services filter" className="card p-4">
              <h2 className="label-caps mb-2.5">Services</h2>
              <ul className="flex flex-col gap-2">
                {(plans ?? []).map((p) => {
                  const on = !hide.includes(p.id);
                  const next = on ? [...hide, p.id] : hide.filter((x) => x !== p.id);
                  const count = lessons.filter((l) => contractById.get(l.contract_id)?.plan_id === p.id).length;
                  return (
                    <li key={p.id}>
                      <Link href={withParams(PATH, { ...base, hide: next.join(',') || undefined })} role="checkbox" aria-checked={on} className="flex items-center gap-2.5">
                        <span className="flex h-[15px] w-[15px] items-center justify-center rounded border-[1.5px]" style={{ borderColor: p.color, background: on ? p.color : 'transparent' }}>
                          {on && <Icon name="check" size={10} strokeWidth={3.5} className="text-deep" />}
                        </span>
                        <span className={`flex-1 text-xs ${on ? 'text-ink' : 'text-ink-3'}`}>{p.name}</span>
                        <span className="mono text-[10.5px] text-ink-3">{count}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <section aria-label={`Week of ${label}`} className="card overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[54px_repeat(7,minmax(0,1fr))] border-b border-line">
                <div />
                {days.map((d, i) => {
                  const isToday = d === now.day;
                  return (
                    <div key={d} className="border-l border-line px-2 py-2.5 text-center">
                      <div className={`text-[10.5px] font-bold uppercase tracking-[0.06em] ${isToday ? 'text-brand-bright' : 'text-ink-3'}`}>{DAYS[i]}</div>
                      <div className={`mono mx-auto mt-1 h-[30px] w-[30px] rounded-full text-[17px] font-bold leading-[30px] ${isToday ? 'bg-brand text-white' : 'text-ink-hi'}`}>{Number(d.slice(8))}</div>
                    </div>
                  );
                })}
              </div>
              <div className="relative grid grid-cols-[54px_repeat(7,minmax(0,1fr))]">
                <div aria-hidden="true">
                  {HOURS.map((h) => <div key={h} className="mono -translate-y-1.5 pr-2 text-right text-[10px] text-ink-3" style={{ height: ROW }}>{h * 60 > DAY_START_MIN ? fmtClock(h * 60) : ''}</div>)}
                </div>
                {days.map((d, di) => (
                  <div key={d} className={`relative border-l border-line ${d === now.day ? 'bg-brand/[0.03]' : di >= 5 ? 'bg-white/[0.012]' : ''}`}>
                    {HOURS.map((h) => (
                      <Link key={h} href={withParams(PATH, base, { new: '1', day: d, start: String(h * 60) })} scroll={false} prefetch={false}
                        aria-label={`New lesson ${DAYS[di]} ${fmtClock(h * 60)}`} tabIndex={-1}
                        className={`block cursor-copy hover:bg-white/[0.02] ${h * 60 > DAY_START_MIN ? 'border-t border-line' : ''}`} style={{ height: ROW }} />
                    ))}
                    {visible.filter((l) => zonedParts(new Date(l.starts_at)).day === d).map((l) => {
                      const s = studentById.get(l.student_id);
                      const p = planOfLesson(l.contract_id);
                      const start = zonedParts(new Date(l.starts_at)).minutes;
                      if (!s || !p || start >= DAY_END_MIN || start + l.duration_min <= DAY_START_MIN) return null;
                      const names = s.name.split(' ');
                      return (
                        <Link key={l.id} href={withParams(PATH, base, { lesson: l.id })} scroll={false}
                          className={`absolute inset-x-1 z-[2] overflow-hidden rounded-[7px] border px-[7px] py-[3px] leading-[13px] ${l.status === 'done' ? 'opacity-60' : ''}`}
                          style={{ top: Math.max(0, topOf(start)) + 2, height: (l.duration_min / 60) * ROW - 4, background: p.color + '22', borderColor: p.color + '55' }}>
                          <span className="block truncate text-[11px] font-bold text-ink-hi">{names[0]} {names.length > 1 ? `${names[names.length - 1]![0]}.` : ''}{l.status === 'done' ? ' ✓' : ''}</span>
                          <span className="block truncate text-[10px]" style={{ color: p.color }}>{p.name}</span>
                          {l.duration_min >= 60 && <span className="mono mt-px block text-[9.5px] text-ink-3">{fmtClock(start)}–{fmtClock(start + l.duration_min)}</span>}
                        </Link>
                      );
                    })}
                    {weekUnlinked.filter((u) => zonedParts(new Date(u.starts_at)).day === d).map((u) => {
                      const start = zonedParts(new Date(u.starts_at)).minutes;
                      const dur = (Date.parse(u.ends_at) - Date.parse(u.starts_at)) / 60000;
                      if (start >= DAY_END_MIN) return null;
                      return (
                        <Link key={u.google_event_id} href={withParams(PATH, base, { link: u.google_event_id })} scroll={false}
                          className="absolute inset-x-1 z-[2] overflow-hidden rounded-[7px] border border-dashed border-warning/60 bg-warning/[0.07] px-[7px] py-[5px]"
                          style={{ top: Math.max(0, topOf(start)) + 2, height: Math.max(22, (dur / 60) * ROW - 4) }}>
                          <span className="block truncate text-[11px] font-semibold text-warning">{u.summary}</span>
                          <span className="block text-[10px] text-ink-3">Not linked</span>
                        </Link>
                      );
                    })}
                    {d === now.day && now.minutes >= DAY_START_MIN && now.minutes < DAY_END_MIN && (
                      <div aria-hidden="true" className="pointer-events-none absolute -left-px right-0 z-[3] h-0.5 bg-risk" style={{ top: topOf(now.minutes) }}>
                        <span className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-risk" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {visible.length === 0 && weekUnlinked.length === 0 && (
              <p className="border-t border-line px-4 py-3 text-center text-xs text-ink-3">No lessons this week. Click a time slot or “New lesson” to schedule one.</p>
            )}
          </section>
        </div>
      </ScreenScroll>

      {openLesson && !editLesson && (() => {
        const c = contractById.get(openLesson.contract_id);
        const p = c && planById.get(c.plan_id);
        const s = studentById.get(openLesson.student_id);
        if (!c || !p || !s) return null;
        return <LessonDetails lesson={openLesson} student={s} contract={c} plan={p} used={used.get(c.id) ?? 0} googleEmail={account?.email ?? null}
          closeHref={here} editHref={withParams(PATH, base, { edit: openLesson.id })} />;
      })()}
      {lessonForm}
    </>
  );
}
