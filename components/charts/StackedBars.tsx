'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, GRID, TOOLTIP } from './theme';

type Series = { key: string; name: string; color: string };

/** Bars stacked per category (e.g. realized + scheduled per month). Values in reais. */
export function StackedBars({ data, series, height = 220, money }: {
  data: Record<string, string | number>[]; series: Series[]; height?: number; money?: boolean;
}) {
  const fmt = (v: number) => (money ? `R$ ${Math.round(v).toLocaleString('pt-BR')}` : String(v));
  return (
    <div style={{ height }} role="img" aria-label={`Stacked bars: ${series.map((s) => s.name).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }} barCategoryGap="24%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => (money ? `${Math.round(v / 1000)}k` : String(v))} />
          <Tooltip {...TOOLTIP} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(v) => fmt(Number(v))} />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={s.color} isAnimationActive={false}
              radius={i === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} stroke="#0e1422" strokeWidth={1} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
