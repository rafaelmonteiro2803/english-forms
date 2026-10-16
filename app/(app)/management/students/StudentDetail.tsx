import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { LinkedInMark } from '@/components/ui/Brand';
import { Icon } from '@/components/ui/Icon';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { StatusPill } from '@/components/ui/StatusPill';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { fmtDate, fmtDayTime, fmtMoney, fmtRelative, firstName } from '@/lib/format';
import type { Contract, Plan, Student } from '@/types/database';
import { setStudentStatus, syncStudentLinkedIn } from './actions';

type Props = {
  student: Student;
  avatarUrl: string | null;
  contracts: (Contract & { plan: Plan; used: number })[];
  upcoming: { id: string; starts_at: string; plan: Plan }[];
  editHref: string;
};

export function StudentDetail({ student: s, avatarUrl, contracts, upcoming, editHref }: Props) {
  return (
    <section aria-label={`${s.name} profile`} className="card lg:sticky lg:top-0">
      <div className="border-b border-line p-[18px]">
        <div className="mb-3.5 flex items-center gap-3.5">
          <Avatar name={s.name} src={avatarUrl} size={52} />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-ink-hi">{s.name}</h2>
            <div className="mt-0.5 text-xs text-ink-2">{[s.role_title, s.company].filter(Boolean).join(' · ') || '—'}</div>
            <div className="mt-2 flex gap-1.5"><StatusPill status={s.status} /><span className="pill pill-brand px-2 py-px text-[10px]">Level {s.cefr_level}</span></div>
          </div>
          <Link href={editHref} scroll={false} className="icon-btn text-ink-2" aria-label={`Edit ${s.name}`}><Icon name="edit" size={15} /></Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <WhatsAppButton phone={s.whatsapp} message={`Hi ${firstName(s.name)}, `} label="WhatsApp" />
          <a href={`mailto:${s.email}`} className="btn-ghost"><Icon name="mail" size={14} className="text-ink-2" />Email</a>
          {s.status === 'active' && (
            <Link href={`/management/calendar?new=1&student=${s.id}`} className="btn-ghost"><Icon name="calendar" size={14} className="text-ink-2" />Schedule</Link>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line p-[18px]">
        {[['WhatsApp', s.whatsapp ?? '—', true], ['Email', s.email], ['City', s.city ?? '—'], ['Student since', fmtDate(s.start_date)]].map(([k, v, mono]) => (
          <div key={String(k)} className="min-w-0">
            <dt className="mb-0.5 text-[10.5px] text-ink-3">{k}</dt>
            <dd className={`truncate text-[12.5px] text-ink-hi ${mono ? 'mono' : ''}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="border-b border-line p-[18px]">
        <h3 className="label-caps mb-2.5 flex items-center gap-2"><LinkedInMark size={15} />LinkedIn profile</h3>
        {s.linkedin_url ? (
          <>
            {s.linkedin_headline && <p className="text-[12.5px] leading-snug text-ink-hi">{s.linkedin_headline}</p>}
            <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-brand-bright hover:underline">
              <Icon name="link" size={12} />{s.linkedin_url.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          </>
        ) : (
          <p className="text-xs leading-normal text-ink-2">No LinkedIn URL yet. Add it in <Link href={editHref} scroll={false} className="text-brand-bright">Edit</Link>; name and photo sync when the student signs in with LinkedIn.</p>
        )}
        <form action={syncStudentLinkedIn} className="mt-3 flex items-center justify-between gap-2">
          <input type="hidden" name="id" value={s.id} />
          <span className="text-[11px] text-ink-3">{s.linkedin_synced_at ? `Last synced: ${fmtRelative(s.linkedin_synced_at)}` : 'Not synced yet'}</span>
          <SubmitButton className="btn-seg gap-1.5" pendingLabel="Syncing…" disabled={!s.profile_id}
            title={s.profile_id ? undefined : 'Available after the student signs in'}>
            <Icon name="refresh" size={12} />Sync now
          </SubmitButton>
        </form>
      </div>

      <div className="border-b border-line p-[18px]">
        <h3 className="label-caps mb-2.5 flex justify-between">
          Contracted services
          <Link href={`/management/services?student=${s.id}`} className="text-[11px] font-semibold normal-case tracking-normal text-brand-bright">Manage</Link>
        </h3>
        <ul className="flex flex-col gap-3">
          {contracts.map((c) => (
            <li key={c.id}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-hi">
                  <span className="h-2 w-2 rounded-sm" style={{ background: c.plan.color }} />{c.plan.name}
                </span>
                <span className="mono text-[11.5px] text-ink-2">{fmtMoney(c.price_cents)}/mo</span>
              </div>
              <ProgressTrack value={c.used} max={c.lessons_per_month} color={c.plan.color} height={5} glow={false} label={`${c.plan.name} lessons used`} />
              <div className="mt-1.5 flex justify-between text-[10.5px] text-ink-3">
                <span>{c.used} of {c.lessons_per_month} lessons this month</span><StatusPill status={c.status} />
              </div>
            </li>
          ))}
          {contracts.length === 0 && (
            <li className="text-xs text-ink-3">
              No services yet. <Link href={`/management/services?new=1&student=${s.id}`} className="font-semibold text-brand-bright">Create a contract</Link>
            </li>
          )}
        </ul>
      </div>

      <div className="border-b border-line p-[18px]">
        <h3 className="label-caps mb-2.5">Next lessons</h3>
        {upcoming.length ? (
          <ul>
            {upcoming.map((l) => (
              <li key={l.id} className="flex items-center gap-2.5 py-1.5">
                <span className="mono w-[130px] text-[11px] text-ink-2">{fmtDayTime(l.starts_at)}</span>
                <span className="flex-1 text-xs text-ink">{l.plan.name}</span>
                <span className="h-2 w-2 rounded-sm" style={{ background: l.plan.color }} />
              </li>
            ))}
          </ul>
        ) : <p className="text-xs text-ink-3">Nothing scheduled.</p>}
      </div>

      <form action={setStudentStatus} className="flex items-center justify-between gap-2 p-[18px]">
        <input type="hidden" name="id" value={s.id} />
        <input type="hidden" name="status" value={s.status === 'active' ? 'paused' : 'active'} />
        <span className="text-[11px] text-ink-3">{s.status === 'active' ? 'Pausing hides the student from scheduling.' : 'This student is paused.'}</span>
        <SubmitButton className="btn-seg" pendingLabel="…">{s.status === 'active' ? 'Pause student' : 'Reactivate'}</SubmitButton>
      </form>
    </section>
  );
}
