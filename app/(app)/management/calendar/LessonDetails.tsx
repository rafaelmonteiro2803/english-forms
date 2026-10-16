import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { GCalMark } from '@/components/ui/Brand';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { StatusPill } from '@/components/ui/StatusPill';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { fmtDayTime, fmtTime, firstName } from '@/lib/format';
import type { Contract, Lesson, Plan, Student } from '@/types/database';
import { setLessonStatus } from './actions';

type Props = {
  lesson: Lesson;
  student: Pick<Student, 'id' | 'name' | 'role_title' | 'company' | 'whatsapp'>;
  contract: Contract;
  plan: Plan;
  used: number;
  googleEmail: string | null;
  closeHref: string;
  editHref: string;
};

const STATUS_LABEL = { scheduled: 'Scheduled', done: 'Done', cancelled: 'Cancelled' } as const;

export function LessonDetails({ lesson: l, student: s, contract: c, plan: p, used, googleEmail, closeHref, editHref }: Props) {
  const end = new Date(Date.parse(l.starts_at) + l.duration_min * 60000).toISOString();
  const when = `${fmtDayTime(l.starts_at)}–${fmtTime(end)}`;
  const started = Date.parse(l.starts_at) <= Date.now();
  const statusForm = (status: 'done' | 'cancelled' | 'scheduled', label: string, cls: string) => (
    <form action={setLessonStatus}>
      <input type="hidden" name="id" value={l.id} /><input type="hidden" name="status" value={status} /><input type="hidden" name="back" value={closeHref} />
      <SubmitButton className={cls} pendingLabel="…">{label}</SubmitButton>
    </form>
  );

  return (
    <Modal title={p.name} sub={`${when} · ${STATUS_LABEL[l.status]}`} closeHref={closeHref} width={480}
      footer={<>
        {l.status === 'scheduled' && <span className="mr-auto">{statusForm('cancelled', 'Cancel lesson', 'btn-danger')}</span>}
        {l.status === 'cancelled' && <span className="mr-auto">{statusForm('scheduled', 'Restore', 'btn-ghost')}</span>}
        <Link href={`/management/students?id=${s.id}`} className="btn-ghost">Open student</Link>
        {l.status === 'scheduled' && <Link href={editHref} scroll={false} className="btn-ghost"><Icon name="edit" size={14} />Edit</Link>}
        {l.status === 'scheduled' && started && statusForm('done', 'Mark as done', 'btn-primary')}
        {l.status === 'done' && <Link href={`/reports/${l.id}`} className="btn-primary"><Icon name="report" size={15} />Lesson report</Link>}
      </>}>
      <div className="flex items-center gap-3">
        <Avatar name={s.name} size={42} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-ink-hi">{s.name}</div>
          <div className="text-[11.5px] text-ink-3">{[s.role_title, s.company].filter(Boolean).join(' · ')}</div>
        </div>
        <WhatsAppButton phone={s.whatsapp} small message={`Hi ${firstName(s.name)}, reminder: our lesson is ${when}.${l.meet_url ? ` Link: ${l.meet_url}` : ''}`} />
      </div>
      <div className="rounded-[10px] border border-line bg-input p-3.5">
        <div className="mb-2 flex justify-between">
          <span className="flex items-center gap-2 text-xs text-ink"><span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />{p.name}</span>
          <StatusPill status={c.status} />
        </div>
        <ProgressTrack value={used} max={c.lessons_per_month} color={p.color} height={5} glow={false} label="Lessons used this month" />
        <div className="mt-1.5 text-[11px] text-ink-3">{used} of {c.lessons_per_month} lessons used · {Math.max(0, c.lessons_per_month - used)} remaining this month</div>
      </div>
      <div className="flex flex-col gap-2 text-xs text-ink-2">
        {l.meet_url && (
          <a href={l.meet_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
            <Icon name="video" size={14} className="text-ink-3" /><span className="mono text-brand-bright">{l.meet_url.replace(/^https:\/\//, '')}</span>
          </a>
        )}
        <span className="flex items-center gap-2"><GCalMark size={14} />{l.google_event_id && googleEmail ? `Synced to ${googleEmail}` : 'Not on Google Calendar'}</span>
      </div>
    </Modal>
  );
}
