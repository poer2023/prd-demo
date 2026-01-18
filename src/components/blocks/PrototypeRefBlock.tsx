"use client";

import { useCallback } from 'react';
import { useSplitStore } from '@/stores/splitStore';

interface PrototypeRefBlockProps {
  prototypeId: string;
  title: string;
  thumbnail?: string;
}

export function PrototypeRefBlock({ prototypeId, title, thumbnail }: PrototypeRefBlockProps) {
  const { openSplit } = useSplitStore();

  const handleClick = useCallback(() => {
    openSplit({
      mode: 'prototype-focused',
      leftRatio: 0.15,
      leftContent: 'doc',
      rightContent: 'prototype',
      activeBlockId: prototypeId,
    });
  }, [prototypeId, openSplit]);

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-4 rounded-xl border border-[var(--border-color)] bg-[var(--background-content)] hover:border-[var(--accent-primary)] hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail or placeholder */}
        <div className="flex-shrink-0 w-20 h-14 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-[var(--border-color)] overflow-hidden flex items-center justify-center">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-8 h-8 text-blue-400 dark:text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base" role="img" aria-label="prototype">
              🎨
            </span>
            <h4 className="font-medium text-[var(--foreground)] truncate group-hover:text-[var(--accent-primary)] transition">
              {title}
            </h4>
          </div>
          <p className="text-sm text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition flex items-center gap-1">
            点击查看完整原型
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </p>
        </div>
      </div>
    </button>
  );
}
