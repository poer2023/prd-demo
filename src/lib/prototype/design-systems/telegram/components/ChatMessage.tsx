/**
 * Telegram 设计系统 - ChatMessage 组件
 * 用于展示聊天消息
 */

'use client';

import { forwardRef } from 'react';

export interface ChatMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'incoming' | 'outgoing';
  avatar?: string;
  username?: string;
  time?: string;
  status?: 'sent' | 'delivered' | 'read';
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ variant = 'incoming', avatar, username, time, status, className = '', children, ...props }, ref) => {
    const isOutgoing = variant === 'outgoing';

    return (
      <div
        ref={ref}
        className={`
          flex gap-2
          ${isOutgoing ? 'flex-row-reverse' : 'flex-row'}
          ${className}
        `}
        {...props}
      >
        {/* Avatar (only for incoming) */}
        {!isOutgoing && avatar && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 overflow-hidden">
            <img src={avatar} alt={username} className="w-full h-full object-cover" />
          </div>
        )}
        {!isOutgoing && !avatar && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {username?.[0]?.toUpperCase() || '?'}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`
            max-w-[70%] px-3 py-2 rounded-2xl relative
            ${isOutgoing
              ? 'bg-[#EFFDDE] dark:bg-[#2B5278] rounded-br-sm'
              : 'bg-white dark:bg-[#182533] rounded-bl-sm shadow-sm'
            }
          `}
        >
          {/* Username (only for incoming) */}
          {!isOutgoing && username && (
            <div className="text-xs font-medium text-[#2AABEE] mb-1">
              {username}
            </div>
          )}

          {/* Message content */}
          <div className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
            {children}
          </div>

          {/* Time and status */}
          <div className={`
            flex items-center gap-1 mt-1
            ${isOutgoing ? 'justify-end' : 'justify-start'}
          `}>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {time || '12:00'}
            </span>
            {isOutgoing && status && (
              <span className="text-[10px]">
                {status === 'read' && '✓✓'}
                {status === 'delivered' && '✓✓'}
                {status === 'sent' && '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ChatMessage.displayName = 'ChatMessage';
