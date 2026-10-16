import type { Metadata } from 'next';
import Link from 'next/link';
import { StudentPicker } from '@/components/shell/StudentPicker';
import { ScreenScroll, TopBar } from '@/components/shell/TopBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { requireRole } from '@/lib/auth';
import { resolveStudent } from '@/lib/data/student';
import { fmtDayTime } from '@/lib/format';
import { createClient } from '@/lib/supabase/server';
import { param } from '@/lib/url';

export const metadata: Metadata = { title: 'Lesson Reports' };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ReportsPage({ searchParams }: { searchParams: SP }) {
  const profile = await requireRole();
  const supabase = await createClient();
  const { student, options } = await resolveStudent(supabase, profile, param((await searchParams).student));

  const { data: lessons } = student
    ? await supabase.from('lessons').select('id, starts_at, duration_min, contract_id, contracts(plans(name, color)), assessments(overall)')
        .eq('student_id', student.id).eq('status', 'done').order('starts_at', { ascending: false }).limit(50)
    : { data: [] };

  return (
    <>
      <TopBar crumb="Insights" title="Lesson Reports" sub={student?.name}
        right={student && <StudentPicker options={options} value={student.id} />} />
      <ScreenScroll>
        <section className="card" aria-label="Finished lessons">
          <div className="card-h"><h2 className="card-title"><Icon name="report" size={14} className="text-brand-bright" />Finished lessons</h2></div>
          <ul>
            {(lessons ?? []).map((l) => {
              const plan = l.contracts?.plans;
              const overall = l.assessments?.overall;
              return (
                <li key={l.id} className="border-b border-line last:border-0">
                  <Link href={`/reports/${l.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02]">
                    <span className="h-2 w-2 rounded-sm" style={{ background: plan?.color }} />
                    <span className="flex-1 text-[12.5px] font-semibold text-ink-hi">{plan?.name ?? 'Lesson'}</span>
                    <span className="mono w-40 text-[11.5px] text-ink-2">{fmtDayTime(l.starts_at)}</span>
                    <span className="w-28 text-right">
                      {overall == null
                        ? <span className="pill pill-warn px-2 py-px text-[10px]">{profile.role === 'student' ? 'Pending' : 'Needs score'}</span>
                        : <span className={`mono text-[15px] font-bold ${overall >= 85 ? 'text-positive' : 'text-gold'}`}>{overall}</span>}
                    </span>
                    <Icon name="chevR" size={15} className="text-ink-3" />
                  </Link>
                </li>
              );
            })}
          </ul>
          {!lessons?.length && <EmptyState icon="report" title="No finished lessons yet">Reports appear after a lesson is marked as done.</EmptyState>}
        </section>
      </ScreenScroll>
    </>
  );
}
