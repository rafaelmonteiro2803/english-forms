/* ============================================================
   English Forms — Lesson Intelligence Report (post-session)
   ============================================================ */
function ReportScreen({ go }) {
  const d = DATA;
  return (
    <>
      <TopBar crumb="Insights · Session #4127" title="Lesson Intelligence Report" sub="Earnings Presentation · 20 min"
        right={<div style={{ display: 'flex', gap: 8 }}>
          <button style={ghostBtn}><Icon name="download" size={15} color="var(--text-2)" />PDF</button>
          <button onClick={() => go('simulator')} style={primaryBtn}><Icon name="mic" size={15} />Re-run</button>
        </div>} />
      <ScreenScroll>
        {/* executive summary banner */}
        <div className="ef-card grid-bg" style={{ padding: 22, marginBottom: 16, display: 'grid', gridTemplateColumns: '170px 1fr 220px', gap: 24, alignItems: 'center', background: 'radial-gradient(120% 130% at 0% 0%, rgba(45,212,167,0.1), transparent 55%), var(--bg-panel)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Gauge value={86} max={100} size={150} color="var(--positive)" label="Overall" sub="+5 vs last" />
          </div>
          <div>
            <div className="ef-pill pos" style={{ marginBottom: 10 }}><Icon name="trending" size={12} />Top 12% of cohort</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 8, letterSpacing: '-0.01em' }}>Executive Summary</div>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text)', lineHeight: 1.6, maxWidth: 560 }}>
              Marina delivered a <b style={{ color: 'var(--text-hi)' }}>confident, well-structured</b> earnings presentation with strong command of executive vocabulary. Fluency and listening were standout dimensions. The primary opportunity is <b style={{ color: 'var(--warning)' }}>subject-verb agreement under pressure</b> and reducing filler words during transitions.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Words spoken', '642', 'message'], ['Speaking time', '8m 12s', 'clock'], ['Talk ratio', '47%', 'users']].map(([l, v, ic]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-input)', borderRadius: 9, padding: '9px 12px', border: '1px solid var(--border)' }}>
                <Icon name={ic} size={15} color="var(--text-3)" />
                <span style={{ flex: 1, fontSize: 11.5, color: 'var(--text-2)' }}>{l}</span>
                <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hi)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* sub-scores grid */}
        <div className="ef-card" style={{ marginBottom: 16 }}>
          <div className="ef-card-h"><span className="ef-card-title"><Icon name="grid" size={14} color="var(--brand-bright)" />Dimension Scores</span><span style={{ fontSize: 11, color: 'var(--text-3)' }}>9 competencies</span></div>
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {d.subScores.map((s) => {
              const c = s.v >= 85 ? 'var(--positive)' : s.v >= 75 ? 'var(--brand)' : 'var(--gold)';
              return (
                <div key={s.key} style={{ background: 'var(--bg-input)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{s.key}</span>
                    <span className="mono" style={{ fontSize: 19, fontWeight: 700, color: c }}>{s.v}</span>
                  </div>
                  <ProgressTrack value={s.v} color={c} height={5} />
                </div>
              );
            })}
          </div>
        </div>

        {/* charts: radar + history + heatmap */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="target" size={14} color="var(--brand-bright)" />Competency Radar</span></div>
            <div style={{ padding: '8px 12px 4px' }}>
              <RadarChart axes={d.radarAxes} size={230} series={[{ values: d.radarNow, color: 'var(--positive)', fill: 'rgba(45,212,167,0.16)' }]} />
            </div>
          </div>
          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="trending" size={14} color="var(--positive)" />Score History</span></div>
            <div style={{ padding: 16 }}>
              <BarsChart data={[71, 74, 73, 78, 80, 81, 86]} height={150} color="var(--brand)" gradientTo="rgba(59,130,246,0.2)" labels={['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7']} max={100} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--text-3)' }}><span>7 sessions</span><span className="up mono" style={{ fontWeight: 600 }}>+15 pts</span></div>
            </div>
          </div>
          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="grid" size={14} color="var(--gold)" />Error Heatmap</span></div>
            <div style={{ padding: 16 }}>
              <Heatmap rows={['Grammar', 'Vocab', 'Pronun', 'Fluency']} cols={['Open', 'Mid', 'Q&A', 'Close']}
                values={[[0.2, 0.5, 0.8, 0.3], [0.1, 0.2, 0.15, 0.1], [0.4, 0.5, 0.6, 0.45], [0.15, 0.3, 0.55, 0.5]]} />
              <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 10 }}>Error density by lesson phase — highest during Q&amp;A.</div>
            </div>
          </div>
        </div>

        {/* strengths + improvements + actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <ListPanel title="Top Strengths" icon="award" color="var(--positive)" items={d.strengths} dir="up" />
          <ListPanel title="Improvement Areas" icon="target" color="var(--warning)" items={d.improvements} dir="down" />
          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="zap" size={14} color="var(--brand-bright)" />Recommended Actions</span></div>
            <div style={{ padding: 10 }}>
              {d.actions.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 8px', borderBottom: i < d.actions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={a.icon} size={16} color="var(--brand-bright)" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)' }}>{a.t}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{a.type} · {a.mins} min</div>
                  </div>
                  <button style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border-strong)', background: 'var(--bg-panel)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={14} color="var(--text-2)" /></button>
                </div>
              ))}
              <button style={{ ...primaryBtn, width: '100%', justifyContent: 'center', marginTop: 10, height: 40 }}><Icon name="check" size={15} />Add all to study plan</button>
            </div>
          </div>
        </div>
      </ScreenScroll>
    </>
  );
}

function ListPanel({ title, icon, color, items, dir }) {
  return (
    <div className="ef-card">
      <div className="ef-card-h"><span className="ef-card-title"><Icon name={icon} size={14} color={color} />{title}</span><span style={{ fontSize: 11, color: 'var(--text-3)' }}>Top 5</span></div>
      <div style={{ padding: 10 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '10px 8px', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: `${color}1f`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }} className="mono">{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)' }}>{it.t}</span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>{it.v}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.35 }}>{it.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ReportScreen, ListPanel });
