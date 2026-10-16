'use client';

import { useEffect, useState } from 'react';
import { Icon } from './Icon';

type ToastMsg = { id: number; message: string; tone: 'ok' | 'error' };

// A tiny global toast queue: showToast() can be called from any client component.
let listener: ((t: ToastMsg) => void) | null = null;
let nextId = 1;

export function showToast(message: string, tone: 'ok' | 'error' = 'ok') {
  listener?.({ id: nextId++, message, tone });
}

/** Mounted once in the app layout. Also shows `?toast=` set by route-handler redirects (e.g. Google connect). */
export function Toaster() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  useEffect(() => {
    listener = (t) => {
      setToasts((list) => [...list.slice(-2), t]);
      setTimeout(() => setToasts((list) => list.filter((x) => x.id !== t.id)), 3200);
    };
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get('toast');
    if (fromUrl) {
      showToast(fromUrl, url.searchParams.get('tone') === 'error' ? 'error' : 'ok');
      url.searchParams.delete('toast');
      url.searchParams.delete('tone');
      window.history.replaceState(window.history.state, '', url);
    }
    return () => { listener = null; };
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div key={t.id} role="status"
          className={`flex animate-fade-up items-center gap-2.5 rounded-[10px] border bg-elevated px-4 py-3 text-[13px] text-ink-hi shadow-[0_12px_30px_-10px_rgba(0,0,0,0.8)] ${t.tone === 'error' ? 'border-risk/40' : 'border-positive/35'}`}>
          <Icon name={t.tone === 'error' ? 'alert' : 'checkCircle'} size={16} className={t.tone === 'error' ? 'text-risk' : 'text-positive'} />
          {t.message}
        </div>
      ))}
    </div>
  );
}
