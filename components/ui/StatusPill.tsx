import type { ContractStatus, StudentStatus } from '@/types/database';

const STYLES: Record<ContractStatus | StudentStatus, [string, string]> = {
  active: ['pill-pos', 'Active'],
  paused: ['', 'Paused'],
  ending: ['pill-warn', 'Renewal due'],
};

export function StatusPill({ status }: { status: ContractStatus | StudentStatus }) {
  const [cls, label] = STYLES[status];
  return <span className={`pill px-2 py-px text-[10px] ${cls}`}>{label}</span>;
}
