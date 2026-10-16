/* ============================================================
   English Forms — AI Meeting Simulator (HERO screen)
   ============================================================ */

/* animated voice waveform */
function Waveform({ active, color = '#fff', bars = 5, size = 3 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size, height: 18 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} style={{
          width: size, borderRadius: 2, background: color,
          height: active ? '100%' : '20%',
          animation: active ? `wf 0.7s ease-in-out ${i * 0.12}s infinite alternate` : 'none',
          opacity: active ? 1 : 0.4, transition: 'height .2s'
        }} />
      ))}
      <style>{`@keyframes wf { from { height: 18%; } to { height: 100%; } }`}</style>
    </div>
  );
}

function ParticipantTile({ p, speaking, self }) {
  return (
    <div style={{
      position: 'relative', borderRadius: 14, overflow: 'hidden', height: '100%', minHeight: 0,
      background: self
        ? 'linear-gradient(160deg, #16203a, #0b1120)'
        : `radial-gradient(120% 100% at 30% 0%, ${p.color}22, transparent 60%), linear-gradient(160deg, #131c30, #0b1120)`,
      border: speaking ? `2px solid ${p.color}` : '1px solid var(--border)',
      boxShadow: speaking ? `0 0 0 3px ${p.color}33, 0 0 30px -6px ${p.color}88` : 'none',
      transition: 'all .3s', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Avatar name={p.name} size={64} color={self ? '#3b82f6' : p.color} />
      {/* name plate */}
      <div style={{ position: 'absolute', left: 10, bottom: 10, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(8,11,20,0.72)', backdropFilter: 'blur(6px)', borderRadius: 8, padding: '5px 10px' }}>
        {speaking ? <Waveform active color={self ? 'var(--brand-bright)' : p.color} /> : <Icon name={self ? 'mic' : 'mic'} size={13} color="var(--text-2)" />}
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-hi)' }}>{self ? 'You' : p.name}</span>
        {!self && <span style={{ fontSize: 10.5, fontWeight: 600, color: p.color, background: `${p.color}1f`, padding: '1px 6px', borderRadius: 5 }}>{p.role}</span>}
      </div>
      {/* AI tag */}
      {!self && <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: p.color, background: 'rgba(8,11,20,0.7)', border: `1px solid ${p.color}44`, padding: '3px 7px', borderRadius: 6 }}>AI · {p.accent}</div>}
      {self && <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--positive)', background: 'rgba(8,11,20,0.7)', border: '1px solid rgba(45,212,167,0.4)', padding: '3px 7px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5 }}><span className="live-dot" style={{ background: 'var(--positive)', width: 5, height: 5 }} />REC</div>}
    </div>
  );
}

function SimulatorScreen({ go }) {
  const [mode, setMode] = useState('lobby');
  const [scenario, setScenario] = useState(DATA.scenarios[3]);
  if (mode === 'lobby') return <ScenarioLobby scenario={scenario} setScenario={setScenario} onStart={() => setMode('live')} go={go} />;
  return <LiveMeeting scenario={scenario} onEnd={() => setMode('lobby')} go={go} />;
}

/* ---------- LOBBY: scenario selector ---------- */
function ScenarioLobby({ scenario, setScenario, onStart, go }) {
  const diffColor = { Intermediate: 'var(--brand)', Advanced: 'var(--warning)', Expert: 'var(--risk)' };
  return (
    <>
      <TopBar crumb="AI Simulator" title="Meeting Simulator" sub="Rehearse high-stakes conversations with AI executives"
        right={<span className="ef-pill brand"><Icon name="zap" size={12} />9 scenarios</span>} />
      <ScreenScroll>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
          {/* scenario grid */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 12 }}>Select a scenario</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {DATA.scenarios.map((sc) => {
                const sel = scenario.id === sc.id;
                return (
                  <button key={sc.id} onClick={() => setScenario(sc)} style={{
                    textAlign: 'left', padding: 16, borderRadius: 12, cursor: 'pointer', position: 'relative',
                    background: sel ? 'linear-gradient(160deg, rgba(59,130,246,0.14), var(--bg-panel))' : 'var(--bg-panel)',
                    border: sel ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                    boxShadow: sel ? 'var(--glow-brand)' : 'none', transition: 'all .18s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: sel ? 'var(--brand)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={sc.icon} size={18} color={sel ? '#fff' : 'var(--text-2)'} />
                      </div>
                      {sel && <Icon name="checkCircle" size={18} color="var(--brand-bright)" />}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 5 }}>{sc.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.4, marginBottom: 12, minHeight: 32 }}>{sc.desc}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: diffColor[sc.diff] || 'var(--text-2)' }}>{sc.diff}</span>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-dim)' }} />
                      <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{sc.mins} min</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* setup panel */}
          <div className="ef-card" style={{ alignSelf: 'start', position: 'sticky', top: 0 }}>
            <div className="ef-card-h"><span className="ef-card-title"><Icon name="settings" size={14} color="var(--brand-bright)" />Session Setup</span></div>
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 4 }}>{scenario.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>{scenario.desc}</div>

              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 10 }}>AI Participants</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                {DATA.avatars.map((a) => (
                  <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={a.name} size={30} color={a.color} />
                    <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-hi)' }}>{a.name}</div><div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{a.role} · {a.accent} accent</div></div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                <SetupStat icon="clock" label="Duration" value={`${scenario.mins} min`} />
                <SetupStat icon="target" label="Difficulty" value={scenario.diff} />
                <SetupStat icon="globe" label="Focus" value={scenario.tag} />
                <SetupStat icon="mic" label="Mode" value="Voice + live" />
              </div>

              <button onClick={onStart} style={{ ...primaryBtn, width: '100%', height: 46, fontSize: 14, justifyContent: 'center' }}>
                <Icon name="play" size={16} fill="#fff" />Join Meeting
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, fontSize: 10.5, color: 'var(--text-3)' }}>
                <Icon name="mic" size={12} />Microphone access required · Real-time scoring
              </div>
            </div>
          </div>
        </div>
      </ScreenScroll>
    </>
  );
}
function SetupStat({ icon, label, value }) {
  return (
    <div style={{ background: 'var(--bg-input)', borderRadius: 9, padding: '10px 12px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}><Icon name={icon} size={12} color="var(--text-3)" /><span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span></div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-hi)' }}>{value}</div>
    </div>
  );
}

window.SimulatorScreen = SimulatorScreen;
window.Waveform = Waveform;
window.ParticipantTile = ParticipantTile;
