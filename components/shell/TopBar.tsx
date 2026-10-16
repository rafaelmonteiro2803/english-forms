export function TopBar({ crumb, title, sub, right }: { crumb?: string; title: string; sub?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <header className="flex min-h-[62px] shrink-0 flex-wrap items-center gap-x-[18px] gap-y-2 border-b border-line bg-deep/70 px-[22px] py-2.5 backdrop-blur-md">
      <div className="min-w-0 flex-1">
        {crumb && <div className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-3">{crumb}</div>}
        <div className="flex flex-wrap items-center gap-x-3">
          <h1 className="text-lg font-bold tracking-tight text-ink-hi">{title}</h1>
          {sub && <span className="text-xs text-ink-2">{sub}</span>}
        </div>
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </header>
  );
}

export function ScreenScroll({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-y-auto p-4 sm:p-[22px]">{children}</div>;
}
