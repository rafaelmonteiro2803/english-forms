import { Sidebar } from '@/components/shell/Sidebar';
import { navFor } from '@/components/shell/nav';
import { Toaster } from '@/components/ui/Toast';
import { requireRole } from '@/lib/auth';
import { aiLabsEnabled } from '@/lib/flags';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole();
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden lg:flex-row">
      <Sidebar profile={profile} items={navFor(profile.role, aiLabsEnabled())} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
      <Toaster />
    </div>
  );
}
