import { Icon, type IconName } from './Icon';

export function EmptyState({ icon = 'layers', title, children, className = '' }: { icon?: IconName; title: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`grid-bg flex flex-col items-center justify-center gap-3 px-6 py-12 text-center text-ink-3 ${className}`}>
      <Icon name={icon} size={30} className="text-ink-dim" />
      <div className="text-sm font-semibold text-ink-2">{title}</div>
      {children && <div className="max-w-sm text-xs leading-relaxed">{children}</div>}
    </div>
  );
}
