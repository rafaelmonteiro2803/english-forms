/* English Forms — Student management */
function StudentsScreen({ go }) {
  const m = useMgmt();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [sel, setSel] = useState(m.students[0].id);
  const [showNew, setShowNew] = useState(false);
  const [toast, setToast] = useState(null);
  const list = m.students.filter((s) => (filter === 'all' || s.status === filter) && (s.name + s.company + s.email).toLowerCase().includes(q.toLowerCase()));
  const s = studentOf(sel) || m.students[0];
  const cols = '1.6fr 1.3fr 56px 1fr 74px 40px';

  return (
    <>
      <TopBar crumb="Management" title="Students" sub={`${m.students.length} enrolled · ${m.students.filter((x) => x.status === 'active').length} active`}
        right={<button onClick={() => setShowNew(true)} style={primaryBtn}><Icon name="plus" size={15} />New student</button>} />
      <ScreenScroll>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 16, alignItems: 'start' }}>
          <div className="ef-card">
            <div className="ef-card-h" style={{ gap: 12 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                <Icon name="search" size={14} color="var(--text-3)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, company, email" style={{ ...mgInput, height: 32, paddingLeft: 31, fontSize: 12.5 }} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['all', 'All'], ['active', 'Active'], ['paused', 'Paused']].map(([k, l]) => <button key={k} onClick={() => setFilter(k)} style={{ ...segBtn, ...(filter === k ? segActive : {}) }}>{l}</button>)}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, padding: '9px 16px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-3)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
              <span>Student</span><span>Company · Role</span><span>Level</span><span>Services</span><span>LinkedIn</span><span></span>
            </div>
            {list.map((st) => {
              const on = st.id === s.id;
              return (
                <div key={st.id} onClick={() => setSel(st.id)} style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, padding: '11px 16px', alignItems: 'center', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: on ? 'rgba(59,130,246,0.08)' : 'transparent', boxShadow: on ? 'inset 2px 0 0 var(--brand)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <Avatar name={st.name} size={32} status={st.status === 'active' ? 'live' : 'away'} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.name}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.email}</div>
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.company}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.role}</div>
                  </div>
                  <span className="ef-pill" style={{ fontSize: 10, color: 'var(--text-2)', justifySelf: 'start' }}>{st.level}</span>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {m.contracts.filter((c) => c.sid === st.id).map((c) => { const p = planOf(c.plan); return <span key={c.id} title={p.name} style={{ fontSize: 10, fontWeight: 600, color: p.color, background: p.color + '1a', border: `1px solid ${p.color}40`, padding: '1px 6px', borderRadius: 5, opacity: c.status === 'paused' ? 0.5 : 1 }}>{p.name.split(' ')[0]}</span>; })}
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: st.li.connected ? 'var(--text-2)' : 'var(--text-3)' }}>
                    <span style={{ opacity: st.li.connected ? 1 : 0.35, display: 'flex' }}><LinkedInMark size={16} /></span>
                    {st.li.pending ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warning)' }} title="Profile update available" /> : st.li.connected ? 'Synced' : 'Off'}
                  </span>
                  <WaButton s={st} small />
                </div>
              );
            })}
            {list.length === 0 && <div style={{ padding: 32, textAlign: 'center', fontSize: 12.5, color: 'var(--text-3)' }}>No students match this search.</div>}
          </div>
          <StudentDetail s={s} go={go} onToast={setToast} />
        </div>
      </ScreenScroll>
      {showNew && <NewStudentModal onClose={() => setShowNew(false)} onSave={(st) => { setSel(st.id); setShowNew(false); setToast(`${st.name} added`); }} />}
      <Toast msg={toast} onDone={() => setToast(null)} />
    </>
  );
}

function StudentDetail({ s, go, onToast }) {
  const m = useMgmt();
  const [busy, setBusy] = useState(false);
  const contracts = m.contracts.filter((c) => c.sid === s.id);
  const dayNames = ['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16', 'Sat 17', 'Sun 18'];
  const upcoming = m.events.filter((e) => e.sid === s.id && e.day >= 4).sort((a, b) => a.day - b.day || a.start - b.start);
  const syncLi = (connect) => {
    setBusy(true);
    setTimeout(() => {
      mgmtUpdate(() => {
        s.li.connected = true; s.li.lastSync = 'Just now';
        if (connect) { s.li.url = 'linkedin.com/in/' + s.name.toLowerCase().normalize('NFD').replace(/[^a-z]/g, ''); s.li.headline = `${s.role} at ${s.company}`; }
      });
      setBusy(false); onToast(connect ? 'LinkedIn connected' : 'Profile synced from LinkedIn');
    }, 1100);
  };
  const applyPending = () => { mgmtUpdate(() => { s.role = s.li.pending.role; delete s.li.pending; }); onToast('Role updated from LinkedIn'); };
  const lbl = { fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 10 };

  return (
    <div className="ef-card" style={{ position: 'sticky', top: 0 }}>
      <div style={{ padding: 18, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
          <Avatar name={s.name} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-hi)' }}>{s.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{s.role} · {s.company}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}><StatusPill status={s.status} /><span className="ef-pill brand" style={{ fontSize: 10, padding: '2px 8px' }}>Level {s.level}</span></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <WaButton s={s} label="WhatsApp" />
          <a href={`mailto:${s.email}`} style={{ ...ghostBtn, textDecoration: 'none' }}><Icon name="mail" size={14} color="var(--text-2)" />Email</a>
          <button onClick={() => go('calendar')} style={ghostBtn}><Icon name="calendar" size={14} color="var(--text-2)" />Schedule</button>
        </div>
      </div>

      <div style={{ padding: 18, borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
        {[['WhatsApp', s.phone], ['Email', s.email], ['City', s.city], ['Student since', fmtDate(s.since)]].map(([k, v]) => (
          <div key={k} style={{ minWidth: 0 }}><div style={{ fontSize: 10.5, color: 'var(--text-3)', marginBottom: 3 }}>{k}</div><div style={{ fontSize: 12.5, color: 'var(--text-hi)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className={k === 'WhatsApp' ? 'mono' : ''}>{v}</div></div>
        ))}
      </div>

      <div style={{ padding: 18, borderBottom: '1px solid var(--border)' }}>
        <div style={{ ...lbl, display: 'flex', alignItems: 'center', gap: 8 }}><LinkedInMark size={15} />LinkedIn profile</div>
        {s.li.connected ? (
          <>
            <div style={{ fontSize: 12.5, color: 'var(--text-hi)', lineHeight: 1.45 }}>{s.li.headline}</div>
            <a href={'https://' + s.li.url} target="_blank" rel="noopener" style={{ fontSize: 11.5, color: 'var(--brand-bright)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4 }}><Icon name="link" size={12} />{s.li.url}</a>
            {s.li.pending && (
              <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 9, background: 'rgba(245,185,66,0.08)', border: '1px solid rgba(245,185,66,0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="alert" size={15} color="var(--warning)" />
                <div style={{ flex: 1, fontSize: 11.5, color: 'var(--text)' }}>New role on LinkedIn: <b style={{ color: 'var(--text-hi)' }}>{s.li.pending.role}</b></div>
                <button onClick={applyPending} style={{ ...segBtn, color: 'var(--warning)', borderColor: 'rgba(245,185,66,0.4)' }}>Apply</button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Last synced: {s.li.lastSync}</span>
              <button onClick={() => syncLi(false)} disabled={busy} style={segBtn}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><SpinIcon on={busy} size={12} />Sync now</span></button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 12 }}>Connect to keep role, company and photo updated automatically.</div>
            <button onClick={() => syncLi(true)} disabled={busy} style={{ ...ghostBtn, width: '100%', justifyContent: 'center', borderColor: 'rgba(10,102,194,0.5)', background: 'rgba(10,102,194,0.12)' }}>{busy ? <SpinIcon on size={14} /> : <LinkedInMark size={16} />}Connect LinkedIn</button>
          </>
        )}
      </div>

      <div style={{ padding: 18, borderBottom: '1px solid var(--border)' }}>
        <div style={{ ...lbl, display: 'flex', justifyContent: 'space-between' }}>Contracted services<button onClick={() => go('services')} style={{ background: 'none', border: 'none', color: 'var(--brand-bright)', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0, textTransform: 'none', letterSpacing: 0 }}>Manage</button></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {contracts.map((c) => { const p = planOf(c.plan); return (
            <div key={c.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)', display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />{p.name}</span>
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{fmtBRL(c.price)}/mo</span>
              </div>
              <ProgressTrack value={c.used} max={c.lessons} color={p.color} height={5} showGlow={false} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10.5, color: 'var(--text-3)' }}><span>{c.used} of {c.lessons} lessons this month</span><StatusPill status={c.status} /></div>
            </div>
          ); })}
          {contracts.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No services yet.</div>}
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div style={lbl}>Next lessons</div>
        {upcoming.length ? upcoming.slice(0, 3).map((e) => { const p = planOf(contractOf(e.cid).plan); return (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-2)', width: 92 }}>{dayNames[e.day]} · {fmtHour(e.start)}</span>
            <span style={{ fontSize: 12, color: 'var(--text)', flex: 1 }}>{p.name}</span>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          </div>
        ); }) : <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Nothing scheduled this week.</div>}
      </div>
    </div>
  );
}

function NewStudentModal({ onClose, onSave }) {
  const [f, setF] = useState({ name: '', email: '', phone: '+55 ', company: '', role: '', level: 'B1', li: '', since: '2026-10-16', city: '', syncLi: true });
  const set = (k) => (e) => setF({ ...f, [k]: e.target ? e.target.value : e });
  const ok = f.name.trim() && f.email.includes('@') && f.phone.replace(/\D/g, '').length >= 12;
  const save = () => {
    const st = { id: 's' + Date.now(), name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), company: f.company || '—', role: f.role || '—', level: f.level, city: f.city || '—', since: f.since, status: 'active', li: f.li && f.syncLi ? { url: f.li.replace(/^https?:\/\/(www\.)?/, ''), connected: true, headline: `${f.role || 'Professional'} at ${f.company || '—'}`, lastSync: 'Just now' } : { url: f.li, connected: false } };
    mgmtUpdate((m) => m.students.unshift(st));
    onSave(st);
  };
  return (
    <Modal title="New student" sub="Core registration data. Services can be added next." onClose={onClose} width={580}
      footer={<><button onClick={onClose} style={ghostBtn}>Cancel</button><button onClick={save} disabled={!ok} style={{ ...primaryBtn, opacity: ok ? 1 : 0.45, cursor: ok ? 'pointer' : 'not-allowed' }}><Icon name="check" size={15} />Create student</button></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Full name *" span><input style={mgInput} value={f.name} onChange={set('name')} placeholder="e.g. Juliana Martins" /></Field>
        <Field label="Work email *"><input style={mgInput} value={f.email} onChange={set('email')} placeholder="name@company.com" /></Field>
        <Field label="WhatsApp *" hint="Country + area code"><input className="mono" style={mgInput} value={f.phone} onChange={set('phone')} /></Field>
        <Field label="Company"><input style={mgInput} value={f.company} onChange={set('company')} /></Field>
        <Field label="Role"><input style={mgInput} value={f.role} onChange={set('role')} /></Field>
        <Field label="CEFR level"><select style={mgInput} value={f.level} onChange={set('level')}>{['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => <option key={l}>{l}</option>)}</select></Field>
        <Field label="Start date"><input type="date" style={mgInput} value={f.since} onChange={set('since')} /></Field>
        <Field label="City"><input style={mgInput} value={f.city} onChange={set('city')} /></Field>
        <Field label="LinkedIn profile URL"><input style={mgInput} value={f.li} onChange={set('li')} placeholder="linkedin.com/in/…" /></Field>
      </div>
      <Toggle on={f.syncLi} onChange={(v) => setF({ ...f, syncLi: v })} label="Keep profile synced with LinkedIn" />
    </Modal>
  );
}

window.StudentsScreen = StudentsScreen;
