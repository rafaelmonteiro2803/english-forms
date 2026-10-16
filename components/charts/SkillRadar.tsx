'use client';

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { TOOLTIP } from './theme';

type Series = { name: string; values: number[]; color: string };

export function SkillRadar({ axes, series, height = 250 }: { axes: string[]; series: Series[]; height?: number }) {
  const data = axes.map((axis, i) => Object.fromEntries([['axis', axis], ...series.map((s) => [s.name, s.values[i] ?? 0])]));
  return (
    <div style={{ height }} role="img" aria-label={`Skill radar: ${series.map((s) => s.name).join(' vs ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.07)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#8b98b0', fontSize: 10.5, fontWeight: 600 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip {...TOOLTIP} />
          {series.map((s, i) => (
            <Radar key={s.name} name={s.name} dataKey={s.name} stroke={s.color} strokeWidth={2}
              fill={s.color} fillOpacity={i === series.length - 1 ? 0.18 : 0.06} isAnimationActive={false} />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
