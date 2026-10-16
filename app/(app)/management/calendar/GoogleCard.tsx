import { ActionForm } from '@/components/ui/ActionForm';
import { GCalMark } from '@/components/ui/Brand';
import { Icon } from '@/components/ui/Icon';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { fmtRelative } from '@/lib/format';
import type { GoogleAccount } from '@/types/database';
import { disconnectGoogle, setAddMeet, syncGoogleNow } from './actions';

export function GoogleCard({ account, back, configured }: { account: Pick<GoogleAccount, 'email' | 'add_meet' | 'last_synced_at'> | null; back: string; configured: boolean }) {
  const hidden = <input type="hidden" name="back" value={back} />;
  return (
    <section aria-label="Google Calendar" className="card p-4">
      <div className="mb-3.5 flex items-center gap-3">
        <GCalMark />
        <div className="min-w-0">
          <h2 className="text-[13px] font-bold text-ink-hi">Google Calendar</h2>
          {account ? (
            <div className="flex items-center gap-1.5 text-[11px] text-positive"><span className="h-1.5 w-1.5 rounded-full bg-positive" />Connected</div>
          ) : (
            <div className="text-[11px] text-ink-3">Not connected</div>
          )}
        </div>
      </div>
      {account ? (
        <>
          <div className="mb-1 truncate text-[11.5px] text-ink-2">{account.email}</div>
          <div className="mb-3.5 text-[11px] text-ink-3">Two-way sync · last {account.last_synced_at ? fmtRelative(account.last_synced_at).toLowerCase() : 'never'}</div>
          <ActionForm action={setAddMeet} className="mb-3.5">
            {hidden}<input type="hidden" name="add_meet" value={String(!account.add_meet)} />
            <button className="flex items-center gap-2.5 text-left text-[12.5px] text-ink" role="switch" aria-checked={account.add_meet}>
              <span className={`relative h-[18px] w-8 shrink-0 rounded-full border border-line-strong transition-colors ${account.add_meet ? 'bg-brand' : 'bg-elevated'}`}>
                <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${account.add_meet ? 'left-[15px]' : 'left-0.5'}`} />
              </span>
              Add Google Meet links
            </button>
          </ActionForm>
          <ActionForm action={syncGoogleNow}>{hidden}<SubmitButton className="btn-ghost w-full" pendingLabel="Syncing…"><Icon name="refresh" size={14} className="text-ink-2" />Sync now</SubmitButton></ActionForm>
          <ActionForm action={disconnectGoogle} className="mt-2 text-center">{hidden}<SubmitButton className="text-[11px] font-semibold text-ink-3 hover:text-risk" pendingLabel="…">Disconnect</SubmitButton></ActionForm>
        </>
      ) : configured ? (
        <>
          <p className="mb-3 text-[11.5px] leading-normal text-ink-2">Connect to send invites with Meet links and keep lessons and your calendar in sync.</p>
          <a href="/api/google/connect" className="btn-ghost w-full">Connect Google Calendar</a>
        </>
      ) : (
        <p className="text-[11.5px] leading-normal text-ink-3">Google Calendar is not configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (see README).</p>
      )}
    </section>
  );
}
