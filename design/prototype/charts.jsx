/* ============================================================
   English Forms — animated SVG chart library
   exposes: LineChart, RadarChart, BarsChart, Heatmap,
            Gauge, Sparkline, Donut, ProgressTrack
   ============================================================ */
const { useState, useEffect, useRef, useMemo } = React;

function useMounted(delay = 60) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), delay); return () => clearTimeout(t); }, []);
  return on;
}

function useCountUp(target, dur = 1100, deps = []) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setV(target * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // fallback: guarantee final value even if rAF is throttled (background tab)
    const safety = setTimeout(() => setV(target), dur + 250);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
  }, deps.length ? deps : [target]);
  return v;
}

/* ---------- Line / area chart ---------- */
function LineChart({ data, width = 600, height = 200, color = 'var(--brand)', fill = true, pad = 8, showDots = false, glow = true }) {
  const mounted = useMounted();
  const pathRef = useRef(null);
  const [len, setLen] = useState(0);
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const innerW = width - pad * 2, innerH = height - pad * 2;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * innerW;
    const y = pad + innerH - ((d - min) / span) * innerH;
    return [x, y];
  });
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const area = line + ` L${pad + innerW},${pad + innerH} L${pad},${pad + innerH} Z`;
  const uid = useMemo(() => 'ln' + Math.random().toString(36).slice(2, 8), []);

  useEffect(() => { if (pathRef.current) setLen(pathRef.current.getTotalLength()); }, [data]);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={uid + 'f'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        {glow && <filter id={uid + 'g'} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="3.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>}
      </defs>
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={pad} x2={width - pad} y1={pad + innerH * g} y2={pad + innerH * g}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {fill && <path d={area} fill={`url(#${uid}f)`} opacity={mounted ? 1 : 0} style={{ transition: 'opacity 1.1s ease 0.3s' }} />}
      <path ref={pathRef} d={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
        filter={glow ? `url(#${uid}g)` : undefined}
        style={{ strokeDasharray: len, strokeDashoffset: mounted ? 0 : len, transition: 'stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)' }} />
      {showDots && pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--bg-deep)" stroke={color} strokeWidth="2"
          opacity={mounted ? 1 : 0} style={{ transition: `opacity .4s ease ${0.6 + i * 0.04}s` }} />
      ))}
    </svg>
  );
}

/* ---------- Radar chart ---------- */
function RadarChart({ axes, series, size = 260, max = 100 }) {
  const mounted = useMounted();
  const cx = size / 2, cy = size / 2, R = size / 2 - 34;
  const n = axes.length;
  const ang = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, r) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r];
  const polyFor = (vals) => vals.map((v, i) => pt(i, (v / max) * R)).map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon key={g} points={axes.map((_, i) => pt(i, R * g)).map((p) => p.join(',')).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      {axes.map((_, i) => { const p = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="rgba(255,255,255,0.06)" />; })}
      {series.map((s, si) => (
        <polygon key={si} points={polyFor(s.values)} fill={s.fill || 'rgba(59,130,246,0.16)'} stroke={s.color}
          strokeWidth="2" strokeLinejoin="round"
          style={{ transformOrigin: `${cx}px ${cy}px`, transform: mounted ? 'scale(1)' : 'scale(0.05)', opacity: mounted ? 1 : 0, transition: `transform 1s cubic-bezier(.34,1.3,.5,1) ${si * 0.12}s, opacity .6s ${si * 0.12}s` }} />
      ))}
      {axes.map((a, i) => {
        const p = pt(i, R + 18);
        const anchor = Math.abs(p[0] - cx) < 8 ? 'middle' : p[0] > cx ? 'start' : 'end';
        return <text key={i} x={p[0]} y={p[1]} textAnchor={anchor} dominantBaseline="middle"
          fontSize="10.5" fontWeight="600" fill="var(--text-2)" style={{ letterSpacing: '0.03em' }}>{a}</text>;
      })}
    </svg>
  );
}

/* ---------- Animated bars ---------- */
function BarsChart({ data, height = 180, color = 'var(--brand)', max, labels, gradientTo }) {
  const mounted = useMounted();
  const hi = max || Math.max(...data);
  const uid = useMemo(() => 'br' + Math.random().toString(36).slice(2, 7), []);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%', borderRadius: '4px 4px 2px 2px',
            height: mounted ? `${(d / hi) * 100}%` : '0%',
            background: gradientTo ? `linear-gradient(180deg, ${color}, ${gradientTo})` : color,
            transition: `height .9s cubic-bezier(.34,1.1,.5,1) ${i * 0.05}s`,
            boxShadow: `0 0 12px -4px ${color}`
          }} />
          {labels && <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

/* ---------- Heatmap ---------- */
function Heatmap({ rows, cols, values, colorStops }) {
  const mounted = useMounted();
  const stops = colorStops || ['#0e1422', '#1d4ed8', '#3b82f6', '#2dd4a7'];
  const lerp = (a, b, t) => a + (b - a) * t;
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const colorAt = (v) => {
    const t = Math.max(0, Math.min(1, v));
    const seg = t * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(seg));
    const f = seg - i; const a = hex(stops[i]), b = hex(stops[i + 1]);
    return `rgb(${lerp(a[0], b[0], f) | 0},${lerp(a[1], b[1], f) | 0},${lerp(a[2], b[2], f) | 0})`;
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `64px repeat(${cols.length}, 1fr)`, gap: 4, alignItems: 'center' }}>
      <div />
      {cols.map((c, i) => <div key={i} className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', textAlign: 'center' }}>{c}</div>)}
      {rows.map((r, ri) => (
        <React.Fragment key={ri}>
          <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r}</div>
          {cols.map((_, ci) => {
            const v = values[ri][ci];
            return <div key={ci} title={`${r} · ${cols[ci]}: ${Math.round(v * 100)}`} style={{
              height: 26, borderRadius: 4, background: colorAt(v),
              border: '1px solid rgba(0,0,0,0.3)',
              opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'scale(0.6)',
              transition: `all .5s ease ${(ri * cols.length + ci) * 0.012}s`
            }} />;
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- Circular gauge (big score) ---------- */
function Gauge({ value, max = 100, size = 150, stroke = 11, color = 'var(--positive)', label, sub }) {
  const v = useCountUp(value, 1300);
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const frac = Math.min(1, v / max);
  const uid = useMemo(() => 'gg' + Math.random().toString(36).slice(2, 7), []);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} /><stop offset="100%" stopColor="var(--brand-bright)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${uid})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - frac)} style={{ filter: `drop-shadow(0 0 6px ${color}66)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mono" style={{ fontSize: size * 0.27, fontWeight: 700, color: 'var(--text-hi)', lineHeight: 1 }}>{Math.round(v)}</div>
        {label && <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>}
        {sub && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ---------- Sparkline ---------- */
function Sparkline({ data, width = 92, height = 30, color = 'var(--positive)' }) {
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * width, height - ((d - min) / span) * height]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.4" fill={color} />
    </svg>
  );
}

/* ---------- Donut ---------- */
function Donut({ segments, size = 130, stroke = 16 }) {
  const mounted = useMounted();
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      {segments.map((s, i) => {
        const frac = s.value / total; const dash = C * frac;
        const off = C * (acc / total); acc += s.value;
        return <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${mounted ? dash : 0} ${C}`} strokeDashoffset={-off}
          style={{ transition: `stroke-dasharray .9s cubic-bezier(.4,0,.2,1) ${i * 0.12}s` }} />;
      })}
    </svg>
  );
}

/* ---------- Horizontal progress track ---------- */
function ProgressTrack({ value, max = 100, color = 'var(--brand)', height = 7, showGlow = true }) {
  const mounted = useMounted();
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 999, width: mounted ? `${(value / max) * 100}%` : '0%',
        background: `linear-gradient(90deg, ${color}, var(--brand-bright))`,
        boxShadow: showGlow ? `0 0 10px -2px ${color}` : 'none',
        transition: 'width 1s cubic-bezier(.4,0,.2,1)'
      }} />
    </div>
  );
}

Object.assign(window, { useMounted, useCountUp, LineChart, RadarChart, BarsChart, Heatmap, Gauge, Sparkline, Donut, ProgressTrack });
