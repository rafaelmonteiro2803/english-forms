'use client';

import { Icon } from '@/components/ui/Icon';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div role="alert" className="card grid-bg flex max-w-md flex-col items-center gap-3 p-10 text-center">
        <Icon name="alert" size={30} className="text-risk" />
        <h1 className="text-base font-bold text-ink-hi">Something went wrong</h1>
        <p className="text-[13px] text-ink-2">We could not load this screen. Try again, and if it keeps failing, contact support{error.digest ? ` with code ${error.digest}` : ''}.</p>
        <button onClick={reset} className="btn-primary mt-2">Try again</button>
      </div>
    </div>
  );
}
