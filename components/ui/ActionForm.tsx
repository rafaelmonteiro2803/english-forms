'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import type { FormState } from '@/lib/validation/form';
import { showToast } from './Toast';

/** When an action returns done(): show its message and go to its path (or refresh in place). */
export function useActionDone(state: FormState) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const current = search ? `${pathname}?${search}` : pathname;
  const d = state.done;

  useEffect(() => {
    if (!d) return;
    showToast(d.message, d.tone);
    if (d.path === current) router.refresh();
    else router.replace(d.path, { scroll: false });
    // only react to a new result, not to URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d?.at]);
}

type Props = Omit<React.FormHTMLAttributes<HTMLFormElement>, 'action'> & {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
};

/** A form for one-click server actions (pause, cancel, sync…). */
export function ActionForm({ action, children, ...rest }: Props) {
  const [state, formAction] = useActionState(action, {});
  useActionDone(state);
  return <form action={formAction} {...rest}>{children}</form>;
}
