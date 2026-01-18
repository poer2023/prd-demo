/**
 * Telegram 设计系统 - CommandButton 组件
 * Bot 命令按钮
 */

'use client';

import { forwardRef } from 'react';

export interface CommandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  command: string;
  description?: string;
}

export const CommandButton = forwardRef<HTMLButtonElement, CommandButtonProps>(
  ({ command, description, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          w-full px-4 py-3 text-left
          bg-white dark:bg-[#232E3C]
          hover:bg-gray-50 dark:hover:bg-[#2B3A4A]
          border-b border-gray-100 dark:border-[#344658]
          transition-colors duration-150
          ${className}
        `}
        {...props}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2AABEE] flex items-center justify-center">
            <span className="text-white text-sm">/</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#2AABEE]">
              /{command}
            </div>
            {description && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {description}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }
);

CommandButton.displayName = 'CommandButton';
