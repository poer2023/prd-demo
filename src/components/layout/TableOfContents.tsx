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
    <aside className="w-56 h-[calc(100vh-56px)] overflow-y-auto sticky top-14 py-6 pr-4">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">On this page</h3>
      <nav className="space-y-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block text-sm py-1 transition ${
              item.level > 1 ? "pl-3" : ""
            } ${
              activeId === item.id
                ? "text-[var(--accent-primary)] font-medium"
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
