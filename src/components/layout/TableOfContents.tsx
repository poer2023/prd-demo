"use client";

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TOCItem[];
  activeId?: string;
}

export function TableOfContents({ items, activeId }: TableOfContentsProps) {
  if (items.length === 0) return null;

  return (
    <aside className="w-64 h-[calc(100vh-80px)] overflow-y-auto sticky top-20 py-6 px-6">
      <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">On this page</h3>
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
