import { redirect } from 'next/navigation';
import { homeFor } from '@/components/shell/nav';
import { requireRole } from '@/lib/auth';

export default async function Home() {
  const profile = await requireRole();
  redirect(homeFor(profile.role));
}
