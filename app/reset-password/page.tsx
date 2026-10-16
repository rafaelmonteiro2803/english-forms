import type { Metadata } from 'next';
import { Logo } from '@/components/ui/Logo';
import { requireRole } from '@/lib/auth';
import { ResetForm } from './ResetForm';

export const metadata: Metadata = { title: 'New password' };

export default async function ResetPasswordPage() {
  await requireRole();
  return (
    <main className="flex min-h-screen items-center justify-center bg-base p-6">
      <div className="card w-full max-w-[400px] p-8">
        <div className="mb-6"><Logo /></div>
        <h1 className="mb-1 text-xl font-extrabold text-ink-hi">Choose a new password</h1>
        <p className="mb-6 text-[13px] text-ink-2">At least 8 characters.</p>
        <ResetForm />
      </div>
    </main>
  );
}
