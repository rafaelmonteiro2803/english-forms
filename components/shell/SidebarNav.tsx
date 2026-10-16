'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import type { NavItem } from './nav';

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const groups = [...new Set(items.map((n) => n.group))];
  return (
    <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 py-2 lg:block lg:flex-1 lg:overflow-y-auto lg:px-3 lg:py-3.5">
      {groups.map((group) => (
        <div key={group} className="flex gap-1 lg:mb-3.5 lg:block">
          <div className="hidden px-2.5 pb-2 text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink-3 lg:block">{group}</div>
          {items.filter((n) => n.group === group).map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + '/');
            return (
              <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined}
                className={`relative mb-0.5 flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[8px] px-2.5 py-2 text-[13px] transition-colors ${
                  active ? 'bg-gradient-to-r from-brand/15 to-brand/[0.02] font-semibold text-ink-hi' : 'font-medium text-ink-2 hover:bg-white/[0.03]'}`}>
                {active && <span className="absolute bottom-2 left-0 top-2 hidden w-[3px] rounded bg-brand lg:block" />}
                <Icon name={n.icon} size={17} strokeWidth={active ? 2.3 : 2} className={active ? 'text-brand-bright' : 'text-ink-3'} />
                <span className="flex-1">{n.label}</span>
                {n.badge && <span className="hidden text-[8px] font-extrabold tracking-[0.08em] text-ink-3 lg:inline">{n.badge}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
