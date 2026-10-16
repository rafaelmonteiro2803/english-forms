/* ============================================================
   English Forms — app root + router + tweaks
   ============================================================ */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "brand": "#3b82f6",
  "positive": "#2dd4a7",
  "density": "regular",
  "radius": 14,
  "uiFont": "Inter",
  "grid": true
}/*EDITMODE-END*/;

const BRIGHTEN = (hex, amt = 28) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt), g = Math.min(255, ((n >> 8) & 255) + amt), b = Math.min(255, (n & 255) + amt);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

function applyTweaks(t) {
  const r = document.documentElement.style;
  r.setProperty('--brand', t.brand);
  r.setProperty('--brand-bright', BRIGHTEN(t.brand, 34));
  r.setProperty('--border-accent', t.brand + '59');
  r.setProperty('--positive', t.positive);
  r.setProperty('--density', t.density === 'compact' ? '0.82' : t.density === 'comfy' ? '1.16' : '1');
  r.setProperty('--r-lg', t.radius + 'px');
  r.setProperty('--font-sans', `'${t.uiFont}', 'IBM Plex Sans', system-ui, sans-serif`);
}

function Placeholder({ title }) {
  return (
    <>
      <TopBar crumb="English Forms" title={title} />
      <ScreenScroll>
        <div className="ef-card grid-bg" style={{ height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-3)' }}>
          <Icon name="layers" size={32} color="var(--text-dim)" />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>{title}</div>
          <div style={{ fontSize: 12 }}>Screen under construction</div>
        </div>
      </ScreenScroll>
    </>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState('login');
  const go = (s) => setScreen(s);
  useEffect(() => { applyTweaks(t); }, [t]);

  const panel = (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Brand" />
      <TweakColor label="Primary" value={t.brand} options={['#3b82f6', '#6366f1', '#2dd4d4', '#8b5cf6', '#0ea5e9']} onChange={(v) => setTweak('brand', v)} />
      <TweakColor label="Positive" value={t.positive} options={['#2dd4a7', '#22c55e', '#84cc16', '#10b981']} onChange={(v) => setTweak('positive', v)} />
      <TweakSection label="Layout" />
      <TweakRadio label="Density" value={t.density} options={['compact', 'regular', 'comfy']} onChange={(v) => setTweak('density', v)} />
      <TweakSlider label="Corner radius" value={t.radius} min={4} max={22} unit="px" onChange={(v) => setTweak('radius', v)} />
      <TweakSection label="Typography" />
      <TweakSelect label="UI font" value={t.uiFont} options={['Inter', 'IBM Plex Sans']} onChange={(v) => setTweak('uiFont', v)} />
    </TweaksPanel>
  );

  if (screen === 'login') return <>{panel}<LoginScreen onEnter={() => setScreen('dashboard')} /></>;

  const Screen = ({
    dashboard: window.DashboardScreen,
    simulator: window.SimulatorScreen,
    class: window.ClassScreen,
    report: window.ReportScreen,
    proficiency: window.ProficiencyScreen,
    teacher: window.TeacherScreen,
    admin: window.AdminScreen,
    students: window.StudentsScreen,
    services: window.ServicesScreen,
    calendar: window.CalendarScreen,
  })[screen];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {panel}
      <Sidebar current={screen} go={go} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        {Screen ? <Screen go={go} /> : <Placeholder title={NAV.find((n) => n.id === screen)?.label || screen} />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
