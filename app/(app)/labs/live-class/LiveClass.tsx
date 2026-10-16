'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnalysisCard, CaptionText, Waveform } from '@/components/labs/parts';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { firstName } from '@/lib/format';
import { CLASS_MARKERS, CLASS_TRANSCRIPT } from '@/lib/labs/mock';

const TEACHER_COLOR = '#9b8cff';
const LIVE_SCORES = [['Grammar', 81], ['Vocabulary', 90], ['Pronunciation', 78], ['Listening', 89], ['Fluency', 84], ['Confidence', 86]] as const;

function VideoTile({ name, role, color, speaking, muted, isYou }: { name: string; role: string; color: string; speaking?: boolean; muted?: boolean; isYou?: boolean }) {
  return (
    <div className="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-lg"
      style={{ background: `radial-gradient(120% 100% at 50% 0%, ${color}22, transparent 55%), linear-gradient(160deg, #131c30, #0a0e1a)`, border: speaking ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.07)', boxShadow: speaking ? `0 0 28px -8px ${color}` : undefined }}>
      <div className="flex flex-col items-center gap-3"><Avatar name={name} size={92} color={color} /><span className="text-[13px] font-semibold text-ink-2">{role}</span></div>
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-[8px] bg-[rgba(8,11,20,0.72)] px-3 py-1.5 backdrop-blur">
        {muted ? <Icon name="mute" size={14} className="text-risk" /> : speaking ? <Waveform active color={color} /> : <Icon name="mic" size={14} className="text-ink-2" />}
        <span className="text-[12.5px] font-semibold text-ink-hi">{name}{isYou && ' (You)'}</span>
      </div>
      {speaking && <div className="absolute right-3 top-3 rounded-md border bg-[rgba(8,11,20,0.7)] px-2 py-0.5 text-[10px] font-bold" style={{ color, borderColor: color + '44' }}>Speaking</div>}
    </div>
  );
}

export function LiveClass({ teacher, student, self }: { teacher: string; student: string; self: 'teacher' | 'student' }) {
  const [t, setT] = useState(728);
  const [muted, setMuted] = useState(false);
  useEffect(() => { const i = setInterval(() => setT((x) => x + 1), 1000); return () => clearInterval(i); }, []);
  const clock = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-base">
      <div className="flex h-[54px] shrink-0 items-center gap-3.5 border-b border-line bg-deep px-[18px]">
        <span className="h-[7px] w-[7px] animate-ping rounded-full bg-risk" />
        <h1 className="text-[13px] font-bold text-ink-hi">Live Class · Business Communication</h1>
        <span className="pill text-[11px]"><Icon name="clock" size={12} /><span className="mono">{clock}</span></span>
        <span className="pill pill-brand hidden text-[11px] sm:inline-flex">1-on-1 · {teacher}</span>
        <span className="flex-1" />
        <span className="pill pill-pos hidden text-[11px] md:inline-flex"><Icon name="zap" size={12} />AI co-pilot (sample)</span>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-3.5 p-[18px]">
          <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2">
            <VideoTile name={teacher} role="Instructor" color={TEACHER_COLOR} speaking isYou={self === 'teacher'} />
            <VideoTile name={student} role="Student" color="#3b82f6" muted={self === 'student' && muted} isYou={self === 'student'} />
          </div>

          <section aria-label="Lesson timeline" className="card px-4 py-3.5">
            <div className="mb-3 flex justify-between">
              <h2 className="card-title"><Icon name="waveform" size={14} className="text-brand-bright" />Lesson Timeline</h2>
              <span className="text-[11px] text-ink-3">auto-marked (sample)</span>
            </div>
            <div className="relative h-10" aria-hidden="true">
              <div className="absolute inset-x-0 top-[18px] h-1 rounded-sm bg-input" />
              <div className="absolute left-0 top-[18px] h-1 w-[64%] rounded-sm bg-gradient-to-r from-brand-deep to-brand" />
              {CLASS_MARKERS.map((m) => (
                <span key={m.label} title={m.label} className="absolute top-[13px] h-[11px] w-[11px] -translate-x-1/2 rounded-full border-2 border-panel"
                  style={{ left: `${m.at}%`, background: m.color, boxShadow: `0 0 8px -1px ${m.color}` }} />
              ))}
              <span className="absolute left-[64%] top-3 h-4 w-[3px] -translate-x-1/2 rounded-sm bg-positive" />
            </div>
            <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              {CLASS_MARKERS.map((m) => <li key={m.label} className="flex items-center gap-1.5 text-[10.5px] text-ink-2"><span className="h-[7px] w-[7px] rounded-full" style={{ background: m.color }} />{m.label}</li>)}
            </ul>
          </section>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => setMuted((m) => !m)} aria-pressed={muted} aria-label={muted ? 'Unmute' : 'Mute'}
              className={`flex h-12 w-12 items-center justify-center rounded-[12px] border ${muted ? 'border-risk/40 bg-risk/10 text-risk' : 'border-line-strong bg-elevated text-ink-hi'}`}>
              <Icon name={muted ? 'mute' : 'mic'} size={19} />
            </button>
            {(['video', 'share', 'message'] as const).map((ic) => (
              <button key={ic} disabled aria-label={`${ic} (not available in preview)`} className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-line-strong bg-panel text-ink-2 disabled:opacity-60">
                <Icon name={ic} size={19} />
              </button>
            ))}
            <Link href="/reports" className="flex h-12 items-center gap-2 rounded-[12px] bg-risk px-[22px] text-[13px] font-bold text-white"><Icon name="hangup" size={17} />End class</Link>
          </div>
        </div>

        <aside aria-label="AI co-pilot" className="flex min-h-0 flex-col border-t border-line bg-deep lg:border-l lg:border-t-0">
          <div className="border-b border-line p-4">
            <h2 className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-2">Live AI Indicators</h2>
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-3">
              {LIVE_SCORES.map(([l, v]) => {
                const c = v >= 85 ? '#2dd4a7' : v >= 78 ? '#3b82f6' : '#e7b35c';
                return (
                  <div key={l}>
                    <div className="mb-1 flex justify-between"><span className="text-[11px] text-ink-2">{l}</span><span className="mono text-xs font-bold text-ink-hi">{v}</span></div>
                    <ProgressTrack value={v} color={c} height={5} glow={false} label={l} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between px-4 pb-1.5 pt-3.5">
            <h2 className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-2">Live Transcript</h2>
            <span className="text-[10px] text-ink-3">sample</span>
          </div>
          <ol className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-1.5">
            {CLASS_TRANSCRIPT.map((m, i) => {
              const who = m.self ? student : teacher;
              return (
                <li key={i} className="animate-fade-up">
                  <div className="mb-1 flex items-center gap-2">
                    <Avatar name={who} size={22} color={m.self ? '#3b82f6' : TEACHER_COLOR} />
                    <span className={`text-[11.5px] font-semibold ${m.self ? 'text-brand-bright' : 'text-ink-hi'}`}>{firstName(who)}</span>
                    <span className="mono ml-auto text-[10px] text-ink-3">{m.time}</span>
                  </div>
                  <div className="pl-[30px] text-[12.5px] [&_span]:text-[12.5px]"><CaptionText text={m.t} flag={m.flag} /></div>
                  {m.flag && <div className="ml-[30px] mt-1.5"><AnalysisCard flag={m.flag} /></div>}
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </div>
  );
}
