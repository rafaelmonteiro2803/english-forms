/* ============================================================
   English Forms — Proficiency (CEFR ladder + projections)
   ============================================================ */
function ProficiencyScreen({ go }) {
  const d = DATA;
  const current = 820;
  const cefr = d.cefr;
  const lo = 100, hi = 1000;
  const pct = (v) => ((v - lo) / (hi - lo)) * 100;

  return (
    <>
      <TopBar crumb="Insights" title="Proficiency Trajectory" sub="CEFR · TOEFL · IELTS · TOEIC equivalence"
        right={<span className="ef-pill brand"><Icon name="trending" size={12} />Projected C1 in 5 months</span>} />
      <ScreenScroll>
        {/* the ladder */}
        <div className="ef-card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <span className="ef-card-title"><Icon name="layers" size={14} color="var(--brand-bright)" />CEFR Proficiency Ladder</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <Legend c="var(--positive)" l="You are here" />
              <Legend c="var(--brand)" l="Projection" />
            </div>
          </div>

          {/* track */}
          <div style={{ position: 'relative', height: 130, margin: '0 8px' }}>
            {/* bar */}
            <div style={{ position: 'absolute', top: 54, left: 0, right: 0, height: 22, borderRadius: 12, background: 'linear-gradient(90deg, #1e2a44, #233456)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ position: 'absolute', inset: 0, width: `${pct(current)}%`, background: 'linear-gradient(90deg, var(--positive-dim), var(--positive))', boxShadow: '0 0 20px -2px rgba(45,212,167,0.6)' }} />
              {/* projection segment */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct(current)}%`, width: `${pct(880) - pct(current)}%`, background: 'repeating-linear-gradient(90deg, rgba(59,130,246,0.5) 0 7px, transparent 7px 14px)' }} />
            </div>
            {/* cefr markers */}
            {cefr.map((c) => (
              <div key={c.l} style={{ position: 'absolute', top: 0, left: `${pct(c.score)}%`, transform: 'translateX(-50%)', textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: current >= c.score ? 'var(--positive)' : 'var(--text-3)', marginBottom: 6 }}>{c.l}</div>
                <div style={{ width: 2, height: 14, background: current >= c.score ? 'var(--positive)' : 'var(--border-strong)', margin: '0 auto' }} />
                <div style={{ height: 22 }} />
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-dim)', marginTop: 4 }}>{c.score}</div>
              </div>
            ))}
            {/* you-are-here pin */}
            <div style={{ position: 'absolute', top: 18, left: `${pct(current)}%`, transform: 'translateX(-50%)', transition: 'left 1s', zIndex: 5 }}>
              <div style={{ background: 'var(--positive)', color: '#04231a', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 7, whiteSpace: 'nowrap', boxShadow: 'var(--glow-pos)' }}>YOU · {current}</div>
              <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '7px solid var(--positive)', margin: '0 auto' }} />
            </div>
          </div>
        </div>

        {/* projections + exams */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="trending" size={14} color="var(--positive)" />Projected Trajectory</span><span style={{ fontSize: 11, color: 'var(--text-3)' }}>at current pace</span></div>
            <div style={{ padding: 16 }}>
              <div style={{ position: 'relative' }}>
                <LineChart data={[754, 770, 788, 804, 820, 842, 866, 888, 910, 932, 950, 968]} width={620} height={180} color="var(--brand)" showDots />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 14 }}>
                {[['+3 months', 'B2+', 866, 'var(--brand)'], ['+6 months', 'C1', 910, 'var(--positive)'], ['+12 months', 'C1+', 968, 'var(--purple)']].map(([w, lvl, sc, c]) => (
                  <div key={w} style={{ background: 'var(--bg-input)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{w}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, margin: '7px 0 3px' }}>
                      <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-hi)' }}>{sc}</span>
                      <span className="ef-pill" style={{ fontSize: 10, color: c, borderColor: `${c}55` }}>{lvl}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ef-card">
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="award" size={14} color="var(--gold)" />Exam Equivalence</span></div>
            <div style={{ padding: '8px 16px 16px' }}>
              {d.exams.map((e, i) => (
                <div key={e.name} style={{ padding: '14px 0', borderBottom: i < d.exams.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-hi)' }}>{e.name}</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-hi)' }}>{e.now}</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>/ {e.max}</span>
                      <span className="ef-pill brand" style={{ fontSize: 9.5, marginLeft: 4 }}>{e.band}</span>
                    </div>
                  </div>
                  <ProgressTrack value={e.now} max={e.max} color="var(--gold)" height={6} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* skill breakdown vs target */}
        <div className="ef-card">
          <div className="ef-card-h"><span className="ef-card-title"><Icon name="target" size={14} color="var(--brand-bright)" />Distance to C1 Target by Skill</span></div>
          <div style={{ padding: 18, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px 28px' }}>
            {[['Fluency', 84, 90], ['Grammar', 79, 88], ['Pronunciation', 78, 85], ['Listening', 88, 92], ['Vocabulary', 92, 94], ['Confidence', 81, 90]].map(([k, now, tgt]) => (
              <div key={k}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{k}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}><b className="mono" style={{ color: 'var(--text-hi)' }}>{now}</b> → <span className="mono" style={{ color: 'var(--positive)' }}>{tgt}</span></span>
                </div>
                <div style={{ position: 'relative' }}>
                  <ProgressTrack value={now} color={now >= tgt - 3 ? 'var(--positive)' : 'var(--brand)'} height={7} />
                  <div style={{ position: 'absolute', top: -3, left: `${tgt}%`, width: 2, height: 13, background: 'var(--positive)', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScreenScroll>
    </>
  );
}
window.ProficiencyScreen = ProficiencyScreen;
