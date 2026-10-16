'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Gauge } from '@/components/charts/Gauge';
import { AnalysisCard, CaptionText, ParticipantTile, Waveform } from '@/components/labs/parts';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { ProgressTrack } from '@/components/ui/ProgressTrack';
import { AI_PARTICIPANTS, SIM_SCRIPT } from '@/lib/labs/mock';

const clamp = (v: number) => Math.max(40, Math.min(99, Math.round(v)));

/** Plays the sample script with simulated live scoring. */
export function LiveMeeting({ scenarioTitle, userName, lobbyHref }: { scenarioTitle: string; userName: string; lobbyHref: string }) {
  const [step, setStep] = useState(-1);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [conf, setConf] = useState(72);
  const [scores, setScores] = useState({ grammar: 79, pronunciation: 78, vocabulary: 90, fluency: 82 });
  const feed = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setInterval(() => setElapsed((e) => e + 1), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const next = SIM_SCRIPT[step + 1];
    if (!next) return;
    const t = setTimeout(() => {
      const has = (type: string) => next.flags?.some((f) => f.type === type);
      setStep(step + 1);
      setConf((c) => Math.max(60, Math.min(94, c + (has('win') ? 4 : has('grammar') ? -3 : 2))));
      setScores((s) => ({
        grammar: clamp(s.grammar + (has('grammar') ? -2 : 1)),
        pronunciation: clamp(s.pronunciation + (step % 2 ? 1 : 0)),
        vocabulary: clamp(s.vocabulary + (has('win') ? 2 : 0)),
        fluency: clamp(s.fluency + (has('filler') ? -1 : 1)),
      }));
    }, next.spk === 'you' ? 4200 : 3400);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => { feed.current?.scrollTo({ top: feed.current.scrollHeight }); }, [step]);

  const line = step >= 0 ? SIM_SCRIPT[step] : undefined;
  const ended = step >= SIM_SCRIPT.length - 1;
  const speaker = line ? (line.spk === 'you' ? { name: userName, role: 'You', color: '#3b82f6' } : AI_PARTICIPANTS[line.spk]!) : null;
  const clock = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  const flags = SIM_SCRIPT.slice(0, step + 1).flatMap((l) => l.flags ?? []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-base">
      <div className="flex h-[54px] shrink-0 items-center gap-3.5 border-b border-line bg-deep px-[18px]">
        <span className="h-[7px] w-[7px] animate-ping rounded-full bg-risk" />
        <h1 className="text-[13px] font-bold text-ink-hi">{scenarioTitle}</h1>
        <span className="pill pill-neg text-[10px]">LIVE</span>
        <span className="pill text-[11px]"><Icon name="clock" size={12} /><span className="mono">{clock}</span></span>
        <span className="pill hidden text-[11px] sm:inline-flex"><Icon name="users" size={12} />6 participants</span>
        <span className="flex-1" />
        <span className="pill pill-brand hidden text-[11px] md:inline-flex"><Icon name="zap" size={12} />Real-time scoring (sample)</span>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_348px]">
        <div className="flex min-w-0 flex-col gap-3.5 p-[18px]">
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 md:grid-cols-3">
            {AI_PARTICIPANTS.map((p, i) => <ParticipantTile key={p.name} {...p} speaking={line?.spk === i} />)}
            <ParticipantTile name={userName} color="#3b82f6" self speaking={line?.spk === 'you' && !muted} />
          </div>

          <div className="flex min-h-16 items-center gap-3.5 rounded-[12px] border border-line bg-gradient-to-b from-panel to-deep px-4 py-3" aria-live="polite">
            {line && speaker ? (
              <>
                <div className="flex min-w-16 flex-col items-center gap-1">
                  <Avatar name={speaker.name} size={30} color={speaker.color} />
                  <span className="text-[10px] font-semibold text-ink-3">{speaker.role}</span>
                </div>
                <CaptionText text={line.txt} flag={line.flags?.[0]} />
              </>
            ) : <span className="flex items-center gap-2 text-[13px] text-ink-3"><Waveform active color="#3b82f6" />Connecting to AI participants…</span>}
          </div>

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
            <Link href={ended ? '/reports' : lobbyHref} className="flex h-12 items-center gap-2 rounded-[12px] bg-risk px-[22px] text-[13px] font-bold text-white shadow-[0_8px_22px_-8px_rgba(240,82,77,0.7)]">
              <Icon name="hangup" size={17} />{ended ? 'End & view reports' : 'Leave'}
            </Link>
          </div>
        </div>

        <aside aria-label="Live analysis" className="flex min-h-0 flex-col border-t border-line bg-deep lg:border-l lg:border-t-0">
          <div className="border-b border-line p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-2">Confidence Index</span>
              <span className="pill pill-pos px-2 py-0 text-[10px]">{conf >= 75 ? 'Strong' : 'Building'}</span>
            </div>
            <div className="flex items-center gap-3.5">
              <Gauge value={conf} size={84} stroke={8} color={conf >= 78 ? '#2dd4a7' : conf >= 65 ? '#e7b35c' : '#f0524d'} />
              <div className="grid flex-1 grid-cols-2 gap-2">
                {([['Grammar', scores.grammar, '#3b82f6'], ['Pronunc.', scores.pronunciation, '#e7b35c'], ['Vocab', scores.vocabulary, '#2dd4a7'], ['Fluency', scores.fluency, '#2dd4d4']] as const).map(([l, v, c]) => (
                  <div key={l}>
                    <div className="mb-0.5 flex justify-between"><span className="text-[10px] text-ink-3">{l}</span><span className="mono text-[10.5px] font-semibold text-ink-hi">{v}</span></div>
                    <ProgressTrack value={v} color={c} height={4} glow={false} label={l} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
            <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-2">Live Analysis</span>
            <span className="text-[10px] text-ink-3">sample feed</span>
          </div>
          <div ref={feed} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4">
            {flags.map((f, i) => <AnalysisCard key={i} flag={f} />)}
            {!flags.length && <p className="py-6 text-center text-xs text-ink-3">Insights appear as you speak…</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
