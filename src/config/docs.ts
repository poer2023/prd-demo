// src/config/docs.ts
import { DocNavItem } from "@/types/doc";

export const docsRegistry: DocNavItem[] = [
  {
    slug: "login",
    title: "登录功能",
    href: "/docs/login",
    status: "approved",
    order: 1,
  },
];

export function getDocsNav(): DocNavItem[] {
  return docsRegistry.sort((a, b) => a.order - b.order);
}
