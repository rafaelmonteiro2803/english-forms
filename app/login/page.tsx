import type { Metadata } from 'next';
import { Avatar } from '@/components/ui/Avatar';
import { GoogleLogo, LinkedInMark } from '@/components/ui/Brand';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { Sparkline } from '@/components/ui/Sparkline';
import { safeNext } from '@/lib/http';
import { signInWithProvider } from './actions';
import { ForgotForm, LoginForm } from './LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

const ERRORS: Record<string, string> = {
  provider: 'That sign-in provider is not available right now.',
  callback: 'The sign-in link expired or was already used. Please try again.',
};

const HERO_AVATARS = [['Richard Hale', '#3b82f6'], ['Sofia Lindqvist', '#2dd4a7'], ['Daniel Okonkwo', '#9b8cff'], ['Yuki Tanaka', '#e7b35c'], ['Helena Ross', '#2dd4d4']] as const;

const HERO_BG: React.CSSProperties = {
  backgroundImage: [
    'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
    'linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
    'radial-gradient(120% 90% at 80% 10%, rgba(59,130,246,0.18), transparent 55%)',
    'radial-gradient(100% 80% at 20% 100%, rgba(45,212,167,0.12), transparent 55%)',
  ].join(', '),
  backgroundSize: '28px 28px, 28px 28px, 100% 100%, 100% 100%',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const forgot = sp.forgot === '1';
  const error = sp.error ? ERRORS[sp.error] ?? ERRORS.callback : null;

  return (
    <main className="grid min-h-screen bg-base lg:grid-cols-[1fr_1.05fr]">
      <section className="relative flex flex-col justify-center px-6 py-24 sm:px-[clamp(40px,7vw,100px)]">
        <div className="absolute left-6 top-9 sm:left-[clamp(40px,7vw,100px)]"><Logo /></div>
        <div className="w-full max-w-[380px] animate-fade-up">
          <div className="pill pill-brand mb-5"><span className="h-1.5 w-1.5 rounded-full bg-brand" />Enterprise Edition</div>
          <h1 className="mb-2 text-[30px] font-extrabold leading-[1.1] tracking-tight text-ink-hi">
            {forgot ? 'Reset your password' : <>Sign in to your<br />performance terminal</>}
          </h1>
          <p className="mb-7 text-[13.5px] leading-normal text-ink-2">
            {forgot
              ? 'Enter your work email and we will send you a link to choose a new password.'
              : 'Track proficiency, review every lesson and turn every conversation into measurable progress.'}
          </p>

          {error && <p role="alert" className="mb-4 rounded-[10px] border border-risk/30 bg-risk/10 px-3.5 py-2.5 text-[12.5px] text-risk">{error}</p>}

          {forgot ? <ForgotForm /> : (
            <>
              <LoginForm next={next} />
              <div className="my-5 flex items-center gap-3" aria-hidden="true">
                <div className="h-px flex-1 bg-line" /><span className="text-[11px] font-semibold text-ink-3">OR CONTINUE WITH</span><div className="h-px flex-1 bg-line" />
              </div>
              <form action={signInWithProvider} className="grid grid-cols-2 gap-3">
                <input type="hidden" name="next" value={next} />
                <button name="provider" value="google" className="btn-ghost h-11 rounded-[10px] text-[13px] text-ink-hi"><GoogleLogo />Google</button>
                <button name="provider" value="linkedin_oidc" className="btn-ghost h-11 rounded-[10px] text-[13px] text-ink-hi"><LinkedInMark size={16} />LinkedIn</button>
              </form>
            </>
          )}
        </div>
      </section>

      <section aria-hidden="true" className="relative hidden overflow-hidden border-l border-line bg-deep lg:block" style={HERO_BG}>
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <div className="flex justify-end">
            <div className="card w-[250px] animate-fade-up p-4 [animation-delay:.2s]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.1em] text-ink-2">PERFORMANCE SCORE</span>
                <span className="pill pill-pos px-1.5 py-px"><Icon name="arrowUp" size={10} />+208</span>
              </div>
              <div className="mb-2 flex items-baseline gap-1.5">
                <span className="mono text-[34px] font-bold text-ink-hi">820</span>
                <span className="text-[11px] text-ink-3">/ 1000 · B2→C1</span>
              </div>
              <Sparkline data={[612, 628, 641, 655, 649, 670, 688, 705, 728, 754, 788, 820]} width={216} height={56} />
            </div>
          </div>
          <div className="max-w-[440px]">
            <div className="mb-4 flex gap-1.5">{HERO_AVATARS.map(([n, c]) => <Avatar key={n} name={n} size={38} color={c} ring />)}</div>
            <h2 className="mb-3.5 text-[34px] font-extrabold leading-[1.12] tracking-tight text-ink-hi">
              Transform every<br />conversation into<br /><span className="text-gradient">measurable evolution.</span>
            </h2>
            <p className="text-sm leading-relaxed text-ink-2">
              Lessons, contracts and assessments in one place, with scored progress on fluency, grammar and business communication.
            </p>
          </div>
          <div className="flex gap-7">
            {[['CEFR', 'Proficiency ladder'], ['6 skills', 'Scored every lesson'], ['2-way', 'Google Calendar sync']].map(([v, l]) => (
              <div key={l}><div className="mono text-xl font-bold text-ink-hi">{v}</div><div className="mt-0.5 text-[11px] text-ink-3">{l}</div></div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
