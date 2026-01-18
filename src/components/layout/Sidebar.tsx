"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  slug: string;
  title: string;
  href: string;
  children?: NavItem[];
}

interface SidebarProps {
  items: NavItem[];
  lastUpdated?: string;
}

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div className={`flex items-center group ${depth > 0 ? "ml-3" : ""}`}>
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-4 h-4 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--foreground)] mr-1"
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
          className={`flex-1 py-1.5 px-2 text-sm rounded-md transition ${
            isActive
              ? "nav-active"
              : "text-[var(--foreground)] hover:bg-[var(--background)]"
          } ${!hasChildren ? "ml-5" : ""}`}
        >
          {item.title}
        </Link>
      </div>
      {hasChildren && isExpanded && (
        <div className={`mt-0.5 ${depth > 0 ? "pl-2 border-l border-[var(--border-color)]" : ""}`}>
          {item.children!.map((child) => (
            <NavItemComponent key={child.slug} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ items, lastUpdated }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-[var(--border-color)] bg-[var(--background-secondary)] h-[calc(100vh-56px)] overflow-y-auto sticky top-14">
      <div className="p-4">
        {lastUpdated && (
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Last updated: {lastUpdated}
          </p>
        )}
        <nav className="space-y-0.5">
          {items.map((item) => (
            <NavItemComponent key={item.slug} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
