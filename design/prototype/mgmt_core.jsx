/* English Forms — management data, shared store, form UI */
Object.assign(ICONS, {
  calendar: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM16 2v4M8 2v4M3 10h18',
  edit: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  briefcase: 'M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M8 13h8M8 17h5',
});

const MGMT = {
  teacher: { name: 'Sofia Reyes', email: 'sofia.reyes@englishforms.com', gcal: { connected: true, lastSync: '2 min ago', meet: true } },
  plans: [
    { id: 'exec', name: 'Executive 1:1', lessons: 8, price: 2400, color: '#3b82f6', desc: 'Private 60-min lessons' },
    { id: 'intensive', name: 'Business Intensive', lessons: 12, price: 3300, color: '#2dd4a7', desc: '3× per week, 60 min' },
    { id: 'sim', name: 'AI Simulator Pro', lessons: 4, price: 1650, color: '#9b8cff', desc: '4 lessons + unlimited simulations' },
    { id: 'ielts', name: 'Exam Prep · IELTS', lessons: 8, price: 2200, color: '#e7b35c', desc: 'Exam-focused coaching' },
    { id: 'group', name: 'Corporate Group', lessons: 4, price: 950, color: '#2dd4d4', desc: 'Up to 6 seats · price per seat' },
  ],
  students: [
    { id: 's1', name: 'Marina Albuquerque', email: 'marina@bancoatlas.com', phone: '+55 11 98412-3307', company: 'Banco Atlas', role: 'VP of Operations', level: 'B2', city: 'São Paulo', since: '2025-03-10', status: 'active', li: { url: 'linkedin.com/in/marinaalbuquerque', connected: true, headline: 'VP of Operations at Banco Atlas · Ex-McKinsey', lastSync: 'Today, 08:12' } },
    { id: 's2', name: 'Carlos Menezes', email: 'carlos.menezes@vinci.com.br', phone: '+55 11 99231-4410', company: 'Vinci Partners', role: 'CFO', level: 'C1', city: 'São Paulo', since: '2024-08-02', status: 'active', li: { url: 'linkedin.com/in/carlosmenezes', connected: true, headline: 'CFO & Partner at Vinci Partners', lastSync: 'Yesterday', pending: { role: 'CFO & Partner' } } },
    { id: 's3', name: 'Aline Ferraz', email: 'aline.ferraz@itau.com.br', phone: '+55 21 99876-1123', company: 'Itaú Unibanco', role: 'Director, Treasury', level: 'C1', city: 'Rio de Janeiro', since: '2025-01-15', status: 'active', li: { url: 'linkedin.com/in/alineferraz', connected: true, headline: 'Director, Treasury at Itaú Unibanco', lastSync: 'Today, 07:40' } },
    { id: 's4', name: 'Rafael Pinto', email: 'rafael.pinto@localiza.com', phone: '+55 31 98455-2290', company: 'Localiza', role: 'Product Manager', level: 'B2', city: 'Belo Horizonte', since: '2025-06-01', status: 'active', li: { url: '', connected: false } },
    { id: 's5', name: 'Bruno Caldas', email: 'bruno.caldas@nubank.com.br', phone: '+55 11 97654-8812', company: 'Nubank', role: 'Engineering Lead', level: 'B1', city: 'São Paulo', since: '2025-02-20', status: 'paused', li: { url: 'linkedin.com/in/brunocaldas', connected: true, headline: 'Engineering Lead at Nubank', lastSync: '12 days ago' } },
    { id: 's6', name: 'Patrícia Lemos', email: 'patricia.lemos@xpi.com.br', phone: '+55 11 98123-6654', company: 'XP Inc.', role: 'Investment Analyst', level: 'B1', city: 'São Paulo', since: '2025-07-08', status: 'active', li: { url: '', connected: false } },
    { id: 's7', name: 'Thiago Rocha', email: 'thiago.rocha@ambev.com.br', phone: '+55 11 99345-7781', company: 'Ambev', role: 'Commercial Director', level: 'B2', city: 'São Paulo', since: '2024-11-11', status: 'active', li: { url: 'linkedin.com/in/thiagorocha', connected: true, headline: 'Commercial Director at Ambev', lastSync: 'Today, 09:02' } },
  ],
  contracts: [
    { id: 'c1', sid: 's1', plan: 'exec', lessons: 8, used: 5, price: 2400, start: '2025-03-10', renewal: '2026-11-10', status: 'active' },
    { id: 'c2', sid: 's1', plan: 'sim', lessons: 4, used: 2, price: 1650, start: '2026-02-01', renewal: '2027-02-01', status: 'active' },
    { id: 'c3', sid: 's2', plan: 'intensive', lessons: 12, used: 9, price: 3300, start: '2024-10-28', renewal: '2026-10-28', status: 'ending' },
    { id: 'c4', sid: 's3', plan: 'exec', lessons: 8, used: 6, price: 2280, start: '2025-01-15', renewal: '2027-01-15', status: 'active' },
    { id: 'c5', sid: 's3', plan: 'ielts', lessons: 8, used: 3, price: 2200, start: '2026-08-01', renewal: '2026-12-01', status: 'active' },
    { id: 'c6', sid: 's4', plan: 'group', lessons: 4, used: 2, price: 950, start: '2025-06-01', renewal: '2026-12-01', status: 'active' },
    { id: 'c7', sid: 's5', plan: 'exec', lessons: 8, used: 0, price: 2400, start: '2025-02-20', renewal: '2027-02-20', status: 'paused' },
    { id: 'c8', sid: 's6', plan: 'group', lessons: 4, used: 1, price: 950, start: '2025-07-08', renewal: '2027-01-08', status: 'active' },
    { id: 'c9', sid: 's7', plan: 'intensive', lessons: 12, used: 7, price: 3150, start: '2024-11-11', renewal: '2026-11-11', status: 'active' },
    { id: 'c10', sid: 's7', plan: 'sim', lessons: 4, used: 3, price: 1500, start: '2026-05-01', renewal: '2026-10-31', status: 'ending' },
  ],
  /* week of Mon Oct 12 2026 · day 0 = Mon */
  events: [
    { id: 'e1', day: 0, start: 8, dur: 1, sid: 's1', cid: 'c1' }, { id: 'e2', day: 0, start: 10, dur: 1, sid: 's2', cid: 'c3' },
    { id: 'e3', day: 0, start: 14, dur: 1, sid: 's3', cid: 'c4' }, { id: 'e4', day: 0, start: 17, dur: 1, sid: 's7', cid: 'c9' },
    { id: 'e5', day: 1, start: 9, dur: 1, sid: 's4', cid: 'c6' }, { id: 'e6', day: 1, start: 11, dur: 1, sid: 's2', cid: 'c3' },
    { id: 'e7', day: 1, start: 15, dur: 1.5, sid: 's3', cid: 'c5' }, { id: 'e8', day: 1, start: 18, dur: 1, sid: 's6', cid: 'c8' },
    { id: 'e9', day: 2, start: 8, dur: 1, sid: 's1', cid: 'c1' }, { id: 'e10', day: 2, start: 10, dur: 1, sid: 's2', cid: 'c3' },
    { id: 'e11', day: 2, start: 13, dur: 0.75, sid: 's7', cid: 'c10' }, { id: 'e12', day: 2, start: 16.5, dur: 1, sid: 's3', cid: 'c4' },
    { id: 'e13', day: 3, start: 9, dur: 1, sid: 's1', cid: 'c2' }, { id: 'e14', day: 3, start: 11, dur: 1, sid: 's7', cid: 'c9' },
    { id: 'e15', day: 3, start: 12.5, dur: 1, sid: null, cid: null, gtitle: 'Call with Thiago — contract', unlinked: true },
    { id: 'e16', day: 4, start: 8, dur: 1, sid: 's1', cid: 'c1' }, { id: 'e17', day: 4, start: 10.5, dur: 1.5, sid: 's3', cid: 'c5' },
    { id: 'e18', day: 4, start: 14, dur: 1, sid: 's7', cid: 'c9' }, { id: 'e19', day: 4, start: 16, dur: 1, sid: 's4', cid: 'c6' },
    { id: 'e20', day: 5, start: 10, dur: 1, sid: 's6', cid: 'c8' },
  ],
};

const mgmtSubs = new Set();
function useMgmt() {
  const [, f] = useState(0);
  useEffect(() => { const s = () => f((x) => x + 1); mgmtSubs.add(s); return () => mgmtSubs.delete(s); }, []);
  return MGMT;
}
function mgmtUpdate(fn) { fn(MGMT); mgmtSubs.forEach((s) => s()); }

const fmtBRL = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
const planOf = (id) => MGMT.plans.find((p) => p.id === id);
const studentOf = (id) => MGMT.students.find((s) => s.id === id);
const contractOf = (id) => MGMT.contracts.find((c) => c.id === id);
const activeContracts = (sid) => MGMT.contracts.filter((c) => c.sid === sid && c.status !== 'paused');
const waLink = (s, msg) => `https://wa.me/${s.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg || `Hi ${s.name.split(' ')[0]}, `)}`;
const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtHour = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

const STATUS_PILL = { active: ['pos', 'Active'], paused: ['', 'Paused'], ending: ['warn', 'Renewal due'] };
function StatusPill({ status }) {
  const [cls, label] = STATUS_PILL[status] || ['', status];
  return <span className={'ef-pill ' + cls} style={{ fontSize: 10, padding: '2px 8px', color: cls ? undefined : 'var(--text-2)' }}>{label}</span>;
}

function LinkedInMark({ size = 18 }) {
  return <span style={{ width: size, height: size, borderRadius: 4, background: '#0a66c2', color: '#fff', fontSize: size * 0.58, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', flexShrink: 0 }}>in</span>;
}
function WaButton({ s, label, msg, small }) {
  return (
    <a href={waLink(s, msg)} target="_blank" rel="noopener" title={`WhatsApp ${s.phone}`} onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: small ? 28 : 36, minWidth: small ? 28 : 0, padding: label ? '0 13px' : 0, borderRadius: 8, background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.35)', color: '#4ade80', fontSize: 12.5, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
      <Icon name="message" size={small ? 14 : 15} color="#4ade80" />{label}
    </a>
  );
}

function Modal({ title, sub, onClose, children, footer, width = 520 }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(4,6,12,0.72)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'ef-fade .15s both' }}>
      <div onClick={(e) => e.stopPropagation()} className="ef-card" style={{ width, maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)', animation: 'ef-fade-up .2s both' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-hi)' }}>{title}</div>{sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{sub}</div>}</div>
          <button onClick={onClose} style={{ ...iconBtnStyle, width: 30, height: 30 }}><Icon name="x" size={15} color="var(--text-2)" /></button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
        {footer && <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>}
      </div>
    </div>
  );
}
function Field({ label, children, hint, span }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: span ? '1 / -1' : undefined, minWidth: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.02em' }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{hint}</span>}
    </label>
  );
}
const mgInput = { width: '100%', height: 38, background: 'var(--bg-input)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '0 11px', color: 'var(--text-hi)', fontSize: 13, fontFamily: 'var(--font-sans)', colorScheme: 'dark' };
function Toggle({ on, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!on)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text)', fontSize: 12.5, textAlign: 'left' }}>
      <span style={{ width: 32, height: 18, borderRadius: 999, background: on ? 'var(--brand)' : 'var(--bg-elevated)', border: '1px solid var(--border-strong)', position: 'relative', transition: 'background .15s', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 15 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
      </span>{label}
    </button>
  );
}
function Toast({ msg, onDone }) {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [msg]);
  if (!msg) return null;
  return <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 300, background: 'var(--bg-elevated)', border: '1px solid rgba(45,212,167,0.35)', borderRadius: 10, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--text-hi)', boxShadow: '0 12px 30px -10px rgba(0,0,0,0.8)', animation: 'ef-fade-up .25s both' }}><Icon name="checkCircle" size={16} color="var(--positive)" />{msg}</div>;
}
function SpinIcon({ on, name = 'refresh', size = 14, color }) {
  return <span style={{ display: 'inline-flex', animation: on ? 'ef-spin .8s linear infinite' : 'none' }}><Icon name={name} size={size} color={color} /><style>{'@keyframes ef-spin{to{transform:rotate(360deg)}}'}</style></span>;
}

Object.assign(window, { MGMT, useMgmt, mgmtUpdate, fmtBRL, planOf, studentOf, contractOf, activeContracts, waLink, fmtDate, fmtHour, StatusPill, LinkedInMark, WaButton, Modal, Field, mgInput, Toggle, Toast, SpinIcon });
