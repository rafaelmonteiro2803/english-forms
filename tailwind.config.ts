import type { Config } from 'tailwindcss';

// Design tokens from design/prototype/tokens.css.
// ink-3 is lifted from #5a6680 to #7a87a1 so small text meets WCAG AA (4.5:1) on every surface.
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#080b14',
        deep: '#0a0e1a',
        panel: '#0e1422',
        elevated: '#131c30',
        input: '#0b1120',
        hover: '#16203a',
        line: { DEFAULT: 'rgba(255,255,255,0.07)', strong: 'rgba(255,255,255,0.13)', accent: 'rgba(59,130,246,0.35)' },
        ink: { hi: '#eef2fb', DEFAULT: '#c4cfe2', 2: '#8b98b0', 3: '#7a87a1', dim: '#3d475c' },
        brand: { DEFAULT: '#3b82f6', bright: '#60a5fa', deep: '#1d4ed8' },
        positive: { DEFAULT: '#2dd4a7', dim: '#1c8f72' },
        warning: '#f5b942',
        risk: '#f0524d',
        purple: '#9b8cff',
        cyan: '#2dd4d4',
        gold: '#e7b35c',
        whatsapp: '#4ade80',
        linkedin: '#0a66c2',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: { sm: '6px', DEFAULT: '10px', lg: '14px', xl: '20px' },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 12px 32px -16px rgba(0,0,0,0.8)',
        brand: '0 6px 18px -8px rgba(59,130,246,0.7)',
        pos: '0 0 18px -4px rgba(45,212,167,0.55)',
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        ping: {
          '0%': { boxShadow: '0 0 0 0 rgba(240,82,77,0.5)' },
          '70%': { boxShadow: '0 0 0 7px rgba(240,82,77,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(240,82,77,0)' },
        },
      },
      animation: { 'fade-up': 'fade-up .4s both', ping: 'ping 1.6s ease-out infinite' },
    },
  },
  plugins: [],
} satisfies Config;
