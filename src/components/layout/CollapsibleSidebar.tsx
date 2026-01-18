"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  slug: string;
  title: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

interface CollapsibleSidebarProps {
  items: NavItem[];
  position: "left" | "right";
  title?: string;
  lastUpdated?: string;
  defaultCollapsed?: boolean;
}

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div className={`flex items-center ${depth > 0 ? "ml-4" : ""}`}>
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-5 h-5 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--foreground)]"
          >
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <Link
          href={item.href}
          className={`flex-1 py-1.5 px-2 text-sm rounded transition ${
            isActive
              ? "bg-[#e8e8e8] dark:bg-[var(--nav-active)] text-[var(--foreground)]"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)]"
          } ${!hasChildren ? "ml-5" : ""}`}
        >
          <span className="flex items-center gap-2">
            {item.icon}
            {item.title}
          </span>
        </Link>
      </div>
      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {item.children!.map((child) => (
            <NavItemComponent key={child.slug} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CollapsibleSidebar({
  items,
  position,
  title,
  lastUpdated,
  defaultCollapsed = false
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // 折叠状态 - 显示小条
  if (isCollapsed) {
    return (
      <div
        className={`w-10 h-[calc(100vh-80px)] sticky top-20 flex flex-col items-center py-4 ${position === 'left' ? 'border-r' : 'border-l'} border-[var(--border-color)] bg-[var(--background)]`}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded-md"
          title={position === 'left' ? '展开导航' : '展开目录'}
        >
          <svg
            className={`w-4 h-4 ${position === 'left' ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  // 展开状态
  return (
    <aside
      className={`w-72 h-[calc(100vh-80px)] overflow-y-auto sticky top-20 py-6 ${
        position === 'left' ? 'pl-6 pr-4 border-r' : 'pl-4 pr-6 border-l'
      } border-[var(--border-color)] bg-[var(--background)]`}
    >
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h3 className="text-sm font-medium text-[var(--foreground)]">{title}</h3>
        )}
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--nav-hover)] rounded"
          title="收起"
        >
          <svg
            className={`w-4 h-4 ${position === 'left' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {lastUpdated && (
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Last updated: {lastUpdated}
        </p>
      )}

      <nav className="space-y-0.5">
        {items.map((item) => (
          <NavItemComponent key={item.slug} item={item} />
        ))}
      </nav>
    </aside>
  );
}
