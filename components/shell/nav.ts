import type { IconName } from '@/components/ui/Icon';
import type { UserRole } from '@/types/database';

export type NavItem = { href: string; label: string; icon: IconName; group: string; badge?: string };

const ALL: (NavItem & { roles: UserRole[]; labs?: boolean })[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard', group: 'Learn', roles: ['student', 'teacher', 'admin'] },
  { href: '/labs/simulator', label: 'AI Simulator', icon: 'mic', group: 'Learn', badge: 'PREVIEW', roles: ['student', 'teacher', 'admin'], labs: true },
  { href: '/labs/live-class', label: 'Live Class', icon: 'video', group: 'Learn', roles: ['student', 'teacher', 'admin'], labs: true },
  { href: '/reports', label: 'Lesson Report', icon: 'report', group: 'Insights', roles: ['student', 'teacher', 'admin'] },
  { href: '/proficiency', label: 'Proficiency', icon: 'trending', group: 'Insights', roles: ['student', 'teacher', 'admin'] },
  { href: '/teacher', label: 'Teacher View', icon: 'users', group: 'Manage', roles: ['teacher', 'admin'] },
  { href: '/admin', label: 'Admin', icon: 'building', group: 'Manage', roles: ['admin'] },
  { href: '/management/students', label: 'Students', icon: 'users', group: 'Management', roles: ['teacher', 'admin'] },
  { href: '/management/services', label: 'Services', icon: 'file', group: 'Management', roles: ['teacher', 'admin'] },
  { href: '/management/calendar', label: 'Calendar', icon: 'calendar', group: 'Management', roles: ['teacher', 'admin'] },
];

export function navFor(role: UserRole, labs: boolean): NavItem[] {
  return ALL.filter((n) => n.roles.includes(role) && (!n.labs || labs)).map(({ href, label, icon, group, badge }) => ({ href, label, icon, group, badge }));
}

export function homeFor(role: UserRole) {
  return role === 'student' ? '/dashboard' : role === 'teacher' ? '/management/students' : '/admin';
}
