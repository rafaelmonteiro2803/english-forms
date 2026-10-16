'use client';

import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { updatePassword } from './actions';

export function ResetForm() {
  const [state, action] = useActionState(updatePassword, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field label="New password" error={state.fieldErrors?.password}>
        {(p) => <input className="input" type="password" name="password" autoComplete="new-password" {...p} />}
      </Field>
      <Field label="Repeat password" error={state.fieldErrors?.confirm}>
        {(p) => <input className="input" type="password" name="confirm" autoComplete="new-password" {...p} />}
      </Field>
      {state.error && !state.fieldErrors && <p role="alert" className="text-[12.5px] text-risk">{state.error}</p>}
      <SubmitButton className="btn-primary h-11 w-full">Save password</SubmitButton>
    </form>
  );
}
