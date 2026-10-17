'use client';

import { useFormStatus } from 'react-dom';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
  /**
   * Pass useActionState's isPending when the button sits outside its <form>
   * (form="…" in a dialog footer): useFormStatus only sees the enclosing form.
   */
  pending?: boolean;
};

/** Submit button that disables itself while its form is being sent, so a double click can't submit twice. */
export function SubmitButton({ children, className = 'btn-primary', pendingLabel, disabled, pending: pendingProp, ...rest }: Props) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button type="submit" className={className} disabled={pending || disabled} aria-busy={pending} {...rest}>
      {pending ? (pendingLabel ?? 'Saving…') : children}
    </button>
  );
}
