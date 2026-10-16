// Dates are stored as UTC instants and shown in the school's time zone.
// Calendar days are plain "YYYY-MM-DD" strings.

export const APP_TZ = process.env.NEXT_PUBLIC_APP_TIMEZONE ?? 'America/Sao_Paulo';

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TZ, hourCycle: 'h23',
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short',
});

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Local calendar parts of an instant: day, minutes after midnight and weekday (0 = Monday). */
export function zonedParts(date: Date) {
  const p = Object.fromEntries(partsFormatter.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    day: `${p.year}-${p.month}-${p.day}`,
    minutes: Number(p.hour) * 60 + Number(p.minute),
    weekday: WEEKDAYS.indexOf(p.weekday ?? ''),
    offsetMin: (Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second)) - Math.floor(date.getTime() / 1000) * 1000) / 60000,
  };
}

/** The instant of a local day + minutes after midnight. */
export function zonedTime(day: string, minutes: number): Date {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  const guess = new Date(Date.UTC(y, m - 1, d, 0, minutes));
  const first = new Date(guess.getTime() - zonedParts(guess).offsetMin * 60000);
  // second pass handles days where the offset changes (DST)
  return new Date(guess.getTime() - zonedParts(first).offsetMin * 60000);
}

export const today = () => zonedParts(new Date()).day;

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function addMonths(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1 + n, d)).toISOString().slice(0, 10);
}

/** Monday of the week containing `day`. */
export function weekStart(day: string): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  const weekday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  return addDays(day, -weekday);
}

export const isDay = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

/** Start and end instants of the local month containing `day` (default: now). */
export function monthRange(day = today()) {
  const first = day.slice(0, 8) + '01';
  return { start: zonedTime(first, 0), end: zonedTime(addMonths(first, 1), 0) };
}
