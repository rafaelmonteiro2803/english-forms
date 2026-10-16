/* ============================================================
   English Forms — shared UI: Icon, Sidebar, TopBar, Avatar, etc.
   ============================================================ */

/* Lucide-style line icons (24 grid, stroke) */
const ICONS = {
  dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3',
  video: 'M23 7l-7 5 7 5V7zM1 5h15v14H1z',
  report: 'M9 17V9M13 17V5M17 17v-6M3 3v18h18',
  trending: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  building: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9v.01M9 12v.01M9 15v.01M9 18v.01',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  chevR: 'M9 18l6-6-6-6', chevL: 'M15 18l-6-6 6-6', chevD: 'M6 9l6 6 6-6', chevU: 'M18 15l-6-6-6 6',
  arrowUp: 'M12 19V5M5 12l7-7 7 7', arrowDown: 'M12 5v14M5 12l7 7 7-7',
  arrowR: 'M5 12h14M12 5l7 7-7 7',
  mute: 'M1 1l22 22M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 19v3',
  camOff: 'M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10M1 1l22 22',
  phone: 'M16 2v4M8 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  hangup: 'M23 12a11 11 0 0 0-22 0M1 12l3.5 3.5a2 2 0 0 0 2.8 0l1.4-1.4a1 1 0 0 1 1.4 0l2.8 0a1 1 0 0 1 1.4 0l1.4 1.4a2 2 0 0 0 2.8 0L23 12',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  check: 'M20 6L9 17l-5-5', checkCircle: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3',
  alert: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  x: 'M18 6L6 18M6 6l12 12', plus: 'M12 5v14M5 12h14',
  play: 'M5 3l14 9-14 9V3z', pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z',
  award: 'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12',
  flame: 'M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 .5-2S6 11 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12z',
  volume: 'M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  dollar: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  layers: 'M12 2l10 5-10 5L2 7l10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  waveform: 'M2 12h2l3-9 4 18 3-13 2 7 2-3h4',
};

function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 2, style, fill = 'none' }) {
  const d = ICONS[name] || ICONS.grid;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split(' M').map((seg, i) => <path key={i} d={(i ? 'M' : '') + seg} />)}
    </svg>
  );
}

/* Avatar with deterministic gradient + initials */
function Avatar({ name, size = 36, role, color, ring, src, status }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const palette = [['#3b82f6', '#1d4ed8'], ['#2dd4a7', '#0e9f7e'], ['#9b8cff', '#6d4ee0'], ['#e7b35c', '#c98a2c'], ['#2dd4d4', '#1295b6'], ['#f0524d', '#c0322e']];
  const idx = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % palette.length;
  const g = color ? [color, color] : palette[idx];
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: src ? `url(${src}) center/cover` : `linear-gradient(135deg, ${g[0]}, ${g[1]})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.38, fontWeight: 700, color: '#fff',
        boxShadow: ring ? `0 0 0 2px var(--bg-panel), 0 0 0 4px ${g[0]}` : 'none',
        letterSpacing: '0.02em'
      }}>{!src && initials}</div>
      {status && <span style={{ position: 'absolute', right: -1, bottom: -1, width: size * 0.28, height: size * 0.28, borderRadius: '50%', background: status === 'live' ? 'var(--positive)' : status === 'away' ? 'var(--warning)' : 'var(--text-3)', border: '2px solid var(--bg-panel)' }} />}
    </div>
  );
}

/* KPI / metric tile */
function MetricTile({ label, value, unit, delta, deltaDir, spark, sparkColor, accent, big }) {
  const dirUp = deltaDir === 'up';
  return (
    <div className="ef-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, animation: 'ef-fade-up .5s both', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-2)' }}>{label}</span>
        {delta != null && (
          <span className="ef-pill" style={{ padding: '2px 7px', fontSize: 10.5, color: dirUp ? 'var(--positive)' : 'var(--risk)', borderColor: dirUp ? 'rgba(45,212,167,0.3)' : 'rgba(240,82,77,0.3)', background: dirUp ? 'rgba(45,212,167,0.08)' : 'rgba(240,82,77,0.08)' }}>
            <Icon name={dirUp ? 'arrowUp' : 'arrowDown'} size={11} /> {delta}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="mono" style={{ fontSize: big ? 34 : 26, fontWeight: 700, color: accent || 'var(--text-hi)', lineHeight: 1 }}>{value}</span>
        {unit && <span className="mono" style={{ fontSize: 13, color: 'var(--text-3)' }}>{unit}</span>}
      </div>
      {spark && <Sparkline data={spark} color={sparkColor || 'var(--positive)'} width={140} height={26} />}
    </div>
  );
}

Object.assign(window, { Icon, Avatar, MetricTile, ICONS });
