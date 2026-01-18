// src/config/docs.ts
import { DocNavItem } from "@/types/doc";

export interface NavItem {
  slug: string;
  title: string;
  href: string;
  children?: NavItem[];
}

// 树形导航结构
export const docsNavTree: NavItem[] = [
  {
    slug: "login",
    title: "登录功能",
    href: "/docs/login",
    children: [
      { slug: "login-v1", title: "V1 - 验证码在下方", href: "/docs/login#version-v1" },
      { slug: "login-v2", title: "V2 - 验证码内嵌", href: "/docs/login#version-v2" },
    ],
  },
  {
    slug: "register",
    title: "注册流程",
    href: "/docs/register",
  },
  {
    slug: "profile",
    title: "个人中心",
    href: "/docs/profile",
  },
];

// 兼容旧的扁平结构
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

export function getDocsNavTree(): NavItem[] {
  return docsNavTree;
}
