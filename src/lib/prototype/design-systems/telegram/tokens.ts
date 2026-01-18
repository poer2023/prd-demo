/**
 * Telegram 设计系统 - Design Tokens
 * 基于 Telegram 的视觉风格
 */

import type { DesignTokens } from '../types';

export const telegramTokens: DesignTokens = {
  colors: {
    primary: '#2AABEE',      // Telegram 蓝
    secondary: '#229ED9',    // 深一点的蓝
    background: '#ffffff',
    surface: '#f0f0f0',
    text: '#000000',
    textMuted: '#707579',
    border: '#e0e0e0',
    success: '#31B545',      // Telegram 绿
    error: '#E53935',
    warning: '#FFA000',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '11px',
      sm: '13px',
      base: '14px',
      lg: '15px',
      xl: '16px',
      '2xl': '18px',
      '3xl': '22px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.4',
      relaxed: '1.6',
    },
  },
  radii: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.08)',
    md: '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.12)',
    xl: '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
};

// Dark mode tokens for Telegram
export const telegramTokensDark: DesignTokens = {
  ...telegramTokens,
  colors: {
    primary: '#2AABEE',
    secondary: '#229ED9',
    background: '#17212B',
    surface: '#232E3C',
    text: '#ffffff',
    textMuted: '#708499',
    border: '#344658',
    success: '#4FAE4E',
    error: '#E53935',
    warning: '#FFA000',
  },
};
