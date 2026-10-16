'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef } from 'react';
import { Icon } from './Icon';

type Props = {
  title: string;
  sub?: string;
  /** URL to go back to when the dialog closes (modals are driven by search params). */
  closeHref: string;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Modal({ title, sub, closeHref, width = 520, children, footer }: Props) {
  const router = useRouter();
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') router.push(closeHref, { scroll: false }); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [closeHref, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <Link href={closeHref} scroll={false} aria-label="Close" tabIndex={-1} className="absolute inset-0 bg-[rgba(4,6,12,0.72)] backdrop-blur-sm" />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="card relative flex max-h-[90vh] w-full animate-fade-up flex-col bg-panel" style={{ maxWidth: width }}>
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          <div className="flex-1">
            <h2 id={titleId} className="text-base font-bold text-ink-hi">{title}</h2>
            {sub && <p className="mt-0.5 text-xs text-ink-3">{sub}</p>}
          </div>
          <Link href={closeHref} scroll={false} data-close className="icon-btn h-[30px] w-[30px] text-ink-2" aria-label="Close dialog">
            <Icon name="x" size={15} />
          </Link>
        </div>
        <div className="flex flex-col gap-3.5 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}
