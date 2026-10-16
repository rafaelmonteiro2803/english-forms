/* ============================================================
   English Forms — Teacher Dashboard
   ============================================================ */
function TeacherScreen({ go }) {
  const d = DATA;
  const [sort, setSort] = useState('score');
  const students = [...d.students].sort((a, b) => sort === 'score' ? b.score - a.score : a.attn - b.attn);
  const atRisk = d.students.filter((s) => s.risk);

  return (
    <>
      <TopBar crumb="Manage" title="Teacher Cohort View" sub="Sofia Reyes · 18 active students"
        right={<div style={{ display: 'flex', gap: 8 }}>
          <button style={ghostBtn}><Icon name="filter" size={15} color="var(--text-2)" />Filter</button>
          <button style={primaryBtn}><Icon name="message" size={15} />Message cohort</button>
        </div>} />
      <ScreenScroll>
        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
          <MetricTile label="Cohort Avg" value="771" delta="+14" deltaDir="up" accent="var(--text-hi)" spark={[742, 750, 758, 763, 771]} />
          <MetricTile label="Active Today" value="14" unit="/18" delta="78%" deltaDir="up" spark={[10, 12, 11, 13, 14]} />
          <MetricTile label="At Risk" value="2" delta="-1" deltaDir="up" accent="var(--risk)" sparkColor="var(--risk)" spark={[4, 3, 3, 3, 2]} />
          <MetricTile label="Hrs This Week" value="62" unit="h" delta="+9%" deltaDir="up" spark={[48, 52, 55, 58, 62]} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          {/* ranking table */}
          <div className="ef-card" style={{ alignSelf: 'start' }}>
            <div className="ef-card-h">
              <span className="ef-card-title"><Icon name="users" size={14} color="var(--brand-bright)" />Student Ranking</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setSort('score')} style={{ ...segBtn, ...(sort === 'score' ? segActive : {}) }}>By score</button>
                <button onClick={() => setSort('attn')} style={{ ...segBtn, ...(sort === 'attn' ? segActive : {}) }}>By attention</button>
              </div>
            </div>
            <div style={{ padding: '4px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 70px 64px 80px 90px', gap: 12, padding: '8px 16px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-3)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                <span>#</span><span>Student</span><span>Level</span><span>Score</span><span>Trend</span><span>Attention</span>
              </div>
              {students.map((s, i) => {
                const tc = s.trend === 'up' ? 'var(--positive)' : s.trend === 'down' ? 'var(--risk)' : 'var(--text-3)';
                return (
                  <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 70px 64px 80px 90px', gap: 12, padding: '11px 16px', alignItems: 'center', borderBottom: i < students.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', background: s.risk ? 'rgba(240,82,77,0.04)' : 'transparent' }}>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: i < 3 ? 'var(--gold)' : 'var(--text-3)' }}>{i + 1}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <Avatar name={s.name} size={30} status={s.risk ? 'away' : 'live'} />
                      <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div><div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{s.role}</div></div>
                    </div>
                    <span className="ef-pill" style={{ fontSize: 10, color: 'var(--text-2)' }}>{s.lvl}</span>
                    <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)' }}>{s.score}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name={s.trend === 'up' ? 'arrowUp' : s.trend === 'down' ? 'arrowDown' : 'arrowR'} size={13} color={tc} /><span className="mono" style={{ fontSize: 12, fontWeight: 600, color: tc }}>{s.d}</span></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ flex: 1 }}><ProgressTrack value={s.attn} color={s.attn >= 80 ? 'var(--positive)' : s.attn >= 65 ? 'var(--gold)' : 'var(--risk)'} height={5} showGlow={false} /></div><span className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{s.attn}</span></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* right rail: alerts + errors + heatmap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="ef-card" style={{ borderColor: 'rgba(240,82,77,0.25)' }}>
              <div className="ef-card-h"><span className="ef-card-title"><Icon name="alert" size={14} color="var(--risk)" />Students at Risk</span><span className="ef-pill neg" style={{ fontSize: 10 }}>{atRisk.length}</span></div>
              <div style={{ padding: 10 }}>
                {atRisk.map((s) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px' }}>
                    <Avatar name={s.name} size={32} status="away" />
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)' }}>{s.name}</div><div style={{ fontSize: 10.5, color: 'var(--risk)' }}>{s.trend === 'down' ? 'Declining score' : 'No evolution'} · {s.attn}% attendance</div></div>
                    <button style={{ ...segBtn, color: 'var(--brand-bright)', borderColor: 'var(--border-accent)' }}>Reach out</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="ef-card">
              <div className="ef-card-h"><span className="ef-card-title"><Icon name="alert" size={14} color="var(--gold)" />Recurring Errors</span></div>
              <div style={{ padding: '12px 16px' }}>
                {d.recurringErrors.map((e, i) => (
                  <div key={i} style={{ marginBottom: i < d.recurringErrors.length - 1 ? 13 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, color: 'var(--text)' }}>{e.e}</span><span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{e.n}</span></div>
                    <ProgressTrack value={e.pct} max={24} color="var(--gold)" height={5} showGlow={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* cohort evolution heatmap */}
        <div className="ef-card" style={{ marginTop: 16 }}>
          <div className="ef-card-h"><span className="ef-card-title"><Icon name="grid" size={14} color="var(--brand-bright)" />Cohort Evolution Heatmap</span><span style={{ fontSize: 11, color: 'var(--text-3)' }}>monthly score delta · last 8 months</span></div>
          <div style={{ padding: 18 }}>
            <Heatmap rows={d.students.map((s) => s.name.split(' ')[0])} cols={['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
              values={d.students.map((s, ri) => Array.from({ length: 8 }, (_, ci) => {
                const base = s.trend === 'up' ? 0.55 : s.trend === 'down' ? 0.25 : 0.4;
                return Math.max(0.05, Math.min(0.98, base + Math.sin(ri + ci) * 0.2 + ci * (s.trend === 'up' ? 0.04 : -0.02)));
              }))} />
          </div>
        </div>
      </ScreenScroll>
    </>
  );
}
window.TeacherScreen = TeacherScreen;
