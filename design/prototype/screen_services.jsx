/* English Forms — Contracted services */
function ServicesScreen({ go }) {
  const m = useMgmt();
  const [filter, setFilter] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [toast, setToast] = useState(null);
  const live = m.contracts.filter((c) => c.status !== 'paused');
  const mrr = live.reduce((a, c) => a + c.price, 0);
  const lessons = live.reduce((a, c) => a + c.lessons, 0);
  const used = live.reduce((a, c) => a + c.used, 0);
  const rows = m.contracts.filter((c) => filter === 'all' || c.status === filter);
  const cols = '1.4fr 1.2fr 1.3fr 1.1fr 0.9fr 96px 84px';
  const toggle = (c) => { mgmtUpdate(() => { c.status = c.status === 'paused' ? 'active' : 'paused'; }); setToast(c.status === 'paused' ? 'Contract paused' : 'Contract resumed'); };

  return (
    <>
      <TopBar crumb="Management" title="Contracted Services" sub="Plans, monthly lessons and agreed values"
        right={<button onClick={() => setShowNew(true)} style={primaryBtn}><Icon name="plus" size={15} />New contract</button>} />
      <ScreenScroll>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
          <MetricTile label="Active contracts" value={live.length} unit={`/ ${m.contracts.length}`} />
          <MetricTile label="Monthly revenue" value={fmtBRL(mrr)} />
          <MetricTile label="Lessons contracted / mo" value={lessons} />
          <MetricTile label="Used this month" value={Math.round((used / lessons) * 100)} unit="%" accent="var(--positive)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
          {m.plans.map((p) => {
            const n = m.contracts.filter((c) => c.plan === p.id && c.status !== 'paused').length;
            return (
              <div key={p.id} className="ef-card" style={{ padding: 14, minWidth: 0 }}>
                <div style={{ width: 24, height: 4, borderRadius: 2, background: p.color, marginBottom: 12 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-hi)' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', margin: '3px 0 12px', minHeight: 28 }}>{p.desc}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hi)' }}>{fmtBRL(p.price)}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{p.lessons} lessons/mo</span>
                </div>
                <div style={{ fontSize: 10.5, color: p.color, fontWeight: 600, marginTop: 8 }}>{n} active</div>
              </div>
            );
          })}
        </div>

        <div className="ef-card">
          <div className="ef-card-h">
            <span className="ef-card-title"><Icon name="file" size={14} color="var(--brand-bright)" />Contracts</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['all', 'All'], ['active', 'Active'], ['ending', 'Renewal due'], ['paused', 'Paused']].map(([k, l]) => <button key={k} onClick={() => setFilter(k)} style={{ ...segBtn, ...(filter === k ? segActive : {}) }}>{l}</button>)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14, padding: '9px 16px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-3)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
            <span>Student</span><span>Service</span><span>Lessons this month</span><span>Agreed value</span><span>Renewal</span><span>Status</span><span></span>
          </div>
          {rows.map((c) => {
            const s = studentOf(c.sid), p = planOf(c.plan);
            const disc = Math.round((1 - c.price / p.price) * 100);
            return (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: cols, gap: 14, padding: '12px 16px', alignItems: 'center', borderBottom: '1px solid var(--border)', opacity: c.status === 'paused' ? 0.6 : 1 }}>
                <div onClick={() => go('students')} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, cursor: 'pointer' }}>
                  <Avatar name={s.name} size={28} />
                  <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div><div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{s.company}</div></div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />{p.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}><ProgressTrack value={c.used} max={c.lessons} color={p.color} height={5} showGlow={false} /></div>
                  <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-2)', width: 38, textAlign: 'right' }}>{c.used}/{c.lessons}</span>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-hi)' }}>{fmtBRL(c.price)}<span style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 400 }}>/mo</span></div>
                  <div style={{ fontSize: 10.5, color: disc > 0 ? 'var(--warning)' : 'var(--text-3)' }}>{disc > 0 ? `${disc}% below list` : 'List price'}</div>
                </div>
                <span className="mono" style={{ fontSize: 11.5, color: c.status === 'ending' ? 'var(--warning)' : 'var(--text-2)' }}>{fmtDate(c.renewal)}</span>
                <StatusPill status={c.status} />
                <button onClick={() => toggle(c)} style={{ ...segBtn, justifySelf: 'end' }}>{c.status === 'paused' ? 'Resume' : 'Pause'}</button>
              </div>
            );
          })}
        </div>
      </ScreenScroll>
      {showNew && <NewContractModal onClose={() => setShowNew(false)} onSave={(name) => { setShowNew(false); setToast(`Contract created for ${name}`); }} />}
      <Toast msg={toast} onDone={() => setToast(null)} />
    </>
  );
}

function NewContractModal({ onClose, onSave }) {
  const m = MGMT;
  const [f, setF] = useState({ sid: m.students[0].id, plan: 'exec', lessons: 8, price: 2400, start: '2026-10-19', months: 12 });
  const pickPlan = (id) => { const p = planOf(id); setF({ ...f, plan: id, lessons: p.lessons, price: p.price }); };
  const p = planOf(f.plan);
  const renewal = (() => { const d = new Date(f.start + 'T12:00:00'); d.setMonth(d.getMonth() + Number(f.months)); return d.toISOString().slice(0, 10); })();
  const save = () => {
    mgmtUpdate((mm) => mm.contracts.unshift({ id: 'c' + Date.now(), sid: f.sid, plan: f.plan, lessons: Number(f.lessons), used: 0, price: Number(f.price), start: f.start, renewal, status: 'active' }));
    onSave(studentOf(f.sid).name);
  };
  return (
    <Modal title="New contract" sub="Link a service to a student" onClose={onClose}
      footer={<><button onClick={onClose} style={ghostBtn}>Cancel</button><button onClick={save} style={primaryBtn}><Icon name="check" size={15} />Create contract</button></>}>
      <Field label="Student"><select style={mgInput} value={f.sid} onChange={(e) => setF({ ...f, sid: e.target.value })}>{m.students.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.company}</option>)}</select></Field>
      <Field label="Service">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {m.plans.map((pl) => (
            <button key={pl.id} type="button" onClick={() => pickPlan(pl.id)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 9, cursor: 'pointer', background: f.plan === pl.id ? pl.color + '1a' : 'var(--bg-input)', border: `1px solid ${f.plan === pl.id ? pl.color : 'var(--border)'}`, display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: pl.color, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)' }}>{pl.name}</span><span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{pl.lessons}/mo · {fmtBRL(pl.price)}</span></span>
            </button>
          ))}
        </div>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Lessons per month"><input type="number" min="1" className="mono" style={mgInput} value={f.lessons} onChange={(e) => setF({ ...f, lessons: e.target.value })} /></Field>
        <Field label="Agreed value / month (R$)" hint={Number(f.price) < p.price ? `${Math.round((1 - f.price / p.price) * 100)}% below list price` : 'List price'}><input type="number" className="mono" style={mgInput} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
        <Field label="Start date"><input type="date" style={mgInput} value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></Field>
        <Field label="Term" hint={`Renews ${fmtDate(renewal)}`}><select style={mgInput} value={f.months} onChange={(e) => setF({ ...f, months: e.target.value })}>{[3, 6, 12].map((n) => <option key={n} value={n}>{n} months</option>)}</select></Field>
      </div>
    </Modal>
  );
}

window.ServicesScreen = ServicesScreen;
