'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useActionDone } from '@/components/ui/ActionForm';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { saveTeacher } from './actions';

export function TeacherForm({ teacher, closeHref }: { teacher?: { id: string; name: string; email: string }; closeHref: string }) {
  const [state, action, isPending] = useActionState(saveTeacher, {});
  useActionDone(state);
  const v = state.values;
  const e = state.fieldErrors ?? {};
  const t = teacher;
  const formId = 'teacher-form';
  return (
    <Modal title={t ? `Edit ${t.name}` : 'New teacher'} closeHref={closeHref}
      sub={t ? 'Login details. Leave the password blank to keep it.' : 'Creates the login. Share the email and initial password with the teacher.'}
      footer={<>
        <Link href={closeHref} scroll={false} className="btn-ghost">Cancel</Link>
        <SubmitButton form={formId} pending={isPending}><Icon name="check" size={15} />{t ? 'Save changes' : 'Create teacher'}</SubmitButton>
      </>}>
      <form id={formId} action={action} noValidate className="flex flex-col gap-3.5">
        {t && <input type="hidden" name="id" value={t.id} />}
        <Field label="Full name *" error={e.name}>
          {(p) => <input className="input" name="name" defaultValue={v?.name ?? t?.name} autoComplete="off" {...p} />}
        </Field>
        <Field label="Email *" error={e.email} hint={t ? 'Changing it changes the login email.' : 'If this person already signed in once (e.g. with Google), they become a teacher.'}>
          {(p) => <input className="input" type="email" name="email" defaultValue={v?.email ?? t?.email} autoComplete="off" {...p} />}
        </Field>
        <Field label={t ? 'New password' : 'Initial password *'} error={e.password} hint="At least 8 characters. The teacher can change it with “Forgot password?”.">
          {(p) => <input className="input" type="password" name="password" autoComplete="new-password" {...p} />}
        </Field>
        {state.error && <p role="alert" className="text-[12.5px] text-risk">{state.error}</p>}
      </form>
    </Modal>
  );
}
