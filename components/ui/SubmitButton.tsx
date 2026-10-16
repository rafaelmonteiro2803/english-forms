'use client';

import { useFormStatus } from 'react-dom';

/** Submit button that disables itself and shows progress while its form is pending. */
export function SubmitButton({ children, className = 'btn-primary', pendingLabel, disabled, ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} aria-busy={pending} {...rest}>
      {pending ? (pendingLabel ?? 'Saving…') : children}
    </button>
  );
}
