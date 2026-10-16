import type { Metadata } from 'next';
import Link from 'next/link';
import { PreviewBanner } from '@/components/labs/parts';
import { ScreenScroll, TopBar } from '@/components/shell/TopBar';
import { Avatar } from '@/components/ui/Avatar';
import { Icon, type IconName } from '@/components/ui/Icon';
import { requireRole } from '@/lib/auth';
import { AI_PARTICIPANTS, SCENARIOS } from '@/lib/labs/mock';
import { param } from '@/lib/url';
import { LiveMeeting } from './LiveMeeting';

export const metadata: Metadata = { title: 'AI Simulator' };

const DIFF_COLOR = { Intermediate: 'text-brand-bright', Advanced: 'text-warning', Expert: 'text-risk' } as const;

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function SimulatorPage({ searchParams }: { searchParams: SP }) {
  const profile = await requireRole();
  const sp = await searchParams;
  const scenario = SCENARIOS.find((s) => s.id === param(sp.scenario)) ?? SCENARIOS[3]!;

  if (param(sp.live) === '1') {
    return <><PreviewBanner /><LiveMeeting scenarioTitle={scenario.title} userName={profile.name || 'You'} lobbyHref={`/labs/simulator?scenario=${scenario.id}`} /></>;
  }

  return (
    <>
      <TopBar crumb="AI Simulator" title="Meeting Simulator" sub="Rehearse high-stakes conversations with AI executives"
        right={<span className="pill pill-brand"><Icon name="zap" size={12} />{SCENARIOS.length} scenarios</span>} />
      <PreviewBanner />
      <ScreenScroll>
        <div className="grid items-start gap-4 xl:grid-cols-[1fr_360px]">
          <section aria-label="Scenarios">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-2">Select a scenario</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SCENARIOS.map((sc) => {
                const sel = sc.id === scenario.id;
                return (
                  <li key={sc.id}>
                    <Link href={`/labs/simulator?scenario=${sc.id}`} scroll={false} aria-current={sel ? 'true' : undefined}
                      className={`block h-full rounded-[12px] border p-4 transition ${sel ? 'border-line-accent bg-gradient-to-br from-brand/15 to-panel shadow-[0_0_0_1px_rgba(59,130,246,0.4),0_8px_30px_-8px_rgba(59,130,246,0.45)]' : 'border-line bg-panel hover:bg-hover'}`}>
                      <div className="mb-3 flex items-start justify-between">
                        <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] ${sel ? 'bg-brand text-white' : 'bg-elevated text-ink-2'}`}><Icon name={sc.icon} size={18} /></span>
                        {sel && <Icon name="checkCircle" size={18} className="text-brand-bright" />}
                      </div>
                      <div className="mb-1 text-[13.5px] font-bold text-ink-hi">{sc.title}</div>
                      <div className="mb-3 min-h-8 text-[11.5px] leading-snug text-ink-2">{sc.desc}</div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${DIFF_COLOR[sc.diff]}`}>{sc.diff}</span>
                        <span className="h-[3px] w-[3px] rounded-full bg-ink-dim" />
                        <span className="mono text-[10.5px] text-ink-3">{sc.mins} min</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-label="Session setup" className="card xl:sticky xl:top-0">
            <div className="card-h"><h2 className="card-title"><Icon name="settings" size={14} className="text-brand-bright" />Session Setup</h2></div>
            <div className="p-[18px]">
              <div className="mb-1 text-base font-extrabold text-ink-hi">{scenario.title}</div>
              <p className="mb-4 text-xs text-ink-2">{scenario.desc}</p>
              <h3 className="label-caps mb-2.5">AI Participants</h3>
              <ul className="mb-[18px] flex flex-col gap-2">
                {AI_PARTICIPANTS.map((a) => (
                  <li key={a.name} className="flex items-center gap-2.5">
                    <Avatar name={a.name} size={30} color={a.color} />
                    <span><span className="block text-xs font-semibold text-ink-hi">{a.name}</span><span className="text-[10.5px] text-ink-3">{a.role} · {a.accent} accent</span></span>
                  </li>
                ))}
              </ul>
              <dl className="mb-[18px] grid grid-cols-2 gap-2.5">
                {([['clock', 'Duration', `${scenario.mins} min`], ['target', 'Difficulty', scenario.diff], ['globe', 'Focus', scenario.tag], ['mic', 'Mode', 'Voice + live']] as [IconName, string, string][]).map(([ic, l, v]) => (
                  <div key={l} className="rounded-[9px] border border-line bg-input px-3 py-2.5">
                    <dt className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-3"><Icon name={ic} size={12} />{l}</dt>
                    <dd className="text-[13px] font-bold text-ink-hi">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link href={`/labs/simulator?scenario=${scenario.id}&live=1`} className="btn-primary h-[46px] w-full text-sm"><Icon name="play" size={16} />Join Meeting</Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[10.5px] text-ink-3"><Icon name="mic" size={12} />Sample conversation · no microphone used yet</p>
            </div>
          </section>
        </div>
      </ScreenScroll>
    </>
  );
}
