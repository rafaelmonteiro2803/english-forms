'use client';

import Link from 'next/link';
import { useActionDone } from '@/components/ui/ActionForm';
import { useActionState, useState } from 'react';
import { GCalMark } from '@/components/ui/Brand';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { fmtClock } from '@/lib/format';
import { DAY_END_MIN, DAY_START_MIN, DURATIONS } from '@/lib/validation/lesson';
import { saveLesson } from './actions';

export type ContractOption = { id: string; planName: string; color: string; left: number };

type Props = {
  students: { id: string; name: string; company: string | null }[];
  contractsByStudent: Record<string, ContractOption[]>;
  initial: { id?: string; student_id?: string; contract_id?: string; day: string; start_min: number; duration_min: number };
  link?: { google_event_id: string; summary: string };
  googleEmail?: string | null;
  addMeet?: boolean;
  closeHref: string;
};

const TIMES = Array.from({ length: (DAY_END_MIN - DAY_START_MIN) / 15 }, (_, i) => DAY_START_MIN + i * 15);

export function LessonForm({ students, contractsByStudent, initial, link, googleEmail, addMeet, closeHref }: Props) {
  const [state, action] = useActionState(saveLesson, {});
  useActionDone(state);
  const v = state.values;
  const e = state.fieldErrors ?? {};
  const [studentId, setStudentId] = useState(v?.student_id ?? initial.student_id ?? students[0]?.id ?? '');
  const options = contractsByStudent[studentId] ?? [];
  const [picked, setPicked] = useState(v?.contract_id ?? initial.contract_id ?? '');
  const contractId = options.some((o) => o.id === picked) ? picked : options[0]?.id ?? '';
  const formId = 'lesson-form';
  const title = initial.id ? 'Edit lesson' : link ? 'Link Google event' : 'New lesson';

  return (
    <Modal title={title} sub={link ? `“${link.summary}”` : 'Every lesson is tied to a student and an active service'} closeHref={closeHref}
      footer={<>
        <Link href={closeHref} scroll={false} className="btn-ghost">Cancel</Link>
        <SubmitButton form={formId} disabled={!contractId}><Icon name="check" size={15} />{initial.id ? 'Save lesson' : link ? 'Link event' : googleEmail ? 'Create & sync' : 'Create lesson'}</SubmitButton>
      </>}>
      <form id={formId} action={action} noValidate className="flex flex-col gap-3.5">
        {initial.id && <input type="hidden" name="id" value={initial.id} />}
        {link && <input type="hidden" name="google_event_id" value={link.google_event_id} />}
        <input type="hidden" name="back" value={closeHref} />
        <Field label="Student" error={e.student_id}>
          {(p) => (
            <select className="input" name="student_id" value={studentId} onChange={(ev) => { setStudentId(ev.target.value); setPicked(''); }} {...p}>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}{s.company ? ` · ${s.company}` : ''}</option>)}
            </select>
          )}
        </Field>
        <fieldset>
          <legend className="mb-1.5 text-[11px] font-semibold tracking-[0.02em] text-ink-2">Active service</legend>
          <input type="hidden" name="contract_id" value={contractId} />
          {options.length ? (
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Active service">
              {options.map((o) => {
                const on = o.id === contractId;
                return (
                  <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => setPicked(o.id)}
                    className="flex items-center gap-2.5 rounded-[9px] border px-3 py-2.5 text-left"
                    style={{ background: on ? o.color + '1a' : '#0b1120', borderColor: on ? o.color : 'rgba(255,255,255,0.07)' }}>
                    <span className="h-2 w-2 rounded-sm" style={{ background: o.color }} />
                    <span className="flex-1 text-[12.5px] font-semibold text-ink-hi">{o.planName}</span>
                    <span className={`mono text-[11px] ${o.left <= 1 ? 'text-warning' : 'text-ink-3'}`}>{o.left} left this month</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="rounded-[9px] border border-warning/30 bg-warning/[0.07] px-3 py-2.5 text-xs text-warning">
              This student has no active service. <Link href={`/management/services?new=1&student=${studentId}`} className="font-semibold underline">Create a contract first.</Link>
            </p>
          )}
          {e.contract_id && <p className="mt-1.5 text-[11px] text-risk">{e.contract_id[0]}</p>}
        </fieldset>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.3fr_1fr_1fr]">
          <Field label="Day" error={e.day}>
            {(p) => <input className="input" type="date" name="day" defaultValue={v?.day ?? initial.day} {...p} />}
          </Field>
          <Field label="Start" error={e.start_min}>
            {(p) => (
              <select className="input mono" name="start_min" defaultValue={v?.start_min ?? initial.start_min} {...p}>
                {TIMES.map((t) => <option key={t} value={t}>{fmtClock(t)}</option>)}
              </select>
            )}
          </Field>
          <Field label="Duration" error={e.duration_min}>
            {(p) => (
              <select className="input" name="duration_min" defaultValue={v?.duration_min ?? initial.duration_min} {...p}>
                {DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
              </select>
            )}
          </Field>
        </div>
        {googleEmail ? (
          <p className="flex items-center gap-2 text-[11.5px] text-ink-3"><GCalMark size={14} />Invite sent from {googleEmail}{addMeet ? ' with a Google Meet link' : ''}</p>
        ) : (
          <p className="text-[11.5px] text-ink-3">Google Calendar is not connected, so no invite will be sent.</p>
        )}
        {state.error && !e.contract_id && <p role="alert" className="text-[12.5px] text-risk">{state.error}</p>}
      </form>
    </Modal>
  );
}
