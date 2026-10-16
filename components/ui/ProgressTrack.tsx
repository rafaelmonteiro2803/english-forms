export function ProgressTrack({ value, max = 100, color = '#3b82f6', height = 7, glow = true, label }: {
  value: number; max?: number; color?: string; height?: number; glow?: boolean; label?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="overflow-hidden rounded-full bg-white/[0.06]" style={{ height }}
      role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div className="h-full rounded-full transition-[width] duration-1000"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, #60a5fa)`, boxShadow: glow ? `0 0 10px -2px ${color}` : undefined }} />
    </div>
  );
}
