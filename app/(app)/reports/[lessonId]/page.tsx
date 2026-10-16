import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BarsChart } from '@/components/charts/BarsChart';
import { Gauge } from '@/components/charts/Gauge';
import { Heatmap } from '@/components/charts/Heatmap';
import { Legend } from '@/components/charts/Legend';
import { SkillRadar } from '@/components/charts/SkillRadar';
import { ScreenScroll, TopBar } from '@/components/shell/TopBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { isStaff, requireRole } from '@/lib/auth';
import { assessmentsOf } from '@/lib/data/student';
import { APP_TZ } from '@/lib/dates';
import { firstName, fmtDayTime } from '@/lib/format';
import { SKILLS, skillValues, type SkillKey } from '@/lib/scores';
import { createClient } from '@/lib/supabase/server';
import { param } from '@/lib/url';
import { AssessmentForm } from '../AssessmentForm';
import { PrintButton } from '../PrintButton';

export const metadata: Metadata = { title: 'Lesson Report' };

const FOCUS: Record<SkillKey, { t: string; mins: number; icon: IconName }> = {
  grammar: { t: 'Drill: accuracy under time pressure', mins: 15, icon: 'book' },
  vocabulary: { t: 'Vocabulary set: assertive business phrasing', mins: 10, icon: 'layers' },
  pronunciation: { t: 'Shadowing: two minutes of a business podcast a day', mins: 20, icon: 'volume' },
  fluency: { t: 'Timed speaking: two-minute answers without notes', mins: 15, icon: 'clock' },
  listening: { t: 'Note-taking from a recorded earnings call', mins: 20, icon: 'waveform' },
  confidence: { t: 'Record a three-minute status update and replay it', mins: 15, icon: 'mic' },
};

const colorFor = (v: number) => (v >= 85 ? '#2dd4a7' : v >= 75 ? '#3b82f6' : '#e7b35c');

type Props = { params: Promise<{ lessonId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ReportPage({ params, searchParams }: Props) {
  const profile = await requireRole();
  const { lessonId } = await params;
  const editing = param((await searchParams).edit) === '1' && isStaff(profile);
  const supabase = await createClient();

  const { data: lesson } = await supabase.from('lessons').select('*, contracts(plans(name, color))').eq('id', lessonId).maybeSingle();
  if (!lesson) notFound();
  const { data: student } = await supabase.from('students').select('id, name').eq('id', lesson.student_id).single();
  if (!student) notFound();

  const history = await assessmentsOf(supabase, student.id);
  const idx = history.findIndex((a) => a.lesson_id === lesson.id);
  const a = idx >= 0 ? history[idx] : undefined;
  const prev = idx > 0 ? history[idx - 1] : undefined;
  const plan = lesson.contracts?.plans;
  const crumb = `Insights · ${student.name}`;
  const sub = `${plan?.name ?? 'Lesson'} · ${fmtDayTime(lesson.starts_at)} · ${lesson.duration_min} min`;

  if (!a || editing) {
    return (
      <>
        <TopBar crumb={crumb} title="Lesson Intelligence Report" sub={sub} right={<Link href="/reports" className="btn-ghost">All reports</Link>} />
        <ScreenScroll>
          {isStaff(profile) && lesson.status === 'done' ? (
            <AssessmentForm lessonId={lesson.id} studentId={student.id} current={a} />
          ) : (
            <div className="card"><EmptyState icon="report" title={lesson.status === 'done' ? 'This lesson has not been scored yet' : 'This lesson has not happened yet'}>
              {lesson.status === 'done' ? 'Your teacher will add the scores soon.' : 'The report is available once the lesson is marked as done.'}
            </EmptyState></div>
          )}
        </ScreenScroll>
      </>
    );
  }

  const ranked = SKILLS.map((s) => ({ ...s, v: a[s.key], d: prev ? a[s.key] - prev[s.key] : 0 })).sort((x, y) => y.v - x.v);
  const strengths = ranked.slice(0, 3);
  const gaps = ranked.slice(-3).reverse();
  const recent = history.slice(Math.max(0, idx - 6), idx + 1);
  const delta = prev ? (a.overall ?? 0) - (prev.overall ?? 0) : 0;
  const sessionLabel = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: APP_TZ });

  return (
    <>
      <TopBar crumb={crumb} title="Lesson Intelligence Report" sub={sub}
        right={<>
          <PrintButton />
          {isStaff(profile) && <Link href={`/reports/${lesson.id}?edit=1`} className="btn-ghost"><Icon name="edit" size={14} className="text-ink-2" />Edit scores</Link>}
          <Link href="/reports" className="btn-ghost">All reports</Link>
        </>} />
      <ScreenScroll>
        <section aria-label="Executive summary" className="card grid-bg mb-4 grid items-center gap-6 p-[22px] lg:grid-cols-[170px_1fr_220px]"
          style={{ backgroundImage: 'radial-gradient(120% 130% at 0% 0%, rgba(45,212,167,0.1), transparent 55%)' }}>
          <div className="flex justify-center"><Gauge value={a.overall ?? 0} label="Overall" sub={prev ? `${delta >= 0 ? '+' : ''}${delta} vs last` : 'First assessment'} /></div>
          <div>
            {prev && delta !== 0 && (
              <div className={`pill mb-2.5 ${delta > 0 ? 'pill-pos' : 'pill-neg'}`}><Icon name={delta > 0 ? 'trending' : 'arrowDown'} size={12} />{delta > 0 ? 'Improving' : 'Below last lesson'}</div>
            )}
            <h2 className="mb-2 text-[19px] font-extrabold tracking-tight text-ink-hi">Executive Summary</h2>
            <p className="max-w-[560px] text-[13.5px] leading-relaxed text-ink">
              {firstName(student.name)} was strongest in <b className="text-ink-hi">{strengths[0]!.label.toLowerCase()}</b> and <b className="text-ink-hi">{strengths[1]!.label.toLowerCase()}</b>.
              The main opportunity is <b className="text-warning">{gaps[0]!.label.toLowerCase()}</b>
              {gaps[0]!.d < 0 ? `, which dropped ${-gaps[0]!.d} points since the last lesson` : ''}.
            </p>
            {a.notes && <p className="mt-3 max-w-[560px] border-l-2 border-line-accent pl-3 text-[13px] italic leading-relaxed text-ink-2">“{a.notes}”</p>}
          </div>
          <dl className="flex flex-col gap-2.5">
            {([['Service', plan?.name ?? '—', 'file'], ['Duration', `${lesson.duration_min} min`, 'clock'], ['Session', `#${idx + 1}`, 'report']] as const).map(([k, v, ic]) => (
              <div key={k} className="flex items-center gap-2.5 rounded-[9px] border border-line bg-input px-3 py-2">
                <Icon name={ic} size={15} className="text-ink-3" />
                <dt className="flex-1 text-[11.5px] text-ink-2">{k}</dt>
                <dd className="mono text-[13px] font-bold text-ink-hi">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-label="Dimension scores" className="card mb-4">
          <div className="card-h"><h2 className="card-title"><Icon name="grid" size={14} className="text-brand-bright" />Dimension Scores</h2><span className="text-[11px] text-ink-3">6 skills</span></div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((s) => (
              <div key={s.key} className="rounded-[10px] border border-line bg-input p-3.5">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-ink">{s.label}</span>
                  <span className="mono text-[19px] font-bold text-ink-hi">{a[s.key]}</span>
                </div>
                <ProgressTrack value={a[s.key]} color={colorFor(a[s.key])} height={5} label={`${s.label} score`} />
              </div>
            ))}
          </div>
        </section>

        <div className="mb-4 grid gap-4 lg:grid-cols-3">
          <section aria-label="Competency radar" className="card">
            <div className="card-h"><h2 className="card-title"><Icon name="target" size={14} className="text-brand-bright" />Competency Radar</h2></div>
            <div className="px-3 pb-3">
              <SkillRadar axes={SKILLS.map((s) => s.label)} height={230}
                series={[...(prev ? [{ name: 'Previous', values: skillValues(prev), color: '#7a87a1' }] : []), { name: 'This lesson', values: skillValues(a), color: '#2dd4a7' }]} />
              {prev && <div className="flex justify-center"><Legend items={[{ label: 'This lesson', color: '#2dd4a7' }, { label: 'Previous', color: '#7a87a1' }]} /></div>}
            </div>
          </section>
          <section aria-label="Score history" className="card">
            <div className="card-h"><h2 className="card-title"><Icon name="trending" size={14} className="text-positive" />Score History</h2></div>
            <div className="p-4">
              <BarsChart data={recent.map((r) => ({ label: sessionLabel(r.created_at), value: r.overall ?? 0 }))} max={100} name="Overall" height={170} />
              <div className="mt-2.5 flex justify-between text-[11px] text-ink-3">
                <span>{recent.length} sessions</span>
                {recent.length > 1 && <span className="mono font-semibold text-ink-2">{(a.overall ?? 0) - (recent[0]!.overall ?? 0) >= 0 ? '+' : ''}{(a.overall ?? 0) - (recent[0]!.overall ?? 0)} pts</span>}
              </div>
            </div>
          </section>
          <section aria-label="Skill heatmap" className="card">
            <div className="card-h"><h2 className="card-title"><Icon name="grid" size={14} className="text-gold" />Skill Heatmap</h2></div>
            <div className="p-4">
              <Heatmap caption="Score by skill over the last sessions" rows={SKILLS.map((s) => s.label)} cols={recent.map((r) => sessionLabel(r.created_at))}
                values={SKILLS.map((s) => recent.map((r) => r[s.key]))} min={Math.min(...recent.flatMap((r) => skillValues(r)))} max={100} />
            </div>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SkillList title="Top Strengths" icon="award" color="#2dd4a7" items={strengths} />
          <SkillList title="Improvement Areas" icon="target" color="#f5b942" items={gaps} />
          <section aria-label="Suggested practice" className="card">
            <div className="card-h"><h2 className="card-title"><Icon name="zap" size={14} className="text-brand-bright" />Suggested Practice</h2></div>
            <ul className="p-2.5">
              {gaps.map((g, i) => {
                const f = FOCUS[g.key];
                return (
                  <li key={g.key} className={`flex items-center gap-3 px-2 py-3 ${i < gaps.length - 1 ? 'border-b border-line' : ''}`}>
                    <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-elevated"><Icon name={f.icon} size={16} className="text-brand-bright" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold text-ink-hi">{f.t}</span>
                      <span className="block text-[10.5px] text-ink-3">{g.label} · {f.mins} min</span>
                    </span>
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

function SkillList({ title, icon, color, items }: { title: string; icon: IconName; color: string; items: { key: string; label: string; v: number; d: number }[] }) {
  return (
    <section aria-label={title} className="card">
      <div className="card-h"><h2 className="card-title"><Icon name={icon} size={14} />{title}</h2></div>
      <ol className="p-2.5">
        {items.map((it, i) => (
          <li key={it.key} className={`flex items-center gap-3 px-2 py-2.5 ${i < items.length - 1 ? 'border-b border-line' : ''}`}>
            <span className="mono flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md text-[11px] font-bold" style={{ background: color + '1f', color }}>{i + 1}</span>
            <span className="flex-1 text-[12.5px] font-semibold text-ink-hi">{it.label}</span>
            {it.d !== 0 && <span className={`mono text-[11px] ${it.d > 0 ? 'text-positive' : 'text-risk'}`}>{it.d > 0 ? '+' : ''}{it.d}</span>}
            <span className="mono w-8 text-right text-xs font-bold text-ink-hi">{it.v}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
