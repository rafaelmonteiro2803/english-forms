import 'server-only';
import { monthRange } from '@/lib/dates';
import type { Supabase } from '@/lib/supabase/server';

/** Lessons marked done this month, per contract. Never stored: always counted from `lessons`. */
export async function lessonsUsedThisMonth(supabase: Supabase, contractIds: string[]): Promise<Map<string, number>> {
  const used = new Map<string, number>();
  if (!contractIds.length) return used;
  const { start, end } = monthRange();
  const { data, error } = await supabase
    .from('lessons')
    .select('contract_id')
    .eq('status', 'done')
    .in('contract_id', contractIds)
    .gte('starts_at', start.toISOString())
    .lt('starts_at', end.toISOString());
  if (error) throw error;
  for (const l of data) used.set(l.contract_id, (used.get(l.contract_id) ?? 0) + 1);
  return used;
}
