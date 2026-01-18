/**
 * 默认设计系统 - Text 组件
 */

'use client';

import { forwardRef, createElement } from 'react';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'success' | 'error' | 'warning';
}

const sizeStyles: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
};

const weightStyles: Record<string, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colorStyles: Record<string, string> = {
  default: 'text-gray-900 dark:text-gray-100',
  muted: 'text-gray-500 dark:text-gray-400',
  primary: 'text-blue-500 dark:text-blue-400',
  success: 'text-emerald-500 dark:text-emerald-400',
  error: 'text-red-500 dark:text-red-400',
  warning: 'text-amber-500 dark:text-amber-400',
};

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ as = 'p', size = 'base', weight = 'normal', color = 'default', className = '', children, ...props }, ref) => {
    return createElement(
      as,
      {
        ref,
        className: `
          ${sizeStyles[size]}
          ${weightStyles[weight]}
          ${colorStyles[color]}
          ${className}
        `,
        ...props,
      },
      children
    );
  }
);

Text.displayName = 'Text';
