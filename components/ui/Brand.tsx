// Third-party marks used next to integrations.
export function LinkedInMark({ size = 18 }: { size?: number }) {
  return (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center rounded bg-linkedin font-extrabold text-white"
      style={{ width: size, height: size, fontSize: size * 0.58, fontFamily: 'Arial, sans-serif' }}>in</span>
  );
}

export function GCalMark({ size = 30 }: { size?: number }) {
  return (
    <span aria-hidden="true" className="relative flex shrink-0 items-end justify-center overflow-hidden bg-white"
      style={{ width: size, height: size, borderRadius: size * 0.23 }}>
      <span className="absolute inset-x-0 top-0 h-[30%] bg-[#4285f4]" />
      <span className="font-extrabold leading-none text-[#1a73e8]" style={{ fontSize: size * 0.42, marginBottom: size * 0.12, fontFamily: 'Arial, sans-serif' }}>31</span>
    </span>
  );
}

export function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-3.9H24v7.1h11.8c-.2 1.9-1.5 4.7-4.3 6.6l6.6 5.1C42 35.3 45 30.1 45 24z" />
      <path fill="#34A853" d="M24 46c5.8 0 10.6-1.9 14.1-5.2l-6.6-5.1c-1.8 1.2-4.2 2.1-7.5 2.1-5.7 0-10.6-3.9-12.3-9.1l-6.8 5.3C8.1 41 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.7 28.7c-.5-1.3-.7-2.7-.7-4.7s.3-3.4.7-4.7l-6.8-5.3C3.6 17 3 20.4 3 24s.6 7 1.9 10l6.8-5.3z" />
      <path fill="#EA4335" d="M24 10.8c3.2 0 5.4 1.4 6.6 2.5l5.9-5.7C32.9 4.1 28.1 2 24 2 15.4 2 8.1 7 4.9 14l6.8 5.3c1.7-5.2 6.6-8.5 12.3-8.5z" />
    </svg>
  );
}
