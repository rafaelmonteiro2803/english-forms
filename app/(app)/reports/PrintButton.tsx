'use client';

import { Icon } from '@/components/ui/Icon';

export function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="btn-ghost"><Icon name="download" size={15} className="text-ink-2" />PDF</button>;
}
