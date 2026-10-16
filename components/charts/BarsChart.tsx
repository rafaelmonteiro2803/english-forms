'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, GRID, TOOLTIP } from './theme';

/** One series of bars (one color for every bar). */
export function BarsChart({ data, color = '#3b82f6', height = 160, name = 'Value', max, unit }: {
  data: { label: string; value: number }[]; color?: string; height?: number; name?: string; max?: number; unit?: string;
}) {
  return (
    <div style={{ height }} role="img" aria-label={`${name} bar chart`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -18 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} domain={[0, max ?? 'auto']} width={48} unit={unit} />
          <Tooltip {...TOOLTIP} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="value" name={name} fill={color} radius={[4, 4, 0, 0]} isAnimationActive={false} unit={unit} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
