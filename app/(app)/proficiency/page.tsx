import type { Metadata } from 'next';
import Link from 'next/link';
import { Legend } from '@/components/charts/Legend';
import { TrendChart, type TrendPoint } from '@/components/charts/TrendChart';
import { StudentPicker } from '@/components/shell/StudentPicker';
import { ScreenScroll, TopBar } from '@/components/shell/TopBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { requireRole } from '@/lib/auth';
import { assessmentsOf, resolveStudent } from '@/lib/data/student';
import { addMonths, APP_TZ, today } from '@/lib/dates';
import { CEFR, examEquivalents, levelFor, monthlyTrend, monthsTo, nextLevel, project, score1000, SKILLS } from '@/lib/scores';
import { createClient } from '@/lib/supabase/server';
import { param } from '@/lib/url';

export const metadata: Metadata = { title: 'Proficiency' };

const LO = 100, HI = 1000;
const pct = (v: number) => ((Math.max(LO, Math.min(HI, v)) - LO) / (HI - LO)) * 100;
const monthLabel = (day: string) => new Date(day + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ProficiencyPage({ searchParams }: { searchParams: SP }) {
  const profile = await requireRole();
  const supabase = await createClient();
  const { student, options } = await resolveStudent(supabase, profile, param((await searchParams).student));
  const history = student ? await assessmentsOf(supabase, student.id) : [];
  const latest = history.at(-1);

  const top = (
    <TopBar crumb="Insights" title="Proficiency Trajectory" sub={student ? `${options.length ? student.name + ' · ' : ''}CEFR · TOEFL · IELTS · TOEIC equivalence` : undefined}
      right={student && <StudentPicker options={options} value={student.id} />} />
  );
  if (!student || !latest) {
    return (
      <>{top}<ScreenScroll><div className="card"><EmptyState icon="trending" title="No assessments yet">
        The trajectory appears after the first assessed lesson. {profile.role !== 'student' && <Link href="/reports" className="font-semibold text-brand-bright">Score a lesson</Link>}
      </EmptyState></div></ScreenScroll></>
    );
  }

  const current = score1000(latest);
  const level = levelFor(current);
  const target = nextLevel(level);
  const recent = history.slice(-6);
  const slope = monthlyTrend(recent);
  const eta = monthsTo(current, target.min, slope);
  const projectedNext = project(current, slope, 3);

  const now = today();
  const chart: TrendPoint[] = [
    ...recent.map((a, i) => ({ label: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', timeZone: APP_TZ }), value: score1000(a), ...(i === recent.length - 1 && { projected: current }) })),
    ...[1, 2, 3, 4, 5, 6].map((m) => ({ label: monthLabel(addMonths(now, m)), projected: project(current, slope, m) })),
  ];
  const milestones = [3, 6, 12].map((m) => {
    const s = project(current, slope, m);
    return { when: `+${m} months`, score: s, level: levelFor(s) };
  });

  return (
    <>
      {top}
      <ScreenScroll>
        <section aria-label="CEFR ladder" className="card mb-4 p-6">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <h2 className="card-title"><Icon name="layers" size={14} className="text-brand-bright" />CEFR Proficiency Ladder</h2>
            <div className="flex items-center gap-4">
              <span className="pill pill-brand"><Icon name="trending" size={12} />{eta === 0 ? `${level} reached` : eta ? `Projected ${target.level} in ${eta} month${eta === 1 ? '' : 's'}` : `${target.level} not projected at current pace`}</span>
              <Legend items={[{ label: 'Current', color: '#2dd4a7' }, { label: 'Next 3 months', color: '#3b82f6', dashed: true }]} />
            </div>
          </div>
          <div className="relative mx-2 h-[130px]">
            <div className="absolute inset-x-0 top-[54px] h-[22px] overflow-hidden rounded-xl border border-line bg-gradient-to-r from-[#1e2a44] to-[#233456]">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-positive-dim to-positive shadow-[0_0_20px_-2px_rgba(45,212,167,0.6)]" style={{ width: `${pct(current)}%` }} />
              {projectedNext > current && (
                <div className="absolute inset-y-0" style={{ left: `${pct(current)}%`, width: `${pct(projectedNext) - pct(current)}%`, background: 'repeating-linear-gradient(90deg, rgba(59,130,246,0.55) 0 7px, transparent 7px 14px)' }} />
              )}
            </div>
            {CEFR.map((c) => (
              <div key={c.level} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${pct(c.min)}%` }}>
                <div className={`mono mb-1.5 text-[11px] font-bold ${current >= c.min ? 'text-positive' : 'text-ink-3'}`}>{c.level}</div>
                <div className={`mx-auto h-3.5 w-0.5 ${current >= c.min ? 'bg-positive' : 'bg-line-strong'}`} />
                <div className="h-[42px]" />
                <div className="mono text-[9.5px] text-ink-3">{c.min}</div>
              </div>
            ))}
            <div className="absolute top-[18px] z-[5] -translate-x-1/2" style={{ left: `${pct(current)}%` }}>
              <div className="whitespace-nowrap rounded-[7px] bg-positive px-2.5 py-1 text-[11px] font-extrabold text-[#04231a] shadow-pos">
                {profile.role === 'student' ? 'YOU' : student.name.split(' ')[0]!.toUpperCase()} · {current}
              </div>
              <div className="mx-auto h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-positive" />
            </div>
          </div>
        </section>

        <div className="mb-4 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <section aria-label="Projected trajectory" className="card">
            <div className="card-h">
              <h2 className="card-title"><Icon name="trending" size={14} className="text-positive" />Projected Trajectory</h2>
              <span className="text-[11px] text-ink-3">{slope >= 0 ? '+' : ''}{Math.round(slope)} pts/month at current pace</span>
            </div>
            <div className="p-4">
              <TrendChart data={chart} height={190} name="Score" />
              <div className="mt-2 flex justify-center"><Legend items={[{ label: 'Measured', color: '#2dd4a7' }, { label: 'Projection', color: '#3b82f6', dashed: true }]} /></div>
              <div className="mt-3.5 grid grid-cols-3 gap-3">
                {milestones.map((m) => (
                  <div key={m.when} className="rounded-[10px] border border-line bg-input p-3.5">
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-ink-3">{m.when}</div>
                    <div className="mb-0.5 mt-1.5 flex items-baseline gap-2">
                      <span className="mono text-[22px] font-bold text-ink-hi">{m.score}</span>
                      <span className="pill px-2 py-0 text-[10px]">{m.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section aria-label="Exam equivalence" className="card">
            <div className="card-h"><h2 className="card-title"><Icon name="award" size={14} className="text-gold" />Exam Equivalence</h2><span className="text-[11px] text-ink-3">estimate</span></div>
            <ul className="px-4 pb-4 pt-2">
              {examEquivalents(current).map((e, i, all) => (
                <li key={e.name} className={`py-3.5 ${i < all.length - 1 ? 'border-b border-line' : ''}`}>
                  <div className="mb-2.5 flex items-baseline justify-between">
                    <span className="text-[13px] font-bold text-ink-hi">{e.name}</span>
                    <span className="flex items-baseline gap-1.5">
                      <span className="mono text-base font-bold text-ink-hi">{e.value}</span>
                      <span className="mono text-[11px] text-ink-3">/ {e.max}</span>
                      <span className="pill pill-brand ml-1 px-2 py-0 text-[9.5px]">{level}</span>
                    </span>
                  </div>
                  <ProgressTrack value={e.value} max={e.max} color="#e7b35c" height={6} label={`${e.name} estimate`} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-label="Distance to target by skill" className="card">
          <div className="card-h"><h2 className="card-title"><Icon name="target" size={14} className="text-brand-bright" />Distance to {target.level} Target by Skill</h2></div>
          <div className="grid gap-x-7 gap-y-5 p-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((s) => {
              const v = latest[s.key];
              const goal = Math.round(target.min / 10);
              return (
                <div key={s.key}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-[12.5px] font-semibold text-ink">{s.label}</span>
                    <span className="text-[11px] text-ink-3"><b className="mono text-ink-hi">{v}</b> → <span className="mono text-positive">{goal}</span></span>
                  </div>
                  <div className="relative">
                    <ProgressTrack value={v} color={v >= goal - 3 ? '#2dd4a7' : '#3b82f6'} label={`${s.label} toward ${goal}`} />
                    <div className="absolute -top-[3px] h-[13px] w-0.5 rounded-sm bg-positive" style={{ left: `${goal}%` }} aria-hidden="true" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </ScreenScroll>
    </>
  );
}
