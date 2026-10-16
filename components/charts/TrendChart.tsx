'use client';

import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, GRID, TOOLTIP } from './theme';

export type TrendPoint = { label: string; value?: number; projected?: number };

type Props = { data: TrendPoint[]; color?: string; height?: number; name?: string; domain?: [number | 'auto', number | 'auto'] };

/** One measured series over time, with an optional dashed projection. */
export function TrendChart({ data, color = '#2dd4a7', height = 200, name = 'Score', domain = ['auto', 'auto'] }: Props) {
  const id = `fill-${color.slice(1)}`;
  return (
    <div style={{ height }} role="img" aria-label={`${name} trend chart`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} domain={domain} width={48} />
          <Tooltip {...TOOLTIP} />
          <Area type="monotone" dataKey="value" name={name} stroke={color} strokeWidth={2} fill={`url(#${id})`}
            dot={{ r: 3, fill: '#0a0e1a', stroke: color, strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls isAnimationActive={false} />
          <Line type="monotone" dataKey="projected" name="Projection" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5"
            dot={false} activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
