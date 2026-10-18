'use client';

import Link from 'next/link';
import { useActionDone } from '@/components/ui/ActionForm';
import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { CEFR_LEVELS } from '@/lib/validation/student';
import type { Student } from '@/types/database';
import { saveStudent } from './actions';

type Props = {
  student?: Student;
  closeHref: string;
  today: string;
  /** shown to admins, who pick the teacher for a new student */
  teachers?: { id: string; name: string }[];
};

export function StudentForm({ student, closeHref, today, teachers }: Props) {
  const [state, action, isPending] = useActionState(saveStudent, {});
  useActionDone(state);
  const e = state.fieldErrors ?? {};
  const s = student;
  // after a failed submit, show what was typed instead of the saved values
  const v = (name: keyof Student & string, fallback = '') => state.values ? state.values[name] ?? '' : String(s?.[name] ?? fallback);
  const formId = 'student-form';

  return (
    <Modal title={s ? `Edit ${s.name}` : 'New student'} sub={s ? 'Registration data' : 'Core registration data. Services can be added next.'}
      closeHref={closeHref} width={580}
      footer={<>
        <Link href={closeHref} scroll={false} className="btn-ghost">Cancel</Link>
        <SubmitButton form={formId} pending={isPending}><Icon name="check" size={15} />{s ? 'Save changes' : 'Create student'}</SubmitButton>
      </>}>
      <form id={formId} action={action} noValidate className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {s && <input type="hidden" name="id" value={s.id} />}
        <Field label="Full name *" error={e.name} span>
          {(p) => <input className="input" name="name" defaultValue={v('name')} placeholder="e.g. Juliana Martins" autoComplete="off" {...p} />}
        </Field>
        <Field label="Work email *" error={e.email}>
          {(p) => <input className="input" type="email" name="email" defaultValue={v('email')} placeholder="name@company.com" {...p} />}
        </Field>
        <Field label="WhatsApp *" error={e.whatsapp} hint="Country + area code">
          {(p) => <input className="input mono" type="tel" name="whatsapp" defaultValue={v('whatsapp', '+55 ')} {...p} />}
        </Field>
        <Field label="Company" error={e.company}>
          {(p) => <input className="input" name="company" defaultValue={v('company')} {...p} />}
        </Field>
        <Field label="Role" error={e.role_title}>
          {(p) => <input className="input" name="role_title" defaultValue={v('role_title')} {...p} />}
        </Field>
        <Field label="CEFR level" error={e.cefr_level}>
          {(p) => (
            <select className="input" name="cefr_level" defaultValue={v('cefr_level', 'B1')} {...p}>
              {CEFR_LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          )}
        </Field>
        <Field label="Start date" error={e.start_date}>
          {(p) => <input className="input" type="date" name="start_date" defaultValue={v('start_date', today)} {...p} />}
        </Field>
        <Field label="City" error={e.city}>
          {(p) => <input className="input" name="city" defaultValue={v('city')} {...p} />}
        </Field>
        <Field label="LinkedIn profile URL" error={e.linkedin_url} hint="Name and photo sync when the student signs in with LinkedIn">
          {(p) => <input className="input" name="linkedin_url" defaultValue={v('linkedin_url')} placeholder="linkedin.com/in/…" {...p} />}
        </Field>
        {s && (
          <Field label="Status" error={e.status}>
            {(p) => (
              <select className="input" name="status" defaultValue={v('status')} {...p}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            )}
          </Field>
        )}
        {teachers && (
          <Field label="Teacher *" hint={s ? 'Changing it moves this student’s lessons too.' : undefined}>
            {(p) => (
              <select className="input" name="teacher_id" defaultValue={v('teacher_id')} {...p}>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
          </Field>
        )}
        <Field label="Notes" error={e.notes} span>
          {(p) => <textarea className="input h-20 py-2" name="notes" defaultValue={v('notes')} {...p} />}
        </Field>
        {state.error && <p role="alert" className="col-span-full text-[12.5px] text-risk">{state.error}</p>}
      </form>
    </Modal>
  );
}
