/**
 * Telegram 设计系统 - InlineKeyboard 组件
 * Bot 消息下方的内联键盘按钮
 */

'use client';

import { forwardRef } from 'react';

export interface InlineButton {
  id: string;
  text: string;
  url?: string;
  callbackData?: string;
}

export interface InlineKeyboardProps extends React.HTMLAttributes<HTMLDivElement> {
  buttons: InlineButton[][];  // 二维数组，每行一组按钮
  onButtonClick?: (button: InlineButton) => void;
}

export const InlineKeyboard = forwardRef<HTMLDivElement, InlineKeyboardProps>(
  ({ buttons, onButtonClick, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col gap-1 ${className}`}
        {...props}
      >
        {buttons.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((button) => (
              <button
                key={button.id}
                onClick={() => onButtonClick?.(button)}
                className={`
                  flex-1 px-3 py-2
                  text-sm font-medium text-[#2AABEE]
                  bg-white dark:bg-[#232E3C]
                  border border-gray-200 dark:border-[#344658]
                  rounded-lg
                  hover:bg-gray-50 dark:hover:bg-[#2B3A4A]
                  transition-colors duration-150
                  flex items-center justify-center gap-1
                `}
              >
                {button.url && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
                {button.text}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }
);

InlineKeyboard.displayName = 'InlineKeyboard';
