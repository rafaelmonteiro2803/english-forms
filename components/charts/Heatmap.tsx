// Single-hue sequential heatmap (dark → brand blue), with a scale legend.
const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
const LOW = [19, 28, 48];   // #131c30
const HIGH = [96, 165, 250]; // #60a5fa

export function heatColor(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return `rgb(${lerp(LOW[0]!, HIGH[0]!, x)},${lerp(LOW[1]!, HIGH[1]!, x)},${lerp(LOW[2]!, HIGH[2]!, x)})`;
}

type Props = { rows: string[]; cols: string[]; values: (number | null)[][]; min: number; max: number; format?: (v: number) => string; caption: string };

export function Heatmap({ rows, cols, values, min, max, format = String, caption }: Props) {
  const t = (v: number) => (v - min) / (max - min || 1);
  return (
    <figure>
      <table className="w-full table-fixed border-separate border-spacing-1">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th className="w-20" />
            {cols.map((c) => <th key={c} scope="col" className="mono text-center text-[9.5px] font-normal text-ink-3">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r}>
              <th scope="row" className="truncate text-left text-[11px] font-semibold text-ink-2">{r}</th>
              {cols.map((c, ci) => {
                const v = values[ri]?.[ci];
                return (
                  <td key={c} title={v == null ? `${r} · ${c}: no data` : `${r} · ${c}: ${format(v)}`}
                    className="h-[26px] rounded border border-black/30" style={{ background: v == null ? 'transparent' : heatColor(t(v)) }}>
                    <span className="sr-only">{v == null ? 'no data' : format(v)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="mt-2.5 flex items-center gap-2 text-[10.5px] text-ink-3">
        <span className="mono">{format(min)}</span>
        <span className="h-1.5 w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${heatColor(0)}, ${heatColor(1)})` }} />
        <span className="mono">{format(max)}</span>
      </figcaption>
    </figure>
  );
}
