// src/types/doc.ts
export interface DocMeta {
  title: string;
  description?: string;
  icon?: string;
  order?: number;
  status?: "draft" | "review" | "approved";
}

export interface DocNavItem {
  slug: string;
  title: string;
  href: string;
  status?: DocMeta["status"];
  order: number;
}
