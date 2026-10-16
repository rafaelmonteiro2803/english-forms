export function Logo({ size = 30, markOnly = false }: { size?: number; markOnly?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className="relative shrink-0 overflow-hidden rounded-[8px] bg-gradient-to-br from-brand to-brand-deep shadow-[0_4px_14px_-4px_rgba(59,130,246,0.6)]"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 30 30" className="absolute inset-0" aria-hidden="true">
          <path d="M6 21 L11 11 L15 18 L19 8 L24 19" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="19" cy="8" r="2" fill="#fff" />
        </svg>
      </span>
      {!markOnly && (
        <span className="leading-none">
          <span className="block text-[15px] font-extrabold tracking-tight text-ink-hi">English Forms</span>
          <span className="mt-0.5 block text-[9px] font-semibold tracking-[0.16em] text-ink-3">PERFORMANCE INTELLIGENCE</span>
        </span>
      )}
    </span>
  );
}
