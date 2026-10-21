import type { Metadata } from 'next';
import Link from 'next/link';
import { Legend } from '@/components/charts/Legend';
import { StackedBars } from '@/components/charts/StackedBars';
import { ScreenScroll, TopBar } from '@/components/shell/TopBar';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { MetricTile } from '@/components/ui/MetricTile';
import { requireRole } from '@/lib/auth';
import { loadFinance, type StatementLine } from '@/lib/data/finance';
import { today, zonedParts } from '@/lib/dates';
import { addMonthKey, emptyTotals, expectedCents, type MonthTotals } from '@/lib/finance';
import { fmtDayTime, fmtMoney } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { param, withParams } from '@/lib/url';

export const metadata: Metadata = { title: 'Finance' };

const PATH = '/finance';
const REALIZED = '#2dd4a7';
const SCHEDULED = '#3b82f6';
const OPEN = '#3d475c';
const monthLabel = (m: string, long = false) =>
  new Date(`${m}-15T12:00:00Z`).toLocaleDateString('en-US', { month: long ? 'long' : 'short', year: long ? 'numeric' : '2-digit', timeZone: 'UTC' });
const STATUS_STYLE = { done: ['pill-pos', 'Done'], scheduled: ['pill-brand', 'Scheduled'], cancelled: ['', 'Cancelled'] } as const;

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function FinancePage({ searchParams }: { searchParams: SP }) {
  const profile = await requireRole('teacher', 'admin');
  const sp = await searchParams;
  const current = today().slice(0, 7);
  const month = /^\d{4}-\d{2}$/.test(param(sp.month) ?? '') ? param(sp.month)! : current;
  const supabase = await createClient();

  // admins see everyone unless they open one teacher's statement; teachers always see their own
  const teacherId = profile.role === 'teacher' ? profile.id : param(sp.teacher);
  const { data: teachers } = profile.role === 'admin'
    ? await supabase.from('profiles').select('id, name, email, avatar_url').eq('role', 'teacher').order('name')
    : { data: [{ id: profile.id, name: profile.name, email: profile.email, avatar_url: profile.avatar_url }] };
  const teacher = teacherId ? (teachers ?? []).find((t) => t.id === teacherId) : undefined;

  const from = addMonthKey(month, -6);
  const to = addMonthKey(month, 5);
  const { months, total, byTeacher, lines } = await loadFinance(supabase, from, to, teacher?.id);
  const sel = total.get(month) ?? emptyTotals();
  const base = { teacher: profile.role === 'admin' ? teacher?.id : undefined };
  // stacked: done + scheduled, topped up to what the contracts project for the month
  const chart = months.map((m) => {
    const t = total.get(m) ?? emptyTotals();
    return { label: monthLabel(m), realized: t.doneCents / 100, scheduled: t.scheduledCents / 100, open: Math.max(0, t.contractedCents - expectedCents(t)) / 100 };
  });

  const monthNav = (
    <div className="flex items-center gap-2">
      <Link href={withParams(PATH, base, { month: addMonthKey(month, -1) })} className="icon-btn text-ink-2" aria-label="Previous month"><Icon name="chevL" size={16} /></Link>
      <span className="mono min-w-[130px] text-center text-xs text-ink-hi" aria-live="polite">{monthLabel(month, true)}</span>
      <Link href={withParams(PATH, base, { month: addMonthKey(month, 1) })} className="icon-btn text-ink-2" aria-label="Next month"><Icon name="chevR" size={16} /></Link>
      {month !== current && <Link href={withParams(PATH, base)} className="btn-ghost">This month</Link>}
    </div>
  );

  const title = teacher ? (profile.role === 'admin' ? `${teacher.name} · Statement` : 'My Statement') : 'Finance Overview';

  return (
    <>
      <TopBar crumb={profile.role === 'admin' && teacher ? 'Finance · Teacher' : 'Manage'} title={title}
        sub={teacher ? 'Lessons and their value, month by month' : 'Projected, scheduled and realized revenue for all teachers'}
        right={<>
          {profile.role === 'admin' && teacher && <Link href={withParams(PATH, { month: month === current ? undefined : month })} className="btn-ghost">All teachers</Link>}
          {monthNav}
        </>} />
      <ScreenScroll>
        <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricTile label={`Realized · ${sel.done} done`} value={fmtMoney(sel.doneCents)} accent={REALIZED} />
          <MetricTile label={`Scheduled · ${sel.scheduled} to come`} value={fmtMoney(sel.scheduledCents)} />
          <MetricTile label="Month result (expected)" value={fmtMoney(expectedCents(sel))} />
          <MetricTile label={`Contracted · ${sel.contractedLessons} lessons`} value={fmtMoney(sel.contractedCents)} />
        </div>

        {teacher && <Statement lines={lines.filter((l) => zonedParts(new Date(l.startsAt)).day.startsWith(month))} totals={sel} month={month} />}
        <section aria-label="Revenue by month" className={`card ${teacher ? 'mt-4' : 'mb-4'}`}>
          <div className="card-h flex-wrap">
            <h2 className="card-title"><Icon name="trending" size={14} className="text-positive" />Revenue by month</h2>
            <Legend items={[{ label: 'Realized (done)', color: REALIZED }, { label: 'Scheduled', color: SCHEDULED }, { label: 'Contracted, not scheduled yet', color: OPEN }]} />
          </div>
          <div className="px-3 pb-2 pt-4">
            <StackedBars money data={chart} series={[{ key: 'realized', name: 'Realized', color: REALIZED }, { key: 'scheduled', name: 'Scheduled', color: SCHEDULED }, { key: 'open', name: 'Contracted, not scheduled', color: OPEN }]} />
          </div>
          <MonthTable months={months} total={total} selected={month} hrefFor={(m) => withParams(PATH, base, { month: m === current ? undefined : m })} />
        </section>

        {!teacher && (
          <section aria-label="Teachers this month" className="card">
            <div className="card-h"><h2 className="card-title"><Icon name="users" size={14} className="text-brand-bright" />Teachers · {monthLabel(month, true)}</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="border-b border-line text-[10px] uppercase tracking-[0.06em] text-ink-3">
                  <tr>{['Teacher', 'Lessons (done / to come / cancelled)', 'Realized', 'Scheduled', 'Expected', 'Contracted'].map((h) => <th key={h} scope="col" className="px-4 py-2 font-bold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {(teachers ?? []).map((t) => {
                    const r = byTeacher.get(t.id)?.get(month) ?? emptyTotals();
                    return (
                      <tr key={t.id} className="border-b border-line last:border-0 hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5">
                          <Link href={withParams(PATH, { teacher: t.id, month: month === current ? undefined : month })} className="flex items-center gap-2.5">
                            <Avatar name={t.name || t.email} src={t.avatar_url} size={28} />
                            <span className="font-semibold text-ink-hi hover:underline">{t.name || t.email}</span>
                          </Link>
                        </td>
                        <td className="mono px-4 py-2.5 text-ink-2">{r.done} / {r.scheduled} / {r.cancelled}</td>
                        <td className="mono px-4 py-2.5 text-ink-hi">{fmtMoney(r.doneCents)}</td>
                        <td className="mono px-4 py-2.5 text-ink-hi">{fmtMoney(r.scheduledCents)}</td>
                        <td className="mono px-4 py-2.5 font-bold text-ink-hi">{fmtMoney(expectedCents(r))}</td>
                        <td className="mono px-4 py-2.5 text-ink-2">{fmtMoney(r.contractedCents)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!teachers?.length && <EmptyState icon="users" title="No teachers yet" />}
            </div>
          </section>
        )}
      </ScreenScroll>
    </>
  );
}

function MonthTable({ months, total, selected, hrefFor }: { months: string[]; total: Map<string, MonthTotals>; selected: string; hrefFor: (m: string) => string }) {
  return (
    <div className="overflow-x-auto border-t border-line">
      <table className="w-full min-w-[720px] text-left text-xs">
        <caption className="sr-only">Monthly totals</caption>
        <thead className="border-b border-line text-[10px] uppercase tracking-[0.06em] text-ink-3">
          <tr>{['Month', 'Contracted', 'Realized', 'Scheduled', 'Expected', 'vs contracted'].map((h) => <th key={h} scope="col" className="px-4 py-2 font-bold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {months.map((m) => {
            const t = total.get(m) ?? emptyTotals();
            const diff = expectedCents(t) - t.contractedCents;
            const on = m === selected;
            return (
              <tr key={m} className={`border-b border-line last:border-0 ${on ? 'bg-brand/[0.08]' : 'hover:bg-white/[0.02]'}`}>
                <th scope="row" className="px-4 py-2 font-semibold">
                  <Link href={hrefFor(m)} scroll={false} aria-current={on ? 'true' : undefined} className={on ? 'text-ink-hi' : 'text-ink-2 hover:text-ink-hi'}>{monthLabel(m, true)}</Link>
                </th>
                <td className="mono px-4 py-2 text-ink-2">{fmtMoney(t.contractedCents)}</td>
                <td className="mono px-4 py-2 text-ink-hi">{fmtMoney(t.doneCents)}</td>
                <td className="mono px-4 py-2 text-ink-hi">{fmtMoney(t.scheduledCents)}</td>
                <td className="mono px-4 py-2 font-bold text-ink-hi">{fmtMoney(expectedCents(t))}</td>
                <td className={`mono px-4 py-2 ${diff < 0 ? 'text-warning' : 'text-ink-3'}`}>{diff === 0 ? '—' : `${diff > 0 ? '+' : '−'}${fmtMoney(Math.abs(diff))}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Statement({ lines, totals, month }: { lines: StatementLine[]; totals: MonthTotals; month: string }) {
  return (
    <section aria-label="Statement" className="card">
      <div className="card-h">
        <h2 className="card-title"><Icon name="file" size={14} className="text-brand-bright" />Statement · {monthLabel(month, true)}</h2>
        <span className="text-[11px] text-ink-3">{lines.length} lesson{lines.length === 1 ? '' : 's'}</span>
      </div>
      {lines.length === 0 ? (
        <EmptyState icon="calendar" title="No lessons this month" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="border-b border-line text-[10px] uppercase tracking-[0.06em] text-ink-3">
              <tr>{['Date', 'Student', 'Service', 'Status', 'Value'].map((h, i) => <th key={h} scope="col" className={`px-4 py-2 font-bold ${i === 4 ? 'text-right' : ''}`}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {lines.map((l) => {
                const [cls, label] = STATUS_STYLE[l.status];
                return (
                  <tr key={l.id} className={`border-b border-line hover:bg-white/[0.02] ${l.status === 'cancelled' ? 'text-ink-3' : ''}`}>
                    <td className="mono px-4 py-2.5 text-ink-2">{fmtDayTime(l.startsAt)} · {l.durationMin}m</td>
                    <td className="px-4 py-2.5"><Link href={`/management/students?id=${l.studentId}`} className="font-semibold text-ink-hi hover:underline">{l.studentName}</Link></td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2 text-ink"><span className="h-2 w-2 rounded-sm" style={{ background: l.planColor }} />{l.planName}</span>
                      <span className="text-[10.5px] text-ink-3">{l.billing === 'per_lesson' ? 'per lesson' : 'monthly, split per lesson'}</span>
                    </td>
                    <td className="px-4 py-2.5"><span className={`pill px-2 py-px text-[10px] ${cls}`}>{label}</span></td>
                    <td className={`mono px-4 py-2.5 text-right ${l.status === 'cancelled' ? 'line-through' : 'font-semibold text-ink-hi'}`}>{fmtMoney(l.valueCents)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="text-xs">
              <tr className="border-b border-line"><th scope="row" colSpan={4} className="px-4 py-2 text-right font-semibold text-ink-2">Realized ({totals.done} done)</th><td className="mono px-4 py-2 text-right text-positive">{fmtMoney(totals.doneCents)}</td></tr>
              <tr className="border-b border-line"><th scope="row" colSpan={4} className="px-4 py-2 text-right font-semibold text-ink-2">Scheduled ({totals.scheduled} to come)</th><td className="mono px-4 py-2 text-right text-ink-hi">{fmtMoney(totals.scheduledCents)}</td></tr>
              <tr><th scope="row" colSpan={4} className="px-4 py-2.5 text-right font-bold text-ink-hi">Month result</th><td className="mono px-4 py-2.5 text-right text-sm font-bold text-ink-hi">{fmtMoney(expectedCents(totals))}</td></tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
