/**
 * Talvorax Design System — Extracted from web application screenshots
 * ALL hex values match the production website exactly.
 */

export const colors = {
  // Primary brand
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10B981',  // PRIMARY ACTION
    600: '#059669',  // Hover/press state
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Secondary
  indigo: {
    400: '#818cf8',
    500: '#6366f1',  // SECONDARY ACTION
    600: '#4f46e5',
  },
  violet: {
    500: '#8b5cf6',  // Gradient accent
  },

  // Backgrounds
  slate: {
    50: '#f8fafc',   // Light screen background
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',  // Muted text
    600: '#475569',
    700: '#334155',
    800: '#1E293B',  // Body text
    900: '#0f172a',  // Heading text
    950: '#020617',  // Dark auth background
  },

  // Status
  success: '#10B981',
  warning: '#f59e0b',
  error: '#ef4444',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  deepBlack: '#030303',

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',

  // Transparent
  transparent: 'transparent',
} as const;

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extraBold: 'Inter_800ExtraBold',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
    uppercase: 1.5,  // For uppercase labels
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const borderRadius = {
  sm: 6,
  md: 8,
  base: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;
export default theme;
