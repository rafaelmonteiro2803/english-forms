/* ============================================================
   English Forms — Student Dashboard
   ============================================================ */
function DashboardScreen({ go }) {
  const s = DATA;
  return (
    <>
      <TopBar crumb="Learn" title="Performance Dashboard" sub={`${s.student.role}`}
        right={<div style={{ display: 'flex', gap: 8 }}>
          <button style={ghostBtn}><Icon name="download" size={15} color="var(--text-2)" />Export</button>
          <button onClick={() => go('simulator')} style={primaryBtn}><Icon name="mic" size={15} />New Simulation</button>
        </div>} />
      <ScreenScroll>
        {/* hero strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, marginBottom: 16 }}>
          <div className="ef-card grid-bg" style={{ padding: 20, display: 'flex', gap: 18, alignItems: 'center', background: 'radial-gradient(120% 100% at 0% 0%, rgba(45,212,167,0.1), transparent 60%), var(--bg-panel)' }}>
            <Gauge value={820} max={1000} size={132} color="var(--positive)" label="of 1000" />
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-2)', textTransform: 'uppercase' }}>English Performance</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Score</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <span className="ef-pill brand">Level {s.student.level}</span>
                <Icon name="arrowR" size={13} color="var(--text-3)" />
                <span className="ef-pill" style={{ color: 'var(--positive)', borderColor: 'rgba(45,212,167,0.3)' }}>{s.student.target}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: 'var(--text-2)' }}>
                <Icon name="flame" size={14} color="var(--warning)" /><b className="mono" style={{ color: 'var(--text-hi)' }}>{s.student.streak}</b> day streak
              </div>
            </div>
          </div>
          {/* six sub-scores */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {s.scores.map((sc) => (
              <div key={sc.key} className="ef-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>{sc.key}</span>
                  <span className="ef-pill pos" style={{ padding: '1px 6px', fontSize: 10 }}>{sc.delta}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, margin: '8px 0 8px' }}>
                  <span className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-hi)' }}>{sc.value}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>%</span>
                </div>
                <ProgressTrack value={sc.value} color={sc.color} />
              </div>
            ))}
          </div>
        </div>

        {/* charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="ef-card">
            <div className="ef-card-h">
              <span className="ef-card-title"><Icon name="trending" size={14} color="var(--positive)" />Performance · Trailing 12 Months</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['12M', '6M', '3M'].map((t, i) => <button key={t} style={{ ...segBtn, ...(i === 0 ? segActive : {}) }}>{t}</button>)}
              </div>
            </div>
            <div style={{ padding: '18px 16px 8px' }}>
              <LineChart data={s.perf12m} width={620} height={196} color="var(--positive)" showDots />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 8px 0' }}>
                {s.months.map((m) => <span key={m} className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{m}</span>)}
              </div>
            </div>
          </div>
          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="target" size={14} color="var(--brand-bright)" />Competency Radar</span><span className="ef-pill" style={{ fontSize: 10, color: 'var(--text-3)' }}>vs 3mo ago</span></div>
            <div style={{ padding: '10px 16px 6px' }}>
              <RadarChart axes={s.radarAxes} size={250} series={[
                { values: s.radar3mo, color: 'var(--text-3)', fill: 'rgba(120,130,150,0.08)' },
                { values: s.radarNow, color: 'var(--brand)', fill: 'rgba(59,130,246,0.18)' },
              ]} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 18, paddingBottom: 8 }}>
                <Legend c="var(--brand)" l="Now" /><Legend c="var(--text-3)" l="3 months ago" />
              </div>
            </div>
          </div>
        </div>

        {/* bottom panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="video" size={14} color="var(--brand-bright)" />Upcoming Sessions</span></div>
            <div style={{ padding: 8 }}>
              {[['Live Class · Sofia Reyes', 'Today · 16:00', 'video', 'var(--brand)'], ['Sim · Board Meeting', 'Tomorrow · 09:30', 'mic', 'var(--positive)'], ['Sim · Investor Pitch', 'Fri · 14:00', 'zap', 'var(--purple)']].map(([t, w, ic, c]) => (
                <div key={t} style={rowItem}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={16} color={c} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)' }}>{t}</div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{w}</div></div>
                  <Icon name="chevR" size={15} color="var(--text-3)" />
                </div>
              ))}
            </div>
          </div>
          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="mic" size={14} color="var(--positive)" />Recent Simulations</span></div>
            <div style={{ padding: 8 }}>
              {[['Earnings Presentation', 86, '2d ago'], ['Commercial Negotiation', 79, '4d ago'], ['Multinational Interview', 91, '1w ago']].map(([t, sc, w]) => (
                <div key={t} style={rowItem}>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)' }}>{t}</div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{w}</div></div>
                  <div style={{ textAlign: 'right' }}><span className="mono" style={{ fontSize: 17, fontWeight: 700, color: sc >= 85 ? 'var(--positive)' : 'var(--gold)' }}>{sc}</span><div style={{ fontSize: 9.5, color: 'var(--text-3)' }}>score</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="target" size={14} color="var(--gold)" />Active Goals</span></div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[['Reach C1 by Q4', 72, 'var(--positive)'], ['Pronunciation 85%', 78, 'var(--gold)'], ['Negotiation drills ×10', 60, 'var(--brand)']].map(([t, v, c]) => (
                <div key={t}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}><span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{t}</span><span className="mono" style={{ fontSize: 12, color: c, fontWeight: 600 }}>{v}%</span></div>
                  <ProgressTrack value={v} color={c} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScreenScroll>
    </>
  );
}

function Legend({ c, l }) { return <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-2)' }}><span style={{ width: 10, height: 3, borderRadius: 2, background: c }} />{l}</span>; }
const ghostBtn = { display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px', borderRadius: 8, border: '1px solid var(--border-strong)', background: 'var(--bg-panel)', color: 'var(--text)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' };
const primaryBtn = { display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(180deg, var(--brand-bright), var(--brand))', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 18px -8px rgba(59,130,246,0.7)' };
const segBtn = { height: 26, padding: '0 11px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-3)', fontSize: 11, fontWeight: 600, cursor: 'pointer' };
const segActive = { background: 'var(--bg-elevated)', color: 'var(--text-hi)', borderColor: 'var(--border-strong)' };
const rowItem = { display: 'flex', alignItems: 'center', gap: 11, padding: '9px 8px', borderRadius: 8, cursor: 'pointer' };

Object.assign(window, { DashboardScreen, ghostBtn, primaryBtn, segBtn, segActive, rowItem, Legend });
