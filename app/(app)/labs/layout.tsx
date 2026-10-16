import { notFound } from 'next/navigation';
import { aiLabsEnabled } from '@/lib/flags';

/** AI Simulator and Live Class are hidden unless FEATURE_AI_LABS=true. */
export default function LabsLayout({ children }: { children: React.ReactNode }) {
  if (!aiLabsEnabled()) notFound();
  return children;
}
