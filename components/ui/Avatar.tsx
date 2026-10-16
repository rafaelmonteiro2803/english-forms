const GRADIENTS = [
  ['#3b82f6', '#1d4ed8'], ['#2dd4a7', '#0e9f7e'], ['#9b8cff', '#6d4ee0'],
  ['#e7b35c', '#c98a2c'], ['#2dd4d4', '#1295b6'], ['#f0524d', '#c0322e'],
] as const;

type Props = { name: string; size?: number; src?: string | null; status?: 'live' | 'away'; color?: string; ring?: boolean };

/** Photo, or initials on a gradient picked deterministically from the name. */
export function Avatar({ name, size = 36, src, status, color, ring }: Props) {
  const initials = name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const idx = [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % GRADIENTS.length;
  const [a, b] = color ? [color, color] : GRADIENTS[idx]!;
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <span
        className="flex h-full w-full items-center justify-center rounded-full bg-cover bg-center font-bold tracking-wide text-white"
        style={{
          fontSize: size * 0.38,
          backgroundImage: src ? `url(${src})` : `linear-gradient(135deg, ${a}, ${b})`,
          boxShadow: ring ? `0 0 0 2px #0e1422, 0 0 0 4px ${a}` : undefined,
        }}
        role="img"
        aria-label={name}
      >
        {!src && initials}
      </span>
      {status && (
        <span
          className={`absolute -bottom-px -right-px rounded-full border-2 border-panel ${status === 'live' ? 'bg-positive' : 'bg-warning'}`}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </span>
  );
}
