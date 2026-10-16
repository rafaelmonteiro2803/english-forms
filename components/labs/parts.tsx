import { Avatar } from '@/components/ui/Avatar';
import { Icon, type IconName } from '@/components/ui/Icon';
import type { Flag } from '@/lib/labs/mock';

export function Waveform({ active, color = '#fff' }: { active: boolean; color?: string }) {
  return (
    <span className="flex h-[18px] items-center gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`w-[3px] rounded-sm ${active ? 'animate-wave' : 'h-[20%] opacity-40'}`}
          style={{ background: color, animationDelay: `${i * 0.12}s`, height: active ? '100%' : undefined }} />
      ))}
    </span>
  );
}

export function ParticipantTile({ name, role, color, accent, speaking, self }: { name: string; role?: string; color: string; accent?: string; speaking: boolean; self?: boolean }) {
  return (
    <div className="relative flex min-h-[140px] items-center justify-center overflow-hidden rounded-lg transition-all"
      style={{
        background: self ? 'linear-gradient(160deg, #16203a, #0b1120)' : `radial-gradient(120% 100% at 30% 0%, ${color}22, transparent 60%), linear-gradient(160deg, #131c30, #0b1120)`,
        border: speaking ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.07)',
        boxShadow: speaking ? `0 0 0 3px ${color}33, 0 0 30px -6px ${color}88` : undefined,
      }}>
      <Avatar name={name} size={64} color={color} />
      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 rounded-[8px] bg-[rgba(8,11,20,0.72)] px-2.5 py-1 backdrop-blur">
        {speaking ? <Waveform active color={self ? '#60a5fa' : color} /> : <Icon name="mic" size={13} className="text-ink-2" />}
        <span className="text-xs font-semibold text-ink-hi">{self ? 'You' : name}</span>
        {role && !self && <span className="rounded-[5px] px-1.5 py-px text-[10.5px] font-semibold" style={{ color, background: color + '1f' }}>{role}</span>}
      </div>
      {!self && accent && <div className="absolute right-2.5 top-2.5 rounded-md border bg-[rgba(8,11,20,0.7)] px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.1em]" style={{ color, borderColor: color + '44' }}>AI · {accent}</div>}
      {self && <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md border border-positive/40 bg-[rgba(8,11,20,0.7)] px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.08em] text-positive"><span className="h-1.5 w-1.5 rounded-full bg-positive" />REC</div>}
    </div>
  );
}

const FLAG_STYLE: Record<Flag['type'], { color: string; icon: IconName; label: string }> = {
  grammar: { color: '#f0524d', icon: 'alert', label: 'Grammar' },
  filler: { color: '#f5b942', icon: 'message', label: 'Fluency' },
  win: { color: '#2dd4a7', icon: 'checkCircle', label: 'Strength' },
};

export function CaptionText({ text, flag }: { text: string; flag?: Flag }) {
  if (!flag) return <span className="text-[15px] font-medium leading-normal text-ink-hi">{text}</span>;
  const { color } = FLAG_STYLE[flag.type];
  const parts = text.split(new RegExp(`(${flag.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i'));
  return (
    <span className="text-[15px] font-medium leading-normal text-ink-hi">
      {parts.map((p, i) => p.toLowerCase() === flag.word.toLowerCase()
        ? <mark key={i} className="rounded-[3px] px-0.5 font-bold" style={{ background: color + '26', color, borderBottom: `2px solid ${color}` }}>{p}</mark>
        : <span key={i}>{p}</span>)}
    </span>
  );
}

export function AnalysisCard({ flag }: { flag: Flag }) {
  const s = FLAG_STYLE[flag.type];
  return (
    <div className="animate-fade-up rounded-[9px] border bg-panel px-3 py-2.5" style={{ borderColor: s.color + '33', borderLeft: `3px solid ${s.color}` }}>
      <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.05em]" style={{ color: s.color }}><Icon name={s.icon} size={13} />{s.label}</div>
      <div className="text-xs leading-snug text-ink">
        {flag.note}
        {flag.fix && <> · <span className="text-ink-3">“{flag.word}”</span> → <b className="text-positive">“{flag.fix}”</b></>}
        {flag.type === 'win' && <> · <span className="text-ink-3">“{flag.word}”</span></>}
      </div>
    </div>
  );
}

export function PreviewBanner() {
  return (
    <div role="note" className="flex items-center gap-2 border-b border-warning/25 bg-warning/[0.07] px-[18px] py-2 text-[11.5px] text-warning">
      <Icon name="alert" size={13} />Preview with sample data. Voice and AI scoring arrive in a later phase.
    </div>
  );
}
