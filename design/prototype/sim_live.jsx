/* ============================================================
   English Forms — Live Meeting (inside the AI Simulator)
   ============================================================ */

const SIM_SCRIPT = [
  { spk: 0, txt: "Marina, thanks for joining. Let's open with your read on the Q3 numbers — what stands out to you?" },
  { spk: 'you', txt: "Thank you, Richard. The headline is that recurring revenue grew fourteen percent quarter over quarter, ahead of our internal forecast.", flags: [{ type: 'filler', word: 'uh', note: 'Filler word detected' }] },
  { spk: 1, txt: "Encouraging. But gross margin compressed slightly. How are you thinking about cost discipline going into Q4?" },
  { spk: 'you', txt: "We are prioritizing the initiatives that has the highest return, and we will pause two lower-impact projects to protect the margin.", flags: [{ type: 'grammar', word: 'has', fix: 'have', note: "Subject-verb agreement" }] },
  { spk: 3, txt: "From the sales side, what's the pipeline coverage looking like for the new targets?" },
  { spk: 'you', txt: "Coverage is roughly three times quota. I am confident we can mitigate the shortfall through the enterprise segment.", flags: [{ type: 'win', word: 'mitigate', note: 'Strong vocabulary' }] },
  { spk: 4, txt: "And on talent — are we resourced to deliver this plan, or do we need to revisit headcount?" },
  { spk: 'you', txt: "We have the core team in place. I would like to add two senior hires in Q1 to de-risk the roadmap.", flags: [{ type: 'win', word: 'de-risk', note: 'Confident, precise' }] },
];

function LiveMeeting({ scenario, onEnd, go }) {
  const [step, setStep] = useState(-1);
  const [elapsed, setElapsed] = useState(0);
  const [youSpeaking, setYouSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [conf, setConf] = useState(72);
  const [scores, setScores] = useState({ grammar: 79, pronunciation: 78, vocabulary: 90, fluency: 82 });
  const [lines, setLines] = useState([]);
  const transcriptRef = useRef(null);

  // clock
  useEffect(() => { const t = setInterval(() => setElapsed((e) => e + 1), 1000); return () => clearInterval(t); }, []);

  // conversation progression
  useEffect(() => {
    if (step >= SIM_SCRIPT.length - 1) return;
    const cur = SIM_SCRIPT[step + 1];
    const dur = cur.spk === 'you' ? 4200 : 3400;
    const t = setTimeout(() => {
      const ns = step + 1;
      setStep(ns);
      setYouSpeaking(cur.spk === 'you' && !muted);
      setLines((L) => [...L, cur]);
      // nudge live metrics
      setConf((c) => Math.max(60, Math.min(94, c + (cur.flags?.some(f => f.type === 'win') ? 4 : cur.flags?.some(f => f.type === 'grammar') ? -3 : 2))));
      setScores((s) => ({
        grammar: clamp(s.grammar + (cur.flags?.some(f => f.type === 'grammar') ? -2 : 1)),
        pronunciation: clamp(s.pronunciation + (Math.random() > 0.5 ? 1 : 0)),
        vocabulary: clamp(s.vocabulary + (cur.flags?.some(f => f.type === 'win') ? 2 : 0)),
        fluency: clamp(s.fluency + (cur.flags?.some(f => f.type === 'filler') ? -1 : 1)),
      }));
    }, dur);
    return () => clearTimeout(t);
  }, [step, muted]);

  useEffect(() => { if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight; }, [lines]);

  const activeSpk = step >= 0 ? SIM_SCRIPT[step].spk : null;
  const caption = step >= 0 ? SIM_SCRIPT[step] : null;
  const ended = step >= SIM_SCRIPT.length - 1;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0'), ss = String(elapsed % 60).padStart(2, '0');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)' }}>
      {/* meeting top bar */}
      <div style={{ height: 54, flexShrink: 0, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14, background: 'var(--bg-deep)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span className="live-dot" /><span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-hi)' }}>{scenario.title}</span>
          <span className="ef-pill" style={{ fontSize: 10, color: 'var(--risk)', borderColor: 'rgba(240,82,77,0.3)', background: 'rgba(240,82,77,0.08)' }}>LIVE</span>
        </div>
        <div className="ef-pill" style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-2)' }}><Icon name="clock" size={12} /><span className="mono">{mm}:{ss}</span></div>
        <div className="ef-pill" style={{ fontSize: 11, color: 'var(--text-2)' }}><Icon name="users" size={12} />6 participants</div>
        <div style={{ flex: 1 }} />
        <div className="ef-pill brand" style={{ fontSize: 11 }}><Icon name="zap" size={12} />Real-time scoring active</div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 348px', minHeight: 0 }}>
        {/* STAGE */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, padding: 18, gap: 14 }}>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr 1fr', gap: 12, minHeight: 0 }}>
            {DATA.avatars.map((p, i) => <ParticipantTile key={p.name} p={p} speaking={activeSpk === i} />)}
            <ParticipantTile p={{ name: DATA.student.name, color: '#3b82f6' }} self speaking={activeSpk === 'you'} />
          </div>

          {/* live caption */}
          <div style={{ minHeight: 64, background: 'linear-gradient(180deg, var(--bg-panel), var(--bg-deep))', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            {caption ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 64 }}>
                  <Avatar name={caption.spk === 'you' ? DATA.student.name : DATA.avatars[caption.spk].name} size={30} color={caption.spk === 'you' ? '#3b82f6' : DATA.avatars[caption.spk].color} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)' }}>{caption.spk === 'you' ? 'You' : DATA.avatars[caption.spk].role}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <CaptionText line={caption} />
                </div>
              </>
            ) : <div style={{ color: 'var(--text-3)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}><Waveform active color="var(--brand)" />Connecting to AI participants…</div>}
          </div>

          {/* controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <CtrlBtn icon={muted ? 'mute' : 'mic'} label={muted ? 'Unmute' : 'Mute'} active={!muted} danger={muted} onClick={() => setMuted((m) => !m)} />
            <CtrlBtn icon="video" label="Camera" active />
            <CtrlBtn icon="share" label="Share" />
            <CtrlBtn icon="message" label="Notes" />
            <button onClick={() => go('report')} style={{ height: 48, padding: '0 22px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--risk)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 22px -8px rgba(240,82,77,0.7)' }}>
              <Icon name="hangup" size={17} />{ended ? 'End & view report' : 'Leave'}
            </button>
          </div>
        </div>

        {/* ANALYSIS RAIL */}
        <div style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* confidence + live scores */}
          <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-2)', textTransform: 'uppercase' }}>Confidence Index</span>
              <span className="ef-pill pos" style={{ fontSize: 10, padding: '1px 7px' }}>{conf >= 75 ? 'Strong' : 'Building'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <ConfMeter value={conf} />
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['Grammar', scores.grammar, 'var(--brand)'], ['Pronunc.', scores.pronunciation, 'var(--gold)'], ['Vocab', scores.vocabulary, 'var(--positive)'], ['Fluency', scores.fluency, 'var(--cyan)']].map(([l, v, c]) => (
                  <div key={l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ fontSize: 10, color: 'var(--text-3)' }}>{l}</span><span className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: c }}>{v}</span></div>
                    <ProgressTrack value={v} color={c} height={4} showGlow={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* live analysis feed */}
          <div style={{ padding: '14px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-2)', textTransform: 'uppercase' }}>Live Analysis</span>
            <span style={{ fontSize: 10, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}><span className="live-dot" style={{ width: 5, height: 5 }} />streaming</span>
          </div>
          <div ref={transcriptRef} style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lines.filter(l => l.flags).flatMap((l, li) => l.flags.map((f, fi) => <AnalysisCard key={li + '-' + fi} flag={f} />))}
            {lines.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '24px 0' }}>Insights appear as you speak…</div>}
            {ended && <button onClick={() => go('report')} style={{ ...primaryBtn, width: '100%', justifyContent: 'center', marginTop: 6, height: 40 }}><Icon name="report" size={15} />View full intelligence report</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function clamp(v) { return Math.max(40, Math.min(99, Math.round(v))); }

function CaptionText({ line }) {
  // highlight flagged word
  const flag = line.flags && line.flags[0];
  if (!flag) return <span style={{ fontSize: 15, color: 'var(--text-hi)', lineHeight: 1.5, fontWeight: 500 }}>{line.txt}</span>;
  const color = { grammar: 'var(--risk)', filler: 'var(--warning)', win: 'var(--positive)' }[flag.type];
  const parts = line.txt.split(new RegExp(`(${flag.word})`, 'i'));
  return (
    <span style={{ fontSize: 15, color: 'var(--text-hi)', lineHeight: 1.5, fontWeight: 500 }}>
      {parts.map((p, i) => p.toLowerCase() === flag.word.toLowerCase()
        ? <mark key={i} style={{ background: `${color}26`, color, borderBottom: `2px solid ${color}`, borderRadius: 3, padding: '0 2px', fontWeight: 700 }}>{p}</mark>
        : <React.Fragment key={i}>{p}</React.Fragment>)}
    </span>
  );
}

function AnalysisCard({ flag }) {
  const cfg = {
    grammar: { c: 'var(--risk)', icon: 'alert', label: 'Grammar' },
    filler: { c: 'var(--warning)', icon: 'message', label: 'Fluency' },
    win: { c: 'var(--positive)', icon: 'checkCircle', label: 'Strength' },
    pron: { c: 'var(--gold)', icon: 'volume', label: 'Pronunciation' },
  }[flag.type] || { c: 'var(--brand)', icon: 'zap', label: 'Tip' };
  return (
    <div style={{ background: 'var(--bg-panel)', border: `1px solid ${cfg.c}33`, borderLeft: `3px solid ${cfg.c}`, borderRadius: 9, padding: '10px 12px', animation: 'ef-fade-up .35s both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
        <Icon name={cfg.icon} size={13} color={cfg.c} />
        <span style={{ fontSize: 10.5, fontWeight: 700, color: cfg.c, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>
        {flag.note}{flag.fix && <> · <span style={{ color: 'var(--text-3)' }}>“{flag.word}”</span> → <b style={{ color: 'var(--positive)' }}>“{flag.fix}”</b></>}
        {flag.type === 'win' && <> · <span style={{ color: 'var(--text-3)' }}>“{flag.word}”</span></>}
      </div>
    </div>
  );
}

function ConfMeter({ value }) {
  const color = value >= 78 ? 'var(--positive)' : value >= 65 ? 'var(--gold)' : 'var(--risk)';
  return (
    <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
      <Gauge value={value} max={100} size={84} stroke={8} color={color} />
    </div>
  );
}

function CtrlBtn({ icon, label, active, danger, onClick }) {
  return (
    <button onClick={onClick} title={label} style={{
      width: 48, height: 48, borderRadius: 12, cursor: 'pointer', position: 'relative',
      border: '1px solid ' + (danger ? 'rgba(240,82,77,0.4)' : 'var(--border-strong)'),
      background: danger ? 'rgba(240,82,77,0.12)' : active ? 'var(--bg-elevated)' : 'var(--bg-panel)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s'
    }}>
      <Icon name={icon} size={19} color={danger ? 'var(--risk)' : active ? 'var(--text-hi)' : 'var(--text-2)'} />
    </button>
  );
}

window.LiveMeeting = LiveMeeting;
