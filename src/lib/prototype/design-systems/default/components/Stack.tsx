/**
 * 默认设计系统 - Stack 组件
 */

'use client';

import { forwardRef } from 'react';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const directionStyles: Record<string, string> = {
  row: 'flex-row',
  column: 'flex-col',
};

const gapStyles: Record<string, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignStyles: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyStyles: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ direction = 'column', gap = 'md', align = 'stretch', justify = 'start', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          flex
          ${directionStyles[direction]}
          ${gapStyles[gap]}
          ${alignStyles[align]}
          ${justifyStyles[justify]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';
