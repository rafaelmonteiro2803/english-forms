/* ============================================================
   English Forms — app shell: Sidebar + TopBar + layout
   ============================================================ */

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', group: 'Learn' },
  { id: 'simulator', label: 'AI Simulator', icon: 'mic', group: 'Learn', badge: 'LIVE' },
  { id: 'class', label: 'Live Class', icon: 'video', group: 'Learn' },
  { id: 'report', label: 'Lesson Report', icon: 'report', group: 'Insights' },
  { id: 'proficiency', label: 'Proficiency', icon: 'trending', group: 'Insights' },
  { id: 'teacher', label: 'Teacher View', icon: 'users', group: 'Manage' },
  { id: 'admin', label: 'Admin', icon: 'building', group: 'Manage' },
  { id: 'students', label: 'Students', icon: 'users', group: 'Management' },
  { id: 'services', label: 'Services', icon: 'file', group: 'Management' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar', group: 'Management' },
];

function Logo({ size = 30, mark = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: size, height: size, borderRadius: 8, position: 'relative', background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', boxShadow: '0 4px 14px -4px rgba(59,130,246,0.6)', flexShrink: 0, overflow: 'hidden' }}>
        <svg width={size} height={size} viewBox="0 0 30 30" style={{ position: 'absolute', inset: 0 }}>
          <path d="M6 21 L11 11 L15 18 L19 8 L24 19" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="19" cy="8" r="2" fill="#fff" />
        </svg>
      </div>
      {!mark && <div style={{ lineHeight: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-hi)', letterSpacing: '-0.01em' }}>English Forms</div>
        <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.16em', marginTop: 2 }}>PERFORMANCE INTELLIGENCE</div>
      </div>}
    </div>
  );
}

function Sidebar({ current, go }) {
  const groups = [...new Set(NAV.map((n) => n.group))];
  return (
    <aside style={{ width: 232, flexShrink: 0, background: 'var(--bg-deep)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
        <Logo />
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
        {groups.map((grp) => (
          <div key={grp} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-dim)', padding: '0 10px 8px', textTransform: 'uppercase' }}>{grp}</div>
            {NAV.filter((n) => n.group === grp).map((n) => {
              const active = current === n.id;
              return (
                <button key={n.id} onClick={() => go(n.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', marginBottom: 2,
                  border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', position: 'relative',
                  background: active ? 'linear-gradient(90deg, rgba(59,130,246,0.16), rgba(59,130,246,0.02))' : 'transparent',
                  color: active ? 'var(--text-hi)' : 'var(--text-2)', transition: 'all .15s',
                }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                  {active && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 3, background: 'var(--brand)' }} />}
                  <Icon name={n.icon} size={17} color={active ? 'var(--brand-bright)' : 'var(--text-3)'} strokeWidth={active ? 2.3 : 2} />
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, flex: 1 }}>{n.label}</span>
                  {n.badge && <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--risk)', display: 'flex', alignItems: 'center', gap: 4 }}><span className="live-dot" style={{ width: 5, height: 5 }} />{n.badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
          <Avatar name={DATA.student.name} size={32} status="live" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-hi)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{DATA.student.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Level {DATA.student.level} · {DATA.student.score} pts</div>
          </div>
          <Icon name="logout" size={15} color="var(--text-3)" />
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, sub, right, crumb }) {
  return (
    <header style={{ height: 62, flexShrink: 0, borderBottom: '1px solid var(--border)', background: 'rgba(10,14,26,0.7)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 18 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {crumb && <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: 3, textTransform: 'uppercase' }}>{crumb}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-hi)', letterSpacing: '-0.01em' }}>{title}</h1>
          {sub && <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{sub}</span>}
        </div>
      </div>
      <div style={{ position: 'relative', width: 230 }}>
        <Icon name="search" size={15} color="var(--text-3)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
        <input placeholder="Search metrics, lessons…" style={{ width: '100%', height: 36, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px 0 34px', color: 'var(--text)', fontSize: 12.5, fontFamily: 'var(--font-sans)' }} />
      </div>
      {right}
      <button className="ef-iconbtn" style={iconBtnStyle} title="Notifications">
        <Icon name="bell" size={17} color="var(--text-2)" />
        <span style={{ position: 'absolute', top: 7, right: 8, width: 6, height: 6, borderRadius: '50%', background: 'var(--risk)', border: '1.5px solid var(--bg-deep)' }} />
      </button>
      <button style={iconBtnStyle} title="Settings"><Icon name="settings" size={17} color="var(--text-2)" /></button>
    </header>
  );
}

const iconBtnStyle = { position: 'relative', width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-panel)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

function ScreenScroll({ children, pad = 22 }) {
  return <div style={{ flex: 1, overflowY: 'auto', padding: pad, background: 'var(--bg-base)' }}>{children}</div>;
}

Object.assign(window, { Sidebar, TopBar, Logo, ScreenScroll, NAV, iconBtnStyle });
