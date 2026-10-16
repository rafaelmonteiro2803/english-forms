'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { sendPasswordReset, signIn } from './actions';

const inputCls = 'input h-11 rounded-[10px] pl-10 text-[13.5px]';

function IconInput({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: 'mail' | 'lock' }) {
  return (
    <div className="relative">
      <Icon name={icon} size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
      <input className={inputCls} {...props} />
    </div>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field label="Work email" error={state.fieldErrors?.email}>
        {(p) => <IconInput icon="mail" type="email" name="email" autoComplete="email" required defaultValue={state.values?.email} {...p} />}
      </Field>
      <Field label="Password" error={state.fieldErrors?.password}>
        {(p) => <IconInput icon="lock" type="password" name="password" autoComplete="current-password" required {...p} />}
      </Field>
      <div className="-mt-1 flex justify-end">
        <Link href="/login?forgot=1" className="text-xs font-semibold text-brand-bright hover:underline">Forgot password?</Link>
      </div>
      {state.error && <p role="alert" className="text-[12.5px] text-risk">{state.error}</p>}
      <SubmitButton className="btn-primary h-[46px] w-full rounded-[10px] text-sm" pendingLabel="Signing in…">
        Sign in to terminal <Icon name="arrowR" size={16} />
      </SubmitButton>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(sendPasswordReset, {});
  if (state.ok) {
    return (
      <div role="status" className="rounded-[10px] border border-positive/30 bg-positive/10 p-4 text-[13px] text-ink">
        If that email has an account, a reset link is on its way. <Link href="/login" className="font-semibold text-brand-bright">Back to sign in</Link>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field label="Work email" error={state.fieldErrors?.email}>
        {(p) => <IconInput icon="mail" type="email" name="email" autoComplete="email" required {...p} />}
      </Field>
      <SubmitButton className="btn-primary h-[46px] w-full rounded-[10px] text-sm" pendingLabel="Sending…">Send reset link</SubmitButton>
      <Link href="/login" className="text-center text-xs font-semibold text-brand-bright hover:underline">Back to sign in</Link>
    </form>
  );
}
