/* ============================================================
   English Forms — Login screen
   ============================================================ */
function LoginScreen({ onEnter }) {
  const [email, setEmail] = useState('marina@bancoatlas.com');
  const [pw, setPw] = useState('••••••••••');
  const [loading, setLoading] = useState(false);
  const submit = () => { setLoading(true); setTimeout(onEnter, 850); };

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1.05fr', background: 'var(--bg-base)' }}>
      {/* LEFT — form */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(40px, 7vw, 100px)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 36, left: 'clamp(40px,7vw,100px)' }}><Logo /></div>
        <div style={{ maxWidth: 380, width: '100%', animation: 'ef-fade-up .6s both' }}>
          <div className="ef-pill brand" style={{ marginBottom: 20 }}><span className="live-dot" style={{ background: 'var(--brand)', width: 6, height: 6 }} />Enterprise Edition</div>
          <h1 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 800, color: 'var(--text-hi)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Sign in to your<br />performance terminal</h1>
          <p style={{ margin: '0 0 28px', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5 }}>Track proficiency, run AI meeting simulations, and turn every conversation into measurable progress.</p>

          <label style={lblStyle}>Work email</label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Icon name="mail" size={16} color="var(--text-3)" style={inIcon} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={inStyle} />
          </div>
          <label style={lblStyle}>Password</label>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Icon name="lock" size={16} color="var(--text-3)" style={inIcon} />
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} style={inStyle} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
              <span style={{ width: 15, height: 15, borderRadius: 4, border: '1px solid var(--border-strong)', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={11} color="#fff" strokeWidth={3} /></span>
              Keep me signed in
            </label>
            <a style={{ fontSize: 12, color: 'var(--brand-bright)', fontWeight: 600, cursor: 'pointer' }}>Forgot password?</a>
          </div>

          <button onClick={submit} disabled={loading} style={{ width: '100%', height: 46, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(180deg, var(--brand-bright), var(--brand))', color: '#fff', fontSize: 14, fontWeight: 700, boxShadow: '0 10px 26px -10px rgba(59,130,246,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <span style={{ display: 'flex', gap: 4 }}><Dot /><Dot d={0.15} /><Dot d={0.3} /></span> : <>Sign in to terminal <Icon name="arrowR" size={16} /></>}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button onClick={submit} style={ssoStyle}><MsLogo />Microsoft</button>
            <button onClick={submit} style={ssoStyle}><GLogo />Google</button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 24, textAlign: 'center' }}>SOC 2 Type II · ISO 27001 · Single Sign-On ready</p>
        </div>
      </div>

      {/* RIGHT — hero */}
      <div className="grid-bg" style={{ position: 'relative', overflow: 'hidden', borderLeft: '1px solid var(--border)', background: 'radial-gradient(120% 90% at 80% 10%, rgba(59,130,246,0.18), transparent 55%), radial-gradient(100% 80% at 20% 100%, rgba(45,212,167,0.12), transparent 55%), var(--bg-deep)' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 40 }}>
          {/* floating live panel */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div className="ef-card" style={{ width: 250, padding: 16, animation: 'ef-fade-up .7s .2s both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-2)' }}>PERFORMANCE SCORE</span>
                <span className="ef-pill pos" style={{ padding: '2px 7px' }}><Icon name="arrowUp" size={10} />+208</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span className="mono" style={{ fontSize: 34, fontWeight: 700, color: 'var(--text-hi)' }}>820</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>/ 1000 · B2→C1</span>
              </div>
              <LineChart data={DATA.perf12m} width={216} height={56} color="var(--positive)" />
            </div>
          </div>

          {/* center quote */}
          <div style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>{DATA.avatars.map((a) => <Avatar key={a.name} name={a.name} size={38} color={a.color} ring />)}</div>
            <h2 style={{ margin: '0 0 14px', fontSize: 34, fontWeight: 800, color: 'var(--text-hi)', letterSpacing: '-0.02em', lineHeight: 1.12 }}>Transform every<br />conversation into<br /><span style={{ background: 'linear-gradient(90deg, var(--brand-bright), var(--positive))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>measurable evolution.</span></h2>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>Rehearse board meetings, negotiations, and investor pitches with AI executives. Get instant, scored feedback on fluency, grammar, and business communication.</p>
          </div>

          {/* bottom stats */}
          <div style={{ display: 'flex', gap: 28 }}>
            {[['12,400+', 'Executives trained'], ['9 scenarios', 'C-suite simulations'], ['+34%', 'Avg. fluency gain']].map(([v, l]) => (
              <div key={l}>
                <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-hi)' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot({ d = 0 }) { return <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: `ef-pulse 1s ${d}s infinite` }} />; }
const lblStyle = { display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7, letterSpacing: '0.02em' };
const inStyle = { width: '100%', height: 44, background: 'var(--bg-input)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '0 14px 0 40px', color: 'var(--text-hi)', fontSize: 13.5, fontFamily: 'var(--font-sans)' };
const inIcon = { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' };
const ssoStyle = { height: 44, borderRadius: 10, border: '1px solid var(--border-strong)', background: 'var(--bg-panel)', color: 'var(--text-hi)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 };

function MsLogo() { return <svg width="16" height="16" viewBox="0 0 16 16"><rect x="0" y="0" width="7.2" height="7.2" fill="#f25022" /><rect x="8.8" y="0" width="7.2" height="7.2" fill="#7fba00" /><rect x="0" y="8.8" width="7.2" height="7.2" fill="#00a4ef" /><rect x="8.8" y="8.8" width="7.2" height="7.2" fill="#ffb900" /></svg>; }
function GLogo() { return <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-3.9H24v7.1h11.8c-.2 1.9-1.5 4.7-4.3 6.6l6.6 5.1C42 35.3 45 30.1 45 24z" /><path fill="#34A853" d="M24 46c5.8 0 10.6-1.9 14.1-5.2l-6.6-5.1c-1.8 1.2-4.2 2.1-7.5 2.1-5.7 0-10.6-3.9-12.3-9.1l-6.8 5.3C8.1 41 15.4 46 24 46z" /><path fill="#FBBC05" d="M11.7 28.7c-.5-1.3-.7-2.7-.7-4.7s.3-3.4.7-4.7l-6.8-5.3C3.6 17 3 20.4 3 24s.6 7 1.9 10l6.8-5.3z" /><path fill="#EA4335" d="M24 10.8c3.2 0 5.4 1.4 6.6 2.5l5.9-5.7C32.9 4.1 28.1 2 24 2 15.4 2 8.1 7 4.9 14l6.8 5.3c1.7-5.2 6.6-8.5 12.3-8.5z" /></svg>; }

window.LoginScreen = LoginScreen;
