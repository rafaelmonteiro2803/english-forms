import { signOut } from '@/app/login/actions';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import type { Profile } from '@/types/database';
import { SidebarNav } from './SidebarNav';
import type { NavItem } from './nav';

const ROLE_LABEL = { admin: 'Administrator', teacher: 'Teacher', student: 'Student' } as const;

export function Sidebar({ profile, items }: { profile: Profile; items: NavItem[] }) {
  return (
    <aside className="flex shrink-0 flex-col border-b border-line bg-deep lg:h-full lg:w-[232px] lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between border-line px-4 py-3 lg:border-b lg:px-[18px] lg:pb-4 lg:pt-5">
        <Logo />
        <form action={signOut} className="lg:hidden">
          <button className="icon-btn text-ink-3" aria-label="Sign out"><Icon name="logout" size={15} /></button>
        </form>
      </div>
      <SidebarNav items={items} />
      <div className="hidden border-t border-line p-3 lg:block">
        <div className="flex items-center gap-2.5 rounded-[10px] border border-line bg-panel px-2.5 py-2">
          <Avatar name={profile.name || profile.email} src={profile.avatar_url} size={32} status="live" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-ink-hi">{profile.name || profile.email}</div>
            <div className="text-[10px] text-ink-3">{ROLE_LABEL[profile.role]}</div>
          </div>
          <form action={signOut}>
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 hover:bg-hover hover:text-ink" aria-label="Sign out" title="Sign out">
              <Icon name="logout" size={15} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
