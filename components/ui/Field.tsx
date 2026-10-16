import { useId } from 'react';

type Props = {
  label: string;
  error?: string[] | string;
  hint?: string;
  span?: boolean;
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => React.ReactNode;
};

/** Label + control + hint/error, wired up for screen readers. */
export function Field({ label, error, hint, span, children }: Props) {
  const id = useId();
  const msg = Array.isArray(error) ? error[0] : error;
  const descId = msg || hint ? `${id}-desc` : undefined;
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${span ? 'col-span-full' : ''}`}>
      <label htmlFor={id} className="text-[11px] font-semibold tracking-[0.02em] text-ink-2">{label}</label>
      {children({ id, 'aria-invalid': msg ? true : undefined, 'aria-describedby': descId })}
      {msg ? (
        <span id={descId} className="text-[11px] text-risk">{msg}</span>
      ) : hint ? (
        <span id={descId} className="text-[10.5px] text-ink-3">{hint}</span>
      ) : null}
    </div>
  );
}
