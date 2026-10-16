import type { Metadata } from 'next';
import Link from 'next/link';
import { Gauge } from '@/components/charts/Gauge';
import { Legend } from '@/components/charts/Legend';
import { SkillRadar } from '@/components/charts/SkillRadar';
import { TrendChart } from '@/components/charts/TrendChart';
import { StudentPicker } from '@/components/shell/StudentPicker';
import { ScreenScroll, TopBar } from '@/components/shell/TopBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { requireRole } from '@/lib/auth';
import { assessmentsOf, resolveStudent } from '@/lib/data/student';
import { lessonsUsedThisMonth } from '@/lib/data/usage';
import { APP_TZ, monthRange } from '@/lib/dates';
import { aiLabsEnabled } from '@/lib/flags';
import { fmtDayTime, fmtRelative } from '@/lib/format';
import { assessmentBefore, nextLevel, score1000, SKILLS, skillValues } from '@/lib/scores';
import { createClient } from '@/lib/supabase/server';
import { param, withParams } from '@/lib/url';
import type { CefrLevel } from '@/types/database';

export const metadata: Metadata = { title: 'Dashboard' };

const RANGES = { '12M': 12, '6M': 6, '3M': 3 } as const;
const monthLabel = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', timeZone: APP_TZ });

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function DashboardPage({ searchParams }: { searchParams: SP }) {
  const profile = await requireRole();
  const sp = await searchParams;
  const supabase = await createClient();
  const { student, options } = await resolveStudent(supabase, profile, param(sp.student));

  if (!student) {
    return (
      <>
        <TopBar crumb="Learn" title="Performance Dashboard" />
        <ScreenScroll>
          <div className="card"><EmptyState icon="dashboard" title={profile.role === 'student' ? 'Your student profile is not set up yet' : 'No students yet'}>
            {profile.role === 'student' ? 'Ask your teacher to register you with this email address.' : <Link href="/management/students?new=1" className="font-semibold text-brand-bright">Add a student</Link>}
          </EmptyState></div>
        </ScreenScroll>
      </>
    );
  }

  const range = (param(sp.range) ?? '12M') as keyof typeof RANGES;
  const months = RANGES[range] ?? 12;
  const { start: monthStart } = monthRange();
  const [history, { data: contracts }, { data: plans }, { data: upcoming }, { data: recent }, { count: lessonsThisMonth }] = await Promise.all([
    assessmentsOf(supabase, student.id),
    supabase.from('contracts').select('*').eq('student_id', student.id).neq('status', 'paused'),
    supabase.from('plans').select('*'),
    supabase.from('lessons').select('id, starts_at, contract_id, meet_url').eq('student_id', student.id).eq('status', 'scheduled')
      .gte('starts_at', new Date().toISOString()).order('starts_at').limit(3),
    supabase.from('lessons').select('id, starts_at, contract_id, assessments(overall)').eq('student_id', student.id).eq('status', 'done')
      .order('starts_at', { ascending: false }).limit(3),
    supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('student_id', student.id).eq('status', 'done').gte('starts_at', monthStart.toISOString()),
  ]);
  const used = await lessonsUsedThisMonth(supabase, (contracts ?? []).map((c) => c.id));
  const planById = new Map((plans ?? []).map((p) => [p.id, p]));
  const planOf = (contractId: string) => planById.get((contracts ?? []).find((c) => c.id === contractId)?.plan_id ?? '');

  const latest = history.at(-1);
  const previous = history.at(-2);
  const past = assessmentBefore(history, 90);
  const score = score1000(latest);
  const target = nextLevel(student.cefr_level as CefrLevel);
  const since = Date.now() - months * 30.44 * 86400000;
  const trend = history.filter((a) => Date.parse(a.created_at) >= since).map((a) => ({ label: monthLabel(a.created_at), value: score1000(a) }));
  const sub = options.length ? `${student.name} · ${[student.role_title, student.company].filter(Boolean).join(' · ')}` : [student.role_title, student.company].filter(Boolean).join(' · ');

  return (
    <>
      <TopBar crumb="Learn" title="Performance Dashboard" sub={sub}
        right={<>
          <StudentPicker options={options} value={student.id} />
          {aiLabsEnabled() && <Link href="/labs/simulator" className="btn-primary"><Icon name="mic" size={15} />New Simulation</Link>}
        </>} />
      <ScreenScroll>
        {!latest ? (
          <div className="card mb-4"><EmptyState icon="target" title="No assessments yet">Scores appear here after the first assessed lesson.</EmptyState></div>
        ) : (
          <>
            <div className="mb-4 grid gap-4 xl:grid-cols-[360px_1fr]">
              <div className="card grid-bg flex items-center gap-5 p-5" style={{ backgroundImage: 'radial-gradient(120% 100% at 0% 0%, rgba(45,212,167,0.1), transparent 60%)' }}>
                <Gauge value={score} max={1000} size={132} label="of 1000" />
                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-2">English Performance</div>
                  <div className="mt-1 text-[11px] text-ink-3">Score · {fmtRelative(latest.created_at).toLowerCase()}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="pill pill-brand whitespace-nowrap">Level {student.cefr_level}</span>
                    <Icon name="arrowR" size={13} className="text-ink-3" />
                    <span className="pill border-positive/30 text-positive">{target.level}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-2">
                    <Icon name="flame" size={14} className="text-warning" /><b className="mono text-ink-hi">{lessonsThisMonth ?? 0}</b> lessons this month
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {SKILLS.map((s) => {
                  const v = latest[s.key];
                  const d = previous ? v - previous[s.key] : 0;
                  return (
                    <div key={s.key} className="card flex flex-col justify-between p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-ink-2">{s.label}</span>
                        {previous && <span className={`pill px-1.5 py-0 text-[10px] ${d > 0 ? 'pill-pos' : d < 0 ? 'pill-neg' : ''}`}>{d > 0 ? '+' : ''}{d}</span>}
                      </div>
                      <div className="my-2 flex items-baseline gap-0.5">
                        <span className="mono text-[26px] font-bold text-ink-hi">{v}</span><span className="mono text-xs text-ink-3">%</span>
                      </div>
                      <ProgressTrack value={v} color={s.color} label={`${s.label} score`} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              <section className="card" aria-label="Performance trend">
                <div className="card-h">
                  <h2 className="card-title"><Icon name="trending" size={14} className="text-positive" />Performance · Trailing {months} Months</h2>
                  <div className="flex gap-1.5">
                    {Object.keys(RANGES).map((r) => (
                      <Link key={r} href={withParams('/dashboard', { student: options.length ? student.id : undefined, range: r === '12M' ? undefined : r })} scroll={false}
                        aria-current={r === range ? 'true' : undefined} className={`btn-seg ${r === range ? 'btn-seg-on' : ''}`}>{r}</Link>
                    ))}
                  </div>
                </div>
                <div className="px-3 pb-2 pt-4"><TrendChart data={trend} name="Score" height={210} /></div>
              </section>
              <section className="card" aria-label="Competency radar">
                <div className="card-h"><h2 className="card-title"><Icon name="target" size={14} className="text-brand-bright" />Competency Radar</h2><span className="pill text-[10px]">vs 3mo ago</span></div>
                <div className="px-4 pb-3">
                  <SkillRadar axes={SKILLS.map((s) => s.label)} series={[
                    { name: '3 months ago', values: skillValues(past!), color: '#7a87a1' },
                    { name: 'Now', values: skillValues(latest), color: '#3b82f6' },
                  ]} />
                  <div className="flex justify-center"><Legend items={[{ label: 'Now', color: '#3b82f6' }, { label: '3 months ago', color: '#7a87a1' }]} /></div>
                </div>
              </section>
            </div>
          </>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="card" aria-label="Upcoming lessons">
            <div className="card-h"><h2 className="card-title"><Icon name="video" size={14} className="text-brand-bright" />Upcoming Lessons</h2></div>
            <ul className="p-2">
              {(upcoming ?? []).map((l) => {
                const p = planOf(l.contract_id);
                return (
                  <li key={l.id} className="flex items-center gap-3 rounded-[8px] px-2 py-2.5">
                    <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-elevated"><Icon name="video" size={16} className="text-brand" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold text-ink-hi">{p?.name ?? 'Lesson'}</span>
                      <span className="block text-[11px] text-ink-3">{fmtDayTime(l.starts_at)}</span>
                    </span>
                    {l.meet_url && <a href={l.meet_url} target="_blank" rel="noopener noreferrer" className="btn-seg">Join</a>}
                  </li>
                );
              })}
              {!upcoming?.length && <li className="px-2 py-4 text-xs text-ink-3">Nothing scheduled yet.</li>}
            </ul>
          </section>
          <section className="card" aria-label="Recent lessons">
            <div className="card-h"><h2 className="card-title"><Icon name="report" size={14} className="text-positive" />Recent Lessons</h2></div>
            <ul className="p-2">
              {(recent ?? []).map((l) => {
                const overall = l.assessments?.overall;
                return (
                  <li key={l.id}>
                    <Link href={`/reports/${l.id}`} className="flex items-center gap-3 rounded-[8px] px-2 py-2.5 hover:bg-white/[0.03]">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-semibold text-ink-hi">{planOf(l.contract_id)?.name ?? 'Lesson'}</span>
                        <span className="block text-[11px] text-ink-3">{fmtRelative(l.starts_at)}</span>
                      </span>
                      <span className="text-right">
                        <span className={`mono block text-[17px] font-bold ${overall == null ? 'text-ink-3' : overall >= 85 ? 'text-positive' : 'text-gold'}`}>{overall ?? '—'}</span>
                        <span className="text-[9.5px] text-ink-3">score</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
              {!recent?.length && <li className="px-2 py-4 text-xs text-ink-3">No finished lessons yet.</li>}
            </ul>
          </section>
          <section className="card" aria-label="Services this month">
            <div className="card-h"><h2 className="card-title"><Icon name="target" size={14} className="text-gold" />Services This Month</h2></div>
            <ul className="flex flex-col gap-4 px-4 py-3">
              {(contracts ?? []).map((c) => {
                const p = planById.get(c.plan_id);
                const u = used.get(c.id) ?? 0;
                return (
                  <li key={c.id}>
                    <div className="mb-1.5 flex justify-between"><span className="text-xs font-medium text-ink">{p?.name}</span><span className="mono text-xs font-semibold text-ink-2">{u}/{c.lessons_per_month}</span></div>
                    <ProgressTrack value={u} max={c.lessons_per_month} color={p?.color} label={`${p?.name} lessons used`} />
                  </li>
                );
              })}
              {!contracts?.length && <li className="py-1 text-xs text-ink-3">No active services.</li>}
            </ul>
          </section>
        </div>
      </ScreenScroll>
    </>
  );
}
