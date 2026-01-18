"use client";

import { useCallback } from 'react';
import { useSplitStore } from '@/stores/splitStore';

interface DocRefBlockProps {
  docId: string;
  title: string;
  excerpt: string;
}

export function DocRefBlock({ docId, title, excerpt }: DocRefBlockProps) {
  const { openSplit } = useSplitStore();

  const handleClick = useCallback(() => {
    openSplit({
      mode: 'doc-focused',
      leftRatio: 0.15,
      leftContent: 'prototype',
      rightContent: 'doc',
      activeBlockId: docId,
    });
  }, [docId, openSplit]);

  // Truncate excerpt if too long
  const truncatedExcerpt = excerpt.length > 120
    ? excerpt.slice(0, 120) + '...'
    : excerpt;

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-4 rounded-xl border border-[var(--border-color)] bg-[var(--background-content)] hover:border-[var(--accent-primary)] hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-[var(--border-color)] flex items-center justify-center">
          <span className="text-lg" role="img" aria-label="document">
            📄
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[var(--foreground)] truncate mb-1 group-hover:text-[var(--accent-primary)] transition">
            {title}
          </h4>
          <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-2">
            {truncatedExcerpt}
          </p>
          <p className="text-sm text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition flex items-center gap-1">
            点击查看完整文档
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
