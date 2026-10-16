'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Icon } from './Icon';

/** Shows the `?toast=` message set by a server action redirect, then clears it. */
export function Toast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const msg = params.get('toast');
  const isError = params.get('tone') === 'error';

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(params);
      next.delete('toast');
      next.delete('tone');
      router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false });
    }, 3200);
    return () => clearTimeout(t);
  }, [msg, params, pathname, router]);

  if (!msg) return null;
  return (
    <div role="status" aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 animate-fade-up items-center gap-2.5 rounded-[10px] border bg-elevated px-4 py-3 text-[13px] text-ink-hi shadow-[0_12px_30px_-10px_rgba(0,0,0,0.8)] ${isError ? 'border-risk/40' : 'border-positive/35'}`}>
      <Icon name={isError ? 'alert' : 'checkCircle'} size={16} className={isError ? 'text-risk' : 'text-positive'} />
      {msg}
    </div>
  );
}
