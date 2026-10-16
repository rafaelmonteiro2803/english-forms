import { Icon } from './Icon';
import { Sparkline } from './Sparkline';

type Props = {
  label: string; value: React.ReactNode; unit?: string; delta?: string; deltaUp?: boolean;
  spark?: number[]; sparkColor?: string; accent?: string;
};

export function MetricTile({ label, value, unit, delta, deltaUp = true, spark, sparkColor, accent }: Props) {
  return (
    <div className="card flex min-w-0 animate-fade-up flex-col gap-2.5 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-2">{label}</span>
        {delta && (
          <span className={`pill px-1.5 py-px text-[10.5px] ${deltaUp ? 'pill-pos' : 'pill-neg'}`}>
            <Icon name={deltaUp ? 'arrowUp' : 'arrowDown'} size={11} />{delta}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="mono text-[26px] font-bold leading-none" style={{ color: accent ?? '#eef2fb' }}>{value}</span>
        {unit && <span className="mono text-[13px] text-ink-3">{unit}</span>}
      </div>
      {spark && <Sparkline data={spark} color={sparkColor} />}
    </div>
  );
}
