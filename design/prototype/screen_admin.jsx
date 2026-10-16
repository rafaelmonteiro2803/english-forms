/* ============================================================
   English Forms — Admin / Executive Dashboard
   ============================================================ */
function AdminScreen({ go }) {
  const d = DATA;
  return (
    <>
      <TopBar crumb="Manage" title="Executive Dashboard" sub="Organization · Banco Atlas"
        right={<div style={{ display: 'flex', gap: 8 }}>
          <button style={ghostBtn}><Icon name="clock" size={15} color="var(--text-2)" />Last 6 months</button>
          <button style={primaryBtn}><Icon name="download" size={15} />Board report</button>
        </div>} />
      <ScreenScroll>
        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
          {d.admin.kpis.map((k) => (
            <MetricTile key={k.label} label={k.label} value={k.value} delta={k.delta} deltaDir={k.dir} spark={k.spark} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* engagement area */}
          <div className="ef-card">
            <div className="ef-card-h">
              <span className="ef-card-title"><Icon name="trending" size={14} color="var(--positive)" />Platform Usage · Taught vs Simulated Hours</span>
              <div style={{ display: 'flex', gap: 16 }}><Legend c="var(--brand)" l="Taught" /><Legend c="var(--positive)" l="AI Simulated" /></div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ position: 'relative', height: 200 }}>
                <div style={{ position: 'absolute', inset: 0 }}><LineChart data={[12, 13.5, 15, 16, 17.2, 18.4]} width={620} height={200} color="var(--brand)" /></div>
                <div style={{ position: 'absolute', inset: 0 }}><LineChart data={[4, 5.2, 6.4, 7.8, 8.9, 9.7]} width={620} height={200} color="var(--positive)" glow /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => <span key={m} className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{m}</span>)}
              </div>
            </div>
          </div>

          {/* proficiency distribution donut */}
          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="layers" size={14} color="var(--brand-bright)" />Proficiency Mix</span></div>
            <div style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ position: 'relative' }}>
                <Donut size={140} stroke={18} segments={[
                  { value: 18, color: 'var(--text-3)' }, { value: 24, color: 'var(--brand)' },
                  { value: 32, color: 'var(--brand-bright)' }, { value: 18, color: 'var(--positive)' }, { value: 8, color: 'var(--purple)' },
                ]} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-hi)' }}>B2</span>
                  <span style={{ fontSize: 9.5, color: 'var(--text-3)' }}>median</span>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[['A2', 18, 'var(--text-3)'], ['B1', 24, 'var(--brand)'], ['B2', 32, 'var(--brand-bright)'], ['C1', 18, 'var(--positive)'], ['C2', 8, 'var(--purple)']].map(([l, v, c]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
                    <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1 }}>{l}</span>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-hi)' }}>{v}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* bottom: dept performance + funnel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="building" size={14} color="var(--brand-bright)" />Performance by Department</span></div>
            <div style={{ padding: '14px 18px' }}>
              {[['Finance', 812, 96], ['Operations', 788, 91], ['Sales', 765, 88], ['Legal', 742, 79], ['Marketing', 718, 74], ['Engineering', 701, 68]].map(([dep, sc, eng], i) => (
                <div key={dep} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 50px', gap: 12, alignItems: 'center', padding: '9px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{dep}</span>
                  <ProgressTrack value={sc} max={1000} color={i < 2 ? 'var(--positive)' : i < 4 ? 'var(--brand)' : 'var(--gold)'} height={7} />
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-hi)', textAlign: 'right' }}>{sc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="filter" size={14} color="var(--positive)" />Engagement Funnel</span><span style={{ fontSize: 11, color: 'var(--text-3)' }}>this month</span></div>
            <div style={{ padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Enrolled', 1284, 100, 'var(--brand)'], ['Active weekly', 1118, 87, 'var(--brand-bright)'], ['Ran a simulation', 842, 66, 'var(--cyan)'], ['Completed report', 712, 55, 'var(--positive)'], ['Improved score', 598, 47, 'var(--positive)']].map(([l, n, pct, c]) => (
                <div key={l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}><span style={{ fontSize: 12, color: 'var(--text-2)' }}>{l}</span><span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{n.toLocaleString()} · {pct}%</span></div>
                  <div style={{ height: 26, borderRadius: 7, background: 'var(--bg-input)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${c}, ${c}cc)`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, transition: 'width 1s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScreenScroll>
    </>
  );
}
window.AdminScreen = AdminScreen;
