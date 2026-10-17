'use client';

import { SubmitButton } from './SubmitButton';

/** A submit button that asks for confirmation first (for destructive actions). */
export function ConfirmButton({ confirm: question, ...props }: React.ComponentProps<typeof SubmitButton> & { confirm: string }) {
  return <SubmitButton {...props} onClick={(e) => { if (!window.confirm(question)) e.preventDefault(); }} />;
}
