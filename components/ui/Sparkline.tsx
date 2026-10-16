export function Sparkline({ data, width = 140, height = 26, color = '#2dd4a7' }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), span = Math.max(...data) - min || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * width, height - 2 - ((d - min) / span) * (height - 4)] as const);
  const last = pts[pts.length - 1]!;
  return (
    <svg width={width} height={height} className="block overflow-visible" aria-hidden="true">
      <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill={color} />
    </svg>
  );
}
