import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <EmptyState icon="target" title="Page not found">
          <Link href="/" className="font-semibold text-brand-bright">Go to your home screen</Link>
        </EmptyState>
      </div>
    </main>
  );
}
