/**
 * 默认设计系统 - Design Tokens
 */

import type { DesignTokens } from '../types';

export const defaultTokens: DesignTokens = {
  colors: {
    primary: '#3b82f6',      // blue-500
    secondary: '#8b5cf6',    // violet-500
    background: '#ffffff',
    surface: '#f9fafb',      // gray-50
    text: '#111827',         // gray-900
    textMuted: '#6b7280',    // gray-500
    border: '#e5e7eb',       // gray-200
    success: '#10b981',      // emerald-500
    error: '#ef4444',        // red-500
    warning: '#f59e0b',      // amber-500
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  radii: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
};

// Dark mode tokens
export const defaultTokensDark: DesignTokens = {
  ...defaultTokens,
  colors: {
    primary: '#60a5fa',      // blue-400
    secondary: '#a78bfa',    // violet-400
    background: '#111827',   // gray-900
    surface: '#1f2937',      // gray-800
    text: '#f9fafb',         // gray-50
    textMuted: '#9ca3af',    // gray-400
    border: '#374151',       // gray-700
    success: '#34d399',      // emerald-400
    error: '#f87171',        // red-400
    warning: '#fbbf24',      // amber-400
  },
};
