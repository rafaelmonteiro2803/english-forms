import { APP_TZ } from '@/lib/dates';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const fmtMoney = (cents: number) => brl.format(Math.round(cents / 100)).replace(/ /g, ' ');

/** "2026-10-12" → "Oct 12, 2026" */
export const fmtDate = (day: string) =>
  new Date(day + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/** minutes after midnight → "09:30" */
export const fmtClock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: APP_TZ });

export const fmtDayTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: APP_TZ });

/** "3 hours ago", "Yesterday", "Oct 4" */
export function fmtRelative(iso: string, now = new Date()) {
  const diffMin = Math.round((now.getTime() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffMin < 24 * 60) return `${Math.round(diffMin / 60)} h ago`;
  if (diffMin < 48 * 60) return 'Yesterday';
  if (diffMin < 14 * 24 * 60) return `${Math.round(diffMin / 1440)} days ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: APP_TZ });
}

export const firstName = (name: string) => name.split(' ')[0] ?? name;
