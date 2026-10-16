/* ============================================================
   English Forms — Live Class (teacher ↔ student videoconference)
   ============================================================ */
function ClassScreen({ go }) {
  const [t, setT] = useState(728); // seconds elapsed
  const [muted, setMuted] = useState(false);
  const teacher = { name: 'Sofia Reyes', color: '#9b8cff' };
  useEffect(() => { const i = setInterval(() => setT((x) => x + 1), 1000); return () => clearInterval(i); }, []);
  const mm = String(Math.floor(t / 60)).padStart(2, '0'), ss = String(t % 60).padStart(2, '0');

  const markers = [
    { at: 8, label: 'Warm-up', c: 'var(--text-3)' },
    { at: 26, label: 'Grammar focus', c: 'var(--brand)' },
    { at: 44, label: 'Filler word flagged', c: 'var(--warning)' },
    { at: 58, label: 'Vocabulary win', c: 'var(--positive)' },
    { at: 72, label: 'Role-play', c: 'var(--purple)' },
  ];

  const transcript = [
    { who: 'Sofia Reyes', self: false, t: "Let's practice the conditional. How would you phrase a hypothetical risk to the board?", time: '11:58' },
    { who: 'Marina', self: true, t: "If the margin would compress further, we would need to revisit the forecast.", time: '12:04', flag: { type: 'grammar', word: 'would compress', fix: 'were to compress' } },
    { who: 'Sofia Reyes', self: false, t: "Good instinct. In the second conditional we drop 'would' from the if-clause. Try again.", time: '12:11' },
    { who: 'Marina', self: true, t: "If the margin compressed further, we would need to revisit the forecast.", time: '12:18', flag: { type: 'win', word: 'compressed', note: 'Corrected — clean second conditional' } },
  ];

  const liveScores = [['Grammar', 81], ['Vocabulary', 90], ['Pronunciation', 78], ['Listening', 89], ['Fluency', 84], ['Business Comm.', 86]];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)' }}>
      <div style={{ height: 54, flexShrink: 0, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14, background: 'var(--bg-deep)' }}>
        <span className="live-dot" /><span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-hi)' }}>Live Class · Business Communication</span>
        <span className="ef-pill" style={{ fontSize: 11, color: 'var(--text-2)' }}><Icon name="clock" size={12} /><span className="mono">{mm}:{ss}</span></span>
        <span className="ef-pill brand" style={{ fontSize: 11 }}>1-on-1 · Sofia Reyes</span>
        <div style={{ flex: 1 }} />
        <span className="ef-pill" style={{ fontSize: 11, color: 'var(--positive)', borderColor: 'rgba(45,212,167,0.3)' }}><Icon name="zap" size={12} />AI co-pilot live</span>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', minHeight: 0 }}>
        {/* video stage */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: 18, gap: 14, minWidth: 0 }}>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 0 }}>
            <VideoTile name={teacher.name} role="Instructor" color={teacher.color} speaking />
            <VideoTile name="Marina Albuquerque" role="Student" color="#3b82f6" self muted={muted} />
          </div>

          {/* timeline */}
          <div className="ef-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="ef-card-title"><Icon name="waveform" size={14} color="var(--brand-bright)" />Lesson Timeline</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>auto-marked by AI</span>
            </div>
            <div style={{ position: 'relative', height: 40 }}>
              <div style={{ position: 'absolute', top: 18, left: 0, right: 0, height: 4, borderRadius: 2, background: 'var(--bg-input)' }} />
              <div style={{ position: 'absolute', top: 18, left: 0, width: '64%', height: 4, borderRadius: 2, background: 'linear-gradient(90deg, var(--brand-deep), var(--brand))' }} />
              {markers.map((m, i) => (
                <div key={i} style={{ position: 'absolute', top: 0, left: `${m.at}%`, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: m.c, border: '2px solid var(--bg-panel)', marginTop: 13, boxShadow: `0 0 8px -1px ${m.c}` }} title={m.label} />
                </div>
              ))}
              <div style={{ position: 'absolute', top: 12, left: '64%', transform: 'translateX(-50%)', width: 3, height: 16, background: 'var(--positive)', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {markers.map((m, i) => <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--text-2)' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: m.c }} />{m.label}</span>)}
            </div>
          </div>

          {/* controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <CtrlBtn icon={muted ? 'mute' : 'mic'} label="Mute" active={!muted} danger={muted} onClick={() => setMuted((m) => !m)} />
            <CtrlBtn icon="video" label="Camera" active />
            <CtrlBtn icon="share" label="Share screen" />
            <CtrlBtn icon="message" label="Chat" />
            <button onClick={() => go('report')} style={{ height: 48, padding: '0 22px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--risk)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="hangup" size={17} />End class
            </button>
          </div>
        </div>

        {/* AI rail */}
        <div style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 12 }}>Live AI Indicators</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 14px' }}>
              {liveScores.map(([l, v]) => {
                const c = v >= 85 ? 'var(--positive)' : v >= 78 ? 'var(--brand)' : 'var(--gold)';
                return (
                  <div key={l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 11, color: 'var(--text-2)' }}>{l}</span><span className="mono" style={{ fontSize: 12, fontWeight: 700, color: c }}>{v}</span></div>
                    <ProgressTrack value={v} color={c} height={5} showGlow={false} />
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '14px 16px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-2)', textTransform: 'uppercase' }}>Live Transcript</span>
            <span style={{ fontSize: 10, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}><span className="live-dot" style={{ width: 5, height: 5 }} />recording</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transcript.map((m, i) => (
              <div key={i} style={{ animation: 'ef-fade-up .4s both' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <Avatar name={m.who} size={22} color={m.self ? '#3b82f6' : teacher.color} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: m.self ? 'var(--brand-bright)' : 'var(--text-hi)' }}>{m.self ? 'Marina' : m.who}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 'auto' }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.45, paddingLeft: 30 }}>
                  <CaptionText line={{ txt: m.t, flags: m.flag ? [m.flag] : null }} />
                </div>
                {m.flag && <div style={{ marginLeft: 30, marginTop: 6 }}><AnalysisCard flag={m.flag} /></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoTile({ name, role, color, self, speaking, muted }) {
  return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: `radial-gradient(120% 100% at 50% 0%, ${color}22, transparent 55%), linear-gradient(160deg, #131c30, #0a0e1a)`, border: speaking ? `2px solid ${color}` : '1px solid var(--border)', boxShadow: speaking ? `0 0 28px -8px ${color}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Avatar name={name} size={92} color={color} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{role}</span>
      </div>
      <div style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(8,11,20,0.72)', backdropFilter: 'blur(6px)', borderRadius: 8, padding: '6px 11px' }}>
        {muted ? <Icon name="mute" size={14} color="var(--risk)" /> : speaking ? <Waveform active color={color} /> : <Icon name="mic" size={14} color="var(--text-2)" />}
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)' }}>{name}{self && ' (You)'}</span>
      </div>
      {speaking && <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, color, background: 'rgba(8,11,20,0.7)', padding: '3px 8px', borderRadius: 6, border: `1px solid ${color}44` }}>Speaking</div>}
    </div>
  );
}

window.ClassScreen = ClassScreen;
window.VideoTile = VideoTile;
