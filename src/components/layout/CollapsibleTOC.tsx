"use client";

import { useState } from "react";

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface CollapsibleTOCProps {
  items: TOCItem[];
  activeId?: string;
  defaultCollapsed?: boolean;
}

export function CollapsibleTOC({
  items,
  activeId,
  defaultCollapsed = false
}: CollapsibleTOCProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  if (items.length === 0) return null;

  // 折叠状态
  if (isCollapsed) {
    return (
      <div className="w-10 h-[calc(100vh-80px)] sticky top-20 flex flex-col items-center py-4 border-l border-[var(--border-color)] bg-[var(--background)]">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded-md"
          title="展开目录"
        >
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  // 展开状态
  return (
    <aside className="w-64 h-[calc(100vh-80px)] overflow-y-auto sticky top-20 py-6 px-6 border-l border-[var(--border-color)] bg-[var(--background)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--foreground)]">On this page</h3>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded"
          title="收起"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block text-sm py-0.5 transition ${
              item.level > 1 ? "pl-3" : ""
            } ${
              activeId === item.id
                ? "text-[var(--foreground)] font-medium"
                : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}
