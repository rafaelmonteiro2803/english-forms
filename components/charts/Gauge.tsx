/** Circular score gauge (server-rendered SVG). */
export function Gauge({ value, max = 100, size = 150, stroke = 11, color = '#2dd4a7', label, sub }: {
  value: number; max?: number; size?: number; stroke?: number; color?: string; label?: string; sub?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, value / max));
  const id = `gauge-${size}-${color.slice(1)}`;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label ?? 'Score'}: ${value} of ${max}`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={color} /><stop offset="100%" stopColor="#60a5fa" /></linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - frac)} style={{ filter: `drop-shadow(0 0 6px ${color}66)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="mono font-bold leading-none text-ink-hi" style={{ fontSize: size * 0.27 }}>{value}</div>
        {label && <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-2">{label}</div>}
        {sub && <div className="mt-0.5 text-[10px] text-ink-3">{sub}</div>}
      </div>
    </div>
  );
}
