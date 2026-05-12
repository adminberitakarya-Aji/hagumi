// ─── Hagumi Design System Tokens ───
// Single source of truth for all visual design values

export const colors = {
  primary: {
    pink: '#FF6B9D',
    pinkLight: '#FF8FB8',
    pinkDark: '#E55A8A',
    purple: '#C084FC',
    blue: '#60A5FA',
  },
  semantic: {
    success: '#34D399',
    successBg: 'rgba(52, 211, 153, 0.15)',
    warning: '#FBBF24',
    warningBg: 'rgba(251, 191, 36, 0.15)',
    danger: '#F87171',
    dangerBg: 'rgba(248, 113, 113, 0.15)',
    info: '#60A5FA',
    infoBg: 'rgba(96, 165, 250, 0.15)',
  },
  glass: {
    light: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.12)',
    heavy: 'rgba(255, 255, 255, 0.2)',
    border: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(255, 255, 255, 0.15)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    disabled: 'rgba(255, 255, 255, 0.25)',
  },
  bg: {
    page: '#0a0a1a',
    card: 'rgba(255, 255, 255, 0.05)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  // Stat bar colors
  stat: {
    hunger: '#FB923C',
    mood: '#FF6B9D',
    energy: '#FACC15',
    health: '#34D399',
    growth: '#C084FC',
  },
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
} as const

export const typography = {
  fontFamily: {
    primary: "'Nunito', system-ui, -apple-system, sans-serif",
    display: "'Fredoka One', 'Nunito', cursive",
    japanese: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  fontSize: {
    xs: '10px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
    '8xl': '96px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const

export const shadows = {
  glass: '0 8px 32px rgba(0, 0, 0, 0.12)',
  glassStrong: '0 8px 48px rgba(0, 0, 0, 0.25)',
  glow: {
    pink: '0 0 20px rgba(255, 107, 157, 0.4)',
    blue: '0 0 20px rgba(96, 165, 250, 0.4)',
    purple: '0 0 20px rgba(192, 132, 252, 0.4)',
    gold: '0 0 20px rgba(251, 191, 36, 0.4)',
  },
  button: {
    pink: '0 8px 24px rgba(255, 107, 157, 0.35)',
    glass: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
} as const

export const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '800ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  keyframes: {
    idleBounce: 'idle-bounce 2s ease-in-out infinite',
    glowPulse: 'glow-pulse 2s ease-in-out infinite',
    fadeIn: 'fadeIn 0.5s ease-out',
    slideUp: 'slideUp 0.3s ease-out',
    shake: 'shake 0.5s ease-in-out',
    float: 'float 3s ease-in-out infinite',
    sparkle: 'sparkle 1.5s ease-in-out infinite',
  },
} as const

// ─── CSS Class Generator ─────────────────────────────

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ─── Theme Tokens (for CSS variables) ─────────────────

export const THEME_VARIABLES = {
  '--color-primary': colors.primary.pink,
  '--color-primary-light': colors.primary.pinkLight,
  '--color-primary-dark': colors.primary.pinkDark,
  '--color-bg-page': colors.bg.page,
  '--color-glass': colors.glass.light,
  '--color-glass-border': colors.glass.border,
  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--font-primary': typography.fontFamily.primary,
  '--font-display': typography.fontFamily.display,
  '--shadow-glass': shadows.glass,
  '--radius-card': borderRadius.lg,
  '--radius-button': borderRadius.full,
} as const