import type { Metadata } from 'next';
import Link from 'next/link';
import { Heatmap } from '@/components/charts/Heatmap';
import { ScreenScroll, TopBar } from '@/components/shell/TopBar';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { MetricTile } from '@/components/ui/MetricTile';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { Sparkline } from '@/components/ui/Sparkline';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { requireRole } from '@/lib/auth';
import { lastMonths, loadCohort, monthlyScores, skillAverages } from '@/lib/data/cohort';
import { firstName } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { param } from '@/lib/url';

export const metadata: Metadata = { title: 'Teacher View' };

const COLS = 'grid-cols-[28px_minmax(170px,1fr)_56px_64px_70px_100px_110px]';
const attnColor = (v: number) => (v >= 80 ? '#2dd4a7' : v >= 65 ? '#e7b35c' : '#f0524d');

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function TeacherPage({ searchParams }: { searchParams: SP }) {
  const profile = await requireRole('teacher', 'admin');
  const sort = param((await searchParams).sort) === 'attention' ? 'attention' : 'score';
  const supabase = await createClient();
  const { rows, minutesThisWeek, activeThisMonth } = await loadCohort(supabase);

  const active = rows.filter((r) => r.student.status === 'active');
  const scored = active.filter((r) => r.score != null);
  const avg = scored.length ? Math.round(scored.reduce((s, r) => s + r.score!, 0) / scored.length) : 0;
  const avgDelta = scored.length ? Math.round(scored.reduce((s, r) => s + r.delta30, 0) / scored.length) : 0;
  const atRisk = rows.filter((r) => r.risk);
  const ranked = [...rows].sort((a, b) =>
    sort === 'score' ? (b.score ?? -1) - (a.score ?? -1) : (a.attendance ?? 101) - (b.attendance ?? 101));
  const weakest = skillAverages(rows);
  const months = lastMonths(8);

  return (
    <>
      <TopBar crumb="Manage" title="Teacher Cohort View" sub={`${profile.role === 'admin' ? 'All teachers' : profile.name} · ${active.length} active students`}
        right={<Link href="/management/students" className="btn-ghost"><Icon name="users" size={15} className="text-ink-2" />Manage students</Link>} />
      <ScreenScroll>
        {rows.length === 0 ? (
          <div className="card"><EmptyState icon="users" title="No students yet"><Link href="/management/students?new=1" className="font-semibold text-brand-bright">Add a student</Link></EmptyState></div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <MetricTile label="Cohort Avg" value={avg} delta={`${avgDelta >= 0 ? '+' : ''}${avgDelta}`} deltaUp={avgDelta >= 0} />
              <MetricTile label="Active This Month" value={activeThisMonth.size} unit={`/${active.length}`} />
              <MetricTile label="At Risk" value={atRisk.length} accent={atRisk.length ? '#f0524d' : undefined} />
              <MetricTile label="Hrs This Week" value={Math.round((minutesThisWeek / 60) * 10) / 10} unit="h" />
            </div>

            <div className="grid items-start gap-4 xl:grid-cols-[1fr_340px]">
              <section aria-label="Student ranking" className="card min-w-0">
                <div className="card-h">
                  <h2 className="card-title"><Icon name="users" size={14} className="text-brand-bright" />Student Ranking</h2>
                  <div className="flex gap-1.5">
                    <Link href="/teacher" aria-current={sort === 'score' ? 'true' : undefined} className={`btn-seg ${sort === 'score' ? 'btn-seg-on' : ''}`}>By score</Link>
                    <Link href="/teacher?sort=attention" aria-current={sort === 'attention' ? 'true' : undefined} className={`btn-seg ${sort === 'attention' ? 'btn-seg-on' : ''}`}>By attendance</Link>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[640px]">
                    <div className={`grid ${COLS} gap-3 border-b border-line px-4 py-2 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-3`}>
                      <span>#</span><span>Student</span><span>Level</span><span>Score</span><span>30 days</span><span>Trend</span><span>Attendance</span>
                    </div>
                    <ol>
                      {ranked.map((r, i) => {
                        const tc = r.delta30 > 0 ? 'text-positive' : r.delta30 < 0 ? 'text-risk' : 'text-ink-3';
                        return (
                          <li key={r.student.id} className={`relative grid ${COLS} items-center gap-3 border-b border-line px-4 py-2.5 last:border-0 hover:bg-white/[0.02] ${r.risk ? 'bg-risk/[0.04]' : ''}`}>
                            <span className={`mono text-[13px] font-bold ${i < 3 && r.score != null ? 'text-gold' : 'text-ink-3'}`}>{i + 1}</span>
                            <div className="flex min-w-0 items-center gap-2.5">
                              <Avatar name={r.student.name} size={30} status={r.risk ? 'away' : 'live'} />
                              <div className="min-w-0">
                                <Link href={`/dashboard?student=${r.student.id}`} className="block truncate text-[12.5px] font-semibold text-ink-hi after:absolute after:inset-0">{r.student.name}</Link>
                                <div className="truncate text-[10.5px] text-ink-3">{[r.student.role_title, r.student.company].filter(Boolean).join(' · ')}</div>
                              </div>
                            </div>
                            <span className="pill justify-self-start px-2 py-px text-[10px]">{r.student.cefr_level}</span>
                            <span className="mono text-[15px] font-bold text-ink-hi">{r.score ?? '—'}</span>
                            <span className={`mono flex items-center gap-1 text-xs font-semibold ${tc}`}>
                              <Icon name={r.delta30 > 0 ? 'arrowUp' : r.delta30 < 0 ? 'arrowDown' : 'arrowR'} size={13} />{r.delta30 > 0 ? '+' : ''}{r.delta30}
                            </span>
                            <Sparkline data={r.spark} width={90} height={24} color={r.delta90 < 0 ? '#f0524d' : '#2dd4a7'} />
                            <div className="flex items-center gap-2">
                              {r.attendance == null ? <span className="text-[11px] text-ink-3">No lessons</span> : (
                                <>
                                  <div className="flex-1"><ProgressTrack value={r.attendance} color={attnColor(r.attendance)} height={5} glow={false} label={`${r.student.name} attendance`} /></div>
                                  <span className="mono text-[11px] text-ink-2">{r.attendance}</span>
                                </>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-4">
                <section aria-label="Students at risk" className="card border-risk/25">
                  <div className="card-h"><h2 className="card-title"><Icon name="alert" size={14} className="text-risk" />Students at Risk</h2><span className="pill pill-neg text-[10px]">{atRisk.length}</span></div>
                  <ul className="p-2.5">
                    {atRisk.map((r) => (
                      <li key={r.student.id} className="flex items-center gap-2.5 px-2 py-2">
                        <Avatar name={r.student.name} size={32} status="away" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12.5px] font-semibold text-ink-hi">{r.student.name}</div>
                          <div className="text-[10.5px] text-risk">{r.risk}{r.attendance != null ? ` · ${r.attendance}% attendance` : ''}</div>
                        </div>
                        <WhatsAppButton phone={r.student.whatsapp} small message={`Hi ${firstName(r.student.name)}, how are you? Let's plan your next English lesson.`} />
                      </li>
                    ))}
                    {!atRisk.length && <li className="px-2 py-3 text-xs text-ink-3">Everyone is on track.</li>}
                  </ul>
                </section>

                <section aria-label="Weakest skills" className="card">
                  <div className="card-h"><h2 className="card-title"><Icon name="target" size={14} className="text-gold" />Cohort Skills</h2><span className="text-[11px] text-ink-3">weakest first</span></div>
                  <ul className="flex flex-col gap-3 px-4 py-3">
                    {weakest.map((s) => (
                      <li key={s.key}>
                        <div className="mb-1.5 flex justify-between"><span className="text-xs text-ink">{s.label}</span><span className="mono text-[11px] text-ink-2">{s.avg}</span></div>
                        <ProgressTrack value={s.avg} color="#e7b35c" height={5} glow={false} label={`${s.label} cohort average`} />
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>

            <section aria-label="Cohort evolution" className="card mt-4">
              <div className="card-h"><h2 className="card-title"><Icon name="grid" size={14} className="text-brand-bright" />Cohort Evolution Heatmap</h2><span className="text-[11px] text-ink-3">monthly score · last 8 months</span></div>
              <div className="p-[18px]">
                <Heatmap caption="Monthly score by student" rows={rows.map((r) => r.student.name.split(' ')[0]!)}
                  cols={months.map((m) => new Date(m + '-15T12:00:00Z').toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }))}
                  values={rows.map((r) => monthlyScores(r.history, months))}
                  min={Math.min(...rows.flatMap((r) => monthlyScores(r.history, months)).filter((v): v is number => v != null), 1000)} max={1000} />
              </div>
            </section>
          </>
        )}
      </ScreenScroll>
    </>
  );
}
