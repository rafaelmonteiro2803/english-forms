/* English Forms — Google Calendar integrated schedule */
const CAL_START = 7, CAL_END = 21, CAL_ROW = 50;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function GCalMark({ size = 30 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 7, background: '#fff', position: 'relative', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: '#4285f4' }} />
      <span style={{ fontSize: size * 0.42, fontWeight: 800, color: '#1a73e8', fontFamily: 'Arial, sans-serif', lineHeight: 1, marginBottom: size * 0.12 }}>31</span>
    </div>
  );
}

function CalendarScreen({ go }) {
  const m = useMgmt();
  const [week, setWeek] = useState(0);
  const [hidden, setHidden] = useState([]);
  const [open, setOpen] = useState(null);
  const [newSlot, setNewSlot] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const g = m.teacher.gcal;
  const base = new Date('2026-10-12T12:00:00'); base.setDate(base.getDate() + week * 7);
  const dates = DAYS.map((_, i) => { const d = new Date(base); d.setDate(d.getDate() + i); return d; });
  const label = `${dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${dates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const evs = week === 0 ? m.events.filter((e) => e.unlinked || !hidden.includes(contractOf(e.cid).plan)) : [];
  const unlinked = week === 0 ? m.events.filter((e) => e.unlinked) : [];
  const hours = Array.from({ length: CAL_END - CAL_START }, (_, i) => CAL_START + i);
  const sync = () => { setSyncing(true); setTimeout(() => { mgmtUpdate(() => { g.lastSync = 'Just now'; }); setSyncing(false); setToast('Google Calendar synced'); }, 1100); };
  const lbl = { fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 10 };

  return (
    <>
      <TopBar crumb="Management" title="Calendar" sub={`Google Calendar · ${m.teacher.email}`}
        right={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setWeek(week - 1)} style={{ ...iconBtnStyle }}><Icon name="chevL" size={16} color="var(--text-2)" /></button>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-hi)', minWidth: 150, textAlign: 'center' }}>{label}</span>
          <button onClick={() => setWeek(week + 1)} style={{ ...iconBtnStyle }}><Icon name="chevR" size={16} color="var(--text-2)" /></button>
          <button onClick={() => setWeek(0)} style={ghostBtn}>Today</button>
          <button onClick={() => setNewSlot({ day: 4, start: 15 })} style={primaryBtn}><Icon name="plus" size={15} />New lesson</button>
        </div>} />
      <ScreenScroll>
        <div style={{ display: 'grid', gridTemplateColumns: '256px minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="ef-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
                <GCalMark />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-hi)' }}>Google Calendar</div>
                  <div style={{ fontSize: 11, color: 'var(--positive)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--positive)' }} />Connected</div>
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.teacher.email}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 14 }}>Two-way sync · last {g.lastSync}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                <Toggle on={g.meet} onChange={(v) => mgmtUpdate(() => { g.meet = v; })} label="Add Google Meet links" />
              </div>
              <button onClick={sync} disabled={syncing} style={{ ...ghostBtn, width: '100%', justifyContent: 'center' }}><SpinIcon on={syncing} size={14} color="var(--text-2)" />Sync now</button>
            </div>

            {unlinked.length > 0 && (
              <div className="ef-card" style={{ padding: 16, borderColor: 'rgba(245,185,66,0.3)' }}>
                <div style={{ ...lbl, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="alert" size={13} color="var(--warning)" />Needs linking</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.45, marginBottom: 10 }}>Created directly in Google. Link a student and active service to count it as a lesson.</div>
                {unlinked.map((e) => (
                  <button key={e.id} onClick={() => setOpen(e)} style={{ width: '100%', textAlign: 'left', background: 'var(--bg-input)', border: '1px dashed rgba(245,185,66,0.45)', borderRadius: 8, padding: '9px 11px', cursor: 'pointer' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-hi)' }}>{e.gtitle}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2 }}>{DAYS[e.day]} {dates[e.day].getDate()} · {fmtHour(e.start)}</div>
                  </button>
                ))}
              </div>
            )}

            <div className="ef-card" style={{ padding: 16 }}>
              <div style={lbl}>Services</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {m.plans.map((p) => { const on = !hidden.includes(p.id); return (
                  <button key={p.id} onClick={() => setHidden(on ? [...hidden, p.id] : hidden.filter((x) => x !== p.id))} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${p.color}`, background: on ? p.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={10} color="#0a0e1a" strokeWidth={3.5} />}</span>
                    <span style={{ fontSize: 12, color: on ? 'var(--text)' : 'var(--text-3)', flex: 1 }}>{p.name}</span>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{week === 0 ? m.events.filter((e) => e.cid && contractOf(e.cid).plan === p.id).length : 0}</span>
                  </button>
                ); })}
              </div>
            </div>
          </div>

          <div className="ef-card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '54px repeat(7, minmax(0,1fr))', borderBottom: '1px solid var(--border)' }}>
              <div />
              {dates.map((d, i) => { const today = week === 0 && i === 4; return (
                <div key={i} style={{ padding: '10px 8px', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', color: today ? 'var(--brand-bright)' : 'var(--text-3)', textTransform: 'uppercase' }}>{DAYS[i]}</div>
                  <div className="mono" style={{ fontSize: 17, fontWeight: 700, marginTop: 3, color: today ? '#fff' : 'var(--text-hi)', width: 30, height: 30, lineHeight: '30px', borderRadius: '50%', margin: '3px auto 0', background: today ? 'var(--brand)' : 'transparent' }}>{d.getDate()}</div>
                </div>
              ); })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '54px repeat(7, minmax(0,1fr))', position: 'relative' }}>
              <div>{hours.map((h) => <div key={h} className="mono" style={{ height: CAL_ROW, fontSize: 10, color: 'var(--text-3)', textAlign: 'right', paddingRight: 8, transform: 'translateY(-6px)' }}>{h > CAL_START ? fmtHour(h) : ''}</div>)}</div>
              {DAYS.map((_, di) => (
                <div key={di} style={{ position: 'relative', borderLeft: '1px solid var(--border)', background: week === 0 && di === 4 ? 'rgba(59,130,246,0.03)' : di >= 5 ? 'rgba(255,255,255,0.012)' : 'transparent' }}>
                  {hours.map((h) => <div key={h} onClick={() => setNewSlot({ day: di, start: h })} style={{ height: CAL_ROW, borderTop: h > CAL_START ? '1px solid var(--border)' : 'none', cursor: 'copy' }} />)}
                  {evs.filter((e) => e.day === di).map((e) => <CalEvent key={e.id} e={e} onClick={() => setOpen(e)} />)}
                  {week === 0 && di === 4 && <div style={{ position: 'absolute', left: -1, right: 0, top: (11.33 - CAL_START) * CAL_ROW, height: 2, background: 'var(--risk)', zIndex: 3, pointerEvents: 'none' }}><span style={{ position: 'absolute', left: -4, top: -3, width: 8, height: 8, borderRadius: '50%', background: 'var(--risk)' }} /></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScreenScroll>
      {open && <EventModal e={open} dates={dates} go={go} onClose={() => setOpen(null)} onToast={setToast} />}
      {newSlot && <LessonModal slot={newSlot} dates={dates} onClose={() => setNewSlot(null)} onSave={(msg) => { setNewSlot(null); setToast(msg); }} />}
      <Toast msg={toast} onDone={() => setToast(null)} />
    </>
  );
}

function CalEvent({ e, onClick }) {
  const top = (e.start - CAL_START) * CAL_ROW + 2, h = e.dur * CAL_ROW - 4;
  if (e.unlinked) return (
    <div onClick={onClick} style={{ position: 'absolute', top, left: 4, right: 4, height: h, borderRadius: 7, border: '1px dashed rgba(245,185,66,0.6)', background: 'rgba(245,185,66,0.07)', padding: '5px 7px', cursor: 'pointer', overflow: 'hidden', zIndex: 2 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--warning)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.gtitle}</div>
      <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Not linked</div>
    </div>
  );
  const s = studentOf(e.sid), p = planOf(contractOf(e.cid).plan);
  return (
    <div onClick={onClick} style={{ position: 'absolute', top, left: 4, right: 4, height: h, borderRadius: 7, background: p.color + '22', border: `1px solid ${p.color}55`, padding: '5px 7px', cursor: 'pointer', overflow: 'hidden', zIndex: 2 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-hi)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name.split(' ')[0]} {s.name.split(' ').slice(-1)[0][0]}.</div>
      <div style={{ fontSize: 10, color: p.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
      {e.dur >= 1 && <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', marginTop: 1 }}>{fmtHour(e.start)}–{fmtHour(e.start + e.dur)}</div>}
    </div>
  );
}

function EventModal({ e, dates, go, onClose, onToast }) {
  if (e.unlinked) return <LessonModal slot={{ day: e.day, start: e.start, dur: e.dur, link: e }} dates={dates} onClose={onClose} onSave={(msg) => { onClose(); onToast(msg); }} />;
  const s = studentOf(e.sid), c = contractOf(e.cid), p = planOf(c.plan);
  const d = dates[e.day];
  const when = `${d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · ${fmtHour(e.start)}–${fmtHour(e.start + e.dur)}`;
  const cancel = () => { mgmtUpdate((m) => { m.events = m.events.filter((x) => x.id !== e.id); }); onClose(); onToast('Lesson cancelled · removed from Google Calendar'); };
  return (
    <Modal title={p.name} sub={when} onClose={onClose} width={460}
      footer={<><button onClick={cancel} style={{ ...ghostBtn, color: 'var(--risk)', borderColor: 'rgba(240,82,77,0.35)', marginRight: 'auto' }}>Cancel lesson</button><button onClick={() => go('students')} style={ghostBtn}>Open student</button><button onClick={() => go('class')} style={primaryBtn}><Icon name="video" size={15} />Start class</button></>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name={s.name} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hi)' }}>{s.name}</div><div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{s.role} · {s.company}</div></div>
        <WaButton s={s} small msg={`Hi ${s.name.split(' ')[0]}, reminder: our lesson is ${when}.`} />
      </div>
      <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />{p.name}</span><StatusPill status={c.status} /></div>
        <ProgressTrack value={c.used} max={c.lessons} color={p.color} height={5} showGlow={false} />
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>{c.used} of {c.lessons} lessons used · {c.lessons - c.used} remaining this month</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12, color: 'var(--text-2)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="video" size={14} color="var(--text-3)" /><span className="mono" style={{ color: 'var(--brand-bright)' }}>meet.google.com/efx-{e.id}-lsn</span></span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><GCalMark size={14} />Synced to {MGMT.teacher.email}</span>
      </div>
    </Modal>
  );
}

function LessonModal({ slot, dates, onClose, onSave }) {
  const m = MGMT;
  const pool = m.students.filter((s) => s.status === 'active');
  const [sid, setSid] = useState(pool[0].id);
  const opts = activeContracts(sid);
  const [cid, setCid] = useState(opts[0]?.id || '');
  const [day, setDay] = useState(slot.day);
  const [start, setStart] = useState(slot.start);
  const [dur, setDur] = useState(slot.dur || 1);
  const [wa, setWa] = useState(true);
  useEffect(() => { setCid(activeContracts(sid)[0]?.id || ''); }, [sid]);
  const c = contractOf(cid);
  const ok = !!c;
  const save = () => {
    mgmtUpdate((mm) => {
      if (slot.link) mm.events = mm.events.filter((x) => x.id !== slot.link.id);
      mm.events.push({ id: 'e' + Date.now(), day: Number(day), start: Number(start), dur: Number(dur), sid, cid });
    });
    onSave(slot.link ? 'Event linked to student and service' : 'Lesson created · synced to Google Calendar');
  };
  const times = []; for (let h = CAL_START; h < CAL_END; h += 0.5) times.push(h);
  return (
    <Modal title={slot.link ? 'Link Google event' : 'New lesson'} sub={slot.link ? `“${slot.link.gtitle}”` : 'Every lesson is tied to a student and an active service'} onClose={onClose}
      footer={<><button onClick={onClose} style={ghostBtn}>Cancel</button><button onClick={save} disabled={!ok} style={{ ...primaryBtn, opacity: ok ? 1 : 0.45, cursor: ok ? 'pointer' : 'not-allowed' }}><Icon name="check" size={15} />{slot.link ? 'Link event' : 'Create & sync'}</button></>}>
      <Field label="Student"><select style={mgInput} value={sid} onChange={(e) => setSid(e.target.value)}>{pool.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.company}</option>)}</select></Field>
      <Field label="Active service">
        {opts.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {opts.map((o) => { const p = planOf(o.plan), on = o.id === cid; return (
              <button key={o.id} type="button" onClick={() => setCid(o.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, cursor: 'pointer', textAlign: 'left', background: on ? p.color + '1a' : 'var(--bg-input)', border: `1px solid ${on ? p.color : 'var(--border)'}` }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: 'var(--text-hi)' }}>{p.name}</span>
                <span className="mono" style={{ fontSize: 11, color: o.lessons - o.used <= 1 ? 'var(--warning)' : 'var(--text-3)' }}>{o.lessons - o.used} left this month</span>
              </button>
            ); })}
          </div>
        ) : <div style={{ fontSize: 12, color: 'var(--warning)', padding: '10px 12px', borderRadius: 9, border: '1px solid rgba(245,185,66,0.3)', background: 'rgba(245,185,66,0.07)' }}>This student has no active service. Create a contract first.</div>}
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 12 }}>
        <Field label="Day"><select style={mgInput} value={day} onChange={(e) => setDay(e.target.value)}>{dates.map((d, i) => <option key={i} value={i}>{DAYS[i]}, {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</option>)}</select></Field>
        <Field label="Start"><select className="mono" style={mgInput} value={start} onChange={(e) => setStart(e.target.value)}>{times.map((t) => <option key={t} value={t}>{fmtHour(t)}</option>)}</select></Field>
        <Field label="Duration"><select style={mgInput} value={dur} onChange={(e) => setDur(e.target.value)}>{[[0.5, '30 min'], [0.75, '45 min'], [1, '60 min'], [1.5, '90 min']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Toggle on={wa} onChange={setWa} label="Send WhatsApp reminder 1h before" />
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--text-3)' }}><GCalMark size={14} />Invite sent from {m.teacher.email}{m.teacher.gcal.meet ? ' with Google Meet link' : ''}</span>
      </div>
    </Modal>
  );
}

window.CalendarScreen = CalendarScreen;
