import type { Metadata } from 'next';
import { BarsChart } from '@/components/charts/BarsChart';
import { ScreenScroll, TopBar } from '@/components/shell/TopBar';
import { Icon } from '@/components/ui/Icon';
import { MetricTile } from '@/components/ui/MetricTile';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { requireRole } from '@/lib/auth';
import { loadCohort } from '@/lib/data/cohort';
import { addMonths, monthRange, today, zonedTime } from '@/lib/dates';
import { fmtMoney } from '@/lib/format';
import { CEFR, levelFor } from '@/lib/scores';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin' };

const pctOf = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

export default async function AdminPage() {
  await requireRole('admin');
  const supabase = await createClient();
  const firstOfMonth = today().slice(0, 8) + '01';
  const sixMonthsAgo = zonedTime(addMonths(firstOfMonth, -5), 0);
  const { start: monthStart, end: monthEnd } = monthRange();

  const [{ rows }, { data: contracts }, { data: lessons }, { data: teachers }] = await Promise.all([
    loadCohort(supabase),
    supabase.from('contracts').select('student_id, status, price_cents'),
    supabase.from('lessons').select('student_id, teacher_id, status, starts_at, duration_min').gte('starts_at', sixMonthsAgo.toISOString()).lt('starts_at', monthEnd.toISOString()),
    supabase.from('profiles').select('id, name').eq('role', 'teacher'),
  ]);

  const students = rows.map((r) => r.student);
  const active = students.filter((s) => s.status === 'active');
  const running = (contracts ?? []).filter((c) => c.status !== 'paused');
  const mrr = running.reduce((s, c) => s + c.price_cents, 0);
  const inMonth = (iso: string) => Date.parse(iso) >= monthStart.getTime() && Date.parse(iso) < monthEnd.getTime();
  const monthLessons = (lessons ?? []).filter((l) => inMonth(l.starts_at) && Date.parse(l.starts_at) <= Date.now());
  const doneMonth = monthLessons.filter((l) => l.status === 'done');
  const cancelledMonth = monthLessons.filter((l) => l.status === 'cancelled');
  const scored = rows.filter((r) => r.score != null);
  const avgScore = scored.length ? Math.round(scored.reduce((s, r) => s + r.score!, 0) / scored.length) : 0;
  const newThisMonth = students.filter((s) => s.start_date >= firstOfMonth).length;

  // hours taught per month, last 6 months
  const months = Array.from({ length: 6 }, (_, i) => addMonths(firstOfMonth, i - 5));
  const hours = months.map((m) => {
    const from = zonedTime(m, 0).getTime();
    const to = zonedTime(addMonths(m, 1), 0).getTime();
    const minutes = (lessons ?? []).filter((l) => l.status === 'done' && Date.parse(l.starts_at) >= from && Date.parse(l.starts_at) < to).reduce((s, l) => s + l.duration_min, 0);
    return { label: new Date(m + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }), value: Math.round((minutes / 60) * 10) / 10 };
  });

  // proficiency mix by measured level (falls back to the registered level)
  const levelOf = (r: (typeof rows)[number]) => (r.score != null ? levelFor(r.score) : r.student.cefr_level);
  const mix = CEFR.map((c) => ({ label: c.level, value: rows.filter((r) => levelOf(r) === c.level).length }));

  // average score by teacher
  const byTeacher = (teachers ?? []).map((t) => {
    const mine = scored.filter((r) => r.student.teacher_id === t.id);
    return { name: t.name, students: rows.filter((r) => r.student.teacher_id === t.id).length, avg: mine.length ? Math.round(mine.reduce((s, r) => s + r.score!, 0) / mine.length) : 0 };
  }).sort((a, b) => b.avg - a.avg);

  // engagement funnel this month
  const withContract = new Set(running.map((c) => c.student_id));
  const hadLesson = new Set(doneMonth.map((l) => l.student_id));
  const assessedMonth = rows.filter((r) => r.history.some((a) => inMonth(a.created_at)));
  const improved = assessedMonth.filter((r) => r.delta30 > 0);
  const funnel = [
    ['Enrolled', students.length], ['Active', active.length], ['With a running contract', active.filter((s) => withContract.has(s.id)).length],
    ['Had a lesson this month', hadLesson.size], ['Assessed this month', assessedMonth.length], ['Improved score', improved.length],
  ] as const;

  return (
    <>
      <TopBar crumb="Manage" title="Executive Dashboard" sub="Whole school · this month" />
      <ScreenScroll>
        <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricTile label="Total Students" value={students.length} delta={newThisMonth ? `+${newThisMonth} this month` : undefined} />
          <MetricTile label="Active Contracts" value={running.length} unit={`/ ${(contracts ?? []).length}`} />
          <MetricTile label="Monthly Revenue" value={fmtMoney(mrr)} />
          <MetricTile label="Lessons This Month" value={doneMonth.length} />
          <MetricTile label="Hours Taught" value={Math.round(doneMonth.reduce((s, l) => s + l.duration_min, 0) / 6) / 10} unit="h" />
          <MetricTile label="Avg Proficiency" value={avgScore} unit="/ 1000" />
          <MetricTile label="Active Students" value={pctOf(active.length, students.length)} unit="%" />
          <MetricTile label="Cancellation Rate" value={pctOf(cancelledMonth.length, monthLessons.length)} unit="%" accent={cancelledMonth.length ? '#f5b942' : undefined} />
        </div>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <section aria-label="Hours taught" className="card">
            <div className="card-h"><h2 className="card-title"><Icon name="trending" size={14} className="text-positive" />Hours Taught · Last 6 Months</h2></div>
            <div className="p-[18px]"><BarsChart data={hours} name="Hours" unit="h" height={210} color="#3b82f6" /></div>
          </section>
          <section aria-label="Proficiency mix" className="card">
            <div className="card-h"><h2 className="card-title"><Icon name="layers" size={14} className="text-brand-bright" />Proficiency Mix</h2><span className="text-[11px] text-ink-3">students by level</span></div>
            <div className="p-[18px]"><BarsChart data={mix} name="Students" height={210} color="#2dd4a7" /></div>
          </section>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <section aria-label="Performance by teacher" className="card">
            <div className="card-h"><h2 className="card-title"><Icon name="users" size={14} className="text-brand-bright" />Performance by Teacher</h2></div>
            <ul className="px-[18px] py-3.5">
              {byTeacher.map((t, i) => (
                <li key={t.name} className={`grid grid-cols-[minmax(110px,1fr)_2fr_50px] items-center gap-3 py-2.5 ${i < byTeacher.length - 1 ? 'border-b border-line' : ''}`}>
                  <span className="min-w-0"><span className="block truncate text-[12.5px] font-semibold text-ink">{t.name}</span><span className="text-[10.5px] text-ink-3">{t.students} students</span></span>
                  <ProgressTrack value={t.avg} max={1000} color="#3b82f6" label={`${t.name} average score`} />
                  <span className="mono text-right text-[13px] font-bold text-ink-hi">{t.avg || '—'}</span>
                </li>
              ))}
              {!byTeacher.length && <li className="py-2 text-xs text-ink-3">No teachers yet.</li>}
            </ul>
          </section>
          <section aria-label="Engagement funnel" className="card">
            <div className="card-h"><h2 className="card-title"><Icon name="layers" size={14} className="text-positive" />Engagement Funnel</h2><span className="text-[11px] text-ink-3">this month</span></div>
            <ul className="flex flex-col gap-2.5 p-[18px]">
              {funnel.map(([label, n]) => {
                const p = pctOf(n, students.length);
                return (
                  <li key={label}>
                    <div className="mb-1 flex justify-between"><span className="text-xs text-ink-2">{label}</span><span className="mono text-[11px] text-ink-3">{n} · {p}%</span></div>
                    <div className="h-[22px] overflow-hidden rounded-[7px] border border-line bg-input">
                      <div className="h-full rounded-[7px] bg-gradient-to-r from-positive-dim to-positive" style={{ width: `${p}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </ScreenScroll>
    </>
  );
}
